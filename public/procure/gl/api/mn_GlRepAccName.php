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
$table		= "gl_rep_acc_hdr";

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

			$data["c_name"]							= $_REQUEST["c_name"];
			$data["c_comment"]						= $_REQUEST["c_comment"];
			$data["c_acc_group"] 					= $_REQUEST["chk_group1"].$_REQUEST["chk_group2"].$_REQUEST["chk_group3"].$_REQUEST["chk_group4"].$_REQUEST["chk_group5"];
			$data["c_acc_group_cal_method"] 		= $_REQUEST["cal_group1"].$_REQUEST["cal_group2"].$_REQUEST["cal_group3"].$_REQUEST["cal_group4"].$_REQUEST["cal_group5"];
			$data["i_money"]						= $_REQUEST["i_money"];
			$data["i_process"]						= $_REQUEST["i_process"];
			$data["i_level_dtl"]					= $_REQUEST["i_level_dtl"];
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
							SELECT @@IDENTITY as gl_rep_acc_hdr_id;";
				
				$para	= $db->QueryParam($sql, $arrValue);
				$ss_id	= $db->Fetch($para);
				$id		= $ss_id["gl_rep_acc_hdr_id"];

				// ============== //
				$addField	= null;
				$addValue	= null;
				unset ($data);
				unset ($arrValue);
				// ============== //

				$sql		= "EXEC SP_GEN_CODE_DC ?,?,?,?;";
				$arrValue	= array(CODE_GL_REP_BY_ACC, $_SESSION["user_id"], $_SESSION["dc_cost_id"], $id);
				
				$arr_gen_code	= $db->GetDataBySQL($sql, $arrValue);
				unset ($sql);
				unset ($arrValue);
					
				if ($id == $arr_gen_code["reference_id"]) {
				
					$sql		= "UPDATE {$table} SET c_code = ? WHERE gl_rep_acc_hdr_id = ?";
				
					$arrValue[] = $arr_gen_code["c_code_gen"];
					$arrValue[] = $id;
				
					$para	= $db->QueryParam($sql, $arrValue);
				}
					
			} else if($mode == "EDIT") {
				foreach ($data as $fld => $value) {
					$arrValue[] = ($value != "")? $value : NULL;
					$addField .= ", {$fld} = ?";
				}
				$arrValue[] = $_REQUEST["id"];
				$sql		= "UPDATE {$table} SET ".substr($addField, 1)." WHERE gl_rep_acc_hdr_id = ?";
				
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
		
		$sql		= "UPDATE {$table} SET ".substr($addField, 1)." WHERE gl_rep_acc_hdr_id = ?";
		
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