<?php
include("../api/List_DetailBgV5.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();
$title   = defined('CUSTOMER_NAME_TH') ? CUSTOMER_NAME_TH : 'รายงาน';
$year_en = isset($_REQUEST["year_en"]) ? intval($_REQUEST["year_en"]) : intval(date('Y'));
$year_th = $year_en + 543;

// ===== คอลัมน์ที่คลิกมาจาก DataView =====
$col = in_array($_REQUEST["col"] ?? "", ["budget","reserve","remaining"])
       ? $_REQUEST["col"] : "reserve";

// ===== ยอดเงินแบบเดิม (fallback) =====
$f_budget_total  = floatval($_REQUEST["f_budget"]    ?? 0);
$f_reserve_total = floatval($_REQUEST["f_reserve"]   ?? 0);
$f_remaining     = floatval($_REQUEST["f_remaining"] ?? 0);

// ===== เงินแผน =====
$f_plan_total  = floatval($_REQUEST["f_plan_total"]  ?? $f_budget_total);
$f_plan_used   = floatval($_REQUEST["f_plan_used"]   ?? $f_reserve_total);
$f_plan_remain = floatval($_REQUEST["f_plan_remain"] ?? $f_remaining);

// ===== เงินงวด =====
$f_period_total  = floatval($_REQUEST["f_period_total"]  ?? 0);
$f_period_used   = floatval($_REQUEST["f_period_used"]   ?? 0);
$f_period_remain = floatval($_REQUEST["f_period_remain"] ?? 0);

// ตรวจสอบว่าคลิกมาจากฝั่งไหน: plan | period | (ว่าง = แสดงทั้งคู่)
$budget_mode = in_array($_REQUEST["budget_mode"] ?? "", ["plan","period"])
               ? $_REQUEST["budget_mode"] : "";

// ตรวจสอบว่ามีข้อมูลเงินงวดส่งมาหรือไม่
$has_period = ($f_period_total > 0 || $f_period_used > 0);

// กำหนดว่าจะแสดงกลุ่มไหน
$show_plan   = ($budget_mode === "" || $budget_mode === "plan");
$show_period = ($budget_mode === "" || $budget_mode === "period");

// คำนวณ %
$plan_pct   = ($f_plan_total   > 0) ? round(($f_plan_used   / $f_plan_total)   * 100, 2) : 0;
$period_pct = ($f_period_total > 0) ? round(($f_period_used / $f_period_total) * 100, 2) : 0;

// label ของแถวที่คลิก
$bg_expense_label = htmlspecialchars($_REQUEST["bg_expense_label"] ?? "");

// mapping สี/ชื่อ (ใช้ col เพื่อ highlight card ที่คลิกมา)
$colColor = ["budget" => "#4e73df", "reserve" => "#f6c23e", "remaining" => "#1cc88a"][$col];
$pct_used = $plan_pct; // backward compat

// ===== ดึงรายการ PR =====
$data_json = List_QueryParam();
$data_arr  = json_decode($data_json, true);
$data      = $data_arr["data"] ?? [];

$total_count = count($data);
$f_pr_total  = 0;
foreach ($data as $row) {
	$f_pr_total += floatval($row['f_amt'] ?? 0);
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

	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="shortcut icon" href="../../images/favicon.ico" type="image/x-icon">
	<link rel="icon" href="../../images/favicon.ico" type="image/x-icon">
	<title>งบประมาณ - Dashboard + Data View</title>
	<?php include("../lib/loadJs.php"); ?>
	<script src="../../ws_user/js/jquery.min.js"></script>
	<script src="../../js/echarts/echarts.js"></script>
	<script src="../bootstrap/bootstrap-4.6.2-dist/js/bootstrap.bundle.min.js"></script>
	<script src="../bootstrap/bootstrap-select-1.13.14/dist/js/bootstrap-select.min.js"></script>
	<script src="../../js/echarts/macarons.js"></script>
	<script src="../../lib/xlsx-js-style.min.js"></script>
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
				<?php if ($bg_expense_label): ?>
				<p class="text-muted mb-1"><strong><?= $bg_expense_label ?></strong></p>
				<?php endif; ?>
			</div>

		<!-- ===== เงินแผน ===== -->
			<?php if ($show_plan): ?>
			<div class="col-12 mb-2">
				<div style="background:#123A7D;color:#fff;padding:6px 14px;border-radius:6px 6px 0 0;font-weight:bold;font-size:13px;letter-spacing:0.4px;">
					&#9654; เงินแผน <?= $budget_mode === 'plan' ? '<span style="font-weight:normal;font-size:11px;opacity:.85;">(คลิกจากตาราง)</span>' : '' ?>
				</div>
			</div>
			<div class="col-md-3 col-sm-6 mb-3">
				<div class="stat-card" style="border-left-color:#4e73df;<?= ($col==='budget'&&$budget_mode==='plan')?'outline:2px solid #4e73df;':'' ?>">
					<div class="stat-title">งบประมาณ (เงินแผน)</div>
					<div class="stat-value text-primary"><?= number_format($f_plan_total, 2) ?></div>
				</div>
			</div>
			<div class="col-md-3 col-sm-6 mb-3">
				<div class="stat-card" style="border-left-color:#f6c23e;<?= ($col==='reserve'&&$budget_mode==='plan')?'outline:2px solid #f6c23e;':'' ?>">
					<div class="stat-title">ที่ใช้ไป / จอง (เงินแผน)</div>
					<div class="stat-value text-warning"><?= number_format($f_plan_used, 2) ?></div>
					<div class="small text-muted"><?= $plan_pct ?>% ของงบประมาณแผน</div>
				</div>
			</div>
			<div class="col-md-3 col-sm-6 mb-3">
				<div class="stat-card" style="border-left-color:<?= $f_plan_remain < 0 ? '#e74a3b' : '#1cc88a' ?>;<?= ($col==='remaining'&&$budget_mode==='plan')?'outline:2px solid #1cc88a;':'' ?>">
					<div class="stat-title">คงเหลือ (เงินแผน)</div>
					<div class="stat-value <?= $f_plan_remain < 0 ? 'text-danger' : 'text-success' ?>">
						<?= ($f_plan_remain < 0 ? '-' : '') . number_format(abs($f_plan_remain), 2) ?>
					</div>
				</div>
			</div>
			<div class="col-md-3 col-sm-6 mb-3">
				<div class="stat-card" style="border-left-color:#858796;">
					<div class="stat-title">% การใช้เงินแผน</div>
					<div class="stat-value <?= $plan_pct > 90 ? 'text-danger' : 'text-info' ?>"><?= $plan_pct ?>%</div>
					<div class="progress mt-2" style="height:8px;">
						<div class="progress-bar <?= $plan_pct > 90 ? 'bg-danger' : 'bg-info' ?>"
							style="width:<?= min($plan_pct,100) ?>%"></div>
					</div>
				</div>
			</div>
			<?php endif; ?>

			<!-- ===== เงินงวด ===== -->
			<?php if ($show_period): ?>
			<div class="col-12 mb-2 mt-1">
				<div style="background:#2e6da4;color:#fff;padding:6px 14px;border-radius:6px 6px 0 0;font-weight:bold;font-size:13px;letter-spacing:0.4px;">
					&#9654; เงินงวด <?= $budget_mode === 'period' ? '<span style="font-weight:normal;font-size:11px;opacity:.85;">(คลิกจากตาราง)</span>' : '' ?>
				</div>
			</div>
			<div class="col-md-3 col-sm-6 mb-3">
				<div class="stat-card" style="border-left-color:#36b9cc;<?= ($col==='budget'&&$budget_mode==='period')?'outline:2px solid #36b9cc;':'' ?>">
					<div class="stat-title">งบประมาณ (เงินงวด)</div>
					<div class="stat-value text-info"><?= number_format($f_period_total, 2) ?></div>
				</div>
			</div>
			<div class="col-md-3 col-sm-6 mb-3">
				<div class="stat-card" style="border-left-color:#f6c23e;<?= ($col==='reserve'&&$budget_mode==='period')?'outline:2px solid #f6c23e;':'' ?>">
					<div class="stat-title">ที่ใช้ไป / จอง (เงินงวด)</div>
					<div class="stat-value text-warning"><?= number_format($f_period_used, 2) ?></div>
					<?php if ($f_period_total > 0): ?>
					<div class="small text-muted"><?= $period_pct ?>% ของงบประมาณงวด</div>
					<?php endif; ?>
				</div>
			</div>
			<div class="col-md-3 col-sm-6 mb-3">
				<div class="stat-card" style="border-left-color:<?= $f_period_remain < 0 ? '#e74a3b' : '#1cc88a' ?>;<?= ($col==='remaining'&&$budget_mode==='period')?'outline:2px solid #1cc88a;':'' ?>">
					<div class="stat-title">คงเหลือ (เงินงวด)</div>
					<div class="stat-value <?= $f_period_remain < 0 ? 'text-danger' : 'text-success' ?>">
						<?= ($f_period_remain < 0 ? '-' : '') . number_format(abs($f_period_remain), 2) ?>
					</div>
				</div>
			</div>
			<div class="col-md-3 col-sm-6 mb-3">
				<div class="stat-card" style="border-left-color:#858796;">
					<div class="stat-title">% การใช้เงินงวด</div>
					<div class="stat-value <?= $period_pct > 90 ? 'text-danger' : 'text-info' ?>">
						<?= $has_period ? $period_pct.'%' : '-' ?>
					</div>
					<?php if ($has_period): ?>
					<div class="progress mt-2" style="height:8px;">
						<div class="progress-bar <?= $period_pct > 90 ? 'bg-danger' : 'bg-info' ?>"
							style="width:<?= min($period_pct,100) ?>%"></div>
					</div>
					<?php endif; ?>
				</div>
			</div>
			<?php endif; ?>

			<!-- จำนวน PR -->
			<div class="col-md-4 col-sm-6 mb-3">
				<div class="stat-card" style="border-left-color:#858796;">
					<div class="stat-title">จำนวนรายการ PR ในตาราง</div>
					<div class="stat-value"><?= number_format($total_count) ?> <small style="font-size:1rem;">รายการ</small></div>
					<div class="small text-muted">ยอดรวม PR (จอง): <?= number_format($f_pr_total, 2) ?> บาท</div>
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
								<td colspan="11" class="text-center py-5">
									<?php if ($budget_mode === 'period'): ?>
										<div style="font-size:2rem; margin-bottom:.5rem;">📭</div>
										<div class="font-weight-bold text-muted" style="font-size:1.1rem;">ไม่มีรายการจองเงินงวด</div>
										<div class="text-muted small mt-1">หมวดค่าใช้จ่ายนี้ยังไม่มีการจองในส่วนของเงินงวด</div>
									<?php elseif ($budget_mode === 'plan'): ?>
										<div style="font-size:2rem; margin-bottom:.5rem;">📭</div>
										<div class="font-weight-bold text-muted" style="font-size:1.1rem;">ไม่มีรายการจองเงินแผน</div>
										<div class="text-muted small mt-1">หมวดค่าใช้จ่ายนี้ยังไม่มีการจองในส่วนของเงินแผน</div>
									<?php else: ?>
										<div class="font-weight-bold text-muted">ไม่พบข้อมูล</div>
									<?php endif; ?>
								</td>
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

		// 2. Export Excel Function (3 sheets พร้อมสี)
		function exportToExcel() {
			var X = (typeof XLSXStyle !== 'undefined') ? XLSXStyle : XLSX;
			var budgetMode = <?= json_encode($budget_mode) ?>;

			// เลือกยอดตาม budget_mode ที่คลิกมา
			var fPlanTotal    = <?= json_encode($f_plan_total) ?>;
			var fPlanUsed     = <?= json_encode($f_plan_used) ?>;
			var fPlanRemain   = <?= json_encode($f_plan_remain) ?>;
			var fPeriodTotal  = <?= json_encode($f_period_total) ?>;
			var fPeriodUsed   = <?= json_encode($f_period_used) ?>;
			var fPeriodRemain = <?= json_encode($f_period_remain) ?>;

			var fBudget    = (budgetMode === 'period') ? fPeriodTotal  : fPlanTotal;
			var fReserve   = (budgetMode === 'period') ? fPeriodUsed   : fPlanUsed;
			var fRemaining = (budgetMode === 'period') ? fPeriodRemain : fPlanRemain;
			var modeLabel  = (budgetMode === 'period') ? '(เงินงวด)' : '(เงินแผน)';

			var bgLabel    = <?= json_encode($bg_expense_label) ?>;
			var yearTh     = <?= json_encode($year_th) ?>;
			var numFmt     = '#,##0.00';

			var C = {
				row1_bg:'D9E1F2', row1_fc:'1F3864',
				bud_bg: '4472C4', bud_fc: 'FFFFFF',
				res_bg: 'F6C23E', res_fc: '000000',
				rem_bg: '1CC88A', rem_fc: '000000',
				num_bg: 'F2F2F2', hdr_bg: '4472C4', hdr_fc: 'FFFFFF',
				stripe: 'EEF2FF', white:  'FFFFFFFF',
				r3bud_bg:'D9E1F2', r3bud_fc:'2C5282',
				r3res_bg:'FFF3CD', r3res_fc:'856404',
				r3rem_bg:'D4EDDA', r3rem_fc:'155724',
				sumres_bg:'FFF3CD', sumres_fc:'856404',
				sumrem_bg:'D4EDDA', sumrem_fc:'155724',
				amt_fc:'1A56DB', remval_fc:'155724',
			};
			var bdr = {top:{style:'thin',color:{rgb:'FFD1D5DB'}},bottom:{style:'thin',color:{rgb:'FFD1D5DB'}},left:{style:'thin',color:{rgb:'FFD1D5DB'}},right:{style:'thin',color:{rgb:'FFD1D5DB'}}};
			function cs(bg,fc,bold,h,wrap,sz,fmt){
				var s={fill:{patternType:'solid',fgColor:{rgb:bg||'FFFFFFFF'}},font:{bold:!!bold,sz:sz||10,name:'Calibri'},alignment:{vertical:'center',horizontal:h||'left',wrapText:!!wrap},border:bdr};
				if(fc) s.font.color={rgb:fc};
				if(fmt){s.numFmt=fmt;}
				if(h) s.alignment.horizontal=h;
				else if(fmt) s.alignment.horizontal='right';
				return s;
			}
			function cell(v,bg,fc,bold,fmt,sz,h){var t=typeof v==='number'?'n':'s';return{v:v,t:t,s:cs(bg,fc,bold,h,false,sz,fmt)};}
			function cBlank(bg){return{v:'',t:'s',s:cs(bg,null,false,'left')};}
			function dataCell(v,bg,ci){
				if(ci===9) return cell(v,bg,C.amt_fc,true,numFmt,10,'center');
				var s=cs(bg,null,false,'center',false,10);
				if(ci===2){s.alignment.wrapText=true;s.alignment.horizontal='left';}
				return{v:String(v),t:'s',s:s};
			}
			function hdrCell(v,bg){return{v:v,t:'s',s:cs(bg||C.hdr_bg,C.hdr_fc,true,'center')};}

			var prHeaders=["#","เลขที่ PR","ชื่อรายการ","ประเภทความก้าวหน้า","หน่วยงาน","สถานะ","แหล่งเงิน","ผู้รับผิดชอบ","สายงาน","เงินจอง PR (บาท)"];
			var prRows=[];
			$("#prTableBody tr").each(function(){
				var row=[];
				$(this).find("td").each(function(i){
					if(i>=10) return;
					var txt=$(this).text().trim().replace(/\s+/g," ");
					row.push(i===9?parseFloat(txt.replace(/,/g,""))||0:txt);
				});
				prRows.push(row);
			});

			function mkSummary(r3bg,r3fc,r3lbl,ncol){
				function blanks(bg,n){var a=[];for(var i=0;i<n;i++)a.push(cBlank(bg));return a;}
				return[
					[cell("ปีงบประมาณ "+yearTh+"  "+modeLabel+(bgLabel?"  |  "+bgLabel:""),C.row1_bg,C.row1_fc,true)].concat(blanks(C.row1_bg,ncol-1)),
					[cell("งบประมาณ "+modeLabel,C.bud_bg,C.bud_fc,true,null,10,'center'),cell(fBudget,C.num_bg,C.amt_fc,true,numFmt,11,'center'),
					 cell("ที่ใช้ไป (จอง)",C.res_bg,C.res_fc,true,null,10,'center'),cell(fReserve,C.num_bg,C.amt_fc,true,numFmt,11,'center'),
					 cell("คงเหลือ",C.rem_bg,C.rem_fc,true,null,10,'center'),cell(fRemaining,C.num_bg,C.remval_fc,true,numFmt,11,'center')].concat(blanks(C.num_bg,ncol-6)),
					[cell("▶  คอลัมน์ที่เลือก :  "+r3lbl,r3bg,r3fc,true)].concat(blanks(r3bg,ncol-1)),
					blanks('FFFFFFFF',ncol),
				];
			}
			function toSheet(aoa,cols,freeze,rowH){
				var ws={},maxR=aoa.length,maxC=0;
				aoa.forEach(function(row,ri){if(row.length>maxC)maxC=row.length;row.forEach(function(cv,ci){if(cv==null)return;ws[X.utils.encode_cell({r:ri,c:ci})]=(cv&&cv.v!==undefined)?cv:{v:cv,t:typeof cv==='number'?'n':'s'};});});
				ws['!ref']=X.utils.encode_range({s:{r:0,c:0},e:{r:maxR-1,c:maxC-1}});
				ws['!cols']=cols.map(function(w){return{wch:w};});
				if(freeze)ws['!freeze']={xSplit:0,ySplit:freeze};
				if(rowH)ws['!rows']=rowH.map(function(h){return{hpt:h,hpx:h};});
				return ws;
			}
			function mkRowH(n){var h=[26,24,20,6,28];for(var i=0;i<n;i++)h.push(38);h.push(26);return h;}

			var wb=X.utils.book_new();

			// Sheet 1
			var a1=mkSummary(C.r3bud_bg,C.r3bud_fc,"งบประมาณ",8);
			a1.push([cell("ยอดงบประมาณ "+modeLabel+" (บาท)",C.row1_bg,C.row1_fc,true),cell(fBudget,C.row1_bg,C.bud_fc,true,numFmt,14,'center')]);
			X.utils.book_append_sheet(wb,toSheet(a1,[20,22,52,16,16,16],[0],[26,24,20,6,22,50]),"งบประมาณ "+modeLabel);

			// Sheet 2
			var a2=mkSummary(C.r3res_bg,C.r3res_fc,"ที่ใช้ไป (จอง)",10);
			a2.push(prHeaders.map(function(h){return hdrCell(h);}));
			prRows.forEach(function(r,ri){var bg=(ri%2===0)?C.stripe:C.white;a2.push(r.map(function(v,ci){return dataCell(v,bg,ci);}));});
			a2.push(prHeaders.map(function(h,i){if(i===8)return cell("ยอดรวมที่ใช้ไป (จอง)",C.sumres_bg,C.sumres_fc,true);if(i===9)return cell(fReserve,C.sumres_bg,C.sumres_fc,true,numFmt,11,'center');return cBlank(C.sumres_bg);}));
			X.utils.book_append_sheet(wb,toSheet(a2,[20,18,52,38,20,18,30,18,18,16],5,mkRowH(prRows.length)),"จอง "+modeLabel);

			// Sheet 3
			var a3=mkSummary(C.r3rem_bg,C.r3rem_fc,"คงเหลือหลังจองเงิน",11);
			var h3=prHeaders.concat(["คงเหลือ (บาท)"]);
			a3.push(h3.map(function(h,i){return hdrCell(h,(i===10)?C.rem_bg:C.hdr_bg);}));
			prRows.forEach(function(r,ri){
				var bg=(ri%2===0)?C.stripe:C.white;
				var fAmt=r[9]||0;
				var rem=fReserve>0?Math.round(fRemaining*(fAmt/fReserve)*100)/100:0;
				var row=r.map(function(v,ci){return dataCell(v,bg,ci);});
				row.push(cell(rem,bg,C.remval_fc,true,numFmt,10,'center'));
				a3.push(row);
			});
			a3.push(h3.map(function(h,i){if(i===8)return cell("ยอดรวมคงเหลือ",C.sumres_bg,C.sumres_fc,true);if(i===9)return cell(fReserve,C.sumres_bg,C.sumres_fc,true,numFmt,11,'center');if(i===10)return cell(fRemaining,C.sumrem_bg,C.sumrem_fc,true,numFmt,11,'center');return cBlank(C.sumres_bg);}));
			X.utils.book_append_sheet(wb,toSheet(a3,[20,18,52,38,20,18,30,18,18,16,16],5,mkRowH(prRows.length)),"คงเหลือ "+modeLabel);

			X.writeFile(wb,"PR_Report_<?= date('Ymd_Hi') ?>.xlsx");
		}
	</script>
</body>

</html>