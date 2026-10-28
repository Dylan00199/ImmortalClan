# Tiên Tộc Alpha 2.0 — Content Catalog

**Trạng thái:** Danh mục nội dung bản tạm; tên làm việc và ô TBD chưa phải asset hoặc công thức triển khai.
**Cập nhật:** 28/10/2026
**Nguồn phạm vi:** [PRD Alpha 2.0](prd-alpha-2.0.md) · [Sổ quyết định BA](ba-decision-register.md)
**Luật áp dụng:** [Gameplay Rules Catalog](gameplay-rules-catalog.md) · **Số cân bằng:** [Balance Tables](balance-tables.md)

## 1. Bản đồ và sinh cảnh

| ID | Bản đồ Alpha | Vai trò đã duyệt | Chi tiết chưa chốt |
|---|---|---|---|
| MAP-01 | Vùng cư trú hoang sơ | Khu cư trú và phát triển gia tộc; thay tên/bối cảnh Kinh thành cũ | Tọa độ, điểm nước, điểm đặt biệt viện |
| MAP-02 | Khu rừng | Yêu thú, cây thức ăn, linh thảo, quặng | Hang, rừng quả, sông, linh mạch và mật độ nguồn |
| MAP-03 | Biển Đông | Đảo, hải thú, tài nguyên biển; không có hải tặc trong Alpha | Lối nước nối sông, vùng nước ngọt/mặn, sinh cảnh biển |
| MAP-04 | Bãi hoang | Yêu thú, tài nguyên thưa, ít điểm nước | Vị trí điểm nước, lãnh thổ và sức chứa |

Cá đi qua ô nước và lối nối các vùng nước hợp lệ; Rùa có thể lên cạn. Bản đồ phải ghi điểm nước, thức ăn thường, linh thảo, quặng và điểm chuyển vùng. Phương pháp tạo bản đồ, tọa độ và mật độ còn TBD; tệp tài nguyên cũ gọi MAP-01 là “Vùng Lập Tổ”.

## 2. Tám nhóm thú có thể chiêu mộ

Tất cả tám nhóm dùng cùng điều kiện chiêu mộ. Chim và Cá là **một dòng tiến hóa chung cho mỗi nhóm** trong Alpha. Chỉ thủ lĩnh đương nhiệm có thể tiến hóa, tối đa bậc 3.

| ID | Nhóm | Bậc 1 | Bậc 2 | Bậc 3 | Trạng thái tên |
|---|---|---|---|---|---|
| SPEC-01 | Rắn | Nguyên Xà | Linh Xà | Đại Mãng Xà / Yêu Xà | Bậc 1 đã chốt; bậc 2–3 tên làm việc |
| SPEC-02 | Cáo | Nguyên Hồ | Yêu Hồ | Tam Vĩ Hồ | Bậc 1 đã chốt; bậc 2–3 tên làm việc |
| SPEC-03 | Rùa | Nguyên Quy | Linh Quy | Thiết Giáp Quy | Bậc 1 đã chốt; bậc 2–3 tên làm việc |
| SPEC-04 | Khỉ | Nguyên Hầu | Hầu Tinh | Linh Hầu | Bậc 1 đã chốt; bậc 2–3 tên làm việc |
| SPEC-05 | Sói | Nguyên Lang | Tật Phong Lang | Yêu Lang | Bậc 1 đã chốt; bậc 2–3 tên làm việc |
| SPEC-06 | Hổ | Nguyên Hổ | Yêu Hổ | Sát Hổ | Bậc 1 đã chốt; bậc 2–3 tên làm việc |
| SPEC-07 | Chim | Nguyên Điểu | Linh Điểu | Yêu Cầm | Bậc 1 đã chốt; bậc 2–3 tên làm việc |
| SPEC-08 | Cá | Nguyên Ngư | Linh Ngư | Hà Hải Ngư | Bậc 1 đã chốt; bậc 2–3 tên làm việc |

Tên bậc 1 “Nguyên” phân biệt tám dòng có khả năng tiến hóa khi cá thể trở thành thủ lĩnh với tầng con mồi nền như Cá nhỏ và Chim nhỏ; thú thành viên không tự tiến hóa. Điều kiện riêng và hiệu ứng từng bậc sẽ do Product Owner viết lại. Tên “Hầu Tinh” hoặc mô tả “khai trí” không trao trí tuệ độc lập cho thú thành viên. Người chơi khởi đầu với thủ lĩnh Sói; thủ lĩnh mới sau chuyển hồn dùng nhánh của thân xác nhận.

## 3. Quần thể con mồi nền

Tầng con mồi nền **không thể chiêu mộ và không tiến hóa**; mọi cá thể sống vẫn có Đói/Khát. Đây không phải toàn bộ con mồi Alpha: cá thể hoang thuộc tám nhóm có thể chiêu mộ cũng có thể bị giết và cho thịt. [Sơ đồ thức ăn Alpha](food-web-alpha.md) phân biệt khả năng ăn với hành vi tìm ăn. Danh mục dưới đây lấy từ hồ sơ tài nguyên đã được xác nhận ở mức nhóm/sinh cảnh; mật độ, chỉ số và đồ họa cụ thể còn TBD.

| ID | Vùng gợi ý | Nhóm con mồi/thực vật |
|---|---|---|
| PREY-01 | Khu rừng | Nai, hoẵng, lợn rừng, sơn dương, thỏ, gặm nhấm; cây quả, lá, cỏ |
| PREY-02 | Bãi hoang | Thỏ rừng, gặm nhấm, hươu thưa; cỏ thưa |
| PREY-03 | Biển Đông | Cá nhỏ/đàn cá, cá lớn, cua và sinh vật biển phù hợp |
| PREY-04 | Vùng cư trú hoang sơ | Thỏ, gặm nhấm, chim nhỏ; cây thức ăn thường |

Cá nhỏ có thể được mô phỏng bằng một thực thể “đàn” đại diện nhiều con. Con mồi cạn dùng các mốc Đói/Khát tại `BAL-SUR-04–05`; cá nhỏ trong nước phù hợp có Khát đầy.

## 4. Kỹ năng, huyết mạch và thể chất

| Nhóm nội dung | Danh mục ý tưởng đã duyệt | Còn TBD |
|---|---|---|
| Kỹ năng nền | Cắn xé, Dồn lực, Thủ thế, Né tránh, Truy kích, Phá giáp, Hồi sức, Tụ linh | Loài học kỹ năng nào, sát thương, chi phí, thời gian hồi |
| Huyết mạch | Phàm thú, Sơn Lâm, Hải Triều, Hoang Mạc | Chỉ số, di truyền, đột biến và thức tỉnh |
| Thể chất | Cường Thể, Chiến Thể, Linh Thể, Tật Phong | Chỉ số, di truyền, đột biến và thức tỉnh |

## 5. Ba mảnh pháp bảo khởi đầu

| ID | Tên | Vai trò đã duyệt | Còn TBD |
|---|---|---|---|
| ART-01 | Mảnh Hỗn Độn Thanh Liên | Có thể trực tiếp hồi sinh thủ lĩnh cũ khi hợp lệ | Điều kiện hợp lệ chi tiết |
| ART-02 | Mảnh Tạo Hóa Ngọc Điệp | Hỗ trợ tu luyện | Mức hiệu ứng |
| ART-03 | Mảnh Hỗn Độn Châu | Hỗ trợ kho/tài nguyên | Mức hiệu ứng |

Người chơi chọn một mảnh lúc bắt đầu; không tạo thêm các mảnh khởi đầu trong quá trình chơi. Pháp bảo gốc không xuất hiện nguyên vẹn. Phẩm cấp pháp bảo Alpha là Hoàng, Huyền, Địa, Thiên; mỗi phẩm có Sơ, Trung, Thượng, tổng 12 bậc. Tiên phẩm ở ngoài Alpha.

## 6. Thức ăn, linh thảo và khoáng

| ID | Danh mục | Ví dụ hoặc nguồn | Vai trò đã duyệt/còn TBD |
|---|---|---|---|
| FOOD-01 | Thức ăn thực vật thường | Cỏ, quả, hạt, lá | Nuôi thú ăn thực vật/ăn tạp; lượng lấp Đói TBD |
| FOOD-02 | Thịt thú phàm | Thú hoang bị giết chưa vào Tụ Khí | Lấp Đói; lượng rơi và hiệu quả TBD |
| FOOD-03 | Thịt linh thú | Thú hoang bị giết ở Tụ Khí | Lấp Đói; lượng rơi và hiệu quả TBD |
| FOOD-04 | Thịt yêu thú | Thú hoang bị giết ở Ngưng Đan | Lấp Đói; lượng rơi và hiệu quả TBD |
| HERB-01 | Linh thảo thượng phẩm | Linh chi, nhân sâm | Tăng tu vi khi dùng chủ động; ổn định, hiếm; số điểm TBD |
| HERB-02 | Linh thảo trung phẩm | Gừng, mẫu đơn | Tăng tu vi mức vừa; hiệu ứng phụ và số điểm TBD |
| HERB-03 | Linh thảo hạ phẩm | Đại hoàng, nhân hạnh | Tăng tu vi mạnh hơn nhưng rủi ro; số điểm và rủi ro TBD |
| ORE-01 | Quặng thường | Sắt, đồng | Hướng trang bị/nâng pháp bảo; công thức TBD |
| ORE-02 | Quặng quý | Vàng, bạc | Hướng nâng pháp bảo/trao đổi; công thức TBD |
| ORE-03 | Linh khoáng | Đan sa, ngọc | Hướng tiến hóa/đột phá; công thức TBD |

Nước ở sông, suối, ao, hồ và đầm là nguồn uống của thú cạn. Linh thảo **không** lấp Đói. Thú hoang bị giết cho thịt; cơ chế rơi thịt khác cơ chế rơi một vật phẩm hành trang của thú gia tộc và cần đặc tả lượng/quyền nhặt riêng.

## 7. Nội dung ngoài Alpha

Bậc tiến hóa 4–6, Hóa Hình thành người, Tổ Long/Phượng Hoàng/Côn Bằng/Cửu Vĩ/Huyền Vũ/Bạch Hổ/Thiên Lang/Thần Hầu, lôi kiếp, dung hợp hai loài, nhánh cá chép hóa rồng và các nhánh Chim thần thú là định hướng sau Alpha. Không dùng chúng làm điều kiện nghiệm thu Alpha 2.0.
