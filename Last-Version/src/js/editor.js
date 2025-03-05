import { collection, addDoc, getDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { db } from "./firebase.js";

function loadImage(event) {
    const reader = new FileReader();
    reader.onload = function (e) {
        $(event.target).siblings("img").attr("src", e.target.result).show();
    };
    reader.readAsDataURL(event.target.files[0]);
}

function showModalMessage(message) {
    $("#modal-message-text").text(message);
    $("#message-modal").fadeIn();
}

$("#close-modal, #modal-ok-btn").on("click", function () {
    $("#message-modal").fadeOut();
});

async function getLoggedInUser() {
    const userId = sessionStorage.getItem("loggedInUserId");
    if (!userId) return null;
    
    try {
        const userDoc = await getDoc(doc(db, "users", userId));
        return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
        console.error("Error obteniendo usuario autenticado:", error);
        return null;
    }
}

function initializeDragAndDrop() {
  $(".tool").draggable({ helper: "clone", revert: "invalid" });
  $(".column").droppable({
      accept: ".tool",
      drop: function (event, ui) {
          const type = ui.draggable.data("type");
          let newElement;
          
          if (type === "paragraph") {
              newElement = $("<div class='element'><p class='editable'>Escriu un text...</p></div>");
          } else if (type === "image") {
              newElement = $("<div class='element'><input type='file' accept='image/*' onchange='loadImage(event)' /><img src='' alt='Imagen' style='display: none;'></div>");
          }
          $(this).append(newElement);
      }
  });
}

$(document).on("click", ".editable", function () {
  const newText = prompt("Edita el text del paràgraf:", $(this).text());
  if (newText !== null) {
    $(this).text(newText);
  }
});

$(document).on("click", "#add-row", async function () {
  const today = new Date().toISOString().split('T')[0];
  const loggedInUser = await getLoggedInUser();
  
  if (!loggedInUser || !loggedInUser.edit_news) {
      showModalMessage("No tens permisos per crear una noticia.");
      return;
  }
  
  let newRow = `
    <div class="row new-news">
      <div class="post-container">
        <div class="post-header">
          <input type="text" class="post-title" placeholder="Escriu el titol..." />
          <p class="post-meta">Autor: <span class="post-author">${loggedInUser.name}</span> | Fecha: <span class="post-date">${today}</span></p>
        </div>
        <div class="post-content">
          <button class="add-column">Afegir Columna</button>
          <div class="columns-container"></div>
        </div>
        <div class="post-actions">
          <button class="save-draft-btn">Guardar Esborrany</button>
          <button class="publish-btn">Publicar</button>
        </div>
      </div>
    </div>`;
  
  $("#builder .row-container").append(newRow);
});

async function saveNewsToFirestore(row, status) {
  const title = row.find(".post-title").val().trim();
  const author = row.find(".post-author").text();
  const date = row.find(".post-date").text();

  if (!title) {
      showModalMessage("El títol no pot estar buit.");
      return;
  }

  const columns = [];

  row.find(".columns-container .column").each(function () {
      let columnData = { elements: [] };

      $(this).find(".element").each(function () {
          if ($(this).find("p").length) {
              columnData.elements.push({
                  type: "paragraph",
                  content: $(this).find("p").text()
              });
          } else if ($(this).find("img").length) {
              columnData.elements.push({
                  type: "image",
                  src: $(this).find("img").attr("src")
              });
          }
      });

      columns.push(columnData);
  });

  try {
      await addDoc(collection(db, "news"), {
          header: { title, author, date },
          columns, 
          status
      });

      showModalMessage(`Noticia ${status === "draft" ? "guardada com a esborrany" : "publicada"} correctament.`);

      setTimeout(() => {
          location.reload();
      }, 1000);
  } catch (error) {
      console.error("Error guardant la noticia:", error);
      showModalMessage("Error guardant la noticia.");
  }
}

$(document).on("click", ".save-draft-btn", async function () {
  const row = $(this).closest(".row");
  await saveNewsToFirestore(row, "draft");
});

$(document).on("click", ".publish-btn", async function () {
  const row = $(this).closest(".row");
  await saveNewsToFirestore(row, "published");
});

$(document).on("click", ".add-column", function () {
  const columnContainer = $(this).siblings(".columns-container");
  let newColumn = `<div class="column"></div>`;
  columnContainer.append(newColumn);
  initializeDragAndDrop();
}); 

$(document).on("click", ".edit-row-btn", async function () {
  const rowToEdit = $(this).closest(".row");
  const postId = rowToEdit.data("id"); 

  if (!postId) {
      showModalMessage("Error: No s'ha trobat l'ID de la notícia.");
      return;
  }

  try {
      const postDoc = await getDoc(doc(db, "news", postId)); 
      if (postDoc.exists()) {
          const postData = postDoc.data();

          $("#editModal").data("postId", postId);
          $("#editTitle").val(postData.header.title || "");
          $("#editAuthor").val(postData.header.author || "");
          $("#editCreationDate").val(postData.header.date || "");

          $("#editColumnsContainer").empty();

          postData.columns.forEach((column, index) => {
              let columnHtml = `<div class="edit-column" data-index="${index}">`;

              const elements = column.elements || [];

              elements.forEach((element, elIndex) => {
                  if (element.type === "paragraph") {
                      columnHtml += `
                          <textarea class="edit-paragraph-text" data-index="${elIndex}" rows="3" cols="50">${element.content || ""}</textarea>
                      `;
                  } else if (element.type === "image") {
                      columnHtml += `
                          <div class="edit-image-container">
                              <input type="file" class="edit-image-input" data-index="${elIndex}" accept="image/*">
                              <img src="${element.src || ''}" alt="Imagen" class="edit-image-preview" style="max-width: 100px; display: ${element.src ? 'block' : 'none'};">
                          </div>
                      `;
                  }
              });

              columnHtml += `</div>`;
              $("#editColumnsContainer").append(columnHtml);
          });

          $("#editModal").fadeIn();
      }
  } catch (error) {
      console.error("Error carregant la noticia:", error); 
  }
});


$("#editForm").on("submit", async function (e) {
  e.preventDefault();

  const postId = $("#editModal").data("postId");
  if (!postId) return;

  const newTitle = $("#editTitle").val(); 
  const newAuthor = $("#editAuthor").val();
  const newCreationDate = $("#editCreationDate").val();

  let updatedColumns = [];
  $("#editColumnsContainer .edit-column").each(function () {
      let columnData = { elements: [] };

      $(this).find(".edit-paragraph-text").each(function () {
          columnData.elements.push({
              type: "paragraph",
              content: $(this).val()
          });
      });

      $(this).find(".edit-image-input").each(function () {
          const imageInput = $(this);
          const imagePreview = imageInput.siblings(".edit-image-preview");
          if (imagePreview.attr("src")) {
              columnData.elements.push({
                  type: "image",
                  src: imagePreview.attr("src")
              });
          }
      });

      updatedColumns.push(columnData);
  });

  try {
      await updateDoc(doc(db, "news", postId), {
          "header.title": newTitle,
          "header.author": newAuthor,
          "header.date": newCreationDate,
          "columns": updatedColumns
      });

      $("#editModal").fadeOut();
      await loadNewsFromFirestore();
  } catch (error) {
      console.error("Error editant la noticia:", error); 
  }
});

$(document).on("change", ".edit-image-input", function (event) {
  const reader = new FileReader();
  const imagePreview = $(this).siblings(".edit-image-preview");

  reader.onload = function (e) {
      imagePreview.attr("src", e.target.result).show();
  };

  reader.readAsDataURL(event.target.files[0]);
});


$(document).on("click", "#save-config", async function () {
  const loggedInUser = await getLoggedInUser();

  if (!loggedInUser || !loggedInUser.edit_news) {
    showModalMessage("No tens permisos per guardar la noticia.");
    return;
  }

  const rows = []; 

  $(".row").each(function () {
    const title = $(this).find(".post-title").val(); 
    const author = $(this).find(".post-author").text();
    const date = $(this).find(".post-date").text(); 

    if (!title.trim()) {
      showModalMessage("El títol no pot estar buit.");
      return;
    }

    const row = {
      header: { title, author, date },
      columns: []
    };

    $(this).find(".column .element").each(function () {
      let elementData = {};

      if ($(this).find("p").length) {
        elementData = {
          type: "paragraph",
          content: $(this).find("p").text()
        };
      }
      else if ($(this).find("img").length) {
        elementData = {
          type: "image",
          src: $(this).find("img").attr("src")
        };
      }

      if (Object.keys(elementData).length > 0) {
        row.columns.push(elementData);
      }
    });

    rows.push(row); 
  });

  try {
    for (const row of rows) {
      await addDoc(collection(db, "news"), row);
    }
    showModalMessage("Noticia guardada correctament.");

    setTimeout(() => {
      location.reload();
    }, 1000);

  } catch (error) {
    console.error("Error guardant la noticia:", error);
    showModalMessage("Error guardant la noticia.");
  }
});

async function loadNewsFromFirestore() {
  try {
      const querySnapshot = await getDocs(collection(db, "news"));
      $(".row-container").empty();

      querySnapshot.forEach(doc => {
          const postData = doc.data();

          const title = postData.header?.title || "Sin título";
          const author = postData.header?.author || "Desconocido";
          const date = postData.header?.date || "Fecha no disponible";
          const status = postData.status || "draft";
          const columns = postData.columns || []; 
          
          let newRow = `
              <div class="row" data-id="${doc.id}">
                  <div class="post-container">
                      <div class="post-header">
                          <input type="text" class="post-title" value="${title}" readonly />
                          <p class="post-meta">Autor: <span class="post-author">${author}</span> | Fecha: <span class="post-date">${date}</span></p>
                          <p class="post-status">${status === "draft" ? "Esborrany" : "Publicada"}</p>
                      </div>
                      <div class="post-content">
                          <div class="columns-container">`;

          columns.forEach((column, colIndex) => {
              newRow += `<div class="column" data-index="${colIndex}">`;

              (column.elements || []).forEach((element, elIndex) => {
                  if (element.type === "paragraph") {
                      newRow += `<div class="element"><p>${element.content}</p></div>`;
                  } else if (element.type === "image") {
                      newRow += `<div class="element"><img src="${element.src}" alt="Imagen"></div>`;
                  }
              });

              newRow += `</div>`;
          });

          newRow += `
                          </div>
                      </div>
                      <div class="post-actions">
                          <div class="left-actions">`;

          if (status === "draft") {
              newRow += `<button class="publish-news-btn" data-id="${doc.id}">Publicar</button>`;
          }

          if (status === "published") {
              newRow += `<button class="unpublish-news-btn" data-id="${doc.id}">Fer Esborrany</button>`;
          }

          newRow += `</div>
                      <div class="right-actions">
                          <button class="edit-row-btn">Editar</button>
                          <button class="delete-row-btn">Eliminar</button>
                      </div>
                  </div>
              </div>`;

          $(".row-container").append(newRow);
      });
  } catch (error) {
      console.error("Error carregant notícies:", error);
  }
}

$(document).on("click", ".publish-news-btn", async function () {
  const postId = $(this).data("id");

  if (!postId) {
      showModalMessage("Error: No s'ha trobat l'ID de la notícia.");
      return;
  }

  try {
      await updateDoc(doc(db, "news", postId), {
          status: "published"
      });

      showModalMessage("Noticia publicada correctament.");
      
      $(this).closest(".row").find(".post-status").text("✅ Publicada");
      $(this).remove();

  } catch (error) {
      console.error("Error publicant la notícia:", error);
      showModalMessage("Error publicant la notícia.");
  }
});

$(document).on("click", ".unpublish-news-btn", async function () {
  const postId = $(this).data("id");

  if (!postId) {
      showModalMessage("Error: No s'ha trobat l'ID de la notícia.");
      return;
  }

  try {
      await updateDoc(doc(db, "news", postId), {
          status: "draft"
      });

      showModalMessage("La noticia s'ha mogut a esborranys.");

      $(this).closest(".row").find(".post-status").text("📌 Esborrany");
      $(this).replaceWith(`<button class="publish-news-btn" data-id="${postId}">Publicar</button>`);

  } catch (error) {
      console.error("Error al canviar la publicacio:", error);
      showModalMessage("Error al canviar la publicacio.");
  }
});


$(document).on("click", "#load-config", async function () {
    await loadNewsFromFirestore();
});

$(document).on("click", ".delete-row-btn", function () {
  const rowToDelete = $(this).closest(".row"); 
  const postId = rowToDelete.data("id");

  if (!postId) {
    showModalMessage("Error: No s'ha trobat l'ID de la notícia.");
    return;
  }

  $("#delete-modal").data("rowToDelete", rowToDelete);
  $("#delete-modal").data("postId", postId);
  $("#delete-modal").fadeIn(); 
});

$(document).on("click", "#confirm-delete", async function () {
  const rowToDelete = $("#delete-modal").data("rowToDelete"); 
  const postId = $("#delete-modal").data("postId"); 

  if (postId) {
    try {
      await deleteDoc(doc(db, "news", postId)); 
      rowToDelete.remove(); 
      showModalMessage("Noticia eliminada correctament.");
    } catch (error) {
      console.error("Error eliminant notícia:", error);
      showModalMessage("Error eliminant notícia."); 
    }
  } else {
    showModalMessage("Error: No s'ha trobat l'ID de la notícia.");
  }

  $("#delete-modal").fadeOut(); 
});

$(document).on("click", "#cancel-delete", function () {
  $("#delete-modal").fadeOut();
});

$(document).ready(() => {
  initializeDragAndDrop();
});

window.loadImage = loadImage;
window.showModalMessage = showModalMessage;
