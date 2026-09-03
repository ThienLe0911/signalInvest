# Tasks — Strategic Asset Tracker & AI Strategy

## 1. Discovery & Design (Architecture Review)
- [x] T1.1 (PM/Architect) Thống nhất danh mục 8 lớp tài sản chiến lược và hợp đồng dữ liệu mở rộng (`Asset`, `StrategicScenario`, `MarketAlert`, `AssetCorrelation`).
- [x] T1.2 (PM/Architect) Thẩm định cơ chế an toàn AI: kiểm duyệt trích dẫn nguồn (Citations), phân chia 3 kịch bản, nghiêm cấm khuyến nghị mua bán trực tiếp.

## 2. Backend & Data Intelligence (it_backend)
- [x] T2.1 Cập nhật `lib/market.ts`: bổ sung 8 tài sản giá trị (`gold`, `gold_sjc`, `usd`, `vnindex`, `sp500`, `property`, `btc`, `interest_rate`).
- [x] T2.2 Xây dựng hàm `calculateCorrelation(seriesA, seriesB)` để phân tích tương quan giữa các lớp tài sản.
- [x] T2.3 Xây dựng hàm `generateMarketAlerts(assets)` phát hiện biến động mạnh và cảnh báo tài sản chưa có API thật.
- [x] T2.4 Xây dựng cơ chế làm mới dữ liệu từ các sàn giao dịch trực tiếp có cập nhật `observedAt` và `updatedAt`.
- [x] T2.5 Cập nhật `lib/gemini.ts` và `app/api/insights/route.ts`: sinh phân tích chiến lược đa kịch bản (Tích lũy / Cân bằng / Thận trọng), tương quan tài sản và trích dẫn nguồn có kiểm chứng.
- [x] T2.6 Mở rộng `app/api/market/route.ts`: hỗ trợ query `?refresh=true` và `?range=1W|1M|3M|1Y`, trả về `assets`, `alerts`, `correlations` và `updatedAt`.
- [x] T2.7 Kết nối trực tiếp các sàn giao dịch: Binance (BTC/USD), Yahoo Finance (Gold XAU/USD, USD/VND, S&P 500), VNDIRECT HOSE (VN-Index), SBV (Lãi suất điều hành).
- [x] T2.8 **Chính sách Zero Mock Data:** Loại bỏ 100% demo data; tài sản chưa có API (BĐS) gán `unavailable: true` và lý do minh bạch, không tạo số ảo.
- [x] T2.9 **Nạp Dữ liệu Động theo Range (1W, 1M, 3M, 1Y):**
  - Backend query trực tiếp số nến lịch sử tương ứng từ Binance (klines), Yahoo Finance (range), VNDIRECT (timestamp from/to).
  - Tự động tính toán lại % thay đổi thực tế trong kỳ: `((giá_hiện_tại - giá_đầu_kỳ) / giá_đầu_kỳ) * 100`.
- [x] T2.10 **[YÊU CẦU CỦA SẾP] Gợi ý Cổ phiếu Tiềm năng & Danh sách Theo dõi:**
  - Xây dựng `fetchRealStockPicks` trong `lib/realMarketData.ts` kết nối trực tiếp VNDIRECT để kéo giá khớp lệnh và % biến động thực tế của từng mã.
  - Phân loại 2 nhóm:
    1. *Cổ phiếu nên đầu tư:* FPT, HPG, VCB (kèm luận điểm tăng trưởng EPS, catalyst và rủi ro).
    2. *Cổ phiếu nên theo dõi:* SSI, MWG, KDH (kèm biến số dòng tiền, trigger phục hồi và rủi ro).

## 3. Frontend & Trực quan hóa (it_frontend)
- [x] T3.1 Cập nhật `app/page.tsx`: xây dựng giao diện Dashboard chuyên nghiệp với Header, nút Cập nhật dữ liệu ngay và hiển thị thời gian cập nhật.
- [x] T3.2 Thêm bộ lọc danh mục tài sản (Tất cả, Kim loại quý, Cổ phiếu, Ngoại tệ, Bất động sản, Tiền mã hóa, Vĩ mô).
- [x] T3.3 Nâng cấp lưới Thẻ tài sản (Asset Cards) với giao diện riêng cho tài sản `card-unavailable`.
- [x] T3.4 Cải tiến Biểu đồ so sánh chuẩn hóa (% Normalised Performance Chart) tự động loại trừ các tài sản không có dữ liệu thật.
- [x] T3.5 Xây dựng Khối Nhận định Chiến lược AI: hiển thị 3 kịch bản đầu tư (kèm xác suất %), ma trận tương quan tài sản, nguồn trích dẫn thật.
- [x] T3.6 Xây dựng Khối Cảnh báo Thị trường (Market Volatility & Data Availability Alerts).
- [x] T3.7 Hoàn thiện CSS hiện đại trong `app/globals.css`: Dark FinTech theme, badge `Chưa có API thật`.
- [x] T3.8 **Đồng bộ hóa Tải lại Range:** Khi người dùng click chọn 1W, 1M, 3M, 1Y, giao diện hiển thị trạng thái tải và kích hoạt load lại toàn bộ nến lịch sử cùng % hiệu suất kỳ hạn.
- [x] T3.9 **Trực quan hóa Danh mục Cổ phiếu Tiềm năng & Theo dõi:** Render 2 khối thẻ cổ phiếu nổi bật (badge giá thật, % phiên, luận điểm, xung lực và mức độ rủi ro).

## 4. Quality Control & Automation Testing (it_qc)
- [x] T4.1 Viết unit test trong `tests/market.test.ts` cho các hàm phân tích tài chính và cảnh báo unavailable.
- [x] T4.2 Viết test cho endpoint và mô hình dữ liệu phản hồi AI trong `tests/gemini.test.ts`.
- [x] T4.3 Viết test xác minh dữ liệu thật từ các sàn trong `tests/realMarketData.test.ts`.
- [x] T4.4 Chạy `npm test` (8/8 passed), `npm run typecheck` và `npm run build` đạt 100%.
- [x] T4.5 Lập báo cáo nghiệm thu theo `validation.md`.
