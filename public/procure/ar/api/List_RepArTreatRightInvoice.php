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

	$con_show = "";

	if ($_REQUEST["d_date_start"] != "" && $_REQUEST["d_date_end"] != "") {
		$con .= " AND a.d_doc_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_date_start"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_date_end"]}'+' 23:59:59',102)";
	}

	if ($_REQUEST["i_status"] != 99) {
		$con .= " AND b.i_status = " . $_REQUEST["i_status"];
	}

	$for_id = explode(";", $_REQUEST["ar_treat_right_group_id"]);
	if (!in_array("0", $for_id)) {
		$in = "";
		if (is_array($for_id)) {
			foreach ($for_id as $val) {
				$in .= ($in == "") ? $val : ", " . $val;
			}
			$con .= ($in != "") ? " AND c.ar_treat_right_group_id IN (" . $in . ")" : "";
			// $con_show .= ($in != "") ? " AND a.ar_treat_right_group_id IN (" . $in . ")" : "";
		}
	}

	// if ($_REQUEST ["i_show_acc"] == 1) {
	// 	$for_id = explode ( ";", $_REQUEST ["dc_acc_id_parent"] );
	// 	if (! in_array ( "0", $for_id )) {
	// 		$in = "";
	// 		if (is_array ( $for_id )) {
	// 			foreach ( $for_id as $val ) {
	// 				$in .= ($in == "") ? $val : ", " . $val;
	// 			}
	// 			$con .= ($in != "") ? " AND e.dc_acc_lv4_id IN (" . $in . ")" : "";
	// 		}
	// 	}
	// } else if ($_REQUEST ["i_show_acc"] == 3) {
	// 	$for_id = explode ( ";", $_REQUEST ["dc_acc_id_parent_lv5"] );
	// 	if (! in_array ( "0", $for_id )) {
	// 		$in = "";
	// 		if (is_array ( $for_id )) {
	// 			foreach ( $for_id as $val ) {
	// 				$in .= ($in == "") ? $val : ", " . $val;
	// 			}
	// 			$con .= ($in != "") ? " AND e.dc_acc_lv5_id IN (" . $in . ")" : "";
	// 		}
	// 	}
	// } else {
	// 	$for_id = explode ( ";", $_REQUEST ["dc_acc_id"] );
	// 	if (! in_array ( "0", $for_id )) {
	// 		$in = "";
	// 		if (is_array ( $for_id )) {
	// 			foreach ( $for_id as $val ) {
	// 				$in .= ($in == "") ? $val : ", " . $val;
	// 			}
	// 			$con .= ($in != "") ? " AND b.dc_acc_id_report IN (" . $in . ")" : "";
	// 		}
	// 	}
	// }

	// if($_REQUEST["i_type_year"] > 0) {
	// 	$con .= " AND b.i_type_year = ".$_REQUEST["i_type_year"];
	// 	$con .= " AND b.c_budget_year = ".$_REQUEST["c_budget_year"];
	// }

	$sqlMain = "
		SET NOCOUNT ON;
		
		/* เรียกเก็บ */
		SELECT
			b.ar_treat_right_id
			,SUM(ISNULL(b.f_cost_amt,0)) AS f_bill
		INTO #temp_bill
		FROM dbo.ar_bill_invoice_hdr a
			INNER JOIN dbo.ar_bill_invoice_dtl b ON a.ar_bill_invoice_hdr_id = b.ar_bill_invoice_hdr_id
			INNER JOIN dbo.ar_treat_right c ON b.ar_treat_right_id = c.ar_treat_right_id
		WHERE a.i_enable = 1
			{$con}
		GROUP BY b.ar_treat_right_id;
		
		/* ตัดชำระ */
		SELECT
			b.ar_treat_right_id
			,SUM(ISNULL(b.f_cost_amt,0)) AS f_cut
		INTO #temp_cut
		FROM dbo.ar_cut_invoice_hdr a
			INNER JOIN dbo.ar_cut_invoice_dtl b ON a.ar_cut_invoice_hdr_id = b.ar_cut_invoice_hdr_id
			INNER JOIN dbo.ar_treat_right c ON b.ar_treat_right_id = c.ar_treat_right_id
		WHERE a.i_enable = 1
			{$con}
		GROUP BY b.ar_treat_right_id;
		
		SELECT
			d.ar_treat_right_group_id
			,CASE
				WHEN d.c_code IS NOT NULL THEN d.c_code+' '+d.c_name
				ELSE d.c_name
			END AS ar_treat_right_group_name
			,c.ar_treat_right_id
			,CASE
				WHEN c.c_code IS NOT NULL THEN c.c_code+' '+c.c_name
				ELSE c.c_name
			END AS ar_treat_right_name
			,ISNULL(a.f_bill,0) AS f_bill
			,ISNULL(b.f_cut,0) AS f_cut
			,0 AS f_cancel
			,0 AS f_receipt
		INTO #temp_data
		FROM #temp_bill a
			FULL JOIN #temp_cut b ON a.ar_treat_right_id = b.ar_treat_right_id
			LEFT JOIN dbo.ar_treat_right c ON
				CASE
					WHEN a.ar_treat_right_id IS NOT NULL THEN a.ar_treat_right_id
					ELSE b.ar_treat_right_id
				END = c.ar_treat_right_id
			LEFT JOIN dbo.ar_treat_right_group d ON c.ar_treat_right_group_id = d.ar_treat_right_group_id
		ORDER BY d.c_name, c.c_name;
		
		SELECT
			*
		INTO #temp_show
		FROM (
			SELECT 1 AS i_type,a.* FROM #temp_data a
			UNION  ALL
			SELECT
				2 AS i_type
				,b.ar_treat_right_group_id
				,b.ar_treat_right_group_name
				,NULL AS ar_treat_right_id
				,NULL AS ar_treat_right_name
				,SUM(b.f_bill) AS f_bill
				,SUM(b.f_cut) AS f_cut
				,SUM(b.f_cancel) AS f_cancel
				,SUM(b.f_receipt) AS f_receipt
			FROM #temp_data b
			GROUP BY b.ar_treat_right_group_id, b.ar_treat_right_group_name
			UNION  ALL
			SELECT
				3 AS i_type
				,NULL AS ar_treat_right_group_id
				,NULL AS ar_treat_right_group_name
				,NULL AS ar_treat_right_id
				,NULL AS ar_treat_right_name
				,SUM(c.f_bill) AS f_bill
				,SUM(c.f_cut) AS f_cut
				,SUM(c.f_cancel) AS f_cancel
				,SUM(c.f_receipt) AS f_receipt
			FROM #temp_data c
		) a;
		
		SELECT * FROM #temp_show
		ORDER BY CASE WHEN ar_treat_right_group_id IS NULL THEN 1 ELSE 0 END,ar_treat_right_group_name, i_type, ar_treat_right_name;";

	$arrParam[] = STATUS_ENABLE;

	$stmt = $db->QueryParam($sqlMain, $arrParam);

	if ($stmt) {
		$f_cost_amt = 0;
		while ($row = $db->Fetch($stmt)) {

			$temp = array(
				"i_type"							=> $row["i_type"],
				"ar_treat_right_group_id"			=> $row["ar_treat_right_group_id"],
				"ar_treat_right_group_name"			=> $row["ar_treat_right_group_name"],
				"ar_treat_right_id"					=> $row["ar_treat_right_id"],
				"ar_treat_right_name"				=> $row["ar_treat_right_name"],
				"f_bill"							=> $row["f_bill"],
				"f_cancel"							=> $row["f_cancel"],
				"f_cut"								=> $row["f_cut"],
				"f_receipt"							=> $row["f_receipt"],
				"f_total"							=> ($row["f_bill"] - $row["f_cancel"]) - $row["f_cut"],
			);
			${$root}[] = $temp;

			// $f_cost_amt += $row["f_cost_amt"];
			// } else {
			// 	$temp = array(
			// 		"i_type"							=> $row["i_type"],
			// 		"ar_treat_right_group_name"			=> $row["ar_treat_right_group_name"],
			// 		"f_cost_amt"						=> $row["f_cost_amt"]
			// 	);
			// 	${$root}[] = $temp;

		}
		// $temp = array(
		// 	"i_type"							=> 3,
		// 	"f_cost_amt"						=> $f_cost_amt
		// );
		// ${$root}[] = $temp;
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
