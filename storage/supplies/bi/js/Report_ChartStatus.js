(function () {
  window.DATA_RAW = [];

  // ✅ ค่าคงที่แทน sp_emp_id = 0 เพราะ bootstrap-select กรอง value "0" ออก
  const UNASSIGNED_VALUE = "unassigned";

  // ✅ เก็บ context ปัจจุบันของ modal สำหรับ Export PDF
  let _currentModalParams = null;

  function getMonthIdx() {
    const m = new Date().getMonth();
    const map = {
      9:  0,  10: 1,  11: 2,
      0:  3,  1:  4,  2:  5,
      3:  6,  4:  7,  5:  8,
      6:  9,  7:  10, 8:  11
    };
    return map[m] ?? 0;
  }

  let selectedMonthIdx = getMonthIdx();
  let assignChart = null;
  let statusChart = null;

  // ─────────────────────────────────────────
  // ฟังก์ชัน Export PDF
  // ─────────────────────────────────────────
  function exportDetailToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    // ── Font: ใช้ built-in helvetica (รองรับ ASCII) แต่เพิ่ม Thai fallback ผ่าน UTF-8 ──
    // jsPDF ยังไม่รองรับ Thai font built-in → ใช้วิธี embed ผ่าน base64 ถ้ามี
    // หากไม่มี font ไทย ข้อความไทยจะแสดงเป็น ? → ใช้ sarabun จาก CDN ได้
    // แต่สำหรับ simplicity ใช้ autoTable ซึ่งรองรับ UTF-8 ได้บางส่วน

    const yearTh    = $("#budget_year_filter").val() || "";
    const titleText = $("#detailModalLabel").text().trim();

    // ── Header ──
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text(titleText, 148, 15, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("ปีงบประมาณ พ.ศ. " + yearTh, 148, 22, { align: "center" });
    doc.text("วันที่พิมพ์: " + new Date().toLocaleDateString("th-TH", {
      year: "numeric", month: "long", day: "numeric"
    }), 148, 28, { align: "center" });

    // ── ดึงข้อมูลจาก table ──
    const headers = [];
    const rows    = [];

    $("#detailTable thead tr th").each(function () {
      headers.push($(this).text().trim());
    });

    $("#detailTable tbody tr").each(function () {
      const row = [];
      $(this).find("td").each(function () {
        row.push($(this).text().trim());
      });
      rows.push(row);
    });

    // ── Summary row ──
    const totalRows = rows.length;
    let totalAmt = 0;
    rows.forEach(r => {
      const amt = parseFloat((r[7] || "0").replace(/,/g, ""));
      if (!isNaN(amt)) totalAmt += amt;
    });

    // ── autoTable ──
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 34,
      styles: {
        font:      "helvetica",
        fontSize:  8,
        cellPadding: 2,
        overflow:  "linebreak",
        valign:    "middle",
      },
      headStyles: {
        fillColor:   [70, 168, 222],
        textColor:   255,
        fontStyle:   "bold",
        halign:      "center",
        fontSize:    9,
      },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { halign: "center", cellWidth: 30 },
      2: { halign: "center", cellWidth: 20 },
      3: { cellWidth: "auto" },
      4: { cellWidth: 28 },
      5: { cellWidth: 40 },
      6: { cellWidth: 35 },              // ✅ เพิ่ม: สถานะใบขอเบิก
      7: { halign: "right", cellWidth: 28 }, // ✅ เลื่อนจำนวนเงินไป index 7
    },
      alternateRowStyles: { fillColor: [245, 249, 255] },
      foot: [[
        { content: "รวมทั้งหมด " + totalRows.toLocaleString() + " รายการ", colSpan: 7, styles: { fontStyle: "bold", halign: "right" } },
        { content: totalAmt.toLocaleString(undefined, { minimumFractionDigits: 2 }), styles: { fontStyle: "bold", halign: "right" } },
      ]],
      footStyles: {
        fillColor: [226, 230, 234],
        fontStyle: "bold",
        fontSize:  9,
      },
      margin: { left: 10, right: 10 },
      didDrawPage: function (data) {
        // Footer: page number
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          "หน้า " + data.pageNumber + " / " + pageCount,
          doc.internal.pageSize.width - 15,
          doc.internal.pageSize.height - 5,
          { align: "right" }
        );
      },
    });

    // ── บันทึกไฟล์ ──
    const safeTitle = titleText.replace(/[^\u0E00-\u0E7Fa-zA-Z0-9_\- ]/g, "").trim() || "detail";
    doc.save(safeTitle + "_" + yearTh + ".pdf");
  }

  // ─────────────────────────────────────────
  // Year Select
  // ─────────────────────────────────────────
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

  // ─────────────────────────────────────────
  // Load All Data
  // ─────────────────────────────────────────
  function loadAll() {
    const loader = document.getElementById("pageLoader");
    if (loader) loader.style.display = "flex";
    const yearTh = $("#budget_year_filter").val();

    $.ajax({
      url: "../api/List_Report_ChartStatus.php",
      method: "GET",
      data: { fn: "List_QueryParam", year_en: yearTh },
      dataType: "text",
      success: function (responseText) {
        try {
          // ✅ ใช้ JSON.parse แทน Ext.decode
          const o = JSON.parse(responseText || "{}");
          window.DATA_RAW = o.data || [];
          initFilters();
          setTimeout(() => recalculateAndRender(), 50);
        } catch (e) {
          console.error(e);
        } finally {
          if (loader) loader.style.display = "none";
        }
      },
      error: () => {
        if (loader) loader.style.display = "none";
      },
    });
  }

  // ─────────────────────────────────────────
  // Filters
  // ─────────────────────────────────────────
  function initFilters() {
    const $s = $("#filter_staff").empty();
    const staffMap = new Map();

    window.DATA_RAW.forEach((it) => {
      if (it.staff_name) {
        // ✅ แทน sp_emp_id=0 ด้วย "unassigned" เพราะ bootstrap-select กรอง value "0" ออก
        const key = it.sp_emp_id === 0 ? UNASSIGNED_VALUE : String(it.sp_emp_id);
        staffMap.set(key, it.staff_name);
      }
    });

    const sortedStaff = [...staffMap.entries()].sort((a, b) => a[1].localeCompare(b[1]));
    sortedStaff.forEach(([id, name]) => {
      $s.append($("<option>").attr("value", id).text(name));
    });

    $s.selectpicker("refresh");
    // ✅ ใช้ explicit array แทน selectAll เพื่อให้ "unassigned" ถูกเลือกด้วย
    $s.selectpicker("val", sortedStaff.map(([id]) => id));

    const $m = $("#filter_method").empty();
    const uniqueMethods = [...new Set(window.DATA_RAW.map((it) => it.method_name))].sort();
    uniqueMethods.forEach((v) => $m.append(new Option(v, v)));
    $m.selectpicker("refresh").selectpicker("selectAll");

    // ✅ ใช้ hardcoded list ของสถานะใบขอเบิกทั้งหมด (ไม่ได้ดึงจาก DATA_RAW)
    const $ss = $("#filter_sub_status").empty();
    const allSubStatus = [
      'รอผู้ดำเนินการลงนาม',
      'รอผู้ขอเบิกลงนาม',
      'รอฝ่ายการคลังลงนาม',
      'รอรับใบขอเบิก',
      'รอผู้ตรวจสอบลงนาม',
      'ทักท้วง',
      'รอตรวจสอบงบประมาณ',
      'รอผู้อนุมัติลงนาม',
      'รอเตรียมจ่าย',
      'รอหัวหน้าฝ่ายการคลังลงนามเช็ค',
      'รอผู้บริหารลงนามเช็ค',
      'รอทำทะเบียนจ่าย',
      'ทำทะเบียนจ่าย',
      'อยู่ระหว่างการจัดทำใบขอเบิก'
    ];
    allSubStatus.forEach((v) => $ss.append(new Option(v, v)));
    $ss.selectpicker("refresh").selectpicker("selectAll");

    $(".selectpicker").not("#budget_year_filter")
      .off("changed.bs.select")
      .on("changed.bs.select", recalculateAndRender);
  }

  // ─────────────────────────────────────────
  // Recalculate & Render
  // ─────────────────────────────────────────
  function recalculateAndRender() {
    const staffIds = $("#filter_staff").val() || [];
    const methods  = $("#filter_method").val() || [];
    const subStatus = $("#filter_sub_status").val() || [];

    // ✅ แปลง sp_emp_id=0 → "unassigned" ก่อนเปรียบเทียบ
    const filtered = window.DATA_RAW.filter((it) => {
      const key = it.sp_emp_id === 0 ? UNASSIGNED_VALUE : String(it.sp_emp_id);
      return staffIds.includes(key) && methods.includes(it.method_name) && subStatus.includes(it.sub_status_name);
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

  // ─────────────────────────────────────────
  // Load Detail Modal
  // ─────────────────────────────────────────
  function loadDetailAndShowModal(params) {
    // ✅ บันทึก context ไว้สำหรับ Export PDF
    _currentModalParams = params;

    $("#detailModal").modal("show");
    $("#modalLoader").show();
    $("#modalTableContainer").hide();
    $("#detailTableBody").empty();
    // ✅ ซ่อนปุ่ม PDF ไว้ก่อนจนกว่าข้อมูลจะโหลดเสร็จ
    $("#btn-export-pdf").hide();

    // ✅ ตั้งชื่อ modal ตามบริบท
    const monthNames  = ["ต.ค.", "พ.ย.", "ธ.ค.", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "รวมทั้งปี"];
    const typeLabel   = params.data_type === "assigned" ? "จ่ายงานแล้ว" : "งานเข้าใหม่";
    const monthLabel  = monthNames[params.month_idx] || "รวมทั้งปี";
    $("#detailModalLabel").text(`รายละเอียด ${typeLabel} — ${monthLabel} ปี พ.ศ. ${params.year_th}`);

    $.ajax({
      url: "../api/List_Report_ChartDetail.php",
      method: "POST",
      data: { ...params, fn: "List_QueryParam" },
      dataType: "text",
      success: function (responseText) {
        try {
          // ✅ ใช้ JSON.parse แทน Ext.decode เพราะ Ext.decode รุ่นเก่า strict เกินไป
          var raw  = responseText || "{}";
          var o    = JSON.parse(raw);
          var data = o.data || [];
          var rows = "";
          if (data.length === 0) {
            rows = "<tr><td colspan='8' class='text-center'>ไม่พบข้อมูล</td></tr>";
          } else {
            for (var idx = 0; idx < data.length; idx++) {
              var item = data[idx];
              rows += "<tr>"
              + "<td class='text-center'>" + (idx + 1) + "</td>"
              + "<td>" + (item.c_code || "-") + "</td>"
              + "<td>" + (item.bg_expense_id || "-") + "</td>"
              + "<td>" + (item.bg_expense || "-") + "</td>"
              + "<td>" + (item.dc_cost || "-") + "</td>"
              + "<td>" + (item.sp_emp || "-") + "</td>"
              + "<td>" + (item.sub_status_name || "-") + "</td>"          // ✅ เพิ่ม
              + "<td class='text-right'>" + parseFloat(item.f_amt || 0).toLocaleString() + "</td>"
              + "</tr>";
            }
          }
          $("#detailTableBody").html(rows);
          $("#modalLoader").hide();
          $("#modalTableContainer").fadeIn();
          // ✅ แสดงปุ่ม Export PDF หลังโหลดข้อมูลสำเร็จ
          if (data.length > 0) {
            $("#btn-export-pdf").show();
                  // Show export-all button too
                  $("#btn-export-all").show();
          }
        } catch (e) {
          console.error("Detail parse error:", e, raw ? raw.substring(0, 200) : "");
          $("#detailTableBody").html("<tr><td colspan='8' class='text-center text-danger'>เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>");
          $("#modalLoader").hide();
          $("#modalTableContainer").show();
        }
      },
      error: function () {
        $("#detailTableBody").html("<tr><td colspan='8' class='text-center text-danger'>ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้</td></tr>");
        $("#modalLoader").hide();
        $("#modalTableContainer").show();
      },
    });
  }

  // ─────────────────────────────────────────
  // Context Menu
  // ─────────────────────────────────────────
  function initContextMenu() {
    const $menu       = $("#context-menu");
    const $tableCells = $("#kpiTableBody td.cursor-pointer");

    $tableCells.on("contextmenu", function (e) {
      e.preventDefault();
      const month    = $(this).data("month");
      const type     = $(this).data("type");
      const yearTh   = $("#budget_year_filter").val();
      const staffIds = $("#filter_staff").val() || [];
      const subStatus = $("#filter_sub_status").val() || [];

      $menu.css({ display: "block", left: e.pageX, top: e.pageY });

      $("#menu-view-detail").off("click").on("click", function () {
        $menu.hide();
        loadDetailAndShowModal({
          year_th:   yearTh,
          month_idx: month,
          data_type: type,
          staff:     staffIds.join(","),
          sub_status: subStatus.join(","),
          year_en:   yearTh,
        });
      });
    });

    $(document).on("click", function () { $menu.hide(); });
  }

  // ─────────────────────────────────────────
  // Render Table
  // ─────────────────────────────────────────
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

  // ─────────────────────────────────────────
  // Nightingale Charts
  // ─────────────────────────────────────────
  function updateNightingaleCharts(m, data) {
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

  // ─────────────────────────────────────────
  // Init
  // ─────────────────────────────────────────
  window.setM = (i) => { selectedMonthIdx = i; recalculateAndRender(); };

  $(() => {
    initYearSelect();
    loadAll();

    // ✅ ผูก event Export PDF กับปุ่มใน modal
    $(document).on("click", "#btn-export-pdf", function () {
      exportDetailToPDF();
    });

    // ✅ ผูก event Export ทั้งหมด → เปิด endpoint ที่สร้าง PDF ฝั่งเซิร์ฟเวอร์
    $(document).on("click", "#btn-export-all", function () {
      if (!_currentModalParams) return alert('ไม่พบ context สำหรับ export');
      // Build query string from params
      const params = Object.assign({}, _currentModalParams);
      // Ensure we request all months
      params.month_idx = 12;
      params.fn = 'List_QueryParam';
      const qs = Object.keys(params).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&');
      const url = '../api/Export_Report_ChartDetail.php?' + qs;
      window.open(url, '_blank');
    });

    // ✅ ซ่อนปุ่มเมื่อ modal ปิด
    $("#detailModal").on("hidden.bs.modal", function () {
      $("#btn-export-pdf").hide();
      _currentModalParams = null;
    });
  });

  window.addEventListener("resize", () => { assignChart?.resize(); statusChart?.resize(); });
})();