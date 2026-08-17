<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

// config ปิด session แล้ว สามารถใช้ค่าที่อ่านมาได้
$userId = $_SESSION['user_id'] ?? null;

if (!$userId) {
    http_response_code(401);

    echo json_encode([
        'success' => false,
        'message' => 'Session expired',
    ]);

    exit;
} else {

    $info[1] = $_SESSION['user_id'];
    $info[2] = $_SESSION['dc_cost_id'];
    $info[3] = date('Y-m-d H:i:s'); // วันที่และเวลา ปัจจุบัน
}

$mode = $_REQUEST["mode"];
$dc_cost_id = isset($_SESSION["dc_cost_id"]) ? intval($_SESSION["dc_cost_id"]) : 0;

$table = "dbo.sp_tor";
$keyName = "tor_id";
$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;
$c_code_gen = "PR";
$re_id = null;
$stmt2 = true;
$stmt3 = true;
$stmt = null;
$sql = null;

$arrParam = array();
$addField = null;
$addValue = null;
$arrValue = array();

//End fn updateStaus
$db->BeginTran();
$d_tor_date = $data['d_tor_date'] ?? null;
$data['d_tor_date'] = !empty($d_tor_date) ? $date->bc_to_ad($data['d_tor_date']) : null;
$f_total_amt = !empty($data["f_total_amt"]) ? str_replace(',', '', $data["f_total_amt"]) : 0; //str_replace(',', '', $data[$value]);
$data['dc_cost_id'] = $data['dc_cost_id'] ?? 38;
$data["c_comment"] = $data["c_comment"] ?? NULL;

switch ($mode) {
    case "LIST":
        ###########################################
        $isExportExcel = isset($_REQUEST["export_excel"]) && intval($_REQUEST["export_excel"]) === 1;
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
        if ($isExportExcel) {
            $start = 0;
            $limit = 1000000;
        } else if (!get($limit)) {
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
            if ($_REQUEST["value"] != "") {

                if ($_REQUEST["filter"] == "c_code") {
                    $wh .= " AND a.c_code LIKE '%" . $_REQUEST["value"] . "%' ";
                } else if ($_REQUEST["filter"] == "c_code") {
                    $wh .= " AND a.d_doc_ref  LIKE '%" . $_REQUEST["value"] . "%' ";
                } else if ($_REQUEST["filter"] == "dc_creditor_tax_numbe") {
                    $wh .= " AND  (select top 1 c_tax_number_imp from " . DB_NMU . "dc_creditor where dc_creditor_id = (select top 1 dc_creditor_id from sp_tor_contract where sp_tor_id = a.tor_id ) )  LIKE '%" . $_REQUEST["value"] . "%' ";
                } else if ($_REQUEST["filter"] == "dc_creditor_name") {
                    $wh .= " AND (select top 1 c_name from " . DB_NMU . "dc_creditor where dc_creditor_id = (select top 1 dc_creditor_id from sp_tor_contract where sp_tor_id = a.tor_id ) )  LIKE '%" . $_REQUEST["value"] . "%' ";
                } else if ($_REQUEST["filter"] == "c_code_contract") {
                    $wh .= " AND b.c_code LIKE '%" . $_REQUEST["value"] . "%' ";
                } else if ($_REQUEST["filter"] == "c_name") {
                    $wh .= " AND a.c_name LIKE '%" . $_REQUEST["value"] . "%' ";
                } else if ($_REQUEST["filter"] == "c_doc_ref") {
                    $wh .= " AND a.d_doc_ref LIKE '%" . $_REQUEST["value"] . "%' ";
                } else if ($_REQUEST["filter"] == "d_code_chk") {
                    $wh .= " AND b.sp_tor_contract_id  =
                    (select sp_tor_contract_id from sp_check_period_hdr bb where bb.c_code
                    LIKE '%" . $_REQUEST["value"] . "%') ";
                } else if ($_REQUEST["filter"] == "d_code") {
                    $wh .= " AND b.sp_tor_contract_id IN  (select sp_tor_contract_id from sp_check_period_hdr where  sp_check_period_hdr_id IN
                    (select  bb.chk_id  from NMU_EIS..po_working_hdr aa
                    INNER JOIN NMU_EIS..po_working_begin_hdr bb on aa.po_working_hdr_id = bb.po_working_hdr_id
                     where aa.c_code_ref
                    LIKE '%" . $_REQUEST["value"] . "%' AND aa.i_enable = 1
                     AND bb.i_enable = 1    ) )  ";
                }
            }
            if ($_REQUEST["i_budget_year"] > 0) {
                $wh .= " AND a.i_pr_year = " . $_REQUEST["i_budget_year"];
            }
            if ($_REQUEST["dc_cost_id"] > 0) {
                $wh .= " AND a.dc_cost2_id = " . $_REQUEST["dc_cost_id"];
            }
            if ($_REQUEST["dc_sub_cost_id"] > 0) {
                $wh .= " AND a.dc_sub_cost_id = " . $_REQUEST["dc_sub_cost_id"];
            }
            if ($_REQUEST["i_budget_year_overlap"] > 0) {
                $wh .= " AND a.i_yyyy = " . $_REQUEST["i_budget_year_overlap"];
            }
            if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
                $wh .= " AND a.dc_expense_budget_type_id = " . $_REQUEST["dc_expense_budget_type_id"];
            }
            if ($_REQUEST["i_enabled"] > 0) {
                $wh .= " AND a.i_enabled = " . $_REQUEST["i_enabled"];
            }
            if ($_REQUEST["sp_emp_id"] > 0) {
                $wh .= " AND a.sp_emp_id =  " . $_REQUEST["sp_emp_id"];
            }
            if ($_REQUEST["tor_type_id"] > 0) {
                $wh .= " AND a.tor_type_id =  " . $_REQUEST["tor_type_id"];
            }
            if ($_REQUEST["i_type_contract"] > 0) {
                $wh .= " AND  a.i_type_contract  = " . $_REQUEST["i_type_contract"];
            }
            if ($_REQUEST["sp_tor_status_id"] > 0) {
                $wh .= " AND  a.tor_status_id  = " . $_REQUEST["sp_tor_status_id"];
            }
            if ($_REQUEST["f_total_amtPr"] > 0) {
                $wh .= " AND  a.f_total_amt  = " . str_replace(",", "", $_REQUEST["f_total_amtPr"]);
                ;
            }
            if ($_REQUEST["f_total_amtPo"] > 0) {
                $wh .= " AND  b.f_total_amt  = " . str_replace(",", "", $_REQUEST["f_total_amtPo"]);
                ;
            }
        }
        if (@$_REQUEST['i_show'] == 1) {
            $wh .= "  and   a.d_egp_date  is null  and a.sp_emp_id is not null and a.dc_department_id is not null  and a.i_type_bg in (1,2,4)  "; //and a.tor_status_id = 21
        } else if (@$_REQUEST['i_show'] == 2) {
            $wh .= " ";
        } else if (!in_array($_SESSION['dc_cost_id'], [0, 38, 3])) {
            $wh .= " AND a.dc_cost2_id = " . $_SESSION['dc_cost_id'];
        } else if (@$_REQUEST['i_show'] == 0 && !in_array($_REQUEST['dc_cost_id'], [0, 38, 3])) {
            $wh .= " AND a.dc_cost2_id = " . $_REQUEST['dc_cost_id'];
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
                            LEFT JOIN dbo.sp_tor_contract b ON a.tor_id = b.sp_tor_id
                            -- LEFT JOIN  vw_sp_tor_period_po_working b on  ss.sp_tor_contract_id  = b.sp_tor_contract_id and isnull(b.i_is_last,0) = 1 and b.i_sys = 3
                            WHERE isnull(a.i_type_bg,0) <> 3 and a.i_is_notor<>1  " . $wh;
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
                            , s.i_yyyy
                            , s.i_type_bg
                            , s.i_type_bg
                            , s.i_pr_type1
                            , s.i_pr_type2
                            , s.i_amount_bg
                            , s.i_pr_type3
                            , s.i_type_contract
                            ,s.bg_reserve_money1_id
                            ,s.bg_reserve_money2_id
                            ,s.bg_reserve_money3_id
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
                                                        -- , ss.f_total_amt as f_total_contract   stats_con

                            , s.dc_sub_cost_id
                            , (select c_name_th  from " . DB_CENTER . "dc_sub_cost where dc_sub_cost_id =   s.dc_sub_cost_id ) as dc_sub_cost
                            , (select top 1 stats_period_int from  #temp  aaa where aaa.sp_tor_contract_id  =  (select top 1 sp_tor_contract_id from sp_tor_contract where sp_tor_id = a. tor_id )) as stats_period_int
                            , (select top 1 stats_period from  #temp  aaa where  aaa.sp_tor_contract_id  = (select top 1 sp_tor_contract_id from sp_tor_contract where sp_tor_id = a. tor_id )) as stats_period
                            , isnull((select top 1  stats_con from  #temp  aaa where  aaa.sp_tor_contract_id  = (select top 1 sp_tor_contract_id from sp_tor_contract where sp_tor_id = a. tor_id )),'กำลังดำเนินการ') as stats_con

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
                // . " LEFT JOIN dbo.sp_tor_contract ss ON s.tor_id= ss.sp_tor_id"
                // . " LEFT JOIN  vw_sp_tor_period_po_working b on  ss.sp_tor_contract_id  = b.sp_tor_contract_id and isnull(b.i_is_last,0) = 1 and b.i_sys = 3 "
                . " WHERE a.row > ? AND a.row <= ?";
        if (@$_REQUEST["show_sql"]) {
            /*             * ****echo sql***** */
            $sql = (@$sqlMain) ? $sqlMain : $sql;
            $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());

            $sql = str_replace('?', '#-#', $sql);
            foreach ($arr as $fld => $value) {
                $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
            }
            echo $sql;
            exit;
            /*             * ***************** */
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

        $exportRows = array();
        while ($row = $db->Fetch($stmt)) {
            if ($isExportExcel) {
                $exportRows[] = $row;
                continue;
            }
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
                "no" => $i++,
                "id" => intval($row["tor_id"]),
                "i_amount_bg" => intval($row["i_amount_bg"]),
                "sp_tor_delete" => $sp,
                "sp_contract_id" => $row["sp_contract_id"],
                "stats_con" => $row["stats_con"],
                "code" => $row["code"],
                "c_name_egp" => $row["c_name_egp"],
                "f_total_average" => number_format($row["f_total_average"], 2),
                "dc_creditor_name" => $row["dc_creditor_name"],
                "c_tax_number_imp" => $row["c_tax_number_imp"],
                "i_purchase" => intval($row["i_purchase"]), //i_purchase	i_product_type	i_hire_type	i_is_inv i_delivery_date
                "i_product_type" => intval($row["i_product_type"]),
                "dc_create_cost_id" => intval($row["dc_create_cost_id"]),
                "i_hire_type" => intval($row["i_hire_type"]),
                "i_is_inv" => intval($row["i_is_inv"]),
                "i_pr_type1" => intval($row["i_pr_type1"]),
                "i_pr_type2" => intval($row["i_pr_type2"]),
                "i_pr_type3" => intval($row["i_pr_type3"]),
                "i_type_fix_rate" => intval($row["i_type_fix_rate"]),
                "i_delivery_date" => intval($row["i_delivery_date"]),
                "i_type_bg" => intval($row["i_type_bg"]),
                "bg_reserve_money1_id" => intval($row["bg_reserve_money1_id"]),
                "bg_reserve_money2_id" => intval($row["bg_reserve_money2_id"]),
                "bg_reserve_money3_id" => intval($row["bg_reserve_money3_id"]),
                "i_type_bgTxt" => $i_type_bgTxt,
                "i_step" => intval($row["i_step"]),
                "index_receive" => $row["index_receive"],
                "i_is_upload" => intval($row["i_is_upload"]),
                "upload" => $row["upload"],
                "event_type" => $row["event_type"],
                "c_emp_name" => $row["c_emp_name"],
                "txtsub_cost" => $row["txtsub_cost"],
                "i_forword" => intval($row["i_forword"]),
                "i_backword" => intval($row["i_backword"]),
                "i_edit" => intval($row["i_edit"]),
                "i_type_bg" => intval($row["i_type_bg"]),
                "sp_type_id" => intval($row["sp_type_id"]),
                "c_code" => $row["c_code"],
                "c_codeStatus" => $c_codeStatus, //database_start.png
                "bg_budget_dtl_project_id" => intval($row["bg_budget_dtl_project_id"]),
                "i_is_more" => intval($row["i_is_more"]),
                "f_total_amt" => number_format($row["f_total_amt"], 2),
                "f_total_contract" => number_format($row["f_total_contract"], 2),
                "i_is_rename" => intval($row["i_is_rename"]),
                "c_budget_dtl_project" => $row["c_budget_dtl_project"], //dc_department_name
                "txtdc_department_idID" => $row["dc_department_name"], //
                "c_name" => $row["c_name"],
                "tor_status_id" => $row["tor_status_id"],
                "c_code_status" => $row["c_code_status"],
                "c_name_status" => $row["c_name_status"],
                "tor_status_id" => $row["tor_status_id"],
                "dc_cost_id" => intval($row["dc_cost_id"]),
                "dc_cost2_id" => intval($row["dc_cost2_id"]),
                "dc_sub_cost_id" => intval($row["dc_sub_cost_id"]),
                "tag" => ($row["tag"]),
                "dc_cost_idTxt" => $row["dc_cost_idTxt"],
                "dc_cost2_idTxt" => $row["dc_cost2_idTxt"] ?? '',
                "dc_sub_cost" => $row["dc_sub_cost"] ?? '',
                "dc_department_id" => intval($row["dc_department_id"]),
                "c_department" => $row["c_department"],
                "i_parent" => $row["i_parent"],
                "i_is_parent" => $row["i_is_parent"],
                "d_doc_ref" => $row["d_doc_ref"],
                "i_yyyy" => $row["i_yyyy"],
                "c_year" => intval($row["i_yyyy"] + 543),
                "tor_type_id" => $row["tor_type_id"],
                "c_tor_type" => $row["c_type_name"], // $tor_type[$row["tor_type_id"]],
                "i_purchase" => intval($row["i_purchase"]),
                "c_purchase" => $i_purchase[$row["i_purchase"]],
                "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
                "dc_expense_budget_type_id0" => intval($row["dc_expense_budget_type_id"]),
                "dc_expense_budget_type_id1" => intval($row["dc_expense_budget_type2_id"]),
                "dc_expense_budget_type_id2" => intval($row["dc_expense_budget_type3_id"]),
                "f_type_amt" => number_format($row["f_type_amt"], 2),
                "f_type_amt0" => number_format($row["f_type_amt"], 2),
                "f_type_amt1" => number_format($row["f_type2_amt"], 2),
                "f_type_amt2" => number_format($row["f_type3_amt"], 2),
                "po_expense_id" => intval($row["po_expense_id"]),
                "dc_user_create_id" => $row["c_create_name"],
                "i_type_contract" => $row["i_type_contract"],
                "dc_user_create_cost_id" => $row["c_cost_creat_name"],
                "d_tor_date" => ((empty($row["d_tor_date"])) ? "" : $date->extDateBuddha($row["d_tor_date"])), //d_tor_date
                "d_egp_date" => ((empty($row["d_egp_date"])) ? "" : $date->extDateBuddha($row["d_egp_date"])), //d_tor_date
                "d_doc_date" => ((empty($row["d_doc_date"])) ? "" : $date->extDateBuddha($row["d_doc_date"])), //d_tor_date
                "d_doc_content" => ((empty($row["d_doc_content"])) ? "" : $date->shot_date_from_db($row["d_doc_content"])), //d_tor_date
                "d_start_content" => ((empty($row["d_start_content"])) ? "" : $date->shot_date_from_db($row["d_start_content"])), //d_tor_date
                "d_due_content" => ((empty($row["d_due_content"])) ? "" : $date->shot_date_from_db($row["d_due_content"])), //d_tor_date
                "d_create" => $date->extDateBuddha($row["d_create"]), //
                "dc_user_update_id" => $row["c_update_name"],
                "dc_user_update_cost_id" => $row["c_cost_update_name"],
                "d_update" => $date->extDateBuddha($row["d_update"]),
                "start_date" => $date->extDateBuddha($row["start_date"]),
                "end_date" => $date->extDateBuddha($row["end_date"]),
                "i_enabled" => intval($row["i_enabled"]),
                "c_comment" => $row["c_comment"],
                "c_remake" => $row["c_remake"],
                "sp_event_detail" => $row["sp_event_detail"],
                "po_creditor_id" => intval($row["po_creditor_id"]),
                "po_creditor_idTxt" => $row["po_creditor_idTxt"],
            );
            ${$root}[] = $temp;
        }

        if ($isExportExcel) {
            $excelColumns = array(
                'c_code' => 'เลขที่ PR',
                'd_doc_ref' => 'เลขที่อ้างอิง/เลขที่ พวช',
                'c_name' => 'ชื่อรายการ',
                'code' => 'เลขที่สัญญา',
                'dc_creditor_name' => 'ผู้ขาย/ผู้รับจ้าง',
                'c_tax_number_imp' => 'เลขประจำตัวผู้เสียภาษี',
                'f_total_amt' => 'จำนวนเงิน PR',
                'f_total_contract' => 'จำนวนเงินสัญญา',
                'dc_cost_idTxt' => 'ส่วนงาน',
                'dc_sub_cost' => 'หน่วยงานย่อย',
                'c_type_name' => 'ประเภท TOR',
                'c_name_status' => 'สถานะ',
                'd_tor_date' => 'วันที่ TOR',
                'd_doc_date' => 'วันที่เอกสาร',
                'd_create' => 'วันที่สร้าง'
            );
            $fileName = 'tor_checklist_' . date('Ymd_His') . '.xls';
            header('Content-Type: application/vnd.ms-excel; charset=UTF-8');
            header('Content-Disposition: attachment; filename="' . $fileName . '"');
            header('Cache-Control: max-age=0');
            echo "\xEF\xBB\xBF";
            echo '<html><head><meta charset="UTF-8"><style>'
                . 'table{border-collapse:collapse}th,td{border:1px solid #999;padding:4px;vertical-align:top}'
                . 'th{background:#d9ead3;font-weight:bold}.text{mso-number-format:"\\@"}.number{mso-number-format:"#,##0.00"}'
                . '</style></head><body><table><thead><tr><th>ลำดับ</th>';
            foreach ($excelColumns as $title) {
                echo '<th>' . htmlspecialchars($title, ENT_QUOTES, 'UTF-8') . '</th>';
            }
            echo '</tr></thead><tbody>';
            foreach ($exportRows as $index => $exportRow) {
                echo '<tr><td>' . ($index + 1) . '</td>';
                foreach ($excelColumns as $field => $title) {
                    $cellValue = isset($exportRow[$field]) ? $exportRow[$field] : '';
                    $cellClass = in_array($field, array('f_total_amt', 'f_total_contract')) ? 'number' : 'text';
                    echo '<td class="' . $cellClass . '">' . htmlspecialchars((string)$cellValue, ENT_QUOTES, 'UTF-8') . '</td>';
                }
                echo '</tr>';
            }
            echo '</tbody></table></body></html>';
            exit;
        }

        $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
        $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
        echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
        exit();
        // }
        break;
    case "sp_Per_dtl":
        $root = "data";
        $data = array();
        $arrParam = array($_REQUEST['id']);
        $sqlMain = "SELECT ROW_NUMBER() OVER(ORDER BY a.c_code,c.i_period  ASC) as row
                        , isnull(c.sp_tor_hdr_period_id,0) as sp_tor_hdr_period_id
                        ,(select c_code from sp_tor  where a.sp_tor_id = tor_id ) as pr_code
                        , isnull(c.i_period,0) as  i_period
                        ,CONVERT(varchar,d.d_arrive_date) as d_arrive_date
                        ,CONVERT(varchar,d.d_checking_date) as d_checking_date
                        ,CONVERT(varchar,h.d_create) as d_doc_billing
                        ,CONVERT(varchar,gg.d_create) as d_po_working_hdr
                        ,a.c_name
                        , ( select c_name from  sp_department where dc_department_id = (select  dc_department_id from sp_emp where sp_emp_id = a.sp_emp_id ) )  as dc_department
                        , case when d_arrive_date is  null then 'รอรับของ'
                        when d.c_code is null  and d.d_arrive_date is not null  then 'รอทำการตรวจรับ'
                        when d.c_code is not null and d.d_arrive_date is not null and gg.c_code_ref is null   then 'รอส่งเบิก'
                        when d.c_code is not null   and gg.c_code_ref is not null  then 'ส่งเบิกฝ่ายคลัง'
                        when isnull(gg.c_code_ref,'') != '' then 'ส่งเบิกฝ่ายคลัง'
                        else '' end as stats_period
                        ,a.c_code
                        , case when  i_is_last = 1 and gg.c_code_ref is not null then 'ปิดสัญญาแล้ว'
                        else 'กำลังดำเนินการ' end as stats_con
                        , aa.dc_expense_budget_type_id
                        , aa.po_expense_id
                        ,(select c_name from dc_expense_budget_type where dc_expense_budget_type_id = aa.dc_expense_budget_type_id)   as dc_expense_budget_type
                        ,(select c_name from NMU_EIS.dbo.bg_expense where bg_expense_id = aa.po_expense_id ) as bg_expense
                        , (select c_name from NMU.dbo.dc_creditor where dc_creditor_id = a.dc_creditor_id  ) as dc_creditor_name
                        , (select c_tax_number_imp from NMU.dbo.dc_creditor where dc_creditor_id = a.dc_creditor_id  ) as c_tax_number_imp
                        , isnull(a.f_total_amt,0) as f_total_amt
                        , isnull(a.f_type_amt,0) as f_type_amt
                        ,convert(varchar,a.d_doc_date,120) as  d_doc_date
                        ,convert(varchar,a.d_due_date,120) as d_due_date
                        ,(select c_name from sp_emp where sp_emp_id = a.sp_emp_id) as sp_emp
                        ,case when d.c_arrive_code is not null  then    isnull(c.f_total_amt,0) else null end as f_period
                        ,case when d.c_code is not null  then    e.f_net_total_price else null end as f_chk
                        ,d.c_arrive_code
                        , d.c_code as  c_code_chk
                        , h.c_code as  c_code_bl
                        , gg.c_code_ref as  c_code_d
                        , g.c_file_pdf_hdr
                        , g.c_file_pdf_dtl
                        , g.i_is_url_pdf_hdr
                        , g.i_is_url_pdf_dtl
                        , gg.po_working_hdr_id
                from dbo.sp_tor_contract a
                inner join dbo.sp_tor aa on a.sp_tor_id =aa.tor_id
                left join dbo.sp_tor_hdr_period c on a.sp_tor_contract_id = c.sp_tor_contract_id and isnull(c.i_enabled,1) =1
                left join dbo.sp_check_period_hdr d on c.sp_tor_hdr_period_id = d.sp_tor_hdr_period_id
                left join dbo.sp_check_period_dtl e on d.sp_check_period_hdr_id = e.sp_check_period_hdr_id
                left join dbo.sp_check_billing_items h on h.sp_check_period_hdr_id = d.sp_check_period_hdr_id
                left join (
                        SELECT
                                chk_id,
                                a.po_working_hdr_id,
                                a.d_create,
                                a.c_code_ref
                                from NMU_EIS..po_working_hdr a inner join NMU_EIS..po_working_begin_hdr b on a.po_working_hdr_id = b.po_working_hdr_id
                ) gg  on d.sp_check_period_hdr_id = gg.chk_id
                left join (
                        SELECT
                                    aa.po_working_hdr_id
                                    ,i_is_url_pdf_hdr
                                    ,i_is_url_pdf_dtl
                                    ,c_file_pdf_hdr
                                    ,c_url_pdf_hdr
                                    ,c_file_pdf_dtl
                                    ,c_url_pdf_dtl
                                    ,c_file_pdf_pay
                                    ,c_file_pdf_protest_hdr
                                    ,c_file_pdf_protest_dtl
                                    -- INTO #temp_s2
                                    FROM " . DB_NMU_EIS . "po_working_item aa
                                    INNER JOIN (
                                    SELECT
                                        po_working_hdr_id
                                        ,MAX(isnull(po_working_item_id,0)) AS po_working_item_id
                                        ,MAX(isnull(CONVERT(FLOAT,i_sub_status),0)) AS max_sub_status
                                    FROM  " . DB_NMU_EIS . "po_working_item
                                    WHERE i_enable = 1
                                    GROUP BY po_working_hdr_id ) bb ON aa.po_working_item_id = bb.po_working_item_id AND aa.po_working_hdr_id = bb.po_working_hdr_id AND bb.max_sub_status = i_sub_status
                    )
            g  on gg.po_working_hdr_id = g.po_working_hdr_id
            where a.i_enabled = 1
            and a.c_code is not null
            and a.sp_tor_id = ?
            order by a.c_code,c.i_period
            ";
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        if (@$_REQUEST["show_sql"]) {
            /*             * ****echo sql***** */
            $sql = (@$sqlMain) ? $sqlMain : $sql;
            $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());

            $sql = str_replace('?', '#-#', $sql);
            foreach ($arr as $fld => $value) {
                $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
            }
            echo $sql;
            exit;
            /*             * ***************** */
        }
        $i = @$start + 1;
        $total = 0;
        $total_sum = 0;
        while ($row = $db->Fetch($stmt)) {
            // $total = $row["i_qty"] * $row["f_unit_price"];  total
            $temp = array(
                "no" => $i++,
                "id" => intval($row["sp_tor_hdr_period_id"]),
                "row" => intval($row["row"]),
                "i_period" => intval($row["i_period"]),
                "i_is_url_pdf_hdr" => $row["i_is_url_pdf_hdr"],
                "i_is_url_pdf_dtl" => $row["i_is_url_pdf_dtl"],
                "pr_code" => $row["pr_code"],
                "c_name" => $row["c_name"],
                "c_file_pdf_hdr" => $row["c_file_pdf_hdr"],
                "c_file_pdf_dtl" => $row["c_file_pdf_dtl"],
                "d_doc_date" => ((empty($row["d_doc_date"])) ? "" : $date->extDateBuddha($row["d_doc_date"])),
                "d_due_date" => ((empty($row["d_due_date"])) ? "" : $date->extDateBuddha($row["d_due_date"])),
                "d_arrive_date" => ((empty($row["d_arrive_date"])) ? "" : $date->extDateBuddha($row["d_arrive_date"])),
                "d_checking_date" => ((empty($row["d_checking_date"])) ? "" : $date->extDateBuddha($row["d_checking_date"])),
                "d_doc_billing" => ((empty($row["d_doc_billing"])) ? "" : $date->extDateBuddha($row["d_doc_billing"])),
                "d_po_working_hdr" => ((empty($row["d_po_working_hdr"])) ? "" : $date->extDateBuddha($row["d_po_working_hdr"])),
                "dc_department" => $row["dc_department"],
                "stats_period" => $row["stats_period"],
                "c_code" => $row["c_code"],
                "stats_con" => $row["stats_con"],
                "dc_expense_budget_type" => $row["dc_expense_budget_type"],
                "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
                "bg_expense" => $row["bg_expense"],
                "po_expense_id" => intval($row["po_expense_id"]),
                "dc_creditor_name" => $row["dc_creditor_name"],
                "c_tax_number_imp" => $row["c_tax_number_imp"],
                "f_total_amt" => number_format($row["f_total_amt"], 2),
                "f_type_amt" => number_format($row["f_type_amt"], 2),
                "f_period" => number_format($row["f_period"], 2),
                "sp_emp" => $row["sp_emp"],
                "f_chk" => number_format($row["f_chk"], 2),
                "c_arrive_code" => $row["c_arrive_code"],
                "c_code_chk" => $row["c_code_chk"],
                "c_code_bl" => $row["c_code_bl"],
                "c_code_d" => $row["c_code_d"],
                "po_working_hdr_id" => $row["po_working_hdr_id"],
                    // "i_is_inv" => $row["i_is_inv"] == 1 ? true : false,
                    // "am_mode_id" => intval($row["am_mode_id"]),
                    // "sp_bg_mode_id" => intval($row["sp_bg_mode_id"]),
                    // "f_peroid_amt" => intval($row["f_peroid_amt"]),
                    // "f_total_amt" => number_format($total, 2),
                    // "i_qty" => intval($row["i_qty"]),
                    // "sp_tor_id" => intval($row["sp_tor_id"]),
                    // "po_expense_id" => intval($row["po_expense_id"]),
                    // "dc_expense_budget_type_id" => intval($row["dc_bg_budget_type_id"]),
                    // "bg_reserve_money_id" => intval($row["bg_reserve_money_id"])
            );
            ${$root}[] = $temp;
            $total_sum += $total;
        }

        echo json_encode(array("debug" => true, 'totalSum' => $total_sum, "totalCount" => $i, $root => ${$root}));
        exit();

        break;
    case "sp_tor_even":
        $root = "data";
        $data = array();
        $arrParam = array($_REQUEST['id']);
        $sqlMain = "SELECT ROW_NUMBER() OVER(ORDER BY a.sp_tor_event_id  DESC) as row
                        ,sp_tor_event_id
                        ,sp_tor_id
                        ,sp_tor_contract_id
                        ,sp_status_hdr_id
                        ,sp_status_hdr_name
                        ,importance_level
                        ,event_title
                        ,event_detail
                        , CONVERT(VARCHAR, event_date, 120) AS event_date
                        ,event_time_start
                        ,event_time_end
                        ,event_type as event_type_id
                        ,i_enabled
                        ,(Select c_name from NMU_ERP.dbo.sp_type_event where sp_type_event_id = event_type ) as event_type
                        ,(SELECT TOP 1 c_name FROM sp_status_hdr WHERE sp_status_hdr_id = a.sp_status_hdr_id) sp_status_hdr
                        ,(SELECT TOP 1 c_full_name FROM dbo.dc_user WHERE dc_user_id=a.dc_user_create_id) AS c_create_name
                        ,(SELECT TOP 1 c_name FROM NMU_DATACENTER.dbo.dc_cost WHERE dc_cost_id = a.dc_user_create_cost_id) AS c_cost_creat_name
                        ,CONVERT(VARCHAR, a.d_create, 120) AS d_create
                        ,(SELECT TOP 1 c_full_name FROM dbo.dc_user WHERE dc_user_id=a.dc_user_update_id) AS c_update_name
                        ,(SELECT TOP 1 c_name FROM NMU_DATACENTER.dbo.dc_cost WHERE dc_cost_id=a.dc_user_update_cost_id) AS c_cost_update_name
                        ,CONVERT(VARCHAR, a.d_update, 120) AS d_update
                from dbo.sp_tor_event a
            where a.i_enabled = 1
            and a.sp_tor_id = ?
            order by a.sp_tor_event_id DESC
            ";
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        if (@$_REQUEST["show_sql"]) {
            /*             * ****echo sql***** */
            $sql = (@$sqlMain) ? $sqlMain : $sql;
            $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());

            $sql = str_replace('?', '#-#', $sql);
            foreach ($arr as $fld => $value) {
                $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
            }
            echo $sql;
            exit;
            /*             * ***************** */
        }
        $i = @$start + 1;
        $total = 0;
        $total_sum = 0;
        while ($row = $db->Fetch($stmt)) {
            // $total = $row["i_qty"] * $row["f_unit_price"];  total
            $temp = array(
                "no" => $i++,
                "id" => intval($row["sp_tor_event_id"]),
                "sp_tor_id" => intval($row["sp_tor_id"]),
                "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
                "sp_status_hdr_id" => intval($row["sp_status_hdr_id"]),
                "sp_status_hdr_name" => $row["sp_status_hdr_name"],
                "importance_level" => $row["importance_level"],
                "event_title" => $row["event_title"],
                "event_detail" => $row["event_detail"],
                "event_date" => $date->extDateBuddha($row["event_date"]), //
                "event_type" => $row["event_type"],
                "event_type_id" => $row["event_type_id"],
                "sp_status_hdr" => $row["sp_status_hdr"],
                "i_enabled" => $row["i_enabled"],
                "dc_user_create_id" => $row["c_create_name"],
                "dc_user_create_cost_id" => $row["c_cost_creat_name"],
                "d_create" => $row["d_create"], //
                "dc_user_update_id" => $row["c_update_name"],
                "dc_user_update_cost_id" => $row["c_cost_update_name"],
                "d_update" => $date->extDateBuddha($row["d_update"]),
                "event_time_start" => $row["event_time_start"],
                "event_time_end" => $row["event_time_end"],
            );
            ${$root}[] = $temp;
            $total_sum += $total;
        }

        echo json_encode(array("debug" => true, 'totalSum' => $total_sum, "totalCount" => $i, $root => ${$root}));
        exit();

        break;
    case "delete_event":
        unset($arrParam);
        $arrParam = array();
        $arrParam[] = $_REQUEST["i_enabled"];
        $arrParam[] = $_SESSION["user_id"];
        $arrParam[] = $_SESSION["dc_cost_id"];
        $arrParam[] = date("Y-m-d H:i:s");
        $arrParam[] = $_REQUEST["id"] ?? null;
        $sql = "UPDATE dbo.sp_tor_event SET i_enabled =?
        ,dc_user_update_id  = ?
        ,dc_user_update_cost_id = ?
        ,d_update = ?
        WHERE sp_tor_event_id = ? ";
        $stmt = $db->QueryParam($sql, $arrParam);
        break;
    case "LIST_EVENT_REPORT":
        $root = "data";
        $data = array();

        $i_year = $_REQUEST["i_year"] ?? date("Y");
        if ($i_year > 2400)
            $i_year -= 543;

        $include_old_data = isset($_REQUEST['include_old_data']) && $_REQUEST['include_old_data'] == 1;

        // 1. Summary Data (Bar Chart)
        $sqlSummary = "SELECT
                    a.dc_user_create_id,
                    COUNT(a.sp_tor_event_id) as total_count,
                    (SELECT TOP 1 c_full_name FROM dbo.dc_user WHERE dc_user_id = a.dc_user_create_id) as user_name,
                    (SELECT TOP 1 c_name FROM NMU_DATACENTER.dbo.dc_cost WHERE dc_cost_id = a.dc_user_create_cost_id) as cost_name
                FROM dbo.sp_tor_event a
                WHERE a.i_enabled = 1
                AND YEAR(a.event_date) = ? ";

        // Filter: If Year is 2026 and NOT including old data, filter from Feb 1st
        if ($i_year == 2026 && !$include_old_data) {
            $sqlSummary .= " AND a.event_date >= '2026-02-01' ";
        }

        $arrParamSummary = array($i_year);
        if (!empty($_REQUEST['dc_cost_id'])) {
            $sqlSummary .= " AND a.dc_user_create_cost_id = ? ";
            $arrParamSummary[] = $_REQUEST['dc_cost_id'];
        }
        $sqlSummary .= " GROUP BY a.dc_user_create_id, a.dc_user_create_cost_id ORDER BY total_count DESC ";

        $stmtSummary = $db->QueryParam($sqlSummary, $arrParamSummary);
        $summaryData = array();
        while ($row = $db->Fetch($stmtSummary)) {
            $summaryData[] = array(
                "user_id" => $row["dc_user_create_id"],
                "user_name" => $row["user_name"] ?? "Unknown",
                "cost_name" => $row["cost_name"] ?? "-",
                "count" => intval($row["total_count"])
            );
        }

        // 2. Detailed Data (Table)
        $sqlDetails = "SELECT
                a.sp_tor_event_id,
                a.event_title,
                a.event_detail,
                CONVERT(VARCHAR, a.event_date, 120) as event_date,
                a.event_type,
                (SELECT TOP 1 c_name FROM NMU_ERP.dbo.sp_type_event WHERE sp_type_event_id = a.event_type) as event_type_name,
                a.dc_user_create_id,
                (SELECT TOP 1 c_full_name FROM dbo.dc_user WHERE dc_user_id = a.dc_user_create_id) as user_name,
                a.dc_user_create_cost_id,
                (SELECT TOP 1 c_name FROM NMU_DATACENTER.dbo.dc_cost WHERE dc_cost_id = a.dc_user_create_cost_id) as cost_name,
                a.sp_tor_id,
                b.c_code as pr_code,
                a.event_time_start,
                a.event_time_end
            FROM dbo.sp_tor_event a
            LEFT JOIN dbo.sp_tor b ON a.sp_tor_id = b.tor_id
            WHERE a.i_enabled = 1
            AND YEAR(a.event_date) = ? ";

        // Filter: If Year is 2026 and NOT including old data, filter from Feb 1st
        if ($i_year == 2026 && !$include_old_data) {
            $sqlDetails .= " AND a.event_date >= '2026-02-01' ";
        }

        $arrParamDetails = array($i_year);
        if (!empty($_REQUEST['dc_cost_id'])) {
            $sqlDetails .= " AND a.dc_user_create_cost_id = ? ";
            $arrParamDetails[] = $_REQUEST['dc_cost_id'];
        }
        $sqlDetails .= " ORDER BY a.event_date DESC ";

        $stmtDetails = $db->QueryParam($sqlDetails, $arrParamDetails);
        $detailsData = array();
        while ($row = $db->Fetch($stmtDetails)) {
            $detailsData[] = array(
                "id" => $row["sp_tor_event_id"],
                "title" => $row["event_title"],
                "detail" => $row["event_detail"],
                "date" => $date->extDateBuddha($row["event_date"]),
                "type_name" => $row["event_type_name"],
                "user_name" => $row["user_name"],
                "dc_user_create_id" => $row["dc_user_create_id"],
                "cost_name" => $row["cost_name"],
                "pr_code" => $row["pr_code"],
                "event_time_start" => $row["event_time_start"],
                "event_time_end" => $row["event_time_end"]
            );
        }

        echo json_encode(array(
            "success" => true,
            "summary" => $summaryData,
            "details" => $detailsData
        ));
        exit();
        break;
    case "LIST_BG":
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
                    $wh .= " AND a.c_code LIKE '%" . $_REQUEST["value"] . "%' ";
                } else if ($_REQUEST["filter"] == "c_code") {
                    $wh .= " AND a.d_doc_ref  LIKE '%" . $_REQUEST["value"] . "%' ";
                } else if ($_REQUEST["filter"] == "dc_creditor_tax_numbe") {
                    $wh .= " AND  (select top 1 c_tax_number_imp from " . DB_NMU . "dc_creditor where dc_creditor_id = (select top 1 dc_creditor_id from sp_tor_contract where sp_tor_id = a.tor_id ) )  LIKE '%" . $_REQUEST["value"] . "%' ";
                } else if ($_REQUEST["filter"] == "dc_creditor_name") {
                    $wh .= " AND (select top 1 c_name from " . DB_NMU . "dc_creditor where dc_creditor_id = (select top 1 dc_creditor_id from sp_tor_contract where sp_tor_id = a.tor_id ) )  LIKE '%" . $_REQUEST["value"] . "%' ";
                } else if ($_REQUEST["filter"] == "c_code_contract") {
                    $wh .= " AND b.c_code LIKE '%" . $_REQUEST["value"] . "%' ";
                } else if ($_REQUEST["filter"] == "c_name") {
                    $wh .= " AND a.c_name LIKE '%" . $_REQUEST["value"] . "%' ";
                } else if ($_REQUEST["filter"] == "c_doc_ref") {
                    $wh .= " AND a.d_doc_ref LIKE '%" . $_REQUEST["value"] . "%' ";
                } else if ($_REQUEST["filter"] == "d_code_chk") {
                    $wh .= " AND b.sp_tor_contract_id  =
                    (select sp_tor_contract_id from sp_check_period_hdr bb where bb.c_code
                    LIKE '%" . $_REQUEST["value"] . "%') ";
                } else if ($_REQUEST["filter"] == "d_code") {
                    $wh .= " AND b.sp_tor_contract_id IN  (select sp_tor_contract_id from sp_check_period_hdr where  sp_check_period_hdr_id IN
                    (select  bb.chk_id  from NMU_EIS..po_working_hdr aa
                    INNER JOIN NMU_EIS..po_working_begin_hdr bb on aa.po_working_hdr_id = bb.po_working_hdr_id
                     where aa.c_code_ref
                    LIKE '%" . $_REQUEST["value"] . "%' AND aa.i_enable = 1
                     AND bb.i_enable = 1    ) )  ";
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
            if (@$_REQUEST["dc_expense_budget_type_id"] > 0) {
                $wh .= " AND a.dc_expense_budget_type_id = " . $_REQUEST["dc_expense_budget_type_id"];
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
                $wh .= " AND  a.f_total_amt  = " . str_replace(",", "", $_REQUEST["f_total_amtPr"]);
                ;
            }
            if (@$_REQUEST["f_total_amtPo"] > 0) {
                $wh .= " AND  b.f_total_amt  = " . str_replace(",", "", $_REQUEST["f_total_amtPo"]);
                ;
            }
        }
        if (@$_REQUEST['i_show'] == 1) {
            $wh .= "  and   a.d_egp_date  is null  and a.sp_emp_id is not null and a.dc_department_id is not null  and a.i_type_bg in (1,2,4)  "; //and a.tor_status_id = 21
        } else if (@$_REQUEST['i_show'] == 2) {
            $wh .= " ";
        } else if (!in_array($_SESSION['dc_cost_id'], [38, 3])) {
            $wh .= " AND a.dc_cost2_id = " . $_SESSION['dc_cost_id'];
        } else if (@$_REQUEST['i_show'] == 0 && !in_array(@$_SESSION['dc_cost_id'], [38, 3])) {
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
                            LEFT JOIN dbo.sp_tor_contract b ON a.tor_id = b.sp_tor_id
                            -- LEFT JOIN  vw_sp_tor_period_po_working b on  ss.sp_tor_contract_id  = b.sp_tor_contract_id and isnull(b.i_is_last,0) = 1 and b.i_sys = 3
                            WHERE isnull(a.i_type_bg,0) <> 3 and a.i_is_notor<>1  " . $wh;
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
                            ,s.bg_reserve_money1_id
                            ,s.bg_reserve_money2_id
                            ,s.bg_reserve_money3_id
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
                                                        -- , ss.f_total_amt as f_total_contract   stats_con
                            , s.dc_sub_cost_id
                            , (select c_name_th  from " . DB_CENTER . "dc_sub_cost where dc_sub_cost_id =   s.dc_sub_cost_id ) as dc_sub_cost
                            , (select top 1 stats_period_int from  #temp  aaa where aaa.sp_tor_contract_id  =  (select top 1 sp_tor_contract_id from sp_tor_contract where sp_tor_id = a. tor_id )) as stats_period_int
                            , (select top 1 stats_period from  #temp  aaa where  aaa.sp_tor_contract_id  = (select top 1 sp_tor_contract_id from sp_tor_contract where sp_tor_id = a. tor_id )) as stats_period
                            , isnull((select top 1  stats_con from  #temp  aaa where  aaa.sp_tor_contract_id  = (select top 1 sp_tor_contract_id from sp_tor_contract where sp_tor_id = a. tor_id )),'กำลังดำเนินการ') as stats_con

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
                            , CASE
                                WHEN s.i_enabled = 2 THEN 15
                                WHEN s.tor_status_id = 21 AND ISNULL(d.po_working_hdr_id, 0) > 0 AND ISNULL(f.i_status_last, 0) >= 11 THEN 13
                                WHEN s.tor_status_id = 21 AND ISNULL(d.po_working_hdr_id, 0) > 0 AND ISNULL(f.i_status_last, 0) < 11 THEN 12
                                WHEN s.tor_status_id IN (21, 10034) AND d.c_code IS NOT NULL AND ISNULL(d.po_working_hdr_id, 0) = 0 THEN 11
                                WHEN s.tor_status_id IN (21, 10034) AND b.c_code IS NOT NULL THEN 10
                                WHEN s.tor_status_id IN (1,11,12,14,15,16,17,18,19,20,22,23,28,29,30,31)  THEN 9
                                WHEN s.tor_status_id IN (24, 25, 26, 13,10060) THEN 8
                                ELSE 0
                              END as sp_status_report_id
                            "
                . " FROM ({$sqlTempTable}) a "
                . " INNER JOIN dbo.sp_tor s ON s.tor_id=a.tor_id"
                . " LEFT JOIN dbo.sp_tor_contract b ON s.tor_id = b.sp_tor_id "
                . " LEFT JOIN dbo.sp_tor_hdr_period c ON b.sp_tor_contract_id = c.sp_tor_contract_id AND c.i_is_last = 1 "
                . " LEFT JOIN dbo.sp_check_period_hdr d ON c.sp_tor_hdr_period_id = d.sp_tor_hdr_period_id "
                . " LEFT JOIN NMU_EIS..po_working_hdr f ON d.po_working_hdr_id = f.po_working_hdr_id "
                //. " LEFT JOIN dbo.sp_tor_contract ss ON s.tor_id= ss.sp_tor_id"
                // . " LEFT JOIN  vw_sp_tor_period_po_working b on  ss.sp_tor_contract_id  = b.sp_tor_contract_id and isnull(b.i_is_last,0) = 1 and b.i_sys = 3 "
                . " WHERE a.row > ? AND a.row <= ?";
        if (@$_REQUEST["show_sql"]) {
            /*             * ****echo sql***** */
            $sql = (@$sqlMain) ? $sqlMain : $sql;
            $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());

            $sql = str_replace('?', '#-#', $sql);
            foreach ($arr as $fld => $value) {
                $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
            }
            echo $sql;
            exit;
            /*             * ***************** */
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
                "no" => $i++,
                "id" => intval($row["tor_id"]),
                "i_amount_bg" => intval($row["i_amount_bg"]),
                "sp_tor_delete" => $sp,
                "sp_contract_id" => $row["sp_contract_id"],
                "stats_con" => $row["stats_con"],
                "code" => $row["code"],
                "c_name_egp" => $row["c_name_egp"],
                "project_code" => $row["project_code"],
                "f_total_average" => number_format($row["f_total_average"], 2),
                "dc_creditor_name" => $row["dc_creditor_name"],
                "c_tax_number_imp" => $row["c_tax_number_imp"],
                "i_purchase" => intval($row["i_purchase"]), //i_purchase	i_product_type	i_hire_type	i_is_inv i_delivery_date
                "i_product_type" => intval($row["i_product_type"]),
                "dc_create_cost_id" => intval($row["dc_create_cost_id"]),
                "i_hire_type" => intval($row["i_hire_type"]),
                "i_is_inv" => intval($row["i_is_inv"]),
                "i_pr_type1" => intval($row["i_pr_type1"]),
                "i_pr_type2" => intval($row["i_pr_type2"]),
                "i_pr_type3" => intval($row["i_pr_type3"]),
                "i_type_fix_rate" => intval($row["i_type_fix_rate"]),
                "i_delivery_date" => intval($row["i_delivery_date"]),
                "i_type_bg" => intval($row["i_type_bg"]),
                "bg_reserve_money1_id" => intval($row["bg_reserve_money1_id"]),
                "bg_reserve_money2_id" => intval($row["bg_reserve_money2_id"]),
                "bg_reserve_money3_id" => intval($row["bg_reserve_money3_id"]),
                "i_type_bgTxt" => $i_type_bgTxt,
                "i_step" => intval($row["i_step"]),
                "index_receive" => $row["index_receive"],
                "i_is_upload" => intval($row["i_is_upload"]),
                "upload" => $row["upload"],
                "event_type" => $row["event_type"],
                "c_emp_name" => $row["c_emp_name"],
                "txtsub_cost" => $row["txtsub_cost"],
                "i_forword" => intval($row["i_forword"]),
                "i_backword" => intval($row["i_backword"]),
                "i_edit" => intval($row["i_edit"]),
                "i_type_bg" => intval($row["i_type_bg"]),
                "sp_type_id" => intval($row["sp_type_id"]),
                "c_code" => $row["c_code"],
                "c_codeStatus" => $c_codeStatus, //database_start.png
                "bg_budget_dtl_project_id" => intval($row["bg_budget_dtl_project_id"]),
                "i_is_more" => intval($row["i_is_more"]),
                "f_total_amt" => number_format($row["f_total_amt"], 2),
                "f_total_contract" => number_format($row["f_total_contract"], 2),
                "i_is_rename" => intval($row["i_is_rename"]),
                "c_budget_dtl_project" => $row["c_budget_dtl_project"], //dc_department_name
                "txtdc_department_idID" => $row["dc_department_name"], //
                "c_name" => $row["c_name"],
                "tor_status_id" => $row["tor_status_id"],
                "c_code_status" => $row["c_code_status"],
                "c_name_status" => $row["c_name_status"],
                "tor_status_id" => $row["tor_status_id"],
                "dc_cost_id" => intval($row["dc_cost_id"]),
                "dc_cost2_id" => intval($row["dc_cost2_id"]),
                "dc_sub_cost_id" => intval($row["dc_sub_cost_id"]),
                "tag" => ($row["tag"]),
                "dc_cost_idTxt" => $row["dc_cost_idTxt"],
                "dc_cost2_idTxt" => $row["dc_cost2_idTxt"] ?? '',
                "dc_sub_cost" => $row["dc_sub_cost"] ?? '',
                "dc_department_id" => intval($row["dc_department_id"]),
                "c_department" => $row["c_department"],
                "i_parent" => $row["i_parent"],
                "i_is_parent" => $row["i_is_parent"],
                "d_doc_ref" => $row["d_doc_ref"],
                "i_yyyy" => $row["i_yyyy"],
                "c_year" => intval($row["i_yyyy"] + 543),
                "tor_type_id" => $row["tor_type_id"],
                "c_tor_type" => $row["c_type_name"], // $tor_type[$row["tor_type_id"]],
                "i_purchase" => intval($row["i_purchase"]),
                "c_purchase" => $i_purchase[$row["i_purchase"]],
                "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
                "dc_expense_budget_type_id0" => intval($row["dc_expense_budget_type_id"]),
                "dc_expense_budget_type_id1" => intval($row["dc_expense_budget_type2_id"]),
                "dc_expense_budget_type_id2" => intval($row["dc_expense_budget_type3_id"]),
                "f_type_amt" => number_format($row["f_type_amt"], 2),
                "f_type_amt0" => number_format($row["f_type_amt"], 2),
                "f_type_amt1" => number_format($row["f_type2_amt"], 2),
                "f_type_amt2" => number_format($row["f_type3_amt"], 2),
                "po_expense_id" => intval($row["po_expense_id"]),
                "dc_user_create_id" => $row["c_create_name"],
                "i_type_contract" => $row["i_type_contract"],
                "dc_user_create_cost_id" => $row["c_cost_creat_name"],
                "d_tor_date" => ((empty($row["d_tor_date"])) ? "" : $date->extDateBuddha($row["d_tor_date"])), //d_tor_date
                "d_egp_date" => ((empty($row["d_egp_date"])) ? "" : $date->extDateBuddha($row["d_egp_date"])), //d_tor_date
                "d_doc_date" => ((empty($row["d_doc_date"])) ? "" : $date->extDateBuddha($row["d_doc_date"])), //d_tor_date
                "d_doc_content" => ((empty($row["d_doc_content"])) ? "" : $date->shot_date_from_db($row["d_doc_content"])), //d_tor_date
                "d_start_content" => ((empty($row["d_start_content"])) ? "" : $date->shot_date_from_db($row["d_start_content"])), //d_tor_date
                "d_due_content" => ((empty($row["d_due_content"])) ? "" : $date->shot_date_from_db($row["d_due_content"])), //d_tor_date
                "d_create" => $date->extDateBuddha($row["d_create"]), //
                "dc_user_update_id" => $row["c_update_name"],
                "dc_user_update_cost_id" => $row["c_cost_update_name"],
                "d_update" => $date->extDateBuddha($row["d_update"]),
                "start_date" => $date->extDateBuddha($row["start_date"]),
                "end_date" => $date->extDateBuddha($row["end_date"]),
                "i_enabled" => intval($row["i_enabled"]),
                "c_comment" => $row["c_comment"],
                "c_remake" => $row["c_remake"],
                "sp_event_detail" => $row["sp_event_detail"],
                "po_creditor_id" => intval($row["po_creditor_id"]),
                "po_creditor_idTxt" => $row["po_creditor_idTxt"],
                "sp_status_report_id" => intval($row["sp_status_report_id"]),
            );
            ${$root}[] = $temp;
        }

        $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
        $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
        echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
        exit();
        // }
        break;
    case "LIST_SP_TOR_EVENT":
        $root = "data";
        $data = array();
        $limit = $_REQUEST["limit"] ?? 20;
        $user_id_php = $_SESSION['user_id'];
        $start = $_REQUEST["start"] ?? 0;
        $sqlMain = "SELECT
                e.sp_tor_event_id,
                e.sp_tor_id,
                e.event_type,
                e.event_title,
                e.event_detail,
                CONVERT(varchar, e.event_date, 120) as event_date,
                e.event_time_start,
                e.event_time_end,
                CONVERT(varchar, e.d_create, 120) as d_create,
                (SELECT TOP 1 c_full_name FROM dbo.dc_user WHERE dc_user_id = e.dc_user_create_id) as user_name
            FROM dbo.sp_tor_event e
            WHERE e.dc_user_create_id = ?  AND (e.sp_tor_id is  null or e.sp_tor_id = 0) AND e.i_enabled = 1
            ";

        $stmt = $db->QueryParam($sqlMain . " ORDER BY e.d_create DESC ", array($user_id_php));
        $i = @$start + 1;
        while ($row = $db->Fetch($stmt)) {
            if (!isset($row["sp_tor_event_id"]))
                continue;
            $temp = array(//event_date
                "no" => $i++,
                "sp_tor_event_id" => intval($row["sp_tor_event_id"]),
                "event_type" => $row["event_type"],
                "event_title" => $row["event_title"],
                "event_detail" => $row["event_detail"],
                "event_time_start" => $row["event_time_start"],
                "event_date" => $date->extDateBuddha($row["event_date"]), //
                "event_time_end" => $row["event_time_end"],
                "d_create" => $row["d_create"],
                "user_name" => $row["user_name"],
            );
            ${$root}[] = $temp;
        }
        $sqlCount = "select count(*) as totalCount from ({$sqlMain}) a";
        $totalCount = $db->GetDataBySQL($sqlCount, array($user_id_php));
        echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
        exit;
        break;
}

if ($stmt && $stmt2 && $stmt3) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว", "id" => $re_id);
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
}

echo json_encode($re);
exit;
