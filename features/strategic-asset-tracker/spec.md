# Strategic Asset Tracker & AI Strategy — Spec

## Goal
Cung cấp hệ thống theo dõi toàn diện các lớp tài sản giá trị (Vàng SJC/Thế giới, Tỷ giá USD/VND, Chứng khoán VN-Index/S&P 500, Bất động sản, Bitcoin, Lãi suất), hỗ trợ cập nhật dữ liệu liên tục với nhãn độ tươi mới (Freshness) và sử dụng AI (Gemini) để phân tích nhận định chiến lược đầu tư đa kịch bản có trích dẫn nguồn minh bạch.

## Business Context
Nhà đầu tư cá nhân và tổ chức tại Việt Nam đang gặp khó khăn khi theo dõi bức tranh vĩ mô đa tài sản do dữ liệu phân mảnh, thiếu tính nhất quán và nhận định thị trường trôi nổi không rõ nguồn gốc. signalInvest giải quyết vấn đề này bằng cách chuẩn hóa dữ liệu, gắn nhãn thời điểm/nguồn gốc và cung cấp các kịch bản chiến lược phân bổ tài sản khách quan từ AI.

## User Stories
- **Là một nhà đầu tư:** Tôi muốn theo dõi giá trị, tỷ lệ thay đổi, biểu đồ lịch sử của các tài sản giá trị cốt lõi trên một bảng điều khiển duy nhất.
- **Là một nhà nghiên cứu:** Tôi muốn so sánh hiệu suất tương đối (% normalised performance) giữa các lớp tài sản khác nhau trong các khung thời gian 1W, 1M, 3M, 1Y.
- **Là một người dùng ra quyết định:** Tôi muốn chủ động bấm nút cập nhật dữ liệu để làm mới số liệu và nhận định thị trường mới nhất.
- **Là một người quan tâm chiến lược:** Tôi muốn xem nhận định AI với 3 kịch bản đầu tư rõ ràng (Tích lũy, Cân bằng/Phòng thủ, Thận trọng), kèm xác suất, phân tích tương quan và các nguồn tin tức dẫn chứng.
- **Là người dùng cẩn trọng:** Tôi muốn xem rõ cảnh báo biến động (Volatility Alerts) và tuyên bố miễn trừ trách nhiệm để hiểu rằng đây là phân tích tham khảo, không phải tư vấn tài chính cá nhân hoá.

## Functional Requirements
1. **Theo dõi tài sản giá trị:** Hỗ trợ tối thiểu 7 nhóm tài sản:
   - Vàng quốc tế (XAU/USD - USD/oz)
   - Vàng miếng SJC trong nước (Triệu VND/lượng)
   - Tỷ giá USD/VND (VND)
   - Chứng khoán Việt Nam (VN-Index - điểm)
   - Chứng khoán Mỹ (S&P 500 - điểm)
   - Chỉ số Bất động sản Việt Nam (VN Property Index - điểm)
   - Tài sản số lưu trữ giá trị (Bitcoin - BTC/USD)
   - Lãi suất điều hành vĩ mô (%/năm)
2. **Cập nhật dữ liệu & Trạng thái Freshness:**
   - Cung cấp tính năng làm mới dữ liệu (Manual Refresh & Auto Cadence) với timestamp `observedAt` và `updatedAt`.
   - Phân loại rõ ràng 3 trạng thái: `fresh` (≤ 24h), `delayed` (24h - 72h), `stale` (> 72h).
3. **Biểu đồ so sánh chuẩn hóa (%):**
   - Chuẩn hóa chuỗi số liệu về mốc 0% tại điểm bắt đầu chu kỳ để so sánh tương quan giữa các tài sản có đơn vị đo lường khác nhau.
   - Cho phép lọc khung thời gian: 1 tuần (1W), 1 tháng (1M), 3 tháng (3M), 1 năm (1Y).
4. **Nhận định chiến lược AI (AI Strategic Insights):**
   - Gọi Gemini API an toàn phía Server (kèm fallback nội bộ chất lượng cao khi không có API key).
   - Xuất ra 3 kịch bản chiến lược đầu tư: Tích lũy (Accumulation), Phòng thủ (Defensive), Thận trọng (Volatility/Risk-off) kèm xác suất ước lượng và khuyến nghị phân bổ tham khảo.
   - Phân tích ma trận tương quan giữa các lớp tài sản (ví dụ: Vàng vs USD, Cổ phiếu vs Lãi suất).
   - Trích dẫn nguồn tin tức (Citations with URLs) và nêu rõ các giới hạn phân tích (Limitations).
5. **Cảnh báo thị trường (Market Volatility & System Alerts):**
   - Tự động phát hiện và cảnh báo tài sản có biên độ dao động mạnh (threshold > 1.5%) hoặc tài sản có dữ liệu bị trễ (stale).

## Business Rules
- Mọi con số hiển thị phải có đơn vị (unit), nguồn gốc (source/sourceUrl) và mốc thời gian quan sát.
- Nhận định AI chỉ phục vụ mục đích nghiên cứu và giáo dục; không bao giờ phát sinh khuyến nghị mua/bán (buy/sell), cam kết lợi nhuận hay lời khuyên đầu tư cá nhân hóa.
- Mọi màn hình và báo cáo đều phải hiển thị tuyên bố miễn trừ trách nhiệm pháp lý rõ ràng.

## Permissions
- Người dùng công khai có quyền xem Dashboard, tra cứu số liệu, chuyển đổi bộ lọc và bấm làm mới dữ liệu.
- API Key AI chỉ được lưu trữ và truy cập tại tầng Server môi trường bảo mật, không xuất hiện ở Client hay Git.

## Integrations
- Tích hợp Gemini 1.5 / 2.0 API phía Server với cơ chế Google Search Grounding hoặc fallback nội bộ.
- Module tính toán dữ liệu nội bộ và Time-series metrics.

## Non Functional Requirements
- Thời gian tải trang ban đầu ≤ 2 giây.
- Giao diện thiết kế responsive trên mọi thiết bị (Mobile 320px, Tablet 768px, Desktop 1200px+).
- Đạt chuẩn tương phản và khả năng tiếp cận WCAG 2.2 AA (hỗ trợ keyboard navigation, text alternative cho biểu đồ).
- Đảm bảo 100% Type-safe (TypeScript strict mode) và vượt qua toàn bộ unit test tự động.

## Acceptance Criteria
- Dashboard hiển thị đầy đủ ít nhất 7 lớp tài sản giá trị với giá, % thay đổi, nhãn freshness và nguồn.
- Bấm nút "Cập nhật dữ liệu" làm mới lại dữ liệu thành công với thông báo phản hồi.
- Biểu đồ % thay đổi phản ánh chính xác tương quan tăng giảm của các tài sản được chọn.
- Khối nhận định AI hiển thị đầy đủ: Tổng quan vĩ mô, 3 Kịch bản chiến lược, Xác suất, Ma trận tương quan, Nguồn trích dẫn và Tuyên bố miễn trừ.
- Khối cảnh báo biến động hiển thị các cảnh báo tự động khi có biến động lớn hoặc dữ liệu trễ.
- 100% unit test (`npm test`) và typecheck (`npm run typecheck`) pass.

## Out Of Scope
- Đặt lệnh giao dịch tự động hoặc kết nối tài khoản chứng khoán/ngân hàng.
- Thu thập thông tin tài chính cá nhân để tư vấn danh mục riêng biệt.
