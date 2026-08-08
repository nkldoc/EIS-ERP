(function () {
  window.DATA_RAW = [];
  // ปีงบประมาณ eis_procure เริ่ม ต.ค. → เดือนปัจจุบันในปีงบ
  let selectedMonthIdx = (function () {
    const m = new Date().getMonth() + 1; // 1-12
    return m >= 10 ? m - 10 : m + 2;    // ต.ค.=0 ... ก.ย.=11
  })();
  let assignChart = null;
  let statusChart = null;

  // ชื่อเดือนในปีงบประมาณ (เริ่ม ต.ค.)
  const MONTHS = ["ต.ค.", "พ.ย.", "ธ.ค.", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย."];

  // ─── Year Select ────────────────────────────────────────────────
  function initYearSelect() {
    const $sel = $("#budget_year_filter");
    $sel.empty();
    const now = new Date().getFullYear();
    for (let y = now - 2; y <= now + 1; y++) {
      $sel.append(`<option value="${y + 543}" data-en="${y}">พ.ศ. ${y + 543}</option>`);
    }
    $sel.selectpicker("refresh");
    $sel.selectpicker("val", String(now + 543));
    $sel.on("change", () => loadAll());
  }

  // ─── Load Data ──────────────────────────────────────────────────
  function loadAll() {
    const loader = document.getElementById("pageLoader");
    if (loader) loader.style.display = "flex";
    const yearTh = $("#budget_year_filter").val();

    Ext.Ajax.request({
      url: "../api/List_Report_ChartStatus.php",
      method: "GET",
      params: { fn: "List_QueryParam", year_en: yearTh },
      success: function (resp) {
        try {
          const o = JSON.parse(resp.responseText);
          window.DATA_RAW = o.data || [];
          initFilters();
          recalculateAndRender();
        } catch (e) {
          console.error("parse error:", e);
        } finally {
          if (loader) loader.style.display = "none";
        }
      },
      failure: () => {
        if (loader) loader.style.display = "none";
        alert("ไม่สามารถโหลดข้อมูลได้");
      },
    });
  }

  // ─── Filters ────────────────────────────────────────────────────
  function initFilters() {
    // Filter ส่วนงาน (dc_cost2)
    const $s = $("#filter_staff").empty();
    const deptMap = new Map();
    window.DATA_RAW.forEach((it) => {
      if (it.dc_cost2_id && it.dc_cost2_name && it.dc_cost2_name !== 'ยังไม่ได้ระบุ') {
        deptMap.set(it.dc_cost2_id, it.dc_cost2_name);
      }
    });
    const sortedDept = [...deptMap.entries()].sort((a, b) => a[1].localeCompare(b[1], "th"));
    sortedDept.forEach(([id, name]) => $s.append(new Option(name, id)));
    $s.selectpicker("refresh").selectpicker("selectAll");

    // Filter ผู้รับผิดชอบ (sp_emp) — แสดงทุกคนจาก DATA_RAW ทั้งหมด
    rebuildEmpFilter(window.DATA_RAW);

    // Filter ประเภทงาน
    const $m = $("#filter_method").empty();
    const uniqueMethods = [...new Set(window.DATA_RAW.map((it) => it.method_name))].sort();
    uniqueMethods.forEach((v) => $m.append(new Option(v, v)));
    $m.selectpicker("refresh").selectpicker("selectAll");

    $(".selectpicker").not("#budget_year_filter")
      .off("changed.bs.select")
      .on("changed.bs.select", recalculateAndRender);
  }

  function rebuildEmpFilter(sourceData) {
    const $e = $("#filter_emp");
    const prevSelected = $e.val() || [];
    $e.empty();
    const empMap = new Map();
    sourceData.forEach((it) => {
      if (it.sp_emp_id && it.staff_name && it.staff_name !== 'ยังไม่ได้ระบุ') {
        empMap.set(it.sp_emp_id, it.staff_name);
      }
    });
    const sortedEmp = [...empMap.entries()].sort((a, b) => a[1].localeCompare(b[1], "th"));
    sortedEmp.forEach(([id, name]) => $e.append(new Option(name, id)));
    if (prevSelected.length === 0) {
      $e.selectpicker("refresh").selectpicker("selectAll");
    } else {
      $e.selectpicker("refresh").selectpicker("val", prevSelected);
    }
  }

  // ─── Recalculate ────────────────────────────────────────────────
  function recalculateAndRender() {
    const deptIds = $("#filter_staff").val() || [];
    const empIds  = $("#filter_emp").val()   || [];
    const methods = $("#filter_method").val() || [];

    // dc_cost2_id=0 = ยังไม่ระบุส่วนงาน → ผ่าน dept filter เสมอ
    const filtered = window.DATA_RAW.filter((it) =>
      (it.dc_cost2_id === 0 || deptIds.includes(String(it.dc_cost2_id))) &&
      (it.sp_emp_id === 0 || empIds.includes(String(it.sp_emp_id))) &&
      methods.includes(it.method_name)
    );

    // KPI boxes
    const totalAll    = filtered.length;
    const assignedAll = filtered.filter((it) => it.assigned_idx !== null).length;
    $("#sum_total_all").text(totalAll.toLocaleString());
    $("#sum_assigned_all").text(assignedAll.toLocaleString());
    $("#sum_pending_all").text((totalAll - assignedAll).toLocaleString());

    // Monthly summary
    const summary = Array.from({ length: 12 }, (_, i) => ({
      new:      filtered.filter((it) => it.month_idx === i).length,
      assigned: filtered.filter((it) => it.assigned_idx === i).length,
    }));

    renderTable(summary);
    updateNightingaleCharts(selectedMonthIdx, filtered);
  }

  // ─── Table ──────────────────────────────────────────────────────
  function renderTable(sum) {
    let hNew = "", hAss = "", hGr = "", totalN = 0, totalA = 0;

    sum.forEach((s, i) => {
      totalN += s.new;
      totalA += s.assigned;
      let gr = "-";
      if (i > 0 && sum[i - 1].assigned > 0) {
        const diff = s.assigned - sum[i - 1].assigned;
        const pct  = ((diff / sum[i - 1].assigned) * 100).toFixed(1);
        gr = `<span class="${diff >= 0 ? "text-success" : "text-danger"}">${diff >= 0 ? "▲" : "▼"} ${Math.abs(pct)}%</span>`;
      }
      const cls = i === selectedMonthIdx ? "table-primary" : "";
      hNew += `<td class="${cls} cursor-pointer" onclick="window.setM(${i})" data-month="${i}" data-type="entry">${s.new.toLocaleString()}</td>`;
      hAss += `<td class="${cls} cursor-pointer" onclick="window.setM(${i})" data-month="${i}" data-type="assigned">${s.assigned.toLocaleString()}</td>`;
      hGr  += `<td class="${cls}">${gr}</td>`;
    });

    const totalCls = selectedMonthIdx === 12 ? "table-primary" : "";
    const pctAll   = totalN > 0 ? ((totalA / totalN) * 100).toFixed(1) : 0;

    $("#kpiTableBody").html(`
      <tr>
        <td class="font-weight-bold">งานเข้าใหม่</td>
        ${hNew}
        <td class="col-total ${totalCls} cursor-pointer" onclick="window.setM(12)" data-month="12" data-type="entry">${totalN.toLocaleString()}</td>
      </tr>
      <tr>
        <td class="font-weight-bold">จ่ายงานแล้ว</td>
        ${hAss}
        <td class="col-total ${totalCls} cursor-pointer" onclick="window.setM(12)" data-month="12" data-type="assigned">${totalA.toLocaleString()}</td>
      </tr>
      <tr class="row-result">
        <td class="font-weight-bold">จ่ายงานเพิ่มขึ้น (%)</td>
        ${hGr}
        <td class="col-total ${totalCls} font-weight-bold text-primary">${pctAll}%</td>
      </tr>
    `);

    initContextMenu();
  }

  // ─── Charts ─────────────────────────────────────────────────────
  function updateNightingaleCharts(m, data) {
    let mData, n, a, titleLabel;

    if (m === 12) {
      mData      = data;
      n          = data.length;
      a          = data.filter((it) => it.assigned_idx !== null).length;
      titleLabel = "รวมทั้งปีงบประมาณ";
    } else {
      mData      = data.filter((it) => it.month_idx === m || it.assigned_idx === m);
      n          = mData.filter((it) => it.month_idx === m).length;
      a          = mData.filter((it) => it.assigned_idx === m).length;
      titleLabel = `ประจำเดือน ${MONTHS[m]}`;
    }

    $("#chartTitle").text(`สรุปผลการดำเนินงาน — ${titleLabel}`);

    const commonOption = (title, chartData) => ({
      title: { text: title, left: "center", top: 10, textStyle: { fontSize: 14, fontWeight: "bold" } },
      tooltip: {
        trigger: "item",
        formatter: (p) => `${p.name}: <b>${p.value.toLocaleString()}</b> (${p.percent}%)`,
      },
      series: [{
        type: "pie",
        radius: [30, 140],
        roseType: "radius",
        itemStyle: { borderRadius: 8, borderColor: "#fff", borderWidth: 2 },
        label: {
          show: true,
          formatter: (p) => `${p.name}\n${p.value.toLocaleString()}`,
          fontSize: 13,
        },
        data: chartData,
      }],
    });

    if (!assignChart) assignChart = echarts.init(document.getElementById("assignChart"));
    assignChart.setOption(commonOption("สัดส่วนการจ่ายงาน", [
      { value: a,                   name: "จ่ายงานแล้ว",   itemStyle: { color: "#5470c6" } },
      { value: Math.max(0, n - a),  name: "ยังไม่จ่าย",    itemStyle: { color: "#ee6666" } },
    ]), true);

    // Click กราฟซ้าย — จ่ายงาน / ยังไม่จ่าย
    assignChart.off("click");
    assignChart.on("click", function (params) {
      const yearTh  = $("#budget_year_filter").val();
      const yearEn  = yearTh - 543;
      const deptIds = [...new Set([...($("#filter_staff").val() || []), "0"])].join(",");
      const empIds  = [...new Set([...($("#filter_emp").val()   || []), "0"])].join(",");
      const isAssigned = params.name === "จ่ายงานแล้ว";
      const modalTitle = params.name;
      const dataType   = isAssigned ? "assigned" : "pending";
      $("#detailModal .modal-title").text(modalTitle);
      loadDetailAndShowModal({
        year_en: yearEn, month_idx: m, data_type: dataType,
        dept: deptIds, staff: empIds,
      });
    });

    if (!statusChart) statusChart = echarts.init(document.getElementById("statusChart"));
    const agg = {};
    const assignedItems = m === 12
      ? data.filter((it) => it.assigned_idx !== null)
      : mData.filter((it) => it.assigned_idx === m);
    assignedItems.forEach((it) => (agg[it.method_name] = (agg[it.method_name] || 0) + 1));
    const roseData = Object.keys(agg)
      .map((k) => ({ name: k, value: agg[k] }))
      .sort((a, b) => b.value - a.value);
    statusChart.setOption(commonOption("รายละเอียดตามประเภทงาน", roseData), true);

    // Click กราฟขวา — ประเภทงาน (จ่ายงานแล้วเท่านั้น)
    statusChart.off("click");
    statusChart.on("click", function (params) {
      const yearTh   = $("#budget_year_filter").val();
      const yearEn   = yearTh - 543;
      const deptIds  = [...new Set([...($("#filter_staff").val() || []), "0"])].join(",");
      const empIds   = [...new Set([...($("#filter_emp").val()   || []), "0"])].join(",");
      const methodName = params.name;
      $("#detailModal .modal-title").text("จ่ายงานแล้ว — " + methodName);
      loadDetailAndShowModal({
        year_en: yearEn, month_idx: m, data_type: "assigned",
        dept: deptIds, staff: empIds, method: methodName,
      });
    });
  }

  // ─── Context Menu ───────────────────────────────────────────────
  function initContextMenu() {
    const $menu = $("#context-menu");

    $("#kpiTableBody td.cursor-pointer")
      .off("contextmenu")
      .on("contextmenu", function (e) {
        e.preventDefault();
        const month   = $(this).data("month");
        const type    = $(this).data("type");
        const yearTh  = $("#budget_year_filter").val();
        const yearEn  = yearTh - 543;
        const deptIds = [...new Set([...($("#filter_staff").val() || []), "0"])].join(",");
        const empIds  = [...new Set([...($("#filter_emp").val()   || []), "0"])].join(",");
        const methods  = $("#filter_method").val() || [];

        $menu.css({ display: "block", left: e.pageX, top: e.pageY });

        $("#menu-view-detail").off("click").on("click", function () {
          $menu.hide();
          loadDetailAndShowModal({
            year_th:   yearTh,
            year_en:   yearEn,
            month_idx: month,
            data_type: type,
            dept:      deptIds,
            staff:     empIds,
          });
        });
      });

    $(document).on("click", () => $menu.hide());
  }

  // ─── Modal Detail ───────────────────────────────────────────────
  function loadDetailAndShowModal(params) {
    $("#detailModal").modal("show");
    $("#modalLoader").show();
    $("#modalTableContainer").hide();
    $("#detailTableBody").empty();

    Ext.Ajax.request({
      url: "../api/List_Report_ChartDetail.php",
      method: "POST",
      params: { ...params, fn: "List_QueryParam" },
      success: function (resp) {
        try {
          const o    = JSON.parse(resp.responseText);
          const data = o.data || [];
          var rows;
          var totalAmt = 0;
          var dash = "<span style='color:#D1D5DB;'>—</span>";

          if (data.length === 0) {
            rows = "<tr><td colspan='9' style='text-align:center;padding:48px;color:#94A3B8;font-size:13px;'>ไม่พบข้อมูลในช่วงเวลาที่เลือก</td></tr>";
            $("#detailTableFoot").hide();
            $("#modalTotalBar").hide();
          } else {
            rows = "";
            for (var idx = 0; idx < data.length; idx++) {
              var item = data[idx];
              var actDate = (item.d_act_date_dt26 || "");
              if (actDate && actDate.length > 10) actDate = actDate.substring(0, 10);
              var fAmt = parseFloat(item.f_amt || 0);
              totalAmt += fAmt;
              var amt = fAmt.toLocaleString("th-TH", {minimumFractionDigits: 2, maximumFractionDigits: 2});
              rows += "<tr>"
                + "<td class='td-no'>" + (idx + 1) + "</td>"
                + "<td class='td-pr'>" + (item.c_code || dash) + "</td>"
                + "<td class='td-left td-muted'>" + (item.c_name || dash) + "</td>"
                + "<td class='td-code'>" + (item.bg_expense_code || dash) + "</td>"
                + "<td class='td-muted td-left'>" + (item.bg_expense || dash) + "</td>"
                + "<td class='td-muted'>" + (item.dc_department || dash) + "</td>"
                + "<td class='td-muted'>" + (item.sp_emp || dash) + "</td>"
                + "<td class='td-date'>" + (actDate || dash) + "</td>"
                + "<td class='td-amt'>" + amt + "</td>"
                + "</tr>";
            }
            var totalFmt = totalAmt.toLocaleString("th-TH", {minimumFractionDigits: 2, maximumFractionDigits: 2});
            $("#modalRowCount").text(data.length.toLocaleString());
            $("#modalTotalAmt").text(totalFmt);
            $("#modalTotalAmtFooter").text(totalFmt);
            $("#detailTableFoot").show();
            $("#modalTotalBar").show();
          }
          $("#modalRowCount").text(data.length.toLocaleString());
          $("#detailTableBody").html(rows);
          $("#modalLoader").hide();
          $("#modalTableContainer").fadeIn();
        } catch (e) {
          console.error(e);
          $("#detailTableBody").html("<tr><td colspan='9' class='text-center text-danger'>เกิดข้อผิดพลาด</td></tr>");
          $("#modalLoader").hide();
          $("#modalTableContainer").show();
        }
      },
      failure: function () {
        $("#detailTableBody").html("<tr><td colspan='9' class='text-center text-danger'>ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้</td></tr>");
        $("#modalLoader").hide();
        $("#modalTableContainer").show();
      },
    });
  }

  // ─── Global ─────────────────────────────────────────────────────
  window.setM = (i) => {
    selectedMonthIdx = i;
    recalculateAndRender();
  };

  // เปิด Modal จาก KPI card
  window.openKpi = (kpiType) => {
    const yearTh  = $("#budget_year_filter").val();
    const yearEn  = yearTh - 543;
    // รวม 0 เข้าไปเสมอ เพื่อให้ record ที่ยังไม่ระบุผ่าน filter
    const deptIds = [...new Set([...($("#filter_staff").val() || []), "0"])].join(",");
    const empIds  = [...new Set([...($("#filter_emp").val()   || []), "0"])].join(",");

    var modalTitle, params;
    if (kpiType === "all") {
      modalTitle = "รายการทั้งหมด";
      params = { year_en: yearEn, month_idx: 12, data_type: "entry",
                 dept: deptIds, staff: empIds };
    } else if (kpiType === "assigned") {
      modalTitle = "จ่ายงานแล้ว";
      params = { year_en: yearEn, month_idx: 12, data_type: "assigned",
                 dept: deptIds, staff: empIds };
    } else {
      modalTitle = "รอดำเนินการ";
      params = { year_en: yearEn, month_idx: 12, data_type: "pending",
                 dept: deptIds, staff: empIds };
    }

    $("#detailModal .modal-title").text(modalTitle);
    loadDetailAndShowModal(params);
  };

  $(() => {
    initYearSelect();
    loadAll();
  });

  window.addEventListener("resize", () => {
    assignChart?.resize();
    statusChart?.resize();
  });
})();