<?php

//-- mnContractCode
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");



$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();
$table = "dbo.sp_tor";
$keyName = "tor_id";

$mode = $_REQUEST["mode"] ?? null;

$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;
$re_id = null;
$stmt2 = true;
$stmt3 = true;
$stmt4 = true;
$db->BeginTran();

// Users who can see the record may edit it, including after child POs exist.
// Match List_DeliveryStep.php visibility: all records, department, or employee.
if (in_array($mode, array('CHECK_PROJECT_EDIT', 'Edit_contrct', 'DISABLE_PROJECT_CONTRACT'), true)) {
    $accessStmt = $db->QueryParam(
        "SELECT CONVERT(VARCHAR, c.d_start_date, 120) AS saved_start_date, c.sp_tor_id, employee.dc_department_id AS visible_department_id, employee.sp_emp_id AS visible_employee_id,
            (SELECT TOP 1 c_name FROM " . DB_CENTER . "dc_cost WHERE dc_cost_id = t.dc_cost_id) AS responsible_name,
            (SELECT TOP 1 c_name FROM " . DB_CENTER . "dc_cost WHERE dc_cost_id = t.dc_cost2_id) AS owner_name
         FROM sp_tor_contract c WITH (UPDLOCK, HOLDLOCK)
         INNER JOIN sp_tor t ON t.tor_id = c.sp_tor_id
         INNER JOIN sp_emp employee ON employee.sp_emp_id = t.sp_emp_id
         INNER JOIN NMU.dbo.dc_creditor creditor ON creditor.dc_creditor_id = c.dc_creditor_id
         WHERE c.sp_tor_contract_id = ? AND c.i_enabled = 1",
        array((int) ($_REQUEST['sp_tor_contract_id'] ?? 0))
    );
    $access = $accessStmt ? $db->Fetch($accessStmt) : null;
    $admin = (int) ($_SESSION['dc_center_user'] ?? 0) === 1;
    $visibilityLevel = (int) ($_SESSION['i_level'] ?? 0);
    $visible = $access && (
        $visibilityLevel === 1 ||
        ($visibilityLevel === 2 && (int) ($_SESSION['dc_department_id'] ?? 0) > 0 &&
            (int) $access['visible_department_id'] === (int) $_SESSION['dc_department_id']) ||
        ($visibilityLevel === 3 && (int) ($_SESSION['sp_emp_id'] ?? 0) > 0 &&
            (int) $access['visible_employee_id'] === (int) $_SESSION['sp_emp_id'])
    );
    $allowed = !empty($_SESSION['user_id']) && $visible;
    if ($mode === 'CHECK_PROJECT_EDIT' || !$allowed) {
        $db->RollBackTran();
        echo json_encode(array('success' => (bool) $allowed, 'can_edit' => (bool) $allowed,
            'responsible_name' => $access['responsible_name'] ?? '', 'owner_name' => $access['owner_name'] ?? '',
            'd_start_date' => $allowed && !empty($access['saved_start_date']) ? $date->extDateBuddha($access['saved_start_date']) : '',
            'msg' => 'คุณไม่มีสิทธิ์เห็นรายการนี้'));
        exit;
    }
    // Bind all updates and history to the contract actually checked above.
    $_REQUEST['sp_tor_id'] = $access['sp_tor_id'];
    if (!$admin) {
        $_REQUEST['edit_project_details'] = 1;
        $_REQUEST['i_type_update'] = 1;
    }
}




 switch ($mode) {
    case "DISABLE_PROJECT_CONTRACT":
        $auditValues = array($_SESSION['user_id'], $_SESSION['dc_cost_id'], date('Y-m-d H:i:s'));
        $sql = "UPDATE dbo.sp_tor_contract SET i_enabled = 2, dc_user_update_id = ?, dc_user_update_cost_id = ?, d_update = ? WHERE sp_tor_contract_id = ? AND sp_tor_id = ?";
        $stmt = $db->QueryParam($sql, array_merge($auditValues, array((int) $_REQUEST['sp_tor_contract_id'], (int) $access['sp_tor_id'])));
        $sql2 = "UPDATE dbo.sp_tor SET i_enabled = 2, dc_user_update_id = ?, dc_user_update_cost_id = ?, d_update = ? WHERE tor_id = ?";
        $stmt2 = $stmt && $db->QueryParam($sql2, array_merge($auditValues, array((int) $access['sp_tor_id'])));
        break;

    case "Edit_contrct":
        $arrParam = array();
        $arrValue = array();
        $addField = "";
        $addValue = "";
        $COUNT_EDIT = $db->GetDataBySQL("select COUNT(sp_tor_id) as sp_tor_id  from sp_tor_contract_edit where i_enabled = 1 and sp_tor_id = ? group by sp_tor_id  ", array($_REQUEST["sp_tor_id"]));
        $stmt3 = $db->QueryParam("select  
        CONVERT(VARCHAR, d_doc_date, 120) AS d_doc_date 
        ,CONVERT(VARCHAR, d_due_date, 120) AS d_due_date 
        , f_total_amt  
        from sp_tor_contract where sp_tor_contract_id = ?;", array($_REQUEST["sp_tor_contract_id"]));
        $row = $db->Fetch($stmt3);
        $arrParam["sp_tor_id"] = $_REQUEST["sp_tor_id"];
        $arrParam["sp_tor_contract_id"] = $_REQUEST["sp_tor_contract_id"];
        $arrParam["i_enabled"] = $_REQUEST["i_enabled"];
        $arrParam["c_comment"] = $_REQUEST["c_comment"];
        $arrParam["i_type"] = $_REQUEST["i_type_update"]??null;
        $arrParam["row_edit"] = $COUNT_EDIT + 1 ;
        $arrParam["i_type_guarantee"] = $_REQUEST["i_type_guarantee"];
        $arrParam['d_doc_date'] = $row['d_doc_date']; 
        $arrParam['d_due_date'] = $row['d_due_date']; 
        $arrParam["f_total_amt"] = str_replace(",", "", $row["f_total_amt"]);

        $arrParam["dc_user_create_id"] = $_SESSION["user_id"];
        $arrParam["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
        $arrParam["d_create"] = date("Y-m-d H:i:s");
        $arrParam["dc_user_update_id"] = $_SESSION["user_id"];
        $arrParam["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $arrParam["d_update"] = date("Y-m-d H:i:s");
        foreach ($arrParam as $fld => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField .= ", {$fld}";
            $addValue .= ", ?";
        }
        $sql = "INSERT INTO sp_tor_contract_edit (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                SELECT @@IDENTITY as id;";
        // $arrValue[] = $data["id"];
        $stmt = $db->QueryParam($sql, $arrValue);
        unset($arrParam);      
        unset($addField);      
        unset($arrValue);      
        $arrValue = array();
        $addField = "";

        $arrParam['d_doc_date'] = !empty($_REQUEST['d_doc_date']) ? $date->bc_to_ad($_REQUEST['d_doc_date']) : null;
        $arrParam['d_due_date'] = !empty($_REQUEST['d_due_date']) ? $date->bc_to_ad($_REQUEST['d_due_date']) : null;
        $arrParam["f_total_amt"] = str_replace(",", "", $_REQUEST["f_total_amt"]);

        // The ongoing-project editor submits these additional contract fields.
        if (!empty($_REQUEST['edit_project_details'])) {
            $arrParam['c_name'] = $_REQUEST['c_name'];
            $arrParam['d_start_date'] = !empty($_REQUEST['d_start_date']) ? $date->bc_to_ad($_REQUEST['d_start_date']) : null;
            $arrParam['dc_cost_id'] = $_REQUEST['dc_cost_id'];
            $arrParam['dc_expense_budget_type_id'] = $_REQUEST['dc_expense_budget_type_id'];
            $arrParam['i_type_guarantee'] = $_REQUEST['i_type_guarantee'];
        }

        $arrParam["dc_user_update_id"] = $_SESSION["user_id"];
        $arrParam["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $arrParam["d_update"] = date("Y-m-d H:i:s");
        foreach ($arrParam as $fldA2 => $value2) {
            $arrValue[] = ($value2 != "") ? $value2 : null;
            $addField .= ", {$fldA2} = ?";
        }
        $arrValue[]  = $_REQUEST['sp_tor_contract_id'];
        $sql2 = "UPDATE sp_tor_contract SET " . substr($addField, 1) . " WHERE sp_tor_contract_id =  ?";
        $stmt2 = $db->QueryParam($sql2, $arrValue);
        if (!empty($_REQUEST['edit_project_details'])) {
            $stmt4 = $db->QueryParam(
                "UPDATE sp_tor SET c_name = ?, dc_cost_id = ?, dc_cost2_id = ?, po_expense_id = ?, dc_expense_budget_type_id = ?, tor_type_id = ?, dc_user_update_id = ?, dc_user_update_cost_id = ?, d_update = ? WHERE tor_id = ? AND tor_id = (SELECT sp_tor_id FROM sp_tor_contract WHERE sp_tor_contract_id = ?)",
                array($_REQUEST['c_name'], $_REQUEST['dc_cost_id'], $_REQUEST['dc_cost2_id'], $_REQUEST['po_expense_id'], $_REQUEST['dc_expense_budget_type_id'], $_REQUEST['stor_type_id'], $_SESSION['user_id'], $_SESSION['dc_cost_id'], date('Y-m-d H:i:s'), $_REQUEST['sp_tor_id'], $_REQUEST['sp_tor_contract_id'])
            );
        }


        break;
    case "DELETE_EDIT_CONTRACT": 
        unset($arrParam);      
        $arrParam = array();
        $arrParam[] = $_REQUEST["i_enabled"];  
        $arrParam[] = $_REQUEST["sp_tor_contract_editid"] ?? null; 
        $sql = "UPDATE dbo.sp_tor_contract_edit SET i_enabled =?    WHERE sp_tor_contract_editid = ?"; 
        $stmt = $db->QueryParam($sql, $arrParam);
        break;
 }
if ($stmt && $stmt2 && $stmt3 && $stmt4) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => true, "msg" => "บันทึกเรียบร้อยแล้ว", "id" => $re_id);
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => false, "msg" => "check statement : {$sql}");
}

echo json_encode($re);
exit;
