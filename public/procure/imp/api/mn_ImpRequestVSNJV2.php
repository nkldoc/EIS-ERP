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
 
//print_r($_REQUEST);exit;	

switch ( $mode ) {

	case "SAVE" :
		if (ISSET($_SESSION))
		{
			$msg = "";
			/* 1/4 INSERT TEMP */
 

			$c_doc	= $db->GetDataBySQL("SELECT b.d_doc FROM imp_request_vsn_dtl b  WHERE b.imp_request_vsn_dtl_id=?",array($_REQUEST["id"]));

			$sqlINS 	= "INSERT INTO temp_group_dtl_vsn values(?,?,?,?,?)";
			$arrINS[] 	= $_REQUEST["id"];
			$arrINS[]	= $_SESSION["user_id"];
			$arrINS[]	= $_SESSION["dc_cost_id"];
			$arrINS[]	= date("Y-m-d H:i:s"); 
			$arrINS[] 	= $c_doc;
			$iGenRQ 	= $db->QueryParam($sqlINS,$arrINS);
 
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

	case "DELETE_GROUP" :
		if (ISSET($_SESSION))
		{
			$msg = "";
			/* 1  DEL TEMP */
  
			$sqlDEL 	= "DELETE FROM temp_group_dtl_vsn WHERE imp_request_vsn_dtl_id=?";
			$arrDEL[] 	= $_REQUEST["id"]; 
			$iGenRQ 	= $db->QueryParam($sqlDEL,$arrDEL);
			$msg 		= "ยกเลิกการจัดกลุ่มแล้ว";
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
