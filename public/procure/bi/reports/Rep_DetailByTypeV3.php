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
		</style>
	</div>
</head>

<body>
	<h3 class="mb-4"><?php echo $caption; ?></h3>
	<div class="container-fluid mt-4">
		<div class="bg-light rounded shadow-sm px-4" style="min-height: 100px; display: flex; align-items: center; justify-content: space-around;">
			<!-- <div class="bg-light rounded shadow-sm px-4 py-4" style="min-height: 100px;"> -->

			<div class="d-flex justify-content-between align-items-center mb-2">
				<!-- ✅ ปุ่มเปิด/ปิดทั้งหมด -->
				<div>
					<button id="toggleAllBtn" class="btn btn-secondary">เปิดทั้งหมด</button>
				</div>

				<!-- 🔍 ช่องค้นหา -->
				<div class="form-inline">
					
					<!-- <label class="mr-2">คำที่ค้นหา:</label> -->
					<!-- <input type="text" class="form-control form-control-sm" id="searchInput" placeholder="ค้นหา..."> -->
					<!-- <button class="btn btn-success ml-2">
						<i class="fa fa-file-excel-o"></i> ดาวน์โหลด Excel
					</button> -->
				</div>
			</div>
			
			<div class="d-flex justify-content-between align-items-left mb-2">
			
				<span id="rowCountLabel" class="mr-2">แสดงทั้งหมด 0 รายการ</span>
			</div>











			<form class="form-inline d-flex flex-wrap justify-content-center">
				<div style="display: flex;justify-content: space-between;align-items: center;">
					<!-- <div id="rowCount" class="text-muted small mb-2"></div> -->
					<div class="form-group d-flex align-items-center me-3">
						<label for="funding_source" style="margin:0px 10px;">คำที่ค้นหา:</label>
						<input class="form-control mb-3" id="tableSearch" placeholder="ค้นหา...">
					</div>
					<div class="form-group d-flex align-items-center me-3">
					</div>
				</div>

				<button type="button" onclick="exportTableToExcel()" class="button">
					<img src="../images/excel.png" alt="Export to Excel">
					ดาวน์โหลด Excel
				</button>
				<!-- </div> -->
			</form>
			<!-- </div> -->
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
											<th style="vertical-align:middle;" nowrap>งบประมาณ</th>
											<th style="vertical-align:middle;" nowrap>รหัส TOR</th>
											<th style="vertical-align:middle;" nowrap>ประเภทงบประมาณ</th>
										</thead>
										<tbody>
											<td nowrap style='' align='right'><?= number_format($row['f_total_amt'], 2) ?> บาท</td>
											<td nowrap style=''><?= $row['sp_tor_id'] ?></td>
											<td nowrap style=''><?= $row['dc_expense_budget_type'] ?></td>
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
		function updateRowCount() {
			const visibleRows = document.querySelectorAll("tbody > tr.clickable");
			document.getElementById("rowCountLabel").textContent =
				`แสดงทั้งหมด ${visibleRows.length} รายการ`;
		}

		// เรียกใช้เมื่อมีการค้นหา หรือกรอง
		document.getElementById("searchInput").addEventListener("input", updateRowCount);
		window.addEventListener("load", updateRowCount);
	</script>

</body>

</html>