<?php

include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/database/audit_class.php");
include("../../lib/database/workflow_classs.php");

$db = new DatabaseServer();
//$date = new i_date();
$util = new apiUtil();
$audit = new AuditLog($db);
$wf = new WorkflowEngine($db);

$moduleCode = $_REQUEST['module_code'];     // DOC
$docNo = $_REQUEST['document_no'];     // DOC6800001
$actionCode = $_REQUEST['action_code'];     // SUBMIT, SIGN, RETURN
$currentStatus = $_REQUEST['current_status']; // DOC_DRAFT
//$moduleCode = 'DOC';     // DOC
//$docNo = 'PR0012';     // DOC6800001
//$actionCode = 'SIGN';     // SUBMIT, SIGN, RETURN
//$currentStatus = 'DOC_WAIT_PROCURE_HEAD'; // DOC_DRAFT

sqlsrv_begin_transaction($db->conn);

try {

    switch ($actionCode) {
        //========================================
        // ส่งอนุมัติ
        //========================================
        case 'SUBMIT':

            $next = $wf->nextStatus(
                    $moduleCode,
                    $currentStatus,
                    'SUBMIT'
            );

            if (!$next)
                throw new Exception("ไม่พบ Workflow SUBMIT");

//            from_status
//            action_code,
//            to_status,action_desc

            $newStatus = $next['to_status'];
            $statusTxt = $next['action_desc'];
            $sql = "
                        UPDATE [EIS_ERP].[dbo].sign_audit_document
                        SET
                            current_status = ?,
                            action_by = ?,
                            action_name = ?,
                            action_date = GETDATE()
                        WHERE document_no = ?
                    ";

            $params = array(
                $newStatus,
                $_SESSION['user_id'],
                $_SESSION['user_name'],
                $docNo
            );
//            echo $db->debugSql($sql, $params);
//            exit();
            $rs = sqlsrv_query($db->conn, $sql, $params);
            if ($rs === false) {
                throw new Exception(print_r(sqlsrv_errors(), true));
            }
            $rs = sqlsrv_query($db->conn, $sql, $params);
            if ($rs === false)
                throw new Exception(print_r(sqlsrv_errors(), true));
            $audit->save(
                    $_SESSION,
                    $moduleCode,
                    $docNo,
                    'SUBMIT',
                    $newStatus,
                    'ส่งเอกสารเพื่ออนุมัติ [' . $statusTxt . ']'
            );

            break;
        //========================================
        // ลงนาม
        //========================================
        case 'SIGN':

            $next = $wf->nextStatus(
                    $moduleCode,
                    $currentStatus,
                    $actionCode
            );

            if (!$next)
                throw new Exception("ไม่พบ Workflow SIGN");

            $newStatus = $next['to_status'];
            $statusTxt = $next['action_desc'];
            $sql = "
                UPDATE [EIS_ERP].[dbo].sign_audit_document
                SET
                    current_status = ?,
                    sign_by = ?,
                    sign_date = GETDATE()
                WHERE document_no = ?
            ";

            $params = array(
                $newStatus,
                $_SESSION['user_id'],
                $_SESSION['user_name'],
                $docNo
            );

//            echo $db->debugSql($sql, $params);
//            exit();
            $rs = sqlsrv_query($db->conn, $sql, $params);

            if ($rs === false)
                throw new Exception(print_r(sqlsrv_errors(), true));

            $audit->save($_SESSION,
                    $moduleCode,
                    $docNo,
                    'SIGN',
                    $newStatus,
                    'ลงนามเอกสาร [' . $statusTxt . ']'
            );

            break;
        //========================================
        // ส่งกลับแก้ไข
        //========================================
        case 'RETURN':

            $next = $wf->nextStatus(
                    $moduleCode,
                    $currentStatus,
                    $actionCode
            );

            if (!$next)
                throw new Exception("ไม่พบ Workflow RETURN");

            $newStatus = $next['to_status'];
            $statusTxt = $next['action_desc'];

            $sql = "
    UPDATE [EIS_ERP].[dbo].sign_audit_document
    SET
        current_status = ?,
        return_by = ?,
        return_date = GETDATE()
    WHERE document_no = ?
";

            $params = array(
                $newStatus,
                $_SESSION['user_id'],
                $_SESSION['user_name'],
                $docNo
            );

            $rs = sqlsrv_query($db->conn, $sql, $params);

            if ($rs === false) {
                throw new Exception(print_r(sqlsrv_errors(), true));
            }
            $rs = sqlsrv_query($db->conn, $sql, $params);

            if ($rs === false)
                throw new Exception(print_r(sqlsrv_errors(), true));

            $audit->save(
                    $_SESSION,
                    $moduleCode,
                    $docNo,
                    'RETURN',
                    $newStatus,
                    'ส่งกลับแก้ไข [' . $statusTxt . ']'
            );

            break;
        //========================================
        // ยกเลิกเอกสาร
        //========================================
        case 'CANCEL':
            $newStatus = 'DOC_CANCEL';
            $sql = "
                UPDATE [EIS_ERP].[dbo].sign_audit_document
                SET
                    current_status = ?,
                    cancel_by = ?,
                    cancel_date = GETDATE()
                WHERE document_no = ?
            ";

            $params = array(
                $newStatus,
                $_SESSION['user_id'],
                $_SESSION['user_name'],
                $docNo
            );
            $rs = sqlsrv_query($db->conn, $sql, $params);

            if ($rs === false) {
                throw new Exception(print_r(sqlsrv_errors(), true));
            }

            $rs = sqlsrv_query($db->conn, $sql, $params);

            if ($rs === false)
                throw new Exception(print_r(sqlsrv_errors(), true));

            $audit->save(
                    $_SESSION,
                    $moduleCode,
                    $docNo,
                    'CANCEL',
                    $newStatus,
                    'ยกเลิกเอกสาร'
            );

            break;
        default:
            throw new Exception("Action ไม่ถูกต้อง");
    }
    sqlsrv_commit($db->conn);
    echo json_encode(array(
        'success' => true,
        'status' => $newStatus,
        'msgtatus' => $statusTxt,
        'message' => 'ดำเนินการเรียบร้อย'
    ));
} catch (Exception $e) {
    sqlsrv_rollback($db->conn);
    $audit->save(
            $_SESSION,
            $moduleCode,
            $docNo,
            'ERROR',
            'ERROR',
            $e->getMessage()
    );

    echo json_encode(array(
        'success' => false,
        'message' => $e->getMessage()
    ));
}