<?php
require_once '../../../conf/config.php';
require_once '../../../lib/database/DatabaseServer.php';
require_once __DIR__ . '/checkingFinance.php';
header('Content-Type: application/json; charset=utf-8');
function adminCheckingReply($status, $data) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
if (empty($_SESSION['user_id']) || intval($_SESSION['dc_center_user'] ?? 0) !== 1) {
    adminCheckingReply(403, array('success' => false, 'msg' => 'เฉพาะ Admin เท่านั้นที่แก้ไขได้'));
}
$id = intval($_REQUEST['sp_check_period_hdr_id'] ?? 0);
if ($id <= 0) adminCheckingReply(400, array('success' => false, 'msg' => 'กรุณาเลือกใบตรวจรับ'));
$db = new DatabaseServer();
$query = function ($sql, $params = array()) use ($db) {
    $stmt = @sqlsrv_query($db->conn, $sql, $params);
    if (!$stmt) throw new RuntimeException('ไม่สามารถอ่านหรือบันทึกข้อมูลได้');
    return $stmt;
};
$rows = function ($sql, $params = array()) use ($query) {
    $stmt = $query($sql, $params);
    $result = array();
    while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
        foreach ($row as &$value) if ($value instanceof DateTimeInterface) $value = $value->format('Y-m-d');
        unset($value);
        $result[] = $row;
    }
    return $result;
};
// Only these fields can be changed; document IDs and relationship keys stay fixed.
$fields = array(
    'sp_check_period_hdr' => array(
        'd_arrive_date' => array('วันที่รับของเอกสารสมบูรณ์', 'date', 'ข้อมูลตรวจรับ'),
        'd_checking_date' => array('วันที่บันทึกการตรวจรับ', 'date', 'ข้อมูลตรวจรับ'),
        'c_egp_no' => array('เลขที่ EGP', 'text', 'ข้อมูลตรวจรับ'),
        'i_yyyy' => array('ปีงบประมาณ (พ.ศ.)', 'year', 'ข้อมูลตรวจรับ'),
        'i_yyyy_overlap' => array('ใช้เงินปีงบประมาณ (พ.ศ.)', 'year', 'ข้อมูลตรวจรับ'),
        'c_overlap' => array('เลขที่ใบกันเงินเหลื่อมปี', 'text', 'ข้อมูลตรวจรับ'),
        'i_skip_bg_check' => array('ออกเลขตรวจรับโดยไม่เช็คเงิน', 'choice', 'ข้อมูลตรวจรับ', array(0 => 'ไม่ใช่', 1 => 'ใช่')),
        'i_type_transfer' => array('รูปแบบการจ่าย', 'choice', 'ข้อมูลตรวจรับ', array(1 => 'โอนจ่าย', 2 => 'เช็คจ่าย')),
        'i_doc_duo' => array('ใบเบิกแบบคู่', 'choice', 'ข้อมูลตรวจรับ', array(0 => 'ไม่ใช่', 1 => 'ใช่')),
        'i_transfer_of_rights' => array('โอนสิทธิ์', 'choice', 'ข้อมูลตรวจรับ', array(0 => 'ไม่ใช่', 1 => 'ใช่')),
        'i_reserve_pay' => array('ผู้ทดรองจ่าย', 'choice', 'ข้อมูลตรวจรับ', array(0 => 'ไม่ใช่', 1 => 'ใช่')),
        'c_reason' => array('หมายเหตุการตรวจรับ', 'text', 'ข้อมูลตรวจรับ'),
        'f_total' => array('จำนวนเงินรวม VAT', 'money', 'เงิน / ภาษี'),
        'f_total_add_vat_amt' => array('จำนวนเงินก่อน VAT', 'money', 'เงิน / ภาษี'),
        'i_vat_amt' => array('คิดภาษีมูลค่าเพิ่ม', 'choice', 'เงิน / ภาษี', array(0 => 'ไม่ใช่', 1 => 'ใช่')),
        'f_vat_amt' => array('ภาษีมูลค่าเพิ่ม', 'money', 'เงิน / ภาษี'),
        'f_rate_vat' => array('อัตรา VAT (%)', 'money', 'เงิน / ภาษี'),
        'i_edit_vat' => array('กำหนด VAT เอง', 'choice', 'เงิน / ภาษี', array(0 => 'คำนวณตามอัตรา', 1 => 'ระบุ VAT เอง')),
        'f_inv_vat' => array('จำนวนเงินขอเบิก', 'money', 'เงิน / ภาษี'),
        'i_tax_personal' => array('หักภาษี ณ ที่จ่าย', 'choice', 'เงิน / ภาษี', array(0 => 'ไม่ใช่', 1 => 'ใช่')),
        'f_tax_personal' => array('ภาษีหัก ณ ที่จ่าย', 'money', 'เงิน / ภาษี'),
        'f_tax_personal_rate' => array('อัตราภาษีหัก ณ ที่จ่าย (%)', 'money', 'เงิน / ภาษี'),
        'f_fine_amt' => array('ค่าปรับ', 'money', 'เงิน / ภาษี'),
        'i_is_fine' => array('มีค่าปรับ', 'choice', 'เงิน / ภาษี', array(0 => 'ไม่มี', 1 => 'มี')),
        'i_rate' => array('หักค่าประกันผลงาน', 'choice', 'เงิน / ภาษี', array(0 => 'ไม่ใช่', 1 => 'ใช่')),
        'f_warranty' => array('ค่าประกันผลงาน', 'money', 'เงิน / ภาษี'),
        'f_tax_warranty_rate' => array('อัตราค่าประกันผลงาน (%)', 'money', 'เงิน / ภาษี'),
        'f_other' => array('อื่นๆ', 'money', 'เงิน / ภาษี'),
        'f_pay' => array('จำนวนเงินที่จ่าย', 'money', 'เงิน / ภาษี'),
        'i_is_warranty' => array('รูปแบบรับประกัน', 'choice', 'การรับประกัน', array(0 => 'ไม่มีการรับประกัน', 1 => 'รับประกันเป็นเดือน', 2 => 'แยกการรับประกันในงวด', 3 => 'รับประกันเป็นวัน')),
        'i_warranty_age' => array('ระยะเวลารับประกัน (เดือน)', 'int', 'การรับประกัน'),
        'i_warranty_day' => array('ระยะเวลารับประกัน (วัน)', 'int', 'การรับประกัน'),
        'd_warranty_date' => array('วันที่หมดรับประกัน', 'date', 'การรับประกัน'),
        'i_before' => array('แจ้งเตือนก่อน (วัน)', 'int', 'การรับประกัน')
    ),
    'sp_check_period_dtl' => array('c_name' => array('ชื่อรายการ', 'text'), 'i_qty' => array('จำนวน', 'quantity'),
        'f_net_unit_price' => array('ราคาต่อหน่วย', 'money'), 'f_net_total_price' => array('จำนวนเงิน', 'money')),
    'sp_tranf_item' => array('c_name' => array('รายละเอียด ซื้อ/จ้าง', 'text'),
        'f_net_total_price' => array('จำนวนเงินรายการหลัก', 'money'),
        'f_wip_total_price' => array('งานระหว่างดำเนินการ', 'money'),
        'f_under_total_price' => array('มูลค่าต่ำกว่าเกณฑ์', 'money'), 'f_vat_amt' => array('มูลค่าภาษี (+/-)', 'money'),
        'f_sum_Transf' => array('ยอดรวมส่งบัญชี (อัตโนมัติ)', 'money'))
);
$fields['sp_tranf_hdr'] = array('f_net_total_price' => array('ยอดหัวตั้งหนี้', 'money'));
$keys = array('sp_check_period_hdr' => 'sp_check_period_hdr_id', 'sp_check_period_dtl' => 'sp_check_period_dtl_id', 'sp_tranf_item' => 'sp_tranf_item_id', 'sp_tranf_hdr' => 'sp_tranf_hdr_id');
$loadData = function ($lock = false) use ($rows, $id) {
    $hint = $lock ? ' WITH (UPDLOCK,HOLDLOCK)' : '';
    return array(
        'sp_check_period_hdr' => $rows('SELECT * FROM dbo.sp_check_period_hdr' . $hint . ' WHERE sp_check_period_hdr_id=? AND i_enabled=1', array($id)),
        'sp_check_period_dtl' => $rows('SELECT * FROM dbo.sp_check_period_dtl' . $hint . ' WHERE sp_check_period_hdr_id=? ORDER BY sp_check_period_dtl_id', array($id)),
        'sp_tranf_item' => $rows('SELECT i.* FROM dbo.sp_tranf_item i' . $hint . ' INNER JOIN dbo.sp_tranf_hdr t ON t.sp_tranf_hdr_id=i.sp_tranf_hdr_id WHERE t.sp_check_period_hdr_id=? AND i.i_enabled=1 ORDER BY i.sp_tranf_item_id', array($id)),
        'sp_tranf_hdr' => $rows('SELECT * FROM dbo.sp_tranf_hdr' . $hint . ' WHERE sp_check_period_hdr_id=? ORDER BY sp_tranf_hdr_id', array($id))
    );
};
$snapshotToken = function ($data) { return hash_hmac('sha256', json_encode($data), session_id()); };
$normalize = function ($value, $definition) {
    if ($value === null || $value === '') return null;
    $type = $definition[1];
    if ($type === 'text') {
        if (!is_scalar($value) || mb_strlen((string) $value, 'UTF-8') > 4000) throw new InvalidArgumentException('ข้อความยาวเกินกำหนด');
        return (string) $value;
    }
    if ($type === 'date') {
        $date = DateTimeImmutable::createFromFormat('!Y-m-d', (string) $value);
        if (!$date || $date->format('Y-m-d') !== $value) throw new InvalidArgumentException('วันที่ไม่ถูกต้อง');
        return $value;
    }
    if (is_bool($value)) $value = intval($value);
    if ($type === 'choice' && is_string($value) && in_array(strtolower($value), array('true','false'), true)) $value = strtolower($value) === 'true' ? 1 : 0;
    if (!is_numeric($value) || !is_finite(floatval($value))) throw new InvalidArgumentException('ตัวเลขไม่ถูกต้อง');
    if ($type === 'choice') {
        if (!array_key_exists((string) $value, $definition[3])) throw new InvalidArgumentException('ตัวเลือกไม่ถูกต้อง');
        return intval($value);
    }
    if ($type === 'year' || $type === 'int') {
        if (floatval($value) != intval($value)) throw new InvalidArgumentException('กรุณาระบุจำนวนเต็ม');
        $number = intval($value);
        if ($type === 'year') {
            if ($number >= 2400) $number -= 543;
            if ($number < 1900 || $number > 2399) throw new InvalidArgumentException('ปีงบประมาณไม่ถูกต้อง');
        } elseif ($number < 0 || $number > 100000) throw new InvalidArgumentException('จำนวนวันหรือเดือนไม่ถูกต้อง');
        return $number;
    }
    if (abs(floatval($value)) > 999999999999) throw new InvalidArgumentException('จำนวนเงินเกินกำหนด');
    if ($type === 'quantity' && floatval($value) < 0) throw new InvalidArgumentException('จำนวนรายการต้องไม่ติดลบ');
    return number_format(floatval($value), $type === 'quantity' ? 4 : 2, '.', '');
};
$transaction = false;
try {
    $header = $rows('SELECT * FROM dbo.sp_check_period_hdr WHERE sp_check_period_hdr_id=? AND i_enabled=1', array($id));
    if (!$header) adminCheckingReply(404, array('success' => false, 'msg' => 'ไม่พบใบตรวจรับที่เลือก'));
    $token = hash_hmac('sha256', 'checking-admin|' . $_SESSION['user_id'] . '|' . $id, session_id());
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
        $data = $loadData();
        adminCheckingReply(200, array('success' => true, 'csrf_token' => $token, 'fields' => $fields, 'keys' => $keys,
            'finance_token' => $snapshotToken($data), 'data' => $data));
    }
    if (!hash_equals($token, (string) ($_POST['csrf_token'] ?? ''))) adminCheckingReply(403, array('success' => false, 'msg' => 'กรุณาเปิดหน้าต่างแก้ไขใหม่'));
    $reason = trim((string) ($_POST['reason'] ?? ''));
    $changes = json_decode($_POST['changes'] ?? '', true);
    $preview = ($_POST['mode'] ?? '') === 'calculate';
    if ((!$preview && $reason === '') || mb_strlen($reason, 'UTF-8') > 1000 || !is_array($changes) || (!$preview && !$changes) || count($changes) > 500) {
        adminCheckingReply(400, array('success' => false, 'msg' => 'กรุณาระบุข้อมูลที่แก้ไขและเหตุผล (ไม่เกิน 1,000 ตัวอักษร)'));
    }
    if (!@sqlsrv_begin_transaction($db->conn)) throw new RuntimeException('ไม่สามารถเริ่มบันทึกข้อมูลได้');
    $transaction = true;
    $original = $loadData(true);
    if (!$original['sp_check_period_hdr']) throw new DomainException('ใบตรวจรับถูกเปลี่ยนสถานะ กรุณาเปิดข้อมูลใหม่');
    $draft = $original;
    $financial = $preview;
    $seen = array();
    foreach ($changes as $change) {
        $table = $change['table'] ?? '';
        $field = $change['field'] ?? '';
        $rowId = intval($change['row_id'] ?? 0);
        if ($table === 'sp_tranf_hdr' || !isset($fields[$table][$field]) || !$rowId || !array_key_exists('old_value', $change) || !array_key_exists('new_value', $change)) throw new InvalidArgumentException('ฟิลด์ที่แก้ไขไม่ได้รับอนุญาต');
        $pk = $keys[$table];
        $index = null;
        foreach ($original[$table] as $i=>$row) if (intval($row[$pk]) === $rowId) $index = $i;
        if ($index === null) throw new InvalidArgumentException('รายการนี้ไม่ได้อยู่ในใบตรวจรับที่เลือก');
        $unique = $table . ':' . $rowId . ':' . $field;
        if (isset($seen[$unique])) throw new InvalidArgumentException('มีฟิลด์ซ้ำในการแก้ไข');
        $seen[$unique] = true;
        $definition = $fields[$table][$field];
        $old = $normalize($original[$table][$index][$field], $definition);
        if ($old !== $normalize($change['old_value'], $definition)) throw new DomainException('ข้อมูลถูกแก้ไขโดยผู้ใช้อื่น กรุณาปิดแล้วเปิดหน้าแก้ไขใหม่');
        $draft[$table][$index][$field] = $normalize($change['new_value'], $definition);
        if (in_array($definition[1], array('money','quantity'), true) || in_array($field, array('i_vat_amt','i_tax_personal','i_rate','i_edit_vat','i_is_fine'), true)) $financial = true;
    }
    if ($financial) {
        if (!hash_equals($snapshotToken($original), (string) ($_POST['finance_token'] ?? ''))) throw new DomainException('ข้อมูลเงินถูกเปลี่ยนแปลง กรุณาเปิดหน้าแก้ไขใหม่');
        $source = json_decode($_POST['finance_source'] ?? '{}', true);
        $fine = json_decode($_POST['fine_calculation'] ?? '{}', true);
        $manualVatIds = json_decode($_POST['manual_vat_ids'] ?? '[]', true);
        if (!is_array($source) || !is_array($fine) || !is_array($manualVatIds)) throw new InvalidArgumentException('ข้อมูลคำนวณไม่ถูกต้อง');
        foreach ($fields as $table=>$definitions) foreach ($draft[$table] as $index=>$row) foreach ($definitions as $field=>$definition) {
            if (array_key_exists($field,$row)) $draft[$table][$index][$field] = $normalize($row[$field],$definition);
        }
        $draft = calculateCheckingFinance($draft, $source, $fine, array_map('intval', $manualVatIds));
        if (($fine['mode'] ?? '') === 'percent') $reason .= ' [ค่าปรับ ' . floatval($fine['rate'] ?? 0) . '% ของยอดรวม VAT]';
    }
    if ($preview) {
        @sqlsrv_rollback($db->conn); $transaction = false;
        adminCheckingReply(200, array('success'=>true,'data'=>$draft));
    }
    $touched = array();
    foreach ($fields as $table=>$definitions) foreach ($draft[$table] as $index=>$row) foreach ($definitions as $field=>$definition) {
        $old = $normalize($original[$table][$index][$field] ?? null, $definition);
        $new = $normalize($row[$field] ?? null, $definition);
        if ($new === $old) continue;
        $pk = $keys[$table]; $rowId = $row[$pk];
        $query('UPDATE dbo.[' . $table . '] SET [' . $field . ']=?,dc_user_update_id=?,dc_user_update_cost_id=?,d_update=GETDATE() WHERE [' . $pk . ']=?', array($new,$_SESSION['user_id'],$_SESSION['dc_cost_id'] ?? null,$rowId));
        $query('INSERT INTO NMU_ERPLOG..sys_log_change (table_name,row_id,row_field,field_name,old_value,new_value,user_id,date_create,remarks) VALUES(?,?,?,?,?,?,?,GETDATE(),?)', array($table,$rowId,$pk,$field,$old,$new,$_SESSION['user_id'],$reason));
        $touched[] = $table . '.' . $field;
    }
    if (!@sqlsrv_commit($db->conn)) throw new RuntimeException('ไม่สามารถยืนยันการบันทึกได้');
    $transaction = false;
    adminCheckingReply(200, array('success' => true, 'msg' => 'บันทึกข้อมูลและประวัติแล้ว', 'updated' => count($touched)));
} catch (Throwable $error) {
    if ($transaction) @sqlsrv_rollback($db->conn);
    $status = $error instanceof DomainException ? 409 : ($error instanceof InvalidArgumentException ? 400 : 500);
    adminCheckingReply($status, array('success' => false, 'msg' => $error->getMessage()));
}
