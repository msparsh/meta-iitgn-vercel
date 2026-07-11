import { CATEGORIES_DATA } from "@/lib/placeholder-articles";
import WikiClient from "../../../wiki-client";
import Link from "next/link";

interface ArticlePageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { category, slug } = await params;

  const categoryInfo = CATEGORIES_DATA[category];

  if (slug === "new" && categoryInfo) {
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

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  try {
    const res = await fetch(`${apiBase}/pages/${slug}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      initialMarkdown = data.content;
      dbPageId = data.page_id;
      version = data.version;
    } else {
      // Fallback to placeholder if backend is not seeded or does not have it
      const article = categoryInfo?.articles.find((a) => a.slug === slug);
      if (article) {
        initialMarkdown = article.content;
      }
    }
  } catch (err) {
    console.error("Failed to fetch from backend API, using fallback data:", err);
    const article = categoryInfo?.articles.find((a) => a.slug === slug);
    if (article) {
      initialMarkdown = article.content;
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
