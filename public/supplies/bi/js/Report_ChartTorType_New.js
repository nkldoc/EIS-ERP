/**
 * Report_ChartTorType_New.js
 * Modernized version of Procurement Method Report
 */

(function () {
  // --- Globals ---
  let RAW_DATA = [];
  let CHART_INSTANCES = []; // [pick1, pic2, pick3, pick4]
  let YEAR_TH = window.PHP_YEAR_TH || new Date().getFullYear() + 543;
  let YEAR_EN = YEAR_TH - 543;
  let COST_ID_KEY = null;
  let COST_NAME_KEY = null;
  let LOAD_INTERVAL = null;

  // --- Constants ---
  const TOR_TYPES = [
    { field: "i_tor_type1", label: "วิธีประกวดราคาอิเล็กทรอนิกส์ (E-Bidding)", color: "#4e73df" }, // Blue
    { field: "i_tor_type2", label: "วิธีคัดเลือก", color: "#1cc88a" }, // Green
    { field: "i_tor_type3", label: "วิธีเฉพาะเจาะจง (ไม่เกิน 5 แสน)", color: "#f6c23e" }, // Yellow
    { field: "i_tor_type4", label: "วิธีเฉพาะเจาะจง (เกิน 5 แสน)", color: "#e74a3b" }, // Red
    { field: "i_tor_type5", label: "E-Market", color: "#36b9cc" }, // Cyan
    { field: "i_tor_type6", label: "สรุปรวม", color: "#858796" }, // Gray
  ];

  // --- Initialization ---
  $(document).ready(function () {
    startLoading(); // Show immediately

    initData();
    initFilters();
    initDarkMode();

    // Initial Render
    setTimeout(() => {
      populateAssetFilters(RAW_DATA);
      renderDashboard(RAW_DATA);
      stopLoading();
    }, 500); // Small delay to ensure UI is ready
  });

  // --- Data Parsing ---
  function initData() {
    try {
      let jsonStr = window.INJECTED_DATA || '{"year_th":2568,"data":[]}';
      if (typeof jsonStr === "object") jsonStr = JSON.stringify(jsonStr);
      const parsed = JSON.parse(jsonStr);

      RAW_DATA = parsed.data || [];

      // Use PHP year if available, else from JSON
      if (parsed.year_th) YEAR_TH = parsed.year_th;
      YEAR_EN = YEAR_TH - 543;

      // Detect Cost Fields
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

    // Find ID key
    keys.forEach((k) => {
      const lower = k.toLowerCase();
      if (!COST_ID_KEY && lower.includes("cost") && lower.includes("id")) COST_ID_KEY = k;
    });

    // Find Name key
    if (keys.includes("cost_name")) COST_NAME_KEY = "cost_name";
    else if (keys.includes("c_name")) COST_NAME_KEY = "c_name";
    else if (keys.includes("c_cost_name")) COST_NAME_KEY = "c_cost_name";
  }

  function getCostId(row) {
    if (!row || !COST_ID_KEY) return null;
    return row[COST_ID_KEY] ? String(row[COST_ID_KEY]) : null;
  }

  // --- Filter Logic ---
  function initFilters() {
    // 1. Year Filter (Reloads Page)
    const $year = $("#budget_year_filter");
    const currentYearTh = new Date().getFullYear() + 543; // ปีไทยปัจจุบัน
    for (let th = currentYearTh - 3; th <= currentYearTh + 1; th++) {
      $year.append(new Option(`พ.ศ. ${th}`, th));
    }

    // Ensure value is set after options are added
    setTimeout(() => {
      $year.val(YEAR_TH).selectpicker("refresh");
    }, 0);

    $year.on("changed.bs.select", function () {
      startLoading();
      const val = $(this).val();
      window.location.href = `?year_th=${val}`;
    });

    // 2. Section Filter (Client Side)
    const $sec = $("#cost_sys_main_filter");
    if ($sec.length) {
      $sec.append(new Option("ทุกส่วนงาน", "all"));

      if (RAW_DATA.length) {
        const map = {};
        RAW_DATA.forEach((r) => {
          const id = getCostId(r);
          const name = r[COST_NAME_KEY] || r.c_name || "-";
          if (id) map[id] = name;
        });

        Object.keys(map).forEach((id) => {
          $sec.append(new Option(map[id], id));
        });
      }

      // Default to "all" and refresh
      setTimeout(() => {
        $sec.val("all").selectpicker("refresh");
      }, 0);

      $sec.on("changed.bs.select", function () {
        const val = $(this).val();
        filterData(val);
      });
    }

    // 3. Responsible Person Filter (Client Side)
    const $resp = $("#responsible_filter");
    if ($resp.length && RAW_DATA.length) {
      const respSet = new Set();
      RAW_DATA.forEach((r) => {
        if (r.sp_emp) respSet.add(r.sp_emp);
      });

      Array.from(respSet)
        .sort()
        .forEach((name) => {
          $resp.append(new Option(name, name));
        });

      setTimeout(() => {
        $resp.val("all").selectpicker("refresh");
      }, 0);

      $resp.on("changed.bs.select", function () {
        renderDashboard(RAW_DATA);
      });
    }
  }

  function filterData(sectionId) {
    startLoading();
    setTimeout(() => {
      renderDashboard(RAW_DATA);
      stopLoading();
    }, 200);
  }

  // --- Status Name Mapping (Client Side) ---
  const STATUS_NAMES = {
    8: "รอดำเนินการ",
    9: "อยู่ระหว่างดำเนินการ",
    10: "บริหารสัญญา",
    11: "ตรวจรับพัสดุ",
    12: "ขออนุมัติเบิกจ่ายเงิน",
    13: "เบิกจ่ายเงินแล้ว",
  };

  // --- Core Logic: Aggregate & Render ---

  function populateAssetFilters(data) {
    const types = new Set();
    data.forEach((r) => {
      const t = r.i_product_type_name || r.i_product_type;
      if (t) types.add(t);
    });

    const $sel = $("#asset_type_filter");

    // จำค่าที่เลือกอยู่ก่อน refresh
    const currentVal = $sel.val() || "all";

    // Keep "All" option
    $sel.find("option:not([value='all'])").remove();

    Array.from(types)
      .sort()
      .forEach((t) => {
        $sel.append(`<option value="${t}">${t}</option>`);
      });

    // คืนค่าที่เคยเลือกไว้ ถ้ายังมีอยู่ ไม่งั้นใช้ "all"
    $sel.val(currentVal);
    $sel.selectpicker("refresh");

    // Bind Events (ใช้ changed.bs.select แทน change เพื่อรองรับ selectpicker)
    $("#asset_type_filter, #responsible_filter")
      .off("changed.bs.select")
      .on("changed.bs.select", function () {
        renderDashboard(RAW_DATA);
      });

    $("#search_filter")
      .off("keyup input")
      .on("keyup input", function () {
        renderDashboard(RAW_DATA);
      });
  }

  // --- Render Dashboard ---
  function renderDashboard(allRows) {
    // 1. apply Filters
    const assetFilter = $("#asset_type_filter").val();
    const searchFilter = $("#search_filter").val().toLowerCase().trim();
    const sectionFilter = $("#cost_sys_main_filter").val();
    const responsibleFilter = $("#responsible_filter").val();

    const rows = allRows.filter((r) => {
      // Asset Type
      if (assetFilter && assetFilter !== "all") {
        const t = r.i_product_type_name || r.i_product_type;
        if (t !== assetFilter) return false;
      }

      // Section (re-apply here for consistency)
      if (sectionFilter && sectionFilter !== "all") {
        if (getCostId(r) !== sectionFilter) return false;
      }

      // Responsible Person
      if (responsibleFilter && responsibleFilter !== "all") {
        if ((r.sp_emp || "") !== responsibleFilter) return false;
      }

      // Search
      if (searchFilter) {
        const text = `${r.c_name} ${r.contract_c_code} ${r.pr_code}`.toLowerCase();
        if (!text.includes(searchFilter)) return false;
      }

      return true;
    });

    const statusMap = {};

    // Initialize all known statuses to ensure order/presence
    [8, 9, 10, 11, 12, 13].forEach((id) => {
      statusMap[id] = {
        id: id,
        name: STATUS_NAMES[id] || "Unknown",
        types: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
        rowRef: null,
      };
    });

    rows.forEach((r) => {
      const statusId = r.status_group_id;
      const typeId = r.tor_type_id;

      // Safety check
      if (!statusMap[statusId]) return;

      // Keep a reference for Cost ID drilldown
      statusMap[statusId].rowRef = r;

      // Increment Type Count
      let targetType = 0;
      const amt = Number(r.total_amt || 0);

      if (typeId == 4) targetType = 1;
      else if (typeId == 3) targetType = 2;
      else if (typeId == 1) {
        if (amt < 500000) targetType = 3;
        else targetType = 4;
      } else if (typeId == 2) targetType = 5;

      if (targetType > 0) {
        statusMap[statusId].types[targetType]++;
        statusMap[statusId].types[6]++; // Sum column
      }
    });

    const aggData = Object.values(statusMap);

    // 2. Render Charts (4 Pies)
    renderCharts(aggData);

    // 3. Render Table
    renderTable(aggData);
  }

  function renderCharts(aggData) {
    const isDark = document.body.classList.contains("dark-mode");
    const textColor = isDark ? "#e0e0e0" : "#333";

    // We need 4 charts: Types 1, 2, 3, 4
    // For each chart, data is distribution of "Status" (aggData items) based on that Type's value

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

      // prepare data: name=Status, value=Type[i]
      const pieData = aggData
        .map((d) => ({
          name: d.name,
          value: d.types[i],
          statusId: d.id,
          costId: getCostId(d.rowRef),
        }))
        .filter((p) => p.value > 0);

      const option = {
        backgroundColor: "transparent",
        tooltip: {
          trigger: "item",
          formatter: "{b}: {c} ({d}%)",
        },
        legend: {
          type: "scroll",
          bottom: 0,
          textStyle: { color: textColor, fontFamily: "Sarabun, sans-serif" },
        },
        textStyle: {
          fontFamily: "Sarabun, sans-serif",
        },
        toolbox: {
          feature: { saveAsImage: { title: "บันทึกภาพ" } },
        },
        series: [
          {
            name: TOR_TYPES[i - 1].label,
            type: "pie",
            radius: ["40%", "70%"],
            center: ["50%", "45%"],
            itemStyle: {
              borderRadius: 5,
              borderColor: isDark ? "#1e1e1e" : "#fff",
              borderWidth: 2,
            },
            label: {
              show: true,
              formatter: "{d}%",
              color: textColor,
            },
            data: pieData,
          },
        ],
      };

      instance.setOption(option);

      // Add Click Event
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
        const val = item.types[i];
        sums[i] += val;

        // Click to drift down (Legacy: openDetail)
        // We need `getCostId` from an aggregated item.
        // Aggregated item merges many rows, so costId is ambiguous if "All" is selected.
        // But legacy code does `getCostId(item)` where item is aggregated.
        // This implies legacy aggregation might keep the first costId encountered?
        // Let's use `getCostId(item.rowRef)` as best effort.
        const costId = getCostId(item.rowRef) || "";

        tds += `<td class="text-center">
                    <span class="clickable" onclick="openDetail('${item.id}', '${val}', 'i_tor_type${i}', '${costId}')">
                        ${val > 0 ? Number(val).toLocaleString() : "-"}
                    </span>
                </td>`;
      }
      $tbody.append(`<tr>${tds}</tr>`);
    });

    // Footer Sums
    let footerHtml = `<tr>
            <td colspan="2" class="text-right">รวมทั้งหมด</td>`;
    for (let i = 1; i <= 6; i++) {
      footerHtml += `<td class="text-center text-primary">${Number(sums[i]).toLocaleString()}</td>`;
    }
    footerHtml += `</tr>`;
    $tfoot.append(footerHtml);
  }

  // --- Helper: Drilldown ---
  // Matches legacy `openDetail` signature roughly but simplified
  // --- Helper: Drilldown (Client Side) ---
  let CURRENT_DETAIL_ROWS = [];
  let CURRENT_DETAIL_TITLE = "";

  window.openDetail = function (statusId, val, fieldKey, costId) {
    if (!val || val == 0 || val == "-") return;

    // 1. Determine Type Filter
    const typeIdx = parseInt(fieldKey.replace("i_tor_type", ""));

    // 2. Check Global Section Filter & New Filters
    const globalSection = $("#cost_sys_main_filter").val(); // 'all' or specific ID
    const assetFilter = $("#asset_type_filter").val();
    const searchFilter = $("#search_filter").val().toLowerCase().trim();
    const responsibleFilter = $("#responsible_filter").val();

    // 3. Filter RAW_DATA
    const filtered = RAW_DATA.filter((r) => {
      // Status Check
      if (r.status_group_id != statusId) return false;

      // Section Check
      if (globalSection && globalSection !== "all") {
        if (getCostId(r) !== globalSection) return false;
      }

      // Asset Type Check
      if (assetFilter && assetFilter !== "all") {
        const t = r.i_product_type_name || r.i_product_type;
        if (t !== assetFilter) return false;
      }

      // Responsible Person Check
      if (responsibleFilter && responsibleFilter !== "all") {
        if ((r.sp_emp || "") !== responsibleFilter) return false;
      }

      // Search Check
      if (searchFilter) {
        const text = `${r.c_name} ${r.contract_c_code} ${r.pr_code}`.toLowerCase();
        if (!text.includes(searchFilter)) return false;
      }

      // Type Check
      const typeId = Number(r.tor_type_id);
      const amt = Number(r.total_amt || 0);

      let calculatedType = 0;
      if (typeId == 4)
        calculatedType = 1; // E-Bidding
      else if (typeId == 3)
        calculatedType = 2; // Selection
      else if (typeId == 1) {
        // Specific
        if (amt < 500000) calculatedType = 3;
        else calculatedType = 4;
      } else if (typeId == 2) calculatedType = 5; // E-Market

      if (typeIdx !== 6 && calculatedType !== typeIdx) return false;

      return true;
    });

    // Save for Export
    CURRENT_DETAIL_ROWS = filtered;
    const statusName = STATUS_NAMES[statusId] || "Unknown";
    const typeLabel = (TOR_TYPES[typeIdx - 1] || {}).label || "ทั้งหมด";
    CURRENT_DETAIL_TITLE = `รายละเอียด_${statusName}_${typeLabel}`;

    // Bind Export Button
    $("#btnExportDetail")
      .off("click")
      .on("click", function () {
        exportDetailExcel();
      });

    renderDetailTable(filtered, statusId, typeIdx);
    $("#detailModal").modal("show");
  };

  function exportDetailExcel() {
    if (!CURRENT_DETAIL_ROWS || !CURRENT_DETAIL_ROWS.length) return;

    const wb = XLSX.utils.book_new();

    // Map data to clean object
    const data = CURRENT_DETAIL_ROWS.map((r, i) => ({
      ลำดับ: i + 1,
      ปีงบประมาณ: r.i_yyyy,
      ประเภทสินทรัพย์: r.i_product_type_name || r.i_product_type,
      ประเภทสัญญา: r.i_type_contract,
      "เลขที่ PR": r.pr_code,
      เลขที่สัญญา: r.contract_c_code,
      ชื่อโครงการ: r.c_name,
      "วงเงิน (บาท)": Number(r.total_amt || 0),
      หน่วยงาน: r.cost_name,
      ผู้รับผิดชอบ: r.sp_emp,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Details");
    XLSX.writeFile(wb, `${CURRENT_DETAIL_TITLE}_${YEAR_TH}.xlsx`);
  }

  function renderDetailTable(rows, statusId, typeIdx) {
    const $div = $("#detailContent");
    $div.empty();

    // Header Info
    const statusName = STATUS_NAMES[statusId] || "Unknown";
    const typeLabel = (TOR_TYPES[typeIdx - 1] || {}).label || "ทั้งหมด";

    let html = `<h5 class="mb-3 text-primary font-weight-bold">
                    สถานะ: <span class="text-dark">${statusName}</span> | 
                    วิธี: <span class="text-dark">${typeLabel}</span> 
                    <small class="text-muted">(${rows.length} รายการ)</small>
                  </h5>`;

    // Check Dark Mode
    const isDark = document.body.classList.contains("dark-mode");
    const tableClass = isDark ? "table table-bordered table-striped table-sm table-dark" : "table table-bordered table-striped table-sm";

    html += `<table class="${tableClass}" style="font-size:0.9rem;">
                <thead class="thead-dark">
                    <tr>
                        <th class="text-center" style="width:50px;">#</th>
                        <th class="text-center text-nowrap" style="width:80px;">ปีงบฯ</th>
                        <th class="text-center text-nowrap" style="width:120px;">ประเภทสินทรัพย์</th>
                        <th class="text-center text-nowrap" style="width:120px;">ประเภทสัญญา</th>
                        <th class="text-center text-nowrap" style="width:150px;">เลขที่ PR</th>
                        <th class="text-center text-nowrap" style="width:150px;">เลขที่สัญญา</th>

                        <th class="text-center">ชื่อโครงการ</th>
                        <th class="text-right text-nowrap" style="width:120px;">วงเงิน (บาท)</th>
                        <th class="text-center text-nowrap" style="width:150px;">หน่วยงาน</th>
                        <th class="text-center text-nowrap" style="width:120px;">ผู้รับผิดชอบ</th>
                    </tr>
                </thead>
                <tbody>`;

    let total = 0;
    rows.forEach((r, idx) => {
      const amt = Number(r.total_amt || 0);
      total += amt;

      html += `<tr>
                    <td class="text-center">${idx + 1}</td>
                    <td class="text-center">${r.i_yyyy || "-"}</td>
                    <td>${r.i_product_type_name || r.i_product_type || "-"}</td>
                    <td class="text-center">${r.i_type_contract || "-"}</td>
                    <td>${r.pr_code || "-"}</td>
                    <td>${r.contract_c_code || "-"}</td>
                    <td>${r.c_name || "-"}</td>
                    <td class="text-right text-success font-weight-bold">${amt.toLocaleString()}</td>
                    <td>${r.cost_name || "-"}</td>
                    <td>${r.sp_emp || "-"}</td>
                   </tr>`;
    });

    html += `</tbody>
               <tfoot>
                    <tr class="bg-light font-weight-bold">
                        <td colspan="7" class="text-right">รวมทั้งหมด</td>
                        <td class="text-right text-primary">${total.toLocaleString()}</td>
                        <td colspan="2"></td>
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

    // Toggle Table Dark
    $(".table").toggleClass("table-dark", !!isDark);

    // Toggle Form Inputs
    $(".form-control").toggleClass("bg-dark text-white", !!isDark);

    // Toggle Modal Content
    $(".modal-content").toggleClass("bg-dark text-white", !!isDark);
    $(".modal-header .close").toggleClass("text-white", !!isDark);

    // Update Chart Colors
    const textColor = isDark ? "#e0e0e0" : "#333";
    const borderColor = isDark ? "#1e1e1e" : "#fff";

    CHART_INSTANCES.forEach((chart) => {
      chart.setOption({
        legend: { textStyle: { color: textColor } },
        series: [
          {
            itemStyle: { borderColor: borderColor },
            label: { color: textColor },
          },
        ],
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

  // --- Export ---
  window.exportExcel = function () {
    const wb = XLSX.utils.book_new();

    // Clone table to remove clickable spans / formatting for clean export
    const table = document.getElementById("main-table");
    const ws = XLSX.utils.table_to_sheet(table);

    XLSX.utils.book_append_sheet(wb, ws, "Status_Report");
    XLSX.writeFile(wb, `Procurement_Status_${YEAR_TH}.xlsx`);
  };
})();