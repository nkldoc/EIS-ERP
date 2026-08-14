<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();

function List_QueryParam()
{
    global $db;
    $yearTh = isset($_REQUEST['year_en']) ? intval($_REQUEST['year_en']) : (date('Y') + 543);
    $yearEn = $yearTh - 543;

    $start_date = ($yearEn - 1) . "-10-01";
    $end_date = $yearEn . "-09-30";

    $sql = "
        SELECT 
            ROW_NUMBER() OVER (ORDER BY aa.i_status desc ,a.c_code_ref,tor.sp_emp_id ) AS row
            ,CONVERT(date,aa.d_receive_date) as d_receive_date
            ,CONVERT(date,aa.d_doc_date) as d_doc_date
            ,CONVERT(date,a.d_create ) as d_create
            ,isnull(aa.i_status,0) as i_status
            ,a.po_working_hdr_id
            ,a.c_code_ref
            ,aa.po_working_item_id
            ,tor.sp_emp_id
            ,ISNULL((SELECT c_name FROM NMU_ERP..sp_emp WHERE sp_emp_id = tor.sp_emp_id), 'ไม่ระบุ') AS staff_name
            ,pw.i_status as po_working_status
            ,(SELECT COUNT(*) FROM NMU_EIS..po_working_item x
                WHERE x.po_working_hdr_id = a.po_working_hdr_id AND x.i_status = 3) AS protest_round_total
            -- นับเฉพาะรอบทักท้วงที่ d_doc_date (วันที่ทักท้วงจริง) อยู่ในช่วงปีงบประมาณที่เลือก
            -- ใช้ตัวเลขนี้กับ Grand Total (sum_reply_all) เพื่อให้ apples-to-apples กับ List_RepProtest.php (EIS)
            -- แทนที่ protest_round_total เดิมซึ่งนับทุกรอบของเอกสาร แม้บางรอบจะทักท้วงนอกช่วงปีงบประมาณ ทำให้ยอดรวมสูงเกินจริง
            ,(SELECT COUNT(*) FROM NMU_EIS..po_working_item x
                WHERE x.po_working_hdr_id = a.po_working_hdr_id AND x.i_status = 3
                AND CONVERT(date, x.d_doc_date) BETWEEN '$start_date' AND '$end_date') AS protest_round_total_period
        FROM NMU_EIS..po_working_hdr a
        INNER JOIN NMU_EIS..po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id
        LEFT JOIN (
            SELECT
                aa.po_working_hdr_id
                ,aa.i_status
                ,(select top 1 po_working_item_id from NMU_EIS..po_working_item where po_working_item_id = max(aa.po_working_item_id)) as po_working_item_id
                ,(select top 1 CONVERT(date,d_doc_date) from NMU_EIS..po_working_item where po_working_item_id = max(aa.po_working_item_id)) as d_doc_date
                ,(select top 1 CONVERT(date,d_receive_date) from NMU_EIS..po_working_item where po_working_item_id = max(aa.po_working_item_id)) as d_receive_date
            FROM NMU_EIS..po_working_item aa
            WHERE aa.i_status = 3
            GROUP BY aa.i_status, aa.po_working_hdr_id
        ) aa ON a.po_working_hdr_id = aa.po_working_hdr_id
        OUTER APPLY (
            SELECT TOP 1 d.sp_emp_id
            FROM sp_check_period_hdr sch
            INNER JOIN sp_tor_contract stc ON sch.sp_tor_contract_id = stc.sp_tor_contract_id
            INNER JOIN sp_tor d ON d.tor_id = stc.sp_tor_id
            WHERE sch.po_working_hdr_id = a.po_working_hdr_id
            ORDER BY sch.sp_check_period_hdr_id DESC
        ) tor
        LEFT JOIN dbo.sp_withdraw sw ON sw.c_code_ref = a.c_code_ref
        LEFT JOIN dbo.vw_po_working_pdf pw ON pw.c_code_ref = sw.c_code_ref
        WHERE
            a.i_enable = 1
            AND b.dc_cost_id = '38'
            AND b.dc_cost_acc_id = 77
            AND CONVERT(date,a.d_create) BETWEEN '$start_date' AND '$end_date'
        ORDER BY a.c_code_ref, tor.sp_emp_id
    ";

    $stmt = $db->QueryParam($sql, array());
    $data = [];

    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $d_create = $row['d_create'];
            if ($d_create instanceof DateTime) {
                $d_create = $d_create->format('Y-m-d');
            }

            $month = intval(date('m', strtotime($d_create)));
            $month_idx = ($month >= 10) ? ($month - 10) : ($month + 2);

            // is_reply = "เคยถูกทักท้วง" (มีอย่างน้อย 1 รอบ) ไม่ใช่แค่ "รอบล่าสุดถูกรับคืนแล้ว"
            // เดิมใช้ !empty($row['d_receive_date']) ทำให้เอกสารที่ถูกทักท้วงแต่ยังค้างแก้ไข (รอบล่าสุดยังไม่ d_receive_date)
            // ถูกนับตกไปเป็น "ปกติ" ทั้งที่จริงคือถูกทักท้วง
            $protest_round_total = intval($row['protest_round_total'] ?? 0);
            // จำนวนรอบทักท้วงเฉพาะที่ d_doc_date อยู่ในช่วงปีงบประมาณที่เลือก (ใช้กับ Grand Total ให้ตรงกับ List_RepProtest.php)
            $protest_round_total_period = intval($row['protest_round_total_period'] ?? 0);
            $is_reply = $protest_round_total > 0;
            $po_working_status = intval($row['po_working_status'] ?? 0);
            // สถานะฝั่งคลัง (vw_po_working_pdf.i_status): 0 = ยังไม่มีการรับเรื่อง/ไม่พบข้อมูล, 1 = ส่งเบิกแล้วรอคลังตรวจรับ
            // ถือว่า "คลังรอรับเรื่องส่งเบิก" เมื่อ i_status <= 1 (ไม่ใช่แค่ === 1) และต้องไม่ใช่เอกสารที่ถูกทักท้วง
            $is_pending_receive = ($po_working_status <= 1) && !$is_reply;

            $data[] = [
                'month_idx'   => $month_idx,
                'staff_id'    => intval($row['sp_emp_id']),
                'staff_name'  => $row['staff_name'],
                'is_reply'    => $is_reply,
                'is_pending_receive' => $is_pending_receive,
                'po_working_hdr_id' => $row['po_working_hdr_id'],
                'c_code_ref'  => $row['c_code_ref'],
                // สถานะฝั่งคลัง (vw_po_working_pdf.i_status) ใช้เช็คเอกสารที่ "คลังรอรับใบขอเบิก" (i_status <= 1)
                'po_working_status' => $po_working_status,
                'd_create'    => $d_create,
                // จำนวนรอบที่ถูกทักท้วงทั้งหมดของเอกสารนี้ (ใช้รวม (SUM) เพื่อคำนวณยอดแบบนับซ้ำได้ทุกรอบ)
                'protest_round_total' => $protest_round_total,
                // จำนวนรอบทักท้วงเฉพาะในช่วงปีงบประมาณที่เลือก (d_doc_date อยู่ในช่วง) — ใช้กับ Grand Total (sum_reply_all)
                'protest_round_total_period' => $protest_round_total_period
            ];
        }
    }

    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(["success" => true, "data" => $data], JSON_UNESCAPED_UNICODE);
}

// เทียบยอดกับรายงาน List_RepProtest.php (EIS) — นับ "ทุกรอบทักท้วง" (นับซ้ำได้) โดยกรองด้วย
// วันที่ของรอบทักท้วงเอง (d_doc_date ใน po_working_item) แทน a.d_create ที่ Dashboard หลักใช้
// เพื่อให้เทียบตัวเลขกับ List_RepProtest ได้ตรงๆ (apples-to-apples) เมื่อระบุช่วงวันที่เดียวกัน
function List_CompareProtestRounds()
{
    global $db;

    $start_date = isset($_REQUEST['d_date_start']) ? $_REQUEST['d_date_start'] : '';
    $end_date = isset($_REQUEST['d_date_end']) ? $_REQUEST['d_date_end'] : '';

    if ($start_date === '' || $end_date === '') {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'message' => 'missing d_date_start / d_date_end']);
        return;
    }

    // กรองตามรายชื่อพนักงานที่ผู้ใช้ติ๊กเลือกไว้ (checkbox ฝั่ง UI) — ถ้าติ๊กครบทุกคน frontend จะส่งค่าว่างมา
    // (แปลว่า "ไม่กรอง") ใช้ sp_emp_id ที่มาจาก sp_check_period_hdr -> sp_tor_contract -> sp_tor รอบล่าสุด
    // ของแต่ละเอกสาร (OUTER APPLY เดียวกับที่ List_QueryParam() ด้านบนใช้หา tor.sp_emp_id ต่อแถว)
    // เพื่อให้ Grand Total bar เปลี่ยนตามรายชื่อที่เลือกจริง แทนที่จะรวมทุกคนเสมอไม่ว่าจะติ๊กกี่คนก็ตาม
    // หมายเหตุ: เอกสาร "ไม่ระบุ" (tor.sp_emp_id เป็น NULL) ไม่มี checkbox ให้เลือก/ยกเลิกแล้วฝั่ง frontend
    // จึงต้องนับรวมเสมอไม่ว่าจะเลือกพนักงานคนไหนบ้าง (ISNULL(...,-1) IN (ids...,-1) ทำให้ NULL แมตช์เสมอ)
    $staffIds = isset($_REQUEST['staff']) ? trim($_REQUEST['staff']) : '';
    $staffCond = "";
    if ($staffIds !== '') {
        $ids = array_filter(array_map('intval', explode(',', $staffIds)));
        if (!empty($ids)) {
            $idsStr = implode(',', $ids);
            $staffCond = " AND ISNULL(tor.sp_emp_id, -1) IN ($idsStr, -1) ";
        }
    }
    $staffJoin = "
        OUTER APPLY (
            SELECT TOP 1 d.sp_emp_id
            FROM sp_check_period_hdr sch
            INNER JOIN sp_tor_contract stc ON sch.sp_tor_contract_id = stc.sp_tor_contract_id
            INNER JOIN sp_tor d ON d.tor_id = stc.sp_tor_id
            WHERE sch.po_working_hdr_id = a.po_working_hdr_id
            ORDER BY sch.sp_check_period_hdr_id DESC
        ) tor
    ";

    $sql = "
        SELECT
            (SELECT COUNT(*)
             FROM NMU_EIS..po_working_hdr a
                INNER JOIN NMU_EIS..po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id
                INNER JOIN NMU_EIS..po_working_item bb ON a.po_working_hdr_id = bb.po_working_hdr_id AND bb.i_status = 3
                $staffJoin
             WHERE a.i_enable = 1
                AND b.dc_cost_id = '38'
                AND b.dc_cost_acc_id = 77
                AND CONVERT(date, bb.d_doc_date) BETWEEN '$start_date' AND '$end_date'
                $staffCond
            ) AS total_rounds
            ,(SELECT COUNT(DISTINCT a.po_working_hdr_id)
             FROM NMU_EIS..po_working_hdr a
                INNER JOIN NMU_EIS..po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id
                INNER JOIN NMU_EIS..po_working_item bb ON a.po_working_hdr_id = bb.po_working_hdr_id AND bb.i_status = 3
                $staffJoin
             WHERE a.i_enable = 1
                AND b.dc_cost_id = '38'
                AND b.dc_cost_acc_id = 77
                AND CONVERT(date, bb.d_doc_date) BETWEEN '$start_date' AND '$end_date'
                $staffCond
            ) AS total_docs
            -- ยอดส่งเบิกทั้งหมด (ใบเบิก) ในช่วงวันที่เดียวกัน นับจากวันที่สร้างใบเบิก (a.d_create)
            -- ใช้ join/filter ฐานเดียวกับ query หลักใน List_QueryParam() เพื่อให้ตัวเลขตรงกับที่เคยนับใน sum_sent_all เดิม
            ,(SELECT COUNT(*)
             FROM NMU_EIS..po_working_hdr a
                INNER JOIN NMU_EIS..po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id
                $staffJoin
             WHERE a.i_enable = 1
                AND b.dc_cost_id = '38'
                AND b.dc_cost_acc_id = 77
                AND CONVERT(date, a.d_create) BETWEEN '$start_date' AND '$end_date'
                $staffCond
            ) AS total_sent
            ,(SELECT COUNT(DISTINCT a.po_working_hdr_id)
             FROM NMU_EIS..po_working_hdr a
                INNER JOIN NMU_EIS..po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id
                $staffJoin
             WHERE a.i_enable = 1
                AND b.dc_cost_id = '38'
                AND b.dc_cost_acc_id = 77
                AND CONVERT(date, a.d_create) BETWEEN '$start_date' AND '$end_date'
                $staffCond
            ) AS total_sent_docs
    ";

    $stmt = $db->QueryParam($sql, array());
    $result = ['total_rounds' => 0, 'total_docs' => 0, 'total_sent' => 0, 'total_sent_docs' => 0];

    if ($stmt) {
        $row = $db->Fetch($stmt);
        if ($row) {
            $result['total_rounds'] = intval($row['total_rounds'] ?? 0);
            $result['total_docs'] = intval($row['total_docs'] ?? 0);
            $result['total_sent'] = intval($row['total_sent'] ?? 0);
            $result['total_sent_docs'] = intval($row['total_sent_docs'] ?? 0);
        }
    }

    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        "success" => true,
        "d_date_start" => $start_date,
        "d_date_end" => $end_date,
        "data" => $result
    ], JSON_UNESCAPED_UNICODE);
}

// รายงานสรุปรายเดือน ตั้งแต่ ต.ค. ปีงบประมาณที่เริ่มต้น จนถึงเดือนล่าสุด
// นับจำนวนเอกสาร แบ่งตามช่วงวัน (0-7 / 8-15 / 16-30 / เกิน 30 วัน) แบบเดียวกับ Rep_Rep0001
// สำหรับ 2 ช่วงเวลา:
//   stage1 = ตรวจรับ (d_audit_date) -> จัดทำใบขอเบิก (a.d_create)
//   stage2 = จัดทำใบขอเบิก (a.d_create) -> รับใบขอเบิก ฝ่ายคลัง (po_working_item.d_doc_date, i_sub_status='2.00')
// group_by=create (ค่าเริ่มต้น) จัดกลุ่มเดือนตามวันที่ "จัดทำใบขอเบิก"
// group_by=audit  จัดกลุ่มเดือนตามวันที่ "ตรวจรับ"
function List_MonthlyDurationSummary()
{
    global $db;

    $groupBy = (isset($_REQUEST['group_by']) && $_REQUEST['group_by'] === 'audit') ? 'audit' : 'create';

    // จุดเริ่มต้น: ต.ค. ปีงบประมาณ (ค.ศ. yearEn-1) ถึงเดือนปัจจุบัน
    $yearTh = isset($_REQUEST['year_en']) ? intval($_REQUEST['year_en']) : (date('Y') + 543);
    $yearEn = $yearTh - 543;
    $rangeStart = ($yearEn - 1) . "-10-01";
    $rangeEnd = date('Y-m-d'); // ถึงวันปัจจุบัน (เดือนล่าสุด)

    $sql = "
        SELECT
            a.po_working_hdr_id
            ,CONVERT(date, b.d_audit_date) AS d_audit_date
            ,CONVERT(date, a.d_create) AS d_create
            ,CONVERT(date, recv.d_doc_date) AS d_receive_request_date
        FROM NMU_EIS..po_working_hdr a
        INNER JOIN NMU_EIS..po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id
        LEFT JOIN NMU_EIS..po_working_item recv
            ON recv.po_working_hdr_id = a.po_working_hdr_id AND recv.i_sub_status = '2.00'
        WHERE
            a.i_enable = 1
            AND b.dc_cost_id = '38'
            AND b.dc_cost_acc_id = 77
            AND CONVERT(date, a.d_create) BETWEEN '$rangeStart' AND '$rangeEnd'
    ";

    $stmt = $db->QueryParam($sql, array());

    // เตรียมช่องเดือนล่วงหน้าตั้งแต่ ต.ค. ปีงบประมาณ ถึงเดือนปัจจุบัน (เรียงตามลำดับเวลา)
    $thaiMonthsShort = [
        '01' => 'ม.ค.', '02' => 'ก.พ.', '03' => 'มี.ค.', '04' => 'เม.ย.',
        '05' => 'พ.ค.', '06' => 'มิ.ย.', '07' => 'ก.ค.', '08' => 'ส.ค.',
        '09' => 'ก.ย.', '10' => 'ต.ค.', '11' => 'พ.ย.', '12' => 'ธ.ค.'
    ];
    $months = [];
    $cursor = new DateTime(($yearEn - 1) . "-10-01");
    $end = new DateTime(date('Y-m-01'));
    while ($cursor <= $end) {
        $key = $cursor->format('Y-m');
        $labelYearBE = (int)$cursor->format('Y') + 543; // แสดงปี พ.ศ. ในป้ายชื่อเดือน (เช่น ต.ค. 2568)
        $months[$key] = [
            'month_key' => $key,
            'month_label' => $thaiMonthsShort[$cursor->format('m')] . ' ' . $labelYearBE,
            'stage1' => ['d0_7' => 0, 'd8_15' => 0, 'd16_30' => 0, 'over30' => 0, 'total' => 0],
            'stage2' => ['d0_7' => 0, 'd8_15' => 0, 'd16_30' => 0, 'over30' => 0, 'total' => 0, 'pending' => 0]
        ];
        $cursor->modify('+1 month');
    }

    $bucketOf = function ($days) {
        if ($days <= 7) return 'd0_7';
        if ($days <= 15) return 'd8_15';
        if ($days <= 30) return 'd16_30';
        return 'over30';
    };

    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $d_audit = $row['d_audit_date'];
            $d_create = $row['d_create'];
            $d_receive = $row['d_receive_request_date'];

            $ts_audit = ($d_audit instanceof DateTime) ? $d_audit->getTimestamp() : (is_string($d_audit) && $d_audit !== '' ? strtotime($d_audit) : 0);
            $ts_create = ($d_create instanceof DateTime) ? $d_create->getTimestamp() : (is_string($d_create) && $d_create !== '' ? strtotime($d_create) : 0);
            $ts_receive = ($d_receive instanceof DateTime) ? $d_receive->getTimestamp() : (is_string($d_receive) && $d_receive !== '' ? strtotime($d_receive) : 0);

            // เดือนที่ใช้จัดกลุ่ม
            $groupTs = ($groupBy === 'audit') ? $ts_audit : $ts_create;
            if (!$groupTs) continue;
            $monthKey = date('Y-m', $groupTs);
            if (!isset($months[$monthKey])) continue; // นอกช่วงที่เตรียมไว้ (ไม่ควรเกิด แต่กันเหนียว)

            // stage1: ตรวจรับ -> จัดทำใบขอเบิก
            if ($ts_audit > 0 && $ts_create > 0) {
                $days1 = round(($ts_create - $ts_audit) / 86400);
                if ($days1 >= 0) {
                    $bucket1 = $bucketOf($days1);
                    $months[$monthKey]['stage1'][$bucket1]++;
                    $months[$monthKey]['stage1']['total']++;
                }
            }

            // stage2: จัดทำใบขอเบิก -> รับใบขอเบิก
            if ($ts_create > 0) {
                if ($ts_receive > 0) {
                    $days2 = round(($ts_receive - $ts_create) / 86400);
                    if ($days2 >= 0) {
                        $bucket2 = $bucketOf($days2);
                        $months[$monthKey]['stage2'][$bucket2]++;
                        $months[$monthKey]['stage2']['total']++;
                    }
                } else {
                    // ยังไม่มีวันที่รับใบขอเบิก = ฝ่ายคลังยังไม่รับเรื่อง (ค้างอยู่)
                    $months[$monthKey]['stage2']['pending']++;
                }
            }
        }
    }

    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        "success" => true,
        "group_by" => $groupBy,
        "d_date_start" => $rangeStart,
        "d_date_end" => $rangeEnd,
        "data" => array_values($months)
    ], JSON_UNESCAPED_UNICODE);
}

// รายการเอกสารของ 1 ช่องในตาราง "สรุประยะเวลาดำเนินการรายเดือน" (คลิกดูรายละเอียด)
// รับ month_key (Y-m), stage (1 = ตรวจรับ->จัดทำใบขอเบิก, 2 = จัดทำใบขอเบิก->รับใบขอเบิก)
// bucket (d0_7 / d8_15 / d16_30 / over30 / total / pending) ตรงกับตรรกะเดียวกับ List_MonthlyDurationSummary
function List_MonthlyDurationDetail()
{
    global $db;

    $groupBy = (isset($_REQUEST['group_by']) && $_REQUEST['group_by'] === 'audit') ? 'audit' : 'create';
    $monthKey = isset($_REQUEST['month_key']) ? trim($_REQUEST['month_key']) : '';
    $stage = (isset($_REQUEST['stage']) && intval($_REQUEST['stage']) === 2) ? 2 : 1;
    $allowedBuckets = ['d0_7', 'd8_15', 'd16_30', 'over30', 'total', 'pending'];
    $bucket = isset($_REQUEST['bucket']) ? trim($_REQUEST['bucket']) : '';

    if (!preg_match('/^\d{4}-\d{2}$/', $monthKey) || !in_array($bucket, $allowedBuckets, true)) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'message' => 'invalid parameter'], JSON_UNESCAPED_UNICODE);
        return;
    }

    $yearTh = isset($_REQUEST['year_en']) ? intval($_REQUEST['year_en']) : (date('Y') + 543);
    $yearEn = $yearTh - 543;
    $rangeStart = ($yearEn - 1) . "-10-01";
    $rangeEnd = date('Y-m-d');

    $sql = "
        SELECT
            chkp.c_code AS c_code
            ,(select c_code from sp_tor_contract where sp_tor_contract_id = chkp.sp_tor_contract_id) as c_code_contract
            ,a.c_code_ref
            ,(select c_full_name from nmu..dc_user where dc_user_id = a.dc_user_create_id) as emp_tt
            ,(Select inv_name from nmu..dc_creditor where dc_creditor_id = chkp.dc_creditor_id) as dc_creditor
            ,CONVERT(date, b.d_audit_date) AS d_audit_date
            ,CONVERT(date, a.d_create) AS d_create
            ,CONVERT(date, recv.d_doc_date) AS d_receive_request_date
        FROM NMU_EIS..po_working_hdr a
        INNER JOIN NMU_EIS..po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id
        OUTER APPLY (
            SELECT TOP 1
                sch.sp_check_period_hdr_id, sch.c_code, sch.dc_user_create_id, sch.dc_creditor_id, sch.sp_tor_contract_id
            FROM sp_check_period_hdr sch
            WHERE sch.po_working_hdr_id = a.po_working_hdr_id
            ORDER BY sch.sp_check_period_hdr_id DESC
        ) chkp
        LEFT JOIN NMU_EIS..po_working_item recv
            ON recv.po_working_hdr_id = a.po_working_hdr_id AND recv.i_sub_status = '2.00'
        WHERE
            a.i_enable = 1
            AND b.dc_cost_id = '38'
            AND b.dc_cost_acc_id = 77
            AND CONVERT(date, a.d_create) BETWEEN '$rangeStart' AND '$rangeEnd'
    ";

    $stmt = $db->QueryParam($sql, array());

    $bucketOf = function ($days) {
        if ($days <= 7) return 'd0_7';
        if ($days <= 15) return 'd8_15';
        if ($days <= 30) return 'd16_30';
        return 'over30';
    };

    $result = [];
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $d_audit = $row['d_audit_date'];
            $d_create = $row['d_create'];
            $d_receive = $row['d_receive_request_date'];

            $ts_audit = ($d_audit instanceof DateTime) ? $d_audit->getTimestamp() : (is_string($d_audit) && $d_audit !== '' ? strtotime($d_audit) : 0);
            $ts_create = ($d_create instanceof DateTime) ? $d_create->getTimestamp() : (is_string($d_create) && $d_create !== '' ? strtotime($d_create) : 0);
            $ts_receive = ($d_receive instanceof DateTime) ? $d_receive->getTimestamp() : (is_string($d_receive) && $d_receive !== '' ? strtotime($d_receive) : 0);

            $groupTs = ($groupBy === 'audit') ? $ts_audit : $ts_create;
            if (!$groupTs || date('Y-m', $groupTs) !== $monthKey) continue;

            $days = null;
            $match = false;

            if ($stage === 1) {
                if ($ts_audit > 0 && $ts_create > 0) {
                    $d1 = round(($ts_create - $ts_audit) / 86400);
                    if ($d1 >= 0) {
                        $days = $d1;
                        if ($bucket === 'total' || $bucketOf($d1) === $bucket) $match = true;
                    }
                }
            } else {
                if ($ts_create > 0) {
                    if ($ts_receive > 0) {
                        $d2 = round(($ts_receive - $ts_create) / 86400);
                        if ($d2 >= 0) {
                            $days = $d2;
                            if ($bucket === 'total' || $bucketOf($d2) === $bucket) $match = true;
                        }
                    } elseif ($bucket === 'pending') {
                        $match = true;
                    }
                }
            }

            if (!$match) continue;

            $result[] = [
                'c_code' => $row['c_code'],
                'c_code_contract' => $row['c_code_contract'],
                'c_code_ref' => $row['c_code_ref'],
                'emp_tt' => $row['emp_tt'],
                'dc_creditor' => $row['dc_creditor'],
                'd_audit_date' => ($d_audit instanceof DateTime) ? $d_audit->format('Y-m-d') : $d_audit,
                'd_create' => ($d_create instanceof DateTime) ? $d_create->format('Y-m-d') : $d_create,
                'd_receive_request_date' => ($d_receive instanceof DateTime) ? $d_receive->format('Y-m-d') : $d_receive,
                'days' => $days,
            ];
        }
    }

    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        "success" => true,
        "group_by" => $groupBy,
        "month_key" => $monthKey,
        "stage" => $stage,
        "bucket" => $bucket,
        "data" => $result
    ], JSON_UNESCAPED_UNICODE);
}

$fn = $_REQUEST['fn'] ?? '';
if ($fn === 'List_QueryParam') {
    List_QueryParam();
} elseif ($fn === 'List_CompareProtestRounds') {
    List_CompareProtestRounds();
} elseif ($fn === 'List_MonthlyDurationSummary') {
    List_MonthlyDurationSummary();
} elseif ($fn === 'List_MonthlyDurationDetail') {
    List_MonthlyDurationDetail();
} else {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'message' => 'invalid fn']);
}