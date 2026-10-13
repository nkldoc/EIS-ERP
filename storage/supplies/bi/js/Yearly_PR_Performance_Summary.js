/* RepRepBIPrType6.js — fixed */

(function () {
  const getDark = () => localStorage.getItem("demoDarkMode_v2") === "on";
  const setDark = (on) => {
    document.body.classList.toggle("dark-mode", !!on);
    localStorage.setItem("demoDarkMode_v2", on ? "on" : "off");
  };

  window.DATA_BUDGET = window.DATA_BUDGET || [];
  let chartBar;
  let zrClickHandler = null; // เก็บ handler ระดับ zrender ไว้ถอดออกก่อน bind ใหม่

  function loadAll(params = {}) {
    $.ajax({
          url: "../api/List_Rep_Yearly_PR_Performance_Summary.php",
          method: "GET", 
          data: { fn: "List_QueryParam", ...params },
          dataType: "text",
          success: function (responseText) {
            const o = JSON.parse(responseText || "{}");
            window.DATA_BUDGET = Array.isArray(o.data) ? o.data : [];

            renderBar(window.DATA_BUDGET);

            const pl = document.getElementById("pageLoader");
            if (pl) pl.style.display = "none";
          },
          error: function () {
            const pl = document.getElementById("pageLoader");
            if (pl) pl.style.display = "none";
            alert("ดึงข้อมูลไม่สำเร็จ");
          },
        });
  }

  /* ---------- กราฟหลัก ---------- */
  // ปีงบที่ให้คลิกดูรายละเอียดได้ (Rep_DetailByTypeV7)
  const DRILLDOWN_YEAR = 2569;
  // ปีเริ่มต้นที่แสดงในกราฟแนวโน้ม (ตัดปีก่อนหน้านี้ทิ้ง เช่น 2566)
  const TREND_START_YEAR = 2567;

  // สไตล์เส้นแต่ละปี — เน้นปีงบปัจจุบัน (2569) ให้เด่น ปีอื่นจางลงเพื่อให้อ่านง่าย
  const YEAR_STYLES = {
    2567: { color: "#9aa5b1", width: 1.5, opacity: 0.55, type: "dashed", symbol: 4 },
    2568: { color: "#f0a020", width: 2, opacity: 0.85, type: "solid", symbol: 5 },
    2569: { color: "#1f6feb", width: 4, opacity: 1, type: "solid", symbol: 9 },
    2570: { color: "#2fb344", width: 2, opacity: 0.85, type: "solid", symbol: 5 },
  };
  const DEFAULT_YEAR_STYLE = { color: "#748ffc", width: 2, opacity: 0.8, type: "solid", symbol: 5 };

  function mapFiscalToDoc(fiscalYear, fiscalMonth) {
    let docYear, docMonth;
    if (fiscalMonth >= 1 && fiscalMonth <= 3) {
      docYear = fiscalYear - 1; // ต.ค.–ธ.ค. อยู่ปีที่แล้ว
      docMonth = fiscalMonth + 9; // 1→10, 2→11, 3→12
    } else {
      docYear = fiscalYear; // ม.ค.–ก.ย. อยู่ปีเดียวกับปีงบ
      docMonth = fiscalMonth - 3; // 4→1, 5→2, ..., 12→9
    }
    return { docYear, docMonth };
  }

  // เปิดหน้ารายละเอียด PR ตามปีงบ + เดือนงบ (1 = ตุลาคม … 12 = กันยายน)
  function openDetail(fiscalYear, fiscalMonth) {
    fiscalYear = Number(fiscalYear);
    if (!fiscalYear || !(fiscalMonth >= 1 && fiscalMonth <= 12)) return;
    const yearEn = fiscalYear - 543;
    const { docYear, docMonth } = mapFiscalToDoc(fiscalYear, fiscalMonth);
    const url =
      `/supplies/bi/reports/Rep_DetailByTypeV7.php?year=${docYear}&yearEn=${yearEn}` +
      `&monthbg=${fiscalMonth}&month=${docMonth}` +
      `&dc_expense_budget_type_id=0&bg_expense_id=0&Performance_Summary=1`;
    window.open(url, "_blank");
  }

  function renderBar(itemsRaw) {
    if (!chartBar) {
      chartBar = echarts.init(document.getElementById("bar_bg"));
    } else {
      chartBar.clear();
    }

    const barEl = document.getElementById("bar_bg");
    if (barEl) barEl.style.cursor = "pointer";

    // 1) ดึงข้อมูลจาก global / parameter
    const rows = itemsRaw || window.DATA_BUDGET || [];

    if (!rows.length) {
      chartBar.setOption({});
      return;
    }

    // 2) header เดือนตรงกับ month_no 1–12
    const monthHeader = ["product", "ตุลาคม", "พฤศจิกายน", "ธันวาคม", "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน"];

    // 3) จัดกลุ่มตามปี → จำนวน PR รายเดือน
    //    total_pr มาจาก API เป็น "ยอดรายเดือน" ที่นับด้วยเงื่อนไขเดียวกับหน้า detail แล้ว จึงใช้ตรง ๆ
    const byYear = {};
    rows.forEach((r) => {
      const year = String(r.year_th);
      const m = parseInt(r.month_no, 10); // 1-12
      if (!year || isNaN(m) || m < 1 || m > 12) return;

      if (!byYear[year]) byYear[year] = new Array(12).fill(0);
      byYear[year][m - 1] = Number(r.total_pr ?? 0) || 0;
    });

    // 4) เรียงปี + ตัดปีก่อน TREND_START_YEAR ทิ้ง (เช่น 2566) เหลือ 2567–2570
    const years = Object.keys(byYear)
      .filter((y) => Number(y) >= TREND_START_YEAR)
      .sort();

    // 5) ชื่อเดือนสำหรับแกน X (ตัด "product" ออก)
    const monthNames = monthHeader.slice(1);

    // 6) Dynamic Colors based on Dark Mode
    const isDark = getDark();
    const textColor = isDark ? "#e9ecef" : "#212529";
    const subTextColor = isDark ? "#adb5bd" : "#6c757d";
    const splitLineColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
    const tooltipBg = isDark ? "rgba(40, 44, 52, 0.95)" : "rgba(255, 255, 255, 0.96)";
    const tooltipBorder = isDark ? "#495057" : "#dee2e6";

    // 7) series config — กราฟแท่งแนวตั้ง จำนวน PR รายเดือน จัดกลุ่มตามเดือน เน้นปีงบปัจจุบัน (2569)
    const series = years.map((y) => {
      const st = YEAR_STYLES[Number(y)] || DEFAULT_YEAR_STYLE;
      const isCurrent = Number(y) === DRILLDOWN_YEAR;
      return {
        name: String(y),
        type: "bar",
        data: byYear[y], // จำนวน PR รายเดือน 12 เดือน (ต.ค.–ก.ย.)
        barMaxWidth: 26,
        barGap: "10%",
        barCategoryGap: "35%",
        itemStyle: {
          color: st.color,
          opacity: isCurrent ? 1 : 0.55,
          borderRadius: [3, 3, 0, 0],
        },
        emphasis: { focus: "series", itemStyle: { opacity: 1 } },
        label: {
          show: true,
          position: "top",
          fontSize: 9,
          fontWeight: isCurrent ? "bold" : "normal",
          color: textColor,
          formatter: (p) => (p.value ? Number(p.value).toLocaleString("th-TH") : ""),
        },
        z: isCurrent ? 10 : 2,
      };
    });

    const option = {
      backgroundColor: "transparent",
      color: years.map((y) => (YEAR_STYLES[Number(y)] || DEFAULT_YEAR_STYLE).color),
      title: {
        text: `จำนวนใบขอซื้อ/จ้าง (PR) รายเดือน`,
        subtext: `คลิกที่แท่งกราฟ = ดูรายละเอียด PR ของปีนั้น | คลิกชื่อเดือน = ปีงบ ${DRILLDOWN_YEAR}`,
        left: "center",
        top: 0,
        textStyle: { fontSize: 14, fontWeight: "bold", color: textColor },
        subtextStyle: { fontSize: 12, color: subTextColor },
      },
      legend: {
        top: 46,
        textStyle: { color: textColor },
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        textStyle: { color: textColor },
        valueFormatter: (v) => (v == null || v === "" ? "-" : Number(v).toLocaleString("th-TH") + " รายการ"),
        axisPointer: { type: "shadow" },
      },
      grid: [{ top: 95, bottom: 40, left: 16, right: 24, containLabel: true }],
      xAxis: {
        type: "category",
        data: monthNames,
        triggerEvent: true,
        axisLabel: { color: textColor, interval: 0 },
        axisTick: { alignWithLabel: true },
      },
      yAxis: {
        gridIndex: 0,
        name: "จำนวน PR (รายการ/เดือน)",
        nameTextStyle: { color: subTextColor, align: "left" },
        axisLabel: { color: textColor, formatter: (v) => Number(v).toLocaleString("th-TH") },
        splitLine: { lineStyle: { color: splitLineColor } },
      },
      labelLayout: { hideOverlap: true },
      series,
    };

    chartBar.setOption(option);

    // --- คลิกที่แท่งกราฟ → ดูรายละเอียดของ "ปีนั้น" เดือนนั้น ; คลิกชื่อเดือน → ปีงบ DRILLDOWN_YEAR ---
    chartBar.off("click");
    chartBar.on("click", function (params) {
      if (params.componentType === "series") {
        openDetail(params.seriesName, params.dataIndex + 1); // dataIndex 0–11 → เดือนงบ 1–12
      } else if (params.componentType === "xAxis") {
        const idx = monthNames.indexOf(String(params.value));
        if (idx >= 0) openDetail(DRILLDOWN_YEAR, idx + 1);
      }
    });

    // --- คลิกที่ไหนก็ได้ในพื้นที่กราฟ → หาเดือนจากตำแหน่ง x แล้วเปิดรายละเอียด ---
    const zr = chartBar.getZr();
    if (zrClickHandler) zr.off("click", zrClickHandler); // ถอด handler เดิม กันซ้ำเมื่อ render ใหม่
    zrClickHandler = function (ev) {
      // ปล่อยให้ handler ของ series/axis label จัดการเอง
      if (ev.target) return;
      const pt = [ev.offsetX, ev.offsetY];
      if (!chartBar.containPixel({ gridIndex: 0 }, pt)) return;
      const catIdx = chartBar.convertFromPixel({ xAxisIndex: 0 }, ev.offsetX);
      openDetail(DRILLDOWN_YEAR, Math.round(catIdx) + 1);
    };
    zr.on("click", zrClickHandler);

    renderTable(window.DATA_BUDGET);
  }

  function renderTable(itemsRaw) {
    /* ... (renderTable implementation remains same, assumes styled by CSS) ... */
    /* Re-including renderTable implementation here to prevent cut-off if I use replace block carelessly */
    const rows = itemsRaw || [];
    const tableBody = document.getElementById("tableBody");
    if (!tableBody) return;

    if (!rows.length) {
      tableBody.innerHTML = '<tr><td colspan="14" class="text-center">ไม่พบข้อมูล</td></tr>';
      return;
    }

    // Group by Year and sort data by month for correct decumulation
    const byYearCumulative = {};
    const years = new Set();

    rows.forEach((r) => {
      const y = String(r.year_th);
      const m = parseInt(r.month_no, 10);
      if (!y || isNaN(m)) return;

      years.add(y);
      if (!byYearCumulative[y]) byYearCumulative[y] = new Array(13).fill(0);

      byYearCumulative[y][m] = Number(r.cumulative_total ?? 0);
    });

    const sortedYears = Array.from(years).sort().slice(-5);
    const byYearMonthly = {}; // Calculate Discrete Monthly Data

    sortedYears.forEach((year) => {
      byYearMonthly[year] = new Array(13).fill(0);
      for (let m = 1; m <= 12; m++) {
        const curCum = byYearCumulative[year][m];
        const prevCum = byYearCumulative[year][m - 1] || 0;
        if (curCum > 0) {
          byYearMonthly[year][m] = curCum - prevCum;
        } else {
          byYearMonthly[year][m] = 0;
        }
      }
    });

    let html = "";
    sortedYears.forEach((year, index) => {
      const prevYear = (parseInt(year) - 1).toString();
      const hasPrevYear = byYearMonthly[prevYear];

      let rowHtml = `<tr><td class="font-weight-bold" style="vertical-align: middle;">${year}</td>`;
      let totalYear = 0;

      for (let m = 1; m <= 12; m++) {
        const val = byYearMonthly[year][m];
        totalYear += val;
        let cellContent = val > 0 ? val.toLocaleString() : "-";
        let growthHtml = "";
        if (hasPrevYear && byYearMonthly[prevYear][m] > 0 && val > 0) {
          const prevVal = byYearMonthly[prevYear][m];
          const growth = ((val - prevVal) / prevVal) * 100;
          const colorClass = growth >= 0 ? "text-success" : "text-danger";
          const icon = growth >= 0 ? "▲" : "▼";
          growthHtml = `<br><span class="${colorClass}" style="font-size: 0.7rem; font-weight: bold;">${icon} ${Math.abs(growth).toFixed(1)}%</span>`;
        }
        rowHtml += `<td style="vertical-align: middle;">${cellContent}${growthHtml}</td>`;
      }
      rowHtml += `<td class="font-weight-bold bg-light" style="vertical-align: middle;">${totalYear.toLocaleString()}</td></tr>`;
      html += rowHtml;
    });
    tableBody.innerHTML = html;
  }

  /* ---------- DOM Ready ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    // restore dark mode
    setDark(getDark());
    const darkToggle = document.getElementById("darkToggle");
    if (darkToggle) {
      darkToggle.checked = getDark();
      darkToggle.addEventListener("change", (e) => {
        setDark(e.target.checked);
        // Re-render chart to apply dark theme colors
        renderBar(window.DATA_BUDGET);
      });
    }

    // โหลดข้อมูลตามปี
    loadAll();
  });
})();
