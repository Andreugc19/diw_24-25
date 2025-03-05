import { getPublishedNews, deleteNews, saveNews } from "./firebase.js";

async function loadNews() {
    const newsContainer = $('.created-news');
    newsContainer.empty();

    const newsList = await getPublishedNews();

    newsList.forEach(post => {
        const title = post.header?.title || "Sense Titol";
        const author = post.header?.author || "Desconegut";
        const date = post.header?.date || "Data no disponible";

        let previewContent = "";
        let fullContent = "";

        post.columns?.forEach((column, colIndex) => {
            column.elements?.forEach((element, elIndex) => {
                if (element.type === "paragraph") {
                    if (colIndex === 0 && elIndex === 0) { 
                        previewContent += `<p>${element.content.substring(0, 100)}...</p>`;
                    }
                    fullContent += `<p>${element.content}</p>`;
                } else if (element.type === "image") {
                    if (colIndex === 0 && elIndex === 0) { 
                        previewContent += `<img src="${element.src}" alt="Imagen">`;
                    }
                    fullContent += `<img src="${element.src}" alt="Imagen">`;
                }
            });
        });

        const newsItem = `
            <div class="news-item" data-id="${post.id}">
                <h2>${title}</h2>
                <p>Autor: ${author} | Data: ${date}</p>
                <div class="news-preview">${previewContent}</div>
                <button class="view-more-btn" data-id="${post.id}" 
                    data-title="${title}" 
                    data-author="${author}" 
                    data-date="${date}" 
                    data-content='${fullContent}'>
                    Veure més
                </button>
                <button class="delete-news-btn" data-id="${post.id}">Eliminar</button>
            </div>
        `;

        newsContainer.append(newsItem);
    });
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

$(document).on('click', '.view-more-btn', function() {
    const title = $(this).data('title');
    const author = $(this).data('author');
    const date = $(this).data('date');
    const content = $(this).data('content');

    $('#modalTitle').text(title);
    $('#modalAuthor').text(`Autor: ${author}`);
    $('#modalDate').text(`Data: ${date}`);
    $('#modalContent').html(content);

    $('#news-modal').fadeIn();
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
        const success = await deleteNews(postIdToDelete);
        if (success) {
            $(`.news-item[data-id="${postIdToDelete}"]`).remove();
        }
    }
    $("#delete-modal").fadeOut();
    postIdToDelete = null;
});

async function processNewsSave() {
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

    for (const row of rows) {
        await saveNews(row);
    }
    loadNews();
}

$(document).on("click", "#save-config", function () {
    processNewsSave();
});

$(document).ready(() => {
    loadNews();
});
