import axios from "axios";
import toast from "react-hot-toast";
import React from "react";
import { api } from "@/lib/api";



interface GetPapersParams {
  search?: string;
  department?: string;
  year?: string;
  page?: number;
  limit?: number;
}

export async function getPapers(params: GetPapersParams) {
  const response = await api.get("/paper", {
    params: {
      ...params,
      sortby: "createdAt",
      order: "desc",
    },
  });

  return response.data;
}

export async function downloadPaper(paperId: string) {
  const response = await api.patch(`/paper/${paperId}/download`);
  return response.data;
}

export async function uploudPaper(
  formData: FormData,
  setUploading: React.Dispatch<React.SetStateAction<boolean>>
) {
  try {
    const response = await api.post("/paper", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    if (response.data.success) {
      toast.success(response.data.message);
    }
  } catch (err: unknown) {
    console.error(err);

    if (axios.isAxiosError(err)) {
      const message =
        err.response?.data?.message || "Something went wrong while uploading.";
      toast.error(message);
    } else {
      toast.error("Unexpected error occurred.");
    }
  } finally {
    setUploading(false);
  }
}
