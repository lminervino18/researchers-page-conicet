// src/components/members/NavigationArrow.tsx
import { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './styles/NavigationArrow.css';

interface NavigationArrowProps {
  direction: 'left' | 'right';
  onClick: () => void;
  disabled?: boolean;
}

const NavigationArrow: FC<NavigationArrowProps> = ({ 
  direction, 
  onClick, 
  disabled 
}) => {
  return (
    <button 
      className={`nav-arrow ${direction} ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <FontAwesomeIcon 
        icon={direction === 'left' ? faChevronLeft : faChevronRight} 
      />
    </button>
  );
};

export default NavigationArrow;