<?php
/** MySQL settings shared by Supplies; never select credentials from HTTP_HOST. */
declare(strict_types=1);

function spMysqlSettings(): array
{
    $env = static function (string $name) {
        $value = getenv($name);
        return $value === false ? null : $value;
    };
    $environment = strtolower(trim((string)($env('SP_MYSQL_ENV') ?? $env('APP_ENV') ?? '')));
    if ($environment === '') {
        // IIS/FastCGI can expose LOCAL_ADDR instead of SERVER_ADDR.
        // Production IIS also reports its internal address 10.1.2.2.
        // .24 hosts MySQL. Do not use client headers.
        $serverAddresses = [$_SERVER['SERVER_ADDR'] ?? '', $_SERVER['LOCAL_ADDR'] ?? ''];
        $environment = array_intersect($serverAddresses, ['192.168.201.2', '10.1.2.2', '192.168.201.24']) ? 'production' : 'development';
    }
    $aliases = ['prod'=>'production', 'production'=>'production', 'dev'=>'development', 'development'=>'development', 'local'=>'development', 'localhost'=>'development'];
    if (!isset($aliases[$environment])) {
        throw new RuntimeException('Set SP_MYSQL_ENV or APP_ENV to production or development');
    }
    $environment = $aliases[$environment];
    $profiles = [];
    $localFile = __DIR__ . '/mysql_credentials.local.php';
    if (is_file($localFile)) {
        $profiles = require $localFile;
        if (!is_array($profiles)) throw new RuntimeException('Invalid local MySQL configuration');
    }
    $local = $profiles[$environment] ?? [];
    if (!is_array($local)) throw new RuntimeException('Invalid MySQL environment profile');
    $settings = [
        'environment' => $environment,
        'host' => $env('MYSQL_DB_HOST') ?? $local['host'] ?? ($environment === 'production' ? '192.168.201.24' : 'localhost'),
        'port' => $env('MYSQL_DB_PORT') ?? $local['port'] ?? 3306,
        'name' => $env('MYSQL_DB_NAME') ?? $local['name'] ?? 'php_auth_api',
        'user' => $env('MYSQL_DB_USER') ?? $local['user'] ?? '',
        'pass' => $env('MYSQL_DB_PASS') ?? $local['pass'] ?? '',
        'charset' => 'utf8mb4',
        'timeout' => 5,
    ];
    foreach (['host', 'name', 'user', 'pass'] as $key) {
        if (!is_string($settings[$key])) throw new RuntimeException('Invalid MySQL setting: ' . $key);
    }
    foreach (['host', 'name', 'user'] as $key) {
        if (trim($settings[$key]) === '') throw new RuntimeException('Missing MySQL setting: ' . $key);
    }
    if (preg_match('/[;\r\n\x00]/', $settings['host'] . $settings['name'])) {
        throw new RuntimeException('Invalid MySQL host or database name');
    }
    $port = filter_var($settings['port'], FILTER_VALIDATE_INT, ['options'=>['min_range'=>1,'max_range'=>65535]]);
    if ($port === false) throw new RuntimeException('Invalid MySQL port');
    $settings['port'] = $port;
    return $settings;
}

function spMysqlConnect(): PDO
{
    if (!extension_loaded('pdo_mysql')) throw new RuntimeException('pdo_mysql extension is not enabled in PHP');
    $settings = spMysqlSettings();
    $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=%s', $settings['host'], $settings['port'], $settings['name'], $settings['charset']);
    return new PDO($dsn, $settings['user'], $settings['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT => $settings['timeout'],
    ]);
}
