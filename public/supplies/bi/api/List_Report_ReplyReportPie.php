<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();

function List_QueryParam()
{
    global $db, $date;
    //    case "LIST_BG":
    // ###########################################
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

    function get($a)
    {
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
    $act = $_REQUEST["type"] ?? null;
    $tor_type_show = $_REQUEST['tor_type_show'] ?? null;
    $i_post = $_REQUEST['i_post'] ?? null;

    $tor_status_id = $_REQUEST["tor_status_id"] ?? null; // status id
    $i_alarm = $_REQUEST["i_alarm"] ?? null; // status id
    $i_pa = $_REQUEST["i_pa"] ?? null; // status id


    $step = (!empty($tor_status_id)) ? $tor_status_id : 0;
    $addConfDay1 = (!empty($i_alarm)) ? $i_alarm : 0;
    $addConfDay2 = (!empty($i_pa)) ? $i_pa : 0;

    if ($_REQUEST["type"] == "SEARCH") {
        if (@$_REQUEST["value"] != "") {

            if ($_REQUEST["filter"] == "c_code") {
                $wh    .= " AND a.c_code LIKE '%" . $_REQUEST["value"] . "%' ";
            } else if ($_REQUEST["filter"] == "c_code") {
                $wh    .= " AND a.d_doc_ref  LIKE '%" . $_REQUEST["value"] . "%' ";
            } else if ($_REQUEST["filter"] == "dc_creditor_tax_numbe") {
                $wh    .= " AND  (select top 1 c_tax_number_imp from " . DB_NMU . "dc_creditor where dc_creditor_id = (select top 1 dc_creditor_id from sp_tor_contract where sp_tor_id = a.tor_id ) )  LIKE '%" . $_REQUEST["value"] . "%' ";
            } else if ($_REQUEST["filter"] == "dc_creditor_name") {
                $wh    .= " AND (select top 1 c_name from " . DB_NMU . "dc_creditor where dc_creditor_id = (select top 1 dc_creditor_id from sp_tor_contract where sp_tor_id = a.tor_id ) )  LIKE '%" . $_REQUEST["value"] . "%' ";
            } else if ($_REQUEST["filter"] == "c_code_contract") {
                $wh    .= " AND EXISTS (SELECT 1 FROM sp_tor_contract b WHERE b.sp_tor_id = a.tor_id AND b.c_code LIKE '%" . $_REQUEST["value"] . "%') ";
            } else if ($_REQUEST["filter"] == "c_name") {
                $wh    .= " AND a.c_name LIKE '%" . $_REQUEST["value"] . "%' ";
            } else if ($_REQUEST["filter"] == "c_doc_ref") {
                $wh    .= " AND a.d_doc_ref LIKE '%" . $_REQUEST["value"] . "%' ";
            } else if ($_REQUEST["filter"] == "d_code_chk") {
                $wh    .= " AND EXISTS (SELECT 1 FROM sp_tor_contract b WHERE b.sp_tor_id = a.tor_id AND b.sp_tor_contract_id  =
                    (select sp_tor_contract_id from sp_check_period_hdr bb where bb.c_code 
                    LIKE '%" . $_REQUEST["value"] . "%') ) ";
            } else if ($_REQUEST["filter"] == "d_code") {
                $wh    .= " AND EXISTS (SELECT 1 FROM sp_tor_contract b WHERE b.sp_tor_id = a.tor_id AND b.sp_tor_contract_id IN  (select sp_tor_contract_id from sp_check_period_hdr where  sp_check_period_hdr_id IN 
                    (select  bb.chk_id  from NMU_EIS..po_working_hdr aa
                    INNER JOIN NMU_EIS..po_working_begin_hdr bb on aa.po_working_hdr_id = bb.po_working_hdr_id                     
                     where aa.c_code_ref 
                    LIKE '%" . $_REQUEST["value"] . "%' AND aa.i_enable = 1 
                     AND bb.i_enable = 1    ) ) ) ";
            }
        }
        if (@$_REQUEST["i_budget_yearEn"] > 0) {
            $wh .= " AND a.i_pr_year = " . $_REQUEST["i_budget_yearEn"];
        }
        if (@$_REQUEST["dc_cost_id"] > 0) {
            $wh .= " AND a.dc_cost2_id = " . $_REQUEST["dc_cost_id"];
        }
        if (@$_REQUEST["dc_sub_cost_id"] > 0) {
            $wh .= " AND a.dc_sub_cost_id = " . $_REQUEST["dc_sub_cost_id"];
        }
        if (@$_REQUEST["i_budget_year_overlap"] > 0) {
            $wh .= " AND a.i_yyyy = " . $_REQUEST["i_budget_year_overlap"];
        }
        if (@$_REQUEST["i_budget_year_overlap"] > 0) {
            $wh .= " AND a.i_yyyy = " . $_REQUEST["i_budget_year_overlap"];
        }

        // Multi-select for Source of Funds
        if (!empty($_REQUEST["dc_expense_budget_type_id"])) {
            $val = $_REQUEST["dc_expense_budget_type_id"];
            if (is_array($val)) {
                $ids = implode(",", array_map('intval', $val));
                $wh .= " AND a.dc_expense_budget_type_id IN ($ids) ";
            } elseif (strpos($val, ',') !== false) {
                $wh .= " AND a.dc_expense_budget_type_id IN ($val) ";
            } elseif ($val > 0) {
                $wh .= " AND a.dc_expense_budget_type_id = " . intval($val);
            }
        }

        // Multi-select for Expense Category
        if (!empty($_REQUEST["po_expense_id"])) {
            $val = $_REQUEST["po_expense_id"];
            if (is_array($val)) {
                $ids = implode(",", array_map('intval', $val));
                $wh .= " AND a.po_expense_id IN ($ids) ";
            } elseif (strpos($val, ',') !== false) {
                $wh .= " AND a.po_expense_id IN ($val) ";
            } elseif ($val > 0) {
                $wh .= " AND a.po_expense_id = " . intval($val);
            }
        }

        if (@$_REQUEST["i_enabled"] > 0) {
            $wh .= " AND a.i_enabled = " . $_REQUEST["i_enabled"];
        }
        if (@$_REQUEST["sp_emp_id"] > 0) {
            $wh .= " AND a.sp_emp_id =  " . $_REQUEST["sp_emp_id"];
        }
        if (@$_REQUEST["tor_type_id"] > 0) {
            $wh .= " AND a.tor_type_id =  " . $_REQUEST["tor_type_id"];
        }
        if (@$_REQUEST["i_type_contract"] > 0) {
            $wh .= " AND  a.i_type_contract  = " . $_REQUEST["i_type_contract"];
        }
        if (@$_REQUEST["sp_tor_status_id"] > 0) {
            $wh .= " AND    a.tor_status_id  = " . $_REQUEST["sp_tor_status_id"];
        }
        if (@$_REQUEST["f_total_amtPr"] > 0) {
            $wh .= " AND  a.f_total_amt  = " . str_replace(",", "", $_REQUEST["f_total_amtPr"]);;
        }
        if (@$_REQUEST["f_total_amtPo"] > 0) {
            $wh .= " AND EXISTS (SELECT 1 FROM sp_tor_contract b WHERE b.sp_tor_id = a.tor_id AND b.f_total_amt  = " . str_replace(",", "", $_REQUEST["f_total_amtPo"]) . ")";
        }
    }
    if (@$_REQUEST['i_show'] == 1) {
        $wh .= "  and   a.d_egp_date  is null  and a.sp_emp_id is not null and a.dc_department_id is not null  and a.i_type_bg in (1,2,4)  "; //and a.tor_status_id = 21
    } else if (@$_REQUEST['i_show'] == 2) {
        $wh .= " ";
    } else if (!in_array($_SESSION['dc_cost_id'], [38, 3])) {
        $wh .= " AND a.dc_cost2_id = " . $_SESSION['dc_cost_id'];
    } else if (@$_REQUEST['i_show'] == 0 &&  !in_array(@$_SESSION['dc_cost_id'], [38, 3])) {
        $wh .= " AND a.dc_cost2_id = " . $_SESSION['dc_cost_id'];
    } else {
        $wh .= "  ";
        // if ( $_SESSION['i_level'] == 1 ) {
        // } else if ( $_SESSION['i_level'] == 2 ){
        //     $wh .= " and a.dc_department_id  = " . $_SESSION['dc_department_id'];
        // } else {
        //     $wh .= " and a.sp_emp_id  = " . $_SESSION['sp_emp_id'];
        // }
    }
    $arrParam = array();
    $arrCountParam = array();
    $sqlTempTable = "SELECT a.tor_id
                                , a.po_expense_id
                                , a.po_creditor_id
                                , a.dc_expense_budget_type_id
                                , a.dc_expense_budget_type2_id
                                , a.dc_expense_budget_type3_id
                                , a.bg_budget_dtl_project_id
                                , ISNULL(a.dc_department_id,0) AS dc_department_id
                                , a.dc_cost_id
                                , a.dc_cost2_id
                                , a.i_is_rename
                                , a.index_receive
                                , a.txtsub_cost
                                , a.tor_type_id 
                                , a.i_is_more
                                , ISNULL(a.i_purchase,1) AS i_purchase
                                , ISNULL(a.i_product_type,1) AS i_product_type
                                , ISNULL(a.i_hire_type,0) AS i_hire_type
                                , ISNULL(a.i_is_inv ,0) AS i_is_inv
                                , ISNULL(a.i_type_fix_rate ,0) AS i_type_fix_rate
                                , ISNULL(a.i_delivery_date,0) AS i_delivery_date
                                , a.i_step
                                , a.sp_emp_id
                                , a.i_forword
                                , a.i_backword
                                , a.tor_status_id
                                , a.i_type_bg
                                , a.i_enabled
                                , ROW_NUMBER() OVER (ORDER BY a.d_update DESC , a.i_edit DESC, a.tor_id DESC) AS row
                            FROM dbo.sp_tor a 
                            -- LEFT JOIN dbo.sp_tor_contract b ON a.tor_id = b.sp_tor_id
                            -- LEFT JOIN  vw_sp_tor_period_po_working b on  ss.sp_tor_contract_id  = b.sp_tor_contract_id and isnull(b.i_is_last,0) = 1 and b.i_sys = 3 
                            WHERE  
                            a.i_enabled = 1 and a.i_is_notor<>1  " . $wh;
    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlMain = "SET NOCOUNT ON 
           SELECT *
                into #temp
                    FROM (SELECT
                            aa.stats_period_int  ,
                            aa.sp_tor_contract_id, 
                            aa.stats_period , 
                            aa.stats_con ,
                            ROW_NUMBER() OVER (PARTITION BY aa.sp_tor_hdr_period_id ORDER BY aa.sp_tor_contract_id ASC) AS rn
                        FROM EIS_PROCURE.dbo.vw_sp_tor_period_po_working aa
                        where  isnull(i_is_last,0) = 1 and i_sys = 1
                            ) t
                        WHERE rn = 1;

                    SELECT a.* , s.c_code
                            , s.c_budget_dtl_project
                            , s.c_name
                            , s.c_department
                            , s.d_doc_ref
                            , s.tag
                            , (SELECT TOP 1 c_name FROM dbo.sp_department  WHERE dc_department_id=s.dc_department_id)  AS dc_department_name
                            , (SELECT TOP 1 c_name FROM dbo.sp_emp  WHERE sp_emp_id=s.sp_emp_id)  AS c_emp_name
                            , s.tor_status_id
                            , (SELECT TOP 1 c_code FROM dbo.sp_status_hdr WHERE sp_status_hdr_id=s.tor_status_id)  AS c_code_status
                            , (SELECT TOP 1 c_name FROM dbo.sp_status_hdr WHERE sp_status_hdr_id=s.tor_status_id)  AS c_name_status
                            , (SELECT TOP 1 c_name FROM dbo.sp_type_status WHERE sp_type_status_id=s.tor_type_id)  AS c_type_name
                            , isnull((select top 1 sp_tor_contract_id  from sp_tor_contract  where sp_tor_id = a.tor_id),0) as sp_contract_id 
                            , ISNULL(s.i_purchase,1) AS i_purchase
                            , ISNULL(s.tor_type_id,1) AS tor_type_id
                            , s.f_period_amt
                            , s.f_total_amt
                            , s.f_type_amt
                            , s.f_type2_amt
                            , s.f_type3_amt
                            , ISNULL(s.i_parent,0) AS i_parent
                            , ISNULL(s.i_is_parent,0) AS i_is_parent
                            , s.start_date
                            , s.end_date
                            , s.i_edit
                            , s.i_type_bg
                            , s.i_is_upload
                            , s.upload
                            , s.c_comment
                            , s.c_remake
                            , s.project_code
                            , s.i_yyyy
                            , s.i_type_bg
                            , s.i_type_bg
                            , s.i_pr_type1
                            , s.i_pr_type2
                            , s.i_amount_bg
                            , s.i_pr_type3
                            , s.i_type_contract
                            , isnull(s.bg_reserve_money1_id,0) as bg_reserve_money1_id
                            , isnull(s.bg_reserve_money2_id,0) as bg_reserve_money2_id
                            , isnull(s.bg_reserve_money3_id,0) as bg_reserve_money3_id
                            ,s.c_name_egp
                            ,s.f_total_average
                            , s.sp_type_id
                            , CONVERT(VARCHAR, s.d_doc_date, 120) AS d_doc_date
                            , CONVERT(VARCHAR, s.d_egp_date, 120) AS d_egp_date
                            , CONVERT(VARCHAR, s.d_tor_date, 120) AS d_tor_date
                            , s.po_creditor_id
                            -- , CONVERT(VARCHAR, ss.d_doc_date, 120) AS d_doc_content
                            -- , CONVERT(VARCHAR, ss.d_due_date, 120) AS d_due_content

                            , (select top 1 CONVERT(VARCHAR, d_doc_date, 120) as d_doc_content from sp_tor_contract where sp_tor_id = a.tor_id )  as d_doc_content
                            , (select top 1 CONVERT(VARCHAR, d_due_date, 120)  as d_due_content from sp_tor_contract where sp_tor_id = a.tor_id )  as d_due_content
                            , (select top 1 CONVERT(VARCHAR, d_start_date, 120) as d_start_content from sp_tor_contract where sp_tor_id = a.tor_id )  as d_start_content
                            , (select top 1 isnull(c_code,0) as code from sp_tor_contract where sp_tor_id = a.tor_id )  as code
                            , (select top 1 isnull(f_total_amt,0) as code from sp_tor_contract where sp_tor_id = a.tor_id )  as f_total_contract
                            , ss.f_total_amt as f_total_contract   
                            , s.dc_sub_cost_id
                            , (select c_name_th  from " . DB_CENTER . "dc_sub_cost where dc_sub_cost_id =   s.dc_sub_cost_id ) as dc_sub_cost
                            , (select top 1 stats_period_int from  #temp  aaa where aaa.sp_tor_contract_id  =  (select top 1 sp_tor_contract_id from sp_tor_contract where sp_tor_id = a. tor_id )) as stats_period_int 
                            , (select top 1 stats_period from  #temp  aaa where  aaa.sp_tor_contract_id  = (select top 1 sp_tor_contract_id from sp_tor_contract where sp_tor_id = a. tor_id )) as stats_period 
                            , isnull((select top 1  stats_con from  #temp  aaa where  aaa.sp_tor_contract_id  = (select top 1 sp_tor_contract_id from sp_tor_contract where sp_tor_id = a. tor_id )),'กำลังดำเนินการ') as stats_con 
                            , (select top 1 c_name  from " . DB_CENTER . "dc_expense_budget_type   where dc_expense_budget_type_id = s.dc_expense_budget_type_id) as dc_expense_budget_type
                            , (select top 1 c_name from " . DB_NMU_EIS . "bg_expense where bg_expense_id = s.po_expense_id ) as po_expense
                            , (select top 1 c_name from " . DB_NMU . "dc_creditor where dc_creditor_id =
                            (select top 1 isnull(dc_creditor_id,0) as dc_creditor_id from sp_tor_contract where sp_tor_id = a.tor_id ) 
                            ) as dc_creditor_name
                            , (select top 1 c_tax_number_imp from " . DB_NMU . "dc_creditor where dc_creditor_id = 
                            (select top 1 isnull(dc_creditor_id,0) as dc_creditor_id from sp_tor_contract where sp_tor_id = a.tor_id ) ) as c_tax_number_imp
                            , s.dc_user_create_cost_id as dc_create_cost_id
                            , (select top 1 i_enabled from sp_tor_delete where s.tor_id = sp_tor_id and i_enabled = 1 ) as sp_tor_delete
                            , (SELECT TOP 1 c_name FROM dbo.po_creditor WHERE po_creditor_id=s.po_creditor_id)  AS po_creditor_idTxt
                            , (SELECT TOP 1 c_name FROM NMU_DATACENTER.dbo.dc_cost WHERE dc_cost_id=a.dc_cost_id)  AS dc_cost_idTxt
                            , (SELECT TOP 1 c_name FROM NMU_DATACENTER.dbo.dc_cost WHERE dc_cost_id=a.dc_cost2_id)  AS dc_cost2_idTxt
                            , (SELECT TOP 1 c_full_name FROM dbo.dc_user WHERE dc_user_id=s.dc_user_create_id) AS c_create_name
                            , (SELECT TOP 1 c_name FROM NMU_DATACENTER.dbo.dc_cost WHERE dc_cost_id=s.dc_user_create_cost_id) AS c_cost_creat_name
                            , CONVERT(VARCHAR, s.d_create, 120) AS d_create
                            , (SELECT TOP 1 c_full_name FROM dbo.dc_user WHERE dc_user_id=s.dc_user_update_id) AS c_update_name
                            , (SELECT TOP 1 c_name FROM NMU_DATACENTER.dbo.dc_cost WHERE dc_cost_id=s.dc_user_update_cost_id) AS c_cost_update_name
                            , CONVERT(VARCHAR, s.d_update, 120) AS d_update 
                            , (Select c_name from  " . DB_NMU_ERP . "sp_type_event ac where ac.sp_type_event_id =  
                                    (SELECT TOP 1 event_type from  " . DB_NMU_ERP . "sp_tor_event where sp_tor_id = s.tor_id 
                                    ORDER BY d_create desc )) as event_type 
                            , (SELECT TOP 1 event_detail from  " . DB_NMU_ERP . "sp_tor_event where sp_tor_id = s.tor_id ORDER BY d_create desc ) as sp_event_detail 
                            "
        . " FROM ({$sqlTempTable}) a "
        . " INNER JOIN dbo.sp_tor s ON s.tor_id=a.tor_id"
        . " LEFT JOIN dbo.sp_tor_contract ss ON s.tor_id= ss.sp_tor_id"
        // . " LEFT JOIN  vw_sp_tor_period_po_working b on  ss.sp_tor_contract_id  = b.sp_tor_contract_id and isnull(b.i_is_last,0) = 1 and b.i_sys = 3 "
        . " WHERE a.row > ? AND a.row <= ?";
    if (@$_REQUEST["show_sql"]) {
        /******echo sql******/
        $sql = (@$sqlMain) ? $sqlMain : $sql;
        $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());

        $sql = str_replace('?', '#-#', $sql);
        foreach ($arr as $fld => $value) {
            $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
        }
        echo $sql;
        exit;
        /********************/
    }
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    $i_purchase = array(0 => '', 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
    $editArry = array(
        3 => '<span style="color:red"></span>' // พนักงานสายงาน
        ,
        2 => '<span style="color:red">ต้องแก้ไข</span>' // หัวหน้าสายงาน
        ,
        1 => '<span style="color:red">แก้ไขแล้ว</span>' // ธุระการ
        ,
        4 => '<span style="color:blue">แก้ไขแล้ว</span>',
        5 => '<span style="color:blue"></span>',
        6 => '<span style="color:blue"></span>'
    );

    while ($row = $db->Fetch($stmt)) {
        /* การจัดทำ PR ปกติ
                  การจัดทำ PR หลักโครงการต่อเนื่อง(ไม่จองเงิน)
                  การจัดทำ PR ย่อยโครงการต่อเนื่อง(จองเงิน)
                  การจัดทำ PR ไม่จองเงิน (ใช้เงินกันเหลื่อม)
                  การจัดทำ PR จองเงินข้ามส่งเบิก
                  การจัดทำ PR จองเงิsนทำถึงสัญญา
                  การจัดทำ PR จองเงินทำถึงตรวจรับ */
        $txtEdit = ($row['i_edit'] == (1 || 4 || 5 || 6)) ? $editArry[$row['i_edit']] : '';
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
            case 12:
                $i_type_bg = "color:#FF1493";
                $i_type_bgTxt = 'การจัดทำ PR ก่อนปีงบประมาณ';
                break;
            default:
                $i_type_bg = "color:#F43217";
                $i_type_bgTxt = '';
                break;
        }
        $c_codeStatus = "<b style='{$i_type_bg}'>" . $row["c_code"] . "</b>" . ($row["tor_status_id"] > 0 ? "<image id='img-" . $row['tor_id'] . "' src='../images/icons/database_start.png'/>" : "");
        // pure
        $temp = array(
            "no"                            => $i++,
            "id"                            => intval($row["tor_id"]),
            "i_amount_bg"                   => intval($row["i_amount_bg"]),
            "sp_tor_delete"                 => $sp,
            "sp_contract_id"                => $row["sp_contract_id"],
            "stats_con"                     => $row["stats_con"],
            "code"                          => $row["code"],
            "c_name_egp"                    => $row["c_name_egp"],
            "project_code"                  => $row["project_code"],
            "f_total_average"               => number_format($row["f_total_average"], 2),
            "dc_creditor_name"              => $row["dc_creditor_name"],
            "c_tax_number_imp"              => $row["c_tax_number_imp"],
            "i_purchase"                    => intval($row["i_purchase"]), //i_purchase	i_product_type	i_hire_type	i_is_inv i_delivery_date
            "i_product_type"                => intval($row["i_product_type"]),
            "dc_create_cost_id"             => intval($row["dc_create_cost_id"]),
            "i_hire_type"                   => intval($row["i_hire_type"]),
            "i_is_inv"                      => intval($row["i_is_inv"]),
            "i_pr_type1"                    => intval($row["i_pr_type1"]),
            "i_pr_type2"                    => intval($row["i_pr_type2"]),
            "i_pr_type3"                    => intval($row["i_pr_type3"]),
            "i_type_fix_rate"               => intval($row["i_type_fix_rate"]),
            "i_delivery_date"               => intval($row["i_delivery_date"]),
            "i_type_bg"                     => intval($row["i_type_bg"]),
            "bg_reserve_money1_id"          => intval($row["bg_reserve_money1_id"]),
            "bg_reserve_money2_id"          => intval($row["bg_reserve_money2_id"]),
            "bg_reserve_money3_id"          => intval($row["bg_reserve_money3_id"]),
            "i_type_bgTxt"                  => $i_type_bgTxt,
            "i_step"                        => intval($row["i_step"]),
            "index_receive"                 => $row["index_receive"],
            "i_is_upload"                   => intval($row["i_is_upload"]),
            "upload"                        => $row["upload"],
            "event_type"                    => $row["event_type"],
            "c_emp_name"                    => $row["c_emp_name"],
            "txtsub_cost"                   => $row["txtsub_cost"],
            "i_forword"                     => intval($row["i_forword"]),
            "i_backword"                    => intval($row["i_backword"]),
            "i_edit"                        => intval($row["i_edit"]),
            "i_type_bg"                     => intval($row["i_type_bg"]),
            "sp_type_id"                    => intval($row["sp_type_id"]),
            "c_code"                        => $row["c_code"],
            "c_codeStatus"                  => $c_codeStatus, //database_start.png
            "bg_budget_dtl_project_id"      => intval($row["bg_budget_dtl_project_id"]),
            "i_is_more"                     => intval($row["i_is_more"]),
            "f_total_amt"                   => number_format($row["f_total_amt"], 2),
            "f_total_contract"              => number_format($row["f_total_contract"], 2),
            "i_is_rename"                   => intval($row["i_is_rename"]),
            "c_budget_dtl_project"          => $row["c_budget_dtl_project"], //dc_department_name
            "txtdc_department_idID"         => $row["dc_department_name"], //
            "c_name"                        => $row["c_name"],
            "tor_status_id"                 => $row["tor_status_id"],
            "c_code_status"                 => $row["c_code_status"],
            "c_name_status"                 => $row["c_name_status"],
            "dc_cost_id"                    => intval($row["dc_cost_id"]),
            "dc_cost2_id"                   => intval($row["dc_cost2_id"]),
            "dc_sub_cost_id"                => intval($row["dc_sub_cost_id"]),
            "tag"                           => ($row["tag"]),
            "dc_cost_idTxt"                 => $row["dc_cost_idTxt"],
            "dc_cost2_idTxt"                => $row["dc_cost2_idTxt"] ?? '',
            "dc_sub_cost"                   => $row["dc_sub_cost"] ?? '',
            "dc_department_id"              => intval($row["dc_department_id"]),
            "c_department"                  => $row["c_department"],
            "i_parent"                      => $row["i_parent"],
            "i_is_parent"                   => $row["i_is_parent"],
            "d_doc_ref"                     => $row["d_doc_ref"],
            "i_yyyy"                        => $row["i_yyyy"],
            "c_year"                        => intval($row["i_yyyy"] + 543),
            "tor_type_id"                   => $row["tor_type_id"],
            "c_tor_type"                    => $row["c_type_name"], // $tor_type[$row["tor_type_id"]],
            "i_purchase"                    => intval($row["i_purchase"]),
            "c_purchase"                    => $i_purchase[$row["i_purchase"]],
            "dc_expense_budget_type"        => $row["dc_expense_budget_type"],
            "dc_expense_budget_type_id"     => intval($row["dc_expense_budget_type_id"]),
            "dc_expense_budget_type_id0"    => intval($row["dc_expense_budget_type_id"]),
            "dc_expense_budget_type_id1"    => intval($row["dc_expense_budget_type2_id"]),
            "dc_expense_budget_type_id2"    => intval($row["dc_expense_budget_type3_id"]),
            "f_type_amt"                    => number_format($row["f_type_amt"], 2),
            "f_type_amt0"                   => number_format($row["f_type_amt"], 2),
            "f_type_amt1"                   => number_format($row["f_type2_amt"], 2),
            "f_type_amt2"                   => number_format($row["f_type3_amt"], 2),
            "po_expense_id"                 => intval($row["po_expense_id"]),
            "po_expense"                    => $row["po_expense"],
            "dc_user_create_id"             => $row["c_create_name"],
            "i_type_contract"               => $row["i_type_contract"],
            "dc_user_create_cost_id"        => $row["c_cost_creat_name"],
            "d_tor_date"                    => ((empty($row["d_tor_date"])) ? "" : $date->extDateBuddha($row["d_tor_date"])), //d_tor_date
            "d_egp_date"                    => ((empty($row["d_egp_date"])) ? "" : $date->extDateBuddha($row["d_egp_date"])), //d_tor_date
            "d_doc_date"                    => ((empty($row["d_doc_date"])) ? "" : $date->extDateBuddha($row["d_doc_date"])), //d_tor_date
            "d_doc_content"                 => ((empty($row["d_doc_content"])) ? "" : $date->shot_date_from_db($row["d_doc_content"])), //d_tor_date
            "d_start_content"               => ((empty($row["d_start_content"])) ? "" : $date->shot_date_from_db($row["d_start_content"])), //d_tor_date
            "d_due_content"                 => ((empty($row["d_due_content"])) ? "" : $date->shot_date_from_db($row["d_due_content"])), //d_tor_date
            "d_create"                      => $date->extDateBuddha($row["d_create"]), //
            "dc_user_update_id"             => $row["c_update_name"],
            "dc_user_update_cost_id"        => $row["c_cost_update_name"],
            "d_update"                      => $date->extDateBuddha($row["d_update"]),
            "start_date"                    => $date->extDateBuddha($row["start_date"]),
            "end_date"                      => $date->extDateBuddha($row["end_date"]),
            "i_enabled"                     => intval($row["i_enabled"]),
            "c_comment"                     => $row["c_comment"],
            "c_remake"                      => $row["c_remake"],
            "sp_event_detail"               => $row["sp_event_detail"],
            "po_creditor_id"                => intval($row["po_creditor_id"]),
            "po_creditor_idTxt"             => $row["po_creditor_idTxt"],


        );
        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
    exit();
    // }
    // break;
}

function Update_ProjectCode()
{
    global $db;
    $tor_id = $_POST['tor_id'] ?? null;
    $project_code = $_POST['project_code'] ?? '';
    $dc_user_update_id = $_SESSION['user_id'];
    $dc_user_update_cost_id = $_SESSION['dc_cost_id'];

    if (empty($tor_id)) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'message' => 'Missing TOR ID']);
        exit;
    }

    $sql = "UPDATE dbo.sp_tor SET project_code = ?  , d_update = GETDATE(),dc_user_update_id = ?,dc_user_update_cost_id = ? WHERE tor_id = ?";
    $params = array($project_code, $dc_user_update_id, $dc_user_update_cost_id, $tor_id);

    // Assuming QueryParam handles execution for updates as well, or we can use generic method if needed.
    // Based on standard DB classes in this environment, QueryParam is likely correct for prepared statements.
    $check = $db->QueryParam($sql, $params);

    header('Content-Type: application/json; charset=utf-8');
    if ($check) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Database error']);
    }
    exit;
}

$fn = $_REQUEST['fn'] ?? 'List_QueryParam';
if ($fn === 'List_QueryParam') {
    List_QueryParam();
} else if ($fn === 'Update_ProjectCode') {
    Update_ProjectCode();
} else {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'message' => 'invalid fn']);
}
