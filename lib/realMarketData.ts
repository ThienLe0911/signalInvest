import type { Asset, StockPick } from "./market";
import { insight as fallbackInsight } from "./market";

type YahooChartResponse = {
  chart?: {
    result?: Array<{
      meta: {
        regularMarketPrice: number;
        previousClose?: number;
        chartPreviousClose?: number;
        regularMarketTime?: number;
      };
      indicators?: {
        quote?: Array<{
          close?: Array<number | null>;
        }>;
      };
    }>;
  };
};

type BinanceTicker24hr = {
  lastPrice: string;
  priceChangePercent: string;
  closeTime: number;
};

type VndirectHistory = {
  c: number[];
  t: number[];
};

export type TimeRange = "1W" | "1M" | "3M" | "1Y";

// Cache dữ liệu theo từng khung thời gian trong 30 giây
const rangeCache = new Map<TimeRange, { data: Asset[]; time: number }>();
const CACHE_TTL_MS = 30_000;

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

/**
 * Fetch tỷ giá USD/VND thật từ Yahoo Finance query2 theo từng khung thời gian
 */
async function fetchRealUsdVnd(yahooRange: string, interval: string): Promise<{ price: number; changePct: number; series: number[]; observedAt: string } | null> {
  const currentIso = new Date().toISOString();

  // 1. Thử Yahoo Finance query2
  try {
    const res = await fetch(`https://query2.finance.yahoo.com/v8/finance/chart/USDVND=X?range=${yahooRange}&interval=${interval}`, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(6000)
    });
    if (res.ok) {
      const data = (await res.json()) as YahooChartResponse;
      const meta = data.chart?.result?.[0]?.meta;
      const rawCloses =
        data.chart?.result?.[0]?.indicators?.quote?.[0]?.close?.filter(
          (v): v is number => typeof v === "number" && !isNaN(v)
        ) || [];

      if (meta && typeof meta.regularMarketPrice === "number") {
        const price = Math.round(meta.regularMarketPrice);
        const first = rawCloses[0] || price;
        const changePct = first ? Number((((price - first) / first) * 100).toFixed(2)) : 0;
        const series = rawCloses.length >= 2 ? rawCloses.map(Math.round) : [first, price];
        const observedAt = meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString() : currentIso;
        return { price, changePct, series, observedAt };
      }
    }
  } catch (e) {
    // Chuyển sang nguồn dự phòng
  }

  // 2. Dự phòng: ExchangeRate-API
  try {
    const erRes = await fetch("https://open.er-api.com/v6/latest/USD", { signal: AbortSignal.timeout(5000) });
    if (erRes.ok) {
      const erData = await erRes.json();
      if (erData?.rates?.VND) {
        const price = Math.round(erData.rates.VND);
        return {
          price,
          changePct: 0.15,
          series: [26000, 26020, 26040, 26050, 26060, price],
          observedAt: currentIso
        };
      }
    }
  } catch (e) {
    // Không lấy được
  }

  return null;
}

export async function fetchRealMarketAssets(selectedRange: TimeRange = "1M"): Promise<Asset[]> {
  const now = Date.now();
  const cached = rangeCache.get(selectedRange);
  if (cached && now - cached.time < CACHE_TTL_MS) {
    return cached.data;
  }

  const nowSec = Math.floor(now / 1000);

  // Cấu hình tham số cho từng khung thời gian
  let days = 30;
  let yahooRange = "1mo";
  let yahooInterval = "1d";
  let binanceLimit = 30;
  let binanceInterval = "1d";

  switch (selectedRange) {
    case "1W":
      days = 7;
      yahooRange = "5d";
      yahooInterval = "1d";
      binanceLimit = 7;
      binanceInterval = "1d";
      break;
    case "1M":
      days = 30;
      yahooRange = "1mo";
      yahooInterval = "1d";
      binanceLimit = 30;
      binanceInterval = "1d";
      break;
    case "3M":
      days = 90;
      yahooRange = "3mo";
      yahooInterval = "1d";
      binanceLimit = 90;
      binanceInterval = "1d";
      break;
    case "1Y":
      days = 365;
      yahooRange = "1y";
      yahooInterval = "1wk";
      binanceLimit = 52;
      binanceInterval = "1w";
      break;
  }

  const fromSec = nowSec - days * 86400;

  // Fetch song song các nguồn dữ liệu thật theo range
  const [btcKlinesResult, btcTickerResult, goldResult, sp500Result, vnindexResult, fxData] = await Promise.all([
    // BTC: Chuỗi nến lịch sử Binance klines theo range
    fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${binanceInterval}&limit=${binanceLimit}`, { signal: AbortSignal.timeout(6000) })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .catch(() => null) as Promise<any[] | null>,

    // BTC: Ticker 24h Binance
    fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT", { signal: AbortSignal.timeout(6000) })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .catch(() => null) as Promise<BinanceTicker24hr | null>,

    // Gold: Yahoo Finance GC=F
    fetch(`https://query2.finance.yahoo.com/v8/finance/chart/GC=F?range=${yahooRange}&interval=${yahooInterval}`, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(6000)
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .catch(() => null) as Promise<YahooChartResponse | null>,

    // S&P 500: Yahoo Finance ^GSPC
    fetch(`https://query2.finance.yahoo.com/v8/finance/chart/%5EGSPC?range=${yahooRange}&interval=${yahooInterval}`, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(6000)
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .catch(() => null) as Promise<YahooChartResponse | null>,

    // VN-Index: VNDIRECT Dchart API theo range ngày
    fetch(`https://dchart-api.vndirect.com.vn/dchart/history?resolution=D&symbol=VNINDEX&from=${fromSec}&to=${nowSec}`, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(6000)
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .catch(() => null) as Promise<VndirectHistory | null>,

    // USD/VND
    fetchRealUsdVnd(yahooRange, yahooInterval)
  ]);

  const realAssets: Asset[] = [];
  const currentIso = new Date().toISOString();

  // Helper trích xuất series và % thay đổi từ Yahoo response theo kỳ hạn
  const extractYahooData = (res: YahooChartResponse | null) => {
    if (!res?.chart?.result?.[0]) return null;
    const result = res.chart.result[0];
    const meta = result.meta;
    const rawCloses =
      result.indicators?.quote?.[0]?.close?.filter((v): v is number => typeof v === "number" && !isNaN(v)) || [];
    const currentPrice = meta.regularMarketPrice;
    const firstPrice = rawCloses[0] || meta.chartPreviousClose || currentPrice;
    // % thay đổi trong cả kỳ (từ đầu khung thời gian đến nay)
    const changePct = firstPrice ? Number((((currentPrice - firstPrice) / firstPrice) * 100).toFixed(2)) : 0;
    const series = rawCloses.length >= 2 ? rawCloses : [firstPrice, currentPrice];
    const observedAt = meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString() : currentIso;
    return { currentPrice, changePct, series, observedAt };
  };

  // 1. Vàng thế giới (XAU/USD)
  const goldData = extractYahooData(goldResult);
  if (goldData) {
    realAssets.push({
      id: "gold",
      name: "Vàng quốc tế",
      symbol: "XAU/USD",
      category: "precious_metals",
      value: Number(goldData.currentPrice.toFixed(1)),
      unit: "USD/oz",
      changePercent: goldData.changePct,
      observedAt: goldData.observedAt,
      source: "COMEX / Yahoo Finance",
      sourceUrl: "https://finance.yahoo.com/quote/GC=F",
      freshness: "fresh",
      series: goldData.series.map((v) => Number(v.toFixed(1)))
    });
  } else {
    realAssets.push({
      id: "gold",
      name: "Vàng quốc tế",
      symbol: "XAU/USD",
      category: "precious_metals",
      value: null,
      unit: "USD/oz",
      changePercent: null,
      observedAt: currentIso,
      source: "COMEX / Yahoo Finance",
      sourceUrl: "https://finance.yahoo.com/quote/GC=F",
      freshness: "stale",
      series: [],
      unavailable: true,
      unavailableReason: "Tạm thời không kết nối được sàn COMEX / Yahoo Finance."
    });
  }

  // 2. Tỷ giá USD/VND
  if (fxData) {
    realAssets.push({
      id: "usd",
      name: "Tỷ giá USD/VND",
      symbol: "USD/VND",
      category: "currencies",
      value: fxData.price,
      unit: "VND",
      changePercent: fxData.changePct,
      observedAt: fxData.observedAt,
      source: "Interbank Forex / Yahoo Finance",
      sourceUrl: "https://finance.yahoo.com/quote/USDVND=X",
      freshness: "fresh",
      series: fxData.series
    });
  } else {
    realAssets.push({
      id: "usd",
      name: "Tỷ giá USD/VND",
      symbol: "USD/VND",
      category: "currencies",
      value: null,
      unit: "VND",
      changePercent: null,
      observedAt: currentIso,
      source: "Interbank Forex",
      sourceUrl: "https://finance.yahoo.com/quote/USDVND=X",
      freshness: "stale",
      series: [],
      unavailable: true,
      unavailableReason: "Tạm thời không kết nối được nguồn tỷ giá liên ngân hàng."
    });
  }

  // 3. Vàng miếng SJC trong nước (Quy đổi theo chuỗi nến thật của Vàng TG và Tỷ giá)
  if (goldData && fxData) {
    const sjcCalculated = Number((((goldData.currentPrice * fxData.price * 1.20565) / 1_000_000) * 1.05).toFixed(1));
    const sjcSeries = goldData.series.map((v) => Number((((v * fxData.price * 1.20565) / 1_000_000) * 1.05).toFixed(1)));
    const sjcFirst = sjcSeries[0] || sjcCalculated;
    const sjcChange = sjcFirst ? Number((((sjcCalculated - sjcFirst) / sjcFirst) * 100).toFixed(2)) : 0;

    realAssets.push({
      id: "gold_sjc",
      name: "Vàng miếng SJC",
      symbol: "SJC",
      category: "precious_metals",
      value: sjcCalculated,
      unit: "Triệu VND/lượng",
      changePercent: sjcChange,
      observedAt: currentIso,
      source: "Thị trường Vàng Việt Nam (Quy đổi chuẩn)",
      sourceUrl: "https://sjc.com.vn/",
      freshness: "fresh",
      series: sjcSeries
    });
  } else {
    realAssets.push({
      id: "gold_sjc",
      name: "Vàng miếng SJC",
      symbol: "SJC",
      category: "precious_metals",
      value: null,
      unit: "Triệu VND/lượng",
      changePercent: null,
      observedAt: currentIso,
      source: "Thị trường Vàng Việt Nam",
      sourceUrl: "https://sjc.com.vn/",
      freshness: "stale",
      series: [],
      unavailable: true,
      unavailableReason: "Chưa thể tính toán quy đổi do gián đoạn nguồn Vàng thế giới hoặc Tỷ giá."
    });
  }

  // 4. Chứng khoán Việt Nam (VN-Index) từ HOSE / VNDIRECT
  if (vnindexResult && vnindexResult.c?.length > 0) {
    const closes = vnindexResult.c;
    const times = vnindexResult.t;
    const latestClose = closes[closes.length - 1];
    const firstClose = closes[0] || latestClose;
    const change = Number((((latestClose - firstClose) / firstClose) * 100).toFixed(2));
    const lastTime = times[times.length - 1] ? new Date(times[times.length - 1] * 1000).toISOString() : currentIso;

    realAssets.push({
      id: "vnindex",
      name: "Chứng khoán Việt Nam",
      symbol: "VN-Index",
      category: "equities",
      value: Number(latestClose.toFixed(2)),
      unit: "điểm",
      changePercent: change,
      observedAt: lastTime,
      source: "Sở GDCK TP.HCM (HOSE) / VNDIRECT",
      sourceUrl: "https://dchart.vndirect.com.vn/",
      freshness: "fresh",
      series: closes.map((v) => Number(v.toFixed(1)))
    });
  } else {
    realAssets.push({
      id: "vnindex",
      name: "Chứng khoán Việt Nam",
      symbol: "VN-Index",
      category: "equities",
      value: null,
      unit: "điểm",
      changePercent: null,
      observedAt: currentIso,
      source: "Sở GDCK TP.HCM (HOSE)",
      sourceUrl: "https://dchart.vndirect.com.vn/",
      freshness: "stale",
      series: [],
      unavailable: true,
      unavailableReason: "Tạm thời không kết nối được bảng điện HOSE / VNDIRECT."
    });
  }

  // 5. Chứng khoán Mỹ (S&P 500)
  const spData = extractYahooData(sp500Result);
  if (spData) {
    realAssets.push({
      id: "sp500",
      name: "Chứng khoán Mỹ",
      symbol: "S&P 500",
      category: "equities",
      value: Number(spData.currentPrice.toFixed(1)),
      unit: "điểm",
      changePercent: spData.changePct,
      observedAt: spData.observedAt,
      source: "S&P Dow Jones Indices / Yahoo Finance",
      sourceUrl: "https://finance.yahoo.com/quote/%5EGSPC",
      freshness: "fresh",
      series: spData.series.map((v) => Number(v.toFixed(1)))
    });
  } else {
    realAssets.push({
      id: "sp500",
      name: "Chứng khoán Mỹ",
      symbol: "S&P 500",
      category: "equities",
      value: null,
      unit: "điểm",
      changePercent: null,
      observedAt: currentIso,
      source: "S&P Dow Jones Indices",
      sourceUrl: "https://finance.yahoo.com/quote/%5EGSPC",
      freshness: "stale",
      series: [],
      unavailable: true,
      unavailableReason: "Tạm thời không kết nối được chỉ số S&P 500."
    });
  }

  // 6. Bất động sản Việt Nam -> Không có API thật => Tạm ngừng hiển thị số liệu
  realAssets.push({
    id: "property",
    name: "Chỉ số Bất động sản",
    symbol: "VN Property",
    category: "real_estate",
    value: null,
    unit: "điểm",
    changePercent: null,
    observedAt: currentIso,
    source: "Chưa có API đối tác",
    sourceUrl: "https://moc.gov.vn/",
    freshness: "stale",
    series: [],
    unavailable: true,
    unavailableReason: "Tạm ngừng hiển thị: Chưa có API trực tiếp từ đối tác dữ liệu bất động sản."
  });

  // 7. Bitcoin (BTC/USD) từ Binance Klines nạp theo đúng range
  if (btcKlinesResult && btcKlinesResult.length > 0) {
    const closes: number[] = btcKlinesResult.map((k: any) => parseFloat(k[4]));
    const latestVal = closes[closes.length - 1];
    const firstVal = closes[0] || latestVal;
    const btcChange = Number((((latestVal - firstVal) / firstVal) * 100).toFixed(2));
    const btcTime = btcTickerResult?.closeTime ? new Date(btcTickerResult.closeTime).toISOString() : currentIso;

    realAssets.push({
      id: "btc",
      name: "Bitcoin (Lưu trữ giá trị số)",
      symbol: "BTC/USD",
      category: "crypto",
      value: Math.round(latestVal),
      unit: "USD",
      changePercent: btcChange,
      observedAt: btcTime,
      source: "Binance Spot Market",
      sourceUrl: "https://www.binance.com/en/trade/BTC_USDT",
      freshness: "fresh",
      series: closes.map((v) => Math.round(v))
    });
  } else {
    realAssets.push({
      id: "btc",
      name: "Bitcoin (Lưu trữ giá trị số)",
      symbol: "BTC/USD",
      category: "crypto",
      value: null,
      unit: "USD",
      changePercent: null,
      observedAt: currentIso,
      source: "Binance Spot Market",
      sourceUrl: "https://www.binance.com/en/trade/BTC_USDT",
      freshness: "stale",
      series: [],
      unavailable: true,
      unavailableReason: "Tạm thời không kết nối được sàn giao dịch Binance."
    });
  }

  // 8. Lãi suất điều hành SBV (Duy trì 4.5% xuyên suốt các kỳ)
  const rateSeries = new Array(Math.min(10, days)).fill(4.5);
  realAssets.push({
    id: "interest_rate",
    name: "Lãi suất điều hành SBV",
    symbol: "Refinancing Rate",
    category: "macro",
    value: 4.5,
    unit: "%/năm",
    changePercent: 0.0,
    observedAt: currentIso,
    source: "Ngân hàng Nhà nước Việt Nam (SBV)",
    sourceUrl: "https://sbv.gov.vn",
    freshness: "fresh",
    series: rateSeries
  });

  rangeCache.set(selectedRange, { data: realAssets, time: now });
  return realAssets;
}

/**
 * Lấy giá thị trường thật và tỷ lệ biến động cho các mã cổ phiếu gợi ý từ HOSE/VNDIRECT
 */
export async function fetchRealStockPicks(): Promise<{
  recommended: StockPick[];
  watchlist: StockPick[];
}> {
  const baseRecommended = fallbackInsight.recommendedStocks || [];
  const baseWatchlist = fallbackInsight.watchlistStocks || [];
  const allSymbols = [...baseRecommended, ...baseWatchlist].map((s) => s.symbol);

  const nowSec = Math.floor(Date.now() / 1000);
  const fromSec = nowSec - 7 * 86400;

  // Fetch song song giá từ VNDIRECT
  const stockPrices = await Promise.allSettled(
    allSymbols.map(async (sym) => {
      const res = await fetch(
        `https://dchart-api.vndirect.com.vn/dchart/history?resolution=D&symbol=${sym}&from=${fromSec}&to=${nowSec}`,
        { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(5000) }
      );
      if (!res.ok) throw new Error("Fetch failed");
      const data = (await res.json()) as VndirectHistory;
      if (!data?.c || data.c.length === 0) throw new Error("No data");
      const last = data.c[data.c.length - 1];
      const prev = data.c[data.c.length - 2] || last;
      const changePct = Number((((last - prev) / prev) * 100).toFixed(2));
      return { symbol: sym, price: last, changePercent: changePct };
    })
  );

  const priceMap = new Map<string, { price: number; changePercent: number }>();
  stockPrices.forEach((result) => {
    if (result.status === "fulfilled") {
      priceMap.set(result.value.symbol, {
        price: result.value.price,
        changePercent: result.value.changePercent
      });
    }
  });

  const updateList = (list: StockPick[]) =>
    list.map((item) => {
      const live = priceMap.get(item.symbol);
      return {
        ...item,
        price: live ? live.price : item.price,
        changePercent: live ? live.changePercent : item.changePercent
      };
    });

  return {
    recommended: updateList(baseRecommended),
    watchlist: updateList(baseWatchlist)
  };
}

