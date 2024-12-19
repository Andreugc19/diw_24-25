function validateForm(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const errorMessage = document.getElementById('error-message');

    const name = document.getElementById('name').value.trim();
    const editUsers = document.getElementById('edit-users').checked;
    const editNews = document.getElementById('edit-news').checked;
    const editBoneFiles = document.getElementById('edit-bone-files').checked;
    const active = document.getElementById('active').checked;

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailPattern.test(email)) {
        errorMessage.textContent = 'Por favor, ingresa un correo electrónico válido.';
        errorMessage.style.display = 'block';
        return false;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email);

    if (user) {
        errorMessage.textContent = 'El correo electrónico ya está en uso.';
        errorMessage.style.display = 'block';
        return false;
    }

    const predefinedPassword = "Ramis.20";
    const salt = CryptoJS.lib.WordArray.random(128/8).toString();
    const hashedPassword = CryptoJS.SHA256(predefinedPassword + salt).toString();

    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

    const newUser = {
        id: newId,
        name: name,
        email: email,
        password_hash: hashedPassword,
        salt: salt,
        edit_users: editUsers,
        edit_news: editNews,
        edit_bone_files: editBoneFiles,
        active: active,
        is_first_login: true
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    window.location.href = "admin.html";
    return true;
}

function validateLoginForm(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('error-message');

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailPattern.test(email)) {
        errorMessage.textContent = 'Por favor, ingresa un correo electrónico válido.';
        errorMessage.style.display = 'block';
        return false;
    }

    if (!password) {
        errorMessage.textContent = 'Por favor, ingresa tu contraseña.';
        errorMessage.style.display = 'block';
        return false;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email);

    if (!user) {
        errorMessage.textContent = 'Email o contraseña incorrectos.';
        errorMessage.style.display = 'block';
        return false;
    }

    const hashedPassword = CryptoJS.SHA256(password + user.salt).toString();
    if (user.password_hash !== hashedPassword) {
        errorMessage.textContent = 'Email o contraseña incorrectos.';
        errorMessage.style.display = 'block';
        return false;
    }

    if (user.active !== true) {
        errorMessage.textContent = 'Tu cuenta está inactiva. Contacta al administrador.';
        errorMessage.style.display = 'block';
        return false;
    }

    localStorage.setItem('loggedInUser', JSON.stringify(user));

    if (user.email === "desenvolupador@iesjoanramis.org") {
        window.location.href = "admin.html";  
        return true;
    }

    if (user.is_first_login) {
        window.location.href = "change-pwd.html"; 
    } else {
        window.location.href = "../html/index.html";
    }

    return true;
}

