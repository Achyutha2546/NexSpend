import { initializeApp, getApps, getApp } from "firebase/app"
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  sendEmailVerification, 
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "firebase/auth"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAGT29WtMFwDMpkIQA-Ye_WWVHpGlKDFU0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nexspend-f7b31.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nexspend-f7b31",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nexspend-f7b31.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "701660143576",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:701660143576:web:a2404417187c0dd3889cad",
}

let app: any = null
let authInstance: any = null

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
  authInstance = getAuth(app)
} catch (err) {
  console.warn("Firebase initialization warning (using mock/fallback mode):", err)
  // Graceful fallback for Auth
  authInstance = {
    currentUser: null,
    onAuthStateChanged: (_cb: any) => () => {},
  } as any
}

export const auth = authInstance

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
}
