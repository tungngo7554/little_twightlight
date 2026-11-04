import { getLang } from './i18n';
import type { AudioId } from './audio';

// Toàn bộ lời thoại. Mỗi câu có: loại giọng (voice), bản Việt, bản Anh.
// Bản Anh bên dưới là bản nháp, bạn sửa lại cho đúng ý.
//
//  speech  = lời nói của người cha (chữ thường)
//  thought = suy nghĩ của người cha (chữ nghiêng)
//  sfx     = mô tả âm thanh (chữ nghiêng, mờ hơn)
//  venica  = lời của cô con gái (ô màu hồng nhạt, trong suốt)

export type Voice = 'speech' | 'thought' | 'sfx' | 'venica';

export interface LineDef {
  voice: Voice;
  vi: string;
  en: string;
  sfx?: AudioId; // âm thanh phát cùng lúc khi câu bắt đầu hiện
}

function L(voice: Voice, vi: string, en: string, sfx?: AudioId): LineDef {
  return { voice, vi, en, sfx };
}

export const LINES = {
  // ----- Đoạn mở đầu -----
  intro_1: L('speech', 'Uhh... đầu của mình... đau quá', 'Uhh... my head... it hurts so much'),
  intro_2: L('thought', 'Chiều muộn rồi sao? Mình ngủ quên à?', 'Late afternoon already? Did I fall asleep?'),
  intro_3: L('sfx', '*cốc cốc cốc*', '*knock knock knock*', 'knock'),
  intro_4: L('speech', 'Vào đi', 'Come in'),
  intro_5: L('sfx', '*cốc cốc cốc*', '*knock knock knock*', 'knock'),
  intro_6: L('thought', 'Chuyện gì vậy nhỉ?', "What's going on?"),
  intro_7: L('venica', 'Ba ơi?', 'Dad?'),
  intro_8: L('speech', 'Venica?', 'Venica?'),

  // ----- Thư phòng (dùng ở bước sau) -----
  door_locked: L(
    'thought',
    'Không mở được cửa? Mình không nhớ là đã khóa trong.',
    "The door won't open? I don't remember locking it from the inside.",
  ),
  desk_book: L('thought', 'Sách đang mở? Mình đã đọc sách rồi ngủ quên chăng?', 'The book is open? Did I fall asleep reading?'),
  desk_pen: L('thought', 'Những cái bút chưa được đóng lại', "The pens haven't been capped"),
  desk_globe: L('thought', 'Nước Anh', 'England'),

  // ----- Hành lang (dùng ở bước sau) -----
  hall_enter: L('thought', 'Hành lang… sao im lặng thế này?', 'The hallway... why is it so quiet?'),
  hall_call: L('speech', 'Venica?', 'Venica?'),

  // ----- Đồng hồ -----
  study_clock_time: L('thought', '4:35 p.m.', '4:35 p.m.'), // đồng hồ góc thư phòng
  clock_click: L('sfx', '*cạch*', '*click*', 'clack'), // chỉnh đúng giờ ở hành lang
} satisfies Record<string, LineDef>;

export type LineId = keyof typeof LINES;

export function getLine(id: LineId): { voice: Voice; text: string; sfx?: AudioId } {
  const def: LineDef = LINES[id];
  return { voice: def.voice, text: def[getLang()], sfx: def.sfx };
}

export const INTRO: LineId[] = [
  'intro_1',
  'intro_2',
  'intro_3',
  'intro_4',
  'intro_5',
  'intro_6',
  'intro_7',
  'intro_8',
];

// Lần đầu bước ra hành lang
export const HALL_FIRST_VISIT: LineId[] = ['hall_enter', 'hall_call'];
