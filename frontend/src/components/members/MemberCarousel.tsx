// src/components/members/MemberCarousel.tsx
import { FC, useState } from 'react';
import { Member } from '../../types/index';
import MemberCard from './MemberCard';
import NavigationArrow from '../common/NavigationArrow';
import './styles/MemberCarousel.css';

interface MemberCarouselProps {
  members: Member[];
}

const MemberCarousel: FC<MemberCarouselProps> = ({ members }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handlePrevious = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrentIndex((prev) => 
      prev === 0 ? members.length - 1 : prev - 1
    );
    
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleNext = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrentIndex((prev) => 
      prev === members.length - 1 ? 0 : prev + 1
    );
    
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div className="carousel-container">
      <NavigationArrow 
        direction="left" 
        onClick={handlePrevious}
        disabled={isAnimating}
      />
      
      <div className="carousel-window">
        <div 
          className={`carousel-card ${isAnimating ? 'animating' : ''}`}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          <MemberCard member={members[currentIndex]} />
        </div>
      </div>

      <NavigationArrow 
        direction="right" 
        onClick={handleNext}
        disabled={isAnimating}
      />
      
      <div className="carousel-indicators">
        {members.map((_, index) => (
          <div 
            key={index}
            className={`indicator ${index === currentIndex ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
};

export default MemberCarousel;