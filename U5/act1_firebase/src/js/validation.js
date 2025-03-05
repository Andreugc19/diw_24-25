import { createAdminUserIfNotExists, isEmailTaken, createUser, authenticateUser } from "./firebase.js";

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
        errorMessage.textContent = 'Per favor, introdueix un correu electrónic vàlid.';
        errorMessage.style.display = 'block';
        return false;
    }

    if (await isEmailTaken(email)) {
        errorMessage.textContent = 'El correu electrónic ja està emprant-se a una altra conta.';
        errorMessage.style.display = 'block';
        return false;
    }

    const success = await createUser({ name, email, edit_users: editUsers, edit_news: editNews, edit_bone_files: editBoneFiles, active });

    if (success) {
        window.location.href = "admin.html";
    } else {
        errorMessage.textContent = 'Error al crear el usuario.';
        errorMessage.style.display = 'block';
    }

    return success;
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

    const user = await authenticateUser(email, password);

    if (!user) {
        errorMessage.textContent = 'Email o contrasenya incorrectes.';
        errorMessage.style.display = 'block';
        return false;
    }

    sessionStorage.setItem("loggedInUserId", user.id);

    if (user.email.trim().toLowerCase() === "desenvolupador@iesjoanramis.org") {
        window.location.href = "admin.html";
    } else if (user.is_first_login) {
        window.location.href = "change-pwd.html";
    } else {
        window.location.href = "../html/index.html";
    }

    return true;
}

createAdminUserIfNotExists();

window.validateForm = validateForm;
window.validateLoginForm = validateLoginForm;
