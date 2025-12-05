import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyATzmv8cxXb9k7-Xk5jINOWGmeEQZhqNGw",
  authDomain: "postflow-96307.firebaseapp.com",
  projectId: "postflow-96307",
  storageBucket: "postflow-96307.firebasestorage.app",
  messagingSenderId: "56647405942",
  appId: "1:56647405942:web:4c60650cf8a59cffcb6a57"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;