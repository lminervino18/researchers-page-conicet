// pages/Admin/Analogies/EditAnalogy.tsx
import { FC, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AnalogyForm from '../../../components/analogies/AnalogyForm';
import { getAnalogyById, updateAnalogy } from '../../../api/Analogy';
import { Analogy, AnalogyDTO } from '../../../types';
import './styles/EditAnalogy.css';

const EditAnalogy: FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analogy, setAnalogy] = useState<Analogy | null>(null);

  useEffect(() => {
    const loadAnalogy = async () => {
      try {
        if (!id) return;
        const data = await getAnalogyById(parseInt(id));
        setAnalogy(data);
      } catch (error) {
        console.error('Error loading analogy:', error);
        setError('Failed to load analogy');
      }
    };

    loadAnalogy();
  }, [id]);

  const handleSubmit = async (data: AnalogyDTO, _id?: number) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!id) return;
      await updateAnalogy(parseInt(id), data);
      navigate('/admin/analogies');
    } catch (error) {
      console.error('Error updating analogy:', error);
      setError(error instanceof Error ? error.message : 'Failed to update analogy');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!analogy) {
    return (
      <div className="edit-analogy-page">
        <div className="edit-analogy-loading-wrapper">
          <div className="edit-analogy-loading-text">Loading analogy...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-analogy-page">
      <header className="edit-analogy-header">
        <button 
          onClick={() => navigate('/admin/analogies')} 
          className="edit-analogy-back-btn"
        >
          Back to Analogies
        </button>
        <h1 className="edit-analogy-title">Edit Analogy</h1>
      </header>
      <main className="edit-analogy-content">
        <div className="edit-analogy-form-wrapper">
          <AnalogyForm 
            initialData={analogy}
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

export default EditAnalogy;