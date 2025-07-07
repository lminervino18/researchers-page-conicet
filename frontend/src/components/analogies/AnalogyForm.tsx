import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authors, Author } from '../../api/authors';
import './styles/AnalogyForm.css';

interface AnalogyFormProps {
  onSubmit: (data: AnalogyDTO, id?: number) => Promise<void>;
  initialData?: Analogy;
  isSubmitting?: boolean;
  error?: string | null;
  isEditing?: boolean;
}

interface AnalogyDTO {
  title: string;
  content: string;
  authors: string[]; // Solo nombre y apellido
  links: string[];
}

interface Analogy {
  id: number;
  title: string;
  content: string;
  authors: string[];
  links: string[];
}

const AnalogyForm: FC<AnalogyFormProps> = ({
  onSubmit,
  initialData,
  isSubmitting = false,
  error: externalError = null,
  isEditing = false
}) => {
  const navigate = useNavigate();
  const [linkInput, setLinkInput] = useState('');
  const [internalError, setInternalError] = useState<string | null>(null);
  const [touched, setTouched] = useState({
    title: false,
    content: false,
    authors: false,
    links: false
  });

  const [formData, setFormData] = useState<AnalogyDTO>({
    title: '',
    content: '',
    authors: [],
    links: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        content: initialData.content || '',
        authors: initialData.authors,
        links: initialData.links
      });
      setTouched({
        title: true,
        content: true,
        authors: true,
        links: true
      });
    }
  }, [initialData]);

  const handleAddLink = () => {
    if (linkInput.trim()) {
      setFormData((prev: AnalogyDTO) => ({
        ...prev,
        links: [...prev.links, linkInput.trim()]
      }));
      setLinkInput('');
      setTouched(prev => ({ ...prev, links: true }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInternalError(null);

    setTouched({
      title: true,
      content: true,
      authors: true,
      links: true
    });

    if (!formData.title.trim()) {
      setInternalError('Title is required');
      return;
    }

    if (!formData.content.trim()) {
      setInternalError('Content is required');
      return;
    }

    if (formData.authors.length === 0) {
      setInternalError('At least one author is required');
      return;
    }

    try {
      await onSubmit(formData, initialData?.id);
    } catch (err) {
      setInternalError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const error = externalError || internalError;

  const toggleAuthorSelection = (author: Author) => {
    const authorName = `${author.firstName} ${author.lastName}`;
    setFormData(prev => ({
      ...prev,
      authors: prev.authors.includes(authorName)
        ? prev.authors.filter(a => a !== authorName)
        : [...prev.authors, authorName]
    }));
    setTouched(prev => ({ ...prev, authors: true }));
  };

  return (
    <form onSubmit={handleSubmit} className="analogy-form">
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="title">
          Title <span className="required">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, title: e.target.value }));
            setTouched(prev => ({ ...prev, title: true }));
          }}
          onBlur={() => setTouched(prev => ({ ...prev, title: true }))}
          disabled={isSubmitting}
          placeholder="Enter analogy title"
          className={touched.title && !formData.title.trim() ? 'error' : ''}
        />
        {touched.title && !formData.title.trim() && (
          <div className="validation-message">Title is required</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="content">
          Content <span className="required">*</span>
        </label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, content: e.target.value }));
            setTouched(prev => ({ ...prev, content: true }));
          }}
          onBlur={() => setTouched(prev => ({ ...prev, content: true }))}
          disabled={isSubmitting}
          placeholder="Enter analogy content"
          className={touched.content && !formData.content.trim() ? 'error' : ''}
        />
        {touched.content && !formData.content.trim() && (
          <div className="validation-message">Content is required</div>
        )}
      </div>

      <div className="form-group">
        <label>Authors <span className="required">*</span></label>
        <div className="author-selector">
          {authors.map(author => (
            <div
              key={author.id}
              className={`author-option ${formData.authors.includes(`${author.firstName} ${author.lastName}`) ? 'selected' : ''}`}
              onClick={() => toggleAuthorSelection(author)}
            >
              <img src={author.imageUrl} alt={`${author.firstName} ${author.lastName}`} />
              <span>{author.firstName} {author.lastName}</span>
            </div>
          ))}
        </div>
        {touched.authors && formData.authors.length === 0 && (
          <div className="validation-message">At least one author is required</div>
        )}
      </div>

      <div className="form-group">
        <label>Links</label>
        <div className="input-with-button">
          <input
            type="url"
            name="link"
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
                  setFormData(prev => ({ ...prev, links: prev.links.filter((_, i) => i !== index) }));
                  setTouched(prev => ({ ...prev, links: true }));
                }}
                disabled={isSubmitting}
                className="remove-tag"
                title="Remove link"
              >×</button>
            </span>
          ))}
        </div>
        {formData.links.length > 0 && (
          <div className="help-text">The first link will be displayed in the publication preview.</div>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" className={`submit-btn ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting}>
          {isSubmitting ? (isEditing ? 'Updating...' : 'Submitting...') : (isEditing ? 'Update Analogy' : 'Submit Analogy')}
        </button>
        <button type="button" onClick={handleCancel} className="cancel-btn" disabled={isSubmitting}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AnalogyForm;
