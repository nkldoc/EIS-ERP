<?php
include("../../conf/config.php");
include("../conf/configAR.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

###################
$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();
############################################################################################################
$mode	= @$_REQUEST["mode"];
$filter = @$_REQUEST["filter"];
$value	= @$_REQUEST["value"];
$i_read	= @$_REQUEST["i_read"];
###################
$table	= "dc_product_group";
$root	= "data";
$data	= array();
###################
$limit 	= @$_REQUEST["limit"];
$dir 	= @$_REQUEST["dir"];
$sort 	= @$_REQUEST["sort"];
$start 	= @$_REQUEST["start"];
###################
if (!$util->get($start)) { 	$start 	= 0; }
if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }
if (!$util->get($dir))	{   $dir 	= "ASC"; }
if (!$util->get($sort)) {  	$sort 	= "c_code"; }
################### $arr_ar_class_type
 
$sqlTempTable = "select dc_product_group_id
					,dc_product_class_id
					,(select top 1 c_name from dc_product_class where dc_product_class_id={$table}.dc_product_class_id) as product_class_name
					,c_code
					,c_name
					,i_class_type
					,case i_class_type 
						when ".AR_CLASS_TYPE_TV." then '".$arr_ar_class_type[AR_CLASS_TYPE_TV]."'
						when ".AR_CLASS_TYPE_RADIO." then '".$arr_ar_class_type[AR_CLASS_TYPE_RADIO]."'
						when ".AR_CLASS_TYPE_JOIN." then '".$arr_ar_class_type[AR_CLASS_TYPE_JOIN]."'
						when ".AR_CLASS_TYPE_PROJECT." then '".$arr_ar_class_type[AR_CLASS_TYPE_PROJECT]."'
						when ".AR_CLASS_TYPE_PERIOD." then '".$arr_ar_class_type[AR_CLASS_TYPE_PERIOD]."'
						when ".AR_CLASS_TYPE_OTHER." then '".$arr_ar_class_type[AR_CLASS_TYPE_OTHER]."'
					end class_type_name
					,i_group_type
					,i_enable
					,i_delete
					,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
					,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
					, convert(varchar, d_create, 120) as d_create
					,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
					,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_update_cost_id) as c_cost_update_name
					, convert(varchar, [d_update], 120) as d_update 
					, row_number() over (order by $sort $dir) as row from {$table} 
				where isnull(i_delete,".DELETE_FALSE.") = ?".$util->viewAcc($i_read);

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
					"id" => $row["dc_product_group_id"],
					"dc_product_class_id" => $row["dc_product_class_id"],
					"product_class_name" => $row["product_class_name"],
					"c_code" => $row["c_code"],
					"c_name" => $row["c_name"],
					"i_class_type" => $row["i_class_type"],
					"class_type_name" => $row["class_type_name"],
					"i_group_type" => $row["i_group_type"],
					"i_enable" => $row["i_enable"],
					"i_delete" => $row["i_delete"],
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