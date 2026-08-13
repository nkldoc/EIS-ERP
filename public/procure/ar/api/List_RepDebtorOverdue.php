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

	// $con_show = "";

	// if ($_REQUEST["d_date_start"] != "" && $_REQUEST["d_date_end"] != "") {
	// 	$con .= " AND a.d_doc_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_date_start"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_date_end"]}'+' 23:59:59',102)";
	// }

	// if ($_REQUEST["i_status"] != 99) {
	// 	$con .= " AND b.i_status = " . $_REQUEST["i_status"];
	// }

	// $for_id = explode(";", $_REQUEST["ar_treat_right_group_id"]);
	// if (!in_array("0", $for_id)) {
	// 	$in = "";
	// 	if (is_array($for_id)) {
	// 		foreach ($for_id as $val) {
	// 			$in .= ($in == "") ? $val : ", " . $val;
	// 		}
	// 		$con .= ($in != "") ? " AND c.ar_treat_right_group_id IN (" . $in . ")" : "";
	// 		// $con_show .= ($in != "") ? " AND a.ar_treat_right_group_id IN (" . $in . ")" : "";
	// 	}
	// }

	// // if ($_REQUEST ["i_show_acc"] == 1) {
	// // 	$for_id = explode ( ";", $_REQUEST ["dc_acc_id_parent"] );
	// // 	if (! in_array ( "0", $for_id )) {
	// // 		$in = "";
	// // 		if (is_array ( $for_id )) {
	// // 			foreach ( $for_id as $val ) {
	// // 				$in .= ($in == "") ? $val : ", " . $val;
	// // 			}
	// // 			$con .= ($in != "") ? " AND e.dc_acc_lv4_id IN (" . $in . ")" : "";
	// // 		}
	// // 	}
	// // } else if ($_REQUEST ["i_show_acc"] == 3) {
	// // 	$for_id = explode ( ";", $_REQUEST ["dc_acc_id_parent_lv5"] );
	// // 	if (! in_array ( "0", $for_id )) {
	// // 		$in = "";
	// // 		if (is_array ( $for_id )) {
	// // 			foreach ( $for_id as $val ) {
	// // 				$in .= ($in == "") ? $val : ", " . $val;
	// // 			}
	// // 			$con .= ($in != "") ? " AND e.dc_acc_lv5_id IN (" . $in . ")" : "";
	// // 		}
	// // 	}
	// // } else {
	// // 	$for_id = explode ( ";", $_REQUEST ["dc_acc_id"] );
	// // 	if (! in_array ( "0", $for_id )) {
	// // 		$in = "";
	// // 		if (is_array ( $for_id )) {
	// // 			foreach ( $for_id as $val ) {
	// // 				$in .= ($in == "") ? $val : ", " . $val;
	// // 			}
	// // 			$con .= ($in != "") ? " AND b.dc_acc_id_report IN (" . $in . ")" : "";
	// // 		}
	// // 	}
	// // }

	// // if($_REQUEST["i_type_year"] > 0) {
	// // 	$con .= " AND b.i_type_year = ".$_REQUEST["i_type_year"];
	// // 	$con .= " AND b.c_budget_year = ".$_REQUEST["c_budget_year"];
	// // }

	$sqlMain = "
		SET NOCOUNT ON;
		/* เรียกเก็บ */
		SELECT
			a.ar_bill_hdr_id
			,b.ar_bill_dtl_id
			,a.c_code_bill
			,a.d_bill_date
			,b.ar_treat_right_id
			,b.c_hn
			,b.c_an
			,b.c_patient
			,SUM(c.f_bill) AS f_bill
			,SUM(CASE WHEN b.d_cancel_date IS NOT NULL THEN c.f_bill ELSE 0 END) AS f_bill_cancel
		INTO #temp_bill
		FROM dbo.ar_bill_hdr a
			INNER JOIN dbo.ar_bill_dtl b ON a.ar_bill_hdr_id = b.ar_bill_hdr_id
			INNER JOIN dbo.ar_bill_item c ON b.ar_bill_dtl_id = c.ar_bill_dtl_id
		WHERE a.d_bill_date BETWEEN '{$_REQUEST["d_date_start"]} 00:00:00.000' AND '{$_REQUEST["d_date_end"]} 23:59:59.000'
		GROUP BY
			a.ar_bill_hdr_id
			,b.ar_bill_dtl_id
			,a.c_code_bill
			,a.d_bill_date
			,b.ar_treat_right_id
			,b.c_hn
			,b.c_an
			,b.c_patient;

		/* ตัดชำระ */
		SELECT
			a.ar_bill_hdr_id
			,a.ar_bill_dtl_id
			,ROW_NUMBER() OVER(PARTITION BY a.ar_bill_dtl_id ORDER BY a.ar_bill_dtl_id, b.i_rank) AS i_row_bill
			,c.ar_cut_hdr_id
			,b.ar_cut_dtl_id
			,a.ar_treat_right_id
			,a.c_hn
			,a.c_an
			,a.c_patient
			,a.c_code_bill
			,a.d_bill_date
			,CASE WHEN ROW_NUMBER() OVER(PARTITION BY a.ar_bill_dtl_id ORDER BY a.ar_bill_dtl_id, b.i_rank) = 1 THEN a.f_bill ELSE NULL END AS f_bill
			,CASE WHEN ROW_NUMBER() OVER(PARTITION BY a.ar_bill_dtl_id ORDER BY a.ar_bill_dtl_id, b.i_rank) = 1 THEN a.f_bill_cancel ELSE NULL END AS f_bill_cancel
			,c.c_code_cut
			,c.d_cut_date
			,SUM(ISNULL(d.f_cut,0) - ISNULL(e.f_total,0)) AS f_cut
			,SUM(ISNULL(CASE WHEN b.d_cancel_date IS NOT NULL THEN d.f_cut ELSE 0 END,0)) AS f_cut_cancel
			,b.i_rank
		INTO #temp_cut
		FROM #temp_bill a
			LEFT JOIN dbo.ar_cut_dtl b ON a.ar_bill_dtl_id = b.ar_bill_dtl_id
			LEFT JOIN dbo.ar_cut_hdr c ON b.ar_cut_hdr_id = c.ar_cut_hdr_id
			LEFT JOIN dbo.ar_cut_item d ON b.ar_cut_dtl_id = d.ar_cut_dtl_id
			/* รับเพิ่ม/คืนเงิน */
			LEFT JOIN (
				SELECT
					aa.ar_cut_item_id
					,SUM(ISNULL(aa.f_cr,0) - ISNULL(aa.f_dr,0)) AS f_total
				FROM dbo.ar_cut_adjust aa
				WHERE aa.i_enable = 1
				GROUP BY aa.ar_cut_item_id
			) e ON d.ar_cut_item_id = e.ar_cut_item_id
		GROUP BY
			a.ar_bill_hdr_id
			,a.ar_bill_dtl_id
			,c.ar_cut_hdr_id
			,b.ar_cut_dtl_id
			,a.ar_treat_right_id
			,a.c_hn
			,a.c_an
			,a.c_patient
			,a.c_code_bill
			,a.d_bill_date
			,a.f_bill
			,a.f_bill_cancel
			,c.c_code_cut
			,c.d_cut_date
			,b.i_rank;

		SELECT
			a.ar_bill_hdr_id
			,a.ar_bill_dtl_id
			,a.i_row_bill
			,a.ar_cut_hdr_id
			,a.ar_cut_dtl_id
			,a.ar_treat_right_id
			,b.c_name AS ar_treat_right_name
			,a.c_hn
			,a.c_an
			,a.c_patient
			,a.c_code_bill
			,CONVERT(VARCHAR, a.d_bill_date, 120) AS d_bill_date
			,a.f_bill
			,a.f_bill_cancel
			,a.c_code_cut
			,CONVERT(VARCHAR, a.d_cut_date, 120) AS d_cut_date
			,a.f_cut
			,a.f_cut_cancel
		FROM #temp_cut a
			LEFT JOIN ar_treat_right b ON a.ar_treat_right_id = b.ar_treat_right_id
		ORDER BY a.d_bill_date, a.c_code_bill, a.ar_bill_dtl_id, a.f_bill DESC, a.i_rank;";

	$arrParam = array();

	$stmt = $db->QueryParam($sqlMain, $arrParam);

	if ($stmt) {
		$f_bill = 0;
		$f_bill_cancel = 0;
		$f_cut = 0;
		$f_cut_cancel = 0;
		$f_receipt = 0;
		$f_receipt_cancel = 0;
		$f_reduce = 0;
		$f_over = 0;
		$no = 0;
		while ($row = $db->Fetch($stmt)) {

			$f_total = ($row["f_cut"] - $row["f_cut_cancel"]) - ($row["f_bill"] - $row["f_bill_cancel"]);

			$temp = array(
				"no"								=> ($row["i_row_bill"] == 1) ? ++$no : "",
				"ar_bill_hdr_id"					=> ($row["i_row_bill"] == 1) ? $row["ar_bill_hdr_id"] : "",
				"ar_bill_dtl_id"					=> ($row["i_row_bill"] == 1) ? $row["ar_bill_dtl_id"] : "",
				"ar_treat_right_id"					=> ($row["i_row_bill"] == 1) ? $row["ar_treat_right_id"] : "",
				"ar_treat_right_name"				=> ($row["i_row_bill"] == 1) ? $row["ar_treat_right_name"] : "",
				"c_hn"								=> ($row["i_row_bill"] == 1) ? $row["c_hn"] : "",
				"c_an"								=> ($row["i_row_bill"] == 1) ? $row["c_an"] : "",
				"c_patient"							=> ($row["i_row_bill"] == 1) ? $row["c_patient"] : "",
				"c_code_bill"						=> ($row["i_row_bill"] == 1) ? $row["c_code_bill"] : "",
				"d_bill_date"						=> ($row["i_row_bill"] == 1 && $row["d_bill_date"] != "") ? $date->shot_date_from_db($row["d_bill_date"]) : "",
				"f_bill"							=> ($row["i_row_bill"] == 1) ? $row["f_bill"] : "",
				"f_bill_cancel"						=> ($row["i_row_bill"] == 1) ? $row["f_bill_cancel"] : "",
				"ar_cut_dtl_id"						=> $row["ar_cut_dtl_id"],
				"c_code_cut"						=> $row["c_code_cut"],
				"d_cut_date"						=> ($row["d_cut_date"] != "") ? $date->shot_date_from_db($row["d_cut_date"]) : "",
				"f_cut"								=> $row["f_cut"],
				"f_cut_cancel"						=> $row["f_cut_cancel"],
				// "f_receipt"							=> $row["f_receipt"],
				// "f_receipt_cancel"					=> $row["f_receipt_cancel"],
				"f_reduce"							=> ($f_total < 0) ? $f_total : 0,
				"f_over"							=> ($f_total > 0) ? $f_total : 0,
			);
			${$root}[] = $temp;

			$f_bill				+= $row["f_bill"];
			$f_bill_cancel		+= $row["f_bill_cancel"];
			$f_cut				+= $row["f_cut"];
			$f_cut_cancel		+= $row["f_cut_cancel"];
			// $f_receipt			+= $row["f_receipt"];
			// $f_receipt_cancel	+= $row["f_receipt_cancel"];
			$f_reduce			+= ($f_total < 0) ? $f_total : 0;
			$f_over				+= ($f_total > 0) ? $f_total : 0;
		}
		$temp = array(
			"i_type"							=> 1,
			"f_bill"							=> $f_bill,
			"f_bill_cancel"						=> $f_bill_cancel,
			"f_cut"								=> $f_cut,
			"f_cut_cancel"						=> $f_cut_cancel,
			// "f_receipt"							=> $f_receipt,
			// "f_receipt_cancel"					=> $f_receipt_cancel,
			"f_reduce"							=> $f_reduce,
			"f_over"							=> $f_over,
		);
		${$root}[] = $temp;
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
