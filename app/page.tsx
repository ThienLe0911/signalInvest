"use client";

import { useEffect, useMemo, useState } from "react";
import type { Asset, AssetCategory, Insight, MarketAlert, AssetCorrelation } from "@/lib/market";
import { normalizePerformance } from "@/lib/market";

const ranges = ["1W", "1M", "3M", "1Y"];

const rangeNames: Record<string, string> = {
  "1W": "1 Tuần (7 ngày)",
  "1M": "1 Tháng (30 ngày)",
  "3M": "3 Tháng (Quý)",
  "1Y": "1 Năm (365 ngày)"
};

const categoryLabels: Record<AssetCategory | "all", string> = {
  all: "Tất cả tài sản",
  precious_metals: "Kim loại quý & Vàng",
  equities: "Chứng khoán",
  currencies: "Ngoại tệ",
  crypto: "Tài sản số",
  macro: "Kinh tế vĩ mô",
  real_estate: "Bất động sản"
};

const freshnessLabels: Record<string, string> = {
  fresh: "Tươi mới",
  delayed: "Độ trễ",
  stale: "Cần cập nhật"
};

const moneyFormat = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 });

export default function Home() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [alerts, setAlerts] = useState<MarketAlert[]>([]);
  const [correlations, setCorrelations] = useState<AssetCorrelation[]>([]);
  const [selected, setSelected] = useState<string[]>(["gold", "usd", "vnindex", "btc"]);
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | "all">("all");
  const [range, setRange] = useState("1M");
  const [isLoading, setIsLoading] = useState(false);
  const [isRangeLoading, setIsRangeLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [error, setError] = useState(false);

  const fetchData = async (refresh = false, targetRange = range) => {
    if (refresh) {
      setIsLoading(true);
    } else {
      setIsRangeLoading(true);
    }
    setError(false);
    try {
      const url = refresh ? `/api/market?refresh=true&range=${targetRange}` : `/api/market?range=${targetRange}`;
      const insightUrl = refresh ? "/api/insights?refresh=true" : "/api/insights";

      const [marketRes, aiRes] = await Promise.all([
        fetch(url).then((r) => {
          if (!r.ok) throw new Error("Lỗi tải dữ liệu thị trường");
          return r.json();
        }),
        fetch(insightUrl).then((r) => {
          if (!r.ok) throw new Error("Lỗi tải dữ liệu nhận định AI");
          return r.json();
        })
      ]);

      setAssets(marketRes.data || []);
      setAlerts(marketRes.alerts || []);
      setCorrelations(marketRes.correlations || []);
      setLastUpdated(marketRes.updatedAt || new Date().toISOString());
      setInsight(aiRes.data || null);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setIsLoading(false);
      setIsRangeLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false, "1M");
  }, []);

  const handleRangeChange = (newRange: string) => {
    if (newRange === range || isRangeLoading) return;
    setRange(newRange);
    fetchData(false, newRange);
  };

  const filteredAssets = useMemo(() => {
    if (selectedCategory === "all") return assets;
    return assets.filter((asset) => asset.category === selectedCategory);
  }, [assets, selectedCategory]);

  // Chỉ đưa vào biểu đồ những tài sản có số liệu thật (không đưa tài sản tạm ngừng)
  const availableAssets = useMemo(() => assets.filter((a) => !a.unavailable && a.value !== null), [assets]);

  const visibleAssets = useMemo(() => {
    return availableAssets.filter((asset) => selected.includes(asset.id));
  }, [availableAssets, selected]);

  const toggleSelect = (id: string) => {
    setSelected((current) => {
      if (current.includes(id)) {
        return current.length === 1 ? current : current.filter((item) => item !== id);
      }
      return [...current, id];
    });
  };

  return (
    <main>
      {/* Top Header Bar */}
      <header className="header">
        <div className="brand">
          <p className="eyebrow">signalInvest · Dữ Liệu Thị Trường Trực Tiếp</p>
          <h1>Bản Đồ Thị Trường & Chiến Lược Đầu Tư</h1>
          <p className="sub">
            Theo dõi dữ liệu thực tế từ các sàn giao dịch tài chính (Binance, Yahoo Finance, HOSE/VNDIRECT, SBV). Tự động nạp lại dữ liệu nến và hiệu suất theo từng khung thời gian.
          </p>
        </div>

        <div className="header-actions">
          <div className="update-status">
            <span className="pulse-indicator" aria-hidden="true"></span>
            <span className="update-time">
              {lastUpdated
                ? `Cập nhật: ${new Date(lastUpdated).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
                : "Đang nạp dữ liệu..."}
            </span>
          </div>

          <button
            className={`btn-refresh ${isLoading ? "loading" : ""}`}
            onClick={() => fetchData(true, range)}
            disabled={isLoading || isRangeLoading}
            aria-label="Cập nhật dữ liệu thị trường và chiến lược AI"
          >
            {isLoading ? "Đang đồng bộ..." : "⟳ Cập nhật ngay"}
          </button>
        </div>
      </header>

      {error ? (
        <div className="alert-box danger" role="alert">
          <strong>Không thể kết nối đến máy chủ dữ liệu thị trường.</strong>
          <p>Hệ thống không sử dụng dữ liệu giả. Vui lòng kiểm tra kết nối mạng và bấm "Cập nhật ngay" để thử lại.</p>
        </div>
      ) : (
        <>
          {/* Market Alerts Banner */}
          {alerts.length > 0 && (
            <section className="alerts-section" aria-label="Cảnh báo thị trường và nguồn dữ liệu">
              <div className="alerts-container">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`alert-badge ${alert.level}`}>
                    <span className="alert-icon">
                      {alert.level === "danger" ? "🚨" : alert.level === "warning" ? "⚡" : "ℹ️"}
                    </span>
                    <div className="alert-text">
                      <strong>{alert.title}: </strong>
                      <span>{alert.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Asset Category Filters & Range Controls */}
          <section className="controls-bar" aria-label="Bộ điều khiển danh mục và khung thời gian">
            <div className="category-chips" role="tablist" aria-label="Phân loại tài sản">
              {(Object.keys(categoryLabels) as (AssetCategory | "all")[]).map((cat) => (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={selectedCategory === cat}
                  className={`chip ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {categoryLabels[cat]}
                </button>
              ))}
            </div>

            <div className="range-controls" aria-label="Khung thời gian biểu đồ">
              <span className="label-text">
                Khung thời gian: {isRangeLoading && <span className="loading-spinner">Đang tải...</span>}
              </span>
              <div className="btn-group">
                {ranges.map((item) => (
                  <button
                    key={item}
                    className={`btn-range ${range === item ? "active" : ""}`}
                    onClick={() => handleRangeChange(item)}
                    disabled={isRangeLoading}
                    title={`Xem dữ liệu theo ${rangeNames[item]}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Asset Cards Grid */}
          <section className="cards-grid" aria-label="Danh sách tài sản giá trị theo dõi">
            {filteredAssets.map((asset) => {
              const isSelected = selected.includes(asset.id);

              // Nếu tài sản chưa có API thật -> Hiển thị thẻ thông báo rõ ràng, không hiển thị số liệu giả làm rối mắt
              if (asset.unavailable || asset.value === null) {
                return (
                  <article key={asset.id} className="asset-card card-unavailable" aria-label={`Tài sản ${asset.name} tạm ngừng hiển thị`}>
                    <div className="card-top">
                      <div>
                        <span className="asset-symbol">{asset.symbol}</span>
                        <h3 className="asset-name">{asset.name}</h3>
                      </div>
                      <span className="status-badge unavailable">Chưa có API thật</span>
                    </div>

                    <div className="unavailable-body">
                      <p className="unavailable-text">⚠️ {asset.unavailableReason || "Chưa có kết nối API dữ liệu trực tiếp."}</p>
                      <small className="unavailable-sub">Hệ thống tuân thủ nguyên tắc không hiển thị số liệu mô phỏng.</small>
                    </div>

                    <footer className="card-meta">
                      <span className="meta-time">Trạng thái: Tạm ẩn</span>
                      <a
                        href={asset.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="meta-source"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {asset.source} ↗
                      </a>
                    </footer>
                  </article>
                );
              }

              return (
                <article
                  key={asset.id}
                  className={`asset-card ${isSelected ? "selected-card" : ""}`}
                  onClick={() => toggleSelect(asset.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleSelect(asset.id);
                    }
                  }}
                  aria-label={`Tài sản ${asset.name} giá ${asset.value} ${asset.unit}`}
                >
                  <div className="card-top">
                    <div>
                      <span className="asset-symbol">{asset.symbol}</span>
                      <h3 className="asset-name">{asset.name}</h3>
                    </div>
                    <span className={`status-badge ${asset.freshness}`} title={`Trạng thái: ${freshnessLabels[asset.freshness]}`}>
                      {freshnessLabels[asset.freshness] || asset.freshness}
                    </span>
                  </div>

                  <div className="card-price-row">
                    <span className="price-val">
                      {moneyFormat.format(asset.value)} <small className="unit-label">{asset.unit}</small>
                    </span>
                    {asset.changePercent !== null && (
                      <span className={`change-pill ${asset.changePercent >= 0 ? "up" : "down"}`} title={`Hiệu suất trong kỳ ${range}`}>
                        {asset.changePercent >= 0 ? "▲ +" : "▼ "}
                        {Math.abs(asset.changePercent).toFixed(2)}% ({range})
                      </span>
                    )}
                  </div>

                  <div className="mini-chart" aria-hidden="true">
                    {asset.series.slice(-10).map((val, idx) => {
                      const min = Math.min(...asset.series);
                      const max = Math.max(...asset.series);
                      const heightPercent = max === min ? 50 : Math.max(15, Math.round(((val - min) / (max - min)) * 85));
                      return <span key={idx} className="bar" style={{ height: `${heightPercent}%` }} />;
                    })}
                  </div>

                  <footer className="card-meta">
                    <span className="meta-time">
                      {new Date(asset.observedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <a
                      href={asset.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="meta-source"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {asset.source} ↗
                    </a>
                  </footer>
                </article>
              );
            })}
          </section>

          {/* Normalised Comparative Chart Section */}
          <section className="chart-section" aria-label="Biểu đồ so sánh hiệu suất chuẩn hoá">
            <div className="chart-header">
              <div>
                <p className="eyebrow">Dữ liệu thị trường thật theo {rangeNames[range]}</p>
                <h2>Hiệu Suất Chuẩn Hóa (% Biến Động Kỳ {range})</h2>
                <p className="sub">
                  Đưa điểm bắt đầu của chuỗi dữ liệu thật về mốc 0% để so sánh tỷ suất sinh lời thực tế giữa các lớp tài sản trong khung thời gian <strong>{rangeNames[range]}</strong>.
                </p>
              </div>

              <div className="asset-toggle-list" aria-label="Chọn tài sản đưa vào biểu đồ">
                {availableAssets.map((asset) => (
                  <label key={asset.id} className="toggle-label">
                    <input
                      type="checkbox"
                      checked={selected.includes(asset.id)}
                      onChange={() => toggleSelect(asset.id)}
                    />
                    <span>{asset.symbol}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="chart-wrapper">
              <div className="chart-rows" role="img" aria-label={`Biểu đồ hiệu suất các tài sản đã chọn trong kỳ ${range}`}>
                {visibleAssets.map((asset) => {
                  const normalized = normalizePerformance(asset.series);
                  const latestPerf = normalized[normalized.length - 1]?.value || 0;
                  return (
                    <div key={asset.id} className="chart-row">
                      <div className="chart-symbol">
                        <strong>{asset.symbol}</strong>
                        <small>{asset.name}</small>
                      </div>

                      <div className="chart-bars-track">
                        <div className="zero-line" title="Mốc tham chiếu 0%" />
                        {normalized.map((point) => {
                          const isPositive = point.value >= 0;
                          const heightPx = Math.min(48, Math.abs(point.value) * 12 + 6);
                          return (
                            <div key={point.index} className="bar-item">
                              <span
                                className={`bar-fill ${isPositive ? "bar-up" : "bar-down"}`}
                                style={{ height: `${heightPx}px` }}
                                title={`Điểm ${point.index + 1}/${normalized.length}: ${point.value >= 0 ? "+" : ""}${point.value}%`}
                              />
                            </div>
                          );
                        })}
                      </div>

                      <div className={`chart-perf ${latestPerf >= 0 ? "up" : "down"}`}>
                        {latestPerf >= 0 ? "+" : ""}
                        {latestPerf.toFixed(2)}%
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="sr-only">
                Dữ liệu thay thế cho biểu đồ ({range}):{" "}
                {visibleAssets.map((a) => `${a.symbol}: ${a.changePercent}%`).join(", ")}
              </p>
            </div>
          </section>

          {/* AI Strategic Intelligence Section */}
          {insight && (
            <section className="ai-strategy-hub" aria-label="Trung tâm nhận định chiến lược AI">
              <div className="ai-header">
                <div>
                  <div className="ai-badge">
                    <span>✨ Phân Tích Chiến Lược AI</span>
                    <span className="confidence-tag">Độ tin cậy: {insight.confidence}</span>
                  </div>
                  <h2>{insight.title}</h2>
                </div>
                <span className="ai-timestamp">
                  Khởi tạo: {new Date(insight.generatedAt).toLocaleString("vi-VN")}
                </span>
              </div>

              {insight.macroOverview && (
                <div className="macro-box">
                  <strong>🌐 Tổng quan bối cảnh kinh tế vĩ mô:</strong>
                  <p>{insight.macroOverview}</p>
                </div>
              )}

              <p className="ai-summary-text">{insight.summary}</p>

              {/* 3 Strategic Scenarios */}
              {insight.scenarios && insight.scenarios.length > 0 && (
                <div className="scenarios-container">
                  <h3 className="section-subtitle">3 Kịch Bản Chiến Lược Phân Bổ (Dựa trên dữ liệu thực tế)</h3>
                  <div className="scenarios-grid">
                    {insight.scenarios.map((scen) => (
                      <article key={scen.id} className="scenario-card">
                        <div className="scenario-header">
                          <span className="scenario-bias">{scen.actionBias}</span>
                          <span className="scenario-prob">{scen.probability}% Xác suất</span>
                        </div>
                        <h4>{scen.name}</h4>
                        <p>{scen.description}</p>
                        <div className="drivers-list">
                          <small>Động lực cốt lõi:</small>
                          <ul>
                            {scen.keyDrivers.map((driver, idx) => (
                              <li key={idx}>{driver}</li>
                            ))}
                          </ul>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {/* Các mã chứng khoán nên đầu tư */}
              {insight.recommendedStocks && insight.recommendedStocks.length > 0 && (
                <div className="stock-picks-container">
                  <div className="section-title-badge">
                    <h3 className="section-subtitle">🏆 Các Mã Chứng Khoán Tiềm Năng Đầu Tư (Chiến lược Cơ bản)</h3>
                    <span className="source-note">Dữ liệu giá khớp lệnh thực tế từ HOSE / VNDIRECT</span>
                  </div>
                  <div className="stocks-grid">
                    {insight.recommendedStocks.map((stock) => (
                      <article key={stock.symbol} className="stock-card highlight-invest">
                        <div className="stock-card-top">
                          <div>
                            <span className="stock-symbol">{stock.symbol}</span>
                            <h4 className="stock-name">{stock.name}</h4>
                            <span className="stock-sector">{stock.sector}</span>
                          </div>
                          <div className="stock-price-box">
                            <span className="stock-price">
                              {stock.price ? `${stock.price.toFixed(1)}k` : "--"}
                            </span>
                            {stock.changePercent !== null && (
                              <span className={`stock-chg ${stock.changePercent >= 0 ? "up" : "down"}`}>
                                {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent}%
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="stock-thesis">
                          <p><strong>Luận điểm đầu tư:</strong> {stock.thesis}</p>
                        </div>

                        <div className="stock-catalyst">
                          <small><strong>Xung lực phát triển:</strong> {stock.catalyst}</small>
                        </div>

                        <div className="stock-footer">
                          <span className="stock-horizon">⏱️ Kỳ hạn: {stock.horizon}</span>
                          <span className={`risk-badge ${stock.riskLevel === "Thấp" ? "risk-low" : "risk-med"}`}>
                            Rủi ro: {stock.riskLevel}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {/* Các mã chứng khoán nên theo dõi */}
              {insight.watchlistStocks && insight.watchlistStocks.length > 0 && (
                <div className="stock-picks-container">
                  <div className="section-title-badge">
                    <h3 className="section-subtitle">👀 Các Mã Chứng Khoán Cần Theo Dõi (Catalyst Watchlist)</h3>
                    <span className="source-note">Tín hiệu dòng tiền & Sự kiện tái cấu trúc</span>
                  </div>
                  <div className="stocks-grid">
                    {insight.watchlistStocks.map((stock) => (
                      <article key={stock.symbol} className="stock-card highlight-watch">
                        <div className="stock-card-top">
                          <div>
                            <span className="stock-symbol">{stock.symbol}</span>
                            <h4 className="stock-name">{stock.name}</h4>
                            <span className="stock-sector">{stock.sector}</span>
                          </div>
                          <div className="stock-price-box">
                            <span className="stock-price">
                              {stock.price ? `${stock.price.toFixed(1)}k` : "--"}
                            </span>
                            {stock.changePercent !== null && (
                              <span className={`stock-chg ${stock.changePercent >= 0 ? "up" : "down"}`}>
                                {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent}%
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="stock-thesis">
                          <p><strong>Cơ sở theo dõi:</strong> {stock.thesis}</p>
                        </div>

                        <div className="stock-catalyst">
                          <small><strong>Biến số cần quan sát:</strong> {stock.catalyst}</small>
                        </div>

                        <div className="stock-footer">
                          <span className="stock-horizon">⏱️ Khung theo dõi: {stock.horizon}</span>
                          <span className="risk-badge risk-med">
                            Rủi ro: {stock.riskLevel}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {/* Asset Correlations Matrix */}
              {correlations.length > 0 && (
                <div className="correlations-container">
                  <h3 className="section-subtitle">Ma Trận Tương Quan Các Lớp Tài Sản Thực Tế ({range})</h3>
                  <div className="correlations-grid">
                    {correlations.map((corr, idx) => (
                      <div key={idx} className="correlation-item">
                        <div className="corr-pair">
                          <span>{corr.assetA}</span>
                          <span className="corr-divider">⟷</span>
                          <span>{corr.assetB}</span>
                        </div>
                        <div className="corr-coef-badge">
                          Hệ số: <strong>{corr.coefficient >= 0 ? `+${corr.coefficient}` : corr.coefficient}</strong>
                        </div>
                        <p className="corr-desc">{corr.interpretation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Citations & Disclaimers */}
              <div className="ai-footer-info">
                <div className="citations-list">
                  <strong>Nguồn dữ liệu & Căn cứ kiểm chứng:</strong>
                  <div className="citation-links">
                    {insight.citations.map((c, i) => (
                      <a key={i} href={c.url} target="_blank" rel="noopener noreferrer" className="citation-pill">
                        🔗 {c.label}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="limitations-box">
                  <small>
                    <strong>Giới hạn mô hình:</strong> {insight.limitations}
                  </small>
                </div>
              </div>
            </section>
          )}

          {/* Legal Compliance Footer */}
          <footer className="footer-legal">
            <p>
              <strong>Tuyên bố miễn trừ trách nhiệm pháp lý:</strong> Toàn bộ thông tin, dữ liệu giá và báo cáo nhận định AI trên
              signalInvest chỉ phục vụ mục đích nghiên cứu, đối chiếu và giáo dục thông tin thị trường. Đây không phải là lời
              khuyên đầu tư tài chính, không cấu thành khuyến nghị mua/bán hay phân bổ tài sản cá nhân. Nhà đầu tư tự chịu
              hoàn toàn trách nhiệm đối với các quyết định giao dịch và phân bổ vốn của mình.
            </p>
          </footer>
        </>
      )}
    </main>
  );
}
