# Market dashboard — Spec (draft)

## Goal
Cung cấp dashboard trung tâm cho asset lớn, chart, nguồn, freshness, news và insight AI tham khảo.

## Business Context
Người dùng phải ghép dữ liệu kinh tế, giá và tin từ nhiều nơi. Dashboard giúp nhận diện bức tranh chung để tự nghiên cứu thêm.

## User Stories
* Tôi xem nhanh vàng, USD/VND, nhà/đất, chứng khoán Việt Nam/quốc tế.
* Tôi đổi khung thời gian, so sánh asset và đọc chart không nhầm đơn vị/staleness.
* Tôi xem tin/tóm tắt AI, truy nguồn và biết đây không phải lời khuyên.
* Tôi dùng keyboard/screen reader cho nội dung chính.

## Functional Requirements
1. Cards có value, absolute/% change, direction, unit, timestamp, source, status.
2. Ranges 1D, 1W, 1M, 3M, 1Y, 5Y, max khi được hỗ trợ; đồng bộ chart/metrics.
3. So sánh multi-asset bằng % thay đổi từ đầu kỳ; mặc định một asset.
4. Chart title/unit/legend/tooltip value-date-source và loading/empty/error/stale + text/table alternative.
5. Market AI summary: conditional scenarios, sources, generated time, confidence, limitations, disclaimer.
6. News title/source/time/asset/topic/original link, asset filter/newest sorting.
7. Hiển thị fresh/delayed/stale/unavailable, last successful update và retry trong API rate limit.

## Business Rules
Mọi số liệu có unit/source/time/range; không thay data cũ bằng suy đoán. Multi-asset dùng %, source lỗi/stale phải label. AI chỉ diễn giải có citation, không buy/sell/allocation/entry-exit/suitability. Real estate là index/khu vực/source xác định, không định giá nhà cụ thể.

## Permissions
Visitor xem public dashboard nếu policy cho phép; authenticated user lưu non-sensitive UI preferences; editor/admin quản lý source/content theo architecture. Feature không tạo permission mới.

## Integrations
Internal market/news/insight APIs; Gemini chỉ qua backend; FE không gọi third-party data source.

## Non Functional Requirements
Responsive ≥320px, WCAG 2.2 AA, tiếng Việt/locale VN, main data mục tiêu ≤3 giây khi API đáp ứng, lazy-load phần phụ; không lộ key/gửi financial profile vào AI.

## Acceptance Criteria
* Dashboard có cards/chart/source/timestamp/status; range/asset cập nhật nhất quán, comparison là %.
* Tooltip/text alternative nêu date/value/unit/source; empty/error/stale rõ.
* AI summary có citation/time/uncertainty/disclaimer, không personalised advice.
* Keyboard, screen-reader smoke, contrast tests pass.

## Out Of Scope
Giao dịch, real portfolio, risk profile, personalized allocation, forecast guarantee, tư vấn pháp lý/thuế hoặc data licensing.
