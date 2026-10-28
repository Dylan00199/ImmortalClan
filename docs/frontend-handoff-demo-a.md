# Bàn giao để bắt đầu frontend — Demo A

**Cơ sở:** [Scope Baseline v1.0 đã duyệt](scope-baseline-demo-a-v1.0.md), [System Design](system-design-demo-a.md), [hợp đồng Save/Load](save-load-contract-demo-a.md). Tài liệu này chốt **phạm vi giao diện** để bắt đầu triển khai; không thêm gameplay.

## Phần giao diện nằm trong scope

| Khu vực/luồng | Yêu cầu và AC | Hiển thị/thao tác cần có |
|---|---|---|
| Vào lượt chơi | FR-01, NFR-01 | Bắt đầu phiên single-player trong trình duyệt; nhận trạng thái ban đầu từ backend. |
| Bản đồ 2D | FR-02, FR-05, AC-01 | Vẽ bản đồ liền mạch, vùng an toàn, tài nguyên, yêu thú, biệt viện, player và bốn NPC; điều khiển di chuyển trực tiếp. |
| Chiến đấu | FR-04, AC-03 | Người chơi chủ động bấm tấn công; hiển thị HP, trạng thái hồi đòn và kết quả sát thương do backend xác nhận. |
| Tu luyện | FR-03, AC-02 | Hiển thị tiến trình một công pháp, cảnh giới khởi đầu và trạng thái đột phá một lần. |
| NPC và công việc | FR-06, FR-08–FR-12, AC-04/06–09 | Hiển thị bốn NPC thủ công, trạng thái chưa/đã gia nhập, điều kiện gia nhập/lời thoại đã được thiết kế, một trong bốn việc, nghỉ/rút lui/hồi phục/chờ, chết/chờ hoặc chết vĩnh viễn. |
| Tài nguyên/biệt viện | FR-07, AC-05 | Hiển thị tài nguyên và chi phí đã chốt; thao tác xây một biệt viện; thể hiện vùng bảo vệ/nghỉ. |
| Save/Load | FR-14, AC-10, NFR-03/05 | Chọn bản lưu theo cơ chế kỹ thuật được chốt; hiển thị kết quả/lỗi; sau Load thay toàn bộ trạng thái đang hiển thị. |
| Kết quả | FR-15/16, AC-11–13 | Hiển thị hoàn thành khi đủ ba điều kiện đồng thời; khi không thể hoàn thành, thông báo và cho phép bắt đầu lượt chơi mới. |

Không thiết kế giao diện cho các mục ngoài scope của baseline: multiplayer, gia phả, hôn nhân, chính trị, phe phái, nhiều công pháp/cảnh giới, trang bị hoặc chuyển dữ liệu sang Alpha.

## Hợp đồng dữ liệu frontend cần nhận

| Nhóm | Dữ liệu tối thiểu |
|---|---|
| Run | ID phiên, kết quả `IN_PROGRESS` / `COMPLETED` / `FAILED`, game tick hoặc thời gian hiển thị. |
| Bản đồ | Phiên bản nội dung, hình học vùng an toàn/biệt viện, vị trí thực thể và node tài nguyên, thông tin hiển thị yêu thú. |
| Player | Vị trí, HP/max, thể lực/max, tiến trình tu luyện, đã đột phá hay chưa, hồi đòn còn lại, mục tiêu chiến đấu hợp lệ nếu có. |
| Bốn NPC | Slot/định danh, tên/nội dung thủ công, trạng thái gia nhập/sinh tử, HP/thể lực, công việc `GATHER` / `CULTIVATE` / `GUARD` / `HUNT` hoặc rỗng, hoạt động/nghỉ/rút lui/chờ, lượt hồi sinh đã dùng, vị trí nếu hiện diện. |
| Tài nguyên/biệt viện | Tồn kho tài nguyên, chi phí hiển thị, đã xây hay chưa. |
| Save/Load | Slot hoặc revision có thể chọn, trạng thái đang xử lý, thành công/lỗi và trạng thái đầy đủ sau Load. |

Đây là **hợp đồng ý nghĩa**, chưa chốt tên trường JSON, URL API hoặc kiểu thời gian truyền qua mạng. Frontend không tự tính kết quả thắng/thua, lượt hồi sinh, miễn sát thương, trừ chi phí hay AI. Khi lệnh trả về, dùng trạng thái backend xác nhận để cập nhật màn hình; nếu Save/Load lỗi, giữ trạng thái đang hiển thị và báo lỗi.

## Thứ tự triển khai frontend có thể bắt đầu

1. Khởi tạo ứng dụng browser single-player, lớp hiển thị bản đồ 2D, lớp UI/HUD và lớp trao đổi trạng thái backend. Chọn framework/engine là **quyết định kỹ thuật**, không đổi luật chơi.
2. Dựng bố cục và dữ liệu hiển thị cho player, bốn NPC, công việc, tài nguyên, biệt viện, tu luyện, Save/Load và kết quả theo bảng trên. Dùng dữ liệu giả có nhãn rõ cho nội dung thủ công/giá trị ngưỡng chưa chốt.
3. Nối thao tác người chơi với lệnh backend khi hợp đồng API được xác nhận; không gắn logic thắng/thua hoặc hồi sinh ở frontend.
4. Chạy từng AC-01..AC-13 và các ca SL-01..SL-15. Giữ dữ liệu combat/retreat và việc NPC nhất quán sau Save/Load.

## Nội dung/giá trị cần chốt song song, không chặn bộ khung UI

| Mục | Cần cho phần nào |
|---|---|
| Bản đồ/vùng an toàn/biệt viện, asset 2D và bốn NPC thủ công | Vẽ thế giới, lời thoại và điều kiện gia nhập. |
| Ngưỡng HP/thể lực, thời gian nghỉ/chờ, phạm vi yêu thú/guard/hunt, chi phí xây | Hiển thị đúng giá trị, điều chỉnh UI và nghiệm thu. |
| Phím/nút điều khiển, bố cục responsive, ngưỡng mượt NFR-07 | Thiết kế tương tác và kiểm tra hiệu năng. |
| Số save slot, khả năng chọn revision cũ, lỗi hiển thị, API contract | Hoàn thiện Save/Load UI. |
| Framework/engine frontend, giao thức cập nhật thời gian thực và định dạng trạng thái truyền mạng | Khởi tạo dự án và tích hợp backend. |

**Kết luận bàn giao:** FR-01..FR-16, AC-01..AC-13 và EX-01..EX-06 đã có nguồn trong repo; **có thể bắt đầu frontend trong đúng scope**. Các giá trị/nội dung ở bảng cuối cần chốt trước khi coi từng luồng gameplay là hoàn tất nghiệm thu. Không cần chờ chúng để dựng bộ khung, bản đồ và UI trạng thái.
