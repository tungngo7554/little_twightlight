// Danh sách âm thanh. Khi có file, đặt vào public/assets/audio/ rồi thay null bằng tên file.
// Ví dụ: knock: 'knock.mp3'. Khi còn null, game vẫn chạy bình thường (chỉ hiện chữ mô tả).

export type AudioId = 'knock' | 'clack';

export const AUDIO_FILES: Record<AudioId, string | null> = {
  knock: null, // tiếng gõ cửa
  clack: null, // tiếng "cạch" khi chỉnh đúng giờ đồng hồ
};
