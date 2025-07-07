import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Analogy } from '../../types';
import { authors as authorsList } from '../../api/authors';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faComment } from '@fortawesome/free-solid-svg-icons';
import { faYoutube, faFacebook, faTiktok } from '@fortawesome/free-brands-svg-icons';
import SupportAnalogyButton from '../analogies/SupportAnalogyButton';
import LoginModal from './LoginModal';
import { useAuth } from '../../hooks/useAuth';
import './styles/AnalogiesList.css';

/**
 * Props interface for AnalogiesList component
 */
interface AnalogiesListProps {
  analogies: Analogy[];
}

/**
 * Truncates text to a specified maximum length
 * @param text - Text to truncate
 * @param maxLength - Maximum length of text
 * @returns Truncated text
 */
const truncateText = (text: string, maxLength: number = 200) => {
  if (!text) return '';
  return text.length <= maxLength 
    ? text 
    : text.substring(0, maxLength) + '...';
};

/**
 * Component to display a list of analogies
 */
const AnalogiesList: FC<AnalogiesListProps> = ({ analogies }) => {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  // State for login modal
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  /**
   * Retrieves author data based on name
   * @param authorName - Full name of the author
   * @returns Author data or undefined
   */
  const getAuthorData = (authorName: string) => {
    return authorsList.find(
      author => `${author.firstName} ${author.lastName}` === authorName
    );
  };

  /**
   * Navigates to the detailed view of an analogy
   * @param analogyId - ID of the analogy to view
   */
  const handleAnalogyClick = (analogyId: number) => {
    navigate(`/analogies/${analogyId}`);
  };

  /**
   * Returns an icon based on the link type
   * @param link - URL to determine icon
   * @returns FontAwesome icon
   */
  const getLinkIcon = (link: string) => {
    if (link.includes('youtube')) return <FontAwesomeIcon icon={faYoutube} />;
    if (link.includes('facebook')) return <FontAwesomeIcon icon={faFacebook} />;
    if (link.includes('tiktok')) return <FontAwesomeIcon icon={faTiktok} />;
    return <FontAwesomeIcon icon={faLink} />;
  };

  /**
   * Generates a preview image for YouTube links
   * @param link - YouTube URL
   * @returns Iframe or default image
   */
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

  /**
   * Extracts YouTube video ID from URL
   * @param url - YouTube URL
   * @returns YouTube video ID or null
   */
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[1].length === 11 ? match[1] : null;
  };

  /**
   * Handles login process
   * @param username - User's username
   * @param email - User's email
   */
  const handleLogin = (username: string, email: string) => {
    login(username, email);
    setIsLoginModalOpen(false);
  };

  return (
    <div className="analogies-list">
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />

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
          <div 
            className="interaction-buttons"
            onClick={(e) => e.stopPropagation()} 
          >
            <button 
              className="comment-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleAnalogyClick(analogy.id)
              }}
            >
              <FontAwesomeIcon icon={faComment} /> Comment
            </button>
            <SupportAnalogyButton 
              analogyId={analogy.id}
              userEmail={user?.email}
              onLoginRequired={() => {
                setIsLoginModalOpen(true);
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalogiesList;