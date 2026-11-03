// Mọi chữ hiển thị nằm ở đây. Thêm/sửa bản dịch không cần đụng vào code khác.
export type Lang = 'vi' | 'en';

const STRINGS = {
  vi: {
    tapToStart: 'Chạm để bắt đầu',
    loading: 'Đang tải…',
    rotate: 'Hãy xoay ngang màn hình để chơi',
  },
  en: {
    tapToStart: 'Tap to start',
    loading: 'Loading…',
    rotate: 'Please rotate your device to landscape',
  },
} as const;

export type StringKey = keyof (typeof STRINGS)['vi'];

const LANG_STORAGE_KEY = 'game.lang';
let current: Lang = 'vi'; // tiếng Việt là mặc định

export function loadLang(): void {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'vi' || saved === 'en') current = saved;
  } catch {
    /* localStorage có thể bị chặn (chế độ riêng tư) – bỏ qua */
  }
}

export function getLang(): Lang {
  return current;
}

export function setLang(lang: Lang): void {
  current = lang;
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    /* bỏ qua */
  }
}

export function t(key: StringKey): string {
  return STRINGS[current][key];
}
