/* Budget_Monitoring_Dashboard_New.js */
/* Modern logic with click-to-popup */

(function () {
  // --- Constants & Globals ---
  window.DATA_BUDGET = [];
  let CHART_MAIN = null;
  let CHART_SIDE = null;
  let LAST_FILTERS = { year: null, sections: [], funds: [] };
  let loadInterval = null;

  const startLoading = () => {
    $("#loading-overlay").fadeIn(100);
    $("#loading-bar").css("width", "0%");
    $("#loading-pct").text("0%");

    let pct = 0;
    if (loadInterval) clearInterval(loadInterval);

    // Simulate progress: Fast to 50%, then slower to 90%
    loadInterval = setInterval(() => {
      if (pct < 50) pct += 5;
      else if (pct < 80) pct += 2;
      else if (pct < 95) pct += 0.5;

      if (pct > 95) pct = 95; // Cap at 95 until done

      const pStr = Math.floor(pct) + "%";
      $("#loading-bar").css("width", pStr);
      $("#loading-pct").text(pStr);
    }, 100);
  };

  const stopLoading = () => {
    if (loadInterval) clearInterval(loadInterval);
    $("#loading-bar").css("width", "100%");
    $("#loading-pct").text("100%");

    setTimeout(() => {
      $("#loading-overlay").fadeOut(300);
    }, 400); // Short delay to let user see 100%
  };
  const getDark = () => localStorage.getItem("budget_dark_mode") === "on";
  const setDark = (on) => {
    document.body.classList.toggle("dark-mode", !!on);
    localStorage.setItem("budget_dark_mode", on ? "on" : "off");

    // Refresh charts to update text colors (if supported by theme/config)
    // Simple way: re-call render functions if data exists
    if (window.DATA_BUDGET.length > 0) {
      // Ideally we want to just update configs, but re-render is safer
      refreshDashboard();
    }
  };

  // --- Helpers ---
  const toBaht = (n) => (Number(n) || 0).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtInt = (n) => (Number(n) || 0).toLocaleString("th-TH");

  // --- Store & Data Fetching ---
  const budgetStore = new Ext.data.JsonStore({
    url: "../api/List_Rep_Budget_Monitoring_Dashboard.php",
    root: "data",
    fields: [
      "no",
      "cost_name",
      "dc_cost_acc_id",
      "c_name",
      "bg_expense",
      "bg_expense_id",
      "dc_expense_budget_type_id",
      { name: "f_plan_begin", type: "float" },
      { name: "f_reserve_budget", type: "float" },
      { name: "f_plan_total", type: "float" },
      { name: "f_plan_used", type: "float" },
      { name: "f_plan_withdraw", type: "float" },
      { name: "f_plan_remain", type: "float" },
      { name: "f_period_total", type: "float" },
      { name: "f_period_used", type: "float" },
      { name: "f_period_withdraw", type: "float" },
      { name: "f_period_remain", type: "float" },
      "budget_year",
    ],
    listeners: {
      beforeload: () => startLoading(),
      load: (store, records) => {
        stopLoading();

        // Store raw data globally
        window.DATA_BUDGET = [];
        store.each((rec) => window.DATA_BUDGET.push(rec.data));

        // Init flow — refreshDashboard จะถูกเรียกใน initFiltersAfterLoad
        initFiltersAfterLoad();
      },
      exception: () => {
        stopLoading();
        alert("Error loading data!");
      },
    },
  });

  // --- Initialization ---
  function init() {
    // 0. Dark Mode Init
    const isDark = getDark();
    setDark(isDark);
    $("#darkToggle")
      .prop("checked", isDark)
      .on("change", (e) => setDark(e.target.checked));

    // 1. Year Select
    const now = new Date().getFullYear();
    const $year = $("#budget_year_filter");
    for (let y = now - 2; y <= now + 1; y++) {
      $year.append(new Option(`พ.ศ. ${y + 543}`, y + 543));
    }
    $year.val(now + 543);

    // 2. Initialize SelectPickers
    $("#cost_sys_main_filter").selectpicker();
    $("#fund_filter").selectpicker();
    $("#multiCheckCombo").selectpicker();

    // 3. Events through Bindings
    bindEvents();

    // 4. Initial Load
    loadData();
  }

  function loadData() {
    const yearTh = $("#budget_year_filter").val();
    const yearEn = yearTh - 543;

    budgetStore.load({
      params: {
        fn: "List_QueryParam",
        year_th: yearTh,
        year_en: yearEn,
      },
    });
  }

  function bindEvents() {
    // Refresh when year changes (re-fetch data)
    $("#budget_year_filter").on("change", loadData);

    // Refresh charts when filters change (client-side filtering)
    $("#btnRefresh").on("click", refreshDashboard);

    // Window resize
    window.addEventListener("resize", () => {
      if (CHART_MAIN) CHART_MAIN.resize();
      if (CHART_SIDE) CHART_SIDE.resize();
    });

    // Export Excel
    $("#btnExport").on("click", exportExcel);
  }

  // เรียกหลัง initFiltersAfterLoad เพื่อป้องกัน event fired ขณะ init
  function bindFilterEvents() {
    $("#cost_sys_main_filter").on("changed.bs.select", () => {
      updateFundFilter();
      refreshDashboard();
    });

    $("#fund_filter").on("changed.bs.select", () => {
      refreshDashboard();
    });

    $("#multiCheckCombo").on("changed.bs.select", () => {
      refreshDashboard();
    });
  }

  // --- Export Logic ---
  function exportExcel() {
    const rows = getFilteredData();
    if (!rows || rows.length === 0) {
      alert("ไม่มีข้อมูลสำหรับ Export");
      return;
    }

    const yearTh = $("#budget_year_filter").val() || '';
    const selectedSectionIds = $("#cost_sys_main_filter").val() || [];
    const allSectionIds = $("#cost_sys_main_filter option").map(function(){ return $(this).val(); }).get();
    const isAllSections = selectedSectionIds.length === 0 || selectedSectionIds.length === allSectionIds.length;
    const sectionLabel = isAllSections ? 'ทุกส่วนงาน' : selectedSectionIds.map(function(id){
      return $("#cost_sys_main_filter option[value='" + id + "']").text().trim() || id;
    }).join(', ');

    // Use xlsx-js-style if available, fallback to XLSX
    const X = (typeof XLSXStyle !== 'undefined') ? XLSXStyle : XLSX;

    // ─── Color palette ───────────────────────────────────────────────
    const C = {
      // header bar
      planHdr_bg:   '123A7D', planHdr_fc:  'FFFFFF',
      periodHdr_bg: '2e6da4', periodHdr_fc:'FFFFFF',
      // column headers
      colHdr_bg: '1F4E79',   colHdr_fc: 'FFFFFF',
      // sub-group bg
      planGrp_bg:'D6E4F0',   periodGrp_bg:'DDEEFF',
      // data stripes
      stripe1: 'EBF5FB', stripe2: 'FFFFFF',
      // value colors
      budget_fc: '1A3C6E',
      used_fc:   'C0392B',
      remain_fc: '1A7A4A',
      pct_fc:    '555555',
      // summary row
      sum_bg: 'F0F4FF', sum_fc: '1A3C6E',
      // section banner
      banner_bg: '123A7D', banner_fc: 'FFFFFF',
    };

    const bdr = {
      top:    { style: 'thin', color: { rgb: 'CCCCCC' } },
      bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
      left:   { style: 'thin', color: { rgb: 'CCCCCC' } },
      right:  { style: 'thin', color: { rgb: 'CCCCCC' } },
    };

    function cs(bg, fc, bold, h, sz, fmt) {
      const s = {
        fill:      { patternType: 'solid', fgColor: { rgb: bg || 'FFFFFF' } },
        font:      { bold: !!bold, sz: sz || 10, name: 'Calibri', color: { rgb: fc || '000000' } },
        alignment: { vertical: 'center', horizontal: h || 'left', wrapText: true },
        border:    bdr,
      };
      if (fmt) s.numFmt = fmt;
      return s;
    }

    const numFmt = '#,##0.00';
    const pctFmt = '0.00"%"';

    function cell(v, bg, fc, bold, h, sz, fmt) {
      const t = typeof v === 'number' ? 'n' : 's';
      return { v, t, s: cs(bg, fc, bold, h || (typeof v === 'number' ? 'right' : 'left'), sz, fmt) };
    }
    function blank(bg) { return { v: '', t: 's', s: cs(bg, null, false, 'left') }; }

    // ─── Build a sheet for one budget type ───────────────────────────
    function buildSheet(mode) {
      const isPlan   = (mode === 'plan');
      const hdrBg    = isPlan ? C.planHdr_bg   : C.periodHdr_bg;
      const hdrFc    = isPlan ? C.planHdr_fc   : C.periodHdr_fc;
      const modeName = isPlan ? 'เงินแผน' : 'เงินงวด';
      const fields   = isPlan
        ? { total: 'f_plan_total',   used: 'f_plan_used',   remain: 'f_plan_remain'   }
        : { total: 'f_period_total', used: 'f_period_used', remain: 'f_period_remain' };

      // totals
      let sumTotal = 0, sumUsed = 0, sumRemain = 0;
      rows.forEach(function(r) {
        sumTotal  += r[fields.total]  || 0;
        sumUsed   += r[fields.used]   || 0;
        sumRemain += r[fields.remain] || 0;
      });

      // NCOLS = 7: ลำดับ | รหัส[mode] | งบประมาณ | ใช้ไป/จอง | คงเหลือ | % | แหล่งเงิน
      const NCOLS = 7;

      const aoa = [];

      // Row 0: banner
      const bannerRow = [cell('ปีงบประมาณ ' + yearTh + '   |   ส่วนงาน : ' + sectionLabel + '   |   ' + modeName, hdrBg, hdrFc, true, 'center', 12)];
      for (let i = 1; i < NCOLS; i++) bannerRow.push(blank(hdrBg));
      aoa.push(bannerRow);

      // Row 1: column headers
      aoa.push([
        cell('#',                          C.colHdr_bg, C.colHdr_fc, true, 'center'),
        cell('รหัสงบประมาณ / หมวดค่าใช้จ่าย [' + modeName + ']', C.colHdr_bg, C.colHdr_fc, true, 'center'),
        cell('งบประมาณ',                   C.colHdr_bg, C.colHdr_fc, true, 'center'),
        cell('ที่ใช้ไป / จอง',             C.colHdr_bg, C.colHdr_fc, true, 'center'),
        cell('คงเหลือ',                    C.colHdr_bg, C.colHdr_fc, true, 'center'),
        cell('%',                          C.colHdr_bg, C.colHdr_fc, true, 'center'),
        cell('แหล่งเงิน',                  C.colHdr_bg, C.colHdr_fc, true, 'center'),
      ]);

      // Data rows
      rows.forEach(function(r, idx) {
        const total  = r[fields.total]  || 0;
        const used   = r[fields.used]   || 0;
        const remain = r[fields.remain] || 0;
        const pct    = total > 0 ? used / total * 100 : 0;
        const stripeBg = (idx % 2 === 0) ? C.stripe1 : C.stripe2;

        aoa.push([
          cell(idx + 1,          stripeBg, C.budget_fc, false, 'center'),
          cell(r.bg_expense || '-', stripeBg, '333333', false, 'left'),
          cell(total,            stripeBg, C.budget_fc, false, 'right', 10, numFmt),
          cell(used,             stripeBg, C.used_fc,   false, 'right', 10, numFmt),
          cell(remain < 0 ? remain : remain, stripeBg, remain < 0 ? 'C0392B' : C.remain_fc, remain < 0, 'right', 10, numFmt),
          cell(parseFloat(pct.toFixed(2)), stripeBg, C.pct_fc, false, 'center', 10, pctFmt),
          cell(r.c_name || '-',  stripeBg, '555555', false, 'left'),
        ]);
      });

      // Summary row
      const sumPct = sumTotal > 0 ? parseFloat((sumUsed / sumTotal * 100).toFixed(2)) : 0;
      aoa.push([
        blank(C.sum_bg),
        cell('รวมทั้งหมด',  C.sum_bg, C.sum_fc, true, 'right'),
        cell(sumTotal,      C.sum_bg, C.budget_fc, true, 'right', 11, numFmt),
        cell(sumUsed,       C.sum_bg, C.used_fc,   true, 'right', 11, numFmt),
        cell(sumRemain,     C.sum_bg, sumRemain < 0 ? 'C0392B' : C.remain_fc, true, 'right', 11, numFmt),
        cell(sumPct,        C.sum_bg, C.pct_fc, true, 'center', 10, pctFmt),
        blank(C.sum_bg),
      ]);

      // Build worksheet
      const ws = {};
      const maxR = aoa.length, maxC = NCOLS;
      aoa.forEach(function(row, ri) {
        row.forEach(function(cv, ci) {
          if (cv == null) return;
          ws[X.utils.encode_cell({ r: ri, c: ci })] = cv;
        });
      });
      ws['!ref']   = X.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: maxR - 1, c: maxC - 1 } });
      ws['!cols']  = [{ wch: 6 }, { wch: 52 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 10 }, { wch: 28 }];
      ws['!rows']  = [{ hpt: 28 }, { hpt: 24 }]; // banner + header taller
      ws['!freeze'] = { xSplit: 0, ySplit: 2 };

      // Merge banner across all cols
      ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: NCOLS - 1 } }];

      return ws;
    }

    const wb = X.utils.book_new();
    X.utils.book_append_sheet(wb, buildSheet('plan'),   'เงินแผน');
    X.utils.book_append_sheet(wb, buildSheet('period'), 'เงินงวด');

    X.writeFile(wb, 'Budget_Monitoring_' + yearTh + '.xlsx');
  }

  // --- Filter Logic ---
  function initFiltersAfterLoad() {
    // ปิด event listeners ชั่วคราวระหว่าง init เพื่อป้องกัน refreshDashboard ถูกเรียกซ้ำ
    $("#cost_sys_main_filter").off("changed.bs.select");
    $("#multiCheckCombo").off("changed.bs.select");
    $("#fund_filter").off("changed.bs.select");

    // 1. Fill Sections (Unique)
    const sections = new Map();
    window.DATA_BUDGET.forEach((row) => {
      if (row.dc_cost_acc_id) sections.set(String(row.dc_cost_acc_id), row.cost_name || row.dc_cost_acc_id);
    });

    const $cost = $("#cost_sys_main_filter");
    const prevCost = $cost.val();

    $cost.empty();
    sections.forEach((name, id) => $cost.append(new Option(name, id)));

    // Auto-select ALL sections on first load
    if (!prevCost || (Array.isArray(prevCost) && prevCost.length === 0)) {
      $cost.selectpicker("selectAll");
    } else {
      $cost.selectpicker("val", prevCost);
    }
    $cost.selectpicker("refresh");

    // 2. Fill Fund Sources for multiCheckCombo
    const fundSources = new Map();
    window.DATA_BUDGET.forEach((row) => {
      if (row.c_name) {
        if (row.c_name.indexOf('ภาษี') !== -1) return;
        fundSources.set(row.c_name, row.c_name);
      }
    });

    const $multi = $("#multiCheckCombo");
    $multi.empty();
    fundSources.forEach((name) => $multi.append(new Option(name, name)));
    $multi.selectpicker("refresh");
    $multi.selectpicker("selectAll");

    // 3. Fund Filter (silent)
    updateFundFilter();

    // 4. Re-bind events หลัง init เสร็จ
    bindFilterEvents();

    // 5. Render ครั้งเดียว
    refreshDashboard();
  }

  function updateFundFilter() {
    // รองรับ multi-select section
    const selectedIds = ($("#cost_sys_main_filter").val() || []).map(String);
    const $fund = $("#fund_filter");

    const validFunds = new Map();
    window.DATA_BUDGET.forEach((row) => {
      if (selectedIds.length === 0 || selectedIds.includes(String(row.dc_cost_acc_id))) {
        if (row.dc_expense_budget_type_id) {
          const name = row.c_name || "N/A";
          if (name !== "-ไม่ระบุแหล่งเงิน-" && name !== "N/A") {
            validFunds.set(String(row.dc_expense_budget_type_id), name);
          }
        }
      }
    });

    $fund.empty();
    validFunds.forEach((name, id) => $fund.append(new Option(name, id)));
    $fund.selectpicker("refresh");
    $fund.selectpicker("selectAll");
  }

  function getFilteredData() {
    // Multi-select สำหรับ Cost (ส่วนงาน)
    const costIds = ($("#cost_sys_main_filter").val() || []).map(String);
    // Multi Value for Fund
    const fundIds = ($("#fund_filter").val() || []).map(String);
    // Multi Value for Fund Sources
    const fundSourceNames = $("#multiCheckCombo").val() || [];

    return window.DATA_BUDGET.filter((row) => {
      const matchCost = costIds.length === 0 || costIds.includes(String(row.dc_cost_acc_id));
      const matchFund = fundIds.length === 0 || fundIds.includes(String(row.dc_expense_budget_type_id));
      const matchFundSource = fundSourceNames.length === 0 || fundSourceNames.includes(row.c_name);
      return matchCost && matchFund && matchFundSource;
    });
  }

  function getDataViewRows() {
    // Multi-select สำหรับ Cost (ส่วนงาน)
    const costIds = ($("#cost_sys_main_filter").val() || []).map(String);
    // Multi Value for Fund
    const fundIds = ($("#fund_filter").val() || []).map(String);
    // Multi Value for Fund Sources (keep original selection order)
    const fundSourceNames = $("#multiCheckCombo").val() || [];

    const filteredRows = window.DATA_BUDGET.filter((row) => {
      const matchCost = costIds.length === 0 || costIds.includes(String(row.dc_cost_acc_id));
      const matchFund = fundIds.length === 0 || fundIds.includes(String(row.dc_expense_budget_type_id));
      const matchFundSource = fundSourceNames.length === 0 || fundSourceNames.includes(row.c_name);
      return matchCost && matchFund && matchFundSource;
    });

    // remove exact duplicates โดย dedup ด้วย bg_expense + c_name รวมกัน
    // (ป้องกันรายการที่มี bg_expense เดียวกันแต่คนละแหล่งเงินถูกตัดทิ้ง)
    const uniqueRows = [];
    const seenExpenses = new Set();
    filteredRows.forEach((r) => {
      const key = (r.bg_expense || '').trim() + '|' + (r.c_name || '').trim();
      if (!seenExpenses.has(key)) {
        seenExpenses.add(key);
        uniqueRows.push(r);
      }
    });

    if (fundSourceNames.length <= 1) {
      // Single fund source: return unique rows (optionally zero‑ing out when
      // a particular fund source isn't selected)
      return uniqueRows.map((row) => {
        if (fundSourceNames.length === 1 && !fundSourceNames.includes(row.c_name)) {
          return {
            ...row,
            f_plan_begin: 0,
            f_reserve_budget: 0,
          };
        }
        return row;
      });
    } else {
      // Multiple fund sources: group by bg_expense
      const grouped = new Map();
      filteredRows.forEach((row) => {
        const key = row.bg_expense || "Unknown";
        if (!grouped.has(key)) {
          grouped.set(key, {
            bg_expense: key,
            bg_expense_id: row.bg_expense_id,
            dc_cost_acc_id: row.dc_cost_acc_id,
            cost_name: row.cost_name,
            values: new Map(),
          });
        }
        const group = grouped.get(key);
        const fundName = row.c_name || "Unknown";
        if (fundSourceNames.includes(fundName)) {
          if (!group.values.has(fundName)) {
            group.values.set(fundName, { total: 0, booked: 0 });
          }
          const val = group.values.get(fundName);
          val.total += row.f_plan_begin || 0;
          val.booked += row.f_reserve_budget || 0;
        }
      });
      // Calculate remain and pct
      grouped.forEach((group) => {
        group.values.forEach((val) => {
          val.remain = val.total - val.booked;
          val.pct = val.total > 0 ? (val.booked / val.total) * 100 : 0;
        });
      });
      return Array.from(grouped.values());
    }
  }

  // --- Main Dashboard Logic ---
  function refreshDashboard() {
    const rows = getFilteredData();

    // 1. Update KPIs
    const total = rows.reduce((acc, r) => acc + (r.f_plan_begin || 0), 0);
    const booked = rows.reduce((acc, r) => acc + (r.f_reserve_budget || 0), 0);
    const remain = total - booked;

    // Animate numbers (simple)
    $("#kpi-total").text(toBaht(total));
    $("#kpi-booked").text(toBaht(booked));
    $("#kpi-remain").text(toBaht(remain));

    // 2. Prepare Chart Data
    // Group by: Fund Source (c_name) ONLY
    // User wants a high-level view similar to the provided reference image.

    const aggMap = new Map();
    rows.forEach((r) => {
      const key = r.c_name || "Unknown";

      if (!aggMap.has(key)) {
        aggMap.set(key, {
          name: key,
          total: 0,
          booked: 0,
          items: [],
        });
      }
      const obj = aggMap.get(key);
      obj.total += r.f_plan_begin || 0;
      obj.booked += r.f_reserve_budget || 0;
      obj.items.push(r);
    });

    let aggData = Array.from(aggMap.values()).map((d) => ({
      ...d,
      remain: d.total - d.booked,
      pct: d.total > 0 ? (d.booked / d.total) * 100 : 0,
    }));

    // Filter out 0 Total
    aggData = aggData.filter((d) => d.total > 0);

    // Sort by Total Desc
    aggData.sort((a, b) => b.total - a.total);

    // 3. Render Charts
    renderMainChart(aggData);
    renderSideChart(aggData);

    // 4. Render Table (body only)
    renderTable(getDataViewRows());

    // rebuild table header so columns always match selected funds
    const fundSourceNames = $("#multiCheckCombo").val() || [];

    // --- Collect selected section names ---
    const selectedSectionIds = $("#cost_sys_main_filter").val() || [];
    const allSectionIds      = $("#cost_sys_main_filter option").map(function(){ return $(this).val(); }).get();
    const isAllSections      = selectedSectionIds.length === 0 || selectedSectionIds.length === allSectionIds.length;

    let sectionLabel = '';
    if (isAllSections) {
      sectionLabel = 'ทุกส่วนงาน';
    } else {
      const sectionNames = selectedSectionIds.map(function(id) {
        return $("#cost_sys_main_filter option[value='" + id + "']").text().trim() || id;
      });
      sectionLabel = sectionNames.join(', ');
    }

    const totalDataCols = fundSourceNames.length <= 1 ? 8 : fundSourceNames.length * 4;
    const totalCols = 2 + totalDataCols;

    let theadHtml = '';

    // ===== Row 0: Section banner =====
    theadHtml += '<tr>';
    theadHtml += '<th colspan="' + totalCols + '" class="text-center" style="background:#123A7D;color:#fff;font-size:13px;padding:6px 10px;letter-spacing:0.5px;">';
    theadHtml += '&#127970; ส่วนงาน : <strong>' + sectionLabel + '</strong>';
    theadHtml += '</th>';
    theadHtml += '</tr>';

    // ===== Row 1: Column groups =====
    theadHtml += '<tr>';
    theadHtml += '<th rowspan="2">ลำดับ</th>';
    theadHtml += '<th rowspan="2">รหัสงบประมาณ / หมวดค่าใช้จ่าย</th>';
    if (fundSourceNames.length <= 1) {
      theadHtml += '<th colspan="4" class="text-center th-plan">เงินแผน</th>';
      theadHtml += '<th colspan="4" class="text-center th-period">เงินงวด</th>';
    } else {
      fundSourceNames.forEach(function(name) {
        theadHtml += '<th colspan="4">' + name + '</th>';
      });
    }
    theadHtml += '</tr>';

    // ===== Row 2: Sub-columns =====
    theadHtml += '<tr>';
    if (fundSourceNames.length <= 1) {
      theadHtml +=
        '<th class="group-income th-income">งบประมาณ</th>' +
        '<th class="group-income th-income">จอง(ใช้ไป)</th>' +
        '<th class="group-income th-income">คงเหลือ</th>' +
        '<th class="group-income th-income">%</th>' +
        '<th class="group-income th-income">งบประมาณ</th>' +
        '<th class="group-income th-income">จอง(ใช้ไป)</th>' +
        '<th class="group-income th-income">คงเหลือ</th>' +
        '<th class="group-income th-income">%</th>';
    } else {
      fundSourceNames.forEach(function(_) {
        theadHtml +=
          '<th class="group-income th-income">งบประมาณ</th>' +
          '<th class="group-income th-income">ที่ใช้ไป(จอง)</th>' +
          '<th class="group-income th-income">คงเหลือ</th>' +
          '<th class="group-income th-income">%</th>';
      });
    }
    theadHtml += '</tr>';
    $('#dvTable thead').html(theadHtml);
  }

  // --- Charts ---
  function renderMainChart(data) {
    const dom = document.getElementById("bar_bg");
    if (!dom) return; // Safety check
    if (!CHART_MAIN) CHART_MAIN = echarts.init(dom);

    const names = data.map((d) => d.name);

    // Limit initial view to top 15 items to avoid clutter
    const zoomEnd = names.length > 0 ? Math.min(100, (15 / names.length) * 100) : 100;

    const isDark = document.body.classList.contains("dark-mode");
    const textColor = isDark ? "#e0e0e0" : "#333";
    const lineColor = isDark ? "#555" : "#333";
    const splitLineColor = isDark ? "#333" : "#eee";

    const option = {
      toolbox: {
        feature: {
          saveAsImage: { title: "บันทึกภาพ" },
          dataView: {
            title: "ดูข้อมูล",
            lang: ["ข้อมูล", "ปิด", "รีเฟรช"],
            readOnly: false,
            buttonColor: "#123a7d",
          },
          magicType: {
            title: { line: "กราฟเส้น", bar: "กราฟแท่ง", stack: "Stacked", tiled: "แยก" },
            type: ["line", "bar", "stack"],
          },
          restore: { title: "รีเซ็ต" },
        },
        right: "5%",
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params) => {
          let str = `<div style="font-weight:bold; margin-bottom:5px; color:${isDark ? "#000" : "#333"}">${params[0].axisValue}</div>`;
          params.forEach((p) => {
            str += `<div style="color:${isDark ? "#000" : "#333"}">${p.marker} ${p.seriesName}: <b>${toBaht(p.value)}</b></div>`;
          });
          return str;
        },
      },
      legend: {
        top: "bottom",
        data: ["งบประมาณที่ได้รับ (Allocated)", "ใช้ไปแล้ว (Used)", "คงเหลือ (Remaining)"],
        textStyle: { fontSize: 12, fontWeight: "bold", color: textColor },
      },
      grid: { left: "3%", right: "4%", bottom: "15%", top: "15%", containLabel: true, show: true, borderColor: isDark ? "#444" : "#ccc" },
      dataZoom: [
        {
          type: "slider",
          show: true,
          xAxisIndex: 0,
          start: 0,
          end: zoomEnd,
          bottom: "5%",
          handleSize: "100%",
          textStyle: { color: textColor },
        },
        {
          type: "inside",
          xAxisIndex: 0,
          start: 0,
          end: zoomEnd,
        },
      ],
      xAxis: {
        type: "category",
        data: names,
        axisLabel: { interval: 0, rotate: 15, width: 200, overflow: "break", fontWeight: "bold", fontSize: 11, color: textColor },
        axisLine: { show: true, lineStyle: { color: lineColor } },
        splitLine: { show: true, lineStyle: { type: "dashed", color: splitLineColor } },
      },
      yAxis: {
        type: "value",
        name: "จำนวนเงิน (บาท)",
        nameTextStyle: { color: textColor },
        axisLabel: { fontWeight: "bold", fontSize: 11, color: textColor },
        splitLine: { show: true, lineStyle: { color: isDark ? "#333" : "#ddd" } },
        axisLine: { show: true, lineStyle: { color: lineColor } },
      },
      series: [
        {
          name: "งบประมาณที่ได้รับ (Allocated)",
          type: "bar",
          barGap: "0%",
          barCategoryGap: "20%",
          data: data.map((d) => d.total),
          itemStyle: { color: "#4e73df", borderRadius: [4, 4, 0, 0], borderColor: lineColor, borderWidth: 0.5 },
          label: { show: true, position: "top", formatter: (p) => fmtInt(p.value), fontSize: 11, fontWeight: "bold", color: textColor },
        },
        {
          name: "ใช้ไปแล้ว (Used)",
          type: "bar",
          data: data.map((d) => d.booked),
          itemStyle: { color: "#1cc88a", borderRadius: [4, 4, 0, 0], borderColor: lineColor, borderWidth: 0.5 },
          label: { show: true, position: "top", formatter: (p) => fmtInt(p.value), fontSize: 11, fontWeight: "bold", color: textColor },
        },
        {
          name: "คงเหลือ (Remaining)",
          type: "bar",
          data: data.map((d) => d.remain),
          itemStyle: { color: "#f6c23e", borderRadius: [4, 4, 0, 0], borderColor: lineColor, borderWidth: 0.5 },
          label: { show: true, position: "top", formatter: (p) => fmtInt(p.value), fontSize: 11, fontWeight: "bold", color: textColor },
        },
      ],
    };

    CHART_MAIN.setOption(option, true);

    // --- CLICK EVENT → filter DataView by fund source ---
    CHART_MAIN.off("click");
    CHART_MAIN.on("click", function (params) {
      const clickedName = params.name; // Fund source name (c_name)
      if (clickedName) {
        // เซต multiCheckCombo ให้เลือกเฉพาะ fund ที่คลิก
        const $combo = $("#multiCheckCombo");
        $combo.selectpicker("val", [clickedName]);
        $combo.selectpicker("refresh");
        refreshDashboard();
        // scroll ลงมาที่ DataView
        const dvEl = document.querySelector(".dataview-wrap") || document.querySelector("#dvTable");
        if (dvEl) {
          setTimeout(function(){ dvEl.scrollIntoView({ behavior: "smooth", block: "start" }); }, 150);
        }
      }
    });
  }

  function renderSideChart(data) {
    const dom = document.getElementById("pie_tor_type");
    if (!dom) return; // Safety check
    if (!CHART_SIDE) CHART_SIDE = echarts.init(dom);

    // Sort by Usage % Desc
    const sorted = [...data].sort((a, b) => b.pct - a.pct);

    const isDark = document.body.classList.contains("dark-mode");
    const textColor = isDark ? "#e0e0e0" : "#333";

    const option = {
      toolbox: {
        feature: {
          saveAsImage: { title: "บันทึกภาพ" },
          dataView: {
            title: "ดูข้อมูล",
            lang: ["ข้อมูล", "ปิด", "รีเฟรช"],
            readOnly: true,
            buttonColor: "#123a7d",
          },
          restore: { title: "รีเซ็ต" },
        },
      },
      tooltip: { trigger: "axis", formatter: "{b}: {c}%" },
      grid: { left: "3%", right: "15%", bottom: "3%", containLabel: true },
      xAxis: { type: "value", max: 100, axisLabel: { color: textColor }, splitLine: { lineStyle: { color: isDark ? "#333" : "#eee" } } },
      yAxis: { type: "category", data: sorted.map((d) => d.name), inverse: true, axisLabel: { color: textColor } },
      series: [
        {
          type: "bar",
          data: sorted.map((d) => d.pct.toFixed(2)),
          itemStyle: {
            color: (p) => {
              const val = p.value;
              if (val > 90) return "#ff7675";
              if (val > 70) return "#fdcb6e";
              return "#55efc4";
            },
            barBorderRadius: [0, 20, 20, 0],
          },
          label: { show: true, position: "right", formatter: "{c}%", color: textColor },
        },
      ],
    };
    CHART_SIDE.setOption(option);

    // Click → filter DataView by fund source
    CHART_SIDE.off("click");
    CHART_SIDE.on("click", function (params) {
      const clickedName = params.name || params.value;
      if (clickedName) {
        const $combo = $("#multiCheckCombo");
        $combo.selectpicker("val", [clickedName]);
        $combo.selectpicker("refresh");
        refreshDashboard();
        const dvEl = document.querySelector(".dataview-wrap") || document.querySelector("#dvTable");
        if (dvEl) {
          setTimeout(function(){ dvEl.scrollIntoView({ behavior: "smooth", block: "start" }); }, 150);
        }
      }
    });
  }

  // --- Data View ---
  function renderTable(rows) {
    const $tbody = $("#dvBody");
    $tbody.empty();

    const fundSourceNames = $("#multiCheckCombo").val() || [];
    const isMultipleFunds = fundSourceNames.length > 1;

    let activeRows;
    let limit = 200;
    let colspan = 2 + 4 * (isMultipleFunds ? fundSourceNames.length : 1);

    if (!isMultipleFunds) {
      // Single fund: show all rows even if the budget is zero.  The original
      // implementation hid zero‑amount items which is why only 9 of the 13
      // records appeared; four of the expected entries had no plan budget.
      activeRows = rows; // no filtering by f_plan_begin
    } else {
      // Multiple funds: also display all groups, keeping the 0‑totals so that
      // the table has one row per bg_expense regardless of value.
      activeRows = rows;
    }

    activeRows.slice(0, limit).forEach((r, idx) => {
      // build link to detail list; include fund filter for any selected funds
      const _yr = $("#budget_year_filter").val() || '';
      const _year_en = parseInt(_yr) - 543;
      const _total = r.f_plan_begin || 0;
      const _booked = r.f_reserve_budget || 0;
      const _remain = _total - _booked;
      const _bg_label = encodeURIComponent((r.bg_expense || '').trim());
      const selectedFunds = $("#multiCheckCombo").val() || [];
      const _dc_type = r.dc_expense_budget_type_id || '';
      let linkExpense = `Rep_DetailByTypeV5.php`
        + `?bg_expense_id=${encodeURIComponent(r.bg_expense_id || '')}`
        + `&dc_expense_budget_type_id=${encodeURIComponent(_dc_type)}`
        + `&dc_cost_acc_id=${encodeURIComponent(r.dc_cost_acc_id || '')}`
        + `&year_th=${encodeURIComponent(_yr)}`
        + `&year_en=${encodeURIComponent(_year_en)}`
        + `&f_budget=${encodeURIComponent(_total)}`
        + `&f_reserve=${encodeURIComponent(_booked)}`
        + `&f_remaining=${encodeURIComponent(_remain)}`
        + `&f_plan_total=${encodeURIComponent(r.f_plan_total || 0)}`
        + `&f_plan_used=${encodeURIComponent(r.f_plan_used || 0)}`
        + `&f_plan_remain=${encodeURIComponent(r.f_plan_remain || 0)}`
        + `&f_period_total=${encodeURIComponent(r.f_period_total || 0)}`
        + `&f_period_used=${encodeURIComponent(r.f_period_used || 0)}`
        + `&f_period_remain=${encodeURIComponent(r.f_period_remain || 0)}`
        + `&bg_expense_label=${_bg_label}`
        + `&col=reserve`;

      // determine whether this budget row actually has any nonzero amount
      // for the current filter state; if not, we'll mark the link/row
      let hasAnyData = false;
      if (selectedFunds.length <= 1) {
        // single-fund or all funds: use the aggregated fields
        const total = r.f_plan_begin || 0;
        const booked = r.f_reserve_budget || 0;
        const remain = total - booked;
        hasAnyData = total > 0 || booked > 0 || remain > 0;
      } else {
        // multiple funds: check all fund-specific values
        fundSourceNames.forEach(fundName => {
          const val = r.values.get(fundName);
          if (val && (val.total > 0 || val.booked > 0 || val.remain > 0)) {
            hasAnyData = true;
          }
        });
      }

      let tr = `
        <tr${hasAnyData ? "" : " class=\"no-data-row\""}>
          <td class="text-center sticky-col font-weight-bold text-muted">${idx + 1}</td>
          <td class="sticky-col" style="text-align: left;">
            <!-- link should respect selected fund when only one is chosen -->
            <a href="${hasAnyData ? linkExpense : '#'}" class="budget-link${hasAnyData ? '' : ' text-muted'}" target="_blank" style="color: inherit; text-decoration: none;" title="${hasAnyData ? '' : 'ไม่มีข้อมูล'}">
              <div class="font-weight-bold text-dark">${r.bg_expense || "-"}</div>
            </a>
          </td>`;

      if (!isMultipleFunds) {
        const total = r.f_plan_begin || 0;
        const booked = r.f_reserve_budget || 0;
        const remain = total - booked;
        const pct = total ? (booked / total) * 100 : 0;

        // เงินแผน
        const planTotal    = r.f_plan_total    || 0;
        const planUsed     = r.f_plan_used     || 0;
        const planRemain   = r.f_plan_remain   || 0;
        const planPct      = planTotal > 0 ? (planUsed / planTotal) * 100 : 0;

        // เงินงวด
        const periodTotal  = r.f_period_total  || 0;
        const periodUsed   = r.f_period_used   || 0;
        const periodRemain = r.f_period_remain || 0;
        const periodPct    = periodTotal > 0 ? (periodUsed / periodTotal) * 100 : 0;

        const _ys = $("#budget_year_filter").val() || '';
        const year_en = parseInt(_ys) - 543;
        const bg_label = encodeURIComponent((r.bg_expense || '').trim());
        const detailLink = `Rep_DetailByTypeV5.php`
          + `?bg_expense_id=${encodeURIComponent(r.bg_expense_id || '')}`
          + `&dc_expense_budget_type_id=${encodeURIComponent(r.dc_expense_budget_type_id || '')}`
          + `&dc_cost_acc_id=${encodeURIComponent(r.dc_cost_acc_id || '')}`
          + `&year_th=${encodeURIComponent(_ys)}`
          + `&year_en=${encodeURIComponent(year_en)}`
          + `&f_budget=${encodeURIComponent(total)}`
          + `&f_reserve=${encodeURIComponent(booked)}`
          + `&f_remaining=${encodeURIComponent(remain)}`
          + `&f_plan_total=${encodeURIComponent(planTotal)}`
          + `&f_plan_used=${encodeURIComponent(planUsed)}`
          + `&f_plan_remain=${encodeURIComponent(planRemain)}`
          + `&f_period_total=${encodeURIComponent(periodTotal)}`
          + `&f_period_used=${encodeURIComponent(periodUsed)}`
          + `&f_period_remain=${encodeURIComponent(periodRemain)}`
          + `&bg_expense_label=${bg_label}`
          + `&col=reserve`;

        const selectedFundsNow = $("#multiCheckCombo").val() || [];

        // helper สร้าง link แยก plan/period โดยส่ง budget_mode ไปด้วย
        const baseParams = `bg_expense_id=${encodeURIComponent(r.bg_expense_id || '')}`
          + `&dc_expense_budget_type_id=${encodeURIComponent(r.dc_expense_budget_type_id || '')}`
          + `&dc_cost_acc_id=${encodeURIComponent(r.dc_cost_acc_id || '')}`
          + `&year_th=${encodeURIComponent(_ys)}`
          + `&year_en=${encodeURIComponent(year_en)}`
          + `&f_plan_total=${encodeURIComponent(planTotal)}`
          + `&f_plan_used=${encodeURIComponent(planUsed)}`
          + `&f_plan_remain=${encodeURIComponent(planRemain)}`
          + `&f_period_total=${encodeURIComponent(periodTotal)}`
          + `&f_period_used=${encodeURIComponent(periodUsed)}`
          + `&f_period_remain=${encodeURIComponent(periodRemain)}`
          + `&bg_expense_label=${bg_label}`;

        const mkLink = (mode, col) =>
          `Rep_DetailByTypeV5.php?${baseParams}&budget_mode=${mode}&col=${col}`;

        // เงินแผน links
        const planLinkBudget  = mkLink('plan', 'budget');
        const planLinkReserve = mkLink('plan', 'reserve');
        const planLinkRemain  = mkLink('plan', 'remaining');

        // เงินงวด links
        const periodLinkBudget  = mkLink('period', 'budget');
        const periodLinkReserve = mkLink('period', 'reserve');
        const periodLinkRemain  = mkLink('period', 'remaining');

        const cellStyle = 'style="cursor:pointer;text-decoration:none;color:inherit;"';

        if (selectedFundsNow.length <= 1) {
          // แสดงเงินแผน + เงินงวด — แต่ละ cell คลิกได้แยก
          tr += `
            <td class="text-right"><a href="${planLinkBudget}" target="_blank" ${cellStyle}>${toBaht(planTotal)}</a></td>
            <td class="text-right text-danger"><a href="${planLinkReserve}" target="_blank" ${cellStyle}>${toBaht(planUsed)}</a></td>
            <td class="text-right text-success font-weight-bold"><a href="${planLinkRemain}" target="_blank" ${cellStyle}>${toBaht(planRemain)}</a></td>
            <td class="text-center">
              <div class="progress" style="height: 6px; width: 60px; margin: 0 auto;">
                <div class="progress-bar ${planPct > 90 ? "bg-danger" : "bg-info"}" style="width: ${Math.min(planPct,100)}%"></div>
              </div>
              <small style="font-size:10px;">${planPct.toFixed(1)}%</small>
            </td>
            <td class="text-right"><a href="${periodLinkBudget}" target="_blank" ${cellStyle}>${toBaht(periodTotal)}</a></td>
            <td class="text-right text-danger"><a href="${periodLinkReserve}" target="_blank" ${cellStyle}>${toBaht(periodUsed)}</a></td>
            <td class="text-right text-success font-weight-bold"><a href="${periodLinkRemain}" target="_blank" ${cellStyle}>${toBaht(periodRemain)}</a></td>
            <td class="text-center">
              <div class="progress" style="height: 6px; width: 60px; margin: 0 auto;">
                <div class="progress-bar ${periodPct > 90 ? "bg-danger" : "bg-info"}" style="width: ${Math.min(periodPct,100)}%"></div>
              </div>
              <small style="font-size:10px;">${periodPct.toFixed(1)}%</small>
            </td>`;
        } else {
          tr += `
            <td class="text-right"><a href="${detailLink}" target="_blank" style="color: inherit; text-decoration: none;">${toBaht(total)}</a></td>
            <td class="text-right text-danger"><a href="${detailLink}" target="_blank" style="color: inherit; text-decoration: none;">${toBaht(booked)}</a></td>
            <td class="text-right text-success font-weight-bold"><a href="${detailLink}" target="_blank" style="color: inherit; text-decoration: none;">${toBaht(remain)}</a></td>
            <td class="text-center"><a href="${detailLink}" target="_blank" style="color: inherit; text-decoration: none;">
              <div class="progress" style="height: 6px; width: 60px; margin: 0 auto;">
                <div class="progress-bar ${pct > 90 ? "bg-danger" : "bg-info"}" style="width: ${pct}%"></div>
              </div>
              <small style="font-size:10px;">${pct.toFixed(1)}%</small>
            </a></td>`;
        }
      } else {
        fundSourceNames.forEach(fundName => {
          const val = r.values.get(fundName);
          const _ym = $("#budget_year_filter").val() || '';
          const year_en_m = parseInt(_ym) - 543;
          const bg_label_m = encodeURIComponent((r.bg_expense || '').trim());
          const detailLink = val
            ? `Rep_DetailByTypeV5.php`
              + `?bg_expense_id=${encodeURIComponent(r.bg_expense_id || '')}`
              + `&dc_expense_budget_type_id=${encodeURIComponent(r.dc_expense_budget_type_id || '')}`
              + `&dc_cost_acc_id=${encodeURIComponent(r.dc_cost_acc_id || '')}`
              + `&year_th=${encodeURIComponent(_ym)}`
              + `&year_en=${encodeURIComponent(year_en_m)}`
              + `&f_budget=${encodeURIComponent(val ? val.total : 0)}`
              + `&f_reserve=${encodeURIComponent(val ? val.booked : 0)}`
              + `&f_remaining=${encodeURIComponent(val ? val.remain : 0)}`
              + `&f_plan_total=${encodeURIComponent(r.f_plan_total || 0)}`
              + `&f_plan_used=${encodeURIComponent(r.f_plan_used || 0)}`
              + `&f_plan_remain=${encodeURIComponent(r.f_plan_remain || 0)}`
              + `&f_period_total=${encodeURIComponent(r.f_period_total || 0)}`
              + `&f_period_used=${encodeURIComponent(r.f_period_used || 0)}`
              + `&f_period_remain=${encodeURIComponent(r.f_period_remain || 0)}`
              + `&bg_expense_label=${bg_label_m}`
              + `&col=reserve`
            : '#';
          if (val) {
            tr += `
              <td class="text-right"><a href="${detailLink}" target="_blank" style="color: inherit; text-decoration: none;">${toBaht(val.total)}</a></td>
              <td class="text-right text-danger"><a href="${detailLink}" target="_blank" style="color: inherit; text-decoration: none;">${toBaht(val.booked)}</a></td>
              <td class="text-right text-success font-weight-bold"><a href="${detailLink}" target="_blank" style="color: inherit; text-decoration: none;">${toBaht(val.remain)}</a></td>
              <td class="text-center"><a href="${detailLink}" target="_blank" style="color: inherit; text-decoration: none;">
                <div class="progress" style="height: 6px; width: 60px; margin: 0 auto;">
                  <div class="progress-bar ${val.pct > 90 ? "bg-danger" : "bg-info"}" style="width: ${val.pct}%"></div>
                </div>
                <small style="font-size:10px;">${val.pct.toFixed(1)}%</small>
              </a></td>`;
          } else {
            // no data for this fund name, emit four empty cells to keep column count consistent
            tr += `
              <td class="text-right"><a href="${detailLink}" target="_blank" style="color: inherit; text-decoration: none;">${toBaht(0)}</a></td>
              <td class="text-right"><a href="${detailLink}" target="_blank" style="color: inherit; text-decoration: none;">${toBaht(0)}</a></td>
              <td class="text-right text-success font-weight-bold"><a href="${detailLink}" target="_blank" style="color: inherit; text-decoration: none;">${toBaht(0)}</a></td>
              <td class="text-center"><a href="${detailLink}" target="_blank" style="color: inherit; text-decoration: none;">
                <div class="progress" style="height: 6px; width: 60px; margin: 0 auto;">
                  <div class="progress-bar bg-info" style="width: 0%"></div>
                </div>
                <small style="font-size:10px;">0.0%</small>
              </a></td>`;
          }
        });
      }

      tr += `</tr>`;
      $tbody.append(tr);
    });

    if (activeRows.length > limit) {
      $tbody.append(`<tr><td colspan="${colspan}" class="text-center text-muted p-3">... Showing first ${limit} of ${activeRows.length} items ...</td></tr>`);
    }
  }

  // --- Drilldown Modal ---
  function showDrilldown(titleName, items) {
    $("#modal-category-name").text(titleName);
    const $tbody = $("#modal-table-body");
    $tbody.empty();

    items.forEach((r) => {
      const total = r.f_plan_begin || 0;
      const booked = r.f_reserve_budget || 0;
      const remain = total - booked;

      // Extract Code and Name from "Code : Name" format
      let code = r.bg_expense_id || "-";
      let name = r.bg_expense || "-";

      if (typeof name === "string" && name.includes(" : ")) {
        const parts = name.split(" : ");
        if (parts.length >= 2) {
          code = parts[0].trim();
          name = parts.slice(1).join(" : ").trim();
        }
      }

      const tr = `
                <tr>
                    <td>${code}</td>
                    <td>${name}</td>
                    <td class="text-right">${toBaht(total)}</td>
                    <td class="text-right text-danger">${toBaht(booked)}</td>
                    <td class="text-right text-success">${toBaht(remain)}</td>
                </tr>
             `;
      $tbody.append(tr);
    });

    $("#drilldownModal").modal("show");
  }

  // Start
  $(document).ready(init);
})();