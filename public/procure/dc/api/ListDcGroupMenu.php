<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
$db = new DatabaseServer();

$table	= "dc_menu_hdr";
$root	= "data";
$data	= array();

$limit 	= @$_REQUEST["limit"];
$dir 	= @$_REQUEST["dir"];
$sort 	= @$_REQUEST["sort"];
$start 	= @$_REQUEST["start"];

$mode	= @$_REQUEST["mode"]; 
$filter = @$_REQUEST["filter"];
$value	= @$_REQUEST["value"];
$mode	= @$_REQUEST["mode"];

if (!get($start)) { $start 	= 0; }
if (!get($limit)) { $limit 	= 20; }else{ $limit=($limit+$start); }
if (!get($dir))	{   $dir 	= "ASC"; }
if (!get($sort)) {  $sort 	= "c_code"; }

$sqlTempTable = "select dc_menu_hdr_id
					, c_code
					, c_name
					, c_comment
					, i_enable
					, i_delete
					,(select aaa.c_name from dc_emp aaa inner join dc_user bbb on aaa.dc_emp_id = bbb.dc_emp_id 
						where bbb.dc_user_id=dc_menu_hdr.dc_user_create_id) as dc_user_create_id
					,(select aa.c_name from dc_cost aa where aa.dc_cost_id=dc_menu_hdr.dc_user_create_id) as dc_user_create_cost_id
					,convert(varchar, d_create, 120) as d_create
										
					,(select aaa.c_name from dc_emp aaa inner join dc_user bbb on aaa.dc_emp_id = bbb.dc_emp_id where bbb.dc_user_id=dc_menu_hdr.dc_user_update_id) as dc_user_update_id
					,(select aa.c_name from dc_cost aa where aa.dc_cost_id=dc_menu_hdr.dc_user_update_cost_id) as dc_user_update_cost_id
					,convert(varchar, [d_update], 120) as d_update	
					, ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table} 
				where ISNULL(i_delete,".DELETE_FALSE.") = ?";

if($mode=="SEARCH"){
	if (isset($filter)&&$filter!="")
	{
		$sqlTempTable .= " and ".$filter." like ?";
	}
	$sqlMain	= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
	// parameter ของ ชุดแสดงรายการ
	$arrParam = array(DELETE_FALSE, "%{$value}%", $start, $limit);
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
					"id" =>$row["dc_menu_hdr_id"],
					"c_code" =>$row["c_code"],
					"c_name" =>$row["c_name"],
					"c_comment" =>$row["c_comment"],
					"i_enable" =>$row["i_enable"],
					"i_delete" =>$row["i_delete"],
					"dc_user_create_id" =>$row["dc_user_create_id"],
					"dc_user_create_cost_id" =>$row["dc_user_create_cost_id"],
					"d_create" =>$row["d_create"],
					"dc_user_update_id" =>$row["dc_user_update_id"],
					"dc_user_update_cost_id" =>$row["dc_user_update_cost_id"],
					"d_update" =>$row["d_update"]);
	${$root}[] = $temp;
}
$sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
echo json_encode(array("debug"=>true,"totalCount"=>$totalCount,$root=>${$root}));

function get($a){ return isset($a) && !empty($a)?$a:null; }
?>