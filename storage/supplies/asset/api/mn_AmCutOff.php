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

	case "ADD":
	case "EDIT":

		$msg	= "";


		$data["c_code"]               = $_REQUEST["c_code"];
		$data["c_doc"]            	  = $_REQUEST["c_doc"];
		$data["i_reason"]             = 1;
		$data["i_success"]            = 0;
		$data["d_cutoff_date"]        = $_REQUEST["d_cutoff_date"];
		$data["c_comment"]            = $_REQUEST["c_comment"];
		$data["d_update"]             = date("Y-m-d H:i:s");


		if ($mode == "ADD") {

			// $data["i_enable"]								= STATUS_ENABLE;
			$data["d_create"]								= date("Y-m-d H:i:s");

			foreach ($data as $fld => $value) {
				$arrValue[] = ($value != "") ? $value : null;
				$addField .= ", {$fld}";
				$addValue .= ", ?";
			}

			$sql	= "

			


				SET NOCOUNT ON
				INSERT INTO {$DATABASE_NAME} am_cutoff_hdr (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
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

		} else if ($mode == "EDIT") {

			foreach ($data as $fld => $value) {
				$arrValue[]	= ($value != "") ? $value : null;
				$addField	.= ", {$fld} = ?";
			}

			$arrValue[] = $_REQUEST["id"];
			$sql		= "UPDATE {$DATABASE_NAME} am_cutoff_hdr SET " . substr($addField, 1) . " WHERE am_cutoff_hdr_id = ?";
			$para		= $db->QueryParam($sql, $arrValue);
			$id			= $_REQUEST["id"];
		}

		// ============== //
		$addField	= null;
		$addValue	= null;
		unset($data);
		unset($arrValue);
		// ============== //

		if (@$para) {
			$re = array(
				"success"					=> true,
				"id"						=> $id,
				"msg"						=> ""
			);
		} else {
			$re = array(
				"success"					=> false,
				"msg"						=> $msg
			);
		}

		break;

	case "SAVE_DTL":


		$msg = "";
		$Arr = json_decode($_REQUEST["data"], true);

		// print_r($Arr);
		// exit;

		// if ($_REQUEST["i_import_excel"] == "true") {
		// 	$db->QueryParam("DELETE {$DATABASE_NAME} imp_assetall_dtl WHERE imp_assetall_hdr_id = ?", array($_REQUEST["id"]));
		// }

		if ($msg == "") {
			foreach ($Arr as $am_asset_hdr_id) {

				$data["am_cutoff_hdr_id"]                 = $_REQUEST["id"];
				$data["am_asset_hdr_id"]                  = $am_asset_hdr_id;
				$data["dc_user_create_id"]                = $_SESSION["user_id"];
				$data["dc_user_create_cost_id"]           = $_SESSION["dc_cost_id"];
				$data["d_create"]                         = date("Y-m-d H:i:s");

				foreach ($data as $fld => $value) {
					$arrValue[] = ($value != "") ? $value : null;
					// $addField .= ", {$fld}";
					// $addValue .= ",
					//  ? /*{$fld}*/";
				}

				// $sql = "INSERT INTO {$DATABASE_NAME} am_cutoff_dtl (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");";

				$sql = "INSERT INTO {$DATABASE_NAME} am_cutoff_dtl ( 
						am_cutoff_hdr_id
						,am_asset_hdr_id
						,c_code
						,asset_name
						,d_receive_date
						,i_period_year
						,f_unit_cost
						,f_depre
						,f_acc_cost
						,dc_user_create_id
						,dc_user_create_cost_id
						,d_create
					)
					SELECT 
						? as am_cutoff_hdr_id
						,? as am_asset_hdr_id
						,a.c_code --รหัสครุภัณฑ์ A
						,asset_name --ชื่อครุภัณฑ์ B
						,CONVERT(varchar(10),d_receive_date,120) as receive_date --วันที่รับ C
						,i_period_year --อายุครุภัณฑ์(ปี) W
						,CONVERT(decimal(18,2),f_unit_cost) AS f_unit_cost --มูลค่าเริ่มต้น F
						,ISNULL(d.f_depre_after, ISNULL(a.f_depre_begin,0.00)) as f_depre --ค่าเสื่อมสะสม
						,a.f_unit_cost - ISNULL(d.f_depre_after, ISNULL(a.f_depre_begin,0.00)) AS f_acc_cost --ราคาตามบัญชี
						,? as dc_user_create_id 
						,? as dc_user_create_cost_id
						,? as d_create
					FROM {$DATABASE_NAME} am_asset_hdr a
					INNER JOIN {$DATABASE_NAME} am_asset_dtl b ON a.am_asset_hdr_id = b.am_asset_hdr_id
					LEFT JOIN (
						SELECT a.am_asset_hdr_id
							, a.f_depre_after AS f_depre_after
							--INTO #temp_begin
						FROM NMU_ERP..am_tran_depre a
							INNER JOIN NMU_ERP..am_asset_hdr c ON a.am_asset_hdr_id = c.am_asset_hdr_id AND c.am_cutoff_hdr_id IS NULL
							INNER JOIN
							(SELECT 
								am_asset_hdr_id, MAX(c_yyyy_mm) AS max_ym
							FROM NMU_ERP..am_tran_depre
							GROUP BY am_asset_hdr_id) b ON a.am_asset_hdr_id = b.am_asset_hdr_id AND a.c_yyyy_mm = b.max_ym
					) d on a.am_asset_hdr_id = d.am_asset_hdr_id
					where a.am_asset_hdr_id = ?";
				$arrValue[] = $am_asset_hdr_id;
				
				$para	= $db->QueryParam($sql, $arrValue);
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
		// =========================================================== //

		break;
	case "DELETE":

		$sql		= "DELETE {$DATABASE_NAME} am_cutoff_dtl  WHERE am_asset_hdr_id = ? AND am_cutoff_hdr_id = ?";
		$arrValue[] = $_REQUEST["am_asset_hdr_id"];
		$arrValue[] = $_REQUEST["am_cutoff_hdr_id"];
		$para		= $db->QueryParam($sql, $arrValue);
		$re	= array("success" => true);
		break;
	case "CAL_CUTOFF_DEPRE":

		$sql = "UPDATE am_cutoff_hdr SET i_success = 1 WHERE am_cutoff_hdr_id = ?;
			EXEC SP_AM_CAL_CUTOFF_DEPRE ?, ?, ?";

		$arrValue[] = $_REQUEST["am_cutoff_hdr_id"];                
		$arrValue[] = $_REQUEST["am_cutoff_hdr_id"];                
		$arrValue[] = $_SESSION["user_id"];                
		$arrValue[] = $_SESSION["dc_cost_id"];    

		$para		= $db->QueryParam($sql, $arrValue);
		$re	= array("success" => true);
		break;
}
echo json_encode($re);
exit;
