import { FC } from 'react';
import { Author } from '../../api/authors';
import './styles/MemberGridItem.css';

interface MemberGridItemProps {
  member: Author;
  onClick: () => void;
}

const MemberGridItem: FC<MemberGridItemProps> = ({ member, onClick }) => {
  const roleLabel =
    member.role === 'principal' ? 'Principal Investigator' : 'Research Fellow';

  return (
    <div
      className={`member-grid-item ${member.role === 'fellow' ? 'fellow-size' : 'principal-size'}`}
      onClick={onClick}
    >
      <div className="member-grid-item-image">
        <img
          src={member.imageUrl}
          alt={`${member.firstName} ${member.lastName}`}
        />
      </div>
      <div className="member-grid-item-info">
        <h3>{member.firstName} {member.lastName}</h3>
        <p>{roleLabel}</p>
      </div>
    </div>
  );
};

export default MemberGridItem;
