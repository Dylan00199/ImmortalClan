# Hợp đồng trạng thái và Save/Load — Demo A

**Nguồn:** [Scope Baseline v1.0](scope-baseline-demo-a-v1.0.md), đặc biệt FR-09–FR-16, NFR-03/05/08/09, AC-08–AC-13 và EX-01–EX-06. Đây là hợp đồng thiết kế, chưa chốt endpoint HTTP hoặc framework.

## Trách nhiệm

| Thành phần | Trách nhiệm |
|---|---|
| Frontend | Gửi thao tác, vẽ bản đồ/HUD, hiển thị trạng thái và lỗi backend trả về; không tự quyết định luật. |
| Backend mô phỏng | Điều khiển NPC/yêu thú, HP, cooldown, nghỉ/rút lui, biệt viện, chiêu mộ và điều kiện hoàn thành. |
| Backend Save/Load | Chụp một ảnh tiến trình, kiểm tra bất biến, ghi/đọc snapshot, dựng runtime tạm và đánh giá lại kết quả. |
| MySQL 8.4 | Lưu snapshot theo revision; chỉ công bố revision đủ dữ liệu bằng giao dịch InnoDB. |

## Hợp đồng chuyển trạng thái

| Sự kiện | Tiền điều kiện | Hậu điều kiện |
|---|---|---|
| `RecruitNpc` | Đúng một trong bốn NPC cố định; điều kiện gia nhập riêng đã đạt. | `UNRECRUITED` → `ALIVE`; giữ định danh/slot. Chưa gia nhập trước sự kiện này ở vùng an toàn và không thể chết. |
| `AssignJob` | NPC đã gia nhập, chưa chết vĩnh viễn; công việc thuộc bốn loại. | Tối đa một công việc chính. NPC nghỉ/rút lui vẫn giữ việc để tiếp tục sau đó. |
| `ApplyDamageToNpc` | NPC đã gia nhập, sống; kiểm tra vị trí thực tế. | Trong biệt viện: HP không đổi. Ngoài biệt viện: tính HP; nếu HP=0 chuyển sang chết/chờ, hồi sinh hoặc chết vĩnh viễn tùy biệt viện/lượt. |
| `BuildVilla` | Đủ tài nguyên theo chi phí đã chốt. | Trừ tài nguyên đúng một lần; biệt viện tồn tại; mọi NPC chết/chờ còn lượt tự hồi sinh trong **cùng chuyển trạng thái game**. |
| `PlayerDeath` | Player HP về 0. | Có biệt viện: hồi sinh tại đó, HP/thể lực đầy, bỏ mục tiêu chiến đấu. Chưa có: kết thúc lượt chơi. |
| `Save` | Ảnh trạng thái game đồng nhất và hợp lệ, kể cả khi combat/retreat. | Active slot trỏ tới snapshot mới hoàn chỉnh. Lỗi: slot cũ giữ nguyên. |
| `Load` | Snapshot tồn tại, đúng schema/content version và hợp lệ. | Dựng runtime đầy đủ, áp dụng vị trí NPC, đánh giá lại kết quả rồi thay runtime. Lỗi: runtime cũ giữ nguyên. |

Đây là tên sự kiện logic; không quyết định giao diện API. Ngưỡng HP/thể lực, thời gian nghỉ, vùng bảo vệ, phạm vi truy đuổi và chi phí xây là tham số kỹ thuật còn cần chọn.

## Thứ tự Save

```mermaid
sequenceDiagram
    participant G as Game runtime
    participant S as Save service
    participant DB as MySQL
    G->>S: Yêu cầu Save khi có thể đang combat/retreat
    S->>G: Chụp trạng thái đồng nhất tại game_tick
    S->>S: Kiểm tra 4 NPC, tài nguyên, tiến trình, world, tham chiếu
    S->>DB: BEGIN; khóa slot; ghi toàn bộ snapshot mới
    S->>DB: Cập nhật active_snapshot_id; COMMIT
    DB-->>S: Revision đã công bố
    S-->>G: Save thành công
```

Ảnh trạng thái phải gồm: player HP/thể lực/tiến trình đột phá/vị trí/cooldown/target; bốn NPC (cả chưa gia nhập) với sinh tử, hoạt động, việc, HP/thể lực, lượt hồi sinh, vị trí/timer; biệt viện; tồn kho và node tài nguyên; yêu thú (HP, vị trí, đuổi/quay về, cooldown/target). Nội dung tĩnh được khóa bằng `content_version`. Không tăng thời gian game khi offline. Nếu lỗi công việc NPC xuất hiện, Save không được ghi snapshot nửa hợp lệ hoặc làm hỏng con trỏ cũ (NFR-08); cách phục hồi lỗi runtime sẽ được chốt khi thiết kế backend.

## Thứ tự Load

```mermaid
sequenceDiagram
    participant UI as Frontend
    participant BE as Backend
    participant DB as MySQL
    UI->>BE: Chọn bản lưu
    BE->>DB: Đọc active snapshot và tất cả hàng cùng revision
    DB-->>BE: Ảnh dữ liệu nhất quán
    BE->>BE: Kiểm tra version, 4 NPC và mọi bất biến
    BE->>BE: Dựng runtime tạm gồm bản đồ động/combat/tiến trình
    BE->>BE: Đặt NPC sống theo trạng thái biệt viện
    BE->>BE: Kiểm tra target/đường đi; khôi phục việc và timer
    BE->>BE: EvaluateOutcome trên runtime đã dựng
    BE->>BE: Thay runtime nếu tất cả thành công
    BE-->>UI: Trạng thái mới và kết quả
```

1. `UNRECRUITED` vẫn trong vùng an toàn; không dịch chuyển về biệt viện. `DEAD_WAITING` giữ chết/chờ, lượt 0 và việc cũ nếu bản lưu chưa có biệt viện. `DEAD_PERMANENT` không làm việc và không hồi sinh.
2. NPC **đã gia nhập và còn sống**: nếu snapshot có biệt viện, xuất hiện tại biệt viện rồi tiếp tục việc cũ sau thời gian nghỉ còn lại; nếu chưa có, giữ vị trí đã lưu (EX-01). Không sửa snapshot cũ khi Load.
3. Combat target không tồn tại hoặc không còn hợp lệ được bỏ qua/loại khỏi runtime để Load không lỗi. Chuyển NPC về biệt viện có thể làm đường đi và target trước đó không hợp lệ; hoạt động được dựng lại từ `job_slot` đã lưu, không tạo công việc mới.
4. Sau khôi phục: `COMPLETED` nếu **đồng thời** biệt viện tồn tại, bốn NPC `ALIVE`, player đã đột phá một lần. Nếu chưa hoàn thành nhưng một NPC cố định đã chết vĩnh viễn, `FAILED` vì không có NPC thay thế. Player chết trước biệt viện cũng kết thúc lượt. Các bất khả thi khác chỉ được kết luận khi dữ liệu và luật tài nguyên chứng minh; còn lại `IN_PROGRESS`.

Load bản lưu **trước** khi xây khôi phục thế giới chưa có biệt viện, nên NPC còn sống giữ vị trí cũ. Load bản lưu **sau** khi xây đặt NPC đã gia nhập còn sống ở biệt viện. Cách người chơi chọn một revision cũ chưa được baseline chốt; logic trên chỉ áp dụng khi revision đó thực sự được chọn.

## Bất biến cần kiểm tra

1. Mỗi snapshot có đúng một player, một villa, **đúng bốn NPC cố định**; không nhân đôi NPC qua Save/Load (NFR-05).
2. NPC chưa gia nhập chỉ ở trạng thái `UNRECRUITED`, sống trong vùng an toàn, không có việc và không dùng lượt hồi sinh (FR-11).
3. NPC sống có HP dương. `DEAD_WAITING` có HP=0, `revivals_used=0`, biệt viện chưa xây. `DEAD_PERMANENT` có HP=0, `revivals_used=1`, không có việc.
4. HP/thể lực không vượt tối đa; tài nguyên không âm; việc thuộc đúng bốn mã. Xây biệt viện trừ tài nguyên một lần và snapshot không làm mất/nhân đôi lượng đó.
5. Vị trí “bên trong biệt viện” phải được xác minh bằng vùng game, không dùng trạng thái nghỉ để miễn sát thương (EX-04).
6. Tất cả dữ liệu động dùng chung `snapshot_id`, `game_tick`, `content_version`; không trộn giữa hai revision.

## Ma trận ca kiểm tra

| Ca | Kịch bản | Kết quả cần thấy | Nguồn |
|---|---|---|---|
| SL-01 | Chưa có biệt viện, NPC sống ở ngoài → Save → Load | Giữ vị trí, việc và lượt hồi sinh. | EX-01, AC-10 |
| SL-02 | NPC chết/chờ trước biệt viện → Save → Load | Vẫn chờ, HP=0, lượt chưa dùng, việc giữ nguyên. | EX-02, AC-09/10 |
| SL-03 | Từ SL-02 → xây biệt viện | NPC chờ hồi sinh một lần, HP/thể lực đầy, giữ việc, nghỉ. | FR-12, EX-02 |
| SL-04 | Sau SL-03 → Save → Load | NPC sống xuất hiện tại biệt viện; `revivals_used=1`. | EX-01, AC-10 |
| SL-05 | Nếu chọn revision cũ của SL-02 | Biệt viện chưa có; NPC vẫn chờ theo revision cũ. | EX-01/02 |
| SL-06 | NPC sống trong biệt viện, đang nghỉ hoặc không nghỉ → nhận đòn | HP không đổi ở cả hai trường hợp. | EX-04 |
| SL-07 | NPC đã dùng hồi sinh → chết lần nữa → Save/Load | Chết vĩnh viễn; không có việc; kết quả thất bại vì không thể đủ bốn NPC sống. | EX-03/06, AC-09/13 |
| SL-08 | Player chết, đã có biệt viện | Hồi sinh trong biệt viện, HP/thể lực đầy, mục tiêu rỗng. | EX-05, AC-11 |
| SL-09 | Player chết, chưa có biệt viện | Lượt chơi kết thúc. | FR-13, AC-11 |
| SL-10 | Save giữa combat hoặc NPC đang rút lui | Load khôi phục HP, vị trí, cooldown, trạng thái cần thiết; không nhân đôi tài nguyên/NPC. | FR-14, NFR-05 |
| SL-11 | Save lỗi giữa giao dịch; Load snapshot thiếu/sai | Slot cũ nguyên vẹn; Load từ chối snapshot lỗi và giữ runtime hiện tại. | NFR-03/08 |
| SL-12 | Load: biệt viện có, 4 NPC sống, breakthrough=1 | `COMPLETED`. Thiếu bất kỳ điều kiện nào thì chưa hoàn thành. | FR-15, AC-12 |
| SL-13 | Load: một NPC cố định chết vĩnh viễn | `FAILED`, thông báo và có thể bắt đầu lượt chơi mới. | FR-16, AC-13 |
| SL-14 | NPC chưa gia nhập → Save/Load và nhận nguồn sát thương | Vẫn trong vùng an toàn, không thể chết, không tự thành NPC đã gia nhập. | FR-11 |
| SL-15 | Xây biệt viện bằng tài nguyên rồi Save/Load | Chi phí chỉ trừ một lần; node và tồn kho không bị khôi phục sai revision. | FR-07, NFR-05 |

Các ca này là **điều kiện nghiệm thu thiết kế**; chưa phải test code. Giá trị ngưỡng và nội dung thủ công phải được gắn vào dữ liệu nội dung trước khi chạy test gameplay.
