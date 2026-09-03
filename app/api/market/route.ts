import { NextRequest } from "next/server";
import { generateMarketAlerts, calculateCorrelation } from "@/lib/market";
import { fetchRealMarketAssets, TimeRange } from "@/lib/realMarketData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shouldRefresh = searchParams.get("refresh") === "true";
    const rangeParam = (searchParams.get("range") || "1M").toUpperCase() as TimeRange;
    const validRanges: TimeRange[] = ["1W", "1M", "3M", "1Y"];
    const range = validRanges.includes(rangeParam) ? rangeParam : "1M";

    // Lấy dữ liệu thật từ các sàn giao dịch tương ứng với khung thời gian đã chọn
    const currentAssets = await fetchRealMarketAssets(range);
    const alerts = generateMarketAlerts(currentAssets);

    // Tính tương quan động giữa Vàng và VN-Index, S&P 500 và BTC trên dữ liệu thật của kỳ hạn
    const goldAsset = currentAssets.find((a) => a.id === "gold");
    const vnindexAsset = currentAssets.find((a) => a.id === "vnindex");
    const sp500Asset = currentAssets.find((a) => a.id === "sp500");
    const btcAsset = currentAssets.find((a) => a.id === "btc");

    const dynamicCorrelations = [
      {
        assetA: "XAU/USD",
        assetB: "VN-Index",
        coefficient:
          goldAsset && vnindexAsset && goldAsset.series.length >= 2 && vnindexAsset.series.length >= 2
            ? calculateCorrelation(goldAsset.series, vnindexAsset.series)
            : -0.28,
        interpretation: `Tương quan trong khung thời gian ${range}: Phản ánh mối liên hệ giữa kênh trú ẩn và cổ phiếu Việt Nam.`
      },
      {
        assetA: "BTC/USD",
        assetB: "S&P 500",
        coefficient:
          btcAsset && sp500Asset && btcAsset.series.length >= 2 && sp500Asset.series.length >= 2
            ? calculateCorrelation(btcAsset.series, sp500Asset.series)
            : 0.65,
        interpretation: `Tương quan trong khung thời gian ${range}: Đo lường mức độ đồng pha giữa tài sản số và cổ phiếu công nghệ Mỹ.`
      }
    ];

    const cacheControl = shouldRefresh
      ? "no-store"
      : "public, s-maxage=15, stale-while-revalidate=45";

    return Response.json(
      {
        data: currentAssets,
        alerts,
        correlations: dynamicCorrelations,
        range,
        updatedAt: new Date().toISOString(),
        mode: "live-real-data"
      },
      {
        headers: {
          "Cache-Control": cacheControl
        }
      }
    );
  } catch (error) {
    console.error("Market API Handler Error:", error);
    return Response.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Failed to fetch market data"
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }
}
