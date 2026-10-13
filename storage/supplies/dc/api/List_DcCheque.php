<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../conf/configDc.php");

$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$root		= "data";
$data		= array();

$mode	= @$_REQUEST["mode"];
$status	= @$_REQUEST["status"];
$filter	= @$_REQUEST["filter"];
$value	= @$_REQUEST["value"];
$i_read	= @$_REQUEST["i_read"];

$limit 	= @$_REQUEST["limit"];
$start 	= @$_REQUEST["start"];

$con	= null;

if (!$util->get($start)) {
	$start 	= 0;
}
if (!$util->get($limit)) {
	$limit 	= 20;
} else {
	$limit = ($limit + $start);
}

switch ($i_read) {
	case 1:
		$con = " AND a.dc_user_create_id= " . $_SESSION["user_id"];
		break;
	case 2:
		$con = " AND a.dc_user_create_cost_id= " . $_SESSION["dc_cost_id"];
		break;
	default:
		$con = "";
}

if ($mode == "SEARCH") {
	if ($status > 0) {
		$con	.= "AND a.i_enable = " . $status;
	}
	if ($value != "") {
		$con	.= " AND a." . $filter . " LIKE '%$value%' ";
	}
}

$sqlTempTable = "	SELECT
						ROW_NUMBER() OVER (ORDER BY a.c_cheque ASC) AS numrow,
						a.dc_cheque_id, 
						a.dc_bank_acc_company_id,
						a.c_cheque,
						a.c_show,
						a.i_total,
						a.d_doc,
						a.d_gen,
						a.f_money,
						a.c_comment,
						a.i_enable,
						a.i_delete, 
						(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_create_id) AS dc_user_create,
						(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_create_cost_id) AS dc_user_create_cost,
						convert(VARCHAR, a.d_create, 120) AS d_create,
						(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_update_id) AS dc_user_update,
						(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_update_cost_id) AS dc_user_update_cost,
						convert(VARCHAR, a.d_update, 120) AS d_update
						/* 
						,CASE 
							WHEN (a.i_status=1) THEN 'ว่าง'
							WHEN (a.i_status=2) THEN 'ระบุ'
							WHEN (a.i_status=3) THEN 'ตรวจ'
							WHEN (a.i_status=4) THEN 'จ่าย'
							WHEN (a.i_status=9) THEN 'ยกเลิก'
							ELSE '-'
						END as c_status
						*/
						,CASE
							WHEN b.count_cheque > 0 THEN 1
							ELSE 4
						END AS i_status
					FROM dc_cheque a
						LEFT JOIN (
							SELECT
								dc_cheque_id
								,COUNT(dc_cheque_id) AS count_cheque
							FROM (
								SELECT
									aa.dc_cheque_id
								FROM imp_expense_dtl_cheque aa
								UNION ALL
								SELECT
									aa.dc_cheque_id
								FROM imp_expense_vsn_dtl_cheque aa
							) a
							GROUP BY dc_cheque_id) b ON a.dc_cheque_id = b.dc_cheque_id
					WHERE a.i_delete = 2 $con";

$sqlMain = "SELECT * FROM ({$sqlTempTable}) a WHERE a.numrow > ? AND a.numrow <= ?";

$arrParam[]	= $start;
$arrParam[]	= $limit;

$stmt = $db->QueryParam($sqlMain, $arrParam);
while ($row = $db->Fetch($stmt)) {
	$temp = array(
		"no"						=> $row["numrow"],
		"id"						=> $row["dc_cheque_id"],
		"dc_bank_acc_company_id"	=> $row["dc_bank_acc_company_id"],
		"c_cheque"					=> $row["c_cheque"],
		"c_show"					=> $row["c_show"],
		"i_total"					=> $row["i_total"],
		"d_doc"						=> $row["d_doc"],
		"d_gen"						=> $row["d_gen"],
		"f_money"					=> $row["f_money"],
		"c_comment"					=> $row["c_comment"],
		"i_status"					=> $row["i_status"],
		"i_enable"					=> $row["i_enable"],
		"i_delete"					=> $row["i_delete"],
		"dc_user_create_id"			=> $row["dc_user_create"],
		"dc_user_create_cost_id"	=> $row["dc_user_create_cost"],
		"d_create"					=> $date->extDateBuddha($row["d_create"]),
		"dc_user_update_id"			=> $row["dc_user_update"],
		"dc_user_update_cost_id"	=> $row["dc_user_update_cost"],
		"d_update"					=> $date->extDateBuddha($row["d_update"]),
	);

	${$root}[] = $temp;
}
$sqlCount = "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a";

$totalCount = $db->GetDataBySQL($sqlCount, $arrParam);
echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
