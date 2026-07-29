<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../../lib/mon/mon.class.php");
include("../conf/configDc.php");	
include("../../gl/conf/configGl.php");
 

$db = new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();
$mon 	= new mon(); // convert floatval
############################################################################################################
$mode	= @$_REQUEST["mode"];
$filter = @$_REQUEST["filter"];
$value	= @$_REQUEST["value"];
$i_read	= @$_REQUEST["i_read"];

###################
$limit 	= @$_REQUEST["limit"];
$dir 	= @$_REQUEST["dir"];
$sort 	= @$_REQUEST["sort"];
$start 	= @$_REQUEST["start"];
###################
if (!$util->get($start)) { 	$start 	= 0; }
if (!$util->get($limit)) { 	$limit 	= 15; }else{ $limit=($limit+$start); }
if (!$util->get($dir))	{   $dir 	= "ASC"; }
if (!$util->get($sort)) {  	$sort 	= "c_code"; }
################### 
$root	= "data";
$debug = ''; 
$totalCount =0;
function get($a){ return isset($a) && !empty($a)?$a:null; }

if($_REQUEST['type'] == 'storeAccExpense') { 
    $table	= "vw_dc_acc";
    $root	= "data";
    $data	= array();
    $sqlTempTable = "select dc_acc_id
                        , c_code
                        , c_name 
                        ,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
                        ,(select top 1 c_name from dc_acc where dc_acc_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
                        , convert(varchar, d_create, 120) as d_create
                        ,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
                        ,(select top 1 c_name from dc_acc where dc_acc_id={$table}.dc_user_update_cost_id) as c_cost_update_name
                        , convert(varchar, [d_update], 120) as d_update
                        , ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table}
                    where i_last=? and ISNULL(i_enable,".STATUS_DISABLE.") = ?";
 
    if($mode=="SEARCH"){ 
        if(isset($value) && $value !="")
        { 
            $sqlTempTable .= " and ".$filter." like ?"; 
        }
        $sqlMain    = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
        $arrParam   =  array(DC_LAST_YES, STATUS_ENABLE, "%{$value}%", $start, $limit); 
        $arrCountParam 	=  array(DC_LAST_YES, STATUS_ENABLE,"%{$value}%");
    } else {
        $sqlMain    = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
        $arrParam   = array(DC_LAST_YES, STATUS_ENABLE,$start, $limit); 
        $arrCountParam 	= array(DC_LAST_YES, STATUS_ENABLE);
    }
 
    $stmt 	= $db->QueryParam($sqlMain, $arrParam);
    $i 		= $start + 1; 
    while($row =$db->Fetch($stmt))
    {
        $temp = array("no" => ($i++),
                        "id" => $row["dc_acc_id"],
                        "c_code" => $row["c_code"],
                        "c_name" => $row["c_name"] 
        );
        ${$root}[] = $temp;
    }
    $sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug		='storeAccExpense >>>';
}
 //storeCoppyPeriod
echo json_encode(array("success"=>true, "debug"=>$debug,"totalCount"=>$totalCount, $root=>(isset(${$root}) && ${$root}!=null)?${$root}:''));
exit;
?>