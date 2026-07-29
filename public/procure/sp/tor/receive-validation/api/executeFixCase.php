<?php
require_once dirname(__FILE__) . '/../config/database.php';
require_once dirname(__FILE__) . '/../service/ReceiveValidationService.php';
try {
    if($_SERVER['REQUEST_METHOD']!=='POST') throw new Exception('Method not allowed');
    $context=isset($_POST['context'])?json_decode($_POST['context'],true):array();
    if(!is_array($context)||empty($_POST['sp_check_fix_case_id'])) throw new Exception('ข้อมูลไม่ครบถ้วน');
    $result=(new ReceiveValidationService(receiveValidationDb()))->executeFix($_POST['sp_check_fix_case_id'],$context,!empty($_POST['confirmed']),receiveValidationUserId());
    receiveValidationJson(array('success'=>true,'result'=>$result));
} catch(Exception $e) { receiveValidationJson(array('success'=>false,'message'=>$e->getMessage()),400); }

