import { saveTask, getTasks, onGetTasks, deleteTask} from "./firebase.js";

const taskForm = document.getElementById("task-form");
const tasksContainer = document.getElementById("tasks-container");

window.addEventListener("DOMContentLoaded", async () => {
    console.log("loaded");

    // let html = "";

    onGetTasks((querySnapshot) => {
        let html = "";

        querySnapshot.forEach((doc) => {
            console.log(doc.id, "=>", doc.data())

            const task = doc.data();
            html +=
                `<div>
                    <h3>${task.title}</h3>
                    <p>${task.description}</p>
                    <p>${task.priority}</p>
                    <button class="btn-delete" data-id="${doc.id}">Delete</button>
                </div>`
        });

        tasksContainer.innerHTML =   html;

        // Esdeveniment per eliminar
        const deleteButtons = document.querySelectorAll(".btn-delete");
        deleteButtons.forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const id = e.target.dataset.id;
                deleteTask(id);
            });
        });
    });

    // const querySnapshot = await getTasks();
    // querySnapshot.forEach((doc) => {
    //     console.log(doc.id, "=>", doc.data())

    //     const task = doc.data();
    //     html +=
    //         `<div>
    //             <h3>${task.title}</h3>
    //             <h3>${task.description}</h3>
    //             <h3>${task.priority}</h3>
    //         </div>`
    // });

    // tasksContainer.innerHTML =   html;
});

taskForm.addEventListener("submit", (e) => {

    e.preventDefault();

    console.log("submitted");

    const taskTitle = taskForm["task-title"];
    const taskDescription = taskForm["task-description"];
    const taskPriority = taskForm["task-priority"];

    saveTask(taskTitle.value, taskDescription.value, taskPriority.value);

    taskForm.reset();
})