<?php

include("../../../../../conf/config.php");
//include("../../../../../access/checkSession.php");
include("../../../../../lib/database/DatabaseServer.php");
include("../../../../../lib/database/apiUtil.php");
include("../../../../../lib/date/i_date.class.php");
include("../../../../../lib/mon/mon.class.php");
include("../../../../../ar/conf/configAR.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();
$mon = new mon(); // convert floatval
############################################################################################################
$mode = $_REQUEST["mode"] ?? NULL;
$filter = $_REQUEST["filter"] ?? NULL;
$value = $_REQUEST["value"] ?? NULL;
$i_read = $_REQUEST["i_read"] ?? NULL;
$alisInfo = null;
###################
$limit = @$_REQUEST["limit"] ?? NULL;
$dir = @$_REQUEST["dir"] ?? NULL;
$sort = @$_REQUEST["sort"] ?? NULL;
$start = @$_REQUEST["start"] ?? NULL;
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

function get($a) {
    return $a ?? NULL;
}

$_REQUEST['type'] = $_REQUEST['type'] ?? null;

$i_class_type = $_POST['i_class_type'] ?? null;
$i_type_region = $_POST['i_type_region'] ?? null;

//region

if ($i_class_type == AR_CLASS_TYPE_RADIO && $i_type_region == AR_PROCUT_TYPE_REGION) {
    $view = $util->viewAcc(2);
} else if ($i_class_type == AR_PROCUT_TYPE_REGION && $i_type_region == AR_PROCUT_TYPE_CENTER) {
    $view = $util->viewAcc(3); //center
} else {
    $view = $util->viewAcc(3); //tv
}

//echo $view;
//exit;
if ($_REQUEST['type'] == "bh_contract") {
    $dc_cnt_id = $_REQUEST["dc_cnt_id"] ?? null;
    $arrParam[] = $dc_cnt_id;
    $arrParam[] = STATUS_ENABLE;

    $root = "data";
    $debug = null;
    $totalCount = null;

    $sqlMain = "select bh_contract_id
            , c_code_egp
            , c_code_mcot
            , c_code_mcot+ +c_code_egp as c_name
                            from vw_bh_contract
                                where dc_cnt_id=?
                                and i_enable = ?
                            order by bh_contract_id";


    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = 0;
    ${$root}[] = ["id" => 0,
        "c_code" => "",
        "c_name" => "-- กรุณาเลือก --"
    ];
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $i ++;
            $temp = ["id" => $row["bh_contract_id"]
                , "c_code" => $row["c_code_egp"]
                , "c_name" => $row["c_name"]
            ];
            ${$root}[] = $temp;
        }
    }
//  dfg
    $totalCount = $i;
    $debug = 'bh_contract_id >>>';
    echo json_encode(["success" => true, "debug" => $debug, "totalCount" => $totalCount, $root => (isset(${$root}) && ${$root} != null) ? ${$root} : '']);
    exit;
} else if ($_REQUEST['type'] == 'storeCostFormRo') {
    ###################
    $sort = "c_code";
    $dir = "DESC";
    $table = "dc_cost";
    $root = "data";
    $data = [];

    $sqlTempTable = "select {$table}.dc_cost_id
		, {$table}.c_code
		, {$table}.c_name
		, {$table}.dc_area_id
                ,(select top 1 c_name from dbo.dc_business_area where dc_area_id={$table}.dc_area_id) as c_area_name
                , {$table}.create_id ,{$table}.create_org_id ,{$table}.t_create_dt ,{$table}.update_id ,{$table}.update_org_id ,{$table}.t_update_dt
		, ROW_NUMBER() OVER (ORDER BY $sort $dir) as row
                FROM dbo.{$table}
		where i_is_last = 1 and i_is_tv = 2 and ISNULL(i_enabled," . STATUS_ENABLE . ") = ?";

    if ($mode == "SEARCH") {
        if (isset($value) && $value != "") {
            $sqlTempTable .= " and " . $filter . " like ?";
        }
        $sqlMain = "select a.* from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [STATUS_ENABLE, "%{$value}%", $start, $limit];
        $arrCountParam = [STATUS_ENABLE, "%{$value}%"];
    } else {
        $sqlMain = "select a.* from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [STATUS_ENABLE, $start, $limit];
        $arrCountParam = [STATUS_ENABLE];
    }

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;

    if (isset($_REQUEST['all'])) {
        ${$root}[] = ["no" => 0,
            "id" => -1,
            "c_code" => "",
            "c_name" => "ทั้งหมด"
        ];
    }

    while ($row = $db->Fetch($stmt)) {

        $temp = ["no" => ($i ++),
            "id" => $row["dc_cost_id"],
            "c_area_name" => $row["c_area_name"] ?? NULL,
            "dc_area_id" => $row["dc_area_id"],
            "c_code" => $row["c_code"],
            "c_name" => $row["c_name"]
        ];
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storeCostFormRo i_is_last = 1 and i_s_tv = 2 >>>';
} else if ($_REQUEST['type'] == 'storeCost') {
    ###################
    $table = "dbo.dc_cost";
    $root = "data";
    $data = [];

    $sqlTempTable = "select {$table}.dc_cost_id
		, {$table}.c_code
		, {$table}.c_name
                , {$table}.dc_area_id
		, ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table}
		where i_is_last=1 and ISNULL(i_enabled," . STATUS_ENABLE . ") = ?";
    if ($mode == "SEARCH") {
// 			$value = (isset($_REQUEST['query']) && !empty($_REQUEST['query']))?$_REQUEST['query']:$value;
        if (isset($value) && $value != "") {
            $sqlTempTable .= " and " . $filter . " like ?";
        }
        $sqlMain = "select *"
                . " , (select top 1 c_name from dbo.dc_business_area where dc_area_id=a.dc_area_id) as c_area_name"
                . " from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [STATUS_ENABLE, "%{$value}%", $start, $limit];
        $arrCountParam = [STATUS_ENABLE, "%{$value}%"];
    } else {
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [STATUS_ENABLE, $start, $limit];
        $arrCountParam = [STATUS_ENABLE];
    }

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;

    if (isset($_REQUEST['all'])) {
        ${$root}[] = ["no" => 0,
            "id" => -1,
            "c_code" => "",
            "c_name" => "ทั้งหมด"
        ];
    }

    while ($row = $db->Fetch($stmt)) {

        $temp = ["no" => ($i ++),
            "id" => $row["dc_cost_id"],
            "c_area_name" => $row["c_area_name"] ?? null,
            "dc_area_id" => $row["dc_area_id"],
            "c_code" => $row["c_code"],
            "c_name" => $row["c_name"]
        ];
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storeCost >>>';
} else if ($_REQUEST['type'] == 'storeCostProduct') {
    ###################
    $table = "dbo.dc_cost";
    $root = "data";
    $data = [];

    $sqlTempTable = "select {$table}.dc_cost_id
		, {$table}.c_code
		, {$table}.c_name
                , {$table}.dc_area_id
		, ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table}
		where i_is_order=1 and ISNULL(i_enabled," . STATUS_ENABLE . ") = ?";

    if ($mode == "SEARCH") {
// 			$value = (isset($_REQUEST['query']) && !empty($_REQUEST['query']))?$_REQUEST['query']:$value;
        if (isset($value) && $value != "") {
            $sqlTempTable .= " and " . $filter . " like ?";
        }
        $sqlMain = "select *"
                . " , (select top 1 c_name from dbo.dc_business_area where dc_area_id=a.dc_area_id) as c_area_name"
                . " from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [STATUS_ENABLE, "%{$value}%", $start, $limit];
        $arrCountParam = [STATUS_ENABLE, "%{$value}%"];
    } else {
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [STATUS_ENABLE, $start, $limit];
        $arrCountParam = [STATUS_ENABLE];
    }

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;

    if (isset($_REQUEST['all'])) {
        ${$root}[] = ["no" => 0,
            "id" => -1,
            "c_code" => "",
            "c_name" => "ทั้งหมด"
        ];
    }

    while ($row = $db->Fetch($stmt)) {

        $temp = ["no" => ($i ++),
            "id" => $row["dc_cost_id"],
            "c_area_name" => $row["c_area_name"] ?? null,
            "dc_area_id" => $row["dc_area_id"],
            "c_code" => $row["c_code"],
            "c_name" => $row["c_name"]
        ];
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storeCostProduct >>>';
} else if ($_REQUEST['type'] == 'vatStore') {

    $sqlMain = "select dc_vat_id
                        , c_code
                        , c_name
                        , isnull(f_vat_rate,0) as f_vat_rate
                from dbo.dc_vat
                where isnull(i_enabled," . STATUS_DISABLE . ") = ?
                order by dc_vat_id
				";
    $arrParam = [STATUS_ENABLE];
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = 0;
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $i ++;
            $temp = ["id" => $row["dc_vat_id"]
                , "c_code" => $row["c_code"]
                , "f_vat_rate" => $row["f_vat_rate"]
                , "c_name" => $row["c_name"]
            ];
            ${$root}[] = $temp;
        }
    }
    $totalCount = $i;
    $debug = 'vatStore >>>';
} else if ($_REQUEST['type'] == 'dc_unit_type') { //select * from //dc_vat where end_date is null and i_enabled='1'
    $sqlMain = "select dc_unit_type_id
						, c_code
						, c_name
					from dbo.dc_unit_type
					where isnull(i_enabled," . STATUS_DISABLE . ") = ?
					order by dc_unit_type_id
				";
    $arrParam = [STATUS_ENABLE];
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = 0;
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $i ++;
            $temp = ["id" => $row["dc_unit_type_id"]
                , "c_code" => $row["c_code"]
                , "c_name" => $row["c_name"]
            ];
            ${$root}[] = $temp;
        }
    }
    $totalCount = $i;
    $debug = 'dc_unit_type >>>';
} else if ($_REQUEST['type'] == 'closeBillStore') { //select * from //dc_vat where end_date is null and i_enabled='1'
    $sqlMain = "sselect * from dbo.ar_close_bill_hdr where i_close_bill=0 and i_is_center=? and bill_yyyy_mm=?";
    $arrParam = [$_REQUEST['i_is_center'], $_REQUEST['c_yyyy_mm']];
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = 0;
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $i ++;
            $temp = ["id" => $row["ar_close_bill_hdr_id"]
                , "c_code" => $row["c_code"]
                , "bill_yyyy_mm" => $row["bill_yyyy_mm"]
                , "i_close_bill" => $row["i_close_bill"]
                , "i_is_center" => $row["i_is_center"]
            ];
            ${$root}[] = $temp;
        }
    }
    $totalCount = $i;
    $debug = 'vatStore >>>';
} else if ($_REQUEST['type'] == 'storeAcc') {
    /* i_enabled
      create_id
      create_org_id
      t_create_dt
      update_id
      update_org_id
      t_update_dt
     */
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
        $arrCountParam = [STATUS_ENABLE];
    }

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    while ($row = $db->Fetch($stmt)) {

        $temp = ["no" => ($i ++),
            "id" => $row["dc_acc_id"],
            "c_code" => $row["c_code"],
            "c_name" => $row["c_name"]
        ];
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storeAcc >>>';
} else if ($_REQUEST['type'] == 'storeCostFormNoOrder') {

    ###################


    $table = "dbo.dc_cost";
    $root = "data";
    $data = [];

    $sqlTempTable = "select dc_cost_id
		, c_code
		, c_name
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.create_id) as c_create_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.create_org_id) as c_cost_creat_name
		, convert(varchar, t_create_dt, 120) as d_create
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.update_id) as c_update_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.update_org_id) as c_cost_update_name
		, convert(varchar, [t_update_dt], 120) as d_update
		, ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table}
		where i_last=1 and ISNULL(i_enabled," . STATUS_ENABLE . ") = ?";

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

        $temp = ["no" => ($i ++),
            "id" => $row["dc_cost_id"],
            "c_code" => $row["c_code"],
            "c_name" => $row["c_name"]
        ];
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storeCostFormNoOrder >>>';
} else if ($_REQUEST['type'] == 'storeDebtor') {

    ###################
    //$table	= "dbo.vw_dc_cnt";
    $table = "dc_debtor";
    $root = "data";
    $data = [];
    $sqlTempTable = "select dc_debtor_id
                , dc_title_id
		, c_code
		, c_name
                , c_address
		, c_telephone
		, c_mobile
		, c_fax
		, c_ref_value
		, c_tax_value
		, c_website
		, c_email
		, c_name_inv, isnull(c_address_inv2,'') as c_address_inv2, c_address_inv, due_bill
 		$alisInfo
		, ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM dbo.{$table}
		where ISNULL(i_enabled," . STATUS_ENABLE . ") = ?";
    /* echo $sqlTempTable; exit; */
    if ($mode == "SEARCH") {

        if (isset($value) && $value != "") {
            $sqlTempTable .= " and " . $filter . " like ?";
        }
        $sqlMain = "select *"
                . ", "
                . "(select top 1 c_name "
                . " from dc_title "
                . " where ISNULL(i_enabled," . STATUS_ENABLE . ") = 1 "
                . " and dc_title_id=a.dc_title_id) as c_title "
                . " from ({$sqlTempTable}) a"
                . " WHERE a.row > ? and a.row <= ?";
        $arrParam = [STATUS_ENABLE, "%{$value}%", $start, $limit];
        $arrCountParam = [STATUS_ENABLE, "%{$value}%"];
    } else {
        $sqlMain = "select a.*, "
                . "(select top 1 c_name "
                . " from dc_title "
                . " where ISNULL(i_enabled," . STATUS_ENABLE . ") = 1 "
                . " and dc_title_id=a.dc_title_id) as c_title "
                . " from ({$sqlTempTable}) a "
                . " WHERE a.row > ? and a.row <= ?";
        $arrParam = [STATUS_ENABLE, $start, $limit];
        $arrCountParam = [STATUS_ENABLE];
    }

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;

    if (isset($_REQUEST['all'])) {
        ${$root}[] = ["no" => 0,
            "id" => -1,
            "c_code" => "",
            "c_name" => "ทั้งหมด"
        ];
    }

    while ($row = $db->Fetch($stmt)) {
        /* , , , , */
        $temp = ["no" => ($i ++),
            "id" => $row["dc_debtor_id"],
            "c_title" => $row["c_title"],
            "c_code" => $row["c_code"],
            "c_name" => $row["c_name"],
            "c_address" => $row["c_address"],
            "c_telephone" => $row["c_telephone"],
            "c_mobile" => $row["c_mobile"],
            "c_fax" => $row["c_fax"],
            "c_website" => $row["c_website"],
            "c_email" => $row["c_email"],
            "c_name_inv" => $row["c_name_inv"],
            "c_address_inv" => $row["c_address_inv"],
            "c_address_inv2" => $row["c_address_inv2"],
            "due_bill" => $row["due_bill"],
            //"condition_pay"         => $row["condition_pay"]??NULL,
            "c_tax_value" => $row["c_tax_value"],
            "c_ref_value" => $row["c_ref_value"]
        ];

        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storeDebtor >>>';
} else if ($_REQUEST['type'] == 'storeBank') {

    ###################
    $table = "dbo.dc_bank";
    $root = "data";
    $data = [];

    $sqlTempTable = "select dc_bank_id
		, c_code
		, c_name
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.create_id) as c_create_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.create_org_id) as c_cost_creat_name
		, convert(varchar, t_create_dt, 120) as d_create
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.update_id) as c_update_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.update_org_id) as c_cost_update_name
		, convert(varchar, [t_update_dt], 120) as d_update
		, ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table}
		where i_enabled = 1 and ISNULL(i_delete," . DELETE_FALSE . ") = ?";

    if ($mode == "SEARCH") {
        if (isset($value) && $value != "") {
            $sqlTempTable .= " and " . $filter . " like ?";
        }
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [DELETE_FALSE, "%{$value}%", $start, $limit];
        $arrCountParam = [DELETE_FALSE, "%{$value}%"];
    } else {
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [DELETE_FALSE, $start, $limit];
        $arrCountParam = [DELETE_FALSE];
    }

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;


    while ($row = $db->Fetch($stmt)) {

        $temp = ["no" => ($i ++),
            "id" => $row["dc_bank_id"],
            "c_code" => $row["c_code"],
            "c_name" => $row["c_name"]
        ];
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storeBank >>>';
} else if ($_REQUEST['type'] == 'storeBg') {

    ###################
    $table = "dbo.bg_hdr";
    $root = "data";
    $data = [];
    if (isset($_REQUEST['i_year'])) {
        $i_year = $_REQUEST['i_year'];
    } else {
        $i_year = date("Y") + 543; // Now Buddha
    }


    $sqlTempTable = "select bg_hdr_id
		, c_code
		, c_name
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.create_id) as c_create_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.create_org_id) as c_cost_creat_name
		, convert(varchar, t_create_dt, 120) as d_create
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.update_id) as c_update_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.update_org_id) as c_cost_update_name
		, convert(varchar, [t_update_dt], 120) as d_update
		, ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table}
		where c_code like 'PJ%' and i_is_success = 1 and dc_bg_type_id = 2  and i_enabled = 1
		and bg_hdr_id in(
				 select bg_hdr_id from bg_dtl
					where i_year between ? and ?
					and (i_parent_status in (0,1) or i_parent_status is null))
		";

    if ($mode == "SEARCH") {
        if (isset($value) && $value != "") {
            $sqlTempTable .= " and " . $filter . " like ?";
        }
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [$i_year - 1, $i_year, "%{$value}%", $start, $limit];
        $arrCountParam = [$i_year - 1, $i_year, "%{$value}%"];
    } else {
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [$i_year - 1, $i_year, $start, $limit];
        $arrCountParam = [$i_year - 1, $i_year];
    }

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    while ($row = $db->Fetch($stmt)) {
        $sql = $db->GetDataBySQL("select b.c_name as cost_name,c.c_name as obj_name,d.c_name as cap_name,a.*
													from bg_hdr a left join dc_cost b
														on a.dc_cost_id = b.dc_cost_id left join dc_bg_object c
														on a.dc_bg_obj_id = c.dc_bg_obj_id left join dc_bg_capital d
														on a.dc_bg_cap_id = d.dc_bg_cap_id
													where bg_hdr_id =?", [$row["bg_hdr_id"]]);
        $yy = $db->GetDataBySQL("select min(i_year) as i_year_start
												,max(i_year) as i_year_end
											from bg_dtl
											where bg_hdr_id = ?", [$row["bg_hdr_id"]]);

        $f_amount = number_format($sql["f_begin_amount"], 2);
        $f_res = number_format($sql["f_bg_reserve"], 2);
        $sum_bg = number_format(($sql["f_begin_amount"] + $sql["f_bg_reserve"]), 2);
        $obj_name = (empty($sql["obj_name"])) ? "ไม่มีข้อมูล" : $sql["obj_name"];
        $cap_name = (empty($sql["cap_name"])) ? "ไม่มีข้อมูล" : $sql["cap_name"];


        $temp = ["no" => ($i ++),
            "id" => $row["bg_hdr_id"],
            "c_code" => $row["c_code"],
            "c_name" => $row["c_name"],
            "cost_id" => $sql["dc_cost_id"],
            "cost_name" => $sql["cost_name"],
            "f_amount" => $f_amount,
            "f_res" => $f_res,
            "sum_bg" => $sum_bg,
            "obj_name" => $obj_name,
            "dc_bg_obj_id" => $sql["dc_bg_obj_id"],
            "dc_bg_cap_id" => $sql["dc_bg_cap_id"],
            "cap_name" => $cap_name,
            "i_import" => $sql["i_is_import"],
            "i_start" => $yy["i_year_start"],
            "i_end" => $yy["i_year_end"]
        ];
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storeBg >>>';
} else if ($_REQUEST['type'] == 'storeBgDtl') {

    ###################
    $table = "dbo.bg_dtl";
    $root = "data";
    $data = [];



    $sqlTempTable = "select bg_dtl_id
		, c_name
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.create_id) as c_create_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.create_org_id) as c_cost_creat_name
		, convert(varchar, t_create_dt, 120) as d_create
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.update_id) as c_update_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.update_org_id) as c_cost_update_name
		, convert(varchar, [t_update_dt], 120) as d_update
		, ROW_NUMBER() OVER (ORDER BY c_name $dir) as row FROM {$table}
		where  bg_hdr_id = ? and i_year=? and i_is_expense='-1' ";
    /*  select bg_dtl_id,c_name from bg_dtl where bg_hdr_id = '$po_hdr[bg_hdr_id]' and i_year='$po_hdr[i_year]' and is_expense='-1' */
    if ($mode == "SEARCH") {
        if (isset($value) && $value != "") {
            $sqlTempTable .= " and " . $filter . " like ?";
        }
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [$_REQUEST['bg_hdr_id'], $_REQUEST['i_year'], "%{$value}%", $start, $limit];
        $arrCountParam = [$_REQUEST['bg_hdr_id'], $_REQUEST['i_year'], "%{$value}%"];
    } else {
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [$_REQUEST['bg_hdr_id'], $_REQUEST['i_year'], $start, $limit];
        $arrCountParam = [$_REQUEST['bg_hdr_id'], $_REQUEST['i_year'],];
    }


    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    while ($row = $db->Fetch($stmt)) {


        $bg = $db->GetDataBySQL("select a.f_unit_cost,a.bg_hdr_id,b.per_bg_reserve
								from bg_dtl
								a inner join bg_hdr b on a.bg_hdr_id=b.bg_hdr_id where a.bg_dtl_id=?"
                , [$row['bg_dtl_id']]);

        $sum_user_budget = $db->GetDataBySQL("select isnull(sum(a.f_amt_begin),0) as f_amt_begin
							from ap_po_dtl a
							inner join ap_po_hdr b on a.ap_po_hdr_id = b.ap_po_hdr_id
							where a.bg_dtl_id = ?
							and b.i_enabled = 1", [$row['bg_dtl_id']]);






        $bud_amt = $bg['f_unit_cost'];
        $per_bg = (empty($bg['per_bg_reserve'])) ? 0 : $bg['per_bg_reserve'];
        $amt_res = $mon->round54(($bud_amt * $per_bg) / 100, 4);
        $sum_bud = $bud_amt + $amt_res;
        $sum_user = $sum_user_budget;
        $balance_budget = $sum_bud - $sum_user;


        $temp = ["no" => ($i ++),
            "id" => $row["bg_dtl_id"],
            "c_name" => $row["c_name"],
            "amt_budget" => number_format($bud_amt, 2),
            "amt_reserve" => number_format($amt_res, 2),
            "sum_budget" => number_format($sum_bud, 2),
            "sum_user_budget" => number_format($sum_user, 2),
            "balance_budget" => number_format($balance_budget, 2),
            "per_bg" => $per_bg,
            "chk_budget" => null,
            "chk_reserve" => null,
            "chk_user_budget" => null
        ];
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storeBgDtl >>>';
} else if ($_REQUEST['type'] == 'storeApProcessType') {

    $sqlMain = " SELECT ap_process_type_id , c_name
							FROM dbo.ap_process_type
						WHERE i_delete = ?
							AND i_enabled=?
						ORDER by c_name";
    $arrParam = [DELETE_FALSE, STATUS_ENABLE];
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $temp = ["id" => $row["ap_process_type_id"],
                "c_name" => $row["c_name"]];
            ${$root}[] = $temp;
        }
    }
    $debug = 'storeApProcessType >>>';
} else if ($_REQUEST['type'] == 'storeTax') {

    $sqlMain = "select dc_tax_id
						, c_code
						, c_name
						, isnull(f_tax_rate,0) as f_tax_rate
						, isnull(i_type_whtax,0) as i_type_whtax
					from dbo.dc_tax
					where i_group_tax=? and i_delete =? and i_enabled = ?
					order by dc_tax_id
				";
    $arrParam = [2, DELETE_FALSE, STATUS_ENABLE];
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = 0;
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $i ++;
            $temp = ["id" => $row["dc_tax_id"]
                , "c_code" => $row["c_code"]
                , "f_tax_rate" => $row["f_tax_rate"]
                , "i_type_whtax" => $row["i_type_whtax"]
                , "c_name" => $row["c_name"]
            ];
            ${$root}[] = $temp;
        }
    }
    $totalCount = $i;
    $debug = 'storeTax >>>';
} else if ($_REQUEST['type'] == 'storeDcInv') {

    $sqlMain = "select i.dc_inv_type_id
						, i.c_code
						, i.c_name
						, u.c_name as dc_unit_type_name
						, u.dc_unit_type_id
					from dbo.dc_inv_type i
					inner join dc_unit_type u on i.dc_unit_type_id=u.dc_unit_type_id

					where i.i_is_last=1
							and i.i_delete = ?
							and i.i_enabled = ?
					and i.c_code like '" . ASSET_INV . "%' order by i.c_name asc
				";
    $arrParam = [DELETE_FALSE, STATUS_ENABLE];
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = 0;
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $i ++;
            $temp = ["id" => $row["dc_inv_type_id"]
                , "c_code" => $row["c_code"]
                , "c_name" => $row["c_name"]
                , "dc_unit_type_name" => $row["dc_unit_type_name"]
                , "dc_unit_type_id" => $row["dc_unit_type_id"]
            ];
            ${$root}[] = $temp;
        }
    }
    $totalCount = $i;
    $debug = 'storeDcInv >>>';
} else if ($_REQUEST['type'] == 'storeUnitType') {

    $sqlMain = "select dc_unit_type_id
						, c_code
						, c_name
					from dbo.dc_unit_type
					where i_delete =? and i_enabled = ?
					order by c_name
				";
    $arrParam = [DELETE_FALSE, STATUS_ENABLE];
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = 0;
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $i ++;
            $temp = ["id" => $row["dc_unit_type_id"]
                , "c_code" => $row["c_code"]
                , "c_name" => $row["c_name"]
            ];
            ${$root}[] = $temp;
        }
    }
    $totalCount = $i;
    $debug = 'storeUnitType >>>';
} else if ($_REQUEST['type'] == 'storeBgType') {
    $sqlMain = "SELECT a.dc_bg_type_id , a.c_name
						FROM dc_bg_type a
						WHERE a.i_delete = ?
								AND a.i_enabled=?
						ORDER BY a.c_name";
    $arrParam = [DELETE_FALSE, STATUS_ENABLE];
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {
        ${$root}[] = ["id" => "-1", "c_name" => "เลือกทั้งหมด"];
        while ($row = $db->Fetch($stmt)) {
            $temp = ["id" => $row["dc_bg_type_id"], "c_name" => $row["c_name"]];
            ${$root}[] = $temp;
        }
    }
    $debug = 'storeCapital >>>';
} else if ($_REQUEST['type'] == 'storePoContract') {
    ###################
    $table = "dbo.ap_po_hdr";
    $root = "data";
    $data = [];
    $dir2 = "DESC";
    $sort2 = "c_po_no";

    $sqlTempTable = "select ap_po_hdr_id
		, c_code
		, c_po_no
		, isnull(c_contract_no,'-') as c_contract_no
		, c_name
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.create_id) as c_create_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.create_org_id) as c_cost_creat_name
		, convert(varchar, t_create_dt, 120) as d_create
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.update_id) as c_update_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.update_org_id) as c_cost_update_name
		, convert(varchar, [t_update_dt], 120) as d_update
		, ROW_NUMBER() OVER (ORDER BY $sort2 $dir2) as row FROM {$table}
		where ISNULL(i_delete," . DELETE_FALSE . ") = ?
			and ISNULL(i_enabled,1) = 1
			and c_po_no is not null
		";

    if ($mode == "SEARCH") {
        if (isset($value) && $value != "") {
            $sqlTempTable .= " and " . $filter . " like ?";
        }
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [DELETE_FALSE, "%{$value}%", $start, $limit];
        $arrCountParam = [DELETE_FALSE, "%{$value}%"];
    } else {
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [DELETE_FALSE, $start, $limit];
        $arrCountParam = [DELETE_FALSE];
    }

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    while ($row = $db->Fetch($stmt)) {

        $temp = ["no" => ($i ++),
            "id" => $row["ap_po_hdr_id"],
            "c_code" => $row["c_po_no"],
            "c_contract_no" => $row["c_contract_no"],
            "c_name" => $row["c_name"]
        ];
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storePoContract >>>';
} else if ($_REQUEST['type'] == 'dc_accs') {
    // dc_acc

    $acc_inv1 = "1108010101";
    $acc_inv2 = "1108010102";
    $ww_acc = " and c_code in ('" . $acc_inv1 . "','" . $acc_inv2 . "')";

    $sqlMain = "SELECT dc_acc_id,c_code,c_name,c_name FROM dc_acc WHERE  i_last=1 AND i_delete = ? and i_enabled=1 $ww_acc ORDER BY c_code";
    $arrParam = [DELETE_FALSE];
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {
        ${$root}[] = ["id" => '0',
            "c_name" => '- เลือกทั้งหมด -'];
        while ($row = $db->Fetch($stmt)) {
            $temp = ["id" => $row["dc_acc_id"],
                "c_name" => $row["c_code"] . ' ' . $row["c_name"]];
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST['type'] == 'dc_costs') {
    // dc_cost
    $sqlMain = "SELECT dc_cost_id,c_name FROM dc_cost WHERE i_last=1 AND i_delete = ?  and i_enabled=1 ORDER BY c_code";
    $arrParam = [DELETE_FALSE];
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {
        ${$root}[] = ["id" => '0',
            "c_name" => '- เลือกทั้งหมด -'];
        while ($row = $db->Fetch($stmt)) {
            $temp = [
                "id" => $row["dc_cost_id"],
                "c_name" => $row["c_name"]
            ];
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST['type'] == 'storePj') {

    ###################
    $table = "pj_hdr";
    $root = "data";
    $data = [];

    $sqlTempTable = "select pj_hdr_id
		, c_code
		, c_name
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.create_id) as c_create_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.create_org_id) as c_cost_creat_name
		, convert(varchar, t_create_dt, 120) as d_create
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.update_id) as c_update_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.update_org_id) as c_cost_update_name
		, convert(varchar, [t_update_dt], 120) as d_update
		, ROW_NUMBER() OVER (ORDER BY c_code DESC) as row FROM {$table}
		where c_code!='' and ISNULL(i_enabled," . STATUS_ENABLE . ") = ?";

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

        $temp = ["no" => ($i ++),
            "id" => $row["pj_hdr_id"],
            "c_code" => $row["c_code"],
            "c_name" => $row["c_name"]
        ];
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storePj >>>';
} else if ($_REQUEST['type'] == 'storePackage') {

    ###################
    $table = "dbo.ar_package";
    $root = "data";
    $data = [];

    $sqlTempTable = "select ar_package_id
		, c_code
		, c_name
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.create_id) as c_create_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.create_org) as c_cost_creat_name
		, convert(varchar, t_create_dt, 120) as d_create
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.update_id) as c_update_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.update_org_id) as c_cost_update_name
		, convert(varchar, t_update_dt, 120) as d_update
		, ROW_NUMBER() OVER (ORDER BY c_code DESC) as row FROM {$table}
		where c_code!='' and ISNULL(i_enabled," . STATUS_ENABLE . ") = ?";
    /* i_enabled
      create_id
      create_org
      t_create_dt
      update_id
      update_org_id
      t_update_dt */
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

    ${$root}[] = ["no" => 0,
        "id" => -1,
        "c_code" => "",
        "c_name" => "ไม่ระบุ"
    ];

    while ($row = $db->Fetch($stmt)) {

        $temp = ["no" => ($i ++),
            "id" => $row["ar_package_id"],
            "c_code" => $row["c_code"],
            "c_name" => $row["c_name"]
        ];
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storePackage >>>';
} else if ($_REQUEST['type'] == 'storeEmpCommit') {

    ###################
    ###################
    $table = "dbo.vw_dc_comm_cost2";
    $root = "data";
    $data = [];
    $sqlTempTable = "select dc_comm_id
			, c_code
			, c_name
			, position
			, i_is_tv
			, i_is_sale_ext
			,(select top 1 c_full_name from dc_user where dc_user_id={$table}.create_id) as c_create_name
			,(select top 1 c_name from dc_cost where dc_cost_id={$table}.create_org_id) as c_cost_creat_name
			, convert(varchar, t_create_dt, 120) as d_create
			,(select top 1 c_full_name from dc_user where dc_user_id={$table}.update_id) as c_update_name
			,(select top 1 c_name from dc_cost where dc_cost_id={$table}.update_org_id) as c_cost_update_name
			, convert(varchar, [t_update_dt], 120) as d_update
			, ROW_NUMBER() OVER (ORDER BY c_name $dir) as row FROM {$table}
			where 	isnull(i_enabled,2)=1
					and i_is_last= 1
					and i_is_tv = 1
					--and dc_comm_id in (select dc_comm_id from vw_dc_comm where support_status='1')
					and i_is_sale_ext = ?";

    if ($mode == "SEARCH") {
        if (isset($value) && $value != "") {
            $sqlTempTable .= " and " . $filter . " like ?";
        }
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [0, "%{$value}%", $start, $limit];
        $arrCountParam = [0, "%{$value}%"];
    } else {
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [0, $start, $limit];
        $arrCountParam = [0];
    }

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;

    while ($row = $db->Fetch($stmt)) {

        $temp = ["no" => ($i ++),
            "id" => $row["dc_comm_id"],
            "c_code" => $row["c_code"],
            "i_is_tv" => $row["i_is_tv"],
            "i_is_sale_ext" => $row["i_is_sale_ext"],
            "c_name" => $row["c_name"] . " " . $row["position"]
        ];
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storeEmpCommit >>>';
} else if ($_REQUEST['type'] == 'storeExtCommit') {

    ###################
    $table = "dbo.vw_dc_comm_cost2";
    $root = "data";
    $data = [];
    $sqlTempTable = "select dc_comm_id
			, c_code
			, c_name
			, i_is_tv
			, i_is_sale_ext
			, position
			,(select top 1 c_full_name from dc_user where dc_user_id={$table}.create_id) as c_create_name
			,(select top 1 c_name from dc_cost where dc_cost_id={$table}.create_org_id) as c_cost_creat_name
			, convert(varchar, t_create_dt, 120) as d_create
			,(select top 1 c_full_name from dc_user where dc_user_id={$table}.update_id) as c_update_name
			,(select top 1 c_name from dc_cost where dc_cost_id={$table}.update_org_id) as c_cost_update_name
			, convert(varchar, [t_update_dt], 120) as d_update
			, ROW_NUMBER() OVER (ORDER BY c_name $dir) as row FROM {$table}
			where 	isnull(i_enabled,2)=1
					and i_is_last= 1
					and i_is_tv = 1
					and i_is_imc=0
					--and dc_comm_id in (select dc_comm_id from vw_dc_comm where support_status='1')
					and i_is_sale_ext = ?";

    if ($mode == "SEARCH") {
        if (isset($value) && $value != "") {
            $sqlTempTable .= " and " . $filter . " like ?";
        }
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [1, "%{$value}%", $start, $limit];
        $arrCountParam = [1, "%{$value}%"];
    } else {
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [1, $start, $limit];
        $arrCountParam = [1];
    }
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    while ($row = $db->Fetch($stmt)) {
        $temp = ["no" => ($i ++),
            "id" => $row["dc_comm_id"],
            "c_code" => $row["c_code"],
            "i_is_tv" => $row["i_is_tv"],
            "i_is_sale_ext" => $row["i_is_sale_ext"],
            "c_name" => $row["c_name"] . " " . $row["position"]
        ];
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storeExtCommit >>>';
} else if ($_REQUEST['type'] == 'storeEmpCommitRO') {

    ###################
    ###################
    $table = "dbo.vw_dc_comm_order";
    $root = "data";
    $data = [];
    $sqlTempTable = "select dc_comm_id
			, c_code
			, c_name
			, position
			, i_is_tv
			, i_is_sale_ext

			, ROW_NUMBER() OVER (ORDER BY c_name $dir) as row FROM {$table}
			where isnull(i_enabled,2)=1
			and i_is_last='1'
                        and i_type_region='1'
                        and i_is_tv = '0'
                        and i_is_imc='0'
                        and support_status='1'
                        and i_is_sale_ext = ?";

    if ($mode == "SEARCH") {
        if (isset($value) && $value != "") {
            $sqlTempTable .= " and " . $filter . " like ?";
        }
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [0, "%{$value}%", $start, $limit];
        $arrCountParam = [0, "%{$value}%"];
    } else {
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [0, $start, $limit];
        $arrCountParam = [0];
    }

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;

    while ($row = $db->Fetch($stmt)) {

        $temp = ["no" => ($i ++),
            "id" => $row["dc_comm_id"],
            "c_code" => $row["c_code"],
            "i_is_tv" => $row["i_is_tv"],
            "i_is_sale_ext" => $row["i_is_sale_ext"],
            "c_name" => $row["c_name"] . " " . $row["position"]
        ];
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storeEmpCommitRO >>>';
} else if ($_REQUEST['type'] == 'storeExtCommitRO') {

    ###################
    $table = "dbo.vw_dc_comm_order";
    $root = "data";
    $data = [];
    $sqlTempTable = "select dc_comm_id
			, c_code
			, c_name
			, i_is_tv
			, i_is_sale_ext
			, position
			, ROW_NUMBER() OVER (ORDER BY c_name $dir) as row FROM {$table}
			where isnull(i_enabled,2)=1
                                and i_is_last='1'
                                and i_type_region='1'
                                and i_is_tv = '0'
                                and i_is_imc='0'
                                and support_status='1'
                               and i_is_sale_ext = ?";

    if ($mode == "SEARCH") {
        if (isset($value) && $value != "") {
            $sqlTempTable .= " and " . $filter . " like ?";
        }
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [1, "%{$value}%", $start, $limit];
        $arrCountParam = [1, "%{$value}%"];
    } else {
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [1, $start, $limit];
        $arrCountParam = [1];
    }
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    while ($row = $db->Fetch($stmt)) {
        $temp = ["no" => ($i ++),
            "id" => $row["dc_comm_id"],
            "c_code" => $row["c_code"],
            "i_is_tv" => $row["i_is_tv"],
            "i_is_sale_ext" => $row["i_is_sale_ext"],
            "c_name" => $row["c_name"] . " " . $row["position"]
        ];
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storeExtCommitRO >>>';
} else if ($_REQUEST['type'] == 'storeCont') {

    ###################
    $table = "bh_contract";
    $root = "data";
    $data = [];

    $sqlTempTable = "select bh_contract_id
		, c_code
		, c_name
		, ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM dbo.{$table}
		where dc_cnt_id = ?";

    if ($mode == "SEARCH") {
        if (isset($value) && $value != "") {
            $sqlTempTable .= " and " . $filter . " like ?";
        }
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [$_REQUEST['id'], "%{$value}%", $start, $limit];
        $arrCountParam = [$_REQUEST['id'], "%{$value}%"];
    } else {
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [$_REQUEST['id'], $start, $limit];
        $arrCountParam = [$_REQUEST['id']];
    }

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;

    while ($row = $db->Fetch($stmt)) {

        $temp = ["no" => ($i ++),
            "id" => $row["bh_contract_id"],
            "c_code" => $row["c_code"],
            "c_name" => $row["c_name"]
        ];
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storeCont >>>';
} else if ($_REQUEST['type'] == 'storePro') {

    ###################  vw_dc_product
    $table = "dbo.vw_product";
    $root = "data";
    $data = [];

    $pro_name = " '(' +RIGHT('00'+cast(datepart(hour,begin_time) as varchar(50)),2)
                +':'+RIGHT('00'+cast(datepart(minute,begin_time) as varchar(50)),2)
                +' - '+RIGHT('00'+cast(datepart(hour,end_time) as varchar(50)),2)
                +':'+RIGHT('00'+cast(datepart(minute,end_time) as varchar(50)),2)+') '
                +c_name as product_name ";
    $sqlTempTable = "select dc_product_id,{$pro_name}
			, c_code
			, c_name
			, ROW_NUMBER() OVER (ORDER BY c_code DESC) as row FROM {$table}
		where isnull(i_enabled,0) = ?";

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

        $temp = ["no" => ($i ++),
            "id" => $row["dc_product_id"],
            "c_code" => $row["c_code"],
            "c_name" => $row["product_name"]
        ];
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storePro >>>' . $view;
} else if ($_REQUEST['type'] == 'storeProNoOrderMcot') {

    ###################  vw_dc_product
    $table = "dbo.vw_product";
    $root = "data";
    $data = [];

    $pro_name = " '(' +RIGHT('00'+cast(datepart(hour,begin_time) as varchar(50)),2)
                +':'+RIGHT('00'+cast(datepart(minute,begin_time) as varchar(50)),2)
                +' - '+RIGHT('00'+cast(datepart(hour,end_time) as varchar(50)),2)
                +':'+RIGHT('00'+cast(datepart(minute,end_time) as varchar(50)),2)+') '
                +c_name as product_name ";
    $sqlTempTable = "select dc_product_id,{$pro_name}
			, c_code
			, c_name
			, ROW_NUMBER() OVER (ORDER BY c_code DESC) as row FROM {$table}
		where isnull(i_enabled,0) = ?
		and dc_product_type_id=" . $_REQUEST["dc_product_type_id"] . "";

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

        $temp = ["no" => ($i ++),
            "id" => $row["dc_product_id"],
            "c_code" => $row["c_code"],
            "c_name" => $row["product_name"]
        ];
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storePro >>>';
} else if ($_REQUEST['type'] == 'storeProNoOrder') {

    ###################
    $table = "dbo.vw_product";
    $root = "data";
    $data = [];
    $pro_name = " '(' +RIGHT('00'+cast(datepart(hour,begin_time) as varchar(50)),2)
                +':'+RIGHT('00'+cast(datepart(minute,begin_time) as varchar(50)),2)
                +' - '+RIGHT('00'+cast(datepart(hour,end_time) as varchar(50)),2)
                +':'+RIGHT('00'+cast(datepart(minute,end_time) as varchar(50)),2)+') '
                +c_name as product_name ";
    $sqlTempTable = "select dc_product_id,{$pro_name}
			, c_code
			, c_name
			, begin_time
			, end_time
			, ROW_NUMBER() OVER (ORDER BY c_name,begin_time,end_time DESC) as row FROM {$table}
		where isnull(i_enabled,0) = ? and i_class_type=? and i_group_type=?";

    if ($mode == "SEARCH") {
        if (isset($value) && $value != "") {
            $sqlTempTable .= " and " . $filter . " like ?";
        }
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [1, 1, $_REQUEST['dc_product_type_id'], "%{$value}%", $start, $limit];
        $arrCountParam = [1, 1, $_REQUEST['i_group_type'], "%{$value}%"];
    } else {
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [1, 1, $_REQUEST['dc_product_type_id'], $start, $limit];
        $arrCountParam = [1, 1, $_REQUEST['dc_product_type_id']];
    }

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;

    while ($row = $db->Fetch($stmt)) {

        $temp = ["no" => ($i ++),
            "id" => $row["dc_product_id"],
            "c_code" => $row["c_code"],
            "c_name" => $row["product_name"]
        ];
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storeProNoOrder >>>';
} else if ($_REQUEST['type'] == 'storeProRo') {

    ###################
    $table = "dbo.vw_product";
    $root = "data";
    $data = [];

    $i_is_barter = (isset($_REQUEST['order_type']) && $_REQUEST['order_type'] == 'i_is_barter') ? "i_is_barter=1 AND" : "";
    $pro_name = " '(' +RIGHT('00'+cast(datepart(hour,begin_time) as varchar(50)),2)
                +':'+RIGHT('00'+cast(datepart(minute,begin_time) as varchar(50)),2)
                +' - '+RIGHT('00'+cast(datepart(hour,end_time) as varchar(50)),2)
                +':'+RIGHT('00'+cast(datepart(minute,end_time) as varchar(50)),2)+') '
                +c_name as product_name ";

    $sqlTempTable = "select dc_product_id ,{$pro_name}
			, c_code
			, c_name
			, begin_time
			, end_time
			, ROW_NUMBER() OVER (ORDER BY c_name,begin_time,end_time DESC) as row FROM {$table}
		where {$i_is_barter} isnull(i_enabled,0) = ? "
            . " and i_class_id=?  "
            . " and i_group_id =? "
            . " and dc_cost_id=?";
    //i_type_id ,i_class_id ,i_group_id ,dc_cost_id
    if ($mode == "SEARCH") {
        if (isset($value) && $value != "") {
            $sqlTempTable .= " and " . $filter . " like ?";
        }
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [STATUS_ENABLE, 2, $_REQUEST['i_group_type'], $_REQUEST['dc_cost_id'], "%{$value}%", $start, $limit];
        $arrCountParam = [STATUS_ENABLE, 2, $_REQUEST['i_group_type'], $_REQUEST['dc_cost_id'], "%{$value}%"];
    } else {
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [STATUS_ENABLE, 2, $_REQUEST['i_group_type'], $_REQUEST['dc_cost_id'], $start, $limit];
        $arrCountParam = [STATUS_ENABLE, 2, $_REQUEST['i_group_type'], $_REQUEST['dc_cost_id']];
    }

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;

    while ($row = $db->Fetch($stmt)) {

        $temp = ["no" => ($i ++),
            "id" => $row["dc_product_id"],
            "c_code" => $row["c_code"],
            "c_name" => $row["product_name"]
        ];
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storeProRo >>>';
} else if ($_REQUEST['type'] == 'storeProRoPart') {

    ###################
    $table = "vw_product";
    $root = "data";
    $data = [];

    $pro_name = " '(' +RIGHT('00'+cast(datepart(hour,begin_time) as varchar(50)),2)
                +':'+RIGHT('00'+cast(datepart(minute,begin_time) as varchar(50)),2)
                +' - '+RIGHT('00'+cast(datepart(hour,end_time) as varchar(50)),2)
                +':'+RIGHT('00'+cast(datepart(minute,end_time) as varchar(50)),2)+') '
                +c_name as product_name ";

    $sqlTempTable = "select dc_product_id , {$pro_name}
			, c_code
                        , c_name
			, begin_time
			, end_time
			, ROW_NUMBER() OVER (ORDER BY c_name,begin_time,end_time DESC) as row FROM {$table}
		where region_type !=1
                        and isnull(i_enabled,2) = ?
                        and i_class_type=?
                        and i_group_type =?
                ";

    if ($mode == "SEARCH") {
        if (isset($value) && $value != "") {
            $sqlTempTable .= " and " . $filter . " like ?";
        }
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [STATUS_ENABLE, AR_CLASS_TYPE_RADIO
            , $_REQUEST['i_group_type']
            , "%{$value}%", $start, $limit];
        $arrCountParam = [STATUS_ENABLE, AR_CLASS_TYPE_RADIO
            , $_REQUEST['i_group_type'], "%{$value}%"];
    } else {
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [STATUS_ENABLE
            , AR_CLASS_TYPE_RADIO
            , $_REQUEST['i_group_type']
            , $start
            , $limit];
        $arrCountParam = [STATUS_ENABLE, AR_CLASS_TYPE_RADIO, $_REQUEST['i_group_type']];
    }

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;

    while ($row = $db->Fetch($stmt)) {

        $temp = ["no" => ($i ++),
            "id" => $row["dc_product_id"],
            "c_code" => $row["c_code"],
            "c_name" => $row["product_name"]
        ];
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storeProRoPart >>>';
} else if ($_REQUEST['type'] == 'storeSoCnt') {

    ###################
    $table = "dbo.vw_ar_adjust_order";
    $root = "data";
    $data = [];

    $sqlTempTable = "select ar_so_hdr_id
			, c_code
			, c_name
			, ROW_NUMBER() OVER (ORDER BY c_code DESC) as row FROM {$table}
		where isnull(i_enabled,2)=1
                and i_class_type=2
                and i_type_region=1
                and dc_cost_id =?";

    if ($mode == "SEARCH") {
        if (isset($value) && $value != "") {
            $sqlTempTable .= " and " . $filter . " like ?";
        }
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [$_REQUEST['dc_cost_id'], "%{$value}%", $start, $limit];
        $arrCountParam = [$_REQUEST['dc_cost_id'], "%{$value}%"];
    } else {
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [$_REQUEST['dc_cost_id'], $start, $limit];
        $arrCountParam = [$_REQUEST['dc_cost_id']];
    }

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;

    while ($row = $db->Fetch($stmt)) {

        $temp = ["no" => ($i ++),
            "id" => $row["ar_so_hdr_id"],
            "c_code" => $row["c_code"],
            "c_name" => $row["c_name"]
        ];
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storeSoCnt >>>';
} else if ($_REQUEST['type'] == 'storeSoCntPart') {

    ###################
    $table = "vw_ar_adjust_order";
    $root = "data";
    $data = [];

    $sqlTempTable = "select ar_so_hdr_id
			, c_code
			, c_name
			, ROW_NUMBER() OVER (ORDER BY c_code DESC) as row FROM {$table}
		where isnull(i_enabled,2)=" . STATUS_ENABLE
            . " and i_class_type=" . AR_CLASS_TYPE_RADIO
            . " and i_type_region=" . AR_PROCUT_TYPE_REGION
            . " and dc_cost_id =?";

    if ($mode == "SEARCH") {
        if (isset($value) && $value != "") {
            $sqlTempTable .= " and " . $filter . " like ?";
        }
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [$_REQUEST['dc_cost_id'], "%{$value}%", $start, $limit];
        $arrCountParam = [$_REQUEST['dc_cost_id'], "%{$value}%"];
    } else {
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [$_REQUEST['dc_cost_id'], $start, $limit];
        $arrCountParam = [$_REQUEST['dc_cost_id']];
    }

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;

    while ($row = $db->Fetch($stmt)) {

        $temp = ["no" => ($i ++),
            "id" => $row["ar_so_hdr_id"],
            "c_code" => $row["c_code"],
            "c_name" => $row["c_name"]
        ];
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storeSoCntPart >>>';
} else if ($_REQUEST['type'] == 'typeProductStore2') {

    $id = $_REQUEST['ar_so_hdr_id'] ?? null;
    $i_class_type = $_REQUEST['i_class_type'] ?? null;
    $event = $_REQUEST['event'] ?? null;

    $sqlMain = "select distinct t.dc_product_type_id
                            ,t.c_code
                            ,t.c_name
                    from ar_so_hdr h
                    inner join ar_so_dtl d on d.ar_so_hdr_id=h.ar_so_hdr_id
                    inner join dc_product p on p.dc_product_id=d.dc_product_radio_id
                    inner join dc_product_type t on t.dc_product_type_id=p.dc_product_type_id
                    where h.ar_so_hdr_id=? and d.i_enabled=1
                    --and d.i_used <>2
                    ";


    $arrParam = [$id];
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = 0;
    ${$root}[] = ["id" => -1,
        "c_code" => "",
        "c_name" => "-- กรุณาเลือกประเภทรายได้ --"
    ];
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $i ++;
            $temp = ["id" => $row["dc_product_type_id"]
                , "c_code" => $row["c_code"]
                , "c_name" => $row["c_name"]
            ];
            ${$root}[] = $temp;
        }
    }
    $totalCount = $i;
    $debug = 'typeProductStore2 >>>';
} else if ($_REQUEST['type'] == 'typeProductStore') {
    $id = $_REQUEST['id'] ?? null;
    $ar_so_hdr_id = $_REQUEST['ar_so_hdr_id'] ?? null;
    $dc_product_type_id = $_REQUEST['dc_product_type_id'] ?? null;
    $i_class_type = $_REQUEST['i_class_type'] ?? null;

    $unionEvent = ($dc_product_type_id) ? "
            select dc_product_type_id
                        ,c_code
                        ,c_name
                from dbo.dc_product_type
                where dc_product_type_id=? AND i_enabled=?
              UNION
              " : "";

    $sqlMain = "{$unionEvent}
                select t.dc_product_type_id
                        ,t.c_code
                        ,t.c_name
                from dbo.ar_so_hdr h
                    inner join dbo.ar_so_dtl d on d.ar_so_hdr_id=h.ar_so_hdr_id
                    inner join dbo.dc_product p on p.dc_product_id=d.dc_product_id
                    inner join dbo.dc_product_type t on t.dc_product_type_id=p.dc_product_type_id
                where h.ar_so_hdr_id=?
                    AND d.i_enabled=?
                    AND t.dc_product_type_id NOT IN(
                        SELECT bt.dc_product_type_id
                        FROM dbo.ar_bill_invoice_hdr as bt
                        WHERE bt.i_enabled=1
                        GROUP BY bt.dc_product_type_id
                    )
                GROUP BY t.dc_product_type_id
                        ,t.c_code
                        ,t.c_name
                ";
    $arrParam = [$dc_product_type_id, 1, $ar_so_hdr_id, 1];

//    print($sqlMain);
//    print_r($arrParam);
//    exit();

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = 0;
    ${$root}[] = ["id" => -1,
        "c_code" => "",
        "c_name" => "-- กรุณาเลือกประเภทรายได้ --"
    ];
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $i ++;
            $temp = ["id" => $row["dc_product_type_id"]
                , "c_code" => $row["c_code"]
                , "c_name" => $row["c_name"]
            ];
            ${$root}[] = $temp;
        }
    }
    $totalCount = $i;
    $debug = 'typeProductStore >>>';
} else if ($_REQUEST['type'] == 'typeProductClassStore') {

    $sqlMain = "select distinct t.dc_product_class_id
                            ,t.c_code
                            ,t.c_name
                    from dc_product_class t
		  where t.i_enabled=? Order by t.c_code";

    $arrParam = [1];
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = 0;
    ${$root}[] = ["id" => -1,
        "c_code" => "",
        "c_name" => "-- กรุณาเลือกหมวดรายได้ --"
    ];
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $i ++;
            $temp = ["id" => $row["dc_product_class_id"]
                , "c_code" => $row["c_code"]
                , "c_name" => $row["c_name"]
            ];
            ${$root}[] = $temp;
        }
    }

    $totalCount = $i;
    $debug = 'typeProductClassStore >>>';
} else if ($_REQUEST['type'] == 'storeProType') {

    ###################
    $table = "dc_product_group";
    $root = "data";
    $data = [];

    $sqlTempTable = "SELECT b.c_name, b.c_code,
                        {$table}.c_name AS c_name1,
                        c.c_name AS c_name2,
                        b.dc_product_type_id,
                        b.i_is_comm,
                        b.i_class_type,
                        b.region_type
                    , ROW_NUMBER() OVER (ORDER BY b.c_code ASC) as row
                    FROM {$table}
                    INNER JOIN dc_product_type b ON {$table}.dc_product_group_id = b.dc_product_group_id
                    INNER JOIN dc_product_class c ON {$table}.dc_product_class_id = c.dc_product_class_id
                    WHERE b.i_enabled=? ";

    if ($mode == "SEARCH") {
        if (isset($value) && $value != "") {
            $sqlTempTable .= " and b." . $filter . " like ?";
        }
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [STATUS_ENABLE, "%{$value}%", $start, $limit];
        $arrCountParam = [STATUS_ENABLE, "%{$value}%"];
// echo $sqlMain; print_R($arrParam);
    } else {
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = [STATUS_ENABLE, $start, $limit];
        $arrCountParam = [STATUS_ENABLE];
    }

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    if (isset($_REQUEST['all'])) {
        ${$root}[] = ["no" => 0,
            "id" => -1,
            "c_code" => "",
            "c_name" => "ทั้งหมด"
        ];
    }

    while ($row = $db->Fetch($stmt)) {

        $temp = ["no" => ($i ++),
            "id" => $row["dc_product_type_id"],
            "c_code" => $row["c_code"],
            "c_name" => $row["c_name1"] . " " . $row["c_name"]
        ];
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storeProType >>>';
}
//storeCoppyPeriod
echo json_encode(["success" => true, "debug" => $debug, "totalCount" => $totalCount, $root => (isset(${$root}) && ${$root} != null) ? ${$root} : '']);
exit;
?>
