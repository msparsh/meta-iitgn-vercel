export interface SubItem {
  id: string;
  title: string;
}

export interface TocItem {
  id: string;
  title: string;
  active?: boolean;
  subItems?: SubItem[];
}
export interface InfoboxRow {
  label: string;
  value: string | string[];
  type?: "badge" | "text";
}

export interface InfoboxData {
  image: string;
  imageAlt: string;
  description?: string;
  rows: InfoboxRow[];
}

// Matches the actual snake_case fields returned by the backend Prisma model
interface Paper {
  paper_id: number;
  course_name: string;
  course_code: string;
  department: string;
  semester: number;
  year: number;
  exam_type: string;
  downloads: number;
  pdf_url: string;
  file_name: string;
  file_size?: string;
  uploaded_by_name: string;
  owner_id: number;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

interface UploadFormData {
  courseCode: string;
  courseName: string;
  semester: string;
  year: string;
  department: string;
  examType: string;
  paper: FileList;
}

export { type Paper, type UploadFormData };

const departments = [
  "Artificial Intelligence",
  "Computer Science & Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Materials Engineering",
  "Integrated Circuit Design & Technology",
];
const years = [2026, 2025, 2024, 2023, 2022, 2021, 2020];
const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];
const examTypes = [
  "Quiz-1",
  "Quiz-2",
  "Midsem",
  "Endsem",
  "Assignment-1",
  "Assignment-2",
];
export { departments, years, semesters, examTypes };
