import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ContentSegment } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function segmentsToMarkdown(segments: ContentSegment[]): string {
  return segments
    .map((seg) => {
      if (seg.type === "paragraph" && seg.html) {
        if (seg.html.startsWith("<h1>") && seg.html.endsWith("</h1>")) {
          return `# ${seg.html.replace(/<\/?h1>/g, "")}`;
        }
        if (seg.html.startsWith("<blockquote>") && seg.html.endsWith("</blockquote>")) {
          return `> ${seg.html.replace(/<\/?blockquote>/g, "")}`;
        }
        // Convert HTML back to markdown bold/links
        return seg.html
          .replace(/<strong>(.*?)<\/strong>/g, "**$1**")
          .replace(/<a\s+[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g, "[$2]($1)");
      } else if (seg.type === "section") {
        return `## ${seg.title}\n${seg.text}`;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n\n");
}

export function markdownToSegments(markdown: string): ContentSegment[] {
  const lines = markdown.split(/\r?\n/);
  const segments: ContentSegment[] = [];
  let currentSection: { title: string; lines: string[] } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("## ")) {
      if (currentSection) {
        segments.push({
          type: "section",
          title: currentSection.title,
          text: currentSection.lines.join("\n"),
        });
      }
      currentSection = {
        title: trimmed.replace(/^##\s+/, ""),
        lines: [],
      };
    } else {
      if (currentSection) {
        currentSection.lines.push(trimmed);
      } else {
        if (trimmed.startsWith("# ")) {
          segments.push({
            type: "paragraph",
            html: `<h1>${trimmed.replace(/^#\s+/, "")}</h1>`,
          });
        } else if (trimmed.startsWith("> ")) {
          segments.push({
            type: "paragraph",
            html: `<blockquote>${trimmed.replace(/^>\s+/, "")}</blockquote>`,
          });
        } else {
          const html = trimmed
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>');
          segments.push({
            type: "paragraph",
            html,
          });
        }
      }
    }
  }

  if (currentSection) {
    segments.push({
      type: "section",
      title: currentSection.title,
      text: currentSection.lines.join("\n"),
    });
  }

  return segments;
}

import { InfoboxData, InfoboxRow, TocItem } from "./types";

export function parseMarkdown(markdown: string) {
  let title = "My Wiki";
  let image = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600";
  let imageAlt = "IIT Gandhinagar";
  let rows: InfoboxRow[] = [
    { label: "Status", value: "Draft", type: "text" },
    { label: "Type", value: "Wiki Page", type: "text" },
    { label: "Tags", value: ["Mock", "Test", "FastAPI"], type: "badge" },
  ];
  let contentMarkdown = markdown;

  // Check if it has frontmatter
  if (markdown.startsWith("---")) {
    const parts = markdown.split("---");
    if (parts.length >= 3) {
      const frontmatterText = parts[1];
      contentMarkdown = parts.slice(2).join("---").trim();
      
      // Parse simple YAML-like frontmatter
      const lines = frontmatterText.split("\n");
      const normalizedLines: string[] = [];
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (!line.includes(":") && !trimmed.startsWith("-") && normalizedLines.length > 0) {
          normalizedLines[normalizedLines.length - 1] += " " + trimmed;
        } else {
          normalizedLines.push(line);
        }
      }

      let currentRows: InfoboxRow[] = [];
      let inRows = false;
      let currentRow: Partial<InfoboxRow> | null = null;

      for (let line of normalizedLines) {
        line = line.trim();
        if (!line) continue;

        if (line.startsWith("image:")) {
          image = line.replace("image:", "").trim();
          inRows = false;
        } else if (line.startsWith("imageAlt:")) {
          imageAlt = line.replace("imageAlt:", "").trim();
          inRows = false;
        } else if (line.startsWith("rows:")) {
          inRows = true;
          currentRows = [];
        } else if (inRows && line.startsWith("-")) {
          // New row
          if (currentRow && currentRow.label !== undefined && currentRow.value !== undefined) {
            currentRows.push(currentRow as InfoboxRow);
          }
          currentRow = {};
          const rowContent = line.replace(/^-/, "").trim();
          if (rowContent.startsWith("label:")) {
            currentRow.label = rowContent.replace("label:", "").trim();
          }
        } else if (inRows && currentRow) {
          const colonIndex = line.indexOf(":");
          if (colonIndex !== -1) {
            const key = line.slice(0, colonIndex).trim();
            const val = line.slice(colonIndex + 1).trim();
            if (key === "label") {
              currentRow.label = val;
            } else if (key === "value") {
              if (val.startsWith("[") && val.endsWith("]")) {
                currentRow.value = val.slice(1, -1).split(",").map(s => s.trim().replace(/^['"]|['"]$/g, ""));
              } else {
                currentRow.value = val;
              }
            } else if (key === "type") {
              currentRow.type = val as "text" | "badge";
            }
          }
        }
      }
      if (currentRow && currentRow.label !== undefined && currentRow.value !== undefined) {
        currentRows.push(currentRow as InfoboxRow);
      }
      if (currentRows.length > 0) {
        rows = currentRows;
      }
    }
  }

  // Parse title & TOC
  const lines = contentMarkdown.split("\n");
  const toc: TocItem[] = [];
  let titleFound = false;
  const contentLines: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("# ")) {
      if (!titleFound) {
        title = trimmed.replace(/^#\s+/, "").trim();
        titleFound = true;
        continue; // Skip the main title line from content lines
      }
    }
    contentLines.push(line);

    if (trimmed.startsWith("## ")) {
      const h2Text = trimmed.replace(/^##\s+/, "").trim();
      const id = h2Text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      toc.push({ id, title: h2Text, active: toc.length === 0, subItems: [] });
    } else if (trimmed.startsWith("### ")) {
      const h3Text = trimmed.replace(/^###\s+/, "").trim();
      if (toc.length > 0) {
        toc[toc.length - 1].subItems?.push({ title: h3Text });
      }
    }
  }

  // If no TOC items found, create a default one
  if (toc.length === 0) {
    toc.push({ id: "content", title: "Content", active: true });
  }

  return {
    title,
    infobox: { image, imageAlt, rows },
    toc,
    contentMarkdown: contentLines.join("\n").trim()
  };
}

export function stringifyMarkdown(contentMarkdown: string, infobox: InfoboxData, title?: string): string {
  let frontmatter = "---\n";
  frontmatter += `image: ${infobox.image}\n`;
  frontmatter += `imageAlt: ${infobox.imageAlt}\n`;
  frontmatter += `rows:\n`;
  for (const row of infobox.rows) {
    frontmatter += `  - label: ${row.label}\n`;
    if (Array.isArray(row.value)) {
      frontmatter += `    value: [${row.value.map(v => `"${v}"`).join(", ")}]\n`;
    } else {
      frontmatter += `    value: ${row.value}\n`;
    }
    frontmatter += `    type: ${row.type || "text"}\n`;
  }
  frontmatter += "---\n";
  const titleLine = title ? `# ${title}\n\n` : "";
  return frontmatter + "\n" + titleLine + contentMarkdown;
}

