"use client";

import { useMemo, useRef, useState } from "react";
import { Pencil, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useHomeStore } from "@/store/useHomeStore";
import { apiService } from "@/api";
import { DEFAULT_ICON, DEFAULT_COLOR } from "@/lib/categoryIcon";

interface CategoryEditModalProps {
  category: {
    category_id: number;
    slug: string;
    name: string;
    description: string;
    icon?: string;
    color?: string;
    parent_id?: number | null;
  };
  onClose: () => void;
}

export default function CategoryEditModal({ category, onClose }: CategoryEditModalProps) {
  const { categories, updateCategoryState } = useAuth();
  const { setActivePortalCategory, setActiveOverlay } = useHomeStore();
  const [editName, setEditName] = useState(category.name);
  const [editDescription, setEditDescription] = useState(category.description);
  // Icon/color are no longer edited here (they're set via the icon popover on
  // the category page); keep the current values so saving preserves them.
  const editIcon = category.icon || DEFAULT_ICON;
  const editColor = category.color || DEFAULT_COLOR;
  const [editParentId, setEditParentId] = useState<string>(
    category.parent_id != null ? String(category.parent_id) : ""
  );
  const [editError, setEditError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // Used to detect a double-tap on touch devices (the maximize button is
  // hidden on small screens, so a double-tap on the header is the only way
  // to maximize there).
  const lastTapRef = useRef(0);

  // Valid parent options exclude the category itself and all of its descendants
  // (choosing one of those would create a cycle in the hierarchy).
  const parentOptions = useMemo(() => {
    const excluded = new Set<number>([category.category_id]);
    // Iteratively collect descendants until no new ones are found.
    let changed = true;
    while (changed) {
      changed = false;
      for (const c of categories) {
        if (c.parent_id != null && excluded.has(c.parent_id) && !excluded.has(c.category_id)) {
          excluded.add(c.category_id);
          changed = true;
        }
      }
    }
    return categories
      .filter((c) => !excluded.has(c.category_id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, category.category_id]);

  const toggleMaximize = () => setIsMaximized((m) => !m);

  const handleHeaderDoubleTap = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      e.preventDefault();
      toggleMaximize();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  const onEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editDescription.trim()) {
      setEditError("Name and description are required");
      return;
    }
    try {
      setEditError("");
      setSubmitting(true);
      const updatedCat = await apiService.updateCategory(category.category_id, {
        name: editName.trim(),
        description: editDescription.trim(),
        icon: editIcon || DEFAULT_ICON,
        color: editColor,
        parent_id: editParentId ? Number(editParentId) : null,
      });
      updateCategoryState(updatedCat);
      onClose();
      // Categories are shown in the portal modal (not a route page), so on a
      // rename open that modal for the (possibly new) slug instead of navigating.
      if (updatedCat.slug !== category.slug) {
        setActivePortalCategory(updatedCat.slug);
        setActiveOverlay("portal");
      }
    } catch (err: any) {
      console.error(err);
      setEditError(err.response?.data?.error || err.message || "Failed to update category");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`fixed inset-0 bg-base-content/40 backdrop-blur-xs flex items-center justify-center z-[21000] animate-in fade-in duration-200 ${isMaximized ? "p-0" : "p-0 sm:p-4"}`}>
      <form
        onSubmit={onEditSubmit}
        className={`relative flex flex-col overflow-hidden bg-base-100 border-0 sm:border border-base-200 animate-in zoom-in-95 duration-200 ${
          isMaximized
            ? "w-full h-full max-w-none rounded-none shadow-none border-0"
            : "w-full h-full sm:h-auto sm:max-h-[calc(100vh-2rem)] sm:max-w-md rounded-none sm:rounded-2xl shadow-none sm:shadow-xl"
        }`}
      >
        {/* Window Header — title (left) · close (right) */}
        <div
          onDoubleClick={(e) => {
            if ((e.target as HTMLElement).closest("button")) return;
            toggleMaximize();
          }}
          onTouchEnd={handleHeaderDoubleTap}
          className="flex items-center justify-between px-4 py-2.5 border-b border-base-200 bg-base-200 text-base-content select-none shrink-0"
        >
          <div className="flex items-center gap-2 text-primary font-bold">
            <Pencil className="h-5 w-5" />
            <span>Edit Category</span>
          </div>
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer text-red-400 hover:text-red-500"
              aria-label="Close"
            >
              <X className="h-5 w-5 shrink-0" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
          {editError && (
            <div className="p-3 text-xs bg-error/10 text-error border border-error/20 rounded-lg">
              {editError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-base-content/70 uppercase">
              Category Name
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Category Name"
              className="input input-bordered w-full text-base-content"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-base-content/70 uppercase">
              Description
            </label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Description..."
              className="textarea textarea-bordered w-full text-base-content min-h-20 max-h-40"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-base-content/70 uppercase">
              Parent Category
            </label>
            <select
              value={editParentId}
              onChange={(e) => setEditParentId(e.target.value)}
              className="select select-bordered w-full text-base-content"
            >
              <option value="">None (top-level)</option>
              {parentOptions.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-base-content/50">
              If set, this category is shown inside its parent instead of the All Categories page.
            </p>
          </div>

          <div className="flex items-center gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm text-base-content/60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-sm text-primary-content"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
