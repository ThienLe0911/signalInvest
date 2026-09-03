import { describe, expect, it } from "vitest";
import {
  getFreshnessStatus,
  hasValidCitations,
  insight,
  normalizePerformance,
  calculateCorrelation,
  generateMarketAlerts,
  assets
} from "../lib/market";

describe("market helpers & analytics", () => {
  it("normalizes the first point to zero and preserves history dates/values", () => {
    expect(normalizePerformance([100, 110])).toEqual([
      { index: 0, value: 0 },
      { index: 1, value: 10 }
    ]);
    expect(normalizePerformance([])).toEqual([]);

    // Kiểm tra khi có truyền history points
    const history = [
      { date: "31/08", value: 148.7 },
      { date: "03/09", value: 147.4 }
    ];
    const resWithHistory = normalizePerformance([148.7, 147.4], history);
    expect(resWithHistory).toEqual([
      { index: 0, value: 0, date: "31/08", rawValue: 148.7 },
      { index: 1, value: -0.87, date: "03/09", rawValue: 147.4 }
    ]);
  });

  it("flags old observations as stale and recent as fresh", () => {
    expect(getFreshnessStatus("2026-08-01T00:00:00+07:00")).toBe("stale");
    const freshTime = new Date().toISOString();
    expect(getFreshnessStatus(freshTime, new Date())).toBe("fresh");
  });

  it("requires HTTPS citations", () => {
    expect(hasValidCitations(insight)).toBe(true);
    expect(hasValidCitations({ ...insight, citations: [] })).toBe(false);
    expect(
      hasValidCitations({
        ...insight,
        citations: [{ label: "Insecure", url: "http://insecure.com" }]
      })
    ).toBe(false);
  });

  it("calculates Pearson correlation coefficient accurately", () => {
    // 2 chuỗi tăng hoàn toàn tỷ lệ thuận
    const seriesA = [10, 20, 30, 40, 50];
    const seriesB = [100, 200, 300, 400, 500];
    expect(calculateCorrelation(seriesA, seriesB)).toBe(1);

    // 2 chuỗi nghịch đảo hoàn toàn
    const seriesC = [50, 40, 30, 20, 10];
    expect(calculateCorrelation(seriesA, seriesC)).toBe(-1);

    // Chuỗi không đủ dữ liệu
    expect(calculateCorrelation([10], [20])).toBe(0);
  });

  it("generates unavailable alert for assets without real API", () => {
    const alerts = generateMarketAlerts(assets);
    expect(alerts.length).toBeGreaterThan(0);

    // Bất động sản chưa có API thật phải phát sinh cảnh báo unavailable
    const propertyAlert = alerts.find((a) => a.assetSymbol === "VN Property");
    expect(propertyAlert).toBeDefined();
    expect(propertyAlert?.title).toContain("Tạm ngừng hiển thị số liệu");
  });
});
