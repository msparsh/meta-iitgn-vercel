// This makes the page a Server Component that can await data
export default async function WikiHome() {
  // Fetch from your FastAPI backend
  // In Next.js 15, fetches are uncached by default (fresh data on every load)
  const response = await fetch("http://127.0.0.1:8000/page/1");

  let pageContent = "Failed to load content.";
  if (response.ok) {
    const data = await response.json();
    pageContent = data.content;
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 px-6 flex items-center shrink-0">
        <h1 className="font-semibold">My Wiki</h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-60 border-r border-zinc-200 dark:border-zinc-800 p-4 hidden md:block overflow-y-auto">
          <nav className="flex flex-col space-y-3 text-sm">
            <a href="#" className="hover:underline">
              Introduction
            </a>
            <a href="#" className="hover:underline">
              API Reference
            </a>
            <a href="#" className="hover:underline">
              Database Schema
            </a>
          </nav>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          {/* Render the raw markdown fetched from Python */}
          <pre className="whitespace-pre-wrap font-sans">{pageContent}</pre>
        </main>

        <aside className="w-56 border-l border-zinc-200 dark:border-zinc-800 p-4 hidden lg:block overflow-y-auto text-sm">
          <span className="font-medium text-zinc-500">On this page</span>
        </aside>
      </div>
    </div>
  );
}
