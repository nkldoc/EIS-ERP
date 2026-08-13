<?php
include ("../../lib/database/DatabaseServer.php");
include ("../../lib/database/apiUtil.php");

$db = new DatabaseServer ();
$util = new apiUtil ();

$root = "data";
$data = array ();
$con = null;
if ($_REQUEST ['type'] == 'dc_acc') {
	// dc_acc
	$sqlMain = "SELECT * FROM dc_acc
				WHERE
					i_last=1 AND i_delete = ? and i_enable=1
					AND i_group = 4
				ORDER BY c_code";
	$arrParam = array (
			DELETE_FALSE 
	);
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
} else if ($_REQUEST ['type'] == 'dc_acc_main') {
	// dc_acc
	$sqlMain = "SELECT * FROM dc_acc
				WHERE
					i_last=2 and i_level=? AND i_delete = ? and i_enable=1
					AND i_group = 4
				ORDER BY c_code";
	$arrParam = array (
			5,
			DELETE_FALSE 
	);
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