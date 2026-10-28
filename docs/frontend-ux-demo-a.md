# Luồng giao diện trực tiếp · Demo A

**Chỉnh theo phản hồi người dùng ngày 2026-10-26.** Đây là quyết định về cách trình bày và điều khiển frontend, không bổ sung gameplay ngoài Scope Baseline v1.0.

1. Khi vào lượt chơi, hiển thị thế giới 2D toàn khung. Người chơi điều khiển nhân vật trực tiếp, camera đi theo; HUD chỉ chứa thông tin thiết yếu và thanh hành động.
2. Bảng danh sách NPC, công việc và quản lý gia tộc không thường trực trên màn hình thế giới. Chúng chỉ xuất hiện khi người chơi vào từ đường của biệt viện.
3. Trước khi biệt viện được xây, vị trí công trình là nền/móng. Sau khi xây, tương tác gần cửa từ đường mở giao diện gia tộc; rời khỏi từ đường đóng giao diện và trả quyền điều khiển thế giới.
4. Bốn loại việc vẫn là `GATHER`, `CULTIVATE`, `GUARD`, `HUNT`; mỗi NPC tối đa một việc. Frontend chỉ gửi lệnh và hiển thị trạng thái backend xác nhận khi tích hợp thật.
5. Bản preview hiện dùng bộ mô phỏng frontend; thao tác xây, chiêu mộ, thắng/thua và lưu/tải chưa phải luật/backend MySQL. Chi phí, điều kiện NPC và ngưỡng kỹ thuật vẫn chờ chốt.

Asset môi trường vòng đầu gồm cây, cỏ, hoa, đá, nước, đất, cát. Xem [ghi chú asset](../frontend/assets/environment/README.md).

**Chỉnh ngày 2026-10-26:** sân cỏ dùng texture riêng phủ liên tục toàn bản đồ; cây, bụi cỏ, hoa và đá không đặt trong lòng sông hoặc lên lối đi. Khoảng cách đặt vật thể tính cả tán cây. Màu chính của HUD/menu/từ đường là nâu, vàng và be; màu xanh tập trung vào thế giới tự nhiên.

**Chỉnh nhân vật cùng ngày:** đúng hai lựa chọn người chơi, nam và nữ. Mỗi nhân vật có sprite đứng theo bốn hướng trước/sau/trái/phải; hướng hiển thị theo phím di chuyển. Tỷ lệ màn chơi tham khảo: nhân vật 48 đơn vị cao, đá 70–100, cây 160–210, hoa thấp hơn nhân vật. Bỏ bóng đổ dựng thêm dưới thực thể và hiệu ứng tối viền bản đồ. Chưa có khung hình hoạt họa chạy hay tấn công.
