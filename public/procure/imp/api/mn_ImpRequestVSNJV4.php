<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../../lib/mon/mon.class.php"); 
$db = new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();
$mon 	= new mon(); // convert floatval
 
$mode		= $_REQUEST["mode"];
$table 		= "imp_group_request_vsn_hdr";
$tableDtl 	= "imp_group_request_vsn_dtl";
$keyName 	= "imp_group_request_vsn_hdr_id";
$msg 		= 'เรียบร้อยแล้ว';  
 
switch ($mode) { 
 
	case "DELETE" : 

		if ($_REQUEST['i_enable']=='1'){
			if (($_REQUEST["i_is_post_jv"]=='1') ||  ($_REQUEST["i_is_post_jv"]=='2'))
			{
				$sql = "Declare @idx as bigint;
						set @idx = ?; 
						UPDATE $table set i_delete=1,i_enable=2,gl_tran_hdr_id=0 where $keyName =@idx; 
						
						UPDATE a
						SET a.i_status=2,a.imp_group_request_vsn_dtl_id=0
						FROM imp_request_vsn_dtl a INNER JOIN imp_group_request_vsn_dtl b ON a.imp_request_vsn_dtl_id = b.imp_request_vsn_dtl_id
						WHERE b.imp_group_request_vsn_hdr_id=@idx;
						"; 
				if ($_REQUEST["i_is_post_jv"]=='1')
				{ //1-รอลงบัญชี
					$sql .= " Declare @idJV as bigint;
							set @idJV = ?; 
							DELETE FROM gl_tran_dtl WHERE gl_tran_hdr_id=@idJV;
							DELETE FROM gl_tran_hdr WHERE gl_tran_hdr_id=@idJV;
					"; 
				}
				else if ($_REQUEST["i_is_post_jv"]=='2')
				{ //2-GX ปรับไม่ใช้งาน
					$sql .= " Declare @idJV as bigint;
							set @idJV = ?;  
							UPDATE gl_tran_hdr SET i_enable=2 WHERE gl_tran_hdr_id=@idJV;
					"; 
				}
 
				$arrParam 		= array($_REQUEST["id"],$_REQUEST["gl_tran_hdr_id"]); 
				$stmChkMaster 	= $db->QueryParam($sql, $arrParam);	
				$msg 			= 'ยกเลิกรายการเรียบร้อยแล้ว'; 		
				$returnData 	= array('status'=>'delete','enabledDelete'=>true);			
			} 
			else if ($_REQUEST["i_is_post_jv"]=='3')
			{
				$msg = 'ไม่สามารถยกเลิกรายการได้ เนื่องจาก POST GL แล้ว';
				$returnData = array('status'=>'notice','enabledDelete'=>false);
			}  
				
		}else{  
			$msg = 'ไม่สามารถยกเลิกรายการได้ เนื่องจากสถานะเป็น ไม่ใช้งานแล้ว'; 
			$returnData = array('status'=>'notice','enabledDelete'=>false); 
		}
		
	break;  
}

if ($stmChkMaster)
{
	$db->CommitTran();
	$re = array("reval"=>0,"success"=>"Success","msg"=>$msg,"data"=>@$returnData,"log"=>@$log);
}
else
{
	$db->RollBackTran();
	$re = array("reval"=>1,"success"=>"Error","msg"=>"Error");
}
echo json_encode($re); exit; 

?>