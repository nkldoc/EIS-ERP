<?php
include ("../../lib/database/DatabaseServer.php");
include ("../../lib/database/apiUtil.php");

$db = new DatabaseServer ();
$util = new apiUtil ();

$root = "data";
$data = array ();
$con = null;
if ($_REQUEST ['type'] == 'dc_period') {
	// dc_acc
	$sqlMain = "SELECT * FROM dc_period
				WHERE i_delete = ? and i_enable=1
				ORDER BY c_name";
	$arrParam = array (DELETE_FALSE);
	$stmt = $db->QueryParam ( $sqlMain, $arrParam );
	if ($stmt) {
		${$root} [] = array (
				"id" => '0',
				"c_name" => '- เลือกทั้งหมด -' 
		);
		while ( $row = $db->Fetch ( $stmt ) ) {
			$temp = array (
					"id" => $row ["dc_period_id"],
					"c_name" => $row ["c_name"] 
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