(function () {
  window.DATA_RAW = [];
  let quarterCharts = [null, null, null, null];
  let cumulativeTrendChart = null;
  let groupTrendChart = null;
  let groupPercentBarChart = null;
  let weeklyTrendChart = null;
  let lastComputedWeeks = [];
  let replyRegistryRequestToken = 0;
  const MONTHS = ["ต.ค.", "พ.ย.", "ธ.ค.", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย."];
  const CAL_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const MONTHS_FULL = ["ตุลาคม", "พฤศจิกายน", "ธันวาคม", "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน"];
  const THAI_MONTH_SHORT_NODOT = ["", "มค", "กพ", "มีค", "เมย", "พค", "มิย", "กค", "สค", "กย", "ตค", "พย", "ธค"];

  // ===== Date Formatting: any date string -> "D.MMM.YY" (e.g. 26.พค.69) =====
  function formatDateThai(dateStr) {
    if (!dateStr || dateStr === "-" || dateStr === "") return "-";

    let d, m, y;
    if (dateStr.indexOf("/") > -1) {
      // d/m/Y (Gregorian year from server)
      const parts = dateStr.split("/");
      if (parts.length === 3) {
        d = parseInt(parts[0], 10);
        m = parseInt(parts[1], 10);
        y = parseInt(parts[2], 10);
      }
    } else if (dateStr.indexOf("-") > -1) {
      // Y-m-d
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        y = parseInt(parts[0], 10);
        m = parseInt(parts[1], 10);
        d = parseInt(parts[2], 10);
      }
    }

    if (!d || !m || !y) return dateStr;

    // Normalize to Buddhist Era if a Gregorian year was passed in
    const yBE = y < 2400 ? y + 543 : y;
    const yy = String(yBE).slice(-2);

    return `${d}.${THAI_MONTH_SHORT_NODOT[m]}.${yy}`;
  }

  // ===== Format a JS Date object -> "D ม.ค. YY" (used for weekly date-range labels) =====
  function formatWeekDateLabel(date) {
    if (!(date instanceof Date) || isNaN(date)) return "-";
    const d = date.getDate();
    const m = date.getMonth(); // 0-11 (calendar month)
    const yBE = date.getFullYear() + 543;
    const yy = String(yBE).slice(-2);
    return `${d} ${CAL_MONTHS[m]} ${yy}`;
  }

  const QUARTER_LABELS = ["ไตรมาส 1 (ต.ค.-ธ.ค.)", "ไตรมาส 2 (ม.ค.-มี.ค.)", "ไตรมาส 3 (เม.ย.-มิ.ย.)", "ไตรมาส 4 (ก.ค.-ก.ย.)"];
  const QUARTER_MONTH_IDX = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [9, 10, 11],
  ];

  // ===== Staff Group (สายงาน) persistence =====
  const GROUP_STORAGE_KEY = "reply_report_staff_groups_v1";
  const GROUP_LABELS = { g1: "สายงาน 1", g2: "สายงาน 2", other: "อื่นๆ" };
  let STAFF_GROUPS = loadStaffGroups();
  let pendingGroups = {};

  function loadStaffGroups() {
    try {
      const raw = localStorage.getItem(GROUP_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveStaffGroups() {
    try {
      localStorage.setItem(GROUP_STORAGE_KEY, JSON.stringify(STAFF_GROUPS));
    } catch (e) {
      console.error("Cannot save staff groups", e);
    }
  }

  function getStaffGroup(staffId) {
    return STAFF_GROUPS[staffId] || "other";
  }

  // ===== Fiscal Year / Month helpers =====
  function currentFiscalYearEn() {
    const now = new Date();
    return now.getMonth() >= 9 ? now.getFullYear() + 1 : now.getFullYear();
  }
  function currentMonthIdxInFiscal() {
    const now = new Date();
    return (now.getMonth() + 3) % 12;
  }

  let selectedYearTh = currentFiscalYearEn() + 543;
  let selectedMonthIdx = currentMonthIdxInFiscal();
  let lastLoadedYearTh = null;

  function initMainMonthSelect() {
    const $sel = $("#main_month_filter");
    $sel.empty();

    const curFiscalEn = currentFiscalYearEn();
    const curMonthIdx = currentMonthIdxInFiscal();

    // แสดงเฉพาะปีงบประมาณปัจจุบันเท่านั้น (ต.ค. ของปีงบปัจจุบัน ถึง เดือนปัจจุบัน)
    // ตามคำขอ: ตั้งแต่ ต.ค. 2568 จนถึงวันเดือนปีปัจจุบัน (ไม่ย้อนหลังปีงบประมาณเก่า)
    const startFiscal = curFiscalEn;
    const endFiscal = curFiscalEn;

    for (let fy = startFiscal; fy <= endFiscal; fy++) {
      const yearTh = fy + 543;
      const maxIdx = fy === curFiscalEn ? curMonthIdx : 11;
      for (let idx = 0; idx <= maxIdx; idx++) {
        const dispYearTh = idx <= 2 ? yearTh - 1 : yearTh;
        const label = `${MONTHS[idx]} ${dispYearTh}`;
        $sel.append(`<option value="${yearTh}_${idx}">${label}</option>`);
      }
    }

    $sel.selectpicker("refresh");
    $sel.selectpicker("val", `${selectedYearTh}_${selectedMonthIdx}`);

    $sel.off("changed.bs.select").on("changed.bs.select", function () {
      const val = $(this).val();
      if (!val) return;
      const [yTh, mIdx] = val.split("_").map(Number);
      selectedYearTh = yTh;
      selectedMonthIdx = mIdx;

      if (selectedYearTh !== lastLoadedYearTh) {
        loadData();
      } else {
        recalcGrandTotalReply();
        recalculateAndRender();
      }
    });
  }

  function getUniqueStaffList() {
    const staffMap = new Map();
    window.DATA_RAW.forEach((it) => {
      const sid = it.staff_id || 0;
      if (sid === 0) return; // "ไม่ระบุ" ไม่ใช่พนักงานจริง ไม่ต้องมี checkbox ให้เลือก/จัดกลุ่ม
      staffMap.set(sid, it.staff_name || "ไม่ระบุ");
    });
    return [...staffMap.entries()].sort((a, b) => a[1].localeCompare(b[1], "th"));
  }

  // ค่า staff filter ที่จะส่งไป backend: ถ้าติ๊กครบทุกช่อง (ไม่ได้ตั้งใจกรองจริงๆ) ให้ส่งค่าว่าง
  // เพื่อให้ backend "ไม่กรอง" ตาม sp_emp_id เลย แทนที่จะส่งรายชื่อ id เท่าที่ปรากฏใน checkbox
  // (checkbox สร้างจาก window.DATA_RAW ซึ่งดึงเฉพาะปีงบประมาณที่เลือกไว้ด้านบน — เจ้าหน้าที่ที่มีเฉพาะ
  // เอกสารที่สร้างนอกปีงบประมาณนั้น แต่ถูกทักท้วงในช่วงวันที่ของ Grand Total จะไม่มี checkbox ให้ติ๊กเลย
  // ถ้ายังส่งรายชื่อ id แบบ allow-list เอกสารของเจ้าหน้าที่คนนั้นจะถูกกรองออกไปทั้งที่ผู้ใช้ไม่ได้ตั้งใจกรอง)
  function getBackendStaffIdsParam() {
    const $all = $(".staff-check");
    const $checked = $(".staff-check:checked");
    if ($all.length > 0 && $checked.length === $all.length) return "";
    return $checked.map(function () { return $(this).val(); }).get().join(",");
  }

  // ===== Staff Filter (Checkbox grouped by สายงาน) =====
  function renderStaffFilterUI(preserveChecked) {
    const $container = $("#staffGroupFilterContainer");
    const staffList = getUniqueStaffList();

    // Remember currently checked ids (if preserving state, e.g. after group re-render)
    let checkedIds = null;
    if (preserveChecked) {
      checkedIds = new Set($(".staff-check:checked").map(function () { return $(this).val(); }).get());
    }

    const buckets = { g1: [], g2: [], other: [] };
    staffList.forEach(([id, name]) => {
      const grp = getStaffGroup(id);
      buckets[grp].push([id, name]);
    });

    const groupOrder = [["g1", "สายงาน 1"], ["g2", "สายงาน 2"], ["other", "อื่นๆ"]];
    let html = "";

    groupOrder.forEach(([grpKey, grpLabel]) => {
      const list = buckets[grpKey];
      if (list.length === 0) return;
      html += `
        <div class="staff-group-box" data-group="${grpKey}">
          <div class="staff-group-header">
            <span><i class="fas fa-folder text-warning mr-1"></i> ${grpLabel}</span>
            <span>
              <button type="button" class="btn-soft btn-select-group" data-group="${grpKey}">เลือกทั้งกลุ่ม</button>
              <button type="button" class="btn-soft btn-clear-group" data-group="${grpKey}">ล้างกลุ่ม</button>
            </span>
          </div>
          <div class="staff-group-items">
            ${list
              .map(
                ([id, name]) => `
              <label class="staff-check-item mb-0">
                <input type="checkbox" class="staff-check" value="${id}" data-group="${grpKey}" checked> ${name}
              </label>`
              )
              .join("")}
          </div>
        </div>`;
    });

    $container.html(html || '<div class="text-muted small">ไม่พบข้อมูลเจ้าหน้าที่</div>');

    // Restore previous check state if applicable
    if (checkedIds) {
      $(".staff-check").each(function () {
        $(this).prop("checked", checkedIds.has($(this).val()));
      });
    }

    // Wire events
    $(".staff-check")
      .off("change")
      .on("change", function () {
        recalcGrandTotalReply();
        recalculateAndRender();
      });

    $(".btn-select-group")
      .off("click")
      .on("click", function () {
        const grp = $(this).data("group");
        $(`.staff-check[data-group="${grp}"]`).prop("checked", true);
        recalcGrandTotalReply();
        recalculateAndRender();
      });

    $(".btn-clear-group")
      .off("click")
      .on("click", function () {
        const grp = $(this).data("group");
        $(`.staff-check[data-group="${grp}"]`).prop("checked", false);
        recalcGrandTotalReply();
        recalculateAndRender();
      });

    $("#btnSelectAllStaff")
      .off("click")
      .on("click", function () {
        $(".staff-check").prop("checked", true);
        recalcGrandTotalReply();
        recalculateAndRender();
      });

    $("#btnClearAllStaff")
      .off("click")
      .on("click", function () {
        $(".staff-check").prop("checked", false);
        recalcGrandTotalReply();
        recalculateAndRender();
      });

    recalcGrandTotalReply();
    recalculateAndRender();
  }

  // ===== Group Assign Modal =====
  function initGroupModal() {
    $("#btnOpenGroupModal")
      .off("click")
      .on("click", function () {
        pendingGroups = Object.assign({}, STAFF_GROUPS);
        $("#staffGroupSearch").val("");
        renderGroupModalTable();
        $("#groupModal").modal("show");
      });

    $("#btnCloseGroupModal")
      .off("click")
      .on("click", function () {
        STAFF_GROUPS = Object.assign({}, pendingGroups);
        saveStaffGroups();
        $("#groupModal").modal("hide");
        renderStaffFilterUI(true);
      });
  }

  function getInitials(name) {
    if (!name) return "?";
    const parts = String(name).trim().split(/\s+/);
    return parts[0] ? parts[0].charAt(0).toUpperCase() : "?";
  }

  function segButton(grp, activeGrp, label) {
    return `<button type="button" class="seg-btn ${grp === activeGrp ? "active" : ""}" data-grp="${grp}">${label}</button>`;
  }

  function renderGroupModalTable() {
    const $list = $("#staffGroupList");
    const staffList = getUniqueStaffList();

    if (!staffList.length) {
      $list.html('<div class="staff-group-empty">ไม่พบรายชื่อเจ้าหน้าที่</div>');
      updateGroupSummaryCounts();
      return;
    }

    let html = "";
    staffList.forEach(([id, name]) => {
      const grp = pendingGroups[id] || "other";
      html += `
        <div class="staff-group-row" data-staff-id="${id}" data-staff-name="${(name || "").toLowerCase()}">
          <div class="staff-avatar ${grp}">${getInitials(name)}</div>
          <div class="staff-group-name" title="${name}">${name}</div>
          <div class="segmented-group" data-staff-id="${id}">
            ${segButton("g1", grp, "สายงาน 1")}
            ${segButton("g2", grp, "สายงาน 2")}
            ${segButton("other", grp, "อื่นๆ")}
          </div>
        </div>`;
    });

    $list.html(html);
    updateGroupSummaryCounts();

    $(".segmented-group .seg-btn")
      .off("click")
      .on("click", function () {
        const val = $(this).data("grp");
        const $seg = $(this).closest(".segmented-group");
        const id = $seg.data("staff-id");
        if (pendingGroups[id] === val) return;

        pendingGroups[id] = val;
        $seg.find(".seg-btn").removeClass("active");
        $(this).addClass("active");

        const $row = $seg.closest(".staff-group-row");
        $row.find(".staff-avatar").attr("class", `staff-avatar ${val}`);

        updateGroupSummaryCounts();
      });

    $("#staffGroupSearch")
      .off("keyup")
      .on("keyup", function () {
        const q = $(this).val().toLowerCase().trim();
        $(".staff-group-row").each(function () {
          const name = $(this).data("staff-name") || "";
          $(this).toggle(name.indexOf(q) > -1);
        });
      });
  }

  function updateGroupSummaryCounts() {
    let g1 = 0,
      g2 = 0,
      other = 0;
    Object.keys(pendingGroups).forEach((id) => {
      const v = pendingGroups[id];
      if (v === "g1") g1++;
      else if (v === "g2") g2++;
      else other++;
    });
    // Count staff with no explicit assignment (defaults to "other") too
    const staffList = getUniqueStaffList();
    staffList.forEach(([id]) => {
      if (!(id in pendingGroups)) other++;
    });

    $("#sumCountG1").text(g1);
    $("#sumCountG2").text(g2);
    $("#sumCountOther").text(other);
  }

  // ===== Data Load =====
  function loadData() {
    const loader = document.getElementById("pageLoader");
    if (loader) loader.style.display = "flex";

    const params = {
      fn: "List_QueryParam",
      year_en: selectedYearTh,
    };

    $.ajax({
      url: "../api/List_Report_StatusReply.php",
      method: "POST",
      data: params,
      dataType: "text",
      success: function (responseText) {
        try {
          const obj = JSON.parse(responseText);
          if (obj.success && obj.data) {
            window.DATA_RAW = obj.data;
            lastLoadedYearTh = selectedYearTh;
            renderStaffFilterUI(false);
          } else {
            console.error("API Error:", obj.message);
            window.DATA_RAW = [];
            renderStaffFilterUI(false);
          }
        } catch (e) {
          console.error("Decode Error", e);
        } finally {
          if (loader) loader.style.display = "none";
        }
      },
      error: function () {
        console.error("Ajax Failed");
        if (loader) loader.style.display = "none";
      },
    });
  }

  // ===== Core Recalc & Render =====
  function recalculateAndRender() {
    const staffIds = $(".staff-check:checked").map(function () { return $(this).val(); }).get();

    // กรองตามช่วงวันที่ในกล่อง "ช่วงวันที่สำหรับสรุปยอด Grand Total" (#gtDateStart / #gtDateEnd)
    // เพื่อให้กราฟ/ตารางทุกตัว (รายไตรมาส, waffle, cumulative trend, heatmap ฯลฯ) นับเฉพาะ
    // เอกสารที่วันที่สร้างใบเบิก (d_create) อยู่ในช่วงวันที่เดียวกันกับที่ใช้คำนวณ Grand Total
    // แทนที่จะนับทั้งปีงบประมาณ 12 เดือนเสมอ ทำให้ตัวเลขไม่ตรงกันอย่างที่เคยเป็น
    const gtStart = $("#gtDateStart").val();
    const gtEnd = $("#gtDateEnd").val();

    const filtered = window.DATA_RAW.filter((it) => {
      const sid = String(it.staff_id || 0);
      // "ไม่ระบุ" (sid=0) ไม่มี checkbox ให้เลือกแล้ว (ดู getUniqueStaffList) จึงต้องนับรวมเสมอ
      // ไม่งั้นข้อมูลกลุ่มนี้จะหายไปจากทุกกราฟ/ตารางทันทีที่เลือกพนักงานไม่ครบทุกคน
      if (sid !== "0" && !staffIds.includes(sid)) return false;
      if (gtStart && it.d_create && it.d_create < gtStart) return false;
      if (gtEnd && it.d_create && it.d_create > gtEnd) return false;
      return true;
    });
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: MONTHS[i],
      fullMonth: MONTHS_FULL[i],
      sent: 0,
      reply: 0,
      pending: 0,
    }));

    let totalSent = 0;
    let totalReply = 0; // จำนวนเอกสารที่เคยถูกทักท้วง (นับไม่ซ้ำ ต่อ 1 ใบเบิก)

    filtered.forEach((it) => {
      monthlyData[it.month_idx].sent++;
      totalSent++;
      if (Number(it.is_reply) === 1 || it.is_reply === true) {
        monthlyData[it.month_idx].reply++;
        totalReply++;
      }
      if (Number(it.is_pending_receive) === 1 || it.is_pending_receive === true) {
        monthlyData[it.month_idx].pending++;
      }
    });

    // Grand Total Bar
    // sum_sent_all / sum_reply_all / sum_percent_all ("ยอดส่งเบิกทั้งหมด", "ยอดทักท้วงสะสมสุทธิ", "ค่าเฉลี่ยอัตราการทักท้วง")
    // คำนวณแยกจาก monthlyData ด้านบน โดยเรียก API เฉพาะทาง (List_CompareProtestRounds) ผ่าน recalcGrandTotalReply()
    // เพื่อให้ตรงกับ List_RepProtest.php (EIS) แบบ apples-to-apples ในช่วงวันที่เดียวกัน (#gtDateStart / #gtDateEnd)

    // KPI Cards (เดือนที่เลือก)
    const m = monthlyData[selectedMonthIdx] || { sent: 0, reply: 0, pending: 0 };
    const mNormal = m.sent - m.reply;
    const mPct = m.sent > 0 ? ((m.reply / m.sent) * 100).toFixed(1) : "0.0";
    $("#kpi_month_sent").text(m.sent.toLocaleString());
    $("#kpi_month_reply").text(m.reply.toLocaleString());
    $("#kpi_month_normal").text(mNormal.toLocaleString());
    $("#kpi_month_pct").text(mPct + "%");
    $("#kpi_month_pending").text(m.pending.toLocaleString());

    renderTable(monthlyData, totalSent, totalReply);
    renderQuarterlyDonuts(monthlyData);
    renderWaffleChart(monthlyData, selectedYearTh);
    renderCumulativeTrendChart(monthlyData);
    renderMomTrendsTable(monthlyData);
    renderStaffHeatmap(filtered, monthlyData);
    renderGroupBreakdown(filtered);
    renderWeeklyWaffleAndTrend(filtered);
    renderWeekStaffHeatmap(filtered);
    renderReplyRegistry();
  }

  function renderTable(data, totalSent, totalReply) {
    let rowSent = "";
    let rowReply = "";
    let rowPct = "";
    let rowInc = "";
    let rowSentInc = "";

    data.forEach((d, i) => {
      rowSent += `<td class="cursor-pointer" data-month="${i}" data-type="sent">${d.sent.toLocaleString()}</td>`;

      const replyCls = d.reply > 0 ? "text-reply" : "";
      rowReply += `<td class="${replyCls} cursor-pointer" data-month="${i}" data-type="reply">${d.reply.toLocaleString()}</td>`;

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
        <tr><td class="font-weight-bold">จำนวนเรื่องส่งเบิก</td>${rowSent}<td class="col-total cursor-pointer" data-type="sent">${totalSent.toLocaleString()}</td></tr>
        <tr><td class="font-weight-bold text-muted">การเปลี่ยนแปลง (ส่งเบิก)</td>${rowSentInc}<td class="col-total">-</td></tr>
        <tr><td class="font-weight-bold">จำนวนเรื่องโดนทักท้วง</td>${rowReply}<td class="col-total cursor-pointer text-reply" data-type="reply">${totalReply.toLocaleString()}</td></tr>
        <tr class="row-result"><td class="font-weight-bold">สัดส่วนทักท้วง (%)</td>${rowPct}<td class="col-total text-danger font-weight-bold">${totalPct}%</td></tr>
        <tr><td class="font-weight-bold text-muted">การเปลี่ยนแปลง (ทักท้วง)</td>${rowInc}<td class="col-total">-</td></tr>
    `;

    $("#replyTableBody").html(html);
    initContextMenu();
    initTotalClick();
  }

  function initContextMenu() {
    const $menu = $("#context-menu");
    const $tableCells = $("#replyTableBody td.cursor-pointer[data-month]");

    $tableCells.on("contextmenu", function (e) {
      e.preventDefault();

      const month = $(this).data("month");
      const type = $(this).data("type");
      const yearTh = selectedYearTh;
      const staffIds = getBackendStaffIdsParam();

      $menu.css({
        display: "block",
        left: e.pageX,
        top: e.pageY,
      });

      $("#menu-view-detail")
        .off("click")
        .on("click", function () {
          $menu.hide();
          showDetailModal(yearTh, month, type, staffIds);
        });

      const isAdmin = typeof Ext !== "undefined" && Ext.session && String(Ext.session.user_id) === "1";
      if (isAdmin) {
        $("#menu-show-sql").show();
      } else {
        $("#menu-show-sql").hide();
      }

      $("#menu-show-sql")
        .off("click")
        .on("click", function () {
          $menu.hide();
          const params = {
            fn: "List_QueryParam",
            year_th: yearTh,
            month_idx: month,
            staff: staffIds,
            data_type: type,
            show_sql: 1,
          };
          const qs = $.param(params);
          window.open("../api/List_Report_StatusReplyDetail.php?" + qs, "_blank");
        });
    });

    $(document).on("click", function () {
      $menu.hide();
    });
  }

  function initTotalClick() {
    $("#replyTableBody .col-total.cursor-pointer").on("click", function () {
      const type = $(this).data("type");
      const yearTh = selectedYearTh;
      const staffIds = getBackendStaffIdsParam();
      showDetailModal(yearTh, -1, type, staffIds);
    });
  }

  let lastModalParams = {};

  function showDetailModal(yearTh, monthIdx, type, staffIds) {
    const $modal = $("#detailModal");
    const $loader = $("#modalLoader");
    const $tableBody = $("#modalTableBody");
    const $title = $("#modalTitle");
    const $sub = $("#modalSubtitle");

    lastModalParams = {
      year_th: yearTh,
      month_idx: monthIdx,
      staff: staffIds,
      data_type: type,
    };

    $modal.modal("show");
    $loader.removeClass("d-none").addClass("d-flex");
    $tableBody.empty();
    $("#modalSearchInput").val("");

    const typeLabel = type === "reply" ? "รายการทักท้วง" : "รายการส่งเบิกทั้งหมด";
    const monthLabel = monthIdx >= 0 ? MONTHS[monthIdx] : "ทุกเดือน (สะสมทั้งปี)";
    $title.text(`รายละเอียด${typeLabel}`);
    $sub.text(`ปีงบประมาณ ${yearTh} | เดือน: ${monthLabel}`);

    $.ajax({
      url: "../api/List_Report_StatusReplyDetail.php",
      method: "POST",
      data: {
        fn: "List_QueryParam",
        year_th: yearTh,
        month_idx: monthIdx,
        staff: staffIds,
        data_type: type,
      },
      dataType: "text",
      success: function (responseText) {
        try {
          const obj = JSON.parse(responseText);
          if (obj.success && obj.data) {
            renderModalTable(obj.data);
            $("#modalFooterInfo").text(`ทั้งหมด ${obj.data.length.toLocaleString()} รายการ`);
            initModalContextMenu();
          } else {
            $tableBody.html('<tr><td colspan="15" class="text-center py-4 text-muted">ไม่พบข้อมูล</td></tr>');
            $("#modalFooterInfo").text("0 รายการ");
          }
        } catch (e) {
          console.error("Decode Error", e);
          $tableBody.html('<tr><td colspan="15" class="text-center py-4 text-danger">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>');
        } finally {
          $loader.removeClass("d-flex").addClass("d-none");
        }
      },
      failure: function () {
        $loader.removeClass("d-flex").addClass("d-none");
        $tableBody.html('<tr><td colspan="15" class="text-center py-4 text-danger">การเชื่อมต่อล้มเหลว</td></tr>');
      },
    });

    $("#modalSearchInput")
      .off("keyup")
      .on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#modalTableBody tr").filter(function () {
          $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
      });

    $("#btnExportModal")
      .off("click")
      .on("click", function () {
        const wb = XLSX.utils.table_to_book(document.getElementById("modalTable"), { sheet: "Sheet1" });
        XLSX.writeFile(wb, `Report_Reply_${type}_${yearTh}.xlsx`);
      });
  }

  function initModalContextMenu() {
    const $menu = $("#context-menu-modal");
    const $rows = $("#modalTableBody tr");

    $rows.off("contextmenu").on("contextmenu", function (e) {
      e.preventDefault();

      const isAdmin = typeof Ext !== "undefined" && Ext.session && String(Ext.session.user_id) === "1";
      if (isAdmin) {
        $("#menu-modal-show-sql").show();
      } else {
        $("#menu-modal-show-sql").hide();
      }

      $menu.css({
        display: "block",
        left: e.pageX,
        top: e.pageY,
      });
    });

    $("#menu-modal-show-sql")
      .off("click")
      .on("click", function () {
        $menu.hide();
        const params = {
          fn: "List_QueryParam",
          ...lastModalParams,
          show_sql: 1,
        };
        const qs = $.param(params);
        window.open("../api/List_Report_StatusReplyDetail.php?" + qs, "_blank");
      });

    $(document).on("click", function () {
      $menu.hide();
    });
  }

  function renderModalTable(data) {
    const $tbody = $("#modalTableBody");
    const $summary = $("#modalSummaryStats");
    let html = "";

    let sumTotal = 0.0;
    let sumReply = 0.0;

    if (data.length === 0) {
      html = '<tr><td colspan="17" class="text-center py-4 text-muted">ไม่พบข้อมูล</td></tr>';
      $summary.html("");
    } else {
      data.forEach((item) => {
        const isReply = item.is_reply || false;
        const statusText = isReply ? "โดนทักท้วง" : "ส่งเบิกปกติ";
        const badgeClass = isReply ? "badge badge-danger badge-pill" : "badge badge-success badge-pill";

        const c_code = item.c_code || "-";
        const c_code_ref = item.c_code_ref || "-";
        const sender = item.emp || "-";
        const receiver = item.po_emp_name || "-";
        const inspector = item.emp_tt || "-";
        const replyDate = item.d_receive_date ? formatDateThai(item.d_receive_date) : "-";
        const reason = item.c_comment || "-";

        const d_arrive = item.d_arrive_date ? formatDateThai(item.d_arrive_date) : "-";
        const d_check = item.d_checking_date ? formatDateThai(item.d_checking_date) : "-";
        const d_send = item.d_create ? formatDateThai(item.d_create) : "-";
        const d_receive_request = item.d_receive_request_date ? formatDateThai(item.d_receive_request_date) : "-";

        const diff1 = item.diff_arrive_check !== "-" ? item.diff_arrive_check + " วัน" : "-";
        const diff2 = item.diff_check_send !== "-" ? item.diff_check_send + " วัน" : "-";
        const diff3 = item.diff_send_receive && item.diff_send_receive !== "-" ? item.diff_send_receive + " วัน" : "รอฝ่ายคลังรับเรื่อง";

        let amt = 0;
        if (item.f_net_total_price) {
          amt = parseFloat(String(item.f_net_total_price).replace(/,/g, ""));
          if (isNaN(amt)) amt = 0;
        }
        sumTotal += amt;
        if (isReply) {
          sumReply += amt;
        }

        const amtStr = amt.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        html += `
            <tr>
                <td class="text-center text-muted small">${item.row_num}</td>
                <td>${c_code_ref}</td>
                <td class="font-weight-bold text-primary">${c_code || "-"}</td>
                <td><div class="text-truncate" style="max-width: 200px;" title="${item.c_name}">${item.c_name}</div></td>
                <td class="text-right font-weight-bold">${amtStr}</td>
                <td><div class="text-truncate" style="max-width: 150px;" title="${item.dc_creditor}">${item.dc_creditor || "-"}</div></td>
                <td class="text-center">${d_arrive}</td>
                <td class="text-center">${d_check}</td>
                <td class="text-center">${d_send}</td>
                <td class="text-center">${d_receive_request}</td>
                <td class="text-center font-weight-bold text-info">${diff1}</td>
                <td class="text-center font-weight-bold text-info">${diff2}</td>
                <td class="text-center font-weight-bold ${item.diff_send_receive === "-" ? "text-warning" : "text-info"}">${diff3}</td>
                <td><small>${sender}</small></td>
                <td><small>${inspector}</small></td>
                <td class="text-center"><span class="${badgeClass}" style="font-size:85%;">${statusText}</span></td>
                <td class="text-center">${replyDate}</td>
                <td><small>${reason}</small></td>
            </tr>
        `;
      });

      const sumTotalStr = sumTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const sumReplyStr = sumReply.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      const statsHtml = `
        <div class="d-flex align-items-center">
            <div class="mr-4 px-3 py-1 rounded" style="background-color: #e8f5e9; border: 1px solid #c3e6cb;">
                <span class="text-success font-weight-bold mr-2"><i class="fas fa-money-bill-wave"></i> ยอดส่งเบิก:</span>
                <span class="h6 mb-0 text-dark font-weight-bold">${sumTotalStr}</span>
            </div>
            <div class="px-3 py-1 rounded" style="background-color: #f8d7da; border: 1px solid #f5c6cb;">
                <span class="text-danger font-weight-bold mr-2"><i class="fas fa-exclamation-circle"></i> ยอดโดนทักท้วง:</span>
                <span class="h6 mb-0 text-dark font-weight-bold">${sumReplyStr}</span>
            </div>
        </div>
      `;
      $summary.html(statsHtml);
    }
    $tbody.html(html);
  }

  function renderQuarterlyDonuts(monthlyData) {
    QUARTER_MONTH_IDX.forEach((idxArr, qi) => {
      let qSent = 0;
      let qReply = 0;
      idxArr.forEach((idx) => {
        qSent += monthlyData[idx].sent;
        qReply += monthlyData[idx].reply;
      });
      const qNormal = qSent - qReply;
      const qPct = qSent > 0 ? ((qReply / qSent) * 100).toFixed(1) : "0.0";

      const el = document.getElementById(`quarterDonut${qi}`);
      if (!el) return;
      if (!quarterCharts[qi]) quarterCharts[qi] = echarts.init(el);

      quarterCharts[qi].setOption(
        {
          tooltip: { trigger: "item" },
          series: [
            {
              type: "pie",
              radius: ["55%", "80%"],
              avoidLabelOverlap: false,
              label: { show: false },
              labelLine: { show: false },
              data: [
                { value: qNormal, name: "ปกติ", itemStyle: { color: "#2f6fed" } },
                { value: qReply, name: "ทักท้วง", itemStyle: { color: "#dc3545" } },
              ],
            },
          ],
        },
        true
      );

      $(`#quarterTotal${qi}`).text(`รวมทั้งหมด: ${qSent.toLocaleString()} เรื่อง`);
      $(`#quarterSub${qi}`).html(
        `<span class="text-primary">ปกติ: ${qNormal.toLocaleString()}</span><br>` +
          `<span class="text-danger">ทักท้วง: ${qReply.toLocaleString()} (${qPct}%)</span>`
      );
    });
  }

  // ===== Waffle Chart =====
  const WAFFLE_COLS = 10;
  const WAFFLE_DOT = 14; // ขนาดจุดปกติ (px) — คงที่เหมือน Weekly Waffle (10px) / Group Breakdown (7px)
  const WAFFLE_MAX_STACK_HEIGHT = 200; // px — เพดานความสูงต่อคอลัมน์ ใช้ลดขนาดจุดลงเฉพาะเดือนที่มีปริมาณเยอะมากจนจะสูงเกินนี้
  const WAFFLE_GAP = 2; // px

  function renderWaffleChart(monthlyData, yearTh) {
    const $row = $("#waffleChartRow");
    if (!$row.length) return;

    // Skip months with no data at all (e.g. future months that haven't happened yet)
    const items = monthlyData
      .map((d, idx) => ({ d, idx }))
      .filter(({ d }) => d.sent > 0);

    const maxTotal = Math.max(1, ...items.map(({ d }) => d.sent));
    const maxRows = Math.max(1, Math.ceil(maxTotal / WAFFLE_COLS));
    // ปกติใช้ WAFFLE_DOT คงที่ ยกเว้นเดือนที่มีปริมาณเยอะมากจนคอลัมน์จะสูงเกิน WAFFLE_MAX_STACK_HEIGHT
    // ถึงจะลดขนาดจุดลงมาให้พอดีแทน (เดิมคำนวณแบบยืดเต็มความสูงคงที่เสมอ ทำให้เมื่อกรองเหลือรายการน้อย
    // เช่น เลือกพนักงาน 1-2 คน จุดขยายใหญ่จนเกือบเต็มความสูง 200px)
    const dotSize = Math.min(WAFFLE_DOT, Math.max(3, Math.floor((WAFFLE_MAX_STACK_HEIGHT - (maxRows - 1) * WAFFLE_GAP) / maxRows)));
    const stackHeight = maxRows * dotSize + (maxRows - 1) * WAFFLE_GAP;

    let legendNormal = 0;
    let legendReply = 0;
    let html = "";

    items.forEach(({ d, idx }) => {
      const normal = Math.max(0, d.sent - d.reply);
      legendNormal += normal;
      legendReply += d.reply;

      const rows = d.sent > 0 ? Math.ceil(d.sent / WAFFLE_COLS) : 0;
      const gridHeight = rows > 0 ? rows * dotSize + (rows - 1) * WAFFLE_GAP : 0;

      let dots = "";
      for (let r = 0; r < d.reply; r++) {
        dots += `<span class="waffle-dot reply" style="width:${dotSize}px;height:${dotSize}px;"></span>`;
      }
      for (let n = 0; n < normal; n++) {
        dots += `<span class="waffle-dot normal" style="width:${dotSize}px;height:${dotSize}px;"></span>`;
      }

      const dispYearTh = idx <= 2 ? yearTh - 1 : yearTh;

      html += `
        <div class="waffle-col" title="${d.month} ${dispYearTh}: ปกติ ${normal.toLocaleString()} / ทักท้วง ${d.reply.toLocaleString()} (รวม ${d.sent.toLocaleString()})">
          <div class="waffle-count-label">${normal.toLocaleString()}/${d.reply.toLocaleString()} (${d.sent.toLocaleString()})</div>
          <div class="waffle-stack" style="height:${stackHeight}px;">
            <div class="waffle-grid" style="grid-template-columns:repeat(${WAFFLE_COLS}, ${dotSize}px); gap:${WAFFLE_GAP}px; height:${gridHeight}px;">
              ${dots}
            </div>
          </div>
          <div class="waffle-month-label">${d.month} ${dispYearTh}</div>
        </div>`;
    });

    $row.html(html);
    $("#waffleLegendNormal").text(`ปกติ (${legendNormal.toLocaleString()})`);
    $("#waffleLegendReply").text(`ทักท้วง (${legendReply.toLocaleString()})`);
  }

  // ===== Weekly Waffle & Trend (อาทิตย์ - เสาร์ ของเดือนที่เลือกอยู่ในตัวกรอง) =====
  // Fiscal month_idx (0=ต.ค. ... 11=ก.ย.) -> ปฏิทินจริง (calendar month/year) เพื่อใช้กับ d_create
  function fiscalIdxToCalendar(monthIdx, yearTh) {
    const calMonth = ((monthIdx + 9) % 12) + 1; // 1-12
    const calYearTh = monthIdx <= 2 ? yearTh - 1 : yearTh;
    const calYearEn = calYearTh - 543;
    return { calMonth, calYearEn };
  }

  // สร้างโครงสัปดาห์ อาทิตย์ - เสาร์ (สัปดาห์ที่ 1, 2, 3, ...) ของเดือนที่เลือก โดยยังไม่รวมยอด
  function buildWeekFrames(monthIdx, yearTh) {
    const { calMonth, calYearEn } = fiscalIdxToCalendar(monthIdx, yearTh);
    const daysInMonth = new Date(calYearEn, calMonth, 0).getDate();
    const firstWeekday = new Date(calYearEn, calMonth - 1, 1).getDay(); // 0 = อาทิตย์
    const totalWeeks = Math.max(1, Math.ceil((daysInMonth + firstWeekday) / 7));

    const weeks = Array.from({ length: totalWeeks }, (_, i) => {
      const startDay = Math.max(1, i * 7 - firstWeekday + 1);
      const endDay = Math.min(daysInMonth, (i + 1) * 7 - firstWeekday);
      const startDate = new Date(calYearEn, calMonth - 1, startDay);
      const endDate = new Date(calYearEn, calMonth - 1, endDay);
      return {
        label: `สัปดาห์ที่ ${i + 1}`,
        weekIdx: i,
        sent: 0,
        reply: 0,
        startDate,
        endDate,
        dateRangeLabel: `${formatWeekDateLabel(startDate)} - ${formatWeekDateLabel(endDate)}`,
      };
    });

    return { weeks, calMonth, calYearEn, firstWeekday };
  }

  // แบ่งเอกสารของเดือนที่เลือกออกเป็นสัปดาห์ อาทิตย์ - เสาร์ (สัปดาห์ที่ 1, 2, 3, ...)
  function computeWeeklyBuckets(filtered, monthIdx, yearTh) {
    const { weeks, calMonth, calYearEn, firstWeekday } = buildWeekFrames(monthIdx, yearTh);

    filtered.forEach((it) => {
      if (!it.d_create) return;
      const dt = new Date(`${it.d_create}T00:00:00`);
      if (isNaN(dt)) return;
      if (dt.getFullYear() !== calYearEn || dt.getMonth() + 1 !== calMonth) return;

      const weekIdx = Math.floor((dt.getDate() - 1 + firstWeekday) / 7);
      if (!weeks[weekIdx]) return;

      weeks[weekIdx].sent++;
      if (Number(it.is_reply) === 1 || it.is_reply === true) {
        weeks[weekIdx].reply++;
      }
    });

    return weeks;
  }

  // แบ่งเอกสารของเดือนที่เลือกออกเป็นสัปดาห์ พร้อมจำแนกยอดตามผู้เบิกแต่ละคน (สำหรับ Heatmap รายสัปดาห์)
  function computeWeeklyStaffMatrix(filtered, monthIdx, yearTh) {
    const { weeks, calMonth, calYearEn, firstWeekday } = buildWeekFrames(monthIdx, yearTh);

    const staffMap = new Map();
    filtered.forEach((it) => {
      if (it.staff_id && it.staff_name) staffMap.set(String(it.staff_id), it.staff_name);
    });
    const staffList = [...staffMap.entries()].sort((a, b) => a[1].localeCompare(b[1], "th"));

    const matrix = {};
    weeks.forEach((w) => {
      matrix[w.weekIdx] = {};
      staffList.forEach(([sid]) => {
        matrix[w.weekIdx][sid] = { sent: 0, reply: 0 };
      });
    });

    filtered.forEach((it) => {
      if (!it.d_create) return;
      const dt = new Date(`${it.d_create}T00:00:00`);
      if (isNaN(dt)) return;
      if (dt.getFullYear() !== calYearEn || dt.getMonth() + 1 !== calMonth) return;

      const weekIdx = Math.floor((dt.getDate() - 1 + firstWeekday) / 7);
      const sid = String(it.staff_id);
      if (!matrix[weekIdx] || !matrix[weekIdx][sid]) return;

      matrix[weekIdx][sid].sent++;
      if (Number(it.is_reply) === 1 || it.is_reply === true) {
        matrix[weekIdx][sid].reply++;
      }
    });

    return { weeks, staffList, matrix };
  }

  function renderWeeklyWaffleAndTrend(filtered) {
    const $row = $("#weekWaffleChartRow");
    if (!$row.length) return;

    const weeks = computeWeeklyBuckets(filtered, selectedMonthIdx, selectedYearTh);

    // ใช้ขนาดจุดคงที่เล็กๆ (เหมือนกับ pictogram ของ Group Breakdown) แทนการยืดขนาดจุด
    // ให้เต็มความสูงคงที่ ซึ่งทำให้จุดใหญ่เกินไปเมื่อยอดรวมต่อสัปดาห์มีค่าน้อย
    const WEEK_WAFFLE_COLS = 14;
    const WEEK_WAFFLE_DOT = 10;
    const WEEK_WAFFLE_GAP = 2;

    const maxTotal = Math.max(1, ...weeks.map((w) => w.sent));
    const maxRows = Math.max(1, Math.ceil(maxTotal / WEEK_WAFFLE_COLS));
    const stackHeight = maxRows * WEEK_WAFFLE_DOT + (maxRows - 1) * WEEK_WAFFLE_GAP;

    let legendNormal = 0;
    let legendReply = 0;
    let html = "";

    weeks.forEach((w) => {
      const normal = Math.max(0, w.sent - w.reply);
      legendNormal += normal;
      legendReply += w.reply;

      if (w.sent === 0) {
        html += `
          <div class="waffle-col" title="${w.label}: ไม่มีข้อมูล">
            <div class="waffle-count-label">0/0 (0)</div>
            <div class="waffle-stack" style="height:${stackHeight}px;">
              <span class="week-waffle-empty">ไม่มี<br>ข้อมูล</span>
            </div>
            <div class="waffle-month-label">${w.label}</div>
          </div>`;
        return;
      }

      const rows = Math.ceil(w.sent / WEEK_WAFFLE_COLS);
      const gridHeight = rows * WEEK_WAFFLE_DOT + (rows - 1) * WEEK_WAFFLE_GAP;

      let dots = "";
      for (let r = 0; r < w.reply; r++) {
        dots += `<span class="waffle-dot reply" style="width:${WEEK_WAFFLE_DOT}px;height:${WEEK_WAFFLE_DOT}px;"></span>`;
      }
      for (let n = 0; n < normal; n++) {
        dots += `<span class="waffle-dot normal" style="width:${WEEK_WAFFLE_DOT}px;height:${WEEK_WAFFLE_DOT}px;"></span>`;
      }

      html += `
        <div class="waffle-col" title="${w.label}: ปกติ ${normal.toLocaleString()} / ทักท้วง ${w.reply.toLocaleString()} (รวม ${w.sent.toLocaleString()})">
          <div class="waffle-count-label">${normal.toLocaleString()}/${w.reply.toLocaleString()} (${w.sent.toLocaleString()})</div>
          <div class="waffle-stack" style="height:${stackHeight}px;">
            <div class="waffle-grid" style="grid-template-columns:repeat(${WEEK_WAFFLE_COLS}, ${WEEK_WAFFLE_DOT}px); gap:${WEEK_WAFFLE_GAP}px; height:${gridHeight}px;">
              ${dots}
            </div>
          </div>
          <div class="waffle-month-label">${w.label}</div>
        </div>`;
    });

    $row.html(html);
    $("#weekWaffleLegendNormal").text(`ปกติ (${legendNormal.toLocaleString()})`);
    $("#weekWaffleLegendReply").text(`ทักท้วง (${legendReply.toLocaleString()})`);

    renderWeeklyTrendChart(weeks);
    renderWeeklyStatsTable(weeks);
  }

  function renderWeeklyTrendChart(weeks) {
    const el = document.getElementById("weeklyTrendChart");
    if (!el) return;
    if (!weeklyTrendChart) weeklyTrendChart = echarts.init(el);

    const labels = weeks.map((w) => w.label);

    let cum = 0;
    const cumulativeData = weeks.map((w) => {
      cum += w.sent;
      return cum;
    });
    const weeklySentData = weeks.map((w) => w.sent);
    const replyData = weeks.map((w) => w.reply);
    const rateData = weeks.map((w) => (w.sent > 0 ? +((w.reply / w.sent) * 100).toFixed(1) : 0));

    const option = {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      legend: { data: ["% ท้วง", "ส่งเบิกสะสม", "ส่งเบิกสัปดาห์นี้", "ทักท้วง"] },
      grid: { left: "3%", right: "4%", bottom: "8%", top: "18%", containLabel: true },
      xAxis: {
        type: "category",
        data: labels,
        axisTick: { alignWithLabel: true },
      },
      yAxis: [
        { type: "value" },
        { type: "value", min: 0, max: 100, axisLabel: { formatter: "{value}%" } },
      ],
      series: [
        {
          name: "ส่งเบิกสะสม",
          type: "bar",
          data: cumulativeData,
          itemStyle: { color: "#3B7DED" },
          label: {
            show: true,
            position: "top",
            formatter: (p) =>
              weeklySentData[p.dataIndex] > 0
                ? `{main|${p.value}}\n{sub|(+${weeklySentData[p.dataIndex]})}`
                : `{main|${p.value}}`,
            rich: {
              main: { color: "#1E3A8A", fontWeight: "bold", lineHeight: 16 },
              sub: { color: "#4A90D2", lineHeight: 14 },
            },
          },
        },
        {
          name: "ส่งเบิกสัปดาห์นี้",
          type: "bar",
          data: weeklySentData,
          itemStyle: { color: "#A9C8F5" },
          label: { show: true, position: "top", color: "#1E3A8A", formatter: (p) => (p.value > 0 ? p.value : "") },
        },
        {
          name: "ทักท้วง",
          type: "bar",
          data: replyData,
          itemStyle: { color: "#E14C4C" },
          label: { show: true, position: "top", color: "#E14C4C", formatter: (p) => (p.value > 0 ? p.value : "") },
        },
        {
          name: "% ท้วง",
          type: "line",
          yAxisIndex: 1,
          data: rateData,
          itemStyle: { color: "#F2A93B" },
          lineStyle: { width: 3, color: "#F2A93B" },
          symbol: "circle",
          symbolSize: 6,
        },
      ],
    };

    weeklyTrendChart.setOption(option, true);
  }

  // ===== Weekly Deep Stats Table (สะสมรวม / รายสัปดาห์ / ทักท้วง / ปกติ / อัตรา / Delta) =====
  function renderWeeklyStatsTable(weeks) {
    const $tbody = $("#weeklyStatsBody");
    if (!$tbody.length) return;

    lastComputedWeeks = weeks;

    if (!weeks.length) {
      $tbody.html('<tr><td colspan="7" class="text-center py-4 text-muted">ไม่พบข้อมูล</td></tr>');
      return;
    }

    let cum = 0;
    let prevRate = null;
    let html = "";

    weeks.forEach((w, idx) => {
      cum += w.sent;
      const normal = w.sent - w.reply;
      const rate = w.sent > 0 ? (w.reply / w.sent) * 100 : 0;
      const rateStr = rate.toFixed(1);

      let deltaHtml = '<span class="mom-delta flat">-</span>';
      if (prevRate !== null) {
        const diff = rate - prevRate;
        if (Math.abs(diff) < 0.05) {
          deltaHtml = '<span class="mom-delta flat">คงที่ (0.0%)</span>';
        } else if (diff < 0) {
          deltaHtml = `<span class="mom-delta down"><span class="mom-arrow">&#8595;</span> ${Math.abs(diff).toFixed(1)}%</span>`;
        } else {
          deltaHtml = `<span class="mom-delta up"><span class="mom-arrow">&#8593;</span> ${diff.toFixed(1)}%</span>`;
        }
      }
      prevRate = rate;

      html += `
        <tr>
            <td>
              <a href="javascript:void(0)" class="week-label-link" data-week="${idx}">${w.label}</a>
              <div class="week-date-range text-muted">${w.dateRangeLabel}</div>
            </td>
            <td class="mom-cell-clickable mom-cum" data-col="cumulative" data-week="${idx}">${cum.toLocaleString()}</td>
            <td class="mom-cell-clickable mom-monthly" data-col="weekly" data-week="${idx}">${w.sent.toLocaleString()}</td>
            <td class="mom-cell-clickable mom-reply" data-col="reply" data-week="${idx}">${w.reply.toLocaleString()}</td>
            <td class="mom-cell-clickable mom-normal" data-col="normal" data-week="${idx}">${normal.toLocaleString()}</td>
            <td class="mom-rate">${rateStr}%</td>
            <td>${deltaHtml}</td>
        </tr>`;
    });

    const totalSent = weeks.reduce((s, w) => s + w.sent, 0);
    const totalReply = weeks.reduce((s, w) => s + w.reply, 0);
    const totalNormal = totalSent - totalReply;
    const totalRate = totalSent > 0 ? ((totalReply / totalSent) * 100).toFixed(1) : "0.0";

    html += `
      <tr class="week-total-row">
          <td class="font-weight-bold"><a href="javascript:void(0)" class="week-label-link" data-week="total">รวมทั้งหมด</a></td>
          <td class="font-weight-bold mom-cell-clickable mom-cum" data-col="cumulative" data-week="total">${totalSent.toLocaleString()}</td>
          <td class="font-weight-bold mom-cell-clickable mom-monthly" data-col="weekly" data-week="total">${totalSent.toLocaleString()}</td>
          <td class="font-weight-bold mom-cell-clickable mom-reply" data-col="reply" data-week="total">${totalReply.toLocaleString()}</td>
          <td class="font-weight-bold mom-cell-clickable mom-normal" data-col="normal" data-week="total">${totalNormal.toLocaleString()}</td>
          <td class="font-weight-bold">${totalRate}%</td>
          <td>-</td>
      </tr>`;

    $tbody.html(html);
    initWeeklyStatsClicks();
  }

  // สร้างสัปดาห์รวม (ทั้งเดือน) จากแถว "รวมทั้งหมด" เพื่อใช้เปิด modal เดียวกับรายสัปดาห์
  function buildTotalWeek() {
    if (!lastComputedWeeks || !lastComputedWeeks.length) return null;
    const first = lastComputedWeeks[0];
    const last = lastComputedWeeks[lastComputedWeeks.length - 1];
    const totalSent = lastComputedWeeks.reduce((s, w) => s + w.sent, 0);
    const totalReply = lastComputedWeeks.reduce((s, w) => s + w.reply, 0);
    return {
      label: "รวมทั้งหมด",
      weekIdx: "total",
      sent: totalSent,
      reply: totalReply,
      startDate: first.startDate,
      endDate: last.endDate,
      dateRangeLabel: `${formatWeekDateLabel(first.startDate)} - ${formatWeekDateLabel(last.endDate)}`,
    };
  }

  function resolveClickedWeek(weekAttr) {
    return weekAttr === "total" ? buildTotalWeek() : lastComputedWeeks[Number(weekAttr)];
  }

  function initWeeklyStatsClicks() {
    $("#weeklyStatsBody .week-label-link")
      .off("click")
      .on("click", function () {
        const w = resolveClickedWeek($(this).data("week"));
        if (!w) return;
        openWeekReasonModal(w);
      });

    $("#weeklyStatsBody .mom-cell-clickable")
      .off("click")
      .on("click", function () {
        const col = $(this).data("col");
        const w = resolveClickedWeek($(this).data("week"));
        if (!w) return;

        if (col === "reply") {
          openWeekReasonModal(w, false);
        } else {
          openWeekDetailModal(col, w);
        }
      });
  }

  // ===== Parse a "d/m/Y" date string (as returned by List_Report_StatusReplyDetail.php) -> Date =====
  function parseDetailDMY(dateStr) {
    if (!dateStr) return null;
    const parts = String(dateStr).split("/");
    if (parts.length !== 3) return null;
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const y = parseInt(parts[2], 10);
    if (!d || !m || !y) return null;
    const dt = new Date(y, m - 1, d);
    return isNaN(dt) ? null : dt;
  }

  // ===== Generic Weekly Item List Modal (สะสมรวม / จำนวนส่งเบิกประจำสัปดาห์ / ผ่านเกณฑ์ปกติ) =====
  function openWeekDetailModal(colType, w) {
    const $modal = $("#momDetailModal");
    const $loader = $("#momModalLoader");
    const $tableWrap = $("#momModalTable").closest(".table-responsive");
    const $tbody = $("#momModalBody");
    const $title = $("#momModalTitle");
    const yearTh = selectedYearTh;
    const staffIds = getBackendStaffIdsParam();

    const titleMap = {
      cumulative: `รายการส่งเบิกสะสมภายในเดือน จนถึง ${w.label} (${w.dateRangeLabel})`,
      weekly: `รายการส่งเบิกประจำ ${w.label} (${w.dateRangeLabel})`,
      normal: `รายการผ่านเกณฑ์ปกติประจำ ${w.label} (${w.dateRangeLabel})`,
    };
    $title.html(`<i class="fas fa-list-ul mr-2"></i>${titleMap[colType] || "รายการ"}`);

    $tbody.empty();
    $("#momModalFooterInfo").text("");
    $tableWrap.addClass("d-none");
    $loader.removeClass("d-none").addClass("d-flex");
    $modal.modal("show");

    fetchDetailData(selectedMonthIdx, "sent", yearTh, staffIds).then(function (items) {
      const startTime = w.startDate.getTime();
      const endTime = w.endDate.getTime();

      let weekItems = (items || []).filter((it) => {
        const dt = parseDetailDMY(it.d_create);
        if (!dt) return false;
        // "cumulative" = ทุกรายการตั้งแต่ต้นเดือนจนถึงวันสุดท้ายของสัปดาห์นี้
        if (colType === "cumulative") {
          return dt.getTime() <= endTime;
        }
        return dt.getTime() >= startTime && dt.getTime() <= endTime;
      });

      if (colType === "normal") {
        weekItems = weekItems.filter((it) => !(Number(it.is_reply) === 1 || it.is_reply === true));
      }

      weekItems.forEach((it, idx) => (it.row_num = idx + 1));

      $loader.removeClass("d-flex").addClass("d-none");
      $tableWrap.removeClass("d-none");
      renderMomModalTable(weekItems);
      $("#momModalFooterInfo").text(`ทั้งหมด ${weekItems.length.toLocaleString()} รายการ`);
    });
  }

  // ===== Weekly Reason Analysis Modal (ทะเบียนรายการที่ถูกทักท้วงในสัปดาห์) =====
  function openWeekReasonModal(w, showTopDefects) {
    if (showTopDefects === undefined) showTopDefects = true;

    const $modal = $("#weekReasonModal");
    const $loader = $("#weekReasonLoader");
    const $tableWrap = $("#weekReasonTableWrap");
    const $title = $("#weekReasonModalTitle");
    const $topDefectWrap = $("#weekTopDefectWrap");
    const yearTh = selectedYearTh;
    const staffIds = getBackendStaffIdsParam();

    $title.html(
      `<i class="fas fa-magic mr-2"></i>วิเคราะห์ประเภทเอกสารและเหตุผลที่ถูกทักท้วงสูงสุด - ${w.label} (${w.dateRangeLabel})`
    );

    $("#weekReasonBody").empty();
    $("#weekReasonFooterInfo").text("");
    $("#weekTopDefectBody").empty();
    $topDefectWrap.addClass("d-none");
    $tableWrap.addClass("d-none");
    $loader.removeClass("d-none").addClass("d-flex");
    $modal.modal("show");

    fetchDetailData(selectedMonthIdx, "reply", yearTh, staffIds).then(function (items) {
      const startTime = w.startDate.getTime();
      const endTime = w.endDate.getTime();

      const weekItems = (items || []).filter((it) => {
        const dt = parseDetailDMY(it.d_create);
        if (!dt) return false;
        return dt.getTime() >= startTime && dt.getTime() <= endTime;
      });

      weekItems.forEach((it, idx) => (it.row_num = idx + 1));

      if (showTopDefects) {
        renderWeekTopDefects(weekItems);
      }
      renderWeekReasonTable(weekItems);

      $loader.removeClass("d-flex").addClass("d-none");
      if (showTopDefects) {
        $topDefectWrap.removeClass("d-none");
      }
      $tableWrap.removeClass("d-none");
      $("#weekReasonFooterInfo").text(`ทั้งหมด ${weekItems.length.toLocaleString()} รายการ`);
    });
  }

  // ===== Top-5 most common reject reasons/categories within the selected week =====
  const DEFAULT_DEFECT_REASON = "รับคืนแก้ไขตามกระบวนการ (ไม่ได้ระบุสาเหตุชัดเจน)";

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // ===== เลขที่เอกสารอ้างอิง 3 คอลัมน์แยกกัน: เลขตรวจรับ / เลขสัญญา / เลขใบเบิก (ใช้ร่วมกันทุกตารางรายการเอกสาร) =====
  function buildDocCodeTds(item) {
    const codeCheck = item.c_code || "-";
    const codeContract = item.c_code_contract || "-";
    const codeWithdraw = item.c_code_ref || "-";
    return `
      <td title="${escapeHtml(codeCheck)}">${escapeHtml(codeCheck)}</td>
      <td title="${escapeHtml(codeContract)}">${escapeHtml(codeContract)}</td>
      <td class="registry-doc-withdraw" title="${escapeHtml(codeWithdraw)}">${escapeHtml(codeWithdraw)}</td>`;
  }

  function renderWeekTopDefects(items) {
    const $body = $("#weekTopDefectBody");

    if (!items.length) {
      $body.html('<div class="top-defect-empty">ไม่พบข้อมูล</div>');
      return;
    }

    const counts = {};
    items.forEach((item) => {
      let key = (item.c_comment || "").toString().trim();
      if (!key) key = DEFAULT_DEFECT_REASON;
      counts[key] = (counts[key] || 0) + 1;
    });

    const ranked = Object.keys(counts)
      .map((reason) => ({ reason, count: counts[reason] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    let html = "";
    ranked.forEach((row, idx) => {
      html += `
        <div class="top-defect-row">
            <div class="top-defect-text">อันดับที่ ${idx + 1}: <strong>${escapeHtml(row.reason)}</strong></div>
            <span class="top-defect-badge">${row.count.toLocaleString()} เคส</span>
        </div>`;
    });

    $body.html(html);
  }

  function renderWeekReasonTable(items) {
    const $tbody = $("#weekReasonBody");

    if (!items.length) {
      $tbody.html('<tr><td colspan="8" class="text-center py-4 text-muted">ไม่พบข้อมูล</td></tr>');
      return;
    }

    let html = "";
    items.forEach((item, idx) => {
      const isReply = Number(item.is_reply) === 1 || item.is_reply === true;
      const statusText = isReply ? "ถูกทักท้วงแก้ไข" : "ผ่านปกติ";
      const statusClass = isReply ? "status-reply" : "status-normal";
      const reasonId = `weekReason${idx}`;
      const btnId = `weekReasonBtn${idx}`;

      const reasonCell = isReply
        ? `<button type="button" class="mom-toggle-reason" id="${btnId}" data-target="${reasonId}">
             <i class="fas fa-search"></i>แสดงเหตุผลทักท้วง
           </button>
           <div class="mom-reason-box d-none" id="${reasonId}" data-btn="${btnId}">
             <div class="mom-reason-title">รายละเอียดข้อทักท้วง:</div>
             <div class="mom-reason-text">${item.c_comment || "-"}</div>
             <a href="javascript:void(0)" class="mom-reason-hide" data-target="${reasonId}" data-btn="${btnId}">ซ่อนรายละเอียด</a>
           </div>`
        : "-";

      html += `
        <tr>
            ${buildDocCodeTds(item)}
            <td>${item.emp || "-"}</td>
            <td><div class="text-truncate" style="max-width:100%;" title="${item.dc_creditor || ""}">${item.dc_creditor || "-"}</div></td>
            <td class="text-center">${item.d_create ? formatDateThai(item.d_create) : "-"}</td>
            <td class="text-center"><span class="mom-status ${statusClass}">${statusText}</span></td>
            <td>${reasonCell}</td>
        </tr>`;
    });

    $tbody.html(html);
  }

  // ===== Reply Reason Registry (รายละเอียดบันทึกและประวัติสารบบเรื่องที่ถูกทักท้วงย้อนหลัง) =====
  function renderReplyRegistry() {
    const $tbody = $("#replyRegistryBody");
    const $badge = $("#replyRegistryCountBadge");
    if (!$tbody.length) return;

    const scope = $("#replyRegistryScope").val() || "month";
    const yearTh = selectedYearTh;
    const staffIds = getBackendStaffIdsParam();
    const gtStartVal = $("#gtDateStart").val();
    const gtEndVal = $("#gtDateEnd").val();

    $tbody.html('<tr><td colspan="8" class="text-center py-4 text-muted">กำลังโหลดข้อมูล...</td></tr>');

    let requests = [];
    if (scope === "all") {
      // "สะสมทั้งหมด": ดึงข้อมูลด้วยช่วงวันที่ของ Grand Total ตรงๆ (กรองด้วยวันที่ทักท้วงจริง d_doc_date)
      // แทนการวนดึงทีละเดือนภายในปีงบประมาณเดียว (yearTh) ซึ่งจะพลาดเอกสารที่สร้างใบเบิกนอกปีงบประมาณ
      // ที่เลือกไว้ แต่ถูกทักท้วงในช่วงวันที่ต้องการ ทำให้ตัวเลข "พบ X รอบ" ต่ำกว่ายอด Grand Total จริง
      if (gtStartVal && gtEndVal) {
        requests.push(fetchDetailData(null, "reply", null, staffIds, { start: gtStartVal, end: gtEndVal }));
      } else {
        for (let m = 0; m <= 11; m++) {
          requests.push(fetchDetailData(m, "reply", yearTh, staffIds));
        }
      }
    } else {
      requests.push(fetchDetailData(selectedMonthIdx, "reply", yearTh, staffIds));
    }

    const requestToken = ++replyRegistryRequestToken;

    Promise.all(requests).then(function (results) {
      if (requestToken !== replyRegistryRequestToken) return; // มีการเปลี่ยนตัวกรอง/ขอบเขตใหม่แล้ว ผลลัพธ์นี้ล้าสมัย

      let items = [];
      results.forEach((r) => {
        if (Array.isArray(r)) items = items.concat(r);
      });

      // กรองตามช่วงวันที่ในกล่อง "ช่วงวันที่สำหรับสรุปยอด Grand Total" (#gtDateStart / #gtDateEnd)
      // เพื่อให้ตัวเลข "พบ X รอบ" ตรงกับ "ยอดทักท้วงสะสมสุทธิ" ของ Grand Total bar ด้านบนเสมอ
      // ใช้ all_round_dates (รายการวันที่ทักท้วงทุกรอบของเอกสาร ไม่จำกัดแค่รอบที่ 1-2) จาก backend
      // เพื่อนับรอบทักท้วงที่อยู่ในช่วงวันที่ได้ครบถ้วนแม้เอกสารจะถูกทักท้วงมากกว่า 2 รอบก็ตาม
      // (สำหรับ scope=all ที่ดึงด้วย date_by=protest ไปแล้ว การกรองนี้จะเป็นการยืนยันซ้ำ ไม่ตัดรายการเพิ่ม)

      if (gtStartVal || gtEndVal) {
        items = items
          .map((it) => {
            const allDates = Array.isArray(it.all_round_dates) ? it.all_round_dates : [];
            const roundsInRange = allDates.filter((iso) => {
              if (!iso) return false;
              if (gtStartVal && iso < gtStartVal) return false;
              if (gtEndVal && iso > gtEndVal) return false;
              return true;
            }).length;
            it._roundsInRange = roundsInRange;
            return it;
          })
          .filter((it) => it._roundsInRange > 0);
      } else {
        items.forEach((it) => (it._roundsInRange = Number(it.protest_round_total) || 0));
      }

      items.sort((a, b) => {
        const da = parseDetailDMY(a.d_receive_date) || parseDetailDMY(a.d_create) || new Date(0);
        const db = parseDetailDMY(b.d_receive_date) || parseDetailDMY(b.d_create) || new Date(0);
        return db - da;
      });

      renderReplyRegistryTable(items);
      // แสดง "รายการ" หลักเป็นจำนวนเอกสาร (ไม่ซ้ำ) และแยกจำนวนรอบทักท้วงซ้ำ (รอบที่ 2 เป็นต้นไปของเอกสารเดียวกัน)
      // ไว้ต่อท้ายในวงเล็บ เพื่อไม่ให้สับสนกับจำนวนรอบทักท้วงทั้งหมด (นับซ้ำ) ของ Grand Total ด้านบน
      // เช่น เอกสาร 49 ใบ ถูกทักท้วงรวม 55 รอบ (มี 6 รอบที่เป็นการทักท้วงซ้ำในเอกสารเดิม) จะแสดงเป็น "พบ 49 รายการ (6 โดนทักท้วงซ้ำ)"
      const totalRounds = items.reduce((sum, it) => sum + (it._roundsInRange || 0), 0);
      const repeatCount = Math.max(0, totalRounds - items.length);
      const repeatText = repeatCount > 0 ? ` (${repeatCount.toLocaleString()} โดนทักท้วงซ้ำ)` : "";
      $badge.text(`พบ ${items.length.toLocaleString()} รายการ${repeatText}`);
    });
  }

  // สร้าง cell แสดงรายละเอียดของ "รอบทักท้วง" หนึ่งรอบ (วันที่ทักท้วง / วันที่รับคืน / เหตุผล)
  // extraBadgeHtml (ถ้ามี) ใช้แสดงจำนวนรอบที่เกิน 2 รอบ (เช่น "+1 รอบ") ต่อท้ายในเซลล์รอบที่ 2
  function buildRoundTd(docDate, receiveDate, comment, extraBadgeHtml) {
    if (!docDate && !receiveDate) {
      return `<td class="text-center text-muted">-${extraBadgeHtml || ""}</td>`;
    }
    const reason = comment || "-";
    const receiveText = receiveDate ? `<div class="mom-round-receive">รับคืน: ${receiveDate}</div>` : `<div class="mom-round-receive text-warning">ยังไม่รับคืน</div>`;
    return `
      <td>
        <div class="mom-round-cell" title="${escapeHtml(reason)}">
          <div class="mom-round-date">${docDate || "-"}${extraBadgeHtml || ""}</div>
          ${receiveText}
        </div>
      </td>`;
  }

  function renderReplyRegistryTable(items) {
    const $tbody = $("#replyRegistryBody");

    if (!items.length) {
      $tbody.html('<tr><td colspan="10" class="text-center py-4 text-muted">ไม่พบข้อมูลการทักท้วง</td></tr>');
      return;
    }

    let html = "";
    items.forEach((item) => {
      const sendDate = item.d_create ? formatDateThai(item.d_create) : "-";
      const creditor = item.dc_creditor || item.po_emp_name || "-";
      const reason = item.c_comment || "-";
      const roundTotal = Number(item.protest_round_total) || 0;
      const extraRoundsBadge = roundTotal > 2
        ? `<span class="mom-round-extra-badge" title="ทักท้วงทั้งหมด ${roundTotal} รอบ (แสดงเฉพาะรอบที่ 1-2)">+${roundTotal - 2} รอบ</span>`
        : "";

      html += `
        <tr>
            ${buildDocCodeTds(item)}
            <td>${escapeHtml(item.emp || "-")}</td>
            <td><div class="text-truncate" style="max-width:220px;" title="${escapeHtml(creditor)}">${escapeHtml(creditor)}</div></td>
            <td class="text-center">${sendDate}</td>
            ${buildRoundTd(item.round1_doc_date, item.round1_receive_date, item.round1_comment)}
            ${buildRoundTd(item.round2_doc_date, item.round2_receive_date, item.round2_comment, extraRoundsBadge)}
            <td><div class="text-truncate" style="max-width:280px;" title="${escapeHtml(reason)}">${escapeHtml(reason)}</div></td>
        </tr>`;
    });

    $tbody.html(html);
  }

  // ===== Overall Group Breakdown (pictogram + legend + trend line + percent bar) =====
  const GB_COLS = 26;
  const GB_DOT = 7;
  const GB_GAP = 2;
  const GB_COLOR = { g1n: "#3B82F6", g1r: "#EF4444", g2n: "#10B981", g2r: "#F97316", on: "#8B5CF6", or: "#EC4899" };

  function computeGroupTotals(filtered) {
    const totals = {
      g1: { normal: 0, reply: 0 },
      g2: { normal: 0, reply: 0 },
      other: { normal: 0, reply: 0 },
    };
    filtered.forEach((it) => {
      let grp = getStaffGroup(it.staff_id);
      if (!totals[grp]) grp = "other";
      const isReply = Number(it.is_reply) === 1 || it.is_reply === true;
      if (isReply) totals[grp].reply++;
      else totals[grp].normal++;
    });
    return totals;
  }

  function renderGroupBreakdown(filtered) {
    const $row = $("#groupBreakdownRow");
    if (!$row.length) return;

    const totals = computeGroupTotals(filtered);
    const groups = [
      { key: "g1", label: GROUP_LABELS.g1, normalClass: "g1n", replyClass: "g1r" },
      { key: "g2", label: GROUP_LABELS.g2, normalClass: "g2n", replyClass: "g2r" },
      { key: "other", label: GROUP_LABELS.other, normalClass: "on", replyClass: "or" },
    ];

    let html = "";
    groups.forEach((g) => {
      const t = totals[g.key];
      const total = t.normal + t.reply;
      const rows = total > 0 ? Math.ceil(total / GB_COLS) : 0;
      const gridHeight = rows > 0 ? rows * GB_DOT + (rows - 1) * GB_GAP : 0;

      let dots = "";
      for (let r = 0; r < t.reply; r++) {
        dots += `<span class="gb-dot ${g.replyClass}" style="width:${GB_DOT}px;height:${GB_DOT}px;"></span>`;
      }
      for (let n = 0; n < t.normal; n++) {
        dots += `<span class="gb-dot ${g.normalClass}" style="width:${GB_DOT}px;height:${GB_DOT}px;"></span>`;
      }

      html += `
        <div class="gb-col" title="${g.label}: ปกติ ${t.normal.toLocaleString()} / ทักท้วง ${t.reply.toLocaleString()} (รวม ${total.toLocaleString()})">
          <div class="gb-waffle-stack">
            <div class="gb-grid" style="grid-template-columns:repeat(${GB_COLS}, ${GB_DOT}px); gap:${GB_GAP}px; height:${gridHeight}px;">
              ${dots}
            </div>
          </div>
          <div class="gb-divider"></div>
          <div class="gb-title">${g.label}</div>
          <div class="gb-sub">${total.toLocaleString()} เรื่อง</div>
        </div>`;
    });
    $row.html(html);

    const legendItems = [
      { cls: "g1n", label: `${GROUP_LABELS.g1} (ปกติ)`, value: totals.g1.normal },
      { cls: "g1r", label: `${GROUP_LABELS.g1} (ทักท้วง)`, value: totals.g1.reply },
      { cls: "g2n", label: `${GROUP_LABELS.g2} (ปกติ)`, value: totals.g2.normal },
      { cls: "g2r", label: `${GROUP_LABELS.g2} (ทักท้วง)`, value: totals.g2.reply },
      { cls: "on", label: `${GROUP_LABELS.other} (ปกติ)`, value: totals.other.normal },
      { cls: "or", label: `${GROUP_LABELS.other} (ทักท้วง)`, value: totals.other.reply },
    ];

    let legendHtml = `<div class="gb-legend-title"><i class="fas fa-tags"></i> สัญลักษณ์และยอดสรุป</div>`;
    legendItems.forEach((it) => {
      legendHtml += `<div class="gb-legend-item"><span class="gb-legend-dot ${it.cls}"></span>${it.label}: <span class="gb-legend-value ${it.cls}-text">${it.value.toLocaleString()}</span></div>`;
    });
    $("#groupBreakdownLegend").html(legendHtml);

    renderGroupTrendChart(legendItems);
    renderGroupPercentBar(legendItems);
  }

  function renderGroupTrendChart(legendItems) {
    const el = document.getElementById("groupTrendChart");
    if (!el) return;
    if (!groupTrendChart) groupTrendChart = echarts.init(el);

    const categories = legendItems.map((it) => it.label);
    const data = legendItems.map((it) => ({ value: it.value, itemStyle: { color: GB_COLOR[it.cls] } }));

    const option = {
      tooltip: { trigger: "axis" },
      grid: { left: "2%", right: "3%", bottom: "6%", top: "14%", containLabel: true },
      xAxis: {
        type: "category",
        data: categories,
        axisLabel: { fontSize: 11, color: "#64748b" },
        axisLine: { lineStyle: { color: "#e2e8f0" } },
        axisTick: { alignWithLabel: true },
      },
      yAxis: { type: "value", show: false },
      series: [
        {
          type: "line",
          data: data,
          smooth: true,
          symbol: "circle",
          symbolSize: 9,
          lineStyle: { width: 3, color: "#8B5CF6" },
          areaStyle: { color: "rgba(139, 92, 246, 0.15)" },
          label: { show: false },
        },
      ],
    };

    groupTrendChart.setOption(option, true);
  }

  function renderGroupPercentBar(legendItems) {
    const el = document.getElementById("groupPercentBarChart");
    if (!el) return;
    if (!groupPercentBarChart) groupPercentBarChart = echarts.init(el);

    const total = legendItems.reduce((s, it) => s + it.value, 0) || 1;

    const series = legendItems.map((it) => {
      const pct = +((it.value / total) * 100).toFixed(1);
      return {
        name: it.label,
        type: "bar",
        stack: "total",
        barWidth: 46,
        data: [pct],
        itemStyle: { color: GB_COLOR[it.cls] },
        label: {
          show: true,
          formatter: () => (pct >= 5 ? pct.toFixed(1) + "%" : ""),
          color: "#fff",
          fontWeight: "bold",
          fontSize: 12,
        },
      };
    });

    const option = {
      title: {
        text: "กราฟแท่งเปรียบเทียบสัดส่วนร้อยละ (%) การผ่านเกณฑ์และข้อทักท้วงแยกตามสายงาน",
        left: "center",
        top: 8,
        textStyle: { fontSize: 14, fontWeight: 600, color: "#475569" },
      },
      grid: { left: "2%", right: "3%", top: 55, bottom: 28, containLabel: true },
      tooltip: {
        trigger: "item",
        formatter: (p) => `${p.seriesName}: ${p.value}%`,
      },
      xAxis: {
        type: "value",
        min: 0,
        max: 100,
        axisLabel: { formatter: "{value}%", color: "#94a3b8", fontSize: 11 },
        splitLine: { lineStyle: { color: "#dfe1e2" } },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      yAxis: {
        type: "category",
        data: [""],
        show: false,
      },
      series: series,
    };

    groupPercentBarChart.setOption(option, true);
  }

  // ===== Shared helper: trim monthly data to "up to current month" and drop trailing empty months =====
  function getTrimmedMonthlyData(monthlyData) {
    let chartData = [...monthlyData];

    const curFiscalEn = currentFiscalYearEn();
    const selectedYearEn = selectedYearTh - 543;

    if (selectedYearEn === curFiscalEn) {
      const currentMonthIdx = currentMonthIdxInFiscal();
      chartData = monthlyData.slice(0, currentMonthIdx + 1);
    }

    // Drop trailing months with no data at all (e.g. a future month that hasn't happened yet)
    while (chartData.length > 0 && chartData[chartData.length - 1].sent === 0) {
      chartData = chartData.slice(0, -1);
    }

    return chartData.map((d, i) => ({
      ...d,
      monthIdx: i,
      dispYearTh: i <= 2 ? selectedYearTh - 1 : selectedYearTh,
    }));
  }

  // ===== Cumulative Trend Chart (bars + rate line) =====
  function renderCumulativeTrendChart(monthlyData) {
    const el = document.getElementById("cumulativeTrendChart");
    if (!el) return;
    if (!cumulativeTrendChart) cumulativeTrendChart = echarts.init(el);

    const chartData = getTrimmedMonthlyData(monthlyData);

    const chartLabels = chartData.map((d) => `${d.month} ${d.dispYearTh}`);

    let cum = 0;
    const cumulativeData = chartData.map((d) => {
      cum += d.sent;
      return cum;
    });
    const monthlySentData = chartData.map((d) => d.sent);
    const replyData = chartData.map((d) => d.reply);
    const rateData = chartData.map((d) => (d.sent > 0 ? +((d.reply / d.sent) * 100).toFixed(1) : 0));

    const option = {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      legend: { data: ["อัตราทักท้วง (%)", "ส่งเบิกสะสม", "ส่งเบิกเดือนนี้", "ทักท้วง"] },
      grid: { left: "3%", right: "4%", bottom: "8%", top: "18%", containLabel: true },
      xAxis: {
        type: "category",
        data: chartLabels,
        axisTick: { alignWithLabel: true },
      },
      yAxis: [
        { type: "value" },
        { type: "value", min: 0, max: 100, axisLabel: { formatter: "{value}%" } },
      ],
      series: [
        {
          name: "ส่งเบิกสะสม",
          type: "bar",
          data: cumulativeData,
            itemStyle: { color: "#3B7DED" },
          label: {
            show: true,
            position: "top",
            formatter: (p) => `{main|${p.value}}\n{sub|(+${monthlySentData[p.dataIndex]})}`,
            rich: {
              main: { color: "#1E3A8A", fontWeight: "bold", lineHeight: 16 },
              sub: { color: "#4A90D2", lineHeight: 14 },
            },
          },
        },
        {
          name: "ส่งเบิกเดือนนี้",
          type: "bar",
          data: monthlySentData,
          itemStyle: { color: "#A9C8F5" },
          label: { show: true, position: "top", color: "#1E3A8A" },
        },
        {
          name: "ทักท้วง",
          type: "bar",
          data: replyData,
          itemStyle: { color: "#E14C4C" },
          label: { show: true, position: "top", color: "#E14C4C" },
        },
        {
          name: "อัตราทักท้วง (%)",
          type: "line",
          yAxisIndex: 1,
          data: rateData,
          itemStyle: { color: "#F2A93B" },
          lineStyle: { width: 3 },
          symbol: "circle",
          symbolSize: 6,
        },
      ],
    };

    cumulativeTrendChart.setOption(option, true);
  }

  // ===== MoM Trends Table (สะสมรวม / รายเดือน / ทักท้วง / ปกติ / อัตรา / Delta) =====
  function renderMomTrendsTable(monthlyData) {
    const $tbody = $("#momTrendsBody");
    if (!$tbody.length) return;

    const rows = getTrimmedMonthlyData(monthlyData);

    if (!rows.length) {
      $tbody.html('<tr><td colspan="7" class="text-center py-4 text-muted">ไม่พบข้อมูล</td></tr>');
      return;
    }

    let cum = 0;
    let prevRate = null;
    let html = "";

    rows.forEach((d) => {
      cum += d.sent;
      const normal = d.sent - d.reply;
      const rate = d.sent > 0 ? (d.reply / d.sent) * 100 : 0;
      const rateStr = rate.toFixed(1);

      let deltaHtml = '<span class="mom-delta flat">-</span>';
      if (prevRate !== null) {
        const diff = rate - prevRate;
        if (Math.abs(diff) < 0.05) {
          deltaHtml = '<span class="mom-delta flat">0.0%</span>';
        } else if (diff < 0) {
          deltaHtml = `<span class="mom-delta down"><span class="mom-arrow">&#8595;</span> ${Math.abs(diff).toFixed(1)}%</span>`;
        } else {
          deltaHtml = `<span class="mom-delta up"><span class="mom-arrow">&#8593;</span> ${diff.toFixed(1)}%</span>`;
        }
      }
      prevRate = rate;

      const fullLabel = `${d.fullMonth} ${d.dispYearTh}`;

      // เดือนที่ไม่มีข้อมูลเลย (สะสม/ส่งเบิก/ทักท้วง/ผ่านเกณฑ์ = 0 ทั้งหมด เช่นเดือนที่อยู่นอกช่วงวันที่ที่กรองในกล่อง
      // Grand Total) ให้ทำเป็นแถวสีเทาทั้งแถว ตั้งแต่คอลัมน์ "สะสมรวม" ถึง "ผลต่างเทียบเดือนก่อนหน้า (Delta)"
      // และกดดูรายละเอียดไม่ได้ทุกคอลัมน์ในแถวนั้น
      const isEmptyRow = cum === 0 && d.sent === 0 && d.reply === 0 && normal === 0;

      const momCell = (value, col, colorClass) => {
        if (isEmptyRow || value === 0) {
          return `<td class="mom-cell-disabled">${value.toLocaleString()}</td>`;
        }
        return `<td class="mom-cell-clickable ${colorClass}" data-col="${col}" data-month="${d.monthIdx}" data-label="${fullLabel}">${value.toLocaleString()}</td>`;
      };

      const rateCell = isEmptyRow
        ? `<td class="mom-cell-disabled">${rateStr}%</td>`
        : `<td class="mom-rate">${rateStr}%</td>`;
      const deltaCell = isEmptyRow
        ? `<td class="mom-cell-disabled">-</td>`
        : `<td>${deltaHtml}</td>`;

      html += `
        <tr>
            <td>${fullLabel}</td>
            ${momCell(cum, "cumulative", "mom-cum")}
            ${momCell(d.sent, "monthly", "mom-monthly")}
            ${momCell(d.reply, "reply", "mom-reply")}
            ${momCell(normal, "normal", "mom-normal")}
            ${rateCell}
            ${deltaCell}
        </tr>`;
    });

    $tbody.html(html);
    initMomTableClicks();
  }

  function initMomTableClicks() {
    $("#momTrendsBody .mom-cell-clickable")
      .off("click")
      .on("click", function () {
        const col = $(this).data("col");
        const monthIdx = Number($(this).data("month"));
        const label = $(this).data("label");
        openMomDetailModal(col, monthIdx, label);
      });
  }

  // ===== Staff x Month Heatmap =====
  function heatClassAndRate(sent, reply) {
    if (!sent) return { cls: "heat-none", rate: null };
    const rate = (reply / sent) * 100;
    if (rate <= 0) return { cls: "heat-zero", rate };
    if (rate <= 30) return { cls: "heat-low", rate };
    if (rate <= 60) return { cls: "heat-mid", rate };
    return { cls: "heat-high", rate };
  }

  function renderStaffHeatmap(filtered, monthlyData) {
    const $header = $("#heatmapHeaderRow");
    const $body = $("#heatmapBody");
    const $footer = $("#heatmapFooter");
    if (!$header.length || !$body.length) return;

    const monthRows = getTrimmedMonthlyData(monthlyData);

    if (!monthRows.length) {
      $header.find("th:not(.heatmap-corner)").remove();
      $body.html('<tr><td class="text-center py-4 text-muted">ไม่พบข้อมูล</td></tr>');
      $footer.html("");
      return;
    }

    // Unique staff list (sorted, Thai locale) present in the filtered data
    const staffMap = new Map();
    filtered.forEach((it) => {
      if (it.staff_id && it.staff_name) staffMap.set(String(it.staff_id), it.staff_name);
    });
    const staffList = [...staffMap.entries()].sort((a, b) => a[1].localeCompare(b[1], "th"));

    if (!staffList.length) {
      $header.find("th:not(.heatmap-corner)").remove();
      $body.html('<tr><td class="text-center py-4 text-muted">ไม่พบข้อมูล</td></tr>');
      $footer.html("");
      return;
    }

    // Build matrix[monthIdx][staffId] = {sent, reply}
    const matrix = {};
    monthRows.forEach((m) => (matrix[m.monthIdx] = {}));
    staffList.forEach(([sid]) => {
      monthRows.forEach((m) => {
        matrix[m.monthIdx][sid] = { sent: 0, reply: 0 };
      });
    });

    const monthIdxSet = new Set(monthRows.map((m) => m.monthIdx));
    filtered.forEach((it) => {
      if (!monthIdxSet.has(it.month_idx)) return;
      const sid = String(it.staff_id);
      if (!matrix[it.month_idx][sid]) return;
      matrix[it.month_idx][sid].sent++;
      if (Number(it.is_reply) === 1 || it.is_reply === true) {
        matrix[it.month_idx][sid].reply++;
      }
    });

    // Header
    let headerHtml = '<th class="heatmap-corner">เดือน / ผู้เบิก</th>';
    staffList.forEach(([sid, name]) => {
      headerHtml += `<th title="${name}">${name}</th>`;
    });
    $header.html(headerHtml);

    // Body rows
    let bodyHtml = "";
    const staffTotals = {};
    staffList.forEach(([sid]) => (staffTotals[sid] = { sent: 0, reply: 0 }));

    monthRows.forEach((m) => {
      const fullLabel = `${m.fullMonth} ${m.dispYearTh}`;
      bodyHtml += `<tr><td>${m.month} ${m.dispYearTh}</td>`;
      staffList.forEach(([sid, name]) => {
        const cell = matrix[m.monthIdx][sid];
        staffTotals[sid].sent += cell.sent;
        staffTotals[sid].reply += cell.reply;
        const { cls, rate } = heatClassAndRate(cell.sent, cell.reply);
        if (cell.sent > 0) {
          bodyHtml += `<td class="heatmap-cell hc-clickable ${cls}" data-staff-id="${sid}" data-staff-name="${name}" data-month="${m.monthIdx}" data-label="${fullLabel}">
              <span class="hc-frac">${cell.sent}/${cell.reply}</span>
              <span class="hc-pct">${rate.toFixed(0)}%</span>
            </td>`;
        } else {
          bodyHtml += `<td class="heatmap-cell ${cls}">-</td>`;
        }
      });
      bodyHtml += "</tr>";
    });
    $body.html(bodyHtml);

    // Footer (grand totals per staff)
    const allMonthIdxCsv = monthRows.map((m) => m.monthIdx).join(",");
    let footerHtml = '<tr><td class="heatmap-total-label">สรุปผลรวม</td>';
    staffList.forEach(([sid, name]) => {
      const t = staffTotals[sid];
      const { cls, rate } = heatClassAndRate(t.sent, t.reply);
      if (t.sent > 0) {
        footerHtml += `<td class="heatmap-cell heatmap-cell-total hc-clickable ${cls}" data-staff-id="${sid}" data-staff-name="${name}" data-months="${allMonthIdxCsv}"><span class="hc-frac">${t.sent}/${t.reply}</span><span class="hc-pct">${rate.toFixed(0)}%</span></td>`;
      } else {
        footerHtml += `<td class="heatmap-cell heatmap-cell-total ${cls}">-</td>`;
      }
    });
    footerHtml += "</tr>";
    $footer.html(footerHtml);

    initHeatmapClicks();
  }

  function initHeatmapClicks() {
    $("#heatmapBody .hc-clickable")
      .off("click")
      .on("click", function () {
        const staffId = $(this).data("staff-id");
        const staffName = $(this).data("staff-name");
        const monthIdx = Number($(this).data("month"));
        const label = $(this).data("label");
        openHeatmapDetailModal(staffId, staffName, monthIdx, label);
      });

    $("#heatmapFooter .hc-clickable")
      .off("click")
      .on("click", function () {
        const staffId = $(this).data("staff-id");
        const staffName = $(this).data("staff-name");
        const months = String($(this).data("months"))
          .split(",")
          .map(Number)
          .filter((n) => !isNaN(n));
        openHeatmapSummaryModal(staffId, staffName, months);
      });
  }

  function openHeatmapDetailModal(staffId, staffName, monthIdx, monthLabel) {
    const $modal = $("#momDetailModal");
    const $loader = $("#momModalLoader");
    const $tableWrap = $("#momModalTable").closest(".table-responsive");
    const $tbody = $("#momModalBody");
    const $title = $("#momModalTitle");
    const yearTh = selectedYearTh;

    $title.html(`<i class="fas fa-list-ul mr-2"></i>รายละเอียดเอกสารของ [${staffName}] - ประจำเดือน ${monthLabel}`);

    $tbody.empty();
    $("#momModalFooterInfo").text("");
    $tableWrap.addClass("d-none");
    $loader.removeClass("d-none").addClass("d-flex");
    $modal.modal("show");

    fetchDetailData(monthIdx, "sent", yearTh, String(staffId), null, true).then(function (items) {
      items.forEach((it, idx) => (it.row_num = idx + 1));

      $loader.removeClass("d-flex").addClass("d-none");
      $tableWrap.removeClass("d-none");
      renderMomModalTable(items);
      $("#momModalFooterInfo").text(`ทั้งหมด ${items.length.toLocaleString()} รายการ`);
    });
  }

  function openHeatmapSummaryModal(staffId, staffName, monthIdxList) {
    const $modal = $("#momDetailModal");
    const $loader = $("#momModalLoader");
    const $tableWrap = $("#momModalTable").closest(".table-responsive");
    const $tbody = $("#momModalBody");
    const $title = $("#momModalTitle");
    const yearTh = selectedYearTh;

    $title.html(`<i class="fas fa-list-ul mr-2"></i>รายละเอียดเอกสารทั้งหมดของ [${staffName}] - สรุปผลรวมปีงบประมาณ ${yearTh}`);

    $tbody.empty();
    $("#momModalFooterInfo").text("");
    $tableWrap.addClass("d-none");
    $loader.removeClass("d-none").addClass("d-flex");
    $modal.modal("show");

    const requests = monthIdxList.map((m) => fetchDetailData(m, "sent", yearTh, String(staffId), null, true));

    Promise.all(requests).then(function (results) {
      let items = [];
      results.forEach((r) => {
        if (Array.isArray(r)) items = items.concat(r);
      });
      items.forEach((it, idx) => (it.row_num = idx + 1));

      $loader.removeClass("d-flex").addClass("d-none");
      $tableWrap.removeClass("d-none");
      renderMomModalTable(items);
      $("#momModalFooterInfo").text(`ทั้งหมด ${items.length.toLocaleString()} รายการ`);
    });
  }

  // ===== Staff x Week Heatmap (สัปดาห์ อาทิตย์ - เสาร์ ของเดือนที่เลือกอยู่ในตัวกรอง) =====
  function renderWeekStaffHeatmap(filtered) {
    const $header = $("#weekHeatmapHeaderRow");
    const $body = $("#weekHeatmapBody");
    const $footer = $("#weekHeatmapFooter");
    if (!$header.length || !$body.length) return;

    const { weeks, staffList, matrix } = computeWeeklyStaffMatrix(filtered, selectedMonthIdx, selectedYearTh);

    if (!staffList.length) {
      $header.find("th:not(.heatmap-corner)").remove();
      $body.html('<tr><td class="text-center py-4 text-muted">ไม่พบข้อมูล</td></tr>');
      $footer.html("");
      return;
    }

    // Header
    let headerHtml = '<th class="heatmap-corner">สัปดาห์ / ผู้เบิก</th>';
    staffList.forEach(([sid, name]) => {
      headerHtml += `<th title="${name}">${name}</th>`;
    });
    $header.html(headerHtml);

    // Body rows
    let bodyHtml = "";
    const staffTotals = {};
    staffList.forEach(([sid]) => (staffTotals[sid] = { sent: 0, reply: 0 }));

    weeks.forEach((w) => {
      bodyHtml += `<tr><td>${w.label}<div class="week-date-range text-muted">${w.dateRangeLabel}</div></td>`;
      staffList.forEach(([sid, name]) => {
        const cell = matrix[w.weekIdx][sid];
        staffTotals[sid].sent += cell.sent;
        staffTotals[sid].reply += cell.reply;
        const { cls, rate } = heatClassAndRate(cell.sent, cell.reply);
        if (cell.sent > 0) {
          bodyHtml += `<td class="heatmap-cell hc-clickable ${cls}" data-staff-id="${sid}" data-staff-name="${name}" data-week="${w.weekIdx}">
              <span class="hc-frac">${cell.sent}/${cell.reply}</span>
              <span class="hc-pct">${rate.toFixed(0)}%</span>
            </td>`;
        } else {
          bodyHtml += `<td class="heatmap-cell ${cls}">-</td>`;
        }
      });
      bodyHtml += "</tr>";
    });
    $body.html(bodyHtml);

    // Footer (สรุปผลรวมทั้งเดือนของแต่ละคน)
    let footerHtml = '<tr><td class="heatmap-total-label">สรุปผลรวม</td>';
    staffList.forEach(([sid, name]) => {
      const t = staffTotals[sid];
      const { cls, rate } = heatClassAndRate(t.sent, t.reply);
      if (t.sent > 0) {
        footerHtml += `<td class="heatmap-cell heatmap-cell-total hc-clickable ${cls}" data-staff-id="${sid}" data-staff-name="${name}"><span class="hc-frac">${t.sent}/${t.reply}</span><span class="hc-pct">${rate.toFixed(0)}%</span></td>`;
      } else {
        footerHtml += `<td class="heatmap-cell heatmap-cell-total ${cls}">-</td>`;
      }
    });
    footerHtml += "</tr>";
    $footer.html(footerHtml);

    initWeekHeatmapClicks(weeks);
  }

  function initWeekHeatmapClicks(weeks) {
    $("#weekHeatmapBody .hc-clickable")
      .off("click")
      .on("click", function () {
        const staffId = $(this).data("staff-id");
        const staffName = $(this).data("staff-name");
        const week = weeks[Number($(this).data("week"))];
        if (!week) return;
        openWeekHeatmapDetailModal(staffId, staffName, week);
      });

    $("#weekHeatmapFooter .hc-clickable")
      .off("click")
      .on("click", function () {
        const staffId = $(this).data("staff-id");
        const staffName = $(this).data("staff-name");
        const dispYearTh = selectedMonthIdx <= 2 ? selectedYearTh - 1 : selectedYearTh;
        const monthLabel = `${MONTHS_FULL[selectedMonthIdx]} ${dispYearTh}`;
        openHeatmapDetailModal(staffId, staffName, selectedMonthIdx, monthLabel);
      });
  }

  function openWeekHeatmapDetailModal(staffId, staffName, week) {
    const $modal = $("#momDetailModal");
    const $loader = $("#momModalLoader");
    const $tableWrap = $("#momModalTable").closest(".table-responsive");
    const $tbody = $("#momModalBody");
    const $title = $("#momModalTitle");
    const yearTh = selectedYearTh;

    $title.html(`<i class="fas fa-list-ul mr-2"></i>รายละเอียดเอกสารของ [${staffName}] - ${week.label} (${week.dateRangeLabel})`);

    $tbody.empty();
    $("#momModalFooterInfo").text("");
    $tableWrap.addClass("d-none");
    $loader.removeClass("d-none").addClass("d-flex");
    $modal.modal("show");

    fetchDetailData(selectedMonthIdx, "sent", yearTh, String(staffId), null, true).then(function (items) {
      const startTime = week.startDate.getTime();
      const endTime = week.endDate.getTime();

      const weekItems = (items || []).filter((it) => {
        const dt = parseDetailDMY(it.d_create);
        if (!dt) return false;
        return dt.getTime() >= startTime && dt.getTime() <= endTime;
      });
      weekItems.forEach((it, idx) => (it.row_num = idx + 1));

      $loader.removeClass("d-flex").addClass("d-none");
      $tableWrap.removeClass("d-none");
      renderMomModalTable(weekItems);
      $("#momModalFooterInfo").text(`ทั้งหมด ${weekItems.length.toLocaleString()} รายการ`);
    });
  }

  // ===== MoM Detail Modal =====
  // strictStaff = true: ใช้เมื่อดึงรายละเอียดของพนักงาน "คนเดียว" เจาะจง (เช่น คลิกช่อง Heatmap ของพนักงานคนนั้น)
  // เพื่อไม่ให้เอกสาร "ไม่ระบุ" (ไม่มี sp_check_period_hdr จับคู่ได้) หลุดเข้ามาปนในรายการของพนักงานคนนั้น
  // (ต่างจากตัวกรอง checkbox หลายคนด้านบนของหน้า ที่ต้องการให้เอกสาร "ไม่ระบุ" ติดมาด้วยเสมอตามการออกแบบเดิม)
  function fetchDetailData(monthIdx, dataType, yearTh, staffIds, dateRange, strictStaff) {
    const reqData = {
      fn: "List_QueryParam",
      staff: staffIds,
      data_type: dataType,
    };
    if (strictStaff) {
      reqData.strict_staff = 1;
    }
    if (dateRange && dateRange.start && dateRange.end) {
      // กรองด้วยช่วงวันที่ทักท้วงจริง (d_doc_date) ตรงๆ แทนปีงบประมาณ/เดือน เพื่อให้ครอบคลุมเอกสาร
      // ที่สร้างใบเบิกนอกช่วงปีงบประมาณที่เลือก แต่ถูกทักท้วงในช่วงวันที่ต้องการ (ตรงกับ Grand Total)
      reqData.date_by = "protest";
      reqData.d_date_start = dateRange.start;
      reqData.d_date_end = dateRange.end;
    } else {
      reqData.year_th = yearTh;
      reqData.month_idx = monthIdx;
    }
    return $.ajax({
      url: "../api/List_Report_StatusReplyDetail.php",
      method: "POST",
      data: reqData,
      dataType: "text",
    }).then(function (responseText) {
      try {
        const obj = JSON.parse(responseText);
        return obj.success && obj.data ? obj.data : [];
      } catch (e) {
        console.error("Decode Error", e);
        return [];
      }
    });
  }

  function openMomDetailModal(colType, monthIdx, monthLabel) {
    const $modal = $("#momDetailModal");
    const $loader = $("#momModalLoader");
    const $tableWrap = $("#momModalTable").closest(".table-responsive");
    const $tbody = $("#momModalBody");
    const $title = $("#momModalTitle");
    const yearTh = selectedYearTh;
    const staffIds = getBackendStaffIdsParam();

    const titleMap = {
      cumulative: `รายการส่งเบิกสะสมจนถึงรอบเดือน ${monthLabel}`,
      monthly: `รายการส่งเบิกประจำเดือน ${monthLabel}`,
      reply: `รายการทักท้วงแก้ไขประจำเดือน ${monthLabel}`,
      normal: `รายการผ่านเกณฑ์ปกติประจำเดือน ${monthLabel}`,
      pending: `รายการรอคลังรับเรื่องส่งเบิกประจำเดือน ${monthLabel}`,
    };
    $title.html(`<i class="fas fa-list-ul mr-2"></i>${titleMap[colType] || "รายการ"}`);

    $tbody.empty();
    $("#momModalFooterInfo").text("");
    $tableWrap.addClass("d-none");
    $loader.removeClass("d-none").addClass("d-flex");
    $modal.modal("show");

    let requests = [];
    if (colType === "cumulative") {
      // Fetch every month from the beginning of the fiscal year up to and including monthIdx
      for (let m = 0; m <= monthIdx; m++) {
        requests.push(fetchDetailData(m, "sent", yearTh, staffIds));
      }
    } else if (colType === "reply") {
      requests.push(fetchDetailData(monthIdx, "reply", yearTh, staffIds));
    } else {
      // monthly & normal both start from the full "sent" set for that month
      requests.push(fetchDetailData(monthIdx, "sent", yearTh, staffIds));
    }

    Promise.all(requests).then(function (results) {
      let items = [];
      results.forEach((r) => {
        if (Array.isArray(r)) items = items.concat(r);
      });

      // จำกัดผลลัพธ์ให้อยู่ในช่วงวันที่เดียวกับที่ใช้กรองตาราง MoM ด้านนอก (#gtDateStart / #gtDateEnd)
      // เดิม colType "cumulative" จะดึงข้อมูลทุกเดือนตั้งแต่ต้นปีงบประมาณจนถึงเดือนที่เลือกแบบไม่กรองวันที่
      // ทำให้เอกสารของเดือนก่อนหน้าที่ถูกซ่อนไว้ (แสดง 0 เพราะอยู่นอกช่วงวันที่ที่กรอง) หลุดเข้ามาปนใน modal
      // จึงต้องกรองซ้ำด้วยช่วงวันที่เดียวกันตรงนี้ เพื่อให้ตัวเลขใน modal ตรงกับตัวเลขที่แสดงในตารางเป๊ะๆ
      const gtStartVal = $("#gtDateStart").val();
      const gtEndVal = $("#gtDateEnd").val();
      if (gtStartVal || gtEndVal) {
        const gtStartDt = gtStartVal ? new Date(`${gtStartVal}T00:00:00`) : null;
        const gtEndDt = gtEndVal ? new Date(`${gtEndVal}T23:59:59`) : null;
        items = items.filter((it) => {
          const dt = parseDetailDMY(it.d_create);
          if (!dt) return false;
          if (gtStartDt && dt < gtStartDt) return false;
          if (gtEndDt && dt > gtEndDt) return false;
          return true;
        });
      }

      if (colType === "normal") {
        items = items.filter((it) => !(Number(it.is_reply) === 1 || it.is_reply === true));
      } else if (colType === "pending") {
        // สถานะฝั่งคลัง (po_working_status / vw_po_working_pdf.i_status) <= 1 = คลังยังไม่รับเรื่อง/ยังไม่ตรวจ (ไม่ใช่แค่ === 1)
        items = items.filter(
          (it) => Number(it.po_working_status) <= 1 && !(Number(it.is_reply) === 1 || it.is_reply === true)
        );
      }

      // Re-number rows for a clean sequential display
      items.forEach((it, idx) => (it.row_num = idx + 1));

      $loader.removeClass("d-flex").addClass("d-none");
      $tableWrap.removeClass("d-none");
      renderMomModalTable(items);
      $("#momModalFooterInfo").text(`ทั้งหมด ${items.length.toLocaleString()} รายการ`);
    });
  }

  function renderMomModalTable(items) {
    const $tbody = $("#momModalBody");

    if (!items.length) {
      $tbody.html('<tr><td colspan="8" class="text-center py-4 text-muted">ไม่พบข้อมูล</td></tr>');
      return;
    }

    let html = "";
    items.forEach((item, idx) => {
      const isReply = Number(item.is_reply) === 1 || item.is_reply === true;
      const statusText = isReply ? "ถูกทักท้วงแก้ไข" : "ผ่านปกติ";
      const statusClass = isReply ? "status-reply" : "status-normal";
      const reasonId = `momReason${idx}`;
      const btnId = `momReasonBtn${idx}`;

      const reasonCell = isReply
        ? `<button type="button" class="mom-toggle-reason" id="${btnId}" data-target="${reasonId}">
             <i class="fas fa-search"></i>แสดงเหตุผลทักท้วง
           </button>
           <div class="mom-reason-box d-none" id="${reasonId}" data-btn="${btnId}">
             <div class="mom-reason-title">รายละเอียดข้อทักท้วง:</div>
             <div class="mom-reason-text">${item.c_comment || "-"}</div>
             <a href="javascript:void(0)" class="mom-reason-hide" data-target="${reasonId}" data-btn="${btnId}">ซ่อนรายละเอียด</a>
           </div>`
        : "-";

      html += `
        <tr>
            ${buildDocCodeTds(item)}
            <td>${item.emp || "-"}</td>
            <td><div class="text-truncate" style="max-width:100%;" title="${item.dc_creditor || ""}">${item.dc_creditor || "-"}</div></td>
            <td class="text-center">${item.d_create ? formatDateThai(item.d_create) : "-"}</td>
            <td class="text-center"><span class="mom-status ${statusClass}">${statusText}</span></td>
            <td>${reasonCell}</td>
        </tr>`;
    });

    $tbody.html(html);
  }

  // Delegated toggle for reason boxes (works for dynamically rendered rows)
  // Only one of [show button] / [reason box] is visible at a time.
  $(document).on("click", ".mom-toggle-reason", function () {
    const targetId = $(this).data("target");
    $(this).addClass("d-none");
    $(`#${targetId}`).removeClass("d-none");
  });

  $(document).on("click", ".mom-reason-hide", function () {
    const targetId = $(this).data("target");
    const btnId = $(this).data("btn");
    $(`#${targetId}`).addClass("d-none");
    $(`#${btnId}`).removeClass("d-none");
  });

  // ===== Export MoM Table to CSV =====
  function exportMomTableToCsv() {
    const $table = $("#momTrendsTable");
    if (!$table.length) return;

    const rows = [];
    $table.find("thead tr").each(function () {
      const cols = [];
      $(this)
        .find("th")
        .each(function () {
          cols.push(`"${$(this).text().trim().replace(/"/g, '""')}"`);
        });
      rows.push(cols.join(","));
    });

    $table.find("tbody tr").each(function () {
      const cols = [];
      $(this)
        .find("td")
        .each(function () {
          cols.push(`"${$(this).text().trim().replace(/"/g, '""')}"`);
        });
      rows.push(cols.join(","));
    });

    const csvContent = "\uFEFF" + rows.join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Report_StatusReply_MoM_${selectedYearTh}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ===== Grand Total "ยอดทักท้วงสะสมสุทธิ" =====
  // นับทุกรอบทักท้วงที่ d_doc_date อยู่ในช่วงวันที่ที่เลือกในกล่อง "ช่วงวันที่ทักท้วง"
  // ใช้ query เดียวกับรายงาน EIS (List_RepProtest.php: WHERE bb.d_doc_date BETWEEN ...)
  // ไม่ผูกกับช่วงปีงบประมาณ 12 เดือนของ dropdown ด้านบน เพราะ EIS กรองตามช่วงวันที่ที่ระบุเอง (เช่น 8 เดือน) ไม่ใช่เต็มปีงบประมาณ
  function isoToThaiDMY(isoStr) {
    if (!isoStr) return "";
    const [y, m, d] = isoStr.split("-");
    if (!y || !m || !d) return "";
    const yearTh = Number(y) + 543;
    return `${d}-${m}-${yearTh}`;
  }

  function updateGtDateThaiHints() {
    $("#gtDateStartTh").text(isoToThaiDMY($("#gtDateStart").val()) ? `(EIS: ${isoToThaiDMY($("#gtDateStart").val())})` : "");
    $("#gtDateEndTh").text(isoToThaiDMY($("#gtDateEnd").val()) ? `(EIS: ${isoToThaiDMY($("#gtDateEnd").val())})` : "");
  }

  // ตั้งค่าเริ่มต้นของ #gtDateStart / #gtDateEnd แบบ dynamic ตามวันที่ปัจจุบันของเครื่อง (client date)
  // ตั้งแต่วันที่ = วันที่ 1 ต.ค. ของปีงบประมาณปัจจุบัน (selectedYearTh), ถึงวันที่ = วันนี้
  // (fiscal-year-to-date) เพื่อให้เป็นค่า default ที่ user เปิดมาเจอทันทีโดยไม่ต้องกดอะไรเลย
  // ใช้บ่อยรายสัปดาห์ — ต่างจากกล่องกำหนดช่วงวันที่เอง (ใช้เดือนละครั้งตอนเทียบยอดกับทางคลัง)
  // ที่ถูกซ่อนไว้เป็นค่าเริ่มต้นและเปิดผ่านปุ่ม #gtCustomRangeToggleBtn
  function toIsoDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function setDefaultGtDateRange() {
    const { min, max } = fiscalYearBounds(selectedYearTh);
    const todayIso = toIsoDate(new Date());
    const isCurrentFiscal = selectedYearTh === currentFiscalYearEn() + 543;
    // ถ้ากำลังดูปีงบประมาณปัจจุบันและวันนี้ยังอยู่ในปีงบนั้น ใช้ "วันนี้" เป็นวันสิ้นสุด
    // ถ้าไม่ใช่ (เช่นเลือกปีงบเก่า) ใช้วันสิ้นปีงบ (30 ก.ย.) แทน
    const endIso = isCurrentFiscal && todayIso <= max ? todayIso : max;
    $("#gtDateStart").val(min);
    $("#gtDateEnd").val(endIso);
    updateGtDateThaiHints();
  }

  // ===== ตรวจสอบ (ไม่บังคับ) ว่าช่วงวันที่ในกล่อง Grand Total กว้างกว่าปีงบประมาณที่ตาราง =====
  // Month-on-Month ด้านล่างกำลังแสดงอยู่หรือไม่ — ผู้ใช้เลือกวันที่/เดือน/ปีอะไรก็ได้ตามใจ ไม่มีการบังคับ/ตัดค่า
  // window.DATA_RAW (และตาราง MoM ที่ผูกกับมัน) โหลดมาแค่ "ปีงบประมาณเดียว" ตาม selectedYearTh
  // (dropdown เดือน/ปีงบประมาณด้านบน) เสมอ ส่วน #sum_sent_all / #sum_reply_all (Grand Total bar) คำนวณ
  // จาก SQL ตรงๆ ตามช่วงวันที่ที่เลือกแบบไม่ผูกปีงบประมาณ ถ้าช่วงที่เลือกกว้างกว่าปีงบที่ตารางแสดง
  // ตัวเลข 2 ชุดนี้จะ scope ไม่ตรงกันโดยธรรมชาติ — ฟังก์ชันนี้ใช้แค่ตรวจเพื่อโชว์ hint อธิบายเหตุผล ไม่ใช่บล็อกผู้ใช้
  function fiscalYearBounds(yearTh) {
    const yearEn = yearTh - 543;
    return { min: `${yearEn - 1}-10-01`, max: `${yearEn}-09-30` };
  }

  function isGtRangeOutsideFiscalYear(startVal, endVal) {
    if (!startVal || !endVal) return false;
    const { min, max } = fiscalYearBounds(selectedYearTh);
    return startVal < min || endVal > max;
  }

  // ===== สลับ dropdown ปีงบประมาณ/เดือนด้านบนให้ตรงกับช่วงวันที่ที่เลือกในกล่อง Grand Total อัตโนมัติ =====
  // ผู้ใช้ยังเลือกวันที่ได้อิสระเหมือนเดิมทุกประการ — ฟังก์ชันนี้แค่ช่วย "ตาม" ไปให้ ไม่ได้จำกัดการเลือกวันที่แต่อย่างใด
  // เพื่อแก้ปัญหาที่ตาราง Month-on-Month/KPI/กราฟรายเดือน (ผูกกับ window.DATA_RAW ของปีงบประมาณเดียว) ว่างเปล่า
  // เมื่อช่วงวันที่ที่เลือกไปตกอยู่คนละปีงบประมาณกับที่กำลังโหลดแสดงอยู่ (เช่น Grand Total ยังคำนวณได้ปกติ
  // เพราะ query ตรงไม่ผูกปีงบ แต่ตารางที่ผูกปีงบจะกรองแล้วเหลือ 0 แถวเพราะไม่มี d_create ปีนั้นอยู่ในชุดข้อมูลเลย)
  function calendarMonthToFiscalIdx(m) {
    return (m + 2) % 12; // 1=ม.ค.->3, 10=ต.ค.->0, ...
  }

  function fiscalYearThOfIsoDate(isoStr) {
    const [y, m] = isoStr.split("-").map(Number);
    const yearEn = m >= 10 ? y + 1 : y;
    return yearEn + 543;
  }

  function syncFiscalYearToGtRange() {
    const startVal = $("#gtDateStart").val();
    const endVal = $("#gtDateEnd").val() || startVal;
    if (!startVal) return false;

    // ใช้ปีงบประมาณของ "ตั้งแต่วันที่" เป็นตัวยึดหลัก (ถ้าช่วงคาบเกี่ยว 2 ปีงบ ตารางจะเห็นได้แค่ปีเดียวอยู่ดี)
    const targetYearTh = fiscalYearThOfIsoDate(startVal);
    if (targetYearTh === selectedYearTh) return false; // ตรงกันอยู่แล้ว ไม่ต้องสลับ

    // dropdown ด้านบนรองรับเฉพาะปีงบประมาณปัจจุบันเท่านั้น — ถ้านอกช่วงนี้สลับให้ไม่ได้จริงๆ
    const curFiscalEn = currentFiscalYearEn();
    const targetFiscalEn = targetYearTh - 543;
    if (targetFiscalEn !== curFiscalEn) {
      $("#gtDateHint")
        .removeClass("text-success text-warning")
        .addClass("text-danger")
        .text(`ปีงบประมาณ ${targetYearTh} อยู่นอกช่วงที่ตัวกรองเดือน/ปีงบประมาณด้านบนรองรับ (เฉพาะปีงบประมาณปัจจุบัน ${curFiscalEn + 543}) ตาราง/กราฟด้านล่างจึงยังคงแสดงปีงบประมาณ ${selectedYearTh} ต่อไป แม้ Grand Total ด้านบนจะคำนวณตามช่วงวันที่จริงก็ตาม`);
      return false;
    }

    // เลือกเดือนใน dropdown ให้ตรงกับ "ถึงวันที่" ถ้าอยู่ปีงบเดียวกับ "ตั้งแต่วันที่" ไม่งั้นยึด "ตั้งแต่วันที่" แทน
    const endYearTh = fiscalYearThOfIsoDate(endVal);
    const anchorIso = endYearTh === targetYearTh ? endVal : startVal;
    let monthIdx = calendarMonthToFiscalIdx(Number(anchorIso.split("-")[1]));
    if (targetFiscalEn === curFiscalEn) {
      monthIdx = Math.min(monthIdx, currentMonthIdxInFiscal()); // ปีงบปัจจุบันเลือกเดือนอนาคตไม่ได้
    }

    selectedYearTh = targetYearTh;
    selectedMonthIdx = monthIdx;
    $("#main_month_filter").selectpicker("val", `${selectedYearTh}_${selectedMonthIdx}`);

    loadData(); // โหลดข้อมูลปีงบประมาณใหม่ — success callback จะเรียก recalcGrandTotalReply()/recalculateAndRender() ให้เอง
    return true;
  }

  function recalcGrandTotalReply() {
    const startVal = $("#gtDateStart").val();
    const endVal = $("#gtDateEnd").val();
    const $hint = $("#gtDateHint");
    const $btn = $("#gtDateCalcBtn");

    updateGtDateThaiHints();

    if (!startVal || !endVal) {
      $hint.removeClass("text-success").addClass("text-danger").text("กรุณาเลือกวันที่เริ่มต้นและสิ้นสุดให้ครบ");
      return;
    }
    if (startVal > endVal) {
      $hint.removeClass("text-success").addClass("text-danger").text("วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด");
      return;
    }

    $btn.prop("disabled", true);
    $hint.removeClass("text-danger text-success").text("กำลังคำนวณ...");

    $.ajax({
      url: "../api/List_Report_StatusReply.php",
      method: "POST",
      data: {
        fn: "List_CompareProtestRounds",
        d_date_start: startVal,
        d_date_end: endVal,
        staff: getBackendStaffIdsParam(),
      },
      dataType: "text",
      success: function (responseText) {
        try {
          const obj = JSON.parse(responseText);
          if (obj.success && obj.data) {
            // ยอดทักท้วงสะสมสุทธิ (นับทุกรอบ) — ตรงกับ List_RepProtest.php (EIS) แบบ apples-to-apples
            const totalRoundsInRange = Number(obj.data.total_rounds || 0);
            $("#sum_reply_all").text(totalRoundsInRange.toLocaleString());
            // ยอดส่งเบิกทั้งหมดสะสมสุทธิ (เรื่อง) — นับใบเบิก (ไม่ซ้ำ) ที่วันที่สร้างใบเบิก (d_create) อยู่ในช่วงวันที่เดียวกัน
            const totalSentDocs = Number(obj.data.total_sent_docs || 0);
            $("#sum_sent_all").text(totalSentDocs.toLocaleString());
            // ค่าเฉลี่ยอัตราการทักท้วงเอกสารสะสมสุทธิ = จำนวนใบเบิกที่เคยถูกทักท้วง (ไม่ซ้ำ) / จำนวนใบเบิกทั้งหมดในช่วงเดียวกัน
            const totalDocsReplied = Number(obj.data.total_docs || 0);
            const pct = totalSentDocs > 0 ? ((totalDocsReplied / totalSentDocs) * 100).toFixed(2) : "0.00";
            $("#sum_percent_all").text(pct + "%");
            const outsideFiscalYear = isGtRangeOutsideFiscalYear(startVal, endVal);
            const scopeNotice = outsideFiscalYear
              ? `หมายเหตุ: ช่วงวันที่นี้กว้างกว่าปีงบประมาณ ${selectedYearTh} ที่ตาราง/กราฟด้านล่างกำลังแสดงอยู่ — ตัวเลข Grand Total ด้านบนนี้นับรวมทุกปีงบประมาณตามช่วงวันที่จริง แต่ตาราง Month-on-Month จะเห็นเฉพาะปีงบประมาณ ${selectedYearTh} เท่านั้น (เปลี่ยนปีงบประมาณที่ต้องการดูได้ที่ตัวกรองเดือน/ปีด้านบนสุด) — `
              : "";
            $hint
              .removeClass("text-danger")
              .addClass(outsideFiscalYear ? "text-warning" : "text-success")
              .text(
                scopeNotice +
                `นับจากวันที่ ${isoToThaiDMY(startVal)} ถึง ${isoToThaiDMY(endVal)} — ยอดส่งเบิกนับจากวันที่สร้างใบเบิก (d_create), ยอดทักท้วงนับจากวันที่ทักท้วง (d_doc_date) ตรงกับ List_RepProtest.php (EIS) ในช่วงเดียวกัน`
              );
          } else {
            $("#sum_reply_all").text("0");
            $("#sum_sent_all").text("0");
            $("#sum_percent_all").text("0.00%");
            $hint.removeClass("text-success").addClass("text-danger").text(obj.message || "คำนวณไม่สำเร็จ");
          }
        } catch (e) {
          console.error("Decode Error", e);
          $hint.removeClass("text-success").addClass("text-danger").text("เกิดข้อผิดพลาดในการอ่านผลลัพธ์");
        } finally {
          $btn.prop("disabled", false);
        }
      },
      error: function () {
        console.error("Ajax Failed");
        $hint.removeClass("text-success").addClass("text-danger").text("เรียกข้อมูลไม่สำเร็จ");
        $btn.prop("disabled", false);
      },
    });
  }

  $(() => {
    initMainMonthSelect();
    initGroupModal();
    loadData();

    $("#btnExportMomCsv")
      .off("click")
      .on("click", exportMomTableToCsv);

    $("#replyRegistryScope")
      .selectpicker()
      .off("changed.bs.select")
      .on("changed.bs.select", renderReplyRegistry);

    $("#kpiPendingCard")
      .off("click")
      .on("click", function () {
        const dispYearTh = selectedMonthIdx <= 2 ? selectedYearTh - 1 : selectedYearTh;
        const monthLabel = `${MONTHS_FULL[selectedMonthIdx]} ${dispYearTh}`;
        openMomDetailModal("pending", selectedMonthIdx, monthLabel);
      });

    $("#gtDateCalcBtn")
      .off("click")
      .on("click", function () {
        // กดคำนวณแล้วให้ทั้งตัวเลข Grand Total และกราฟ/ตารางทั้งหมดกรองตามช่วงวันที่เดียวกัน
        // ถ้าช่วงวันที่ตกไปอยู่คนละปีงบประมาณกับที่กำลังแสดง ให้สลับปีงบประมาณด้านบนตามให้อัตโนมัติก่อน
        const switchedYear = syncFiscalYearToGtRange();
        if (!switchedYear) {
          recalcGrandTotalReply();
          recalculateAndRender();
        }
        // ถ้า switchedYear = true, loadData() ที่เรียกใน syncFiscalYearToGtRange() จะจัดการ
        // recalcGrandTotalReply()/recalculateAndRender() ให้เองหลังโหลดข้อมูลปีงบใหม่เสร็จ
      });
    $("#gtDateStart, #gtDateEnd")
      .off("change")
      .on("change", updateGtDateThaiHints);

    // ปุ่ม "ดูตามคลัง (กำหนดช่วงวันที่เอง)" — ค่าเริ่มต้นซ่อนกล่องเลือกวันที่ไว้ (ใช้ fiscal-year-to-date อัตโนมัติ
    // ซึ่งเป็นช่วงที่ user เข้ามาดูทุกสัปดาห์) เปิดออกมาเฉพาะตอนต้องการเทียบยอดกับทางคลังแบบกำหนดช่วงเอง (ใช้เดือนละครั้ง)
    $("#gtCustomRangeToggleBtn")
      .off("click")
      .on("click", function () {
        const $box = $("#gtCustomRangeBox");
        const willShow = $box.hasClass("d-none");
        $box.toggleClass("d-none", !willShow);
        $(this).toggleClass("active", willShow);
        $(this).html(
          willShow
            ? '<i class="fas fa-chevron-up mr-1"></i>ซ่อนตัวเลือกช่วงวันที่'
            : '<i class="fas fa-warehouse mr-1"></i>ดูตามคลัง (กำหนดช่วงวันที่เอง)'
        );
      });

    // ปุ่ม "ค่าเริ่มต้น" ในกล่องกำหนดช่วงวันที่เอง — สะดวกสำหรับกลับไปที่ต้นปีงบประมาณ-วันนี้ หลังจากลองเทียบยอดกับทางคลังเสร็จแล้ว
    $("#gtDateResetBtn")
      .off("click")
      .on("click", function () {
        setDefaultGtDateRange();
        const switchedYear = syncFiscalYearToGtRange();
        if (!switchedYear) {
          recalcGrandTotalReply();
          recalculateAndRender();
        }
      });

    // ตั้งค่าเริ่มต้นของช่วงวันที่ Grand Total แบบ dynamic ตามวันที่ปัจจุบันของเครื่อง (ไม่ hardcode ปี/เดือน)
    // ตั้งแต่วันที่ = วันที่ 1 ต.ค. ของปีงบประมาณปัจจุบัน, ถึงวันที่ = วันนี้ (fiscal-year-to-date)
    setDefaultGtDateRange();

    // คำนวณอัตโนมัติครั้งแรกด้วยค่าเริ่มต้นข้างต้น เพื่อให้ตรงกับ EIS ทันทีที่เปิดหน้า
    recalcGrandTotalReply();
  });

  window.addEventListener("resize", () => {
    quarterCharts.forEach((c) => c?.resize());
    cumulativeTrendChart?.resize();
    groupTrendChart?.resize();
    groupPercentBarChart?.resize();
    weeklyTrendChart?.resize();
  });

  // ===================================================================
  // Monthly Duration Summary: ตรวจรับ -> จัดทำใบขอเบิก -> รับใบขอเบิก
  // (ต.ค. ปีงบประมาณ ถึงเดือนล่าสุด) — นับจำนวนเอกสารแบ่งตามช่วงวัน แบบ Rep_Rep0001
  // ===================================================================
  const DURATION_BUCKET_LABELS = {
    d0_7: "0-7 วัน",
    d8_15: "8-15 วัน",
    d16_30: "16-30 วัน",
    over30: "เกิน 30 วัน",
    total: "รวม",
    pending: "รอฝ่ายคลังรับ",
  };

  function renderMonthlyDurationTable(rows) {
    const $tbody = $("#monthlyDurationBody");

    if (!rows || rows.length === 0) {
      $tbody.html('<tr><td colspan="12" class="text-center py-4 text-muted">ไม่พบข้อมูล</td></tr>');
      return;
    }

    // สร้าง <td> ที่กดดูรายละเอียดได้ (ยกเว้นค่า 0 ที่ไม่มีเอกสารให้ดู)
    // denom = ตัวหารสำหรับคำนวณ % (แสดงเฉพาะช่อง "เกิน 30 วัน" และ "รอฝ่ายคลังรับ" เพื่อไม่ให้ตารางรก), ไม่ใส่ denom = ไม่แสดง %
    const cell = (value, monthKey, stage, bucket, monthLabel, denom, extraClass) => {
      const v = value || 0;
      const cls = extraClass ? `text-center ${extraClass}` : "text-center";
      const pct = v > 0 && denom ? Math.round((v / denom) * 100) : null;
      const pctHtml = pct !== null ? `<div class="mom-percent">${pct}%</div>` : "";
      if (!v) {
        return `<td class="${cls} mom-cell-disabled">${v}</td>`;
      }
      return `<td class="${cls} mom-cell-clickable" data-month-key="${monthKey}" data-stage="${stage}" data-bucket="${bucket}" data-label="${monthLabel}"><div class="mom-value">${v}</div>${pctHtml}</td>`;
    };

    let html = "";
    rows.forEach((m) => {
      const s1 = m.stage1 || {};
      const s2 = m.stage2 || {};
      const label = m.month_label;
      const over30Class = "duration-alert-danger";
      const pendingClass = "duration-alert-warning";
      // ตัวหาร %: "เกิน 30 วัน" เทียบกับยอดรวมของฝั่งนั้น, "รอฝ่ายคลังรับ" เทียบกับยอดเอกสารทั้งหมดที่จัดทำเดือนนั้น (รวม + รอฝ่ายคลังรับ)
      const s1Total = s1.total || 0;
      const s2Total = s2.total || 0;
      const s2Cohort = s2Total + (s2.pending || 0);
      html += `
        <tr>
            <td class="font-weight-bold">${label}</td>
            ${cell(s1.d0_7, m.month_key, 1, "d0_7", label, null)}
            ${cell(s1.d8_15, m.month_key, 1, "d8_15", label, null)}
            ${cell(s1.d16_30, m.month_key, 1, "d16_30", label, null)}
            ${cell(s1.over30, m.month_key, 1, "over30", label, s1Total, over30Class)}
            ${cell(s1.total, m.month_key, 1, "total", label, null)}
            ${cell(s2.d0_7, m.month_key, 2, "d0_7", label, null)}
            ${cell(s2.d8_15, m.month_key, 2, "d8_15", label, null)}
            ${cell(s2.d16_30, m.month_key, 2, "d16_30", label, null)}
            ${cell(s2.over30, m.month_key, 2, "over30", label, s2Total, over30Class)}
            ${cell(s2.total, m.month_key, 2, "total", label, null)}
            ${cell(s2.pending, m.month_key, 2, "pending", label, s2Cohort, pendingClass)}
        </tr>
      `;
    });

    $tbody.html(html);
    initMonthlyDurationClicks();
  }

  function initMonthlyDurationClicks() {
    $("#monthlyDurationBody .mom-cell-clickable")
      .off("click")
      .on("click", function () {
        const monthKey = $(this).data("month-key");
        const stage = Number($(this).data("stage"));
        const bucket = String($(this).data("bucket"));
        const label = $(this).data("label");
        openMonthlyDurationDetailModal(monthKey, stage, bucket, label);
      });
  }

  function openMonthlyDurationDetailModal(monthKey, stage, bucket, monthLabel) {
    const $modal = $("#monthlyDurationDetailModal");
    const $loader = $("#durationModalLoader");
    const $tableWrap = $("#durationModalTable").closest("div");
    const $tbody = $("#durationModalBody");
    const $title = $("#durationModalTitle");

    const stageLabel = stage === 1 ? "ตรวจรับ → จัดทำใบขอเบิก" : "จัดทำใบขอเบิก → รับใบขอเบิก";
    const bucketLabel = DURATION_BUCKET_LABELS[bucket] || bucket;
    $title.html(`<i class="fas fa-list-ul mr-2"></i>รายการ ${stageLabel} (${bucketLabel}) เดือน ${monthLabel}`);

    $tbody.empty();
    $("#durationModalFooterInfo").text("");
    $tableWrap.addClass("d-none");
    $loader.removeClass("d-none").addClass("d-flex");
    $modal.modal("show");

    const groupBy = $("#monthlyDurationGroupBy").val() || "create";

    $.ajax({
      url: "../api/List_Report_StatusReply.php",
      method: "POST",
      data: {
        fn: "List_MonthlyDurationDetail",
        group_by: groupBy,
        month_key: monthKey,
        stage: stage,
        bucket: bucket,
      },
      dataType: "text",
    }).then(
      function (responseText) {
        let items = [];
        try {
          const obj = JSON.parse(responseText);
          items = obj.success && obj.data ? obj.data : [];
        } catch (e) {
          console.error("Decode Error (MonthlyDurationDetail)", e);
        }
        items.forEach((it, idx) => (it.row_num = idx + 1));

        $loader.removeClass("d-flex").addClass("d-none");
        $tableWrap.removeClass("d-none");
        renderDurationModalTable(items);
        $("#durationModalFooterInfo").text(`ทั้งหมด ${items.length.toLocaleString()} รายการ`);
      },
      function () {
        $loader.removeClass("d-flex").addClass("d-none");
        $tableWrap.removeClass("d-none");
        $tbody.html('<tr><td colspan="10" class="text-center py-4 text-danger">เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ</td></tr>');
      }
    );
  }

  function renderDurationModalTable(items) {
    const $tbody = $("#durationModalBody");

    if (!items.length) {
      $tbody.html('<tr><td colspan="10" class="text-center py-4 text-muted">ไม่พบข้อมูล</td></tr>');
      return;
    }

    let html = "";
    items.forEach((item) => {
      html += `
        <tr>
            <td class="text-center">${item.row_num}</td>
            <td>${escapeHtml(item.c_code || "-")}</td>
            <td>${escapeHtml(item.c_code_contract || "-")}</td>
            <td>${escapeHtml(item.c_code_ref || "-")}</td>
            <td>${escapeHtml(item.emp_tt || "-")}</td>
            <td><div class="text-truncate" style="max-width:100%;" title="${escapeHtml(item.dc_creditor || "")}">${escapeHtml(item.dc_creditor || "-")}</div></td>
            <td class="text-center">${item.d_audit_date ? formatDateThai(item.d_audit_date) : "-"}</td>
            <td class="text-center">${item.d_create ? formatDateThai(item.d_create) : "-"}</td>
            <td class="text-center">${item.d_receive_request_date ? formatDateThai(item.d_receive_request_date) : "-"}</td>
            <td class="text-center">${item.days !== null && item.days !== undefined ? item.days : "-"}</td>
        </tr>`;
    });

    $tbody.html(html);
  }

  function loadMonthlyDurationSummary(groupBy) {
    const $tbody = $("#monthlyDurationBody");
    $tbody.html('<tr><td colspan="12" class="text-center py-4 text-muted">กำลังโหลดข้อมูล...</td></tr>');

    $.ajax({
      url: "../api/List_Report_StatusReply.php",
      method: "POST",
      data: {
        fn: "List_MonthlyDurationSummary",
        group_by: groupBy || "create",
      },
      dataType: "text",
      success: function (responseText) {
        try {
          const obj = JSON.parse(responseText);
          if (obj.success && obj.data) {
            renderMonthlyDurationTable(obj.data);
          } else {
            $tbody.html(
              '<tr><td colspan="12" class="text-center py-4 text-danger">' + (obj.message || "โหลดข้อมูลไม่สำเร็จ") + "</td></tr>"
            );
          }
        } catch (e) {
          console.error("Decode Error (MonthlyDurationSummary)", e);
          $tbody.html('<tr><td colspan="12" class="text-center py-4 text-danger">เกิดข้อผิดพลาดในการอ่านผลลัพธ์</td></tr>');
        }
      },
      error: function () {
        $tbody.html('<tr><td colspan="12" class="text-center py-4 text-danger">เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ</td></tr>');
      },
    });
  }

  $(function () {
    $("#btnLoadMonthlyDuration")
      .off("click")
      .on("click", function () {
        loadMonthlyDurationSummary($("#monthlyDurationGroupBy").val());
      });

    $("#monthlyDurationGroupBy")
      .off("change")
      .on("change", function () {
        loadMonthlyDurationSummary($(this).val());
      });

    // โหลดครั้งแรกอัตโนมัติเมื่อเปิดหน้า (ค่าเริ่มต้น group_by=create)
    loadMonthlyDurationSummary("create");
  });
})();