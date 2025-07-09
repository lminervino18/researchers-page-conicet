// src/api/research.ts
import axios from "axios";
import { ResearchDTO } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const RESEARCHES_URL = API_BASE_URL + "/researches";

// Configuration for PDF handling
const pdfApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: "application/pdf",
    "Content-Type": "application/pdf",
  },
});

// Get all publications with pagination
export const getAllResearches = async (page = 0, size = 10) => {
  try {
    const response = await axios.get(`${RESEARCHES_URL}`, {
      params: {
        page,
        size,
        sort: "createdAt",
        direction: "DESC",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching publications:", error);
    throw error;
  }
};

// Search publications
export const searchPublications = async (query: string) => {
  try {
    const response = await axios.get(`${RESEARCHES_URL}/search`, {
      params: { query },
    });
    return response.data;
  } catch (error) {
    console.error("Error searching publications:", error);
    throw error;
  }
};

// Get single research by ID
export const getResearchById = async (id: number) => {
  try {
    const response = await axios.get(`${RESEARCHES_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching research:", error);
    throw error;
  }
};

// Create new research
export const createResearch = async (data: ResearchDTO, file: File | null) => {
  try {
    const formData = new FormData();
    formData.append(
      "research",
      new Blob([JSON.stringify(data)], { type: "application/json" })
    );

    // Solo agregamos el archivo si existe
    if (file) {
      formData.append("file", file);
    }

    const response = await axios.post(RESEARCHES_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating research:", error);
    throw error;
  }
};

// Update existing research
export const updateResearch = async (
  id: number,
  data: ResearchDTO,
  file?: File
) => {
  try {
    const formData = new FormData();
    formData.append(
      "research",
      new Blob([JSON.stringify(data)], { type: "application/json" })
    );
    if (file) {
      formData.append("file", file);
    }

    const response = await axios.put(`${RESEARCHES_URL}/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating research:", error);
    throw error;
  }
};

// src/api/research.ts
export const deleteResearch = async (id: number) => {
  try {
    await axios.delete(`${RESEARCHES_URL}/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 500) {
        throw new Error(
          "Internal server error while deleting research. Please try again."
        );
      } else if (error.response?.status === 404) {
        throw new Error("Research not found.");
      }
    }
    throw new Error("Failed to delete research");
  }
};

// View PDF
export const viewPdf = async (id: number) => {
  try {
    const response = await pdfApi.get(`/researches/view/${id}`, {
      responseType: "blob",
      headers: {
        Accept: "application/pdf",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error viewing PDF:", error);
    throw error;
  }
};

// Download PDF
export const downloadPdf = async (id: number) => {
  try {
    const response = await pdfApi.get(`/researches/download/${id}`, {
      responseType: "blob",
      headers: {
        Accept: "application/pdf",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error downloading PDF:", error);
    throw error;
  }
};

// Search by abstract
export const searchByAbstract = async (query: string) => {
  try {
    const response = await axios.get(`${RESEARCHES_URL}/search/abstract`, {
      params: { query },
    });
    return response.data;
  } catch (error) {
    console.error("Error searching by abstract:", error);
    throw error;
  }
};

// Search by author
export const searchByAuthor = async (name: string) => {
  try {
    const response = await axios.get(`${RESEARCHES_URL}/search/author`, {
      params: { name },
    });
    return response.data;
  } catch (error) {
    console.error("Error searching by author:", error);
    throw error;
  }
};

export default {
  getAllResearches,
  searchPublications,
  getResearchById,
  createResearch,
  updateResearch,
  deleteResearch,
  viewPdf,
  downloadPdf,
  searchByAbstract,
  searchByAuthor,
};
