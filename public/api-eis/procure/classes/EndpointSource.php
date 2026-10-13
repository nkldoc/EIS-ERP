<?php
/** One source reader shared by previews and actual delivery. */
class EndpointSource
{
    public static function connection()
    {
        $serverOverride = defined('ERPSEND_SOURCE_SERVER_OVERRIDE') ? ERPSEND_SOURCE_SERVER_OVERRIDE : null;
        // The explicit Production facade override wins over a generic DSN that
        // may have been configured for the development site on the same host.
        $dsn = $serverOverride ? false : getenv('ERPSEND_SOURCE_DSN');
        $user = getenv('ERPSEND_SOURCE_USER') ?: '';
        $password = getenv('ERPSEND_SOURCE_PASSWORD') ?: '';
        if (!$dsn) {
            // Reuse the application's MSSQL settings without emitting legacy debug output.
            $level = ob_get_level();
            $display = ini_get('display_errors');
            $startup = ini_get('display_startup_errors');
            $reporting = error_reporting();
            $hadSession = session_status() === PHP_SESSION_ACTIVE;
            try { require_once __DIR__ . '/../conf/config.php'; }
            finally {
                while (ob_get_level() > $level) ob_end_clean();
                ini_set('display_errors', $display); ini_set('display_startup_errors', $startup); error_reporting($reporting);
                if (!$hadSession && session_status() === PHP_SESSION_ACTIVE) session_write_close();
            }
            $server = $serverOverride ?: DB_SERVER;
            $dsn = 'sqlsrv:Server=' . $server
                . ';Database=' . DB_NAME
                . ';LoginTimeout=5'
                . ';TrustServerCertificate=' . (MSSQL_TRUST_SERVER_CERTIFICATE ? 'yes' : 'no')
                . ';Encrypt=' . (MSSQL_ENCRYPT ? 'yes' : 'no');
            $user = DB_USER; $password = DB_PASS;
        }
        if (stripos($dsn, 'sqlsrv:') !== 0) throw new RuntimeException('Endpoint source ต้องเป็น MSSQL (sqlsrv)');
        return new PDO($dsn, $user, $password, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    }

    public static function databases(PDO $db)
    {
        return $db->query("SELECT name FROM sys.databases WHERE state=0 AND database_id>4 AND HAS_DBACCESS(name)=1 ORDER BY name")->fetchAll(PDO::FETCH_COLUMN);
    }

    public static function validateQuery($query)
    {
        if (!is_string($query) || trim($query) === '' || strlen($query) > 60000 ||
            !preg_match('/^SELECT\b/i', trim($query)) ||
            preg_match('/;|--|\/\*|\b(INTO|OUTFILE|DUMPFILE|OPENROWSET|OPENQUERY|OPENDATASOURCE|INSERT|UPDATE|DELETE|MERGE|EXEC|EXECUTE|CREATE|ALTER|DROP|TRUNCATE|GRANT|REVOKE|DENY|BACKUP|RESTORE|DBCC|WAITFOR|USE|SET|BEGIN|COMMIT|ROLLBACK)\b/i', $query)) {
            throw new InvalidArgumentException('Query ต้องเป็น SELECT เดียว ไม่มี comment, INTO หรือคำสั่งเชื่อมต่อภายนอก');
        }
    }

    public static function validateMapping($mapping)
    {
        if (!is_array($mapping) || count($mapping) > 512 || array_values($mapping) !== $mapping) throw new InvalidArgumentException('รายการฟิลด์ไม่ถูกต้อง');
        $sources = []; $targets = [];
        foreach ($mapping as $field) {
            if (!is_array($field) || !is_string($field['source'] ?? null) || $field['source'] === '' || strlen($field['source']) > 512 ||
                !is_string($field['target'] ?? null) || !preg_match('/^[A-Za-z_][A-Za-z0-9_]{0,127}$/D', $field['target']) ||
                in_array($field['source'], $sources, true) || in_array(strtolower($field['target']), $targets, true)) {
                throw new InvalidArgumentException('ชื่อฟิลด์ปลายทางต้องเป็นตัวอักษรอังกฤษ ตัวเลข หรือ _ และต้องไม่ซ้ำ');
            }
            $sources[] = $field['source']; $targets[] = strtolower($field['target']);
        }
        if (strlen(json_encode($mapping, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR)) > 60000) throw new InvalidArgumentException('รายการฟิลด์มีขนาดใหญ่เกินกำหนด');
        return $mapping;
    }

    public static function mapRows(array $rows, array $columns, array $mapping)
    {
        self::validateMapping($mapping);
        foreach ($mapping as $field) {
            if (!in_array($field['source'], $columns, true)) throw new InvalidArgumentException('ไม่พบฟิลด์ที่เลือกใน Query: ' . $field['source']);
        }
        if (!$mapping) return $rows;
        return array_map(function ($row) use ($mapping) {
            $result = [];
            foreach ($mapping as $field) $result[$field['target']] = $row[$field['source']];
            return $result;
        }, $rows);
    }

    public static function read(array $endpoint, $preview = false)
    {
        self::validateQuery($endpoint['query'] ?? null);
        $db = self::connection();
        $database = $endpoint['database'] ?? '';
        if ($database !== '') {
            if (!in_array($database, self::databases($db), true)) throw new InvalidArgumentException('ไม่พบฐานข้อมูล MSSQL ที่เลือกหรือไม่มีสิทธิ์เข้าถึง');
            $db->exec('USE [' . str_replace(']', ']]', $database) . ']');
        }
        $statement = $db->prepare($endpoint['query']);
        $statement->setAttribute(PDO::SQLSRV_ATTR_QUERY_TIMEOUT, 30);
        $statement->execute();
        $columns = [];
        for ($i = 0; $i < $statement->columnCount(); $i++) {
            $meta = $statement->getColumnMeta($i);
            $name = $meta['name'] ?? '';
            if ($name === '' || in_array($name, $columns, true)) throw new InvalidArgumentException('Query มีชื่อฟิลด์ว่างหรือซ้ำ กรุณาตั้งชื่อด้วย AS');
            $columns[] = $name;
        }
        $limit = $preview ? 10 : 1000;
        $rows = []; $bytes = 0; $truncated = false;
        while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
            if (count($rows) >= $limit) {
                if (!$preview) throw new RuntimeException('ข้อมูลเกิน 1,000 แถว กรุณาจำกัด Query ก่อนส่ง');
                $truncated = true; break;
            }
            $bytes += strlen(json_encode($row, JSON_THROW_ON_ERROR));
            if ($bytes > 5 * 1024 * 1024) throw new RuntimeException('ข้อมูลเกิน 5 MB กรุณาจำกัด Query');
            $rows[] = $row;
        }
        $statement->closeCursor();
        $mapped = self::mapRows($rows, $columns, $endpoint['fields'] ?? []);
        return ['columns' => $columns, 'rows' => $rows, 'data' => $mapped, 'truncated' => $truncated,
            'database' => $db->query('SELECT DB_NAME()')->fetchColumn()];
    }
}
