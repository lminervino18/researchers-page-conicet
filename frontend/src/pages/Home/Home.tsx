// src/pages/home/Home.tsx
import { FC } from "react";
import MainLayout from "../../layouts/MainLayout";
import landingImage from "../../assets/landing-page/landing-example.jpeg";
import "./styles/Home.css";
import photos from "../../utils/photos";
import Masonry from "react-masonry-css";

const breakpointColumns = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1,
};

const Home: FC = () => {
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
            <Masonry
              breakpointCols={breakpointColumns}
              className="masonry-grid"
              columnClassName="masonry-grid_column"
            >
              {photos.map((photo, index) => (
                <div key={index} className="masonry-item">
                  <img
                    src={photo.src}
                    alt={photo.alt || `Photo ${index + 1}`}
                    loading="lazy"
                  />
                  <div className="photo-overlay">
                    <p>{photo.alt || `Photo ${index + 1}`}</p>
                  </div>
                </div>
              ))}
            </Masonry>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Home;
