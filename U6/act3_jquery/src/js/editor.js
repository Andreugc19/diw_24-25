// Función para cargar la imagen
function loadImage(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const imgElement = $(event.target).siblings("img");
    imgElement.attr("src", e.target.result).show();
  };
  reader.readAsDataURL(event.target.files[0]);
}

// Función para editar el párrafo
function editParagraph(element) {
  const currentText = $(element).text();
  $("#edit-paragraph-text").val(currentText);
  $("#edit-paragraph-modal").fadeIn(); 
  $("#edit-paragraph-modal").data("targetElement", $(element));
}

// Función para mostrar mensajes personalizados en el modal
function showModalMessage(message) {
  $("#modal-message-text").text(message);
  $("#message-modal").fadeIn();
}

$("#close-modal, #modal-ok-btn").on("click", function() {
  $("#message-modal").fadeOut();
});

$("#message-modal").on("click", function(e) {
  if (e.target === this) {
    $("#message-modal").fadeOut();
  }
});

// Función para guardar los cambios en el párrafo editado
$("#save-paragraph-changes").on("click", function () {
  const newText = $("#edit-paragraph-text").val(); 
  const targetElement = $("#edit-paragraph-modal").data("targetElement");  

  if (newText.trim() !== "") {  
    targetElement.text(newText);
    $("#edit-paragraph-modal").fadeOut(); 
  } else {
    showModalMessage("El texto no puede estar vacío. Por favor, ingrese algún contenido.");
  }
});

$(function () {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const isAdmin = loggedInUser && loggedInUser.role === "admin";

  $(".tool").draggable({
    helper: "clone",
    revert: "invalid",
  });

  $(".editable").on("click", function () {
    const currentText = $(this).text();
    const newText = prompt("Edita el texto del párrafo:", currentText);
  
    if (newText !== null) {
      $(this).text(newText);
    } else {
      showModalMessage("No se ha realizado ningún cambio en el texto.");
    }
  });

  // Reemplazar alerta en la función initializeDeleteButtons
  function initializeDeleteButtons() {
    $(".delete-row-btn").off("click").on("click", function () {
      const rowToDelete = $(this).closest(".row");
      const postAuthor = rowToDelete.find(".post-author").text();

      if (loggedInUser && (isAdmin || loggedInUser.name === postAuthor)) {
        $("#delete-modal").fadeIn();

        $("#confirm-delete").off("click").on("click", function () {
          rowToDelete.remove();
          $("#delete-modal").fadeOut();

          let savedPosts = JSON.parse(localStorage.getItem("postBuilderConfig")) || [];
          const titleToDelete = rowToDelete.find(".post-title").val();
          savedPosts = savedPosts.filter(post => post.header.title !== titleToDelete);
          localStorage.setItem("postBuilderConfig", JSON.stringify(savedPosts));

          showModalMessage("La noticia ha sido eliminada correctamente.");
        });

        $("#cancel-delete").off("click").on("click", function () {
          $("#delete-modal").fadeOut();
        });
      } else {
        showModalMessage("No tienes permisos para eliminar esta noticia.");
      }
    });
  }

  // Reemplazar alerta en initializeDroppable para la imagen
  function initializeDroppable() {
    $(".column").droppable({
      accept: ".tool",
      drop: function (event, ui) {
        const type = ui.draggable.data("type");
        const hasImage = $(this).find("img").length > 0;
        const hasParagraph = $(this).find("p").length > 0;

        if (type === "image" && hasImage) {
          showModalMessage("Solo se permite una imagen por fila.");
          return;
        }
        if (type === "paragraph" && hasParagraph) {
          showModalMessage("Solo se permite un párrafo por fila.");
          return;
        }

        let newElement;
        if (type === "paragraph") {
          newElement = $(` 
            <div class="element">
              <p class="editable" onclick="editParagraph(this)">Escribe aquí tu texto...</p>
            </div>`);
        } else if (type === "image") {
          newElement = $(` 
            <div class="element">
              <input type="file" accept="image/*" onchange="loadImage(event)" />
              <img src="" alt="Imagen" style="display: none;">
            </div>`);
        }

        $(this).append(newElement);
        makeElementsDraggable();
      },
    });
  }

  function makeElementsDraggable() {
    $(".element").draggable({
      helper: "original",
      revert: "invalid",
    });
  }

  // Crear fila solo si contiene datos
  $("#add-row").off("click").on("click", function () {
    const today = new Date().toISOString().split('T')[0];
    const authorName = loggedInUser ? loggedInUser.name : "Usuario Desconocido";

    // Obtener el contador desde localStorage, o inicializarlo si no existe
    let postId = localStorage.getItem("postCounter");
    if (!postId) {
      postId = 1; 
    } else {
      postId = parseInt(postId) + 1; 
    }

    // Guarda el nuevo contador en localStorage para el siguiente post
    localStorage.setItem("postCounter", postId);

    console.log("Generando nueva noticia con postId:", postId);

    let newRow = ` 
    <div class="row" data-id="${postId}">
      <div class="post-container">
        <div class="post-header">
          <input type="text" class="post-title" placeholder="Escribe el título aquí..." />
          <p class="post-meta">
            Autor: <span class="post-author">${authorName}</span> | Fecha: <span class="post-date">${today}</span>
          </p>
        </div>
        <div class="post-content">
          <div class="column"></div>
        </div>
        <div class="post-actions">
          <button class="edit-row-btn">Editar Noticia</button>
          <button class="delete-row-btn">Eliminar Noticia</button>
        </div>
      </div>
    </div>`;

    $("#builder .row-container").append(newRow);
    initializeDroppable();
    initializeDeleteButtons();
  });

  // Guardar configuración
  $("#save-config").on("click", function () {
    const rows = [];
    $(".row").each(function () {
      const title = $(this).find(".post-title").val();
      const author = $(this).find(".post-author").text();
      const date = $(this).find(".post-date").text();
      const postId = $(this).data("id");

      const row = {
        id: postId,
        header: { title, author, date },
        columns: [],
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

        if (Array.isArray(column) && column.length > 0) {
          row.columns.push(column);
        } else {
          showModalMessage("Error: 'column' no es un array válido o está vacío.");
        }
      });

      if (row.columns.length > 0) {
        rows.push(row);
      }
    });

    let savedPosts = JSON.parse(localStorage.getItem("postBuilderConfig")) || [];
    savedPosts = savedPosts.concat(rows);
    localStorage.setItem("postBuilderConfig", JSON.stringify(savedPosts));
    showModalMessage("Configuración guardada en el navegador.");
  });

  // Cargar configuración
  $("#load-config").on("click", function () {
    const config = localStorage.getItem("postBuilderConfig");
    if (!config) {
        showModalMessage("No hay configuración guardada.");
        return;
    }

    const rows = JSON.parse(config);
    $(".row-container").empty();

    rows.forEach((row) => {
        let newRow = ` 
            <div class="row" data-id="${row.id}">
                <div class="post-container">
                    <div class="post-header">
                        <input type="text" class="post-title" value="${row.header.title}" readonly />
                        <p class="post-meta">
                            Autor: <span class="post-author">${row.header.author}</span> | Fecha: <span class="post-date">${row.header.date}</span>
                        </p>
                    </div>
                    <div class="post-content">`;

        row.columns.forEach((column) => {
            newRow += column.length > 1 ? `<div class="column half">` : `<div class="column">`;
            column.forEach((element) => {
                if (element.type === "paragraph") {
                    newRow += `<div class="element"><p class="editable">${element.content}</p></div>`;
                } else if (element.type === "image") {
                    newRow += `<div class="element"><img src="${element.src}" alt="Imagen"></div>`;
                }
            });
            newRow += `</div>`;
        });

        newRow += `</div>
                    <div class="post-actions">
                        <button class="edit-row-btn">Editar Noticia</button>
                        <button class="delete-row-btn">Eliminar Noticia</button>
                    </div>
                </div>
            </div>`;

        $(".row-container").append(newRow);
    });

    initializeDeleteButtons();
    initializeDroppable();
  });

  // Editar Noticia
  $(".row-container").on("click", ".edit-row-btn", function () {
    const currentRowToEdit = $(this).closest(".row");
    const postId = currentRowToEdit.data("id"); 
  
    console.log("Intentando editar noticia con postId:", postId);
  
    let savedPosts = JSON.parse(localStorage.getItem("postBuilderConfig"));
    const postIndex = savedPosts.findIndex(post => post.id === postId);
  
    console.log("Índice del post encontrado:", postIndex);
  
    if (postIndex !== -1) {
      const post = savedPosts[postIndex];
      $("#editTitle").val(post.header.title);
      $("#editContent").val(post.columns[0] && post.columns[0][0] && post.columns[0][0].content || "");
      $("#editAuthor").val(post.header.author);
      $("#editCreationDate").val(post.header.date);
  
      // Pasar el ID de la noticia al modal para asegurarnos de que se guarde correctamente
      $("#editModal").data("postId", postId); 
      $("#editModal").fadeIn();
    } else {
      showModalMessage("No se encontró la noticia para editar.");
    }
  });

  // Guardar cambios del modal
  $("#editForm").on("submit", function (e) {
    e.preventDefault();
  
    const postId = $("#editModal").data("postId"); 
    const currentRowToEdit = $(".row[data-id='" + postId + "']"); 
  
    if (currentRowToEdit.length) {
      const newTitle = $("#editTitle").val();
      currentRowToEdit.find(".post-title").val(newTitle);
  
      const newContent = $("#editContent").val();
      const paragraphElement = currentRowToEdit.find(".column").find("p");
  
      if (paragraphElement.length > 0) {
        paragraphElement.text(newContent);
      } else if (newContent.trim() !== "") {
        currentRowToEdit.find(".column").append(`<div class="element"><p>${newContent}</p></div>`);
      }
  
      // Actualizar la imagen si se ha cambiado
      const newImageSrc = $("#editImagePreview").attr("src");
      const imageElement = currentRowToEdit.find(".column").find("img");
      
      if (newImageSrc && newImageSrc !== "") {  
        imageElement.attr("src", newImageSrc);  
      }
  
      let savedPosts = JSON.parse(localStorage.getItem("postBuilderConfig")) || [];
      const postIndex = savedPosts.findIndex(post => post.id === postId);
  
      if (postIndex !== -1) {
        savedPosts[postIndex].header.title = newTitle;
  
        savedPosts[postIndex].columns = [];
        currentRowToEdit.find(".column").each(function () {
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
          savedPosts[postIndex].columns.push(column);
        });
  
        localStorage.setItem("postBuilderConfig", JSON.stringify(savedPosts));
  
        alert("Cambios guardados correctamente.");
      }
  
      $("#editModal").fadeOut();
    }
  });
});
