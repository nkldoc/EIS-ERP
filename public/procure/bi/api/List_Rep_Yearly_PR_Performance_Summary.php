<?php
// ============================================================
// API: Yearly PR Performance Summary — EIS_procure edition
// query ตรงจาก sp_tor (ไม่ต้องสร้าง staging table)
// โครงสร้าง response เหมือน NMU_supplies ทุกประการ
// ============================================================

include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db   = new DatabaseServer();
$date = new i_date();

$root = "data";
$data = [];

function List_QueryParam()
{
    global $db, $root, $data;

    // -------------------------------------------------------
    // Query ตรงจาก sp_tor แปลง d_create → fiscal year/month
    // แล้วคำนวณ cumulative_total ด้วย window function
    // เหมือน NMU_supplies แต่ใช้ sp_tor ของ EIS_procure
    // -------------------------------------------------------
    $sqlMain = "
        WITH base AS (
            SELECT
                fiscal_year  AS year_th,
                fiscal_month AS month_no,
                COUNT(*)     AS total_pr
            FROM (
                SELECT
                    YEAR(d_create) AS doc_year,
                    MONTH(d_create) AS doc_month,
                    CASE
                        WHEN MONTH(d_create) >= 10
                            THEN YEAR(d_create) + 544   /* ต.ค.–ธ.ค. → ปีงบถัดไป (บวก 543+1) */
                        ELSE YEAR(d_create) + 543       /* ม.ค.–ก.ย. → ปีงบเดียวกัน */
                    END AS fiscal_year,
                    CASE
                        WHEN MONTH(d_create) >= 10
                            THEN MONTH(d_create) - 9    /* ต.ค.=1, พ.ย.=2, ธ.ค.=3 */
                        ELSE MONTH(d_create) + 3        /* ม.ค.=4 … ก.ย.=12 */
                    END AS fiscal_month
                FROM dbo.sp_tor
                WHERE i_enabled  = 1
                  AND i_type_bg  = 1
                  AND d_create  IS NOT NULL
            ) X
            WHERE fiscal_year >= 2566   /* แสดงตั้งแต่ปีงบ 2566 */
            GROUP BY fiscal_year, fiscal_month
        )
        SELECT
            year_th,
            month_no,
            total_pr,
            SUM(total_pr) OVER (
                PARTITION BY year_th
                ORDER BY month_no
                ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
            ) AS cumulative_total
        FROM base
        ORDER BY year_th, month_no;
    ";

    $stmt = $db->QueryParam($sqlMain, []);

    $i = 0;
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $data[] = [
                "no"               => ++$i,
                "year_th"          => $row["year_th"],
                "year_en"          => intval($row["year_th"]) - 543,
                "month_no"         => $row["month_no"],
                "total_pr"         => intval($row["total_pr"]),
                "cumulative_total" => intval($row["cumulative_total"]),
            ];
        }
    }

    echo json_encode([
        "debug"      => true,
        $root        => $data,
        "totalCount" => $i,
    ], JSON_UNESCAPED_UNICODE);
}

/* ===== Router ===== */
$fn = $_GET['fn'] ?? '';
if ($fn === 'List_QueryParam') {
    List_QueryParam();
} else {
    echo json_encode(['success' => false, 'message' => 'invalid fn']);
}