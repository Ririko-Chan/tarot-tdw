const KEY = "tarot_history";

export function saveReading(reading) {
  const history = getHistory();
  history.push(reading);
  localStorage.setItem(KEY, JSON.stringify(history));
}

export function getHistory() {
  return JSON.parse(localStorage.getItem(KEY)) || [];
}

export function updateReading(index, updated) {
  const history = getHistory();
  history[index] = updated;
  localStorage.setItem(KEY, JSON.stringify(history));
}
