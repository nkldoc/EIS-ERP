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