# Tiên Tộc Alpha 2.0 — Balance Tables

**Trạng thái:** Bản tạm; số có nhãn **Đã duyệt** là mốc Alpha hiện hành, chưa phải kết quả thử tải.
**Cập nhật:** 28/10/2026
**Quy tắc:** [Gameplay Rules Catalog](gameplay-rules-catalog.md) · **Nguồn quyết định:** [Sổ BA](ba-decision-register.md)

Mọi thời lượng bên dưới dùng **thời gian thực của server** trừ khi ghi rõ “giờ/ngày game”. Giá trị TBD cần Product Owner duyệt trước khi dùng làm điều kiện nghiệm thu.

## BAL-WOR — Thế giới và hiệu năng

| ID | Tham số | Giá trị | Trạng thái |
|---|---|---:|---|
| BAL-WOR-01 | Bản đồ/server | 4 | Đã duyệt |
| BAL-WOR-02 | Gia tộc cư trú chính/bản đồ | Tối đa 3 | Đã duyệt |
| BAL-WOR-03 | Gia tộc/server | Tối đa 12 | Đã duyệt |
| BAL-WOR-04 | Suất/gia tộc | Tối đa 100, giới hạn cứng | Đã duyệt |
| BAL-WOR-05 | Thú hoang/bản đồ trong bài thử tải | 200 | Mục tiêu thử tải, không phải trần cứng |
| BAL-WOR-06 | Suất gia tộc/server trong bài thử tải | 1.200 | Mục tiêu thử tải, 12 × 100 |
| BAL-WOR-07 | Chủ gia tộc online/server trong bài thử tải | 12 | Mục tiêu thử tải |
| BAL-WOR-08 | Độ trễ phản hồi lệnh p95 | ≤ 300 ms | Mục tiêu thử tải |
| BAL-WOR-09 | Phục hồi sau server restart | ≤ 2 phút | Mục tiêu thử tải |
| BAL-WOR-10 | Đường đi bị chặn trước khi đưa tới vị trí gần nhất hợp lệ trên cùng bản đồ | 10 giây | Đã duyệt |

## BAL-TIME — Đồng hồ game

| ID | Tham số | Giá trị | Trạng thái |
|---|---|---:|---|
| BAL-TIME-01 | Một ngày thực | Một năm game = 360 ngày game | Đã duyệt |
| BAL-TIME-02 | Một ngày game | 4 phút thực | Suy ra từ BAL-TIME-01 |
| BAL-TIME-03 | Một giờ game | 10 giây thực | Suy ra từ BAL-TIME-01 |
| BAL-TIME-04 | Cửa sổ Thái Dương Tinh Hoa | 05:00–07:00 giờ game | Đã duyệt |
| BAL-TIME-05 | Cửa sổ Thái Âm Tinh Hoa | 23:00–01:00 giờ game | Đã duyệt |

## BAL-CLAN — Thành lập, sinh sản, hồi sinh

| ID | Tham số | Giá trị | Trạng thái |
|---|---|---:|---|
| BAL-CLAN-01 | Khai sáng thủ lĩnh ban đầu | 5 giây | Đã duyệt |
| BAL-CLAN-02 | Thời gian thai kỳ | 24 giờ | Đã duyệt |
| BAL-CLAN-03 | Số con/thai kỳ | 1 | Đã duyệt |
| BAL-CLAN-04 | Hạn cấp phép hồi sinh thú thường từ lúc chết | 3 ngày | Đã duyệt |
| BAL-CLAN-05 | Chờ hồi sinh thú thường từ lúc cấp phép | 24 giờ | Đã duyệt |
| BAL-CLAN-06 | Hạn mất thủ lĩnh mang thân xác | 3 ngày | Đã duyệt |
| BAL-CLAN-07 | Hạn khôi phục biệt viện | 7 ngày | Đã duyệt |

## BAL-CUL — Tu luyện và đột phá

Server lưu điểm tu vi thập phân; giao diện hiển thị tỷ lệ phần trăm. Mốc sau tiểu cảnh nhân **1,5**; sau đại cảnh nhân **3**.

| ID | Giai đoạn | Điểm tu vi cần đạt | Trạng thái |
|---|---|---:|---|
| BAL-CUL-01 | Tụ Khí Sơ kỳ | 100 | Đã duyệt |
| BAL-CUL-02 | Tụ Khí Trung kỳ | 150 | Đã duyệt |
| BAL-CUL-03 | Tụ Khí Hậu kỳ | 225 | Đã duyệt |
| BAL-CUL-04 | Tụ Khí Viên mãn | 337,5 | Đã duyệt |
| BAL-CUL-05 | Ngưng Đan Sơ kỳ | 1.012,5 | Đã duyệt |
| BAL-CUL-06 | Ngưng Đan Trung kỳ | 1.518,75 | Đã duyệt |
| BAL-CUL-07 | Ngưng Đan Hậu kỳ | 2.278,125 | Đã duyệt |
| BAL-CUL-08 | Ngưng Đan Viên mãn | 3.417,1875 | Đã duyệt |

| ID | Tham số | Giá trị | Trạng thái |
|---|---|---:|---|
| BAL-CUL-09 | Tu vi nền khi chủ động tu luyện ở Tụ Khí | 0,5 điểm/phút | Đã duyệt |
| BAL-CUL-10 | Tu vi nền khi chủ động tu luyện ở Ngưng Đan | 1 điểm/phút | Đã duyệt |
| BAL-CUL-11 | Điểm còn sau đột phá thất bại | 80% mốc yêu cầu hiện tại | Đã duyệt |
| BAL-CUL-12 | Debuff sau thất bại | 10 phút; nhận tu vi giảm 50%, chặn thử lại | Đã duyệt |
| BAL-CUL-13 | Yêu Đan khi vào Ngưng Đan | +10% HP tối đa, linh lực tối đa, công kích, phòng ngự, tốc độ | Đã duyệt |
| BAL-CUL-14 | Tu vi dư sau đột phá | 0 điểm; không bảo lưu | Đã duyệt |
| BAL-CUL-15 | Xác suất đột phá giảm theo giai đoạn/cảnh giới; hệ số tinh hoa; tu vi linh thảo | TBD | Chưa chốt số |

## BAL-EVO — Tiến hóa thủ lĩnh

| ID | Tham số | Bậc 2 | Bậc 3 | Trạng thái |
|---|---|---:|---:|---|
| BAL-EVO-01 | Mốc cảnh giới mở | Tụ Khí Trung kỳ | Ngưng Đan Sơ kỳ | Đã duyệt |
| BAL-EVO-02 | Nguyên liệu tiến hóa tiêu hao | 2 đơn vị | 5 đơn vị | Đã duyệt |
| BAL-EVO-03 | Thời lượng tiến hóa | 15 phút | 60 phút | Đã duyệt |
| BAL-EVO-04 | Điều kiện riêng theo tám nhóm; hiệu ứng từng bậc | TBD | TBD | Product Owner sẽ viết lại điều kiện |
| BAL-EVO-05 | Loại nguyên liệu tiến hóa | Riêng từng dòng; tên/nguồn TBD | Riêng từng dòng; tên/nguồn TBD | Đã duyệt nguyên tắc |

## BAL-WAR — Chiến tranh

| ID | Tham số | Giá trị | Trạng thái |
|---|---|---:|---|
| BAL-WAR-01 | Thú tham chiến/bên | Tối đa 10 | Đã duyệt |
| BAL-WAR-02 | Chuẩn bị | Tối đa 1 phút; có thể bắt đầu sớm theo luật offline/online | Đã duyệt |
| BAL-WAR-03 | Thời lượng/lượt | Tối đa 20 giây | Đã duyệt |
| BAL-WAR-04 | Lượt/trận | Tối đa 12 | Đã duyệt |
| BAL-WAR-05 | Tỷ lệ HP để phân thắng sau lượt 12 | Tổng HP hiện tại / tổng HP tối đa của đội hình ban đầu; thú chết tính 0 | Đã duyệt |
| BAL-WAR-06 | Hành động và sát thương/lượt | TBD | Chưa chốt |

## BAL-DROP — Vật phẩm rơi

| ID | Tham số | Giá trị | Trạng thái |
|---|---|---:|---|
| BAL-DROP-01 | Vật phẩm hành trang rơi khi thú gia tộc chết | 1 đơn vị từ 1 ô ngẫu nhiên | Đã duyệt |
| BAL-DROP-02 | Quyền nhặt riêng của gia tộc | 0 đến trước 10 phút | Đã duyệt |
| BAL-DROP-03 | Quyền nhặt công cộng | Từ phút 10 đến trước phút 30 | Đã duyệt |
| BAL-DROP-04 | Hết hạn vật phẩm rơi | Từ phút 30 | Đã duyệt |
| BAL-DROP-05 | Quyền nhặt thịt từ thú hoang bị giết | Công cộng ngay; xóa sau 30 phút thực | Đã duyệt |
| BAL-DROP-06 | Lượng thịt và lượng hồi Đói theo bậc | TBD; bậc cao hồi nhiều hơn | Chưa chốt số |

## BAL-SUR — Đói, khát và sinh tồn

| ID | Đối tượng hoặc hiệu ứng | Giá trị | Trạng thái |
|---|---|---:|---|
| BAL-SUR-01 | Đói: Hổ, Sói, đầy → 0 nếu không ăn | 6 giờ | Đã duyệt |
| BAL-SUR-02 | Đói: Cá, Khỉ, Cáo, Chim, đầy → 0 | 12 giờ | Đã duyệt |
| BAL-SUR-03 | Đói: Rắn, Rùa, đầy → 0 | 24 giờ | Đã duyệt |
| BAL-SUR-04 | Đói: con mồi cạn, cá nhỏ/đàn cá, đầy → 0 | 12 giờ | Đã duyệt |
| BAL-SUR-05 | Khát: thú cạn, con mồi cạn, Rùa trên cạn, đầy → 0 | 6 giờ | Đã duyệt |
| BAL-SUR-06 | Khát: Cá/Rùa trong nước phù hợp | Luôn đầy | Đã duyệt |
| BAL-SUR-07 | Đói hoặc Khát bằng 0 | −20% tốc độ di chuyển và công kích; không nhân đôi nếu cả hai bằng 0 | Đã duyệt |
| BAL-SUR-08 | Thời gian liên tục bằng 0 trước khi mất HP | 30 phút | Đã duyệt |
| BAL-SUR-09 | HP mất sau thời gian chờ | 5% HP tối đa/giờ; có thể chết | Đã duyệt |
| BAL-SUR-10 | Ngưỡng bắt đầu tự tìm thức ăn của mọi thú sống | Đói ≤ 40/100 | Đã duyệt |
| BAL-SUR-11 | Ngưỡng kết thúc đợt tìm ăn | Đói ≥ 80/100; tạm dừng khi nguy hiểm/thiếu nguồn | Đã duyệt |
| BAL-SUR-12 | Ngưỡng bắt đầu tự tìm nước | Khát ≤ 40/100 | Đã duyệt |
| BAL-SUR-13 | Lượng ăn/uống, ngưỡng dừng tìm nước và cảnh báo giao diện, lượng thịt, tỷ lệ tái sinh | TBD | Chưa chốt |

## Các số chưa chốt khác

Chỉ số nền và tăng trưởng của loài, kỹ năng, huyết mạch/thể chất, hiệu ứng ba pháp bảo, ngưỡng/chi phí 12 bậc pháp bảo, công thức sức mạnh, khoáng/vật phẩm và phân bố bản đồ vẫn ở [Phụ lục A của PRD](prd-alpha-2.0.md#phụ-lục-a-bảng-cân-bằng-và-nội-dung-còn-tbd). Không dùng giá trị mặc định trong code để lấp TBD của BA.
