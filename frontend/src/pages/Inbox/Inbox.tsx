// src/pages/Inbox/Inbox.tsx
import { FC } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLightbulb, 
  faComments, 
  faThumbsUp, 
  faMagnifyingGlass 
} from '@fortawesome/free-solid-svg-icons';
import './styles/Inbox.css';

const Inbox: FC = () => {
  return (
    <MainLayout>
      <div className="inbox-container">
        <section className="inbox-hero">
          <h1>Analogy Inbox</h1>
          <p className="hero-subtitle">
            A collaborative space to explore, discuss and analyze analogies in cognitive research
          </p>
        </section>

        <section className="info-section">
          <div className="info-card">
            <FontAwesomeIcon icon={faLightbulb} className="info-icon" />
            <h2>Share Analogies</h2>
            <p>
              Discover and share interesting analogies found during research. 
              Our team members regularly post new analogical connections they've 
              identified, providing fresh perspectives on cognitive processes.
            </p>
          </div>

          <div className="info-card">
            <FontAwesomeIcon icon={faComments} className="info-icon" />
            <h2>Engage in Discussions</h2>
            <p>
              Participate in meaningful debates about posted analogies. 
              Share your insights, challenge assumptions, and contribute to 
              the collective understanding of analogical reasoning.
            </p>
          </div>

          <div className="info-card">
            <FontAwesomeIcon icon={faThumbsUp} className="info-icon" />
            <h2>Support Ideas</h2>
            <p>
              Endorse compelling analogies and valuable discussions. 
              Your support helps highlight the most insightful contributions 
              and fosters a collaborative research environment.
            </p>
          </div>
        </section>

        <section className="features-section">
          <h2>Explore Analogical Thinking</h2>
          <div className="features-content">
            <div className="feature-item">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="feature-icon" />
              <div className="feature-text">
                <h3>Coming Soon</h3>
                <ul>
                  <li>Post and share your own analogical findings</li>
                  <li>Engage in threaded discussions with fellow researchers</li>
                  <li>Vote and highlight insightful analogies</li>
                  <li>Filter and search through analogy categories</li>
                  <li>Receive notifications about topics you're interested in</li>
                  <li>Create collaborative collections of related analogies</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="purpose-section">
          <h2>Why Analogy Inbox?</h2>
          <p>
            Understanding analogies is crucial in cognitive psychology research. 
            This platform provides a dedicated space where researchers can share, 
            discuss, and analyze analogies discovered during their work. By 
            fostering collaborative discussion and analysis, we aim to deepen 
            our understanding of analogical reasoning and its role in human cognition.
          </p>
        </section>
      </div>
    </MainLayout>
  );
};

export default Inbox;