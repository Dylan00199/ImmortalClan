# Khảo sát asset cho Demo A

**Ngày kiểm tra:** 2026-10-26. Ảnh người dùng gửi là tham chiếu **phong cách**: pixel art tu tiên nhìn từ trên, nhà mái ngói, rừng/núi/sông, nhân vật nhiều hướng, bảng UI tối và viền vàng. Ảnh là một bảng minh họa tổng hợp, không phải spritesheet đã tách để đưa thẳng vào game. Các công trình và tính năng vượt [Scope Baseline v1.0](scope-baseline-demo-a-v1.0.md) không được thêm chỉ vì xuất hiện trong ảnh.

## Bộ ứng viên chính

| Nguồn | Phần phù hợp Demo A | Quyền sử dụng và giới hạn | Đánh giá |
|---|---|---|---|
| [Wuxia RTS Pixel Asset Pack — DQYYY](https://dqyyy.itch.io/wuxia-rts-pixel-asset-pack) | Bộ đồng bộ cho địa hình 64×64, nhân vật 8 hướng đi/đứng, kiến trúc sân/nhà, cây/gỗ/đá/quặng, VFX và 25 mảnh UI. Có **Free Lite Edition** để thử; bản đầy đủ hiện niêm yết **9,99 USD**. | Trang tác giả cho dùng/sửa trong game thương mại, không phân phối lại file nguồn; có dùng AI hỗ trợ. Hoạt ảnh combat/chết **không đầy đủ cho mọi nhân vật**. | **Ưu tiên thử đầu tiên** vì bao phủ nhiều hạng mục và giữ cùng một phối cảnh/palette. Kiểm tra đủ hoạt ảnh cho player và NPC canh gác/săn trước khi mua. |
| [Three Kingdoms Lousang Village — B.B.Bits](https://bbbits.itch.io/pixel-art-three-kingdoms-lousang-village-tileset) + [NPC Part 1 miễn phí](https://bbbits.itch.io/three-kingdoms-npc-characters-part-1) | Nhà làng/cây/cảnh 16×16 và NPC đi bốn hướng; bộ NPC miễn phí có 8 nhân vật. Tileset là sản phẩm trả phí, trang hiện hiển thị **5,99 USD** khi giảm giá. | Tác giả cho dùng/sửa trong game thương mại, cấm đóng gói/phân phối lại asset; công bố không dùng AI. NPC free chỉ có **đi**, không thấy hoạt ảnh tấn công. | **Phương án phong cách vẽ tay**, giản lược hơn ảnh mẫu. Dùng làm lối đi riêng, không trộn tùy tiện với bộ 64×64 DQYYY. |

## Bổ sung theo hạng mục

| Nguồn | Dùng cho | Lưu ý |
|---|---|---|
| [Kenney Roguelike/RPG Pack](https://kenney.nl/assets/roguelike-rpg-pack) và [Pixel UI Pack](https://kenney.nl/assets/pixel-ui-pack) | Tile/UI tạm để dựng frontend không chờ mua asset. | Miễn phí **CC0**, 16×16; dễ dùng nhưng phong cách ít tu tiên hơn ảnh tham chiếu. |
| [Animals & Beasts — Stonebit Studio](https://stonebit-studio.itch.io/animals-beasts-3232-pixel-art-4-direction-animated) | Yêu thú dạng sói/gấu/rắn; có idle, đi, tấn công, trúng đòn và chết bốn hướng. | 32×32, hiện niêm yết **3 USD**; dùng trong game thương mại, cấm phân phối file nguồn. Cần xem thử phối cảnh, tỉ lệ và màu với tileset chính trước khi dùng. |
| [Fantasy Sound Effects — OpenGameArt](https://lpc.opengameart.org/content/fantasy-sound-effects-tinysized-sfx) | Tiếng bước chân, kiếm, vật phẩm và UI khi cần âm thanh. | Miễn phí **CC0**; âm thanh thô cần chọn và xử lý âm lượng cho phù hợp. |

## Chọn bộ cho Demo A

1. Thử **Free Lite Edition của DQYYY** trên bản đồ mẫu: một đoạn đất/cây, một biệt viện/courtyard, player, bốn NPC đại diện, một yêu thú và HUD. Đây là bài kiểm tra hình ảnh, **không** bổ sung gameplay.
2. Nếu hướng 64×64 hợp ảnh tham chiếu, dùng một bộ chính để giữ tỉ lệ và màu. Chỉ thêm monster pack bên ngoài sau khi đặt cạnh nhân vật, nhà và tile trong cùng màn hình.
3. Nếu ưu tiên asset vẽ tay không AI và phong cách 16×16, thử B.B.Bits free NPC cùng mẫu Lousang Village; cần tìm/tạo riêng hoạt ảnh chiến đấu và UI đồng bộ.
4. Chưa mua hoặc đưa asset vào repo chỉ dựa trên ảnh preview. Xem đúng file tải, điều khoản đi kèm, kích thước tile, pivot, các hướng và số hoạt ảnh. Với asset trả phí, không đưa bản gốc vào repo công khai nếu giấy phép cấm phân phối lại.

## Khoảng trống còn phải xử lý

- **Bốn NPC cố định:** asset có thể làm mẫu hình, nhưng tính cách, lời thoại, điều kiện gia nhập và diện mạo cuối cùng phải thiết kế thủ công theo baseline. Không coi nhân vật có sẵn trong pack là NPC chính thức.
- **Hoạt ảnh combat top-down:** bộ chính có thể thiếu hướng/động tác cho guard/hunt; không dùng hoạt ảnh trận đấu nhìn ngang thay cho tấn công trên bản đồ.
- **Biệt viện:** chọn một kiến trúc/sân trong đúng phạm vi; các nhà kho, chợ, lò rèn, trận pháp trong ảnh tham chiếu không thuộc Demo A.
- **Chữ tiếng Việt:** UI nên dùng chữ render trong ứng dụng, không cắt chữ đã in trên ảnh mẫu. Font chọn sau khi kiểm tra đủ dấu tiếng Việt và đọc rõ ở kích thước game.
- **Nguồn gốc/license:** lưu bản sao điều khoản và tên tác giả/phiên bản khi thực sự tải asset. Giá và nội dung gói có thể thay đổi; kiểm tra lại tại thời điểm mua.

**Trạng thái:** mới khảo sát và chọn ứng viên; repo chưa chứa file asset tải từ các nguồn trên.
