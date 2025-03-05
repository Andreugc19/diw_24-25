import { updateUserPassword } from "./firebase.js";

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

    const success = await updateUserPassword(userId, newPassword);

    if (success) {
        sessionStorage.removeItem("loggedInUserId");
        window.location.href = "login.html";
    } else {
        errorMessage.textContent = 'Error al actualizar la contrasenya. Intenta de nuevo.';
        errorMessage.style.display = 'block';
    }

    return success;
}

window.changePassword = changePassword;