import { getFirestore, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { app } from "./firebase.js";

const db = getFirestore(app);

async function changePassword(event) {
    event.preventDefault();

    const newPassword = document.getElementById('new-password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();
    const errorMessage = document.getElementById('error-message');

    errorMessage.style.display = 'none';
    errorMessage.textContent = '';

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;

    if (!passwordPattern.test(newPassword)) {
        errorMessage.textContent = 'La contrasenya ha de tenir al menys 12 caracters, inclosos una majúscula, una minúscula, un número i un carácter especial.';
        errorMessage.style.display = 'block';
        return false;
    }

    if (newPassword !== confirmPassword) {
        errorMessage.textContent = 'Les contrasenyes no son iguals.';
        errorMessage.style.display = 'block';
        return false;
    }

    const userId = sessionStorage.getItem("loggedInUserId");

    if (!userId) {
        window.location.href = "login.html";
        return false;
    }

    try {
        const users = doc(db, "users", userId);
        const userSnap = await getDoc(users);

        if (!userSnap.exists()) {
            window.location.href = "login.html";
            return false;
        }

        const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
        const hashedPassword = CryptoJS.SHA256(newPassword + salt).toString();

        await updateDoc(users, {
            password_hash: hashedPassword,
            salt: salt,
            is_first_login: false
        });

        sessionStorage.removeItem("loggedInUserId");
        window.location.href
        return true;
    } catch (error) {
        console.error("Error actualitzant la contrasenya", error);
        return false;
    }
}
window.changePassword = changePassword;