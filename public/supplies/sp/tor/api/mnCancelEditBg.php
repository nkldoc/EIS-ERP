<?php

//-- mnContractCode
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

$mode = $_REQUEST["mode"] ?? null;
$table = "dbo.sp_check_period_hdr";
$keyName = "sp_check_period_hdr_id";
$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;
    
$re_id = null;
$stmt2 = true;
$stmt3 = true;
$stmt4 = true;

$db->BeginTran();

$id = $_REQUEST["id"] ?? null;

function RunStatusPeriod($period_status = null, $period_id = null) {
    global $db;

    /* sp_status_hdr_id	c_code	c_name
      4	ST0012	ส่งมอบงาน
      5	ST0013	ตรวจรับพัสดุ/ครุภัณฑ์
      9	ST0015	บันทึกใบเบิก **** */

    $period_status_id = $period_status;

    $arrParam[] = $period_status_id; //  
    $arrParam[] = $_SESSION["user_id"];
    $arrParam[] = $_SESSION["dc_cost_id"];
    $arrParam[] = date("Y-m-d H:i:s");
    $arrParam[] = $period_id;

    $sql = " UPDATE dbo.sp_tor_hdr_period set "
            . " period_status_id = ? ,"
            . " dc_user_update_id = ? ,"
            . " dc_user_update_cost_id = ? ,"
            . " d_update = ? "
            . " where sp_tor_hdr_period_id = ?";
    return $db->QueryParam($sql, $arrParam);
    ;
}

function checkItemsToTranf($check_id, $data = array()) {
    global $db;
    /*
     * receive Items
     * c_yyyy => ปีขอเบิก
     * i_yyyy => ปีที่เรื่อง
     * dc_bg_budget_type_id => แหล่งเงิน
     * po_expense_id => รายจ่ายย่อย v4 (งบประมาณ)
     * */
    $f1 = $db->GetDataBySQL("select YEAR(a.d_checking_date) as i_yyyy,YEAR(getdate()) as c_yyyy "
            . " , (select dc_bg_budget_type_id ) as dc_bg_budget_type_id"
            . " , () as po_expense_id"
            . " from [NMU_ERP].[dbo].sp_check_period_hdr a"
            . " where a.sp_check_period_hdr_id = ?", array($check_id));
    $c_yyyy = $f['c_yyyy'];
    $i_yyyy = $f['i_yyyy'];
    $dc_bg_budget_type_id = $f['dc_bg_budget_type_id'];
    $po_expense_id = $f['po_expense_id'];

    $sql = "UPDATE dbo.sp_tranf_hdr SET"
            . " c_yyyy = '{$c_yyyy}'"
            . " , i_yyyy = '{$i_yyyy}'"
            . " , dc_bg_budget_type_id = '{$dc_bg_budget_type_id}'"
            . " , po_expense_id = '{$po_expense_id}'"
            . " WHERE sp_check_period_hdr_id = ?;";
    $stm1 = $db->QueryParam($sql, array($check_id));
    return array($stm1);
}

//Preparing
///
switch ($mode) {
   case "ackInfo":
    // รายการก่อน/หลังแก้ไข เพื่อแสดงให้ผู้ขอตรวจสอบก่อนกดยืนยัน (ก่อน = ค่าเดิมที่เก็บใน log, หลัง = ค่าปัจจุบันใน sp_tor)
    $stmtInfo = $db->QueryParam("SELECT t.c_code, t.po_expense_id, t.i_pr_type1, t.i_pr_type2, t.i_pr_type3
            , t.dc_expense_budget_type_id AS dc1, t.dc_expense_budget_type2_id AS dc2, t.dc_expense_budget_type3_id AS dc3
            , t.f_type_amt AS amt1, t.f_type2_amt AS amt2, t.f_type3_amt AS amt3
            FROM dbo.sp_tor t WHERE t.tor_id = ?", array($_POST["id"]));
    $cur = $db->Fetch($stmtInfo);
    $nameBudget = function ($id) use ($db) {
        if (!$id) {
            return "";
        }
        $s = $db->QueryParam("SELECT TOP 1 c_name FROM dbo.dc_expense_budget_type WHERE dc_expense_budget_type_id = ?", array($id));
        $r = $db->Fetch($s);
        return $r ? $r["c_name"] : "";
    };
    $nameExpense = function ($id) use ($db) {
        if (!$id) {
            return "";
        }
        $s = $db->QueryParam("SELECT TOP 1 c_code, c_name FROM NMU.dbo.bg_expense WHERE bg_expense_id = ?", array($id));
        $r = $db->Fetch($s);
        return $r ? trim($r["c_code"] . " : " . $r["c_name"]) : "";
    };
    $stmtLog = $db->QueryParam("SELECT i_number_bg, dc_expense_budget_type_id, po_expense_id, f_total_amt, i_pr_type
            FROM dbo.sp_tor_bg_log
            WHERE sp_tor_id = ? AND i_edit = 2 AND i_status = 4
            ORDER BY i_number_bg, sp_tor_bg_log_id", array($_POST["id"]));
    $items = array();
    while ($l = $db->Fetch($stmtLog)) {
        $n = intval($l["i_number_bg"]);
        $items[$n] = array(
            "no" => $n,
            "before" => array(
                "budget" => $nameBudget($l["dc_expense_budget_type_id"]),
                "expense" => $nameExpense($l["po_expense_id"]),
                "amt" => floatval($l["f_total_amt"]),
                "pr_type" => intval($l["i_pr_type"]),
            ),
            "after" => array(
                "budget" => $nameBudget($cur["dc" . $n]),
                "expense" => $nameExpense($cur["po_expense_id"]),
                "amt" => floatval($cur["amt" . $n]),
                "pr_type" => intval($cur["i_pr_type" . $n]),
            ),
        );
    }
    $extra = array("c_code" => $cur["c_code"] ?? "", "items" => array_values($items));
    $stmt = true;
    break;
   case "ack":
    // ผู้ขอกดยืนยันการแก้ไขจากฝ่ายจัดสรรแล้ว (i_status 4 -> 5)
    $stmt = $db->QueryParam("UPDATE dbo.sp_tor_bg_log
            SET i_status = 5, dc_user_update_id = ?, dc_user_update_cost_id = ?, d_update = ?
            WHERE sp_tor_id = ? AND i_edit = 2 AND i_status = 4"
            , array($_SESSION["user_id"], $_SESSION["dc_cost_id"] ?? null, date("Y-m-d H:i:s"), $_POST["id"]));
    break;
   case "return":

    // แถวที่ฝ่ายจัดสรรบันทึกแก้ไขหลังคำขอล่าสุด (i_status 2 -> 4) = ส่งคืนแล้ว รอผู้ขอกดยืนยันการแก้ไข
    $sqlMark = "UPDATE l SET i_status = 4
                FROM dbo.sp_tor_bg_log l
                WHERE l.sp_tor_id = ?
                  AND l.i_edit = 2
                  AND l.i_status = 2
                  AND l.sp_tor_bg_log_id > (SELECT ISNULL(MAX(r.sp_tor_bg_log_id), 0)
                                            FROM dbo.sp_tor_bg_log r
                                            WHERE r.sp_tor_id = l.sp_tor_id
                                              AND r.i_edit = 1
                                              AND ISNULL(r.c_comment_edit1, '') = ''
                                              AND r.sp_tor_bg_log_id < l.sp_tor_bg_log_id)";
    $stmtMark = $db->QueryParam($sqlMark, array($_POST["id"]));

    // ปิดเฉพาะรายการขอแก้ไขที่ค้างอยู่ (i_edit = 1) ไม่ทับแถวที่บันทึกแก้ไขแล้ว (i_edit = 2)
    $arrParam = array();
    $arrParam[] = $_POST["comment"];
    $arrParam[] = $_SESSION["user_id"];   // ดึงจาก session
    $arrParam[] = $_SESSION["dc_cost_id"] ?? null;
    $arrParam[] = date("Y-m-d H:i:s");
    $arrParam[] = $_POST["id"];

    $sql = "UPDATE dbo.sp_tor_bg_log
            SET c_comment_edit1 = ?,
                dc_user_update_id = ?,
                dc_user_update_cost_id = ?,
                d_update = ?
            WHERE sp_tor_id = ?
              AND i_edit = 1
              AND ISNULL(c_comment_edit1, '') = ''";

    $stmt = $db->QueryParam($sql, $arrParam);
    break;
}

if ($stmt && $stmt2 && $stmt3 && $stmt4) { 
    $db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว", "id" => $id);
    if (!empty($extra)) {
        $re = array_merge($re, $extra);
    }
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : ");
}

echo json_encode($re);
exit;
