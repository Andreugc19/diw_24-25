import { getUserById, updateUser } from "./firebase.js";

$(document).ready(async function () {
    const container = $('<div>').addClass('container');
    const imageBackground = $('<div>').addClass('image-background');
    const formContainer = $('<div>').addClass('form-container');

    const backButton = $('<a>').attr('href', 'admin.html').addClass('back-button').html('<i class="fas fa-arrow-left"></i>');
    const profileIcon = $('<div>').addClass('profile-icon').html('<i class="fas fa-user"></i>');

    const form = $('<form>').attr('id', 'modify-user-form').on('submit', async function (event) {
        event.preventDefault();

        const name = $('#name').val().trim();
        const email = $('#email').val().trim();
        const password = $('#password').val().trim();
        const editUsers = $('#edit-users').is(':checked');
        const editNews = $('#edit-news').is(':checked');
        const editBoneFiles = $('#edit-bone-files').is(':checked');
        const active = $('#active').is(':checked');

        if (!name || !email) {
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('userId');

        const updateData = {
            name,
            email,
            edit_users: editUsers,
            edit_news: editNews,
            edit_bone_files: editBoneFiles,
            active
        };

        if (password) {
            updateData.password = password;
        }

        const success = await updateUser(userId, updateData);

        if (success) {
            window.location.href = 'admin.html';
        } else {
            console.error("Error al modificar el usuario.");
        }
    });

    const createInputContainer = (labelText, id, type, placeholder, iconClass) => {
        const container = $('<div>').addClass('input-container');
        const label = $('<label>').attr('for', id).text(labelText);
        const icon = $('<i>').addClass(iconClass);
        const input = $('<input>').attr({
            type: type,
            id: id,
            'aria-label': labelText,
            placeholder: placeholder
        });
        return container.append(label, icon, input);
    };

    form.append(
        createInputContainer('Nom', 'name', 'text', 'Nom', 'fas fa-user'),
        createInputContainer('Email', 'email', 'email', 'Email', 'fas fa-envelope'),
        createInputContainer('Contrasenya (Deixa-ho en blanc si no la vols canviar)', 'password', 'password', 'Contrasenya', 'fas fa-lock')
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
        $('<button>').attr('type', 'submit').text('Modificar')
    );

    const accessMenuButton = $('<i>').addClass('access-menu-button fa-solid fa-universal-access');

    formContainer.append(backButton, profileIcon, form, accessMenuButton);
    container.append(imageBackground, formContainer);
    $('body').append(container);

    async function loadUserData() {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('userId');
        const user = await getUserById(userId);

        if (!user) {
            alert("Usuari no trobat.");
            return;
        }

        $('#name').val(user.name);
        $('#email').val(user.email);
        $('#edit-users').prop('checked', user.edit_users);
        $('#edit-news').prop('checked', user.edit_news);
        $('#edit-bone-files').prop('checked', user.edit_bone_files);
        $('#active').prop('checked', user.active);
    }

    loadUserData();
});
