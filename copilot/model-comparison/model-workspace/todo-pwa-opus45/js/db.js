/**
 * Database module for Todo PWA
 * Uses localStorage for simple data persistence
 */

const TodoDB = {
    STORAGE_KEY: 'todo-pwa-data',
    
    /**
     * Default data structure
     */
    defaultData: {
        lists: [],
        activeListId: null,
        version: 1
    },

    /**
     * Get all data from storage
     * @returns {Object} The stored data or default data
     */
    getData() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                const parsed = JSON.parse(data);
                return this.migrateData(parsed);
            }
            return { ...this.defaultData };
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return { ...this.defaultData };
        }
    },

    /**
     * Save all data to storage
     * @param {Object} data - The data to save
     * @returns {boolean} Success status
     */
    saveData(data) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            if (error.name === 'QuotaExceededError') {
                throw new Error('Storage quota exceeded. Please delete some lists or tasks.');
            }
            throw error;
        }
    },

    /**
     * Migrate data from older versions
     * @param {Object} data - The data to migrate
     * @returns {Object} Migrated data
     */
    migrateData(data) {
        if (!data.version) {
            data.version = 1;
        }
        return data;
    },

    /**
     * Generate a unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // List Operations

    /**
     * Get all lists
     * @returns {Array} Array of lists
     */
    getLists() {
        const data = this.getData();
        return data.lists || [];
    },

    /**
     * Get a single list by ID
     * @param {string} listId - The list ID
     * @returns {Object|null} The list or null
     */
    getList(listId) {
        const lists = this.getLists();
        return lists.find(list => list.id === listId) || null;
    },

    /**
     * Create a new list
     * @param {string} name - The list name
     * @returns {Object} The created list
     */
    createList(name) {
        const data = this.getData();
        const newList = {
            id: this.generateId(),
            name: name.trim(),
            tasks: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        data.lists.push(newList);
        data.activeListId = newList.id;
        this.saveData(data);
        return newList;
    },

    /**
     * Update a list's name
     * @param {string} listId - The list ID
     * @param {string} name - The new name
     * @returns {Object|null} The updated list or null
     */
    updateList(listId, name) {
        const data = this.getData();
        const list = data.lists.find(l => l.id === listId);
        if (list) {
            list.name = name.trim();
            list.updatedAt = new Date().toISOString();
            this.saveData(data);
            return list;
        }
        return null;
    },

    /**
     * Delete a list
     * @param {string} listId - The list ID
     * @returns {boolean} Success status
     */
    deleteList(listId) {
        const data = this.getData();
        const index = data.lists.findIndex(l => l.id === listId);
        if (index !== -1) {
            data.lists.splice(index, 1);
            if (data.activeListId === listId) {
                data.activeListId = data.lists.length > 0 ? data.lists[0].id : null;
            }
            this.saveData(data);
            return true;
        }
        return false;
    },

    // Task Operations

    /**
     * Get all tasks for a list
     * @param {string} listId - The list ID
     * @returns {Array} Array of tasks
     */
    getTasks(listId) {
        const list = this.getList(listId);
        return list ? list.tasks : [];
    },

    /**
     * Add a task to a list
     * @param {string} listId - The list ID
     * @param {string} text - The task text
     * @returns {Object|null} The created task or null
     */
    addTask(listId, text) {
        const data = this.getData();
        const list = data.lists.find(l => l.id === listId);
        if (list) {
            const newTask = {
                id: this.generateId(),
                text: text.trim(),
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            list.tasks.push(newTask);
            list.updatedAt = new Date().toISOString();
            this.saveData(data);
            return newTask;
        }
        return null;
    },

    /**
     * Update a task
     * @param {string} listId - The list ID
     * @param {string} taskId - The task ID
     * @param {Object} updates - The updates to apply
     * @returns {Object|null} The updated task or null
     */
    updateTask(listId, taskId, updates) {
        const data = this.getData();
        const list = data.lists.find(l => l.id === listId);
        if (list) {
            const task = list.tasks.find(t => t.id === taskId);
            if (task) {
                if (updates.text !== undefined) task.text = updates.text.trim();
                if (updates.completed !== undefined) task.completed = updates.completed;
                task.updatedAt = new Date().toISOString();
                list.updatedAt = new Date().toISOString();
                this.saveData(data);
                return task;
            }
        }
        return null;
    },

    /**
     * Delete a task
     * @param {string} listId - The list ID
     * @param {string} taskId - The task ID
     * @returns {boolean} Success status
     */
    deleteTask(listId, taskId) {
        const data = this.getData();
        const list = data.lists.find(l => l.id === listId);
        if (list) {
            const index = list.tasks.findIndex(t => t.id === taskId);
            if (index !== -1) {
                list.tasks.splice(index, 1);
                list.updatedAt = new Date().toISOString();
                this.saveData(data);
                return true;
            }
        }
        return false;
    },

    /**
     * Reorder tasks in a list
     * @param {string} listId - The list ID
     * @param {number} fromIndex - The source index
     * @param {number} toIndex - The destination index
     * @returns {boolean} Success status
     */
    reorderTasks(listId, fromIndex, toIndex) {
        const data = this.getData();
        const list = data.lists.find(l => l.id === listId);
        if (list && fromIndex >= 0 && toIndex >= 0 && fromIndex < list.tasks.length && toIndex < list.tasks.length) {
            const [removed] = list.tasks.splice(fromIndex, 1);
            list.tasks.splice(toIndex, 0, removed);
            list.updatedAt = new Date().toISOString();
            this.saveData(data);
            return true;
        }
        return false;
    },

    // Active List

    /**
     * Get the active list ID
     * @returns {string|null} The active list ID
     */
    getActiveListId() {
        const data = this.getData();
        return data.activeListId;
    },

    /**
     * Set the active list ID
     * @param {string} listId - The list ID
     */
    setActiveListId(listId) {
        const data = this.getData();
        data.activeListId = listId;
        this.saveData(data);
    },

    /**
     * Clear all data
     */
    clearAll() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TodoDB;
}
