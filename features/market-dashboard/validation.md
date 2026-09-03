# Validation — Market dashboard

## Functional
- Cards đúng value/unit/change/source/time/status; range/insufficient series nhất quán.
- Multi-asset chuẩn hoá %; legend/tooltip/table khớp series/source.
- News filter/link/attribution đúng; AI có citations/time/uncertainty/disclaimer.
- 4xx/5xx/timeout/rate-limit/empty/stale/offline thể hiện rõ, retry đúng.

## Accessibility & UX
- Tab/Shift+Tab/Enter/Space, focus không kẹt; screen reader đọc title/value/status/control/alternative chart.
- Contrast AA, zoom 200%, 320px reflow; thay đổi không chỉ dùng màu.

## Security & performance
- Không có provider key ở bundle/console/request/UI; only internal API. Đo main-data budget và lazy-load chart/news phụ.

## Exit Criteria
Tất cả acceptance criteria pass, không blocker/critical, evidence test/a11y/viewports đầy đủ và PM xác nhận limitations data/AI.
