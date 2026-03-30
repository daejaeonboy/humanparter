import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase User Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZ4g-3d_-jn2eD5hNv96Ve4Z9x6Pkd12c",
  authDomain: "humanpartner-77b4c.firebaseapp.com",
  projectId: "humanpartner-77b4c",
  storageBucket: "humanpartner-77b4c.firebasestorage.app",
  messagingSenderId: "1094867576814",
  appId: "1:1094867576814:web:1666b8e9692bb26f2d90ff",
  measurementId: "G-02W6YXECKW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = (typeof window !== 'undefined' ? getAuth(app) : null) as ReturnType<typeof getAuth>;
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
