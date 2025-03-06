// pages/Admin/Publications/EditResearch.tsx
import { FC, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ResearchForm from '../../../components/research/ResearchForm';
import { getResearchById, updateResearch } from '../../../api/research';
import { Research, ResearchDTO } from '../../../types';
import './styles/EditResearch.css';

const EditResearch: FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [research, setResearch] = useState<Research | null>(null);

  useEffect(() => {
    const loadResearch = async () => {
      try {
        if (!id) return;
        const data = await getResearchById(parseInt(id));
        setResearch(data);
      } catch (error) {
        console.error('Error loading research:', error);
        setError('Failed to load research');
      }
    };

    loadResearch();
  }, [id]);

  const handleSubmit = async (data: ResearchDTO, file: File | null, _id?: number) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!id) return;
      await updateResearch(parseInt(id), data, file || undefined);
      navigate('/admin/publications');
    } catch (error) {
      console.error('Error updating research:', error);
      setError(error instanceof Error ? error.message : 'Failed to update research');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!research) {
    return (
      <div className="edit-research-page">
        <div className="edit-research-loading-wrapper">
          <div className="edit-research-loading-text">Loading research...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-research-page">
      <header className="edit-research-header">
        <button 
          onClick={() => navigate('/admin/publications')} 
          className="edit-research-back-btn"
        >
          Back to Publications
        </button>
        <h1 className="edit-research-title">Edit Research</h1>
      </header>
      <main className="edit-research-content">
        <div className="edit-research-form-wrapper">
          <ResearchForm 
            initialData={research}
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

export default EditResearch;