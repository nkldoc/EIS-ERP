<?php
// Invoked only after checkingAdmin has authenticated and authorized the selected AP.
if (!isset($rows, $query, $token, $id, $db)) { http_response_code(404); exit; }
$parentSnapshot = function () use ($rows, $id) {
    return $rows('SELECT h.sp_check_period_hdr_id,h.c_code,h.c_arrive_code,h.i_parent,h.parent_id,
        p.i_period,h.f_total,COALESCE(c.c_code,cm.c_code) AS contract_code,
        COALESCE(c.c_name,cm.c_name) AS c_name
        FROM dbo.sp_check_period_hdr h
        LEFT JOIN dbo.sp_tor_hdr_period p ON p.sp_tor_hdr_period_id=h.sp_tor_hdr_period_id
        LEFT JOIN dbo.sp_tor_contract c ON c.sp_tor_contract_id=h.sp_tor_contract_id
        LEFT JOIN dbo.sp_mn_contract_hdr m ON m.sp_mn_contract_hdr_id=h.sp_mn_contract_hdr_id
        LEFT JOIN dbo.sp_tor_contract cm ON cm.sp_tor_contract_id=m.sp_contract_id
        WHERE h.sp_check_period_hdr_id=? OR h.parent_id=? ORDER BY h.sp_check_period_hdr_id', array($id,$id));
};
$sign = function ($data) { return hash_hmac('sha256', json_encode($data), session_id()); };
$transaction = false;
try {
    if (($_REQUEST['mode'] ?? '') === 'parent_load') {
        $data = $parentSnapshot();
        $history = $rows("SELECT TOP 1 remarks FROM NMU_ERPLOG..sys_log_change
            WHERE table_name='sp_check_period_hdr' AND row_field='sp_check_period_hdr_id'
              AND ((row_id=? AND field_name IN ('parent_children','i_parent'))
                OR (field_name='parent_id' AND (new_value=? OR old_value=?)))
            ORDER BY date_create DESC", array($id,(string)$id,(string)$id));
        adminCheckingReply(200, array('success'=>true,'data'=>$data,'csrf_token'=>$token,'snapshot'=>$sign($data), 'reason'=>$history[0]['remarks'] ?? ''));
    }
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || !hash_equals($token, (string) ($_POST['csrf_token'] ?? ''))) {
        adminCheckingReply(403, array('success'=>false,'msg'=>'กรุณาเปิดหน้าต่างแก้ไขใหม่'));
    }
    $enabled = $_POST['i_parent'] ?? '';
    $children = json_decode($_POST['children'] ?? '', true);
    $reason = trim((string) ($_POST['reason'] ?? ''));
    if (!in_array((string) $enabled, array('0','1'), true) || !is_array($children) || !$reason || mb_strlen($reason,'UTF-8')>1000) throw new InvalidArgumentException('กรุณาระบุรายการและเหตุผลให้ถูกต้อง');
    foreach ($children as $child) if (!is_int($child) || $child<=0 || $child===$id) throw new InvalidArgumentException('ไม่สามารถเลือกตัวเองหรือรหัส AP ไม่ถูกต้อง');
    $children = array_values(array_unique($children));
    if (!$enabled && $children) throw new InvalidArgumentException('กรุณายกเลิกการเลือก AP ลูกเมื่อปิดใบแม่');
    if (!sqlsrv_begin_transaction($db->conn)) throw new RuntimeException('ไม่สามารถเริ่มบันทึกได้');
    $transaction = true;
    // Serialize relationship writes, including competing mothers selecting the same child.
    $query('SELECT sp_check_period_hdr_id FROM dbo.sp_check_period_hdr WITH (TABLOCKX,HOLDLOCK) WHERE sp_check_period_hdr_id=?', array($id));
    $original = $parentSnapshot();
    if (!hash_equals($sign($original), (string) ($_POST['snapshot'] ?? ''))) throw new DomainException('ข้อมูลเปลี่ยนแล้ว กรุณาปิดและเปิดหน้าต่างใหม่');
    $mother = null;
    foreach ($original as $row) if (intval($row['sp_check_period_hdr_id'])===$id) $mother=$row;
    if (!$mother || !empty($mother['parent_id'])) throw new InvalidArgumentException('AP นี้เป็นลูกของใบอื่นอยู่ ไม่สามารถตั้งเป็นใบแม่ได้');
    $write = function ($rowId,$field,$old,$new) use ($query,$reason) {
        if ((string)$old===(string)$new) return;
        $query('UPDATE dbo.sp_check_period_hdr SET ['.$field.']=?,dc_user_update_id=?,dc_user_update_cost_id=?,d_update=GETDATE() WHERE sp_check_period_hdr_id=?', array($new,$_SESSION['user_id'],$_SESSION['dc_cost_id'] ?? null,$rowId));
        $query('INSERT INTO NMU_ERPLOG..sys_log_change (table_name,row_id,row_field,field_name,old_value,new_value,user_id,date_create,remarks) VALUES(?,?,?,?,?,?,?,GETDATE(),?)', array('sp_check_period_hdr',$rowId,'sp_check_period_hdr_id',$field,$old,$new,$_SESSION['user_id'],$reason));
    };
    foreach ($children as $childId) {
        $child = $rows("SELECT sp_check_period_hdr_id,i_parent,parent_id FROM dbo.sp_check_period_hdr WHERE sp_check_period_hdr_id=? AND i_enabled=1 AND (NULLIF(LTRIM(RTRIM(c_code)),'') IS NOT NULL OR NULLIF(LTRIM(RTRIM(c_arrive_code)),'') IS NOT NULL)", array($childId));
        if (!$child || !empty($child[0]['i_parent']) || (!empty($child[0]['parent_id']) && intval($child[0]['parent_id'])!==$id)) throw new InvalidArgumentException('AP ลูกไม่พร้อมใช้งาน เป็นใบแม่ หรือผูกกับใบแม่อื่นแล้ว');
        $descendants = $rows('SELECT TOP 1 sp_check_period_hdr_id FROM dbo.sp_check_period_hdr WHERE parent_id=?', array($childId));
        if ($descendants) throw new InvalidArgumentException('AP ที่เลือกมีลูกอยู่แล้ว');
        $write($childId,'parent_id',$child[0]['parent_id'],$id);
    }
    foreach ($original as $row) {
        $childId=intval($row['sp_check_period_hdr_id']);
        if ($childId!==$id && !in_array($childId,$children,true)) $write($childId,'parent_id',$row['parent_id'],null);
    }
    $write($id,'i_parent',$mother['i_parent'],intval($enabled));
    // Keep the reason against the mother even when only the reason was edited.
    $oldChildren = array();
    foreach ($original as $row) if (intval($row['sp_check_period_hdr_id'])!==$id) $oldChildren[]=intval($row['sp_check_period_hdr_id']);
    $query('INSERT INTO NMU_ERPLOG..sys_log_change (table_name,row_id,row_field,field_name,old_value,new_value,user_id,date_create,remarks) VALUES(?,?,?,?,?,?,?,GETDATE(),?)', array('sp_check_period_hdr',$id,'sp_check_period_hdr_id','parent_children',json_encode($oldChildren),json_encode($children),$_SESSION['user_id'],$reason));
    if (!sqlsrv_commit($db->conn)) throw new RuntimeException('ไม่สามารถยืนยันการบันทึกได้');
    $transaction=false;
    $data=$parentSnapshot();
    adminCheckingReply(200,array('success'=>true,'data'=>$data,'snapshot'=>$sign($data),'reason'=>$reason,'msg'=>'บันทึกใบแม่และ AP ลูกแล้ว'));
} catch (Throwable $error) {
    if ($transaction) sqlsrv_rollback($db->conn);
    adminCheckingReply($error instanceof DomainException ? 409 : ($error instanceof InvalidArgumentException ? 400 : 500),array('success'=>false,'msg'=>$error->getMessage()));
}
