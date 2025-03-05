// src/pages/Inbox/Inbox.tsx
import { FC } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInbox, faBell, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import './styles/Inbox.css';

const Inbox: FC = () => {
  return (
    <MainLayout>
      <div className="inbox-container">
        <section className="inbox-hero">
          <h1>Analogy Inbox</h1>
          <p className="hero-subtitle">
            Your central hub for research communications and updates
          </p>
        </section>

        <section className="info-section">
          <div className="info-card">
            <FontAwesomeIcon icon={faInbox} className="info-icon" />
            <h2>Message Center</h2>
            <p>
              The Analogy Inbox will serve as your personal communication center, 
              where you'll receive important updates about our research activities 
              and opportunities.
            </p>
          </div>

          <div className="info-card">
            <FontAwesomeIcon icon={faBell} className="info-icon" />
            <h2>Notifications</h2>
            <p>
              Stay informed about new publications, research opportunities, and 
              important announcements from our research group through our 
              upcoming notification system.
            </p>
          </div>

          <div className="info-card">
            <FontAwesomeIcon icon={faEnvelope} className="info-icon" />
            <h2>Direct Communications</h2>
            <p>
              Soon you'll be able to communicate directly with researchers and 
              receive personalized updates about studies you're interested in.
            </p>
          </div>
        </section>

        <section className="coming-soon">
          <h2>Features in Development</h2>
          <p>
            Our team is working on implementing these exciting features:
          </p>
          <ul>
            <li>Personalized message inbox</li>
            <li>Real-time notifications</li>
            <li>Research updates subscription</li>
            <li>Direct messaging with researchers</li>
          </ul>
        </section>
      </div>
    </MainLayout>
  );
};

export default Inbox;