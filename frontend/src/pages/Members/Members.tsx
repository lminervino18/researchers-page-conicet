// src/pages/Members/Members.tsx
import { FC } from 'react';
import MainLayout from '../../layouts/MainLayout';
import MemberCarousel from '../../components/members/MemberCarousel';
import { Member } from '../../types';
import './styles/Members.css';

const Members: FC = () => {
  const members: Member[] = [
    {
      id: 1,
      name: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@research.edu',
      institution: 'University of Buenos Aires',
      position: 'Principal Investigator',
      imageUrl: '/src/assets/members/1.jpg'
    },
    {
      id: 2,
      name: 'Michael',
      lastName: 'Chen',
      email: 'm.chen@research.edu',
      institution: 'Cognitive Science Lab',
      position: 'Senior Researcher',
      imageUrl: '/src/assets/members/2.jpg'
    },
    {
      id: 3,
      name: 'Laura',
      lastName: 'García',
      email: 'l.garcia@research.edu',
      institution: 'Psychology Department',
      position: 'Research Associate',
      imageUrl: '/src/assets/members/3.jpeg'
    }
  ];

  return (
    <MainLayout>
      <div className="members-container">
        <section className="members-hero">
          <h1>Our Team</h1>
          <p>Meet the researchers driving innovation in cognitive psychology</p>
        </section>
        
        <section className="members-carousel-section">
          <MemberCarousel members={members} />
        </section>
      </div>
    </MainLayout>
  );
};

export default Members;