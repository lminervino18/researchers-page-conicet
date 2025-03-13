
// Interfaz principal para los datos de investigación
export interface Research {
  id: number;
  researchAbstract: string;
  mimeType: string;
  pdfSize: number;
  pdfName: string;
  pdfPath: string;
  createdAt: string;
  authors: string[];
  links: string[];
}

export interface Section {
  id: string;
  title: string;
  ref: React.RefObject<HTMLElement | HTMLDivElement>;
}

// DTO para crear/actualizar una investigación
export interface ResearchDTO {
  researchAbstract: string;
  authors: string[];
  links: string[];
}

// Interfaz para la respuesta de la API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Interfaz para el estado de carga
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Interfaz para los filtros de búsqueda
export interface ResearchFilters {
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
  author?: string;
}

// Interfaz para la paginación
export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
}

// Interfaz para la respuesta paginada
export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: PaginationParams;
}

// Interfaz para el archivo PDF
export interface PdfFile {
  file: File;
  name: string;
  size: number;
  type: string;
}

// Enums para estados de la investigación
export enum ResearchStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

// Interfaz para los metadatos de la investigación
export interface ResearchMetadata {
  keywords: string[];
  category: string;
  status: ResearchStatus;
  lastModified: string;
}

// src/types/member.ts
export interface Member {
  id: number;
  name: string;
  lastName: string;
  email: string;
  institution: string;
  position: string;
  imageUrl: string;
}

// Main interface for analogy data
export interface Analogy {
  id: number; // Unique identifier for the analogy
  title: string; // Title of the analogy
  content?: string; // Optional content or description of the analogy
  createdAt: string; // Timestamp of when the analogy was created
  authors: string[]; // List of authors associated with the analogy
  links: string[]; // List of related links for the analogy
}

// DTO for creating/updating an analogy
export interface AnalogyDTO {
  title: string; // Title of the analogy (required)
  content?: string; // Optional content or description
  authors: string[]; // List of authors
  links: string[]; // List of related links
}

// Generic interface for API responses
export interface ApiResponse<T> {
  success: boolean; // Indicates if the API request was successful
  data: T; // The data returned from the API
  message?: string; // Optional message from the API
}

// Interface for loading state
export interface LoadingState {
  isLoading: boolean; // Indicates if a request is currently loading
  error: string | null; // Error message if the request failed
}

// Interface for analogy search filters
export interface AnalogyFilters {
  searchTerm?: string; // Optional search term for filtering analogies
  startDate?: string; // Optional start date for filtering
  endDate?: string; // Optional end date for filtering
  author?: string; // Optional author name for filtering
}

// Interface for pagination parameters
export interface PaginationParams {
  page: number; // Current page number
  limit: number; // Number of items per page
  total: number; // Total number of items available
}

// Interface for paginated API responses
export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: PaginationParams; // Pagination details
}