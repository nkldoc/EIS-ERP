<?php
// ===== Report_ChartStatus.php (eis_procure) =====
include("../../conf/config.php");
$year_en = isset($_REQUEST["year_en"]) ? intval($_REQUEST["year_en"]) : intval(date('Y'));
$year_th = $year_en + 543;
?>
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="shortcut icon" href="../../images/favicon.ico" type="image/x-icon">
  <title>รายงานสถานะ PR - ระบบติดตามงาน</title>

  <?php include("../lib/loadCss.php"); ?>
  <script src="../../ws_user/js/jquery.min.js"></script>
  <script src="../../js/ext-3.4.0/adapter/jquery/ext-jquery-adapter.js"></script>
  <script src="../../js/ext-3.4.0/ext-all-debug.js"></script>
  <script src="../../js/config.js"></script>
  <script src="../../js/echarts/echarts.js"></script>
  <script src="../bootstrap/bootstrap-4.6.2-dist/js/bootstrap.bundle.min.js"></script>
  <script src="../bootstrap/bootstrap-select-1.13.14/dist/js/bootstrap-select.min.js"></script>

  <link rel="stylesheet" href="../bootstrap/bootstrap-4.6.2-dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="../bootstrap/bootstrap-select-1.13.14/dist/css/bootstrap-select.min.css">
  <link rel="stylesheet" href="../../css/report_css.css" />
  <link rel="stylesheet" href="../css/report-style.css">

  <script type="text/javascript" src="../js/storeRep/storeRep.js?_dc<?= __VPRODUCT_; ?>"></script>

  <style>
    :root {
      --navy:    #1B3A6B;
      --navy-dk: #122B52;
      --navy-lt: #2952A3;
      --accent:  #2563EB;
      --green:   #16A34A;
      --amber:   #D97706;
      --bg:      #F4F6FA;
      --surface: #FFFFFF;
      --border:  #E2E8F0;
      --text:    #1E293B;
      --muted:   #64748B;
      --radius:  8px;
    }

    *, *::before, *::after { box-sizing: border-box; }

    body {
      background: var(--bg);
      font-family: "Sarabun", "Noto Sans Thai", sans-serif;
      font-size: 14px;
      color: var(--text);
      margin: 0;
    }

    /* ── Page header ── */
    .page-header {
      background: var(--navy);
      color: #fff;
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 20px;
      border-bottom: 3px solid var(--accent);
    }
    .page-header-title { font-size: 17px; font-weight: 700; letter-spacing: 0.2px; }
    .page-header-sub   { font-size: 12px; opacity: 0.6; margin-top: 2px; }

    /* ── Filter bar ── */
    .filter-bar {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 12px 18px;
      margin-bottom: 18px;
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
    }
    .filter-bar label {
      font-size: 12px;
      font-weight: 600;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: block;
      margin-bottom: 4px;
    }
    .filter-hint {
      font-size: 12px;
      color: var(--muted);
      margin-left: auto;
      align-self: center;
    }

    /* ── KPI cards ── */
    .kpi-row { display: flex; gap: 12px; margin-bottom: 18px; flex-wrap: wrap; }
    .kpi-card {
      flex: 1; min-width: 150px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 16px 20px;
      position: relative;
    }
    .kpi-card::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 4px;
      border-radius: var(--radius) 0 0 var(--radius);
      background: var(--navy);
    }
    .kpi-card.green::before  { background: var(--green); }
    .kpi-card.amber::before  { background: var(--amber); }
    .kpi-card:hover { filter: brightness(0.95); transform: translateY(-1px); transition: all 0.15s; }
    .kpi-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .kpi-value {
      font-size: 30px;
      font-weight: 800;
      color: var(--text);
      line-height: 1;
    }
    .kpi-card.green .kpi-value { color: var(--green); }
    .kpi-card.amber .kpi-value { color: var(--amber); }

    /* ── Section wrapper ── */
    .section-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      margin-bottom: 18px;
    }
    .section-header {
      padding: 10px 16px;
      border-bottom: 1px solid var(--border);
      font-size: 13px;
      font-weight: 600;
      color: var(--navy);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-header .dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--accent);
      flex-shrink: 0;
    }

    /* ── KPI table ── */
    table.kpi-table { width: 100%; min-width: 820px; border-collapse: collapse; font-size: 13px; }
    table.kpi-table thead th {
      background: var(--navy);
      color: rgba(255,255,255,0.9);
      padding: 9px 11px;
      text-align: center;
      white-space: nowrap;
      font-weight: 600;
      font-size: 12px;
      letter-spacing: 0.3px;
      border-right: 1px solid rgba(255,255,255,0.08);
    }
    table.kpi-table thead th:first-child { text-align: left; min-width: 145px; border-right: 1px solid rgba(255,255,255,0.12); }
    table.kpi-table tbody td {
      padding: 8px 11px;
      text-align: center;
      border-bottom: 1px solid var(--border);
      border-right: 1px solid var(--border);
      color: var(--text);
    }
    table.kpi-table tbody tr:last-child td { border-bottom: none; }
    table.kpi-table tbody td:first-child {
      text-align: left;
      background: #F8FAFC;
      font-weight: 600;
      color: var(--navy);
      border-right: 1px solid var(--border);
    }
    table.kpi-table tbody td.cursor-pointer { cursor: pointer; transition: background 0.12s; }
    table.kpi-table tbody td.cursor-pointer:hover { background: #EFF6FF; color: var(--accent); font-weight: 600; }
    table.kpi-table .table-primary { background: #DBEAFE !important; color: var(--accent); font-weight: 700; }
    table.kpi-table .col-total {
      background: #F1F5F9;
      font-weight: 700;
      color: var(--navy);
      border-left: 2px solid var(--navy);
    }
    table.kpi-table .row-result td {
      background: #FAFAFA;
      font-size: 12px;
      color: var(--muted);
    }
    table.kpi-table .row-result td:first-child { color: var(--navy); }

    /* ── Chart section ── */
    .chart-title-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border-bottom: 1px solid var(--border);
    }
    .chart-title-bar .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); }
    .chart-title-text { font-size: 13px; font-weight: 600; color: var(--navy); }
    #assignChart, #statusChart { width: 100%; height: 340px; }

    /* ── Context menu ── */
    #context-menu {
      display: none;
      position: absolute;
      z-index: 9999;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: 0 8px 24px rgba(0,0,0,0.10);
      min-width: 170px;
      overflow: hidden;
    }
    #context-menu ul { list-style: none; margin: 0; padding: 4px 0; }
    #context-menu ul li a {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 9px 16px;
      color: var(--text);
      font-size: 13px;
      text-decoration: none;
      transition: background 0.12s;
    }
    #context-menu ul li a:hover { background: #EFF6FF; color: var(--accent); }

    /* ── Modal ── */
    .modal-content { border: none; border-radius: var(--radius); overflow: hidden; }
    .modal-header {
      background: var(--navy);
      color: #fff;
      border-bottom: none;
      padding: 14px 20px;
    }
    .modal-header .modal-title { font-size: 15px; font-weight: 700; }
    .modal-header .close { color: rgba(255,255,255,0.7); text-shadow: none; font-size: 20px; }
    .modal-header .close:hover { color: #fff; }
    .modal-body { padding: 0; }
    .modal-footer {
      background: #F8FAFC;
      border-top: 1px solid var(--border);
      padding: 10px 16px;
    }

    /* ══════════════════════════════════════════
       MODAL — Detail PR
    ══════════════════════════════════════════ */
    #detailModal .modal-dialog {
      max-width: 92vw;
      margin: 28px auto;
    }
    #detailModal .modal-content {
      border: none;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.18);
    }
    #detailModal .modal-header {
      background: #1B3A6B;
      color: #fff;
      padding: 13px 20px;
      border: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    #detailModal .modal-title {
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.2px;
    }
    #detailModal .close {
      color: rgba(255,255,255,0.65);
      text-shadow: none;
      font-size: 22px;
      line-height: 1;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      margin: 0;
    }
    #detailModal .close:hover { color: #fff; }
    #detailModal .modal-body  { padding: 0; background: #fff; }
    #detailModal .modal-footer {
      background: #F8FAFC;
      border-top: 1px solid #E2E8F0;
      padding: 10px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* info bar */
    .modal-info-bar {
      padding: 9px 18px;
      background: #F8FAFC;
      border-bottom: 1px solid #E2E8F0;
      font-size: 13px;
      color: #64748B;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .modal-info-bar strong { color: #1B3A6B; font-weight: 700; font-size: 14px; }

    /* total footer bar */
    .modal-total-bar {
      font-size: 13px;
      color: #64748B;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .modal-total-bar strong { color: #1B3A6B; font-weight: 700; font-size: 15px; }

    /* scrollable area — vertical only */
    .modal-table-wrap {
      overflow-x: hidden;
      overflow-y: auto;
      max-height: calc(100vh - 220px);
    }

    /* ── Detail table ── */
    .table-detail {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      table-layout: fixed;
    }

    /* column widths — ทั้งหมดพอดีหน้าจอ ไม่ scroll ข้าง */
    .table-detail colgroup col:nth-child(1) { width: 52px;  }  /* # */
    .table-detail colgroup col:nth-child(2) { width: 14%;   }  /* เลขที่ PR */
    .table-detail colgroup col:nth-child(3) { width: 28%;   }  /* ชื่อรายการ */
    .table-detail colgroup col:nth-child(4) { width: 9%;    }  /* รหัสงบ */
    .table-detail colgroup col:nth-child(5) { width: 14%;   }  /* หมวด */
    .table-detail colgroup col:nth-child(6) { width: 13%;   }  /* ส่วนงาน */
    .table-detail colgroup col:nth-child(7) { width: 10%;   }  /* ผู้รับผิดชอบ */
    .table-detail colgroup col:nth-child(8) { width: 9%;    }  /* วันที่ */
    .table-detail colgroup col:nth-child(9) { width: 10%;   }  /* จำนวนเงิน */

    .table-detail thead th {
      position: sticky;
      top: 0;
      z-index: 2;
      background: #243D73;
      color: rgba(255,255,255,0.92);
      font-size: 12px;
      font-weight: 600;
      padding: 11px 12px;
      text-align: center;
      border-right: 1px solid rgba(255,255,255,0.08);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .table-detail thead th:last-child { border-right: none; text-align: right; padding-right: 16px; }
    .table-detail thead th.th-left   { text-align: left; }

    .table-detail tbody tr { background: #fff; transition: background 0.08s; }
    .table-detail tbody tr:nth-child(even) { background: #FAFBFD; }
    .table-detail tbody tr:hover { background: #EEF5FF !important; }

    .table-detail tbody td {
      padding: 10px 12px;
      border-bottom: 1px solid #EDF0F7;
      vertical-align: middle;
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #1E293B;
      font-size: 13px;
    }
    .table-detail tbody tr:last-child td { border-bottom: none; }

    /* cell variants */
    .td-no    { color: #94A3B8; font-size: 12px; white-space: nowrap; overflow: visible; text-overflow: clip; min-width: 52px; }
    .td-left  { text-align: left !important; white-space: normal; line-height: 1.45; }
    .td-pr    { font-weight: 600; font-size: 12.5px; color: #1B3A6B; white-space: nowrap; }
    .td-code  { font-size: 12px; color: #475569; font-variant-numeric: tabular-nums; }
    .td-muted { font-size: 12.5px; color: #374151; }
    .td-date  { font-size: 12px; color: #64748B; font-variant-numeric: tabular-nums; }
    .td-amt   {
      font-weight: 700;
      font-size: 13px;
      color: #1B3A6B;
      text-align: right !important;
      padding-right: 16px !important;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    /* tfoot */
    .table-detail tfoot td {
      background: #F1F5F9;
      border-top: 2px solid #CBD5E1;
      padding: 10px 12px;
      font-size: 13px;
      color: #475569;
    }
    .table-detail tfoot .td-amt { color: #1B3A6B; font-size: 14px; }

    /* loader inside modal */
    #modalLoader {
      padding: 48px;
      text-align: center;
      color: #94A3B8;
      font-size: 13px;
    }
    #modalLoader .spinner-ring { margin: 0 auto 12px; }

    /* close btn */
    .btn-modal-close {
      background: #fff;
      border: 1px solid #CBD5E1;
      color: #374151;
      padding: 7px 20px;
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;
      font-family: inherit;
    }
    .btn-modal-close:hover { background: #F1F5F9; }

    /* ── Page Loader ── */
    #pageLoader {
      display: none;
      position: fixed; inset: 0;
      background: rgba(255,255,255,0.8);
      backdrop-filter: blur(2px);
      z-index: 9990;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 12px;
    }
    .spinner-ring {
      width: 40px; height: 40px;
      border: 3px solid var(--border);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }
    #pageLoader p { font-size: 13px; color: var(--muted); margin: 0; }
    @keyframes spin { to { transform: rotate(360deg); } }

    #modalLoader { padding: 40px; text-align: center; color: var(--muted); font-size: 13px; }
    #modalLoader .spinner-ring { margin: 0 auto 10px; }

    /* ── btn ── */
    .btn-close-modal {
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 7px 18px;
      border-radius: var(--radius);
      font-size: 13px;
      cursor: pointer;
      transition: background 0.12s;
    }
    .btn-close-modal:hover { background: #F1F5F9; }
  </style>
</head>
<body>

<div id="pageLoader">
  <div class="spinner-ring"></div>
  <p>กำลังโหลดข้อมูล...</p>
</div>

<div id="context-menu">
  <ul>
    <li><a href="#" id="menu-view-detail">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      ดูรายละเอียด
    </a></li>
  </ul>
</div>

<div class="container-fluid px-3 pt-3 pb-5">

  <!-- Header -->
  <div class="page-header">
    <div>
      <div class="page-header-title">รายงานสถานะการดำเนินงาน PR</div>
      <div class="page-header-sub">ติดตามงานเข้าใหม่และการจ่ายงานรายเดือน</div>
    </div>
    <div>
      <label style="color:rgba(255,255,255,0.6);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:4px;">ปีงบประมาณ</label>
      <select id="budget_year_filter" class="selectpicker" data-style="btn-light btn-sm" data-width="130px"></select>
    </div>
  </div>

  <!-- Filters -->
  <div class="filter-bar">
    <div>
      <label>ส่วนงาน</label>
      <select id="filter_staff" class="selectpicker" multiple data-live-search="true" data-actions-box="true" data-width="300px" title="เลือกทั้งหมด"></select>
    </div>
    <div>
      <label>ประเภทงาน</label>
      <select id="filter_method" class="selectpicker" multiple data-live-search="true" data-actions-box="true" data-width="260px" title="เลือกทั้งหมด"></select>
    </div>
    <div>
      <label>ผู้รับผิดชอบ</label>
      <select id="filter_emp" class="selectpicker" multiple data-live-search="true" data-actions-box="true" data-width="260px" title="เลือกทั้งหมด"></select>
    </div>
    <div class="filter-hint">คลิกตัวเลขในตารางเพื่อดูกราฟ &nbsp;·&nbsp; คลิกขวาเพื่อดูรายละเอียด</div>
  </div>

  <!-- KPI -->
  <div class="kpi-row">
    <div class="kpi-card" style="cursor:pointer;" onclick="window.openKpi('all')" title="คลิกเพื่อดูรายการทั้งหมด">
      <div class="kpi-label">รายการทั้งหมด</div>
      <div class="kpi-value" id="sum_total_all">—</div>
    </div>
    <div class="kpi-card green" style="cursor:pointer;" onclick="window.openKpi('assigned')" title="คลิกเพื่อดูรายการที่จ่ายงานแล้ว">
      <div class="kpi-label">จ่ายงานแล้ว</div>
      <div class="kpi-value" id="sum_assigned_all">—</div>
    </div>
    <div class="kpi-card amber" style="cursor:pointer;" onclick="window.openKpi('pending')" title="คลิกเพื่อดูรายการที่รอดำเนินการ">
      <div class="kpi-label">รอดำเนินการ</div>
      <div class="kpi-value" id="sum_pending_all">—</div>
    </div>
  </div>

  <!-- Monthly table -->
  <div class="section-card">
    <div class="section-header">
      <span class="dot"></span>
      สรุปรายเดือน &nbsp;<span style="font-weight:400;color:var(--muted);">(ปีงบประมาณ ต.ค. – ก.ย.)</span>
    </div>
    <div style="overflow-x:auto;">
      <table class="kpi-table">
        <thead>
          <tr>
            <th>รายการ</th>
            <th>ต.ค.</th><th>พ.ย.</th><th>ธ.ค.</th>
            <th>ม.ค.</th><th>ก.พ.</th><th>มี.ค.</th>
            <th>เม.ย.</th><th>พ.ค.</th><th>มิ.ย.</th>
            <th>ก.ค.</th><th>ส.ค.</th><th>ก.ย.</th>
            <th class="col-total">รวม</th>
          </tr>
        </thead>
        <tbody id="kpiTableBody">
          <tr><td colspan="14" style="text-align:center;padding:24px;color:var(--muted);">กำลังโหลด...</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Charts -->
  <div class="section-card">
    <div class="chart-title-bar">
      <span class="dot"></span>
      <span class="chart-title-text" id="chartTitle">สรุปผลการดำเนินงาน</span>
    </div>
    <div class="row" style="margin:0;">
      <div class="col-lg-6" style="padding:0;border-right:1px solid var(--border);">
        <div id="assignChart"></div>
      </div>
      <div class="col-lg-6" style="padding:0;">
        <div id="statusChart"></div>
      </div>
    </div>
  </div>

</div>

<!-- Modal -->
<div class="modal fade" id="detailModal" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">

      <div class="modal-header">
        <span class="modal-title">รายละเอียด PR</span>
        <button type="button" class="close" data-dismiss="modal">&times;</button>
      </div>

      <div class="modal-body">
        <!-- Loader -->
        <div id="modalLoader">
          <div class="spinner-ring"></div>
          <p>กำลังโหลด...</p>
        </div>

        <!-- Table container -->
        <div id="modalTableContainer" style="display:none;">
          <!-- Info bar -->
          <div class="modal-info-bar">
            <span>พบ <strong id="modalRowCount">0</strong> รายการ</span>
          </div>

          <!-- Table scroll area — vertical only -->
          <div class="modal-table-wrap">
            <table class="table-detail">
              <colgroup>
                <col style="width:52px"/>
                <col/><col/><col/><col/><col/><col/><col/><col/>
              </colgroup>
              <thead>
                <tr>
                  <th>#</th>
                  <th>เลขที่ PR</th>
                  <th class="th-left">ชื่อรายการ</th>
                  <th>รหัสงบ</th>
                  <th>หมวดค่าใช้จ่าย</th>
                  <th>ส่วนงาน</th>
                  <th>ผู้รับผิดชอบ</th>
                  <th>วันจ่ายงาน</th>
                  <th>จำนวนเงิน</th>
                </tr>
              </thead>
              <tbody id="detailTableBody"></tbody>
              <tfoot id="detailTableFoot" style="display:none;">
                <tr>
                  <td colspan="8" style="text-align:right;font-weight:600;">รวมทั้งสิ้น</td>
                  <td class="td-amt" id="modalTotalAmt"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <div class="modal-total-bar" id="modalTotalBar" style="display:none;">
          ยอดรวม <strong id="modalTotalAmtFooter">0</strong> บาท
        </div>
        <button class="btn-modal-close" data-dismiss="modal">ปิด</button>
      </div>

    </div>
  </div>
</div>

<script type="text/javascript" src="../js/Report_ChartStatus.js?_dc<?= __VPRODUCT_; ?>"></script>
</body>
</html>