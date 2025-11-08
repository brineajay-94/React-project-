
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, addDoc, getDocs, getDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, where } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBkr1ml_Wjn9-X0O8vMT2EYGqPLQoc20hA",
  authDomain: "project-1-1e6b0.firebaseapp.com",
  projectId: "project-1-1e6b0",
  storageBucket: "project-1-1e6b0.firebasestorage.app",
  messagingSenderId: "866037851899",
  appId: "1:866037851899:web:5051d29995fe88bcbd725e",
  measurementId: "G-DK96S8GVBZ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, doc, addDoc, getDocs, getDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, where };
