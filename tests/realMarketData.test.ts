import { describe, expect, it } from "vitest";
import { fetchRealMarketAssets } from "../lib/realMarketData";

describe("Live Market Data Feed", () => {
  it("fetches real assets with correct schema and valid values (online & offline resilient)", async () => {
    const assets = await fetchRealMarketAssets();
    expect(assets.length).toBeGreaterThanOrEqual(7);

    // Kiểm tra Bitcoin (Binance Live)
    const btc = assets.find((a) => a.id === "btc");
    expect(btc).toBeDefined();
    expect(btc?.source).toContain("Binance");
    if (btc?.value !== null) {
      expect(btc?.value).toBeGreaterThan(10000);
      expect(btc?.freshness).toBe("fresh");
    } else {
      expect(btc?.unavailable).toBe(true);
      expect(btc?.freshness).toBe("stale");
    }

    // Kiểm tra Vàng thế giới (Yahoo COMEX)
    const gold = assets.find((a) => a.id === "gold");
    expect(gold).toBeDefined();
    expect(gold?.source).toContain("Yahoo");
    if (gold?.value !== null) {
      expect(gold?.value).toBeGreaterThan(1500);
      expect(gold?.freshness).toBe("fresh");
    } else {
      expect(gold?.unavailable).toBe(true);
      expect(gold?.freshness).toBe("stale");
    }

    // Kiểm tra USD/VND (Yahoo / Interbank)
    const fx = assets.find((a) => a.id === "usd");
    expect(fx).toBeDefined();
    if (fx?.value !== null) {
      expect(fx?.value).toBeGreaterThan(20000);
      expect(fx?.freshness).toBe("fresh");
    } else {
      expect(fx?.unavailable).toBe(true);
      expect(fx?.freshness).toBe("stale");
    }

    // Kiểm tra VN-Index (VNDIRECT HOSE)
    const vnindex = assets.find((a) => a.id === "vnindex");
    expect(vnindex).toBeDefined();
    if (vnindex?.value !== null) {
      expect(vnindex?.value).toBeGreaterThan(500);
      expect(vnindex?.freshness).toBe("fresh");
    } else {
      expect(vnindex?.unavailable).toBe(true);
      expect(vnindex?.freshness).toBe("stale");
    }

    // Kiểm tra Bất động sản: Không có API thật thì phải unavailable và value null, không có số giả
    const property = assets.find((a) => a.id === "property");
    expect(property).toBeDefined();
    expect(property?.unavailable).toBe(true);
    expect(property?.value).toBeNull();
  }, 15000);

  it("validates that all returned assets strictly conform to Asset schema in all network conditions", async () => {
    const assets = await fetchRealMarketAssets();
    expect(assets.length).toBeGreaterThanOrEqual(7);
    for (const asset of assets) {
      expect(asset.id).toBeTruthy();
      expect(asset.name).toBeTruthy();
      expect(asset.symbol).toBeTruthy();
      expect(asset.category).toBeTruthy();
      expect(asset.source).toBeTruthy();
      expect(["fresh", "stale"]).toContain(asset.freshness);
      expect(Array.isArray(asset.series)).toBe(true);

      if (asset.unavailable) {
        expect(asset.value).toBeNull();
        expect(asset.changePercent).toBeNull();
      } else {
        expect(typeof asset.value).toBe("number");
      }
    }
  }, 15000);
});


