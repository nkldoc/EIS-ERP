<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();

$root = "data";
$data = array();
$con = null;

function List_QueryParam()
{
	global $db, $date, $root, $data, $con, $arr_status;

	$con2 = null;

	$totalCount = 0;
	$fld_show		= "";
	$group_show		= "";
	$order_show		= "";

	$ArrY	= array(1 => "ปีงบประมาณ", 2 => "เหลื่อมปี");
	$ArrD	= array(0 => "ผังบัญชี", 1 => "หักส่งคืน", 2 => "ปรับปรุง", 3 => "ไม่ระบุ");

	$mm1	= round($_REQUEST["c_mm1"]);
	$mm2	= round($_REQUEST["c_mm2"]);

	if ($_REQUEST["i_show_month"] == 3) {
		$fld_show		= ",CONVERT(VARCHAR, b.d_date, 120) AS d_date
							,RIGHT('0'+CAST(YEAR(b.d_date) AS varchar(4)) ,4)
							+RIGHT('0'+CAST(MONTH(b.d_date) AS varchar(2)) ,2)
							+RIGHT('0'+CAST(DAY(b.d_date) AS varchar(2)) ,2) AS yyyy_mm_dd";
		$group_show		= ",b.d_date";
		$order_show		= "b.d_date,";
	}

	$arr_id = explode(";", $_REQUEST["dc_expense_budget_type_id"]);
	if (!in_array("0", $arr_id)) {
		$in = "";
		if (is_array($arr_id)) {
			foreach ($arr_id as $val_parent) {
				$in .= ($in == "") ? $val_parent : ", " . $val_parent;
			}
			$con .= ($in != "") ? " AND b.dc_expense_budget_type_id IN (" . $in . ")" : "";
		}
	}

	if ($_REQUEST["i_show_acc"] == 1) { // บัญชีคุม Lv4

		$ss_id	= explode(";", $_REQUEST["dc_acc_id_parent"]);
		if (!in_array("0", $ss_id)) {
			$in	= "";
			foreach ($ss_id as $val) {
				$in	.= ($in == "") ? $val : ", " . $val;
			}
			$con2	.= " AND c.dc_acc_lv4_id IN (" . $in . ")";
		}
	} else if ($_REQUEST["i_show_acc"] == 3) { // บัญชีคุม Lv5

		$ss_id	= explode(";", $_REQUEST["dc_acc_id_parent_lv5"]);
		if (!in_array("0", $ss_id)) {
			$in	= "";
			foreach ($ss_id as $val) {
				$in	.= ($in == "") ? $val : ", " . $val;
			}
			$con2	.= " AND c.dc_acc_lv5_id IN (" . $in . ")";
		}
	} else if ($_REQUEST["i_show_acc"] == 2) { // บัญชีย่อย

		$ss_id	= explode(";", $_REQUEST["dc_acc_id"]);
		if (!in_array("0", $ss_id)) {
			$in	= "";
			foreach ($ss_id as $val) {
				$in	.= ($in == "") ? $val : ", " . $val;
			}
			$con2	.= " AND c.dc_acc_id IN (" . $in . ")";
		}
	}

	$subSql	= "";
	if ($_REQUEST["PAGE"] == "GlRep00008") { // ค่าใช้จ่ายคณะแพทยศาสตร์วชิรพยาบาล (บัญชี)

		foreach ($ArrY as $i_type_year => $name) {

			$year	= ($i_type_year == 1) ? "@i_year" : "@i_year-1";

			// ========== GL ของ ทุกอย่างที่ไม่ใช่ BTN (auto) ========== //
			$subSql	.= ($subSql == "") ? "" : "UNION ALL";
			$subSql .= "
						/* {$name} */
						SELECT
							0 AS i_deduct
							,c.dc_expense_budget_type_id
							,c.dc_acc_id
							,c.i_type_year
							,b.d_save_date AS d_date
							,NULL AS f_approve
							,SUM(CASE WHEN month(b.d_save_date) = 1 THEN ISNULL(c.f_dr,0) ELSE 0 END ) AS f_amount1
							,SUM(CASE WHEN month(b.d_save_date) = 2 THEN ISNULL(c.f_dr,0) ELSE 0 END ) AS f_amount2
							,SUM(CASE WHEN month(b.d_save_date) = 3 THEN ISNULL(c.f_dr,0) ELSE 0 END ) AS f_amount3
							,SUM(CASE WHEN month(b.d_save_date) = 4 THEN ISNULL(c.f_dr,0) ELSE 0 END ) AS f_amount4
							,SUM(CASE WHEN month(b.d_save_date) = 5 THEN ISNULL(c.f_dr,0) ELSE 0 END ) AS f_amount5
							,SUM(CASE WHEN month(b.d_save_date) = 6 THEN ISNULL(c.f_dr,0) ELSE 0 END ) AS f_amount6
							,SUM(CASE WHEN month(b.d_save_date) = 7 THEN ISNULL(c.f_dr,0) ELSE 0 END ) AS f_amount7
							,SUM(CASE WHEN month(b.d_save_date) = 8 THEN ISNULL(c.f_dr,0) ELSE 0 END ) AS f_amount8
							,SUM(CASE WHEN month(b.d_save_date) = 9 THEN ISNULL(c.f_dr,0) ELSE 0 END ) AS f_amount9
							,SUM(CASE WHEN month(b.d_save_date) = 10 THEN ISNULL(c.f_dr,0) ELSE 0 END ) AS f_amount10
							,SUM(CASE WHEN month(b.d_save_date) = 11 THEN ISNULL(c.f_dr,0) ELSE 0 END ) AS f_amount11
							,SUM(CASE WHEN month(b.d_save_date) = 12 THEN ISNULL(c.f_dr,0) ELSE 0 END ) AS f_amount12
						FROM gl_tran_hdr b
							INNER JOIN gl_tran_dtl c ON b.gl_tran_hdr_id = c.gl_tran_hdr_id
							INNER JOIN dc_acc d ON c.dc_acc_id = d.dc_acc_id
							INNER JOIN imp_fix_acc e ON d.dc_acc_id = e.dc_acc_id
						WHERE
							b.i_enable = " . STATUS_ENABLE . " AND b.i_is_post in (3) AND LEFT(b.c_code,1) = 'g'
							AND b.i_is_close_year = 2
							AND b.i_type = 2
							AND d.i_enable = " . STATUS_ENABLE . "
							AND c.i_type_year = {$i_type_year}
							AND c.c_budget_year = {$year}
							AND c.f_dr > 0
							AND CONVERT(DATETIME, b.d_save_date, 102) BETWEEN CONVERT(DATETIME, @d_begin, 102) AND CONVERT(DATETIME, @d_end, 102)
							AND b.table_name IN ('imp_expense_vsn_hdr', 'imp_expense_hdr', 'imp_receive_hdr')
						GROUP BY
							c.dc_expense_budget_type_id
							,c.dc_acc_id
							,c.i_type_year
							,b.d_save_date
						";
		}
	} else { // ค่าใช้จ่ายคณะแพทยศาสตร์วชิรพยาบาล

		foreach ($ArrY as $i_type_year => $name) {

			$year	= ($i_type_year == 1) ? "@i_year" : "@i_year-1";

			$subSql	.= ($subSql == "") ? "" : "UNION ALL";
			$subSql	.= "
						/*E-phys*/
						/*{$name}*/
						SELECT
							0 AS i_deduct
							,a.dc_expense_budget_type_id
							,b.dc_acc_id_report AS dc_acc_id
							,b.i_type_year
							,b.d_pay AS d_date
							,COUNT(DISTINCT c_approve) AS f_approve
							,SUM(CASE WHEN month(b.d_pay) = 1 THEN b.f_inv+b.f_vat ELSE 0 END ) AS f_amount1
							,SUM(CASE WHEN month(b.d_pay) = 2 THEN b.f_inv+b.f_vat ELSE 0 END ) AS f_amount2
							,SUM(CASE WHEN month(b.d_pay) = 3 THEN b.f_inv+b.f_vat ELSE 0 END ) AS f_amount3
							,SUM(CASE WHEN month(b.d_pay) = 4 THEN b.f_inv+b.f_vat ELSE 0 END ) AS f_amount4
							,SUM(CASE WHEN month(b.d_pay) = 5 THEN b.f_inv+b.f_vat ELSE 0 END ) AS f_amount5
							,SUM(CASE WHEN month(b.d_pay) = 6 THEN b.f_inv+b.f_vat ELSE 0 END ) AS f_amount6
							,SUM(CASE WHEN month(b.d_pay) = 7 THEN b.f_inv+b.f_vat ELSE 0 END ) AS f_amount7
							,SUM(CASE WHEN month(b.d_pay) = 8 THEN b.f_inv+b.f_vat ELSE 0 END ) AS f_amount8
							,SUM(CASE WHEN month(b.d_pay) = 9 THEN b.f_inv+b.f_vat ELSE 0 END ) AS f_amount9
							,SUM(CASE WHEN month(b.d_pay) = 10 THEN b.f_inv+b.f_vat ELSE 0 END ) AS f_amount10
							,SUM(CASE WHEN month(b.d_pay) = 11 THEN b.f_inv+b.f_vat ELSE 0 END ) AS f_amount11
							,SUM(CASE WHEN month(b.d_pay) = 12 THEN b.f_inv+b.f_vat ELSE 0 END ) AS f_amount12
						FROM imp_expense_hdr a
							INNER JOIN vw_imp_expense_dtl_items b on a.imp_expense_hdr_id = b.imp_expense_hdr_id
							INNER JOIN dc_expense c on b.dc_expense_id = c.dc_expense_id
							INNER JOIN dc_acc d on b.dc_acc_id_report = d.dc_acc_id
							INNER JOIN imp_fix_acc e ON d.dc_acc_id = e.dc_acc_id
						WHERE a.i_enable = " . STATUS_ENABLE . "
							AND b.i_type_year = {$i_type_year}
							AND b.c_budget_year = {$year}
							AND CONVERT(DATETIME, b.d_pay, 102) BETWEEN CONVERT(DATETIME, @d_begin, 102) AND CONVERT(DATETIME, @d_end, 102)
						GROUP BY a.dc_expense_budget_type_id, b.dc_acc_id_report, b.i_type_year, b.d_pay
						UNION ALL
						/*Vision Net*/
						SELECT
							0 AS i_deduct
							,a.dc_expense_budget_type_id
							,b.dc_acc_id_report AS dc_acc_id
							,b.i_type_year
							,b.d_doc AS d_date
							,COUNT(c_approve) AS f_approve
							,SUM(CASE WHEN month(b.d_doc) = 1 THEN b.f_inv ELSE 0 END ) AS f_amount1
							,SUM(CASE WHEN month(b.d_doc) = 2 THEN b.f_inv ELSE 0 END ) AS f_amount2
							,SUM(CASE WHEN month(b.d_doc) = 3 THEN b.f_inv ELSE 0 END ) AS f_amount3
							,SUM(CASE WHEN month(b.d_doc) = 4 THEN b.f_inv ELSE 0 END ) AS f_amount4
							,SUM(CASE WHEN month(b.d_doc) = 5 THEN b.f_inv ELSE 0 END ) AS f_amount5
							,SUM(CASE WHEN month(b.d_doc) = 6 THEN b.f_inv ELSE 0 END ) AS f_amount6
							,SUM(CASE WHEN month(b.d_doc) = 7 THEN b.f_inv ELSE 0 END ) AS f_amount7
							,SUM(CASE WHEN month(b.d_doc) = 8 THEN b.f_inv ELSE 0 END ) AS f_amount8
							,SUM(CASE WHEN month(b.d_doc) = 9 THEN b.f_inv ELSE 0 END ) AS f_amount9
							,SUM(CASE WHEN month(b.d_doc) = 10 THEN b.f_inv ELSE 0 END ) AS f_amount10
							,SUM(CASE WHEN month(b.d_doc) = 11 THEN b.f_inv ELSE 0 END ) AS f_amount11
							,SUM(CASE WHEN month(b.d_doc) = 12 THEN b.f_inv ELSE 0 END ) AS f_amount12
						FROM imp_expense_vsn_hdr a
							INNER JOIN vw_imp_expense_vsn_dtl_items b on a.imp_expense_vsn_hdr_id = b.imp_expense_vsn_hdr_id
							INNER JOIN dc_expense_acc_vsn c on b.dc_expense_acc_vsn_id = c.dc_expense_acc_vsn_id
							INNER JOIN dc_acc d on b.dc_acc_id_report = d.dc_acc_id
							INNER JOIN imp_fix_acc e ON d.dc_acc_id = e.dc_acc_id
						WHERE a.i_enable = " . STATUS_ENABLE . "
							AND b.i_type_year = {$i_type_year}
							AND b.c_budget_year = {$year}
							AND CONVERT(DATETIME, b.d_doc, 102) BETWEEN CONVERT(DATETIME, @d_begin, 102) AND CONVERT(DATETIME, @d_end, 102)
						GROUP BY a.dc_expense_budget_type_id, b.dc_acc_id_report, b.i_type_year, b.d_doc
						UNION ALL
						
						
						
						/* รายได้ */
						SELECT
							0 AS i_deduct
							,c.dc_expense_budget_type_id
							,c.dc_acc_id
							,c.i_type_year
							,b.d_save_date AS d_date
							,NULL AS f_approve
							,SUM(CASE WHEN month(b.d_save_date) = 1 THEN ISNULL(c.f_dr,0) ELSE 0 END ) AS f_amount1
							,SUM(CASE WHEN month(b.d_save_date) = 2 THEN ISNULL(c.f_dr,0) ELSE 0 END ) AS f_amount2
							,SUM(CASE WHEN month(b.d_save_date) = 3 THEN ISNULL(c.f_dr,0) ELSE 0 END ) AS f_amount3
							,SUM(CASE WHEN month(b.d_save_date) = 4 THEN ISNULL(c.f_dr,0) ELSE 0 END ) AS f_amount4
							,SUM(CASE WHEN month(b.d_save_date) = 5 THEN ISNULL(c.f_dr,0) ELSE 0 END ) AS f_amount5
							,SUM(CASE WHEN month(b.d_save_date) = 6 THEN ISNULL(c.f_dr,0) ELSE 0 END ) AS f_amount6
							,SUM(CASE WHEN month(b.d_save_date) = 7 THEN ISNULL(c.f_dr,0) ELSE 0 END ) AS f_amount7
							,SUM(CASE WHEN month(b.d_save_date) = 8 THEN ISNULL(c.f_dr,0) ELSE 0 END ) AS f_amount8
							,SUM(CASE WHEN month(b.d_save_date) = 9 THEN ISNULL(c.f_dr,0) ELSE 0 END ) AS f_amount9
							,SUM(CASE WHEN month(b.d_save_date) = 10 THEN ISNULL(c.f_dr,0) ELSE 0 END ) AS f_amount10
							,SUM(CASE WHEN month(b.d_save_date) = 11 THEN ISNULL(c.f_dr,0) ELSE 0 END ) AS f_amount11
							,SUM(CASE WHEN month(b.d_save_date) = 12 THEN ISNULL(c.f_dr,0) ELSE 0 END ) AS f_amount12
						FROM gl_tran_hdr b
							INNER JOIN gl_tran_dtl c ON b.gl_tran_hdr_id = c.gl_tran_hdr_id
							INNER JOIN dc_acc d ON c.dc_acc_id = d.dc_acc_id
							INNER JOIN imp_fix_acc e ON d.dc_acc_id = e.dc_acc_id
						WHERE
							b.i_enable = " . STATUS_ENABLE . " AND b.i_is_post in (3) AND LEFT(b.c_code,1) = 'g'
							AND b.i_is_close_year = 2
							AND b.i_type = 2
							AND d.i_enable = " . STATUS_ENABLE . "
							AND c.i_type_year = {$i_type_year}
							AND c.c_budget_year = {$year}
							AND c.f_dr > 0
							AND CONVERT(DATETIME, b.d_save_date, 102) BETWEEN CONVERT(DATETIME, @d_begin, 102) AND CONVERT(DATETIME, @d_end, 102)
							AND b.table_name IN ('imp_receive_hdr')
						GROUP BY
							c.dc_expense_budget_type_id
							,c.dc_acc_id
							,c.i_type_year
							,b.d_save_date
						";
		}
	}

	foreach ($ArrY as $i_type_year => $name) {

		$year	= ($i_type_year == 1) ? "@i_year" : "@i_year-1";

		foreach ($ArrD as $i_return => $d_name) {

			$fld = ($i_return == 0) ? "f_dr" : "f_cr"; // 0 => "ผังบัญชี", 1 => "หักส่งคืน", 2 => "ปรับปรุง", 3 => "ไม่ระบุ"

			if ($_REQUEST["i_btn{$i_return}"] == 1) {
				// ========== BTN ที่บันทึกบัญชี GX/GL แล้ว เฉพาะรหัส+ชื่อผังบัญชี และยอดเงินที่บันทึกบัญชี  ========== //
				$subSql	.= ($subSql == "") ? "" : "UNION ALL";
				$subSql	.= "
							/*BTN เฉพาะ {$d_name}*/
							/* {$name} */
							SELECT
								{$i_return} AS i_deduct
								,c.dc_expense_budget_type_id
								,c.dc_acc_id
								,c.i_type_year
								,b.d_save_date AS d_date
								,NULL AS f_approve
								," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 1 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount1
								," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 2 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount2
								," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 3 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount3
								," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 4 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount4
								," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 5 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount5
								," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 6 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount6
								," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 7 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount7
								," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 8 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount8
								," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 9 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount9
								," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 10 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount10
								," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 11 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount11
								," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 12 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount12
							FROM gl_bank a
								INNER JOIN gl_tran_hdr b ON a.gl_tran_hdr_id = b.gl_tran_hdr_id
								INNER JOIN gl_tran_dtl c ON c.gl_tran_hdr_id = b.gl_tran_hdr_id
								INNER JOIN dc_acc d ON d.dc_acc_id = c.dc_acc_id
								INNER JOIN imp_fix_acc e ON d.dc_acc_id = e.dc_acc_id
							WHERE a.i_enable = " . STATUS_ENABLE . " AND LEFT(a.c_code,3) = 'btn' AND b.table_name = 'gl_bank'
								AND b.i_enable = " . STATUS_ENABLE . " AND b.i_is_post > 1 AND LEFT(b.c_code,1) = 'g'
								AND b.i_is_close_year = 2
								AND ISNULL(c.{$fld},0) > 0
								AND b.i_type = 2
								AND d.i_enable = " . STATUS_ENABLE . "
								AND c.i_type_year = {$i_type_year}
								AND c.c_budget_year = {$year}
								AND CONVERT(DATETIME, b.d_save_date, 102) BETWEEN CONVERT(DATETIME, @d_begin, 102) AND CONVERT(DATETIME, @d_end, 102)
								" . (($i_return > 0) ? " AND c.i_return = " . $i_return : "") . " 
							GROUP BY
								c.dc_expense_budget_type_id
								,c.dc_acc_id
								,c.i_type_year
								,b.d_save_date
							";

				if ($i_return > 0) { // i_return 1 => "หักส่งคืน", 2 => "ปรับปรุง", 3 => "ไม่ระบุ"
					// ========== ยกเลิก BTN ========== //
					$subSql	.= ($subSql == "") ? "" : "UNION ALL";
					$subSql .= "
                				SELECT
                					{$i_return} AS i_deduct
                					,c.dc_expense_budget_type_id
                					,c.dc_acc_id
                					,c.i_type_year
                					,b.d_save_date AS d_date
                					,NULL AS f_approve
                					," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 1 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount1
                					," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 2 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount2
                					," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 3 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount3
                					," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 4 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount4
                					," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 5 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount5
                					," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 6 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount6
                					," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 7 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount7
                					," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 8 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount8
                					," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 9 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount9
                					," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 10 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount10
                					," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 11 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount11
                					," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 12 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount12
                				FROM gl_tran_hdr b
                					INNER JOIN gl_tran_dtl c ON b.gl_tran_hdr_id = c.gl_tran_hdr_id
                					INNER JOIN dc_acc d ON c.dc_acc_id = d.dc_acc_id
                					INNER JOIN imp_fix_acc e ON d.dc_acc_id = e.dc_acc_id
                				WHERE
                					b.i_enable = " . STATUS_ENABLE . " AND b.i_is_post > 1 AND LEFT(b.c_code,1) = 'g'
                					AND b.i_is_close_year = 2
                					AND b.i_type = 2
                					AND d.i_enable = " . STATUS_ENABLE . "
                					AND c.i_type_year = {$i_type_year}
                					AND c.c_budget_year = {$year}
                					AND ISNULL(c.{$fld},0) > 0
                					AND CONVERT(DATETIME, b.d_save_date, 102) BETWEEN CONVERT(DATETIME, @d_begin, 102) AND CONVERT(DATETIME, @d_end, 102)
                					AND b.table_name IN ('gl_bank')
                					AND c.i_return = {$i_return}
                				GROUP BY
                					c.dc_expense_budget_type_id
                					,c.dc_acc_id
                					,c.i_type_year
                					,b.d_save_date
                				";
				}
			}

			if ($_REQUEST["i_gx{$i_return}"] == 1) {
				// ========== GX ของ ทุกอย่างที่ไม่ใช่ BTN เฉพาะ ผังบัญชี (manual) ========== //
				$subSql	.= ($subSql == "") ? "" : "UNION ALL";
				$subSql .= "
							/*ฝั่ง GX ของ ทุกอย่างที่ไม่ใช่ BTN เฉพาะ {$d_name}*/
							/* {$name} */
							SELECT
								{$i_return} AS i_deduct
								,c.dc_expense_budget_type_id
								,c.dc_acc_id
								,c.i_type_year
								,b.d_save_date AS d_date
								,NULL AS f_approve
								," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 1 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount1
								," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 2 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount2
								," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 3 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount3
								," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 4 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount4
								," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 5 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount5
								," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 6 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount6
								," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 7 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount7
								," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 8 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount8
								," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 9 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount9
								," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 10 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount10
								," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 11 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount11
								," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 12 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount12
							FROM gl_tran_hdr b
								INNER JOIN gl_tran_dtl c ON b.gl_tran_hdr_id = c.gl_tran_hdr_id
								INNER JOIN dc_acc d ON c.dc_acc_id = d.dc_acc_id
								INNER JOIN imp_fix_acc e ON d.dc_acc_id = e.dc_acc_id
							WHERE
								b.i_enable = " . STATUS_ENABLE . " AND b.i_is_post > 1 AND LEFT(b.c_code,1) = 'g'
								AND b.i_is_close_year = 2
								AND ISNULL(c.{$fld},0) > 0
								AND b.i_type = 1
								AND d.i_enable = " . STATUS_ENABLE . "
								AND c.i_type_year = {$i_type_year}
								AND c.c_budget_year = {$year}
								AND CONVERT(DATETIME, b.d_save_date, 102) BETWEEN CONVERT(DATETIME, @d_begin, 102) AND CONVERT(DATETIME, @d_end, 102)
								" . (($i_return > 0) ? " AND c.i_return = " . $i_return : "") . " 
							GROUP BY
								c.dc_expense_budget_type_id
								,c.dc_acc_id
								,c.i_type_year
								,b.d_save_date
							";

				if ($i_return > 0) { // i_return 1 => "หักส่งคืน", 2 => "ปรับปรุง", 3 => "ไม่ระบุ"
					// ========== ยกเลิก IMP ========== //
					$subSql	.= ($subSql == "") ? "" : "UNION ALL";
					$subSql .= "
                				SELECT
                					{$i_return} AS i_deduct
                					,c.dc_expense_budget_type_id
                					,c.dc_acc_id
                					,c.i_type_year
                					,b.d_save_date AS d_date
                					,NULL AS f_approve
                					," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 1 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount1
                					," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 2 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount2
                					," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 3 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount3
                					," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 4 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount4
                					," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 5 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount5
                					," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 6 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount6
                					," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 7 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount7
                					," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 8 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount8
                					," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 9 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount9
                					," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 10 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount10
                					," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 11 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount11
                					," . (($i_return == 0) ? "" : "-(") . "SUM(CASE WHEN month(b.d_save_date) = 12 THEN ISNULL(c.{$fld},0) ELSE 0 END )" . (($i_return == 0) ? "" : ")") . " AS f_amount12
                				FROM gl_tran_hdr b
                					INNER JOIN gl_tran_dtl c ON b.gl_tran_hdr_id = c.gl_tran_hdr_id
                					INNER JOIN dc_acc d ON c.dc_acc_id = d.dc_acc_id
                					INNER JOIN imp_fix_acc e ON d.dc_acc_id = e.dc_acc_id
                				WHERE
                					b.i_enable = " . STATUS_ENABLE . " AND b.i_is_post > 1 AND LEFT(b.c_code,1) = 'g'
                					AND b.i_is_close_year = 2
                					AND b.i_type = 2
                					AND d.i_enable = " . STATUS_ENABLE . "
                					AND c.i_type_year = {$i_type_year}
                					AND c.c_budget_year = {$year}
                					AND ISNULL(c.{$fld},0) > 0
                					AND CONVERT(DATETIME, b.d_save_date, 102) BETWEEN CONVERT(DATETIME, @d_begin, 102) AND CONVERT(DATETIME, @d_end, 102)
                					AND b.table_name IN ('imp_expense_vsn_hdr', 'imp_expense_hdr', 'imp_receive_hdr')
                					AND c.i_return = {$i_return}
                				GROUP BY
                					c.dc_expense_budget_type_id
                					,c.dc_acc_id
                					,c.i_type_year
                					,b.d_save_date
                				";
				}
			}
		}
	}

	$sqlMain = "SET NOCOUNT ON;
				DECLARE @d_begin AS VARCHAR(10) = '" . $_REQUEST["date_start"] . "';
				DECLARE @d_end AS VARCHAR(10) = '" . $_REQUEST["date_end"] . "';
				DECLARE @i_year as int = '" . $_REQUEST["year"] . "';
						
				SELECT * INTO #imp_data FROM({$subSql}) a
					
				SELECT
					a.dc_expense_budget_type_id
					,a.c_name AS budget_name
					{$fld_show}
					,c.dc_acc_lv3_id
					,c.c_code_lv3
					,c.c_name_lv3
					,c.dc_acc_lv4_id
					,c.c_code_lv4
					,c.c_name_lv4
					,c.dc_acc_lv5_id
					,c.c_code_lv5
					,c.c_name_lv5
					,c.dc_acc_id
					,c.c_code
					,c.c_name
					,b.i_type_year
					,b.i_deduct
					,SUM(ISNULL(b.f_approve,0)) AS f_approve
					,SUM(b.f_amount1) AS f_amount1
					,SUM(b.f_amount2) AS f_amount2
					,SUM(b.f_amount3) AS f_amount3
					,SUM(b.f_amount4) AS f_amount4
					,SUM(b.f_amount5) AS f_amount5
					,SUM(b.f_amount6) AS f_amount6
					,SUM(b.f_amount7) AS f_amount7
					,SUM(b.f_amount8) AS f_amount8
					,SUM(b.f_amount9) AS f_amount9
					,SUM(b.f_amount10) AS f_amount10
					,SUM(b.f_amount11) AS f_amount11
					,SUM(b.f_amount12) AS f_amount12
				FROM vw_dc_expense_budget_type a
					INNER JOIN (
						SELECT aa.* FROM #imp_data aa WHERE aa.i_deduct = 0
						UNION ALL
						SELECT bb.* FROM #imp_data bb WHERE bb.i_deduct IN (1,2,3)) b ON a.dc_expense_budget_type_id = b.dc_expense_budget_type_id
					LEFT JOIN vw_dc_acc_with_parent c ON b.dc_acc_id = c.dc_acc_id
				WHERE a.i_enable=?
					{$con2}
					{$con}
				GROUP BY a.dc_expense_budget_type_id
					,c.dc_acc_lv3_id ,c.c_code_lv3 ,c.c_name_lv3
					,c.dc_acc_lv4_id ,c.c_code_lv4 ,c.c_name_lv4
					,c.dc_acc_lv5_id ,c.c_code_lv5 ,c.c_name_lv5
					,c.dc_acc_id ,c.c_code ,c.c_name
					,a.c_name, b.i_type_year, b.i_deduct, b.f_approve
					{$group_show}
				ORDER BY
					{$order_show}
					c.c_code_lv3,c.c_code_lv4,c.c_code_lv5,c.c_code,b.i_deduct;";

	$arrParam[] = STATUS_ENABLE;

	$stmt = $db->QueryParam($sqlMain, $arrParam);

	if ($stmt) {

		while ($row = $db->Fetch($stmt)) {

			$yyyy_mm_dd	= ($_REQUEST["i_show_month"] == 3) ? $row["yyyy_mm_dd"] : 0;

			$Arr[$yyyy_mm_dd]["d_date"]	= @$row["d_date"];

			$Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["c_code_lv3"]	= $row["c_code_lv3"];
			$Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["c_name_lv3"]	= $row["c_name_lv3"];

			$Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]]["c_code_lv4"]	= $row["c_code_lv4"];
			$Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]]["c_name_lv4"]	= $row["c_name_lv4"];

			$Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["c_code_lv5"] = $row["c_code_lv5"];
			$Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["c_name_lv5"] = $row["c_name_lv5"];

			$Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$row["dc_acc_id"]]["c_code_lv6"] = $row["c_code"];
			$Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$row["dc_acc_id"]]["c_name_lv6"] = $row["c_name"];

			// ================== แยกเงินบัญชี , หัก ส่งคืน ================== //
			$c_de	= "sum" . $row["i_deduct"];

			for ($ii = $mm1; $ii <= $mm2; $ii++) {

				if (!isset($Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$row["dc_acc_id"]]["data"][$row["i_deduct"]][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii])) {
					$Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$row["dc_acc_id"]]["data"][$row["i_deduct"]][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii] = 0;
				}
				$Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$row["dc_acc_id"]]["data"][$row["i_deduct"]][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii] += $row["f_amount" . $ii];

				// ============= รวม ============= //
				// รวมท้ายรายงาน
				if (!isset($sum["sum_total"][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii])) {
					$sum["sum_total"][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii] = 0;
				}
				// วันที่
				if (!isset($Arr[$yyyy_mm_dd]["sum_total"][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii])) {
					$Arr[$yyyy_mm_dd]["sum_total"][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii] = 0;
				}
				// LV 3
				if (!isset($Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["sum_total"][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii])) {
					$Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["sum_total"][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii] = 0;
				}
				// LV 4
				if (!isset($Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]]["sum_total"][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii])) {
					$Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]]["sum_total"][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii] = 0;
				}
				// LV 5
				if (!isset($Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["sum_total"][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii])) {
					$Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["sum_total"][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii] = 0;
				}
				// LV 6
				if (!isset($Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$row["dc_acc_id"]]["sum_total"][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii])) {
					$Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$row["dc_acc_id"]]["sum_total"][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii] = 0;
				}

				$sum["sum_total"][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii] += $row["f_amount" . $ii];
				$Arr[$yyyy_mm_dd]["sum_total"][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii] += $row["f_amount" . $ii];
				$Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["sum_total"][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii] += $row["f_amount" . $ii];
				$Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]]["sum_total"][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii] += $row["f_amount" . $ii];
				$Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["sum_total"][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii] += $row["f_amount" . $ii];
				$Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$row["dc_acc_id"]]["sum_total"][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii] += $row["f_amount" . $ii];

				// รวมท้ายรายงาน
				if (!isset($sum[$c_de][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii])) {
					$sum[$c_de][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii] = 0;
				}
				// วันที่
				if (!isset($Arr[$yyyy_mm_dd][$c_de][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii])) {
					$Arr[$yyyy_mm_dd][$c_de][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii] = 0;
				}
				// LV 3
				if (!isset($Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]][$c_de][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii])) {
					$Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]][$c_de][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii] = 0;
				}
				// LV 4
				if (!isset($Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]][$c_de][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii])) {
					$Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]][$c_de][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii] = 0;
				}
				// LV 5
				if (!isset($Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]][$c_de][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii])) {
					$Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]][$c_de][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii] = 0;
				}

				$sum[$c_de][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii] += $row["f_amount" . $ii];
				$Arr[$yyyy_mm_dd][$c_de][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii] += $row["f_amount" . $ii];
				$Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]][$c_de][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii] += $row["f_amount" . $ii];
				$Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]][$c_de][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii] += $row["f_amount" . $ii];
				$Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]][$c_de][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_amount" . $ii] += $row["f_amount" . $ii];
			}

			if ($row["i_deduct"] == 0) {
				// รวมท้ายรายงาน
				if (!isset($sum[$c_de][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_approve"])) {
					$sum[$c_de][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_approve"] = 0;
				}
				// วันที่
				if (!isset($Arr[$yyyy_mm_dd][$c_de][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_approve"])) {
					$Arr[$yyyy_mm_dd][$c_de][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_approve"] = 0;
				}
				// LV 3
				if (!isset($Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]][$c_de][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_approve"])) {
					$Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]][$c_de][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_approve"] = 0;
				}
				// LV 4
				if (!isset($Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]][$c_de][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_approve"])) {
					$Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]][$c_de][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_approve"] = 0;
				}
				// LV 5
				if (!isset($Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]][$c_de][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_approve"])) {
					$Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]][$c_de][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_approve"] = 0;
				}
				// LV 6
				if (!isset($Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$row["dc_acc_id"]]["data"][$row["i_deduct"]][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_approve"])) {
					$Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$row["dc_acc_id"]]["data"][$row["i_deduct"]][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_approve"] = 0;
				}

				$sum[$c_de][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_approve"] += $row["f_approve"];
				$Arr[$yyyy_mm_dd][$c_de][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_approve"] += $row["f_approve"];
				$Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]][$c_de][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_approve"] += $row["f_approve"];
				$Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]][$c_de][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_approve"] += $row["f_approve"];
				$Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]][$c_de][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_approve"] += $row["f_approve"];
				$Arr[$yyyy_mm_dd]["data"][$row["dc_acc_lv3_id"]]["data"][$row["dc_acc_lv4_id"]]["data"][$row["dc_acc_lv5_id"]]["data"][$row["dc_acc_id"]]["data"][$row["i_deduct"]][$row["dc_expense_budget_type_id"]][$row["i_type_year"]]["f_approve"] += $row["f_approve"];
			}
		}

		if (isset($Arr)) {

			foreach ($Arr as $yyyy_mm_dd => $objDay) {
				if ($_REQUEST["i_show_month"] == 3) {
					$temp = array("i_type" => 1, "d_date" => $date->shot_date_from_db($objDay["d_date"]));
					${$root}[] = $temp;
				}

				// LV3
				foreach ($objDay["data"] as $lv3_id => $obj_lv3) {
					$temp = array("i_type" => 2, "c_name" => $obj_lv3["c_code_lv3"] . " " . $obj_lv3["c_name_lv3"]);
					${$root}[] = $temp;

					// LV4
					foreach ($obj_lv3["data"] as $lv4_id => $obj_lv4) {
						$temp = array("i_type" => 3, "c_name" => $obj_lv4["c_code_lv4"] . " " . $obj_lv4["c_name_lv4"]);
						${$root}[] = $temp;

						// LV5
						foreach ($obj_lv4["data"] as $lv5_id => $obj_lv5) {
							$temp = array("i_type" => 4, "c_name" => $obj_lv5["c_code_lv5"] . " " . $obj_lv5["c_name_lv5"]);
							${$root}[] = $temp;

							// LV6
							foreach ($obj_lv5["data"] as $lv6_id => $obj_lv6) {

								if (@$obj_lv6["data"][0]) {
									$temp	= array();

									$temp["i_type"] = 5;
									$temp["c_name"] = $obj_lv6["c_code_lv6"] . " " . $obj_lv6["c_name_lv6"];

									foreach ($obj_lv6["data"][0] as $budget_id1 => $obj_budget1) {
										$temp["data"]["budget_id"][$budget_id1] = $obj_budget1;
									}
									${$root}[] = $temp;
								}

								$chk	= false;
								foreach ($ArrD as $kk => $vv) {
									if ($kk > 0) { //0 => "ผังบัญชี", 1 => "หักส่งคืน", 2 => "ปรับปรุง", 3 => "ไม่ระบุ"
										if (@$obj_lv6["data"][$kk]) {
											$chk	= true;
											$temp	= array();

											$temp["i_type"] = 6;
											$temp["c_name"] = $vv;
											foreach ($obj_lv6["data"][$kk] as $budget_id2 => $obj_budget2) {
												$temp["data"]["budget_id"][$budget_id2] = $obj_budget2;
											}
											${$root}[] = $temp;
										}

										if ($kk == 3 && $chk == true) {
											// เงินรวม
											$temp = array();

											$temp["i_type"]	= 7;
											$temp["c_name"]	= $obj_lv6["c_code_lv6"] . " " . $obj_lv6["c_name_lv6"];
											foreach ($obj_lv6["sum_total"] as $bb_id => $obj_bb) {
												$temp["data"]["budget_id"][$bb_id] = $obj_bb;
											}
											${$root}[] = $temp;
										}
									}
								}
							}

							// =================== SUM LV 5 =================== //
							if (@$obj_lv5["sum0"]) { // sum บัญชี Lv 5									
								$temp = array();

								$temp["i_type"]	= 8;
								$temp["c_name"]	= "<font color=red>Lv 5</font> รวม " . $obj_lv5["c_code_lv5"] . " " . $obj_lv5["c_name_lv5"];
								foreach ($obj_lv5["sum0"] as $bb_id => $obj_bb) {
									$temp["data"]["budget_id"][$bb_id] = $obj_bb;
								}
								${$root}[] = $temp;
							}

							$chk	= false;
							foreach ($ArrD as $kk => $vv) {
								if ($kk > 0) { //0 => "ผังบัญชี", 1 => "หักส่งคืน", 2 => "ปรับปรุง", 3 => "ไม่ระบุ"
									if (@$obj_lv5["sum" . $kk]) {
										$chk	= true;
										$temp = array();

										$temp["i_type"]	= 9;
										$temp["c_name"]	= "รวม " . $vv;
										foreach ($obj_lv5["sum" . $kk] as $bb_id => $obj_bb) {
											$temp["data"]["budget_id"][$bb_id] = $obj_bb;
										}
										${$root}[] = $temp;
									}

									if ($kk == 3 && $chk == true) {
										// เงินรวม
										$temp = array();

										$temp["i_type"]	= 10;
										$temp["c_name"]	= "รวม " . $obj_lv5["c_name_lv5"];
										foreach ($obj_lv5["sum_total"] as $bb_id => $obj_bb) {
											$temp["data"]["budget_id"][$bb_id] = $obj_bb;
										}
										${$root}[] = $temp;
									}
								}
							}
						}

						// =================== SUM LV 4 =================== //
						if (@$obj_lv4["sum0"]) { // sum บัญชี Lv4
							$temp = array();

							$temp["i_type"]	= 11;
							$temp["c_name"]	= "<font color=red>Lv 4</font> รวม " . $obj_lv4["c_code_lv4"] . " " . $obj_lv4["c_name_lv4"];
							foreach ($obj_lv4["sum0"] as $bb_id => $obj_bb) {
								$temp["data"]["budget_id"][$bb_id] = $obj_bb;
							}
							${$root}[] = $temp;
						}

						$chk	= false;
						foreach ($ArrD as $kk => $vv) {
							if ($kk > 0) { //0 => "ผังบัญชี", 1 => "หักส่งคืน", 2 => "ปรับปรุง", 3 => "ไม่ระบุ"
								if (@$obj_lv4["sum" . $kk]) {
									$chk	= true;
									$temp = array();

									$temp["i_type"]	= 12;
									$temp["c_name"]	= "รวม " . $vv;
									foreach ($obj_lv4["sum" . $kk] as $bb_id => $obj_bb) {
										$temp["data"]["budget_id"][$bb_id] = $obj_bb;
									}
									${$root}[] = $temp;
								}

								if ($kk == 3 && $chk == true) {
									// เงินรวม
									$temp = array();

									$temp["i_type"]	= 13;
									$temp["c_name"]	= "รวม " . $obj_lv4["c_name_lv4"];
									foreach ($obj_lv4["sum_total"] as $bb_id => $obj_bb) {
										$temp["data"]["budget_id"][$bb_id] = $obj_bb;
									}
									${$root}[] = $temp;
								}
							}
						}
					}

					// =================== SUM LV 3 =================== //
					if (@$obj_lv3["sum0"]) { // sum บัญชี Lv3
						$temp = array();

						$temp["i_type"]	= 14;
						$temp["c_name"]	= "<font color=red>Lv 3</font> รวม " . $obj_lv3["c_code_lv3"] . " " . $obj_lv3["c_name_lv3"];
						foreach ($obj_lv3["sum0"] as $bb_id => $obj_bb) {
							$temp["data"]["budget_id"][$bb_id] = $obj_bb;
						}
						${$root}[] = $temp;
					}

					$chk	= false;
					foreach ($ArrD as $kk => $vv) {
						if ($kk > 0) { //0 => "ผังบัญชี", 1 => "หักส่งคืน", 2 => "ปรับปรุง", 3 => "ไม่ระบุ"
							if (@$obj_lv3["sum" . $kk]) {
								$chk	= true;
								$temp = array();

								$temp["i_type"]	= 15;
								$temp["c_name"]	= "รวม " . $vv;
								foreach ($obj_lv3["sum" . $kk] as $bb_id => $obj_bb) {
									$temp["data"]["budget_id"][$bb_id] = $obj_bb;
								}
								${$root}[] = $temp;
							}

							if ($kk == 3 && $chk == true) {
								// เงินรวม
								$temp = array();

								$temp["i_type"]	= 16;
								$temp["c_name"]	= "รวม " . $obj_lv3["c_name_lv3"];
								foreach ($obj_lv3["sum_total"] as $bb_id => $obj_bb) {
									$temp["data"]["budget_id"][$bb_id] = $obj_bb;
								}
								${$root}[] = $temp;
							}
						}
					}
				}

				// =================== วันที่ =================== //
				if ($_REQUEST["i_show_month"] == 3) {
					if (@$objDay["sum0"]) { // sum วันที่
						$temp = array();

						$temp["i_type"]	= 17;
						$temp["c_name"]	= "รวมวันที่ " . $date->shot_date_from_db($objDay["d_date"]);
						foreach ($objDay["sum0"] as $bb_id => $obj_bb) {
							$temp["data"]["budget_id"][$bb_id] = $obj_bb;
						}
						${$root}[] = $temp;
					}

					$chk	= false;
					foreach ($ArrD as $kk => $vv) {
						if ($kk > 0) { //0 => "ผังบัญชี", 1 => "หักส่งคืน", 2 => "ปรับปรุง", 3 => "ไม่ระบุ"
							if (@$objDay["sum" . $kk]) {
								$chk	= true;
								$temp = array();

								$temp["i_type"]	= 18;
								$temp["c_name"]	= "รวม " . $vv;
								foreach ($objDay["sum" . $kk] as $bb_id => $obj_bb) {
									$temp["data"]["budget_id"][$bb_id] = $obj_bb;
								}
								${$root}[] = $temp;
							}

							if ($kk == 3 && $chk == true) {
								// เงินรวม
								$temp = array();

								$temp["i_type"]	= 19;
								$temp["c_name"]	= "รวม " . $vv;
								foreach ($objDay["sum_total"] as $bb_id => $obj_bb) {
									$temp["data"]["budget_id"][$bb_id] = $obj_bb;
								}
								${$root}[] = $temp;
							}
						}
					}
				}
			}

			// =================== รวมท้ายรายงาน =================== //
			if (@$sum["sum0"]) { // sum
				$temp = array();

				$temp["i_type"]	= 20;
				$temp["c_name"]	= "รวมบัญชีทั้งสิ้น 	(ก่อน)";
				foreach ($sum["sum0"] as $bb_id => $obj_bb) {
					$temp["data"]["budget_id"][$bb_id] = $obj_bb;
				}
				${$root}[] = $temp;
			}

			$chk	= false;
			foreach ($ArrD as $kk => $vv) {
				if ($kk > 0) { //0 => "ผังบัญชี", 1 => "หักส่งคืน", 2 => "ปรับปรุง", 3 => "ไม่ระบุ"
					if (@$sum["sum" . $kk]) {
						$chk	= true;
						$temp = array();

						$temp["i_type"]	= 21;
						$temp["c_name"]	= "รวม " . $vv;
						foreach ($sum["sum" . $kk] as $bb_id => $obj_bb) {
							$temp["data"]["budget_id"][$bb_id] = $obj_bb;
						}
						${$root}[] = $temp;
					}
					if ($kk == 3 && $chk == true) {
						// เงินรวม
						$temp = array();

						$temp["i_type"]	= 22;
						$temp["c_name"]	= "รวมบัญชีทั้งสิ้น (หลัง)";
						foreach ($sum["sum_total"] as $bb_id => $obj_bb) {
							$temp["data"]["budget_id"][$bb_id] = $obj_bb;
						}
						${$root}[] = $temp;
					}
				}
			}
		}
	}
	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}

if ($_REQUEST["type"] == "imp_expense") {

	$mode				= @$_REQUEST["mode"];

	if ($mode == "SEARCH") {
		if ($_REQUEST["value"] != "") {
			$con .= " AND aaa.c_approve = '" . $_REQUEST["value"] . "' ";
		}
	}

	$sqlMain = "SET NOCOUNT ON
				SELECT
					aaa.*
					,bbb.c_code AS acc_code_old
					,bbb.c_name AS acc_name_old
					,ccc.c_code AS acc_code
					,ccc.c_name AS acc_name
					,ddd.c_code AS acc_code_overlap
					,ddd.c_name AS acc_name_overlap
					,ISNULL(xxx.i_is_post,1) AS i_is_post
					,xxx.gl_tran_dtl_id
					,xxx.gl_code
					,xxx.gl_acc_code
					,xxx.gl_acc_name
					,xxx.gl_i_type_year
					,xxx.gl_c_budget_year
					,xxx.gl_f_dr
				FROM (
					/* e-phis */
					SELECT
						b.imp_expense_hdr_id AS pk_hdr_id
						,b.imp_expense_dtl_id AS pk_dtl_id
						,'imp_expense' AS table_name
						,a.c_code
						,b.c_approve
						,CASE
							WHEN b.i_type_year = 1 THEN b.dc_acc_id
							ELSE b.dc_acc_id_overlap
						END AS dc_acc_id_old
						,c.dc_acc_id
						,c.dc_acc_id_overlap
						,c.c_name AS c_expense_name
						,ISNULL(b.f_inv,0)+ISNULL(b.f_vat,0) AS f_inv
						,b.i_type_year
						,b.c_budget_year
						,ISNULL(b.i_many_doc,1) AS i_many_doc
						,b.dc_expense_group_id AS expense_group_id
						,b.dc_expense_id AS expense_id
					FROM imp_expense_hdr a
						INNER JOIN imp_expense_dtl b ON a.imp_expense_hdr_id = b.imp_expense_hdr_id
						LEFT JOIN dc_expense c ON b.dc_expense_id = c.dc_expense_id
					WHERE a.c_code IS NOT NULL
						AND a.i_enable = " . STATUS_ENABLE . "
					UNION ALL
					/* vision net */
					SELECT
						b.imp_expense_vsn_hdr_id AS pk_hdr_id
						,b.imp_expense_vsn_dtl_id AS pk_dtl_id
						,'imp_expense_vsn' AS table_name
						,a.c_code
						,b.c_approve
						,CASE
							WHEN b.i_type_year = 1 THEN b.dc_acc_id
							ELSE b.dc_acc_id_overlap
						END AS dc_acc_id_old
						,c.dc_acc_id
						,c.dc_acc_id_overlap
						,c.c_name AS c_expense_name
						,ISNULL(b.f_inv,0) AS f_inv
						,b.i_type_year
						,b.c_budget_year
						,ISNULL(b.i_many_doc,1) AS i_many_doc
						,b.dc_expense_group_vsn_id AS expense_group_id
						,b.dc_expense_acc_vsn_id AS expense_id
					FROM imp_expense_vsn_hdr a
						INNER JOIN imp_expense_vsn_dtl b ON a.imp_expense_vsn_hdr_id = b.imp_expense_vsn_hdr_id
						LEFT JOIN dc_expense_acc_vsn c ON b.dc_expense_acc_vsn_id = c.dc_expense_acc_vsn_id
					WHERE a.c_code IS NOT NULL
						AND a.i_enable = " . STATUS_ENABLE . "
				) aaa
					LEFT JOIN (
						SELECT
							b.gl_tran_dtl_id
							,a.table_name
							,a.table_pk_id
							,b.dc_acc_id
							,ISNULL(a.i_is_post,1) AS i_is_post
							,CASE
								WHEN ISNULL(a.i_is_post,1) = 2 THEN a.c_code
								ELSE a.c_code_post
							END AS gl_code
							,c.c_code AS gl_acc_code
							,c.c_name AS gl_acc_name
							,b.i_type_year AS gl_i_type_year
							,b.c_budget_year AS gl_c_budget_year
							,b.f_dr AS gl_f_dr
						FROM gl_tran_hdr a
							INNER JOIN gl_tran_dtl b ON a.gl_tran_hdr_id = b.gl_tran_hdr_id
							LEFT JOIN dc_acc c ON b.dc_acc_id = c.dc_acc_id
								AND c.i_enable = " . STATUS_ENABLE . "
						WHERE a.i_enable = " . STATUS_ENABLE . "
							AND a.gl_dc_book_type_id = 2 /*2 = รายวันจ่าย, 3 = รายวันทั่วไป*/
					) xxx ON aaa.table_name+'_hdr' = xxx.table_name
						AND aaa.pk_hdr_id = xxx.table_pk_id
						AND aaa.dc_acc_id_old = xxx.dc_acc_id
					LEFT JOIN dc_acc bbb ON aaa.dc_acc_id_old = bbb.dc_acc_id
					LEFT JOIN dc_acc ccc ON aaa.dc_acc_id = ccc.dc_acc_id
					LEFT JOIN dc_acc ddd ON aaa.dc_acc_id_overlap = ddd.dc_acc_id
				WHERE 1=1
					{$con};";

	$stmt = $db->QueryParam($sqlMain, array());
	$totalCount	= 0;
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {

			if ($row["table_name"] == "imp_expense") {
				$table_name	= "e-phis";
			} else if ($row["table_name"] == "imp_expense_vsn") {
				$table_name	= "vision net";
			} else {
				$table_name	= "";
			}

			if ($row["i_type_year"] == 1) {
				$year_show	= ($row["c_budget_year"] + 543);
			} else if ($row["i_type_year"] == 2) {
				$year_show	= ($row["c_budget_year"] + 543) . " (เหลื่อมปี)";
			} else {
				$year_show	= "ไม่ระบุ";
			}

			$temp = array(
				"no"								=> ++$totalCount,
				"pk_dtl_id"							=> $row["pk_dtl_id"],
				"table_name"						=> $row["table_name"],
				"table_name_show"					=> $table_name,
				"c_code"							=> $row["c_code"],
				"c_approve"							=> $row["c_approve"],
				"c_expense_name"					=> $row["c_expense_name"],
				"f_inv"								=> $row["f_inv"],
				"dc_acc_id_old"						=> $row["dc_acc_id_old"],
				"acc_name_old"						=> $row["acc_code_old"] . " " . $row["acc_name_old"],
				"dc_acc_id"							=> $row["dc_acc_id"],
				"acc_name"							=> $row["acc_code"] . " " . $row["acc_name"],
				"dc_acc_id_overlap"					=> $row["dc_acc_id_overlap"],
				"acc_name_overlap"					=> $row["acc_code_overlap"] . " " . $row["acc_name_overlap"],
				"i_type_year"						=> $row["i_type_year"],
				"c_budget_year"						=> $row["c_budget_year"],
				"year_show"							=> $year_show,
				"c_many_doc"						=> ($row["i_many_doc"] == 1) ? "มีรายการเดียว" : "มีหลายรายการ", // สถานะแยกรายละเอียดฎีกา (1=ไม่แยก,2=แยก)
				"expense_group_id"					=> ($row["expense_group_id"] != "") ? $row["expense_group_id"] : "",
				"expense_id"						=> ($row["expense_id"] != "") ? $row["expense_id"] : "",
				"i_is_post"							=> $row["i_is_post"],

				/* ข้อมูลบัญชี */
				"gl_tran_dtl_id"					=> $row["gl_tran_dtl_id"],
				"gl_code"							=> $row["gl_code"],
				"gl_acc_name"						=> $row["gl_acc_code"] . " " . $row["gl_acc_name"],
				"gl_i_type_year"					=> $row["gl_i_type_year"],
				"gl_c_budget_year"					=> $row["gl_c_budget_year"],
				"gl_f_dr"							=> $row["gl_f_dr"],
			);

			${$root}[] = $temp;
		}
	}

	echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
	exit;
}
