import axios from 'axios';

// Define the base URL for the API
const API_BASE_URL = 'http://localhost:8080/api/analogies';

// Get all analogies with pagination
export const getAllAnalogies = async (page = 0, size = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}`, {
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

// Search analogies
export const searchAnalogies = async (query: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/search`, {
      params: { query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching analogies:', error);
    throw error;
  }
};

// Get single analogy by ID
export const getAnalogyById = async (id: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching analogy:', error);
    throw error;
  }
};

// Create new analogy
export const createAnalogy = async (data: any) => {
  try {
    const response = await axios.post(API_BASE_URL, data, {
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

// Update existing analogy
export const updateAnalogy = async (id: number, data: any) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, data, {
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

// Delete analogy
export const deleteAnalogy = async (id: number) => {
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

// Search by title
export const searchByTitle = async (query: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/search/title`, {
      params: { query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching by title:', error);
    throw error;
  }
};

// Search by author
export const searchByAuthor = async (name: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/search/author`, {
      params: { name }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching by author:', error);
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
  searchByAuthor
};