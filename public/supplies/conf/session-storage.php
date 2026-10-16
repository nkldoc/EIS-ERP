<?php

// Keep this preflight separate from the server-specific, untracked config.php.
$sessionPath = getenv('EIS_SUPPLIES_SESSION_DIR') ?: dirname(__DIR__, 3) . '/storage/sessions';
if ((!is_dir($sessionPath) && !@mkdir($sessionPath, 0770, true) && !is_dir($sessionPath))
    || !is_writable($sessionPath)) {
    error_log('Supplies session directory is unavailable: ' . $sessionPath);
    http_response_code(503);
    header('Cache-Control: no-store');
    exit('Session storage is unavailable. Please contact the administrator.');
}
