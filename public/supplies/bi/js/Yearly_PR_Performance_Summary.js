/* RepRepBIPrType6.js — fixed */

(function () {
  const getDark = () => localStorage.getItem("demoDarkMode_v2") === "on";
  const setDark = (on) => {
    document.body.classList.toggle("dark-mode", !!on);
    localStorage.setItem("demoDarkMode_v2", on ? "on" : "off");
  };

  window.DATA_BUDGET = window.DATA_BUDGET || [];
  let chartBar;

  function loadAll(params = {}) {
    Ext.Ajax.request({
      url: "../api/List_Rep_Yearly_PR_Performance_Summary.php",
      method: "GET",
      params: { fn: "List_QueryParam", ...params },
      success: function (resp) {
        const o = Ext.decode(resp.responseText || "{}");
        window.DATA_BUDGET = Array.isArray(o.data) ? o.data : [];

        renderBar(window.DATA_BUDGET);

        const pl = document.getElementById("pageLoader");
        if (pl) pl.style.display = "none";
      },
      failure: function () {
        const pl = document.getElementById("pageLoader");
        if (pl) pl.style.display = "none";
        Ext.Msg.alert("Error", "ดึงข้อมูลไม่สำเร็จ");
      },
    });
  }

  /* ---------- กราฟหลัก ---------- */
  /* ---------- กราฟหลัก ---------- */
  function renderBar(itemsRaw) {
    if (!chartBar) {
      chartBar = echarts.init(document.getElementById("bar_bg"));
    } else {
      chartBar.clear();
    }

    // 1) ดึงข้อมูลจาก global / parameter
    const rows = itemsRaw || window.DATA_BUDGET || [];

    if (!rows.length) {
      chartBar.setOption({});
      return;
    }

    // 2) header เดือนตรงกับ month_no 1–12
    const monthHeader = ["product", "ตุลาคม", "พฤศจิกายน", "ธันวาคม", "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน"];

    // 3) จัดกลุ่มตามปี + map เดือน → ค่ายอดสะสม
    const byYear = {}; // { "2565": [12 ค่า], ... }

    rows.forEach((r) => {
      const year = String(r.year_th);
      const m = parseInt(r.month_no, 10); // 1-12
      if (!year || isNaN(m) || m < 1 || m > 12) return;

      if (!byYear[year]) {
        byYear[year] = new Array(12).fill(0);
      }

      // ใช้ cumulative_total เป็นค่าที่ plot
      const val = Number(r.cumulative_total ?? r.total_pr ?? 0) || 0;
      byYear[year][m - 1] = val;
    });

    // 4) เรียงปี + เอาแค่ 5 ปีล่าสุด
    const years = Object.keys(byYear).sort(); // 2565,2566,...
    const last5Years = years.slice(-5);

    // 5) เตรียม dataset.source
    const source = [monthHeader];
    last5Years.forEach((y) => {
      source.push([y, ...byYear[y]]);
    });

    // 6) series config ตามจำนวนปี
    const series = last5Years.map(() => ({
      type: "line",
      smooth: true,
      symbolSize: 10,
      lineStyle: {
        width: 4,
        shadowColor: "rgba(0,0,0,0.3)",
        shadowBlur: 10,
        shadowOffsetY: 5,
      },
      emphasis: {
        focus: "series",
        scale: true,
      },
      seriesLayoutBy: "row",
    }));

    // 6.2) Dynamic Colors based on Dark Mode
    const isDark = getDark();
    const textColor = isDark ? "#e9ecef" : "#000";
    const tooltipBg = isDark ? "rgba(50, 50, 50, 0.9)" : "rgba(255, 255, 255, 0.9)";
    const tooltipBorder = isDark ? "#dee2e6" : "#333";

    const option = {
      backgroundColor: "transparent",
      legend: {
        textStyle: { color: textColor },
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        textStyle: { color: textColor },
        axisPointer: {
          type: "cross",
          label: { backgroundColor: "#6a7985" },
        },
      },
      dataset: { source },
      grid: [{ top: "25%", bottom: "15%" }],
      xAxis: {
        type: "category",
        gridIndex: 0,
        axisLabel: { color: textColor },
      },
      yAxis: {
        gridIndex: 0,
        axisLabel: { color: textColor },
      },
      label: {
        show: true,
        position: "top",
        fontSize: 12,
        color: textColor,
      },
      series,
      labelLayout: { hideOverlap: true },
    };

    chartBar.setOption(option);
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

    chartBar.off("click"); // เคลียร์ event เดิมเผื่อมีค้าง
    chartBar.on("click", function (params) {
      if (String(params.seriesName) !== "2569") {
        return;
      }
      const year = params.seriesName;
      const yearEn = params.seriesName - 543;
      const monthIndex = params.dataIndex + 1; // 1–12
      const monthName = params.name;
      const { docYear, docMonth } = mapFiscalToDoc(year, monthIndex);

      console.log(yearEn);
      // URL ที่คุณต้องการเปิดหน้าใหม่
      const url =
        `/supplies/bi/reports/Rep_DetailByTypeV7.php?year=${docYear}&yearEn=${yearEn}&monthbg=${monthIndex}&month=${docMonth}` + `&dc_expense_budget_type_id=0&bg_expense_id=0&Performance_Summary=1  `;
      +`&month_name=${encodeURIComponent(monthName)}`;

      window.open(url, "_blank");
    });
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
