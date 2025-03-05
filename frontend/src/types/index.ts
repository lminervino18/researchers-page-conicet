
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