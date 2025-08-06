import { FC, useEffect, useState } from 'react';
import { Author, calculateAge } from '../../api/authors';
import CoursesModal from './CoursesModal';
import PublicationsModal from './PublicationsModal';
import './styles/MemberDetailModal.css';

interface MemberDetailModalProps {
  member: Author;
  onClose: () => void;
}

const MemberDetailModal: FC<MemberDetailModalProps> = ({ member, onClose }) => {
  const [showCoursesModal, setShowCoursesModal] = useState(false);
  const [showPublicationsModal, setShowPublicationsModal] = useState(false);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !showCoursesModal && !showPublicationsModal) {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const modal = document.querySelector('.member-detail-modal');
      if (modal && !modal.contains(event.target as Node) &&
          !showCoursesModal && !showPublicationsModal) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, showCoursesModal, showPublicationsModal]);

  const handleViewCourses = () => {
    setShowCoursesModal(true);
  };

  const handleCloseCoursesModal = () => {
    setShowCoursesModal(false);
  };

  const handleViewPublications = () => {
    setShowPublicationsModal(true);
  };

  const handleClosePublicationsModal = () => {
    setShowPublicationsModal(false);
  };

  const roleLabel =
    member.role === 'principal' ? 'Principal Investigator' : 'Research Fellow';

  return (
    <>
      <div className="member-detail-modal-overlay">
        <div className="member-detail-modal">
          <button className="member-detail-modal-close" onClick={onClose}>
            &times;
          </button>
          <div className="member-detail-content">
            <div className="member-detail-image">
              <img
                src={member.imageUrl}
                alt={`${member.firstName} ${member.lastName}`}
              />
            </div>
            <div className="member-detail-info">
              <h2>{member.firstName} {member.lastName}</h2>
              <p className="member-detail-position">
                {roleLabel}
              </p>
              <div className="member-detail-metadata">
                <p>
                  <strong>Graduated from:</strong> {member.graduatedFrom}
                </p>
                {member.workingAt && (
                  <p>
                    <strong>Works at:</strong> {member.workingAt}
                  </p>
                )}
                <p>
                  <strong>Age:</strong> {calculateAge(member.birthDate)}
                </p>
                {member.email && (
                  <p>
                    <strong>Email:</strong>{' '}
                    <a href={`mailto:${member.email}`}>{member.email}</a>
                  </p>
                )}
              </div>
              <div className="member-detail-description">
                <h3>About</h3>
                <p>{member.description}</p>
              </div>
              <div className="member-detail-actions">
                <button
                  className="member-detail-courses-btn"
                  onClick={handleViewCourses}
                >
                  View Courses
                </button>
                <button
                  className="member-detail-publications-btn"
                  onClick={handleViewPublications}
                >
                  View Publications
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCoursesModal && (
        <CoursesModal
          member={member}
          onClose={handleCloseCoursesModal}
        />
      )}

      {showPublicationsModal && (
        <PublicationsModal
          authorName={`${member.firstName} ${member.lastName}`}
          onClose={handleClosePublicationsModal}
        />
      )}
    </>
  );
};

export default MemberDetailModal;
