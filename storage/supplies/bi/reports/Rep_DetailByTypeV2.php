<?php
include("../api/List_DetailBg.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();
$title = CUSTOMER_NAME_TH;
$year_th = $_REQUEST["year_en"] + 543;
$caption = "รายงานพัสดุ " . $year_th;
$data_dtl = json_decode(List_QueryParam(), true);

// if ($_REQUEST["type"] == "excel") {
// 	$export->headerExcel($caption);
// }

$data = $data_dtl["data"] ?? [];
function thaiDate($dateStr)
{
	if (!$dateStr || $dateStr === '0000-00-00') return '-';

	$months = [
		"",
		"มกราคม",
		"กุมภาพันธ์",
		"มีนาคม",
		"เมษายน",
		"พฤษภาคม",
		"มิถุนายน",
		"กรกฎาคม",
		"สิงหาคม",
		"กันยายน",
		"ตุลาคม",
		"พฤศจิกายน",
		"ธันวาคม"
	];

	$date = new DateTime($dateStr);
	$day = (int)$date->format("j");
	$month = (int)$date->format("n");
	$year = (int)$date->format("Y") + 543;

	return "{$day} {$months[$month]} {$year}";
}
$sum_chk = 0;
$sum_total_amt = 0;
// $installments = [];
// print_r( $data );
// exit;

?>
<!DOCTYPE html>
<html lang="th">

<head>
	<div class="mb-2">
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title><?php echo $caption; ?></title>
		<script src="../../ws_user/js/jquery.min.js"></script>
		<script src="../bootstrap/bootstrap-4.6.2-dist/js/bootstrap.bundle.min.js"></script>
		<link rel="stylesheet" type="text/css" href="../bootstrap/bootstrap-4.6.2-dist/css/bootstrap.min.css">
		<link rel="stylesheet" type="text/css" href="../../css/report_css.css" />

		<style>
			body {
				padding: 2rem;
			}

			.table thead th {
				background-color: #f1f1f1;
			}

			.table td:hover {
				background-color: rgb(154, 185, 212);
				cursor: pointer;
			}

			thead th {
				position: sticky;
				top: 0;
				background: white;
				z-index: 2;
			}
		</style>
	</div>
</head>

<body>
	<h3 class="mb-4"><?php echo $caption; ?></h3>
	<div class="container-fluid mt-4">
		<div class="bg-light rounded shadow-sm px-4" style="min-height: 95px; display: flex; align-items: center; justify-content: space-around;">

			<form class="form-inline d-flex flex-wrap justify-content-center">
				<div style="display: flex;justify-content: space-between;align-items: center;">
					<div class="form-group d-flex align-items-center padding-right:10px">
						<input class="form-control mb-3 w-900" id="tableSearch" placeholder="ค้นหา...">
					</div>
				</div>
				<!-- </div> -->
			</form>
			<div class="d-flex justify-content-between align-items-center mb-2">

				<button type="button" onclick="exportTableToExcel()" class="btn btn-success ml-2">
					<!-- <img src="../images/excel.png" alt="Export to Excel"> -->
					ดาวน์โหลด Excel
				</button>
			</div>
		</div>
		<!-- <div id="table-container" style="overflow-x: auto;" class="table-responsive"> -->
		<div class="container-fluid">
			<table class="table table-bordered table-striped table-hover">
				<thead class="table-light text-center ">
					<tr>
						<th style="vertical-align:middle;" nowrap>-</th>
						<th style="vertical-align:middle;" nowrap>ลำดับที่</th>
						<th style="vertical-align:middle;" nowrap>เลขที่ PR</th>
						<th style="vertical-align:middle;" nowrap>สถานะ</th>
						<th style="vertical-align:middle;" nowrap>ประเภท PR</th>
						<th style="vertical-align:middle;" nowrap>เลขที่สัญญา</th>
						<th style="vertical-align:middle;" nowrap>ประเภทสัญญา</th>
						<th style="vertical-align:middle;" nowrap>ประเภทของที่ได้มา</th>
						<th style="vertical-align:middle;" nowrap>ประเภทงาน</th>
						<th style="vertical-align:middle;" nowrap>สายงาน</th>
						<th style="vertical-align:middle;" nowrap>ผู้รับผิดชอบงาน</th>
						<th style="vertical-align:middle;" nowrap>เมนู</th>
						<th style="vertical-align:middle;" nowrap>หน่วยงานเจ้าของเรื่อง</th>
						<th style="vertical-align:middle;" nowrap>ชื่อรายการ</th>
						<th style="vertical-align:middle;" nowrap>แหล่งเงิน</th>
						<th style="vertical-align:middle;" nowrap>หมวดค่าใช้จ่าย</th>
						<th style="vertical-align:middle;" nowrap>ปีงบประมาณ</th>
						<th style="vertical-align:middle;" nowrap>จำนวนเงิน</th>

					</tr>
				</thead>
				<tbody>
					<?php foreach ($data as $i => $row): ?>
						<!-- <tr class="clickable" data-toggle="collapse" data-target="#expand<?= $i ?>" aria-expanded="false" aria-controls="expand<?= $i ?>">
							<td><button class="btn btn-sm btn-info"> + </button></td> -->
						<!-- <tr  style="vertical-align:middle;" nowrap> -->
						<!-- <tr data-toggle="collapse" data-target="#detail" class="clickable"> -->
						<tr class="clickable" data-toggle="collapse" data-target="#expand<?= $i ?>" aria-expanded="false" aria-controls="expand<?= $i ?>">
							<td><button class="btn btn-sm btn-info toggle-details"><i class="fas fa-plus">+</i></button></td>
							<td class="text-center"><?= $i + 1 ?></td>
							<td nowrap style='' data-toggle="tooltip" title="<?= $row['c_code'] ?>"> <?= $row['c_code'] ?? '-' ?></td>
							<td nowrap style='' data-toggle="tooltip" title="<?= $row['i_enabled'] ?>"> <?= $row['i_enabled'] ?? '-' ?></td>
							<td nowrap style='' data-toggle="tooltip" title="<?= $row['i_type_bg'] ?>"> <?= $row['i_type_bg'] ?? '-' ?></td>
							<td nowrap style='' data-toggle="tooltip" title="<?= $row['po_code'] ?>"> <?= $row['po_code'] ?? '-' ?></td>
							<td nowrap style='' data-toggle="tooltip" title="<?= strip_tags($row['i_type_contract']) ?>"> <?= strip_tags($row['i_type_contract'] ?? '-') ?></td>
							<td nowrap style='' data-toggle="tooltip" title="<?= strip_tags($row['i_product_type']) ?>"> <?= strip_tags($row['i_product_type'] ?? '-') ?></td>
							<td nowrap style='' data-toggle="tooltip" title="<?= strip_tags($row['i_purchase']) ?>"> <?= strip_tags($row['i_purchase'] ?? '-') ?></td>
							<td nowrap style='' data-toggle="tooltip" title="<?= $row['dc_department'] ?>"> <?= $row['dc_department'] ?? '-' ?></td>
							<td nowrap style='' data-toggle="tooltip" title="<?= $row['sp_emp'] ?>"> <?= $row['sp_emp'] ?? '-' ?></td>
							<td nowrap style='' data-toggle="tooltip" title="<?= $row['tor_type'] ?>"> <?= $row['tor_type'] ?? '-' ?></td>
							<td nowrap style='' data-toggle="tooltip" title="<?= $row['dc_cost2_id'] ?>"> <?= $row['dc_cost2_id'] ?? '-' ?></td>
							<td nowrap style='' data-toggle="tooltip" title="<?= $row['c_name'] ?>"> <?= $row['c_name'] ?? '-' ?></td>
							<td nowrap style='' data-toggle="tooltip" title="<?= $row['dc_expense_budget_type'] ?>"> <?= $row['dc_expense_budget_type'] ?? '-' ?></td>
							<td nowrap style='' data-toggle="tooltip" title="<?= $row['po_expense'] ?>"> <?= $row['po_expense'] ?? '-' ?></td>
							<td nowrap style='' data-toggle="tooltip" title="<?= $row['i_pr_year'] ?>"> <?= $row['i_pr_year'] ?? '-' ?></td>
							<td nowrap style='' align='right'><?= number_format($row["f_total_amt"], 2)  ?? '-' ?></td>
						</tr>
						<tr id="expand<?= $i ?>" class="collapse expandable-content">
							<td colspan="14">
								<div class="p-3 bg-light">
									<!-- <strong>รายละเอียดเพิ่มเติม</strong> -->
									<table class="table table-sm table-bordered mt-2 mb-0">
										<!-- <tr style="vertical-align:middle;" nowrap> -->
										<thead class="table-light text-center">
											<th style="width: 100px; text-align: center" nowrap>งวด</th>
											<th style="width: 100px; text-align: center" nowrap>วันที่รับของ</th>
											<th style="width: 100px; text-align: center" nowrap>เลขที่รับของ</th>
											<th style="width: 100px; text-align: center" nowrap>จำนวนเงินรับของ</th>
											<th style="width: 100px; text-align: center" nowrap>วันที่ตรวจรับ</th>
											<th style="width: 100px; text-align: center" nowrap>เลขที่ตรวจรับ</th>
											<th style="width: 100px; text-align: center" nowrap>จำนวนเงินตรวจรับ</th>
											<th style="width: 100px; text-align: center" nowrap>เลขที่ใบเบิก</th>
											<th style="width: 100px; text-align: center" nowrap>เอกสารประกอบ</th>
											<th style="width: 100px; text-align: center" nowrap>วันที่ส่งเบิก</th>
											<th style="width: 100px; text-align: center" nowrap>จำนวนเงินที่ส่งเบิก</th>
										</thead>
										<!-- <tbody> -->
										<!-- </tbody> -->
										<tbody>
											<?php if (!empty($row['children'])): ?>
												<?php foreach ($row['children'] as $child): ?>
													<?php
													$sum_chk += $child['f_chk'] ?? 0;
													$sum_total_amt += $child['f_period'] ?? 0;
													?>
													<tr>
														<!-- <td nowrap style="text-align:center"> -->
														<td nowrap style="width: 100px; text-align: center;">
															<?= $child['i_period']  ?>
														</td>
														<td nowrap style="text-align:center">
															<?= isset($child['d_arrive_date']) ? thaiDate($child['d_arrive_date']) : '-' ?>
														</td>
														<td nowrap style="text-align:center">
															<?= $child['c_arrive_code'] ?? '-' ?>
														</td>
														<td nowrap style="text-align:right">
															<?= number_format($child["f_period"], 2)  ?? '-' ?>
														</td>
														<td nowrap style="text-align:center">
															<?= $child['c_code_chk'] ?? '-' ?>
														</td>
														<td nowrap style="text-align:center">
															<?= isset($child['d_checking_date']) ? thaiDate($child['d_checking_date']) : '-' ?>
														</td>
														<td nowrap style="text-align:right">
															<?= number_format($child["f_chk"], 2)  ?? '-' ?>
														</td>
														<td class="text-center">
															<a href="download.php?id=<?= $child['sp_tor_contract_id'] ?>" class="btn btn-sm btn-outline-success rounded-pill">
																<i class="fas fa-print"></i> <?= $child['c_code_ref'] ?? '-' ?>
															</a>
														</td>
														<td class="text-center">
															<button type="button" class="btn btn-sm btn-outline-primary rounded-pill">
																<i class="fas fa-eye"></i> เอกสารประกอบใบขอเบิก
															</button>
														</td>
														<td nowrap style="text-align:center">
															<?= isset($child['d_doc_date']) ? thaiDate($child['d_doc_date']) : '-' ?>
														</td>
														<td nowrap style="text-align:right">
															<?= number_format($child["f_total_amt"], 2)  ?? '-' ?>
														</td>


													</tr>
												<?php endforeach; ?>
												<tr class="bg-light font-weight-bold">
													<td colspan="3" class="text-right">รวมรับของ</td>
													<td class="text-right"><?= number_format($sum_total_amt, 2) ?></td>
													<td colspan="2" class="text-right">รวมตรวจรับ</td>
													<td class="text-right"><?= number_format($sum_chk, 2) ?></td>
													<td colspan="3" class="text-right">รวมเบิก</td>
													<td class="text-right"><?= number_format($sum_chk, 2) ?></td>
												</tr>
											<?php else: ?>
												<tr>
													<td colspan="3" class="text-center text-muted">ไม่มีข้อมูล</td>
												</tr>
											<?php endif; ?>
										</tbody>

										<!-- </tr> -->
										<!-- <tr style="vertical-align:middle;" nowrap> -->
										<!-- </tr> -->
										<!-- <tr style="vertical-align:middle;" nowrap> -->
						</tr>
			</table>
		</div>
		</td>
		</tr>

	<?php endforeach; ?>
	</tbody>
	</table>
	</div>
	</div>
	<!-- ส่วนท้ายสุดของไฟล์ PHP -->
	<script type="text/javascript">
		$("#tableSearch").on("keyup", function() {
			let value = $(this).val().toLowerCase();
			$("table tbody tr").filter(function() {
				$(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
			});
		});
		$("#toggleCol").on("change", function() {
			let colIndex = 3;
			$("table tr").each(function() {
				$(this).find("td:eq(" + colIndex + "), th:eq(" + colIndex + ")").toggle();
			});
		});
		let expanded = false;

		document.getElementById("toggleAllBtn").addEventListener("click", function() {
			const allDetails = document.querySelectorAll(".expandable-content");
			const isAnyOpen = [...allDetails].some(e => e.classList.contains("show"));

			allDetails.forEach(e => {
				if (isAnyOpen) {
					e.classList.remove("show");
				} else {
					e.classList.add("show");
				}
			});

			this.textContent = isAnyOpen ? "เปิดทั้งหมด" : "ปิดทั้งหมด";
		});

		let count = $('#myTable tbody tr:visible').length;
		$('#rowCount').text(`แสดงทั้งหมด ${count} รายการ`);

		// $("#filterStatus").on("change", function() {
		// 	// console.log($(this));
		// 	let value = $(this).val();
		// 	$("table tbody tr").each(function() {
		// 		const match = $(this).text().indexOf(value) > -1;
		// 		// console.log(match);
		// 		$(this).toggle(!value || match);
		// 	});
		// });
	</script>

</body>

</html>