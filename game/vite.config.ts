import { defineConfig } from 'vite';

// base './' để game chạy được khi đưa lên itch.io (đường dẫn tương đối)
export default defineConfig({
  base: './',
  server: { host: true }, // cho phép mở bằng điện thoại cùng mạng wifi
  build: { assetsInlineLimit: 0 },
});
