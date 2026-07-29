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
        case "LIST_OVERLAPCONFIRM":
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
                if ($_REQUEST['i_post1'] == 1) {
                    $wh .= " and a.sp_emp_id =" . $_SESSION['sp_emp_id'];
                }
                if ($i_post != 0) {
                    if ($i_post == 1) {
                        $wh .= " and tor_status_id is not null";
                    } else {
                        $wh .= " and tor_status_id is null";
                    }
                }       
            } 
            $user_type = $_SESSION['i_type_user'] ?? null;
            $user_level = $_SESSION['i_level'] ?? null;
    
            if($user_type == 2){
                $wh_user = $wh    ; //$util->viewDepartment('a', $_SESSION["dc_department_id"]);
    
                // echo 1 ;
            } else {
                if($user_level == 3){
                $wh_user = $wh ." and a.sp_emp_id = {$_SESSION["sp_emp_id"]} " ;
                }else {
                $wh_user = $wh ." and cc.dc_department_id = {$_SESSION["dc_department_id"]} ";
                } 
            }
            // echo   $wh_user ;
            // exit ;
            $sqlTempTable = "select 
                                    ROW_NUMBER() OVER (ORDER BY b.sp_tor_contract_id ) AS row
                                    , b.sp_tor_contract_id 
                                    FROM sp_tor_contract a 
                                left join sp_tor_hdr_period b on a.sp_tor_contract_id = b.sp_tor_contract_id 
                                inner join dbo.sp_tor cc on  a.sp_tor_id = cc.tor_id
                                left join sp_check_period_hdr c on b.sp_tor_hdr_period_id = c.sp_tor_hdr_period_id
                                        where c.c_code is null
                                    and a.c_code  is not null
                                    and NOT EXISTS (select 1 from dbo.sp_check_period_hdr where isnull(c_code,'')!='' and sp_tor_hdr_period_id = b.sp_tor_hdr_period_id)
                                    and cc.i_type_bg <> 4 and i_type_bg <> 2 and a.i_enabled  = 1 and cc.i_enabled = 1 
                                    {$wh_user}
                                GROUP BY  b.sp_tor_contract_id
                                        ";
                                        // ."{$wh_emp}" 
                                        // ."{$waudit}"
                                        // . $wh . $util->viewDepartment('a', $_SESSION["dc_department_id"]); //
    
        // echo   $sqlTempTable ;
        // exit ;
            $arrParam[] = $start;
            $arrParam[] = $limit;
            $sqlMain = "SELECT   a.row, a.sp_tor_contract_id	
                                , b.c_name
                                , c.tor_type_id 
                                , CONVERT(VARCHAR, b.d_doc_date, 120) AS d_doc_date
                                , CONVERT(VARCHAR, b.d_due_date, 120) AS d_due_date
                                , b.sp_tor_id	 
                                , b.c_code 
                                , b.c_name 
                                , c.i_yyyy
                                , c.d_doc_ref
                                , b.f_total_amt
                                , c.po_expense_id
                                , c.dc_cost_id
                                , c.dc_cost2_id
                                , c.sp_emp_id 
                                , c.c_code as pr_code
                                , (select c_name from sp_emp where c.sp_emp_id = sp_emp_id) as sp_emp_name
                                ,(select top 1 c_tax_number_imp from  nmu..dc_creditor where dc_creditor_id = b.dc_creditor_id)  as c_tax_number_imp
                                ,(select top 1 inv_name from  nmu..dc_creditor where dc_creditor_id = b.dc_creditor_id) as inv_name
                                , (select top 1 c_name from dbo.sp_type_status where sp_type_status_id=c.tor_type_id)  as c_type_name
                                , (select top 1 c_name from dbo.dc_expense_budget_type where c.dc_expense_budget_type_id = dc_expense_budget_type_id ) as dc_expense_budget_type_idTxt
                                , (select top 1 c_name from nmu.dbo.bg_expense where c.po_expense_id = bg_expense_id )	as  text_po_expense
                                , (SELECT TOP 1 c_name FROM dbo.sp_department  WHERE dc_department_id=c.dc_department_id)  AS dc_department_name
                                , ISNULL(c.i_purchase,1) AS i_purchase  
                                , (SELECT TOP 1 c_name FROM dbo.dc_cost WHERE dc_cost_id=c.dc_cost_id)  AS dc_cost_idTxt
                                , (SELECT TOP 1 c_name FROM dbo.dc_cost WHERE dc_cost_id=c.dc_cost2_id)  AS dc_cost2_idTxt
                                , (SELECT TOP 1 c_full_name FROM dbo.dc_user WHERE dc_user_id=b.dc_user_create_id) AS c_create_name
                                , (SELECT TOP 1 c_name FROM dbo.dc_cost WHERE dc_cost_id=b.dc_user_create_cost_id) AS c_cost_creat_name
                                , CONVERT(VARCHAR, b.d_create, 120) AS d_create
                                , (SELECT TOP 1 c_full_name FROM dbo.dc_user WHERE dc_user_id=b.dc_user_update_id) AS c_update_name
                                , (SELECT TOP 1 c_name FROM dbo.dc_cost WHERE dc_cost_id=b.dc_user_update_cost_id) AS c_cost_update_name
                                , CONVERT(VARCHAR, b.d_update, 120) AS d_update
                                    ,c.dc_expense_budget_type_id
                                FROM"
                                . "  ({$sqlTempTable}) a  
                            inner join dbo.sp_tor_contract b on b.sp_tor_contract_id  = a.sp_tor_contract_id
                            inner join dbo.sp_tor c on  b.sp_tor_id = c.tor_id
                                WHERE a.row > ? AND a.row <= ?
                                order by a.row
                            ";
    //   echo $sqlMain; exit();
    // /******echo sql******/
    // $sql = (@$sqlMain) ? $sqlMain : $sql;
    // $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());
    
    // $sql = str_replace('?', '#-#', $sql);
    // foreach ($arr as $fld => $value) {
    // $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
    // }
    // echo $sql; exit;
    /********************/
            $stmt       = $db->QueryParam($sqlMain, $arrParam);
            $i          = $start + 1;
            $i_purchase = array(1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
            while ($row = $db->Fetch($stmt)) {
                $temp = array(
                    "no" => $i++,
                    "id" => intval($row["sp_tor_id"]),
                    "row" => intval($row["row"]),
                    "tor_type_id" => intval($row["tor_type_id"]),
                    "c_type_name" => $row["c_type_name"],
                    "sp_tor_contract_id" => $row["sp_tor_contract_id"],
                    "c_name" => $row["c_name"],
                    "c_code" => $row["c_code"],
                    "pr_code" => $row["pr_code"],  // ควรทำ
                    "d_doc_ref" => $row["d_doc_ref"], 
                    "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
                    "po_expense_id" => intval($row["po_expense_id"]),
                    "dc_cost_id" => intval($row["dc_cost_id"]),
                    "dc_cost2_id" => intval($row["dc_cost2_id"]),
                    "c_tax_number_imp" => intval($row["c_tax_number_imp"]),
                    "inv_name" => $row["inv_name"],
                    "i_purchase" => intval($row["i_purchase"]),
                    "dc_cost_idTxt" => $row["dc_cost_idTxt"],
                    "dc_cost2_idTxt" => $row["dc_cost2_idTxt"],
                    // "dc_cost2_idTxt" => $row["dc_cost2_idTxt"],

                    "i_year" => intval($row["i_yyyy"]),
                    "c_year" => intval($row["i_yyyy"] + 543),
                    // "c_emp_name" => $row["c_emp_name"],
                    "sp_emp_id" => intVal($row["sp_emp_id"]),
                    "txtsp_emp_idID" => $row["sp_emp_name"],
                    "txtdc_department_idID" => $row["dc_department_name"],
                    "dc_expense_budget_type_idTxt" => $row["dc_expense_budget_type_idTxt"],
                    "text_po_expense" => $row["text_po_expense"],
                    // "text_dc_cost" => $row["text_dc_cost"],
                    // "text_dc_cost2" => $row["text_dc_cost2"],
                    "f_total_amt" => number_format($row["f_total_amt"], 2),
    
                    "d_doc_date" => ((empty($row["d_doc_date"])) ? "" : $date->extDateBuddha($row["d_doc_date"])), //d_doc_date
                    "d_due_date" => ((empty($row["d_due_date"])) ? "" : $date->extDateBuddha($row["d_due_date"])), //d_due_date

    
                    "dc_user_create_id" => $row["c_create_name"],
                    "dc_user_create_cost_id" => $row["c_cost_creat_name"],
                    "d_create" => $date->extDateBuddha($row["d_create"]), //
                    "dc_user_update_id" => $row["c_update_name"],
                    "dc_user_update_cost_id" => $row["c_cost_update_name"],
                    "d_update" => $date->extDateBuddha($row["d_update"]),
                );
                ${$root}[] = $temp;
            }
    
            $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
            $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
            echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
            exit(); 
            break;
    case "LIST_OVERLAPCONFIRM1":
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
            $wh .= ($_REQUEST['c_name'] != "") ? " and a.c_name like '%" . $_REQUEST['c_name'] . "%'" : "";     
            if ($_REQUEST['i_post1'] == 1) {
                $wh .= " and a.sp_emp_id =" . $_SESSION['sp_emp_id'];
            }
            if ($i_post != 0) {
                if ($i_post == 1) {
                    $wh .= " and tor_status_id is not null";
                } else {
                    $wh .= " and tor_status_id is null";
                }
            }       
        } 
        $user_type = $_SESSION['i_type_user'] ?? null;
        $user_level = $_SESSION['i_level'] ?? null;

        if($user_type == 2){
            $wh_user = $wh    ; //$util->viewDepartment('a', $_SESSION["dc_department_id"]);

            // echo 1 ;
        } else {
            if($user_level == 3){
            $wh_user = $wh ." and a.sp_emp_id = {$_SESSION["sp_emp_id"]} " ;
            }else {
            $wh_user = $wh ."and a.dc_department_id = {$_SESSION["dc_department_id"]}";
            } 
        }
        // echo   $wh_user ;
        // exit ;
        $sqlTempTable = "SELECT ROW_NUMBER() OVER (ORDER BY a.tor_id DESC) AS row
                                , a.tor_id  
                                , (select c_code from dbo.sp_tor_contract where sp_tor_id = a.tor_id ) as con_id
                            FROM sp_tor a 
                                WHERE a.i_is_notor <> 1 
                                    and a.i_type_bg= 1
                                    and a.i_enabled = 1 
                                    and a.tor_status_id <> 25 
                                    and a.tor_status_id <> 24
                                    and a.tor_status_id <> 26 
                                    and isnull(a.c_code,'') != '' 
                                    and NOT EXISTS (select 1 from dbo.sp_tor_contract where isnull(c_code,'')!='' and sp_tor_id = a.tor_id)
                                    {$wh_user}
                                    ";
                                    // ."{$wh_emp}" 
                                    // ."{$waudit}"
                                    // . $wh . $util->viewDepartment('a', $_SESSION["dc_department_id"]); //

    // echo   $sqlTempTable ;
    // exit ;
        $arrParam[] = $start;
        $arrParam[] = $limit;
        $sqlMain = "    SELECT *"
                . " , c.sp_tor_id"
                . " , c.sp_tor_contract_id"
                . " , b.c_code"
                . " , b.c_name"
                . " , b.i_yyyy
                    , b.d_doc_ref
                    , b.f_total_amt
                    , b.tor_type_id
                    , b.dc_expense_budget_type_id
                    , b.po_expense_id
                    , b.dc_cost_id
                    , b.dc_cost2_id

                    , (select top 1 c_name from dbo.sp_type_status where sp_type_status_id=b.tor_type_id)  as c_type_name
                    , (select top 1 c_name from dbo.dc_expense_budget_type where b.dc_expense_budget_type_id = dc_expense_budget_type_id ) as dc_expense_budget_type_idTxt
					, (select top 1 c_name from nmu.dbo.bg_expense where b.po_expense_id = bg_expense_id )	as  text_po_expense
					, (select top 1 c_name from dbo.dc_cost where b.dc_cost2_id = dc_cost_id ) as text_dc_cost2
					, (select top 1 c_name from dbo.dc_cost where b.dc_cost_id = dc_cost_id ) as text_dc_cost
					, CONVERT(VARCHAR, b.d_tor_date, 120) AS d_tor_date
                    , (SELECT TOP 1 c_name FROM dbo.sp_department  WHERE dc_department_id=b.dc_department_id)  AS dc_department_name
                            , (select top 1 c_name from dbo.sp_emp where sp_emp_id=b.sp_emp_id)  as sp_emp_name
                            , (SELECT TOP 1 c_name FROM dbo.sp_emp  WHERE sp_emp_id=b.sp_emp_id)  AS c_emp_name
                            , (SELECT TOP 1 c_code FROM dbo.sp_status_hdr WHERE sp_status_hdr_id=b.tor_status_id)  AS c_code_status
                            , (SELECT TOP 1 c_name FROM dbo.sp_status_hdr WHERE sp_status_hdr_id=b.tor_status_id)  AS c_name_status
                            , (SELECT TOP 1 c_name FROM dbo.sp_type_status WHERE sp_type_status_id=b.tor_type_id)  AS c_type_name
                            , ISNULL(b.i_purchase,1) AS i_purchase
                    , (SELECT TOP 1 c_name FROM dbo.sp_status_hdr WHERE sp_status_hdr_id=b.tor_status_id)  AS c_sp_status_hdr       
                    , (SELECT TOP 1 c_name FROM dbo.dc_cost WHERE dc_cost_id=b.dc_cost_id)  AS dc_cost_idTxt
                    , (SELECT TOP 1 c_name FROM dbo.dc_cost WHERE dc_cost_id=b.dc_cost2_id)  AS dc_cost2_idTxt
                    , (SELECT TOP 1 c_full_name FROM dbo.dc_user WHERE dc_user_id=b.dc_user_create_id) AS c_create_name
                    , (SELECT TOP 1 c_name FROM dbo.dc_cost WHERE dc_cost_id=b.dc_user_create_cost_id) AS c_cost_creat_name
                    , CONVERT(VARCHAR, b.d_create, 120) AS d_create
                    , (SELECT TOP 1 c_full_name FROM dbo.dc_user WHERE dc_user_id=b.dc_user_update_id) AS c_update_name
                    , (SELECT TOP 1 c_name FROM dbo.dc_cost WHERE dc_cost_id=b.dc_user_update_cost_id) AS c_cost_update_name
                    , CONVERT(VARCHAR, b.d_update, 120) AS d_update
                "
    
                . " FROM ({$sqlTempTable}) a  
                        inner join dbo.sp_tor b on b.tor_id = a.tor_id
                        LEFT JOIN dbo.sp_tor_contract c on c.sp_tor_id = a.tor_id
                        WHERE a.row > ? AND a.row <= ?
                        order by a.row
                        ";
//   echo $sqlMain; exit();
// /******echo sql******/
// $sql = (@$sqlMain) ? $sqlMain : $sql;
// $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());

// $sql = str_replace('?', '#-#', $sql);
// foreach ($arr as $fld => $value) {
//  $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
// }
// echo $sql; exit;
// /********************/
        $stmt       = $db->QueryParam($sqlMain, $arrParam);
        $i          = $start + 1;
        $i_purchase = array(1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "id" => intval($row["tor_id"]),
                "sp_tor_id" => intval($row["sp_tor_id"]),
                "tor_type_id" => intval($row["tor_type_id"]),
                "c_type_name" => $row["c_type_name"],
                "sp_tor_contract_id" => $row["sp_tor_contract_id"],
                "c_name" => $row["c_name"],
                "c_code" => $row["c_code"],
                "c_sp_status_hdr" => $row["c_sp_status_hdr"],
                "d_doc_ref" => $row["d_doc_ref"],
                "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
                "po_expense_id" => intval($row["po_expense_id"]),
                "dc_cost_id" => intval($row["dc_cost_id"]),
                "dc_cost2_id" => intval($row["dc_cost2_id"]),

                "i_year" => intval($row["i_yyyy"]),
                "c_year" => intval($row["i_yyyy"] + 543),
                "c_emp_name" => $row["c_emp_name"],
                "sp_emp_id" => intVal($row["sp_emp_id"]),
                "txtsp_emp_idID" => $row["sp_emp_name"],
                "txtdc_department_idID" => $row["dc_department_name"],
                "dc_expense_budget_type_idTxt" => $row["dc_expense_budget_type_idTxt"],
                "text_po_expense" => $row["text_po_expense"],
                "text_dc_cost" => $row["text_dc_cost"],
                "text_dc_cost2" => $row["text_dc_cost2"],
                "f_total_amt" => number_format($row["f_total_amt"], 2),

                "d_tor_date" => ((empty($row["d_tor_date"])) ? "" : $date->extDateBuddha($row["d_tor_date"])), //d_tor_date


                "dc_user_create_id" => $row["c_create_name"],
                "dc_user_create_cost_id" => $row["c_cost_creat_name"],
                "d_create" => $date->extDateBuddha($row["d_create"]), //
                "dc_user_update_id" => $row["c_update_name"],
                "dc_user_update_cost_id" => $row["c_cost_update_name"],
                "d_update" => $date->extDateBuddha($row["d_update"]),
            );
            ${$root}[] = $temp;
        }

        $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
        $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
        echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
        exit(); 
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
