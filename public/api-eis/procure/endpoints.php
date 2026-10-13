<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
require __DIR__ . '/classes/Database.php';
require __DIR__ . '/AuthMiddleware.php';
require __DIR__ . '/classes/EndpointSender.php';
function endpointReply($status, $body) {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}
try {
    $db = (new Database())->dbConnection();
    $auth = (new Auth($db, getallheaders()))->isValid();
    if ($auth['success'] !== 1) endpointReply(401, ['message' => 'กรุณาเข้าสู่ระบบใหม่']);
    if ($auth['user']['role'] !== 'superadmin') endpointReply(403, ['message' => 'เฉพาะ Superadmin เท่านั้น']);
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if (preg_match('~/endpoints/(databases|preview)/?$~D', $path, $extra)) {
        $expected = $extra[1] === 'databases' ? 'GET' : 'POST';
        if ($_SERVER['REQUEST_METHOD'] !== $expected) { header('Allow: ' . $expected); endpointReply(405, ['message' => 'Method not allowed']); }
        if ($extra[1] === 'databases') {
            $source = EndpointSource::connection();
            endpointReply(200, ['databases' => EndpointSource::databases($source), 'default' => $source->query('SELECT DB_NAME()')->fetchColumn()]);
        }
        $raw = file_get_contents('php://input', false, null, 0, 262145);
        if (strlen($raw) > 262144) endpointReply(413, ['message' => 'ข้อมูลใหญ่เกินกำหนด']);
        $input = json_decode($raw, true);
        if (!is_array($input) || !is_string($input['database'] ?? null) || $input['database'] === '') throw new InvalidArgumentException('กรุณาเลือกฐานข้อมูล MSSQL');
        EndpointSource::validateMapping($input['fields'] ?? []);
        endpointReply(200, EndpointSource::read($input, true));
    }
    if (!preg_match('~/endpoints(?:\.php)?(?:/([1-9][0-9]*)(/test)?)?/?$~D', $path, $match)) endpointReply(404, ['message' => 'ไม่พบเส้นทาง']);
    $id = isset($match[1]) ? (int)$match[1] : null;
    $test = !empty($match[2]);
    $method = $_SERVER['REQUEST_METHOD'];
    $allowed = $test ? ['POST'] : ($id ? ['PUT', 'DELETE'] : ['GET', 'POST']);
    if (!in_array($method, $allowed, true)) { header('Allow: ' . implode(', ', $allowed)); endpointReply(405, ['message' => 'Method not allowed']); }
    if ($method === 'GET') {
        $rows = $db->query('SELECT id,c_name AS name,c_uri AS uri,c_method AS method,c_query AS query,i_active AS active,d_last_sent AS last_sent_at,c_database AS database_name,c_field_map AS field_map FROM sp_api_endpoint ORDER BY id')->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as &$row) { $row['id'] = (int)$row['id']; $row['active'] = (bool)$row['active']; $row['database'] = $row['database_name'] ?? ''; $row['fields'] = json_decode($row['field_map'] ?? '[]', true) ?: []; unset($row['database_name'], $row['field_map']); }
        endpointReply(200, $rows);
    }
    if ($id) {
        $stmt = $db->prepare('SELECT id,c_name AS name,c_uri AS uri,c_method AS method,c_query AS query,i_active AS active,d_last_sent AS last_sent_at,c_database AS database_name,c_field_map AS field_map FROM sp_api_endpoint WHERE id=?'); $stmt->execute([$id]); $endpoint = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$endpoint) endpointReply(404, ['message' => 'ไม่พบ Endpoint']);
    }
    if ($test) {
        if (!$endpoint['active']) endpointReply(409, ['message' => 'Endpoint นี้ปิดใช้งานอยู่']);
        $endpoint['active'] = (bool)$endpoint['active'];
        $endpoint['database'] = $endpoint['database_name'] ?? '';
        $endpoint['fields'] = json_decode($endpoint['field_map'] ?? '[]', true) ?: [];
        $endpoint = EndpointSender::validate($endpoint);
        // Serialize test sends for this endpoint across requests.
        $lock = $db->prepare('SELECT GET_LOCK(?, 0)'); $lock->execute(['erpsend-test-' . $id]);
        if ((int)$lock->fetchColumn() !== 1) endpointReply(409, ['message' => 'Endpoint นี้กำลังทดสอบส่ง']);
        try {
            $result = EndpointSender::send($endpoint);
            if ($result['success']) { $stmt = $db->prepare('UPDATE sp_api_endpoint SET d_last_sent=UTC_TIMESTAMP() WHERE id=?'); $stmt->execute([$id]); }
        } finally { $lock = $db->prepare('SELECT RELEASE_LOCK(?)'); $lock->execute(['erpsend-test-' . $id]); }
        endpointReply($result['success'] ? 200 : 502, $result);
    }
    if ($method === 'DELETE') {
        $stmt = $db->prepare('DELETE FROM sp_api_endpoint WHERE id=?'); $stmt->execute([$id]);
        endpointReply(200, ['success' => 1]);
    }
    $raw = file_get_contents('php://input', false, null, 0, 262145);
    if (strlen($raw) > 262144) endpointReply(413, ['message' => 'ข้อมูลใหญ่เกินกำหนด']);
    $input = EndpointSender::validate(json_decode($raw, true));
    $values = [$input['name'], $input['uri'], $input['method'], $input['query'], (int)$input['active'], $input['database'], json_encode($input['fields'], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR)];
    if ($id) { $values[] = $id; $sql = 'UPDATE sp_api_endpoint SET c_name=?,c_uri=?,c_method=?,c_query=?,i_active=?,c_database=?,c_field_map=? WHERE id=?'; }
    else { $values[] = $auth['user']['name']; $sql = 'INSERT INTO sp_api_endpoint (c_name,c_uri,c_method,c_query,i_active,c_database,c_field_map,c_created_by) VALUES (?,?,?,?,?,?,?,?)'; }
    $db->prepare($sql)->execute($values);
    endpointReply($id ? 200 : 201, ['success' => 1, 'id' => $id ?: (int)$db->lastInsertId()]);
} catch (InvalidArgumentException $e) {
    endpointReply(422, ['message' => $e->getMessage()]);
} catch (PDOException $e) {
    $sourceRequest = isset($extra[1]) || !empty($test);
    endpointReply(500, ['message' => $sourceRequest
        ? 'อ่าน MSSQL ไม่สำเร็จ กรุณาตรวจการเชื่อมต่อ สิทธิ์ฐานข้อมูล และ SELECT (SQLSTATE ' . $e->getCode() . ')'
        : 'ฐานข้อมูล MySQL ไม่พร้อม กรุณาตรวจ migration และการเชื่อมต่อ']);
} catch (RuntimeException $e) {
    endpointReply(503, ['message' => $e->getMessage()]);
} catch (Throwable $e) {
    endpointReply(500, ['message' => 'ดำเนินการไม่สำเร็จ']);
}
