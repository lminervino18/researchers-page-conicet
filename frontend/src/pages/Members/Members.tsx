import { FC } from 'react';
import MainLayout from '../../layouts/MainLayout';
import MemberGrid from '../../components/members/MemberGrid';
import { authors } from '../../api/Authors';
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

        <section className="members-grid-section">
          <MemberGrid members={authors} />
        </section>
      </div>
    </MainLayout>
  );
};

export default Members;