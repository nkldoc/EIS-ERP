<!DOCTYPE html>
<html lang="th">

<head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" href="../../images/favicon.ico" type="image/x-icon">
        <link rel="icon" href="../../images/favicon.ico" type="image/x-icon">
        <title>Pie Dashboard - ฝ่ายพัสดุ</title>

        <?php include("../../lib/loadJs.php"); ?>
        <?php include("../../lib/loadCss.php"); ?>

        <script src="../../ws_user/js/jquery.min.js"></script>
        <script src="../../js/echarts/echarts.js"></script>
        <script src="../bootstrap/bootstrap-4.6.2-dist/js/bootstrap.bundle.min.js"></script>
        <script src="../bootstrap/bootstrap-select-1.13.14/dist/js/bootstrap-select.min.js"></script>

        <link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
        <link rel="stylesheet" type="text/css" href="../css/report-style.css">
        <link rel="stylesheet" type="text/css" href="../bootstrap/bootstrap-4.6.2-dist/css/bootstrap.min.css">
        <link rel="stylesheet" type="text/css" href="../bootstrap/bootstrap-select-1.13.14/dist/css/bootstrap-select.min.css">


        <style>
                body {
                        background-color: #f8f9fa;
                        font-family: 'Sarabun', sans-serif;
                }

                .card-custom {
                        border: none;
                        border-radius: 8px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                        margin-bottom: 20px;
                        background: #fff;
                }

                .info-box {
                        background: #fff;
                        border: 1px solid #e9ecef;
                        border-radius: 6px;
                        padding: 10px 15px;
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                }

                .info-label {
                        font-size: 0.85rem;
                        color: #6c757d;
                        margin-bottom: 5px;
                        font-weight: 600;
                }

                /* Table Styles */
                .table-kpi {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 0.9rem;
                }

                .table-kpi thead th {
                        background-color: #46a8de;
                        color: #fff;
                        text-align: center;
                        border: 1px solid #3596cc;
                        padding: 10px 5px;
                }

                .table-kpi tbody td {
                        text-align: center;
                        border: 1px solid #dee2e6;
                        padding: 8px 5px;
                }

                .table-kpi tbody td:first-child {
                        text-align: left;
                        padding-left: 15px;
                        font-weight: 500;
                        min-width: 250px;
                }

                .row-result td {
                        background-color: #fff3cd !important;
                        font-weight: bold;
                }

                .status-pass {
                        color: #28a745;
                        font-weight: bold;
                }

                .status-fail {
                        color: #dc3545;
                        font-weight: bold;
                }

                .col-total {
                        background-color: #e2e6ea !important;
                        font-weight: bold;
                }

                /* Chart Styles */
                .chart-header {
                        font-weight: bold;
                        border-bottom: 2px solid #46a8de;
                        padding-bottom: 10px;
                        margin-bottom: 15px;
                        font-size: 1.1rem;
                }

                .chart-container {
                        height: 400px;
                        width: 100%;
                }

                .chart-container {
                        height: 550px;
                        /* ขยายความสูงเพื่อให้แสดง 2 วงได้ชัดเจน */
                        background: #ffffff;
                        padding: 20px;
                }

                .card-custom {
                        transition: 0.3s;
                        border-top: 4px solid #46a8de;
                        /* เพิ่มเส้นสีด้านบนให้ดูเป็นระบบงานพัสดุ */
                }

                .report-logo {
                        filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.1));
                }

                /* เพิ่มสไตล์ให้ตารางดูว่าคลิกขวาได้ */
                .table-kpi td.cursor-pointer:hover {
                        background-color: #f1f8ff !important;
                        outline: 1px solid #46a8de;
                }
        </style>
        <link rel="stylesheet" type="text/css" href="../css/report-style-biType.css">

</head>


<body>
        <div class="container-fluid pt-3 pb-5">
                <div class="text-center mb-3">
                        <img src="../images/logo.png" alt="logo" class="report-logo" style="height: 150px; width: auto;">
                </div>
                <div class="card-custom p-3">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="font-weight-bold m-0">รายงาน </h5>
                                <div class="custom-control custom-switch">
                                        <input type="checkbox" class="custom-control-input" id="darkToggle">
                                        <!-- <label class="custom-control-label" for="darkToggle">Dark Mode</label> -->
                                </div>
                        </div>

                        <div class="row">
                                <div class="col-lg-4 mb-2">
                                        <div class="info-box bg-primary text-white">
                                                <div class="info-label text-white">สรุปยอดงานสะสมทั้งปี</div>
                                                <div class="d-flex justify-content-around align-items-center">
                                                        <div class="text-center">
                                                                <small>งานทั้งหมด</small>
                                                                <h3 id="sum_total_all">0</h3>
                                                        </div>
                                                        <div class="text-center">
                                                                <small>จ่ายงานแล้ว</small>
                                                                <h3 id="sum_assigned_all">0</h3>
                                                        </div>
                                                        <div class="text-center">
                                                                <small>คงเหลือ</small>
                                                                <h3 id="sum_pending_all">0</h3>
                                                        </div>
                                                </div>
                                        </div>
                                </div>
                                <div class="col-lg-2 col-md-4 mb-2">
                                        <div class="info-box">
                                                <div class="info-label">ปีงบประมาณ</div>
                                                <select id="budget_year_filter" class="selectpicker form-control" data-style="btn-outline-primary" title="เลือกปี"></select>
                                        </div>
                                </div>

                                <div class="col-lg-3 col-md-4 mb-2">
                                        <div class="info-box">
                                                <div class="info-label">ผู้รับผิดชอบงาน (ตัวกรอง)</div>
                                                <select id="filter_staff" class="selectpicker form-control" multiple data-live-search="true" data-actions-box="true" data-width="100%" title="เลือกผู้รับผิดชอบ"></select>
                                        </div>
                                </div>

                                <div class="col-lg-3 col-md-4 mb-2">
                                        <div class="info-box">
                                                <div class="info-label">ประเภทงาน (ตัวกรอง)</div>
                                                <select id="filter_method" class="selectpicker form-control" multiple data-live-search="true" data-actions-box="true" data-width="100%" title="เลือกประเภทงาน"></select>
                                        </div>
                                </div>

                                <div class="col-lg-3 col-md-4 mb-2">
                                        <div class="info-box">
                                                <div class="info-label">สถานะใบขอเบิก (ตัวกรอง)</div>
                                                <select id="filter_sub_status" class="selectpicker form-control" multiple data-live-search="true" data-actions-box="true" data-width="100%" title="เลือกสถานะใบขอเบิก"></select>
                                        </div>
                                </div>
                        </div>
                </div>

                <div class="container-fluid pt-3 pb-5">
                        <div class="card-custom">
                                <div class="card-body">
                                        <div class="chart-header">ส่วนที่ 1 ผลการดำเนินงาน (คลิกที่ตัวเลขในตารางเพื่อเลือกเดือน)</div>
                                        <div class="table-responsive">
                                                <table class="table-kpi">
                                                        <thead>
                                                                <tr>
                                                                        <th>รายการ</th>
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
                                                                        <th style="background-color: #6c757d;">Total</th>
                                                                </tr>
                                                        </thead>
                                                        <tbody id="kpiTableBody">
                                                                <tr>
                                                                        <td colspan="14" class="text-center py-4">กำลังโหลดข้อมูล...</td>
                                                                </tr>
                                                        </tbody>
                                                </table>
                                        </div>
                                </div>
                        </div>

                        <div class="card-custom">
                                <div class="card-body">
                                        <div class="chart-header" id="chartTitle">ส่วนที่ 2 กราฟสรุปผล</div>
                                        <div class="row">
                                                <div class="col-md-6 border-right">
                                                        <div id="assignChart" class="chart-container"></div>
                                                </div>
                                                <div class="col-md-6">
                                                        <div id="statusChart" class="chart-container"></div>
                                                </div>
                                        </div>
                                </div>
                        </div>
                </div>

                <div id="pageLoader" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.8); z-index:9999; display:flex; justify-content:center; align-items:center;">
                        <div class="spinner-border text-primary"></div>
                </div>

        </div>

        <style>
                /* Custom styles for Drilldown Modal */
                #detailModal .modal-content {
                        border-radius: 12px;
                        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
                        border: none;
                }

                #detailModal .modal-header {
                        background: linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%);
                        color: #fff;
                        border-top-left-radius: 12px;
                        border-top-right-radius: 12px;
                        padding: 1rem 1.5rem;
                }

                #detailModal .close {
                        color: #fff;
                        opacity: 0.8;
                        text-shadow: none;
                }

                #detailModal .close:hover {
                        opacity: 1;
                }

                #detailTable {
                        border-collapse: separate;
                        border-spacing: 0;
                        width: 100%;
                        margin-bottom: 0;
                }

                #detailTable thead th {
                        background-color: #f8f9fa;
                        color: #495057;
                        border-bottom: 2px solid #e9ecef;
                        border-top: none;
                        text-align: center;
                        vertical-align: middle;
                        font-weight: 600;
                        padding: 12px 8px;
                }

                #detailTable tbody td {
                        vertical-align: middle;
                        border-color: #f1f3f5;
                        padding: 10px 8px;
                        color: #333;
                }

                #detailTable tbody tr:hover {
                        background-color: #f0f4ff;
                }

                /* Column specifics */
                .col-w-50 {
                        width: 50px;
                }

                .col-w-120 {
                        width: 120px;
                }

                .col-w-80 {
                        width: 80px;
                }

                .col-w-100 {
                        width: 100px;
                }

                .col-w-150 {
                        width: 150px;
                }
        </style>

        <div id="context-menu" class="dropdown-menu" style="display:none; position:absolute; z-index:10000; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
                <!-- ... existing menu items ... -->
                <a class="dropdown-item cursor-pointer" id="menu-view-detail">
                        <i class="bi bi-search mr-2 text-primary"></i> ดูรายละเอียดรายการนี้
                </a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item text-muted small" href="javascript:void(0)">ยกเลิก</a>
        </div>

        <!-- Modal: Drilldown Details -->
        <div class="modal fade" id="detailModal" tabindex="-1" role="dialog" aria-labelledby="detailModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-xl" role="document">
                        <div class="modal-content">
                                <div class="modal-header">
                                        <h5 class="modal-title" id="detailModalLabel">รายละเอียด (Drilldown)</h5>
                                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                        </button>
                                </div>
                                <div class="modal-body">
                                        <div id="modalLoader" class="text-center py-5">
                                                <div class="spinner-border text-primary" role="status">
                                                        <span class="sr-only">Loading...</span>
                                                </div>
                                                <p class="mt-2 text-muted">กำลังโหลดข้อมูล...</p>
                                        </div>
                                        <div class="table-responsive" id="modalTableContainer" style="display:none; max-height: 70vh; overflow-y: auto;">
                                                <table class="table table-hover small mb-0" id="detailTable">
                                                        <thead style="position: sticky; top: 0; z-index: 5;">
                                                                <tr>
                                                                        <th class="col-w-50">#</th>
                                                                        <th class="col-w-120">PR ID</th>
                                                                        <th class="col-w-80">รหัสงบฯ</th>
                                                                        <th>ชื่องบประมาณ</th>
                                                                        <th class="col-w-100">หน่วยงาน</th>
                                                                        <th class="col-w-150">ผู้รับผิดชอบ</th>
                                                                         <th class="col-w-150">สถานะใบขอเบิก</th>
                                                                        <th class="col-w-120">จำนวนเงิน</th>
                                                                </tr>
                                                        </thead>
                                                        <tbody id="detailTableBody"></tbody>
                                                </table>
                                        </div>
                                </div>
                        </div>
                        <!-- <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                </div> -->
                </div>
        </div>
        </div>

        <script src="../js/Report_ChartStatus.js?v=<?= time(); ?>"></script>
</body>

</html>