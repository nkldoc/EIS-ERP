(function () {
  window.DATA_RAW = [];

  // ✅ month_idx ตรงกับ PHP:
  // ต.ค.=0, พ.ย.=1, ธ.ค.=2, ม.ค.=3, ก.พ.=4, มี.ค.=5,
  // เม.ย.=6, พ.ค.=7, มิ.ย.=8, ก.ค.=9, ส.ค.=10, ก.ย.=11
  // JS getMonth(): ม.ค.=0, ก.พ.=1, ..., ก.ย.=8, ต.ค.=9, พ.ย.=10, ธ.ค.=11
  function getMonthIdx() {
    const m = new Date().getMonth();
    const map = {
      9:  0,  // ต.ค.
      10: 1,  // พ.ย.
      11: 2,  // ธ.ค.
      0:  3,  // ม.ค.
      1:  4,  // ก.พ.
      2:  5,  // มี.ค.
      3:  6,  // เม.ย.
      4:  7,  // พ.ค.
      5:  8,  // มิ.ย.
      6:  9,  // ก.ค.
      7:  10, // ส.ค.
      8:  11  // ก.ย.
    };
    return map[m] ?? 0;
  }

  let selectedMonthIdx = getMonthIdx();
  let assignChart = null;
  let statusChart = null;

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
          const o = Ext.decode(resp.responseText);
          window.DATA_RAW = o.data || [];
          initFilters();
          recalculateAndRender();
        } catch (e) {
          console.error(e);
        } finally {
          if (loader) loader.style.display = "none";
        }
      },
      failure: () => {
        if (loader) loader.style.display = "none";
      },
    });
  }

  function initFilters() {
    const $s = $("#filter_staff").empty();
    const staffMap = new Map();
    window.DATA_RAW.forEach((it) => {
      if (it.sp_emp_id && it.staff_name) {
        staffMap.set(it.sp_emp_id, it.staff_name);
      }
    });
    const sortedStaff = [...staffMap.entries()].sort((a, b) => a[1].localeCompare(b[1]));
    sortedStaff.forEach(([id, name]) => $s.append(new Option(name, id)));
    $s.selectpicker("refresh").selectpicker("selectAll");

    const $m = $("#filter_method").empty();
    const uniqueMethods = [...new Set(window.DATA_RAW.map((it) => it.method_name))].sort();
    uniqueMethods.forEach((v) => $m.append(new Option(v, v)));
    $m.selectpicker("refresh").selectpicker("selectAll");

    $(".selectpicker").not("#budget_year_filter").off("changed.bs.select").on("changed.bs.select", recalculateAndRender);
  }

  function recalculateAndRender() {
    const staffIds = $("#filter_staff").val() || [];
    const methods  = $("#filter_method").val() || [];

    const filtered = window.DATA_RAW.filter((it) => {
      return staffIds.includes(String(it.sp_emp_id)) && methods.includes(it.method_name);
    });

    const totalAll    = filtered.length;
    const assignedAll = filtered.filter((it) => it.assigned_idx !== null).length;
    $("#sum_total_all").text(totalAll.toLocaleString());
    $("#sum_assigned_all").text(assignedAll.toLocaleString());
    $("#sum_pending_all").text((totalAll - assignedAll).toLocaleString());

    const summary = Array.from({ length: 12 }, (_, i) => ({
      new:      filtered.filter((it) => it.month_idx === i).length,
      assigned: filtered.filter((it) => it.assigned_idx === i).length,
    }));

    renderTable(summary);
    updateNightingaleCharts(selectedMonthIdx, filtered);
  }

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
          const o    = Ext.decode(resp.responseText);
          const data = o.data || [];
          let rows = "";
          if (data.length === 0) {
            rows = "<tr><td colspan='7' class='text-center'>ไม่พบข้อมูล</td></tr>";
          } else {
            data.forEach((item, idx) => {
              rows += `
                <tr>
                  <td class="text-center">${idx + 1}</td>
                  <td>${item.c_code || "-"}</td>
                  <td>${item.bg_expense_id || "-"}</td>
                  <td>${item.bg_expense || "-"}</td>
                  <td>${item.dc_cost || "-"}</td>
                  <td>${item.sp_emp || "-"}</td>
                  <td class="text-right">${parseFloat(item.f_amt || 0).toLocaleString()}</td>
                </tr>`;
            });
          }
          $("#detailTableBody").html(rows);
          $("#modalLoader").hide();
          $("#modalTableContainer").fadeIn();
        } catch (e) {
          console.error(e);
          $("#detailTableBody").html("<tr><td colspan='7' class='text-center text-danger'>เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>");
          $("#modalLoader").hide();
          $("#modalTableContainer").show();
        }
      },
      failure: function () {
        $("#detailTableBody").html("<tr><td colspan='7' class='text-center text-danger'>ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้</td></tr>");
        $("#modalLoader").hide();
        $("#modalTableContainer").show();
      },
    });
  }

  function initContextMenu() {
    const $menu       = $("#context-menu");
    const $tableCells = $("#kpiTableBody td.cursor-pointer");

    $tableCells.on("contextmenu", function (e) {
      e.preventDefault();
      const month    = $(this).data("month");
      const type     = $(this).data("type");
      const yearTh   = $("#budget_year_filter").val();
      const staffIds = $("#filter_staff").val() || [];

      $menu.css({ display: "block", left: e.pageX, top: e.pageY });

      $("#menu-view-detail").off("click").on("click", function () {
        $menu.hide();
        loadDetailAndShowModal({
          year_th:   yearTh,
          month_idx: month,
          data_type: type,
          staff:     staffIds.join(","),
          year_en:   yearTh, // ส่ง พ.ศ. ให้ตรงกับ PHP
        });
      });
    });

    $(document).on("click", function () { $menu.hide(); });
  }

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
    $("#kpiTableBody").html(`
      <tr>
        <td class="font-weight-bold">งานเข้าใหม่เดือนนี้</td>
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
        <td class="col-total ${totalCls} font-weight-bold text-primary" onclick="window.setM(12)">
          ${totalN > 0 ? ((totalA / totalN) * 100).toFixed(1) : 0}%
        </td>
      </tr>
    `);
    initContextMenu();
  }

  function updateNightingaleCharts(m, data) {
    // ✅ ตรงกับ PHP month_idx: ต.ค.=0 ... ก.ย.=11
    const months = ["ต.ค.", "พ.ย.", "ธ.ค.", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย."];
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
      titleLabel = `ประจำเดือน ${months[m]}`;
    }

    $("#chartTitle").html(`🌹 สรุปผลการดำเนินงาน <span class="text-primary">${titleLabel}</span>`);

    const commonOption = (title, chartData) => ({
      title:   { text: title, left: "center", top: 10 },
      tooltip: {
        trigger: "item",
        formatter: (p) => `${p.name}: <b>${p.value.toLocaleString()}</b> (${p.percent}%)`,
      },
      series: [{
        type:      "pie",
        radius:    [30, 140],
        roseType:  "radius",
        itemStyle: { borderRadius: 8, borderColor: "#fff", borderWidth: 2 },
        label: {
          show:      true,
          formatter: (p) => `${p.name}\n${p.value.toLocaleString()}`,
          fontSize:  14,
        },
        data: chartData,
      }],
    });

    if (!assignChart) assignChart = echarts.init(document.getElementById("assignChart"));
    assignChart.setOption(commonOption("สัดส่วนการจ่ายงาน", [
      { value: a,                  name: "จ่ายงานแล้ว", itemStyle: { color: "#5470c6" } },
      { value: Math.max(0, n - a), name: "ยังไม่จ่าย",  itemStyle: { color: "#ee6666" } },
    ]), true);

    if (!statusChart) statusChart = echarts.init(document.getElementById("statusChart"));
    const agg = {};
    const assignedItems = m === 12
      ? data.filter((it) => it.assigned_idx !== null)
      : mData.filter((it) => it.assigned_idx === m);
    assignedItems.forEach((it) => (agg[it.method_name] = (agg[it.method_name] || 0) + 1));
    const roseData = Object.keys(agg).map((k) => ({ name: k, value: agg[k] })).sort((a, b) => b.value - a.value);
    statusChart.setOption(commonOption("รายละเอียดตามประเภทงาน", roseData), true);
  }

  window.setM = (i) => { selectedMonthIdx = i; recalculateAndRender(); };

  $(() => { initYearSelect(); loadAll(); });

  window.addEventListener("resize", () => { assignChart?.resize(); statusChart?.resize(); });
})();