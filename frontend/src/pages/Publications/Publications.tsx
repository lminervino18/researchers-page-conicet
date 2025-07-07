// src/pages/Publications/Publications.tsx
import { FC, useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import PublicationsList from '../../components/publications/PublicationsList';
import { Research } from '../../types';
import { getAllResearches} from '../../api/research';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import './styles/Publications.css';

const Publications: FC = () => {
  const [publications, setPublications] = useState<Research[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadPublications = async () => {
    try {
      setLoading(true);
      const response = await getAllResearches();
      setPublications(response.content);
      setError(null);
    } catch (err) {
      setError('Error loading publications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublications();
  }, []);

  const handlePdfView = (id: number) => {
  const publication = publications.find(p => p.id === id);
  if (publication?.pdfPath) {
    window.open(publication.pdfPath, '_blank');
  } else {
    setError('No PDF available for this publication');
  }
};

const handlePdfDownload = (id: number) => {
  const publication = publications.find(p => p.id === id);
  if (publication?.pdfPath) {
    const link = document.createElement('a');
    link.href = publication.pdfPath;
    link.setAttribute('download', `research-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } else {
    setError('No PDF available for this publication');
  }
};


  // Filtrar publicaciones basado en la búsqueda
  const filteredPublications = publications.filter(pub => 
    pub.researchAbstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pub.authors.some(author => author.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <MainLayout>
      <div className="publications-container">
        <div className="publications-header">
          <h1>Research Publications</h1>
          <div className="header-actions">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search publications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading publications...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <PublicationsList 
            publications={filteredPublications}
            onViewPdf={handlePdfView}
            onDownloadPdf={handlePdfDownload}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Publications;