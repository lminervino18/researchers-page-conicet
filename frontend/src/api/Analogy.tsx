import axios from 'axios';
import { 
  Analogy, 
  AnalogyDTO, 
  ApiResponse, 
  PaginatedResponse,
  AnalogyFilters
} from '../types/index';

// Base URL for the Analogies API
const API_BASE_URL = 'http://localhost:8080/api/analogies';

/**
 * Fetch all analogies with pagination
 * @param page - Page number (default: 0)
 * @param size - Number of items per page (default: 10)
 * @returns Paginated response of analogies
 */
export const getAllAnalogies = async (
  page = 0, 
  size = 10
): Promise<PaginatedResponse<Analogy[]>> => {
  try {
    const response = await axios.get<PaginatedResponse<Analogy[]>>(API_BASE_URL, {
      params: {
        page,
        size,
        sort: 'createdAt',
        direction: 'DESC'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching analogies:', error);
    throw error;
  }
};

/**
 * Search analogies globally
 * @param query - Search term
 * @returns API response with matching analogies
 */
export const searchAnalogies = async (
  query: string
): Promise<ApiResponse<Analogy[]>> => {
  try {
    const response = await axios.get<ApiResponse<Analogy[]>>(`${API_BASE_URL}/search`, {
      params: { query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching analogies:', error);
    throw error;
  }
};

/**
 * Fetch a single analogy by its ID
 * @param id - Analogy identifier
 * @returns API response with the analogy
 */
export const getAnalogyById = async (
  id: number
): Promise<Analogy> => {
  try {
    const response = await axios.get<Analogy>(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching analogy:', error);
    throw error;
  }
};


/**
 * Create a new analogy
 * @param data - Analogy data transfer object
 * @returns API response with the created analogy
 */
export const createAnalogy = async (
  data: AnalogyDTO
): Promise<ApiResponse<Analogy>> => {
  try {
    const response = await axios.post<ApiResponse<Analogy>>(API_BASE_URL, data, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating analogy:', error);
    throw error;
  }
};

/**
 * Update an existing analogy
 * @param id - Analogy identifier
 * @param data - Updated analogy data
 * @returns API response with the updated analogy
 */
export const updateAnalogy = async (
  id: number, 
  data: AnalogyDTO
): Promise<ApiResponse<Analogy>> => {
  try {
    const response = await axios.put<ApiResponse<Analogy>>(`${API_BASE_URL}/${id}`, data, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating analogy:', error);
    throw error;
  }
};

/**
 * Delete an analogy
 * @param id - Analogy identifier
 * @throws Error if deletion fails
 */
export const deleteAnalogy = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/${id}`);
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
 * @param query - Search term for title
 * @returns API response with matching analogies
 */
export const searchByTitle = async (
  query: string
): Promise<ApiResponse<Analogy[]>> => {
  try {
    const response = await axios.get<ApiResponse<Analogy[]>>(`${API_BASE_URL}/search/title`, {
      params: { query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching by title:', error);
    throw error;
  }
};

/**
 * Search analogies by author name
 * @param name - Author name to search for
 * @returns API response with matching analogies
 */
export const searchByAuthor = async (
  name: string
): Promise<ApiResponse<Analogy[]>> => {
  try {
    const response = await axios.get<ApiResponse<Analogy[]>>(`${API_BASE_URL}/search/author`, {
      params: { name }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching by author:', error);
    throw error;
  }
};

/**
 * Advanced search with multiple filters
 * @param filters - Search filters
 * @returns Paginated response with filtered analogies
 */
export const searchWithFilters = async (
  filters: AnalogyFilters
): Promise<PaginatedResponse<Analogy[]>> => {
  try {
    const response = await axios.get<PaginatedResponse<Analogy[]>>(`${API_BASE_URL}/search/advanced`, {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error('Error searching with filters:', error);
    throw error;
  }
};

/**
 * Add support to an analogy
 * @param analogyId - Analogy identifier
 * @param email - User email providing support
 * @returns API response with updated analogy
 */
export const addSupport = async (
  analogyId: number, 
  email: string
): Promise<ApiResponse<Analogy>> => {
  try {
    const response = await axios.post<ApiResponse<Analogy>>(
      `${API_BASE_URL}/${analogyId}/support`, 
      null, 
      {
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
 * @param analogyId - Analogy identifier
 * @param email - User email removing support
 * @returns API response with updated analogy
 */
export const removeSupport = async (
  analogyId: number, 
  email: string
): Promise<ApiResponse<Analogy>> => {
  try {
    const response = await axios.delete<ApiResponse<Analogy>>(
      `${API_BASE_URL}/${analogyId}/support`, 
      {
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
 * Verify if an email is verified
 * @param email - Email to verify
 * @returns Boolean indicating email verification status
 */
export const verifyEmail = async (
  email: string
): Promise<boolean> => {
  try {
    const response = await axios.get<boolean>(
      `${API_BASE_URL}/verify-email`, 
      {
        params: { email }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error verifying email:', error);
    throw error;
  }
};

// Default export with all methods
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
  verifyEmail
};