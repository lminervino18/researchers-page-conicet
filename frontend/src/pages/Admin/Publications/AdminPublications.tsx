// pages/Admin/Publications/AdminPublications.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faEdit, faDownload, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Research } from '../../../types';
import { getAllResearches, deleteResearch, viewPdf, downloadPdf } from '../../../api/Research';
import './styles/AdminPublications.css';

const AdminPublications = () => {
  const navigate = useNavigate();
  const [publications, setPublications] = useState<Research[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPublications();
  }, []);

  const loadPublications = async () => {
    try {
      const response = await getAllResearches(0, 100);
      setPublications(response.content);
    } catch (error) {
      console.error('Error loading publications:', error);
      setError('Failed to load publications');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteResearch(id);
      setPublications(publications.filter(pub => pub.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting publication:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete publication');
    }
  };

  const handleViewPdf = async (id: number) => {
    try {
      const pdfBlob = await viewPdf(id);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    } catch (err) {
      console.error('Error viewing PDF:', err);
      setError('Failed to open PDF');
    }
  };

  const handleDownloadPdf = async (id: number) => {
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
      setError('Failed to download PDF');
    }
  };

  return (
    <div className="admin-page-container">
      <header className="admin-page-header">
        <button 
          onClick={() => navigate('/admin/dashboard')} 
          className="back-button"
        >
          Back to Dashboard
        </button>
        <h1>Publications Management</h1>
        <button 
          onClick={() => navigate('/admin/publications/add')} 
          className="add-button"
        >
          Add New Publication
        </button>
      </header>
      <main className="admin-page-content">
        {error && <div className="error-message">{error}</div>}
        
        {loading ? (
          <div className="loading">Loading publications...</div>
        ) : (
          <div className="admin-publications-list">
            {publications.length === 0 ? (
              <div className="no-publications">No publications available</div>
            ) : (
              publications.map((publication) => (
                <div key={publication.id} className="admin-publication-card">
                  <div className="publication-info">
                    <p className="publication-abstract">
                      {publication.researchAbstract.substring(0, 200)}
                      {publication.researchAbstract.length > 200 && '...'}
                    </p>
                    <p className="publication-authors">
                      Authors: {publication.authors.join(', ')}
                    </p>
                    {publication.links.length > 0 && (
                      <p className="publication-links">
                        Links: {publication.links.length}
                      </p>
                    )}
                  </div>
                  <div className="publication-actions">
                    <button
                      onClick={() => handleViewPdf(publication.id)}
                      className={`action-button ${!publication.pdfPath ? 'disabled' : ''}`}
                      title={publication.pdfPath ? "View PDF" : "No PDF available"}
                      disabled={!publication.pdfPath}
                    >
                      <FontAwesomeIcon icon={faFilePdf} />
                    </button>
                    <button
                      onClick={() => handleDownloadPdf(publication.id)}
                      className={`action-button ${!publication.pdfPath ? 'disabled' : ''}`}
                      title={publication.pdfPath ? "Download PDF" : "No PDF available"}
                      disabled={!publication.pdfPath}
                    >
                      <FontAwesomeIcon icon={faDownload} />
                    </button>
                    <button
                      onClick={() => navigate(`/admin/publications/edit/${publication.id}`)}
                      className="action-button"
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    {deleteConfirm === publication.id ? (
                      <div className="delete-confirm">
                        <p>Are you sure?</p>
                        <button
                          onClick={() => handleDelete(publication.id)}
                          className="confirm-button"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="cancel-button"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(publication.id)}
                        className="action-button delete"
                        title="Delete"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPublications;