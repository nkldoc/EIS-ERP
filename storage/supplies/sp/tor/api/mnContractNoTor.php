<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

$mode = $_REQUEST["mode"];
$table = "dbo.sp_tor";
$keyName = "tor_id";
$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;
$c_code_gen = "TOR";
$re_id = null;
$stmt2 = true;
$stmt3 = true;

if ($mode != "LIST_CONTRACT_NO_TOR") {
//    print_r($_REQUEST);
//    exit;
} else {

}


$db->BeginTran();
switch ($mode) {
    case "DELETE_NOTOR_DTL":
        $sql = "DELETE FROM dbo.sp_tor_contract  WHERE sp_tor_contract_id = ?;";
        $sql .= "DELETE FROM dbo.sp_tor WHERE tor_id = ?;";
        $arrParam = array($data["sp_tor_contract_id"], $data["sp_tor_id"]);
        $stmt = $db->QueryParam($sql, $arrParam);
        break;
    case "DELETE_TOR_DTL":
        $sql = "DELETE FROM dbo.sp_tor_contract  WHERE sp_tor_contract_id = ?;";
        $sql .= "DELETE FROM dbo.sp_tor WHERE tor_id = ?;";
        $arrParam = array($data["sp_tor_contract_id"], $data["sp_tor_id"]);
        $stmt = $db->QueryParam($sql, $arrParam);
        break;
    case "GENCODENOTOR":
        print_r($data);
        exit();

        break;
    case "LIST_CONTRACT_NO_TOR":
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
        $act = $_REQUEST["act"] ?? null;
        $tor_type_show = $_REQUEST['tor_type_show'] ?? null;
        $i_post = $_REQUEST['i_post'] ?? null;

        $tor_status_id = $_REQUEST["tor_status_id"] ?? null; // status id
        $i_alarm = $_REQUEST["i_alarm"] ?? null; // status id
        $i_pa = $_REQUEST["i_pa"] ?? null; // status id


        $step = (!empty($tor_status_id)) ? $tor_status_id : 0;
        $addConfDay1 = (!empty($i_alarm)) ? $i_alarm : 0;
        $addConfDay2 = (!empty($i_pa)) ? $i_pa : 0;


        if ($act == "SEARCH") {
            $wh .= ($_REQUEST['tor_type_id'] != 0) ? " and a.tor_type_id =" . $_REQUEST['tor_type_id'] : "";
            $wh .= ($_REQUEST['c_code'] != "") ? " and a.c_code like '%" . $_REQUEST['c_code'] . "%'" : "";
            $wh .= (@$_REQUEST['tag'] != "") ? " and a.tag like '%" . @$_REQUEST['tag'] . "%'" : "";
            $wh .= ($_REQUEST['c_name'] != 0) ? " and a.c_name like '%" . $_REQUEST['c_name'] . "%'" : "";
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


        $arrParam = array();
        $arrCountParam = array();
        $sqlTempTable = "SELECT
                            ROW_NUMBER() OVER (ORDER BY a.tor_id DESC) AS row
                            , a.tor_id
                            , a.tor_id as sp_tor_id
                            , b.sp_tor_contract_id
                            , a.po_expense_id
                            , a.po_creditor_id
                            , a.dc_expense_budget_type_id
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
                            , a.i_enabled
                        FROM sp_tor_contract b
                        INNER JOIN sp_tor a ON a.tor_id = b.sp_tor_id
                        WHERE a.c_name IS NULL and b.i_enabled = 1 AND a.c_code IS NULL AND a.d_tor_date IS NULL" . $wh . $util->viewDepartment('a', $_SESSION["dc_department_id"]); //


        $arrParam[] = $start;
        $arrParam[] = $limit;
        $sqlMain = "    SELECT a.*
                            , s.c_code
                            , s.c_budget_dtl_project
                            , c.c_name
                            , s.c_department
                            , s.tag
                            , (SELECT TOP 1 c_name FROM dbo.sp_department  WHERE dc_department_id=s.dc_department_id)  AS dc_department_name
                            , (select top 1 c_name from dbo.sp_emp where sp_emp_id=s.sp_emp_id)  as sp_emp_name
                            , (SELECT TOP 1 c_name FROM dbo.sp_emp  WHERE sp_emp_id=s.sp_emp_id)  AS c_emp_name
                            , (SELECT TOP 1 c_code FROM dbo.sp_status_hdr WHERE sp_status_hdr_id=s.tor_status_id)  AS c_code_status
                            , (SELECT TOP 1 c_name FROM dbo.sp_status_hdr WHERE sp_status_hdr_id=s.tor_status_id)  AS c_name_status
                            , (SELECT TOP 1 c_name FROM dbo.sp_type_status WHERE sp_type_status_id=s.tor_type_id)  AS c_type_name
                            , ISNULL(s.i_purchase,1) AS i_purchase
                            , ISNULL(s.tor_type_id,1) AS tor_type_id
                            , s.f_period_amt
                            , s.f_total_amt
                            , ISNULL(s.i_parent,0) AS i_parent
                            , ISNULL(s.i_is_parent,0) AS i_is_parent
                            , s.start_date
                            , s.end_date
                            , s.c_comment
                            , s.c_remake
                            , s.i_yyyy
                            , CONVERT(VARCHAR, s.d_tor_date, 120) AS d_tor_date
                            , c.dc_creditor_id
                            , (SELECT TOP 1 c_name FROM nmu.dbo.dc_creditor WHERE dc_creditor_id= c.dc_creditor_id)  AS dc_creditor_idTxt
                            , (SELECT TOP 1 c_tax_number_imp FROM dbo.dc_creditor WHERE dc_creditor_id= c.dc_creditor_id)  AS c_tax_number_imp
                            , (SELECT TOP 1 c_name FROM dbo.dc_cost WHERE dc_cost_id=a.dc_cost_id)  AS dc_cost_idTxt
                            , (SELECT TOP 1 c_name FROM dbo.dc_cost WHERE dc_cost_id=a.dc_cost2_id)  AS dc_cost2_idTxt
                            , (SELECT TOP 1 c_full_name FROM dbo.dc_user WHERE dc_user_id=s.dc_user_create_id) AS c_create_name
                            , (SELECT TOP 1 c_name FROM dbo.dc_cost WHERE dc_cost_id=s.dc_user_create_cost_id) AS c_cost_creat_name
                            , CONVERT(VARCHAR, c.d_create, 120) AS d_create
                            , (SELECT TOP 1 c_full_name FROM dbo.dc_user WHERE dc_user_id=s.dc_user_update_id) AS c_update_name
                            , (SELECT TOP 1 c_name FROM dbo.dc_cost WHERE dc_cost_id=s.dc_user_update_cost_id) AS c_cost_update_name
                            , CONVERT(VARCHAR, c.d_update, 120) AS d_update
                            , c.c_code as c_contract_code
                            , c.c_doc_ref as c_doc_ref
                            , CONVERT(VARCHAR, c.d_doc_date, 120) as d_contract_date
                            , CONVERT(VARCHAR, c.d_due_date, 120) as d_due_date
                            , c.f_total_amt as f_total
                            , c.i_is_monthly AS i_is_expense_monthly
                            , c.i_is_warranty
                            , c.i_is_warranty_book
                            , c.book_no
                            , c.book_seq
                            , CONVERT(VARCHAR, c.d_book_date, 120) AS d_book_date
                            , c.f_warranty_amt
                            , c.c_remark
                            , c.cashiercheque_on 
                            , c.cashiercheque_seq
                            , isnull(CONVERT(VARCHAR, c.d_cashiercheque_data, 120),'') AS d_cashiercheque_data
                            , c.f_warranty_cashiercheque
                            , c.c_remark_cashiercheque
                            , c.book_warranty_no
                            , CONVERT(VARCHAR, c.d_book_warranty_date, 120) AS d_book_warranty_date
                            , c.dc_bank_id
                            , (SELECT c_code+' '+c_name FROM dc_bank aa WHERE aa.dc_bank_id = c.dc_bank_id) AS dc_bank_idID_Name
                            , c.f_book_warranty_amt
                            , CONVERT(VARCHAR, c.d_book_warranty_end, 120) AS d_book_warranty_end
                            , c.c_remark1
                        , c.c_code
                        , s.i_is_register
                        , s.i_type_contract
                            , (select SUM(isnull(aaa.i_not_do,9))
                                from sp_tor_contract aa
                                left join sp_gl_monthly_hdr bb on aa.sp_tor_contract_id = bb.sp_tor_contract_id and bb.i_enabled = 1
                                left join (select sp_gl_monthly_hdr_id , CASE WHEN count(*) > 0 THEN 0 ELSE 1 END as i_not_do from sp_gl_monthly_dtl where i_enabled = 1 group by sp_gl_monthly_hdr_id) aaa on bb.sp_gl_monthly_hdr_id = aaa.sp_gl_monthly_hdr_id
                                where aa.sp_tor_id = a.tor_id) as i_not_do
                        FROM ({$sqlTempTable}) a
                        INNER JOIN dbo.sp_tor s ON s.tor_id = a.tor_id
                        INNER join dbo.sp_tor_contract c on c.sp_tor_id = a.tor_id
                        WHERE a.row > ? AND a.row <= ?
                        order by a.row
                        ";
    // /******echo sql******/
    // $sql = (@$sqlMain) ? $sqlMain : $sql;
    // $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());

    // $sql = str_replace('?', '#-#', $sql);
    // foreach ($arr as $fld => $value) {
    //     $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
    // }
    // echo $sql; exit;
    // /********************/
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = $start + 1;
        $i_purchase = array(1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
        $sp_contract_year =   $db->GetDataBySQL("SELECT a.i_year_be FROM dbo.sp_contract_year a WHERE  a.i_enabled = 1 ", array(1));
        
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "id" => intval($row["tor_id"]),
                "sp_contract_year" => $sp_contract_year,
                "sp_tor_id" => intval($row["sp_tor_id"]),
                "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
                "i_purchase" => intval($row["i_purchase"]), //i_purchase	i_product_type	i_hire_type	i_is_inv i_delivery_date
                "i_product_type" => intval($row["i_product_type"]),
                "i_hire_type" => intval($row["i_hire_type"]),
                "i_is_inv" => intval($row["i_is_inv"]),
                "i_is_register" => intval($row["i_is_register"]),
                "i_not_do" => $row["i_not_do"] > 0 ? 1 : 0,
                "c_doc_ref" => $row["c_doc_ref"],
                "c_contract_no" => $row["c_doc_ref"],
                "i_type_fix_rate" => intval($row["i_type_fix_rate"]),
                "i_delivery_date" => intval($row["i_delivery_date"]),
                "i_step" => intval($row["i_step"]),
                "index_receive" => $row["index_receive"],
                "c_emp_name" => $row["c_emp_name"],
                "sp_emp_id" => intVal($row["sp_emp_id"]),
                "txtsp_emp_idID" => $row["sp_emp_name"],
                "txtdc_department_idID" => $row["dc_department_name"],
                "txtsub_cost" => $row["txtsub_cost"],
                "i_forword" => intval($row["i_forword"]),
                "i_backword" => intval($row["i_backword"]),
                "c_code" => $row["c_code"],
                "c_codeStatus" => "<b>" . $row["c_code"] . "</b>" . ($row["tor_status_id"] > 0 ? "<image id='img-" . $row['tor_id'] . "' src='../images/icons/database_start.png'/>" : ""), //database_start.png
                "bg_budget_dtl_project_id" => intval($row["bg_budget_dtl_project_id"]),
                "i_is_more" => intval($row["i_is_more"]),
                "f_total_amt" => number_format($row["f_total_amt"], 2),
                "f_total" => number_format($row["f_total"], 2),
                "i_is_rename" => intval($row["i_is_rename"]),
                "c_budget_dtl_project" => $row["c_budget_dtl_project"], //dc_department_name
                "txtdc_department_idID" => $row["dc_department_name"], //
                "c_name" => $row["c_name"],
                "c_code_status" => $row["c_code_status"],
                "c_name_status" => $row["c_name_status"],
                "tor_status_id" => $row["tor_status_id"],
                "dc_cost_id" => intval($row["dc_cost_id"]),
                "dc_cost2_id" => intval($row["dc_cost2_id"]),
                "tag" => ($row["tag"]),
                "dc_cost2_idTxt" => $row["dc_cost2_idTxt"] ?? "",
                "dc_cost_idTxt" => $row["dc_cost_idTxt"],
                "dc_department_id" => intval($row["dc_department_id"]),
                "c_department" => $row["c_department"],
                "i_parent" => $row["i_parent"],
                "i_is_parent" => $row["i_is_parent"],
                // "d_doc_ref" => $row["d_doc_ref"],
                "i_yyyy" => $row["i_yyyy"],
                 "i_type_contract" => $row["i_type_contract"],
                "c_year" => intval($row["i_yyyy"] + 543),
                "tor_type_id" => $row["tor_type_id"],
                "c_tor_type" => $row["c_type_name"], // $tor_type[$row["tor_type_id"]],
                "i_purchase" => intval($row["i_purchase"]),
                "c_purchase" => $i_purchase[$row["i_purchase"]],
                "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
                "po_expense_id" => intval($row["po_expense_id"]),
                "dc_user_create_id" => $row["c_create_name"],
                "dc_user_create_cost_id" => $row["c_cost_creat_name"],
                "d_tor_date" => ((empty($row["d_tor_date"])) ? "" : $date->extDateBuddha($row["d_tor_date"])), //d_tor_date
                "d_contract_date" => ((empty($row["d_contract_date"])) ? "" : $date->extDateBuddha($row["d_contract_date"])), //d_tor_date
                "d_due_date" => ((empty($row["d_due_date"])) ? "" : $date->extDateBuddha($row["d_due_date"])), //d_tor_date
                "d_create" => $date->extDateBuddha($row["d_create"]), //
                "dc_user_update_id" => $row["c_update_name"],
                "dc_user_update_cost_id" => $row["c_cost_update_name"],
                "d_update" => $date->extDateBuddha($row["d_update"]),
                "start_date" => $date->extDateBuddha($row["start_date"]),
                "end_date" => $date->extDateBuddha($row["end_date"]),
                "i_enabled" => intval($row["i_enabled"]),
                "c_comment" => $row["c_comment"],
                "c_remake" => $row["c_remake"],
                "dc_creditor_id" => intval($row["dc_creditor_id"]),
                "c_tax_number_imp" => $row["c_tax_number_imp"],
                "dc_creditor_id_Name" => $row["dc_creditor_idTxt"],
                "i_is_expense_monthly" => $row["i_is_expense_monthly"],

                "i_is_warranty" => $row["i_is_warranty"],
                "i_is_warranty_book" => $row["i_is_warranty_book"],
    
                "c_books_cashiercheque" => $row["cashiercheque_on"],
                "c_receipt_cashiercheque" => $row["cashiercheque_seq"],
                "d_cashiercheque_date" => ((empty($row["d_cashiercheque_data"])) ? "" : $date->extDateBuddha($row["d_cashiercheque_data"])),// $row["d_cashiercheque_data"],
                "f_cashiercheque_warranty_amt2" => $row["f_warranty_cashiercheque"],
                "c_comment2" => $row["c_remark_cashiercheque"],               
                
                "c_books_receipt" => $row["book_no"],
                "c_receipt_no" => $row["book_seq"],
                "d_doc_date" => ((empty($row["d_book_date"])) ? "" : $date->extDateBuddha($row["d_book_date"])),
                "f_warranty_amt" => $row["f_warranty_amt"],
                "c_comment" => $row["c_remark"],

                "c_doc_no" => $row["book_warranty_no"],
                "d_doc_date1" => ((empty($row["d_book_warranty_date"])) ? "" : $date->extDateBuddha($row["d_book_warranty_date"])),
                "dc_bank_id" => $row["dc_bank_id"],
                "dc_bank_idID_Name" => $row["dc_bank_idID_Name"],
                "f_warranty_amt1" => number_format($row["f_book_warranty_amt"], 2),
                "d_expire_warranty" => ((empty($row["d_book_warranty_end"])) ? "" : $date->extDateBuddha($row["d_book_warranty_end"])),
                "c_comment1" => $row["c_remark1"],
            );
            ${$root}[] = $temp;
        }

        $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
        $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
        echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
        exit(); 
        break;
    case "LIST_CONTRACT_NO_TOR_CHECK":
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
        $act = $_REQUEST["act"] ?? null;
        $tor_type_show = $_REQUEST['tor_type_show'] ?? null;
        $i_post = $_REQUEST['i_post'] ?? null;

        $tor_status_id = $_REQUEST["tor_status_id"] ?? null; // status id
        $i_alarm = $_REQUEST["i_alarm"] ?? null; // status id
        $i_pa = $_REQUEST["i_pa"] ?? null; // status id


        $step = (!empty($tor_status_id)) ? $tor_status_id : 0;
        $addConfDay1 = (!empty($i_alarm)) ? $i_alarm : 0;
        $addConfDay2 = (!empty($i_pa)) ? $i_pa : 0;


        if ($act == "SEARCH") {
            $wh .= ($_REQUEST['tor_type_id'] != 0) ? " and a.tor_type_id =" . $_REQUEST['tor_type_id'] : "";
            $wh .= ($_REQUEST['c_code'] != "") ? " and a.c_code like '%" . $_REQUEST['c_code'] . "%'" : "";
            $wh .= (@$_REQUEST['tag'] != "") ? " and a.tag like '%" . @$_REQUEST['tag'] . "%'" : "";
            $wh .= ($_REQUEST['c_name'] != 0) ? " and a.c_name like '%" . $_REQUEST['c_name'] . "%'" : "";
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


        $arrParam = array();
        $arrCountParam = array();
        $sqlTempTable = "SELECT
                            ROW_NUMBER() OVER (ORDER BY a.tor_id DESC) AS row
                            , a.tor_id
                            , a.tor_id as sp_tor_id
                            , b.sp_tor_contract_id
                            , a.po_expense_id
                            , a.po_creditor_id
                            , a.dc_expense_budget_type_id
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
                            , a.i_enabled
                        FROM sp_tor_contract_no b
                        INNER JOIN sp_tor_no a ON a.tor_id = b.sp_tor_id
                        WHERE a.c_name IS NULL AND a.c_code IS NULL AND a.d_tor_date IS NULL" . $wh . $util->viewDepartment('a', $_SESSION["dc_department_id"]); //

        $arrParam[] = $start;
        $arrParam[] = $limit;
        $sqlMain = "    SELECT a.*
                            , s.c_code
                            , s.c_budget_dtl_project
                            , c.c_name
                            , s.c_department
                            , s.tag
                            , (SELECT TOP 1 c_name FROM dbo.sp_department  WHERE dc_department_id=s.dc_department_id)  AS dc_department_name
                            , (select top 1 c_name from dbo.sp_emp where sp_emp_id=s.sp_emp_id)  as sp_emp_name
                            , (SELECT TOP 1 c_name FROM dbo.sp_emp  WHERE sp_emp_id=s.sp_emp_id)  AS c_emp_name
                            , (SELECT TOP 1 c_code FROM dbo.sp_status_hdr WHERE sp_status_hdr_id=s.tor_status_id)  AS c_code_status
                            , (SELECT TOP 1 c_name FROM dbo.sp_status_hdr WHERE sp_status_hdr_id=s.tor_status_id)  AS c_name_status
                            , (SELECT TOP 1 c_name FROM dbo.sp_type_status WHERE sp_type_status_id=s.tor_type_id)  AS c_type_name
                            , ISNULL(s.i_purchase,1) AS i_purchase
                            , ISNULL(s.tor_type_id,1) AS tor_type_id
                            , s.f_period_amt
                            , s.f_total_amt
                            , ISNULL(s.i_parent,0) AS i_parent
                            , ISNULL(s.i_is_parent,0) AS i_is_parent
                            , s.start_date
                            , s.end_date
                            , s.c_comment
                            , s.c_remake
                            , s.i_yyyy
                            , CONVERT(VARCHAR, s.d_tor_date, 120) AS d_tor_date
                            , c.dc_creditor_id
                            , (SELECT TOP 1 c_name FROM dbo.dc_creditor WHERE dc_creditor_id= c.dc_creditor_id)  AS dc_creditor_idTxt
                            , (SELECT TOP 1 c_tax_number_imp FROM dbo.dc_creditor WHERE dc_creditor_id= c.dc_creditor_id)  AS c_tax_number_imp
                            , (SELECT TOP 1 c_name FROM dbo.dc_cost WHERE dc_cost_id=a.dc_cost_id)  AS dc_cost_idTxt
                            , (SELECT TOP 1 c_name FROM dbo.dc_cost WHERE dc_cost_id=a.dc_cost2_id)  AS dc_cost2_idTxt
                            , (SELECT TOP 1 c_full_name FROM dbo.dc_user WHERE dc_user_id=s.dc_user_create_id) AS c_create_name
                            , (SELECT TOP 1 c_name FROM dbo.dc_cost WHERE dc_cost_id=s.dc_user_create_cost_id) AS c_cost_creat_name
                            , CONVERT(VARCHAR, c.d_create, 120) AS d_create
                            , (SELECT TOP 1 c_full_name FROM dbo.dc_user WHERE dc_user_id=s.dc_user_update_id) AS c_update_name
                            , (SELECT TOP 1 c_name FROM dbo.dc_cost WHERE dc_cost_id=s.dc_user_update_cost_id) AS c_cost_update_name
                            , CONVERT(VARCHAR, c.d_update, 120) AS d_update
                            , c.c_code as c_contract_code
                            , c.c_doc_ref as c_doc_ref
                            , CONVERT(VARCHAR, c.d_doc_date, 120) as d_contract_date
                            , CONVERT(VARCHAR, c.d_due_date, 120) as d_due_date
                            , c.f_total_amt as f_total
                            , c.i_is_monthly AS i_is_expense_monthly
                            , c.i_is_warranty
                            , c.i_is_warranty_book
                            , c.book_no
                            , c.book_seq
                            , CONVERT(VARCHAR, c.d_book_date, 120) AS d_book_date
                            , c.f_warranty_amt
                            , c.c_remark
                , c.cashiercheque_on 
                , c.cashiercheque_seq
                , isnull(CONVERT(VARCHAR, c.d_cashiercheque_data, 120),'') AS d_cashiercheque_data
                , c.f_warranty_cashiercheque
                , c.c_remark_cashiercheque
                            , c.book_warranty_no
                            , CONVERT(VARCHAR, c.d_book_warranty_date, 120) AS d_book_warranty_date
                            , c.dc_bank_id
                            , (SELECT c_code+' '+c_name FROM dc_bank aa WHERE aa.dc_bank_id = c.dc_bank_id) AS dc_bank_idID_Name
                            , c.f_book_warranty_amt
                            , CONVERT(VARCHAR, c.d_book_warranty_end, 120) AS d_book_warranty_end
                            , c.c_remark1
                        , c.c_code
                        , s.i_is_register
                        , s.i_type_contract
                            , (select SUM(isnull(aaa.i_not_do,9))
                                from sp_tor_contract_no aa
                                left join sp_gl_monthly_hdr bb on aa.sp_tor_contract_id = bb.sp_tor_contract_id and bb.i_enabled = 1
                                left join (select sp_gl_monthly_hdr_id , CASE WHEN count(*) > 0 THEN 0 ELSE 1 END as i_not_do from sp_gl_monthly_dtl where i_enabled = 1 group by sp_gl_monthly_hdr_id) aaa on bb.sp_gl_monthly_hdr_id = aaa.sp_gl_monthly_hdr_id
                                where aa.sp_tor_id = a.tor_id) as i_not_do
                        FROM ({$sqlTempTable}) a
                        INNER JOIN dbo.sp_tor_no s ON s.tor_id = a.tor_id
                        INNER join dbo.sp_tor_contract_no c on c.sp_tor_id = a.tor_id
                        WHERE a.row > ? AND a.row <= ?
                        order by a.row
                        ";
    // /******echo sql******/
    // $sql = (@$sqlMain) ? $sqlMain : $sql;
    // $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());

    // $sql = str_replace('?', '#-#', $sql);
    // foreach ($arr as $fld => $value) {
    //     $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
    // }
    // echo $sql; exit;
    // /********************/
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = $start + 1;
        $i_purchase = array(1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "id" => intval($row["tor_id"]),
                "sp_tor_id" => intval($row["sp_tor_id"]),
                "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
                "i_purchase" => intval($row["i_purchase"]), //i_purchase	i_product_type	i_hire_type	i_is_inv i_delivery_date
                "i_product_type" => intval($row["i_product_type"]),
                "i_hire_type" => intval($row["i_hire_type"]),
                "i_is_inv" => intval($row["i_is_inv"]),
                "i_is_register" => intval($row["i_is_register"]),
                "i_not_do" => $row["i_not_do"] > 0 ? 1 : 0,
                "c_doc_ref" => $row["c_doc_ref"],
                "c_contract_no" => $row["c_doc_ref"],
                "i_type_fix_rate" => intval($row["i_type_fix_rate"]),
                "i_delivery_date" => intval($row["i_delivery_date"]),
                "i_step" => intval($row["i_step"]),
                "index_receive" => $row["index_receive"],
                "c_emp_name" => $row["c_emp_name"],
                "sp_emp_id" => intVal($row["sp_emp_id"]),
                "txtsp_emp_idID" => $row["sp_emp_name"],
                "txtdc_department_idID" => $row["dc_department_name"],
                "txtsub_cost" => $row["txtsub_cost"],
                "i_forword" => intval($row["i_forword"]),
                "i_backword" => intval($row["i_backword"]),
                "c_code" => $row["c_code"],
                "c_codeStatus" => "<b>" . $row["c_code"] . "</b>" . ($row["tor_status_id"] > 0 ? "<image id='img-" . $row['tor_id'] . "' src='../images/icons/database_start.png'/>" : ""), //database_start.png
                "bg_budget_dtl_project_id" => intval($row["bg_budget_dtl_project_id"]),
                "i_is_more" => intval($row["i_is_more"]),
                "f_total_amt" => number_format($row["f_total_amt"], 2),
                "f_total" => number_format($row["f_total"], 2),
                "i_is_rename" => intval($row["i_is_rename"]),
                "c_budget_dtl_project" => $row["c_budget_dtl_project"], //dc_department_name
                "txtdc_department_idID" => $row["dc_department_name"], //
                "c_name" => $row["c_name"],
                "c_code_status" => $row["c_code_status"],
                "c_name_status" => $row["c_name_status"],
                "tor_status_id" => $row["tor_status_id"],
                "dc_cost_id" => intval($row["dc_cost_id"]),
                "dc_cost2_id" => intval($row["dc_cost2_id"]),
                "tag" => ($row["tag"]),
                "dc_cost2_idTxt" => $row["dc_cost2_idTxt"] ?? "",
                "dc_cost_idTxt" => $row["dc_cost_idTxt"],
                "dc_department_id" => intval($row["dc_department_id"]),
                "c_department" => $row["c_department"],
                "i_parent" => $row["i_parent"],
                "i_is_parent" => $row["i_is_parent"],
                // "d_doc_ref" => $row["d_doc_ref"],
                "i_yyyy" => $row["i_yyyy"],
                 "i_type_contract" => $row["i_type_contract"],
                "c_year" => intval($row["i_yyyy"] + 543),
                "tor_type_id" => $row["tor_type_id"],
                "c_tor_type" => $row["c_type_name"], // $tor_type[$row["tor_type_id"]],
                "i_purchase" => intval($row["i_purchase"]),
                "c_purchase" => $i_purchase[$row["i_purchase"]],
                "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
                "po_expense_id" => intval($row["po_expense_id"]),
                "dc_user_create_id" => $row["c_create_name"],
                "dc_user_create_cost_id" => $row["c_cost_creat_name"],
                "d_tor_date" => ((empty($row["d_tor_date"])) ? "" : $date->extDateBuddha($row["d_tor_date"])), //d_tor_date
                "d_contract_date" => ((empty($row["d_contract_date"])) ? "" : $date->extDateBuddha($row["d_contract_date"])), //d_tor_date
                "d_due_date" => ((empty($row["d_due_date"])) ? "" : $date->extDateBuddha($row["d_due_date"])), //d_tor_date
                "d_create" => $date->extDateBuddha($row["d_create"]), //
                "dc_user_update_id" => $row["c_update_name"],
                "dc_user_update_cost_id" => $row["c_cost_update_name"],
                "d_update" => $date->extDateBuddha($row["d_update"]),
                "start_date" => $date->extDateBuddha($row["start_date"]),
                "end_date" => $date->extDateBuddha($row["end_date"]),
                "i_enabled" => intval($row["i_enabled"]),
                "c_comment" => $row["c_comment"],
                "c_remake" => $row["c_remake"],
                "dc_creditor_id" => intval($row["dc_creditor_id"]),
                "c_tax_number_imp" => $row["c_tax_number_imp"],
                "dc_creditor_id_Name" => $row["dc_creditor_idTxt"],
                "i_is_expense_monthly" => $row["i_is_expense_monthly"],

                "i_is_warranty" => $row["i_is_warranty"],
                "i_is_warranty_book" => $row["i_is_warranty_book"],

                "c_books_receipt" => $row["book_no"],
                "c_receipt_no" => $row["book_seq"],
                "d_doc_date" => ((empty($row["d_book_date"])) ? "" : $date->extDateBuddha($row["d_book_date"])),
                "f_warranty_amt" => $row["f_warranty_amt"],
                "c_comment" => $row["c_remark"],
                "c_books_cashiercheque" => $row["cashiercheque_on"],
                "c_receipt_cashiercheque" => $row["cashiercheque_seq"],
                "d_cashiercheque_date" => ((empty($row["d_cashiercheque_data"])) ? "" : $date->extDateBuddha($row["d_cashiercheque_data"])),// $row["d_cashiercheque_data"],
                "f_cashiercheque_warranty_amt2" => $row["f_warranty_cashiercheque"],
                "c_comment2" => $row["c_remark_cashiercheque"], 
                "c_doc_no" => $row["book_warranty_no"],
                "d_doc_date1" => ((empty($row["d_book_warranty_date"])) ? "" : $date->extDateBuddha($row["d_book_warranty_date"])),
                "dc_bank_id" => $row["dc_bank_id"],
                "dc_bank_idID_Name" => $row["dc_bank_idID_Name"],
                "f_warranty_amt1" => number_format($row["f_book_warranty_amt"], 2),
                "d_expire_warranty" => ((empty($row["d_book_warranty_end"])) ? "" : $date->extDateBuddha($row["d_book_warranty_end"])),
                "c_comment1" => $row["c_remark1"],
            );
            ${$root}[] = $temp;
        }

        $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
        $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
        echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
        exit(); 
        break;
    case "LIST_CONTRACT_NO_TOR2":

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

        $tor_status_id = $_REQUEST["tor_status_id"] ?? null; // status id
        $i_alarm = $_REQUEST["i_alarm"] ?? null; // status id
        $i_pa = $_REQUEST["i_pa"] ?? null; // status id


        $step = (!empty($tor_status_id)) ? $tor_status_id : 0;
        $addConfDay1 = (!empty($i_alarm)) ? $i_alarm : 0;
        $addConfDay2 = (!empty($i_pa)) ? $i_pa : 0;

        if ($act == "SEARCH") {
            $wh .= ($_REQUEST['tor_type_id'] != 0) ? " and a.tor_type_id =" . $_REQUEST['tor_type_id'] : "";
            $wh .= ($_REQUEST['c_code'] != "") ? " and a.c_code like '%" . $_REQUEST['c_code'] . "%'" : "";
            $wh .= (@$_REQUEST['tag'] != "") ? " and a.tag like '%" . @$_REQUEST['tag'] . "%'" : "";
            $wh .= ($_REQUEST['c_name'] != 0) ? " and a.c_name like '%" . $_REQUEST['c_name'] . "%'" : "";
            //$wh .= " and a.i_enabled =" . $_REQUEST['i_enabled'];
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


        $arrParam = array();
        $arrCountParam = array();
        $sqlTempTable = "SELECT
                            ROW_NUMBER() OVER (ORDER BY a.tor_id DESC) AS row
                            , a.tor_id
                            , a.tor_id as sp_tor_id
                            , b.sp_tor_contract_id
                            , a.po_expense_id
                            , a.po_creditor_id
                            , a.dc_expense_budget_type_id
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
                            , a.i_enabled
                        FROM sp_tor_contract b
                        INNER JOIN sp_tor a ON a.tor_id = b.sp_tor_id and a.i_purchase <> 1
                        WHERE a.c_name IS NULL AND a.c_code IS NULL AND a.d_tor_date IS NULL" . $wh . $util->viewDepartment('a', $_SESSION["dc_department_id"]); //

        $arrParam[] = $start;
        $arrParam[] = $limit;
        $sqlMain = "    SELECT a.*
                            , s.c_code
                            , s.c_budget_dtl_project
                            , c.c_name
                            , s.c_department
                            , s.tag
                            , (SELECT TOP 1 c_name FROM dbo.sp_department  WHERE dc_department_id=s.dc_department_id)  AS dc_department_name
                            , (select top 1 c_name from dbo.sp_emp where sp_emp_id=s.sp_emp_id)  as sp_emp_name
                            , (SELECT TOP 1 c_name FROM dbo.sp_emp  WHERE sp_emp_id=s.sp_emp_id)  AS c_emp_name
                            , (SELECT TOP 1 c_code FROM dbo.sp_status_hdr WHERE sp_status_hdr_id=s.tor_status_id)  AS c_code_status
                            , (SELECT TOP 1 c_name FROM dbo.sp_status_hdr WHERE sp_status_hdr_id=s.tor_status_id)  AS c_name_status
                            , (SELECT TOP 1 c_name FROM dbo.sp_type_status WHERE sp_type_status_id=s.tor_type_id)  AS c_type_name
                            , ISNULL(s.i_purchase,1) AS i_purchase
                            , ISNULL(s.tor_type_id,1) AS tor_type_id
                            , s.f_period_amt
                            , s.f_total_amt
                            , ISNULL(s.i_parent,0) AS i_parent
                            , ISNULL(s.i_is_parent,0) AS i_is_parent
                            , s.start_date
                            , s.end_date
                            , s.c_comment
                            , s.c_remake
                            , s.i_yyyy
                            , CONVERT(VARCHAR, s.d_tor_date, 120) AS d_tor_date
                            , c.dc_creditor_id
                            , (SELECT TOP 1 c_name FROM dbo.dc_creditor WHERE dc_creditor_id= c.dc_creditor_id)  AS dc_creditor_idTxt
                            , (SELECT TOP 1 c_tax_number_imp FROM dbo.dc_creditor WHERE dc_creditor_id= c.dc_creditor_id)  AS c_tax_number_imp
                            , (SELECT TOP 1 c_name FROM dbo.dc_cost WHERE dc_cost_id=a.dc_cost_id)  AS dc_cost_idTxt
                            , (SELECT TOP 1 c_name FROM dbo.dc_cost WHERE dc_cost_id=a.dc_cost2_id)  AS dc_cost2_idTxt
                            , (SELECT TOP 1 c_full_name FROM dbo.dc_user WHERE dc_user_id=s.dc_user_create_id) AS c_create_name
                            , (SELECT TOP 1 c_name FROM dbo.dc_cost WHERE dc_cost_id=s.dc_user_create_cost_id) AS c_cost_creat_name
                            , CONVERT(VARCHAR, c.d_create, 120) AS d_create
                            , (SELECT TOP 1 c_full_name FROM dbo.dc_user WHERE dc_user_id=s.dc_user_update_id) AS c_update_name
                            , (SELECT TOP 1 c_name FROM dbo.dc_cost WHERE dc_cost_id=s.dc_user_update_cost_id) AS c_cost_update_name
                            , CONVERT(VARCHAR, c.d_update, 120) AS d_update
                            , c.c_code as c_contract_code
                            , c.c_doc_ref as c_doc_ref
                            , CONVERT(VARCHAR, c.d_doc_date, 120) as d_contract_date
                            , CONVERT(VARCHAR, c.d_due_date, 120) as d_due_date
                            , c.f_total_amt as f_total
                            , c.i_is_monthly AS i_is_expense_monthly
                            , c.i_is_warranty
                            , c.i_is_warranty_book
                            , c.book_no
                            , c.book_seq
                            , CONVERT(VARCHAR, c.d_book_date, 120) AS d_book_date
                            , c.f_warranty_amt
                            , c.c_remark

                            , c.book_warranty_no
                            , CONVERT(VARCHAR, c.d_book_warranty_date, 120) AS d_book_warranty_date
                            , c.dc_bank_id
                            , (SELECT c_code+' '+c_name FROM dc_bank aa WHERE aa.dc_bank_id = c.dc_bank_id) AS dc_bank_idID_Name
                            , c.f_book_warranty_amt
                            , CONVERT(VARCHAR, c.d_book_warranty_end, 120) AS d_book_warranty_end
                            , c.c_remark1
                        , c.c_code
                        , s.i_is_register
                            , (select SUM(isnull(aaa.i_not_do,9))
                                from sp_tor_contract aa
                                left join sp_gl_monthly_hdr bb on aa.sp_tor_contract_id = bb.sp_tor_contract_id and bb.i_enabled = 1
                                left join (select sp_gl_monthly_hdr_id , CASE WHEN count(*) > 0 THEN 0 ELSE 1 END as i_not_do from sp_gl_monthly_dtl where i_enabled = 1 group by sp_gl_monthly_hdr_id) aaa on bb.sp_gl_monthly_hdr_id = aaa.sp_gl_monthly_hdr_id
                                where aa.sp_tor_id = a.tor_id) as i_not_do
                        FROM ({$sqlTempTable}) a
                        INNER JOIN dbo.sp_tor s ON s.tor_id = a.tor_id
                        INNER join dbo.sp_tor_contract c on c.sp_tor_id = a.tor_id
                        WHERE a.row > ? AND a.row <= ?
                        order by a.row
                        ";
        // /******echo sql******/
        // $sql = (@$sqlMain) ? $sqlMain : $sql;
        // $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());
        // $sql = str_replace('?', '#-#', $sql);
        // foreach ($arr as $fld => $value) {
        //     $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
        // }
        // echo $sql; exit;
        // /********************/
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = $start + 1;
        $i_purchase = array(1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "id" => intval($row["tor_id"]),
                "sp_tor_id" => intval($row["sp_tor_id"]),
                "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
                "i_purchase" => intval($row["i_purchase"]), //i_purchase	i_product_type	i_hire_type	i_is_inv i_delivery_date
                "i_product_type" => intval($row["i_product_type"]),
                "i_hire_type" => intval($row["i_hire_type"]),
                "i_is_inv" => intval($row["i_is_inv"]),
                "i_is_register" => intval($row["i_is_register"]),
                "i_not_do" => $row["i_not_do"] > 0 ? 1 : 0,
                "c_doc_ref" => $row["c_doc_ref"],
                "c_contract_no" => $row["c_doc_ref"],
                "i_type_fix_rate" => intval($row["i_type_fix_rate"]),
                "i_delivery_date" => intval($row["i_delivery_date"]),
                "i_step" => intval($row["i_step"]),
                "index_receive" => $row["index_receive"],
                "c_emp_name" => $row["c_emp_name"],
                "txtsp_emp_idID" => $row["sp_emp_name"],
                "txtdc_department_idID" => $row["dc_department_name"],
                "txtsub_cost" => $row["txtsub_cost"],
                "i_forword" => intval($row["i_forword"]),
                "i_backword" => intval($row["i_backword"]),
                "c_code" => $row["c_code"],
                "c_codeStatus" => "<b>" . $row["c_code"] . "</b>" . ($row["tor_status_id"] > 0 ? "<image id='img-" . $row['tor_id'] . "' src='../images/icons/database_start.png'/>" : ""), //database_start.png
                "bg_budget_dtl_project_id" => intval($row["bg_budget_dtl_project_id"]),
                "i_is_more" => intval($row["i_is_more"]),
                "f_total_amt" => number_format($row["f_total_amt"], 2),
                "f_total" => number_format($row["f_total"], 2),
                "i_is_rename" => intval($row["i_is_rename"]),
                "c_budget_dtl_project" => $row["c_budget_dtl_project"], //dc_department_name
                "txtdc_department_idID" => $row["dc_department_name"], //
                "c_name" => $row["c_name"],
                "c_code_status" => $row["c_code_status"],
                "c_name_status" => $row["c_name_status"],
                "tor_status_id" => $row["tor_status_id"],
                "dc_cost_id" => intval($row["dc_cost_id"]),
                "dc_cost2_id" => intval($row["dc_cost2_id"]),
                "tag" => ($row["tag"]),
                "dc_cost2_idTxt" => $row["dc_cost2_idTxt"] ?? "",
                "dc_cost_idTxt" => $row["dc_cost_idTxt"],
                "dc_department_id" => intval($row["dc_department_id"]),
                "c_department" => $row["c_department"],
                "i_parent" => $row["i_parent"],
                "i_is_parent" => $row["i_is_parent"],
                // "d_doc_ref" => $row["d_doc_ref"],
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
                "d_tor_date" => ((empty($row["d_tor_date"])) ? "" : $date->extDateBuddha($row["d_tor_date"])), //d_tor_date
                "d_contract_date" => ((empty($row["d_contract_date"])) ? "" : $date->extDateBuddha($row["d_contract_date"])), //d_tor_date
                "d_due_date" => ((empty($row["d_due_date"])) ? "" : $date->extDateBuddha($row["d_due_date"])), //d_tor_date
                "d_create" => $date->extDateBuddha($row["d_create"]), //
                "dc_user_update_id" => $row["c_update_name"],
                "dc_user_update_cost_id" => $row["c_cost_update_name"],
                "d_update" => $date->extDateBuddha($row["d_update"]),
                "start_date" => $date->extDateBuddha($row["start_date"]),
                "end_date" => $date->extDateBuddha($row["end_date"]),
                "i_enabled" => intval($row["i_enabled"]),
                "c_comment" => $row["c_comment"],
                "c_remake" => $row["c_remake"],
                "dc_creditor_id" => intval($row["dc_creditor_id"]),
                "c_tax_number_imp" => $row["c_tax_number_imp"],
                "dc_creditor_id_Name" => $row["dc_creditor_idTxt"],
                "i_is_expense_monthly" => $row["i_is_expense_monthly"],
                "i_is_warranty" => $row["i_is_warranty"],
                "i_is_warranty_book" => $row["i_is_warranty_book"],
                "c_books_receipt" => $row["book_no"],
                "c_receipt_no" => $row["book_seq"],
                "d_doc_date" => ((empty($row["d_book_date"])) ? "" : $date->extDateBuddha($row["d_book_date"])),
                "f_warranty_amt" => $row["f_warranty_amt"],
                "c_comment" => $row["c_remark"],
                "c_doc_no" => $row["book_warranty_no"],
                "d_doc_date1" => ((empty($row["d_book_warranty_date"])) ? "" : $date->extDateBuddha($row["d_book_warranty_date"])),
                "dc_bank_id" => $row["dc_bank_id"],
                "dc_bank_idID_Name" => $row["dc_bank_idID_Name"],
                "f_warranty_amt1" => number_format($row["f_book_warranty_amt"], 2),
                "d_expire_warranty" => ((empty($row["d_book_warranty_end"])) ? "" : $date->extDateBuddha($row["d_book_warranty_end"])),
                "c_comment1" => $row["c_remark1"],
            );
            ${$root}[] = $temp;
        }

        $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
        $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
        echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
        exit();

        break;
    case "UP_CONTRACT_NO_TOR":

        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);

        $data["i_yyyy"] = $_REQUEST["i_yyyy"];
        $data["i_type_bg"] = $_REQUEST["i_type_bg"];
        $data["dc_expense_budget_type_id"] = $_REQUEST["dc_expense_budget_type_id"];
        $data["po_expense_id"] = $_REQUEST["po_expense_id"];
        $data["dc_cost2_id"] = $_REQUEST["dc_cost2_id"];
        $data["dc_cost_id"] = $_REQUEST["dc_cost_id"];
        $data["tor_type_id"] = $_REQUEST["tor_type_id"];
        $data["i_type_contract"] = $_REQUEST["i_type_contract"];
        $data["f_total_amt"] = str_replace(",", "", $_REQUEST["f_total_amt"]);
        $data["i_is_more"] = (($data["f_total_amt"] >= 500000) ? 1 : 0);
        $data["f_type_amt"] = $data["f_total_amt"];
        $data["i_purchase"] = @$_REQUEST["i_purchase"];
        $data["dc_department_id"] = @$_REQUEST["dc_department_id"];
        $data["sp_emp_id"] = @$_REQUEST["sp_emp_id"];
        if ($data['i_purchase'] == 1) {

            $data["i_hire_type"] = 1; //i_hire_type
            $data["i_product_type"] =  $_REQUEST["i_product_type"];
            $data["i_is_inv"] = @$_REQUEST["i_is_inv"];
            $data["i_type_fix_rate"] = @$_REQUEST["i_type_fix_rate"];
        } else if ($data['i_purchase'] == 2) { 
            $data["i_hire_type"] = @$_REQUEST["i_hire_type"];
            if ($_REQUEST["i_hire_type"] == 1) {
                $data["i_product_type"] =  $_REQUEST["i_product_type"];
                $data["i_is_inv"] = @$_REQUEST["i_is_inv"];
                $data["i_type_fix_rate"] = null;
            } else {
                $data["i_product_type"] = null;
                $data["i_is_inv"] = null;
                $data["i_type_fix_rate"] = null;
            }
        } else if ($data['i_purchase'] == 3) {
            $data["i_hire_type"] = null;
            $data["i_product_type"] = null;
            $data["i_is_inv"] = null;
            $data["i_type_fix_rate"] = null;
        }

        $data["dc_user_update_department_id"] = $_SESSION['dc_department_id'];
        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");
        $data["i_is_notor"] = 1;
        $data["i_is_register"] = 1;
        $data["tor_status_id"] = 20;
        
        if ($_REQUEST["sp_tor_id"] > 0) { // EDIT

            foreach ($data as $fldA => $value) {
                $arrValue[]    = ($value != "") ? $value : null;
                $addField    .= ",
                {$fldA} = ?";
            }

            $sql        = "UPDATE sp_tor SET " . substr($addField, 1) . " WHERE tor_id = ? ";
            $arrValue[] = $_REQUEST["sp_tor_id"];
            $db->QueryParam($sql, $arrValue);

            $addField = null;
            $addValue = null;
            unset($data);
            unset($arrValue);

            $data["sp_tor_id"] = $_REQUEST["sp_tor_id"];
            $data["c_doc_ref"] = $_REQUEST["c_contract_no"];
            $data['d_doc_date'] = !empty($_REQUEST['d_contract_date']) ? $date->bc_to_ad($_REQUEST['d_contract_date']) : null;
            $data['d_due_date'] = !empty($_REQUEST['d_due_date']) ? $date->bc_to_ad($_REQUEST['d_due_date']) : null;
            $data["c_name"] = $_REQUEST["c_name"];
            $data["dc_creditor_id"] = $_REQUEST["dc_creditor_id"];
            $data["f_total_amt"] = str_replace(",", "", $_REQUEST["f_total"]);
            $data["i_is_po"] = (@$_REQUEST["i_type_fix_rate"] == null) ? 0 : @$_REQUEST["i_type_fix_rate"];
            
        if (@$_REQUEST["i_is_bank_warranty0"] == 1) {
            $data["i_is_warranty"] = null;
            $data["cashiercheque_on"] = null;
            $data["i_is_warranty_book"] = null;
        } else {
            $data["i_is_warranty"] = @$_REQUEST["i_is_bank_warranty"];
            $data["cashiercheque_on"] = @$_REQUEST["i_is_cashiercheque_warrantyID"];
            $data["i_is_warranty_book"] = @$_REQUEST["i_is_bank_warranty1"];
        }

        if (@$_REQUEST["i_is_expense_monthly"] == 1) {
            $data["i_is_monthly"] = @$_REQUEST["i_is_expense_monthly"];
        } else {
            $data["i_is_monthly"] = null;
        }

        if (@$_REQUEST["i_is_bank_warranty"] == 1) {
            $data["book_no"] = $_REQUEST["c_books_receipt"];
            $data["book_seq"] = $_REQUEST["c_receipt_no"];
            $data["d_book_date"] = !empty($_REQUEST['d_doc_date']) ? $date->bc_to_ad($_REQUEST['d_doc_date']) : null;
            $data["f_warranty_amt"] = str_replace(',', '', $_REQUEST["f_warranty_amt"]);
            $data["c_remark"] = $_REQUEST["c_comment"];
        } else {
            $data["book_no"] = null;
            $data["book_seq"] = null;
            $data["d_book_date"] = null;
            $data["i_is_percen"] = null;
            $data["f_warranty_amt"] = null;
            $data["c_remark"] = null;
        }

        if (@$_REQUEST["i_is_cashiercheque_warranty"] == 1) {
            $data["cashiercheque_on"] = $_REQUEST["c_books_cashiercheque"];
            $data["cashiercheque_seq"] = $_REQUEST["c_receipt_cashiercheque"];
            $data["d_cashiercheque_data"] = !empty($_REQUEST['d_cashiercheque_date']) ? $date->bc_to_ad($_REQUEST['d_cashiercheque_date']) : null;
            $data["f_warranty_cashiercheque"] = str_replace(',', '', $_REQUEST["f_cashiercheque_warranty_amt2"]);
            $data["c_remark_cashiercheque"] = $_REQUEST["c_comment2"];
        } else {
          $data["cashiercheque_on"] = null;
            $data["cashiercheque_seq"] =  null;
            $data["d_cashiercheque_data"] =  null;
            $data["f_warranty_cashiercheque"] =  null;
            $data["c_remark_cashiercheque"] =  null;
        }

        if (@$_REQUEST["i_is_bank_warranty1"] == 1) {
            $data["book_warranty_no"] = $_REQUEST["c_doc_no"];
            $data["d_book_warranty_date"] = !empty($_REQUEST['d_doc_date1']) ? $date->bc_to_ad($_REQUEST['d_doc_date1']) : null;
            $data["dc_bank_id"] = $_REQUEST["dc_bank_id"];
            $data["f_book_warranty_amt"] = str_replace(',', '', $_REQUEST["f_warranty_amt1"]);
            $data["d_book_warranty_end"] = !empty($_REQUEST['d_expire_warranty']) ? $date->bc_to_ad($_REQUEST['d_expire_warranty']) : null;
            $data["c_remark1"] = $_REQUEST["c_comment1"];
        } else {
            $data["book_warranty_no"] = null;
            $data["d_book_warranty_date"] = null;
            $data["dc_bank_id"] = null;
            $data["f_book_warranty_amt"] = null;
            $data["d_book_warranty_end"] = null;
            $data["c_remark1"] = null;
        }


            $data["dc_cost_id"] = $_SESSION["dc_cost_id"];
            $data["sp_emp_id"] = $_SESSION["sp_emp_id"];
            $data["dc_user_create_id"] = $_SESSION["user_id"];
            $data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
            $data["d_create"] = date("Y-m-d H:i:s");
            $data["dc_user_update_id"] = $_SESSION["user_id"];
            $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
            $data["d_update"] = date("Y-m-d H:i:s");

            foreach ($data as $fldA => $value) {
                $arrValue[]    = ($value != "") ? $value : null;
                $addField    .= ",
                {$fldA} = ?";
            }

            $sql        = "UPDATE sp_tor_contract SET " . substr($addField, 1) . " WHERE sp_tor_contract_id = ? ";
    
            $arrValue[] = $_REQUEST["sp_tor_contract_id"];
            
//            echo $sql; 
//            print_R($arrValue);
//            exit(); 
            
            $stmt   = $db->QueryParam($sql, $arrValue);


        } else { // ADD
            $data["dc_user_create_department_id"] = $_SESSION['dc_department_id'];
            $data["dc_user_create_id"] = $_SESSION["user_id"];
            $data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
            $data["d_create"] = date("Y-m-d H:i:s");
            $data["i_is_notor"] = 1;

            foreach ($data as $fld => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ",
                {$fld}";
                $addValue .= ",
                ? /* {$fld} */";
            }

            $sql = "
                        SET NOCOUNT ON
                        INSERT INTO sp_tor (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                        SELECT @@IDENTITY as id;";
            $para    = $db->QueryParam($sql, $arrValue);
            $ss_id   = $db->Fetch($para);
            $id_tor      = $ss_id["id"];

            $addField = null;
            $addValue = null;
            unset($data);
            unset($arrValue);

            $data["sp_tor_id"] = $id_tor;
            $data["c_doc_ref"] = $_REQUEST["c_contract_no"];
            $data['d_doc_date'] = !empty($_REQUEST['d_contract_date']) ? $date->bc_to_ad($_REQUEST['d_contract_date']) : null;
            $data['d_due_date'] = !empty($_REQUEST['d_due_date']) ? $date->bc_to_ad($_REQUEST['d_due_date']) : null;
            $data["c_name"] = $_REQUEST["c_name"];
            $data["dc_creditor_id"] = $_REQUEST["dc_creditor_id"];
            $data["f_total_amt"] = str_replace(",", "", $_REQUEST["f_total"]);
            $data["i_is_po"] = (@$_REQUEST["i_type_fix_rate"] == null) ? 0 : @$_REQUEST["i_type_fix_rate"];
            if (@$_REQUEST["i_is_bank_warranty0"] == 1) {
                $data["i_is_warranty"] = null;
                $data["i_is_warranty_book"] = null;
            } else {
                $data["i_is_warranty"] = @$_REQUEST["i_is_bank_warranty"];
                $data["i_is_warranty_book"] = @$_REQUEST["i_is_bank_warranty1"];
            }

            if (@$_REQUEST["i_is_expense_monthly"] == 1) {
                $data["i_is_monthly"] = @$_REQUEST["i_is_expense_monthly"];
            } else {
                $data["i_is_monthly"] = null;
            }

          
             if (@$_REQUEST["i_is_bank_warranty0"] == 1) {
            $data["i_is_warranty"] = null;
            $data["cashiercheque_on"] = null;
            $data["i_is_warranty_book"] = null;
        } else {
            $data["i_is_warranty"] = @$_REQUEST["i_is_bank_warranty"];
            $data["cashiercheque_on"] = @$_REQUEST["i_is_cashiercheque_warrantyID"];
            $data["i_is_warranty_book"] = @$_REQUEST["i_is_bank_warranty1"];
        }
        if (@$_REQUEST["i_is_bank_warranty"] == 1) {
            $data["book_no"] = $_REQUEST["c_books_receipt"];
            $data["book_seq"] = $_REQUEST["c_receipt_no"];
            $data["d_book_date"] = !empty($_REQUEST['d_doc_date']) ? $date->bc_to_ad($_REQUEST['d_doc_date']) : null;
            $data["f_warranty_amt"] = str_replace(',', '', $_REQUEST["f_warranty_amt"]);
            $data["c_remark"] = $_REQUEST["c_comment"];
        } else {
            $data["book_no"] = null;
            $data["book_seq"] = null;
            $data["d_book_date"] = null;
            $data["i_is_percen"] = null;
            $data["f_warranty_amt"] = null;
            $data["c_remark"] = null;
        }

        if (@$_REQUEST["i_is_cashiercheque_warranty"] == 1) {
            $data["cashiercheque_on"] = $_REQUEST["c_books_cashiercheque"];
            $data["cashiercheque_seq"] = $_REQUEST["c_receipt_cashiercheque"];
            $data["d_cashiercheque_data"] = !empty($_REQUEST['d_cashiercheque_date']) ? $date->bc_to_ad($_REQUEST['d_cashiercheque_date']) : null;
            $data["f_warranty_cashiercheque"] = str_replace(',', '', $_REQUEST["f_cashiercheque_warranty_amt2"]);
            $data["c_remark_cashiercheque"] = $_REQUEST["c_comment2"];
        } else {
            $data["cashiercheque_on"] = null;
            $data["cashiercheque_seq"] = null;
            $data["d_cashiercheque_data"] = null;
            $data["i_is_percen"] = null;
            $data["f_warranty_cashiercheque"] = null;
            $data["c_remark_cashiercheque"] = null;
        }

        if (@$_REQUEST["i_is_bank_warranty1"] == 1) {
            $data["book_warranty_no"] = $_REQUEST["c_doc_no"];
            $data["d_book_warranty_date"] = !empty($_REQUEST['d_doc_date1']) ? $date->bc_to_ad($_REQUEST['d_doc_date1']) : null;
            $data["dc_bank_id"] = $_REQUEST["dc_bank_id"];
            $data["f_book_warranty_amt"] = str_replace(',', '', $_REQUEST["f_warranty_amt1"]);
            $data["d_book_warranty_end"] = !empty($_REQUEST['d_expire_warranty']) ? $date->bc_to_ad($_REQUEST['d_expire_warranty']) : null;
            $data["c_remark1"] = $_REQUEST["c_comment1"];
        } else {
            $data["book_warranty_no"] = null;
            $data["d_book_warranty_date"] = null;
            $data["dc_bank_id"] = null;
            $data["f_book_warranty_amt"] = null;
            $data["d_book_warranty_end"] = null;
            $data["c_remark1"] = null;
        }

        
            $data["dc_cost_id"] = $_SESSION["dc_cost_id"];
            $data["sp_emp_id"] = $_SESSION["sp_emp_id"];
            $data["dc_user_create_id"] = $_SESSION["user_id"];
            $data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
            $data["d_create"] = date("Y-m-d H:i:s");
            $data["dc_user_update_id"] = $_SESSION["user_id"];
            $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
            $data["d_update"] = date("Y-m-d H:i:s");

            foreach ($data as $fld => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ",
                {$fld}";
                $addValue .= ",
                ? /* {$fld} */";
            }
    
            $sql = "
                    SET NOCOUNT ON
                    INSERT INTO sp_tor_contract (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                    SELECT @@IDENTITY as id;";
            
            $stmt    = $db->QueryParam($sql, $arrValue);
        }
        break;
    case "UP_CONTRACT_NO_TOR_NO_CHECK":

        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);

        $data["i_yyyy"] = $_REQUEST["i_yyyy"];
        $data["dc_expense_budget_type_id"] = $_REQUEST["dc_expense_budget_type_id"];
        $data["po_expense_id"] = $_REQUEST["po_expense_id"];
        $data["dc_cost2_id"] = $_REQUEST["dc_cost2_id"];
        $data["dc_cost_id"] = $_REQUEST["dc_cost_id"];
        $data["tor_type_id"] = $_REQUEST["tor_type_id"];
        $data["i_type_contract"] = $_REQUEST["i_type_contract"];
        $data["f_total_amt"] = str_replace(",", "", $_REQUEST["f_total_amt"]);
        $data["i_is_more"] = (($data["f_total_amt"] >= 500000) ? 1 : 0);
        $data["f_type_amt"] = $data["f_total_amt"];
        $data["i_purchase"] = @$_REQUEST["i_purchase"];
        $data["dc_department_id"] = @$_REQUEST["dc_department_id"];
        $data["sp_emp_id"] = @$_REQUEST["sp_emp_id"];
        if ($data['i_purchase'] == 1) {

            $data["i_hire_type"] = 1; //i_hire_type
            $data["i_product_type"] =  $_REQUEST["i_product_type"];
            $data["i_is_inv"] = @$_REQUEST["i_is_inv"];
            $data["i_type_fix_rate"] = @$_REQUEST["i_type_fix_rate"];
        } else if ($data['i_purchase'] == 2) { 
            $data["i_hire_type"] = @$_REQUEST["i_hire_type"];
            if ($_REQUEST["i_hire_type"] == 1) {
                $data["i_product_type"] =  $_REQUEST["i_product_type"];
                $data["i_is_inv"] = @$_REQUEST["i_is_inv"];
                $data["i_type_fix_rate"] = null;
            } else {
                $data["i_product_type"] = null;
                $data["i_is_inv"] = null;
                $data["i_type_fix_rate"] = null;
            }
        } else if ($data['i_purchase'] == 3) {
            $data["i_hire_type"] = null;
            $data["i_product_type"] = null;
            $data["i_is_inv"] = null;
            $data["i_type_fix_rate"] = null;
        }

        $data["dc_user_update_department_id"] = $_SESSION['dc_department_id'];
        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");
        $data["i_is_notor"] = 1;
        $data["i_is_register"] = 1;
        $data["tor_status_id"] = 20;
        
        if ($_REQUEST["sp_tor_id"] > 0) { // EDIT

            foreach ($data as $fldA => $value) {
                $arrValue[]    = ($value != "") ? $value : null;
                $addField    .= ",
                {$fldA} = ?";
            }

            $sql        = "UPDATE sp_tor_no SET " . substr($addField, 1) . " WHERE tor_id = ? ";
            $arrValue[] = $_REQUEST["sp_tor_id"];
            $db->QueryParam($sql, $arrValue);

            $addField = null;
            $addValue = null;
            unset($data);
            unset($arrValue);

            $data["sp_tor_id"] = $_REQUEST["sp_tor_id"];
            $data["c_doc_ref"] = $_REQUEST["c_contract_no"];
            $data['d_doc_date'] = !empty($_REQUEST['d_contract_date']) ? $date->bc_to_ad($_REQUEST['d_contract_date']) : null;
            $data['d_due_date'] = !empty($_REQUEST['d_due_date']) ? $date->bc_to_ad($_REQUEST['d_due_date']) : null;
            $data["c_name"] = $_REQUEST["c_name"];
            $data["dc_creditor_id"] = $_REQUEST["dc_creditor_id"];
            $data["f_total_amt"] = str_replace(",", "", $_REQUEST["f_total"]);
            $data["i_is_po"] = (@$_REQUEST["i_type_fix_rate"] == null) ? 0 : @$_REQUEST["i_type_fix_rate"];
 

     if (@$_REQUEST["i_is_bank_warranty0"] == 1) {
            $data["i_is_warranty"] = null;
            $data["cashiercheque_on"] = null;
            $data["i_is_warranty_book"] = null;
        } else {
            $data["i_is_warranty"] = @$_REQUEST["i_is_bank_warranty"];
            $data["cashiercheque_on"] = @$_REQUEST["i_is_cashiercheque_warrantyID"];
            $data["i_is_warranty_book"] = @$_REQUEST["i_is_bank_warranty1"];
        }

        if (@$_REQUEST["i_is_expense_monthly"] == 1) {
            $data["i_is_monthly"] = @$_REQUEST["i_is_expense_monthly"];
        } else {
            $data["i_is_monthly"] = null;
        }

        if (@$_REQUEST["i_is_bank_warranty"] == 1) {
            $data["book_no"] = $_REQUEST["c_books_receipt"];
            $data["book_seq"] = $_REQUEST["c_receipt_no"];
            $data["d_book_date"] = !empty($_REQUEST['d_doc_date']) ? $date->bc_to_ad($_REQUEST['d_doc_date']) : null;
            $data["f_warranty_amt"] = str_replace(',', '', $_REQUEST["f_warranty_amt"]);
            $data["c_remark"] = $_REQUEST["c_comment"];
        } else {
            $data["book_no"] = null;
            $data["book_seq"] = null;
            $data["d_book_date"] = null;
            $data["i_is_percen"] = null;
            $data["f_warranty_amt"] = null;
            $data["c_remark"] = null;
        }

        if (@$_REQUEST["i_is_cashiercheque_warranty"] == 1) {
            $data["cashiercheque_on"] = $_REQUEST["c_books_cashiercheque"];
            $data["cashiercheque_seq"] = $_REQUEST["c_receipt_cashiercheque"];
            $data["d_cashiercheque_data"] = !empty($_REQUEST['d_cashiercheque_date']) ? $date->bc_to_ad($_REQUEST['d_cashiercheque_date']) : null;
            $data["f_warranty_cashiercheque"] = str_replace(',', '', $_REQUEST["f_cashiercheque_warranty_amt2"]);
            $data["c_remark_cashiercheque"] = $_REQUEST["c_comment2"];
        } else {
            $data["cashiercheque_on"] = null;
            $data["cashiercheque_seq"] = null;
            $data["d_cashiercheque_data"] = null;
            $data["i_is_percen"] = null;
            $data["f_warranty_cashiercheque"] = null;
            $data["c_remark_cashiercheque"] = null;
        }

        if (@$_REQUEST["i_is_bank_warranty1"] == 1) {
            $data["book_warranty_no"] = $_REQUEST["c_doc_no"];
            $data["d_book_warranty_date"] = !empty($_REQUEST['d_doc_date1']) ? $date->bc_to_ad($_REQUEST['d_doc_date1']) : null;
            $data["dc_bank_id"] = $_REQUEST["dc_bank_id"];
            $data["f_book_warranty_amt"] = str_replace(',', '', $_REQUEST["f_warranty_amt1"]);
            $data["d_book_warranty_end"] = !empty($_REQUEST['d_expire_warranty']) ? $date->bc_to_ad($_REQUEST['d_expire_warranty']) : null;
            $data["c_remark1"] = $_REQUEST["c_comment1"];
        } else {
            $data["book_warranty_no"] = null;
            $data["d_book_warranty_date"] = null;
            $data["dc_bank_id"] = null;
            $data["f_book_warranty_amt"] = null;
            $data["d_book_warranty_end"] = null;
            $data["c_remark1"] = null;
        }


            $data["dc_cost_id"] = $_SESSION["dc_cost_id"];
            $data["sp_emp_id"] = $_SESSION["sp_emp_id"];
            $data["dc_user_create_id"] = $_SESSION["user_id"];
            $data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
            $data["d_create"] = date("Y-m-d H:i:s");
            $data["dc_user_update_id"] = $_SESSION["user_id"];
            $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
            $data["d_update"] = date("Y-m-d H:i:s");

            foreach ($data as $fldA => $value) {
                $arrValue[]    = ($value != "") ? $value : null;
                $addField    .= ",
                {$fldA} = ?";
            }

            $sql        = "UPDATE sp_tor_contract_no SET " . substr($addField, 1) . " WHERE sp_tor_contract_id = ? ";
            $arrValue[] = $_REQUEST["sp_tor_contract_id"];
            $stmt   = $db->QueryParam($sql, $arrValue);


        } else { // ADD
            $data["dc_user_create_department_id"] = $_SESSION['dc_department_id'];
            $data["dc_user_create_id"] = $_SESSION["user_id"];
            $data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
            $data["d_create"] = date("Y-m-d H:i:s");
            $data["i_is_notor"] = 1;

            foreach ($data as $fld => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ",
                {$fld}";
                $addValue .= ",
                ? /* {$fld} */";
            }

            $sql = "
                        SET NOCOUNT ON
                        INSERT INTO sp_tor_no (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                        SELECT @@IDENTITY as id;";
            $para    = $db->QueryParam($sql, $arrValue);
            $ss_id   = $db->Fetch($para);
            $id_tor      = $ss_id["id"];

            $addField = null;
            $addValue = null;
            unset($data);
            unset($arrValue);

            $data["sp_tor_id"] = $id_tor;
            $data["c_doc_ref"] = $_REQUEST["c_contract_no"];
            $data['d_doc_date'] = !empty($_REQUEST['d_contract_date']) ? $date->bc_to_ad($_REQUEST['d_contract_date']) : null;
            $data['d_due_date'] = !empty($_REQUEST['d_due_date']) ? $date->bc_to_ad($_REQUEST['d_due_date']) : null;
            $data["c_name"] = $_REQUEST["c_name"];
            $data["dc_creditor_id"] = $_REQUEST["dc_creditor_id"];
            $data["f_total_amt"] = str_replace(",", "", $_REQUEST["f_total"]);
            $data["i_is_po"] = (@$_REQUEST["i_type_fix_rate"] == null) ? 0 : @$_REQUEST["i_type_fix_rate"];
        if (@$_REQUEST["i_is_bank_warranty0"] == 1) {
            $data["i_is_warranty"] = null;
            $data["cashiercheque_on"] = null;
            $data["i_is_warranty_book"] = null;
        } else {
            $data["i_is_warranty"] = @$_REQUEST["i_is_bank_warranty"];
            $data["cashiercheque_on"] = @$_REQUEST["i_is_cashiercheque_warrantyID"];
            $data["i_is_warranty_book"] = @$_REQUEST["i_is_bank_warranty1"];
        }

        if (@$_REQUEST["i_is_expense_monthly"] == 1) {
            $data["i_is_monthly"] = @$_REQUEST["i_is_expense_monthly"];
        } else {
            $data["i_is_monthly"] = null;
        }

        if (@$_REQUEST["i_is_bank_warranty"] == 1) {
            $data["book_no"] = $_REQUEST["c_books_receipt"];
            $data["book_seq"] = $_REQUEST["c_receipt_no"];
            $data["d_book_date"] = !empty($_REQUEST['d_doc_date']) ? $date->bc_to_ad($_REQUEST['d_doc_date']) : null;
            $data["f_warranty_amt"] = str_replace(',', '', $_REQUEST["f_warranty_amt"]);
            $data["c_remark"] = $_REQUEST["c_comment"];
        } else {
            $data["book_no"] = null;
            $data["book_seq"] = null;
            $data["d_book_date"] = null;
            $data["i_is_percen"] = null;
            $data["f_warranty_amt"] = null;
            $data["c_remark"] = null;
        }

        if (@$_REQUEST["i_is_cashiercheque_warranty"] == 1) {
            $data["cashiercheque_on"] = $_REQUEST["c_books_cashiercheque"];
            $data["cashiercheque_seq"] = $_REQUEST["c_receipt_cashiercheque"];
            $data["d_cashiercheque_data"] = !empty($_REQUEST['d_cashiercheque_date']) ? $date->bc_to_ad($_REQUEST['d_cashiercheque_date']) : null;
            $data["f_warranty_cashiercheque"] = str_replace(',', '', $_REQUEST["f_cashiercheque_warranty_amt2"]);
            $data["c_remark_cashiercheque"] = $_REQUEST["c_comment2"];
        } else {
            $data["cashiercheque_on"] = null;
            $data["cashiercheque_seq"] = null;
            $data["d_cashiercheque_data"] = null;
            $data["i_is_percen"] = null;
            $data["f_warranty_cashiercheque"] = null;
            $data["c_remark_cashiercheque"] = null;
        }

        if (@$_REQUEST["i_is_bank_warranty1"] == 1) {
            $data["book_warranty_no"] = $_REQUEST["c_doc_no"];
            $data["d_book_warranty_date"] = !empty($_REQUEST['d_doc_date1']) ? $date->bc_to_ad($_REQUEST['d_doc_date1']) : null;
            $data["dc_bank_id"] = $_REQUEST["dc_bank_id"];
            $data["f_book_warranty_amt"] = str_replace(',', '', $_REQUEST["f_warranty_amt1"]);
            $data["d_book_warranty_end"] = !empty($_REQUEST['d_expire_warranty']) ? $date->bc_to_ad($_REQUEST['d_expire_warranty']) : null;
            $data["c_remark1"] = $_REQUEST["c_comment1"];
        } else {
            $data["book_warranty_no"] = null;
            $data["d_book_warranty_date"] = null;
            $data["dc_bank_id"] = null;
            $data["f_book_warranty_amt"] = null;
            $data["d_book_warranty_end"] = null;
            $data["c_remark1"] = null;
        }

            $data["dc_cost_id"] = $_SESSION["dc_cost_id"];
            $data["sp_emp_id"] = $_SESSION["sp_emp_id"];
            $data["dc_user_create_id"] = $_SESSION["user_id"];
            $data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
            $data["d_create"] = date("Y-m-d H:i:s");
            $data["dc_user_update_id"] = $_SESSION["user_id"];
            $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
            $data["d_update"] = date("Y-m-d H:i:s");

            foreach ($data as $fld => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ",
                {$fld}";
                $addValue .= ",
                ? /* {$fld} */";
            }

            $sql = "
                    SET NOCOUNT ON
                    INSERT INTO sp_tor_contract_no (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                    SELECT @@IDENTITY as id;";
            $stmt    = $db->QueryParam($sql, $arrValue);
        }
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
