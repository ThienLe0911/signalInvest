import type { Asset, Insight, StrategicScenario, AssetCorrelation } from "./market";
import { insight as fallbackInsight } from "./market";

type GeminiPayload = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    groundingMetadata?: {
      groundingChunks?: Array<{
        web?: {
          title?: string;
          uri?: string;
        };
      }>;
    };
  }>;
};

export async function createMarketInsight(assetList: Asset[]): Promise<Insight> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      ...fallbackInsight,
      generatedAt: new Date().toISOString()
    };
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const useGoogleSearch = process.env.GEMINI_ENABLE_GOOGLE_SEARCH === "true";

  const context = assetList.map(({ name, symbol, value, unit, changePercent, observedAt, source, freshness }) => ({
    name,
    symbol,
    value,
    unit,
    changePercent,
    observedAt,
    source,
    freshness
  }));

  const systemInstruction = `
Bạn là chuyên gia phân tích chiến lược đầu tư vĩ mô và tài sản giá trị của signalInvest (tiếng Việt).
Nhiệm vụ: Dựa trên bối cảnh dữ liệu thị trường cung cấp, hãy tổng hợp phân tích chiến lược đa tài sản (Vàng, Đô la, Chứng khoán, Bất động sản, Bitcoin, Lãi suất).

Quy tắc bắt buộc:
1. KHÔNG đưa ra khuyến nghị mua/bán cá nhân hoá, KHÔNG đặt mục tiêu giá, KHÔNG cam kết lợi nhuận.
2. Trình bày nhận định theo 3 kịch bản chiến lược khách quan:
   - Kịch bản 1: Tích lũy tài sản phòng thủ / Vàng & Trữ giá trị
   - Kịch bản 2: Tăng trưởng cân bằng đa tài sản
   - Kịch bản 3: Biến động vĩ mô & Quản trị rủi ro thắt chặt
3. Nêu rõ bối cảnh vĩ mô (Macro Overview) và tương quan tài sản.
4. Trích dẫn nguồn tin cậy.
`;

  const promptText = useGoogleSearch
    ? `${systemInstruction}\nTìm kiếm tin tức kinh tế vĩ mô mới nhất về Việt Nam, vàng thế giới/SJC, tỷ giá USD/VND, chứng khoán và Bitcoin. Viết báo cáo chiến lược súc tích tối đa 200 từ gồm: Tổng quan vĩ mô, phân tích xu hướng 3 kịch bản và rủi ro chính. Trích dẫn nguồn tin rõ ràng.`
    : `${systemInstruction}\nDữ liệu tài sản hiện tại: ${JSON.stringify(context)}.\nHãy viết tổng hợp nhận định chiến lược tối đa 160 từ bằng tiếng Việt khách quan, nêu rõ 3 kịch bản diễn biến thị trường và bối cảnh dòng tiền.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 14_000);

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        ...(useGoogleSearch ? { tools: [{ googleSearch: {} }] } : {}),
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 600
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini returned HTTP ${response.status}`);
    }

    const payload = (await response.json()) as GeminiPayload;
    const summary = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join(" ").trim();

    if (!summary) {
      throw new Error("Gemini returned empty text");
    }

    const webCitations = payload.candidates?.[0]?.groundingMetadata?.groundingChunks?.flatMap((chunk) =>
      chunk.web?.uri ? [{ label: chunk.web.title || "Nguồn tin tức thị trường", url: chunk.web.uri }] : []
    ) || [];

    const citations = webCitations.length > 0
      ? webCitations
      : assetList.slice(0, 4).map((asset) => ({ label: asset.source, url: asset.sourceUrl }));

    return {
      title: useGoogleSearch ? "Chiến lược Đầu tư Đa tài sản — Grounded AI" : "Báo cáo Chiến lược Phân bổ Tài sản (AI Analysis)",
      summary,
      macroOverview: "Kỳ vọng nới lỏng tiền tệ toàn cầu đan xen rủi ro tỷ giá và biến động địa chính trị đang định hình luồng dịch chuyển vốn giữa các kênh trú ẩn và kênh tăng trưởng.",
      confidence: "Trung bình",
      generatedAt: new Date().toISOString(),
      scenarios: fallbackInsight.scenarios,
      correlations: fallbackInsight.correlations,
      citations,
      limitations: useGoogleSearch
        ? `Tạo bởi ${model} sử dụng Google Search grounding. Thông tin chỉ dùng cho mục đích nghiên cứu chiến lược, không phải tư vấn tài chính cá nhân.`
        : `Tạo bởi ${model} dựa trên mô hình định lượng và dữ liệu thị trường thực tế. Người dùng cần thẩm định trước khi ra quyết định.`,
      snapshots: assetList
        .filter((a) => !a.unavailable && a.value !== null)
        .slice(0, 4)
        .map((a) => ({
          asset: a.name,
          value: `${a.value} ${a.unit}`,
          asOf: new Date(a.observedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          note: a.changePercent !== null && a.changePercent >= 0 ? `Tăng +${a.changePercent}%` : a.changePercent !== null ? `Giảm ${a.changePercent}%` : "Ổn định"
        }))
    };
  } catch (err) {
    // Trả về fallback với timestamp làm mới khi lỗi mạng hoặc timeout
    return {
      ...fallbackInsight,
      generatedAt: new Date().toISOString()
    };
  } finally {
    clearTimeout(timeout);
  }
}
