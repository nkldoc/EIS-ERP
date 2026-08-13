<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

if ($_REQUEST["type"] == "dc_acc") {

    $sqlMain = "SELECT * FROM dc_acc
                WHERE i_last=1 AND i_delete = ? and i_enable=".STATUS_ENABLE." ORDER BY c_code";
    $arrParam = array ( DELETE_FALSE );
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array (
                "id" => $row ["dc_acc_id"],
                "c_name" => $row ["c_code"] . ' ' . $row ["c_name"] 
            );
            ${$root} [] = $temp;
		}
	}
} 
 

echo json_encode(array("debug" => true, $root => ${$root}));
exit;

