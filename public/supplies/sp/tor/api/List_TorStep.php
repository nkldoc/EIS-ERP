<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

###################
$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();
############################################################################################################
###########################################
$mode = $_REQUEST["mode"] ?? null;
$filter = $_REQUEST["filter"] ?? null;
$value = $_REQUEST["value"] ?? null;
$i_read = $_REQUEST["i_read"] ?? null;

$root = "data";
$data = array();

$limit = $_REQUEST["limit"] ?? null;
$dir = $_REQUEST["dir"] ?? null;
$sort = $_REQUEST["sort"] ?? null;
$start = $_REQUEST["start"] ?? null;
if (empty($_SESSION['user_id'])) {
    echo "Session หมดอายุ";
    exit();
} else {

    $info[1] = $_SESSION['user_id'];
    $info[2] = $_SESSION['dc_cost_id'];
    $info[3] = date('Y-m-d H:i:s'); // วันที่และเวลา ปัจจุบัน
}

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
$tor_type_show = $_REQUEST['tor_type_show'] ?? null;
$i_post = $_REQUEST['i_post'] ?? null;

$i_purchase = array(0 => '', 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
if ($type == "ownnerPr") {
    $editArry = array(
        3 => '<span style="color:red">ส่งแก้ไข</span>' // พนักงานสายงาน
        ,
        2 => '<span style="color:red">ส่งแก้ไข</span>' // หัวหน้าสายงาน
        ,
        1 => '<span style="color:red">แก้ไขแล้ว</span>' // ธุระการ
        ,
        4 => '<span style="color:blue">แก้ไขแล้ว</span>',
        5 => '<span style="color:blue"></span>',
        6 => '<span style="color:blue"></span>'
    );

    $tor_status_id = $_REQUEST["tor_status_id"] ?? null; // status id
    $i_alarm = $_REQUEST["i_alarm"] ?? null; // status id
    $i_pa = $_REQUEST["i_pa"] ?? null; // status id


    $step = (!empty($tor_status_id)) ? $tor_status_id : 0;
    $addConfDay1 = (!empty($i_alarm)) ? $i_alarm : 0;
    $addConfDay2 = (!empty($i_pa)) ? $i_pa : 0;

    if ($act == "SEARCH") {
        $wh .= ($_REQUEST['tor_type_id'] != 0) ? " and a.tor_type_id =" . $_REQUEST['tor_type_id'] : "";
        $wh .= ($_REQUEST['c_code'] != "") ? " and a.c_code like '%" . $_REQUEST['c_code'] . "%'" : "";
        $wh .= ($_REQUEST['d_doc_ref'] != "") ? " and a.d_doc_ref like '%" . $_REQUEST['d_doc_ref'] . "%'" : "";
        $wh .= (str_replace(",", "", $_REQUEST['f_total']) != "") ? " and a.f_total_amt like '%" . str_replace(",", "", $_REQUEST['f_total']) . "%'" : "";
        $wh .= ($_REQUEST['c_name'] != "") ? " and a.c_name like '%" . $_REQUEST['c_name'] . "%'" : "";
        $wh .= " and a.i_enabled =" . $_REQUEST['i_enabled'];
        if ($i_post != 0) {
            if ($i_post == 1) {
                $wh .= " and tor_status_id is not null";
            } else {
                $wh .= " and tor_status_id is null";
            }
        }
    } else {
        $wh .= ($tor_type_show == true) ? " and tor_status_id is null" : "";
    }


    $type_menu = $_REQUEST['type_menu'] ?? null;
    $sp_emp_id = $_SESSION['sp_emp_id'] ?? null;
    $c_code = (false) ? " and a.c_code='PR25660100094'" : "";

    $right = ($_SESSION['i_type_user'] === 2) ? "" : " and a.sp_emp_id = {$sp_emp_id}";

    $sqlTempTable = "select a.tor_id , a.po_expense_id , a.dc_expense_budget_type_id
                     , a.bg_budget_dtl_project_id
                        , a.dc_department_id
                        , a.po_creditor_id
                        , a.dc_cost_id
                        , a.dc_cost2_id
                        , a.sp_emp_id
                        , a.i_is_rename
                        , a.tor_type_id
                        , a.i_is_more
                        , a.i_step
                        , a.i_receive
                        , a.i_forword
                        , a.i_backword
                        , a.tor_status_id
                        , a.index_receive
                        , a.i_enabled
                        , a.i_type_bg
                        , a.i_hire_type, a.i_product_type, a.i_is_inv, a.i_type_fix_rate,i_delivery_date
                        , row_number() over (order by a.tor_id DESC) as row
                        from dbo.sp_tor a  where a.i_enabled=1 {$right} {$c_code} {$wh}";
    //    echo $sqlTempTable;
    //    exit();
    $arrParam[] = $start;
    $arrParam[] = $limit;

    $sqlMain = "select a.* , s.c_code
                        , s.i_is_register
                        , s.c_budget_dtl_project
                        , s.c_name
                        , s.c_department
                        , s.d_doc_ref
                        , (select top 1 c_name from dbo.sp_department  where dc_department_id=s.dc_department_id)  as dc_department_name
                        , (select top 1 c_code from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as c_code_status
                        , (select top 1 c_name from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as c_name_status
                        , (select top 1 i_entrance from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as i_is_entrance
                        , (select top 1 c_name from dbo.sp_type_status where sp_type_status_id=s.tor_type_id)  as c_type_name
                        , (select top 1 c_name from dbo.sp_emp where sp_emp_id=s.sp_emp_id)  as sp_emp_name
                        , (select top 1 isnull(c_comment,'') from sp_tor_item aa where aa.tor_id = s.tor_id and aa.sp_status_hdr_id = {$step}) c_comment_status
                        , isnull(s.i_purchase,1) as i_purchase
                        , isnull(s.tor_type_id,1) as tor_type_id
                        , s.f_period_amt
                        , s.f_total_amt
                        , isnull(s.i_parent,0) as i_parent
                        , isnull(s.i_is_parent,0) as i_is_parent
                        , isnull(s.index_receive,0) as index_receive
                        , isnull(s.i_type_fix_rate,0) as i_type_fix_rate
                        , s.start_date
                        , s.end_date
                        , s.c_comment
                        , convert(varchar, s.d_doc_date, 120) as d_doc_date
                        , s.i_edit
                        , s.i_type_bg
                        , s.c_remake
                        , s.i_yyyy as i_yyyy
                        , convert(varchar, s.d_tor_date, 120) as d_tor_date
                        , convert(varchar, s.d_tor_status_date, 120) as d_tor_status_date
                        , s.i_alarm_balance
                        , convert(varchar(10), DATEADD(day, " . $addConfDay1 . ", getdate()), 120) AS DateAdd1
                        , convert(varchar(10), DATEADD(day, " . $addConfDay2 . ", getdate()), 120) AS DateAdd2
                        , convert(varchar, s.d_tor_date_alert, 120) as d_tor_date_alert
                        , convert(varchar, s.d_tor_date_pa, 120) as d_tor_date_pa
                        , isnull((select top 1 i_bg_type from dbo.dc_expense_budget_type where dc_expense_budget_type_id=s.dc_expense_budget_type_id),0)  as i_bg_type
                        , (select top 1 c_name from dbo.po_creditor where po_creditor_id=a.po_creditor_id)  as po_creditor_idTxt
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=a.dc_cost_id)  as dc_cost_idTxt
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=a.dc_cost2_id)  as dc_cost2_idTxt

                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_create_id) as c_create_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_create_cost_id) as c_cost_creat_name
                        , convert(varchar, d_create, 120) as d_create
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_update_id) as c_update_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_update_cost_id) as c_cost_update_name
                        , convert(varchar, d_update, 120) as d_update
        , s.dc_expense_budget_type_id
        , s.f_type_amt
        , s.dc_expense_budget_type2_id

        , s.f_type2_amt
        , s.dc_expense_budget_type3_id
        , s.f_type3_amt
        , s.dc_expense_budget_type4_id
        , s.f_type4_amt
        , s.dc_expense_budget_type5_id
        , s.f_type5_amt
        "
            . " from ({$sqlTempTable}) a "
            . " inner join dbo.sp_tor s on s.tor_id=a.tor_id"
            . " WHERE a.row > ? and a.row <= ?";

    // dc_emp_id c_emp_name dc_cnt_id dc_cnt_name
    //             print_r($arrParam);
    //   echo $sqlMain;
    //    exit;

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    $i_purchase = array(0 => "", 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
    while ($row = $db->Fetch($stmt)) {

        $i_type_bg = null;
        $i_type_bgTxt = null;
        switch (intval($row["i_type_bg"])) {
            case 0:
                $i_type_bg = "color:#F43217";
                $i_type_bgTxt = '';
                break;
            case 1:
                $i_type_bg = "color:black";
                $i_type_bgTxt = 'การจัดทำ PR ปกติ';
                break;
            case 2:
                $i_type_bg = "color:#116CEF";
                $i_type_bgTxt = 'การจัดทำ PR หลักโครงการต่อเนื่อง(ไม่จองเงิน)';
                break;
            case 3:
                $i_type_bg = "color:#b085f5";
                $i_type_bgTxt = 'การจัดทำ PR ย่อยโครงการต่อเนื่อง(จองเงิน)';
                break;
            case 4:
                $i_type_bg = "color:#CD8114";
                $i_type_bgTxt = 'การจัดทำ PR ไม่จองเงิน (ใช้เงินกันเหลื่อม)';
                break;
            case 5:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'การจัดทำ PR จองเงินข้ามส่งเบิก';
                break;
            case 6:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'การจัดทำ PR จองเงินทำถึงสัญญา';
                break;
            case 7:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'การจัดทำ PR จองเงินทำถึงตรวจรับ';
                break;
            default:
                $i_type_bg = "color:#F43217";
                $i_type_bgTxt = '';
                break;
        }


        $c_codeStatus = "<b style='{$i_type_bg}'>" . $row["c_code"] . "</b>" . ($row["tor_status_id"] > 0 ? "<image id='img-" . $row['tor_id'] . "' src='../images/icons/database_start.png'/>" : "");

        $temp = array(
            "no" => $i++,
            "id" => intval($row["tor_id"]),
            "i_step" => intval($row["i_step"]),
            "i_edit" => intval($row["i_edit"]),
            "i_type_bg" => intval($row["i_type_bg"]),
            "i_type_bgTxt" => $i_type_bgTxt,
            "i_receive" => intval($row["i_receive"]),
            "i_is_entrance" => intval($row["i_is_entrance"]),
            "i_is_register" => intval($row["i_is_register"]),
            "i_forword" => intval($row["i_forword"]),
            "i_backword" => intval($row["i_backword"]),
            "index_receive" => intval($row["index_receive"]),
            "i_type_fix_rate" => intval($row["i_type_fix_rate"]),
            "c_code" => $row["c_code"],
            "i_bg_type" => $row["i_bg_type"],
            "c_codeStatus" => $c_codeStatus, //database_start.png
            "bg_budget_dtl_project_id" => intval($row["bg_budget_dtl_project_id"]),
            "i_is_more" => intval($row["i_is_more"]),
            "f_total_amt" => number_format($row["f_total_amt"], 2),
            "i_is_rename" => intval($row["i_is_rename"]),
            "c_budget_dtl_project" => $row["c_budget_dtl_project"],
            "c_name" => $row["c_name"],
            "txtdc_department_idID" => $row["dc_department_name"], //txtdc_department_idID txtdc_department_idID
            "c_code_status" => $row["c_code_status"],
            "c_name_status" => $row["c_name_status"],
            "tor_status_id" => $row["tor_status_id"],
            "dc_cost_id" => intval($row["dc_cost_id"]),
            "dc_cost2_id" => intval($row["dc_cost2_id"]),
            "sp_emp_name" => $row["sp_emp_name"],
            "txtsp_emp_idID" => $row["sp_emp_name"],
            "sp_emp_id" => intval($row["sp_emp_id"]),
            "dc_cost_idTxt" => $row["dc_cost_idTxt"],
            "dc_cost2_idTxt" => $row["dc_cost2_idTxt"],
            "dc_department_id" => intval($row["dc_department_id"]),
            "c_department" => $row["c_department"],
            "i_parent" => $row["i_parent"],
            "i_is_parent" => $row["i_is_parent"],
            "d_doc_ref" => $row["d_doc_ref"],
            "i_year" => $row["i_yyyy"],
            "i_yyyy" => $row["i_yyyy"],
            "c_year" => intval($row["i_yyyy"] + 543),
            "tor_type_id" => $row["tor_type_id"],
            "c_tor_type" => $row["c_type_name"], // $tor_type[$row["tor_type_id"]],
            "i_purchase" => intval($row["i_purchase"]),
            "c_purchase" => $i_purchase[$row["i_purchase"]],
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "po_expense_id" => intval($row["po_expense_id"]),
            "dc_user_create_id" => $row["c_create_name"],
            "dc_user_create_cost_id" => $row["c_cost_creat_name"],
            "DateAdd1" => ((empty($row["DateAdd1"])) ? "" : $date->extDateBuddha($row["DateAdd1"])), //d_tor_date d_tor_status_date
            "DateAdd2" => ((empty($row["DateAdd2"])) ? "" : $date->extDateBuddha($row["DateAdd2"])), //d_tor_date d_tor_status_date
            "d_tor_date_pa" => ((empty($row["d_tor_date_pa"])) ? "" : $date->extDateBuddha($row["d_tor_date_pa"])), //d_tor_date d_tor_status_date
            "d_tor_date" => ((empty($row["d_tor_date"])) ? "" : $date->extDateBuddha($row["d_tor_date"])), //d_tor_date d_tor_status_date
            "d_tor_status_date" => ((empty($row["d_tor_status_date"])) ? "" : $date->extDateBuddha($row["d_tor_status_date"])), //d_tor_date
            "d_doc_date" => ((empty($row["d_doc_date"])) ? "" : $date->extDateBuddha($row["d_doc_date"])), //d_tor_date
            "d_create" => $date->extDateBuddha($row["d_create"]), //
            "dc_user_update_id" => $row["c_update_name"],
            "dc_user_update_cost_id" => $row["c_cost_update_name"],
            "d_update" => $date->extDateBuddha($row["d_update"]),
            "start_date" => $date->extDateBuddha($row["start_date"]),
            "end_date" => $date->extDateBuddha($row["end_date"]),
            "i_enabled" => intval($row["i_enabled"]),
            "c_comment" => $row["c_comment"],
            "c_comment_status" => $row["c_comment_status"],
            "c_remake" => $row["c_remake"],
            "po_creditor_id" => intval($row["po_creditor_id"]),
            "po_creditor_idTxt" => $row["po_creditor_idTxt"],
            "i_hire_type" => $row["i_hire_type"],
            "i_is_inv" => $row["i_is_inv"],
            "i_type_fix_rate" => $row["i_type_fix_rate"],
            "i_product_type" => $row["i_product_type"],
            "i_delivery_date" => $row["i_delivery_date"],
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "dc_expense_budget_type2_id" => intval($row["dc_expense_budget_type2_id"]),
            "dc_expense_budget_type3_id" => intval($row["dc_expense_budget_type3_id"]),
            "dc_expense_budget_type4_id" => intval($row["dc_expense_budget_type4_id"]),
            "dc_expense_budget_type5_id" => intval($row["dc_expense_budget_type5_id"]),
            "f_type_amt" => number_format($row["f_type_amt"], 2),
            "f_type2_amt" => number_format($row["f_type2_amt"], 2),
            "f_type3_amt" => number_format($row["f_type3_amt"], 2),
            "f_type4_amt" => number_format($row["f_type4_amt"], 2),
            "f_type5_amt" => number_format($row["f_type5_amt"], 2),
        );
        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
    exit();
} else if ($type == "po_working_dtl") {
    $editArry = array(
        3 => '<span style="color:red">ส่งแก้ไข</span>' // พนักงานสายงาน
        ,
        2 => '<span style="color:red">ส่งแก้ไข</span>' // หัวหน้าสายงาน
        ,
        1 => '<span style="color:red">แก้ไขแล้ว</span>' // ธุระการ
        ,
        4 => '<span style="color:blue">แก้ไขแล้ว</span>',
        5 => '<span style="color:blue"></span>',
        6 => '<span style="color:blue"></span>'
    );

    $tor_status_id = $_REQUEST["tor_status_id"] ?? null; // status id
    $i_alarm = $_REQUEST["i_alarm"] ?? null; // status id
    $i_pa = $_REQUEST["i_pa"] ?? null; // status id


    $step = (!empty($tor_status_id)) ? $tor_status_id : 0;
    $addConfDay1 = (!empty($i_alarm)) ? $i_alarm : 0;
    $addConfDay2 = (!empty($i_pa)) ? $i_pa : 0;

    if ($act == "SEARCH") {
        $wh .= ($_REQUEST['tor_type_id'] != 0) ? " and a.tor_type_id =" . $_REQUEST['tor_type_id'] : "";
        $wh .= ($_REQUEST['c_code'] != "") ? " and a.c_code like '%" . $_REQUEST['c_code'] . "%'" : "";
        $wh .= ($_REQUEST['c_name'] != "") ? " and a.c_name like '%" . $_REQUEST['c_name'] . "%'" : "";
        $wh .= " and a.i_enabled =" . $_REQUEST['i_enabled'];
        if ($i_post != 0) {
            if ($i_post == 1) {
                $wh .= " and tor_status_id is not null";
            } else {
                $wh .= " and tor_status_id is null";
            }
        }
    } else {
        $wh .= ($tor_type_show == true) ? " and tor_status_id is null" : "";
    }


    $type_menu = $_REQUEST['type_menu'] ?? null;
    //             "i_hire_type" => $row["i_hire_type"],
    //             "i_is_inv" => $row["i_is_inv"],
    //             "i_type_fix_rate" => $row["i_type_fix_rate"],
    //             "i_product_type" => $row["i_product_type"] , a.i_hire_type, a.i_product_type, a.i_is_inv, a.i_type_fix_rate
    $sqlTempTable = "select a.tor_id
                  , a.po_expense_id
                    , a.dc_expense_budget_type_id
                     , a.bg_budget_dtl_project_id
                        , a.dc_department_id
                        , a.po_creditor_id
                        , a.dc_cost_id
                        , a.dc_cost2_id
                        , a.sp_emp_id
                        , a.i_is_rename
                        , a.tor_type_id
                        , a.i_is_more
                        , a.i_step
                        , a.i_receive
                        , a.i_forword
                        , a.i_backword
                        , a.tor_status_id
                        , a.index_receive
                        , a.i_enabled
                        , a.i_type_bg
                        , a.i_hire_type, a.i_product_type, a.i_is_inv, a.i_type_fix_rate,i_delivery_date
                        , row_number() over (order by a.tor_id DESC) as row
                        from dbo.sp_tor a  where a.i_is_notor = 0 and a.i_enabled=1 ";

    $sqlTempTable .= " and a.tor_status_id =" . $step . $wh . $util->viewDepartment('a', 0, $type_menu); //


    $arrParam[] = $start;
    $arrParam[] = $limit;

    $sqlMain = "select a.* , s.c_code
                        , s.i_is_register
                        , s.c_budget_dtl_project
                        , s.c_name
                        , s.c_department
                        , s.d_doc_ref
                        , (select top 1 c_name from dbo.sp_department  where dc_department_id=s.dc_department_id)  as dc_department_name
                        , (select top 1 c_code from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as c_code_status
                        , (select top 1 c_name from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as c_name_status
                        , (select top 1 i_entrance from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as i_is_entrance
                        , (select top 1 c_name from dbo.sp_type_status where sp_type_status_id=s.tor_type_id)  as c_type_name
                        , (select top 1 c_name from dbo.sp_emp where sp_emp_id=s.sp_emp_id)  as sp_emp_name
                        , (select top 1 isnull(c_comment,'') from sp_tor_item aa where aa.tor_id = s.tor_id and aa.sp_status_hdr_id = {$step}) c_comment_status
                        , isnull(s.i_purchase,1) as i_purchase
                        , isnull(s.tor_type_id,1) as tor_type_id
                        , s.f_period_amt
                        , s.f_total_amt
                        , isnull(s.i_parent,0) as i_parent
                        , isnull(s.i_is_parent,0) as i_is_parent
                        , isnull(s.index_receive,0) as index_receive
                        , isnull(s.i_type_fix_rate,0) as i_type_fix_rate
                        , s.start_date
                        , s.end_date
                        , s.c_comment
                        , convert(varchar, s.d_doc_date, 120) as d_doc_date
                        , s.i_edit
                        , s.i_type_bg
                        , s.c_remake
                        , s.plan_status
                        , s.plan_code
                        , s.i_amount_bg
                        ,s.f_type_amt
                        , s.bg_reserve_money1_id
                        ,CASE WHEN isnull(s.bg_reserve_money1_id,0)  =   0 THEN  (select top 1 isnull(bg_reserve_money_id,0) from dbo.sp_tor_dtl where sp_tor_id = s.tor_id)
                        ELSE isnull(s.bg_reserve_money1_id,0)  END as bg_check_id
                        , s.dc_expense_budget_type2_id
                        , s.f_type2_amt
                        , s.bg_reserve_money2_id
                        , s.dc_expense_budget_type3_id
                        , s.f_type3_amt
                        , s.bg_reserve_money3_id
                        , s.i_pr_type1
                        , s.i_pr_type2
                        , s.i_pr_type3
                        , s.i_yyyy as i_yyyy
                        , convert(varchar, (select top 1 act_date_dt from sp_tor_item where tor_id = s.tor_id and sp_status_hdr_id = 26 order by id desc ), 120) as d_act_date_dt26
                        , convert(varchar, s.d_tor_date, 120) as d_tor_date
                        , convert(varchar, s.d_tor_status_date, 120) as d_tor_status_date
                        , s.i_alarm_balance
                        , convert(varchar(10), DATEADD(day, " . $addConfDay1 . ", getdate()), 120) AS DateAdd1
                        , convert(varchar(10), DATEADD(day, " . $addConfDay2 . ", getdate()), 120) AS DateAdd2
                        , convert(varchar, s.d_tor_date_alert, 120) as d_tor_date_alert
                        , convert(varchar, s.d_tor_date_pa, 120) as d_tor_date_pa
                        , isnull((select top 1 i_bg_type from dbo.dc_expense_budget_type where dc_expense_budget_type_id=s.dc_expense_budget_type_id),0)  as i_bg_type
                        , (select top 1 c_name from dbo.po_creditor where po_creditor_id=a.po_creditor_id)  as po_creditor_idTxt
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=a.dc_cost_id)  as dc_cost_idTxt
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=a.dc_cost2_id)  as dc_cost2_idTxt
                        , (select top 1 i_enabled from sp_tor_delete where s.tor_id = sp_tor_id and i_enabled = 1 ) as sp_tor_delete
                        , (select top 1 c_comment from sp_tor_delete where s.tor_id = sp_tor_id and i_enabled = 1 ) as tor_delete_comment
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_create_id) as c_create_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_create_cost_id) as c_cost_creat_name
                        , convert(varchar, d_create, 120) as d_create
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_update_id) as c_update_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_update_cost_id) as c_cost_update_name
                        , convert(varchar, d_update, 120) as d_update
        , (select i_type from sp_type_bg where i_value =  s.i_type_bg ) as sp_type_bg
        , s.dc_expense_budget_type_id
        , s.f_type_amt
        , s.dc_expense_budget_type2_id

        , s.f_type2_amt
        , s.dc_expense_budget_type3_id
        , s.f_type3_amt
        , s.dc_expense_budget_type4_id
        , s.f_type4_amt
        , s.dc_expense_budget_type5_id
        , s.f_type5_amt
        "
            . " from ({$sqlTempTable}) a "
            . " inner join dbo.sp_tor s on s.tor_id=a.tor_id"
            . " WHERE a.row > ? and a.row <= ?";

    // dc_emp_id c_emp_name dc_cnt_id dc_cnt_name
    //             print_r($arrParam);
    //   echo $sqlMain;
    //    exit;

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    $i_purchase = array(0 => "", 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
    while ($row = $db->Fetch($stmt)) {
        //        $txtEdit = ($row['i_edit'] == (1 || 4 || 5 || 6 )) ? $editArry[$row['i_edit']] :
        //
        $i_type_bg = null;
        $i_type_bgTxt = null;
        $sp = null;
        if ($row["sp_tor_delete"] == 1) {
            $sp = "<b style='color:#F43217'>" . $row["c_name"] . "</b>";
        }
        switch (intval($row["i_type_bg"])) {
            case 0:
                $i_type_bg = "color:#F43217";
                $i_type_bgTxt = '';
                break;
            case 1:
                $i_type_bg = "color:black";
                $i_type_bgTxt = 'การจัดทำ PR ปกติ';
                break;
            case 2:
                $i_type_bg = "color:#116CEF";
                $i_type_bgTxt = 'การจัดทำ PR หลักโครงการต่อเนื่อง(ไม่จองเงิน)';
                break;
            case 3:
                $i_type_bg = "color:#b085f5";
                $i_type_bgTxt = 'การจัดทำ PR ย่อยโครงการต่อเนื่อง(จองเงิน)';
                break;
            case 4:
                $i_type_bg = "color:#CD8114";
                $i_type_bgTxt = 'การจัดทำ PR ไม่จองเงิน (ใช้เงินกันเหลื่อม)';
                break;
            case 5:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'การจัดทำ PR จองเงินข้ามส่งเบิก';
                break;
            case 6:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'การจัดทำ PR จองเงินทำถึงสัญญา';
                break;
            case 7:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'การจัดทำ PR จองเงินทำถึงตรวจรับ';
                break;
            case 11:
                $i_type_bg = "color:#B8860B";
                $i_type_bgTxt = 'PR ไม่จองเงินทำถึงตรวจรับ';
                break;
            case 12:
                $i_type_bg = "color:#000080";
                $i_type_bgTxt = 'PR ก่อนปีงบประมาณ';
                break;
            default:
                $i_type_bg = "color:#F43217";
                $i_type_bgTxt = '';
                break;
        }
        $c_codeStatus = "<b style='{$i_type_bg}'>" . $row["c_code"] . "</b>" . ($row["tor_status_id"] > 0 ? "<image id='img-" . $row['tor_id'] . "' src='../images/icons/database_start.png'/>" : "");

        $temp = array(
            "no" => $i++,
            "id" => intval($row["tor_id"]),
            "i_step" => intval($row["i_step"]),
            "i_edit" => intval($row["i_edit"]),
            "i_type_bg" => intval($row["i_type_bg"]),
            "i_type_bgTxt" => $i_type_bgTxt,
            "i_receive" => intval($row["i_receive"]),
            "sp_tor_delete" => $row["sp_tor_delete"],
            "sp_type_bg" => $row["sp_type_bg"],
            "tor_delete_comment" => $row["tor_delete_comment"],
            "c_nameStatus" => $sp ?? $row["c_name"], //
            "i_is_entrance" => intval($row["i_is_entrance"]),
            "i_is_register" => intval($row["i_is_register"]),
            "i_forword" => intval($row["i_forword"]),
            "i_backword" => intval($row["i_backword"]),
            "index_receive" => intval($row["index_receive"]),
            "i_type_fix_rate" => intval($row["i_type_fix_rate"]),
            "c_code" => $row["c_code"],
            "i_bg_type" => $row["i_bg_type"],
            "i_amount_bg" => $row["i_amount_bg"] == null ? 1 : $row["i_amount_bg"],
            "c_codeStatus" => $c_codeStatus, //database_start.png
            "bg_budget_dtl_project_id" => intval($row["bg_budget_dtl_project_id"]),
            "i_is_more" => intval($row["i_is_more"]),
            "f_total_amt" => number_format($row["f_total_amt"], 2),
            "i_is_rename" => intval($row["i_is_rename"]),
            "c_budget_dtl_project" => $row["c_budget_dtl_project"],
            "c_name" => $row["c_name"],
            "txtdc_department_idID" => $row["dc_department_name"], //txtdc_department_idID txtdc_department_idID
            "c_code_status" => $row["c_code_status"],
            "c_name_status" => $row["c_name_status"],
            "tor_status_id" => $row["tor_status_id"],
            "dc_cost_id" => intval($row["dc_cost_id"]),
            "dc_cost2_id" => intval($row["dc_cost2_id"]),
            "sp_emp_name" => $row["sp_emp_name"],
            "txtsp_emp_idID" => $row["sp_emp_name"],
            "sp_emp_id" => intval($row["sp_emp_id"]),
            "dc_cost_idTxt" => $row["dc_cost_idTxt"],
            "dc_cost2_idTxt" => $row["dc_cost2_idTxt"],
            "dc_department_id" => intval($row["dc_department_id"]),
            "c_department" => $row["c_department"],
            "i_parent" => $row["i_parent"],
            "i_is_parent" => $row["i_is_parent"],
            "d_doc_ref" => $row["d_doc_ref"],
            "i_year" => $row["i_yyyy"],
            "i_yyyy" => $row["i_yyyy"],
            "c_year" => intval($row["i_yyyy"] + 543),
            "tor_type_id" => $row["tor_type_id"],
            "c_tor_type" => $row["c_type_name"], // $tor_type[$row["tor_type_id"]],
            "i_purchase" => intval($row["i_purchase"]),
            "c_purchase" => $i_purchase[$row["i_purchase"]],
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "po_expense_id" => intval($row["po_expense_id"]),
            "dc_user_create_id" => $row["c_create_name"],
            "dc_user_create_cost_id" => $row["c_cost_creat_name"],
            "DateAdd1" => ((empty($row["DateAdd1"])) ? "" : $date->extDateBuddha($row["DateAdd1"])), //d_tor_date d_tor_status_date
            "DateAdd2" => ((empty($row["DateAdd2"])) ? "" : $date->extDateBuddha($row["DateAdd2"])), //d_tor_date d_tor_status_date
            "d_tor_date_pa" => ((empty($row["d_tor_date_pa"])) ? "" : $date->extDateBuddha($row["d_tor_date_pa"])), //d_tor_date d_tor_status_date
            "d_tor_date" => ((empty($row["d_tor_date"])) ? "" : $date->extDateBuddha($row["d_tor_date"])), //d_tor_date d_tor_status_date
            "d_tor_status_date" => ((empty($row["d_tor_status_date"])) ? "" : $date->extDateBuddha($row["d_tor_status_date"])), //d_tor_date
            "d_doc_date" => ((empty($row["d_doc_date"])) ? "" : $date->extDateBuddha($row["d_doc_date"])), //d_tor_date
            "d_create" => $date->extDateBuddha($row["d_create"]), //
            "d_act_date_dt26" => $date->extDateBuddha($row["d_act_date_dt26"]), //
            "dc_user_update_id" => $row["c_update_name"],
            "dc_user_update_cost_id" => $row["c_cost_update_name"],
            "d_update" => $date->extDateBuddha($row["d_update"]),
            "start_date" => $date->extDateBuddha($row["start_date"]),
            "end_date" => $date->extDateBuddha($row["end_date"]),
            "i_enabled" => intval($row["i_enabled"]),
            "c_comment" => $row["c_comment"],
            "c_comment_status" => $row["c_comment_status"],
            "c_remake" => $row["c_remake"],
            "plan_status" => $row["plan_status"],
            "plan_code" => $row["plan_code"],
            "po_creditor_id" => intval($row["po_creditor_id"]),
            "po_creditor_idTxt" => $row["po_creditor_idTxt"],
            "i_hire_type" => $row["i_hire_type"],
            "i_is_inv" => $row["i_is_inv"],
            "i_type_fix_rate" => $row["i_type_fix_rate"],
            "i_product_type" => $row["i_product_type"],
            "i_delivery_date" => $row["i_delivery_date"],
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "dc_expense_budget_type2_id" => intval($row["dc_expense_budget_type2_id"]),
            "dc_expense_budget_type3_id" => intval($row["dc_expense_budget_type3_id"]),
            "dc_expense_budget_type4_id" => intval($row["dc_expense_budget_type4_id"]),
            "dc_expense_budget_type5_id" => intval($row["dc_expense_budget_type5_id"]),
            "f_type_amt" => number_format($row["f_type_amt"], 2),
            "f_type2_amt" => number_format($row["f_type2_amt"], 2),
            "f_type3_amt" => number_format($row["f_type3_amt"], 2),
            "f_type4_amt" => number_format($row["f_type4_amt"], 2),
            "f_type5_amt" => number_format($row["f_type5_amt"], 2),
            "bg_reserve_money1_id" => $row["bg_reserve_money1_id"],
            "bg_reserve_money2_id" => $row["bg_reserve_money2_id"],
            "bg_reserve_money3_id" => $row["bg_reserve_money3_id"],
            "i_pr_type1" => $row["i_pr_type1"],
            "i_pr_type2" => $row["i_pr_type2"],
            "i_pr_type3" => $row["i_pr_type3"],
        );
        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
    exit();
} else if ($type == "List_alert_admin") {


    // $submode = $_REQUEST['submode'] ?? null;
    // if ($submode == "sleep") {
    //     //    sleep(6);
    // }
    // $editArry = array(3 => '<span style="color:red">ส่งแก้ไข</span>' // พนักงานสายงาน
    //     , 2 => '<span style="color:red">ส่งแก้ไข</span>' // หัวหน้าสายงาน
    //     , 1 => '<span style="color:red">แก้ไขแล้ว</span>' // ธุระการ
    //     , 4 => '<span style="color:blue">แก้ไขแล้ว</span>'
    //     , 5 => '<span style="color:blue"></span>'
    //     , 6 => '<span style="color:blue"></span>'
    // );

    $tor_status_id = $_REQUEST["tor_status_id"] ?? null; // status id
    $i_alarm = $_REQUEST["i_alarm"] ?? null; // status id
    $i_pa = $_REQUEST["i_pa"] ?? null; // status id


    $step = (!empty($tor_status_id)) ? $tor_status_id : 0;
    $addConfDay1 = (!empty($i_alarm)) ? $i_alarm : 0;
    $addConfDay2 = (!empty($i_pa)) ? $i_pa : 0;

    if ($act == "SEARCH") {
        $wh .= ($_REQUEST['tor_type_id'] != 0) ? " and a.tor_type_id =" . $_REQUEST['tor_type_id'] : "";
        $wh .= ($_REQUEST['c_code'] != "") ? " and a.c_code like '%" . $_REQUEST['c_code'] . "%'" : "";
        $wh .= ($_REQUEST['c_name'] != "") ? " and a.c_name like '%" . $_REQUEST['c_name'] . "%'" : "";
        $wh .= " and a.i_enabled =" . $_REQUEST['i_enabled'];

        if ($_REQUEST['i_post1'] == 1) {
            $wh .= " and a.sp_emp_id =" . $_REQUEST['sp_emp_id'];
        }
        if ($i_post != 0) {
            if ($i_post == 1) {
                $wh .= " and tor_status_id is not null";
            } else {
                $wh .= " and tor_status_id is null";
            }
        }
    } else {
        $wh .= ($tor_type_show == true) ? " and tor_status_id is null" : "";
    }


    // $is_audit = $_REQUEST['is_audit'] ?? null;
    // if ($is_audit == 'true') {
    //     $waudit = "and a.i_is_register in (2 , 1)";
    // } else {
    //     $waudit = "";
    // }
    $sqlTempTable = "select a.tor_id
                    , a.po_expense_id as po_expense_main_id
                    , a.dc_expense_budget_type_id
                     , a.bg_budget_dtl_project_id
                        , a.dc_department_id
                        , a.po_creditor_id
                        , a.dc_cost_id
                        , a.dc_cost2_id
                        , a.sp_emp_id
                        , a.i_is_rename
                        , a.tor_type_id
                        , a.i_is_more
                        , a.i_step
                        , a.i_receive
                        , a.i_forword
                        , a.i_backword
                        , a.tor_status_id
                        , a.index_receive
                        , a.i_enabled
                        , a.i_is_request
                        , row_number() over (order by a.tor_id DESC) as row
                        from dbo.sp_tor a  where a.i_is_notor = 0 and a.i_enabled=1 ";

    $sqlTempTable .= " and a.tor_status_id ={$step} " . $wh . $util->viewDepartment('a', 0); //


    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlMain = "select a.* , s.c_code
                        , s.i_is_register
                        ,case when
                            ss.sp_tor_id = s.tor_id  then 1
                            else 0
                            end  as contract_no
                        , s.c_budget_dtl_project
                        , s.c_name
                        , s.c_department
                        , isnull(ss.bg_reserve_money1_id,0) as bg_reserve_money_contract
                        , s.d_doc_ref
                        , isnull(ss.sp_tor_contract_id,0) as  sp_tor_contract_id
                        , (select top 1 po_expense_id  from dbo.sp_tor_dtl  where sp_tor_id=s.tor_id)  as po_expense_id
                        , (select top 1 c_name from dbo.sp_department  where dc_department_id=s.dc_department_id)  as dc_department_name
                        , (select top 1 c_code from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as c_code_status
                        , (select top 1 c_name from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as c_name_status
                        , (select top 1 i_entrance from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as i_is_entrance
                        , (select top 1 c_name from dbo.sp_type_status where sp_type_status_id=s.tor_type_id)  as c_type_name
                        , (select top 1 c_name from dbo.sp_emp where sp_emp_id=s.sp_emp_id)  as sp_emp_name
                        , (select top 1 isnull(c_comment,'') from sp_tor_item aa where aa.tor_id = s.tor_id and aa.sp_status_hdr_id = {$step}) c_comment_status
                        , isnull(s.i_purchase,1) as i_purchase
                        , isnull(s.tor_type_id,1) as tor_type_id
                        , s.f_period_amt
                        , s.f_total_amt
                        , isnull(s.i_parent,0) as i_parent
                        , isnull(s.i_is_parent,0) as i_is_parent
                        , isnull(s.index_receive,0) as index_receive
                        , isnull(s.i_type_fix_rate,0) as i_type_fix_rate
                        , s.start_date
                        , s.end_date
                        , s.c_comment
                        , convert(varchar, s.d_doc_date, 120) as d_doc_date
                        , s.i_edit
                        , s.i_type_bg
                        , s.c_remake
                        , s.i_yyyy as i_yyyy
                        , convert(varchar, s.d_tor_date, 120) as d_tor_date
                        , convert(varchar, s.d_tor_status_date, 120) as d_tor_status_date
                        , s.i_alarm_balance
                        , convert(varchar(10), DATEADD(day, " . $addConfDay1 . ", getdate()), 120) AS DateAdd1
                        , convert(varchar(10), DATEADD(day, " . $addConfDay2 . ", getdate()), 120) AS DateAdd2
                        , convert(varchar, s.d_tor_date_alert, 120) as d_tor_date_alert
                        , convert(varchar, s.d_tor_date_pa, 120) as d_tor_date_pa
                        , isnull((select top 1 i_bg_type from dbo.dc_expense_budget_type where dc_expense_budget_type_id=s.dc_expense_budget_type_id),0)  as i_bg_type
                        , (select top 1 c_name from dbo.po_creditor where po_creditor_id=a.po_creditor_id)  as po_creditor_idTxt
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=a.dc_cost_id)  as dc_cost_idTxt
                        , (SELECT TOP 1 c_name FROM dbo.dc_cost WHERE dc_cost_id=a.dc_cost2_id)  AS dc_cost2_idTxt
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_create_id) as c_create_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_create_cost_id) as c_cost_creat_name
                        , convert(varchar, s.d_create, 120) as d_create
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_update_id) as c_update_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_update_cost_id) as c_cost_update_name
                        , convert(varchar, s.d_update, 120) as d_update
        , s.dc_expense_budget_type_id
        , s.f_type_amt
        , s.bg_reserve_money1_id
        , CASE WHEN s.i_purchase > 1 THEN s.bg_reserve_money1_id
          ELSE (select top 1 bg_reserve_money_id from dbo.sp_tor_dtl where sp_tor_id = s.tor_id) END as bg_check_id
        , s.dc_expense_budget_type2_id
        , s.f_type2_amt
         , s.bg_reserve_money2_id
        , s.dc_expense_budget_type3_id
        , s.f_type3_amt
         , s.bg_reserve_money3_id
        , s.dc_expense_budget_type4_id
        , s.f_type4_amt
         , s.bg_reserve_money4_id
        , s.dc_expense_budget_type5_id
        , s.f_type5_amt
         , s.bg_reserve_money5_id
        , s.i_pr_type1
        , s.i_pr_type2
        , s.i_pr_type3
        , s.i_pr_type4
        , s.i_pr_type5
        "
            . " from ({$sqlTempTable}) a "
            . " inner join dbo.sp_tor s on s.tor_id=a.tor_id"
            . " left join dbo.sp_tor_contract ss on ss.sp_tor_id = s.tor_id "
            . " WHERE a.row > ? and a.row <= ?";

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    $i_purchase = array(0 => '', 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
    while ($row = $db->Fetch($stmt)) {
        $i_type_bg = null;
        $i_type_bgTxt = null;
        switch (intval($row["i_type_bg"])) {
            case 0:
                $i_type_bg = "color:#F43217";
                $i_type_bgTxt = '';
                break;
            case 1:
                $i_type_bg = "color:black";
                $i_type_bgTxt = 'การจัดทำ PR ปกติ';
                break;
            case 2:
                $i_type_bg = "color:#116CEF";
                $i_type_bgTxt = 'การจัดทำ PR หลักโครงการต่อเนื่อง(ไม่จองเงิน)';
                break;
            case 3:
                $i_type_bg = "color:#b085f5";
                $i_type_bgTxt = 'การจัดทำ PR ย่อยโครงการต่อเนื่อง(จองเงิน)';
                break;
            case 4:
                $i_type_bg = "color:#CD8114";
                $i_type_bgTxt = 'การจัดทำ PR ไม่จองเงิน (ใช้เงินกันเหลื่อม)';
                break;
            case 5:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'การจัดทำ PR จองเงินข้ามส่งเบิก';
                break;
            case 6:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'การจัดทำ PR จองเงินทำถึงสัญญา';
                break;
            case 7:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'การจัดทำ PR จองเงินทำถึงตรวจรับ';
                break;
            default:
                $i_type_bg = "color:#F43217";
                $i_type_bgTxt = '';
                break;
        }
        $c_codeStatus = "<b style='{$i_type_bg}'>" . $row["c_code"] . "</b>" . ($row["tor_status_id"] > 0 ? "<image id='img-" . $row['tor_id'] . "' src='../images/icons/database_start.png'/>" : "");

        $temp = array(
            "no" => $i++,
            "id" => intval($row["tor_id"]),
            "i_type_bg" => intval($row["i_type_bg"]),
            "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
            "i_type_bgTxt" => $i_type_bgTxt,
            "i_step" => intval($row["i_step"]),
            "i_edit" => intval($row["i_edit"]),
            "i_receive" => intval($row["i_receive"]),
            "i_is_entrance" => intval($row["i_is_entrance"]),
            "i_is_register" => intval($row["i_is_register"]),
            "i_forword" => intval($row["i_forword"]),
            "i_backword" => intval($row["i_backword"]),
            "index_receive" => $row["index_receive"],
            "i_type_fix_rate" => intval($row["i_type_fix_rate"]),
            "c_code" => $row["c_code"],
            "bg_reserve_money_contract" => $row["bg_reserve_money_contract"],
            "i_bg_type" => intVal($row["i_bg_type"]),
            "i_is_request" => intVal($row["i_is_request"]),
            "contract_no" => $row["contract_no"],
            "c_codeStatus" => $c_codeStatus,
            "bg_budget_dtl_project_id" => intval($row["bg_budget_dtl_project_id"]),
            "i_is_more" => intval($row["i_is_more"]),
            "f_total_amt" => number_format($row["f_total_amt"], 2),
            "i_is_rename" => intval($row["i_is_rename"]),
            "c_budget_dtl_project" => $row["c_budget_dtl_project"],
            "c_name" => $row["c_name"],
            "txtdc_department_idID" => $row["dc_department_name"], //txtdc_department_idID txtdc_department_idID
            "c_code_status" => $row["c_code_status"],
            "c_name_status" => $row["c_name_status"],
            "tor_status_id" => $row["tor_status_id"],
            "bg_check_id" => intval($row["bg_check_id"]),
            "dc_cost_id" => intval($row["dc_cost_id"]),
            "dc_cost_idTxt" => $row["dc_cost_idTxt"],
            "dc_cost2_id" => intval($row["dc_cost2_id"]),
            "dc_cost2_idTxt" => $row["dc_cost2_idTxt"],
            "sp_emp_name" => $row["sp_emp_name"],
            "txtsp_emp_idID" => $row["sp_emp_name"],
            "sp_emp_id" => intval($row["sp_emp_id"]),
            "dc_department_id" => intval($row["dc_department_id"]),
            "c_department" => $row["c_department"],
            "i_parent" => $row["i_parent"],
            "i_is_parent" => $row["i_is_parent"],
            "d_doc_ref" => $row["d_doc_ref"],
            "i_year" => $row["i_yyyy"],
            "i_yyyy" => $row["i_yyyy"],
            "c_year" => intval($row["i_yyyy"] + 543),
            "tor_type_id" => $row["tor_type_id"],
            "c_tor_type" => $row["c_type_name"], // $tor_type[$row["tor_type_id"]],
            "i_purchase" => intval($row["i_purchase"]),
            "c_purchase" => $i_purchase[$row["i_purchase"]],
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "po_expense_id" => intval(($row["po_expense_id"] == 0 ? $row["po_expense_main_id"] : $row["po_expense_id"])),
            "po_expense_main_id" => intval($row["po_expense_main_id"]),
            "dc_user_create_id" => $row["c_create_name"],
            "dc_user_create_cost_id" => $row["c_cost_creat_name"],
            "DateAdd1" => ((empty($row["DateAdd1"])) ? "" : $date->extDateBuddha($row["DateAdd1"])), //d_tor_date d_tor_status_date
            "DateAdd2" => ((empty($row["DateAdd2"])) ? "" : $date->extDateBuddha($row["DateAdd2"])), //d_tor_date d_tor_status_date
            "d_tor_date_pa" => ((empty($row["d_tor_date_pa"])) ? "" : $date->extDateBuddha($row["d_tor_date_pa"])), //d_tor_date d_tor_status_date
            "d_tor_date" => ((empty($row["d_tor_date"])) ? "" : $date->extDateBuddha($row["d_tor_date"])), //d_tor_date d_tor_status_date
            "d_tor_status_date" => ((empty($row["d_tor_status_date"])) ? "" : $date->extDateBuddha($row["d_tor_status_date"])), //d_tor_date
            "d_doc_date" => ((empty($row["d_doc_date"])) ? "" : $date->extDateBuddha($row["d_doc_date"])), //d_tor_date
            "d_create" => $date->extDateBuddha($row["d_create"]), //
            "dc_user_update_id" => $row["c_update_name"],
            "dc_user_update_cost_id" => $row["c_cost_update_name"],
            "d_update" => $date->extDateBuddha($row["d_update"]),
            "start_date" => $date->extDateBuddha($row["start_date"]),
            "end_date" => $date->extDateBuddha($row["end_date"]),
            "i_enabled" => intval($row["i_enabled"]),
            "tor_hdr_dtl" => intval($row["tor_hdr_dtl"]),
            "c_comment" => $row["c_comment"],
            "c_comment_status" => $row["c_comment_status"],
            "c_remake" => $row["c_remake"],
            "po_creditor_id" => intval($row["po_creditor_id"]),
            "po_creditor_idTxt" => $row["po_creditor_idTxt"],
            "i_type_contract" => $row["i_type_contract"],
            "i_hire_type" => $row["i_hire_type"],
            "i_is_inv" => $row["i_is_inv"],
            "i_type_fix_rate" => $row["i_type_fix_rate"],
            "i_product_type" => $row["i_product_type"],
            "i_delivery_date" => $row["i_delivery_date"],
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "dc_expense_budget_type2_id" => intval($row["dc_expense_budget_type2_id"]),
            "dc_expense_budget_type3_id" => intval($row["dc_expense_budget_type3_id"]),
            "dc_expense_budget_type4_id" => intval($row["dc_expense_budget_type4_id"]),
            "dc_expense_budget_type5_id" => intval($row["dc_expense_budget_type5_id"]),
            "f_type_amt" => number_format($row["f_type_amt"], 2),
            "f_type2_amt" => number_format($row["f_type2_amt"], 2),
            "f_type3_amt" => number_format($row["f_type3_amt"], 2),
            "f_type4_amt" => number_format($row["f_type4_amt"], 2),
            "f_type5_amt" => number_format($row["f_type5_amt"], 2),
            "i_pr_type1" => $row["i_pr_type1"],
            "i_pr_type2" => $row["i_pr_type2"],
            "i_pr_type3" => $row["i_pr_type3"],
            "i_pr_type4" => $row["i_pr_type4"],
            "i_pr_type5" => $row["i_pr_type5"],
            "bg_reserve_money1_id" => $row["bg_reserve_money1_id"],
            "bg_reserve_money2_id" => $row["bg_reserve_money2_id"],
            "bg_reserve_money3_id" => $row["bg_reserve_money3_id"],
            "bg_reserve_money4_id" => $row["bg_reserve_money4_id"],
            "bg_reserve_money5_id" => $row["bg_reserve_money5_id"],
        );
        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
    exit();
} else if ($type == "pr_withdraw") {


    $submode = $_REQUEST['submode'] ?? null;
    if ($submode == "sleep") {
        //    sleep(6);
    }

    $editArry = array(
        3 => '<span style="color:red">ส่งแก้ไข</span>' // พนักงานสายงาน
        ,
        2 => '<span style="color:red">ส่งแก้ไข</span>' // หัวหน้าสายงาน
        ,
        1 => '<span style="color:red">แก้ไขแล้ว</span>' // ธุระการ
        ,
        4 => '<span style="color:blue">แก้ไขแล้ว</span>',
        5 => '<span style="color:blue"></span>',
        6 => '<span style="color:blue"></span>'
    );

    $tor_status_id = $_REQUEST["tor_status_id"] ?? null; // status id
    $i_alarm = $_REQUEST["i_alarm"] ?? null; // status id
    $i_pa = $_REQUEST["i_pa"] ?? null; // status id


    $step = (!empty($tor_status_id)) ? $tor_status_id : 0;
    $addConfDay1 = (!empty($i_alarm)) ? $i_alarm : 0;
    $addConfDay2 = (!empty($i_pa)) ? $i_pa : 0;

    if ($act == "SEARCH") {
        $wh .= ($_REQUEST['tor_type_id'] != 0) ? " and a.tor_type_id =" . $_REQUEST['tor_type_id'] : "";
        $wh .= ($_REQUEST['c_code'] != "") ? " and a.c_code like '%" . $_REQUEST['c_code'] . "%'" : "";
        $wh .= ($_REQUEST['c_name'] != "") ? " and a.c_name like '%" . $_REQUEST['c_name'] . "%'" : "";
        $wh .= " and a.i_enabled =" . $_REQUEST['i_enabled'];

        if ($_REQUEST['i_post1'] == 1) {
            $wh .= " and a.sp_emp_id =" . $_REQUEST['sp_emp_id'];
        }
        if ($i_post != 0) {
            if ($i_post == 1) {
                $wh .= " and tor_status_id is not null";
            } else {
                $wh .= " and tor_status_id is null";
            }
        }
    } else {
        $wh .= ($tor_type_show == true) ? " and tor_status_id is null" : "";
    }
    $i_level = $_SESSION['i_level'];
    $dc_department = $_SESSION['dc_department_id'];
    $sp_emp_id = $_SESSION['sp_emp_id'];
    // print_r($_SESSION);
    $where = ' ';
    if ($i_level == 1) {
        $where = ' ';
    } else if ($i_level == 2) {
        $where = ' and a.dc_department_id = ' . $dc_department;
    } else if ($i_level == 3) {
        $where = ' and a.sp_emp_id = ' . $sp_emp_id;
    }

    $is_audit = $_REQUEST['is_audit'] ?? null;

    $waudit = "";
    if ($is_audit == 'true') {
        $waudit = "and a.i_is_register in (2 , 1)";
    } else {
        $waudit = "";
    }
    $sqlTempTable = "select a.tor_id
                    , a.po_expense_id as po_expense_main_id
                    , a.dc_expense_budget_type_id
                     , a.bg_budget_dtl_project_id
                        , a.dc_department_id
                        , a.po_creditor_id
                        , a.dc_cost_id
                        , a.dc_cost2_id
                        , a.sp_emp_id
                        , a.i_is_rename
                        , a.tor_type_id
                        , a.i_is_more
                        , a.i_step
                        , a.i_receive
                        , a.i_forword
                        , a.i_backword
                        , a.tor_status_id
                        , a.index_receive
                        , a.i_enabled
                        , a.i_is_request
                        , (select count (sp_tor_dtl_id) from sp_tor_dtl aa where  aa. sp_tor_id = a.tor_id ) as tor_hdr_dtl
                        , a.i_type_contract, a.i_hire_type, isnull(a.i_product_type,0) as i_product_type, a.i_is_inv, a.i_type_fix_rate,i_delivery_date
                        , row_number() over (order by a.tor_id DESC) as row
                        from dbo.sp_tor a  where a.i_is_notor = 0 and a.i_enabled=1 {$waudit} {$where}";

    $sqlTempTable .= " and a.tor_status_id ={$step} " . $wh;
    // $util->viewDepartment('a', 0)

    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlMain = "select a.* , s.c_code
                        , s.i_is_register
                        ,case when
                            ss.sp_tor_id = s.tor_id  then 1
                            else 0
                            end  as contract_no
                        , s.c_budget_dtl_project
                        , s.c_name
                        , s.c_department
                        , isnull(ss.bg_reserve_money1_id,0) as bg_reserve_money_contract
                        , s.d_doc_ref
                        , isnull(ss.sp_tor_contract_id,0) as  sp_tor_contract_id
                        , (select top 1 po_expense_id  from dbo.sp_tor_dtl  where sp_tor_id=s.tor_id)  as po_expense_id
                        , (select top 1 c_name from dbo.sp_department  where dc_department_id=s.dc_department_id)  as dc_department_name
                        , (select top 1 c_code from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as c_code_status
                        , (select top 1 c_name from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as c_name_status
                        , (select top 1 i_entrance from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as i_is_entrance
                        , (select top 1 c_name from dbo.sp_type_status where sp_type_status_id=s.tor_type_id)  as c_type_name
                        , (select top 1 c_name from dbo.sp_emp where sp_emp_id=s.sp_emp_id)  as sp_emp_name
                        , (select top 1 isnull(c_comment,'') from sp_tor_item aa where aa.tor_id = s.tor_id and aa.sp_status_hdr_id = {$step}) c_comment_status
                        , isnull(s.i_purchase,1) as i_purchase
                        , isnull(s.tor_type_id,1) as tor_type_id
                        , s.f_period_amt
                        , s.f_total_amt
                        , isnull(s.i_parent,0) as i_parent
                        , isnull(s.i_is_parent,0) as i_is_parent
                        , isnull(s.index_receive,0) as index_receive
                        , isnull(s.i_type_fix_rate,0) as i_type_fix_rate
                        , s.start_date
                        , s.end_date
                        , s.c_comment
                        , convert(varchar, s.d_doc_date, 120) as d_doc_date
                        , s.i_edit
                        , s.i_type_bg
                        , s.c_remake
                        , s.i_yyyy as i_yyyy
                        , convert(varchar, s.d_tor_date, 120) as d_tor_date
                        , convert(varchar, s.d_tor_status_date, 120) as d_tor_status_date
                        , s.i_alarm_balance
                        , convert(varchar(10), DATEADD(day, " . $addConfDay1 . ", getdate()), 120) AS DateAdd1
                        , convert(varchar(10), DATEADD(day, " . $addConfDay2 . ", getdate()), 120) AS DateAdd2
                        , convert(varchar, s.d_tor_date_alert, 120) as d_tor_date_alert
                        , convert(varchar, s.d_tor_date_pa, 120) as d_tor_date_pa
                        , isnull((select top 1 i_bg_type from dbo.dc_expense_budget_type where dc_expense_budget_type_id=s.dc_expense_budget_type_id),0)  as i_bg_type
                        , (select top 1 c_name from dbo.po_creditor where po_creditor_id=a.po_creditor_id)  as po_creditor_idTxt
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=a.dc_cost_id)  as dc_cost_idTxt
                        , (SELECT TOP 1 c_name FROM dbo.dc_cost WHERE dc_cost_id=a.dc_cost2_id)  AS dc_cost2_idTxt
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_create_id) as c_create_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_create_cost_id) as c_cost_creat_name
                        , convert(varchar, s.d_create, 120) as d_create
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_update_id) as c_update_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_update_cost_id) as c_cost_update_name
                        , convert(varchar, s.d_update, 120) as d_update
                        , convert(varchar,(select d_doc_arrive_dt from sp_check_period_hdr where sp_tor_contract_id  = ss.sp_tor_contract_id ), 120 ) as  d_doc_arrive_dt
        , s.dc_expense_budget_type_id
        , s.f_type_amt
        , s.bg_reserve_money1_id
        , CASE WHEN s.i_purchase > 1 THEN s.bg_reserve_money1_id
          ELSE (select top 1 bg_reserve_money_id from dbo.sp_tor_dtl where sp_tor_id = s.tor_id) END as bg_check_id
        , s.dc_expense_budget_type2_id
        , s.f_type2_amt
         , s.bg_reserve_money2_id
        , s.dc_expense_budget_type3_id
        , s.f_type3_amt
         , s.bg_reserve_money3_id
        , s.dc_expense_budget_type4_id
        , s.f_type4_amt
         , s.bg_reserve_money4_id
        , s.dc_expense_budget_type5_id
        , s.f_type5_amt
         , s.bg_reserve_money5_id
        , isnull(s.i_pr_type1,(select i_pr_type1 from sp_tor_dtl where sp_tor_id =  s.tor_id)) as i_pr_type1
        , s.i_pr_type2
        , s.i_pr_type3
        , s.i_pr_type4
        , s.i_pr_type5
        , ss.dc_creditor_id
        , (select c_name from nmu..dc_creditor where dc_creditor_id =  ss.dc_creditor_id ) as dc_creditor_name
        , isnull((select bg_checking_money_id from sp_check_period_hdr where sp_tor_contract_id = ss.sp_tor_contract_id ),0) as bg_checking_money_id

        "
            . " from ({$sqlTempTable}) a "
            . " inner join dbo.sp_tor s on s.tor_id=a.tor_id"
            . " left join dbo.sp_tor_contract ss on ss.sp_tor_id = s.tor_id "
            . " WHERE a.row > ? and a.row <= ?";

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    $i_purchase = array(0 => '', 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
    while ($row = $db->Fetch($stmt)) {
        $i_type_bg = null;
        $i_type_bgTxt = null;
        switch (intval($row["i_type_bg"])) {
            case 0:
                $i_type_bg = "color:#F43217";
                $i_type_bgTxt = '';
                break;
            case 1:
                $i_type_bg = "color:black";
                $i_type_bgTxt = 'การจัดทำ PR ปกติ';
                break;
            case 2:
                $i_type_bg = "color:#116CEF";
                $i_type_bgTxt = 'การจัดทำ PR หลักโครงการต่อเนื่อง(ไม่จองเงิน)';
                break;
            case 3:
                $i_type_bg = "color:#b085f5";
                $i_type_bgTxt = 'การจัดทำ PR ย่อยโครงการต่อเนื่อง(จองเงิน)';
                break;
            case 4:
                $i_type_bg = "color:#CD8114";
                $i_type_bgTxt = 'การจัดทำ PR ไม่จองเงิน (ใช้เงินกันเหลื่อม)';
                break;
            case 5:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'การจัดทำ PR จองเงินข้ามส่งเบิก';
                break;
            case 6:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'การจัดทำ PR จองเงินทำถึงสัญญา';
                break;
            case 7:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'การจัดทำ PR จองเงินทำถึงตรวจรับ';
                break;
            default:
                $i_type_bg = "color:#F43217";
                $i_type_bgTxt = '';
                break;
        }
        $c_codeStatus = "<b style='{$i_type_bg}'>" . $row["c_code"] . "</b>" . ($row["tor_status_id"] > 0 ? "<image id='img-" . $row['tor_id'] . "' src='../images/icons/database_start.png'/>" : "");

        $temp = array(
            "no" => $i++,
            "id" => intval($row["tor_id"]),
            "i_type_bg" => intval($row["i_type_bg"]),
            "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
            "i_type_bgTxt" => $i_type_bgTxt,
            "i_step" => intval($row["i_step"]),
            "i_edit" => intval($row["i_edit"]),
            "i_receive" => intval($row["i_receive"]),
            "i_is_entrance" => intval($row["i_is_entrance"]),
            "i_is_register" => intval($row["i_is_register"]),
            "i_forword" => intval($row["i_forword"]),
            "i_backword" => intval($row["i_backword"]),
            "index_receive" => $row["index_receive"],
            "i_type_fix_rate" => intval($row["i_type_fix_rate"]),
            "c_code" => $row["c_code"],
            "dc_creditor_id" => $row["dc_creditor_id"],
            "dc_creditor_name" => $row["dc_creditor_name"],
            "bg_reserve_money_contract" => $row["bg_reserve_money_contract"],
            "i_bg_type" => intVal($row["i_bg_type"]),
            "i_is_request" => intVal($row["i_is_request"]),
            "contract_no" => $row["contract_no"],
            "c_codeStatus" => $c_codeStatus,
            "bg_budget_dtl_project_id" => intval($row["bg_budget_dtl_project_id"]),
            "i_is_more" => intval($row["i_is_more"]),
            "f_total_amt" => number_format($row["f_total_amt"], 2),
            "i_is_rename" => intval($row["i_is_rename"]),
            "c_budget_dtl_project" => $row["c_budget_dtl_project"],
            "c_name" => $row["c_name"],
            "txtdc_department_idID" => $row["dc_department_name"], //txtdc_department_idID txtdc_department_idID
            "c_code_status" => $row["c_code_status"],
            "c_name_status" => $row["c_name_status"],
            "tor_status_id" => $row["tor_status_id"],
            "bg_check_id" => intval($row["bg_check_id"]),
            "dc_cost_id" => intval($row["dc_cost_id"]),
            "dc_cost_idTxt" => $row["dc_cost_idTxt"],
            "dc_cost2_id" => intval($row["dc_cost2_id"]),
            "dc_cost2_idTxt" => $row["dc_cost2_idTxt"],
            "sp_emp_name" => $row["sp_emp_name"],
            "txtsp_emp_idID" => $row["sp_emp_name"],
            "sp_emp_id" => intval($row["sp_emp_id"]),
            "dc_department_id" => intval($row["dc_department_id"]),
            "c_department" => $row["c_department"],
            "i_parent" => $row["i_parent"],
            "i_is_parent" => $row["i_is_parent"],
            "d_doc_ref" => $row["d_doc_ref"],
            "i_year" => $row["i_yyyy"],
            "i_yyyy" => $row["i_yyyy"],
            "c_year" => intval($row["i_yyyy"] + 543),
            "tor_type_id" => $row["tor_type_id"],
            "c_tor_type" => $row["c_type_name"], // $tor_type[$row["tor_type_id"]],
            "i_purchase" => intval($row["i_purchase"]),
            "c_purchase" => $i_purchase[$row["i_purchase"]],
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "po_expense_id" => intval(($row["po_expense_id"] == 0 ? $row["po_expense_main_id"] : $row["po_expense_id"])),
            "po_expense_main_id" => intval($row["po_expense_main_id"]),
            "dc_user_create_id" => $row["c_create_name"],
            "dc_user_create_cost_id" => $row["c_cost_creat_name"],
            "DateAdd1" => ((empty($row["DateAdd1"])) ? "" : $date->extDateBuddha($row["DateAdd1"])), //d_tor_date d_tor_status_date
            "DateAdd2" => ((empty($row["DateAdd2"])) ? "" : $date->extDateBuddha($row["DateAdd2"])), //d_tor_date d_tor_status_date
            "d_tor_date_pa" => ((empty($row["d_tor_date_pa"])) ? "" : $date->extDateBuddha($row["d_tor_date_pa"])), //d_tor_date d_tor_status_date
            "d_tor_date" => ((empty($row["d_tor_date"])) ? "" : $date->extDateBuddha($row["d_tor_date"])), //d_tor_date d_tor_status_date
            "d_tor_status_date" => ((empty($row["d_tor_status_date"])) ? "" : $date->extDateBuddha($row["d_tor_status_date"])), //d_tor_date
            "d_doc_date" => ((empty($row["d_doc_date"])) ? "" : $date->extDateBuddha($row["d_doc_date"])), //d_tor_date
            "d_create" => $date->extDateBuddha($row["d_create"]), //
            "dc_user_update_id" => $row["c_update_name"],
            "dc_user_update_cost_id" => $row["c_cost_update_name"],
            "d_update" => $date->extDateBuddha($row["d_update"]),
            "d_doc_arrive_dt" => ((empty($row["d_doc_arrive_dt"])) ? "" : $date->extDateBuddha($row["d_doc_arrive_dt"])), //d_tor_date
            "start_date" => $date->extDateBuddha($row["start_date"]),
            "end_date" => $date->extDateBuddha($row["end_date"]),
            "i_enabled" => intval($row["i_enabled"]),
            "tor_hdr_dtl" => intval($row["tor_hdr_dtl"]),
            "c_comment" => $row["c_comment"],
            "c_comment_status" => $row["c_comment_status"],
            "c_remake" => $row["c_remake"],
            "po_creditor_id" => intval($row["po_creditor_id"]),
            "po_creditor_idTxt" => $row["po_creditor_idTxt"],
            "i_type_contract" => $row["i_type_contract"],
            "i_hire_type" => $row["i_hire_type"],
            "i_is_inv" => $row["i_is_inv"],
            "i_type_fix_rate" => $row["i_type_fix_rate"],
            "i_product_type" => $row["i_product_type"],
            "i_delivery_date" => $row["i_delivery_date"],
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "dc_expense_budget_type2_id" => intval($row["dc_expense_budget_type2_id"]),
            "dc_expense_budget_type3_id" => intval($row["dc_expense_budget_type3_id"]),
            "dc_expense_budget_type4_id" => intval($row["dc_expense_budget_type4_id"]),
            "dc_expense_budget_type5_id" => intval($row["dc_expense_budget_type5_id"]),
            "f_type_amt" => number_format($row["f_type_amt"], 2),
            "f_type2_amt" => number_format($row["f_type2_amt"], 2),
            "f_type3_amt" => number_format($row["f_type3_amt"], 2),
            "f_type4_amt" => number_format($row["f_type4_amt"], 2),
            "f_type5_amt" => number_format($row["f_type5_amt"], 2),
            "i_pr_type1" => $row["i_pr_type1"],
            "i_pr_type2" => $row["i_pr_type2"],
            "i_pr_type3" => $row["i_pr_type3"],
            "i_pr_type4" => $row["i_pr_type4"],
            "i_pr_type5" => $row["i_pr_type5"],
            "bg_reserve_money1_id" => $row["bg_reserve_money1_id"],
            "bg_reserve_money2_id" => $row["bg_reserve_money2_id"],
            "bg_reserve_money3_id" => $row["bg_reserve_money3_id"],
            "bg_reserve_money4_id" => $row["bg_reserve_money4_id"],
            "bg_reserve_money5_id" => $row["bg_reserve_money5_id"],
            "bg_checking_money_id" => $row["bg_checking_money_id"],
        );
        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
    exit();
} else if ($type == "po_working_dtl1") {
    $editArry = array(
        3 => '<span style="color:red">ส่งแก้ไข</span>' // พนักงานสายงาน
        ,
        2 => '<span style="color:red">ส่งแก้ไข</span>' // หัวหน้าสายงาน
        ,
        1 => '<span style="color:red">แก้ไขแล้ว</span>' // ธุระการ
        ,
        4 => '<span style="color:blue">แก้ไขแล้ว</span>',
        5 => '<span style="color:blue"></span>',
        6 => '<span style="color:blue"></span>'
    );

    $tor_status_id = $_REQUEST["tor_status_id"] ?? null; // status id
    $i_alarm = $_REQUEST["i_alarm"] ?? null; // status id
    $i_pa = $_REQUEST["i_pa"] ?? null; // status id
    // is_audit
    $step = (!empty($tor_status_id)) ? $tor_status_id : 0;
    $addConfDay1 = (!empty($i_alarm)) ? $i_alarm : 0;
    $addConfDay2 = (!empty($i_pa)) ? $i_pa : 0;
    $i_post1 = $_REQUEST['i_post1'] ?? null;
    if ($act == "SEARCH") {
        //  $wh .= ($_REQUEST['tor_type_id'] != 0) ? " and a.tor_type_id =" . $_REQUEST['tor_type_id'] : "";
        $wh .= ($_REQUEST['c_code'] != "") ? " and a.c_code like '%" . $_REQUEST['c_code'] . "%'" : "";
        $wh .= ($_REQUEST['c_name'] != "") ? " and a.c_name like '%" . $_REQUEST['c_name'] . "%'" : "";
        if ($_SESSION['i_level'] != 1) {
            $wh .= ($_REQUEST['sp_emp_id'] != 0) ? " and a.sp_emp_id = " . $_REQUEST['sp_emp_id'] : " and a.dc_department_id =" . $_SESSION['dc_department_id'];
        }
        $wh .= " and a.i_enabled =" . $_REQUEST['i_enabled'];
        if ($i_post1 == 1) {
            $wh .= " and a.sp_emp_id =" . $_REQUEST['sp_emp_id'];
        }
        if ($i_post != 0) {
            if ($i_post == 1) {
                $wh .= " and tor_status_id is not null";
            } else {
                $wh .= " and tor_status_id is null";
            }
        }
    } else {
        $wh .= ($tor_type_show == true) ? " and tor_status_id is null" : "";
    }
    if ($_SESSION['i_level'] == 1) {

    } else if ($_SESSION['i_level'] == 2 && $_SESSION['dc_department_id'] == 5) {

    } else if ($_SESSION['i_level'] == 2) {
        $wh .= " and a.dc_department_id =" . $_SESSION['dc_department_id'];
    } else {
        $wh .= ($_SESSION['sp_emp_id'] != 0) ? " and a.sp_emp_id = " . $_SESSION['sp_emp_id'] : "";
    }
    $is_audit = $_REQUEST['is_audit'] ?? null;

    if ($is_audit == 'true') {
        // $waudit = "and a.i_is_register in (2, 1)";
        $waudit = "";
    } else {
        $waudit = "";
    }
    // echo($wh);
    // exit;
    $type_menu = $_REQUEST['type_menu'] ?? null;

    $sqlTempTable = "select a.tor_id
                    , a.po_expense_id as po_expense_main_id
                    , a.dc_expense_budget_type_id
                     , a.bg_budget_dtl_project_id
                        , a.dc_department_id
                        , a.po_creditor_id
                        , a.dc_cost_id
                        , a.dc_cost2_id
                        , a.sp_emp_id
                        , a.i_is_rename
                        , a.tor_type_id
                        , a.i_is_more
                        , a.i_step
                        , a.i_receive
                        , a.i_forword
                        , a.i_backword
                        , a.tor_status_id
                        , a.index_receive
                        , a.i_enabled
                        , a.i_is_request
                        , (select count (sp_tor_dtl_id) from sp_tor_dtl aa where  aa. sp_tor_id = a.tor_id ) as tor_hdr_dtl
                        , a.i_type_contract, a.i_hire_type, isnull(a.i_product_type,0) as i_product_type, a.i_is_inv, a.i_type_fix_rate,i_delivery_date
                        , row_number() over (order by a.tor_id DESC) as row
                        from dbo.sp_tor a  where a.i_is_notor = 0 and a.i_enabled=1 {$waudit}";

    if ($tor_status_id == (13) && $is_audit == 'true') {
        $sqlTempTable .= " and a.i_type_bg in (1,5,6,7) and (a.tor_status_id =" . $step . ')' . $wh . $util->viewDepartment('a', 0, $type_menu); //
    } else {
        $sqlTempTable .= " and (a.tor_status_id =" . $step . ')' . $wh . $util->viewDepartment('a', 0, $type_menu); //
    }

    if ($mode != 'EXPORT_EXCEL') {
        $arrParam[] = $start;
        $arrParam[] = $limit;
    }
    $sqlMain = "select a.* , s.c_code
                        , s.i_is_register
                        ,case when
                            ss.sp_tor_id = s.tor_id  then 1
                            else 0
                            end  as contract_no
                        , s.c_budget_dtl_project
                        , s.c_name
                        , isnull(ss.sp_tor_contract_id,0) as  sp_tor_contract_id
                        , s.c_department
                        , s.d_doc_ref
                       , (select top 1 po_expense_id  from dbo.sp_tor_dtl  where sp_tor_id=s.tor_id)  as po_expense_id
                        , (select top 1 c_name from dbo.sp_department  where dc_department_id=s.dc_department_id)  as dc_department_name
                        , (select top 1 c_code from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as c_code_status
                        , (select top 1 c_name from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as c_name_status
                        , (select top 1 i_entrance from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as i_is_entrance
                        , (select top 1 c_name from dbo.sp_type_status where sp_type_status_id=s.tor_type_id)  as c_type_name
                        , (select top 1 c_name from dbo.sp_emp where sp_emp_id=s.sp_emp_id)  as sp_emp_name
                        , (select top 1 isnull(c_comment,'') from sp_tor_item aa where aa.tor_id = s.tor_id and aa.sp_status_hdr_id = {$step}) c_comment_status
                        , isnull(s.i_purchase,1) as i_purchase
                        , isnull(s.tor_type_id,1) as tor_type_id
                        , s.f_period_amt
                        , s.f_total_amt
                        , isnull(s.i_parent,0) as i_parent
                        , isnull(s.i_is_parent,0) as i_is_parent
                        , isnull(s.index_receive,0) as index_receive
                        , isnull(s.i_type_fix_rate,0) as i_type_fix_rate
                        , s.start_date
                        , s.end_date
                        , s.c_comment
                        , convert(varchar, s.d_doc_date, 120) as d_doc_date
                        , s.i_edit
                        , s.i_type_bg
                        , s.c_remake
                        , s.i_yyyy as i_yyyy
                        , convert(varchar, s.d_tor_date, 120) as d_tor_date
                        , convert(varchar, s.d_tor_status_date, 120) as d_tor_status_date
                        , s.i_alarm_balance
                        , convert(varchar(10), DATEADD(day, " . $addConfDay1 . ", getdate()), 120) AS DateAdd1
                        , convert(varchar(10), DATEADD(day, " . $addConfDay2 . ", getdate()), 120) AS DateAdd2
                        , convert(varchar, s.d_tor_date_alert, 120) as d_tor_date_alert
                        , convert(varchar, s.d_tor_date_pa, 120) as d_tor_date_pa
                        , isnull((select top 1 i_bg_type from dbo.dc_expense_budget_type where dc_expense_budget_type_id=s.dc_expense_budget_type_id),0)  as i_bg_type
                     , (select top 1 c_comment_edit1 from sp_tor_bg_log where a.tor_id= sp_tor_id  ORDER BY d_create  desc ) as c_comment_edit1
                        , (select top 1 c_name from dbo.po_creditor where po_creditor_id=a.po_creditor_id)  as po_creditor_idTxt
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=a.dc_cost_id)  as dc_cost_idTxt
                        , (SELECT TOP 1 c_name FROM dbo.dc_cost WHERE dc_cost_id=a.dc_cost2_id)  AS dc_cost2_idTxt
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_create_id) as c_create_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_create_cost_id) as c_cost_creat_name
                        , convert(varchar, s.d_create, 120) as d_create
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_update_id) as c_update_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_update_cost_id) as c_cost_update_name
                        , convert(varchar, s.d_update, 120) as d_update
                        , convert(varchar, s.d_egp_date, 120) as d_egp_date
        , s.dc_expense_budget_type_id
        , s.f_type_amt
        , isnull(s.bg_reserve_money1_id,(select top 1 bg_reserve_money_id from sp_tor_dtl where sp_Tor_id = s.tor_id)) as bg_reserve_money1_id
        ,CASE WHEN isnull(s.bg_reserve_money1_id,0)  =   0 THEN  (select top 1 isnull(bg_reserve_money_id,0) from dbo.sp_tor_dtl where sp_tor_id = s.tor_id)
        ELSE isnull(s.bg_reserve_money1_id,0)  END as bg_check_id
        , s.dc_expense_budget_type2_id
        , s.f_type2_amt
         , s.bg_reserve_money2_id
        , s.dc_expense_budget_type3_id
        , s.f_type3_amt
         , s.bg_reserve_money3_id
        , s.dc_expense_budget_type4_id
        , s.f_type4_amt
         , s.bg_reserve_money4_id
        , s.dc_expense_budget_type5_id
        , s.f_type5_amt
         , s.bg_reserve_money5_id
        , s.i_pr_type1
        , s.i_pr_type2
        , s.i_pr_type3
        , s.i_pr_type4
        , s.i_pr_type5
        , s.i_amount_bg
        , s.project_code
        , s.plan_status
        , s.plan_code
        , s.dc_sub_cost_id
        , s.reason_winner
        , convert(varchar, (select top 1 act_date_dt from sp_tor_item where tor_id = s.tor_id and sp_status_hdr_id = 26 order by id desc ), 120) as d_act_date_dt26
        , convert(varchar, (select top 1 act_date_dt from sp_tor_item where tor_id = s.tor_id and sp_status_hdr_id = 24 order by id desc ), 120) as d_act_date_dt24
        , (select c_name_th from  NMU_DATACENTER..dc_sub_cost  where dc_sub_cost_id =  s.dc_sub_cost_id ) as dc_sub_cost
        , (select i_type from sp_type_bg where i_value =  i_type_bg ) as sp_type_bg
        , (select top 1 i_enabled from sp_tor_delete where s.tor_id = sp_tor_id and i_enabled = 1 ) as sp_tor_delete
        , (select top 1 c_comment from sp_tor_delete where s.tor_id = sp_tor_id and i_enabled = 1 ) as tor_delete_comment
        , (select top 1 i_edit from sp_tor_bg_log where s.tor_id = sp_tor_id  ORDER BY d_create  desc ) as sp_bg_edit
        , isnull((select top 1 sp_cate_id from NMU_ERP.dbo.[view_sp_tor_work_socore] where sp_tor_id=a.tor_id order by sp_cate_id desc),0) as sp_cate_id
        , (SELECT c_name FROM NMU.dbo.dc_creditor aa WHERE aa.dc_creditor_id =v.dc_creditor_id) AS winner
        "
            . " from ({$sqlTempTable}) a "
            . " inner join dbo.sp_tor s on s.tor_id=a.tor_id"
            . " left join dbo.sp_tor_victory v on v.sp_tor_id = a.tor_id and v.i_enabled =1"
            . " left join dbo.sp_tor_contract ss on ss.sp_tor_id = s.tor_id "
            . (($mode == 'EXPORT_EXCEL') ? "" : " WHERE a.row > ? and a.row <= ?");
    if (@$_REQUEST["show_sql"]) {
        /*         * ****echo sql***** */
        $sql = (@$sqlMain) ? $sqlMain : $sql;
        $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());

        $sql = str_replace('?', '#-#', $sql);
        foreach ($arr as $fld => $value) {
            $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
        }
//        echo $sql;
//        exit;
        /*         * ***************** */
    }

//    echo $db->debugSql($sqlMain, $arrParam);
//    exit();
    $stmt = $db->QueryParam($sqlMain, $arrParam);

    if ($mode == 'EXPORT_EXCEL') {
        $strExcelFileName = "Report.xls";
        header("Content-Type: application/vnd.ms-excel");
        header('Content-Disposition: attachment; filename="' . $strExcelFileName . '"');
        echo '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
        echo '<head><meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"></head>';
        echo '<body>';
        echo '<table border="1">';
        echo '<tr>
                <th>ลำดับ</th>
                <th>รหัส PR</th>
                <th>การจัดทำ PR</th>
                <th>วิธีดำเนินงาน</th>
                <th>เรื่อง/โครงการ</th>
                <th>จำนวนเงินขอเบิก</th>
                <th>วันที่ PR</th>
                <th>วันที่เอกสาร</th>
                <th>สายงาน</th>
                <th>ผู้รับผิดชอบงาน</th>
                <th>หมายเหตุ</th>
                <th>หน่วยงานเจ้าของเรื่อง</th>
                <th>ชื่อผู้แก้ไขรายการ</th>
                <th>หน่วยงานแก้ไขรายการ</th>
                <th>วันที่แก้ไขรายการ</th>
              </tr>';
    }

    $i = $start + 1;
    $i_purchase = array(0 => '', 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
    $sp_contract_year = ($_REQUEST['tor_status_id'] == 20) ? $db->GetDataBySQL("SELECT a.i_year_be FROM dbo.sp_contract_year a WHERE  a.i_enabled = ? ", array($_REQUEST["i_enabled"])) : "";
    while ($row = $db->Fetch($stmt)) {
        $i_type_bg = null;
        $i_type_bgTxt = null;
        $i_edit = null;
        $sp = null;
        if ($row["sp_tor_delete"] == 1) {
            $sp = "<b style='color:#F43217'>" . $row["c_name"] . "</b>";
        }
        switch (intval($row["i_type_bg"])) {
            case 0:
                $i_type_bg = "color:#F43217";
                $i_type_bgTxt = '';
                break;
            case 1:
                $i_type_bg = "color:black";
                $i_type_bgTxt = 'PR ปกติ';
                break;
            case 2:
                $i_type_bg = "color:#116CEF";
                $i_type_bgTxt = 'PR หลักโครงการต่อเนื่อง(ไม่จองเงิน)';
                break;
            case 3:
                $i_type_bg = "color:#b085f5";
                $i_type_bgTxt = 'PR ย่อยโครงการต่อเนื่อง(จองเงิน)';
                break;
            case 4:
                $i_type_bg = "color:#CD8114";
                $i_type_bgTxt = 'PR ไม่จองเงิน (ใช้เงินกันเหลื่อม)';
                break;
            case 5:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'PR จองเงินข้ามส่งเบิก';
                break;
            case 6:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'PR จองเงินทำถึงสัญญา';
                break;
            case 7:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'PR จองเงินทำถึงตรวจรับ';
                break;
            case 8:
                $i_type_bg = "color:#AE00FF";
                $i_type_bgTxt = 'PR จองเงินตรวจรับ';
                break;
            case 11:
                $i_type_bg = "color:#B8860B";
                $i_type_bgTxt = 'PR ไม่จองเงินทำถึงตรวจรับ';
                break;
            case 12:
                $i_type_bg = "color:#000080";
                $i_type_bgTxt = 'PR ก่อนปีงบประมาณ';
                break;
            default:
                $i_type_bg = "color:#F43217";
                $i_type_bgTxt = '';
                break;
        }
        if ($row["sp_bg_edit"] == 1) {
            $i_type_bg = "color:#F5B041";
            $i_type_bgTxt = 'PR อยู่ระหว่างแก้ไขงบประมาณ';
        } else if ($row["sp_bg_edit"] == 2) {
            $i_type_bg = "color:#006400";
            $i_type_bgTxt = 'รับเรื่องคืนจากฝ่ายจัดสรร';
        }
        $c_codeStatus = "<b style='{$i_type_bg}'>" . $row["c_code"] . "</b>" . ($row["tor_status_id"] > 0 ? "<image id='img-" . $row['tor_id'] . "' src='../images/icons/database_start.png'/>" : "");
        $i_type_bgTxt = "<b style='{$i_type_bg}'>" . $i_type_bgTxt . "</b>";

        if ($mode == 'EXPORT_EXCEL') {
            echo '<tr>';
            echo '<td>' . $i . '</td>';
            echo '<td>' . $row["c_code"] . '</td>';
            echo '<td>' . strip_tags($i_type_bgTxt) . '</td>';
            echo '<td>' . $row["c_type_name"] . '</td>';
            echo '<td>' . $row["c_name"] . '</td>';
            echo '<td align="right">' . number_format($row["f_total_amt"], 2) . '</td>';
            echo '<td>' . $date->extDateBuddha($row["d_tor_date"]) . '</td>';
            echo '<td>' . $date->extDateBuddha($row["d_tor_status_date"]) . '</td>';
            echo '<td>' . $row["dc_department_name"] . '</td>';
            echo '<td>' . $row["sp_emp_name"] . '</td>';
            echo '<td>' . $row["c_comment"] . '</td>';
            echo '<td>' . $row["dc_cost_idTxt"] . '</td>';
            echo '<td>' . $row["c_update_name"] . '</td>';
            echo '<td>' . $row["c_cost_update_name"] . '</td>';
            echo '<td>' . $date->extDateBuddha($row["d_update"]) . '</td>';
            echo '</tr>';
            $i++;
            continue;
        }

        $temp = array(
            "no" => $i++,
            "id" => intval($row["tor_id"]),
            "sp_cate_id" => intval($row["sp_cate_id"]),
            "sp_type_bg" => intval($row["sp_type_bg"]),
            "sp_contract_year" => $sp_contract_year,
            "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
            "i_type_bg" => intval($row["i_type_bg"]),
            "i_type_bgTxt" => $i_type_bgTxt,
            "i_step" => intval($row["i_step"]),
            "sp_bg_edit" => intval($row["sp_bg_edit"]),
            "i_edit" => intval($row["i_edit"]),
            "c_nameStatus" => $sp ?? $row["c_name"], //
            "sp_tor_delete" => $row["sp_tor_delete"],
            "i_amount_bg" => $row["i_amount_bg"] == null ? 1 : $row["i_amount_bg"],
            "tor_delete_comment" => $row["tor_delete_comment"],
            "i_receive" => intval($row["i_receive"]),
            "i_is_entrance" => intval($row["i_is_entrance"]),
            "i_is_register" => intval($row["i_is_register"]),
            "i_forword" => intval($row["i_forword"]),
            "i_backword" => intval($row["i_backword"]),
            "index_receive" => $row["index_receive"],
            "i_type_fix_rate" => intval($row["i_type_fix_rate"]),
            "c_code" => $row["c_code"],
            "i_bg_type" => intVal($row["i_bg_type"]),
            "i_is_request" => intVal($row["i_is_request"]),
            "contract_no" => $row["contract_no"],
            "c_codeStatus" => $c_codeStatus,
            "bg_budget_dtl_project_id" => intval($row["bg_budget_dtl_project_id"]),
            "i_is_more" => intval($row["i_is_more"]),
            "f_total_amt" => number_format($row["f_total_amt"], 2),
            "i_is_rename" => intval($row["i_is_rename"]),
            "dc_sub_cost_id" => intval($row["dc_sub_cost_id"]),
            "dc_sub_cost" => $row["dc_sub_cost"],
            "c_budget_dtl_project" => $row["c_budget_dtl_project"],
            "c_name" => $row["c_name"],
            "txtdc_department_idID" => $row["dc_department_name"], //txtdc_department_idID txtdc_department_idID
            "c_code_status" => $row["c_code_status"],
            "c_name_status" => $row["c_name_status"],
            "tor_status_id" => $row["tor_status_id"],
            "bg_check_id" => intval($row["bg_check_id"]),
            "dc_cost_id" => intval($row["dc_cost_id"]),
            "dc_cost_idTxt" => $row["dc_cost_idTxt"],
            "dc_cost2_id" => intval($row["dc_cost2_id"]),
            "dc_cost2_idTxt" => $row["dc_cost2_idTxt"],
            "sp_emp_name" => $row["sp_emp_name"],
            "project_code" => $row["project_code"],
            "plan_status" => $row["plan_status"],
            "plan_code" => $row["plan_code"],
            "txtsp_emp_idID" => $row["sp_emp_name"],
            "sp_emp_id" => intval($row["sp_emp_id"]),
            "dc_department_id" => intval($row["dc_department_id"]),
            "c_department" => $row["c_department"],
            "i_parent" => $row["i_parent"],
            "i_is_parent" => $row["i_is_parent"],
            "d_doc_ref" => $row["d_doc_ref"],
            "i_year" => $row["i_yyyy"],
            "i_yyyy" => $row["i_yyyy"],
            "c_year" => intval($row["i_yyyy"] + 543),
            "tor_type_id" => $row["tor_type_id"],
            "c_tor_type" => $row["c_type_name"], // $tor_type[$row["tor_type_id"]],
            "i_purchase" => intval($row["i_purchase"]),
            "c_purchase" => $i_purchase[$row["i_purchase"]],
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "po_expense_id" => intval(($row["po_expense_id"] == 0 ? $row["po_expense_main_id"] : $row["po_expense_id"])),
            "po_expense_main_id" => intval($row["po_expense_main_id"]),
            "dc_user_create_id" => $row["c_create_name"],
            "c_comment_edit1" => $row["c_comment_edit1"],
            "dc_user_create_cost_id" => $row["c_cost_creat_name"],
            "DateAdd1" => ((empty($row["DateAdd1"])) ? "" : $date->extDateBuddha($row["DateAdd1"])), //d_tor_date d_tor_status_date
            "DateAdd2" => ((empty($row["DateAdd2"])) ? "" : $date->extDateBuddha($row["DateAdd2"])), //d_tor_date d_tor_status_date
            "d_tor_date_pa" => ((empty($row["d_tor_date_pa"])) ? "" : $date->extDateBuddha($row["d_tor_date_pa"])), //d_tor_date d_tor_status_date
            "d_tor_date" => ((empty($row["d_tor_date"])) ? "" : $date->extDateBuddha($row["d_tor_date"])), //d_tor_date d_tor_status_date
            "d_tor_status_date" => ((empty($row["d_tor_status_date"])) ? "" : $date->extDateBuddha($row["d_tor_status_date"])), //d_tor_date
            "d_doc_date" => ((empty($row["d_doc_date"])) ? "" : $date->extDateBuddha($row["d_doc_date"])), //d_tor_date
            "d_egp_date" => ((empty($row["d_egp_date"])) ? "" : $date->extDateBuddha($row["d_egp_date"])), //d_tor_date
            "d_create" => $date->extDateBuddha($row["d_create"]), //
            "d_act_date_dt24" => $date->extDateBuddha($row["d_act_date_dt24"]), //
            "d_act_date_dt26" => $date->extDateBuddha($row["d_act_date_dt26"]), //
            "dc_user_update_id" => $row["c_update_name"],
            "dc_user_update_cost_id" => $row["c_cost_update_name"],
            "d_update" => $date->extDateBuddha($row["d_update"]),
            "start_date" => $date->extDateBuddha($row["start_date"]),
            "end_date" => $date->extDateBuddha($row["end_date"]),
            "i_enabled" => intval($row["i_enabled"]),
            "tor_hdr_dtl" => intval($row["tor_hdr_dtl"]),
            "c_comment" => $row["c_comment"],
            "winner" => $row["winner"],
            "reason_winner" => $row["reason_winner"],
            "c_comment_status" => $row["c_comment_status"],
            "c_remake" => $row["c_remake"],
            "po_creditor_id" => intval($row["po_creditor_id"]),
            "po_creditor_idTxt" => $row["po_creditor_idTxt"],
            "i_type_contract" => $row["i_type_contract"],
            "i_hire_type" => $row["i_hire_type"],
            "i_is_inv" => $row["i_is_inv"],
            "i_type_fix_rate" => $row["i_type_fix_rate"],
            "i_product_type" => $row["i_product_type"],
            "i_delivery_date" => $row["i_delivery_date"],
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "dc_expense_budget_type2_id" => intval($row["dc_expense_budget_type2_id"]),
            "dc_expense_budget_type3_id" => intval($row["dc_expense_budget_type3_id"]),
            "dc_expense_budget_type4_id" => intval($row["dc_expense_budget_type4_id"]),
            "dc_expense_budget_type5_id" => intval($row["dc_expense_budget_type5_id"]),
            "f_type_amt" => number_format($row["f_type_amt"], 2),
            "f_type2_amt" => number_format($row["f_type2_amt"], 2),
            "f_type3_amt" => number_format($row["f_type3_amt"], 2),
            "f_type4_amt" => number_format($row["f_type4_amt"], 2),
            "f_type5_amt" => number_format($row["f_type5_amt"], 2),
            "i_pr_type1" => $row["i_pr_type1"],
            "i_pr_type2" => $row["i_pr_type2"],
            "i_pr_type3" => $row["i_pr_type3"],
            "i_pr_type4" => $row["i_pr_type4"],
            "i_pr_type5" => $row["i_pr_type5"],
            "bg_reserve_money1_id" => $row["bg_reserve_money1_id"],
            "bg_reserve_money2_id" => $row["bg_reserve_money2_id"],
            "bg_reserve_money3_id" => $row["bg_reserve_money3_id"],
            "bg_reserve_money4_id" => $row["bg_reserve_money4_id"],
            "bg_reserve_money5_id" => $row["bg_reserve_money5_id"],
            "i_amount_bg" => $row["i_amount_bg"] == null ? 1 : $row["i_amount_bg"],
        );
        ${$root}[] = $temp;
    }

    if ($mode == 'EXPORT_EXCEL') {
        echo '</table></body></html>';
        exit();
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
    exit();
} else if ($type == "po_working_dtl_Allocate_money") {
    $editArry = array(
        3 => '<span style="color:red">ส่งแก้ไข</span>' // พนักงานสายงาน
        ,
        2 => '<span style="color:red">ส่งแก้ไข</span>' // หัวหน้าสายงาน
        ,
        1 => '<span style="color:red">แก้ไขแล้ว</span>' // ธุระการ
        ,
        4 => '<span style="color:blue">แก้ไขแล้ว</span>',
        5 => '<span style="color:blue"></span>',
        6 => '<span style="color:blue"></span>'
    );

    $tor_status_id = $_REQUEST["tor_status_id"] ?? null; // status id
    $i_alarm = $_REQUEST["i_alarm"] ?? null; // status id
    $i_pa = $_REQUEST["i_pa"] ?? null; // status id


    $step = (!empty($tor_status_id)) ? $tor_status_id : 0;
    $addConfDay1 = (!empty($i_alarm)) ? $i_alarm : 0;
    $addConfDay2 = (!empty($i_pa)) ? $i_pa : 0;
    if ($act == "SEARCH") {
//        $wh .= ($_REQUEST['tor_type_id'] != 0) ? " and a.tor_type_id =" . $_REQUEST['tor_type_id'] : "";
        $wh .= ($_REQUEST['c_code'] != "") ? " and a.c_code like '%" . $_REQUEST['c_code'] . "%'" : "";
        $wh .= ($_REQUEST['c_code'] != "") ? " and a.c_code like '%" . $_REQUEST['c_code'] . "%'" : "";
        $wh .= ($_REQUEST['c_name'] != "") ? " and a.c_name like '%" . $_REQUEST['c_name'] . "%'" : "";
        $wh .= ($_REQUEST['i_enabled'] != 0) ? " and a.i_enabled = " . $_REQUEST['i_enabled'] : "";
        $wh .= ($_REQUEST['d_doc_ref'] != '') ? " and a.d_doc_ref like '%" . $_REQUEST['d_doc_ref'] . "%'" : "";

        if ($_REQUEST['i_post1'] == 1) {
            $wh .= " and a.sp_emp_id =" . $_REQUEST['sp_emp_id'];
        }
        if ($i_post != 0) {
            if ($i_post == 1) {
                $wh .= " and tor_status_id is not null";
            } else {
                $wh .= " and tor_status_id is null";
            }
        }
    } else {
        $wh .= ($tor_type_show == true) ? " and tor_status_id is null" : "";
    }


    $is_audit = $_REQUEST['is_audit'] ?? null;
    if ($_SESSION['i_level'] == 1 || $_SESSION['user_id'] == 60104 || $_SESSION['user_id'] == 40048) {
        $wh .= null;
    } else {
        $wh .= "  and a.sp_emp_id =" . $_REQUEST['sp_emp_id'];
    }
    $type_menu = $_REQUEST['type_menu'] ?? null;
    $type_enabled = $_REQUEST['type_enabled'] ?? null;
    if ($type_enabled != null) {
        $wh .= "  and a.i_enabled =" . $_REQUEST['type_enabled'];
    }
    $sqlTempTable = "select a.tor_id
                    , a.po_expense_id as po_expense_main_id
                    , a.dc_expense_budget_type_id
                     , a.bg_budget_dtl_project_id
                        , a.dc_department_id
                        , a.po_creditor_id
                        , a.dc_cost_id
                        , a.dc_cost2_id
                        , a.sp_emp_id
                        , a.i_is_rename
                        , a.tor_type_id
                        , a.i_is_more
                        , a.i_step
                        , a.i_receive
                        , a.i_forword
                        , a.i_backword
                        , a.tor_status_id
                        , a.index_receive
                        , a.i_enabled
                        , a.i_is_request
                        , (select count (sp_tor_dtl_id) from sp_tor_dtl aa where  aa. sp_tor_id = a.tor_id ) as tor_hdr_dtl
                        , a.i_type_contract, a.i_hire_type, isnull(a.i_product_type,0) as i_product_type, a.i_is_inv, a.i_type_fix_rate,i_delivery_date
                        , row_number() over (order by a.tor_id DESC) as row
                        from dbo.sp_tor a  where a.i_is_notor = 0 and a.i_type_bg = 1   {$wh}";

    //    if ($tor_status_id == 13) {
    //        $sqlTempTable .= " and (a.i_edit in (3 , 5) or a.tor_status_id in (" . $step . '))' . $wh . $util->viewDepartment('a', 0, $type_menu); //
    //    } else { }
    //    $sqlTempTable .= " and a.tor_status_id =" . $step . $wh . $util->viewDepartment('a', 0, $type_menu); //
    // if ($tor_status_id == (13) && $is_audit == 'true') {
    //     $sqlTempTable .= " and a.i_type_bg in (1) and (a.tor_status_id =" . $step . ')' . $wh . $util->viewDepartment('a', 0, $type_menu); //
    // } else {
    //     // $sqlTempTable .= " and (a.tor_status_id =" . $step . ')' . $wh . $util->viewDepartment('a', 0, $type_menu); //
    // }

    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlMain = "select a.* , s.c_code
                        , s.i_is_register
                        ,case when
                            ss.sp_tor_id = s.tor_id  then 1
                            else 0
                            end  as contract_no
                        , s.c_budget_dtl_project
                        , s.c_name
                        , isnull(ss.sp_tor_contract_id,0) as  sp_tor_contract_id
                        , s.c_department
                        , s.d_doc_ref
                       , (select top 1 po_expense_id  from dbo.sp_tor_dtl  where sp_tor_id=s.tor_id)  as po_expense_id
                        , (select top 1 c_name from dbo.sp_department  where dc_department_id=s.dc_department_id)  as dc_department_name
                        , (select top 1 c_code from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as c_code_status
                        , (select top 1 c_name from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as c_name_status
                        , (select top 1 i_entrance from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as i_is_entrance
                        , (select top 1 c_name from dbo.sp_type_status where sp_type_status_id=s.tor_type_id)  as c_type_name
                        , (select top 1 c_name from dbo.sp_emp where sp_emp_id=s.sp_emp_id)  as sp_emp_name
                        , (select top 1 isnull(c_comment,'') from sp_tor_item aa where aa.tor_id = s.tor_id and aa.sp_status_hdr_id = {$step}) c_comment_status
                        , isnull(s.i_purchase,1) as i_purchase
                        , isnull(s.tor_type_id,1) as tor_type_id
                        , s.f_period_amt
                        , s.f_total_amt
                        , isnull(s.i_parent,0) as i_parent
                        , isnull(s.i_is_parent,0) as i_is_parent
                        , isnull(s.index_receive,0) as index_receive
                        , isnull(s.i_type_fix_rate,0) as i_type_fix_rate
                        , s.start_date
                        , s.end_date
                        , s.c_comment
                        , convert(varchar, s.d_doc_date, 120) as d_doc_date
                        , s.i_edit
                        , s.i_type_bg
                        , s.c_remake
                        , s.i_yyyy as i_yyyy
                        , convert(varchar, s.d_tor_date, 120) as d_tor_date
                        , convert(varchar, s.d_tor_status_date, 120) as d_tor_status_date
                        , s.i_alarm_balance
                        , convert(varchar(10), DATEADD(day, " . $addConfDay1 . ", getdate()), 120) AS DateAdd1
                        , convert(varchar(10), DATEADD(day, " . $addConfDay2 . ", getdate()), 120) AS DateAdd2
                        , convert(varchar, s.d_tor_date_alert, 120) as d_tor_date_alert
                        , convert(varchar, s.d_tor_date_pa, 120) as d_tor_date_pa
                        , isnull((select top 1 i_bg_type from dbo.dc_expense_budget_type where dc_expense_budget_type_id=s.dc_expense_budget_type_id),0)  as i_bg_type
                        , (select top 1 c_name from dbo.po_creditor where po_creditor_id=a.po_creditor_id)  as po_creditor_idTxt
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=a.dc_cost_id)  as dc_cost_idTxt
                        , (SELECT TOP 1 c_name FROM dbo.dc_cost WHERE dc_cost_id=a.dc_cost2_id)  AS dc_cost2_idTxt
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_create_id) as c_create_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_create_cost_id) as c_cost_creat_name
                        , convert(varchar, s.d_create, 120) as d_create
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_update_id) as c_update_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_update_cost_id) as c_cost_update_name
                        , convert(varchar, s.d_update, 120) as d_update
                        , convert(varchar, s.d_egp_date, 120) as d_egp_date
        , s.dc_expense_budget_type_id
        , s.f_type_amt
        , s.bg_reserve_money1_id
        ,CASE WHEN isnull(s.bg_reserve_money1_id,0)  =   0 THEN  (select top 1 isnull(bg_reserve_money_id,0) from dbo.sp_tor_dtl where sp_tor_id = s.tor_id)
        ELSE isnull(s.bg_reserve_money1_id,0)  END as bg_check_id
        , s.dc_expense_budget_type2_id
        , s.f_type2_amt
         , s.bg_reserve_money2_id
        , s.dc_expense_budget_type3_id
        , s.f_type3_amt
         , s.bg_reserve_money3_id
        , s.dc_expense_budget_type4_id
        , s.f_type4_amt
         , s.bg_reserve_money4_id
        , s.dc_expense_budget_type5_id
        , s.f_type5_amt
         , s.bg_reserve_money5_id
        , s.i_pr_type1
        , s.i_pr_type2
        , s.i_pr_type3
        , s.i_pr_type4
        , s.i_pr_type5
        , s.i_enabled
        , s.i_is_upload
        , s.pdf_enabled
        , (select top 1 i_enabled from sp_tor_delete where s.tor_id = sp_tor_id and i_enabled = 1 ) as sp_tor_delete
        , (select top 1 c_comment from sp_tor_delete where s.tor_id = sp_tor_id and i_enabled = 1 ) as tor_delete_comment
        "
            . " from ({$sqlTempTable}) a "
            . " inner join dbo.sp_tor s on s.tor_id=a.tor_id"
            . " left join dbo.sp_tor_contract ss on ss.sp_tor_id = s.tor_id "
            . " WHERE a.row > ? and a.row <= ?";
    /*     * ****echo sql***** */
    // $sql = (@$sqlMain) ? $sqlMain : $sql;
    // $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());
    // $sql = str_replace('?', '#-#', $sql);
    // foreach ($arr as $fld => $value) {
    //  $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
    // }
    // echo $sql; exit;
    /*     * ***************** */
//    echo $db->debugSql($sqlMain, $arrParam);
//    exit();
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    $i_purchase = array(0 => '', 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
    while ($row = $db->Fetch($stmt)) {
        $i_type_bg = null;
        $i_type_bgTxt = null;
        $sp = null;
        if ($row["sp_tor_delete"] == 1) {
            $sp = "<b style='color:#F43217'>" . $row["c_name"] . "</b>";
        }
        switch (intval($row["i_type_bg"])) {
            case 0:
                $i_type_bg = "color:#F43217";
                $i_type_bgTxt = '';
                break;
            case 1:
                $i_type_bg = "color:black";
                $i_type_bgTxt = 'PR ปกติ';
                break;
            case 2:
                $i_type_bg = "color:#116CEF";
                $i_type_bgTxt = 'PR หลักโครงการต่อเนื่อง(ไม่จองเงิน)';
                break;
            case 3:
                $i_type_bg = "color:#b085f5";
                $i_type_bgTxt = 'PR ย่อยโครงการต่อเนื่อง(จองเงิน)';
                break;
            case 4:
                $i_type_bg = "color:#CD8114";
                $i_type_bgTxt = 'PR ไม่จองเงิน (ใช้เงินกันเหลื่อม)';
                break;
            case 5:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'PR จองเงินข้ามส่งเบิก';
                break;
            case 6:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'PR จองเงินทำถึงสัญญา';
                break;
            case 7:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'PR จองเงินทำถึงตรวจรับ';
                break;
            case 8:
                $i_type_bg = "color:#AE00FF";
                $i_type_bgTxt = 'PR จองเงินตรวจรับ';
                break;
            default:
                $i_type_bg = "color:#F43217";
                $i_type_bgTxt = '';
                break;
        }
        $c_codeStatus = "<b style='{$i_type_bg}'>" . $row["c_code"] . "</b>" . ($row["tor_status_id"] > 0 ? "<image id='img-" . $row['tor_id'] . "' src='../images/icons/database_start.png'/>" : "");
        $i_type_bgTxt = "<b style='{$i_type_bg}'>" . $i_type_bgTxt . "</b>";
        // c_name_status
        if ($row["i_enabled"] == 2) {
            $i_enabled = "<b style='color:#FA8072'>รายการถูกยกเลิก </b>";
        } else {
            // $i_enabled  =  $row["c_name_status"];
            $i_enabled = "<b style='color:#008080'>" . $row["c_name_status"] . "</b>";
        }
        $temp = array(
            "no" => $i++,
            "id" => intval($row["tor_id"]),
            "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
            "i_type_bg" => intval($row["i_type_bg"]),
            "i_type_bgTxt" => $i_type_bgTxt,
            "i_step" => intval($row["i_step"]),
            "i_edit" => intval($row["i_edit"]),
            "c_nameStatus" => $sp ?? $row["c_name"], //
            "sp_tor_delete" => $row["sp_tor_delete"],
            "tor_delete_comment" => $row["tor_delete_comment"],
            "i_receive" => intval($row["i_receive"]),
            "i_is_entrance" => intval($row["i_is_entrance"]),
            "i_is_register" => intval($row["i_is_register"]),
            "i_forword" => intval($row["i_forword"]),
            "i_backword" => intval($row["i_backword"]),
            "index_receive" => $row["index_receive"],
            "i_type_fix_rate" => intval($row["i_type_fix_rate"]),
            "pdf_enabled" => intval($row["pdf_enabled"]),
            "c_code" => $row["c_code"],
            "i_bg_type" => intVal($row["i_bg_type"]),
            "i_is_request" => intVal($row["i_is_request"]),
            "contract_no" => $row["contract_no"],
            "i_is_upload" => $row["i_is_upload"],
            "c_codeStatus" => $c_codeStatus,
            "bg_budget_dtl_project_id" => intval($row["bg_budget_dtl_project_id"]),
            "i_is_more" => intval($row["i_is_more"]),
            "f_total_amt" => number_format($row["f_total_amt"], 2),
            "i_is_rename" => intval($row["i_is_rename"]),
            "c_budget_dtl_project" => $row["c_budget_dtl_project"],
            "c_name" => $row["c_name"],
            "txtdc_department_idID" => $row["dc_department_name"], //txtdc_department_idID txtdc_department_idID
            "c_code_status" => $row["c_code_status"],
            "i_enabled" => $row["i_enabled"],
            "c_name_status" => $i_enabled, //$row["c_name_status"],
            "tor_status_id" => $row["tor_status_id"],
            "bg_check_id" => intval($row["bg_check_id"]),
            "dc_cost_id" => intval($row["dc_cost_id"]),
            "dc_cost_idTxt" => $row["dc_cost_idTxt"],
            "dc_cost2_id" => intval($row["dc_cost2_id"]),
            "dc_cost2_idTxt" => $row["dc_cost2_idTxt"],
            "sp_emp_name" => $row["sp_emp_name"],
            "txtsp_emp_idID" => $row["sp_emp_name"],
            "sp_emp_id" => intval($row["sp_emp_id"]),
            "dc_department_id" => intval($row["dc_department_id"]),
            "c_department" => $row["c_department"],
            "i_parent" => $row["i_parent"],
            "i_is_parent" => $row["i_is_parent"],
            "d_doc_ref" => $row["d_doc_ref"],
            "i_year" => $row["i_yyyy"],
            "i_yyyy" => $row["i_yyyy"],
            "c_year" => intval($row["i_yyyy"] + 543),
            "tor_type_id" => $row["tor_type_id"],
            "c_tor_type" => $row["c_type_name"], // $tor_type[$row["tor_type_id"]],
            "i_purchase" => intval($row["i_purchase"]),
            "c_purchase" => $i_purchase[$row["i_purchase"]],
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "po_expense_id" => intval(($row["po_expense_id"] == 0 ? $row["po_expense_main_id"] : $row["po_expense_id"])),
            "po_expense_main_id" => intval($row["po_expense_main_id"]),
            "dc_user_create_id" => $row["c_create_name"],
            "dc_user_create_cost_id" => $row["c_cost_creat_name"],
            "DateAdd1" => ((empty($row["DateAdd1"])) ? "" : $date->extDateBuddha($row["DateAdd1"])), //d_tor_date d_tor_status_date
            "DateAdd2" => ((empty($row["DateAdd2"])) ? "" : $date->extDateBuddha($row["DateAdd2"])), //d_tor_date d_tor_status_date
            "d_tor_date_pa" => ((empty($row["d_tor_date_pa"])) ? "" : $date->extDateBuddha($row["d_tor_date_pa"])), //d_tor_date d_tor_status_date
            "d_tor_date" => ((empty($row["d_tor_date"])) ? "" : $date->extDateBuddha($row["d_tor_date"])), //d_tor_date d_tor_status_date
            "d_tor_status_date" => ((empty($row["d_tor_status_date"])) ? "" : $date->extDateBuddha($row["d_tor_status_date"])), //d_tor_date
            "d_doc_date" => ((empty($row["d_doc_date"])) ? "" : $date->extDateBuddha($row["d_doc_date"])), //d_tor_date
            "d_egp_date" => ((empty($row["d_egp_date"])) ? "" : $date->extDateBuddha($row["d_egp_date"])), //d_tor_date
            "d_create" => $date->extDateBuddha($row["d_create"]), //
            "dc_user_update_id" => $row["c_update_name"],
            "dc_user_update_cost_id" => $row["c_cost_update_name"],
            "d_update" => $date->extDateBuddha($row["d_update"]),
            "start_date" => $date->extDateBuddha($row["start_date"]),
            "end_date" => $date->extDateBuddha($row["end_date"]),
            "i_enabled" => intval($row["i_enabled"]),
            "tor_hdr_dtl" => intval($row["tor_hdr_dtl"]),
            "c_comment" => $row["c_comment"],
            "c_comment_status" => $row["c_comment_status"],
            "c_remake" => $row["c_remake"],
            "po_creditor_id" => intval($row["po_creditor_id"]),
            "po_creditor_idTxt" => $row["po_creditor_idTxt"],
            "i_type_contract" => $row["i_type_contract"],
            "i_hire_type" => $row["i_hire_type"],
            "i_is_inv" => $row["i_is_inv"],
            "i_type_fix_rate" => $row["i_type_fix_rate"],
            "i_product_type" => $row["i_product_type"],
            "i_delivery_date" => $row["i_delivery_date"],
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "dc_expense_budget_type2_id" => intval($row["dc_expense_budget_type2_id"]),
            "dc_expense_budget_type3_id" => intval($row["dc_expense_budget_type3_id"]),
            "dc_expense_budget_type4_id" => intval($row["dc_expense_budget_type4_id"]),
            "dc_expense_budget_type5_id" => intval($row["dc_expense_budget_type5_id"]),
            "f_type_amt" => number_format($row["f_type_amt"], 2),
            "f_type2_amt" => number_format($row["f_type2_amt"], 2),
            "f_type3_amt" => number_format($row["f_type3_amt"], 2),
            "f_type4_amt" => number_format($row["f_type4_amt"], 2),
            "f_type5_amt" => number_format($row["f_type5_amt"], 2),
            "i_pr_type1" => $row["i_pr_type1"],
            "i_pr_type2" => $row["i_pr_type2"],
            "i_pr_type3" => $row["i_pr_type3"],
            "i_pr_type4" => $row["i_pr_type4"],
            "i_pr_type5" => $row["i_pr_type5"],
            "bg_reserve_money1_id" => $row["bg_reserve_money1_id"],
            "bg_reserve_money2_id" => $row["bg_reserve_money2_id"],
            "bg_reserve_money3_id" => $row["bg_reserve_money3_id"],
            "bg_reserve_money4_id" => $row["bg_reserve_money4_id"],
            "bg_reserve_money5_id" => $row["bg_reserve_money5_id"],
        );
        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
    exit();
} else if ($type == "dc_creditor_period") {
    $editArry = array(
        3 => '<span style="color:red">ส่งแก้ไข</span>' // พนักงานสายงาน
        ,
        2 => '<span style="color:red">ส่งแก้ไข</span>' // หัวหน้าสายงาน
        ,
        1 => '<span style="color:red">แก้ไขแล้ว</span>' // ธุระการ
        ,
        4 => '<span style="color:blue">แก้ไขแล้ว</span>',
        5 => '<span style="color:blue"></span>',
        6 => '<span style="color:blue"></span>'
    );

    $tor_status_id = $_REQUEST["tor_status_id"] ?? null; // status id
    $i_alarm = $_REQUEST["i_alarm"] ?? null; // status id
    $i_pa = $_REQUEST["i_pa"] ?? null; // status id


    $step = (!empty($tor_status_id)) ? $tor_status_id : 0;
    $addConfDay1 = (!empty($i_alarm)) ? $i_alarm : 0;
    $addConfDay2 = (!empty($i_pa)) ? $i_pa : 0;

    if ($act == "SEARCH") {
        $wh .= ($_REQUEST['tor_type_id'] != 0) ? " and a.tor_type_id =" . $_REQUEST['tor_type_id'] : "";
        $wh .= ($_REQUEST['c_code'] != "") ? " and a.c_code like '%" . $_REQUEST['c_code'] . "%'" : "";
        $wh .= ($_REQUEST['c_name'] != "") ? " and a.c_name like '%" . $_REQUEST['c_name'] . "%'" : "";
        $wh .= " and a.i_enabled =" . $_REQUEST['i_enabled'];

        if ($_REQUEST['i_post1'] == 1) {
            $wh .= " and a.sp_emp_id =" . $_REQUEST['sp_emp_id'];
        }
        if ($i_post != 0) {
            if ($i_post == 1) {
                $wh .= " and tor_status_id is not null";
            } else {
                $wh .= " and tor_status_id is null";
            }
        }
    } else {
        $wh .= ($tor_type_show == true) ? " and tor_status_id is null" : "";
    }


    $is_audit = $_REQUEST['is_audit'] ?? null;

    if ($is_audit == 'true') {
        $waudit = "and a.i_is_register in (2 , 1,0)";
    } else {
        $waudit = "";
    }


    $type_menu = $_REQUEST['type_menu'] ?? null;

    $sqlTempTable = "select
    a.sp_tor_hdr_period_id
    ,a.sp_tor_contract_id
    ,a.i_period
    ,a.dc_creditor_id
    , row_number() over (order by a.sp_tor_hdr_period_id DESC) as row
    from sp_tor_hdr_period  a
    where  a.i_is_upload = 1
    and i_enabled = 1  {$wh}";
    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlMain = "select a.*
                        ,c.c_name
                        ,c.c_code
                        ,(select c_name from nmu..dc_creditor  where c.dc_creditor_id = dc_creditor_id) as dc_creditor_id
                        ,b.c_contract_code
                        , convert(varchar, b.d_update, 120) as d_update
                        , convert(varchar, b.d_upload, 120) as d_upload
                        ,(select c_full_name from dc_user where dc_user_id =  c.dc_user_update_id) dc_user_update_id
                        ,(select c_name from dc_cost where dc_cost_id =  c.dc_user_update_cost_id) dc_user_update_cost_id
                        ,(select c_name from sp_emp where sp_emp_id = c.sp_emp_id) sp_emp_name
                        ,isnull((select dc_tax_customer_id from nmu..dc_creditor  where c.dc_creditor_id = dc_creditor_id),0) as dc_tax_customer_id
                        ,c.dc_cost_id "
            . " from ({$sqlTempTable}) a "
            . " INNER JOIN sp_tor_hdr_period b on   a.sp_tor_hdr_period_id = b.sp_tor_hdr_period_id"
            . " INNER JOIN sp_tor_contract c on b.sp_tor_contract_id = c.sp_tor_contract_id "
            . " WHERE a.row > ? and a.row <= ?";
    // print_r($arrParam);
    //          echo $sqlMain;
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    $i_purchase = array(0 => '', 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
    while ($row = $db->Fetch($stmt)) {
        $i_type_bg = null;
        $i_type_bgTxt = null;
        $sp = null;
        $temp = array(
            "no" => $i++,
            "id" => $row["sp_tor_hdr_period_id"],
            "sp_tor_hdr_period_id" => $row["sp_tor_hdr_period_id"],
            "dc_tax_customer_id" => $row["dc_tax_customer_id"],
            "i_upload_period" => "IR000" . $row["sp_tor_hdr_period_id"],
            "sp_tor_contract_id" => $row["sp_tor_contract_id"],
            "i_period" => $row["i_period"],
            "dc_creditor_id" => $row["dc_creditor_id"],
            "c_name" => $row["c_name"],
            "c_code" => $row["c_code"],
            "c_contract_code" => $row["c_contract_code"],
            "dc_creditor_id" => $row["dc_creditor_id"],
            "sp_emp_name" => $row["sp_emp_name"],
            "dc_user_update_id" => $row["dc_user_update_id"],
            "dc_user_update_cost_id" => $row["dc_user_update_cost_id"],
            "dc_cost_id" => intval($row["dc_cost_id"]),
            "d_update" => $date->extDateBuddha($row["d_update"]), //
            "d_upload" => $date->extDateBuddha($row["d_upload"]), //
        );
        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
    exit();
} else if ($type == "Edir_tor_type") {
    $editArry = array(
        3 => '<span style="color:red">ส่งแก้ไข</span>' // พนักงานสายงาน
        ,
        2 => '<span style="color:red">ส่งแก้ไข</span>' // หัวหน้าสายงาน
        ,
        1 => '<span style="color:red">แก้ไขแล้ว</span>' // ธุระการ
        ,
        4 => '<span style="color:blue">แก้ไขแล้ว</span>',
        5 => '<span style="color:blue"></span>',
        6 => '<span style="color:blue"></span>'
    );

    $tor_status_id = $_REQUEST["tor_status_id"] ?? null; // status id
    $i_alarm = $_REQUEST["i_alarm"] ?? null; // status id
    $i_pa = $_REQUEST["i_pa"] ?? null; // status id


    $step = (!empty($tor_status_id)) ? $tor_status_id : 0;
    $addConfDay1 = (!empty($i_alarm)) ? $i_alarm : 0;
    $addConfDay2 = (!empty($i_pa)) ? $i_pa : 0;
    $i_post1 = $_REQUEST['i_post1'] ?? null;
    if ($act == "SEARCH") {
        $wh .= ($_REQUEST['tor_type_id'] != 0) ? " and a.tor_type_id =" . $_REQUEST['tor_type_id'] : "";
        $wh .= ($_REQUEST['c_code'] != "") ? " and a.c_code like '%" . $_REQUEST['c_code'] . "%'" : "";
        $wh .= ($_REQUEST['c_name'] != "") ? " and a.c_name like '%" . $_REQUEST['c_name'] . "%'" : "";
        if ($_SESSION['i_level'] != 1) {
            $wh .= ($_REQUEST['sp_emp_id'] != 0) ? " and a.sp_emp_id = " . $_REQUEST['sp_emp_id'] : " and a.dc_department_id =" . $_SESSION['dc_department_id'];
        }
        $wh .= " and a.i_enabled =" . $_REQUEST['i_enabled'];
        if ($i_post1 == 1) {
            $wh .= " and a.sp_emp_id =" . $_REQUEST['sp_emp_id'];
        }
        if ($i_post != 0) {
            if ($i_post == 1) {
                $wh .= " and tor_status_id is not null";
            } else {
                $wh .= " and tor_status_id is null";
            }
        }
    } else {
        $wh .= ($tor_type_show == true) ? " and tor_status_id is null" : "";
    }
    if ($_SESSION['i_level'] == 1) {

    } else if ($_SESSION['i_level'] == 2 && $_SESSION['dc_department_id'] == 5) {

    } else if ($_SESSION['i_level'] == 2) {
        $wh .= " and a.dc_department_id =" . $_SESSION['dc_department_id'];
    } else {
        $wh .= ($_SESSION['sp_emp_id'] != 0) ? " and a.sp_emp_id = " . $_SESSION['sp_emp_id'] : "";
    }
    $is_audit = $_REQUEST['is_audit'] ?? null;

    if ($is_audit == 'true') {
        $waudit = "and a.i_is_register in (2 , 1)";
    } else {
        $waudit = "";
    }
    // echo($wh);
    // exit;
    $type_menu = $_REQUEST['type_menu'] ?? null;

    $sqlTempTable = "select a.tor_id
                , a.po_expense_id as po_expense_main_id
                , a.dc_expense_budget_type_id
                 , a.bg_budget_dtl_project_id
                    , a.dc_department_id
                    , a.po_creditor_id
                    , a.dc_cost_id
                    , a.dc_cost2_id
                    , a.sp_emp_id
                    , a.i_is_rename
                    , a.tor_type_id
                    , a.i_is_more
                    , a.i_step
                    , a.i_receive
                    , a.i_forword
                    , a.i_backword
                    , a.tor_status_id
                    , a.index_receive
                    , a.i_enabled
                    , a.i_is_request
                    , (select count (sp_tor_dtl_id) from sp_tor_dtl aa where  aa. sp_tor_id = a.tor_id ) as tor_hdr_dtl
                    , isnull(a.i_type_contract,0) as i_type_contract
                    , a.i_hire_type, isnull(a.i_product_type,0) as i_product_type, a.i_is_inv, a.i_type_fix_rate,i_delivery_date
                    , row_number() over (order by a.tor_id DESC) as row
                    from dbo.sp_tor a  where a.i_is_notor = 0 and a.i_enabled=1 {$waudit}";

    //    if ($tor_status_id == 13) {
    //        $sqlTempTable .= " and (a.i_edit in (3 , 5) or a.tor_status_id in (" . $step . '))' . $wh . $util->viewDepartment('a', 0, $type_menu); //
    //    } else { }
    //    $sqlTempTable .= " and a.tor_status_id =" . $step . $wh . $util->viewDepartment('a', 0, $type_menu); //

    if ($tor_status_id == (13) && $is_audit == 'true') {
        $sqlTempTable .= " and (a.tor_status_id =" . $step . ')' . $wh . $util->viewDepartment('a', 0, $type_menu); //
    } else {
        $sqlTempTable .= " and (a.tor_status_id =" . $step . ')' . $wh . $util->viewDepartment('a', 0, $type_menu); //
    }

    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlMain = "select a.* , s.c_code
                    , s.i_is_register
                    ,case when
                        ss.sp_tor_id = s.tor_id  then 1
                        else 0
                        end  as contract_no
                    , s.c_budget_dtl_project
                    , s.c_name
                    , isnull(ss.sp_tor_contract_id,0) as  sp_tor_contract_id
                    , s.c_department
                    , s.d_doc_ref
                   , (select top 1 po_expense_id  from dbo.sp_tor_dtl  where sp_tor_id=s.tor_id)  as po_expense_id
                    , (select top 1 c_name from dbo.sp_department  where dc_department_id=s.dc_department_id)  as dc_department_name
                    , (select top 1 c_code from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as c_code_status
                    , (select top 1 c_name from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as c_name_status
                    , (select top 1 i_entrance from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as i_is_entrance
                    , (select top 1 c_name from dbo.sp_type_status where sp_type_status_id=s.tor_type_id)  as c_type_name
                    , (select top 1 c_name from dbo.sp_emp where sp_emp_id=s.sp_emp_id)  as sp_emp_name
                    , (select top 1 isnull(c_comment,'') from sp_tor_item aa where aa.tor_id = s.tor_id and aa.sp_status_hdr_id = {$step}) c_comment_status
                    , isnull(s.i_purchase,1) as i_purchase
                    , isnull(s.tor_type_id,1) as tor_type_id
                    , s.f_period_amt
                    , s.f_total_amt
                    , isnull(s.i_parent,0) as i_parent
                    , isnull(s.i_is_parent,0) as i_is_parent
                    , isnull(s.index_receive,0) as index_receive
                    , isnull(s.i_type_fix_rate,0) as i_type_fix_rate
                    , s.start_date
                    , s.end_date
                    , s.c_comment
                    , convert(varchar, s.d_doc_date, 120) as d_doc_date
                    , s.i_edit
                    , s.i_type_bg
                    , s.c_remake
                    , s.i_yyyy as i_yyyy
                    , convert(varchar, s.d_tor_date, 120) as d_tor_date
                    , convert(varchar, s.d_tor_status_date, 120) as d_tor_status_date
                    , s.i_alarm_balance
                    , convert(varchar(10), DATEADD(day, " . $addConfDay1 . ", getdate()), 120) AS DateAdd1
                    --, convert(varchar(10), DATEADD(day, " . $addConfDay2 . ", getdate()), 120) AS DateAdd2
                    , convert(varchar(10), s.d_edit_pa  , 120) AS DateAdd2
                    ,(select  top 1 c_comment from sp_tor_delete where sp_tor_id  =  s.tor_id ORDER by  sp_tor_delete_id desc  ) as  delete_c_comment
                    , convert(varchar, s.d_tor_date_alert, 120) as d_tor_date_alert
                    , convert(varchar, s.d_tor_date_pa, 120) as d_tor_date_pa
                    , isnull((select top 1 i_bg_type from dbo.dc_expense_budget_type where dc_expense_budget_type_id=s.dc_expense_budget_type_id),0)  as i_bg_type
                    , (select top 1 c_name from dbo.po_creditor where po_creditor_id=a.po_creditor_id)  as po_creditor_idTxt
                    , (select top 1 c_name from dbo.dc_cost where dc_cost_id=a.dc_cost_id)  as dc_cost_idTxt
                    , (SELECT TOP 1 c_name FROM dbo.dc_cost WHERE dc_cost_id=a.dc_cost2_id)  AS dc_cost2_idTxt
                    , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_create_id) as c_create_name
                    , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_create_cost_id) as c_cost_creat_name
                    , convert(varchar, s.d_create, 120) as d_create
                    , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_update_id) as c_update_name
                    , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_update_cost_id) as c_cost_update_name
                    , convert(varchar, s.d_update, 120) as d_update
                    , convert(varchar, s.d_egp_date, 120) as d_egp_date
    , s.dc_expense_budget_type_id
    , s.f_type_amt
    , s.bg_reserve_money1_id
    ,CASE WHEN isnull(s.bg_reserve_money1_id,0)  =   0 THEN  (select top 1 isnull(bg_reserve_money_id,0) from dbo.sp_tor_dtl where sp_tor_id = s.tor_id)
    ELSE isnull(s.bg_reserve_money1_id,0)  END as bg_check_id
    , s.dc_expense_budget_type2_id
    , s.f_type2_amt
     , s.bg_reserve_money2_id
    , s.dc_expense_budget_type3_id
    , s.f_type3_amt
     , s.bg_reserve_money3_id
    , s.dc_expense_budget_type4_id
    , s.f_type4_amt
     , s.bg_reserve_money4_id
    , s.dc_expense_budget_type5_id
    , s.f_type5_amt
     , s.bg_reserve_money5_id
    , s.i_pr_type1
    , s.i_pr_type2
    , s.i_pr_type3
    , s.i_pr_type4
    , s.i_pr_type5
    , (select top 1 i_enabled from sp_tor_delete where s.tor_id = sp_tor_id and i_enabled = 1 ) as sp_tor_delete
    , (select top 1 c_comment from sp_tor_delete where s.tor_id = sp_tor_id and i_enabled = 1 ) as tor_delete_comment
    "
            . " from ({$sqlTempTable}) a "
            . " inner join dbo.sp_tor s on s.tor_id=a.tor_id"
            . " left join dbo.sp_tor_contract ss on ss.sp_tor_id = s.tor_id "
            . " WHERE a.row > ? and a.row <= ?";
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    $i_purchase = array(0 => '', 1 => 'จัดซื้อ', 2 => 'จัดจ้าง', 3 => 'จัดเช่า');
    $i_type_contract = array(0 => '', 1 => 'สัญญา', 2 => 'ใบสั่ง', 3 => 'จะซื้อจะขาย');
    $i_product_type = array(0 => 'ไม่มีของ', 1 => 'วัสดุทั่วไป', 2 => 'ครุภัณฑ์', 3 => 'ไม่มีของ');
    while ($row = $db->Fetch($stmt)) {
        $i_type_bg = null;
        $i_type_bgTxt = null;
        $sp = null;
        if ($row["sp_tor_delete"] == 1) {
            $sp = "<b style='color:#F43217'>" . $row["c_name"] . "</b>";
        }
        // i_type_contract
        switch (intval($row["i_type_bg"])) {
            case 0:
                $i_type_bg = "color:#F43217";
                $i_type_bgTxt = '';
                break;
            case 1:
                $i_type_bg = "color:black";
                $i_type_bgTxt = 'PR ปกติ';
                break;
            case 2:
                $i_type_bg = "color:#116CEF";
                $i_type_bgTxt = 'PR หลักโครงการต่อเนื่อง(ไม่จองเงิน)';
                break;
            case 3:
                $i_type_bg = "color:#b085f5";
                $i_type_bgTxt = 'PR ย่อยโครงการต่อเนื่อง(จองเงิน)';
                break;
            case 4:
                $i_type_bg = "color:#CD8114";
                $i_type_bgTxt = 'PR ไม่จองเงิน (ใช้เงินกันเหลื่อม)';
                break;
            case 5:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'PR จองเงินข้ามส่งเบิก';
                break;
            case 6:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'PR จองเงินทำถึงสัญญา';
                break;
            case 7:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'PR จองเงินทำถึงตรวจรับ';
                break;
            case 8:
                $i_type_bg = "color:#AE00FF";
                $i_type_bgTxt = 'PR จองเงินตรวจรับ';
                break;
            default:
                $i_type_bg = "color:#F43217";
                $i_type_bgTxt = '';
                break;
        }
        $c_codeStatus = "<b style='{$i_type_bg}'>" . $row["c_code"] . "</b>" . ($row["tor_status_id"] > 0 ? "<image id='img-" . $row['tor_id'] . "' src='../images/icons/database_start.png'/>" : "");
        $i_type_bgTxt = "<b style='{$i_type_bg}'>" . $i_type_bgTxt . "</b>";

        $temp = array(
            "no" => $i++,
            "id" => intval($row["tor_id"]),
            "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
            "i_type_bg" => intval($row["i_type_bg"]),
            "i_type_bgTxt" => $i_type_bgTxt,
            "i_step" => intval($row["i_step"]),
            "i_edit" => intval($row["i_edit"]),
            "c_nameStatus" => $sp ?? $row["c_name"], //
            "sp_tor_delete" => $row["sp_tor_delete"],
            "i_receive" => intval($row["i_receive"]),
            "i_is_entrance" => intval($row["i_is_entrance"]),
            "i_is_register" => intval($row["i_is_register"]),
            "i_forword" => intval($row["i_forword"]),
            "i_backword" => intval($row["i_backword"]),
            "index_receive" => $row["index_receive"],
            "i_type_fix_rate" => intval($row["i_type_fix_rate"]),
            "c_code" => $row["c_code"],
            "delete_c_comment" => $row["delete_c_comment"],
            "i_bg_type" => intVal($row["i_bg_type"]),
            "i_is_request" => intVal($row["i_is_request"]),
            "contract_no" => $row["contract_no"],
            "c_codeStatus" => $c_codeStatus,
            "bg_budget_dtl_project_id" => intval($row["bg_budget_dtl_project_id"]),
            "i_is_more" => intval($row["i_is_more"]),
            "f_total_amt" => number_format($row["f_total_amt"], 2),
            "i_is_rename" => intval($row["i_is_rename"]),
            "c_budget_dtl_project" => $row["c_budget_dtl_project"],
            "c_name" => $row["c_name"],
            "txtdc_department_idID" => $row["dc_department_name"], //txtdc_department_idID txtdc_department_idID
            "c_code_status" => $row["c_code_status"],
            "c_name_status" => $row["c_name_status"],
            "tor_status_id" => $row["tor_status_id"],
            "bg_check_id" => intval($row["bg_check_id"]),
            "dc_cost_id" => intval($row["dc_cost_id"]),
            "dc_cost_idTxt" => $row["dc_cost_idTxt"],
            "dc_cost2_id" => intval($row["dc_cost2_id"]),
            "dc_cost2_idTxt" => $row["dc_cost2_idTxt"],
            "sp_emp_name" => $row["sp_emp_name"],
            "txtsp_emp_idID" => $row["sp_emp_name"],
            "sp_emp_id" => intval($row["sp_emp_id"]),
            "dc_department_id" => intval($row["dc_department_id"]),
            "c_department" => $row["c_department"],
            "i_parent" => $row["i_parent"],
            "i_is_parent" => $row["i_is_parent"],
            "d_doc_ref" => $row["d_doc_ref"],
            "i_year" => $row["i_yyyy"],
            "i_yyyy" => $row["i_yyyy"],
            "c_year" => intval($row["i_yyyy"] + 543),
            "tor_type_id" => $row["tor_type_id"],
            "c_tor_type" => $row["c_type_name"], // $tor_type[$row["tor_type_id"]],
            "i_purchase" => intval($row["i_purchase"]),
            "c_purchase" => $i_purchase[$row["i_purchase"]],
            "c_type_contract" => $i_type_contract[$row["i_type_contract"]],
            "c_product_type" => $i_product_type[$row["i_product_type"]],
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "po_expense_id" => intval(($row["po_expense_id"] == 0 ? $row["po_expense_main_id"] : $row["po_expense_id"])),
            "po_expense_main_id" => intval($row["po_expense_main_id"]),
            "dc_user_create_id" => $row["c_create_name"],
            "dc_user_create_cost_id" => $row["c_cost_creat_name"],
            "DateAdd1" => ((empty($row["DateAdd1"])) ? "" : $date->extDateBuddha($row["DateAdd1"])), //d_tor_date d_tor_status_date
            "DateAdd2" => ((empty($row["DateAdd2"])) ? "" : $date->extDateBuddha($row["DateAdd2"])), //d_tor_date d_tor_status_date
            "d_tor_date_pa" => ((empty($row["d_tor_date_pa"])) ? "" : $date->extDateBuddha($row["d_tor_date_pa"])), //d_tor_date d_tor_status_date
            "d_tor_date" => ((empty($row["d_tor_date"])) ? "" : $date->extDateBuddha($row["d_tor_date"])), //d_tor_date d_tor_status_date
            "d_tor_status_date" => ((empty($row["d_tor_status_date"])) ? "" : $date->extDateBuddha($row["d_tor_status_date"])), //d_tor_date
            "d_doc_date" => ((empty($row["d_doc_date"])) ? "" : $date->extDateBuddha($row["d_doc_date"])), //d_tor_date
            "d_egp_date" => ((empty($row["d_egp_date"])) ? "" : $date->extDateBuddha($row["d_egp_date"])), //d_tor_date
            "d_create" => $date->extDateBuddha($row["d_create"]), //
            "dc_user_update_id" => $row["c_update_name"],
            "dc_user_update_cost_id" => $row["c_cost_update_name"],
            "d_update" => $date->extDateBuddha($row["d_update"]),
            "start_date" => $date->extDateBuddha($row["start_date"]),
            "end_date" => $date->extDateBuddha($row["end_date"]),
            "i_enabled" => intval($row["i_enabled"]),
            "tor_hdr_dtl" => intval($row["tor_hdr_dtl"]),
            "c_comment" => $row["c_comment"],
            "c_comment_status" => $row["c_comment_status"],
            "c_remake" => $row["c_remake"],
            "po_creditor_id" => intval($row["po_creditor_id"]),
            "po_creditor_idTxt" => $row["po_creditor_idTxt"],
            "i_type_contract" => $row["i_type_contract"],
            "i_hire_type" => $row["i_hire_type"],
            "i_is_inv" => $row["i_is_inv"],
            "i_type_fix_rate" => $row["i_type_fix_rate"],
            "i_product_type" => $row["i_product_type"],
            "i_delivery_date" => $row["i_delivery_date"],
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "dc_expense_budget_type2_id" => intval($row["dc_expense_budget_type2_id"]),
            "dc_expense_budget_type3_id" => intval($row["dc_expense_budget_type3_id"]),
            "dc_expense_budget_type4_id" => intval($row["dc_expense_budget_type4_id"]),
            "dc_expense_budget_type5_id" => intval($row["dc_expense_budget_type5_id"]),
            "f_type_amt" => number_format($row["f_type_amt"], 2),
            "f_type2_amt" => number_format($row["f_type2_amt"], 2),
            "f_type3_amt" => number_format($row["f_type3_amt"], 2),
            "f_type4_amt" => number_format($row["f_type4_amt"], 2),
            "f_type5_amt" => number_format($row["f_type5_amt"], 2),
            "i_pr_type1" => $row["i_pr_type1"],
            "i_pr_type2" => $row["i_pr_type2"],
            "i_pr_type3" => $row["i_pr_type3"],
            "i_pr_type4" => $row["i_pr_type4"],
            "i_pr_type5" => $row["i_pr_type5"],
            "bg_reserve_money1_id" => $row["bg_reserve_money1_id"],
            "bg_reserve_money2_id" => $row["bg_reserve_money2_id"],
            "bg_reserve_money3_id" => $row["bg_reserve_money3_id"],
            "bg_reserve_money4_id" => $row["bg_reserve_money4_id"],
            "bg_reserve_money5_id" => $row["bg_reserve_money5_id"],
        );
        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
    exit();
} else if ($type == "po_working_dtl2") {
    $editArry = array(
        3 => '<span style="color:red">ส่งแก้ไข</span>' // พนักงานสายงาน
        ,
        2 => '<span style="color:red">ส่งแก้ไข</span>' // หัวหน้าสายงาน
        ,
        1 => '<span style="color:red">แก้ไขแล้ว</span>' // ธุระการ
        ,
        4 => '<span style="color:blue">แก้ไขแล้ว</span>',
        5 => '<span style="color:blue"></span>',
        6 => '<span style="color:blue"></span>'
    );

    $tor_status_id = $_REQUEST["tor_status_id"] ?? null; // status id
    $i_alarm = $_REQUEST["i_alarm"] ?? null; // status id
    $i_pa = $_REQUEST["i_pa"] ?? null; // status id


    $step = (!empty($tor_status_id)) ? $tor_status_id : 0;
    $addConfDay1 = (!empty($i_alarm)) ? $i_alarm : 0;
    $addConfDay2 = (!empty($i_pa)) ? $i_pa : 0;

    if ($act == "SEARCH") {
        $wh .= ($_REQUEST['tor_type_id'] != 0) ? " and a.tor_type_id =" . $_REQUEST['tor_type_id'] : "";
        $wh .= ($_REQUEST['c_code'] != "") ? " and a.c_code like '%" . $_REQUEST['c_code'] . "%'" : "";
        $wh .= ($_REQUEST['c_name'] != "") ? " and a.c_name like '%" . $_REQUEST['c_name'] . "%'" : "";
        $wh .= " and a.i_enabled =" . $_REQUEST['i_enabled'];

        if ($_REQUEST['i_post1'] == 1) {
            $wh .= " and a.sp_emp_id =" . $_REQUEST['sp_emp_id'];
        }
        if ($i_post != 0) {
            if ($i_post == 1) {
                $wh .= " and tor_status_id is not null";
            } else {
                $wh .= " and tor_status_id is null";
            }
        }
    } else {
        $wh .= ($tor_type_show == true) ? " and tor_status_id is null" : "";
    }


    $is_audit = $_REQUEST['is_audit'] ?? null;

    if ($is_audit == 'true') {
        $waudit = ""; //"and a.i_is_register in (2 , 1)";
    } else {
        $waudit = "";
    }
    // $is_waudit = $waudit ?? null ;
    // echo $waudit;
    // exit;
    //    echo $_SESSION['user_id'];
    //    exit();
    // if ($_SESSION['user_id'] != 1)
    //     $sp_self = " and a.sp_emp_id =" . $_REQUEST['sp_emp_id'];
    // else
    //     $sp_self = '';


    $type_menu = $_REQUEST['type_menu'] ?? null;

    $sqlTempTable = "select a.tor_id
                    , a.po_expense_id as po_expense_main_id
                    , a.dc_expense_budget_type_id
                     , a.bg_budget_dtl_project_id
                        , a.dc_department_id
                        , a.po_creditor_id
                        , a.dc_cost_id
                        , a.dc_cost2_id
                        , a.sp_emp_id
                        , a.i_is_rename
                        , a.tor_type_id
                        , a.i_is_more
                        , a.i_step
                        , a.i_receive
                        , a.i_forword
                        , a.i_backword
                        , a.tor_status_id
                        , a.index_receive
                        , a.i_enabled
                        , a.i_is_request
                        , (select count (sp_tor_dtl_id) from sp_tor_dtl aa where  aa. sp_tor_id = a.tor_id ) as tor_hdr_dtl
                        , a.i_type_contract, a.i_hire_type, isnull(a.i_product_type,0) as i_product_type, a.i_is_inv, a.i_type_fix_rate,i_delivery_date
                        , row_number() over (order by a.d_update DESC) as row
                        from dbo.sp_tor a  where a.i_is_notor = 0 and a.i_enabled=1 {$waudit}";

    //    if ($tor_status_id == 13) {
    //        $sqlTempTable .= " and (a.i_edit in (3 , 5) or a.tor_status_id in (" . $step . '))' . $wh . $util->viewDepartment('a', 0, $type_menu); //
    //    } else { }
    //    $sqlTempTable .= " and a.tor_status_id =" . $step . $wh . $util->viewDepartment('a', 0, $type_menu); //

    if ($tor_status_id == (13) && $is_audit == 'true') {
        $sqlTempTable .= " and a.i_type_bg in (1,5,6,7) and (a.tor_status_id =" . $step . ')' . $wh . $util->viewDepartment('a', 0, $type_menu); //
    } else {
        $sqlTempTable .= "   and a.i_is_request in (1,3) " . $wh . $util->viewDepartment('a', 0, $type_menu); //
    }
    // $sqlTempTable .= " and (a.tor_status_id =" . $step . ')' . $wh . $util->viewDepartment('a', 0, $type_menu); //
    // echo $sqlTempTable; exit();

    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlMain = "select a.* , s.c_code
                        , s.i_is_register
                        , (select top 1 b.dc_user_id from sp_emp a
                        inner join dc_user b on b.dc_emp_id = a.dc_emp_id
                        where sp_emp_id = s.sp_emp_id) as dc_user_id
                        ,case when
                            ss.sp_tor_id = s.tor_id  then 1
                            else 0
                            end  as contract_no
                        , s.c_budget_dtl_project
                        , s.c_name
                        , s.c_department
                        , s.d_doc_ref
                       , (select top 1 po_expense_id  from dbo.sp_tor_dtl  where sp_tor_id=s.tor_id)  as po_expense_id
                        , (select top 1 c_name from dbo.sp_department  where dc_department_id=s.dc_department_id)  as dc_department_name
                        , (select top 1 c_code from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as c_code_status
                        , (select top 1 c_name from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as c_name_status
                        , (select top 1 i_entrance from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as i_is_entrance
                        , (select top 1 c_name from dbo.sp_type_status where sp_type_status_id=s.tor_type_id)  as c_type_name
                        , (select top 1 c_name from dbo.sp_emp where sp_emp_id=s.sp_emp_id)  as sp_emp_name
                        , (select top 1 isnull(c_comment,'') from sp_tor_item aa where aa.tor_id = s.tor_id and aa.sp_status_hdr_id = {$step}) c_comment_status
                        , isnull(s.i_purchase,1) as i_purchase
                        , isnull(s.tor_type_id,1) as tor_type_id
                        , s.f_period_amt
                        , s.f_total_amt
                        , isnull(s.i_parent,0) as i_parent
                        , isnull(s.i_is_parent,0) as i_is_parent
                        , isnull(s.index_receive,0) as index_receive
                        , isnull(s.i_type_fix_rate,0) as i_type_fix_rate
                        , s.start_date
                        , s.end_date
                        , s.c_comment
                        , convert(varchar, s.d_doc_date, 120) as d_doc_date
                        , s.i_edit
                        , s.i_type_bg
                        , s.c_remake
                        , s.i_yyyy as i_yyyy
                        , convert(varchar, s.d_tor_date, 120) as d_tor_date
                        , convert(varchar, s.d_tor_status_date, 120) as d_tor_status_date
                        , s.i_alarm_balance
                        , convert(varchar(10), DATEADD(day, " . $addConfDay1 . ", getdate()), 120) AS DateAdd1
                        , convert(varchar(10), DATEADD(day, " . $addConfDay2 . ", getdate()), 120) AS DateAdd2
                        , convert(varchar, s.d_tor_date_alert, 120) as d_tor_date_alert
                        , convert(varchar, s.d_tor_date_pa, 120) as d_tor_date_pa
                        , isnull((select top 1 i_bg_type from dbo.dc_expense_budget_type where dc_expense_budget_type_id=s.dc_expense_budget_type_id),0)  as i_bg_type
                        , (select top 1 c_name from dbo.po_creditor where po_creditor_id=a.po_creditor_id)  as po_creditor_idTxt
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=a.dc_cost_id)  as dc_cost_idTxt
                        , (SELECT TOP 1 c_name FROM dbo.dc_cost WHERE dc_cost_id=a.dc_cost2_id)  AS dc_cost2_idTxt
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_create_id) as c_create_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_create_cost_id) as c_cost_creat_name
                        , convert(varchar, s.d_create, 120) as d_create
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_update_id) as c_update_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_update_cost_id) as c_cost_update_name
                        , convert(varchar, s.d_update, 120) as d_update
        , s.dc_expense_budget_type_id
        , s.f_type_amt
        , s.bg_reserve_money1_id
        , CASE WHEN s.i_purchase > 1 THEN s.bg_reserve_money1_id
          ELSE (select top 1 bg_reserve_money_id from dbo.sp_tor_dtl where sp_tor_id = s.tor_id) END as bg_check_id
        , s.dc_expense_budget_type2_id
        , s.f_type2_amt
         , s.bg_reserve_money2_id
        , s.dc_expense_budget_type3_id
        , s.f_type3_amt
         , s.bg_reserve_money3_id
        , s.dc_expense_budget_type4_id
        , s.f_type4_amt
         , s.bg_reserve_money4_id
        , s.dc_expense_budget_type5_id
        , s.f_type5_amt
         , s.bg_reserve_money5_id
        , s.i_pr_type1
        , s.i_pr_type2
        , s.i_pr_type3
        , s.i_pr_type4
        , s.i_pr_type5
        , s.plan_status
        , s.plan_code
        "
            . " from ({$sqlTempTable}) a "
            . " inner join dbo.sp_tor s on s.tor_id=a.tor_id"
            . " left join dbo.sp_tor_contract ss on ss.sp_tor_id = s.tor_id "
            . " WHERE a.row > ? and a.row <= ?";

    // dc_emp_id c_emp_name dc_cnt_id dc_cnt_name
    //             print_r($arrParam);
    //          echo $sqlMain;
    //           exit;
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    $i_purchase = array(0 => '', 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
    while ($row = $db->Fetch($stmt)) {
        $i_type_bg = null;
        $i_type_bgTxt = null;
        switch (intval($row["i_type_bg"])) {
            case 0:
                $i_type_bg = "color:#F43217";
                $i_type_bgTxt = '';
                break;
            case 1:
                $i_type_bg = "color:black";
                $i_type_bgTxt = 'การจัดทำ PR ปกติ';
                break;
            case 2:
                $i_type_bg = "color:#116CEF";
                $i_type_bgTxt = 'การจัดทำ PR หลักโครงการต่อเนื่อง(ไม่จองเงิน)';
                break;
            case 3:
                $i_type_bg = "color:#b085f5";
                $i_type_bgTxt = 'การจัดทำ PR ย่อยโครงการต่อเนื่อง(จองเงิน)';
                break;
            case 4:
                $i_type_bg = "color:#CD8114";
                $i_type_bgTxt = 'การจัดทำ PR ไม่จองเงิน (ใช้เงินกันเหลื่อม)';
                break;
            case 5:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'การจัดทำ PR จองเงินข้ามส่งเบิก';
                break;
            case 6:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'การจัดทำ PR จองเงินทำถึงสัญญา';
                break;
            case 7:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'การจัดทำ PR จองเงินทำถึงตรวจรับ';
                break;
            default:
                $i_type_bg = "color:#F43217";
                $i_type_bgTxt = '';
                break;
        }
        $c_codeStatus = "<b style='{$i_type_bg}'>" . $row["c_code"] . "</b>" . ($row["tor_status_id"] > 0 ? "<image id='img-" . $row['tor_id'] . "' src='../images/icons/database_start.png'/>" : "");

        $temp = array(
            "no" => $i++,
            "id" => intval($row["tor_id"]),
            "i_type_bg" => intval($row["i_type_bg"]),
            "dc_user_id" => intval($row["dc_user_id"]),
            "i_type_bgTxt" => $i_type_bgTxt,
            "i_step" => intval($row["i_step"]),
            "i_edit" => intval($row["i_edit"]),
            "i_receive" => intval($row["i_receive"]),
            "i_is_entrance" => intval($row["i_is_entrance"]),
            "i_is_register" => intval($row["i_is_register"]),
            "i_forword" => intval($row["i_forword"]),
            "i_backword" => intval($row["i_backword"]),
            "index_receive" => $row["index_receive"],
            "i_type_fix_rate" => intval($row["i_type_fix_rate"]),
            "c_code" => $row["c_code"],
            "i_bg_type" => $row["i_bg_type"],
            "i_is_request" => $row["i_is_request"],
            "contract_no" => $row["contract_no"],
            "c_codeStatus" => $c_codeStatus,
            "bg_budget_dtl_project_id" => intval($row["bg_budget_dtl_project_id"]),
            "i_is_more" => intval($row["i_is_more"]),
            "f_total_amt" => number_format($row["f_total_amt"], 2),
            "i_is_rename" => intval($row["i_is_rename"]),
            "c_budget_dtl_project" => $row["c_budget_dtl_project"],
            "c_name" => $row["c_name"],
            "txtdc_department_idID" => $row["dc_department_name"], //txtdc_department_idID txtdc_department_idID
            "c_code_status" => $row["c_code_status"],
            "c_name_status" => $row["c_name_status"],
            "tor_status_id" => $row["tor_status_id"],
            "bg_check_id" => intval($row["bg_check_id"]),
            "dc_cost_id" => intval($row["dc_cost_id"]),
            "dc_cost_idTxt" => $row["dc_cost_idTxt"],
            "dc_cost2_id" => intval($row["dc_cost2_id"]),
            "dc_cost2_idTxt" => $row["dc_cost2_idTxt"],
            "sp_emp_name" => $row["sp_emp_name"],
            "txtsp_emp_idID" => $row["sp_emp_name"],
            "sp_emp_id" => intval($row["sp_emp_id"]),
            "dc_department_id" => intval($row["dc_department_id"]),
            "c_department" => $row["c_department"],
            "i_parent" => $row["i_parent"],
            "i_is_parent" => $row["i_is_parent"],
            "d_doc_ref" => $row["d_doc_ref"],
            "i_year" => $row["i_yyyy"],
            "i_yyyy" => $row["i_yyyy"],
            "c_year" => intval($row["i_yyyy"] + 543),
            "tor_type_id" => $row["tor_type_id"],
            "c_tor_type" => $row["c_type_name"], // $tor_type[$row["tor_type_id"]],
            "i_purchase" => intval($row["i_purchase"]),
            "c_purchase" => $i_purchase[$row["i_purchase"]],
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "po_expense_id" => intval(($row["po_expense_id"] == 0 ? $row["po_expense_main_id"] : $row["po_expense_id"])),
            "po_expense_main_id" => intval($row["po_expense_main_id"]),
            "dc_user_create_id" => $row["c_create_name"],
            "dc_user_create_cost_id" => $row["c_cost_creat_name"],
            "DateAdd1" => ((empty($row["DateAdd1"])) ? "" : $date->extDateBuddha($row["DateAdd1"])), //d_tor_date d_tor_status_date
            "DateAdd2" => ((empty($row["DateAdd2"])) ? "" : $date->extDateBuddha($row["DateAdd2"])), //d_tor_date d_tor_status_date
            "d_tor_date_pa" => ((empty($row["d_tor_date_pa"])) ? "" : $date->extDateBuddha($row["d_tor_date_pa"])), //d_tor_date d_tor_status_date
            "d_tor_date" => ((empty($row["d_tor_date"])) ? "" : $date->extDateBuddha($row["d_tor_date"])), //d_tor_date d_tor_status_date
            "d_tor_status_date" => ((empty($row["d_tor_status_date"])) ? "" : $date->extDateBuddha($row["d_tor_status_date"])), //d_tor_date
            "d_doc_date" => ((empty($row["d_doc_date"])) ? "" : $date->extDateBuddha($row["d_doc_date"])), //d_tor_date
            "d_create" => $date->extDateBuddha($row["d_create"]), //
            "dc_user_update_id" => $row["c_update_name"],
            "dc_user_update_cost_id" => $row["c_cost_update_name"],
            "d_update" => $date->extDateBuddha($row["d_update"]),
            "start_date" => $date->extDateBuddha($row["start_date"]),
            "end_date" => $date->extDateBuddha($row["end_date"]),
            "i_enabled" => intval($row["i_enabled"]),
            "tor_hdr_dtl" => intval($row["tor_hdr_dtl"]),
            "c_comment" => $row["c_comment"],
            "c_comment_status" => $row["c_comment_status"],
            "c_remake" => $row["c_remake"],
            "po_creditor_id" => intval($row["po_creditor_id"]),
            "po_creditor_idTxt" => $row["po_creditor_idTxt"],
            "i_type_contract" => $row["i_type_contract"],
            "i_hire_type" => $row["i_hire_type"],
            "i_is_inv" => $row["i_is_inv"],
            "i_type_fix_rate" => $row["i_type_fix_rate"],
            "i_product_type" => $row["i_product_type"],
            "i_delivery_date" => $row["i_delivery_date"],
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "dc_expense_budget_type2_id" => intval($row["dc_expense_budget_type2_id"]),
            "dc_expense_budget_type3_id" => intval($row["dc_expense_budget_type3_id"]),
            "dc_expense_budget_type4_id" => intval($row["dc_expense_budget_type4_id"]),
            "dc_expense_budget_type5_id" => intval($row["dc_expense_budget_type5_id"]),
            "f_type_amt" => number_format($row["f_type_amt"], 2),
            "f_type2_amt" => number_format($row["f_type2_amt"], 2),
            "f_type3_amt" => number_format($row["f_type3_amt"], 2),
            "f_type4_amt" => number_format($row["f_type4_amt"], 2),
            "f_type5_amt" => number_format($row["f_type5_amt"], 2),
            "i_pr_type1" => $row["i_pr_type1"],
            "i_pr_type2" => $row["i_pr_type2"],
            "i_pr_type3" => $row["i_pr_type3"],
            "i_pr_type4" => $row["i_pr_type4"],
            "i_pr_type5" => $row["i_pr_type5"],
            "bg_reserve_money1_id" => $row["bg_reserve_money1_id"],
            "bg_reserve_money2_id" => $row["bg_reserve_money2_id"],
            "bg_reserve_money3_id" => $row["bg_reserve_money3_id"],
            "bg_reserve_money4_id" => $row["bg_reserve_money4_id"],
            "bg_reserve_money5_id" => $row["bg_reserve_money5_id"],
            "plan_status" => $row["plan_status"],
            "plan_code" => $row["plan_code"],
        );
        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
    exit();
} else if ($type == "po_working_dtl3") {
    $editArry = array(
        3 => '<span style="color:red">ส่งแก้ไข</span>' // พนักงานสายงาน
        ,
        2 => '<span style="color:red">ส่งแก้ไข</span>' // หัวหน้าสายงาน
        ,
        1 => '<span style="color:red">แก้ไขแล้ว</span>' // ธุระการ
        ,
        4 => '<span style="color:blue">แก้ไขแล้ว</span>',
        5 => '<span style="color:blue"></span>',
        6 => '<span style="color:blue"></span>'
    );

    $tor_status_id = $_REQUEST["tor_status_id"] ?? null; // status id
    $i_alarm = $_REQUEST["i_alarm"] ?? null; // status id
    $i_pa = $_REQUEST["i_pa"] ?? null; // status id


    $step = (!empty($tor_status_id)) ? $tor_status_id : 0;
    $addConfDay1 = (!empty($i_alarm)) ? $i_alarm : 0;
    $addConfDay2 = (!empty($i_pa)) ? $i_pa : 0;

    if ($act == "SEARCH") {
        $wh .= ($_REQUEST['tor_type_id'] != 0) ? " and a.tor_type_id =" . $_REQUEST['tor_type_id'] : "";
        $wh .= ($_REQUEST['c_code'] != "") ? " and a.c_code like '%" . $_REQUEST['c_code'] . "%'" : "";
        $wh .= ($_REQUEST['c_name'] != "") ? " and a.c_name like '%" . $_REQUEST['c_name'] . "%'" : "";
        $wh .= " and a.i_enabled =" . $_REQUEST['i_enabled'];

        if ($_REQUEST['i_post1'] == 1) {
            $wh .= " and a.sp_emp_id =" . $_REQUEST['sp_emp_id'];
        }
        if ($i_post != 0) {
            if ($i_post == 1) {
                $wh .= " and tor_status_id is not null";
            } else {
                $wh .= " and tor_status_id is null";
            }
        }
    } else {
        $wh .= ($tor_type_show == true) ? " and tor_status_id is null" : "";
    }


    $is_audit = $_REQUEST['is_audit'] ?? null;

    if ($is_audit == 'true') {
        $waudit = "and a.i_is_register in (2 , 1)";
    } else {
        $waudit = "";
    }

    $type_menu = $_REQUEST['type_menu'] ?? null;

    $sqlTempTable = "select a.tor_id
                    , a.po_expense_id as po_expense_main_id
                    , a.dc_expense_budget_type_id
                     , a.bg_budget_dtl_project_id
                        , a.dc_department_id
                        , a.po_creditor_id
                        , a.dc_cost_id
                        , a.dc_cost2_id
                        , a.sp_emp_id
                        , a.i_is_rename
                        , a.tor_type_id
                        , a.i_is_more
                        , a.i_step
                        , a.i_receive
                        , a.i_forword
                        , a.i_backword
                        , a.tor_status_id
                        , a.index_receive
                        , a.i_enabled
                        , a.i_is_request
                        , (select count (sp_tor_dtl_id) from sp_tor_dtl aa where  aa. sp_tor_id = a.tor_id ) as tor_hdr_dtl
                        , a.i_type_contract, a.i_hire_type, isnull(a.i_product_type,0) as i_product_type, a.i_is_inv, a.i_type_fix_rate,i_delivery_date
                        , row_number() over (order by a.tor_id DESC) as row
                        from dbo.sp_tor a  where a.i_is_notor = 0 and a.i_enabled=1 and a.i_type_bg = 8 {$waudit}";

    //    if ($tor_status_id == 13) {
    //        $sqlTempTable .= " and (a.i_edit in (3 , 5) or a.tor_status_id in (" . $step . '))' . $wh . $util->viewDepartment('a', 0, $type_menu); //
    //    } else { }
    //    $sqlTempTable .= " and a.tor_status_id =" . $step . $wh . $util->viewDepartment('a', 0, $type_menu); //

    if ($tor_status_id == (13) && $is_audit == 'true') {
        $sqlTempTable .= " and a.i_type_bg in (1,5,6,7) and (a.tor_status_id =" . $step . ')' . $wh . $util->viewDepartment('a', 0, $type_menu); //
    } else {
        $sqlTempTable .= " and a.i_is_request=1 " . $wh . $util->viewDepartment('a', 0, $type_menu); //
    }

    // $sqlTempTable .= " and (a.tor_status_id =" . $step . ')' . $wh . $util->viewDepartment('a', 0, $type_menu); //
    // echo $sqlTempTable; exit();

    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlMain = "select a.* , s.c_code
                        , s.i_is_register
                        ,case when
                            ss.sp_tor_id = s.tor_id  then 1
                            else 0
                            end  as contract_no
                        , s.c_budget_dtl_project
                        , s.c_name
                        , s.c_department
                        , s.d_doc_ref
                       , (select top 1 po_expense_id  from dbo.sp_tor_dtl  where sp_tor_id=s.tor_id)  as po_expense_id
                        , (select top 1 c_name from dbo.sp_department  where dc_department_id=s.dc_department_id)  as dc_department_name
                        , (select top 1 c_code from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as c_code_status
                        , (select top 1 c_name from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as c_name_status
                        , (select top 1 i_entrance from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as i_is_entrance
                        , (select top 1 c_name from dbo.sp_type_status where sp_type_status_id=s.tor_type_id)  as c_type_name
                        , (select top 1 c_name from dbo.sp_emp where sp_emp_id=s.sp_emp_id)  as sp_emp_name
                        , (select top 1 isnull(c_comment,'') from sp_tor_item aa where aa.tor_id = s.tor_id and aa.sp_status_hdr_id = {$step}) c_comment_status
                        , isnull(s.i_purchase,1) as i_purchase
                        , isnull(s.tor_type_id,1) as tor_type_id
                        , s.f_period_amt
                        , s.f_total_amt
                        , isnull(s.i_parent,0) as i_parent
                        , isnull(s.i_is_parent,0) as i_is_parent
                        , isnull(s.index_receive,0) as index_receive
                        , isnull(s.i_type_fix_rate,0) as i_type_fix_rate
                        , s.start_date
                        , s.end_date
                        , s.c_comment
                        , convert(varchar, s.d_doc_date, 120) as d_doc_date
                        , s.i_edit
                        , s.i_type_bg
                        , s.c_remake
                        , s.i_yyyy as i_yyyy
                        , convert(varchar, s.d_tor_date, 120) as d_tor_date
                        , convert(varchar, s.d_tor_status_date, 120) as d_tor_status_date
                        , s.i_alarm_balance
                        , convert(varchar(10), DATEADD(day, " . $addConfDay1 . ", getdate()), 120) AS DateAdd1
                        , convert(varchar(10), DATEADD(day, " . $addConfDay2 . ", getdate()), 120) AS DateAdd2
                        , convert(varchar, s.d_tor_date_alert, 120) as d_tor_date_alert
                        , convert(varchar, s.d_tor_date_pa, 120) as d_tor_date_pa
                        , isnull((select top 1 i_bg_type from dbo.dc_expense_budget_type where dc_expense_budget_type_id=s.dc_expense_budget_type_id),0)  as i_bg_type
                        , (select top 1 c_name from dbo.po_creditor where po_creditor_id=a.po_creditor_id)  as po_creditor_idTxt
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=a.dc_cost_id)  as dc_cost_idTxt
                        , (SELECT TOP 1 c_name FROM dbo.dc_cost WHERE dc_cost_id=a.dc_cost2_id)  AS dc_cost2_idTxt
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_create_id) as c_create_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_create_cost_id) as c_cost_creat_name
                        , convert(varchar, s.d_create, 120) as d_create
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_update_id) as c_update_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_update_cost_id) as c_cost_update_name
                        , convert(varchar, s.d_update, 120) as d_update
        , s.dc_expense_budget_type_id
        , s.f_type_amt
        , s.bg_reserve_money1_id
        , CASE WHEN s.i_purchase > 1 THEN s.bg_reserve_money1_id
          ELSE (select top 1 bg_reserve_money_id from dbo.sp_tor_dtl where sp_tor_id = s.tor_id) END as bg_check_id
        , s.dc_expense_budget_type2_id
        , s.f_type2_amt
         , s.bg_reserve_money2_id
        , s.dc_expense_budget_type3_id
        , s.f_type3_amt
         , s.bg_reserve_money3_id
        , s.dc_expense_budget_type4_id
        , s.f_type4_amt
         , s.bg_reserve_money4_id
        , s.dc_expense_budget_type5_id
        , s.f_type5_amt
         , s.bg_reserve_money5_id
        , s.i_pr_type1
        , s.i_pr_type2
        , s.i_pr_type3
        , s.i_pr_type4
        , s.i_pr_type5
        "
            . " from ({$sqlTempTable}) a "
            . " inner join dbo.sp_tor s on s.tor_id=a.tor_id"
            . " left join dbo.sp_tor_contract ss on ss.sp_tor_id = s.tor_id "
            . " WHERE a.row > ? and a.row <= ?";

    // dc_emp_id c_emp_name dc_cnt_id dc_cnt_name
    //             print_r($arrParam);
    //          echo $sqlMain;
    //           exit;
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    $i_purchase = array(0 => '', 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
    while ($row = $db->Fetch($stmt)) {
        $i_type_bg = null;
        $i_type_bgTxt = null;
        switch (intval($row["i_type_bg"])) {
            case 0:
                $i_type_bg = "color:#F43217";
                $i_type_bgTxt = '';
                break;
            case 1:
                $i_type_bg = "color:black";
                $i_type_bgTxt = 'การจัดทำ PR ปกติ';
                break;
            case 2:
                $i_type_bg = "color:#116CEF";
                $i_type_bgTxt = 'การจัดทำ PR หลักโครงการต่อเนื่อง(ไม่จองเงิน)';
                break;
            case 3:
                $i_type_bg = "color:#b085f5";
                $i_type_bgTxt = 'การจัดทำ PR ย่อยโครงการต่อเนื่อง(จองเงิน)';
                break;
            case 4:
                $i_type_bg = "color:#CD8114";
                $i_type_bgTxt = 'การจัดทำ PR ไม่จองเงิน (ใช้เงินกันเหลื่อม)';
                break;
            case 5:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'การจัดทำ PR จองเงินข้ามส่งเบิก';
                break;
            case 6:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'การจัดทำ PR จองเงินทำถึงสัญญา';
                break;
            case 7:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'การจัดทำ PR จองเงินทำถึงตรวจรับ';
                break;
            default:
                $i_type_bg = "color:#F43217";
                $i_type_bgTxt = '';
                break;
        }
        $c_codeStatus = "<b style='{$i_type_bg}'>" . $row["c_code"] . "</b>" . ($row["tor_status_id"] > 0 ? "<image id='img-" . $row['tor_id'] . "' src='../images/icons/database_start.png'/>" : "");

        $temp = array(
            "no" => $i++,
            "id" => intval($row["tor_id"]),
            "i_type_bg" => intval($row["i_type_bg"]),
            "i_type_bgTxt" => $i_type_bgTxt,
            "i_step" => intval($row["i_step"]),
            "i_edit" => intval($row["i_edit"]),
            "i_receive" => intval($row["i_receive"]),
            "i_is_entrance" => intval($row["i_is_entrance"]),
            "i_is_register" => intval($row["i_is_register"]),
            "i_forword" => intval($row["i_forword"]),
            "i_backword" => intval($row["i_backword"]),
            "index_receive" => $row["index_receive"],
            "i_type_fix_rate" => intval($row["i_type_fix_rate"]),
            "c_code" => $row["c_code"],
            "i_bg_type" => $row["i_bg_type"],
            "i_is_request" => $row["i_is_request"],
            "contract_no" => $row["contract_no"],
            "c_codeStatus" => $c_codeStatus,
            "bg_budget_dtl_project_id" => intval($row["bg_budget_dtl_project_id"]),
            "i_is_more" => intval($row["i_is_more"]),
            "f_total_amt" => number_format($row["f_total_amt"], 2),
            "i_is_rename" => intval($row["i_is_rename"]),
            "c_budget_dtl_project" => $row["c_budget_dtl_project"],
            "c_name" => $row["c_name"],
            "txtdc_department_idID" => $row["dc_department_name"], //txtdc_department_idID txtdc_department_idID
            "c_code_status" => $row["c_code_status"],
            "c_name_status" => $row["c_name_status"],
            "tor_status_id" => $row["tor_status_id"],
            "bg_check_id" => intval($row["bg_check_id"]),
            "dc_cost_id" => intval($row["dc_cost_id"]),
            "dc_cost_idTxt" => $row["dc_cost_idTxt"],
            "dc_cost2_id" => intval($row["dc_cost2_id"]),
            "dc_cost2_idTxt" => $row["dc_cost2_idTxt"],
            "sp_emp_name" => $row["sp_emp_name"],
            "txtsp_emp_idID" => $row["sp_emp_name"],
            "sp_emp_id" => intval($row["sp_emp_id"]),
            "dc_department_id" => intval($row["dc_department_id"]),
            "c_department" => $row["c_department"],
            "i_parent" => $row["i_parent"],
            "i_is_parent" => $row["i_is_parent"],
            "d_doc_ref" => $row["d_doc_ref"],
            "i_year" => $row["i_yyyy"],
            "i_yyyy" => $row["i_yyyy"],
            "c_year" => intval($row["i_yyyy"] + 543),
            "tor_type_id" => $row["tor_type_id"],
            "c_tor_type" => $row["c_type_name"], // $tor_type[$row["tor_type_id"]],
            "i_purchase" => intval($row["i_purchase"]),
            "c_purchase" => $i_purchase[$row["i_purchase"]],
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "po_expense_id" => intval(($row["po_expense_id"] == 0 ? $row["po_expense_main_id"] : $row["po_expense_id"])),
            "po_expense_main_id" => intval($row["po_expense_main_id"]),
            "dc_user_create_id" => $row["c_create_name"],
            "dc_user_create_cost_id" => $row["c_cost_creat_name"],
            "DateAdd1" => ((empty($row["DateAdd1"])) ? "" : $date->extDateBuddha($row["DateAdd1"])), //d_tor_date d_tor_status_date
            "DateAdd2" => ((empty($row["DateAdd2"])) ? "" : $date->extDateBuddha($row["DateAdd2"])), //d_tor_date d_tor_status_date
            "d_tor_date_pa" => ((empty($row["d_tor_date_pa"])) ? "" : $date->extDateBuddha($row["d_tor_date_pa"])), //d_tor_date d_tor_status_date
            "d_tor_date" => ((empty($row["d_tor_date"])) ? "" : $date->extDateBuddha($row["d_tor_date"])), //d_tor_date d_tor_status_date
            "d_tor_status_date" => ((empty($row["d_tor_status_date"])) ? "" : $date->extDateBuddha($row["d_tor_status_date"])), //d_tor_date
            "d_doc_date" => ((empty($row["d_doc_date"])) ? "" : $date->extDateBuddha($row["d_doc_date"])), //d_tor_date
            "d_create" => $date->extDateBuddha($row["d_create"]), //
            "dc_user_update_id" => $row["c_update_name"],
            "dc_user_update_cost_id" => $row["c_cost_update_name"],
            "d_update" => $date->extDateBuddha($row["d_update"]),
            "start_date" => $date->extDateBuddha($row["start_date"]),
            "end_date" => $date->extDateBuddha($row["end_date"]),
            "i_enabled" => intval($row["i_enabled"]),
            "tor_hdr_dtl" => intval($row["tor_hdr_dtl"]),
            "c_comment" => $row["c_comment"],
            "c_comment_status" => $row["c_comment_status"],
            "c_remake" => $row["c_remake"],
            "po_creditor_id" => intval($row["po_creditor_id"]),
            "po_creditor_idTxt" => $row["po_creditor_idTxt"],
            "i_type_contract" => $row["i_type_contract"],
            "i_hire_type" => $row["i_hire_type"],
            "i_is_inv" => $row["i_is_inv"],
            "i_type_fix_rate" => $row["i_type_fix_rate"],
            "i_product_type" => $row["i_product_type"],
            "i_delivery_date" => $row["i_delivery_date"],
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "dc_expense_budget_type2_id" => intval($row["dc_expense_budget_type2_id"]),
            "dc_expense_budget_type3_id" => intval($row["dc_expense_budget_type3_id"]),
            "dc_expense_budget_type4_id" => intval($row["dc_expense_budget_type4_id"]),
            "dc_expense_budget_type5_id" => intval($row["dc_expense_budget_type5_id"]),
            "f_type_amt" => number_format($row["f_type_amt"], 2),
            "f_type2_amt" => number_format($row["f_type2_amt"], 2),
            "f_type3_amt" => number_format($row["f_type3_amt"], 2),
            "f_type4_amt" => number_format($row["f_type4_amt"], 2),
            "f_type5_amt" => number_format($row["f_type5_amt"], 2),
            "i_pr_type1" => $row["i_pr_type1"],
            "i_pr_type2" => $row["i_pr_type2"],
            "i_pr_type3" => $row["i_pr_type3"],
            "i_pr_type4" => $row["i_pr_type4"],
            "i_pr_type5" => $row["i_pr_type5"],
            "bg_reserve_money1_id" => $row["bg_reserve_money1_id"],
            "bg_reserve_money2_id" => $row["bg_reserve_money2_id"],
            "bg_reserve_money3_id" => $row["bg_reserve_money3_id"],
            "bg_reserve_money4_id" => $row["bg_reserve_money4_id"],
            "bg_reserve_money5_id" => $row["bg_reserve_money5_id"],
        );
        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
    exit();
} else if ($type == "sp_tor_dempartment") {

    $tor_status_id = $_REQUEST["tor_status_id"] ?? null; // status id
    $i_alarm = $_REQUEST["i_alarm"] ?? null; // status id
    $i_pa = $_REQUEST["i_pa"] ?? null; // status id

    $step = (!empty($tor_status_id)) ? $tor_status_id : 0;
    $addConfDay1 = (!empty($i_alarm)) ? $i_alarm : 0;
    $addConfDay2 = (!empty($i_pa)) ? $i_pa : 0;

    if ($act == "SEARCH") {
        $wh .= ($_REQUEST['tor_type_id'] != 0) ? " and a.tor_type_id =" . $_REQUEST['tor_type_id'] : "";
        $wh .= ($_REQUEST['c_code'] != "") ? " and a.c_code like '%" . $_REQUEST['c_code'] . "%'" : "";
        $wh .= ($_REQUEST['c_name'] != "") ? " and a.c_name like '%" . $_REQUEST['c_name'] . "%'" : "";
        $wh .= " and a.i_enabled =" . $_REQUEST['i_enabled'];
        if ($i_post != 0) {
            if ($i_post == 1) {
                $wh .= " and tor_status_id is not null";
            } else {
                $wh .= " and tor_status_id is null";
            }
        }
    } else {
        $wh .= ($tor_type_show == true) ? " and tor_status_id is null" : "";
    }


    $sqlTempTable = "select a.tor_id
                  , a.po_expense_id
                    , a.dc_expense_budget_type_id
                     , a.bg_budget_dtl_project_id
                        , a.dc_department_id
                        , a.po_creditor_id
                        , a.dc_cost_id
                        , a.dc_cost2_id
                        , a.sp_emp_id
                        , a.i_is_rename
                        , a.tor_type_id
                        , a.i_is_more
                        , a.i_step
                        , a.i_forword
                        , a.i_backword
                        , a.tor_status_id
                        , a.i_enabled
                        , a.i_is_register
                        , a.i_hire_type, a.i_product_type, a.i_is_inv, a.i_type_fix_rate,i_delivery_date
                        , row_number() over (order by a.tor_id DESC) as row
                        from dbo.sp_tor a  where a.i_enabled=1";
    $sqlTempTable .= " and (a.tor_status_id =" . $step . ')' . $wh . $util->viewDepartmentTor('a', $_SESSION["dc_department_id"]); //
    //     echo $sqlTempTable;
    //     exit;
    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlMain = "select a.* , s.c_code
                        , s.c_budget_dtl_project
                        , s.c_name
                        , s.c_department
                        , s.d_doc_ref
                        , (select top 1 c_name from dbo.sp_emp where sp_emp_id=s.sp_emp_id)  as emp_name
                        , (select top 1 c_name from dbo.sp_department  where dc_department_id=s.dc_department_id)  as dc_department_name
                        , (select top 1 c_code from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as c_code_status
                        , (select top 1 c_name from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as c_name_status
                        , (select top 1 i_entrance from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as i_is_entrance
                        , (select top 1 c_name from dbo.sp_type_status where sp_type_status_id=s.tor_type_id)  as c_type_name
                        , (select top 1 isnull(c_comment,'') from sp_tor_item aa where aa.tor_id = s.tor_id and aa.sp_status_hdr_id = {$step}) c_comment_status
                        , isnull(s.i_purchase,1) as i_purchase
                        , isnull(s.tor_type_id,1) as tor_type_id
                        , s.f_period_amt
                        , s.f_total_amt
                        , isnull(s.i_parent,0) as i_parent
                        , isnull(s.i_is_parent,0) as i_is_parent
                        , isnull(s.i_type_fix_rate,0) as i_type_fix_rate
                        , s.start_date
                        , s.end_date
                        , s.i_edit
                        , s.i_type_bg
                        , s.c_comment
                        , s.c_remake
                        , s.plan_status
                        , s.plan_code
                        , s.i_yyyy as i_yyyy
                        , s.i_amount_bg
                        ,s.f_type_amt
                        , s.bg_reserve_money1_id
                        ,   CASE WHEN isnull(s.bg_reserve_money1_id,0)  =   0 THEN  (select top 1 isnull(bg_reserve_money_id,0) from dbo.sp_tor_dtl where sp_tor_id = s.tor_id)
                            ELSE isnull(s.bg_reserve_money1_id,0)  END as bg_check_id
                        , s.dc_expense_budget_type2_id
                        , s.f_type2_amt
                        , s.bg_reserve_money2_id
                        , s.dc_expense_budget_type3_id
                        , s.f_type3_amt
                        , s.bg_reserve_money3_id
                        , s.i_pr_type1
                        , s.i_pr_type2
                        , s.i_pr_type3
                        , convert(varchar, s.d_tor_date, 120) as d_tor_date
                        , convert(varchar, s.d_tor_status_date, 120) as d_tor_status_date
                        , s.i_alarm_balance
                        , convert(varchar(10), DATEADD(day, " . $addConfDay1 . ", getdate()), 120) AS DateAdd1
                        , convert(varchar(10), DATEADD(day, " . $addConfDay2 . ", getdate()), 120) AS DateAdd2
                        , convert(varchar, s.d_tor_date_alert, 120) as d_tor_date_alert
                        , convert(varchar, s.d_tor_date_pa, 120) as d_tor_date_pa
                        , (select top 1 c_name from dbo.po_creditor where po_creditor_id=a.po_creditor_id)  as po_creditor_idTxt
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=a.dc_cost_id)  as dc_cost_idTxt
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=a.dc_cost2_id)  as dc_cost2_idTxt
                        , (select top 1 i_enabled from sp_tor_delete where s.tor_id = sp_tor_id and i_enabled = 1 ) as sp_tor_delete
                        , (select top 1 c_comment from sp_tor_delete where s.tor_id = sp_tor_id and i_enabled = 1 ) as tor_delete_comment
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_create_id) as c_create_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_create_cost_id) as c_cost_creat_name
                        , convert(varchar, d_create, 120) as d_create
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_update_id) as c_update_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_update_cost_id) as c_cost_update_name
                        , (select i_type from sp_type_bg where i_value =  s.i_type_bg ) as sp_type_bg
                        , convert(varchar, d_update, 120) as d_update "
            . " from ({$sqlTempTable}) a "
            . " inner join dbo.sp_tor s on s.tor_id=a.tor_id"
            . " WHERE a.row > ? and a.row <= ?";

    //
    //             print_r($arrParam);
    // echo $sqlMain;
    // exit;

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    $i_purchase = array(0 => '', 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');

    while ($row = $db->Fetch($stmt)) {
        $i_type_bg = null;
        $i_type_bgTxt = null;
        $sp = null;
        if ($row["sp_tor_delete"] == 1) {
            $sp = "<b style='color:#F43217'>" . $row["c_name"] . "</b>";
        }
        switch (intval($row["i_type_bg"])) {
            case 0:
                $i_type_bg = "color:#F43217";
                $i_type_bgTxt = '';
                break;
            case 1:
                $i_type_bg = "color:black";
                $i_type_bgTxt = 'การจัดทำ PR ปกติ';
                break;
            case 2:
                $i_type_bg = "color:#116CEF";
                $i_type_bgTxt = 'การจัดทำ PR หลักโครงการต่อเนื่อง(ไม่จองเงิน)';
                break;
            case 3:
                $i_type_bg = "color:#b085f5";
                $i_type_bgTxt = 'การจัดทำ PR ย่อยโครงการต่อเนื่อง(จองเงิน)';
                break;
            case 4:
                $i_type_bg = "color:#CD8114";
                $i_type_bgTxt = 'การจัดทำ PR ไม่จองเงิน (ใช้เงินกันเหลื่อม)';
                break;
            case 5:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'การจัดทำ PR จองเงินข้ามส่งเบิก';
                break;
            case 6:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'การจัดทำ PR จองเงินทำถึงสัญญา';
                break;
            case 7:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'การจัดทำ PR จองเงินทำถึงตรวจรับ';
                break;
            case 11:
                $i_type_bg = "color:#B8860B";
                $i_type_bgTxt = 'PR ไม่จองเงินทำถึงตรวจรับ';
                break;
            case 12:
                $i_type_bg = "color:#000080";
                $i_type_bgTxt = 'PR ก่อนปีงบประมาณ';
                break;
            default:
                $i_type_bg = "color:#F43217";
                $i_type_bgTxt = '';
                break;
        }
        $c_codeStatus = "<b style='{$i_type_bg}'>" . $row["c_code"] . "</b>" . ($row["tor_status_id"] > 0 ? "<image id='img-" . $row['tor_id'] . "' src='../images/icons/database_start.png'/>" : "");

        $temp = array(
            "no" => $i++,
            "id" => intval($row["tor_id"]),
            "i_type_bg" => intval($row["i_type_bg"]),
            "i_type_bgTxt" => $i_type_bgTxt,
            "i_step" => intval($row["i_step"]),
            "i_edit" => intval($row["i_edit"]),
            "sp_type_bg" => intval($row["sp_type_bg"]),
            "c_nameStatus" => $sp ?? $row["c_name"],
            "i_is_entrance" => intval($row["i_is_entrance"]),
            "i_forword" => intval($row["i_forword"]),
            "i_type_fix_rate" => intval($row["i_type_fix_rate"]),
            "i_backword" => intval($row["i_backword"]),
            "c_code" => $row["c_code"],
            "tor_delete_comment" => $row["tor_delete_comment"],
            "txtsp_emp_idID" => $row["emp_name"],
            "sp_emp_id" => intval($row["sp_emp_id"]),
            "c_codeStatus" => $c_codeStatus,
            "sp_tor_delete" => $row["sp_tor_delete"],
            "bg_budget_dtl_project_id" => intval($row["bg_budget_dtl_project_id"]),
            "i_is_more" => intval($row["i_is_more"]),
            "f_total_amt" => number_format($row["f_total_amt"], 2),
            "i_is_rename" => intval($row["i_is_rename"]),
            "c_budget_dtl_project" => $row["c_budget_dtl_project"],
            "c_name" => $row["c_name"],
            "txtdc_department_idID" => $row["dc_department_name"], //txtdc_department_idID txtdc_department_idID
            "c_code_status" => $row["c_code_status"],
            "c_name_status" => $row["c_name_status"],
            "tor_status_id" => $row["tor_status_id"],
            "dc_cost_id" => intval($row["dc_cost_id"]),
            "dc_cost2_id" => intval($row["dc_cost2_id"]),
            "dc_cost_idTxt" => $row["dc_cost_idTxt"],
            "dc_cost2_idTxt" => $row["dc_cost2_idTxt"],
            "dc_department_id" => intval($row["dc_department_id"]),
            "c_department" => $row["c_department"],
            "i_parent" => $row["i_parent"],
            "i_is_register" => $row["i_is_register"],
            "i_is_parent" => $row["i_is_parent"],
            "d_doc_ref" => $row["d_doc_ref"],
            "i_year" => $row["i_yyyy"],
            "i_yyyy" => $row["i_yyyy"],
            "c_year" => intval($row["i_yyyy"] + 543),
            "tor_type_id" => $row["tor_type_id"],
            "c_tor_type" => $row["c_type_name"], // $tor_type[$row["tor_type_id"]],
            "i_purchase" => intval($row["i_purchase"]),
            "c_purchase" => $i_purchase[$row["i_purchase"]],
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "po_expense_id" => intval($row["po_expense_id"]),
            "dc_user_create_id" => $row["c_create_name"],
            "dc_user_create_cost_id" => $row["c_cost_creat_name"],
            "DateAdd1" => ((empty($row["DateAdd1"])) ? "" : $date->extDateBuddha($row["DateAdd1"])), //d_tor_date d_tor_status_date
            "DateAdd2" => ((empty($row["DateAdd2"])) ? "" : $date->extDateBuddha($row["DateAdd2"])), //d_tor_date d_tor_status_date
            "d_tor_date_pa" => ((empty($row["d_tor_date_pa"])) ? "" : $date->extDateBuddha($row["d_tor_date_pa"])), //d_tor_date d_tor_status_date
            "d_tor_date" => ((empty($row["d_tor_date"])) ? "" : $date->extDateBuddha($row["d_tor_date"])), //d_tor_date d_tor_status_date
            "d_tor_status_date" => ((empty($row["d_tor_status_date"])) ? "" : $date->extDateBuddha($row["d_tor_status_date"])), //d_tor_date
            "d_create" => $date->extDateBuddha($row["d_create"]), //
            "dc_user_update_id" => $row["c_update_name"],
            "dc_user_update_cost_id" => $row["c_cost_update_name"],
            "d_update" => $date->extDateBuddha($row["d_update"]),
            "start_date" => $date->extDateBuddha($row["start_date"]),
            "end_date" => $date->extDateBuddha($row["end_date"]),
            "i_enabled" => intval($row["i_enabled"]),
            "c_comment_status" => $row["c_comment_status"],
            "c_comment" => $row["c_comment"],
            "c_remake" => $row["c_remake"],
            "plan_status" => $row["plan_status"],
            "plan_code" => $row["plan_code"],
            "po_creditor_id" => intval($row["po_creditor_id"]),
            "po_creditor_idTxt" => $row["po_creditor_idTxt"],
            "i_hire_type" => $row["i_hire_type"],
            "i_is_inv" => $row["i_is_inv"],
            "i_type_fix_rate" => $row["i_type_fix_rate"],
            "i_product_type" => $row["i_product_type"],
            "i_delivery_date" => $row["i_delivery_date"],
            "i_amount_bg" => $row["i_amount_bg"] == null ? 1 : $row["i_amount_bg"],
            "i_pr_type1" => $row["i_pr_type1"],
            "i_pr_type2" => $row["i_pr_type2"],
            "i_pr_type3" => $row["i_pr_type3"],
            "bg_reserve_money1_id" => $row["bg_reserve_money1_id"],
            "bg_reserve_money2_id" => $row["bg_reserve_money2_id"],
            "bg_reserve_money3_id" => $row["bg_reserve_money3_id"],
            "f_type_amt" => number_format($row["f_type_amt"], 2),
            "f_type2_amt" => number_format($row["f_type2_amt"], 2),
            "f_type3_amt" => number_format($row["f_type3_amt"], 2),
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "dc_expense_budget_type2_id" => intval($row["dc_expense_budget_type2_id"]),
            "dc_expense_budget_type3_id" => intval($row["dc_expense_budget_type3_id"]),
        );
        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
    exit();
} else if ($type == "po_working_dtl_bg") {
    $editArry = array(
        3 => '<span style="color:red">ส่งแก้ไข</span>' // พนักงานสายงาน
        ,
        2 => '<span style="color:red">ส่งแก้ไข</span>' // หัวหน้าสายงาน
        ,
        1 => '<span style="color:red">แก้ไขแล้ว</span>' // ธุระการ
        ,
        4 => '<span style="color:blue">แก้ไขแล้ว</span>',
        5 => '<span style="color:blue"></span>',
        6 => '<span style="color:blue"></span>'
    );

    $tor_status_id = $_REQUEST["tor_status_id"] ?? null; // status id
    $i_alarm = $_REQUEST["i_alarm"] ?? null; // status id
    $i_pa = $_REQUEST["i_pa"] ?? null; // status id
    // is_audit
    $step = (!empty($tor_status_id)) ? $tor_status_id : 0;
    $addConfDay1 = (!empty($i_alarm)) ? $i_alarm : 0;
    $addConfDay2 = (!empty($i_pa)) ? $i_pa : 0;
    $i_post1 = $_REQUEST['i_post1'] ?? null;
    if ($act == "SEARCH") {
        $wh .= ($_REQUEST['tor_type_id'] != 0) ? " and a.tor_type_id =" . $_REQUEST['tor_type_id'] : "";
        $wh .= ($_REQUEST['c_code'] != "") ? " and a.c_code like '%" . $_REQUEST['c_code'] . "%'" : "";
        $wh .= ($_REQUEST['c_name'] != "") ? " and a.c_name like '%" . $_REQUEST['c_name'] . "%'" : "";
        if ($_SESSION['i_level'] != 1) {
            $wh .= ($_REQUEST['sp_emp_id'] != 0) ? " and a.sp_emp_id = " . $_REQUEST['sp_emp_id'] : " and a.dc_department_id =" . $_SESSION['dc_department_id'];
        }
        $wh .= " and a.i_enabled =" . $_REQUEST['i_enabled'];
        if ($i_post1 == 1) {
            $wh .= " and a.sp_emp_id =" . $_REQUEST['sp_emp_id'];
        }
        if ($i_post != 0) {
            if ($i_post == 1) {
                $wh .= " and tor_status_id is not null";
            } else {
                $wh .= " and tor_status_id is null";
            }
        }
    } else {
        $wh .= ($tor_type_show == true) ? " and tor_status_id is null" : "";
    }
    if ($_SESSION['i_level'] == 1) {

    } else if ($_SESSION['i_level'] == 2 && $_SESSION['dc_department_id'] == 5) {

    } else if ($_SESSION['i_level'] == 2) {
        $wh .= " and a.dc_department_id =" . $_SESSION['dc_department_id'];
    } else {
        $wh .= ($_SESSION['sp_emp_id'] != 0) ? " and a.sp_emp_id = " . $_SESSION['sp_emp_id'] : "";
    }
    $is_audit = $_REQUEST['is_audit'] ?? null;

    if ($is_audit == 'true') {
        // $waudit = "and a.i_is_register in (2, 1)";
        $waudit = "";
    } else {
        $waudit = "";
    }
    // echo($wh);
    // exit;
    $type_menu = $_REQUEST['type_menu'] ?? null;

    $sqlTempTable = "select a.tor_id
                    , a.po_expense_id as po_expense_main_id
                    , a.dc_expense_budget_type_id
                     , a.bg_budget_dtl_project_id
                        , a.dc_department_id
                        , a.po_creditor_id
                        , a.dc_cost_id
                        , a.dc_cost2_id
                        , a.sp_emp_id
                        , a.i_is_rename
                        , a.tor_type_id
                        , a.i_is_more
                        , a.i_step
                        , a.i_receive
                        , a.i_forword
                        , a.i_backword
                        , a.tor_status_id
                        , a.index_receive
                        , a.i_enabled
                        , a.i_is_request
                        , (select count (sp_tor_dtl_id) from sp_tor_dtl aa where  aa. sp_tor_id = a.tor_id ) as tor_hdr_dtl
                        , a.i_type_contract, a.i_hire_type, isnull(a.i_product_type,0) as i_product_type, a.i_is_inv, a.i_type_fix_rate,i_delivery_date
                        , row_number() over (order by a.tor_id DESC) as row
                        from dbo.sp_tor a  where a.i_is_notor = 0 and a.i_enabled=1 {$waudit}";
    $sqlTempTable .= " and a.i_type_bg in (12) and a.tor_status_id != 10060" . $wh . $util->viewDepartment('a', 0, $type_menu); //
    // if ($tor_status_id == (13) && $is_audit == 'true') {
    // } else {
    // $sqlTempTable .= " and (a.tor_status_id =" . $step . ')' . $wh . $util->viewDepartment('a', 0, $type_menu); //
    // }

    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlMain = "select a.* , s.c_code
                        , s.i_is_register
                        ,case when
                            ss.sp_tor_id = s.tor_id  then 1
                            else 0
                            end  as contract_no
                        , s.c_budget_dtl_project
                        , s.c_name
                        , isnull(ss.sp_tor_contract_id,0) as  sp_tor_contract_id
                        , s.c_department
                        , s.d_doc_ref
                       , (select top 1 po_expense_id  from dbo.sp_tor_dtl  where sp_tor_id=s.tor_id)  as po_expense_id
                        , (select top 1 c_name from dbo.sp_department  where dc_department_id=s.dc_department_id)  as dc_department_name
                        , (select top 1 c_code from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as c_code_status
                        , (select top 1 c_name from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as c_name_status
                        , (select top 1 i_entrance from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as i_is_entrance
                        , (select top 1 c_name from dbo.sp_type_status where sp_type_status_id=s.tor_type_id)  as c_type_name
                        , (select top 1 c_name from dbo.sp_emp where sp_emp_id=s.sp_emp_id)  as sp_emp_name
                        , (select top 1 isnull(c_comment,'') from sp_tor_item aa where aa.tor_id = s.tor_id and aa.sp_status_hdr_id = {$step}) c_comment_status
                        , isnull(s.i_purchase,1) as i_purchase
                        , isnull(s.tor_type_id,1) as tor_type_id
                        , s.f_period_amt
                        , s.f_total_amt
                        , isnull(s.i_parent,0) as i_parent
                        , isnull(s.i_is_parent,0) as i_is_parent
                        , isnull(s.index_receive,0) as index_receive
                        , isnull(s.i_type_fix_rate,0) as i_type_fix_rate
                        , s.start_date
                        , s.end_date
                        , s.c_comment
                        , convert(varchar, s.d_doc_date, 120) as d_doc_date
                        , s.i_edit
                        , s.i_type_bg
                        , s.c_remake
                        , s.i_yyyy as i_yyyy
                        , convert(varchar, s.d_tor_date, 120) as d_tor_date
                        , convert(varchar, s.d_tor_status_date, 120) as d_tor_status_date
                        , s.i_alarm_balance
                        , convert(varchar(10), DATEADD(day, " . $addConfDay1 . ", getdate()), 120) AS DateAdd1
                        , convert(varchar(10), DATEADD(day, " . $addConfDay2 . ", getdate()), 120) AS DateAdd2
                        , convert(varchar, s.d_tor_date_alert, 120) as d_tor_date_alert
                        , convert(varchar, s.d_tor_date_pa, 120) as d_tor_date_pa
                        , isnull((select top 1 i_bg_type from dbo.dc_expense_budget_type where dc_expense_budget_type_id=s.dc_expense_budget_type_id),0)  as i_bg_type
                        , (select top 1 c_name from dbo.po_creditor where po_creditor_id=a.po_creditor_id)  as po_creditor_idTxt
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=a.dc_cost_id)  as dc_cost_idTxt
                        , (SELECT TOP 1 c_name FROM dbo.dc_cost WHERE dc_cost_id=a.dc_cost2_id)  AS dc_cost2_idTxt
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_create_id) as c_create_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_create_cost_id) as c_cost_creat_name
                        , convert(varchar, s.d_create, 120) as d_create
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_update_id) as c_update_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_update_cost_id) as c_cost_update_name
                        , convert(varchar, s.d_update, 120) as d_update
                        , convert(varchar, s.d_egp_date, 120) as d_egp_date
        , s.dc_expense_budget_type_id
        , s.f_type_amt
        , isnull(s.bg_reserve_money1_id,(select top 1 bg_reserve_money_id from sp_tor_dtl where sp_Tor_id = s.tor_id)) as bg_reserve_money1_id
        ,CASE WHEN isnull(s.bg_reserve_money1_id,0)  =   0 THEN  (select top 1 isnull(bg_reserve_money_id,0) from dbo.sp_tor_dtl where sp_tor_id = s.tor_id)
        ELSE isnull(s.bg_reserve_money1_id,0)  END as bg_check_id
        , s.dc_expense_budget_type2_id
        , s.f_type2_amt
         , s.bg_reserve_money2_id
        , s.dc_expense_budget_type3_id
        , s.f_type3_amt
         , s.bg_reserve_money3_id
        , s.dc_expense_budget_type4_id
        , s.f_type4_amt
         , s.bg_reserve_money4_id
        , s.dc_expense_budget_type5_id
        , s.f_type5_amt
         , s.bg_reserve_money5_id
        , s.i_pr_type1
        , s.i_pr_type2
        , s.i_pr_type3
        , s.i_pr_type4
        , s.i_pr_type5
        , s.i_amount_bg
        , s.plan_status
        , s.plan_code
        , (select i_type from sp_type_bg where i_value =  i_type_bg ) as sp_type_bg
        , (select i_value from sp_type_bg where i_value =  i_type_bg ) as sp_type_value
        , (select top 1 i_enabled from sp_tor_delete where s.tor_id = sp_tor_id and i_enabled = 1 ) as sp_tor_delete
        , (select top 1 c_comment from sp_tor_delete where s.tor_id = sp_tor_id and i_enabled = 1 ) as tor_delete_comment
        , (select top 1 i_edit from sp_tor_bg_log where s.tor_id = sp_tor_id  ORDER BY d_create  desc ) as sp_bg_edit
        , (select top 1 c_comment_edit1 from sp_tor_bg_log where s.tor_id = sp_tor_id  ORDER BY d_create  desc ) as c_comment_edit1
        "
            . " from ({$sqlTempTable}) a "
            . " inner join dbo.sp_tor s on s.tor_id=a.tor_id"
            . " left join dbo.sp_tor_contract ss on ss.sp_tor_id = s.tor_id "
            . " WHERE a.row > ? and a.row <= ?";
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    $i_purchase = array(0 => '', 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
    $sp_contract_year = ($_REQUEST['tor_status_id'] == 20) ? $db->GetDataBySQL("SELECT a.i_year_be FROM dbo.sp_contract_year a WHERE  a.i_enabled = ? ", array($_REQUEST["i_enabled"])) : "";
    while ($row = $db->Fetch($stmt)) {
        $i_type_bg = null;
        $i_type_bgTxt = null;
        $i_edit = null;
        $sp = null;
        if ($row["sp_tor_delete"] == 1) {
            $sp = "<b style='color:#F43217'>" . $row["c_name"] . "</b>";
        }
        switch (intval($row["i_type_bg"])) {
            case 0:
                $i_type_bg = "color:#F43217";
                $i_type_bgTxt = '';
                break;
            case 1:
                $i_type_bg = "color:black";
                $i_type_bgTxt = 'PR ปกติ';
                break;
            case 2:
                $i_type_bg = "color:#116CEF";
                $i_type_bgTxt = 'PR หลักโครงการต่อเนื่อง(ไม่จองเงิน)';
                break;
            case 3:
                $i_type_bg = "color:#b085f5";
                $i_type_bgTxt = 'PR ย่อยโครงการต่อเนื่อง(จองเงิน)';
                break;
            case 4:
                $i_type_bg = "color:#CD8114";
                $i_type_bgTxt = 'PR ไม่จองเงิน (ใช้เงินกันเหลื่อม)';
                break;
            case 5:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'PR จองเงินข้ามส่งเบิก';
                break;
            case 6:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'PR จองเงินทำถึงสัญญา';
                break;
            case 7:
                $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'PR จองเงินทำถึงตรวจรับ';
                break;
            case 8:
                $i_type_bg = "color:#AE00FF";
                $i_type_bgTxt = 'PR จองเงินตรวจรับ';
                break;
            case 11:
                $i_type_bg = "color:#B8860B";
                $i_type_bgTxt = 'PR ไม่จองเงินทำถึงตรวจรับ';
                break;
            case 12:
                $i_type_bg = "color:#000080";
                $i_type_bgTxt = 'PR ก่อนปีงบประมาณ';
                break;
            default:
                $i_type_bg = "color:#F43217";
                $i_type_bgTxt = '';
                break;
        }
        if ($row["sp_bg_edit"] == 1) {
            $i_type_bg = "color:#F5B041";
            $i_type_bgTxt = 'PR อยู่ระหว่างแก้ไขงบประมาณ';
        } else if ($row["sp_bg_edit"] == 2) {
            $i_type_bg = "color:#006400";
            $i_type_bgTxt = 'รับเรื่องคืนจากฝ่ายจัดสรร';
        }
        $c_codeStatus = "<b style='{$i_type_bg}'>" . $row["c_code"] . "</b>" . ($row["tor_status_id"] > 0 ? "<image id='img-" . $row['tor_id'] . "' src='../images/icons/database_start.png'/>" : "");
        $i_type_bgTxt = "<b style='{$i_type_bg}'>" . $i_type_bgTxt . "</b>";
        $temp = array(
            "no" => $i++,
            "id" => intval($row["tor_id"]),
            "sp_type_bg" => intval($row["sp_type_bg"]),
            "sp_type_value" => intval($row["sp_type_value"]),
            "sp_contract_year" => $sp_contract_year,
            "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
            "i_type_bg" => intval($row["i_type_bg"]),
            "i_type_bgTxt" => $i_type_bgTxt,
            "i_step" => intval($row["i_step"]),
            "sp_bg_edit" => intval($row["sp_bg_edit"]),
            "i_edit" => intval($row["i_edit"]),
            "c_nameStatus" => $sp ?? $row["c_name"], //
            "sp_tor_delete" => $row["sp_tor_delete"],
            "c_comment_edit1" => $row["c_comment_edit1"],
            "i_amount_bg" => $row["i_amount_bg"] == null ? 1 : $row["i_amount_bg"],
            "plan_status" => $row["plan_status"],
            "plan_code" => $row["plan_code"],
            "tor_delete_comment" => $row["tor_delete_comment"],
            "i_receive" => intval($row["i_receive"]),
            "i_is_entrance" => intval($row["i_is_entrance"]),
            "i_is_register" => intval($row["i_is_register"]),
            "i_forword" => intval($row["i_forword"]),
            "i_backword" => intval($row["i_backword"]),
            "index_receive" => $row["index_receive"],
            "i_type_fix_rate" => intval($row["i_type_fix_rate"]),
            "c_code" => $row["c_code"],
            "i_bg_type" => intVal($row["i_bg_type"]),
            "i_is_request" => intVal($row["i_is_request"]),
            "contract_no" => $row["contract_no"],
            "c_codeStatus" => $c_codeStatus,
            "bg_budget_dtl_project_id" => intval($row["bg_budget_dtl_project_id"]),
            "i_is_more" => intval($row["i_is_more"]),
            "f_total_amt" => number_format($row["f_total_amt"], 2),
            "i_is_rename" => intval($row["i_is_rename"]),
            "c_budget_dtl_project" => $row["c_budget_dtl_project"],
            "c_name" => $row["c_name"],
            "txtdc_department_idID" => $row["dc_department_name"], //txtdc_department_idID txtdc_department_idID
            "c_code_status" => $row["c_code_status"],
            "c_name_status" => $row["c_name_status"],
            "tor_status_id" => $row["tor_status_id"],
            "bg_check_id" => intval($row["bg_check_id"]),
            "dc_cost_id" => intval($row["dc_cost_id"]),
            "dc_cost_idTxt" => $row["dc_cost_idTxt"],
            "dc_cost2_id" => intval($row["dc_cost2_id"]),
            "dc_cost2_idTxt" => $row["dc_cost2_idTxt"],
            "sp_emp_name" => $row["sp_emp_name"],
            "txtsp_emp_idID" => $row["sp_emp_name"],
            "sp_emp_id" => intval($row["sp_emp_id"]),
            "dc_department_id" => intval($row["dc_department_id"]),
            "c_department" => $row["c_department"],
            "i_parent" => $row["i_parent"],
            "i_is_parent" => $row["i_is_parent"],
            "d_doc_ref" => $row["d_doc_ref"],
            "i_year" => $row["i_yyyy"],
            "i_yyyy" => $row["i_yyyy"],
            "c_year" => intval($row["i_yyyy"] + 543),
            "tor_type_id" => $row["tor_type_id"],
            "c_tor_type" => $row["c_type_name"], // $tor_type[$row["tor_type_id"]],
            "i_purchase" => intval($row["i_purchase"]),
            "c_purchase" => $i_purchase[$row["i_purchase"]],
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "po_expense_id" => intval(($row["po_expense_id"] == 0 ? $row["po_expense_main_id"] : $row["po_expense_id"])),
            "po_expense_main_id" => intval($row["po_expense_main_id"]),
            "dc_user_create_id" => $row["c_create_name"],
            "dc_user_create_cost_id" => $row["c_cost_creat_name"],
            "DateAdd1" => ((empty($row["DateAdd1"])) ? "" : $date->extDateBuddha($row["DateAdd1"])), //d_tor_date d_tor_status_date
            "DateAdd2" => ((empty($row["DateAdd2"])) ? "" : $date->extDateBuddha($row["DateAdd2"])), //d_tor_date d_tor_status_date
            "d_tor_date_pa" => ((empty($row["d_tor_date_pa"])) ? "" : $date->extDateBuddha($row["d_tor_date_pa"])), //d_tor_date d_tor_status_date
            "d_tor_date" => ((empty($row["d_tor_date"])) ? "" : $date->extDateBuddha($row["d_tor_date"])), //d_tor_date d_tor_status_date
            "d_tor_status_date" => ((empty($row["d_tor_status_date"])) ? "" : $date->extDateBuddha($row["d_tor_status_date"])), //d_tor_date
            "d_doc_date" => ((empty($row["d_doc_date"])) ? "" : $date->extDateBuddha($row["d_doc_date"])), //d_tor_date
            "d_egp_date" => ((empty($row["d_egp_date"])) ? "" : $date->extDateBuddha($row["d_egp_date"])), //d_tor_date
            "d_create" => $date->extDateBuddha($row["d_create"]), //
            "dc_user_update_id" => $row["c_update_name"],
            "dc_user_update_cost_id" => $row["c_cost_update_name"],
            "d_update" => $date->extDateBuddha($row["d_update"]),
            "start_date" => $date->extDateBuddha($row["start_date"]),
            "end_date" => $date->extDateBuddha($row["end_date"]),
            "i_enabled" => intval($row["i_enabled"]),
            "tor_hdr_dtl" => intval($row["tor_hdr_dtl"]),
            "c_comment" => $row["c_comment"],
            "c_comment_status" => $row["c_comment_status"],
            "c_remake" => $row["c_remake"],
            "po_creditor_id" => intval($row["po_creditor_id"]),
            "po_creditor_idTxt" => $row["po_creditor_idTxt"],
            "i_type_contract" => $row["i_type_contract"],
            "i_hire_type" => $row["i_hire_type"],
            "i_is_inv" => $row["i_is_inv"],
            "i_type_fix_rate" => $row["i_type_fix_rate"],
            "i_product_type" => $row["i_product_type"],
            "i_delivery_date" => $row["i_delivery_date"],
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "dc_expense_budget_type2_id" => intval($row["dc_expense_budget_type2_id"]),
            "dc_expense_budget_type3_id" => intval($row["dc_expense_budget_type3_id"]),
            "dc_expense_budget_type4_id" => intval($row["dc_expense_budget_type4_id"]),
            "dc_expense_budget_type5_id" => intval($row["dc_expense_budget_type5_id"]),
            "f_type_amt" => number_format($row["f_type_amt"], 2),
            "f_type2_amt" => number_format($row["f_type2_amt"], 2),
            "f_type3_amt" => number_format($row["f_type3_amt"], 2),
            "f_type4_amt" => number_format($row["f_type4_amt"], 2),
            "f_type5_amt" => number_format($row["f_type5_amt"], 2),
            "i_pr_type1" => $row["i_pr_type1"],
            "i_pr_type2" => $row["i_pr_type2"],
            "i_pr_type3" => $row["i_pr_type3"],
            "i_pr_type4" => $row["i_pr_type4"],
            "i_pr_type5" => $row["i_pr_type5"],
            "bg_reserve_money1_id" => $row["bg_reserve_money1_id"],
            "bg_reserve_money2_id" => $row["bg_reserve_money2_id"],
            "bg_reserve_money3_id" => $row["bg_reserve_money3_id"],
            "bg_reserve_money4_id" => $row["bg_reserve_money4_id"],
            "bg_reserve_money5_id" => $row["bg_reserve_money5_id"],
            "i_amount_bg" => $row["i_amount_bg"] == null ? 1 : $row["i_amount_bg"],
        );
        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
    exit();
}