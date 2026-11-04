import type { Stage } from './stage';
import { overlayUrl, type OverlayId } from '../data/scenes';

// Lớp phủ: một ảnh PNG cùng kích thước khung hình, phủ lên cảnh hiện tại.
//  - Đang mở thì lớp vùng bấm của cảnh bên dưới bị tắt hẳn, bấm xuyên qua không được.
//  - Đóng lại bằng cách bấm vào lớp phủ hoặc nhấn phím Esc. Đổi cảnh cũng tự đóng.
export class Overlay {
  private el: HTMLDivElement;
  private img: HTMLImageElement;
  private openId: OverlayId | null = null;
  private afterClose: (() => void) | null = null;

  // canClose: cho phép chặn việc đóng bằng tay (ví dụ khi đang chạy đoạn thoại bắt buộc)
  constructor(
    private stage: Stage,
    private canClose: () => boolean = () => true,
  ) {
    this.el = document.createElement('div');
    Object.assign(this.el.style, {
      position: 'absolute',
      inset: '0',
      zIndex: '4', // trên lớp vùng bấm và kim đồng hồ, dưới ô chữ và thanh vật phẩm
      cursor: 'pointer',
      opacity: '0',
      transition: 'opacity 0.25s',
    });
    this.el.hidden = true;

    this.img = document.createElement('img');
    this.img.alt = '';
    this.img.draggable = false;
    Object.assign(this.img.style, { width: '100%', height: '100%', objectFit: 'fill', pointerEvents: 'none' });
    this.el.appendChild(this.img);

    this.el.addEventListener('click', () => {
      if (this.canClose()) this.close(true);
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.canClose()) this.close(true);
    });
    stage.el.insertBefore(this.el, stage.uiLayer);
    stage.onSceneChange(() => this.close());
  }

  get isOpen(): boolean {
    return this.openId !== null;
  }

  /** afterClose: chạy khi NGƯỜI CHƠI tự đóng lớp phủ (không chạy nếu lớp phủ đóng do đổi cảnh). */
  open(id: OverlayId, afterClose?: () => void): void {
    this.openId = id;
    this.afterClose = afterClose ?? null;
    this.img.src = overlayUrl(id);
    this.stage.hotspotLayer.hidden = true; // tắt các vùng bấm phía sau
    this.el.hidden = false;
    requestAnimationFrame(() => {
      if (this.openId) this.el.style.opacity = '1';
    });
  }

  close(byPlayer = false): void {
    if (!this.openId) return;
    this.openId = null;
    this.el.style.opacity = '0';
    this.el.hidden = true;
    this.stage.hotspotLayer.hidden = false;
    const after = this.afterClose;
    this.afterClose = null;
    if (byPlayer) after?.();
  }
}
