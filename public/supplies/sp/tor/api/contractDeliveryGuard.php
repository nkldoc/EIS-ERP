<?php

// Called inside the controller transaction, before advancing the contract.
function ensureContractDeliveryHeader($db, $contractId, $session) {
    $contractId = filter_var($contractId, FILTER_VALIDATE_INT);
    if (!$contractId || $contractId < 1) {
        throw new RuntimeException('ไม่พบรหัสสัญญาที่ต้องการผ่านรายการ');
    }
    $contract = $db->GetDataBySQL(
        'SELECT c.sp_tor_contract_id, c.c_name, c.f_total_amt, c.i_type_fine,
                c.d_doc_date, c.d_start_date, c.d_due_date,
                COALESCE(NULLIF(c.sp_emp_id,0),NULLIF(t.sp_emp_id,0)) AS sp_emp_id
         FROM dbo.sp_tor_contract c WITH (UPDLOCK,HOLDLOCK)
         INNER JOIN dbo.sp_tor t ON t.tor_id=c.sp_tor_id
         WHERE c.sp_tor_contract_id=?', array($contractId));
    if (!$contract || empty($contract['sp_emp_id'])) {
        throw new RuntimeException('กรุณาระบุผู้รับผิดชอบสัญญาก่อนผ่านรายการ');
    }
    $existing = $db->GetDataBySQL(
        'SELECT TOP 1 sp_mn_contract_hdr_id FROM dbo.sp_mn_contract_hdr WITH (UPDLOCK,HOLDLOCK)
         WHERE sp_contract_id=? ORDER BY sp_mn_contract_hdr_id', array($contractId));
    if ($existing) {
        return (int) $existing;
    }
    $stmt = $db->QueryParam(
        'SET NOCOUNT ON;
         INSERT INTO dbo.sp_mn_contract_hdr
         (sp_contract_id,sp_emp_id,i_type_fine,c_name,f_total_amt,d_doc_date,d_start_date,d_end_date,
          dc_user_create_id,dc_user_create_cost_id,d_create,dc_user_update_id,dc_user_update_cost_id,d_update)
         VALUES (?,?,?,?,?,?,?,?,?,?,GETDATE(),?,?,GETDATE());
         SELECT CAST(SCOPE_IDENTITY() AS int) AS id;',
        array($contractId,$contract['sp_emp_id'],$contract['i_type_fine'],$contract['c_name'],
            $contract['f_total_amt'],$contract['d_doc_date'],$contract['d_start_date'],$contract['d_due_date'],
            $session['user_id'],$session['dc_cost_id'],$session['user_id'],$session['dc_cost_id']));
    $row = $stmt ? $db->Fetch($stmt) : false;
    if (empty($row['id'])) {
        throw new RuntimeException('สร้างข้อมูลส่งมอบไม่สำเร็จ ยังไม่ผ่านรายการ');
    }
    return (int) $row['id'];
}
