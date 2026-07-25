import { loadState, saveState, clearState, defaultState } from './storage.js';
import { SpritePlayer, ACTION } from './sprite-engine.js';
import { themeForSpecies, resolveWorldPhase } from './worlds.js';
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
  ENDING,
  FAREWELL_AGE_MINUTES,
  wantEvolvePrompt,
  declineEvolution,
  evolve,
  wantFarewellPrompt,
  declineFarewell,
  canRunaway,
  neglectProgress,
  startCeremony,
  finishCeremony,
  finishExpiredCeremony,
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
let ceremonySprite;
let miniPetSprite;
let trainPetSprite;
let starterPlayers = [];
let slotPlayers = [];
let toastTimer;
let appTimer;
let bathTimer;
let ceremonyTimer;
let trainTimer;
let miniRaf;
let miniStartedAt = 0;
let miniScore = 0;
let miniMisses = 0;
let miniBall = { x: 0.5, y: -0.08, vy: 0.34, lastAt: 0, kind: 'collectible' };
let activeTheme = null;
let activePhase = 'day';
let miniPetX = 0.5;
let trainHits = 0;
let trainCombo = 0;
let trainLastHitAt = 0;
let actionLocked = false;

const screens = {
  slots: $('#slotScreen'),
  starter: $('#starterScreen'),
  game: $('#gameScreen'),
  dex: $('#dexScreen')
};

function currentSlot() {
  return Number.isInteger(currentSlotIndex) ? state.slots[currentSlotIndex] : null;
}

function themeSpecies(slot = currentSlot()) {
  if (!slot) return null;
  const id = isEgg(slot) ? slot.pet.eggTarget : slot.pet.speciesId;
  return speciesById?.get(id) || null;
}

function getActiveTheme(slot = currentSlot()) {
  return themeForSpecies(themeSpecies(slot));
}

function applyWorldTheme(slot = currentSlot()) {
  const theme = getActiveTheme(slot);
  const phase = resolveWorldPhase(state.settings);
  activeTheme = theme;
  activePhase = phase;

  const habitat = $('#habitat');
  if (habitat) habitat.className = `habitat theme-${theme.key} ${phase}`;
  $('#worldName').textContent = theme.label;
  $('#worldPhase').textContent = phase === 'night' ? 'NACHT' : 'TAG';
  const symbol = $('#worldIcon');
  symbol.className = `world-symbol symbol-${theme.icon}`;

  const app = $('#app');
  const rootStyle = document.documentElement.style;
  [app.style, rootStyle].forEach((style) => {
    style.setProperty('--accent', theme.accent);
    style.setProperty('--accent-2', theme.accent2);
    style.setProperty('--theme-panel', theme.panel);
    style.setProperty('--theme-panel-2', theme.panel2);
  });
  document.documentElement.dataset.world = theme.key;
  document.documentElement.dataset.phase = phase;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', phase === 'night' ? theme.panel : theme.panel2);
  return theme;
}

function renderFoodTheme(theme = getActiveTheme()) {
  $$('[data-berry]').forEach((button, index) => {
    const berry = theme.berries[index];
    if (!berry) return;
    button.querySelector('.food-icon').className = `food-icon ${berry.className}`;
    button.querySelector('strong').textContent = berry.name;
    button.querySelector('small').textContent = berry.description;
  });
  const candy = $('#candyBtn');
  candy.querySelector('.food-icon').className = `food-icon ${theme.candy.className}`;
  candy.querySelector('strong').textContent = theme.candy.name;
  candy.querySelector('small').textContent = theme.candy.description;
}

function prepareWorldActivities(theme = getActiveTheme()) {
  $('#miniGameTitle').textContent = theme.mini.title;
  $('#miniStartHint').textContent = theme.mini.hint;
  $('#miniArena').className = `mini-arena themed-mini mini-${theme.key} ${activePhase}`;
  $('#trainGameTitle').textContent = theme.training.title;
  $('#trainStartHint').textContent = theme.training.hint;
  $('#punchBag').className = `target-${theme.training.target}`;
  $('.bag-arena').className = `bag-arena training-${theme.key} ${activePhase}`;
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
  if (!state.settings.sound || !(window.AudioContext || window.webkitAudioContext)) return;
  const patterns = {
    ok: [[560,0,.12]], hatch: [[520,0,.10],[690,.11,.12],[860,.24,.20]],
    evolve: [[420,0,.12],[540,.14,.12],[680,.28,.12],[860,.43,.30]],
    food: [[440,0,.10],[520,.11,.10]], play: [[650,0,.07]],
    clean: [[520,0,.09],[660,.10,.09],[780,.21,.14]],
    sleep: [[430,0,.12],[350,.14,.18]], bye: [[620,0,.16],[520,.18,.16],[410,.36,.28]],
    runaway: [[310,0,.18],[255,.22,.24],[205,.50,.30]], error: [[220,0,.18]]
  };
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const context = new AudioCtx();
    (patterns[kind] || patterns.ok).forEach(([frequency, delay, duration], index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = kind === 'error' || kind === 'runaway' ? 'square' : index % 2 ? 'triangle' : 'sine';
      oscillator.frequency.setValueAtTime(frequency, context.currentTime + delay);
      gain.gain.setValueAtTime(.055, context.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + delay + duration);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(context.currentTime + delay);
      oscillator.stop(context.currentTime + delay + duration + .01);
    });
    setTimeout(() => context.close().catch(() => {}), 1200);
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
    if (slot) {
      finishExpiredCeremony(slot, speciesById);
      applyElapsed(slot, state.settings, speciesById);
    }
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
  const finished = finishExpiredCeremony(slot, speciesById);
  applyElapsed(slot, state.settings, speciesById);
  persist();
  showScreen('game');
  renderGame();
  await loadMainSprite();
  if (finished.changed) showToast('Nach dem Abschied ist ein neues Ei erschienen.');
  if (slot.pet.ceremony) resumeCeremonyScene();
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

  const theme = applyWorldTheme(slot);
  renderFoodTheme(theme);
  prepareWorldActivities(theme);

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
  const evolveReady = wantEvolvePrompt(slot, speciesById);
  const farewellReady = wantFarewellPrompt(slot, speciesById);
  const runawayReady = canRunaway(slot);
  $('#evolveBanner').hidden = !evolveReady || runawayReady;
  $('#farewellBanner').hidden = !farewellReady || runawayReady;
  $('#runawayBanner').hidden = !runawayReady;
  if (!isEgg(slot)) {
    $('#farewellBannerTitle').textContent = `${getDisplayName(slot, speciesById)} möchte dir etwas sagen`;
    $('#runawayBannerTitle').textContent = `${getDisplayName(slot, speciesById)} fühlt sich verlassen`;
  }
  document.body.classList.toggle('action-locked', actionLocked || Boolean(pet.ceremony));
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


function delay(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

function createBathBubbles() {
  const root = $('.bath-bubbles'); root.innerHTML = '';
  for (let index = 0; index < 18; index += 1) {
    const bubble = document.createElement('i');
    bubble.style.setProperty('--x', `${8 + Math.random() * 84}%`);
    bubble.style.setProperty('--y', `${38 + Math.random() * 52}%`);
    bubble.style.setProperty('--size', `${12 + Math.random() * 26}px`);
    bubble.style.setProperty('--delay', `${Math.random() * .8}s`);
    root.appendChild(bubble);
  }
}

async function startBathScene() {
  const slot = currentSlot();
  if (!slot || isEgg(slot) || slot.pet.sleeping || slot.pet.ceremony || actionLocked) {
    processResult({ changed:false, message:slot?.pet?.sleeping ? 'Es schläft gerade.' : 'Ein Bad ist gerade nicht möglich.' }); return;
  }
  actionLocked = true; renderGame(); createBathBubbles();
  const overlay = $('#bathOverlay'); overlay.hidden = false;
  mainSprite.setAction(mainSprite.hasAction(ACTION.SIT) ? ACTION.SIT : ACTION.DEEP_BREATH);
  beep('clean'); clearTimeout(bathTimer); bathTimer = setTimeout(() => {}, 0);
  await delay(3000);
  const result = clean(slot, speciesById); overlay.hidden = true; actionLocked = false;
  processResult(result, 'clean');
  if (result.changed) mainSprite.play(mainSprite.hasAction(ACTION.POSE) ? ACTION.POSE : ACTION.HOP);
}

function openEvolutionChoice() {
  const slot=currentSlot(); if(!slot || !wantEvolvePrompt(slot,speciesById)) return;
  const species=getSpecies(slot,speciesById);
  const nextName=slot.pet.speciesId===133?'Aquana, Blitza oder Flamara':speciesById.get(species.evolvesTo)?.nameDe||'die nächste Form';
  $('#evolutionChoiceTitle').textContent=`${getDisplayName(slot,speciesById)} entwickeln?`;
  $('#evolutionChoiceText').textContent=`Die Bedingungen sind erfüllt. Die nächste Form ist ${nextName}.`;
  openDialog($('#evolutionChoiceDialog'));
}

async function runEvolutionScene() {
  const slot=currentSlot(); if(!slot || actionLocked) return;
  closeDialog($('#evolutionChoiceDialog')); actionLocked=true;
  const overlay=$('#evolutionOverlay'); overlay.hidden=false; $('#speechBubble').textContent='Was passiert gerade?';
  mainSprite.setAction(ACTION.IDLE); beep('evolve'); renderGame(); await delay(1900);
  const result=evolve(slot,speciesById);
  if(!result.changed){overlay.hidden=true; actionLocked=false; processResult(result); return;}
  persist(); renderGame(); await loadMainSprite(ACTION.POSE); $('#speechBubble').textContent=result.message; await delay(2300);
  overlay.hidden=true; actionLocked=false; renderGame(); mainSprite.play(ACTION.POSE); showToast(result.message);
}

function configureCeremonyScene(type,name){
  const scene=$('#ceremonyScene'); scene.className=`ceremony-scene ${type===ENDING.RUNAWAY?'runaway':type===ENDING.FAREWELL?'farewell':'release'}`;
  if(type===ENDING.RUNAWAY){$('#ceremonyKicker').textContent='ZU SPÄT';$('#ceremonyTitle').textContent=`${name} läuft davon …`;$('#ceremonyText').textContent='Es fühlte sich zu lange allein. Beim nächsten Pokémon beginnt ein neuer Versuch.';}
  else if(type===ENDING.FAREWELL){$('#ceremonyKicker').textContent='DANKE FÜR ALLES';$('#ceremonyTitle').textContent=`${name} verabschiedet sich`;$('#ceremonyText').textContent='Eure gute gemeinsame Zeit erhöht die Chance auf ein seltenes oder schillerndes Ei.';}
  else{$('#ceremonyKicker').textContent='AUF WIEDERSEHEN';$('#ceremonyTitle').textContent=`${name} zieht weiter`;$('#ceremonyText').textContent='Du hast dich freiwillig für ein neues Ei entschieden.';}
}

async function resumeCeremonyScene(){
  const slot=currentSlot(); const ceremony=slot?.pet?.ceremony; if(!ceremony) return;
  actionLocked=true; configureCeremonyScene(ceremony.type,ceremony.displayName); openDialog($('#ceremonyDialog'));
  const species=speciesById.get(ceremony.speciesId);
  if(species){try{await ceremonySprite.load(ceremony.shiny?species.shinySprite:species.sprite);ceremonySprite.setMotion(state.settings.motion);ceremonySprite.setAction(ceremony.type===ENDING.RUNAWAY?ACTION.HURT:ACTION.POSE);}catch(error){console.error(error);}}
  beep(ceremony.type===ENDING.RUNAWAY?'runaway':'bye'); clearInterval(ceremonyTimer);
  ceremonyTimer=setInterval(async()=>{
    const activeSlot=currentSlot(); const active=activeSlot?.pet?.ceremony; if(!active) return;
    const total=Math.max(1,active.endsAt-active.startedAt); const progress=Math.max(0,Math.min(1,(Date.now()-active.startedAt)/total));
    $('#ceremonyProgressBar').style.width=`${progress*100}%`;
    if(progress>=1){clearInterval(ceremonyTimer);ceremonyTimer=null;finishCeremony(activeSlot,speciesById);persist();closeDialog($('#ceremonyDialog'));actionLocked=false;renderGame();await loadMainSprite();showToast('Ein neues Ei ist erschienen.');}
  },80);
}

async function beginCeremony(type){const slot=currentSlot();if(!slot||actionLocked)return;const result=startCeremony(slot,type,speciesById);if(!result.changed)return processResult(result);persist();renderGame();await resumeCeremonyScene();}

function openFarewellChoice(){const slot=currentSlot();if(!slot||!wantFarewellPrompt(slot,speciesById))return;const name=getDisplayName(slot,speciesById);$('#farewellChoiceTitle').textContent=`Mit ${name} Abschied nehmen?`;$('#farewellChoiceText').textContent='Der Lebenszyklus ist erfüllt. Ein dankbarer Abschied verbessert die Chancen des nächsten Eis. Ihr könnt aber auch zusammenbleiben.';openDialog($('#farewellChoiceDialog'));}

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

  const life = $('#lifeProgress');
  life.innerHTML = '';
  const level = levelOf(slot);
  const evolutionNeeded = species.evolvesTo ? species.evolveLevel + pet.careMistakes : null;
  const lifeItems = species.evolvesTo ? [
    ['Nächste Entwicklung', level >= evolutionNeeded ? 'Bereit, wenn alle Werte mindestens 40 sind' : `Noch ${evolutionNeeded - level} Level`],
    ['Pflegefehler', `${pet.careMistakes} · jeder Fehler verzögert um 1 Level`],
    ['Abbruchstatus', pet.evoDeclinedLv >= level ? 'Bis zum nächsten Level verschoben' : 'Nicht verschoben']
  ] : [
    ['Endform', 'Erreicht'],
    ['Lebenszyklus', `${Math.min(100, Math.floor(pet.ageMinutes / FAREWELL_AGE_MINUTES * 100))}% bis zur möglichen Verabschiedung`],
    ['Gemeinsame Zeit', pet.ageMinutes >= FAREWELL_AGE_MINUTES ? 'Abschied möglich – oder ihr bleibt zusammen' : `${FAREWELL_AGE_MINUTES - pet.ageMinutes} Spielminuten verbleiben`]
  ];
  lifeItems.push(['Vernachlässigung', `${neglectProgress(slot)}% · jede Pflege setzt die Gefahr zurück`]);
  lifeItems.forEach(([label, value]) => life.appendChild(metricNode(label, value)));

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
  $('#worldTimeSelect').value = state.settings.worldTime || 'auto';
  openDialog($('#settingsDialog'));
}

function applyMotionSetting() {
  document.documentElement.classList.toggle('no-motion', !state.settings.motion);
  mainSprite?.setMotion(state.settings.motion);
  detailSprite?.setMotion(state.settings.motion);
  ceremonySprite?.setMotion(state.settings.motion);
  miniPetSprite?.setMotion(state.settings.motion);
  trainPetSprite?.setMotion(state.settings.motion);
  starterPlayers.forEach((player) => player.setMotion(state.settings.motion));
  slotPlayers.forEach((player) => player.setMotion(state.settings.motion));
}

function resetMiniBall(speedBoost = 0) {
  const theme = getActiveTheme();
  miniBall.x = 0.12 + Math.random() * 0.76;
  miniBall.y = -0.08;
  miniBall.vy = 0.34 + speedBoost;
  miniBall.kind = Math.random() < Math.min(.32, .12 + miniScore * .015) ? 'hazard' : 'collectible';
  const itemName = miniBall.kind === 'hazard' ? theme.mini.hazard : theme.mini.collectible;
  const item = $('#miniBall');
  item.className = `mini-ball mini-item ${miniBall.kind} item-${itemName}`;
  item.setAttribute('aria-label', miniBall.kind === 'hazard' ? 'Hindernis' : 'Sammelobjekt');
}
function placeMiniElements(){const ball=$('#miniBall');const pet=$('#miniPet');ball.style.left=`${miniBall.x*100}%`;ball.style.top=`${miniBall.y*100}%`;pet.style.left=`${miniPetX*100}%`;}
function moveMiniPet(clientX){const arena=$('#miniArena');const rect=arena.getBoundingClientRect();const next=Math.max(.10,Math.min(.90,(clientX-rect.left)/Math.max(1,rect.width)));if(miniPetSprite){const action=next<miniPetX?ACTION.WALK_LEFT:ACTION.WALK_RIGHT;if(Math.abs(next-miniPetX)>.015)miniPetSprite.setAction(action);}miniPetX=next;$('#miniPet').style.left=`${miniPetX*100}%`;}
function miniGameStep(now){
  if(!miniStartedAt)return;
  const elapsed=(now-miniStartedAt)/1000;
  const remaining=Math.max(0,20-elapsed);
  $('#miniTime').textContent=Math.ceil(remaining);
  const previous=miniBall.lastAt||now;
  const dt=Math.min(.04,(now-previous)/1000);
  miniBall.lastAt=now;
  miniBall.y+=miniBall.vy*dt;
  miniBall.vy+=.16*dt;
  if(miniBall.y>=.74){
    const caught=Math.abs(miniBall.x-miniPetX)<=.16;
    if(miniBall.kind==='collectible'){
      if(caught){miniScore+=1;$('#miniScore').textContent=miniScore;miniPetSprite?.play(ACTION.HOP);beep('play');}
      else{miniMisses+=1;$('#miniMisses').textContent=`${miniMisses}/3`;miniPetSprite?.play(ACTION.HURT);beep('error');}
    }else if(caught){
      miniMisses+=1;$('#miniMisses').textContent=`${miniMisses}/3`;miniPetSprite?.play(ACTION.HURT);beep('error');
    }else{
      miniPetSprite?.play(ACTION.POSE);
    }
    resetMiniBall(Math.min(.22,miniScore*.012));
  }
  placeMiniElements();
  if(remaining<=0||miniMisses>=3){finishMiniGame();return;}
  miniRaf=requestAnimationFrame(miniGameStep);
}
async function prepareMiniGame(){const slot=currentSlot();if(!slot||isEgg(slot))return;const species=getSpecies(slot,speciesById);prepareWorldActivities(getActiveTheme(slot));try{await miniPetSprite.load(slot.pet.shiny?species.shinySprite:species.sprite);miniPetSprite.setMotion(state.settings.motion);miniPetSprite.setAction(ACTION.IDLE);}catch(error){console.error(error);}}
function startMiniGame(){cancelAnimationFrame(miniRaf);miniScore=0;miniMisses=0;miniPetX=.5;miniStartedAt=performance.now();miniBall.lastAt=miniStartedAt;resetMiniBall();$('#miniScore').textContent='0';$('#miniMisses').textContent='0/3';$('#miniTime').textContent='20';$('#miniStartHint').hidden=true;$('#miniBall').hidden=false;$('#startMiniBtn').disabled=true;placeMiniElements();miniRaf=requestAnimationFrame(miniGameStep);}
function finishMiniGame(){if(!miniStartedAt)return;cancelAnimationFrame(miniRaf);miniRaf=null;miniStartedAt=0;$('#miniBall').hidden=true;$('#startMiniBtn').disabled=false;$('#startMiniBtn').textContent='Noch einmal';const theme=getActiveTheme();const hint=$('#miniStartHint');hint.hidden=false;hint.textContent=`${miniScore} ${theme.mini.resultWord} · ${miniMisses} Fehler · Rekord ${Math.max(currentSlot().gameHi,miniScore)}`;processResult(playResult(currentSlot(),miniScore,speciesById),'play');}
function cancelMiniGame(){cancelAnimationFrame(miniRaf);miniRaf=null;miniStartedAt=0;$('#miniBall').hidden=true;$('#startMiniBtn').disabled=false;miniPetSprite?.setAction(ACTION.IDLE);closeDialog($('#miniGameDialog'));}

async function prepareTraining(){const slot=currentSlot();if(!slot||isEgg(slot))return;const species=getSpecies(slot,speciesById);prepareWorldActivities(getActiveTheme(slot));try{await trainPetSprite.load(slot.pet.shiny?species.shinySprite:species.sprite);trainPetSprite.setMotion(state.settings.motion);trainPetSprite.setAction(ACTION.IDLE);}catch(error){console.error(error);}}
function startTraining(){clearInterval(trainTimer);trainHits=0;trainCombo=0;trainLastHitAt=0;let remaining=10;$('#trainHits').textContent=trainHits;$('#trainCombo').textContent=trainCombo;$('#trainTime').textContent=remaining;$('#trainStartHint').hidden=true;$('#punchBag').style.display='block';$('#startTrainBtn').disabled=true;trainPetSprite?.setAction(ACTION.IDLE);const end=Date.now()+10000;trainTimer=setInterval(()=>{remaining=Math.max(0,Math.ceil((end-Date.now())/1000));$('#trainTime').textContent=remaining;if(remaining<=0)finishTraining();},100);}
function registerTrainingHit(){if(!trainTimer)return;const now=performance.now();trainCombo=now-trainLastHitAt<=650?trainCombo+1:1;trainLastHitAt=now;trainHits+=1;$('#trainHits').textContent=trainHits;$('#trainCombo').textContent=trainCombo;const bag=$('#punchBag');bag.classList.remove('hit');void bag.offsetWidth;bag.classList.add('hit');trainPetSprite?.play(ACTION.ATTACK);beep('play');}
function finishTraining(){clearInterval(trainTimer);trainTimer=null;$('#punchBag').style.display='none';$('#startTrainBtn').disabled=false;$('#startTrainBtn').textContent='Noch einmal';trainPetSprite?.setAction(ACTION.POSE);const result=trainStrength(currentSlot(),trainHits,speciesById);$('#trainStartHint').hidden=false;$('#trainStartHint').textContent=`${trainHits} Treffer · beste Kombo ${trainCombo} · Kraft +${result.gain||0}`;processResult(result,'play');}
function cancelTraining(){clearInterval(trainTimer);trainTimer=null;$('#punchBag').style.display='none';$('#startTrainBtn').disabled=false;trainPetSprite?.setAction(ACTION.IDLE);closeDialog($('#trainDialog'));}

function bindEvents() {
  $('[data-nav="slots"]').addEventListener('click', async () => { if(actionLocked)return; await renderSlots(); showScreen('slots'); });
  $('[data-nav="game"]').addEventListener('click', () => showScreen('game'));
  $('#backToSlotsBtn').addEventListener('click', async () => { if(actionLocked)return; persist(); await renderSlots(); showScreen('slots'); });
  $('#petTouchArea').addEventListener('click', () => { if(!actionLocked) touchPet(); });
  $('#openSettingsBtn').addEventListener('click', openSettings);
  $('#openDexBtn').addEventListener('click', () => { if(actionLocked)return; renderDex($('#dexSearch').value); showScreen('dex'); });
  $('#dexSearch').addEventListener('input', (event) => renderDex(event.target.value));
  $$('.close-dialog').forEach((button) => button.addEventListener('click', () => closeDialog(button.closest('dialog'))));

  $$('[data-action]').forEach((button) => button.addEventListener('click', async () => {
    const action=button.dataset.action; const slot=currentSlot(); if(!slot||actionLocked||slot.pet.ceremony)return;
    if(action==='food'){
      if(isEgg(slot)||slot.pet.sleeping)return processResult({changed:false,message:slot.pet.sleeping?'Es schläft gerade.':'Erst muss das Ei schlüpfen.'});
      openDialog($('#foodDialog'));
    }else if(action==='play'){
      if(isEgg(slot)||slot.pet.sleeping)return processResult({changed:false,message:slot.pet.sleeping?'Es schläft gerade.':'Erst muss das Ei schlüpfen.'});
      const theme=getActiveTheme(slot);prepareWorldActivities(theme);$('#miniTime').textContent='20';$('#miniScore').textContent='0';$('#miniMisses').textContent='0/3';$('#miniStartHint').hidden=false;$('#miniStartHint').textContent=theme.mini.hint;$('#startMiniBtn').textContent='Start';$('#miniBall').hidden=true;await prepareMiniGame();openDialog($('#miniGameDialog'));
    }else if(action==='train'){
      if(isEgg(slot)||slot.pet.sleeping)return processResult({changed:false,message:slot.pet.sleeping?'Es schläft gerade.':'Erst muss das Ei schlüpfen.'});
      const theme=getActiveTheme(slot);prepareWorldActivities(theme);$('#trainTime').textContent='10';$('#trainHits').textContent='0';$('#trainCombo').textContent='0';$('#trainStartHint').hidden=false;$('#trainStartHint').textContent=theme.training.hint;$('#startTrainBtn').textContent='Start';await prepareTraining();openDialog($('#trainDialog'));
    }else if(action==='clean') await startBathScene();
    else if(action==='sleep'){const result=toggleSleep(slot);processResult(result,'sleep');if(result.changed)mainSprite.setAction(slot.pet.sleeping?ACTION.SLEEP:ACTION.IDLE);}
    else if(action==='info'){if(renderInfo())openDialog($('#infoDialog'));}
  }));

  $$('[data-berry]').forEach((button)=>button.addEventListener('click',()=>{const result=feedBerry(currentSlot(),Number(button.dataset.berry),speciesById);closeDialog($('#foodDialog'));processResult(result,'food');}));
  $('#candyBtn').addEventListener('click',()=>{const result=feedCandy(currentSlot(),speciesById);closeDialog($('#foodDialog'));processResult(result,'food');});

  $('#evolveBanner').addEventListener('click',openEvolutionChoice);
  $('#acceptEvolutionBtn').addEventListener('click',runEvolutionScene);
  $('#declineEvolutionBtn').addEventListener('click',()=>{declineEvolution(currentSlot());persist();closeDialog($('#evolutionChoiceDialog'));renderGame();showToast('Die Entwicklung wird beim nächsten Level erneut angeboten.');});
  $('#farewellBanner').addEventListener('click',openFarewellChoice);
  $('#acceptFarewellBtn').addEventListener('click',async()=>{closeDialog($('#farewellChoiceDialog'));await beginCeremony(ENDING.FAREWELL);});
  $('#declineFarewellBtn').addEventListener('click',()=>{declineFarewell(currentSlot());persist();closeDialog($('#farewellChoiceDialog'));renderGame();showToast('Ihr bleibt zusammen. Die Frage kommt in einem Spieltag wieder.');});
  $('#runawayBanner').addEventListener('click',()=>beginCeremony(ENDING.RUNAWAY));

  $('#saveNicknameBtn').addEventListener('click',()=>{setNickname(currentSlot(),$('#nicknameInput').value);persist();renderGame();renderInfo();showToast('Spitzname gespeichert.');});
  $('#newEggBtn').addEventListener('click',async()=>{const slot=currentSlot();if(!confirm(`${getDisplayName(slot,speciesById)} wirklich freiwillig freilassen? Danach beginnt eine Abschiedsszene und ein neues Ei erscheint.`))return;closeDialog($('#infoDialog'));const result=releaseAndCreateEgg(slot,speciesById);if(!result?.changed)return processResult(result||{changed:false,message:'Freilassen ist gerade nicht möglich.'});persist();renderGame();await resumeCeremonyScene();});

  $('#paceSelect').addEventListener('change',(event)=>{state.slots.forEach((slot)=>{if(slot)applyElapsed(slot,state.settings,speciesById);});state.settings.pace=event.target.value;const now=Date.now();state.slots.forEach((slot)=>{if(slot)slot.lastRealMs=now;});persist();showToast('Spieltempo geändert.');});
  $('#soundToggle').addEventListener('change',(event)=>{state.settings.sound=event.target.checked;persist();beep('ok');});
  $('#motionToggle').addEventListener('change',(event)=>{state.settings.motion=event.target.checked;persist();applyMotionSetting();});
  $('#worldTimeSelect').addEventListener('change',(event)=>{state.settings.worldTime=event.target.value;persist();if(currentSlot()){renderGame();loadMainSprite();}showToast('Weltzeit geändert.');});
  $('#resetAllBtn').addEventListener('click',async()=>{if(!confirm('Wirklich alle drei Spielstände unwiderruflich löschen?'))return;clearState();state=defaultState();currentSlotIndex=null;closeDialog($('#settingsDialog'));applyMotionSetting();await renderSlots();showScreen('slots');showToast('Alle Spielstände wurden gelöscht.');});

  $('#startMiniBtn').addEventListener('click',startMiniGame);$('#cancelMiniBtn').addEventListener('click',cancelMiniGame);
  const miniArena=$('#miniArena');
  miniArena.addEventListener('pointerdown',(event)=>{if(!miniStartedAt)return;miniArena.setPointerCapture?.(event.pointerId);moveMiniPet(event.clientX);});
  miniArena.addEventListener('pointermove',(event)=>{if(!miniStartedAt||event.buttons===0)return;moveMiniPet(event.clientX);});
  $('#startTrainBtn').addEventListener('click',startTraining);$('#cancelTrainBtn').addEventListener('click',cancelTraining);$('#punchBag').addEventListener('click',registerTrainingHit);

  document.addEventListener('visibilitychange',async()=>{
    if(document.visibilityState!=='visible'){persist();return;}
    const slot=currentSlot();if(!slot)return;
    const finished=finishExpiredCeremony(slot,speciesById);
    if(finished.changed){clearInterval(ceremonyTimer);ceremonyTimer=null;closeDialog($('#ceremonyDialog'));actionLocked=false;persist();renderGame();await loadMainSprite();showToast('Ein neues Ei ist erschienen.');return;}
    if(slot.pet.ceremony){resumeCeremonyScene();return;}
    const ticks=applyElapsed(slot,state.settings,speciesById);if(ticks){persist();renderGame();loadMainSprite();}
  });
}

async function init() {
  const response = await fetch('data/species.json');
  if (!response.ok) throw new Error('Pokédex-Daten konnten nicht geladen werden.');
  data = await response.json();
  speciesById = speciesMapFromData(data);
  mainSprite = new SpritePlayer($('#petCanvas'), { motion: state.settings.motion });
  detailSprite = new SpritePlayer($('#dexDetailCanvas'), { motion: state.settings.motion });
  ceremonySprite = new SpritePlayer($('#ceremonyCanvas'), { motion: state.settings.motion });
  miniPetSprite = new SpritePlayer($('#miniPetCanvas'), { motion: state.settings.motion });
  trainPetSprite = new SpritePlayer($('#trainPetCanvas'), { motion: state.settings.motion });
  applyMotionSetting();
  bindEvents();
  await renderSlots();
  renderStarters();
  showScreen('slots');

  appTimer = setInterval(async () => {
    const slot = currentSlot();
    if (!slot || !screens.game.classList.contains('active')) return;
    if (slot.pet.ceremony) {
      const finished = finishExpiredCeremony(slot, speciesById);
      if (finished.changed) {
        clearInterval(ceremonyTimer); ceremonyTimer = null; closeDialog($('#ceremonyDialog'));
        actionLocked = false; persist(); renderGame(); await loadMainSprite(); showToast('Ein neues Ei ist erschienen.');
      }
      return;
    }
    const ticks = applyElapsed(slot, state.settings, speciesById, Date.now(), false);
    if (ticks > 0) {
      persist();
      const wasEgg = $('#eggView').classList.contains('hidden') === false;
      renderGame();
      if (wasEgg && !isEgg(slot)) {
        loadMainSprite(ACTION.HOP); beep('hatch'); showToast(`${getSpeciesName(slot, speciesById)} ist geschlüpft!`);
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
