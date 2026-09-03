# Market alerts & AI reports — Spec (draft)

## Goal
Cảnh báo có provenance và báo cáo AI có citations về asset lớn, minh bạch delay/confidence và không personalising advice.

## Business Context
Giá/tin có thể trễ, xung đột hoặc bị AI diễn giải sai; cảnh báo/báo cáo phải đặt evidence/freshness trước quyết định.

## User Stories
* Tôi tạo/tắt/xoá watchlist, threshold/% change và kênh alert.
* Tôi xem source, observed/collected time, timezone, delay, quality trên alert/report.
* Tôi nhận report gồm facts, signals, scenarios, risks/limits và disclaimer.
* Admin theo dõi source/job/delivery health, audit và khoá nguồn sự cố.

## Functional Requirements
1. Dùng source approved, lưu source URL/ID, license, observed/collected time, timezone, delay, version/transform.
2. Alerts threshold/% change/stale/missing/system: dedupe, throttle, quiet hours, idempotent retry và delivery audit.
3. Gemini reports dùng normalized/provenance inputs, tách Facts/Signals/AI interpretation/Scenarios/Risks; claim có citations.
4. Data/evidence thiếu, conflict hoặc stale hạ cấp/không forecast; conflict vượt tolerance không phát price alert.
5. Lưu history, trigger reason, snapshots, model/prompt version và opt-in/out.

## Business Rules
Freshness theo source và output nêu data-as-of/timezone. Không suy luận data không compatible. Citation invalid/injection/unprovenanced news bị exclude/review. AI dùng scenarios, không certainty/guarantee/buy-sell/allocation/suitability. Mọi output ghi “Thông tin tham khảo, không phải tư vấn đầu tư”.

## Permissions
User quản alert/report của mình; admin quản catalogue/policy/health không đọc secret; service least privilege cho data/AI/notification.

## Integrations
Approved data/news, Gemini Pro, notification provider (chốt sau), secret manager, observability/audit; mọi integration có timeout/rate-limit/backoff/circuit breaker/adapter.

## Non Functional Requirements
Server-only secrets, TLS/encryption/RBAC, PII minimization/consent, redacted audit, sanitation/allowlist, retention/delete/export. Jobs replayable/DLQ, monitoring freshness/conflict/delivery/AI cost. Target v1: p95 alert ≤5 phút sau collected time với healthy source, cần xác nhận trước production.

## Acceptance Criteria
* Alert/report/dashboard nêu source/times/timezone/freshness/stale banner.
* Source lỗi/trễ/xung đột không tạo price alert sai và có system audit.
* AI claim thiếu evidence/citation không auto-publish; key không lộ; opt-in/out/quiet/dedupe audit pass.
* Output luôn disclaimer và không advice cá nhân.

## Out Of Scope
Broker/trading/managed portfolio, recommendation cá nhân, guaranteed return, unlicensed tick/realtime, terms-violating scraping, thay thế chuyên gia/luật sư.
