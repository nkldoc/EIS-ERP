<?php
declare(strict_types=1);

// ตัวอย่าง endpoint ขารับสำหรับ route "procure/ir" (ตรงกับ URI ปลายทางในตัวอย่าง payload)
// วางไฟล์นี้ตามโครงสร้าง route จริงของระบบ แล้วปรับชื่อตาราง/คอลัมน์ปลายทางตามหน้างาน
// (ตารางปลายทาง sp_ir_inbox ด้านล่างอยู่คนละฐานข้อมูลกับ php_auth_api ได้ตามปกติ
//  ถ้าใช้ MySQL คนละ connection ให้เปิด PDO ตัวที่สองแยกจาก apiDb())

require __DIR__ . '/api_auth.php';

$body = requireApiAccess('procure.ir'); // ผ่านบรรทัดนี้ = auth + สิทธิ์ผ่านแล้ว

$rows = $body['data'] ?? null;
if (!is_array($rows)) {
    apiRespond(400, ['success' => 0, 'message' => 'ไม่พบ data[] ในคำขอ']);
}

$pdo = apiDb();
try {
    $pdo->beginTransaction();

    $insert = $pdo->prepare(
        'INSERT INTO sp_ir_inbox
            (pr_id, po_id, period_id, chk_id, c_contract_code, source_account_id, received_at)
         VALUES
            (:pr_id, :po_id, :period_id, :chk_id, :c_contract_code, :account_id, NOW())'
    );

    $count = 0;
    foreach ($rows as $row) {
        $insert->execute([
            'pr_id'           => $row['pr_id'] ?? null,
            'po_id'           => $row['po_id'] ?? null,
            'period_id'       => $row['period_id'] ?? null,
            'chk_id'          => $row['chk_id'] ?? null,
            'c_contract_code' => $row['c_contract_code'] ?? null,
            'account_id'      => $body['account_id'],
        ]);
        $count++;
    }

    $pdo->commit();
    apiRespond(200, ['success' => 1, 'message' => "รับข้อมูลสำเร็จ {$count} แถว", 'received' => $count]);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    apiRespond(500, ['success' => 0, 'message' => 'บันทึกข้อมูลไม่สำเร็จ: ' . $e->getMessage()]);
}
