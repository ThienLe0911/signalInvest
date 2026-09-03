# signalInvest

MVP dashboard nghiên cứu tài sản bằng tiếng Việt. Ứng dụng hiện sử dụng **dữ liệu minh hoạ nội bộ**, không phải giá thị trường thực, không kết nối Gemini và không phải tư vấn đầu tư.

## Chạy cục bộ

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`. Kiểm tra bằng `npm run typecheck`, `npm test` và `npm run build`.

## Bảo mật

Không đặt Gemini API key trong trình duyệt, git hoặc chat. Khi tích hợp thật, sao chép `.env.example` thành `.env.local` và cấu hình secret qua môi trường triển khai.

## Gemini

Endpoint `/api/insights` sẽ gọi Gemini ở phía server khi `GEMINI_API_KEY` tồn tại; nếu không, hoặc Gemini lỗi/timeout, ứng dụng trả insight demo có nhãn rõ ràng. Tạo key từ Google AI Studio, đặt trong `.env.local`, rồi khởi động lại `npm run dev`. Hiện Gemini chỉ nhận các fixture nội bộ; hãy hoàn thành Source Catalog, licensing và provenance trước khi gửi dữ liệu thị trường thật.

Đặt `GEMINI_ENABLE_GOOGLE_SEARCH=true` để Gemini dùng Google Search grounding cho phần tin tức. URL Gemini trả về được hiển thị là citation; tính năng này không thay thế API dữ liệu thị trường được cấp phép.

## Báo cáo mỗi sáng

`scripts/generate-daily-report.mjs` gọi Gemini Google Search grounding hai lần mỗi ngày (07:15 và 16:15 theo giờ Mac) và lưu tối đa 90 báo cáo vào `data/daily-reports.json`. Dashboard chỉ đọc báo cáo mới nhất nên không gọi Gemini khi mở trang. Sau khi đặt key mới trong `.env.local`, cài bằng:

```bash
cp launchd/com.signalinvest.daily-report.plist ~/Library/LaunchAgents/
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.signalinvest.daily-report.plist
```

Mac phải bật gần 07:00; kiểm tra log tại `/private/tmp/signalinvest-daily-report.log` và `.error.log`.
