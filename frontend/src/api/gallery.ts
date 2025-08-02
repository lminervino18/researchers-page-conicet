import { GalleryImage } from "../types/index";

const API_BASE_URL = "http://localhost:8080/api";

export const createGalleryImage = async (formData: FormData) => {
  try {
    const response = await fetch("/api/gallery/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data; // Debe devolver un objeto con la URL de la imagen subida
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

/**
 * Fetch all gallery images
 * @returns Promise with the list of images
 */
export const getAllGalleryImages = async (): Promise<GalleryImage[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/gallery`);

    if (!response.ok) {
      throw new Error("Error al obtener las imágenes de la galería");
    }

    const data = await response.json();

    // Extraer el array de content
    const images = data.content;

    return images.map(({ url, legend }: { url: string; legend: string }) => ({
      src: url,
      alt: legend,
    }));
  } catch (error) {
    console.error("Error en la solicitud de galería:", error);
    throw error;
  }
};
