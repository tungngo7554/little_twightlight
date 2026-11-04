// Danh sách cảnh. Mỗi cảnh = một ảnh nền (tỉ lệ 16:9) trong public/assets/scenes/.
// Vùng bấm (hotspot) tính theo phần trăm khung hình: { x, y, w, h }.

export type SceneId =
  | 'study_locked' // thư phòng, cửa đóng
  | 'study_open' // thư phòng, cửa mở
  | 'desk_key' // cận cảnh bàn, còn chìa khoá
  | 'desk_empty' // cận cảnh bàn, hết chìa khoá
  | 'hall_2nd' // hành lang tầng 2
  | 'hall_shelf' // cận cảnh kệ sách ở hành lang
  | 'hall_shelf_close' // nhìn kỹ hơn kệ sách (có đồng hồ)
  | 'hall_clock' // cận cảnh đồng hồ trên kệ
  | 'hall_clock_close' // cận cảnh mặt đồng hồ (chỉnh kim)
  | 'hall_clock_open_key' // đồng hồ đã mở, còn chìa khoá
  | 'hall_clock_open'; // đồng hồ đã mở, hết chìa khoá

export interface SceneDef {
  id: SceneId;
  bg: string; // tên file trong public/assets/scenes/
  label: string; // nhãn dùng cho chế độ debug
}

export const SCENES: Record<SceneId, SceneDef> = {
  study_locked: { id: 'study_locked', bg: 'bg_study_sunset_locked.png', label: 'Thư phòng (khoá)' },
  study_open: { id: 'study_open', bg: 'bg_study_sunset_open.png', label: 'Thư phòng (mở)' },
  desk_key: { id: 'desk_key', bg: 'bg_study_under_desk_key.png', label: 'Bàn (có chìa)' },
  desk_empty: { id: 'desk_empty', bg: 'bg_study_under_desk.png', label: 'Bàn (hết chìa)' },
  hall_2nd: { id: 'hall_2nd', bg: 'bg_hall_2nd.png', label: 'Hành lang' },
  hall_shelf: { id: 'hall_shelf', bg: 'bg_hall_shelf.png', label: 'Kệ sách (hành lang)' },
  hall_shelf_close: { id: 'hall_shelf_close', bg: 'bg_hall_shelf_close.png', label: 'Kệ sách (nhìn kỹ)' },
  hall_clock: { id: 'hall_clock', bg: 'bg_hall_clock.png', label: 'Đồng hồ (hành lang)' },
  hall_clock_close: { id: 'hall_clock_close', bg: 'bg_hall_clock_close.png', label: 'Mặt đồng hồ' },
  hall_clock_open_key: { id: 'hall_clock_open_key', bg: 'bg_hall_clock_open_key.png', label: 'Đồng hồ mở (có chìa)' },
  hall_clock_open: { id: 'hall_clock_open', bg: 'bg_hall_clock_open.png', label: 'Đồng hồ mở (hết chìa)' },
};

export const START_SCENE: SceneId = 'study_locked';

export function sceneUrl(id: SceneId): string {
  return `assets/scenes/${SCENES[id].bg}`;
}

// ----- Vùng bấm -----

export type HotspotId =
  | 'desk'
  | 'door'
  | 'book'
  | 'pen'
  | 'globe'
  | 'key'
  | 'back'
  | 'hall_door'
  | 'study_clock' // đồng hồ góc thư phòng (xem giờ)
  | 'hall_shelf' // kệ sách ở hành lang
  | 'shelf_zoom' // nhìn kỹ hơn kệ sách
  | 'shelf_clock' // đồng hồ trên kệ
  | 'clock_face' // mặt đồng hồ
  | 'storage_key'; // chìa trong đồng hồ

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface HotspotDef {
  id: HotspotId;
  label: string; // chỉ dùng cho debug / trợ năng
  rect: Rect;
}

const DESK = { id: 'desk', label: 'Bàn', rect: { x: 24.8, y: 51.8, w: 18.7, h: 31.5 } } as const;
const DOOR = { id: 'door', label: 'Cửa', rect: { x: 82.9, y: 26.5, w: 12.1, h: 52.2 } } as const;
// TODO: toạ độ tạm, vẽ lại bằng chế độ debug
const STUDY_CLOCK = { id: 'study_clock', label: 'Đồng hồ', rect: { x: 71, y: 33, w: 8, h: 42 } } as const;

// Bốn vùng quanh mép cảnh cận cảnh bàn: bấm để quay lại thư phòng
const BACK: HotspotDef[] = [
  { id: 'back', label: 'Quay lại', rect: { x: 0.4, y: 0.9, w: 11.3, h: 52.3 } },
  { id: 'back', label: 'Quay lại', rect: { x: 88.1, y: 0.2, w: 11.9, h: 50.3 } },
  { id: 'back', label: 'Quay lại', rect: { x: 83.9, y: 69, w: 16.1, h: 31 } },
  { id: 'back', label: 'Quay lại', rect: { x: 0, y: 66, w: 14.1, h: 34 } },
];

// TODO: hai dải mép trái/phải, toạ độ tạm cho các cảnh cận cảnh ở hành lang
const SIDE_BACK: HotspotDef[] = [
  { id: 'back', label: 'Quay lại', rect: { x: 0, y: 0, w: 8, h: 100 } },
  { id: 'back', label: 'Quay lại', rect: { x: 92, y: 0, w: 8, h: 100 } },
];

// Dùng chung cho cả desk_key và desk_empty (riêng chìa chỉ có ở desk_key)
const DESK_ITEMS: HotspotDef[] = [
  { id: 'globe', label: 'Quả địa cầu', rect: { x: 22.7, y: 3.5, w: 13.5, h: 27.1 } },
  { id: 'pen', label: 'Bút', rect: { x: 62.7, y: 30.1, w: 11.2, h: 17.8 } },
  { id: 'book', label: 'Sách', rect: { x: 38, y: 28, w: 25.7, h: 26.1 } },
];

export const HOTSPOTS: Record<SceneId, HotspotDef[]> = {
  study_locked: [DESK, DOOR, STUDY_CLOCK],
  study_open: [DESK, DOOR, STUDY_CLOCK],
  desk_key: [
    ...BACK,
    ...DESK_ITEMS,
    { id: 'key', label: 'Chìa khoá', rect: { x: 74.4, y: 35.6, w: 11.1, h: 18.6 } },
  ],
  desk_empty: [...BACK, ...DESK_ITEMS],
  hall_2nd: [
    { id: 'hall_door', label: 'Cửa thư phòng', rect: { x: 65, y: 16.4, w: 22.6, h: 80.4 } },
    // TODO: toạ độ tạm
    { id: 'hall_shelf', label: 'Kệ sách', rect: { x: 8, y: 20, w: 25, h: 65 } },
  ],
  hall_shelf: [
    ...SIDE_BACK,
    // TODO: toạ độ tạm
    { id: 'shelf_zoom', label: 'Nhìn kỹ kệ sách', rect: { x: 20, y: 15, w: 60, h: 70 } },
  ],
  hall_shelf_close: [
    ...SIDE_BACK,
    // TODO: toạ độ tạm
    { id: 'shelf_clock', label: 'Đồng hồ', rect: { x: 40, y: 15, w: 20, h: 55 } },
  ],
  hall_clock: [
    ...SIDE_BACK,
    // TODO: toạ độ tạm
    { id: 'clock_face', label: 'Mặt đồng hồ', rect: { x: 30, y: 20, w: 40, h: 60 } },
  ],
  // Cảnh chỉnh kim: vùng kéo nằm trong data/clockConfig.ts, không phải ở đây
  hall_clock_close: [...SIDE_BACK],
  hall_clock_open_key: [
    ...SIDE_BACK,
    // TODO: toạ độ tạm
    { id: 'storage_key', label: 'Chìa khoá', rect: { x: 40, y: 40, w: 20, h: 25 } },
  ],
  hall_clock_open: [...SIDE_BACK],
};
