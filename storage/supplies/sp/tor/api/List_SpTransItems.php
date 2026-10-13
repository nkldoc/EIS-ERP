<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

###################
$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();
##########################################
########################################### 
$root = "data";
$data = array();
 
#################################
$arrParam = array();
$arrCountParam = array(); 
$wh = null; 
$type = $_REQUEST["type"] ?? null; 
$i = 0; 
$sp_tranf_hdr_id = $_REQUEST['sp_tranf_hdr_id'] ?? null;

if ($type == "List_SpTransItems") {

     

    
    $sqlMain = "select sp_tranf_item_id
                        , sp_check_period_dtl_id
                        , sp_tranf_hdr_id
                        , am_mode_id
                        , inv_mode_id	
                        , sp_tor_dtl_period_id
                        , c_name
                        , i_workin_process
                        , i_qty
                        , i_is_under
                        , f_wip_total_price
                        , f_under_total_price
                        , f_net_total_price
                        , sp_check_period_hdr_id
                        , i_type_acc
                        , i_is_inv from dbo.sp_tranf_item where sp_tranf_hdr_id = ? order by sp_tranf_item_id desc";
//     echo $sqlTempTable;
//    exit;

    $arrParam[] = $sp_tranf_hdr_id;
  
    
//             print_r($arrParam);
//    echo $sqlMain;
//    exit;

    $stmt = $db->QueryParam($sqlMain, $arrParam);
     
   $i=1;
    while ($row = $db->Fetch($stmt)) {
 
        $temp = array(
            "no" => $i++,
            "id" => intval($row["sp_tranf_item_id"]),
            "sp_check_period_dtl_id" => intval($row["sp_check_period_dtl_id"]),
            "sp_tranf_hdr_id" => intval($row["sp_tranf_hdr_id"]), 
            "am_mode_id" => intval($row["am_mode_id"]), 
            "inv_mode_id" => intval($row["inv_mode_id"]), 
            "sp_tor_dtl_period_id" => intval($row["sp_tor_dtl_period_id"]), 
            "c_name" => $row["c_name"],
            "i_workin_process" => $row["i_workin_process"],
            "i_qty" => $row["i_qty"],
            "i_is_under" => $row["i_is_under"],
            "f_wip_total_price" => $row["f_wip_total_price"], 
            "f_under_total_price" => $row["f_under_total_price"], 
            "f_net_total_price" => $row["f_net_total_price"], 
            "sp_check_period_hdr_id" => $row["sp_check_period_hdr_id"], 
            "i_is_inv" => $row["i_is_inv"], 
            "i_type_acc" => $row["i_type_acc"], 
        );
        ${$root}[] = $temp;
    }
 
    $totalCount = $i; 
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
    exit();
}