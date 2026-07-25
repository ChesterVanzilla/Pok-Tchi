import { loadState, saveState, clearState, defaultState } from './storage.js';
import { SpritePlayer, ACTION } from './sprite-engine.js';
import {
  MEDALS,
  createSlot,
  speciesMapFromData,
  applyElapsed,
  isEgg,
  levelOf,
  registeredCount,
  getSpecies,
  getDisplayName,
  getSpeciesName,
  eggTap,
  feedBerry,
  feedCandy,
  clean,
  toggleSleep,
  caress,
  playResult,
  trainStrength,
  canEvolve,
  evolve,
  releaseAndCreateEgg,
  combatStats,
  moodText,
  formatAge,
  setNickname
} from './game-engine.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const TYPE_LABELS = {
  normal: 'Normal', fuego: 'Feuer', agua: 'Wasser', planta: 'Pflanze', electrico: 'Elektro',
  hielo: 'Eis', lucha: 'Kampf', veneno: 'Gift', tierra: 'Boden', psiquico: 'Psycho',
  bicho: 'Käfer', roca: 'Gestein', fantasma: 'Geist', dragon: 'Drache'
};
const BIOMES = ['Wiese', 'Strand', 'Wald', 'Vulkan', 'Berge', 'Schnee'];
const STARTERS = [1, 4, 7];

let state = loadState();
let data;
let speciesById;
let currentSlotIndex = null;
let mainSprite;
let detailSprite;
let starterPlayers = [];
let slotPlayers = [];
let toastTimer;
let appTimer;
let miniTimer;
let trainTimer;
let miniScore = 0;
let trainHits = 0;

const screens = {
  slots: $('#slotScreen'),
  starter: $('#starterScreen'),
  game: $('#gameScreen'),
  dex: $('#dexScreen')
};

function currentSlot() {
  return Number.isInteger(currentSlotIndex) ? state.slots[currentSlotIndex] : null;
}

function showScreen(name) {
  Object.entries(screens).forEach(([key, screen]) => screen.classList.toggle('active', key === name));
  window.scrollTo(0, 0);
}

function openDialog(dialog) {
  if (!dialog.open) dialog.showModal();
}

function closeDialog(dialog) {
  if (dialog?.open) dialog.close();
}

function persist() {
  saveState(state);
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2300);
}

function beep(kind = 'ok') {
  if (!state.settings.sound || !window.AudioContext) return;
  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const frequencies = { ok: 560, hatch: 720, evolve: 820, food: 480, play: 650, clean: 590, sleep: 330, error: 220 };
    oscillator.type = kind === 'error' ? 'square' : 'sine';
    oscillator.frequency.setValueAtTime(frequencies[kind] || 560, context.currentTime);
    gain.gain.setValueAtTime(0.055, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.18);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.19);
  } catch {}
}

function destroyPlayers(players) {
  players.forEach((player) => player.destroy());
  players.length = 0;
}

async function renderSlots() {
  destroyPlayers(slotPlayers);
  const list = $('#slotList');
  list.innerHTML = '';

  state.slots.forEach((slot, index) => {
    if (slot) applyElapsed(slot, state.settings, speciesById);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'slot-card';

    const icon = document.createElement('div');
    icon.className = 'slot-icon';
    const copy = document.createElement('div');
    copy.className = 'slot-copy';
    const arrow = document.createElement('span');
    arrow.className = 'slot-arrow';
    arrow.textContent = '›';

    if (!slot) {
      icon.textContent = '＋';
      const title = document.createElement('strong');
      title.textContent = 'Neuer Spielstand';
      const meta = document.createElement('span');
      meta.textContent = `Profil ${index + 1}`;
      copy.append(title, meta);
      button.addEventListener('click', () => openStarter(index));
    } else {
      const title = document.createElement('strong');
      title.textContent = slot.trainer;
      const meta = document.createElement('span');
      if (isEgg(slot)) {
        icon.textContent = '🥚';
        meta.textContent = `Ei · ${slot.pet.eggTaps}/3 Berührungen`;
      } else {
        const species = getSpecies(slot, speciesById);
        const canvas = document.createElement('canvas');
        canvas.width = 80;
        canvas.height = 80;
        icon.appendChild(canvas);
        const player = new SpritePlayer(canvas, { motion: state.settings.motion });
        slotPlayers.push(player);
        player.load(slot.pet.shiny ? species.shinySprite : species.sprite).catch(() => { icon.textContent = '◆'; });
        meta.textContent = `${getDisplayName(slot, speciesById)} · Level ${levelOf(slot)}`;
      }
      copy.append(title, meta);
      button.addEventListener('click', () => openGame(index));
    }

    button.append(icon, copy, arrow);
    list.appendChild(button);
  });
  persist();
}

function openStarter(index) {
  currentSlotIndex = index;
  $('#trainerName').value = '';
  showScreen('starter');
  renderStarters();
}

function renderStarters() {
  destroyPlayers(starterPlayers);
  const grid = $('#starterGrid');
  grid.innerHTML = '';

  STARTERS.forEach((id) => {
    const species = speciesById.get(id);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'starter-card';

    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const copy = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = species.nameDe;
    const info = document.createElement('small');
    info.textContent = `#${String(id).padStart(3, '0')} · entwickelt sich auf Level ${species.evolveLevel}`;
    const type = document.createElement('small');
    type.className = 'type-chip';
    type.style.background = species.typeColor;
    type.textContent = TYPE_LABELS[species.type] || species.type;
    copy.append(title, info, type);
    const arrow = document.createElement('span');
    arrow.className = 'slot-arrow';
    arrow.textContent = '›';
    button.append(canvas, copy, arrow);
    button.addEventListener('click', () => createNewGame(id));
    grid.appendChild(button);

    const player = new SpritePlayer(canvas, { motion: state.settings.motion });
    starterPlayers.push(player);
    player.load(species.sprite).catch(console.warn);
  });
}

function createNewGame(starterId) {
  const trainer = $('#trainerName').value.trim() || `Trainer ${currentSlotIndex + 1}`;
  state.slots[currentSlotIndex] = createSlot(trainer, starterId);
  persist();
  openGame(currentSlotIndex);
  showToast('Das Ei ist bereit. Tippe es dreimal an!');
}

async function openGame(index) {
  currentSlotIndex = index;
  const slot = currentSlot();
  if (!slot) return;
  applyElapsed(slot, state.settings, speciesById);
  persist();
  showScreen('game');
  renderGame();
  await loadMainSprite();
}

async function loadMainSprite(action = null) {
  const slot = currentSlot();
  if (!slot || isEgg(slot)) {
    $('#petCanvas').hidden = true;
    $('#eggView').classList.remove('hidden');
    return;
  }
  const species = getSpecies(slot, speciesById);
  $('#petCanvas').hidden = false;
  $('#eggView').classList.add('hidden');
  try {
    await mainSprite.load(slot.pet.shiny ? species.shinySprite : species.sprite);
    mainSprite.setMotion(state.settings.motion);
    if (slot.pet.sleeping) mainSprite.setAction(ACTION.SLEEP);
    else if (action !== null) mainSprite.play(action);
    else mainSprite.setAction(ACTION.IDLE);
  } catch (error) {
    console.error(error);
    showToast('Sprite konnte nicht geladen werden.');
  }
}

function renderGame() {
  const slot = currentSlot();
  if (!slot) return;
  const pet = slot.pet;
  const species = getSpecies(slot, speciesById);

  $('#trainerLabel').textContent = slot.trainer;
  $('#petTitle').textContent = getDisplayName(slot, speciesById);
  $('#speechBubble').textContent = moodText(slot);
  $('#sleepActionLabel').textContent = pet.sleeping ? 'Wecken' : 'Schlafen';
  $('#shinyBadge').hidden = isEgg(slot) || !pet.shiny;

  const habitat = $('#habitat');
  const hour = new Date().getHours();
  const night = hour < 7 || hour >= 20;
  habitat.className = `habitat biome-${species?.biome ?? 0} ${night ? 'night' : 'day'}`;

  const egg = $('#eggView');
  egg.classList.toggle('hidden', !isEgg(slot));
  egg.classList.toggle('crack-1', isEgg(slot) && pet.eggTaps >= 1);
  egg.classList.toggle('crack-2', isEgg(slot) && pet.eggTaps >= 2);
  $('#petCanvas').hidden = isEgg(slot);

  updateMeter('fullness', pet.fullness);
  updateMeter('joy', pet.joy);
  updateMeter('energy', pet.energy);
  updateMeter('hygiene', pet.hygiene);
  $('#levelValue').textContent = levelOf(slot);
  $('#bondValue').textContent = pet.bond;
  $('#streakValue').textContent = slot.streak;
  $('#ageValue').textContent = formatAge(pet.ageMinutes);

  const poopRow = $('#poopRow');
  poopRow.textContent = isEgg(slot) ? '' : '💩'.repeat(pet.poops);
  $('#evolveBanner').hidden = !canEvolve(slot, speciesById);
}

function updateMeter(key, value) {
  const rounded = Math.round(value);
  $(`#${key}Value`).textContent = rounded;
  const bar = $(`#${key}Bar`);
  bar.style.width = `${rounded}%`;
  bar.style.background = rounded <= 20 ? 'var(--bad)' : rounded <= 45 ? 'var(--warn)' : 'var(--good)';
}

function processResult(result, sound = 'ok') {
  if (!result) return;
  if (result.message) $('#speechBubble').textContent = result.message;
  if (!result.changed) {
    beep('error');
    showToast(result.message || 'Diese Aktion ist gerade nicht möglich.');
    return;
  }
  beep(sound);
  persist();
  renderGame();
  if (Number.isInteger(result.animation) && !currentSlot().pet.sleeping) mainSprite.play(result.animation);
}

async function touchPet() {
  const slot = currentSlot();
  if (!slot) return;
  const result = isEgg(slot) ? eggTap(slot, speciesById) : caress(slot, speciesById);
  processResult(result, result.hatched ? 'hatch' : 'ok');
  if (result.hatched) await loadMainSprite(ACTION.HOP);
}

function renderDex(query = '') {
  const slot = currentSlot();
  if (!slot) return;
  const normalized = query.trim().toLocaleLowerCase('de');
  const grid = $('#dexGrid');
  grid.innerHTML = '';
  $('#dexCount').textContent = `${registeredCount(slot)}/151`;

  data.species
    .filter((species) => !normalized || species.nameDe.toLocaleLowerCase('de').includes(normalized) || species.nameEn.toLocaleLowerCase('de').includes(normalized) || String(species.id).includes(normalized))
    .forEach((species) => {
      const registered = slot.dexReg[species.id - 1];
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `dex-entry${registered ? '' : ' locked'}`;
      const number = document.createElement('span');
      number.textContent = `#${String(species.id).padStart(3, '0')}`;
      const name = document.createElement('strong');
      name.textContent = registered ? species.nameDe : '???';
      button.append(number, name);
      button.addEventListener('click', () => openDexDetail(species));
      grid.appendChild(button);
    });
}

async function openDexDetail(species) {
  const slot = currentSlot();
  const registered = slot.dexReg[species.id - 1];
  $('#dexDetailNumber').textContent = `#${String(species.id).padStart(3, '0')}`;
  $('#dexDetailName').textContent = registered ? species.nameDe : 'Unbekannt';
  $('#dexLocked').hidden = registered;
  $('#dexDetailCanvas').hidden = !registered;
  const meta = $('#dexDetailMeta');
  meta.innerHTML = '';

  const values = registered ? [
    ['Typ', TYPE_LABELS[species.type] || species.type],
    ['Lebensraum', BIOMES[species.biome]],
    ['Entwicklung', species.evolvesTo ? `${speciesById.get(species.evolvesTo)?.nameDe} · Lv. ${species.evolveLevel}` : 'Endform'],
    ['Shiny registriert', slot.dexShinyReg[species.id - 1] ? 'Ja' : 'Nein']
  ] : [['Hinweis', 'Dieses Pokémon muss zuerst aufgezogen oder entwickelt werden.']];
  values.forEach(([label, value]) => meta.appendChild(metricNode(label, value)));

  openDialog($('#dexDetailDialog'));
  if (registered) {
    const shiny = slot.dexShinyReg[species.id - 1];
    try {
      await detailSprite.load(shiny ? species.shinySprite : species.sprite);
      detailSprite.setMotion(state.settings.motion);
      detailSprite.setAction(ACTION.IDLE);
    } catch (error) {
      console.error(error);
    }
  }
}

function metricNode(label, value) {
  const item = document.createElement('div');
  const small = document.createElement('span');
  small.textContent = label;
  const strong = document.createElement('strong');
  strong.textContent = value;
  item.append(small, strong);
  return item;
}

function renderInfo() {
  const slot = currentSlot();
  if (!slot || isEgg(slot)) {
    showToast('Der Pokémon-Pass wird nach dem Schlüpfen freigeschaltet.');
    return false;
  }
  const pet = slot.pet;
  const species = getSpecies(slot, speciesById);
  const stats = combatStats(slot, speciesById);
  $('#infoName').textContent = getDisplayName(slot, speciesById);
  $('#nicknameInput').value = pet.nick;

  const metrics = $('#infoMetrics');
  metrics.innerHTML = '';
  [
    ['Art', species.nameDe],
    ['Typ', TYPE_LABELS[species.type] || species.type],
    ['Alter', `${pet.ageMinutes} Spielminuten`],
    ['Gewicht', `${pet.weight}/100`],
    ['Pflegefehler', pet.careMistakes],
    ['Lieblingsbeere', pet.berryKnown ? ['Rot', 'Blau', 'Grün'][pet.speciesId % 3] : 'Noch unbekannt']
  ].forEach(([label, value]) => metrics.appendChild(metricNode(label, value)));

  const combat = $('#combatStats');
  combat.innerHTML = '';
  [
    ['ANG', stats.atk, `Gen ${pet.geneAtk}% · Tr ${pet.trAtk}`],
    ['VER', stats.def, `Gen ${pet.geneDef}% · Tr ${pet.trDef}`],
    ['INI', stats.spe, `Gen ${pet.geneSpe}% · Tr ${pet.trSpe}`]
  ].forEach(([label, value, sub]) => {
    const item = document.createElement('div');
    item.innerHTML = `<span>${label}</span><strong>${value}</strong><small>${sub}</small>`;
    combat.appendChild(item);
  });

  const medals = $('#medalGrid');
  medals.innerHTML = '';
  MEDALS.forEach((medal) => {
    const item = document.createElement('div');
    item.className = `medal${pet.medals & medal.bit ? ' earned' : ''}`;
    const icon = document.createElement('span');
    icon.textContent = medal.icon;
    const label = document.createElement('small');
    label.textContent = medal.label;
    item.append(icon, label);
    medals.appendChild(item);
  });
  return true;
}

function openSettings() {
  $('#paceSelect').value = state.settings.pace;
  $('#soundToggle').checked = state.settings.sound;
  $('#motionToggle').checked = state.settings.motion;
  openDialog($('#settingsDialog'));
}

function applyMotionSetting() {
  document.documentElement.classList.toggle('no-motion', !state.settings.motion);
  mainSprite?.setMotion(state.settings.motion);
  detailSprite?.setMotion(state.settings.motion);
  starterPlayers.forEach((player) => player.setMotion(state.settings.motion));
  slotPlayers.forEach((player) => player.setMotion(state.settings.motion));
}

function positionMiniTarget() {
  const arena = $('#miniArena');
  const target = $('#miniTarget');
  const width = Math.max(1, arena.clientWidth - target.offsetWidth - 12);
  const height = Math.max(1, arena.clientHeight - target.offsetHeight - 12);
  target.style.left = `${6 + Math.random() * width}px`;
  target.style.top = `${6 + Math.random() * height}px`;
}

function startMiniGame() {
  clearInterval(miniTimer);
  miniScore = 0;
  let remaining = 15;
  $('#miniScore').textContent = miniScore;
  $('#miniTime').textContent = remaining;
  $('#miniStartHint').hidden = true;
  $('#miniTarget').style.display = 'block';
  $('#startMiniBtn').disabled = true;
  positionMiniTarget();
  const end = Date.now() + 15_000;
  miniTimer = setInterval(() => {
    remaining = Math.max(0, Math.ceil((end - Date.now()) / 1000));
    $('#miniTime').textContent = remaining;
    if (remaining <= 0) finishMiniGame();
  }, 100);
}

function finishMiniGame() {
  clearInterval(miniTimer);
  miniTimer = null;
  $('#miniTarget').style.display = 'none';
  $('#startMiniBtn').disabled = false;
  $('#startMiniBtn').textContent = 'Noch einmal';
  const hint = $('#miniStartHint');
  hint.hidden = false;
  hint.textContent = `${miniScore} Punkte · Rekord ${Math.max(currentSlot().gameHi, miniScore)}`;
  const result = playResult(currentSlot(), miniScore, speciesById);
  processResult(result, 'play');
}

function cancelMiniGame() {
  clearInterval(miniTimer);
  miniTimer = null;
  $('#miniTarget').style.display = 'none';
  $('#startMiniBtn').disabled = false;
  closeDialog($('#miniGameDialog'));
}

function startTraining() {
  clearInterval(trainTimer);
  trainHits = 0;
  let remaining = 10;
  $('#trainHits').textContent = trainHits;
  $('#trainTime').textContent = remaining;
  $('#trainStartHint').hidden = true;
  $('#punchBag').style.display = 'block';
  $('#startTrainBtn').disabled = true;
  const end = Date.now() + 10_000;
  trainTimer = setInterval(() => {
    remaining = Math.max(0, Math.ceil((end - Date.now()) / 1000));
    $('#trainTime').textContent = remaining;
    if (remaining <= 0) finishTraining();
  }, 100);
}

function finishTraining() {
  clearInterval(trainTimer);
  trainTimer = null;
  $('#punchBag').style.display = 'none';
  $('#startTrainBtn').disabled = false;
  $('#startTrainBtn').textContent = 'Noch einmal';
  const result = trainStrength(currentSlot(), trainHits, speciesById);
  $('#trainStartHint').hidden = false;
  $('#trainStartHint').textContent = `${trainHits} Treffer · Kraft +${result.gain || 0}`;
  processResult(result, 'play');
}

function cancelTraining() {
  clearInterval(trainTimer);
  trainTimer = null;
  $('#punchBag').style.display = 'none';
  $('#startTrainBtn').disabled = false;
  closeDialog($('#trainDialog'));
}

function bindEvents() {
  $('[data-nav="slots"]').addEventListener('click', async () => {
    await renderSlots();
    showScreen('slots');
  });
  $('[data-nav="game"]').addEventListener('click', () => showScreen('game'));
  $('#backToSlotsBtn').addEventListener('click', async () => {
    persist();
    await renderSlots();
    showScreen('slots');
  });
  $('#petTouchArea').addEventListener('click', touchPet);
  $('#openSettingsBtn').addEventListener('click', openSettings);
  $('#openDexBtn').addEventListener('click', () => {
    renderDex($('#dexSearch').value);
    showScreen('dex');
  });
  $('#dexSearch').addEventListener('input', (event) => renderDex(event.target.value));

  $$('.close-dialog').forEach((button) => button.addEventListener('click', () => closeDialog(button.closest('dialog'))));

  $$('[data-action]').forEach((button) => button.addEventListener('click', () => {
    const action = button.dataset.action;
    const slot = currentSlot();
    if (!slot) return;
    if (action === 'food') {
      if (isEgg(slot) || slot.pet.sleeping) return processResult({ changed: false, message: slot.pet.sleeping ? 'Es schläft gerade.' : 'Erst muss das Ei schlüpfen.' });
      openDialog($('#foodDialog'));
    } else if (action === 'play') {
      if (isEgg(slot) || slot.pet.sleeping) return processResult({ changed: false, message: slot.pet.sleeping ? 'Es schläft gerade.' : 'Erst muss das Ei schlüpfen.' });
      $('#miniTime').textContent = '15';
      $('#miniScore').textContent = '0';
      $('#miniStartHint').hidden = false;
      $('#miniStartHint').textContent = 'Tippe auf Start und fange so viele Sterne wie möglich.';
      $('#startMiniBtn').textContent = 'Start';
      openDialog($('#miniGameDialog'));
    } else if (action === 'train') {
      if (isEgg(slot) || slot.pet.sleeping) return processResult({ changed: false, message: slot.pet.sleeping ? 'Es schläft gerade.' : 'Erst muss das Ei schlüpfen.' });
      $('#trainTime').textContent = '10';
      $('#trainHits').textContent = '0';
      $('#trainStartHint').hidden = false;
      $('#trainStartHint').textContent = 'Tippe schnell auf den Sack.';
      $('#startTrainBtn').textContent = 'Start';
      openDialog($('#trainDialog'));
    } else if (action === 'clean') {
      processResult(clean(slot, speciesById), 'clean');
    } else if (action === 'sleep') {
      const result = toggleSleep(slot);
      processResult(result, 'sleep');
      if (result.changed) mainSprite.setAction(slot.pet.sleeping ? ACTION.SLEEP : ACTION.IDLE);
    } else if (action === 'info') {
      if (renderInfo()) openDialog($('#infoDialog'));
    }
  }));

  $$('[data-berry]').forEach((button) => button.addEventListener('click', () => {
    const result = feedBerry(currentSlot(), Number(button.dataset.berry), speciesById);
    closeDialog($('#foodDialog'));
    processResult(result, 'food');
  }));
  $('#candyBtn').addEventListener('click', () => {
    const result = feedCandy(currentSlot(), speciesById);
    closeDialog($('#foodDialog'));
    processResult(result, 'food');
  });

  $('#evolveBanner').addEventListener('click', async () => {
    const slot = currentSlot();
    const species = getSpecies(slot, speciesById);
    const nextName = speciesById.get(species.evolvesTo)?.nameDe || 'eine neue Form';
    if (!confirm(`${getSpeciesName(slot, speciesById)} zu ${nextName} entwickeln?`)) return;
    const result = evolve(slot, speciesById);
    processResult(result, 'evolve');
    if (result.changed) await loadMainSprite(ACTION.POSE);
  });

  $('#saveNicknameBtn').addEventListener('click', () => {
    setNickname(currentSlot(), $('#nicknameInput').value);
    persist();
    renderGame();
    renderInfo();
    showToast('Spitzname gespeichert.');
  });
  $('#newEggBtn').addEventListener('click', async () => {
    const slot = currentSlot();
    if (!confirm(`${getDisplayName(slot, speciesById)} wirklich freilassen? Danach erhältst du ein neues, zufälliges Ei.`)) return;
    releaseAndCreateEgg(slot, speciesById);
    persist();
    closeDialog($('#infoDialog'));
    renderGame();
    await loadMainSprite();
    beep('hatch');
    showToast('Ein neues Ei ist erschienen.');
  });

  $('#paceSelect').addEventListener('change', (event) => {
    state.slots.forEach((slot) => { if (slot) applyElapsed(slot, state.settings, speciesById); });
    state.settings.pace = event.target.value;
    const now = Date.now();
    state.slots.forEach((slot) => { if (slot) slot.lastRealMs = now; });
    persist();
    showToast('Spieltempo geändert.');
  });
  $('#soundToggle').addEventListener('change', (event) => { state.settings.sound = event.target.checked; persist(); beep('ok'); });
  $('#motionToggle').addEventListener('change', (event) => { state.settings.motion = event.target.checked; persist(); applyMotionSetting(); });
  $('#resetAllBtn').addEventListener('click', async () => {
    if (!confirm('Wirklich alle drei Spielstände unwiderruflich löschen?')) return;
    clearState();
    state = defaultState();
    currentSlotIndex = null;
    closeDialog($('#settingsDialog'));
    applyMotionSetting();
    await renderSlots();
    showScreen('slots');
    showToast('Alle Spielstände wurden gelöscht.');
  });

  $('#startMiniBtn').addEventListener('click', startMiniGame);
  $('#cancelMiniBtn').addEventListener('click', cancelMiniGame);
  $('#miniTarget').addEventListener('click', () => {
    miniScore += 1;
    $('#miniScore').textContent = miniScore;
    positionMiniTarget();
    beep('play');
  });

  $('#startTrainBtn').addEventListener('click', startTraining);
  $('#cancelTrainBtn').addEventListener('click', cancelTraining);
  $('#punchBag').addEventListener('click', () => {
    trainHits += 1;
    $('#trainHits').textContent = trainHits;
    const bag = $('#punchBag');
    bag.classList.remove('hit');
    void bag.offsetWidth;
    bag.classList.add('hit');
    beep('play');
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') {
      persist();
      return;
    }
    const slot = currentSlot();
    if (slot) {
      const ticks = applyElapsed(slot, state.settings, speciesById);
      if (ticks) {
        persist();
        renderGame();
        loadMainSprite();
      }
    }
  });
}

async function init() {
  const response = await fetch('data/species.json');
  if (!response.ok) throw new Error('Pokédex-Daten konnten nicht geladen werden.');
  data = await response.json();
  speciesById = speciesMapFromData(data);
  mainSprite = new SpritePlayer($('#petCanvas'), { motion: state.settings.motion });
  detailSprite = new SpritePlayer($('#dexDetailCanvas'), { motion: state.settings.motion });
  applyMotionSetting();
  bindEvents();
  await renderSlots();
  renderStarters();
  showScreen('slots');

  appTimer = setInterval(() => {
    const slot = currentSlot();
    if (!slot || !screens.game.classList.contains('active')) return;
    const ticks = applyElapsed(slot, state.settings, speciesById, Date.now(), false);
    if (ticks > 0) {
      persist();
      const wasEgg = $('#eggView').classList.contains('hidden') === false;
      renderGame();
      if (wasEgg && !isEgg(slot)) {
        loadMainSprite(ACTION.HOP);
        beep('hatch');
        showToast(`${getSpeciesName(slot, speciesById)} ist geschlüpft!`);
      }
    }
  }, 1000);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(console.warn));
  }
}

init().catch((error) => {
  console.error(error);
  document.body.innerHTML = `<main class="app-shell"><article class="welcome-panel"><div><h2>Startfehler</h2><p>${error.message}</p></div></article></main>`;
});
