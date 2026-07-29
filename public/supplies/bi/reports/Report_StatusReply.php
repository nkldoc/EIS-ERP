<?php
include("../../conf/config.php");
?>
<!DOCTYPE html>
<html lang="th">

<head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" href="../../images/favicon.ico" type="image/x-icon">
        <link rel="icon" href="../../images/favicon.ico" type="image/x-icon">
        <title>Reply Report Dashboard - ฝ่ายพัสดุ</title>

        <?php include("../../lib/loadJs.php"); ?>
        <?php include("../../lib/loadCss.php"); ?>

        <script src="../../ws_user/js/jquery.min.js"></script>
        <script src="../../js/echarts/echarts.js"></script>
        <script src="../bootstrap/bootstrap-4.6.2-dist/js/bootstrap.bundle.min.js"></script>
        <script src="../bootstrap/bootstrap-select-1.13.14/dist/js/bootstrap-select.min.js"></script>
        <script type="text/javascript" src="../../lib/right/GrantPermission.php?_dc=<?= __VPRODUCT_; ?>&f=<?php echo $_SERVER["PHP_SELF"]; ?>"></script>

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
                        transition: 0.3s;
                        border-top: 4px solid #46a8de;
                        /* สีฟ้า */
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

                .chart-container-wide {
                        height: 500px;
                        /* สูงพอสำหรับ Line Chart */
                        width: 100%;
                        background: #ffffff;
                        padding: 10px;
                }

                .report-logo {
                        filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.1));
                }

                /* สียอดทักท้วง */
                .text-reply {
                        color: #dc3545;
                        font-weight: bold;
                }

                .text-sent {
                        color: #28a745;
                        font-weight: bold;
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
                                <h5 class="font-weight-bold m-0">รายงานสรุปรายการทักท้วง (Reply Report)</h5>
                                <div class="custom-control custom-switch">
                                        <!-- <input type="checkbox" class="custom-control-input" id="darkToggle"> -->
                                </div>
                        </div>

                        <div class="row">
                                <div class="col-lg-5 mb-2">
                                        <div class="info-box bg-primary text-white">
                                                <div class="info-label text-white">สรุปยอดสะสมทั้งปี</div>
                                                <div class="d-flex justify-content-around align-items-center">
                                                        <div class="text-center">
                                                                <small>เรื่องส่งเบิก</small>
                                                                <h3 id="sum_sent_all">0</h3>
                                                        </div>
                                                        <div class="text-center border-left border-right px-4">
                                                                <small>โดนทักท้วง</small>
                                                                <h3 id="sum_reply_all">0</h3>
                                                        </div>
                                                        <div class="text-center">
                                                                <small>คิดเป็นร้อยละ</small>
                                                                <h3 id="sum_percent_all">0%</h3>
                                                        </div>
                                                </div>
                                        </div>
                                </div>
                                <div class="col-lg-3 col-md-4 mb-2">
                                        <div class="info-box">
                                                <div class="info-label">ปีงบประมาณ</div>
                                                <select id="budget_year_filter" class="selectpicker form-control" data-style="btn-outline-primary" title="เลือกปี"></select>
                                        </div>
                                </div>

                                <div class="col-lg-4 col-md-8 mb-2">
                                        <div class="info-box">
                                                <div class="info-label">ผู้รับผิดชอบงาน (ตัวกรอง)</div>
                                                <select id="filter_staff" class="selectpicker form-control" multiple data-live-search="true" data-actions-box="true" data-width="100%" title="เลือกผู้รับผิดชอบ"></select>
                                        </div>
                                </div>
                        </div>
                </div>

                <div class="container-fluid pt-3 pb-5">
                        <div class="card-custom">
                                <div class="card-body">
                                        <div class="chart-header">ส่วนที่ 1 ตารางข้อมูลการทักท้วงรายเดือน</div>
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
                                                        <tbody id="replyTableBody">
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
                                        <div class="chart-header" id="chartTitle">ส่วนที่ 2 กราฟแนวโน้ม (Line Chart)</div>
                                        <div class="row">
                                                <div class="col-12">
                                                        <div id="replyLineChart" class="chart-container-wide"></div>
                                                </div>
                                        </div>
                                </div>
                        </div>
                </div>

                <div id="pageLoader" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.8); z-index:9999; display:flex; justify-content:center; align-items:center;">
                        <div class="spinner-border text-primary"></div>
                </div>

                <div id="context-menu" class="dropdown-menu" style="display:none; position:absolute; z-index:10000; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
                        <a class="dropdown-item cursor-pointer" id="menu-view-detail">
                                <i class="bi bi-search mr-2 text-primary"></i> ดูรายละเอียดรายการนี้
                        </a>
                        <a class="dropdown-item cursor-pointer text-danger" id="menu-show-sql">
                                <i class="bi bi-code-slash mr-2"></i> Show SQL (Admin)
                        </a>
                        <div class="dropdown-divider"></div>
                        <a class="dropdown-item text-muted small" href="javascript:void(0)">ยกเลิก</a>
                </div>

                <div id="context-menu-modal" class="dropdown-menu" style="display:none; position:absolute; z-index:10000; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
                        <a class="dropdown-item cursor-pointer text-danger" id="menu-modal-show-sql">
                                <i class="bi bi-code-slash mr-2"></i> Show SQL (Detailed)
                        </a>
                        <div class="dropdown-divider"></div>
                        <a class="dropdown-item text-muted small" href="javascript:void(0)">ยกเลิก</a>
                </div>

        </div>

        <script src="../lib/xlsx.full.min.js"></script>
        <script src="../js/Report_StatusReply.js?v=<?= time(); ?>"></script>

        <!-- Detail Modal -->
        <div class="modal fade" id="detailModal" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-xxl modal-dialog-centered" role="document">
                        <div class="modal-content border-0 shadow-lg">
                                <div class="modal-header bg-light border-0 align-items-center">
                                        <div>
                                                <h5 class="modal-title font-weight-bold text-dark mb-1" id="modalTitle">รายละเอียดข้อมูล</h5>
                                                <p class="text-muted mb-0 small" id="modalSubtitle">Loading...</p>
                                        </div>
                                        <div class="d-flex align-items-center">
                                                <button class="btn btn-outline-success btn-sm rounded-pill mr-3" id="btnExportModal">
                                                        <i class="fas fa-file-excel mr-1"></i> Export Excel
                                                </button>
                                                <button type="button" class="close text-muted" data-dismiss="modal" aria-label="Close" style="font-size: 1.5rem; opacity: 0.7;">
                                                        <span aria-hidden="true">&times;</span>
                                                </button>
                                        </div>
                                </div>
                                <div class="modal-body p-0">
                                        <!-- Search & Filter Bar inside Modal (Optional, purely based on Image 3 which seems to have a clean header) -->
                                        <!-- If needed we can add a search bar here, but Image 3 doesn't explicitly show one, 
                                             however `Report_StatusReplyDetail.php` had one. I'll add a small one. -->
                                        <div class="p-3 bg-white border-bottom d-flex justify-content-between align-items-center">
                                                <div class="input-group input-group-sm" style="width: 250px;">
                                                        <div class="input-group-prepend">
                                                                <span class="input-group-text bg-transparent border-right-0"><i class="fas fa-search text-muted"></i></span>
                                                        </div>
                                                        <input type="text" class="form-control border-left-0" id="modalSearchInput" placeholder="ค้นหา...">
                                                </div>
                                                <div id="modalSummaryStats" class="small text-muted">
                                                        <!-- Dynamic Stats -->
                                                </div>
                                        </div>

                                        <div class="table-responsive" style="max-height: 60vh;">
                                                <table class="table table-hover table-striped mb-0" id="modalTable">
                                                        <thead class="thead-light">
                                                                <tr>
                                                                        <th class="sticky-top">#</th>
                                                                        <th class="sticky-top">เลขที่ตรวจรับ</th>
                                                                        <th class="sticky-top">เลขที่ส่งเบิก</th>
                                                                        <th class="sticky-top" style="min-width:200px;">รายการ</th>
                                                                        <th class="sticky-top text-right" style="min-width:120px;">จำนวนเงิน</th>
                                                                        <th class="sticky-top">เจ้าหนี้/บริษัท</th>
                                                                        <th class="sticky-top" style="min-width:100px;">วันที่ส่งมอบ</th>
                                                                        <th class="sticky-top" style="min-width:100px;">วันที่ตรวจรับ</th>
                                                                        <th class="sticky-top" style="min-width:100px;">วันที่สร้างใบเบิก</th>
                                                                        <th class="sticky-top text-center" style="font-size:0.8rem;">ระยะเวลา<br>(ส่งมอบ-ตรวจรับ)</th>
                                                                        <th class="sticky-top text-center" style="font-size:0.8rem;">ระยะเวลา<br>(ตรวจรับ-ส่งเบิก)</th>
                                                                        <th class="sticky-top">ผู้ส่งเบิก</th>
                                                                        <th class="sticky-top">จนท.ทักท้วง</th>
                                                                        <th class="sticky-top text-center">สถานะ</th>
                                                                        <th class="sticky-top" style="min-width:100px;">วันที่ทักท้วง</th>
                                                                        <th class="sticky-top">ข้อความทักท้วง</th>
                                                                </tr>
                                                        </thead>
                                                        <tbody id="modalTableBody">
                                                                <!-- JS will populate -->
                                                        </tbody>
                                                </table>
                                        </div>

                                        <div id="modalLoader" class="d-none justify-content-center align-items-center py-5">
                                                <div class="spinner-border text-primary" role="status">
                                                        <span class="sr-only">Loading...</span>
                                                </div>
                                        </div>
                                </div>
                                <div class="modal-footer bg-light border-0 py-2">
                                        <small class="text-muted mr-auto" id="modalFooterInfo"></small>
                                        <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">ปิด</button>
                                </div>
                        </div>
                </div>
        </div>

        <style>
                /* Modal Specific Styles */
                .modal-xxl {
                        max-width: 95vw;
                        /* Wider than xl */
                }

                .modal-content {
                        border-radius: 12px;
                        overflow: hidden;
                }

                .modal-header {
                        background: linear-gradient(to right, #f8f9fa, #e9ecef);
                        padding: 1rem 1.5rem;
                }

                #modalTable thead th {
                        background-color: #007bff;
                        /* Primary Blue from theme */
                        border: none;
                        color: #fff;
                        font-weight: 500;
                        font-size: 0.95rem;
                        white-space: nowrap;
                        padding: 12px 10px;
                        vertical-align: middle;
                }

                #modalTable tbody td {
                        font-size: 0.9rem;
                        vertical-align: middle;
                        padding: 10px;
                        color: #333;
                }

                #modalTable tbody tr:hover {
                        background-color: #f1f8ff;
                }

                .sticky-top {
                        position: sticky;
                        top: 0;
                        z-index: 1020;
                }

                .table-responsive {
                        background-color: #fff;
                }

                /* Custom Scrollbar for modal table */
                .table-responsive::-webkit-scrollbar {
                        width: 8px;
                        height: 8px;
                }

                .table-responsive::-webkit-scrollbar-track {
                        background: #f1f1f1;
                }

                .table-responsive::-webkit-scrollbar-thumb {
                        background: #bbb;
                        border-radius: 4px;
                }

                .table-responsive::-webkit-scrollbar-thumb:hover {
                        background: #999;
                }
        </style>
</body>

</html>
```