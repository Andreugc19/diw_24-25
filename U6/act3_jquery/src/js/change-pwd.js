function changePassword(event) {
    event.preventDefault();

    const newPassword = document.getElementById('new-password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();
    const errorMessage = document.getElementById('error-message');

    errorMessage.style.display = 'none';
    errorMessage.textContent = '';

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;

    if (!passwordPattern.test(newPassword)) {
        errorMessage.textContent = 'La contraseña debe tener al menos 12 caracteres, incluyendo una mayúscula, una minúscula, un número y un carácter especial.';
        errorMessage.style.display = 'block';
        return false;
    }

    if (newPassword !== confirmPassword) {
        errorMessage.textContent = 'Las contraseñas no coinciden.';
        errorMessage.style.display = 'block';
        return false;
    }

    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (!loggedInUser) {
        window.location.href = "login.html";
        return false;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === loggedInUser.id);

    if (!user) {
        return false;
    }

    const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
    const hashedPassword = CryptoJS.SHA256(newPassword + salt).toString();

    user.password_hash = hashedPassword;
    user.salt = salt;
    user.is_first_login = false;

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.removeItem('loggedInUser');

    window.location.href = "login.html";
    return true;
}