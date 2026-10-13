<?php
declare(strict_types=1);
require_once __DIR__ . '/ErpConfirmation.php';

final class IncomingEndpoint
{
    const PREFIX = APP_RUNTIME_ENV === 'production' ? '/procure/incoming/' : '/api-eis/procure/incoming/';
    const METHODS = ['POST', 'PUT', 'PATCH'];
    const MAX_BODY = 2097152;

    public static function validate(array $body, PDO $db): array
    {
        foreach (['name', 'uri', 'method'] as $key) {
            if (!isset($body[$key]) || !is_string($body[$key])) throw new InvalidArgumentException('กรุณากรอกชื่อ URL และ Method');
        }
        $name = trim($body['name']);
        $uri = rtrim(trim($body['uri']), '/');
        if ($name === '' || mb_strlen($name) > 200) throw new InvalidArgumentException('ชื่อ Endpoint ต้องมี 1–200 ตัวอักษร');
        if (strlen($uri) > 240 || !preg_match('~^' . preg_quote(self::PREFIX, '~') . '[a-zA-Z0-9_-]+(?:/[a-zA-Z0-9_-]+)*$~D', $uri)) {
            throw new InvalidArgumentException('URL ต้องเป็น ' . self::PREFIX . 'ชื่อขารับ ใช้ตัวอักษร ตัวเลข - _ และ /');
        }
        if (!in_array($body['method'], self::METHODS, true)) throw new InvalidArgumentException('Method ต้องเป็น POST, PUT หรือ PATCH');
        if (!isset($body['active']) || !is_bool($body['active'])) throw new InvalidArgumentException('สถานะไม่ถูกต้อง');
        if (!isset($body['user_id']) || !is_int($body['user_id']) || $body['user_id'] < 1) throw new InvalidArgumentException('กรุณาเลือกผู้ใช้');
        $stmt = $db->prepare('SELECT id,is_active FROM users WHERE id=?');
        $stmt->execute([$body['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$user) throw new InvalidArgumentException('ไม่พบผู้ใช้ที่เลือก');
        if ($body['active'] && !(int)$user['is_active']) throw new InvalidArgumentException('ผู้ใช้ที่เลือกถูกปิดใช้งาน กรุณาเลือกผู้ใช้ที่เปิดใช้งาน');
        return [$name, $uri, $body['method'], $body['user_id'], (int)$body['active']];
    }

    public static function redact($value)
    {
        if (!is_array($value) && !is_object($value)) return $value;
        $result = is_object($value) ? new stdClass() : [];
        foreach ($value as $key => $item) {
            $normalized = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', (string)$key));
            $secret = preg_match('/password|passwd|authorization|cookie|token|apikey|secret/', $normalized);
            // URL headers may contain credentials in the query string.
            $urlHeader = in_array($normalized, ['xoriginalurl', 'xrewriteurl', 'referer'], true);
            $clean = $secret ? '***HIDDEN***' : (($urlHeader && is_string($item)) ? explode('?', $item, 2)[0] : self::redact($item));
            if (is_object($result)) $result->{$key} = $clean;
            else $result[$key] = $clean;
        }
        return $result;
    }

    public static function record(PDO $db, ?int $endpointId, string $uri, string $method, ?string $username, int $status, string $message, array $headers, $body): string
    {
        $requestId = bin2hex(random_bytes(16));
        $payload = json_encode(['headers' => self::redact((object)$headers), 'body' => self::redact($body)], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE | JSON_PRESERVE_ZERO_FRACTION | JSON_THROW_ON_ERROR);
        $stmt = $db->prepare('INSERT INTO sp_api_incoming_log (request_id,endpoint_id,uri,method,username,status_code,message,payload,received_at) VALUES (?,?,?,?,?,?,?,?,UTC_TIMESTAMP())');
        $db->beginTransaction();
        try {
            $stmt->execute([$requestId, $endpointId, substr($uri, 0, 240), substr($method, 0, 16), $username === null ? null : mb_substr($username, 0, 100), $status, $message, $payload]);
            if ($uri === ErpConfirmation::URI && $status === 200) {
                ErpConfirmation::enqueue($db, $requestId, self::redact($body));
            }
            $db->commit();
        } catch (Throwable $e) {
            if ($db->inTransaction()) $db->rollBack();
            throw $e;
        }
        return $requestId;
    }
}
