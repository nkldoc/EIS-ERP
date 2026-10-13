<?php
declare(strict_types=1);
require_once __DIR__ . '/../conf/database.php';

final class ErpConfirmation
{
    const URI = APP_RUNTIME_ENV === 'production' ? '/procure/incoming/irV1' : '/api-eis/procure/incoming/irV1';

    // The caller owns the transaction so receipt and pending items commit together.
    public static function enqueue(PDO $db, string $requestId, $body): void
    {
        if (!is_object($body) || !isset($body->data) || !is_array($body->data)) return;
        $insert = $db->prepare('INSERT INTO sp_erp_confirmation (request_id,item_index,payload) VALUES (?,?,?) ON DUPLICATE KEY UPDATE request_id=VALUES(request_id)');
        foreach ($body->data as $index => $item) {
            $insert->execute([$requestId, $index, json_encode($item, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRESERVE_ZERO_FRACTION | JSON_THROW_ON_ERROR)]);
        }
    }

    public static function confirm(PDO $db, int $id, int $userId, string $userName): bool
    {
        $db->beginTransaction();
        try {
            $stmt = $db->prepare('SELECT payload FROM sp_erp_confirmation WHERE id=? AND confirmed_at IS NULL FOR UPDATE');
            $stmt->execute([$id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$row) { $db->rollBack(); return false; }
            $item = json_decode($row['payload']);
            if (!is_object($item) || !count(get_object_vars($item))) {
                throw new InvalidArgumentException('ข้อมูลรายการไม่ถูกต้อง ไม่สามารถยืนยันได้');
            }
            $stmt = $db->prepare('UPDATE sp_erp_confirmation SET confirmed_at=UTC_TIMESTAMP(),confirmed_by=?,confirmed_name=? WHERE id=? AND confirmed_at IS NULL');
            $stmt->execute([$userId, mb_substr($userName, 0, 200), $id]);
            $db->commit();
            return true;
        } catch (Throwable $e) {
            if ($db->inTransaction()) $db->rollBack();
            throw $e;
        }
    }
}
