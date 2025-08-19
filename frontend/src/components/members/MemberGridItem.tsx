import { FC } from "react";
import { Author } from "../../api/authors";
import "./styles/MemberGridItem.css";
import { useTranslation } from "react-i18next";

interface MemberGridItemProps {
  member: Author;
  onClick: () => void;
}

const MemberGridItem: FC<MemberGridItemProps> = ({ member, onClick }) => {
  const { t } = useTranslation();

  return (
    <div
      className={`member-grid-item ${
        member.role === "fellow" ? "fellow-size" : "principal-size"
      }`}
      onClick={onClick}
    >
      <div className="member-grid-item-image">
        <img
          src={member.imageUrl}
          alt={`${member.firstName} ${member.lastName}`}
        />
      </div>
      <div className="member-grid-item-info">
        <h3>
          {member.firstName} {member.lastName}
        </h3>
        <p>{t(`members.roles.${member.role}`)}</p>
      </div>
    </div>
  );
};

export default MemberGridItem;
