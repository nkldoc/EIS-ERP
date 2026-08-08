(function () {
  window.DATA_RAW = [];
  let replyLineChart = null;
  const MONTHS = ["ต.ค.", "พ.ย.", "ธ.ค.", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย."];

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

  function initFilters() {
    const $s = $("#filter_staff").empty();
    const staffMap = new Map();

    window.DATA_RAW.forEach((it) => {
      if (it.staff_id && it.staff_name) {
        staffMap.set(it.staff_id, it.staff_name);
      }
    });

    const sortedStaff = [...staffMap.entries()].sort((a, b) => a[1].localeCompare(b[1]));
    sortedStaff.forEach(([id, name]) => $s.append(new Option(name, id)));

    $s.selectpicker("refresh").selectpicker("selectAll");
    $s.off("changed.bs.select").on("changed.bs.select", recalculateAndRender);

    recalculateAndRender();
  }

  function loadData() {
    const loader = document.getElementById("pageLoader");
    if (loader) loader.style.display = "flex";
    const yearTh = $("#budget_year_filter").val();
    const params = { fn: "List_QueryParam" };
    if (yearTh) params.year_en = yearTh;

    Ext.Ajax.request({
      // ✅ ชี้ไปที่ api ของ eis_reports
      url: "../api/List_Report_StatusReply.php",
      method: "POST",
      params: params,
      success: function (resp) {
        try {
          const obj = Ext.decode(resp.responseText);
          if (obj.success && obj.data) {
            window.DATA_RAW = obj.data;
            initFilters();
          } else {
            console.error("API Error:", obj.message);
            window.DATA_RAW = [];
            recalculateAndRender();
          }
        } catch (e) {
          console.error("Decode Error", e);
        } finally {
          if (loader) loader.style.display = "none";
        }
      },
      failure: function () {
        console.error("Ajax Failed");
        if (loader) loader.style.display = "none";
      },
    });
  }

  function recalculateAndRender() {
    const staffIds = ($("#filter_staff").val() || []).map(Number);
    const filtered = window.DATA_RAW.filter((it) => staffIds.includes(Number(it.staff_id)));

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: MONTHS[i],
      sent: 0,
      reply: 0,
    }));

    let totalSent = 0;
    let totalReply = 0;

    filtered.forEach((it) => {
      monthlyData[it.month_idx].sent++;
      totalSent++;
      if (Number(it.is_reply) === 1 || it.is_reply === true) {
        monthlyData[it.month_idx].reply++;
        totalReply++;
      }
    });

    $("#sum_sent_all").text(totalSent.toLocaleString());
    $("#sum_reply_all").text(totalReply.toLocaleString());
    const pctTotal = totalSent > 0 ? ((totalReply / totalSent) * 100).toFixed(2) : "0.00";
    $("#sum_percent_all").text(pctTotal + "%");

    renderTable(monthlyData, totalSent, totalReply);
    renderChart(monthlyData);
    initSummaryBoxClick();
  }

  function renderTable(data, totalSent, totalReply) {
    let rowSent = "", rowReply = "", rowPct = "", rowInc = "", rowSentInc = "";

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
      const month    = $(this).data("month");
      const type     = $(this).data("type");
      const yearTh   = $("#budget_year_filter").val();
      const staffIds = ($("#filter_staff").val() || []).join(",");

      $menu.css({ display: "block", left: e.pageX, top: e.pageY });

      $("#menu-view-detail").off("click").on("click", function () {
        $menu.hide();
        showDetailModal(yearTh, month, type, staffIds);
      });

      const isAdmin = Ext && Ext.session && String(Ext.session.user_id) === "1";
      if (isAdmin) {
        $("#menu-show-sql").show();
      } else {
        $("#menu-show-sql").hide();
      }

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
        const qs = $.param(params);
        // ✅ ชี้ไปที่ api ของ eis_reports
        window.open("../api/List_Report_StatusReplyDetail.php?" + qs, "_blank");
      });
    });

    $(document).on("click", function () { $menu.hide(); });
  }

  function initTotalClick() {
    $("#replyTableBody .col-total.cursor-pointer").on("click", function () {
      const type     = $(this).data("type");
      const yearTh   = $("#budget_year_filter").val();
      const staffIds = ($("#filter_staff").val() || []).join(",");
      showDetailModal(yearTh, -1, type, staffIds);
    });
  }

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

  // ── Styled Excel Export (SheetJS) ─────────────────────────────────────────
  function exportStyledExcel(data, type, yearTh) {
    if (!data || data.length === 0) { alert('ไม่มีข้อมูลสำหรับ Export'); return; }

    const typeLabel  = type === 'reply' ? 'รายการทักท้วง' : 'รายการส่งเบิกทั้งหมด';
    const replyCount = data.filter(d => d.is_reply).length;
    const totalAmt   = data.reduce((s, d) => {
      const v = parseFloat(String(d.f_net_total_price || '0').replace(/,/g, ''));
      return s + (isNaN(v) ? 0 : v);
    }, 0);
    const pct = data.length > 0 ? (replyCount / data.length * 100).toFixed(2) : '0.00';
    const amtFmt = totalAmt.toLocaleString('th-TH', { minimumFractionDigits: 2 });

    const HEADERS = [
      '#', 'เลขที่รับของ', 'เลขที่ตรวจรับ', 'เลขที่ส่งเบิก', 'ชื่อโครงการ/สัญญา',
      'จำนวนเงิน (บาท)', 'เจ้าหนี้/บริษัท',
      'วันที่ส่งมอบ', 'วันที่ตรวจรับ', 'วันที่สร้างใบเบิก',
      'ระยะเวลา (ส่งมอบ-ตรวจรับ)', 'ระยะเวลา (ตรวจรับ-ส่งเบิก)',
      'ผู้ส่งเบิก', 'จนท.ทักท้วง', 'สถานะ',
      'วันที่ทักท้วง', 'วันที่ส่งกลับทักท้วง', 'ข้อความทักท้วง',
    ];
    const N = HEADERS.length;

    // ── Build AOA (Array of Arrays) ────────────────────────────────────────
    const aoa = [];

    // Row 1: Title
    const titleRow = [`รายงาน${typeLabel} - EIS ปีงบประมาณ ${yearTh}`];
    for (let i = 1; i < N; i++) titleRow.push('');
    aoa.push(titleRow);

    // Row 2: Stats
    const statsRow = [
      `จำนวนทั้งหมด: ${data.length} รายการ`, '', '',
      `โดนทักท้วง: ${replyCount} รายการ (${pct}%)`, '', '',
      `ยอดรวม: ${amtFmt} บาท`, '', '', '', '',
    ];
    for (let i = statsRow.length; i < N; i++) statsRow.push('');
    aoa.push(statsRow);

    // Row 3: Headers
    aoa.push(HEADERS);

    // Data rows
    data.forEach((item, idx) => {
      const isReply   = item.is_reply || false;
      const rawDCode  = item.d_code     || '-';
      const origACode = item.orig_a_code || '';
      const dCodeText = origACode && origACode.startsWith('A')
        ? `${rawDCode} (ชดใช้: ${origACode})` : rawDCode;
      const amt = parseFloat(String(item.f_net_total_price || '0').replace(/,/g, '')) || 0;

      aoa.push([
        idx + 1,
        item.c_code     || '-',
        item.c_code_ref || '-',
        dCodeText,
        item.c_heading_proj || '-',
        amt,
        item.dc_creditor || '-',
        item.d_arrive_date   || '-',
        item.d_checking_date || '-',
        item.d_create        || '-',
        item.diff_arrive_check !== '-' ? item.diff_arrive_check + ' วัน' : '-',
        item.diff_check_send   !== '-' ? item.diff_check_send   + ' วัน' : '-',
        item.emp || '-',
        item.po_emp_name || item.emp_tt || '-',
        isReply ? 'โดนทักท้วง' : 'ส่งเบิกปกติ',
        item.d_receive_date || '-',
        item.d_send_date    || '-',
        item.c_comment      || '-',
      ]);
    });

    // Footer row
    const footerRow = ['รวมทั้งสิ้น', '', '', '', ''];
    footerRow.push(totalAmt);
    for (let i = 6; i < N; i++) footerRow.push('');
    aoa.push(footerRow);

    // ── Create workbook ────────────────────────────────────────────────────
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // ── Merges ─────────────────────────────────────────────────────────────
    ws['!merges'] = [
      { s:{r:0,c:0}, e:{r:0,c:N-1} },   // Title
      { s:{r:1,c:0}, e:{r:1,c:2} },      // Stats 1
      { s:{r:1,c:3}, e:{r:1,c:5} },      // Stats 2
      { s:{r:1,c:6}, e:{r:1,c:10} },     // Stats 3
      { s:{r:aoa.length-1,c:0}, e:{r:aoa.length-1,c:4} }, // Footer label
    ];

    // ── Column widths ──────────────────────────────────────────────────────
    ws['!cols'] = [
      {wch:5},{wch:16},{wch:17},{wch:16},{wch:40},{wch:15},{wch:28},
      {wch:13},{wch:13},{wch:15},{wch:14},{wch:14},{wch:18},{wch:18},{wch:13},
      {wch:13},{wch:18},{wch:42},
    ];

    // ── Row heights ────────────────────────────────────────────────────────
    const rowCount = aoa.length;
    ws['!rows'] = [{ hpt: 24 }, { hpt: 18 }, { hpt: 32 }];
    for (let r = 3; r < rowCount - 1; r++) ws['!rows'].push({ hpt: 40 });
    ws['!rows'].push({ hpt: 18 }); // footer

    // ── Cell styles ────────────────────────────────────────────────────────
    const S = {
      title:   { font:{name:'TH SarabunPSK',sz:18,bold:true,color:{rgb:'FFFFFF'}}, fill:{patternType:'solid',fgColor:{rgb:'1565C0'}}, alignment:{horizontal:'center',vertical:'center'} },
      stats:   { font:{name:'TH SarabunPSK',sz:14,bold:true,color:{rgb:'FFFFFF'}}, fill:{patternType:'solid',fgColor:{rgb:'0D47A1'}}, alignment:{horizontal:'center',vertical:'center'} },
      hdrBlue: { font:{name:'TH SarabunPSK',sz:14,bold:true,color:{rgb:'FFFFFF'}}, fill:{patternType:'solid',fgColor:{rgb:'1976D2'}}, alignment:{horizontal:'center',vertical:'center',wrapText:true}, border:{top:{style:'thin'},bottom:{style:'thin'},left:{style:'thin'},right:{style:'thin'}} },
      hdrDark: { font:{name:'TH SarabunPSK',sz:14,bold:true,color:{rgb:'FFFFFF'}}, fill:{patternType:'solid',fgColor:{rgb:'1565C0'}}, alignment:{horizontal:'center',vertical:'center',wrapText:true}, border:{top:{style:'thin'},bottom:{style:'thin'},left:{style:'thin'},right:{style:'thin'}} },
      hdrGreen:{ font:{name:'TH SarabunPSK',sz:14,bold:true,color:{rgb:'FFFFFF'}}, fill:{patternType:'solid',fgColor:{rgb:'2E7D32'}}, alignment:{horizontal:'center',vertical:'center',wrapText:true}, border:{top:{style:'thin'},bottom:{style:'thin'},left:{style:'thin'},right:{style:'thin'}} },
      hdrTeal: { font:{name:'TH SarabunPSK',sz:14,bold:true,color:{rgb:'FFFFFF'}}, fill:{patternType:'solid',fgColor:{rgb:'00695C'}}, alignment:{horizontal:'center',vertical:'center',wrapText:true}, border:{top:{style:'thin'},bottom:{style:'thin'},left:{style:'thin'},right:{style:'thin'}} },
      hdrOrg:  { font:{name:'TH SarabunPSK',sz:14,bold:true,color:{rgb:'FFFFFF'}}, fill:{patternType:'solid',fgColor:{rgb:'E65100'}}, alignment:{horizontal:'center',vertical:'center',wrapText:true}, border:{top:{style:'thin'},bottom:{style:'thin'},left:{style:'thin'},right:{style:'thin'}} },
      hdrPurp: { font:{name:'TH SarabunPSK',sz:14,bold:true,color:{rgb:'FFFFFF'}}, fill:{patternType:'solid',fgColor:{rgb:'4527A0'}}, alignment:{horizontal:'center',vertical:'center',wrapText:true}, border:{top:{style:'thin'},bottom:{style:'thin'},left:{style:'thin'},right:{style:'thin'}} },
      hdrRed:  { font:{name:'TH SarabunPSK',sz:14,bold:true,color:{rgb:'FFFFFF'}}, fill:{patternType:'solid',fgColor:{rgb:'B71C1C'}}, alignment:{horizontal:'center',vertical:'center',wrapText:true}, border:{top:{style:'thin'},bottom:{style:'thin'},left:{style:'thin'},right:{style:'thin'}} },
      hdrGray: { font:{name:'TH SarabunPSK',sz:14,bold:true,color:{rgb:'FFFFFF'}}, fill:{patternType:'solid',fgColor:{rgb:'37474F'}}, alignment:{horizontal:'center',vertical:'center',wrapText:true}, border:{top:{style:'thin'},bottom:{style:'thin'},left:{style:'thin'},right:{style:'thin'}} },
      footerL: { font:{name:'TH SarabunPSK',sz:15,bold:true,color:{rgb:'FFFFFF'}}, fill:{patternType:'solid',fgColor:{rgb:'1565C0'}}, alignment:{horizontal:'right',vertical:'center'} },
      footerAmt:{ font:{name:'TH SarabunPSK',sz:15,bold:true,color:{rgb:'FFFFFF'}}, fill:{patternType:'solid',fgColor:{rgb:'2E7D32'}}, alignment:{horizontal:'right',vertical:'center'}, numFmt:'#,##0.00' },
      footerR: { font:{name:'TH SarabunPSK',sz:14}, fill:{patternType:'solid',fgColor:{rgb:'1565C0'}} },
    };

    const BORDER = {top:{style:'thin',color:{rgb:'BDBDBD'}},bottom:{style:'thin',color:{rgb:'BDBDBD'}},left:{style:'thin',color:{rgb:'BDBDBD'}},right:{style:'thin',color:{rgb:'BDBDBD'}}};

    const encodeCell = (r, c) => XLSX.utils.encode_cell({r, c});

    // Title row (r=0)
    for (let c = 0; c < N; c++) {
      const addr = encodeCell(0, c);
      if (!ws[addr]) ws[addr] = {v:'', t:'s'};
      ws[addr].s = S.title;
    }

    // Stats row (r=1)
    for (let c = 0; c < N; c++) {
      const addr = encodeCell(1, c);
      if (!ws[addr]) ws[addr] = {v:'', t:'s'};
      ws[addr].s = S.stats;
    }

    // Header row (r=2)
    const hdrStyles = [
      S.hdrBlue, S.hdrBlue, S.hdrBlue, S.hdrBlue, S.hdrDark,
      S.hdrGreen, S.hdrPurp,
      S.hdrTeal, S.hdrTeal, S.hdrTeal,
      S.hdrOrg, S.hdrOrg,
      S.hdrPurp, S.hdrRed, S.hdrGray,
      S.hdrRed, S.hdrRed, S.hdrGray,
    ];
    for (let c = 0; c < N; c++) {
      const addr = encodeCell(2, c);
      if (!ws[addr]) ws[addr] = {v:'', t:'s'};
      ws[addr].s = hdrStyles[c];
    }

    // Data rows (r=3 … rowCount-2)
    for (let r = 3; r < rowCount - 1; r++) {
      const item    = data[r - 3];
      const isReply = item.is_reply || false;
      const even    = r % 2 === 0;
      const bgRgb   = isReply ? (even ? 'FFF3E0' : 'FFE0B2') : (even ? 'FFFFFF' : 'F5F5F5');
      const baseFill = { patternType:'solid', fgColor:{ rgb: bgRgb } };

      for (let c = 0; c < N; c++) {
        const addr = encodeCell(r, c);
        if (!ws[addr]) ws[addr] = {v:'', t:'s'};
        const cell = ws[addr];
        cell.s = { font:{name:'TH SarabunPSK',sz:14}, fill:baseFill, border:BORDER,
                   alignment:{vertical:'center', wrapText: (c===4||c===6||c===17)} };

        if (c === 0) { cell.s.alignment.horizontal = 'center'; cell.s.font.color = {rgb:'757575'}; }
        else if (c <= 3) { cell.s.alignment.horizontal='center'; cell.s.font.bold=true; cell.s.font.color={rgb:'1565C0'}; }
        else if (c === 4) { cell.s.alignment.horizontal='left'; cell.s.font.bold=true; cell.s.font.color={rgb:'1a237e'}; }
        else if (c === 5) { cell.s.alignment.horizontal='right'; cell.s.font.bold=true; cell.s.font.color={rgb:'1B5E20'}; cell.s.numFmt='#,##0.00'; }
        else if (c === 6) { cell.s.alignment.horizontal='center'; cell.s.font.sz=12; cell.s.font.color={rgb:'37474F'}; }
        else if (c>=7&&c<=9){ cell.s.alignment.horizontal='center'; cell.s.font.sz=12; cell.s.font.color={rgb:'37474F'}; }
        else if (c===10||c===11){ cell.s.alignment.horizontal='center'; cell.s.font.bold=true; cell.s.font.color={rgb:'E65100'}; }
        else if (c===12||c===13){ cell.s.alignment.horizontal='center'; cell.s.font.sz=12; cell.s.font.color={rgb:'37474F'}; }
        else if (c===14){ cell.s.alignment.horizontal='center'; cell.s.font.bold=true;
          cell.s.font.color={rgb: isReply?'B71C1C':'2E7D32'}; }
        else if (c>=15&&c<=16){ cell.s.alignment.horizontal='center'; cell.s.font.sz=12; }
        else if (c===17){ cell.s.alignment.horizontal='left'; cell.s.font.sz=12; cell.s.font.color={rgb:'555555'}; }
      }
    }

    // Footer row
    const fr = rowCount - 1;
    for (let c = 0; c < N; c++) {
      const addr = encodeCell(fr, c);
      if (!ws[addr]) ws[addr] = {v:'', t:'s'};
      ws[addr].s = c < 5 ? S.footerL : c === 5 ? S.footerAmt : S.footerR;
    }
    // set numFmt on footer amount cell
    const fAmtAddr = encodeCell(fr, 5);
    if (ws[fAmtAddr]) { ws[fAmtAddr].t = 'n'; ws[fAmtAddr].s.numFmt = '#,##0.00'; }

    // Freeze row 3
    ws['!freeze'] = { xSplit: 0, ySplit: 3 };

    XLSX.utils.book_append_sheet(wb, ws, 'รายการ');
    XLSX.writeFile(wb, `EIS_Report_Reply_${type}_${yearTh}.xlsx`);
  }


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

    const typeLabel  = type === "reply" ? "รายการทักท้วง" : "รายการส่งเบิกทั้งหมด";
    const monthLabel = monthIdx >= 0 ? MONTHS[monthIdx] : "ทุกเดือน (สะสมทั้งปี)";
    $title.text(`รายละเอียด${typeLabel}`);
    $sub.text(`ปีงบประมาณ ${yearTh} | เดือน: ${monthLabel}`);

    Ext.Ajax.request({
      // ✅ ชี้ไปที่ api ของ eis_reports
      url: "../api/List_Report_StatusReplyDetail.php",
      method: "POST",
      params: { fn: "List_QueryParam", year_th: yearTh, month_idx: monthIdx, staff: staffIds, data_type: type },
      success: function (resp) {
        try {
          const obj = Ext.decode(resp.responseText);
          if (obj.success && obj.data) {
            lastModalData = obj.data;
            renderModalTable(obj.data);
            $("#modalFooterInfo").text(`ทั้งหมด ${obj.data.length.toLocaleString()} รายการ`);
            initModalContextMenu();
          } else {
            $tableBody.html('<tr><td colspan="16" class="text-center py-4 text-muted">ไม่พบข้อมูล</td></tr>');
            $("#modalFooterInfo").text("0 รายการ");
          }
        } catch (e) {
          console.error("Decode Error", e);
          $tableBody.html('<tr><td colspan="16" class="text-center py-4 text-danger">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>');
        } finally {
          $loader.removeClass("d-flex").addClass("d-none");
        }
      },
      failure: function () {
        $loader.removeClass("d-flex").addClass("d-none");
        $tableBody.html('<tr><td colspan="16" class="text-center py-4 text-danger">การเชื่อมต่อล้มเหลว</td></tr>');
      },
    });

    $("#modalSearchInput").off("keyup").on("keyup", function () {
      const value = $(this).val().toLowerCase();
      $("#modalTableBody tr").filter(function () {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
      });
    });

    $("#btnExportModal").off("click").on("click", function () {
      exportStyledExcel(lastModalData, type, yearTh);
    });
  }

  function initModalContextMenu() {
    const $menu = $("#context-menu-modal");
    const $rows = $("#modalTableBody tr");

    $rows.off("contextmenu").on("contextmenu", function (e) {
      e.preventDefault();
      const isAdmin = Ext && Ext.session && String(Ext.session.user_id) === "1";
      if (isAdmin) { $("#menu-modal-show-sql").show(); } else { $("#menu-modal-show-sql").hide(); }
      $menu.css({ display: "block", left: e.pageX, top: e.pageY });
    });

    $("#menu-modal-show-sql").off("click").on("click", function () {
      $menu.hide();
      const params = { fn: "List_QueryParam", ...lastModalParams, show_sql: 1 };
      const qs = $.param(params);
      // ✅ ชี้ไปที่ api ของ eis_reports
      window.open("../api/List_Report_StatusReplyDetail.php?" + qs, "_blank");
    });

    $(document).on("click", function () { $menu.hide(); });
  }

  function renderModalTable(data) {
    const $tbody   = $("#modalTableBody");
    const $summary = $("#modalSummaryStats");
    let html = "";
    let sumTotal = 0.0, sumReply = 0.0;

    if (data.length === 0) {
      html = '<tr><td colspan="16" class="text-center py-4 text-muted">ไม่พบข้อมูล</td></tr>';
      $summary.html("");
    } else {
      data.forEach((item) => {
        const isReply    = item.is_reply || false;
        const statusText = isReply ? "โดนทักท้วง" : "ส่งเบิกปกติ";
        const badgeClass = isReply ? "badge badge-danger badge-pill" : "badge badge-success badge-pill";

        const c_code     = item.c_code     || "-";  // เลขที่ตรวจรับ (IR...)
        const c_code_ref = item.c_code_ref || "-";  // เลขส่งเบิก (02AP...)
        const rawDCode   = item.d_code     || "-";  // เลข D/F ปัจจุบัน (หลังแปลงแล้ว)
        const origACode  = item.orig_a_code || "";  // เลข A เดิม (ถ้ามี)

        // ถ้า d_code เดิมเป็น A แล้วถูกแปลงเป็น F → แสดงสีแดง + tooltip
        let d_code_html;
        if (origACode && origACode.startsWith("A")) {
          d_code_html = `
            <span class="text-danger font-weight-bold" 
                  title="รายการนี้ใช้เงินทดรองจ่าย (${origACode}) แล้วถูกเบิกคืนเป็นเลข ${rawDCode}"
                  data-toggle="tooltip" data-placement="top">
              ${rawDCode}
              <i class="fas fa-exclamation-circle ml-1" style="font-size:0.85em;"></i>
            </span>
            <br><small class="text-muted" style="font-size:0.78em;">( ชดใช้เงินทดลอง: ${origACode})</small>
          `;
        } else {
          d_code_html = `<span>${rawDCode}</span>`;
        }
        const c_heading  = item.c_heading_proj || "";
        const c_name_sub = item.c_name         || "";

        const proj_html = `
          <div style="width:260px;">
            <div title="${c_heading}"
                 style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;
                        overflow:hidden;font-size:0.88rem;font-weight:600;
                        line-height:1.45;color:#1a237e;white-space:normal;word-break:break-word;">
              ${c_heading || "-"}
            </div>
            ${c_name_sub && c_name_sub !== "-" ? `
            <div class="text-truncate"
                 title="${c_name_sub}"
                 style="font-size:0.75rem;color:#78909c;margin-top:3px;line-height:1.2;">
              <i class="fas fa-file-alt" style="font-size:0.65rem;"></i> ${c_name_sub}
            </div>` : ""}
          </div>`;
        const sender      = item.emp        || "-";
        const inspector   = item.po_emp_name || item.emp_tt || "-";
        const replyDate   = item.d_receive_date || "-";
        const sendBackDate = item.d_send_date   || "-";
        const reason     = item.c_comment  || "-";
        const d_arrive   = item.d_arrive_date   || "-";
        const d_check    = item.d_checking_date || "-";
        const d_send     = item.d_create   || "-";
        const diff1      = item.diff_arrive_check !== "-" ? item.diff_arrive_check + " วัน" : "-";
        const diff2      = item.diff_check_send   !== "-" ? item.diff_check_send   + " วัน" : "-";

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
                <td class="text-center text-muted small">${item.row_num}</td>
                <td class="font-weight-bold text-primary">${c_code}</td>
                <td>${c_code_ref}</td>
                <td class="text-muted small">${d_code_html}</td>
                <td style="vertical-align:middle;">${proj_html}</td>
                <td class="text-right font-weight-bold">${amtStr}</td>
                <td><div class="text-truncate" style="max-width: 150px;" title="${item.dc_creditor}">${item.dc_creditor || "-"}</div></td>
                <td class="text-center">${d_arrive}</td>
                <td class="text-center">${d_check}</td>
                <td class="text-center">${d_send}</td>
                <td class="text-center font-weight-bold text-info">${diff1}</td>
                <td class="text-center font-weight-bold text-info">${diff2}</td>
                <td><small>${sender}</small></td>
                <td><small>${inspector}</small></td>
                <td class="text-center"><span class="${badgeClass}" style="font-size:85%;">${statusText}</span></td>
                <td class="text-center">${replyDate}</td>
                <td class="text-center">${sendBackDate}</td>
                <td><small>${reason}</small></td>
            </tr>
        `;
      });

      const sumTotalStr = sumTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const sumReplyStr = sumReply.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      $summary.html(`
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
      `);
    }
    $tbody.html(html);
  }

  function renderChart(data) {
    if (!replyLineChart) replyLineChart = echarts.init(document.getElementById("replyLineChart"));

    let chartData   = [...data];
    let chartLabels = [...MONTHS];

    const now = new Date();
    const currentFiscalYear  = now.getMonth() >= 9 ? now.getFullYear() + 1 : now.getFullYear();
    const selectedYearTh     = parseInt($("#budget_year_filter").val());
    const selectedYearEn     = selectedYearTh - 543;

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
      yAxis: { type: "value" },
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

  $(() => {
    initYearSelect();
    loadData();
  });

  window.addEventListener("resize", () => { replyLineChart?.resize(); });
})();