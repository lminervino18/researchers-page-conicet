import axios from 'axios';
import { ResearchDTO } from '../types';

// Use environment variable for API base URL (fallback to localhost if not provided)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

// Define the research URL endpoint
const RESEARCH_URL = '/research';

// Get all publications with pagination
export const getAllResearches = async (page = 0, size = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${RESEARCH_URL}`, {
      params: {
        page,
        size,
        sort: 'createdAt',
        direction: 'DESC'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching publications:', error);
    throw error;
  }
};

// Search publications
export const searchPublications = async (query: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${RESEARCH_URL}/search`, {
      params: { query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching publications:', error);
    throw error;
  }
};

// Get single research by ID
export const getResearchById = async (id: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${RESEARCH_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching research:', error);
    throw error;
  }
};

// Create new research
export const createResearch = async (data: ResearchDTO & { pdfPath?: string }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}${RESEARCH_URL}`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating research:', error);
    throw error;
  }
};

// Update existing research
export const updateResearch = async (id: number, data: ResearchDTO & { pdfPath?: string }) => {
  try {
    const response = await axios.put(`${API_BASE_URL}${RESEARCH_URL}/${id}`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating research:', error);
    throw error;
  }
};

// Delete research
export const deleteResearch = async (id: number) => {
  try {
    await axios.delete(`${API_BASE_URL}${RESEARCH_URL}/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 500) {
        throw new Error('Internal server error while deleting research. Please try again.');
      } else if (error.response?.status === 404) {
        throw new Error('Research not found.');
      }
    }
    throw new Error('Failed to delete research');
  }
};

// Search by abstract
export const searchByAbstract = async (query: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${RESEARCH_URL}/search/abstract`, {
      params: { query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching by abstract:', error);
    throw error;
  }
};

// Search by author
export const searchByAuthor = async (name: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${RESEARCH_URL}/search/author`, {
      params: { name }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching by author:', error);
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
  searchByAbstract,
  searchByAuthor
};
