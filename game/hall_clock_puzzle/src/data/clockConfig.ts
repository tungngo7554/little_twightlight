// Thông số câu đố đồng hồ. Chỉnh các số ở đây nếu kim bị lệch, sai cỡ hoặc quay sai tâm.
// Mở game bằng ?debug để thấy viền vùng kéo.

export const NEEDLE_URL = 'assets/items/clock_needle.png';

export const CLOCK = {
  // Tâm mặt đồng hồ trong cảnh hall_clock_close, tính theo % khung hình.
  // TODO: toạ độ tạm, chỉnh theo ảnh thật bằng chế độ debug
  centerX: 50,
  centerY: 50,

  // Bán kính vùng người chơi kéo kim, tính theo % CHIỀU NGANG khung hình.
  faceRadius: 22,

  // Chiều cao ảnh kim phút, tính theo % chiều ngang khung hình (chiều rộng tự theo tỉ lệ ảnh).
  needleHeight: 20,

  // Điểm quay nằm ở đâu trong ảnh kim (0 = mép trái/trên, 0.5 = giữa, 1 = mép phải/dưới).
  // Ảnh kim vẽ thẳng đứng, đầu kim chỉ lên 12 giờ.
  pivotX: 0.5,
  pivotY: 0.5,

  // Kim giờ = cùng ảnh nhưng thu nhỏ: 1 = giữ nguyên, 0.65 = ngắn còn 65%.
  hourScaleX: 0.9, // độ dày
  hourScaleY: 0.65, // độ dài

  // Giờ đúng: 4 giờ 35 phút
  targetMinutes: 4 * 60 + 35,
};
