import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import ResearchForm from '../../components/research/ResearchForm';
import { ResearchDTO } from '../../types';
import './styles/AddResearch.css';

const AddResearch: FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (formData: ResearchDTO, file: File) => {
    const data = new FormData();
    data.append('file', file);
    data.append('research', JSON.stringify(formData));

    const response = await fetch('/api/researches', {
      method: 'POST',
      body: data
    });

    if (!response.ok) throw new Error('Failed to create research');
    navigate('/');
  };

  return (
    <div className="add-research-container">
      <h1>Add New Research</h1>
      <ResearchForm onSubmit={handleSubmit} />
    </div>
  );
};

export default AddResearch;