import { FC, useState, useEffect } from 'react';
import { Research } from '../../types';
import PublicationsList from '../publications/PublicationsList';
import { searchByAuthor} from '../../api/research';
import './styles/PublicationsModal.css';

interface PublicationsModalProps {
  authorName: string;
  onClose: () => void;
}

const PublicationsModal: FC<PublicationsModalProps> = ({ authorName, onClose }) => {
  const [publications, setPublications] = useState<Research[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        setIsLoading(true);
        const fetchedPublications = await searchByAuthor(authorName);
        setPublications(fetchedPublications);
      } catch (err) {
        setError('Failed to fetch publications');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublications();

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose(); // Solo cierra este modal
      }
    };
  
    const handleClickOutside = (event: MouseEvent) => {
      const modal = document.querySelector('.publications-modal');
      if (modal && !modal.contains(event.target as Node)) {
        onClose();
      }
    };
  
    document.addEventListener('keydown', handleEscapeKey);
    document.addEventListener('mousedown', handleClickOutside);
  
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [authorName, onClose]);

  const handleViewPdf = (id: number) => {
  const publication = publications.find(p => p.id === id);
  if (publication?.pdfPath) {
    window.open(publication.pdfPath, '_blank');
  } else {
    console.error('No PDF URL found for this publication.');
  }
};

const handleDownloadPdf = (id: number) => {
  const publication = publications.find(p => p.id === id);
  if (publication?.pdfPath) {
    const link = document.createElement('a');
    link.href = publication.pdfPath;
    link.download = `publication_${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    console.error('No PDF URL found for this publication.');
  }
};


  return (
    <div className="publications-modal-overlay">
      <div className="publications-modal">
        <button className="publications-modal-close" onClick={onClose}>
          &times;
        </button>
        <div className="publications-modal-content">
          <h2>Publications of {authorName}</h2>
          
          {isLoading ? (
            <p className="loading-message">Loading publications...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : (
            <PublicationsList 
              publications={publications}
              onViewPdf={handleViewPdf}
              onDownloadPdf={handleDownloadPdf}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicationsModal;