<?php
// Called inside the controller transaction. The contract lock serializes period saves.
function guardPeriodAmount($db, array $request) {
    $mode = $request['mode'] ?? '';
    $saveModes = array('UP_SP_TOR_HDR_PERIOD', 'UP_SP_TOR_HDR_PERIOD_NEW',
        'UP_SP_TOR_HDR_PERIOD_PRO', 'UP_SP_TOR_HDR_PERIOD_PO');
    $restore = $mode === 'RESTORE_SP_TOR_HDR_PERIOD';
    if (!$restore && !in_array($mode, $saveModes, true)) return;
    $id = intval($restore ? ($request['id'] ?? 0) : ($request['sp_tor_hdr_period_id'] ?? 0));
    $contractId = intval($request['sp_tor_contract_id'] ?? 0);
    if ($restore) {
        $contractId = intval($db->GetDataBySQL(
            'SELECT sp_tor_contract_id FROM dbo.sp_tor_hdr_period WHERE sp_tor_hdr_period_id=?', array($id)));
    }
    if ($contractId <= 0) throw new RuntimeException('ไม่พบสัญญาที่ต้องการบันทึกงวด');
    $contract = $db->GetDataBySQL('SELECT sp_tor_contract_id, f_total_amt FROM dbo.sp_tor_contract WITH (UPDLOCK,HOLDLOCK) WHERE sp_tor_contract_id=?', array($contractId));
    if (!$contract || $contract['f_total_amt'] === null) throw new RuntimeException('ไม่พบวงเงินสัญญา');
    $period = null;
    if ($id > 0) {
        $period = $db->GetDataBySQL('SELECT sp_tor_contract_id, f_total_amt, i_enabled FROM dbo.sp_tor_hdr_period WITH (UPDLOCK,HOLDLOCK) WHERE sp_tor_hdr_period_id=?', array($id));
        if (!$period || intval($period['sp_tor_contract_id']) !== $contractId) throw new RuntimeException('งวดไม่ตรงกับสัญญาที่เลือก กรุณาโหลดข้อมูลใหม่');
    }
    if ($restore && !$period) throw new RuntimeException('ไม่พบงวดที่ต้องการคืนค่า');
    $amount = $restore ? $period['f_total_amt'] : ($request[$mode === 'UP_SP_TOR_HDR_PERIOD_NEW' ? 'f_net_unit_price' : 'f_total_amt'] ?? '');
    $amount = str_replace(',', '', trim((string)$amount));
    if (!preg_match('/^\d{1,15}(?:\.\d{1,2})?$/D', $amount)) throw new RuntimeException('จำนวนเงินงวดต้องไม่ติดลบ และมีทศนิยมไม่เกิน 2 ตำแหน่ง');
    // Copying creates a new row: do not subtract the source period from the total.
    $editing = $restore || $mode === 'UP_SP_TOR_HDR_PERIOD_PO' || ($request['copy_contract_dtl'] ?? '') === 'save';
    $excludeId = $editing ? $id : 0;
    $result = $db->GetDataBySQL('SELECT
        CASE WHEN totals.used_amount + CAST(? AS decimal(18,2)) > CAST(? AS decimal(18,2)) THEN 1 ELSE 0 END AS exceeds,
        totals.used_amount AS used_amount
        FROM (SELECT COALESCE(SUM(CAST(f_total_amt AS decimal(18,2))),0) AS used_amount
            FROM dbo.sp_tor_hdr_period WITH (UPDLOCK,HOLDLOCK)
            WHERE sp_tor_contract_id=? AND i_enabled=1 AND sp_tor_hdr_period_id<>?) totals',
        array($amount, $contract['f_total_amt'], $contractId, $excludeId));
    if (!$result) throw new RuntimeException('ตรวจสอบยอดรวมงวดไม่สำเร็จ');
    if (intval($result['exceeds']) === 1) throw new RuntimeException(
        'บันทึกไม่ได้: ยอดรวมงวดเกินวงเงินสัญญา ' . number_format((float)$contract['f_total_amt'],2) .
        ' บาท (ยอดงวดอื่น ' . number_format((float)$result['used_amount'],2) . ' บาท)');
}
