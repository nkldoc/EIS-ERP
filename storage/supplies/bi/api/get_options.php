<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");

$db = new DatabaseServer();
$root = "data";
$data = array();

$type = $_GET['type'] ?? '';

if ($type == 'dc_cost') {
    // Owner Unit (หน่วยงานเจ้าของเรื่อง) - usually dc_cost
    $sql = "SELECT dc_cost_id, c_code, c_name FROM " . DB_CENTER . "dc_cost WHERE i_enable=1 AND i_delete=2   AND dc_cost_acc_id = 77  ORDER BY c_code";
    $stmt = $db->Query($sql);
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            ${$root}[] = array(
                "id" => $row['dc_cost_id'],
                "name" => $row['c_code'] . " : " . $row['c_name']
            );
        }
    }
} elseif ($type == 'status') {
    // Status (สถานะ) - sp_status_hdr
    $sql = "SELECT sp_status_hdr_id, c_code, c_name FROM sp_status_hdr WHERE 1 = 1 ORDER BY sp_status_hdr_id";
    $stmt = $db->Query($sql);
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            ${$root}[] = array(
                "id" => $row['sp_status_hdr_id'],
                "name" => $row['c_name']
            );
        }
    }
} elseif ($type == 'dc_expense_budget_type') {
    // Source of Funds (แหล่งเงิน)
    $sql = "SELECT dc_expense_budget_type_id, c_code, c_name FROM " . DB_CENTER . "dc_expense_budget_type WHERE i_enable=1 ORDER BY c_code";
    $stmt = $db->Query($sql);
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            ${$root}[] = array(
                "id" => $row['dc_expense_budget_type_id'],
                "name" => $row['c_code'] . " : " . $row['c_name']
            );
        }
    }
} elseif ($type == 'po_expense') {
    // Expense Category (หมวดค่าใช้จ่าย)
    $sql = "SELECT bg_expense_id as id, c_code, c_name FROM " . DB_NMU_EIS . "bg_expense WHERE i_enable=1  and i_level = 4   ORDER BY c_code";
    $stmt = $db->Query($sql);
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            ${$root}[] = array(
                "id" => $row['id'],
                "name" => $row['c_code'] . " : " . $row['c_name']
            );
        }
    }
}

echo json_encode(array($root => ${$root} ?? []));
