# Truy vết yêu cầu — Demo A v1.0

Nguồn chuẩn: [Scope Baseline đã duyệt](scope-baseline-demo-a-v1.0.md). Thiết kế: [System Design](system-design-demo-a.md), [Save/Load](save-load-contract-demo-a.md), [bàn giao frontend](frontend-handoff-demo-a.md), [schema](../database/mysql84-schema-draft.sql). “Đã thiết kế” nghĩa là đã có trách nhiệm, dữ liệu và hành vi ở mức hệ thống; **không** nghĩa là đã triển khai hoặc chạy nghiệm thu.

## Functional Requirements

| ID | Thiết kế liên quan | Trạng thái thiết kế |
|---|---|---|
| FR-01 | Run, frontend vào lượt chơi | Đã thiết kế; UI và API chờ triển khai. |
| FR-02 | Bản đồ 2D, vị trí/vùng, frontend canvas | Đã thiết kế; hình học/asset chờ nội dung. |
| FR-03 | Player cultivation/breakthrough trong snapshot | Đã thiết kế; ngưỡng đột phá chờ cấu hình. |
| FR-04 | HP, cooldown, target; backend combat | Đã thiết kế; giá trị sát thương/hồi đòn chờ cấu hình. |
| FR-05 | Monster `IDLE/CHASE/RETURN`, spawn/leash theo content version | Đã thiết kế; phạm vi chờ cấu hình. |
| FR-06 | Bốn `npc_definition`, bốn hàng NPC/snapshot, trạng thái chiêu mộ | Đã thiết kế; tính cách, thoại và điều kiện thủ công chờ nội dung. |
| FR-07 | Tồn kho, node tài nguyên, biệt viện/vị trí | Đã thiết kế; loại tài nguyên và chi phí chờ nội dung. |
| FR-08 | Bốn mã job cố định, một `job_slot`/NPC | Đã thiết kế. |
| FR-09 | Hoạt động `RESTING`, timer rồi trở lại việc | Đã thiết kế; ngưỡng/thời gian chờ cấu hình. |
| FR-10 | `RETREATING`, `RECOVERING`, `WAITING`, giữ việc | Đã thiết kế; ngưỡng/vùng đích chờ cấu hình. |
| FR-11 | `UNRECRUITED`, `SAFE_WANDER`, vùng an toàn và bất tử | Đã thiết kế; hình học vùng chờ nội dung. |
| FR-12 | `DEAD_WAITING`, hồi sinh một lần, `DEAD_PERMANENT` | Đã thiết kế cùng EX-02/03. |
| FR-13 | PlayerDeath có/không biệt viện, EX-05 | Đã thiết kế. |
| FR-14 | Snapshot giao dịch cả combat/retreat | Đã thiết kế; DDL là bản nháp, chưa chạy MySQL 8.4. |
| FR-15 | Ba điều kiện hoàn thành đồng thời | Đã thiết kế. |
| FR-16 | Thất bại có thể chứng minh, thông báo/chơi lượt mới | Đã thiết kế; cạn tài nguyên chỉ kết luận khi nội dung chứng minh. |

## Non-functional Requirements

| ID | Cách kiểm soát trong thiết kế | Còn phải đo/chốt |
|---|---|---|
| NFR-01 | Một lượt chơi trên browser; UI và backend tách trách nhiệm | Browser mục tiêu và cấu hình triển khai. |
| NFR-02 | MySQL 8.4/InnoDB, schema trong `database/` | Chạy DDL và migration trong môi trường MySQL 8.4. |
| NFR-03 | Active snapshot chỉ đổi sau `COMMIT`; Load nguyên vẹn | Kịch bản lỗi và thời gian Save/Load mục tiêu. |
| NFR-04 | `schema_version`/`content_version`; không cam kết Alpha | Chính sách giữ revision trong Demo. |
| NFR-05 | Một snapshot cho mọi state; đúng bốn NPC; stock/node/cooldown | Test không mất/nhân đôi qua Save/Load. |
| NFR-06 | Lưu vị trí và trạng thái rút lui/truy đuổi; dựng lại đường đi hợp lệ | Tiêu chí “kẹt” và thuật toán pathfinding. |
| NFR-07 | Frontend 2D và backend tick/cooldown tách lớp | Mức FPS/độ trễ thao tác chấp nhận. |
| NFR-08 | Lỗi việc NPC không được công bố snapshot nửa chừng | Quy tắc phục hồi lỗi runtime và test cô lập. |
| NFR-09 | Evaluator chạy sau Load trên world đã dựng | Bộ test kết quả đủ ba điều kiện và bất khả thi. |

## Acceptance Criteria

| ID | Bằng chứng cần có khi triển khai |
|---|---|
| AC-01 | Bản đồ/di chuyển và yêu thú quay về đúng giới hạn. |
| AC-02 | Một công pháp, một cảnh giới khởi đầu và một đột phá. |
| AC-03 | Lệnh tấn công chủ động, sát thương và cooldown xác nhận bởi backend. |
| AC-04 | Chiêu mộ bốn NPC thiết kế thủ công, không tạo NPC thứ năm. |
| AC-05 | Tài nguyên trừ đúng chi phí và biệt viện xuất hiện đúng vị trí. |
| AC-06 | NPC làm một việc chính, nghỉ/rút lui rồi tiếp tục đúng việc. |
| AC-07 | Guard giữ vùng cố định, Hunt tìm/đánh yêu thú. |
| AC-08 | Ngưỡng rút lui/hồi phục/chờ đúng giá trị cấu hình. |
| AC-09 | Mỗi NPC đã gia nhập dùng tối đa một lượt hồi sinh; chết vĩnh viễn mất việc. |
| AC-10 | Các ca SL-01..SL-06, SL-10/11/14/15 khôi phục đúng dữ liệu/vị trí. |
| AC-11 | PlayerDeath ở hai nhánh biệt viện có/chưa có; EX-05. |
| AC-12 | SL-12 hoàn thành **chỉ** khi đồng thời đủ ba điều kiện. |
| AC-13 | SL-07/13 hiển thị thất bại và tạo lượt chơi mới. |

## Cổng bàn giao

Scope và hành vi lõi đã đủ để **bắt đầu frontend** theo [tài liệu bàn giao](frontend-handoff-demo-a.md). Gameplay chưa thể nghiệm thu khi thiếu nội dung bốn NPC, bản đồ, loại tài nguyên và các giá trị ngưỡng/chi phí/phạm vi. Đây là công việc nội dung và cấu hình trong phạm vi đã duyệt; không phải yêu cầu mở scope.
