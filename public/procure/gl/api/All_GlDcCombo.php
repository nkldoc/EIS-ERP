<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../../lib/mon/mon.class.php");
 	

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

if($_REQUEST['type'] == 'storeGlDcBookType') { 
	
    $sqlMain = "select gl_dc_book_type_id  
                        , c_name  
                from vw_gl_dc_book_type
                where isnull(i_enable,".STATUS_DISABLE.") = ?
                order by c_name
                ";
    $arrParam	= array(STATUS_ENABLE); 
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i=0;
    if($stmt){
        while($row =$db->Fetch($stmt))
        {   
            $i++;
            $temp = array("id" => $row["gl_dc_book_type_id"] 
                        , "c_name" => $row["c_name"]
            );
            ${$root}[] = $temp;
        }
    }
    $totalCount = $i;
    $debug='storeGlDcBookType >>>';  
} 
else if($_REQUEST['type'] == 'storeDcDoc') { 
	
	$ww_search  = "";

	$ww_doc 	= (  ($_REQUEST["ref_id"]!='') && ($_REQUEST["ref_id"]>0)  ) ? " or dc_doc_id=".$_REQUEST["ref_id"] : "";
    
    if($mode=="SEARCH"){ 
        if(isset($value) && $value !="")
        { 
            $ww_search = " and ".$filter." like ?"; 
        }
     }	
     
    $sqlMain = "select dc_doc_id  
                        , c_code
                        , c_name
                from dc_doc
                where dc_doc_id not in (select dc_doc_id from gl_dc_book_doc where i_delete=?)  $ww_doc $ww_search
                order by c_code
                ";
    $arrParam	= array(STATUS_DISABLE,"%{$value}%"); 
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i=0;
    if($stmt){
        while($row =$db->Fetch($stmt))
        {   
            $i++;
            $temp = array("id" => $row["dc_doc_id"] 
                        , "c_code" => $row["c_code"] 
                        , "c_name" => $row["c_name"]
            );
            ${$root}[] = $temp;
        }
    }
    $totalCount = $i;
    $debug='storeDcDoc >>>';  
} 


 //storeCoppyPeriod
echo json_encode(array("success"=>true, "debug"=>$debug,"totalCount"=>$totalCount, $root=>(isset(${$root}) && ${$root}!=null)?${$root}:''));
exit;
?>
