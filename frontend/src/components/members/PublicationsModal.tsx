import { FC, useState, useEffect } from 'react';
import { Research } from '../../types';
import PublicationsList from '../publications/PublicationsList';
import { searchByAuthor, viewPdf, downloadPdf } from '../../api/research';
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
        onClose();
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

  const handleViewPdf = async (id: number) => {
    try {
      const pdfBlob = await viewPdf(id);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Error viewing PDF:', error);
    }
  };

  const handleDownloadPdf = async (id: number) => {
    try {
      const pdfBlob = await downloadPdf(id);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `publication_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  return (
    <div className="publications-modal-overlay">
      <div className="publications-modal">
        <button className="publications-modal-close" onClick={onClose}>
          &times;
        </button>
        <div className="publications-modal-content">
          <h2>Publications by {authorName}</h2>
          
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