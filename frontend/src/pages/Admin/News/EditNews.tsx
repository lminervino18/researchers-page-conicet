import { FC, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NewsForm from '../../../components/news/NewsForm';
import { getNewsById, updateNews } from '../../../api/news';
import { News, NewsDTO } from '../../../types';
import './styles/EditNews.css';

const EditNews: FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newsItem, setNewsItem] = useState<News | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        if (!id) return;
        const data = await getNewsById(parseInt(id));
        setNewsItem(data);
      } catch (error) {
        console.error('Error loading news:', error);
        setError('Failed to load news item');
      }
    };

    loadNews();
  }, [id]);

  const handleSubmit = async (data: NewsDTO, _id?: number) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!id) return;
      await updateNews(parseInt(id), data);
      navigate('/admin/news');
    } catch (error) {
      console.error('Error updating news:', error);
      setError(error instanceof Error ? error.message : 'Failed to update news');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!newsItem) {
    return (
      <div className="edit-news-page">
        <div className="edit-news-loading-wrapper">
          <div className="edit-news-loading-text">Loading news...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-news-page">
      <header className="edit-news-header">
        <button 
          onClick={() => navigate('/admin/news')} 
          className="edit-news-back-btn"
        >
          Back to News
        </button>
        <h1 className="edit-news-title">Edit News</h1>
      </header>
      <main className="edit-news-content">
        <div className="edit-news-form-wrapper">
          <NewsForm 
            initialData={newsItem}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            error={error}
            isEditing={true}
          />
        </div>
      </main>
    </div>
  );
};

export default EditNews;
