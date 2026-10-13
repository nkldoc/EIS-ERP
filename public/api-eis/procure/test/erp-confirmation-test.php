<?php
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/../account/api_auth.php';
require __DIR__ . '/../classes/IncomingEndpoint.php';
$db = apiDb();
$requests = [];
$checks = 0;
function checkErp($condition, $label) {
    global $checks;
    if (!$condition) throw new RuntimeException($label);
    $checks++;
    echo "PASS $label\n";
}
function queueCount($db, $request) {
    $stmt = $db->prepare('SELECT COUNT(*) FROM sp_erp_confirmation WHERE request_id=?');
    $stmt->execute([$request]);
    return (int)$stmt->fetchColumn();
}
try {
    $body = (object)['data' => [(object)['pr_id' => 1768, 'c_doc_ref' => false, 'line_ids' => [(object)['chk_line_id' => 2652]], 'token' => 'fixture-secret'], (object)['pr_id' => 1769], null]];
    $id = IncomingEndpoint::record($db, null, ErpConfirmation::URI, 'POST', 'confirmation-fixture', 200, 'fixture', [], $body);
    $requests[] = $id;
    checkErp(queueCount($db, $id) === 3, 'each received item creates one pending row');
    $stmt = $db->prepare('SELECT * FROM sp_erp_confirmation WHERE request_id=? ORDER BY item_index');
    $stmt->execute([$id]); $items = $stmt->fetchAll();
    $saved = json_decode($items[0]['payload']);
    checkErp($saved->c_doc_ref === false && $saved->line_ids[0]->chk_line_id === 2652, 'preserve boolean and line detail');
    checkErp($saved->token === '***HIDDEN***', 'queue retains only redacted secrets');
    checkErp($items[0]['confirmed_at'] === null, 'new item is pending');
    checkErp(ErpConfirmation::confirm($db, (int)$items[0]['id'], 1, 'fixture reviewer'), 'confirm pending item');
    checkErp(!ErpConfirmation::confirm($db, (int)$items[0]['id'], 2, 'second reviewer'), 'duplicate confirmation cannot overwrite reviewer');
    $db->beginTransaction(); ErpConfirmation::enqueue($db, $id, IncomingEndpoint::redact($body)); $db->commit();
    checkErp(queueCount($db, $id) === 3, 'backfill is idempotent');
    $stmt->execute([$id]); $updated = $stmt->fetchAll();
    checkErp((int)$updated[0]['confirmed_by'] === 1 && $updated[0]['confirmed_at'] !== null, 'backfill preserves confirmation and audit');
    try { ErpConfirmation::confirm($db, (int)$items[2]['id'], 1, 'fixture'); throw new RuntimeException('Invalid item accepted'); }
    catch (InvalidArgumentException $e) { checkErp(!$db->inTransaction(), 'invalid item cannot confirm and releases transaction'); }
    foreach ([[ErpConfirmation::URI, 401], ['/procure/incoming/other', 200]] as $case) {
        $request = IncomingEndpoint::record($db, null, $case[0], 'POST', 'confirmation-fixture', $case[1], 'fixture', [], $body);
        $requests[] = $request;
        checkErp(queueCount($db, $request) === 0, 'exclude rejected request or other route');
    }
    $request = IncomingEndpoint::record($db, null, ErpConfirmation::URI, 'POST', 'confirmation-fixture', 200, 'fixture', [], (object)['data' => []]);
    $requests[] = $request;
    checkErp(queueCount($db, $request) === 0, 'empty batch creates no pending item');
    // Each successful delivery gets a separate confirmation, even for identical data.
    require_once __DIR__ . '/../../../supplies/sp/_conf/mysql_connect.php';
    $suppliesDb = spMysqlConnect();
    $repeatBody = (object)['data' => [(object)['pr_id' => 'REPEAT-FIXTURE']]];
    $repeatIds = [];
    for ($i = 0; $i < 2; $i++) {
        $repeatId = IncomingEndpoint::record($db, null, ErpConfirmation::URI, 'POST', 'confirmation-fixture', 200, 'fixture', [], $repeatBody);
        $requests[] = $repeatId;
        $repeatIds[] = $repeatId;
        $pending = $suppliesDb->prepare('SELECT COUNT(*) FROM sp_erp_confirmation q JOIN sp_api_incoming_log l ON l.request_id=q.request_id WHERE q.request_id=? AND q.confirmed_at IS NULL');
        $pending->execute([$repeatId]);
        checkErp((int)$pending->fetchColumn() === 1, 'successful delivery is pending in Supplies database');
    }
    checkErp($repeatIds[0] !== $repeatIds[1], 'repeated payload creates separate confirmation per delivery');
    echo "$checks checks passed.\n";
} finally {
    if ($db->inTransaction()) $db->rollBack();
    foreach ($requests as $request) {
        $db->prepare('DELETE FROM sp_erp_confirmation WHERE request_id=?')->execute([$request]);
        $db->prepare('DELETE FROM sp_api_incoming_log WHERE request_id=?')->execute([$request]);
    }
}
