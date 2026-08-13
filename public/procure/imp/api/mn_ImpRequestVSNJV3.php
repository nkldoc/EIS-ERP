<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
//include("../conf/configGl.php");

$db		= new DatabaseServer();
$date	= new i_date();
$util	= new apiUtil();

global $group_hdr_id;
// ========================= S A V E =============================== //

$mode		= @$_REQUEST["mode"];
$data 		= $util->mnUser($_REQUEST);
$addField	= null;
$addValue	= null;
$arrValue	= array();
  
$step		= $_REQUEST["step"];	// เริมต้น = 0
$stepAll	= 2;					// step Processed ทั้งหมด
$d_doc		= substr($_REQUEST["ddate"],0,10); 
$c_yyyy		= substr($_REQUEST["ddate"],0,4);
$c_mm		= substr($_REQUEST["ddate"],5,2);
$c_yyyy_mm  = $c_yyyy.$c_mm;
//echo $c_yyyy_mm;exit;
$msg 		= "commit";
 
switch ($mode) {
	
	case "SAVE" :  
		
		// ----------[3/3] ประมวลผล ----------		
		switch ($step) {
			case 0 :
				$step	= $step + 1;
				$msg 	= "commit";
			 break;			
			case 1 :
						/* 1 - INSERT  imp_group_request_vsn_hdr + imp_group_request_vsn_dtl + GX*/
						$step	= $step + 1; 
						$db->BeginTran();

						$SP_NAME_STEP1 	= "SP_GROUP_IRCV";  
						$sql22 			= "SET NOCOUNT ON; ";
						$sql22 			.= " EXEC {$SP_NAME_STEP1} '{$d_doc}','$_SESSION[user_id]','$_SESSION[dc_cost_id]','{$c_yyyy_mm}';";
						 
						$iInsPeriod = $code_group = $jv_id = $jv_code = ""; 
						$stmt = $db->QueryParam($sql22, array());
						$db->NextResult($stmt);
						$db->NextResult($stmt);
						if( sqlsrv_has_rows( $stmt ) ) {
							while( $rows = $db->Fetch( $stmt ) ) { 
								$iInsPeriod = $rows["imp_group_request_vsn_hdr_id"];
								$code_group = $rows["c_code"];
								$jv_id 		= $rows["gl_tran_hdr_id"];
								$jv_code 	= $rows["c_jv_code"];
							}
						}
						  
						
						if ($stmt)
						{
							$msg = "เลขที่เอกสาร : ".$code_group." และเลขที่บันทึกบัญชี คือ ".$jv_code;
							$db->CommitTran();
							$re = array(
									"reval"			=> 0,
									"success"		=> "Success",
									"msg"			=> $msg
							);   
						}
						else
						{
							$db->RollBackTran();
							$re = array(
									"reval"			=> 1,
									"success"		=> "Error",
									"msg"			=> "check statement : {$sql}"
							);
							$msg = "check statement : {$sql}"; 
						}
 
						 
				break; 
 				
			default:
					$step	= $stepAll+1;
					$msg = "commit";
				break;
		}		
 
		$re = array(
				"success"		=> true,
				"Processed"		=> $step,
				"total"			=> $stepAll,
				"msg"			=> $msg
		);
		
		echo json_encode($re);
		exit;
		break;
		
	default : break;
}
?>
