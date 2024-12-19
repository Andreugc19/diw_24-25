const TASKSJSON = [
    {
        id: 1,
        title: "clean dishes",
        priority: "low"
    },
    {
        id: 2,
        title: "study Jquery",
        priority: "medium"
    }
];

$(()=>{
    let tasks = loadTaskFromLocalStorage();
    if(tasks.length === 0) {
        tasks = TASKSJSON;
        saveTaskFromLocalStorage(tasks);
    } else {
        console.log(tasks);
    }

    $.each(tasks, function(index, task) {
        tasks.push(task);
        appendTask(task);
    });

    $("#btn-add-task").on("click", ()=>{
        const taskTitle = $("#task-title").val().trim();
        const taskPriority = $("#task-priority").val();

        if(taskTitle) {
            let task = {
                title: taskTitle,
                priority: taskPriority
            }

            tasks.push(task);
            appendTask(task);
            saveTaskFromLocalStorage(tasks);
        } else {
            $(".todo-container").append(`ERROR 404 IMBECIL VALENTIN ES GAY`);
        }
    });
});

function appendTask(task) {
    $("#todo-list").append(`<li>${(task.title)} - ${(task.priority)}</li>`);
}

function loadTaskFromLocalStorage() {
    return JSON.parse(localStorage.getItem("tasks")) || [];
}

function saveTaskFromLocalStorage(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}