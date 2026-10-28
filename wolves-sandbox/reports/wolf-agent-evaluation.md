# Báo cáo đánh giá hành vi — Wolf Mind Sandbox

- Ngày tạo: 2026-10-27T06:18:26.997Z
- Mẫu: 30 seed liên tiếp (1–30), mỗi seed 0.5 giờ mô phỏng (1800 giây).
- Bản đồ: v2, 3840×2560 px, nguồn đồng bộ từ frontend/assets/world.
- Adapter: Mock mặc định; Adam dùng Utility, Eva dùng LLM(Mock), Oden dùng Hybrid(Mock). Đây không phải đánh giá LLM trực tuyến.
- Kịch bản kiểm soát: mỗi seed xuất hiện đúng một mối đe dọa gần một sói (luân phiên Adam/Eva/Oden); môi trường và seed được lưu trong JSON kèm theo.
- Chỉ số “phù hợp cảm xúc” là tương quan quan sát giữa cảm xúc trội ≥ 0,35 và nhóm hành động được định nghĩa dưới đây; không khẳng định quan hệ nhân quả hay năng lực suy nghĩ ẩn.

## Cách tính

- **Quyết đoán:** tỷ lệ quyết định chiến lược có bắt đầu hành động; độ trễ trung bình từ lúc quyết định đến lúc bắt đầu; số lần đổi quyết định/giờ và bỏ kế hoạch.
- **Lý trí/khả thi:** tỷ lệ quyết định chiến lược qua điều kiện hợp lệ; tỷ lệ thành công trên số hành động chiến lược đã kết thúc. Đây là proxy định lượng, không phải đánh giá chất lượng kế hoạch của người chơi.
- **Cảm xúc → hành vi:** đếm trạng thái có cảm xúc trội ≥ 0,35 và tỷ lệ hành động khớp nhóm: sợ hãi→FLEE/REST/ATTACK_THREAT; tức giận→CHALLENGE/QUARREL/PROVOKE; vui vẻ→PLAY/GROOM/SHARE_FOOD/HOWL.
- **Bầy đàn/tiến triển:** số lần hạ mồi/đe dọa, tăng sức mạnh, chia/nhận thức ăn, bảo vệ thành công/thất bại, thắng/thua thách đấu, và số seed kết thúc với từng sói làm bá chủ.

## Kết quả theo sói

| Sói (brain) | Quyết định chiến lược | Bắt đầu hành động | Trễ bắt đầu TB (s) | Đổi ý/giờ | Bỏ kế hoạch | Điều kiện hợp lệ | Thành công hành động | Cảm xúc khớp (n) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Adam (utility) | 46.80 (95% CI ±2.50) | 90.8% (95% CI ±1.6 pp) | 0.00 (95% CI ±0.00) | 231.27 (95% CI ±7.04) | 7.87 (95% CI ±0.70) | 100.0% (95% CI ±0.0 pp) | 47.5% (95% CI ±6.2 pp) | 25.4% (95% CI ±2.0 pp) (3377) |
| Eva (llm) | 46.00 (95% CI ±2.00) | 94.8% (95% CI ±1.4 pp) | 0.00 (95% CI ±0.00) | 224.00 (95% CI ±7.52) | 18.87 (95% CI ±1.96) | 100.0% (95% CI ±0.0 pp) | 90.5% (95% CI ±2.2 pp) | 8.2% (95% CI ±0.7 pp) (3360) |
| Oden (hybrid) | 24.43 (95% CI ±2.58) | 92.4% (95% CI ±1.9 pp) | 0.00 (95% CI ±0.00) | 202.27 (95% CI ±6.83) | 7.20 (95% CI ±1.12) | 100.0% (95% CI ±0.0 pp) | 71.7% (95% CI ±3.9 pp) | 6.4% (95% CI ±1.0 pp) (3034) |

## Số liệu tổng hợp của 30 lượt

- Đối đầu do Eva khơi mào: 685 xung đột; 588 giao đấu bắt đầu.
- Xung đột ghi nhận: 685; giải quyết bằng giao đấu 588; bị chặn/hết thời hạn 97; đang chờ 0.
- Săn mồi: 9 lần; hạ đe dọa: 30 lần; tăng tổng 39 điểm tấn công và 195 máu tối đa.
- Cho/nhận thức ăn: 56/56; bảo vệ thành công/thất bại: 332/105 lượt (mỗi lượt được ghi ở cả sói đầu đàn và thành viên).
- Tỷ lệ kết thúc mô phỏng với bá chủ: 26.7% (8/30).
- LLM lỗi: 0 lần trên 3962 lượt gọi; LLM thời gian thực không tham gia báo cáo này.

## Đọc kết quả

- Tỷ lệ bắt đầu thấp kèm độ trễ cao cho thấy hành động chiến lược thường chưa rời giai đoạn quyết định trong cửa sổ mô phỏng; cần đọc cùng tỷ lệ bị chặn và số lượt hành động.
- Tỷ lệ điều kiện hợp lệ cao chỉ cho biết luật tiền điều kiện chấp nhận quyết định; cần đối chiếu tỷ lệ hành động hoàn tất để thấy khả năng thực thi.
- Chỉ số cảm xúc khớp thấp không đồng nghĩa NPC không có cảm xúc; nó cho biết cảm xúc trội ít đi cùng nhóm hành động đã quy ước trong phép đo này.
- Xem `wolf-agent-evaluation.json` để lấy kết quả từng seed, từng sói và trường dữ liệu đầy đủ; không dùng điểm tổng hợp để kết luận thay cho các số đếm thô.

## Phân bố theo cá thể

| Sói | Con mồi hạ (TB) | Đe dọa hạ (TB) | Cho ăn (TB) | Được cho ăn (TB) | Bảo vệ đạt (TB) | Bá chủ cuối lượt | Tấn công cuối (TB) | Máu tối đa cuối (TB) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Adam | 0.27 | 0.33 | 1.73 | 0.13 | 10.90 | 7/30 | 16.60 | 103.00 |
| Eva | 0.00 | 0.33 | 0.00 | 0.00 | 1.47 | 0/30 | 16.33 | 101.67 |
| Oden | 0.03 | 0.33 | 0.13 | 1.73 | 9.77 | 1/30 | 16.37 | 101.83 |

## Tệp dữ liệu

- JSON chứa phương pháp, cấu hình mẫu, số liệu trung bình và toàn bộ số liệu theo seed.

