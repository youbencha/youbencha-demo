export function generateId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `id-${Date.now().toString(36)}-${Math.random().toString(16).slice(2)}`;
}

export function sanitizeText(value = "") {
  return value.trim().replace(/\s+/g, " ");
}

export function focusAtEnd(element) {
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

export function formatTaskSummary(tasks = []) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const remaining = total - completed;
  return total === 0 ? "No tasks yet" : `${remaining} open · ${completed} done`;
}

