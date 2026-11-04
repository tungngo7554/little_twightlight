import type { Stage } from './stage';
import { CLOCK, NEEDLE_URL } from '../data/clockConfig';

const SCENE = 'hall_clock_close';

const mod = (n: number, m: number) => ((n % m) + m) % m;
// Đưa góc về khoảng [-180, 180)
const norm180 = (d: number) => mod(d + 180, 360) - 180;

// Câu đố chỉnh kim đồng hồ. Bắt đầu ở 12:00.
//  - Người chơi kéo trong vùng tròn quanh mặt đồng hồ: kim phút bám theo hướng ngón tay/chuột.
//  - Kim giờ tự chạy theo (12 vòng kim phút = 1 vòng kim giờ), kéo xuôi hay ngược đều được.
//  - Kim nhảy theo từng phút. Khi người chơi thả tay đúng giờ cần tìm thì gọi onSolved().
export class ClockPuzzle {
  private root: HTMLDivElement;
  private zone: HTMLDivElement;
  private minuteHand: HTMLDivElement;
  private hourHand: HTMLDivElement;

  private minutes = 0; // tổng số phút tính từ 12:00 (có thể âm hoặc vượt 720)
  private accDeg = 0; // góc kim phút cộng dồn, cho phép quay nhiều vòng
  private lastAngle = 0;
  private dragging = false;
  private locked = false;

  constructor(
    private stage: Stage,
    private onSolved: () => void,
  ) {
    const debug = new URLSearchParams(location.search).has('debug');

    this.root = document.createElement('div');
    Object.assign(this.root.style, { position: 'absolute', inset: '0', zIndex: '5', pointerEvents: 'none' });
    this.root.hidden = true;

    this.hourHand = this.makeHand();
    this.minuteHand = this.makeHand();

    this.zone = document.createElement('div');
    Object.assign(this.zone.style, {
      position: 'absolute',
      left: `${CLOCK.centerX}%`,
      top: `${CLOCK.centerY}%`,
      width: `calc(var(--u) * ${CLOCK.faceRadius * 2})`,
      aspectRatio: '1 / 1',
      transform: 'translate(-50%, -50%)',
      borderRadius: '50%',
      pointerEvents: 'auto',
      cursor: 'grab',
      touchAction: 'none',
    });
    if (debug) this.zone.style.outline = '1px dashed rgba(80, 160, 255, 0.9)';

    this.zone.addEventListener('pointerdown', (e) => this.onDown(e));
    this.zone.addEventListener('pointermove', (e) => this.onMove(e));
    this.zone.addEventListener('pointerup', (e) => this.onUp(e));
    this.zone.addEventListener('pointercancel', (e) => this.onUp(e));

    // Kim giờ nằm dưới kim phút
    this.root.append(this.hourHand, this.minuteHand, this.zone);
    // Đặt giữa lớp vùng bấm và lớp giao diện (ô chữ, thanh vật phẩm vẫn nằm trên)
    stage.el.insertBefore(this.root, stage.uiLayer);

    stage.onSceneChange((id) => {
      this.root.hidden = id !== SCENE;
    });
    this.render();
  }

  /** Cho phép khoá câu đố (ví dụ khi tải lại trạng thái đã giải xong). */
  lock(): void {
    this.locked = true;
  }

  private makeHand(): HTMLDivElement {
    // Khối rỗng đặt đúng tâm đồng hồ, xoay quanh chính điểm đó
    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      position: 'absolute',
      left: `${CLOCK.centerX}%`,
      top: `${CLOCK.centerY}%`,
      width: '0',
      height: '0',
      pointerEvents: 'none',
    });
    const img = document.createElement('img');
    img.src = NEEDLE_URL;
    img.alt = '';
    img.draggable = false;
    Object.assign(img.style, {
      position: 'absolute',
      left: '0',
      top: '0',
      height: `calc(var(--u) * ${CLOCK.needleHeight})`,
      width: 'auto',
      // Dời ảnh để điểm quay của kim trùng với tâm khối
      transform: `translate(${-CLOCK.pivotX * 100}%, ${-CLOCK.pivotY * 100}%)`,
      pointerEvents: 'none',
    });
    wrap.appendChild(img);
    return wrap;
  }

  /** Góc của con trỏ so với tâm mặt đồng hồ: 0 = hướng 12 giờ, tăng theo chiều kim đồng hồ. */
  private pointerAngle(e: PointerEvent): number {
    const r = this.stage.el.getBoundingClientRect();
    const cx = r.left + (CLOCK.centerX / 100) * r.width;
    const cy = r.top + (CLOCK.centerY / 100) * r.height;
    return (Math.atan2(e.clientX - cx, -(e.clientY - cy)) * 180) / Math.PI;
  }

  private onDown(e: PointerEvent): void {
    if (this.locked) return;
    e.preventDefault();
    this.zone.setPointerCapture(e.pointerId);
    this.dragging = true;
    const a = this.pointerAngle(e);
    // Kim nhảy tới hướng ngón tay theo đường ngắn nhất
    this.accDeg += norm180(a - mod(this.accDeg, 360));
    this.lastAngle = a;
    this.update();
  }

  private onMove(e: PointerEvent): void {
    if (!this.dragging || this.locked) return;
    const a = this.pointerAngle(e);
    this.accDeg += norm180(a - this.lastAngle);
    this.lastAngle = a;
    this.update();
  }

  private onUp(e: PointerEvent): void {
    if (!this.dragging) return;
    this.dragging = false;
    if (this.zone.hasPointerCapture(e.pointerId)) this.zone.releasePointerCapture(e.pointerId);
    // Chỉ kiểm tra khi thả tay, để kim lướt ngang qua giờ đúng không tính
    if (mod(this.minutes, 720) === CLOCK.targetMinutes) {
      this.locked = true;
      this.onSolved();
    }
  }

  private update(): void {
    this.minutes = Math.round(this.accDeg / 6);
    this.render();
  }

  private render(): void {
    const minuteDeg = mod(this.minutes, 60) * 6;
    const hourDeg = mod(this.minutes, 720) * 0.5;
    this.minuteHand.style.transform = `rotate(${minuteDeg}deg)`;
    this.hourHand.style.transform = `rotate(${hourDeg}deg) scale(${CLOCK.hourScaleX}, ${CLOCK.hourScaleY})`;
  }
}
