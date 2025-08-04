import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authors, Author } from '../../api/authors';
import { uploadFile } from '../../api/firebaseUploader';
import './styles/NewsForm.css';

interface NewsFormProps {
  onSubmit: (data: NewsDTO, id?: number) => Promise<void>;
  initialData?: News;
  isSubmitting?: boolean;
  error?: string | null;
  isEditing?: boolean;
}

interface MediaLink {
  url: string;
  mediaType: string; // "image" | "video"
}

interface NewsDTO {
  title: string;
  content: string;
  authors: string[];
  links: string[];
  mediaLinks: MediaLink[];
  previewImage: string;
}

interface News {
  id: number;
  title: string;
  content: string;
  authors: string[];
  links: string[];
  mediaLinks: MediaLink[];
  previewImage: string;
}

const NewsForm: FC<NewsFormProps> = ({
  onSubmit,
  initialData,
  isSubmitting = false,
  error: externalError = null,
  isEditing = false
}) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<NewsDTO>({
    title: '',
    content: '',
    authors: [],
    links: [],
    mediaLinks: [],
    previewImage: ''
  });

  const [linkInput, setLinkInput] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [mediaTypes, setMediaTypes] = useState<string[]>([]);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState<number | null>(null);

  const [internalError, setInternalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [touched, setTouched] = useState({
    title: false,
    authors: false
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        content: initialData.content || '',
        authors: initialData.authors || [],
        links: initialData.links || [],
        mediaLinks: initialData.mediaLinks || [],
        previewImage: initialData.previewImage || ''
      });
      setMediaPreviews(initialData.mediaLinks.map(link => link.url));
      setMediaTypes(initialData.mediaLinks.map(link => link.mediaType));
      const previewIdx = initialData.mediaLinks.findIndex(m => m.url === initialData.previewImage);
      setSelectedPreviewIndex(previewIdx !== -1 ? previewIdx : null);
    }
  }, [initialData]);

  const handleAddLink = () => {
    if (linkInput.trim()) {
      setFormData(prev => ({
        ...prev,
        links: [...prev.links, linkInput.trim()]
      }));
      setLinkInput('');
    }
  };

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

  const handleRemoveMedia = (index: number) => {
    const newFiles = [...mediaFiles];
    const newPreviews = [...mediaPreviews];
    const newTypes = [...mediaTypes];
    const newMediaLinks = [...formData.mediaLinks];

    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    newTypes.splice(index, 1);
    newMediaLinks.splice(index, 1);

    setMediaFiles(newFiles);
    setMediaPreviews(newPreviews);
    setMediaTypes(newTypes);
    setFormData(prev => ({
      ...prev,
      mediaLinks: newMediaLinks
    }));

    if (selectedPreviewIndex === index) {
      setSelectedPreviewIndex(null);
      setFormData(prev => ({ ...prev, previewImage: '' }));
    } else if (selectedPreviewIndex !== null && selectedPreviewIndex > index) {
      setSelectedPreviewIndex(prev => (prev ?? 0) - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setInternalError(null);
    setTouched({ title: true, authors: true });

    if (!formData.title.trim()) {
      setInternalError('The title is required.');
      setIsLoading(false);
      return;
    }
    if (formData.authors.length === 0) {
      setInternalError('At least one author is required.');
      setIsLoading(false);
      return;
    }

    try {
      const uploadedLinks: MediaLink[] = await Promise.all(
        mediaFiles.map(async (file) => ({
          url: await uploadFile(file),
          mediaType: file.type.startsWith('video') ? 'video' : 'image'
        }))
      );

      const allMediaLinks = [...formData.mediaLinks, ...uploadedLinks];
      const previewImageUrl = selectedPreviewIndex !== null
        ? allMediaLinks[selectedPreviewIndex]?.url || ''
        : formData.previewImage;

      await onSubmit(
        {
          ...formData,
          mediaLinks: allMediaLinks,
          previewImage: previewImageUrl
        },
        initialData?.id
      );
    } catch (err) {
      console.error(err);
      setInternalError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const error = externalError || internalError;

  return (
    <div className="news-form-wrapper">
      {isLoading && (
        <>
          <div className="loading-overlay"></div>
          <div className="loading-spinner-wrapper">
            <div className="loading-spinner"></div>
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="news-form">
        {error && <div className="error-message">{error}</div>}

        {/* Título */}
        <div className="form-group">
          <label>Title <span className="required">*</span></label>
          <input
            type="text"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            onBlur={() => setTouched(prev => ({ ...prev, title: true }))}
            placeholder="Enter news title"
            disabled={isSubmitting}
            className={touched.title && !formData.title.trim() ? 'error' : ''}
          />
          {touched.title && !formData.title.trim() && (
            <div className="validation-message">Title is required</div>
          )}
        </div>

        {/* Contenido */}
        <div className="form-group">
          <label>Content <span className="optional">(optional)</span></label>
          <textarea
            value={formData.content}
            onChange={e => setFormData({ ...formData, content: e.target.value })}
            placeholder="Enter news content"
            disabled={isSubmitting}
          />
        </div>

        {/* Autores */}
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

        {/* Links */}
        <div className="form-group">
          <label>Links <span className="optional">(optional)</span></label>
          <div className="input-with-button">
            <input
              type="url"
              value={linkInput}
              onChange={e => setLinkInput(e.target.value)}
              placeholder="https://"
            />
            <button type="button" onClick={handleAddLink} disabled={!linkInput.trim()}>Add</button>
          </div>
          <div className="tags">
            {formData.links.map((link, idx) => (
              <span key={idx} className="tag">
                {link}
                <button type="button" onClick={() =>
                  setFormData(prev => ({
                    ...prev,
                    links: prev.links.filter((_, i) => i !== idx)
                  }))
                }>×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Media */}
        <div className="form-group">
          <label>Media (images/videos) <span className="optional">(optional)</span></label>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              const previews = files.map(file => URL.createObjectURL(file));
              const types = files.map(file => file.type.startsWith('video') ? 'video' : 'image');

              setMediaFiles(prev => [...prev, ...files]);
              setMediaPreviews(prev => [...prev, ...previews]);
              setMediaTypes(prev => [...prev, ...types]);
            }}
            disabled={isSubmitting}
          />
          <div className="media-preview-grid">
            {mediaPreviews.map((src, i) => (
              <div key={i} className="media-preview">
                {mediaTypes[i] === 'video' ? (
                  <video src={src} controls />
                ) : (
                  <img
                    src={src}
                    alt={`media-${i}`}
                    className={selectedPreviewIndex === i ? 'selected-preview' : ''}
                    onClick={() => {
                      if (selectedPreviewIndex === i) {
                        // Deselecciona si ya está seleccionada
                        setSelectedPreviewIndex(null);
                        setFormData(prev => ({ ...prev, previewImage: '' }));
                      } else {
                        // Selecciona nueva preview
                        setSelectedPreviewIndex(i);
                        setFormData(prev => ({ ...prev, previewImage: formData.mediaLinks[i]?.url || '' }));
                      }
                    }}
/>

                )}
                <button type="button" className="remove-tag" onClick={() => handleRemoveMedia(i)}>×</button>
              </div>
            ))}
          </div>
          {mediaPreviews.length > 0 && (
            <div className="help-text">
              You can click on an image to mark it as the preview image for this news article (optional).
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={isSubmitting || isLoading}>
            {isSubmitting ? 'Submitting...' : (isEditing ? 'Update News' : 'Submit News')}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="cancel-btn" disabled={isSubmitting || isLoading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewsForm;
