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
	
	case "ADD" :
	case "EDIT" :

		$msg		= "";
		
		if($msg != "") {
			$re = array( "msg" => $msg );
		} else {
			
			$data["c_name"]							= $_REQUEST["c_name"];
			$data["c_comment"]						= $_REQUEST["c_comment"];
			$data["i_enable"]						= ($_REQUEST["i_enable"] == 1)? STATUS_ENABLE : STATUS_DISABLE;
			$data["dc_user_update_id"]				= $_SESSION["user_id"];
			$data["dc_user_update_cost_id"]			= $_SESSION["dc_cost_id"];
			$data["d_update"]						= date("Y-m-d H:i:s");

			if($mode == "ADD") {
				$data["i_delete"]						= DELETE_FALSE;
				$data["dc_user_create_id"]				= $_SESSION["user_id"];
				$data["dc_user_create_cost_id"]			= $_SESSION["dc_cost_id"];
				$data["d_create"]						= date("Y-m-d H:i:s");
				
				foreach ($data as $fld => $value) {
					$arrValue[] = ($value != "")? $value : NULL;
					$addField .= ", {$fld}";
					$addValue .= ", ?";
				}
				$sql	= "	SET NOCOUNT ON
							INSERT INTO gl_dc_group_admin_hdr (".substr($addField, 1).") VALUES (".substr($addValue,1).");
							SELECT @@IDENTITY as gl_dc_group_admin_hdr_id;";
				
				$para	= $db->QueryParam($sql, $arrValue);
				$ss_id	= $db->Fetch($para);
				$id		= $ss_id["gl_dc_group_admin_hdr_id"];
				
				// ============== //
				$addField	= null;
				$addValue	= null;
				unset ($data);
				unset ($arrValue);
				// ============== //
				
				// GEN CODE
				$sql	= "EXEC SP_GEN_CODE_DC ?,?,?,?;";
				$arrValue	= array("SEA",$_SESSION["user_id"], $_SESSION["dc_cost_id"], $id);
				
				$arr_gen_code	= $db->GetDataBySQL($sql, $arrValue);
				unset ($sql);
				unset ($arrValue);
					
				if ($id == $arr_gen_code["reference_id"]) {
				
					$sql		= "UPDATE gl_dc_group_admin_hdr SET c_code = ? WHERE gl_dc_group_admin_hdr_id = ?";
				
					$arrValue[] = $arr_gen_code["c_code_gen"];
					$arrValue[] = $id;

					$db->QueryParam($sql, $arrValue);
				}
					
			} else if($mode == "EDIT") {
				foreach ($data as $fld => $value) {
					$arrValue[] = ($value != "")? $value : NULL;
					$addField .= ", {$fld} = ?";
				}
				$arrValue[] = $_REQUEST["id"];
				$sql		= "UPDATE gl_dc_group_admin_hdr SET ".substr($addField, 1)." WHERE gl_dc_group_admin_hdr_id = ?";
				
				$para	= $db->QueryParam($sql, $arrValue);
				$id		= $_REQUEST["id"];
			}
			
			// ============== //
			$sql		= null;
			$addField	= null;
			$addValue	= null;
			unset ($data);
			unset ($arrValue);
			// ============== //
			
			$data_dtl	= json_decode(@$_REQUEST["data"], true);
			if(is_array($data_dtl) && count($data_dtl) > 0) {
				
				$sql_dtl = "DELETE FROM gl_dc_group_admin_dtl WHERE gl_dc_group_admin_hdr_id = ?;";
				$db->QueryParam($sql_dtl, array($id));
				
				foreach($data_dtl as $index => $jObj) {
					
					$data["gl_dc_group_admin_hdr_id"]		= $id;
					$data["dc_cost_id"]						= $jObj["dc_cost_id"];
					
					foreach($data as $fld => $val) {
						$arrValue[] = ($val != "")? $val : NULL;
						$addField .= ", {$fld}";
						$addValue .= ", ?";
					}
			
					$sql		.= "INSERT INTO gl_dc_group_admin_dtl (".substr($addField, 1).") VALUES (".substr($addValue,1).");";
					$data		= null;
					$addField	= null;
					$addValue	= null;
				}
				
				$para	= $db->QueryParam($sql, $arrValue);
				
			}
			
			if($para) {
				$re = array(	"success"					=> true,
								"gl_dc_group_admin_hdr_id"	=> $id,
								"msg"						=> "success" );
			} else {
				$re = array( 	"success"					=> false,
								"msg"						=> "error" );
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
		
		$sql		= "UPDATE gl_dc_group_admin_hdr SET ".substr($addField, 1)." WHERE gl_dc_group_admin_hdr_id = ?";
		
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