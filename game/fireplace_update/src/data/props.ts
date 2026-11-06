import type { SceneId, Rect } from './scenes';

// Ảnh PNG trong suốt đặt chồng lên ảnh nền của một cảnh (ví dụ khúc gỗ và ngọn lửa trong lò sưởi).
// rect tính theo % khung hình. Ảnh được co vừa trong rect, giữ nguyên tỉ lệ.
export interface PropDef {
  img: string; // đường dẫn tính từ thư mục public/
  rect: Rect;
  scale?: number; // phóng to / thu nhỏ quanh tâm của rect (mặc định 1)
  rotate?: number; // xoay quanh tâm, đơn vị độ, dương = theo chiều kim đồng hồ (mặc định 0)
}

const WOOD = 'assets/items/wood.png';
const FLAME = 'assets/items/flame_2.png';

// Hai khúc gỗ trong lò sưởi. Khúc đặt vào đầu tiên hiện ở LOGS_IN_FIREPLACE[0], khúc thứ hai ở [1].
// Cảnh lo_suoi (chưa đốt) và lo_suoi_sang (đã đốt) dùng chung vị trí này.
export const LOGS_IN_FIREPLACE: PropDef[] = [
  { img: WOOD, rect: { x: 36.8, y: 62, w: 15, h: 12 }, scale: 1.5, rotate: -20 },
  { img: WOOD, rect: { x: 48.2, y: 62, w: 15, h: 12 }, scale: 1.5, rotate: 20 },
];

// Lửa: tâm ngọn lửa nằm quanh (49.6, 69.6), theo vùng đánh dấu { x: 46.3, y: 69.4, w: 6.7, h: 0.4 }
const FLAME_PROP: PropDef = { img: FLAME, rect: { x: 39.5, y: 51.2, w: 20, h: 30 }, scale: 0.5 };

// Ảnh phụ cố định của từng cảnh. (Cảnh lo_suoi có ảnh phụ thay đổi theo số gỗ đã đặt, xử lý trong main.ts.)
export const SCENE_PROPS: Partial<Record<SceneId, PropDef[]>> = {
  lo_suoi_sang: [...LOGS_IN_FIREPLACE, FLAME_PROP],
};
