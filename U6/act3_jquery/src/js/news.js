$(document).ready(function() {
    function loadNews() {
        const savedPosts = JSON.parse(localStorage.getItem("postBuilderConfig")) || [];
        const newsContainer = $('.created-news');

        newsContainer.empty();

        savedPosts.forEach(post => {
            const newsItem = `
                <div class="news-item">
                    <h2>${post.header.title}</h2>
                    <p>Autor: ${post.header.author} | Fecha: ${post.header.date}</p>
                    <div class="news-content">
                        ${post.columns.map(column => {
                            return column.map(element => {
                                if (element.type === "paragraph") {
                                    return `<p>${element.content}</p>`;
                                } else if (element.type === "image") {
                                    return `<img src="${element.src}" alt="Imagen">`;
                                }
                            }).join('');
                        }).join('')}
                    </div>
                    <button class="view-more-btn" data-id="${post.id}">Ver más</button>
                </div>
            `;
            newsContainer.append(newsItem);
        });
    }

    loadNews();

    $(document).on('click', '.view-more-btn', function() {
        const postId = $(this).data('id');
        const savedPosts = JSON.parse(localStorage.getItem("postBuilderConfig")) || [];
        const post = savedPosts.find(p => p.id === postId);

        if (post) {
            $('#modalTitle').text(post.header.title);
            $('#modalAuthor').text(`Autor: ${post.header.author}`);
            $('#modalDate').text(`Fecha: ${post.header.date}`);
            
            const modalContent = post.columns.map(column => {
                return column.map(element => {
                    if (element.type === "paragraph") {
                        return `<p>${element.content}</p>`;
                    } else if (element.type === "image") {
                        return `<img src="${element.src}" alt="Imagen" style="max-width: 100%;">`;
                    }
                }).join('');
            }).join('');

            $('#modalContent').html(modalContent);
            $('#news-modal').fadeIn();
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
});