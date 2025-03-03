import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ResearchForm from '../../components/research/ResearchForm';
import { ResearchDTO } from '../../types';
import './styles/AddResearch.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const AddResearch: FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: ResearchDTO, file: File) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const data = new FormData();
      data.append('file', file);
      data.append('research', new Blob([JSON.stringify(formData)], {
        type: 'application/json'
      }));

      const response = await fetch(`${API_URL}/api/researches`, {
        method: 'POST',
        body: data,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to create research');
      }

      navigate('/');
    } catch (error) {
      console.error('Error creating research:', error);
      setError(error instanceof Error ? error.message : 'Failed to create research');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-research-container">
      <h1>Add New Research</h1>
      <ResearchForm 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={error}
      />
    </div>
  );
};

export default AddResearch;