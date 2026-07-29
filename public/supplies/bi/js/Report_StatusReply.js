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

    // Extract unique staff from data
    window.DATA_RAW.forEach((it) => {
      // API returns staff_id and staff_name
      if (it.staff_id && it.staff_name) {
        staffMap.set(it.staff_id, it.staff_name);
      }
    });

    // Sort by name
    const sortedStaff = [...staffMap.entries()].sort((a, b) => a[1].localeCompare(b[1]));
    sortedStaff.forEach(([id, name]) => $s.append(new Option(name, id)));

    $s.selectpicker("refresh").selectpicker("selectAll");
    // Re-bind event
    $s.off("changed.bs.select").on("changed.bs.select", recalculateAndRender);

    // Explicitly update render after setting initial filters
    recalculateAndRender();
  }

  function loadData() {
    const loader = document.getElementById("pageLoader");
    if (loader) loader.style.display = "flex";
    const yearTh = $("#budget_year_filter").val();
    const params = {
      fn: "List_QueryParam",
    };

    // Only send year_en if it has a valid value
    if (yearTh) {
      params.year_en = yearTh;
    }

    $.ajax({
      url: "../api/List_Report_StatusReply.php",
      method: "POST", // or GET
      data: params,
      dataType: "text",
      success: function (responseText) {
        try {
          const obj = JSON.parse(responseText);
          if (obj.success && obj.data) {
            window.DATA_RAW = obj.data;
            initFilters(); // Populate filters and trigger render via selectAll/event
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
      error: function () {
        console.error("Ajax Failed");
        if (loader) loader.style.display = "none";
      },
    });
  }

  function recalculateAndRender() {
    // Immediate render (no timeout needed as data is already loaded)
    const staffIds = ($("#filter_staff").val() || []).map(Number);

    // Filter Data
    const filtered = window.DATA_RAW.filter((it) => staffIds.includes(Number(it.staff_id)));

    // Aggregate Data by Month
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
      // Check if is_reply is true (or 1)
      if (Number(it.is_reply) === 1 || it.is_reply === true) {
        monthlyData[it.month_idx].reply++;
        totalReply++;
      }
    });

    // Render Summary Box
    $("#sum_sent_all").text(totalSent.toLocaleString());
    $("#sum_reply_all").text(totalReply.toLocaleString());
    const pctTotal = totalSent > 0 ? ((totalReply / totalSent) * 100).toFixed(2) : "0.00";
    $("#sum_percent_all").text(pctTotal + "%");

    renderTable(monthlyData, totalSent, totalReply);
    renderChart(monthlyData);
  }

  function renderTable(data, totalSent, totalReply) {
    let rowSent = "";
    let rowReply = "";
    let rowPct = "";
    let rowInc = "";
    let rowSentInc = "";

    data.forEach((d, i) => {
      // Sent Row
      rowSent += `<td class="cursor-pointer" data-month="${i}" data-type="sent">${d.sent.toLocaleString()}</td>`;

      // Reply Row
      const replyCls = d.reply > 0 ? "text-reply" : "";
      rowReply += `<td class="${replyCls} cursor-pointer" data-month="${i}" data-type="reply">${d.reply.toLocaleString()}</td>`;

      // % Reply Row (Reply / Sent)
      const pct = d.sent > 0 ? ((d.reply / d.sent) * 100).toFixed(1) : "0.0";
      const pctCls = parseFloat(pct) > 0 ? "text-danger" : "text-muted";
      rowPct += `<td class="${pctCls}">${pct}%</td>`;

      // % Increase Row (Reply)
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

      // % Increase Row (Sent)
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

    // Totals
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
    const $tableCells = $("#replyTableBody td.cursor-pointer[data-month]"); // Only monthly cells

    $tableCells.on("contextmenu", function (e) {
      e.preventDefault();

      // Get data from cell
      const month = $(this).data("month");
      const type = $(this).data("type");
      const yearTh = $("#budget_year_filter").val();
      const staffIds = ($("#filter_staff").val() || []).join(",");

      // Set menu position
      $menu.css({
        display: "block",
        left: e.pageX,
        top: e.pageY,
      });

      // Handle menu click
      $("#menu-view-detail")
        .off("click")
        .on("click", function () {
          $menu.hide();
          showDetailModal(yearTh, month, type, staffIds);
        });

      // Handle Show SQL (Admin)
      // Check if user is admin
      const isAdmin = Ext && Ext.session && String(Ext.session.user_id) === "1";
      if (isAdmin) {
        $("#menu-show-sql").show();
      } else {
        $("#menu-show-sql").hide();
      }

      $("#menu-show-sql")
        .off("click")
        .on("click", function () {
          $menu.hide();
          // Construct URL parameters
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
      const type = $(this).data("type"); // sent | reply
      const yearTh = $("#budget_year_filter").val();
      const staffIds = ($("#filter_staff").val() || []).join(",");
      // monthIdx = -1 for All Months
      showDetailModal(yearTh, -1, type, staffIds);
    });
  }

  // Store last params for modal SQL debugging
  let lastModalParams = {};

  function showDetailModal(yearTh, monthIdx, type, staffIds) {
    const $modal = $("#detailModal");
    const $loader = $("#modalLoader");
    const $tableBody = $("#modalTableBody");
    const $title = $("#modalTitle");
    const $sub = $("#modalSubtitle");

    // Store for Context Menu
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

    // Set Header
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

            // Init Context Menu for Modal Rows
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

    // Wire up Search
    $("#modalSearchInput")
      .off("keyup")
      .on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#modalTableBody tr").filter(function () {
          $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
      });

    // Wire up Export
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

      // Check admin permission
      const isAdmin = Ext && Ext.session && String(Ext.session.user_id) === "1";
      if (isAdmin) {
        $("#menu-modal-show-sql").show();
      } else {
        $("#menu-modal-show-sql").hide();
      }

      // Adjust position to mouse cursor
      $menu.css({
        display: "block",
        left: e.pageX,
        top: e.pageY,
      });
    });

    // Handle Show SQL (Detailed)
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

    // Hide menu on click elsewhere
    $(document).on("click", function () {
      $menu.hide();
    });
    // Also hide when modal closes or scrolls if needed, but document click covers most
  }

  function renderModalTable(data) {
    const $tbody = $("#modalTableBody");
    const $summary = $("#modalSummaryStats");
    let html = "";

    let sumTotal = 0.0;
    let sumReply = 0.0;

    if (data.length === 0) {
      html = '<tr><td colspan="15" class="text-center py-4 text-muted">ไม่พบข้อมูล</td></tr>';
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
        const replyDate = item.d_receive_date || "-";
        const reason = item.c_comment || "-";

        const d_arrive = item.d_arrive_date || "-";
        const d_check = item.d_checking_date || "-";
        const d_send = item.d_create || "-"; // Reimburse Send Date

        const diff1 = item.diff_arrive_check !== "-" ? item.diff_arrive_check + " วัน" : "-";
        const diff2 = item.diff_check_send !== "-" ? item.diff_check_send + " วัน" : "-";

        // Sum Calculation
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
                <td class="text-center font-weight-bold text-info">${diff1}</td>
                <td class="text-center font-weight-bold text-info">${diff2}</td>

                <td><small>${sender}</small></td>
                <td><small>${inspector}</small></td>
                <td class="text-center"><span class="${badgeClass}" style="font-size:85%;">${statusText}</span></td>
                <td class="text-center">${replyDate}</td>
                <td><small>${reason}</small></td>
            </tr>
        `;
      });

      // Render Summary Stats
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

  function renderChart(data) {
    if (!replyLineChart) replyLineChart = echarts.init(document.getElementById("replyLineChart"));

    // Check fiscal year to filter future months
    let chartData = [...data];
    let chartLabels = [...MONTHS];

    const now = new Date();
    // Fiscal Year starts Oct.
    const currentFiscalYear = now.getMonth() >= 9 ? now.getFullYear() + 1 : now.getFullYear();
    const selectedYearTh = parseInt($("#budget_year_filter").val());
    const selectedYearEn = selectedYearTh - 543;

    if (selectedYearEn === currentFiscalYear) {
      const currentMonthIdx = (now.getMonth() + 3) % 12;

      // Slice up to current month (inclusive)
      chartData = data.slice(0, currentMonthIdx + 1);
      chartLabels = MONTHS.slice(0, currentMonthIdx + 1);
    }

    const option = {
      title: { text: "" },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "cross" },
      },
      legend: {
        data: ["เรื่องส่งเบิก", "โดนทักท้วง"],
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
        data: chartLabels,
      },
      yAxis: {
        type: "value",
      },
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

  window.addEventListener("resize", () => {
    replyLineChart?.resize();
  });
})();
