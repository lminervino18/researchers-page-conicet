// src/api/firebase.ts
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDvF61-wBXgsVIwaZxdYgwOXDZqpvpuC3E",
  authDomain: "analogy-research-group-page.firebaseapp.com",
  projectId: "analogy-research-group-page",
  storageBucket: "analogy-research-group-page.appspot.com",
  messagingSenderId: "673174100825",
  appId: "1:673174100825:web:431e3e75afea6d3425ca48",
  measurementId: "G-9NRGXDGYZ5"
};

export const app = initializeApp(firebaseConfig);
