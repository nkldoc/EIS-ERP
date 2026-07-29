<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
$db = new DatabaseServer();
$user_id = $_SESSION["user_id"];

$join = ($_SESSION["i_type_user"] != 2) ? "INNER JOIN dbo.dc_user_menu b on a.dc_menu_id = b.dc_menu_id AND b.dc_user_id = {$user_id} " : "";

// ============== forced path menu ============== //
$url = $_REQUEST["url"];
// $url = "http://localhost/nmu/#ar/ImpDebtorCancel";
$explode = explode("#", $url);
$c_filelocation = (@$explode[1]) ? str_replace("/", "-", explode("#", $url)[1]) : "-";
$code_url = $db->GetDataBySQL("SELECT c_code FROM dc_menu where c_filelocation = ? AND i_enable = 1 AND i_delete = 2", array($c_filelocation));

$when = "";
for ($i = 1; $i <= (strlen($code_url) / 2); $i++) {
	$parent_index = substr($code_url, 0, ($i * 2));
	$when .= "WHEN a.c_code = '" . str_pad($parent_index, 18, "0", STR_PAD_RIGHT) . "' THEN 1 ";
}
$case = ($when != "") ? ",CASE " . $when . " ELSE 0 END AS expanded" : ",0 AS expanded";

// ============== parent menu ============== //
$codeP = $db->GetDataBySQL("SELECT a.c_code FROM dbo.dc_menu a WHERE a.dc_menu_id = ? AND i_enable = 1 AND i_delete = 2", array($_REQUEST["parent_id"]));
$codeP = str_replace("00", "", $codeP);
$con = ($codeP != "") ? " AND a.c_code like '{$codeP}%' AND a.dc_menu_id != {$_REQUEST["parent_id"]} " : "";

$sql = "
	SELECT a.c_filelocation, a.c_code, a.c_name
		{$case}
	FROM dbo.dc_menu a
		{$join}	
	WHERE a.i_delete = ? AND a.i_enable = 1
		{$con}
	ORDER BY a.c_code";
$stmt = $db->QueryParam($sql, array(DELETE_FALSE));
$arr = array();
while ($data = $db->Fetch($stmt)) {
	$c_code = $data["c_code"];
	for ($i = 1; $i <= (strlen($data["c_code"]) / 2); $i++) {
		$chk_code = substr($c_code, -2);

		if ($chk_code == "00")
			$c_code = substr($c_code, 0, (strlen($c_code) - 2));
		else
			continue;
	}

	for ($i = 1; $i <= (strlen($c_code) / 2); $i++) {
		$parent_index = substr($c_code, 0, (($i - 1) * 2));
		if ($parent_index == "")
			$parent_index = "0";

		$index = substr($c_code, 0, (($i) * 2));
		if ($i == (strlen($c_code) / 2)) {
			$arr[$parent_index][$index] = array(
				"id" => $data["c_filelocation"], "text" => $data["c_name"],
				"expanded" => ($data["expanded"] == 1) ? true : false
			);
		}
	}
}
// Create Array For JSON
$arrJson = arrForJSON($arr, $codeP);
echo json_encode($arrJson);

function arrForJSON($arr, $index)
{
	$arrReturn = array();
	if (isset($arr[$index])) {
		foreach ($arr[$index] as $key => $value) {
			if (isset($arr) && array_key_exists($key, $arr)) {
				$arrChilden = arrForJSON($arr, $key);
				$arrReturn[] = array(
					"id" => $value["id"], "text" => $value["text"], "children" => $arrChilden, "expanded" => $value["expanded"]
				);
			} else {
				$arrReturn[] = array(
					"id" => $value["id"], "text" => $value["text"], "leaf" => true, "expanded" => $value["expanded"]
				);
			}
		}
	}
	return $arrReturn;
}
