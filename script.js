let tasksByDate = {};
let selectedDate = null;

// Generate calendar with improved date handling
function generateCalendar() {
    const calendarBody = document.getElementById('calendar-body');
    const firstDay = new Date(2025, 1, 1);
    const startingDay = firstDay.getDay();
    const daysInMonth = new Date(2025, 2, 0).getDate();
    const today = new Date();
    const currentDay = today.getDate();
    
    let date = 1;
    let tbody = document.createElement('tbody');
    
    for (let i = 0; i < 6; i++) {
        let row = document.createElement('tr');
        
        for (let j = 0; j < 7; j++) {
            let cell = document.createElement('td');
            
            if (i === 0 && j < startingDay) {
                cell.classList.add('empty');
            } else if (date > daysInMonth) {
                cell.classList.add('empty');
            } else {
                cell.textContent = date;
                cell.onclick = () => selectDate(date);
                
                // Enhanced date status handling
                if (date === currentDay && 
                    today.getMonth() === 1 && 
                    today.getFullYear() === 2025) {
                    cell.classList.add('current-date');
                }
                
                const dateString = `2025-02-${date.toString().padStart(2, '0')}`;
                if (tasksByDate[dateString]) {
                    const status = getDateStatus(dateString);
                    cell.classList.add(status === 'completed' ? 'completed' : 'has-tasks');
                }
                
                date++;
            }
            row.appendChild(cell);
        }
        
        tbody.appendChild(row);
        if (date > daysInMonth) break;
    }
    
    calendarBody.innerHTML = '';
    calendarBody.appendChild(tbody);
}

// New function to determine date status
function getDateStatus(date) {
    const tasks = tasksByDate[date];
    if (!tasks) return 'empty';
    
    const totalTasks = tasks.exercise.length + tasks.tasks.length + tasks.workStudy.length;
    const completedTasks = tasks.exercise.filter(t => t.completed).length +
                          tasks.tasks.filter(t => t.completed).length +
                          tasks.workStudy.filter(t => t.completed).length;
    
    return completedTasks === totalTasks && totalTasks > 0 ? 'completed' : 'has-tasks';
}

// Enhanced task management
function addTaskToList(listId, taskText, completed = false) {
    const li = document.createElement('li');
    li.innerHTML = `
        <div class="task-content">
            <input type="checkbox" ${completed ? 'checked' : ''} 
                   onchange="toggleTaskStatus('${listId}', this)">
            <span class="${completed ? 'completed-task' : ''}">${taskText}</span>
        </div>
        <button onclick="deleteTask('${listId}', this)" class="delete-btn">×</button>
    `;
    document.getElementById(listId).appendChild(li);
}

// New function to toggle task status
function toggleTaskStatus(listId, checkbox) {
    const taskText = checkbox.nextElementSibling.textContent;
    const category = listId.replace('-list', '').replace('-', '');
    
    if (selectedDate && tasksByDate[selectedDate]) {
        const taskIndex = tasksByDate[selectedDate][category]
            .findIndex(task => task.text === taskText);
            
        if (taskIndex !== -1) {
            tasksByDate[selectedDate][category][taskIndex].completed = checkbox.checked;
            checkbox.nextElementSibling.classList.toggle('completed-task', checkbox.checked);
            updateCalendarCell();
        }
    }
}

// Modified task addition functions
function addExerciseTask() {
    addTaskWithCategory('exercise');
}

function addTask() {
    addTaskWithCategory('tasks');
}

function addWorkStudyTask() {
    addTaskWithCategory('workStudy');
}

function addTaskWithCategory(category) {
    if (!selectedDate) {
        alert('Please select a date first');
        return;
    }
    
    const input = document.getElementById(`${category}-input`);
    const taskText = input.value.trim();
    
    if (taskText) {
        initializeTasksForDate();
        const task = { text: taskText, completed: false };
        tasksByDate[selectedDate][category].push(task);
        addTaskToList(`${category}-list`, taskText);
        input.value = '';
        updateCalendarCell();
    }
}
// Rest of the functions remain the same as in the previous version
function hasTasksForDate(date) {
    const tasks = tasksByDate[date];
    return tasks && (
        tasks.exercise.length > 0 ||
        tasks.tasks.length > 0 ||
        tasks.workStudy.length > 0 ||
        tasks.lesson.trim() !== ''
    );
}

function updateCalendarCell() {
    const cells = document.querySelectorAll('td');
    cells.forEach(cell => {
        const cellDate = cell.textContent;
        if (cellDate) {
            const dateString = `2025-02-${cellDate.padStart(2, '0')}`;
            if (hasTasksForDate(dateString)) {
                cell.classList.add('has-tasks');
            }
        }
    });
}

function selectDate(date) {
    // Clear previous selection
    const selectedCells = document.querySelectorAll('.selected');
    selectedCells.forEach(cell => cell.classList.remove('selected'));
    
    // Select new date
    const cells = document.querySelectorAll('td');
    cells.forEach(cell => {
        if (cell.textContent === date.toString()) {
            cell.classList.add('selected');
        }
    });
    
    selectedDate = `2025-02-${date.toString().padStart(2, '0')}`;
    document.getElementById('selected-date-display').textContent = `February ${date}, 2025`;
    
    // Load tasks for selected date
    loadTasks();
}

function loadTasks() {
    if (!selectedDate) return;
    
    const tasks = tasksByDate[selectedDate] || {
        exercise: [],
        tasks: [],
        workStudy: [],
        lesson: ''
    };
    
    document.getElementById('exercise-list').innerHTML = '';
    document.getElementById('tasks-list').innerHTML = '';
    document.getElementById('work-study-list').innerHTML = '';
    document.getElementById('lesson-input').value = tasks.lesson;
    
    tasks.exercise.forEach(task => addTaskToList('exercise-list', task));
    tasks.tasks.forEach(task => addTaskToList('tasks-list', task));
    tasks.workStudy.forEach(task => addTaskToList('work-study-list', task));
}

function addTaskToList(listId, taskText) {
    const li = document.createElement('li');
    li.innerHTML = `
        ${taskText}
        <button onclick="deleteTask('${listId}', this)">×</button>
    `;
    document.getElementById(listId).appendChild(li);
}

function deleteTask(listId, button) {
    const li = button.parentElement;
    const taskText = li.childNodes[0].textContent.trim();
    li.remove();
    
    if (selectedDate) {
        const category = listId.replace('-list', '').replace('-', '');
        tasksByDate[selectedDate][category] = tasksByDate[selectedDate][category].filter(
            task => task !== taskText
        );
        
        if (!hasTasksForDate(selectedDate)) {
            const cells = document.querySelectorAll('td');
            cells.forEach(cell => {
                if (cell.textContent === selectedDate.split('-')[2].replace(/^0/, '')) {
                    cell.classList.remove('has-tasks');
                }
            });
        }
    }
}

function addExerciseTask() {
    if (!selectedDate) {
        alert('Please select a date first');
        return;
    }
    
    const input = document.getElementById('exercise-input');
    const task = input.value.trim();
    if (task) {
        initializeTasksForDate();
        tasksByDate[selectedDate].exercise.push(task);
        addTaskToList('exercise-list', task);
        input.value = '';
        updateCalendarCell();
    }
}

function addTask() {
    if (!selectedDate) {
        alert('Please select a date first');
        return;
    }
    
    const input = document.getElementById('task-input');
    const task = input.value.trim();
    if (task) {
        initializeTasksForDate();
        tasksByDate[selectedDate].tasks.push(task);
        addTaskToList('tasks-list', task);
        input.value = '';
        updateCalendarCell();
    }
}

function addWorkStudyTask() {
    if (!selectedDate) {
        alert('Please select a date first');
        return;
    }
    
    const input = document.getElementById('work-study-input');
    const task = input.value.trim();
    if (task) {
        initializeTasksForDate();
        tasksByDate[selectedDate].workStudy.push(task);
        addTaskToList('work-study-list', task);
        input.value = '';
        updateCalendarCell();
    }
}

function saveLesson() {
    if (!selectedDate) {
        alert('Please select a date first');
        return;
    }
    
    const input = document.getElementById('lesson-input');
    const lesson = input.value.trim();
    if (lesson) {
        initializeTasksForDate();
        tasksByDate[selectedDate].lesson = lesson;
        updateCalendarCell();
    }
}

function initializeTasksForDate() {
    if (!tasksByDate[selectedDate]) {
        tasksByDate[selectedDate] = {
            exercise: [],
            tasks: [],
            workStudy: [],
            lesson: ''
        };
    }
}

// Initialize calendar when page loads
window.onload = generateCalendar;