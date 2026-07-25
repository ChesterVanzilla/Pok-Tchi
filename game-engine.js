const ACTION = Object.freeze({
  IDLE: 0,
  WALK_LEFT: 1,
  WALK_RIGHT: 2,
  SLEEP: 3,
  EAT: 4,
  HURT: 5,
  ATTACK: 6,
  POSE: 7,
  HOP: 8,
  NOD: 9,
  DEEP_BREATH: 10,
  SIT: 11
});

function rgb565ToRgba(value) {
  const r = ((value >> 11) & 0x1f) * 255 / 31;
  const g = ((value >> 5) & 0x3f) * 255 / 63;
  const b = (value & 0x1f) * 255 / 31;
  return [Math.round(r), Math.round(g), Math.round(b), 255];
}

function readMagic(view, offset) {
  return String.fromCharCode(view.getUint8(offset), view.getUint8(offset + 1), view.getUint8(offset + 2), view.getUint8(offset + 3));
}

export function parseTpk2(buffer) {
  const view = new DataView(buffer);
  if (view.byteLength < 7 || readMagic(view, 0) !== 'TPK2') {
    throw new Error('Ungültige TPK2-Sprite-Datei');
  }

  let offset = 4;
  const actionCount = view.getUint8(offset++);
  const paletteCount = view.getUint16(offset, true);
  offset += 2;

  const palette = [];
  for (let index = 0; index < paletteCount; index += 1) {
    palette.push(rgb565ToRgba(view.getUint16(offset, true)));
    offset += 2;
  }

  const actions = new Map();
  for (let actionIndex = 0; actionIndex < actionCount; actionIndex += 1) {
    const id = view.getUint8(offset++);
    const width = view.getUint8(offset++);
    const height = view.getUint8(offset++);
    const frameCount = view.getUint8(offset++);
    const durations = [];
    for (let frame = 0; frame < frameCount; frame += 1) {
      durations.push(view.getUint16(offset, true));
      offset += 2;
    }
    const frameSize = width * height;
    const frames = [];
    for (let frame = 0; frame < frameCount; frame += 1) {
      frames.push(new Uint8Array(buffer, offset, frameSize));
      offset += frameSize;
    }
    actions.set(id, { id, width, height, frameCount, durations, frames });
  }

  return { palette, actions };
}

export class SpritePlayer {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d', { alpha: true });
    this.context.imageSmoothingEnabled = false;
    this.motion = options.motion !== false;
    this.sprite = null;
    this.url = '';
    this.actionId = ACTION.IDLE;
    this.frameIndex = 0;
    this.frameStartedAt = performance.now();
    this.oneShot = false;
    this.running = true;
    this.frameCache = new Map();
    this.raf = requestAnimationFrame((time) => this.loop(time));
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();
  }

  async load(url) {
    this.url = url;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Sprite konnte nicht geladen werden (${response.status})`);
    this.sprite = parseTpk2(await response.arrayBuffer());
    this.frameCache.clear();
    this.setAction(ACTION.IDLE);
    this.draw();
  }

  setMotion(enabled) {
    this.motion = Boolean(enabled);
  }

  setAction(actionId, options = {}) {
    if (!this.sprite) return;
    const selected = this.sprite.actions.has(actionId) ? actionId : ACTION.IDLE;
    this.actionId = selected;
    this.frameIndex = 0;
    this.frameStartedAt = performance.now();
    this.oneShot = Boolean(options.oneShot);
    this.draw();
  }

  play(actionId) {
    this.setAction(actionId, { oneShot: true });
  }

  hasAction(actionId) {
    return Boolean(this.sprite?.actions.has(actionId));
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 3);
    const width = Math.max(1, Math.round(rect.width * ratio));
    const height = Math.max(1, Math.round(rect.height * ratio));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.context.imageSmoothingEnabled = false;
      this.draw();
    }
  }

  getFrameCanvas(action, frameIndex) {
    const key = `${action.id}:${frameIndex}`;
    if (this.frameCache.has(key)) return this.frameCache.get(key);

    const offscreen = document.createElement('canvas');
    offscreen.width = action.width;
    offscreen.height = action.height;
    const offCtx = offscreen.getContext('2d');
    const image = offCtx.createImageData(action.width, action.height);
    const source = action.frames[frameIndex];

    for (let pixel = 0; pixel < source.length; pixel += 1) {
      const paletteIndex = source[pixel];
      const target = pixel * 4;
      if (paletteIndex === 0xff) {
        image.data[target + 3] = 0;
      } else {
        const color = this.sprite.palette[paletteIndex] || [255, 0, 255, 255];
        image.data[target] = color[0];
        image.data[target + 1] = color[1];
        image.data[target + 2] = color[2];
        image.data[target + 3] = color[3];
      }
    }

    offCtx.putImageData(image, 0, 0);
    this.frameCache.set(key, offscreen);
    return offscreen;
  }

  draw() {
    const ctx = this.context;
    const canvas = this.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!this.sprite) return;

    const action = this.sprite.actions.get(this.actionId) || this.sprite.actions.get(ACTION.IDLE);
    if (!action) return;
    const frame = this.getFrameCanvas(action, this.frameIndex % action.frameCount);

    const maxWidth = canvas.width * 0.72;
    const maxHeight = canvas.height * 0.72;
    const scale = Math.max(1, Math.floor(Math.min(maxWidth / action.width, maxHeight / action.height)));
    const drawWidth = action.width * scale;
    const drawHeight = action.height * scale;
    const x = Math.round((canvas.width - drawWidth) / 2);
    const y = Math.round(canvas.height - drawHeight - canvas.height * 0.075);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(frame, x, y, drawWidth, drawHeight);
  }

  loop(now) {
    if (!this.running) return;
    if (this.sprite && this.motion) {
      const action = this.sprite.actions.get(this.actionId) || this.sprite.actions.get(ACTION.IDLE);
      if (action && action.frameCount > 0) {
        const duration = action.durations[this.frameIndex] || 120;
        if (now - this.frameStartedAt >= duration) {
          this.frameStartedAt = now;
          this.frameIndex += 1;
          if (this.frameIndex >= action.frameCount) {
            if (this.oneShot) {
              this.actionId = ACTION.IDLE;
              this.oneShot = false;
            }
            this.frameIndex = 0;
          }
          this.draw();
        }
      }
    }
    this.raf = requestAnimationFrame((time) => this.loop(time));
  }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    this.frameCache.clear();
  }
}

export { ACTION };
