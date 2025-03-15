// src/components/members/MemberCarousel.tsx
import { FC, useState } from 'react';
import { Author } from '../../api/authors';
import MemberCard from './MemberCard';
import './styles/MemberCarousel.css';

interface MemberCarouselProps {
  members: Author[];
}

const MemberCarousel: FC<MemberCarouselProps> = ({ members }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev === 0 ? members.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % members.length);
  };

  return (
    <div className="carousel-container">
      <button className="carousel-arrow prev" onClick={handlePrevious}>
        {"<"}
      </button>
      <div className="carousel-window">
        <div
          className="carousel-content"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {members.map((member) => (
            <div key={member.id} className="carousel-item">
              <MemberCard member={member} />
            </div>
          ))}
        </div>
      </div>
      <button className="carousel-arrow next" onClick={handleNext}>
        {">"}
      </button>
    </div>
  );

};

export default MemberCarousel;
