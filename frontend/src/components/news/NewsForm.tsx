import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  mediaType: string;
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

  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [mediaTypes, setMediaTypes] = useState<string[]>([]);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState<number | null>(null);
  const [linkInput, setLinkInput] = useState('');
  const [authorInput, setAuthorInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

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

  const handleAddAuthor = () => {
    if (authorInput.trim()) {
      setFormData(prev => ({
        ...prev,
        authors: [...prev.authors, authorInput.trim()]
      }));
      setAuthorInput('');
    }
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
    } else if (selectedPreviewIndex && selectedPreviewIndex > index) {
      setSelectedPreviewIndex(prev => (prev ?? 0) - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setInternalError(null);

    if (!formData.title.trim() || formData.authors.length === 0) {
      setInternalError('Title and at least one author are required.');
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

  return (
    <form onSubmit={handleSubmit} className="news-form">
      {(externalError || internalError) && (
        <div className="error-message">{externalError || internalError}</div>
      )}

      <div className="form-group">
        <label>Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter news title"
        />
      </div>

      <div className="form-group">
        <label>Content</label>
        <textarea
          value={formData.content}
          onChange={e => setFormData({ ...formData, content: e.target.value })}
          placeholder="Enter news content"
        />
      </div>

      <div className="form-group">
        <label>Authors *</label>
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
          {formData.authors.map((author, idx) => (
            <span key={idx} className="tag">
              {author}
              <button type="button" onClick={() =>
                setFormData(prev => ({
                  ...prev,
                  authors: prev.authors.filter((_, i) => i !== idx)
                }))
              }>×</button>
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
            onChange={e => setLinkInput(e.target.value)}
            placeholder="https://"
          />
          <button type="button" onClick={handleAddLink}>Add</button>
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

      <div className="form-group">
        <label>Media (images/videos) *</label>
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
                  onClick={() => setSelectedPreviewIndex(i)}
                />
              )}
              <button type="button" className="remove-tag" onClick={() => handleRemoveMedia(i)}>×</button>
            </div>
          ))}
        </div>
        {selectedPreviewIndex !== null && (
          <div className="help-text">Selected image will be used as preview</div>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" className="submit-btn" disabled={isSubmitting || isLoading}>
          {isSubmitting ? 'Submitting...' : (isEditing ? 'Update News' : 'Submit News')}
        </button>
        <button type="button" onClick={() => navigate(-1)} className="cancel-btn" disabled={isSubmitting || isLoading}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default NewsForm;
