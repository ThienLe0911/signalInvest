export type Freshness = "fresh" | "delayed" | "stale";

export type AssetCategory = "precious_metals" | "currencies" | "equities" | "real_estate" | "crypto" | "macro";

export type Asset = {
  id: string;
  name: string;
  symbol: string;
  category: AssetCategory;
  value: number | null;
  unit: string;
  changePercent: number | null;
  observedAt: string;
  source: string;
  sourceUrl: string;
  freshness: Freshness;
  series: number[];
  unavailable?: boolean;
  unavailableReason?: string;
};

export type StrategicScenario = {
  id: string;
  name: string;
  probability: number;
  actionBias: "Tích lũy" | "Cân bằng" | "Thận trọng" | "Bảo vệ vốn";
  description: string;
  keyDrivers: string[];
};

export type AssetCorrelation = {
  assetA: string;
  assetB: string;
  coefficient: number;
  interpretation: string;
};

export type MarketAlert = {
  id: string;
  level: "info" | "warning" | "danger";
  title: string;
  message: string;
  assetSymbol?: string;
  timestamp: string;
};

export type StockPick = {
  symbol: string;
  name: string;
  sector: string;
  price: number | null;
  changePercent: number | null;
  thesis: string;
  catalyst: string;
  horizon: string;
  riskLevel: "Thấp" | "Trung bình" | "Cao";
};

export type Insight = {
  title: string;
  summary: string;
  confidence: "Thấp" | "Trung bình" | "Cao";
  generatedAt: string;
  citations: { label: string; url: string }[];
  limitations: string;
  macroOverview?: string;
  scenarios?: StrategicScenario[];
  correlations?: AssetCorrelation[];
  snapshots?: Array<{ asset: string; value: string; asOf: string; note: string }>;
  recommendedStocks?: StockPick[]; // Các mã chứng khoán nên đầu tư
  watchlistStocks?: StockPick[];    // Các mã chứng khoán nên theo dõi
};

const now = new Date().toISOString();

export const assets: Asset[] = [
  {
    id: "gold",
    name: "Vàng quốc tế",
    symbol: "XAU/USD",
    category: "precious_metals",
    value: 4475.0,
    unit: "USD/oz",
    changePercent: 1.24,
    observedAt: now,
    source: "COMEX / Yahoo Finance",
    sourceUrl: "https://finance.yahoo.com/quote/GC=F",
    freshness: "fresh",
    series: [4410, 4425, 4440, 4435, 4455, 4468, 4450, 4475.0]
  },
  {
    id: "gold_sjc",
    name: "Vàng miếng SJC",
    symbol: "SJC",
    category: "precious_metals",
    value: 147.2,
    unit: "Triệu VND/lượng",
    changePercent: 0.85,
    observedAt: now,
    source: "Thị trường Vàng Việt Nam",
    sourceUrl: "https://sjc.com.vn/",
    freshness: "fresh",
    series: [145.0, 145.5, 146.0, 146.2, 146.8, 147.0, 147.2]
  },
  {
    id: "usd",
    name: "Tỷ giá USD/VND",
    symbol: "USD/VND",
    category: "currencies",
    value: 26070,
    unit: "VND",
    changePercent: -0.11,
    observedAt: now,
    source: "Interbank Forex / Yahoo Finance",
    sourceUrl: "https://finance.yahoo.com/quote/USDVND=X",
    freshness: "fresh",
    series: [26172, 26109, 26102, 26076, 26070, 26070]
  },
  {
    id: "vnindex",
    name: "Chứng khoán Việt Nam",
    symbol: "VN-Index",
    category: "equities",
    value: 1820.16,
    unit: "điểm",
    changePercent: -0.65,
    observedAt: now,
    source: "Sở GDCK TP.HCM (HOSE) / VNDIRECT",
    sourceUrl: "https://dchart.vndirect.com.vn/",
    freshness: "fresh",
    series: [1810, 1815, 1825, 1820, 1832, 1828, 1820.16]
  },
  {
    id: "sp500",
    name: "Chứng khoán Mỹ",
    symbol: "S&P 500",
    category: "equities",
    value: 7666.6,
    unit: "điểm",
    changePercent: 0.45,
    observedAt: now,
    source: "S&P Dow Jones Indices / Yahoo Finance",
    sourceUrl: "https://finance.yahoo.com/quote/%5EGSPC",
    freshness: "fresh",
    series: [7610, 7625, 7640, 7635, 7650, 7666.6]
  },
  {
    id: "property",
    name: "Chỉ số Bất động sản",
    symbol: "VN Property",
    category: "real_estate",
    value: null,
    unit: "điểm",
    changePercent: null,
    observedAt: now,
    source: "Chưa có API đối tác",
    sourceUrl: "https://moc.gov.vn/",
    freshness: "stale",
    series: [],
    unavailable: true,
    unavailableReason: "Tạm ngừng hiển thị: Chưa có API trực tiếp từ đối tác dữ liệu bất động sản."
  },
  {
    id: "btc",
    name: "Bitcoin (Lưu trữ giá trị số)",
    symbol: "BTC/USD",
    category: "crypto",
    value: 77627,
    unit: "USD",
    changePercent: 0.42,
    observedAt: now,
    source: "Binance Spot Market",
    sourceUrl: "https://www.binance.com/en/trade/BTC_USDT",
    freshness: "fresh",
    series: [76200, 76800, 77100, 77300, 77500, 77627]
  },
  {
    id: "interest_rate",
    name: "Lãi suất điều hành SBV",
    symbol: "Refinancing Rate",
    category: "macro",
    value: 4.5,
    unit: "%/năm",
    changePercent: 0.0,
    observedAt: now,
    source: "Ngân hàng Nhà nước Việt Nam (SBV)",
    sourceUrl: "https://sbv.gov.vn",
    freshness: "fresh",
    series: [4.5, 4.5, 4.5, 4.5, 4.5, 4.5, 4.5, 4.5]
  }
];

export const insight: Insight = {
  title: "Báo cáo Chiến lược Phân bổ Tài sản Giá trị",
  summary: "Thị trường tài chính quốc tế và trong nước đang chứng kiến sự dịch chuyển dòng vốn đáng chú ý. Vàng thế giới và Bitcoin duy trì sức mạnh nhờ vị thế tài sản phòng hộ rủi ro lạm phát và thanh khoản toàn cầu. Tại Việt Nam, tỷ giá USD/VND duy trì ở vùng cân bằng trong khi VN-Index tiếp tục củng cố vùng đệm thanh khoản.",
  macroOverview: "Bối cảnh vĩ mô toàn cầu duy trì áp lực lãi suất thực dương nhưng kỳ vọng nới lỏng gia tăng. Tại Việt Nam, tỷ giá USD/VND được kiểm soát ổn định giúp ổn định tâm lý thị trường tài chính và hỗ trợ hoạt động xuất nhập khẩu.",
  confidence: "Cao",
  generatedAt: now,
  scenarios: [
    {
      id: "scen_accumulate",
      name: "Kịch bản 1: Tích lũy tài sản phòng thủ & Vàng (45% xác suất)",
      probability: 45,
      actionBias: "Tích lũy",
      description: "Bất ổn địa chính trị và chu kỳ nợ toàn cầu đẩy nhu cầu nắm giữ Vàng và tài sản khan hiếm lên cao. Nhà đầu tư ưu tiên bảo toàn giá trị vốn dài hạn.",
      keyDrivers: ["Lực cầu tích trữ vàng của các ngân hàng trung ương", "Tỷ giá liên ngân hàng giữ vững biên độ", "Dòng tiền thận trọng"]
    },
    {
      id: "scen_balanced",
      name: "Kịch bản 2: Cân bằng đa tài sản & Tăng trưởng vừa phải (35% xác suất)",
      probability: 35,
      actionBias: "Cân bằng",
      description: "Kinh tế phục hồi bền vững, VN-Index và S&P 500 bứt phá kháng cự. Phân bổ cân bằng giữa cổ phiếu doanh nghiệp đầu ngành và tài sản thanh khoản cao.",
      keyDrivers: ["Lợi nhuận doanh nghiệp niêm yết tăng trưởng", "Mặt bằng lãi suất duy trì mức hợp lý", "Thanh khoản thị trường cải thiện"]
    },
    {
      id: "scen_defensive",
      name: "Kịch bản 3: Biến động vĩ mô & Quản trị rủi ro thắt chặt (20% xác suất)",
      probability: 20,
      actionBias: "Thận trọng",
      description: "Rủi ro tỷ giá hoặc chỉ số giá leo thang bất ngờ buộc chính sách tiền tệ thận trọng hơn. Giữ tỷ trọng tiền mặt và công cụ phòng hộ ở mức an toàn.",
      keyDrivers: ["Biến động chỉ số DXY quốc tế", "Dòng vốn ngoại thận trọng", "Biến số thanh khoản ngắn hạn"]
    }
  ],
  correlations: [
    { assetA: "XAU/USD", assetB: "USD/VND", coefficient: 0.42, interpretation: "Tương quan đồng pha nhẹ: Căng thẳng tỷ giá thường kích thích nhu cầu nắm giữ vàng vật chất." },
    { assetA: "XAU/USD", assetB: "VN-Index", coefficient: -0.28, interpretation: "Tương quan nghịch chiều nhẹ: Khi tâm lý thị trường tìm kênh trú ẩn, dòng tiền cổ phiếu có xu hướng chậm lại." },
    { assetA: "BTC/USD", assetB: "S&P 500", coefficient: 0.65, interpretation: "Tương quan thuận: Tài sản số biến động đồng thuận với khẩu vị rủi ro công nghệ Mỹ." }
  ],
  recommendedStocks: [
    {
      symbol: "FPT",
      name: "Tập đoàn FPT",
      sector: "Công nghệ thông tin & AI",
      price: 72.4,
      changePercent: -1.09,
      thesis: "Hưởng lợi bền vững từ làn sóng đầu tư chuyển đổi số và trung tâm dữ liệu AI toàn cầu. Tăng trưởng lợi nhuận duy trì đều đặn trên 20%/năm.",
      catalyst: "Hợp tác phát triển hạ tầng AI Factory với các tập đoàn bán dẫn hàng đầu và mở rộng thị trường Nhật Bản/Mỹ.",
      horizon: "12 - 24 tháng",
      riskLevel: "Thấp"
    },
    {
      symbol: "HPG",
      name: "Tập đoàn Hòa Phát",
      sector: "Vật liệu xây dựng & Thép",
      price: 21.7,
      changePercent: -1.81,
      thesis: "Nhà sản xuất thép có chi phí cạnh tranh nhất khu vực. Đại dự án Dung Quất 2 đi vào hoạt động gia tăng mạnh công suất thép HRC giá trị cao.",
      catalyst: "Giải ngân vốn đầu tư công hạ tầng trọng điểm và các biện pháp phòng vệ thương mại bảo hộ thép nội địa.",
      horizon: "12 - 36 tháng",
      riskLevel: "Trung bình"
    },
    {
      symbol: "VCB",
      name: "Ngân hàng TMCP Ngoại thương VN",
      sector: "Tài chính & Ngân hàng",
      price: 59.2,
      changePercent: -1.50,
      thesis: "Vị thế ngân hàng số một về chất lượng tài sản, tỷ lệ nợ xấu thấp nhất ngành và bộ đệm bao phủ nợ xấu vượt trội (>200%). Lợi thế vốn rẻ CASA bền vững.",
      catalyst: "Dẫn đầu tăng trưởng tín dụng hỗ trợ doanh nghiệp sản xuất và giữ vai trò bình ổn tỷ giá.",
      horizon: "12 - 24 tháng",
      riskLevel: "Thấp"
    }
  ],
  watchlistStocks: [
    {
      symbol: "SSI",
      name: "Chứng khoán SSI",
      sector: "Dịch vụ tài chính & Chứng khoán",
      price: 21.25,
      changePercent: -0.47,
      thesis: "Công ty chứng khoán đầu ngành hưởng lợi lớn nhất khi thanh khoản thị trường bùng nổ và lộ trình nâng hạng thị trường mới nổi (FTSE Emerging) thành hiện thực.",
      catalyst: "Theo dõi tiến độ kiểm thử hệ thống giao dịch mới KRX và sự trở lại của dòng vốn ngoại.",
      horizon: "Trung hạn",
      riskLevel: "Trung bình"
    },
    {
      symbol: "MWG",
      name: "Thế Giới Di Động",
      sector: "Bán lẻ tiêu dùng",
      price: 48.5,
      changePercent: 0.62,
      thesis: "Chuỗi Bách Hóa Xanh đạt điểm hòa vốn và bước vào chu kỳ đóng góp lợi nhuận, tái cấu trúc mạng lưới bán lẻ ICT tối ưu hóa dòng tiền.",
      catalyst: "Theo dõi tốc độ mở rộng điểm bán Bách Hóa Xanh và chỉ số sức mua tiêu dùng nội địa bán lẻ.",
      horizon: "6 - 12 tháng",
      riskLevel: "Trung bình"
    },
    {
      symbol: "KDH",
      name: "Nhà Khang Điền",
      sector: "Bất động sản dân cư",
      price: 28.3,
      changePercent: -0.35,
      thesis: "Doanh nghiệp bất động sản sở hữu cấu trúc tài chính lành mạnh, tỷ lệ đòn bẩy an toàn và quỹ đất sạch có pháp lý hoàn chỉnh tại TP.HCM.",
      catalyst: "Theo dõi tiến độ mở bán các dự án liên doanh quy mô lớn và sự tháo gỡ chính sách thị trường bất động sản.",
      horizon: "12 - 18 tháng",
      riskLevel: "Trung bình"
    }
  ],
  citations: [
    { label: "Báo cáo Thông tin Thị trường Tiền tệ — NHNN Việt Nam", url: "https://sbv.gov.vn" },
    { label: "Bảng giá Kim loại quý & Hàng hóa — COMEX / Yahoo", url: "https://finance.yahoo.com/commodities" },
    { label: "Dữ liệu Giao dịch Chứng khoán — HOSE / VNDIRECT", url: "https://dchart.vndirect.com.vn" },
    { label: "Bản tin Thị trường Tài chính — CafeF", url: "https://cafef.vn" }
  ],
  limitations: "Báo cáo phân tích chiến lược được xây dựng từ dữ liệu thị trường thực tế kết hợp mô hình định lượng. Không phải tư vấn đầu tư cá nhân hoá; nhà đầu tư tự chịu trách nhiệm cho các quyết định của mình."
};

export function normalizePerformance(series: number[]) {
  if (!series || !series.length || series[0] === 0) return [];
  const base = series[0];
  return series.map((value, index) => ({
    index,
    value: Number((((value / base) - 1) * 100).toFixed(2))
  }));
}

export function getFreshnessStatus(observedAt: string, nowAt = new Date()): Freshness {
  const ageHours = (nowAt.getTime() - new Date(observedAt).getTime()) / 3_600_000;
  return ageHours <= 24 ? "fresh" : ageHours <= 72 ? "delayed" : "stale";
}

export function hasValidCitations(item: Insight) {
  return Array.isArray(item.citations) && item.citations.length > 0 && item.citations.every((citation) => /^https:\/\//.test(citation.url));
}

export function calculateCorrelation(seriesA: number[], seriesB: number[]): number {
  const n = Math.min(seriesA.length, seriesB.length);
  if (n < 2) return 0;

  const a = seriesA.slice(seriesA.length - n);
  const b = seriesB.slice(seriesB.length - n);

  const meanA = a.reduce((sum, v) => sum + v, 0) / n;
  const meanB = b.reduce((sum, v) => sum + v, 0) / n;

  let numerator = 0;
  let denomA = 0;
  let denomB = 0;

  for (let i = 0; i < n; i++) {
    const diffA = a[i] - meanA;
    const diffB = b[i] - meanB;
    numerator += diffA * diffB;
    denomA += diffA * diffA;
    denomB += diffB * diffB;
  }

  const denominator = Math.sqrt(denomA * denomB);
  if (denominator === 0) return 0;

  return Number((numerator / denominator).toFixed(2));
}

export function generateMarketAlerts(assetList: Asset[]): MarketAlert[] {
  const alerts: MarketAlert[] = [];
  const currentTime = new Date().toISOString();

  assetList.forEach((asset) => {
    // Nếu tài sản bị tạm ngừng do chưa có API thật
    if (asset.unavailable) {
      alerts.push({
        id: `alert-unavailable-${asset.id}`,
        level: "info",
        title: `${asset.name}: Tạm ngừng hiển thị số liệu`,
        message: asset.unavailableReason || "Chưa có kết nối API chính thức từ đối tác dữ liệu; tạm ẩn số liệu để tránh sai lệch.",
        assetSymbol: asset.symbol,
        timestamp: currentTime
      });
      return;
    }

    // Cảnh báo biến động mạnh trên dữ liệu thật
    if (asset.changePercent !== null && Math.abs(asset.changePercent) >= 1.5) {
      alerts.push({
        id: `alert-volatility-${asset.id}`,
        level: asset.changePercent > 0 ? "warning" : "danger",
        title: `Biến động mạnh trên ${asset.name} (${asset.symbol})`,
        message: `${asset.symbol} ghi nhận mức thay đổi ${asset.changePercent > 0 ? "+" : ""}${asset.changePercent}% trong các phiên gần nhất. Khuyến nghị theo dõi chặt chẽ biên độ.`,
        assetSymbol: asset.symbol,
        timestamp: currentTime
      });
    }

    // Cảnh báo dữ liệu quá hạn
    if (asset.freshness === "stale") {
      alerts.push({
        id: `alert-stale-${asset.id}`,
        level: "warning",
        title: `Dữ liệu ${asset.name} cần cập nhật lại`,
        message: `Mốc quan sát gần nhất là ${new Date(asset.observedAt).toLocaleDateString("vi-VN")}. Hệ thống đang kết nối lại sàn giao dịch.`,
        assetSymbol: asset.symbol,
        timestamp: currentTime
      });
    }
  });

  return alerts;
}
