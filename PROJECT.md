# Project: signalInvest Production Deployment & Future-Proof Infrastructure

## Architecture
- **Framework**: Next.js 16.3.4 (Turbopack, App Router, React 19)
- **Primary Deployment Platform**: Vercel (Hobby/Pro Serverless Functions, Global Edge CDN, GitHub CI/CD)
- **Backup Deployment Platform**: VPS / Self-hosted (Docker Multi-stage Node 22 Alpine, Standalone output, Docker Compose)
- **Data & AI Flow**:
  - Live Market Data (`app/api/market`): Binance API (Crypto) + Yahoo Finance (Gold, S&P 500) + VNDIRECT Dchart (VN-Index) + Yahoo/ExchangeRate (USD/VND).
  - AI Strategy Insights (`app/api/insights`): Google Gemini AI Studio (gemini-3.7-flash / gemini-2.5-flash with Google Search grounding) + VNDIRECT Stock Picks + Fallback local strategies.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Standalone Output Configuration | Thêm `output: "standalone"` trong `next.config.ts` phục vụ Docker Alpine containerization | M1 | ORIGINAL_REQUEST §R1, R3 |
| 2 | Serverless Route Optimization (`/api/market`) | Cấu hình explicit `runtime = "nodejs"`, `dynamic = "force-dynamic"`, `maxDuration = 30`, headers cache tối ưu stale-while-revalidate | M1 | ORIGINAL_REQUEST §R1 |
| 3 | Serverless Route Optimization (`/api/insights`) | Cấu hình `runtime = "nodejs"`, `dynamic = "force-dynamic"`, `maxDuration = 60`, timeout handling, CDN cache headers | M1 | ORIGINAL_REQUEST §R1 |
| 4 | Resilient Test Suite | Khắc phục `tests/realMarketData.test.ts` để chạy pass 100% kể cả trong môi trường mạng cô lập / CI sandbox | M1 | ORIGINAL_REQUEST §AC |
| 5 | Environment Variables Standard (`.env.example`) | Chuẩn hóa file `.env.example` với đầy đủ tài liệu hướng dẫn cho GEMINI_API_KEY, GEMINI_MODEL, GEMINI_ENABLE_GOOGLE_SEARCH | M2 | ORIGINAL_REQUEST §R2 |
| 6 | Security Hardening (`.gitignore`) | Chuẩn hóa `.gitignore` với quy tắc wildcard `.env*` kết hợp `!.env.example`, chặn `.vercel/`, `.agents/`, macOS `.DS_Store`, logs | M2 | ORIGINAL_REQUEST §R2 |
| 7 | Multi-stage Dockerfile (Node Alpine) | Xây dựng Dockerfile 4-stage (`base`, `deps`, `builder`, `runner`) trên `node:22-alpine`, non-root user `nextjs:nodejs`, nhẹ <180MB | M3 | ORIGINAL_REQUEST §R3 |
| 8 | Docker Compose & `.dockerignore` | Tạo `docker-compose.yml` 1 lệnh chạy ngay kèm healthcheck, volume persistence cho data, và file `.dockerignore` chặn secrets | M3 | ORIGINAL_REQUEST §R3 |
| 9 | Vercel Deployment Documentation | Viết tài liệu chi tiết `docs/deployment/vercel-deploy.md` hướng dẫn triển khai 3 phút: GitHub, Vercel Import, Env, Custom Domain, API check | M4 | ORIGINAL_REQUEST §R4 |
| 10 | Automated Build & Test Acceptance | Chạy kiểm thử tự động toàn diện `npm run build` và `npm test` đạt 100% pass và Forensic Audit kiểm tra tính chân thực | M5 | ORIGINAL_REQUEST §AC |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Next.js 16 & Serverless API Optimization | `next.config.ts`, `app/api/market/route.ts`, `app/api/insights/route.ts`, `tests/realMarketData.test.ts` | none | DONE |
| M2 | Environment Variables & Security Hardening | `.env.example`, `.gitignore` | none | DONE |
| M3 | Docker Multi-stage & Compose for VPS | `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `public/.gitkeep` | M1 | DONE |
| M4 | Vercel Deployment Documentation | `docs/deployment/vercel-deploy.md` | M1, M2 | DONE |
| M5 | Final E2E Validation & Forensic Audit | Toàn bộ dự án: `npm run build`, `npm test`, Docker run check, Forensic integrity check | M1, M2, M3, M4 | DONE |

## Code Layout
- `next.config.ts`: Cấu hình Next.js build (`output: 'standalone'`, reactStrictMode)
- `app/api/market/route.ts`: API Route handler thị trường, cấu hình Serverless runtime, headers cache
- `app/api/insights/route.ts`: API Route handler nhận định AI & stock picks, cấu hình timeout `maxDuration`, fallback
- `tests/`: Bộ kiểm thử Vitest (`realMarketData.test.ts`, `market.test.ts`, `gemini.test.ts`)
- `.env.example`: Mẫu biến môi trường chuẩn production
- `.gitignore`: Danh sách loại trừ file nhạy cảm và metadata (.env*, .agents/, .vercel/)
- `Dockerfile`: Cấu hình build Docker đa tầng Node 22 Alpine
- `docker-compose.yml`: Cấu hình điều phối container dự phòng cho VPS
- `.dockerignore`: Danh sách loại trừ khi build Docker context (.env*, .vercel/, *.pem)
- `docs/deployment/vercel-deploy.md`: Tài liệu hướng dẫn triển khai Vercel chi tiết

## Interface Contracts
### Client ↔ `/api/market`
- Method: `GET`
- Query Params: `range` (`"1W" | "1M" | "3M" | "1Y"`, default `"1M"`), `refresh` (`"true" | "false"`)
- Response: `{ status: "ok" | "partial", range: string, mode: string, data: AssetData[], alerts: Alert[], correlation: ... }`
- Cache Headers:
  - Khi `refresh !== "true"`: `Cache-Control: public, s-maxage=15, stale-while-revalidate=45`
  - Khi `refresh === "true"`: `Cache-Control: no-store`

### Client ↔ `/api/insights`
- Method: `GET`
- Query Params: `refresh` (`"true" | "false"`)
- Response: `{ status: "ok" | "fallback", mode: string, data: InsightData, generatedAt: string }`
- Cache Headers:
  - Khi `refresh !== "true"`: `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`
  - Khi `refresh === "true"`: `Cache-Control: no-store`
