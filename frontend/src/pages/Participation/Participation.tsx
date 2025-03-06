// src/pages/Participation/Participation.tsx
import { FC } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlask, faUsers, faClipboardCheck } from '@fortawesome/free-solid-svg-icons';
import './styles/Participation.css';

const Participation: FC = () => {
  return (
    <MainLayout>
      <div className="participation-container">
        <section className="participation-hero">
          <h1>Research Studies Participation</h1>
          <p className="hero-subtitle">
            Join our research studies and contribute to the advancement of cognitive psychology
          </p>
        </section>

        <section className="info-section">
          <div className="info-card">
            <FontAwesomeIcon icon={faFlask} className="info-icon" />
            <h2>Current Studies</h2>
            <p>
              Our research studies are currently under development. Soon you'll be able 
              to participate in various experiments focused on analogical reasoning and 
              cognitive processes.
            </p>
          </div>

          <div className="info-card">
            <FontAwesomeIcon icon={faUsers} className="info-icon" />
            <h2>Who Can Participate</h2>
            <p>
              We welcome participants from diverse backgrounds. Our studies are designed 
              to be inclusive and accessible. Specific eligibility criteria will be 
              provided for each study.
            </p>
          </div>

          <div className="info-card">
            <FontAwesomeIcon icon={faClipboardCheck} className="info-icon" />
            <h2>How to Get Involved</h2>
            <p>
              While our participation platform is being developed, you can express your 
              interest in future studies by staying connected through our research group's 
              updates.
            </p>
          </div>
        </section>

        <section className="coming-soon">
          <h2>Coming Soon</h2>
          <p>
            We're working on creating an interactive platform where you can:
          </p>
          <ul>
            <li>Browse available studies</li>
            <li>Check eligibility criteria</li>
            <li>Sign up for participation</li>
            <li>Track your contribution</li>
          </ul>
        </section>
      </div>
    </MainLayout>
  );
};

export default Participation;