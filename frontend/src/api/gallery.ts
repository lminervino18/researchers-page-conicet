import axios from "axios";
import {
  GalleryImage,
  GalleryImageRequestDTO,
  GalleryImageResponseDTO,
  PaginatedResponse,
} from "../types/index";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const GALLERY_PATH = "/gallery";

function fromDtoToGalleryImage(dto: GalleryImageResponseDTO): GalleryImage {
  console.debug("Transforming the gallery image: ", dto);
  return {
    src: dto.url,
    alt: dto.caption,
    createdAt: dto.createdAt,
  };
}

// TODO: Same as extractAnalogies
function getGalleryImages(data: unknown): GalleryImageResponseDTO[] {
  // Handle array of gallery images
  if (Array.isArray(data)) {
    // Check if it's an array of gallery images
    return data.every(
      (item) =>
        item && typeof item === "object" && "url" in item && "caption" in item
    )
      ? (data as GalleryImageResponseDTO[])
      : [];
  }

  // Handle object with content
  if (data && typeof data === "object") {
    // Check for content property
    if ("content" in data) {
      const content = (data as { content?: unknown }).content;

      // Validate content is an array of gallery images
      if (
        Array.isArray(content) &&
        content.every(
          (item) =>
            item &&
            typeof item === "object" &&
            "url" in item &&
            "caption" in item
        )
      ) {
        return content as GalleryImageResponseDTO[];
      }
    }

    // Check for data property
    if ("data" in data) {
      const innerData = (data as { data?: unknown }).data;

      // Validate inner data is an array of gallery images
      if (
        Array.isArray(innerData) &&
        innerData.every(
          (item) =>
            item &&
            typeof item === "object" &&
            "url" in item &&
            "caption" in item
        )
      ) {
        return innerData as GalleryImageResponseDTO[];
      }
    }
  }

  // Fallback to empty array
  return [];
}

export const createGalleryImage = async (
  data: GalleryImageRequestDTO
): Promise<GalleryImage | null> => {
  try {
    const response = await axios.post<GalleryImageResponseDTO>(
      `${API_BASE_URL}${GALLERY_PATH}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.debug(response);
    console.debug(response.data);

    return response.data ? fromDtoToGalleryImage(response.data) : null;
  } catch (error) {
    console.error("Error creating gallery image:", error);
    throw error;
  }
};

/**
 * Fetch all gallery images
 * @returns Promise with the list of images
 */
export const getAllGalleryImages = async (
  page = 0,
  size = 10
): Promise<GalleryImage[]> => {
  try {
    const response = await axios.get<PaginatedResponse<GalleryImage[]>>(
      `${API_BASE_URL}${GALLERY_PATH}`,
      {
        params: {
          page,
          size,
          sort: "createdAt",
          direction: "DESC",
        },
      }
    );

    const data = response.data;

    const images: GalleryImageResponseDTO[] = getGalleryImages(data);

    return images.map(fromDtoToGalleryImage);
  } catch (error) {
    console.error("Error getting all the gallery images:", error);
    throw error;
  }
};

export const updateGalleryImage = async (
  url: string,
  caption: string
): Promise<GalleryImage | null> => {
  try {
    const response = await axios.patch<GalleryImageResponseDTO>(
      `${API_BASE_URL}${GALLERY_PATH}/by-url?url=${encodeURIComponent(url)}`,
      { caption },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data ? fromDtoToGalleryImage(response.data) : null;
  } catch (error) {
    console.error("Error updating gallery image:", error);
    throw error;
  }
};

export const deleteGalleryImage = async (url: string): Promise<void> => {
  try {
    await axios.delete<GalleryImageResponseDTO>(
      `${API_BASE_URL}${GALLERY_PATH}/by-url?url=${encodeURIComponent(url)}`
    );
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 500) {
        throw new Error(
          "Internal server error while deleting gallery image. Please try again."
        );
      } else if (error.response?.status === 404) {
        throw new Error("GalleryImage not found.");
      }
    }
    throw error;
  }
};
