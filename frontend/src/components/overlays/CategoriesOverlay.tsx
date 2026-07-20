"use client";

import { useState, useMemo, type CSSProperties } from "react";
import { Search, X, Pencil, Pin, PlusCircle, Loader2, FolderOpen, SearchX } from "lucide-react";
import { CategoryIcon } from "@/lib/categoryIcon";
import { useAuth } from "@/hooks/useAuth";
import { useHomeStore } from "@/store/useHomeStore";
import { Category } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { apiService } from "@/api";
import GenericOverlayModal from "@/components/overlays/GenericOverlayModal";
import CategoryEditModal from "@/components/overlays/CategoryEditModal";
import CategoryCreateForm from "@/components/overlays/CategoryCreateForm";

interface CategoriesOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

// Blend a category's hex colour with transparent at the given percentage so the
// tint follows any theme and works for every colour format (unlike the old
// `${color}1a` hex-append trick, which only worked for 6-digit hex).
const colorTint = (color: string, pct: number) =>
  `color-mix(in srgb, ${color} ${pct}%, transparent)`;

const DEFAULT_COLOR = "#4f46e5";

/**
 * "All Categories" browser, surfaced as a modal instead of a dedicated route.
 * Mirrors the former /wiki/categories page: top-level category grid (click opens
 * the matching Quick Portal modal), search (across every category, surfacing
 * subcategories with their parent label), pin/unpin to Quick Portals, edit, and
 * the inline Create Category form — all preserved here as modal content.
 */
export default function CategoriesOverlay({ isOpen, onClose }: CategoriesOverlayProps) {
  const { user, categories, updateCategoryState } = useAuth();
  const { setActiveOverlay, setActivePortalCategory } = useHomeStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [pinningCategoryId, setPinningCategoryId] = useState<number | null>(null);

  const canManageCategory = user?.role === "admin" || user?.role === "moderator";

  // Quick lookup of category_id -> name for rendering a subcategory's parent.
  const nameById = useMemo(() => {
    const map = new Map<number, string>();
    categories.forEach((c) => map.set(c.category_id, c.name));
    return map;
  }, [categories]);

  // When searching, match across ALL categories (name + description) so deeper
  // subcategories surface too; otherwise show the top-level hierarchy. Pinned
  // categories always sort to the front, then alphabetically by name.
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const base = q
      ? categories.filter(
          (cat) =>
            cat.name.toLowerCase().includes(q) ||
            (cat.description || "").toLowerCase().includes(q)
        )
      : categories.filter((cat) => cat.parent_id == null);

    return [...base].sort((a, b) => {
      if (!!b.is_pinned !== !!a.is_pinned) return a.is_pinned ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [categories, searchQuery]);

  // Open the matching category inside the Quick Portal modal (no navigation).
  const openCategory = (slug: string) => {
    setActivePortalCategory(slug);
    setActiveOverlay("portal");
  };

  const headerActions = canManageCategory ? (
    <button
      onClick={() => setShowAddForm((s) => !s)}
      className="btn btn-primary btn-sm font-bold rounded-xl shadow-sm transition-all duration-200 cursor-pointer text-primary-content"
    >
      <PlusCircle className="h-4 w-4" />
      <span className="hidden sm:inline">Create Category</span>
    </button>
  ) : null;

  const isSearching = searchQuery.trim().length > 0;
  const hasAnyCategories = categories.length > 0;

  return (
    <GenericOverlayModal
      isOpen={isOpen}
      onClose={onClose}
      title="All Categories"
      maxWidthClass="max-w-5xl"
      headerActions={headerActions}
    >
      <div className="space-y-5">
        {/* Inline Create Category panel (non-modal) */}
        {showAddForm && canManageCategory && (
          <CategoryCreateForm onCancel={() => setShowAddForm(false)} />
        )}

        {/* Search + live count */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-450 h-4 w-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 border border-base-300 rounded-full text-sm bg-base-100 text-base-content placeholder-gray-450 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary transition-all duration-200"
            />
            {isSearching && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-450 hover:text-base-content hover:bg-base-200 transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <p className="text-xs text-base-content/50 sm:ml-auto shrink-0">
            {filteredCategories.length} {filteredCategories.length === 1 ? "category" : "categories"}
            {isSearching && hasAnyCategories ? ` of ${categories.length}` : ""}
          </p>
        </div>

        {/* Body: grid, or empty / no-results states */}
        {!hasAnyCategories ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <div className="w-14 h-14 rounded-2xl bg-base-200 flex items-center justify-center mb-4">
              <FolderOpen className="h-7 w-7 text-base-content/40" />
            </div>
            <h3 className="text-base font-bold text-base-content font-serif">No categories yet</h3>
            <p className="text-sm text-base-content/55 mt-1 max-w-xs">
              Categories organize the wiki. Create the first one to get started.
            </p>
            {canManageCategory && (
              <button
                onClick={() => setShowAddForm(true)}
                className="btn btn-primary btn-sm font-bold rounded-xl shadow-sm mt-4 text-primary-content cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                Create Category
              </button>
            )}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <div className="w-14 h-14 rounded-2xl bg-base-200 flex items-center justify-center mb-4">
              <SearchX className="h-7 w-7 text-base-content/40" />
            </div>
            <h3 className="text-base font-bold text-base-content font-serif">No matches</h3>
            <p className="text-sm text-base-content/55 mt-1">
              Nothing matches &ldquo;{searchQuery}&rdquo;.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="btn btn-outline btn-sm rounded-xl mt-4 cursor-pointer"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {filteredCategories.map((cat) => {
              const color = cat.color || DEFAULT_COLOR;
              const parentName = cat.parent_id != null ? nameById.get(cat.parent_id) : undefined;

              return (
                <div
                  key={cat.slug}
                  role="button"
                  tabIndex={0}
                  onClick={() => openCategory(cat.slug)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openCategory(cat.slug);
                    }
                  }}
                  className={`group relative flex flex-col gap-3 p-4 md:p-5 rounded-2xl border cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    cat.is_pinned
                      ? "border-[color:var(--pin-border)] bg-[color:var(--pin-tint)]"
                      : "bg-base-100 border-base-200 hover:border-primary"
                  }`}
                  style={
                    cat.is_pinned
                      ? ({ "--pin-tint": colorTint(color, 8), "--pin-border": colorTint(color, 30) } as CSSProperties)
                      : undefined
                  }
                >
                  <div className="flex items-start gap-3">
                    {/* Icon badge */}
                    <div
                      className="w-10 h-10 shrink-0 rounded-xl border flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-105"
                      style={{
                        backgroundColor: colorTint(color, 12),
                        borderColor: colorTint(color, 30),
                        color,
                      }}
                    >
                      <CategoryIcon icon={cat.icon} size={18} />
                    </div>

                    {/* Title + meta */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm md:text-base font-bold text-base-content font-serif group-hover:text-primary transition-colors duration-200 truncate">
                          {cat.name}
                        </h3>
                        {cat.is_pinned && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full shrink-0"
                            style={{ backgroundColor: colorTint(color, 14), color }}
                          >
                            <Pin className="h-2.5 w-2.5 fill-current" />
                            Pinned
                          </span>
                        )}
                      </div>
                      {parentName && (
                        <p className="text-[11px] text-base-content/45 font-medium truncate mt-0.5">
                          in {parentName}
                        </p>
                      )}
                    </div>

                    {/* Management actions */}
                    {canManageCategory && (
                      <div className="flex items-center gap-1 shrink-0">
                        {cat.total_articles > 0 && (
                          <span
                            className="hidden sm:inline text-[10px] font-bold px-2 py-0.5 rounded-full select-none"
                            style={{ backgroundColor: colorTint(color, 12), color }}
                          >
                            {cat.total_articles} articles
                          </span>
                        )}
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const pinnedCount = categories.filter((c) => c.is_pinned).length;
                            if (!cat.is_pinned && pinnedCount >= 10) {
                              toast.error("Quick Portals is full! You can pin a maximum of 10 categories. Please unpin another category first.");
                              return;
                            }
                            setPinningCategoryId(cat.category_id);
                            try {
                              const updated = await apiService.updateCategory(cat.category_id, {
                                is_pinned: !cat.is_pinned,
                              });
                              updateCategoryState(updated);
                            } catch (err) {
                              console.error(err);
                              toast.error("Failed to toggle pin");
                            } finally {
                              setPinningCategoryId(null);
                            }
                          }}
                          disabled={pinningCategoryId === cat.category_id}
                          className={`p-1.5 rounded-lg transition-all duration-150 cursor-pointer disabled:cursor-not-allowed ${
                            cat.is_pinned
                              ? "text-primary bg-primary/10 hover:bg-primary/20"
                              : "text-base-content/50 hover:text-primary hover:bg-base-200"
                          }`}
                          title={cat.is_pinned ? "Unpin from Quick Portal" : "Pin to Quick Portal"}
                        >
                          {pinningCategoryId === cat.category_id ? (
                            <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                          ) : (
                            <Pin className={`h-3.5 w-3.5 ${cat.is_pinned ? "fill-current" : ""}`} />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCategory(cat);
                          }}
                          className="p-1.5 text-base-content/50 hover:text-primary hover:bg-base-200 rounded-lg transition-all duration-150 cursor-pointer"
                          title="Edit Category"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-base-content/60 leading-relaxed line-clamp-3 pl-13">
                    {cat.description || "No description provided."}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Category Modal — nested on top of this modal */}
      {editingCategory && (
        <CategoryEditModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
        />
      )}
    </GenericOverlayModal>
  );
}
