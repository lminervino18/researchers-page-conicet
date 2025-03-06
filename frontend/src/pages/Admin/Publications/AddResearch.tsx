// pages/Research/AddResearch.tsx
import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ResearchForm from '../../../components/research/ResearchForm';
import { createResearch } from '../../../api/research';
import { ResearchDTO } from '../../../types';
import './styles/AddResearch.css';

const AddResearch: FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: ResearchDTO, file: File | null, _id?: number) => {
    try {
      setIsSubmitting(true);
      setError(null);

      await createResearch(data, file);
      navigate('/admin/publications');
    } catch (error) {
      console.error('Error creating research:', error);
      setError(error instanceof Error ? error.message : 'Failed to create research');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-research-page">
      <header className="add-research-header">
        <button 
          onClick={() => navigate('/admin/publications')} 
          className="add-research-back-btn"
        >
          Back to Publications
        </button>
        <h1 className="add-research-title">Add New Research</h1>
      </header>
      <main className="add-research-content">
        <div className="add-research-form-wrapper">
          <ResearchForm 
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

export default AddResearch;