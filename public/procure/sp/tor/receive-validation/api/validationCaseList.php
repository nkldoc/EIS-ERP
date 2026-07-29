<?php
require_once dirname(__FILE__) . '/../config/database.php';
require_once dirname(__FILE__) . '/../service/ValidationCaseService.php';
try {
    $service=new ValidationCaseService(receiveValidationDb());
    $rows=$service->lists(isset($_REQUEST['include_disabled']) && (int)$_REQUEST['include_disabled']===1);
    receiveValidationJson(array('success'=>true,'totalCount'=>count($rows),'rows'=>$rows));
} catch(Exception $e) { receiveValidationJson(array('success'=>false,'message'=>$e->getMessage()),500); }

