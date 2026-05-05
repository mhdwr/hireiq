import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyC1gEJsUhfWKw2xvvObLDdafehDf3rwHkM",
  authDomain: "hireiq-9a7b8.firebaseapp.com",
  projectId: "hireiq-9a7b8",
  storageBucket: "hireiq-9a7b8.firebasestorage.app",
  messagingSenderId: "464924457511",
  appId: "1:464924457511:web:10b6000014a206ded4ec02"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)