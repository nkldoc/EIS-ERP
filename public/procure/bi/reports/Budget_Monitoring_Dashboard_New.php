<?php
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
        <title>งบประมาณ - Dashboard + Data View</title>
        <!-- <?php include("../lib/loadJs.php"); ?> -->
        <?php include("../lib/loadCss.php"); ?>
        <script src="../../ws_user/js/jquery.min.js"></script>
        <script src="../../js/ext-3.4.0/adapter/jquery/ext-jquery-adapter.js"></script>
        <script src="../../js/ext-3.4.0/ext-all-debug.js"></script>
        <script src="../../js/config.js"></script>
        <script src="../../js/echarts/echarts.js"></script>
        <script src="../bootstrap/bootstrap-4.6.2-dist/js/bootstrap.bundle.min.js"></script>
        <script src="../bootstrap/bootstrap-select-1.13.14/dist/js/bootstrap-select.min.js"></script>
        <script src="../../js/echarts/macarons.js"></script>
        <script src="../lib/xlsx.full.min.js"></script>
        <script src="../../lib/xlsx-js-style.min.js"></script>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title><?php echo COMPANY_NAME; ?></title>

        <link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
        <link rel="stylesheet" type="text/css" href="../css/report-style.css">

        <link rel="stylesheet" type="text/css" href="../bootstrap/bootstrap-4.6.2-dist/css/bootstrap.min.css">
        <link rel="stylesheet" type="text/css" href="../bootstrap/bootstrap-select-1.13.14/dist/css/bootstrap-select.min.css">

        <link rel="stylesheet" type="text/css" href="../css/report-style-biType.css">


                <script type="text/javascript" src="../js/storeRep/storeRep.js?_dc<?= __VPRODUCT_; ?>"></script>

</head>

<body>
        <div class="container-fluid pt-3 pb-5">
                <div class="toolbar">
                        <div class="d-flex flex-wrap align-items-center justify-content-between">
                                <div class="mb-2">
                                        <h4 class="mb-1 font-weight-bold">ระบบติดตามงบประมาณ </h4>
                                        <div class="legend-badges">
                                                <span class="badge badge-primary mr-1">จำนวนงบประมาณ</span>
                                                <span class="badge badge-info mr-1">จองเงิน</span>
                                                <span class="badge badge-danger">คงเหลือหลังจองเงิน</span>
                                                <span class="badge badge-danger"> % </span>

                                        </div>
                                </div>
                                <!-- <div class="form-check form-switch d-inline-block ms-3">
                                        <input class="form-check-input" type="checkbox" id="toggleChartType">
                                        <label class="form-check-label" for="toggleChartType">Bar View</label>
                                </div> -->

                                <div class="filter-bar mb-3">
                                        <div class="d-flex justify-content-end align-items-center gap-2 mb-3 flex-wrap filter-bar">
                                                <div class="filter-group">
                                                        <label for="budget_year_filter" class="me-2 fw-semibold">ปีงบประมาณ:</label>
                                                        <select id="budget_year_filter" class="form-select form-select-sm" style="width:120px"></select>

                                                </div>

                                                <!-- ส่วนงาน -->
                                                <div class="filter-group">
                                                        <label for="cost_sys_main_filter" class="me-2 fw-semibold">ส่วนงาน:</label>
                                                        <select id="cost_sys_main_filter"
                                                                class="selectpicker form-control"
                                                                data-style="form-control"
                                                                multiple
                                                                data-live-search="true"
                                                                data-actions-box="true"
                                                                data-width="400px"
                                                                data-dropup-auto="false"
                                                                title="เลือกส่วนงาน">
                                                        </select>
                                                </div>

                                                <!-- แหล่งเงิน -->
                                                <div class="filter-group">
                                                        <label for="multiCheckCombo" style="margin:0px 10px;">แหล่งเงิน:</label>
                                                        <select id="multiCheckCombo"
                                                                class="selectpicker form-control"
                                                                data-style="form-control"
                                                                multiple
                                                                data-live-search="true"
                                                                data-actions-box="true"
                                                                data-width="400px"
                                                                data-dropup-auto="false"
                                                                title="เลือกหมวดงบประมาณ">
                                                        </select>
                                                </div>

                                                <!-- หมวดค่าใช้จ่าย -->
                                                <!-- <div class="filter-group">
                                                        <label class="me-2 fw-semibold">หมวดค่าใช้จ่าย:</label>
                                                        <select id="multiCheckComboExp" class="selectpicker" multiple data-live-search="true"
                                                                data-actions-box="true" data-width="220px" title="เลือกหมวดค่าใช้จ่าย">
                                                        </select>
                                                </div> -->

                                                <!-- Dark Mode -->
                                                <div class="custom-control custom-switch mr-2">
                                                        <input type="checkbox" class="custom-control-input" id="darkToggle">
                                                        <label class="custom-control-label" for="darkToggle"><i class="bi bi-moon-stars"></i> Dark</label>
                                                </div>
                                        </div>
                                </div>

                        </div>
                </div>

                <!-- ===== Charts ===== -->
                <div class="row">
                        <div class="col-lg-8">
                                <div class="card mb-3">
                                        <div class="card-body">
                                                <h6 class="mb-3 font-weight-bold">ภาพรวมรายหมวดงบ (Stacked)</h6>
                                                <div id="bar_bg" class="chart-box tall" style="height:650px; min-height:420px;">
                                                </div>
                                        </div>
                                </div>
                        </div>
                        <div class="col-lg-4">
                                <div class="card mb-3">
                                        <div class="card-body">
                                                <h6 class="mb-3 font-weight-bold">จำนวนงบประมาณที่ถูกจอง</h6>
                                                <div id="pie_tor_type" class="chart-box"></div>
                                        </div>
                                </div>
                                <div class="card mb-3">
                                        <div class="card-body">
                                                <h6 class="mb-2 font-weight-bold">สรุป</h6>
                                                <div id="summaryBox">
                                                        <div class="mb-1"><strong>งบประมาณทั้งหมด:</strong> <span id="kpi-total" class="text-primary">กำลังคำนวณ...</span></div>
                                                        <div class="mb-1"><strong>จองเงิน:</strong> <span id="kpi-booked" class="text-danger">กำลังคำนวณ...</span></div>
                                                        <div class="mb-1"><strong>คงเหลือ:</strong> <span id="kpi-remain" class="text-success">กำลังคำนวณ...</span></div>
                                                </div>
                                        </div>
                                </div>
                        </div>
                </div>

                <!-- ===== Data View ===== -->
                <div class="card">
                        <div class="card-body">
                                <div class="d-flex align-items-center justify-content-between">
                                        <h5 class="mb-3">Data View</h5>
                                        <div class="small text-muted" id="dataViewLegend">
                                                <!-- Legend will be populated by JavaScript -->
                                        </div>
                                </div>
                                <div class="dataview-wrap">
                                        <table id="dvTable" class="table-dv">
                                                <thead>
                                                <tr>
                                                        <th rowspan="3" >ลำดับ</th>
                                                        <th rowspan="3" >รหัสงบประมาณ / หมวดค่าใช้จ่าย</th>
                                                </tr>
                                                <tr id="subHeaderRow">
                                                </tr>
                                                <tr id="subSubHeaderRow">
                                                        <th class="group-income th-income">ที่ใช้ไป(จอง)</th>
                                                        <th class="group-income th-income">ตรวจรับแล้ว</th>
                                                        <th class="group-income th-income">คงเหลือ</th>
                                                        <th class="group-income th-income">%</th>
                                                        </tr>
                                                </thead>
                                                <tbody id="dvBody"></tbody>
                                        </table>
                                </div>
                                </div>
                        </div>
                </div>
        </div>

                <script>
                        (function(){
                                const _open = window.open;
                                window.open = function(url, target, features){
                                        try{
                                                if(typeof url === 'string' && url.indexOf('/supplies/bi/reports/Rep_DetailByTypeV5.php') !== -1){
                                                        url = url.replace('/supplies/bi/reports/Rep_DetailByTypeV5.php', '/procure/bi/reports/Rep_DetailByTypeV5.php');
                                                }
                                        }catch(e){}
                                        return _open.call(window, url, target, features);
                                };
                        })();
                </script>
                <script type="text/javascript" src="../js/Budget_Monitoring_Dashboard_New.js?_dc<?= __VPRODUCT_; ?>"></script>
        <!-- <script>
                if (typeof loadAll === 'function') {
                        loadAll({
                                year_en: 2026
                        }); // ปรับพารามิเตอร์ได้
                }
        </!--> 
        <div id="pageLoader" class="page-loader" style="display:none">
                <div class="spinner"></div>
                <p>กำลังโหลดข้อมูล...</p>
        </div>
</body>

</html>