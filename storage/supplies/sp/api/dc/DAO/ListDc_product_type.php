<?php
include("../../../../conf/config.php");
//include("../../../../access/checkSession.php");
include("../../../../lib/database/DatabaseServer.php");
include("../../../../lib/database/apiUtil.php");
include("../../../../lib/date/i_date.class.php");

###################
$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();
############################################################################################################
$mode = @$_REQUEST["mode"];
$filter = @$_REQUEST["filter"];
$value = @$_REQUEST["value"];
$i_read = @$_REQUEST["i_read"];
###################
$root = "data";
$data = [];
###################
$limit = @$_REQUEST["limit"];
$dir = @$_REQUEST["dir"];
$sort = @$_REQUEST["sort"];
$start = @$_REQUEST["start"];
###################
if (!$util->get($start)) {
    $start = 0;
}
if (!$util->get($limit)) {
    $limit = 20;
} else {
    $limit = ($limit + $start);
}
if (!$util->get($dir)) {
    $dir = "ASC";
}
if (!$util->get($sort)) {
    $sort = "i_enabled desc,c_code";
}

#################################
$i_groupArr = ["1" => "โฆษณา", "2" => "เช่าเวลา"];
$class_arr = ["1" => "โทรทัศน์", "2" => "วิทยุ", "3" => "รายได้จากการร่วมดำเนินกิจการ", "6" => "โครงการพิเศษ (โครงการ)", "5" => "รายได้ที่เป็นงวด", "4" => "รายได้อื่นๆ"];


$arrParam = [];
$arrCountParam = [];

$sqlTempTable = "select dc_product_type_id
    , dc_product_class_id
    , dc_product_group_id
    , i_group_type
    , i_class_type
    , isnull(region_type,0) as region_type
    , c_code
    , c_name
    , c_comment
    , i_is_comm
    , dc_cost_id
    ,(select c_code+' '+c_name from dc_cost where i_enabled=1 and dc_cost_id=dc_product_type.dc_cost_id) as txtdc_cost_idID
    , i_enabled
    ,(select top 1 c_full_name from dc_user where dc_user_id=dc_product_type.create_id) as c_create_name
    ,(select top 1 c_name from dc_cost where dc_cost_id=dc_product_type.create_org_id) as c_cost_creat_name
    , convert(varchar, t_create_dt, 120) as d_create
    ,(select top 1 c_full_name from dc_user where dc_user_id=dc_product_type.update_id) as c_update_name
    ,(select top 1 c_name from dc_cost where dc_cost_id=dc_product_type.update_org_id) as c_cost_update_name
    , convert(varchar, t_update_dt, 120) as d_update
    , row_number() over (order by $sort $dir) as row
from dc_product_type
where 1 = ?" . $util->viewAcc($i_read);



$arrParam[] = 1;
if ($mode == "SEARCH") {
    if (isset($filter) && $filter != "") {
        $sqlTempTable .= " and " . $filter . " like ?";
        $arrParam[] = "%{$value}%";
    }
}

$arrCountParam = $arrParam;
$arrParam[] = $start;
$arrParam[] = $limit;


$sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
$stmt = $db->QueryParam($sqlMain, $arrParam);
$i = $start + 1;
while ($row = $db->Fetch($stmt)) {
    $temp = ["no" => ($i++),
        "id" => $row["dc_product_type_id"],
        "dc_product_class_id" => $row["dc_product_class_id"],
        "dc_product_group_id" => $row["dc_product_group_id"],
        "dc_cost_id" => $row["dc_cost_id"],
        "txtdc_cost_idID" => $row["txtdc_cost_idID"],
        "i_group_type" => $row["i_group_type"],
        "i_class_type" => $row["i_class_type"],
        "region_type" => $row["region_type"],
        "i_is_comm" => $row["i_is_comm"],
        "c_code" => $row["c_code"],
        "c_name" => $row["c_name"],
        "i_enable" => $row["i_enabled"],
        "dc_user_create_id" => $row["c_create_name"],
        "dc_user_create_cost_id" => $row["c_cost_creat_name"],
        "d_create" => $date->extDateBuddha($row["d_create"]),
        "dc_user_update_id" => $row["c_update_name"],
        "dc_user_update_cost_id" => $row["c_cost_update_name"],
        "d_update" => $date->extDateBuddha($row["d_update"])
    ];
    $data[] = $temp;
}
$sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
echo json_encode(["debug" => true, "totalCount" => $totalCount, "data" => $data]);

function get($a) {
    return isset($a) && !empty($a) ? $a : null;
}
?>