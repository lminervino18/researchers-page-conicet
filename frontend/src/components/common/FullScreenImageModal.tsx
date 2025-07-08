import React from 'react';
import './styles/FullScreenImageModal.css';  

interface FullScreenImageModalProps {
  imageUrl: string;
  isLoading: boolean;
  onClose: () => void;
  onImageLoad: () => void;
}

const FullScreenImageModal: React.FC<FullScreenImageModalProps> = ({ imageUrl, isLoading, onClose, onImageLoad }) => {
  const handleImageLoad = () => {
    console.log("Image loaded successfully!");  // Verifica que la imagen se haya cargado correctamente
    onImageLoad();  // Llamar a la función para actualizar el estado
  };

  return (
    <div className="fullscreen-preview" onClick={onClose}>
      <div className="preview-content" onClick={(e) => e.stopPropagation()}>
        <img 
          src={imageUrl} 
          alt="Fullscreen" 
          className="fullscreen-image" 
          onLoad={handleImageLoad}
        />
        {isLoading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        )}
        <button className="close-btn" onClick={onClose}>X</button>
      </div>
    </div>
  );
};

export default FullScreenImageModal;
