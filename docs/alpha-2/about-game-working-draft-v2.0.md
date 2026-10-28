
# TIÊN TỘC — ABOUT GAME

> **Lưu ý:** Đây là bản thảo nguồn, có quy tắc đã được thay thế. Dùng [PRD Alpha 2.0](prd-alpha-2.0.md) và [sổ quyết định BA](ba-decision-register.md) làm nguồn hiện hành; đặc biệt các mục về Kinh thành/hải tặc, tiến hóa thú hoang và tiến hóa thú gia tộc không còn đúng cho Alpha.

> **Phiên bản trò chơi:** Alpha 2.0  
> **Phiên bản đặc tả:** Working Draft v2.0  
> **Tiến độ BA:** Đã chốt đến AI01–AI12; AJ01–AJ12 chưa có quyết định  
> **Trạng thái:** Đang phân tích nghiệp vụ, chưa khóa toàn bộ đặc tả  
> **Nền tảng:** Web game và ứng dụng  
> **Backend:** Server-authoritative Simulation Core  
> **Cơ sở dữ liệu:** MySQL 8.4

---

## 1. Giới thiệu trò chơi

**Tiên Tộc** là trò chơi mô phỏng thế giới tu tiên của yêu thú, trong đó người chơi nhập vai một linh hồn cư trú bên trong pháp bảo.

Người chơi sử dụng pháp bảo để khai sáng một yêu thú, giúp yêu thú trở thành thủ lĩnh có trí tuệ, sau đó xây dựng và phát triển gia tộc yêu thú.

Trò chơi kết hợp các hệ thống:

- Quản lý gia tộc yêu thú.
- Tu luyện và đột phá cảnh giới.
- Huyết mạch, thể chất và tiến hóa.
- Chiêu mộ và quản lý yêu thú.
- Khai thác tài nguyên.
- Xây dựng biệt viện và lãnh thổ.
- Chiến đấu thời gian thực.
- Chiến tranh gia tộc theo lượt.
- Pháp bảo có hệ thống phẩm cấp.
- Mô phỏng thế giới liên tục trên server.

Người chơi không trực tiếp nhập vai một yêu thú ngay từ đầu mà tồn tại dưới dạng linh hồn trong pháp bảo.

---

## 2. Vai trò người chơi và pháp bảo

### 2.1. Người chơi

Người chơi là một linh hồn tồn tại bên trong pháp bảo.

Linh hồn người chơi và ý thức của thủ lĩnh là hai thực thể riêng biệt.

Người chơi có thể điều khiển thủ lĩnh thông qua pháp bảo, đồng thời quan sát và quản lý hoạt động của gia tộc.

### 2.2. Khởi đầu

- Người chơi bắt đầu với một pháp bảo.
- Pháp bảo ban đầu không thể tự do di chuyển.
- Pháp bảo có khả năng khai sáng yêu thú.
- Khai sáng ban đầu được thực hiện lên một yêu thú sói.
- Pháp bảo chỉ có một lần khai sáng đặc biệt.
- Khi nhiều người chơi tranh cùng mục tiêu khai sáng, yêu cầu hợp lệ được server xử lý trước sẽ thắng.
- Thời gian thực hiện khai sáng ban đầu là 5 giây.
- Sau khi khai sáng, yêu thú trở thành thủ lĩnh có ý thức.
- Pháp bảo được thủ lĩnh mang theo.

### 2.3. Khả năng pháp bảo

Pháp bảo có thể:

- Chứa linh hồn người chơi.
- Liên kết với thủ lĩnh.
- Hỗ trợ người chơi điều khiển thủ lĩnh.
- Lưu trữ vật phẩm.
- Tích lũy phẩm cấp dựa trên sức mạnh gia tộc.
- Hỗ trợ các cơ chế hồi sinh hoặc chuyển hồn đã được đặc tả.

Pháp bảo không trực tiếp thực hiện đòn tấn công.

### 2.4. Thủ lĩnh tử vong

Khi thủ lĩnh chết:

- Không tự động Game Over nếu gia tộc vẫn tồn tại.
- Người chơi tiếp tục tồn tại trong pháp bảo.
- Có thể sử dụng cơ chế hồi sinh đặc biệt.
- Có thể chuyển quyền điều khiển sang yêu thú khác thuộc gia tộc.
- Chuyển hồn cần đáp ứng điều kiện và chi phí tương ứng.
- Gia tộc có thể tiếp tục tồn tại trong thời gian không có thủ lĩnh mang thân xác.

**Chưa chốt:** Cách xử lý ý thức gốc của yêu thú nhận chuyển hồn.

---

## 3. Thế giới trò chơi

### 3.1. Cấu trúc server

Mỗi server là một thế giới độc lập.

Alpha 2.0 không sử dụng hệ thống quốc gia.

Mỗi server có đúng bốn khu vực, tương ứng bốn bản đồ:

| Khu vực | Đặc điểm |
|---|---|
| Kinh thành | Khu vực cư trú và phát triển gia tộc |
| Khu rừng | Yêu thú, linh thảo, mỏ quặng và tài nguyên |
| Biển Đông | Đảo, hải thú, hải tặc và tài nguyên đặc thù |
| Bãi hoang | Yêu thú và tài nguyên xuất hiện thưa thớt |

### 3.2. Giới hạn gia tộc

- Mỗi bản đồ tối đa 3 gia tộc.
- Mỗi server tối đa 12 gia tộc.
- Mỗi gia tộc tối đa 10 thành viên, bao gồm thủ lĩnh.
- Giới hạn thành viên tính cả thú sống, thú DEAD đã được cấp phép hồi sinh và suất dành cho thai kỳ.

Đây không phải giới hạn tổng số yêu thú tồn tại trên server.

### 3.3. Di chuyển

- Yêu thú hoang hoạt động theo quy tắc di chuyển của thế giới.
- Yêu thú đã gia nhập gia tộc có thể di chuyển giữa các bản đồ.
- Yêu thú thực hiện nhiệm vụ có thể đi sang bản đồ khác.
- Khi hoàn thành nhiệm vụ, yêu thú tự trở về địa điểm cư trú hợp lệ.
- Nếu đường đi bị chặn liên tục 10 giây, áp dụng quy tắc dịch chuyển đến vị trí hợp lệ gần nhất trên cùng bản đồ.
- Loài di cư có ngoại lệ riêng đối với thích nghi môi trường.

---

## 4. Gia tộc yêu thú

### 4.1. Thành lập

Điều kiện thành lập gia tộc:

1. Có thủ lĩnh hợp lệ.
2. Có biệt viện hợp lệ.

Không yêu cầu tối thiểu năm thành viên.

### 4.2. Thành viên

Gia tộc có thể bao gồm:

- Thủ lĩnh.
- Yêu thú đã chiêu mộ.
- Yêu thú DEAD đã được cấp phép hồi sinh.
- Suất thành viên được giữ cho thai kỳ.

Giới hạn tối đa là 10 suất.

### 4.3. Quyền quản lý

Người chơi thông qua thủ lĩnh có thể:

- Chiêu mộ yêu thú.
- Giao nhiệm vụ.
- Quản lý thành viên.
- Quản lý tài nguyên.
- Phát triển biệt viện.
- Điều khiển thủ lĩnh chiến đấu.
- Ra quyết định chiến tranh.
- Chọn hướng tiến hóa cho yêu thú thuộc gia tộc.

### 4.4. Khi người chơi offline

- Các nhiệm vụ đã giao tiếp tục được thực hiện.
- Yêu thú tự vệ khi bị tấn công.
- Yêu thú rảnh có thể chủ động tu luyện theo FSM.
- Các tiến trình hợp lệ tiếp tục chạy trên server.
- Tiến hóa đang diễn ra không dừng vì người chơi offline.
- Thủ lĩnh có thể được AI điều khiển trong các trường hợp phòng vệ đã được đặc tả.

---

## 5. Trí tuệ và hành vi yêu thú

### 5.1. Thủ lĩnh

Thủ lĩnh là yêu thú có ý thức riêng.

Thủ lĩnh có thể có:

- Cảm xúc.
- Trí nhớ giới hạn.
- Khả năng học hỏi.
- Khả năng lập kế hoạch và đề xuất.
- Khả năng thương lượng.
- Khả năng đưa ra quyết định trong phạm vi được cho phép.

Thủ lĩnh phải tuân theo các mệnh lệnh trực tiếp hợp lệ của người chơi.

### 5.2. Yêu thú thông thường

Yêu thú thông thường không sử dụng hệ thống ý thức phức tạp như thủ lĩnh.

Không triển khai cho yêu thú thông thường:

- Mô phỏng cảm xúc.
- Mô phỏng tính cách.
- Hệ thống tham vọng cá nhân.
- Trí nhớ và học hỏi độc lập.
- Lập kế hoạch độc lập.
- Tự phát triển phe phái tranh quyền.

Yêu thú hoạt động bằng State Machine và các quy tắc được cấu hình.

### 5.3. Hành vi tự động

Yêu thú có thể:

- Di chuyển.
- Tu luyện.
- Phòng vệ.
- Chiến đấu.
- Bỏ chạy.
- Hồi phục.
- Thực hiện nhiệm vụ.
- Trở về biệt viện.
- Thử đột phá nếu được phép và đủ điều kiện.

Khi bị tấn công, hành vi phòng vệ có thể tạm ngắt nhiệm vụ; sau khi an toàn, yêu thú tiếp tục nhiệm vụ theo quy tắc đã chốt.

---

## 6. Hệ thống cảnh giới

### 6.1. Danh sách đại cảnh giới

Thứ tự từ thấp đến cao:

1. Tụ Khí Kỳ.
2. Ngưng Đan Kỳ.
3. Hóa Hình Kỳ.
4. Yêu Tướng Kỳ.
5. Yêu Vương Kỳ.

### 6.2. Phạm vi Alpha 2.0

Alpha 2.0 chỉ triển khai:

- Tụ Khí Kỳ.
- Ngưng Đan Kỳ.

Giới hạn cao nhất là **Ngưng Đan Viên mãn 100%**.

Hóa Hình, Yêu Tướng và Yêu Vương thuộc định hướng phiên bản tương lai.

### 6.3. Giai đoạn trong đại cảnh giới

Mỗi đại cảnh giới có bốn giai đoạn:

1. Sơ kỳ.
2. Trung kỳ.
3. Hậu kỳ.
4. Viên mãn.

Mỗi giai đoạn có thanh tu vi từ 0% đến 100%.

### 6.4. Lưu trữ tu vi

- Giao diện hiển thị tu vi dưới dạng phần trăm.
- Nội bộ lưu giá trị thập phân chính xác hơn.
- Không tự động làm tròn giá trị nội bộ.
- Khi đạt 100%, thú có thể thử đột phá nếu đủ điều kiện.
- Khi tắt tự động đột phá, thú giữ ở 100% và chờ lệnh.

### 6.5. Đột phá thành công

- Chuyển sang giai đoạn tiếp theo.
- Thanh tu vi của giai đoạn mới bắt đầu từ 0%.
- Nếu đang ở Viên mãn, chuyển sang Sơ kỳ của đại cảnh giới tiếp theo.
- Đột phá thành công hồi đầy HP và linh lực.
- Có thể đột phá trong COMBAT nếu các điều kiện và quy tắc FSM cho phép.

### 6.6. Đột phá thất bại

- Thanh tu vi từ 100% giảm về 80%.
- Giữ nguyên cảnh giới và giai đoạn.
- Nhận debuff kéo dài 10 phút thực.
- Giảm 50% lượng tu vi nhận được từ các nguồn hợp lệ.
- Không được thử đột phá lại khi debuff còn hiệu lực.
- Khi debuff kết thúc, vẫn phải đạt đủ tu vi và điều kiện mới được thử lại.

### 6.7. Tự động đột phá

Người chơi có thể bật hoặc tắt tự động đột phá.

Khi bật:

- FSM kiểm tra tu vi.
- Kiểm tra debuff.
- Kiểm tra điều kiện đột phá.
- Kiểm tra các quyền tiêu hao tài nguyên nếu cần.
- Thử đột phá khi hợp lệ.

Ở Ngưng Đan Viên mãn 100%, Alpha không thử đột phá lên Hóa Hình.

---

## 7. Đột phá Tụ Khí lên Ngưng Đan

### 7.1. Điều kiện

Yêu thú phải đạt Tụ Khí Viên mãn 100%.

Đồng thời phải thỏa mãn một trong hai nhánh:

**Nhánh linh mạch**

- Đứng trong phạm vi linh mạch phù hợp tại thời điểm thử đột phá.
- Không tiêu hao bảo vật.

**Nhánh bảo vật**

- Sở hữu bảo vật phù hợp.
- Tiêu hao bảo vật ngay khi bắt đầu thử đột phá.
- Nếu thất bại, bảo vật không được hoàn trả.

### 7.2. Quy tắc ưu tiên

Nếu thú đồng thời đứng trong linh mạch phù hợp và có bảo vật:

**Ưu tiên sử dụng linh mạch để tránh tiêu hao bảo vật.**

### 7.3. Yêu thú hoang

Yêu thú hoang:

- Chỉ sử dụng bảo vật đang sở hữu.
- Hoặc linh mạch đang tiếp cận.
- Không chủ động lập kế hoạch tìm bảo vật hoặc linh mạch để đột phá.

### 7.4. Yêu thú gia tộc

Yêu thú gia tộc chỉ được tự động tiêu hao bảo vật đột phá khi người chơi đã cấp quyền riêng.

Mỗi lần thử đột phá đại cảnh giới phải kiểm tra lại toàn bộ điều kiện.

---

## 8. Hệ thống tu luyện

### 8.1. Nguồn tăng tu vi

Các nguồn hợp lệ:

1. Chủ động hấp thụ linh khí môi trường.
2. Chủ động hấp thụ Nhật Nguyệt Tinh Hoa.
3. Cắn nuốt linh thảo.

Không tăng tu vi khi:

- Tiêu diệt con mồi.
- Ăn thịt con mồi.
- Chỉ đứng trong môi trường có linh khí mà không tu luyện.

### 8.2. Tu luyện tự động

Yêu thú gia tộc có thể tự động tu luyện theo FSM khi không có nhiệm vụ ưu tiên.

Đây vẫn được xem là hành vi chủ động tu luyện của yêu thú.

### 8.3. Nhật Nguyệt Tinh Hoa

Các khung giờ tính theo thời gian trong game:

| Nguồn | Bắt đầu | Kết thúc |
|---|---|---|
| Thái Dương Tinh Hoa | 05:00 | 07:00 |
| Thái Âm Tinh Hoa | 23:00 | 01:00 ngày hôm sau |

Khi đủ điều kiện hấp thụ Nhật Nguyệt Tinh Hoa:

- Luôn ưu tiên Nhật Nguyệt Tinh Hoa.
- Không đồng thời nhận linh khí môi trường.
- Chỉ nhận tu vi khi đang chủ động tu luyện.

### 8.4. Linh thảo

- Sử dụng linh thảo tăng tu vi ngay lập tức.
- Trong thời gian debuff đột phá, lượng tu vi nhận được giảm 50%.
- Nếu vượt 100%, phần tu vi dư được bảo lưu để chuyển sang giai đoạn tiếp theo sau khi đột phá thành công.

**Chưa chốt:**

- Giới hạn phần tu vi dư.
- Xử lý phần dư khi đột phá thất bại.
- Cách lưu phần dư.
- Công thức lượng tu vi từ từng loại linh thảo.

---

## 9. Yêu Đan

### 9.1. Hình thành

Yêu Đan hình thành khi yêu thú đột phá thành công lên Ngưng Đan.

Yêu Đan là thuộc tính nội tại, không phải vật phẩm.

### 9.2. Hệ số

Tất cả yêu thú Ngưng Đan có cùng hệ số Yêu Đan:

**+10% chỉ số chiến đấu được áp dụng.**

Các chỉ số được tăng:

- HP tối đa.
- Linh lực tối đa.
- Công kích.
- Phòng ngự.
- Tốc độ.

Hệ số được kích hoạt ngay khi đột phá thành công lên Ngưng Đan.

### 9.3. Giới hạn

- Yêu Đan không tăng tốc độ tu luyện.
- Không thể nhặt Yêu Đan như vật phẩm.
- Không triển khai kỹ năng phóng Yêu Đan tấn công trong Alpha.
- Hệ số Yêu Đan được tính vào sức mạnh nội tại của thú.

---

## 10. Thuộc tính yêu thú

Năm thuộc tính cơ bản:

| Thuộc tính | Tên dữ liệu đề xuất |
|---|---|
| HP tối đa | `max_hp` |
| Linh lực tối đa | `max_qi` |
| Công kích | `attack` |
| Phòng ngự | `defense` |
| Tốc độ | `speed` |

Sức mạnh nội tại của thú phụ thuộc vào:

- Cảnh giới.
- Giai đoạn tu luyện.
- Thuộc tính cơ bản.
- Huyết mạch.
- Thể chất.
- Tiến hóa.
- Hệ số Yêu Đan khi đạt Ngưng Đan.

Không tính vào sức mạnh nội tại dùng nâng phẩm pháp bảo:

- Trang bị.
- Vật phẩm trong hành trang.
- Hiệu ứng tăng sức mạnh tạm thời.

**Chưa chốt:** Công thức tổng hợp sức mạnh và trọng số từng thuộc tính.

---

## 11. Huyết mạch và thể chất

Mỗi yêu thú có:

- Chính xác một loại huyết mạch bẩm sinh.
- Chính xác một loại thể chất bẩm sinh.

Huyết mạch và thể chất có thể ở trạng thái tiềm ẩn.

Các cơ chế:

- Thức tỉnh khi đủ điều kiện.
- Tiến hóa có thể tăng cường loại huyết mạch hoặc thể chất hiện có.
- Môi trường đặc biệt có thể kích hoạt thức tỉnh.
- Sinh sản có thể tạo đột biến huyết mạch hoặc thể chất.
- Đột biến có thể tạo loại huyết mạch hoặc thể chất mới.

Yêu thú thông thường không tự trở thành thực thể có ý thức như thủ lĩnh chỉ nhờ tiến hóa.

---

## 12. Hệ thống tiến hóa

### 12.1. Điều kiện

Tiến hóa có thể yêu cầu:

- Loài phù hợp.
- Nhánh tiến hóa phù hợp.
- Điều kiện môi trường.
- Tài nguyên.
- Điều kiện huyết mạch hoặc thể chất.
- Các điều kiện riêng của nhánh.

Quyền tiến hóa sau khi mở khóa được giữ lại.

Khi bắt đầu tiến hóa đã mở khóa, kiểm tra:

- Tài nguyên cần thiết.
- Trạng thái không COMBAT.

### 12.2. Tiến hóa thú gia tộc

- Người chơi chọn nhánh tiến hóa.
- Tài nguyên bị trừ ngay khi bắt đầu.
- Mỗi nhánh có thời gian tiến hóa riêng.
- Không thể chủ động hủy tiến hóa sau khi bắt đầu.
- Tiến hóa tiếp tục khi người chơi offline.
- Tiến hóa tự hoàn tất khi đến hạn.

### 12.3. Trạng thái EVOLVING

Trong EVOLVING:

- Thú đứng yên.
- Không thực hiện nhiệm vụ.
- Không thể bị chọn làm mục tiêu kỹ năng.
- Miễn nhiễm mọi nguồn sát thương.
- Miễn nhiễm hiệu ứng gây chết.
- Không nhận hiệu ứng bất lợi.
- Không bị gián đoạn bởi chiến đấu.

### 12.4. Kết quả tiến hóa

- Giữ cảnh giới.
- Giữ tu vi.
- Giữ kỹ năng hiện có.
- Có thể nâng cấp huyết mạch hoặc thể chất cùng loại.
- Không tự hồi đầy HP và linh lực chỉ vì tiến hóa.
- HP và linh lực hiện tại được giữ, giới hạn bởi mức tối đa mới.

### 12.5. Tiến hóa thú hoang

Thú hoang có thể tiến hóa khi điều kiện phù hợp xuất hiện.

Thú hoang không chủ động tìm kiếm điều kiện tiến hóa hoặc lập kế hoạch tiến hóa.

### 12.6. Lưu tiến trình

Server lưu thời điểm hoàn tất tiến hóa.

Khi khởi động lại:

- Nếu chưa đến hạn, tiếp tục chờ.
- Nếu đã đến hạn và trạng thái còn hợp lệ, hoàn tất ngay.
- Nếu gia tộc đã giải tán, không hoàn tất tiến hóa.

---

## 13. Chiêu mộ và sinh sản

### 13.1. Chiêu mộ

- Yêu thú có thể được chiêu mộ khi đáp ứng điều kiện.
- Điều kiện chiêu mộ có thể phụ thuộc chỉ số động.
- Yêu thú đã từng được chiêu mộ không thể được chiêu mộ lại lần nữa.
- Yêu thú được chiêu mộ trở thành thành viên gia tộc.
- Giới hạn gia tộc tối đa 10 suất.

### 13.2. Sinh sản

- Mỗi thai kỳ sinh một con.
- Giữ một suất gia tộc ngay khi bắt đầu mang thai.
- Không thể bắt đầu thai kỳ nếu không có suất trống.
- Mẹ chết thì thai kỳ kết thúc và giải phóng suất.
- Thủ lĩnh chết không tự động hủy thai kỳ.
- Con non có thể kế thừa huyết mạch và thể chất theo xác suất.
- Có khả năng đột biến.

---

## 14. Chiến đấu

### 14.1. Chiến đấu thông thường

Chiến đấu thông thường sử dụng cơ chế thời gian thực.

Yêu thú có thể:

- Tấn công.
- Phòng thủ.
- Sử dụng kỹ năng.
- Bỏ chạy.
- Hồi phục.
- Tiếp tục nhiệm vụ sau khi an toàn.

### 14.2. Bỏ chạy

Ngưỡng HP bỏ chạy thông thường:

**HP ≤ 20%.**

Một số mệnh lệnh chiến đấu đến chết có thể ghi đè hành vi bỏ chạy.

### 14.3. Chiến tranh gia tộc

Chiến tranh chính thức sử dụng cơ chế theo lượt.

- Mỗi bên tối đa 10 yêu thú.
- Thủ lĩnh có thể bị chuyển từ COMBAT thời gian thực sang chiến tranh theo lượt.
- Khi chiến tranh chính thức bắt đầu, áp dụng các quy tắc khôi phục HP, linh lực và xử lý debuff đã chốt.
- Thủ lĩnh offline có thể được AI điều khiển trong chiến tranh theo quy tắc hiện hành.

---

## 15. Tử vong và hồi sinh

### 15.1. Yêu thú đã gia nhập gia tộc

Khi chết:

- Chuyển sang trạng thái DEAD.
- Không tiếp tục tu luyện.
- Không đột phá.
- Không tiến hóa.
- Không thực hiện nhiệm vụ.
- Có thể được cấp phép hồi sinh nếu đáp ứng điều kiện.

### 15.2. Cấp phép hồi sinh

- Phải được cấp phép trong 3 ngày thực kể từ khi chết.
- Có thể cấp phép bất kỳ lúc nào trong hạn.
- Hủy cấp phép không đặt lại thời hạn ban đầu.
- Quá hạn mà không được cấp phép thì thú bị xóa vĩnh viễn.
- Thú DEAD đã được cấp phép vẫn chiếm suất thành viên.

### 15.3. Thời gian hồi sinh

Thú DEAD đã được cấp phép hồi sinh sau 24 giờ thực, nếu có điểm hồi sinh hợp lệ.

Thứ tự ưu tiên điểm hồi sinh:

1. Biệt viện.
2. Thủ lĩnh còn sống.
3. Pháp bảo.

Hồi sinh có thể hoàn tất khi người chơi offline.

### 15.4. Vật phẩm khi chết

- Trang bị đang sử dụng được giữ lại.
- Một vật phẩm mang theo có thể rơi theo quy tắc tử vong.
- Trong 10 phút thực đầu, quyền nhặt thuộc gia tộc.
- Từ phút 10 đến trước phút 30, vật phẩm trở thành công cộng.
- Sau 30 phút, vật phẩm chưa được nhặt biến mất.

### 15.5. Thủ lĩnh

Thủ lĩnh có cơ chế hồi sinh đặc biệt thông qua pháp bảo hoặc chuyển hồn.

Thủ lĩnh không tự động áp dụng toàn bộ quy tắc hồi sinh thông thường của thú gia tộc.

---

## 16. Pháp bảo và phẩm cấp

### 16.1. Phẩm cấp

Các phẩm cấp đã xác định:

1. Hoàng phẩm.
2. Huyền phẩm.
3. Địa phẩm.
4. Thiên phẩm.

Mỗi phẩm cấp gồm:

- Sơ kỳ.
- Trung kỳ.
- Thượng kỳ.

Tổng cộng 12 bậc phẩm cấp thông thường.

Tiên phẩm là định hướng lý thuyết, chưa mở trong Alpha.

### 16.2. Sức mạnh đàn

Sức mạnh trung bình đàn được tính từ:

- Thủ lĩnh.
- Thú sống thuộc gia tộc.
- Thú DEAD đã được cấp phép hồi sinh.
- Suất thai kỳ đã giữ chỗ, đóng góp sức mạnh bằng 0.

Thú DEAD đóng góp sức mạnh nội tại được ghi nhận khi chết.

Trang bị và vật phẩm không ảnh hưởng đến sức mạnh trung bình.

### 16.3. Kỷ lục sức mạnh

Hệ thống theo dõi:

- Sức mạnh trung bình hiện tại.
- Kỷ lục sức mạnh trung bình cao nhất.

Kỷ lục được cập nhật khi sức mạnh trung bình hiện tại vượt kỷ lục cũ.

Phẩm cấp pháp bảo xét theo kỷ lục cao nhất, không chỉ theo sức mạnh hiện tại.

### 16.4. Nâng phẩm

- Mỗi bậc có ngưỡng sức mạnh riêng.
- Mỗi bậc có chi phí tài nguyên riêng.
- Đạt ngưỡng chưa tự động nâng phẩm.
- Người chơi phải tiêu hao tài nguyên để nâng.
- Nâng phẩm diễn ra tức thời.
- Có thể nâng liên tiếp nhiều bậc nếu đủ điều kiện và tài nguyên.
- Khi sức mạnh hiện tại giảm, kỷ lục đã đạt vẫn được giữ.

**Chưa chốt:** Ngưỡng cụ thể và bảng chi phí của 12 bậc.

---

## 17. Biệt viện và điều kiện tồn tại gia tộc

Gia tộc cần có biệt viện hợp lệ.

Khi mất biệt viện:

- Gia tộc có thời hạn 7 ngày thực để khôi phục điều kiện.
- Các nhiệm vụ hợp lệ đang chạy có thể tiếp tục.
- Quy tắc hồi sinh phụ thuộc điểm hồi sinh còn hợp lệ.
- Khi hết hạn mà không khắc phục, gia tộc chính thức giải tán.

Khi không có thủ lĩnh mang thân xác:

- Có thể tồn tại tạm thời.
- Áp dụng thời hạn 3 ngày thực theo điều kiện đã chốt.
- Người chơi có thể hồi sinh hoặc chuyển hồn để khắc phục.
- Hai thời hạn 3 ngày và 7 ngày hoạt động độc lập.
- Thời hạn nào kết thúc trước có thể dẫn đến giải tán trước.

**Chưa chốt:** Chính xác thời điểm bắt đầu hạn 3 ngày nếu người chơi không đưa ra quyết định hồi sinh.

---

## 18. Giải tán gia tộc và Game Over

### 18.1. Giải tán chính thức

Khi gia tộc chính thức giải tán:

- Toàn bộ thú gia tộc biến mất.
- Thú DEAD bị xóa vĩnh viễn.
- Hủy toàn bộ lịch hồi sinh.
- Xóa trang bị và hành trang của thú.
- Xóa các tiến trình tiến hóa.
- Không hoàn trả tài nguyên tiến hóa.
- Linh hồn thủ lĩnh biến mất.
- Pháp bảo và toàn bộ kho vật phẩm bị xóa.
- Người chơi Game Over.

### 18.2. Tạo lượt chơi mới

Sau Game Over:

- Người chơi có thể tạo pháp bảo mới.
- Được chọn bất kỳ server nào.
- Pháp bảo mới không tự kế thừa dữ liệu gameplay của pháp bảo cũ.

### 18.3. Pháp bảo bị phá hủy

Phá hủy pháp bảo là nguyên nhân Game Over riêng.

Các quy tắc đã xác định:

- Pháp bảo có thể bị phá hủy bởi người chơi hoặc NPC.
- Không bị phá hủy bởi môi trường.
- Các thú thuộc gia tộc chết vĩnh viễn theo quy tắc Game Over.
- Cơ chế chiến lợi phẩm áp dụng riêng đối với kho pháp bảo.
- Quyền nhận chiến lợi phẩm xét sát thương tích lũy của người chơi theo quy tắc đã chốt.

Không mặc định rằng Game Over do giải tán và Game Over do phá hủy pháp bảo có cùng cách phân phối chiến lợi phẩm.

---

## 19. Simulation Core

### 19.1. Nguyên tắc

Simulation Core là nguồn dữ liệu có thẩm quyền.

Client không được tự quyết định:

- Kết quả đột phá.
- Sức mạnh nội tại.
- Trạng thái tử vong.
- Thời gian hồi sinh.
- Kết quả tiến hóa.
- Phẩm cấp pháp bảo.
- Quyền nhặt vật phẩm.
- Kết quả chiến đấu.
- Kết quả giải tán gia tộc.

### 19.2. Đồng hồ

Hệ thống sử dụng hai loại thời gian:

**Thời gian thực của server**

Dùng cho:

- Debuff đột phá 10 phút.
- Hồi sinh 24 giờ.
- Hạn cấp phép hồi sinh 3 ngày.
- Hạn thiếu thủ lĩnh 3 ngày.
- Hạn thiếu biệt viện 7 ngày.
- Thời gian bảo vệ vật phẩm rơi.

**Thời gian trong game**

Dùng cho:

- Chu kỳ ngày đêm.
- Khung giờ Thái Dương Tinh Hoa.
- Khung giờ Thái Âm Tinh Hoa.
- Các cơ chế mô phỏng phụ thuộc giờ trong thế giới.

### 19.3. Lưu trữ

Cơ sở dữ liệu chính thức là MySQL 8.4.

Những dữ liệu cần được quản lý nhất quán bao gồm:

- Tài khoản và pháp bảo.
- Server và bản đồ.
- Gia tộc.
- Thủ lĩnh.
- Yêu thú.
- Cảnh giới và tu vi.
- Huyết mạch và thể chất.
- Chỉ số nội tại.
- Tiến hóa.
- Nhiệm vụ.
- Biệt viện.
- Vật phẩm.
- Hồi sinh.
- Phẩm cấp và kỷ lục sức mạnh.
- Các mốc thời gian và sự kiện quan trọng.

Đây là nhóm dữ liệu nghiệp vụ, chưa phải lược đồ bảng MySQL chính thức.

---

## 20. Các nội dung chưa chốt

### 20.1. Cảnh giới và tu luyện

- Công thức tốc độ hấp thụ linh khí.
- Hệ số Nhật Nguyệt Tinh Hoa.
- Cách xác định điều kiện ánh sáng.
- Cách xử lý khi không hấp thụ được Nhật Nguyệt Tinh Hoa.
- Lượng tu vi từ từng loại linh thảo.
- Giới hạn phần tu vi dư.
- Xử lý phần dư khi đột phá thất bại.
- Cách làm tròn tu vi hiển thị.
- Xác suất đột phá thành công.

### 20.2. Yêu Đan và sức mạnh

- Thứ tự áp dụng hệ số Yêu Đan.
- Công thức tổng hợp sức mạnh nội tại.
- Trọng số HP, linh lực, công kích, phòng ngự và tốc độ.
- Cách tính các hệ số huyết mạch, thể chất và tiến hóa.
- Cách điều chỉnh HP và linh lực hiện tại khi mức tối đa thay đổi.

### 20.3. Pháp bảo

- Ngưỡng nâng phẩm của 12 bậc.
- Chi phí tài nguyên cho từng bậc.
- Công thức sức mạnh trung bình đàn.
- Xử lý kỷ lục khi có các biến động thành viên đặc biệt.
- Quy tắc đặt lại phẩm cấp khi giải tán đã bị AI03 làm mất ý nghĩa thực tế vì pháp bảo bị xóa ngay; cần xác nhận có loại bỏ thao tác đặt lại hay chỉ giữ trong nhật ký.

### 20.4. Linh hồn và chuyển hồn

- Ý thức của thú được chọn khi chuyển hồn.
- Quyền điều khiển pháp bảo trong thời gian thiếu thủ lĩnh.
- Các điều kiện chi tiết để chuyển hồn.
- Cách xử lý khi không còn mục tiêu chuyển hồn hợp lệ.

### 20.5. Tiến hóa

- Danh sách nhánh tiến hóa.
- Chi phí từng nhánh.
- Thời lượng từng nhánh.
- Điều kiện môi trường.
- Thay đổi chỉ số và ngoại hình.
- Quy tắc xung đột sự kiện đồng thời trong Simulation Core.

### 20.6. Hệ thống kỹ thuật

- Thiết kế bảng MySQL.
- Cấu trúc State Machine.
- Định nghĩa sự kiện và thứ tự ưu tiên.
- Quy tắc giao dịch và chống xử lý trùng.
- Cơ chế đồng bộ client/server.
- Kiểm thử tải và giới hạn hiệu năng.

---

## 21. Lịch sử thay đổi quan trọng

| Quyết định | Nội dung thay đổi |
|---|---|
| AB01 | Chuẩn hóa thanh tu vi 0–100%, thất bại từ 100 xuống 80 |
| AB05 | Sức mạnh đàn chỉ dùng sức mạnh nội tại, loại trừ trang bị |
| AC01 | Thủ lĩnh chết không tự làm giảm phẩm cấp pháp bảo |
| AD01–AD02 | EVOLVING miễn nhiễm sát thương và không thể bị kỹ năng nhắm mục tiêu |
| AE01 | Xác định năm đại cảnh giới; Alpha chỉ đến Ngưng Đan |
| AE09 | Thú đang tiến hóa biến mất khi gia tộc giải tán |
| AF02 | Đột phá Tụ Khí → Ngưng Đan cần linh mạch hoặc bảo vật |
| AF08 | Debuff 10 phút, giảm 50% tốc độ tăng tu vi |
| AG06 | Loại bỏ tu vi từ săn mồi và ăn thịt |
| AG10 | Linh hồn thủ lĩnh biến mất khi gia tộc giải tán |
| AH01 | Hấp thụ linh khí môi trường yêu cầu chủ động tu luyện |
| AH03 | Yêu Đan chỉ tăng chỉ số chiến đấu |
| AI01 | Người chơi và thủ lĩnh có ý thức riêng |
| AI03 | Pháp bảo và kho bị xóa khi gia tộc giải tán |
| AI06 | Nhật Nguyệt Tinh Hoa có khung giờ riêng theo thời gian game |
| AI08 | Tu vi dư từ linh thảo được bảo lưu sau đột phá thành công |
| AI09–AI12 | Yêu Đan tăng 10% năm thuộc tính và tính vào sức mạnh nội tại |

---

## 22. Nguyên tắc quản lý đặc tả

1. Quyết định BA mới hơn có thể thay thế quyết định cũ khi được người dùng chỉ định hoặc có xung đột trực tiếp rõ ràng.
2. Không tự bổ sung công thức, hệ số, ngưỡng hoặc gameplay chưa được chốt.
3. Phân biệt tính năng Alpha với định hướng Future.
4. Không tự khôi phục các cơ chế đã bị loại bỏ.
5. Các nội dung chưa chốt phải tiếp tục được phân tích nghiệp vụ trước khi lập trình.
6. Simulation Core phải bảo đảm tính nhất quán của trạng thái và dữ liệu.
7. Tài liệu này là bản tổng hợp định hướng và quy tắc đã chốt, không thay thế toàn bộ tài liệu đặc tả chi tiết của từng hệ thống.

---

**Kết thúc `about_game.md` — Working Draft v2.0**
