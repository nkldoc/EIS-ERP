<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");
//End fn updateStaus
if (empty($_SESSION) && empty($_SESSION['user_id'])) {
    $msg = "Session หมดอายุ";
    echo json_encode(array("reval" => 1, "success" => "Error", "msg" => $msg));
    exit;
} else {

    $info[1] = $_SESSION['user_id'];
    $info[2] = $_SESSION['dc_cost_id'];
    $info[3] = date('Y-m-d H:i:s'); // วันที่และเวลา ปัจจุบัน
// toDoLog
}

###################
$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();
##########################################
###########################################
$mode = $_REQUEST["mode"] ?? null;
$filter = $_REQUEST["filter"] ?? null;
$value = $_REQUEST["value"] ?? null;
$i_read = $_REQUEST["i_read"] ?? null;
$now = date("Y-m-d");
$dateConfig = true ? "convert(varchar,'" . $now . "')" : "convert(varchar,'2023-11-20')";

$root = "data";
$data = array();

$limit = $_REQUEST["limit"] ?? null;
$dir = $_REQUEST["dir"] ?? null;
$sort = $_REQUEST["sort"] ?? null;
$start = $_REQUEST["start"] ?? null;

function get($a) {
    return $a ?? 0;
}

if (!get($start)) {
    $start = 0;
}
if (!get($limit)) {
    $limit = 20;
} else {
    $limit = ($limit + $start);
}
if (!get($dir)) {
    $dir = "DESC";
}
if (!get($sort)) {
    $sort = " s.c_code";
}
#################################
$arrParam = array();
$arrCountParam = array();
$con = null;
$conDtl = null;
$wh = null;

$type = $_REQUEST["type"] ?? null;
$act = $_REQUEST["act"] ?? null;
if ($type == "WITHDRAW") {

    $dc_creditor_id = $_REQUEST['dc_creditor_id'] ?? 0;
    $s_checking_date = $_REQUEST['s_checking_date'] ?? null;
    $e_checking_date = $_REQUEST['e_checking_date'] ?? null;
    $c_name = $_REQUEST['c_name'] ?? null;
    $i_status_checking = $_REQUEST['i_status_checking'] ?? null;

    $sqlTempTable = "select a.sp_check_billing_hdr_id
                    , row_number() over (order by a.sp_check_billing_hdr_id DESC) as row
                     from NMU_ERP.dbo.sp_check_billing_hdr a ";

    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlMain = "select c.sp_check_billing_dtl_id
                    , c.sp_check_period_hdr_id
                    , e.c_code as check_code
                    , e.i_status_billing
                        , convert(varchar, e.d_arrive_date, 120) as d_arrive_date
                        , convert(varchar, e.d_reg_billing_date, 120) as d_reg_billing_date
                        , convert(varchar, e.d_post_billing_date, 120) as d_post_billing_date
                        , convert(varchar, e.d_checking_date, 120) as d_checking_date
                    , (select top 1 inv_name from nmu.dbo.dc_creditor where dc_creditor_id=b.dc_creditor_id) as dc_creditor_name
                    , b.dc_creditor_id
                    , b.sp_check_billing_hdr_id
                    , b.ar_no
                    , b.sp_bg_billing_dtl_id
                    , b.c_name
                    , b.c_code
                    , b.c_inv_name
                    , b.c_inv_address
                    , b.sp_emp_id
                    , b.dc_creditor_id
                    , b.dc_cost_id
                    , b.dc_user_create_id
                    , b.dc_user_create_cost_id
                    , b.d_create
                    , b.dc_user_update_id
                    , b.dc_user_update_cost_id
                    , b.d_update
                    , (select top 1 c_name from dbo.sp_emp where sp_emp_id=b.sp_emp_id)  as sp_emp_name
                    , (select top 1 c_full_name from dbo.dc_user where dc_user_id=b.dc_user_create_id) as dc_create_name
                    , (select top 1 c_name from dbo.dc_cost where dc_cost_id=b.dc_user_create_cost_id) as dc_cost_create_name
                    , convert(varchar, b.d_create, 120) as d_create
                    , (select top 1 c_full_name from dbo.dc_user where dc_user_id=b.dc_user_update_id) as dc_update_name
                    , (select top 1 c_name from dbo.dc_cost where dc_cost_id=b.dc_user_update_cost_id) as dc_cost_update_name
                    , convert(varchar, b.d_update, 120) as d_update
              "
            . " from ({$sqlTempTable}) a "
            . " inner join NMU_ERP.dbo.sp_check_billing_hdr b on b.sp_check_billing_hdr_id=a.sp_check_billing_hdr_id"
            . " inner join NMU_ERP.dbo.sp_check_billing_dtl c on c.sp_check_billing_hdr_id=a.sp_check_billing_hdr_id"
            . " inner join NMU_ERP.dbo.sp_check_period_hdr e on e.sp_check_period_hdr_id=c.sp_check_period_hdr_id"
            . " WHERE a.row > ? and a.row <= ?";

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;

    while ($row = $db->Fetch($stmt)) {
        $temp = array(
            "no" => $i++,
            "id" => intval($row["sp_check_billing_hdr_id"]),
            "dtl_id" => intval($row["sp_check_billing_dtl_id"]),
            "sp_check_period_hdr_id" => intval($row["sp_check_period_hdr_id"]),
            "i_status_billing" => intval($row["i_status_billing"]),
            "c_code" => $row["c_code"],
            "check_code" => $row["check_code"],
            "c_name" => $row["c_name"],
            "c_inv_name" => $row["c_inv_name"],
            "ar_no" => $row["ar_no"],
            "c_inv_address" => $row["c_inv_address"],
            "dc_creditor_id" => $row["dc_creditor_id"],
            "dc_creditor_name" => $row["dc_creditor_name"],
            "txtdc_creditor_idID" => $row["dc_creditor_name"],
            "d_checking_date" => ((empty($row["d_checking_date"])) ? "" : $date->extDateBuddha($row["d_checking_date"])), //d_tor_date d_tor_status_date
            "d_arrive_date" => ((empty($row["d_arrive_date"])) ? "" : $date->extDateBuddha($row["d_arrive_date"])), //d_tor_date
            "d_reg_billing_date" => ((empty($row["d_reg_billing_date"])) ? "" : $date->extDateBuddha($row["d_reg_billing_date"])), //d_tor_date
            "d_post_billing_date" => ((empty($row["d_post_billing_date"])) ? "" : $date->extDateBuddha($row["d_post_billing_date"])), //d_tor_date
            "sp_emp_name" => $row["sp_emp_name"],
            "dc_user_create_id" => $row["dc_create_name"],
            "dc_user_create_cost_id" => $row["dc_cost_create_name"],
            "d_create" => $date->extDateBuddha($row["d_create"]), //
            "dc_user_update_id" => $row["dc_update_name"],
            "dc_user_update_cost_id" => $row["dc_cost_update_name"],
            "d_update" => $date->extDateBuddha($row["d_update"]),
        );
        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
    exit();
} else if ($type == "chooseBilling") {

    $dc_creditor_id = $_REQUEST['dc_creditor_id'] ?? 0;
    $s_checking_date = $_REQUEST['s_checking_date'] ?? null;
    $e_checking_date = $_REQUEST['e_checking_date'] ?? null;
    $c_name = $_REQUEST['c_name'] ?? null;
    $i_status_checking = $_REQUEST['i_status_checking'] ?? null;

    $sqlTempTable = "select a.sp_check_period_hdr_id
                     ,      b.dc_creditor_id
                     , row_number() over (order by a.sp_check_period_hdr_id DESC) as row
                     from NMU_ERP.dbo.sp_check_period_hdr a
                     inner join NMU_ERP.dbo.sp_check_billing_items b on b.sp_check_period_hdr_id=a.sp_check_period_hdr_id
                     where a.i_status_billing=3 and b.dc_creditor_id={$dc_creditor_id} and a.c_code <> '' {$wh}
                    ";
//     echo $sqlTempTable;
//    exit;

    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlMain = "select a.*
                        , s.c_code
                        , s.sp_check_period_hdr_id
                        , s.c_arrive_code
                        , s.sp_bg_billing_dtl_id
                        , s.c_doc_ref
                        , s.i_step
                        , s.i_is_waiting
                        , s.i_status_checking
                        , s.i_menu
                        , a.dc_creditor_id
                        , convert(varchar, s.d_arrive_date, 120) as d_arrive_date
                        , convert(varchar, s.d_reg_billing_date, 120) as d_reg_billing_date
                        , convert(varchar, s.d_post_billing_date, 120) as d_post_billing_date
                        , (select top 1 inv_name from nmu.dbo.dc_creditor where dc_creditor_id=a.dc_creditor_id) as dc_creditor_name
                        , a.dc_creditor_id
                        , convert(varchar, s.d_checking_date, 120) as d_checking_date
                        , convert(varchar, s.d_arrive_date, 120) as d_arrive_date
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_create_id) as c_create_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_create_cost_id) as c_cost_creat_name
                        , convert(varchar, s.d_create, 120) as d_create
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_update_id) as c_update_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_update_cost_id) as c_cost_update_name
                        , convert(varchar, s.d_update, 120) as d_update
                        , isnull(g.url_link_doc,'') as url_link_doc
                        , isnull(g.c_comment,'') as c_comment
                        , isnull(g.c_doc_ref,'') as c_doc_ref
                        , g.c_name
                        , (select top 1 c_name from dbo.sp_emp where sp_emp_id=s.sp_emp_id)  as sp_emp_name
                        , s.sp_emp_id
                        , s.c_comment2
                        , isnull((select sp_check_period_hdr_id from dbo.sp_withdraw where i_enable = 1 and sp_check_period_hdr_id=a.sp_check_period_hdr_id),0) as i_status

            "
            . " from ({$sqlTempTable}) a "
            . " inner join NMU_ERP.dbo.sp_check_period_hdr s on s.sp_check_period_hdr_id=a.sp_check_period_hdr_id"
            . " inner join NMU_ERP.dbo.sp_check_billing_items g on g.sp_check_period_hdr_id=a.sp_check_period_hdr_id"
            . " WHERE a.row > ? and a.row <= ?";

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    $i_purchase = array(0 => '', 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');

    while ($row = $db->Fetch($stmt)) {
        $arrStatus = array(0 => "ยังไม่ทำรายการเบิก", $row["sp_check_period_hdr_id"] => "<span style='color:blue'>ทำรายการเบิก</span>");
        $temp = array(
            "no" => $i++,
            "id" => intval($row["sp_check_period_hdr_id"]),
            "sp_check_period_hdr_id" => intval($row["sp_check_period_hdr_id"]),
            "sp_bg_billing_dtl_id" => intval($row["sp_bg_billing_dtl_id"]),
            "i_step" => intval($row["i_step"]),
            "i_is_waiting" => intval($row["i_is_waiting"]),
            "i_status_checking" => intval($row["i_status_checking"]),
            "i_menu" => intval($row["i_menu"]),
            "c_code" => $row["c_code"],
            "c_name" => $row["c_name"],
            "url_link_doc" => $row["url_link_doc"],
            "c_comment" => $row["c_comment"],
            "c_doc_ref" => $row["c_doc_ref"],
            "dc_creditor_id" => $row["dc_creditor_id"],
            "dc_creditor_name" => $row["dc_creditor_name"],
            "txtdc_creditor_idID" => $row["dc_creditor_name"],
            "sp_emp_id" => $row["sp_emp_id"],
            "sp_emp_name" => $row["sp_emp_name"],
            "txtsp_emp_idID" => $row["sp_emp_name"],
            "d_checking_date" => ((empty($row["d_checking_date"])) ? "" : $date->extDateBuddha($row["d_checking_date"])), //d_tor_date d_tor_status_date
            "d_arrive_date" => ((empty($row["d_arrive_date"])) ? "" : $date->extDateBuddha($row["d_arrive_date"])), //d_tor_date
            "d_create" => $date->extDateBuddha($row["d_create"]), //
            "dc_user_update_id" => $row["c_update_name"],
            "dc_user_update_cost_id" => $row["c_cost_update_name"],
            "d_post_billing_date" => ((empty($row["d_post_billing_date"])) ? "" : $date->extDateBuddha($row["d_post_billing_date"])), //d_tor_date
            "d_reg_billing_date" => ((empty($row["d_reg_billing_date"])) ? "" : $date->extDateBuddha($row["d_reg_billing_date"])), //d_tor_date
            "d_arrive_date" => ((empty($row["d_arrive_date"])) ? "" : $date->extDateBuddha($row["d_arrive_date"])), //d_tor_date
            "d_update" => $date->extDateBuddha($row["d_update"]),
        );
        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
    exit();
} else if ($type == "postBilling") {


    if ($_SESSION['sp_emp_id']) {
        $emp_id = $_SESSION['sp_emp_id'];
        $wh .= " and a.sp_emp_id = {$emp_id} ";
    } else {
        echo 'Session Expire';
        exit();
    }


    $dc_creditor_id = $_REQUEST['dc_creditor_id'] ?? 0;
    $s_checking_date = $_REQUEST['s_checking_date'] ?? null;
    $e_checking_date = $_REQUEST['e_checking_date'] ?? null;
    $c_name = $_REQUEST['c_name'] ?? null;
    $i_status_checking = $_REQUEST['i_status_checking'] ?? null;

    $wh .= " and a.i_status_checking=1 and a.i_status_billing=2 ";
    $sqlTempTable = "select a.sp_check_period_hdr_id
                     ,      b.dc_creditor_id
                     , row_number() over (order by a.sp_check_period_hdr_id DESC) as row
                     from NMU_ERP.dbo.sp_check_period_hdr a
                     inner join NMU_ERP.dbo.sp_check_billing_items b on b.sp_check_period_hdr_id=a.sp_check_period_hdr_id
                     where b.dc_creditor_id={$dc_creditor_id} and a.c_code <> '' {$wh}
                    ";
//    echo $sqlTempTable;
//    exit;

    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlMain = "select a.*
                        , s.c_code
                        , s.sp_check_period_hdr_id
                        , s.c_arrive_code
                        , s.sp_bg_billing_dtl_id
                        , s.c_doc_ref
                        , s.i_step
                        , s.i_is_waiting
                        , s.i_status_checking
                        , s.i_menu
                        , a.dc_creditor_id
                        , convert(varchar, s.d_arrive_date, 120) as d_arrive_date
                        , convert(varchar, s.d_reg_billing_date, 120) as d_reg_billing_date
                        , convert(varchar, s.d_post_billing_date, 120) as d_post_billing_date
                        , (select top 1 inv_name from nmu.dbo.dc_creditor where dc_creditor_id=a.dc_creditor_id) as dc_creditor_name
                        , a.dc_creditor_id
                        , convert(varchar, s.d_checking_date, 120) as d_checking_date
                        , convert(varchar, s.d_arrive_date, 120) as d_arrive_date
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_create_id) as c_create_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_create_cost_id) as c_cost_creat_name
                        , convert(varchar, s.d_create, 120) as d_create
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_update_id) as c_update_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_update_cost_id) as c_cost_update_name
                        , convert(varchar, s.d_update, 120) as d_update
                        , isnull(g.url_link_doc,'') as url_link_doc
                        , isnull(g.c_comment,'') as c_comment
                        , isnull(g.c_doc_ref,'') as c_doc_ref
                        , g.c_name
                        , (select top 1 c_name from dbo.sp_emp where sp_emp_id=s.sp_emp_id)  as sp_emp_name
                        , s.sp_emp_id
                        , s.c_comment2
                        , isnull((select sp_check_period_hdr_id from dbo.sp_withdraw where i_enable = 1 and sp_check_period_hdr_id=a.sp_check_period_hdr_id),0) as i_status

            "
            . " from ({$sqlTempTable}) a "
            . " inner join NMU_ERP.dbo.sp_check_period_hdr s on s.sp_check_period_hdr_id=a.sp_check_period_hdr_id"
            . " inner join NMU_ERP.dbo.sp_check_billing_items g on g.sp_check_period_hdr_id=a.sp_check_period_hdr_id"
            . " WHERE a.row > ? and a.row <= ?";
//             print_r($arrParam);
//    echo $sqlMain;
//    exit;

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    $i_purchase = array(0 => '', 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');

    while ($row = $db->Fetch($stmt)) {
        $arrStatus = array(0 => "ยังไม่ทำรายการเบิก", $row["sp_check_period_hdr_id"] => "<span style='color:blue'>ทำรายการเบิก</span>");
        $temp = array(
            "no" => $i++,
            "id" => intval($row["sp_check_period_hdr_id"]),
            "sp_check_period_hdr_id" => intval($row["sp_check_period_hdr_id"]),
            "sp_bg_billing_dtl_id" => intval($row["sp_bg_billing_dtl_id"]),
            "i_step" => intval($row["i_step"]),
            "i_is_waiting" => intval($row["i_is_waiting"]),
            "i_status_checking" => intval($row["i_status_checking"]),
            "i_menu" => intval($row["i_menu"]),
            "c_code" => $row["c_code"],
            "c_name" => $row["c_name"],
            "url_link_doc" => $row["url_link_doc"],
            "c_comment" => $row["c_comment"],
            "c_doc_ref" => $row["c_doc_ref"],
            "dc_creditor_id" => $row["dc_creditor_id"],
            "dc_creditor_name" => $row["dc_creditor_name"],
            "txtdc_creditor_idID" => $row["dc_creditor_name"],
            "sp_emp_id" => $row["sp_emp_id"],
            "sp_emp_name" => $row["sp_emp_name"],
            "txtsp_emp_idID" => $row["sp_emp_name"],
            "d_checking_date" => ((empty($row["d_checking_date"])) ? "" : $date->extDateBuddha($row["d_checking_date"])), //d_tor_date d_tor_status_date
            "d_arrive_date" => ((empty($row["d_arrive_date"])) ? "" : $date->extDateBuddha($row["d_arrive_date"])), //d_tor_date
            "d_create" => $date->extDateBuddha($row["d_create"]), //
            "dc_user_update_id" => $row["c_update_name"],
            "dc_user_update_cost_id" => $row["c_cost_update_name"],
            "d_post_billing_date" => ((empty($row["d_post_billing_date"])) ? "" : $date->extDateBuddha($row["d_post_billing_date"])), //d_tor_date
            "d_reg_billing_date" => ((empty($row["d_reg_billing_date"])) ? "" : $date->extDateBuddha($row["d_reg_billing_date"])), //d_tor_date
            "d_arrive_date" => ((empty($row["d_arrive_date"])) ? "" : $date->extDateBuddha($row["d_arrive_date"])), //d_tor_date
            "d_update" => $date->extDateBuddha($row["d_update"]),
        );
        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
    exit();
} else if ($type == "po_working_dtl") {

    $dc_creditor_id = $_REQUEST['dc_creditor_id'] ?? 0;
    $s_checking_date = $_REQUEST['s_checking_date'] ?? null;
    $e_checking_date = $_REQUEST['e_checking_date'] ?? null;
    $c_name = $_REQUEST['c_name'] ?? null;
    $c_billing = $_REQUEST['c_billing'] ?? null;
    $c_checking = $_REQUEST['c_checking'] ?? null;
    $c_code = $_REQUEST['c_code'] ?? null;
    $i_status_checking = $_REQUEST['i_status_checking'] ?? null;
    $d_doc_arrive_dt = null;
    if ($act == "SEARCH") {
        $wh .= ($dc_creditor_id > 0) ? " and CASE WHEN isnull(a.dc_creditor_id,0)  = 0 THEN e.dc_creditor_id ELSE a.dc_creditor_id END = " . $dc_creditor_id : "";
        $wh .= ($s_checking_date != "") ? " and a.d_checking_date between '" . $s_checking_date . "' and '" . $e_checking_date . "'" : "";
        $wh .= ($c_name != "") ? " and a.c_name like '%{$c_name}%'" : "";
        $wh .= ($c_checking != "") ? " and a.c_code like '%{$c_checking}%'" : "";
        $wh .= ($c_code != "") ? " and e.c_code like '%{$c_code}%'" : "";
        $wh .= ($c_billing != "") ? " and a.c_billing_code like '%{$c_billing}%'" : "";
    }
    if ($i_status_checking == 3) {
        $d_doc_arrive_dt = " and a.i_status_checking = 1 and a.i_status_billing is null ";
    } else if ($i_status_checking == 2) {
        $d_doc_arrive_dt = " and a.i_status_billing>=4";
    } else {
        $d_doc_arrive_dt = "  and a.d_doc_arrive_dt <= (select d_end_date from sp_bg_billing_dtl where d_billing_date = {$dateConfig})";
    }
    $wh .= ($i_status_checking == 2) ? " and a.i_status_billing>=4" : " and isnull(a.i_status_billing,0)=0 and a.i_status_checking=1";
    $sqlTempTable = "select a.sp_check_period_hdr_id ,h.i_period
                        , isnull(a.dc_creditor_id,e.dc_creditor_id) as dc_creditor_id
                        , row_number() over (order by a.sp_check_period_hdr_id DESC) as row
                        from NMU_ERP.dbo.sp_check_period_hdr a
                        inner join NMU_ERP.dbo.sp_tor_hdr_period h on h.sp_tor_hdr_period_id =a.sp_tor_hdr_period_id
                        right join NMU_ERP.dbo.sp_tor_contract e on e.sp_tor_contract_id = a.sp_tor_contract_id
                        where a.c_code <> '' {$wh} {$d_doc_arrive_dt}
                    ";
//     echo $sqlTempTable;
//    exit;

    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlMain = "select a.*
                        , s.c_code
                        , s.sp_check_period_hdr_id
                        , s.c_arrive_code
                        , s.sp_bg_billing_dtl_id
                        , s.sp_tor_hdr_period_id
                        , s.sp_check_period_hdr_id
                        , s.sp_tor_contract_id
                        , s.i_step
                        , s.i_is_waiting
                        , s.i_status_checking
                        , s.i_menu
                        , a.dc_creditor_id
                        , convert(varchar, s.d_reg_billing_date, 120) as d_reg_billing_date
                        , convert(varchar, s.d_post_billing_date, 120) as d_post_billing_date
                        , (select top 1 inv_name from nmu.dbo.dc_creditor where dc_creditor_id=a.dc_creditor_id) as dc_creditor_name
                        , a.dc_creditor_id
                        , convert(varchar, s.d_checking_date, 120) as d_checking_date
                        , convert(varchar, s.d_arrive_date, 120) as d_arrive_date
                        , convert(varchar, s.d_doc_arrive_dt, 120) as d_doc_arrive_dt
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_create_id) as c_create_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_create_cost_id) as c_cost_creat_name
                        , convert(varchar, s.d_create, 120) as d_create
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_update_id) as c_update_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_update_cost_id) as c_cost_update_name
                        , convert(varchar, s.d_update, 120) as d_update
                        , isnull(g.url_link_doc,'') as url_link_doc
                        , isnull(g.c_comment,'') as c_comment
                        , isnull(isnull(s.c_billing_code,g.c_doc_ref),0) as c_doc_ref
                        , isnull(g.c_code,'') as bl_code
                        , (select top 1 c_name from dbo.sp_emp where sp_emp_id=s.sp_emp_id)  as sp_emp_name
                        , isnull((select top 1 c_name from dbo.sp_tor_dtl_period where sp_tor_hdr_period_id=s.sp_tor_hdr_period_id),(select c_name from sp_tor where tor_id = (select sp_tor_id from sp_tor_contract where sp_tor_contract_id = s.sp_tor_contract_id)))  as c_name
                        , isnull((select top 1 c_code from dbo.sp_tor_contract where sp_tor_contract_id=s.sp_tor_contract_id),'ไม่มี')  as contract_code
                        , s.sp_emp_id
                        , s.c_comment2
                        , s.i_status_billing
                        , f_vat_amt
                        , s.dc_user_create_id
                        , f_total_add_vat_amt
                        ,  (select i_type_bg from sp_tor where tor_id  =  (select sp_tor_id from sp_tor_contract where sp_tor_contract_id = s.sp_tor_contract_id )) as i_type_bg
                        , isnull((select sp_check_period_hdr_id from dbo.sp_withdraw where i_enable = 1 and sp_check_period_hdr_id=a.sp_check_period_hdr_id),0) as i_status
            "
            . " from ({$sqlTempTable}) a "
            . " inner join NMU_ERP.dbo.sp_check_period_hdr s on s.sp_check_period_hdr_id=a.sp_check_period_hdr_id"
            . " left join NMU_ERP.dbo.sp_check_billing_items g on g.sp_check_period_hdr_id=a.sp_check_period_hdr_id"
            . " WHERE a.row > ? and a.row <= ? and  (select i_type_bg from sp_tor where tor_id  =  (select sp_tor_id from sp_tor_contract where sp_tor_contract_id = s.sp_tor_contract_id ))  != 11  ";
//    print_r($arrParam);
//    echo $sqlMain;
//    exit;

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    // /******echo sql******/
    // $sql = (@$sqlMain) ? $sqlMain : $sql;
    // $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());
    // $sql = str_replace('?', '#-#', $sql);
    // foreach ($arr as $fld => $value) {
    //  $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
    // }
    // echo $sql; exit;
    // /********************/
    $i_purchase = array(0 => '', 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');

    while ($row = $db->Fetch($stmt)) {
        $arrStatus = array(0 => "ยังไม่ทำรายการเบิก", $row["sp_check_period_hdr_id"] => "<span style='color:blue'>ทำรายการเบิก</span>");
        $temp = array(
            "no" => $i++,
            "id" => intval($row["sp_check_period_hdr_id"]),
            "sp_check_period_hdr_id" => intval($row["sp_check_period_hdr_id"]),
            "sp_tor_hdr_period_id" => intval($row["sp_tor_hdr_period_id"]),
            "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
            "sp_bg_billing_dtl_id" => intval($row["sp_bg_billing_dtl_id"]),
            "i_step" => intval($row["i_step"]),
            "i_type_bg" => intval($row["i_type_bg"]),
            "i_is_waiting" => intval($row["i_is_waiting"]),
            "i_status_billing" => intval($row["i_status_billing"]),
            "i_status_checking" => intval($row["i_status_checking"]),
            "i_menu" => intval($row["i_menu"]),
            "c_code" => $row["c_code"],
            "contract_code" => $row["contract_code"],
            "i_period" => $row["i_period"],
            "c_name" => $row["c_name"],
            "bl_code" => $row["bl_code"],
            "f_vat_amt" => $row["f_vat_amt"],
            "f_total_add_vat_amt" => $row["f_total_add_vat_amt"],
            "f_total_amt" => number_format(floatval($row["f_vat_amt"] + $row["f_total_add_vat_amt"]), 2),
            "url_link_doc" => $row["url_link_doc"],
            "c_comment" => $row["c_comment"],
            "c_doc_ref" => $row["c_doc_ref"],
            "dc_creditor_id" => $row["dc_creditor_id"],
            "dc_creditor_name" => $row["dc_creditor_name"],
            "txtdc_creditor_idID" => $row["dc_creditor_name"],
            "sp_emp_id" => $row["sp_emp_id"],
            "sp_emp_name" => $row["sp_emp_name"],
            "txtsp_emp_idID" => $row["sp_emp_name"],
            "d_checking_date" => ((empty($row["d_checking_date"])) ? "" : $date->extDateBuddha($row["d_checking_date"])), //d_tor_date d_tor_status_date
            "d_arrive_date" => ((empty($row["d_arrive_date"])) ? "" : $date->extDateBuddha($row["d_arrive_date"])), //d_tor_date
            "d_doc_arrive_dt" => ((empty($row["d_doc_arrive_dt"])) ? "" : $date->extDateBuddha($row["d_doc_arrive_dt"])), //d_tor_date
            "d_create" => $date->extDateBuddha($row["d_create"]), //
            "dc_user_update_id" => $row["c_update_name"],
            "dc_user_creat_name" => $row["c_create_name"],
            "dc_user_creat_id" => $row["dc_user_create_id"],
            "dc_user_update_cost_id" => $row["c_cost_update_name"],
            "d_post_billing_date" => ((empty($row["d_post_billing_date"])) ? "" : $date->extDateBuddha($row["d_post_billing_date"])), //d_tor_date
            "d_reg_billing_date" => ((empty($row["d_reg_billing_date"])) ? "" : $date->extDateBuddha($row["d_reg_billing_date"])), //d_tor_date
            "d_update" => $date->extDateBuddha($row["d_update"]),
        );
        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
    exit();
} else if ($type == "po_working_dtl1") {

    if ($_SESSION['sp_emp_id']) {
        $emp_id = $_SESSION['sp_emp_id'];
        $i_type_user = $_SESSION['i_type_user'];
        $wh .= $i_type_user == (2) ? "" : " and a.sp_emp_id = {$emp_id} ";
    } else {
        echo 'Session Expire';
        exit();
    }

    $dc_creditor_id = $_REQUEST['dc_creditor_id'] ?? 0;
    $s_checking_date = $_REQUEST['s_checking_date'] ?? null;
    $e_checking_date = $_REQUEST['e_checking_date'] ?? null;
    $c_name = $_REQUEST['c_name'] ?? null;
    $i_status_checking = $_REQUEST['i_status_checking'] ?? null;

    if ($act == "SEARCH") {
        $wh .= ($dc_creditor_id > 0) ? " and CASE WHEN isnull(a.dc_creditor_id,0)  = 0 THEN e.dc_creditor_id ELSE a.dc_creditor_id END = " . $dc_creditor_id : "";
        $wh .= ($s_checking_date != "") ? " and a.d_checking_date between '" . $s_checking_date . "' and '" . $e_checking_date . "'" : "";
        $wh .= ($c_name != "") ? " and a.c_name like '%{$c_name}%'" : "";
    }
    $wh .= " and a.i_status_billing >= 4";
    $sqlTempTable = "select a.sp_check_period_hdr_id
                     , isnull(a.dc_creditor_id,e.dc_creditor_id) as dc_creditor_id
                     , row_number() over (order by a.sp_check_period_hdr_id DESC) as row
                     from NMU_ERP.dbo.sp_check_period_hdr a
                     right join NMU_ERP.dbo.sp_tor_contract e on e.sp_tor_contract_id = a.sp_tor_contract_id
                     where a.c_code <> '' {$wh}
                    ";
//  echo $sqlTempTable;
//  exit;

    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlMain = "select a.*
                        , s.c_code
                        , s.sp_check_period_hdr_id
                        , s.c_arrive_code
                        , s.sp_bg_billing_dtl_id
                        , s.i_step
                        , s.i_is_waiting
                        , s.i_status_checking
                        , s.i_menu
                        , a.dc_creditor_id
                        , convert(varchar, s.d_reg_billing_date, 120) as d_reg_billing_date
                        , convert(varchar, s.d_post_billing_date, 120) as d_post_billing_date
                        , (select top 1 inv_name from nmu.dbo.dc_creditor where dc_creditor_id=a.dc_creditor_id) as dc_creditor_name
                        , a.dc_creditor_id
                        , convert(varchar, s.d_checking_date, 120) as d_checking_date
                        , convert(varchar, s.d_arrive_date, 120) as d_arrive_date
                        , convert(varchar, s.d_doc_arrive_dt, 120) as d_doc_arrive_dt
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_create_id) as c_create_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_create_cost_id) as c_cost_creat_name
                        , convert(varchar, s.d_create, 120) as d_create
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_update_id) as c_update_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_update_cost_id) as c_cost_update_name
                        , convert(varchar, s.d_update, 120) as d_update
                        , isnull(g.url_link_doc,'') as url_link_doc
                        , isnull(g.c_comment,'') as c_comment
                        , isnull(g.c_doc_ref,'') as c_doc_ref
                        , isnull(g.c_code,'') as bl_code
                        , (select top 1 c_name from dbo.sp_emp where sp_emp_id=s.sp_emp_id)  as sp_emp_name
                        , s.sp_emp_id
                        , s.c_comment2
                        , s.i_status_billing
                        , isnull((select sp_check_period_hdr_id from dbo.sp_withdraw where i_enable = 1 and sp_check_period_hdr_id=a.sp_check_period_hdr_id),0) as i_status

            "
            . " from ({$sqlTempTable}) a "
            . " inner join NMU_ERP.dbo.sp_check_period_hdr s on s.sp_check_period_hdr_id=a.sp_check_period_hdr_id"
            . " left join NMU_ERP.dbo.sp_check_billing_items g on g.sp_check_period_hdr_id=a.sp_check_period_hdr_id"
            . " WHERE a.row > ? and a.row <= ?";
//    print_r($arrParam);
//    echo $sqlMain;
//    exit;

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    $i_purchase = array(0 => '', 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');

    while ($row = $db->Fetch($stmt)) {
        $arrStatus = array(0 => "ยังไม่ทำรายการเบิก", $row["sp_check_period_hdr_id"] => "<span style='color:blue'>ทำรายการเบิก</span>");
        $temp = array(
            "no" => $i++,
            "id" => intval($row["sp_check_period_hdr_id"]),
            "sp_check_period_hdr_id" => intval($row["sp_check_period_hdr_id"]),
            "sp_bg_billing_dtl_id" => intval($row["sp_bg_billing_dtl_id"]),
            "i_step" => intval($row["i_step"]),
            "i_is_waiting" => intval($row["i_is_waiting"]),
            "i_status_billing" => intval($row["i_status_billing"]),
            "i_status_checking" => intval($row["i_status_checking"]),
            "i_menu" => intval($row["i_menu"]),
            "c_code" => $row["c_code"],
            "bl_code" => $row["bl_code"],
            "url_link_doc" => $row["url_link_doc"],
            "c_comment" => $row["c_comment"],
            "c_doc_ref" => $row["c_doc_ref"],
            "dc_creditor_id" => $row["dc_creditor_id"],
            "dc_creditor_name" => $row["dc_creditor_name"],
            "txtdc_creditor_idID" => $row["dc_creditor_name"],
            "sp_emp_id" => $row["sp_emp_id"],
            "sp_emp_name" => $row["sp_emp_name"],
            "txtsp_emp_idID" => $row["sp_emp_name"],
            "d_checking_date" => ((empty($row["d_checking_date"])) ? "" : $date->extDateBuddha($row["d_checking_date"])), //d_tor_date d_tor_status_date
            "d_arrive_date" => ((empty($row["d_arrive_date"])) ? "" : $date->extDateBuddha($row["d_arrive_date"])), //d_tor_date
            "d_doc_arrive_dt" => ((empty($row["d_doc_arrive_dt"])) ? "" : $date->extDateBuddha($row["d_doc_arrive_dt"])), //d_tor_date
            "d_create" => $date->extDateBuddha($row["d_create"]), //
            "dc_user_update_id" => $row["c_update_name"],
            "dc_user_update_cost_id" => $row["c_cost_update_name"],
            "d_post_billing_date" => ((empty($row["d_post_billing_date"])) ? "" : $date->extDateBuddha($row["d_post_billing_date"])), //d_tor_date
            "d_reg_billing_date" => ((empty($row["d_reg_billing_date"])) ? "" : $date->extDateBuddha($row["d_reg_billing_date"])), //d_tor_date
            "d_update" => $date->extDateBuddha($row["d_update"]),
        );
        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
    exit();
}