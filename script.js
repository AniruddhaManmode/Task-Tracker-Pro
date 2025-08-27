let taskLists = JSON.parse(localStorage.getItem("taskLists")) || [];
let currentTaskListId = null;
let currentDate = new Date();
let tasks = JSON.parse(localStorage.getItem("calendarTasks")) || {};
let isCalendarView = false;

// Initialize default list if empty
if (taskLists.length === 0) {
  const defaultList = {
    id: generateId(),
    name: "Default List",
    tasks: {},
  };
  taskLists.push(defaultList);
  localStorage.setItem("taskLists", JSON.stringify(taskLists));
}
currentTaskListId = taskLists[0].id;

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Toggle sidebar menu
function toggleMenu() {
  document.getElementById("sidebar").classList.toggle("active");
  document.getElementById("overlay").classList.toggle("active");
}

// Render task lists in sidebar
function renderTaskLists() {
  const container = document.getElementById("taskLists");
  container.innerHTML = "";
  taskLists.forEach((list) => {
    const div = document.createElement("div");
    div.className = `task-list-item${
      list.id === currentTaskListId ? " active" : ""
    }`;
    div.textContent = list.name;
    div.onclick = () => switchTaskList(list.id);
    container.appendChild(div);
  });
  document.getElementById("currentListTitle").textContent = taskLists.find(
    (l) => l.id === currentTaskListId
  ).name;
}

// Switch between task lists
function switchTaskList(id) {
  currentTaskListId = id;
  renderCalendar();
  renderTaskLists();
  toggleMenu();
}

// New task list modal handling
function openNewTaskListModal() {
  document.getElementById("newTaskListModal").style.display = "block";
}

function closeNewTaskListModal() {
  document.getElementById("newTaskListModal").style.display = "none";
}

function goHome() {
  window.location.href = "index.html"; // Change to your actual home page URL
}

function createTaskList() {
  const name = document.getElementById("taskListName").value;
  if (!name) return;

  const newList = {
    id: generateId(),
    name: name,
    tasks: {},
  };

  taskLists.push(newList);
  localStorage.setItem("taskLists", JSON.stringify(taskLists));
  switchTaskList(newList.id);
  closeNewTaskListModal();
  document.getElementById("taskListName").value = "";
}

// Modified calendar functions
function getCurrentTasks() {
  return taskLists.find((l) => l.id === currentTaskListId).tasks;
}

function renderCalendar() {
  const tasks = getCurrentTasks();
  const monthYear = document.getElementById("month-year");
  const daysContainer = document.getElementById("calendar-days");
  daysContainer.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date().getDate();
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  monthYear.innerText = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(currentDate);

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.classList.add("day");
    emptyCell.style.background = "transparent";
    daysContainer.appendChild(emptyCell);
  }

  for (let day = 1; day <= lastDate; day++) {
    const dayCell = document.createElement("div");
    dayCell.classList.add("day");
    dayCell.innerText = day;

    const key = `${year}-${month + 1}-${day}`;
    if (tasks[key]) {
      dayCell.classList.add(
        tasks[key] === "completed" ? "completed" : "uncompleted"
      );
    }

    if (day === today && month === currentMonth && year === currentYear) {
      dayCell.classList.add("current-day");
    }

    dayCell.onclick = () => openTaskModal(year, month + 1, day);
    daysContainer.appendChild(dayCell);
  }

  updateTaskCounter();
}

function openTaskModal(year, month, day) {
  const modal = document.getElementById("taskModal");
  const modalDate = document.getElementById("taskModalDate");
  modalDate.innerText = `Task for ${month}/${day}/${year}`;
  modal.style.display = "block";
  modal.currentDate = { year, month, day };
}

function closeTaskModal() {
  document.getElementById("taskModal").style.display = "none";
}

function markTaskStatus(isCompleted) {
  const modal = document.getElementById("taskModal");
  const { year, month, day } = modal.currentDate;
  const key = `${year}-${month}-${day}`;

  // Get the current task list's tasks
  const currentTaskList = taskLists.find(
    (list) => list.id === currentTaskListId
  );
  currentTaskList.tasks[key] = isCompleted ? "completed" : "uncompleted";

  // Save to localStorage
  localStorage.setItem("taskLists", JSON.stringify(taskLists));

  // Close the modal and update the UI
  closeTaskModal();
  renderCalendar();
  updateTaskCounter();
  updateTodayStats();
}

function prevMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
}

function updateTaskCounter() {
  const currentTaskList = taskLists.find(
    (list) => list.id === currentTaskListId
  );
  const tasks = currentTaskList.tasks;

  // Count completed and uncompleted tasks
  const completedCount = Object.values(tasks).filter(
    (status) => status === "completed"
  ).length;
  const uncompletedCount = Object.values(tasks).filter(
    (status) => status === "uncompleted"
  ).length;

  // Update the UI
  document.querySelector(".completed-count").textContent = completedCount;
  document.querySelector(".uncompleted-count").textContent = uncompletedCount;
}

window.onclick = function (event) {
  const modal = document.getElementById("taskModal");
  if (event.target == modal) {
    closeTaskModal();
  }
};

function renameTaskList() {
  const newName = prompt("Enter the new name for the task list:");
  if (newName && newName.trim()) {
    const currentTaskList = taskLists.find(
      (list) => list.id === currentTaskListId
    );
    currentTaskList.name = newName.trim();
    localStorage.setItem("taskLists", JSON.stringify(taskLists));
    renderTaskLists();
  }
}

function deleteTaskList() {
  if (taskLists.length === 1) {
    alert("You cannot delete the last task list.");
    return;
  }

  if (confirm("Are you sure you want to delete this task list?")) {
    taskLists = taskLists.filter((list) => list.id !== currentTaskListId);
    localStorage.setItem("taskLists", JSON.stringify(taskLists));
    currentTaskListId = taskLists[0].id; // Switch to the first task list
    renderTaskLists();
    renderCalendar();
  }
}

window.addEventListener("load", function () {
  setTimeout(function () {
    document.getElementById("loading-screen").classList.add("hide");
    // Remove the loading screen from DOM after transition
    setTimeout(function () {
      document.getElementById("loading-screen").remove();
    }, 500);
  }, 1500); // Show loading screen for 1.5 seconds
});

function getTaskListStats(tasks) {
  const completed = Object.values(tasks).filter(
    (status) => status === "completed"
  ).length;
  const uncompleted = Object.values(tasks).filter(
    (status) => status === "uncompleted"
  ).length;
  const total = completed + uncompleted;
  const completionRate = total === 0 ? 0 : (completed / total) * 100;

  return {
    completed,
    uncompleted,
    total,
    completionRate,
  };
}

// Function to render the homepage
function renderHomepage() {
  updateTodayStats();
  const totalTaskLists = taskLists.length;
  let totalTasks = 0;

  document.getElementById("totalTaskLists").textContent = totalTaskLists;

  const overviewContainer = document.getElementById("taskListsOverview");
  overviewContainer.innerHTML = "";

  taskLists.forEach((list) => {
    const stats = getTaskListStats(list.tasks);
    totalTasks += stats.total;

    const card = document.createElement("div");
    card.className = "task-list-card";
    card.innerHTML = `
            <h3>${list.name}</h3>
            <div class="task-list-stats">
                <div class="task-list-stat">
                    <span class="value">${stats.completed}</span>
                    <span class="label">Completed</span>
                </div>
                <div class="task-list-stat">
                    <span class="value">${stats.uncompleted}</span>
                    <span class="label">Pending</span>
                </div>
                <div class="task-list-stat">
                    <span class="value">${stats.completionRate.toFixed(
                      1
                    )}%</span>
                    <span class="label">Completion</span>
                </div>
            </div>
            <div class="task-list-progress">
                <div class="progress-bar" style="width: ${
                  stats.completionRate
                }%"></div>
            </div>
            <div class="task-list-actions">
                <button class="view-list-btn" onclick="viewTaskList('${
                  list.id
                }')">View List</button>
            </div>
        `;

    overviewContainer.appendChild(card);
  });

  document.getElementById("totalTasks").textContent = totalTasks;
}

// Function to switch between homepage and calendar view
function switchView(toCalendar) {
  isCalendarView = toCalendar;
  const homepage = document.getElementById("homepage");
  const appElements = document.querySelectorAll(
    ".navbar, .task-actions, .calendar-container"
  );

  if (toCalendar) {
    homepage.classList.remove("active");
    appElements.forEach((el) => el.classList.add("active"));
  } else {
    homepage.classList.add("active");
    appElements.forEach((el) => el.classList.remove("active"));
    renderHomepage();
  }
}

function switchToCalendarView() {
  switchView(true);
}

function viewTaskList(listId) {
  currentTaskListId = listId;
  switchView(true);
  renderCalendar();
  renderTaskLists();
}

// Modify the window load event listener
window.addEventListener("load", function () {
  setTimeout(function () {
    const loadingScreen = document.getElementById("loading-screen");
    if (loadingScreen) {
      loadingScreen.classList.add("hide");
      setTimeout(function () {
        if (loadingScreen) {
          loadingScreen.remove();
        }
        // Show homepage by default
        switchView(false);
      }, 500);
    }
  }, 1500);
});

// Update existing functions to refresh homepage when needed
const originalMarkTaskStatus = markTaskStatus;
markTaskStatus = function (isCompleted) {
  originalMarkTaskStatus(isCompleted);
  if (!isCalendarView) {
    renderHomepage();
  }
};

const originalCreateTaskList = createTaskList;
createTaskList = function () {
  originalCreateTaskList();
  if (!isCalendarView) {
    renderHomepage();
  }
};

const originalDeleteTaskList = deleteTaskList;
deleteTaskList = function () {
  originalDeleteTaskList();
  if (!isCalendarView) {
    renderHomepage();
  }
};

function getTodayTasksStats() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // Months are 0-indexed
  const day = today.getDate();
  const todayKey = `${year}-${month}-${day}`;

  let todayTotalTasks = 0;
  let todayCompletedTasks = 0;

  taskLists.forEach((list) => {
    if (list.tasks[todayKey] !== undefined) {
      todayTotalTasks++;
      if (list.tasks[todayKey] === "completed") {
        todayCompletedTasks++;
      }
    }
  });

  return {
    todayTotalTasks,
    todayCompletedTasks,
  };
}

function updateTodayStats() {
  const { todayTotalTasks, todayCompletedTasks } = getTodayTasksStats();
  document.getElementById("todayTasksCount").textContent = todayTotalTasks;
  document.getElementById("todayCompletedCount").textContent =
    todayCompletedTasks;
}

// Initial render
renderTaskLists();
renderCalendar();
