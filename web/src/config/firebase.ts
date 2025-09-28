import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';

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

// Initialize Firebase AI Logic with Gemini Developer API
export const ai = getAI(app, { backend: new GoogleAIBackend() });

// Create Gemini model instance
export const geminiModel = getGenerativeModel(ai, { model: "gemini-2.0-flash-exp" });

// Configure functions region
functions.region = 'us-central1';

export default app;
