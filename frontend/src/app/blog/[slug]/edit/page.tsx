"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { apiService } from "@/api";
import Link from "next/link";
import {
  Bold,
  Italic,
  Code,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  VideoOff,
  Quote,
  X,
  Check,
  ArrowLeft,
} from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import LinkExtension from "@tiptap/extension-link";
import BottomNavbar from "@/components/BottomNavbar";

// Custom SVG Youtube icon to avoid build and barrel optimization issues
const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
  </svg>
);

export default function BlogEditPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const isNew = slug === "new";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  // Media states
  const [showYoutubeModal, setShowYoutubeModal] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoWarning, setVideoWarning] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: "rounded-2xl max-w-full my-6 border border-base-200 shadow-2xs mx-auto block",
        },
      }),
      Youtube.configure({
        HTMLAttributes: {
          class: "w-full aspect-video rounded-2xl my-6 border border-base-300",
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "link link-primary font-semibold",
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: "prose prose-base-content max-w-none focus:outline-none min-h-[400px] p-6 bg-base-100 rounded-3xl border border-base-200 select-text leading-relaxed",
      },
    },
  });

  useEffect(() => {
    if (isNew || !slug || !editor) return;

    const fetchBlog = async () => {
      try {
        setLoading(true);
        const res = await apiService.getBlog(slug);
        if (res && res.success) {
          setTitle(res.blog.title);
          setDescription(res.blog.description || "");

          // Check permissions
          const isAuthor = res.blog.original_author_id === user?.user_id;
          const isAdminOrMod = user?.role === "admin" || user?.role === "moderator";
          if (!isAuthor && !isAdminOrMod) {
            router.push(`/blog/${slug}`);
            return;
          }

          if (res.blog.content) {
            try {
              const parsed = JSON.parse(res.blog.content);
              editor.commands.setContent(parsed);
            } catch {
              editor.commands.setContent(res.blog.content);
            }
          }
        }
      } catch (err: any) {
        console.error("Error fetching blog for edit:", err);
        setError("Failed to load blog post.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug, isNew, editor, user, router]);

  // Auth Protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (loading || authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-transparent">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    // Validate type and size
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size cannot exceed 2MB.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Show temporary uploading text or spinner
      setSaving(true);
      const res = await apiService.uploadMedia(formData);
      if (res && res.file_url) {
        editor.chain().focus().setImage({ src: res.file_url }).run();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || "Failed to upload image.");
    } finally {
      setSaving(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const triggerImageUpload = () => {
    imageInputRef.current?.click();
  };

  // Prevent video upload and show warning
  const handleVideoUploadAttempt = () => {
    setVideoWarning("Direct video uploads are disabled to save cloud space. Please use a YouTube link instead!");
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const triggerVideoUploadWarning = () => {
    videoInputRef.current?.click();
  };

  const handleInsertYoutube = () => {
    if (!youtubeUrl.trim() || !editor) return;

    // Validate youtube link
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = youtubeUrl.match(regExp);

    if (match && match[2].length === 11) {
      editor.commands.setYoutubeVideo({
        src: youtubeUrl,
      });
      setShowYoutubeModal(false);
      setYoutubeUrl("");
      setVideoWarning("");
    } else {
      alert("Please paste a valid YouTube URL.");
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !editor) {
      setError("Title is required");
      return;
    }

    try {
      setError("");
      setSaving(true);
      
      const contentJson = JSON.stringify(editor.getJSON());

      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        content: contentJson,
      };

      if (isNew) {
        const res = await apiService.createBlog(payload);
        if (res && res.success) {
          router.push(`/blog/${res.blog.slug}`);
        }
      } else {
        const res = await apiService.updateBlog(slug, payload);
        if (res && res.success) {
          router.push(`/blog/${res.blog.slug}`);
        }
      }
    } catch (err: any) {
      console.error("Error saving blog:", err);
      setError(err.response?.data?.error || err.message || "Failed to save blog post.");
    } finally {
      setSaving(false);
    }
  };

  // Editor styling helpers
  const isFormatActive = (name: string, attributes?: any) => {
    if (!editor) return false;
    return editor.isActive(name, attributes);
  };

  const tabs = [
    {
      id: "cancel",
      label: "Cancel",
      icon: X,
      onClick: () => {
        if (confirm("Are you sure you want to discard your changes?")) {
          router.push(isNew ? "/blog" : `/blog/${slug}`);
        }
      },
    },
    {
      id: "save",
      label: saving ? "Publishing..." : "Publish Blog",
      icon: Check,
      onClick: handleSave,
    },
  ];

  return (
    <main className="flex-1 p-6 md:p-8 mt-16 bg-transparent overflow-y-auto h-full w-full pb-32">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Back Link */}
        <Link href={isNew ? "/blog" : `/blog/${slug}`} className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider hover:underline">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to {isNew ? "Blogs" : "Reading"}</span>
        </Link>

        {/* Heading */}
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-black text-base-content tracking-tight">
            {isNew ? "Write a New Blog Post" : "Edit Blog Post"}
          </h1>
          <p className="text-xs text-base-content/50 font-bold uppercase tracking-wider mt-1">
            Create structured, media-rich content using our rich text editor.
          </p>
        </div>

        {error && (
          <div className="p-4 text-xs bg-error/10 text-error border border-error/20 rounded-2xl font-semibold">
            {error}
          </div>
        )}

        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={imageInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={videoInputRef}
          onChange={handleVideoUploadAttempt}
          accept="video/*"
          className="hidden"
        />

        {/* Video Upload Warning Alert */}
        {videoWarning && (
          <div className="alert alert-warning shadow-xs rounded-2xl flex items-start gap-3">
            <VideoOff className="h-5 w-5 text-warning-content shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-xs">Video Upload Restriction</h3>
              <p className="text-[11px] text-warning-content/80 mt-0.5">{videoWarning}</p>
            </div>
            <button onClick={() => setVideoWarning("")} className="btn btn-ghost btn-circle btn-xs text-warning-content">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Editor Inputs */}
        <div className="space-y-4 bg-base-100 p-6 rounded-3xl border border-base-200 shadow-2xs">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-base-content/60 uppercase tracking-wider">
              Blog Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your blog post a catchy title..."
              className="input input-bordered w-full text-base-content font-serif text-lg font-bold rounded-xl"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-base-content/60 uppercase tracking-wider">
              Short Description / Summary
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write a brief overview to show in the listings grid..."
              className="textarea textarea-bordered w-full text-base-content text-sm rounded-xl min-h-20 max-h-40"
            />
          </div>
        </div>

        {/* Tiptap Editor & Toolbar */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-base-content/60 uppercase tracking-wider block">
            Blog Content
          </label>

          {/* Toolbar */}
          {editor && (
            <div className="flex flex-wrap gap-1.5 p-2 bg-base-200 border border-base-300 rounded-2xl sticky top-16 z-30">
              {/* Bold */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`btn btn-sm btn-square rounded-lg ${isFormatActive("bold") ? "btn-primary text-white" : "btn-ghost"}`}
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </button>

              {/* Italic */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`btn btn-sm btn-square rounded-lg ${isFormatActive("italic") ? "btn-primary text-white" : "btn-ghost"}`}
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </button>

              {/* Code */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={`btn btn-sm btn-square rounded-lg ${isFormatActive("code") ? "btn-primary text-white" : "btn-ghost"}`}
                title="Code Inline"
              >
                <Code className="h-4 w-4" />
              </button>

              <div className="divider divider-horizontal mx-0" />

              {/* H1 */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`btn btn-sm btn-square rounded-lg ${isFormatActive("heading", { level: 1 }) ? "btn-primary text-white" : "btn-ghost"}`}
                title="Heading 1"
              >
                <Heading1 className="h-4 w-4" />
              </button>

              {/* H2 */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`btn btn-sm btn-square rounded-lg ${isFormatActive("heading", { level: 2 }) ? "btn-primary text-white" : "btn-ghost"}`}
                title="Heading 2"
              >
                <Heading2 className="h-4 w-4" />
              </button>

              {/* H3 */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`btn btn-sm btn-square rounded-lg ${isFormatActive("heading", { level: 3 }) ? "btn-primary text-white" : "btn-ghost"}`}
                title="Heading 3"
              >
                <Heading3 className="h-4 w-4" />
              </button>

              <div className="divider divider-horizontal mx-0" />

              {/* Bullet List */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`btn btn-sm btn-square rounded-lg ${isFormatActive("bulletList") ? "btn-primary text-white" : "btn-ghost"}`}
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </button>

              {/* Ordered List */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`btn btn-sm btn-square rounded-lg ${isFormatActive("orderedList") ? "btn-primary text-white" : "btn-ghost"}`}
                title="Ordered List"
              >
                <ListOrdered className="h-4 w-4" />
              </button>

              {/* Blockquote */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`btn btn-sm btn-square rounded-lg ${isFormatActive("blockquote") ? "btn-primary text-white" : "btn-ghost"}`}
                title="Blockquote"
              >
                <Quote className="h-4 w-4" />
              </button>

              <div className="divider divider-horizontal mx-0" />

              {/* Image Cloud Upload */}
              <button
                type="button"
                onClick={triggerImageUpload}
                className="btn btn-sm btn-square rounded-lg btn-ghost hover:text-primary"
                title="Upload Image to Cloudinary"
              >
                <ImageIcon className="h-4 w-4" />
              </button>

              {/* Video Upload warning trigger */}
              <button
                type="button"
                onClick={triggerVideoUploadWarning}
                className="btn btn-sm btn-square rounded-lg btn-ghost hover:text-error"
                title="Upload Video File (Disabled)"
              >
                <VideoOff className="h-4 w-4" />
              </button>

              {/* Youtube Link Embed */}
              <button
                type="button"
                onClick={() => setShowYoutubeModal(true)}
                className="btn btn-sm btn-square rounded-lg btn-ghost hover:text-red-600"
                title="Embed Youtube Video"
              >
                <YoutubeIcon className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Editor Area */}
          <div className="tiptap-editor-container border-2 border-base-200 hover:border-base-300 rounded-3xl overflow-hidden focus-within:border-primary/40 transition-colors select-text">
            <EditorContent editor={editor} />
          </div>
        </div>

      </div>

      {/* Floating Action Bar */}
      <BottomNavbar tabs={tabs} activeTab={saving ? "save" : undefined} />

      {/* Youtube Embed Modal */}
      {showYoutubeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-base-100 p-6 rounded-2xl border border-base-200 shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-base-200">
              <h3 className="font-serif font-black text-lg text-base-content flex items-center gap-2">
                <YoutubeIcon className="h-5 w-5 text-red-600" />
                <span>Embed YouTube Video</span>
              </h3>
              <button onClick={() => { setShowYoutubeModal(false); setYoutubeUrl(""); }} className="text-base-content/50 hover:text-base-content">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-base-content/60 uppercase">
                YouTube URL
              </label>
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="input input-bordered w-full text-base-content text-sm rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => { setShowYoutubeModal(false); setYoutubeUrl(""); }}
                className="btn btn-ghost btn-sm text-base-content/60"
              >
                Cancel
              </button>
              <button
                onClick={handleInsertYoutube}
                className="btn btn-primary btn-sm text-white"
              >
                Insert Embed
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
