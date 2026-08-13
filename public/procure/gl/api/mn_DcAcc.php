<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");

$db = new DatabaseServer();

$mode					= @$_REQUEST["mode"];
$ref_id					= @$_REQUEST["ref_id"];
$move_id				= @$_REQUEST["move_id"];
$i_move					= @$_REQUEST["i_move"];
$c_code					= @$_REQUEST["c_code"];
$dc_cost_acc_id_fixed	= @$_REQUEST["dc_cost_acc_id_fixed"];
$c_name					= @$_REQUEST["c_name"];
$i_debit				= @$_REQUEST["i_debit"];
$i_enable				= @$_REQUEST["i_enable"];

$table		= "dc_acc";
$keyName	= "dc_acc_id";
$data		= array();
$msg		= null;
$addField	= null;
$addValue	= null;
$arrValue	= array();

$gl	= $db->GetDataBySQL("SELECT * FROM gl_config_dc_acc", array());

$i_level	= $gl["i_level_all"];

for ($i=1;$i<=$i_level;$i++) { $lv[] = $gl["i_level".$i]; }

switch ($mode) {
	
	case "AddChild" : // เพิ่มเมนูย่อย
		
		$sql	= "SELECT * FROM {$table} WHERE {$keyName} = ?";
		$ss		= $db->GetDataBySQL($sql, array($ref_id));
		
		if( $ss["i_level"] < $i_level ) {
			
			$c_code_tree	= "";
			$pt				= 0;
			$length			= 0;

			for ($i=1; $i <= $ss["i_level"]; $i++)	{ $length += $lv[($i-1)]; }			// index
			$refCode	= substr($ss["c_code_tree"], 0, $length);
			$dc			= $db->GetDataBySQL("SELECT TOP 1 * FROM dc_acc
											WHERE i_group = ? AND i_level = ? AND c_code_tree LIKE '".$refCode."%'
											ORDER BY c_code_tree DESC", array($ss["i_group"], $ss["i_level"]+1));
			
			if( $dc["c_code_tree"] != "" ) {
				$code_run	= $dc["c_code_tree"]; 
			} else {
				$code_run	= $refCode;
				$code_run	.= sprintf("%'.0".$length."d", 0);
			}
			
			for ($i=1; $i <= $i_level; $i++) {
				
				$pt	+= ($i > 1)? $lv[($i-2)] : 0;
				
				if($i == ($ss["i_level"]+1)) {
					$c_code_tree	.= sprintf("%'.0".$lv[($i-1)]."d", (substr($code_run,$pt,$lv[($i-1)])+1)); 
				} else {
					$c_code_tree	.= substr($code_run,$pt,$lv[($i-1)]);
				}
			}
	
			// FLD
			$data["c_code"]					= $c_code;
			$data["c_code_tree"]			= $c_code_tree;
			$data["c_name"]					= $c_name;
			$data["dc_cost_acc_id_fixed"]	= $dc_cost_acc_id_fixed;
			$data["i_group"]				= $ss["i_group"];
			$data["i_level"]				= $ss["i_level"]+1;
			$data["i_last"]					= ($data["i_level"]=="6")? 1 : 2;
			// $data["i_last"]					= ($ss["i_level"]==$i_level)? 1 : 2; 
			$data["c_comment"]				= null;
			$data["i_enable"]				= ($i_enable == 1)? STATUS_ENABLE : STATUS_DISABLE;
			$data["i_delete"]				= DELETE_FALSE;
			$data["dc_user_create_id"]		= $_SESSION["user_id"];
			$data["dc_user_create_cost_id"]	= $_SESSION["dc_cost_id"];
			$data["d_create"]				= DATE("Y-m-d H:i:s");
			$data["dc_user_update_id"]		= $_SESSION["user_id"];
			$data["dc_user_update_cost_id"]	= $_SESSION["dc_cost_id"];
			$data["d_update"]				= DATE("Y-m-d H:i:s");
			$data["i_debit"]				= $i_debit;

			
			foreach ($data as $fld => $value) {
				$arrParam[] = ($value != "")? $value : NULL;
				$addField .= ", {$fld}";
				$addValue .= ", ?";
			}

			$sqlAddChild	= "INSERT INTO {$table} (".substr($addField, 1).") VALUES (".substr($addValue,1).");";
			
			$db->BeginTran();
			$stmt = $db->QueryParam($sqlAddChild, $arrParam);
		} else {
			$stmt	= null;
			$msg	= "รายการที่เลือกเป็นรายการย่อยสุดแล้ว";
		}
		
		if ($stmt) {
			$db->CommitTran();
			$re = array("success"=>true, "msg"=>$msg);
		} else {
			$db->RollBackTran();
			$re = array("success"=> false, "msg"=>$msg);
		}
		break;

	case "AddBefore" : // เพิ่มก่อนหน้ารายการที่เลือก
	case "AddAfter" : // เพิ่มต่อท้ายรายการที่เลือก
		if($mode == "AddAfter"){
			$update	= ">";
			$insert	= "+ 1";
		} else {
			$update	= ">=";
			$insert	= "";
		}
		
		$parent_length		= 0;
		$length				= 0;
		$d					= 0;
		
		$sql	= "SELECT i_group, i_level, c_code_tree FROM {$table} WHERE {$keyName} = ?";
		$ss		= $db->GetDataBySQL($sql, array($ref_id));
		
		for ($i=1; $i < $ss["i_level"]; $i++)	{ $parent_length += $lv[($i-1)]; }	// parent_index
		for ($i=1; $i <= $ss["i_level"]; $i++)	{ $length += $lv[($i-1)]; }			// index
		
		$refNode	= substr($ss["c_code_tree"], 0, $parent_length);
		$refCode	= substr($ss["c_code_tree"], 0, $length);
		
		for ($i=1; $i <= $i_level; $i++)	{ $d += $lv[($i-1)]; }
		$tempCode	= sprintf("%'.0".$d."d", 0);

		$arrParam[]	= $ss["c_code_tree"];
		$arrParam[]	= $refCode;
		$arrParam[]	= $refNode;
		$arrParam[]	= $tempCode;
		$arrParam[]	= $_SESSION["user_id"];
		$arrParam[]	= $_SESSION["dc_cost_id"];
		$arrParam[]	= date("Y-m-d H:i:s");
		$arrParam[]	= $ss["i_level"];

		$sqlAddAfter	= "	DECLARE @parentFullcode AS VARCHAR(250) = ?;
							DECLARE @refCode AS VARCHAR(250) = ?;
							DECLARE @refNode AS VARCHAR(250) = ?;
							DECLARE @tempCode AS VARCHAR(250) = ?;
							DECLARE @update_id AS INT = ?;
							DECLARE @update_cost_id AS INT = ?;
							DECLARE @d_update AS VARCHAR(250) = ?;
							DECLARE @i_level AS INT = ?;
							
							UPDATE {$table} SET
								c_code_tree = RIGHT('00' + CAST(CAST(LEFT(c_code_tree, LEN(@refCode)) AS numeric) + 1
									AS VARCHAR(250))+
								RIGHT(c_code_tree, LEN(@parentFullcode) - LEN(@refCode)), LEN(@parentFullcode)),
								dc_user_update_id = @update_id,
								dc_user_update_cost_id = @update_cost_id,
								d_update = @d_update
							WHERE LEFT(c_code_tree, LEN(@refCode)) ".$update." @refCode
								AND LEFT(c_code_tree, LEN(@refNode)) = @refNode;";
		
		// FLD
		$data["c_code"]					= $c_code;
		$data["c_name"]					= $c_name;
		$data["dc_cost_acc_id_fixed"]	= $dc_cost_acc_id_fixed;
		$data["i_group"]				= ($ss["i_level"] == 1)? $ss["i_group"]+1 : $ss["i_group"];
		$data["i_last"]					= ($ss["i_level"] == $i_level)? 1 : 2;
		$data["c_comment"]				= null;
		$data["i_enable"]				= ($i_enable == 1)? STATUS_ENABLE : STATUS_DISABLE;
		$data["i_delete"]				= DELETE_FALSE;
		$data["dc_user_create_id"]		= $_SESSION["user_id"];
		$data["dc_user_create_cost_id"]	= $_SESSION["dc_cost_id"];
		$data["d_create"]				= date("Y-m-d H:i:s");
		$data["dc_user_update_id"]		= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]	= $_SESSION["dc_cost_id"];
		$data["d_update"]				= date("Y-m-d H:i:s");
		$data["i_debit"]				= $i_debit;
		
		foreach ($data as $fld => $value) {
			$arrParam[] = ($value != "")? $value : NULL;
			$addField .= ", {$fld}";
			$addValue .= ", ?";
		}
		
		$sqlAddAfter	.= "INSERT INTO {$table} (".substr($addField, 1).", i_level, c_code_tree)
							VALUES (".substr($addValue,1).", ".$ss["i_level"].", LEFT(RIGHT('00'+CAST((CAST(LEFT(@refCode, LEN(@refCode)) AS NUMERIC) ".$insert." ) AS VARCHAR(250)), LEN(@refCode))+@tempCode, LEN(@tempCode)));
							
							IF @i_level = 1
							BEGIN
								UPDATE {$table} SET i_group = CAST(LEFT(c_code_tree,2) AS NUMERIC);
							END;";
		$db->BeginTran();
		
		$stmt = $db->QueryParam($sqlAddAfter, $arrParam);
		if ($stmt) {
			$db->CommitTran();
			$re = array("success"=>true, "msg"=>"commit");
		} else {
			$db->RollBackTran();
			$re = array("success"=> false, "msg"=>"check statement : {$sqlAddChild} {$arrParam}");
		}
		break;
		
	case "Edit" : // แก้ไขรายการที่เลือก

		// FLD
		$data["c_code"]					= $c_code;
		$data["c_name"]					= $c_name;
		$data["dc_cost_acc_id_fixed"]	= $dc_cost_acc_id_fixed;
		$data["i_enable"]				= $i_enable;
		$data["dc_user_update_id"]		= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]	= $_SESSION["dc_cost_id"];
		$data["d_update"]				= date("Y-m-d H:i:s");
		$data["i_debit"]				= $i_debit;
		
		foreach ($data as $fld => $value) {
			if($value != ""){
				$arrParam[] = $value;
				$addField .= ", {$fld} = ?";
			}
		}
		
		$sqlEdit = "UPDATE {$table} SET ".substr($addField,1)." WHERE {$keyName} = ?";
		$arrParam[] = $ref_id;
		
		$db->BeginTran();
		$stmt = $db->QueryParam($sqlEdit, $arrParam);
		if ($stmt) {
			$db->CommitTran();
			$re = array("success"=>true, "msg"=>"commit");
		} else {
			$db->RollBackTran();
			$re = array("success"=> false, "msg"=>"check statement : {$sqlAddChild} {$arrParam}");
		}
		break;

	case "Del" : // ลบรายการที่เลือก
		
		// FLD
		$data["i_delete"]				= DELETE_TRUE;
		$data["dc_user_update_id"]		= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]	= $_SESSION["dc_cost_id"];
		$data["d_update"]				= date("Y-m-d H:i:s");
		
		foreach ($data as $fld => $value) {
			if($value != ""){
				$arrParam[] = $value;
				$addField .= ", {$fld} = ?";
			}
		}
		
		$sqlDel = "UPDATE {$table} SET ".substr($addField,1)." WHERE {$keyName} = ?";
		$arrParam[] = $ref_id;
		
		$db->BeginTran();
		$stmt = $db->QueryParam($sqlDel, $arrParam);
		if ($stmt) {
			$db->CommitTran();
			$re = array("success"=>true, "msg"=>"commit");
		} else {
			$db->RollBackTran();
			$re = array("success"=> false, "msg"=>"check statement : {$sqlAddChild} {$arrParam}");
		}
		break;
		
	case "Move" : // ย้ายรายการที่เลืก
		
		$CHACK			= true;
		$parent_length	= 0;
		$node_length	= 0;
		$dd				= 0;
		$lengthLv1		= sprintf("%'.'9".$lv[0]."d", 9);
		
		for ($i=2; $i <= $i_level; $i++) { $dd += $lv[($i-1)]; }
		//----------------------- ต้นทาง ----------------------//
		$p_sql	= "SELECT * FROM {$table} WHERE {$keyName} = ?";
		$parent	= $db->GetDataBySQL($p_sql, array($ref_id));
		
		for ($i=1; $i <= $parent["i_level"]; $i++)	{ $parent_length += $lv[($i-1)]; }
		for ($i=1; $i < $parent["i_level"]; $i++)	{ $node_length += $lv[($i-1)]; }
		
		$parentCode = substr($parent["c_code_tree"], 0, $parent_length);
		$parentNode = substr($parent["c_code_tree"], 0, $node_length);
		
		// STEP 1 = UPDATE ต้นทาง
		$SQL1	= "	UPDATE dc_acc SET
						c_code_tree = '".$lengthLv1."'+RIGHT(c_code_tree,".$dd.")
					FROM dc_acc
					WHERE c_code_tree LIKE '".$parentCode."%';";
		
		$STEP1 = $db->QueryParam($SQL1, array());

		if(!$STEP1)
			$CHACK	= false;
		//END STEP1
		
		// เลื่อนตำแหน่งของรายการเก่า
		if($CHACK) {
			
			$SQL2	= "	DECLARE @parentFullcode AS VARCHAR(250) = '".$parent["c_code_tree"]."';
						DECLARE @parentCode AS VARCHAR(250) = '".$parentCode."';
						DECLARE @parentNode AS VARCHAR(250) = '".$parentNode."';
						DECLARE @update_id AS INT = ".$_SESSION["user_id"].";
						DECLARE @update_cost_id AS INT = ".$_SESSION["dc_cost_id"].";
						DECLARE @d_update AS VARCHAR(250) = '".date("Y-m-d H:i:s")."';
			
						UPDATE dc_acc SET
							c_code_tree = RIGHT('".sprintf("%'.'0".$lv[0]."d", 0)."'
								+ CAST(CAST(LEFT(c_code_tree, LEN(@parentCode)) AS NUMERIC) - 1 AS VARCHAR(250))
								+ RIGHT(c_code_tree, LEN(@parentFullcode) - LEN(@parentCode)), LEN(@parentFullcode)),
							dc_user_update_id = @update_id,
							dc_user_update_cost_id = @update_cost_id,
							d_update = @d_update
						WHERE LEFT(c_code_tree,LEN(@parentCode)) > @parentCode
							AND LEFT(c_code_tree, LEN(@parentNode)) = @parentNode
							AND NOT LEFT(c_code_tree, LEN(".$lengthLv1.")) = '".$lengthLv1."'";
			
			$STEP2 = $db->QueryParam($SQL2, array());
		} else { $msg = "STEP1 ไม่ถูกต้อง"; }
		
		if(!$STEP2)
			$CHACK	= false;
		// END STEP2
		
		// ขยับตำแหน่ง
		if($CHACK) {
			if( $i_move == "After" ) {
				$update		= ">";
				$upparent	= "";
			} else {
				$update		= ">=";
				$upparent	= -1;
			}
			
			$M_SQL	= "SELECT * FROM {$table} WHERE {$keyName} = ?";
			$move	= $db->GetDataBySQL($M_SQL, array($move_id));
			
			$move_length	= 0;
			$node_length	= 0;
			
			for ($i=1; $i <= $move["i_level"]; $i++)	{ $move_length += $lv[($i-1)]; }
			for ($i=1; $i < $move["i_level"]; $i++)		{ $node_length += $lv[($i-1)]; }
			
			$moveCode	= substr($move["c_code_tree"], 0, $move_length);
			$moveNode	= substr($move["c_code_tree"], 0, $node_length);
			
			$SQL3	= "	DECLARE @moveFullcode AS VARCHAR(250) = '".$move["c_code_tree"]."';
						DECLARE @moveCode AS VARCHAR(250) = '".$moveCode."';
						DECLARE @moveNode AS VARCHAR(250) = '".$moveNode."';
						DECLARE @update_id AS INT = ".$_SESSION["user_id"].";
						DECLARE @update_cost_id AS INT = ".$_SESSION["dc_cost_id"].";
						DECLARE @d_update AS VARCHAR(250) = '".date("Y-m-d H:i:s")."';
						
						UPDATE {$table} SET
							c_code_tree = RIGHT('".sprintf("%'.'0".$lv[0]."d", 0)."'
								+ CAST(CAST(LEFT(c_code_tree, LEN(@moveCode)) AS numeric) + 1 AS VARCHAR(250))
								+ RIGHT(c_code_tree, LEN(@moveFullcode) - LEN(@moveCode)), LEN(@moveFullcode)),
							dc_user_update_id = @update_id,
							dc_user_update_cost_id = @update_cost_id,
							d_update = @d_update
						WHERE LEFT(c_code_tree,LEN(@moveCode)) ".$update." @moveCode
							AND LEFT(c_code_tree, LEN(@moveNode)) = @moveNode
							AND NOT LEFT(c_code_tree, LEN(".$lengthLv1.")) = '".$lengthLv1."'";
			
			$STEP3 = $db->QueryParam($SQL3, array());
		} else { $msg = "STEP2 ไม่ถูกต้อง"; }
		
		if(!$STEP3)
			$CHACK	= false;
		// END STEP3
		
		// UPDATE ต้นทางทั้ง Node
		if($CHACK) {
			
			$declare		= "";
			$c_code_tree	= "";
			$begin			= "";
			$IF				= "";
			$pt				= 0;
			
			for ($i=1; $i <= $i_level; $i++) {
				
				$set		= "";
				$pt			+= ($i > 1)? $lv[($i-2)] : 0;
				$sub_code	= substr($move["c_code_tree"],$pt,$lv[($i-1)]);
				
				$declare	.= "DECLARE @lv".$i." INT = ".$sub_code.";
								DECLARE @position".$i." INT	= ".$lv[($i-1)].";";
				$IF			.= " IF @lv = ".$i." SET @lv".$i." = @lv".$i." {$upparent};";

				for ($ii=$i; $ii <= $i_level; $ii++) {
					$set	.= ($set == "")? "SET @lv".$ii." = @lv".$ii." + 1;" : "SET @lv".$ii." = 0;";
				}
				
				$begin	.= ( $begin == "" )? " IF @i_level = ".$i." BEGIN ".$set." END " : " ELSE IF @i_level = ".$i." BEGIN ".$set." END ";
				
				if($c_code_tree == "") {
					$c_code_tree	.= " RIGHT('00000000000000000000'+cast(@lv".$i." AS VARCHAR(20)), @position".$i.") ";
				} else {
					$c_code_tree	.= " +RIGHT('00000000000000000000'+cast(@lv".$i." AS VARCHAR(20)), @position".$i.") ";
				}
				
			}
			
			$SQL4	= " {$declare}
					
					DECLARE @lv INT = ".$move["i_level"].";
					DECLARE @update_id AS INT = ".$_SESSION["user_id"].";
					DECLARE @update_cost_id AS INT = ".$_SESSION["dc_cost_id"].";
					DECLARE @d_update AS VARCHAR(250) = '".date("Y-m-d H:i:s")."';
			
					DECLARE @dc_acc_id INT;
					DECLARE @i_level INT;
			
					DECLARE @aa bigint;
					DECLARE @bb bigint;
			
					SET @aa = 0;
					SET @bb = 0;
					
					{$IF}
			
					SET NOCOUNT ON
					DECLARE vendor_cursor CURSOR FOR
					SELECT dc_acc_id, i_level
					FROM dc_acc
					WHERE c_code_tree LIKE '".$lengthLv1."%'
					ORDER BY c_code_tree;
					
					OPEN vendor_cursor;
			
					FETCH NEXT FROM vendor_cursor
					INTO @dc_acc_id, @i_level;
					BEGIN TRAN
						WHILE @@FETCH_STATUS = 0
							BEGIN {$begin}

							UPDATE dc_acc SET
								c_code_tree = ".$c_code_tree.",
								i_group = @lv1,
								dc_user_update_id = @update_id,
								dc_user_update_cost_id = @update_cost_id,
								d_update = @d_update
							WHERE dc_acc_id = @dc_acc_id;
							
							SET @aa = @@ERROR;
							SET @bb = @aa + @bb;
		
							FETCH NEXT FROM vendor_cursor
							INTO @dc_acc_id, @i_level
						END
					
					IF (@bb>0)
						ROLLBACK TRAN
					ELSE
						COMMIT TRAN
					
					SELECT @bb;
					
					CLOSE vendor_cursor;
					DEALLOCATE vendor_cursor;
					
 					UPDATE {$table} SET i_group = CAST(LEFT(c_code_tree,".sprintf("%'.'0".$lv[0]."d", 0).") AS NUMERIC);
 
					";

			$STEP4 = $db->GetDataBySQL($SQL4, array());
		} else { $msg = "STEP3 ไม่ถูกต้อง"; }
		
		if($CHACK == true && $STEP4 == 0) {
			$re = array("success"=>true, "msg"=>"commit");
		} else {
			$re = array("success"=> false, "msg"=>$msg);
		}
		break;
}
echo json_encode($re);
exit; 
?>
