import { describe, expect, it } from "vitest";
import { createMarketInsight } from "../lib/gemini";
import { assets, hasValidCitations } from "../lib/market";

describe("AI Strategy & Gemini Integration", () => {
  it("provides full strategic insights even without GEMINI_API_KEY", async () => {
    // Đảm bảo không có key để test cơ chế fallback an toàn
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const result = await createMarketInsight(assets);

    expect(result).toBeDefined();
    expect(result.title).toBeTruthy();
    expect(result.summary).toBeTruthy();
    expect(result.scenarios).toBeDefined();
    expect(result.scenarios?.length).toBe(3);
    expect(result.citations.length).toBeGreaterThan(0);
    expect(hasValidCitations(result)).toBe(true);
    expect(result.limitations).toContain("Không phải tư vấn đầu tư");

    if (originalKey) {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

  it("ensures all 3 strategic scenarios have required fields and probabilities", async () => {
    const result = await createMarketInsight(assets);
    const scenarios = result.scenarios || [];

    const totalProbability = scenarios.reduce((sum, s) => sum + s.probability, 0);
    expect(totalProbability).toBe(100);

    for (const scen of scenarios) {
      expect(scen.name).toBeTruthy();
      expect(scen.actionBias).toMatch(/Tích lũy|Cân bằng|Thận trọng|Bảo vệ vốn/);
      expect(scen.keyDrivers.length).toBeGreaterThan(0);
    }
  });
});
