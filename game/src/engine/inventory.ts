import { ITEMS, itemUrl, type ItemId } from '../data/items';
import { getLang } from '../data/i18n';

const MAX_SLOTS = 8;

export interface InventoryState {
  items: ItemId[];
  selected: ItemId | null;
}

// Thanh vật phẩm ở mép dưới. Chỉ hiện khi có ít nhất một vật phẩm.
export class Inventory {
  private el: HTMLDivElement;
  private items: ItemId[] = [];
  private selectedId: ItemId | null = null;
  private listeners: Array<() => void> = [];

  constructor(parent: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'inventory';
    this.el.hidden = true;
    parent.appendChild(this.el);
  }

  get selected(): ItemId | null {
    return this.selectedId;
  }

  has(id: ItemId): boolean {
    return this.items.includes(id);
  }

  add(id: ItemId): void {
    if (this.has(id)) return;
    if (this.items.length >= MAX_SLOTS) {
      console.warn('[inventory] Túi đồ đã đầy, không thêm được:', id);
      return;
    }
    this.items.push(id);
    this.render(id);
    this.emit();
  }

  remove(id: ItemId): void {
    this.items = this.items.filter((x) => x !== id);
    if (this.selectedId === id) this.selectedId = null;
    this.render();
    this.emit();
  }

  /** Dùng vật phẩm lên một thứ gì đó thành công. Vật phẩm tiêu hao sẽ biến mất, chìa khoá thì ở lại. */
  consume(id: ItemId): void {
    if (ITEMS[id].consumable) this.remove(id);
  }

  select(id: ItemId | null): void {
    if (id !== null && !this.has(id)) return;
    if (this.selectedId === id) return;
    this.selectedId = id;
    this.render();
    this.emit();
  }

  deselect(): void {
    this.select(null);
  }

  onChange(fn: () => void): void {
    this.listeners.push(fn);
  }

  /** Dùng cho tính năng lưu game ở bước sau. */
  getState(): InventoryState {
    return { items: [...this.items], selected: this.selectedId };
  }

  setState(state: InventoryState): void {
    this.items = state.items.filter((id) => id in ITEMS).slice(0, MAX_SLOTS);
    this.selectedId = state.selected && this.items.includes(state.selected) ? state.selected : null;
    this.render();
    this.emit();
  }

  private emit(): void {
    this.listeners.forEach((fn) => fn());
  }

  private render(justAdded?: ItemId): void {
    this.el.replaceChildren();
    this.el.hidden = this.items.length === 0;
    for (const id of this.items) {
      const slot = document.createElement('button');
      slot.type = 'button';
      slot.className = 'slot';
      if (id === this.selectedId) slot.classList.add('selected');
      if (id === justAdded) slot.classList.add('pop');
      slot.setAttribute('aria-label', ITEMS[id].name[getLang()]);
      slot.setAttribute('aria-pressed', String(id === this.selectedId));

      const img = document.createElement('img');
      img.src = itemUrl(id);
      img.alt = '';
      img.draggable = false;
      slot.appendChild(img);

      // Bấm lần nữa vào vật đang chọn thì bỏ chọn
      slot.addEventListener('click', () => this.select(this.selectedId === id ? null : id));
      this.el.appendChild(slot);
    }
  }
}
