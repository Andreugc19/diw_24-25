import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyC082oOhJOg2irxPCi3ldEoB_cHHjiPBEM",
    authDomain: "tasks-8e33c.firebaseapp.com",
    projectId: "tasks-8e33c",
    storageBucket: "tasks-8e33c.firebasestorage.app",
    messagingSenderId: "459940229823",
    appId: "1:459940229823:web:c8a7860972449c4aa18c0a"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore();

export { app, db };