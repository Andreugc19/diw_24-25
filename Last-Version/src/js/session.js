import { getAuthenticatedUser, logoutUser } from "./firebase.js";

const menuIcon = document.querySelector('.menu-icon');
const mobileNav = document.querySelector('.mobile-nav');
const images = document.querySelectorAll('.image-item img');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-image');
const captionText = document.getElementById('modal-caption');
const closeBtn = document.getElementsByClassName("close")[0];

if (menuIcon) {
    menuIcon.addEventListener('click', function () {
        mobileNav.classList.toggle('active');
    });
}

$(document).ready(async function () {

    async function toggleAuthButtons() {
        const loggedInUser = await getAuthenticatedUser();

        if (loggedInUser) {
            $('#login-btn-desktop, #login-btn-mobile').hide();

            const userMenu = `
                <div class="user-menu">
                    <i class="fas fa-user" id="user-icon"></i>
                    <div id="user-dropdown" class="dropdown-content">
                        <span id="user-name">${loggedInUser.name}</span>
                        <button id="logout-btn">Logout</button>
                    </div>
                </div>
            `;

            $('.desktop-nav .nav-links').append(userMenu);
            $('.mobile-nav .nav-links').append(userMenu);

            if (loggedInUser.edit_users) {
                $('#edit-users-link-desktop, #edit-users-link-mobile').show();
            } else {
                $('#edit-users-link-desktop, #edit-users-link-mobile').hide();
            }

            if (loggedInUser.edit_news) {
                $('#edit-news-link').show();
            } else {
                $('#edit-news-link').hide();
            }

            $('#user-icon').on('click', function () {
                $(this).parent().toggleClass('active');
            });

            $('#logout-btn').on('click', function () {
                logoutUser();
            });

        } else {
            $('#login-btn-desktop, #login-btn-mobile').show();
            $('#edit-news-link').hide();
        }
    }

    await toggleAuthButtons();
});

if (window.location.pathname.includes('porfolio.html')) {
    images.forEach((img) => {
        img.onclick = function () {
            modal.style.display = "flex";
            modalImg.src = this.src;
            captionText.innerHTML = this.nextElementSibling.innerHTML;
        }
    });

    closeBtn.onclick = function () {
        modal.style.display = "none";
    };
}