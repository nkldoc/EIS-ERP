<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db		= new DatabaseServer();
$date 	= new i_date();

$root		= "data";
$data		= array();

$mode		= $_REQUEST["mode"];
$arrParam	= array();
$addField	= null;
$addValue	= null;
$arrValue	= array();

switch ($mode) {
	case "SAVE_CREDITOR_TAX":
		$msg = "";
		if ($msg == "") {
			$data["c_name"]						  		= $_REQUEST["c_name"];
			$data["inv_name"]						  	= $_REQUEST["inv_name"];
			
			$data["c_tax_number_imp"]                 	= $_REQUEST['c_tax_number_imp'];
			$data["dc_tax_customer_id"]               	= $_REQUEST['dc_tax_customer_id'];
			$data["tax_c_title"]                      	= $_REQUEST['tax_c_title'];
			$data["tax_c_name"]                       	= $_REQUEST['tax_c_name'];
			$data["tax_c_last_name"]                  	= $_REQUEST['tax_c_last_name'];
			$data["tax_c_branch"]                     	= $_REQUEST['tax_c_branch'];
			$data["tax_c_bldg"]                       	= $_REQUEST['tax_c_bldg'];
			$data["tax_c_room_no"]                    	= $_REQUEST['tax_c_room_no'];
			$data["tax_c_floor"]                      	= $_REQUEST['tax_c_floor'];
			$data["tax_c_village"]                    	= $_REQUEST['tax_c_village'];
			$data["tax_c_house_no"]                   	= $_REQUEST['tax_c_house_no'];
			$data["tax_c_village_no"]                 	= $_REQUEST['tax_c_village_no'];
			$data["tax_c_lane"]                       	= $_REQUEST['tax_c_lane'];
			$data["tax_c_road"]                       	= $_REQUEST['tax_c_road'];
			$data["tax_c_province"]                   	= $_REQUEST['tax_c_province'];
			$data["tax_c_district"]                   	= $_REQUEST['tax_c_district'];
			$data["tax_c_tambon"]                     	= $_REQUEST['tax_c_tambon'];
			$data["tax_c_post_code"]                  	= $_REQUEST['tax_c_post_code'];
			$data["dc_tambon_id"]                     	= $_REQUEST['dc_tambon_id'];
			
			$data["c_tele_imp"]                       	= $_REQUEST['c_tele_imp'];
			$data["c_email"]                     	  	= $_REQUEST['c_email'];
			$data["i_key"]                     	  		= $_REQUEST['i_key'];
			$data["i_enable"]                     	  	= $_REQUEST['i_enable'];  
			$data["dc_user_update_id"]                	= $_SESSION["user_id"];
			$data["dc_user_update_cost_id"]           	= $_SESSION["dc_cost_id"];
			$data["d_update"]                         	= date("Y-m-d H:i:s");


			foreach ($data as $fldA => $value) {
				$arrValue[]	= ($value != "") ? $value : null;
				$addField	.= ", {$fldA} = ?";
			}

			$arrValue[] = $_REQUEST["dc_creditor_id"];
			$sql		= "UPDATE NMU.dbo.dc_creditor SET " . substr($addField, 1) . " WHERE dc_creditor_id = ?";
			$db->QueryParam($sql, $arrValue);


			// ============== //
			$addField	= null;
			$addValue	= null;
			unset($data);
			unset($arrValue);
			// ============== //


			$re	= array("success" => true, "id" => $_REQUEST["dc_creditor_id"]);
		} else {
			$re = array(
				"success"	=> false,
				"msg"		=> $msg
			);
		}
		// =========================================================== //

		break;
		case "SAVE_CREDITOR_ADD":

			$msg = "";
			if ($msg == "") {
	
			$data["c_name"]									= $_REQUEST["c_name"];
			$data["c_comment"]								= $_REQUEST["c_comment"];
			$data["dc_user_update_id"]						= $_SESSION["user_id"];
			$data["dc_user_update_cost_id"]					= $_SESSION["dc_cost_id"];
			$data["d_update"]								= date("Y-m-d H:i:s");  
			$data["i_key"]									= $_REQUEST["i_key"]; //สถานะเป็นเจ้าหนี้ที่ใช้กับใบเบิก ephis+vnet 9=ไม่เป็น,1=เป็น
			$data["c_map_vsn"]								= $_REQUEST["c_map_vsn"];
			$data["c_map_ephis"]							= $_REQUEST["c_map_ephis"];
			$data["inv_name"]								= $_REQUEST["inv_name"];

			// if ($mode == "ADD") {
			$data["i_enable"]								= STATUS_ENABLE;
			$data["i_delete"]								= DELETE_FALSE;
			$data["dc_user_create_id"]						= $_SESSION["user_id"];
			// $data["dc_user_create_cost_id"]					= $_SESSION["dc_cost_id"];
			$data["d_create"]							= date("Y-m-d H:i:s");
			$data["c_tax_number_imp"]                 = $_REQUEST['c_tax_number_imp'];
			$data["dc_tax_customer_id"]               = $_REQUEST['dc_tax_customer_id'];
			$data["tax_c_title"]                      = $_REQUEST['tax_c_title'];
			$data["tax_c_name"]                       = $_REQUEST['tax_c_name'];
			$data["tax_c_last_name"]                  = $_REQUEST['tax_c_last_name'];
			$data["tax_c_branch"]                     = $_REQUEST['tax_c_branch'];
			$data["tax_c_bldg"]                       = $_REQUEST['tax_c_bldg'];
			$data["tax_c_room_no"]                    = $_REQUEST['tax_c_room_no'];
			$data["tax_c_floor"]                      = $_REQUEST['tax_c_floor'];
			$data["tax_c_village"]                    = $_REQUEST['tax_c_village'];
			$data["tax_c_house_no"]                   = $_REQUEST['tax_c_house_no'];
			$data["tax_c_village_no"]                 = $_REQUEST['tax_c_village_no'];
			$data["tax_c_lane"]                       = $_REQUEST['tax_c_lane'];
			$data["tax_c_road"]                       = $_REQUEST['tax_c_road'];
			$data["tax_c_province"]                   = $_REQUEST['tax_c_province'];
			$data["tax_c_district"]                   = $_REQUEST['tax_c_district'];
			$data["tax_c_tambon"]                     = $_REQUEST['tax_c_tambon'];
			$data["tax_c_post_code"]                  = $_REQUEST['tax_c_post_code'];
			$data["dc_tambon_id"]                     = $_REQUEST['dc_tambon_id'];

			$data["c_tele_imp"]                       = $_REQUEST['c_tele_imp'];
			$data["c_email"]                     	  = $_REQUEST['c_email'];

			$data["dc_user_update_id"]                = $_SESSION["user_id"];
			$data["dc_user_update_cost_id"]           = $_SESSION["dc_cost_id"];
			$data["d_update"]                         = date("Y-m-d H:i:s");
				foreach ($data as $fld => $value) {
					$arrValue[] = ($value != "") ? $value : null;
					$addField .= ", {$fld}";
					$addValue .= ", ?";
				}
	
				$sql = "
					SET NOCOUNT ON
					INSERT INTO NMU.dbo.dc_creditor (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
					SELECT @@IDENTITY as id;";
	
				$para	= $db->QueryParam($sql, $arrValue);
				$ss_id	= $db->Fetch($para);
				$id		= $ss_id["id"];
	
				// ============== //
				$addField	= null;
				$addValue	= null;
				unset($data);
				unset($arrValue);
				$re	= array("success" => true, "id" => $id);
			} else {
				$re = array(
					"success"	=> false,
					"msg"		=> $msg
				);
			}
				// ============== //
				break;

}
echo json_encode($re);
exit;
