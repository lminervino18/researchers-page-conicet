import axios from 'axios';
import { 
  Analogy, 
  AnalogyDTO, 
  ApiResponse, 
  PaginatedResponse,
  AnalogyFilters
} from '../types/index';

const API_BASE_URL = 'http://localhost:8080/api'; // base url from env, e.g. 'http://localhost:8080/api'
const ANALOGIES_PATH = '/analogies';

/**
 * Fetch all analogies with pagination
 */
export const getAllAnalogies = async (
  page = 0, 
  size = 10
): Promise<PaginatedResponse<Analogy[]>> => {
  try {
    const response = await axios.get<PaginatedResponse<Analogy[]>>(
      `${API_BASE_URL}${ANALOGIES_PATH}`, {
        params: {
          page,
          size,
          sort: 'createdAt',
          direction: 'DESC'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching analogies:', error);
    throw error;
  }
};

/**
 * Search analogies globally
 */
export const searchAnalogies = async (
  query: string
): Promise<ApiResponse<Analogy[]>> => {
  try {
    const response = await axios.get<ApiResponse<Analogy[]>>(
      `${API_BASE_URL}${ANALOGIES_PATH}/search`, {
        params: { query }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error searching analogies:', error);
    throw error;
  }
};

/**
 * Fetch a single analogy by its ID
 */
export const getAnalogyById = async (
  id: number
): Promise<Analogy> => {
  try {
    const response = await axios.get<Analogy>(
      `${API_BASE_URL}${ANALOGIES_PATH}/${id}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching analogy:', error);
    throw error;
  }
};

/**
 * Create a new analogy
 */
export const createAnalogy = async (
  data: AnalogyDTO
): Promise<ApiResponse<Analogy>> => {
  try {
    const response = await axios.post<ApiResponse<Analogy>>(
      `${API_BASE_URL}${ANALOGIES_PATH}`, data, {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating analogy:', error);
    throw error;
  }
};

/**
 * Update an existing analogy
 */
export const updateAnalogy = async (
  id: number, 
  data: AnalogyDTO
): Promise<ApiResponse<Analogy>> => {
  try {
    const response = await axios.put<ApiResponse<Analogy>>(
      `${API_BASE_URL}${ANALOGIES_PATH}/${id}`, data, {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating analogy:', error);
    throw error;
  }
};

/**
 * Delete an analogy
 */
export const deleteAnalogy = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}${ANALOGIES_PATH}/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 500) {
        throw new Error('Internal server error while deleting analogy. Please try again.');
      } else if (error.response?.status === 404) {
        throw new Error('Analogy not found.');
      }
    }
    throw new Error('Failed to delete analogy');
  }
};

/**
 * Search analogies by title
 */
export const searchByTitle = async (
  query: string
): Promise<ApiResponse<Analogy[]>> => {
  try {
    const response = await axios.get<ApiResponse<Analogy[]>>(
      `${API_BASE_URL}${ANALOGIES_PATH}/search/title`, {
        params: { query }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error searching by title:', error);
    throw error;
  }
};

/**
 * Search analogies by author name
 */
export const searchByAuthor = async (
  name: string
): Promise<ApiResponse<Analogy[]>> => {
  try {
    const response = await axios.get<ApiResponse<Analogy[]>>(
      `${API_BASE_URL}${ANALOGIES_PATH}/search/author`, {
        params: { name }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error searching by author:', error);
    throw error;
  }
};

/**
 * Advanced search with multiple filters
 */
export const searchWithFilters = async (
  filters: AnalogyFilters
): Promise<PaginatedResponse<Analogy[]>> => {
  try {
    const response = await axios.get<PaginatedResponse<Analogy[]>>(
      `${API_BASE_URL}${ANALOGIES_PATH}/search/advanced`, {
        params: filters
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error searching with filters:', error);
    throw error;
  }
};

/**
 * Add support to an analogy
 */
export const addSupport = async (
  analogyId: number, 
  email: string
): Promise<ApiResponse<Analogy>> => {
  try {
    const response = await axios.post<ApiResponse<Analogy>>(
      `${API_BASE_URL}${ANALOGIES_PATH}/${analogyId}/support`, 
      null, {
        params: { email }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding support:', error);
    throw error;
  }
};

/**
 * Remove support from an analogy
 */
export const removeSupport = async (
  analogyId: number, 
  email: string
): Promise<ApiResponse<Analogy>> => {
  try {
    const response = await axios.delete<ApiResponse<Analogy>>(
      `${API_BASE_URL}${ANALOGIES_PATH}/${analogyId}/support`, {
        params: { email }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error removing support:', error);
    throw error;
  }
};

/**
 * Get support count for an analogy
 */
export const getSupportCount = async (
  analogyId: number
): Promise<number> => {
  try {
    const response = await axios.get<number>(
      `${API_BASE_URL}${ANALOGIES_PATH}/${analogyId}/support-count`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting support count:', error);
    throw error;
  }
};

/**
 * Check if a user has supported an analogy
 */
export const checkUserSupport = async (
  analogyId: number, 
  email: string
): Promise<boolean> => {
  try {
    const response = await axios.get<boolean>(
      `${API_BASE_URL}${ANALOGIES_PATH}/${analogyId}/has-supported`, {
        params: { email }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error checking user support:', error);
    throw error;
  }
};

export default {
  getAllAnalogies,
  searchAnalogies,
  getAnalogyById,
  createAnalogy,
  updateAnalogy,
  deleteAnalogy,
  searchByTitle,
  searchByAuthor,
  searchWithFilters,
  addSupport,
  removeSupport,
  getSupportCount,
  checkUserSupport,
};
