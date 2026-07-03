export interface SubItem {
  title: string;
}

export interface TocItem {
  id: string;
  title: string;
  active?: boolean;
  subItems?: SubItem[];
}

export interface ContentSegment {
  type: "paragraph" | "section";
  html?: string;
  title?: string;
  text?: string;
}

export interface InfoboxRow {
  label: string;
  value: string | string[];
  type?: "badge" | "text";
}

export interface InfoboxData {
  image: string;
  imageAlt: string;
  rows: InfoboxRow[];
}

export interface ArticleData {
  title: string;
  bannerNote: string;
  toc: TocItem[];
  content: ContentSegment[];
  infobox: InfoboxData;
}
