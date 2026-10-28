# Frontend · Tu Tiên Gia Tộc Demo A

Chạy bản xem trước giao diện bằng Node.js 20 trở lên:

```powershell
cd frontend
node server.mjs
```

Mở <http://127.0.0.1:4173>. Không cần cài package. Bản đồ lấy ảnh, lớp phủ và ô va chạm từ `assets/world/map.png`, `map_overlay.png`, `map.config.json` (v2, 3840×2560). Camera đi theo nhân vật; vị trí biệt viện, NPC và tài nguyên được đặt trên ô có thể đi lại. WASD/phím mũi tên di chuyển; `E` tương tác, `Space` tấn công, `G` thu thập, `C` tu luyện, `B` đột phá, `Esc` mở menu. Trên màn hình cảm ứng có nút di chuyển.

Đứng gần nền biệt viện và bấm `E` để dựng công trình trong bản mô phỏng. Đứng gần cửa sau khi xây và bấm `E` lần nữa để vào **từ đường**. Danh sách NPC và giao công việc chỉ có trong từ đường, không có bảng quản lý ngoài bản đồ.

## Ranh giới hiện tại

- Đây là **frontend preview** với `src/mock-service.js` làm nguồn trạng thái tạm thời. Giá trị tu vi, vị trí map, tên NPC, điều kiện chiêu mộ mẫu và kết quả thao tác không phải luật gameplay đã duyệt.
- `Lưu mẫu`/`Tải mẫu` dùng `localStorage` để kiểm tra giao diện. Chúng **chưa** gọi backend hoặc MySQL 8.4 và không đáp ứng FR-14/AC-10.
- Chi phí biệt viện, bốn NPC thủ công, điều kiện gia nhập, phạm vi chiến đấu, ngưỡng hồi phục và API chưa được chốt. Giao diện hiển thị nhãn rõ thay vì coi dữ liệu mẫu là thiết kế cuối.
- Khi backend sẵn sàng, thay `MockService` bằng adapter gửi lệnh và nhận snapshot xác nhận. Chuyển logic thắng/thua, hồi sinh, miễn sát thương, trừ tài nguyên và AI sang backend theo [bàn giao frontend](../docs/frontend-handoff-demo-a.md).
- Asset nằm trong `assets`; nguồn và giấy phép của asset tải về ở [LICENSES.md](assets/LICENSES.md), prompt và ghi chú bộ asset môi trường ở [environment/README.md](assets/environment/README.md).

Mở <http://127.0.0.1:4173/assets/environment/gallery.html> để xem riêng tám asset môi trường trên nền caro.

Ảnh bản đồ v2 là nền thế giới; các asset môi trường rời chỉ được dùng cho biểu tượng điểm tài nguyên. Bản v1 được giữ trong `assets/world/v1/`. Để tạo lại bản đồ, chạy `assets/world/map_generator_v2.py` và kiểm tra bằng `assets/world/validate_map.py`; Wolf Mind Sandbox sẽ đồng bộ ba tệp bản đồ khi chạy `dev`, `build`, `test`, `compare` hoặc `evaluate`.

Hai spritesheet người chơi 4 hướng nằm tại [player/](assets/player/README.md); xem [bảng nam và nữ](http://127.0.0.1:4173/assets/player/gallery.html). Trong menu tạm dừng có thể đổi nhân vật Nam/Nữ; nhân vật quay mặt theo phím di chuyển. Chưa có chuỗi khung hình chạy hoặc tấn công.
