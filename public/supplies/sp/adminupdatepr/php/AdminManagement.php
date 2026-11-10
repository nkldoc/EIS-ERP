<?php
include('../../../conf/config.php');
include('../../../lib/database/DatabaseServer.php');
header('Content-Type: application/json; charset=utf-8');
$db = new DatabaseServer();
function respond($data) { echo json_encode($data); exit; }
if (empty($_SESSION['user_id'])) respond(array('success' => false, 'msg' => 'กรุณาเข้าสู่ระบบ'));
$permission = $db->GetDataBySQL(
    'SELECT TOP 1 a.dc_menu_id, ISNULL(u.i_type_user,0) AS user_type FROM dc_menu a JOIN dc_user u ON u.dc_user_id=? WHERE a.c_filelocation=? AND a.i_enable=1 AND a.i_delete=2 AND (u.i_type_user=2 OR EXISTS (SELECT 1 FROM dc_user_menu b WHERE b.dc_menu_id=a.dc_menu_id AND b.dc_user_id=u.dc_user_id))',
    array($_SESSION['user_id'], 'sp-AdminUpdatePR')
);
if (!$permission) respond(array('success' => false, 'msg' => 'ไม่มีสิทธิ์เข้าถึงเมนูนี้'));
$action = isset($_REQUEST['action']) ? $_REQUEST['action'] : '';
// The menu tree grants administrators all enabled menus and other users their
// assigned menus. The same rule controls both management actions here.
if ($action === 'permissions') respond(array('success' => true, 'can_transfer' => true, 'can_manage_employees' => true));
if ($action === 'employees') {
    $query = trim(isset($_REQUEST['q']) ? $_REQUEST['q'] : '');
    $department = filter_var($_REQUEST['department'] ?? 0, FILTER_VALIDATE_INT);
    if ($department === false || $department < 0) respond(array('success' => false, 'msg' => 'สายงานไม่ถูกต้อง'));
    $stmt = $db->QueryParam('SELECT e.sp_emp_id AS id,e.emp_code,e.c_name,e.dc_department_id,e.i_parent,e.i_level,e.i_enable,d.c_name AS department_name, CASE WHEN d.dc_department_id IS NULL THEN NULL ELSE CONCAT(N\'สายงาน \', d.c_name, N\' \', d.i_seq) END AS c_department FROM sp_emp e LEFT JOIN sp_department d ON d.dc_department_id=e.dc_department_id WHERE (? = \'\' OR e.c_name LIKE ? OR d.c_name LIKE ? OR CONVERT(varchar(50),e.emp_code) LIKE ?) AND (? = 0 OR e.dc_department_id = ?) ORDER BY e.c_name', array($query, '%'.$query.'%', '%'.$query.'%', '%'.$query.'%', $department, $department));
    $rows = array(); while ($stmt && $row = $db->Fetch($stmt)) {
        $row['search_label'] = $row['c_name'].' | '.$row['c_department'].' | '.$row['emp_code'];
        $rows[] = $row;
    }
    respond(array('success' => true, 'data' => $rows));
}
if ($action === 'departments') {
    $stmt = $db->QueryParam('SELECT dc_department_id AS id,c_name,CONCAT(N\'สายงาน \',c_name,N\' \',i_seq) AS line_name FROM sp_department ORDER BY c_name,i_seq', array());
    $rows = array(); while ($stmt && $row = $db->Fetch($stmt)) $rows[] = $row;
    respond(array('success' => true, 'data' => $rows));
}
if ($action === 'next_emp_code') {
    $stmt = @sqlsrv_query($db->conn, 'SELECT ISNULL(MAX(TRY_CONVERT(int, NULLIF(LTRIM(RTRIM(emp_code)),\'\'))),0) AS max_code FROM dbo.sp_emp');
    $row = $stmt ? sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC) : false;
    if (!$row || (int)$row['max_code'] >= 9999) respond(array('success' => false, 'msg' => 'ไม่สามารถกำหนด emp_code ถัดไปได้'));
    respond(array('success' => true, 'emp_code' => str_pad((string)((int)$row['max_code'] + 1), 3, '0', STR_PAD_LEFT)));
}
if ($action === 'prs') {
    $source = filter_var(isset($_REQUEST['source']) ? $_REQUEST['source'] : null, FILTER_VALIDATE_INT);
    $year = filter_var(isset($_REQUEST['year']) ? $_REQUEST['year'] : null, FILTER_VALIDATE_INT);
    if (!$source) respond(array('success' => false, 'msg' => 'เลือกพนักงานต้นทาง'));
    if ($year === false || $year === null || ($year !== 0 && ($year < 1900 || $year > 2200))) respond(array('success' => false, 'msg' => 'ปีงบประมาณไม่ถูกต้อง'));
    $sql = 'SELECT tor_id AS id,c_code,c_name FROM sp_tor WHERE sp_emp_id=?';
    $params = array($source);
    if ($year !== 0) { $sql .= ' AND i_pr_year=?'; $params[] = $year; }
    $stmt = $db->QueryParam($sql.' ORDER BY tor_id DESC', $params);
    $rows = array(); while ($stmt && $row = $db->Fetch($stmt)) $rows[] = $row;
    respond(array('success' => true, 'data' => $rows));
}
if ($action === 'history') {
    $start = max(0, (int)($_REQUEST['start'] ?? 0));
    $limit = min(100, max(1, (int)($_REQUEST['limit'] ?? 50)));
    $countStmt = @sqlsrv_query($db->conn, 'SELECT COUNT(*) AS n FROM dbo.sp_pr_transfer_history');
    $countRow = $countStmt ? sqlsrv_fetch_array($countStmt, SQLSRV_FETCH_ASSOC) : false;
    $stmt = @sqlsrv_query($db->conn, 'SELECT id,tor_id,pr_code,pr_name,source_emp_name,target_emp_name,actor_user_name,actor_user_id,CONVERT(varchar(19),transferred_at,120) AS transferred_at FROM dbo.sp_pr_transfer_history ORDER BY transferred_at DESC,id DESC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY', array($start, $limit));
    if (!$stmt || !$countRow) respond(array('success' => false, 'msg' => 'ไม่สามารถโหลดประวัติการย้าย กรุณาตรวจสอบการติดตั้งตารางประวัติ'));
    $rows = array(); while ($row = $db->Fetch($stmt)) $rows[] = $row;
    respond(array('success' => true, 'data' => $rows, 'totalCount' => (int)$countRow['n']));
}
if ($action === 'history_details') {
    $id = filter_var($_REQUEST['id'] ?? null, FILTER_VALIDATE_INT);
    if (!$id || $id < 1) respond(array('success' => false, 'msg' => 'ไม่พบรายการประวัติ'));
    $stmt = @sqlsrv_query($db->conn, 'SELECT id,table_name,row_id,old_sp_emp_id,new_sp_emp_id FROM dbo.sp_pr_transfer_history_detail WHERE history_id=? ORDER BY id', array($id));
    if (!$stmt) respond(array('success' => false, 'msg' => 'ไม่สามารถโหลดรายละเอียดประวัติการย้าย'));
    $rows = array(); while ($row = $db->Fetch($stmt)) $rows[] = $row;
    respond(array('success' => true, 'data' => $rows));
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(array('success' => false, 'msg' => 'ไม่มีสิทธิ์แก้ไข'));
if ($action === 'transfer') {
    $source = filter_input(INPUT_POST, 'source', FILTER_VALIDATE_INT);
    $target = filter_input(INPUT_POST, 'target', FILTER_VALIDATE_INT);
    $ids = json_decode(isset($_POST['ids']) ? $_POST['ids'] : '', true);
    if (!$source || !$target || $source === $target || !is_array($ids) || !$ids || count($ids) > 500) respond(array('success' => false, 'msg' => 'ข้อมูลการย้าย PR ไม่ถูกต้อง'));
    foreach ($ids as $id) if (!filter_var($id, FILTER_VALIDATE_INT, array('options' => array('min_range' => 1)))) respond(array('success' => false, 'msg' => 'เลข PR ไม่ถูกต้อง'));
    $ids = array_map('intval', $ids);
    if (count(array_unique($ids)) !== count($ids)) respond(array('success' => false, 'msg' => 'รายการ PR ซ้ำกัน'));
    if (!$db->GetDataBySQL('SELECT sp_emp_id FROM sp_emp WHERE sp_emp_id=? AND i_enable=1', array($target))) respond(array('success' => false, 'msg' => 'ไม่พบพนักงานปลายทางที่ใช้งานอยู่'));
    $marks = implode(',', array_fill(0, count($ids), '?'));
    $params = array_merge(array($source), $ids);
    if (!sqlsrv_begin_transaction($db->conn)) respond(array('success' => false, 'msg' => 'ไม่สามารถเริ่มบันทึกการย้าย'));
    $stmt = @sqlsrv_query($db->conn, 'SELECT COUNT(*) AS n FROM sp_tor WITH (UPDLOCK,HOLDLOCK) WHERE sp_emp_id=? AND tor_id IN ('.$marks.')', $params);
    $row = $stmt ? sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC) : false;
    if (!$row || (int)$row['n'] !== count($ids)) {
        sqlsrv_rollback($db->conn);
        respond(array('success' => false, 'msg' => 'รายการ PR มีการเปลี่ยนแปลงหรือไม่สามารถตรวจสอบได้ กรุณาค้นหาใหม่'));
    }
    $map = @sqlsrv_query($db->conn, 'CREATE TABLE #PrTransferMap (tor_id int NOT NULL PRIMARY KEY, history_id bigint NOT NULL); CREATE TABLE #PrTransferChanges (history_id bigint NOT NULL, table_name varchar(64) NOT NULL, row_id int NOT NULL, old_sp_emp_id int NOT NULL, new_sp_emp_id int NOT NULL)');
    if (!$map) { sqlsrv_rollback($db->conn); respond(array('success' => false, 'msg' => 'ไม่สามารถเตรียมประวัติการย้าย')); }
    $insertParams = array_merge(array($target, $_SESSION['user_id'], $source), $ids);
    $insert = @sqlsrv_query($db->conn, 'INSERT INTO dbo.sp_pr_transfer_history (tor_id,pr_code,pr_name,source_emp_id,source_emp_name,target_emp_id,target_emp_name,actor_user_id,actor_user_name) OUTPUT inserted.tor_id,inserted.id INTO #PrTransferMap (tor_id,history_id) SELECT t.tor_id,t.c_code,t.c_name,t.sp_emp_id,src.c_name,dst.sp_emp_id,dst.c_name,u.dc_user_id,u.c_full_name FROM dbo.sp_tor t JOIN dbo.sp_emp src ON src.sp_emp_id=t.sp_emp_id JOIN dbo.sp_emp dst ON dst.sp_emp_id=? AND dst.i_enable=1 JOIN dbo.dc_user u ON u.dc_user_id=? WHERE t.sp_emp_id=? AND t.tor_id IN ('.$marks.')', $insertParams);
    if (!$insert || sqlsrv_rows_affected($insert) !== count($ids)) {
        sqlsrv_rollback($db->conn);
        error_log('PR transfer history insert failed: '.print_r(sqlsrv_errors(), true));
        respond(array('success' => false, 'msg' => 'ไม่สามารถบันทึกประวัติการย้ายได้ กรุณาตรวจสอบการติดตั้งตารางประวัติ'));
    }
    // Each change is recorded with its original row ID in the same transaction.
    // Related rows belonging to a different employee are deliberately left intact.
    $updates = array(
        'sp_tor_contract' => array('c', 'sp_tor_contract_id', 'FROM dbo.sp_tor_contract c JOIN #PrTransferMap map ON map.tor_id=c.sp_tor_id'),
        'sp_mn_contract_hdr' => array('m', 'sp_mn_contract_hdr_id', 'FROM dbo.sp_mn_contract_hdr m JOIN dbo.sp_tor_contract c ON c.sp_tor_contract_id=m.sp_contract_id JOIN #PrTransferMap map ON map.tor_id=c.sp_tor_id'),
        'sp_tor_hdr_period' => array('p', 'sp_tor_hdr_period_id', 'FROM dbo.sp_tor_hdr_period p LEFT JOIN dbo.sp_mn_contract_hdr m ON m.sp_mn_contract_hdr_id=p.sp_mn_contract_hdr_id JOIN dbo.sp_tor_contract c ON c.sp_tor_contract_id=COALESCE(NULLIF(p.sp_tor_contract_id,0),m.sp_contract_id) JOIN #PrTransferMap map ON map.tor_id=c.sp_tor_id'),
        'sp_check_period_hdr' => array('h', 'sp_check_period_hdr_id', 'FROM dbo.sp_check_period_hdr h LEFT JOIN dbo.sp_tor_hdr_period p ON p.sp_tor_hdr_period_id=h.sp_tor_hdr_period_id LEFT JOIN dbo.sp_mn_contract_hdr m ON m.sp_mn_contract_hdr_id=h.sp_mn_contract_hdr_id JOIN dbo.sp_tor_contract c ON c.sp_tor_contract_id=COALESCE(NULLIF(h.sp_tor_contract_id,0),NULLIF(p.sp_tor_contract_id,0),m.sp_contract_id) JOIN #PrTransferMap map ON map.tor_id=c.sp_tor_id'),
        'sp_tor' => array('t', 'tor_id', 'FROM dbo.sp_tor t JOIN #PrTransferMap map ON map.tor_id=t.tor_id')
    );
    $changed = array();
    foreach ($updates as $table => $spec) {
        list($alias, $key, $from) = $spec;
        $sql = 'UPDATE '.$alias.' SET sp_emp_id=?,dc_user_update_id=?,dc_user_update_cost_id=?,d_update=GETDATE() OUTPUT map.history_id,\''.$table.'\',inserted.'.$key.',deleted.sp_emp_id,inserted.sp_emp_id INTO #PrTransferChanges (history_id,table_name,row_id,old_sp_emp_id,new_sp_emp_id) '.$from.' WHERE '.$alias.'.sp_emp_id=?';
        $update = @sqlsrv_query($db->conn, $sql, array($target, $_SESSION['user_id'], $_SESSION['dc_cost_id'], $source));
        if (!$update || ($changed[$table] = sqlsrv_rows_affected($update)) === false || ($table === 'sp_tor' && $changed[$table] !== count($ids))) {
            error_log('PR transfer update failed for '.$table.': '.print_r(sqlsrv_errors(), true));
            sqlsrv_rollback($db->conn);
            respond(array('success' => false, 'msg' => 'บันทึกการย้ายไม่สำเร็จ ข้อมูลทั้งหมดถูกยกเลิก กรุณาลองใหม่'));
        }
    }
    $details = @sqlsrv_query($db->conn, 'INSERT INTO dbo.sp_pr_transfer_history_detail (history_id,table_name,row_id,old_sp_emp_id,new_sp_emp_id) SELECT history_id,table_name,row_id,old_sp_emp_id,new_sp_emp_id FROM #PrTransferChanges');
    if (!$details || sqlsrv_rows_affected($details) !== array_sum($changed)) {
        error_log('PR transfer detail insert failed: '.print_r(sqlsrv_errors(), true));
        sqlsrv_rollback($db->conn);
        respond(array('success' => false, 'msg' => 'ไม่สามารถบันทึกรายละเอียดประวัติ ข้อมูลทั้งหมดถูกยกเลิก'));
    }
    if (!sqlsrv_commit($db->conn)) {
        sqlsrv_rollback($db->conn);
        respond(array('success' => false, 'msg' => 'บันทึกการย้ายไม่สำเร็จ กรุณาลองใหม่'));
    }
    respond(array('success' => true, 'msg' => 'บันทึกการย้าย PR จำนวน '.count($ids).' รายการเรียบร้อยแล้ว', 'changed' => $changed));
}
if ($action === 'employee') {
    $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
    $department = filter_input(INPUT_POST, 'department', FILTER_VALIDATE_INT);
    $parent = filter_input(INPUT_POST, 'parent', FILTER_VALIDATE_INT);
    $name = trim(isset($_POST['name']) ? $_POST['name'] : '');
    if (!$id || !$department || $name === '' || mb_strlen($name) > 255 || $parent === $id) respond(array('success' => false, 'msg' => 'ข้อมูลพนักงานไม่ถูกต้อง'));
    if (!$db->GetDataBySQL('SELECT dc_department_id FROM sp_department WHERE dc_department_id=?', array($department))) respond(array('success' => false, 'msg' => 'ไม่พบหน่วยงาน'));
    if ($parent && !$db->GetDataBySQL('SELECT sp_emp_id FROM sp_emp WHERE sp_emp_id=?', array($parent))) respond(array('success' => false, 'msg' => 'ไม่พบหัวหน้าสายงาน'));
    if (!sqlsrv_begin_transaction($db->conn)) respond(array('success' => false, 'msg' => 'ไม่สามารถเริ่มบันทึกข้อมูลพนักงาน'));
    // Lock the table while choosing and saving a number, so concurrent saves
    // cannot receive the same next code.
    $stmt = @sqlsrv_query($db->conn, 'SELECT ISNULL(MAX(TRY_CONVERT(int, NULLIF(LTRIM(RTRIM(emp_code)),\'\'))),0) AS max_code FROM dbo.sp_emp WITH (TABLOCKX,HOLDLOCK)');
    $max = $stmt ? sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC) : false;
    $stmt = @sqlsrv_query($db->conn, 'SELECT emp_code FROM dbo.sp_emp WHERE sp_emp_id=?', array($id));
    $employee = $stmt ? sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC) : false;
    if (!$max || !$employee) { sqlsrv_rollback($db->conn); respond(array('success' => false, 'msg' => 'ไม่พบพนักงานหรือไม่สามารถตรวจสอบ emp_code')); }
    $code = trim((string)$employee['emp_code']);
    if ($code === '') {
        if ((int)$max['max_code'] >= 9999) { sqlsrv_rollback($db->conn); respond(array('success' => false, 'msg' => 'ไม่สามารถกำหนด emp_code ถัดไปได้')); }
        $code = str_pad((string)((int)$max['max_code'] + 1), 3, '0', STR_PAD_LEFT);
    }
    $ok = @sqlsrv_query($db->conn, 'UPDATE sp_emp SET c_name=?,dc_department_id=?,i_parent=?,emp_code=? WHERE sp_emp_id=?', array($name,$department,$parent ?: null,$code,$id));
    if (!$ok || sqlsrv_rows_affected($ok) !== 1 || !sqlsrv_commit($db->conn)) {
        sqlsrv_rollback($db->conn);
        respond(array('success' => false, 'msg' => 'บันทึกข้อมูลพนักงานไม่สำเร็จ'));
    }
    respond(array('success' => true, 'emp_code' => $code, 'msg' => 'บันทึกข้อมูลพนักงานสำเร็จ (emp_code: '.$code.')'));
}
respond(array('success' => false, 'msg' => 'คำสั่งไม่ถูกต้อง'));
