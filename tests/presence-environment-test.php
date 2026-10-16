<?php
require_once __DIR__ . '/../public/supplies/conf/presence/PresenceEnvironment.php';
require_once __DIR__ . '/../public/supplies/conf/presence/Presence.php';
require_once __DIR__ . '/../public/procure/conf/presence/Presence.php';
$legacy = tempnam(sys_get_temp_dir(), 'eis-env-');
file_put_contents($legacy, '<?php return ["directory"=>"//production/private", "websocket_url"=>"wss://production/presence"];');
$saved = [];
foreach (['EIS_APP_ENV', 'EIS_PRESENCE_CONFIG', 'EIS_DOCS_PRESENCE_DIR'] as $key) {
    $saved[$key] = getenv($key);
    putenv($key);
}
$checks = 0;
function environmentCheck(bool $ok): void {
    global $checks;
    if (!$ok) throw new RuntimeException('Environment check failed: ' . ($checks + 1));
    $checks++;
}
try {
    foreach (['dev-eis.nmu.ac.th', 'localhost:8080', '127.0.0.1'] as $host) {
        $_SERVER['HTTP_HOST'] = $host;
        $config = PresenceEnvironment::config($legacy);
        environmentCheck(!PresenceEnvironment::isProduction());
        environmentCheck(strpos($config['directory'], '//production') === false);
        environmentCheck($config['websocket_url'] === 'wss://dev-eis.nmu.ac.th:4003/presence');
    }
    $_SERVER['HTTP_HOST'] = 'dev-eis.nmu.ac.th';
    environmentCheck(Presence::directory() === ProcurePresence::directory());
    environmentCheck(Presence::enabled() && ProcurePresence::enabled());
    foreach (['eis.nmu.ac.th', '10.10.10.2', '192.168.168.3'] as $host) {
        $_SERVER['HTTP_HOST'] = $host;
        environmentCheck(PresenceEnvironment::isProduction());
        environmentCheck(PresenceEnvironment::config($legacy)['directory'] === '//production/private');
    }
    putenv('EIS_APP_ENV=local');
    environmentCheck(!PresenceEnvironment::isProduction());
    putenv('EIS_APP_ENV=production');
    $_SERVER['HTTP_HOST'] = 'localhost';
    environmentCheck(PresenceEnvironment::isProduction());
    putenv('EIS_PRESENCE_CONFIG=' . $legacy);
    putenv('EIS_APP_ENV=dev');
    environmentCheck(PresenceEnvironment::config('missing')['directory'] === '//production/private');
    echo "PASS: $checks environment checks\n";
} finally {
    unlink($legacy);
    foreach ($saved as $key => $value) putenv($value === false ? $key : "$key=$value");
}
