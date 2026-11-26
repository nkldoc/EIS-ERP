<?php
// Admin-only dispatcher supplies authenticated inspection ID and CSRF token.
if (!isset($rows, $query, $token, $id, $db)) { http_response_code(404); exit; }
$transaction = false;
try {
    if (($_REQUEST['mode'] ?? '') === 'enable_load') {
        $data = $rows('SELECT h.i_enabled,h.sp_tor_hdr_period_id,p.i_enabled AS period_enabled
            FROM dbo.sp_check_period_hdr h LEFT JOIN dbo.sp_tor_hdr_period p
            ON p.sp_tor_hdr_period_id=h.sp_tor_hdr_period_id WHERE h.sp_check_period_hdr_id=?', array($id));
        if (!$data) throw new InvalidArgumentException('ไม่พบใบตรวจรับ');
        adminCheckingReply(200, array('success'=>true,'data'=>$data[0],'csrf_token'=>$token));
    }
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || !hash_equals($token, (string) ($_POST['csrf_token'] ?? ''))) {
        adminCheckingReply(403, array('success'=>false,'msg'=>'กรุณาเปิดรายการใหม่'));
    }
    if (!sqlsrv_begin_transaction($db->conn)) throw new RuntimeException('ไม่สามารถเริ่มบันทึกได้');
    $transaction = true;
    $headers = $rows('SELECT sp_tor_hdr_period_id,i_enabled FROM dbo.sp_check_period_hdr WITH (UPDLOCK,HOLDLOCK) WHERE sp_check_period_hdr_id=?', array($id));
    if (!$headers) throw new InvalidArgumentException('ไม่พบใบตรวจรับ');
    $periodId = intval($headers[0]['sp_tor_hdr_period_id']);
    $periods = $rows('SELECT i_enabled FROM dbo.sp_tor_hdr_period WITH (UPDLOCK,HOLDLOCK) WHERE sp_tor_hdr_period_id=?', array($periodId));
    if (!$periods) throw new InvalidArgumentException('ไม่พบงวดสัญญาที่เกี่ยวข้อง');
    foreach (array(array('sp_check_period_hdr','sp_check_period_hdr_id',$id,$headers[0]['i_enabled']),
        array('sp_tor_hdr_period','sp_tor_hdr_period_id',$periodId,$periods[0]['i_enabled'])) as $target) {
        list($table,$pk,$rowId,$old) = $target;
        if (intval($old) === 1) continue;
        $query('UPDATE dbo.['.$table.'] SET i_enabled=1,dc_user_update_id=?,dc_user_update_cost_id=?,d_update=GETDATE() WHERE ['.$pk.']=?', array($_SESSION['user_id'],$_SESSION['dc_cost_id'] ?? null,$rowId));
        $query('INSERT INTO NMU_ERPLOG..sys_log_change (table_name,row_id,row_field,field_name,old_value,new_value,user_id,date_create,remarks) VALUES(?,?,?,?,?,?,?,GETDATE(),?)', array($table,$rowId,$pk,'i_enabled',$old,1,$_SESSION['user_id'],'เปิดใช้งานใบตรวจรับและงวดสัญญาจากหน้าข้อมูล Custom'));
    }
    if (!sqlsrv_commit($db->conn)) throw new RuntimeException('ไม่สามารถยืนยันการบันทึกได้');
    $transaction = false;
    adminCheckingReply(200, array('success'=>true,'msg'=>'อัปเดตสถานะใบตรวจรับและงวดสัญญาเป็น i_enabled = 1 แล้ว'));
} catch (Throwable $error) {
    if ($transaction) sqlsrv_rollback($db->conn);
    adminCheckingReply($error instanceof InvalidArgumentException ? 400 : 500, array('success'=>false,'msg'=>$error->getMessage()));
}
