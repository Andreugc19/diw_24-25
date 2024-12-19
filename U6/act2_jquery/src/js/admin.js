$(document).ready(function() {
    if (window.location.pathname.endsWith("admin.html")) {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

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

    var adminContainer = $('<div>', {
        id: 'admin-container',
        class: 'admin-container'
    });

    var createBtn = $('<button>', {
        id: 'create-btn',
        class: 'create-btn',
        text: 'Create'
    });
    
    adminContainer.append(createBtn);
    $('header').after(adminContainer);

    $('#create-btn').on('click', function() {
        window.location.href = 'create-users.html';
    });

    if (!localStorage.getItem('users')) {
        const password = "Ramis.20";
        const salt = CryptoJS.lib.WordArray.random(16).toString();
        const saltedPassword = password + salt;
        const passwordHash = CryptoJS.SHA256(saltedPassword).toString();
    
        const defaultUser = {
            id: 1,
            name: "admin",
            email: "desenvolupador@iesjoanramis.org",
            password_hash: passwordHash,
            salt: salt,
            edit_users: true,
            edit_news: true,
            edit_bone_files: true,
            active: true,
        };
    
        localStorage.setItem('users', JSON.stringify([defaultUser]));
    }
    
    var users = JSON.parse(localStorage.getItem('users')) || [];

    var userListContainer = $('<div>', {
        id: 'user-list',
        class: 'user-list'
    });

    var searchContainer = $('<div>', {
        id: 'search-container',
        class: 'search-container'
    });

    var searchInput = $('<input>', {
        type: 'text',
        id: 'search-input',
        class: 'search-input',
        placeholder: 'Buscar usuario por nombre...'
    });

    searchContainer.append(searchInput);
    $('header').after(searchContainer);

    function renderUserList(filteredUsers) {
        userListContainer.empty();

        filteredUsers.forEach(function(user) {
            var userItem = $('<div>', {
                class: 'user-item',
                'data-user-id': user.id
            });

            var userName = $('<div>', {
                class: 'user-name',
                text: `Name: ${user.name}`
            });

            var userEmail = $('<div>', {
                class: 'user-email',
                text: `Email: ${user.email}`
            });

            var userPassword = $('<div>', {
                class: 'user-password',
                text: `Password: *****`
            });

            var modifyBtn = $('<button>', {
                class: 'modify-btn',
                text: 'Modify',
            });

            var deleteBtn = $('<button>', {
                class: 'delete-btn',
                text: 'Delete',
            });

            modifyBtn.on('click', function() {
                const userId = user.id;
                window.location.href = `modify-users.html?userId=${userId}`;
            });

            deleteBtn.on('click', function() {
                const userId = user.id;
                showDeletePopup(userId);
            });

            if (user.name === "admin") {
                deleteBtn.hide();
            }

            if (user.edit_users) {
                $('#edit-users-link').show();
            }

            userItem.append(userName, userEmail, userPassword, modifyBtn, deleteBtn);
            userListContainer.append(userItem);
        });

        adminContainer.append(userListContainer);
    }

    renderUserList(users);

    $('#search-input').on('input', function() {
        var searchTerm = $(this).val().toLowerCase();

        var filteredUsers = users.filter(function(user) {
            return user.name.toLowerCase().includes(searchTerm);
        });

        renderUserList(filteredUsers);
    });

    function showDeletePopup(userId) {
        const popup = $('<div>', { class: 'popup-overlay' });
        const popupContent = $('<div>', { class: 'popup-content' });

        const title = $('<h2>', { text: 'Confirmar Eliminación' });
        const message = $('<p>', { text: 'Estas seguro de eliminar a este usuario?' });

        const confirmBtn = $('<button>', {
            text: 'Si, Eliminar',
            class: 'popup-btn confirm-delete'
        });

        const cancelBtn = $('<button>', {
            text: 'Cancelar',
            class: 'popup-btn cancel-delete'
        });

        confirmBtn.on('click', function() {
            deleteUser(userId);
            popup.fadeOut(function() {
                popup.remove();
            })
        });

        cancelBtn.on('click', function() {
            popup.fadeOut(function() {
                popup.remove();
            });
        });

        popupContent.append(title, message, confirmBtn, cancelBtn);
        popup.append(popupContent).hide().fadeIn();
        $('body').append(popup);
    }

    function deleteUser(userId) {
        const userToDelete = users.find(user => user.id === userId);

        if (userToDelete && userToDelete.name === "admin") {
            alert("No se puede eliminar al administrador.");
            return;
        }
        users = users.filter(user => user.id !== userId);
        localStorage.setItem('users', JSON.stringify(users));
        location.reload();
    }
});
