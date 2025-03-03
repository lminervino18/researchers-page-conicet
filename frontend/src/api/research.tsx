import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/researches';

// Configuración específica para PDF
const pdfApi = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
  headers: {
    'Accept': 'application/pdf',
    'Content-Type': 'application/pdf'
  }
});

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

export const getResearchById = async (id: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching research:', error);
    throw error;
  }
};

export const viewPdf = async (id: number) => {
  try {
    const response = await pdfApi.get(`/api/researches/view/${id}`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error viewing PDF:', error);
    throw error;
  }
};

export const downloadPdf = async (id: number) => {
  try {
    const response = await pdfApi.get(`/api/researches/download/${id}`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};