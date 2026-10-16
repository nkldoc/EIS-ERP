<?php
declare(strict_types=1);
define('DB_CENTER', 'test_center.dbo.');
final class DatabaseServer {
    public function QueryParam(string $sql, array $params): array {
        return $params[0] === 42 && $params[1] === 'duplicate@example.test' ? ['dc_user_id'=>42] : [];
    }
    public function Fetch(array $stmt): ?array { return $stmt ?: null; }
}
require_once __DIR__ . '/../public/supplies/conf/presence/SuppliesLogin.php';

$directory = sys_get_temp_dir() . '/supplies-sso-test-' . bin2hex(random_bytes(8));
mkdir($directory);
putenv('EIS_PERMISSION_SESSION_DIR=' . $directory);
ini_set('session.use_cookies', '0');
ini_set('session.cache_limiter', '');
session_save_path($directory);
$checks = 0;
function checkSso(bool $condition, string $message): void {
    global $checks;
    if (!$condition) throw new RuntimeException($message);
    $checks++;
}
try {
    foreach ([1, 2, 3, 0, -1, null] as $permission) {
        $portalId = bin2hex(random_bytes(16));
        session_name('PHPSESSID'); session_id($portalId); session_start();
        $_SESSION = ['dc_user_id'=>42, 'i_permit_supplies'=>$permission];
        session_write_close();
        $suppliesId = bin2hex(random_bytes(16));
        session_name('SUPPLIES_TEST'); session_id($suppliesId); session_start();
        $_SESSION = ['user_id'=>61079, 'sentinel'=>'unchanged'];
        $_COOKIE['PHPSESSID'] = $portalId;
        checkSso(SuppliesLogin::ssoAllowed(['dc_center_user'=>42]) === ((int)$permission > 0), 'Permission level mismatch');
        checkSso($_SESSION === ['user_id'=>61079, 'sentinel'=>'unchanged'] && session_id() === $suppliesId && session_name() === 'SUPPLIES_TEST', 'Supplies session was changed');
        checkSso(!SuppliesLogin::ssoAllowed(['dc_center_user'=>43]), 'Different portal identity allowed');
        checkSso(!SuppliesLogin::ssoAllowed(['dc_center_user'=>0]), 'Missing identity allowed');
        checkSso(SuppliesLogin::ssoUserId(['dc_center_user'=>99, 'c_user_name'=>'duplicate@example.test']) === ((int)$permission > 0 ? 42 : 0), 'Duplicate username must resolve to authenticated portal ID');
        checkSso(!SuppliesLogin::ssoAllowed(['dc_center_user'=>42, 'c_user_name'=>'someone-else@example.test']), 'Different username allowed');
        unset($_COOKIE['PHPSESSID']);
        checkSso(!SuppliesLogin::ssoAllowed(['dc_center_user'=>42]), 'Missing portal session allowed');
        $_COOKIE['PHPSESSID'] = bin2hex(random_bytes(16));
        checkSso(!SuppliesLogin::ssoAllowed(['dc_center_user'=>42]), 'Unknown portal session allowed');
        session_write_close();
    }
    echo "PASS: {$checks} SSO checks\n";
} finally {
    if (session_status() === PHP_SESSION_ACTIVE) session_write_close();
    foreach (glob($directory . '/sess_*') as $file) unlink($file);
    rmdir($directory);
    putenv('EIS_PERMISSION_SESSION_DIR');
}
