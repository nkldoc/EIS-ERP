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
	$type = $_REQUEST["type"] ?? 0;
	$start = $_REQUEST["start"] ?? 0;
	$i_tor_type = $_REQUEST["chart"] ?? 0;
	// $year_en = ($_REQUEST["year_en"] > 0) ?   " AND  a.i_pr_year =  {$_REQUEST["year_en"]}" : '';

	$detailMap = [];
	$where = "";
	// if ($_REQUEST["col"] == "income_check") {
	// } else if ($_REQUEST["col"] == "bkk_check") {
	// } else if ($_REQUEST["col"] == "gov_check") {
	// } else if ($_REQUEST["col"] == "Savings_check") {

	// 	// } else if ($_REQUEST["col"] == "dc_expense_budget_type_id") {
	// 	// $where    .= " AND a.dc_expense_budget_type_id LIKE '%" . $_REQUEST["dc_expense_budget_type_id"] . "%' ";
	// 	// --and a.dc_expense_budget_type_id = 49
	// } else {
	// }
	// if (@$_REQUEST["dc_expense_budget_type_id"] > 0) {
	// 	if (in_array($_REQUEST["dc_expense_budget_type_id"], [4, 5])) {
	// 		$where    .= " and a.i_pr_type = 2 ";
	// 	} else {
	// 		$where    .= " and a.i_pr_type = 1";
	// 	}
	// 	$where    .= " AND a.dc_expense_budget_type_id LIKE '%" . $_REQUEST["dc_expense_budget_type_id"] . "%' ";
	// }
	// if (@$_REQUEST["bg_expense_id"] > 0) {
	// 	$where    .= " AND a.bg_expense_id LIKE '%" . $_REQUEST["bg_expense_id"] . "%' ";
	// }
	// if (@$_REQUEST["year_en"] > 0) {
	// 	$where    .= " AND a.i_year LIKE '%" . $_REQUEST["year_en"] . "%' ";
	// }
	if (@$_REQUEST["Performance_Summary"] == 1) {
		$where  .= "   AND TRY_CONVERT(INT, SUBSTRING(b.c_code, 3, 4)) = ". $_REQUEST['year']
				." AND TRY_CONVERT(INT, SUBSTRING(b.c_code, 7, 2)) =  ". $_REQUEST['month'] ;
	}
	$sqlMain = "SET NOCOUNT ON 
						select 
						-- *
						 1 as  i_sys
						, a.tor_id as pr_id
						,a.f_total_amt as f_amt 
						,a.po_expense_id as bg_expense_id
						,a.dc_expense_budget_type_id
						,(select c_name from " . DB_NMU_EIS . "bg_expense where bg_expense_id = a.po_expense_id) as bg_expense
						,(select c_name from " . DB_CENTER . "dc_expense_budget_type where dc_expense_budget_type_id = a.dc_expense_budget_type_id) as dc_expense_budget_type
						,a.dc_cost_id
						,(select c_name from " . DB_CENTER . "dc_cost where dc_cost_id =   b.dc_cost_id) as dc_cost
						,(select c_name from " . DB_CENTER . "dc_cost where dc_cost_id =   b.dc_cost2_id) as dc_cost_id2
						,(select c_name from " . DB_NMU_ERP . "sp_emp where sp_emp_id = b.sp_emp_id ) as sp_emp 
    					,(select c_name from " . DB_NMU_ERP . "sp_status_hdr where sp_status_hdr_id = b.tor_status_id ) as sp_status_hdr
    					,(select c_name from " . DB_NMU_ERP . "sp_department where dc_department_id = b.dc_department_id ) as dc_department

						,b.c_name
						,b.c_code
						from sp_Tor a
						inner join NMU_ERP..sp_Tor b on a.tor_id = b.tor_id 
						where 1 = 1 
						AND a.i_enabled = 1
						AND a.i_type_bg = 1
						{$where}   
						
";
	$stmt = $db->QueryParam($sqlMain, array());
	// /******echo sql******/
	// $sql = (@$sqlMain) ? $sqlMain : $sql;
	// $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());

	// $sql = str_replace('?', '#-#', $sql);
	// foreach ($arr as $fld => $value) {
	//  $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
	// }
	// echo $sql; exit;
	// /********************/
	if ($stmt) {
		$no = 0;
		$f_total_amt = 0;
		$po_working_hdr_status = 0;
		while ($row = $db->Fetch($stmt)) {
			$sp_tor_id = $row['pr_id'];
			$f_amt = 0;
			$temp = array(
				"i_type"                            => 1,
				"no"                                => ++$no,
				"tor_id"                            => $sp_tor_id,
				"sp_tor_id"                         => $row["pr_id"],
				"c_code"                            => $row["c_code"],
				"c_name"                            => $row["c_name"],
				// "tor_type"                          => $row["tor_type"],
				"sp_emp"                         => $row["sp_emp"],
				"sp_status_hdr"                       => $row["sp_status_hdr"],
				"dc_department"                       => $row["dc_department"],
				"dc_cost"                           => $row["dc_cost"],
				"dc_cost_id2"                       => $row["dc_cost_id2"],
				"bg_expense"                        => $row["bg_expense"],
				"bg_expense_id"                     => $row["bg_expense_id"],
				"dc_expense_budget_type_id"         => $row["dc_expense_budget_type_id"],
				"dc_expense_budget_type"            => $row["dc_expense_budget_type"],
				// "i_product_type"                    => $i_product_type,
				// "i_purchase"                        => $i_purchase,
				// "i_type_contract"                   => $i_type_contract,
				// "po_code"                           => $row["po_code"],
				// "c_code"                            => $row["c_code"],
				// "c_name"                            => $row["c_name"],
				"f_amt"                             => (float) $row["f_amt"],
				// "f_amt"                             => $row["f_amt"] ?? 0,
				// "i_pr_year"                         => $row["i_pr_year"],
				// "i_enabled"                         => $row["i_enabled"],
				// "i_type_bg"                         => $row["i_type_bg"],
				// "index_receive"                     => $row["index_receive"],
				// "d_doc_ref"                         => $row["d_doc_ref"],
				// "po_working_hdr_status"             => $po_working_hdr_status,
				// "po_working_hdr_status_int"         => $row["po_working_hdr_status"],
				// "pwi_050d_doc_date"                 => $row["pwi_050d_doc_date"],

				"children"                          => isset(
					$detailMap[$sp_tor_id]

				) ? $detailMap[$sp_tor_id] : [],
			);
			${$root}[]	= $temp;
			$f_amt += $row["f_amt"];
		}
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
