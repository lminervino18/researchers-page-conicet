// src/components/common/SourcesModal.tsx
import { FC, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import './styles/SourcesModal.css';

interface SourcesModalProps {
  sources: string[];
  onClose: () => void;
}

const SourcesModal: FC<SourcesModalProps> = ({ sources, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleModalClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleModalClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Sources</h3>
          <button 
            className="close-button"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <ul className="sources-list">
          {sources.map((source, index) => (
            <li key={index}>
              <a href={source} target="_blank" rel="noopener noreferrer">
                {source}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SourcesModal;