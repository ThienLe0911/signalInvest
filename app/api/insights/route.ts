import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { NextRequest } from "next/server";
import { hasValidCitations, insight } from "@/lib/market";
import { createMarketInsight } from "@/lib/gemini";
import { fetchRealMarketAssets, fetchRealStockPicks } from "@/lib/realMarketData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shouldRefresh = searchParams.get("refresh") === "true";
    const cacheControl = shouldRefresh
      ? "no-store"
      : "public, s-maxage=60, stale-while-revalidate=300";

    // Lấy dữ liệu thật mới nhất làm bối cảnh phân tích AI
    const realAssets = await fetchRealMarketAssets();

    // Tạo snapshots thật dựa trên giá thị trường thực tế (chỉ lấy tài sản có giá trị thật)
    const liveSnapshots = realAssets
      .filter((a) => !a.unavailable && a.value !== null)
      .slice(0, 4)
      .map((a) => ({
        asset: a.name,
        value: `${a.value!.toLocaleString("vi-VN")} ${a.unit}`,
        asOf: new Date(a.observedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        note: a.changePercent !== null && a.changePercent >= 0 ? `Tăng +${a.changePercent}%` : a.changePercent !== null ? `Giảm ${a.changePercent}%` : "Ổn định"
      }));

    // Nếu người dùng yêu cầu refresh và có Gemini API key
    if (shouldRefresh && process.env.GEMINI_API_KEY) {
      try {
        const liveInsight = await createMarketInsight(realAssets);
        return Response.json(
          { data: liveInsight, mode: "gemini-live-refresh" },
          { headers: { "Cache-Control": cacheControl } }
        );
      } catch {
        // Graceful fallback nếu Gemini lỗi
      }
    }

    // Thử đọc từ daily report cache nếu có
    try {
      const file = resolve(process.cwd(), "data/daily-reports.json");
      const reports = JSON.parse(await readFile(file, "utf8"));
      const data = reports[0];
      if (data && hasValidCitations(data)) {
        return Response.json(
          { data: { ...data, snapshots: liveSnapshots }, mode: "daily-gemini-report" },
          { headers: { "Cache-Control": cacheControl } }
        );
      }
    } catch {
      // Không có file daily report, chuyển sang fallback chiến lược chuẩn
    }

    // Lấy dữ liệu giá và biến động thật của các mã cổ phiếu đầu tư & theo dõi
    const stockPicks = await fetchRealStockPicks();

    // Trả về insight chiến lược với snapshot dữ liệu thật và các mã chứng khoán khuyến nghị
    return Response.json(
      {
        data: {
          ...insight,
          title: "Báo cáo Chiến lược Đầu tư — Dữ Liệu Thị Trường Thực",
          snapshots: liveSnapshots,
          recommendedStocks: stockPicks.recommended,
          watchlistStocks: stockPicks.watchlist,
          generatedAt: shouldRefresh ? new Date().toISOString() : insight.generatedAt
        },
        mode: "strategy-real-data"
      },
      { headers: { "Cache-Control": cacheControl } }
    );
  } catch (error) {
    console.error("Insights API Handler Error:", error);
    return Response.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Failed to generate market insights",
        data: {
          ...insight,
          title: "Báo cáo Chiến lược Đầu tư (Dự phòng khẩn cấp)",
          snapshots: [],
          recommendedStocks: [],
          watchlistStocks: [],
          generatedAt: new Date().toISOString()
        },
        mode: "emergency-fallback"
      },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" }
      }
    );
  }
}
