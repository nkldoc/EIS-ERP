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

if($_REQUEST["type"] == "gl_rep_acc_sub_dtl") {
	
	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];
	
	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];
	
	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }
	
	switch($i_read) {
		case 1:		$con = " AND a.dc_user_create_id= ".$_SESSION["user_id"]; break;
		case 2:		$con = " AND a.dc_user_create_cost_id=".$_SESSION["dc_cost_id"]; break;
		default:	$con = "";
	}
	
	if($mode == "SEARCH") {
		if($_REQUEST["value"] != "") {
			if($_REQUEST["filter"] == "c_report") {
				$con .= " AND a.c_name LIKE '%".$_REQUEST["value"]."%' ";
			} else if($_REQUEST["filter"] == "c_report1") {
				$con .= " AND b.c_name LIKE '%".$_REQUEST["value"]."%' ";
			} else {
				$con .= " AND c.c_name LIKE '%".$_REQUEST["value"]."%' ";
			}
		}
	}

	$sqlTempTable = "SELECT
						ROW_NUMBER() OVER (ORDER BY c.c_name, c.i_sequence) AS numrow
						,b.gl_rep_acc_hdr_id 
						,b.gl_rep_acc_dtl_id
						,c.gl_rep_acc_sub_dtl_id
						,a.c_name as report_name 
						,b.c_name as report_name1 
						,c.c_name
						,c.i_sequence 
						,c.c_comment
						,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_create_id) AS dc_user_create
						,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_create_cost_id) AS dc_user_create_cost
						,convert(VARCHAR, a.d_create, 120) AS d_create
						,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_update_id) AS dc_user_update
						,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_update_cost_id) AS dc_user_update_cost
						,convert(VARCHAR, a.d_update, 120) AS d_update
					FROM gl_rep_acc_hdr a
						INNER JOIN gl_rep_acc_dtl b ON a.gl_rep_acc_hdr_id = b.gl_rep_acc_hdr_id
						INNER JOIN gl_rep_acc_sub_dtl c ON c.gl_rep_acc_dtl_id = b.gl_rep_acc_dtl_id
					WHERE a.i_delete = ".DELETE_FALSE."
					$con";

	$sqlMain = "SELECT * FROM ({$sqlTempTable}) a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow";
	
	$arrParam[]	= $start;
	$arrParam[]	= $limit;
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( $stmt ) {
		while($row =$db->Fetch($stmt)) {
			$temp = array(	"no"						=> $row["numrow"],
							"id"						=> $row["gl_rep_acc_sub_dtl_id"],
							"gl_rep_acc_hdr_id"			=> $row["gl_rep_acc_hdr_id"],
							"gl_rep_acc_dtl_id"			=> $row["gl_rep_acc_dtl_id"],
							"report_name"				=> $row["report_name"],
							"report_name1"				=> $row["report_name1"],
							"c_name"					=> $row["c_name"],
							"i_sequence"				=> $row["i_sequence"],
							"c_comment"					=> $row["c_comment"],
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
	
} else if($_REQUEST["type"] == "vw_dc_acc") {
	
	$hdr_id			= ($_REQUEST["gl_rep_acc_hdr_id"] > 0)? $_REQUEST["gl_rep_acc_hdr_id"] : 0;
	$sub_dtl_id		= ($_REQUEST["gl_rep_acc_sub_dtl_id"] > 0)? $_REQUEST["gl_rep_acc_sub_dtl_id"] : 0;
	
	$c_acc_group	= $db->GetDataBySQL("SELECT c_acc_group FROM gl_rep_acc_hdr WHERE gl_rep_acc_hdr_id = ?", array($hdr_id));
	$str_where		= "";
	
	for ($i=0; $i<strlen($c_acc_group); $i++) {
		if ($c_acc_group[$i] == "1") {
			$str_where .= " OR c_code LIKE '".($i+1)."%' ";
		}
	}
	
	$con .= ($str_where == "")? " AND 1=0 " : " AND (".substr($str_where,3).") ";
	
	$sqlTempTable = "SELECT
						ROW_NUMBER() OVER (ORDER BY a.c_code) AS numrow
						,a.dc_acc_id
						,a.c_code 
						,a.c_name	
						,CASE WHEN ISNULL(c.dc_acc_id , 0) > 0 THEN 1 ELSE 0 END i_chk
					FROM vw_dc_acc a
						LEFT JOIN (	SELECT bb.dc_acc_id FROM gl_rep_acc_sub_dtl aa
							INNER JOIN gl_rep_acc_map bb ON aa.gl_rep_acc_sub_dtl_id=bb.gl_rep_acc_sub_dtl_id
						WHERE aa.gl_rep_acc_sub_dtl_id = ?) c ON a.dc_acc_id=c.dc_acc_id
					WHERE a.i_last = ".I_LAST." and a.i_enable = ".STATUS_ENABLE."
					$con";
	
	$sqlMain = "SELECT * FROM ({$sqlTempTable}) a ORDER BY a.numrow";
	
	$arrParam[]	= $sub_dtl_id;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( $stmt ) {
		while($row =$db->Fetch($stmt)) {
			$temp = array(	"no"						=> $row["numrow"],
							"id"						=> $row["dc_acc_id"],
							"c_code"					=> $row["c_code"],
							"c_name"					=> $row["c_name"],
							"i_chk"						=> $row["i_chk"]
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
