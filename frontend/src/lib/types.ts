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

interface Paper {
  _id: string;
  courseName: string;
  courseCode: string;
  department: string;
  semester: number;
  year: number;
  examType: string;
  downloads: number;
  pdfUrl: string;
  fileName: string;
  fileSize?: string;
  uploadedByName: string;
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
  "Assigment-1",
  "Assigment-2",
];
export { departments, years, semesters, examTypes };
