<?php
//include("../../../../../conf/config.php");
include("../../../../../access/checkSession.php");
include("../../../../../lib/database/DatabaseServer.php");
include("../../../../../lib/database/apiUtil.php");
include("../../../../../lib/date/i_date.class.php");

###################
$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

$mode = $_REQUEST["mode"] ?? NULL;
$filter = $_REQUEST["filter"] ?? NULL;
$value = $_REQUEST["value"] ?? NULL;
$i_read = $_REQUEST["i_read"] ?? NULL;
$alisInfo = null;
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
    $limit = 15;
} else {
    $limit = ($limit + $start);
}
if (!$util->get($dir)) {
    $dir = "ASC";
}
if (!$util->get($sort)) {
    $sort = "c_code";
}
###################
$root = "data";
$debug = '';
$totalCount = 0;

$getStore = $_REQUEST["getStore"] ?? null;
if ($getStore == "dc_pro_class") {

    $sqlMain = "select dc_product_class_id , c_code , c_name
                from dbo.dc_product_class
                where isnull(i_enabled," . STATUS_DISABLE . ")=? order by c_name
        ";

    $arrParam = [STATUS_ENABLE];
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = 0;


    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $i++;
            $temp = ["no" => (int) $i
                , "id" => (int) $row["dc_product_class_id"]
                , "c_code" => $row["c_code"]
                , "c_name" => $row["c_name"]
            ];
            $data[] = $temp;
        }
    }
    $totalCount = $i;
    $debug = 'dc_pro_class >>>';

    echo json_encode(["success" => true, "debug" => $debug, "totalCount" => $totalCount, "data" => (isset($data) && $data != null) ? $data : '']);
    exit;
} else if ($getStore == "dc_ar_adjust") {

    $sqlMain = "select dc_ar_adjust_id , c_code , c_name
                from dbo.dc_ar_adjust
                where isnull(i_enabled," . STATUS_DISABLE . ")=? order by c_name
        ";

    $arrParam = [STATUS_ENABLE];
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = 0;

    if ($mode == "All") {
        $data[] = ["no" => -1
            , "id" => -1
            , "c_code" => "All"
            , "c_name" => "ทั้งหมด"
        ];
    }
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $i++;
            $temp = ["no" => (int) $i
                , "id" => (int) $row["dc_ar_adjust_id"]
                , "c_code" => $row["c_code"]
                , "c_name" => $row["c_name"]
            ];
            $data[] = $temp;
        }
    }
    $totalCount = $i;
    $debug = 'dc_ar_adjust >>>';

    echo json_encode(["success" => true, "debug" => $debug, "totalCount" => $totalCount, "data" => (isset($data) && $data != null) ? $data : '']);
    exit;
} else if ($getStore == "dc_pro_kind") {
    $id = $_REQUEST["id"] ?? 0;
    $sqlMain = "select a.dc_product_type_id
            , a.c_code
            , a.c_name
            , case when isnull(b.dc_product_type_id , 0) > 0 then 1 else 0 end i_chk
    from dc_product_type a
    left join dc_product_kind_dtl b on a.dc_product_type_id = b.dc_product_type_id and b.dc_product_kind_id = ?
    where a.i_enabled = ?
    order by i_chk desc, a.c_code";

    $arrParam = [$id, STATUS_ENABLE];
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = 0;
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $i++;
            $temp = ["no" => (int) $i
                , "id" => (int) $row["dc_product_type_id"]
                , "c_code" => $row["c_code"]
                , "c_name" => $row["c_name"]
                , "i_chk" => $row["i_chk"]
            ];
            $data[] = $temp;
        }
    }
    $totalCount = $i;
    $debug = 'dc_pro_kind >>>';

    echo json_encode(["success" => true, "debug" => $debug, "totalCount" => $totalCount, "data" => (isset($data) && $data != null) ? $data : '']);
    exit;
} else if ($getStore == "dc_pro_group") {
    $sqlMain = "select dc_product_group_id , c_code , c_name
                from dbo.dc_product_group
                where isnull(i_enabled," . STATUS_DISABLE . ")=? order by c_name
        ";

    $arrParam = [STATUS_ENABLE];
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = 0;
    $data[] = ["id" => 0,
        "c_code" => "",
        "c_name" => "-- กรุณาเลือกกลุ่มรายได้ --"
    ];
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $i++;
            $temp = ["no" => (int) $i
                , "id" => (int) $row["dc_product_group_id"]
                , "c_code" => $row["c_code"]
                , "c_name" => $row["c_name"]
            ];
            $data[] = $temp;
        }
    }
    $totalCount = $i;
    $debug = 'dc_pro_group >>>';

    echo json_encode(["success" => true, "debug" => $debug, "totalCount" => $totalCount, "data" => (isset($data) && $data != null) ? $data : '']);
    exit;
} else if ($getStore == "storeDcChanel") {
    $sqlMain = "select dc_channel_id , isnull(c_code,'') as c_code , c_name_show as c_name
                from dbo.dc_channel
                where isnull(i_enabled," . STATUS_DISABLE . ")=? order by c_name
        ";

    $arrParam = [STATUS_ENABLE];
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = 0;
    $data[] = ["id" => 0,
        "c_code" => "",
        "c_name" => "-- กรุณาเลือกใบอนุญาต กสทช --"
    ];
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $i++;
            $temp = ["no" => (int) $i
                , "id" => (int) $row["dc_channel_id"]
                , "c_code" => $row["c_code"]
                , "c_name" => $row["c_name"]
            ];
            $data[] = $temp;
        }
    }
    $totalCount = $i;
    $debug = 'storeDcChanel >>>';

    echo json_encode(["success" => true, "debug" => $debug, "totalCount" => $totalCount, "data" => (isset($data) && $data != null) ? $data : '']);
    exit;
} else if ($getStore == "storeDcCntType") {
    $sqlMain = "select dc_cnt_type_id
        , c_code
        , c_name
                from dbo.dc_cnt_type
                where isnull(i_enabled," . STATUS_DISABLE . ")=? order by c_name
        ";

    $arrParam = [STATUS_ENABLE];
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = 0;
//    $data[] = array("id" => 0,
//        "c_code" => "",
//        "c_name" => "-- กรุณาประเภทลูกค้า--"
//    );
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $i++;
            $temp = ["no" => (int) $i
                , "id" => (int) $row["dc_cnt_type_id"]
                , "c_code" => $row["c_code"]
                , "c_name" => $row["c_code"] . " " . $row["c_name"]
            ];
            $data[] = $temp;
        }
    }
    $totalCount = $i;
    $debug = 'storeDcCntType >>>';

    echo json_encode(["success" => true, "debug" => $debug, "totalCount" => $totalCount, "data" => (isset($data) && $data != null) ? $data : '']);
    exit;
} else if ($getStore == "storeDcProvince") {
    $sqlMain = "select dc_province_id, c_code,c_name from dbo.dc_province ";
    $arrParam = [STATUS_ENABLE];
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = 0;
    $data[] = ["id" => 0,
        "c_code" => "",
        "c_name" => "-- กรุณาเลือกจังหวัด --"
    ];
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $i++;
            $temp = ["no" => (int) $i
                , "id" => (int) $row["dc_province_id"]
                , "c_code" => $row["c_code"]
                , "c_name" => $row["c_name"]
            ];
            $data[] = $temp;
        }
    }
    $totalCount = $i;
    $debug = 'storeDcProvince >>>';

    echo json_encode(["success" => true, "debug" => $debug, "totalCount" => $totalCount, "data" => (isset($data) && $data != null) ? $data : '']);
    exit;
} else if ($getStore == "storeCostProductRadio") {
    $sqlMain = "select dc_cost_id, c_code, c_name
                        from dbo.dc_cost
                        where i_enabled='1'
                        and i_is_order='1'
                        and i_enabled='1'
                        and i_type_region_radio='2'
                        order by c_name ASC
                      ";

    $arrParam = [STATUS_ENABLE];
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = 0;
    $data[] = ["id" => 0,
        "c_code" => "",
        "c_name" => "-- กรุณาเลือกหน่วยที่ออกอากาศ --"
    ];
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $i++;
            $temp = ["no" => (int) $i
                , "id" => (int) $row["dc_cost_id"]
                , "c_code" => $row["c_code"]
                , "c_name" => $row["c_name"]
            ];
            $data[] = $temp;
        }
    }
    $totalCount = $i;
    $debug = 'storeCostProductRadio >>>';

    echo json_encode(["success" => true, "debug" => $debug, "totalCount" => $totalCount, "data" => (isset($data) && $data != null) ? $data : '']);
    exit;
} else if ($getStore == "storeDcUnitType") {

    $sqlMain = "select dc_unit_type_id, c_code, c_name from dbo.dc_unit_type where i_enabled = 1 and i_is_unit_type !=1 order by c_name";
    $arrParam = [STATUS_ENABLE];
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = 0;
    $data[] = ["id" => 0,
        "c_code" => "",
        "c_name" => "-- กรุณาเลือกหน่วยนับ --"
    ];
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $i++;
            $temp = ["no" => (int) $i
                , "id" => (int) $row["dc_unit_type_id"]
                , "c_code" => $row["c_code"]
                , "c_name" => $row["c_name"]
            ];
            $data[] = $temp;
        }
    }
    $totalCount = $i;
    $debug = 'storeDcUnitType >>>';

    echo json_encode(["success" => true, "debug" => $debug, "totalCount" => $totalCount, "data" => (isset($data) && $data != null) ? $data : '']);
    exit;
} else if ($getStore == 'storeProType') {

    $table = "dbo.dc_product_type";
    $root = "data";
    $data = [];

    $sqlTempTable = "select dc_product_type_id
		, c_code
		, c_name
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.create_id) as c_create_name
		,(select top 1 c_name from dc_acc where dc_acc_id={$table}.create_org_id) as c_cost_creat_name
		, convert(varchar, t_create_dt, 120) as d_create
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.update_id) as c_update_name
		,(select top 1 c_name from dc_acc where dc_acc_id={$table}.update_org_id) as c_cost_update_name
		, convert(varchar, [t_update_dt], 120) as d_update
		, ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table}
		where ISNULL(i_enabled," . STATUS_DISABLE . ") = ?";

    if ($mode == "SEARCH") {
        if (isset($value) && $value != "") {
            $sqlTempTable .= " and " . $filter . " like ?";
        }
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [STATUS_ENABLE, "%{$value}%", $start, $limit];
        $arrCountParam = [STATUS_ENABLE, "%{$value}%"];
    } else {
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [STATUS_ENABLE, $start, $limit];
        $arrCountParam = [STATUS_ENABLE];
    }

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    while ($row = $db->Fetch($stmt)) {

        $temp = ["no" => ($i++),
            "id" => $row["dc_product_type_id"],
            "c_code" => $row["c_code"],
            "c_name" => $row["c_name"]
        ];
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'dc_product_type >>>';
    echo json_encode(["success" => true, "debug" => $debug, "totalCount" => $totalCount, $root => (isset(${$root}) && ${$root} != null) ? ${$root} : '']);
    exit;
} else if ($getStore == 'storeAcc') {

    $table = "dbo.dc_acc";
    $root = "data";
    $data = [];
    $w = "i_is_last=1";
    $sqlTempTable = "select dc_acc_id
		, c_code
		, c_name
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.create_id) as c_create_name
		,(select top 1 c_name from dc_acc where dc_acc_id={$table}.create_org_id) as c_cost_creat_name
		, convert(varchar, t_create_dt, 120) as d_create
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.update_id) as c_update_name
		,(select top 1 c_name from dc_acc where dc_acc_id={$table}.update_org_id) as c_cost_update_name
		, convert(varchar, [t_update_dt], 120) as d_update
		, ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table}
		where $w and ISNULL(i_enabled," . STATUS_DISABLE . ") = ?";

    if ($mode == "SEARCH") {
        if (isset($value) && $value != "") {
            $sqlTempTable .= " and " . $filter . " like ?";
        }
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [STATUS_ENABLE, "%{$value}%", $start, $limit];
        $arrCountParam = [STATUS_ENABLE, "%{$value}%"];
    } else {
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [STATUS_ENABLE, $start, $limit];
//        echo $sqlMain; print_R($arrParam);
        $arrCountParam = [STATUS_ENABLE];
    }

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    while ($row = $db->Fetch($stmt)) {

        $temp = ["no" => ($i++),
            "id" => $row["dc_acc_id"],
            "c_code" => $row["c_code"],
            "c_name" => $row["c_name"]
        ];
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storeAcc >>>';
    echo json_encode(["success" => true, "debug" => $debug, "totalCount" => $totalCount, $root => (isset(${$root}) && ${$root} != null) ? ${$root} : '']);
    exit;
} else if ($getStore == 'storeCreditor') {

    $table = "dbo.dc_creditor";
    $root = "data";
    $data = [];
    $sqlTempTable = "select dc_cnt_id
		, c_code
		, c_name
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.create_id) as c_create_name
		,(select top 1 c_name from dc_acc where dc_acc_id={$table}.create_org_id) as c_cost_creat_name
		, convert(varchar, t_create_dt, 120) as d_create
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.update_id) as c_update_name
		,(select top 1 c_name from dc_acc where dc_acc_id={$table}.update_org_id) as c_cost_update_name
		, convert(varchar, [t_update_dt], 120) as d_update
		, ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table}
		where ISNULL(i_enabled," . STATUS_DISABLE . ") = ?";

    if ($mode == "SEARCH") {
        if (isset($value) && $value != "") {
            $sqlTempTable .= " and " . $filter . " like ?";
        }
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [STATUS_ENABLE, "%{$value}%", $start, $limit];
        $arrCountParam = [STATUS_ENABLE, "%{$value}%"];
    } else {
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [STATUS_ENABLE, $start, $limit];
//        echo $sqlMain; print_R($arrParam);
        $arrCountParam = [STATUS_ENABLE];
    }

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    while ($row = $db->Fetch($stmt)) {

        $temp = ["no" => ($i++),
            "id" => $row["dc_cnt_id"],
            "c_code" => $row["c_code"],
            "c_name" => $row["c_name"]
        ];
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storeCreditor >>>';
    echo json_encode(["success" => true, "debug" => $debug, "totalCount" => $totalCount, $root => (isset(${$root}) && ${$root} != null) ? ${$root} : '']);
    exit;
}

function get($a) {
    return isset($a) && !empty($a) ? $a : null;
}
?>