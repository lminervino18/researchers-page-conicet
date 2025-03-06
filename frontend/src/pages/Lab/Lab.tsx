// src/pages/Lab/Lab.tsx
import { FC, useState, useRef } from 'react';
import MainLayout from '../../layouts/MainLayout';
import './styles/Lab.css';

const Lab: FC = () => {
  const [activeDescription, setActiveDescription] = useState<string | null>(null);
  const timerRef = useRef<number | undefined>(undefined);

  const handleMouseEnter = (areaId: string) => {
    timerRef.current = window.setTimeout(() => {
      setActiveDescription(areaId);
    }, 2000);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
    setActiveDescription(null);
  };

  const researchAreas = [
    {
      id: 'analogical',
      title: 'Analogical Learning',
      shortDescription: 'Exploring how humans learn through analogical comparisons and transfers',
      fullDescription: 'Analogical learning is a fundamental cognitive process where new information is understood by comparing it to familiar concepts. Our research explores how people identify relevant similarities between situations and use them to solve new problems or acquire new knowledge.'
    },
    {
      id: 'memory',
      title: 'Memory',
      shortDescription: 'Investigating the mechanisms of human memory and retention',
      fullDescription: 'Memory research in our lab focuses on how information is encoded, stored, and retrieved. We study both short-term and long-term memory processes, with particular emphasis on how analogical thinking influences memory formation and recall.'
    },
    {
      id: 'cognitive',
      title: 'Cognitive Psychology',
      shortDescription: 'Studying mental processes including thinking, learning, and problem-solving',
      fullDescription: 'Our cognitive psychology research examines the fundamental mental processes that underlie human thought and behavior. We investigate how people perceive, process, store, and use information, with a special focus on analogical reasoning and decision-making.'
    }
  ];

  return (
    <MainLayout>
      <div className="lab-container">
        <section className="lab-hero">
          <h1>Research Laboratory</h1>
          <p>Advancing our understanding of human cognition through innovative research</p>
        </section>

        <section className="research-areas">
          <h2>Our Research Areas</h2>
          <div className="areas-grid">
            {researchAreas.map((area) => (
              <div
                key={area.id}
                className="area-card"
                onMouseEnter={() => handleMouseEnter(area.id)}
                onMouseLeave={handleMouseLeave}
              >
                <h3>{area.title}</h3>
                <p>{area.shortDescription}</p>
                {activeDescription === area.id && (
                  <div className="area-description">
                    <p>{area.fullDescription}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="lab-methodology">
          <h2>Our Methodology</h2>
          <p>
            We employ a combination of experimental and theoretical approaches, 
            using both behavioral studies and computational modeling to understand 
            cognitive processes in depth.
          </p>
        </section>
      </div>
    </MainLayout>
  );
};

export default Lab;