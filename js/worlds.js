const WORLD_BASE = 'assets/worlds';

export const WORLD_FOLDERS = [
  'normal', 'grass', 'fire', 'water', 'electric', 'ice', 'bug', 'poison', 'ground',
  'rock', 'flying', 'psychic', 'ghost', 'dark', 'dragon', 'fairy', 'fighting', 'steel'
];

const TYPE_TO_FOLDER = {
  normal: 'normal',
  planta: 'grass', grass: 'grass',
  fuego: 'fire', fire: 'fire',
  agua: 'water', water: 'water',
  electrico: 'electric', electric: 'electric',
  hielo: 'ice', ice: 'ice',
  bicho: 'bug', bug: 'bug',
  veneno: 'poison', poison: 'poison',
  tierra: 'ground', ground: 'ground',
  roca: 'rock', rock: 'rock',
  volador: 'flying', flying: 'flying',
  psiquico: 'psychic', psychic: 'psychic',
  fantasma: 'ghost', ghost: 'ghost',
  siniestro: 'dark', dark: 'dark',
  dragon: 'dragon',
  hada: 'fairy', fairy: 'fairy',
  lucha: 'fighting', fighting: 'fighting',
  acero: 'steel', steel: 'steel'
};

const FALLBACK = {
  id: 'normal', folder: 'normal', key: 'meadow', label: 'Grüne Wiesen', icon: 'star',
  version: '1.0.0', accent: '#e4b85c', accent2: '#8acb73', panel: '#39412c', panel2: '#607344',
  layers: {
    day: { background: `${WORLD_BASE}/normal/day/background.png`, midground: `${WORLD_BASE}/normal/day/midground.png`, foreground: `${WORLD_BASE}/normal/day/foreground.png`, overlay: `${WORLD_BASE}/normal/day/overlay.png` },
    night: { background: `${WORLD_BASE}/normal/night/background.png`, midground: `${WORLD_BASE}/normal/night/midground.png`, foreground: `${WORLD_BASE}/normal/night/foreground.png`, overlay: `${WORLD_BASE}/normal/night/overlay.png` }
  },
  layout: { objectPosition: '50% 50%' },
  berries: [
    { name: 'Wiesenbeere', description: 'Mild, süß und vertraut', className: 'berry-green' },
    { name: 'Apfelbeere', description: 'Knackig und saftig', className: 'berry-red' },
    { name: 'Honigbeere', description: 'Goldgelb und süß', className: 'berry-sun' }
  ],
  candy: { name: 'Herzkeks', description: 'Ein kleines Leckerli', className: 'candy-honey' },
  mini: { title: 'Wiesenlauf', hint: 'Sammle Früchte und weiche Steinen aus.', collectible: 'berry', hazard: 'rock', resultWord: 'Früchte' },
  training: { title: 'Park-Training', hint: 'Triff den Trainingspfosten im richtigen Rhythmus.', target: 'bag' }
};

const registry = new Map([['normal', FALLBACK]]);
let initialized = false;

function assetUrl(folder, relativePath, version) {
  if (!relativePath) return '';
  const clean = String(relativePath).replace(/^\.\//, '');
  const query = version ? `?world=${encodeURIComponent(version)}` : '';
  return `${WORLD_BASE}/${folder}/${clean}${query}`;
}

function normalizeManifest(manifest, folder) {
  const colors = manifest.colors || {};
  const version = manifest.version || '1.0.0';
  const makeLayers = (phase) => {
    const source = manifest[phase] || {};
    return {
      background: assetUrl(folder, source.background || `${phase}/background.png`, version),
      midground: assetUrl(folder, source.midground || `${phase}/midground.png`, version),
      foreground: assetUrl(folder, source.foreground || `${phase}/foreground.png`, version),
      overlay: assetUrl(folder, source.overlay || `${phase}/overlay.png`, version)
    };
  };
  return {
    ...manifest,
    folder,
    key: manifest.sceneKey || folder,
    label: manifest.displayName || manifest.name || folder,
    version,
    accent: colors.accent || '#ffd04a',
    accent2: colors.accent2 || '#66ccff',
    panel: colors.panel || '#1c2743',
    panel2: colors.panel2 || '#253253',
    layout: manifest.layout || { objectPosition: '50% 50%' },
    layers: { day: makeLayers('day'), night: makeLayers('night') },
    berries: Array.isArray(manifest.berries) && manifest.berries.length >= 3 ? manifest.berries : FALLBACK.berries,
    candy: manifest.candy || FALLBACK.candy,
    mini: manifest.mini || FALLBACK.mini,
    training: manifest.training || FALLBACK.training
  };
}

export async function initWorldEngine() {
  if (initialized) return registry;
  const results = await Promise.allSettled(WORLD_FOLDERS.map(async (folder) => {
    const response = await fetch(`${WORLD_BASE}/${folder}/world.json`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${folder}: ${response.status}`);
    const manifest = await response.json();
    registry.set(folder, normalizeManifest(manifest, folder));
  }));
  results.forEach((result, index) => {
    if (result.status === 'rejected') console.warn(`Weltpaket ${WORLD_FOLDERS[index]} konnte nicht geladen werden.`, result.reason);
  });
  initialized = true;
  return registry;
}

export function worldFolderForType(type) {
  return TYPE_TO_FOLDER[type] || 'normal';
}

export function themeForSpecies(species) {
  const folder = worldFolderForType(species?.type);
  return registry.get(folder) || registry.get('normal') || FALLBACK;
}

function setLayerImage(image, src) {
  if (!image || !src || image.dataset.worldSrc === src) return;
  image.classList.add('world-layer-loading');
  const done = () => image.classList.remove('world-layer-loading');
  image.addEventListener('load', done, { once: true });
  image.addEventListener('error', done, { once: true });
  image.dataset.worldSrc = src;
  image.src = src;
}

export function applyWorldLayers(habitat, theme, phase) {
  if (!habitat || !theme) return;
  const layers = theme.layers?.[phase] || theme.layers?.day || FALLBACK.layers.day;
  habitat.dataset.worldFolder = theme.folder || 'normal';
  habitat.style.setProperty('--world-object-position', theme.layout?.objectPosition || '50% 50%');
  setLayerImage(habitat.querySelector('[data-world-layer="background"]'), layers.background);
  setLayerImage(habitat.querySelector('[data-world-layer="midground"]'), layers.midground);
  setLayerImage(habitat.querySelector('[data-world-layer="foreground"]'), layers.foreground);
  setLayerImage(habitat.querySelector('[data-world-layer="overlay"]'), layers.overlay);
}

export function resolveWorldPhase(settings, date = new Date()) {
  const forced = settings?.worldTime;
  if (forced === 'day' || forced === 'night') return forced;
  const hour = date.getHours();
  return hour < 7 || hour >= 20 ? 'night' : 'day';
}
