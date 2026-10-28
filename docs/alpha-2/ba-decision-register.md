# Tiên Tộc Alpha 2.0 — sổ quyết định BA

**Trạng thái:** BA về phạm vi và quy tắc chính Alpha 2.0 đã chốt; bảng cân bằng được phép để TBD nên chưa sẵn sàng triển khai toàn bộ.
**Nguồn hiện hành:** [PRD Alpha 2.0](prd-alpha-2.0.md), [Gameplay Rules Catalog](gameplay-rules-catalog.md), [Balance Tables](balance-tables.md) và [Content Catalog](content-catalog.md). Hồ sơ `About Game — Working Draft v2.0` là đầu vào cũ; quyết định mới hơn trong PRD được ưu tiên khi có khác biệt.
**Quy ước:** BA-A2-D là quyết định được người dùng xác nhận trong vòng đầu; BA-A2-Q và BA-A2-E là mã câu hỏi đã được trả lời trong các vòng tiếp theo. Bản About Game có nhắc AI01–AI12/AJ01–AJ12 nhưng không kèm sổ đầy đủ, nên không gán lại nội dung cho các mã đó.

## Quyết định đã xác nhận

| ID | Quy tắc | Nguồn và hệ quả trực tiếp |
|---|---|---|
| BA-A2-D01 | Giới hạn tối đa 3 gia tộc/bản đồ tính theo **nơi cư trú chính** của gia tộc. | Người dùng xác nhận BA-A2-Q01. Thành viên đi qua bản đồ khác không chiếm suất; Q06 và Q12 đã chốt xử lý mất biệt viện/đổi nơi cư trú. |
| BA-A2-D02 | Thời gian chờ hồi sinh 24 giờ thực của thú gia tộc thông thường bắt đầu **từ lúc cấp phép hồi sinh**. | Người dùng xác nhận BA-A2-Q02. Hạn cấp phép 3 ngày vẫn tính từ lúc chết; Q09 đã chốt hủy/cấp lại sẽ tính lại 24 giờ. |
| BA-A2-D03 | Hạn 3 ngày thực không có thủ lĩnh mang thân xác **tự bắt đầu khi mất thân xác hợp lệ**. | Người dùng xác nhận BA-A2-Q03, đồng thời nhấn mạnh Alpha 2.0 là multiplayer. Hạn này độc lập với hạn 7 ngày mất biệt viện theo §17. |
| BA-A2-D04 | Thú gia tộc DEAD **chưa được cấp phép** không chiếm suất. Nếu gia tộc đầy suất khi xin cấp phép thì **từ chối cấp phép**. | Người dùng xác nhận BA-A2-Q04. Giới hạn ban đầu 10 suất được thay bằng 100 suất tại BA-A2-CAP-01; hạn cấp phép 3 ngày từ lúc chết vẫn áp dụng. |
| BA-A2-D05 | Người chơi chỉ được nhập hồn trực tiếp vào thủ lĩnh của mình; khi đó ý thức thủ lĩnh tạm ngủ. | Người dùng xác nhận BA-A2-Q05 và làm rõ tại Q19: nhập hồn trực tiếp chưa triển khai trong Alpha. Xuất hồn quan sát xuyên bản đồ được triển khai; cơ chế chuyển linh hồn thủ lĩnh đã chết sang thân xác mới được chốt riêng tại Q08/Q15–Q21. |
| BA-A2-D06 | Gia tộc mất biệt viện **tiếp tục giữ suất cư trú 1/3** trên bản đồ cư trú chính trong hạn khôi phục 7 ngày. | Người dùng xác nhận BA-A2-Q06. Khi giải tán suất được giải phóng; Q12 đã chốt đổi nơi cư trú nguyên tử. |

## Quyết định đã chốt sau vòng đầu

| Mã câu hỏi | Kết quả đã duyệt | Vị trí trong PRD |
|---|---|---|
| Q07–Q09 | Một người chơi/gia tộc; chuyển thủ lĩnh cũ sang thú khác hoặc hồi sinh đặc biệt; hủy/cấp lại hồi sinh tính lại 24 giờ. | §§4, 9–10 |
| Q10–Q12 | Chốt trạng thái khi chiến tranh bắt đầu và hủy lệnh dở; giải tán xét trước sự kiện cùng mốc; đổi nơi cư trú chiếm/nhả suất cùng lúc. | §§3, 8, 10 |
| Q13–Q21 | Ba ngày thiếu thân xác vẫn chạy khi offline; hồn quan sát xuyên bản đồ; không nhập hồn trực tiếp trong Alpha; thủ lĩnh mới giữ đặc tính thân xác nhận; chuyển hồn/hồi sinh đặc biệt tức thời khi hợp lệ. | §§4, 10 |
| Q22–Q24 | Vòng đời chiến tranh theo lượt, chiêu mộ, thai kỳ 24 giờ, vật phẩm rơi một đơn vị. | §§5, 8–9 |
| Q25–Q30 | Bảng tu vi điểm thập phân; web máy tính; AI thủ lĩnh theo quy tắc; năm game 360 ngày; mục tiêu tải, độ trễ và phục hồi đã duyệt. | §§2, 6, 12 |
| E01–E04 | Chỉ thủ lĩnh tiến hóa tối đa bậc 3; ban đầu là sói; thủ lĩnh chuyển thân xác dùng nhánh loài mới; tám nhóm có thể chiêu mộ. | §§3, 7 |
| E05–E08 | Có tầng con mồi không tiến hóa; giữ tên bậc nhưng dời hành vi liên quan con người; nhánh thần thú và điều kiện mới để sau Alpha. | §§2–3, 7 |
| E09–E12 | Ba mảnh pháp bảo khởi đầu; mốc mở bậc 2/3; một dòng tiến hóa cho mỗi nhóm Chim/Cá; bảng cân bằng được phép TBD. | §§4, 7, Phụ lục A |
| E13 | Giữ bốn bản đồ, đổi Kinh thành thành vùng cư trú hoang sơ và bỏ hải tặc khỏi Alpha trước khi có con người. | §§2–3 |
| BA-REC-01–03 | Một luật chiêu mộ chung cho tám nhóm: thủ lĩnh tương tác trực tiếp với thú hoang sống, chưa từng được chiêu mộ, không đang chiến đấu; đủ suất và biệt viện hợp lệ thì thành công chắc chắn, không tốn tài nguyên. Tạm mất biệt viện thì chặn chiêu mộ; tầng con mồi nền không thể chiêu mộ. | §§3, 5, FR-06 |
| BA-A2-CAP-01 | Thay giới hạn 10 bằng **giới hạn cứng 100 suất/gia tộc**. | §§2–3, 5, 12; FR-05, NFR-02 |
| BA-A2-CAP-02 | Chiến tranh vẫn tối đa **10 thú/bên**, không tăng theo quy mô gia tộc. | §8, FR-12 |
| BA-A2-CAP-03 | Cách tính suất giữ nguyên: thủ lĩnh và thú sống, thú DEAD đã cấp phép hồi sinh, suất thai kỳ; thú DEAD chưa cấp phép không chiếm suất. | §5, FR-05 |
| BA-EVO-01 | Mỗi nhóm loài có điều kiện tiến hóa riêng ở bậc 2 và 3; Product Owner sẽ viết lại điều kiện cụ thể. Bảng đề xuất trước đó chưa được duyệt. | §7, Phụ lục A, FR-09 |
| BA-EVO-02 | Bậc 2: 2 nguyên liệu tiến hóa và 15 phút thực; bậc 3: 5 nguyên liệu tiến hóa và 60 phút thực. | §7, FR-09 |
| BA-EVO-03 | Chỉ thủ lĩnh có trí tuệ; mô tả “mở linh trí/khai trí” của hình thái tiến hóa không trao trí tuệ độc lập cho thú khác. | §§4, 7 |
| BA-EVO-04 | Chốt tên bậc phàm thai của tám dòng có thể chiêu mộ: Nguyên Xà, Nguyên Hồ, Nguyên Quy, Nguyên Hầu, Nguyên Lang, Nguyên Hổ, Nguyên Điểu, Nguyên Ngư. Đây là tên dòng/bậc 1, không thay đổi luật chỉ thủ lĩnh được tiến hóa; tên bậc 2–3 vẫn là tên làm việc. | §7; FR-09; `content-catalog.md` |
| BA-RES-01 | Người dùng xác nhận nội dung định tính của `ImmotalClan_resroucesInMap.md`: Đói/Khát cho mọi thú sống, chế độ ăn và tốc độ đói tương đối, FSM tìm ăn/uống, thịt từ thú hoang, ba bậc thịt/linh thảo/quặng, phân bố tài nguyên và tái sinh quần thể theo thức ăn/nước. Các mục `[CẦN QUYẾT]` chưa được trả lời ở Q01–Q06 vẫn TBD; bậc thịt đã chuyển sang xét theo cảnh giới tại Q04. | §§3, 5, 12; FR-19–FR-20, Phụ lục A |
| BA-RES-02 | Bỏ trần 1.000 NPC nêu trong tệp tài nguyên. Giữ mục tiêu thử tải PRD: 12 gia tộc × 100 suất và 200 thú hoang/bản đồ. Tên “Vùng Lập Tổ” trong tệp là Vùng cư trú hoang sơ ở Alpha. | §§3, 12; NFR-02 |
| BA-RES-Q01 | Đói hoặc Khát về 0 gây suy yếu vận động/chiến đấu, sau đó mất HP dần và có thể chết; ngưỡng và tốc độ còn TBD. | §5, FR-19, Phụ lục A |
| BA-RES-Q02 | Đói/Khát đóng băng khi EVOLVING hoặc DEAD; hồi sinh và vào chiến tranh thì đầy; thai kỳ không tăng nhu cầu trong Alpha. | §§5, 7–9; FR-07, FR-12–FR-13, FR-19 |
| BA-RES-Q03 | Quyết định ban đầu: khi offline thú gia tộc tự dùng thức ăn kho rồi tự kiếm; linh thảo không lấp Đói, thú hoang không lấy đồ kho. **Quyền ăn kho đã được OPEN-02 làm rõ: cần chủ bật cho phép.** | §5, FR-19–FR-20 |
| BA-RES-Q04 | Ba bậc thịt theo cảnh giới thú bị giết: chưa vào Tụ Khí → thú phàm, Tụ Khí → linh thú, Ngưng Đan → yêu thú. Không cấm săn chỉ vì cùng nhóm loài. | §5, FR-20 |
| BA-RES-Q05 | Đói từ đầy về 0 sau 6 giờ thực ở Hổ/Sói, 12 giờ ở Cá/Khỉ/Cáo/Chim, 24 giờ ở Rắn/Rùa; Khát của thú cạn sau 6 giờ thực. Thú ở trong nước phù hợp có Khát đầy. | §5, FR-19 |
| BA-RES-Q06 | Khi Đói hoặc Khát về 0: di chuyển và công kích giảm 20%; sau 30 phút liên tục ở 0 mất 5% HP tối đa mỗi giờ, có thể chết; phục hồi dinh dưỡng thì ngừng hình phạt. Hai thanh cùng 0 áp dụng một lần. | §5, FR-19 |
| BA-RES-Q07 | Thú ăn cỏ/con mồi nhỏ trên cạn và cá nhỏ/đàn cá có Đói từ đầy về 0 sau 12 giờ thực. Con mồi cạn có Khát từ đầy về 0 sau 6 giờ; cá trong nước phù hợp có Khát đầy. | §5, FR-19 |
| BA-RES-Q08 | Cá chỉ đi trên ô nước và lối chuyển bản đồ nối vùng nước hợp lệ, không ở trên ô đất. Rùa có thể lên cạn; khi lên cạn Khát giảm theo mốc 6 giờ thực. | §§3, 5; FR-03, FR-19 |
| BA-RES-Q09 | Mọi thú sống có thể tự kiếm ăn, gồm thú gia tộc, thú hoang và con mồi, bắt đầu tìm thức ăn khi Đói ≤ 40/100, trừ lúc phải ưu tiên phòng vệ; `EVOLVING` đóng băng Đói và không tìm ăn. Không dùng đơn vị “bữa ăn” bắt buộc. Số miếng thịt, lượng hồi Đói/Khát và sản lượng từ xác thú vẫn TBD. | §5; FR-19; `food-web-alpha.md` |
| BA-RES-Q10 | Sơ đồ chuỗi thức ăn biểu thị loài **có thể** bị ăn/ăn, không buộc thú luôn tìm loài đó để săn. Alpha dùng sơ đồ khái quát đã đề xuất: cả tám nhóm thú có thể chiêu mộ, khi còn hoang, đều có thể thành con mồi nếu bị giết; thú ăn nguồn thịt phù hợp chế độ ăn của cá thể. | §5; FR-19–FR-20; `food-web-alpha.md` |
| BA-RES-Q11 | Thú gia tộc chết **không cho thịt trong Alpha**; khả năng đó để sau Alpha. | §§5, 9; FR-13–FR-14, FR-20 |
| BA-RES-Q12 | Khi có nhiều nguồn ăn phù hợp, ưu tiên nguồn an toàn, tiếp cận được không cần giao đấu; thiếu nguồn thì xét con mồi hoang có thể hạ, ít rủi ro và gần hơn. Sơ đồ thức ăn chỉ là danh sách khả năng. | §5; FR-19; `food-web-alpha.md` |
| BA-RES-Q13 | Bắt đầu tìm ăn khi Đói ≤ 40/100; tiếp tục đến Đói ≥ 80/100 hoặc tạm dừng vì nguy hiểm/thiếu nguồn; chỉ mở đợt mới khi xuống lại ≤ 40. | §5; FR-19; `BAL-SUR-*` |

## Quyết định trong lượt BA-A2-OPEN-01–22

| ID | Quyết định đã nhận | Truy vết |
|---|---|---|
| OPEN-01 | Tự tìm nước khi Khát ≤ 40/100. Câu trả lời chỉ nêu mốc 40; ngưỡng dừng tìm nước chưa chốt. | §5; FR-19 |
| OPEN-02 | Thú gia tộc tự săn/tìm ăn cả online lẫn offline. Chỉ được tự lấy thức ăn kho khi chủ bật quyền cho phép ăn từ kho; quyền này tiếp tục có hiệu lực lúc offline. | §5; FR-19 |
| OPEN-03 | Thịt bậc cao hồi nhiều Đói hơn bậc thấp; mức cụ thể chờ bảng cân bằng. | §5; FR-20 |
| OPEN-04 | Chỉ thú hoang **bị giết** mới cho thịt; thú hoang chết do Đói/Khát hoặc nguyên nhân tự nhiên không cho thịt. | §§5, 9; FR-20 |
| OPEN-05 | Thịt thú hoang rơi công cộng ngay, biến mất sau 30 phút thực nếu chưa nhặt. | §§5, 9; FR-20 |
| OPEN-06 | Nguồn thức ăn/nước hữu hạn bị tranh chấp: yêu cầu hợp lệ được server ghi nhận trước sử dụng trước. | §§5, 12; NFR-01 |
| OPEN-07 | Kiểu ăn của Chim/Cá cố định theo cá thể từ lúc xuất hiện; không phải mọi cá thể ăn được mọi nguồn của nhóm. | §§3, 5; FR-19 |
| OPEN-08 | Khả năng sống ở nước ngọt/mặn/cả hai của Cá/Rùa được gắn khi cá thể xuất hiện. | §§3, 5; FR-03, FR-19 |
| OPEN-09 | Bắt đầu thai kỳ cần hai thú trưởng thành cùng loài, một đực và một cái. Tuổi trưởng thành cụ thể chưa chốt. | §5; FR-07 |
| OPEN-10 | Bố chết sau khi bắt đầu thai kỳ không hủy thai kỳ. | §5; FR-07 |
| OPEN-11 | Alpha không có huyết mạch/thể chất ẩn. Thức tỉnh theo môi trường và thảo dược đặc biệt là định hướng sau Alpha, không đưa ví dụ Băng Linh Thể/Băng Quả vào danh mục Alpha. | §§5, 7, Phụ lục B; FR-07 |
| OPEN-12 | Tám kỹ năng nền được phân theo nhóm loài; phân bổ và trị số chờ bảng nội dung/cân bằng. | §8, Phụ lục A |
| OPEN-13 | Chủ online chọn hành động từng thú trong chiến tranh; bên offline do FSM/server xử lý. | §8; FR-12 |
| OPEN-14 | Hết 12 lượt, tỷ lệ HP mỗi bên = tổng HP hiện tại / tổng HP tối đa của đội hình ban đầu; thú chết tính 0 HP hiện tại. | §8; FR-12 |
| OPEN-15 | Xác suất đột phá giảm dần theo cảnh giới/giai đoạn; các tỷ lệ chưa chốt. | §6; FR-08 |
| OPEN-16 | Không giữ tu vi dư khi đột phá sang giai đoạn mới, kể cả dư từ linh thảo; thay quyết định cũ về bảo lưu phần dư. | §6; FR-08 |
| OPEN-17 | Mỗi dòng tiến hóa dùng nguyên liệu riêng, giữ lượng tiêu hao 2/5 đã duyệt; tên và nguồn thu nhận còn TBD. | §7; FR-09 |
| OPEN-18 | Product Owner yêu cầu nghiên cứu nguồn và trình **một bộ số cân bằng thử nghiệm** cho pháp bảo, kỹ năng/chỉ số, di truyền, linh thảo và các ô còn thiếu để duyệt; chưa tự duyệt số nào. | Phụ lục A; `proposals/balance-v0.1.md` |
| OPEN-19 | Thiết kế lại **cả bốn bản đồ Alpha**; bản đồ prototype hiện có không mặc định là bản đồ Alpha cuối cùng. | §3; FR-03 |
| OPEN-20 | Quần thể thú hoang có thể tái sinh dần từ 0 khi nguồn thức ăn/nước và sức chứa vùng phục hồi. | §3; FR-20 |
| OPEN-21 | Nếu điểm rơi ở lối chuyển bản đồ/ô không thể đặt, tìm ô hợp lệ gần nhất trên **bản đồ nơi thú chết**. | §9; FR-14 |
| OPEN-22 | Khi nhiều vật phẩm kho cùng phẩm cấp cao nhất lúc pháp bảo bị phá, chọn ngẫu nhiên một vật phẩm trong nhóm đồng hạng. | §10; FR-16 |

## Việc còn lại sau BA phạm vi

Các điều kiện riêng theo nhóm loài, hiệu ứng tiến hóa, hệ số, xác suất và bản đồ nội dung chi tiết ở [Phụ lục A của PRD](prd-alpha-2.0.md#phụ-lục-a-bảng-cân-bằng-và-nội-dung-còn-tbd) vẫn **TBD**. Chi phí và thời lượng tiến hóa bậc 2–3 tại BA-EVO-02 đã được duyệt; các chi phí và thời lượng khác chưa chốt không được tự coi là luật. Demo A v1.0 tiếp tục là baseline riêng.
