// src/components/publications/PublicationsList.tsx
import { FC, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faLink, faTimes, faDownload } from '@fortawesome/free-solid-svg-icons';
import { Research } from '../../types';
import './styles/PublicationsList.css';

interface PublicationsListProps {
  publications: Research[];
  onViewPdf: (id: number) => void;
  onDownloadPdf: (id: number) => void;
}

const PublicationsList: FC<PublicationsListProps> = ({ 
  publications, 
  onViewPdf,
  onDownloadPdf 
}) => {
  const [activeSourcesId, setActiveSourcesId] = useState<number | null>(null);

  const toggleSources = (id: number) => {
    setActiveSourcesId(activeSourcesId === id ? null : id);
  };

  return (
    <div className="publications-list">
      {publications.length === 0 ? (
        <p className="no-publications">No publications available</p>
      ) : (
        publications.map((publication) => (
          <div key={publication.id} className="publication-card">
            <div className="publication-content">
              <p className="publication-abstract">{publication.researchAbstract}</p>
              <p className="publication-authors">{publication.authors.join(', ')}</p>
              <div className="publication-actions">
                <button 
                  className="action-button pdf-button"
                  onClick={() => onViewPdf(publication.id)}
                  title="View PDF"
                >
                  <FontAwesomeIcon icon={faFilePdf} />
                </button>
                <button 
                  className="action-button download-button"
                  onClick={() => onDownloadPdf(publication.id)}
                  title="Download PDF"
                >
                  <FontAwesomeIcon icon={faDownload} />
                </button>
                <button 
                  className="action-button sources-button"
                  onClick={() => toggleSources(publication.id)}
                  title="View Sources"
                >
                  <FontAwesomeIcon icon={faLink} />
                </button>
              </div>
            </div>
            
            {activeSourcesId === publication.id && (
              <div className="sources-modal">
                <div className="sources-content">
                  <div className="sources-header">
                    <h3>Sources</h3>
                    <button 
                      className="close-button"
                      onClick={() => setActiveSourcesId(null)}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                  <ul className="sources-list">
                    {publication.links.map((source, index) => (
                      <li key={index}>
                        <a href={source} target="_blank" rel="noopener noreferrer">
                          {source}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default PublicationsList;