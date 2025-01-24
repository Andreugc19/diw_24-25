$(document).ready(function() {
    const container = $('<div>').addClass('container');
    const imageBackground = $('<div>').addClass('image-background');
    const formContainer = $('<div>').addClass('form-container');

    const backButton = $('<a>').attr('href', 'admin.html').addClass('back-button').html('<i class="fas fa-arrow-left"></i>');
    const profileIcon = $('<div>').addClass('profile-icon').html('<i class="fas fa-user"></i>');

    const form = $('<form>').attr('id', 'login-form').attr('onsubmit', 'return validateForm(event)');

    const createInputContainer = (labelText, id, type, placeholder, iconClass) => {
        const container = $('<div>').addClass('input-container');
        const label = $('<label>').attr('for', id).text(labelText);
        const icon = $('<i>').addClass(iconClass);
        const input = $('<input>').attr({
            type: type,
            id: id,
            'aria-label': labelText,
            placeholder: placeholder,
            required: true
        });
        return container.append(label, icon, input);
    };

    form.append(
        createInputContainer('Name', 'name', 'text', 'Name', 'fas fa-user'),
        createInputContainer('Email', 'email', 'email', 'Email', 'fas fa-envelope'),
        createInputContainer('Password', 'password', 'password', 'Password', 'fas fa-lock')
    );

    const createCheckboxContainer = (labelText, id) => {
        const container = $('<div>').addClass('input-container');
        const label = $('<label>').attr('for', id).text(labelText);
        const checkbox = $('<input>').attr({
            type: 'checkbox',
            id: id
        });
        return container.append(label.prepend(checkbox));
    };

    form.append(
        createCheckboxContainer('Edit Users', 'edit-users'),
        createCheckboxContainer('Edit News', 'edit-news'),
        createCheckboxContainer('Edit Bone Files', 'edit-bone-files'),
        createCheckboxContainer('Active', 'active').find('input').prop('checked', true).end(),
        $('<button>').attr('type', 'submit').text('Modify')
    );

    const accessMenuButton = $('<i>').addClass('access-menu-button fa-solid fa-universal-access');

    formContainer.append(backButton, profileIcon, form, accessMenuButton);
    container.append(imageBackground, formContainer);
    $('body').append(container);

    const urlParams = new URLSearchParams(window.location.search);
    const userId = parseInt(urlParams.get('userId'));
    
    if (isNaN(userId)) {
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];
    let user = users.find(u => u.id === userId);

    if (user) {
        $('#name').val(user.name);
        $('#email').val(user.email);
        $('#password').val(""); 
        $('#edit-users').prop('checked', user.edit_users);
        $('#edit-news').prop('checked', user.edit_news);
        $('#edit-bone-files').prop('checked', user.edit_bone_files);
        $('#active').prop('checked', user.active);
    } else {
        alert("Usuario no encontrado.");
    }

    $('#login-form').on('submit', function(event) {
        event.preventDefault();

        const newPassword = $('#password').val().trim();

        if (newPassword) {
            const newSalt = CryptoJS.lib.WordArray.random(128/8).toString();
            const hashedPassword = CryptoJS.SHA256(newPassword + newSalt).toString();
    
            user.password_hash = hashedPassword;
            user.salt = newSalt;
        }

        user.name = $('#name').val();
        user.email = $('#email').val();
        user.password = $('#password').val(); 
        user.edit_users = $('#edit-users').is(':checked');
        user.edit_news = $('#edit-news').is(':checked');
        user.edit_bone_files = $('#edit-bone-files').is(':checked');
        user.active = $('#active').is(':checked');

        users = users.map(u => u.id === userId ? user : u);
        localStorage.setItem('users', JSON.stringify(users));

        window.location.href = 'admin.html';
    });
});