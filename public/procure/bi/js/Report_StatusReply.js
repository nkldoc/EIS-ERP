(function () {
  "use strict";

  window.DATA_RAW = [];
  let replyLineChart = null;
  const MONTHS = ["ต.ค.", "พ.ย.", "ธ.ค.", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย."];

  // ─── Helper: แสดง toast แจ้งเตือน ───────────────────────────────────────────
  function showToast(msg, type) {
    type = type || "danger";
    const icons = { danger: "⚠️", warning: "⚠️", success: "✅", info: "ℹ️" };
    const colors = { danger: "#dc3545", warning: "#ffc107", success: "#28a745", info: "#17a2b8" };
    const toast = $(`
      <div style="
        position:fixed;bottom:20px;right:20px;z-index:99999;
        background:#fff;border-left:5px solid ${colors[type]};
        border-radius:6px;padding:14px 20px;
        box-shadow:0 4px 20px rgba(0,0,0,0.15);
        font-family:'Sarabun',sans-serif;font-size:0.95rem;
        max-width:360px;animation:fadeInUp 0.3s ease;
      ">
        <strong>${icons[type]} แจ้งเตือน:</strong> ${msg}
      </div>
    `);
    $("body").append(toast);
    setTimeout(() => toast.fadeOut(400, () => toast.remove()), 5000);
  }

  // ─── Helper: Ajax wrapper (รองรับทั้ง jQuery และ Ext) ──────────────────────
  function ajaxPost(url, params, onSuccess, onError) {
    // พยายามใช้ jQuery ก่อน (ปลอดภัยกว่า และไม่พึ่ง ExtJS)
    $.ajax({
      url: url,
      method: "POST",
      data: params,
      dataType: "json",
      timeout: 30000,
      success: function (obj) {
        onSuccess(obj);
      },
      error: function (xhr, status, err) {
        const statusCode = xhr.status;
        let msg = "การเชื่อมต่อล้มเหลว";
        if (statusCode === 500) msg = "เซิร์ฟเวอร์เกิดข้อผิดพลาด (500) กรุณาตรวจสอบ log ของ PHP";
        else if (statusCode === 403) msg = "ไม่มีสิทธิ์เข้าถึงข้อมูล (403)";
        else if (statusCode === 404) msg = "ไม่พบ API endpoint (404): " + url;
        else if (status === "timeout") msg = "หมดเวลาการเชื่อมต่อ กรุณาลองใหม่";
        else msg = "ข้อผิดพลาด HTTP " + statusCode + ": " + err;
        console.error("[ajaxPost] " + msg, { url, statusCode, status, err });
        onError(msg, xhr);
      },
    });
  }

  // ─── เริ่มต้น Dropdown ปีงบประมาณ ─────────────────────────────────────────
  function initYearSelect() {
    const $sel = $("#budget_year_filter");
    $sel.empty();
    const now = new Date().getFullYear();
    for (let y = now - 2; y <= now + 1; y++) {
      $sel.append(`<option value="${y + 543}" data-en="${y}">พ.ศ. ${y + 543}</option>`);
    }
    $sel.selectpicker("refresh");
    $sel.selectpicker("val", String(now + 543));
    $sel.on("change", () => loadData());
  }

  // ─── สร้าง Dropdown ผู้รับผิดชอบ ──────────────────────────────────────────
  function initFilters() {
    const $s = $("#filter_staff").empty();
    const staffMap = new Map();

    window.DATA_RAW.forEach((it) => {
      if (it.staff_id && it.staff_name) {
        staffMap.set(String(it.staff_id), it.staff_name);
      }
    });

    const sortedStaff = [...staffMap.entries()].sort((a, b) => a[1].localeCompare(b[1], "th"));
    sortedStaff.forEach(([id, name]) => $s.append(new Option(name, id)));

    $s.selectpicker("refresh").selectpicker("selectAll");
    $s.off("changed.bs.select").on("changed.bs.select", recalculateAndRender);

    recalculateAndRender();
  }

  // ─── โหลดข้อมูลหลัก ────────────────────────────────────────────────────────
  function loadData() {
    const loader = document.getElementById("pageLoader");
    if (loader) loader.style.display = "flex";

    const yearTh = $("#budget_year_filter").val();
    if (!yearTh) {
      if (loader) loader.style.display = "none";
      showToast("กรุณาเลือกปีงบประมาณก่อน", "warning");
      return;
    }

    const params = { fn: "List_QueryParam", year_en: yearTh };

    ajaxPost(
      "../api/List_Report_StatusReply.php",
      params,
      function (obj) {
        if (loader) loader.style.display = "none";
        if (obj && obj.success && Array.isArray(obj.data)) {
          window.DATA_RAW = obj.data;
          if (obj.data.length === 0) {
            showToast("ไม่พบข้อมูลสำหรับปีที่เลือก", "info");
          }
          initFilters();
        } else {
          const errMsg = (obj && obj.message) ? obj.message : "ไม่สามารถโหลดข้อมูลได้";
          console.warn("[loadData] API ตอบกลับ:", obj);
          showToast(errMsg, "warning");
          window.DATA_RAW = [];
          recalculateAndRender();
        }
      },
      function (msg) {
        if (loader) loader.style.display = "none";
        showToast(msg, "danger");
        $("#replyTableBody").html(
          `<tr><td colspan="14" class="text-center py-4 text-danger">
            <i class="fas fa-exclamation-circle mr-2"></i>${msg}
          </td></tr>`
        );
        window.DATA_RAW = [];
        renderChart(Array.from({ length: 12 }, (_, i) => ({ month: MONTHS[i], sent: 0, reply: 0 })));
      }
    );
  }

  // ─── คำนวณและ Render ────────────────────────────────────────────────────────
  function recalculateAndRender() {
    const staffIds = ($("#filter_staff").val() || []).map(String);
    const filtered = staffIds.length > 0
      ? window.DATA_RAW.filter((it) => staffIds.includes(String(it.staff_id)))
      : window.DATA_RAW;

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: MONTHS[i],
      sent: 0,
      reply: 0,
    }));

    let totalSent = 0;
    let totalReply = 0;

    filtered.forEach((it) => {
      const idx = parseInt(it.month_idx);
      if (idx >= 0 && idx < 12) {
        monthlyData[idx].sent++;
        totalSent++;
        if (Number(it.is_reply) === 1 || it.is_reply === true) {
          monthlyData[idx].reply++;
          totalReply++;
        }
      }
    });

    $("#sum_sent_all").text(totalSent.toLocaleString("th-TH"));
    $("#sum_reply_all").text(totalReply.toLocaleString("th-TH"));
    const pctTotal = totalSent > 0 ? ((totalReply / totalSent) * 100).toFixed(2) : "0.00";
    $("#sum_percent_all").text(pctTotal + "%");

    renderTable(monthlyData, totalSent, totalReply);
    renderChart(monthlyData);
    initSummaryBoxClick();
  }

  // ─── Render ตารางรายเดือน ───────────────────────────────────────────────────
  function renderTable(data, totalSent, totalReply) {
    let rowSent = "", rowReply = "", rowPct = "", rowInc = "", rowSentInc = "";

    data.forEach((d, i) => {
      rowSent += `<td class="cursor-pointer" data-month="${i}" data-type="sent">${d.sent.toLocaleString("th-TH")}</td>`;

      const replyCls = d.reply > 0 ? "text-reply" : "";
      rowReply += `<td class="${replyCls} cursor-pointer" data-month="${i}" data-type="reply">${d.reply.toLocaleString("th-TH")}</td>`;

      const pct = d.sent > 0 ? ((d.reply / d.sent) * 100).toFixed(1) : "0.0";
      const pctCls = parseFloat(pct) > 0 ? "text-danger" : "text-muted";
      rowPct += `<td class="${pctCls}">${pct}%</td>`;

      let incHtml = "-";
      if (i > 0) {
        const prevReply = data[i - 1].reply;
        if (prevReply > 0) {
          const diff = d.reply - prevReply;
          const inc = ((diff / prevReply) * 100).toFixed(1);
          const arrow = diff > 0 ? "▲" : diff < 0 ? "▼" : "";
          const color = diff > 0 ? "text-danger" : diff < 0 ? "text-success" : "text-muted";
          incHtml = `<span class="${color}">${arrow} ${Math.abs(inc)}%</span>`;
        } else if (d.reply > 0) {
          incHtml = `<span class="text-danger">▲ 100%</span>`;
        }
      }
      rowInc += `<td>${incHtml}</td>`;

      let sentIncHtml = "-";
      if (i > 0) {
        const prevSent = data[i - 1].sent;
        if (prevSent > 0) {
          const diff = d.sent - prevSent;
          const inc = ((diff / prevSent) * 100).toFixed(1);
          const arrow = diff > 0 ? "▲" : diff < 0 ? "▼" : "";
          const color = diff > 0 ? "text-success" : diff < 0 ? "text-danger" : "text-muted";
          sentIncHtml = `<span class="${color}">${arrow} ${Math.abs(inc)}%</span>`;
        } else if (d.sent > 0) {
          sentIncHtml = `<span class="text-success">▲ 100%</span>`;
        }
      }
      rowSentInc += `<td>${sentIncHtml}</td>`;
    });

    const totalPct = totalSent > 0 ? ((totalReply / totalSent) * 100).toFixed(1) : "0.0";

    const html = `
      <tr>
        <td class="font-weight-bold">จำนวนเรื่องส่งเบิก</td>
        ${rowSent}
        <td class="col-total cursor-pointer" data-type="sent">${totalSent.toLocaleString("th-TH")}</td>
      </tr>
      <tr>
        <td class="font-weight-bold text-muted">การเปลี่ยนแปลง (ส่งเบิก)</td>
        ${rowSentInc}
        <td class="col-total">-</td>
      </tr>
      <tr>
        <td class="font-weight-bold">จำนวนเรื่องโดนทักท้วง</td>
        ${rowReply}
        <td class="col-total cursor-pointer text-reply" data-type="reply">${totalReply.toLocaleString("th-TH")}</td>
      </tr>
      <tr class="row-result">
        <td class="font-weight-bold">สัดส่วนทักท้วง (%)</td>
        ${rowPct}
        <td class="col-total text-danger font-weight-bold">${totalPct}%</td>
      </tr>
      <tr>
        <td class="font-weight-bold text-muted">การเปลี่ยนแปลง (ทักท้วง)</td>
        ${rowInc}
        <td class="col-total">-</td>
      </tr>
    `;

    $("#replyTableBody").html(html);
    initContextMenu();
    initTotalClick();
  }

  // ─── Context Menu (ตารางหลัก) ──────────────────────────────────────────────
  function initContextMenu() {
    const $menu = $("#context-menu");
    const $tableCells = $("#replyTableBody td.cursor-pointer[data-month]");

    $tableCells.on("contextmenu", function (e) {
      e.preventDefault();
      const month    = $(this).data("month");
      const type     = $(this).data("type");
      const yearTh   = $("#budget_year_filter").val();
      const staffIds = ($("#filter_staff").val() || []).join(",");

      $menu.css({ display: "block", left: e.pageX, top: e.pageY });

      $("#menu-view-detail").off("click").on("click", function () {
        $menu.hide();
        showDetailModal(yearTh, month, type, staffIds);
      });

      // ตรวจสอบ Admin (รองรับทั้ง Ext และไม่มี Ext)
      const userId = (typeof Ext !== "undefined" && Ext.session) ? String(Ext.session.user_id) : "";
      const isAdmin = userId === "1";
      isAdmin ? $("#menu-show-sql").show() : $("#menu-show-sql").hide();

      $("#menu-show-sql").off("click").on("click", function () {
        $menu.hide();
        const params = {
          fn: "List_QueryParam",
          year_th: yearTh,
          month_idx: month,
          staff: staffIds,
          data_type: type,
          show_sql: 1,
        };
        window.open("../api/List_Report_StatusReplyDetail.php?" + $.param(params), "_blank");
      });
    });

    $(document).off("click.ctxmenu").on("click.ctxmenu", function () { $menu.hide(); });
  }

  // ─── คลิก Total column ─────────────────────────────────────────────────────
  function initTotalClick() {
    $("#replyTableBody .col-total.cursor-pointer").on("click", function () {
      const type     = $(this).data("type");
      const yearTh   = $("#budget_year_filter").val();
      const staffIds = ($("#filter_staff").val() || []).join(",");
      showDetailModal(yearTh, -1, type, staffIds);
    });
  }

  // ─── คลิก Summary Box ──────────────────────────────────────────────────────
  function initSummaryBoxClick() {
    const yearTh   = $("#budget_year_filter").val();
    const staffIds = ($("#filter_staff").val() || []).join(",");

    $("#sum_sent_all").off("click").on("click", function () {
      showDetailModal(yearTh, -1, "sent", staffIds);
    });
    $("#sum_reply_all").off("click").on("click", function () {
      showDetailModal(yearTh, -1, "reply", staffIds);
    });
  }

  let lastModalParams = {};
  let lastModalData   = [];

  // ─── แสดง Modal รายละเอียด ─────────────────────────────────────────────────
  function showDetailModal(yearTh, monthIdx, type, staffIds) {
    const $modal     = $("#detailModal");
    const $loader    = $("#modalLoader");
    const $tableBody = $("#modalTableBody");
    const $title     = $("#modalTitle");
    const $sub       = $("#modalSubtitle");

    lastModalParams = { year_th: yearTh, month_idx: monthIdx, staff: staffIds, data_type: type };

    $modal.modal("show");
    $loader.removeClass("d-none").addClass("d-flex");
    $tableBody.empty();
    $("#modalSearchInput").val("");
    $("#modalFooterInfo").text("กำลังโหลด...");

    const typeLabel  = type === "reply" ? "รายการทักท้วง" : "รายการส่งเบิกทั้งหมด";
    const monthLabel = monthIdx >= 0 ? MONTHS[monthIdx] : "ทุกเดือน (สะสมทั้งปี)";
    $title.text(`รายละเอียด${typeLabel}`);
    $sub.text(`ปีงบประมาณ ${yearTh} | เดือน: ${monthLabel}`);

    ajaxPost(
      "../api/List_Report_StatusReplyDetail.php",
      { fn: "List_QueryParam", year_th: yearTh, month_idx: monthIdx, staff: staffIds, data_type: type },
      function (obj) {
        $loader.removeClass("d-flex").addClass("d-none");
        if (obj && obj.success && Array.isArray(obj.data)) {
          lastModalData = obj.data;
          renderModalTable(obj.data);
          $("#modalFooterInfo").text(`ทั้งหมด ${obj.data.length.toLocaleString("th-TH")} รายการ`);
          initModalContextMenu();
        } else {
          const errMsg = (obj && obj.message) ? obj.message : "ไม่พบข้อมูล";
          $tableBody.html(`<tr><td colspan="18" class="text-center py-4 text-muted">${errMsg}</td></tr>`);
          $("#modalFooterInfo").text("0 รายการ");
        }
      },
      function (msg) {
        $loader.removeClass("d-flex").addClass("d-none");
        $tableBody.html(
          `<tr><td colspan="18" class="text-center py-4 text-danger">
            <i class="fas fa-exclamation-triangle mr-2"></i>${msg}
          </td></tr>`
        );
        $("#modalFooterInfo").text("เกิดข้อผิดพลาด");
        showToast(msg, "danger");
      }
    );

    // ค้นหาใน Modal
    $("#modalSearchInput").off("keyup.search").on("keyup.search", function () {
      const value = $(this).val().toLowerCase();
      $("#modalTableBody tr").filter(function () {
        $(this).toggle($(this).text().toLowerCase().includes(value));
      });
    });

    // Export Excel
    $("#btnExportModal").off("click.export").on("click.export", function () {
      if (!lastModalData || lastModalData.length === 0) {
        showToast("ไม่มีข้อมูลสำหรับ Export", "warning");
        return;
      }
      exportStyledExcel(lastModalData, type, yearTh);
    });
  }

  // ─── Context Menu (ใน Modal) ───────────────────────────────────────────────
  function initModalContextMenu() {
    const $menu = $("#context-menu-modal");

    $("#modalTableBody tr").off("contextmenu").on("contextmenu", function (e) {
      e.preventDefault();
      const userId  = (typeof Ext !== "undefined" && Ext.session) ? String(Ext.session.user_id) : "";
      const isAdmin = userId === "1";
      isAdmin ? $("#menu-modal-show-sql").show() : $("#menu-modal-show-sql").hide();
      $menu.css({ display: "block", left: e.pageX, top: e.pageY });
    });

    $("#menu-modal-show-sql").off("click").on("click", function () {
      $menu.hide();
      const params = { fn: "List_QueryParam", ...lastModalParams, show_sql: 1 };
      window.open("../api/List_Report_StatusReplyDetail.php?" + $.param(params), "_blank");
    });

    $(document).off("click.ctxmodal").on("click.ctxmodal", function () { $menu.hide(); });
  }

  // ─── Render ตารางใน Modal ──────────────────────────────────────────────────
  function renderModalTable(data) {
    const $tbody   = $("#modalTableBody");
    const $summary = $("#modalSummaryStats");
    let html = "";
    let sumTotal = 0.0, sumReply = 0.0;

    if (!data || data.length === 0) {
      $tbody.html('<tr><td colspan="18" class="text-center py-4 text-muted">ไม่พบข้อมูล</td></tr>');
      $summary.html("");
      return;
    }

    data.forEach((item) => {
      const isReply     = item.is_reply || false;
      const statusText  = isReply ? "โดนทักท้วง" : "ส่งเบิกปกติ";
      const badgeClass  = isReply ? "badge badge-danger badge-pill" : "badge badge-success badge-pill";

      const c_code      = item.c_code     || "-";
      const c_code_ref  = item.c_code_ref || "-";
      const rawDCode    = item.d_code     || "-";
      const origACode   = item.orig_a_code || "";

      let d_code_html;
      if (origACode && origACode.startsWith("A")) {
        d_code_html = `
          <span class="text-danger font-weight-bold"
                title="รายการนี้ใช้เงินทดรองจ่าย (${origACode}) แล้วถูกเบิกคืนเป็นเลข ${rawDCode}"
                data-toggle="tooltip" data-placement="top">
            ${rawDCode} <i class="fas fa-exclamation-circle ml-1" style="font-size:0.85em;"></i>
          </span>
          <br><small class="text-muted" style="font-size:0.78em;">(ชดใช้เงินทดลอง: ${origACode})</small>
        `;
      } else {
        d_code_html = `<span>${rawDCode}</span>`;
      }

      const c_heading  = item.c_heading_proj || "";
      const c_name_sub = item.c_name         || "";
      const proj_html  = `
        <div style="width:260px;">
          <div title="${c_heading}" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;
               overflow:hidden;font-size:0.88rem;font-weight:600;line-height:1.45;color:#1a237e;
               white-space:normal;word-break:break-word;">${c_heading || "-"}</div>
          ${c_name_sub && c_name_sub !== "-" ? `
          <div class="text-truncate" title="${c_name_sub}"
               style="font-size:0.75rem;color:#78909c;margin-top:3px;line-height:1.2;">
            <i class="fas fa-file-alt" style="font-size:0.65rem;"></i> ${c_name_sub}
          </div>` : ""}
        </div>`;

      let amt = 0;
      if (item.f_net_total_price) {
        amt = parseFloat(String(item.f_net_total_price).replace(/,/g, ""));
        if (isNaN(amt)) amt = 0;
      }
      sumTotal += amt;
      if (isReply) sumReply += amt;

      const amtStr = amt.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      html += `
        <tr>
          <td class="text-center text-muted small">${item.row_num || ""}</td>
          <td class="font-weight-bold text-primary">${c_code}</td>
          <td>${c_code_ref}</td>
          <td class="text-muted small">${d_code_html}</td>
          <td style="vertical-align:middle;">${proj_html}</td>
          <td class="text-right font-weight-bold">${amtStr}</td>
          <td><div class="text-truncate" style="max-width:150px;" title="${item.dc_creditor || ""}">${item.dc_creditor || "-"}</div></td>
          <td class="text-center">${item.d_arrive_date   || "-"}</td>
          <td class="text-center">${item.d_checking_date || "-"}</td>
          <td class="text-center">${item.d_create        || "-"}</td>
          <td class="text-center font-weight-bold text-info">${item.diff_arrive_check !== "-" ? item.diff_arrive_check + " วัน" : "-"}</td>
          <td class="text-center font-weight-bold text-info">${item.diff_check_send   !== "-" ? item.diff_check_send   + " วัน" : "-"}</td>
          <td><small>${item.emp || "-"}</small></td>
          <td><small>${item.po_emp_name || item.emp_tt || "-"}</small></td>
          <td class="text-center"><span class="${badgeClass}" style="font-size:85%;">${statusText}</span></td>
          <td class="text-center">${item.d_receive_date || "-"}</td>
          <td class="text-center">${item.d_send_date    || "-"}</td>
          <td><small>${item.c_comment || "-"}</small></td>
        </tr>
      `;
    });

    $tbody.html(html);

    const sumTotalStr = sumTotal.toLocaleString("en-US", { minimumFractionDigits: 2 });
    const sumReplyStr = sumReply.toLocaleString("en-US", { minimumFractionDigits: 2 });
    $summary.html(`
      <div class="d-flex align-items-center flex-wrap">
        <div class="mr-3 px-3 py-1 rounded mb-1" style="background:#e8f5e9;border:1px solid #c3e6cb;">
          <span class="text-success font-weight-bold mr-1"><i class="fas fa-money-bill-wave"></i> ยอดส่งเบิก:</span>
          <span class="h6 mb-0 text-dark font-weight-bold">${sumTotalStr}</span>
        </div>
        <div class="px-3 py-1 rounded mb-1" style="background:#f8d7da;border:1px solid #f5c6cb;">
          <span class="text-danger font-weight-bold mr-1"><i class="fas fa-exclamation-circle"></i> ยอดโดนทักท้วง:</span>
          <span class="h6 mb-0 text-dark font-weight-bold">${sumReplyStr}</span>
        </div>
      </div>
    `);

    // เปิด Bootstrap tooltip
    $("[data-toggle='tooltip']").tooltip();
  }

  // ─── Render Chart ───────────────────────────────────────────────────────────
  function renderChart(data) {
    const el = document.getElementById("replyLineChart");
    if (!el) return;

    if (!replyLineChart) {
      replyLineChart = echarts.init(el);
    }

    let chartData   = [...data];
    let chartLabels = [...MONTHS];

    const now = new Date();
    const currentFiscalYear = now.getMonth() >= 9 ? now.getFullYear() + 1 : now.getFullYear();
    const selectedYearTh    = parseInt($("#budget_year_filter").val());
    const selectedYearEn    = selectedYearTh - 543;

    if (selectedYearEn === currentFiscalYear) {
      const currentMonthIdx = (now.getMonth() + 3) % 12;
      chartData   = data.slice(0, currentMonthIdx + 1);
      chartLabels = MONTHS.slice(0, currentMonthIdx + 1);
    }

    const option = {
      title: { text: "" },
      tooltip: { trigger: "axis", axisPointer: { type: "cross" } },
      legend: { data: ["เรื่องส่งเบิก", "โดนทักท้วง"] },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: { type: "category", boundaryGap: false, data: chartLabels },
      yAxis: { type: "value", minInterval: 1 },
      series: [
        {
          name: "เรื่องส่งเบิก",
          type: "line",
          smooth: true,
          data: chartData.map((d) => d.sent),
          itemStyle: { color: "#28a745" },
          lineStyle: { width: 3 },
          areaStyle: { opacity: 0.1, color: "#28a745" },
          label: { show: true, position: "top" },
        },
        {
          name: "โดนทักท้วง",
          type: "line",
          smooth: true,
          data: chartData.map((d) => d.reply),
          itemStyle: { color: "#dc3545" },
          lineStyle: { width: 3 },
          label: { show: true, position: "top" },
        },
      ],
    };

    replyLineChart.setOption(option, true);
  }

  // ─── Export Excel ───────────────────────────────────────────────────────────
  function exportStyledExcel(data, type, yearTh) {
    if (!data || data.length === 0) { showToast("ไม่มีข้อมูลสำหรับ Export", "warning"); return; }

    const typeLabel  = type === "reply" ? "รายการทักท้วง" : "รายการส่งเบิกทั้งหมด";
    const replyCount = data.filter(d => d.is_reply).length;
    const totalAmt   = data.reduce((s, d) => {
      const v = parseFloat(String(d.f_net_total_price || "0").replace(/,/g, ""));
      return s + (isNaN(v) ? 0 : v);
    }, 0);
    const pct    = data.length > 0 ? (replyCount / data.length * 100).toFixed(2) : "0.00";
    const amtFmt = totalAmt.toLocaleString("th-TH", { minimumFractionDigits: 2 });

    const HEADERS = [
      "#", "เลขที่รับของ", "เลขที่ตรวจรับ", "เลขที่ส่งเบิก", "ชื่อโครงการ/สัญญา",
      "จำนวนเงิน (บาท)", "เจ้าหนี้/บริษัท",
      "วันที่ส่งมอบ", "วันที่ตรวจรับ", "วันที่สร้างใบเบิก",
      "ระยะเวลา (ส่งมอบ-ตรวจรับ)", "ระยะเวลา (ตรวจรับ-ส่งเบิก)",
      "ผู้ส่งเบิก", "จนท.ทักท้วง", "สถานะ",
      "วันที่ทักท้วง", "วันที่ส่งกลับทักท้วง", "ข้อความทักท้วง",
    ];
    const N = HEADERS.length;

    const aoa = [];

    const titleRow = [`รายงาน${typeLabel} - EIS ปีงบประมาณ ${yearTh}`];
    for (let i = 1; i < N; i++) titleRow.push("");
    aoa.push(titleRow);

    const statsRow = [
      `จำนวนทั้งหมด: ${data.length} รายการ`, "", "",
      `โดนทักท้วง: ${replyCount} รายการ (${pct}%)`, "", "",
      `ยอดรวม: ${amtFmt} บาท`, "", "", "", "",
    ];
    for (let i = statsRow.length; i < N; i++) statsRow.push("");
    aoa.push(statsRow);

    aoa.push(HEADERS);

    data.forEach((item, idx) => {
      const isReply   = item.is_reply || false;
      const rawDCode  = item.d_code     || "-";
      const origACode = item.orig_a_code || "";
      const dCodeText = origACode && origACode.startsWith("A")
        ? `${rawDCode} (ชดใช้: ${origACode})` : rawDCode;
      const amt = parseFloat(String(item.f_net_total_price || "0").replace(/,/g, "")) || 0;

      aoa.push([
        idx + 1,
        item.c_code     || "-",
        item.c_code_ref || "-",
        dCodeText,
        item.c_heading_proj || "-",
        amt,
        item.dc_creditor || "-",
        item.d_arrive_date   || "-",
        item.d_checking_date || "-",
        item.d_create        || "-",
        item.diff_arrive_check !== "-" ? item.diff_arrive_check + " วัน" : "-",
        item.diff_check_send   !== "-" ? item.diff_check_send   + " วัน" : "-",
        item.emp || "-",
        item.po_emp_name || item.emp_tt || "-",
        isReply ? "โดนทักท้วง" : "ส่งเบิกปกติ",
        item.d_receive_date || "-",
        item.d_send_date    || "-",
        item.c_comment      || "-",
      ]);
    });

    const footerRow = ["รวมทั้งสิ้น", "", "", "", ""];
    footerRow.push(totalAmt);
    for (let i = 6; i < N; i++) footerRow.push("");
    aoa.push(footerRow);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    ws["!merges"] = [
      { s:{r:0,c:0}, e:{r:0,c:N-1} },
      { s:{r:1,c:0}, e:{r:1,c:2} },
      { s:{r:1,c:3}, e:{r:1,c:5} },
      { s:{r:1,c:6}, e:{r:1,c:10} },
      { s:{r:aoa.length-1,c:0}, e:{r:aoa.length-1,c:4} },
    ];

    ws["!cols"] = [
      {wch:5},{wch:16},{wch:17},{wch:16},{wch:40},{wch:15},{wch:28},
      {wch:13},{wch:13},{wch:15},{wch:14},{wch:14},{wch:18},{wch:18},{wch:13},
      {wch:13},{wch:18},{wch:42},
    ];

    const rowCount = aoa.length;
    ws["!rows"] = [{hpt:24},{hpt:18},{hpt:32}];
    for (let r = 3; r < rowCount - 1; r++) ws["!rows"].push({hpt:40});
    ws["!rows"].push({hpt:18});

    // Styles
    const S = {
      title:   { font:{name:"TH SarabunPSK",sz:18,bold:true,color:{rgb:"FFFFFF"}}, fill:{patternType:"solid",fgColor:{rgb:"1565C0"}}, alignment:{horizontal:"center",vertical:"center"} },
      stats:   { font:{name:"TH SarabunPSK",sz:14,bold:true,color:{rgb:"FFFFFF"}}, fill:{patternType:"solid",fgColor:{rgb:"0D47A1"}}, alignment:{horizontal:"center",vertical:"center"} },
      hdrBlue: { font:{name:"TH SarabunPSK",sz:14,bold:true,color:{rgb:"FFFFFF"}}, fill:{patternType:"solid",fgColor:{rgb:"1976D2"}}, alignment:{horizontal:"center",vertical:"center",wrapText:true}, border:{top:{style:"thin"},bottom:{style:"thin"},left:{style:"thin"},right:{style:"thin"}} },
      hdrGreen:{ font:{name:"TH SarabunPSK",sz:14,bold:true,color:{rgb:"FFFFFF"}}, fill:{patternType:"solid",fgColor:{rgb:"2E7D32"}}, alignment:{horizontal:"center",vertical:"center",wrapText:true}, border:{top:{style:"thin"},bottom:{style:"thin"},left:{style:"thin"},right:{style:"thin"}} },
      footerL: { font:{name:"TH SarabunPSK",sz:15,bold:true,color:{rgb:"FFFFFF"}}, fill:{patternType:"solid",fgColor:{rgb:"1565C0"}}, alignment:{horizontal:"right",vertical:"center"} },
      footerAmt:{ font:{name:"TH SarabunPSK",sz:15,bold:true,color:{rgb:"FFFFFF"}}, fill:{patternType:"solid",fgColor:{rgb:"2E7D32"}}, alignment:{horizontal:"right",vertical:"center"}, numFmt:"#,##0.00" },
      footerR: { font:{name:"TH SarabunPSK",sz:14}, fill:{patternType:"solid",fgColor:{rgb:"1565C0"}} },
    };
    const BORDER = {top:{style:"thin",color:{rgb:"BDBDBD"}},bottom:{style:"thin",color:{rgb:"BDBDBD"}},left:{style:"thin",color:{rgb:"BDBDBD"}},right:{style:"thin",color:{rgb:"BDBDBD"}}};
    const enc = (r, c) => XLSX.utils.encode_cell({r, c});

    for (let c = 0; c < N; c++) { const a = enc(0,c); if (!ws[a]) ws[a]={v:"",t:"s"}; ws[a].s = S.title; }
    for (let c = 0; c < N; c++) { const a = enc(1,c); if (!ws[a]) ws[a]={v:"",t:"s"}; ws[a].s = S.stats; }
    for (let c = 0; c < N; c++) { const a = enc(2,c); if (!ws[a]) ws[a]={v:"",t:"s"}; ws[a].s = c === 5 ? S.hdrGreen : S.hdrBlue; }

    for (let r = 3; r < rowCount - 1; r++) {
      const item    = data[r - 3];
      const isReply = item ? (item.is_reply || false) : false;
      const even    = r % 2 === 0;
      const bgRgb   = isReply ? (even ? "FFF3E0" : "FFE0B2") : (even ? "FFFFFF" : "F5F5F5");
      const baseFill = { patternType:"solid", fgColor:{ rgb: bgRgb } };

      for (let c = 0; c < N; c++) {
        const a = enc(r, c);
        if (!ws[a]) ws[a] = {v:"", t:"s"};
        ws[a].s = { font:{name:"TH SarabunPSK",sz:14}, fill:baseFill, border:BORDER,
                    alignment:{vertical:"center", wrapText:(c===4||c===6||c===17)} };
        if (c === 0) { ws[a].s.alignment.horizontal="center"; ws[a].s.font.color={rgb:"757575"}; }
        else if (c <= 3) { ws[a].s.alignment.horizontal="center"; ws[a].s.font.bold=true; ws[a].s.font.color={rgb:"1565C0"}; }
        else if (c === 5) { ws[a].s.alignment.horizontal="right"; ws[a].s.font.bold=true; ws[a].s.font.color={rgb:"1B5E20"}; ws[a].s.numFmt="#,##0.00"; }
        else if (c === 14) { ws[a].s.alignment.horizontal="center"; ws[a].s.font.bold=true; ws[a].s.font.color={rgb:isReply?"B71C1C":"2E7D32"}; }
        else { ws[a].s.alignment.horizontal="center"; }
      }
    }

    const fr = rowCount - 1;
    for (let c = 0; c < N; c++) {
      const a = enc(fr,c);
      if (!ws[a]) ws[a]={v:"",t:"s"};
      ws[a].s = c < 5 ? S.footerL : c === 5 ? S.footerAmt : S.footerR;
    }
    const fAmtAddr = enc(fr, 5);
    if (ws[fAmtAddr]) { ws[fAmtAddr].t="n"; ws[fAmtAddr].s.numFmt="#,##0.00"; }

    ws["!freeze"] = { xSplit:0, ySplit:3 };

    XLSX.utils.book_append_sheet(wb, ws, "รายการ");
    XLSX.writeFile(wb, `EIS_Report_Reply_${type}_${yearTh}.xlsx`);
  }

  // ─── Bootstrap / Document Ready ────────────────────────────────────────────
  $(() => {
    // เพิ่ม CSS animation สำหรับ toast
    if (!document.getElementById("eis-toast-style")) {
      const style = document.createElement("style");
      style.id = "eis-toast-style";
      style.textContent = `
        @keyframes fadeInUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `;
      document.head.appendChild(style);
    }

    initYearSelect();
    loadData();
  });

  window.addEventListener("resize", () => {
    if (replyLineChart) replyLineChart.resize();
  });

})();