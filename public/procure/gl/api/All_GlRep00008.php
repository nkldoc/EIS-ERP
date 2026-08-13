<?php
include ("../../lib/database/DatabaseServer.php");
include ("../conf/configGl.php");

$db = new DatabaseServer ();

$root = "data";
$data = array();

if ($_REQUEST ['type'] == 'vw_dc_expense_budget_type') {
	$sqlMain = "	SELECT * FROM vw_dc_expense_budget_type
					WHERE i_enable = ?
					ORDER BY c_name;";
	
	$arrParam [] = STATUS_ENABLE;
	
	$stmt = $db->QueryParam ( $sqlMain, $arrParam );
	if ($stmt) {
		${$root} [] = array (
				"id" => '0',
				"c_name" => '- เลือกทั้งหมด -' 
		);
		while ( $row = $db->Fetch ( $stmt ) ) {
			$temp = array (
					"id" => $row ["dc_expense_budget_type_id"],
					"c_name" => $row ["c_name"] 
			);
			${$root} [] = $temp;
		}
	}
} else if ($_REQUEST ['type'] == 'dc_acc_main') {
	// dc_acc
	$sqlMain = "SELECT a.* FROM vw_dc_acc_with_parent a
					INNER JOIN imp_fix_acc b ON a.dc_acc_id = b.dc_acc_id
				WHERE
					a.i_delete = ".DELETE_FALSE." AND a.i_enable = ".STATUS_ENABLE."
				ORDER BY a.c_code";
	$arrParam = array();
	$stmt = $db->QueryParam ( $sqlMain,$arrParam);
	if ($stmt) {
		${$root} [] = array (
				"id" => '0',
				"c_name" => '- เลือกทั้งหมด -' 
		);
		while ( $row = $db->Fetch ( $stmt ) ) {
			$temp = array (
					"id" => $row ["dc_acc_lv4_id"],
					"c_name" => $row ["c_code_lv4"] . ' ' . $row ["c_name_lv4"] 
			);
			${$root} [] = $temp;
		}
	}
} else if ($_REQUEST ['type'] == 'dc_acc_main_lv5') {
	// dc_acc
	$sqlMain = "SELECT a.* FROM vw_dc_acc_with_parent a
					INNER JOIN imp_fix_acc b ON a.dc_acc_id = b.dc_acc_id
				WHERE
					a.i_delete = ".DELETE_FALSE." AND a.i_enable=".STATUS_ENABLE."
				ORDER BY a.c_code";
	$arrParam = array ( );
	$stmt = $db->QueryParam ( $sqlMain, $arrParam );
	if ($stmt) {
		${$root} [] = array (
				"id" => '0',
				"c_name" => '- เลือกทั้งหมด -' 
		);
		while ( $row = $db->Fetch ( $stmt ) ) {
			$temp = array (
					"id" => $row ["dc_acc_lv5_id"],
					"c_name" => $row ["c_code_lv5"] . ' ' . $row ["c_name_lv5"] 
			);
			${$root} [] = $temp;
		}
	}
} else if ($_REQUEST ['type'] == 'dc_acc') {
	// dc_acc
	$sqlMain = "SELECT a.* FROM vw_dc_acc_with_parent a
					INNER JOIN imp_fix_acc b ON a.dc_acc_id = b.dc_acc_id
				WHERE a.i_delete = ".DELETE_FALSE." AND a.i_enable = ".STATUS_ENABLE." ORDER BY a.c_code";
	$arrParam = array ( );
	$stmt = $db->QueryParam ( $sqlMain, $arrParam );
	if ($stmt) {
		${$root} [] = array (
				"id" => '0',
				"c_name" => '- เลือกทั้งหมด -' 
		);
		while ( $row = $db->Fetch ( $stmt ) ) {
			$temp = array (
					"id" => $row ["dc_acc_id"],
					"c_name" => $row ["c_code"] . ' ' . $row ["c_name"] 
			);
			${$root} [] = $temp;
		}
	}
} else if ($_REQUEST ["type"] == "expense_group") {
	
	if(@$_REQUEST["table_name"] == "imp_expense") {
		
		$sqlMain = "SELECT
						a.dc_expense_group_id AS expense_group_id
						,a.c_code
						,a.c_name
					FROM vw_dc_expense_group a
					WHERE a.i_enable = ".STATUS_ENABLE." ORDER BY a.c_name;";
		
	} else if(@$_REQUEST["table_name"] == "imp_expense_vsn") {
		
		$sqlMain = "SELECT
						a.dc_expense_group_vsn_id AS expense_group_id
						,a.c_code
						,a.c_name
					FROM vw_dc_expense_group_vsn a
					WHERE a.i_enable = ".STATUS_ENABLE." ORDER BY a.c_name;";
		
	} else { $sqlMain	= "";}
	
	$arrParam = array ();
	$stmt = $db->QueryParam ( $sqlMain, $arrParam );
	if ($stmt) {
		while ( $row = $db->Fetch ( $stmt ) ) {
			$temp = array (
				"id"		=> $row["expense_group_id"],
				"c_name"	=> $row["c_code"]." ".$row["c_name"]
			);
			${$root} [] = $temp;
		}
	}
} else if ($_REQUEST ["type"] == "expense") {
	
	$sqlMain	= "";
	if(@$_REQUEST["table_name"] == "imp_expense") {
		
		$expense_group_id	= ($_REQUEST["expense_group_id"] != "")? " AND a.dc_expense_group_id = {$_REQUEST["expense_group_id"]}" : "";
		if($_REQUEST["expense_group_id"] > 0) {
			$sqlMain = "SELECT
							a.dc_expense_id AS expense_id
							,a.c_code
							,a.c_name
							,b.c_code+' '+b.c_name AS acc_name
						FROM vw_dc_expense a
							INNER JOIN dc_acc b ON a.dc_acc_id = b.dc_acc_id
						WHERE a.i_enable = ".STATUS_ENABLE."
							AND a.dc_acc_id = a.dc_acc_id_overlap
							{$expense_group_id}
						ORDER BY a.c_name;";
		}
		
	} else if(@$_REQUEST["table_name"] == "imp_expense_vsn") {
		
		$expense_group_id	= ($_REQUEST["expense_group_id"] != "")? " AND c.dc_expense_group_vsn_id = {$_REQUEST["expense_group_id"]}" : "";
		$sqlMain = "SELECT
						a.dc_expense_acc_vsn_id AS expense_id
						,a.c_code
						,a.c_name
						,b.c_code+' '+b.c_name AS acc_name
					FROM vw_dc_expense_acc_vsn a
						INNER JOIN vw_dc_expense_vsn c ON a.dc_expense_vsn_id = c.dc_expense_vsn_id 
						INNER JOIN dc_acc b ON a.dc_acc_id = b.dc_acc_id
					WHERE a.i_enable = ".STATUS_ENABLE."
						AND a.dc_acc_id = a.dc_acc_id_overlap
						{$expense_group_id}
					ORDER BY a.c_name;";
	}
	
	$arrParam = array ();
	$stmt = $db->QueryParam ( $sqlMain, $arrParam );
	if ($stmt) {
		while ( $row = $db->Fetch ( $stmt ) ) {
			$temp = array (
				"id"			=> $row["expense_id"],
				"c_name"		=> $row["c_code"]." ".$row["c_name"],
				"acc_name"		=> $row["acc_name"],
			
			);
			${$root} [] = $temp;
		}
	}
}

echo json_encode ( array ( "debug" => true, $root => ${$root} ) );
exit ();
?>
