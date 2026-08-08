/* Yearly_PR_Performance_Summary.js  — EIS Procure Edition
   แก้ไข: เปลี่ยนจาก window.open → popup modal แสดงข้อมูลรายละเอียด
*/

(function () {
    /* ===== Dark Mode helpers ===== */
    const getDark = () => localStorage.getItem("eisDarkMode_v1") === "on";
    const setDark = (on) => {
        document.body.classList.toggle("dark-mode", !!on);
        localStorage.setItem("eisDarkMode_v1", on ? "on" : "off");
    };

    window.DATA_BUDGET = window.DATA_BUDGET || [];
    let chartBar;

    /* ===== โหลดข้อมูลจาก EIS_procure API ===== */
    function loadAll(params = {}) {
        const pl = document.getElementById("pageLoader");
        if (pl) pl.style.display = "flex";

        Ext.Ajax.request({
            url: "/procure/bi/api/List_Rep_Yearly_PR_Performance_Summary.php",
            method: "GET",
            params: { fn: "List_QueryParam", ...params },
            success: function (resp) {
                const o = Ext.decode(resp.responseText || "{}");
                window.DATA_BUDGET = Array.isArray(o.data) ? o.data : [];

                renderBar(window.DATA_BUDGET);

                if (pl) pl.style.display = "none";
            },
            failure: function () {
                if (pl) pl.style.display = "none";
                Ext.Msg.alert("Error", "ดึงข้อมูลไม่สำเร็จ");
            },
        });
    }

    /* ===== helper: fiscal → doc month ===== */
    function mapFiscalToDoc(fiscalYear, fiscalMonth) {
        let docYear, docMonth;
        if (fiscalMonth >= 1 && fiscalMonth <= 3) {
            docYear  = fiscalYear - 1;
            docMonth = fiscalMonth + 9;
        } else {
            docYear  = fiscalYear;
            docMonth = fiscalMonth - 3;
        }
        return { docYear, docMonth };
    }

    function getDetailUrl(fiscalYear, fiscalMonth) {
        const year   = parseInt(fiscalYear, 10);
        const yearEn = year - 543;
        const { docYear, docMonth } = mapFiscalToDoc(year, fiscalMonth);

        return (
            `/procure/bi/api/Rep_DetailByTypeV7.php` +
            `?year=${docYear}&yearEn=${yearEn}` +
            `&monthbg=${fiscalMonth}&month=${docMonth}` +
            `&dc_expense_budget_type_id=0&bg_expense_id=0&Performance_Summary=1` +
            `&fn=List_Detail`
        );
    }

    /* ===== ชื่อเดือนภาษาไทย (index 1-12) ===== */
    const MONTH_NAMES = [
        null,
        "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
        "มกราคม",  "กุมภาพันธ์",  "มีนาคม",
        "เมษายน",  "พฤษภาคม",    "มิถุนายน",
        "กรกฎาคม", "สิงหาคม",   "กันยายน",
    ];

    /* ============================================================
       POPUP MODAL — แสดงรายละเอียดรายการ PR ของเดือน/ปีที่คลิก
       ============================================================ */
    function openDetailModal(fiscalYear, fiscalMonth) {
        const monthName = MONTH_NAMES[fiscalMonth] || "";
        const yearEn    = parseInt(fiscalYear, 10) - 543 + 543;   // แสดงเป็น ปีงบ (พ.ศ.)

        /* ---- ตั้งหัว modal ---- */
        const titleEl = document.getElementById("modalTitleText");
        if (titleEl) titleEl.textContent = `รายละเอียด - e-bidding เดือน ${monthName} [ปีงบ ${fiscalYear}]`;

        /* ---- reset state ---- */
        _modalShow("loader");

        /* ---- เปิด modal ---- */
        $("#detailModal").modal("show");

        /* ---- ดึงข้อมูลจาก API ---- */
        const url = getDetailUrl(fiscalYear, fiscalMonth);

        Ext.Ajax.request({
            url: url,
            method: "GET",
            success: function (resp) {
                let o;
                try { o = Ext.decode(resp.responseText || "{}"); } catch (e) { o = {}; }

                const rows = Array.isArray(o.data) ? o.data : [];

                if (!rows.length) {
                    /* แสดงข้อความแตกต่างตามปี */
                    const yr = parseInt(fiscalYear, 10);
                    const emptyEl = document.getElementById("modalEmpty");
                    if (emptyEl) {
                        emptyEl.innerHTML = yr < 2568
                            ? `<p class="text-muted mt-2 mb-0">ระบบเริ่มบันทึกข้อมูลตั้งแต่ปี 2568 เป็นต้นไป</p>`
                            : `<p class="text-muted mt-2 mb-0">ไม่พบข้อมูลในเดือนนี้</p>`;
                    }
                    _modalShow("empty");
                    return;
                }

                _renderModalTable(rows, fiscalYear, fiscalMonth, monthName);
            },
            failure: function () {
                document.getElementById("modalErrorMsg").textContent = "เกิดข้อผิดพลาดในการดึงข้อมูล";
                _modalShow("error");
            },
        });
    }

    /* ---- สลับ state ภายใน modal ---- */
    function _modalShow(state) {
        const states = { loader: "modalLoader", table: "modalTableWrap", empty: "modalEmpty", error: "modalError" };
        Object.values(states).forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.style.display = "none";
        });
        const target = states[state];
        if (target) {
            const el = document.getElementById(target);
            if (el) el.style.display = "";
        }
        // reset summary
        const sum = document.getElementById("modalSummaryText");
        if (sum && state !== "table") sum.textContent = "";
    }

    /* ---- Render ตารางภายใน modal ---- */
    function _renderModalTable(rows, fiscalYear, fiscalMonth, monthName) {
        /* thead */
        const thead = document.getElementById("modalThead");
        thead.innerHTML = `
            <tr>
                <th style="width:32px; text-align:center;">#</th>
                <th>เลขที่</th>
                <th style="min-width:200px;">ชื่อโครงการ</th>
                <th>ผู้รับผิดชอบ</th>
                <th>วันที่สร้าง</th>
                <th>วันประกาศ EGP</th>
                <th>วันทำสัญญา</th>
                <th>วิธีดำเนินงาน</th>
                <th>ประเภทสัญญา</th>
                <th style="text-align:center;">วัน</th>
                <th style="text-align:right;">วงเงิน (บาท)</th>
                <th style="text-align:center;">สถานะ</th>
            </tr>`;

        /* tbody */
        const tbody = document.getElementById("modalTbody");
        let totalAmount = 0;
        let passCount   = 0;
        let failCount   = 0;

        const html = rows.map((r, i) => {
            const amount  = parseFloat(r.amount ?? r.vgn ?? 0) || 0;
            totalAmount  += amount;
            const isPassed = (r.status ?? r.i_status ?? "").includes("ผ่านเกณฑ์") && !(r.status ?? "").includes("ไม่ผ่าน");
            if (isPassed) passCount++; else failCount++;

            const statusColor  = isPassed ? "#28a745" : "#dc3545";
            const statusWeight = "font-weight:bold;";

            const statusBg  = isPassed ? "#d1fae5" : "#fee2e2";
            const statusFg  = isPassed ? "#065f46" : "#991b1b";

            return `<tr>
                <td style="text-align:center; color:#9ca3af;">${i + 1}</td>
                <td style="white-space:nowrap; font-weight:600; color:#1a2e4a;">${r.doc_no ?? r.n_doc ?? "-"}</td>
                <td style="text-align:left;">${r.project_name ?? r.s_project ?? "-"}</td>
                <td style="white-space:nowrap;">${r.officer ?? r.s_officer ?? "-"}</td>
                <td style="white-space:nowrap; color:#6b7280;">${r.d_create_display ?? r.d_create ?? "-"}</td>
                <td style="white-space:nowrap; color:#6b7280;">${r.d_egp ?? "-"}</td>
                <td style="white-space:nowrap; color:#6b7280;">${r.d_contract ?? "-"}</td>
                <td style="text-align:center;"><span style="background:#eff6ff;color:#1d4ed8;border-radius:4px;padding:2px 7px;font-size:0.73rem;white-space:nowrap;">${r.method ?? r.s_method ?? "-"}</span></td>
                <td style="text-align:center;"><span style="background:#f3f4f6;color:#374151;border-radius:4px;padding:2px 7px;font-size:0.73rem;white-space:nowrap;">${r.contract_type ?? r.s_contract_type ?? "-"}</span></td>
                <td style="text-align:center; color:#6b7280;">${r.days ?? r.n_days ?? "-"}</td>
                <td style="text-align:right; font-weight:600; white-space:nowrap;">${amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                <td style="text-align:center;"><span style="background:${statusBg};color:${statusFg};border-radius:4px;padding:2px 8px;font-size:0.73rem;font-weight:600;white-space:nowrap;">${r.status ?? r.s_status ?? "-"}</span></td>
            </tr>`;
        }).join("");

        tbody.innerHTML = html;

        /* tfoot */
        const tfoot = document.getElementById("modalTfoot");
        tfoot.innerHTML = `
            <tr>
                <td colspan="10" style="text-align:left; color:#374151;">
                    รวม <strong>${rows.length}</strong> รายการ &nbsp;&nbsp;
                    ผ่านเกณฑ์ <strong style="color:#065f46;">${passCount}</strong> &nbsp;
                    ไม่ผ่าน <strong style="color:#991b1b;">${failCount}</strong>
                </td>
                <td style="text-align:right; color:#1a2e4a; font-weight:700;">${totalAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                <td></td>
            </tr>`;

        /* summary footer ของ modal */
        const sumEl = document.getElementById("modalSummaryText");
        if (sumEl) {
            sumEl.innerHTML = `รวม <strong>${rows.length}</strong> รายการ &nbsp;|&nbsp; วงเงิน <strong>${totalAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</strong> บาท`;
        }

        _modalShow("table");

        /* Dark mode handled by CSS */
    }

    /* ===== กราฟหลัก (Line Chart — Yearly Trend) ===== */
    function renderBar(itemsRaw) {
        if (!chartBar) {
            chartBar = echarts.init(document.getElementById("bar_bg"));
        } else {
            chartBar.clear();
        }

        const rows = itemsRaw || window.DATA_BUDGET || [];
        if (!rows.length) {
            chartBar.setOption({});
            renderTable([]);
            return;
        }

        const monthHeader = [
            "product",
            "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
            "มกราคม", "กุมภาพันธ์", "มีนาคม",
            "เมษายน", "พฤษภาคม", "มิถุนายน",
            "กรกฎาคม", "สิงหาคม", "กันยายน",
        ];

        const byYear = {};
        rows.forEach((r) => {
            const year = String(r.year_th);
            const m    = parseInt(r.month_no, 10);
            if (!year || isNaN(m) || m < 1 || m > 12) return;

            if (!byYear[year]) byYear[year] = new Array(12).fill(0);
            byYear[year][m - 1] = Number(r.cumulative_total ?? r.total_pr ?? 0) || 0;
        });

        /* แสดงปีงบ 2566–2570 เสมอ (เติม 0 ถ้าปีนั้นไม่มีข้อมูล) */
        const FIXED_YEARS = ["2566","2567","2568","2569","2570"];
        FIXED_YEARS.forEach((y) => { if (!byYear[y]) byYear[y] = new Array(12).fill(0); });
        const last5Years = FIXED_YEARS;

        const source = [monthHeader];
        last5Years.forEach((y) => source.push([y, ...byYear[y]]));

        const series = last5Years.map(() => ({
            type: "line",
            smooth: true,
            symbolSize: 10,
            lineStyle: { width: 4, shadowColor: "rgba(0,0,0,0.3)", shadowBlur: 10, shadowOffsetY: 5 },
            emphasis: { focus: "series", scale: true },
            seriesLayoutBy: "row",
        }));

        const isDark        = getDark();
        const textColor     = isDark ? "#e9ecef" : "#000";
        const tooltipBg     = isDark ? "rgba(50,50,50,0.9)" : "rgba(255,255,255,0.9)";
        const tooltipBorder = isDark ? "#dee2e6" : "#333";

        const option = {
            backgroundColor: "transparent",
            legend: { textStyle: { color: textColor } },
            tooltip: {
                trigger: "axis",
                backgroundColor: tooltipBg,
                borderColor: tooltipBorder,
                borderWidth: 1,
                textStyle: { color: textColor },
                axisPointer: { type: "cross", label: { backgroundColor: "#6a7985" } },
            },
            dataset: { source },
            grid: [{ top: "25%", bottom: "15%" }],
            xAxis: { type: "category", gridIndex: 0, axisLabel: { color: textColor } },
            yAxis: { gridIndex: 0, axisLabel: { color: textColor } },
            label: { show: true, position: "top", fontSize: 12, color: textColor },
            series,
            labelLayout: { hideOverlap: true },
        };

        chartBar.setOption(option);

        /* ===== Click-through กราฟ → popup modal ===== */
        chartBar.off("click");
        chartBar.on("click", function (params) {
            const currentYear = String(new Date().getFullYear() + 543);
            if (String(params.seriesName) !== currentYear) return;

            const fiscalYear  = params.seriesName;
            const fiscalMonth = params.dataIndex + 1;  // 1-12

            openDetailModal(fiscalYear, fiscalMonth);
        });

        renderTable(window.DATA_BUDGET);
    }

    /* ===== ตารางรายปี (Monthly Data Table) ===== */
    function renderTable(itemsRaw) {
        const rows      = itemsRaw || [];
        const tableBody = document.getElementById("tableBody");
        if (!tableBody) return;

        if (!rows.length) {
            tableBody.innerHTML = '<tr><td colspan="14" class="text-center">ไม่พบข้อมูล</td></tr>';
            return;
        }

        const byYearCumulative = {};
        const years = new Set();

        rows.forEach((r) => {
            const y = String(r.year_th);
            const m = parseInt(r.month_no, 10);
            if (!y || isNaN(m)) return;

            years.add(y);
            if (!byYearCumulative[y]) byYearCumulative[y] = new Array(13).fill(0);
            byYearCumulative[y][m] = Number(r.cumulative_total ?? 0);
        });

        /* แสดงปีงบ 2566–2570 เสมอ (เติม 0 ถ้าปีนั้นไม่มีข้อมูล) */
        const FIXED_YEARS = ["2566","2567","2568","2569","2570"];
        FIXED_YEARS.forEach((y) => {
            if (!byYearCumulative[y]) byYearCumulative[y] = new Array(13).fill(0);
        });
        const sortedYears = FIXED_YEARS;

        const byYearMonthly = {};
        sortedYears.forEach((year) => {
            byYearMonthly[year] = new Array(13).fill(0);
            for (let m = 1; m <= 12; m++) {
                const cur  = byYearCumulative[year][m];
                const prev = byYearCumulative[year][m - 1] || 0;
                byYearMonthly[year][m] = cur > 0 ? cur - prev : 0;
            }
        });

        let html = "";
        sortedYears.forEach((year) => {
            const prevYear    = String(parseInt(year) - 1);
            const hasPrevYear = byYearMonthly[prevYear];

            let rowHtml   = `<tr data-fiscal-year="${year}"><td class="font-weight-bold" style="vertical-align:middle;">${year}</td>`;
            let totalYear = 0;

            for (let m = 1; m <= 12; m++) {
                const val         = byYearMonthly[year][m];
                totalYear        += val;
                const cellContent = val > 0 ? val.toLocaleString() : "-";
                let growthHtml    = "";

                if (hasPrevYear && byYearMonthly[prevYear][m] > 0 && val > 0) {
                    const prevVal  = byYearMonthly[prevYear][m];
                    const growth   = ((val - prevVal) / prevVal) * 100;
                    const colorCls = growth >= 0 ? "text-success" : "text-danger";
                    const icon     = growth >= 0 ? "▲" : "▼";
                    growthHtml = `<br><span class="${colorCls}" style="font-size:0.7rem;font-weight:bold;">${icon} ${Math.abs(growth).toFixed(1)}%</span>`;
                }

                const isClickable = val > 0;
                const cellClass   = isClickable ? "table-cell-clickable" : "";
                rowHtml += `<td class="${cellClass}" data-fiscal-month="${m}" style="vertical-align:middle;${isClickable ? "cursor:pointer; color:#1a56db; font-weight:600;" : "color:#9ca3af;"}">${cellContent}${growthHtml}</td>`;
            }

            rowHtml += `<td class="font-weight-bold bg-light" style="vertical-align:middle;">${totalYear.toLocaleString()}</td></tr>`;
            html    += rowHtml;
        });

        tableBody.innerHTML = html;

        /* ===== คลิกเซลล์ → popup modal (แทน window.open) ===== */
        tableBody.querySelectorAll(".table-cell-clickable").forEach((cell) => {
            cell.addEventListener("click", function () {
                const row = this.closest("tr");
                if (!row) return;

                const fiscalYear  = row.getAttribute("data-fiscal-year");
                const fiscalMonth = parseInt(this.getAttribute("data-fiscal-month"), 10);
                if (!fiscalYear || !fiscalMonth || fiscalMonth < 1 || fiscalMonth > 12) return;

                openDetailModal(fiscalYear, fiscalMonth);
            });
        });
    }

    /* ===== DOM Ready ===== */
    document.addEventListener("DOMContentLoaded", () => {
        setDark(getDark());

        const darkToggle = document.getElementById("darkToggle");
        if (darkToggle) {
            darkToggle.checked = getDark();
            darkToggle.addEventListener("change", (e) => {
                setDark(e.target.checked);
                renderBar(window.DATA_BUDGET);
            });
        }

        loadAll();
    });

    /* expose เพื่อให้ PHP เรียกได้ */
    window.loadAll = loadAll;
})();