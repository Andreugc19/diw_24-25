// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, onSnapshot, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC082oOhJOg2irxPCi3ldEoB_cHHjiPBEM",
    authDomain: "tasks-8e33c.firebaseapp.com",
    projectId: "tasks-8e33c",
    storageBucket: "tasks-8e33c.firebasestorage.app",
    messagingSenderId: "459940229823",
    appId: "1:459940229823:web:c8a7860972449c4aa18c0a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore();

export const saveTask = (title, description, priority) =>
    addDoc(collection(db, "users"), { title, description, priority });

export const getTasks = () => getDocs(collection(db, "users"));

export const onGetTasks = (callBack) => 
    onSnapshot(collection(db, "users"), callBack);

// Función para eliminar una tarea
export const deleteTask = (id) => deleteDoc(doc(db, "users", id));

// export {
//     onSnapshot, collection, db
// };