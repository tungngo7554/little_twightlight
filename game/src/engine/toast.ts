// Chú thích nhỏ, chữ trắng, ở góc trên bên phải, tự biến mất (dùng khi nhặt vật phẩm).
export class Toast {
  private el: HTMLDivElement;
  private timer: number | undefined;

  constructor(parent: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'toast';
    this.el.setAttribute('aria-live', 'polite');
    parent.appendChild(this.el);
  }

  show(text: string, ms = 3000): void {
    window.clearTimeout(this.timer);
    this.el.textContent = text;
    this.el.classList.add('on');
    this.timer = window.setTimeout(() => this.el.classList.remove('on'), ms);
  }
}
