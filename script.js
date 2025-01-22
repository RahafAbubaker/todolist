const todoInput = document.getElementById("todo-input");
const addTaskBtn = document.getElementById("add-task-btn");
const todoList = document.getElementById("todo-list");
const deleteDoneTasksBtn = document.getElementById("delete-done-tasks");
const deleteAllTasksBtn = document.getElementById("delete-all-tasks");
const suggestions = document.getElementById("suggestions");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let taskToRename = null;

const confirmModal = document.getElementById("confirm-modal");
const confirmBtn = document.getElementById("confirm-btn");
const cancelBtn = document.getElementById("cancel-btn");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");

const renameModal = document.getElementById("rename-modal");
const renameInput = document.getElementById("rename-input");
const saveBtn = document.getElementById("save-btn");
const cancelRenameBtn = document.getElementById("cancel-rename-btn");

addTaskBtn.addEventListener("click", () => {
    const taskText = todoInput.value.trim();

    if (!isValidTask(taskText)) {
        displayErrorMessage("Invalid task. It must not start with a number, be empty, or have less than 5 characters.");
        return;
    }

    tasks.push({ text: taskText, done: false });
    todoInput.value = "";
    saveTasks();
    renderTasks();
});

function renderTasks(filter = "all") {
    todoList.innerHTML = "";

    tasks
        .filter(task => {
            if (filter === "done") return task.done;
            if (filter === "todo") return !task.done;
            return true;
        })
        .forEach((task, index) => {
            const li = document.createElement("li");
            li.className = task.done ? "done" : "";
            li.innerHTML = `
                <span>${task.text}</span>
                <div class="actions">
                    <input type="checkbox" ${task.done ? "checked" : ""} onchange="toggleTask(${index})">
                    <button onclick="prepareRenameTask(${index})"><i class="fa-solid fa-pencil"></i></button>
                    <button onclick="prepareDeleteTask(${index})"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            todoList.appendChild(li);
        });

    updateDeleteButtonState();
}

const toggleTask = index => {
    tasks[index].done = !tasks[index].done;
    saveTasks();
    renderTasks(getCurrentFilter());
};

const prepareRenameTask = index => {
    taskToRename = index;
    renameInput.value = tasks[taskToRename].text;
    renameModal.classList.remove("hidden");
};

saveBtn.addEventListener("click", () => {
    const newTaskName = renameInput.value.trim();

    if (!isValidTask(newTaskName)) {
        displayErrorMessage("Invalid task name.");
        return;
    }

    tasks[taskToRename].text = newTaskName;
    taskToRename = null;
    renameModal.classList.add("hidden");
    saveTasks();
    renderTasks(getCurrentFilter());
});

cancelRenameBtn.addEventListener("click", () => {
    taskToRename = null;
    renameModal.classList.add("hidden");
});

const prepareDeleteTask = index => {
    modalTitle.textContent = "Delete Task";
    modalDescription.textContent = "Are you sure you want to delete this task?";
    confirmModal.classList.remove("hidden");

    confirmBtn.onclick = () => {
        tasks.splice(index, 1);
        confirmModal.classList.add("hidden");
        saveTasks();
        renderTasks(getCurrentFilter());
    };

    cancelBtn.onclick = () => {
        confirmModal.classList.add("hidden");
    };
};

deleteDoneTasksBtn.addEventListener("click", () => {
    if (!tasks.some(task => task.done)) {
        displayErrorMessage("No done tasks to delete.");
        return;
    }

    modalTitle.textContent = "Delete Done Tasks";
    modalDescription.textContent = "Are you sure you want to delete all done tasks?";
    confirmModal.classList.remove("hidden");

    confirmBtn.onclick = () => {
        tasks = tasks.filter(task => !task.done);
        confirmModal.classList.add("hidden");
        saveTasks();
        renderTasks(getCurrentFilter());
    };

    cancelBtn.onclick = () => {
        confirmModal.classList.add("hidden");
    };
});

deleteAllTasksBtn.addEventListener("click", () => {
    if (tasks.length === 0) {
        displayErrorMessage("No tasks to delete.");
        return;
    }

    modalTitle.textContent = "Delete All Tasks";
    modalDescription.textContent = "Are you sure you want to delete all tasks?";
    confirmModal.classList.remove("hidden");

    confirmBtn.onclick = () => {
        tasks = [];
        confirmModal.classList.add("hidden");
        saveTasks();
        renderTasks(getCurrentFilter());
    };

    cancelBtn.onclick = () => {
        confirmModal.classList.add("hidden");
    };
});

function updateDeleteButtonState() {
    if (tasks.some(task => task.done)) {
        deleteDoneTasksBtn.classList.remove("disabled");
        deleteDoneTasksBtn.disabled = false;
    } else {
        deleteDoneTasksBtn.classList.add("disabled");
        deleteDoneTasksBtn.disabled = true;
    }

    if (tasks.length > 0) {
        deleteAllTasksBtn.classList.remove("disabled");
        deleteAllTasksBtn.disabled = false;
    } else {
        deleteAllTasksBtn.classList.add("disabled");
        deleteAllTasksBtn.disabled = true;
    }
}

const saveTasks = () => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
};

const isValidTask = task => {
    return task.length >= 5 && isNaN(task[0]);
};

const displayErrorMessage = message => {
    const errorArea = document.getElementById("error");
    const errorElement = document.createElement("p");
    errorElement.textContent = message;
    errorElement.className = "error-message";

    if (errorArea.firstChild) {
        errorArea.firstChild.remove();
    }
    errorArea.appendChild(errorElement);

    setTimeout(() => {
        errorElement.remove();
    }, 3000);
};

const filterAllBtn = document.getElementById("filter-all");
const filterDoneBtn = document.getElementById("filter-done");
const filterTodoBtn = document.getElementById("filter-todo");

filterAllBtn.addEventListener("click", () => {
    renderTasks("all");
    updateActiveButton(filterAllBtn);
    saveCurrentFilter("all");
});

filterDoneBtn.addEventListener("click", () => {
    renderTasks("done");
    updateActiveButton(filterDoneBtn);
    saveCurrentFilter("done");
});

filterTodoBtn.addEventListener("click", () => {
    renderTasks("todo");
    updateActiveButton(filterTodoBtn);
    saveCurrentFilter("todo");
});

function updateActiveButton(activeButton) {
    filterAllBtn.classList.remove("active");
    filterDoneBtn.classList.remove("active");
    filterTodoBtn.classList.remove("active");

    activeButton.classList.add("active");
}
function saveCurrentFilter(filter) {
    localStorage.setItem("currentFilter", filter);
}

function getCurrentFilter() {
    return localStorage.getItem("currentFilter") || "all";
}

document.addEventListener("DOMContentLoaded", () => {
    const savedFilter = getCurrentFilter();
    renderTasks(savedFilter);

    if (savedFilter === "done") {
        updateActiveButton(filterDoneBtn);
    } else if (savedFilter === "todo") {
        updateActiveButton(filterTodoBtn);
    } else {
        updateActiveButton(filterAllBtn);
    }
});

renderTasks(getCurrentFilter());
updateDeleteButtonState();
