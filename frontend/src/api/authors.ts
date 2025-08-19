// frontend/src/api/authors.tsx
import RicardoMinervinoImg from "../assets/members/RicardoMinervino.jpg";
import MaximoTrenchImg from "../assets/members/MaximoTrench.jpg";
import SofiaMartinezImg from "../assets/members/SofiaMartinez.jpg";
import JuanPerezImg from "../assets/members/JuanPerez.jpg";

export interface Course {
  id: number;
  name: string;
  institution: string;
  year: number;
}

export type AuthorRole = "principal" | "fellow";

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
        name: "members.courses.cognitive_psychology_foundations",
        institution: "UBA",
        year: 1990,
      },
      {
        id: 2,
        name: "members.courses.neuropsychological_research_methods",
        institution: "UNCO",
        year: 2000,
      },
      {
        id: 3,
        name: "members.courses.advanced_cognitive_neuroscience",
        institution: "Harvard University",
        year: 2005,
      },
    ],
    description: "members.authors.1.description",
    role: "principal",
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
        name: "members.courses.cognitive_neuroscience",
        institution: "UBA",
        year: 2010,
      },
      {
        id: 2,
        name: "members.courses.computational_models_of_cognition",
        institution: "MIT Online",
        year: 2015,
      },
      {
        id: 3,
        name: "members.courses.cognitive_assessment_and_intervention",
        institution: "Stanford University",
        year: 2018,
      },
    ],
    description: "members.authors.2.description",
    role: "principal",
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
        name: "members.courses.neurocognitive_development",
        institution: "UNLP",
        year: 2018,
      },
      {
        id: 2,
        name: "members.courses.experimental_psychology_methods",
        institution: "UBA",
        year: 2020,
      },
    ],
    description: "members.authors.3.description",
    role: "fellow",
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
        name: "members.courses.behavioral_neuroscience",
        institution: "UNC",
        year: 2017,
      },
      {
        id: 2,
        name: "members.courses.statistical_analysis_for_psychology",
        institution: "UBA",
        year: 2019,
      },
    ],
    description: "members.authors.4.description",
    role: "fellow",
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
