<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

###################
$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();
############################################################################################################
$mode	= @$_REQUEST["mode"];
$i_read	= @$_REQUEST["i_read"];
$cancel_name = @$_REQUEST["cancel_name"];
$d_begin	= @$_REQUEST["d_begin"];
$d_end		= @$_REQUEST["d_end"];
###################
$table	= "am_cancel_hdr";
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
###################
	
$sqlTempTable = "select c_code
                    , cancel_name
                    ,(select top 1 c_full_name from dc_user where dc_user_id={$table}.cancel_id) as c_cancel_name
                    ,(select top 1 c_name from dc_cost where dc_cost_id={$table}.cancel_org_id) as c_cancel_cost_name
                    , convert(varchar, cancel_date, 120) as cancel_date
                    , ROW_NUMBER() OVER (ORDER BY cancel_date $dir) as row FROM {$table} 
                where 1 = ?".$util->viewAcc($i_read);

if($mode=="SEARCH"){
    $d_begin 	= substr($d_begin,0,10);
    $d_end 		= substr($d_end,0,10);

    $sqlTempTable .= " and cancel_name like ? 
                        and cancel_date between ? and ? ";

    $sqlMain	= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";

    // parameter ของ ชุดแสดงรายการ
    $arrParam = array(1, "%{$cancel_name}%", $d_begin, $d_end, $start, $limit);
    // parameter ของ ชุดนับจำนวนรายการ
    $arrCountParam =  array(1, "%{$cancel_name}%", $d_begin, $d_end);
} else {
    $sqlMain	= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
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
                        "c_code" => $row["c_code"],
                        "cancel_name" => $row["cancel_name"],
                        "c_cancel_name" =>$row["c_cancel_name"],
                        "c_cancel_cost_name" =>$row["c_cancel_cost_name"],
                        "cancel_date" =>$date->extDateBuddha($row["cancel_date"])
                    );
	${$root}[] = $temp;
}
$sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
echo json_encode(array("debug"=>true,"totalCount"=>$totalCount,$root=>${$root}));

function get($a){ return isset($a) && !empty($a)?$a:null; }
?>