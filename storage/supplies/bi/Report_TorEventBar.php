<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="shortcut icon" href="../images/favicon.ico" type="image/x-icon">
    <link rel="icon" href="../images/favicon.ico" type="image/x-icon">
    <title>รายงานสรุปเหตุการณ์ (Tor Event Report)</title>
    <!-- FontAwesome for Icons -->
    <link rel="stylesheet" href="../sp/dboard/assets/plugins/fontawesome/css/all.min.css">

    <?php
    include("../conf/config.php");
    include("../lib/date/i_date.class.php");

    // 1. Session Check
    if (empty($_SESSION['dc_cost_id'])) {
        header("Location: https://eis.vajira.ac.th/NMU_permission");
        exit;
    }

    $dc_cost_id = $_SESSION['dc_cost_id'];
    // Admins are 38 or 3
    $isAdmin = in_array($dc_cost_id, [38, 3]);

    $dateLib = new i_date();
    $thai_months = array_values($dateLib->s_month_thai); // Convert to 0-indexed array for JS
    ?>
    <script>
        const USER_COST_ID = <?php echo json_encode($dc_cost_id); ?>;
        const IS_ADMIN = <?php echo json_encode($isAdmin); ?>;
        const THAI_MONTHS_SYSTEM = <?php echo json_encode($thai_months); ?>;
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
        }

        .table-custom thead th {
            background-color: #343a40;
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
        }

        .table-custom tbody td {
            border: 1px solid #dee2e6;
            padding: 6px 4px;
            vertical-align: middle;
            color: #333;
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
    </style>
</head>

<body>
    <!-- Full Page Loading Screen -->
    <div id="fullPageLoading">
        <div class="loading-text">Processing Data...</div>
        <div class="progress-bar-custom">
            <div class="progress-bar-fill"></div>
        </div>
    </div>

    <div class="container-fluid pt-3 pb-5">
        <div class="text-center mb-3">
            <img src="../images/logo.png" alt="logo" class="report-logo" style="height: 120px; width: auto;">
        </div>

        <!-- Header Section -->
        <div class="card-custom p-3">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="font-weight-bold m-0 text-primary"><i class="fas fa-chart-bar"></i> รายงานสรุปเหตุการณ์ (Tor Event Report)</h5>
                <small class="text-muted">ข้อมูลปี <span id="displayYear" class="badge badge-info">...</span></small>
            </div>

            <div class="row">
                <!-- Year Filter -->
                <div class="col-lg-3 col-md-4 mb-2">
                    <div class="info-box">
                        <div class="info-label">ปี (Year)</div>
                        <select id="filterYear" class="selectpicker form-control" data-style="btn-outline-primary" title="เลือกปี"></select>
                    </div>
                </div>

                <!-- Filters Group -->
                <div class="col-lg-9 col-md-8 mb-2">
                    <div class="info-box">
                        <div class="info-label">ตัวกรองข้อมูล</div>
                        <div class="form-row">
                            <div class="col-md-5 mb-2">
                                <select class="form-control" id="filterUser">
                                    <option value="">- ผู้บันทึกทั้งหมด -</option>
                                </select>
                            </div>
                            <div class="col-md-5 mb-2">
                                <div class="custom-control custom-checkbox mt-2">
                                    <input type="checkbox" class="custom-control-input" id="chkIncludeOldData" onchange="loadData()">
                                    <label class="custom-control-label text-muted" for="chkIncludeOldData">รวมข้อมูลเก่า (ก่อน ก.พ. 2569)</label>
                                </div>
                            </div>
                            <div class="col-md-2 mb-2">
                                <button type="button" class="btn btn-primary btn-block" onclick="loadData()"><i class="fa fa-search"></i> ค้นหา</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Section 1: Chart -->
        <div class="card-custom">
            <div class="card-body">
                <div class="chart-header">ส่วนที่ 1: กราฟแสดงจำนวนเหตุการณ์แยกตามผู้บันทึก (Bar Chart)</div>
                <div class="position-relative" style="min-height: 500px;">
                    <div id="chartBar" style="height: 500px; width: 100%;"></div>
                    <div id="chartLoading" class="chart-loading-overlay" style="display:none;">
                        <div class="spinner-border text-primary" role="status"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Section 2: Table -->
        <div class="card-custom">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="chart-header m-0 border-0 p-0">ส่วนที่ 2: รายละเอียดเหตุการณ์ (Details)</div>
                    <span class="badge badge-secondary p-2">ทั้งหมด <span id="totalCount">0</span> รายการ</span>
                </div>

                <div class="table-responsive" style="max-height: 800px; overflow-y: auto;">
                    <table class="table-custom table-hover" id="mainTable">
                        <thead>
                            <tr>
                                <th width="5%">#</th>
                                <th width="10%">วันที่</th>
                                <th width="10%">เวลา</th>
                                <th width="15%">เลขที่ PR</th>
                                <th width="15%">ผู้บันทึก</th>
                                <th width="15%">หน่วยงาน</th>
                                <th width="10%">ประเภทเหตุการณ์</th>
                                <th width="20%">รายละเอียด</th>
                            </tr>
                        </thead>
                        <tbody id="tableBody">
                            <!-- Data populated by JS -->
                        </tbody>
                    </table>
                </div>
            </div>
            <!-- User Detail Modal -->
            <div class="modal fade" id="userDetailModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title"><i class="fas fa-list"></i> รายละเอียดเหตุการณ์: <span id="modalUserName"></span></h5>
                            <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="table-responsive">
                                <table class="table table-bordered table-striped table-sm" id="modalTable">
                                    <thead class="thead-dark">
                                        <tr>
                                            <th width="5%">#</th>
                                            <th width="10%">วันที่</th>
                                            <th width="10%">เวลา</th>
                                            <th width="15%">เลขที่ PR</th>
                                            <th width="20%">หน่วยงาน</th>
                                            <th width="10%">ประเภทเหตุการณ์</th>
                                            <th width="30%">รายละเอียด</th>
                                        </tr>
                                    </thead>
                                    <tbody id="modalTableBody">
                                        <!-- Data populated by JS -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">ปิด</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Configuration
        const API_URL = '../sp/tor/api/mnTorCheckList.php';
        const OPTIONS_API_URL = 'api/get_options.php';

        let chartInstance = null;
        let allData = [];

        // Helpers

        function formatThaiDate(dateStr) {
            if (!dateStr) return '-';

            let dd, mm, yy;

            // Try simple string manipulation first
            let parts = dateStr.split(/[-/]/);
            if (parts.length === 3) {
                // Case: 2569-01-20 (Y-m-d) -> rare from this API but possible
                if (parseInt(parts[0]) > 2400) {
                    yy = parseInt(parts[0]);
                    mm = parseInt(parts[1]);
                    dd = parseInt(parts[2]);
                }
                // Case: 20-01-2569 (d-m-Y) -> Standard from extDateBuddha
                else if (parseInt(parts[2]) > 2400) {
                    yy = parseInt(parts[2]);
                    mm = parseInt(parts[1]);
                    dd = parseInt(parts[0]);
                }
            }

            if (!yy) {
                // Fallback to standard parsing
                let d = new Date(dateStr.replace(/-/g, '/'));
                if (isNaN(d.getTime())) return dateStr;

                dd = d.getDate();
                mm = d.getMonth() + 1;
                yy = d.getFullYear();

                // Only add 543 if year is in AD range (e.g. < 2400)
                if (yy < 2400) {
                    yy += 543;
                }
            }

            let thaiMonth = (typeof THAI_MONTHS_SYSTEM !== 'undefined') ? (THAI_MONTHS_SYSTEM[mm - 1] || mm) : mm;
            let ddStr = dd.toString().padStart(2, '0');

            return `${ddStr} ${thaiMonth} ${yy}`;
        }

        function formatTime(start, end) {
            if (!start && !end) return '-';
            if (start && end) return `${start.substr(0, 5)} - ${end.substr(0, 5)}`;
            if (start) return `${start.substr(0, 5)}`;
            return '-';
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            initYearFilter();
            // loadOptions(); // We will generate options from data for "User" or just load data first
            setTimeout(loadData, 100);

            document.getElementById('filterYear').addEventListener('change', loadData);
            document.getElementById('filterUser').addEventListener('change', filterDataClientSide); // Change to client side filter or reload
            window.addEventListener('resize', () => {
                if (chartInstance) chartInstance.resize();
            });
        });

        function initYearFilter() {
            const yearSelect = document.getElementById('filterYear');
            const d = new Date();
            let currentYear = d.getFullYear() + 543;

            for (let i = 0; i < 5; i++) {
                const y = currentYear - i;
                const opt = document.createElement('option');
                opt.value = y;
                opt.text = `ปี ${y}`;
                if (i === 0) opt.selected = true;
                yearSelect.appendChild(opt);
            }
            if (typeof $.fn.selectpicker === 'function') {
                $('#filterYear').selectpicker('refresh');
                $('#filterYear').selectpicker('val', currentYear);
            }
        }

        async function loadData() {
            const fullPage = document.getElementById('fullPageLoading');
            if (fullPage.style.display !== 'none') {} else {
                document.getElementById('chartLoading').style.display = 'flex';
            }
            document.getElementById('tableBody').innerHTML = '<tr><td colspan="6" class="text-center p-3">กำลังโหลดข้อมูล...</td></tr>';

            const year = $('#filterYear').val();
            const isChecked = $('#chkIncludeOldData').is(':checked');
            console.log('Checkbox State:', isChecked);
            const includeOld = isChecked ? 1 : 0;

            const params = new URLSearchParams({
                mode: 'LIST_EVENT_REPORT',
                i_year: year,
                include_old_data: includeOld
            });

            try {
                const response = await fetch(`${API_URL}?${params}`);
                const json = await response.json();

                if (json.success) {
                    allData = json; // Store for filtering
                    populateUserFilter(json.summary);
                    updateChart(json.summary);
                    renderTable(json.details);
                    document.getElementById('totalCount').textContent = (json.details ? json.details.length : 0).toLocaleString();
                } else {
                    alert("Error: " + (json.msg || "Unknown error"));
                }
                document.getElementById('displayYear').textContent = year;

            } catch (error) {
                console.error('Error loading data:', error);
                document.getElementById('tableBody').innerHTML = '<tr><td colspan="6" class="text-center p-3 text-danger">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>';
            } finally {
                document.getElementById('chartLoading').style.display = 'none';
                if (fullPage.style.display !== 'none') {
                    fullPage.style.opacity = '0';
                    setTimeout(() => {
                        fullPage.style.display = 'none';
                    }, 300);
                }
            }
        }

        function populateUserFilter(summaryData) {
            const userSelect = document.getElementById('filterUser');
            const currentVal = userSelect.value;
            userSelect.innerHTML = '<option value="">- ผู้บันทึกทั้งหมด -</option>';

            // Extract unique users from summary
            if (summaryData) {
                summaryData.forEach(item => {
                    const opt = document.createElement('option');
                    opt.value = item.user_id; // Use ID or Name? ID is safer if available in summary
                    opt.text = item.user_name;
                    userSelect.appendChild(opt);
                });
            }
            // Restore selection if possible
            if (currentVal) userSelect.value = currentVal;
        }

        function filterDataClientSide() {
            const userId = document.getElementById('filterUser').value;

            // Filter Summary for Chart
            let filteredSummary = allData.summary;
            // If we filtered summary by user, the chart would only show 1 bar. 
            // Usually in this view we keep the chart showing all, but maybe highlight?
            // User request: "Click graph -> see details". 
            // So chart usually remains overview. But if dropdown changes, chart implies filtering?
            // Let's keep chart as overview ALL THE TIME unless year changes, 
            // but update table based on selection.
            // OR if user selects dropdown, maybe we just highlight that user?
            // For now, let's just filter table. Chart can stay or filter too.
            // If I filter chart, I lose context of others. Let's filter chart too to be consistent with standard dashboards.
            if (userId) {
                filteredSummary = allData.summary.filter(item => item.user_id == userId);
            }
            // Update chart data BUT keep 'click' capability if we want to reset?
            updateChart(filteredSummary);

            // Filter Details for Table
            let filteredDetails = allData.details;
            if (userId) {
                filteredDetails = allData.details.filter(item => item.dc_user_create_id == userId);
            }
            renderTable(filteredDetails);
            document.getElementById('totalCount').textContent = filteredDetails.length.toLocaleString();
        }

        function updateChart(summaryData) {
            if (!chartInstance) {
                chartInstance = echarts.init(document.getElementById('chartBar'));
                chartInstance.on('click', function(params) {
                    const clickedName = params.name;
                    const found = allData.summary.find(item => item.user_name === clickedName);

                    if (found) {
                        // Show Modal instead of filtering main table
                        showUserDetailModal(found);
                    }
                });
            }

            const names = summaryData.map(item => item.user_name);
            const values = summaryData.map(item => item.count);

            const option = {
                title: {
                    text: 'จำนวนเหตุการณ์ แยกตามผู้บันทึก',
                    left: 'center',
                    textStyle: {
                        fontFamily: 'Sarabun'
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '10%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: names,
                    axisLabel: {
                        rotate: 45,
                        interval: 0,
                        formatter: function(value) {
                            return value.length > 15 ? value.substring(0, 15) + '...' : value;
                        }
                    }
                },
                yAxis: {
                    type: 'value',
                    name: 'คะแนน (จำนวน)'
                },
                series: [{
                    name: 'จำนวน',
                    type: 'bar',
                    data: values,
                    barWidth: '50%',
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: '#83bff6'
                            },
                            {
                                offset: 0.5,
                                color: '#188df0'
                            },
                            {
                                offset: 1,
                                color: '#188df0'
                            }
                        ])
                    },
                    emphasis: {
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                    offset: 0,
                                    color: '#2378f7'
                                },
                                {
                                    offset: 0.7,
                                    color: '#2378f7'
                                },
                                {
                                    offset: 1,
                                    color: '#83bff6'
                                }
                            ])
                        }
                    },
                    label: {
                        show: true,
                        position: 'top'
                    }
                }]
            };

            chartInstance.setOption(option, true); // true = not merge, replace data (important for filtering)
        }

        function showUserDetailModal(userInfo) {
            const userId = userInfo.user_id;
            const userName = userInfo.user_name;

            document.getElementById('modalUserName').textContent = userName;
            const tbody = document.getElementById('modalTableBody');
            tbody.innerHTML = '';

            const userDetails = allData.details.filter(item => item.dc_user_create_id == userId);

            if (userDetails.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center p-3 text-muted">ไม่พบข้อมูล</td></tr>';
            } else {
                userDetails.forEach((item, index) => {
                    const tr = document.createElement('tr');

                    let prDisplay = '';
                    if (item.pr_code) {
                        prDisplay = `<span class="badge badge-success">${item.pr_code}</span>`;
                    } else {
                        prDisplay = `<span class="text-muted small" style="font-style:italic;">บันทึกข้อมูล โดยไม่ระบุ PR</span>`;
                    }

                    tr.innerHTML = `
                        <td class="text-center">${index + 1}</td>
                        <td class="text-center">${formatThaiDate(item.date)}</td>
                        <td class="text-center">${formatTime(item.event_time_start, item.event_time_end)}</td>
                        <td class="text-center">${prDisplay}</td>
                        <td><small class="text-muted">${item.cost_name || '-'}</small></td>
                        <td><span class="badge badge-info">${item.type_name || '-'}</span></td>
                        <td>${item.title || ''} <br><small class="text-muted">${item.detail || '-'}</small></td>
                    `;
                    tbody.appendChild(tr);
                });
            }

            $('#userDetailModal').modal('show');
        }

        function renderTable(data) {
            const tbody = document.getElementById('tableBody');
            tbody.innerHTML = '';
            if (!data || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center p-3 text-muted">ไม่พบข้อมูล</td></tr>';
                return;
            }

            data.slice(0, 500).forEach((item, index) => {
                const tr = document.createElement('tr');

                // Logic for PR Code
                let prDisplay = '';
                if (item.pr_code) {
                    prDisplay = `<span class="badge badge-success">${item.pr_code}</span>`;
                } else {
                    prDisplay = `<span class="text-muted small" style="font-style:italic;">บันทึกข้อมูล โดยไม่ระบุ PR</span>`;
                }

                tr.innerHTML = `
                    <td class="text-center">${index + 1}</td>
                    <td class="text-center">${formatThaiDate(item.date)}</td>
                    <td class="text-center">${formatTime(item.event_time_start, item.event_time_end)}</td>
                    <td class="text-center">${prDisplay}</td>
                    <td>${item.user_name || '-'}</td>
                    <td><small class="text-muted">${item.cost_name || '-'}</small></td>
                    <td><span class="badge badge-info">${item.type_name || '-'}</span></td>
                    <td>${item.title || ''} <br><small class="text-muted">${item.detail || '-'}</small></td>
                `;
                tbody.appendChild(tr);
            });
        }
    </script>
</body>

</html>