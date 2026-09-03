# Hướng Dẫn Triển Khai signalInvest Lên Vercel (Trong 3 Phút)

> **Mục tiêu:** Hướng dẫn từng bước trực quan, chuẩn xác giúp nhà phát triển và nhà đầu tư đưa ứng dụng **signalInvest** lên môi trường Production trên nền tảng **Vercel** hoàn toàn miễn phí, tích hợp tự động CI/CD từ GitHub, hỗ trợ Edge/Serverless Functions và chứng chỉ SSL/TLS tự động chỉ trong vòng **3 phút**.

---

## ⏱️ Lộ Trình Triển Khai Nhanh (Timeline)

| Mốc Thời Gian | Bước Thực Hiện | Mục Tiêu Đạt Được |
| :---: | :--- | :--- |
| **00:00 - 00:30** | [Chuẩn Bị](#1-tổng-quan--chuẩn-bị-30-giây) | Kiểm tra tài khoản, API Key & Kiến trúc hệ thống |
| **00:30 - 01:15** | [Bước 1: Đẩy Mã Nguồn Lên GitHub](#bước-1-khởi-tạo--đẩy-mã-nguồn-lên-github-45-giây) | Khởi tạo Git & Đẩy code lên GitHub an toàn (chặn lộ secrets) |
| **01:15 - 02:00** | [Bước 2: Kết Nối Dự Án Trên Vercel](#bước-2-kết-nối--import-dự-án-trên-vercel-45-giây) | Import kho lưu trữ GitHub vào Vercel Dashboard |
| **02:00 - 02:30** | [Bước 3: Cấu Hình Biến Môi Trường](#bước-3-cấu-hình-biến-môi-trường-30-giây) | Khai báo `GEMINI_API_KEY` và các thiết lập AI Serverless |
| **02:30 - 03:00** | [Bước 4: Deploy & Kiểm Tra Tên Miền](#bước-4-triển-khai-deploy--nhận-tên-miền-miễn-phí-30-giây) | Nhận tên miền `https://<du-an>.vercel.app` hoạt động thực tế |

---

## 1. Tổng Quan & Chuẩn Bị (30 Giây)

### 1.1. Kiến Trúc Ứng Dụng Trên Vercel
**signalInvest** được tối ưu hóa theo mô hình hiện đại trên nền tảng Vercel:
- **Frontend & App Router (Next.js 16.3 / React 19):** Render giao diện người dùng nhanh chóng, SSR/SSG tối ưu SEO, hỗ trợ Turbopack.
- **Global Edge Network (CDN):** Phân phối tài sản tĩnh và phản hồi API qua hàng trăm điểm PoP (Points of Presence) toàn cầu, bộ đệm thông minh với cơ chế `stale-while-revalidate`.
- **Vercel Serverless Functions (Node.js 22):** Xử lý hai Route Handlers chính (`/api/market` và `/api/insights`) với thời gian phản hồi dưới 1 giây, cấu hình mở rộng thời gian thực thi lên đến 60 giây (`maxDuration = 60`).

```
[Người Dùng Trình Duyệt]
         │
         ▼
[Vercel Global Edge CDN] ───(Cache 15s-60s)───► [Giao diện & Dữ liệu tức thì]
         │
    (Cache Miss / Refresh)
         ▼
[Vercel Serverless Functions] (Node.js 22)
    ├── /api/market   ──► Yahoo Finance / Binance API / VNDIRECT Dchart
    └── /api/insights ──► Google Gemini API (Grounding Search) / Fallback Engine
```

### 1.2. Điều Kiện Cần Chuẩn Bị
Trước khi bắt đầu bấm giờ, hãy đảm bảo bạn đã có:
1. **Tài khoản GitHub:** Đã đăng nhập tại [github.com](https://github.com).
2. **Tài khoản Vercel:** Đăng ký miễn phí tại [vercel.com/signup](https://vercel.com/signup) (khuyến nghị đăng nhập bằng tài khoản GitHub để liên kết tức thì).
3. **Khóa Google Gemini API (Miễn phí):** Lấy khóa cá nhân tại [Google AI Studio](https://aistudio.google.com/app/apikey).
4. **Môi trường máy tính:** Đã cài đặt `git` và `node` (khuyến nghị Node >= 20.9.0).

---

## 2. Quy Trình Triển Khai 4 Bước (2.5 Phút)

### Bước 1: Khởi Tạo & Đẩy Mã Nguồn Lên GitHub (45 Giây)

> ⚠️ **CẢNH BÁO AN TOÀN QUAN TRỌNG:**
> File `.env.local` đang lưu trữ API Key cá nhân của bạn. File `.gitignore` của dự án đã được thiết lập quy tắc bảo vệ nghiêm ngặt:
> ```gitignore
> .env*
> !.env.example
> ```
> Trước khi đẩy code, hãy kiểm tra chắc chắn rằng `.env.local` **KHÔNG** nằm trong danh sách theo dõi của Git.

Mở Terminal tại thư mục gốc dự án (`/Users/thienlehoang/studyAnything/signalInvest`) và thực hiện lần lượt các lệnh:

```bash
# 1. Khởi tạo Git repository (nếu chưa có)
git init

# 2. Xác minh file .env.local đã được .gitignore bảo vệ (không xuất hiện trong Git)
git check-ignore -v .env.local
# Kết quả mong đợi: .gitignore:16:.env*    .env.local

# 3. Thêm tất cả mã nguồn vào Git staging
git add .

# 4. Kiểm tra trạng thái: Đảm bảo chỉ có .env.example, KHÔNG CÓ .env.local
git status --short | grep ".env"
# Kết quả mong đợi: Chỉ thấy "A  .env.example"

# 5. Tạo commit đầu tiên
git commit -m "feat: initial signalInvest ready for Vercel deployment"

# 6. Đổi nhánh chính sang 'main'
git branch -M main
```

**Tạo Repository trên GitHub:**
1. Truy cập [github.com/new](https://github.com/new).
2. Đặt tên Repository: `signalInvest` (hoặc tên tùy thích).
3. Để chế độ **Private** (khuyến nghị) hoặc **Public**.
4. **KHÔNG** tick vào các ô "Add a README file", "Add .gitignore", hay "Choose a license".
5. Bấm **Create repository**.

**Đẩy mã nguồn lên GitHub:**
```bash
# Thay thế <username> bằng tài khoản GitHub của bạn
git remote add origin https://github.com/<username>/signalInvest.git
git push -u origin main
```

---

### Bước 2: Kết Nối & Import Dự Án Trên Vercel (45 Giây)

1. Mở trình duyệt và truy cập [Vercel Dashboard](https://vercel.com/dashboard).
2. Ở góc phải màn hình, bấm vào nút **Add New...** -> Chọn **Project**.
3. Tại danh sách **Import Git Repository**, tìm kiếm `signalInvest` và bấm nút **Import** bên cạnh.
4. Màn hình **Configure Project** xuất hiện:
   - **Project Name:** Mặc định là `signal-invest` (bạn có thể giữ nguyên hoặc đổi theo ý muốn).
   - **Framework Preset:** Vercel sẽ tự động phát hiện là **Next.js**.
   - **Root Directory:** Giữ nguyên `./`.
   - **Build and Output Settings:** Giữ nguyên mặc định:
     - Build Command: `npm run build` (hoặc `next build`)
     - Output Directory: `.next`
     - Install Command: `npm install`

```
┌─────────────────────────────────────────────────────────────┐
│ Configure Project                                           │
├─────────────────────────────────────────────────────────────┤
│ Project Name:        signalInvest                           │
│ Framework Preset:    Next.js                                │
│ Root Directory:      ./                                     │
│ Build Command:       npm run build                          │
│ Output Directory:    .next                                  │
└─────────────────────────────────────────────────────────────┘
```

---

### Bước 3: Cấu Hình Biến Môi Trường (30 Giây)

Ngay tại màn hình **Configure Project**, cuộn xuống mục **Environment Variables** (hoặc vào tab *Settings > Environment Variables* nếu bạn đã import):

Nhập các biến môi trường theo bảng chuẩn hóa dưới đây:

| Tên Biến (Key) | Giá Trị Mẫu (Value) | Bắt Buộc | Phạm Vi (Environments) | Ghi Chú |
| :--- | :--- | :---: | :---: | :--- |
| `GEMINI_API_KEY` | `AIzaSy...` (Lấy từ Google AI Studio) | **Có** | Production, Preview, Development | Kích hoạt AI nhận định vĩ mô & cổ phiếu |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Không | Production, Preview, Development | Tối ưu độ trễ và ổn định nhất cho Serverless |
| `GEMINI_ENABLE_GOOGLE_SEARCH` | `true` | Không | Production, Preview, Development | Bật tính năng đối chiếu tin tức Google Search |

#### Thao tác nhập từng biến trên giao diện:
1. **Thêm `GEMINI_API_KEY`**:
   - Ô **Key**: Nhập `GEMINI_API_KEY`
   - Ô **Value**: Dán khóa API của bạn từ Google AI Studio
   - Đánh dấu chọn cả 3 môi trường: **Production**, **Preview**, **Development**
   - Bấm **Add**
2. **Thêm `GEMINI_MODEL`**:
   - Ô **Key**: Nhập `GEMINI_MODEL`
   - Ô **Value**: Nhập `gemini-2.5-flash`
   - Đánh dấu chọn 3 môi trường -> Bấm **Add**
3. **Thêm `GEMINI_ENABLE_GOOGLE_SEARCH`**:
   - Ô **Key**: Nhập `GEMINI_ENABLE_GOOGLE_SEARCH`
   - Ô **Value**: Nhập `true`
   - Đánh dấu chọn 3 môi trường -> Bấm **Add**

> 🔒 **Quy Tắc Bảo Mật Vàng:**
> Tuyệt đối **KHÔNG** đặt tiền tố `NEXT_PUBLIC_` cho `GEMINI_API_KEY`. Toàn bộ quá trình gọi AI được xử lý kín trong Serverless Function phía backend (`app/api/insights/route.ts` & `lib/gemini.ts`), chìa khóa API của bạn sẽ không bao giờ bị lộ ra mã JavaScript của trình duyệt.

---

### Bước 4: Triển Khai (Deploy) & Nhận Tên Miền Miễn Phí (30 Giây)

1. Sau khi cấu hình xong biến môi trường, bấm nút **Deploy** màu xanh lớn ở cuối trang.
2. Màn hình điều khiển sẽ chuyển sang giao diện **Building**:
   - Vercel tiến hành clone mã nguồn từ GitHub.
   - Chạy `npm install` và tải các dependencies tối ưu.
   - Chạy `next build` tạo các Route tĩnh và Serverless Handlers.
   - Thời gian build trung bình: **35 - 55 giây**.
3. Khi hoàn tất, màn hình pháo hoa chúc mừng xuất hiện: **"Congratulations! You just deployed a new Next.js project."**
4. Bấm vào ảnh xem trước (Preview) hoặc đường dẫn dạng:
   👉 `https://signalinvest.vercel.app` (hoặc tên dự án của bạn).

---

## 3. Nghiệm Thu Sau Triển Khai (Verification Checklist & API Test)

Sau khi trang web đã online, thực hiện các bước nghiệm thu kỹ thuật độc lập sau để đảm bảo 100% tính năng hoạt động hoàn hảo:

### 3.1. Kiểm Tra Giao Diện Người Dùng (UI Checklist)
Truy cập domain Vercel vừa tạo trên trình duyệt (Desktop & Mobile):
- [ ] **Bảng điều khiển tài sản (Asset Grid):** Hiển thị đầy đủ 5 nhóm tài sản chính:
  - Vàng (XAU/USD quy đổi VNĐ/lượng)
  - S&P 500 Index
  - Bitcoin (BTC/USD & VNĐ)
  - VN-Index (Chứng khoán Việt Nam)
  - Tỷ giá USD/VND
- [ ] **Bộ chọn khung thời gian (Time Range):** Chuyển đổi mượt mà giữa các tab `1W`, `1M`, `3M`, `1Y` và biểu đồ tương ứng cập nhật tức thì.
- [ ] **Khối Tương quan & Cảnh báo (Correlations & Alerts):** Hiển thị hệ số tương quan Vàng vs VN-Index, BTC vs S&P 500.
- [ ] **Nhận định Chiến lược Đầu tư (AI Insights):** Bấm nút **Làm mới AI** (Refresh) để kiểm tra luồng phân tích động.

---

### 3.2. Kiểm Tra Trực Tiếp API Routes (Command-line Verification)

Sử dụng lệnh `curl` trong Terminal để kiểm tra các Route Handlers trên domain thật của bạn:

#### 1. Kiểm tra API Thị Trường (`/api/market`):
```bash
# Thay your-app bằng tên miền Vercel thật của bạn
curl -I "https://your-app.vercel.app/api/market"
```
**Kết quả mong đợi:**
- HTTP Status: `200 OK`
- Header: `Content-Type: application/json`
- Header Cache: `Cache-Control: public, s-maxage=15, stale-while-revalidate=45`

Kiểm tra nội dung trả về:
```bash
curl -s "https://your-app.vercel.app/api/market?range=1M" | grep -o '"mode":"[^"]*"'
# Kết quả mong đợi: "mode":"live-real-data"
```

#### 2. Kiểm tra API Nhận Định Chiến Lược (`/api/insights`):
```bash
# Lấy dữ liệu với bộ đệm CDN (nhanh, tiết kiệm quota API)
curl -I "https://your-app.vercel.app/api/insights"
```
**Kết quả mong đợi:**
- Header Cache: `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`

```bash
# Kích hoạt làm mới trực tiếp qua Google Gemini AI (chạy Serverless Function)
curl -s "https://your-app.vercel.app/api/insights?refresh=true" | grep -o '"mode":"[^"]*"'
# Kết quả mong đợi: "mode":"gemini-live-refresh" (nếu có GEMINI_API_KEY)
# hoặc "mode":"strategy-real-data" (chế độ fallback chiến lược an toàn)
```

---

### 3.3. Kiểm Tra Logs Thực Thi (Vercel Runtime Logs)

1. Trên Vercel Dashboard, truy cập vào dự án của bạn -> chọn tab **Logs** (hoặc vào tab **Deployments** -> chọn deployment đang chạy -> chọn tab **Functions**).
2. Khi có request gọi vào `/api/market` hoặc `/api/insights`, bạn sẽ thấy các bản ghi:
   - `GET 200 /api/market` — Thời gian thực thi: **~120ms - 400ms**.
   - `GET 200 /api/insights?refresh=true` — Thời gian thực thi: **~2.5s - 5.8s** (gọi Gemini + Grounding Search).
3. Đảm bảo không có dòng log nào báo lỗi đỏ (Error 500 hay Timeout 504).

---

## 4. Cấu Hình Nâng Cao (Tùy Chọn)

### 4.1. Tự Động Hóa CI/CD Qua GitHub (Git Workflow)
Vercel tự động tích hợp CI/CD chuẩn doanh nghiệp thông qua kết nối GitHub:
- **Production Deployment:** Mỗi khi bạn chạy `git push origin main` (hoặc merge Pull Request vào `main`), Vercel sẽ tự động kích hoạt quá trình build và cập nhật phiên bản mới nhất cho tên miền chính thức trong ~40 giây.
- **Preview Deployments:** Mỗi khi bạn tạo một nhánh mới (`git checkout -b feature/new-indicator`) và mở Pull Request trên GitHub, bot Vercel sẽ tự động comment một đường dẫn xem trước độc lập (ví dụ: `https://signalinvest-git-feature-new-indicator-username.vercel.app`). Điều này giúp bạn kiểm thử tính năng thực tế trước khi gộp vào bản chính.

```
[Local Git] ─── git push ───► [GitHub main]
                                    │
                         (Webhook tự động kích hoạt)
                                    ▼
                          [Vercel CI/CD Runner]
                           ├── Build test (Next.js)
                           ├── Deploy Serverless
                           └── Cập nhật domain Production
```

---

### 4.2. Gắn Tên Miền Riêng (Custom Domain) Miễn Phí
Để biến ứng dụng thành một sản phẩm chuyên nghiệp với tên miền riêng (ví dụ: `dautu.tenban.vn` hoặc `signalinvest.com`):

1. Trên Vercel Dashboard, vào **Settings** -> **Domains**.
2. Nhập tên miền mong muốn vào ô trống (ví dụ: `invest.yourbrand.com`) -> Bấm **Add**.
3. Vercel sẽ cung cấp bảng hướng dẫn cấu hình DNS:
   - **Đối với Subdomain (ví dụ: `invest.yourbrand.com`):**
     - Type: `CNAME`
     - Name / Host: `invest`
     - Value / Target: `cname.vercel-dns.com`
   - **Đối với Apex Domain (ví dụ: `yourbrand.com`):**
     - Type: `A`
     - Name / Host: `@`
     - Value: `76.76.21.21`
4. Cập nhật các bản ghi trên tại trang quản lý DNS nhà cung cấp tên miền của bạn (Cloudflare, Namecheap, PA Việt Nam, Mắt Bão,...).
5. Vercel sẽ tự động xác minh và kích hoạt chứng chỉ bảo mật **SSL/TLS (HTTPS)** miễn phí từ Let's Encrypt trong vòng 1 - 5 phút.

---

## 5. Khắc Phục Sự Cố Thường Gặp (Troubleshooting FAQ)

### Q1: Gặp lỗi `504 Gateway Timeout` khi gọi `/api/insights?refresh=true`?
- **Nguyên nhân:** Trên gói Vercel Hobby (miễn phí), thời gian chạy mặc định của Serverless Function là 10 giây. Khi Gemini kích hoạt tính năng tìm kiếm mạng (Google Search grounding) vào giờ cao điểm, thời gian phản hồi có thể vượt quá 10s.
- **Giải pháp đã được signalInvest tích hợp sẵn:**
  1. File `app/api/insights/route.ts` đã khai báo:
     ```typescript
     export const maxDuration = 60; // Tăng thời gian chạy lên 60 giây
     ```
  2. Module `lib/gemini.ts` tích hợp sẵn `AbortController` với thời gian chờ an toàn 14 giây. Nếu mạng quá tải, hệ thống sẽ tự động chuyển sang chế độ fallback chiến lược an toàn (`mode: "strategy-real-data"`) mà không bao giờ để sập ứng dụng.

---

### Q2: Quên nhập hoặc nhập sai `GEMINI_API_KEY` thì trang web có bị sập không?
- **Trả lời:** **Hoàn toàn KHÔNG**.
- Kiến trúc của signalInvest được xây dựng theo nguyên lý *Graceful Degradation* (Dung sai lỗi cao):
  - Khi không có `GEMINI_API_KEY`, hệ thống sẽ tự động dùng thuật toán phân tích kỹ thuật nội bộ kết hợp dữ liệu thị trường thực tế từ Yahoo Finance & VNDIRECT.
  - Người dùng vẫn xem được đầy đủ biểu đồ, tương quan và danh mục khuyến nghị.
- **Cách khắc phục:**
  1. Vào Vercel Dashboard -> **Settings** -> **Environment Variables**.
  2. Bổ sung hoặc chỉnh sửa biến `GEMINI_API_KEY`.
  3. Bấm **Save**.
  4. Sang tab **Deployments** -> Bấm vào dấu `...` ở bản build mới nhất -> Chọn **Redeploy** để áp dụng biến mới.

---

### Q3: Sau khi đổi biến môi trường hoặc sửa code nhưng Vercel vẫn hiện dữ liệu cũ?
- **Nguyên nhân:** Vercel lưu bộ nhớ đệm build (Build Cache) và CDN Cache (`s-maxage`).
- **Cách khắc phục:**
  1. **Xóa Build Cache:** Vào **Deployments** -> chọn `...` -> chọn **Redeploy** -> **BỎ TICK** ở ô *"Use existing Build Cache"* -> Bấm **Redeploy**.
  2. **Vượt CDN Cache trên trình duyệt:** Thêm tham số `?refresh=true` vào URL hoặc nhấn tổ hợp phím `Ctrl + F5` (Windows) / `Cmd + Shift + R` (Mac) để tải lại trang.

---

### Q4: Gặp lỗi hạn mức `429 Too Many Requests` từ Google Gemini API?
- **Nguyên nhân:** Bạn đang dùng gói Gemini API Free Tier và vượt quá số lượng truy vấn cho phép trong 1 phút (thường là 15 RPM).
- **Giải pháp:**
  - signalInvest tự động bắt mã lỗi 429 và chuyển hướng êm đẹp sang fallback dữ liệu thật mà không gián đoạn trải nghiệm người dùng.
  - Thiết lập biến `GEMINI_MODEL=gemini-2.5-flash` trên Vercel để tối ưu hóa việc sử dụng quota và tăng tốc độ phản hồi.

---

## 6. Bảng Tra Cứu Tóm Tắt (Quick Reference Cheat Sheet)

```bash
# ==============================================================================
# BẢNG TRA CỨU NHANH CHO TRIỂN KHAI VERCEL
# ==============================================================================

# Kiểm tra an toàn trước khi đẩy code
git status
git check-ignore -v .env.local

# Đẩy code lên GitHub
git add .
git commit -m "feat: deploy to vercel"
git push origin main

# Biến môi trường quan trọng trên Vercel Dashboard
GEMINI_API_KEY=<khóa_lấy_từ_Google_AI_Studio>
GEMINI_MODEL=gemini-2.5-flash
GEMINI_ENABLE_GOOGLE_SEARCH=true

# Lệnh kiểm tra sức khỏe hệ thống sau deploy
curl -I "https://<your-app>.vercel.app/api/market"
curl -I "https://<your-app>.vercel.app/api/insights"
curl -s "https://<your-app>.vercel.app/api/insights?refresh=true" | grep mode

# ==============================================================================
```

---

*Tài liệu được cập nhật và kiểm thử tương thích hoàn toàn với Next.js 16.3, React 19 và Vercel Serverless Platform.*
