// Base interfaces and types

// Pagination Parameters Interface
export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
}

// Base API Response Interface
export interface BaseApiResponse {
  success: boolean;
  message?: string;
}

// Flexible API Response Interface
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Paginated Response Interface
export interface PaginatedResponse<T> {
  success?: boolean;
  data?: T | T[] | { content?: T[] };
  content?: T[];
  message?: string;
  pagination?: PaginationParams;
}

// Flexible Paginated Response Interface
export interface FlexiblePaginatedResponse<T> {
  success: boolean;
  data: T | T[];
  content?: T[];
  message?: string;
  pagination: PaginationParams;
}

// Loading State Interface
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Search Filters Interfaces
export interface BaseSearchFilters {
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
}

// Research-related Interfaces and Enums

// Research Status Enum
export enum ResearchStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

// Main Research Interface
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

// Research DTO
export interface ResearchDTO {
  researchAbstract: string;
  authors: string[];
  links: string[];
}

// Research Filters Interface
export interface ResearchFilters extends BaseSearchFilters {
  author?: string;
}

// Research Metadata Interface
export interface ResearchMetadata {
  keywords: string[];
  category: string;
  status: ResearchStatus;
  lastModified: string;
}

// PDF File Interface
export interface PdfFile {
  file: File;
  name: string;
  size: number;
  type: string;
}

// Section Interface (for navigation or rendering)
export interface Section {
  id: string;
  title: string;
  ref: React.RefObject<HTMLElement | HTMLDivElement>;
}

// Analogy-related Interfaces

// Main Analogy Interface
export interface Analogy {
  id: number;
  title: string;
  content?: string;
  createdAt: string;
  authors: string[];
  links: string[];
}

// Analogy DTO
export interface AnalogyDTO {
  title: string;
  content?: string;
  authors: string[];
  links: string[];
}

// Analogy Filters Interface
export interface AnalogyFilters extends BaseSearchFilters {
  author?: string;
}

export interface Comment {
  id: number;
  content: string;
  userName: string;
  email: string;
  createdAt: string;
  analogyId: number;
}

// Utility Types

// Nullable type
export type Nullable<T> = T | null | undefined;

// Partial type for flexible updates
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Error Interface
export interface ApiError {
  message: string;
  code?: number;
  details?: Record<string, unknown>;
}

// Utility Class for Response Handling
export class ApiResponseHandler<T> {
  private response: PaginatedResponse<T>;

  constructor(response: PaginatedResponse<T>) {
    this.response = response;
  }

  getData(): T[] {
    // Robust data extraction
    if (Array.isArray(this.response.data)) {
      return this.response.data;
    }

    if (this.response.content && Array.isArray(this.response.content)) {
      return this.response.content;
    }

    if (this.response.data && typeof this.response.data === 'object' && 'content' in this.response.data) {
      const contentData = (this.response.data as { content?: T[] }).content;
      return contentData || [];
    }

    return [];
  }

  isSuccessful(): boolean {
    // Ensure a boolean is always returned
    return this.response.success ?? true;
  }

  getPagination(): PaginationParams {
    // Provide a default pagination if not present
    return this.response.pagination ?? {
      page: 0,
      limit: 10,
      total: 0
    };
  }

  getErrorMessage(): Nullable<string> {
    // Only return message if not successful
    return this.isSuccessful() ? null : this.response.message ?? 'Unknown error occurred';
  }
}