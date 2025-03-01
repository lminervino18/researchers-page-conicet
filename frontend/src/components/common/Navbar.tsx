import { FC } from 'react';
import { Section } from '../../types';
import '../../styles/components/common/Navbar.css';

interface NavbarProps {
  sections: Section[];
  onSectionClick: (ref: React.RefObject<HTMLElement>) => void;
}

const Navbar: FC<NavbarProps> = ({ sections, onSectionClick }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="navbar-brand">Analogy Research Group</h1>
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