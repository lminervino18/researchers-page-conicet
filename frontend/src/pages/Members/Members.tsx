import { FC } from 'react';
import MainLayout from '../../layouts/MainLayout';
import MemberCarousel from '../../components/members/MemberCarousel';
import { authors } from '../../api/authors';
import './styles/Members.css';

const Members: FC = () => {
  return (
    <MainLayout>
      <div className="members-container">
        <section className="members-hero">
          <h1>Our Team</h1>
          <p>
            Meet our researchers specialized in Cognitive Psychology.
          </p>
        </section>

        <section className="members-carousel-section">
          <MemberCarousel members={authors} />
        </section>
      </div>
    </MainLayout>
  );
};

export default Members;
