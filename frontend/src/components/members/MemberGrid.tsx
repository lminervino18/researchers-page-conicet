import { FC, useState } from 'react';
import { Author } from '../../api/authors';
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

  // Separate members by role
  const principals = members.filter((m) => m.role === 'principal');
  const fellows = members.filter((m) => m.role === 'fellow');

  return (
    <div className="member-grid-container">
      {/* Principals */}
      <h2 className="member-section-title centered">Principals</h2>
      <div className="member-grid centered-grid">
        {principals.map((member) => (
          <MemberGridItem
            key={member.id}
            member={member}
            onClick={() => handleMemberClick(member)}
          />
        ))}
      </div>

      {/* Fellows */}
      {fellows.length > 0 && (
        <>
          <h2 className="member-section-title centered">Fellows</h2>
          <div className="fellows-list centered-list">
            {fellows.map((member) => (
              <MemberGridItem
                key={member.id}
                member={member}
                onClick={() => handleMemberClick(member)}
              />
            ))}
          </div>
        </>
      )}

      {/* Modal */}
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
