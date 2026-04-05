const KEY = "tarot_history";

export function getHistory(storage = localStorage) {
  try {
    return JSON.parse(storage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function saveReading(reading, storage = localStorage) {
  const history = getHistory(storage);
  history.push(reading);
  storage.setItem(KEY, JSON.stringify(history));
  return reading;
}

export function deleteReading(readingId, storage = localStorage) {
  const next = getHistory(storage).filter((item) => item.id !== readingId);
  storage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function renameReading(readingId, name, storage = localStorage) {
  const next = getHistory(storage).map((item) => (
    item.id === readingId ? { ...item, name } : item
  ));
  storage.setItem(KEY, JSON.stringify(next));
  return next;
}
