import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { db } from "./firebase.js";

async function validateForm(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const errorMessage = document.getElementById('error-message');
    const name = document.getElementById('name').value.trim();
    const editUsers = document.getElementById('edit-users').checked;
    const editNews = document.getElementById('edit-news').checked;
    const editBoneFiles = document.getElementById('edit-bone-files').checked;
    const active = document.getElementById('active').checked;

    errorMessage.style.display = 'none';
    errorMessage.textContent = '';

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailPattern.test(email)) {
        errorMessage.textContent = 'Per favor, introdueix un correu electrónic válid.';
        errorMessage.style.display = 'block';
        return false;
    }

    const usersSnapshot = await getDocs(collection(db, "users"));
    const existingUser = usersSnapshot.docs.find(doc => doc.data().email === email);

    if (existingUser) {
        errorMessage.textContent = 'El correu electrónic ja se esta emprant a una altra conta.';
        errorMessage.style.display = 'block';
        return false;
    }

    const predefinedPassword = "Ramis.20";
    const salt = CryptoJS.lib.WordArray.random(128/8).toString();
    const hashedPassword = CryptoJS.SHA256(predefinedPassword + salt).toString();

    try {
        await addDoc(collection(db, "users"), {
            name: name,
            email: email,
            password_hash: hashedPassword,
            salt: salt,
            edit_users: editUsers,
            edit_news: editNews,
            edit_bone_files: editBoneFiles,
            active: active,
            is_first_login: true
        });
        window.location.href = "admin.html";
        return true;
    } catch (error) {
        return false;
    }
}

async function validateLoginForm(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('error-message');

    errorMessage.style.display = 'none';
    errorMessage.textContent = '';

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailPattern.test(email)) {
        errorMessage.textContent = 'Per favor, introdueix un correu electrónic vàlid.';
        errorMessage.style.display = 'block';
        return false;
    }

    if (!password) {
        errorMessage.textContent = 'Per favor, introdueix la teva contrasenya.';
        errorMessage.style.display = 'block';
        return false;
    }

    try {
        const users = collection(db, "users");
        const querySnapshot = await getDocs(users);
        const userDoc = querySnapshot.docs.find(doc => doc.data().email.trim().toLowerCase() === email);

        if (!userDoc) {
            errorMessage.textContent = 'Email o contrasenya incorrectes.';
            errorMessage.style.display = 'block';
            return false;
        }

        const user = userDoc.data();

        if (!user.salt || !user.password_hash) {
            errorMessage.textContent = 'Error amb el compte. Contacta amb l\'administrador.';
            errorMessage.style.display = 'block';
            return false;
        }

        const hashedPassword = CryptoJS.SHA256(password + user.salt).toString();
        if (user.password_hash !== hashedPassword) {
            errorMessage.textContent = 'Email o contrasenya incorrectes.';
            errorMessage.style.display = 'block';
            return false;
        }

        if (user.active !== true) {
            errorMessage.textContent = 'La teva conta està inactiva. Contacta amb l\'administrador.';
            errorMessage.style.display = 'block';
            return false;
        }

        sessionStorage.setItem("loggedInUserId", userDoc.id);

        if (user.email.trim().toLowerCase() === "desenvolupador@iesjoanramis.org") {
            window.location.href = "admin.html";
        } else if (user.is_first_login) {
            window.location.href = "change-pwd.html";
        } else {
            window.location.href = "../html/index.html";
        }

        return true;
    } catch (error) {
        errorMessage.textContent = 'Hi ha hagut un error. Torna-ho a provar.';
        errorMessage.style.display = 'block';
        return false;
    }
}

window.validateForm = validateForm;
window.validateLoginForm = validateLoginForm;