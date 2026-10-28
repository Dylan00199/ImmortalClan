# ImmortalClan — Tu Tiên Gia Tộc

## Cấu trúc Demo A

| Thư mục | Vai trò hiện tại |
|---|---|
| `frontend/` | Bản xem trước giao diện web chạy tại máy, dùng trạng thái mô phỏng. |
| `backend/` | Ranh giới API và luật trạng thái; chưa triển khai. |
| `database/` | Bản nháp schema MySQL 8.4; chưa chạy migration. |
| `docs/` | System Design, ERD, trạng thái NPC và Save/Load. |

Nguồn scope: [Scope Baseline Demo A v1.0 đã duyệt](docs/scope-baseline-demo-a-v1.0.md).

Thiết kế: [System Design](docs/system-design-demo-a.md), [hợp đồng Save/Load](docs/save-load-contract-demo-a.md), [bàn giao frontend](docs/frontend-handoff-demo-a.md), [truy vết FR/NFR/AC](docs/requirements-traceability-demo-a.md) và [schema MySQL 8.4](database/mysql84-schema-draft.sql).

Art: [khảo sát nguồn asset cho Demo A](docs/asset-sourcing-demo-a.md); sprite CC0 và [bộ môi trường tạo riêng](frontend/assets/environment/README.md) nằm trong [frontend/assets](frontend/assets/LICENSES.md).

Chạy frontend: `cd frontend` rồi `node server.mjs`, mở <http://127.0.0.1:4173>. Đây là bản xem trước giao diện; backend và MySQL chưa kết nối. Xem [hướng dẫn frontend](frontend/README.md).

Schema vẫn là bản nháp thiết kế; các ngưỡng, nội dung thủ công và hợp đồng API cần chốt trước khi coi gameplay là hoàn tất.

Prototype riêng để so sánh hành vi ba sói: [Wolf Mind Sandbox](wolves-sandbox/README.md). Ứng dụng này không thay đổi phạm vi Demo A.
