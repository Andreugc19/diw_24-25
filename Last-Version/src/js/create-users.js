import { createUsers } from "./firebase.js";

$(document).ready(function () {
    const container = $('<div>').addClass('container');
    const imageBackground = $('<div>').addClass('image-background');
    const formContainer = $('<div>').addClass('form-container');

    const backButton = $('<a>').attr('href', 'admin.html').addClass('back-button').html('<i class="fas fa-arrow-left"></i>');
    const profileIcon = $('<div>').addClass('profile-icon').html('<i class="fas fa-user"></i>');

    const form = $('<form>').attr('id', 'create-user-form').on('submit', async function (event) {
        event.preventDefault();

        const name = $('#name').val().trim();
        const email = $('#email').val().trim();
        const editUsers = $('#edit-users').is(':checked');
        const editNews = $('#edit-news').is(':checked');
        const editBoneFiles = $('#edit-bone-files').is(':checked');
        const active = $('#active').is(':checked');

        if (!name || !email) {
            return;
        }

        const userData = { name, email, editUsers, editNews, editBoneFiles, active };

        const success = await createUsers(userData);

        if (success) {
            window.location.href = 'admin.html';
        } else {
            console.error("Error al crear el usuario.");
        }
    });

    const createInputContainer = (labelText, id, type, placeholder, autocomplete, iconClass) => {
        const container = $('<div>').addClass('input-container');
        const label = $('<label>').attr('for', id).text(labelText);
        const icon = $('<i>').addClass(iconClass);
        const input = $('<input>').attr({
            type: type,
            id: id,
            'aria-label': labelText,
            placeholder: placeholder,
            autocomplete: autocomplete,
            required: true
        });
        return container.append(label, icon, input);
    };

    form.append(
        createInputContainer('Nom', 'name', 'text', 'Nom', 'name', 'fas fa-user'),
        createInputContainer('Email', 'email', 'email', 'Email', 'email', 'fas fa-envelope')
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
        createCheckboxContainer('Editar Usuaris', 'edit-users'),
        createCheckboxContainer('Editar Noticies', 'edit-news'),
        createCheckboxContainer('Editar Fitxers Osos', 'edit-bone-files'),
        createCheckboxContainer('Actiu', 'active').find('input').prop('checked', true).end(),
        $('<button>').attr('type', 'submit').text('Crear')
    );

    const accessMenuButton = $('<i>').addClass('access-menu-button fa-solid fa-universal-access');

    formContainer.append(backButton, profileIcon, form, accessMenuButton);
    container.append(imageBackground, formContainer);
    $('body').append(container);
});
