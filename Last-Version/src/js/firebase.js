import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, deleteDoc, getDoc, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDHPNdKl7YwOy32as71CsIWlI1ElrEabnY",
    authDomain: "act1-u5.firebaseapp.com",
    projectId: "act1-u5",
    storageBucket: "act1-u5.firebasestorage.app",
    messagingSenderId: "781058376389",
    appId: "1:781058376389:web:e47d47b660e82f4dd526ac"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getUserById(userId) {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
}

async function createAdminUserIfNotExists() {
  const adminEmail = "desenvolupador@iesjoanramis.org";
  const predefinedPassword = "Ramis.20";

  try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const adminExists = usersSnapshot.docs.some(doc => doc.data().email === adminEmail);

      if (!adminExists) {
          const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
          const hashedPassword = CryptoJS.SHA256(predefinedPassword + salt).toString();

          await addDoc(collection(db, "users"), {
              name: "admin",
              email: adminEmail,
              password_hash: hashedPassword,
              salt: salt,
              edit_users: true,
              edit_news: true,
              edit_bone_files: true,
              active: true,
              is_first_login: true 
          });
      }
  } catch (error) {
      console.error("Error al verificar/crear al usuario administrador:", error);
  }
}

async function getAuthenticatedUser() {
  const userId = sessionStorage.getItem("loggedInUserId");

  if (!userId) return null;

  try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      return userSnap.exists() ? { id: userId, ...userSnap.data() } : null;
  } catch (error) {
      console.error("Error obteniendo usuario autenticado:", error);
      return null;
  }
}

async function isEmailTaken(email) {
  const usersSnapshot = await getDocs(collection(db, "users"));
  return usersSnapshot.docs.some(doc => doc.data().email === email);
}

async function authenticateUser(email, password) {
  try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const userDoc = usersSnapshot.docs.find(doc => doc.data().email.trim().toLowerCase() === email);

      if (!userDoc) return null;

      const user = userDoc.data();
      const hashedPassword = CryptoJS.SHA256(password + user.salt).toString();

      if (user.password_hash !== hashedPassword || !user.active) {
          return null;
      }

      return { id: userDoc.id, ...user };
  } catch (error) {
      console.error("Error autenticando usuario:", error);
      return null;
  }
}

async function getAllUsers() {
    const users = [];
    const querySnapshot = await getDocs(collection(db, "users"));
    querySnapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
    });
    return users;
}

async function createUser(userData) {
  try {
      const predefinedPassword = "Ramis.20";
      const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
      const hashedPassword = CryptoJS.SHA256(predefinedPassword + salt).toString();

      await addDoc(collection(db, "users"), {
          ...userData,
          password_hash: hashedPassword,
          salt: salt,
          is_first_login: true
      });

      return true;
  } catch (error) {
      console.error("Error creando usuario:", error);
      return false;
  }
}

async function createUsers(userData) {
  try {
      const defaultPassword = "Ramis.20";
      const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
      const hashedPassword = CryptoJS.SHA256(defaultPassword + salt).toString();

      await addDoc(collection(db, "users"), {
          name: userData.name,
          email: userData.email,
          password_hash: hashedPassword,
          salt: salt,
          edit_users: userData.editUsers,
          edit_news: userData.editNews,
          edit_bone_files: userData.editBoneFiles,
          active: userData.active,
          is_first_login: true
      });

      return true;
  } catch (error) {
      console.error("Error creando usuario:", error);
      return false;
  }
}

async function updateUser(userId, updateData) {
  try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
          return false;
      }

      if (updateData.password) {
          const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
          const hashedPassword = CryptoJS.SHA256(updateData.password + salt).toString();
          updateData.password_hash = hashedPassword;
          updateData.salt = salt;
          delete updateData.password;
      }

      await updateDoc(userRef, updateData);
      return true;
  } catch (error) {
      console.error("Error actualizando usuario:", error);
      return false;
  }
}

async function deleteUser(userId) {
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().name === "admin") {
            console.warn("No se puede eliminar al usuario admin.");
            return;
        }
        
        await deleteDoc(userRef);
    } catch (error) {
        console.error("Error eliminando usuario:", error);
    }
}

async function updateUserPassword(userId, newPassword) {
  try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
          return false;
      }

      const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
      const hashedPassword = CryptoJS.SHA256(newPassword + salt).toString();

      await updateDoc(userRef, {
          password_hash: hashedPassword,
          salt: salt,
          is_first_login: false
      });

      return true;
  } catch (error) {
      console.error("Error actualizando la contraseña:", error);
      return false;
  }
}

function logoutUser() {
  sessionStorage.removeItem("loggedInUserId");
  window.location.href = "../html/index.html";
}

async function getPublishedNews() {
  try {
      const querySnapshot = await getDocs(collection(db, "news"));
      return querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(post => post.status === "published");
  } catch (error) {
      console.error("Error obteniendo noticias:", error);
      return [];
  }
}

async function deleteNews(newsId) {
  try {
      await deleteDoc(doc(db, "news", newsId));
      return true;
  } catch (error) {
      console.error("Error eliminando la noticia:", error);
      return false;
  }
}

async function saveNews(newsData) {
  try {
      await addDoc(collection(db, "news"), newsData);
      return true;
  } catch (error) {
      console.error("Error guardando la noticia:", error);
      return false;
  }
}

export { app, db, getUserById, getAllUsers, deleteUser, updateUserPassword, updateUser, createUsers, createAdminUserIfNotExists, isEmailTaken, createUser, authenticateUser, getAuthenticatedUser, logoutUser, getPublishedNews, deleteNews, saveNews };