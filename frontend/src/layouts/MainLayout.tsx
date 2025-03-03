// src/layouts/MainLayout.tsx

import { FC, ReactNode } from 'react';
import Navbar from '../components/common/Navbar';
import { Section } from '../types';
import './styles/MainLayout.css';

interface MainLayoutProps {
  children: ReactNode;
  sections: Section[];
  onSectionClick: (ref: React.RefObject<HTMLElement>) => void;
}

const MainLayout: FC<MainLayoutProps> = ({ children, sections, onSectionClick }) => {
  return (
    <div className="layout-container">
      <Navbar sections={sections} onSectionClick={onSectionClick} />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;