// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAQ1LWefgFD87xNo9QeJsy8_KwLH2HZlXc",
  authDomain: "studenthousingapp-eb231.firebaseapp.com",
  projectId: "studenthousingapp-eb231",
  storageBucket: "studenthousingapp-eb231.firebasestorage.app",
  messagingSenderId: "555329760418",
  appId: "1:555329760418:web:6dad6b3971735fa6c43bfb",
  measurementId: "G-MSHVFQ5NB6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const userCredential = auth.currentUser;
export default app;