import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import Section from '../common/Section';
import { Research } from '../../types';
import './styles/PublicationsList.css';
import { Link } from 'react-router-dom';

interface PublicationsListProps {
  publications: Research[];
}

const PublicationsList: FC<PublicationsListProps> = ({ publications }) => {
  const navigate = useNavigate();

  return (
    <Section title="Publications">
      <div className="publications-header">
        <button 
          className="add-publication-btn"
          onClick={() => navigate('/research/add')}
        >
          Add Research
        </button>
      </div>
      
      <div className="publications-list">
        {publications.length === 0 ? (
          <p className="no-publications">No publications yet</p>
        ) : (
          publications.map((publication) => (
            <div key={publication.id} className="publication-card">
              <p className="publication-abstract">
                {publication.researchAbstract}
              </p>
              <div className="publication-authors">
                {publication.authors.join(', ')}
              </div>
              <div className="publication-actions">
                <Link 
                  to={`/research/view/${publication.id}`}
                  className="view-btn"
                >
                  View PDF
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </Section>
  );
};

export default PublicationsList;