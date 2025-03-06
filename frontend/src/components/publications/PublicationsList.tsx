// src/components/publications/PublicationsList.tsx
import { FC, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faLink, faDownload } from '@fortawesome/free-solid-svg-icons';
import { Research } from '../../types';
import SourcesModal from '../common/SourcesModal';
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

  return (
    <div className="publications-list">
      {publications.length === 0 ? (
        <p className="no-publications">No publications available</p>
      ) : (
        publications.map((publication) => (
          <div key={publication.id} className="publication-card">
            <div className="publication-content">
              <div className="publication-main">
                <p className="publication-abstract">{publication.researchAbstract}</p>
                <p className="publication-authors">{publication.authors.join(', ')}</p>
              </div>
              <div className="publication-actions">
                <button 
                  className="action-button"
                  onClick={() => onViewPdf(publication.id)}
                  title="View PDF"
                >
                  <FontAwesomeIcon icon={faFilePdf} />
                </button>
                <button 
                  className="action-button"
                  onClick={() => onDownloadPdf(publication.id)}
                  title="Download PDF"
                >
                  <FontAwesomeIcon icon={faDownload} />
                </button>
                <button 
                  className="action-button"
                  onClick={() => setActiveSourcesId(publication.id)}
                  title="View Sources"
                >
                  <FontAwesomeIcon icon={faLink} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
      
      {activeSourcesId && (
        <SourcesModal
          sources={publications.find(p => p.id === activeSourcesId)?.links || []}
          onClose={() => setActiveSourcesId(null)}
        />
      )}
    </div>
  );
};

export default PublicationsList;