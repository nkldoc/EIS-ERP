<?php
include ("../../lib/database/DatabaseServer.php");
//include ("../conf/configGl.php");

$db = new DatabaseServer ();

$root = "data";

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
	$sqlMain = "SELECT * FROM dc_acc
				WHERE
					i_last=2 and i_level=? AND i_delete = ? and i_enable=".STATUS_ENABLE."
				ORDER BY c_code";
	$arrParam = array ( 4, DELETE_FALSE  );
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
} else if ($_REQUEST ['type'] == 'dc_acc_main_lv5') {
	// dc_acc
	$sqlMain = "SELECT * FROM dc_acc
				WHERE
					i_last=2 and i_level=? AND i_delete = ? and i_enable=".STATUS_ENABLE."
				ORDER BY c_code";
	$arrParam = array ( 5, DELETE_FALSE  );
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
} else if ($_REQUEST ['type'] == 'dc_acc') {
	// dc_acc
	$sqlMain = "SELECT * FROM dc_acc
				WHERE i_last=1 AND i_delete = ? and i_enable=".STATUS_ENABLE." ORDER BY c_code";
	$arrParam = array ( DELETE_FALSE );
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
}
echo json_encode ( array (
		"debug" => true,
		$root => ${$root} 
) );
exit ();
?>
