# Tasks — Data intelligence (draft)

## Phase 0 — Discovery & approval
- [ ] T0.1 PM chốt universe MVP, definition series/thị trường.
- [ ] T0.2 Lập Source Catalog: vendor, licence, quota/cost, retention, cadence/delay, fallback, owner; compliance approve.
- [ ] T0.3 Chốt disclaimer, editorial workflow, AI policy.
- [ ] T0.4 Người dùng cung cấp Gemini project/account, quota/billing qua secret manager; không gửi secret vào chat/repo.

## Phase 1 — Foundation
- [ ] T1.1 Thiết kế schema/migration source, raw snapshot, observation, news, analysis/citation, DQ event/audit.
- [ ] T1.2 Chốt versioned API/event contracts và fixtures.
- [ ] T1.3 Xây connector: scheduler, lock, retry/backoff, idempotency, run log, DLQ.
- [ ] T1.4 Xây raw store, normalizer/DQ: validate, dedupe, conversion, stale/anomaly, revision/audit.
- [ ] T1.5 Kết nối series mẫu sáu asset groups từ sources approved.

## Phase 2 — Serving data
- [ ] T2.1 Aggregate/read models và API chart/latest/metadata/freshness/revisions/news.
- [ ] T2.2 Cache TTL/key/invalidation theo SLA; response `as_of`/delay.
- [ ] T2.3 RBAC/audit cho admin/editor APIs.

## Phase 3 — News & AI
- [ ] T3.1 News canonicalisation/dedupe/attribution/classification + sanitization.
- [ ] T3.2 Gemini gateway server-only, versioning, quota/budget, telemetry/fallback.
- [ ] T3.3 Retrieval approved snapshots, structured insight, citation validator/publish gate.
- [ ] T3.4 Review/hide/audit và AI degradation states.

## Phase 4 — Release readiness
- [ ] T4.1 Chạy validation.md; T4.2 staging replay/đối soát; T4.3 security/compliance/runbook; T4.4 pilot và PM/QC sign-off.
