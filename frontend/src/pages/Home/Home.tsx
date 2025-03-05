// src/pages/home/Home.tsx
import { FC } from 'react';
import MainLayout from '../../layouts/MainLayout';
import landingImage from '../../assets/landing-page/landing-example.jpeg';
import './styles/Home.css';

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
                Exploring the cognitive processes of analogy and their applications in psychology
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
              We investigate how people understand and use analogies in reasoning, 
              learning, and problem-solving. Our work combines cognitive psychology, 
              experimental methods, and innovative approaches to understand these 
              fundamental mental processes.
            </p>
          </div>
        </section>

        {/* About Section */}
        <section className="about-section">
          <div className="about-content">
            <h2>About Our Lab</h2>
            <p>
              Based at the University of Buenos Aires, our research group is dedicated to 
              advancing our understanding of analogical reasoning and its applications. 
              Through rigorous research and innovative methodologies, we aim to contribute 
              to both theoretical knowledge and practical applications in cognitive psychology.
            </p>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Home;