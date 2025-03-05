import { getAuthenticatedUser } from "./firebase.js";

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
    const user = await getAuthenticatedUser();

    if (user) {
        $('#login-btn').hide();
    } else {
        $('#login-btn').show();
    }
});

if (window.location.pathname.includes('porfolio.html')) {
    images.forEach((img) => {
        img.onclick = function () {
            modal.style.display = "flex";
            modalImg.src = this.src;
            captionText.innerHTML = this.nextElementSibling.innerHTML;
        };
    });

    closeBtn.onclick = function () {
        modal.style.display = "none";
    };
}