<?php
require_once __DIR__ . '/../../conf/config.php';
require_once __DIR__ . '/../../lib/database/DatabaseServer.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'กรุณาเข้าสู่ระบบ'], JSON_UNESCAPED_UNICODE);
    exit;
}

$db = new DatabaseServer();
$userId = (int) $_SESSION['user_id'];
// dc_center_user is an account ID, not an administrator flag. During
// impersonation, authorization and data ownership must follow the employee.
$isAdmin = (int) ($_SESSION['i_type_user'] ?? 0) === 2
    && empty($_SESSION['impersonation_admin_center_id'])
    && empty($_SESSION['impersonation_admin']);
$mode = trim((string) ($_REQUEST['mode'] ?? 'list'));
$testType = trim((string) ($_REQUEST['type'] ?? 'all'));
$targetUserId = (int) ($_REQUEST['target_user_id'] ?? 0);
$isTest = $mode === 'test';
if (($mode === 'users' || $isTest) && !$isAdmin) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'เฉพาะผู้ดูแลระบบเท่านั้น'], JSON_UNESCAPED_UNICODE);
    exit;
}
$ensureTestQueue = static function () use ($db): void {
    $sql = "IF OBJECT_ID(N'dbo.sp_contract_alert_test_queue', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.sp_contract_alert_test_queue (
            alert_id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
            target_user_id INT NOT NULL,
            created_by INT NOT NULL,
            category NVARCHAR(30) NOT NULL,
            title NVARCHAR(200) NOT NULL,
            items_json NVARCHAR(MAX) NOT NULL,
            created_at DATETIME2 NOT NULL CONSTRAINT DF_sp_contract_alert_test_queue_created_at DEFAULT SYSDATETIME(),
            seen_at DATETIME2 NULL
        );
        CREATE INDEX IX_sp_contract_alert_test_queue_pending
            ON dbo.sp_contract_alert_test_queue(target_user_id, seen_at, created_at);
    END";
    $stmt = sqlsrv_query($db->conn, $sql);
    if ($stmt === false) throw new RuntimeException('เตรียมกล่องแจ้งเตือนทดสอบไม่สำเร็จ');
    sqlsrv_free_stmt($stmt);
};
if ($mode === 'inbox' || $mode === 'ack') {
    try {
        $ensureTestQueue();
        if ($mode === 'ack') {
            $rawIds = (string) ($_POST['ids'] ?? '');
            $ids = array_values(array_filter(array_map('intval', explode(',', $rawIds)), static fn($id) => $id > 0));
            if ($ids) {
                $marks = implode(',', array_fill(0, count($ids), '?'));
                $params = array_merge([$userId], $ids);
                $stmt = sqlsrv_query($db->conn,
                    "UPDATE dbo.sp_contract_alert_test_queue SET seen_at=SYSDATETIME() WHERE target_user_id=? AND seen_at IS NULL AND alert_id IN ($marks)",
                    $params);
                if ($stmt === false) throw new RuntimeException('บันทึกสถานะการรับแจ้งเตือนไม่สำเร็จ');
                sqlsrv_free_stmt($stmt);
            }
            echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $stmt = sqlsrv_query($db->conn,
            'SELECT alert_id, category, title, items_json, created_at FROM dbo.sp_contract_alert_test_queue WHERE target_user_id=? AND seen_at IS NULL ORDER BY created_at, alert_id',
            [$userId]);
        if ($stmt === false) throw new RuntimeException('อ่านกล่องแจ้งเตือนไม่สำเร็จ');
        $notifications = [];
        while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
            $notifications[] = [
                'id' => (int) $row['alert_id'],
                'category' => (string) $row['category'],
                'title' => (string) $row['title'],
                'items' => json_decode((string) $row['items_json'], true) ?: [],
                'createdAt' => $row['created_at'] instanceof DateTimeInterface ? $row['created_at']->format('Y-m-d H:i:s') : (string) $row['created_at'],
            ];
        }
        sqlsrv_free_stmt($stmt);
        echo json_encode(['success' => true, 'notifications' => $notifications], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    } catch (Throwable $error) {
        http_response_code(500);
        error_log('Contract alert inbox: ' . $error->getMessage());
        echo json_encode(['success' => false, 'message' => $error->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
if ($mode === 'users') {
    $sql = "SELECT DISTINCT u.dc_user_id AS id,
            CASE
                WHEN NULLIF(LTRIM(RTRIM(e.c_name)), '') IS NOT NULL
                    AND e.c_name NOT LIKE '%?%' THEN e.c_name
                WHEN NULLIF(LTRIM(RTRIM(u.c_full_name)), '') IS NOT NULL
                    AND u.c_full_name NOT LIKE '%?%' THEN u.c_full_name
                ELSE u.c_user_name
            END AS name,
            e.c_name AS officer_name, dep.c_name AS department_name
        FROM dbo.dc_user u
        INNER JOIN dbo.sp_emp e ON e.dc_emp_id=u.dc_emp_id
        LEFT JOIN dbo.sp_department dep ON dep.dc_department_id=e.dc_department_id
        WHERE e.dc_emp_id>1 AND u.dc_user_id IS NOT NULL
        ORDER BY name";
    $stmt = sqlsrv_query($db->conn, $sql);
    if ($stmt === false) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'โหลดรายชื่อพนักงานไม่สำเร็จ'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $users = [];
    while ($user = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
        $users[] = ['id' => (int) $user['id'], 'name' => (string) $user['name'],
            'officer' => (string) ($user['officer_name'] ?? ''),
            'department' => (string) ($user['department_name'] ?? '')];
    }
    sqlsrv_free_stmt($stmt);
    echo json_encode(['success' => true, 'users' => $users], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
if ($isTest && ($targetUserId <= 0 || !in_array($testType, ['all', 'delivery', 'warranty', 'contract', 'guarantee'], true))) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'กรุณาเลือกประเภทแจ้งเตือนและพนักงาน'], JSON_UNESCAPED_UNICODE);
    exit;
}
$departmentFilter = trim((string) ($_GET['department'] ?? 'all'));
$departmentSql = $departmentFilter === 'medicine' ? " AND dep.c_name LIKE N'%แพทย์%'" : '';
$ownerSql = $isTest ? ' AND u.dc_user_id = ?' : ($isAdmin ? '' : ' AND u.dc_user_id = ?');
$ownerParams = $isTest ? [$targetUserId] : ($isAdmin ? [] : [$userId]);
$today = (new DateTimeImmutable('today', new DateTimeZone('Asia/Bangkok')))->format('Y-m-d');
$endDate = (new DateTimeImmutable('today', new DateTimeZone('Asia/Bangkok')))->modify('+31 days')->format('Y-m-d');
$items = [];

$baseJoins = "
    INNER JOIN dbo.sp_tor t ON t.tor_id=c.sp_tor_id
    LEFT JOIN dbo.sp_emp e ON e.sp_emp_id=t.sp_emp_id
    LEFT JOIN dbo.sp_department dep ON dep.dc_department_id=e.dc_department_id
    LEFT JOIN dbo.dc_user u ON u.dc_emp_id=e.dc_emp_id
    LEFT JOIN NMU.dbo.dc_creditor creditor ON creditor.dc_creditor_id=c.dc_creditor_id";

$queries = [
    'delivery' => [
        "SELECT p.sp_tor_hdr_period_id AS source_id, p.i_period, p.d_period_date AS deadline,
            h.c_arrive_code AS ir_code, h.c_code AS inspection_code, h.d_arrive_date,
            c.sp_tor_contract_id, c.c_code AS contract_code, c.c_name AS contract_name,
            t.c_name AS project_name, creditor.c_name AS counterparty,
            e.c_name AS officer_name, dep.c_name AS department_name, dep.dc_department_id,
            u.dc_user_id AS owner_user_id,
            DATEDIFF(day, CAST(GETDATE() AS date), CAST(p.d_period_date AS date)) AS days_remaining
        FROM dbo.sp_tor_hdr_period p
        INNER JOIN dbo.sp_tor_contract c ON c.sp_tor_contract_id=p.sp_tor_contract_id AND c.i_enabled=1
        LEFT JOIN dbo.sp_check_period_hdr h ON h.sp_tor_hdr_period_id=p.sp_tor_hdr_period_id AND h.i_enabled=1
        $baseJoins
        WHERE ISNULL(p.i_enabled,1)=1 AND p.d_period_date IS NOT NULL
            AND p.d_period_date >= ? AND p.d_period_date < ?
            AND h.d_arrive_date IS NULL" . $departmentSql . $ownerSql . "
        ORDER BY p.d_period_date, p.sp_tor_hdr_period_id",
        array_merge([$today, $endDate], $ownerParams)
    ],
    'warranty' => [
        "SELECT h.sp_check_period_hdr_id AS source_id, h.c_code AS inspection_code,
            h.c_arrive_code AS ir_code, h.d_warranty_date AS deadline, h.d_checking_date AS checking_date,
            h.i_is_warranty, h.i_warranty_age, h.i_before,
            c.sp_tor_contract_id, c.c_code AS contract_code, c.c_name AS contract_name,
            t.c_name AS project_name, creditor.c_name AS counterparty,
            e.c_name AS officer_name, dep.c_name AS department_name, dep.dc_department_id,
            u.dc_user_id AS owner_user_id,
            DATEDIFF(day, CAST(GETDATE() AS date), CAST(h.d_warranty_date AS date)) AS days_remaining
        FROM dbo.sp_check_period_hdr h
        LEFT JOIN dbo.sp_mn_contract_hdr m ON m.sp_mn_contract_hdr_id=h.sp_mn_contract_hdr_id
        INNER JOIN dbo.sp_tor_contract c ON c.sp_tor_contract_id=COALESCE(NULLIF(h.sp_tor_contract_id,0),m.sp_contract_id) AND c.i_enabled=1
        $baseJoins
        WHERE h.i_enabled=1 AND h.d_warranty_date IS NOT NULL
            AND h.d_warranty_date >= ? AND h.d_warranty_date < ?
            AND h.i_is_warranty IN (1,3)" . $departmentSql . $ownerSql . "
        ORDER BY h.d_warranty_date, h.sp_check_period_hdr_id",
        array_merge([$today, $endDate], $ownerParams)
    ],
    'contract' => [
        "SELECT c.sp_tor_contract_id AS source_id, c.c_code AS contract_code,
            c.d_due_date AS deadline, c.c_name AS contract_name,
            t.c_name AS project_name, creditor.c_name AS counterparty,
            e.c_name AS officer_name, dep.c_name AS department_name, dep.dc_department_id,
            u.dc_user_id AS owner_user_id,
            DATEDIFF(day, CAST(GETDATE() AS date), CAST(c.d_due_date AS date)) AS days_remaining
        FROM dbo.sp_tor_contract c
        $baseJoins
        WHERE c.i_enabled=1 AND ISNULL(c.i_is_close,0)=0 AND c.d_due_date IS NOT NULL
            AND c.d_due_date >= ? AND c.d_due_date < ?" . $departmentSql . $ownerSql . "
        ORDER BY c.d_due_date, c.sp_tor_contract_id",
        array_merge([$today, $endDate], $ownerParams)
    ],
    'guarantee' => [
        "SELECT c.sp_tor_contract_id AS source_id, c.c_code AS contract_code,
            c.d_book_warranty_end AS deadline, c.book_warranty_no, c.d_return_warranty,
            c.c_return_warranty, c.c_return_comment, c.c_name AS contract_name,
            t.c_name AS project_name, creditor.c_name AS counterparty,
            e.c_name AS officer_name, dep.c_name AS department_name, dep.dc_department_id,
            u.dc_user_id AS owner_user_id,
            DATEDIFF(day, CAST(GETDATE() AS date), CAST(c.d_book_warranty_end AS date)) AS days_remaining
        FROM dbo.sp_tor_contract c
        $baseJoins
        WHERE c.i_enabled=1 AND ISNULL(c.i_is_return,0)=0 AND c.d_book_warranty_end IS NOT NULL
            AND c.d_book_warranty_end >= ? AND c.d_book_warranty_end < ?" . $departmentSql . $ownerSql . "
        ORDER BY c.d_book_warranty_end, c.sp_tor_contract_id",
        array_merge([$today, $endDate], $ownerParams)
    ],
];

function alertDate($value): string
{
    if ($value instanceof DateTimeInterface) return $value->format('Y-m-d');
    return $value ? substr((string) $value, 0, 10) : '';
}

try {
    foreach ($queries as $type => [$sql, $params]) {
        if ($isTest && $testType !== 'all' && $type !== $testType) continue;
        $stmt = sqlsrv_query($db->conn, $sql, $params);
        if ($stmt === false) throw new RuntimeException('อ่านข้อมูลวันครบกำหนดจาก NMU_ERP ไม่สำเร็จ');
        while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
            $deadline = alertDate($row['deadline'] ?? null);
            $days = (int) ($row['days_remaining'] ?? 0);
            $inspectionCode = trim((string) ($row['inspection_code'] ?? ''));
            $irCode = trim((string) ($row['ir_code'] ?? ''));
            $age = (int) ($row['i_warranty_age'] ?? 0);
            $before = (int) ($row['i_before'] ?? 0);
            $warrantyDetail = $type === 'warranty'
                ? ($age > 0 ? "รับประกัน {$age} เดือน" : 'ไม่ระบุระยะเวลารับประกัน') . ($before > 0 ? " · แจ้งล่วงหน้า {$before} วัน" : '')
                : '';
            $checkingDate = alertDate($row['checking_date'] ?? null);
            $items[] = [
                'id' => $type . '-' . (int) $row['source_id'],
                'type' => $type,
                'departmentId' => (int) ($row['dc_department_id'] ?? 0),
                'departmentName' => (string) ($row['department_name'] ?? ''),
                'code' => (string) ($row['contract_code'] ?? ''),
                'periodNo' => isset($row['i_period']) ? (int) $row['i_period'] : null,
                'irCode' => $irCode,
                'inspectionCode' => $inspectionCode,
                'counterparty' => (string) ($row['counterparty'] ?? 'ไม่พบข้อมูลคู่สัญญา'),
                'name' => (string) ($row['contract_name'] ?? $row['project_name'] ?? ''),
                'receipt' => $checkingDate ? date('d/m/Y', strtotime($checkingDate)) : '',
                'end' => $deadline ? date('d/m/Y', strtotime($deadline)) : '',
                'deadlineIso' => $deadline,
                'warrantyDetail' => $warrantyDetail,
                'guaranteeNo' => (string) ($row['book_warranty_no'] ?? ''),
                'returnDocumentNo' => (string) ($row['c_return_warranty'] ?? ''),
                'returnDate' => alertDate($row['d_return_warranty'] ?? null),
                'returnComment' => (string) ($row['c_return_comment'] ?? ''),
                'days' => $days,
                'range' => '',
                'owner' => (string) ($row['department_name'] ?? ''),
                'officer' => (string) ($row['officer_name'] ?? 'ไม่พบข้อมูลเจ้าหน้าที่'),
                'ownerUserId' => $isAdmin ? (int) ($row['owner_user_id'] ?? 0) : null,
                'line' => (string) ($row['department_name'] ?? ''),
                'procurementHead' => '',
                'status' => 'active',
                'urgent' => $days <= 7,
            ];
        }
        sqlsrv_free_stmt($stmt);
    }
    if ($isTest) {
        $ensureTestQueue();
        $labels = ['all' => 'ทุกประเภท', 'delivery' => 'สิ้นสุดส่งของ', 'warranty' => 'สิ้นสุดรับประกัน',
            'contract' => 'สิ้นสุดสัญญา', 'guarantee' => 'ค้ำประกันผลงาน / คืนหลักค้ำ'];
        $title = 'ทดสอบการแจ้งเตือน · ' . ($labels[$testType] ?? 'ทุกประเภท');
        $itemsJson = json_encode($items, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($itemsJson === false) throw new RuntimeException('จัดรูปแบบรายการทดสอบไม่สำเร็จ');
        $stmt = sqlsrv_query($db->conn,
            'INSERT INTO dbo.sp_contract_alert_test_queue (target_user_id, created_by, category, title, items_json) VALUES (?, ?, ?, ?, ?)',
            [$targetUserId, $userId, $testType, $title, $itemsJson]);
        if ($stmt === false) throw new RuntimeException('ส่งรายการทดสอบเข้ากล่องแจ้งเตือนพนักงานไม่สำเร็จ');
        sqlsrv_free_stmt($stmt);
        echo json_encode(['success' => true, 'queued' => count($items), 'targetUserId' => $targetUserId,
            'testLabel' => $title], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    } else {
        echo json_encode(['success' => true, 'source' => 'NMU_ERP', 'isAdmin' => $isAdmin,
            'user' => [
                'name' => (string) ($_SESSION['user_name'] ?? ''),
                'line' => (string) ($_SESSION['c_department'] ?? ''),
                'department' => (string) ($_SESSION['cost_name'] ?? ''),
            ],
            'items' => $items], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
} catch (Throwable $error) {
    http_response_code(500);
    error_log('Contract alerts: ' . $error->getMessage());
    echo json_encode(['success' => false, 'message' => $error->getMessage()], JSON_UNESCAPED_UNICODE);
}
