/* Key_Performance_Indicator.js */
(function () {
  window.DATA_KPI_RAW = [];
  let KPI_TARGET = 80;
  let kpiChartInstance = null;
  let CURRENT_YEAR_EN = new Date().getFullYear();

  // Inject Modal
  const modalHTML = `
    <div class="modal fade" id="kpiDetailModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-xl" role="document">
            <div class="modal-content">
                <div class="modal-header bg-info text-white">
                    <h5 class="modal-title"><i class="fas fa-list"></i> รายละเอียดรายการ <span id="modalTitleSuffix"></span></h5>
                    <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body p-0">
                    <div class="table-responsive" style="max-height: 70vh; overflow-y: auto;">
                        <table class="table table-striped table-bordered table-sm mb-0" style="font-size: 0.85rem;">
                            <thead class="thead-dark">
                                <tr>
                                    <th class="text-center" width="50">#</th>
                                    <th class="text-center" width="100">เลขที่ PR</th>
                                    <th>เรื่อง/โครงการ</th>
                                    <th width="150">ผู้รับผิดชอบ</th>
                                    <th class="text-center" width="100">วันที่สร้าง</th>
                                    <th class="text-center" width="100">วันที่ลงนาม</th>
                                    <th class="text-center" width="80">ใช้เวลา (วัน)</th>
                                    <th class="text-center" width="100">สถานะ</th>
                                </tr>
                            </thead>
                            <tbody id="kpiDetailBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // --- Load Data ---
  function loadAll(params = {}) {
    const loader = document.getElementById("pageLoader");
    if (loader) loader.style.display = "flex";

    // Get values from filters if not passed
    const year = params.year_en || $("#filter_year").val() || new Date().getFullYear();
    let empId = params.sp_emp_id || $("#filter_emp").val() || 0;

    // Handle Multi-select: if array, join with comma
    if (Array.isArray(empId)) {
      // If "0" (All) is in the array, or array is empty, treat as 0
      if (empId.includes("0") || empId.length === 0) {
        empId = 0;
      } else {
        empId = empId.join(",");
      }
    }

    if (year) CURRENT_YEAR_EN = year;

    $.ajax({
      url: "../api/List_Key_Performance_Indicator.php",
      method: "POST", // POST for safety
      data: {
        fn: "List_QueryParam",
        year_en: year,
        sp_emp_id: empId,
        contract_type: $("#filter_contract_type").val() ? $("#filter_contract_type").val().join(",") : "",
        use_kpi2: $("#useRepKPI2").is(":checked") ? 1 : 0,
        ...params,
      },
      dataType: "text",
      success: function (responseText) {
        try {
          const o = JSON.parse(responseText || "{}");
          window.DATA_KPI_RAW = Array.isArray(o.data) ? o.data : [];

          initFilterMethods();
          recalculateAndRender();
        } catch (e) {
          console.error(e);
        } finally {
          if (loader) loader.style.display = "none";
        }
      },
      error: function () {
        if (loader) loader.style.display = "none";
        alert("เชื่อมต่อ Server ไม่สำเร็จ");
      },
    });
  }

  // --- Init Filters ---
  function initFilterMethods() {
    const $sel = $("#filter_method");
    // Only refresh if empty to keep selection?? Or always refresh?
    // Better check if already populated to avoid resetting user selection if we call loadAll multiple times
    if ($sel.children("option").length > 0 && window.DATA_KPI_RAW.length > 0) return;

    $sel.empty();
    const uniqueMethods = [...new Set(window.DATA_KPI_RAW.map((item) => item.method_name))].sort();
    uniqueMethods.forEach((m) => $sel.append(new Option(m, m)));
    $sel.selectpicker("refresh").selectpicker("selectAll");

    $sel.off("changed.bs.select").on("changed.bs.select", recalculateAndRender);
    $("#kpiTargetInput")
      .off("change")
      .on("change", function () {
        KPI_TARGET = parseFloat(this.value) || 80;
        recalculateAndRender();
      });
  }

  // --- Calculation ---
  function recalculateAndRender() {
    const selectedMethods = $("#filter_method").val() || [];
    // Filter Data logic: JS side filtering is good for quick responsiveness
    const filteredData = window.DATA_KPI_RAW.filter((item) => selectedMethods.includes(item.method_name));

    const monthlyStats = Array(12)
      .fill(null)
      .map((_, i) => ({
        monthIdx: i, // 0-11
        total: 0,
        ontime: 0,
        calendarMonth: i < 3 ? i + 10 : i - 2, // i=0(Oct) -> 10, i=3(Jan) -> 1
      }));

    filteredData.forEach((row) => {
      const m = parseInt(row.month_no); // 1-12
      if (isNaN(m)) return;
      // Map Calendar Month -> Fiscal Index (0=Oct, ..., 11=Sep)
      let idx = m >= 10 ? m - 10 : m + 2;
      if (idx >= 0 && idx < 12) {
        monthlyStats[idx].total += parseInt(row.cnt_total || 0);
        monthlyStats[idx].ontime += parseInt(row.cnt_ontime || 0);
      }
    });

    renderTable(monthlyStats);
    renderChart(monthlyStats);
  }

  // --- Render Table ---
  function renderTable(stats) {
    const tbody = document.getElementById("kpiTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    let yearTotal = 0,
      yearOntime = 0;
    let tdsTotal = "",
      tdsOntime = "",
      tdsResult = "",
      tdsTarget = "";

    stats.forEach((s) => {
      yearTotal += s.total;
      yearOntime += s.ontime;

      const pct = s.total > 0 ? (s.ontime / s.total) * 100 : 0;
      const cls = s.total > 0 ? (pct >= KPI_TARGET ? "status-pass" : "status-fail") : "";

      // Add click event for drill-down
      // Pass s.calendarMonth to drill down
      const cursorStyle = s.total > 0 ? 'style="cursor:pointer; text-decoration:underline;"' : "";
      const onClickAttr = s.total > 0 ? `onclick="window.showKpiDetail(${s.calendarMonth})"` : "";

      tdsTotal += `<td ${cursorStyle} ${onClickAttr}>${s.total > 0 ? s.total.toLocaleString() : "-"}</td>`;
      tdsOntime += `<td ${cursorStyle} ${onClickAttr}>${s.ontime > 0 ? s.ontime.toLocaleString() : "-"}</td>`; // Ontime can drill too? Yes, shows list
      tdsResult += `<td class="${cls}">${s.total > 0 ? pct.toFixed(2) : "-"}</td>`;
      tdsTarget += `<td>${KPI_TARGET.toFixed(2)}</td>`;
    });

    const yearPct = yearTotal > 0 ? (yearOntime / yearTotal) * 100 : 0;
    const yearCls = yearPct >= KPI_TARGET ? "status-pass" : "status-fail";

    tbody.innerHTML = `
            <tr><td class="text-left font-weight-bold">จำนวนเรื่องทั้งหมด</td>${tdsTotal}<td class="col-total pointer" onclick="window.showKpiDetail(0)">${yearTotal.toLocaleString()}</td></tr>
            <tr><td class="text-left font-weight-bold">จำนวนที่ทันเป้าหมาย</td>${tdsOntime}<td class="col-total">${yearOntime.toLocaleString()}</td></tr>
            <tr class="row-result"><td class="text-left">ผลลัพธ์ (%)</td>${tdsResult}<td class="col-total ${yearCls}">${yearTotal > 0 ? yearPct.toFixed(2) : "-"}</td></tr>
            <tr><td class="text-left">ค่าเป้าหมาย (%)</td>${tdsTarget}<td class="col-total">${KPI_TARGET.toFixed(2)}</td></tr>
        `;
  }

  // --- Load Employees (Call on Start) ---
  function loadEmployees() {
    $.ajax({
      url: "../api/List_Key_Performance_Indicator.php",
      data: { fn: "List_Emp" },
      dataType: "text",
      success: function (responseText) {
        try {
          const o = JSON.parse(responseText);
          const $emp = $("#filter_emp");
          if (o.data) {
            // Keep 'All' option
            // $emp.empty();
            // Actually 'All' is hardcoded in HTML with value 0.
            // We should append.

            // Clear existing dynamic options if any (start from index 1?)
            $emp.find('option:not([value="0"])').remove();

            o.data.forEach((e) => {
              $emp.append(new Option(e.name, e.id));
            });
            $emp.selectpicker("refresh");
          }
        } catch (e) {}
      },
    });
  }

  // --- Drill Down Function ---
  window.showKpiDetail = function (monthNo) {
    // monthNo: 1-12, or 0 for All Year
    const selectedMethods = $("#filter_method").val() || [];
    const monthName = monthNo > 0 ? ["", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."][monthNo] : "ทุกเดือน";

    $("#modalTitleSuffix").text(` - ${monthName} (วิธี: ${selectedMethods.length > 3 ? "หลายวิธี" : selectedMethods.join(", ")})`);
    $("#kpiDetailBody").html('<tr><td colspan="8" class="text-center p-4">กำลังโหลด...</td></tr>');
    $("#kpiDetailModal").modal("show");

    // Fetch Details
    // We pass the currently selected methods to the backend
    // Since backend query expects one method_name or complex WHERE,
    // to simplify, let's pass params.
    // NOTE: The current PHP "List_Detail" implementation only takes ONE method_name.
    // We should trigger the List_Detail to either accept multiple or array.
    // Or we loop in JS? No, better fetch.
    // Let's modify PHP lightly or Assume user picks one?
    // User might pick ALL.
    // For now, let's send no method_name => All methods included in $wh?
    // Wait, the PHP logic I wrote:
    // if ($method_name) $whDetail .= " AND ... = '$method_name' ";
    // If I don't send method_name, it includes ALL methods in the base query range.
    // BUT the base query doesn't filter by `selectedMethods` from frontend dropdown if I rely only on PHP.
    // The PHP base query: `WHERE a.tor_type_id IN (1..12)`
    // If the user UNCHECKED some items in JS, fetching from PHP without those filters will show wrong data.

    // WORKAROUND: Pass the list of selected methods to PHP? Or fetch all for that month and filter in JS?
    // Fetching all for that month is safer.

    $.ajax({
      url: "../api/List_Key_Performance_Indicator.php",
      data: {
        fn: "List_Detail",
        year_en: CURRENT_YEAR_EN,
        month_no: monthNo,
      },
      dataType: "text",
      success: function (responseText) {
        const o = JSON.parse(responseText);
        const list = o.data || [];

        // Client-side filtering by selected Methods
        const filteredList = list.filter((item) => selectedMethods.includes(item.method_name));

        // Calculate Stats
        const passCount = filteredList.filter((i) => i.status === "ผ่านเกณฑ์").length;
        const failCount = filteredList.length - passCount;

        // Update Header with Summary
        const summaryHtml = ` <span class="ml-2 badge badge-success">ผ่าน ${passCount}</span> <span class="badge badge-danger">ไม่ผ่าน ${failCount}</span>`;
        $("#modalTitleSuffix").html(` - ${monthName} (วิธี: ${selectedMethods.length > 3 ? "หลายวิธี" : selectedMethods.join(", ")}) ${summaryHtml}`);

        // Update Table Header
        const $table = $("#kpiDetailModal table");
        $table.find("thead").html(`
            <tr class="thead-dark">
                <th class="text-center" width="50">#</th>
                <th class="text-center" width="100">เลขที่ PR</th>
                <th>เรื่อง/โครงการ</th>
                <th width="150">ผู้รับผิดชอบ</th>
                <th class="text-center" width="100">วันที่ประกาศ</th>
                <th class="text-center" width="100">วันที่ลงนาม</th>
                <th class="text-center" width="80">ใช้เวลา (วัน)</th>
                <th class="text-center" width="100">สถานะ</th>
            </tr>
        `);

        let html = "";
        filteredList.forEach((r, idx) => {
          const badge = r.status === "ผ่านเกณฑ์" ? '<span class="badge badge-success">ผ่าน</span>' : '<span class="badge badge-danger">ไม่ผ่าน</span>';
          html += `
                        <tr>
                            <td class="text-center">${idx + 1}</td>
                            <td class="text-center text-primary font-weight-bold">${r.c_code || "ยังไม่ได้ระบุ"}</td>
                            <td>${r.c_name} <br/><small class="text-muted"><i class="fas fa-tag"></i> ${r.method_name}</small></td>
                            <td><small>${r.emp_name || "ยังไม่ได้ระบุ"}</small></td>
                            <td class="text-center">${r.d_egp_date || "-"}</td>
                            <td class="text-center">${r.d_doc_date || "-"}</td>
                            <td class="text-center font-weight-bold">${r.diff_days}</td>
                            <td class="text-center">${badge}</td>
                        </tr>
                    `;
        });

        if (html === "") html = '<tr><td colspan="8" class="text-center p-3">ไม่พบรายการ (ตามตัวกรอง)</td></tr>';
        $("#kpiDetailBody").html(html);
      },
    });
  };

  // --- Render Chart (ECharts) ---
  function renderChart(stats) {
    const chartDom = document.getElementById("kpiChart");
    if (!chartDom) return;

    if (!kpiChartInstance) {
      kpiChartInstance = echarts.init(chartDom);
      window.addEventListener("resize", () => kpiChartInstance.resize());
    }

    const months = ["ต.ค.", "พ.ย.", "ธ.ค.", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย."];
    const resultData = stats.map((s) => (s.total > 0 ? parseFloat(((s.ontime / s.total) * 100).toFixed(2)) : 0));
    const targetData = Array(12).fill(KPI_TARGET);

    const option = {
      tooltip: {
        trigger: "axis",
        formatter: function (params) {
          let str = `<b>${params[0].name}</b><br/>`;
          params.forEach((p) => {
            str += `${p.marker} ${p.seriesName}: <b>${p.value}%</b><br/>`;
          });
          return str;
        },
      },
      legend: {
        data: ["ผลลัพธ์", "เป้าหมาย"],
        right: "5%",
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: months,
      },
      yAxis: {
        type: "value",
        max: 100,
        axisLabel: { formatter: "{value}" },
      },
      series: [
        {
          name: "ผลลัพธ์",
          type: "line",
          data: resultData,
          symbol: "circle",
          symbolSize: 8,
          itemStyle: { color: "#5470c6" },
          lineStyle: { width: 3 },
        },
        {
          name: "เป้าหมาย",
          type: "line",
          data: targetData,
          symbol: "none",
          itemStyle: { color: "#ff7f50" },
          lineStyle: {
            type: "dashed",
            width: 2,
          },
        },
      ],
    };

    kpiChartInstance.setOption(option);
  }

  // --- Start ---
  document.addEventListener("DOMContentLoaded", () => {
    const dt = document.getElementById("darkToggle");
    if (dt)
      dt.addEventListener("change", (e) => {
        document.body.classList.toggle("dark-mode", e.target.checked);
      });

    loadEmployees(); // Load Emp List
    loadAll({ year_en: new Date().getFullYear() });

    // Listeners for new filters (Use changed.bs.select for Bootstrap Select)
    $("#filter_year, #filter_emp, #filter_contract_type")
      .off("changed.bs.select")
      .on("changed.bs.select", function () {
        loadAll();
      });

    $("#useRepKPI2")
      .off("change")
      .on("change", function () {
        loadAll();
      });
  });
})();