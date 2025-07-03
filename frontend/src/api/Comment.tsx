import axios from "axios";
import { ApiResponse, PaginatedResponse } from "../types/index";

// Base API URL from environment variable or fallback
const API_BASE_URL = "http://localhost:8080/api";
const ANALOGIES_PATH = "/analogies";
const COMMENTS_PATH = "/comments";

export interface Comment {
  id: number;
  content: string;
  userName: string;
  email: string;
  createdAt: string;
  analogyId: number;
  parentId?: number;
}

export interface CommentRequestDTO {
  content: string;
  userName: string;
  email: string;
  parentId?: number;
}

export const createComment = async (
  analogyId: number,
  commentData: CommentRequestDTO
): Promise<ApiResponse<Comment>> => {
  try {
    const response = await axios.post<ApiResponse<Comment>>(
      `${API_BASE_URL}${ANALOGIES_PATH}/${analogyId}${COMMENTS_PATH}`,
      commentData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
};

export const getCommentsByAnalogy = async (
  analogyId: number,
  page = 0,
  size = 10
): Promise<PaginatedResponse<Comment[]>> => {
  try {
    const response = await axios.get<PaginatedResponse<Comment[]>>(
      `${API_BASE_URL}${ANALOGIES_PATH}/${analogyId}${COMMENTS_PATH}`,
      {
        params: {
          page,
          size,
          sort: "createdAt",
          direction: "DESC",
        },
        timeout: 10000,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};

export const updateComment = async (
  analogyId: number,
  commentId: number,
  commentData: CommentRequestDTO
): Promise<ApiResponse<Comment>> => {
  try {
    const response = await axios.put<ApiResponse<Comment>>(
      `${API_BASE_URL}${ANALOGIES_PATH}/${analogyId}${COMMENTS_PATH}/${commentId}`,
      commentData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating comment:", error);
    throw error;
  }
};

export const deleteComment = async (commentId: number): Promise<void> => {
  try {
    // Notice: This endpoint is not nested under analogy,
    // so we just use base + /comments/:id
    await axios.delete(`${API_BASE_URL}${COMMENTS_PATH}/${commentId}`);
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};

export const searchCommentsByUserName = async (
  analogyId: number,
  userName: string
): Promise<ApiResponse<Comment[]>> => {
  try {
    const response = await axios.get<ApiResponse<Comment[]>>(
      `${API_BASE_URL}${ANALOGIES_PATH}/${analogyId}${COMMENTS_PATH}/search`,
      {
        params: { userName },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error searching comments by user name:", error);
    throw error;
  }
};

export const searchCommentsByEmail = async (
  analogyId: number,
  email: string
): Promise<ApiResponse<Comment[]>> => {
  try {
    const response = await axios.get<ApiResponse<Comment[]>>(
      `${API_BASE_URL}${ANALOGIES_PATH}/${analogyId}${COMMENTS_PATH}/search`,
      {
        params: { email },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error searching comments by email:", error);
    throw error;
  }
};

export const searchCommentsEverywhere = async (
  analogyId: number,
  term: string
): Promise<ApiResponse<Comment[]>> => {
  try {
    const response = await axios.get<ApiResponse<Comment[]>>(
      `${API_BASE_URL}${ANALOGIES_PATH}/${analogyId}${COMMENTS_PATH}/search`,
      {
        params: { term },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error searching comments:", error);
    throw error;
  }
};

export const verifyEmailAuthorization = async (
  email: string
): Promise<boolean> => {
  try {
    const response = await axios.get<boolean>(
      `${API_BASE_URL}${COMMENTS_PATH}/email-authorization`,
      {
        params: { email },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error verifying email authorization:", error);
    throw error;
  }
};



export const addSupportToComment = async (
  commentId: number,
  email: string
): Promise<ApiResponse<Comment>> => {
  try {
    const response = await axios.post<ApiResponse<Comment>>(
      `${API_BASE_URL}${COMMENTS_PATH}/${commentId}/support`,
      null,
      {
        params: { email },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding support to comment:", error);
    throw error;
  }
};

export const removeSupportFromComment = async (
  commentId: number,
  email: string
): Promise<ApiResponse<Comment>> => {
  try {
    const response = await axios.delete<ApiResponse<Comment>>(
      `${API_BASE_URL}${COMMENTS_PATH}/${commentId}/support`,
      {
        params: { email },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error removing support from comment:", error);
    throw error;
  }
};

export const getSupportCountForComment = async (
  commentId: number
): Promise<number> => {
  try {
    const response = await axios.get<number>(
      `${API_BASE_URL}${COMMENTS_PATH}/${commentId}/support-count`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting support count for comment:", error);
    throw error;
  }
};

export const hasEmailSupportedComment = async (
  commentId: number,
  email: string
): Promise<boolean> => {
  try {
    const response = await axios.get<boolean>(
      `${API_BASE_URL}${COMMENTS_PATH}/${commentId}/has-supported`,
      {
        params: { email },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error checking if email has supported comment:", error);
    throw error;
  }
};


export default {
  createComment,
  getCommentsByAnalogy,
  updateComment,
  deleteComment,
  searchCommentsByUserName,
  searchCommentsByEmail,
  searchCommentsEverywhere,
  verifyEmailAuthorization,
  addSupportToComment,
  removeSupportFromComment,
  getSupportCountForComment,
  hasEmailSupportedComment,
};
