<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

###################
$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();
##########################################################################################
$mode	= @$_REQUEST["mode"];
$filter = @$_REQUEST["filter"];
$value	= @$_REQUEST["value"];
$i_read	= @$_REQUEST["i_read"];
###################
$table	= "vw_dc_tax_def";
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
if (!$util->get($sort)) {  	$sort 	= "c_name"; }
###################

$sqlTempTable = "SELECT {$table}.dc_tax_def_id
                    , {$table}.dc_product_group_id
                    , isnull(b.c_name, '<font color=red>ไม่ได้ระบุ</font>') as group_name
                    , {$table}.dc_tax_id
                    , {$table}.dc_acc_id
                    , {$table}.c_name
                    , {$table}.c_comment
                    , {$table}.i_enable
                    ,(SELECT f_tax_rate FROM dc_tax WHERE dc_tax_id = {$table}.dc_tax_id) as tax_rate
                    ,(SELECT c_code+' '+c_name FROM dc_acc WHERE dc_acc_id = {$table}.dc_acc_id) as acc_name
                    ,(SELECT top 1 c_full_name FROM dc_user WHERE dc_user_id={$table}.dc_user_create_id) as c_create_name
                    ,(SELECT top 1 c_name FROM dc_cost WHERE dc_cost_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
                    , CONVERT(varchar, {$table}.d_create, 120) as d_create
                    ,(SELECT top 1 c_full_name FROM dc_user WHERE dc_user_id={$table}.dc_user_update_id) as c_update_name
                    ,(SELECT top 1 c_name FROM dc_cost WHERE dc_cost_id={$table}.dc_user_update_cost_id) as c_cost_update_name
                    , CONVERT(varchar, {$table}.d_update, 120) as d_update 
                    , ROW_NUMBER() OVER (ORDER BY {$table}.$sort $dir) as row 
                FROM {$table} 
                    LEFT JOIN dc_product_group b on {$table}.dc_product_group_id = b.dc_product_group_id
                WHERE 1 = ?".$util->viewAcc($i_read);

if($mode=="SEARCH"){
    if (isset($filter)&&$filter!="")
    {
        $sqlTempTable .= " and ".$filter." like ?";
    }
    $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";

    // parameter ของ ชุดแสดงรายการ
    $arrParam = array(1, "%{$value}%", $start, $limit);
    // parameter ของ ชุดนับจำนวนรายการ
    $arrCountParam =  array(1, "%{$value}%");
}
else
{
    $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
    // parameter ของ ชุดแสดงรายการ
    $arrParam = array(1, $start, $limit);
    // parameter ของ ชุดนับจำนวนรายการ
    $arrCountParam =  array(1);
}

$stmt = $db->QueryParam($sqlMain, $arrParam);
$i = $start + 1;
while($row =$db->Fetch($stmt))				
{
	$temp = array("no" => ($i++), 
                        "id" => $row["dc_tax_def_id"],
                        "dc_product_group_id" => $row["dc_product_group_id"],
                        "group_name" => $row["group_name"],
                        "dc_tax_id" => $row["dc_tax_id"],
                        "dc_acc_id" => $row["dc_acc_id"],
                        "c_name" => $row["c_name"],
                        "tax_rate" => $row["tax_rate"],
                        "txtdc_acc_idID" => $row["acc_name"],
                        "c_comment" => $row["c_comment"],
                        "i_enable" => $row["i_enable"],
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