<?php

/**
 * ใช้แทน api-eis/procure/classes/ErpConfirmation.php
 * อยู่ในโฟลเดอร์ของเมนูนี้เอง จึงไม่ต้องแตะหรือพึ่งพาไฟล์ใน api-eis
 */
final class ErpConfirmationStore {

    /** ชื่อคอลัมน์ที่เป็นไปได้สำหรับ "รหัสผู้ยืนยัน" (ใช้ตัวที่พบจริงในตาราง) */
    private static $userIdCandidates = ['confirmed_by', 'confirmed_user_id', 'confirmed_id'];

    private static function columns(PDO $db) {
        $cols = [];
        foreach ($db->query('SHOW COLUMNS FROM sp_erp_confirmation') as $c) {
            $cols[strtolower($c['Field'])] = true;
        }
        return $cols;
    }

    /**
     * ยืนยันรายการ (atomic: อัปเดตเฉพาะรายการที่ยังไม่ถูกยืนยัน)
     * @return bool true = ยืนยันสำเร็จ, false = ถูกยืนยันไปแล้วหรือไม่พบรายการ
     */
    public static function confirm(PDO $db, $id, $userId, $userName) {
        $cols = self::columns($db);
        if (!isset($cols['confirmed_at'])) {
            throw new RuntimeException('ตาราง sp_erp_confirmation ไม่มีคอลัมน์ confirmed_at');
        }
        // ฝั่ง JS อ่านเวลาเป็น UTC จึงบันทึกเป็น UTC ให้สอดคล้องกับ received_at
        $set = ['confirmed_at = UTC_TIMESTAMP()'];
        $params = [];
        if (isset($cols['confirmed_name'])) {
            $set[] = 'confirmed_name = ?';
            $params[] = $userName;
        }
        foreach (self::$userIdCandidates as $name) {
            if (isset($cols[$name])) {
                $set[] = $name . ' = ?';
                $params[] = $userId;
                break;
            }
        }
        $params[] = $id;
        $stmt = $db->prepare('UPDATE sp_erp_confirmation SET ' . implode(', ', $set) . ' WHERE id = ? AND confirmed_at IS NULL');
        $stmt->execute($params);
        return $stmt->rowCount() === 1;
    }
}
