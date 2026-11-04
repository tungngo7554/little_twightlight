import { SCENES, type SceneId } from '../data/scenes';
import type { Stage } from './stage';

// Chế độ debug: bật bằng phím D, hoặc thêm ?debug vào đường dẫn (dùng được trên điện thoại).
// Kéo chuột/ngón tay trên ảnh để vẽ một ô chữ nhật -> hiện toạ độ % để dán vào dữ liệu cảnh.

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const rectText = (r: Rect) => `{ x: ${r1(r.x)}, y: ${r1(r.y)}, w: ${r1(r.w)}, h: ${r1(r.h)} }`;

export interface DebugAction {
  label: string;
  run: () => void;
}

export function initDebug(stage: Stage, actions: DebugAction[] = []): void {
  const saved: Partial<Record<SceneId, Rect[]>> = {};
  let layer: HTMLDivElement | null = null;
  let panel: HTMLDivElement | null = null;
  let coordsEl: HTMLElement;
  let outEl: HTMLTextAreaElement;
  let sizeEl: HTMLElement;

  const isOn = () => layer !== null;

  function redraw(): void {
    if (!layer) return;
    layer.querySelectorAll('.dbg-rect').forEach((n) => n.remove());
    const id = stage.scene;
    if (!id) return;
    for (const r of saved[id] ?? []) layer.appendChild(makeRectEl(r));
    updateSize();
  }

  function makeRectEl(r: Rect): HTMLDivElement {
    const d = document.createElement('div');
    d.className = 'dbg-rect';
    d.style.left = `${r.x}%`;
    d.style.top = `${r.y}%`;
    d.style.width = `${r.w}%`;
    d.style.height = `${r.h}%`;
    const s = document.createElement('span');
    s.textContent = `${r1(r.x)}, ${r1(r.y)}, ${r1(r.w)}×${r1(r.h)}`;
    d.appendChild(s);
    return d;
  }

  function updateSize(): void {
    if (!sizeEl) return;
    const w = stage.bg.naturalWidth;
    const h = stage.bg.naturalHeight;
    sizeEl.textContent = w ? `Ảnh: ${w}×${h} (tỉ lệ ${(w / h).toFixed(3)})` : '';
  }

  function copy(text: string): void {
    try {
      // Có thể bị trình duyệt từ chối (chưa cấp quyền) – không sao, vẫn copy tay từ ô văn bản được
      navigator.clipboard?.writeText(text).catch(() => {});
    } catch {
      /* bỏ qua */
    }
  }

  function enable(): void {
    if (isOn()) return;

    layer = document.createElement('div');
    layer.id = 'debug-layer';
    stage.el.appendChild(layer);

    panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.innerHTML = `
      <div><b>DEBUG</b> – phím D để tắt</div>
      <div class="row" id="dbg-scenes"></div>
      <div class="row" id="dbg-size"></div>
      <div class="row" id="dbg-actions"></div>
      <div class="row">Con trỏ: <span id="dbg-coords">–</span></div>
      <div class="row">Kéo để vẽ vùng bấm:</div>
      <textarea id="dbg-out" readonly placeholder="{ x, y, w, h }"></textarea>
      <div class="row"><button id="dbg-copy">Copy</button><button id="dbg-clear">Xoá vùng ở cảnh này</button></div>`;
    stage.el.appendChild(panel);

    coordsEl = panel.querySelector('#dbg-coords')!;
    outEl = panel.querySelector('#dbg-out') as HTMLTextAreaElement;
    sizeEl = panel.querySelector('#dbg-size')!;

    const scenesBox = panel.querySelector('#dbg-scenes')!;
    (Object.keys(SCENES) as SceneId[]).forEach((id) => {
      const b = document.createElement('button');
      b.textContent = SCENES[id].label;
      b.dataset.id = id;
      b.addEventListener('click', () => stage.setScene(id));
      scenesBox.appendChild(b);
    });
    markActiveScene();

    const actionsBox = panel.querySelector('#dbg-actions')!;
    actions.forEach((a) => {
      const b = document.createElement('button');
      b.textContent = a.label;
      b.addEventListener('click', a.run);
      actionsBox.appendChild(b);
    });

    panel.querySelector('#dbg-copy')!.addEventListener('click', () => {
      outEl.select();
      copy(outEl.value);
    });
    panel.querySelector('#dbg-clear')!.addEventListener('click', () => {
      if (stage.scene) saved[stage.scene] = [];
      outEl.value = '';
      redraw();
    });

    // --- vẽ ô chữ nhật ---
    let start: { x: number; y: number } | null = null;
    let temp: HTMLDivElement | null = null;

    const toRect = (a: { x: number; y: number }, b: { x: number; y: number }): Rect => ({
      x: Math.min(a.x, b.x),
      y: Math.min(a.y, b.y),
      w: Math.abs(a.x - b.x),
      h: Math.abs(a.y - b.y),
    });

    layer.addEventListener('pointerdown', (e) => {
      start = stage.toPercent(e.clientX, e.clientY);
      layer!.setPointerCapture(e.pointerId);
      temp = makeRectEl({ ...start, w: 0, h: 0 });
      layer!.appendChild(temp);
    });
    layer.addEventListener('pointermove', (e) => {
      const p = stage.toPercent(e.clientX, e.clientY);
      coordsEl.textContent = `x ${r1(p.x)}%, y ${r1(p.y)}%`;
      if (start && temp) {
        temp.replaceWith((temp = makeRectEl(toRect(start, p))));
      }
    });
    layer.addEventListener('pointerup', (e) => {
      if (!start) return;
      const p = stage.toPercent(e.clientX, e.clientY);
      const rect = toRect(start, p);
      start = null;
      temp?.remove();
      temp = null;
      if (rect.w < 0.4 && rect.h < 0.4) {
        // chỉ chạm một điểm
        outEl.value = `{ x: ${r1(p.x)}, y: ${r1(p.y)} }`;
      } else if (stage.scene) {
        (saved[stage.scene] ??= []).push(rect);
        outEl.value = (saved[stage.scene] ?? []).map((r) => rectText(r) + ',').join('\n');
      }
      copy(outEl.value);
      redraw();
    });

    stage.bg.addEventListener('load', updateSize);
    redraw();
  }

  function markActiveScene(): void {
    panel?.querySelectorAll('#dbg-scenes button').forEach((b) => {
      b.classList.toggle('on', (b as HTMLElement).dataset.id === stage.scene);
    });
  }

  function disable(): void {
    layer?.remove();
    panel?.remove();
    layer = null;
    panel = null;
  }

  stage.onSceneChange(() => {
    markActiveScene();
    redraw();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'd' && e.key !== 'D') return;
    if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
    if (isOn()) disable();
    else enable();
  });

  if (new URLSearchParams(location.search).has('debug')) enable();
}
