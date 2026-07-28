<?php
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");
// ::: sqld+space
// echo $db->debugSql($sql1, $params);
// exit;



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

//TORSTEPD11
/*

1	APSTEPS10	พนักงานผู้ดำเนินการ ลงนามตรวจสอบ
2	APSTEPS20	หัวหน้าสายงานซื้อจ้าง ลงนามตรวจสอบ
3	APSTEPS30	หัวหน้าพัสดุ ลงนามตรวจสอบ
4	APSTEPS40	รองคณะบดี ลงนามตรวจสอบ
5	APSTEPS50	คณะบดีลงนามอนุมัติเอกสาร*/

if ($type == "APSTEPS10") {
//1	APSTEPS10	พนักงานผู้ดำเนินการ ลงนามตรวจสอบ  
       $editArry = array(3 => '<span style="color:red">ส่งแก้ไข</span>' // พนักงานสายงาน
        , 2 => '<span style="color:red">ส่งแก้ไข</span>' // หัวหน้าสายงาน
        , 1 => '<span style="color:red">แก้ไขแล้ว</span>' // ธุระการ
        , 4 => '<span style="color:blue">แก้ไขแล้ว</span>'
        , 5 => '<span style="color:blue"></span>'
        , 6 => '<span style="color:blue"></span>'
    ); 
    $tor_status_id = $_REQUEST["tor_status_id"] ?? null; // status id
    $i_alarm = $_REQUEST["i_alarm"] ?? null; // status id
    $i_pa = $_REQUEST["i_pa"] ?? null; // status id

    // is_audit
    $step = (!empty($tor_status_id)) ? $tor_status_id : 0;
    $addConfDay1 = (!empty($i_alarm)) ? $i_alarm : 0;
    $addConfDay2 = (!empty($i_pa)) ? $i_pa : 0;
    $i_post1 = $_REQUEST['i_post1']??null;
    if ($act == "SEARCH") {
        $wh .= ($_REQUEST['tor_type_id'] != 0) ? " and a.tor_type_id =" . $_REQUEST['tor_type_id'] : "";
        $wh .= ($_REQUEST['c_code'] != "") ? " and a.c_code like '%" . $_REQUEST['c_code'] . "%'" : "";
        $wh .= ($_REQUEST['c_name'] != "") ? " and a.c_name like '%" . $_REQUEST['c_name'] . "%'" : "";
        if($_SESSION['i_level'] != 1  ){
            $wh .= ($_REQUEST['sp_emp_id'] != 0 ) ? " and a.sp_emp_id = " . $_REQUEST['sp_emp_id']  :" and a.dc_department_id =" . $_SESSION['dc_department_id'];
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
    if($_SESSION['i_level'] == 1 ){

    } else if($_SESSION['i_level'] == 2 && $_SESSION['dc_department_id'] == 5 ){
    
    } else if($_SESSION['i_level'] == 2 ){
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

    $step =11;     

    if ($tor_status_id == (13) && $is_audit == 'true') {
        $sqlTempTable .= " and a.i_type_bg in (1,5,6,7) and (a.tor_status_id =" . $step . ')' . $wh . $util->viewDepartment('a', 0, $type_menu); //
    } else {
        $sqlTempTable .= " and (a.tor_status_id = " . $step . ')' . $wh . $util->viewDepartment('a', 0, $type_menu); //
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

        , (select c_name from dbo.sp_emp where sp_emp_id=s.sp_emp_id) as ap_sp_emp_name 
        
        , (select i_type from sp_type_bg where i_value =  i_type_bg ) as sp_type_bg 
        , (select top 1 i_enabled from sp_tor_delete where s.tor_id = sp_tor_id and i_enabled = 1 ) as sp_tor_delete
        , (select top 1 c_comment from sp_tor_delete where s.tor_id = sp_tor_id and i_enabled = 1 ) as tor_delete_comment
        , (select top 1 i_edit from sp_tor_bg_log where s.tor_id = sp_tor_id  ORDER BY d_create  desc ) as sp_bg_edit
        , isnull((select top 1 sp_cate_id from NMU_ERP.dbo.[view_sp_tor_work_socore] where sp_tor_id=a.tor_id order by sp_cate_id desc),0) as sp_cate_id 
        "
            
  . " ,ap.sp_approval_hdr_id"
  . " ,(select top 1 sp_approval_signatures_id from dbo.sp_approval_signatures where sp_approval_hdr_id = ap.sp_approval_hdr_id) as sp_approval_signatures_id"
  . " ,isnull(ap.sp_approval_hdr_id, ap.sigature_step_doc) as c_status"
  . " ,isnull(ap.sp_approval_hdr_id, ap.sigature_step_doc) as c_sign_status"
  . " ,isnull(ap.sp_approval_hdr_id, ap.sigature_step_doc) as c_approve_status" 
 . " ,isnull(ap.review_status,null) as review_status" 
 . " ,(select top 1 name from dbo.sp_status_document where value=ap.approved_document_val) as step_document "
 . " ,(select top 1 name from dbo.sp_signin_document where value=ap.sigature_step_val) as step_sign "
 . " ,(select top 1 name from dbo.sp_approve_document where value=ap.approved_document_val) as status_approve "
 . " , (select top 1 c_name from NMU_DATACENTER.dbo.dc_emp where dc_emp_id=ap.response_by) as approve_by " 
            
            . " from ({$sqlTempTable}) a "
            . " inner join dbo.sp_tor s on s.tor_id=a.tor_id"
            . " left join dbo.sp_approval_hdr ap on ap.sp_tor_id = s.tor_id" 
            . " left join dbo.sp_tor_contract ss on ss.sp_tor_id = s.tor_id "
            . " WHERE a.row > ? and a.row <= ?";
//    echo $db->debugSql($sqlMain, $arrParam); exit;
//  select * from NMU_ERP..sp_signin_document --ผู้ดำ เนินการ approve_by
//select * from NMU_ERP..sp_status_document  -- เอกสาร ดำเนินการ  sigature_step_val
//select * from NMU_ERP..sp_approve_document  -- สถานะดำเนินการ approved_document_val          
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    $i_purchase = array(0 => '', 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
    $sp_contract_year = ($_REQUEST['tor_status_id'] == 20 ) ? $db->GetDataBySQL("SELECT a.i_year_be FROM dbo.sp_contract_year a WHERE  a.i_enabled = ? ", array($_REQUEST["i_enabled"])): "";
    while ($row = $db->Fetch($stmt)) {
        $i_type_bg = null;
        $i_type_bgTxt = null;
        $i_edit = null;
        $sp  = null ;
        if ($row["sp_tor_delete"] == 1 ) {
            $sp  = "<b style='color:#F43217'>" . $row["c_name"] . "</b>"  ;
        } 
        switch (intval($row["i_type_bg"])) {
            case 0: $i_type_bg = "color:#F43217";
                $i_type_bgTxt = '';
                break;
            case 1: $i_type_bg = "color:black";
                $i_type_bgTxt = 'PR ปกติ';
                break;
            case 2: $i_type_bg = "color:#116CEF";
                $i_type_bgTxt = 'PR หลักโครงการต่อเนื่อง(ไม่จองเงิน)';
                break;
            case 3: $i_type_bg = "color:#b085f5";
                $i_type_bgTxt = 'PR ย่อยโครงการต่อเนื่อง(จองเงิน)';
                break;
            case 4: $i_type_bg = "color:#CD8114";
                $i_type_bgTxt = 'PR ไม่จองเงิน (ใช้เงินกันเหลื่อม)';
                break;
            case 5: $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'PR จองเงินข้ามส่งเบิก';
                break;
            case 6: $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'PR จองเงินทำถึงสัญญา';
                break;
            case 7: $i_type_bg = "color:#52CD14";
                $i_type_bgTxt = 'PR จองเงินทำถึงตรวจรับ';
                break;
            case 8: $i_type_bg = "color:#AE00FF";
                $i_type_bgTxt = 'PR จองเงินตรวจรับ';
                break;
            case 11: $i_type_bg = "color:#B8860B";
                $i_type_bgTxt = 'PR ไม่จองเงินทำถึงตรวจรับ';
                break;
            case 12: $i_type_bg = "color:#000080";
                $i_type_bgTxt = 'PR ก่อนปีงบประมาณ';
                break;
            default :$i_type_bg = "color:#F43217";
                $i_type_bgTxt = '';
                break;
        }
        if($row["sp_bg_edit"] == 1  ){
            $i_type_bg = "color:#F5B041";
            $i_type_bgTxt = 'PR อยู่ระหว่างแก้ไขงบประมาณ';            
        }else if ($row["sp_bg_edit"] ==2 ){
            $i_type_bg = "color:#006400";
            $i_type_bgTxt = 'รับเรื่องคืนจากฝ่ายจัดสรร';            
        } 
        $c_codeStatus = "<b style='{$i_type_bg}'>" . $row["c_code"] . "</b>" . ($row["tor_status_id"] > 0 ? "<image id='img-" . $row['tor_id'] . "' src='../images/icons/database_start.png'/>" : "");
        $i_type_bgTxt = "<b style='{$i_type_bg}'>" . $i_type_bgTxt . "</b>" ; 
        $temp = array(
            "no" => $i++,
            "id" => intval($row["tor_id"]),
            "sp_approval_hdr_id" => intval($row["sp_approval_hdr_id"]),
        
            "sp_approval_signatures_id" => intval($row["sp_approval_signatures_id"]),
            "sp_cate_id" => intval($row["sp_cate_id"]),
            "sp_type_bg" => intval($row["sp_type_bg"]),
//            review_status i_doc_document c_doc_document i_signin_document c_signin_document i_approve_document c_approve_document
            "ap_sp_emp_name" => $row["ap_sp_emp_name"], 
            "review_status" => $row["review_status"], 
            "c_status" => $row["c_status"], 
//            step_document  step_sign status_approve approve_by
            "step_document" => $row["step_document"], 
            "step_sign" => $row["step_sign"], 
            "status_approve" => $row["status_approve"], 
            "approve_by" => $row["approve_by"], 
              
            "i_doc_document" => intval($row["i_doc_document"]), 
            "c_doc_document" => $row["c_doc_document"], 
            
            "i_signin_document" => intval($row["i_signin_document"]), 
            "c_signin_document" => $row["c_signin_document"], 
            
            "i_approve_document" => intval($row["i_approve_document"]), 
            "c_approve_document" => $row["c_approve_document"], 
            
            "sp_contract_year" => $sp_contract_year,
            "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
            "i_type_bg" => intval($row["i_type_bg"]),
            "i_type_bgTxt" => $i_type_bgTxt,
            "i_step" => intval($row["i_step"]),
            "sp_bg_edit" => intval($row["sp_bg_edit"]),
            "i_edit" => intval($row["i_edit"]),
            "c_nameStatus" => $sp ?? $row["c_name"] , //
            "sp_tor_delete" => $row["sp_tor_delete"] ,
            "i_amount_bg" => $row["i_amount_bg"] == null ?  1  : $row["i_amount_bg"]  ,
            "tor_delete_comment" => $row["tor_delete_comment"] ,
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
            "i_amount_bg" => $row["i_amount_bg"] == null ?  1  : $row["i_amount_bg"]  ,

        );
        ${$root}[] = $temp;
    } 
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
    exit();
}else if ($type == "APSTEPS20") {
//2	APSTEPS20	หัวหน้าสายงานซื้อจ้าง ลงนามตรวจสอบ    
}else if ($type == "APSTEPS30") {
//3	APSTEPS30	หัวหน้าพัสดุ ลงนามตรวจสอบ    
}else if ($type == "APSTEPS40") {
//4	APSTEPS40	รองคณะบดี ลงนามตรวจสอบ   
}else if ($type == "APSTEPS50") {
// 5	APSTEPS50	คณะบดีลงนามอนุมัติเอกสาร   
    
}
else if($type == "TORSTEP02"){}