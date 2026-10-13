<?php

require_once __DIR__ . '/erpConfirmationMapper.php';

/** Commits mapped inserts and the retry receipt in one MSSQL transaction. */
final class ErpConfirmationMssqlException extends RuntimeException {}

final class ErpConfirmationMssql {
    private $conn;
    private $mapperLoader;
    public function __construct($conn, callable $mapperLoader = null) { $this->conn = $conn; $this->mapperLoader = $mapperLoader ?: [ErpConfirmationMapper::class, 'active']; }

    private function query($sql, array $params = []) {
        $stmt = sqlsrv_query($this->conn, $sql, $params, ['QueryTimeout' => 30]);
        if ($stmt === false) {
            $codes = [];
            foreach (sqlsrv_errors(SQLSRV_ERR_ERRORS) ?: [] as $error) $codes[] = (int)$error['code'];
            if (function_exists('erpConfirmationLog')) erpConfirmationLog('ERP MSSQL driver codes=' . implode(',', $codes));
            
            $details = [];
            foreach (sqlsrv_errors(SQLSRV_ERR_ERRORS) ?: [] as $error) $details[] = 'SQL Server ' . (int)$error['code'] . ': ' . ($error['message'] ?? 'Unknown error');
            throw new ErpConfirmationMssqlException(implode(' | ', $details) ?: 'บันทึก MSSQL ไม่สำเร็จ');
        }
        return $stmt;
    }

    private function unicode($value) {
        return [$value, SQLSRV_PARAM_IN, SQLSRV_PHPTYPE_STRING('UTF-8'), SQLSRV_SQLTYPE_NVARCHAR('max')];
    }

    public function save(array $row, $userId, $userName) {
        $item = json_decode($row['payload']);
        if (!is_object($item) || !count(get_object_vars($item))) {
            throw new InvalidArgumentException('ข้อมูลรายการไม่ถูกต้อง ไม่สามารถยืนยันได้');
        }
        $hash = hash('sha256', $row['payload']);
        if (!preg_match('/^[a-f0-9]{32}$/iD', $row['request_id'])) {
            throw new InvalidArgumentException('รหัสรับเข้าของรายการไม่ถูกต้อง');
        }
        if (!sqlsrv_begin_transaction($this->conn)) {
            throw new ErpConfirmationMssqlException('เริ่มบันทึก MSSQL ไม่สำเร็จ กรุณาลองใหม่');
        }
        try {
            $stmt = $this->query('SELECT id,payload_hash,confirmed_by,confirmed_name,
                CONVERT(varchar(19),confirmed_at,120) AS confirmed_at
                FROM dbo.sp_erp_confirmation_inbox WITH (UPDLOCK,HOLDLOCK)
                WHERE request_id=? AND item_index=?', [$row['request_id'], $row['item_index']]);
            $saved = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);
            sqlsrv_free_stmt($stmt);
            if ($saved === false) throw new ErpConfirmationMssqlException('อ่านผลบันทึก MSSQL ไม่สำเร็จ กรุณาลองใหม่');
            if ($saved) {
                if (!hash_equals($saved['payload_hash'], $hash)) {
                    throw new InvalidArgumentException('รายการนี้มีข้อมูลใน MSSQL ต่างจากข้อมูลรับเข้า กรุณาให้ผู้ดูแลตรวจสอบก่อนยืนยัน');
                }
            } else {
                $mapper = call_user_func($this->mapperLoader, $userId);
                $mappedRefs = ErpConfirmationMapper::insert($mapper, $row['payload'], function ($sql, $params) { return $this->query($sql, $params); });
                $ref = function ($key) use ($item) {
                    $value = $item->$key ?? null;
                    return is_string($value) || is_int($value) ? (string)$value : null;
                };
                $name = $row['confirmed_at'] ? ($row['confirmed_name'] ?? $userName) : $userName;
                $reviewer = $row['confirmed_at'] ? ($row['reviewer_id'] ?? $userId) : $userId;
                $date = $row['confirmed_at'] ?: gmdate('Y-m-d H:i:s');
                $stmt = $this->query('INSERT INTO dbo.sp_erp_confirmation_inbox
                    (request_id,item_index,source_confirmation_id,payload,payload_hash,
                     pr_id,po_id,period_id,chk_id,c_doc_ref,confirmed_by,confirmed_name,confirmed_at)
                    OUTPUT INSERTED.id,INSERTED.payload_hash,INSERTED.confirmed_by,INSERTED.confirmed_name,
                           CONVERT(varchar(19),INSERTED.confirmed_at,120) AS confirmed_at
                    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', [
                    $row['request_id'], $row['item_index'], $row['id'], $this->unicode($row['payload']), $hash,
                    $this->unicode($ref('pr_id')), $this->unicode($ref('po_id')), $this->unicode($ref('period_id')),
                    $this->unicode($ref('chk_id')), $this->unicode($ref('c_doc_ref')),
                    $reviewer, $this->unicode($name), $date
                ]);
                $saved = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);
                sqlsrv_free_stmt($stmt);
                if (!$saved) throw new ErpConfirmationMssqlException('อ่านรหัสรายการ MSSQL ไม่สำเร็จ กรุณาลองใหม่');
            }
            if (!sqlsrv_commit($this->conn)) {
                throw new ErpConfirmationMssqlException('ยังยืนยันผลบันทึก MSSQL ไม่ได้ กรุณาลองยืนยันอีกครั้ง ระบบจะตรวจรายการซ้ำให้');
            }
            if(isset($mappedRefs['sp_tor_period_bill_id']))$saved['mapped_refs']=$mappedRefs;
            return $saved;
        } catch (Throwable $error) {
            sqlsrv_rollback($this->conn);
            throw $error;
        }
    }
}
