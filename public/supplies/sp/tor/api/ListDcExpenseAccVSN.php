<?php
// echo 'test' ;exit; 
include("../../conf/config.php");
include("../conf/configDc.php");
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
// $table	= "vw_dc_expense_acc_vsn";
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
if (!$util->get($sort)) {  	$sort 	= "i_enable,c_code"; }

#################################
$arrParam = array();
$arrCountParam =  array();

$sqlTempTable = "
    SELECT 
        ROW_NUMBER() OVER (ORDER BY c_code) AS row 
        ,am_mode_id
        ,c_code
        ,c_code_ref
        ,c_name
        ,dc_acc_id
        ,(SELECT TOP 1 c_code+' '+c_name FROM NMU..vw_dc_acc aa WHERE aa.dc_acc_id  =  a.dc_acc_id AND aa.i_enable = 1) AS dc_acc_name
        ,dc_acc1_id
        ,(SELECT TOP 1 c_code+' '+c_name FROM NMU..vw_dc_acc aa WHERE aa.dc_acc_id  =  a.dc_acc1_id AND aa.i_enable = 1) AS dc_acc1_name
        ,dc_acc2_id
        ,(SELECT TOP 1 c_code+' '+c_name FROM NMU..vw_dc_acc aa WHERE aa.dc_acc_id  =  a.dc_acc2_id AND aa.i_enable = 1) AS dc_acc2_name
        ,dc_acc3_id
        ,(SELECT TOP 1 c_code+' '+c_name FROM NMU..vw_dc_acc aa WHERE aa.dc_acc_id  =  a.dc_acc3_id AND aa.i_enable = 1) AS dc_acc3_name
        ,dc_acc4_id
        ,(SELECT TOP 1 c_code+' '+c_name FROM NMU..vw_dc_acc aa WHERE aa.dc_acc_id  =  a.dc_acc4_id AND aa.i_enable = 1) AS dc_acc4_name
        ,i_enabled
    FROM am_mode_acc a 
    WHERE 1 = 1 ".$util->viewAcc($i_read);

// $arrParam[] = 1;

if($mode=="SEARCH"){
    if (isset($filter)&&$filter!="")
    {
        $sqlTempTable .= " and ".$filter." like ?";
        $arrParam[] = "%{$value}%";
    }
}
$arrCountParam = $arrParam;
$arrParam[] = $start;
$arrParam[] = $limit;

$sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
// /******echo sql******/
// $sql = (@$sqlMain) ? $sqlMain : $sql;
// $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());

// $sql = str_replace('?', '#-#', $sql);
// foreach ($arr as $fld => $value) {
//     $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
// }
// echo $sql; exit;
// /********************/
$stmt = $db->QueryParam($sqlMain, $arrParam);
$i = $start + 1;
while($row =$db->Fetch($stmt))				
{
    $temp = array("no" => ($i++), 
    "row"				=>	$row["row"],
    "id"		=>	$row["am_mode_id"],
    "c_code"			=>	$row["c_code"],
    "c_code_ref"		=>	$row["c_code_ref"],
    "c_name"			=>	$row["c_name"],
    "dc_acc_id"			=>	$row["dc_acc_id"],
    "dc_acc_name"		=>	$row["dc_acc_name"],
    "dc_acc1_id"		=>	$row["dc_acc1_id"],
    "dc_acc1_name"		=>	$row["dc_acc1_name"],
    "dc_acc2_id"		=>	$row["dc_acc2_id"],
    "dc_acc2_name"		=>	$row["dc_acc2_name"],
    "dc_acc3_id"		=>	$row["dc_acc3_id"],
    "dc_acc3_name"		=>	$row["dc_acc3_name"],
    "dc_acc4_id"		=>	$row["dc_acc4_id"],
    "dc_acc4_name"		=>	$row["dc_acc4_name"],
    "i_enabled"			=>	$row["i_enabled"],
            );
    ${$root}[] = $temp;
}
$sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
echo json_encode(array("debug"=>true,"totalCount"=>$totalCount,$root=>${$root}));

function get($a){ return isset($a) && !empty($a)?$a:null; }
?>