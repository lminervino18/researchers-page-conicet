/**
 * Pagination parameters for API requests
 * @interface PaginationParams
 */
export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
}

/**
 * Base API response structure
 * @interface BaseApiResponse
 */
export interface BaseApiResponse {
  success: boolean;
  message?: string;
}

/**
 * Generic API response with typed data
 * @interface ApiResponse
 * @template T - Type of response data
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Paginated response interface supporting multiple data structures
 * @interface PaginatedResponse
 * @template T - Type of response data
 */
export interface PaginatedResponse<T> {
  success?: boolean;
  data?: T | T[] | { content?: T[] };
  content?: T[];
  message?: string;
  pagination?: PaginationParams;
}

/**
 * Flexible paginated response with strict typing
 * @interface FlexiblePaginatedResponse
 * @template T - Type of response data
 */
export interface FlexiblePaginatedResponse<T> {
  success: boolean;
  data: T | T[];
  content?: T[];
  message?: string;
  pagination: PaginationParams;
}

/**
 * Loading state management interface
 * @interface LoadingState
 */
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Base search filters for API queries
 * @interface BaseSearchFilters
 */
export interface BaseSearchFilters {
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Research status enumeration
 * @enum ResearchStatus
 */
export enum ResearchStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

/**
 * Research entity interface
 * @interface Research
 */
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

/**
 * Data Transfer Object for creating/updating research
 * @interface ResearchDTO
 */
export interface ResearchDTO {
  researchAbstract: string;
  authors: string[];
  links: string[];
}

/**
 * Research-specific search filters
 * @interface ResearchFilters
 */
export interface ResearchFilters extends BaseSearchFilters {
  author?: string;
}

/**
 * Research metadata interface
 * @interface ResearchMetadata
 */
export interface ResearchMetadata {
  keywords: string[];
  category: string;
  status: ResearchStatus;
  lastModified: string;
}

/**
 * Section interface for navigation or rendering
 * @interface Section
 */
export interface Section {
  id: string;
  title: string;
  ref: React.RefObject<HTMLElement | HTMLDivElement>;
}

export interface MediaLink {
  url: string;
  mediaType: string;
}

/**
 * Analogy entity interface
 * @interface Analogy
 */
export interface Analogy {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  authors: string[];
  links: string[];
  mediaLinks: MediaLink[]; 
}

/**
 * Data Transfer Object for creating/updating analogy
 * @interface AnalogyDTO
 */
export interface AnalogyDTO {
  title: string;
  content: string;
  authors: string[];
  links: string[];
  mediaLinks: MediaLink[]; // Array of media links with URL and type
}

/**
 * Analogy-specific search filters
 * @interface AnalogyFilters
 */
export interface AnalogyFilters extends BaseSearchFilters {
  author?: string;
}

/**
 * Comment entity interface
 * @interface Comment
 */
export interface Comment {
  id: number;
  content: string;
  userName: string;
  email: string;
  createdAt: string;
  analogyId: number;
  parentId?: number;
  replies?: Comment[]; // Added for nested comments support
  childrenCount?: number; // Optional count of child comments
}

/**
 * Data Transfer Object for creating a comment
 * @interface CommentRequestDTO
 */
export interface CommentRequestDTO {
  content: string;
  userName: string;
  email: string;
  analogyId: number;
  parentId?: number;
}

/**
 * Response Data Transfer Object for comments
 * @interface CommentResponseDTO
 */
export interface CommentResponseDTO extends Comment {
  children?: Comment[];
  childrenCount?: number;
}

/**
 * Utility type for nullable values
 * @type Nullable
 */
export type Nullable<T> = T | null | undefined;

/**
 * Utility type for partial updates
 * @type PartialBy
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * API error representation
 * @interface ApiError
 */
export interface ApiError {
  message: string;
  code?: number;
  details?: Record<string, unknown>;
}

/**
 * Utility class for handling API responses
 * @class ApiResponseHandler
 * @template T - Type of response data
 */
export class ApiResponseHandler<T> {
  private response: PaginatedResponse<T>;

  /**
   * Constructor
   * @param response - Paginated API response
   */
  constructor(response: PaginatedResponse<T>) {
    this.response = response;
  }

  /**
   * Extract data from response with robust handling
   * @returns Array of data items
   */
  getData(): T[] {
    // Robust data extraction logic
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

  /**
   * Check if the response was successful
   * @returns Boolean indicating success status
   */
  isSuccessful(): boolean {
    return this.response.success ?? true;
  }

  /**
   * Get pagination information
   * @returns Pagination parameters
   */
  getPagination(): PaginationParams {
    return this.response.pagination ?? {
      page: 0,
      limit: 10,
      total: 0
    };
  }

  /**
   * Get error message if response was not successful
   * @returns Error message or null
   */
  getErrorMessage(): Nullable<string> {
    return this.isSuccessful() ? null : this.response.message ?? 'Unknown error occurred';
  }
}