"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { apiService } from "@/api";
import { Calendar, User as UserIcon, Eye, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import LinkExtension from "@tiptap/extension-link";

interface BlogAuthor {
  user_id: number;
  name: string;
  avatar_url?: string | null;
}

interface BlogData {
  blog_id: number;
  title: string;
  description?: string | null;
  slug: string;
  content?: string | null;
  created_at: string;
  view_count: number;
  original_author_id: number;
  original_author: BlogAuthor;
}

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { user } = useAuth();

  const [blog, setBlog] = useState<BlogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const editor = useEditor({
    editable: false,
    extensions: [
      StarterKit,
      Image,
      Youtube.configure({
        HTMLAttributes: {
          class: "w-full aspect-video rounded-2xl my-6 border border-base-300",
        },
      }),
      LinkExtension.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: "link link-primary font-semibold",
        },
      }),
    ],
    content: null,
  }, [blog?.content]);

  useEffect(() => {
    if (!slug) return;
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const res = await apiService.getBlog(slug);
        if (res && res.success) {
          setBlog(res.blog);
          
          // Parse content and set editor
          if (res.blog.content && editor) {
            try {
              const parsed = JSON.parse(res.blog.content);
              editor.commands.setContent(parsed);
            } catch {
              // fallback for plain text / html
              editor.commands.setContent(res.blog.content);
            }
          }
        }
      } catch (err: any) {
        console.error("Error loading blog details:", err);
        setError(err.response?.data?.error || err.message || "Failed to load blog post.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug, editor]);

  const handleDelete = async () => {
    if (!blog || deleting) return;
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    try {
      setDeleting(true);
      const res = await apiService.deleteBlog(blog.slug);
      if (res && res.success) {
        router.push("/blog");
      }
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || "Failed to delete blog post.");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch {
      return "Unknown Date";
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-transparent">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <main className="flex-1 p-6 md:p-8 mt-16 bg-transparent">
        <div className="max-w-3xl mx-auto text-center py-20">
          <h1 className="text-3xl font-bold text-base-content font-serif">Blog Post Not Found</h1>
          <p className="text-base-content/60 mt-2">{error || "The requested blog post does not exist or has been deleted."}</p>
          <Link href="/blog" className="btn btn-primary inline-flex items-center gap-2 mt-6 rounded-xl text-white">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Blogs</span>
          </Link>
        </div>
      </main>
    );
  }

  const isAuthor = user?.user_id === blog.original_author_id;
  const isAdminOrMod = user?.role === "admin" || user?.role === "moderator";
  const canEdit = isAuthor || isAdminOrMod;

  return (
    <main className="flex-1 p-6 md:p-8 mt-16 bg-transparent overflow-y-auto h-full w-full">
      <article className="max-w-3xl mx-auto space-y-6">
        
        {/* Back navigation */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider hover:underline">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Explore Blogs</span>
        </Link>

        {/* Blog Title & Meta */}
        <div className="space-y-4 border-b border-base-200 pb-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-black text-base-content tracking-tight leading-tight">
            {blog.title}
          </h1>

          {blog.description && (
            <p className="text-base-content/70 text-base md:text-lg italic font-medium leading-relaxed">
              {blog.description}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            {/* Author */}
            <div className="flex items-center gap-2.5">
              {blog.original_author.avatar_url ? (
                <img
                  src={blog.original_author.avatar_url}
                  alt={blog.original_author.name}
                  className="h-10 w-10 rounded-full object-cover border border-base-300 shadow-xs"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-base-200 flex items-center justify-center border border-base-300 text-base-content/60 shadow-xs">
                  <UserIcon className="h-5 w-5" />
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-base-content leading-none">
                  {blog.original_author.name}
                </p>
                <p className="text-[10px] text-base-content/50 font-semibold mt-1">
                  Author
                </p>
              </div>
            </div>

            {/* Read Stats */}
            <div className="flex items-center gap-4 text-xs text-base-content/50 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(blog.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {blog.view_count} views
              </span>
            </div>
          </div>
        </div>

        {/* Actions Menu (Edit/Delete) */}
        {canEdit && (
          <div className="flex justify-end gap-3 pb-2">
            <Link
              href={`/blog/${blog.slug}/edit`}
              className="btn btn-outline btn-sm font-bold rounded-xl transition-all duration-200 active:scale-95 flex items-center gap-1.5"
            >
              <Pencil className="h-4 w-4" />
              <span>Edit Post</span>
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="btn btn-outline btn-error btn-sm font-bold rounded-xl transition-all duration-200 active:scale-95 flex items-center gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Post</span>
            </button>
          </div>
        )}

        {/* Tiptap Article content */}
        <div className="prose prose-base-content max-w-none prose-img:rounded-3xl prose-img:border prose-img:border-base-200 prose-a:text-primary prose-a:font-bold prose-headings:font-serif prose-headings:font-black prose-headings:tracking-tight prose-headings:text-base-content prose-p:text-base-content/85 prose-p:leading-relaxed prose-li:text-base-content/80 prose-code:text-secondary bg-base-100 p-6 md:p-8 rounded-3xl border border-base-200 shadow-2xs select-text">
          <EditorContent editor={editor} />
        </div>

      </article>
    </main>
  );
}
