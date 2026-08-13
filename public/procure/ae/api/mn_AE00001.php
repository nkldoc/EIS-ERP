<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db		= new DatabaseServer();
$date	= new i_date();
$util	= new apiUtil();


// ========================= S A V E =============================== //

$mode		= @$_REQUEST["mode"];

$data		= array();
$addField	= null;
$addValue	= null;
$arrValue	= array();

switch ($mode) {
	
	case "DC_ACC" :

		$data_dtl	= json_decode(@$_REQUEST["data"], true);
		
		$in	= "";
		foreach( $data_dtl as $val ) { $in .= ($in == "")? $val["dc_acc_id"] : ", ".$val["dc_acc_id"].""; } 

		foreach( $data_dtl as $index => $jObj ) {

			if(@$jObj["i_show_name"] != "") { $data["i_show_name"] = $jObj["i_show_name"]; }
			if(@$jObj["i_show_level"] != "") { $data["i_show_level"] = $jObj["i_show_level"]; }
			if(@$jObj["i_show_exp_type"] != "") { $data["i_show_exp_type"] = $jObj["i_show_exp_type"]; }
			if(@$jObj["i_is_fixed"] != "") { $data["i_is_fixed"] = $jObj["i_is_fixed"]; }
				
			foreach ($data as $fld => $value) {
				$arrValue[] = ($value != "")? $value : NULL;
				$addField .= ", {$fld} = ?";
			}
			$arrValue[]	= $jObj["dc_acc_id"];
			$sql	= "UPDATE dc_acc SET ".substr($addField, 1)." WHERE dc_acc_id = ?";
			
			$db->QueryParam($sql, $arrValue);
			
			// ============== //
			$addField	= null;
			$addValue	= null;
			unset ($flds);
			unset ($arrValue);
			// ============== //
		}

		$re = array("success" => true, "debug" => true);
		echo json_encode($re);
		exit;
		break;
		
	default : break;
}
?>