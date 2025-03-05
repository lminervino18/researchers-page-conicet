// src/components/members/MemberCard.tsx
import { FC } from 'react';
import { Member } from '../../types/index';
import './styles/MemberCard.css';

interface MemberCardProps {
  member: Member;
}

const MemberCard: FC<MemberCardProps> = ({ member }) => {
  return (
    <div className="member-card">
      <div className="member-image">
        <img src={member.imageUrl} alt={`${member.name} ${member.lastName}`} />
      </div>
      <div className="member-info">
        <h2>{member.name} {member.lastName}</h2>
        <p className="member-position">{member.position}</p>
        <p className="member-institution">{member.institution}</p>
        <a href={`mailto:${member.email}`} className="member-email">
          {member.email}
        </a>
      </div>
    </div>
  );
};

export default MemberCard;