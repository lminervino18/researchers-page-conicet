// frontend/src/api/authors.tsx
import RicardoMinervinoImg from '../assets/members/RicardoMinervino.jpg';
import MaximoTrenchImg from '../assets/members/MaximoTrench.jpg';

export interface Course {
  id: number;
  name: string;
  institution: string;
  year: number;
}

export interface Author {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  graduatedFrom: string;
  workingAt?: string;
  birthDate: string; // format: "YYYY-MM-DD"
  imageUrl: string;
  courses: Course[];
  description: string;
}

export const authors: Author[] = [
  {
    id: 1,
    firstName: "Ricardo",
    lastName: "Minervino",
    email: "minervinora@gmail.com",
    graduatedFrom: "UBA",
    workingAt: "UNCO",
    birthDate: "1963-01-01",
    imageUrl: RicardoMinervinoImg,
    courses: [
      {
        id: 1,
        name: "Cognitive Psychology Foundations",
        institution: "UBA",
        year: 1990
      },
      {
        id: 2,
        name: "Neuropsychological Research Methods",
        institution: "UNCO",
        year: 2000
      },
      {
        id: 3,
        name: "Advanced Cognitive Neuroscience",
        institution: "Harvard University",
        year: 2005
      }
    ],
    description: "Renowned cognitive psychology researcher with over 30 years of experience in studying mental processes, decision-making, and cognitive mechanisms. Specialized in experimental cognitive psychology, with a focus on perception, memory, and reasoning. Pioneered multiple research initiatives exploring the intricate relationships between cognitive functions and neural networks."
  },
  {
    id: 2,
    firstName: "Maximo",
    lastName: "Trench",
    email: "",
    graduatedFrom: "UBA",
    birthDate: "1983-03-01",
    imageUrl: MaximoTrenchImg,
    courses: [
      {
        id: 1,
        name: "Cognitive Neuroscience",
        institution: "UBA",
        year: 2010
      },
      {
        id: 2,
        name: "Computational Models of Cognition",
        institution: "MIT Online",
        year: 2015
      },
      {
        id: 3,
        name: "Cognitive Assessment and Intervention",
        institution: "Stanford University",
        year: 2018
      }
    ],
    description: "Innovative cognitive psychology researcher specializing in computational approaches to understanding mental processes. Expert in developing advanced cognitive models, exploring artificial intelligence applications in psychological research, and investigating the intersection of technology and cognitive science. Passionate about unraveling the complex mechanisms of human cognition through interdisciplinary research."
  },
];

export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  const dayDiff = today.getDate() - birth.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
};