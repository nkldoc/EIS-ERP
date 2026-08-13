<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db = new DatabaseServer();
$util = new apiUtil();

$root = "data";
$data = array();
$con = null;
if ($_REQUEST["type"] == "dc_expense") {

	$sqlMain = "	SELECT a.*,a.c_map_code+' '+a.c_name+ ' (หมวด'+a.c_group_name+')' as c_full
						,b.c_code ,b.c_name
					FROM vw_dc_expense a
						LEFT JOIN dc_acc b ON a.dc_acc_id = b.dc_acc_id
					WHERE a.i_enable = ? AND a.i_delete = ?
					ORDER BY a.c_name";

	$arrParam = array(
		STATUS_ENABLE,
		DELETE_FALSE
	);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id" => "0",
				"c_name" => "- เลือกทั้งหมด -"
			);
		}
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id" => "{$row["dc_expense_id"]}",
				"c_name" => $row["c_full"] . " // " . $row["c_code"] . " : " . $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST['type'] == 'dc_acc') {
	// dc_acc
	$sqlMain = "SELECT * FROM dc_acc
				WHERE
					i_last=1 AND i_delete = ? and i_enable=" . STATUS_ENABLE . "
				ORDER BY c_code";
	$arrParam = array(
		DELETE_FALSE
	);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		${$root}[] = array(
			"id" => '0',
			"c_name" => '- เลือกทั้งหมด -'
		);
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id" => $row["dc_acc_id"],
				"c_name" => $row["c_code"] . ' ' . $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST['type'] == 'dc_acc_main') {
	// dc_acc
	$sqlMain = "SELECT * FROM dc_acc
				WHERE
					i_last=2 and i_level=? AND i_delete = ? and i_enable=" . STATUS_ENABLE . "
				ORDER BY c_code";
	$arrParam = array(
		4,
		DELETE_FALSE
	);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		${$root}[] = array(
			"id" => '0',
			"c_name" => '- เลือกทั้งหมด -'
		);
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id" => $row["dc_acc_id"],
				"c_name" => $row["c_code"] . ' ' . $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST['type'] == 'dc_acc_main_lv5') {
	// dc_acc
	$sqlMain = "SELECT * FROM dc_acc
				WHERE
					i_last=2 and i_level=? AND i_delete = ? and i_enable=" . STATUS_ENABLE . "
				ORDER BY c_code";
	$arrParam = array(
		5,
		DELETE_FALSE
	);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		${$root}[] = array(
			"id" => '0',
			"c_name" => '- เลือกทั้งหมด -'
		);
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id" => $row["dc_acc_id"],
				"c_name" => $row["c_code"] . ' ' . $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "dc_expense_acc_vsn") {

	$sqlMain = "	SELECT a.*,a.c_name + ' (หมวด'+a.c_group_name+')' as c_full
						,c.c_name AS acc_name ,c.c_code AS acc_code  
					FROM vw_dc_expense_acc_vsn a
						LEFT JOIN vw_dc_expense_vsn b ON a.dc_expense_vsn_id = b.dc_expense_vsn_id
						LEFT JOIN dc_acc c ON a.dc_acc_id = c.dc_acc_id
					WHERE a.i_enable = ? AND a.i_delete = ?
					ORDER BY a.c_name";

	$arrParam = array(
		STATUS_ENABLE,
		DELETE_FALSE
	);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id" => "0",
				"c_name" => "- เลือกทั้งหมด -"
			);
		}
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id" => "{$row["dc_expense_acc_vsn_id"]}",
				"c_name" => $row["c_full"] . " // " . $row["acc_code"] . " : " . $row["acc_name"]
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "dc_user") {
	$sqlMain	= "SELECT b.dc_user_id,c.c_name FROM gl_tran_hdr a INNER JOIN dc_user b
					ON a.dc_user_create_id = b.dc_user_id INNER JOIN dc_emp c
					ON b.dc_emp_id = c.dc_emp_id
					GROUP BY b.dc_user_id,c.c_name
					ORDER BY c.c_name";
	$stmt = $db->Query($sqlMain);
	if ($stmt) {
		${$root}[] = array(
			"id"		=> "0",
			"c_name"	=> "- เลือกทั้งหมด -"
		);
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> $row["dc_user_id"],
				"c_name"	=> $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
}
echo json_encode(array(
	"debug" => true,
	$root => ${$root}
));
exit();
