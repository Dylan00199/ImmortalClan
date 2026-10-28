# Tiên Tộc Alpha 2.0 — Gói đề xuất cân bằng v0.1

**Trạng thái:** ĐỀ XUẤT CHỜ PRODUCT OWNER DUYỆT. Không thay thế [PRD](../prd-alpha-2.0.md), [Balance Tables đã chốt](../balance-tables.md) hoặc điều kiện tiến hóa riêng do Product Owner sẽ viết.

## 1. Cách đọc và nguồn

- Mọi trị số mới trong tài liệu này là **số thiết kế để thử**, không phải con số lấy từ điển tích hay đo trực tiếp trên động vật. Chỉ khi Product Owner duyệt, chúng mới được chuyển vào `balance-tables.md`.
- Giữ các mốc hiện hành: 100 suất/gia tộc, 200 thú hoang/bản đồ là mục tiêu thử tải, Đói 6/12/24 giờ theo nhóm, Khát 6 giờ trên cạn, tìm ăn từ 40 đến 80, thai kỳ 24 giờ và tu luyện 0,5/1 điểm mỗi phút.
- Sinh thái thực cho thấy Sói thường bắt đầu sinh sản khoảng 2–3 tuổi, Hổ khoảng 3–5 tuổi và Rùa biển có thể mất hàng chục năm. Bảng tuổi game bên dưới **nén có chủ ý** để phù hợp `1 ngày thực = 1 năm game`, không khẳng định các nhóm giả tưởng trưởng thành đúng như động vật thật. Nguồn: [NPS về Sói](https://www.nps.gov/articles/life-of-a-wolf.htm), [Animal Diversity Web về Hổ](https://animaldiversity.org/accounts/Panthera_tigris/), [NOAA về Rùa biển](https://oceanservice.noaa.gov/news/june15/sea-turtles.html).
- Vai trò thức ăn bám [NPS về Sói](https://home.nps.gov/yell/learn/nature/wolf.htm), [USGS về Lợn rừng](https://www.usgs.gov/publications/seasonal-variation-wild-pig-sus-scrofa-diet-revealed-dna-metabarcoding), [NOAA về chuỗi thức ăn biển](https://www.noaa.gov/education/resource-collections/marine-life/aquatic-food-webs). Không dùng các nguồn này để suy ra số điểm Đói hay số miếng thịt.
- Các bảng chiến đấu cần kiểm bằng mô phỏng trận và thử chơi. Nghiên cứu [AIIDE về cân bằng game](https://ojs.aaai.org/index.php/AIIDE/article/view/12513) coi điều chỉnh tham số và thử chơi lặp là bước cần thiết; mọi số dưới đây là điểm bắt đầu cho quy trình đó.

## 2. Tuổi trưởng thành và di truyền

Một năm game bằng một ngày thực. Tuổi tính từ thời điểm sinh trên đồng hồ game; con non không được bắt đầu thai kỳ trước mốc tuổi.

| Dòng | Tuổi trưởng thành đề xuất (năm game) | Thời gian thực sau sinh |
|---|---:|---:|
| Nguyên Xà | 2 | 2 ngày |
| Nguyên Hồ | 1 | 1 ngày |
| Nguyên Quy | 4 | 4 ngày |
| Nguyên Hầu | 3 | 3 ngày |
| Nguyên Lang | 2 | 2 ngày |
| Nguyên Hổ | 4 | 4 ngày |
| Nguyên Điểu | 1 | 1 ngày |
| Nguyên Ngư | 1 | 1 ngày |

Đề xuất cho **mỗi thuộc tính riêng** (huyết mạch, thể chất): 45% nhận loại của mẹ, 45% nhận loại của bố, 10% đột biến sang một loại khác bố mẹ trong bốn loại đã có ở Alpha. Nếu bố mẹ cùng loại thì xác suất giữ loại đó là 90%. Chọn và lưu kết quả khi sinh; Alpha không sinh loại ẩn hoặc kích hoạt thức tỉnh.

## 3. Chỉ số nền, tăng trưởng và sức mạnh nội tại

Chỉ số bậc 1, Tụ Khí Sơ kỳ, chưa tính huyết mạch/thể chất, Yêu Đan hoặc tiến hóa:

| Dòng | HP | Linh lực | Công kích | Phòng ngự | Tốc độ |
|---|---:|---:|---:|---:|---:|
| Nguyên Xà | 80 | 45 | 12 | 7 | 10 |
| Nguyên Hồ | 85 | 50 | 10 | 7 | 12 |
| Nguyên Quy | 140 | 50 | 8 | 15 | 5 |
| Nguyên Hầu | 100 | 55 | 10 | 9 | 9 |
| Nguyên Lang | 110 | 45 | 13 | 9 | 11 |
| Nguyên Hổ | 130 | 40 | 16 | 10 | 10 |
| Nguyên Điểu | 75 | 50 | 11 | 6 | 14 |
| Nguyên Ngư | 90 | 50 | 10 | 8 | 10 |

- Mỗi lần qua **tiểu cảnh**: nhân HP, linh lực, công kích, phòng ngự với **1,08** và tốc độ với **1,03**. Khi qua **đại cảnh**: nhân thêm **1,20** cho bốn chỉ số đầu, **1,08** cho tốc độ. Yêu Đan cộng **10% cả năm chỉ số** khi vào Ngưng Đan theo luật đã duyệt, sau tăng trưởng cảnh giới.
- Huyết mạch đề xuất: Phàm thú +0%; Sơn Lâm +5% công kích; Hải Triều +5% linh lực; Hoang Mạc +5% phòng ngự. Thể chất: Cường Thể +10% HP; Chiến Thể +5% công kích; Linh Thể +10% linh lực; Tật Phong +5% tốc độ. Chỉ cộng hiệu ứng của **một huyết mạch và một thể chất** mỗi cá thể.
- Thủ lĩnh tiến hóa bậc 2: nhân thêm **1,10** cho HP/linh lực/công kích/phòng ngự và **1,05** tốc độ. Bậc 3: nhân thêm **1,20** và **1,10** tương ứng trên chỉ số sau bậc 2. Đây chỉ là **hiệu ứng chỉ số chung đề xuất**, không viết thay điều kiện riêng hoặc hiệu ứng riêng từng dòng của Product Owner.
- Đề xuất `sức_mạnh_nội_tại = HP_tối_đa/10 + 2×công_kích + 1,5×phòng_ngự + linh_lực_tối_đa/10 + tốc_độ`, dùng chỉ số đã tính cảnh giới, huyết mạch/thể chất, tiến hóa, Yêu Đan; bỏ trang bị và hiệu ứng tạm thời. Làm tròn để hiển thị **1 chữ số thập phân**, giữ độ chính xác đầy đủ trên server. Trung bình gia tộc và cách tính suất thai kỳ/DEAD theo PRD.
- Kiểm tra số học: Nguyên Lang cơ sở có sức mạnh **66,0**, dưới ngưỡng Hoàng Trung 70 đề xuất. Một thủ lĩnh Nguyên Lang đạt Ngưng Đan Viên mãn, bậc tiến hóa 3 và Yêu Đan, không tính huyết mạch/thể chất, có sức mạnh xấp xỉ **170,1**; ngưỡng Thiên Thượng 170 vì vậy chỉ vừa đạt ở cực trị này. Đây không phải cam kết tốc độ nâng phẩm thực tế của cả gia tộc.

## 4. Kỹ năng và chiến đấu

Đề xuất kỹ năng mỗi dòng có thể học trong Alpha; mỗi kỹ năng mở một lần, không tự trao trí tuệ cho thành viên:

| Dòng | Kỹ năng |
|---|---|
| Nguyên Xà | Cắn xé, Né tránh, Phá giáp |
| Nguyên Hồ | Né tránh, Truy kích, Hồi sức |
| Nguyên Quy | Thủ thế, Hồi sức, Tụ linh |
| Nguyên Hầu | Dồn lực, Né tránh, Tụ linh |
| Nguyên Lang | Cắn xé, Dồn lực, Truy kích |
| Nguyên Hổ | Cắn xé, Dồn lực, Phá giáp |
| Nguyên Điểu | Né tránh, Truy kích, Tụ linh |
| Nguyên Ngư | Cắn xé, Né tránh, Tụ linh |

| Kỹ năng | Hiệu ứng đề xuất | Linh lực dùng | Hồi sau số lượt chiến tranh |
|---|---|---:|---:|
| Cắn xé | Đòn đánh gây 125% sát thương thường | 5 | 2 |
| Dồn lực | Hành động này chuẩn bị; đòn đánh kế tiếp gây 150% sát thương thường | 4 | 2 |
| Thủ thế | Giảm 30% sát thương nhận cho đến hành động kế | 3 | 2 |
| Né tránh | Tăng 20 điểm phần trăm xác suất tránh đòn cho đến hành động kế | 4 | 3 |
| Truy kích | Đòn đánh gây 110% sát thương thường; có thể chọn mục tiêu đang bỏ chạy nếu còn hợp lệ | 5 | 2 |
| Phá giáp | Đòn đánh thường bỏ qua 50% phòng ngự mục tiêu | 6 | 3 |
| Hồi sức | Hồi 20% HP tối đa cho chính thú | 8 | 4 |
| Tụ linh | Hồi 20 điểm linh lực cho chính thú, không vượt tối đa | 0 | 3 |

Đề xuất công thức một đòn thường: `sát_thương = max(1, công_kích × hệ_số_kỹ_năng − 0,5 × phòng_ngự_hữu_hiệu)`. Độ chính xác nền **90%**; Né tránh cộng 20 điểm phần trăm vào xác suất tránh nên đối thủ còn **70%** khả năng trúng khi không có hiệu ứng khác. Mỗi thú tối đa một hành động trong một lượt chiến tranh; online chọn, offline FSM chọn. Hồi chiêu tính theo lượt, còn quy đổi sang chiến đấu thời gian thực cần thử nghiệm trước khi duyệt.

## 5. Tu luyện và linh thảo

Các mốc điểm yêu cầu và tốc độ 0,5/1 điểm/phút ở [Balance Tables](../balance-tables.md) giữ nguyên. Đề xuất xác suất cho lần thử đột phá tiếp theo:

| Từ giai đoạn | Sang giai đoạn | Xác suất đề xuất |
|---|---|---:|
| Tụ Khí Sơ kỳ | Trung kỳ | 90% |
| Tụ Khí Trung kỳ | Hậu kỳ | 85% |
| Tụ Khí Hậu kỳ | Viên mãn | 80% |
| Tụ Khí Viên mãn | Ngưng Đan Sơ kỳ | 70% |
| Ngưng Đan Sơ kỳ | Trung kỳ | 65% |
| Ngưng Đan Trung kỳ | Hậu kỳ | 60% |
| Ngưng Đan Hậu kỳ | Viên mãn | 55% |

- Khi đúng cửa sổ Thái Dương/Thái Âm Tinh Hoa và thú đang tu luyện hợp lệ, đề xuất tốc độ nhận tu vi là **1,25×** tốc độ nền, thay nguồn môi trường chứ không cộng chồng. Các cửa sổ 05:00–07:00 và 23:00–01:00 giờ game đã duyệt.
- Linh thảo **thượng phẩm +40 điểm**, **trung phẩm +25 điểm**, **hạ phẩm +60 điểm**. Đây là thứ tự sức mạnh theo hồ sơ nội dung, không phải giá trị dược liệu thực. Đề xuất rủi ro của hạ phẩm: **20% khả năng mất 10% HP tối đa** khi dùng; trung phẩm không thêm hiệu ứng phụ trong Alpha. Linh thảo không lấp Đói. Trong debuff đột phá, số điểm nhận bị giảm 50% như luật đã chốt.
- Tu vi từ linh thảo được chặn ở mốc yêu cầu hiện tại; điểm vượt mốc bị bỏ. Sau đột phá thành công giai đoạn mới bắt đầu 0, theo quyết định OPEN-16. Điều này tránh để linh thảo một lần vượt nhiều cảnh giới.
- Nếu chỉ chủ động tu luyện liên tục, không dùng linh thảo/tinh hoa và mọi đột phá thành công lần đầu, tổng thời gian từ Tụ Khí Sơ kỳ 0 điểm đến **Ngưng Đan Viên mãn 100%** là **9.851,5625 phút = 164,19 giờ ≈ 6,84 ngày thực** (suy ra từ mốc đã duyệt). Với bảng xác suất đề xuất, thất bại phải lấy lại 20% điểm mốc và chờ 10 phút debuff; ước tính kỳ vọng khoảng **7,39 ngày thực** nếu tiếp tục tu luyện trong debuff ở nửa tốc độ. Đây là phép tính kỳ vọng, chưa gồm gián đoạn, nhu cầu sống hoặc di chuyển.

## 6. Ba mảnh pháp bảo và 12 bậc

- Mảnh Hỗn Độn Thanh Liên: giữ năng lực hồi sinh trực tiếp thủ lĩnh cũ khi hợp lệ theo PRD; **không thêm chi phí hoặc thời gian**. Điều kiện hợp lệ đề xuất để đặc tả: gia tộc chưa giải tán, chủ sở hữu chọn thao tác trong hạn mất thủ lĩnh 3 ngày và đã chọn mảnh này khi khởi đầu.
- Mảnh Tạo Hóa Ngọc Điệp: đề xuất **+10% điểm tu vi từ chủ động tu luyện** cho thú gia tộc; không tăng tu vi từ linh thảo hoặc nguồn khác.
- Mảnh Hỗn Độn Châu: đề xuất **+20% sức chứa kho pháp bảo** so với sức chứa cơ sở; sức chứa cơ sở còn chờ thiết kế kho. Không tự sinh thêm tài nguyên.

Đề xuất ngưỡng kỷ lục sức mạnh trung bình và chi phí nâng **từ bậc ngay trước**. Vật phẩm quặng và linh thạch là các nhóm đã có trong Content Catalog; số lượng thu được trên bốn bản đồ thiết kế lại phải được kiểm trước khi duyệt chi phí.

| Bậc pháp bảo | Kỷ lục sức mạnh tối thiểu | Quặng tiêu hao | Linh thạch tiêu hao |
|---|---:|---|---:|
| Hoàng Sơ | 0 | Khởi đầu | 0 |
| Hoàng Trung | 70 | 5 quặng thường | 10 |
| Hoàng Thượng | 80 | 10 quặng thường | 15 |
| Huyền Sơ | 90 | 5 quặng quý | 25 |
| Huyền Trung | 100 | 8 quặng quý | 40 |
| Huyền Thượng | 110 | 12 quặng quý | 60 |
| Địa Sơ | 120 | 5 linh khoáng | 90 |
| Địa Trung | 130 | 8 linh khoáng | 135 |
| Địa Thượng | 140 | 12 linh khoáng | 200 |
| Thiên Sơ | 150 | 16 linh khoáng | 300 |
| Thiên Trung | 160 | 22 linh khoáng | 450 |
| Thiên Thượng | 170 | 30 linh khoáng | 675 |

## 7. Đói, Khát, thịt và tài nguyên

Một **miếng thịt** là một đơn vị vật phẩm game, chưa quy đổi gam. Bảng lượng hồi sau đây dùng cho một miếng **thịt phàm**; thịt linh nhân **1,5**, thịt yêu nhân **2**, chặn Đói ở 100. Không dùng khái niệm “bữa ăn”. Loài chỉ được dùng thức ăn phù hợp chế độ ăn đã gắn.

| Con ăn | Đói hồi từ 1 miếng thịt phàm | Đói hồi từ 1 phần thực vật/phù du phù hợp |
|---|---:|---:|
| Nguyên Hổ | 30 | Không ăn |
| Nguyên Lang | 40 | Không ăn |
| Nguyên Hồ | 50 | 25 |
| Nguyên Xà | 50 | Không ăn |
| Nguyên Quy | 40 | 35 |
| Nguyên Hầu | 25 | 40 |
| Nguyên Điểu | 50 nếu cá thể ăn thịt | 40 nếu cá thể ăn hạt/quả |
| Nguyên Ngư | 50 nếu cá thể ăn thịt | 40 nếu cá thể ăn phù du |
| Thú ăn cỏ/con mồi nền | Theo kiểu ăn nếu có | 40 |

Số miếng từ **một thú hoang bị giết**, không áp dụng cho thú gia tộc hoặc thú chết tự nhiên:

| Nguồn thịt | Miếng đề xuất |
|---|---:|
| Nai sambar; hươu | 80 mỗi con |
| Hoẵng; sơn dương | 50 mỗi con |
| Lợn rừng | 60 |
| Thỏ/thỏ rừng | 8 |
| Gặm nhấm; chim nhỏ; cua | 2 mỗi con |
| Cá nhỏ đơn lẻ | 2 |
| Đàn cá nhỏ đại diện | 16 |
| Cá lớn làm mồi nền | 24 |
| Nguyên Xà; Nguyên Hồ; Nguyên Quy; Nguyên Hầu hoang | 8; 12; 16; 20 tương ứng |
| Nguyên Lang; Nguyên Hổ; Nguyên Điểu; Nguyên Ngư hoang | 28; 40; 8; 20 tương ứng |

- Đề xuất một lần uống từ điểm nước hợp lệ hồi **60 điểm Khát**, tối đa 100; với ngưỡng bắt đầu ≤40, thú thường sẽ đạt 100 sau một lần uống. Cá/Rùa ở nước hợp lệ vẫn luôn đầy theo luật đã duyệt.
- Đề xuất cảnh báo Đói/Khát trên giao diện khi thanh **≤40**. HP mất do suy kiệt được tích lũy ở dạng thập phân trên server, chỉ làm tròn khi hiển thị; không làm tròn mỗi tick để tránh mất/được HP ngoài ý muốn.
- Đề xuất thực vật thức ăn thường mọc lại **1 phần/20 phút thực** tại điểm tài nguyên; linh thảo hạ/trung/thượng sau **2/6/12 giờ thực**; quặng thường/quý/linh khoáng sau **4/12/24 giờ thực**. Số điểm tài nguyên và sản lượng theo bốn bản đồ thiết kế lại chưa có, nên các chu kỳ này chỉ là mốc kiểm thử.
- Đề xuất vùng có sức chứa dương nhưng quần thể đã về 0 được tái sinh tối thiểu **1 cá thể/giờ thực**, tối đa **5% sức chứa mục tiêu/giờ thực** (làm tròn lên); chỉ khi thức ăn/nước và điều kiện sinh cảnh đủ. Không dùng mục tiêu thử tải 200 thú hoang/bản đồ làm sức chứa mặc định.

## 8. Kiểm thử bắt buộc trước khi duyệt số

1. Mô phỏng 12 gia tộc × 100 suất, 200 thú hoang/bản đồ theo mục tiêu tải đã duyệt; đo p95 lệnh và phục hồi restart, không coi các mục tiêu là kết quả đạt sẵn.
2. Mô phỏng cực trị **100 Nguyên Lang trong một gia tộc**, không ăn kho: tại Đói 40, mỗi con cần một miếng thịt phàm để đạt 80. Nếu chu kỳ này lặp khoảng 10 lần/ngày thực thì cần xấp xỉ **1.000 miếng/ngày**; với 80 miếng/nai là khoảng **12,5 nai/ngày**. Phải đo nguồn mồi, quãng đường săn và khả năng sống sót trước khi duyệt lượng rơi hoặc mật độ.
3. Mô phỏng các cặp đội hình chiến tranh 10v10, 10v1 và các đội cùng sức mạnh ở 12 lượt; kiểm tra tỷ lệ thắng không bị chi phối bất hợp lý bởi lượt đi trước, kỹ năng hồi sức hoặc chênh lệch số thú.
4. Mô phỏng tu luyện liên tục và gián đoạn với xác suất đột phá, hiệu ứng Ngọc Điệp và linh thảo; kiểm tra thời gian đạt Ngưng Đan Viên mãn và chi phí thất bại.
5. Kiểm tra đường nước ngọt/mặn và tài nguyên của **bốn bản đồ thiết kế lại** trước khi chốt nguồn nguyên liệu tiến hóa, sức chứa quần thể và chi phí nâng pháp bảo.

**Ranh giới:** Chưa có điều kiện tiến hóa riêng của tám dòng do Product Owner sẽ viết; chưa có bản đồ Alpha thiết kế lại hoặc số nguồn tài nguyên thực tế. Các trị số phụ thuộc hai đầu vào này chưa được coi là có thể nghiệm thu.
