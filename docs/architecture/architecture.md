# Architecture — signalInvest (bản nháp)

## Quyết định kiến trúc

Kiến trúc modular monolith cho MVP, ranh giới sẵn sàng tách dịch vụ khi tải và độ phức tạp tăng lên. Lựa chọn công nghệ cụ thể chỉ được chốt sau khi duyệt spec/tasks.

```text
Nguồn dữ liệu được cấp phép ─┐
Nguồn tin được phép dùng ────┼─> Ingestion & chuẩn hoá ─> Kho dữ liệu thời gian
                              │             │                    │
Gemini Pro / AI provider ─────┘             v                    v
                                    Provenance & quality     API đọc duy nhất
                                                                  │
                                                          Web dashboard
```

## Thành phần

| Thành phần | Trách nhiệm |
|---|---|
| Connectors | Lấy dữ liệu qua API/nguồn đã được cấp phép, ghi nhận giấy phép và độ trễ. |
| Pipeline | Chuẩn hoá đơn vị, múi giờ, mã tài sản; kiểm tra thiếu/bất thường/dữ liệu trùng. |
| Time-series store | Lưu quan sát có timestamp, nguồn, phiên bản và trạng thái chất lượng. |
| News intelligence | Lưu bài/tóm tắt; Gemini chỉ xử lý nội dung được phép và phải trả citation/source IDs. |
| Analysis service | Tạo chỉ báo, so sánh và kịch bản xu hướng với confidence + limitations. |
| API | Cung cấp dữ liệu đã kiểm soát truy cập, phân trang, rate limit và audit log. |
| Dashboard | Hiển thị số liệu, chart, nguồn, freshness, disclaimer và trạng thái lỗi. |

## Hợp đồng dữ liệu tối thiểu

Mỗi quan sát gồm `asset_id`, `metric`, `value`, `unit`, `observed_at`, `published_at` (nếu có), `source_id`, `source_url`, `license`, `ingested_at`, `quality_status` và `revision`.

Mỗi insight AI gồm `summary`, `scenario`, `confidence`, `limitations`, `generated_at`, `model_version`, `prompt_version` và danh sách `source_ids`; không được lưu/hiển thị như một khuyến nghị đầu tư cá nhân.

## Bảo mật và vận hành

* API key Gemini chỉ ở secret manager/server; không xuất hiện ở client, log hoặc git.
* Áp dụng least privilege, mã hoá khi truyền/lưu, audit log và chính sách lưu giữ dữ liệu.
* Scheduler có retry/backoff, idempotency, quan sát lỗi và cơ chế gắn cờ dữ liệu cũ.
* Có bộ đánh giá chất lượng insight: factuality, citation coverage, độ mới và tỷ lệ từ chối phù hợp.

## Rủi ro/điểm cần quyết định trước implementation

1. Chọn nhà cung cấp dữ liệu có giấy phép cho vàng, FX, bất động sản, VN/international equities và news.
2. Xác định tần suất/độ trễ hiển thị được phép, nhất là dữ liệu chứng khoán thời gian thực.
3. Chọn cơ chế đăng nhập, phân quyền và hạ tầng triển khai.
4. Cung cấp Gemini API key/quyền truy cập sau khi có phương án quản lý secrets.
