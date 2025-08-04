import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NewsForm from '../../../components/news/NewsForm';
import { createNews } from '../../../api/news';
import { NewsDTO } from '../../../types';
import './styles/AddNews.css';

const AddNews: FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: NewsDTO, id?: number) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (id) {
        console.log('Potential update for ID:', id);
      }

      await createNews(data);
      navigate('/admin/news');
    } catch (error) {
      console.error('Error creating news:', error);
      setError(error instanceof Error ? error.message : 'Failed to create news');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-news-page">
      <header className="add-news-header">
        <button
          onClick={() => navigate('/admin/news')}
          className="add-news-back-btn"
        >
          Back to News
        </button>
        <h1 className="add-news-title">Add News Article</h1>
      </header>
      <main className="add-news-content">
        <div className="add-news-form-wrapper">
          <NewsForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            error={error}
            isEditing={false}
          />
        </div>
      </main>
    </div>
  );
};

export default AddNews;
