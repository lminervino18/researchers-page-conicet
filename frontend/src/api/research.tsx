
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/researches';

export const fetchPublications = async (page = 0, size = 10) => {
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
    console.error('Error fetching publications:', error);
    throw error;
  }
};

export const searchPublications = async (query: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/search`, {
      params: { query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching publications:', error);
    throw error;
  }
};

export const downloadPdf = async (id: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/download/${id}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};

export const viewPdf = async (id: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/view/${id}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error viewing PDF:', error);
    throw error;
  }
};