<?php
// Key_Performance_Indicator.php
// ===== KPI Dashboard — Clean Minimal =====
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="shortcut icon" href="../../images/favicon.ico" type="image/x-icon">
    <title>KPI Dashboard - ฝ่ายพัสดุ</title>

    <?php include("../lib/loadJs.php"); ?>
    <?php include("../lib/loadCss.php"); ?>

    <script src="../../ws_user/js/jquery.min.js"></script>
    <script src="../../js/echarts/echarts.js"></script>
    <script src="../bootstrap/bootstrap-4.6.2-dist/js/bootstrap.bundle.min.js"></script>
    <script src="../bootstrap/bootstrap-select-1.13.14/dist/js/bootstrap-select.min.js"></script>

    <link rel="stylesheet" href="../bootstrap/bootstrap-4.6.2-dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="../bootstrap/bootstrap-select-1.13.14/dist/css/bootstrap-select.min.css">
    <link rel="stylesheet" href="../../css/report_css.css">
    <link rel="stylesheet" href="../css/report-style.css">
    <link rel="stylesheet" href="../css/report-style-biType.css">

    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap" rel="stylesheet">

    <style>
        :root {
            --blue:   #2563eb;
            --pass:   #16a34a;
            --fail:   #dc2626;
            --border: #e5e7eb;
            --text1:  #111827;
            --text2:  #6b7280;
            --text3:  #9ca3af;
            --bg:     #f9fafb;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'IBM Plex Sans Thai', sans-serif;
            background: linear-gradient(135deg, #edf2fb 0%, #f8fafc 45%, #ffffff 100%);
            color: var(--text1);
            font-size: 14px;
            min-height: 100vh;
        }

        .kpi-main {
            backdrop-filter: blur(2px);
            background: rgba(255,255,255,0.72);
            border: 1px solid rgba(226,232,240,0.8);
            border-radius: 14px;
            box-shadow: 0 8px 28px rgba(15, 23, 42, 0.08);
        }

        /* ===== HEADER ===== */
        .kpi-header {
            background: #fff;
            border-bottom: 1px solid var(--border);
            padding: 16px 28px;
        }
        .header-sub {
            font-size: 0.7rem;
            color: var(--text2);
            letter-spacing: 0.06em;
            text-transform: uppercase;
            margin-bottom: 2px;
        }
        .header-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--text1);
        }

        /* ===== SUMMARY CARDS ===== */
        .summary-bar {
            background: #fff;
            border-bottom: 1px solid var(--border);
            padding: 0 28px;
        }
        .summary-cards {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
        }
        .scard {
            padding: 14px 0 14px 20px;
            border-right: 1px solid var(--border);
        }
        .scard:first-child { padding-left: 0; }
        .scard:last-child { border-right: none; }
        .scard-label {
            font-size: 0.68rem;
            color: var(--text2);
            letter-spacing: 0.06em;
            text-transform: uppercase;
            font-weight: 500;
            margin-bottom: 4px;
        }
        .scard-value {
            font-size: 1.6rem;
            font-weight: 700;
            color: var(--text1);
            font-family: 'IBM Plex Mono', monospace;
            line-height: 1;
        }
        .scard-value.accent { color: var(--blue); }
        .scard-value.pass   { color: var(--pass); }
        .scard-value.fail   { color: var(--fail); }
        .scard-sub {
            font-size: 0.7rem;
            color: var(--text3);
            margin-top: 3px;
        }
        .scard.clickable {
            cursor: pointer;
            transition: background 0.15s;
        }
        .scard.clickable:hover { background: #f3f4f6; }

        /* ===== FILTER BAR ===== */
        .filter-bar {
            background: #fff;
            border-bottom: 1px solid var(--border);
            padding: 12px 28px;
            display: flex;
            align-items: flex-end;
            flex-wrap: wrap;
            gap: 12px;
        }
        .filter-group { display: flex; flex-direction: column; gap: 4px; }
        .filter-group.grow { flex: 1; min-width: 150px; }
        .filter-group.sm { width: 90px; flex-shrink: 0; }
        .filter-group.md { width: 160px; flex-shrink: 0; }
        .filter-label {
            font-size: 0.68rem;
            font-weight: 600;
            color: var(--text2);
            letter-spacing: 0.05em;
            text-transform: uppercase;
        }
        .filter-bar .form-control,
        .filter-bar .bootstrap-select .btn {
            height: 34px !important;
            border: 1px solid var(--border) !important;
            border-radius: 5px !important;
            font-family: 'IBM Plex Sans Thai', sans-serif !important;
            font-size: 0.82rem !important;
            color: var(--text1) !important;
            background: #fff !important;
            box-shadow: none !important;
            padding: 0 10px !important;
        }
        /* ลบ border/outline ที่ bootstrap-select สร้างซ้ำ */
        .filter-bar .bootstrap-select {
            width: 100% !important;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
        }
        .filter-bar .bootstrap-select.show > .btn,
        .filter-bar .bootstrap-select .btn:focus,
        .filter-bar .bootstrap-select .btn:active {
            outline: none !important;
            box-shadow: none !important;
            border-color: var(--blue) !important;
        }
        .filter-bar .form-control:focus {
            border-color: var(--blue) !important;
            box-shadow: 0 0 0 2px rgba(37,99,235,0.1) !important;
            outline: none !important;
        }

        /* Toggle */
        .kpi-toggle { display: flex; align-items: center; gap: 8px; height: 34px; }
        .toggle-switch { position: relative; width: 38px; height: 20px; flex-shrink: 0; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .toggle-track {
            position: absolute; inset: 0;
            background: #d1d5db;
            border-radius: 20px;
            cursor: pointer;
            transition: background 0.2s;
        }
        .toggle-track::after {
            content: '';
            position: absolute;
            left: 2px; top: 2px;
            width: 16px; height: 16px;
            border-radius: 50%;
            background: #fff;
            transition: transform 0.2s;
            box-shadow: 0 1px 2px rgba(0,0,0,0.15);
        }
        .toggle-switch input:checked + .toggle-track { background: var(--blue); }
        .toggle-switch input:checked + .toggle-track::after { transform: translateX(18px); }
        .kpi-toggle-text { font-size: 0.8rem; color: var(--text2); }

        .filter-divider { width: 1px; height: 34px; background: var(--border); align-self: flex-end; flex-shrink: 0; }

        .filter-actions { display: flex; gap: 8px; align-self: flex-end; }
        .btn-search {
            height: 34px; padding: 0 18px;
            background: var(--blue); color: #fff;
            border: none; border-radius: 5px;
            font-family: 'IBM Plex Sans Thai', sans-serif;
            font-size: 0.82rem; font-weight: 600; cursor: pointer;
            display: flex; align-items: center; gap: 5px;
            transition: opacity 0.15s;
        }
        .btn-search:hover { opacity: 0.88; }
        .btn-reset {
            height: 34px; padding: 0 14px;
            background: transparent; color: var(--text2);
            border: 1px solid var(--border); border-radius: 5px;
            font-family: 'IBM Plex Sans Thai', sans-serif;
            font-size: 0.82rem; cursor: pointer;
            transition: color 0.15s, border-color 0.15s;
        }
        .btn-reset:hover { color: var(--text1); border-color: #9ca3af; }

        /* ===== MAIN ===== */
        .kpi-main { padding: 20px 28px 40px; }

        .section-hd { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
        .section-title { font-size: 0.82rem; font-weight: 700; color: var(--text1); }
        .section-badge {
            margin-left: auto; font-size: 0.65rem; font-weight: 500;
            color: var(--text2); background: #f3f4f6;
            border: 1px solid var(--border); border-radius: 20px; padding: 2px 10px;
        }

        /* ===== CHART ===== */
        .chart-card {
            background: #fff; border: 1px solid var(--border);
            border-radius: 8px; margin-bottom: 20px;
        }
        .chart-inner { height: 380px; padding: 10px 12px; }

        /* ===== TABLE ===== */
        .table-card {
            background: #fff; border: 1px solid var(--border);
            border-radius: 8px; overflow: hidden; margin-bottom: 20px;
        }
        .table-kpi { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
        .table-kpi thead th {
            background: #f3f4f6; color: var(--text2);
            text-align: center; padding: 9px 6px;
            font-weight: 600; font-size: 0.72rem;
            letter-spacing: 0.04em; text-transform: uppercase;
            border-bottom: 1px solid var(--border);
            border-right: 1px solid var(--border); white-space: nowrap;
        }
        .table-kpi thead th:first-child { text-align: left; padding-left: 14px; min-width: 210px; }
        .table-kpi thead th:last-child { border-right: none; }
        .table-kpi tbody td {
            text-align: center; padding: 8px 6px;
            border-bottom: 1px solid #eef2f6;
            border-right: 1px solid #eef2f6;
            color: var(--text1);
            transition: background 0.2s, color 0.2s;
        }
        .table-kpi tbody tr:nth-child(odd) { background: #fcfdff; }
        .table-kpi tbody tr:hover { background: #f1f5ff; }
        .table-kpi tbody td.status-pass:hover,
        .table-kpi tbody td.status-fail:hover {
            transform: translateY(-1px);
            filter: brightness(1.07);
        }
        .table-kpi tbody td:first-child {
            text-align: left; padding-left: 14px;
            color: var(--text2); font-weight: 500; background: #fafafa;
        }
        .table-kpi tbody td:last-child { border-right: none; }

        .tr-total td  { background: #fff; }
        .tr-ontime td { background: #f0fdf4; }
        .tr-pct td    { font-weight: 700; background: #eff6ff; }
        .tr-pct td:first-child { color: var(--blue); }
        .tr-sep td    { background: var(--bg); height: 4px; padding: 0; border: none; }
        .tr-grand td  { font-weight: 700; background: #fffbeb; }
        .tr-grand td:first-child { color: #92400e; }
        .tr-grand-pct td { font-weight: 800; font-size: 0.87rem; background: #fef3c7; }
        .tr-grand-pct td:first-child { color: #92400e; }

        .col-total { background: #e0e7ff !important; font-weight: 800 !important; }
        .status-pass { color: var(--pass) !important; font-weight: 700; cursor: pointer; }
        .status-fail { color: var(--fail) !important; font-weight: 700; cursor: pointer; }
        td.status-pass:hover { background: #dcfce7 !important; }
        td.status-fail:hover { background: #fee2e2 !important; }

        /* ===== MODAL ===== */
        .modal-dialog { max-width: 98% !important; margin: 1.5rem auto; }
        .modal-content { border: none; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 35px rgba(0,0,0,0.15); }
        .modal-header { background: linear-gradient(90deg, #ffffff, #f3f4f6); border-bottom: 1px solid var(--border); padding: 14px 20px; }
        .modal-title { font-size: 1rem; font-weight: 700; color: #1f2937; letter-spacing: 0.02em; }
        .modal-body { padding: 16px; max-height: calc(100vh - 180px); overflow: hidden; }
        .modal-body .table-responsive { max-height: calc(100vh - 250px); overflow: auto; }

        /* ป้องกันเลขถูกตัดบรรทัด, หัวตารางค้างด้านบน */
        #detailTable { font-size: 0.78rem; min-width: 1100px; }
        #detailTable td:nth-child(1), #detailTable th:nth-child(1) { width: 50px !important; }
        #detailTable td:nth-child(3), #detailTable th:nth-child(3) { width: 280px !important; white-space: normal; }

        /* ซ่อน scrollbar ด้วย CSS (ถ้าไม่อยากให้เห็น) */
        .modal-body .table-responsive::-webkit-scrollbar { width: 0px; height: 0px; }
        .modal-body .table-responsive { -ms-overflow-style: none; scrollbar-width: none; }
        #detailTable thead th,
        #detailTable tbody td {
            white-space: nowrap;
            word-break: normal;
        }
        #detailTable thead th {
            position: sticky;
            top: 0;
            z-index: 5;
            background: #f8fafc;
            border-bottom: 2px solid var(--border) !important;
        }
        #detailTable th:first-child,
        #detailTable td:first-child {
            width: 58px;
            text-align: center;
        }
        #detailTable th:nth-child(12),
        #detailTable td:nth-child(12) {
            width: 100px;
        }
        #detailTable tr:hover { background: rgba(37,99,235,0.05); }

        /* filter/summary bar ติดบน ไม่เลื่อนออก */
        .kpi-header,
        .summary-bar,
        .filter-bar {
            position: sticky;
            top: 0;
            z-index: 998;
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(10px);
        }
        #detailTable thead th {
            background: #f3f4f6; color: var(--text2);
            font-weight: 700; font-size: 0.7rem;
            border-bottom: 2px solid var(--border) !important;
            white-space: nowrap; text-transform: uppercase; letter-spacing: 0.04em;
        }
        .modal-footer { border-top: 1px solid var(--border); padding: 10px 16px; }

        /* ===== LOADER ===== */
        #pageLoader {
            position: fixed; inset: 0;
            background: rgba(249,250,251,0.8);
            backdrop-filter: blur(3px); z-index: 9999;
            display: flex; flex-direction: column;
            justify-content: center; align-items: center; gap: 12px;
        }
        .loader-ring {
            width: 32px; height: 32px;
            border: 2px solid var(--border);
            border-top-color: var(--blue);
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loader-text { color: var(--text2); font-size: 0.8rem; }

        #empSelectedLabel {
            font-size: 0.68rem; color: var(--blue);
            font-weight: 600; min-height: 14px;
        }

        @media (max-width: 900px) {
            .kpi-header, .filter-bar, .kpi-main, .summary-bar { padding-left: 16px; padding-right: 16px; }
            .summary-cards { grid-template-columns: repeat(2, 1fr); }
            .filter-bar { flex-direction: column; align-items: stretch; }
            .filter-group.grow, .filter-group.sm, .filter-group.md { width: 100%; }
        }
    </style>
</head>
<body>

<!-- ===== HEADER ===== -->
<div class="kpi-header">
    <div class="header-sub">ฝ่ายพัสดุ · ฝ่ายจัดซื้อจัดจ้าง</div>
    <div class="header-title">รายงานผลตัวชี้วัดคุณภาพ (KPI)</div>
</div>

<!-- ===== SUMMARY CARDS ===== -->
<div class="summary-bar">
    <div class="summary-cards">
        <div class="scard clickable" onclick="openSummaryDetail('all')" title="คลิกดูรายละเอียดทั้งหมด">
            <div class="scard-label">ทั้งหมด</div>
            <div class="scard-value accent" id="sc-total">—</div>
            <div class="scard-sub">รายการในปีงบประมาณ</div>
        </div>
        <div class="scard clickable" onclick="openSummaryDetail('pass')" title="คลิกดูรายการที่ผ่านเกณฑ์">
            <div class="scard-label">ผ่านเกณฑ์</div>
            <div class="scard-value pass" id="sc-pass">—</div>
            <div class="scard-sub">รายการ</div>
        </div>
        <div class="scard clickable" onclick="openSummaryDetail('fail')" title="คลิกดูรายการที่ไม่ผ่านเกณฑ์">
            <div class="scard-label">ไม่ผ่านเกณฑ์</div>
            <div class="scard-value fail" id="sc-fail">—</div>
            <div class="scard-sub">รายการ</div>
        </div>
        <div class="scard">
            <div class="scard-label">% ผ่านรวม</div>
            <div class="scard-value" id="sc-pct">—</div>
            <div class="scard-sub" id="sc-target-note">เป้าหมาย 80%</div>
        </div>
    </div>
</div>

<!-- ===== FILTER BAR ===== -->
<div class="filter-bar">
    <div class="filter-group sm">
        <div class="filter-label">ปีงบประมาณ</div>
        <select id="filter_year" class="form-control selectpicker" data-width="100%"
            title="" data-show-subtext="false">
            <?php
            $curYear = date("Y") + 543;
            for ($y = $curYear + 1; $y >= $curYear - 5; $y--) {
                $sel = ($y == $curYear) ? "selected" : "";
                echo "<option value='" . ($y - 543) . "' $sel>$y</option>";
            }
            ?>
        </select>
    </div>

    <div class="filter-group grow">
        <div class="filter-label">บุคลากร (ผู้รับผิดชอบ)</div>
        <select id="filter_emp" class="form-control selectpicker"
            multiple data-live-search="true" data-actions-box="true"
            data-selected-text-format="values" title="ทั้งหมด">
            <option value="0">ทั้งหมด</option>
        </select>
    </div>

    <div class="filter-group md">
        <div class="filter-label">วิธีดำเนินงาน</div>
        <select id="filter_method" class="form-control selectpicker"
            multiple data-live-search="true" data-actions-box="true"
            data-width="100%" title="ทั้งหมด"></select>
    </div>

    <div class="filter-group md">
        <div class="filter-label">ประเภทสัญญา</div>
        <select id="filter_contract_type" class="form-control selectpicker"
            multiple title="ทั้งหมด">
            <option value="1">สัญญา</option>
            <option value="2">ใบสั่ง</option>
            <option value="3">จะซื้อจะขาย</option>
        </select>
    </div>

    <div class="filter-group sm">
        <div class="filter-label">เป้าหมาย (%)</div>
        <input type="number" id="kpiTargetInput" class="form-control text-center"
            value="80" style="font-weight:700; color:var(--blue);">
    </div>

    <div class="filter-divider"></div>

    <div class="filter-group">
        <div class="filter-label">เกณฑ์การนับวัน</div>
        <div class="kpi-toggle">
            <label class="toggle-switch">
                <input type="checkbox" id="useRepKPI2" checked>
                <span class="toggle-track"></span>
            </label>
            <span class="kpi-toggle-text" id="kpiCriteriaLabel">วันทำการ (เข้มงวด)</span>
        </div>
    </div>

    <div class="filter-actions">
        <button class="btn-reset" id="btnReset">รีเซ็ต</button>
    </div>
</div>

<!-- ===== MAIN ===== -->
<div class="kpi-main">

    <!-- ตารางอยู่บน -->
    <div class="section-hd">
        <div class="section-title">ผลการดำเนินงานรายเดือน</div>
        <div class="section-badge" id="badge-year">—</div>
    </div>
    <div class="table-card">
        <div class="table-responsive">
            <table class="table-kpi">
                <thead>
                    <tr>
                        <th>รายการ</th>
                        <th>ต.ค.</th><th>พ.ย.</th><th>ธ.ค.</th>
                        <th>ม.ค.</th><th>ก.พ.</th><th>มี.ค.</th>
                        <th>เม.ย.</th><th>พ.ค.</th><th>มิ.ย.</th>
                        <th>ก.ค.</th><th>ส.ค.</th><th>ก.ย.</th>
                        <th>รวม</th>
                    </tr>
                </thead>
                <tbody id="kpiTableBody">
                    <tr><td colspan="14" class="text-center py-4" style="color:var(--text3);">กำลังโหลด...</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- กราฟอยู่ล่าง -->
    <div class="section-hd">
        <div class="section-title">กราฟสรุปผล % ผ่านเกณฑ์ รายเดือน</div>
    </div>
    <div class="chart-card">
        <div id="kpiChart" class="chart-inner"></div>
    </div>

</div>

<!-- ===== MODAL ===== -->
<div class="modal fade" id="modalDetail" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-xl" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalDetailLabel">รายละเอียด</h5>
                <button type="button" class="close" data-dismiss="modal" style="color:var(--text2);"><span>&times;</span></button>
            </div>
            <div class="modal-body">
                <div class="table-responsive">
                    <table class="table table-bordered table-sm table-hover" id="detailTable">
                        <thead>
                            <tr>
                                <th>#</th><th>เลขที่</th><th>ชื่อโครงการ</th>
                                <th>ผู้รับผิดชอบ</th><th>วันที่สร้าง</th><th>วันประกาศ EGP</th>
                                <th>วันทำสัญญา</th><th>วิธีดำเนินงาน</th><th>ประเภทสัญญา</th>
                                <th>จำนวนวัน</th><th>วงเงิน</th><th>สถานะ</th>
                            </tr>
                        </thead>
                        <tbody id="detailTableBody"></tbody>
                    </table>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-reset" data-dismiss="modal" style="height:34px; padding:0 18px;">ปิด</button>
            </div>
        </div>
    </div>
</div>

<!-- ===== LOADER ===== -->
<div id="pageLoader" style="display:none;">
    <div class="loader-ring"></div>
    <div class="loader-text">กำลังโหลดข้อมูล...</div>
</div>

<script>
function updateSummaryCards(data) {
    let total = 0, pass = 0;
    data.forEach(d => {
        total += parseInt(d.cnt_total) || 0;
        pass  += parseInt(d.cnt_ontime) || 0;
    });
    const fail = total - pass;
    const pct  = total > 0 ? ((pass / total) * 100).toFixed(1) : '—';
    const target = parseFloat(document.getElementById('kpiTargetInput').value) || 80;

    document.getElementById('sc-total').textContent = total > 0 ? total.toLocaleString() : '—';
    document.getElementById('sc-pass').textContent  = pass  > 0 ? pass.toLocaleString()  : '—';
    document.getElementById('sc-fail').textContent  = fail  > 0 ? fail.toLocaleString()  : '—';

    const scPct = document.getElementById('sc-pct');
    scPct.textContent = pct !== '—' ? pct + '%' : '—';
    if (pct !== '—') {
        scPct.style.color = parseFloat(pct) >= target ? 'var(--pass)' : 'var(--fail)';
    }
    document.getElementById('sc-target-note').textContent = `เป้าหมาย ${target}%`;
    const yr = document.getElementById('filter_year').value;
    document.getElementById('badge-year').textContent = `ปีงบ ${parseInt(yr)+543}`;
}

document.getElementById('useRepKPI2').addEventListener('change', function() {
    document.getElementById('kpiCriteriaLabel').textContent =
        this.checked ? 'วันทำการ (เข้มงวด)' : 'วันปฏิทิน (ผ่อนปรน)';
});
</script>

<script src="../js/Key_Performance_Indicator.js?v=<?= time(); ?>"></script>

<script>
(function() {
    const origRender = window.renderTable;
    if (typeof origRender === 'function') {
        window.renderTable = function(data) {
            origRender(data);
            updateSummaryCards(data || []);
        };
    }
})();
</script>

</body>
</html>