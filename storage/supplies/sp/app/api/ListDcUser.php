<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();
############################################################################################################
$mode = @$_REQUEST["mode"];
$filter = @$_REQUEST["filter"];
$value = @$_REQUEST["value"];
$i_read = @$_REQUEST["i_read"];
###################
$table = "dc_user";
$root = "data";
$data = array();

$limit = @$_REQUEST["limit"];
$dir = @$_REQUEST["dir"];
$sort = @$_REQUEST["sort"];
$start = @$_REQUEST["start"];

if (!get($start)) {
    $start = 0;
}
if (!get($limit)) {
    $limit = 20;
} else {
    $limit = ($limit + $start);
}
if (!get($dir)) {
    $dir = "ASC";
}
if (!get($sort)) {
    $sort = "{$table}.c_user_name";
}
$is_audit = ($_SESSION['user_id'] == 1) ? true : false;

if ($is_audit) {
    $waudit = "";
} else {
    $waudit = " and b.dc_user_id = " . $_SESSION['user_id'];
}

$sqlTempTable = "select {$table}.dc_user_id
                    ,{$table}.dc_emp_id
                    ,isnull({$table}.dc_menu_hdr_id,0) as menu_hdr_id
                    ,{$table}.dc_cost_id
                    ,{$table}.c_full_name as c_name
                    ,{$table}.c_user_name						
                    ,{$table}.c_comment
                    ,{$table}.i_type_user
                    ,{$table}.i_enable
                    ,{$table}.i_delete 

                    ,(select top 1 c_name from NMU_DATACENTER..vw_dc_user_show_name where dc_user_id={$table}.dc_user_id) as c_full_name 
                    ,(select top 1 c_email from NMU_DATACENTER..dc_emp where dc_emp_id={$table}.dc_emp_id) as c_email 
                    ,(select top 1 c_sub_name_eng from NMU_DATACENTER..dc_emp where dc_emp_id={$table}.dc_emp_id) as c_sub_name_eng

                    ,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
                    ,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
                    , convert(varchar, d_create, 120) as d_create
                    ,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
                    ,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_update_cost_id) as c_cost_update_name
                    , convert(varchar, [d_update], 120) as d_update 
                    , ROW_NUMBER() OVER (ORDER BY CASE WHEN dc_user.dc_user_id =" . $_SESSION['user_id'] . " THEN -1 ELSE 0 END,
                    dc_user.c_user_name ASC) as row "
                . "FROM NMU_DATACENTER..{$table} where ISNULL({$table}.i_delete," . DELETE_FALSE . ") = ?";

if ($mode == "SEARCH") {
    if (isset($filter) && $filter != "" && $value != "") {
        $sqlTempTable .= " and " . $filter . " like ?";
    }

    $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
    // parameter ของ ชุดแสดงรายการ
    $arrParam = array(DELETE_FALSE, "%{$value}%", $start, $limit);
    // parameter ของ ชุดนับจำนวนรายการ
    $arrCountParam = array(DELETE_FALSE, "%{$value}%");
} else if ($mode == "LastGenDoc") {

        $sqlTempTable .= " and dc_user_id in ("
                . "select a.dc_user_id from dbo.sp_sign_doc_dtl a
                inner join dbo.sp_sign_doc_hdr h on h.sp_sign_doc_hdr_id = a.sp_sign_doc_hdr_id 
                group by a.dc_user_id
        )";
  
    $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
    // parameter ของ ชุดแสดงรายการ
    $arrParam = array(DELETE_FALSE, $start, $limit);
    // parameter ของ ชุดนับจำนวนรายการ
    $arrCountParam = array(DELETE_FALSE);
} else {
    $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
    // parameter ของ ชุดแสดงรายการ
    $arrParam = array(DELETE_FALSE, $start, $limit);
    // parameter ของ ชุดนับจำนวนรายการ
    $arrCountParam = array(DELETE_FALSE);
}
// echo $db->debugSql($sqlMain, $arrParam);
//exit;
$stmt = $db->QueryParam($sqlMain, $arrParam);

$i = $start + 1;
$rc = array(1 => array());
while ($row = $db->Fetch($stmt)) {
    $sqlSub = " select top 1 a.[type_id],a.[page],a.[position_x],a.[position_y],b.line, b.dc_user_id	,b.full_name	,b.position_name	
            ,b.action	,b.org_name , convert(varchar, b.sign_date, 120) as sign_date  	
            ,b.row	,b.col
                from sp_sign_type a
                inner join sp_sign_type_document b on b.sp_sign_type_id = a.sp_sign_type_id
                where a.[type_id]= ? and b.dc_user_id = ? 
                order by a.[type_id],b.line ";
//     echo $db->debugSql($sqlSub, array(1,$row["dc_user_id"]));
//exit;            

    $rs = $db->GetDataBySQL($sqlSub, array(1, $row["dc_user_id"]));
    $temp = array("no" => ($i++),
        "type_id" => $rs["type_id"],
        "page" => $rs["page"],
        "position_x" => $rs["position_x"],
        "position_y" => $rs["position_y"],
        "line" => $rs["line"],
        "full_name" => $rs["full_name"],
        "position_name" => $rs["position_name"],
        "action" => $rs["action"],
        "org_name" => $rs["org_name"],
        "sign_date" => $date->extDateBuddha(date('Y-m-d')),
        "id" => $row["dc_user_id"],
        "dc_user_id" => $row["dc_user_id"],
        "dc_emp_id" => $row["dc_emp_id"],
        "dc_cost_id" => $row["dc_cost_id"],
        "menu_hdr_id" => $row["menu_hdr_id"],
        "c_email" => $row["c_email"],
//        "c_position" => $row["c_position"],
        "c_sub_name_eng" => $row["c_sub_name_eng"],
        "c_name" => $row["c_name"],
        "c_user_name" => $row["c_user_name"],
        "c_full_name" => $row["c_full_name"],
        "c_comment" => $row["c_comment"],
        "i_type_user" => $row["i_type_user"],
        "i_enable" => $row["i_enable"],
        "i_delete" => $row["i_delete"],
        "dc_user_create_id" => $row["c_create_name"],
        "dc_user_create_cost_id" => $row["c_cost_creat_name"],
        "d_create" => $date->extDateBuddha($row["d_create"]),
        "dc_user_update_id" => $row["c_update_name"],
        "dc_user_update_cost_id" => $row["c_cost_update_name"],
        "d_update" => $date->extDateBuddha($row["d_update"])
    );
    ${$root}[] = $temp;
}
$sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));

function get($a) {
    return isset($a) && !empty($a) ? $a : null;
}

?>