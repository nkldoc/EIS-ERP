<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();
############################################################################################################
$mode	= @$_REQUEST["mode"];
$filter = @$_REQUEST["filter"];
$value	= @$_REQUEST["value"];
$i_read	= @$_REQUEST["i_read"];
###################
$table	= "dc_user";
$root	= "data";
$data	= array();

$limit 	= @$_REQUEST["limit"];
$dir 	= @$_REQUEST["dir"];
$sort 	= @$_REQUEST["sort"];
$start 	= @$_REQUEST["start"];

if (!get($start)) { $start 	= 0; }
if (!get($limit)) { $limit 	= 20; }else{ $limit=($limit+$start); }
if (!get($dir))	{   $dir 	= "ASC"; }
if (!get($sort)) {  $sort 	= "{$table}.c_user_name"; }

$sqlTempTable = "select {$table}.dc_user_id
						,{$table}.dc_emp_id
						,isnull({$table}.dc_menu_hdr_id,0) as menu_hdr_id
						,{$table}.dc_cost_id
						,{$table}.c_full_name
						,{$table}.c_user_name
						,{$table}.c_comment
						,{$table}.i_type_user
						,{$table}.i_enable
						,{$table}.i_delete
						,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
						,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
						, convert(varchar, d_create, 120) as d_create
						,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
						,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_update_cost_id) as c_cost_update_name
						, convert(varchar, [d_update], 120) as d_update
					, ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table}
where {$table}.dc_cost_id=" . SUPPLIES_ID . " and ISNULL({$table}.i_delete," . DELETE_FALSE . ") = ?" . $util->viewAcc($i_read, "{$table}");

 if($mode=="SEARCH"){
	if (isset($filter) && $filter!="" && $value!="")
	{
		$sqlTempTable .= " and ".$filter." like ?";
	}

	$sqlMain	= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
	// parameter ของ ชุดแสดงรายการ
	$arrParam = array(DELETE_FALSE, "%{$value}%", $start, $limit);
	// parameter ของ ชุดนับจำนวนรายการ
	$arrCountParam =  array(DELETE_FALSE, "%{$value}%");
}
else if ($mode == "ExportExcel")
{
	if (isset($filter)&&$filter!="")
	{
		$sqlTempTable .= " and {$table}.".$filter." like ?";
	}
	$sqlMain	= "select * from ({$sqlTempTable}) a";

	// parameter ของ ชุดแสดงรายการ
	$arrParam = array(DELETE_FALSE, "%{$value}%");
	// parameter ของ ชุดนับจำนวนรายการ
	$arrCountParam =  array(DELETE_FALSE, "%{$value}%");
}
else
{
	$sqlMain	= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
	// parameter ของ ชุดแสดงรายการ
	$arrParam = array(DELETE_FALSE, $start, $limit);
	// parameter ของ ชุดนับจำนวนรายการ
	$arrCountParam =  array(DELETE_FALSE);
}

$stmt = $db->QueryParam($sqlMain, $arrParam);
$i = $start + 1;
while($row =$db->Fetch($stmt))
{
	$temp = array("no" => ($i++),
					"id" =>$row["dc_user_id"],
					"dc_emp_id" =>$row["dc_emp_id"],
					"dc_cost_id" =>$row["dc_cost_id"],
					"menu_hdr_id" =>$row["menu_hdr_id"],
					"c_user_name" =>$row["c_user_name"],
					"c_full_name" =>$row["c_full_name"],
					"c_comment" =>$row["c_comment"],
					"i_type_user" =>$row["i_type_user"],
					"i_enable" =>$row["i_enable"],
					"i_delete" =>$row["i_delete"],
					"dc_user_create_id" =>$row["c_create_name"],
					"dc_user_create_cost_id" =>$row["c_cost_creat_name"],
					"d_create" =>$date->extDateBuddha($row["d_create"]),
					"dc_user_update_id" =>$row["c_update_name"],
					"dc_user_update_cost_id" =>$row["c_cost_update_name"],
					"d_update" =>$date->extDateBuddha($row["d_update"])

	);
	${$root}[] = $temp;
}
$sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
echo json_encode(array("debug"=>true,"totalCount"=>$totalCount,$root=>${$root}));

function get($a){ return isset($a) && !empty($a)?$a:null; }
?>