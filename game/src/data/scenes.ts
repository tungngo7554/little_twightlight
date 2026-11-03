// Danh sách cảnh. Mỗi cảnh = một ảnh nền (tỉ lệ 16:9) trong public/assets/scenes/.
// Vùng bấm (hotspot) sẽ được thêm vào đây ở bước sau, theo toạ độ phần trăm.

export type SceneId =
  | 'study_locked' // thư phòng, cửa đóng
  | 'study_open' // thư phòng, cửa mở
  | 'desk_key' // cận cảnh bàn, còn chìa khoá
  | 'desk_empty' // cận cảnh bàn, hết chìa khoá
  | 'hall_2nd'; // hành lang tầng 2

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
};

export const START_SCENE: SceneId = 'study_locked';

export function sceneUrl(id: SceneId): string {
  return `assets/scenes/${SCENES[id].bg}`;
}
