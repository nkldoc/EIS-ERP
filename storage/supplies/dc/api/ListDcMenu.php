<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
$db = new DatabaseServer();

$table	= "dc_menu";
//$root	= "data";
//$data	= array();

$mode	= @$_REQUEST["mode"]; 
$ref_id = @$_REQUEST["ref_id"];

if (!get($mode))	{   $mode 	= "ListTree"; }
if (!get($ref_id))	{   $ref_id 	= 0; }

switch ($mode)
{
	case "ListTree" : // สร้าง Json สำหรับแสดง Tree เมนู
		$sql = "SELECT dc_menu_id, c_code, c_name, c_name++ CASE WHEN i_enable != 1 THEN ' <font color=red>(ไม่ใช้งาน)</font>' ELSE '' END AS c_name_show FROM {$table} WHERE i_delete = ? ORDER BY c_code";
		$stmt = $db->QueryParam($sql, array(DELETE_FALSE));
		$arr = array();
		while ($data = $db->Fetch($stmt))
		{
			$c_code = $data["c_code"];
			for ($i=1; $i <= (strlen($data["c_code"])/2); $i++)
			{
				$chk_code = substr($c_code, -2);
				
				if ($chk_code == "00")
					$c_code = substr($c_code, 0, (strlen($c_code)-2));
				else
					continue;
			}
		
			for ($i=1; $i <= (strlen($c_code)/2); $i++)
			{
				$parent_index = substr($c_code, 0, (($i-1)*2));
				if ($parent_index == "")
					$parent_index = "0";
				$index = substr($c_code, 0, (($i)*2));
				if ($i == (strlen($c_code)/2))
				{
					$arr[$parent_index][$index] = array("id"=>$data["dc_menu_id"]
							, "text"=>$data["c_name_show"]);
				}
			}
		}
		// Create Array For JSON
		$arrJson = arrForJSON($arr, 0);
		echo json_encode($arrJson);
	break;
	case "Edit" :
	case "Del" :
		$sql = "select dc_menu_id, c_filelocation, c_name, i_enable from {$table} where i_delete = ".DELETE_FALSE." and dc_menu_id = ?";
		$arrData = $db->GetDataBySQL($sql, array($ref_id));
		echo json_encode($arrData);
	break;
	case "getCode" :
		$sql = "select c_code from {$table} where i_delete = ".DELETE_FALSE." and dc_menu_id = ?";
		$stmt = $db->QueryParam($sql, array(array($ref_id)));
		$arrData = array();
		while ($data = $db->Fetch($stmt))
		{
			$c_code = $data["c_code"];
			for ($i=1; $i <= (strlen($data["c_code"])/2); $i++)
			{
			$chk_code = substr($c_code, -2);
				
			if ($chk_code == "00")
				$c_code = substr($c_code, 0, (strlen($c_code)-2));
				else
					continue;
			}
			$arrData["c_code"] = $c_code;
		}
		echo json_encode($arrData);
	break;
}
exit;

function get($a){ return isset($a) && !empty($a)?$a:null; }

function arrForJSON($arr, $index){
	$arrReturn = array();
	foreach($arr[$index] as $key => $value)
	{
		if (isset($arr) && array_key_exists($key,$arr))
		{
			$arrChilden = arrForJSON($arr, $key);
			$arrReturn[] = array("id"=>$value["id"]
					, "text"=>$value["text"]
					, "leaf"=>false
					, "children"=>$arrChilden);
		}
		else 
		{
			$arrReturn[] = array("id"=>$value["id"]
					, "text"=>$value["text"]
					, "leaf"=>true);
		}
	}
	return $arrReturn;
}
?>