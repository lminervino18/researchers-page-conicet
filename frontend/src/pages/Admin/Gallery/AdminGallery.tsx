import { FC, useEffect, useRef, useState } from "react";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "./styles/AdminGallery.css";

import { useNavigate } from "react-router-dom";
import Masonry from "react-masonry-css";
import {
  createGalleryImage,
  getAllGalleryImages,
  updateGalleryImage,
} from "../../../api/gallery";
import { Photo } from "react-photo-album";
import { uploadFile } from "../../../api/firebaseUploader";
import { GalleryImageRequestDTO } from "../../../types";

const breakpointColumns = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1,
};

const AdminGallery: FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<Photo[]>([]);
  const [selectedImage, setSelectedImage] = useState<Photo | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [newAlt, setNewAlt] = useState("");

  // Upload image modal states
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadAlt, setUploadAlt] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const galleryRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadGallery();
    const handleClickOutside = (event: MouseEvent) => {
      if (
        galleryRef.current &&
        !galleryRef.current.contains(event.target as Node) &&
        !editMode
      ) {
        setSelectedImage(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editMode]);

  const loadGallery = async () => {
    try {
      console.debug("fetching all gallery images");
      const images = await getAllGalleryImages(); // will be used later
      setImages(
        images.map((image) => ({ src: image.src, alt: image.alt } as Photo))
      );
    } catch (error) {
      console.error("Error loading images:", error);
      setError("Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (image: Photo, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImage(image);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileUpload = async () => {
    console.debug("Uploading new image!");
    if (!selectedFile) {
      setUploadError("Please select an image");
      return;
    }

    setUploadLoading(true);
    setUploadError(null);

    try {
      const url: string = await uploadFile(selectedFile);
      const galleryImageRequest: GalleryImageRequestDTO = {
        url,
        legend: uploadAlt,
      };

      // Call backend and firbase apis to store the new image
      console.debug("Creating the new GalleryImage!");
      const uploadedImage = await createGalleryImage(galleryImageRequest);
      // TODO: print message warning image wasn’t uploaded?
      if (uploadedImage) {
        // Add image to gallery
        setImages((prev) => [
          ...prev,
          {
            src: uploadedImage.src,
            alt: uploadedImage.alt,
          } as Photo,
        ]);
        console.debug("Image uploaded");
      }

      // Reset states
      setUploadModalOpen(false);
      setSelectedFile(null);
      setUploadAlt("");
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadError("Failed to upload image");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleUpdateAlt = async () => {
    if (selectedImage) {
      const updatedPhotos = images.map((image) =>
        image.src === selectedImage.src ? { ...image, alt: newAlt } : image
      );

      // Should call to backend api
      console.log("Updating alt:", newAlt);
      await updateGalleryImage(selectedImage.src, newAlt);

      setImages(updatedPhotos);
      setEditMode(false);
      setNewAlt("");
      setSelectedImage(null);
    }
  };

  const handleDeleteImage = () => {
    if (selectedImage) {
      const updatedPhotos = images.filter(
        (image) => image.src !== selectedImage.src
      );

      setImages(updatedPhotos);
      setSelectedImage(null);

      // Should call to backend api
      console.log("Deleting image:", selectedImage.src);
    }
  };

  return (
    <div className="admin-page-container">
      <header className="admin-page-header">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="back-button"
        >
          Back to Dashboard
        </button>
        <h1>Gallery Management</h1>
        <button onClick={() => setUploadModalOpen(true)} className="add-button">
          Add New Image
        </button>
      </header>
      <main className="admin-page-content" ref={galleryRef}>
        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading images...</div>
        ) : (
          <div className="gallery-content">
            <Masonry
              breakpointCols={breakpointColumns}
              className="masonry-grid"
              columnClassName="masonry-grid_column"
            >
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`masonry-item ${
                    selectedImage?.src === image.src ? "selected" : ""
                  }`}
                  onClick={(e) => handleImageClick(image, e)}
                >
                  <img
                    src={image.src}
                    alt={image.alt || `Photo ${index + 1}`}
                    loading="lazy"
                  />
                  <div className="image-overlay">
                    <p>{image.alt || `Photo ${index + 1}`}</p>
                  </div>
                  {selectedImage?.src === image.src && (
                    <div className="image-actions">
                      <button
                        className="edit-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditMode(true);
                          setNewAlt(image.alt || "");
                        }}
                      >
                        Edit Label
                      </button>
                      <button
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage();
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </Masonry>
          </div>
        )}

        {/* Legend editing modal */}
        {editMode && selectedImage && (
          <div
            className="edit-modal"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setEditMode(false);
                setNewAlt("");
              }
            }}
          >
            <div
              className="edit-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Edit Image Label</h2>
              <input
                type="text"
                value={newAlt}
                onChange={(e) => setNewAlt(e.target.value)}
                placeholder="New label"
              />
              <div className="edit-modal-actions">
                <button onClick={handleUpdateAlt}>Save</button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setNewAlt("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Upload image modal */}
      {uploadModalOpen && (
        <div className="upload-modal" onClick={() => setUploadModalOpen(false)}>
          <div
            className="upload-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Upload New Image</h2>

            <div className="file-input-container">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                style={{ display: "none" }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="select-file-btn"
              >
                {selectedFile ? selectedFile.name : "Select Image"}
              </button>
            </div>

            <input
              type="text"
              value={uploadAlt}
              onChange={(e) => setUploadAlt(e.target.value)}
              placeholder="Image description (optional)"
              className="alt-input"
            />

            {uploadError && <div className="upload-error">{uploadError}</div>}

            <div className="upload-modal-actions">
              <button
                onClick={handleFileUpload}
                disabled={!selectedFile || uploadLoading}
                className="confirm-btn"
              >
                {uploadLoading ? "Uploading..." : "Confirm"}
              </button>
              <button
                onClick={() => {
                  setUploadModalOpen(false);
                  setSelectedFile(null);
                  setUploadAlt("");
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
