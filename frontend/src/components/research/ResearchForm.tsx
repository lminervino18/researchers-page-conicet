// src/components/research/ResearchForm.tsx
import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResearchDTO } from '../../types';
import './styles/ResearchForm.css';

interface ResearchFormProps {
  onSubmit: (data: ResearchDTO, file: File) => Promise<void>;
  isSubmitting?: boolean;
  error?: string | null;
}

const ResearchForm: FC<ResearchFormProps> = ({ 
  onSubmit, 
  isSubmitting = false,
  error: externalError = null 
}) => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [authorInput, setAuthorInput] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [internalError, setInternalError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ResearchDTO>({
    researchAbstract: '',
    authors: [],
    links: []
  });

  const handleAddAuthor = () => {
    if (authorInput.trim()) {
      setFormData((prev: ResearchDTO) => ({
        ...prev,
        authors: [...prev.authors, authorInput.trim()]
      }));
      setAuthorInput('');
    }
  };

  const handleAddLink = () => {
    if (linkInput.trim()) {
      setFormData((prev: ResearchDTO) => ({
        ...prev,
        links: [...prev.links, linkInput.trim()]
      }));
      setLinkInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setInternalError('Please select a PDF file');
      return;
    }

    try {
      await onSubmit(formData, selectedFile);
    } catch (err) {
      setInternalError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const error = externalError || internalError;

  return (
    <form onSubmit={handleSubmit} className="research-form">
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="abstract">Abstract</label>
        <textarea
          id="abstract"
          value={formData.researchAbstract}
          onChange={(e) => setFormData((prev: ResearchDTO) => ({
            ...prev,
            researchAbstract: e.target.value
          }))}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label>Authors</label>
        <div className="input-with-button">
          <input
            type="text"
            value={authorInput}
            onChange={(e) => setAuthorInput(e.target.value)}
            placeholder="Add author"
            disabled={isSubmitting}
          />
          <button 
            type="button" 
            onClick={handleAddAuthor}
            disabled={isSubmitting}
            className="add-button"
          >
            Add
          </button>
        </div>
        <div className="tags">
          {formData.authors.map((author, index) => (
            <span key={index} className="tag">
              {author}
              <button
                type="button"
                onClick={() => setFormData((prev: ResearchDTO) => ({
                  ...prev,
                  authors: prev.authors.filter((_, i) => i !== index)
                }))}
                disabled={isSubmitting}
                className="remove-tag"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Links</label>
        <div className="input-with-button">
          <input
            type="url"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            placeholder="https://"
            disabled={isSubmitting}
          />
          <button 
            type="button" 
            onClick={handleAddLink}
            disabled={isSubmitting}
            className="add-button"
          >
            Add
          </button>
        </div>
        <div className="tags">
          {formData.links.map((link, index) => (
            <span key={index} className="tag">
              {link}
              <button
                type="button"
                onClick={() => setFormData((prev: ResearchDTO) => ({
                  ...prev,
                  links: prev.links.filter((_, i) => i !== index)
                }))}
                disabled={isSubmitting}
                className="remove-tag"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="file-input-label">
          Choose PDF
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="file-input"
            required
            disabled={isSubmitting}
          />
        </label>
        {selectedFile && (
          <div className="file-name">
            Selected file: {selectedFile.name}
          </div>
        )}
      </div>

      <div className="form-actions">
        <button 
          type="submit" 
          className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              Submitting...
              <span className="loading-spinner"></span>
            </>
          ) : (
            'Submit Research'
          )}
        </button>
        <button 
          type="button" 
          onClick={() => navigate('/')}
          className="cancel-btn"
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ResearchForm;