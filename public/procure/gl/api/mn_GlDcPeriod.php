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

$table	= "gl_dc_period";
$fld_id	= "gl_dc_period_id";
$step	= $_REQUEST["step"];
$year	= $_REQUEST["year"];
$month	= sprintf("%02d%",$step,"");
$total	= 12;

switch ($mode) {
	
	case "SAVE" :

		$msg		= "";
		
		if($msg != "") {
			$re = array( "msg" => $msg );
		} else {
			
			$data["c_mm"]						= $month;
			$data["c_yyyy"]						= $year;
			$data["i_gen"]						= 1;
			$data["i_status"]					= 2;
			$data["c_status"]					= "ปิดงวด";
			$data["i_last_period"]				= GL_LAST_PERIOD_TRUE;
			$data["dc_user_create_id"]			= $_SESSION["user_id"];
			$data["dc_user_create_cost_id"]		= $_SESSION["dc_cost_id"];
			$data["d_create"]					= date("Y-m-d H:i:s");

			if( $step >= 1 && $step <= 12 ) {
				$sqlMain	= "SELECT {$fld_id} FROM {$table} WHERE c_yyyy = ? AND c_mm = ?";
				$arrParam	= array($year,$month);
				$stmt = $db->QueryParam($sqlMain, $arrParam);
				
				if($db->Fetch($stmt)){
					$re = array(
							"Processed"		=> $step,
							"total"			=> $total,
							"YY"			=> $year+543,
							"msg"			=> "error"
					);
				} else {
					$db->BeginTran();
					for($i=1;$i<=3;$i++){
						$addField	= "";
						$addValue	= "";
						$arrValue	= array();
						
						$data["i_system"]	= $i; //ระบบ (1=บัญชีแยกประเภททั่วไป,2=บัญชีลูกหนี้,3=บัญชีเจ้าหนี้)
						foreach ($data as $fld => $value) {
							$addField .= ", {$fld}";
							$addValue .= ", ?";
							$arrValue[] = $value;
						}
						
						$sql = "INSERT INTO {$table} (".substr($addField, 1).") VALUES (".substr($addValue,1).");";
						$insert = $db->QueryParam($sql, $arrValue);
					}
			
					if($insert){
						$db->CommitTran();
						$re = array(
								"success"		=> true,
								"Processed"		=> ($step + 1),
								"total"			=> $total,
								"msg"			=> "success"
						);
					} else {
						$db->RollBackTran();
						$re = array(
								"success"		=> false,
								"Processed"		=> $step,
								"total"			=> $total,
								"msg"			=> "failure"
						);
					}
				}
			} else {
				$re = array(
						"success"		=> true,
						"Processed"		=> ($step + 1),
						"total"			=> $total,
						"msg"			=> "success"
				);
			}
		}
		
		echo json_encode($re);
		exit;
		break;
		
	default : break;
}
?>