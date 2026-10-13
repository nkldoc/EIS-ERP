<?php
// CLI: php test_connect.php [development|production]. Web: authenticated reviewers only.
$isCli = PHP_SAPI === 'cli';
if (!$isCli) {
    require __DIR__ . '/../api/erpConfirmationBootstrap.php';
    header('Content-Type: text/plain; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
}
require __DIR__ . '/mysql_connect.php';
if ($isCli && isset($argv[1])) putenv('SP_MYSQL_ENV=' . $argv[1]);
try {
    $settings = spMysqlSettings();
    echo "MySQL diagnostic v2\n";
    echo 'Profile: ' . $settings['environment'] . PHP_EOL;
    echo 'Target: ' . $settings['host'] . ':' . $settings['port'] . PHP_EOL;
    foreach (['SERVER_ADDR', 'LOCAL_ADDR'] as $key) {
        $address = $_SERVER[$key] ?? '';
        echo $key . ': ' . (filter_var($address, FILTER_VALIDATE_IP) ? $address : '(not available)') . PHP_EOL;
    }
    $overrides = [];
    foreach (['SP_MYSQL_ENV', 'APP_ENV', 'MYSQL_DB_HOST', 'MYSQL_DB_PORT'] as $key) {
        if (getenv($key) !== false) $overrides[] = $key;
    }
    echo 'Environment overrides present: ' . ($overrides ? implode(', ', $overrides) : 'none') . PHP_EOL;
    $host = strpos($settings['host'], ':') !== false ? '[' . $settings['host'] . ']' : $settings['host'];
    $started = microtime(true);
    $socket = @stream_socket_client('tcp://' . $host . ':' . $settings['port'], $tcpCode, $tcpMessage, 5);
    echo 'TCP: ' . ($socket ? 'OK' : 'FAILED (code ' . (int)$tcpCode . ')') . ' after ' . round(microtime(true) - $started, 2) . "s\n";
    if ($socket) fclose($socket);
    $pdo = spMysqlConnect();
    $pdo->query('SELECT 1')->fetchColumn();
    echo 'OK: ' . $settings['environment'] . ' MySQL connection and SELECT 1 succeeded.' . PHP_EOL;
} catch (Throwable $e) {
    // Do not expose credentials, DSN or driver error text.
    $message = 'FAILED: MySQL connection/configuration check (' . $e->getCode() . ').' . PHP_EOL;
    if ($isCli) fwrite(STDERR, $message);
    // This is a diagnostic report: preserve its body instead of an IIS error page.
    else { http_response_code(200); echo $message; }
    exit(1);
}
