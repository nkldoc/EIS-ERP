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

$DATABASE_NAME = ""; //"NMU_ASSET..";
switch ($mode) {
	case "SAVE_DTL":
			
		$msg = "";
		$Arr = json_decode($_REQUEST["data"], true);

		/************** DELETE **************/
		$id_dalete = "";
		$count_loop = 0;
		$Arr_delete_id = json_decode($_REQUEST["data"], true);
		foreach ($Arr_delete_id as $fldd_delete) {
			if ($fldd_delete["am_asset_item_id"] > 0) {
				$id_dalete .= "," . $fldd_delete["am_asset_item_id"];
				$count_loop++;
			}
		}
		$in_not = $count_loop > 0 ? " AND am_asset_item_id NOT IN (" . substr($id_dalete, 1) . ")" : "";
		$sql = "DELETE am_asset_item WHERE am_asset_hdr_id = {$_REQUEST["id"]}" . $in_not;
		$stmt = $db->QueryParam($sql, array());
		/*************************************/



		if ($msg == "") {
			foreach ($Arr as $fldd) {


				
				$data["c_name"]											= $fldd["c_name"];
				$data["c_comment"]										= $fldd["c_comment"];
				$data["dc_user_update_id"]								= $_SESSION["user_id"];
				$data["dc_user_update_cost_id"]							= $_SESSION["dc_cost_id"];
				$data["d_update"]										= date("Y-m-d H:i:s");

				if ($fldd["am_asset_item_id"] > 0) { // EDIT

					foreach ($data as $fldA => $value) {
						$arrValue[]	= ($value != "") ? $value : null;
						$addField	.= ", {$fldA} = ?";
					}

					$arrValue[] = $fldd["am_asset_item_id"];
					$sql		= "UPDATE am_asset_item SET " . substr($addField, 1) . " WHERE am_asset_item_id = ?";
					$db->QueryParam($sql, $arrValue);
				} else { // ADD

					$data["am_asset_hdr_id"]                  = $_REQUEST["id"];
					$data["i_enable"]                         = 1;
					$data["dc_user_create_id"]                = $_SESSION["user_id"];
					$data["dc_user_create_cost_id"]           = $_SESSION["dc_cost_id"];
					$data["d_create"]                         = date("Y-m-d H:i:s");

					foreach ($data as $fld => $value) {
						$arrValue[] = ($value != "") ? $value : null;
						$addField .= ", {$fld}";
						$addValue .= ", ?";
					}

					$sql = "
						SET NOCOUNT ON
						INSERT INTO am_asset_item (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
						SELECT @@IDENTITY as id;";

					$para	= $db->QueryParam($sql, $arrValue);
					$ss_id	= $db->Fetch($para);
					$id		= $ss_id["id"];

					// ============== //
					$addField	= null;
					$addValue	= null;
					unset($data);
					unset($arrValue);
					// ============== //
				}

				// ============== //
				$addField	= null;
				$addValue	= null;
				unset($data);
				unset($arrValue);
				// ============== //
			}

			$re	= array("success" => true, "id" => $_REQUEST["id"]);
		} else {
			$re = array(
				"success"	=> false,
				"msg"		=> $msg
			);
		}
		break;
	case "DELETE":

		$sql		= "DELETE {$DATABASE_NAME} am_asset_edit_dtl  WHERE am_asset_edit_dtl_id = ?";
		$arrValue[] = $_REQUEST["id"];
		$para		= $db->QueryParam($sql, $arrValue);
		$id			= $_REQUEST["id"];
		$re	= array("success" => true);
		break;
}
echo json_encode($re);
exit;
