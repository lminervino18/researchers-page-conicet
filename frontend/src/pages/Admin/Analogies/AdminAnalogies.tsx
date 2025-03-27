import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

import { Analogy } from '../../../types';
import { getAllAnalogies, deleteAnalogy } from '../../../api/Analogy';
import './styles/AdminAnalogies.css';

const AdminAnalogys: React.FC = () => {
  const navigate = useNavigate();
  
  const [analogies, setAnalogies] = useState<Analogy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAnalogies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAllAnalogies(0, 100);
      
      // Robust data extraction with type guards
      const extractAnalogies = (data: unknown): Analogy[] => {
        // Handle array of analogies
        if (Array.isArray(data)) {
          // Check if it's an array of analogies
          return data.every(item => 
            item && typeof item === 'object' && 'id' in item && 'title' in item
          ) 
            ? data as Analogy[] 
            : [];
        }

        // Handle object with content
        if (data && typeof data === 'object') {
          // Check for content property
          if ('content' in data) {
            const content = (data as { content?: unknown }).content;
            
            // Validate content is an array of analogies
            if (Array.isArray(content) && content.every(item => 
              item && typeof item === 'object' && 'id' in item && 'title' in item
            )) {
              return content as Analogy[];
            }
          }

          // Check for data property
          if ('data' in data) {
            const innerData = (data as { data?: unknown }).data;
            
            // Validate inner data is an array of analogies
            if (Array.isArray(innerData) && innerData.every(item => 
              item && typeof item === 'object' && 'id' in item && 'title' in item
            )) {
              return innerData as Analogy[];
            }
          }
        }

        // Fallback to empty array
        return [];
      };

      // Extract and set analogies
      const extractedAnalogies = extractAnalogies(response);
      setAnalogies(extractedAnalogies);

    } catch (error) {
      console.error('Error loading analogies:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to load analogies. Please try again.';
      
      setError(errorMessage);
      setAnalogies([]); 
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger initial data load
  useEffect(() => {
    loadAnalogies();
  }, [loadAnalogies]);

  // Memoized delete handler to prevent unnecessary re-renders
  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteAnalogy(id);
      
      // Use functional update for state to ensure latest state
      setAnalogies(prevAnalogies => 
        prevAnalogies.filter(analogy => analogy.id !== id)
      );
      
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting analogy:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to delete analogy. Please try again.';
      
      setError(errorMessage);
    }
  }, []);

  // Render methods
  const renderAnalogiesList = () => {
    if (loading) {
      return <div className="loading">Loading analogies...</div>;
    }

    if (error) {
      return <div className="error-message">{error}</div>;
    }

    if (analogies.length === 0) {
      return <div className="no-analogies">No analogies available</div>;
    }

    return analogies.map((analogy) => (
      <AnalogiesListItem
        key={analogy.id}
        analogy={analogy}
        deleteConfirm={deleteConfirm}
        onEditClick={() => navigate(`/admin/analogies/edit/${analogy.id}`)}
        onDeleteConfirmToggle={() => setDeleteConfirm(
          deleteConfirm === analogy.id ? null : analogy.id
        )}
        onDeleteConfirm={() => handleDelete(analogy.id)}
      />
    ));
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
        <div className="admin-analogies-list">
          {renderAnalogiesList()}
        </div>
      </main>
    </div>
  );
};

// Separate component for list item to improve performance and readability
interface AnalogiesListItemProps {
  analogy: Analogy;
  deleteConfirm: number | null;
  onEditClick: () => void;
  onDeleteConfirmToggle: () => void;
  onDeleteConfirm: () => void;
}

const AnalogiesListItem: React.FC<AnalogiesListItemProps> = React.memo(({
  analogy, 
  deleteConfirm, 
  onEditClick, 
  onDeleteConfirmToggle, 
  onDeleteConfirm
}) => (
  <div className="admin-analogy-card">
    <div className="analogy-info">
      <p className="analogy-admin-title">{analogy.title}</p>
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
        onClick={onEditClick}
        className="action-button"
        title="Edit"
      >
        <FontAwesomeIcon icon={faEdit} />
      </button>
      {deleteConfirm === analogy.id ? (
        <div className="delete-confirm">
          <p>Are you sure?</p>
          <button
            onClick={onDeleteConfirm}
            className="confirm-button"
          >
            Yes
          </button>
          <button
            onClick={onDeleteConfirmToggle}
            className="cancel-button"
          >
            No
          </button>
        </div>
      ) : (
        <button
          onClick={onDeleteConfirmToggle}
          className="action-button delete"
          title="Delete"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      )}
    </div>
  </div>
));

export default AdminAnalogys;