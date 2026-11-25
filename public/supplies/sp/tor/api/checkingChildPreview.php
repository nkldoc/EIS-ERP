<?php
require_once '../../../conf/config.php';
require_once '../../../lib/database/DatabaseServer.php';
require_once __DIR__.'/checkingChildNumber.php';
header('Content-Type: application/json; charset=utf-8');
try {
    if (empty($_SESSION['user_id'])) { http_response_code(401); throw new RuntimeException('กรุณาเข้าสู่ระบบใหม่'); }
    $id = filter_var($_GET['sp_check_period_hdr_id'] ?? null,FILTER_VALIDATE_INT);
    if (!$id || $id<1) throw new InvalidArgumentException('กรุณาเลือกใบตรวจรับ');
    $db = new DatabaseServer();
    $plan = checkingChildNumberPlan($db,$id);
    echo json_encode(array('success'=>true,'data'=>$plan,'confirmation_token'=>checkingChildNumberToken($plan)),JSON_UNESCAPED_UNICODE);
} catch (Throwable $error) {
    if (http_response_code()===200) http_response_code(400);
    echo json_encode(array('success'=>false,'msg'=>$error->getMessage()),JSON_UNESCAPED_UNICODE);
}
