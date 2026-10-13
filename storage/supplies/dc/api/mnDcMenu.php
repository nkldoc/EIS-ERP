<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
$db = new DatabaseServer();

$mode	= $_REQUEST["mode"];
$ref_id = $_REQUEST["ref_id"];
$c_name = $_REQUEST["c_name"];
$c_filelocation = $_REQUEST["c_filelocation"];
$i_enable = $_REQUEST["i_enable"];
$move_id = $_REQUEST["move_id"];
$i_move = $_REQUEST["i_move"];

$table = "dc_menu";
$keyName = "dc_menu_id";

$user_id 		= $_SESSION["user_id"];
$user_cost_id 	= $_SESSION["dc_cost_id"];

switch ($mode) {
	case "AddChild": // เพิ่มเมนูย่อย
		$sql = "SELECT c_code FROM {$table} WHERE dc_menu_id = ?";
		$parentFullcode  = $db->GetDataBySQL($sql, array($ref_id));
		$maxLenght = strlen($parentFullcode);
		//$parentRealcode = str_replace("00", "", $parentFullcode);

		$parentRealcode = $parentFullcode;
		for ($i = 1; $i <= (strlen($parentFullcode) / 2); $i++) {
			$chk_code = substr($parentRealcode, -2);

			if ($chk_code == "00")
				$parentRealcode = substr($parentRealcode, 0, (strlen($parentRealcode) - 2));
			else
				continue;
		}

		$parentIslast = 2; // default ไม่เป็นระดับล่างสุด
		if (strlen($parentRealcode) == $maxLenght) //ตรวจสอบว่าเป็นระดับล่างสุดหรือไม่
		{
			$parentIslast = 1; // เป็นระดับล่างสุด
			$maxLenght = $maxLenght + 2;
		}
		$tempCode = sprintf('%0' . $maxLenght . 'd', '0');

		$sqlAddChild = "DECLARE @maxLenght as int;
						DECLARE @parentRealcode as varchar(250);
						DECLARE @tempCode as varchar(250);
						DECLARE @parentIsLast as tinyint;
						
						DECLARE @c_filelocation as varchar(250);
						DECLARE @c_name as varchar(250);
						DECLARE @i_enable as tinyint;
						DECLARE @i_delete as tinyint;
						DECLARE @user_id as numeric;
						DECLARE @user_cost_id as numeric;
						
						SET @c_filelocation = ?;
						SET @c_name = ?;
						SET @i_enable = ?;
						SET @i_delete = ?;
						SET @user_id = ?;
						SET @user_cost_id = ?;
						
						SET @maxLenght = ?;
						SET @parentRealcode = ?;
						SET @tempCode = ?;
						SET @parentIsLast = ?;
						
						IF @parentIsLast = 1 /*Parent Node เป็นระดับล่างสุด*/
							BEGIN
								UPDATE dc_menu SET c_code = left(c_code + @tempCode, @maxLenght);
							END
						
						INSERT INTO dc_menu (c_filelocation, c_code, c_name, i_enable, i_delete, dc_user_create_id, dc_user_create_cost_id, d_create, dc_user_update_id, dc_user_update_cost_id, d_update)
						VALUES (@c_filelocation, LEFT(CAST(@parentRealcode as VARCHAR(250))+'01'+@tempCode, @maxLenght), @c_name, @i_enable, @i_delete, @user_id, @user_cost_id, GETDATE(), @user_id, @user_cost_id, GETDATE()); ";
		$arrParam = array($c_filelocation, $c_name, $i_enable, DELETE_FALSE, $user_id, $user_cost_id, $maxLenght, $parentRealcode, $tempCode, $parentIslast);

		$db->BeginTran();
		$stmt = $db->QueryParam($sqlAddChild, $arrParam);
		if ($stmt) {
			$db->CommitTran();
			$re = array("reval" => 0, "success" => "Success", "msg" => "commit");
		} else {
			$db->RollBackTran();
			$re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sqlAddChild} {$arrParam}");
		}
		break;
	case "AddBefore": // เพิ่มก่อนหน้ารายการที่เลือก
		$sql = "SELECT c_code FROM {$table} WHERE dc_menu_id = ?";
		$parentFullcode  = $db->GetDataBySQL($sql, array($ref_id));
		$maxLenght = strlen($parentFullcode);

		$refCode = $parentFullcode;
		for ($i = 1; $i <= (strlen($parentFullcode) / 2); $i++) {
			$chk_code = substr($refCode, -2);

			if ($chk_code == "00")
				$refCode = substr($refCode, 0, (strlen($refCode) - 2));
			else
				continue;
		}

		$leftLenght = strlen($refCode);
		$rightLenght = $maxLenght - $leftLenght;
		$tempCode = sprintf('%0' . $maxLenght . 'd', '0');

		$sqlAddBefore = "DECLARE @maxLenght AS INT;
						DECLARE @leftLenght AS INT;
						DECLARE @rightLenght AS INT;
						DECLARE @refCode AS VARCHAR(250);
						DECLARE @tempCode AS VARCHAR(250);
		
						DECLARE @c_filelocation AS VARCHAR(250);
						DECLARE @c_name AS VARCHAR(250);
						DECLARE @i_enable AS TINYINT;
						DECLARE @i_delete AS TINYINT;
						DECLARE @user_id AS NUMERIC;
						DECLARE @user_cost_id AS NUMERIC;
		
						SET @refCode = ?;
						SET @maxLenght = ?;
						SET @leftLenght = ?;
						SET @rightLenght = ?;
						SET @tempCode = ?;
		
						SET @c_filelocation = ?;
						SET @c_name = ?;
						SET @i_enable = ?;
						SET @i_delete = ?;
						SET @user_id = ?;
						SET @user_cost_id = ?;
		
						DECLARE @parentCode AS VARCHAR(250);
						SET @parentCode = LEFT(@refCode, (@leftLenght-2));
		
						UPDATE dc_menu
						SET c_code = RIGHT('00'+CAST((CAST(LEFT(c_code, @leftLenght) AS NUMERIC)+1) AS VARCHAR(250)), @leftLenght)+RIGHT(c_code,@rightLenght)
						WHERE c_code LIKE @parentCode+'%' 
							AND LEFT(c_code, @leftLenght) >= @refCode
							AND i_delete = @i_delete;
		
						INSERT INTO dc_menu (c_filelocation, c_code, c_name, i_enable, i_delete, dc_user_create_id, dc_user_create_cost_id, d_create, dc_user_update_id, dc_user_update_cost_id, d_update)
						VALUES (@c_filelocation, LEFT(RIGHT('00'+CAST((CAST(LEFT(@refCode, @leftLenght) AS NUMERIC)) AS VARCHAR(250)), @leftLenght)+@tempCode, @maxLenght), @c_name, @i_enable, @i_delete, @user_id, @user_cost_id, GETDATE(), @user_id, @user_cost_id, GETDATE());
						";
		$arrParam = array($refCode, $maxLenght, $leftLenght, $rightLenght, $tempCode, $c_filelocation, $c_name, $i_enable, DELETE_FALSE, $user_id, $user_cost_id);

		$db->BeginTran();
		$stmt = $db->QueryParam($sqlAddBefore, $arrParam);
		if ($stmt) {
			$db->CommitTran();
			$re = array("reval" => 0, "success" => "Success", "msg" => "commit");
		} else {
			$db->RollBackTran();
			$re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sqlAddChild} {$arrParam}");
		}
		break;
	case "AddAfter": // เพิ่มต่อท้ายรายการที่เลือก
		$sql = "SELECT c_code FROM {$table} WHERE dc_menu_id = ?";
		$parentFullcode  = $db->GetDataBySQL($sql, array($ref_id));

		$maxLenght = strlen($parentFullcode);
		$refCode = $parentFullcode;
		for ($i = 1; $i <= (strlen($parentFullcode) / 2); $i++) {
			$chk_code = substr($refCode, -2);

			if ($chk_code == "00")
				$refCode = substr($refCode, 0, (strlen($refCode) - 2));
			else
				continue;
		}
		$leftLenght = strlen($refCode);
		$rightLenght = $maxLenght - $leftLenght;
		$tempCode = sprintf('%0' . $maxLenght . 'd', '0');

		$sqlAddAfter = "DECLARE @maxLenght AS INT;
						DECLARE @leftLenght AS INT;
						DECLARE @rightLenght AS INT;
						DECLARE @refCode AS VARCHAR(250);
						DECLARE @tempCode AS VARCHAR(250);
						
						DECLARE @c_filelocation AS VARCHAR(250);
						DECLARE @c_name AS VARCHAR(250);
						DECLARE @i_enable AS TINYINT;
						DECLARE @i_delete AS TINYINT;
						DECLARE @user_id AS NUMERIC;
						DECLARE @user_cost_id AS NUMERIC;
						
						SET @refCode = ?;
						SET @maxLenght = ?;
						SET @leftLenght = ?;
						SET @rightLenght = ?;
						SET @tempCode = ?;
						
						SET @c_filelocation = ?;
						SET @c_name = ?;
						SET @i_enable = ?;
						SET @i_delete = ?;
						SET @user_id = ?;
						SET @user_cost_id = ?;
						
						DECLARE @parentCode AS VARCHAR(250);
						SET @parentCode = LEFT(@refCode, (@leftLenght-2));
						
						UPDATE dc_menu 
						SET c_code = RIGHT('00'+CAST((CAST(LEFT(c_code, @leftLenght) AS NUMERIC)+1) AS VARCHAR(250)), @leftLenght)+RIGHT(c_code,@rightLenght)
						WHERE c_code LIKE @parentCode+'%' 
							AND LEFT(c_code, @leftLenght) > @refCode
							AND i_delete = @i_delete;
				
						INSERT INTO dc_menu (c_filelocation, c_code, c_name, i_enable, i_delete, dc_user_create_id, dc_user_create_cost_id, d_create, dc_user_update_id, dc_user_update_cost_id, d_update)
						VALUES (@c_filelocation, LEFT(RIGHT('00'+CAST((CAST(LEFT(@refCode, @leftLenght) AS NUMERIC)+1) AS VARCHAR(250)), @leftLenght)+@tempCode, @maxLenght), @c_name, @i_enable, @i_delete, @user_id, @user_cost_id, GETDATE(), @user_id, @user_cost_id, GETDATE());
						";
		$arrParam = array($refCode, $maxLenght, $leftLenght, $rightLenght, $tempCode, $c_filelocation, $c_name, $i_enable, DELETE_FALSE, $user_id, $user_cost_id);

		$db->BeginTran();
		$stmt = $db->QueryParam($sqlAddAfter, $arrParam);
		if ($stmt) {
			$db->CommitTran();
			$re = array("reval" => 0, "success" => "Success", "msg" => "commit");
		} else {
			$db->RollBackTran();
			$re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sqlAddChild} {$arrParam}");
		}
		break;
	case "Edit": // แก้ไขรายการที่เลือก
		$sqlEdit = "UPDATE {$table} SET c_filelocation = ?, c_name = ?, i_enable = ?, dc_user_update_id = ?, dc_user_update_cost_id = ?, d_update = GETDATE() WHERE {$keyName} = ?";
		$arrParam = array($c_filelocation, $c_name, $i_enable, $user_id, $user_cost_id, $ref_id);
		$db->BeginTran();
		$stmt = $db->QueryParam($sqlEdit, $arrParam);
		if ($stmt) {
			$db->CommitTran();
			$re = array("reval" => 0, "success" => "Success", "msg" => "commit");
		} else {
			$db->RollBackTran();
			$re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sqlEdit} {$arrParam}");
		}
		break;
	case "Del": // ลบรายการที่เลือก
		$sql = "SELECT c_code FROM {$table} WHERE dc_menu_id = ?";
		$parentFullcode  = $db->GetDataBySQL($sql, array($ref_id));

		$maxLenght = strlen($parentFullcode);

		$refCode = $parentFullcode;
		for ($i = 1; $i <= (strlen($parentFullcode) / 2); $i++) {
			$chk_code = substr($refCode, -2);

			if ($chk_code == "00")
				$refCode = substr($refCode, 0, (strlen($refCode) - 2));
			else
				continue;
		}
		$leftLenght = strlen($refCode);
		$rightLenght = $maxLenght - $leftLenght;
		$tempCode = sprintf('%0' . $maxLenght . 'd', '0');

		$sqlDel = "DECLARE @maxLenght AS INT;
						DECLARE @leftLenght AS INT;
						DECLARE @rightLenght AS INT;
						DECLARE @refCode AS VARCHAR(250);
						DECLARE @tempCode AS VARCHAR(250);

						DECLARE @i_delete AS TINYINT;
						DECLARE @user_id AS NUMERIC;
						DECLARE @user_cost_id AS NUMERIC;
						DECLARE @ref_id AS NUMERIC;
						
						SET @refCode = ?;
						SET @maxLenght = ?;
						SET @leftLenght = ?;
						SET @rightLenght = ?;
						SET @tempCode = ?;
						
						SET @i_delete = ?;
						SET @user_id = ?;
						SET @user_cost_id = ?;
						SET @ref_id = ?;
						
						DECLARE @parentCode AS VARCHAR(250);
						SET @parentCode = LEFT(@refCode, (@leftLenght-2));
						
						UPDATE dc_menu 
						SET c_code = RIGHT('00'+CAST((CAST(LEFT(c_code, @leftLenght) AS NUMERIC)-1) AS VARCHAR(250)), @leftLenght)+RIGHT(c_code,@rightLenght)
						WHERE LEFT(c_code, (@leftLenght-2)) = @parentCode
							AND LEFT(c_code, @leftLenght) > @refCode 
							AND i_delete <> @i_delete;
				
						UPDATE dc_menu SET i_delete = @i_delete, dc_user_update_id = @user_id, dc_user_update_cost_id = @user_cost_id, d_update = GETDATE() WHERE {$keyName} = @ref_id;";
		$arrParam = array($refCode, $maxLenght, $leftLenght, $rightLenght, $tempCode, DELETE_TRUE, $user_id, $user_cost_id, $ref_id);

		$db->BeginTran();
		$stmt = $db->QueryParam($sqlDel, $arrParam);
		if ($stmt) {
			$db->CommitTran();
			$re = array("reval" => 0, "success" => "Success", "msg" => "commit");
		} else {
			$db->RollBackTran();
			$re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sqlAddChild} {$arrParam}");
		}
		break;
	case "Move": // ย้ายรายการที่เลืก
		$re = array("reval" => 0, "success" => "Success", "msg" => "commit");
		switch ($i_move) {
			case "Before": // ย้ายไปไว้ก่อนหน้ารายการที่เลือก
				$sql = "SELECT c_code FROM {$table} WHERE dc_menu_id = ?";
				$parentFullcode  = $db->GetDataBySQL($sql, array($ref_id));

				$maxLenght = strlen($parentFullcode);
				$refCode = $parentFullcode;
				for ($i = 1; $i <= (strlen($parentFullcode) / 2); $i++) {
					$chk_code = substr($refCode, -2);

					if ($chk_code == "00")
						$refCode = substr($refCode, 0, (strlen($refCode) - 2));
					else
						continue;
				}
				$leftLenght = strlen($refCode);
				$rightLenght = $maxLenght - $leftLenght;
				$tempCode = sprintf('%0' . $maxLenght . 'd', '0');

				$sql = "SELECT c_code FROM {$table} WHERE dc_menu_id = ?";
				$targetFullcode  = $db->GetDataBySQL($sql, array($move_id));
				$targetCode = $targetFullcode;
				for ($i = 1; $i <= (strlen($targetFullcode) / 2); $i++) {
					$chk_code = substr($targetCode, -2);

					if ($chk_code == "00")
						$targetCode = substr($targetCode, 0, (strlen($targetCode) - 2));
					else
						continue;
				}
				$leftTargetLenght = strlen($targetCode);

				$sqlAddBefore = "DECLARE @maxLenght AS INT;
								DECLARE @leftLenght AS INT;
								DECLARE @rightLenght AS INT;
								DECLARE @refCode AS VARCHAR(250);
								DECLARE @tempCode AS VARCHAR(250);
								
								DECLARE @targetID AS NUMERIC;
								DECLARE @leftTargetLenght AS INT;
								DECLARE @targetCode AS VARCHAR(250)
								
								DECLARE @i_delete AS TINYINT;
								DECLARE @user_id AS NUMERIC;
								DECLARE @user_cost_id AS NUMERIC;
								
								/*ข้อมูลต้นทาง*/
								SET @refCode = ?; /*รหัส เป็นค่าหลังจาก replce 00 ออกแล้ว*/
								SET @maxLenght = ?; /*จำนวนหลักมากที่สุด*/
								SET @leftLenght = ?; 
								SET @rightLenght = ?;
								
								/*-- ข้อมูลปลายทาง*/
								SET @targetID = ?; 
								SET @leftTargetLenght = ?; /*ความยาวของ code เป็นค่าหลังจาก replce 00 ออกแล้ว*/
								SET @tempCode = ?; /*ข้อมูลจำลอง*/
								
								SET @i_delete = ?;
								SET @user_id = ?;
								SET @user_cost_id = ?;
								
								DECLARE @parentCode AS VARCHAR(250);
								SET @parentCode = LEFT(@refCode, (@leftLenght-2));
								
								/*step 1 ปรับสถานะ is_move = 1 ให้กับ node ที่ต้องการย้าย*/
								UPDATE dc_menu
								SET is_move = 1
								, dc_user_update_id = @user_id
								, dc_user_update_cost_id = @user_cost_id
								, d_update = GETDATE()
								WHERE LEFT(c_code, @leftLenght) = @refCode
									AND i_delete = @i_delete;
								
								/*step 2 ขยับตำแหน่ง c_code ของรายการที่อยู่หลังข้อมูลต้นทางขึ้น*/
								UPDATE dc_menu 
								SET c_code = RIGHT('00'+CAST((CAST(LEFT(c_code, @leftLenght) AS NUMERIC)-1) AS VARCHAR(250)), @leftLenght)+RIGHT(c_code,@rightLenght)
									, dc_user_update_id = @user_id
									, dc_user_update_cost_id = @user_cost_id
									, d_update = GETDATE()
								WHERE c_code LIKE @parentCode+'%' 
									AND LEFT(c_code, @leftLenght) > @refCode 
									AND i_delete = @i_delete
									AND ISNULL(is_move,0) <> 1;
								
								/*step 3 หารหัสหลัง replace 00 ออกแล้วของข้อมูลปลายทาง*/
								SELECT @targetCode = LEFT(c_code,@leftTargetLenght) FROM dc_menu WHERE dc_menu_id = @targetID;
								DECLARE @targetParentCode AS VARCHAR(250);
								SET @targetParentCode = LEFT(@targetCode, (LEN(@targetCode)-2));
								
								/*step 4 ขยับตำแหน่ง c_code ของรายการ ตั้งแต่ข้อมุลปลายทางลง*/
								UPDATE dc_menu 
								SET c_code = RIGHT('00'+CAST((CAST(LEFT(c_code, LEN(@targetCode)) AS NUMERIC)+1) AS VARCHAR(250)), LEN(@targetCode))+RIGHT(c_code,(@maxLenght-LEN(@targetCode)))
								, dc_user_update_id = @user_id
								, dc_user_update_cost_id = @user_cost_id
								, d_update = GETDATE()
								WHERE c_code LIKE @targetParentCode+'%' 
									AND LEFT(c_code, LEN(@targetCode)) >= @targetCode 
									AND i_delete = @i_delete
									AND ISNULL(is_move,0) <> 1;
								
								/*step 5 ปรับปรุง c_code ของ node ต้นทางเป็นของปลายทาง*/
								UPDATE dc_menu 
								SET c_code = @targetCode+RIGHT(c_code, len(c_code)-len(@refCode))
								WHERE ISNULL(is_move,0) = 1;
								
								/*step6 ปรับปรุงจำนวน c_code และ ตั้งค่า is_move = 0 ทั้งตาราง*/
								select @maxLenght= max(len(c_code)) from dc_menu;
								
								UPDATE dc_menu
								SET c_code = LEFT(c_code+@tempCode, @maxLenght)
								, is_move = 0;
							";
				$arrParam = array($refCode, $maxLenght, $leftLenght, $rightLenght, $move_id, $leftTargetLenght, $tempCode, DELETE_FALSE, $user_id, $user_cost_id);
				$db->BeginTran();
				$stmt = $db->QueryParam($sqlAddBefore, $arrParam);
				if ($stmt) {
					$db->CommitTran();
					$re = array("reval" => 0, "success" => "Success", "msg" => "commit");
				} else {
					$db->RollBackTran();
					$re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sqlAddChild} {$arrParam}");
				}
				break;
			case "After": // ย้ายไปไว้ต่อท้ายรายการที่เลือก
				$sql = "SELECT c_code FROM {$table} WHERE dc_menu_id = ?";
				$parentFullcode  = $db->GetDataBySQL($sql, array($ref_id));

				$maxLenght = strlen($parentFullcode);
				$refCode = $parentFullcode;
				for ($i = 1; $i <= (strlen($parentFullcode) / 2); $i++) {
					$chk_code = substr($refCode, -2);

					if ($chk_code == "00")
						$refCode = substr($refCode, 0, (strlen($refCode) - 2));
					else
						continue;
				}
				$leftLenght = strlen($refCode);
				$rightLenght = $maxLenght - $leftLenght;
				$tempCode = sprintf('%0' . $maxLenght . 'd', '0');

				$sql = "SELECT c_code FROM {$table} WHERE dc_menu_id = ?";
				$targetFullcode  = $db->GetDataBySQL($sql, array($move_id));
				$targetCode = $targetFullcode;
				for ($i = 1; $i <= (strlen($targetFullcode) / 2); $i++) {
					$chk_code = substr($targetCode, -2);

					if ($chk_code == "00")
						$targetCode = substr($targetCode, 0, (strlen($targetCode) - 2));
					else
						continue;
				}
				$leftTargetLenght = strlen($targetCode);

				$sqlAddBefore = "DECLARE @maxLenght AS INT;
								DECLARE @leftLenght AS INT;
								DECLARE @rightLenght AS INT;
								DECLARE @refCode AS VARCHAR(250);
								DECLARE @tempCode AS VARCHAR(250);
				
								DECLARE @targetID AS NUMERIC;
								DECLARE @leftTargetLenght AS INT;
								DECLARE @targetCode AS VARCHAR(250)
				
								DECLARE @i_delete AS TINYINT;
								DECLARE @user_id AS NUMERIC;
								DECLARE @user_cost_id AS NUMERIC;
				
								/*ข้อมูลต้นทาง*/
								SET @refCode = ?; /*รหัส เป็นค่าหลังจาก replce 00 ออกแล้ว*/
								SET @maxLenght = ?; /*จำนวนหลักมากที่สุด*/
								SET @leftLenght = ?;
								SET @rightLenght = ?;
				
								/*-- ข้อมูลปลายทาง*/
								SET @targetID = ?; 
								SET @leftTargetLenght = ?; /*ความยาวของ code เป็นค่าหลังจาก replce 00 ออกแล้ว*/
								SET @tempCode = ?; /*ข้อมูลจำลอง*/
				
								SET @i_delete = ?;
								SET @user_id = ?;
								SET @user_cost_id = ?;
				
								DECLARE @parentCode AS VARCHAR(250);
								SET @parentCode = LEFT(@refCode, (@leftLenght-2));
				
								/*step 1 ปรับสถานะ is_move = 1 ให้กับ node ที่ต้องการย้าย*/
								UPDATE dc_menu
								SET is_move = 1
								, dc_user_update_id = @user_id
								, dc_user_update_cost_id = @user_cost_id
								, d_update = GETDATE()
								WHERE LEFT(c_code, @leftLenght) = @refCode
									AND i_delete = @i_delete;
				
								/*step 2 ขยับตำแหน่ง c_code ของรายการที่อยู่หลังข้อมูลต้นทางขึ้น*/
								UPDATE dc_menu
								SET c_code = RIGHT('00'+CAST((CAST(LEFT(c_code, @leftLenght) AS NUMERIC)-1) AS VARCHAR(250)), @leftLenght)+RIGHT(c_code,@rightLenght)
									, dc_user_update_id = @user_id
									, dc_user_update_cost_id = @user_cost_id
									, d_update = GETDATE()
								WHERE c_code LIKE @parentCode+'%'
									AND LEFT(c_code, @leftLenght) > @refCode
									AND i_delete = @i_delete
									AND ISNULL(is_move,0) <> 1;
				
								/*step 3 หารหัสหลัง replace 00 ออกแล้วของข้อมูลปลายทาง*/
								SELECT @targetCode = LEFT(c_code,@leftTargetLenght) FROM dc_menu WHERE dc_menu_id = @targetID;
								DECLARE @targetParentCode AS VARCHAR(250);
								SET @targetParentCode = LEFT(@targetCode, (LEN(@targetCode)-2));
				
								/*step 4 ขยับตำแหน่ง c_code ของรายการหลังข้อมุลปลายทางลง*/
								UPDATE dc_menu 
								SET c_code = RIGHT('00'+CAST((CAST(LEFT(c_code, LEN(@targetCode)) AS NUMERIC)+1) AS VARCHAR(250)), LEN(@targetCode))+RIGHT(c_code,(@maxLenght-LEN(@targetCode)))
								, dc_user_update_id = @user_id
								, dc_user_update_cost_id = @user_cost_id
								, d_update = GETDATE()
								WHERE c_code LIKE @targetParentCode+'%' 
									AND LEFT(c_code, LEN(@targetCode)) > @targetCode 
									AND i_delete = @i_delete
									AND ISNULL(is_move,0) <> 1;
								
								/*step 5 ปรับปรุง c_code ของ node ต้นทางเป็นของปลายทาง*/
								UPDATE dc_menu 
								SET c_code = RIGHT('00'+CAST((CAST(@targetCode AS NUMERIC)+1) AS VARCHAR(250)), LEN(@targetCode))+RIGHT(c_code, len(c_code)-len(@refCode))
								WHERE ISNULL(is_move,0) = 1;
				
								/*step6 ปรับปรุงจำนวน c_code และ ตั้งค่า is_move = 0 ทั้งตาราง*/
								select @maxLenght= max(len(c_code)) from dc_menu;
				
								UPDATE dc_menu
								SET c_code = LEFT(c_code+@tempCode, @maxLenght)
								, is_move = 0;
							";
				$arrParam = array($refCode, $maxLenght, $leftLenght, $rightLenght, $move_id, $leftTargetLenght, $tempCode, DELETE_FALSE, $user_id, $user_cost_id);

				$db->BeginTran();
				$stmt = $db->QueryParam($sqlAddBefore, $arrParam);
				if ($stmt) {
					$db->CommitTran();
					$re = array("reval" => 0, "success" => "Success", "msg" => "commit");
				} else {
					$db->RollBackTran();
					$re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sqlAddChild} {$arrParam}");
				}
				break;
		}
		break;
}
// บังคับ 18 ถ้าเกิน 18 ตำแหน่ง จะมีผลกับการกำหนดสิทธิ์เมนู
$db->QueryParam("UPDATE dc_menu SET c_code = LEFT(c_code,18)", array());

echo json_encode($re);
exit;
