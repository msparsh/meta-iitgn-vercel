import os
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from supabase import create_client, Client
from abc import ABC, abstractmethod

# -------------------------------------------------------------------------
# 1. PYDANTIC SCHEMAS (API Contracts)
# -------------------------------------------------------------------------

class UserCreate(BaseModel):
    name: str
    email: str
    avatar_url: Optional[str] = None

class DraftSubmit(BaseModel):
    # If page_id is None, this is a proposal for a BRAND NEW page.
    # If page_id is provided, this is an EDIT to an existing page.
    page_id: Optional[int] = None
    title: str
    content: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    editor_id: int
    # base_version is required if editing an existing page for optimistic locking.
    base_version: Optional[int] = None

class ReviewAction(BaseModel):
    reviewer_id: int
    action: str = Field(..., pattern="^(approve|reject)$")
    rejection_reason: Optional[str] = None

# -------------------------------------------------------------------------
# 2. REPOSITORY INTERFACE (The Abstraction Layer)
# -------------------------------------------------------------------------

class DatabaseRepository(ABC):
    @abstractmethod
    def create_user(self, user: UserCreate) -> Dict[str, Any]:
        pass

    @abstractmethod
    def get_live_page(self, slug: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    def submit_draft(self, draft: DraftSubmit) -> Dict[str, Any]:
        pass

    @abstractmethod
    def get_pending_drafts(self, page_id: Optional[int] = None) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def process_review(self, pending_id: int, review: ReviewAction) -> Dict[str, Any]:
        pass

# -------------------------------------------------------------------------
# 3. SUPABASE IMPLEMENTATION (The Concrete Data Layer)
# -------------------------------------------------------------------------

class SupabaseRepo(DatabaseRepository):
    def __init__(self):
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        if not url or not key:
            raise ValueError("Supabase credentials are missing from environment.")
        self.client: Client = create_client(url, key)

    def create_user(self, user: UserCreate) -> Dict[str, Any]:
        response = self.client.table("users").insert({
            "name": user.name,
            "role": "Bronze",
            "email": user.email,
            "avatar_url": user.avatar_url
        }).execute()
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to create user")
        return response.data[0]

    def get_live_page(self, slug: str) -> Dict[str, Any]:
        response = self.client.table("live_pages") \
            .select("*, users!original_author_id(name)") \
            .eq("slug", slug) \
            .is_("deleted_at", "null") \
            .execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Page not found or deleted")
        return response.data[0]

    def submit_draft(self, draft: DraftSubmit) -> Dict[str, Any]:
        # If it's an edit to an existing page, check the optimistic lock
        if draft.page_id:
            if draft.base_version is None:
                raise HTTPException(status_code=400, detail="base_version is required for edits.")

            current = self.client.table("live_pages").select("version").eq("page_id", draft.page_id).execute()
            if not current.data or current.data[0]["version"] != draft.base_version:
                 raise HTTPException(status_code=409, detail="Version conflict. Page has been updated by someone else.")

        # Insert into pending_pages (status defaults to 'draft' or 'in_review')
        response = self.client.table("pending_pages").insert({
            "page_id": draft.page_id, # Will be null for brand new pages
            "title": draft.title,
            "content": draft.content,
            "metadata": draft.metadata,
            "status": "in_review",
            "editor_id": draft.editor_id,
            "version": draft.base_version
        }).execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to submit draft.")
        return response.data[0]

    def get_pending_drafts(self, page_id: Optional[int] = None) -> List[Dict[str, Any]]:
        query = self.client.table("pending_pages").select("*, users!editor_id(name)").eq("status", "in_review")
        if page_id:
            query = query.eq("page_id", page_id)

        response = query.order("created_at").execute()
        return response.data

    def process_review(self, pending_id: int, review: ReviewAction) -> Dict[str, Any]:
        if review.action == "reject":
            # Simple status update for rejections
            response = self.client.table("pending_pages").update({
                "status": "rejected",
                "reviewer_id": review.reviewer_id
            }).eq("pending_id", pending_id).execute()
            return {"message": "Draft rejected", "data": response.data}

        elif review.action == "approve":
            # NOTE: Because this handles both NEW pages (insert) and EDITS (update + backup),
            # it is highly recommended to execute this via a Supabase Postgres RPC (Function)
            # to ensure ACID compliance.
            #
            # The RPC should:
            # 1. Check if pending_page.page_id is NULL (New Page workflow)
            #    -> Insert into live_pages, update pending_page status.
            # 2. Check if pending_page.page_id exists (Edit workflow)
            #    -> Backup current live_page to revision_pages.
            #    -> Overwrite live_page with pending data & increment version.
            #    -> Mark competing drafts for this page as stale.
            #    -> Log to audit_logs.

            try:
                response = self.client.rpc(
                    "process_draft_approval",
                    {
                        "p_pending_id": pending_id,
                        "p_reviewer_id": review.reviewer_id
                    }
                ).execute()
                return {"message": "Draft approved and published.", "data": response.data}
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Database transaction failed: {str(e)}")

# -------------------------------------------------------------------------
# 4. FASTAPI APPLICATION & DEPENDENCY INJECTION
# -------------------------------------------------------------------------

load_dotenv()

app = FastAPI(title="Wiki API - Unified & Decoupled")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update for production security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency generator - swap SupabaseRepo() for PostgresRepo() later
def get_db() -> DatabaseRepository:
    return SupabaseRepo()


# -------------------------------------------------------------------------
# 5. API ROUTES (Business Logic completely decoupled from DB)
# -------------------------------------------------------------------------

@app.post("/users", tags=["Users"])
def create_user(user: UserCreate, db: DatabaseRepository = Depends(get_db)):
    return db.create_user(user)

@app.get("/pages/{slug}", tags=["Pages"])
def get_page(slug: str, db: DatabaseRepository = Depends(get_db)):
    return db.get_live_page(slug)

@app.post("/drafts", tags=["Workflow"])
def submit_draft(draft: DraftSubmit, db: DatabaseRepository = Depends(get_db)):
    """
    Submit a new draft.
    Omit `page_id` to propose a completely new wiki page.
    Include `page_id` and `base_version` to propose an edit to an existing page.
    """
    return db.submit_draft(draft)

@app.get("/drafts/pending", tags=["Workflow"])
def list_pending_drafts(page_id: Optional[int] = None, db: DatabaseRepository = Depends(get_db)):
    """
    Fetch all drafts currently awaiting review.
    Optionally filter by a specific page_id to see competing edits.
    """
    return db.get_pending_drafts(page_id)

@app.post("/drafts/{pending_id}/review", tags=["Workflow"])
def review_draft(pending_id: int, review: ReviewAction, db: DatabaseRepository = Depends(get_db)):
    """
    Approve or reject a draft.
    Approving executes the backend merge transaction.
    """
    return db.process_review(pending_id, review)
