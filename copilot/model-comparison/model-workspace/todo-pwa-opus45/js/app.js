/**
 * Todo PWA - Main Application
 */

// DOM Elements
const elements = {
    // Sidebar
    sidebar: document.getElementById('sidebar'),
    sidebarOverlay: document.getElementById('sidebarOverlay'),
    closeSidebar: document.getElementById('closeSidebar'),
    menuBtn: document.getElementById('menuBtn'),
    listsNav: document.getElementById('listsNav'),
    newListBtn: document.getElementById('newListBtn'),
    
    // Main content
    currentListTitle: document.getElementById('currentListTitle'),
    editListBtn: document.getElementById('editListBtn'),
    deleteListBtn: document.getElementById('deleteListBtn'),
    tasksContainer: document.getElementById('tasksContainer'),
    emptyState: document.getElementById('emptyState'),
    emptyStateTitle: document.getElementById('emptyStateTitle'),
    emptyStateMessage: document.getElementById('emptyStateMessage'),
    tasksList: document.getElementById('tasksList'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    
    // Dialogs
    newListDialog: document.getElementById('newListDialog'),
    listNameInput: document.getElementById('listNameInput'),
    listDialogTitle: document.getElementById('listDialogTitle'),
    cancelListDialog: document.getElementById('cancelListDialog'),
    saveListBtn: document.getElementById('saveListBtn'),
    
    deleteDialog: document.getElementById('deleteDialog'),
    deleteItemType: document.getElementById('deleteItemType'),
    deleteMessage: document.getElementById('deleteMessage'),
    cancelDeleteDialog: document.getElementById('cancelDeleteDialog'),
    confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
    
    // Toast & Offline
    toast: document.getElementById('toast'),
    offlineIndicator: document.getElementById('offlineIndicator')
};

// Application State
const state = {
    activeListId: null,
    editingListId: null,
    deleteContext: null, // { type: 'list' | 'task', id: string }
    toastTimeout: null
};

// Initialize Application
function init() {
    loadActiveList();
    renderLists();
    setupEventListeners();
    registerServiceWorker();
    setupOnlineStatus();
}

// Service Worker Registration
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('sw.js');
            console.log('Service Worker registered:', registration.scope);
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }
}

// Online/Offline Status
function setupOnlineStatus() {
    const updateOnlineStatus = () => {
        elements.offlineIndicator.hidden = navigator.onLine;
    };
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
}

// Event Listeners Setup
function setupEventListeners() {
    // Sidebar
    elements.menuBtn.addEventListener('click', toggleSidebar);
    elements.closeSidebar.addEventListener('click', closeSidebar);
    elements.sidebarOverlay.addEventListener('click', closeSidebar);
    
    // New List
    elements.newListBtn.addEventListener('click', () => openListDialog());
    elements.cancelListDialog.addEventListener('click', closeListDialog);
    elements.newListDialog.addEventListener('submit', handleListSubmit);
    
    // Edit/Delete List
    elements.editListBtn.addEventListener('click', () => openListDialog(state.activeListId));
    elements.deleteListBtn.addEventListener('click', () => openDeleteDialog('list', state.activeListId));
    
    // Delete Dialog
    elements.cancelDeleteDialog.addEventListener('click', closeDeleteDialog);
    elements.confirmDeleteBtn.addEventListener('click', handleDeleteConfirm);
    
    // Add Task FAB
    elements.addTaskBtn.addEventListener('click', focusAddTaskInput);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Close dialogs on backdrop click
    elements.newListDialog.addEventListener('click', (e) => {
        if (e.target === elements.newListDialog) closeListDialog();
    });
    elements.deleteDialog.addEventListener('click', (e) => {
        if (e.target === elements.deleteDialog) closeDeleteDialog();
    });
}

// Keyboard Shortcuts
function handleKeyboardShortcuts(e) {
    // Escape to close sidebar on mobile
    if (e.key === 'Escape') {
        if (elements.sidebar.classList.contains('open')) {
            closeSidebar();
        }
    }
    
    // Ctrl/Cmd + N for new list
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openListDialog();
    }
}

// Sidebar Functions
function toggleSidebar() {
    elements.sidebar.classList.toggle('open');
    elements.sidebarOverlay.classList.toggle('visible');
}

function closeSidebar() {
    elements.sidebar.classList.remove('open');
    elements.sidebarOverlay.classList.remove('visible');
}

// Load Active List
function loadActiveList() {
    state.activeListId = TodoDB.getActiveListId();
    if (state.activeListId) {
        const list = TodoDB.getList(state.activeListId);
        if (!list) {
            state.activeListId = null;
            TodoDB.setActiveListId(null);
        }
    }
}

// Render Lists in Sidebar
function renderLists() {
    const lists = TodoDB.getLists();
    elements.listsNav.innerHTML = '';
    
    lists.forEach(list => {
        const li = document.createElement('li');
        li.className = `list-item${list.id === state.activeListId ? ' active' : ''}`;
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', list.id === state.activeListId);
        li.dataset.listId = list.id;
        
        const incompleteTasks = list.tasks.filter(t => !t.completed).length;
        
        li.innerHTML = `
            <svg class="list-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1"/>
            </svg>
            <span class="list-item-name">${escapeHtml(list.name)}</span>
            ${incompleteTasks > 0 ? `<span class="list-item-count">${incompleteTasks}</span>` : ''}
        `;
        
        li.addEventListener('click', () => selectList(list.id));
        elements.listsNav.appendChild(li);
    });
    
    renderTasks();
}

// Select a List
function selectList(listId) {
    state.activeListId = listId;
    TodoDB.setActiveListId(listId);
    renderLists();
    closeSidebar();
}

// Render Tasks
function renderTasks() {
    // Remove existing add task container first
    const existingContainer = document.querySelector('.add-task-container');
    if (existingContainer) existingContainer.remove();
    
    if (!state.activeListId) {
        showEmptyState('Welcome to Todo Lists', 'Create a new list to get started!');
        elements.editListBtn.hidden = true;
        elements.deleteListBtn.hidden = true;
        elements.addTaskBtn.hidden = true;
        elements.currentListTitle.textContent = 'Select a List';
        return;
    }
    
    const list = TodoDB.getList(state.activeListId);
    if (!list) {
        showEmptyState('List not found', 'Select or create a list.');
        return;
    }
    
    elements.currentListTitle.textContent = list.name;
    elements.editListBtn.hidden = false;
    elements.deleteListBtn.hidden = false;
    elements.addTaskBtn.hidden = false;
    
    elements.tasksList.innerHTML = '';
    
    // Add task input
    const addTaskHtml = `
        <div class="add-task-container">
            <input type="text" class="add-task-input" id="addTaskInput" placeholder="Add a new task..." maxlength="500" aria-label="New task text">
            <button class="add-task-btn" id="addTaskSubmit">Add</button>
        </div>
    `;
    elements.tasksList.insertAdjacentHTML('beforebegin', addTaskHtml);
    
    // Setup add task events
    const addTaskInput = document.getElementById('addTaskInput');
    const addTaskSubmit = document.getElementById('addTaskSubmit');
    
    addTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    addTaskSubmit.addEventListener('click', addTask);
    
    if (list.tasks.length === 0) {
        showEmptyState('No tasks yet', 'Add your first task above!');
        return;
    }
    
    hideEmptyState();
    
    list.tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item${task.completed ? ' completed' : ''}`;
        li.dataset.taskId = task.id;
        
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark task as ${task.completed ? 'incomplete' : 'complete'}">
            <div class="task-content">
                <span class="task-text" contenteditable="false">${escapeHtml(task.text)}</span>
            </div>
            <div class="task-actions">
                <button class="task-action-btn edit" aria-label="Edit task" title="Edit task">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </button>
                <button class="task-action-btn delete" aria-label="Delete task" title="Delete task">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                </button>
            </div>
        `;
        
        // Event listeners for task
        const checkbox = li.querySelector('.task-checkbox');
        const textSpan = li.querySelector('.task-text');
        const editBtn = li.querySelector('.task-action-btn.edit');
        const deleteBtn = li.querySelector('.task-action-btn.delete');
        
        checkbox.addEventListener('change', () => toggleTask(task.id, checkbox.checked));
        editBtn.addEventListener('click', () => startEditTask(textSpan));
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        // Inline editing events
        textSpan.addEventListener('blur', () => finishEditTask(task.id, textSpan));
        textSpan.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                textSpan.blur();
            }
            if (e.key === 'Escape') {
                textSpan.textContent = task.text;
                textSpan.contentEditable = 'false';
            }
        });
        
        elements.tasksList.appendChild(li);
    });
}

// Show/Hide Empty State
function showEmptyState(title, message) {
    elements.emptyStateTitle.textContent = title;
    elements.emptyStateMessage.textContent = message;
    elements.emptyState.classList.remove('hidden');
    elements.tasksList.classList.add('hidden');
}

function hideEmptyState() {
    elements.emptyState.classList.add('hidden');
    elements.tasksList.classList.remove('hidden');
}

// Add Task
function addTask() {
    const input = document.getElementById('addTaskInput');
    const text = input.value.trim();
    
    if (!text) {
        showToast('Please enter a task');
        input.focus();
        return;
    }
    
    try {
        TodoDB.addTask(state.activeListId, text);
        input.value = '';
        renderTasks();
        renderLists();
        showToast('Task added');
    } catch (error) {
        showToast(error.message);
    }
}

// Toggle Task Completion
function toggleTask(taskId, completed) {
    TodoDB.updateTask(state.activeListId, taskId, { completed });
    renderTasks();
    renderLists();
}

// Start Edit Task
function startEditTask(textSpan) {
    textSpan.contentEditable = 'true';
    textSpan.focus();
    // Select all text
    const range = document.createRange();
    range.selectNodeContents(textSpan);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

// Finish Edit Task
function finishEditTask(taskId, textSpan) {
    textSpan.contentEditable = 'false';
    const newText = textSpan.textContent.trim();
    
    if (!newText) {
        // Restore original text
        const task = TodoDB.getTasks(state.activeListId).find(t => t.id === taskId);
        if (task) textSpan.textContent = task.text;
        return;
    }
    
    TodoDB.updateTask(state.activeListId, taskId, { text: newText });
    showToast('Task updated');
}

// Delete Task
function deleteTask(taskId) {
    TodoDB.deleteTask(state.activeListId, taskId);
    renderTasks();
    renderLists();
    showToast('Task deleted');
}

// Focus Add Task Input
function focusAddTaskInput() {
    const input = document.getElementById('addTaskInput');
    if (input) {
        input.focus();
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// List Dialog Functions
function openListDialog(listId = null) {
    state.editingListId = listId;
    
    if (listId) {
        const list = TodoDB.getList(listId);
        elements.listDialogTitle.textContent = 'Rename List';
        elements.saveListBtn.textContent = 'Save';
        elements.listNameInput.value = list ? list.name : '';
    } else {
        elements.listDialogTitle.textContent = 'Create New List';
        elements.saveListBtn.textContent = 'Create';
        elements.listNameInput.value = '';
    }
    
    elements.newListDialog.showModal();
    elements.listNameInput.focus();
}

function closeListDialog() {
    elements.newListDialog.close();
    state.editingListId = null;
}

function handleListSubmit(e) {
    e.preventDefault();
    const name = elements.listNameInput.value.trim();
    
    if (!name) {
        showToast('Please enter a list name');
        return;
    }
    
    try {
        if (state.editingListId) {
            TodoDB.updateList(state.editingListId, name);
            showToast('List renamed');
        } else {
            const newList = TodoDB.createList(name);
            state.activeListId = newList.id;
            showToast('List created');
        }
        
        closeListDialog();
        renderLists();
    } catch (error) {
        showToast(error.message);
    }
}

// Delete Dialog Functions
function openDeleteDialog(type, id) {
    state.deleteContext = { type, id };
    
    if (type === 'list') {
        const list = TodoDB.getList(id);
        elements.deleteItemType.textContent = 'List';
        elements.deleteMessage.textContent = `Are you sure you want to delete "${list?.name}" and all its tasks?`;
    } else {
        elements.deleteItemType.textContent = 'Task';
        elements.deleteMessage.textContent = 'Are you sure you want to delete this task?';
    }
    
    elements.deleteDialog.showModal();
}

function closeDeleteDialog() {
    elements.deleteDialog.close();
    state.deleteContext = null;
}

function handleDeleteConfirm() {
    if (!state.deleteContext) return;
    
    const { type, id } = state.deleteContext;
    
    if (type === 'list') {
        TodoDB.deleteList(id);
        if (state.activeListId === id) {
            state.activeListId = TodoDB.getActiveListId();
        }
        showToast('List deleted');
    } else {
        TodoDB.deleteTask(state.activeListId, id);
        showToast('Task deleted');
    }
    
    closeDeleteDialog();
    renderLists();
}

// Toast Notifications
function showToast(message, duration = 3000) {
    if (state.toastTimeout) {
        clearTimeout(state.toastTimeout);
    }
    
    elements.toast.textContent = message;
    elements.toast.classList.add('visible');
    
    state.toastTimeout = setTimeout(() => {
        elements.toast.classList.remove('visible');
    }, duration);
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
