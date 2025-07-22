// pages/Admin/Analogies/AddAnalogy.tsx
import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnalogyForm from '../../../components/analogies/AnalogyForm';
import { createAnalogy } from '../../../api/analogy';
import { AnalogyDTO } from '../../../types';
import './styles/AddAnalogy.css';

const AddAnalogy: FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: AnalogyDTO, id?: number) => {
    try {
      setIsSubmitting(true);
      setError(null);

       // Optionally use the ID if needed
    if (id) {
      // Handle ID-specific logic if required
      console.log('Potential update for ID:', id);
    }

      await createAnalogy(data);
      navigate('/admin/analogies');
    } catch (error) {
      console.error('Error creating analogy:', error);
      setError(error instanceof Error ? error.message : 'Failed to create analogy');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-analogy-page">
      <header className="add-analogy-header">
        <button 
          onClick={() => navigate('/admin/analogies')} 
          className="add-analogy-back-btn"
        >
          Back to Analogies
        </button>
        <h1 className="add-analogy-title">Add New Analogy</h1>
      </header>
      <main className="add-analogy-content">
        <div className="add-analogy-form-wrapper">
          <AnalogyForm 
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

export default AddAnalogy;