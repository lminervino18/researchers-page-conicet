// src/pages/home/Home.tsx
import { FC, useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import landingImage from "../../assets/landing-page/landing-example.jpeg";
import "./styles/Home.css";
import Masonry from "react-masonry-css";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { GalleryImage } from "../../types";
import { getAllGalleryImages } from "../../api/gallery";

import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";

const breakpointColumns = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1,
};

const Home: FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [showFullGallery, setShowFullGallery] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (showFullGallery) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [showFullGallery]);

  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        setIsLoading(true);
        const fetchedImages = await getAllGalleryImages();
        setImages(fetchedImages);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching gallery images:", err);
        setError("Error loading images");
        setIsLoading(false);
      }
    };

    fetchGalleryImages();
  }, []);

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading gallery...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="home-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Welcome to Analogy Research Group</h1>
              <p className="hero-subtitle">
                Exploring the cognitive processes of analogy and their
                applications in psychology
              </p>
            </div>
            <div className="hero-image">
              <img src={landingImage} alt="Research laboratory visualization" />
            </div>
          </div>
        </section>

        {/* Featured Research */}
        <section className="featured-section">
          <div className="featured-content">
            <h2>Our Research Focus</h2>
            <p>
              We investigate how people understand and use analogies in
              reasoning, learning, and problem-solving. Our work combines
              cognitive psychology, experimental methods, and innovative
              approaches to understand these fundamental mental processes.
            </p>
          </div>
        </section>

        {/* About Section */}
        <section className="about-section">
          <div className="about-content">
            <h2>About Our Lab</h2>
            <p>
              Based at the University of Buenos Aires, our research group is
              dedicated to advancing our understanding of analogical reasoning
              and its applications. Through rigorous research and innovative
              methodologies, we aim to contribute to both theoretical knowledge
              and practical applications in cognitive psychology.
            </p>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="gallery-section">
          <div className="gallery-content">
            <h2>Lab Gallery</h2>
            <p>Explore our research environment and team activities</p>
            <div className="gallery-preview-container">
              <div className="gallery-preview">
                <Masonry
                  breakpointCols={breakpointColumns}
                  className="masonry-grid"
                  columnClassName="masonry-grid_column"
                >
                  {images.map((image) => (
                    <div key={image.src} className="masonry-item">
                      <img src={image.src} alt={image.alt} loading="lazy" />
                      <div className="image-overlay">
                        <p>{image.alt}</p>
                      </div>
                    </div>
                  ))}
                </Masonry>
              </div>
              <div className="gallery-gradient-overlay">
                <button
                  className="view-more-button"
                  onClick={() => setShowFullGallery(true)}
                  aria-label="View more"
                >
                  <span>More</span>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Full Gallery Modal */}
      {showFullGallery && (
        <div
          className="gallery-modal"
          onClick={() => setShowFullGallery(false)}
        >
          <div
            className="gallery-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-button"
              onClick={() => setShowFullGallery(false)}
              aria-label="Close Gallery"
            >
              ×
            </button>
            <h2>Full Gallery</h2>
            <div className="gallery-modal-scroll">
              <Masonry
                breakpointCols={breakpointColumns}
                className="masonry-grid"
                columnClassName="masonry-grid_column"
              >
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="masonry-item clickable"
                    onClick={() => handleImageClick(index)}
                  >
                    <img
                      src={image.src}
                      alt={image.alt || `Photo ${index + 1}`}
                      loading="lazy"
                    />
                    <div className="image-overlay">
                      <p>{image.alt || `Photo ${index + 1}`}</p>
                    </div>
                  </div>
                ))}
              </Masonry>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={images}
        plugins={[Fullscreen, Zoom, Thumbnails]}
        thumbnails={{
          position: "bottom",
          width: 120,
          height: 80,
          border: 2,
          borderRadius: 4,
          padding: 4,
          gap: 16,
        }}
        zoom={{
          maxZoomPixelRatio: 3,
          zoomInMultiplier: 2,
        }}
      />
    </MainLayout>
  );
};

export default Home;
