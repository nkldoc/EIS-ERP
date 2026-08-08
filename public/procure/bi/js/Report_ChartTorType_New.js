/**
 * Report_ChartTorType_New.js
 * Modernized version of Procurement Method Report
 * 
 * [เปลี่ยนแปลง]
 *  - STATUS_NAMES[10] : "บริหารสัญญา" → "ลงนามในสัญญา"
 *  - เพิ่มคอลัมน์ "จำนวนสัญญา" และ "สถานะดำเนินงาน" ใน detail modal
 *  - เพิ่ม pipeline/stepper แสดงขั้นตอนการดำเนินงาน
 */

(function () {
  // --- Globals ---
  let RAW_DATA = [];
  let CHART_INSTANCES = [];
  let YEAR_TH = window.PHP_YEAR_TH || new Date().getFullYear() + 543;
  let YEAR_EN = YEAR_TH - 543;
  let COST_ID_KEY = null;
  let COST_NAME_KEY = null;
  let LOAD_INTERVAL = null;

  // --- Constants ---
  const TOR_TYPES = [
    { field: "i_tor_type1", label: "วิธีประกวดราคาอิเล็กทรอนิกส์ (E-Bidding)", color: "#4e73df" },
    { field: "i_tor_type2", label: "วิธีคัดเลือก",                               color: "#1cc88a" },
    { field: "i_tor_type3", label: "วิธีเฉพาะเจาะจง (ไม่เกิน 5 แสน)",          color: "#f6c23e" },
    { field: "i_tor_type4", label: "วิธีเฉพาะเจาะจง (เกิน 5 แสน)",             color: "#e74a3b" },
    { field: "i_tor_type5", label: "E-Market",                                    color: "#36b9cc" },
    { field: "i_tor_type6", label: "สรุปรวม",                                    color: "#858796" },
  ];

  // ============================================================
  // [แก้ไข] STATUS_NAMES[10] เปลี่ยนจาก "บริหารสัญญา" → "ลงนามในสัญญา"
  // ============================================================
  const STATUS_NAMES = {
    8:  "รอดำเนินการ",
    9:  "อยู่ระหว่างดำเนินการ",
    10: "ลงนามในสัญญา",          // ← เปลี่ยนจาก "บริหารสัญญา"
    11: "ตรวจรับพัสดุ",
    12: "ขออนุมัติเบิกจ่ายเงิน",
    13: "เบิกจ่ายเงินแล้ว",
  };

  // ============================================================
  // [เพิ่มใหม่] ขั้นตอนการดำเนินงาน (Pipeline / Stepper)
  // สำเร็จ = status_group_id === 13
  // ============================================================
  const STEP_FLOW = [
    { id: 8,  label: "รอดำเนินการ",          icon: "⏳", colorDone: "#6c757d", colorActive: "#6c757d" },
    { id: 9,  label: "อยู่ระหว่างดำเนินการ", icon: "🔄", colorDone: "#28a745", colorActive: "#ffc107" },
    { id: 10, label: "ลงนามในสัญญา",         icon: "📝", colorDone: "#28a745", colorActive: "#17a2b8" },
    { id: 11, label: "ตรวจรับพัสดุ",         icon: "🔍", colorDone: "#28a745", colorActive: "#007bff" },
    { id: 12, label: "ขออนุมัติเบิกจ่าย",    icon: "💰", colorDone: "#28a745", colorActive: "#fd7e14" },
    { id: 13, label: "เบิกจ่ายเงินแล้ว",     icon: "✅", colorDone: "#28a745", colorActive: "#28a745" },
  ];

  // --- Initialization ---
  $(document).ready(function () {
    startLoading();
    initData();
    initFilters();
    initDarkMode();

    setTimeout(() => {
      populateAssetFilters(RAW_DATA);
      renderDashboard(RAW_DATA);
      stopLoading();
    }, 500);
  });

  // --- Data Parsing ---
  function initData() {
    try {
      let jsonStr = window.INJECTED_DATA || '{"year_th":2568,"data":[]}';
      if (typeof jsonStr === "object") jsonStr = JSON.stringify(jsonStr);
      const parsed = JSON.parse(jsonStr);

      RAW_DATA = parsed.data || [];

      if (parsed.year_th) YEAR_TH = parsed.year_th;
      YEAR_EN = YEAR_TH - 543;

      detectCostFields(RAW_DATA);
    } catch (e) {
      console.error("Data Parse Error", e);
      RAW_DATA = [];
    }
  }

  function detectCostFields(rows) {
    if (!rows || !rows.length) return;
    const sample = rows[0];
    const keys = Object.keys(sample);

    keys.forEach((k) => {
      const lower = k.toLowerCase();
      if (!COST_ID_KEY && lower.includes("cost") && lower.includes("id")) COST_ID_KEY = k;
    });

    if (keys.includes("cost_name"))       COST_NAME_KEY = "cost_name";
    else if (keys.includes("c_name"))     COST_NAME_KEY = "c_name";
    else if (keys.includes("c_cost_name")) COST_NAME_KEY = "c_cost_name";
  }

  function getCostId(row) {
    if (!row || !COST_ID_KEY) return null;
    return row[COST_ID_KEY] ? String(row[COST_ID_KEY]) : null;
  }

  // --- Filter Logic ---
  function initFilters() {
    const $year = $("#budget_year_filter");
    const currentYear = new Date().getFullYear();
    for (let y = currentYear - 2; y <= currentYear + 1; y++) {
      const th = y + 543;
      $year.append(new Option(`พ.ศ. ${th}`, th));
    }
    $year.val(YEAR_TH).selectpicker("refresh");

    $year.on("changed.bs.select", function () {
      startLoading();
      const val = $(this).val();
      window.location.href = `?year_th=${val}`;
    });

    const $sec = $("#cost_sys_main_filter");
    if ($sec.length && RAW_DATA.length) {
      const map = {};
      RAW_DATA.forEach((r) => {
        const id   = getCostId(r);
        const name = r[COST_NAME_KEY] || r.c_name || "-";
        if (id) map[id] = name;
      });

      $sec.append(new Option("ทุกส่วนงาน", "all"));
      Object.keys(map).forEach((id) => {
        $sec.append(new Option(map[id], id));
      });
      $sec.val("all").selectpicker("refresh");

      $sec.on("changed.bs.select", function () {
        const val = $(this).val();
        filterData(val);
      });
    }
  }

  function filterData(sectionId) {
    startLoading();
    setTimeout(() => {
      if (!sectionId || sectionId === "all") {
        renderDashboard(RAW_DATA);
      } else {
        const filtered = RAW_DATA.filter((r) => getCostId(r) === sectionId);
        renderDashboard(filtered);
      }
      stopLoading();
    }, 200);
  }

  // --- Core Logic: Aggregate & Render ---

  function populateAssetFilters(data) {
    const types = new Set();
    data.forEach((r) => {
      const t = r.i_product_type_name || r.i_product_type;
      if (t) types.add(t);
    });

    const $sel = $("#asset_type_filter");
    $sel.find("option:not([value='all'])").remove();

    Array.from(types)
      .sort()
      .forEach((t) => {
        $sel.append(`<option value="${t}">${t}</option>`);
      });
    $sel.selectpicker("refresh");

    $("#asset_type_filter, #search_filter")
      .off("change keyup")
      .on("change keyup", function () {
        renderDashboard(RAW_DATA);
      });
  }

  // --- Render Dashboard ---
  function renderDashboard(allRows) {
    const assetFilter   = $("#asset_type_filter").val();
    const searchFilter  = $("#search_filter").val().toLowerCase().trim();
    const sectionFilter = $("#cost_sys_main_filter").val();

    const rows = allRows.filter((r) => {
      if (assetFilter && assetFilter !== "all") {
        const t = r.i_product_type_name || r.i_product_type;
        if (t !== assetFilter) return false;
      }
      if (sectionFilter && sectionFilter !== "all") {
        if (getCostId(r) !== sectionFilter) return false;
      }
      if (searchFilter) {
        const text = `${r.c_name} ${r.contract_c_code} ${r.pr_code}`.toLowerCase();
        if (!text.includes(searchFilter)) return false;
      }
      return true;
    });

    const statusMap = {};

    [8, 9, 10, 11, 12, 13].forEach((id) => {
      statusMap[id] = {
        id:     id,
        name:   STATUS_NAMES[id] || "Unknown",
        types:  { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
        rowRef: null,
      };
    });

    rows.forEach((r) => {
      const statusId = r.status_group_id;
      const typeId   = r.tor_type_id;

      if (!statusMap[statusId]) return;

      statusMap[statusId].rowRef = r;

      let targetType = 0;
      const amt = Number(r.total_amt || 0);

      if      (typeId == 4) targetType = 1;
      else if (typeId == 3) targetType = 2;
      else if (typeId == 1) targetType = (amt < 500000) ? 3 : 4;
      else if (typeId == 2) targetType = 5;

      if (targetType > 0) {
        statusMap[statusId].types[targetType]++;
        statusMap[statusId].types[6]++;
      }
    });

    const aggData = Object.values(statusMap);

    renderCharts(aggData);
    renderTable(aggData);
  }

  function renderCharts(aggData) {
    const isDark    = document.body.classList.contains("dark-mode");
    const textColor = isDark ? "#e0e0e0" : "#333";

    for (let i = 1; i <= 4; i++) {
      const chartId = `chart-pie-${i}`;
      const dom = document.getElementById(chartId);
      if (!dom) continue;

      let instance = echarts.getInstanceByDom(dom);
      if (!instance) {
        instance = echarts.init(dom);
        CHART_INSTANCES.push(instance);
        window.addEventListener("resize", () => instance.resize());
      }

      const pieData = aggData
        .map((d) => ({
          name:     d.name,
          value:    d.types[i],
          statusId: d.id,
          costId:   getCostId(d.rowRef),
        }))
        .filter((p) => p.value > 0);

      const option = {
        backgroundColor: "transparent",
        tooltip: {
          trigger:   "item",
          formatter: "{b}: {c} ({d}%)",
        },
        legend: {
          type:      "scroll",
          bottom:    0,
          textStyle: { color: textColor, fontFamily: "Sarabun, sans-serif" },
        },
        textStyle: { fontFamily: "Sarabun, sans-serif" },
        toolbox: {
          feature: { saveAsImage: { title: "บันทึกภาพ" } },
        },
        series: [
          {
            name:   TOR_TYPES[i - 1].label,
            type:   "pie",
            radius: ["40%", "70%"],
            center: ["50%", "45%"],
            itemStyle: {
              borderRadius: 5,
              borderColor:  isDark ? "#1e1e1e" : "#fff",
              borderWidth:  2,
            },
            label: {
              show:      true,
              formatter: "{d}%",
              color:     textColor,
            },
            data: pieData,
          },
        ],
      };

      instance.setOption(option);

      instance.off("click");
      instance.on("click", function (params) {
        if (params.data) {
          openDetail(params.data.statusId, params.data.value, `i_tor_type${i}`, params.data.costId);
        }
      });
    }
  }

  function renderTable(aggData) {
    const $tbody = $("#table-body");
    const $tfoot = $("#table-foot");
    $tbody.empty();
    $tfoot.empty();

    let sums = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    aggData.forEach((item, idx) => {
      let tds = `<td>${idx + 1}</td>`;
      tds += `<td class="font-weight-bold">${item.name}</td>`;

      for (let i = 1; i <= 6; i++) {
        const val    = item.types[i];
        sums[i]     += val;
        const costId = getCostId(item.rowRef) || "";

        tds += `<td class="text-center">
                    <span class="clickable" onclick="openDetail('${item.id}', '${val}', 'i_tor_type${i}', '${costId}')">
                        ${val > 0 ? Number(val).toLocaleString() : "-"}
                    </span>
                </td>`;
      }
      $tbody.append(`<tr>${tds}</tr>`);
    });

    let footerHtml = `<tr><td colspan="2" class="text-right">รวมทั้งหมด</td>`;
    for (let i = 1; i <= 6; i++) {
      footerHtml += `<td class="text-center text-primary">${Number(sums[i]).toLocaleString()}</td>`;
    }
    footerHtml += `</tr>`;
    $tfoot.append(footerHtml);
  }

  // --- Helper: Drilldown ---
  let CURRENT_DETAIL_ROWS  = [];
  let CURRENT_DETAIL_TITLE = "";

  window.openDetail = function (statusId, val, fieldKey, costId) {
    if (!val || val == 0 || val == "-") return;

    const typeIdx       = parseInt(fieldKey.replace("i_tor_type", ""));
    const globalSection = $("#cost_sys_main_filter").val();
    const assetFilter   = $("#asset_type_filter").val();
    const searchFilter  = $("#search_filter").val().toLowerCase().trim();

    const filtered = RAW_DATA.filter((r) => {
      if (r.status_group_id != statusId) return false;

      if (globalSection && globalSection !== "all") {
        if (getCostId(r) !== globalSection) return false;
      }
      if (assetFilter && assetFilter !== "all") {
        const t = r.i_product_type_name || r.i_product_type;
        if (t !== assetFilter) return false;
      }
      if (searchFilter) {
        const text = `${r.c_name} ${r.contract_c_code} ${r.pr_code}`.toLowerCase();
        if (!text.includes(searchFilter)) return false;
      }

      const typeId = Number(r.tor_type_id);
      const amt    = Number(r.total_amt || 0);

      let calculatedType = 0;
      if      (typeId == 4) calculatedType = 1;
      else if (typeId == 3) calculatedType = 2;
      else if (typeId == 1) calculatedType = (amt < 500000) ? 3 : 4;
      else if (typeId == 2) calculatedType = 5;

      if (typeIdx !== 6 && calculatedType !== typeIdx) return false;

      return true;
    });

    CURRENT_DETAIL_ROWS  = filtered;
    const statusName     = STATUS_NAMES[statusId] || "Unknown";
    const typeLabel      = (TOR_TYPES[typeIdx - 1] || {}).label || "ทั้งหมด";
    CURRENT_DETAIL_TITLE = `รายละเอียด_${statusName}_${typeLabel}`;

    $("#btnExportDetail").off("click").on("click", function () {
      exportDetailExcel();
    });

    renderDetailTable(filtered, parseInt(statusId), typeIdx);
    $("#detailModal").modal("show");
  };

  async function exportDetailExcel() {
    if (!CURRENT_DETAIL_ROWS || !CURRENT_DETAIL_ROWS.length) return;

    if (typeof ExcelJS === "undefined") {
      await new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js";
        s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Smart Procurement Monitoring";
    workbook.created  = new Date();

    const sheet = workbook.addWorksheet("Details", {
      views: [{ state: "frozen", ySplit: 3 }],
    });

    // ── Color Palette ──────────────────────────────────────────────
    const CLR = {
      headerBg:   "FF1A4F8B",
      headerFont: "FFFFFFFF",
      titleBg:    "FF2E75B6",
      altRow:     "FFF0F5FF",
      footerBg:   "FFD9E1F2",
      footerFont: "FF1A4F8B",
      border:     "FFB8CCE4",
      success:    "FF1E8449",
      successBg:  "FFD5F5E3",
      pending:    "FF7D6608",
      pendingBg:  "FFFFF9C4",
      numColor:   "FF1A5276",
    };

    const borderThin = {
      top: { style:"thin", color:{argb:CLR.border} },
      left: { style:"thin", color:{argb:CLR.border} },
      bottom: { style:"thin", color:{argb:CLR.border} },
      right: { style:"thin", color:{argb:CLR.border} },
    };

    // Column definitions: [header, width, alignment]
    const COLS_DEF = [
      ["#",                   5,  "center"],
      ["ปีงบประมาณ",           10, "center"],
      ["ประเภทสินทรัพย์",      20, "center"],
      ["ประเภทสัญญา",          16, "center"],
      ["เลขที่ PR",            22, "center"],
      ["เลขที่สัญญา",          22, "center"],
      ["ชื่อโครงการ / รายการ", 50, "left"],
      ["วงเงิน (บาท)",         18, "right"],
      ["จำนวนสัญญา",           14, "center"],
      ["สถานะดำเนินงาน",       18, "center"],
      ["หน่วยงาน",             28, "left"],
      ["ผู้รับผิดชอบ",         22, "left"],
    ];

    const numCols = COLS_DEF.length;

    // ── Title Row ─────────────────────────────────────────────────
    sheet.mergeCells(1, 1, 1, numCols);
    const t1 = sheet.getCell(1,1);
    t1.value = `รายละเอียดข้อมูล: ${CURRENT_DETAIL_TITLE} — ปีงบประมาณ พ.ศ. ${YEAR_TH}`;
    t1.font      = { name:"Arial", bold:true, size:13, color:{argb:"FFFFFFFF"} };
    t1.fill      = { type:"pattern", pattern:"solid", fgColor:{argb:CLR.titleBg} };
    t1.alignment = { horizontal:"center", vertical:"middle" };
    sheet.getRow(1).height = 28;

    sheet.mergeCells(2, 1, 2, numCols);
    const t2 = sheet.getCell(2,1);
    t2.value = `ส่งออกเมื่อ: ${new Date().toLocaleString("th-TH")}  |  จำนวนรายการ: ${CURRENT_DETAIL_ROWS.length.toLocaleString()} รายการ`;
    t2.font      = { name:"Arial", italic:true, size:10, color:{argb:"FF444444"} };
    t2.fill      = { type:"pattern", pattern:"solid", fgColor:{argb:"FFF2F7FF"} };
    t2.alignment = { horizontal:"center", vertical:"middle" };
    sheet.getRow(2).height = 18;

    // ── Header Row ────────────────────────────────────────────────
    COLS_DEF.forEach(([label, width, align], ci) => {
      const cell = sheet.getCell(3, ci + 1);
      cell.value     = label;
      cell.font      = { name:"Arial", bold:true, size:10, color:{argb:CLR.headerFont} };
      cell.fill      = { type:"pattern", pattern:"solid", fgColor:{argb:CLR.headerBg} };
      cell.alignment = { horizontal:align, vertical:"middle", wrapText:true };
      cell.border    = borderThin;
      sheet.getColumn(ci + 1).width = width;
    });
    sheet.getRow(3).height = 30;

    // ── Data Rows ─────────────────────────────────────────────────
    let totalAmt = 0, totalContracts = 0;

    CURRENT_DETAIL_ROWS.forEach((r, ri) => {
      const exRow = ri + 4;
      const isAlt = ri % 2 === 1;
      const bgFill = { type:"pattern", pattern:"solid", fgColor:{argb: isAlt ? CLR.altRow : "FFFFFFFF"} };
      const amt    = Number(r.total_amt || 0);
      const count  = Number(r.contract_count || 0);
      const status = r.process_status || "รอดำเนินการ";
      const isDone = status === "สำเร็จ";

      totalAmt       += amt;
      totalContracts += count;

      const rowData = [
        ri + 1,
        r.i_yyyy || "",
        r.i_product_type_name || r.i_product_type || "",
        r.i_type_contract || "",
        r.pr_code || "",
        r.contract_c_code || "",
        r.c_name || "",
        amt,
        count,
        status,
        r.cost_name || "",
        r.sp_emp || "",
      ];

      rowData.forEach((val, ci) => {
        const cell  = sheet.getCell(exRow, ci + 1);
        const [, , align] = COLS_DEF[ci];
        cell.value     = val;
        cell.fill      = bgFill;
        cell.border    = borderThin;
        cell.alignment = { horizontal:align, vertical:"middle", wrapText: ci === 6 };

        // Column-specific formatting
        if (ci === 0) {
          cell.font = { name:"Arial", size:9, color:{argb:"FF888888"} };
        } else if (ci === 7) {
          // Amount
          cell.numFmt = '#,##0.00';
          cell.font   = { name:"Arial", size:10, bold:true, color:{argb:CLR.numColor} };
        } else if (ci === 8) {
          // Contract count
          cell.numFmt = '#,##0';
          cell.font   = { name:"Arial", size:10, color:{argb:"FF17648D"} };
        } else if (ci === 9) {
          // Status badge via cell style
          cell.font = { name:"Arial", size:10, bold:true,
                        color:{argb: isDone ? CLR.success : CLR.pending} };
          cell.fill = { type:"pattern", pattern:"solid",
                        fgColor:{argb: isDone ? CLR.successBg : CLR.pendingBg} };
        } else {
          cell.font = { name:"Arial", size:10 };
        }
      });
      // ── Auto row height based on project name (col index 6) ────
      const PROJECT_COL_WIDTH = 50;   // matches COLS_DEF width
      const LINE_HEIGHT_PT    = 14;   // pt per line
      const PADDING_PT        = 8;    // top+bottom padding
      const projectText       = String(r.c_name || "");
      const charsPerLine      = Math.floor(PROJECT_COL_WIDTH * 1.6);
      const lines             = Math.max(1, Math.ceil(projectText.length / charsPerLine));
      const calcHeight        = Math.max(22, lines * LINE_HEIGHT_PT + PADDING_PT);
      sheet.getRow(exRow).height = calcHeight;
    });

    // ── Footer / Summary ──────────────────────────────────────────
    const footRow = CURRENT_DETAIL_ROWS.length + 4;
    sheet.mergeCells(footRow, 1, footRow, 6);
    const fLabel = sheet.getCell(footRow, 1);
    fLabel.value     = "รวมทั้งหมด";
    fLabel.font      = { name:"Arial", bold:true, size:11, color:{argb:CLR.footerFont} };
    fLabel.fill      = { type:"pattern", pattern:"solid", fgColor:{argb:CLR.footerBg} };
    fLabel.alignment = { horizontal:"right", vertical:"middle" };
    fLabel.border    = borderThin;

    const fAmt = sheet.getCell(footRow, 7);  // col 7 = วงเงิน (col H)
    fAmt.value     = totalAmt;
    fAmt.numFmt    = '#,##0.00';
    fAmt.font      = { name:"Arial", bold:true, size:11, color:{argb:CLR.footerFont} };
    fAmt.fill      = { type:"pattern", pattern:"solid", fgColor:{argb:CLR.footerBg} };
    fAmt.alignment = { horizontal:"right", vertical:"middle" };
    fAmt.border    = borderThin;

    const fCnt = sheet.getCell(footRow, 8);  // col 8 = จำนวนสัญญา
    fCnt.value     = totalContracts;
    fCnt.numFmt    = '#,##0';
    fCnt.font      = { name:"Arial", bold:true, size:11, color:{argb:CLR.footerFont} };
    fCnt.fill      = { type:"pattern", pattern:"solid", fgColor:{argb:CLR.footerBg} };
    fCnt.alignment = { horizontal:"center", vertical:"middle" };
    fCnt.border    = borderThin;

    for (let ci = 9; ci <= numCols; ci++) {
      const cell = sheet.getCell(footRow, ci);
      cell.fill   = { type:"pattern", pattern:"solid", fgColor:{argb:CLR.footerBg} };
      cell.border = borderThin;
    }
    sheet.getRow(footRow).height = 24;

    // ── Auto-filter ───────────────────────────────────────────────
    sheet.autoFilter = { from:{row:3,column:1}, to:{row:3,column:numCols} };

    // ── Download ──────────────────────────────────────────────────
    const buffer = await workbook.xlsx.writeBuffer();
    const blob   = new Blob([buffer], { type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement("a");
    a.href = url; a.download = `${CURRENT_DETAIL_TITLE}_${YEAR_TH}.xlsx`;
    a.click(); URL.revokeObjectURL(url);
  }

  // ============================================================
  // [แก้ไข] renderDetailTable — เพิ่ม stepper, จำนวนสัญญา, สถานะ
  // ============================================================
  function renderDetailTable(rows, statusId, typeIdx) {
    const $div = $("#detailContent");
    $div.empty();

    const statusName = STATUS_NAMES[statusId] || "Unknown";
    const typeLabel  = (TOR_TYPES[typeIdx - 1] || {}).label || "ทั้งหมด";
    const isDark     = document.body.classList.contains("dark-mode");

    // ----------------------------------------------------------
    // [เพิ่มใหม่] Stepper — แสดงขั้นตอนการดำเนินงาน
    // ----------------------------------------------------------
    let stepHtml = `
      <div class="d-flex align-items-center flex-wrap mb-3 p-2 rounded"
           style="background:${isDark ? '#2c2c2c' : '#f8f9fa'};gap:4px;">
        <small class="font-weight-bold mr-2" style="color:${isDark?'#ccc':'#555'};">ขั้นตอน:</small>`;

    const stepOrder = [8, 9, 10, 11, 12, 13];
    stepOrder.forEach((sid, idx) => {
      const step     = STEP_FLOW.find(s => s.id === sid);
      const isActive = sid === statusId;
      const isDone   = stepOrder.indexOf(sid) < stepOrder.indexOf(statusId);

      let bg, color;
      if (isDone) {
        bg    = step.colorDone;
        color = "#fff";
      } else if (isActive) {
        bg    = step.colorActive;
        color = "#fff";
      } else {
        bg    = isDark ? "#3a3a3a" : "#dee2e6";
        color = isDark ? "#999"    : "#6c757d";
      }

      stepHtml += `
        <span style="background:${bg};color:${color};padding:5px 12px;
                     border-radius:20px;font-size:0.78rem;font-weight:600;
                     white-space:nowrap;border:2px solid ${isActive ? '#fff' : 'transparent'};">
          ${step.icon} ${step.label}
        </span>`;

      if (idx < stepOrder.length - 1) {
        stepHtml += `<span style="color:${isDark?'#777':'#aaa'};font-size:1rem;">›</span>`;
      }
    });
    stepHtml += `</div>`;

    // ----------------------------------------------------------
    // Header Info
    // ----------------------------------------------------------
    let html = `
      <h5 class="mb-2 text-primary font-weight-bold">
        สถานะ: <span class="text-dark">${statusName}</span> |
        วิธี:  <span class="text-dark">${typeLabel}</span>
        <small class="text-muted">(${rows.length} รายการ)</small>
      </h5>`;

    html += stepHtml;

    // ----------------------------------------------------------
    // [เพิ่มใหม่] สรุปยอดสัญญาและสถานะ
    // ----------------------------------------------------------
    const totalContracts   = rows.reduce((s, r) => s + Number(r.contract_count || 0), 0);
    const countDone        = rows.filter(r => (r.process_status || "") === "สำเร็จ").length;
    const countPending     = rows.length - countDone;

    html += `
      <div class="d-flex flex-wrap mb-3" style="gap:10px;">
        <div class="p-2 rounded text-center" style="background:#007bff20;min-width:120px;">
          <div style="font-size:1.4rem;font-weight:700;color:#007bff;">${rows.length.toLocaleString()}</div>
          <small>รายการทั้งหมด</small>
        </div>
        <div class="p-2 rounded text-center" style="background:#17a2b820;min-width:120px;">
          <div style="font-size:1.4rem;font-weight:700;color:#17a2b8;">${totalContracts.toLocaleString()}</div>
          <small>จำนวนสัญญา (รวม)</small>
        </div>
        <div class="p-2 rounded text-center" style="background:#ffc10720;min-width:120px;">
          <div style="font-size:1.4rem;font-weight:700;color:#e6a800;">${countPending.toLocaleString()}</div>
          <small>⏳ รอดำเนินการ</small>
        </div>
        <div class="p-2 rounded text-center" style="background:#28a74520;min-width:120px;">
          <div style="font-size:1.4rem;font-weight:700;color:#28a745;">${countDone.toLocaleString()}</div>
          <small>✅ สำเร็จ</small>
        </div>
      </div>`;

    // ----------------------------------------------------------
    // Table
    // ----------------------------------------------------------
    const tableClass = isDark
      ? "table table-bordered table-striped table-sm table-dark"
      : "table table-bordered table-striped table-sm";

    html += `
      <table class="${tableClass}" style="font-size:0.9rem;">
        <thead class="thead-dark">
          <tr>
            <th class="text-center" style="width:45px;">#</th>
            <th class="text-center text-nowrap" style="width:75px;">ปีงบฯ</th>
            <th class="text-center text-nowrap" style="width:130px;">ประเภทสินทรัพย์</th>
            <th class="text-center text-nowrap" style="width:110px;">ประเภทสัญญา</th>
            <th class="text-center text-nowrap" style="width:150px;">เลขที่ PR</th>
            <th class="text-center text-nowrap" style="width:150px;">เลขที่สัญญา</th>
            <th class="text-center">ชื่อโครงการ</th>
            <th class="text-right text-nowrap"  style="width:120px;">วงเงิน (บาท)</th>
            <th class="text-center text-nowrap" style="width:100px;">จำนวนสัญญา</th>
            <th class="text-center text-nowrap" style="width:120px;">สถานะดำเนินงาน</th>
            <th class="text-center text-nowrap" style="width:140px;">หน่วยงาน</th>
            <th class="text-center text-nowrap" style="width:120px;">ผู้รับผิดชอบ</th>
          </tr>
        </thead>
        <tbody>`;

    let totalAmt = 0;
    rows.forEach((r, idx) => {
      const amt            = Number(r.total_amt || 0);
      totalAmt            += amt;
      const contractCount  = Number(r.contract_count || 0);
      const procStatus     = r.process_status || "รอดำเนินการ";
      const isDoneRow      = procStatus === "สำเร็จ";

      // Badge สถานะ
      const statusBadge = isDoneRow
        ? `<span class="badge badge-success" style="font-size:0.8rem;">✅ สำเร็จ</span>`
        : `<span class="badge badge-warning text-dark" style="font-size:0.8rem;">⏳ รอดำเนินการ</span>`;

      // Badge จำนวนสัญญา
      const contractBadge = contractCount > 0
        ? `<span class="badge badge-info" style="font-size:0.85rem;">${contractCount} สัญญา</span>`
        : `<span class="text-muted">-</span>`;

      html += `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-center">${r.i_yyyy || "-"}</td>
          <td>${r.i_product_type_name || r.i_product_type || "-"}</td>
          <td class="text-center">${r.i_type_contract || "-"}</td>
          <td>${r.pr_code || "-"}</td>
          <td>${r.contract_c_code || "-"}</td>
          <td>${r.c_name || "-"}</td>
          <td class="text-right text-success font-weight-bold">${amt.toLocaleString()}</td>
          <td class="text-center">${contractBadge}</td>
          <td class="text-center">${statusBadge}</td>
          <td>${r.cost_name || "-"}</td>
          <td>${r.sp_emp || "-"}</td>
        </tr>`;
    });

    html += `
        </tbody>
        <tfoot>
          <tr class="bg-light font-weight-bold">
            <td colspan="7" class="text-right">รวมทั้งหมด</td>
            <td class="text-right text-primary">${totalAmt.toLocaleString()}</td>
            <td class="text-center text-info">${totalContracts.toLocaleString()} สัญญา</td>
            <td colspan="3"></td>
          </tr>
        </tfoot>
      </table>`;

    $div.html(html);
  }

  // --- Dark Mode ---
  function initDarkMode() {
    const isDark = localStorage.getItem("budget_dark_mode") === "on";
    toggleDark(isDark);

    $("#darkToggle")
      .prop("checked", isDark)
      .on("change", function () {
        toggleDark($(this).prop("checked"));
      });
  }

  function toggleDark(isDark) {
    document.body.classList.toggle("dark-mode", !!isDark);
    localStorage.setItem("budget_dark_mode", isDark ? "on" : "off");

    $(".table").toggleClass("table-dark", !!isDark);
    $(".form-control").toggleClass("bg-dark text-white", !!isDark);
    $(".modal-content").toggleClass("bg-dark text-white", !!isDark);
    $(".modal-header .close").toggleClass("text-white", !!isDark);

    const textColor   = isDark ? "#e0e0e0" : "#333";
    const borderColor = isDark ? "#1e1e1e" : "#fff";

    CHART_INSTANCES.forEach((chart) => {
      chart.setOption({
        legend: { textStyle: { color: textColor } },
        series: [{ itemStyle: { borderColor }, label: { color: textColor } }],
      });
    });
  }

  // --- Loading ---
  const startLoading = () => {
    $("#loading-overlay").fadeIn(100);
    $("#loading-bar").css("width", "0%").text("0%");

    let pct = 0;
    if (LOAD_INTERVAL) clearInterval(LOAD_INTERVAL);
    LOAD_INTERVAL = setInterval(() => {
      pct += 5;
      if (pct > 90) pct = 90;
      $("#loading-bar").css("width", pct + "%");
      $("#loading-pct").text(pct + "%");
    }, 50);
  };

  const stopLoading = () => {
    if (LOAD_INTERVAL) clearInterval(LOAD_INTERVAL);
    $("#loading-bar").css("width", "100%");
    $("#loading-pct").text("100%");
    setTimeout(() => $("#loading-overlay").fadeOut(300), 300);
  };

  // --- Export Main Table (Styled with ExcelJS) ---
  window.exportExcel = async function () {
    if (typeof ExcelJS === "undefined") {
      // Fallback: load ExcelJS dynamically
      await new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js";
        s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    const workbook  = new ExcelJS.Workbook();
    workbook.creator = "Smart Procurement Monitoring";
    workbook.created  = new Date();

    const sheet = workbook.addWorksheet("Status_Report", {
      views: [{ state: "frozen", ySplit: 3 }],
    });

    // ── Color Palette ──────────────────────────────────────────────
    const CLR = {
      headerBg:   "FF1A4F8B",   // navy blue
      headerFont: "FFFFFFFF",
      titleBg:    "FF2E75B6",
      titleFont:  "FFFFFFFF",
      altRow:     "FFF0F5FF",
      footerBg:   "FFD9E1F2",
      footerFont: "FF1A4F8B",
      border:     "FFB8CCE4",
      green:      "FF1E8449",
      greenBg:    "FFD5F5E3",
      blue:       "FF1A4F8B",
      blueBg:     "FFDBEAFE",
    };

    const borderThin = {
      top:    { style: "thin",   color: { argb: CLR.border } },
      left:   { style: "thin",   color: { argb: CLR.border } },
      bottom: { style: "thin",   color: { argb: CLR.border } },
      right:  { style: "thin",   color: { argb: CLR.border } },
    };
    const borderMedium = {
      top:    { style: "medium", color: { argb: "FF1A4F8B" } },
      left:   { style: "medium", color: { argb: "FF1A4F8B" } },
      bottom: { style: "medium", color: { argb: "FF1A4F8B" } },
      right:  { style: "medium", color: { argb: "FF1A4F8B" } },
    };

    // ── Title Row ─────────────────────────────────────────────────
    const COLS = 8;
    sheet.mergeCells(1, 1, 1, COLS);
    const titleCell = sheet.getCell(1, 1);
    titleCell.value = `ตารางสรุปข้อมูลสถานะการดำเนินงาน แต่ละวิธีการดำเนินงาน — ปีงบประมาณ พ.ศ. ${YEAR_TH}`;
    titleCell.font      = { name: "Arial", bold: true, size: 14, color: { argb: CLR.titleFont } };
    titleCell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: CLR.titleBg } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.border    = borderMedium;
    sheet.getRow(1).height = 30;

    sheet.mergeCells(2, 1, 2, COLS);
    const subCell = sheet.getCell(2, 1);
    subCell.value = `ส่งออกเมื่อ: ${new Date().toLocaleString("th-TH")}`;
    subCell.font      = { name: "Arial", italic: true, size: 10, color: { argb: "FF555555" } };
    subCell.alignment = { horizontal: "center", vertical: "middle" };
    subCell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F7FF" } };
    sheet.getRow(2).height = 18;

    // ── Header Row ────────────────────────────────────────────────
    const headers = ["#", "สถานะ (Status)", "E-Bidding", "วิธีคัดเลือก", "เฉพาะเจาะจง (< 500k)", "เฉพาะเจาะจง (> 500k)", "E-Market", "สรุปรวม"];
    const colWidths = [6, 30, 18, 18, 22, 22, 14, 14];
    headers.forEach((h, ci) => {
      const cell = sheet.getCell(3, ci + 1);
      cell.value     = h;
      cell.font      = { name: "Arial", bold: true, size: 11, color: { argb: CLR.headerFont } };
      cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: CLR.headerBg } };
      cell.alignment = { horizontal: ci < 2 ? "left" : "center", vertical: "middle", wrapText: true };
      cell.border    = borderThin;
      sheet.getColumn(ci + 1).width = colWidths[ci];
    });
    sheet.getRow(3).height = 28;

    // ── Data Rows ─────────────────────────────────────────────────
    const tbody = document.getElementById("table-body");
    if (!tbody) { alert("ไม่พบข้อมูลตาราง"); return; }

    const trows = Array.from(tbody.querySelectorAll("tr"));
    trows.forEach((tr, ri) => {
      const excelRow = ri + 4;
      const tds = Array.from(tr.querySelectorAll("td"));
      const isAlt = ri % 2 === 1;

      tds.forEach((td, ci) => {
        const cell  = sheet.getCell(excelRow, ci + 1);
        const raw   = td.innerText.trim().replace(/,/g, "");
        const num   = parseFloat(raw);
        cell.value  = (!isNaN(num) && raw !== "" && raw !== "-") ? num : (raw === "-" ? "" : raw);
        cell.font   = { name: "Arial", size: 10 };
        cell.fill   = { type: "pattern", pattern: "solid", fgColor: { argb: isAlt ? CLR.altRow : "FFFFFFFF" } };
        cell.border = borderThin;

        if (ci === 0) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.font = { name: "Arial", size: 10, color: { argb: "FF888888" } };
        } else if (ci === 1) {
          cell.alignment = { horizontal: "left", vertical: "middle" };
          cell.font = { name: "Arial", size: 10, bold: true };
        } else {
          cell.alignment = { horizontal: "center", vertical: "middle" };
          if (!isNaN(num) && num > 0) {
            cell.numFmt = '#,##0';
            cell.font   = { name: "Arial", size: 10, color: { argb: CLR.blue }, bold: true };
          }
        }
      });
      sheet.getRow(excelRow).height = 22;
    });

    // ── Footer Row ────────────────────────────────────────────────
    const tfoot = document.getElementById("table-foot");
    if (tfoot) {
      const ftrow = tfoot.querySelector("tr");
      if (ftrow) {
        const footerRow = trows.length + 4;
        const ftds = Array.from(ftrow.querySelectorAll("td"));
        let ci = 0;
        ftds.forEach((td) => {
          const colspan = parseInt(td.getAttribute("colspan") || 1);
          const cell    = sheet.getCell(footerRow, ci + 1);
          if (colspan > 1) sheet.mergeCells(footerRow, ci + 1, footerRow, ci + colspan);
          const raw  = td.innerText.trim().replace(/,/g, "");
          const num  = parseFloat(raw);
          cell.value = (!isNaN(num) && raw !== "" && raw !== "-") ? num : raw;
          cell.font  = { name: "Arial", bold: true, size: 11, color: { argb: CLR.footerFont } };
          cell.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: CLR.footerBg } };
          cell.alignment = { horizontal: ci === 0 ? "right" : "center", vertical: "middle" };
          if (!isNaN(num) && num > 0) cell.numFmt = '#,##0';
          cell.border = borderThin;
          ci += colspan;
        });
        sheet.getRow(footerRow).height = 24;
      }
    }

    // ── Auto-filter ───────────────────────────────────────────────
    sheet.autoFilter = { from: { row: 3, column: 1 }, to: { row: 3, column: COLS } };

    // ── Download ──────────────────────────────────────────────────
    const buffer = await workbook.xlsx.writeBuffer();
    const blob   = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement("a");
    a.href = url; a.download = `Procurement_Status_${YEAR_TH}.xlsx`;
    a.click(); URL.revokeObjectURL(url);
  };

})();