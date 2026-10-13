<?php
include("../conf/configPo.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;
if ($_REQUEST["type"] == "dc_user") {

	$i_permission = $db->GetDataBySQL("SELECT a.i_permission FROM dbo.po_user_permission a WHERE a.dc_user_id = ?;", array($_SESSION["user_id"]));

	if ($_SESSION["i_type_user"] == 1 && $i_permission != 1) {
		$con .= " AND dc_user_id = " . $_SESSION["user_id"];
	} else {
		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
			);
		}
	}
	$sqlMain = "
		SELECT * FROM dbo.dc_user
		WHERE i_enable = 1 AND i_delete = 2 AND i_type_user = 1
			{$con}
		ORDER BY c_full_name";
	$arrParam	= array();
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["dc_user_id"]}",
				"c_name"	=>  $row["c_full_name"]
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "status") {

	if (@$_REQUEST["all"] == "all") {
		${$root}[] = array(
			"id"		=> "0",
			"c_name"	=> "- เลือกทั้งหมด -"
		);
	}
	if (@$_REQUEST["dc_user_id"] > 0) {
		$stmt =	$db->QueryParam("
			SELECT
				DISTINCT a.i_status
			FROM dbo.po_working_item a
			WHERE a.dc_user_create_id = {$_REQUEST["dc_user_id"]}
			UNION ALL
			SELECT
				DISTINCT 12 AS i_status
			FROM dbo.po_working_cheque a
			WHERE a.dc_user_update_id_cheque = {$_REQUEST["dc_user_id"]};", array());
		while ($row = $db->Fetch($stmt)) {
			if (
				$row["i_status"] != 1
				&& $row["i_status"] != 3
				&& $row["i_status"] != 13
			) {
				$temp = array(
					"id"		=> $row["i_status"],
					"c_name"	=> $CONF_I_STATUS[$row["i_status"]]
				);
				${$root}[] = $temp;
			}
		};
	} else {
		foreach ($CONF_I_STATUS as $id => $c_name) {
			if ($id != 1 && $id != 3 && $id != 13) {
				$temp = array(
					"id"		=> "{$id}",
					"c_name"	=>  $c_name
				);
				${$root}[] = $temp;
			}
		}
	}
} else if ($_REQUEST["type"] == "po_parcel_officer") {

	//$i_permission = $db->GetDataBySQL("SELECT a.i_permission FROM dbo.po_user_permission a WHERE a.dc_user_id = ?;", array($_SESSION["user_id"]));

	if (@$_REQUEST["all"] == "all") {
		${$root}[] = array(
			"id"		=> "0",
			"c_name"	=> "- เลือกทั้งหมด -"
		);
	}
	$sqlMain = "
		SELECT * FROM po_parcel_officer
		WHERE i_enable = 1 AND i_delete = 2
			{$con}
		ORDER BY c_name";
	$arrParam	= array();
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["po_parcel_officer_id"]}",
				"c_name"	=>  $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "bg_expense") {

	$sqlMain	= "SELECT * FROM dbo.bg_expense WHERE i_last = 1 and i_enable = ? ORDER BY c_code_tree";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"					=> "{$row["bg_expense_id"]}",
				"c_name"				=> $row["c_code"] . " : " . $row["c_name"],
				"c_name_excel"			=> $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
}
echo json_encode(array("debug" => true, $root => ${$root}));
exit;
