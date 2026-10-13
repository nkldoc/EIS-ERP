<?php
declare(strict_types=1);

require_once __DIR__ . '/api_auth.php';
require_once __DIR__ . '/../AuthMiddleware.php';
header('Cache-Control: no-store');

try {
    $pdo = apiDb();
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) $headers['Authorization'] = $_SERVER['HTTP_AUTHORIZATION'];
    $auth = (new Auth($pdo, $headers))->isValid();
    if ($auth['success'] !== 1) apiRespond(401, ['message' => 'กรุณาเข้าสู่ระบบใหม่']);
    if ($auth['user']['role'] !== 'superadmin') apiRespond(403, ['message' => 'เฉพาะ Superadmin เท่านั้น']);
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if (!preg_match('~/apiAccounts(?:\.php)?(?:/([1-9][0-9]*))?/?$~D', $path, $match)) apiRespond(404, ['message' => 'ไม่พบเส้นทาง']);
    $id = isset($match[1]) ? (int)$match[1] : null;
    $method = $_SERVER['REQUEST_METHOD'];
    $allowed = $id ? ['PUT', 'DELETE'] : ['GET', 'POST'];
    if (!in_array($method, $allowed, true)) {
        header('Allow: ' . implode(', ', $allowed));
        apiRespond(405, ['message' => 'Method not allowed']);
    }
    switch ($method) {
        case 'GET': listAccounts($pdo); break;
        case 'POST': createAccount($pdo, readJsonBody()); break;
        case 'PUT': updateAccount($pdo, $id, readJsonBody()); break;
        case 'DELETE': deleteAccount($pdo, $id); break;
    }
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    apiRespond(500, ['message' => 'ฐานข้อมูลบัญชีขาเข้าไม่พร้อม กรุณาตรวจการเชื่อมต่อและตาราง sp_api_account / sp_api_permission']);
}

function readJsonBody(): array
{
    $raw = file_get_contents('php://input', false, null, 0, 65537);
    if (strlen($raw) > 65536) apiRespond(413, ['message' => 'ข้อมูลใหญ่เกินกำหนด']);
    $body = json_decode($raw, true);
    if (!is_array($body) || substr(ltrim($raw), 0, 1) !== '{') apiRespond(400, ['message' => 'ต้องส่งข้อมูล JSON object']);
    foreach (['username', 'password', 'note'] as $field) {
        if (isset($body[$field]) && !is_string($body[$field])) apiRespond(422, ['message' => 'รูปแบบข้อมูลไม่ถูกต้อง']);
    }
    if (!isset($body['active']) || !is_bool($body['active']) || !isset($body['permissions']) || !is_array($body['permissions'])) apiRespond(422, ['message' => 'กรุณาระบุสถานะและรายการสิทธิ์']);
    if (mb_strlen(trim($body['username'] ?? ''), 'UTF-8') > 100 || mb_strlen(trim($body['note'] ?? ''), 'UTF-8') > 255) apiRespond(422, ['message' => 'Username หรือหมายเหตุยาวเกินกำหนด']);
    return $body;
}

function listAccounts(PDO $pdo): void
{
    $accounts = $pdo->query(
        'SELECT account_id AS id, username, is_active, note FROM sp_api_account ORDER BY username'
    )->fetchAll();

    $perms = $pdo->query('SELECT account_id, route_key FROM sp_api_permission')->fetchAll();
    $byAccount = [];
    foreach ($perms as $p) {
        $byAccount[$p['account_id']][] = $p['route_key'];
    }
    foreach ($accounts as &$a) {
        $a['permissions'] = $byAccount[$a['id']] ?? [];
    }
    unset($a);

    apiRespond(200, $accounts); // frontend คาดหวัง array ตรงๆ ไม่ใช่ {success,...}
}

function createAccount(PDO $pdo, array $body): void
{
    $username = trim((string) ($body['username'] ?? ''));
    $password = (string) ($body['password'] ?? '');
    $note = trim((string) ($body['note'] ?? ''));
    $active = !empty($body['active']) ? 1 : 0;
    $permissions = sanitizePermissions($body['permissions'] ?? []);

    if ($username === '' || $password === '') {
        apiRespond(400, ['success' => 0, 'message' => 'กรุณากรอก username และ password']);
    }
    if (strlen($password) < 8) {
        apiRespond(400, ['success' => 0, 'message' => 'password ต้องมีอย่างน้อย 8 ตัวอักษร']);
    }

    try {
        $pdo->beginTransaction();
        $stmt = $pdo->prepare(
            'INSERT INTO sp_api_account (username, password_hash, is_active, note) VALUES (:u, :p, :a, :n)'
        );
        $stmt->execute([
            'u' => $username,
            'p' => password_hash($password, PASSWORD_DEFAULT),
            'a' => $active,
            'n' => $note,
        ]);
        $id = (int) $pdo->lastInsertId();
        savePermissions($pdo, $id, $permissions);
        $pdo->commit();
        apiRespond(200, ['success' => 1, 'id' => $id, 'message' => 'สร้างบัญชีสำเร็จ']);
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        if ((int) ($e->errorInfo[1] ?? 0) === 1062) {
            apiRespond(409, ['success' => 0, 'message' => 'มี username นี้อยู่แล้ว']);
        }
        apiRespond(500, ['success' => 0, 'message' => 'สร้างบัญชีไม่สำเร็จ กรุณาตรวจฐานข้อมูล']);
    }
}

function updateAccount(PDO $pdo, int $id, array $body): void
{
    $exists = $pdo->prepare('SELECT 1 FROM sp_api_account WHERE account_id = :id');
    $exists->execute(['id' => $id]);
    if (!$exists->fetch()) {
        apiRespond(404, ['success' => 0, 'message' => 'ไม่พบบัญชีนี้']);
    }

    $note = trim((string) ($body['note'] ?? ''));
    $active = !empty($body['active']) ? 1 : 0;
    $permissions = sanitizePermissions($body['permissions'] ?? []);
    $password = (string) ($body['password'] ?? '');

    if ($password !== '' && strlen($password) < 8) {
        apiRespond(400, ['success' => 0, 'message' => 'password ต้องมีอย่างน้อย 8 ตัวอักษร']);
    }

    try {
        $pdo->beginTransaction();
        if ($password !== '') {
            $stmt = $pdo->prepare(
                'UPDATE sp_api_account SET password_hash = :p, is_active = :a, note = :n WHERE account_id = :id'
            );
            $stmt->execute(['p' => password_hash($password, PASSWORD_DEFAULT), 'a' => $active, 'n' => $note, 'id' => $id]);
        } else {
            $stmt = $pdo->prepare(
                'UPDATE sp_api_account SET is_active = :a, note = :n WHERE account_id = :id'
            );
            $stmt->execute(['a' => $active, 'n' => $note, 'id' => $id]);
        }
        savePermissions($pdo, $id, $permissions);
        $pdo->commit();
        apiRespond(200, ['success' => 1, 'message' => 'บันทึกสำเร็จ']);
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        apiRespond(500, ['success' => 0, 'message' => 'บันทึกไม่สำเร็จ กรุณาตรวจฐานข้อมูล']);
    }
}

function deleteAccount(PDO $pdo, int $id): void
{
    $stmt = $pdo->prepare('DELETE FROM sp_api_account WHERE account_id = :id');
    $stmt->execute(['id' => $id]);
    if ($stmt->rowCount() === 0) {
        apiRespond(404, ['success' => 0, 'message' => 'ไม่พบบัญชีนี้']);
    }
    // sp_api_permission ใช้ ON DELETE CASCADE อยู่แล้วจาก schema เดิม จึงไม่ต้องลบแยก
    apiRespond(200, ['success' => 1, 'message' => 'ลบบัญชีแล้ว']);
}

function sanitizePermissions($raw): array
{
    if (!is_array($raw)) {
        return [];
    }
    $clean = [];
    foreach ($raw as $route) {
        if (!is_string($route) || !preg_match('/^[A-Za-z0-9._-]{1,100}$/D', trim($route))) apiRespond(422, ['message' => 'route_key ไม่ถูกต้อง']);
        $route = trim($route);
        if ($route !== '' && preg_match('/^[A-Za-z0-9._-]{1,100}$/', $route)) {
            $clean[$route] = true; // ใช้ key กันซ้ำ
        }
    }
    return array_keys($clean);
}

function savePermissions(PDO $pdo, int $accountId, array $routeKeys): void
{
    $pdo->prepare('DELETE FROM sp_api_permission WHERE account_id = :id')->execute(['id' => $accountId]);
    if (!$routeKeys) {
        return;
    }
    $stmt = $pdo->prepare('INSERT INTO sp_api_permission (account_id, route_key) VALUES (:id, :route)');
    foreach ($routeKeys as $route) {
        $stmt->execute(['id' => $accountId, 'route' => $route]);
    }
}
