<?php
// Shared by preview, inspection save, and AP issuance. No writes during preview.
function checkingChildNextCode($motherCode, $issuedCodes) {
    if (!preg_match('~^([^/.]*AP[^/.]+)(/[^/]+)$~i', trim($motherCode), $parts)) {
        throw new InvalidArgumentException('เลข AP แม่ไม่อยู่ในรูปแบบที่รองรับ');
    }
    $maximum = 0;
    foreach ($issuedCodes as $code) {
        if (preg_match('~^'.preg_quote($parts[1], '~').'\.(\d+)'.preg_quote($parts[2], '~').'$~', trim((string)$code), $match)) {
            $maximum = max($maximum, intval($match[1]));
        }
    }
    return $parts[1].'.'.($maximum + 1).$parts[2];
}
function checkingChildNumberPlan($db, $id, $lock = false) {
    if ($lock) {
        // All child issuances use the same transaction lock to avoid sibling deadlocks.
        $statement = $db->QueryParam("SET NOCOUNT ON; DECLARE @result int; EXEC @result=sys.sp_getapplock @Resource='checking-child-ap-number', @LockMode='Exclusive', @LockOwner='Transaction', @LockTimeout=10000; SELECT @result AS lock_result;", array());
        $result = $statement ? $db->Fetch($statement) : false;
        if (!$result || intval($result['lock_result'])<0) throw new RuntimeException('มีการออกเลขพร้อมกัน กรุณาลองใหม่');
    }
    $hint = $lock ? ' WITH (UPDLOCK,HOLDLOCK)' : '';
    $row = $db->GetDataBySQL('SELECT sp_check_period_hdr_id,parent_id,c_code,c_arrive_code FROM dbo.sp_check_period_hdr'.$hint.' WHERE sp_check_period_hdr_id=? AND i_enabled=1', array($id));
    if (!$row) throw new InvalidArgumentException('ไม่พบรายการตรวจรับ');
    $parentId = intval($row['parent_id'] ?? 0);
    if (!$parentId) return array('is_child'=>false);
    $parent = $db->GetDataBySQL('SELECT sp_check_period_hdr_id,c_code,i_parent FROM dbo.sp_check_period_hdr'.$hint.' WHERE sp_check_period_hdr_id=? AND i_enabled=1', array($parentId));
    if (!$parent || !intval($parent['i_parent'])) throw new InvalidArgumentException('ไม่พบใบแม่ที่พร้อมใช้งาน');
    $parentCode = trim((string)($parent['c_code'] ?? ''));
    if ($parentCode==='') throw new InvalidArgumentException('ใบแม่ยังไม่มีเลข AP กรุณาออกเลขใบแม่ก่อน');
    $existingCode = trim((string)($row['c_code'] ?? ''));
    $codes = array();
    if ($existingCode==='') {
        // Include disabled documents: an issued suffix is never reused.
        $stmt = $db->QueryParam('SELECT c_code FROM dbo.sp_check_period_hdr'.$hint.' WHERE c_code LIKE ?', array(explode('/', $parentCode)[0].'.%'));
        if (!$stmt) throw new RuntimeException('ไม่สามารถตรวจสอบเลข AP ลูกได้');
        while ($issued = $db->Fetch($stmt)) $codes[] = $issued['c_code'];
    }
    return array('is_child'=>true,'sp_check_period_hdr_id'=>intval($id),'parent_id'=>$parentId,
        'parent_code'=>$parentCode,'ir_code'=>$row['c_arrive_code'] ?? '',
        'existing_code'=>$existingCode,'proposed_code'=>$existingCode!=='' ? $existingCode : checkingChildNextCode($parentCode,$codes));
}
function checkingChildNumberToken($plan) {
    return hash_hmac('sha256', 'checking-child-number|'.json_encode($plan), session_id());
}
function checkingRequireChildConfirmation($plan, $token) {
    if (!empty($plan['is_child']) && empty($plan['existing_code']) && !hash_equals(checkingChildNumberToken($plan),(string)$token)) {
        throw new DomainException('เลข AP ลูกหรือความสัมพันธ์มีการเปลี่ยนแปลง กรุณาตรวจสอบเลขและยืนยันบันทึกใหม่');
    }
}
