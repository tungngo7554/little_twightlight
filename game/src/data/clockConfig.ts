// Thông số câu đố đồng hồ. Chỉnh các số ở đây nếu kim bị lệch, sai cỡ hoặc quay sai tâm.
// Mở game bằng ?debug để thấy viền vùng kéo.

export const NEEDLE_URL = 'assets/items/clock_needle.png';

export const CLOCK = {
  // Tâm mặt đồng hồ trong cảnh hall_clock_close, tính theo % khung hình.
  // Cả hai kim quay quanh điểm này.
  centerX: 50.2,
  centerY: 55,

  // Bán kính vùng người chơi kéo kim, tính theo % CHIỀU NGANG khung hình.
  // (Vòng số trên mặt đồng hồ có bán kính khoảng 17.8, vùng kéo lớn hơn một chút.)
  faceRadius: 20,

  // Chiều cao ảnh kim phút, tính theo % chiều ngang khung hình (chiều rộng tự theo tỉ lệ ảnh).
  needleHeight: 20,

  // Điểm quay nằm ở đâu trong ảnh kim (0 = mép trái/trên, 0.5 = giữa, 1 = mép phải/dưới).
  // Ảnh kim vẽ thẳng đứng, đầu kim chỉ lên 12 giờ. Điểm quay là tâm cái nút tròn ở cuối kim
  // (đo từ clock_needle.png, kích thước 258 x 531: tâm nút ở khoảng x 123, y 415).
  pivotX: 0.477,
  pivotY: 0.78,

  // Kim giờ = cùng ảnh nhưng thu nhỏ: 1 = giữ nguyên, 0.65 = ngắn còn 65%.
  hourScaleX: 0.9, // độ dày
  hourScaleY: 0.65, // độ dài

  // Giờ đúng: 4 giờ 35 phút
  targetMinutes: 4 * 60 + 35,
};
