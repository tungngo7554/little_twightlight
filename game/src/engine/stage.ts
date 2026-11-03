import { SCENES, sceneUrl, type SceneId } from '../data/scenes';

// "Sân khấu" 16:9: giữ ảnh nền, co giãn theo màn hình, đổi cảnh.
export class Stage {
  readonly el: HTMLElement;
  readonly bg: HTMLImageElement;
  readonly hotspotLayer: HTMLElement;
  readonly uiLayer: HTMLElement;

  private current: SceneId | null = null;
  private listeners: Array<(id: SceneId) => void> = [];

  constructor() {
    this.el = document.getElementById('stage')!;
    this.bg = document.getElementById('bg') as HTMLImageElement;
    this.hotspotLayer = document.getElementById('layer-hotspots')!;
    this.uiLayer = document.getElementById('layer-ui')!;

    this.updateUnit();
    window.addEventListener('resize', () => this.updateUnit());
    window.addEventListener('orientationchange', () => this.updateUnit());
    new ResizeObserver(() => this.updateUnit()).observe(document.body);
  }

  /** Đặt biến CSS --u = 1% chiều ngang khung hình (dùng cho cỡ chữ, nút…). */
  updateUnit(): void {
    const w = this.el.getBoundingClientRect().width;
    document.documentElement.style.setProperty('--u', `${w / 100}px`);
  }

  get scene(): SceneId | null {
    return this.current;
  }

  /** Đổi nguyên ảnh nền (full background swap). */
  setScene(id: SceneId): void {
    this.current = id;
    this.bg.src = sceneUrl(id);
    this.bg.alt = SCENES[id].label;
    this.listeners.forEach((fn) => fn(id));
  }

  onSceneChange(fn: (id: SceneId) => void): void {
    this.listeners.push(fn);
  }

  /** Đổi toạ độ màn hình (px) sang phần trăm khung hình. */
  toPercent(clientX: number, clientY: number): { x: number; y: number } {
    const r = this.el.getBoundingClientRect();
    const clamp = (n: number) => Math.min(100, Math.max(0, n));
    return {
      x: clamp(((clientX - r.left) / r.width) * 100),
      y: clamp(((clientY - r.top) / r.height) * 100),
    };
  }
}
