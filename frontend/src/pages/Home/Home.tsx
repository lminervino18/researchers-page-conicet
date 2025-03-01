import { FC } from 'react';
import PublicationsList from '../../components/home/PublicationsList';
import Section from '../../components/common/Section';
import { Research } from '../../types';
import './styles/Home.css';

const Home: FC = () => {
  // Ejemplo de datos, luego se reemplazará con datos reales de la API
  const publications: Research[] = [];

  return (
    <div className="home-container">
      <Section title="Our Lab">
        <p>Descripción del laboratorio...</p>
      </Section>

      <Section title="Members">
        <p>Lista de miembros...</p>
      </Section>

      <PublicationsList publications={publications} />

      <Section title="Participation in Research Studies">
        <p>Información sobre participación...</p>
      </Section>

      <Section title="Analogie Inbox">
        <p>Información sobre Analogie Inbox...</p>
      </Section>
    </div>
  );
};

export default Home;