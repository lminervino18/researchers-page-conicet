import { FC, useEffect, useState } from "react";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "./styles/AdminGallery.css";

import photos from "../../../utils/photos";
import { useNavigate } from "react-router-dom";
import Masonry from "react-masonry-css";
import { getAllGalleryImages } from "../../../api/gallery";
import { Photo } from "react-photo-album";

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
  const [images, setImages] = useState<Photo[]>(photos);
  const [selectedImage, setSelectedImage] = useState<Photo | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [newAlt, setNewAlt] = useState("");

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      const images = await getAllGalleryImages(); // will be used later
    } catch (error) {
      console.error("Error loading images:", error);
      setError("Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoClick = (image: Photo) => {
    setSelectedImage(image);
  };

  const handleUpdateAlt = () => {
    if (selectedImage) {
      const updatedPhotos = images.map((image) =>
        image.src === selectedImage.src ? { ...image, alt: newAlt } : image
      );

      setImages(updatedPhotos);
      setEditMode(false);
      setNewAlt("");
      setSelectedImage(null);

      // Should call to backend api
      console.log("Updating alt:", newAlt);
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
        <button
          onClick={() => navigate("/admin/publications/add")}
          className="add-button"
        >
          Add New Image
        </button>
      </header>
      <main className="admin-page-content">
        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading publications...</div>
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
                  onClick={() => handlePhotoClick(image)}
                >
                  <img
                    src={image.src}
                    alt={image.alt || `Photo ${index + 1}`}
                    loading="lazy"
                  />
                  <div className="photo-overlay">
                    <p>{image.alt || `Photo ${index + 1}`}</p>
                  </div>
                  {selectedImage?.src === image.src && (
                    <div className="photo-actions">
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
          <div className="edit-modal">
            <div className="edit-modal-content">
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
    </div>
  );
};

export default AdminGallery;
