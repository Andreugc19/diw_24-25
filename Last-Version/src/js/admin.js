import {  getUserById, getAllUsers, deleteUser } from "./firebase.js";

$(document).ready(async function () {
    if (window.location.pathname.endsWith("admin.html")) {
        const userId = sessionStorage.getItem("loggedInUserId");

        if (!userId) {
            window.location.href = "../html/login.html";
            return;
        }

        const loggedInUser = await getUserById(userId);
        
        if (!loggedInUser) {
            window.location.href = "../html/login.html";
            return;
        }

        if (!loggedInUser.edit_users) {
            window.location.href = "../html/index.html";
            return;
        }

        if (loggedInUser.is_first_login) {
            window.location.href = "../html/change-pwd.html";
            return;
        }
    }

    var adminContainer = $('<div>', { id: 'admin-container', class: 'admin-container' });
    var searchInput = $('<input>', {
        id: 'search-input',
        type: 'text',
        class: 'search-input',
        placeholder: 'Cercar per nom o email...'
    });
    
    var createBtn = $('<button>', { id: 'create-btn', class: 'create-btn', text: 'Crear' });
    
    adminContainer.append(createBtn);
    $('header').after(searchInput, adminContainer);

    $('#create-btn').on('click', function() {
        window.location.href = 'create-users.html';
    });

    async function loadUsers() {
        const users = await getAllUsers();
        renderUserList(users);
        return users;
    }

    function renderUserList(users) {
        var userListContainer = $('#user-list');
        if (userListContainer.length === 0) {
            userListContainer = $('<div>', { id: 'user-list', class: 'user-list' });
            adminContainer.append(userListContainer);
        } else {
            userListContainer.empty();
        }

        users.forEach(user => {
            var userItem = $('<div>', { class: 'user-item', 'data-user-id': user.id });
            var userName = $('<div>', { class: 'user-name', text: `Nom: ${user.name}` });
            var userEmail = $('<div>', { class: 'user-email', text: `Email: ${user.email}` });
            var userPassword = $('<div>', { class: 'user-password', text: `Contrasenya: *****` });
            var modifyBtn = $('<button>', { class: 'modify-btn', text: 'Modificar' });
            var deleteBtn = $('<button>', { class: 'delete-btn', text: 'Eliminar' });
            
            modifyBtn.on('click', function () {
                window.location.href = `modify-users.html?userId=${user.id}`;
            });

            deleteBtn.on('click', function () {
                showDeletePopup(user.id);
            });

            if (user.name === "admin") deleteBtn.hide();
            
            userItem.append(userName, userEmail, userPassword, modifyBtn, deleteBtn);
            userListContainer.append(userItem);
        });
    }

    $('#search-input').on('input', async function () {
        const searchTerm = $(this).val().toLowerCase();
        const users = await loadUsers();
        const filteredUsers = users.filter(user => 
            user.name.toLowerCase().includes(searchTerm) || 
            user.email.toLowerCase().includes(searchTerm)
        );
        renderUserList(filteredUsers);
    });

    function showDeletePopup(userId) {
        const popup = $('<div>', { class: 'popup-overlay' });
        const popupContent = $('<div>', { class: 'popup-content' });
        const title = $('<h2>', { text: 'Confirmar Eliminación' });
        const message = $('<p>', { text: 'Estas segur de eliminar a aquest usuari?' });
        const confirmBtn = $('<button>', { text: 'Si, Eliminar', class: 'popup-btn confirm-delete' });
        const cancelBtn = $('<button>', { text: 'Cancelar', class: 'popup-btn cancel-delete' });

        confirmBtn.on('click', async function () {
            await deleteUser(userId);
            popup.fadeOut(() => {
                popup.remove();
                location.reload();
            });
        });

        cancelBtn.on('click', function () {
            popup.fadeOut(() => popup.remove());
        });

        popupContent.append(title, message, confirmBtn, cancelBtn);
        popup.append(popupContent).hide().fadeIn();
        $('body').append(popup);
    }

    loadUsers();
});
