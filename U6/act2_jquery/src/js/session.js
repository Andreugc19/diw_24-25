$(document).ready(function () {
    function toggleAuthButtons() {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

        if (loggedInUser) {
            $('#login-btn-desktop, #login-btn-mobile').hide();
            $('#logout-btn-desktop, #logout-btn-mobile').show();

            if (loggedInUser.edit_users === true) {
                $('#edit-users-link-desktop, #edit-users-link-mobile').show();
            }
        } else {
            $('#login-btn-desktop, #login-btn-mobile').show();
            $('#logout-btn-desktop, #logout-btn-mobile').hide();
            $('#edit-users-link-desktop, #edit-users-link-mobile').hide();
        }
    }

    $('#logout-btn-desktop, #logout-btn-mobile').on('click', function () {
        localStorage.removeItem('loggedInUser');
        window.location.href = "../html/index.html";
    });

    toggleAuthButtons();
});
