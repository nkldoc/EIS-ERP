<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");
include("../../gl/conf/configGl.php");

$db		= new DatabaseServer();
$date 	= new i_date();

$root		= "data";
$data		= array();

$mode			= $_REQUEST["mode"];
$arrParamGenRQ	= array();
 

switch ( $mode ) {

	case "SAVE" :
		if (ISSET($_SESSION))
		{
			$msg = "";
			$c_yyyy_mm	= $db->GetDataBySQL("SELECT concat(YEAR(a.d_doc_date),RIGHT('0'+CAST(MONTH(a.d_doc_date) AS varchar(2)) ,2)) 
							FROM imp_request_vsn_hdr a INNER JOIN imp_request_vsn_dtl b ON a.imp_request_vsn_hdr_id = b.imp_request_vsn_hdr_id
							WHERE b.imp_request_vsn_dtl_id = ?",array($_REQUEST["id"]));
			
			$doc_code_request	= "DVS"; //Gen ใบเบิกจัดซื้อ  
			$doc_code			= "SDD"; //Gen ใบตั้งหนี้
/*
		เลขใบเบิก		เลขตั้งหนี้
จัดซื้อ		  DVS	     SDD
รายได้		FVS			SDF
 */
			if ($c_yyyy_mm!="")
			{
				$sqlGenRQ		= "EXEC SP_GEN_CODE_REQUEST_VIP ?,?,?,?,?,?,?;";
				$arrParamGenRQ   = array($doc_code_request,$doc_code,$c_yyyy_mm,$_SESSION["user_id"],$_SESSION["dc_cost_id"],$_REQUEST["id"],2);
				$iGenRQ 		= $db->QueryParam($sqlGenRQ,$arrParamGenRQ);
			}

		}
		else
		{
			$msg = "กรุณา  ออกจากระบบ แล้ว เข้าสู่ระบบ ใหม่<br>เนื่องจาก Session หมดอายุ";
		}
		
		if(@$iGenRQ){
			$re = array( "success" => true, "msg" => "$msg" );
		} else {
			$re = array( "success" => false, "msg" => "$msg" );
		}
		
		echo json_encode($re);
		exit;
	break;
}
echo json_encode($re);
exit;
?>
