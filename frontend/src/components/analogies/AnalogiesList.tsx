import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Analogy } from '../../types';
import { authors as authorsList } from '../../api/Authors';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faComment, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { faYoutube, faFacebook, faTiktok } from '@fortawesome/free-brands-svg-icons';
import './styles/AnalogiesList.css';

interface AnalogiesListProps {
  analogies: Analogy[];
}

const truncateText = (text: string, maxLength: number = 200) => {
  if (!text) return '';
  return text.length <= maxLength 
    ? text 
    : text.substring(0, maxLength) + '...';
};

const AnalogiesList: FC<AnalogiesListProps> = ({ analogies }) => {
  const navigate = useNavigate();

  const getAuthorData = (authorName: string) => {
    return authorsList.find(
      author => `${author.firstName} ${author.lastName}` === authorName
    );
  };

  const handleAnalogyClick = (analogyId: number) => {
    navigate(`/analogies/${analogyId}`);
  };

  const getLinkIcon = (link: string) => {
    if (link.includes('youtube')) return <FontAwesomeIcon icon={faYoutube} />;
    if (link.includes('facebook')) return <FontAwesomeIcon icon={faFacebook} />;
    if (link.includes('tiktok')) return <FontAwesomeIcon icon={faTiktok} />;
    return <FontAwesomeIcon icon={faLink} />;
  };

  const getPreviewImage = (link: string) => {
    const youtubeId = getYoutubeId(link);
    return youtubeId ? (
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}`}
        title="YouTube video"
        allowFullScreen
      />
    ) : (
      <img src="/default-image.png" alt="Default preview" />
    );
  };

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[1].length === 11 ? match[1] : null;
  };

  return (
    <div className="analogies-list">
      {analogies.map(analogy => (
        <div 
          key={analogy.id} 
          className="analogy-card"
          onClick={() => handleAnalogyClick(analogy.id)}
          style={{ cursor: 'pointer' }}
        >
          <div className="analogy-header">
            <div className="analogy-author">
              {analogy.authors.map(authorName => {
                const author = getAuthorData(authorName);
                return author ? (
                  <span key={authorName} className="author-tag">
                    <img src={author.imageUrl} alt={authorName} className="author-image" />
                    {authorName}
                  </span>
                ) : (
                  <span key={authorName} className="author-tag">
                    {authorName}
                  </span>
                );
              })}
            </div>
            <h2 className="analogy-preview-title">{analogy.title}</h2>
            <p className="analogy-date">
              {new Date(analogy.createdAt).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
          <p className="analogy-description">
            {truncateText(analogy.content || '')}
          </p>
          <div className="links">
            {analogy.links.map((link, index) => (
              <a 
                key={index} 
                href={link} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                {getLinkIcon(link)}
              </a>
            ))}
          </div>
          <div className="previews">
            {analogy.links.map((link, index) => (
              link.includes('youtube') && (
                <div key={index} className="preview">
                  {getPreviewImage(link)}
                </div>
              )
            ))}
          </div>
          <div className="interaction-buttons">
            <button 
              className="comment-btn"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <FontAwesomeIcon icon={faComment} /> Comment
            </button>
            <button 
              className="support-btn"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <FontAwesomeIcon icon={faThumbsUp} /> Support
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalogiesList;