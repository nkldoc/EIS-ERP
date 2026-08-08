<?php
// ===== Yearly PR Performance Summary — EIS_procure edition =====
?>
<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="shortcut icon" href="../../images/favicon.ico" type="image/x-icon">
    <link rel="icon"          href="../../images/favicon.ico" type="image/x-icon">
    <title>สรุปประสิทธิภาพ PR รายปี — EIS Procure</title>

    <?php include("../lib/loadJs.php"); ?>
    <?php include("../lib/loadCss.php"); ?>

    <script src="../../ws_user/js/jquery.min.js"></script>
    <script src="../../js/echarts/echarts.js"></script>
    <script src="../bootstrap/bootstrap-4.6.2-dist/js/bootstrap.bundle.min.js"></script>
    <script src="../bootstrap/bootstrap-select-1.13.14/dist/js/bootstrap-select.min.js"></script>
    <script src="../../js/echarts/macarons.js"></script>
    <script src="../lib/xlsx.full.min.js"></script>

    <title><?php echo COMPANY_NAME; ?></title>

    <link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
    <link rel="stylesheet" type="text/css" href="../css/report-style.css">
    <link rel="stylesheet" type="text/css" href="../bootstrap/bootstrap-4.6.2-dist/css/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="../bootstrap/bootstrap-select-1.13.14/dist/css/bootstrap-select.min.css">
    <link rel="stylesheet" type="text/css" href="../css/report-style-biType.css">

    <style>
        /* ── Base ── */
        body { background:#f4f6f9; font-family:'Sarabun',sans-serif; color:#2d3748; }

        /* ── Card ── */
        .card-custom {
            background:#fff;
            border:none;
            border-radius:10px;
            box-shadow:0 1px 4px rgba(0,0,0,0.08);
            margin-bottom:20px;
        }
        .card-custom .card-body { padding:20px 22px; }

        /* ── Section header ── */
        .chart-header {
            font-size:0.95rem;
            font-weight:700;
            color:#1a2e4a;
            border-left:3px solid #3b6cb7;
            padding-left:10px;
            margin-bottom:16px;
        }

        /* ── KPI Table ── */
        .table-kpi { width:100%; border-collapse:collapse; font-size:0.85rem; }
        .table-kpi thead th {
            background:#f0f4fb;
            color:#1a2e4a;
            font-weight:600;
            text-align:center;
            border:1px solid #dde3ed;
            padding:9px 6px;
            white-space:nowrap;
        }
        .table-kpi tbody td {
            text-align:center;
            border:1px solid #eaecf0;
            padding:7px 6px;
            color:#374151;
        }
        .table-kpi tbody td:first-child {
            text-align:left;
            padding-left:14px;
            font-weight:600;
            color:#1a2e4a;
            min-width:90px;
        }
        .table-kpi tbody tr:hover td { background:#f7f9ff; }
        .table-kpi tbody td.bg-light {
            background:#f0f4fb !important;
            font-weight:700;
            color:#1a2e4a;
        }

        /* ── Clickable cell ── */
        .table-cell-clickable { cursor:pointer; }
        .table-cell-clickable:hover {
            background:#e8f0fe !important;
            color:#1a56db !important;
            text-decoration:underline;
        }

        /* ── Page Loader ── */
        .page-loader {
            position:fixed; inset:0;
            background:rgba(244,246,249,0.85);
            display:flex; flex-direction:column;
            align-items:center; justify-content:center;
            z-index:9999;
        }
        .spinner {
            width:40px; height:40px;
            border:4px solid #dde3ed;
            border-top-color:#3b6cb7;
            border-radius:50%;
            animation:spin .7s linear infinite;
            margin-bottom:10px;
        }
        @keyframes spin { to { transform:rotate(360deg); } }

        /* ── Modal ── */
        .modal-content {
            border:none !important;
            border-radius:10px !important;
            box-shadow:0 8px 32px rgba(0,0,0,0.14) !important;
        }
        .modal-header-custom {
            background:#1a2e4a;
            color:#fff;
            border-radius:10px 10px 0 0;
            padding:11px 18px;
            display:flex;
            align-items:center;
            justify-content:space-between;
        }
        .modal-header-custom .modal-title-text {
            font-size:0.88rem;
            font-weight:600;
            letter-spacing:.2px;
        }
        .modal-header-custom .btn-close-custom {
            background:none; border:none;
            color:rgba(255,255,255,0.75);
            font-size:1.3rem; line-height:1;
            cursor:pointer; padding:0 2px;
            transition:color .15s;
        }
        .modal-header-custom .btn-close-custom:hover { color:#fff; }
        .modal-body-custom { padding:14px 14px 0; }
        .modal-footer-custom {
            background:#f8f9fb;
            border-top:1px solid #eaecf0;
            border-radius:0 0 10px 10px;
            padding:8px 16px;
            display:flex;
            align-items:center;
            justify-content:space-between;
        }
        .modal-footer-custom .summary-text { font-size:0.8rem; color:#6b7280; }
        .btn-close-modal {
            font-size:0.8rem;
            padding:5px 16px;
            border-radius:6px;
            background:#e5e7eb;
            border:none;
            color:#374151;
            cursor:pointer;
            transition:background .15s;
        }
        .btn-close-modal:hover { background:#d1d5db; }

        /* ── Modal Table ── */
        #modalTable { font-size:0.79rem; border-collapse:collapse; width:100%; }
        #modalTable thead tr {
            background:#f0f4fb;
            border-bottom:2px solid #c7d4ea;
        }
        #modalTable thead th {
            color:#1a2e4a;
            font-weight:600;
            text-align:center;
            padding:7px 8px;
            white-space:nowrap;
            border:1px solid #dde3ed;
        }
        #modalTable tbody td {
            padding:5px 8px;
            border:1px solid #eaecf0;
            vertical-align:middle;
        }
        #modalTable tbody tr:nth-child(even) td { background:#fafbfe; }
        #modalTable tbody tr:hover td { background:#f0f6ff; }
        #modalTable tfoot td {
            padding:7px 8px;
            background:#f0f4fb;
            border-top:2px solid #c7d4ea;
            font-size:0.8rem;
        }

        /* ── Dark Mode ── */
        body.dark-mode { background:#16191e; color:#e2e8f0; }
        body.dark-mode .card-custom { background:#1e2330; box-shadow:0 1px 4px rgba(0,0,0,0.3); }
        body.dark-mode .chart-header { color:#93b4e8; border-left-color:#4a80d4; }
        body.dark-mode .table-kpi thead th { background:#252d3d; color:#c8d6f0; border-color:#2e3a50; }
        body.dark-mode .table-kpi tbody td { border-color:#2e3a50; color:#cbd5e1; }
        body.dark-mode .table-kpi tbody tr:hover td { background:#1e2a3d; }
        body.dark-mode .table-kpi tbody td.bg-light { background:#252d3d !important; color:#e2e8f0; }
        body.dark-mode .text-success { color:#6ee7b7 !important; }
        body.dark-mode .text-danger  { color:#fca5a5 !important; }
        body.dark-mode .page-loader  { background:rgba(22,25,30,0.88); }
        body.dark-mode .modal-content { background:#1e2330 !important; color:#e2e8f0 !important; }
        body.dark-mode .modal-footer-custom { background:#161920; border-color:#2e3a50; }
        body.dark-mode .modal-footer-custom .summary-text { color:#94a3b8; }
        body.dark-mode .btn-close-modal { background:#2e3a50; color:#e2e8f0; }
        body.dark-mode .btn-close-modal:hover { background:#3a4a66; }
        body.dark-mode #modalTable thead th { background:#252d3d; color:#c8d6f0; border-color:#2e3a50; }
        body.dark-mode #modalTable tbody td { background:transparent; border-color:#2e3a50; color:#cbd5e1; }
        body.dark-mode #modalTable tbody tr:nth-child(even) td { background:#1a2235; }
        body.dark-mode #modalTable tbody tr:hover td { background:#1e2a3d; }
        body.dark-mode #modalTable tfoot td { background:#252d3d; border-color:#2e3a50; }
        body.dark-mode .table-cell-clickable:hover { background:#1e2a3d !important; color:#93c5fd !important; }
    </style>

    <script type="text/javascript" src="../js/storeRep/storeRep.js?_dc<?= __VPRODUCT_; ?>"></script>
</head>

<body>
    <div class="container-fluid pt-3 pb-5">

        <!-- Toolbar -->
        <div class="d-flex flex-wrap align-items-center justify-content-between mb-3">
            <div>
                <h5 class="mb-0 font-weight-bold" style="color:#1a2e4a; font-size:1.05rem;">สรุปประสิทธิภาพ PR รายปี</h5>
                <small class="text-muted">ข้อมูล PR ที่เข้ามาในแต่ละเดือน</small>
            </div>
            <div class="custom-control custom-switch mt-2">
                <input type="checkbox" class="custom-control-input" id="darkToggle">
                <label class="custom-control-label" for="darkToggle" style="font-size:0.85rem;">Dark Mode</label>
            </div>
        </div>

        <!-- ส่วนที่ 1 : ตารางรายปี -->
        <div class="row">
            <div class="col-12">
                <div class="card-custom mb-3">
                    <div class="card-body">
                        <div class="chart-header">ส่วนที่ 1 ตารางข้อมูลรายปี (Monthly Data)</div>
                        <div class="table-responsive">
                            <table class="table-kpi" id="monthlyTable">
                                <thead>
                                    <tr>
                                        <th>ปีงบประมาณ</th>
                                        <th>ต.ค.</th>
                                        <th>พ.ย.</th>
                                        <th>ธ.ค.</th>
                                        <th>ม.ค.</th>
                                        <th>ก.พ.</th>
                                        <th>มี.ค.</th>
                                        <th>เม.ย.</th>
                                        <th>พ.ค.</th>
                                        <th>มิ.ย.</th>
                                        <th>ก.ค.</th>
                                        <th>ส.ค.</th>
                                        <th>ก.ย.</th>
                                        <th>รวม</th>
                                    </tr>
                                </thead>
                                <tbody id="tableBody">
                                    <tr>
                                        <td colspan="14" class="text-center py-4">กำลังโหลดข้อมูล...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ส่วนที่ 2 : กราฟ Yearly Trend -->
        <div class="row">
            <div class="col-lg-12">
                <div class="card-custom mb-3">
                    <div class="card-body">
                        <div class="chart-header">ส่วนที่ 2 กราฟแนวโน้ม (Yearly Trend)</div>
                        <div id="bar_bg" class="chart-box tall" style="height:650px; min-height:420px;"></div>
                    </div>
                </div>
            </div>
        </div>

    </div><!-- /container-fluid -->

    <!-- JS หลัก EIS edition -->
    <script type="text/javascript"
        src="../js/Yearly_PR_Performance_Summary.js?_dc<?= __VPRODUCT_; ?>">
    </script>
    <script>
        if (typeof loadAll === 'function') {
            loadAll({ year_en: <?= date('Y'); ?> });
        }
    </script>

    <!-- Page Loader -->
    <div id="pageLoader" class="page-loader" style="display:none;">
        <div class="spinner"></div>
        <p>กำลังโหลดข้อมูล...</p>
    </div>

    <!-- DETAIL POPUP MODAL -->
    <div class="modal fade" id="detailModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-centered" style="max-width:95vw; margin:24px auto;" role="document">
            <div class="modal-content">

                <!-- Header -->
                <div class="modal-header-custom">
                    <span class="modal-title-text" id="modalTitleText">รายละเอียด</span>
                    <button class="btn-close-custom" data-dismiss="modal" aria-label="Close">&times;</button>
                </div>

                <!-- Body -->
                <div class="modal-body-custom">

                    <div id="modalLoader" class="text-center py-5" style="display:none;">
                        <div class="spinner mx-auto"></div>
                        <p class="text-muted mt-2" style="font-size:0.85rem;">กำลังโหลดข้อมูล...</p>
                    </div>

                    <div id="modalTableWrap" style="display:none;">
                        <div style="overflow-x:auto;">
                            <table id="modalTable">
                                <thead id="modalThead"></thead>
                                <tbody id="modalTbody"></tbody>
                                <tfoot id="modalTfoot"></tfoot>
                            </table>
                        </div>
                    </div>

                    <div id="modalEmpty" class="text-center py-5" style="display:none;">
                        <p class="text-muted mb-0" style="font-size:0.85rem;">ไม่พบข้อมูลในเดือนนี้</p>
                    </div>

                    <div id="modalError" class="alert alert-danger mx-2 mt-3 mb-0" style="display:none; font-size:0.85rem;">
                        <span id="modalErrorMsg">เกิดข้อผิดพลาดในการดึงข้อมูล</span>
                    </div>

                </div>

                <!-- Footer -->
                <div class="modal-footer-custom">
                    <span class="summary-text" id="modalSummaryText"></span>
                    <button class="btn-close-modal" data-dismiss="modal">ปิด</button>
                </div>

            </div>
        </div>
    </div>
    <!-- END DETAIL POPUP MODAL -->

</body>
</html>