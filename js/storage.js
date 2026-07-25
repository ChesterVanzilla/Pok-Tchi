const STORAGE_KEY = 'tamapoke-family-web-v01';

export function defaultState() {
  return {
    version: 1,
    settings: {
      pace: 'family',
      sound: true,
      motion: true
    },
    slots: [null, null, null]
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const clean = defaultState();
    clean.settings = { ...clean.settings, ...(parsed.settings || {}) };
    clean.slots = Array.isArray(parsed.slots) ? parsed.slots.slice(0, 3) : clean.slots;
    while (clean.slots.length < 3) clean.slots.push(null);
    return clean;
  } catch (error) {
    console.warn('Spielstand konnte nicht gelesen werden:', error);
    return defaultState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error('Spielstand konnte nicht gespeichert werden:', error);
    return false;
  }
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}
