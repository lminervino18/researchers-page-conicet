import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

import { getAllNews, deleteNews } from '../../../api/news';
import { News } from '../../../types';
import './styles/AdminNews.css';

const AdminNews: React.FC = () => {
  const navigate = useNavigate();

  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAllNews(0, 100);
      
      const extractNews = (data: any): News[] => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.content)) return data.content;
        if (Array.isArray(data?.data)) return data.data;
        if (Array.isArray(data?.data?.content)) return data.data.content;
        return [];
        };

        setNewsList(extractNews(response));


    } catch (err) {
      console.error('Error loading news:', err);
      setError('Failed to load news. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteNews(id);
      setNewsList(prev => prev.filter(item => item.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting news:', err);
      setError('Failed to delete news. Please try again.');
    }
  }, []);

  const renderNewsList = () => {
    if (loading) return <div className="loading">Loading news...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (newsList.length === 0) return <div className="no-news">No news articles available</div>;

    return newsList.map(news => (
      <NewsListItem
        key={news.id}
        news={news}
        deleteConfirm={deleteConfirm}
        onEditClick={() => navigate(`/admin/news/edit/${news.id}`)}
        onDeleteConfirmToggle={() =>
          setDeleteConfirm(deleteConfirm === news.id ? null : news.id)
        }
        onDeleteConfirm={() => handleDelete(news.id)}
      />
    ));
  };

  return (
    <div className="admin-page-container">
      <header className="admin-page-header">
        <button onClick={() => navigate('/admin/dashboard')} className="back-button">
          Back to Dashboard
        </button>
        <h1>News Management</h1>
        <button onClick={() => navigate('/admin/news/add')} className="add-button">
          Add New Article
        </button>
      </header>
      <main className="admin-page-content">
        <div className="admin-news-list">
          {renderNewsList()}
        </div>
      </main>
    </div>
  );
};

interface NewsListItemProps {
  news: News;
  deleteConfirm: number | null;
  onEditClick: () => void;
  onDeleteConfirmToggle: () => void;
  onDeleteConfirm: () => void;
}

const NewsListItem: React.FC<NewsListItemProps> = React.memo(({
  news,
  deleteConfirm,
  onEditClick,
  onDeleteConfirmToggle,
  onDeleteConfirm
}) => (
  <div className="admin-news-card">
    <div className="news-info">
      <p className="news-admin-title">{news.title}</p>
      <p className="news-authors">
        Authors: {news.authors?.join(', ') || 'N/A'}
      </p>
      {news.links?.length > 0 && (
        <p className="news-links">
          Links: {news.links.length}
        </p>
      )}
    </div>
    <div className="news-actions">
      <button onClick={onEditClick} className="action-button" title="Edit">
        <FontAwesomeIcon icon={faEdit} />
      </button>
      {deleteConfirm === news.id ? (
        <div className="delete-confirm">
          <p>Are you sure?</p>
          <button onClick={onDeleteConfirm} className="confirm-button">Yes</button>
          <button onClick={onDeleteConfirmToggle} className="cancel-button">No</button>
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

export default AdminNews;
