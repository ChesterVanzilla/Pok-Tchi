export const MEDALS = Object.freeze([
  { bit: 1 << 0, label: 'Lv. 10', icon: '①' },
  { bit: 1 << 1, label: 'Lv. 25', icon: '②' },
  { bit: 1 << 2, label: 'Lv. 50', icon: '③' },
  { bit: 1 << 3, label: 'Beere', icon: '🍓' },
  { bit: 1 << 4, label: '7 Tage', icon: '◷' },
  { bit: 1 << 5, label: 'Bindung', icon: '♥' },
  { bit: 1 << 6, label: 'Endform', icon: '✦' },
  { bit: 1 << 7, label: 'Fit', icon: '⚡' }
]);

export const PACE_MS = Object.freeze({
  family: 4 * 60_000,
  original: 60_000,
  test: 5_000
});

export const ENDING = Object.freeze({
  NONE: 0,
  FAREWELL: 1,
  RUNAWAY: 2,
  RELEASE: 3
});

export const CEREMONY_MS = 10_000;
export const FAREWELL_AGE_MINUTES = 3 * 24 * 60;
export const RUNAWAY_TICKS = 60;

const MAX_OFFLINE_GAME_MINUTES = 14 * 24 * 60;
const MINUTES_PER_LEVEL = 60;

const clamp100 = (value) => Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
const dropTo = (value, amount, floor) => value <= floor ? value : Math.max(floor, value - amount);
const randomInt = (max) => Math.floor(Math.random() * max);
const todayNumber = () => Math.floor(Date.now() / 86_400_000);

export function speciesMapFromData(data) {
  return new Map(data.species.map((entry) => [entry.id, entry]));
}

export function createSlot(trainer, starterDex) {
  const now = Date.now();
  return {
    id: globalThis.crypto?.randomUUID?.() || `${now}-${Math.random().toString(16).slice(2)}`,
    trainer: trainer.trim() || 'Trainer',
    createdAt: now,
    lastRealMs: now,
    dexReg: Array(151).fill(false),
    dexShinyReg: Array(151).fill(false),
    streak: 0,
    bestStreak: 0,
    lastCareDay: 0,
    totalMedals: 0,
    gameHi: 0,
    strHi: 0,
    lastEnd: ENDING.NONE,
    history: [],
    pet: makeEgg(starterDex, Math.random() < (1 / 48))
  };
}

function makeEgg(targetDex, shiny) {
  return {
    speciesId: -1,
    eggTarget: targetDex,
    eggShiny: Boolean(shiny),
    eggTaps: 0,
    shiny: false,
    fullness: 80,
    joy: 80,
    energy: 80,
    hygiene: 100,
    poops: 0,
    weight: 0,
    geneAtk: 100,
    geneDef: 100,
    geneSpe: 100,
    trAtk: 0,
    trDef: 0,
    trSpe: 0,
    berryKnown: false,
    ageMinutes: 0,
    careMistakes: 0,
    mistakeCooldown: 0,
    sleeping: false,
    bond: 0,
    bondToday: 0,
    nick: '',
    medals: 0,
    neglectTicks: 0,
    goodTicks: 0,
    evoDeclinedLv: 0,
    farDeclinedAge: 0,
    ceremony: null,
    lastMessage: 'Tippe dreimal auf das Ei.'
  };
}

export function isEgg(slot) {
  return slot.pet.speciesId < 0;
}

export function levelOf(slot) {
  return 1 + Math.floor(slot.pet.ageMinutes / MINUTES_PER_LEVEL);
}

export function lowestStat(slot) {
  const pet = slot.pet;
  return Math.min(pet.fullness, pet.joy, pet.energy, pet.hygiene);
}

export function registeredCount(slot) {
  return slot.dexReg.reduce((sum, value) => sum + (value ? 1 : 0), 0);
}

export function getSpecies(slot, speciesById) {
  return speciesById.get(slot.pet.speciesId) || null;
}

export function getDisplayName(slot, speciesById) {
  if (isEgg(slot)) return 'Ei';
  const species = getSpecies(slot, speciesById);
  return slot.pet.nick || species?.nameDe || 'Pokémon';
}

export function getSpeciesName(slot, speciesById) {
  if (isEgg(slot)) return 'Ei';
  return getSpecies(slot, speciesById)?.nameDe || 'Pokémon';
}

export function applyElapsed(slot, settings, speciesById, now = Date.now(), offline = true) {
  if (slot.pet?.ceremony) return 0;
  if (!slot.lastRealMs || slot.lastRealMs > now) {
    slot.lastRealMs = now;
    return 0;
  }
  const tickMs = PACE_MS[settings.pace] || PACE_MS.family;
  const due = Math.floor((now - slot.lastRealMs) / tickMs);
  if (due <= 0) return 0;

  const ticks = Math.min(due, MAX_OFFLINE_GAME_MINUTES);
  const wasAwake = !slot.pet.sleeping;
  for (let index = 0; index < ticks; index += 1) tick(slot, speciesById, offline);

  if (offline && !isEgg(slot) && wasAwake && !slot.pet.sleeping) {
    slot.pet.poops = Math.min(3, slot.pet.poops + Math.floor(ticks / 240));
  }

  slot.lastRealMs = due > MAX_OFFLINE_GAME_MINUTES ? now : slot.lastRealMs + ticks * tickMs;
  return ticks;
}

export function tick(slot, speciesById, offline = false) {
  const pet = slot.pet;
  if (pet.ceremony) return;
  pet.ageMinutes += 1;

  if (isEgg(slot)) {
    if (pet.ageMinutes >= 3) hatch(slot, speciesById);
    return;
  }

  if (pet.sleeping) {
    pet.energy = clamp100(pet.energy + 6);
    if (pet.weight > 0 && pet.ageMinutes % 3 === 0) pet.weight -= 1;
    if (pet.ageMinutes % 2 === 0) {
      pet.fullness = dropTo(pet.fullness, 1, 30);
      pet.joy = dropTo(pet.joy, 1, 35);
    }
    if (pet.ageMinutes % 3 === 0) pet.hygiene = dropTo(pet.hygiene, 1, 45);
    checkMedals(slot, speciesById);
    return;
  }

  if (offline) {
    pet.fullness = dropTo(pet.fullness, 2, 15);
    pet.energy = dropTo(pet.energy, 1, 15);
    pet.hygiene = dropTo(pet.hygiene, 1, 15);
    pet.joy = dropTo(pet.joy, 1, 15);
    checkMedals(slot, speciesById);
    return;
  }

  pet.fullness = clamp100(pet.fullness - 2);
  pet.energy = clamp100(pet.energy - 1);
  if (pet.fullness > 40 && pet.poops < 3 && Math.random() < 0.15) pet.poops += 1;
  pet.hygiene = clamp100(pet.hygiene - 1 - 4 * pet.poops);
  if (pet.weight > 50) pet.energy = clamp100(pet.energy - 1);
  if (pet.weight > 0 && pet.ageMinutes % 3 === 0) pet.weight -= 1;

  if (lowestStat(slot) >= 40) {
    pet.goodTicks += 1;
    if (pet.goodTicks >= 720) {
      pet.goodTicks = 0;
      pet.trDef = Math.min(100, pet.trDef + 1);
    }
  } else {
    pet.goodTicks = 0;
  }

  let joyDrop = 1;
  if (pet.fullness < 30) joyDrop += 2;
  if (pet.hygiene < 30) joyDrop += 2;
  pet.joy = clamp100(pet.joy - joyDrop);

  if (pet.mistakeCooldown > 0) pet.mistakeCooldown -= 1;
  if (lowestStat(slot) <= 10 && pet.mistakeCooldown === 0) {
    pet.careMistakes += 1;
    pet.mistakeCooldown = 30;
    pet.bond = Math.max(0, pet.bond - 3);
  }

  if ([pet.fullness, pet.joy, pet.energy, pet.hygiene].every((value) => value === 0)) {
    pet.neglectTicks = Math.min(RUNAWAY_TICKS, pet.neglectTicks + 1);
  } else {
    pet.neglectTicks = 0;
  }
  checkMedals(slot, speciesById);
}

export function hatch(slot, speciesById) {
  const pet = slot.pet;
  pet.speciesId = pet.eggTarget;
  pet.shiny = pet.eggShiny;
  pet.geneAtk = 90 + randomInt(21);
  pet.geneDef = 90 + randomInt(21);
  pet.geneSpe = 90 + randomInt(21);
  pet.trAtk = pet.trDef = pet.trSpe = 0;
  pet.berryKnown = false;
  pet.bond = 0;
  pet.bondToday = 0;
  pet.medals = 0;
  pet.nick = '';
  registerSpecies(slot, pet.speciesId, pet.shiny);
  checkMedals(slot, speciesById);
  pet.lastMessage = `${speciesById.get(pet.speciesId)?.nameDe || 'Pokémon'} ist geschlüpft!`;
  return pet.speciesId;
}

export function eggTap(slot, speciesById) {
  if (!isEgg(slot)) return { changed: false };
  slot.pet.eggTaps += 1;
  if (slot.pet.eggTaps >= 3) {
    const speciesId = hatch(slot, speciesById);
    return { changed: true, hatched: true, speciesId, message: slot.pet.lastMessage };
  }
  const messages = ['Das Ei bewegt sich!', 'Fast geschafft!', 'Nur noch einmal tippen!'];
  slot.pet.lastMessage = messages[Math.min(slot.pet.eggTaps - 1, messages.length - 1)];
  return { changed: true, hatched: false, message: slot.pet.lastMessage };
}

export function lovesBerry(slot, color) {
  return !isEgg(slot) && slot.pet.speciesId % 3 === Number(color);
}

export function feedBerry(slot, color, speciesById) {
  const pet = slot.pet;
  if (isEgg(slot) || pet.sleeping) return blocked(slot);
  const loved = lovesBerry(slot, color);
  if (loved) {
    pet.fullness = clamp100(pet.fullness + 35);
    pet.joy = clamp100(pet.joy + 10);
    pet.berryKnown = true;
    addBond(slot, 2);
  } else {
    pet.fullness = clamp100(pet.fullness + 25);
  }
  registerCare(slot, speciesById);
  checkMedals(slot, speciesById);
  pet.lastMessage = loved ? 'Diese Beere liebt es!' : 'Mmmh, lecker!';
  return { changed: true, animation: 4, message: pet.lastMessage, loved };
}

export function feedCandy(slot, speciesById) {
  const pet = slot.pet;
  if (isEgg(slot) || pet.sleeping) return blocked(slot);
  pet.fullness = clamp100(pet.fullness + 10);
  pet.joy = clamp100(pet.joy + 12);
  pet.weight = clamp100(pet.weight + 12);
  registerCare(slot, speciesById);
  checkMedals(slot, speciesById);
  pet.lastMessage = 'Ein süßes Bonbon!';
  return { changed: true, animation: 4, message: pet.lastMessage };
}

export function clean(slot, speciesById) {
  const pet = slot.pet;
  if (isEgg(slot)) return blocked(slot, 'Das Ei ist bereits sauber.');
  pet.poops = 0;
  pet.hygiene = 100;
  addBond(slot, 1);
  registerCare(slot, speciesById);
  pet.lastMessage = 'Jetzt bin ich wieder sauber!';
  return { changed: true, animation: 10, message: pet.lastMessage };
}

export function toggleSleep(slot) {
  if (isEgg(slot)) return blocked(slot);
  slot.pet.sleeping = !slot.pet.sleeping;
  slot.pet.neglectTicks = 0;
  slot.pet.lastMessage = slot.pet.sleeping ? 'Gute Nacht …' : 'Guten Morgen!';
  return { changed: true, animation: slot.pet.sleeping ? 3 : 9, message: slot.pet.lastMessage };
}

export function caress(slot, speciesById) {
  const pet = slot.pet;
  if (isEgg(slot)) return eggTap(slot, speciesById);
  if (pet.sleeping) return blocked(slot, 'Pssst … es schläft.');
  pet.joy = clamp100(pet.joy + 5);
  addBond(slot, 1);
  registerCare(slot, speciesById);
  pet.lastMessage = 'Das gefällt mir!';
  return { changed: true, animation: 9, message: pet.lastMessage };
}

export function playResult(slot, score, speciesById) {
  const pet = slot.pet;
  if (isEgg(slot) || pet.sleeping) return blocked(slot);
  pet.trSpe = Math.min(100, pet.trSpe + Math.floor(score / 5));
  pet.joy = clamp100(pet.joy + 5 + (score > 15 ? 30 : score * 2));
  pet.energy = dropTo(pet.energy, 10 + Math.floor(score / 2), 5);
  pet.fullness = dropTo(pet.fullness, 5, 5);
  pet.weight = Math.max(0, pet.weight - score * 2);
  slot.gameHi = Math.max(slot.gameHi, score);
  addBond(slot, 2);
  registerCare(slot, speciesById);
  checkMedals(slot, speciesById);
  pet.lastMessage = score >= 8 ? 'Was für ein tolles Spiel!' : 'Das üben wir noch einmal.';
  return { changed: true, animation: score >= 8 ? 8 : 7, message: pet.lastMessage };
}

export function trainStrength(slot, hits, speciesById) {
  const pet = slot.pet;
  if (isEgg(slot) || pet.sleeping) return blocked(slot);
  const gain = Math.min(18, Math.floor(hits / 4));
  pet.trAtk = Math.min(100, pet.trAtk + gain);
  pet.energy = dropTo(pet.energy, 12, 5);
  pet.fullness = dropTo(pet.fullness, 5, 5);
  pet.weight = Math.max(0, pet.weight - Math.floor(hits / 3));
  pet.joy = clamp100(pet.joy + 6);
  slot.strHi = Math.max(slot.strHi, hits);
  addBond(slot, 2);
  registerCare(slot, speciesById);
  checkMedals(slot, speciesById);
  pet.lastMessage = `Kraft +${gain}`;
  return { changed: true, animation: 6, message: pet.lastMessage, gain };
}

function blocked(slot, message = '') {
  const text = message || (slot.pet.sleeping ? 'Es schläft gerade.' : 'Erst muss das Ei schlüpfen.');
  slot.pet.lastMessage = text;
  return { changed: false, message: text };
}

function registerSpecies(slot, speciesId, shiny) {
  if (speciesId < 1 || speciesId > 151) return;
  slot.dexReg[speciesId - 1] = true;
  if (shiny) slot.dexShinyReg[speciesId - 1] = true;
}

function addBond(slot, amount) {
  const pet = slot.pet;
  if (pet.bondToday >= 8) return;
  const allowed = Math.min(amount, 8 - pet.bondToday);
  pet.bond = clamp100(pet.bond + allowed);
  pet.bondToday += allowed;
}

function registerCare(slot, speciesById) {
  if (isEgg(slot)) return;
  slot.pet.neglectTicks = 0;
  const day = todayNumber();
  if (day === slot.lastCareDay) return;
  if (slot.lastCareDay === 0 || day === slot.lastCareDay + 1) slot.streak += 1;
  else slot.streak = 1;
  slot.lastCareDay = day;
  slot.bestStreak = Math.max(slot.bestStreak, slot.streak);
  slot.pet.bondToday = 0;
  slot.pet.bond = clamp100(slot.pet.bond + 4);
  checkMedals(slot, speciesById);
}

export function canEvolve(slot, speciesById) {
  if (isEgg(slot) || slot.pet.sleeping || slot.pet.ceremony) return false;
  const species = getSpecies(slot, speciesById);
  if (!species?.evolvesTo) return false;
  return levelOf(slot) >= species.evolveLevel + slot.pet.careMistakes && lowestStat(slot) >= 40;
}

export function wantEvolvePrompt(slot, speciesById) {
  return canEvolve(slot, speciesById) && levelOf(slot) > (slot.pet.evoDeclinedLv || 0);
}

export function declineEvolution(slot) {
  if (isEgg(slot)) return;
  slot.pet.evoDeclinedLv = levelOf(slot);
  slot.pet.lastMessage = 'Es bleibt vorerst in seiner jetzigen Form.';
}

export function evolve(slot, speciesById) {
  if (!canEvolve(slot, speciesById)) return { changed: false, message: 'Die Bedingungen sind noch nicht erfüllt.' };
  const current = getSpecies(slot, speciesById);
  const previousSpeciesId = slot.pet.speciesId;
  let next = current.evolvesTo;
  if (slot.pet.speciesId === 133) {
    const options = [134, 135, 136];
    const missing = options.filter((id) => !slot.dexReg[id - 1]);
    const pool = missing.length ? missing : options;
    next = pool[randomInt(pool.length)];
  }
  slot.pet.speciesId = next;
  slot.pet.evoDeclinedLv = 0;
  registerSpecies(slot, next, slot.pet.shiny);
  checkMedals(slot, speciesById);
  const name = speciesById.get(next)?.nameDe || 'Pokémon';
  slot.pet.lastMessage = `Entwicklung zu ${name}!`;
  return { changed: true, previousSpeciesId, speciesId: next, animation: 7, message: slot.pet.lastMessage };
}

export function canFarewell(slot, speciesById) {
  if (isEgg(slot) || slot.pet.sleeping || slot.pet.ceremony) return false;
  const species = getSpecies(slot, speciesById);
  return Boolean(species && species.evolvesTo === 0 && slot.pet.ageMinutes >= FAREWELL_AGE_MINUTES);
}

export function wantFarewellPrompt(slot, speciesById) {
  return canFarewell(slot, speciesById) && slot.pet.ageMinutes >= (slot.pet.farDeclinedAge || 0);
}

export function declineFarewell(slot) {
  if (isEgg(slot)) return;
  slot.pet.farDeclinedAge = slot.pet.ageMinutes + 1440;
  slot.pet.lastMessage = 'Ihr bleibt noch mindestens einen weiteren Tag zusammen.';
}

export function canRunaway(slot) {
  return !isEgg(slot) && !slot.pet.sleeping && !slot.pet.ceremony && slot.pet.neglectTicks >= RUNAWAY_TICKS;
}

export function neglectProgress(slot) {
  if (isEgg(slot)) return 0;
  return Math.max(0, Math.min(100, Math.round((slot.pet.neglectTicks / RUNAWAY_TICKS) * 100)));
}

export function startCeremony(slot, type, speciesById, now = Date.now()) {
  if (isEgg(slot) || slot.pet.ceremony) return { changed: false, message: 'Diese Szene kann gerade nicht gestartet werden.' };
  if (![ENDING.FAREWELL, ENDING.RUNAWAY, ENDING.RELEASE].includes(type)) {
    return { changed: false, message: 'Unbekannte Abschiedsart.' };
  }
  if (type === ENDING.FAREWELL && !canFarewell(slot, speciesById)) {
    return { changed: false, message: 'Der gemeinsame Lebenszyklus ist noch nicht abgeschlossen.' };
  }
  if (type === ENDING.RUNAWAY && !canRunaway(slot)) {
    return { changed: false, message: 'Du kannst dein Pokémon noch retten.' };
  }

  const displayName = getDisplayName(slot, speciesById);
  slot.lastEnd = type;
  slot.pet.ceremony = {
    type,
    startedAt: now,
    endsAt: now + CEREMONY_MS,
    speciesId: slot.pet.speciesId,
    shiny: slot.pet.shiny,
    displayName
  };
  slot.pet.lastMessage = type === ENDING.RUNAWAY
    ? `${displayName} fühlt sich allein gelassen …`
    : type === ENDING.FAREWELL
      ? `${displayName} möchte sich bedanken.`
      : `${displayName} verabschiedet sich.`;
  return { changed: true, type, message: slot.pet.lastMessage, ceremony: slot.pet.ceremony };
}

export function ceremonyProgress(slot, now = Date.now()) {
  const ceremony = slot?.pet?.ceremony;
  if (!ceremony) return 0;
  return Math.max(0, Math.min(1, (now - ceremony.startedAt) / Math.max(1, ceremony.endsAt - ceremony.startedAt)));
}

export function finishCeremony(slot, speciesById, now = Date.now()) {
  const ceremony = slot?.pet?.ceremony;
  if (!ceremony) return { changed: false };
  const record = {
    at: now,
    type: ceremony.type,
    speciesId: ceremony.speciesId,
    shiny: ceremony.shiny,
    name: ceremony.displayName,
    level: levelOf(slot),
    bond: slot.pet.bond,
    medals: slot.pet.medals
  };
  if (!Array.isArray(slot.history)) slot.history = [];
  slot.history.push(record);
  slot.history = slot.history.slice(-20);

  const target = pickEggSpecies(slot, speciesById);
  const denominator = Math.max(8, (ceremony.type === ENDING.FAREWELL ? 24 : 48) - careBonus(slot));
  const shiny = randomInt(denominator) === 0;
  slot.pet = makeEgg(target, shiny);
  slot.lastRealMs = now;
  return { changed: true, target, shiny, record };
}

export function finishExpiredCeremony(slot, speciesById, now = Date.now()) {
  if (!slot?.pet?.ceremony || slot.pet.ceremony.endsAt > now) return { changed: false };
  return finishCeremony(slot, speciesById, now);
}

export function releaseAndCreateEgg(slot, speciesById) {
  const started = startCeremony(slot, ENDING.RELEASE, speciesById);
  if (!started.changed) return null;
  return started;
}

function careBonus(slot) {
  return Math.floor(Math.min(slot.streak, 30) / 3) + Math.floor(slot.pet.bond / 25);
}

function lineHasUnregistered(slot, base, speciesById) {
  let current = base;
  for (let guard = 0; current >= 1 && current <= 151 && guard < 6; guard += 1) {
    if (!slot.dexReg[current - 1]) return true;
    if (current === 133) return [134, 135, 136].some((id) => !slot.dexReg[id - 1]);
    current = speciesById.get(current)?.evolvesTo || 0;
  }
  return false;
}

function pickEggSpecies(slot, speciesById) {
  if (registeredCount(slot) === 0) return [1, 4, 7][randomInt(3)];

  let tier = 1;
  const bonus = careBonus(slot);
  if (slot.lastEnd !== ENDING.RUNAWAY) {
    const blessed = slot.lastEnd === ENDING.FAREWELL;
    const rareChance = (blessed ? 45 : 27) + bonus;
    const legendaryChance = registeredCount(slot) >= 25
      ? (blessed ? 10 : 3) + Math.floor(bonus / 3)
      : 0;
    const roll = randomInt(100);
    if (roll < legendaryChance) tier = 3;
    else if (roll < legendaryChance + rareChance) tier = 2;
  }

  for (let pass = 0; pass < 2; pass += 1) {
    for (let currentTier = tier; currentTier >= 1; currentTier -= 1) {
      const candidates = [...speciesById.values()].filter((species) => {
        if (species.rarity !== currentTier) return false;
        return pass === 1 || lineHasUnregistered(slot, species.id, speciesById);
      });
      if (candidates.length) return candidates[randomInt(candidates.length)].id;
    }
  }
  return [1, 4, 7][randomInt(3)];
}

export function checkMedals(slot, speciesById) {
  if (isEgg(slot)) return 0;
  const pet = slot.pet;
  const before = pet.medals;
  const species = getSpecies(slot, speciesById);
  const level = levelOf(slot);
  if (level >= 10) pet.medals |= 1 << 0;
  if (level >= 25) pet.medals |= 1 << 1;
  if (level >= 50) pet.medals |= 1 << 2;
  if (pet.berryKnown) pet.medals |= 1 << 3;
  if (slot.streak >= 7) pet.medals |= 1 << 4;
  if (pet.bond >= 100) pet.medals |= 1 << 5;
  if (species && species.evolvesTo === 0) pet.medals |= 1 << 6;
  if (pet.weight === 0 && level >= 5 && pet.careMistakes === 0) pet.medals |= 1 << 7;
  const gained = pet.medals & ~before;
  if (gained) {
    let count = 0;
    for (let mask = gained; mask; mask &= mask - 1) count += 1;
    slot.totalMedals += count;
  }
  return gained;
}

export function combatStats(slot, speciesById) {
  const species = getSpecies(slot, speciesById);
  if (!species) return { atk: 0, def: 0, spe: 0 };
  const level = levelOf(slot);
  return {
    atk: Math.floor(species.base.atk * slot.pet.geneAtk / 100) + level + slot.pet.trAtk,
    def: Math.floor(species.base.def * slot.pet.geneDef / 100) + level + slot.pet.trDef,
    spe: Math.floor(species.base.spe * slot.pet.geneSpe / 100) + level + slot.pet.trSpe
  };
}

export function moodText(slot) {
  const pet = slot.pet;
  if (isEgg(slot)) return pet.lastMessage || 'Tippe dreimal auf das Ei.';
  if (pet.ceremony) return pet.lastMessage || 'Auf Wiedersehen …';
  if (pet.sleeping) return 'Zzz …';
  if (canRunaway(slot)) return 'Ich fühle mich ganz allein …';
  if (pet.fullness < 25) return 'Ich habe Hunger.';
  if (pet.hygiene < 25) return 'Ich brauche ein Bad.';
  if (pet.energy < 20) return 'Ich bin erschöpft.';
  if (pet.joy < 25) return 'Spielst du mit mir?';
  if (pet.weight > 65) return 'Ein wenig Bewegung wäre gut.';
  return pet.lastMessage || 'Mir geht es gut!';
}

export function formatAge(minutes) {
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
  return `${Math.floor(minutes / 1440)}T`;
}

export function setNickname(slot, nickname) {
  slot.pet.nick = String(nickname || '').trim().slice(0, 11);
}
