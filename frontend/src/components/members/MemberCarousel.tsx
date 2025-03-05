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
        <div className="carousel-content">
          {members.map((member, index) => (
            <div 
              key={member.id} 
              className={`carousel-item ${index === currentIndex ? 'active' : ''}`}
              style={{
                transform: `translateX(${(index - currentIndex) * 100}%)`
              }}
            >
              <MemberCard member={member} />
            </div>
          ))}
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
            onClick={() => {
              if (!isAnimating) {
                setIsAnimating(true);
                setCurrentIndex(index);
                setTimeout(() => setIsAnimating(false), 500);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default MemberCarousel;