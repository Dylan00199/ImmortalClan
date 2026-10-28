# Tiên Tộc Alpha 2.0 — đánh giá quy mô và tính khả thi

**Ngày đánh giá:** 27/10/2026  
**Trạng thái:** BA đang làm rõ, chưa khóa PRD  
**Nguồn:** [About Game — Working Draft v2.0](about-game-working-draft-v2.0.md); đối chiếu [Demo A đã duyệt](../scope-baseline-demo-a-v1.0.md) và trạng thái repository hiện tại.

## Kết luận

Alpha 2.0 **khả thi về mặt kỹ thuật** nếu phát triển theo các mốc tích hợp, đo tải và khóa quy tắc nghiệp vụ trước khi triển khai các giao dịch liên quan. Phạm vi này là một game multiplayer có bốn bản đồ trên mỗi server, thế giới tiếp tục chạy khi người chơi offline, hai kiểu chiến đấu, vòng đời gia tộc, chuyển hồn, hồi sinh, tiến hóa, sinh sản và pháp bảo. Đây là bước mở rộng lớn từ Demo A single-player, một bản đồ, bốn NPC cố định và không mô phỏng offline. Mã hiện có là frontend preview và sandbox hành vi; `backend/` chưa có Simulation Core, còn schema MySQL hiện là bản nháp cho Demo A. Vì vậy **có thể tiếp tục BA ngay**, nhưng chưa đủ điều kiện khóa PRD, schema hay cam kết lịch phát hành toàn bộ Alpha.

## Biên quy mô đã nêu rõ

| Đơn vị | Giới hạn trong Working Draft | Ý nghĩa BA |
|---|---:|---|
| Bản đồ/server | 4 | Cần chuyển bản đồ, vị trí cư trú, lịch mô phỏng theo từng vùng. |
| Gia tộc/bản đồ cư trú | 3 | Quyết định BA-A2-D01 đã xác nhận cách tính theo nơi cư trú chính. |
| Gia tộc/server | 12 | Đây là giới hạn gia tộc, chưa phải giới hạn số tài khoản hoặc yêu thú hoang. |
| Suất/gia tộc | 10 | Gồm thú sống, thú DEAD đã được cấp phép và suất thai kỳ; quy tắc DEAD chưa cấp phép còn chờ chốt. |
| Suất gia tộc/server | Tối đa 120 | Chỉ là phép nhân 12 × 10; không phải 120 thực thể duy nhất trong thế giới. |
| Cảnh giới triển khai | 2 đại cảnh giới × 4 giai đoạn | Dừng ở Ngưng Đan Viên mãn 100%; ba cảnh giới sau là Future. |
| Phẩm pháp bảo thường | 4 phẩm × 3 bậc = 12 bậc | Ngưỡng và chi phí từng bậc chưa chốt. |
| Đồng hồ | 2 loại | Đồng hồ thực của server và giờ trong game phải được phân biệt ở mọi sự kiện. |

Các giới hạn trên làm bài toán có biên nhưng chưa cho biết số người online đồng thời, số thú hoang/vật phẩm/tiến trình trên mỗi bản đồ và tần suất mô phỏng. Chưa thể suy ra yêu cầu máy chủ hoặc chi phí vận hành từ 12 gia tộc.

## Nguồn độ phức tạp

| Nhóm | Mức độ | Lý do và điều kiện đi tiếp |
|---|---|---|
| Server có thẩm quyền, multiplayer, chuyển bản đồ | Rất cao | Nhiều người cùng hành động, tranh khai sáng và tài nguyên, điều khiển thủ lĩnh; cần xác định thứ tự và xử lý lệnh trùng. |
| Đồng hồ offline, hồi sinh, tiến hóa, giải tán | Rất cao | Mốc 10 phút, 24 giờ, 3 ngày, 7 ngày chạy theo thời gian thực cả khi client đóng; phải phục hồi đúng sau khi server khởi động lại. |
| Hai hệ chiến đấu và chuyển trạng thái | Rất cao | Chiến đấu thời gian thực và chiến tranh theo lượt có chung HP, linh lực, debuff và quyền điều khiển. |
| Vòng đời linh hồn, thủ lĩnh, pháp bảo, gia tộc | Rất cao | Chết, chuyển hồn, gia tộc không có thủ lĩnh, mất biệt viện, phá pháp bảo và Game Over có thể trùng thời điểm. |
| Tu luyện, đột phá, Yêu Đan, tiến hóa | Cao | Nhiều điều kiện và hiệu ứng chỉ số; công thức, ngưỡng và thứ tự áp dụng còn mở. |
| Huyết mạch, sinh sản, chiêu mộ | Cao | Cần định nghĩa nội dung, xác suất, biến thể và phép giữ suất đồng thời. |
| AI thủ lĩnh và FSM thú thường | Cao | Quyền quyết định của thủ lĩnh, chi phí và độ ổn định của AI chưa định lượng; thú thường đã giới hạn ở FSM. |
| Web, ứng dụng, nội dung bốn bản đồ | Cao | Cần xác nhận ứng dụng là cùng một client đóng gói hay sản phẩm native riêng, và số lượng nội dung Alpha ở mỗi khu vực. |

## Đánh giá khả thi và nguồn lực

- Kiến trúc đề xuất cho BA: một Simulation Core trên server quyết định trạng thái; client gửi lệnh và hiển thị kết quả. Đây phù hợp với nguyên tắc §19 của Working Draft. MySQL 8.4 phù hợp để lưu các thực thể, mốc thời gian và giao dịch, nhưng lựa chọn tần suất mô phỏng/snapshot cần đo thử; không dùng giới hạn 12 gia tộc để giả định hệ thống tự động nhẹ.
- Các thao tác tranh chấp như khai sáng một lần, chiếm suất gia tộc, tiêu hao bảo vật, chuyển quyền điều khiển và nhận chiến lợi phẩm cần một kết quả có thẩm quyền và xử lý lệnh gửi lặp. MySQL InnoDB có locking reads để hỗ trợ giao dịch; quy tắc nghiệp vụ vẫn phải định nghĩa bên thắng và các nhánh lỗi ([MySQL 8.4 — Locking Reads](https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html)).
- Các mốc thời gian thực nên lưu thời điểm tuyệt đối và có cách xử lý khi worker/server khởi động lại. Đây là suy luận thiết kế từ yêu cầu offline của bản thảo, chưa phải quyết định gameplay mới.
- Ước lượng thô để thảo luận năng lực, **không phải cam kết**: một nhóm 4–6 người làm toàn thời gian với năng lực backend realtime, frontend game, QA và vận hành có thể cần khoảng **9–18 tháng hoặc hơn** để đạt Alpha có đủ hệ thống và nội dung. Một người làm độc lập có thể cần **nhiều năm**. Khoảng này thay đổi mạnh theo mức độ hoàn thiện art, số loài/kỹ năng/nhánh tiến hóa, yêu cầu ứng dụng, số người chơi đồng thời và chất lượng vận hành.

## Trình tự BA và triển khai đề xuất

1. Chốt vòng đời server/gia tộc/thủ lĩnh/pháp bảo, suất cư trú và hai đồng hồ. Đây là nhóm quy tắc nền cho toàn bộ trạng thái.
2. Chốt giao thức lệnh, quyền điều khiển, combat thời gian thực, chiến tranh theo lượt và thứ tự sự kiện đồng thời.
3. Chốt tiến triển tu luyện, đột phá, tiến hóa, sinh sản, hồi sinh, phẩm pháp bảo cùng dữ liệu cân bằng cần thiết.
4. Đóng gói thành một lát cắt multiplayer chạy xuyên từ client đến server và MySQL, có khởi động lại và phục hồi; mở rộng dần đến đủ bốn bản đồ và các hệ Alpha đã duyệt.
5. Đo bằng thử tải với số người online, thú hoang, lệnh/giây và các phiên offline được xác định. Chỉ sau phép đo mới đặt NFR cụ thể.

Trình tự này là kế hoạch kiểm soát phụ thuộc, không tự loại bỏ tính năng Alpha. [Sổ BA](ba-decision-register.md) ghi các quyết định đã chốt và các câu hỏi phải giải quyết trước khi khóa PRD.
