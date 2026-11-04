# PROJECT NOTES – Game point and click (phong cách Rusty Lake)

> Dán file này vào đầu mỗi cuộc trò chuyện mới với Claude, kèm CHỈ những file cần sửa.
> Cập nhật mục "Trạng thái" sau mỗi bước.

## 1. Tổng quan
- Web game 2D point-and-click, giải đố, ít chữ, tông u sầu, không jumpscare. Đăng lên itch.io (zip chứa index.html).
- Cốt truyện: người cha tìm con gái (Venica) trong biệt thự lúc chiều tà. Sự thật: con đã mất trong hoả hoạn do sự quản thúc của ông; ông tự tạo ảo ảnh. 5 hồi, kết thúc vòng lặp: ông khoá cửa thư phòng từ bên trong bằng chính chìa ban đầu, giấu chìa phòng con gái dưới gầm bàn, ngồi vào ghế và gục chết.
- Bản đồ: Thư phòng ↔ Hành lang tầng 2 ↔ Phòng con gái (khoá vĩnh viễn); Hành lang → cầu thang → Sảnh chính ↔ Phòng khách / Nhà bếp ↔ Nhà kính.
- Phạm vi hiện tại: chỉ làm Thư phòng → Hành lang tầng 2, các khu vực khác làm sau.

## 2. Cách làm việc
- Vibe code trong chat (gói Free, không dùng Claude Code). Claude gửi file/zip, người dùng chép đè vào dự án, `npm run dev`.
- Người dùng mới hoàn toàn về code. Windows + Linux. Đã cài Node, VS Code, Git. Dự án đã đẩy lên GitHub.
- Claude không cài được npm trong môi trường của nó; kiểm tra bằng tsc + esbuild + Playwright. Vite chỉ chạy trên máy người dùng.
- Luôn hỏi trước khi làm điều chưa rõ. Mỗi bước phải chạy thử được.

## 3. Quyết định đã chốt
- Tech: Vite + TypeScript thuần (không engine). `base: './'` cho itch.io.
- Khung 16:9 cố định, mọi ảnh 16:9 (kích thước pixel có thể khác nhau). Vùng bấm/vị trí tính theo **phần trăm** khung hình.
- Ảnh PNG. Kết hợp full background swap + overlay (overlay phải cùng kích thước với ảnh nền của cảnh đó).
- Ánh sáng: code phủ màu theo **hồi** (không theo đồng hồ thật); chỉ vẽ riêng vài cảnh then chốt.
- Ngôn ngữ: Việt (mặc định) + Anh. Gần như không chữ.
- Ô chữ nằm ở **trên cùng**: hiện từng ký tự; câu mô tả tự tắt sau vài giây; chuỗi thoại bắt buộc bấm từng câu (bấm 1: hiện đủ, bấm 2: sang câu). Nghĩ = chữ nghiêng. Tiếng động = chữ mô tả `*cốc cốc cốc*`. Venica = ô hồng nhạt trong suốt. Cha và Venica là hai nhân vật duy nhất.
- Thanh vật phẩm ở **dưới**. Vật phẩm mặc định tiêu hao (dùng xong biến mất); **chìa khoá thư phòng không tiêu hao**, ở đến hết game.
- Chú thích nhặt đồ: góc trên phải, chữ trắng, ~3 giây.
- Điều hướng: mũi tên luôn hiện nhẹ (điện thoại không có hover). Chuyển cảnh ngắt quãng như lật album ảnh.
- Lưu tiến trình bằng localStorage (phòng, vật phẩm, trạng thái puzzle), có nút "Chơi mới". Làm ở bước 6.
- Tên nhân vật: **Venica**. Đừng đặt vùng bấm sát mép trên khung (khoảng 10% chiều cao, chỗ ô chữ).

## 4. Cấu trúc file
```
index.html, package.json, tsconfig.json, vite.config.ts
public/assets/scenes/   bg_study_sunset_locked.png, bg_study_sunset_open.png,
                        bg_study_under_desk_key.png, bg_study_under_desk.png, bg_hall_2nd.png
public/assets/items/    study_room_lock.png (nền trong suốt)
public/assets/audio/    (trống; gõ cửa: data/audio.ts knock: null)
src/main.ts             khởi động, màn hình bắt đầu, nối các hệ thống, danh sách nút debug
src/style.css
src/data/scenes.ts      SceneId: study_locked | study_open | desk_key | desk_empty | hall_2nd
src/data/i18n.ts        chữ giao diện Việt/Anh, nhớ ngôn ngữ (t, getLang, setLang)
src/data/dialogue.ts    LINES (voice + vi + en), INTRO, getLine
src/data/items.ts       ITEMS (consumable, tên Việt/Anh), itemUrl
src/data/audio.ts       AUDIO_FILES (null = chưa có file)
src/engine/stage.ts     khung 16:9, setScene, toPercent, onSceneChange
src/engine/dialogue.ts  Dialogue.show(id) tự tắt; Dialogue.play(ids) bắt buộc bấm
src/engine/inventory.ts Inventory add/remove/has/select/deselect/consume/getState/setState
src/engine/toast.ts     Toast.show(text, ms)
src/engine/audio.ts     AudioPlayer.play(id)
src/engine/debug.ts     phím D hoặc ?debug: chọn cảnh, kéo vẽ vùng → { x, y, w, h } (%)
```
Mẹo thử nhanh: `?skipintro` bỏ qua đoạn thoại mở đầu.

## 5. Luồng game cần làm ở BƯỚC 4 (Thư phòng → Hành lang)
Mở đầu (đã làm): 8 câu, bấm từng câu: "Uhh... đầu của mình... đau quá" / *Chiều muộn rồi sao? Mình ngủ quên à?* / *cốc cốc cốc* / "Vào đi" / *cốc cốc cốc* / *Chuyện gì vậy nhỉ?* / Venica: "Ba ơi?" / "Venica?"

Cảnh `study_locked` (cửa đóng):
- Bấm cửa khi chưa chọn chìa → thoại nghĩ: "Không mở được cửa? Mình không nhớ là đã khóa trong."
- Bấm bàn → sang `desk_key`.

Cảnh `desk_key` (cận cảnh bàn, còn chìa):
- Sách → nghĩ: "Sách đang mở? Mình đã đọc sách rồi ngủ quên chăng?"
- Bút → nghĩ: "Những cái bút chưa được đóng lại"
- Địa cầu → nghĩ: "Nước Anh"
- Chìa → vào túi đồ (`study_room_lock`), toast "Chìa khóa thư phòng" ~3s, lập tức sang `desk_empty`.
- Bấm ra sàn dưới bàn → về `study_locked`.
- Ở `desk_empty`: sách/bút/địa cầu vẫn bấm được như trên.

Dùng chìa:
- Bấm chìa trong túi để chọn, giữ trạng thái chọn. Bấm ra ngoài vùng cửa → hủy chọn (nếu bấm đúng bàn/vật khác thì vừa hủy chọn vừa thực hiện hành động).
- Chọn chìa + bấm đúng cửa → sang `study_open` ngay. Chìa KHÔNG biến mất.

Cảnh `study_open`:
- Bấm bàn → `desk_empty` (không còn chìa), sách/bút/địa cầu vẫn tương tác được.
- Bấm vào phía ngoài cửa → sang `hall_2nd`, hiện nghĩ: "Hành lang… sao im lặng thế này?" Không mũi tên, tạm kết thúc.

## 6. Lộ trình & trạng thái
1. ✅ Khung 16:9, màn hình bắt đầu, cảnh thư phòng, debug
2. ✅ Ô chữ ở trên, thanh vật phẩm ở dưới, đoạn thoại mở đầu
3. ⬜ Vùng bấm, cận cảnh bàn, nhặt chìa, dùng chìa, sang hành lang (BƯỚC 4)
4. ⬜ Mũi tên điều hướng
5. ⬜ Lưu/tải tiến trình, "Chơi mới", đoạn mở đầu chỉ chạy một lần
6. ⬜ Lớp màu hoàng hôn theo hồi, chuyển cảnh, âm thanh
7. ⬜ Nội dung các khu vực khác; đóng gói và đăng itch.io

## 7. Lưu ý còn mở
- Ảnh còn watermark ngôi sao AI ở góc dưới phải: người dùng sẽ tự xoá trước khi đăng. itch.io có mục khai báo nội dung AI.
- Bản tiếng Anh trong `data/dialogue.ts` là bản nháp, cần người dùng duyệt.
- Chưa có âm thanh. Chưa có ảnh phòng con gái, sảnh, phòng khách, bếp, nhà kính.
- Chưa quyết: chìa phòng con gái lấy ở đâu; danh sách puzzle hồi 2–3.
- Nội dung nhạy cảm (mất mát, tử vong) → ghi chú nội dung trên trang itch.io.
