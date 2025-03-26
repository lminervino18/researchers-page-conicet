import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResearchDTO, Research } from '../../types';
import { authors as authorsList } from '../../api/Authors';
import './styles/ResearchForm.css';

interface ResearchFormProps {
  onSubmit: (data: ResearchDTO, file: File | null, id?: number) => Promise<void>;
  initialData?: Research;
  isSubmitting?: boolean;
  error?: string | null;
  isEditing?: boolean;
}

const ResearchForm: FC<ResearchFormProps> = ({ 
  onSubmit, 
  initialData,
  isSubmitting = false,
  error: externalError = null,
  isEditing = false
}) => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [linkInput, setLinkInput] = useState('');
  const [internalError, setInternalError] = useState<string | null>(null);
  const [touched, setTouched] = useState({
    abstract: false,
    authors: false,
    links: false,
    file: false
  });

  const [formData, setFormData] = useState<ResearchDTO>({
    researchAbstract: '',
    authors: [],
    links: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        researchAbstract: initialData.researchAbstract,
        authors: initialData.authors,
        links: initialData.links
      });
      setTouched({
        abstract: true,
        authors: true,
        links: true,
        file: true
      });
    }
  }, [initialData]);

  const handleAddLink = () => {
    if (linkInput.trim()) {
      setFormData(prev => ({
        ...prev,
        links: [...prev.links, linkInput.trim()]
      }));
      setLinkInput('');
      setTouched(prev => ({ ...prev, links: true }));
    }
  };

  const toggleAuthorSelection = (authorFullName: string) => {
    setFormData(prev => ({
      ...prev,
      authors: prev.authors.includes(authorFullName)
        ? prev.authors.filter(a => a !== authorFullName)
        : [...prev.authors, authorFullName]
    }));
    setTouched(prev => ({ ...prev, authors: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInternalError(null);
    setTouched({ abstract: true, authors: true, links: true, file: true });

    if (!formData.researchAbstract.trim()) {
      setInternalError('Abstract is required');
      return;
    }

    if (formData.authors.length === 0) {
      setInternalError('At least one author is required');
      return;
    }

    if (!isEditing && !selectedFile && formData.links.length === 0) {
      setInternalError('Either a PDF file or at least one link is required');
      return;
    }

    try {
      await onSubmit(formData, selectedFile, initialData?.id);
    } catch (err) {
      setInternalError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleCancel = () => navigate(-1);

  const error = externalError || internalError;

  return (
    <form onSubmit={handleSubmit} className="research-form">
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="abstract">
          Abstract <span className="required">*</span>
        </label>
        <textarea
          id="abstract"
          name="abstract"
          value={formData.researchAbstract}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, researchAbstract: e.target.value }));
            setTouched(prev => ({ ...prev, abstract: true }));
          }}
          disabled={isSubmitting}
          placeholder="Enter research abstract"
        />
        {touched.abstract && !formData.researchAbstract.trim() && (
          <div className="validation-message">Abstract is required</div>
        )}
      </div>

      <div className="form-group">
        <label>
          Authors <span className="required">*</span>
          <span className="help-text">(At least one author is required)</span>
        </label>
        <div className="author-selector">
          {authorsList.map(author => {
            const authorFullName = `${author.firstName} ${author.lastName}`;
            return (
              <div
                key={author.id}
                className={`author-option ${formData.authors.includes(authorFullName) ? 'selected' : ''}`}
                onClick={() => toggleAuthorSelection(authorFullName)}
              >
                <img src={author.imageUrl} alt={authorFullName} className="author-option-img"/>
                <span>{authorFullName}</span>
              </div>
            );
          })}
        </div>
        {touched.authors && formData.authors.length === 0 && (
          <div className="validation-message">At least one author is required</div>
        )}
      </div>

      <div className="form-group">
        <label>Links
          <span className="help-text">
            {!isEditing && !selectedFile ? '(Required if no PDF is uploaded)' : '(Optional)'}
          </span>
        </label>
        <div className="input-with-button">
          <input
            type="url"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            placeholder="https://"
            disabled={isSubmitting}
          />
          <button type="button" onClick={handleAddLink} disabled={isSubmitting || !linkInput.trim()} className="add-button">
            Add
          </button>
        </div>
        <div className="tags">
          {formData.links.map((link, index) => (
            <span key={index} className="tag">
              {link}
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    links: prev.links.filter((_, i) => i !== index)
                  }));
                }}
                className="remove-tag"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="file-input-wrapper">
          <span className="file-input-label">
            {isEditing ? 'Update PDF (optional)' : 'Choose PDF'}
            <span className="help-text">
              {!isEditing && formData.links.length === 0 ? '(Required if no links are added)' : '(Optional)'}
            </span>
          </span>
          <input
            type="file"
            name="pdfFile"
            accept=".pdf"
            onChange={(e) => {
              setSelectedFile(e.target.files?.[0] || null);
              setTouched(prev => ({ ...prev, file: true }));
            }}
            className="file-input"
            disabled={isSubmitting}
          />
        </label>
        {selectedFile && <div className="file-name">Selected file: {selectedFile.name}</div>}
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              {isEditing ? 'Updating...' : 'Submitting...'}
              <span className="loading-spinner"></span>
            </>
          ) : (
            isEditing ? 'Update Research' : 'Submit Research'
          )}
        </button>
        <button
          type="button"
          onClick={handleCancel}
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