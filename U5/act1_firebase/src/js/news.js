import { collection, getDocs, doc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { db } from "./firebase.js";

async function loadNews() {
    const newsContainer = $('.created-news');
    newsContainer.empty();

    try {
        const querySnapshot = await getDocs(collection(db, "news"));
        querySnapshot.forEach(doc => {
            const post = doc.data();
            const newsItem = `
                <div class="news-item" data-id="${doc.id}">
                    <h2>${post.header.title}</h2>
                    <p>Autor: ${post.header.author} | Fecha: ${post.header.date}</p>
                    <div class="news-content">
                        ${post.columns.map(element => { 
                            if (element.type === "paragraph") {
                                return `<p>${element.content}</p>`;
                            } else if (element.type === "image") {
                                return `<img src="${element.src}" alt="Imagen">`;
                            }
                        }).join('')}
                    </div>
                    <button class="view-more-btn" data-id="${doc.id}">Veure més</button>
                    <button class="delete-news-btn" data-id="${doc.id}">Eliminar</button>
                </div>
            `;
            newsContainer.append(newsItem);
        });
    } catch (error) {
        console.error("Error carregant les noticies:", error);
    }
}

function createDeleteModal() {
    if ($("#delete-modal").length === 0) {
        $("body").append(`
            <div id="delete-modal" class="modal" style="display:none;">
                <div class="modal-content">
                    <span class="close-btn" id="close-delete-modal">&times;</span>
                    <p>¿Estás segur de que vols eliminar aquesta noticia?</p>
                    <button id="confirm-delete">Sí, eliminar</button>
                    <button id="cancel-delete">Cancelar</button>
                </div>
            </div>
        `);
    }
}

let postIdToDelete = null;

$(document).on('click', '.view-more-btn', async function() {
    const postId = $(this).data('id');
    const modal = $('#news-modal');
    modal.fadeIn();

    try {
        const docSnap = await getDoc(doc(db, "news", postId));
        if (docSnap.exists()) {
            const post = docSnap.data();
            $('#modalTitle').text(post.header.title);
            $('#modalAuthor').text(`Autor: ${post.header.author}`);
            $('#modalDate').text(`Fecha: ${post.header.date}`);

            const modalContent = post.columns.map(element => { 
                if (element.type === "paragraph") {
                    return `<p>${element.content}</p>`;
                } else if (element.type === "image") {
                    return `<img src="${element.src}" alt="Imagen" style="max-width: 100%;">`;
                }
            }).join('');

            $('#modalContent').html(modalContent);
        }
    } catch (error) {
        console.error("Error al obtenir la noticia:", error);
    }
});

$('#closeModal').on('click', function() {
    $('#news-modal').fadeOut();
});

$(window).on('click', function(event) {
    if ($(event.target).is('#news-modal')) {
        $('#news-modal').fadeOut();
    }
});

$(document).on('click', '.delete-news-btn', function() {
    createDeleteModal();
    postIdToDelete = $(this).data('id');
    $("#delete-modal").fadeIn();
});

$(document).on("click", "#cancel-delete, #close-delete-modal", function () {
    $("#delete-modal").fadeOut();
    postIdToDelete = null;
});

$(document).on("click", "#confirm-delete", async function () {
    if (postIdToDelete) {
        try {
            await deleteDoc(doc(db, "news", postIdToDelete));
            $(`.news-item[data-id="${postIdToDelete}"]`).remove(); 
        } catch (error) {
            console.error("Error eliminant la noticia:", error);
        }
    }
    $("#delete-modal").fadeOut();
    postIdToDelete = null;
});

async function saveNews() {
    const rows = [];
    $(".row").each(function () {
        const title = $(this).find(".post-title").val();
        const author = $(this).find(".post-author").text();
        const date = $(this).find(".post-date").text();
        
        const row = {
            header: { title, author, date },
            columns: []
        };

        $(this).find(".column").each(function () {
            const column = [];
            $(this).children(".element").each(function () {
                if ($(this).find("p").length) {
                    column.push({
                        type: "paragraph",
                        content: $(this).find("p").text(),
                    });
                } else if ($(this).find("img").length) {
                    column.push({
                        type: "image",
                        src: $(this).find("img").attr("src"),
                    });
                }
            });
            if (column.length > 0) {
                row.columns.push(column);
            }
        });

        if (row.columns.length > 0) {
            rows.push(row);
        }
    });

    try {
        for (const row of rows) {
            await addDoc(collection(db, "news"), row);
        }
        loadNews();
    } catch (error) {
        console.error("Error guardant la noticia:", error);
    }
}

$(document).on("click", "#save-config", function () {
    saveNews();
});

$(document).ready(() => {
    loadNews();
});