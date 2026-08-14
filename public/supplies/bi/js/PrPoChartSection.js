/**
 * PR/PO Monitoring Chart Section
 * ================================
 * เพิ่มกราฟแสดง PR (ยังไม่มี PO) และ PO (สัญญา) แยกตามแหล่งเงิน
 * ดึงข้อมูลจาก List_DetailBgV5.php และเปิด Rep_DetailByTypeV5.php เมื่อคลิก
 *
 * วิธีใช้:
 * 1. เพิ่มโค้ด HTML Section ด้านล่างนี้ใน Budget_Monitoring_Dashboard.php
 *    ต่อจาก <!-- ===== Charts ===== --> section เดิม
 * 2. include ไฟล์นี้ใน Budget_Monitoring_Dashboard.php:
 *    <script src="../js/PrPoChartSection.js?_dc<?= __VPRODUCT_; ?>"></script>
 */

/* =====================================================================
   HTML TEMPLATE — แทรกใน Budget_Monitoring_Dashboard.php
   วางหลัง </div> ปิด row ของ Charts เดิม (ก่อน Data View card)
   =====================================================================

<div class="row mt-3" id="prpo-section">
    <div class="col-lg-8">
        <div class="card mb-3">
            <div class="card-body">
                <h6 class="mb-3 font-weight-bold">
                    สถานะการจองเงิน: PR และ PO แยกตามหมวดค่าใช้จ่าย
                </h6>
                <div id="chart_prpo_bar" style="height:520px; min-height:340px;"></div>
            </div>
        </div>
    </div>
    <div class="col-lg-4">
        <div class="card mb-3">
            <div class="card-body">
                <h6 class="mb-2 font-weight-bold">สรุป PR / PO</h6>
                <div id="prpoSummaryCards"></div>
            </div>
        </div>
        <div class="card mb-3">
            <div class="card-body">
                <h6 class="mb-2 font-weight-bold">สัดส่วน PR vs PO</h6>
                <div id="chart_prpo_pie" style="height:260px;"></div>
            </div>
        </div>
    </div>
</div>

   ===================================================================== */

(function () {
    "use strict";

    /* ------------------------------------------------------------------
       Config
    ------------------------------------------------------------------ */
    const API_URL = "../api/List_DetailBgV5.php";
    const DETAIL_URL = "/supplies/bi/reports/Rep_DetailByTypeV5.php";

    /* ------------------------------------------------------------------
       State
    ------------------------------------------------------------------ */
    let _prRows = [];
    let _poRows = [];
    let _paidRows = [];
    let _budgetTotal = 0;
    let _reserveTotal = 0;
    let _remaining = 0;
    let _prTotal = 0;
    let _contractTotal = 0;
    let _chartBar = null;
    let _chartPie = null;

    /* ------------------------------------------------------------------
       Format helpers
    ------------------------------------------------------------------ */
    const fmt = (n) =>
        (Number(n) || 0).toLocaleString("th-TH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    /* ------------------------------------------------------------------
       Fetch detail data
    ------------------------------------------------------------------ */
    function fetchPrPoData(params, callback) {
        $.ajax({
            url: API_URL,
            method: "GET",
            data: { fn: "List_QueryParam", ...params },
            success: function (resp) {
                let o = {};
                try {
                    o = typeof resp === "string" ? JSON.parse(resp) : resp;
                } catch (e) {}
                callback(null, o);
            },
            failure: function () {
                callback(new Error("fetch failed"));
            },
        });
    }

    /* ------------------------------------------------------------------
       Build budget lookup map จาก Result Set 2 (budget_detail array)
       key = bg_expense_id → { f_budget_total, f_reserve_total, f_remaining }
    ------------------------------------------------------------------ */
    function buildBudgetMap(budgetDetail) {
        const map = new Map();
        if (!Array.isArray(budgetDetail)) return map;
        budgetDetail.forEach((b) => {
            const id = String(b.bg_expense_id);
            if (!map.has(id)) {
                map.set(id, {
                    f_budget_total:  Number(b.f_budget_total)  || 0,
                    f_reserve_total: Number(b.f_reserve_total) || 0,
                    dc_expense_budget_type_id: b.dc_expense_budget_type_id || "",
                });
            } else {
                // รวมกรณีมีหลาย dc_expense_budget_type_id ต่อ bg_expense_id เดียว
                const cur = map.get(id);
                cur.f_budget_total  += Number(b.f_budget_total)  || 0;
                cur.f_reserve_total += Number(b.f_reserve_total) || 0;
            }
        });
        // คำนวณ f_remaining หลังรวมแล้ว
        map.forEach((v) => {
            v.f_remaining = v.f_budget_total - v.f_reserve_total;
        });
        return map;
    }

    /* ------------------------------------------------------------------
       Aggregate PR rows by bg_expense for chart
       [FIX] กรองเฉพาะ PR ที่ has_po === 0 เท่านั้น
             เพื่อไม่ให้นับซ้ำกับ PO rows ใน Result Set 3
       [FIX2] แนบ f_budget / f_reserve / f_remaining จาก budgetMap
              เพื่อให้ click handler ส่งค่าถูกต้องไปยัง Rep_DetailByTypeV5
    ------------------------------------------------------------------ */
    function aggregatePrByExpense(prRows, poRows, budgetMap, paidRows) {
        const map = new Map();
        paidRows = paidRows || [];

        // PR rows — เฉพาะที่ยังไม่มี PO (has_po == 0)
        prRows
            .filter((r) => Number(r.has_po) === 0)  // [FIX]
            .forEach((r) => {
                const key = r.bg_expense_id + "_" + (r.bg_expense || "");
                if (!map.has(key)) {
                    const bg = budgetMap.get(String(r.bg_expense_id)) || {};
                    map.set(key, {
                        bg_expense_id: r.bg_expense_id,
                        bg_expense: r.bg_expense || "-",
                        dc_expense_budget_type_id: r.dc_expense_budget_type_id,
                        dc_expense_budget_type: r.dc_expense_budget_type || "-",
                        f_pr: 0,
                        f_po: 0,
                        f_paid: 0,
                        pr_count: 0,
                        po_count: 0,
                        paid_count: 0,
                        // [FIX2] ค่างบประมาณจริงจาก Result Set 2
                        f_budget_total:  bg.f_budget_total  || 0,
                        f_reserve_total: bg.f_reserve_total || 0,
                        f_remaining:     bg.f_remaining     || 0,
                    });
                }
                const cur = map.get(key);
                cur.f_pr += Number(r.f_amt) || 0;
                cur.pr_count += 1;
            });

        // PO rows
        // [FIX-BKK4] ห้ามนับ PO ที่เป็น cross budget_type (is_cross_type=true / i_own_match=0)
        // เพราะ PO เหล่านี้ถูกดึงมาแสดงเพื่อความโปร่งใสเท่านั้น แต่ไม่ได้เป็นของแหล่งเงินนี้จริง
        // (ดูคอมเมนต์ "แก้ไข 5" ใน List_DetailBgV5.php — ตัวอย่างที่พบคือแหล่งเงินกทม. id=4)
        poRows.filter((r) => !r.is_cross_type).forEach((r) => {
            const key = r.bg_expense_id + "_" + (r.bg_expense || "");
            if (!map.has(key)) {
                const bg = budgetMap.get(String(r.bg_expense_id)) || {};
                map.set(key, {
                    bg_expense_id: r.bg_expense_id,
                    bg_expense: r.bg_expense || "-",
                    dc_expense_budget_type_id: r.dc_expense_budget_type_id,
                    dc_expense_budget_type: r.dc_expense_budget_type || "-",
                    f_pr: 0,
                    f_po: 0,
                    f_paid: 0,
                    pr_count: 0,
                    po_count: 0,
                    paid_count: 0,
                    // [FIX2]
                    f_budget_total:  bg.f_budget_total  || 0,
                    f_reserve_total: bg.f_reserve_total || 0,
                    f_remaining:     bg.f_remaining     || 0,
                });
            }
            const cur = map.get(key);
            cur.f_po += Number(r.f_amt_contract) || 0;
            cur.po_count += 1;
        });

        // เบิกจ่ายแล้ว (paid rows) — มาจาก Result Set 4 แยกตาม bg_expense_id แล้วจาก server
        paidRows.forEach((r) => {
            const key = r.bg_expense_id + "_" + (r.bg_expense || "");
            if (!map.has(key)) {
                const bg = budgetMap.get(String(r.bg_expense_id)) || {};
                map.set(key, {
                    bg_expense_id: r.bg_expense_id,
                    bg_expense: r.bg_expense || "-",
                    dc_expense_budget_type_id: r.dc_expense_budget_type_id,
                    dc_expense_budget_type: r.dc_expense_budget_type || "-",
                    f_pr: 0,
                    f_po: 0,
                    f_paid: 0,
                    pr_count: 0,
                    po_count: 0,
                    paid_count: 0,
                    f_budget_total:  bg.f_budget_total  || 0,
                    f_reserve_total: bg.f_reserve_total || 0,
                    f_remaining:     bg.f_remaining     || 0,
                });
            }
            const cur = map.get(key);
            cur.f_paid += Number(r.f_paid_total) || 0;
            cur.paid_count += Number(r.paid_count) || 0;
        });

        return Array.from(map.values()).sort((a, b) => {
            const va = a.f_pr + a.f_po + a.f_paid;
            const vb = b.f_pr + b.f_po + b.f_paid;
            return vb - va; // เรียงจากมากไปน้อย
        });
    }

    /* ------------------------------------------------------------------
       Render summary cards
       [FIX] คำนวณ fPr และ prCount จาก rows จริง (has_po == 0)
             แทนการใช้ data.f_pr_total ที่อาจไม่ตรง
    ------------------------------------------------------------------ */
    function renderPrPoSummaryCards(data) {
        const el = document.getElementById("prpoSummaryCards");
        if (!el) return;

            const DATA = window.DATA_BUDGET || [];

            // กรองตาม dc_expense_budget_type_id ที่ส่งมาใน params เดียวกับที่ fetch
            const ids = $("#multiCheckCombo").val() || [];
            const year = $("#budget_year_filter").val() || "all";

            const filtered = DATA.filter(r => {
                if (year !== "all" && String(r.budget_year) !== String(year)) return false;
                if (ids.length && !ids.includes(String(r.dc_expense_budget_type_id))) return false;
                return true;
            });

            // แก้เป็น: คำนวณ remain ต่อ row แล้วค่อยรวม (เหมือน pickBudget)
            const fBudget   = filtered.reduce((s, r) => s + (Number(r.f_budget_real) || 0), 0);
            const fReserve  = filtered.reduce((s, r) => s + (Number(r.f_reserve_total) || 0), 0);
            const fPaid     = filtered.reduce((s, r) => s + (Number(r.f_paid_total) || 0), 0);
            const fInsp     = filtered.reduce((s, r) => s + (Number(r.f_reserve_check_total) || 0), 0); // เงินจองตรวจรับ
            const fContract = data.f_contract_total || 0;
            const fRemain   = filtered.reduce((s, r) => {
            const total   = Number(r.f_budget_real)    || 0;
            const booked  = Number(r.f_reserve_total)  || 0;
            const insp    = Number(r.f_reserve_check_total) || 0;
            const working = Number(r.f_paid_total)     || 0;
            const d1      = Number(r.f_d1_not_finish)  || 0;
            const remain = Number(r.dc_expense_budget_type_id) === 5
                ? Math.max(0, total - booked) - insp - working - d1
                : total - booked - insp - working - d1;
            return s + remain;
        }, 0);
        // [FIX] คำนวณ PR-only จาก rows จริง (has_po == 0)
        const prRows = Array.isArray(data.data) ? data.data : [];
        const prOnlyRows = prRows.filter((r) => Number(r.has_po) === 0);
        const prWithPoRows = prRows.filter((r) => Number(r.has_po) > 0);  // ← เพิ่ม
        const fPr        = prOnlyRows.reduce((s, r) => s + (Number(r.f_amt) || 0), 0);
        const prCount    = prOnlyRows.length;
        const prWithPoCount = prWithPoRows.length;  // ← เพิ่ม

        // [FIX-BKK4 2026-07-31] "หัก ณ จองเงินในสัญญาแล้ว" = ผลรวม f_amt ของ PR ที่มี PO แล้ว
        // (has_po > 0) — Result Set 1 คืนยอดจองปัจจุบัน ณ สถานะล่าสุดของ PR นั้นให้ตรงอยู่แล้ว
        // (ไม่ต้องพึ่งการจับคู่กับ PO cross-type ซึ่งเปราะบางกว่า และตรงกับสูตรใน Rep_PrPoListV5.php)
        //   fPr + fPrDeducted  =  fReserve (จองเงินแล้ว)
        const fPrDeducted   = prWithPoRows.reduce((s, r) => s + (Number(r.f_amt) || 0), 0);
        const deductedCount = prWithPoCount;

        const allPoRows = Array.isArray(data.contract) ? data.contract : [];
        const poOwnRows = allPoRows.filter((r) => !r.is_cross_type);
        const poCount   = poOwnRows.length;

        // เช็คผลรวมเทียบกับ "จองเงินแล้ว" เพื่อโชว์เป็น checksum ให้ตรวจสอบง่าย
        // [FIX-CHECKSUM] เดิมบวก fContract (ยอดมูลค่าสัญญาจริงจาก Result Set 3 อีกชุดข้อมูลหนึ่ง)
        // เข้าไปด้วย ทำให้นับซ้ำกับ fPrDeducted ซึ่งเป็นยอดเดียวกัน (ดูคอมเมนต์การ์ด "จองสัญญา (PO)"
        // ด้านล่าง) จริง ๆ แล้ว fPr + fPrDeducted ก็เท่ากับ fReserve ("จองเงินแล้ว") พอดีอยู่แล้ว
        const sumCheck  = fPr + fPrDeducted;
        const diffCheck = fReserve - sumCheck;
        const isMatched = Math.abs(diffCheck) < 1; // เผื่อ rounding ไม่เกิน 1 บาท

        const pctUsed = fBudget > 0 ? ((fReserve / fBudget) * 100).toFixed(2) : "0.00";
        // ← เพิ่ม 4 บรรทัดนี้
        const dcCostId = new URLSearchParams(window.location.search).get("dc_cost_id") || "38";
        // แก้เป็น — ดึงจาก multiCheckCombo ที่ user เลือก
        const _selIds = $("#multiCheckCombo").val() || [];
        const dcTypeId = _selIds.length === 1 ? _selIds[0] : _selIds.join(",");
        const yearTh   = document.getElementById("budget_year_filter")?.value || "";
        const yearEn   = yearTh ? Number(yearTh) - 543 : new Date().getFullYear();
        const cardBase = "border-radius:10px;padding:18px 16px;box-shadow:0 1px 3px rgba(0,0,0,0.08);height:100%;box-sizing:border-box;";
        const clickable = "cursor:pointer;transition:transform .15s,box-shadow .15s;";
        el.innerHTML = `
        <style>
            .pr-po-card{display:flex;flex-direction:column;justify-content:center;align-items:center;overflow-wrap:break-word;word-break:break-word;width:100%;}
            .pr-po-card:hover.clickable{transform:translateY(-2px);box-shadow:0 4px 10px rgba(0,0,0,0.12) !important;}
            .pr-po-card .pr-po-label{margin-bottom:10px;line-height:1.4;}
            .pr-po-card .pr-po-value{margin-bottom:6px;line-height:1.25;white-space:nowrap;}
            .pr-po-row-2{min-height:135px;}
            .pr-po-row-4{min-height:190px;}
            .pr-po-row-5{min-height:190px;}
            .pr-po-row-total{min-height:110px;}
        </style>
        <div class="row g-3 text-center mb-3 align-items-stretch pr-po-row-2">
            <div class="col-6 d-flex">
                <div class="pr-po-card" style="${cardBase} background:#eef4ff;border-left:4px solid #4a6cf7;">
                    <div class="small text-muted pr-po-label">งบประมาณรวม</div>
                    <div class="font-weight-bold pr-po-value" style="font-size:18px;color:#3454d1;">${fmt(fBudget)}</div>
                </div>
            </div>
            <div class="col-6 d-flex">
                <div class="pr-po-card" style="${cardBase} background:#eafaf9;border-left:4px solid #17a2b8;">
                    <div class="small text-muted pr-po-label">จองเงินแล้ว</div>
                    <div class="font-weight-bold pr-po-value" style="font-size:18px;color:#0f8391;">${fmt(fReserve)}</div>
                    <div class="small text-muted">${pctUsed}%</div>
                </div>
            </div>
        </div>

        <div class="row g-2 text-center mb-3 align-items-stretch pr-po-row-5">
            <div class="col d-flex">
                <div class="pr-po-card clickable" style="${cardBase} ${clickable} padding:16px 6px;background:#fdf3e3;border-left:4px solid #d99a1b;"
                    onclick="window.open('/supplies/bi/reports/Rep_PrPoListV5.php?col=pr&year_en=${yearEn}&year_th=${yearTh}&dc_cost_id=${dcCostId}&dc_expense_budget_type_id=${dcTypeId}','_blank')">
                    <div class="small text-muted pr-po-label">จอง PR<span>▶</span></div>
                    <div class="font-weight-bold pr-po-value" style="font-size:13px;color:#9a6a00;">${fmt(fPr + fPrDeducted)}</div>
                    <div class="small text-muted">${prCount + deductedCount} รายการ</div>
                </div>
            </div>
            <div class="col d-flex">
                <div class="pr-po-card clickable" style="${cardBase} ${clickable} padding:16px 6px;background:#fff8e6;border-left:4px solid #f4a300;"
                    onclick="window.open('/supplies/bi/reports/Rep_PrPoListV5.php?col=pr_open&year_en=${yearEn}&year_th=${yearTh}&dc_cost_id=${dcCostId}&dc_expense_budget_type_id=${dcTypeId}','_blank')">
                    <div class="small text-muted pr-po-label">PR ที่ยังไม่ได้ทำสัญญา<span>▶</span></div>
                    <div class="font-weight-bold pr-po-value" style="font-size:13px;color:#c17f00;">${fmt(fPr)}</div>
                    <div class="small text-muted">${prCount} รายการ</div>
                </div>
            </div>
            <div class="col d-flex">
                <div class="pr-po-card clickable" style="${cardBase} ${clickable} padding:16px 6px;background:#fdeef0;border-left:4px solid #e0526b;"
                    onclick="window.open('/supplies/bi/reports/Rep_PrPoListV5.php?col=po&year_en=${yearEn}&year_th=${yearTh}&dc_cost_id=${dcCostId}&dc_expense_budget_type_id=${dcTypeId}','_blank')">
                    <div class="small text-muted pr-po-label">จองสัญญา (PO) <span>▶</span></div>
                    <!-- [FIX-CHECKSUM] ใช้ fPrDeducted/deductedCount (= "หัก ณ จองในสัญญาแล้ว" ฝั่ง PR,
                         Result Set 1) แทน fContract/poCount (Result Set 3 แยกต่างหาก) เพราะเป็นยอด/
                         จำนวนรายการเดียวกัน แต่ Result Set 3 มีบางรายการไม่มีเลขที่/ชื่อ PO บันทึกไว้
                         ทำให้นับได้ไม่ครบ และยอดก็ไม่ตรงกับที่หน้า Rep_PrPoListV5.php?col=po แสดงจริง -->
                    <div class="font-weight-bold pr-po-value" style="font-size:13px;color:#c22a45;">${fmt(fPrDeducted)}</div>
                    <div class="small text-muted">${deductedCount} รายการ</div>
                </div>
            </div>
            <div class="col d-flex">
                <div class="pr-po-card" style="${cardBase} padding:16px 6px;background:#f3ecfb;border-left:4px solid #6f42c1;">
                    <div class="small text-muted pr-po-label">เงินจองตรวจรับ</div>
                    <div class="font-weight-bold pr-po-value" style="font-size:13px;color:#6f42c1;">${fmt(fInsp)}</div>
                </div>
            </div>
            <div class="col d-flex">
                <div class="pr-po-card clickable" style="${cardBase} ${clickable} padding:16px 6px;background:#eafaf0;border-left:4px solid #34b566;"
                    onclick="window.open('/supplies/bi/reports/Rep_Sup_ReserveMoney.php?i_reserve=3&i_year=${yearEn}&dc_cost_acc_id=${dcCostId}&dc_cost_id=${dcCostId}&dc_expense_budget_type_id=${dcTypeId}&i_expense=1&bg_expense_id_lv1=0&i_level=1&bg_expense_id=0&d_date_start=${Number(yearEn)-1}-10-01&d_date_end=${yearEn}-09-30','_blank')">
                    <div class="small text-muted pr-po-label">เบิกจ่ายแล้ว <span>▶</span></div>
                    <div class="font-weight-bold pr-po-value" style="font-size:13px;color:#1e8f4c;">${fmt(fPaid)}</div>
                </div>
            </div>
        </div>

        

        <div class="row g-3 text-center align-items-stretch pr-po-row-total">
            <div class="col-12 d-flex">
                <div class="pr-po-card" style="${cardBase} background:linear-gradient(135deg,#e6f8ee,#d4f2e2);border-left:4px solid #2fae64;">
                    <div class="small text-muted pr-po-label">คงเหลือหลังจอง</div>
                    <div class="font-weight-bold pr-po-value" style="font-size:21px;color:#1c7a45;">${fmt(fRemain)}</div>
                </div>
            </div>
        </div>`;
    }

    /* ------------------------------------------------------------------
       Render Bar chart: PR vs PO by bg_expense
    ------------------------------------------------------------------ */
    function renderPrPoBar(items, yearTh, yearEn, dcTypeId, budgetMap) {
        const dom = document.getElementById("chart_prpo_bar");
        if (!dom) return;

        if (!_chartBar) {
            _chartBar = echarts.init(dom);
        } else {
            _chartBar.clear();
        }

        // ตัดชื่อยาวสำหรับ axis label
        const labels = items.map((x) => {
            const s = x.bg_expense || "";
            return s.length > 28 ? s.substring(0, 28) + "…" : s;
        });

        const prData   = items.map((x) => +x.f_pr.toFixed(2));
        const poData   = items.map((x) => +x.f_po.toFixed(2));
        const paidData = items.map((x) => +x.f_paid.toFixed(2));

        const option = {
            backgroundColor: "transparent",
            tooltip: {
                trigger: "axis",
                axisPointer: { type: "shadow" },
                formatter: (params) => {
                const idx = params[0].dataIndex;
                const it = items[idx];
                let html = `<b>${it.bg_expense}</b><br/>`;
                params.forEach(p => {
                    if (p.value > 0) {
                        const count = p.seriesName.includes("PR")
                            ? it.pr_count
                            : p.seriesName.includes("PO")
                            ? it.po_count
                            : it.paid_count;
                        html += `<span style="color:${p.color};">● </span>${p.seriesName}: <b>${fmt(p.value)}</b> (${count} รายการ)<br/>`;
                    }
                });
                const total = params.reduce((s, p) => s + (p.value || 0), 0);
                html += `รวมทั้งหมด: <b>${fmt(total)}</b>`;
                return html;
            },
            },
            legend: {
                data: ["จอง PR (ยังไม่มี PO)", "สัญญา PO", "เบิกจ่าย"],
                top: "2%",
                left: "center",
            },
            toolbox: {
                feature: {
                    saveAsImage: {},
                    magicType: { type: ["stack", "tiled"] },
                    restore: {},
                },
            },
            grid: { left: 10, right: 20, top: 50, bottom: 10, containLabel: true },
            xAxis: {
                type: "category",
                data: labels,
                axisLabel: {
                    interval: 0,
                    rotate: items.length > 5 ? 30 : 0,
                    fontSize: 11,
                },
            },
            yAxis: { type: "value" },
            series: [
                {
                    name: "จอง PR (ยังไม่มี PO)",
                    type: "bar",
                    stack: "total",
                    data: prData,
                    itemStyle: { color: "#f39c12", borderColor: "#c87f0a", borderWidth: 1 },
                    label: {
                        show: true,
                        position: "inside",
                        fontSize: 10,
                        formatter: (p) => (p.value > 0 ? fmt(p.value) : ""),
                    },
                },
                {
                    name: "สัญญา PO",
                    type: "bar",
                    stack: "total",
                    data: poData,
                    itemStyle: { color: "#e74c3c", borderColor: "#c0392b", borderWidth: 1 },
                    label: {
                        show: true,
                        position: "inside",
                        fontSize: 10,
                        formatter: (p) => (p.value > 0 ? fmt(p.value) : ""),
                    },
                },
                {
                    name: "เบิกจ่าย",
                    type: "bar",
                    stack: "total",
                    data: paidData,
                    itemStyle: { color: "#27ae60", borderColor: "#1e8449", borderWidth: 1 },
                    label: {
                        show: true,
                        position: "inside",
                        fontSize: 10,
                        formatter: (p) => (p.value > 0 ? fmt(p.value) : ""),
                    },
                },
            ],
            labelLayout: { hideOverlap: true },
        };

       _chartBar.setOption(option);
_chartBar.off("click");
_chartBar.on("click", function (params) {
    const idx = params.dataIndex;
    const it = items[idx];
    if (!it) return;

    const dcCostId = new URLSearchParams(window.location.search).get("dc_cost_id") || "38";

            // ดึงค่างบประมาณจริงจาก budgetMap (Result Set 2)
            const bg = (budgetMap && budgetMap.get(String(it.bg_expense_id))) || {};
            const fBudget    = bg.f_budget_total  || 0;
            const fReserve   = bg.f_reserve_total || 0;
            const fRemaining = bg.f_remaining     || 0;

            const url =
                DETAIL_URL +
                `?bg_expense_id=${encodeURIComponent(it.bg_expense_id)}` +
                `&dc_expense_budget_type_id=${encodeURIComponent(it.dc_expense_budget_type_id || dcTypeId || "")}` +
                `&col=budget` +
                `&year_th=${encodeURIComponent(yearTh)}&year_en=${encodeURIComponent(yearEn)}` +
                `&dc_cost_id=${encodeURIComponent(dcCostId)}` +   // ← เพิ่ม
                `&f_budget=${encodeURIComponent(fBudget)}` +
                `&f_reserve=${encodeURIComponent(fReserve)}` +
                `&f_remaining=${encodeURIComponent(fRemaining)}` +
                `&bg_expense_label=${encodeURIComponent(it.bg_expense || "")}`;

            window.open(url, "_blank");
        });
    }

    /* ------------------------------------------------------------------
       Render Pie chart: PR vs PO ratio
    ------------------------------------------------------------------ */
    function renderPrPoPie(fPr, fContract) {
        const dom = document.getElementById("chart_prpo_pie");
        if (!dom) return;

        if (!_chartPie) {
            _chartPie = echarts.init(dom);
        } else {
            _chartPie.clear();
        }

        const total = fPr + fContract;
        const pctPr = total > 0 ? ((fPr / total) * 100).toFixed(1) : "0.0";
        const pctPo = total > 0 ? ((fContract / total) * 100).toFixed(1) : "0.0";

        const option = {
            backgroundColor: "transparent",
            tooltip: {
                trigger: "item",
                formatter: (p) =>
                    `<b>${p.name}</b><br/>${fmt(p.value)}<br/>(${p.percent}%)`,
            },
            legend: { orient: "horizontal", bottom: 0, left: "center" },
            series: [
                {
                    type: "pie",
                    radius: ["40%", "70%"],
                    center: ["50%", "45%"],
                    data: [
                        {
                            name: `PR (${pctPr}%)`,
                            value: +fPr.toFixed(2),
                            itemStyle: { color: "#f39c12" },
                        },
                        {
                            name: `PO (${pctPo}%)`,
                            value: +fContract.toFixed(2),
                            itemStyle: { color: "#e74c3c" },
                        },
                    ],
                    label: {
                        show: true,
                        formatter: (p) => `${p.percent}%`,
                        fontSize: 12,
                    },
                    emphasis: {
                        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0,0,0,0.5)" },
                    },
                },
            ],
        };

        _chartPie.setOption(option);
    }

    /* ------------------------------------------------------------------
       Main load function — เรียกใช้ได้จากภายนอก
    ------------------------------------------------------------------ */
    window.loadPrPoSection = function (params = {}) {
        const {
            year_th = document.getElementById("budget_year_filter")?.value || "",
            year_en = year_th ? year_th - 543 : new Date().getFullYear(),
            bg_expense_id = "",
        } = params;

        // ดึง dc_cost_id จาก URL ปัจจุบัน (default 38)
        const dcCostId = new URLSearchParams(window.location.search).get("dc_cost_id") || "38";

        // [FIX3] อ่านแหล่งเงินที่ผู้ใช้เลือกทั้งหมดจาก multiCheckCombo (รองรับเลือกได้หลายรายการ)
        const selectedIds = ($("#multiCheckCombo").val() || []).map(String);

        const reqParams = {
            year_en,
            dc_cost_id: dcCostId,   // ← เพิ่ม
            ...(bg_expense_id ? { bg_expense_id } : {}),
            // [FIX3] ไม่ส่ง dc_expense_budget_type_id ไปกรองที่ฝั่ง server อีกต่อไป
            // (server รองรับกรองได้แค่ค่าเดียว) — ดึงข้อมูลทั้งหมดมาแล้วกรองฝั่ง client
            // แทน เพื่อให้เลือกได้หลายแหล่งเงินพร้อมกันแล้วผลลัพธ์ตรงกับที่เลือกจริงๆ
        };

        fetchPrPoData(reqParams, function (err, data) {
            if (err) {
                console.error("PrPoSection: fetch error", err);
                return;
            }

            const allPrRows       = Array.isArray(data.data)     ? data.data     : [];
            const allPoRows       = Array.isArray(data.contract) ? data.contract : [];
            const allPaidRows     = Array.isArray(data.paid)     ? data.paid     : [];
            const allBudgetDetail = Array.isArray(data.budget_detail) ? data.budget_detail : [];

            // [FIX3] กรองตามแหล่งเงินที่เลือกไว้ทั้งหมด (ถ้าไม่ได้เลือกเลย = แสดงทั้งหมด)
            const matchSelected = (r) =>
                !selectedIds.length || selectedIds.includes(String(r.dc_expense_budget_type_id));

            _prRows = allPrRows.filter(matchSelected);
            _poRows = allPoRows.filter(matchSelected);
            _paidRows = allPaidRows.filter(matchSelected);
            const filteredBudgetDetail = allBudgetDetail.filter(matchSelected);

            _budgetTotal  = data.f_budget_total   || 0;
            _reserveTotal = data.f_reserve_total  || 0;
            _remaining    = data.f_remaining      || 0;

            // [FIX] คำนวณ PR-only total จาก rows ที่กรองแล้ว (has_po == 0)
            _prTotal = _prRows
                .filter((r) => Number(r.has_po) === 0)
                .reduce((s, r) => s + (Number(r.f_amt) || 0), 0);

            // [FIX-CHECKSUM] ใช้ยอด "หัก ณ จองในสัญญาแล้ว" จาก _prRows (has_po > 0) แทนยอดมูลค่า
            // สัญญาจริงจาก _poRows/f_amt_contract เดิม ให้ตรงกับตัวเลข "จองสัญญา (PO)" ที่การ์ดสรุป
            // และหน้า Rep_PrPoListV5.php?col=po แสดง (_prTotal + _contractTotal จึงรวมได้เท่ากับ
            // ยอดจองเงินแล้วของ PR ทั้งหมดพอดี แทนที่จะเป็นคนละยอดกันแบบเดิม)
            _contractTotal = _prRows
                .filter((r) => Number(r.has_po) > 0)
                .reduce((s, r) => s + (Number(r.f_amt) || 0), 0);

            // [FIX2] สร้าง budgetMap จาก Result Set 2 (budget_detail) ที่กรองแล้ว
            const budgetMap = buildBudgetMap(filteredBudgetDetail);

            const aggregated = aggregatePrByExpense(_prRows, _poRows, budgetMap, _paidRows);

            // [FIX3] ส่งข้อมูลที่กรองแล้วไปให้การ์ดสรุปด้วย (แทนข้อมูลดิบทั้งหมด)
            const filteredData = {
                ...data,
                data: _prRows,
                contract: _poRows,
                f_contract_total: _contractTotal,
            };

            const dcTypeIdForLinks = selectedIds.length === 1 ? selectedIds[0] : "";

            renderPrPoSummaryCards(filteredData);
            renderPrPoBar(aggregated, year_th, year_en, dcTypeIdForLinks, budgetMap);
            renderPrPoPie(_prTotal, _contractTotal);
        });
    };

    /* ------------------------------------------------------------------
       Auto-wire: เชื่อมกับ filter ของ dashboard หลัก
       เรียกหลังจาก loadAll() ของ dashboard หลักทำงาน
    ------------------------------------------------------------------ */
    function wireToMainDashboard() {
        const yearSel  = document.getElementById("budget_year_filter");
        const multiSel = document.getElementById("multiCheckCombo");

        function refreshPrPo() {
            const yearTh = yearSel?.value || String(new Date().getFullYear() + 543);
            const yearEn = String(Number(yearTh) - 543);

            // [FIX3] ไม่ต้อง collapse เหลือ id เดียวอีกต่อไป — loadPrPoSection
            // จะอ่านรายการที่เลือกทั้งหมดจาก #multiCheckCombo เองและกรองฝั่ง client
            window.loadPrPoSection({
                year_th: yearTh,
                year_en: yearEn,
            });
        }

        if (yearSel) {
            yearSel.addEventListener("change", refreshPrPo);
        }
        if (multiSel) {
            $(multiSel).on("changed.bs.select", refreshPrPo);
        }

        // โหลดครั้งแรก
        refreshPrPo();
    }

    /* ------------------------------------------------------------------
       DOM Ready
    ------------------------------------------------------------------ */
    document.addEventListener("DOMContentLoaded", function () {
        const wait = setInterval(function () {
            const dvBody = document.getElementById("dvBody");
            if (dvBody || window.DATA_BUDGET) {
                clearInterval(wait);
                wireToMainDashboard();
            }
        }, 500);
    });

    /* ------------------------------------------------------------------
       Resize handler
    ------------------------------------------------------------------ */
    window.addEventListener("resize", function () {
        if (_chartBar) _chartBar.resize();
        if (_chartPie) _chartPie.resize();
    });
})();