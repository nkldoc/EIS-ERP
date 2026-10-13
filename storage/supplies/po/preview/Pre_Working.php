<?php
include("../conf/configPo.php");
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db			= new DatabaseServer();
$date 		= new i_date();
$sql = "SET NOCOUNT ON
		SELECT
			c.c_name AS cost_name
			,b.c_code
			,CONVERT(VARCHAR, b.d_doc_date, 120) AS d_doc_date
			,CONVERT(VARCHAR, b.d_inv_date, 120) AS d_inv_date
			,b.c_approve
			,CONVERT(VARCHAR, b.d_approve_date, 120) AS d_approve_date
			,d.c_name AS creditor_name
			,a.c_comment AS c_comment1
			,(select qq.c_comment from dbo.po_working_item qq WHERE b.po_working_hdr_id = qq.po_working_hdr_id AND qq.i_status = 5) AS c_comment2
			,b.c_qty
			,b.f_total
			,b.i_budget_year
			,b.i_budget_year_overlap
			,f.c_name AS expense_name1
			,e.c_name AS expense_name2
			,g.c_name AS budget_name
			,b.c_booking

			,(SELECT c_full_name FROM dbo.dc_user WHERE dc_user_id = a1.dc_user_update_id) AS c_user1
			,(SELECT c_full_name FROM dbo.dc_user WHERE dc_user_id = a2.dc_user_update_id) AS c_user2
			,(SELECT c_full_name FROM dbo.dc_user WHERE dc_user_id = a3.dc_user_update_id) AS c_user3
			,(SELECT c_full_name FROM dbo.dc_user WHERE dc_user_id = a4.dc_user_update_id) AS c_user4
			,(SELECT c_full_name FROM dbo.dc_user WHERE dc_user_id = a5.dc_user_update_id) AS c_user5
			,(SELECT c_full_name FROM dbo.dc_user WHERE dc_user_id = a6.dc_user_update_id) AS c_user6
			,(SELECT c_full_name FROM dbo.dc_user WHERE dc_user_id = a7.dc_user_update_id) AS c_user7
			,(SELECT c_full_name FROM dbo.dc_user WHERE dc_user_id = a8.dc_user_update_id) AS c_user8
			,(SELECT c_full_name FROM dbo.dc_user WHERE dc_user_id = a9.dc_user_update_id) AS c_user9
			,(SELECT c_full_name FROM dbo.dc_user WHERE dc_user_id = a10.dc_user_update_id) AS c_user10
			,(SELECT c_full_name FROM dbo.dc_user WHERE dc_user_id = a11.dc_user_update_id) AS c_user11

			--,CONVERT(VARCHAR, a1.d_doc_date, 120) AS d_doc_date1
			--,CONVERT(VARCHAR, a2.d_doc_date, 120) AS d_doc_date2
			--,CONVERT(VARCHAR, a3.d_doc_date, 120) AS d_doc_date3
			--,CONVERT(VARCHAR, a4.d_doc_date, 120) AS d_doc_date4
			--,CONVERT(VARCHAR, a5.d_doc_date, 120) AS d_doc_date5
			--,CONVERT(VARCHAR, a6.d_doc_date, 120) AS d_doc_date6
			--,CONVERT(VARCHAR, a7.d_doc_date, 120) AS d_doc_date7
			--,CONVERT(VARCHAR, a8.d_doc_date, 120) AS d_doc_date8
			--,CONVERT(VARCHAR, a9.d_doc_date, 120) AS d_doc_date9
			--,CONVERT(VARCHAR, a10.d_doc_date, 120) AS d_doc_date10
			--,CONVERT(VARCHAR, a11.d_doc_date, 120) AS d_doc_date11

			,a1.d_doc_date AS d_doc_date1
			,a2.d_doc_date AS d_doc_date2
			,a3.d_doc_date AS d_doc_date3
			,a4.d_doc_date AS d_doc_date4
			,a5.d_doc_date AS d_doc_date5
			,a6.d_doc_date AS d_doc_date6
			,a7.d_doc_date AS d_doc_date7
			,a8.d_doc_date AS d_doc_date8
			,a9.d_doc_date AS d_doc_date9
			,a10.d_doc_date AS d_doc_date10
			,a11.d_doc_date AS d_doc_date11
		INTO #tem
		FROM po_working_hdr a
			INNER JOIN dbo.po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id
			LEFT JOIN dbo.dc_cost c ON b.dc_cost_id = c.dc_cost_id AND c.i_enable = 1 AND c.i_delete = 2
			LEFT JOIN dbo.po_creditor d ON b.po_creditor_id = d.po_creditor_id AND d.i_enable = 1 AND d.i_delete = 2
			LEFT JOIN dbo.bg_expense e ON b.bg_expense_id = e.bg_expense_id AND e.i_enable = 1 AND e.i_delete = 2
			LEFT JOIN dbo.bg_expense f ON LEFT(e.c_code_tree,2) = LEFT(f.c_code_tree,2) AND f.i_enable = 1 AND f.i_delete = 2 AND f.i_level = 1
			LEFT JOIN dbo.dc_expense_budget_type g ON b.dc_expense_budget_type_id = g.dc_expense_budget_type_id AND g.i_enable = 1 AND g.i_delete = 2

			LEFT JOIN dbo.po_working_item a1 ON b.po_working_hdr_id = a1.po_working_hdr_id AND a1.i_status = 1
			LEFT JOIN dbo.po_working_item a2 ON b.po_working_hdr_id = a2.po_working_hdr_id AND a2.i_status = 2
			LEFT JOIN dbo.po_working_item a3 ON b.po_working_hdr_id = a3.po_working_hdr_id AND a3.i_status = 3
			LEFT JOIN dbo.po_working_item a4 ON b.po_working_hdr_id = a4.po_working_hdr_id AND a4.i_status = 4
			LEFT JOIN dbo.po_working_item a5 ON b.po_working_hdr_id = a5.po_working_hdr_id AND a5.i_status = 5
			LEFT JOIN dbo.po_working_item a6 ON b.po_working_hdr_id = a6.po_working_hdr_id AND a6.i_status = 6
			LEFT JOIN dbo.po_working_item a7 ON b.po_working_hdr_id = a7.po_working_hdr_id AND a7.i_status = 7
			LEFT JOIN dbo.po_working_item a8 ON b.po_working_hdr_id = a8.po_working_hdr_id AND a8.i_status = 8
			LEFT JOIN dbo.po_working_item a9 ON b.po_working_hdr_id = a9.po_working_hdr_id AND a9.i_status = 9
			LEFT JOIN dbo.po_working_item a10 ON b.po_working_hdr_id = a10.po_working_hdr_id AND a10.i_status = 10
			LEFT JOIN dbo.po_working_item a11 ON b.po_working_hdr_id = a11.po_working_hdr_id AND a11.i_status = 11
			
		WHERE a.po_working_hdr_id = ?
		SELECT 
			cost_name
			,c_code
			,d_doc_date
			,d_inv_date
			,c_approve
			,d_approve_date
			,creditor_name
			,c_comment1
			,c_comment2
			,c_qty
			,f_total
			,i_budget_year
			,i_budget_year_overlap
			,expense_name1
			,expense_name2
			,budget_name
			,c_booking
			,c_user1
			,c_user2
			,c_user3
			,c_user4
			,c_user5
			,c_user6
			,c_user7
			,c_user8
			,c_user9
			,c_user10
			,c_user11
			,CONVERT(VARCHAR(19), d_doc_date1, 120) AS d_doc_date1
			,CONVERT(VARCHAR(19), d_doc_date2, 120) AS d_doc_date2
			,CONVERT(VARCHAR(19), d_doc_date3, 120) AS d_doc_date3
			,CONVERT(VARCHAR(19), d_doc_date4, 120) AS d_doc_date4
			,CONVERT(VARCHAR(19), d_doc_date5, 120) AS d_doc_date5
			,CONVERT(VARCHAR(19), d_doc_date6, 120) AS d_doc_date6
			,CONVERT(VARCHAR(19), d_doc_date7, 120) AS d_doc_date7
			,CONVERT(VARCHAR(19), d_doc_date8, 120) AS d_doc_date8
			,CONVERT(VARCHAR(19), d_doc_date9, 120) AS d_doc_date9
			,CONVERT(VARCHAR(19), d_doc_date10, 120) AS d_doc_date10
			,CONVERT(VARCHAR(19), d_doc_date11, 120) AS d_doc_date11 
		FROM #tem";

$row = $db->GetDataBySQL($sql, array($_REQUEST["id"]));
	$arr[1] = array("c_status" => "วันที่ส่งใบขอเบิก", "c_user" => $row["c_user1"], "d_date" => ($row["d_doc_date1"] != "") ? $date->shot_date_from_db($row["d_doc_date1"]) : "", "i_success" => ($row["d_doc_date1"] != "") ? true : false);
	$arr[4] = array("c_status" => $CONF_I_STATUS[4], "c_user" => $row["c_user4"], "d_date" => ($row["d_doc_date4"] != "") ? $date->shot_date_from_db($row["d_doc_date4"]) : "", "i_success" => ($row["d_doc_date4"] != "") ? true : false);
	$arr[5] = array("c_status" => $CONF_I_STATUS[5], "c_user" => $row["c_user5"], "d_date" => ($row["d_doc_date5"] != "") ? $date->shot_date_from_db($row["d_doc_date5"]) : "", "i_success" => ($row["d_doc_date5"] != "") ? true : false);
	$arr[6] = array("c_status" => $CONF_I_STATUS[6], "c_user" => $row["c_user6"], "d_date" => ($row["d_doc_date6"] != "") ? $date->shot_date_from_db($row["d_doc_date6"]) : "", "i_success" => ($row["d_doc_date6"] != "") ? true : false);
	$arr[7] = array("c_status" => $CONF_I_STATUS[7], "c_user" => $row["c_user7"], "d_date" => ($row["d_doc_date7"] != "") ? $date->shot_date_from_db($row["d_doc_date7"]) : "", "i_success" => ($row["d_doc_date7"] != "") ? true : false);
	$arr[8] = array("c_status" => $CONF_I_STATUS[8], "c_user" => $row["c_user8"], "d_date" => ($row["d_doc_date8"] != "") ? $date->shot_date_from_db($row["d_doc_date8"]) : "", "i_success" => ($row["d_doc_date8"] != "") ? true : false);
	$arr[9] = array("c_status" => $CONF_I_STATUS[9], "c_user" => $row["c_user9"], "d_date" => ($row["d_doc_date9"] != "") ? $date->shot_date_from_db($row["d_doc_date9"]) : "", "i_success" => ($row["d_doc_date9"] != "") ? true : false);
	$arr[10] = array("c_status" => $CONF_I_STATUS[10], "c_user" => $row["c_user10"], "d_date" => ($row["d_doc_date10"] != "") ? $date->shot_date_from_db($row["d_doc_date10"]) : "", "i_success" => ($row["d_doc_date10"] != "") ? true : false);
	$arr[11] = array("c_status" => $CONF_I_STATUS[11], "c_user" => $row["c_user11"], "d_date" => ($row["d_doc_date11"] != "") ? $date->shot_date_from_db($row["d_doc_date11"]) : "", "i_success" => ($row["d_doc_date11"] != "") ? true : false);
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<style type="text/css">
		@import url("../../css/font/TH_Sarabun.css");

		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
			-moz-box-sizing: border-box;
		}

		html {
			font-family: "Sarabun";
			color: #4a4a4a;
			font-size: 14px;
		}

		body {
			padding: 0;
			margin: 0;
			background: #fff;
		}

		.page {
			width: 21cm;
			max-height: 29.7cm;
			padding: 1cm;
			margin: 20px auto;
			border: 1px solid #eee;
		}

		.table {
			border-collapse: collapse;
		}

		.th1,
		.th2 {
			padding: 2px;
		}

		.th1 div {
			text-align: center;
			padding: 8px 0px;
			border-radius: 2px;
		}

		.th2 div {
			background: #e8e8e8;
			text-align: center;
			padding: 5px 0px;
			border-radius: 2px;
		}

		.td2 {
			border: 1px dashed #e8e8e8;
			text-align: center;
		}

		.span {
			padding: 3px 10px;
			border-radius: 3px;
		}

		.enable {
			border: 1px solid #32af32;
			color: #32af32;
		}

		.disable {
			border: 1px solid #ff8e8e;
			color: #ff8e8e;
		}


		.border-t {
			border-top: 1px solid #bdbdbd;
			vertical-align: top;
		}

		.border-b {
			border-bottom: 1px solid #bdbdbd;
			vertical-align: top;
		}

		.border-l {
			border-left: 1px solid #bdbdbd;
			vertical-align: top;
		}

		.border-r {
			border-right: 1px solid #bdbdbd;
			vertical-align: top;
		}

		@page {
			size: A4;
			margin: 0;
		}

		@media print {
			.page {
				margin: 0;
				-webkit-print-color-adjust: exact;
				border: initial;
				border-radius: initial;
				width: initial;
				min-height: initial;
				box-shadow: initial;
				background: initial;
				page-break-after: always;
			}
		}
	</style>
</head>
<?php
$hdr = $db->GetDataBySQL("
	SELECT
		a.i_enable
		,b.c_code_ref
	FROM dbo.po_working_hdr a
		LEFT JOIN dbo.po_working_hdr b ON a.po_working_hdr_id = b.parent_id
	WHERE a.po_working_hdr_id = ?;", array($_REQUEST["id"]));

$hdr_parent = $db->GetDataBySQL("
	SELECT
		a.i_enable
		,a.c_code_ref
	FROM dbo.po_working_hdr a
	WHERE a.po_working_hdr_id = (SELECT aa.parent_id FROM dbo.po_working_hdr aa WHERE aa.po_working_hdr_id = ?);", array($_REQUEST["id"]));

if ($hdr["i_enable"] != 1) {
	$c_status = " <font color=red>(ไม่ใช้งาน)</font>";
	if ($hdr["c_code_ref"] != "") {
		$c_status .= "<br><font color=green>" . $hdr["c_code_ref"] . " (ใหม่)</font>";
	}
} else if ($hdr_parent["i_enable"] == 2) {
	if ($hdr_parent["c_code_ref"] != "") {
		$c_status = "<br><font color=red>" . $hdr_parent["c_code_ref"] . " (เดิม)</font>";
	}
} else {
	$c_status = "";
}
?>

<body>
	<div class='page'>
		<table width="100%" class="table" border="0" cellspacing="1" cellpadding="0">
			<tbody>
				<tr>
					<th class="border-t border-b border-l border-r" style="padding: 3px 0px;" colspan="4">ใบขอเบิก<?= $c_status; ?></th>
				</tr>
				<tr>
					<td class="border-l" style="padding: 3px;" colspan=2><b>หน่วยงาน</b>
						<span style="margin-left: 10px;"><?= $row["cost_name"]; ?></span>
					</td>
					<td style="padding: 3px; width:30%;"><b>เลขที่ใบขอเบิก</b>
						<span style="margin-left: 10px;"><?= $row["c_code"]; ?></span>
					</td>
					<td class="border-r" style="padding: 3px; width:30%;"><b>วันที่ขอเบิก</b>
						<span style="margin-left: 10px;"><?= (($row["d_doc_date"] != "") ? $date->shot_date_from_db($row["d_doc_date"]) : ""); ?></span>
					</td>
				</tr>
				<tr>
					<td class="border-l" style="padding: 3px; width:20%;"><b>งานคลังรับ</b></td>
					<td style="padding: 3px; width:20%;"><b>วันที่</b>
						<span style="margin-left: 10px;"><?= (($row["d_inv_date"] != "") ? $date->shot_date_from_db($row["d_inv_date"]) : ""); ?></span>
					</td>
					<td style="padding: 3px; width:30%;"><b>เลขที่ฏีกา</b>
						<span style="margin-left: 10px;"><?= $row["c_approve"]; ?></span>
					</td>
					<td class="border-r" style="padding: 3px; width:30%;"><b>วันที่ฏีกา</b>
						<span style="margin-left: 10px;"><?= (($row["d_approve_date"] != "") ? $date->shot_date_from_db($row["d_approve_date"]) : ""); ?></span>
					</td>
				</tr>
				<tr>
					<td class="border-l" style="padding: 3px;" colspan="3"><b>จ่ายให้</b>
						<span style="margin-left: 10px;"><?= $row["creditor_name"]; ?></span>
					</td>
					<td class="border-r" style="padding: 3px;"><b>จำนวนเงิน</b>
						<span style="margin-left: 10px;"><?= number_format($row["f_total"], 2); ?></span>
					</td>
				</tr>
				<tr>
					<td class="border-r border-l" style="padding: 3px;" colspan="4"><b>จำนวนรายการ</b>
						<span style="margin-left: 10px;"><?= $row["c_qty"]; ?></span>
					</td>
				<tr>
					<td class="border-r border-l" style="padding: 3px;" colspan="4"><b>คำอธิบายรายการ</b>
						<span style="margin-left: 10px;"><?= $row["c_comment1"]; ?></span>
					</td>
				</tr>
				<tr>
					<td class="border-r border-l" style="padding: 3px;" colspan="4"><b>หมายเหตุ</b>
						<span style="margin-left: 10px;"><?= $row["c_comment2"]; ?></span>
					</td>
				</tr>
			</tbody>
		</table>
		<table width="100%" class="table" border="0" cellspacing="1" cellpadding="0">
			<tbody>
				<tr>
					<td class="border-t border-l" style="padding: 3px; width: 14%;"><b>ปีงบประมาณ</b></td>
					<td class="border-t" style="padding: 3px;"><?= $row["i_budget_year"] + 543; ?></td>
					<td class="border-t border-l border-r" style="padding: 3px; width: 50%;"><b>แหล่งเงิน</b>
						<span style="margin-left: 10px;"><?= $row["budget_name"]; ?></span>
					</td>
				</tr>
				<tr>
					<td class="border-l" style="padding: 3px; width: 14%;"><b>หมวดรายจ่าย</b></td>
					<td style="padding: 3px;"><?= $row["expense_name1"]; ?></td>
					<td class="border-l border-r" style="padding: 3px; width: 50%;"><b>กันเงิน/ขยายเวลาจากปีงบประมาณ</b>
						<span style="margin-left: 10px;"><?= ($row["i_budget_year"] != $row["i_budget_year_overlap"]) ? $row["i_budget_year_overlap"] + 543 : ""; ?></span>
					</td>
				</tr>
				<tr>
					<td class="border-b border-l" style="padding: 3px; width: 14%;"><b>รายจ่ายย่อย</b></td>
					<td class="border-b" style="padding: 3px;"><?= $row["expense_name2"]; ?></td>
					<td class="border-b border-l border-r" style="padding: 3px; width: 50%;"><b>เลขที่ใบกันเงิน</b>
						<span style="margin-left: 10px;"><?= $row["c_booking"]; ?></span>
					</td>
				</tr>
			</tbody>
		</table>
		<table width="100%" class="table" border="0" cellspacing="1" cellpadding="0" style="margin-top: 20px;">
			<tbody>
				<tr>
					<td></td>
					<td class="th1">
						<div style="background: #e8e8e8;">ผู้ทำรายการ</div>
					</td>
					<td class="th1">
						<div style="background: #e8e8e8;">วันที่นำส่ง</div>
					</td>
					<td class="th1">
						<div style="background: #e8e8e8;">สถานะ</div>
					</td>
				</tr>

				<?php foreach ($arr as $obj) {
					$c_success = ($obj["i_success"]) ? "<span class='span enable'>ส่งรายการ<span>" : "<span class='span disable'>รอดำเนินการ</span>";
					echo "<tr>"
						. "<th class='th2' style='width: 200px;'><div>" . $obj["c_status"] . "</div></th>"
						. "<td class='td2'>" . $obj["c_user"] . "</td>"
						. "<td class='td2'>" . $obj["d_date"] . "</td>"
						. "<td class='td2'>" . $c_success . "</td>"
						. "</tr>";
					if ($obj["c_status"] == "วันที่ส่งใบขอเบิก") {

						$item = $db->GetDataBySQL("
							SELECT
								CONVERT(VARCHAR, c.d_doc_date, 120) AS d_doc_date
								,d.c_full_name
								,c.c_comment
							FROM dbo.po_working_hdr a
								INNER JOIN dbo.po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id
								INNER JOIN dbo.po_working_item c ON a.po_working_hdr_id = c.po_working_hdr_id AND c.i_status = 3
								LEFT JOIN dbo.dc_user d ON c.dc_user_create_id = d.dc_user_id
							WHERE a.po_working_hdr_id = ?", array($_REQUEST["id"]));
						if ($item) {
							echo "<tr>"
								. "<th class='th2' style='width: 200px;'><div>ส่งทักท้วง</div></th>"
								. "<td class='td2'>" . $item["c_full_name"] . "</td>"
								. "<td class='td2'>" . $date->shot_date_from_db($item["d_doc_date"]) . "</td>"
								. "<td class='td2'><pre>" . $item["c_comment"] . "</pre></td>"
								. "</tr>";
						}
					}
				} ?>
			</tbody>
		</table>
	</div>
</body>

</html>