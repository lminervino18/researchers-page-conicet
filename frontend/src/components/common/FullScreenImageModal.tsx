import React, { useState } from 'react';
import './styles/FullScreenImageModal.css';

interface FullScreenImageModalProps {
  imageUrl: string;
  isLoading: boolean;
  onClose: () => void;
  onImageLoad: () => void;
}

const FullScreenImageModal: React.FC<FullScreenImageModalProps> = ({
  imageUrl,
  isLoading,
  onClose,
  onImageLoad,
}) => {
  const [scale, setScale] = useState(1);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(1, prev - 0.2));
  const handleReset = () => setScale(1);

  return (
    <div className="fullscreen-preview">
      <button className="close-btn-outside" onClick={onClose}>×</button>

      <div className="preview-wrapper">
        <div className="preview-content" onClick={(e) => e.stopPropagation()}>
          <img
            src={imageUrl}
            alt="Fullscreen"
            className="fullscreen-image"
            onLoad={onImageLoad}
            style={{
              transform: `scale(${scale})`,
            }}
          />
          {isLoading && (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          )}
        </div>
      </div>

      <div className="zoom-controls">
        <button onClick={handleZoomIn}>＋</button>
        <button onClick={handleZoomOut}>－</button>
        <button onClick={handleReset}>⟳</button>
      </div>
    </div>
  );
};

export default FullScreenImageModal;
