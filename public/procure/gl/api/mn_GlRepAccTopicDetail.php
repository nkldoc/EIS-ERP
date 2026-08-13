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
$id			= @$_REQUEST["id"];
$table		= "gl_rep_acc_sub_dtl";
$keyName	= "gl_rep_acc_sub_dtl_id";

$data		= array();
$addField	= null;
$addValue	= null;
$arrValue	= array();

if (!$util->get($id)) { $id = 0; }

switch ($mode) {
	
	case "ADD" :
	case "EDIT" :

		$msg		= "";
		
		if($msg != "") {
			$re = array( "msg" => $msg );
		} else {

			$data["gl_rep_acc_dtl_id"]				= $_REQUEST["gl_rep_acc_dtl_id"];
			$data["c_name"]							= $_REQUEST["c_name"];
			$data["c_comment"]						= $_REQUEST["c_comment"];
			$data["i_sequence"]						= $_REQUEST["i_sequence"];
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
							SELECT @@IDENTITY as {$keyName};";
				
				$para	= $db->QueryParam($sql, $arrValue);
				$ss_id	= $db->Fetch($para);
				$id		= $ss_id[$keyName];

			} else if($mode == "EDIT") {
				foreach ($data as $fld => $value) {
					$arrValue[] = ($value != "")? $value : NULL;
					$addField .= ", {$fld} = ?";
				}
				$arrValue[] = $_REQUEST["id"];
				$sql		= "UPDATE {$table} SET ".substr($addField, 1)." WHERE {$keyName} = ?";
				
				$para	= $db->QueryParam($sql, $arrValue);
				$id		= $_REQUEST["id"];
			}
			
			// ============== //
			$addField	= null;
			$addValue	= null;
			unset ($data);
			unset ($arrValue);
			// ============== //
			
			$Arr	= json_decode(@$_REQUEST["data"], true);
			$in		= "";
			
			$db->QueryParam("DELETE gl_rep_acc_map WHERE gl_rep_acc_sub_dtl_id = ?;", array($id));
			
			if( is_array($Arr) && count($Arr) > 0 ) {
				
				foreach( $Arr as $val ) {
					
					$data["gl_rep_acc_dtl_id"]		= "0";
					$data["gl_rep_acc_sub_dtl_id"]	= $id;
					$data["dc_acc_id"]				= $val["dc_acc_id"];
					
					foreach ($data as $fld => $value) {
						$arrValue[] = ($value != "")? $value : NULL;
						$addField .= ", {$fld}";
						$addValue .= ", ?";
					}
					
					$sql	= "	INSERT INTO gl_rep_acc_map (".substr($addField, 1).") VALUES (".substr($addValue,1).");";
					
					$para	= $db->QueryParam($sql, $arrValue);
					$db->Fetch($para);
					
					// ============== //
					$addField	= null;
					$addValue	= null;
					unset ($data);
					unset ($arrValue);
					// ============== //
				}
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
		
		$id	= $_REQUEST["id"];
		
		$para_data	= $db->QueryParam("DELETE {$table} WHERE {$keyName} = ?;", array($id));
		$para_map	= $db->QueryParam("DELETE gl_rep_acc_map WHERE {$keyName} = ?;", array($id));
		
		if($para_data && $para_map) {
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