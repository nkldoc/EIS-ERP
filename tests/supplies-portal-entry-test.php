<?php
require_once __DIR__ . '/../public/supplies/access/PortalEntryResponse.php';
$cases = [
    [[], [], false],
    [['portal_entry'=>'1'], [], true],
    [['portal_entry'=>'0'], ['REQUEST_URI'=>'/access/login_1?portal_entry=1'], false],
    [[], ['REQUEST_URI'=>'/supplies/access/login_1?ss_user_id=1&portal_entry=1'], true],
    [[], ['UNENCODED_URL'=>'/supplies/access/login_1?portal_entry=1', 'REQUEST_URI'=>'/access/login_1.php'], true],
    [[], ['HTTP_X_ORIGINAL_URL'=>'/supplies/access/login_1?portal_entry=1'], true],
    [[], ['REQUEST_URI'=>'/supplies/access/login_1?ss_user_id=1'], false],
];
foreach ($cases as [$query, $server, $expected]) {
    if (PortalEntryResponse::requested($query, $server) !== $expected) throw new RuntimeException('Portal entry detection failed');
}
echo 'PASS: ' . count($cases) . " portal entry checks\n";
