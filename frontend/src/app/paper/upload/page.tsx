"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import {apiService} from "@/api";
import { type UploadFormData,departments,years ,semesters,examTypes } from "@/lib/types";
import { courseMasterList } from "@/lib/data";

const Upload = () => {
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UploadFormData>({
    defaultValues: {
      semester: "1",
      examType: "Midsem",
      department: "CS",
      year: new Date().getFullYear().toString(),
    },
  });

  const selectedFile = watch("paper");
  const watchedCourseCode = watch("courseCode");

  useEffect(() => {
    const formattedCode = (watchedCourseCode || "").trim().toUpperCase();
    if (formattedCode && courseMasterList[formattedCode]) {
      setValue("courseName", courseMasterList[formattedCode].title);
    } else {
      setValue("courseName", "");
    }
  }, [watchedCourseCode, setValue]);


  const sortedCourseCodes = Object.keys(courseMasterList).sort();

  const onSubmit = async (data: UploadFormData) => {
    setUploading(true);
    const formattedCode = data.courseCode.trim().toUpperCase();
    const lookedUpName = courseMasterList[formattedCode]?.title || "";

    const formData = new FormData();
    formData.append("courseCode", formattedCode);
    formData.append("courseName", lookedUpName);
    formData.append("semester", data.semester);
    formData.append("year", data.year);
    formData.append("department", data.department);
    formData.append("examType", data.examType);
    formData.append("paper", data.paper[0]);

    await apiService.uploadPaper(formData, setUploading);
  };

  return (
    <div className="min-h-screen bg-transparent text-primary font-sans  py-12 px-6 ">
      <div className="max-w-xl mx-auto mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-black hover:text-white transition">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          Back to Vault
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-primary tracking-tight">
            Upload Exam Paper
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Provide exam metadata below. Make sure the PDF file is readable.
          </p>
        </div>

        <div className="rounded  bg-transparent text-primary font-sans p-5 shadow-md">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Course Code *
                </label>
                <input
                  list="course-suggestions"
                  placeholder="Type code (e.g. CS330)..."
                  {...register("courseCode", {
                    required: "Course Code is required",
                    validate: (value) => {
                      const code = (value || "").trim().toUpperCase();
                      return (
                        !!courseMasterList[code] ||
                        "Please select a valid course from the suggestion list"
                      );
                    },
                  })}
                  className="w-full px-3 py-2 rounded border border-primary bg-transparent  font-medium text-base-content placeholder-base-content/40 focus:outline-none focus-within:bg-base-100 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 text-xs"
                />

                <datalist id="course-suggestions" className="max-h-20" >
                  {sortedCourseCodes.map((code) => (
                    <option key={code} value={code}>
                      {code} - {courseMasterList[code].title}
                    </option>
                  ))}
                </datalist>

                {errors.courseCode && (
                  <p className="text-red-400 text-[10px] mt-1 font-semibold">
                    {errors.courseCode.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Course Name (Auto-Lookup)
                </label>
                <input
                  type="text"
                  readOnly
                  placeholder="Suggested automatically"
                  {...register("courseName", {
                    required: "Course Name is required",
                  })}
                  className="w-full px-3 py-2 rounded border border-primary bg-transparent   font-medium text-base-content placeholder-base-content/40 focus:outline-none focus-within:bg-base-100 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 text-xs"
                />
                {errors.courseName && (
                  <p className="text-red-400 text-[10px] mt-1 font-semibold">
                    {errors.courseName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Department
                </label>
                <select
                  {...register("department", {
                    required: "Department is required",
                  })}
                  className="w-full px-3 py-2 rounded border border-primary bg-transparent   font-medium text-base-content placeholder-base-content/40 focus:outline-none focus-within:bg-base-100 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 text-xs">
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {errors.department && (
                  <p className="text-red-400 text-[10px] mt-1 font-semibold">
                    {errors.department.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Semester
                </label>
                <select
                  {...register("semester", {
                    required: "Semester is required",
                  })}
                  className="w-full px-3 py-2 rounded border border-primary bg-transparent   font-medium text-base-content placeholder-base-content/40 focus:outline-none focus-within:bg-base-100 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 text-xs">
                  {semesters.map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
                {errors.semester && (
                  <p className="text-red-400 text-[10px] mt-1 font-semibold">
                    {errors.semester.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Exam Type
                </label>
                <select
                  {...register("examType", {
                    required: "Exam type is required",
                  })}
                  className="w-full px-3 py-2 rounded border border-primary bg-transparent  font-medium text-base-content placeholder-base-content/40 focus:outline-none focus-within:bg-base-100 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 text-xs cursor-pointer">
                  {examTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.examType && (
                  <p className="text-red-400 text-[10px] mt-1 font-semibold">
                    {errors.examType.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Year
                </label>
                <select
                  {...register("year", { required: "Year is required" })}
                  className="w-full px-3 py-2 rounded border border-primary bg-transparent  font-medium text-base-content placeholder-base-content/40 focus:outline-none focus-within:bg-base-100 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 text-xs cursor-pointer">
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                {errors.year && (
                  <p className="text-red-400 text-[10px] mt-1 font-semibold">
                    {errors.year.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Upload Paper (PDF only, max 10MB)
              </label>
              <div className="relative border border-dashed border-primary hover:border-slate-500 rounded p-5 bg-tranparent text-center transition cursor-pointer">
                <input
                  type="file"
                  accept="application/pdf"
                  {...register("paper", {
                    required: "PDF file is required",
                    validate: {
                      isPdf: (files) =>
                        files[0]?.type === "application/pdf" ||
                        "Only PDF files are allowed",
                      lessThan10MB: (files) =>
                        files[0]?.size <= 10 * 1024 * 1024 ||
                        "compress file first",
                    },
                  })}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <svg
                  className="mx-auto h-8 w-8 text-slate-500 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
                <p className="text-xs font-semibold text-slate-300">
                  {selectedFile && selectedFile.length > 0
                    ? selectedFile[0].name
                    : "Select a PDF Paper"}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  {selectedFile && selectedFile.length > 0
                    ? `Size: ${(selectedFile[0].size / (1024 * 1024)).toFixed(2)} MB`
                    : "Click to browse or drop file here"}
                </p>
              </div>
              {errors.paper && (
                <p className="text-red-400 text-[10px] mt-2 text-center font-bold">
                  {errors.paper.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/50  text-base-content font-bold py-2.5 rounded text-xs transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
              {uploading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Uploading...
                </>
              ) : (
                "Upload Paper"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload;
