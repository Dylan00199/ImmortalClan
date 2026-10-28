# Tiên Tộc Alpha 2.0 — Gameplay Rules Catalog

**Trạng thái:** Bản tạm; chỉ các dòng ghi **Đã duyệt** là luật Alpha.
**Cập nhật:** 28/10/2026
**Nguồn phạm vi:** [PRD Alpha 2.0](prd-alpha-2.0.md) · [Sổ quyết định BA](ba-decision-register.md)
**Trị số:** [Balance Tables](balance-tables.md) · **Danh mục:** [Content Catalog](content-catalog.md)

Mỗi luật có mã ổn định để đối chiếu với yêu cầu `FR-*`. Khi một trị số thay đổi, cập nhật `balance-tables.md` và ghi quyết định thay đổi vào sổ BA. Các ô TBD chưa phải luật có thể triển khai.

## 1. Thế giới và sở hữu

| ID | Trạng thái | Điều kiện → kết quả | Truy vết |
|---|---|---|---|
| GR-WOR-01 | Đã duyệt | Mỗi server có bốn bản đồ ở `content-catalog.md`; tối đa ba gia tộc có nơi cư trú chính trên một bản đồ và 12 gia tộc/server. Thành viên đi qua bản đồ khác không chiếm suất cư trú. | FR-03, FR-04 |
| GR-WOR-02 | Đã duyệt | Đổi nơi cư trú chỉ thành công khi đích hợp lệ và còn suất; chiếm suất mới và nhả suất cũ trong cùng giao dịch server. Gia tộc mất biệt viện giữ suất cư trú trong hạn khôi phục. | FR-04, FR-16 |
| GR-WOR-03 | Đã duyệt | Cá chỉ đi trên ô nước và lối nối vùng nước hợp lệ giữa các bản đồ. Rùa có thể lên cạn. Tuyến sông–Biển Đông và tương thích nước ngọt/nước mặn phải được đánh dấu trong dữ liệu bản đồ. | FR-03, BA-RES-Q08 |
| GR-WOR-04 | Đã duyệt | Thời gian game và mọi hạn thời gian thực dùng đồng hồ server theo `BAL-TIME-*`; sự kiện đồng mốc ưu tiên giải tán gia tộc. | FR-10, FR-16 |

## 2. Pháp bảo, thủ lĩnh và thành viên

| ID | Trạng thái | Điều kiện → kết quả | Truy vết |
|---|---|---|---|
| GR-CLAN-01 | Đã duyệt | Mỗi người chơi sở hữu một gia tộc, chọn một trong ba mảnh pháp bảo khởi đầu và khai sáng một con sói làm thủ lĩnh. Tranh cùng mục tiêu khai sáng chỉ có một kết quả thắng. | FR-01 |
| GR-CLAN-02 | Đã duyệt | Chỉ thủ lĩnh có ý thức, trí nhớ và hệ quyết định có quy tắc. Thú thành viên dùng State Machine. Lệnh trực tiếp hợp lệ của chủ sở hữu được ưu tiên. | FR-01, FR-10 |
| GR-CLAN-03 | Đã duyệt | Gia tộc dùng tối đa 100 suất: thú sống gồm thủ lĩnh + thú `DEAD` đã được cấp phép hồi sinh + suất thai kỳ. Thú `DEAD` chưa cấp phép không chiếm suất. Mọi tranh suất do server phân xử và không vượt trần. | FR-05 |
| GR-CLAN-04 | Đã duyệt | Người chơi có thể xuất hồn chỉ để quan sát xuyên bản đồ, thấy hồn người chơi khác nhưng không tác động thế giới. Nhập hồn trực tiếp vào thủ lĩnh chưa có trong Alpha. | FR-18 |

## 3. Chiêu mộ và sinh sản

| ID | Trạng thái | Điều kiện → kết quả | Truy vết |
|---|---|---|---|
| GR-REC-01 | Đã duyệt | Thủ lĩnh tương tác trực tiếp với thú hoang thuộc tám nhóm chiêu mộ được, còn sống, chưa từng được chiêu mộ và không đang chiến đấu; gia tộc có biệt viện hợp lệ và suất trống → thành công chắc chắn, không tốn tài nguyên. | FR-06, BA-REC-01 |
| GR-REC-02 | Đã duyệt | Mất biệt viện → tạm chặn chiêu mộ. Tầng con mồi nền không thể chiêu mộ. Một thú từng được bất cứ gia tộc nào chiêu mộ không thể được chiêu mộ lại. | FR-06, BA-REC-02–03 |
| GR-REC-03 | Đã duyệt | Hai yêu cầu cùng tranh thú hoặc suất cuối → yêu cầu hợp lệ được server ghi nhận trước thắng. Thú mới tự đi tới biệt viện, có thể liên bản đồ; sau định cư mới nhận nhiệm vụ. | FR-05, FR-06 |
| GR-REP-01 | Đã duyệt | Hai thú trưởng thành cùng loài, một đực và một cái, còn sống và còn suất → bắt đầu thai kỳ, giữ ngay một suất, sau hạn sinh đúng một con và chuyển suất giữ sang con non. | FR-07 |
| GR-REP-02 | Đã duyệt | Mẹ chết → hủy thai kỳ và trả suất. Bố chết sau khi thai kỳ bắt đầu → thai kỳ tiếp tục. Thủ lĩnh chết không tự hủy thai kỳ. Gia tộc giải tán → kết thúc tiến trình. Thai kỳ không tăng nhu cầu thức ăn/nước trong Alpha. | FR-07, BA-RES-Q02 |
| GR-REP-03 | TBD một phần | Tuổi trưởng thành và tỷ lệ di truyền/đột biến còn chờ cân bằng. Alpha không có huyết mạch/thể chất ẩn hoặc thức tỉnh. | FR-07, Phụ lục A PRD |

## 4. Đói, khát và sinh thái

| ID | Trạng thái | Điều kiện → kết quả | Truy vết |
|---|---|---|---|
| GR-SUR-01 | Đã duyệt | Mọi thú sống, kể cả thú hoang và con mồi, có Đói/Khát giảm theo đồng hồ thực server. Thức ăn phù hợp lấp Đói; nước hợp lệ lấp Khát. Săn, ăn thức ăn thường không tự tăng tu vi. | FR-19 |
| GR-SUR-02 | Đã duyệt | Đói hoặc Khát về 0 → giảm di chuyển/công kích; duy trì ở 0 đủ thời gian → mất HP dần, có thể chết. Hai thanh cùng 0 chỉ áp dụng một hình phạt; bổ sung đủ để cả hai trên 0 thì dừng. Trị số ở `BAL-SUR-*`. | FR-19, BA-RES-Q01/Q06 |
| GR-SUR-03 | Đã duyệt | `EVOLVING` hoặc `DEAD` → Đói/Khát đóng băng; hồi sinh hoặc bắt đầu chiến tranh → hai thanh đầy. Khi chuyển thủ lĩnh sang thân xác sống, giữ Đói/Khát của thân xác nhận. | FR-13, FR-15, FR-19 |
| GR-SUR-04 | Đã duyệt | Thú gia tộc tự kiếm ăn cả khi chủ online/offline; chỉ tự lấy thức ăn phù hợp từ kho khi chủ bật quyền cho phép ăn kho. Thú hoang không lấy đồ kho. Khi nguy hiểm, FSM ưu tiên phòng vệ; sau đó nhu cầu cấp thiết rồi nhiệm vụ thường. Nhiều nguồn hợp lệ → ưu tiên nguồn tiếp cận được không cần giao đấu, sau đó mới xét con mồi hoang có thể hạ, ít rủi ro và gần hơn. | FR-10, FR-19; OPEN-02, BA-RES-Q12 |
| GR-SUR-05 | Đã duyệt | Cá trong nước phù hợp luôn đầy Khát và không lên đất. Rùa trong nước phù hợp đầy Khát; trên cạn dùng hạn Khát của thú cạn. Loại nước ngọt/mặn/cả hai được gắn khi cá thể xuất hiện. Nước mặn không làm đầy Khát của thú cạn. | FR-03, FR-19; OPEN-08 |
| GR-SUR-06 | Đã duyệt | Chỉ thú hoang bị giết cho thịt; chết tự nhiên/Đói/Khát hoặc thú gia tộc chết không cho thịt trong Alpha. Bậc thịt theo cảnh giới thú bị giết: chưa vào Tụ Khí → phàm; Tụ Khí → linh; Ngưng Đan → yêu. Bậc cao hồi nhiều Đói hơn. Thịt công cộng ngay và hết hạn sau 30 phút thực. Không cấm săn chỉ vì con mồi cùng nhóm loài. | FR-20, BA-RES-Q04/Q11; OPEN-03–05 |
| GR-SUR-07 | Đã duyệt | Linh thảo chỉ được dùng chủ động để tăng tu vi, không lấp Đói; thực vật thường là thức ăn. Quặng có ba nhóm nội dung ở `content-catalog.md`. | FR-08, FR-20 |
| GR-SUR-08 | Đã duyệt | Mọi thú sống có thể tự kiếm ăn bắt đầu tìm khi Đói ≤ 40/100, dừng khi Đói ≥ 80/100 hoặc tạm dừng vì nguy hiểm/thiếu nguồn; chỉ khởi động đợt mới khi lại ≤ 40. Tự tìm nước khi Khát ≤ 40/100; ngưỡng dừng nước TBD. `EVOLVING` đóng băng Đói/Khát nên không kích hoạt. Sơ đồ thức ăn ghi khả năng ăn, không chỉ định mục tiêu phải săn; cả tám nhóm chiêu mộ khi còn hoang có thể là nguồn thịt nếu bị giết. | FR-19–FR-20; `food-web-alpha.md` |
| GR-SUR-09 | Đã duyệt | Kiểu ăn của Chim/Cá và loại nước hợp lệ của Cá/Rùa được gắn theo cá thể khi xuất hiện. Nguồn thức ăn/nước hữu hạn do server cấp cho yêu cầu hợp lệ ghi nhận trước. | FR-03, FR-19; OPEN-06–08 |
| GR-ECO-01 | Đã duyệt | Mật độ mục tiêu quần thể phụ thuộc thức ăn/nước; thiếu thực vật thì con mồi không tái sinh, thiếu con mồi thì thú săn mồi hoang không tái sinh. Khi quần thể bằng 0 nhưng điều kiện phục hồi, cá thể mới tái sinh dần. Thực vật thường là tài nguyên tĩnh mọc lại; đàn cá nhỏ có thể dùng một thực thể đại diện. | FR-20; OPEN-20 |
| GR-ECO-02 | TBD | Tọa độ sinh cảnh, chu kỳ tái sinh, mật độ mục tiêu, lượng thịt/thức ăn và quy tắc lấy từ kho còn chờ bảng cân bằng. Không áp dụng trần 1.000 NPC trong hồ sơ nguồn. | FR-20, NFR-02 |

## 5. Tu luyện và tiến hóa

| ID | Trạng thái | Điều kiện → kết quả | Truy vết |
|---|---|---|---|
| GR-CUL-01 | Đã duyệt | Server lưu điểm tu vi thập phân; UI hiển thị `current / required × 100%`. Đột phá thành công chuyển sang giai đoạn mới với 0 điểm, không giữ phần dư, và mốc yêu cầu tăng theo `BAL-CUL-*`. Xác suất thành công giảm dần theo giai đoạn/cảnh giới; tỉ lệ cụ thể TBD. | FR-08; OPEN-15–16 |
| GR-CUL-02 | Đã duyệt | Đột phá thất bại → giữ giai đoạn, điểm còn 80% mốc hiện tại và chịu debuff giảm tu vi nhận được, chặn thử lại theo `BAL-CUL-*`. Dùng bảo vật thì không hoàn lại khi thất bại. | FR-08 |
| GR-CUL-03 | Đã duyệt | Chỉ thủ lĩnh đương nhiệm được tiến hóa; bậc 2 mở ở Tụ Khí Trung kỳ, bậc 3 ở Ngưng Đan Sơ kỳ; tối đa bậc 3 trong Alpha. Thành viên và thú hoang có thể tu luyện nhưng không tiến hóa. | FR-09 |
| GR-CUL-04 | Đã duyệt một phần | Mỗi nhóm có điều kiện và nguyên liệu riêng cho bậc 2 và 3. Chi phí/thời lượng ở `BAL-EVO-*`. Điều kiện riêng và hiệu ứng từng bậc sẽ do Product Owner viết lại và duyệt; bảng đề xuất trước chưa được duyệt. | FR-09, BA-EVO-01–02; OPEN-17 |
| GR-CUL-05 | Đã duyệt | Bắt đầu tiến hóa khi hợp lệ và không trong `COMBAT` → trừ nguyên liệu ngay, không chủ động hủy; tiến trình tiếp tục offline. Trong `EVOLVING`, thủ lĩnh đứng yên, miễn nhiễm sát thương/hiệu ứng bất lợi. Hoàn tất giữ cảnh giới, tu vi, kỹ năng và HP/linh lực hiện tại trong giới hạn mới. | FR-09, FR-10 |
| GR-COM-01 | Đã duyệt một phần | Tám kỹ năng nền được phân theo nhóm loài. Bảng loài/kỹ năng và chỉ số/cooldown chưa chốt. | FR-11; OPEN-12 |

## 6. Chiến tranh, tử vong và Game Over

| ID | Trạng thái | Điều kiện → kết quả | Truy vết |
|---|---|---|---|
| GR-WAR-01 | Đã duyệt | Chủ gia tộc tuyên chiến với gia tộc khác cùng server. Mỗi gia tộc tối đa một chiến tranh cùng lúc; mỗi bên chọn tối đa mười thú có thể chiến đấu. Bên offline do hệ quyết định chuẩn bị/điều khiển. | FR-12 |
| GR-WAR-02 | Đã duyệt | Chuẩn bị theo `BAL-WAR-*`, có thể bắt đầu sớm khi hai bên xong; bên bị tuyên chiến offline thì vào trận khi hệ thống và bên tuyên chiến xong. Bắt đầu → chốt trạng thái, hủy lệnh dở, hồi đầy HP/linh lực/Đói/Khát và xóa debuff. | FR-12 |
| GR-WAR-03 | Đã duyệt một phần | Chủ online chọn hành động từng thú; bên offline do FSM/server xử lý. Hết thú chiến đấu → đối phương thắng. Hết 12 lượt → so `tổng HP hiện tại / tổng HP tối đa` của đội hình ban đầu, thú chết tính 0 HP hiện tại; bằng nhau là hòa. Danh sách hành động/sát thương theo lượt còn TBD. Thắng không tự chuyển biệt viện hoặc phát thưởng. | FR-12; OPEN-13–14 |
| GR-DEA-01 | Đã duyệt | Thú gia tộc thường chết → `DEAD`, dừng nhiệm vụ/tu luyện; cấp phép hồi sinh trong hạn; cấp phép giữ một suất; chờ hồi sinh từ lúc cấp phép. Hủy rồi cấp lại đặt lại thời gian chờ, không đặt lại hạn xin cấp phép. | FR-13 |
| GR-DEA-02 | Đã duyệt | Khi chết, giữ trang bị; nếu có hành trang thì rơi một đơn vị từ một ô ngẫu nhiên. Quyền nhặt riêng rồi công cộng, cuối cùng vật phẩm biến mất theo `BAL-DROP-*`. Điểm rơi không hợp lệ → ô hợp lệ gần nhất trên bản đồ nơi thú chết. | FR-14; OPEN-21 |
| GR-DEA-03 | Đã duyệt | Mất thủ lĩnh mang thân xác → hạn giải quyết tự chạy kể cả offline. Người chơi dùng mảnh Thanh Liên hồi sinh thủ lĩnh cũ hoặc chọn thú sống để chuyển linh hồn/ý thức/ký ức/linh trí thủ lĩnh cũ vào; thân xác mới giữ cảnh giới/chỉ số/đặc tính của nó. | FR-15 |
| GR-DEA-04 | Đã duyệt | Mất biệt viện → hạn khôi phục độc lập với hạn thủ lĩnh. Hết hạn hợp lệ → gia tộc giải tán; giải tán xét trước mọi sự kiện cùng thời điểm, xóa thú, pháp bảo và kho theo PRD. | FR-16 |

## 7. Quy tắc chưa khóa

Các mục TBD được quản lý trong [Phụ lục A của PRD](prd-alpha-2.0.md#phụ-lục-a-bảng-cân-bằng-và-nội-dung-còn-tbd) và các ô TBD của [Balance Tables](balance-tables.md). Không suy ra điều kiện tiến hóa từng loài, hiệu ứng kỹ năng, lượng rơi hay công thức tài nguyên từ tên gọi trong hồ sơ đầu vào.
