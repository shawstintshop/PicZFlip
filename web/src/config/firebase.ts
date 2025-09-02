import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCuvvS6MCIGqqCqMsvoghRYY09fJPxxDAM",
  authDomain: "piczflip-beta.firebaseapp.com",
  projectId: "piczflip-beta",
  storageBucket: "piczflip-beta.firebasestorage.app",
  messagingSenderId: "1044129069360",
  appId: "1:1044129069360:web:161fe3a7e4f139d322b0f5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Configure functions region
functions.region = 'us-central1';

export default app;
