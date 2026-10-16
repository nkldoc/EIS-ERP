<?php
declare(strict_types=1);

final class ProcurePresence
{
    private static function config(): array
    {
        static $config = null;
        if ($config !== null) return $config;
        require_once dirname(__DIR__, 3) . '/supplies/conf/presence/PresenceEnvironment.php';
        return $config = PresenceEnvironment::config(__DIR__ . '/presence.config.php');
    }
    private static function host(): string
    {
        return strtolower((string)(parse_url('http://' . ($_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? ''), PHP_URL_HOST) ?: ''));
    }
    public static function directory(): string
    {
        $configured = getenv('EIS_DOCS_PRESENCE_DIR') ?: (self::config()['directory'] ?? '');
        if ($configured !== '') return $configured;
        if (in_array(self::host(), ['eis.nmu.ac.th', 'doc-eis.nmu.ac.th'], true)) throw new RuntimeException('Configure the shared private presence directory before enabling production');
        return 'D:/EIS-DOCS/storage/presence';
    }
    public static function enabled(): bool
    {
        $config = self::config();
        if (($config['enabled'] ?? true) === false) return false;
        $host = self::host();
        if (in_array($host, ['dev-eis.nmu.ac.th', 'localhost', '127.0.0.1'], true)) return true;
        return PresenceEnvironment::isProduction()
            && (bool)(getenv('EIS_DOCS_PRESENCE_DIR') ?: ($config['directory'] ?? ''));
    }
    public static function sessionKey(string $system, string $uid, string $login): string
    {
        return hash('sha256', $system . '|' . session_id() . '|' . $uid . '|' . $login . '|' . (string)($_SESSION['admin_operator'] ?? ''));
    }
    public static function revoke(string $system, string $uid, string $login): void
    {
        if (!self::enabled() || $uid === '' || session_id() === '') return;
        $dir = self::directory() . '/revoked';
        if (is_dir($dir)) file_put_contents($dir . '/' . self::sessionKey($system, $uid, $login), (string)time(), LOCK_EX);
    }
    public static function token(string $system, string $uid, string $name, string $department, string $login, bool $admin = false): array
    {
        if (!self::enabled() || !in_array($system, ['PROCURE'], true)) throw new RuntimeException('PRESENCE_CONFIG_REQUIRED');
        require_once __DIR__ . '/AdminIdentity.php';
        if (ProcureAdminIdentity::needsName()) throw new UnexpectedValueException('Admin operator required');
        $key = self::sessionKey($system, $uid, $login);
        $operator = ProcureAdminIdentity::operator();
        if ($operator !== '' && (string)$_SESSION['user_id'] === $uid) { $uid .= '@' . $operator; $name = $operator . '-procure'; }
        if (is_file(self::directory() . '/revoked/' . $key)) throw new UnexpectedValueException('Session revoked');
        $directory = self::directory();
        if (!is_dir($directory) || !is_readable($directory)) throw new RuntimeException('PRESENCE_STORAGE_UNAVAILABLE');
        $file = $directory . '/' . strtolower($system) . '.secret';
        if (!is_readable($file)) throw new RuntimeException('PRESENCE_KEY_UNREADABLE');
        $secret = @file_get_contents($file);
        if ($secret === false) throw new RuntimeException('PRESENCE_KEY_UNREADABLE');
        $secret = trim($secret);
        if ($secret === '') throw new RuntimeException('PRESENCE_KEY_EMPTY');
        $encoded = rtrim(strtr(base64_encode(json_encode(['system'=>$system, 'uid'=>$uid, 'name'=>$name, 'department'=>$department, 'admin'=>false, 'session'=>$key, 'exp'=>time()+60], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR)), '+/', '-_'), '=');
        return ['token'=>$encoded . '.' . hash_hmac('sha256', $encoded, $secret), 'url'=>self::websocketUrl()];
    }
    private static function websocketUrl(): string
    {
        $url = getenv('EIS_PRESENCE_WS_URL') ?: (self::config()['websocket_url'] ?? '');
        return $url !== '' ? $url : (in_array(self::host(), ['eis.nmu.ac.th', 'doc-eis.nmu.ac.th'], true)
            ? 'wss://doc-eis.nmu.ac.th/eis-docs/presence' : 'wss://dev-eis.nmu.ac.th:4003/presence');
    }
    public static function script(): string
    {
        if (!self::enabled() || empty($_SESSION['user_id'])) return '';
        return '<link rel="stylesheet" href="/procure/assets/css/presence-chat.css?v=20261013-ws-safe"><script>window.EISPresenceConfig={tokenUrl:"/procure/access/presence-token.php",loginUrl:"/NMU_permission/"};</script><script src="/procure/assets/js/presence-client.js?v=20261013-ws-safe"></script><script src="/procure/assets/js/presence-image-viewer.js?v=20261013-ws-safe"></script><script src="/procure/assets/js/presence-chat.js?v=20261013-ws-safe"></script>';
    }
}
