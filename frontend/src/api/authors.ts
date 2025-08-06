// frontend/src/api/authors.tsx
import RicardoMinervinoImg from '../assets/members/RicardoMinervino.jpg';
import MaximoTrenchImg from '../assets/members/MaximoTrench.jpg';
import SofiaMartinezImg from '../assets/members/SofiaMartinez.jpg';
import JuanPerezImg from '../assets/members/JuanPerez.jpg';

export interface Course {
  id: number;
  name: string;
  institution: string;
  year: number;
}

export type AuthorRole = 'principal' | 'fellow';

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
  role: AuthorRole;
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
    description: "Renowned cognitive psychology researcher with over 30 years of experience in studying mental processes, decision-making, and cognitive mechanisms. Specialized in experimental cognitive psychology, with a focus on perception, memory, and reasoning. Pioneered multiple research initiatives exploring the intricate relationships between cognitive functions and neural networks.",
    role: "principal"
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
    description: "Innovative cognitive psychology researcher specializing in computational approaches to understanding mental processes. Expert in developing advanced cognitive models, exploring artificial intelligence applications in psychological research, and investigating the intersection of technology and cognitive science. Passionate about unraveling the complex mechanisms of human cognition through interdisciplinary research.",
    role: "principal"
  },
  {
    id: 3,
    firstName: "Sofía",
    lastName: "Martínez",
    email: "sofia.martinez@example.com",
    graduatedFrom: "UNLP",
    workingAt: "CONICET Fellowship Program",
    birthDate: "1995-07-14",
    imageUrl: SofiaMartinezImg,
    courses: [
      {
        id: 1,
        name: "Neurocognitive Development",
        institution: "UNLP",
        year: 2018
      },
      {
        id: 2,
        name: "Experimental Psychology Methods",
        institution: "UBA",
        year: 2020
      }
    ],
    description: "Fellow researcher focusing on neurocognitive development in children, with a particular interest in early language acquisition and memory processes. Currently collaborating on experimental design and data analysis within the lab.",
    role: "fellow"
  },
  {
    id: 4,
    firstName: "Juan",
    lastName: "Pérez",
    email: "juan.perez@example.com",
    graduatedFrom: "UNC",
    workingAt: "CONICET Fellowship Program",
    birthDate: "1994-11-23",
    imageUrl: JuanPerezImg,
    courses: [
      {
        id: 1,
        name: "Behavioral Neuroscience",
        institution: "UNC",
        year: 2017
      },
      {
        id: 2,
        name: "Statistical Analysis for Psychology",
        institution: "UBA",
        year: 2019
      }
    ],
    description: "Fellow researcher working on cognitive-behavioral correlations and applying advanced statistical techniques to analyze complex experimental data in behavioral neuroscience.",
    role: "fellow"
  }
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
