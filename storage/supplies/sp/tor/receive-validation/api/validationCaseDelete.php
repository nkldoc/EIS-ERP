<?php
require_once dirname(__FILE__) . '/../config/database.php';
require_once dirname(__FILE__) . '/../service/ValidationCaseService.php';
try {
    if($_SERVER['REQUEST_METHOD']!=='POST') throw new Exception('Method not allowed');
    if(empty($_POST['sp_check_fix_case_id'])) throw new Exception('ไม่พบรหัสเคส');
    (new ValidationCaseService(receiveValidationDb()))->disable($_POST['sp_check_fix_case_id'],receiveValidationUserId());
    receiveValidationJson(array('success'=>true));
} catch(Exception $e) { receiveValidationJson(array('success'=>false,'message'=>$e->getMessage()),400); }

