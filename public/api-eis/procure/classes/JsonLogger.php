<?php

class JsonLogger
{
    private $logDir;
    private $transactionId;

    public function __construct($logDir = null)
    {
        $this->logDir = $logDir ?? __DIR__ . '/../logs/json/';
        $this->transactionId = uniqid('TXN_', true);

        if (!is_dir($this->logDir)) {
            mkdir($this->logDir, 0775, true);
        }
    }

    public function log($data = [], $type = 'INFO')
    {
        try {

            $file = $this->logDir . date('Y-m-d') . '.log';

            $logData = [
                'transaction_id' => $this->transactionId,
                'datetime'       => date('Y-m-d H:i:s'),
                'ip'             => $_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN',
                'method'         => $_SERVER['REQUEST_METHOD'] ?? '',
                'url'            => $_SERVER['REQUEST_URI'] ?? '',
                'type'           => $type,
                'data'           => $this->sanitize($data)
            ];

            file_put_contents(
                $file,
                json_encode($logData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL,
                FILE_APPEND | LOCK_EX
            );

        } catch (Exception $e) {
            // ถ้า log พัง ห้ามทำให้ระบบพัง
        }
    }

    private function sanitize($data)
    {
        if (!is_array($data)) return $data;

        $sensitiveKeys = ['password', 'token', 'authorization', 'auth'];

        foreach ($data as $key => $value) {
            if (in_array(strtolower($key), $sensitiveKeys)) {
                $data[$key] = '***HIDDEN***';
            } elseif (is_array($value)) {
                $data[$key] = $this->sanitize($value);
            }
        }

        return $data;
    }

    public function getTransactionId()
    {
        return $this->transactionId;
    }
}