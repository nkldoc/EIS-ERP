<?php
define('INCLUDED_AS_LIB', true);
include("../api/List_DetailBgV5.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();
$title   = defined('CUSTOMER_NAME_TH') ? CUSTOMER_NAME_TH : 'รายงาน';
$year_en = isset($_REQUEST["year_en"]) ? intval($_REQUEST["year_en"]) : intval(date('Y'));
$year_th = $year_en + 543;

// ===== คอลัมน์ที่คลิกมาจาก DataView =====
$col = in_array($_REQUEST["col"] ?? "", ["budget","reserve","remaining","paid"])
       ? $_REQUEST["col"] : "reserve";

// ===== ยอดเงิน 3 คอลัมน์ที่ JS ส่งมา =====
$f_budget_total  = floatval($_REQUEST["f_budget"]    ?? 0);
$f_reserve_total = floatval($_REQUEST["f_reserve"]   ?? 0);
$f_remaining     = floatval($_REQUEST["f_remaining"] ?? 0);

// ✅ แก้ไข 1: ลบ block สลับ budget/reserve ออก
// เดิมถ้า budget < reserve จะสลับค่า ทำให้งบประมาณแสดงผิด
// if ($f_budget_total < $f_reserve_total) {
//     $tmp = $f_budget_total;
//     $f_budget_total = $f_reserve_total;
//     $f_reserve_total = $tmp;
//     $f_remaining = $f_budget_total - $f_reserve_total;
// }

// label ของแถวที่คลิก (bg_expense)
$bg_expense_label = htmlspecialchars($_REQUEST["bg_expense_label"] ?? "");

// mapping ชื่อ / สี / text-class ตามคอลัมน์ที่คลิก
$colLabel = ["budget" => "งบประมาณ", "reserve" => "เงินจองงบประมาณ<br>ตามบัญชีจัดสรร", "remaining" => "คงเหลือหลังจองเงิน", "paid" => "เบิกจ่ายแล้ว"][$col];
$colColor = ["budget" => "#4e73df",  "reserve" => "#f6c23e",         "remaining" => "#1cc88a",           "paid" => "#20c997"][$col];
$colText  = ["budget" => "text-primary", "reserve" => "text-warning", "remaining" => "text-success",      "paid" => "text-info"][$col];

// ===== ดึงข้อมูลจาก API =====
$data_json = List_QueryParam();
$data_arr  = json_decode($data_json, true);
$data      = $data_arr["data"] ?? [];

// [FIX] ตัดแถวยอดเงิน 0 ออกทั้งชุด — has_po เช็คแค่ pr_id ว่าเคยมี PO หรือไม่ ไม่ได้เช็คว่าตรงกับ
// budget_type ของแถวนั้นด้วย PR ที่มีเงินจองอยู่ใน 2 budget_type (เคยมี PO ทั้งคู่) แต่ budget_type
// หนึ่งถูกเบิกจ่ายจนหมดแล้ว (เหลือ f_amt = 0.00) จะยังติด has_po=1 กลายเป็นแถว "ซาก" ไม่มีความหมาย
// ให้แสดง (ดูคอมเมนต์เดียวกันใน Rep_PrPoListV5.php) ไม่กระทบ $f_pr_total เพราะมาจาก API แยก
// และไม่กระทบผลรวมใดๆ (บวก 0 ไม่เปลี่ยนผลรวม)
$data = array_values(array_filter($data, function ($r) {
    return floatval($r['f_amt'] ?? 0) > 0.005;
}));

$total_count = count($data);
$f_pr_total  = floatval($data_arr['f_pr_total'] ?? 0);

$f_plan_cut_total   = floatval($data_arr['f_plan_cut_total']   ?? 0);
$f_period_cut_total = floatval($data_arr['f_period_cut_total'] ?? 0);

// ===== เงินจองสัญญา =====
// [FIX] เดิมใช้ $data_arr["contract"] (Result Set 3 ที่ join po_id -> sp_Tor โดยตรง) ซึ่งบาง PO
// ไม่มีเลขที่/ชื่อ PO บันทึกไว้ในตาราง sp_Tor เลยขึ้น "-" (ยอดเงินถูกต้อง แต่เลขสัญญาหาย)
// เปลี่ยนมาใช้แถวจาก Result Set 1 (join ผ่าน pr_id เสมอ จึงไม่มีทาง "-") ที่ has_po > 0 แทน
// เหมือนกับที่ Rep_PrPoListV5.php แก้ไปแล้ว (ดูคอมเมนต์ [FIX-CHECKSUM] ในไฟล์นั้น) เป็นยอดเงิน
// ก้อนเดียวกันเป๊ะ (รวม/จำนวนรายการตรงกัน) แค่ไม่มี field ขาดหาย
//
// [FIX] has_po เช็คแค่ pr_id ว่าเคยมี PO ในระบบหรือไม่ ไม่ได้เช็คว่า PO นั้นตรงกับ budget_type/
// bg_expense ของแถวนี้ด้วย PR ที่มีเงินจองอยู่ใน 2 budget_type (เคยมี PO ทั้งคู่) แต่ budget_type
// หนึ่งถูกเบิกจ่ายจนหมดแล้ว (เหลือ f_amt = 0.00) จะยังติด has_po=1 อยู่ ทำให้มีแถว "ซาก" ยอด 0.00
// โผล่ในตาราง PO (พิสูจน์จากข้อมูลจริง PR25681000115: budget_type=4 เหลือ 0.00, budget_type=49
// เหลือ 11,329,266.90 แต่ has_po=1 ทั้งคู่) ตัดแถวยอด 0 ออกไปเลย เพราะไม่มีความหมายให้แสดง และ
// ไม่กระทบยอดรวม (บวก 0 ไม่เปลี่ยนผลรวม)
$contract_rows    = array_values(array_filter($data, function ($r) {
    return intval($r['has_po'] ?? 0) > 0 && floatval($r['f_amt'] ?? 0) > 0.005;
}));
$f_contract_total = array_sum(array_column($contract_rows, 'f_amt'));
$total_contract   = count($contract_rows);

// ✅ แก้ไข 3: คำนวณ "ที่ใช้ไป (จอง)" จากยอดรายการจริง (Result Set 1) แทนการเชื่อค่า
// f_reserve ที่ส่งมาทาง URL จากหน้า Dashboard ก่อนหน้า (ซึ่งมาจากสโตร์โปรซีเยอร์
// SP_BG_BUDGET_SUM คนละ query กับรายการ PR/PO ที่แสดงจริงในหน้านี้ ทำให้ยอดไม่ตรงกัน)
//
// [FIX 2026-07-28] เดิมเคยบวก + $f_contract_total เข้าไปด้วย โดยเข้าใจผิดว่า $f_pr_total
// (จาก API) มีแค่ยอด PR ที่ยังไม่มี PO เท่านั้น แต่จริง ๆ Result Set 1 ใน List_DetailBgV5.php
// (ที่มาของ $f_pr_total) กรองแค่ i_reserve != 3 ครอบคลุมทั้ง PR-stage (i_reserve=1) และ
// PO-stage (i_reserve=2) อยู่แล้วโดยไม่ทับซ้อนกัน (คำนวณจาก SP_BG_RESERVE_MONEY โดยตรง
// ซึ่งยืนยันแล้วว่ายอดถูกต้อง) การบวก $f_contract_total ซ้ำเข้าไปอีกจึงไม่ถูกต้อง
// และยิ่งแย่กว่านั้นคือ $f_contract_total นับเฉพาะ PO ที่ i_own_match=1 (ตรงกับ bg_expense/
// budget_type ที่กำลังกรองอยู่พอดี) ทำให้ PR ที่มี PO แต่ PO ถูก reclassify เป็นคนละ
// bg_expense/budget_type สูญเงินไปจากทั้งสองยอด (ก่อนหน้านี้เคยถูกตัดออกจาก
// $f_pr_only_total เพราะ has_po=1 ด้วย) รวมเป็นยอดหาย 1,776,100 บาทที่เจอ
//
// $f_contract_total ยังคงใช้แสดงในการ์ด "เงินจองสัญญา (PO)" แยกต่างหากตามปกติ
// เพียงแค่ไม่ต้องเอามาบวกรวมกับ $f_pr_total อีก
$f_reserve_total = $f_pr_total;

// ===== เงินจองตรวจรับ / เบิกจ่ายแล้ว / D1 (ดึงจาก API ที่เพิ่มมาให้ตรงกับ Budget_Monitoring_Dashboard.php) =====
$f_check_total   = floatval($data_arr['f_reserve_check_total'] ?? 0); // เงินจองตรวจรับ (i_reserve=3, i_finish=0)
$f_paid_total    = floatval($data_arr['f_paid_total']          ?? 0); // เบิกจ่ายแล้ว (i_reserve=3, i_finish=1)
$f_d1_not_finish = floatval($data_arr['f_d1_not_finish']       ?? 0); // D1 ที่ยังไม่เคลียร์

// ✅ แก้ไข 4: สูตร "คงเหลือหลังจองเงิน" ให้ตรงกับ Budget_Monitoring_Dashboard.php
// เดิม: f_remaining = f_budget_total - f_reserve_total (ไม่ได้หักเงินจองตรวจรับ/เบิกจ่ายแล้ว/D1 ออก ทำให้คงเหลือสูงเกินจริง)
// สูตรจริงในหน้า Dashboard (Budget_Monitoring_Dashboard.js):
//   remain = (dc_expense_budget_type_id === 5 ? Math.max(0, total - booked) : total - booked) - insp - paid - d1
$dc_expense_budget_type_id = intval($_REQUEST["dc_expense_budget_type_id"] ?? 0);
$f_reserve_net = ($dc_expense_budget_type_id === 5)
    ? max(0, $f_budget_total - $f_reserve_total)
    : ($f_budget_total - $f_reserve_total);
$f_remaining = $f_reserve_net - $f_check_total - $f_paid_total - $f_d1_not_finish;

// ===== ยอดที่แสดงในการ์ดบนสุด (ต้องคำนวณหลังจากได้ f_reserve_total/f_remaining ที่ถูกต้องแล้ว) =====
$display_amount = ["budget" => $f_budget_total, "reserve" => $f_reserve_total, "remaining" => $f_remaining, "paid" => $f_paid_total][$col];
$pct_used = ($f_budget_total > 0) ? round(($f_reserve_total / $f_budget_total) * 100, 2) : 0;

// ✅ แก้ไข 2: ลบ special case 030300210001 ออก
// เดิม block นี้บังคับให้ remaining = 0 เสมอ ทำให้คงเหลือแสดงไม่ถูกต้อง
// if ($bg_expense_label && strpos($bg_expense_label, '030300210001') !== false) {
//     $f_reserve_total = $f_pr_total + $f_contract_total;
//     if ($f_budget_total < $f_reserve_total) {
//         $f_budget_total = $f_reserve_total;
//     }
//     $f_remaining = $f_budget_total - $f_reserve_total;
// }

function thaiDate($dateStr)
{
    if (!$dateStr || $dateStr === '0000-00-00') return '-';
    $months = ["", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    $date = new DateTime($dateStr);
    return (int)$date->format("j") . " " . $months[(int)$date->format("n")] . " " . ((int)$date->format("Y") + 543);
}
?>
<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="shortcut icon" href="../../images/favicon.ico" type="image/x-icon">
    <link rel="icon" href="../../images/favicon.ico" type="image/x-icon">
    <title>งบประมาณ - Dashboard + Data View</title>
    <?php include("../lib/loadJs.php"); ?>
    <script src="../../ws_user/js/jquery.min.js"></script>
    <script src="../../js/echarts/echarts.js"></script>
    <script src="../bootstrap/bootstrap-4.6.2-dist/js/bootstrap.bundle.min.js"></script>
    <script src="../bootstrap/bootstrap-select-1.13.14/dist/js/bootstrap-select.min.js"></script>
    <script src="../../js/echarts/macarons.js"></script>
    <script src="../../lib/xlsx-js-style.min.js"></script>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title><?php echo COMPANY_NAME; ?></title>
    <link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
    <link rel="stylesheet" type="text/css" href="../css/report-style.css">
    <link rel="stylesheet" type="text/css" href="../bootstrap/bootstrap-4.6.2-dist/css/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="../bootstrap/bootstrap-select-1.13.14/dist/css/bootstrap-select.min.css">
    <link rel="stylesheet" type="text/css" href="../css/report-style-table.css">
    <script type="text/javascript" src="../js/storeRep/storeRep.js?_dc<?= __VPRODUCT_; ?>"></script>
</head>

<body>
<div class="container-fluid pt-4 pb-5">

    <div class="row mb-4">
        <div class="col-12 mb-3">
            <h4 class="font-weight-bold">รายละเอียดข้อมูล PR (ปีงบประมาณ <?= $year_th ?>)</h4>
            <?php if ($bg_expense_label): ?>
            <p class="text-muted mb-1"><strong><?= $bg_expense_label ?></strong></p>
            <?php endif; ?>
        </div>

        <!-- ===== Stat Card หลัก ===== -->
        <div class="col-12 mb-3">
            <div class="stat-card" style="border-left-color:<?= $colColor ?>; padding: 1rem 1.5rem;">
                <div class="stat-title" style="font-size:.9rem; margin-bottom:.3rem;">
                    ▶ ยอด <strong><?= $colLabel ?></strong> (ที่คลิกเข้ามา)
                </div>
                <div class="stat-value <?= $colText ?>" style="font-size:2rem; font-weight:700;">
                    <?= number_format($display_amount, 2) ?> <small style="font-size:1rem; font-weight:400;">บาท</small>
                </div>
            </div>
        </div>

        <!-- ===== 3 Stat Cards ตรงกับ DataView ===== -->
        <div class="col-md-4 col-sm-6 mb-3">
            <div class="stat-card" style="border-left-color:#4e73df;<?= $col==='budget' ? ' outline:2px solid #4e73df;' : '' ?>">
                <div class="stat-title">งบประมาณ</div>
                <div class="stat-value text-primary"><?= number_format($f_budget_total, 2) ?></div>
            </div>
        </div>
        <div class="col-md-4 col-sm-6 mb-3">
            <div class="stat-card" style="border-left-color:#f6c23e;<?= $col==='reserve' ? ' outline:2px solid #f6c23e;' : '' ?>">
                <div class="stat-title">เงินจองงบประมาณตามบัญชีจัดสรร</div>
                <div class="stat-value text-warning"><?= number_format($f_reserve_total, 2) ?></div>
                <div class="small text-muted"><?= $pct_used ?>% ของงบประมาณ</div>
            </div>
        </div>
        <div class="col-md-4 col-sm-6 mb-3">
            <div class="stat-card" style="border-left-color:#1cc88a;<?= $col==='remaining' ? ' outline:2px solid #1cc88a;' : '' ?>">
                <div class="stat-title">คงเหลือหลังจองเงิน</div>
                <div class="stat-value text-success"><?= number_format($f_remaining, 2) ?></div>
            </div>
        </div>

        <!-- เงินจองตรวจรับ (i_reserve=3, i_finish=0) -->
        <div class="col-md-3 col-sm-6 mb-3">
            <div class="stat-card" style="border-left-color:#6f42c1;">
                <div class="stat-title">เงินจองตรวจรับ</div>
                <div class="stat-value" style="color:#6f42c1;"><?= number_format($f_check_total, 2) ?></div>
            </div>
        </div>

        <!-- เบิกจ่ายแล้ว (i_reserve=3, i_finish=1) -->
        <div class="col-md-3 col-sm-6 mb-3">
            <div class="stat-card" style="border-left-color:#20c997;<?= $col==='paid' ? ' outline:2px solid #20c997;' : '' ?>">
                <div class="stat-title">เบิกจ่ายแล้ว</div>
                <div class="stat-value text-info"><?= number_format($f_paid_total, 2) ?></div>
            </div>
        </div>

        <!-- เงินจอง PR (ยังไม่มี PO) -->
        <div class="col-md-3 col-sm-6 mb-3">
            <div class="stat-card" style="border-left-color:#36b9cc;">
                <div class="stat-title">เงินจอง PR (ยังไม่มี PO)</div>
                <div class="stat-value text-info"><?= number_format($f_pr_total, 2) ?></div>
                <div class="small text-muted"><?= number_format($total_count) ?> รายการ</div>
            </div>
        </div>

        <!-- เงินจองสัญญา (PO) -->
        <div class="col-md-3 col-sm-6 mb-3">
            <div class="stat-card" style="border-left-color:#e74a3b;">
                <div class="stat-title">เงินจองสัญญา (PO)</div>
                <div class="stat-value text-danger"><?= number_format($f_contract_total, 2) ?></div>
                <div class="small text-muted"><?= number_format($total_contract) ?> รายการ</div>
            </div>
        </div>

        <!-- PR + PO รวม -->
        <?php
            $f_pr_po_total     = $f_pr_total + $f_contract_total;
            $total_pr_po_count = $total_count + $total_contract;
        ?>
        <div class="col-md-3 col-sm-6 mb-3">
            <div class="stat-card" style="border-left-color:#858796;">
                <div class="stat-title">ยอดจองทั้งหมด (PR+PO)</div>
                <div class="stat-value"><?= number_format($f_pr_po_total, 2) ?></div>
                <div class="small text-muted"><?= number_format($total_pr_po_count) ?> รายการ
                    (PR <?= number_format($total_count) ?> + PO <?= number_format($total_contract) ?>)
                </div>
            </div>
        </div>

    </div>

    <!-- ===== ตาราง PR ===== -->
    <div class="card-custom">
        <div class="toolbar">
            <div class="d-flex align-items-center">
                <div class="search-box">
                    <i class="search-icon">🔍</i>
                    <input type="text" id="searchInput" class="form-control" placeholder="ค้นหา เลขที่ PR, รายการ, ผู้รับผิดชอบ...">
                </div>
            </div>
            <div>
                <button class="btn btn-success btn-sm rounded-pill px-3" onclick="exportPRToExcel()">
                    <i class="mr-1">📊</i> Export PR
                </button>
            </div>
        </div>

        <div class="table-responsive">
            <table class="table-modern" id="prTable">
                <thead>
                    <tr>
                        <th class="text-center" width="50">#</th>
                        <th>เลขที่ PR</th>
                        <th>ชื่อรายการ</th>
                        <th>ประเภทความก้าวหน้า</th>
                        <th>หน่วยงาน</th>
                        <th>สถานะ</th>
                        <th>แหล่งเงิน</th>
                        <th>ผู้รับผิดชอบ</th>
                        <th>สายงาน</th>
                        <th class="text-center">มี PO</th>
                        <th class="text-right">เงินจอง PR (บาท)</th>
                    </tr>
                </thead>
                <tbody id="prTableBody">
                    <?php if (count($data) > 0): ?>
                        <?php foreach ($data as $i => $row):
                            $status = $row['sp_status_hdr'] ?? '-';
                            $badgeClass = 'bg-status-gray';
                            if (strpos($status, 'e-GP') !== false) $badgeClass = 'bg-status-blue';
                            elseif (strpos($status, 'อนุมัติ') !== false) $badgeClass = 'bg-status-green';
                            elseif (strpos($status, 'รอ') !== false) $badgeClass = 'bg-status-orange';

                            $f_amt  = floatval($row['f_amt'] ?? 0);
                            $has_po = intval($row['has_po'] ?? 0);
                        ?>
                            <tr>
                                <td class="text-center text-muted"><?= $i + 1 ?></td>
                                <td class="font-weight-bold text-primary"><?= $row['c_code'] ?? '-' ?></td>
                                <td style="vertical-align: top;">
                                    <div class="text-left" style="min-width: 350px; white-space: normal; word-wrap: break-word; line-height: 1.4;">
                                        <?= $row['c_name'] ?? '-' ?>
                                    </div>
                                </td>
                                <td>
                                    <small class="d-block text-muted"><?= $row['event_type'] ?? '-' ?></small>
                                    <?= $row['sp_event_detail'] ?? '' ?>
                                </td>
                                <td>
                                    <div style="font-size:0.9rem;"><?= $row['dc_cost_id2'] ?? '-' ?></div>
                                    <small class="text-muted"><?= $row['dc_sub_cost'] ?? '' ?></small>
                                </td>
                                <td>
                                    <span class="badge-custom <?= $badgeClass ?>"><?= $status ?></span>
                                </td>
                                <td>
                                    <div style="font-size:0.9rem;"><?= $row['dc_expense_budget_type'] ?? '-' ?></div>
                                    <small class="text-muted"><?= $row['bg_expense'] ?? '' ?></small>
                                </td>
                                <td><?= $row['sp_emp'] ?? '-' ?></td>
                                <td><?= $row['dc_department'] ?? '-' ?></td>
                                <!-- คอลัมน์แสดงว่า PR นี้มี PO แล้วหรือยัง -->
                                <td class="text-center">
                                    <?php if ($has_po > 0): ?>
                                        <span class="badge-custom bg-status-blue" title="PR นี้ออก PO แล้ว">✓ PO</span>
                                    <?php else: ?>
                                        <span class="badge-custom bg-status-gray" title="ยังไม่มี PO">-</span>
                                    <?php endif; ?>
                                </td>
                                <td class="text-right font-weight-bold <?= $has_po > 0 ? 'text-muted' : '' ?>">
                                    <?= number_format($f_amt, 2) ?>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <tr>
                            <td colspan="11" class="text-center py-5">ไม่พบข้อมูล</td>
                        </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>

        <div class="p-3 text-right text-muted small border-top">
            ข้อมูล ณ วันที่ <?= date("d/m/Y H:i") ?>
        </div>
    </div>

    <!-- ===== ตารางเงินจองสัญญา (PO) ===== -->
    <div class="card-custom mt-4">
        <div class="toolbar">
            <div class="d-flex align-items-center">
                <h6 class="font-weight-bold mb-0">📋 รายการเงินจองสัญญา (PO)</h6>
                <span class="ml-3 text-danger font-weight-bold">
                    ยอดรวม: <?= number_format($f_contract_total, 2) ?> บาท
                </span>
            </div>
            <div class="d-flex align-items-center">
                <div class="search-box mr-2">
                    <i class="search-icon">🔍</i>
                    <input type="text" id="searchContractInput" class="form-control" placeholder="ค้นหา เลขที่ PO, รายการ, ผู้รับผิดชอบ...">
                </div>
                <button class="btn btn-danger btn-sm rounded-pill px-3" onclick="exportContractToExcel()">
                    <i class="mr-1">📊</i> Export สัญญา
                </button>
            </div>
        </div>

        <div class="table-responsive">
            <table class="table-modern" id="contractTable">
                <thead>
                    <tr>
                        <th class="text-center" width="50">#</th>
                        <th>เลขที่ PO</th>
                        <th>ชื่อรายการ</th>
                        <th>หน่วยงาน</th>
                        <th>สถานะ</th>
                        <th>แหล่งเงิน</th>
                        <th>ผู้รับผิดชอบ</th>
                        <th>สายงาน</th>
                        <th class="text-right">เงินจองสัญญา (บาท)</th>
                    </tr>
                </thead>
                <tbody id="contractTableBody">
                    <?php if (count($contract_rows) > 0): ?>
                        <?php foreach ($contract_rows as $i => $row):
                            $status = $row['sp_status_hdr'] ?? '-';
                            $badgeClass = 'bg-status-gray';
                            if (strpos($status, 'e-GP') !== false) $badgeClass = 'bg-status-blue';
                            elseif (strpos($status, 'อนุมัติ') !== false) $badgeClass = 'bg-status-green';
                            elseif (strpos($status, 'รอ') !== false) $badgeClass = 'bg-status-orange';

                            $f_amt_contract = floatval($row['f_amt'] ?? 0);
                        ?>
                            <tr>
                                <td class="text-center text-muted"><?= $i + 1 ?></td>
                                <td class="font-weight-bold text-danger"><?= $row['c_code'] ?? '-' ?></td>
                                <td style="vertical-align: top;">
                                    <div class="text-left" style="min-width: 300px; white-space: normal; word-wrap: break-word; line-height: 1.4;">
                                        <?= $row['c_name'] ?? '-' ?>
                                    </div>
                                </td>
                                <td>
                                    <div style="font-size:0.9rem;"><?= $row['dc_cost_id2'] ?? '-' ?></div>
                                    <small class="text-muted"><?= $row['dc_sub_cost'] ?? '' ?></small>
                                </td>
                                <td>
                                    <span class="badge-custom <?= $badgeClass ?>"><?= $status ?></span>
                                </td>
                                <td>
                                    <div style="font-size:0.9rem;"><?= $row['dc_expense_budget_type'] ?? '-' ?></div>
                                    <small class="text-muted"><?= $row['bg_expense'] ?? '' ?></small>
                                </td>
                                <td><?= $row['sp_emp'] ?? '-' ?></td>
                                <td><?= $row['dc_department'] ?? '-' ?></td>
                                <td class="text-right font-weight-bold text-danger">
                                    <?= number_format($f_amt_contract, 2) ?>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <tr>
                            <td colspan="9" class="text-center py-5 text-muted">ไม่พบรายการเงินจองสัญญา</td>
                        </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>

        <div class="p-3 text-right text-muted small border-top">
            ข้อมูล ณ วันที่ <?= date("d/m/Y H:i") ?>
        </div>
    </div>

</div><!-- /container-fluid -->

<script>
    $(document).ready(function() {

        // ===== Search ตาราง PR =====
        $("#searchInput").on("keyup", function() {
            var value = $(this).val().toLowerCase();
            $("#prTableBody tr").filter(function() {
                $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
            });
        });

        // ===== Search ตารางสัญญา =====
        $("#searchContractInput").on("keyup", function() {
            var value = $(this).val().toLowerCase();
            $("#contractTableBody tr").filter(function() {
                $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
            });
        });

    });

    // ===== Export PR Excel =====
    function exportPRToExcel() {

        var X = XLSX;

        var fBudget      = <?= json_encode($f_budget_total) ?>;
        var fReserve     = <?= json_encode($f_reserve_total) ?>;
        var fRemaining   = <?= json_encode($f_remaining) ?>;
        var fPrOnlyTotal = <?= json_encode($f_pr_total) ?>;
        var fPrWithPo    = 0;
        var fPrTotal     = <?= json_encode($f_pr_total) ?>;
        var fCheck       = <?= json_encode($f_check_total) ?>;
        var fPaid        = <?= json_encode($f_paid_total) ?>;
        var bgLabel      = <?= json_encode($bg_expense_label) ?>;
        var yearTh       = <?= json_encode($year_th) ?>;

        // ดึงข้อมูล PR จากตาราง HTML
        var prRows = [];
        $("#prTableBody tr").each(function() {
            var row = [];
            $(this).find("td").each(function(i) {
                if (i >= 11) return;
                var txt = $(this).text().trim().replace(/\s+/g, " ");
                if (i === 10) row.push(parseFloat(txt.replace(/,/g, "")) || 0);
                else row.push(txt);
            });
            prRows.push(row);
        });

        var prHeaders = ["#","เลขที่ PR","ชื่อรายการ","ประเภทความก้าวหน้า","หน่วยงาน","สถานะ","แหล่งเงิน","ผู้รับผิดชอบ","สายงาน","มี PO","เงินจอง PR (บาท)"];
        var numFmt = '#,##0.00';

        // ===== Style helpers =====
        function cs(bgHex, fontHex, bold, numFmtCode, sz, h) {
            var s = {
                fill: { patternType: 'solid', fgColor: { rgb: bgHex || 'FFFFFFFF' } },
                font: { bold: !!bold, sz: sz || 10, name: 'Calibri' },
                alignment: { vertical: 'center', horizontal: h || 'left', wrapText: false },
                border: {
                    top:    { style: 'thin', color: { rgb: 'FFD1D5DB' } },
                    bottom: { style: 'thin', color: { rgb: 'FFD1D5DB' } },
                    left:   { style: 'thin', color: { rgb: 'FFD1D5DB' } },
                    right:  { style: 'thin', color: { rgb: 'FFD1D5DB' } },
                }
            };
            if (fontHex) s.font.color = { rgb: fontHex };
            if (numFmtCode) s.numFmt = numFmtCode;
            s.alignment.horizontal = h ? h : (numFmtCode ? 'right' : 'left');
            return s;
        }
        function cell(v, bgHex, fontHex, bold, numFmtCode, sz, h) {
            var t = (typeof v === 'number') ? 'n' : 's';
            return { v: v, t: t, s: cs(bgHex, fontHex, bold, numFmtCode, sz, h) };
        }

        var C = {
            row1_bg:  'D9E1F2', row1_fc:  '1F3864',
            bud_bg:   '4472C4', bud_fc:   'FFFFFF',
            res_bg:   'F6C23E', res_fc:   '000000',
            rem_bg:   '1CC88A', rem_fc:   '000000',
            pr_bg:    '36B9CC', pr_fc:    'FFFFFF',
            num_bg:   'F2F2F2',
            hdr_bg:   '4472C4', hdr_fc:   'FFFFFF',
            stripe:   'EEF2FF', white:    'FFFFFFFF',
            r3res_bg: 'FFF3CD', r3res_fc: '856404',
            r3rem_bg: 'D4EDDA', r3rem_fc: '155724',
            r3bud_bg: 'D9E1F2', r3bud_fc: '2C5282',
            sumres_bg:'FFF3CD', sumres_fc:'856404',
            sumrem_bg:'D4EDDA', sumrem_fc:'155724',
            amt_fc:   '1A56DB',
            pr_fc2:   '17A2B8',
            chk_bg:   'E2D9F3', chk_fc:   '432874',
            paid_bg:  'D1F5E8', paid_fc:  '0F6848',
        };

        function makeSummary(r3Bg, r3Fc, r3Label) {
            return [
                [cell("ปีงบประมาณ " + yearTh + (bgLabel ? "  |  " + bgLabel : ""), C.row1_bg, C.row1_fc, true)],
                [
                    cell("งบประมาณ",          C.bud_bg, C.bud_fc, true),
                    cell(fBudget,              C.num_bg, null,     true, numFmt),
                    cell("เงินจองงบประมาณตามบัญชีจัดสรร",    C.res_bg, C.res_fc, true),
                    cell(fReserve,             C.num_bg, null,     true, numFmt),
                    cell("เงินจองตรวจรับ",     C.chk_bg, C.chk_fc, true),
                    cell(fCheck,               C.num_bg, null,     true, numFmt),
                    cell("เบิกจ่ายแล้ว",       C.paid_bg,C.paid_fc,true),
                    cell(fPaid,                C.num_bg, null,     true, numFmt),
                    cell("คงเหลือ",            C.rem_bg, C.rem_fc, true),
                    cell(fRemaining,           C.num_bg, null,     true, numFmt),
                    cell("เงินจอง PR",         C.pr_bg,  C.pr_fc,  true),
                    cell(fPrTotal,             C.num_bg, C.pr_fc2, true, numFmt)
                ],
                [cell("▶ คอลัมน์ที่เลือก: " + r3Label, r3Bg, r3Fc, true)],
                [cell('', C.white, null, false)]
            ];
        }

        function aoaToSheet(aoa, rowHeights) {
            var ws = {};
            var maxR = aoa.length, maxC = 0;
            aoa.forEach(function(row, ri) {
                if (row.length > maxC) maxC = row.length;
                row.forEach(function(c, ci) {
                    if (c == null) return;
                    var addr = X.utils.encode_cell({r: ri, c: ci});
                    ws[addr] = (typeof c === 'object' && c.v !== undefined) ? c : { v: c, t: typeof c === 'number' ? 'n' : 's' };
                });
            });
            ws["!ref"] = X.utils.encode_range({s:{r:0,c:0}, e:{r:maxR-1,c:maxC-1}});
            if (rowHeights) ws['!rows'] = rowHeights.map(function(h){ return {hpt:h, hpx:h}; });
            return ws;
        }

        function makeRowHeights(dataCount) {
            var h = [26, 24, 20, 20, 6, 28];
            for (var i = 0; i < dataCount; i++) h.push(38);
            h.push(26);
            return h;
        }

        function dataCell(v, bg, ci) {
            if (ci === 10) return cell(v, bg, C.amt_fc, true, numFmt, 10, 'center');
            if (ci === 1)  { var s = cs(bg, null, false, null, 10, 'center'); return { v: String(v), t: 's', s: s }; }
            if (ci === 9)  { var s = cs(bg, null, false, null, 10, 'center'); return { v: String(v), t: 's', s: s }; }
            var s = cs(bg, null, false, null, 10, 'left');
            if (ci === 2) s.alignment.wrapText = true;
            return { v: String(v), t: 's', s: s };
        }

        function hdrCell(v, bg) {
            var s = cs(bg || C.hdr_bg, C.hdr_fc, true, null, 10, 'center');
            return { v: v, t: 's', s: s };
        }

        var wb = X.utils.book_new();

        // ========== Sheet: เงินจอง PR ==========
        var aoa_pr = makeSummary(C.r3res_bg, C.r3res_fc, "เงินจอง PR (ยังไม่มี PO)");
        aoa_pr.push(prHeaders.map(function(h){ return hdrCell(h); }));
        prRows.forEach(function(r, ri) {
            var bg = (ri % 2 === 0) ? C.stripe : C.white;
            aoa_pr.push(r.map(function(v, ci){ return dataCell(v, bg, ci); }));
        });
        aoa_pr.push(prHeaders.map(function(h, i){
            if (i === 9)  return cell("ยอดรวม PR", C.sumres_bg, C.sumres_fc, true);
            if (i === 10) return cell(fPrTotal, C.sumres_bg, C.sumres_fc, true, numFmt);
            return cell('', C.sumres_bg, null, false);
        }));
        var ws_pr = aoaToSheet(aoa_pr, makeRowHeights(prRows.length));
        ws_pr['!cols'] = [{wch:6},{wch:18},{wch:52},{wch:38},{wch:20},{wch:18},{wch:30},{wch:18},{wch:18},{wch:10},{wch:18}];
        ws_pr['!freeze'] = {xSplit:0, ySplit:6};
        X.utils.book_append_sheet(wb, ws_pr, "เงินจอง PR");

        X.writeFile(wb, "PR_Report_<?= date('Ymd_Hi') ?>.xlsx");
    }

    // ===== Export Contract Excel =====
    function exportContractToExcel() {

        var X = XLSX;

        var fBudget        = <?= json_encode($f_budget_total) ?>;
        var fReserve       = <?= json_encode($f_reserve_total) ?>;
        var fRemaining     = <?= json_encode($f_remaining) ?>;
        var fContractTotal = <?= json_encode($f_contract_total) ?>;
        var fCheck         = <?= json_encode($f_check_total) ?>;
        var fPaid          = <?= json_encode($f_paid_total) ?>;
        var bgLabel        = <?= json_encode($bg_expense_label) ?>;
        var yearTh         = <?= json_encode($year_th) ?>;

        // ดึงข้อมูลสัญญาจากตาราง HTML
        var contractRows = [];
        $("#contractTableBody tr").each(function() {
            var row = [];
            $(this).find("td").each(function(i) {
                if (i >= 9) return;
                var txt = $(this).text().trim().replace(/\s+/g, " ");
                if (i === 8) row.push(parseFloat(txt.replace(/,/g, "")) || 0);
                else row.push(txt);
            });
            contractRows.push(row);
        });

        var contractHeaders = ["#","เลขที่ PO","ชื่อรายการ","หน่วยงาน","สถานะ","แหล่งเงิน","ผู้รับผิดชอบ","สายงาน","เงินจองสัญญา (บาท)"];
        var numFmt = '#,##0.00';

        // ===== Style helpers =====
        function cs(bgHex, fontHex, bold, numFmtCode, sz, h) {
            var s = {
                fill: { patternType: 'solid', fgColor: { rgb: bgHex || 'FFFFFFFF' } },
                font: { bold: !!bold, sz: sz || 10, name: 'Calibri' },
                alignment: { vertical: 'center', horizontal: h || 'left', wrapText: false },
                border: {
                    top:    { style: 'thin', color: { rgb: 'FFD1D5DB' } },
                    bottom: { style: 'thin', color: { rgb: 'FFD1D5DB' } },
                    left:   { style: 'thin', color: { rgb: 'FFD1D5DB' } },
                    right:  { style: 'thin', color: { rgb: 'FFD1D5DB' } },
                }
            };
            if (fontHex) s.font.color = { rgb: fontHex };
            if (numFmtCode) s.numFmt = numFmtCode;
            s.alignment.horizontal = h ? h : (numFmtCode ? 'right' : 'left');
            return s;
        }
        function cell(v, bgHex, fontHex, bold, numFmtCode, sz, h) {
            var t = (typeof v === 'number') ? 'n' : 's';
            return { v: v, t: t, s: cs(bgHex, fontHex, bold, numFmtCode, sz, h) };
        }

        var C = {
            row1_bg:  'D9E1F2', row1_fc:  '1F3864',
            bud_bg:   '4472C4', bud_fc:   'FFFFFF',
            res_bg:   'F6C23E', res_fc:   '000000',
            rem_bg:   '1CC88A', rem_fc:   '000000',
            con_bg:   'E74A3B', con_fc:   'FFFFFF',
            num_bg:   'F2F2F2',
            hdr_bg:   '4472C4', hdr_fc:   'FFFFFF',
            hdr_con:  'C0392B',
            stripe:   'EEF2FF', white:    'FFFFFFFF',
            stripe_c: 'FFF5F5',
            r3con_bg: 'FADBD8', r3con_fc: '922B21',
            sumcon_bg:'FADBD8', sumcon_fc:'922B21',
            sumrem_bg:'D4EDDA', sumrem_fc:'155724',
            con_fc2:  'C0392B',
            chk_bg:   'E2D9F3', chk_fc:   '432874',
            paid_bg:  'D1F5E8', paid_fc:  '0F6848',
        };

        function makeSummary(r3Bg, r3Fc, r3Label) {
            return [
                [cell("ปีงบประมาณ " + yearTh + (bgLabel ? "  |  " + bgLabel : ""), C.row1_bg, C.row1_fc, true)],
                [
                    cell("งบประมาณ",          C.bud_bg, C.bud_fc, true),
                    cell(fBudget,              C.num_bg, null,     true, numFmt),
                    cell("เงินจองงบประมาณตามบัญชีจัดสรร",    C.res_bg, C.res_fc, true),
                    cell(fReserve,             C.num_bg, null,     true, numFmt),
                    cell("เงินจองตรวจรับ",     C.chk_bg, C.chk_fc, true),
                    cell(fCheck,               C.num_bg, null,     true, numFmt),
                    cell("เบิกจ่ายแล้ว",       C.paid_bg,C.paid_fc,true),
                    cell(fPaid,                C.num_bg, null,     true, numFmt),
                    cell("คงเหลือ",            C.rem_bg, C.rem_fc, true),
                    cell(fRemaining,           C.num_bg, null,     true, numFmt),
                    cell("เงินจองสัญญา (PO)", C.con_bg, C.con_fc, true),
                    cell(fContractTotal,       C.num_bg, C.con_fc2,true, numFmt)
                ],
                [cell("▶ คอลัมน์ที่เลือก: " + r3Label, r3Bg, r3Fc, true)],
                [cell('', C.white, null, false)]
            ];
        }

        function aoaToSheet(aoa, rowHeights) {
            var ws = {};
            var maxR = aoa.length, maxC = 0;
            aoa.forEach(function(row, ri) {
                if (row.length > maxC) maxC = row.length;
                row.forEach(function(c, ci) {
                    if (c == null) return;
                    var addr = X.utils.encode_cell({r: ri, c: ci});
                    ws[addr] = (typeof c === 'object' && c.v !== undefined) ? c : { v: c, t: typeof c === 'number' ? 'n' : 's' };
                });
            });
            ws["!ref"] = X.utils.encode_range({s:{r:0,c:0}, e:{r:maxR-1,c:maxC-1}});
            if (rowHeights) ws['!rows'] = rowHeights.map(function(h){ return {hpt:h, hpx:h}; });
            return ws;
        }

        function makeRowHeights(dataCount) {
            var h = [26, 24, 20, 6, 28];
            for (var i = 0; i < dataCount; i++) h.push(38);
            h.push(26);
            return h;
        }

        function contractCell(v, bg, ci) {
            if (ci === 8) return cell(v, bg, C.con_fc2, true, numFmt, 10, 'center');
            if (ci === 1) { var s = cs(bg, C.con_fc2, true, null, 10, 'center'); return { v: String(v), t: 's', s: s }; }
            var s = cs(bg, null, false, null, 10, 'left');
            if (ci === 2) s.alignment.wrapText = true;
            return { v: String(v), t: 's', s: s };
        }

        function hdrCell(v, bg) {
            var s = cs(bg || C.hdr_bg, C.hdr_fc, true, null, 10, 'center');
            return { v: v, t: 's', s: s };
        }

        var wb = X.utils.book_new();

        // ========== Sheet: เงินจองสัญญา (PO) ==========
        var aoa_con = makeSummary(C.r3con_bg, C.r3con_fc, "เงินจองสัญญา (PO)");
        aoa_con.push(contractHeaders.map(function(h, i){
            return hdrCell(h, i === 8 ? C.hdr_con : C.hdr_bg);
        }));
        contractRows.forEach(function(r, ri) {
            var bg = (ri % 2 === 0) ? C.stripe_c : C.white;
            aoa_con.push(r.map(function(v, ci){ return contractCell(v, bg, ci); }));
        });
        aoa_con.push(contractHeaders.map(function(h, i){
            if (i === 7) return cell("ยอดรวม", C.sumcon_bg, C.sumcon_fc, true);
            if (i === 8) return cell(fContractTotal, C.sumcon_bg, C.sumcon_fc, true, numFmt);
            return cell('', C.sumcon_bg, null, false);
        }));
        var ws_con = aoaToSheet(aoa_con, makeRowHeights(contractRows.length));
        ws_con['!cols'] = [{wch:6},{wch:18},{wch:52},{wch:20},{wch:18},{wch:30},{wch:18},{wch:18},{wch:18}];
        ws_con['!freeze'] = {xSplit:0, ySplit:5};
        X.utils.book_append_sheet(wb, ws_con, "เงินจองสัญญา");

        X.writeFile(wb, "Contract_Report_<?= date('Ymd_Hi') ?>.xlsx");
    }
</script>
</body>
</html>