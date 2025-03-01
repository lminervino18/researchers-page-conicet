import { forwardRef } from 'react';
import '../../styles/components/common/style/SSectiSeimportonection.css';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Section = forwardRef<HTMLElement, SectionProps>(
  ({ title, children, className = '' }, ref) => {
    return (
      <section ref={ref} className={`section ${className}`}>
        <div className="section-container">
          <h2 className="section-title">{title}</h2>
          <div className="section-content">
            {children}
          </div>
        </div>
      </section>
    );
  }
);

export default Section;