// pages/Admin/Analogies/AdminAnalogys.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Analogy } from '../../../types';
import { getAllAnalogies, deleteAnalogy } from '../../../api/analogy';
import './styles/AdminAnalogies.css';

const AdminAnalogys = () => {
  const navigate = useNavigate();
  const [analogies, setAnalogies] = useState<Analogy[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalogies();
  }, []);

  const loadAnalogies = async () => {
    try {
      const response = await getAllAnalogies(0, 100);
      setAnalogies(response.content);
    } catch (error) {
      console.error('Error loading analogies:', error);
      setError('Failed to load analogies');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAnalogy(id);
      setAnalogies(analogies.filter(analogy => analogy.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting analogy:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete analogy');
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
        <h1>Analogies Management</h1>
        <button 
          onClick={() => navigate('/admin/analogies/add')} 
          className="add-button"
        >
          Add New Analogy
        </button>
      </header>
      <main className="admin-page-content">
        {error && <div className="error-message">{error}</div>}
        
        {loading ? (
          <div className="loading">Loading analogies...</div>
        ) : (
          <div className="admin-analogies-list">
            {analogies.length === 0 ? (
              <div className="no-analogies">No analogies available</div>
            ) : (
              analogies.map((analogy) => (
                <div key={analogy.id} className="admin-analogy-card">
                  <div className="analogy-info">
                    <p className="analogy-title">
                      {analogy.title}
                    </p>
                    <p className="analogy-authors">
                      Authors: {analogy.authors.join(', ')}
                    </p>
                    {analogy.links.length > 0 && (
                      <p className="analogy-links">
                        Links: {analogy.links.length}
                      </p>
                    )}
                  </div>
                  <div className="analogy-actions">
                    <button
                      onClick={() => navigate(`/admin/analogies/edit/${analogy.id}`)}
                      className="action-button"
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    {deleteConfirm === analogy.id ? (
                      <div className="delete-confirm">
                        <p>Are you sure?</p>
                        <button
                          onClick={() => handleDelete(analogy.id)}
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
                        onClick={() => setDeleteConfirm(analogy.id)}
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

export default AdminAnalogys;