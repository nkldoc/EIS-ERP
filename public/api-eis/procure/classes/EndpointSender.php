<?php
require_once __DIR__ . "/EndpointSource.php";
class EndpointSender
{
    public static function validate($input)
    {
        if (!is_array($input)) throw new InvalidArgumentException('ข้อมูลต้องเป็น JSON object');
        foreach (['name' => 200, 'uri' => 500, 'query' => 60000] as $key => $limit) {
            if (!isset($input[$key]) || !is_string($input[$key]) || trim($input[$key]) === '' || mb_strlen($input[$key]) > $limit) {
                throw new InvalidArgumentException('ชื่อ, URI หรือ Query ไม่ถูกต้อง');
            }
            $input[$key] = trim($input[$key]);
        }
        // A relative path only: the trusted origin is configured on the server.
        if (!preg_match('~^/(?:[A-Za-z0-9_-]+/)*[A-Za-z0-9_-]+$~D', $input['uri'])) {
            throw new InvalidArgumentException('URI ต้องเป็น path เช่น /procure/ir');
        }
        if (!in_array($input['method'] ?? null, ['GET', 'POST', 'PUT'], true) || !is_bool($input['active'] ?? null)) {
            throw new InvalidArgumentException('Method หรือสถานะไม่ถูกต้อง');
        }
        EndpointSource::validateQuery($input['query']);
        $input['database'] = $input['database'] ?? '';
        if (!is_string($input['database']) || mb_strlen($input['database']) > 128) throw new InvalidArgumentException('ฐานข้อมูลไม่ถูกต้อง');
        $input['fields'] = EndpointSource::validateMapping($input['fields'] ?? []);
        return array_intersect_key($input, array_flip(['name', 'uri', 'method', 'query', 'active', 'database', 'fields']));
    }

    public static function send(array $endpoint)
    {
        $base = rtrim(getenv('ERPSEND_BASE_URL') ?: '', '/');
        $password = getenv('ERPSEND_PASSWORD');
        $parts = parse_url($base);
        if (!$parts || ($parts['scheme'] ?? '') !== 'https' || empty($parts['host']) || isset($parts['user']) || isset($parts['pass']) || isset($parts['query']) || isset($parts['fragment']) || !$password) {
            throw new RuntimeException('กรุณาตั้งค่า ERPSEND_BASE_URL, ERPSEND_PASSWORD และฐานข้อมูลต้นทางแบบอ่านอย่างเดียว');
        }
        $rows = EndpointSource::read($endpoint)['data'];
        $payload = ['username' => 'erpsendapi', 'password' => $password, 'data' => $rows];
        $curl = curl_init($base . $endpoint['uri']);
        $response = '';
        curl_setopt_array($curl, [
            CURLOPT_CUSTOMREQUEST => $endpoint['method'], CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
            CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'X-Original-Url: ' . $endpoint['uri']],
            CURLOPT_USERAGENT => 'NMU-erpsendapi/1.0', CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_CONNECTTIMEOUT => 10, CURLOPT_TIMEOUT => 45,
            CURLOPT_SSL_VERIFYPEER => true, CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_WRITEFUNCTION => function ($handle, $chunk) use (&$response) {
                if (strlen($response) + strlen($chunk) > 1024 * 1024) return 0;
                $response .= $chunk; return strlen($chunk);
            }
        ]);
        $ok = curl_exec($curl);
        $status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        if ($ok === false) throw new RuntimeException('ส่งไม่สำเร็จหรือการตอบกลับไม่ครบถ้วน โปรดตรวจปลายทางก่อนส่งซ้ำ');
        // Do not return arbitrary upstream bodies: they can echo credentials or tokens.
        return ['success' => $status >= 200 && $status < 300 ? 1 : 0,
            'request' => ['uri' => $endpoint['uri'], 'method' => $endpoint['method'], 'username' => 'erpsendapi', 'password' => '***HIDDEN***', 'row_count' => count($rows)],
            'response' => ['http_status' => $status, 'bytes' => strlen($response)]];
    }
}
