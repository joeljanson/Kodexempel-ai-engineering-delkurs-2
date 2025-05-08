// Sample JavaScript logic for a to-do list

// Get references to DOM elements
const taskInput = document.getElementById('taskInput');
const addTaskButton = document.getElementById('addTaskButton');
const taskList = document.getElementById('taskList');

// Load tasks from local storage (if any)
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Function to render tasks
function renderTasks() {
  taskList.innerHTML = ''; // Clear the list
  tasks.forEach((task, index) => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
      <input type="checkbox" id="task-${index}" ${task.completed ? 'checked' : ''}>
      <label for="task-${index}" class="${task.completed ? 'completed' : ''}">${task.text}</label>
      <button class="delete-button" data-index="${index}">Delete</button>
    `;
    taskList.appendChild(listItem);
  });
}

// Function to save tasks to local storage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Event listener for adding a task
addTaskButton.addEventListener('click', () => {
  const taskText = taskInput.value.trim();
  if (taskText !== '') {
    tasks.push({ text: taskText, completed: false });
    taskInput.value = '';
    renderTasks();
    saveTasks();
  }
});

// Event listener for deleting or completing a task (using event delegation)
taskList.addEventListener('click', (event) => {
  if (event.target.classList.contains('delete-button')) {
    const index = parseInt(event.target.dataset.index);
    tasks.splice(index, 1);
    renderTasks();
    saveTasks();
  } else if (event.target.tagName === 'INPUT' && event.target.type === 'checkbox') {
    const index = parseInt(event.target.id.split('-')[1]);
    tasks[index].completed = event.target.checked;
    renderTasks();
    saveTasks();
  }
});

// Initial render
renderTasks();