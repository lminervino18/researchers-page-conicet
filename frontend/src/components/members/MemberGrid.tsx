import { FC, useState } from 'react';
import { Author } from '../../api/Authors';
import MemberGridItem from './MemberGridItem';
import MemberDetailModal from './MemberDetailModal';
import './styles/MemberGrid.css';

interface MemberGridProps {
  members: Author[];
}

const MemberGrid: FC<MemberGridProps> = ({ members }) => {
  const [selectedMember, setSelectedMember] = useState<Author | null>(null);

  const handleMemberClick = (member: Author) => {
    setSelectedMember(member);
  };

  const handleCloseModal = () => {
    setSelectedMember(null);
  };

  return (
    <div className="member-grid-container">
      <div className="member-grid">
        {members.map((member) => (
          <MemberGridItem 
            key={member.id} 
            member={member} 
            onClick={() => handleMemberClick(member)}
          />
        ))}
      </div>

      {selectedMember && (
        <MemberDetailModal 
          member={selectedMember} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
};

export default MemberGrid;