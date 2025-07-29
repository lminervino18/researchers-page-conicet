import axios from "axios";
import {
  News,
  NewsDTO,
  ApiResponse,
  PaginatedResponse,
} from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const NEWS_PATH = "/news";

/**
 * Fetch all news with pagination
 */
export const getAllNews = async (
  page = 0,
  size = 10
): Promise<PaginatedResponse<News[]>> => {
  try {
    const response = await axios.get<PaginatedResponse<News[]>>(
      `${API_BASE_URL}${NEWS_PATH}`,
      {
        params: {
          page,
          size,
          sort: "createdAt",
          direction: "DESC",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching news:", error);
    throw error;
  }
};

/**
 * Fetch a single news article by ID
 */
export const getNewsById = async (id: number): Promise<News> => {
  try {
    const response = await axios.get<News>(
      `${API_BASE_URL}${NEWS_PATH}/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching news by ID:", error);
    throw error;
  }
};

/**
 * Create a new news article
 */
export const createNews = async (
  data: NewsDTO
): Promise<ApiResponse<News>> => {
  try {
    const response = await axios.post<ApiResponse<News>>(
      `${API_BASE_URL}${NEWS_PATH}`,
      data,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating news:", error);
    throw error;
  }
};

/**
 * Update an existing news article
 */
export const updateNews = async (
  id: number,
  data: NewsDTO
): Promise<ApiResponse<News>> => {
  try {
    const response = await axios.put<ApiResponse<News>>(
      `${API_BASE_URL}${NEWS_PATH}/${id}`,
      data,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating news:", error);
    throw error;
  }
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
export const searchNewsByTitle = async (
  query: string
): Promise<ApiResponse<News[]>> => {
  try {
    const response = await axios.get<ApiResponse<News[]>>(
      `${API_BASE_URL}${NEWS_PATH}/search/title`,
      {
        params: { query },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error searching news by title:", error);
    throw error;
  }
};

/**
 * Global search (title, authors, etc.)
 */
export const searchNewsEverywhere = async (
  query: string
): Promise<ApiResponse<News[]>> => {
  try {
    const response = await axios.get<ApiResponse<News[]>>(
      `${API_BASE_URL}${NEWS_PATH}/search`,
      {
        params: { query },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error in global news search:", error);
    throw error;
  }
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
