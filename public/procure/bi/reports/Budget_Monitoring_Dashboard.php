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
        <?php include("../lib/loadJs.php"); ?>
        <?php include("../lib/loadCss.php"); ?>
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


        <script type="text/javascript" src="../js/storeRep/storeRep.js?_dc<?= __VPRODUCT_; ?>"></script>

</head>

<body>
        <div class="container-fluid pt-3 pb-5">
                <div class="text-center mb-3">
                        <img src="../../images/logo_eis2.png" alt="logo" class="report-logo" style="height: 150px; width: auto;">
                </div>
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

                                                <!-- แหล่งเงิน -->
                                                <div class="filter-group">
                                                        <label for="cost_sys_main_filter">ส่วนงาน:</label>
                                                        <select id="cost_sys_main_filter"
                                                                class="selectpicker"
                                                                data-style="form-control"
                                                                multiple
                                                                data-live-search="true"
                                                                data-actions-box="true"
                                                                data-width="400px"
                                                                data-dropup-auto="false"
                                                                title="เลือกส่วนงาน">
                                                        </select>
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
                                                <div id="summaryBox" class="small text-muted">กำลังคำนวณ...</div>
                                        </div>
                                </div>
                        </div>
                </div>
<!-- tt -->
                <!-- ===== Data View ===== -->
                <div class="card">
                        <div class="card-body">
                                <div class="d-flex align-items-center justify-content-between">
                                        <h5 class="mb-3">Data View</h5>
                                        <div class="small text-muted">
                                                <!-- <span class="legend-dot legend-income"></span>รายได้ส่วนงาน
                                                <span class="legend-dot legend-bkk ml-3"></span>อุดหนุนกทม.
                                                <span class="legend-dot legend-gov ml-3"></span>อุดหนุนรัฐบาล
                                                <span class="legend-dot legend-Savings"></span>รายได้ -->
                                        </div>
                                </div>
                                <div class="dv-wrapper">
                                        <table id="dvTable" class="table-dv-main">
                                                <thead>
                                                        <tr>
                                                                <th rowspan="2">ลำดับ</th>
                                                                <th rowspan="2">รหัสงบประมาณ / หมวดค่าใช้จ่าย</th>
                                                                <th class="group-income" colspan="4">รายได้ส่วนงาน</th>
                                                                <th class="group-bkk" colspan="4">อุดหนุนกรุงเทพมหานคร</th>
                                                                <th class="group-gov" colspan="4">อุดหนุนรัฐบาล</th>
                                                                <th class="group-Savings" colspan="4">สะสมสวนงาน</th>
                                                        </tr>
                                                        <tr>
                                                                <th class="group-income">งบประมาณ</th>
                                                                <th class="group-income">ใช้ไป (PR/PO)</th>
                                                                <th class="group-income">คงเหลือ</th>
                                                                <th class="group-income">%</th>

                                                                <th class="group-bkk">งบประมาณ</th>
                                                                <th class="group-bkk">ใช้ไป (PR/PO)</th>
                                                                <th class="group-bkk">คงเหลือ</th>
                                                                <th class="group-bkk">%</th>

                                                                <th class="group-gov">งบประมาณ</th>
                                                                <th class="group-gov">ใช้ไป (PR/PO)</th>
                                                                <th class="group-gov">คงเหลือ</th>
                                                                <th class="group-gov">%</th>

                                                                <th class="group-Savings">งบประมาณ</th>
                                                                <th class="group-Savings">ใช้ไป (PR/PO)</th>
                                                                <th class="group-Savings">คงเหลือ</th>
                                                                <th class="group-Savings">%</th>

                                                        </tr>
                                                </thead>
                                                <tbody id="dvBody"></tbody>
                                        </table>
                                </div>
                        </div>
                </div>
        </div>

        <script type="text/javascript" src="../js/Budget_Monitoring_Dashboard.js?_dc<?= __VPRODUCT_; ?>"></script>
        <script>
                if (typeof loadAll === 'function') {
                        loadAll({
                                year_en: 2026
                        }); // ปรับพารามิเตอร์ได้
                }
        </script>
        <div id="loading-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.9); z-index:9999; justify-content:center; align-items:center; flex-direction:column;">
                <h5 style="margin-bottom:15px; color:#333; font-weight:600;">กำลังโหลดข้อมูล... <span id="loading-pct">0%</span></h5>
                <div style="width:300px; height:20px; background:#e0e0e0; border-radius:10px; overflow:hidden; box-shadow:inset 0 1px 3px rgba(0,0,0,0.2);">
                        <div id="loading-bar" style="width:0%; height:100%; background:linear-gradient(45deg, #1d4cd6, #40b0ff); transition:width 0.3s ease; box-shadow: 0 0 10px rgba(33, 150, 243, 0.5);"></div>
                </div>
        </div>
</body>

</html>