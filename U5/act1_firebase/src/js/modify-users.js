import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { app } from "./firebase.js";

const db = getFirestore(app);

$(document).ready(async function() {
    const container = $('<div>').addClass('container');
    const imageBackground = $('<div>').addClass('image-background');
    const formContainer = $('<div>').addClass('form-container');

    const backButton = $('<a>').attr('href', 'admin.html').addClass('back-button').html('<i class="fas fa-arrow-left"></i>');
    const profileIcon = $('<div>').addClass('profile-icon').html('<i class="fas fa-user"></i>');

    const form = $('<form>').attr('id', 'modify-user-form').on('submit', async function(event) {
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
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return;
        }

        const updateData = {
            name: name,
            email: email,
            edit_users: editUsers,
            edit_news: editNews,
            edit_bone_files: editBoneFiles,
            active: active
        };

        if (password) {
            const salt = CryptoJS.lib.WordArray.random(128/8).toString();
            const hashedPassword = CryptoJS.SHA256(password + salt).toString();
            updateData.password_hash = hashedPassword;
            updateData.salt = salt;
        }

        try {
            await updateDoc(userRef, updateData);
            window.location.href = 'admin.html';
        } catch (error) {
            console.error('Error modificant a l\'usuari:', error);
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
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            alert("Usuari no trobat.");
            return;
        }

        const user = userSnap.data();
        $('#name').val(user.name);
        $('#email').val(user.email);
        $('#edit-users').prop('checked', user.edit_users);
        $('#edit-news').prop('checked', user.edit_news);
        $('#edit-bone-files').prop('checked', user.edit_bone_files);
        $('#active').prop('checked', user.active);
    }

    loadUserData();
});