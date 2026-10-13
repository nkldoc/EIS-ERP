<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="shortcut icon" href="../images/favicon.ico" type="image/x-icon">
    <link rel="icon" href="../images/favicon.ico" type="image/x-icon">
    <title>รายงานรายการพัสดุ (CheckList)</title>
    <!-- FontAwesome for Icons -->
    <link rel="stylesheet" href="../sp/dboard/assets/plugins/fontawesome/css/all.min.css">

    <?php
    // session_start();
    include("../conf/config.php");

    // 1. Session Check
    if (empty($_SESSION['dc_cost_id'])) {
        header("Location: https://eis.vajira.ac.th/NMU_permission");
        exit;
    }

    // 2. Authorization Logic
    $dc_cost_id = $_SESSION['dc_cost_id'];
    // Admins are 38 or 3
    $isAdmin = in_array($dc_cost_id, [38, 3]);

    // Pass PHP vars to JS
    ?>
    <script>
        const USER_COST_ID = <?php echo json_encode($dc_cost_id); ?>;
        const IS_ADMIN = <?php echo json_encode($isAdmin); ?>;
    </script>

    <!-- Essential JS -->
    <script src="../ws_user/js/jquery.min.js"></script>
    <script src="../js/echarts/echarts.js"></script>
    <script src="bootstrap/bootstrap-4.6.2-dist/js/bootstrap.bundle.min.js"></script>
    <script src="bootstrap/bootstrap-select-1.13.14/dist/js/bootstrap-select.min.js"></script>

    <!-- Essential CSS -->
    <link rel="stylesheet" type="text/css" href="../css/report_css.css" />
    <link rel="stylesheet" type="text/css" href="css/report-style.css">
    <link rel="stylesheet" type="text/css" href="bootstrap/bootstrap-4.6.2-dist/css/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="bootstrap/bootstrap-select-1.13.14/dist/css/bootstrap-select.min.css">

    <style>
        body {
            background-color: #f8f9fa;
            font-family: 'Sarabun', sans-serif;
            font-size: 0.9rem;
            /* Compact font */
        }

        .card-custom {
            border: none;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            margin-bottom: 20px;
            background: #fff;
            transition: 0.3s;
            border-top: 4px solid #46a8de;
            /* Blue top border from reference */
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

        .chart-header {
            font-weight: bold;
            border-bottom: 2px solid #46a8de;
            padding-bottom: 10px;
            margin-bottom: 15px;
            font-size: 1.1rem;
            color: #2c3e50;
        }

        /* --- Table Styling --- */
        .table-custom {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.85rem;
            /* Smaller text for dense info */
        }

        .table-custom thead th {
            background-color: #343a40;
            /* Dark header match reference */
            color: #fff;
            text-align: center;
            border: 1px solid #454d55;
            padding: 10px 5px;
            position: sticky;
            top: 0;
            z-index: 10;
            white-space: nowrap;
            font-weight: 500;
        }

        .table-custom tbody tr:nth-of-type(even) {
            background-color: #f1f8e9;
            /* Light green striping */
        }

        .table-custom tbody td {
            border: 1px solid #dee2e6;
            padding: 6px 4px;
            vertical-align: middle;
            color: #333;
        }

        /* Specific Column Styles */
        .col-pr-code {
            color: #000;
            font-weight: 600;
            white-space: nowrap;
        }

        .col-topic {
            min-width: 250px;
        }

        .col-status {
            text-align: center;
        }

        .col-money {
            text-align: right;
            font-family: 'Consolas', monospace;
            color: #28a745;
            font-weight: bold;
        }

        /* Icons */
        .icon-pr {
            color: #28a745;
            margin-right: 4px;
        }

        .icon-doc {
            color: #dc3545;
            cursor: pointer;
        }

        /* Loading Overlay */
        #fullPageLoading {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        }

        .loading-text {
            margin-bottom: 15px;
            font-weight: 600;
            color: #46a8de;
            font-size: 1.2rem;
        }

        .progress-bar-custom {
            width: 300px;
            height: 10px;
            background-color: #e9ecef;
            border-radius: 5px;
            overflow: hidden;
        }

        .progress-bar-fill {
            height: 100%;
            background-color: #0d6efd;
            width: 0%;
            transition: width 0.3s ease;
            animation: progressIndeterminate 1.5s infinite linear;
        }

        @keyframes progressIndeterminate {
            0% {
                width: 0%;
                margin-left: 0%;
            }

            50% {
                width: 50%;
                margin-left: 25%;
            }

            100% {
                width: 100%;
                margin-left: 100%;
            }
        }

        .stats-number-big {
            font-size: 2.5rem;
            font-weight: bold;
            color: #0d6efd;
            line-height: 1.1;
        }

        /* Local chart loading */
        .chart-loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 5;
        }

        /* Truncate text */
        .text-truncate-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    </style>
</head>

<body>
    <!-- Full Page Loading Screen -->
    <div id="fullPageLoading">
        <div class="loading-text" id="loadingText">Processing Data...</div>
        <div class="progress-bar-custom">
            <div class="progress-bar-fill"></div>
        </div>
    </div>

    <!-- Status Detail Modal -->
    <div class="modal fade" id="statusDetailModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title" id="statusModalTitle">รายละเอียด</h5>
                    <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body" id="statusModalBody">
                    <!-- Content populated by JS -->
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">ปิด</button>
                </div>
            </div>
        </div>
    </div>

    <div class="container-fluid pt-3 pb-5">
        <div class="text-center mb-3">
            <img src="../images/logo.png" alt="logo" class="report-logo" style="height: 120px; width: auto;">
        </div>

        <!-- Header Section -->
        <div class="card-custom p-3">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="font-weight-bold m-0 text-primary"><i class="fas fa-list-alt"></i> รายงานรายการพัสดุ (CheckList)</h5>
                <small class="text-muted">ข้อมูลปีงบประมาณ <span id="displayYear" class="badge badge-info">...</span></small>
            </div>

            <div class="row">
                <!-- Year Filter -->
                <div class="col-lg-3 col-md-4 mb-2">
                    <div class="info-box">
                        <div class="info-label">ปีงบประมาณ</div>
                        <select id="filterYear" class="selectpicker form-control" data-style="btn-outline-primary" title="เลือกปี"></select>
                    </div>
                </div>

                <!-- Filters Group -->
                <div class="col-lg-9 col-md-8 mb-2">
                    <div class="info-box">
                        <div class="info-label">ตัวกรองข้อมูล</div>
                        <div class="form-row">
                            <div class="col-md-4 mb-2">
                                <select class="form-control" id="filterUnit">
                                    <option value="">- หน่วยงานเจ้าของเรื่อง -</option>
                                    <!-- JS Populated -->
                                </select>
                            </div>
                            <div class="col-md-3 mb-2">
                                <select class="form-control" id="filterStatus">
                                    <option value="">- สถานะ (ทั้งหมด) -</option>
                                    <option value="8">รอดำเนินการ</option>
                                    <option value="9">อยู่ระหว่างดำเนินการ</option>
                                    <option value="10">บริหารสัญญา</option>
                                    <option value="11">ตรวจรับพัสดุ</option>
                                    <option value="12">ขออนุมัติเบิกจ่ายเงิน</option>
                                    <option value="13">เบิกจ่ายเงินแล้ว</option>
                                    <option value="15">ยกเลิก</option>
                                    <option value="0">อื่นๆ</option>
                                </select>
                            </div>
                            <div class="col-md-3 mb-2">
                                <input type="text" class="form-control" id="searchInput" placeholder="ค้นหา (เลขที่, ชื่อ...)">
                            </div>
                            <div class="col-md-2 mb-2">
                                <button class="btn btn-primary btn-block" onclick="loadData()"><i class="fa fa-search"></i> ค้นหา</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Section 1: Chart -->
        <div class="card-custom">
            <div class="card-body">
                <div class="chart-header">ส่วนที่ 1: ภาพรวมสัดส่วนสถานะการจ่ายงาน</div>
                <div class="row align-items-center">
                    <div class="col-lg-8 position-relative" style="min-height: 400px;">
                        <div id="assignmentChart" style="height: 400px; width: 100%;"></div>
                        <div id="chartLoading" class="chart-loading-overlay" style="display:none;">
                            <div class="spinner-border text-primary" role="status"></div>
                        </div>
                    </div>
                    <div class="col-lg-4">
                        <div class="info-box bg-light text-center border-0">
                            <h6 class="text-muted mb-4">สรุปจำนวนรายการ</h6>

                            <div class="mb-4">
                                <h1 class="stats-number-big text-primary" id="countFiltered">0</h1>
                                <small class="text-muted">รายการที่แสดง</small>
                            </div>

                            <div class="border-top pt-4">
                                <h2 class="font-weight-bold text-secondary" id="countTotal">0</h2>
                                <small class="text-muted">รายการทั้งหมดในปีงบฯ</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Section 2: Table -->
        <div class="card-custom">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="chart-header m-0 border-0 p-0">ส่วนที่ 2: รายละเอียดรายการพัสดุ</div>
                    <span class="badge badge-secondary p-2">ทั้งหมด <span id="totalCount">0</span> รายการ</span>
                </div>

                <div class="table-responsive" style="max-height: 800px; overflow-y: auto;">
                    <table class="table-custom table-hover" id="mainTable">
                        <thead>
                            <tr>
                                <th width="3%">#</th>
                                <th width="10%">รหัส PR</th>
                                <th width="20%">เรื่อง/โครงการ</th>
                                <th width="5%">เอกสาร PR</th>
                                <th width="10%">สถานะ</th>
                                <th width="10%">ประเภทความก้าวหน้า</th>
                                <th width="10%">ความก้าวหน้าล่าสุด</th>
                                <th width="10%">ผู้รับผิดชอบงาน</th>
                                <th width="10%">หน่วยงานเจ้าของเรื่อง</th>
                                <th width="8%">หน่วยงานย่อย</th>
                                <!-- <th width="5%">สายงาน</th> -->
                                <th width="8%">วันที่ KPI</th>
                                <th width="5%">เลขที่ Eqp</th>
                                <th width="8%">ราคากลาง</th>
                                <th width="8%">จำนวนเงิน</th>
                            </tr>
                        </thead>
                        <tbody id="tableBody">
                            <!-- Data populated by JS -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    </div>

    <script>
        // Configuration
        const API_URL = '../sp/tor/api/mnTorCheckList.php';

        const THAI_MONTHS = [
            "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
            "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
        ];

        function formatThaiDate(dateStr) {
            if (!dateStr || dateStr === '-') return '-';
            // Check checks for "DD-MM-YYYY" (Buddhist) or "YYYY-MM-DD"
            let parts = dateStr.split(/[-/]/);
            let d, m, y;

            if (parts.length === 3) {
                if (parts[0].length === 4) {
                    // YYYY-MM-DD
                    y = parseInt(parts[0]);
                    m = parseInt(parts[1]);
                    d = parseInt(parts[2]);
                    if (y < 2400) y += 543; // Convert to BE if needed
                } else {
                    // DD-MM-YYYY
                    d = parseInt(parts[0]);
                    m = parseInt(parts[1]);
                    y = parseInt(parts[2]);
                }

                if (m >= 1 && m <= 12) {
                    return `${d} ${THAI_MONTHS[m - 1]} ${y}`;
                }
            }
            return dateStr;
        }
        const OPTIONS_API_URL = 'api/get_options.php';
        let chartInstance = null;
        let allData = []; // Store all fetched data

        // Status IDs for Grouping
        // Status IDs Mapping
        const STATUS_MAP = {
            8: {
                name: 'รอดำเนินการ',
                color: '#ffc107',
                class: 'badge-warning'
            },
            9: {
                name: 'อยู่ระหว่างดำเนินการ',
                color: '#17a2b8',
                class: 'badge-info'
            },
            10: {
                name: 'บริหารสัญญา',
                color: '#28a745',
                class: 'badge-success'
            },
            11: {
                name: 'ตรวจรับพัสดุ',
                color: '#6610f2',
                class: 'badge-primary'
            },
            12: {
                name: 'ขออนุมัติเบิกจ่ายเงิน',
                color: '#fd7e14',
                class: 'badge-warning'
            },
            13: {
                name: 'เบิกจ่ายเงินแล้ว',
                color: '#20c997',
                class: 'badge-success'
            },
            15: {
                name: 'ยกเลิก',
                color: '#6c757d',
                class: 'badge-secondary'
            },
            0: {
                name: 'อื่นๆ',
                color: '#858796',
                class: 'badge-secondary'
            }
        };

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            initYearFilter();
            // Try loading options; if selectpicker fails initially, we might need to re-init it after options load
            loadOptions();

            // Allow a small delay for UI to render loading before fetching
            setTimeout(() => {
                loadData();
            }, 100);

            // Event Listeners for Client-Side Filtering
            document.getElementById('filterUnit').addEventListener('change', filterData);
            document.getElementById('filterStatus').addEventListener('change', filterData);
            document.getElementById('searchInput').addEventListener('keyup', filterData);
            document.getElementById('filterYear').addEventListener('change', loadData);

            // Resize Chart
            window.addEventListener('resize', () => {
                if (chartInstance) chartInstance.resize();
            });
        });

        function initYearFilter() {
            const yearSelect = document.getElementById('filterYear');

            // Calculate Fiscal Year (Thai Budget Year)
            // Starts Oct 1. If today is Oct-Dec, Budget Year is next year.
            const d = new Date();
            let fiscalYear = d.getFullYear() + 543;
            if (d.getMonth() >= 9) { // Month is 0-indexed (9 = Oct)
                fiscalYear += 1;
            }

            // Create options for 5 years back from Fiscal Year
            for (let i = 0; i < 5; i++) {
                const y = fiscalYear - i;
                const opt = document.createElement('option');
                opt.value = y;
                opt.text = `ปีงบประมาณ ${y}`;
                if (i === 0) opt.selected = true;
                yearSelect.appendChild(opt);
            }

            // Re-initialize selectpicker if available
            if (typeof $.fn.selectpicker === 'function') {
                $('#filterYear').selectpicker('refresh');
                // Ensure the value is set for the first load
                $('#filterYear').selectpicker('val', fiscalYear);
            }
        }

        async function loadOptions() {
            try {
                // Load Units via API
                const resUnit = await fetch(`${OPTIONS_API_URL}?type=dc_cost`);
                const jsonUnit = await resUnit.json();
                const unitSelect = document.getElementById('filterUnit');

                // Clear existing (except first)
                unitSelect.innerHTML = '<option value="">- หน่วยงานเจ้าของเรื่อง -</option>';

                if (jsonUnit.data) {
                    if (IS_ADMIN) {
                        // Admin: Show All
                        jsonUnit.data.forEach(item => {
                            const opt = document.createElement('option');
                            opt.value = item.id;
                            opt.text = item.name;
                            unitSelect.appendChild(opt);
                        });
                    } else {
                        // User: Show Only Own Unit
                        // Find matching unit
                        const myUnit = jsonUnit.data.find(item => item.id == USER_COST_ID);
                        if (myUnit) {
                            const opt = document.createElement('option');
                            opt.value = myUnit.id;
                            opt.text = myUnit.name;
                            opt.selected = true; // Pre-select
                            unitSelect.appendChild(opt);
                        }
                    }
                }
            } catch (e) {
                console.error("Error loading options", e);
            }
        }

        async function loadData() {
            // Show Local Loading (if not first load, full page might be hidden)
            const fullPage = document.getElementById('fullPageLoading');
            const isFullPageVisible = fullPage.style.display !== 'none';

            if (!isFullPageVisible) {
                document.getElementById('chartLoading').style.display = 'flex';
            }

            document.getElementById('tableBody').innerHTML = '<tr><td colspan="15" class="text-center p-3">กำลังโหลดข้อมูล...</td></tr>';

            // Safe retrieval of year value
            let year = document.getElementById('filterYear').value;
            if (!year) {
                const d = new Date();
                let fiscalYear = d.getFullYear() + 543;
                if (d.getMonth() >= 9) fiscalYear += 1;
                year = fiscalYear;
            }

            // Fetch ALL data for the year
            const params = new URLSearchParams({
                mode: 'LIST_BG',
                limit: 10000,
                start: 0,
                type: 'SEARCH',
                i_budget_year: year,
                i_budget_yearEn: year - 543,
                filter: 'c_name'
            });

            try {
                const response = await fetch(`${API_URL}?${params}`);
                const json = await response.json();

                if (json.data) {
                    allData = json.data;
                    filterData();
                } else {
                    allData = [];
                    filterData();
                }
            } catch (error) {
                console.error('Error loading data:', error);
                document.getElementById('tableBody').innerHTML = '<tr><td colspan="15" class="text-center p-3 text-danger">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>';
            } finally {
                // Hide All Loadings
                document.getElementById('chartLoading').style.display = 'none';

                // Hide Full Page Loading with Fade Out
                if (fullPage.style.display !== 'none') {
                    fullPage.style.opacity = '0';
                    setTimeout(() => {
                        fullPage.style.display = 'none';
                    }, 300); // match transition
                }
            }
        }

        function getStatusInfo(id) {
            return STATUS_MAP[id] || STATUS_MAP[0];
        }

        function filterData() {
            const unitVal = document.getElementById('filterUnit').value;
            const statusVal = document.getElementById('filterStatus').value;
            const searchVal = document.getElementById('searchInput').value.toLowerCase();

            const filtered = allData.filter(item => {
                let pass = true;

                if (!IS_ADMIN) {
                    if (item.dc_cost2_id != USER_COST_ID) pass = false;
                } else {
                    if (unitVal && item.dc_cost2_id != unitVal) pass = false;
                }

                // Filter by Status (sp_status_report_id)
                if (statusVal) {
                    if (item.sp_status_report_id != statusVal) pass = false;
                }

                // Filter by Search
                if (searchVal) {
                    const text = (
                        item.c_name + " " +
                        item.c_code + " " +
                        (item.c_emp_name || "") + " " +
                        (item.f_total_amt || "") + " " +
                        (item.f_total_contract || "")
                    ).toLowerCase();

                    // Allow searching for numbers without commas too (e.g. 5000 matches 5,000)
                    const searchValClean = searchVal.replace(/,/g, '');
                    const textClean = text.replace(/,/g, '');

                    if (!text.includes(searchVal) && !textClean.includes(searchValClean)) pass = false;
                }

                return pass;
            });

            processData(filtered);
        }

        function processData(data) {
            // --- Chart Logic --- //
            // Initialize stats with 0 for all defined statuses
            let stats = {};
            Object.keys(STATUS_MAP).forEach(key => stats[key] = 0);

            data.forEach(item => {
                const statusId = item.sp_status_report_id || 0;
                if (!stats[statusId] && stats[statusId] !== 0) {
                    stats[0]++; // Fallback to 'others'
                } else {
                    stats[statusId]++;
                }
            });

            // Update Counts
            document.getElementById('countFiltered').textContent = data.length.toLocaleString();
            document.getElementById('countTotal').textContent = allData.length.toLocaleString();
            document.getElementById('totalCount').textContent = data.length.toLocaleString();
            document.getElementById('displayYear').textContent = document.getElementById('filterYear').value;

            // --- Table Render --- //
            const tbody = document.getElementById('tableBody');
            tbody.innerHTML = '';

            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="15" class="text-center p-3 text-muted">ไม่พบข้อมูลตามเงื่อนไข</td></tr>';
            } else {
                data.forEach((item, index) => {
                    if (index < 200) {
                        const tr = document.createElement('tr');

                        // Icon mapping
                        const prIcon = '<i class="fas fa-check-circle icon-pr"></i>';
                        const docIcon = '<i class="fas fa-file-pdf icon-doc" title="View Document"></i>';

                        // Status Badge
                        const statusInfo = getStatusInfo(item.sp_status_report_id);
                        const badgeClass = statusInfo.class || 'badge-secondary';
                        // Use c_name_status as generic text, but maybe use group name as tooltip or something
                        // User wants align report status.. maybe the badge should show the report status?
                        // Let's use the report status name for now as the badge text?
                        // Existing code used item.c_name_status.
                        // I will stick to c_name_status but use the COLOR from the group.
                        // The user said "ReplyReport... only 4 statuses... I want statuses found in Get_Chart2Data".
                        // This implies the CHART. The table likely just lists items.
                        // But I will update the badge status text to show the Group Name if c_name_status is not enough,
                        // or just keep c_name_status.
                        // Actually, c_name_status is granular (e.g. "Wait for Approve").
                        // sp_status_report_id is "Pending".
                        // I will keep c_name_status as text.

                        tr.innerHTML = `
                        <td class="text-center text-muted">${index + 1}</td>
                        <td class="col-pr-code">${prIcon} ${item.c_code || '-'}</td>
                        <td class="col-topic"><div class="text-truncate-2" title="${item.c_name}">${item.c_name}</div></td>
                        <td class="text-center">${docIcon}</td>
                        <td class="col-status">
                            <span class="badge ${badgeClass} p-1" style="cursor:pointer;" onclick="showStatusDetail(${item.id})">
                                ${item.c_name_status || 'N/A'}
                            </span>
                        </td>
                        <td class="text-center small">${item.event_type || '-'}</td>
                        <td class="text-center small text-info">${item.stats_con || '-'}</td>
                        <td class="text-center small">${item.c_emp_name || '-'}</td>
                        <td class="small">${item.dc_department_name || '-'}</td>
                        <td class="small text-muted">${item.dc_sub_cost || '-'}</td>
                        <td class="text-center small">${formatThaiDate(item.d_tor_date || item.d_doc_date)}</td>
                        <td class="text-center small">${item.code || '-'}</td>
                        <td class="col-money">${item.f_total_amt || '0.00'}</td>
                        <td class="col-money font-weight-bold">${item.f_total_contract || '0.00'}</td>
                    `;
                        tbody.appendChild(tr);
                    }
                });
            }

            // Update ECharts
            updateChart(stats);
        }

        function updateChart(stats) {
            const dom = document.getElementById('assignmentChart');
            if (!chartInstance) {
                chartInstance = echarts.init(dom);
            }

            // Prepare Series Data
            const seriesData = [];
            Object.keys(STATUS_MAP).forEach(key => {
                if (key != 0 || stats[key] > 0) { // Always show main statuses, show 'other' only if has data? Or just show all?
                    // Let's show all except maybe 'others' if 0
                    seriesData.push({
                        value: stats[key],
                        name: STATUS_MAP[key].name,
                        itemStyle: {
                            color: STATUS_MAP[key].color
                        }
                    });
                }
            });

            const option = {
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c} ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    left: 'left',
                    padding: 20,
                    textStyle: {
                        fontFamily: 'Sarabun'
                    },
                    // formatter: function(name) {
                    //    return name + ' (' + stats[...]) // Too complex to map back easily without loop
                    // }
                },
                series: [{
                    name: 'Status',
                    type: 'pie',
                    radius: ['50%', '80%'],
                    avoidLabelOverlap: false,
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: 20,
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: seriesData
                }]
            };

            chartInstance.setOption(option);
        }




        function textEncode(str) {
            var encoded = "";
            for (let i = 0; i < str.length; i++) {
                var a = str.charCodeAt(i);
                var b = a ^ 123; // bitwise XOR
                encoded = encoded + String.fromCharCode(b);
            }
            return encoded;
        }

        function poOpenPdf(file_id, file_name) {
            if (!file_id) return;
            file_name = file_name.replaceAll("/", "-");
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const tap_random = "Tap_" + Math.floor(Math.random() * 100000);

            // Logic to append suffix based on file_id content
            if (file_id.indexOf("hdr") > 0) {
                file_name = file_name + "_" + "เอกสารใบเบิก_" + today;
            } else if (file_id.indexOf("dtl") > 0) {
                file_name = file_name + "_" + "เอกสารประกอบใบเบิก_" + today;
            } else if (file_id.indexOf("pay") > 0) {
                file_name = file_name + "_" + "เอกสารการจ่ายเงิน_" + today;
            } else if (file_id.indexOf("all") > 0) {
                file_name = file_name + "_" + "เอกสาร_" + today;
            }

            const encodedId = encodeURIComponent(textEncode(file_id.slice(0, -4)));
            // Construct absolute URL assuming /NMU_EIS/ is at root relative to current origin, removing port 8443
            const originBase = window.location.origin.replace(":8443", "");
            const actionUrl = originBase + "/NMU_EIS/po/api/PDF_View.php/" + file_name + ".pdf?T=" + tap_random;

            // Create form to submit
            const mapForm = document.createElement("form");
            mapForm.target = tap_random;
            mapForm.method = "GET";
            mapForm.action = actionUrl;
            mapForm.style.display = "none";

            const input1 = document.createElement("input");
            input1.type = "text";
            input1.name = "code_F";
            input1.value = encodedId;
            mapForm.appendChild(input1);

            const input2 = document.createElement("input");
            input2.type = "text";
            input2.name = "file_name";
            input2.value = file_name;
            mapForm.appendChild(input2);

            const input3 = document.createElement("input");
            input3.type = "text";
            input3.name = "T";
            input3.value = tap_random;
            mapForm.appendChild(input3);

            document.body.appendChild(mapForm);
            const mapWindow = window.open("", tap_random);
            if (mapWindow) {
                mapForm.submit();
            } else {
                alert("Popup blocked! Please allow popups for this site.");
            }

            // Cleanup
            document.body.removeChild(mapForm);
        }

        function pdfPreview(file_id, file_name, title) {
            if (!file_id) return;
            file_name = file_name.replaceAll("/", "-");
            const today = new Date().toISOString().split('T')[0];
            const tap_random = "Tap_" + Math.floor(Math.random() * 100000);

            if (file_id.indexOf("hdr") > 0) {
                file_name = file_name + "_" + "เอกสารใบเบิก_" + today;
            } else if (file_id.indexOf("dtl") > 0) {
                file_name = file_name + "_" + "เอกสารประกอบใบเบิก_" + today;
            } else if (file_id.indexOf("pay") > 0) {
                file_name = file_name + "_" + "เอกสารการจ่ายเงิน_" + today;
            } else if (file_id.indexOf("all") > 0) {
                file_name = file_name + "_" + "เอกสาร_" + today;
            }

            const encodedId = encodeURIComponent(textEncode(file_id.slice(0, -4)));
            // Construct absolute URL assuming /NMU_EIS/ is at root relative to current origin, removing port 8443
            const originBase = window.location.origin.replace(":8443", "");
            // For Modal Iframe, we can just use the straightforward URL with query params
            const actionUrl = originBase + "/NMU_EIS/po/api/PDF_View.php/" + file_name + ".pdf?code_F=" + encodedId + "&file_name=" + file_name + "&T=" + tap_random;

            // Reuse printerModal, check if exists
            if (!document.getElementById('printerPreviewModal')) {
                // Call printerPreview with dummy invalid ID to just init modal? Or just copy logic.
                // Better copy logic to ensure existence.
                const modalHtml = `
                    <div class="modal fade" id="printerPreviewModal" tabindex="-1" role="dialog" aria-hidden="true" style="z-index: 1060;">
                        <div class="modal-dialog modal-xl modal-dialog-scrollable" style="max-height: 95vh; height: 95vh;">
                            <div class="modal-content h-100">
                                <div class="modal-header bg-light py-2">
                                    <h5 class="modal-title font-weight-bold" id="printerPreviewTitle"><i class="fas fa-print"></i> แสดงตัวอย่าง</h5>
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div class="modal-body p-0 h-100" id="printerPreviewBody">
                                    <div class="d-flex justify-content-center align-items-center h-100">
                                        <div class="spinner-border text-primary" role="status"></div>
                                        <span class="ml-2">กำลังโหลดเอกสาร...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
                document.body.insertAdjacentHTML('beforeend', modalHtml);
            }

            // Update Title
            const modalTitle = document.querySelector('#printerPreviewModal .modal-title');
            const displayTitle = title || 'เอกสารประกอบ (PDF)';
            if (modalTitle) modalTitle.innerHTML = `<i class="fas fa-file-pdf text-danger"></i> ${displayTitle}`;

            // Set iframe
            const iframe = `<iframe src="${actionUrl}" style="width:100%; height:100%; border:none;" onload="this.style.opacity=1;"></iframe>`;
            document.getElementById('printerPreviewBody').innerHTML = iframe;

            // Show modal
            $('#printerPreviewModal').modal('show');
        }

        function printerPreview(id) {
            // Check if modal exists
            if (!document.getElementById('printerPreviewModal')) {
                const modalHtml = `
                    <div class="modal fade" id="printerPreviewModal" tabindex="-1" role="dialog" aria-hidden="true" style="z-index: 1060;">
                        <div class="modal-dialog modal-xl modal-dialog-scrollable" style="max-height: 95vh; height: 95vh;">
                            <div class="modal-content h-100">
                                <div class="modal-header bg-light py-2">
                                    <h5 class="modal-title font-weight-bold"><i class="fas fa-print"></i> แสดงตัวอย่างก่อนพิมพ์</h5>
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div class="modal-body p-0 h-100" id="printerPreviewBody">
                                    <div class="d-flex justify-content-center align-items-center h-100">
                                        <div class="spinner-border text-primary" role="status"></div>
                                        <span class="ml-2">กำลังโหลดเอกสาร...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
                document.body.insertAdjacentHTML('beforeend', modalHtml);
            }

            // Update Title (Reset)
            const modalTitle = document.querySelector('#printerPreviewModal .modal-title');
            if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-print"></i> แสดงตัวอย่างก่อนพิมพ์';

            // Construct URL - removing port 8443
            const originBase = window.location.origin.replace(":8443", "");
            const url = originBase + "/NMU_EIS/po/preview/Pre_Working.php?id=" + id;

            // Set iframe
            const iframe = `<iframe src="${url}" style="width:100%; height:100%; border:none;" onload="this.style.opacity=1;"></iframe>`;
            document.getElementById('printerPreviewBody').innerHTML = iframe;

            // Show modal
            $('#printerPreviewModal').modal('show');
        }

        async function showStatusDetail(id) {
            const item = allData.find(d => d.id == id);
            if (!item) return;

            const modalTitle = document.getElementById('statusModalTitle');
            const modalBody = document.getElementById('statusModalBody');

            modalTitle.textContent = `สถานะ: ${item.c_name_status}`;
            modalBody.innerHTML = '<div class="text-center p-4"><div class="spinner-border text-primary" role="status"></div><div class="mt-2">กำลังโหลดข้อมูล...</div></div>';

            $('#statusDetailModal').modal('show');

            if (item.c_name_status.includes("บันทึกรายละเอียดในสัญญา") || item.c_name_status.includes("บริหารสัญญา")) {
                try {
                    // Fetch Contract Details
                    const params = new URLSearchParams({
                        mode: 'sp_Per_dtl', // This seems to be handled in the API to return period details
                        id: item.id, // tor_id
                        sp_tor_contract: item.sp_contract_id || 0,
                        i_type: 0 // Default from image
                    });

                    const res = await fetch(`${API_URL}?${params}`);
                    const json = await res.json();

                    // --- Header: Contract Info (from 'item' which already has these fields) ---
                    const headerHtml = `
                        <div class="card mb-3 border-0 bg-light">
                            <div class="card-body p-3">
                                <h6 class="font-weight-bold text-primary mb-3"><i class="fas fa-file-contract"></i> ข้อมูลสัญญา</h6>
                                <div class="row small mb-2">
                                    <div class="col-md-3"><span class="text-muted">สถานะสัญญา:</span> <span class="font-weight-bold text-info">${item.stats_con || '-'}</span></div>
                                    <div class="col-md-3"><span class="text-muted">เลข PR:</span> <b>${item.c_code || '-'}</b></div>
                                    <div class="col-md-3"><span class="text-muted">เลข พวช:</span> <b>${item.d_doc_ref || '-'}</b></div>
                                    <div class="col-md-3"><span class="text-muted">เลขสัญญา:</span> <b>${item.code || '-'}</b></div>
                                </div>
                                <div class="row small mb-2">
                                    <div class="col-md-12"><span class="text-muted">ชื่อรายการ:</span> <b>${item.c_name || '-'}</b></div>
                                </div>
                                <div class="row small mb-2">
                                    <div class="col-md-4"><span class="text-muted">เลขผู้เสียภาษี:</span> <b>${item.c_tax_number_imp || '-'}</b></div>
                                    <div class="col-md-8"><span class="text-muted">ผู้ขาย/ผู้รับจ้าง:</span> <b>${item.dc_creditor_name || '-'}</b></div>
                                </div>
                                <div class="row small mb-2">
                                    <div class="col-md-3"><span class="text-muted">จำนวนเงิน PR:</span> <b class="text-success">${item.f_total_amt || '0.00'}</b></div>
                                    <div class="col-md-3"><span class="text-muted">สัญญา:</span> <b class="text-success">${item.f_total_contract || '0.00'}</b></div>
                                    <div class="col-md-6 text-right">
                                        <span class="badge badge-light border">เริ่มสัญญา: ${formatThaiDate(item.d_doc_content)}</span>
                                        <span class="badge badge-light border">เริ่มทำงาน: ${formatThaiDate(item.d_start_content)}</span>
                                        <span class="badge badge-light border">สิ้นสุด: ${formatThaiDate(item.d_due_content)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;

                    if (json.data && json.data.length > 0) {
                        let rows = '';
                        json.data.forEach((row, i) => {
                            // Column 2: Request Doc (c_file_pdf_hdr / c_code_d)
                            let reqDocVal = row.c_code_d || '-';
                            let reqDocBtn = '';
                            if (row.c_code_d && row.i_is_url_pdf_hdr == 0) {
                                // Pass c_file_pdf_hdr and c_code_d
                                reqDocBtn = `<button class="btn btn-sm btn-link p-0 text-decoration-none" title="View PDF" onclick="pdfPreview('${row.c_file_pdf_hdr}', '${row.c_code_d}', 'เอกสารขอใบเบิก')"><i class="fas fa-file-pdf text-danger"></i> ${reqDocVal}</button>`;
                            } else {
                                reqDocBtn = reqDocVal === '-' ? '-' : `<span class="text-muted">${reqDocVal}</span>`;
                            }

                            // Column 3: Supporting Doc (c_file_pdf_dtl)
                            let supDoc = '';
                            if (row.i_pdf_dtl_outside == 1) {
                                supDoc = '<span class="text-danger small"><i class="fas fa-file-pdf"></i> นอกระบบ</span>';
                            } else if (row.i_is_url_pdf_dtl == 0) {
                                // Pass c_file_pdf_dtl and c_code_d
                                supDoc = `<button class="btn btn-sm btn-link p-0" title="เอกสารประกอบ" onclick="pdfPreview('${row.c_file_pdf_dtl}', '${row.c_code_d}', 'เอกสารประกอบ')"><i class="fas fa-file-pdf text-secondary"></i> เอกสารประกอบ</button>`;
                            } else {
                                supDoc = '-';
                            }

                            // Column 4: Print (po_working_hdr_id)
                            let printBtn = row.po_working_hdr_id ? `<i class="fas fa-print text-primary" style="cursor:pointer" onclick="printerPreview('${row.po_working_hdr_id}')" title="Print"></i>` : '-';

                            rows += `
                                <tr>
                                    <td class="text-center">${row.no || (i+1)}</td>
                                    <td class="small">${reqDocBtn}</td>
                                    <td class="text-center small">${supDoc}</td>
                                    <td class="text-center">${printBtn}</td>
                                    <td class="text-center small text-info">${row.stats_period || '-'}</td>
                                    <td class="text-center small">${row.c_arrive_code || '-'}</td>
                                    <td class="text-center small text-nowrap">${formatThaiDate(row.d_arrive_date)}</td>
                                    <td class="text-center small">${row.c_code_chk || '-'}</td>
                                    <td class="text-center small text-nowrap">${formatThaiDate(row.d_checking_date)}</td>
                                    <td class="text-center small">${row.c_code_bl || '-'}</td>
                                    <td class="text-center small text-nowrap">${formatThaiDate(row.d_doc_billing)}</td>
                                    <td class="text-center small">${row.c_code_d || '-'}</td>
                                    <td class="text-center small text-nowrap">${formatThaiDate(row.d_po_working_hdr)}</td>
                                </tr>
                             `;
                        });

                        modalBody.innerHTML = `
                            ${headerHtml}
                            <h6 class="font-weight-bold mb-2 text-secondary"><i class="fas fa-list"></i> รายละเอียดงวดงาน (Period Details)</h6>
                            <div class="table-responsive">
                                <table class="table table-bordered table-striped table-sm table-hover">
                                    <thead class="thead-dark small text-center">
                                        <tr>
                                            <th style="width:3%">ที่</th>
                                            <th>เอกสารขอใบเบิก</th>
                                            <th>เอกสารประกอบ</th>
                                            <th style="width:3%">-</th>
                                            <th>สถานะงวด</th>
                                            <th>เลขที่รับของ</th>
                                            <th>วันที่รับของ</th>
                                            <th>เลขที่ตรวจรับ</th>
                                            <th>วันที่ตรวจรับ</th>
                                            <th>เลขที่วางบิล</th>
                                            <th>วันที่วางบิล</th>
                                            <th>เลขที่ใบเบิก</th>
                                            <th>วันที่สร้างใบเบิก</th>
                                        </tr>
                                    </thead>
                                    <tbody>${rows}</tbody>
                                </table>
                            </div>
                        `;
                    } else {
                        modalBody.innerHTML = `
                            ${headerHtml}
                            <div class="alert alert-warning mt-3"><i class="fas fa-exclamation-circle"></i> ไม่พบรายละเอียดงวดงาน</div>
                        `;
                    }

                } catch (e) {
                    console.error(e);
                    modalBody.innerHTML = '<div class="alert alert-danger">เกิดข้อผิดพลาดในการโหลดข้อมูลสัญญา</div>';
                }
            } else {
                // Condition 1: Normal Status -> Show PR Details with History

                // Fetch History Data
                let historyHtml = '';
                try {
                    const historyParams = new URLSearchParams({
                        mode: 'sp_tor_even',
                        id: item.id, // tor_id
                        i_type: 0
                    });
                    const resHistory = await fetch(`${API_URL}?${historyParams}`);
                    const jsonHistory = await resHistory.json();

                    if (jsonHistory.data && jsonHistory.data.length > 0) {
                        let historyRows = '';
                        jsonHistory.data.forEach((h, i) => {
                            // Green for latest (0), Yellow for others
                            const rowClass = i === 0 ? 'table-success' : 'table-warning';

                            historyRows += `
                                <tr class="${rowClass}">
                                    <td class="text-center">${i + 1}</td>
                                    <td class="text-nowrap text-center">${formatThaiDate(h.event_date)}</td>
                                    <td class="text-nowrap text-center">${formatThaiDate(h.d_create)}</td>
                                    <td>${h.sp_status_hdr || ''}</td>
                                    <td>${h.event_detail || ''}</td>
                                    <td>${h.dc_user_create_cost_id || ''}<br><small class="text-muted">${h.dc_user_create_id || ''}</small></td>
                                </tr>
                            `;
                        });

                        historyHtml = `
                            <div class="mt-4">
                                <h6 class="font-weight-bold mb-3 text-secondary"><i class="fas fa-history"></i> ประวัติการดำเนินการ (History)</h6>
                                <div class="table-responsive">
                                    <table class="table table-bordered table-sm" style="font-size: 0.8rem;">
                                        <thead class="thead-light">
                                            <tr>
                                                <th class="text-center" style="width: 5%">#</th>
                                                <th class="text-center" style="width: 13%">วันที่ความก้าวหน้า</th>
                                                <th class="text-center" style="width: 13%">วันที่บันทึก</th>
                                                <th style="width: 15%">สถานะ</th>
                                                <th style="width: 35%">รายละเอียด</th>
                                                <th style="width: 19%">ผู้ดำเนินการ</th>
                                            </tr>
                                        </thead>
                                        <tbody>${historyRows}</tbody>
                                    </table>
                                </div>
                            </div>
                        `;
                    }
                } catch (e) {
                    console.warn("Could not fetch history:", e);
                }

                // Render Main PR Details + History
                modalBody.innerHTML = `
                    <div class="card border-0 shadow-sm">
                        <div class="card-body">
                            <h5 class="border-bottom pb-2 mb-3 text-primary"><i class="fas fa-file-alt"></i> ข้อมูลรายละเอียด PR</h5>
                            
                            <div class="row mb-2">
                                <div class="col-md-6">
                                    <label class="text-muted small mb-0">รหัส PR</label>
                                    <div class="font-weight-bold">${item.c_code || '-'}</div>
                                </div>
                                <div class="col-md-6">
                                    <label class="text-muted small mb-0">วันที่สร้าง</label>
                                    <div>${formatThaiDate(item.d_create)}</div>
                                </div>
                            </div>
                            
                            <div class="row mb-2">
                                <div class="col-12">
                                    <label class="text-muted small mb-0">เรื่อง/โครงการ</label>
                                    <div class="text-dark">${item.c_name || '-'}</div>
                                </div>
                            </div>

                             <div class="row mb-2">
                                <div class="col-md-6">
                                    <label class="text-muted small mb-0">หน่วยงาน</label>
                                    <div>${item.dc_department_name || '-'}</div>
                                </div>
                                <div class="col-md-6">
                                    <label class="text-muted small mb-0">ผู้รับผิดชอบ</label>
                                    <div>${item.c_emp_name || '-'}</div>
                                </div>
                            </div>

                            <div class="row mb-2">
                                <div class="col-md-6">
                                    <label class="text-muted small mb-0">วิธีการจัดซื้อ</label>
                                    <div>${item.c_purchase || '-'} (${item.c_type_name || '-'})</div>
                                </div>
                                <div class="col-md-6">
                                    <label class="text-muted small mb-0">เอกสารอ้างอิง</label>
                                    <div>${item.d_doc_ref || '-'}</div>
                                </div>
                            </div>
                            
                            <div class="row mb-3 mt-3 p-2 bg-light rounded mx-1">
                                <div class="col-md-6 d-flex align-items-center">
                                    <div class="mr-2">สถานะ:</div>
                                    <span class="badge badge-info p-2" style="font-size:0.9rem">${item.c_name_status || '-'}</span>
                                </div>
                                <div class="col-md-6 text-right">
                                    <div class="text-muted small">จำนวนเงิน</div>
                                    <div class="h4 text-success font-weight-bold mb-0">${item.f_total_amt || '0.00'}</div>
                                </div>
                            </div>

                            ${historyHtml}
                        </div>
                    </div>
                `;
            }
        }
    </script>
</body>

</html>