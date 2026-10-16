<?php
require_once __DIR__ . '/../public/supplies/conf/WorkspacePolicy.php';
$cases = [
    [['user_id'=>61079, 'dc_cost_id'=>4020100, 'i_type_user'=>1, 'dc_center_user'=>61414], true],
    [['user_id'=>10, 'dc_cost_id'=>38, 'i_type_user'=>1], false],
    [['user_id'=>10, 'dc_cost_id'=>3, 'i_type_user'=>1], false],
    [['user_id'=>10, 'dc_cost_id'=>0], false],
    [['user_id'=>1, 'dc_cost_id'=>4020100, 'i_type_user'=>2], false],
    [['user_id'=>10, 'dc_cost_id'=>4020100, 'dc_center_user'=>1], false],
    [[], false],
];
foreach ($cases as [$session, $expected]) {
    if (SuppliesWorkspacePolicy::externalUnit($session) !== $expected) throw new RuntimeException('Workspace policy mismatch');
}
echo 'PASS: ' . count($cases) . " workspace policy checks\n";
