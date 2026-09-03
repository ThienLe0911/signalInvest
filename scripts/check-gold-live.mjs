/**
 * Script kiểm tra trực tiếp giá vàng SJC và Vàng quốc tế từ các nguồn API thực tế
 * Chạy lệnh: node scripts/check-gold-live.mjs
 */

async function main() {
  console.log("================================================================================");
  console.log("🔍 ĐANG TRUY XUẤT DỮ LIỆU GIÁ VÀNG TRỰC TIẾP TỪ CÁC NGUỒN THỰC TẾ...");
  console.log("================================================================================\n");

  // 1. Lấy từ API Bảo Tín Minh Châu (BTMC)
  console.log("1️⃣  [NGUỒN 1] BẢO TÍN MINH CHÂU (api.btmc.vn):");
  try {
    const res = await fetch("https://api.btmc.vn/api/BTMCAPI/getpricebtmc?key=3kd8ub1k9Mgvg3856b8h686hn7go3", {
      signal: AbortSignal.timeout(6000)
    });
    if (res.ok) {
      const data = await res.json();
      const list = data?.DataList?.Data || [];
      let found = false;
      for (const item of list) {
        const row = item["@row"];
        const name = item[`@n_${row}`] || "";
        const buy = item[`@pb_${row}`] || "";
        const sell = item[`@ps_${row}`] || "";
        const date = item[`@d_${row}`] || "";
        if (name.toUpperCase().includes("VÀNG MIẾNG SJC")) {
          const buyM = (Number(buy) / 100_000).toFixed(1);
          const sellM = (Number(sell) / 100_000).toFixed(1);
          console.log(`   - Tên sản phẩm : ${name}`);
          console.log(`   - Thời gian    : ${date}`);
          console.log(`   - Giá MUA VÀO  : ${Number(buy).toLocaleString("vi-VN")} đ/chỉ (${buyM} triệu/lượng)`);
          console.log(`   - Giá BÁN RA   : ${Number(sell).toLocaleString("vi-VN")} đ/chỉ (${sellM} triệu/lượng)`);
          found = true;
          break;
        }
      }
      if (!found) console.log("   ⚠️ Không tìm thấy bản ghi SJC trong danh sách.");
    } else {
      console.log(`   ❌ Lỗi HTTP ${res.status}`);
    }
  } catch (err) {
    console.log(`   ❌ Lỗi kết nối BTMC: ${err.message}`);
  }

  console.log("\n--------------------------------------------------------------------------------\n");

  // 2. Lấy từ API Vang.today (tổng hợp từ SJC, DOJI, PNJ)
  console.log("2️⃣  [NGUỒN 2] BẢNG TỔNG HỢP LIÊN DOANH VÀNG (vang.today/api/prices):");
  try {
    const res = await fetch("https://www.vang.today/api/prices", { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const data = await res.json();
      const sjc = data.prices?.SJL1L10;
      const doji = data.prices?.DOHNL;
      const pnj = data.prices?.PQHNVM;
      console.log(`   - Thời gian cập nhật: ${data.date} lúc ${data.time}`);
      if (sjc) {
        console.log(`   - SJC 9999 (SJC)    : Mua ${(sjc.buy / 1_000_000).toFixed(1)} triệu | Bán ${(sjc.sell / 1_000_000).toFixed(1)} triệu/lượng`);
      }
      if (doji) {
        console.log(`   - DOJI Hà Nội       : Mua ${(doji.buy / 1_000_000).toFixed(1)} triệu | Bán ${(doji.sell / 1_000_000).toFixed(1)} triệu/lượng`);
      }
      if (pnj) {
        console.log(`   - PNJ Hà Nội        : Mua ${(pnj.buy / 1_000_000).toFixed(1)} triệu | Bán ${(pnj.sell / 1_000_000).toFixed(1)} triệu/lượng`);
      }
    } else {
      console.log(`   ❌ Lỗi HTTP ${res.status}`);
    }
  } catch (err) {
    console.log(`   ❌ Lỗi kết nối vang.today: ${err.message}`);
  }

  console.log("\n--------------------------------------------------------------------------------\n");

  // 3. Lấy từ Yahoo Finance (Vàng quốc tế XAU/USD & Tỷ giá USD/VND)
  console.log("3️⃣  [NGUỒN 3] THỊ TRƯỜNG QUỐC TẾ (Yahoo Finance COMEX & Forex):");
  try {
    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    const [goldRes, fxRes] = await Promise.all([
      fetch("https://query2.finance.yahoo.com/v8/finance/chart/GC=F?range=5d&interval=1d", {
        headers: { "User-Agent": userAgent, Accept: "application/json" }
      }).then(r => r.json()),
      fetch("https://query2.finance.yahoo.com/v8/finance/chart/USDVND=X?range=5d&interval=1d", {
        headers: { "User-Agent": userAgent, Accept: "application/json" }
      }).then(r => r.json())
    ]);

    const goldPrice = goldRes?.chart?.result?.[0]?.meta?.regularMarketPrice;
    const fxPrice = fxRes?.chart?.result?.[0]?.meta?.regularMarketPrice;

    console.log(`   - Vàng thế giới (GC=F) : ${goldPrice} USD/ounce`);
    console.log(`   - Tỷ giá USD/VND        : ${Math.round(fxPrice)} VND`);

    if (goldPrice && fxPrice) {
      // 1 ounce = 0.829426 lượng -> 1 lượng = 1.205653 ounce
      const quyDoiThuan = (goldPrice * fxPrice * 1.205653) / 1_000_000;
      console.log(`   - Giá vàng TG quy đổi   : ${quyDoiThuan.toFixed(2)} triệu VND/lượng`);
      console.log(`   - Chênh lệch SJC vs TG  : +${(147.4 - quyDoiThuan).toFixed(2)} triệu VND (Mức chênh thực tế thị trường VN)`);
    }
  } catch (err) {
    console.log(`   ❌ Lỗi: ${err.message}`);
  }

  console.log("\n================================================================================");
}

main();
