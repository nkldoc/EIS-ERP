<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$root		= "data";
$data		= array();
$con		= null;

if ($_REQUEST["type"] == "po_expense") {

	$sqlMain = "
		SELECT
			a.bg_expense_id
			,a.c_code
			,a.c_code_tree
			,a.c_name
			,a.i_level
			,a.i_enable
		FROM dbo.bg_expense a
		ORDER BY a.c_code_tree;";

	$stmt = $db->QueryParam($sqlMain, array());
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {

			// หา lv
			$parent_length		= 0;
			$length				= 0;

			// parent_index
			for ($i = 1; $i < $row["i_level"]; $i++) {
				$parent_length += ($i == 4) ? 3 : 2;
			}
			// index
			for ($i = 1; $i <= $row["i_level"]; $i++) {
				$length += ($i == 4) ? 3 : 2;
			}

			$parent_index	= substr($row["c_code_tree"], 0, $parent_length);
			$index			= substr($row["c_code_tree"], 0, $length);

			$parent_index = (@$parent_index == "") ? "0" : $parent_index;
			$disTxt = ($row["i_enable"] == 1) ? "" : " <span style='color:red;'>(ไม่ใช้งาน)</span>";
			$data[$parent_index][$index]	= array(
				"id"				=> $row["bg_expense_id"],
				"i_level"			=> $row["i_level"],
				"i_enable"			=> $row["i_enable"],
				"text"				=> $row["c_code"] . " :" . $row["c_name"] . $disTxt,
				"c_code"			=> $row["c_code"],
				"c_name"			=> $row["c_name"],
			);
		}
	}

	if (@$ff_sub == "") {
		$ff_sub = "0";
	}

	$arrJson = arrForJSON($data, $ff_sub);
	echo json_encode($arrJson);
	exit;
}

function arrForJSON($arr, $index)
{
	$arrReturn = array();
	foreach ($arr[$index] as $key => $value) {
		if (isset($arr) && array_key_exists($key, $arr)) {
			$arrChilden = arrForJSON($arr, $key);
			$arrReturn[] = array(
				"id"		=> $value["id"],
				"lv"		=> $value["i_level"],
				"i_enable"	=> $value["i_enable"],
				"text"		=> $value["text"],
				"c_code1"	=> substr($value["c_code"], 0, 2),
				"c_code2"	=> substr($value["c_code"], 2, 2),
				"c_code3"	=> substr($value["c_code"], 4, 2),
				"c_code4"	=> substr($value["c_code"], 6, 3),
				"c_name"	=> $value["c_name"],
				"children"	=> $arrChilden
			);
		} else {
			$arrReturn[] = array(
				"id"		=> $value["id"],
				"lv"		=> $value["i_level"],
				"i_enable"	=> $value["i_enable"],
				"text"		=> $value["text"],
				"c_code1"	=> substr($value["c_code"], 0, 2),
				"c_code2"	=> substr($value["c_code"], 2, 2),
				"c_code3"	=> substr($value["c_code"], 4, 2),
				"c_code4"	=> substr($value["c_code"], 6, 3),
				"c_name"	=> $value["c_name"],
				"leaf"		=> true
			);
		}
	}
	return $arrReturn;
}
