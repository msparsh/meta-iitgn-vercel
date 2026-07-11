import { CATEGORIES_DATA } from "@/lib/placeholder-articles";
import WikiClient from "../../wiki-client";
import CategoryPage from "@/components/CategoryPage";
import Link from "next/link";

interface WikiPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    category?: string;
  }>;
}

export default async function WikiPage({ params, searchParams }: WikiPageProps) {
  const { slug } = await params;
  const { category: categoryQuery } = await searchParams;

  // Check if the slug corresponds to a category page
  if (CATEGORIES_DATA[slug]) {
    return <CategoryPage categorySlug={slug} />;
  }

  // Handle new page creation
  if (slug === "new") {
    const selectedCategory = categoryQuery || "departments";
    const categoryInfo = CATEGORIES_DATA[selectedCategory] || CATEGORIES_DATA["departments"];
    const template = `---
image: https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600
imageAlt: New Article
rows:
  - label: Category
    value: ${categoryInfo.name}
    type: text
  - label: Status
    value: Draft
    type: text
---

# Untitled Article

Write your content here...`;

    return <WikiClient initialMarkdown={template} defaultEditing={true} />;
  }

  let initialMarkdown = "";
  let dbPageId: number | undefined = undefined;
  let version: number | undefined = undefined;
  let isPending: boolean = false;

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  try {
    const res = await fetch(`${apiBase}/pages/${slug}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      initialMarkdown = data.content;
      dbPageId = data.page_id || undefined;
      version = data.version || undefined;
      isPending = data.status === "in_review";
    } else {
      // Fallback to placeholder if backend does not have it yet
      // Search all categories for this slug
      for (const catKey of Object.keys(CATEGORIES_DATA)) {
        const article = CATEGORIES_DATA[catKey].articles.find((a) => a.slug === slug);
        if (article) {
          initialMarkdown = article.content;
          break;
        }
      }
    }
  } catch (err) {
    console.error("Failed to fetch from backend API, using fallback data:", err);
    for (const catKey of Object.keys(CATEGORIES_DATA)) {
      const article = CATEGORIES_DATA[catKey].articles.find((a) => a.slug === slug);
      if (article) {
        initialMarkdown = article.content;
        break;
      }
    }
  }

  if (!initialMarkdown) {
    return (
      <main className="flex-1 p-6 md:p-8 lg:p-12 bg-[#FCFCFD]">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h1 className="text-3xl font-bold text-gray-800">Article Not Found</h1>
          <p className="text-gray-500 mt-2">The requested article could not be found.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Back to Wiki
          </Link>
        </div>
      </main>
    );
  }

  return (
    <WikiClient
      initialMarkdown={initialMarkdown}
      dbPageId={dbPageId}
      version={version}
    />
  );
}
