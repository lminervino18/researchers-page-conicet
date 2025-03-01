import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResearchDTO } from '../../types';
import './styles/ResearchForm.css';

interface ResearchFormProps {
  onSubmit: (data: ResearchDTO, file: File) => Promise<void>;
}

const ResearchForm: FC<ResearchFormProps> = ({ onSubmit }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [authorInput, setAuthorInput] = useState('');
  const [linkInput, setLinkInput] = useState('');
  
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
      setError('Please select a PDF file');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData, selectedFile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

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
          />
          <button type="button" onClick={handleAddAuthor}>Add</button>
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
            type="text"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            placeholder="Add link"
          />
          <button type="button" onClick={handleAddLink}>Add</button>
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
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>PDF File</label>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          required
        />
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
        <button type="button" onClick={() => navigate('/')}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ResearchForm;