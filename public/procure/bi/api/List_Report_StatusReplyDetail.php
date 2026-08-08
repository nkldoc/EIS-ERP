<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db   = new DatabaseServer();
$date = new i_date();

function List_QueryParam()
{
    global $db;

    // Parameters
    $yearTh   = isset($_REQUEST['year_th'])   ? intval($_REQUEST['year_th'])   : (date('Y') + 543);
    $yearEn   = $yearTh - 543;
    $monthIdx = isset($_REQUEST['month_idx']) ? intval($_REQUEST['month_idx']) : -1; // 0-11, -1 = ทั้งหมด
    $staffIds = isset($_REQUEST['staff'])     ? $_REQUEST['staff']             : '';
    $dataType = isset($_REQUEST['data_type']) ? $_REQUEST['data_type']         : 'sent'; // 'sent' | 'reply'

    // คำนวณช่วงวันที่ (ปีงบประมาณ: ต.ค. ปีก่อน – ก.ย. ปีนี้)
    $startDate = ($yearEn - 1) . "-10-01";
    $endDate   = $yearEn . "-09-30";

    if ($monthIdx >= 0) {
        if ($monthIdx <= 2) {
            // 0,1,2 → ต.ค., พ.ย., ธ.ค. ของปีก่อน
            $m = $monthIdx + 10;
            $y = $yearEn - 1;
        } else {
            // 3..11 → ม.ค.–ก.ย. ของปีนี้
            $m = $monthIdx - 2;
            $y = $yearEn;
        }
        $startDate = sprintf("%04d-%02d-01", $y, $m);
        $endDate   = date("Y-m-t", strtotime($startDate));
    }

    // Filter staff ด้วย dc_user_create_id
    $staffCond = "";
    if (!empty($staffIds)) {
        $ids    = array_map('intval', explode(',', $staffIds));
        $idsStr = implode(',', $ids);
        if (!empty($idsStr)) {
            $staffCond = " AND b.dc_user_create_id IN ($idsStr) ";
        }
    }

    // Filter type: reply = มี po_working_item ที่ i_status=3, sent = ทั้งหมด
    $typeCond = "";
    if ($dataType === 'reply') {
        $typeCond = " AND wi.po_working_hdr_id IS NOT NULL ";
    }

    $sql = "
        SELECT
            ROW_NUMBER() OVER (ORDER BY b.d_create DESC) AS row
            ,CONVERT(date, aa.d_receive_date)    AS d_receive_date
            ,CONVERT(date, aa.d_doc_date)        AS d_doc_date
            ,CONVERT(date, b.d_create)           AS d_create
            ,CONVERT(date, b.d_checking_date)    AS d_checking_date
            ,CONVERT(date, b.d_arrive_date)      AS d_arrive_date
            ,ISNULL(aa.i_status, 0)              AS i_status
            ,b.c_arrive_code                     AS c_code
            ,b.c_code                            AS c_code_ref
            ,b.c_doc_ref
            ,CASE
                WHEN a.c_code_ref LIKE 'A%' AND dtl_map.c_code_real IS NOT NULL
                    THEN dtl_map.c_code_real
                ELSE a.c_code_ref
             END                              AS d_code
            -- เก็บเลข A เดิมไว้ด้วย เพื่อให้ frontend รู้ว่าเคยเป็น A
            ,CASE
                WHEN a.c_code_ref LIKE 'A%' AND dtl_map.c_code_real IS NOT NULL
                    THEN a.c_code_ref
                ELSE NULL
             END                              AS orig_a_code
            ,ISNULL(beg.c_detail, '')         AS c_detail_proj
            ,ISNULL(beg.c_heading, '')        AS c_heading_proj
            ,(SELECT SUM(f_net_total_price)
              FROM EIS_PROCURE..sp_check_period_dtl
              WHERE sp_check_period_hdr_id = b.sp_check_period_hdr_id) AS f_net_total_price
            ,a.po_working_hdr_id
            ,(SELECT c_full_name FROM EIS_PROCURE..dc_user WHERE dc_user_id = b.dc_user_create_id) AS emp
            ,(SELECT c_full_name FROM NMU_EIS..dc_user WHERE dc_user_id = aa.dc_user_create_id) AS po_emp_name
            ,(SELECT c_full_name FROM NMU_EIS..dc_user WHERE dc_user_id = a.dc_user_create_id) AS emp_tt
            ,(SELECT c_name FROM EIS_PROCURE..dc_creditor WHERE dc_creditor_id = b.dc_creditor_id) AS dc_creditor
            ,ISNULL(REPLACE(REPLACE(CAST(b.c_comment AS nvarchar(max)), CHAR(13), ''), CHAR(10), ' '), '') AS c_name
            ,REPLACE(REPLACE(ISNULL(aa.c_comment, ''), CHAR(13), ''), CHAR(10), ' ') AS c_comment
            ,aa.po_working_item_id
            ,CASE
                WHEN b.d_arrive_date IS NOT NULL AND b.d_checking_date IS NOT NULL
                THEN DATEDIFF(day, b.d_arrive_date, b.d_checking_date)
                ELSE NULL
             END AS diff_arrive_check
            ,CASE
                WHEN b.d_checking_date IS NOT NULL AND b.d_create IS NOT NULL
                THEN DATEDIFF(day, b.d_checking_date, b.d_create)
                ELSE NULL
             END AS diff_check_send
            ,CASE WHEN wi.po_working_hdr_id IS NOT NULL THEN 1 ELSE 0 END AS is_reply

        FROM EIS_PROCURE..sp_check_period_hdr b

        LEFT JOIN NMU_EIS..po_working_hdr a
               ON a.po_working_hdr_id = b.po_working_hdr_id
              AND a.i_enable = 1

        -- แปลง A → F ผ่าน po_working_dtl
        LEFT JOIN (
            SELECT c_code_advance, MIN(c_code) AS c_code_real
            FROM NMU_EIS..po_working_dtl
            WHERE c_code_advance IS NOT NULL AND c_code_advance <> ''
            GROUP BY c_code_advance
        ) dtl_map ON dtl_map.c_code_advance = a.c_code_ref

        -- รายละเอียดโครงการจาก po_working_begin_hdr
        LEFT JOIN (
            SELECT po_working_hdr_id, c_detail, c_heading
            FROM NMU_EIS..po_working_begin_hdr
            WHERE i_enable = 1
        ) beg ON beg.po_working_hdr_id = a.po_working_hdr_id

        LEFT JOIN (
            SELECT
                 aa.po_working_hdr_id
                ,aa.i_status
                ,ISNULL((SELECT TOP 1 c_comment
                         FROM NMU_EIS..po_working_item
                         WHERE po_working_item_id = MAX(aa.po_working_item_id)), '-') AS c_comment
                ,(SELECT TOP 1 po_working_item_id
                  FROM NMU_EIS..po_working_item
                  WHERE po_working_item_id = MAX(aa.po_working_item_id)) AS po_working_item_id
                ,(SELECT TOP 1 CONVERT(date, d_doc_date)
                  FROM NMU_EIS..po_working_item
                  WHERE po_working_item_id = MAX(aa.po_working_item_id)) AS d_doc_date
                ,(SELECT TOP 1 CONVERT(date, d_receive_date)
                  FROM NMU_EIS..po_working_item
                  WHERE po_working_item_id = MAX(aa.po_working_item_id)) AS d_receive_date
                ,(SELECT TOP 1 dc_user_create_id
                  FROM NMU_EIS..po_working_item
                  WHERE po_working_item_id = MAX(aa.po_working_item_id)) AS dc_user_create_id
            FROM NMU_EIS..po_working_item aa
            WHERE aa.i_status = 3
            GROUP BY aa.i_status, aa.po_working_hdr_id
        ) aa ON a.po_working_hdr_id = aa.po_working_hdr_id

        LEFT JOIN (
            SELECT po_working_hdr_id
                  ,MAX(d_receive_date) AS d_receive_date
            FROM NMU_EIS..po_working_item
            WHERE i_status = 3
            GROUP BY po_working_hdr_id
        ) wi ON wi.po_working_hdr_id = a.po_working_hdr_id

        WHERE b.i_enabled = 1
          AND CONVERT(date, b.d_create) BETWEEN '$startDate' AND '$endDate'
          $staffCond
          $typeCond
        ORDER BY b.d_create DESC
    ";

    if (@$_REQUEST["show_sql"]) {
        echo $sql;
        exit;
    }

    $stmt = $db->QueryParam($sql, array());
    $data = [];

    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {

            // Format วันที่แสดงผล
            $fmt = function ($val) {
                if ($val instanceof DateTime) return $val->format('d/m/Y');
                if (is_string($val) && !empty($val) && strpos($val, '-') !== false) return date('d/m/Y', strtotime($val));
                return "";
            };

            $d_create   = $fmt($row['d_create']);
            $d_receive  = $fmt($row['d_receive_date']);
            $d_send     = $fmt($row['d_send_date']);
            $d_checking = $fmt($row['d_checking_date']);
            $d_arrive   = $fmt($row['d_arrive_date']);

            // แปลง NULL → ""
            foreach ($row as $key => $val) {
                if (is_null($val)) $row[$key] = "";
                if ($val instanceof DateTime) $row[$key] = $val->format('Y-m-d H:i:s');
            }

            $d_doc_date = $fmt($row['d_doc_date']);

            $data[] = [
                'row_num'            => $row['row'],
                'd_create'           => $d_create,
                'c_code'             => $row['c_code'],        // เลขที่ตรวจรับ (IR...)
                'c_code_ref'         => $row['c_code_ref'],    // เลขส่งเบิก (02AP...)
                'c_doc_ref'          => $row['c_doc_ref'],     // เลขอ้างอิง Invoice
                'd_code'             => $row['d_code'],        // เลข D/F (หลังแปลง A แล้ว)
                'orig_a_code'        => $row['orig_a_code'] ?? '', // เลข A เดิม (ถ้ามี)
                'f_net_total_price'  => $row['f_net_total_price'],
                'emp'                => $row['emp'],
                'po_emp_name'        => $row['po_emp_name'],
                'emp_tt'             => $row['emp_tt'],
                'dc_creditor'        => $row['dc_creditor'],
                'c_name'             => $row['c_name'],
                'c_comment'          => $row['c_comment'],
                'c_detail_proj'      => $row['c_detail_proj'] ?? '',
                'c_heading_proj'     => $row['c_heading_proj'] ?? '',
                'd_receive_date'     => $d_receive,
                'd_send_date'        => $d_send,
                'd_doc_date'         => $d_doc_date,
                'is_reply'           => intval($row['is_reply']) == 1,
                'd_checking_date'    => $d_checking,
                'd_arrive_date'      => $d_arrive,
                'diff_arrive_check'  => $row['diff_arrive_check'] !== '' ? $row['diff_arrive_check'] : '-',
                'diff_check_send'    => $row['diff_check_send']   !== '' ? $row['diff_check_send']   : '-',
            ];
        }
    }

    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(["success" => true, "data" => $data], JSON_UNESCAPED_UNICODE);
}

$fn = $_REQUEST['fn'] ?? '';
if ($fn === 'List_QueryParam') {
    List_QueryParam();
} else {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'message' => 'invalid fn']);
}