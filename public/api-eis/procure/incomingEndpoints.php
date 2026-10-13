<?php
declare(strict_types=1);
require_once __DIR__ . '/account/api_auth.php';
require_once __DIR__ . '/AuthMiddleware.php';
require_once __DIR__ . '/classes/IncomingEndpoint.php';
header('Cache-Control: no-store');

try {
    $db = apiDb();
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) $headers['Authorization'] = $_SERVER['HTTP_AUTHORIZATION'];
    $auth = (new Auth($db, $headers))->isValid();
    if ($auth['success'] !== 1) apiRespond(401, ['message' => 'กรุณาเข้าสู่ระบบใหม่']);
    if ($auth['user']['role'] !== 'superadmin') apiRespond(403, ['message' => 'เฉพาะ Superadmin เท่านั้น']);
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if (!preg_match('~/incomingEndpoints(?:\.php)?(?:/(users|logs|[1-9][0-9]*)(?:/([1-9][0-9]*))?)?/?$~D', $path, $match)) apiRespond(404, ['message' => 'ไม่พบเส้นทาง']);
    $action = $match[1] ?? '';
    $detail = $match[2] ?? null;
    $method = $_SERVER['REQUEST_METHOD'];
    if ($detail !== null && $action !== 'logs') apiRespond(404, ['message' => 'ไม่พบเส้นทาง']);
    $id = ctype_digit($action) ? (int)$action : null;
    $allowed = $id ? ['PUT', 'DELETE'] : ($action === '' ? ['GET', 'POST'] : ['GET']);
    if (!in_array($method, $allowed, true)) { header('Allow: ' . implode(', ', $allowed)); apiRespond(405, ['message' => 'Method not allowed']); }
    if ($action === 'users') {
        apiRespond(200, $db->query('SELECT id,name,email,is_active FROM users ORDER BY name,id')->fetchAll(PDO::FETCH_ASSOC));
    }
    if ($action === 'logs') {
        if ($detail !== null) {
            $stmt = $db->prepare('SELECT id,request_id,uri,method,username,status_code,message,received_at,payload FROM sp_api_incoming_log WHERE id=?');
            $stmt->execute([$detail]); $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$row) apiRespond(404, ['message' => 'ไม่พบ Log']);
            $row['payload'] = json_decode($row['payload']);
            apiRespond(200, $row);
        }
        $where = []; $params = [];
        foreach (['endpoint_id', 'before'] as $filter) {
            if (!isset($_GET[$filter]) || $_GET[$filter] === '') continue;
            if (!is_string($_GET[$filter]) || !ctype_digit($_GET[$filter]) || (int)$_GET[$filter] < 1) throw new InvalidArgumentException('ตัวกรองไม่ถูกต้อง');
            $where[] = $filter === 'before' ? 'id < ?' : 'endpoint_id = ?'; $params[] = $_GET[$filter];
        }
        $sql = 'SELECT id,request_id,endpoint_id,uri,method,username,status_code,message,received_at FROM sp_api_incoming_log';
        if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
        $stmt = $db->prepare($sql . ' ORDER BY id DESC LIMIT 51'); $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC); $more = count($rows) > 50;
        if ($more) array_pop($rows);
        apiRespond(200, ['rows' => $rows, 'next' => $more ? (string)end($rows)['id'] : null]);
    }
    if ($method === 'GET') {
        apiRespond(200, $db->query('SELECT e.id,e.name,e.uri,e.method,e.user_id,e.is_active AS active,u.name AS username,u.is_active AS user_active,(SELECT MAX(l.received_at) FROM sp_api_incoming_log l WHERE l.endpoint_id=e.id) AS last_received_at FROM sp_api_incoming_endpoint e LEFT JOIN users u ON u.id=e.user_id ORDER BY e.id DESC')->fetchAll(PDO::FETCH_ASSOC));
    }
    if ($id) {
        $stmt = $db->prepare('SELECT id FROM sp_api_incoming_endpoint WHERE id=?'); $stmt->execute([$id]);
        if (!$stmt->fetchColumn()) apiRespond(404, ['message' => 'ไม่พบ Endpoint']);
    }
    if ($method === 'DELETE') {
        $db->prepare('DELETE FROM sp_api_incoming_endpoint WHERE id=?')->execute([$id]);
        apiRespond(200, ['success' => 1]);
    }
    $raw = file_get_contents('php://input', false, null, 0, 16385);
    if (strlen($raw) > 16384) apiRespond(413, ['message' => 'ข้อมูลใหญ่เกินกำหนด']);
    $body = json_decode($raw, true);
    if (!is_array($body) || substr(ltrim($raw), 0, 1) !== '{') throw new InvalidArgumentException('ต้องส่ง JSON object');
    $values = IncomingEndpoint::validate($body, $db);
    if ($id) {
        $values[] = $id;
        $db->prepare('UPDATE sp_api_incoming_endpoint SET name=?,uri=?,method=?,user_id=?,is_active=? WHERE id=?')->execute($values);
    } else {
        $db->prepare('INSERT INTO sp_api_incoming_endpoint (name,uri,method,user_id,is_active) VALUES (?,?,?,?,?)')->execute($values);
        $id = (int)$db->lastInsertId();
    }
    apiRespond($method === 'POST' ? 201 : 200, ['success' => 1, 'id' => $id]);
} catch (InvalidArgumentException $e) {
    apiRespond(422, ['message' => $e->getMessage()]);
} catch (PDOException $e) {
    if ((int)($e->errorInfo[1] ?? 0) === 1062) apiRespond(409, ['message' => 'URL และ Method นี้มีอยู่แล้ว']);
    apiRespond(500, ['message' => 'ฐานข้อมูลขารับไม่พร้อม กรุณาตรวจการเชื่อมต่อและ migration']);
} catch (Throwable $e) {
    apiRespond(500, ['message' => 'ดำเนินการไม่สำเร็จ กรุณาลองใหม่']);
}
