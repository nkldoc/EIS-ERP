<?php

include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$gl	= $db->GetDataBySQL("SELECT * FROM gl_config_dc_acc", array());

if($gl) {
	
	$data		= array();
	$arr		= array();
	$Condition	= null;
	
	$mode	= @$_REQUEST["mode"];
	$ref_id = @$_REQUEST["ref_id"];
	
	$mode	= ($mode == "")? "ListTree" : $mode;
	$ref_id	= ($ref_id == "")? 0 : $ref_id;
	
	switch ($mode) {
		case "dc_cost" :
			$root		= "data";
			$sqlMain	= "SELECT * FROM dc_cost WHERE i_last=1 ORDER BY c_code;";
			$arrParam	= array();
			$stmt = $db->QueryParam($sqlMain, $arrParam);
			while($row =$db->Fetch($stmt)){
				$temp = array(	"id"		=> $row["dc_cost_id"],
								"c_name"	=> $row["c_name"]);
				${$root}[] = $temp;
			}
			echo json_encode(array($root=>${$root}));
			break;
			
		case "add" :
		case "update" :
			if($mode == "update") { $Condition = "AND dc_acc_id != ".$ref_id; }
			
			$c_code = $db->GetDataBySQL("SELECT * FROM dc_acc WHERE c_code LIKE ? {$Condition}",array($_REQUEST["c_code"]));
			if($c_code) {
				$re = array("success"=> false, "msg"=>"เป็นค่าซ้ำ");
			} else {
				$re = array("success"=> true, "msg"=>"commit");
			}
			echo json_encode($re);
			break;

		case "ListTree" : // สร้าง Json สำหรับแสดง ผังบัญชี
		case "Move" :
			
			$i_level			= $gl["i_level_all"];
			
			for ($i=1;$i<=$i_level;$i++) { $lv[] = $gl["i_level".$i]; }
			
			$code_tree	= $db->GetDataBySQL("SELECT * FROM dc_acc WHERE dc_acc_id = ?", array($ref_id));
			if(is_array($code_tree)) {
				$ss	= 0;
				for ($i=1; $i < $code_tree["i_level"]; $i++) { $ss += $lv[($i-1)]; }
				$parentCode	= substr($code_tree["c_code_tree"], 0, $ss);
				$Condition	= " AND c_code_tree LIKE '{$parentCode}%'
								AND i_level = {$code_tree["i_level"]}
								AND c_code_tree NOT LIKE '{$code_tree["c_code_tree"]}'";
			}
			
			$ss		= 0;
			$sql	= "SELECT TOP 1 * FROM dc_acc WHERE i_delete = ? {$Condition} ORDER BY c_code_tree;";
			$ff		= $db->GetDataBySQL($sql, array(DELETE_FALSE));
			for ($i=1; $i < $ff["i_level"]; $i++) { $ss += $lv[($i-1)]; }
			$ff_sub	= substr($ff["c_code_tree"], 0, $ss);
			if($ff_sub == "") { $ff_sub = "0"; }
	
			$sql	= "SELECT * FROM dc_acc WHERE i_delete = ? {$Condition} ORDER BY c_code_tree;";
			$stmt	= $db->QueryParam($sql, array(DELETE_FALSE));
			while ($data = $db->Fetch($stmt)) {
				// หา lv
				$parent_length		= 0;
				$length				= 0;
				
				for ($i=1; $i < $data["i_level"]; $i++)	{ $parent_length += $lv[($i-1)]; }	// parent_index 
				for ($i=1; $i <= $data["i_level"]; $i++){ $length += $lv[($i-1)]; }			// index
				
				$parent_index	= substr($data["c_code_tree"], 0, $parent_length);
				$index			= substr($data["c_code_tree"], 0, $length);
				
				if ($parent_index == "") { $parent_index = "0"; }

				$text	= $data["c_code"]." ".$data["c_name"];
				$arr[$parent_index][$index]	= array(
					"id"			=> $data["dc_acc_id"],
					"text"			=> ($data["i_enable"] == 1)? $text : $text." <span style='color:red;'>(ไม่ใช้งาน)</span>",
					"text_show"		=> $text,
					"i_level"		=> $data["i_level"],
					"i_enable"		=> $data["i_enable"]
				);
			}
			
			// Create Array For JSON
			$arrJson = arrForJSON($arr, $ff_sub);
			echo json_encode($arrJson);
		break;
		
		case "Edit" :
		case "Del" :
			$sql = "SELECT dc_acc_id, c_code, c_name, dc_cost_acc_id_fixed, i_debit, i_enable FROM dc_acc WHERE dc_acc_id = ?";
			$arrData = $db->GetDataBySQL($sql, array($ref_id));
			echo json_encode($arrData);
		break;
	}
}

function arrForJSON($arr, $index) {
	$arrReturn = array();
	foreach($arr[$index] as $key => $value) {
		if (isset($arr) && array_key_exists($key,$arr)) {
			$arrChilden = arrForJSON($arr, $key);
			$arrReturn[] = array(
					"id"		=> $value["id"],
					"lv"		=> $value["i_level"],
					"text"		=> $value["text"],
					"text_show"	=> $value["text_show"],
					"i_enable"	=> $value["i_enable"],
					"children"	=> $arrChilden);
		} else {
			$arrReturn[] = array(
					"id"		=> $value["id"],
					"lv"		=> $value["i_level"],
					"text"		=> $value["text"],
					"text_show"	=> $value["text_show"],
					"i_enable"	=> $value["i_enable"],
					"leaf"		=> true);
		}
	}
	return $arrReturn;
}
?>