<?php
require_once dirname(__FILE__) . '/../config/database.php';
require_once dirname(__FILE__) . '/../service/ValidationCaseService.php';
try {
    if($_SERVER['REQUEST_METHOD']!=='POST') throw new Exception('Method not allowed');
    $data=isset($_REQUEST['data'])?json_decode($_REQUEST['data'],true):$_POST;
    if(!is_array($data)) throw new Exception('ข้อมูลไม่ถูกต้อง');
    $id=(new ValidationCaseService(receiveValidationDb()))->save($data,receiveValidationUserId());
    receiveValidationJson(array('success'=>true,'sp_check_fix_case_id'=>$id));
} catch(Exception $e) { receiveValidationJson(array('success'=>false,'message'=>$e->getMessage()),400); }

