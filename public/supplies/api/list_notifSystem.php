<?php 
include '../conf/config.php'; // ปรับ path ตามโปรเจกต์
$db     = new DatabaseServer();
 

$root        = "data";
$data        = array();
$con        = null;

 $$uid = $_REQUEST['uid']??null;

 
 
// ================= QUERY =================
$sql = "
     SELECT 
        notify_id      AS id,
        title,
	 ref_code,
        message    AS [desc],
        created_at,read_at,
        read_at,
        link 
    FROM PROCURE_LOG.dbo.sp_notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
";
 
    $stmt = $db->QueryParam($sql, array($uid)); 
 
  
$list   = [];
$unread = 0;
   while ($r = $db->Fetch($stmt)) { 

    // ✅ ใช้ read_at เป็นตัวตัดสินสถานะ
    $status = empty($r['read_at']) ? 'unread' : 'read';
    if ($status === 'unread') $unread++;

    $list[] = [
        'id'       => $r['id'],
        'title'    => $r['title'],
        'desc'     => $r['desc'],
        'refCode'  => $r['ref_code'],
        'time'     => $r['created_at'], 
        'status'   => $status,
        'link'     => $r['link']
    ];
}

echo json_encode([
    'count' => $unread,
    'data'  => $list
]);
