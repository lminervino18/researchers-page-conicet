import axios from 'axios';
import { AxiosError } from 'axios';

// Define the base URL for the email verification API
const API_BASE_URL = 'http://localhost:8080/api/email-verification';

// Interfaces
interface EmailVerificationRequest {
  email: string;
}

interface EmailVerificationResponse {
  id: number;
  email: string;
  createdAt: Date;
  registered: boolean;
}

interface EmailRegistrationStatus {
  email: string;
  registered: boolean;
}

// Error handling utility
const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    console.error('API Error:', axiosError.response?.data);
    throw axiosError.response?.data || new Error('An unexpected error occurred');
  }
  throw error;
};

// Check if email is registered
export const checkEmailRegistration = async (email: string): Promise<boolean> => {
  try {
    const response = await axios.get<boolean>(`${API_BASE_URL}/check`, {
      params: { email }
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Register email for verification
export const registerEmail = async (email: string): Promise<EmailVerificationResponse> => {
  try {
    const requestData: EmailVerificationRequest = { email };
    const response = await axios.post<EmailVerificationResponse>(
      `${API_BASE_URL}/register`, 
      requestData, 
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Register multiple emails
export const registerMultipleEmails = async (emails: string[]): Promise<EmailVerificationResponse[]> => {
  try {
    const response = await axios.post<EmailVerificationResponse[]>(
      `${API_BASE_URL}/register-multiple`, 
      emails,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Get all registered emails
export const getAllRegisteredEmails = async (): Promise<string[]> => {
  try {
    const response = await axios.get<string[]>(`${API_BASE_URL}/all`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Remove email from verification
export const removeEmail = async (email: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/remove`, {
      params: { email }
    });
  } catch (error) {
    handleApiError(error);
  }
};

// Remove multiple emails
export const removeMultipleEmails = async (emails: string[]): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/remove-multiple`, {
      data: emails
    });
  } catch (error) {
    handleApiError(error);
  }
};

// Remove all emails
export const removeAllEmails = async (): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/all`);
  } catch (error) {
    handleApiError(error);
  }
};

// Count registered emails
export const countRegisteredEmails = async (): Promise<number> => {
  try {
    const response = await axios.get<number>(`${API_BASE_URL}/count`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Check registration status for multiple emails
export const checkEmailsRegistration = async (emails: string[]): Promise<EmailRegistrationStatus[]> => {
  try {
    const response = await axios.post<EmailRegistrationStatus[]>(
      `${API_BASE_URL}/check-registration`, 
      emails,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
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

export default {
  checkEmailRegistration,
  registerEmail,
  registerMultipleEmails,
  removeEmail,
  removeMultipleEmails,
  removeAllEmails,
  getAllRegisteredEmails,
  countRegisteredEmails,
  checkEmailsRegistration
};