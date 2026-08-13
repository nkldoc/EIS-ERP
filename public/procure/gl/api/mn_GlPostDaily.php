<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");
include("../../gl/conf/configGl.php");

$db		= new DatabaseServer();
$date 	= new i_date();

$root		= "data";
$data		= array();

$mode		= $_REQUEST["mode"];
$arrParam	= array();
$addField	= null;
$addValue	= null;
$arrValue	= array();

switch ( $mode ) {

	case "SAVE" :
		if (ISSET($_SESSION))
		{
			$msg = "";
			$c_yyyy_mm	= $db->GetDataBySQL("SELECT c_yyyy_mm FROM gl_tran_hdr WHERE gl_tran_hdr_id = ?",array($_REQUEST["id"]));
			
			$sqlPost		= "EXEC SP_GL_POST_DAILY ?,?,?,?,?,?,?,?,?,?;";
			$arrParamPost   = array($c_yyyy_mm,BOOK_ACC_GL_CODE,$_SESSION["user_id"],$_SESSION["dc_cost_id"],BOOK_ACC_GX,BOOK_ACC_GL,GL_CLOSE_YEAR_NONE,$_REQUEST["id"],GL_CFG_BOSS_ID,GL_CFG_BOSS_COST_ID);
			$iPostGL 		= $db->QueryParam($sqlPost,$arrParamPost);
		}
		else
		{
			$msg = "กรุณา  ออกจากระบบ แล้ว เข้าสู่ระบบ ใหม่<br>เนื่องจาก Session หมดอายุ";
		}
		
		if(@$iPostGL){
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
