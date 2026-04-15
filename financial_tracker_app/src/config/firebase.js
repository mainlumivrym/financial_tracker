import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBTAXTAxZzrkgtlQzytocsRLpYczFL8m0k",
  authDomain: "financial-tracker-c6577.firebaseapp.com",
  projectId: "financial-tracker-c6577",
  storageBucket: "financial-tracker-c6577.firebasestorage.app",
  messagingSenderId: "496881441828",
  appId: "1:496881441828:web:1567d18678f76ab9dcccb1",
  measurementId: "G-DVCGMDNETP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
