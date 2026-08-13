<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

###################
$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();
########################################################################## 
$table	= "vw_dc_vat";
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

$con		= null;
$i 			= 0;
$mode		= @$_REQUEST["mode"];
$i_enable 	= @$_REQUEST["i_enable"];

$limit 	= @$_REQUEST["limit"];
$start 	= @$_REQUEST["start"];

if (!get($start))	{ $start	= 0; }
if (!get($limit))	{ $limit	= 100; }else{ $limit=($limit+$start); }

$arrParam[] = 1; 
if($mode == "SEARCH") {
	
	if($i_enable > 0){
		$con	.= " AND i_enable = ?";
		$arrParam[]	= $i_enable;
	}
}

$arrParam[]	= $start;
$arrParam[]	= $limit;

$sqlTempTable = "SELECT c_code
                    ,c_name
                    ,(select top 1 c_code+' '+c_name from dc_acc where dc_acc_id={$table}.dc_acc_id) as dc_acc_sale_name
                    ,(select top 1 c_code+' '+c_name from dc_acc where dc_acc_id={$table}.dc_acc_income_id) as dc_acc_income
                    ,f_vat_rate
                    ,i_enable
                    , ROW_NUMBER() OVER (ORDER BY $sort $dir) as row 
                FROM {$table} 
                where 1 = ? ".$con;

$sqlMain = "SELECT * FROM ({$sqlTempTable}) a WHERE a.row > ? AND a.row <= ?"; 
$stmt = $db->QueryParam($sqlMain, $arrParam);
while($row =$db->Fetch($stmt))				
{
	$temp = array("no" => ($i++),
                        "c_code" 		=> $row["c_code"],
                        "c_name" 		=> $row["c_name"],
                        "dc_acc_sale_name"	=> $row["dc_acc_sale_name"],
                        "dc_acc_income"		=> $row["dc_acc_income"],
                        "f_vat_rate" 		=> number_format($row["f_vat_rate"],2),
                        "i_enable" 		=> $row["i_enable"]
                        );
	${$root}[] = $temp;
}

$sqlCount = "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a"; 
$totalCount = $db->GetDataBySQL($sqlCount, $arrParam);

echo json_encode(array("success"=>true, "totalCount"=>$totalCount, $root=>${$root}));

function get($a){ return isset($a) && !empty($a)?$a:null; }
?>