<?php
include("../api/List_Report_ChartDetail.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();
$title = defined('CUSTOMER_NAME_TH') ? CUSTOMER_NAME_TH : 'รายงาน';
$year_en = isset($_REQUEST["year_en"]) ? $_REQUEST["year_en"] : date('Y');
$year_th = $year_en + 543;

// ดึงข้อมูล
$data_json = List_QueryParam();
$data_arr = json_decode($data_json, true);
$data = $data_arr["data"] ?? [];

// คำนวณยอดรวมสำหรับ Summary Cards
$total_count = count($data);
$total_amount = 0;
foreach ($data as $row) {
	$total_amount += isset($row['f_amt']) ? floatval($row['f_amt']) : 0;
}

function thaiDate($dateStr)
{
	if (!$dateStr || $dateStr === '0000-00-00') return '-';
	$months = ["", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
	$date = new DateTime($dateStr);
	return (int)$date->format("j") . " " . $months[(int)$date->format("n")] . " " . ((int)$date->format("Y") + 543);
}
?>
<!DOCTYPE html>
<html lang="th">

<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="shortcut icon" href="../../images/favicon.ico" type="image/x-icon">
	<link rel="icon" href="../../images/favicon.ico" type="image/x-icon">
	<title>Pie Dashboard - ฝ่ายพัสดุ</title>

	<?php include("../lib/loadJs.php"); ?>
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

	<link rel="stylesheet" type="text/css" href="../css/report-style-table.css">


	<script type="text/javascript" src="../js/storeRep/storeRep.js?_dc<?= __VPRODUCT_; ?>"></script>

</head>

<body>
	<div class="container-fluid pt-4 pb-5">

		<div class="row mb-4">
			<div class="col-12 mb-3">
				<h4 class="font-weight-bold">รายละเอียดข้อมูล PR (ปีงบประมาณ <?= $year_th ?>)</h4>
				<p class="text-muted">รายการใบขอซื้อ/ขอจ้างทั้งหมดในระบบ</p>
			</div>

			<div class="col-md-3 col-sm-6 mb-3">
				<div class="stat-card" style="border-left-color: #4e73df;">
					<div class="stat-title">จำนวนรายการ (PR)</div>
					<div class="stat-value"><?= number_format($total_count) ?> <small style="font-size:1rem;">รายการ</small></div>
				</div>
			</div>
			<div class="col-md-3 col-sm-6 mb-3">
				<div class="stat-card" style="border-left-color: #1cc88a;">
					<div class="stat-title">ยอดเงินรวม (บาท)</div>
					<div class="stat-value text-success"><?= number_format($total_amount, 2) ?></div>
				</div>
			</div>
		</div>

		<div class="card-custom">

			<div class="toolbar">
				<div class="d-flex align-items-center">
					<div class="search-box">
						<i class="search-icon">🔍</i>
						<input type="text" id="searchInput" class="form-control" placeholder="ค้นหา เลขที่ PR, รายการ, ผู้รับผิดชอบ...">
					</div>
				</div>
				<div>
					<button class="btn btn-success btn-sm rounded-pill px-3" onclick="exportToExcel()">
						<i class="mr-1">📊</i> Export Excel
					</button>
				</div>
			</div>

			<div class="table-responsive">
				<table class="table-modern" id="prTable">
					<thead>
						<tr>
							<th class="text-center" width="50">#</th>
							<th>เลขที่ PR</th>
							<th>ชื่อรายการ</th>
							<th>ประเภทความก้าวหน้า</th>
							<th>หน่วยงาน</th>
							<th>สถานะ</th>
							<th>วันที่จัดสรรงบประมาณ</th>
							<th>วันที่หัวหน้าฝ่ายจ่ายงาน</th>
							<th>แหล่งเงิน</th>
							<th>ผู้รับผิดชอบ</th>
							<th>สายงาน</th>
							<th class="text-right">เงินจอง PR (บาท)</th>
							<th class="text-right">เงินจองสัญญา</th>
						</tr>
					</thead>
					<tbody id="prTableBody">
						<?php if (count($data) > 0): ?>
							<?php foreach ($data as $i => $row):
								// Logic เลือกสี Badge ตามสถานะ (ตัวอย่าง)
								$status = $row['sp_status_hdr'] ?? '-';
								$badgeClass = 'bg-status-gray';
								if (strpos($status, 'e-GP') !== false) $badgeClass = 'bg-status-blue';
								elseif (strpos($status, 'อนุมัติ') !== false) $badgeClass = 'bg-status-green';
								elseif (strpos($status, 'รอ') !== false) $badgeClass = 'bg-status-orange';
							?>
								<tr>
									<td class="text-center text-muted"><?= $i + 1 ?></td>
									<td class="font-weight-bold text-primary"><?= $row['c_code'] ?? '-' ?></td>
									<td style="vertical-align: top;">
										<div class="text-left" style="min-width: 350px; white-space: normal; word-wrap: break-word; line-height: 1.4;">
											<?= $row['c_name'] ?? '-' ?>
										</div>
									</td>
									<td>
										<small class="d-block text-muted"><?= $row['event_type'] ?? '-' ?></small>
										<?= $row['sp_event_detail'] ?? '' ?>
									</td>
									<td>
										<div style="font-size:0.9rem;"><?= $row['dc_cost_id2'] ?? '-' ?></div>
										<small class="text-muted"><?= $row['dc_sub_cost'] ?? '' ?></small>
									</td>
									<td>
										<span class="badge-custom <?= $badgeClass ?>"><?= $status ?></span>
									</td>
									<td><?= thaiDate($row['d_act_date_dt26']) ?></td>
									<td><?= thaiDate($row['d_act_date_dt24']) ?></td>
									<td>
										<div style="font-size:0.9rem;"><?= $row['dc_expense_budget_type'] ?? '-' ?></div>
										<small class="text-muted"><?= $row['bg_expense'] ?? '' ?></small>
									</td>
									<td><?= $row['sp_emp'] ?? '-' ?></td>
									<td><?= $row['dc_department'] ?? '-' ?></td>
									<td class="text-right font-weight-bold"><?= number_format((float)$row['f_amt'], 2) ?></td>
									<td class="text-right text-muted">-</td>
								</tr>
							<?php endforeach; ?>
						<?php else: ?>
							<tr>
								<td colspan="10" class="text-center py-5">ไม่พบข้อมูล</td>
							</tr>
						<?php endif; ?>
					</tbody>
				</table>
			</div>

			<div class="p-3 text-right text-muted small border-top">
				ข้อมูล ณ วันที่ <?= date("d/m/Y H:i") ?>
			</div>
		</div>
	</div>

	<script>
		// 1. Search Function
		$(document).ready(function() {
			$("#searchInput").on("keyup", function() {
				var value = $(this).val().toLowerCase();
				$("#prTableBody tr").filter(function() {
					$(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
				});
			});
		});

		// 2. Export Excel Function
		function exportToExcel() {
			var wb = XLSX.utils.table_to_book(document.getElementById('prTable'), {
				sheet: "PR Data"
			});
			var wbout = XLSX.write(wb, {
				bookType: 'xlsx',
				bookSST: true,
				type: 'binary'
			});

			function s2ab(s) {
				var buf = new ArrayBuffer(s.length);
				var view = new Uint8Array(buf);
				for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
				return buf;
			}
			// สร้าง Blob และ Download
			var blob = new Blob([s2ab(wbout)], {
				type: "application/octet-stream"
			});
			var url = window.URL.createObjectURL(blob);
			var anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = "PR_Report_<?= date('Ymd_Hi') ?>.xlsx";
			anchor.click();
			window.URL.revokeObjectURL(url);
		}
	</script>
</body>

</html>