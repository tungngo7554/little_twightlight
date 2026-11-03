// Tải trước ảnh để lúc chuyển cảnh không bị chớp trắng.
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => {
      console.warn('[assets] Không tải được ảnh:', url);
      resolve(); // không chặn game nếu thiếu một ảnh
    };
    img.src = url;
  });
}
