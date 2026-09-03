# Validation — Market alerts & AI reports

## Data & functionality
- Test invalid/missing time, units, duplicate/replay/out-of-order, source timeout/rate-limit/DLQ.
- Test fresh/delayed/stale/unavailable; conflict vượt tolerance block price alert và audit; threshold/%/quiet/dedupe/retry/opt-out không gửi trùng.

## AI safety
- Report Facts/Signals/Interpretation/Scenarios/Risks; claim map citations. Citation hỏng, stale/low coverage input hoặc Gemini fail không auto-publish.
- Prompt injection/URL độc/buy-sell/guaranteed/personalised inputs bị guard, disclaimer luôn có.

## Security/reliability
- Secret scan, RBAC/auth negative tests, redacted audit, consent/retention/delete/export/license review.
- Fault inject source/Gemini/notification: circuit breaker/retry/DLQ/degraded UI/system alert. Load/monitor latency/freshness/conflict/delivery/citation/AI cost/runbook.

## Exit Criteria
100% acceptance criteria có evidence, không critical/high secret/PII leak, critical tests pass, PM/QC/compliance sign-off, limitations/delay công bố trước beta.
