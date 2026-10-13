<?php
declare(strict_types=1);

/**
 * Helper กลางสำหรับ API "ขารับ" ที่ยืนยันตัวตนด้วย username/password ใน body
 * (ต่างจากผู้ใช้ปกติที่ใช้ Bearer token) แล้วตรวจสิทธิ์ต่อ route_key ว่า
 * บัญชีนั้นถูกเปิดสิทธิ์ให้เรียก endpoint นี้หรือไม่
 * ฐานข้อมูล: MySQL php_auth_api (ตาราง sp_api_account / sp_api_permission)
 *
 * วิธีใช้ในแต่ละ endpoint ขารับ:
 *   require __DIR__ . '/api_auth.php';
 *   $body = requireApiAccess('procure.ir');   // route_key ของ endpoint นี้เอง
 *   // ผ่านมาถึงตรงนี้แปลว่า auth + สิทธิ์ผ่านแล้ว ใช้ $body['data'] ต่อได้เลย
 */

function apiRespond(int $httpStatus, array $payload): void
{
    http_response_code($httpStatus);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function apiDb(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        require_once __DIR__ . '/../classes/Database.php';
        $pdo = (new Database())->dbConnection();
        $pdo->exec('SET NAMES utf8mb4');
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    }
    return $pdo;
}

/**
 * อ่าน JSON body, ตรวจ username/password, ตรวจสิทธิ์ route_key
 * ถ้าไม่ผ่านจะเรียก apiRespond() (401/403) แล้ว exit ทันที — โค้ดหลัง call นี้จึงถือว่าผ่านแล้วเสมอ
 *
 * @return array<string,mixed> body ทั้งหมดที่ส่งมา บวก key 'account_id' ของบัญชีที่ยืนยันแล้ว
 */
function requireApiAccess(string $routeKey): array
{
    $raw = file_get_contents('php://input');
    $body = json_decode((string)$raw, true);
    if (!is_array($body)) {
        apiRespond(400, ['success' => 0, 'message' => 'รูปแบบข้อมูลไม่ถูกต้อง (ต้องเป็น JSON)']);
    }

    $username = trim((string)($body['username'] ?? ''));
    $password = (string)($body['password'] ?? '');
    if ($username === '' || $password === '') {
        apiRespond(401, ['success' => 0, 'message' => 'กรุณาระบุ username และ password']);
    }

    $stmt = apiDb()->prepare(
        'SELECT account_id, password_hash, is_active FROM sp_api_account WHERE username = :username'
    );
    $stmt->execute(['username' => $username]);
    $account = $stmt->fetch();

    if (!$account || !password_verify($password, $account['password_hash'])) {
        apiRespond(401, ['success' => 0, 'message' => 'บัญชีหรือรหัสผ่านไม่ถูกต้อง']);
    }
    if (!(int)$account['is_active']) {
        apiRespond(403, ['success' => 0, 'message' => 'บัญชีนี้ถูกปิดใช้งาน']);
    }

    $permStmt = apiDb()->prepare(
        'SELECT 1 FROM sp_api_permission WHERE account_id = :account_id AND route_key = :route_key'
    );
    $permStmt->execute(['account_id' => $account['account_id'], 'route_key' => $routeKey]);
    if (!$permStmt->fetch()) {
        apiRespond(403, [
            'success' => 0,
            'message' => 'บัญชีนี้ไม่มีสิทธิ์เรียกใช้ endpoint นี้ (' . $routeKey . ')',
        ]);
    }

    $body['account_id'] = (int)$account['account_id'];
    return $body;
}
