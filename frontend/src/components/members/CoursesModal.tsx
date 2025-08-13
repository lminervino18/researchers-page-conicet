import { FC, useEffect } from "react";
import { Author } from "../../api/authors";
import "./styles/CoursesModal.css";
import { useTranslation } from "react-i18next";

interface CoursesModalProps {
  member: Author;
  onClose: () => void;
}

const CoursesModal: FC<CoursesModalProps> = ({ member, onClose }) => {
  const { t } = useTranslation();
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const modal = document.querySelector(".courses-modal");
      if (modal && !modal.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="courses-modal-overlay">
      <div className="courses-modal">
        <button className="courses-modal-close" onClick={onClose}>
          &times;
        </button>
        <div className="courses-modal-content">
          <h2>{t("members.detail.courses_modal.teaching")}</h2>
          <h3>
            {member.firstName} {member.lastName}
          </h3>

          {member.courses.length > 0 ? (
            <ul className="courses-list">
              {member.courses.map((course) => (
                <li key={course.id} className="course-item">
                  <div className="course-details">
                    <h4>{t(course.name)}</h4>
                    <p>
                      <strong>
                        {t("members.detail.courses_modal.institution")}
                      </strong>{" "}
                      {course.institution}
                      <span className="course-year">({course.year})</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-courses">
              {t("members.detail.courses_modal.no_courses")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursesModal;
