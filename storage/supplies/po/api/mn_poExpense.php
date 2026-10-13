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

	case "ADD":
	case "EDIT":
		$msg = "";

		$db->BeginTran();

		$data["i_level"]								= $_REQUEST["i_level"];
		$data["i_last"]									= $_REQUEST["i_last"];
		$data["c_code"]									= $_REQUEST["c_code"];
		$data["c_name"]									= $_REQUEST["c_name"];
		$data["i_enable"]								= $_REQUEST["i_enable"];
		$data["dc_user_update_id"]						= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]					= $_SESSION["dc_cost_id"];
		$data["d_update"]								= date("Y-m-d H:i:s");

		if ($mode == "ADD") {

			$data["i_delete"]								= DELETE_FALSE;
			$data["dc_user_create_id"]						= $_SESSION["user_id"];
			$data["dc_user_create_cost_id"]					= $_SESSION["dc_cost_id"];
			$data["d_create"]								= date("Y-m-d H:i:s");

			foreach ($data as $fld => $value) {
				$arrValue[] = ($value != "") ? $value : null;
				$addField .= ", {$fld}";
				$addValue .= ", ?";
			}

			$sql	= "
				SET NOCOUNT ON
				INSERT INTO po_expense (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
				SELECT @@IDENTITY as id;";

			$para	= $db->QueryParam($sql, $arrValue);
			$ss_id	= $db->Fetch($para);
			$id		= $ss_id["id"];
			$msg = "เพิ่มรายการเรียบร้อย";
		} else if ($mode == "EDIT") {

			foreach ($data as $fld => $value) {
				$arrValue[]	= ($value != "") ? $value : null;
				$addField	.= ", {$fld} = ?";
			}

			$arrValue[] = $_REQUEST["ref_id"];
			$sql		= "UPDATE po_expense SET " . substr($addField, 1) . " WHERE po_expense_id = ?";
			$para		= $db->QueryParam($sql, $arrValue);
			$msg = "แก้ไขรายการเรียบร้อย";
		}

		// ============== //
		$addField	= null;
		$addValue	= null;
		unset($data);
		unset($arrValue);
		// ============== //

		if (@$para) {
			gen_code_tree();
			$db->CommitTran();
			$re = array(
				"success"					=> true,
				"msg"						=> $msg
			);
		} else {
			$db->RollBackTran();
			$re = array(
				"success"					=> false,
				"msg"						=> $msg
			);
		}

		break;
}
echo json_encode($re);
exit;

function gen_code_tree()
{
	global $db;

	$sql = "
		SET NOCOUNT ON

		/* DECLARE ตามเวลที่ต้องการ */
		DECLARE @lv1 INT = 0;
		DECLARE @lv2 INT = 0;
		DECLARE @lv3 INT = 0;
		DECLARE @lv4 INT = 0;

		DECLARE @id INT;
		DECLARE @i_level INT;

		DECLARE vendor_cursor CURSOR FOR 
		SELECT po_expense_id, i_level
		FROM dbo.po_expense ORDER BY c_code;

		OPEN vendor_cursor;

		FETCH NEXT FROM vendor_cursor 
		INTO @id, @i_level;

		WHILE @@FETCH_STATUS = 0
			BEGIN
				IF @i_level = 1
					BEGIN
						SET @lv1 = @lv1 + 1;
						SET @lv2 = 0;
						SET @lv3 = 0;
						SET @lv4 = 0;
					END
				ELSE IF @i_level = 2
					BEGIN
						SET @lv2 = @lv2 + 1;
						SET @lv3 = 0;
						SET @lv4 = 0;
					END
				ELSE IF @i_level = 3
					BEGIN
						SET @lv3 = @lv3 + 1;
						SET @lv4 = 0;
					END
				ELSE IF @i_level = 4
					BEGIN
						SET @lv4 = @lv4 + 1;
					END
				/*===========*/
				UPDATE po_expense SET
				 	c_code_tree =	right('000000000'+cast(@lv1 as varchar(20)), 2) +
									right('000000000'+cast(@lv2 as varchar(20)), 2) +
									right('000000000'+cast(@lv3 as varchar(20)), 2) +
									right('000000000'+cast(@lv4 as varchar(20)), 3)
				WHERE po_expense_id = @id;

			FETCH NEXT FROM vendor_cursor 
			INTO @id, @i_level
		END

		CLOSE vendor_cursor;
		DEALLOCATE vendor_cursor;";
	$db->QueryParam($sql, array());

	return true;
}
