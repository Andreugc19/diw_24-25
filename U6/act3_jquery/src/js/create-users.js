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
        createInputContainer('Email', 'email', 'email', 'Email', 'fas fa-envelope')
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
        $('<button>').attr('type', 'submit').text('Create')
    );

    const accessMenuButton = $('<i>').addClass('access-menu-button fa-solid fa-universal-access');

    formContainer.append(backButton, profileIcon, form, accessMenuButton);
    container.append(imageBackground, formContainer);
    $('body').append(container);
});