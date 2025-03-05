// src/layouts/MainLayout.tsx
import { FC, ReactNode } from 'react';
import Navbar from '../components/common/Navbar';
import './styles/MainLayout.css';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="layout-container">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} Analogy Research Group. All rights reserved.</p>
          <p>Department of Psychology - University of Buenos Aires</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;