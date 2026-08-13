<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$root		= "data";
$data		= array();
$con		= null;

if($_REQUEST["type"] == "gl_rep_acc_hdr") {
	
	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];
	
	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];
	
	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }
	
// 	switch($i_read) {
// 		case 1:		$con = " AND a.dc_user_create_id= ".$_SESSION["user_id"]; break;
// 		case 2:		$con = " AND a.dc_user_create_cost_id=".$_SESSION["dc_cost_id"]; break;
// 		default:	$con = "";
// 	}
	
	if($mode == "SEARCH") {
		if($_REQUEST["value"] != "") { $con .= " AND a.".$_REQUEST["filter"]." LIKE '%".$_REQUEST["value"]."%' "; }
	}

	$sqlTempTable = "SELECT
						ROW_NUMBER() OVER (ORDER BY a.c_name ASC) AS numrow
						,a.gl_rep_acc_hdr_id
						,a.c_code
						,a.c_name
						,a.c_comment  
						,SUBSTRING(a.c_acc_group,1,1) as chk_group1
						,SUBSTRING(a.c_acc_group,2,1) as chk_group2
						,SUBSTRING(a.c_acc_group,3,1) as chk_group3
						,SUBSTRING(a.c_acc_group,4,1) as chk_group4
						,SUBSTRING(a.c_acc_group,5,1) as chk_group5
						,SUBSTRING(a.c_acc_group_cal_method,1,1) as cal_group1
						,SUBSTRING(a.c_acc_group_cal_method,2,1) as cal_group2
						,SUBSTRING(a.c_acc_group_cal_method,3,1) as cal_group3
						,SUBSTRING(a.c_acc_group_cal_method,4,1) as cal_group4
						,SUBSTRING(a.c_acc_group_cal_method,5,1) as cal_group5	 
						,a.i_money
						,a.i_process
						,a.i_level_dtl
						,a.i_enable
						,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_create_id) AS dc_user_create
						,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_create_cost_id) AS dc_user_create_cost
						,convert(VARCHAR, a.d_create, 120) AS d_create
						,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_update_id) AS dc_user_update
						,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_update_cost_id) AS dc_user_update_cost
						,convert(VARCHAR, a.d_update, 120) AS d_update
					FROM gl_rep_acc_hdr a
					WHERE a.i_delete = ".DELETE_FALSE."
					$con";

	$sqlMain = "SELECT * FROM ({$sqlTempTable}) a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow";
	
	$arrParam[]	= $start;
	$arrParam[]	= $limit;
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( $stmt ) {
		while($row =$db->Fetch($stmt)) {
			$temp = array(	"no"						=> $row["numrow"],
							"id"						=> $row["gl_rep_acc_hdr_id"],
							"c_code"					=> $row["c_code"],
							"c_name"					=> $row["c_name"],
							"c_comment"					=> $row["c_comment"],
							"chk_group1"				=> $row["chk_group1"],
							"chk_group2"				=> $row["chk_group2"],
							"chk_group3"				=> $row["chk_group3"],
							"chk_group4"				=> $row["chk_group4"],
							"chk_group5"				=> $row["chk_group5"],
							"cal_group1"				=> ($row["cal_group1"] > 0)? $row["cal_group1"] : "",
							"cal_group2"				=> ($row["cal_group2"] > 0)? $row["cal_group2"] : "",
							"cal_group3"				=> ($row["cal_group3"] > 0)? $row["cal_group3"] : "",
							"cal_group4"				=> ($row["cal_group4"] > 0)? $row["cal_group4"] : "",
							"cal_group5"				=> ($row["cal_group5"] > 0)? $row["cal_group5"] : "",
							"i_money"					=> $row["i_money"],
							"i_process"					=> $row["i_process"],
							"i_level_dtl"				=> $row["i_level_dtl"],
							"i_enable"					=> $row["i_enable"],
							"dc_user_create_id"			=> "{$row["dc_user_create"]}",
							"dc_user_create_cost_id"	=> "{$row["dc_user_create_cost"]}",
							"d_create"					=> $date->extDateBuddha($row["d_create"]),
							"dc_user_update_id"			=> $row["dc_user_update"],
							"dc_user_update_cost_id"	=> $row["dc_user_update_cost"],
							"d_update"					=> $date->extDateBuddha($row["d_update"])
			);
			${$root}[] = $temp;
		}
	}
	
	$sqlCount = "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a";
	
	$totalCount = $db->GetDataBySQL($sqlCount, $arrParam);
	echo json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
	exit;
}
?>
