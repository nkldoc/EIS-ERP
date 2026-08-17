<?php
// ===== Budget Dashboard Demo (PHP, with Data View colored by fund) =====

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if (!defined('COMPANY_NAME')) define('COMPANY_NAME', 'EIS');
if (!defined('__VPRODUCT_')) define('__VPRODUCT_', time());

if (isset($_GET['action']) && $_GET['action'] === 'data') {
        header('Content-Type: application/json; charset=utf-8');
        $rowsBudget = isset($rowsBudget) ? $rowsBudget : [];
        $rowsStatus = isset($rowsStatus) ? $rowsStatus : [];
        echo json_encode(['budget' => $rowsBudget, 'status' => $rowsStatus, 'year_th_default' => 2568], JSON_UNESCAPED_UNICODE);
        exit;
}
?>
<!DOCTYPE html>
<html lang="th">

<head>

        
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" href="../../images/favicon.ico" type="image/x-icon">
        <link rel="icon" href="../../images/favicon.ico" type="image/x-icon">
        <title>งบประมาณ - Dashboard + Data View</title>
                <?php
                function _include_any($fileName)
                {
                        $candidates = [
                                __DIR__ . '/../lib/' . $fileName,
                                __DIR__ . '/../../lib/' . $fileName,
                                (isset($_SERVER['DOCUMENT_ROOT']) ? rtrim($_SERVER['DOCUMENT_ROOT'], DIRECTORY_SEPARATOR) . '/supplies/bi/lib/' . $fileName : ''),
                                __DIR__ . '/../../../src/main/webapp/lib/' . $fileName,
                        ];
                        foreach ($candidates as $f) {
                                if ($f && file_exists($f)) {
                                        include_once $f;
                                        return true;
                                }
                        }
                        return false;
                }

                _include_any('loadJs.php');
                _include_any('loadCss.php');
                ?>
        <script src="../../ws_user/js/jquery.min.js"></script>
        <script src="../../js/echarts/echarts.js"></script>
        <script src="../bootstrap/bootstrap-4.6.2-dist/js/bootstrap.bundle.min.js"></script>
        <script src="../bootstrap/bootstrap-select-1.13.14/dist/js/bootstrap-select.min.js"></script>
        <script src="../../js/echarts/macarons.js"></script>
        <script src="../lib/xlsx.full.min.js"></script>
        <script src="../js/ExportReserveSummary.js"></script>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title><?php echo COMPANY_NAME; ?></title>

        <link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
        <link rel="stylesheet" type="text/css" href="../css/report-style.css">
        <link rel="stylesheet" type="text/css" href="../bootstrap/bootstrap-4.6.2-dist/css/bootstrap.min.css">
        <link rel="stylesheet" type="text/css" href="../bootstrap/bootstrap-select-1.13.14/dist/css/bootstrap-select.min.css">
        <link rel="stylesheet" type="text/css" href="../css/report-style-biType.css">

        <script type="text/javascript" src="../js/storeRep/storeRep.js?_dc<?= __VPRODUCT_; ?>"></script>

        <!-- ========== [เพิ่ม] CSS สำหรับ PR/PO Section ========== -->
        <style>
        #prpo-section .card {
                border: 1px solid rgba(0,0,0,.125);
        }
        #prpoSummaryCards .row {
                margin: 0 -4px;
        }
        #prpoSummaryCards .col-6,
        #prpoSummaryCards .col-12 {
                padding: 0 4px 8px;
        }
        #prpoSummaryCards .border {
                transition: box-shadow .15s;
        }
        #prpoSummaryCards .border:hover {
                box-shadow: 0 2px 8px rgba(0,0,0,.15);
        }
        body.dark-mode #prpoSummaryCards .bg-light {
                background-color: #2d2d2d !important;
        }
        body.dark-mode #prpoSummaryCards [style*="background:#fff3cd"] {
                background: #4a3800 !important;
        }
        body.dark-mode #prpoSummaryCards [style*="background:#f8d7da"] {
                background: #4a1515 !important;
        }
        body.dark-mode #prpoSummaryCards [style*="background:#d4edda"] {
                background: #0d3320 !important;
        }
        </style>

        <!-- ========== [เพิ่ม] CSS สำหรับ Donut สัดส่วนงบตามแหล่งเงิน ========== -->
        <style>
        #donut_source { height: 300px; margin-bottom: 6px; }
        #donut_source.donut-source-lg { height: 420px; }
        .donut-source-wrap { position: relative; }
        .donut-center-text {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                pointer-events: none;
                width: 62%;
        }
        .donut-center-label { font-size: 12px; color: #6c757d; }
        .donut-center-value { font-size: 17px; font-weight: 700; color: #1f2937; margin: 2px 0; line-height: 1.25; word-break: break-word; }
        .donut-center-unit { font-size: 12px; color: #6c757d; }
        body.dark-mode .donut-center-label,
        body.dark-mode .donut-center-unit { color: #adb5bd; }
        body.dark-mode .donut-center-value { color: #f1f3f5; }
        .donut-center-note { text-align:center; font-size:11px; color:#888; margin-bottom:12px; }
        .donut-cards-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 10px;
                margin-bottom: 16px;
        }
        .donut-cards-grid-lg { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
        .donut-card {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 10px 12px;
                cursor: pointer;
                border: 1px solid transparent;
                transition: box-shadow .15s, border-color .15s;
        }
        .donut-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,.12); }
        .donut-card.selected { border-width: 1px; }
        .donut-card-all { background: #eceff1; }
        body.dark-mode .donut-card-all { background: #26292c; }
        .donut-dot { display:inline-block; width:9px; height:9px; border-radius:2px; margin-right:6px; }
        .donut-card-name { display:flex; align-items:center; font-size:12px; color:#6c757d; }
        .donut-card-total { font-size:15px; font-weight:600; margin-top:4px; }
        .donut-card-sub { font-size:11px; color:#8a8f98; margin-top:2px; }
        .donut-detail-title { font-size:13px; font-weight:600; margin-bottom:6px; }
        .donut-detail-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 8px;
        }
        .donut-stat {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 8px 10px;
        }
        .donut-stat-label { font-size:11px; color:#6c757d; }
        .donut-stat-val { font-size:14px; font-weight:600; margin-top:2px; }

        body.dark-mode .donut-card,
        body.dark-mode .donut-stat { background:#2d2d2d; }
        body.dark-mode .donut-card-name,
        body.dark-mode .donut-stat-label { color:#adb5bd; }
        body.dark-mode .donut-card-sub { color:#8a8f98; }
        body.dark-mode .donut-center-note { color:#9aa0a6; }
        </style>
        <!-- ========== [/เพิ่ม] ========== -->
        <!-- ========== [/เพิ่ม] ========== -->

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
                                                <span class="badge mr-1" style="background:#6f42c1;color:#fff;">เงินจองตรวจรับ</span>
                                                <span class="badge badge-danger">คงเหลือหลังจองเงิน</span>
                                                <span class="badge badge-danger"> % </span>
                                        </div>
                                </div>

                                <div class="filter-bar mb-3">
                                        
                                        <div class="d-flex justify-content-end align-items-center gap-2 mb-3 flex-wrap filter-bar">
                                                <div class="filter-group">
                                                        <label for="budget_year_filter" class="me-2 fw-semibold">ปีงบประมาณ:</label>
                                                        <select id="budget_year_filter" class="form-select form-select-sm" style="width:120px"></select>
                                                </div>

                                                <!-- [Comment] ปิดการใช้งาน dropdown filter "แหล่งเงิน" (multiCheckCombo) ตามที่ผู้ใช้ระบุ
                                                     เพราะตอนนี้เลือกแหล่งเงินผ่านการ์ด/วงกลมโดนัทแทนแล้ว
                                                     คง <select id="multiCheckCombo"> ไว้ในโค้ด (comment ไว้) เผื่อจะเปิดกลับมาใช้ภายหลัง
                                                     หมายเหตุ: ฝั่ง JS อ้างอิง element นี้แบบ defensive ($("#multiCheckCombo")) อยู่แล้ว
                                                     ถ้าไม่มี element นี้ในหน้า โค้ดจะ fallback ไปใช้ "รวมทุกแหล่งเงินหลัก" ตามปกติ ไม่ error
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
                                                -->

                                                <div class="custom-control custom-switch mr-2">
                                                        <input type="checkbox" class="custom-control-input" id="darkToggle">
                                                        <label class="custom-control-label" for="darkToggle"><i class="bi bi-moon-stars"></i> Dark</label>
                                                </div>
                                                <button id="btnExportReserve"
        class="btn btn-warning btn-sm rounded-pill px-3"
        onclick="exportReserveSummary()">
    📊 Export จองเงิน/ใช้ไปแล้ว
</button>
                                        </div>
                                </div>

                        </div>
                </div>

                <!-- ===== Charts ===== -->
                <div class="row">
                        <div class="col-12">
                                <!-- ========== [เพิ่ม] Donut สัดส่วนงบตามแหล่งเงิน (ย้ายมาไว้ตรงกลาง เต็มความกว้าง) ========== -->
                                <div class="card mb-3">
                                        <div class="card-body">
                                                <h6 class="mb-3 font-weight-bold">สัดส่วนงบตามแหล่งเงิน</h6>
                                                <div class="donut-source-wrap">
                                                        <div id="donut_source" class="donut-source-lg"></div>
                                                        <div class="donut-center-text">
                                                                <div class="donut-center-label">งบรวม</div>
                                                                <div class="donut-center-value" id="donutCenterValue">-</div>
                                                                <div class="donut-center-unit">บาท</div>
                                                        </div>
                                                </div>
                                                <div class="donut-center-note">คลิกส่วนวงกลม หรือคลิกการ์ดด้านล่าง เพื่อเลือกแหล่งเงิน</div>
                                                <div id="donutCards" class="donut-cards-grid donut-cards-grid-lg"></div>
                                                <div class="donut-detail-title" id="donutDetailTitle">รายละเอียดของ รวมทุกแหล่งเงิน</div>
                                                <div id="donutDetailStats" class="donut-detail-grid"></div>
                                        </div>
                                </div>
                                <!-- ========== [/เพิ่ม] ========== -->
                        </div>
                </div>

                <!-- ========== [เพิ่ม] PR/PO Section ========== -->
                <div class="row mt-3" id="prpo-section">
                        <!-- กราฟแท่ง PR vs PO แยกตามหมวดค่าใช้จ่าย -->
                        <div class="col-lg-8">
                                <div class="card mb-3">
                                        <div class="card-body">
                                                <div class="d-flex align-items-center justify-content-between mb-3">
                                                        <h6 class="mb-0 font-weight-bold">
                                                                สถานะการจองเงิน: PR และ PO แยกตามหมวดค่าใช้จ่าย
                                                                <span id="prpoDonutFilterBadge" class="badge badge-pill" style="display:none;background:#495057;color:#fff;font-weight:500;margin-left:6px;"></span>
                                                        </h6>
                                                        <div class="small text-muted">
                                                                <span style="display:inline-block;width:12px;height:12px;background:#f39c12;border-radius:2px;margin-right:4px;"></span>จอง PR (ยังไม่มี PO)
                                                                &nbsp;
                                                                <span style="display:inline-block;width:12px;height:12px;background:#e74c3c;border-radius:2px;margin-right:4px;"></span>สัญญา PO
                                                        </div>
                                                </div>
                                                <div class="small text-muted mb-2">
                                                        คลิกที่แท่งกราฟเพื่อดูรายการ PR/PO ละเอียด
                                                </div>
                                                <div id="chart_prpo_bar" style="height:520px; min-height:340px;"></div>
                                        </div>
                                </div>
                        </div>

                        <!-- การ์ดสรุป + Pie chart -->
                        <div class="col-lg-4">
                                <div class="card mb-3">
                                        <div class="card-body">
                                                <h6 class="mb-3 font-weight-bold">สรุป PR / PO</h6>
                                                <div id="prpoSummaryCards">
                                                        <p class="text-muted small">กำลังโหลด...</p>
                                                </div>
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
                <!-- ========== [/เพิ่ม] ========== -->

                <!-- ===== Data View ===== -->
                <div class="card">
                        <div class="card-body">
                                <div class="d-flex align-items-center justify-content-between">
                                        <h5 class="mb-3">Data View</h5>
                                        <div class="small text-muted"></div>
                                </div>
                                <div class="dv-wrapper">
                                        <table id="dvTable" class="table-dv-main">
                                                <thead>
                                                <tr>
                                                        <th rowspan="2">ลำดับ</th>
                                                        <th rowspan="2">รหัสงบประมาณ / หมวดค่าใช้จ่าย</th>
                                                        <th class="group-income" colspan="6">รายได้ส่วนงาน</th>
                                                        <th class="group-bkk" colspan="6">อุดหนุนกรุงเทพมหานคร</th>
                                                        <th class="group-gov" colspan="6">อุดหนุนรัฐบาล</th>
                                                        <th class="group-Savings" colspan="6">สะสมสวนงาน</th>
                                                </tr>
                                                <tr>
                                                        <th class="group-income">งบประมาณ</th>
                                                        <th class="group-income">เงินจองงบประมาณ<br>ตามบัญชีจัดสรร</th>
                                                        <th class="group-income">เงินจองตรวจรับ</th>
                                                        <th class="group-income">เบิกจ่ายแล้ว</th>
                                                        <th class="group-income">คงเหลือ</th>
                                                        <th class="group-income">%</th>

                                                        <th class="group-bkk">งบประมาณ</th>
                                                        <th class="group-bkk">เงินจองงบประมาณ<br>ตามบัญชีจัดสรร</th>
                                                        <th class="group-bkk">เงินจองตรวจรับ</th>
                                                        <th class="group-bkk">เบิกจ่ายแล้ว</th>
                                                        <th class="group-bkk">คงเหลือ</th>
                                                        <th class="group-bkk">%</th>

                                                        <th class="group-gov">งบประมาณ</th>
                                                        <th class="group-gov">เงินจองงบประมาณ<br>ตามบัญชีจัดสรร</th>
                                                        <th class="group-gov">เงินจองตรวจรับ</th>
                                                        <th class="group-gov">เบิกจ่ายแล้ว</th>
                                                        <th class="group-gov">คงเหลือ</th>
                                                        <th class="group-gov">%</th>

                                                        <th class="group-Savings">งบประมาณ</th>
                                                        <th class="group-Savings">เงินจองงบประมาณ<br>ตามบัญชีจัดสรร</th>
                                                        <th class="group-Savings">เงินจองตรวจรับ</th>
                                                        <th class="group-Savings">เบิกจ่ายแล้ว</th>
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
        <!-- ========== [เพิ่ม] script PR/PO ========== -->
        <script type="text/javascript" src="../js/PrPoChartSection.js?_dc<?= __VPRODUCT_; ?>"></script>
        <!-- ========== [/เพิ่ม] ========== -->

        <script>
                if (typeof loadAll === 'function') {
                        loadAll({
                                year_en: 2026
                        });
                }
        </script>
        <div id="pageLoader" class="page-loader" style="display:none">
                <div class="spinner"></div>
                <p>กำลังโหลดข้อมูล...</p>
        </div>
</body>

</html>