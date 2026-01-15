import { loadSnapshot, persistSnapshot, storageAvailable, STORAGE_KEY } from "./db.js";
import { generateId, sanitizeText, focusAtEnd, formatTaskSummary } from "./utils.js";

const elements = {
  listCollection: document.getElementById("listCollection"),
  listCount: document.getElementById("listCount"),
  listIndicator: document.getElementById("listIndicator"),
  listSelect: document.getElementById("listSelect"),
  addListButton: document.getElementById("addListButton"),
  listManagerButton: document.getElementById("listManagerButton"),
  renameListButton: document.getElementById("renameListButton"),
  deleteListButton: document.getElementById("deleteListButton"),
  managerDialog: document.getElementById("listManagerDialog"),
  managerList: document.getElementById("managerList"),
  managerCreateForm: document.getElementById("managerCreateForm"),
  managerCreateInput: document.getElementById("managerCreateInput"),
  taskForm: document.getElementById("taskForm"),
  taskInput: document.getElementById("taskInput"),
  taskList: document.getElementById("taskList"),
  taskSummary: document.getElementById("taskSummary"),
  emptyState: document.getElementById("emptyState"),
  activeListName: document.getElementById("activeListName"),
  networkStatus: document.getElementById("networkStatus"),
  fabAddTask: document.getElementById("fabAddTask"),
  appFeedback: document.getElementById("appFeedback")
};

const template = document.getElementById("taskItemTemplate");

let store = loadSnapshot();
let storageReady = storageAvailable();

init();

function init() {
  ensureActiveList();
  bindEvents();
  renderApp();
  syncNetworkStatus();
  window.addEventListener("online", syncNetworkStatus);
  window.addEventListener("offline", syncNetworkStatus);
  window.addEventListener("storage", handleExternalStorage);
  registerServiceWorker();

  if (!storageReady) {
    setFeedback("Local storage is unavailable. Changes will reset after refresh.", "warning");
  }
}

function bindEvents() {
  elements.addListButton.addEventListener("click", () => openManagerDialog(true));
  elements.listManagerButton.addEventListener("click", () => openManagerDialog());
  elements.managerCreateForm.addEventListener("submit", handleManagerCreate);
  elements.managerList.addEventListener("change", handleManagerRename);
  elements.managerList.addEventListener("click", handleManagerActions);

  elements.listSelect.addEventListener("change", (event) => {
    setActiveList(event.target.value);
  });

  elements.listCollection.addEventListener("click", (event) => {
    const button = event.target.closest("[data-list-id]");
    if (!button) return;
    setActiveList(button.dataset.listId);
  });

  elements.renameListButton.addEventListener("click", () => {
    const active = getActiveList();
    if (!active) return;
    const nextName = prompt("Rename list", active.name);
    if (nextName !== null) {
      updateListName(active.id, nextName);
    }
  });

  elements.deleteListButton.addEventListener("click", () => {
    const active = getActiveList();
    if (!active) return;
    if (store.lists.length === 1) {
      setFeedback("Keep at least one list in your workspace.", "warning");
      return;
    }
    const confirmed = confirm(`Delete “${active.name}” and all tasks? This can't be undone.`);
    if (confirmed) {
      deleteList(active.id);
    }
  });

  elements.taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = sanitizeText(elements.taskInput.value);
    if (!value) {
      setFeedback("Add some text before saving the task.", "warning");
      return;
    }
    addTask(value);
    elements.taskForm.reset();
    elements.taskInput.focus();
  });

  elements.taskList.addEventListener("change", (event) => {
    if (event.target.matches(".task-toggle")) {
      const li = event.target.closest(".task-item");
      toggleTaskComplete(li?.dataset.taskId, event.target.checked);
    }
  });

  elements.taskList.addEventListener("click", (event) => {
    const actionBtn = event.target.closest("[data-action]");
    if (!actionBtn) return;
    const li = actionBtn.closest(".task-item");
    const taskId = li?.dataset.taskId;
    if (!taskId) return;

    if (actionBtn.dataset.action === "delete") {
      const confirmed = confirm("Remove this task?");
      if (confirmed) {
        deleteTask(taskId);
      }
    }

    if (actionBtn.dataset.action === "edit") {
      startEditing(li?.querySelector(".task-text"));
    }
  });

  elements.taskList.addEventListener("dblclick", (event) => {
    if (event.target.classList.contains("task-text")) {
      startEditing(event.target);
    }
  });

  elements.taskList.addEventListener("keydown", (event) => {
    if (!event.target.classList.contains("task-text") || event.target.dataset.editing !== "true") {
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      commitEditing(event.target);
    }

    if (event.key === "Escape") {
      event.preventDefault();
      commitEditing(event.target, { cancel: true });
    }
  });

  elements.taskList.addEventListener("focusout", (event) => {
    if (event.target.classList.contains("task-text") && event.target.dataset.editing === "true") {
      commitEditing(event.target);
    }
  });

  elements.fabAddTask.addEventListener("click", () => {
    elements.taskInput.focus();
  });
}

function renderApp() {
  renderListSidebar();
  renderListSelect();
  renderTasks();
  updateIndicators();
  renderManagerList();
}

function renderListSidebar() {
  elements.listCollection.innerHTML = "";
  store.lists.forEach((list) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "list-chip";
    button.dataset.listId = list.id;
    button.dataset.active = String(list.id === store.activeListId);
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", String(list.id === store.activeListId));

    const nameSpan = document.createElement("span");
    nameSpan.textContent = list.name;

    const countSpan = document.createElement("span");
    countSpan.className = "subtle";
    countSpan.textContent = String((store.tasks[list.id] ?? []).length);

    button.appendChild(nameSpan);
    button.appendChild(countSpan);
    item.appendChild(button);
    elements.listCollection.appendChild(item);
  });
  elements.listCount.textContent = store.lists.length;
}

function renderListSelect() {
  elements.listSelect.innerHTML = "";
  store.lists.forEach((list) => {
    const option = document.createElement("option");
    option.value = list.id;
    option.textContent = list.name;
    if (list.id === store.activeListId) {
      option.selected = true;
    }
    elements.listSelect.appendChild(option);
  });
}

function renderTasks() {
  const tasks = store.tasks[store.activeListId] ?? [];
  elements.taskList.innerHTML = "";

  if (tasks.length === 0) {
    elements.emptyState.hidden = false;
  } else {
    elements.emptyState.hidden = true;
  }

  tasks.forEach((task) => {
    const clone = template.content.firstElementChild.cloneNode(true);
    clone.dataset.taskId = task.id;
    if (task.completed) {
      clone.dataset.complete = "true";
      clone.querySelector(".task-toggle").checked = true;
    } else {
      clone.dataset.complete = "false";
    }
    const textEl = clone.querySelector(".task-text");
    textEl.textContent = task.text;
    elements.taskList.appendChild(clone);
  });

  elements.taskSummary.textContent = formatTaskSummary(tasks);
}

function updateIndicators() {
  const active = getActiveList();
  elements.activeListName.textContent = active?.name ?? "No list selected";
  elements.listIndicator.textContent = `${store.lists.length} lists`;
}

function renderManagerList() {
  elements.managerList.innerHTML = "";
  store.lists.forEach((list) => {
    const row = document.createElement("li");
    row.className = "manager-row";
    row.dataset.listId = list.id;

    const input = document.createElement("input");
    input.className = "manager-name";
    input.type = "text";
    input.value = list.name;
    input.dataset.listId = list.id;
    input.setAttribute("aria-label", `Rename ${list.name}`);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "ghost danger";
    deleteButton.dataset.action = "remove";
    deleteButton.dataset.listId = list.id;
    deleteButton.textContent = "Delete";

    row.append(input, deleteButton);
    elements.managerList.appendChild(row);
  });
}

function openManagerDialog(focusCreate = false) {
  if (typeof elements.managerDialog.showModal === "function") {
    elements.managerDialog.showModal();
    if (focusCreate) {
      elements.managerCreateInput.focus();
    }
  } else {
    alert("Dialogs are not supported in this browser.");
  }
}

function handleManagerCreate(event) {
  event.preventDefault();
  const value = sanitizeText(elements.managerCreateInput.value);
  if (!value) {
    setFeedback("Give your list a name before saving.", "warning");
    return;
  }
  createList(value);
  elements.managerCreateForm.reset();
  renderManagerList();
}

function handleManagerRename(event) {
  if (!event.target.classList.contains("manager-name")) return;
  const listId = event.target.dataset.listId;
  const nextValue = sanitizeText(event.target.value);
  const current = store.lists.find((list) => list.id === listId)?.name ?? "";
  if (!nextValue) {
    event.target.value = current;
    setFeedback("List names need at least one character.", "warning");
    return;
  }
  event.target.value = nextValue;
  if (nextValue !== current) {
    updateListName(listId, nextValue);
  }
}

function handleManagerActions(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const listId = button.dataset.listId;
  if (button.dataset.action === "remove") {
    if (store.lists.length === 1) {
      setFeedback("Keep at least one list in your workspace.", "warning");
      return;
    }
    const list = store.lists.find((item) => item.id === listId);
    const confirmed = confirm(`Delete “${list?.name ?? "this list"}”?`);
    if (confirmed) {
      deleteList(listId);
      renderManagerList();
    }
  }
}

function addTask(text) {
  const listId = store.activeListId;
  const tasks = store.tasks[listId] ?? [];
  tasks.push({
    id: generateId(),
    text,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: null
  });
  store.tasks[listId] = tasks;
  persist("Task added.");
}

function toggleTaskComplete(taskId, completed) {
  const tasks = store.tasks[store.activeListId] ?? [];
  const target = tasks.find((task) => task.id === taskId);
  if (!target) return;
  target.completed = completed;
  target.updatedAt = new Date().toISOString();
  persist(completed ? "Nice! Task completed." : "Task marked as active.");
}

function deleteTask(taskId) {
  const tasks = store.tasks[store.activeListId] ?? [];
  const nextTasks = tasks.filter((task) => task.id !== taskId);
  store.tasks[store.activeListId] = nextTasks;
  persist("Task removed.");
}

function startEditing(textElement) {
  if (!textElement) return;
  if (textElement.dataset.editing === "true") return;
  textElement.dataset.editing = "true";
  textElement.dataset.original = textElement.textContent;
  textElement.contentEditable = "true";
  textElement.focus();
  focusAtEnd(textElement);
  textElement.closest(".task-item")?.classList.add("is-editing");
}

function commitEditing(textElement, options = {}) {
  const { cancel = false } = options;
  const li = textElement.closest(".task-item");
  if (!li) return;
  const taskId = li.dataset.taskId;
  const original = textElement.dataset.original ?? "";

  if (cancel) {
    textElement.textContent = original;
  } else {
    const nextValue = sanitizeText(textElement.textContent);
    if (!nextValue) {
      textElement.textContent = original;
      setFeedback("Tasks need a description.", "warning");
    } else if (nextValue !== original) {
      updateTaskText(taskId, nextValue);
    }
  }

  textElement.dataset.editing = "false";
  textElement.removeAttribute("contenteditable");
  delete textElement.dataset.original;
  li.classList.remove("is-editing");
}

function updateTaskText(taskId, nextText) {
  const tasks = store.tasks[store.activeListId] ?? [];
  const target = tasks.find((task) => task.id === taskId);
  if (!target) return;
  target.text = nextText;
  target.updatedAt = new Date().toISOString();
  persist("Task updated.");
}

function createList(name) {
  const normalized = sanitizeText(name);
  if (!normalized) {
    setFeedback("List names need at least one character.", "warning");
    return;
  }
  const id = generateId();
  store.lists.push({
    id,
    name: normalized,
    createdAt: new Date().toISOString()
  });
  store.tasks[id] = [];
  store.activeListId = id;
  persist(`List “${normalized}” created.`);
}

function updateListName(listId, nextName) {
  const normalized = sanitizeText(nextName);
  if (!normalized) {
    setFeedback("List names need at least one character.", "warning");
    renderApp();
    return;
  }
  const target = store.lists.find((list) => list.id === listId);
  if (!target) return;
  target.name = normalized;
  persist("List renamed.");
}

function deleteList(listId) {
  store.lists = store.lists.filter((list) => list.id !== listId);
  delete store.tasks[listId];

  if (!store.lists.length) {
    const fallbackId = generateId();
    store.lists = [
      {
        id: fallbackId,
        name: "New list",
        createdAt: new Date().toISOString()
      }
    ];
    store.tasks = { [fallbackId]: [] };
    store.activeListId = fallbackId;
  } else if (store.activeListId === listId) {
    store.activeListId = store.lists[0].id;
  }
  persist("List deleted.");
}

function setActiveList(listId) {
  if (store.activeListId === listId) return;
  if (!store.lists.some((list) => list.id === listId)) return;
  store.activeListId = listId;
  persist();
}

function ensureActiveList() {
  if (!store.activeListId || !store.lists.some((list) => list.id === store.activeListId)) {
    store.activeListId = store.lists[0]?.id ?? null;
  }
  if (!store.activeListId) {
    const fallback = loadSnapshot();
    store = fallback;
  }
}

function getActiveList() {
  return store.lists.find((list) => list.id === store.activeListId);
}

function persist(message) {
  const result = persistSnapshot(store);
  if (!result.ok) {
    setFeedback("Unable to save — storage might be full.", "error");
  } else if (message) {
    setFeedback(message, "success");
  } else {
    setFeedback("");
  }
  renderApp();
}

function syncNetworkStatus() {
  const online = navigator.onLine;
  elements.networkStatus.dataset.state = online ? "online" : "offline";
  elements.networkStatus.textContent = online ? "Online" : "Offline";
}

function handleExternalStorage(event) {
  if (event.key !== STORAGE_KEY) return;
  store = loadSnapshot();
  renderApp();
  setFeedback("Updated with changes from another tab.", "info");
}

function setFeedback(message, tone = "info") {
  elements.appFeedback.textContent = message;
  if (!message) {
    delete elements.appFeedback.dataset.tone;
  } else {
    elements.appFeedback.dataset.tone = tone;
  }
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch((error) => {
        console.error("Service worker registration failed", error);
      });
    });
  }
}

