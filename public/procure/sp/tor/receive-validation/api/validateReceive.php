<?php
require_once dirname(__FILE__) . '/../config/database.php';
require_once dirname(__FILE__) . '/../service/ReceiveValidationService.php';
try {
    $context=isset($_REQUEST['context'])?json_decode($_REQUEST['context'],true):$_REQUEST;
    if(!is_array($context)) throw new Exception('context ไม่ถูกต้อง');
    $rows=(new ReceiveValidationService(receiveValidationDb()))->validate($context);
    receiveValidationJson(array('success'=>true,'totalCount'=>count($rows),'rows'=>$rows));
} catch(Exception $e) { receiveValidationJson(array('success'=>false,'message'=>$e->getMessage()),400); }

