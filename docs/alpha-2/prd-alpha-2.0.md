# Tiên Tộc — PRD Alpha 2.0

**Loại tài liệu:** Product Requirements Document
**Trạng thái:** Bản PRD tạm; đủ làm baseline phạm vi BA, chưa đủ để triển khai và nghiệm thu toàn bộ Alpha vì Phụ lục A còn TBD
**Cập nhật:** 28/10/2026
**Nền tảng Alpha:** Web trên máy tính
**Mô hình:** Multiplayer, mỗi server là một thế giới độc lập

**Tài liệu đi cùng:** [Gameplay Rules Catalog](gameplay-rules-catalog.md) · [Balance Tables](balance-tables.md) · [Content Catalog](content-catalog.md) · [Sổ quyết định BA](ba-decision-register.md)

## 1. Nguồn và cách hiểu

PRD này tổng hợp hồ sơ `About Game — Working Draft v2.0`, các quyết định người dùng xác nhận trong vòng BA Alpha 2.0, hồ sơ `Animal_evolution.md` ngày 27/10/2026 và hồ sơ `ImmotalClan_resroucesInMap.md` ngày 28/10/2026. Quyết định trực tiếp mới hơn được ưu tiên khi khác bản thảo cũ. Hồ sơ tiến hóa tự ghi nhãn `[DOC]`, `[NGUỒN]`, `[ĐỀ XUẤT]` và `[THIẾU]`; việc dùng hồ sơ làm đầu vào **không** tự duyệt mọi bậc, công thức hoặc điều kiện trong đó. Người dùng đã xác nhận nội dung định tính của hồ sơ tài nguyên/bản đồ, ngoại trừ trần 1.000 NPC; những mục hồ sơ ghi `[CẦN QUYẾT]` vẫn là TBD.

PRD ghi lại **hành vi và phạm vi sản phẩm đã được duyệt**. Những trị số được người dùng chọn để cân bằng sau được ghi rõ ở Phụ lục A và không được xem là luật đã duyệt. Các yêu cầu phụ thuộc trị số TBD chưa thể nghiệm thu đầy đủ. Demo A v1.0 là baseline riêng, không bị tài liệu này thay thế.

**Mức sẵn sàng:** có thể dùng để lập kế hoạch và thiết kế hệ thống Alpha. Chưa thể dùng làm đặc tả triển khai hoàn chỉnh cho tiến hóa, chiến đấu, vật phẩm và pháp bảo cho đến khi chốt các bảng ở Phụ lục A, tài liệu bản đồ/nội dung và hợp đồng trạng thái server.

## 2. Tầm nhìn và mục tiêu Alpha

Người chơi là một linh hồn cư trú trong pháp bảo, khai sáng một con sói làm thủ lĩnh có ý thức, rồi xây dựng gia tộc yêu thú trong một thế giới chạy liên tục trên server. Trải nghiệm chính gồm sinh tồn, chiêu mộ, quản lý tối đa 100 suất gia tộc, tu luyện, tiến hóa thủ lĩnh, xây biệt viện, chiến đấu và chiến tranh với gia tộc khác.

Alpha đặt **sau khi Bàn Cổ khai thiên và trước khi con người xuất hiện**. Muôn thú đã có quần thể đủ để duy trì hệ sinh thái, nhưng các thần thú tối thượng chưa cai quản thế giới. Ý tưởng dài hạn của loạt game là các dòng loài dần sinh ra thần thú và định hình trật tự thế giới; thời đại con người thuộc game tiếp theo. Alpha **không** kết thúc bằng sự xuất hiện của Tổ Long, Phượng Hoàng hoặc một thần thú cuối khác.

Lần đăng nhập đầu tiên của tài khoản hiển thị đoạn giới thiệu cốt truyện **một lần duy nhất**. Bản lời dẫn hiện có là bản thảo nội dung; điều kiện hiển thị một lần đã được chốt.

### 2.1. Trong phạm vi Alpha

- Web trên máy tính; bốn bản đồ/server; tối đa 12 gia tộc/server.
- Một người chơi sở hữu và ra lệnh cho một gia tộc; server tiếp tục mô phỏng khi họ offline.
- Khởi đầu bằng sói; ba lựa chọn pháp bảo khởi đầu; thủ lĩnh có ý thức riêng và AI theo quy tắc.
- Tám nhóm thú có thể chiêu mộ; tầng thú hoang làm con mồi và nguồn thức ăn.
- Hai đại cảnh giới Tụ Khí và Ngưng Đan; tiến hóa chỉ cho thủ lĩnh, tối đa bậc 3.
- Chiến đấu thường thời gian thực; chiến tranh gia tộc theo lượt.
- Vòng đời biệt viện, thủ lĩnh, hồi sinh, chuyển hồn, giải tán và Game Over.
- MySQL 8.4 là cơ sở dữ liệu chính; Simulation Core trên server có thẩm quyền.

### 2.2. Ngoài phạm vi Alpha

- App di động; LLM riêng cho NPC; nhập hồn trực tiếp vào thủ lĩnh. Người chơi **không được** nhập vào thủ lĩnh của người chơi khác, kể cả trong định hướng sau Alpha.
- Hóa Hình, Yêu Tướng, Yêu Vương; hình thái biến thành người; bậc tiến hóa 4–6 và thần thú cuối.
- Pha trăng, bão làm điều kiện tiến hóa, lôi kiếp/thiên kiếp, dung hợp hai loài, chuỗi nhiệm vụ tiến hóa mới.
- Nhánh cá chép hóa rồng và các đích Phượng Hoàng/Kim Sí Đại Bằng như hệ thống có thể chơi; chi tiết sẽ thiết kế riêng sau Alpha.
- Hải tặc, con người và các bước tiến hóa phụ thuộc việc tiếp xúc với con người.
- Hệ thống quốc gia, tự chuyển quyền sở hữu biệt viện hoặc tự phát thưởng chỉ vì thắng chiến tranh; cơ chế kết thúc cả thế giới khi thần thú xuất hiện.

## 3. Thế giới, thời gian và quần thể

| Bản đồ/server | Vai trò trong Alpha |
|---|---|
| Vùng cư trú hoang sơ | Khu cư trú và phát triển gia tộc; thay tên và bối cảnh **Kinh thành** của bản thảo cũ. |
| Khu rừng | Yêu thú, linh thảo, quặng và tài nguyên. |
| Biển Đông | Đảo, hải thú và tài nguyên đặc thù; **không có hải tặc** trong Alpha. |
| Bãi hoang | Yêu thú và tài nguyên thưa thớt. |

Mỗi bản đồ có tối đa **3 gia tộc tính theo nơi cư trú chính**, không tính theo thú đang đi qua. Khi mất biệt viện, gia tộc vẫn giữ suất cư trú trong hạn khôi phục 7 ngày. Đổi nơi cư trú chỉ thành công khi nơi mới hợp lệ và còn suất; chiếm suất mới và nhả suất cũ **cùng lúc**. Di chuyển liên bản đồ áp dụng cho thú gia tộc; loài di cư có ngoại lệ thích nghi môi trường. Đường đi bị chặn liên tục 10 giây thì dịch chuyển tới vị trí hợp lệ gần nhất trên cùng bản đồ.

**Cả bốn bản đồ Alpha sẽ được thiết kế lại.** Bản đồ tạo trước đây chỉ là tài sản prototype, không được mặc định là bản đồ khởi đầu hoặc bản đồ Alpha cuối cùng.

Tám nhóm có thể chiêu mộ là **Rắn, Cáo, Rùa, Khỉ, Sói, Hổ, Chim và Cá**. Trong Alpha, Chim là một dòng tiến hóa chung và Cá là một dòng tiến hóa chung; chưa tách thành các loài khởi điểm khác nhau. Tầng thú ăn cỏ, con mồi nhỏ và sinh vật biển là quần thể thú hoang làm nền sinh thái, **không tiến hóa, không thể chiêu mộ**. Giới hạn 100 suất/gia tộc và mục tiêu thử tải 200 thú hoang/bản đồ không phải tổng số sinh vật trong cốt truyện.

**Một ngày thực = một năm game = 360 ngày game.** Vì vậy một ngày game kéo dài 4 phút thực và một giờ game kéo dài 10 giây thực. Giờ game điều khiển ngày đêm và hai cửa sổ tinh hoa; các hạn tử vong, hồi sinh, biệt viện, vật phẩm rơi và debuff dùng đồng hồ thực của server.

### 3.1. Phân bố tài nguyên và sức chứa sinh thái

- Nước có ở sông, suối, ao, hồ và đầm; mỗi lãnh thổ cần có ít nhất một điểm nước, Bãi hoang có ít điểm hơn. Cỏ, quả và hạt là tài nguyên tĩnh mọc lại, nhiều ở Khu rừng và thưa ở Bãi hoang; chúng không chiếm ngân sách NPC.
- Linh thảo mọc thành cụm gần nước và linh mạch, loại quý gần linh mạch lớn. Quặng phân bố theo địa hình núi đá, mạch khoáng và ven sông. Linh mạch có thể ở thung lũng, chân thác, cửa sông, đảo hoặc núi ngầm. Điểm đặt biệt viện ưu tiên gần nước và nơi trú ẩn. Tọa độ, mật độ và chu kỳ tái sinh cụ thể còn TBD.
- Mật độ mục tiêu của từng loài phụ thuộc nguồn thức ăn và nước tại vùng. Quần thể dưới mục tiêu tái sinh dần, trên mục tiêu thì ngừng tái sinh; **kể cả khi quần thể vùng đã về 0, cá thể mới vẫn tái sinh dần nếu thức ăn/nước đã phục hồi**. Con mồi thiếu thực vật thì không tái sinh, thú săn mồi hoang thiếu con mồi thì không tái sinh. Cá nhỏ có thể được mô phỏng bằng một đàn đại diện nhiều con. Quy tắc chi tiết cho di cư khi thiếu mồi còn TBD.
- Cá chỉ di chuyển trên ô nước hợp lệ và qua lối chuyển bản đồ nối các vùng nước hợp lệ; không tồn tại trên ô đất. Tuyến sông nối Biển Đông cần được thể hiện trong dữ liệu bản đồ. Rùa có thể lên cạn và xuống nước. Mỗi cá thể Cá/Rùa được gắn khả năng sống ở nước ngọt, nước mặn hoặc cả hai **khi xuất hiện**; đường đi và điểm chuyển bản đồ phải tuân loại nước đó. Tọa độ và loại nước của từng vùng còn chờ thiết kế lại bốn bản đồ.
- Bỏ trần **1.000 NPC** nêu trong hồ sơ tài nguyên; mục tiêu thử tải hiện hành vẫn là mục 12. Mọi chỗ gọi “Vùng Lập Tổ” trong hồ sơ tài nguyên được hiểu là **Vùng cư trú hoang sơ** của Alpha.

## 4. Pháp bảo, thủ lĩnh và quyền điều khiển

Người chơi chọn **một trong ba mảnh pháp bảo khởi đầu** làm vật chứa linh hồn. Các bản gốc không xuất hiện nguyên vẹn và không thể tạo thêm pháp bảo khởi đầu trong lúc chơi.

| Lựa chọn | Vai trò đã duyệt |
|---|---|
| Mảnh Hỗn Độn Thanh Liên | Có khả năng hồi sinh trực tiếp thủ lĩnh cũ khi hợp lệ. |
| Mảnh Tạo Hóa Ngọc Điệp | Hỗ trợ hướng tu luyện; mức hỗ trợ TBD. |
| Mảnh Hỗn Độn Châu | Hỗ trợ kho/tài nguyên; mức hỗ trợ TBD. |

Pháp bảo ban đầu không tự di chuyển, có đúng một lần khai sáng đặc biệt và khai sáng ban đầu chỉ lên **một con sói**. Thời gian khai sáng là 5 giây. Nếu nhiều người chơi cùng nhắm một mục tiêu, yêu cầu hợp lệ được server xử lý trước thắng. Sau khai sáng, sói trở thành thủ lĩnh có ý thức và mang pháp bảo.

Linh hồn người chơi và ý thức thủ lĩnh là hai thực thể khác nhau. Người chơi ra lệnh và điều khiển thủ lĩnh **thông qua pháp bảo**. Thủ lĩnh có cảm xúc, trí nhớ giới hạn, học hỏi và lập kế hoạch theo **hệ quyết định có quy tắc**, không cần LLM thật; lệnh trực tiếp hợp lệ của chủ sở hữu được ưu tiên. Thú gia tộc thông thường dùng State Machine, không có ý thức độc lập như thủ lĩnh.

Alpha cho phép linh hồn người chơi **xuất hồn quan sát xuyên các bản đồ**, không tác động lên thế giới; các hồn người chơi có thể nhìn thấy nhau. Tính năng người chơi nhập hồn trực tiếp vào thân xác thủ lĩnh **chưa xây trong Alpha**. Khi tính năng này được xây sau Alpha, chỉ chủ sở hữu được nhập vào thủ lĩnh của mình và ý thức thủ lĩnh tạm ngủ. Quy tắc đó khác với **chuyển linh hồn/ý thức thủ lĩnh đã chết sang thân xác mới** ở mục 10.

## 5. Gia tộc, chiêu mộ, sinh sản và sinh tồn

Một gia tộc cần thủ lĩnh và biệt viện hợp lệ để thành lập. Giới hạn cứng là **100 suất**, tính theo:

`thú sống (gồm thủ lĩnh) + thú DEAD đã cấp phép hồi sinh + suất thai kỳ đang giữ`.

Thú DEAD chưa được cấp phép không chiếm suất. Nếu gia tộc đã đầy suất khi xin cấp phép hồi sinh, server từ chối cấp phép và không giữ suất trước. Mọi thao tác tranh suất phải được server phân xử để không vượt 100.

Áp dụng **một luật chiêu mộ chung** cho cả tám nhóm: thủ lĩnh tương tác trực tiếp với thú hoang còn sống, chưa từng được chiêu mộ và không đang chiến đấu; gia tộc phải còn suất và có biệt viện hợp lệ. Đủ điều kiện thì **thành công chắc chắn, không tốn tài nguyên**; không có thử thách riêng từng nhóm trong Alpha. Khi gia tộc tạm mất biệt viện trong hạn khôi phục, chặn chiêu mộ mới cho đến khi khôi phục biệt viện hợp lệ. Tầng con mồi nền không thể chiêu mộ. Một thú đã từng được chiêu mộ không thể được chiêu mộ lần thứ hai bởi bất kỳ gia tộc nào. Hai yêu cầu tranh cùng một thú hoặc suất cuối: yêu cầu hợp lệ được server ghi nhận trước thắng. Thú mới gia nhập tự di chuyển tới biệt viện hợp lệ, có thể qua bản đồ khác; sau định cư mới nhận nhiệm vụ.

Sinh sản cần **hai thú trưởng thành cùng loài, một đực và một cái**, còn sống và gia tộc còn suất. Một thai kỳ giữ một suất ngay khi bắt đầu, kéo dài **24 giờ thực**, sinh **một con**; khi sinh, suất giữ chuyển sang con non, không cộng thêm suất thứ hai. Mẹ chết thì thai kỳ kết thúc và trả suất; bố chết sau khi thai kỳ bắt đầu thì thai kỳ tiếp tục; thủ lĩnh chết không tự hủy thai kỳ; gia tộc giải tán thì tiến trình kết thúc. **Thai kỳ không tăng nhu cầu thức ăn/nước trong Alpha.** Con non có một huyết mạch và một thể chất bẩm sinh; có thể di truyền hoặc đột biến. Trong Alpha, đột biến chọn một loại khác bố mẹ **trong danh mục đã thiết kế**; xác suất vẫn TBD. **Alpha không có huyết mạch hoặc thể chất ẩn.** Cơ chế thức tỉnh theo môi trường/thảo dược đặc biệt, chẳng hạn Băng Linh Thể trong môi trường băng hoặc nhờ Băng Quả, để giai đoạn sau; các ví dụ này không đưa thêm nội dung vào Alpha.

### 5.1. Đói, khát và thức ăn

- **Mọi thú sống**, gồm thủ lĩnh, thú gia tộc, thú hoang và tầng con mồi, có hai thanh độc lập là **Đói** và **Khát**. Hai thanh giảm theo thời gian thực của server, kể cả khi người chơi offline. Thức ăn phù hợp chế độ ăn lấp Đói; nước lấp Khát. Ăn thức ăn thường và săn mồi không tự cho tu vi. Khi Đói **hoặc** Khát về 0, tốc độ di chuyển và sức tấn công giảm **20%**. Nếu tình trạng một trong hai thanh ở 0 liên tục **30 phút thực**, thú bắt đầu mất **5% HP tối đa mỗi giờ thực** và có thể chết. Ăn/uống để không còn thanh nào ở 0 thì dừng mất HP và bỏ mức giảm; cả hai cùng ở 0 không nhân đôi hình phạt.
- Thanh Đói từ đầy về 0 sau **6 giờ thực** ở Hổ/Sói, **12 giờ thực** ở Cá/Khỉ/Cáo/Chim và **24 giờ thực** ở Rắn/Rùa, nếu không ăn. **Thú ăn cỏ và con mồi nhỏ trên cạn** dùng mốc **12 giờ thực**; **cá nhỏ/đàn cá** cũng dùng mốc **12 giờ thực**. Khi **Đói ≤ 40/100**, mọi thú sống có thể tự kiếm ăn, kể cả thú gia tộc và thú hoang, bắt đầu tìm nguồn thức ăn phù hợp bằng FSM khi không có nguy hiểm tức thời; `EVOLVING` không kích hoạt do Đói đóng băng. Một đợt tìm ăn kết thúc khi **Đói ≥ 80/100** hoặc tạm ngừng do nguy hiểm/không còn nguồn hợp lệ; đợt mới chỉ kích hoạt khi Đói lại xuống ≤ 40. Không dùng khái niệm bữa ăn bắt buộc; lượng thức ăn cần dùng và lượng Đói hồi còn TBD. Chế độ ăn theo nhóm là Hổ/Sói/Rắn ăn thịt, Cáo/Rùa ăn tạp, Khỉ chủ yếu ăn thực vật, Chim/Cá dùng kiểu ăn **cố định theo cá thể từ lúc xuất hiện**; không phải mọi Chim/Cá đều ăn được mọi nguồn của nhóm.
- Thanh Khát của thú cạn, gồm tầng con mồi cạn, từ đầy về 0 sau **6 giờ thực** nếu không uống. Thú có thể tự tìm nước khi **Khát ≤ 40/100**; ngưỡng dừng tìm nước chưa được chốt. Cá và Rùa ở trong môi trường nước phù hợp có Khát đầy; loại nước hợp lệ (ngọt, mặn hoặc cả hai) được gắn cho từng cá thể khi xuất hiện. Khi Rùa lên cạn, Khát giảm theo mốc **6 giờ thực**. Cá không lên ô đất và không đi qua vùng nước không hợp lệ. Nước mặn không làm đầy Khát của thú cạn. Nguồn nước uống cho thú cạn là sông, suối, ao, hồ và đầm. Thú hoang không lấy thức ăn từ kho gia tộc.
- FSM của thú thường có hành vi **tìm thức ăn, ăn, tìm nước, uống**. Khi gặp nguy hiểm, ưu tiên phòng vệ; tiếp theo xử lý đói/khát nghiêm trọng, rồi nhiệm vụ thường. Thú gia tộc **tự kiếm ăn cả khi chủ online lẫn offline**. Người chơi có công tắc **cho phép ăn từ kho biệt viện**; chỉ khi được cho phép, thú mới tự dùng thức ăn phù hợp trong kho, kể cả lúc chủ offline. Khi có nhiều nguồn phù hợp, ưu tiên nguồn tiếp cận được không cần giao đấu (kho được phép dùng, thực vật, thịt có sẵn); nếu thiếu, xét con mồi hoang có thể hạ, chọn mục tiêu ít rủi ro và gần hơn. Sơ đồ thức ăn không buộc thú săn một loài cố định. Hai yêu cầu cùng tranh nguồn hữu hạn được server xử lý theo thứ tự ghi nhận hợp lệ đầu tiên. Thú săn mồi hoang tìm mồi trong lãnh thổ. Thẻ thủ lĩnh và chi tiết thú hiển thị hai thanh Đói/Khát, có biểu tượng và chữ cảnh báo khi nguy hiểm; ngưỡng cảnh báo giao diện còn TBD.
- **Chỉ thú hoang bị giết** mới cho thịt trong Alpha, gồm cả cá thể hoang thuộc tám nhóm có thể chiêu mộ; thú hoang chết vì Đói/Khát hoặc nguyên nhân tự nhiên không cho thịt. Thú gia tộc chết **không cho thịt trong Alpha**; hướng này để sau Alpha. Tầng con mồi nền gồm thú móng guốc, thỏ, gặm nhấm và sinh vật thủy sinh theo sinh cảnh của bốn bản đồ; lớp cỏ/quả/hạt nuôi thú ăn thực vật. [Sơ đồ thức ăn Alpha](food-web-alpha.md) ghi quan hệ **có thể ăn**, không phải lệnh luôn đi săn những loài đó. **Không cấm săn chỉ vì con mồi cùng nhóm loài.** Bậc thịt tính theo cảnh giới của thú bị giết: **thịt thú phàm** từ thú chưa vào Tụ Khí, **thịt linh thú** từ thú ở Tụ Khí, **thịt yêu thú** từ thú ở Ngưng Đan. **Bậc cao hồi nhiều Đói hơn**; sản lượng và lượng hồi cụ thể còn TBD. Thịt rơi **công cộng ngay** và biến mất sau **30 phút thực** nếu chưa được nhặt; quy tắc này khác vật phẩm rơi từ hành trang thú gia tộc.
- Linh thảo là nguồn tu vi khi được **chủ động sử dụng**, tách khỏi thực vật thức ăn thông thường và **không lấp Đói**. Hồ sơ tài nguyên chia thành **thượng phẩm** (linh chi, nhân sâm; ổn định, hiếm), **trung phẩm** (gừng, mẫu đơn; mức vừa, có thể có hiệu ứng phụ) và **hạ phẩm** (đại hoàng, nhân hạnh; mạnh hơn nhưng rủi ro). Đây là phân loại nội dung game; lượng tu vi, rủi ro và quy tắc thú hoang chủ động dùng linh thảo còn TBD.
- Quặng gồm nhóm **thường** (sắt, đồng), **quý** (vàng, bạc) và **linh khoáng** (đan sa, ngọc). Vai trò dự kiến là trang bị, trao đổi, nâng phẩm pháp bảo và điều kiện tiến hóa/đột phá; công thức dùng và chi phí chưa chốt.

## 6. Tu luyện, cảnh giới và chỉ số

Alpha có **Tụ Khí** và **Ngưng Đan**, mỗi đại cảnh giới gồm Sơ kỳ, Trung kỳ, Hậu kỳ, Viên mãn. Giới hạn là **Ngưng Đan Viên mãn 100%**; không thử lên Hóa Hình. Thú gia tộc, kể cả thành viên không phải thủ lĩnh, vẫn có thể tu luyện và đột phá. Quy tắc **chỉ thủ lĩnh được tiến hóa** không cấm chúng tu luyện. Thú hoang vẫn có thể tu luyện/đột phá theo luật cũ, nhưng không được tiến hóa.

Server lưu `current_cultivation` và `required_cultivation` bằng **điểm thập phân**. Giao diện chỉ tính `current / required × 100%` để hiển thị. Sau đột phá thành công, giai đoạn mới bắt đầu từ **0 điểm; không giữ phần tu vi dư**, kể cả dư từ linh thảo. Mỗi lần qua tiểu cảnh, yêu cầu tu vi nhân **1,5**; sau đại cảnh nhân **3**.

| Giai đoạn | Điểm tu vi cần đạt |
|---|---:|
| Tụ Khí Sơ kỳ | 100 |
| Tụ Khí Trung kỳ | 150 |
| Tụ Khí Hậu kỳ | 225 |
| Tụ Khí Viên mãn | 337,5 |
| Ngưng Đan Sơ kỳ | 1.012,5 |
| Ngưng Đan Trung kỳ | 1.518,75 |
| Ngưng Đan Hậu kỳ | 2.278,125 |
| Ngưng Đan Viên mãn | 3.417,1875 |

Tốc độ nền khi **chủ động tu luyện** là **0,5 điểm/phút thực** ở Tụ Khí và **1 điểm/phút thực** ở Ngưng Đan. Nguồn tăng tu vi hợp lệ gồm hấp thụ linh khí môi trường, Nhật Nguyệt Tinh Hoa và dùng linh thảo. Không nhận tu vi chỉ vì đứng trong linh khí, săn hoặc ăn con mồi. Trong khung giờ game **05:00–07:00** có Thái Dương Tinh Hoa; **23:00–01:00** có Thái Âm Tinh Hoa. Khi đủ điều kiện, nguồn tinh hoa được ưu tiên và không cộng đồng thời linh khí môi trường; hệ số riêng của nguồn vẫn TBD.

Tại 100%, thú có thể thử đột phá khi đủ điều kiện và không còn debuff. Xác suất thành công **giảm dần theo cảnh giới/giai đoạn**; bảng tỉ lệ cụ thể còn TBD. Đột phá thành công hồi đầy HP và linh lực. Thất bại giữ cảnh giới/giai đoạn, hạ điểm hiện tại về **80% điểm yêu cầu của giai đoạn đó**, áp dụng debuff **10 phút thực**, giảm **50%** tu vi nhận được và chặn thử lại trong thời gian debuff. Đột phá Tụ Khí Viên mãn → Ngưng Đan Sơ kỳ cần đứng trong linh mạch phù hợp **hoặc** tiêu hao bảo vật phù hợp; nếu cả hai đều có, ưu tiên linh mạch. Bảo vật đã dùng không hoàn lại khi thất bại. Người chơi có quyền bật/tắt tự động đột phá và cấp quyền riêng trước khi thú gia tộc tự dùng bảo vật.

Yêu Đan là thuộc tính nội tại hình thành khi lên Ngưng Đan, tăng **10%** HP tối đa, linh lực tối đa, công kích, phòng ngự và tốc độ; không tăng tốc độ tu luyện và không phải vật phẩm có thể nhặt. Sức mạnh nội tại dùng cảnh giới, giai đoạn, năm thuộc tính, huyết mạch, thể chất, tiến hóa và Yêu Đan; không cộng trang bị, hành trang hoặc hiệu ứng tạm thời. Công thức trọng số TBD.

## 7. Tiến hóa trong Alpha

**Chỉ thủ lĩnh đương nhiệm** có thể bắt đầu tiến hóa theo nhánh do người chơi chọn. Thú gia tộc khác và thú hoang không tiến hóa. Khi một thành viên thuộc nhóm loài khác trở thành thủ lĩnh nhờ chuyển hồn, thủ lĩnh mới dùng **nhánh của thân xác nhận**, giới hạn bậc Alpha. Người chơi vẫn luôn khởi đầu với thủ lĩnh sói.

- Bậc 1 là hình thái khởi điểm. Bậc 2 mở khi thủ lĩnh đạt **Tụ Khí Trung kỳ**. Bậc 3 mở khi đạt **Ngưng Đan Sơ kỳ**. Cảnh giới chỉ là điều kiện mở; lần tiến hóa vẫn phải đáp ứng điều kiện và tài nguyên của nhánh.
- Mỗi nhóm loài có **điều kiện tiến hóa riêng** cho bậc 2 và bậc 3. Điều kiện cụ thể do Product Owner viết lại và xác nhận sau; bảng đề xuất trước đó chưa được duyệt, không áp dụng làm luật Alpha.
- Khi bắt đầu hợp lệ, tiến hóa **bậc 2 tiêu hao 2 đơn vị nguyên liệu tiến hóa và kéo dài 15 phút thực**; tiến hóa **bậc 3 tiêu hao 5 đơn vị và kéo dài 60 phút thực**. **Mỗi dòng dùng nguyên liệu riêng**; tên và nguồn thu nhận của từng loại còn TBD. Hai mốc thời gian được tính bằng đồng hồ server.
- Tối đa **bậc 3/6** trong Alpha. Không có Hóa Hình thành người. Tên bậc 1 của tám dòng đã chốt theo mẫu “Nguyên”; tên bậc 2–3 trong hồ sơ vẫn là **tên làm việc** cho đến khi bảng hiệu ứng từng bậc được duyệt.
- Chỉ thủ lĩnh có trí tuệ. Những mô tả như “mở linh trí” hoặc “khai trí” trong tên và hồ sơ hình thái không tạo trí tuệ độc lập cho thành viên khác.
- Việc bắt đầu tiến hóa cần không ở COMBAT và đủ tài nguyên; tài nguyên bị trừ ngay, không chủ động hủy. Tiến trình tiếp tục khi người chơi offline và tự hoàn tất khi đến hạn.
- Trong `EVOLVING`, thủ lĩnh đứng yên, không làm nhiệm vụ, không bị chọn làm mục tiêu kỹ năng và miễn nhiễm sát thương, gây chết, hiệu ứng bất lợi.
- Trong `EVOLVING`, hai thanh Đói/Khát **đóng băng**; chúng không giảm và không gây hậu quả cho đến khi tiến hóa kết thúc.
- Hoàn tất tiến hóa giữ cảnh giới, điểm tu vi và kỹ năng; không tự hồi đầy HP/linh lực. HP/linh lực hiện tại được giữ nhưng không vượt mức tối đa mới. Gia tộc giải tán thì hủy tiến trình, không trả tài nguyên.

| Nhóm | Bậc 1 | Bậc 2 | Bậc 3 trong hồ sơ đầu vào |
|---|---|---|---|
| Rắn | Nguyên Xà | Linh Xà | Đại Mãng Xà / Yêu Xà |
| Cáo | Nguyên Hồ | Yêu Hồ | Tam Vĩ Hồ |
| Rùa | Nguyên Quy | Linh Quy | Thiết Giáp Quy |
| Khỉ | Nguyên Hầu | Hầu Tinh | Linh Hầu |
| Sói | Nguyên Lang | Tật Phong Lang | Yêu Lang |
| Hổ | Nguyên Hổ | Yêu Hổ | Sát Hổ |
| Chim | Nguyên Điểu | Linh Điểu | Yêu Cầm |
| Cá | Nguyên Ngư | Linh Ngư | Hà Hải Ngư |

Tên **Tam Vĩ Hồ** và **Hầu Tinh** được giữ trong Alpha, còn mô tả “hóa người để tiếp cận người” và “học theo người” chuyển sang game sau. Các bậc 4–6, nhánh cá chép hóa rồng, nhánh Phượng Hoàng/Kim Sí Đại Bằng và điều kiện pha trăng, bão, lôi kiếp, dung hợp hai loài, chuỗi nhiệm vụ là định hướng sau Alpha, không phải khả năng đã mở trong bản này.

## 8. Nội dung chiến đấu và AI

Chiến đấu thường chạy thời gian thực. Thú có thể tấn công, phòng thủ, dùng kỹ năng, bỏ chạy, hồi phục và tiếp tục nhiệm vụ khi an toàn. Ngưỡng bỏ chạy mặc định là **HP ≤ 20%**, trừ lệnh hợp lệ yêu cầu chiến đấu đến chết. Hành vi thành viên dùng State Machine; AI thủ lĩnh dùng quy tắc, có thể điều khiển phòng vệ và chiến tranh khi chủ sở hữu offline.

Danh mục nội dung Alpha đã duyệt ở mức ý tưởng gồm **8 kỹ năng nền**: Cắn xé, Dồn lực, Thủ thế, Né tránh, Truy kích, Phá giáp, Hồi sức và Tụ linh; **kỹ năng được phân theo nhóm loài**, bảng phân bổ chưa chốt. Có **4 huyết mạch**: Phàm thú, Sơn Lâm, Hải Triều, Hoang Mạc; **4 thể chất**: Cường Thể, Chiến Thể, Linh Thể, Tật Phong. Nhóm tài nguyên/vật phẩm gồm gỗ, đá, quặng, thức ăn, linh thảo, linh thạch, trang bị, vật hồi phục, bảo vật đột phá và nguyên liệu tiến hóa. Chỉ số, thời gian hồi, tỉ lệ di truyền và chi phí nằm ở Phụ lục A.

### 8.1. Chiến tranh gia tộc

Chủ gia tộc có thể tuyên chiến với gia tộc khác **cùng server**; một gia tộc chỉ ở trong một cuộc chiến tại một thời điểm. Mỗi bên đưa tối đa **10 thú còn khả năng chiến đấu**. Bên offline được hệ quyết định chuẩn bị và điều khiển.

- Chuẩn bị tối đa **1 phút thực**. Hai bên online có thể bắt đầu sớm khi đã chuẩn bị xong. Nếu bên bị tuyên chiến offline, trận bắt đầu ngay khi hệ thống và bên tuyên chiến đều chuẩn bị xong. Khi hết phút, dùng đội hình bên chưa xác nhận đã chọn tại thời điểm đó.
- Tại thời điểm bắt đầu, chốt trạng thái; hủy đòn/lệnh chưa hoàn tất từ chiến đấu thường; hồi đầy HP, linh lực, Đói và Khát; **xóa debuff** còn hạn.
- Mỗi lượt tối đa **20 giây**, toàn trận tối đa **12 lượt**. Chủ online chọn hành động cho từng thú; bên offline để FSM/server xử lý. Một bên thắng khi bên kia không còn thú có thể chiến đấu. Hết 12 lượt thì so **tổng HP hiện tại của đội hình ban đầu / tổng HP tối đa của đội hình ban đầu**; thú đã chết đóng góp **0 HP hiện tại**. Hai bên bằng nhau là hòa. Danh sách hành động và công thức sát thương theo lượt còn TBD.
- Tử vong sau trận đi vào luật tử vong/hồi sinh chung. Thắng trận không tự chuyển quyền sở hữu biệt viện hoặc phát phần thưởng chiến tranh.

## 9. Tử vong, hồi sinh và vật phẩm rơi

Thú gia tộc thường chết chuyển `DEAD`, ngừng nhiệm vụ, tu luyện, đột phá; hai thanh Đói/Khát đóng băng khi ở trạng thái này và **không tạo thịt trong Alpha**. Người chơi có thể cấp phép hồi sinh trong **3 ngày thực từ lúc chết**. Hết hạn không cấp phép thì xóa vĩnh viễn. Sau khi cấp phép, thú giữ một suất và chờ **24 giờ thực tính từ lúc cấp phép**; hủy rồi cấp lại thì tính lại 24 giờ từ lần cấp mới, nhưng **không đặt lại hạn cấp phép 3 ngày**. Hồi sinh có thể hoàn tất khi người chơi offline, tại điểm hợp lệ theo thứ tự **biệt viện → thủ lĩnh sống → pháp bảo**; khi hồi sinh, Đói/Khát đầy.

Khi chết, trang bị đang dùng được giữ. Nếu hành trang có vật phẩm, server chọn ngẫu nhiên **một ô** và làm rơi **một đơn vị** từ ô đó tại vị trí chết; phần hành trang còn lại được giữ. Trong **0–10 phút thực**, chỉ thành viên gia tộc được nhặt; từ phút 10 đến trước phút 30 là công cộng; từ phút 30 vật phẩm chưa nhặt biến mất. Vật phẩm đã rơi vẫn tồn tại tới hạn của nó ngay cả khi gia tộc giải tán. Nhặt đồng thời phải chỉ có một kết quả thành công. Nếu điểm chết nằm trên lối chuyển bản đồ hoặc ô không thể đặt vật phẩm, server đặt vật phẩm ở **ô hợp lệ gần nhất trên bản đồ nơi thú chết**.

Thủ lĩnh không tự động dùng toàn bộ luật hồi sinh thú thường; áp dụng mục 10.

## 10. Mất thủ lĩnh, biệt viện và Game Over

Khi mất thủ lĩnh mang thân xác, hạn **3 ngày thực tự bắt đầu ngay**. Người chơi được xem trạng thái gia tộc và chọn **hồi sinh thủ lĩnh cũ** bằng mảnh Hỗn Độn Thanh Liên, hoặc **chuyển linh hồn, ý thức, ký ức và linh trí thủ lĩnh cũ** vào một thú gia tộc còn sống do người chơi chọn. Hai thao tác không cần chi phí hay thời gian và thực hiện ngay khi hợp lệ. Hồi sinh trực tiếp làm đầy Đói/Khát; chuyển sang thân xác còn sống giữ trạng thái Đói/Khát của thân xác nhận. Chỉ thủ lĩnh có ý thức riêng nên thú nhận chuyển không có ý thức gốc cần thay thế. Thủ lĩnh mới giữ **cảnh giới, chỉ số, huyết mạch, thể chất và đặc tính của thân xác nhận**. Khi người chơi offline, việc chọn thân xác hoãn đến lúc online nhưng hạn 3 ngày vẫn chạy; hết hạn thì gia tộc giải tán.

Khi mất biệt viện, hạn khôi phục **7 ngày thực** bắt đầu. Gia tộc giữ suất cư trú của bản đồ chính trong hạn; nhiệm vụ hợp lệ có thể tiếp tục. Hạn thiếu thủ lĩnh và hạn thiếu biệt viện chạy độc lập; hạn nào kết thúc trước có thể khiến gia tộc giải tán trước. Tại cùng một thời điểm, **giải tán được xét trước** các sự kiện hồi sinh, hoàn tất tiến hóa hoặc sinh nở đến hạn.

Khi chính thức giải tán, thú gia tộc biến mất, thú `DEAD` bị xóa, hủy lịch hồi sinh và tiến hóa, xóa trang bị/hành trang, linh hồn thủ lĩnh, pháp bảo và kho; không hoàn lại tài nguyên tiến hóa. Người chơi Game Over, được tạo pháp bảo mới và chọn server bất kỳ, không kế thừa dữ liệu gameplay lượt cũ. Phá hủy pháp bảo là đường Game Over riêng; pháp bảo có thể bị người chơi hoặc NPC phá, không bị môi trường phá. Chiến lợi phẩm phá pháp bảo lấy từ **kho pháp bảo**, không lấy trực tiếp trang bị/hành trang của thú: chọn vật phẩm phẩm cấp cao nhất rồi thêm tối đa bốn vật phẩm ngẫu nhiên; kho có dưới năm vật phẩm thì chỉ xét số đang có. Nếu nhiều vật phẩm cùng phẩm cấp cao nhất, server **chọn ngẫu nhiên một vật phẩm** trong nhóm đồng hạng. Người nhận được phân định theo sát thương tích lũy. Chi tiết đồng hạng sát thương, thao tác đồng thời và phân phối cần đối chiếu trước triển khai.

## 11. Phẩm cấp pháp bảo

Pháp bảo có **Hoàng, Huyền, Địa, Thiên phẩm**, mỗi phẩm gồm Sơ, Trung, Thượng kỳ, tổng **12 bậc**. Tiên phẩm ngoài Alpha. Hệ thống ghi sức mạnh trung bình hiện tại của gia tộc và kỷ lục cao nhất; nâng phẩm xét **kỷ lục cao nhất** và chi phí tài nguyên, không tự nâng khi vừa đạt ngưỡng. Có thể nâng liên tiếp khi đủ điều kiện; giảm sức mạnh hiện tại không xóa kỷ lục.

Sức mạnh trung bình lấy sức mạnh nội tại của thủ lĩnh và thú sống, cộng thú `DEAD` đã cấp phép theo sức mạnh ghi khi chết; suất thai kỳ đóng góp **0**. Không tính trang bị và vật phẩm. Công thức sức mạnh, ngưỡng và chi phí từng bậc TBD.

## 12. Yêu cầu kỹ thuật và mục tiêu kiểm chứng

- Simulation Core trên server quyết định kết quả; client chỉ gửi lệnh và hiển thị trạng thái. MySQL 8.4 lưu tài khoản/pháp bảo, thế giới/bản đồ, gia tộc, thú, trạng thái, Đói/Khát, tu vi, tiến hóa, thai kỳ, vật phẩm, tài nguyên, hạn thời gian và kết quả có thẩm quyền.
- Lệnh tranh cùng thú, suất cuối, tài nguyên, vật phẩm rơi, chuyển nơi cư trú hoặc trạng thái chiến tranh phải có kết quả duy nhất; lệnh gửi lặp không tạo thêm thú con, vật phẩm hoặc chiếm thêm suất.
- Sự kiện dùng thời gian thực phải khôi phục sau restart; quyền sở hữu và các lệnh server đã xác nhận không bị mất. Khi nhiều sự kiện có cùng mốc, ưu tiên giải tán như mục 10.
- Mục tiêu thử tải: **12 chủ gia tộc online/server**, tối đa **1.200 suất gia tộc** (12 × 100), thêm **200 thú hoang/bản đồ**. Phản hồi lệnh **p95 ≤ 300 ms** và phục hồi mô phỏng sau restart **≤ 2 phút**. Đây là mục tiêu kiểm thử, chưa phải kết quả đo; cần đo lại với hệ Đói/Khát và tái sinh quần thể trước khi xác nhận tính khả thi của các mục tiêu độ trễ và phục hồi.

## 13. Yêu cầu và tiêu chí nghiệm thu

| ID | Yêu cầu Alpha | Tiêu chí nghiệm thu chính |
|---|---|---|
| FR-01 | Khởi đầu, pháp bảo và sở hữu gia tộc | Tài khoản chọn một trong ba mảnh; khai sáng sói 5 giây; tranh cùng mục tiêu chỉ một người thắng. |
| FR-02 | Giới thiệu lần đầu | Lời dẫn hiện đúng một lần cho tài khoản khi đăng nhập lần đầu, không lặp sau đăng nhập lại. |
| FR-03 | Thế giới bốn bản đồ | Mỗi server có đúng bốn bản đồ đã chốt và thiết kế lại; Vùng cư trú hoang sơ thay Kinh thành, Biển Đông không có hải tặc; Cá chỉ đi theo vùng nước và lối nối nước hợp lệ với cá thể, Rùa có thể lên cạn. |
| FR-04 | Cư trú gia tộc | Không quá 3 gia tộc/bản đồ cư trú, 12/server; đổi nơi cư trú chiếm/nhả suất nguyên tử. |
| FR-05 | Một trăm suất thành viên | Thủ lĩnh, thú sống, thú DEAD đã cấp phép và suất thai kỳ cùng tính vào giới hạn cứng 100; mọi tranh chấp suất không vượt 100. |
| FR-06 | Chiêu mộ một lần | Chỉ thủ lĩnh được tương tác chiêu mộ thú hoang thuộc tám nhóm, còn sống, chưa từng được chiêu mộ, không đang chiến đấu; cần biệt viện hợp lệ và suất trống. Đủ điều kiện thì thành công chắc chắn, không tốn tài nguyên; thú đã từng được chiêu mộ không thể chiêu mộ lại; yêu cầu đồng thời chỉ có một kết quả thắng. |
| FR-07 | Sinh sản | Hai thú trưởng thành cùng loài, một đực một cái; thai kỳ 24 giờ giữ một suất, sinh đúng một con; mẹ chết trả suất, bố chết thì thai kỳ tiếp tục; Alpha không có huyết mạch/thể chất ẩn; restart không sinh trùng. |
| FR-08 | Tu luyện và đột phá | Server lưu điểm thập phân, UI hiện %, tăng mốc sau từng đột phá; xác suất giảm theo giai đoạn/cảnh giới, không giữ tu vi dư sau đột phá; dừng ở Ngưng Đan Viên mãn. |
| FR-09 | Tiến hóa thủ lĩnh | Chỉ thủ lĩnh tiến hóa; bậc 2/3 mở ở hai mốc cảnh giới đã chốt, có điều kiện riêng và nguyên liệu riêng từng nhóm; chi phí lần lượt 2/5 nguyên liệu và thời lượng 15/60 phút thực; thú thường và hoang không tiến hóa. Điều kiện riêng và hiệu ứng còn TBD. |
| FR-10 | Hành vi offline | Nhiệm vụ, tu luyện, hồi sinh, thai kỳ và tiến hóa hợp lệ tiếp tục theo đồng hồ server. |
| FR-11 | Chiến đấu thường | Hành động thời gian thực và ngưỡng bỏ chạy 20% hoạt động theo lệnh hợp lệ. |
| FR-12 | Chiến tranh | Chuẩn bị ≤ 1 phút, ≤ 10 thú/bên, 20 giây/lượt, ≤ 12 lượt; online ra lệnh từng thú, offline để FSM/server xử lý; hết lượt so tỷ lệ tổng HP hiện tại/tối đa của đội hình ban đầu. |
| FR-13 | Hồi sinh thú thường | Hạn cấp phép 3 ngày và chờ 24 giờ từ lần cấp phép mới; điểm hồi sinh đúng thứ tự. |
| FR-14 | Vật phẩm rơi | Một đơn vị từ một ô ngẫu nhiên, giữ trang bị; quyền nhặt đổi ở phút 10 và xóa ở phút 30; đặt ở ô hợp lệ gần nhất trên bản đồ tử vong nếu điểm rơi gốc không hợp lệ. |
| FR-15 | Vòng đời thủ lĩnh | Hạn 3 ngày chạy kể cả offline; hồi sinh đặc biệt hoặc chọn thân xác mới tức thời khi hợp lệ. |
| FR-16 | Biệt viện và Game Over | Hạn 7 ngày, giữ suất cư trú; giải tán đúng hạn, xử lý trước các sự kiện cùng thời điểm. |
| FR-17 | Phẩm cấp pháp bảo | Kỷ lục sức mạnh giữ nguyên sau khi sức mạnh giảm; nâng phẩm cần người chơi trả tài nguyên. |
| FR-18 | Xuất hồn quan sát | Hồn quan sát qua bản đồ, nhìn thấy hồn khác nhưng không tác động vào thế giới. |
| FR-19 | Đói, khát và tự kiếm ăn | Mọi thú sống có hai thanh giảm theo đồng hồ server; Đói hết sau 6/12/24 giờ theo nhóm, con mồi sau 12 giờ; tìm ăn từ ≤40 đến ≥80, tìm nước khi Khát ≤40; Khát của thú cạn và Rùa trên cạn sau 6 giờ, Cá/Rùa ở nước phù hợp luôn đầy; về 0 giảm 20% di chuyển/công kích, sau 30 phút mất 5% HP tối đa/giờ, có thể chết; thú gia tộc tự kiếm ăn cả online/offline, chỉ tự ăn kho khi được chủ cho phép; EVOLVING/DEAD đóng băng và hồi sinh/chiến tranh làm đầy; UI/cảnh báo phản ánh trạng thái thật. |
| FR-20 | Tài nguyên và quần thể | Chỉ thú hoang bị giết cho thịt trong Alpha; thịt công cộng ngay và hết hạn sau 30 phút, bậc cao hồi nhiều Đói hơn; thực vật thức ăn, nước, linh thảo và quặng phân bố theo sinh cảnh; quần thể có thể tái sinh từ 0 khi thức ăn/nước phục hồi. Mật độ, chu kỳ và các công thức còn TBD. |
| NFR-01 | Tính nhất quán server | Không có hai kết quả thắng cho cùng tranh chấp hoặc giao dịch vật phẩm/suất. |
| NFR-02 | Hiệu năng và phục hồi | Đo các mục tiêu tải, p95 và restart ở mục 12 trên cấu hình thử đã ghi nhận. |

## 14. Truy vết quyết định chính

| Nguồn quyết định | Yêu cầu chịu ảnh hưởng |
|---|---|
| About Game v2.0 §§2–5; BA-A2-Q01, Q04–Q08, Q12 | FR-01, FR-03–FR-06, FR-15–FR-18 |
| BA-A2-Q13–Q21 | FR-01, FR-13, FR-15, FR-18 |
| BA-A2-Q22–Q23; quyết định chuẩn bị 1 phút và xóa debuff | FR-11–FR-12 |
| BA-A2-Q24–Q30; gói luật và chỉ số được duyệt | FR-07–FR-08, FR-12, FR-14, NFR-02 |
| BA-A2-E01–E08; `Animal_evolution.md` | FR-03, FR-06, FR-09 |
| BA-A2-E09–E13 | FR-01–FR-03, FR-09, Phụ lục A |
| BA-REC-01–03 | FR-05–FR-06; §5 |
| BA-A2-CAP-01–03 | FR-05, FR-12, NFR-02; §§5, 8, 12 |
| BA-EVO-01–03 | FR-09; §7, Phụ lục A |
| BA-RES-01–02; `ImmotalClan_resroucesInMap.md` | FR-03, FR-08, FR-19–FR-20, NFR-02; §§3, 5–6, 12, Phụ lục A |
| BA-RES-Q01–04 | FR-07, FR-12–FR-13, FR-19–FR-20; §§5, 7–9, Phụ lục A |
| BA-RES-Q05–06 | FR-19; §5, Phụ lục A |
| BA-RES-Q07–08 | FR-03, FR-19; §§3, 5, Phụ lục A |
| BA-RES-Q09–13 | FR-13–FR-14, FR-19–FR-20; §§5, 9, Phụ lục A |
| BA-A2-OPEN-01–08 | FR-03, FR-19–FR-20; §§3, 5, Phụ lục A |
| BA-A2-OPEN-09–12 | FR-07, FR-11; §§5, 8, Phụ lục A |
| BA-A2-OPEN-13–18 | FR-08–FR-09, FR-12; §§6–8, Phụ lục A |
| BA-A2-OPEN-19–22 | FR-03, FR-14, FR-16, FR-20; §§3, 9–10, Phụ lục A |
| Định hướng cốt truyện Bàn Cổ → quần thú → thần thú → con người | FR-02, phạm vi Alpha và phần ngoài Alpha |

## Phụ lục A. Bảng cân bằng và nội dung còn TBD

Theo quyết định BA-A2-E12, các mục sau **không được tự coi là đã duyệt**. Chúng cần bảng cân bằng riêng trước khi triển khai đầy đủ từng hệ. Chủ sở hữu quyết định nội dung là **Product Owner**; thiết kế hệ thống đề xuất số và xác minh bằng thử nghiệm.

[Gói đề xuất cân bằng v0.1](proposals/balance-v0.1.md) tập hợp các trị số thử nghiệm có dẫn nguồn tham khảo và phép tính nội bộ; **toàn bộ số mới trong gói vẫn chờ duyệt**.

| Nhóm | Giá trị/chứng cứ cần bổ sung |
|---|---|
| Tiến hóa bậc 2–3 | Điều kiện riêng của tám nhóm do Product Owner viết lại và duyệt; tên làm việc cần xác nhận; hiệu ứng/chỉ số từng bậc; nguồn nhận nguyên liệu tiến hóa và dữ liệu địa hình cần thiết. Chi phí 2/5 nguyên liệu và thời lượng 15/60 phút thực đã chốt ở §7. |
| Sinh sản | Định nghĩa tuổi trưởng thành, tỉ lệ di truyền/đột biến; Alpha không có thuộc tính tiềm ẩn. |
| Kỹ năng và chỉ số | Loài học từng kỹ năng, sát thương/chi phí/thời gian hồi; chỉ số nền, tăng trưởng, công thức sức mạnh nội tại, thứ tự áp dụng Yêu Đan. |
| Tu luyện | Bảng xác suất đột phá giảm dần theo giai đoạn/cảnh giới; hệ số tinh hoa; lượng tu vi từ linh thảo; điều kiện ánh sáng và độ chính xác hiển thị. Không giữ phần dư sau đột phá. |
| Pháp bảo | Mức hiệu ứng Ngọc Điệp/Hỗn Độn Châu; điều kiện hợp lệ chi tiết của Thanh Liên; ngưỡng và chi phí 12 bậc. |
| Chiến tranh | Danh sách hành động và sát thương theo lượt; công thức tỷ lệ HP dựa trên đội hình ban đầu đã chốt. |
| Vật phẩm, bản đồ | Danh mục cụ thể, tỉ lệ xuất hiện, địa hình và vị trí nguồn tài nguyên của bốn bản đồ thiết kế lại; nếu điểm chết không hợp lệ, tìm ô hợp lệ gần nhất trên bản đồ nơi chết. |
| Phá pháp bảo | Tranh chấp sát thương đồng hạng, chọn tối đa bốn vật phẩm bổ sung và phân phối chiến lợi phẩm; vật phẩm đồng phẩm cao nhất được chọn ngẫu nhiên. |
| Đói, khát và thức ăn | Lượng ăn/uống, ngưỡng dừng tìm nước và cảnh báo giao diện; cách làm tròn HP giảm theo thời gian; quyền truy cập kho dựa trên công tắc cho phép, tranh nguồn theo thứ tự server; quy tắc thú hoang chủ động dùng linh thảo; lượng thịt rơi và lượng Đói hồi theo bậc. Các mốc giảm thanh, suy yếu, mất HP, thịt công cộng 30 phút và con mồi đã chốt ở §5. |
| Tài nguyên và sinh thái | Tọa độ/sinh cảnh thực tế của bốn bản đồ, tuyến nước nối sông–Biển Đông và tính phù hợp nước ngọt/nước mặn; mật độ, chu kỳ mọc lại và tái sinh quần thể; cách tính sức chứa/lãnh thổ, điểm nước hợp lệ; lượng tu vi của từng bậc linh thảo và chi phí dùng quặng. |

## Phụ lục B. Định hướng sau Alpha

Lộ trình sáu hình thái, các nhánh Tổ Long/Phượng Hoàng/Côn Bằng/Cửu Vĩ/Huyền Vũ/Bạch Hổ/Thiên Lang/Thần Hầu, nguồn gốc và thứ tự thần thú, quy tắc thế giới và thời điểm kết thúc kỷ nguyên quần thú là **định hướng cốt truyện dài hạn**. Game tiếp theo bắt đầu ở thời đại con người. Những phần này cần một vòng BA riêng; không làm điều kiện nghiệm thu Alpha 2.0.
