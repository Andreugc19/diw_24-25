function validateForm(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
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

    errorMessage.style.display = 'none';

    if (email !== 'user@gmail.com' || password !== 'Prova1.') {
        errorMessage.textContent = 'Email o contraseña incorrectos.';
        errorMessage.style.display = 'block';
        return false;
    }

    alert('Formulario enviado correctamente');
    return true;
}