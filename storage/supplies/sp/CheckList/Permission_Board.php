<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <title>บริหารจัดการสิทธิ์ BI Dashboard</title>
    <!-- CSS -->
    <link rel="stylesheet" href="../php-notic/bootstrap/css/bootstrap.min.css" />
    <link rel="stylesheet" href="../sp/dboard/assets/plugins/fontawesome/css/all.min.css">

    <style>
        body {
            background-color: #e9ecef;
            font-family: 'Sarabun', sans-serif;
        }

        .card {
            border: none;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .card-header {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            /* Deep Blue Gradient */
            color: white;
            border-radius: 10px 10px 0 0 !important;
            padding: 15px 20px;
        }

        .btn-add {
            background-color: #fff;
            color: #1e3c72;
            border: none;
            font-weight: 600;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            transition: all 0.2s;
        }

        .btn-add:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            background-color: #f8f9fa;
        }

        .table thead th {
            background-color: #f1f3f5;
            color: #495057;
            border-bottom: 2px solid #dee2e6;
            text-transform: uppercase;
            font-size: 0.85rem;
            letter-spacing: 0.5px;
        }

        .table tbody tr:hover {
            background-color: #f8f9fa;
        }

        .status-badge {
            cursor: pointer;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
            transition: all 0.2s;
        }

        .status-active {
            background-color: #d4edda;
            color: #155724;
        }

        .status-active:hover {
            background-color: #c3e6cb;
        }

        .status-inactive {
            background-color: #f8d7da;
            color: #721c24;
        }

        .status-inactive:hover {
            background-color: #f5c6cb;
        }

        .action-btn {
            width: 32px;
            height: 32px;
            padding: 0;
            line-height: 32px;
            text-align: center;
            border-radius: 50%;
            margin-left: 5px;
            transition: all 0.2s;
        }

        .action-btn:hover {
            transform: scale(1.1);
        }

        /* Autocomplete Styles */
        .autocomplete-results {
            position: absolute;
            z-index: 1000;
            background: white;
            border: 1px solid #ddd;
            width: 95%;
            max-height: 200px;
            overflow-y: auto;
            border-radius: 0 0 5px 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            display: none;
        }

        .autocomplete-item {
            padding: 8px 12px;
            cursor: pointer;
            border-bottom: 1px solid #eee;
        }

        .autocomplete-item:hover {
            background-color: #f8f9fa;
            color: #1e3c72;
        }

        /* Loading Overlay */
        #loadingOverlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.9);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            display: none;
            /* Default hidden */
        }

        .loading-text {
            font-size: 1.2rem;
            font-weight: 600;
            color: #007bff;
            /* Blue text */
            margin-bottom: 15px;
        }

        .loading-bar-container {
            width: 300px;
            height: 8px;
            background-color: #e9ecef;
            border-radius: 4px;
            overflow: hidden;
        }

        .loading-bar-fill {
            height: 100%;
            background-color: #007bff;
            /* Blue fill */
            width: 30%;
            animation: loadingAnimation 1.5s infinite ease-in-out;
        }

        @keyframes loadingAnimation {
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
    </style>
</head>

<body>

    <div id="loadingOverlay">
        <div class="loading-text">Processing Data...</div>
        <div class="loading-bar-container">
            <div class="loading-bar-fill"></div>
        </div>
    </div>

    <div class="container-fluid mt-4">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0"><i class="fas fa-user-shield mr-2"></i> กำหนดสิทธิ์เข้าใช้งาน BI Dashboard</h5>
                <button class="btn btn-add btn-sm px-3" data-toggle="modal" data-target="#addUserModal">
                    <i class="fas fa-plus-circle mr-1"></i> เพิ่มผู้ใช้งาน
                </button>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table mb-0" id="permTable">
                        <thead>
                            <tr>
                                <th class="text-center" width="5%">#</th>
                                <th width="30%">ชื่อ - นามสกุล</th>
                                <th width="20%">Username</th>
                                <th width="25%">หมายเหตุ</th>
                                <th width="10%" class="text-center">สถานะ</th>
                                <th width="10%" class="text-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody id="tableBody">
                            <!-- Data -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Add User -->
    <div class="modal fade" id="addUserModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header bg-light">
                    <h5 class="modal-title text-primary"><i class="fas fa-user-plus"></i> เพิ่มผู้ใช้งาน</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group position-relative">
                        <label class="font-weight-bold">ค้นหาชื่อผู้ใช้งาน</label>
                        <input type="text" class="form-control" id="searchUserInput" placeholder="พิมพ์ชื่อ หรือ username เพื่อค้นหา..." autocomplete="off">
                        <input type="hidden" id="selectedUserId">
                        <div id="autocompleteResults" class="autocomplete-results"></div>
                    </div>
                    <div class="form-group">
                        <label class="font-weight-bold">หมายเหตุ (Optional)</label>
                        <input type="text" class="form-control" id="userNote" placeholder="ระบุหน่วยงาน หรือเหตุผล">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">ยกเลิก</button>
                    <button type="button" class="btn btn-primary px-4" onclick="addUser()">บันทึก</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Confirm Delete -->
    <div class="modal fade" id="confirmModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header bg-danger text-white">
                    <h5 class="modal-title"><i class="fas fa-exclamation-triangle"></i> ยืนยันการลบ</h5>
                    <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p>คุณต้องการลบสิทธิ์การใช้งานของผู้ใช้นี้ใช่หรือไม่?</p>
                    <input type="hidden" id="deleteId">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">ยกเลิก</button>
                    <button type="button" class="btn btn-danger" onclick="confirmDelete()">ยืนยันลบ</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Alert -->
    <div class="modal fade" id="alertModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header bg-info text-white" id="alertHeader">
                    <h5 class="modal-title" id="alertTitle"><i class="fas fa-info-circle"></i> แจ้งเตือน</h5>
                    <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p id="alertMessage"></p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-dismiss="modal">ตกลง</button>
                </div>
            </div>
        </div>
    </div>

    <!-- JS -->
    <script src="../js/jquery.min.js"></script>
    <script src="../js/bootstrap.min.js"></script>

    <script>
        const API_URL = 'api/mnPermission.php';
        let searchTimeout;

        $(document).ready(function() {
            loadData();

            // Custom Autocomplete
            $('#searchUserInput').on('keyup', function() {
                let term = $(this).val();
                if (term.length < 2) {
                    $('#autocompleteResults').hide();
                    return;
                }

                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(function() {
                    $.getJSON(API_URL, {
                        mode: 'SEARCH_USER',
                        q: term
                    }, function(res) {
                        let html = '';
                        if (res.results && res.results.length > 0) {
                            res.results.forEach(user => {
                                let badge = '';
                                let clickAction = `onclick="selectUser(${user.id}, '${user.text.replace(/'/g, "\\'")}')"`;
                                let itemClass = 'autocomplete-item';

                                if (user.has_permission == 1) {
                                    if (user.enabled == 1) {
                                        badge = '<span class="badge badge-success float-right ml-2" style="font-size:0.7rem">มีสิทธิ์ใช้งานแล้ว</span>';
                                    } else {
                                        badge = '<span class="badge badge-secondary float-right ml-2" style="font-size:0.7rem">ถูกระงับสิทธิ์</span>';
                                    }
                                    // Optional: Disable clicking if you don't want them to re-add? 
                                    // But user might want to re-add to re-enable or update note.
                                    // Let's allow clicking but maybe show a visual cue.
                                    itemClass += ' bg-light';
                                }

                                html += `<div class="${itemClass}" ${clickAction}>
                                <i class="fas fa-user mr-2 text-muted"></i> ${user.text} ${badge}
                            </div>`;
                            });
                            $('#autocompleteResults').html(html).show();
                        } else {
                            $('#autocompleteResults').html('<div class="p-2 text-muted">ไม่พบข้อมูล</div>').show();
                        }
                    });
                }, 300);
            });
            // Hide results when clicking outside
            $(document).on('click', function(e) {
                if (!$(e.target).closest('.position-relative').length) {
                    $('#autocompleteResults').hide();
                }
            });
        });

        function selectUser(id, text) {
            $('#searchUserInput').val(text);
            $('#selectedUserId').val(id);
            $('#autocompleteResults').hide();
        }

        function loadData() {
            $('#loadingOverlay').css('display', 'flex'); // Show loading

            $.getJSON(API_URL, {
                mode: 'LIST'
            }, function(res) {
                if (res.success) {
                    renderTable(res.data);
                }
                setTimeout(() => {
                    $('#loadingOverlay').fadeOut(200); // Hide loading
                }, 300); // Small delay for smoothness
            }).fail(function() {
                $('#loadingOverlay').fadeOut(200);
            });
        }

        function renderTable(data) {
            let html = '';
            if (data.length === 0) {
                html = '<tr><td colspan="6" class="text-center text-muted p-5">ไม่พบข้อมูลผู้ได้รับสิทธิ์<br><small>คลิกปุ่ม "เพิ่มผู้ใช้งาน" ด้านบนเพื่อเริ่มใช้งาน</small></td></tr>';
            } else {
                data.forEach((item, index) => {
                    let statusBadge = item.enabled == 1 ?
                        `<span class="status-badge status-active" onclick="toggleStatus(${item.id}, 0)" title="คลิกเพื่อระงับสิทธิ์"><i class="fas fa-check-circle mr-1"></i> ใช้งานปกติ</span>` :
                        `<span class="status-badge status-inactive" onclick="toggleStatus(${item.id}, 1)" title="คลิกเพื่อเปิดใช้งาน"><i class="fas fa-minus-circle mr-1"></i> ระงับการใช้งาน</span>`;

                    let delBtn = `<button class="btn btn-outline-danger action-btn" onclick="askDelete(${item.id})" title="ลบสิทธิ์"><i class="fas fa-trash-alt"></i></button>`;

                    html += `<tr>
                    <td class="text-center">${index + 1}</td>
                    <td class="font-weight-bold text-primary">${item.name || '-'}</td>
                    <td><span class="badge badge-light border">${item.username || '-'}</span></td>
                    <td class="text-muted small">${item.note || '-'}</td>
                    <td class="text-center">
                        ${statusBadge}
                    </td>
                    <td class="text-center">
                        ${delBtn}
                    </td>
                </tr>`;
                });
            }
            $('#tableBody').html(html);
        }

        function addUser() {
            let userId = $('#selectedUserId').val();
            let note = $('#userNote').val();

            if (!userId) {
                showAlert('กรุณาเลือกผู้ใช้งานจากรายการค้นหา', 'warning');
                return;
            }

            $.post(API_URL, {
                mode: 'ADD',
                dc_user_id: userId,
                c_note: note
            }, function(res) {
                res = JSON.parse(res);
                if (res.success) {
                    $('#addUserModal').modal('hide');
                    $('#searchUserInput').val('');
                    $('#selectedUserId').val('');
                    $('#userNote').val('');
                    loadData();
                    showAlert('บันทึกข้อมูลเรียบร้อยแล้ว', 'success');
                } else {
                    showAlert('เกิดข้อผิดพลาดในการบันทึก', 'danger');
                }
            });
        }

        function toggleStatus(id, enabled) {
            $.post(API_URL, {
                mode: 'UPDATE_STATUS',
                id: id,
                enabled: enabled
            }, function(res) {
                loadData();
            });
        }

        function askDelete(id) {
            $('#deleteId').val(id);
            $('#confirmModal').modal('show');
        }

        function confirmDelete() {
            let id = $('#deleteId').val();
            $.post(API_URL, {
                mode: 'DELETE',
                id: id
            }, function(res) {
                $('#confirmModal').modal('hide');
                loadData();
            });
        }

        function showAlert(msg, type = 'info') {
            $('#alertMessage').text(msg);
            let headerColor = 'bg-info';
            if (type === 'success') headerColor = 'bg-success';
            if (type === 'warning') headerColor = 'bg-warning';
            if (type === 'danger') headerColor = 'bg-danger';

            $('#alertHeader').removeClass('bg-info bg-success bg-warning bg-danger').addClass(headerColor);
            $('#alertModal').modal('show');
        }
    </script>

</body>

</html>