import { collection, addDoc, getDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { db } from "./firebase.js";

function loadImage(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const imgElement = $(event.target).siblings("img");
    imgElement.attr("src", e.target.result).show();
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
    console.error("Error intentat obtenir a l\'usuari autenticat:", error);
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
    <div class="row">
      <div class="post-container">
        <div class="post-header">
          <input type="text" class="post-title" placeholder="Escriu el titol..." />
          <p class="post-meta">Autor: <span class="post-author">${loggedInUser.name}</span> | Fecha: <span class="post-date">${today}</span></p>
        </div>
        <div class="post-content"><div class="column"></div></div>
        <div class="post-actions">
          <button class="edit-row-btn">Editar Noticia</button>
          <button class="delete-row-btn">Eliminar Noticia</button>
        </div>
      </div>
    </div>`;

  $("#builder .row-container").append(newRow);
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
      $("#editTitle").val(postData.header.title);
      $("#editAuthor").val(postData.header.author);
      $("#editCreationDate").val(postData.header.date);

      let content = "";
      postData.columns.forEach(column => {
        if (column.type === "paragraph") {
          content += column.content + "\n";
        } else if (column.type === "image") {
          $("#editImagePreview").attr("src", column.src).show();
        }
      });

      $("#editContent").val(content.trim());
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
  const newContent = $("#editContent").val();
  const newImageSrc = $("#editImagePreview").attr("src");

  try {
    await updateDoc(doc(db, "news", postId), {
      "header.title": newTitle,
      "columns": newContent
        ? [{ type: "paragraph", content: newContent }]
        : [{ type: "image", src: newImageSrc }]
    });

    $("#editModal").fadeOut();
    await loadNewsFromFirestore();
  } catch (error) {
    console.error("Error editant la noticia:", error);
  }
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
      } else if ($(this).find("img").length) {
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
      const { title, author, date } = postData.header;

      let newRow = `
        <div class="row" data-id="${doc.id}">
          <div class="post-container">
            <div class="post-header">
              <input type="text" class="post-title" value="${title}" readonly />
              <p class="post-meta">Autor: <span class="post-author">${author}</span> | Fecha: <span class="post-date">${date}</span></p>
            </div>
            <div class="post-content">`;

      postData.columns.forEach(column => {
        if (column.type === "paragraph") {
          newRow += `<div class="element"><p class="editable">${column.content}</p></div>`;
        } else if (column.type === "image") {
          newRow += `<div class="element"><img src="${column.src}" alt="Imagen"></div>`;
        }
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

  } catch (error) {
    console.error("Error carregant notícies:", error);
  }
}

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