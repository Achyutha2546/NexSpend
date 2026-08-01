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
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKeyForNexSpendDevelopmentOnly12345",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nexspend-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nexspend-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nexspend-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:1234567890abcdef",
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
