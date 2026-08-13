<?php
header('Content-Type: application/json');

$action = $_POST['action'] ?? '';
$dbName = $_POST['db'] ?? 'NMU_ERP';

if (!preg_match('/^[a-zA-Z0-9_]+$/', $dbName)) {
    echo json_encode(["error" => "Invalid database name"]);
    exit;
}

$serverName = "192.168.168.3";
function connectToDb($serverName, $dbName) {
    $opts = [
        "Database" => $dbName,
        "Uid" => "sa",
        "PWD" => "nklV1",
        "CharacterSet" => "UTF-8"
    ];
    $conn = sqlsrv_connect($serverName, $opts);
    if ($conn === false) {
        throw new Exception("Connection failed to database: $dbName");
    }
    return $conn;
}

try {
    if ($action === 'getJobs') {
        $connMsdb = connectToDb($serverName, "msdb");
        $query = "SELECT name FROM dbo.sysjobs ORDER BY name";
        $stmt = sqlsrv_query($connMsdb, $query);
        if ($stmt === false) throw new Exception(sqlsrv_errors()[0]['message'] ?? 'Failed to fetch jobs');

        $jobs = [];
        while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
            $jobs[] = ['name' => $row['name']];
        }
        sqlsrv_free_stmt($stmt);
        sqlsrv_close($connMsdb);
        echo json_encode(['jobs' => $jobs]);
        exit;

    } elseif ($action === 'runJob') {
        $jobName = $_POST['jobName'] ?? '';
        if (!$jobName || !preg_match('/^[\w\s\-]+$/u', $jobName)) {
            echo json_encode(["error" => "Invalid or missing jobName parameter"]);
            exit;
        }
        $connMsdb = connectToDb($serverName, "msdb");
        $tsql = "EXEC dbo.sp_start_job @job_name = ?";
        $stmt = sqlsrv_query($connMsdb, $tsql, [$jobName]);
        if ($stmt === false) throw new Exception(sqlsrv_errors()[0]['message'] ?? 'Failed to start job');

        sqlsrv_free_stmt($stmt);
        sqlsrv_close($connMsdb);
        echo json_encode(['success' => true]);
        exit;

    } elseif ($action === 'getProcedureDefinition') {
        $proc = $_POST['procedureName'] ?? '';
        if (!$proc || !preg_match('/^[a-zA-Z0-9_]+$/', $proc)) {
            echo json_encode(["error" => "Invalid procedure name"]);
            exit;
        }
        $conn = connectToDb($serverName, $dbName);
        $tsql = "
            SELECT sm.definition
            FROM sys.sql_modules sm
            JOIN sys.objects o ON sm.object_id = o.object_id
            WHERE o.name = ?
        ";
        $stmt = sqlsrv_query($conn, $tsql, [$proc]);
        if ($stmt === false) throw new Exception(sqlsrv_errors()[0]['message'] ?? 'Failed to fetch procedure');

        $row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);
        if ($row) {
            echo json_encode(['definition' => $row['definition']]);
        } else {
            echo json_encode(['error' => 'Procedure not found']);
        }
        sqlsrv_free_stmt($stmt);
        sqlsrv_close($conn);
        exit;

    } elseif ($action === 'getViewDefinition') {
        // ดึง definition ของ View ด้วย sp_helptext
        $view = $_POST['viewName'] ?? '';
        if (!$view || !preg_match('/^[a-zA-Z0-9_]+$/', $view)) {
            echo json_encode(["error" => "Invalid view name"]);
            exit;
        }
        $conn = connectToDb($serverName, $dbName);
        $tsql = "EXEC sp_helptext ?";
        $stmt = sqlsrv_query($conn, $tsql, [$view]);
        if ($stmt === false) throw new Exception(sqlsrv_errors()[0]['message'] ?? 'Failed to fetch view definition');

        $definitionLines = [];
        while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
            $definitionLines[] = $row['Text'] ?? '';
        }
        sqlsrv_free_stmt($stmt);
        sqlsrv_close($conn);

        echo json_encode(['definition' => implode('', $definitionLines)]);
        exit;

    } elseif ($action === 'execute') {
        $sql = trim($_POST['sql'] ?? '');
        if (!$sql) {
            echo json_encode(["error" => "No SQL statement provided"]);
            exit;
        }
        $conn = connectToDb($serverName, $dbName);

        $stmt = @sqlsrv_query($conn, $sql);
        if ($stmt === false) {
            echo json_encode(["error" => sqlsrv_errors()[0]['message'] ?? 'SQL execution error']);
            sqlsrv_close($conn);
            exit;
        }

        if (preg_match('/^\s*select\b/i', $sql)) {
            $rows = [];
            while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
                $rows[] = array_map(function ($v) {
                    if ($v instanceof DateTime) return $v->format('Y-m-d H:i:s');
                    return is_object($v) && method_exists($v, '__toString') ? $v->__toString() : $v;
                }, $row);
            }
            echo json_encode(["rows" => $rows]);
        } else {
            $affected = sqlsrv_rows_affected($stmt);
            echo json_encode(["success" => true, "affected_rows" => $affected]);
        }

        sqlsrv_free_stmt($stmt);
        sqlsrv_close($conn);
        exit;

    } else {
        echo json_encode(["error" => "Invalid action"]);
        exit;
    }
} catch (Exception $ex) {
    echo json_encode(["error" => $ex->getMessage()]);
    exit;
}
