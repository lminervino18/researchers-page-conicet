// src/components/members/MemberCard.tsx
import { FC } from 'react';
import { Author, calculateAge } from '../../api/authors';
import './styles/MemberCard.css';

interface MemberCardProps {
  member: Author;
}

const MemberCard: FC<MemberCardProps> = ({ member }) => {
  return (
    <div className="member-card">
      <div className="member-image">
        <img src={member.imageUrl} alt={`${member.firstName} ${member.lastName}`} />
      </div>
      <div className="member-info">
        <h2>{member.firstName} {member.lastName}</h2>
        <p className="member-position">{member.workingAt ? 'Researcher' : 'Independent Researcher'}</p>
        <p className="member-institution">Graduated from: {member.graduatedFrom}</p>
        {member.workingAt && <p className="member-institution">Works at: {member.workingAt}</p>}
        <p className="member-age">Age: {calculateAge(member.birthDate)}</p>
        {member.email && <a href={`mailto:${member.email}`} className="member-email">{member.email}</a>}
      </div>
    </div>
  );
};

export default MemberCard;
