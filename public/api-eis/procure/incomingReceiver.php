<?php
declare(strict_types=1);
require_once __DIR__ . '/account/api_auth.php';
require_once __DIR__ . '/AuthMiddleware.php';
require_once __DIR__ . '/classes/IncomingEndpoint.php';
header('Cache-Control: no-store');

try {
    $db = apiDb();
    $uri = rtrim((string)parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
    $method = $_SERVER['REQUEST_METHOD'];
    if (strpos($uri, IncomingEndpoint::PREFIX) !== 0 || strlen($uri) > 240) apiRespond(404, ['success' => 0, 'message' => 'ไม่พบ URL ขารับ']);
    $stmt = $db->prepare('SELECT e.*,u.name AS username,u.is_active AS user_active FROM sp_api_incoming_endpoint e LEFT JOIN users u ON u.id=e.user_id WHERE e.uri=?');
    $stmt->execute([$uri]); $routes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if (!$routes) apiRespond(404, ['success' => 0, 'message' => 'ไม่พบ URL ขารับ']);
    $endpoint = null;
    foreach ($routes as $route) if ($route['method'] === $method) { $endpoint = $route; break; }
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) $headers['Authorization'] = $_SERVER['HTTP_AUTHORIZATION'];
    $auth = (new Auth($db, $headers))->isValid();
    $authenticatedUser = $auth['success'] === 1 ? $auth['user'] : null;
    // Decode as objects to retain empty objects, arrays, booleans and nested structures.
    $raw = file_get_contents('php://input', false, null, 0, IncomingEndpoint::MAX_BODY + 1);
    $oversized = strlen($raw) > IncomingEndpoint::MAX_BODY;
    $body = $oversized ? null : json_decode($raw);
    $validJson = !$oversized && json_last_error() === JSON_ERROR_NONE && is_object($body);
    $username = $authenticatedUser['name'] ?? null;
    $status = 200; $message = 'รับข้อมูลและบันทึก JSON แล้ว';
    if (!$endpoint) {
        $status = 405; $message = 'Method ไม่ตรงกับที่กำหนด';
        header('Allow: ' . implode(', ', array_unique(array_column($routes, 'method'))));
    } elseif (!(int)$endpoint['is_active']) { $status = 403; $message = 'Endpoint นี้ถูกปิดใช้งาน'; }
    elseif ($oversized) { $status = 413; $message = 'JSON ต้องมีขนาดไม่เกิน 2 MB'; }
    elseif (strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0])) !== 'application/json') { $status = 415; $message = 'Content-Type ต้องเป็น application/json'; }
    elseif (!$validJson) { $status = 400; $message = 'รูปแบบ JSON object ไม่ถูกต้อง'; }
    elseif (!$authenticatedUser) { $status = 401; $message = 'Bearer token ไม่ถูกต้องหรือหมดอายุ'; }
    elseif ((int)$authenticatedUser['id'] !== (int)$endpoint['user_id']) { $status = 403; $message = 'ผู้ใช้ของ Bearer token ไม่มีสิทธิ์ใช้ URL นี้'; }
    elseif (!(int)$endpoint['user_active']) { $status = 403; $message = 'บัญชีผู้ใช้ถูกปิดใช้งาน'; }
    elseif (!isset($body->data) || !is_array($body->data)) { $status = 422; $message = 'กรุณาส่ง data เป็น array'; }
    // Never retain unparseable raw text: it could contain a secret that cannot be redacted reliably.
    $loggedBody = $validJson ? $body : (object)['error' => $oversized ? 'Payload exceeds 2 MB; body omitted' : 'Invalid JSON; body omitted'];
    $requestId = IncomingEndpoint::record($db, $endpoint ? (int)$endpoint['id'] : (int)$routes[0]['id'], $uri, $method, $username, $status, $message, $headers, $loggedBody);
    $response = ['success' => $status === 200 ? 1 : 0, 'message' => $message, 'request_id' => $requestId];
    if ($status === 200) $response['received'] = count($body->data);
    apiRespond($status, $response);
} catch (Throwable $e) {
    // A successful response guarantees the log was persisted.
    apiRespond(503, ['success' => 0, 'message' => 'ยังบันทึก JSON ไม่สำเร็จ กรุณาลองใหม่']);
}
