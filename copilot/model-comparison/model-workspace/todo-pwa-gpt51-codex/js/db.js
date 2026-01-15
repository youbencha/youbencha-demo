import { generateId } from "./utils.js";

export const STORAGE_KEY = "focusflow.todo.data.v1";

export function storageAvailable() {
  try {
    const testKey = "__focusflow_test__";
    window.localStorage.setItem(testKey, "ok");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function loadSnapshot() {
  if (!storageAvailable()) {
    return createDefaultData();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createDefaultData();
  }

  try {
    const parsed = JSON.parse(raw);
    return normalizeData(parsed);
  } catch {
    return createDefaultData();
  }
}

export function persistSnapshot(snapshot) {
  if (!storageAvailable()) {
    return { ok: false, error: new Error("Local storage is unavailable.") };
  }

  try {
    const payload = normalizeData({
      ...snapshot,
      lastUpdated: Date.now()
    });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

function normalizeData(data) {
  const safe = { ...data };
  safe.lists = Array.isArray(safe.lists) && safe.lists.length ? safe.lists : createDefaultData().lists;
  safe.tasks = typeof safe.tasks === "object" && safe.tasks !== null ? safe.tasks : {};

  safe.lists.forEach((list) => {
    if (!safe.tasks[list.id]) {
      safe.tasks[list.id] = [];
    }
  });

  safe.activeListId = safe.lists.some((list) => list.id === safe.activeListId)
    ? safe.activeListId
    : safe.lists[0]?.id;

  if (!safe.activeListId) {
    const fallback = createDefaultData();
    return fallback;
  }

  return safe;
}

function createDefaultData() {
  const defaultListId = generateId();
  return {
    lists: [
      {
        id: defaultListId,
        name: "Personal",
        createdAt: new Date().toISOString()
      }
    ],
    tasks: {
      [defaultListId]: []
    },
    activeListId: defaultListId,
    lastUpdated: Date.now()
  };
}

