// src/components/common/Navbar.tsx

import { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { Section } from '../../types';
import './styles/Navbar.css';

interface NavbarProps {
  sections: Section[];
  onSectionClick: (ref: React.RefObject<HTMLElement>) => void;
}

const Navbar: FC<NavbarProps> = ({ sections, onSectionClick }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <FontAwesomeIcon icon={faLightbulb} className="navbar-logo" />
          <h1>Analogy Research Group</h1>
        </div>
        <div className="navbar-links">
          {sections.map((section) => (
            <button
              key={section.id}
              className="navbar-link"
              onClick={() => onSectionClick(section.ref)}
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