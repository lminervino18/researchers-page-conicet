import { FC } from 'react';
import { Analogy } from '../../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faComment, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { faYoutube, faFacebook, faTiktok } from '@fortawesome/free-brands-svg-icons';
import './styles/AnalogiesList.css';

interface AnalogiesListProps {
  analogies: Analogy[];
}

const AnalogiesList: FC<AnalogiesListProps> = ({ analogies }) => {
  return (
    <div className="analogies-list">
      {analogies.map(analogy => (
        <div key={analogy.id} className="analogy-card">
          <h2>{analogy.title}</h2>
          <p className="analogy-description">
            {analogy.content ? analogy.content.substring(0, 200) : ''}
            {analogy.content && analogy.content.length > 200 && '...'}
          </p>
          <div className="links">
            {analogy.links.map((link, index) => (
              <a key={index} href={link} target="_blank" rel="noopener noreferrer">
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
          <div className="actions">
            <FontAwesomeIcon icon={faComment} className="action-icon" />
            <FontAwesomeIcon icon={faThumbsUp} className="action-icon" />
          </div>
        </div>
      ))}
    </div>
  );
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
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default AnalogiesList;