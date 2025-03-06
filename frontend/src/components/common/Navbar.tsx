// src/components/common/Navbar.tsx
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import './styles/Navbar.css';

const Navbar: FC = () => {
  const navigate = useNavigate();

  const sections = [
    { id: 'lab', title: 'Our Lab', path: '/lab' },
    { id: 'members', title: 'Members', path: '/members' },
    { id: 'publications', title: 'Publications', path: '/publications' },
    { id: 'participation', title: 'Experiment Participations', path: '/participation' },
    { id: 'inbox', title: 'Analogy Inbox', path: '/inbox' }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div 
          className="navbar-brand"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        >
          <FontAwesomeIcon icon={faLightbulb} className="navbar-logo" />
          <h1>Analogy Research Group</h1>
        </div>
        <div className="navbar-links">
          {sections.map((section) => (
            <button
              key={section.id}
              className="navbar-link"
              onClick={() => navigate(section.path)}
            >
              {section.title}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;