<?php
// Key_Performance_Indicator.php
// ===== KPI Dashboard + Chart (Mock Data) =====
?>
<!DOCTYPE html>
<html lang="th">

<head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" href="../../images/favicon.ico" type="image/x-icon">
        <link rel="icon" href="../../images/favicon.ico" type="image/x-icon">
        <title>KPI Dashboard - ฝ่ายพัสดุ</title>

        <?php include("../lib/loadJs.php"); ?>
        <?php include("../lib/loadCss.php"); ?>

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
                                <h5 class="font-weight-bold m-0">รายงานผลตัวชี้วัดคุณภาพ (KPI) ฝ่ายพัสดุ</h5>
                                <div class="custom-control custom-switch">
                                        <input type="checkbox" class="custom-control-input" id="darkToggle">
                                        <!-- <label class="custom-control-label" for="darkToggle">Dark Mode</label> -->
                                </div>
                        </div>

                        <div class="row">
                                <div class="col-lg-3 col-md-4 mb-2">
                                        <div class="info-box">
                                                <div class="info-label">ปีงบประมาณ</div>
                                                <select id="filter_year" class="form-control form-control-sm selectpicker">
                                                        <?php
                                                        $curYear = date("Y") + 543;
                                                        for ($y = $curYear + 1; $y >= $curYear - 5; $y--) {
                                                                $sel = ($y == $curYear) ? "selected" : "";
                                                                echo "<option value='" . ($y - 543) . "' $sel>$y</option>";
                                                        }
                                                        ?>
                                                </select>
                                        </div>
                                </div>
                                <div class="col-lg-4 col-md-4 mb-2">
                                        <div class="info-box">
                                                <div class="info-label">บุคลากร (ผู้รับผิดชอบ)</div>
                                                <select id="filter_emp" class="form-control form-control-sm selectpicker" multiple data-live-search="true" data-actions-box="true" data-selected-text-format="count > 2" title="เลือกผู้รับผิดชอบ...">
                                                        <option value="0">ทั้งหมด</option>
                                                </select>
                                        </div>
                                </div>
                                <div class="col-lg-2 col-md-4 mb-2">
                                        <div class="info-box text-center">
                                                <div class="info-label">เป้าหมาย (%)</div>
                                                <input type="number" id="kpiTargetInput" class="form-control form-control-sm text-center font-weight-bold text-primary" value="80" style="font-size:1.2em;">
                                        </div>
                                </div>
                                <div class="col-lg-3 col-md-4 mb-2">
                                        <div class="info-box">
                                                <div class="info-label">วิธีการดำเนินงาน (ตัวกรอง)</div>
                                                <select id="filter_method" class="selectpicker show-tick form-control" multiple data-live-search="true" data-actions-box="true" data-width="100%" title="โหลดข้อมูล..."></select>
                                        </div>
                                </div>
                                <div class="col-lg-3 col-md-4 mb-2">
                                        <div class="info-box">
                                                <div class="info-label">ประเภทสัญญา</div>
                                                <select id="filter_contract_type" class="form-control form-control-sm selectpicker" multiple title="เลือกประเภทสัญญา...">
                                                        <option value="1">สัญญา</option>
                                                        <option value="2">ใบสั่ง</option>
                                                        <option value="3">จะซื้อจะขาย</option>
                                                </select>
                                        </div>
                                </div>
                                <div class="col-lg-3 col-md-4 mb-2">
                                        <div class="info-box align-items-center flex-row">
                                                <div class="custom-control custom-checkbox">
                                                        <input type="checkbox" class="custom-control-input" id="useRepKPI2" checked>
                                                        <label class="custom-control-label font-weight-bold text-primary" for="useRepKPI2">ใช้เกณฑ์ แบบสรุปรวม KPI (วันทำการ)</label>
                                                </div>
                                                <small class="text-muted ml-2">(ถ้าติ๊กออกใช้เกณฑ์ แบบสรุปรวม KPI (วันปฏิทิน))</small>
                                        </div>
                                </div>
                        </div>
                </div>

                <div class="card-custom">
                        <div class="card-body">
                                <div class="chart-header">ส่วนที่ 1 ผลการดำเนินงาน</div>
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
                                                                <td colspan="14" class="text-center py-4">กำลังโหลด...</td>
                                                        </tr>
                                                </tbody>
                                        </table>
                                </div>
                        </div>
                </div>

                <div class="card-custom">
                        <div class="card-body">
                                <div class="chart-header">ส่วนที่ 2 กราฟสรุปผล</div>
                                <div id="kpiChart" class="chart-container"></div>
                        </div>
                </div>

                <div id="pageLoader" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.8); z-index:9999; display:flex; justify-content:center; align-items:center;">
                        <div class="spinner-border text-primary" role="status"></div>
                </div>

        </div>

        <script src="../js/Key_Performance_Indicator.js?v=<?= time(); ?>"></script>
</body>

</html>