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
$table		= "gl_dc_config";

$data		= array();
$addField	= null;
$addValue	= null;
$arrValue	= array();

switch ($mode) {
	
	case "ADD" :
	case "EDIT" :

		$msg		= "";
		
		if($msg != "") {
			$re = array( "msg" => $msg );
		} else {
			
			$data["dc_acc_id"]						= $_REQUEST["dc_acc_id"];
			$data["dc_cost_acc_id"]					= $_REQUEST["dc_cost_acc_id"];
			$data["c_name"]							= $_REQUEST["c_name"];
			$data["i_config"]						= $_REQUEST["i_config"];
			$data["i_method"]						= $_REQUEST["i_method"];
			$data["c_comment"]						= $_REQUEST["c_comment"];
			$data["i_enable"]						= ($_REQUEST["i_enable"] == 1)? STATUS_ENABLE : STATUS_DISABLE;
			$data["i_delete"]						= DELETE_FALSE;
			$data["dc_user_update_id"]				= $_SESSION["user_id"];
			$data["dc_user_update_cost_id"]			= $_SESSION["dc_cost_id"];
			$data["d_update"]						= date("Y-m-d H:i:s");

			if($mode == "ADD") {
				$data["dc_user_create_id"]				= $_SESSION["user_id"];
				$data["dc_user_create_cost_id"]			= $_SESSION["dc_cost_id"];
				$data["d_create"]						= date("Y-m-d H:i:s");
				
				foreach ($data as $fld => $value) {
					$arrValue[] = ($value != "")? $value : NULL;
					$addField .= ", {$fld}";
					$addValue .= ", ?";
				}
				$sql	= "	SET NOCOUNT ON
							INSERT INTO {$table} (".substr($addField, 1).") VALUES (".substr($addValue,1).");
							SELECT @@IDENTITY as gl_dc_config_id;";
				
				$para	= $db->QueryParam($sql, $arrValue);
				$ss_id	= $db->Fetch($para);
				$id		= $ss_id["gl_dc_config_id"];
					
			} else if($mode == "EDIT") {
				foreach ($data as $fld => $value) {
					$arrValue[] = ($value != "")? $value : NULL;
					$addField .= ", {$fld} = ?";
				}
				$arrValue[] = $_REQUEST["id"];
				$sql		= "UPDATE {$table} SET ".substr($addField, 1)." WHERE gl_dc_config_id = ?";
				
				$para	= $db->QueryParam($sql, $arrValue);
				$id		= $_REQUEST["id"];
			}
			
			if($para) {
				$re = array(	"success"	=> true,
								"id"		=> $id,
								"msg"		=> "success" );
			} else {
				$re = array( 	"success"	=> false,
								"msg"		=> "error" );
			}
		}
		
		echo json_encode($re);
		exit;
		break;
		
	case "DELETE" :
		
		$data["i_delete"]						= DELETE_TRUE;
		$data["dc_user_update_id"]				= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]			= $_SESSION["dc_cost_id"];
		$data["d_update"]						= date("Y-m-d H:i:s");
		
		foreach ($data as $fld => $value) {
			$arrValue[] = ($value != "")? $value : NULL;
			$addField .= ", {$fld} = ?";
		}
		
		$sql		= "UPDATE {$table} SET ".substr($addField, 1)." WHERE gl_dc_config_id = ?";
		
		$arrValue[]	= $_REQUEST["id"];
		
		$para	= $db->QueryParam($sql, $arrValue);
		
		$id	= $_REQUEST["id"];
		
		if($para) {
			$re = array(	"success"	=> true,
							"id"		=> $id,
							"msg"		=> "success" );
		} else {
			$re = array( 	"success"	=> false,
							"msg"		=> "error" );
		}
		
		echo json_encode($re);
		exit;
		break;
		
	default : break;
}
?>