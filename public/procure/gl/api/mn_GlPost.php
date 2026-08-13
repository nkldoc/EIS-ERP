<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../../gl/conf/configGl.php");

$db		= new DatabaseServer();
$date	= new i_date();
$util	= new apiUtil();

// ========================= S A V E =============================== //

$mode		= @$_REQUEST["mode"];

$data		= array();
$addField	= null;
$addValue	= null;
$arrValue	= array();

$step			= $_REQUEST["step"];
$month			= $_REQUEST["month"];
$year			= $_REQUEST["year"];
$cur_month		= sprintf("%02d%",$month,"");
$c_yyyy_mm		= (string) $year.$cur_month;
$total			= 2;

switch ($mode) {
	
	case "SAVE" :

		$msg		= "";
		
		if($msg != "") {
			$re = array( "msg" => $msg );
		} else {
			
			$sqlPost		= "EXEC SP_GL_POST ?,?,?,?,?,?,?,?,?;";
			$arrParamPost   = array($c_yyyy_mm,BOOK_ACC_GL_CODE,$_SESSION["user_id"],$_SESSION["dc_cost_id"],BOOK_ACC_GX,BOOK_ACC_GL,GL_CLOSE_YEAR_NONE,GL_CFG_BOSS_ID,GL_CFG_BOSS_COST_ID);
			$iPostGL 		= $db->QueryParam($sqlPost,$arrParamPost);
			
			if($iPostGL){
					$re = array(
							"success"		=> true,
							"Processed"		=> $step+1,
							"total"			=> $total,
							"msg"			=> ""
					);
			}
		}
		
		echo json_encode($re);
		exit;
		break;
		
	default : break;
}
?>