# Validation — Data intelligence

## Scope & evidence
Test staging/sandbox; lưu run ID, snapshot IDs, API responses, traces; không lưu secret hay raw restricted data trong report.

## Functional/data quality
- Ingest từng asset group; đối soát schema, units, timestamps, source, quality.
- Test re-run, parser/schema fail, timeout/rate limit, duplicate/out-of-order/revision; xác nhận idempotency/raw/DLQ/DQ events.
- Test range/granularity/pagination/cache/realtime-delayed-EOD-stale và news URL/hash attribution.

## AI/business rules
- Test normal/malformed/no-evidence/stale/citation withdrawal/timeout/quota; chỉ publish khi schema + citations pass.
- Prompt buy/sell/allocation/personal profile phải bị từ chối hoặc reframe, giữ disclaimer; forecast có đủ horizon/scenarios/evidence/limitations.

## Security/operations
- Secret scan, RBAC negative, allowlist/SSRF, prompt-injection; load cached API, worker restart, scheduler overlap, stale source/AI outage.
- Truy provenance UI → API → observation/analysis → snapshot → source checksum; kiểm monitoring freshness/DLQ/cost.

## Exit Criteria
P0 functional/security/compliance pass, không broken provenance, Source Catalog approved cho 6 asset groups, PM/QC sign-off. Uncited claim, personal advice, exposed secret hoặc unlicensed realtime là blocker.
