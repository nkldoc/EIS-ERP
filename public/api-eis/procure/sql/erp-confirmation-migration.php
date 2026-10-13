<?php
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/../account/api_auth.php';
require __DIR__ . '/../classes/ErpConfirmation.php';
$db = apiDb();
$db->exec(file_get_contents(__DIR__ . '/erp-confirmation.sql'));
$lastId = 0;
do {
    $stmt = $db->prepare('SELECT id,request_id,payload FROM sp_api_incoming_log WHERE BINARY uri=? AND status_code=200 AND id>? ORDER BY id LIMIT 100');
    $stmt->execute([ErpConfirmation::URI, $lastId]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rows as $row) {
        $envelope = json_decode($row['payload']);
        $db->beginTransaction();
        try {
            ErpConfirmation::enqueue($db, $row['request_id'], $envelope->body ?? null);
            $db->commit();
        } catch (Throwable $e) {
            $db->rollBack();
            throw $e;
        }
        $lastId = $row['id'];
    }
} while (count($rows) === 100);
echo "ERP confirmation table ready; successful irV1 receipts backfilled.\n";
