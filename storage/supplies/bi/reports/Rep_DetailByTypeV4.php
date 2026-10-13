<?php
include("../api/List_DetailBgV4.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();
$title = CUSTOMER_NAME_TH;
$year_th = $_REQUEST["year_en"] + 543;
$year_th = ($_REQUEST["year_en"] > 0) ?   $_REQUEST["year_en"]  + 543 : '';;
$caption = "รายงานพัสดุ " . $year_th;

$emp_names = isset($_REQUEST["emp_names"]) ? $_REQUEST["emp_names"] : "";
$emp_names = preg_replace('/^– เลือกทั้งหมด –\s*;\s*/u', '', $emp_names);
$emp_names = isset($_REQUEST['emp_names']) ? $_REQUEST['emp_names'] : 'ทั้งหมด';
$names = explode(";", $emp_names);

$data_dtl = json_decode(List_QueryParam(), true);
$formatted = "";
foreach ($names as $index => $name) {
	$formatted .= "👤 " . trim($name) . "  ";
	if (($index + 1) % 15 == 0) {
		$formatted .= "\n";
	}
}
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

$date_start = $_GET['d_date_start'] ?? "";
$date_end = $_GET['d_date_end'] ?? "";
$date_range = "";
if ($date_start && $date_end) {
	$date_range = "ระหว่างวันที่ " . thaiDate($date_start) . " ถึง " . thaiDate($date_end);
} elseif ($date_start) {
	$date_range = "ตั้งแต่วันที่ " . thaiDate($date_start);
} elseif ($date_end) {
	$date_range = "ถึงวันที่ " . thaiDate($date_end);
}

$sum_tor = 0;
$po_working_hdr_status_int = 0;
$sum_tor_total = 0;
$sum_tor_f_amt = 0;

$str = str_replace(";", ",", $_REQUEST['sp_emp_id'], $count);
$emp_arr = explode(',', $str);

if ($emp_arr[0] == 0) {
	$sp_emp =  "";
} else {
	$sp_emp =  " and a.sp_emp_id in (" . $str . ") ";
}
// print_r($data);
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
	<h1 class="text-center mb-4" style="font-size: 2.5rem; color: #0056b3; font-weight: bold; border-bottom: 2px solid #ccc; padding-bottom: 10px;">
		<i class="fas fa-file-alt"></i> <?= htmlspecialchars($caption) ?>
	</h1>
	<?php if ($date_range): ?>
		<div style="background: #f8f9fa; padding: 10px; border: 1px solid #ccc; border-radius: 6px;">
			<strong>📅 ช่วงวันที่:</strong><br>
			<?= $date_range ?>
		</div>
	<?php endif; ?>

	<div style="background: #fefefe; padding: 10px; border: 1px solid #ccc;">
		<strong>ผู้ที่คุณเลือก (<?= count($names) ?> คน):</strong><br>
		<pre style="margin: 0; font-family: inherit;"><?= $formatted ?></pre>
	</div>
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
						<th style="vertical-align:middle;" nowrap>สถานะการเบิกของสัญญา</th>
						<th style="vertical-align:middle;" nowrap>ประเภท PR</th>
						<th style="vertical-align:middle;" nowrap>เลขที่สัญญา</th>
						<th style="vertical-align:middle;" nowrap>วันที่ได้รับมอบหมายงาน</th>
						<th style="vertical-align:middle;" nowrap>วันที่เบิกงวดสุดท้าย</th>
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
						<th style="vertical-align:middle;" nowrap>จำนวนจองล่าสุด</th>

					</tr>
				</thead>
				<tbody>
					<?php
					$min_days = null;
					$max_days = null;
					$min_row = null;
					$max_row = null;
					foreach ($data as $i => $row):
						$sum_tor_total += $row['f_total_amt'] ?? 0;
						$sum_tor_f_amt += $row['f_amt'] ?? 0;
						$po_working_hdr_status_int += $row['po_working_hdr_status_int'] ?? 0;
						$sum_tor++;
						$start = $row['sp_status_hdr13'] ?? null;   // วันที่ได้รับมอบหมายงาน
						$end = $row['pwi_050d_doc_date'] ?? null;  // วันที่เบิกงวดสุดท้าย
						// echo($start);
						// exit;
						if ($start && $end && $end !== '0000-00-00') {
							$d1 = new DateTime($start);
							$d2 = new DateTime($end);
							$diff = $d1->diff($d2)->days;

							// หาค่าน้อยที่สุดและมากที่สุด
							if ($min_days === null || $diff < $min_days) {
								$min_days = $diff;
								$min_row = $row['po_code'];
							}
							if ($max_days === null || $diff > $max_days) {
								$max_days = $diff;
								$max_row = $row['po_code'];
							}
						}
					?>
						<tr class="clickable" data-toggle="collapse" data-target="#expand<?= $i ?>" aria-expanded="false" aria-controls="expand<?= $i ?>">
							<td><button class="btn btn-sm btn-info toggle-details"><i class="fas fa-plus">+</i></button></td>
							<td class="text-center"><?= $i + 1 ?></td>

							<td nowrap style='' data-toggle="tooltip" title="<?= $row['c_code'] ?>"> <?= $row['c_code'] ?? '-' ?></td>
							<td nowrap style='' data-toggle="tooltip" title="<?= $row['i_enabled'] ?>"> <?= $row['i_enabled'] ?? '-' ?></td>
							<td nowrap style='' data-toggle="tooltip" title="<?= $row['po_working_hdr_status'] ?>"> <?= $row['po_working_hdr_status'] ?? '-' ?></td>
							<td nowrap style='' data-toggle="tooltip" title="<?= $row['i_type_bg'] ?>"> <?= $row['i_type_bg'] ?? '-' ?></td>
							<td nowrap style='' data-toggle="tooltip" title="<?= $row['sp_status_hdr13'] ?>"> <?= thaiDate($row['sp_status_hdr13']) ?></td>
							<td nowrap style='' data-toggle="tooltip" title="<?= $row['pwi_050d_doc_date'] ?>"> <?= thaiDate($row['pwi_050d_doc_date']) ?></td>
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
							<td nowrap style='' align='right'><?= number_format($row["f_amt"], 2)  ?? '-' ?></td>
							<td nowrap style='' align='right'><?= number_format(($row["f_total_amt"] - $row["f_amt"]), 2)   ?? '-' ?></td>

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
										<tbody>
											<?php if (!empty($row['children'])): ?>
												<?php foreach ($row['children'] as $child): ?>
													<?php
													$sum_chk = 0;
													$sum_total_amt = 0;
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
															<a href="javascript:void(0);"
																class="btn btn-sm btn-outline-success rounded-pill"
																onclick="Po_OpenPdf('<?= $child['c_file_pdf_hdr'] ?>', '<?= $child['c_code_ref'] ?>')">
																<i class="fas fa-print"></i> <?= $child['c_code_ref'] ?? '-' ?>
															</a>
														</td>
														<td class="text-center">
															<a href="javascript:void(0);"
																class="btn btn-sm btn-outline-primary rounded-pill"
																onclick="Po_OpenPdf('<?= $child['c_file_pdf_dtl'] ?>', '<?= $child['c_code_ref'] ?>')">
																<i class="fas fa-print"></i> <?= $child['c_code_ref'] ?? '-' ?>
															</a>
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
													<td colspan="20" class="text-center text-muted">ไม่มีข้อมูล</td>
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
	<tr class="bg-light font-weight-bold">
		<td nowrap colspan="2" class="text-right" style="width: 100px; text-align: center;">จำนวนรายการทั้งหมด</td>
		<td nowrap colspan="1" class="text-center" style="width: 100px; text-align: ;"> <?= $sum_tor ?> </td>
		<td nowrap colspan="2" class="text-right" style="width: 100px; text-align: center;">ตรวจรับและเบิกแล้วทั้งหมด</td>
		<td nowrap colspan="1" class="text-center" style="width: 100px; text-align: ;"> <?= $po_working_hdr_status_int ?> </td>
		<td nowrap colspan="1" class="text-right" style=" color:rgb(70, 143, 67); width: 100px; text-align: center;">เร็วที่สุด</td>
		<td nowrap colspan="1" class="text-center" style=" color:rgb(70, 143, 67); width: 100px; text-align: ;"> <?= $min_days ?> </td>
		<td nowrap colspan="1" class="text-center" style=" color:rgb(70, 143, 67); width: 100px; text-align: ;"> <?= $min_row ?> </td>
		<td nowrap colspan="1" class="text-right" style=" color:rgb(248, 15, 15); width: 100px; text-align: center;">ช้าที่สุด</td>
		<td nowrap colspan="1" class="text-center" style=" color:rgb(248, 15, 15); width: 100px; text-align: ;"> <?= $max_days ?> </td>
		<td nowrap colspan="1" class="text-center" style=" color:rgb(248, 15, 15); width: 100px; text-align: ;"> <?= $max_row ?> </td>
		<td nowrap colspan="8" class="text-right" style="width: 100px; text-align: center;">-</td>
		<!-- <td nowrap colspan="2" class="text-right" style="width: 100px; text-align: center;">ยอดเงิน PR ทั้งมด</td> -->
		<td nowrap colspan="1" class="text-right" style="width: 100px; text-align: ;">ยอดเงิน PR ทั้งมด <?= number_format($sum_tor_total, 2) ?> </td>
		<!-- <td nowrap colspan="1" class="text-right" style="width: 100px; text-align: center;">ยอดเงิน PR หรือ PO ที่จองล่าสุด</td> -->
		<td nowrap colspan="1" class="text-right" style="width: 100px; text-align: ;"> ยอดเงิน PR หรือ PO ที่จองล่าสุด <?= number_format($sum_tor_f_amt, 2) ?> </td>

	</tr>
	</tbody>
	</table>
	</div>
	</div>
	<!-- ส่วนท้ายสุดของไฟล์ PHP -->
	<script type="text/javascript">

	</script>
	<script type="text/javascript" src="../js/ReporTable.js?_dc<?= __VPRODUCT_; ?>"></script>

</body>

</html>