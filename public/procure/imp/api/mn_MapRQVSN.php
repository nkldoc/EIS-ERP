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
 
		 
			if ($_REQUEST["id"]!="")
			{
				$sqlGenRQ		= "EXEC SP_MAP_REQUEST_VSN ?;";
				$arrParamGenRQ   = array($_REQUEST["id"]);
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
