<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();

$root = "data";
$data = array();
$con = null;

function Get_ChartTorType()
{
    global $db, $date, $root, $data, $con, $arr_status;
    unset(${$root});
    $totalCount = 0;

    $yearTh = isset($_GET['year_th']) ? intval($_GET['year_th']) : (date('Y') + 543);
    if (isset($_GET['year_en'])) {
        $yearEn = intval($_GET['year_en']);
    } else {
        $yearEn = $yearTh - 543;
    }

    // ✅ แก้: เพิ่ม yearEnPrev สำหรับ ต.ค.–ธ.ค. ของปีก่อน
    $yearEnPrev = $yearEn - 1;

    // ✅ แก้: เปลี่ยน WHERE ให้ตรงกับ ChartStatus
    //    เดิมใช้ i_pr_year = yearEn → ผิดปีงบ + รวมรายการยกเลิก
    //    ใหม่ใช้ i_yyyy + d_create + กรอง i_enabled, i_is_notor, i_parent
    $where = "AND t.i_enabled = 1
              AND ISNULL(t.i_is_notor, 0) = 0
              AND ISNULL(t.i_parent, 0) = 0
              AND (
                  (t.i_yyyy = {$yearEnPrev} AND MONTH(t.d_create) IN (10, 11, 12))
                  OR
                  (t.i_yyyy = {$yearEn} AND MONTH(t.d_create) BETWEEN 1 AND 9)
              )";

    $sqlMain = "SET NOCOUNT ON;
    DECLARE @TEMP_SP_USER_COST_SYS TABLE (dc_cost_id BIGINT);
    INSERT INTO @TEMP_SP_USER_COST_SYS
    EXEC NMU_DATACENTER.dbo.SP_USER_COST_SYS 1,2,NULL,NULL;

    ;WITH COST_MAIN AS (
        SELECT
            dc_cost_id  AS dc_cost_main_id,
            b.dc_cost_acc_id,
            c_name      AS cost_name
        FROM NMU_DATACENTER..dc_cost a
        INNER JOIN (
            SELECT
                LEFT(c_code,2) + '000000' AS c_code,
                MAX(b.dc_cost_acc_id)     AS dc_cost_acc_id
            FROM NMU_DATACENTER..dc_cost b
            GROUP BY LEFT(c_code,2) + '000000'
        ) b ON a.c_code = b.c_code
    )
    SELECT
        cm.dc_cost_acc_id,
        cm.cost_name,
        t.tor_id,
        t.tor_status_id,
        CASE
            WHEN ISNULL(t.i_type_contract,0) = 1 THEN 'สัญญา'
            WHEN ISNULL(t.i_type_contract,0) = 2 THEN 'ใบสั่ง'
            WHEN ISNULL(t.i_type_contract,0) = 3 THEN 'จัดซื้อจะขาย'
            ELSE 'ยังไม่ได้ระบุ'
        END AS i_type_contract,
        (SELECT c_name FROM NMU_ERP..sp_tor_i_work_type
         WHERE i_work_type_id = ISNULL(t.i_product_type,0)) AS i_product_type,
        t.i_yyyy + 543 AS i_yyyy,
        t.c_name,
        t.c_code  AS pr_code,
        -- ✅ แก้: ใช้ OUTER APPLY แทน LEFT JOIN เพื่อไม่ให้นับซ้ำ
        sp.contract_c_code,
        sp.bill_step,
        (SELECT c_name FROM NMU_ERP..sp_tor_i_work_type
         WHERE i_work_type_id = t.i_working_type) AS i_working_type,
        (SELECT c_name FROM NMU_DATACENTER.dbo.dc_expense_budget_type
         WHERE dc_expense_budget_type_id = t.dc_expense_budget_type_id) AS dc_expense_budget_type,
        (SELECT c_name FROM NMU_EIS.dbo.bg_expense
         WHERE bg_expense_id = t.po_expense_id) AS po_expense,
        (SELECT c_name FROM sp_emp
         WHERE sp_emp_id = t.sp_emp_id) AS sp_emp,
        (SELECT c_name FROM sp_type_bg
         WHERE i_value = t.i_type_bg) AS i_type_bg,
        ISNULL(t.tor_type_id, 0) AS tor_type_id,
        t.f_total_amt,
        t.i_enabled
    FROM sp_tor t
    LEFT JOIN NMU_DATACENTER.dbo.dc_cost dc ON dc.dc_cost_id = t.dc_cost2_id
    LEFT JOIN COST_MAIN cm ON cm.dc_cost_acc_id = dc.dc_cost_acc_id
    -- ✅ แก้: เอา LEFT JOIN sp_tor_contract ออก ย้ายเข้า OUTER APPLY แทน
    OUTER APPLY (
        SELECT TOP 1
            c.c_code AS contract_c_code,
            CASE
                WHEN ISNULL(f.i_status_last,0) >= 11
                     AND ISNULL(e.po_working_hdr_id,0) > 0   THEN 'PAID'
                WHEN ISNULL(e.po_working_hdr_id,0) = 0
                     AND e.c_code IS NOT NULL                 THEN 'BILLING'
                WHEN c.c_code IS NOT NULL                     THEN 'INSPECT'
                WHEN c.c_code IS NULL
                     AND t.tor_status_id IN (20,21,10034)     THEN 'MANAGE'
                ELSE 'PROCESS'
            END AS bill_step
        FROM sp_tor_contract c
        LEFT JOIN sp_tor_contract     cs ON cs.sp_tor_contract_id  = c.sp_tor_contract_id
        LEFT JOIN sp_tor_hdr_period    d ON d.sp_tor_contract_id   = c.sp_tor_contract_id
                                       AND d.i_is_last = 1
        LEFT JOIN sp_check_period_hdr  e ON e.sp_tor_hdr_period_id = d.sp_tor_hdr_period_id
        LEFT JOIN NMU_EIS..po_working_hdr f ON e.po_working_hdr_id = f.po_working_hdr_id
        WHERE c.sp_tor_id = t.tor_id
        -- ✅ เรียงลำดับให้ได้สัญญาล่าสุด
        ORDER BY c.sp_tor_contract_id DESC
    ) sp
    WHERE 1 = 1
      AND t.c_code IS NOT NULL
      {$where}";

    $stmt = $db->QueryParam($sqlMain, array());

    if ($stmt) {
        $i = 0;
        while ($row = $db->Fetch($stmt)) {
            // Logic จำแนกกลุ่มสถานะ
            $status_group = 0;
            $tor_status   = $row["tor_status_id"];
            $bill_step    = $row["bill_step"];
            $enabled      = $row["i_enabled"];

            if ($enabled == 2) {
                $status_group = 9;  // ยกเลิก
            } elseif (in_array($tor_status, [24, 25, 26, 13])) {
                $status_group = 8;  // รอดำเนินการ
            } elseif ($bill_step == 'PAID') {
                $status_group = 13; // เบิกจ่ายแล้ว
            } elseif ($bill_step == 'BILLING') {
                $status_group = 12; // ขออนุมัติเบิกจ่าย
            } elseif ($bill_step == 'INSPECT') {
                $status_group = 11; // ตรวจรับ
            } elseif ($bill_step == 'MANAGE') {
                $status_group = 10; // บริหารสัญญา
            } else {
                $status_group = 9;  // อยู่ระหว่างดำเนินการ
            }

            ${$root}[] = array(
                "dc_cost_acc_id"         => intval($row["dc_cost_acc_id"]),
                "cost_name"              => $row["cost_name"],
                "pr_code"                => $row["pr_code"],
                "contract_c_code"        => $row["contract_c_code"],
                "i_product_type"         => $row["i_product_type"],
                "i_type_contract"        => $row["i_type_contract"],
                "tor_status_id"          => $row["tor_status_id"],
                "i_yyyy"                 => $row["i_yyyy"],
                "c_name"                 => $row["c_name"],
                "i_working_type"         => $row["i_working_type"],
                "dc_expense_budget_type" => $row["dc_expense_budget_type"],
                "po_expense"             => $row["po_expense"],
                "sp_emp"                 => $row["sp_emp"],
                "i_type_bg"              => $row["i_type_bg"],
                "status_group_id"        => $status_group,
                "tor_type_id"            => intval($row["tor_type_id"]),
                "total_amt"              => floatval($row["f_total_amt"]),
            );
            $i++;
        }
    }

    // Helper: sanitize strings
    function sanitize_recursive($data)
    {
        if (is_array($data)) {
            foreach ($data as $key => $value) {
                $data[$key] = sanitize_recursive($value);
            }
            return $data;
        } elseif (is_string($data)) {
            return preg_replace('/[\x00-\x1F\x7F]/u', '', $data);
        }
        return $data;
    }

    $final_data = array(
        "debug"      => true,
        $root        => sanitize_recursive(${$root}),
        "totalCount" => $i,
        "year_th"    => $yearTh,
        "year_en"    => $yearEn,
    );

    return json_encode(
        $final_data,
        JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP
    );
}