const menuIcon = document.querySelector('.menu-icon');
const mobileNav = document.querySelector('.mobile-nav');

menuIcon.addEventListener('click', function() {
    mobileNav.classList.toggle('active');
});

const images = document.querySelectorAll('.image-item img');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-image');
const captionText = document.getElementById('modal-caption');
const closeBtn = document.getElementsByClassName("close")[0];

images.forEach((img) => {
    img.onclick = function() {
        modal.style.display = "flex";
        modalImg.src = this.src;
        captionText.innerHTML = this.nextElementSibling.innerHTML; 
    }
});

closeBtn.onclick = function() {
    modal.style.display = "none";
}

$(document).ready(function() {
    if (localStorage.getItem('loggedInUser')) {
        $('#login-btn').hide();
    } else {
        $('#login-btn').show();
    }
});