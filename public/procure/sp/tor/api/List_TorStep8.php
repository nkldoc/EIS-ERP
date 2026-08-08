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
 
if ($type == "sp_tor_dempartment") {

            
    $arrParam[] = ($_REQUEST['id']??NULL); 
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
                        from dbo.sp_tor a  where a.i_type_bg=8 and a.tor_id=?";
   // $sqlTempTable .= " and (a.tor_status_id =" . $step . ')' . $wh . $util->viewDepartmentTor('a', $_SESSION["dc_department_id"]); //
//         echo $sqlTempTable;
//         exit;
//    
          
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
                        , s.i_yyyy as i_yyyy
                        , convert(varchar, s.d_tor_date, 120) as d_tor_date
                        , convert(varchar, s.d_tor_status_date, 120) as d_tor_status_date
                        , s.i_alarm_balance 
                        , convert(varchar, s.d_tor_date_alert, 120) as d_tor_date_alert
                        , convert(varchar, s.d_tor_date_pa, 120) as d_tor_date_pa
                        , (select top 1 c_name from dbo.po_creditor where po_creditor_id=a.po_creditor_id)  as po_creditor_idTxt
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=a.dc_cost_id)  as dc_cost_idTxt
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=a.dc_cost2_id)  as dc_cost2_idTxt

                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_create_id) as c_create_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_create_cost_id) as c_cost_creat_name
                        , convert(varchar, d_create, 120) as d_create
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_update_id) as c_update_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_update_cost_id) as c_cost_update_name
                        , convert(varchar, d_update, 120) as d_update "
            . " from ({$sqlTempTable}) a "
            . " inner join dbo.sp_tor s on s.tor_id=a.tor_id"
            . "";

//
//             print_r($arrParam);
//     echo $sqlMain;
//     exit;

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    $i_purchase = array(0 => '', 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');

    while ($row = $db->Fetch($stmt)) {
        $i_type_bg = null;
        $i_type_bgTxt = null;
        switch (intval($row["i_type_bg"])) {
            case 0: $i_type_bg = "color:#F43217";
                $i_type_bgTxt = '';
                break;
            case 1: $i_type_bg = "color:black";
                $i_type_bgTxt = 'การจัดทำ PR ปกติ';
                break;
            case 2: $i_type_bg = "color:#116CEF";
                $i_type_bgTxt = 'การจัดทำ PR หลักโครงการต่อเนื่อง(ไม่จองเงิน)';
                break;
            case 3: $i_type_bg = "color:#b085f5";
                $i_type_bgTxt = 'การจัดทำ PR ย่อยโครงการต่อเนื่อง(จองเงิน)';
                break;
            case 4: $i_type_bg = "color:#CD8114";
                $i_type_bgTxt = 'การจัดทำ PR ไม่จองเงิน (ใช้เงินกันเหลื่อม)';
                break;
            case 5: $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'การจัดทำ PR จองเงินข้ามส่งเบิก';
                break;
            case 6: $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'การจัดทำ PR จองเงินทำถึงสัญญา';
                break;
            case 7: $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'การจัดทำ PR จองเงินทำถึงตรวจรับ';
                break;
            default :$i_type_bg = "color:#F43217";
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
            "i_is_entrance" => intval($row["i_is_entrance"]),
            "i_forword" => intval($row["i_forword"]),
            "i_type_fix_rate" => intval($row["i_type_fix_rate"]),
            "i_backword" => intval($row["i_backword"]),
            "c_code" => $row["c_code"],
            "txtsp_emp_idID" => $row["emp_name"],
            "sp_emp_id" => intval($row["sp_emp_id"]),
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
            "c_comment_status" => NULL,
            "c_comment" => $row["c_comment"],
            "c_remake" => $row["c_remake"],
            "po_creditor_id" => intval($row["po_creditor_id"]),
            "po_creditor_idTxt" => $row["po_creditor_idTxt"],
            "i_hire_type" => $row["i_hire_type"],
            "i_is_inv" => $row["i_is_inv"],
            "i_type_fix_rate" => $row["i_type_fix_rate"],
            "i_product_type" => $row["i_product_type"],
            "i_delivery_date" => $row["i_delivery_date"],
        );
        ${$root}[] = $temp;
    }  
    echo json_encode(array("debug" => true, "totalCount" => 1, $root => ${$root}));
    exit();
}