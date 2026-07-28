<?php
include("../api/List_RepBITorType.php");
include("../../lib/export/exportUtil.php");
$dateJson3 = Get_ChartTorType();

$title = "ตารางสรุปข้อมูลสถานะการดำเนินงาน แต่ละวิธีการดำเนินงาน";
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="shortcut icon" href="../../images/favicon.ico" type="image/x-icon">
    <link rel="icon" href="../../images/favicon.ico" type="image/x-icon">
    <title>Smart Procurement Monitoring</title>

    <!-- Libraries -->
    <script src="../../ws_user/js/jquery.min.js"></script>
    <script src="../../js/echarts/echarts.js"></script>
    <script src="../bootstrap/bootstrap-4.6.2-dist/js/bootstrap.bundle.min.js"></script>
    <script src="../bootstrap/bootstrap-select-1.13.14/dist/js/bootstrap-select.min.js"></script>
    <script src="../lib/xlsx.full.min.js"></script>

    <!-- Styles -->
    <link rel="stylesheet" href="../bootstrap/bootstrap-4.6.2-dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="../bootstrap/bootstrap-select-1.13.14/dist/css/bootstrap-select.min.css">
    <link href="../../css/sarabun.css" rel="stylesheet">
    <link href="../../css/bootstrap-icons.min.css" rel="stylesheet">

    <style>
        :root {
            --bg-color: #f0f2f5;
            --card-bg: rgba(255, 255, 255, 0.85);
            --text-main: #333;
            --primary-color: #4e73df;
        }

        body,
        button,
        input,
        select,
        textarea,
        .btn {
            font-family: 'Sarabun', sans-serif;
        }

        body {
            background-color: var(--bg-color);
            color: var(--text-main);
            transition: background-color 0.3s, color 0.3s;
        }

        /* Glassmorphism Card */
        .glass-card {
            background: var(--card-bg);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .glass-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.25);
        }

        /* Navbar */
        .navbar-custom {
            background-color: #ffffff;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            padding: 10px 20px;
            border-radius: 0 0 16px 16px;
            margin-bottom: 20px;
        }

        .filter-bar {
            background-color: #ffffff;
            border-radius: 12px;
            padding: 15px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 15px;
            flex-wrap: wrap;
        }

        /* Table Modern */
        .table-modern {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            border-radius: 10px;
            overflow: hidden;
            font-size: 0.95rem;
        }

        .table-modern thead th {
            padding: 12px 8px;
            font-weight: 600;
            text-align: center;
            background-color: #1a4f8b;
            /* Blue like dashboard */
            color: #ffffff;
            position: sticky;
            top: 0;
            z-index: 100;
            border: 1px solid #143d6e;
        }

        .table-modern tbody tr {
            background-color: rgba(255, 255, 255, 0.6);
            transition: background-color 0.2s;
        }

        .table-modern tbody tr:hover {
            background-color: rgba(255, 255, 255, 0.9);
        }

        .table-modern td {
            padding: 10px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            vertical-align: middle;
        }

        .clickable {
            cursor: pointer;
            color: var(--primary-color);
            font-weight: 600;
            text-decoration: none;
            transition: color 0.2s;
        }

        .clickable:hover {
            color: #224abe;
            text-decoration: underline;
        }

        /* Dark Mode Override */
        body.dark-mode {
            --bg-color: #121212;
            --card-bg: #1e1e1e;
            --text-main: #e0e0e0;
        }

        body.dark-mode .navbar-custom,
        body.dark-mode .filter-bar {
            background-color: #1e1e1e;
            color: #fff;
        }

        body.dark-mode .table-modern thead th {
            background-color: #1a4f8b;
            /* Keep header blue or change to dark? Keeping for consistency */
            color: #fff;
        }

        body.dark-mode .table-modern tbody tr {
            background-color: #252525;
            color: #e0e0e0;
        }

        body.dark-mode .table-modern tbody tr:hover {
            background-color: #333;
        }

        body.dark-mode .clickable {
            color: #90caf9;
        }

        /* Dark Mode Select Picker */
        body.dark-mode .bootstrap-select>.dropdown-toggle {
            background-color: #2c2c2c !important;
            color: #fff !important;
            border-color: #444 !important;
        }

        body.dark-mode .bootstrap-select .dropdown-menu {
            background-color: #2c2c2c;
            border: 1px solid #444;
        }

        body.dark-mode .bootstrap-select .dropdown-menu li a {
            color: #e0e0e0;
        }

        body.dark-mode .bootstrap-select .dropdown-menu li a:hover {
            background-color: #444;
        }

        /* Dark Mode Search Input */
        body.dark-mode .input-group .form-control {
            background-color: #2c2c2c;
            color: #fff;
            border-color: #444;
        }

        body.dark-mode .input-group .input-group-text {
            background-color: #444 !important;
            color: #fff;
            border-color: #444;
        }

        body.dark-mode .input-group .form-control::placeholder {
            color: #bbb;
        }

        /* Loading */
        #loading-overlay {
            display: flex;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(5px);
        }

        body.dark-mode #loading-overlay {
            background: rgba(0, 0, 0, 0.8);
        }

        body.dark-mode #loading-overlay .text-dark {
            color: #fff !important;
        }

        .section-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
    </style>
</head>

<body>
    <!-- Navbar -->
    <div class="container-fluid">
        <div class="navbar-custom d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-3">
                <img src="../../images/logo.png" height="50" alt="Logo">
                <div>
                    <?php
                    $year_th_display = isset($_GET['year_th']) ? $_GET['year_th'] : (date("Y") + 543);
                    ?>
                    <h4 class="mb-0 font-weight-bold">
                        Smart Procurement Monitoring
                        <span class="badge rounded-pill bg-primary" style="font-size: 0.6em; vertical-align: middle; background-color: #0d6efd !important;">ปีงบประมาณ <?php echo $year_th_display; ?></span>
                    </h4>
                    <small class="text-muted">ระบบติดตามสถานะการจัดซื้อจัดจ้าง</small>
                </div>
            </div>
            <div class="d-flex align-items-center">
                <!-- Dark Mode -->
                <div class="custom-control custom-switch mr-3">
                    <input type="checkbox" class="custom-control-input" id="darkToggle">
                    <label class="custom-control-label font-weight-bold" for="darkToggle">Dark Mode</label>
                </div>
                <!-- Export -->
                <button class="btn btn-outline-success btn-sm rounded-pill px-3" id="btnExport" onclick="exportExcel()">
                    <i class="bi bi-file-earmark-spreadsheet"></i> Export Excel
                </button>
            </div>
        </div>
    </div>

    <!-- Filter Bar -->
    <div class="container-fluid">
        <div class="filter-bar">
            <label for="budget_year_filter" class="font-weight-bold mb-0">ปีงบประมาณ:</label>
            <select id="budget_year_filter" class="selectpicker" data-width="auto" data-style="btn-white border">
                <!-- Populated by JS -->
            </select>

            <label for="cost_sys_main_filter" class="font-weight-bold mb-0 ml-3">ส่วนงาน:</label>
            <select id="cost_sys_main_filter" class="selectpicker" data-width="auto" data-live-search="true" data-style="btn-white border">
                <!-- Populated by JS -->
            </select>

            <label for="asset_type_filter" class="font-weight-bold mb-0 ml-3">ประเภทสินทรัพย์:</label>
            <select id="asset_type_filter" class="selectpicker" data-width="auto" data-live-search="true" data-style="btn-white border">
                <option value="all">ทุกประเภท</option>
                <!-- Populated by JS -->
            </select>

            <div class="input-group ml-3" style="width: 300px;">
                <input type="text" id="search_filter" class="form-control" placeholder="ค้นหาชื่อโครงการ, สัญญา, PR">
                <div class="input-group-append">
                    <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
                </div>
            </div>
        </div>
    </div>

    <!-- Content -->
    <div class="container-fluid pb-5">

        <!-- Charts Grid (2x2) -->
        <div class="row mb-4">
            <div class="col-md-6 mb-4">
                <div class="glass-card h-100 p-4">
                    <div class="section-title">
                        <span><i class="bi bi-pie-chart-fill text-primary mr-2"></i> E-Bidding</span>
                    </div>
                    <div id="chart-pie-1" style="height: 300px;"></div>
                </div>
            </div>
            <div class="col-md-6 mb-4">
                <div class="glass-card h-100 p-4">
                    <div class="section-title">
                        <span><i class="bi bi-pie-chart-fill text-info mr-2"></i> วิธีคัดเลือก</span>
                    </div>
                    <div id="chart-pie-2" style="height: 300px;"></div>
                </div>
            </div>
            <div class="col-md-6 mb-4">
                <div class="glass-card h-100 p-4">
                    <div class="section-title">
                        <span><i class="bi bi-pie-chart-fill text-warning mr-2"></i> เฉพาะเจาะจง (< 500k)</span>
                    </div>
                    <div id="chart-pie-3" style="height: 300px;"></div>
                </div>
            </div>
            <div class="col-md-6 mb-4">
                <div class="glass-card h-100 p-4">
                    <div class="section-title">
                        <span><i class="bi bi-pie-chart-fill text-danger mr-2"></i> เฉพาะเจาะจง (> 500k)</span>
                    </div>
                    <div id="chart-pie-4" style="height: 300px;"></div>
                </div>
            </div>
        </div>

        <!-- Table -->
        <div class="glass-card p-4">
            <div class="section-title">
                <span><i class="bi bi-table mr-2 text-dark"></i> ตารางสรุปข้อมูลสถานะการดำเนินงาน</span>
            </div>
            <div class="table-responsive" style="max-height: 600px; overflow-y: auto;">
                <table class="table-modern" id="main-table">
                    <thead>
                        <tr>
                            <th style="width: 50px;">#</th>
                            <th>สถานะ (Status)</th>
                            <th>E-Bidding</th>
                            <th>วิธีคัดเลือก</th>
                            <th>เฉพาะเจาะจง (< 500k)</th>
                            <th>เฉพาะเจาะจง (> 500k)</th>
                            <th>E-Market</th>
                            <th>สรุปรวม</th>
                        </tr>
                    </thead>
                    <tbody id="table-body">
                        <!-- JS Content -->
                    </tbody>
                    <tfoot id="table-foot" class="font-weight-bold bg-light">
                        <!-- JS Content -->
                    </tfoot>
                </table>
            </div>
        </div>

    </div>

    <!-- Loading Overlay -->
    <div id="loading-overlay">
        <div class="text-center" style="width: 300px;">
            <h5 class="mb-3 font-weight-bold text-dark">Processing Data... <span id="loading-pct">0%</span></h5>
            <div class="progress shadow-sm" style="height: 20px; border-radius: 10px; background-color: rgba(0,0,0,0.1);">
                <div id="loading-bar" class="progress-bar progress-bar-striped progress-bar-animated bg-primary" role="progressbar" style="width: 0%;"></div>
            </div>
        </div>
    </div>

    <!-- Detail Modal -->
    <div class="modal fade" id="detailModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-xl" style="max-width: 95%;">
            <div class="modal-content glass-card">
                <div class="modal-header border-0">
                    <h5 class="modal-title font-weight-bold" id="detailModalLabel">
                        <i class="bi bi-list-ul mr-2 text-primary"></i> รายละเอียดข้อมูล
                    </h5>
                    <div class="ml-auto">
                        <button class="btn btn-outline-success btn-sm rounded-pill mr-2" id="btnExportDetail">
                            <i class="bi bi-file-earmark-spreadsheet"></i> Export Excel
                        </button>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                </div>
                <div class="modal-body p-0">
                    <div id="detailContent" class="p-4" style="overflow-y: auto; max-height: 80vh;">
                        <!-- JS Rendered Table -->
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Data Injection -->
    <script>
        var INJECTED_DATA = <?php echo $dateJson3; ?>;
        var PHP_YEAR_TH = <?php echo isset($_GET['year_th']) ? $_GET['year_th'] : (date("Y") + 543); ?>;
    </script>
    <script src="../js/Report_ChartTorType_New.js?v=<?php echo time(); ?>"></script>
</body>

</html>