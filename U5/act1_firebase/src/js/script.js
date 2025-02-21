import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { app } from "./firebase.js";

const db = getFirestore(app);

const menuIcon = document.querySelector('.menu-icon');
const mobileNav = document.querySelector('.mobile-nav');
const images = document.querySelectorAll('.image-item img');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-image');
const captionText = document.getElementById('modal-caption');
const closeBtn = document.getElementsByClassName("close")[0];

if (menuIcon) {
    menuIcon.addEventListener('click', function() {
        mobileNav.classList.toggle('active');
    });
}

$(document).ready(async function() {
    const userId = sessionStorage.getItem("loggedInUserId");
    if (userId) {
        try {
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                $('#login-btn').hide();
                return;
            }
        } catch (error) {
            console.error("Error intentat en obtenir a l\'usuari autenticat:", error);
        }
    }
    $('#login-btn').show();
});

if (window.location.pathname.includes('porfolio.html')) {
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
}