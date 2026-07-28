<!DOCTYPE html>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="shortcut icon" href="../../images/favicon.ico" type="image/x-icon">
	<link rel="icon" href="../../images/favicon.ico" type="image/x-icon">
	<title>รายละเอียดการเบิก/ทักท้วง (Reply Detail) - ฝ่ายพัสดุ</title>

	<?php include("../lib/loadJs.php"); ?>
	<script src="../../ws_user/js/jquery.min.js"></script>
	<script src="../bootstrap/bootstrap-4.6.2-dist/js/bootstrap.bundle.min.js"></script>
	<script src="../lib/xlsx.full.min.js"></script>

	<link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
	<link rel="stylesheet" type="text/css" href="../css/report-style.css">
	<link rel="stylesheet" type="text/css" href="../bootstrap/bootstrap-4.6.2-dist/css/bootstrap.min.css">
	<link rel="stylesheet" type="text/css" href="../css/report-style-table.css">
	<style>
		body {
			background-color: #f4f6f9;
			font-family: 'Sarabun', sans-serif;
		}

		.card-custom {
			background-color: #fff;
			border-radius: 8px;
			box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
			padding: 20px;
			margin-bottom: 20px;
		}

		/* Stat Card Style from reference */
		.stat-card {
			background: #fff;
			border-radius: 8px;
			padding: 20px;
			box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
			border-left: 5px solid #ccc;
			height: 100%;
		}

		.stat-title {
			font-size: 0.9em;
			color: #888;
			margin-bottom: 5px;
			font-weight: 500;
		}

		.stat-value {
			font-size: 1.8em;
			font-weight: bold;
			color: #333;
		}

		.border-sent {
			border-left-color: #28a745;
		}

		.border-reply {
			border-left-color: #dc3545;
		}

		.text-sent {
			color: #28a745;
		}

		.text-reply {
			color: #dc3545;
		}

		/* Table overrides if needed, but table-modern should handle most */
		.table-modern th {
			background-color: #0056b3;
			color: white;
			text-align: center;
			font-weight: 500;
		}

		.badge-status {
			padding: 5px 10px;
			border-radius: 12px;
			font-size: 0.8em;
			font-weight: normal;
			white-space: nowrap;
			display: inline-block;
		}

		.bg-status-sent {
			background-color: #e6fffa;
			color: #00796b;
			border: 1px solid #b2dfdb;
		}

		.bg-status-reply {
			background-color: #ffebee;
			color: #c62828;
			border: 1px solid #ffcdd2;
		}
	</style>

	<script type="text/javascript">
		$(document).ready(function() {
			// Parse URL Parameters
			const urlParams = new URLSearchParams(window.location.search);
			const yearTh = urlParams.get('year_th') || (new Date().getFullYear() + 543);
			const monthIdx = urlParams.get('month_idx');
			const staff = urlParams.get('staff') || '';
			const dataType = urlParams.get('data_type') || 'sent';

			// Set Title Info
			let monthName = "ทั้งหมด";
			if (monthIdx && monthIdx >= 0) {
				const months = ["ต.ค.", "พ.ย.", "ธ.ค.", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย."];
				monthName = months[monthIdx];
			}
			$("#title_info").text(`ปีงบประมาณ ${yearTh} | เดือน: ${monthName}`);

			loadDetailData(yearTh, monthIdx, staff, dataType);

			// Search Function
			$("#searchInput").on("keyup", function() {
				var value = $(this).val().toLowerCase();
				$("#tableBody tr").filter(function() {
					$(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
				});
			});
		});

		function loadDetailData(yearTh, monthIdx, staff, dataType) {
			$("#loading_spinner").show();

			Ext.Ajax.request({
				url: "../api/List_Report_StatusReplyDetail.php",
				method: "POST",
				params: {
					fn: "List_QueryParam",
					year_th: yearTh,
					month_idx: monthIdx,
					staff: staff,
					data_type: dataType
				},
				success: function(resp) {
					try {
						const obj = Ext.decode(resp.responseText);
						if (obj.success && obj.data) {
							renderTable(obj.data);
							calculateHeaderSummary(obj.data);
						} else {
							console.error("API Error:", obj.message);
							$("#tableBody").html('<tr><td colspan="15" class="text-center text-danger py-4">ไม่พบข้อมูล</td></tr>');
							$("#sum_sent").text("0");
							$("#sum_reply").text("0");
						}
					} catch (e) {
						console.error("Decode Error", e);
					} finally {
						$("#loading_spinner").hide();
					}
				},
				failure: function() {
					console.error("Ajax Failed");
					$("#loading_spinner").hide();
				}
			});
		}

		function calculateHeaderSummary(data) {
			// Count rows
			let totalSent = data.length;
			// Count rows where is_reply is true
			let totalReply = data.filter(d => d.is_reply).length;

			$("#sum_sent").text(totalSent.toLocaleString());
			$("#sum_reply").text(totalReply.toLocaleString());
		}

		function formatThaiDateShort(dateStr) {
			if (!dateStr || dateStr === '-' || dateStr === '') return '';
			let d, m, y;
			// Check format d/m/Y
			if (dateStr.indexOf('/') > -1) {
				const parts = dateStr.split('/');
				if (parts.length === 3) {
					d = parseInt(parts[0], 10);
					m = parseInt(parts[1], 10);
					y = parseInt(parts[2], 10);
				}
			} else if (dateStr.indexOf('-') > -1) {
				// Check format Y-m-d
				const parts = dateStr.split('-');
				if (parts.length === 3) {
					y = parseInt(parts[0], 10);
					m = parseInt(parts[1], 10);
					d = parseInt(parts[2], 10);
				}
			}

			if (d && m && y) {
				const thaiMonths = ["", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
				const yThai = (y + 543).toString().slice(-2);
				return `${d} ${thaiMonths[m]} ${yThai}`;
			}
			return dateStr;
		}

		function renderTable(data) {
			let html = "";
			if (data.length === 0) {
				html = '<tr><td colspan="15" class="text-center py-4">ไม่พบข้อมูล</td></tr>';
			} else {
				data.forEach((item, index) => {
					const statusText = item.is_reply ? "โดนทักท้วง" : "ส่งเบิกปกติ";
					const badgeClass = item.is_reply ? "bg-status-reply" : "bg-status-sent";

					// Format Dates
					const createDate = formatThaiDateShort(item.d_create);
					const replyDate = formatThaiDateShort(item.d_receive_date);

					const empName = (item.emp || '-').replace(' ', '<br>');

					html += `
                        <tr>
                            <td class="text-center text-muted">${item.row_num}</td>
                            <td>${createDate}</td>
                            <td class="font-weight-bold text-primary">${item.c_code || '-'}</td>
                            <td>${item.c_code_ref || '-'}</td>
                             <td>
                                <div style="max-width: 300px; white-space: normal;">${item.c_name}</div>
                            </td>
                            <td>${item.dc_creditor || '-'}</td>
                            <td>${empName}</td> 
                            <td>${item.po_emp_name || '-'}</td>
                            <td class="text-center"><span class="badge-status ${badgeClass}">${statusText}</span></td>
                            <td class="text-center">${replyDate}</td>
                            <td>${item.c_comment}</td>
                        </tr>
                    `;
				});
			}
			$("#tableBody").html(html);
		}

		function exportToExcel() {
			var wb = XLSX.utils.table_to_book(document.getElementById('reportTable'), {
				sheet: "Sheet1"
			});
			XLSX.writeFile(wb, 'Report_StatusReply_Detail.xlsx');
		}
	</script>
</head>

<body>

	<div class="container-fluid pt-4 pb-5">

		<div class="text-center mb-4">
			<img src="../images/logo.png" alt="logo" class="report-logo" style="height: 100px; width: auto;">
		</div>

		<div class="row mb-4">
			<div class="col-12 mb-3">
				<h4 class="font-weight-bold">รายละเอียดรายการเบิก/ทักท้วง (Reply Detail)</h4>
				<p class="text-muted mb-0" id="title_info">...</p>
			</div>

			<!-- Summary Cards -->
			<div class="col-md-3 col-sm-6 mb-3">
				<div class="stat-card border-sent">
					<div class="stat-title">จำนวนรายการ (ส่งเบิก)</div>
					<div class="stat-value text-sent" id="sum_sent">0</div>
					<small class="text-muted">รายการ</small>
				</div>
			</div>
			<div class="col-md-3 col-sm-6 mb-3">
				<div class="stat-card border-reply">
					<div class="stat-title">จำนวนรายการ (ทักท้วง)</div>
					<div class="stat-value text-reply" id="sum_reply">0</div>
					<small class="text-muted">รายการ</small>
				</div>
			</div>
		</div>

		<!-- Data Table Card -->
		<div class="card-custom">
			<div class="d-flex justify-content-between align-items-center mb-3">
				<div class="search-box position-relative" style="width: 300px;">
					<input type="text" id="searchInput" class="form-control pl-4" placeholder="ค้นหา...">
					<i class="fas fa-search position-absolute text-muted" style="left: 10px; top: 10px;"></i>
				</div>
				<button class="btn btn-success btn-sm rounded-pill px-3" onclick="exportToExcel()">
					<i class="fas fa-file-excel mr-1"></i> Export Excel
				</button>
			</div>

			<div class="table-responsive">
				<div id="loading_spinner">
					<div class="spinner-border text-primary" role="status">
						<span class="sr-only">Loading...</span>
					</div>
				</div>
				<!-- Use Table Modern Class -->
				<table class="table-modern w-100" id="reportTable">
					<thead>
						<tr>
							<th width="40">#</th>
							<th width="100">วันที่ส่ง</th>
							<th width="120">เลขที่ตรวจรับ</th>
							<th width="120">เลขที่ส่งเบิก</th>
							<th>รายการ</th>
							<th>เจ้าหนี้/บริษัท</th>
							<th width="120">ผู้ส่งเบิก</th>
							<th width="120">จนท.ทักท้วง</th>
							<th width="100">สถานะ</th>
							<th width="100">วันที่ทักท้วง</th>
							<th>ข้อความทักท้วง</th>
						</tr>
					</thead>
					<tbody id="tableBody">
						<!-- Data will be injected here -->
					</tbody>
				</table>
			</div>
		</div>
	</div>

</body>

</html>