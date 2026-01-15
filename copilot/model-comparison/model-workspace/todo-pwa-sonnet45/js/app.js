// App State
let currentListId = null;
let lists = [];
let tasks = [];
let confirmCallback = null;

// DOM Elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const listSelectorBtn = document.getElementById('listSelectorBtn');
const currentListName = document.getElementById('currentListName');
const listDropdown = document.getElementById('listDropdown');
const listItems = document.getElementById('listItems');
const addListBtn = document.getElementById('addListBtn');
const listModal = document.getElementById('listModal');
const listNameInput = document.getElementById('listNameInput');
const saveListBtn = document.getElementById('saveListBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const confirmModal = document.getElementById('confirmModal');
const confirmTitle = document.getElementById('confirmTitle');
const confirmMessage = document.getElementById('confirmMessage');
const confirmActionBtn = document.getElementById('confirmActionBtn');
const cancelConfirmBtn = document.getElementById('cancelConfirmBtn');
const offlineIndicator = document.getElementById('offlineIndicator');

// Storage Keys
const STORAGE_KEYS = {
  LISTS: 'taskflow_lists',
  TASKS: 'taskflow_tasks',
  CURRENT_LIST: 'taskflow_current_list'
};

// Initialize App
function initApp() {
  // Register service worker
  if ('serviceWorker' in navigator) {
    // Use a relative URL so installs work when the app is served from a sub-path
    const swUrl = new URL('./sw.js', window.location.href);
    navigator.serviceWorker.register(swUrl.href, { scope: './' })
      .then((registration) => {
        console.log('Service Worker registered:', registration);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  }

  // Load data from localStorage
  loadData();

  // Set up event listeners
  setupEventListeners();

  // Monitor online/offline status
  monitorNetworkStatus();

  // If no lists exist, create a default list
  if (lists.length === 0) {
    createDefaultList();
  } else {
    // Load the last active list or the first list
    const lastListId = localStorage.getItem(STORAGE_KEYS.CURRENT_LIST);
    if (lastListId && lists.find(list => list.id === lastListId)) {
      currentListId = lastListId;
    } else {
      currentListId = lists[0].id;
    }
    renderLists();
    renderTasks();
  }
}

// Load data from localStorage
function loadData() {
  try {
    const storedLists = localStorage.getItem(STORAGE_KEYS.LISTS);
    const storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);

    lists = storedLists ? JSON.parse(storedLists) : [];
    tasks = storedTasks ? JSON.parse(storedTasks) : [];
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
    lists = [];
    tasks = [];
  }
}

// Save data to localStorage
function saveData() {
  try {
    localStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(lists));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    if (currentListId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_LIST, currentListId);
    }
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
    if (error.name === 'QuotaExceededError') {
      alert('Storage quota exceeded. Please delete some tasks or lists.');
    }
  }
}

// Create default list
function createDefaultList() {
  const defaultList = {
    id: generateId(),
    name: 'My Tasks',
    createdAt: Date.now()
  };
  lists.push(defaultList);
  currentListId = defaultList.id;
  saveData();
  renderLists();
  renderTasks();
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Setup event listeners
function setupEventListeners() {
  // Add task
  addTaskBtn.addEventListener('click', addTask);
  taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  });

  // List selector
  listSelectorBtn.addEventListener('click', toggleListDropdown);

  // Add list
  addListBtn.addEventListener('click', () => {
    openListModal();
  });

  // Modal actions
  saveListBtn.addEventListener('click', saveList);
  closeModalBtn.addEventListener('click', closeListModal);
  cancelModalBtn.addEventListener('click', closeListModal);

  // Confirm modal
  confirmActionBtn.addEventListener('click', () => {
    if (confirmCallback) {
      confirmCallback();
    }
    closeConfirmModal();
  });
  cancelConfirmBtn.addEventListener('click', closeConfirmModal);

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!listDropdown.contains(e.target) && !listSelectorBtn.contains(e.target)) {
      closeListDropdown();
    }
  });

  // Close modals on backdrop click
  listModal.addEventListener('click', (e) => {
    if (e.target === listModal) {
      closeListModal();
    }
  });

  confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) {
      closeConfirmModal();
    }
  });

  // Handle Enter key in list modal
  listNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveList();
    }
  });
}

// Add task
function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  const task = {
    id: generateId(),
    listId: currentListId,
    text: text,
    completed: false,
    createdAt: Date.now()
  };

  tasks.push(task);
  saveData();
  taskInput.value = '';
  renderTasks();
  renderLists();
}

// Toggle task completion
function toggleTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    saveData();
    renderTasks();
  }
}

// Edit task
function editTask(taskId, element) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  element.contentEditable = true;
  element.focus();

  // Select all text
  const range = document.createRange();
  range.selectNodeContents(element);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  const saveEdit = () => {
    const newText = element.textContent.trim();
    if (newText && newText !== task.text) {
      task.text = newText;
      saveData();
    }
    element.contentEditable = false;
    renderTasks();
  };

  element.addEventListener('blur', saveEdit, { once: true });
  element.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      element.blur();
    }
  }, { once: true });
}

// Delete task
function deleteTask(taskId) {
  showConfirmDialog(
    'Delete Task',
    'Are you sure you want to delete this task?',
    () => {
      tasks = tasks.filter(t => t.id !== taskId);
      saveData();
      renderTasks();
      renderLists();
    }
  );
}

// Render tasks
function renderTasks() {
  const currentTasks = tasks.filter(t => t.listId === currentListId);
  
  if (currentTasks.length === 0) {
    taskList.style.display = 'none';
    emptyState.classList.add('active');
    return;
  }

  taskList.style.display = 'flex';
  emptyState.classList.remove('active');

  taskList.innerHTML = currentTasks.map(task => `
    <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
      <input 
        type="checkbox" 
        class="task-checkbox" 
        ${task.completed ? 'checked' : ''}
        aria-label="Mark task as ${task.completed ? 'incomplete' : 'complete'}"
      >
      <div class="task-content">
        <div class="task-text">${escapeHtml(task.text)}</div>
      </div>
      <div class="task-actions">
        <button class="btn-icon edit-task-btn" aria-label="Edit task">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M14.5 2.5C14.8978 2.10217 15.4374 1.87868 16 1.87868C16.2786 1.87868 16.5544 1.93355 16.8118 2.04015C17.0692 2.14674 17.303 2.303 17.5 2.5C17.697 2.697 17.8533 2.93085 17.9599 3.18821C18.0665 3.44558 18.1213 3.72142 18.1213 4C18.1213 4.27858 18.0665 4.55442 17.9599 4.81179C17.8533 5.06915 17.697 5.303 17.5 5.5L6.5 16.5L2 18L3.5 13.5L14.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="btn-icon danger delete-task-btn" aria-label="Delete task">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M2.5 5H4.16667H17.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6.66699 5.00008V3.33341C6.66699 2.89139 6.84259 2.46746 7.15515 2.1549C7.46771 1.84234 7.89163 1.66675 8.33366 1.66675H11.667C12.109 1.66675 12.5329 1.84234 12.8455 2.1549C13.1581 2.46746 13.3337 2.89139 13.3337 3.33341V5.00008M15.8337 5.00008V16.6667C15.8337 17.1088 15.6581 17.5327 15.3455 17.8453C15.0329 18.1578 14.609 18.3334 14.167 18.3334H5.83366C5.39163 18.3334 4.96771 18.1578 4.65515 17.8453C4.34259 17.5327 4.16699 17.1088 4.16699 16.6667V5.00008H15.8337Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  `).join('');

  // Add event listeners to task items
  document.querySelectorAll('.task-item').forEach(item => {
    const taskId = item.dataset.taskId;
    const checkbox = item.querySelector('.task-checkbox');
    const editBtn = item.querySelector('.edit-task-btn');
    const deleteBtn = item.querySelector('.delete-task-btn');
    const taskText = item.querySelector('.task-text');

    checkbox.addEventListener('change', () => toggleTask(taskId));
    editBtn.addEventListener('click', () => editTask(taskId, taskText));
    deleteBtn.addEventListener('click', () => deleteTask(taskId));
  });
}

// Render lists
function renderLists() {
  const currentList = lists.find(list => list.id === currentListId);
  if (currentList) {
    currentListName.textContent = currentList.name;
  }

  listItems.innerHTML = lists.map(list => {
    const listTasks = tasks.filter(t => t.listId === list.id);
    const completedCount = listTasks.filter(t => t.completed).length;
    const totalCount = listTasks.length;

    return `
      <li class="list-item ${list.id === currentListId ? 'active' : ''}" data-list-id="${list.id}" role="menuitem">
        <div class="list-item-content">
          <span class="list-item-name">${escapeHtml(list.name)}</span>
          <span class="list-item-count">${completedCount}/${totalCount}</span>
        </div>
        <div class="list-item-actions">
          <button class="btn-icon edit-list-btn" aria-label="Rename list">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M14.5 2.5C14.8978 2.10217 15.4374 1.87868 16 1.87868C16.2786 1.87868 16.5544 1.93355 16.8118 2.04015C17.0692 2.14674 17.303 2.303 17.5 2.5C17.697 2.697 17.8533 2.93085 17.9599 3.18821C18.0665 3.44558 18.1213 3.72142 18.1213 4C18.1213 4.27858 18.0665 4.55442 17.9599 4.81179C17.8533 5.06915 17.697 5.303 17.5 5.5L6.5 16.5L2 18L3.5 13.5L14.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="btn-icon danger delete-list-btn" aria-label="Delete list">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2.5 5H4.16667H17.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6.66699 5.00008V3.33341C6.66699 2.89139 6.84259 2.46746 7.15515 2.1549C7.46771 1.84234 7.89163 1.66675 8.33366 1.66675H11.667C12.109 1.66675 12.5329 1.84234 12.8455 2.1549C13.1581 2.46746 13.3337 2.89139 13.3337 3.33341V5.00008M15.8337 5.00008V16.6667C15.8337 17.1088 15.6581 17.5327 15.3455 17.8453C15.0329 18.1578 14.609 18.3334 14.167 18.3334H5.83366C5.39163 18.3334 4.96771 18.1578 4.65515 17.8453C4.34259 17.5327 4.16699 17.1088 4.16699 16.6667V5.00008H15.8337Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </li>
    `;
  }).join('');

  // Add event listeners
  document.querySelectorAll('.list-item').forEach(item => {
    const listId = item.dataset.listId;
    const editBtn = item.querySelector('.edit-list-btn');
    const deleteBtn = item.querySelector('.delete-list-btn');

    item.addEventListener('click', (e) => {
      if (!e.target.closest('.list-item-actions')) {
        switchList(listId);
      }
    });

    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openListModal(listId);
    });

    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteList(listId);
    });
  });
}

// Switch list
function switchList(listId) {
  currentListId = listId;
  saveData();
  renderLists();
  renderTasks();
  closeListDropdown();
}

// Toggle list dropdown
function toggleListDropdown() {
  const isActive = listDropdown.classList.contains('active');
  if (isActive) {
    closeListDropdown();
  } else {
    openListDropdown();
  }
}

// Open list dropdown
function openListDropdown() {
  listDropdown.classList.add('active');
  listSelectorBtn.setAttribute('aria-expanded', 'true');
}

// Close list dropdown
function closeListDropdown() {
  listDropdown.classList.remove('active');
  listSelectorBtn.setAttribute('aria-expanded', 'false');
}

// Open list modal
function openListModal(listId = null) {
  const list = listId ? lists.find(l => l.id === listId) : null;
  
  if (list) {
    document.getElementById('modalTitle').textContent = 'Rename List';
    listNameInput.value = list.name;
    listModal.dataset.listId = listId;
  } else {
    document.getElementById('modalTitle').textContent = 'Create New List';
    listNameInput.value = '';
    delete listModal.dataset.listId;
  }

  listModal.showModal();
  listNameInput.focus();
}

// Close list modal
function closeListModal() {
  listModal.close();
  listNameInput.value = '';
  delete listModal.dataset.listId;
}

// Save list
function saveList() {
  const name = listNameInput.value.trim();
  if (!name) return;

  const listId = listModal.dataset.listId;

  if (listId) {
    // Edit existing list
    const list = lists.find(l => l.id === listId);
    if (list) {
      list.name = name;
      saveData();
      renderLists();
    }
  } else {
    // Create new list
    const newList = {
      id: generateId(),
      name: name,
      createdAt: Date.now()
    };
    lists.push(newList);
    currentListId = newList.id;
    saveData();
    renderLists();
    renderTasks();
  }

  closeListModal();
}

// Delete list
function deleteList(listId) {
  if (lists.length === 1) {
    alert('You must have at least one list.');
    return;
  }

  const list = lists.find(l => l.id === listId);
  if (!list) return;

  showConfirmDialog(
    'Delete List',
    `Are you sure you want to delete "${list.name}" and all its tasks?`,
    () => {
      // Delete list and its tasks
      lists = lists.filter(l => l.id !== listId);
      tasks = tasks.filter(t => t.listId !== listId);

      // Switch to another list if current list is deleted
      if (currentListId === listId) {
        currentListId = lists[0].id;
      }

      saveData();
      renderLists();
      renderTasks();
    }
  );
}

// Show confirm dialog
function showConfirmDialog(title, message, callback) {
  confirmTitle.textContent = title;
  confirmMessage.textContent = message;
  confirmCallback = callback;
  confirmModal.showModal();
}

// Close confirm modal
function closeConfirmModal() {
  confirmModal.close();
  confirmCallback = null;
}

// Monitor network status
function monitorNetworkStatus() {
  const updateOnlineStatus = () => {
    if (navigator.onLine) {
      offlineIndicator.classList.remove('active');
    } else {
      offlineIndicator.classList.add('active');
    }
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
