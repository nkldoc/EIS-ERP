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
$DB_NAME	= "";//'NMU_ASSET..';

$last_date 			= date('Y-m-t', strtotime($_REQUEST["c_yyyy"] . '-' . $_REQUEST['c_mm'] . '-01'));
$i_budget_year 		= 543 + $_REQUEST["i_budget_year"];
$create_id 			= @$_SESSION["user_id"];
$create_cost_id 	= @$_SESSION["dc_cost_id"];
$db->BeginTran();
switch ($mode) {
 
	case "process_am_cal_depre":

		$msg	= "";
		$data["c_yyyy_mm"]               				= $_REQUEST["c_yyyy_mm"];
		$data["i_am_cal_depre"]               			= 1;
		$data["i_enable"]								= STATUS_ENABLE;
		// $data["dc_user_update_id"]						= $_SESSION["user_id"];
		// $data["dc_user_update_cost_id"]					= $_SESSION["dc_cost_id"];
		$data["d_update"]								= date("Y-m-d H:i:s");
		// $data["dc_user_create_id"]						= $_SESSION["user_id"];
		// $data["dc_user_create_cost_id"]					= $_SESSION["dc_cost_id"];
		$data["d_create"]								= date("Y-m-d H:i:s");


		foreach ($data as $fld => $value) {
			$arrValue[] = ($value != "") ? $value : null;
			$addField .= ", {$fld}";
			$addValue .= ", ?";
		} 
		$sql	= "
				SET NOCOUNT ON

				DECLARE @last_date AS DATE;
				DECLARE @i_budget_year AS INT;
				DECLARE @i_in_year AS TINYINT;
				DECLARE @create_id AS BIGINT;
				DECLARE @create_cost_id	AS BIGINT;
    
				SET @last_date = '{$last_date}';/*วันสุดท้ายของเดือนที่คำนวณ*/
				SET @i_budget_year = '{$i_budget_year}';/*ปีงบประมาณ*/
				SET @i_in_year = 1; /*1=สินทรัพย์ที่ได้มาในปีงบประมาณ, 2=สินทรัพย์ที่ได้มาก่อนปีงบประมาณปัจจุบัน*/
				SET @create_id = {$create_id};
				SET @create_cost_id = {$create_cost_id};

				INSERT INTO {$DB_NAME} am_cal_depre (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");

				/*คำนวณค่าเสื่อมประจำเดือน*/
				EXEC {$DB_NAME} SP_AM_CAL_DEPRE @last_date, @i_budget_year, @i_in_year;
				/*ส่งข้อมูลค่าเสื่อมเตรียมบันทึกบัญชี*/
				EXEC {$DB_NAME} SP_AM_SEND_DEPRE_TO_NMU @last_date, @i_budget_year, @i_in_year, @create_id, @create_cost_id;

				SET @i_in_year = 2; /*1=สินทรัพย์ที่ได้มาในปีงบประมาณ, 2=สินทรัพย์ที่ได้มาก่อนปีงบประมาณปัจจุบัน*/
				/*คำนวณค่าเสื่อมประจำเดือน*/
				EXEC {$DB_NAME} SP_AM_CAL_DEPRE @last_date, @i_budget_year, @i_in_year;
				/*ส่งข้อมูลค่าเสื่อมเตรียมบันทึกบัญชี*/
				EXEC {$DB_NAME} SP_AM_SEND_DEPRE_TO_NMU @last_date, @i_budget_year, @i_in_year, @create_id, @create_cost_id;
				/*บันทึกบัญชีค่าเสื่อม*/
				/*EXEC {$DB_NAME} SP_AM_DEPRE_GX_NMU @last_date, @create_id, @create_cost_id;*/

			    	"; 
		$para	= $db->QueryParam($sql, $arrValue);

		/*บันทึกบัญชีค่าเสื่อม*/
		 if (@$para) {
		 	$c_yyyy_mm = $_REQUEST["c_yyyy"].$_REQUEST["c_mm"];
			$sql_gx = "SELECT am_gl_depre_hdr_id
						FROM NMU..am_gl_depre_hdr 
					WHERE c_yyyy_cal = ?
							AND c_mm_cal = ?
						ORDER BY am_gl_depre_hdr_id";
		 	$stmt_gx = $db->QueryParam($sql_gx, array($_REQUEST["c_yyyy"], $_REQUEST["c_mm"]));
		 	if ($stmt_gx) {
				while ($row = $db->Fetch($stmt_gx)) {
				$db->QueryParam("EXEC NMU..SP_GL_AD ?, ?, ?, ?", array($row["am_gl_depre_hdr_id"], $c_yyyy_mm, $create_id, $create_cost_id));
					sleep(1);
				}
		 	}
		}

		if (@$para) {
			$db->CommitTran();
			$re = array(
				"success"					=> true,
				"msg"						=> "ประมวลผลลูกหนี้ค้างรับเรียบร้อยแล้ว"
			);
		} else {
			$db->RollBackTran();
			$re = array(
				"success"					=> false,
				"msg"						=> ""
			);
		}

		break;
	case "process_am_send_donate":

		$msg	= "";
		$data["c_yyyy_mm"]               				= $_REQUEST["c_yyyy_mm"];
		$data["i_am_send_donate"]               		= 1;
		$data["i_enable"]								= STATUS_ENABLE;
		// $data["dc_user_update_id"]						= $_SESSION["user_id"];
		// $data["dc_user_update_cost_id"]					= $_SESSION["dc_cost_id"];
		$data["d_update"]								= date("Y-m-d H:i:s");

		foreach ($data as $fldA => $value) {
			$arrValue[]	= ($value != "") ? $value : null;
			$addField	.= ", {$fldA} = ?";
		}
		$arrValue[] = $_REQUEST["am_cal_depre_id"];
		$sql = "
		
			SET NOCOUNT ON

			DECLARE @last_date AS DATE;
			DECLARE @i_budget_year AS INT;
			DECLARE @i_in_year AS TINYINT;
			DECLARE @create_id AS BIGINT;
			DECLARE @create_cost_id	AS BIGINT;

			SET @last_date = '{$last_date}';/*วันสุดท้ายของเดือนที่คำนวณ*/
			SET @i_budget_year = '{$i_budget_year}';/*ปีงบประมาณ*/
			SET @i_in_year = 1; /*1=สินทรัพย์ที่ได้มาในปีงบประมาณ, 2=สินทรัพย์ที่ได้มาก่อนปีงบประมาณปัจจุบัน*/
			SET @create_id = {$create_id};
			SET @create_cost_id = {$create_cost_id};
			
			UPDATE {$DB_NAME} am_cal_depre SET " . substr($addField, 1) . " WHERE am_cal_depre_id = ?;

			/*ส่งข้อมูลบริจาคเตรียมบันทึกบัญชี*/
			EXEC {$DB_NAME} SP_AM_SEND_DONATE_TO_NMU @last_date, @i_budget_year, @create_id, @create_cost_id;
			/*บันทึกบัญชีสินทรัพย์จากการบริจาค*/
			EXEC {$DB_NAME} SP_AM_DONATE_GX_NMU @last_date, @create_id, @create_cost_id;
			
			";
		$para	= $db->QueryParam($sql, $arrValue);
		if (@$para) {
			$db->CommitTran();
			$re = array(
				"success"					=> true,
				"msg"						=> "ประมวลผลลูกหนี้ค้างรับเรียบร้อยแล้ว"
			);
		} else {
			$db->RollBackTran();
			$re = array(
				"success"					=> false,
				"msg"						=> ""
			);
		}

		break;
}
echo json_encode($re);
exit;
