<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../../lib/mon/mon.class.php");
include("../conf/configTax.php");	
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

 if($_REQUEST['type'] == 'storeDcTaxIncomeParent') {
    $table	= "vw_dc_tax_income";
    $root	= "data";
    $data	= array();

    $sqlTempTable = "SELECT dc_tax_income_id, c_code, c_name
                        , ROW_NUMBER() OVER (ORDER BY c_code ASC) as row FROM {$table}
                    WHERE i_enable = ? and i_is_method= ? ";
    $arrParam = array();
    $arrParam[] = STATUS_ENABLE;
    $arrParam[] = DC_TAX_INCOME_METHOD_ISSUM;
    
    if($mode=="SEARCH"){
        if(isset($filter) && $filter !=""){ 
            $sqlTempTable .= " and ".$filter." like ?"; 
        }else {
            $sqlTempTable .= " and c_code like ?";
        }
        $arrParam[]   =  "%{$value}%"; 
    }
    $sqlMain        = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
    $arrCountParam  = $arrParam;
    $arrParam[]     = $start;
    $arrParam[]     = $limit; 
    
    $stmt 	= $db->QueryParam($sqlMain, $arrParam);
    $i 		= $start + 1;

    if (@$_REQUEST["i_all"])
    {
        $txtAll = (@$_REQUEST["all_text"] != "")? $_REQUEST["all_text"] : "เลือกรายการ";
        $temp = array("no" => 0,
                        "id" => "0",
                        "c_code" => "",
                        "c_name" => $txtAll,
                        "c_code_name" => $txtAll
        );
        ${$root}[] = $temp;
    }
    while($row =$db->Fetch($stmt))
    {
        $temp = array("no" => ($i++),
                        "id" => $row["dc_tax_income_id"],
                        "c_code" => $row["c_code"],
                        "c_name" => $row["c_name"], 
                        "c_code_name" => $row["c_code"]." ".$row["c_name"]
        );
        ${$root}[] = $temp;
    }
    $sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug	='storeDcTaxIncomeParent >>>';
                
} else if($_REQUEST['type'] == 'storeDcAcc') {
    $table	= "vw_dc_acc";
    $root	= "data";
    $data	= array();
    $i_condi    = @$_REQUEST["i_condi"];
    
    $sqlTempTable = "SELECT dc_acc_id, c_code, c_name
                        , ROW_NUMBER() OVER (ORDER BY c_code ASC) as row FROM {$table}
                    WHERE i_enable = ? and i_last = ? and isnull(c_code,'0') !='0' ";
    $arrParam = array();
    $arrParam[] = STATUS_ENABLE;
    $arrParam[] = I_LAST;
    
    switch($i_condi)
    {
        case 1 ://หมวดภาษีที่ 1
            $sqlTempTable .= " and left(c_code, 1) = ?";
            $arrParam[] = GL_ACC_GROUP1_ASSET; // หมวดผังบัญชีสินทรัพย์ จาก gl/conf/configGl.php
            break;
        case 2 : //หมวดภาษีที่ 2
            $sqlTempTable .= " and left(c_code, 1) = ?";
            $arrParam[] = GL_ACC_GROUP2_DEBT; // หมวดผังบัญชีหนี้สิน จาก gl/conf/configGl.php
            break;
        case 3 : //หมวดภาษีที่ 1 และ 2
            $sqlTempTable .= " and left(c_code, 1) in (?, ?) ";
            $arrParam[] = GL_ACC_GROUP1_ASSET; // หมวดผังบัญชีสินทรัพย์ จาก gl/conf/configGl.php
            $arrParam[] = GL_ACC_GROUP2_DEBT; // หมวดผังบัญชีหนี้สิน จาก gl/conf/configGl.php
            break;
    }
    if($mode=="SEARCH"){
        if(isset($filter) && $filter !=""){ 
            $sqlTempTable .= " and ".$filter." like ?"; 
        }else {
            $sqlTempTable .= " and c_code like ?";
        }
        $arrParam[]   =  "%{$value}%"; 
    }
    $sqlMain        = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
    $arrCountParam  = $arrParam;
    $arrParam[]     = $start;
    $arrParam[]     = $limit; 
    
    $stmt 	= $db->QueryParam($sqlMain, $arrParam);
    $i 		= $start + 1;

    if (@$_REQUEST["i_all"])
    {
        $txtAll = (@$_REQUEST["all_text"] != "")? $_REQUEST["all_text"] : "เลือกรายการ";
        $temp = array("no" => 0,
                        "id" => "0",
                        "c_code" => "",
                        "c_name" => $txtAll,
                        "c_code_name" => $txtAll
        );
        ${$root}[] = $temp;
    }
    while($row =$db->Fetch($stmt))
    {
        $temp = array("no" => ($i++),
                        "id" => $row["dc_acc_id"],
                        "c_code" => $row["c_code"],
                        "c_name" => $row["c_name"], 
                        "c_code_name" => $row["c_code"]." ".$row["c_name"]
        );
        ${$root}[] = $temp;
    }
    $sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug	='storeDcAcc >>>';
                
} else if($_REQUEST['type'] == 'storeDcTaxRef') {
    $table	= "vw_dc_tax";
    $root	= "data";
    $data	= array();

    $sqlTempTable = "SELECT dc_tax_id, c_code, c_name
                        , ROW_NUMBER() OVER (ORDER BY c_code ASC) as row FROM {$table}
                    WHERE i_enable = ? and i_type_whtax= ? ";
    $arrParam = array();
    $arrParam[] = STATUS_ENABLE;
    $arrParam[] = TAX_BY_PROGRESS;
    
    if($mode=="SEARCH"){
        if(isset($filter) && $filter !=""){ 
            $sqlTempTable .= " and ".$filter." like ?"; 
        }else {
            $sqlTempTable .= " and c_code like ?";
        }
        $arrParam[]   =  "%{$value}%"; 
    }
    $sqlMain        = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
    $arrCountParam  = $arrParam;
    $arrParam[]     = $start;
    $arrParam[]     = $limit; 
    
    $stmt 	= $db->QueryParam($sqlMain, $arrParam);
    $i 		= $start + 1;

    if (@$_REQUEST["i_all"])
    {
        $txtAll = (@$_REQUEST["all_text"] != "")? $_REQUEST["all_text"] : "เลือกรายการ";
        $temp = array("no" => 0,
                        "id" => "0",
                        "c_code" => "",
                        "c_name" => $txtAll,
                        "c_code_name" => $txtAll
        );
        ${$root}[] = $temp;
    }
    while($row =$db->Fetch($stmt))
    {
        $temp = array("no" => ($i++),
                        "id" => $row["dc_tax_id"],
                        "c_code" => $row["c_code"],
                        "c_name" => $row["c_name"], 
                        "c_code_name" => $row["c_code"]." ".$row["c_name"]
        );
        ${$root}[] = $temp;
    }
    $sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug	='storeDcTaxRef >>>';
                
} else if($_REQUEST['type'] == 'storeDcSectionTax') {
    $table	= "vw_dc_section_tax";
    $root	= "data";
    $data	= array();

    $sqlTempTable = "SELECT dc_section_tax_id, c_code, c_name
                        , ROW_NUMBER() OVER (ORDER BY c_code ASC) as row FROM {$table}
                    WHERE i_enable = ?";
    $arrParam = array();
    $arrParam[] = STATUS_ENABLE;
    
    if($mode=="SEARCH"){
        if(isset($filter) && $filter !=""){ 
            $sqlTempTable .= " and ".$filter." like ?"; 
        }else {
            $sqlTempTable .= " and c_code like ?";
        }
        $arrParam[]   =  "%{$value}%"; 
    }
    $sqlMain        = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
    $arrCountParam  = $arrParam;
    $arrParam[]     = $start;
    $arrParam[]     = $limit; 
    
    $stmt 	= $db->QueryParam($sqlMain, $arrParam);
    $i 		= $start + 1;

    if (@$_REQUEST["i_all"])
    {
        $txtAll = (@$_REQUEST["all_text"] != "")? $_REQUEST["all_text"] : "เลือกรายการ";
        $temp = array("no" => 0,
                        "id" => "0",
                        "c_code" => "",
                        "c_name" => $txtAll,
                        "c_code_name" => $txtAll
        );
        ${$root}[] = $temp;
    }
    while($row =$db->Fetch($stmt))
    {
        $temp = array("no" => ($i++),
                        "id" => $row["dc_section_tax_id"],
                        "c_code" => $row["c_code"],
                        "c_name" => $row["c_name"], 
                        "c_code_name" => $row["c_code"]." ".$row["c_name"]
        );
        ${$root}[] = $temp;
    }
    $sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug	='storeDcSectionTax >>>';
                
} else if($_REQUEST['type'] == 'storeDcTax') {
    $table	= "vw_dc_tax";
    $root	= "data";
    $data	= array();

    $sqlTempTable = "SELECT dc_tax_id, c_code, c_name
                        , ROW_NUMBER() OVER (ORDER BY c_code ASC) as row FROM {$table}
                    WHERE i_enable = ?";
    $arrParam = array();
    $arrParam[] = STATUS_ENABLE;
    
    if($mode=="SEARCH"){
        if(isset($filter) && $filter !=""){ 
            $sqlTempTable .= " and ".$filter." like ?"; 
        }else {
            $sqlTempTable .= " and c_code like ?";
        }
        $arrParam[]   =  "%{$value}%"; 
    }
    $sqlMain        = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
    $arrCountParam  = $arrParam;
    $arrParam[]     = $start;
    $arrParam[]     = $limit; 
    
    $stmt 	= $db->QueryParam($sqlMain, $arrParam);
    $i 		= $start + 1;

    if (@$_REQUEST["i_all"])
    {
        $txtAll = (@$_REQUEST["all_text"] != "")? $_REQUEST["all_text"] : "เลือกรายการ";
        $temp = array("no" => 0,
                        "id" => "0",
                        "c_code" => "",
                        "c_name" => $txtAll,
                        "c_code_name" => $txtAll
        );
        ${$root}[] = $temp;
    }
    while($row =$db->Fetch($stmt))
    {
        $temp = array("no" => ($i++),
                        "id" => $row["dc_tax_id"],
                        "c_code" => $row["c_code"],
                        "c_name" => $row["c_name"], 
                        "c_code_name" => $row["c_code"]." ".$row["c_name"]
        );
        ${$root}[] = $temp;
    }
    $sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug	='storeDcTax >>>';
                
} else if($_REQUEST['type'] == 'storeDcProductGroup') {
    $table	= "vw_dc_product_group";
    $root	= "data";
    $data	= array();

    $sqlTempTable = "SELECT dc_product_group_id, c_code, c_name
                        , ROW_NUMBER() OVER (ORDER BY c_code ASC) as row FROM {$table}
                    WHERE i_enable = ?";
    $arrParam = array();
    $arrParam[] = STATUS_ENABLE;
    
    if($mode=="SEARCH"){
        if(isset($filter) && $filter !=""){ 
            $sqlTempTable .= " and ".$filter." like ?"; 
        }else {
            $sqlTempTable .= " and c_code like ?";
        }
        $arrParam[]   =  "%{$value}%"; 
    }
    $sqlMain        = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
    $arrCountParam  = $arrParam;
    $arrParam[]     = $start;
    $arrParam[]     = $limit; 
    
    $stmt 	= $db->QueryParam($sqlMain, $arrParam);
    $i 		= $start + 1;

    if (@$_REQUEST["i_all"])
    {
        $txtAll = (@$_REQUEST["all_text"] != "")? $_REQUEST["all_text"] : "เลือกรายการ";
        $temp = array("no" => 0,
                        "id" => "0",
                        "c_code" => "",
                        "c_name" => $txtAll,
                        "c_code_name" => $txtAll
        );
        ${$root}[] = $temp;
    }
    while($row =$db->Fetch($stmt))
    {
        $temp = array("no" => ($i++),
                        "id" => $row["dc_product_group_id"],
                        "c_code" => $row["c_code"],
                        "c_name" => $row["c_name"], 
                        "c_code_name" => $row["c_code"]." ".$row["c_name"]
        );
        ${$root}[] = $temp;
    }
    $sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug	='storeDcProductGroup >>>';
                
}
 //storeCoppyPeriod
echo json_encode(array("success"=>true, "debug"=>$debug,"totalCount"=>$totalCount, $root=>(isset(${$root}) && ${$root}!=null)?${$root}:''));
exit;
?>