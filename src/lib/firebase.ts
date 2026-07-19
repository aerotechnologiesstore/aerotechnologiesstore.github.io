import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAZMC9gBR2j_omhCDRHixBn-h5r1RePqIY",
  authDomain: "aero-store-b6a9b.firebaseapp.com",
  projectId: "aero-store-b6a9b",
  storageBucket: "aero-store-b6a9b.firebasestorage.app",
  messagingSenderId: "779360959349",
  appId: "1:779360959349:web:a17ed297270975cc1db13c",
};

// Prevent re-initialization in dev mode (hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
