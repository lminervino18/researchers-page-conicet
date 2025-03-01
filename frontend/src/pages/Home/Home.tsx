// src/pages/home/Home.tsx

import { FC, useRef, useCallback, useEffect, useState } from 'react';
import Section from '../../components/common/Section';
import MainLayout from '../../layouts/MainLayout';
import { Research, Section as SectionType } from '../../types';
import PublicationsList from '../../components/home/PublicationsList';
import { fetchPublications } from '../../api/research'; // Crearemos este archivo
import './styles/Home.css';

const Home: FC = () => {
  const [publications, setPublications] = useState<Research[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Referencias para las secciones
  const labRef = useRef<HTMLElement>(null);
  const membersRef = useRef<HTMLElement>(null);
  const publicationsRef = useRef<HTMLDivElement>(null);
  const participationRef = useRef<HTMLElement>(null);
  const inboxRef = useRef<HTMLElement>(null);

  // Función para manejar el scroll
  const handleSectionClick = useCallback((ref: React.RefObject<HTMLElement | HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Cargar publicaciones
  useEffect(() => {
    const loadPublications = async () => {
      try {
        setLoading(true);
        const response = await fetchPublications();
        setPublications(response.content); // Asumiendo que la respuesta tiene un campo 'content'
        setError(null);
      } catch (err) {
        setError('Error al cargar las publicaciones');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPublications();
  }, []);

  // Prevenir scroll manual
  useEffect(() => {
    const preventDefault = (e: WheelEvent) => {
      e.preventDefault();
    };

    document.addEventListener('wheel', preventDefault, { passive: false });
    
    return () => {
      document.removeEventListener('wheel', preventDefault);
    };
  }, []);

  const sections: Array<SectionType> = [
    { 
      id: 'lab', 
      title: 'Our Lab', 
      ref: labRef as React.RefObject<HTMLElement | HTMLDivElement>
    },
    { 
      id: 'members', 
      title: 'Members', 
      ref: membersRef as React.RefObject<HTMLElement | HTMLDivElement>
    },
    { 
      id: 'publications', 
      title: 'Publications', 
      ref: publicationsRef as React.RefObject<HTMLElement | HTMLDivElement>
    },
    { 
      id: 'participation', 
      title: 'Research Studies', 
      ref: participationRef as React.RefObject<HTMLElement | HTMLDivElement>
    },
    { 
      id: 'inbox', 
      title: 'Analogie Inbox', 
      ref: inboxRef as React.RefObject<HTMLElement | HTMLDivElement>
    }
  ];

  return (
    <MainLayout sections={sections} onSectionClick={handleSectionClick}>
      <div className="home-container">
        <Section title="Our Lab" ref={labRef}>
          <p>Descripción del laboratorio...</p>
        </Section>

        <Section title="Members" ref={membersRef}>
          <p>Lista de miembros...</p>
        </Section>

        <div className="publications-section" ref={publicationsRef}>
          <div className="publications-container">
            <h2>Publications</h2>
            {loading ? (
              <p>Cargando publicaciones...</p>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : (
              <PublicationsList publications={publications} />
            )}
          </div>
        </div>

        <Section title="Participation in Research Studies" ref={participationRef}>
          <p>Información sobre participación...</p>
        </Section>

        <Section title="Analogie Inbox" ref={inboxRef}>
          <p>Información sobre Analogie Inbox...</p>
        </Section>
      </div>
    </MainLayout>
  );
};

export default Home;