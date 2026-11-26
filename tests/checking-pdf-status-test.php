<?php
// php -n tests/checking-pdf-status-test.php staff2|admin2|staff3|staffExisting|released2|released|rollback3
if (extension_loaded('sqlsrv')) { fwrite(STDERR, 'Use php -n'); exit(2); }
define('SQLSRV_FETCH_ASSOC', 2);
class DatabaseServer { public $conn = 'fake'; }
class SuppliesWorkspacePolicy { public static function externalUnit($session) { return true; } }
function sqlsrv_begin_transaction($conn) { return true; }
function sqlsrv_rollback($conn) { $GLOBALS['rolledBack'] = true; return true; }
function sqlsrv_commit($conn) { $GLOBALS['committed'] = true; return true; }
function sqlsrv_fetch_array($stmt, $mode) { return $GLOBALS['row']; }
function sqlsrv_query($conn, $sql, $params) {
    if (strpos($sql, 'SELECT') === 0) {
        if (strpos($sql, 'p.i_status_last AS pdf_payment_status') === false || strpos($sql, 'UPDLOCK, HOLDLOCK') === false) throw new Exception('Payment status must be read under lock');
        return true;
    }
    $GLOBALS['updated'] = true;
    return $GLOBALS['case'] !== 'rollback3';
}
$case = $GLOBALS['case'] = $argv[1] ?? 'staff3';
$dir = sys_get_temp_dir() . '/eis-pdf-' . bin2hex(random_bytes(6));
mkdir($dir);
$target = $dir . '/IRTEST.pdf'; $incoming = $dir . '/incoming.pdf';
file_put_contents($target, '%PDF-original'); file_put_contents($incoming, '%PDF-replacement');
putenv('EIS_CHECKING_PDF_DIR=' . $dir);
$released = in_array($case, array('released2', 'released'), true);
$GLOBALS['row'] = array('c_arrive_code'=>'IRTEST','check_pdf'=>$released ? null : 1,'i_is_upload_chk'=>$released ? null : 'upload_Chk/IRTEST.pdf','dc_cost_id'=>38,
    'pdf_payment_status'=>in_array($case,array('staff2','admin2','released2'),true) ? 2 : (in_array($case,array('staff3','rollback3'),true) ? 3 : 0));
$_SESSION = array('user_id'=>1,'dc_center_user'=>$case === 'admin2' ? 1 : 0,'dc_cost_id'=>38);
$_SERVER['REQUEST_METHOD'] = 'POST';
$_FILES = array('upload_pdf1'=>array('error'=>UPLOAD_ERR_OK,'name'=>'new.pdf','tmp_name'=>$incoming));
ob_start();
register_shutdown_function(function() use ($case, $dir, $target) {
    $output = ob_get_clean(); $result = json_decode($output, true);
    $success = in_array($case,array('staff3','released'),true);
    $pass = is_array($result) && $result['success'] === $success;
    if ($success) $pass = $pass && !empty($GLOBALS['committed']) && file_get_contents($target) === '%PDF-replacement';
    else $pass = $pass && empty($GLOBALS['committed']) && !empty($GLOBALS['rolledBack']) && file_get_contents($target) === '%PDF-original';
    if (in_array($case,array('staff2','admin2','released2'),true)) $pass = $pass && empty($GLOBALS['updated']);
    foreach (glob($dir . '/*') as $file) unlink($file);
    rmdir($dir);
    echo ($pass ? 'PASS: ' : 'FAIL: ') . 'PDF status ' . $case . "\n";
    if (!$pass) { echo $output; exit(1); }
});
$source = file_get_contents(__DIR__ . '/../public/supplies/sp/tor/api/uploadCheckingPdf.php');
$source = preg_replace('/^require_once .*;\R/m', '', $source);
// HTTP upload checks are replaced only in this isolated CLI harness.
$source = str_replace("filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT)", '123', $source);
$source = str_replace(array('is_uploaded_file(', 'move_uploaded_file('), array('is_file(', 'rename('), $source);
eval('?>' . $source);
