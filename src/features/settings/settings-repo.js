const KEY = "tarot_settings";

const DEFAULT_SETTINGS = {
  deckId: "rider-waite",
  reversedChance: 20,
  hintChance: 15
};

export function getSettings(storage = localStorage) {
  try {
    const raw = storage.getItem(KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(next, storage = localStorage) {
  const settings = { ...DEFAULT_SETTINGS, ...next };
  storage.setItem(KEY, JSON.stringify(settings));
  return settings;
}
