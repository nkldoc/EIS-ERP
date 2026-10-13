<?php
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/../account/api_auth.php';
$db = apiDb();
$db->exec(file_get_contents(__DIR__ . '/incoming-endpoints.sql'));
echo "Incoming endpoint and JSON log tables ready.\n";
