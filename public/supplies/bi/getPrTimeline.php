<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <title>PR Process Timeline</title>
    <link rel="stylesheet" href="../php-notic/bootstrap/css/bootstrap.min.css" />
    <link rel="stylesheet" href="../sp/dboard/assets/plugins/fontawesome/css/all.min.css">

    <style>
 body, html {
            height: 100%;
            margin: 0;
            padding: 0;
            background-color: #ffffff; /* เปลี่ยนเป็นขาวเพื่อให้กลืนกับหน้าหลัก */
            overflow-x: hidden;
        }
        .container-fluid {
            padding: 0; /* ชิดขอบ 100% */
        }
        .card {
            border: none;
            border-radius: 12px;
            box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
        }

        .card-header {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            border-radius: 12px 12px 0 0 !important;
            padding: 1rem 1.5rem;
        }

        /* Timeline Table Styling */
        .table thead th {
            background-color: #f8f9fa;
            border-top: none;
            font-weight: 600;
            color: #495057;
            text-transform: none;
        }

        .status-dot {
            height: 10px;
            width: 10px;
            background-color: #2a5298;
            border-radius: 50%;
            display: inline-block;
            margin-right: 10px;
        }

        .day-badge {
            background-color: #e3f2fd;
            color: #0d47a1;
            padding: 4px 10px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 0.9rem;
        }

        /* Loading Overlay */
        #loadingOverlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(255, 255, 255, 0.85);
            z-index: 9999; display: flex; flex-direction: column;
            justify-content: center; align-items: center; display: none;
        }

        .spinner-grow { width: 3rem; height: 3rem; }
    </style>
</head>

<body>

    <div id="loadingOverlay">
        <div class="spinner-grow text-primary" role="status"></div>
        <div class="mt-3 font-weight-bold">กำลังโหลดข้อมูล Timeline...</div>
    </div>

    <div class="container-fluid">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                    <i class="fas fa-stream mr-2"></i> 
                    Timeline ติดตามสถานะ (PR: <?php echo htmlspecialchars($_REQUEST['c_code']); ?>)
                </h5>
                <button class="btn btn-light btn-sm font-weight-bold" onclick="loadData()">
                    <i class="fas fa-sync-alt mr-1">รีเฟรช</i> 
                </button>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead>
                            <tr>
                                <th class="text-center" width="8%">ลำดับ</th>
                                <th width="15%" class="text-center">รหัสสถานะ</th>
                                <th width="35%">ขั้นตอนการดำเนินงาน</th>
                                <th width="22%" class="text-center">วันที่ดำเนินการ</th>
                                <th width="20%" class="text-center">ระยะเวลาที่ใช้</th>
                            </tr>
                        </thead>
                        <tbody id="tableBody">
                            </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <script src="../js/jquery.min.js"></script>
    <script src="../js/bootstrap.min.js"></script>

    <script>
        const API_URL = 'api/listGetPrTimeline.php';
        // รับค่า c_code จาก PHP
        const c_code_param = '<?php echo isset($_REQUEST['c_code']) ? $_REQUEST['c_code'] : ""; ?>';

        $(document).ready(function() {
            if (c_code_param !== "") {
                loadData();
            } else {
                $('#tableBody').html('<tr><td colspan="5" class="text-center p-5 text-muted">ไม่พบรหัสสัญญา (c_code)</td></tr>');
            }
        });

        function loadData() {
            $('#loadingOverlay').css('display', 'flex');

            $.getJSON(API_URL, {
                mode: 'LIST',
                c_code: c_code_param
            }, function(res) {
                if (res.success) {
                    renderTable(res.data);
                } else {
                    $('#tableBody').html('<tr><td colspan="5" class="text-center text-danger p-5">เกิดข้อผิดพลาดในการดึงข้อมูล</td></tr>');
                }
                setTimeout(() => { $('#loadingOverlay').fadeOut(200); }, 300);
            }).fail(function() {
                $('#loadingOverlay').fadeOut(200);
                $('#tableBody').html('<tr><td colspan="5" class="text-center text-danger p-5">ไม่สามารถเชื่อมต่อ API ได้</td></tr>');
            });
        }

        function renderTable(data) {
            let html = '';
            if (!data || data.length === 0) {
                html = '<tr><td colspan="5" class="text-center text-muted p-5">ไม่พบข้อมูลประวัติสถานะของเลขที่สัญญานี้</td></tr>';
            } else {
                data.forEach((item, index) => {
                    // คำนวณการแสดงผลของจำนวนวัน
                    let dayDisplay = "";
                    if (index === 0) {
                        dayDisplay = '<small class="text-muted">เริ่มต้นระบบ</small>';
                    } else {
                        dayDisplay = `<span class="day-badge">${item.days_spent} วัน</span>`;
                    }

                    html += `
                    <tr>
                        <td class="text-center text-muted">${index + 1}</td>
                        <td class="text-center">
                            <span class="badge badge-light border text-secondary">${item.status_code || '-'}</span>
                        </td>
                        <td>
                            <div class="status-dot"></div>
                            <span class="font-weight-bold">${item.status_name}</span>
                        </td>
                        <td class="text-center">
                            <span class="text-dark"><i class="far fa-calendar-alt mr-1"></i> ${item.status_date}</span>
                        </td>
                        <td class="text-center">
                            ${dayDisplay}
                        </td>
                    </tr>`;
                });
            }
            $('#tableBody').html(html);
        }
    </script>
</body>
</html>