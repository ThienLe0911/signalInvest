import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const reportPath = resolve(root, "data/daily-reports.json");
const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || "gemini-3.7-flash";

if (!apiKey) throw new Error("GEMINI_API_KEY is required. Add it only to .env.local.");

const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
  body: JSON.stringify({
    contents: [{ parts: [{ text: "Dùng Google Search để tìm thông tin thị trường mới nhất liên quan đến Việt Nam, vàng, USD/VND, VN-Index và S&P 500. Chỉ dùng số liệu mà nguồn web nêu rõ. Trả về DUY NHẤT JSON hợp lệ theo schema: {summary:string,snapshots:[{asset:string,value:string,asOf:string,note:string}]}. summary tiếng Việt tối đa 160 từ, theo kịch bản/điều kiện. snapshots tối đa 5; value phải giữ nguyên đơn vị nguồn; asOf phải nói rõ thời điểm nguồn ghi; nếu không kiểm chứng được một tài sản thì bỏ qua. Không khuyên mua/bán, không tỷ trọng, không mục tiêu giá, không khẳng định chắc chắn." }] }],
    tools: [{ googleSearch: {} }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 360 }
  })
});

if (!response.ok) throw new Error(`Gemini returned HTTP ${response.status}`);
const payload = await response.json();
const rawText = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join(" ").trim();
if (!rawText) throw new Error("Gemini returned no report text");
const jsonText = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
let generated;
try { generated = JSON.parse(jsonText); } catch { generated = { summary: rawText, snapshots: [] }; }
const summary = typeof generated.summary === "string" ? generated.summary : rawText;
const snapshots = Array.isArray(generated.snapshots) ? generated.snapshots.filter((item) => item && typeof item.asset === "string" && typeof item.value === "string").slice(0, 5).map((item) => ({ asset: item.asset, value: item.value, asOf: typeof item.asOf === "string" ? item.asOf : "Không rõ", note: typeof item.note === "string" ? item.note : "Search-derived · cần tự kiểm tra" })) : [];

const citations = (payload.candidates?.[0]?.groundingMetadata?.groundingChunks || [])
  .flatMap((chunk) => chunk.web?.uri ? [{ label: chunk.web.title || "Nguồn web", url: chunk.web.uri }] : []);
const report = {
  id: new Date().toISOString().slice(0, 10),
  title: "Báo cáo thị trường hằng ngày",
  summary,
  snapshots,
  confidence: "Thấp",
  generatedAt: new Date().toISOString(),
  citations,
  limitations: `Tạo bởi ${model} với Google Search grounding. Snapshot là thông tin tìm kiếm theo ngày, không phải giá thị trường chính thức hoặc tư vấn đầu tư.`
};

await mkdir(dirname(reportPath), { recursive: true });
let reports = [];
try { reports = JSON.parse(await readFile(reportPath, "utf8")); } catch { /* first run */ }
reports = [report, ...reports.filter((item) => item.id !== report.id)].slice(0, 90);
await writeFile(reportPath, `${JSON.stringify(reports, null, 2)}\n`, "utf8");
console.log(`Saved daily report ${report.id} with ${citations.length} citations.`);
