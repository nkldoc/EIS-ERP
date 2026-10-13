<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");


$db = new DatabaseServer();
$date = new i_date();

$root	= "data";
$sql 	= "";
$where = "";
$data	= array();

$mode		= @$_REQUEST["mode"];
$fldID		= @$_REQUEST["fldID"];
$fldCode	= @$_REQUEST["fldCode"];
$fldName	= @$_REQUEST["fldName"];
$table		= @$_REQUEST["table"];
$filter 	= @$_REQUEST["filter"];
$value		= @$_REQUEST["value"];

$fldCode = ($fldCode != "")? $fldCode : "c_code";
$fldName = ($fldName != "")? $fldName : "c_name";

if (isset($filter) && $filter!="" && $value!="")
{
	$where = " where {$filter} = {$value}";
}

switch($mode)
{
	case 1 : // return [id] = ID ของตารางที่ส่งมา [c_name] = c_name ของตารางที่ส่งมา
		$sql = "select {$fldID} as id, {$fldName} as c_name from {$table} {$where} order by {$fldName}";
		break;
	case 2 : // return [id] = ID ของตารางที่ส่งมา [c_name] = c_code + c_name ของตารางที่ส่งมา
		$sql = "select {$fldID} as id, {$fldCode}+' '+{$fldName} as c_name from {$table} {$where} order by {$fldCode}+' '+{$fldName}";
		break;
	case 'DC_EMP_LOAD' : // return [id] = ID ของตารางที่ส่งมา [c_name] = c_code + c_name ของตารางที่ส่งมา
			$sql = "SELECT a.dc_user_id AS id 
						,d.c_code+' '+c.c_name as c_name
					FROM dc_user a
					INNER JOIN (SELECT dc_user_id FROM dc_user_menu GROUP BY dc_user_id)b ON b.dc_user_id = a.dc_user_id
					INNER JOIN sp_emp c ON c.dc_emp_id = a.dc_emp_id
					INNER JOIN dc_emp d ON d.dc_emp_id = a.dc_emp_id
					WHERE a.dc_cost_id=38
					ORDER BY c.dc_department_id,c.i_level,d.c_code";
		break;
	default : // return [id] = ID ของตารางที่ส่งมา [c_name] = c_name ของตารางที่ส่งมา
		$sql = "select {$fldID} as id, {$fldName} as c_name from {$table} {$where} order by {$fldName}";
		break;
}

$stmt = $db->Query($sql);
while($row =$db->Fetch($stmt))				
{
	$temp = array("id" =>$row["id"],
					"c_name" =>$row["c_name"]
				);
	${$root}[] = $temp;
}

echo json_encode(array("debug"=>true,$root=>${$root}));

function get($a){ return isset($a) && !empty($a)?$a:null; }
?>