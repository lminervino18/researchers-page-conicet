import axios from "axios";
import { ApiResponse, PaginatedResponse } from "../types/index";

const API_BASE_URL = "http://localhost:8080/api";

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
  commentData: CommentRequestDTO
): Promise<ApiResponse<Comment>> => {
  try {
    const response = await axios.post<ApiResponse<Comment>>(
      `${API_BASE_URL}/comments`,
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
    console.log("Fetching comments with parameters:", {
      analogyId,
      page,
      size,
    });

    const response = await axios.get<PaginatedResponse<Comment[]>>(
      `${API_BASE_URL}/analogies/${analogyId}/comments`,
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

    console.log("Comments Response:", {
      status: response.status,
      data: response.data,
    });

    if (!response.data) {
      console.error("Empty response received for comments");
      throw new Error("No data received from server");
    }

    return response.data;
  } catch (error) {
    console.error("Detailed error fetching comments:", {
      error,
      errorName: error instanceof Error ? error.name : "Unknown Error",
      errorMessage: error instanceof Error ? error.message : "No error message",
      errorStack: error instanceof Error ? error.stack : "No stack trace",
    });

    if (axios.isAxiosError(error)) {
      console.error("Axios Error Details:", {
        response: error.response,
        request: error.request,
        config: error.config,
        status: error.response?.status,
        data: error.response?.data,
      });
      if (error.response) {
        switch (error.response.status) {
          case 404:
            throw new Error(
              `Comments for Analogy with ID ${analogyId} not found`
            );
          case 500:
            throw new Error("Internal server error while fetching comments");
          default:
            throw new Error(
              error.response.data?.message ||
                "An error occurred while fetching comments"
            );
        }
      } else if (error.request) {
        throw new Error(
          "No response received from server when fetching comments"
        );
      }
    }

    throw new Error("Failed to fetch comments");
  }
};

export const updateComment = async (
  analogyId: number,
  commentId: number,
  commentData: CommentRequestDTO
): Promise<ApiResponse<Comment>> => {
  try {
    const response = await axios.put<ApiResponse<Comment>>(
      `${API_BASE_URL}/analogies/${analogyId}/comments/${commentId}`,
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
    await axios.delete(`${API_BASE_URL}/comments/${commentId}`);
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
      `${API_BASE_URL}/analogies/${analogyId}/comments/search`,
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
      `${API_BASE_URL}/analogies/${analogyId}/comments/search`,
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
      `${API_BASE_URL}/analogies/${analogyId}/comments/search`,
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
      `${API_BASE_URL}/comments/email-authorization`,
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

export default {
  createComment,
  getCommentsByAnalogy,
  updateComment,
  deleteComment,
  searchCommentsByUserName,
  searchCommentsByEmail,
  searchCommentsEverywhere,
  verifyEmailAuthorization,
};
