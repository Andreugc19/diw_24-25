import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDHPNdKl7YwOy32as71CsIWlI1ElrEabnY",
    authDomain: "act1-u5.firebaseapp.com",
    projectId: "act1-u5",
    storageBucket: "act1-u5.firebasestorage.app",
    messagingSenderId: "781058376389",
    appId: "1:781058376389:web:e47d47b660e82f4dd526ac"
  };
  
const app = initializeApp(firebaseConfig);

const db = getFirestore();

export { app, db };