<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

if (!isset($_SESSION['user_id'])) {
    echo json_encode(array("success" => false, "msg" => "Unauthorized Access"));
    exit;
}

$db = new DatabaseServer();

// สร้างตารางถ้ายังไม่มี
try {
    $checkTableSql = "IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='sp_tor_contract_budget_reserve' AND xtype='U')
    BEGIN
        CREATE TABLE sp_tor_contract_budget_reserve (
            sp_tor_contract_budget_reserve_id INT IDENTITY(1,1) PRIMARY KEY,
            sp_tor_contract_id INT NOT NULL,
            f_reserve_money NUMERIC(18, 2) DEFAULT 0,
            f_budget NUMERIC(18, 2) DEFAULT 0,
            i_enable INT DEFAULT 1,
            c_create_by VARCHAR(50),
            d_create_dt DATETIME DEFAULT GETDATE(),
            c_last_modify_by VARCHAR(50),
            d_last_modify_dt DATETIME DEFAULT GETDATE(),
            
            CONSTRAINT FK_sp_tor_contract_budget_reserve FOREIGN KEY (sp_tor_contract_id)
                REFERENCES sp_tor_contract(sp_tor_contract_id),
            CONSTRAINT UQ_sp_tor_contract_budget_reserve UNIQUE (sp_tor_contract_id)
        );
        
        CREATE INDEX IX_sp_tor_contract_budget_reserve_contract_id 
            ON sp_tor_contract_budget_reserve(sp_tor_contract_id);
    END;";
    
    $db->Query($checkTableSql);
} catch (Exception $e) {
    // Silently fail if table creation fails (it may already exist)
}

$mode = isset($_REQUEST['mode']) ? $_REQUEST['mode'] : '';

switch ($mode) {
    case 'LOAD_CONTRACT_LIST':
        LoadContractList($db);
        break;
    case 'LOAD_BUDGET_RESERVE':
        LoadBudgetReserve($db);
        break;
    case 'SAVE_BUDGET_RESERVE':
        SaveBudgetReserve($db);
        break;
    default:
        echo json_encode(array("success" => false, "msg" => "Unknown mode"));
        break;
}

function LoadContractList($db) {
    try {
        $contract_id = isset($_REQUEST['id']) ? intval($_REQUEST['id']) : 0;
        
        $sql = "SELECT DISTINCT
                    tc.sp_tor_contract_id as id,
                    tc.sp_tor_contract_id,
                    tc.c_contract_no,
                    pc.c_name as c_creditor_name,
                    dbt.c_name as c_expense_budget_type_name,
                    pe.c_name as c_expense_name,
                    tc.f_contract_total,
                    CONVERT(VARCHAR(10), tc.d_contract_date, 23) as d_contract_date,
                    th.i_budget_year,
                    tc.dc_expense_budget_type_id,
                    tc.po_expense_id,
                    tc.dc_cost_id,
                    ISNULL(pr.f_reserve_money, 0) as f_reserve_money_pr,
                    ISNULL(pr.f_budget, 0) as f_budget_pr,
                    (tc.f_contract_total - ISNULL(pr.f_reserve_money, 0) - ISNULL(pr.f_budget, 0)) as f_budget_remain
                FROM sp_tor_contract tc
                LEFT JOIN po_creditor pc ON tc.dc_creditor_po_id = pc.po_creditor_id
                LEFT JOIN dc_expense_budget_type dbt ON tc.dc_expense_budget_type_id = dbt.dc_expense_budget_type_id
                LEFT JOIN po_expense pe ON tc.po_expense_id = pe.po_expense_id
                LEFT JOIN sp_tor_hdr th ON tc.sp_tor_hdr_id = th.sp_tor_hdr_id
                LEFT JOIN (
                    SELECT sp_tor_contract_id, 
                           SUM(CONVERT(FLOAT, f_reserve_money)) as f_reserve_money,
                           SUM(CONVERT(FLOAT, f_budget)) as f_budget
                    FROM sp_tor_contract_budget_reserve
                    WHERE i_enable = 1
                    GROUP BY sp_tor_contract_id
                ) pr ON tc.sp_tor_contract_id = pr.sp_tor_contract_id
                WHERE tc.i_enable = 1";
        
        // ถ้ามี contract_id ให้โหลดเฉพาะสัญญานั้น
        if ($contract_id > 0) {
            $sql .= " AND tc.sp_tor_contract_id = " . $contract_id;
        }
        
        $sql .= " ORDER BY tc.d_contract_date DESC";
        
        $stmt = $db->Query($sql);
        $data = array();
        while ($row = $db->Fetch($stmt)) {
            $data[] = $row;
        }
        
        echo json_encode(array("success" => true, "data" => $data, "total" => count($data)));
    } catch (Exception $e) {
        echo json_encode(array("success" => false, "msg" => $e->getMessage()));
    }
}

function LoadBudgetReserve($db) {
    try {
        $id = isset($_REQUEST['id']) ? $_REQUEST['id'] : 0;
        
        if ($id == 0) {
            echo json_encode(array("success" => false, "data" => array(), "msg" => "Invalid ID"));
            return;
        }
        
        $sql = "SELECT DISTINCT
                    stcbr.sp_tor_contract_budget_reserve_id as id,
                    stcbr.sp_tor_contract_id,
                    tc.dc_expense_budget_type_id,
                    dbt.c_name as dc_expense_budget_type_name,
                    tc.po_expense_id,
                    pe.c_name as bg_expense_name,
                    tc.dc_cost_id,
                    dc.c_name as dc_cost_name,
                    th.i_budget_year,
                    stcbr.f_reserve_money as f_reserve_money_pr,
                    stcbr.f_budget as f_budget_pr,
                    (tc.f_contract_total - stcbr.f_reserve_money - stcbr.f_budget) as f_budget_remain,
                    CONVERT(VARCHAR(10), stcbr.d_last_modify_dt, 23) as d_last_modify_dt
                FROM sp_tor_contract_budget_reserve stcbr
                LEFT JOIN sp_tor_contract tc ON stcbr.sp_tor_contract_id = tc.sp_tor_contract_id
                LEFT JOIN dc_expense_budget_type dbt ON tc.dc_expense_budget_type_id = dbt.dc_expense_budget_type_id
                LEFT JOIN po_expense pe ON tc.po_expense_id = pe.po_expense_id
                LEFT JOIN dc_cost dc ON tc.dc_cost_id = dc.dc_cost_id
                LEFT JOIN sp_tor_hdr th ON tc.sp_tor_hdr_id = th.sp_tor_hdr_id
                WHERE stcbr.sp_tor_contract_budget_reserve_id = ?";
        
        $stmt = $db->QueryParam($sql, array($id));
        $data = array();
        while ($row = $db->Fetch($stmt)) {
            $data[] = $row;
        }
        
        echo json_encode(array("success" => true, "data" => $data));
    } catch (Exception $e) {
        echo json_encode(array("success" => false, "msg" => $e->getMessage()));
    }
}

function SaveBudgetReserve($db) {
    try {
        $id = isset($_REQUEST['id']) ? $_REQUEST['id'] : 0;
        $sp_tor_contract_id = isset($_REQUEST['sp_tor_contract_id']) ? $_REQUEST['sp_tor_contract_id'] : 0;
        $f_reserve_money_pr = isset($_REQUEST['f_reserve_money_pr']) ? floatval($_REQUEST['f_reserve_money_pr']) : 0;
        $f_budget_pr = isset($_REQUEST['f_budget_pr']) ? floatval($_REQUEST['f_budget_pr']) : 0;
        
        if ($sp_tor_contract_id == 0) {
            echo json_encode(array("success" => false, "msg" => "Invalid Contract ID"));
            return;
        }
        
        // Check if record exists
        $checkSql = "SELECT sp_tor_contract_budget_reserve_id FROM sp_tor_contract_budget_reserve 
                    WHERE sp_tor_contract_id = ?";
        $checkStmt = $db->QueryParam($checkSql, array($sp_tor_contract_id));
        $existingRecord = $db->Fetch($checkStmt);
        
        if ($existingRecord) {
            // UPDATE
            $updateSql = "UPDATE sp_tor_contract_budget_reserve 
                         SET f_reserve_money = ?, 
                             f_budget = ?,
                             d_last_modify_dt = GETDATE(),
                             c_last_modify_by = ?
                         WHERE sp_tor_contract_id = ?";
            $updateStmt = $db->QueryParam($updateSql, array(
                $f_reserve_money_pr,
                $f_budget_pr,
                $_SESSION['user_id'],
                $sp_tor_contract_id
            ));
            $msg = "อัพเดทงบประมาณเรียบร้อยแล้ว";
        } else {
            // INSERT
            $insertSql = "INSERT INTO sp_tor_contract_budget_reserve 
                         (sp_tor_contract_id, f_reserve_money, f_budget, i_enable, c_create_by, d_create_dt, c_last_modify_by, d_last_modify_dt)
                         VALUES (?, ?, ?, 1, ?, GETDATE(), ?, GETDATE())";
            $insertStmt = $db->QueryParam($insertSql, array(
                $sp_tor_contract_id,
                $f_reserve_money_pr,
                $f_budget_pr,
                $_SESSION['user_id'],
                $_SESSION['user_id']
            ));
            $msg = "บันทึกงบประมาณเรียบร้อยแล้ว";
        }
        
        echo json_encode(array("success" => true, "msg" => $msg));
    } catch (Exception $e) {
        echo json_encode(array("success" => false, "msg" => "Error: " . $e->getMessage()));
    }
}
?>

function LoadContractList($db) {
    try {
        $contract_id = isset($_REQUEST['id']) ? intval($_REQUEST['id']) : 0;
        
        $sql = "SELECT DISTINCT
                    tc.sp_tor_contract_id as id,
                    tc.sp_tor_contract_id,
                    tc.c_contract_no,
                    pc.c_name as c_creditor_name,
                    dbt.c_name as c_expense_budget_type_name,
                    pe.c_name as c_expense_name,
                    tc.f_contract_total,
                    CONVERT(VARCHAR(10), tc.d_contract_date, 23) as d_contract_date,
                    th.i_budget_year,
                    tc.dc_expense_budget_type_id,
                    tc.po_expense_id,
                    tc.dc_cost_id,
                    ISNULL(pr.f_reserve_money, 0) as f_reserve_money_pr,
                    ISNULL(pr.f_budget, 0) as f_budget_pr,
                    (tc.f_contract_total - ISNULL(pr.f_reserve_money, 0) - ISNULL(pr.f_budget, 0)) as f_budget_remain
                FROM sp_tor_contract tc
                LEFT JOIN po_creditor pc ON tc.dc_creditor_po_id = pc.po_creditor_id
                LEFT JOIN dc_expense_budget_type dbt ON tc.dc_expense_budget_type_id = dbt.dc_expense_budget_type_id
                LEFT JOIN po_expense pe ON tc.po_expense_id = pe.po_expense_id
                LEFT JOIN sp_tor_hdr th ON tc.sp_tor_hdr_id = th.sp_tor_hdr_id
                LEFT JOIN (
                    SELECT sp_tor_contract_id, 
                           SUM(CONVERT(FLOAT, f_reserve_money)) as f_reserve_money,
                           SUM(CONVERT(FLOAT, f_budget)) as f_budget
                    FROM sp_tor_contract_budget_reserve
                    WHERE i_enable = 1
                    GROUP BY sp_tor_contract_id
                ) pr ON tc.sp_tor_contract_id = pr.sp_tor_contract_id
                WHERE tc.i_enable = 1";
        
        // ถ้ามี contract_id ให้โหลดเฉพาะสัญญานั้น
        if ($contract_id > 0) {
            $sql .= " AND tc.sp_tor_contract_id = " . $contract_id;
        }
        
        $sql .= " ORDER BY tc.d_contract_date DESC";
        
        $stmt = $db->Query($sql);
        $data = array();
        while ($row = $db->Fetch($stmt)) {
            $data[] = $row;
        }
        
        echo json_encode(array("success" => true, "data" => $data, "total" => count($data)));
    } catch (Exception $e) {
        echo json_encode(array("success" => false, "msg" => $e->getMessage()));
    }
}

function LoadBudgetReserve($db) {
    try {
        $id = isset($_REQUEST['id']) ? $_REQUEST['id'] : 0;
        
        if ($id == 0) {
            echo json_encode(array("success" => false, "data" => array(), "msg" => "Invalid ID"));
            return;
        }
        
        $sql = "SELECT DISTINCT
                    stcbr.sp_tor_contract_budget_reserve_id as id,
                    stcbr.sp_tor_contract_id,
                    tc.dc_expense_budget_type_id,
                    dbt.c_name as dc_expense_budget_type_name,
                    tc.po_expense_id,
                    pe.c_name as bg_expense_name,
                    tc.dc_cost_id,
                    dc.c_name as dc_cost_name,
                    th.i_budget_year,
                    stcbr.f_reserve_money as f_reserve_money_pr,
                    stcbr.f_budget as f_budget_pr,
                    (tc.f_contract_total - stcbr.f_reserve_money - stcbr.f_budget) as f_budget_remain,
                    CONVERT(VARCHAR(10), stcbr.d_last_modify_dt, 23) as d_last_modify_dt
                FROM sp_tor_contract_budget_reserve stcbr
                LEFT JOIN sp_tor_contract tc ON stcbr.sp_tor_contract_id = tc.sp_tor_contract_id
                LEFT JOIN dc_expense_budget_type dbt ON tc.dc_expense_budget_type_id = dbt.dc_expense_budget_type_id
                LEFT JOIN po_expense pe ON tc.po_expense_id = pe.po_expense_id
                LEFT JOIN dc_cost dc ON tc.dc_cost_id = dc.dc_cost_id
                LEFT JOIN sp_tor_hdr th ON tc.sp_tor_hdr_id = th.sp_tor_hdr_id
                WHERE stcbr.sp_tor_contract_budget_reserve_id = ?";
        
        $stmt = $db->QueryParam($sql, array($id));
        $data = array();
        while ($row = $db->Fetch($stmt)) {
            $data[] = $row;
        }
        
        echo json_encode(array("success" => true, "data" => $data));
    } catch (Exception $e) {
        echo json_encode(array("success" => false, "msg" => $e->getMessage()));
    }
}

function SaveBudgetReserve($db) {
    try {
        $id = isset($_REQUEST['id']) ? $_REQUEST['id'] : 0;
        $sp_tor_contract_id = isset($_REQUEST['sp_tor_contract_id']) ? $_REQUEST['sp_tor_contract_id'] : 0;
        $f_reserve_money_pr = isset($_REQUEST['f_reserve_money_pr']) ? floatval($_REQUEST['f_reserve_money_pr']) : 0;
        $f_budget_pr = isset($_REQUEST['f_budget_pr']) ? floatval($_REQUEST['f_budget_pr']) : 0;
        
        if ($sp_tor_contract_id == 0) {
            echo json_encode(array("success" => false, "msg" => "Invalid Contract ID"));
            return;
        }
        
        // Check if record exists
        $checkSql = "SELECT sp_tor_contract_budget_reserve_id FROM sp_tor_contract_budget_reserve 
                    WHERE sp_tor_contract_id = ?";
        $checkStmt = $db->QueryParam($checkSql, array($sp_tor_contract_id));
        $existingRecord = $db->Fetch($checkStmt);
        
        if ($existingRecord) {
            // UPDATE
            $updateSql = "UPDATE sp_tor_contract_budget_reserve 
                         SET f_reserve_money = ?, 
                             f_budget = ?,
                             d_last_modify_dt = GETDATE(),
                             c_last_modify_by = ?
                         WHERE sp_tor_contract_id = ?";
            $updateStmt = $db->QueryParam($updateSql, array(
                $f_reserve_money_pr,
                $f_budget_pr,
                $_SESSION['user_id'],
                $sp_tor_contract_id
            ));
            $msg = "อัพเดทงบประมาณเรียบร้อยแล้ว";
        } else {
            // INSERT
            $insertSql = "INSERT INTO sp_tor_contract_budget_reserve 
                         (sp_tor_contract_id, f_reserve_money, f_budget, i_enable, c_create_by, d_create_dt, c_last_modify_by, d_last_modify_dt)
                         VALUES (?, ?, ?, 1, ?, GETDATE(), ?, GETDATE())";
            $insertStmt = $db->QueryParam($insertSql, array(
                $sp_tor_contract_id,
                $f_reserve_money_pr,
                $f_budget_pr,
                $_SESSION['user_id'],
                $_SESSION['user_id']
            ));
            $msg = "บันทึกงบประมาณเรียบร้อยแล้ว";
        }
        
        echo json_encode(array("success" => true, "msg" => $msg));
    } catch (Exception $e) {
        echo json_encode(array("success" => false, "msg" => "Error: " . $e->getMessage()));
    }
}
?>
