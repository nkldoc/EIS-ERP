<?php
include("../conf/configTax.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

###################
$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();
########################################################################## 
$table	= "vw_dc_tax";
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

$con		= null;
$i 			= 0;
$mode		= @$_REQUEST["mode"];
$i_enable 	= @$_REQUEST["i_enable"];

$limit 	= @$_REQUEST["limit"];
$start 	= @$_REQUEST["start"];

if (!get($start))	{ $start	= 0; }
if (!get($limit))	{ $limit	= 100; }else{ $limit=($limit+$start); }

$arrParam[]	= 1; 
if($mode == "SEARCH") {
	
	if($i_enable > 0){
		$con	.= " AND a.i_enable = ?";
		$arrParam[]	= $i_enable;
	}
}

$arrParam[]	= $start;
$arrParam[]	= $limit;

$sqlTempTable = "select a.c_code 
                    , a.c_name
                    , a.f_tax_rate as f_amount
                    , CASE i_type_whtax	
                            WHEN ".TAX_BY_RATE." THEN 'หักตามอัตราภาษี'
                            WHEN ".TAX_BY_PROGRESS." THEN 'หักตามอัตราก้าวหน้า'
                            WHEN ".TAX_BY_M48." THEN 'หักตามเกณฑ์มาตรา 48'
                            WHEN ".TAX_BY_PENSION." THEN 'หัก ณ ที่จ่ายจากบำเหน็จ'
                            WHEN ".TAX_BY_NONE." THEN 'ไม่หัก ณ ที่จ่าย'
                            ELSE ''
                      END as whtax_name
                    , a.i_enable
                    , isnull(b.c_code, '')+' '+isnull(b.c_name, '') as acc_name
                    , ROW_NUMBER() OVER (ORDER BY a.{$sort} {$dir}) as row
                from {$table} a
                        left join dc_acc b on a.dc_acc_id = b.dc_acc_id
                where 1 = ? ".$con;
	
$sqlMain = "SELECT * FROM ({$sqlTempTable}) a WHERE a.row > ? AND a.row <= ?"; 
$stmt = $db->QueryParam($sqlMain, $arrParam);
while($row =$db->Fetch($stmt))				
{
	$temp = array("no" => ($i++),
                        "c_code" 	=> $row["c_code"],
                        "c_name" 	=> $row["c_name"],
                        "f_amount" 	=> number_format($row["f_amount"],2),
                        "whtax_name" 	=> $row["whtax_name"],
                        "i_enable" 	=> $row["i_enable"],
                        "acc_name" 	=> $row["acc_name"]
                    );
	${$root}[] = $temp;
}

$sqlCount = "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a"; 
$totalCount = $db->GetDataBySQL($sqlCount, $arrParam);

echo json_encode(array("success"=>true, "totalCount"=>$totalCount, $root=>${$root}));

function get($a){ return isset($a) && !empty($a)?$a:null; }
?>