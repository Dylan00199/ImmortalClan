# Người chơi · 4 hướng, lượt vẽ 2

Chỉ có hai spritesheet người chơi: `male.png` và `female.png`. Tạo bằng công cụ ImageGen tích hợp ngày 2026-10-26 theo ảnh pixel nhỏ người dùng cung cấp làm **tham chiếu phong cách**, không sao chép khung giao diện hay chữ. Cả hai là PNG nền alpha, không có bóng đổ hoặc mặt đất.

Prompt chung: “exactly one cultivator, simple chunky pixel grid matching the supplied reference character, small chibi full-body silhouette, restrained detail. Strict 2×2 transparent sheet: top-left front, top-right back, bottom-left left profile, bottom-right right profile; same outfit and height in all four views, hard square edges, no gradient, text, scene, UI, cast shadow or aura.”

Prompt nữ bổ sung: “long dark violet-black hair, muted plum and charcoal robe, beige face”. Prompt nam bổ sung: “high tied topknot with short hair, compact charcoal and slate-blue robe, narrow beige sash, broader shoulders”. Bản nam được chỉnh một lần để khác nữ rõ hơn nhưng giữ nguyên bố cục 4 hướng.

Mỗi file có 4 góc nhìn theo ô 512×768 px trong ảnh 1024×1536 px; frontend cắt ô khi vẽ và đổi hướng theo di chuyển. Tỷ lệ bản đồ: người chơi cao khoảng 48 đơn vị, đá 70–100, cây 160–210; cụm hoa thấp hơn người chơi theo kích thước tự nhiên. Chưa có chuỗi khung hình chạy/tấn công, nên đây là sprite đứng 4 hướng chứ chưa phải hoạt họa cuối.
