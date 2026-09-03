# Data intelligence — Spec (draft)

## Goal
Tạo lớp dữ liệu thị trường và tin tức đáng tin cậy cho vàng, USD/VND, bất động sản, chứng khoán Việt Nam/quốc tế và vĩ mô; tạo insight AI có bằng chứng, không tư vấn đầu tư cá nhân hoá.

## Business Context
Dữ liệu tài sản có đơn vị, độ trễ và điều khoản khác nhau. Người dùng cần biết số liệu đến từ đâu, có mới không và insight AI dựa trên chứng cứ nào.

## User Stories
* Người dùng xem series, đơn vị, thời điểm, nguồn và quality status.
* Người dùng đọc tóm tắt tin/kịch bản xu hướng tiếng Việt, có link nguồn và giới hạn.
* Analyst/editor theo dõi nguồn, dữ liệu trễ và duyệt/ẩn insight.
* Admin truy vết số liệu/claim về snapshot nguồn và model/prompt version.

## Functional Requirements
1. Quản lý source catalogue: coverage, licence/terms, cadence, timezone, delay, owner và trạng thái phê duyệt.
2. Ingest connector được duyệt với run log, retry/replay idempotent, rate limit, backoff và DLQ.
3. Lưu raw snapshot bất biến; chuẩn hoá observation có unit/currency/timestamp/revision/provenance.
4. Phát hiện duplicate, schema error, thiếu/stale/anomaly; invalid data không dùng cho chart/AI.
5. Cấp API series/latest/news/source/freshness/revision, luôn trả `as_of`, source và quality.
6. Dedupe news theo URL canonical/hash, giữ attribution/link/time và quyền dùng.
7. Gọi Gemini Pro qua AI Gateway server-side, chỉ với input có provenance, trả structured output và citations.
8. Chỉ publish insight khi schema/citation/evidence validator pass; không đủ evidence hoặc stale thì needs-review/unavailable.
9. Audit chain cho snapshot, observation, analysis và review/publish/hide.

## Business Rules
* Chỉ source `approved` được ingest/publish; license kiểm soát retention/redisplay.
* Không trộn series khác definition/market/frequency/unit mà không nêu conversion và provenance.
* Point/claim public truy vết được; correction tạo revision, không ghi đè raw.
* Forecast phải có horizon, scenarios, assumptions, evidence, confidence, limitations; không diễn đạt confidence như xác suất đã hiệu chuẩn khi chưa backtest.
* AI không bịa nguồn, không coi output là market data, không buy/sell/allocation/entry-exit/suitability.

## Permissions
Visitor/viewer đọc dữ liệu đã publish; analyst/editor review insight không xem secret; admin duyệt source/cấu hình role; service account dùng least privilege. Secret chỉ qua secret manager.

## Integrations
Approved market/macro/real-estate/news providers, Gemini Pro qua AI Gateway, object storage, relational/time-series DB, queue/scheduler, cache và observability. Provider cụ thể chốt sau Source Catalog/compliance approval.

## Non Functional Requirements
Cached chart API mục tiêu p95 ≤2 giây; ingestion không chặn UI; at-least-once nhưng idempotent; TLS, encryption, RBAC, allowlist, secret rotation, PII minimization, injection controls và telemetry freshness/error/DLQ/AI cost.

## Acceptance Criteria
* Có ít nhất một approved series cho vàng, FX, real-estate index, VN equity index, global equity index, macro; từng point có source/timestamps/unit/quality.
* API/UI phân biệt realtime/delayed/EOD/stale; re-run snapshot không duplicate; parser fail giữ raw và phát DQ event.
* Insight public có citation, time, confidence/limitations/disclaimer; citation/evidence fail thì block/withdraw.
* Gemini outage/quota không làm dashboard data hỏng và key không có trong client/repo/log.

## Out Of Scope
Môi giới, giao dịch/auto trading, KYC/suitability, portfolio cá nhân, realtime trả phí hoặc scraping trái terms, dự báo bảo đảm.
