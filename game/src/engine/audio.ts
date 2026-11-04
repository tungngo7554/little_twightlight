import { AUDIO_FILES, type AudioId } from '../data/audio';

// Phát âm thanh ngắn. Chưa có file (null trong data/audio.ts) thì không làm gì cả.
export class AudioPlayer {
  play(id: AudioId): void {
    const file = AUDIO_FILES[id];
    if (!file) return;
    try {
      const a = new Audio(`assets/audio/${file}`);
      a.play().catch(() => {
        /* trình duyệt có thể chặn nếu người chơi chưa chạm vào trang – bỏ qua */
      });
    } catch {
      /* bỏ qua */
    }
  }
}
