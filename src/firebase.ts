import { getApp, getApps, initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  getAuth,
  GoogleAuthProvider,
  indexedDBLocalPersistence,
  initializeAuth,
  setPersistence,
} from "firebase/auth";
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

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const createBrowserAuth = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch (error) {
    const existingAuth = getAuth(app);

    void setPersistence(existingAuth, browserLocalPersistence).catch((persistenceError) => {
      console.warn("Failed to restore Firebase auth persistence:", persistenceError);
    });

    if (import.meta.env.DEV) {
      console.warn("Reusing existing Firebase auth instance:", error);
    }

    return existingAuth;
  }
};

export const auth = createBrowserAuth() as ReturnType<typeof getAuth>;
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
