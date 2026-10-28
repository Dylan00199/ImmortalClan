# TU TIÊN GIA TỘC — SCOPE DEMO A v1.0

**Trạng thái:** ĐÃ PHÊ DUYỆT — SCOPE FREEZE  
**Cơ sở:** BA-Demo-01 (29 quyết định), BA Clarification (EX-01–EX-06)  
**Database:** MySQL 8.4

## 1. Mục tiêu

Xây dựng web game tu tiên single-player, cho phép người chơi trực tiếp di chuyển, tu luyện, chiến đấu, chiêu mộ NPC, xây biệt viện và phân công công việc.

**Hoàn thành Demo:** Đồng thời có đủ 4 NPC còn sống, biệt viện tồn tại và nhân vật người chơi đã đột phá ít nhất một lần.

## 2. Phạm vi

- Một bản đồ 2D liền mạch, có vùng an toàn, tài nguyên, yêu thú và biệt viện.
- Một công pháp, một cảnh giới khởi đầu, một lần đột phá.
- Chiến đấu thời gian thực với HP, sát thương, hồi đòn.
- Đúng 4 NPC cố định, mỗi NPC có tính cách, lời thoại, điều kiện gia nhập thiết kế thủ công.
- Một biệt viện xây bằng tài nguyên, dùng để nghỉ ngơi và hồi sinh.
- Bốn công việc NPC: thu thập, tu luyện, canh gác, săn yêu thú.
- Lưu/tải tiến trình qua backend sử dụng MySQL 8.4.

## 3. Quy tắc nghiệp vụ

### Bản đồ và chiến đấu
- Người chơi điều khiển trực tiếp nhân vật, chủ động bấm tấn công.
- Yêu thú chỉ truy đuổi trong phạm vi cố định quanh điểm xuất hiện; vượt phạm vi thì quay về.
- NPC canh gác bảo vệ khu vực cố định và tấn công kẻ xâm nhập.
- NPC săn yêu thú chủ động tìm và chiến đấu với yêu thú.

### NPC
- Mỗi NPC có một công việc chính.
- NPC tự nghỉ khi mệt rồi quay lại công việc.
- NPC rút lui khi HP xuống dưới ngưỡng an toàn, ưu tiên về biệt viện.
- NPC hồi phục đến ngưỡng an toàn, chờ thêm một khoảng thời gian rồi tiếp tục.
- NPC chưa chiêu mộ được di chuyển trong vùng an toàn và không thể chết.

### Tử vong và hồi sinh
- Mỗi NPC đã gia nhập có tối đa một lượt hồi sinh trong toàn Demo.
- NPC tự hồi sinh tại biệt viện nếu còn lượt.
- NPC chết khi chưa có biệt viện ở trạng thái chết/chờ; xây biệt viện thì tự hồi sinh nếu còn lượt.
- NPC hồi sinh với HP và thể lực đầy, giữ công việc cũ, nghỉ một khoảng thời gian trước khi tiếp tục.
- NPC chết vĩnh viễn bị xóa công việc được giao.
- NPC bên trong biệt viện được bảo vệ khỏi sát thương.
- Người chơi chết sẽ hồi sinh tại biệt viện với HP và thể lực đầy, xóa mục tiêu chiến đấu; chưa có biệt viện thì kết thúc lượt chơi.

### Lưu/tải
- Cho phép lưu khi đang chiến đấu hoặc rút lui.
- Lưu HP, thể lực, công việc, lượt hồi sinh, trạng thái NPC, tài nguyên và tiến trình.
- Nếu đã có biệt viện, NPC đã gia nhập còn sống xuất hiện tại biệt viện khi tải và tiếp tục công việc cũ.
- Nếu chưa có biệt viện, NPC còn sống giữ vị trí đã lưu.
- NPC chết/chờ giữ trạng thái và lượt hồi sinh qua lưu/tải.
- Sau tải, đánh giá lại trạng thái thực tế: đủ điều kiện thì hoàn thành; không còn khả năng đạt mục tiêu thì thất bại; còn khả thi thì tiếp tục.

### Hoàn thành và thất bại
- Hoàn thành khi đồng thời có 4 NPC sống, biệt viện tồn tại và đã đột phá một lần.
- Nếu không còn khả năng hoàn thành, hiển thị thông báo và cho phép bắt đầu lượt chơi mới.
- Không cam kết chuyển dữ liệu Demo sang Alpha.

## 4. Functional Requirements

| ID | Yêu cầu |
|---|---|
| FR-01 | Khởi tạo phiên chơi single-player trên trình duyệt |
| FR-02 | Bản đồ 2D và di chuyển |
| FR-03 | Tu luyện và đột phá |
| FR-04 | Chiến đấu chủ động với HP, sát thương, hồi đòn |
| FR-05 | Yêu thú truy đuổi giới hạn và quay về |
| FR-06 | Bốn NPC cố định với điều kiện chiêu mộ riêng |
| FR-07 | Thu thập tài nguyên và xây biệt viện |
| FR-08 | Giao bốn loại công việc NPC |
| FR-09 | NPC nghỉ khi mệt rồi tiếp tục |
| FR-10 | NPC rút lui, hồi phục và chờ |
| FR-11 | NPC chưa gia nhập an toàn trong vùng an toàn |
| FR-12 | Hồi sinh NPC giới hạn một lần |
| FR-13 | Xử lý tử vong người chơi |
| FR-14 | Lưu/tải tiến trình với MySQL 8.4 |
| FR-15 | Kiểm tra điều kiện hoàn thành |
| FR-16 | Thông báo không thể hoàn thành và chơi lại |

## 5. Non-functional Requirements

| ID | Yêu cầu |
|---|---|
| NFR-01 | Chạy trên trình duyệt, single-player |
| NFR-02 | Backend dùng MySQL 8.4 |
| NFR-03 | Lưu/tải ổn định trong Demo |
| NFR-04 | Không cam kết tương thích Alpha |
| NFR-05 | Không mất hoặc nhân đôi tài nguyên, NPC, lượt hồi sinh khi lưu/tải |
| NFR-06 | Không kẹt vĩnh viễn trong di chuyển |
| NFR-07 | Điều khiển di chuyển/chiến đấu đủ mượt; ngưỡng đo chưa chốt |
| NFR-08 | Lỗi công việc NPC không làm hỏng tiến trình lưu |
| NFR-09 | Thắng/thua nhất quán sau khi tải |

NFR-05 đến NFR-09 là tiêu chí chất lượng đề xuất trong baseline; thông số đo cụ thể cần xác định ở thiết kế kỹ thuật.

## 6. Acceptance Criteria

| ID | Tiêu chí |
|---|---|
| AC-01 | Di chuyển bản đồ và giới hạn truy đuổi đúng |
| AC-02 | Tu luyện và đột phá thành công |
| AC-03 | Tấn công, sát thương và hồi đòn đúng |
| AC-04 | Chiêu mộ được cả 4 NPC |
| AC-05 | Xây biệt viện đúng chi phí |
| AC-06 | NPC thực hiện và tiếp tục công việc |
| AC-07 | Canh gác và săn yêu thú đúng vùng/hành vi |
| AC-08 | NPC rút lui, hồi phục và chờ đúng |
| AC-09 | NPC chỉ hồi sinh tối đa một lần |
| AC-10 | Lưu/tải khôi phục dữ liệu và vị trí theo ngoại lệ |
| AC-11 | Người chơi chết được xử lý đúng |
| AC-12 | Hoàn thành chỉ khi đủ ba điều kiện đồng thời |
| AC-13 | Không thể hoàn thành thì thông báo và cho phép chơi lại |

## 7. Ngoại lệ đã duyệt

| Mã | Quy tắc |
|---|---|
| EX-01 | Chưa có biệt viện: NPC còn sống giữ vị trí đã lưu |
| EX-02 | NPC chết/chờ giữ trạng thái và lượt hồi sinh; xây biệt viện tự hồi sinh |
| EX-03 | NPC chết vĩnh viễn bị xóa công việc |
| EX-04 | NPC trong biệt viện được miễn sát thương |
| EX-05 | Người chơi hồi sinh đầy HP/thể lực, xóa mục tiêu chiến đấu |
| EX-06 | Sau tải đánh giá lại điều kiện hoàn thành/thất bại |

## 8. Ngoài phạm vi

- Multiplayer, mô phỏng thế giới liên tục khi offline.
- Gia phả, hôn nhân, sinh con, kế vị, pháp lý gia tộc.
- Chính trị, chiến tranh, ngoại giao, quốc gia.
- Mô phỏng ký ức, tâm lý và quan hệ NPC chuyên sâu.
- Nhiều công pháp, cảnh giới, hệ thống trang bị hoặc đội hình phức tạp.
- Chuyển dữ liệu Demo sang Alpha.
- Phe phái và tranh quyền nội bộ: loại bỏ vĩnh viễn cả Demo, Alpha, Future.

## 9. Điểm kỹ thuật cần đặc tả

- Thứ tự xử lý lưu/tải, chết/chờ, hồi sinh và kiểm tra thắng/thua.
- Ranh giới vùng bảo vệ biệt viện.
- Ngưỡng HP, thể lực, thời gian nghỉ, phạm vi truy đuổi và chi phí xây dựng.
- Tính nhất quán transaction khi lưu/tải.
- Xử lý mục tiêu chiến đấu không còn tồn tại sau tải.

Các điểm trên là chi tiết thiết kế, không cho phép tự mở thêm gameplay.

## 10. Quy tắc thay đổi

Scope Baseline Demo A v1.0 đã được duyệt và khóa. Mọi bổ sung gameplay phải được đánh giá tác động và phê duyệt riêng trước khi triển khai.
