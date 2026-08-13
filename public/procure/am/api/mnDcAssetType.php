<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../conf/config_am.php");

$db = new DatabaseServer();

$mode	= $_REQUEST["mode"];
$ref_id = $_REQUEST["ref_id"];
$refLv 	= $_REQUEST["refLv"];

$move_id = $_REQUEST["move_id"];
$i_move = $_REQUEST["i_move"];

$c_code 		= ($_REQUEST["c_code"] != "")? $_REQUEST["c_code"] : "";
$c_name 		= ($_REQUEST["c_name"] != "")? $_REQUEST["c_name"] : "";

$asset_type 		= ($_REQUEST["asset_type"] > 0)? $_REQUEST["asset_type"] : null;

$dc_acc_dr_id 		= ($_REQUEST["dc_acc_dr_id"] > 0)? $_REQUEST["dc_acc_dr_id"] : null;
$dc_acc_cr_id 		= ($_REQUEST["dc_acc_cr_id"] > 0)? $_REQUEST["dc_acc_cr_id"] : null;
$dc_acc_recv_id 	= ($_REQUEST["dc_acc_recv_id"] > 0)? $_REQUEST["dc_acc_recv_id"] : null;
$dc_acc_conf_recv_id 	= ($_REQUEST["dc_acc_conf_recv_id"] > 0)? $_REQUEST["dc_acc_conf_recv_id"] : null;

$f_unit_cost 		= ($_REQUEST["f_unit_cost"] != "")? str_replace(",", "", $_REQUEST["f_unit_cost"]) : null;
$dc_unit_type_id 	= ($_REQUEST["dc_unit_type_id"] > 0)? $_REQUEST["dc_unit_type_id"] : null;
$i_enable 		= ($_REQUEST["i_enable"] > 0)? $_REQUEST["i_enable"] : CONF_STATUS_ENABLE;
$i_is_last 		= ($_REQUEST["i_is_last"] > 0)? $_REQUEST["i_is_last"] : CONF_STATUS_DISABLE;

$table = "dc_asset_type";
$keyName = "dc_asset_type_id";

$user_id 	= $_SESSION["user_id"];
$user_cost_id 	= $_SESSION["dc_cost_id"];

/*
 * ==mode==
 * AddChild => OK
 * Edit => OK
 * AddBefore => OK
 * AddAfter => OK
 * Del => OK
 * Move Before => OK
 * Move After => OK
 * */

switch ($mode) {
    case "AddChild" : // เพิ่มเมนูย่อย
        $sql = "SELECT c_code_tree FROM {$table} WHERE dc_asset_type_id = ?";
        $parentFullcode  = $db->GetDataBySQL($sql, array($ref_id));
        $maxLenght = strlen($parentFullcode);

        $c_code_p = $parentFullcode;
        for ($i=1; $i <= (strlen($parentFullcode)/2); $i++)
        {
            $chk_code = substr($c_code_p, -2);

            if ($chk_code == "00")
                $c_code_p = substr($c_code_p, 0, (strlen($c_code_p)-2));
            else
                continue;
        }
        $parentRealcode = $c_code_p;
        $parentIslast = 2; // default ไม่เป็นระดับล่างสุด
        if (strlen($parentRealcode) == $maxLenght)//ตรวจสอบว่าเป็นระดับล่างสุดหรือไม่
        {
            $parentIslast = 1; // เป็นระดับล่างสุด
            $maxLenght = $maxLenght + 2;
        }
        $tempCode = sprintf('%0'.$maxLenght.'d','0');

        if ($refLv >= TREE_LEVEL_MAP_ACC)
        {
            $sql = "SELECT dc_acc_dr_id, dc_acc_cr_id, dc_acc_recv_id, dc_acc_conf_recv_id
                    FROM {$table} WHERE dc_asset_type_id = ?";
            $dataAcc  = $db->GetDataBySQL($sql, array($ref_id));

            $dc_acc_dr_id           = $dataAcc["dc_acc_dr_id"];
            $dc_acc_cr_id           = $dataAcc["dc_acc_cr_id"];
            $dc_acc_recv_id         = $dataAcc["dc_acc_recv_id"];
            $dc_acc_conf_recv_id    = $dataAcc["dc_acc_conf_recv_id"];
        }
		
        $sqlAddChild = "DECLARE @maxLenght as int;
                        DECLARE @parentRealcode as varchar(250);
                        DECLARE @tempCode as varchar(250);
                        DECLARE @parentIsLast as tinyint;
                        DECLARE @parent_id as bigint;

                        DECLARE @asset_type as tinyint;

                        DECLARE @c_code as varchar(50);
                        DECLARE @c_name as varchar(255);

                        DECLARE @dc_acc_dr_id as bigint;
                        DECLARE @dc_acc_cr_id as bigint;
                        DECLARE @dc_acc_recv_id as bigint;
                        DECLARE @dc_acc_conf_recv_id as bigint;

                        DECLARE @f_unit_cost as decimal(18,2);
                        DECLARE @dc_unit_type_id as bigint;
                        DECLARE @i_is_last as tinyint;
                        DECLARE @i_enable as tinyint;

                        DECLARE @user_id as bigint;
                        DECLARE @user_cost_id as bigint;
                        DECLARE @i_delete as tinyint;

                        SET @c_code = ?;
                        SET @c_name = ?;

                        SET @dc_acc_dr_id = ?;
                        SET @dc_acc_cr_id = ?;
                        SET @dc_acc_recv_id = ?;
                        SET @dc_acc_conf_recv_id = ?;

                        SET @f_unit_cost = ?;
                        SET @dc_unit_type_id = ?;
                        SET @i_is_last = ?;
                        SET @i_enable = ?;

                        SET @user_id = ?;
                        SET @user_cost_id = ?;
                        SET @i_delete = ?;

                        SET @maxLenght = ?;
                        SET @parentRealcode = ?;
                        SET @tempCode = ?;
                        SET @parentIsLast = ?;
                        SET @parent_id = ?;

                        IF @parentIsLast = 1 /*Parent Node เป็นระดับล่างสุด*/
                            BEGIN
                                UPDATE {$table} SET c_code_tree = left(c_code_tree + @tempCode, @maxLenght);
                            END

                        UPDATE {$table} SET i_is_last = 0 WHERE dc_asset_type_id = @parent_id;

                        SELECT @asset_type = asset_type from {$table} 
                        WHERE dc_asset_type_id = @parent_id;

                        INSERT INTO {$table} (c_code_tree
                                                , parent_id, order_id, i_level, asset_type
                                                , c_code, c_name
                                                , dc_acc_dr_id, dc_acc_cr_id, dc_acc_recv_id, dc_acc_conf_recv_id
                                                , f_unit_cost, dc_unit_type_id, i_is_last, i_enable
                                                , dc_user_create_id , dc_user_create_cost_id, d_create
                                                , dc_user_update_id, dc_user_update_cost_id, d_update
                                                , i_delete)

                        VALUES (LEFT(CAST(@parentRealcode as VARCHAR(250))+'01'+@tempCode, @maxLenght)
                                        , @parent_id, 1, len(@parentRealcode)/2, @asset_type
                                        , @c_code, @c_name
                                        , @dc_acc_dr_id, @dc_acc_cr_id, @dc_acc_recv_id, @dc_acc_conf_recv_id
                                        , @f_unit_cost, @dc_unit_type_id, @i_is_last, @i_enable
                                        , @user_id, @user_cost_id, GETDATE()
                                        , @user_id, @user_cost_id, GETDATE()
                                        , @i_delete);";
		
        $arrParam = array($c_code, $c_name
                        , $dc_acc_dr_id, $dc_acc_cr_id, $dc_acc_recv_id, $dc_acc_conf_recv_id
                        , $f_unit_cost, $dc_unit_type_id, $i_is_last, $i_enable
                        , $user_id, $user_cost_id, DELETE_FALSE
                        , $maxLenght, $parentRealcode, $tempCode, $parentIslast
                        , $ref_id);

        $db->BeginTran();
        $stmt = $db->QueryParam($sqlAddChild, $arrParam);
        if ($stmt)
        {
            $db->CommitTran();
            $re = array("reval"=>0, "success"=>"Success", "msg"=>"commit");
        }
        else
        {
            $db->RollBackTran();
            $re = array("reval"=>1, "success"=>"Error", "msg"=>"check statement : {$sqlAddChild} {$arrParam}");
        }
    break;
    case "AddBefore" : // เพิ่มก่อนหน้ารายการที่เลือก
        $sql = "SELECT c_code_tree, parent_id, i_is_last, asset_type FROM {$table} WHERE dc_asset_type_id = ?";
        list($parentFullcode, $parent_id, $i_is_last, $asset_type_old)  = $db->GetDataBySQL($sql, array($ref_id));
        $maxLenght = strlen($parentFullcode);

        $refCode = $parentFullcode;
        for ($i=1; $i <= (strlen($parentFullcode)/2); $i++)
        {
            $chk_code = substr($refCode, -2);

            if ($chk_code == "00")
                $refCode = substr($refCode, 0, (strlen($refCode)-2));
            else
                continue;
        }
		
        $leftLenght = strlen($refCode);
        $rightLenght = $maxLenght - $leftLenght;
        $tempCode = sprintf('%0'.$maxLenght.'d','0');

        if ($refLv > TREE_LEVEL_START)
        {
            $asset_type = $asset_type_old;
        }
        
        if ($refLv > TREE_LEVEL_MAP_ACC)
        {
            $sql = "SELECT dc_acc_dr_id, dc_acc_cr_id, dc_acc_recv_id, dc_acc_conf_recv_id
                            FROM {$table} WHERE dc_asset_type_id = ?";
            $dataAcc  = $db->GetDataBySQL($sql, array($ref_id));

            $dc_acc_dr_id           = $dataAcc["dc_acc_dr_id"];
            $dc_acc_cr_id           = $dataAcc["dc_acc_cr_id"];
            $dc_acc_recv_id         = $dataAcc["dc_acc_recv_id"];
            $dc_acc_conf_recv_id    = $dataAcc["dc_acc_conf_recv_id"];
        }
		
        $sqlAddBefore = "DECLARE @maxLenght AS INT;
                        DECLARE @leftLenght AS INT;
                        DECLARE @rightLenght AS INT;
                        DECLARE @refCode AS VARCHAR(250);
                        DECLARE @tempCode AS VARCHAR(250);
                        DECLARE @parent_id as bigint;

                        DECLARE @asset_type as tinyint;

                        DECLARE @c_code as varchar(50);
                        DECLARE @c_name as varchar(255);

                        DECLARE @dc_acc_dr_id as bigint;
                        DECLARE @dc_acc_cr_id as bigint;
                        DECLARE @dc_acc_recv_id as bigint;
                        DECLARE @dc_acc_conf_recv_id as bigint;

                        DECLARE @f_unit_cost as decimal(18,2);
                        DECLARE @dc_unit_type_id as bigint;
                        DECLARE @i_is_last as tinyint;
                        DECLARE @i_enable as tinyint;

                        DECLARE @user_id as bigint;
                        DECLARE @user_cost_id as bigint;
                        DECLARE @i_delete as tinyint;

                        SET @refCode = ?;
                        SET @maxLenght = ?;
                        SET @leftLenght = ?;
                        SET @rightLenght = ?;
                        SET @tempCode = ?;
                        SET @parent_id = ?;

                        SET @asset_type = ?;
                        SET @c_code = ?;
                        SET @c_name = ?;
						
                        SET @dc_acc_dr_id = ?;
                        SET @dc_acc_cr_id = ?;
                        SET @dc_acc_recv_id = ?;
                        SET @dc_acc_conf_recv_id = ?;

                        SET @f_unit_cost = ?;
                        SET @dc_unit_type_id = ?;
                        SET @i_is_last = ?;
                        SET @i_enable = ?;

                        SET @user_id = ?;
                        SET @user_cost_id = ?;
                        SET @i_delete = ?;
		
                        DECLARE @parentCode AS VARCHAR(250);
                        SET @parentCode = LEFT(@refCode, (@leftLenght-2));

                        UPDATE {$table}
                        SET c_code_tree = RIGHT('00'+CAST((CAST(LEFT(c_code_tree, @leftLenght) AS NUMERIC)+1) AS VARCHAR(250)), @leftLenght)+RIGHT(c_code_tree,@rightLenght)
                                , order_id = CAST(RIGHT(LEFT(c_code_tree, @leftLenght), 2) AS NUMERIC)+1
                        WHERE c_code_tree LIKE @parentCode+'%' 
                                AND LEFT(c_code_tree, @leftLenght) >= @refCode
                                AND i_delete = @i_delete;

                        INSERT INTO {$table} (c_code_tree
                                                , parent_id, order_id, i_level, asset_type
                                                , c_code, c_name
                                                , dc_acc_dr_id, dc_acc_cr_id, dc_acc_recv_id, dc_acc_conf_recv_id
                                                , f_unit_cost, dc_unit_type_id, i_is_last, i_enable, i_delete
                                                , dc_user_create_id , dc_user_create_cost_id, d_create
                                                , dc_user_update_id, dc_user_update_cost_id, d_update)
											
                        VALUES (LEFT(RIGHT('00'+CAST((CAST(LEFT(@refCode, @leftLenght) AS NUMERIC)) AS VARCHAR(250)), @leftLenght)+@tempCode, @maxLenght)
                                    , @parent_id, CAST(RIGHT(LEFT(@refCode, @leftLenght),2) AS NUMERIC), (len(@refCode)/2)-1, @asset_type
                                    , @c_code, @c_name
                                    , @dc_acc_dr_id, @dc_acc_cr_id, @dc_acc_recv_id, @dc_acc_conf_recv_id
                                    , @f_unit_cost, @dc_unit_type_id, @i_is_last, @i_enable, @i_delete
                                    , @user_id, @user_cost_id, GETDATE()
                                    , @user_id, @user_cost_id, GETDATE());
		
                        ";
		
        $arrParam = array($refCode, $maxLenght, $leftLenght, $rightLenght, $tempCode, $parent_id
                        , $asset_type, $c_code, $c_name
                        , $dc_acc_dr_id, $dc_acc_cr_id, $dc_acc_recv_id, $dc_acc_conf_recv_id
                        , $f_unit_cost, $dc_unit_type_id, $i_is_last, $i_enable
                        , $user_id, $user_cost_id, DELETE_FALSE);

        $db->BeginTran();
        $stmt = $db->QueryParam($sqlAddBefore, $arrParam);
        if ($stmt)
        {
            $db->CommitTran();
            $re = array("reval"=>0, "success"=>"Success", "msg"=>"commit");
        }
        else
        {
            $db->RollBackTran();
            $re = array("reval"=>1, "success"=>"Error", "msg"=>"check statement : {$sqlAddChild} {$arrParam}");
        }
    break;
    case "AddAfter" : // เพิ่มต่อท้ายรายการที่เลือก
        $sql = "SELECT c_code_tree, parent_id, i_is_last, asset_type FROM {$table} WHERE dc_asset_type_id = ?";
        list($parentFullcode, $parent_id, $i_is_last, $asset_type_old)  = $db->GetDataBySQL($sql, array($ref_id));

        $maxLenght = strlen($parentFullcode);

        $refCode = $parentFullcode;
        for ($i=1; $i <= (strlen($parentFullcode)/2); $i++)
        {
            $chk_code = substr($refCode, -2);

            if ($chk_code == "00")
                $refCode = substr($refCode, 0, (strlen($refCode)-2));
            else
                continue;
        }
		
        $leftLenght = strlen($refCode);
        $rightLenght = $maxLenght - $leftLenght;
        $tempCode = sprintf('%0'.$maxLenght.'d','0');
        
        if ($refLv > TREE_LEVEL_START)
        {
            $asset_type = $asset_type_old;
        }

        if ($refLv > TREE_LEVEL_MAP_ACC)
        {
            $sql = "SELECT dc_acc_dr_id, dc_acc_cr_id, dc_acc_recv_id, dc_acc_conf_recv_id
                    FROM {$table} WHERE dc_asset_type_id = ?";
            $dataAcc  = $db->GetDataBySQL($sql, array($ref_id));

            $dc_acc_dr_id 		= $dataAcc["dc_acc_dr_id"];
            $dc_acc_cr_id 		= $dataAcc["dc_acc_cr_id"];
            $dc_acc_recv_id 		= $dataAcc["dc_acc_recv_id"];
            $dc_acc_conf_recv_id 	= $dataAcc["dc_acc_conf_recv_id"];
        }

        $sqlAddAfter = "DECLARE @maxLenght AS INT;
                        DECLARE @leftLenght AS INT;
                        DECLARE @rightLenght AS INT;
                        DECLARE @refCode AS VARCHAR(250);
                        DECLARE @tempCode AS VARCHAR(250);

                        DECLARE @parent_id as bigint;

                        DECLARE @asset_type as tinyint;

                        DECLARE @c_code as varchar(50);
                        DECLARE @c_name as varchar(255);

                        DECLARE @dc_acc_dr_id as bigint;
                        DECLARE @dc_acc_cr_id as bigint;
                        DECLARE @dc_acc_recv_id as bigint;
                        DECLARE @dc_acc_conf_recv_id as bigint;
						
                        DECLARE @f_unit_cost as decimal(18,2);
                        DECLARE @dc_unit_type_id as bigint;
                        DECLARE @i_is_last as tinyint;
                        DECLARE @i_enable as tinyint;

                        DECLARE @user_id as bigint;
                        DECLARE @user_cost_id as bigint;
                        DECLARE @i_delete as tinyint;

                        SET @refCode = ?;
                        SET @maxLenght = ?;
                        SET @leftLenght = ?;
                        SET @rightLenght = ?;
                        SET @tempCode = ?;
                        SET @parent_id = ?;

                        SET @asset_type = ?;
                        SET @c_code = ?;
                        SET @c_name = ?;
						
                        SET @dc_acc_dr_id = ?;
                        SET @dc_acc_cr_id = ?;
                        SET @dc_acc_recv_id = ?;
                        SET @dc_acc_conf_recv_id = ?;

                        SET @f_unit_cost = ?;
                        SET @dc_unit_type_id = ?;
                        SET @i_is_last = ?;
                        SET @i_enable = ?;

                        SET @user_id = ?;
                        SET @user_cost_id = ?;
                        SET @i_delete = ?;

                        DECLARE @parentCode AS VARCHAR(250);
                        SET @parentCode = LEFT(@refCode, (@leftLenght-2));
						
                        UPDATE {$table} 
                        SET c_code_tree = RIGHT('00'+CAST((CAST(LEFT(c_code_tree, @leftLenght) AS NUMERIC)+1) AS VARCHAR(250)), @leftLenght)+RIGHT(c_code_tree,@rightLenght)
                                , order_id = CAST(RIGHT(LEFT(c_code_tree, @leftLenght), 2) AS NUMERIC)+1
                        WHERE c_code_tree LIKE @parentCode+'%' 
                                AND LEFT(c_code_tree, @leftLenght) > @refCode
                                AND i_delete = @i_delete;

                        INSERT INTO {$table} (c_code_tree
                                                , parent_id, order_id, i_level, asset_type
                                                , c_code, c_name
                                                , dc_acc_dr_id, dc_acc_cr_id, dc_acc_recv_id, dc_acc_conf_recv_id
                                                , f_unit_cost, dc_unit_type_id, i_is_last, i_enable, i_delete
                                                , dc_user_create_id , dc_user_create_cost_id, d_create
                                                , dc_user_update_id, dc_user_update_cost_id, d_update)
											
                        VALUES (LEFT(RIGHT('00'+CAST((CAST(LEFT(@refCode, @leftLenght) AS NUMERIC)+1) AS VARCHAR(250)), @leftLenght)+@tempCode, @maxLenght)
                                , @parent_id, CAST(RIGHT(LEFT(@refCode, @leftLenght),2) AS NUMERIC)+1, (len(@refCode)/2)-1, @asset_type
                                , @c_code, @c_name
                                , @dc_acc_dr_id, @dc_acc_cr_id, @dc_acc_recv_id, @dc_acc_conf_recv_id
                                , @f_unit_cost, @dc_unit_type_id, @i_is_last, @i_enable, @i_delete
                                , @user_id, @user_cost_id, GETDATE()
                                , @user_id, @user_cost_id, GETDATE());
								
                    ";
		
        $arrParam = array($refCode, $maxLenght, $leftLenght, $rightLenght, $tempCode, $parent_id
                        , $asset_type, $c_code, $c_name
                        , $dc_acc_dr_id, $dc_acc_cr_id, $dc_acc_recv_id, $dc_acc_conf_recv_id
                        , $f_unit_cost, $dc_unit_type_id, $i_is_last, $i_enable
                        , $user_id, $user_cost_id, DELETE_FALSE);

        $db->BeginTran();
        $stmt = $db->QueryParam($sqlAddAfter, $arrParam);
        if ($stmt)
        {
            $db->CommitTran();
            $re = array("reval"=>0, "success"=>"Success", "msg"=>"commit");
        }
        else
        {
            $db->RollBackTran();
            $re = array("reval"=>1, "success"=>"Error", "msg"=>"check statement : {$sqlAddChild} {$arrParam}");
        }
    break;
    case "Edit" : // แก้ไขรายการที่เลือก
        if ($refLv > TREE_LEVEL_START)
        {
            $sql = "SELECT asset_type FROM {$table} WHERE dc_asset_type_id = ?";
            $asset_type = $db->GetDataBySQL($sql, array($ref_id));
        }
        
        if ($refLv > TREE_LEVEL_MAP_ACC)
        {
            $sql = "SELECT dc_acc_dr_id, dc_acc_cr_id, dc_acc_recv_id, dc_acc_conf_recv_id
                    FROM {$table} WHERE dc_asset_type_id = ?";
            $dataAcc  = $db->GetDataBySQL($sql, array($ref_id));

            $dc_acc_dr_id           = $dataAcc["dc_acc_dr_id"];
            $dc_acc_cr_id           = $dataAcc["dc_acc_cr_id"];
            $dc_acc_recv_id         = $dataAcc["dc_acc_recv_id"];
            $dc_acc_conf_recv_id    = $dataAcc["dc_acc_conf_recv_id"];
        }
		
        $sqlEdit = "UPDATE {$table} 
                    SET c_code = ?
                        , c_name = ?
                        , asset_type = ?

                        , dc_acc_dr_id = ?
                        , dc_acc_cr_id = ?
                        , dc_acc_recv_id = ?
                        , dc_acc_conf_recv_id = ?

                        , f_unit_cost = ?
                        , dc_unit_type_id = ?
                        , i_enable = ?
                        , i_is_last = ?
                        , dc_user_update_id = ?
                        , dc_user_update_cost_id = ?
                        , d_update = GETDATE() 
                    WHERE {$keyName} = ?";
        $arrParam = array($c_code, $c_name, $asset_type
                        , $dc_acc_dr_id, $dc_acc_cr_id, $dc_acc_recv_id, $dc_acc_conf_recv_id
                        , $f_unit_cost, $dc_unit_type_id, $i_enable, $i_is_last, $user_id, $user_cost_id, $ref_id);
        $db->BeginTran();
		
        $stmt = $db->QueryParam($sqlEdit, $arrParam);
        if ($stmt)
        {
            $db->CommitTran();
            $re = array("reval"=>0, "success"=>"Success", "msg"=>"commit");
        }
        else
        {
            $db->RollBackTran();
            $re = array("reval"=>1, "success"=>"Error", "msg"=>"check statement : {$sqlEdit} {$arrParam}");
        }
    break;
    case "Del" : // ลบรายการที่เลือก
        $sql = "SELECT c_code_tree FROM {$table} WHERE {$keyName} = ?";
        $parentFullcode  = $db->GetDataBySQL($sql, array($ref_id));

        $maxLenght = strlen($parentFullcode);

        $refCode = $parentFullcode;
        for ($i=1; $i <= (strlen($parentFullcode)/2); $i++)
        {
            $chk_code = substr($refCode, -2);

            if ($chk_code == "00")
                $refCode = substr($refCode, 0, (strlen($refCode)-2));
            else
                continue;
        }
		
        //$refCode = str_replace("00", "", $parentFullcode);
        $leftLenght = strlen($refCode);
        $rightLenght = $maxLenght - $leftLenght;
        $tempCode = sprintf('%0'.$maxLenght.'d','0');

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

                    UPDATE {$table}
                    SET c_code_tree = RIGHT('00'+CAST((CAST(LEFT(c_code_tree, @leftLenght) AS NUMERIC)-1) AS VARCHAR(250)), @leftLenght)+RIGHT(c_code_tree,@rightLenght)
                    , order_id = CAST(RIGHT(LEFT(c_code_tree, @leftLenght),2) AS tinyint)-1
                    WHERE LEFT(c_code_tree, (@leftLenght-2)) = @parentCode 
                    AND LEFT(c_code_tree, @leftLenght) > @refCode 
                    AND i_delete <> @i_delete;

                    UPDATE {$table} SET i_delete = @i_delete, dc_user_update_id = @user_id, dc_user_update_cost_id = @user_cost_id, d_update = GETDATE() WHERE {$keyName} = @ref_id;";
        $arrParam = array($refCode, $maxLenght, $leftLenght, $rightLenght, $tempCode, DELETE_TRUE, $user_id, $user_cost_id, $ref_id);

        $db->BeginTran();
        $stmt = $db->QueryParam($sqlDel, $arrParam);
        if ($stmt)
        {
            $db->CommitTran();
            $re = array("reval"=>0, "success"=>"Success", "msg"=>"commit");
        }
        else
        {
            $db->RollBackTran();
            $re = array("reval"=>1, "success"=>"Error", "msg"=>"check statement : {$sqlAddChild} {$arrParam}");
        }
    break;
    case "Move" : // ย้ายรายการที่เลืก
        $re = array("reval"=>0, "success"=>"Success", "msg"=>"commit");
        switch($i_move)
        {
            case "Before" : // ย้ายไปไว้ก่อนหน้ารายการที่เลือก
                $sql = "SELECT c_code_tree, parent_id, i_level FROM {$table} WHERE {$keyName} = ?";
                list($parentFullcode, $parent_id, $refLv)  = $db->GetDataBySQL($sql, array($ref_id));
                $maxLenght = strlen($parentFullcode);
                $refCode = $parentFullcode;
                for ($i=1; $i <= (strlen($parentFullcode)/2); $i++)
                {
                    $chk_code = substr($refCode, -2);

                    if ($chk_code == "00")
                        $refCode = substr($refCode, 0, (strlen($refCode)-2));
                    else
                        continue;
                }
                $leftLenght = strlen($refCode);
                $rightLenght = $maxLenght - $leftLenght;
                $tempCode = sprintf('%0'.$maxLenght.'d','0');

                $sql = "SELECT c_code_tree, parent_id FROM {$table} WHERE {$keyName} = ?";
                list($targetFullcode, $targetParentID) = $db->GetDataBySQL($sql, array($move_id));
                $targetCode = $targetFullcode;
                for ($i=1; $i <= (strlen($targetFullcode)/2); $i++)
                {
                        $chk_code = substr($targetCode, -2);

                        if ($chk_code == "00")
                                $targetCode = substr($targetCode, 0, (strlen($targetCode)-2));
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

                                DECLARE @refID AS NUMERIC;
                                DECLARE @refLv AS INT;
                                DECLARE @parentID AS NUMERIC;
                                DECLARE @targetParentID AS NUMERIC;
								
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

                                SET @refID = ?;
                                SET @refLv = ?;
                                SET @parentID = ?;
                                SET @targetParentID = ?;

                                DECLARE @parentCode AS VARCHAR(250);
                                SET @parentCode = LEFT(@refCode, (@leftLenght-2));
																
                                /*step 1 ลบรหัสด้านซ้ายตาม @refCode ของ node ที่ต้องการย้ายออก*/
                                UPDATE {$table}
                                SET c_code_tree = right(c_code_tree, @rightLenght)
                                , dc_user_update_id = @user_id
                                , dc_user_update_cost_id = @user_cost_id
                                , d_update = GETDATE()
                                WHERE LEFT(c_code_tree, @leftLenght) = @refCode
                                        AND i_delete = @i_delete;

                                /*step 2 ขยับตำแหน่ง c_code_tree ของรายการที่อยู่หลังข้อมูลต้นทางขึ้น*/
                                UPDATE {$table} 
                                SET c_code_tree = RIGHT('00'+CAST((CAST(LEFT(c_code_tree, @leftLenght) AS NUMERIC)-1) AS VARCHAR(250)), @leftLenght)+RIGHT(c_code_tree,@rightLenght)
                                        , order_id = CASE WHEN parent_id = @parentID THEN order_id - 1 ELSE order_id END
                                        , dc_user_update_id = @user_id
                                        , dc_user_update_cost_id = @user_cost_id
                                        , d_update = GETDATE()
                                WHERE c_code_tree LIKE @parentCode+'%' 
                                        AND LEFT(c_code_tree, @leftLenght) > @refCode 
                                        AND i_delete = @i_delete
                                        AND len(c_code_tree) = @maxLenght;
																
                                /*step 3 หารหัสหลัง replace 00 ออกแล้วของข้อมูลปลายทาง*/
                                DECLARE @targetParentCode AS VARCHAR(250);
                                DECLARE @targetLv AS INT;
                                SELECT @targetCode = LEFT(c_code_tree,@leftTargetLenght), @targetLv = i_level FROM {$table} WHERE {$keyName} = @targetID;
                                SET @targetParentCode = LEFT(@targetCode, (LEN(@targetCode)-2));

                                /*step 4 ขยับตำแหน่ง c_code_tree ของรายการ ตั้งแต่ข้อมุลปลายทางลง*/
                                UPDATE {$table} 
                                SET c_code_tree = RIGHT('00'+CAST((CAST(LEFT(c_code_tree, LEN(@targetCode)) AS NUMERIC)+1) AS VARCHAR(250)), LEN(@targetCode))+RIGHT(c_code_tree,(@maxLenght-LEN(@targetCode)))
                                , order_id = CASE WHEN parent_id = @targetParentID THEN order_id + 1 ELSE order_id END
                                , dc_user_update_id = @user_id
                                , dc_user_update_cost_id = @user_cost_id
                                , d_update = GETDATE()
                                WHERE c_code_tree LIKE @targetParentCode+'%' 
                                        AND LEFT(c_code_tree, LEN(@targetCode)) >= @targetCode 
                                        AND i_delete = @i_delete
                                        AND LEN(c_code_tree) = @maxLenght;
																
                                /*step 5 ปรับปรุง c_code_tree ของ node ต้นทางเป็นของปลายทาง*/
                                UPDATE {$table} 
                                SET c_code_tree = @targetCode+c_code_tree
                                , parent_id = CASE WHEN {$keyName} = @refID THEN @targetParentID ELSE parent_id END
                                , order_id = CASE WHEN {$keyName} = @refID THEN CAST(@targetCode AS NUMERIC)%100 ELSE order_id END
                                , i_level = CASE WHEN @refLv > @targetLv THEN i_level - ABS(@refLv - @targetLv) ELSE i_level + ABS(@refLv - @targetLv) END
                                WHERE LEN(c_code_tree) < @maxLenght;

                                /*step6 ปรับปรุงจำนวน c_code และ ตั้งค่า is_move = 0 ทั้งตาราง*/
                                SELECT @maxLenght= MAX(LEN(c_code_tree)) FROM {$table};

                                UPDATE {$table}
                                SET c_code_tree = LEFT(c_code_tree+@tempCode, @maxLenght);
                                ";
                $arrParam = array($refCode, $maxLenght, $leftLenght, $rightLenght, $move_id, $leftTargetLenght, $tempCode, DELETE_FALSE, $user_id, $user_cost_id, $ref_id, $refLv, $parent_id, $targetParentID);		
                $db->BeginTran();
                $stmt = $db->QueryParam($sqlAddBefore, $arrParam);
                if ($stmt)
                {
                        $db->CommitTran();
                        $re = array("reval"=>0, "success"=>"Success", "msg"=>"commit");
                }
                else
                {
                        $db->RollBackTran();
                        $re = array("reval"=>1, "success"=>"Error", "msg"=>"check statement : {$sqlAddChild} {$arrParam}");
                }
            break;
            case "After" : // ย้ายไปไว้ต่อท้ายรายการที่เลือก
                $sql = "SELECT c_code_tree, parent_id, i_level FROM {$table} WHERE {$keyName} = ?";
                list($parentFullcode, $parent_id, $refLv)  = $db->GetDataBySQL($sql, array($ref_id));
                $maxLenght = strlen($parentFullcode);
                $refCode = $parentFullcode;
                for ($i=1; $i <= (strlen($parentFullcode)/2); $i++)
                {
                        $chk_code = substr($refCode, -2);

                        if ($chk_code == "00")
                                $refCode = substr($refCode, 0, (strlen($refCode)-2));
                        else
                                continue;
                }
                $leftLenght = strlen($refCode);
                $rightLenght = $maxLenght - $leftLenght;
                $tempCode = sprintf('%0'.$maxLenght.'d','0');
				
                $sql = "SELECT c_code_tree, parent_id FROM {$table} WHERE {$keyName} = ?";
                list($targetFullcode, $targetParentID) = $db->GetDataBySQL($sql, array($move_id));
                $targetCode = $targetFullcode;
                for ($i=1; $i <= (strlen($targetFullcode)/2); $i++)
                {
                        $chk_code = substr($targetCode, -2);

                        if ($chk_code == "00")
                                $targetCode = substr($targetCode, 0, (strlen($targetCode)-2));
                        else
                                continue;
                }
                $leftTargetLenght = strlen($targetCode);
				
                $sqlAddAfter = "DECLARE @maxLenght AS INT;
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

                                DECLARE @refID AS NUMERIC;
                                DECLARE @refLv AS INT;
                                DECLARE @parentID AS NUMERIC;
                                DECLARE @targetParentID AS NUMERIC;

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

                                SET @refID = ?;
                                SET @refLv = ?;
                                SET @parentID = ?;
                                SET @targetParentID = ?;

                                DECLARE @parentCode AS VARCHAR(250);
                                SET @parentCode = LEFT(@refCode, (@leftLenght-2));

                                /*step 1 ลบรหัสด้านซ้ายตาม @refCode ของ node ที่ต้องการย้ายออก*/
                                UPDATE {$table}
                                SET c_code_tree = right(c_code_tree, @rightLenght)
                                , dc_user_update_id = @user_id
                                , dc_user_update_cost_id = @user_cost_id
                                , d_update = GETDATE()
                                WHERE LEFT(c_code_tree, @leftLenght) = @refCode
                                        AND i_delete = @i_delete;

                                /*step 2 ขยับตำแหน่ง c_code_tree ของรายการที่อยู่หลังข้อมูลต้นทางขึ้น*/
                                UPDATE {$table} 
                                SET c_code_tree = RIGHT('00'+CAST((CAST(LEFT(c_code_tree, @leftLenght) AS NUMERIC)-1) AS VARCHAR(250)), @leftLenght)+RIGHT(c_code_tree,@rightLenght)
                                        , order_id = CASE WHEN parent_id = @parentID THEN order_id - 1 ELSE order_id END
                                        , dc_user_update_id = @user_id
                                        , dc_user_update_cost_id = @user_cost_id
                                        , d_update = GETDATE()
                                WHERE c_code_tree LIKE @parentCode+'%' 
                                        AND LEFT(c_code_tree, @leftLenght) > @refCode 
                                        AND i_delete = @i_delete
                                        AND len(c_code_tree) = @maxLenght;
												
                                /*step 3 หารหัสหลัง replace 00 ออกแล้วของข้อมูลปลายทาง*/
                                DECLARE @targetParentCode AS VARCHAR(250);
                                DECLARE @targetLv AS INT;
                                SELECT @targetCode = LEFT(c_code_tree,@leftTargetLenght), @targetLv = i_level FROM {$table} WHERE {$keyName} = @targetID;
                                SET @targetParentCode = LEFT(@targetCode, (LEN(@targetCode)-2));

                                /*step 4 ขยับตำแหน่ง c_code_tree ของรายการ ตั้งแต่ข้อมุลปลายทางลง*/
                                UPDATE {$table} 
                                SET c_code_tree = RIGHT('00'+CAST((CAST(LEFT(c_code_tree, LEN(@targetCode)) AS NUMERIC)+1) AS VARCHAR(250)), LEN(@targetCode))+RIGHT(c_code_tree,(@maxLenght-LEN(@targetCode)))
                                , order_id = CASE WHEN parent_id = @targetParentID THEN order_id + 1 ELSE order_id END
                                , dc_user_update_id = @user_id
                                , dc_user_update_cost_id = @user_cost_id
                                , d_update = GETDATE()
                                WHERE c_code_tree LIKE @targetParentCode+'%' 
                                        AND LEFT(c_code_tree, LEN(@targetCode)) > @targetCode 
                                        AND i_delete = @i_delete
                                        AND len(c_code_tree) = @maxLenght;
								
                                /*step 5 ปรับปรุง c_code_tree ของ node ต้นทางเป็นของปลายทาง*/
                                UPDATE {$table} 
                                SET c_code_tree = RIGHT('00'+CAST((CAST(@targetCode AS NUMERIC)+1) AS VARCHAR(250)), LEN(@targetCode))+c_code_tree
                                        , parent_id = CASE WHEN {$keyName} = @refID THEN @targetParentID ELSE parent_id END
                                        , order_id = CASE WHEN {$keyName} = @refID THEN CAST(@targetCode AS NUMERIC)%100 ELSE order_id END
                                        , i_level = CASE WHEN @refLv > @targetLv THEN i_level - ABS(@refLv - @targetLv) ELSE i_level + ABS(@refLv - @targetLv) END
                                WHERE len(c_code_tree) < @maxLenght;

                                /*step6 ปรับปรุงจำนวน c_code และ ตั้งค่า is_move = 0 ทั้งตาราง*/
                                SELECT @maxLenght= MAX(LEN(c_code_tree)) FROM {$table};

                                UPDATE {$table}
                                SET c_code_tree = LEFT(c_code_tree+@tempCode, @maxLenght);
                                ";
                $arrParam = array($refCode, $maxLenght, $leftLenght, $rightLenght, $move_id, $leftTargetLenght, $tempCode, DELETE_FALSE, $user_id, $user_cost_id, $ref_id, $refLv, $parent_id, $targetParentID);
                $db->BeginTran();
                $stmt = $db->QueryParam($sqlAddAfter, $arrParam);
                if ($stmt)
                {
                    $db->CommitTran();
                    $re = array("reval"=>0, "success"=>"Success", "msg"=>"commit");
                }
                else
                {
                    $db->RollBackTran();
                    $re = array("reval"=>1, "success"=>"Error", "msg"=>"check statement : {$sqlAddChild} {$arrParam}");
                }
            break;
        }
    break;
}
echo json_encode($re);
exit; 

?>