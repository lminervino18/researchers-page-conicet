// frontend/src/api/authors.tsx
import RicardoMinervinoImg from '../assets/members/RicardoMinervino.jpg';
import MaximoTrenchImg from '../assets/members/MaximoTrench.jpg';

export interface Author {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  graduatedFrom: string;
  workingAt?: string;
  birthDate: string; // format: "YYYY-MM-DD"
  imageUrl: string;
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
  },
  {
    id: 2,
    firstName: "Maximo",
    lastName: "Trench",
    email: "",
    graduatedFrom: "UBA",
    birthDate: "1983-03-01",
    imageUrl: MaximoTrenchImg,
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
