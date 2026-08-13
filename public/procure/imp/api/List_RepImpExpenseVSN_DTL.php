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

	$totalCount = 0;

	$for_id = explode(";", $_REQUEST["dc_expense_budget_type_id"]);
	if (!in_array("0", $for_id)) {
		$in = "";
		if (is_array($for_id)) {
			foreach ($for_id as $val) {
				$in .= ($in == "") ? $val : ", " . $val;
			}
			$con .= ($in != "") ? " AND cc.dc_expense_budget_type_id IN (" . $in . ")" : "";
		}
	}

	if ($_REQUEST["i_show_acc"] == 1) {
		$for_id = explode(";", $_REQUEST["dc_acc_id_parent"]);
		if (!in_array("0", $for_id)) {
			$in = "";
			if (is_array($for_id)) {
				foreach ($for_id as $val) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND ff.dc_acc_lv4_id IN (" . $in . ")" : "";
			}
		}
	} else if ($_REQUEST["i_show_acc"] == 3) {
		$for_id = explode(";", $_REQUEST["dc_acc_id_parent_lv5"]);
		if (!in_array("0", $for_id)) {
			$in = "";
			if (is_array($for_id)) {
				foreach ($for_id as $val) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND ff.dc_acc_lv5_id IN (" . $in . ")" : "";
			}
		}
	} else {
		$for_id = explode(";", $_REQUEST["dc_acc_id"]);
		if (!in_array("0", $for_id)) {
			$in = "";
			if (is_array($for_id)) {
				foreach ($for_id as $val) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND ff.dc_acc_id IN (" . $in . ")" : "";
			}
		}
	}

	if ($_REQUEST["i_type_year"] > 0) {
		$con .= " AND b.i_type_year = " . $_REQUEST["i_type_year"];
		$con .= " AND b.c_budget_year = " . $_REQUEST["c_budget_year"];
	}

	if ($_REQUEST["i_cal_gl"] > 0) {
		$con .= " AND b.i_cal_gl = " . $_REQUEST["i_cal_gl"];
	}

	$sqlMain = "
		SET NOCOUNT ON
		DECLARE @d_begin datetime = '{$_REQUEST["d_date_start"]}';
		DECLARE @d_end datetime = '{$_REQUEST["d_date_end"]}';
		SELECT
			a.*
			,b.c_name AS dc_expense_budget_type_name
		FROM (
			/* =================== BTN ==================== */
			SELECT
				cc.i_return
				,cc.dc_expense_budget_type_id
				,bb.c_code AS c_code_gx
				,bb.c_ref_doc
				,CONVERT(VARCHAR, bb.d_save_date, 120) AS d_save_date
				,cc.i_type_year
				,cc.c_budget_year
				,ff.dc_acc_id
				,ff.c_code
				,ff.c_name
				,-SUM(ISNULL(cc.f_cr,0)) AS f_amount
			FROM dbo.gl_bank aa
				INNER JOIN dbo.gl_tran_hdr bb ON aa.gl_tran_hdr_id = bb.gl_tran_hdr_id
				INNER JOIN dbo.gl_tran_dtl cc ON cc.gl_tran_hdr_id = bb.gl_tran_hdr_id
				INNER JOIN dbo.dc_acc dd ON dd.dc_acc_id = cc.dc_acc_id
				INNER JOIN dbo.imp_fix_acc ee ON dd.dc_acc_id = ee.dc_acc_id
				LEFT JOIN dbo.vw_dc_acc_with_parent ff ON cc.dc_acc_id = ff.dc_acc_id
			WHERE aa.i_enable = 1 AND LEFT(aa.c_code,3) = 'btn' AND bb.table_name = 'gl_bank'
				AND bb.i_enable = 1 AND bb.i_is_post > 1 AND LEFT(bb.c_code,1) = 'g'
				AND bb.i_is_close_year = 2
				AND ISNULL(cc.f_cr,0) > 0
				AND bb.i_type = 2
				AND dd.i_enable = 1
				AND CONVERT(DATETIME, bb.d_save_date, 102) BETWEEN CONVERT(DATETIME, @d_begin, 102) AND CONVERT(DATETIME, @d_end, 102)
				AND cc.i_return = {$_REQUEST["i_return"]}
				{$con}
			GROUP BY
				cc.dc_expense_budget_type_id
				,ff.dc_acc_id
				,ff.c_code
				,ff.c_name
				,cc.i_return
				,bb.d_save_date
				,cc.i_type_year
				,cc.c_budget_year
				,bb.c_code
				,bb.c_ref_doc
			UNION ALL
			/* =============== ยกเลิก BTN ================== */
			SELECT
				cc.i_return
				,cc.dc_expense_budget_type_id
				,bb.c_code AS c_code_gx
				,bb.c_ref_doc
				,CONVERT(VARCHAR, bb.d_save_date, 120) AS d_save_date
				,cc.i_type_year
				,cc.c_budget_year
				,ff.dc_acc_id
				,ff.c_code
				,ff.c_name
				,-(SUM(ISNULL(cc.f_cr,0))) AS f_amount
			FROM dbo.gl_tran_hdr bb
				INNER JOIN dbo.gl_tran_dtl cc ON bb.gl_tran_hdr_id = cc.gl_tran_hdr_id
				INNER JOIN dbo.dc_acc dd ON cc.dc_acc_id = dd.dc_acc_id
				INNER JOIN dbo.imp_fix_acc ee ON dd.dc_acc_id = ee.dc_acc_id
				LEFT JOIN dbo.vw_dc_acc_with_parent ff ON cc.dc_acc_id = ff.dc_acc_id
			WHERE bb.i_enable = 1 AND bb.i_is_post > 1 AND LEFT(bb.c_code,1) = 'g'
				AND bb.i_is_close_year = 2
				AND bb.i_type = 2
				AND dd.i_enable = 1
				AND ISNULL(cc.f_cr,0) > 0
				AND bb.table_name IN ('gl_bank')
				AND CONVERT(DATETIME, bb.d_save_date, 102) BETWEEN CONVERT(DATETIME, @d_begin, 102) AND CONVERT(DATETIME, @d_end, 102)
				AND cc.i_return = {$_REQUEST["i_return"]}
				{$con}
			GROUP BY
				cc.dc_expense_budget_type_id
				,ff.dc_acc_id
				,ff.c_code
				,ff.c_name
				,cc.i_return
				,bb.d_save_date
				,cc.i_type_year
				,cc.c_budget_year
				,bb.c_code
				,bb.c_ref_doc
			UNION ALL
			/* GX ของ ทุกอย่างที่ไม่ใช่ BTN เฉพาะ ผังบัญชี (manual) */
			SELECT
				cc.i_return
				,cc.dc_expense_budget_type_id
				,bb.c_code AS c_code_gx
				,bb.c_ref_doc
				,CONVERT(VARCHAR, bb.d_save_date, 120) AS d_save_date
				,cc.i_type_year
				,cc.c_budget_year
				,ff.dc_acc_id
				,ff.c_code
				,ff.c_name
				,-(SUM(ISNULL(cc.f_cr,0))) AS f_amount
			FROM dbo.gl_tran_hdr bb
				INNER JOIN dbo.gl_tran_dtl cc ON bb.gl_tran_hdr_id = cc.gl_tran_hdr_id
				INNER JOIN dbo.dc_acc dd ON cc.dc_acc_id = dd.dc_acc_id
				INNER JOIN dbo.imp_fix_acc ee ON dd.dc_acc_id = ee.dc_acc_id
				LEFT JOIN dbo.vw_dc_acc_with_parent ff ON cc.dc_acc_id = ff.dc_acc_id
			WHERE bb.i_enable = 1 AND bb.i_is_post > 1 AND LEFT(bb.c_code,1) = 'g'
				AND bb.i_is_close_year = 2
				AND ISNULL(cc.f_cr,0) > 0
				AND bb.i_type = 1
				AND dd.i_enable = 1
				AND CONVERT(DATETIME, bb.d_save_date, 102) BETWEEN CONVERT(DATETIME, @d_begin, 102) AND CONVERT(DATETIME, @d_end, 102)
				AND cc.i_return = {$_REQUEST["i_return"]}
				{$con}
			GROUP BY
				cc.dc_expense_budget_type_id
				,ff.dc_acc_id
				,ff.c_code
				,ff.c_name
				,cc.i_return
				,bb.d_save_date
				,cc.i_type_year
				,cc.c_budget_year
				,bb.c_code
				,bb.c_ref_doc
			UNION ALL
			/* =============== ยกเลิก IMP ================== */
			SELECT
				cc.i_return
				,cc.dc_expense_budget_type_id
				,bb.c_code AS c_code_gx
				,bb.c_ref_doc
				,CONVERT(VARCHAR, bb.d_save_date, 120) AS d_save_date
				,cc.i_type_year
				,cc.c_budget_year
				,ff.dc_acc_id
				,ff.c_code
				,ff.c_name
				,-(SUM(ISNULL(cc.f_cr,0))) AS f_amount
			FROM dbo.gl_tran_hdr bb
				INNER JOIN dbo.gl_tran_dtl cc ON bb.gl_tran_hdr_id = cc.gl_tran_hdr_id
				INNER JOIN dbo.dc_acc dd ON cc.dc_acc_id = dd.dc_acc_id
				INNER JOIN dbo.imp_fix_acc ee ON dd.dc_acc_id = ee.dc_acc_id
				LEFT JOIN dbo.vw_dc_acc_with_parent ff ON cc.dc_acc_id = ff.dc_acc_id
			WHERE bb.i_enable = 1 AND bb.i_is_post > 1 AND LEFT(bb.c_code,1) = 'g'
				AND bb.i_is_close_year = 2
				AND bb.i_type = 2
				AND dd.i_enable = 1
				AND ISNULL(cc.f_cr,0) > 0
				AND bb.table_name IN ('imp_expense_vsn_hdr', 'imp_expense_hdr')
				AND CONVERT(DATETIME, bb.d_save_date, 102) BETWEEN CONVERT(DATETIME, @d_begin, 102) AND CONVERT(DATETIME, @d_end, 102)
				AND cc.i_return = {$_REQUEST["i_return"]}
				{$con}
			GROUP BY
				cc.dc_expense_budget_type_id
				,ff.dc_acc_id
				,ff.c_code
				,ff.c_name
				,cc.i_return
				,bb.d_save_date
				,cc.i_type_year
				,cc.c_budget_year
				,bb.c_code
				,bb.c_ref_doc
			) a
		LEFT JOIN dc_expense_budget_type b ON a.dc_expense_budget_type_id = b.dc_expense_budget_type_id
		ORDER BY b.c_name, a.d_save_date, a.c_code;";

	$stmt = $db->QueryParam($sqlMain, array());
	if ($stmt) {
		$f_amount = 0;
		while ($row = $db->Fetch($stmt)) {

			$temp = array(
				"i_type"								=> 1,
				"i_return"								=> $row["i_return"],
				"dc_expense_budget_type_name"			=> $row["dc_expense_budget_type_name"],
				"c_code_gx"								=> $row["c_code_gx"],
				"c_ref_doc"								=> $row["c_ref_doc"],
				"d_save_date"							=> $date->shot_date_from_db($row["d_save_date"]),
				"acc_code"								=> $row["c_code"],
				"acc_name"								=> $row["c_name"],
				"f_amount"								=> abs($row["f_amount"])
			);
			${$root}[] = $temp;

			$f_amount += abs($row["f_amount"]);
		}

		$temp = array(
			"i_type"								=> 2,
			"f_amount"								=> $f_amount
		);
		${$root}[] = $temp;
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
