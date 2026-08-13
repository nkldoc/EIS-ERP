<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../../gl/conf/configGl.php");

$db		= new DatabaseServer();
$date	= new i_date();
$util	= new apiUtil();

// ========================= S A V E =============================== //

$mode		= @$_REQUEST["mode"];

$data		= array();
$addField	= null;
$addValue	= null;
$arrValue	= array();

$table	= "gl_dc_period";
$fld_id	= "gl_dc_period_id";
$id		= $_REQUEST["id"];

switch ($mode) {
	
	case "EDIT" :

		$msg		= "";
		
		$gl = $db->GetDataBySQL("SELECT * FROM {$table} WHERE $fld_id = ?", array($id));
		if(!$gl) { $msg	= "ไม่พบข้อมูล"; }
		
		if($msg != "") {
			$re = array( "msg" => $msg );
		} else {
			
			$data["c_mm"]						= $gl["c_mm"];
			$data["c_yyyy"]						= $gl["c_yyyy"];
			$data["i_gen"]						= 2;
			$data["i_status"]					= $_REQUEST["i_status"];
			$data["c_status"]					= ($_REQUEST["i_status"] == 1)? "เปิดงวด" : "ปิดงวด";
			$data["i_system"]					= $_REQUEST["i_system"];
			$data["i_last_period"]				= GL_LAST_PERIOD_TRUE;
			$data["dc_user_create_id"]			= $_SESSION["user_id"];
			$data["dc_user_create_cost_id"]		= $_SESSION["dc_cost_id"];
			$data["d_create"]					= date("Y-m-d H:i:s");

			// INSERT
			foreach ($data as $fld => $value) {
				$addField .= ", {$fld}";
				$addValue .= ", ?";
				$arrValue[] = $value;
			}
			$sql	= "INSERT INTO {$table} (".substr($addField, 1).") VALUES (".substr($addValue,1).");";
			$insert	= $db->QueryParam($sql, $arrValue);
			$update = $db->QueryParam("UPDATE {$table} SET i_last_period = 2 WHERE $fld_id = ?", array($id));
			
			$re = array("success"		=> true,
						"msg"			=> "success"
			);
		}
		
		echo json_encode($re);
		exit;
		break;
		
	default : break;
}
?>