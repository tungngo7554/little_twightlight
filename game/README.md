# Dự án game point and click

## Chạy thử trên máy
1. Giải nén thư mục này, mở bằng VS Code (File → Open Folder).
2. Mở terminal trong VS Code (Ctrl + `) và chạy:
   ```
   npm install
   npm run dev
   ```
3. Mở địa chỉ hiện ra (thường là http://localhost:5173) bằng Chrome.

## Chế độ debug (đặt vùng bấm)
- Bấm phím **D** để bật/tắt, hoặc thêm `?debug` vào đường dẫn (ví dụ http://localhost:5173/?debug).
- Chọn cảnh ở bảng debug, rồi **kéo chuột** trên ảnh để vẽ ô chữ nhật.
- Ô văn bản hiện `{ x, y, w, h }` theo % khung hình (và tự copy nếu trình duyệt cho phép).

## Cấu trúc
- `public/assets/scenes/` – ảnh nền
- `public/assets/items/`  – ảnh vật phẩm (nền trong suốt)
- `public/assets/audio/`  – âm thanh (để trống)
- `src/data/scenes.ts`    – danh sách cảnh
- `src/data/i18n.ts`      – chữ Việt/Anh
- `src/engine/`           – khung hình, debug, tải ảnh

## Đóng gói đăng itch.io (để sau)
`npm run build`, rồi nén **nội dung** thư mục `dist` thành zip.
