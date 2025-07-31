import axios from "axios";
import { News, NewsDTO, PaginatedResponse } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const NEWS_PATH = "/news";

/**
 * Centralized error handler that always throws
 */
const handleError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const backendMessage =
      error.response?.data?.message || error.response?.data?.error;
    throw new Error(backendMessage || error.message);
  }
  throw error;
};

/**
 * Generic API call wrapper to simplify requests and handle errors consistently
 */
async function apiCall<T>(promise: Promise<{ data: T }>): Promise<T> {
  try {
    const response = await promise;
    return response.data;
  } catch (error) {
    handleError(error);
    throw error; 
  }
}


/**
 * Fetch all news with pagination
 */
export const getAllNews = (
  page = 0,
  size = 10
): Promise<PaginatedResponse<News>> => {
  return apiCall(
    axios.get(`${API_BASE_URL}${NEWS_PATH}`, {
      params: {
        page,
        size,
        sort: "createdAt",
        direction: "DESC",
      },
    })
  );
};

/**
 * Fetch a single news article by ID
 */
export const getNewsById = (id: number): Promise<News> => {
  return apiCall(axios.get(`${API_BASE_URL}${NEWS_PATH}/${id}`));
};

/**
 * Create a new news article
 */
export const createNews = (data: NewsDTO): Promise<News> => {
  return apiCall(
    axios.post(`${API_BASE_URL}${NEWS_PATH}`, data, {
      headers: { "Content-Type": "application/json" },
    })
  );
};

/**
 * Update an existing news article
 */
export const updateNews = (id: number, data: NewsDTO): Promise<News> => {
  return apiCall(
    axios.put(`${API_BASE_URL}${NEWS_PATH}/${id}`, data, {
      headers: { "Content-Type": "application/json" },
    })
  );
};

/**
 * Delete a news article
 */
export const deleteNews = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}${NEWS_PATH}/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 500) {
        throw new Error("Internal server error while deleting news.");
      } else if (error.response?.status === 404) {
        throw new Error("News article not found.");
      }
    }
    throw new Error("Failed to delete news");
  }
};

/**
 * Search news by title
 */
export const searchNewsByTitle = (query: string): Promise<News[]> => {
  return apiCall(
    axios.get(`${API_BASE_URL}${NEWS_PATH}/search/title`, {
      params: { query },
    })
  );
};

/**
 * Global search (title, authors, etc.)
 */
export const searchNewsEverywhere = (query: string): Promise<News[]> => {
  return apiCall(
    axios.get(`${API_BASE_URL}${NEWS_PATH}/search`, {
      params: { query },
    })
  );
};

export default {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  searchNewsByTitle,
  searchNewsEverywhere,
};
