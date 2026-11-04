import type { Lang } from './i18n';

// Vật phẩm. Mặc định vật phẩm là "tiêu hao" (dùng xong thì biến mất khỏi túi đồ).
// Riêng chìa khoá thư phòng đặt consumable: false vì nó đi theo người chơi đến hết game.

export type ItemId = 'study_room_lock' | 'storage_key';

export interface ItemDef {
  id: ItemId;
  img: string; // tên file trong public/assets/items/
  consumable: boolean;
  name: Record<Lang, string>;
}

export const ITEMS: Record<ItemId, ItemDef> = {
  study_room_lock: {
    id: 'study_room_lock',
    img: 'study_room_lock.png',
    consumable: false,
    name: { vi: 'Chìa khóa thư phòng', en: 'Study key' },
  },
  storage_key: {
    id: 'storage_key',
    img: 'storage_key.png',
    consumable: true,
    name: { vi: 'Chìa khóa kho', en: 'Storage key' },
  },
};

export function itemUrl(id: ItemId): string {
  return `assets/items/${ITEMS[id].img}`;
}
