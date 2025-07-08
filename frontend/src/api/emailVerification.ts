import axios, { AxiosError } from "axios";

const API_BASE_URL =
  (import.meta.env.API_BASE_URL || "http://localhost:8080/api") +
  "/email-verification";

interface EmailVerificationRequest {
  email: string;
}

interface EmailVerificationResponse {
  email: string;
  username: string | null;
  createdAt: string;
  registered: boolean;
}

interface EmailRegistrationStatus {
  email: string;
  registered: boolean;
}

const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    console.error("API Error:", axiosError.response?.data);
    throw (
      axiosError.response?.data || new Error("An unexpected error occurred")
    );
  }
  throw error;
};

export const checkEmailRegistration = async (
  email: string
): Promise<EmailVerificationResponse> => {
  try {
    const response = await axios.get<EmailVerificationResponse>(
      `${API_BASE_URL}/check`,
      {
        params: { email },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const registerEmail = async (
  email: string
): Promise<EmailVerificationResponse> => {
  try {
    const requestData: EmailVerificationRequest = { email };
    const response = await axios.post<EmailVerificationResponse>(
      `${API_BASE_URL}/register`,
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const updateUserName = async (
  email: string,
  newUsername: string
): Promise<void> => {
  try {
    await axios.patch(
      `${API_BASE_URL}/${encodeURIComponent(email)}/update-username`,
      null,
      {
        params: { newUsername },
      }
    );
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const registerMultipleEmails = async (
  emails: string[]
): Promise<EmailVerificationResponse[]> => {
  try {
    const response = await axios.post<EmailVerificationResponse[]>(
      `${API_BASE_URL}/register-multiple`,
      emails,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getAllRegisteredEmails = async (): Promise<string[]> => {
  try {
    const response = await axios.get<string[]>(`${API_BASE_URL}/all`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const removeEmail = async (email: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/remove`, {
      params: { email },
    });
  } catch (error) {
    handleApiError(error);
  }
};

export const removeMultipleEmails = async (emails: string[]): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/remove-multiple`, {
      data: emails,
    });
  } catch (error) {
    handleApiError(error);
  }
};

export const removeAllEmails = async (): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/all`);
  } catch (error) {
    handleApiError(error);
  }
};

export const countRegisteredEmails = async (): Promise<number> => {
  try {
    const response = await axios.get<number>(`${API_BASE_URL}/count`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const checkEmailsRegistration = async (
  emails: string[]
): Promise<EmailRegistrationStatus[]> => {
  try {
    const response = await axios.post<EmailRegistrationStatus[]>(
      `${API_BASE_URL}/check-registration`,
      emails,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export default {
  checkEmailRegistration,
  registerEmail,
  updateUserName,
  registerMultipleEmails,
  getAllRegisteredEmails,
  removeEmail,
  removeMultipleEmails,
  removeAllEmails,
  countRegisteredEmails,
  checkEmailsRegistration,
};
