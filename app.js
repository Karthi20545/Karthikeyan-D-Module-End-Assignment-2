 document.addEventListener('DOMContentLoaded', () => {
      const elements = {
        taskInput: document.getElementById('taskInput'),
        addTaskBtn: document.getElementById('addTaskBtn'),
        taskList: document.getElementById('taskList'),
        clearAllBtn: document.getElementById('clearAllBtn'),
        taskCount: document.getElementById('taskCount')
      };

      let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

      elements.addTaskBtn.addEventListener('click', addTask);
      elements.taskInput.addEventListener('keypress', e => e.key === 'Enter' && addTask());
      elements.clearAllBtn.addEventListener('click', clearAllTasks);

      function addTask() {
        const text = elements.taskInput.value.trim();
        if (!text) return;

        tasks.push({
          id: Date.now(),
          text,
          time: getTime(),
          completed: false
        });

        saveAndRender();
        elements.taskInput.value = '';
        elements.taskInput.focus();
      }

      function renderTasks() {
        elements.taskList.innerHTML = tasks.length ? tasks.map(task => `
          <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${task.text}</span>
            <span class="task-time">${task.time}</span>
            <div class="task-actions">
              <button class="edit-btn">✏️</button>
              <button class="delete-btn">🗑️</button>
            </div>
          </li>
        `).join('') : '<li class="task-item">No tasks yet</li>';

        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
          checkbox.addEventListener('change', e => {
            const task = tasks.find(t => t.id === +e.target.closest('.task-item').dataset.id);
            if (task) {
              task.completed = e.target.checked;
              if (task.completed) task.time = getTime();
              saveAndRender();
            }
          });
        });

        document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', editTask));
        document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', deleteTask));
        updateTaskCount();
      }

      function editTask(e) {
        const taskItem = e.target.closest('.task-item');
        const taskId = +taskItem.dataset.id;
        const task = tasks.find(t => t.id === taskId);
        const textEl = taskItem.querySelector('.task-text');
        const currentText = task.text;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'task-text';
        textEl.replaceWith(input);
        input.focus();

        const saveEdit = () => {
          const newText = input.value.trim();
          if (newText && newText !== currentText) {
            task.text = newText;
            saveAndRender();
          } else {
            renderTasks();
          }
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', e => e.key === 'Enter' && saveEdit());
      }

      function deleteTask(e) {
        if (confirm('Delete this task?')) {
          const taskId = +e.target.closest('.task-item').dataset.id;
          tasks = tasks.filter(task => task.id !== taskId);
          saveAndRender();
        }
      }

      function clearAllTasks() {
        if (tasks.length && confirm('Delete ALL tasks?')) {
          tasks = [];
          saveAndRender();
        }
      }

      function saveAndRender() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
      }

      function updateTaskCount() {
        const completed = tasks.filter(t => t.completed).length;
        elements.taskCount.textContent = `${completed} of ${tasks.length} tasks completed`;
      }

      function getTime() {
        const now = new Date();
        let hours = now.getHours();
        const mins = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${mins} ${ampm}`;
      }

      renderTasks();
    });
