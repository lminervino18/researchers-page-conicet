// src/pages/Publications/Publications.tsx
import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import PublicationsList from '../../components/publications/PublicationsList';
import { Research } from '../../types';
import { fetchPublications, viewPdf, downloadPdf } from '../../api/research';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import './styles/Publications.css';

const Publications: FC = () => {
  const [publications, setPublications] = useState<Research[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const loadPublications = async () => {
    try {
      setLoading(true);
      const response = await fetchPublications();
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

  const handlePdfView = async (id: number) => {
    try {
      const pdfBlob = await viewPdf(id);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    } catch (err) {
      console.error('Error viewing PDF:', err);
    }
  };

  const handlePdfDownload = async (id: number) => {
    try {
      const pdfBlob = await downloadPdf(id);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `research-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF:', err);
    }
  };

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
            <button 
              className="add-publication-button"
              onClick={() => navigate('/research/add')}
            >
              <FontAwesomeIcon icon={faPlus} /> Add Research
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading publications...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <PublicationsList 
            publications={publications}
            onViewPdf={handlePdfView}
            onDownloadPdf={handlePdfDownload}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Publications;