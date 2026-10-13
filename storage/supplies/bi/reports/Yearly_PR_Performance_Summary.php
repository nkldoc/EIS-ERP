<?php
include("../../conf/config.php");
// ===== Budget Dashboard Demo (PHP, with Data View colored by fund) =====

if (isset($_GET['action']) && $_GET['action'] === 'data') {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['budget' => $rowsBudget, 'status' => $rowsStatus, 'year_th_default' => 2568], JSON_UNESCAPED_UNICODE);
        exit;
}
?>
<!DOCTYPE html>
<html lang="th">

<head>

        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" href="../../images/favicon.ico" type="image/x-icon">
        <link rel="icon" href="../../images/favicon.ico" type="image/x-icon">
        <title>ตารางสรุปข้อมูลรายปี Dashboard </title>
        <?php include("../../lib/loadJs.php"); ?>
        <?php include("../../lib/loadCss.php"); ?>
        <script src="../../ws_user/js/jquery.min.js"></script>
        <script src="../../js/echarts/echarts.js"></script>
        <script src="../bootstrap/bootstrap-4.6.2-dist/js/bootstrap.bundle.min.js"></script>
        <script src="../bootstrap/bootstrap-select-1.13.14/dist/js/bootstrap-select.min.js"></script>
        <script src="../../js/echarts/macarons.js"></script>
        <script src="../lib/xlsx.full.min.js"></script>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title><?php echo COMPANY_NAME; ?></title>

        <link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
        <link rel="stylesheet" type="text/css" href="../css/report-style.css">

        <link rel="stylesheet" type="text/css" href="../bootstrap/bootstrap-4.6.2-dist/css/bootstrap.min.css">
        <link rel="stylesheet" type="text/css" href="../bootstrap/bootstrap-select-1.13.14/dist/css/bootstrap-select.min.css">

        <link rel="stylesheet" type="text/css" href="../css/report-style-biType.css">
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
                        min-width: 100px;
                }

                .chart-header {
                        font-weight: bold;
                        border-bottom: 2px solid #46a8de;
                        padding-bottom: 10px;
                        margin-bottom: 15px;
                        font-size: 1.1rem;
                }

                /* Dark Mode Styles */
                body.dark-mode {
                        background-color: #1a1d21;
                        color: #e9ecef;
                }

                body.dark-mode .card-custom {
                        background-color: #2c3036;
                        color: #e9ecef;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
                        border-top: 4px solid #64b5f6;
                        /* Lighter blue */
                }

                body.dark-mode .chart-header {
                        border-bottom-color: #64b5f6;
                }

                body.dark-mode .table-kpi {
                        color: #e9ecef !important;
                }

                body.dark-mode .table-kpi thead th {
                        background-color: #37404a;
                        /* Darker header */
                        border-color: #495057;
                        color: #fff;
                }

                body.dark-mode .table-kpi tbody td {
                        border-color: #495057;
                        background-color: transparent;
                        /* Fix invisible text */
                }

                body.dark-mode .table-kpi tbody td.bg-light {
                        background-color: #343a40 !important;
                        /* Darker total column */
                        color: #fff;
                }

                body.dark-mode .text-muted {
                        color: #adb5bd !important;
                }

                body.dark-mode .table-kpi,
                body.dark-mode .table-kpi tbody,
                body.dark-mode .table-kpi tr {
                        background-color: transparent !important;
                        color: #e9ecef !important;
                }

                body.dark-mode .chart-box {
                        background-color: transparent !important;
                }

                /* Adjust status colors for dark mode */
                body.dark-mode .text-success {
                        color: #75b798 !important;
                        /* Lighter green */
                }

                body.dark-mode .text-danger {
                        color: #ea868f !important;
                        /* Lighter red */
                }
        </style>


        <script type="text/javascript" src="../js/storeRep/storeRep.js?_dc<?= __VPRODUCT_; ?>"></script>

</head>

<body>
        <div class="container-fluid pt-3 pb-5">
                <div class="text-center mb-3">
                        <img src="../images/logo.png" alt="logo" class="report-logo" style="height: 150px; width: auto;">
                </div>
                <div class="toolbar">
                        <div class="d-flex flex-wrap align-items-center justify-content-between">
                                <div class="mb-2">
                                        <h4 class="mb-1 font-weight-bold">ตารางสรุปข้อมูลรายปี </h4>
                                        <div class="legend-badges">
                                                <span class="badge badge-primary mr-1">ข้อมูล PR ที่เข้ามาในแต่ละเดือน</span>
                                                <!-- <span class="badge badge-info mr-1">จองเงิน</span> -->
                                                <!-- <span class="badge badge-danger">คงเหลือหลังจองเงิน</span> -->
                                                <!-- <span class="badge badge-danger"> % </span> -->

                                        </div>
                                </div>
                                <!-- <div class="form-check form-switch d-inline-block ms-3">
                                        <input class="form-check-input" type="checkbox" id="toggleChartType">
                                        <label class="form-check-label" for="toggleChartType">Bar View</label>
                                </div> -->

                                <div class="filter-bar mb-3">
                                        <div class="d-flex justify-content-end align-items-center gap-2 mb-3 flex-wrap filter-bar">
                                                <!-- <div class="filter-group">
                                                        <label for="budget_year_filter" class="me-2 fw-semibold">ปีงบประมาณ:</label>
                                                        <select id="budget_year_filter" class="form-select form-select-sm" style="width:120px"></select>

                                                </div> -->

                                                <!-- แหล่งเงิน -->
                                                <div class="filter-group">
                                                </div>
                                                <!-- Dark Mode -->
                                                <div class="custom-control custom-switch mr-2">
                                                        <input type="checkbox" class="custom-control-input" id="darkToggle">
                                                        <label class="custom-control-label" for="darkToggle"><i class="bi bi-moon-stars"></i> Dark</label>
                                                </div>
                                        </div>
                                </div>

                        </div>
                </div>

                <!-- Monthly Data Table -->
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

                <!-- ===== Charts ===== -->
                <div class="row">
                        <div class="col-lg-12">
                                <div class="card-custom mb-3">
                                        <div class="card-body">
                                                <div class="chart-header">ส่วนที่ 2 กราฟแนวโน้ม (Yearly Trend)</div>
                                                <div id="bar_bg" class="chart-box tall" style="height:650px; min-height:420px;">
                                                </div>
                                        </div>
                                </div>
                        </div>

                </div>

        </div>

        <script type="text/javascript" src="../js/Yearly_PR_Performance_Summary.js?_dc<?= __VPRODUCT_; ?>"></script>
        <script>
                if (typeof loadAll === 'function') {
                        loadAll({
                                year_en: 2026
                        }); // ปรับพารามิเตอร์ได้
                }
        </script>
        <div id="pageLoader" class="page-loader" style="display:none">
                <div class="spinner"></div>
                <p>กำลังโหลดข้อมูล...</p>
        </div>
</body>

</html>