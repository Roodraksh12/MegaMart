import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBxehHv-qMlaKjiyjXoI06xKB1lud7ANyc",
  authDomain: "supermart-95146.firebaseapp.com",
  projectId: "supermart-95146",
  storageBucket: "supermart-95146.firebasestorage.app",
  messagingSenderId: "290003168045",
  appId: "1:290003168045:web:182ee975080859ecf141a4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
