/**
 * To-Do PWA Application Logic
 */

// State
let state = {
    lists: [],
    activeListId: null
};

// Constants
const STORAGE_KEY = 'todo_pwa_data';

// DOM Elements
const elements = {
    listsContainer: document.getElementById('lists-container'),
    tasksContainer: document.getElementById('tasks-container'),
    listTitle: document.getElementById('current-list-title'),
    newListDialog: document.getElementById('new-list-dialog'),
    newListForm: document.getElementById('new-list-form'),
    newListInput: document.getElementById('new-list-input'),
    addTaskForm: document.getElementById('add-task-form'),
    newTaskInput: document.getElementById('new-task-input'),
    sidebar: document.getElementById('sidebar'),
    overlay: document.getElementById('overlay'),
    emptyState: document.getElementById('empty-state')
};

// Utils
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const saveState = () => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error('Failed to save state:', e);
        alert('Failed to save data. LocalStorage might be full.');
    }
};

const loadState = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            state = JSON.parse(stored);
            // Validate state structure
            if (!Array.isArray(state.lists)) state.lists = [];
        } else {
            // Initial state
            const defaultListId = generateId();
            state = {
                lists: [{
                    id: defaultListId,
                    name: 'My Tasks',
                    tasks: []
                }],
                activeListId: defaultListId
            };
            saveState();
        }
    } catch (e) {
        console.error('Failed to load state:', e);
        // Fallback to empty state
        state = { lists: [], activeListId: null };
    }
};

// List Management
const createList = (name) => {
    const newList = {
        id: generateId(),
        name: name,
        tasks: []
    };
    state.lists.push(newList);
    state.activeListId = newList.id;
    saveState();
    render();
};

const deleteList = (listId) => {
    if (state.lists.length <= 1) {
        alert('You must have at least one list.');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this list?')) return;

    state.lists = state.lists.filter(l => l.id !== listId);
    if (state.activeListId === listId) {
        state.activeListId = state.lists[0].id;
    }
    saveState();
    render();
};

const setActiveList = (listId) => {
    state.activeListId = listId;
    saveState();
    render();
    // Close sidebar on mobile
    elements.sidebar.classList.remove('open');
    elements.overlay.classList.remove('active');
};

// Task Management
const createTask = (text) => {
    if (!state.activeListId) return;
    
    const activeList = state.lists.find(l => l.id === state.activeListId);
    if (!activeList) return;

    const newTask = {
        id: generateId(),
        text: text,
        completed: false,
        createdAt: Date.now()
    };

    activeList.tasks.push(newTask);
    saveState();
    render();
};

const toggleTask = (taskId) => {
    const activeList = state.lists.find(l => l.id === state.activeListId);
    if (!activeList) return;

    const task = activeList.tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveState();
        render();
    }
};

const updateTaskText = (taskId, newText) => {
    const activeList = state.lists.find(l => l.id === state.activeListId);
    if (!activeList) return;

    const task = activeList.tasks.find(t => t.id === taskId);
    if (task) {
        task.text = newText;
        saveState();
    }
};

const deleteTask = (taskId) => {
    const activeList = state.lists.find(l => l.id === state.activeListId);
    if (!activeList) return;

    activeList.tasks = activeList.tasks.filter(t => t.id !== taskId);
    saveState();
    render();
};

// Rendering
const renderLists = () => {
    elements.listsContainer.innerHTML = '';
    state.lists.forEach(list => {
        const li = document.createElement('li');
        li.className = `list-item ${list.id === state.activeListId ? 'active' : ''}`;
        li.onclick = () => setActiveList(list.id);
        
        const incompleteCount = list.tasks.filter(t => !t.completed).length;
        
        li.innerHTML = `
            <span class="list-name">${list.name}</span>
            <span class="list-count">${incompleteCount}</span>
        `;
        elements.listsContainer.appendChild(li);
    });
};

const renderTasks = () => {
    elements.tasksContainer.innerHTML = '';
    const activeList = state.lists.find(l => l.id === state.activeListId);
    
    if (!activeList) return;

    elements.listTitle.textContent = activeList.name;

    if (activeList.tasks.length === 0) {
        elements.emptyState.style.display = 'block';
    } else {
        elements.emptyState.style.display = 'none';
        // Sort: Incomplete first, then by creation date
        const sortedTasks = [...activeList.tasks].sort((a, b) => {
            if (a.completed === b.completed) return b.createdAt - a.createdAt;
            return a.completed ? 1 : -1;
        });

        sortedTasks.forEach(task => {
            const div = document.createElement('div');
            div.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            div.innerHTML = `
                <input type="checkbox" class="task-checkbox" 
                    ${task.completed ? 'checked' : ''} 
                    onchange="toggleTask('${task.id}')">
                <input type="text" class="task-content" value="${task.text}" 
                    onchange="updateTaskText('${task.id}', this.value)"
                    aria-label="Edit task">
                <button class="delete-task-btn" onclick="deleteTask('${task.id}')" aria-label="Delete task">
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            `;
            elements.tasksContainer.appendChild(div);
        });
    }
};

const render = () => {
    renderLists();
    renderTasks();
};

// Event Listeners
document.getElementById('add-list-btn').addEventListener('click', () => {
    elements.newListDialog.showModal();
});

document.getElementById('cancel-new-list').addEventListener('click', () => {
    elements.newListDialog.close();
    elements.newListForm.reset();
});

elements.newListForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = elements.newListInput.value.trim();
    if (name) {
        createList(name);
        elements.newListDialog.close();
        elements.newListForm.reset();
    }
});

elements.addTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = elements.newTaskInput.value.trim();
    if (text) {
        createTask(text);
        elements.newTaskInput.value = '';
    }
});

document.getElementById('delete-list-btn').addEventListener('click', () => {
    if (state.activeListId) {
        deleteList(state.activeListId);
    }
});

// Mobile Sidebar
document.getElementById('menu-toggle').addEventListener('click', () => {
    elements.sidebar.classList.add('open');
    elements.overlay.classList.add('active');
});

document.getElementById('close-sidebar').addEventListener('click', () => {
    elements.sidebar.classList.remove('open');
    elements.overlay.classList.remove('active');
});

elements.overlay.addEventListener('click', () => {
    elements.sidebar.classList.remove('open');
    elements.overlay.classList.remove('active');
});

// Expose functions globally for inline HTML events
window.toggleTask = toggleTask;
window.updateTaskText = updateTaskText;
window.deleteTask = deleteTask;

// Init
loadState();
render();
