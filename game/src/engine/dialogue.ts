import { getLine, type LineId } from '../data/dialogue';
import type { AudioPlayer } from './audio';
import type { Stage } from './stage';

// Tách chữ theo "ký tự hiển thị" để chữ có dấu tiếng Việt không bị vỡ khi gõ từng ký tự.
const segmenter = 'Segmenter' in Intl ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;
function graphemes(text: string): string[] {
  return segmenter ? Array.from(segmenter.segment(text), (s) => s.segment) : Array.from(text);
}

const MS_PER_CHAR = 32;
const MS_PER_CHAR_SFX = 55;

// Ô chữ ở trên cùng khung hình.
//  - show(id): mô tả/phản hồi, tự tắt sau vài giây, không chặn thao tác bên dưới.
//  - play(ids): chuỗi thoại, bắt buộc bấm từng câu (bấm lần 1: hiện đủ câu, bấm lần 2: sang câu kế).
export class Dialogue {
  private box: HTMLDivElement;
  private typed: HTMLSpanElement;
  private rest: HTMLSpanElement;
  private more: HTMLSpanElement;

  private chars: string[] = [];
  private shown = 0;
  private typingDone = true;
  private onTypingDone: (() => void) | null = null;

  private typeTimer: number | undefined;
  private holdTimer: number | undefined;
  private clearTimer: number | undefined;
  private sequenceBusy = false;

  constructor(
    private stage: Stage,
    private audio: AudioPlayer,
  ) {
    this.box = document.createElement('div');
    this.box.className = 'dialog';
    this.box.setAttribute('aria-live', 'polite');

    // Phần chưa gõ vẫn chiếm chỗ (ẩn) để ô chữ không "nhảy" kích thước khi gõ.
    this.typed = document.createElement('span');
    this.rest = document.createElement('span');
    this.rest.className = 'rest';
    this.more = document.createElement('span');
    this.more.className = 'more';
    this.more.textContent = '▾';
    this.box.append(this.typed, this.rest, this.more);
    stage.uiLayer.appendChild(this.box);
  }

  get busy(): boolean {
    return this.sequenceBusy;
  }

  /** Hiện một câu ngắn rồi tự tắt. Không làm gián đoạn đoạn thoại bắt buộc đang chạy. */
  show(id: LineId): void {
    if (this.sequenceBusy) return;
    this.start(id, () => {
      const hold = Math.min(6000, Math.max(2200, 1500 + this.chars.length * 55));
      this.holdTimer = window.setTimeout(() => this.hide(), hold);
    });
  }

  /** Chạy một chuỗi thoại, người chơi phải bấm từng câu. Xong thì Promise hoàn tất. */
  async play(ids: LineId[]): Promise<void> {
    if (this.sequenceBusy) return;
    this.sequenceBusy = true;

    // Lớp trong suốt phủ cả khung hình để bắt thao tác bấm
    const catcher = document.createElement('div');
    catcher.className = 'dialog-catcher';
    this.stage.uiLayer.appendChild(catcher);

    for (const id of ids) {
      await new Promise<void>((resolve) => {
        const finish = () => {
          catcher.removeEventListener('pointerdown', advance);
          window.removeEventListener('keydown', onKey);
          resolve();
        };
        const advance = () => {
          if (!this.typingDone) this.completeTyping();
          else finish();
        };
        const onKey = (e: KeyboardEvent) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            advance();
          }
        };
        catcher.addEventListener('pointerdown', advance);
        window.addEventListener('keydown', onKey);

        this.start(id, () => this.box.classList.add('waiting'));
      });
    }

    this.hide();
    catcher.remove();
    this.sequenceBusy = false;
  }

  private start(id: LineId, onDone: () => void): void {
    this.clearTimers();
    const line = getLine(id);

    this.box.className = `dialog voice-${line.voice} on`;
    this.chars = graphemes(line.text);
    this.shown = 0;
    this.typingDone = false;
    this.onTypingDone = onDone;
    this.render();

    if (line.sfx) this.audio.play(line.sfx);

    const perChar = line.voice === 'sfx' ? MS_PER_CHAR_SFX : MS_PER_CHAR;
    this.typeTimer = window.setInterval(() => {
      this.shown++;
      this.render();
      if (this.shown >= this.chars.length) this.completeTyping();
    }, perChar);
  }

  private completeTyping(): void {
    window.clearInterval(this.typeTimer);
    this.shown = this.chars.length;
    this.render();
    if (this.typingDone) return;
    this.typingDone = true;
    this.onTypingDone?.();
  }

  private hide(): void {
    this.clearTimers();
    this.box.classList.remove('on', 'waiting');
    // Xoá chữ sau khi mờ hẳn
    this.clearTimer = window.setTimeout(() => {
      this.chars = [];
      this.shown = 0;
      this.render();
    }, 500);
  }

  private clearTimers(): void {
    window.clearInterval(this.typeTimer);
    window.clearTimeout(this.holdTimer);
    window.clearTimeout(this.clearTimer);
  }

  private render(): void {
    this.typed.textContent = this.chars.slice(0, this.shown).join('');
    this.rest.textContent = this.chars.slice(this.shown).join('');
  }
}
