const STORAGE_KEY = 'tamapoke-family-web-v01';

export function defaultState() {
  return {
    version: 3,
    settings: {
      pace: 'family',
      sound: true,
      motion: true,
      worldTime: 'auto'
    },
    slots: [null, null, null]
  };
}

function normalizePet(pet) {
  if (!pet || typeof pet !== 'object') return pet;
  return {
    ...pet,
    evoDeclinedLv: Number(pet.evoDeclinedLv) || 0,
    farDeclinedAge: Number(pet.farDeclinedAge) || 0,
    neglectTicks: Number(pet.neglectTicks) || 0,
    ceremony: pet.ceremony && typeof pet.ceremony === 'object' ? pet.ceremony : null,
    lastMessage: String(pet.lastMessage || '')
  };
}

function normalizeSlot(slot) {
  if (!slot || typeof slot !== 'object') return null;
  return {
    ...slot,
    history: Array.isArray(slot.history) ? slot.history.slice(-20) : [],
    lastEnd: Number(slot.lastEnd) || 0,
    pet: normalizePet(slot.pet)
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const clean = defaultState();
    clean.settings = { ...clean.settings, ...(parsed.settings || {}) };
    clean.slots = Array.isArray(parsed.slots)
      ? parsed.slots.slice(0, 3).map(normalizeSlot)
      : clean.slots;
    while (clean.slots.length < 3) clean.slots.push(null);
    return clean;
  } catch (error) {
    console.warn('Spielstand konnte nicht gelesen werden:', error);
    return defaultState();
  }
}

export function saveState(state) {
  try {
    const payload = { ...state, version: 3 };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error('Spielstand konnte nicht gespeichert werden:', error);
    return false;
  }
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}
