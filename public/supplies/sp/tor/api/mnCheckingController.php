<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");
include("../../conf/configSp.php");
$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

$mode = trim((string) ($_REQUEST["mode"] ?? ""));

if ($mode === "") {
    http_response_code(400);
    header("Content-Type: application/json; charset=utf-8");
    echo json_encode(array(
        "reval" => 1,
        "success" => false,
        "msg" => "Missing required parameter: mode"
    ));
    exit;
}
$table = "dbo.sp_tor";
$keyName = "tor_id";
$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;
$c_code_gen = "TOR";
$re_id = null;
$ret_id = null; // return identifier from operations
$stmt = true;  // make sure defined for rollback check
$stmt2 = true;
$stmt3 = true;
$BudgetYear = (date('m') > 9) ? date('Y') + 1 : date('Y');

function upItemsStatus($data, $arr, $db) {

    $i_backword = $data["i_backword"] ?? null;
    $c_comment = $data["c_comment"] ?? null;

    $arrParam2[] = $data["id"]; //tor_id
    $arrParam2[] = $data["contract_id"] ?? null;

    // $arrParam2[] = $data["i_period_month_end"] ?? null;
    // $arrParam2[] = $data["i_peroid_product_end"] ?? null;

    $arrParam2[] = $arr["sp_status_hdr_id"];

    $arrParam2[] = ($i_backword == null) ? 1 : 0; //forword
    $arrParam2[] = ($i_backword != null) ? 1 : 0; //backword
    $arrParam2[] = $c_comment ?? null;
    $arrParam2[] = ($i_backword == null ? ($arr["i_seq"]) : $data["i_seq"]); //i_seq รับจาก arr database + 1 ถ้า backword รับจาก request
    $arrParam2[] = $data["d_update"];

    $arrParam2[] = $data["dc_user_update_id"];
    $arrParam2[] = $data["dc_user_update_cost_id"];
    $arrParam2[] = $data["d_update"];

    $sql = "insert into dbo.sp_tor_item (tor_id , contract_id
                                                , sp_status_hdr_id
                                                , i_forword , i_backword
                                                , c_comment , i_step , d_tor_status_date
                                                , act_user_id , act_cost_id , act_date_dt)
                                values ( ?, ?
                                        , ?
                                        , ?, ?
                                        , ?, ?, ?
                                        , ?, ?, ?);";
    $arrParam2[] = $data["id"];

    return $db->QueryParam($sql, $arrParam2);
}

//
function upPA($data, $arr, $db) {

    $i_backword = $data["i_backword"] ?? null;

    $arrParam3[] = $data["id"]; //tor_id
    $arrParam3[] = $data["contract_id"] ?? null;

    // $arrParam3[] = $data["i_period_month_end"] ?? null;
    // $arrParam3[] = $data["i_peroid_product_end"] ?? null;

    $arrParam3[] = $arr["sp_status_hdr_id"];

    $arrParam3[] = ($i_backword == null) ? 1 : 0; //forword
    $arrParam3[] = (@$data["i_backword"] != null) ? 1 : 0; //backword
    $arrParam3[] = $data["c_comment"] ?? null;
    $arrParam3[] = ($i_backword == null ? ($arr["i_seq"]) : $data["i_seq"]); //i_seq รับจาก arr database + 1 ถ้า backword รับจาก request
    $arrParam3[] = $data["d_update"];

    $arrParam3[] = $data["dc_user_update_id"];
    $arrParam3[] = $data["dc_user_update_cost_id"];
    $arrParam3[] = $data["d_update"];

    $sql = "insert into dbo.sp_tor_pa_item (tor_id , contract_id
                                                --, i_period_month_end , i_peroid_product_end
                                                , sp_status_hdr_id
                                                , i_forword , i_backword
                                                , c_comment , i_step , d_tor_status_date
                                                , act_user_id , act_cost_id , act_date_dt)
                                values ( ?, ?
                                        --, ?, ?
                                        , ?
                                        , ?, ?
                                        , ?, ?, ?
                                        , ?, ?, ?);";
    $arrParam3[] = $data["id"];
    return $db->QueryParam($sql, $arrParam3);
}

//
function upAlert($data, $arr, $db) {

    $i_backword = $data["i_backword"] ?? null;

    $arrParam4[] = $data["id"]; //tor_id
    $arrParam4[] = $data["contract_id"] ?? null;

    // $arrParam4[] = $data["i_period_month_end"] ?? null;
    // $arrParam4[] = $data["i_peroid_product_end"] ?? null;

    $arrParam4[] = $arr["sp_status_hdr_id"];

    $arrParam4[] = ($i_backword == null) ? 1 : 0; //forword
    $arrParam4[] = (@$data["i_backword"] != null) ? 1 : 0; //backword
    $arrParam4[] = $data["c_comment"] ?? null;
    $arrParam4[] = ($i_backword == null ? ($arr["i_seq"]) : $data["i_seq"]); //i_seq รับจาก arr database + 1 ถ้า backword รับจาก request
    $arrParam4[] = $data["d_update"];

    $arrParam4[] = $data["dc_user_update_id"];
    $arrParam4[] = $data["dc_user_update_cost_id"];
    $arrParam4[] = $data["d_update"];

    $sql = "insert into dbo.sp_tor_alert_item (tor_id , contract_id
                                                --, i_period_month_end , i_peroid_product_end
                                                , sp_status_hdr_id
                                                , i_forword , i_backword
                                                , c_comment , i_step , d_tor_status_date
                                                , act_user_id , act_cost_id , act_date_dt)
                                values ( ?, ?
                                        --, ?, ?
                                        , ?
                                        , ?, ?
                                        , ?, ?, ?
                                        , ?, ?, ?);";
    $arrParam4[] = $data["id"];
    return $db->QueryParam($sql, $arrParam4);
}

//End fn updateStaus
if (empty($_SESSION['user_id'])) {
    $msg = "Session หมดอายุ";
    echo json_encode(array(
        "reval" => 1,
        "success" => false,
        "session_expired" => true,
        "msg" => $msg
    ));
    exit;
} else {

    $info[1] = $_SESSION['user_id'];
    $info[2] = $_SESSION['dc_cost_id'];
    $info[3] = date('Y-m-d H:i:s'); // วันที่และเวลา ปัจจุบัน
// toDoLog
}

$db->BeginTran();
$d_tor_date = $data['d_tor_date'] ?? null;
$data['d_tor_date'] = !empty($d_tor_date) ? $date->bc_to_ad($data['d_tor_date']) : null;
$f_total_amt = !empty($data["f_total_amt"]) ? str_replace(',', '', $data["f_total_amt"]) : 0; //str_replace(',', '', $data[$value]);
$data['dc_cost_id'] = $data['dc_cost_id'] ?? 38;
$data["c_comment"] = $data["c_comment"] ?? NULL;

function previewValueExpression($fieldName, $dataType, $alias) {
    $dateTypes = array('date', 'datetime', 'datetime2', 'smalldatetime', 'datetimeoffset');
    if (in_array(strtolower($dataType), $dateTypes, true)) {
        return "CONVERT(varchar(10), [{$fieldName}], 23) AS {$alias}";
    }
    return "CONVERT(nvarchar(max), [{$fieldName}]) AS {$alias}";
}

function shouldUseWorkInProcessAccount($request, $db) {
    if (intval(isset($request['i_workin_process']) ? $request['i_workin_process'] : 0) !== 1) {
        return false;
    }

    // รายการที่ไม่ใช่ครุภัณฑ์ใช้บัญชีงานระหว่างดำเนินการตามเงื่อนไขเดิม
    if (intval(isset($request['i_product_type']) ? $request['i_product_type'] : 0) !== 2) {
        return true;
    }

    // ครุภัณฑ์ใช้บัญชีงานระหว่างดำเนินการเฉพาะหมวด 9999 (รอระบุหมวดครุภัณฑ์)
    $amModeId = intval(isset($request['am_mode_id']) ? $request['am_mode_id'] : 0);
    if ($amModeId <= 0) {
        return false;
    }

    $stmt = $db->QueryParam(
        "SELECT TOP 1 c_code FROM " . DB_CENTER . "am_mode_acc WHERE am_mode_id = ?",
        array($amModeId)
    );
    $row = $stmt ? $db->Fetch($stmt) : false;

    return $row && trim((string)$row['c_code']) === '9999';
}

switch ($mode) {
    case "getTableList":
        $result = $db->QueryParam(
            "SELECT t.name AS table_name
             FROM sys.tables t
             INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
             WHERE s.name = 'dbo' AND t.is_ms_shipped = 0
             ORDER BY t.name",
            array()
        );
        $tableList = array();
        if ($result) {
            while ($row = $db->Fetch($result)) {
                $tableList[] = array("table_name" => $row["table_name"]);
            }
        }
        echo json_encode(array("success" => true, "data" => $tableList));
        exit();

    case "getFieldList":
        $selectedTable = preg_replace('/[^a-zA-Z0-9_]/', '', $_REQUEST['table'] ?? '');
        $result = $db->QueryParam(
            "SELECT c.name AS field_name
             FROM sys.columns c
             INNER JOIN sys.tables t ON t.object_id = c.object_id
             INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
             WHERE s.name = 'dbo' AND t.name = ?
             ORDER BY c.column_id",
            array($selectedTable)
        );
        $fieldList = array();
        if ($result) {
            while ($row = $db->Fetch($result)) {
                $fieldList[] = array("field_name" => $row["field_name"]);
            }
        }
        echo json_encode(array("success" => true, "data" => $fieldList));
        exit();

    case "previewSqlQuery":
        $sqlInput = trim($_REQUEST['sql_query'] ?? '');
        $pattern = "/^SELECT\\s+(?:TOP\\s+(\\d{1,3})\\s+)?\\[?([a-zA-Z0-9_]+)\\]?\\s*,\\s*\\[?([a-zA-Z0-9_]+)\\]?\\s+FROM\\s+(?:\\[?dbo\\]?\\.)?\\[?([a-zA-Z0-9_]+)\\]?(?:\\s+WHERE\\s+\\[?([a-zA-Z0-9_]+)\\]?\\s*(=|<>|!=|>=|<=|>|<|LIKE)\\s*(NULL|'(?:''|[^'])*'|-?\\d+(?:\\.\\d+)?))?(?:\\s+ORDER\\s+BY\\s+\\[?([a-zA-Z0-9_]+)\\]?\\s*(ASC|DESC)?)?\\s*;?$/i";
        if (!preg_match($pattern, $sqlInput, $matches)) {
            echo json_encode(array(
                "success" => false,
                "msg" => "รองรับ SELECT สองฟิวด์ พร้อม WHERE หนึ่งเงื่อนไข และ ORDER BY"
            ));
            exit();
        }

        $previewLimit = !empty($matches[1]) ? min(intval($matches[1]), 100) : 100;
        $selectedIdField = $matches[2];
        $selectedValueField = $matches[3];
        $selectedTable = $matches[4];
        $selectedWhereField = !empty($matches[5]) ? $matches[5] : '';
        $selectedWhereOperator = !empty($matches[6]) ? strtoupper($matches[6]) : '';
        $selectedWhereValue = isset($matches[7]) ? $matches[7] : '';
        $selectedOrderField = !empty($matches[8]) ? $matches[8] : $selectedIdField;
        $selectedOrderDirection = !empty($matches[9]) && strtoupper($matches[9]) === 'ASC' ? 'ASC' : 'DESC';

        $fieldCheck = $db->QueryParam(
            "SELECT COUNT(DISTINCT c.name) AS field_count
             FROM sys.columns c
             INNER JOIN sys.tables t ON t.object_id = c.object_id
             INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
             WHERE s.name = 'dbo' AND t.name = ? AND c.name IN (?, ?, ?, ?)",
            array($selectedTable, $selectedIdField, $selectedValueField, $selectedOrderField, $selectedWhereField)
        );
        $fieldCheckRow = $fieldCheck ? $db->Fetch($fieldCheck) : false;
        $requiredFields = array_unique(array_filter(array($selectedIdField, $selectedValueField, $selectedOrderField, $selectedWhereField)));
        if (!$fieldCheckRow || intval($fieldCheckRow['field_count']) !== count($requiredFields)) {
            echo json_encode(array("success" => false, "msg" => "ไม่พบตารางหรือชื่อฟิวด์ใน Query"));
            exit();
        }

        $typeResult = $db->QueryParam(
            "SELECT ty.name AS data_type FROM sys.columns c
             INNER JOIN sys.types ty ON ty.user_type_id = c.user_type_id
             INNER JOIN sys.tables t ON t.object_id = c.object_id
             INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
             WHERE s.name = 'dbo' AND t.name = ? AND c.name = ?",
            array($selectedTable, $selectedValueField)
        );
        $typeRow = $typeResult ? $db->Fetch($typeResult) : array();
        $valueExpression = previewValueExpression($selectedValueField, $typeRow['data_type'] ?? '', 'field_value');
        $safeSql = "SELECT TOP {$previewLimit} "
                . "CONVERT(nvarchar(max), [{$selectedIdField}]) AS row_id, {$valueExpression} "
                . "FROM [dbo].[{$selectedTable}]";
        $queryParams = array();
        $editableWhere = '';
        if ($selectedWhereField !== '') {
            if (strtoupper($selectedWhereValue) === 'NULL') {
                $nullOperator = in_array($selectedWhereOperator, array('<>', '!='), true) ? 'IS NOT NULL' : 'IS NULL';
                $safeSql .= " WHERE [{$selectedWhereField}] {$nullOperator}";
                $editableNullOperator = in_array($selectedWhereOperator, array('<>', '!='), true) ? '<>' : '=';
                $editableWhere = " WHERE [{$selectedWhereField}] {$editableNullOperator} NULL";
            } else {
                $whereValue = $selectedWhereValue;
                if (strlen($whereValue) >= 2 && $whereValue[0] === "'") {
                    $whereValue = str_replace("''", "'", substr($whereValue, 1, -1));
                }
                $safeSql .= " WHERE [{$selectedWhereField}] {$selectedWhereOperator} ?";
                $queryParams[] = $whereValue;
                $escapedDisplayValue = str_replace("'", "''", $whereValue);
                $editableWhere = " WHERE [{$selectedWhereField}] {$selectedWhereOperator} '{$escapedDisplayValue}'";
            }
        }
        $safeSql .= " ORDER BY [{$selectedOrderField}] {$selectedOrderDirection}";
        $previewResult = $db->QueryParam($safeSql, $queryParams);
        $previewData = array();
        if ($previewResult) {
            while ($row = $db->Fetch($previewResult)) {
                $previewData[] = array("row_id" => $row['row_id'], "field_value" => $row['field_value']);
            }
        }
        $editableSql = "SELECT TOP {$previewLimit} [{$selectedIdField}], [{$selectedValueField}] "
                . "FROM [dbo].[{$selectedTable}]{$editableWhere} ORDER BY [{$selectedOrderField}] {$selectedOrderDirection}";
        echo json_encode(array("success" => true, "data" => $previewData, "sql_query" => $editableSql));
        exit();

    case "previewTableData":
        $selectedTable = preg_replace('/[^a-zA-Z0-9_]/', '', $_REQUEST['table'] ?? '');
        $selectedIdField = preg_replace('/[^a-zA-Z0-9_]/', '', $_REQUEST['row_field'] ?? '');
        $selectedValueField = preg_replace('/[^a-zA-Z0-9_]/', '', $_REQUEST['field_name'] ?? '');
        $selectedRowId = $_REQUEST['row_id'] ?? '';

        if (empty($selectedTable) || empty($selectedIdField) || empty($selectedValueField)) {
            echo json_encode(array("success" => false, "msg" => "ข้อมูลตารางหรือชื่อฟิวด์ไม่ครบ"));
            exit();
        }

        // ตรวจสอบ identifier กับ metadata ก่อนนำไปประกอบ SQL เสมอ
        $fieldCheck = $db->QueryParam(
            "SELECT COUNT(DISTINCT c.name) AS field_count
             FROM sys.columns c
             INNER JOIN sys.tables t ON t.object_id = c.object_id
             INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
             WHERE s.name = 'dbo' AND t.name = ? AND c.name IN (?, ?)",
            array($selectedTable, $selectedIdField, $selectedValueField)
        );
        $fieldCheckRow = $fieldCheck ? $db->Fetch($fieldCheck) : false;
        $expectedFieldCount = ($selectedIdField === $selectedValueField) ? 1 : 2;
        if (!$fieldCheckRow || intval($fieldCheckRow['field_count']) !== $expectedFieldCount) {
            echo json_encode(array("success" => false, "msg" => "ไม่พบตารางหรือชื่อฟิวด์ที่เลือก"));
            exit();
        }

        $typeResult = $db->QueryParam(
            "SELECT ty.name AS data_type FROM sys.columns c
             INNER JOIN sys.types ty ON ty.user_type_id = c.user_type_id
             INNER JOIN sys.tables t ON t.object_id = c.object_id
             INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
             WHERE s.name = 'dbo' AND t.name = ? AND c.name = ?",
            array($selectedTable, $selectedValueField)
        );
        $typeRow = $typeResult ? $db->Fetch($typeResult) : array();
        $valueExpression = previewValueExpression($selectedValueField, $typeRow['data_type'] ?? '', 'field_value');
        $previewSql = "SELECT TOP 100 "
                . "CONVERT(nvarchar(max), [{$selectedIdField}]) AS row_id, "
                . "{$valueExpression} "
                . "FROM [dbo].[{$selectedTable}]";
        $previewParams = array();
        $editableWhere = '';
        if ($selectedRowId !== null && $selectedRowId !== '') {
            $previewSql .= " WHERE [{$selectedIdField}] = ?";
            $previewParams[] = $selectedRowId;
            $escapedRowId = str_replace("'", "''", strval($selectedRowId));
            $editableWhere = " WHERE [{$selectedIdField}] = '{$escapedRowId}'";
        }
        $previewSql .= " ORDER BY [{$selectedIdField}] DESC";
        $previewResult = $db->QueryParam($previewSql, $previewParams);
        $previewData = array();
        if ($previewResult) {
            while ($row = $db->Fetch($previewResult)) {
                $previewData[] = array(
                    "row_id" => $row['row_id'],
                    "field_value" => $row['field_value']
                );
            }
        }
        $editablePreviewSql = "SELECT TOP 100 [{$selectedIdField}], [{$selectedValueField}] "
                . "FROM [dbo].[{$selectedTable}]{$editableWhere} ORDER BY [{$selectedIdField}] DESC";
        echo json_encode(array(
            "success" => true,
            "data" => $previewData,
            "sql_query" => $editablePreviewSql
        ));
        exit();

    case "getLogList":

        ###################
        $root = "data";
        $data = array();
//        if ($_REQUEST && !empty($_REQUEST['mode']) && $_REQUEST['mode'] == 'getLogList') {
        // รับค่าจาก tbar ที่ส่งมากรองข้อมูล
        $search_table = !empty($_REQUEST['search_table']) ? trim($_REQUEST['search_table']) : '';
        $search_row_id = !empty($_REQUEST['search_row_id']) ? intval($_REQUEST['search_row_id']) : '';
        $search_key = !empty($_REQUEST['search_key']) ? trim($_REQUEST['search_key']) : '';
        $search_value = isset($_REQUEST['search_value']) ? trim($_REQUEST['search_value']) : '';

        $where = " WHERE 1=1 ";
        $params = array();

        if ($search_table != '') {
            $where .= " AND table_name LIKE ? ";
            $params[] = "%" . $search_table . "%";
        }
        if ($search_row_id != '') {
            $where .= " AND row_id = ? ";
            $params[] = $search_row_id;
        }
        $searchColumns = array(
            'table_name' => 'table_name',
            'row_field' => 'row_field',
            'row_id' => 'row_id',
            'field_name' => 'field_name',
            'old_value' => 'old_value',
            'new_value' => 'new_value',
            'user_id' => 'user_id',
            'date_create' => 'date_create',
            'remarks' => 'remarks'
        );
        if ($search_value !== '' && isset($searchColumns[$search_key])) {
            $where .= " AND CONVERT(varchar(max), " . $searchColumns[$search_key] . ") LIKE ? ";
            $params[] = '%' . $search_value . '%';
        }

        // คำสั่ง SQL ดึงข้อมูล Log (เรียงลำดับจากล่าสุดขึ้นก่อน)
        $sql = "SELECT log_id, table_name, row_id, isnull(row_field,table_name+'_id') as row_field, field_name, old_value, new_value, user_id,
                   CONVERT(varchar, date_create, 120) as date_create, remarks
            FROM NMU_ERPLOG..sys_log_change " . $where . " ORDER BY log_id DESC";
//        echo $db->debugSql($sql, $params);
//        exit();
        // รัน Query ผ่านฟังก์ชันของคุณ เช่น $db->QueryParam($sql, $params)
        $result = $db->QueryParam($sql, $params);

        $data = array();
//            // วนลูป fetch ข้อมูลใส่ array $data ...
// --- แบบที่ 1: กรณี $stmt_log เป็น Object ของ PDO Statement ---
        if ($result) {
            while ($row = $db->Fetch($result)) {
                $data[] = array(
                    "log_id" => intval($row['log_id']),
                    "table_name" => $row['table_name'],
                    "row_id" => $row['row_id'],
                    "row_field" => $row['row_field'],
                    "field_name" => $row['field_name'],
                    "old_value" => $row['old_value'],
                    "new_value" => $row['new_value'],
                    "user_id" => intval($row['user_id']),
                    "date_create" => $row['date_create'], // ใช้ฟิลด์ที่แปลงข้อความแล้ว
                    "remarks" => $row['remarks']
                );
            }
        }
        echo json_encode(array(
            "success" => true,
            "total" => count($data),
            "data" => $data
        ));
        exit();

        break;
//        break;
    case "batchDeleteTable":
        // 1. ตรวจสอบ Session ก่อนเริ่มทำงาน
        if (empty($_SESSION['user_id'])) {
            echo json_encode(array("success" => false, "msg" => "Session หมดอายุ"));
            exit();
        } else {
            $info[1] = $_SESSION['user_id'];
            $info[2] = $_SESSION['dc_cost_id'];
            $info[3] = date('Y-m-d H:i:s'); // วันที่และเวลาปัจจุบัน
        }

        $stmt = false;
        $sql_msg = "";
        $deleted_count = 0;

        try {
            // ดึงค่าก้อน JSON จากฝั่งสคริปต์
            $jsonRaw = $_REQUEST['jsonData'] ?? '';
            $remarks_request = $_REQUEST['remarks'] ?? ''; // รับเหตุผลที่กรอกในหน้าต่าง Window

            if (empty($jsonRaw)) {
                throw new Exception("ไม่พบข้อมูล jsonData ที่ส่งมาจากระบบ");
            }

            // แปลง JSON String กลับมาเป็น Array ของ PHP
            $dataList = json_decode($jsonRaw, true);

            if (!is_array($dataList)) {
                throw new Exception("รูปแบบโครงสร้างข้อมูล JSON ไม่ถูกต้อง");
            }
            if (count($dataList) === 0) {
                throw new Exception("ไม่พบรายการที่ต้องการอัปเดต");
            }

            // เริ่มต้นลูปลบข้อมูลทีละรายการจากก้อน Array ที่ส่งมา
            foreach ($dataList as $row) {

                // กรองความปลอดภัยของชื่อตาราง
                $table = preg_replace('/[^a-zA-Z0-9_]/', '', $row['table_name'] ?? '');

                // ชื่อคอลัมน์ที่เป็นคีย์หลักสำหรับใช้ลบ (เช่น sp_check_period_dtl_id)
                $field = preg_replace('/[^a-zA-Z0-9_]/', '', $row['row_field'] ?? '');
                if (empty($field)) {
                    $field = $table . "_id"; // ค่าเริ่มต้นกรณีไม่มีการส่งมา
                }

                $id = $row['row_id'] ?? null;
                $field_name = preg_replace('/[^a-zA-Z0-9_]/', '', $row['field_name'] ?? ''); // ฟิลด์อ้างอิง (ถ้ามี)
                $oldval = $row['old_value'] ?? ''; // เก็บค่าเดิมไว้ลง Log ก่อนลบออกจากระบบ
                // ตรวจสอบความสมบูรณ์ขั้นพื้นฐาน (สำหรับการลบ ต้องการแค่ตาราง คอลัมน์หลัก และ ID)
                if (empty($table) || empty($field) || empty($id)) {
                    continue; // ข้ามรายการนี้ไปหากข้อมูลไม่สมบูรณ์
                }

                // 2. ทำคำสั่งลบข้อมูล (DELETE) ของรายการปัจจุบัน
                $sql1 = "DELETE FROM {$table} WHERE {$field} = ?; ";
                $arrValue1 = array($id);

                $stmt1 = $db->QueryParam($sql1, $arrValue1);

                if (!$stmt1) {
                    throw new Exception("ไม่สามารถลบข้อมูลในตาราง {$table} (ID: {$id}) ได้");
                }

                // 3. บันทึก LOG การลบข้อมูลลงในระบบ
                $log_remarks = $remarks_request;
                if (empty($log_remarks)) {
                    $log_remarks = "ลบข้อมูลในตาราง {$table} (ผ่านระบบ Ext.batchDelete)";
                }

                $sql_log = "INSERT INTO NMU_ERPLOG..sys_log_change (table_name, row_id, row_field, field_name, old_value, new_value, user_id, date_create, remarks) "
                        . "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

                // ในช่อง new_value จะส่งค่าเป็น "DELETED" หรือค่าว่าง เพื่อให้รู้ว่าแถวนี้ถูกลบไปแล้ว
                $arrValueLog = array($table, $id, $field, $field_name, $oldval, 'DELETED', $info[1], $info[3], $log_remarks);
                $db->QueryParam($sql_log, $arrValueLog);

                $deleted_count++;
            }

            // ตั้งค่าผลลัพธ์เมื่อทำงานสำเร็จครบถ้วน
            $stmt = true;
            $sql_msg = "สำเร็จ: ลบข้อมูลและบันทึก Log เรียบร้อยทั้งหมด " . $deleted_count . " รายการ";

            // ส่ง Response กลับไปให้ฝั่ง ExtJS และตัดการทำงานทันที
            echo json_encode(array("success" => true, "msg" => $sql_msg));
            exit();
        } catch (Exception $e) {
            $stmt = false;
            $sql_msg = "เกิดข้อผิดพลาดในการลบ: " . $e->getMessage();
            error_log($e->getMessage() . " in " . $e->getFile() . " line " . $e->getLine());

//            echo json_encode(array("success" => false, "msg" => $sql_msg));
//            exit();
        }

        break;
    case "batchEditComboTable":
        // 1. ตรวจสอบ Session ก่อนเริ่มทำงาน
        if (empty($_SESSION['user_id'])) {
            echo json_encode(array("success" => false, "msg" => "Session หมดอายุ"));
            exit();
        } else {
            $info[1] = $_SESSION['user_id'];
            $info[2] = $_SESSION['dc_cost_id'];
            $info[3] = date('Y-m-d H:i:s'); // วันที่และเวลาปัจจุบัน
        }

        $stmt = false;
        $sql_msg = "";
        $updated_count = 0;

        try {
            // ดึงค่าก้อน JSON จากฝั่งสคริปต์
            $jsonRaw = $_REQUEST['jsonData'] ?? '';
            $remarks_request = $_REQUEST['remarks'] ?? ''; // รับเหตุผลหลักที่กรอกในหน้าต่าง Window

            if (empty($jsonRaw)) {
                throw new Exception("ไม่พบข้อมูล jsonData ที่ส่งมาจากระบบ");
            }

            // แปลง JSON String กลับมาเป็น Array ของ PHP
            $dataList = json_decode($jsonRaw, true);

            if (!is_array($dataList)) {
                throw new Exception("รูปแบบโครงสร้างข้อมูล JSON ไม่ถูกต้อง");
            }

            // เริ่มต้นลูปอัปเดตข้อมูลทีละตัวเดี่ยวๆ จากก้อน Array ที่ส่งมา
            foreach ($dataList as $row) {

                // กรองความปลอดภัยของชื่อตาราง
                $table = preg_replace('/[^a-zA-Z0-9_]/', '', $row['table_name'] ?? '');

                // ชื่อคอลัมน์ที่เป็นคีย์หลัก (Primary Key เช่น sp_check_period_dtl_id)
                $field = preg_replace('/[^a-zA-Z0-9_]/', '', $row['row_field'] ?? '');
                if (empty($field)) {
                    $field = $table . "_id"; // กรณีไม่ส่งมา ให้ใช้ ชื่อตาราง_id เป็นค่าเริ่มต้น
                }

                $id = $row['row_id'] ?? null;
                $field_name = preg_replace('/[^a-zA-Z0-9_]/', '', $row['field_name'] ?? ''); // ฟิลด์ที่จะแก้ไข (เช่น c_name)
                $val = $row['new_value'] ?? null;
                $oldval = $row['old_value'] ?? null;

                // ตรวจสอบความสมบูรณ์ขั้นพื้นฐานก่อนทำ Query
                if (empty($table) || empty($field) || empty($field_name) || $id === null || $id === '') {
                    throw new Exception("ข้อมูลสำหรับอัปเดตไม่ครบถ้วน");
                }

                // 2. ทำการอัปเดตข้อมูลของรายการปัจจุบัน
                $sql1 = "UPDATE {$table} SET {$field_name} = ? "
                        . " , dc_user_update_id = ? "
                        . " , dc_user_update_cost_id = ? "
                        . " , d_update = ? "
                        . " WHERE {$field} = ?; ";

                $arrValue1 = array($val, $info[1], $info[2], $info[3], $id);
                $stmt1 = $db->QueryParam($sql1, $arrValue1);

                if (!$stmt1) {
                    throw new Exception("ไม่สามารถอัปเดตข้อมูลในตาราง {$table} (ID: {$id}) ได้");
                }

                // 3. กำหนดบันทึก LOG รายการย่อย
                $log_remarks = $remarks_request;
                if (empty($log_remarks)) {
                    $log_remarks = "แก้ไขฟิลด์ {$field_name} เป็นค่า {$val} (ผ่านระบบ Ext.batchEditComboTable)";
                }

                // ปรับคอลัมน์ให้ตรงตามโครงสร้างฐานข้อมูล (เพิ่ม row_field เข้ามาในชุดคิวรี)
                $sql_log = "INSERT INTO NMU_ERPLOG..sys_log_change (table_name, row_id, row_field, field_name, old_value, new_value, user_id, date_create, remarks) "
                        . "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"; // เพิ่มเครื่องหมาย ? เป็น 9 ตัวตามจำนวนคอลัมน์
                // จับคู่ข้อมูลให้ครบทั้ง 9 พารามิเตอร์ตามลำดับของคำสั่ง INSERT
                $arrValueLog = array($table, $id, $field, $field_name, $oldval, $val, $info[1], $info[3], $log_remarks);
                $stmtLog = $db->QueryParam($sql_log, $arrValueLog);
                if (!$stmtLog) {
                    throw new Exception("อัปเดตข้อมูลแล้ว แต่ไม่สามารถบันทึก Log ของตาราง {$table} (ID: {$id}) ได้");
                }

                $updated_count++;
            }

            // ตั้งค่าผลลัพธ์เมื่อลูปทำงานสำเร็จครบถ้วน
            if ($updated_count !== count($dataList)) {
                throw new Exception("จำนวนรายการที่อัปเดตไม่ครบ");
            }
            $stmt = true;
            $sql_msg = "สำเร็จ: อัปเดตและบันทึก Log เรียบร้อยทั้งหมด " . $updated_count . " รายการ";

            // ส่ง Response กลับไปให้ฝั่ง ExtJS เป็น JSON Format
//            echo json_encode(array("success" => true, "msg" => $sql_msg));
        } catch (Exception $e) {
            $stmt = false;
            $sql_msg = "เกิดข้อผิดพลาด: " . $e->getMessage();
            error_log($e->getMessage() . " in " . $e->getFile() . " line " . $e->getLine());

//            echo json_encode(array("success" => false, "msg" => $sql_msg));
        }

        break;
    case "GET_IEDIT_CONTRACT":
        $id = $_REQUEST['sp_tor_contract_id'] ?? 0;
        $sqlCount = "SELECT i_edit FROM sp_tor_contract WHERE sp_tor_contract_id = ?";
        $idit = $db->GetDataBySQL($sqlCount, array($id));
        if ($idit) {
            echo json_encode([
                "success" => true,
                "i_edit" => (int) $idit
            ]);
        } else {
            echo json_encode(["success" => false]);
        }
        exit;
        break;
    case "LIST_HDR_EXIST":
        $mode = @$_REQUEST["mode"];
        $filter = @$_REQUEST["filter"];
        $value = @$_REQUEST["value"];
        $i_read = @$_REQUEST["i_read"];
###################
        $root = "data";
        $data = array();
###################
        $limit = @$_REQUEST["limit"];
        $dir = @$_REQUEST["dir"];
        $sort = @$_REQUEST["sort"];
        $start = @$_REQUEST["start"];

        function get($a) {
            return $a ?? 0;
        }

        if (!get($start)) {
            $start = 0;
        }
        if (!get($limit)) {
            $limit = 20;
        } else {
            $limit = ($limit + $start);
        }
        if (!get($dir)) {
            $dir = "DESC";
        }
        if (!get($sort)) {
            $sort = " s.c_code";
        }

#################################
        $arrParam = array();
        $arrCountParam = array();
        $con = null;
        $conDtl = null;
        $arrParam = array();
        $arrCountParam = array();

        $sqlTempTable = "SELECT  a.sp_mn_contract_hdr_id
                                    ,a.c_name
                                    ,a.sp_contract_id
                                    ,a.sp_po_id
                                    ,a.i_type_fine
                                   /* a.c_arrive_code
                                    a.c_checking_code
                                    a.d_arrive_date
                                    a.d_checking_date1
                                    a.d_checking_date2
                                    a.d_doc_date
                                    a.d_due_date
                                    a.d_start_date
                                    a.d_end_date
                                    a.c_fine_code
                                    a.i_status_checking
                                    a.f_fine_amt
                                    a.f_disc_amt
                                    a.f_total_amt
                                    a.i_enabled
                                    a.dc_user_create_id
                                    a.dc_user_create_cost_id
                                    a.dc_user_create_department_id
                                    a.d_create
                                    a.dc_user_update_id
                                    a.dc_user_update_cost_id
                                    a.dc_user_update_department_id
                                    a.d_update*/
                            , row_number() over (order by a.sp_mn_contract_hdr_id DESC) as row
                            FROM sp_mn_contract_hdr a
                            WHERE EXISTS (SELECT * FROM sp_mn_contract_dtl  WHERE sp_mn_contract_dtl.sp_mn_contract_hdr_id = a.sp_mn_contract_hdr_id)
                            "; //
//         echo  $sqlTempTable; exit;
        $arrParam[] = $start;
        $arrParam[] = $limit;
        $sqlMain = "
                select a.*
                    , s.c_name
                    , s.i_type_fine
                    , s.c_arrive_code
                    , s.c_checking_code
                    , null as sp_contract_po_id
                    , isnull((select c_doc_ref from sp_tor_contract where sp_tor_contract_id = s.sp_contract_id),'') as c_doc_ref
                    , isnull((select c_name FROM NMU.dbo.dc_creditor where dc_creditor_id = b.dc_creditor_id),'')  as dc_creditor_name
                    , null as i_is_po
                    , convert(varchar, s.d_doc_date, 120) as d_doc_date
                    , convert(varchar, s.d_start_date, 120) as d_start_date
                    , convert(varchar, s.d_end_date, 120) as d_end_date
                    , s.f_total_amt
                    , (select top 1 c_name from dbo.po_creditor where po_creditor_id=b.dc_creditor_id)  as po_creditor_idTxt
                    , (select top 1 c_name from dbo.dc_cost where dc_cost_id=c.dc_cost_id)  as dc_cost_idTxt
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_create_id) as c_create_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_create_cost_id) as c_cost_creat_name
                        , convert(varchar, s.d_create, 120) as d_create
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_update_id) as c_update_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_update_cost_id) as c_cost_update_name
                        , convert(varchar, s.d_update, 120) as d_update
                from ({$sqlTempTable}) a
                inner join sp_mn_contract_hdr s on a.sp_mn_contract_hdr_id = s.sp_mn_contract_hdr_id
                inner join sp_tor_contract b on b.sp_tor_contract_id = s.sp_contract_id
                inner join sp_tor c on c.tor_id = b.sp_tor_id
                WHERE row > ? and row <= ?";
//         echo $sqlMain;
//         exit;
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = $start + 1;
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "sp_mn_contract_hdr_id" => $row["sp_mn_contract_hdr_id"],
                "sp_contract_po_id" => $row["sp_contract_po_id"],
                "sp_contract_id" => $row["sp_contract_id"] == '' ?? 0,
                "sp_po_id" => $row["sp_po_id"] == '' ?? 0,
                "i_is_po" => $row["i_is_po"],
                "txtsp_contractID" => $row["c_doc_ref"],
                "c_name_in" => $row["c_name"],
                "dc_creditor_name" => $row["dc_creditor_name"],
                "c_doc_ref" => $row["c_doc_ref"],
                "i_type_fine" => $row["i_type_fine"],
                "c_checking_code" => $row["c_checking_code"],
                "d_doc_date" => $row["d_doc_date"] == '' ? '' : $date->extDateBuddha($row["d_doc_date"]),
                "d_start_date" => $row["d_start_date"] == '' ? '' : $date->extDateBuddha($row["d_start_date"]),
                "d_end_date" => $row["d_end_date"] == '' ? '' : $date->extDateBuddha($row["d_end_date"]),
                "f_total_amt" => number_format($row["f_total_amt"], 2),
                "dc_cost_idTxt" => $row["dc_cost_idTxt"],
                "dc_user_create_id" => $row["c_create_name"],
                "dc_user_create_cost_id" => $row["c_cost_creat_name"],
                "d_tor_date" => ((empty($row["d_tor_date"])) ? "" : $date->extDateBuddha($row["d_tor_date"])), //d_tor_date
                "d_create" => $date->extDateBuddha($row["d_create"]), //
                "dc_user_update_id" => $row["c_update_name"],
                "dc_user_update_cost_id" => $row["c_cost_update_name"],
                "d_update" => $date->extDateBuddha($row["d_update"]),
            );

            ${$root}[] = $temp;
        }
        $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
        $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
        echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
        exit;
        break;
    case "LIST_SUB_PERIOD_HDR":
        $mode = @$_REQUEST["mode"];
        $filter = @$_REQUEST["filter"];
        $value = @$_REQUEST["value"];
        $i_read = @$_REQUEST["i_read"];
###################
        $root = "data";
        $data = array();
###################
        $limit = @$_REQUEST["limit"];
        $dir = @$_REQUEST["dir"];
        $sort = @$_REQUEST["sort"];
        $start = @$_REQUEST["start"];

        function get($a) {
            return $a ?? 0;
        }

        if (!get($start)) {
            $start = 0;
        }
        if (!get($limit)) {
            $limit = 20;
        } else {
            $limit = ($limit + $start);
        }
        if (!get($dir)) {
            $dir = "DESC";
        }
        if (!get($sort)) {
            $sort = " s.c_code";
        }

#################################
        $arrParam = array();
        $arrCountParam = array();
        $act = $_REQUEST['type'] ?? null;
        $wh = "";
        $c_code = $_REQUEST['c_code'] ?? null;
        $ienabled = $_REQUEST['i_enabled'] ?? 1;

        if ($act == "SEARCH") {
            if ($_REQUEST["value"] != "") {

                if ($_REQUEST["filter"] == "c_code_po") {
                    $wh .= " AND ac.c_code LIKE '%" . $_REQUEST["value"] . "%' ";
                } else if ($_REQUEST["filter"] == "c_code") {
                    $wh .= " AND cc.c_code LIKE '%" . $_REQUEST["value"] . "%' ";
                } else if ($_REQUEST["filter"] == "dc_creditor_tax_numbe") {
                    $wh .= " AND b.c_tax_number_imp LIKE '%" . $_REQUEST["value"] . "%' ";
                } else if ($_REQUEST["filter"] == "c_arrive_code") {
                    $wh .= " AND cc.c_arrive_code LIKE '%" . $_REQUEST["value"] . "%' ";
                } else if ($_REQUEST["filter"] == "c_overlap") {
                    $wh .= " AND cc.c_overlap LIKE '%" . $_REQUEST["value"] . "%' ";
                } else if ($_REQUEST["filter"] == "dc_creditor_name") {
                    $wh .= " AND bbb.c_name LIKE '%" . $_REQUEST["value"] . "%' ";
                } else if ($_REQUEST["filter"] == "dc_creditor_tax_numbe") {
                    $wh .= " AND bbb.c_tax_number_imp LIKE '%" . $_REQUEST["value"] . "%' ";
                } else if ($_REQUEST["filter"] == "d_code") {
                    $wh .= " AND (select top 1 c_code from NMU_EIS..po_working_dtl where po_working_hdr_id  = cc.po_working_hdr_id )   LIKE '%" . $_REQUEST["value"] . "%' ";
                }
            }
            if ($_REQUEST["i_budget_year"] > 0) {
                $wh .= " AND cc.i_yyyy = " . $_REQUEST["i_budget_year"];
            }
            if ($_REQUEST["i_budget_year_overlap"] > 0) {
                $wh .= " AND cc.i_yyyy_overlap = " . $_REQUEST["i_budget_year_overlap"];
            }
            if ($_REQUEST["i_year_contract"] > 0) {
                $wh .= " AND RIGHT(ac.c_code,4) like '%" . ($_REQUEST["i_year_contract"] + 543) . "%'";
            }
            if ($_REQUEST["i_type_contract"] > 0) {
                $wh .= " AND  (select  isnull(i_type_contract,0) as i_type_contract from sp_tor where  tor_id = ac.sp_tor_id )   = " . $_REQUEST["i_type_contract"];
            }
            if ($_REQUEST["i_product_type"] > 0) {
                $i_product_type = $_REQUEST["i_product_type"];
                if ($_REQUEST["i_product_type"] == 3) {
                    $i_product_type = 0;
                }
                $wh .= " AND  f.i_product_type  = " . $i_product_type;
            }
            if ($_REQUEST["i_status"] > 0) {
                $wh .= " AND CASE
            WHEN cc.i_status_billing IS NULL AND cc.i_status_checking IS NULL AND cc.c_code IS NULL THEN 1
            WHEN cc.i_status_billing IS NULL AND cc.i_status_checking = 1 AND cc.c_code IS NOT NULL AND ccc.c_code IS NULL THEN 2
            WHEN cc.i_status_billing IS NULL AND cc.i_status_checking = 1 AND cc.c_code IS NOT NULL AND ccc.c_code IS NOT NULL THEN 3
            WHEN cc.i_status_billing = 4 AND cc.i_status_checking = 1 AND cc.c_code IS NOT NULL AND ccc.c_code IS NOT NULL AND cc.po_working_hdr_id IS NULL THEN 4
            WHEN cc.i_status_billing = 4 AND cc.i_status_checking = 1 AND cc.c_code IS NOT NULL AND ccc.c_code IS NOT NULL AND cc.po_working_hdr_id IS NOT NULL THEN 5
            ELSE 0  END = " . $_REQUEST["i_status"];
            }
        }


        $i_level = $_SESSION['i_level'];
        $dc_department = $_SESSION['dc_department_id'];
        $sp_emp_id = $_SESSION['sp_emp_id'];
// print_r($_SESSION);
        $where = null;
        $i_show = $_REQUEST['i_show'] ?? 0;
        if ($i_level == 1 && $i_show != 1) {
            $where = ' ';
        } else if ($i_level == 2 && $i_show != 1) {
            $where = ' and bb.dc_department_id = ' . $dc_department;
        } else if ($i_level == 3 || $i_show == 1) {
            $where = ' and bb.sp_emp_id = ' . $sp_emp_id;
        }

        $sqlTempTable = "select cc.sp_check_period_hdr_id,s.sp_po_id
                                , cc.sp_tor_hdr_period_id
				, cc.c_arrive_code
				, cc.c_checking_code
				, cc.c_code as c_check_code
				, CASE WHEN ISNULL(s.sp_po_id,0) > 0
                                THEN 1
                                ELSE 0
                 END AS i_is_po
				 , CASE WHEN ISNULL(s.sp_po_id,0) > 0
                                THEN (select top 1 sp_po_id from sp_po_hdr where sp_po_id=s.sp_po_id)
                                ELSE (select top 1 sp_tor_contract_id from sp_tor_contract where sp_tor_contract_id=s.sp_contract_id)
                 END AS id
				 , CASE WHEN ISNULL(s.sp_po_id,0) > 0
                                THEN (select top 1  sp_tor_contract_id from sp_po_hdr where sp_po_id=s.sp_po_id)
                                ELSE (select top 1  sp_tor_contract_id from sp_tor_contract where sp_tor_contract_id=s.sp_contract_id)
                 END AS sp_tor_contract_id
                , isnull(convert(varchar, s.d_start_date, 120),'') as d_start_date
                , isnull(convert(varchar, s.d_end_date, 120),'') as d_end_date
                , cc.i_step
                , cc.i_menu
                , cc.sp_emp_id
                , row_number() over (order by cc.sp_check_period_hdr_id DESC) as row
                from dbo.sp_mn_contract_hdr s
                right join dbo.sp_check_period_hdr cc on cc.sp_mn_contract_hdr_id=s.sp_mn_contract_hdr_id
                inner join sp_check_period_dtl f on cc.sp_check_period_hdr_id = f.sp_check_period_hdr_id
                left join sp_check_billing_items ccc on cc.sp_check_period_hdr_id = ccc.sp_check_period_hdr_id
                inner join dbo.sp_tor_contract ac on s.sp_contract_id = ac.sp_tor_contract_id
                inner join dbo.sp_emp bb on bb.sp_emp_id = s.sp_emp_id
                where cc.c_arrive_code is not null
                and cc.i_enabled = {$ienabled}
                "
                . "{$where}"
                . "{$wh}"
                . "-- and (isnull(i_step,0) <> 3)
                group by cc.sp_check_period_hdr_id,s.sp_po_id
                , cc.i_step
                , cc.i_menu
                        , cc.sp_tor_hdr_period_id
                        , cc.c_arrive_code
                        , cc.c_checking_code
                        , cc.c_code
                        , cc.sp_emp_id
                        , s.sp_po_id
                        , s.sp_contract_id
                        , s.d_start_date
                        , s.d_end_date
                        , s.sp_mn_contract_hdr_id
                        ";
        $arrParam[] = $start;
        $arrParam[] = $limit;
        $sqlMain = "select a.*
        , case when  bb.i_type_bg = 1 and isnull(b.i_overlap,0) =  0  then  1
            when  isnull(b.i_overlap,0) =  3  then 2
            when  isnull(b.i_overlap,0) =  2  then 3
            when  isnull(b.i_overlap,0) =  1  then 4
            when  isnull(b.i_overlap,0) =  0  then 5
            else 0
            end as  i_chk_bg
            , case when b.i_overlap = 3 then  isnull(c.c_overlap,'ยังไม่ได้เลือกใบกัน')
            when b.i_overlap = 1  then isnull(b.c_overlap,'ยังไม่ได้เลือกใบกัน')
            when b.i_overlap = 2  then isnull(b.c_overlap,'ยังไม่ได้เลือกใบกัน')
            else  'ใช้เงินปีงบปัจุบัน'
            end  as chek_overlap
            , case when c.i_status_billing  is null  and  c.i_status_checking  is null and c.c_code is null then 1 -- ยังไม่ตรวจรับ
            when c.i_status_billing  is null  and  c.i_status_checking  = 1 and c.c_code is not null and cc.c_code  is  null then 2 -- ตรวจรับ
            when c.i_status_billing  is null  and  c.i_status_checking  = 1 and c.c_code is not null and cc.c_code  is not null  then 3   -- ออกเลขวางบิลแล้ว
            when c.i_status_billing  = 4  and  c.i_status_checking  = 1 and c.c_code is not null and cc.c_code  is not null  and  c.po_working_hdr_id is null   then 4   -- ผ่านรายการวางบิลแล้วรอเบิก
            when c.i_status_billing  = 4  and  c.i_status_checking  = 1 and c.c_code is not null and cc.c_code  is not null  and  c.po_working_hdr_id is not null   then 5   -- ผ่านรายการวางบิลแล้วรอเบิก
            else 0  end as i_status_chk
            , (SELECT sum(f_net_total_price) FROM sp_check_period_dtl WHERE sp_check_period_hdr_id=c.sp_check_period_hdr_id) AS f_net_total_price
            , isnull((select top 1 c_name from NMU.dbo.dc_creditor where dc_creditor_id=b.dc_creditor_id),'')  as dc_creditor_idTxt
            , c.dc_creditor_id
            ,(select top 1  sp_check_period_dtl_id from sp_check_period_dtl where sp_tor_hdr_period_id = d.sp_tor_hdr_period_id) as sp_check_period_dtl_id
            , (select top 1  sp_tor_dtl_period_id from sp_tor_dtl_period aaa where sp_tor_hdr_period_id = d.sp_tor_hdr_period_id) as sp_tor_dtl_period_id
	    , (select top 1  i_yyyy from sp_tor where tor_id = b.sp_tor_id) as i_yyyy
            , (select top 1  i_period from sp_tor_hdr_period where sp_tor_hdr_period_id = a.sp_tor_hdr_period_id) as i_period

            , CASE
                WHEN ISNULL(a.i_is_po,0) = 0
                THEN  (select top 1  c_code from sp_tor_contract where sp_tor_contract_id=a.id)
                ELSE (select top 1  c_code from sp_po_hdr where sp_po_id=a.id) END AS c_code
        , b.sp_tor_id
        , isnull(convert(varchar, c.d_checking_date, 120),'') as d_checking_date
        , isnull(convert(varchar, c.d_doc_arrive_dt, 120),'') as d_doc_arrive_dt
        , isnull((select top 1  c_name from dbo.sp_emp where sp_emp_id=c.sp_emp_id),'') as withdraw_name
        --, isnull((select top 1 i_is_waiting from sp_withdraw_item where i_is_waiting =1 and sp_check_period_hdr_id=c.sp_check_period_hdr_id),0) as i_request
        , c.i_is_waiting as i_request
        , b.dc_cost_id
        , b.sp_tor_id
        , case when c.i_yyyy_overlap is null  and b.i_yyyy_overlap is null
            then 	 (select top 1  i_yyyy from sp_tor where tor_id = b.sp_tor_id)
            when c.i_yyyy_overlap  is null  then b.i_yyyy_overlap
            when b.i_yyyy_overlap is null   then c.i_yyyy_overlap
            else
		c.i_yyyy_overlap  end as c_yyyy
        , isnull(c.i_yyyy_overlap,b.i_yyyy_overlap) as  i_yyyy_overlap
        , b.i_yyyy_overlap2
        , b.c_overlap2
        , c.c_overlap,b.i_overlap,c.bg_reserve_overlap_id
        , c.i_overlap as i_overlapcheck
        -- ตรวจสอบประเภทจองเงินจากตารางหัวข้องวด (d) หรือตาราง sp_check_period_hdr (b)
        -- คั่นไว้เผื่อใช้เพื่อ debug  , d.i_pr_type1
        -- ถ้าเป็นเงินอุดหนุน (i_type_bg = 4) บังคับเป็นเงินแผน
       -- , case when bb.i_type_bg = 4 then  1  else  isnull(b.i_pr_type1, d.i_pr_type1) end as i_pr_type1
       ,  d.i_pr_type1 as i_pr_type1
        , b.i_pr_type2 as tc_i_pr_type2
        , CASE WHEN b.i_pr_type2 = 1 THEN 'เงินแผน' WHEN b.i_pr_type2 = 2 THEN 'เงินงวด' ELSE 'ไม่ระบุ' END as booking_type_name
        , (select top 1 i_pr_type2 from sp_tor where tor_id=b.sp_tor_id) as t_i_pr_type2
        , CASE WHEN (select top 1 i_pr_type2 from sp_tor where tor_id=b.sp_tor_id) = 1 THEN 'เงินแผน' WHEN (select top 1 i_pr_type2 from sp_tor where tor_id=b.sp_tor_id) = 2 THEN 'เงินงวด' ELSE 'ไม่ระบุ' END as booking_type_name_tor
        , bb.i_type_bg
      --  , (select top 1  po_expense_id from sp_tor where tor_id = b.sp_tor_id) as po_expense_id
      , f.po_expense_id
        , (select top 1  c_code from  nmu..bg_expense cc where bb.po_expense_id = cc.bg_expense_id)
		+' : '
        + (select top 1  c_name from nmu..bg_expense ee where bb.po_expense_id = ee.bg_expense_id ) as expense_name
        , (select top 1  c_name from dc_expense_budget_type eee where bb.dc_expense_budget_type_id = eee.dc_expense_budget_type_id ) as budget_type
        , f.dc_bg_budget_type_id as dc_expense_budget_type_id
        , d.i_is_last
        , c.c_billing_code
        , (select i_type from sp_type_bg where i_value =  bb.i_type_bg  ) as sp_type_bg
        ,(select top 1 convert(varchar, DATEADD(year, 543, d_billing_date), 105) from  dbo.sp_bg_billing_dtl where c.d_doc_arrive_dt  between d_start_date and d_end_date ) as d_billing_date
        , b.c_name as c_name
        , b.sp_tor_id
        , b.sp_emp_id
        , isnull((select top 1 sp_cate_id from NMU_ERP.dbo.[view_sp_tor_work_socore] where sp_tor_id=b.sp_tor_id order by sp_cate_id desc),0) as sp_cate_id
        , c.check_pdf
        , c.c_egp_no
        , c.i_is_register
        , f.i_hire_type
        , f.i_product_type
        , f.i_qty
        , c.po_working_hdr_id
        , c.i_register
        , bb.dc_cost2_id as dc_cost_id2
        ,case when   isnull (b.i_overlap,0) != 3 and  isnull(bb.i_type_bg,0) = 4    then 1 when   isnull(b.i_overlap,0) = 3   then  2
        else  0 end   as i_status_overlap  -- 0 ปกติ  1 กันเหลื่อมยังไม่ก่อหนี้    2 กันเหลื่อม ก่อหนี้แล้ว
        , c.i_is_upload_chk
        , cc.c_code as c_code_billing
        , (select top 1 c_code from NMU_EIS..po_working_dtl where po_working_hdr_id  = c.po_working_hdr_id ) as c_code_po
        , isnull((select top 1 sp_cate_id from NMU_ERP.dbo.[view_sp_tor_work_socore] where sp_tor_id=b.sp_tor_id order by sp_cate_id desc),0) as sp_cate_id
        , isnull((select top 1 i_send_gl from sp_gl_monthly_dtl where sp_gl_monthly_hdr_id = e.sp_gl_monthly_hdr_id and  f_cr >  0  and i_enabled = 1),0) as i_send_gl_cr
        --, isnull((select top 1  i_send_gl from sp_gl_monthly_dtl where sp_gl_monthly_hdr_id = e.sp_gl_monthly_hdr_id and  f_dr >  0  and i_enabled = 1),0) as i_send_gl_dr
        /*, case when isnull(acc.i_status,0)  = 1 then 99
        when isnull(acc.i_status,0)  = 2 then  9
        else  isnull((select top 1  i_send_gl from sp_gl_monthly_dtl where sp_gl_monthly_hdr_id = e.sp_gl_monthly_hdr_id and  f_dr >  0  and i_enabled = 1),0)
        end as i_send_gl_dr */
        , case when isnull(acc.i_status,0)  = 1 then 99  else  dc.i_send_jv end  as i_send_gl_dr
       , isnull((select top 1  imp_assetall_supplies_hdr_id from NMU_ASSET.dbo.imp_assetall_supplies_hdr where sp_check_period_hdr_id = a.sp_check_period_hdr_id  and   i_enable = 1),0) as imp_assetall_supplies_hdr_id
        , isnull((select top 1  po_working_hdr_id from " . DB_NMU_EIS . "po_working_hdr where po_working_hdr_id = c.po_working_hdr_id and   i_sub_status not in('3.00','0.30') and  i_enable = 1),0) as po_working_hdr_id_edit

        ,bb.i_working_type
        from ({$sqlTempTable}) a "
                . " inner join sp_tor_contract b on a.sp_tor_contract_id = b.sp_tor_contract_id "
                . " inner join sp_check_period_hdr c on c.sp_check_period_hdr_id = a.sp_check_period_hdr_id"
                . " inner join sp_check_period_dtl f on c.sp_check_period_hdr_id = f.sp_check_period_hdr_id "
                . " left join sp_check_billing_items cc on c.sp_check_period_hdr_id = cc.sp_check_period_hdr_id"
                . " inner join sp_tor_hdr_period d on d.sp_tor_hdr_period_id = c.sp_tor_hdr_period_id"
                . " left join sp_gl_monthly_hdr e on  c.sp_tor_hdr_period_id = e.sp_tor_hdr_period_id and e.i_enabled = 1 "
                . " left join " . DB_CENTER . "dc_map_send_ap dc on  dc.sp_check_period_hdr_id = c.sp_check_period_hdr_id and dc.i_enable = 1 and dc.i_sys = 1 "
                . " left join sp_check_period_disable_acc acc on c.sp_check_period_disable_acc_id = acc.sp_check_period_disable_acc_id  and acc.i_enable = 1 "
                . " left join  sp_tor bb on b.sp_tor_id = bb.tor_id "
                . " WHERE row > ? and row <= ?   ";
        if (@$_REQUEST["show_sql"]) {
            /*             * ****echo sql***** */
            $sql = (@$sqlMain) ? $sqlMain : $sql;
            $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());

            $sql = str_replace('?', '#-#', $sql);
            foreach ($arr as $fld => $value) {
                $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
            }
            echo $sql;
            exit;
            /*             * ***************** */
        }

        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = $start + 1;
        $i_chk_bgTxt = null;
        $onePeriodOneBgBudget = false;
        while ($row = $db->Fetch($stmt)) {
            $sqlOne = "SELECT h.sp_tor_hdr_period_id,h.sp_tor_contract_id, COUNT(*) AS total_records
                    FROM sp_tor_hdr_period h
                    INNER JOIN sp_tor_contract c ON c.sp_tor_contract_id = h.sp_tor_contract_id
                    WHERE ISNULL(c.dc_expense_budget_type2_id, 0) = 0
                      AND ISNULL(c.dc_expense_budget_type3_id, 0) = 0
                      AND h.i_enabled =1 AND c.i_enabled =1 and h.i_is_last = 1 and h.sp_tor_hdr_period_id = ?
                    GROUP BY h.sp_tor_contract_id ,h.sp_tor_hdr_period_id
                    HAVING COUNT(*) = 1";
            $f1 = $db->GetDataBySQL($sqlOne, [$row["sp_tor_hdr_period_id"]]);
            if ($f1) {
                $onePeriodOneBgBudget = true;
            }

            switch (intval($row["i_chk_bg"])) {
                case 0:
                    $i_chk_bg = "color:#FF0000";
                    $i_chk_bgTxt = "ติดต่อ admin";
                    break;
                case 1:
                    $i_chk_bg = "color:#116CEF";
                    $i_chk_bgTxt = "ใช้เงินปีงบปัจจุบัน";
                    break;
                case 2:
                    $i_chk_bg = "color:#b085f5";
                    $i_chk_bgTxt = "ใช้เงินกันเหลื่อมก่อหนี้แล้ว";
                    break;
                case 3:
                    $i_chk_bg = "color:#CD8114";
                    $i_chk_bgTxt = "ใช้เงินกันเหลื่อมยังไม่ก่อหนี้ - จองใบกันแล้ว";
                    break;
                case 4:
                    $i_chk_bg = "color:#FF00FF";
                    $i_chk_bgTxt = "ใช้เงินกันเหลื่อมยังไม่ก่อหนี้ - ยังไม่จองใบกัน";
                case 5:
                    $i_chk_bg = "color:#06e7fe";
                    $i_chk_bgTxt = "โครงการต่อเนื่อง ใช้เงินปีงบปัจจุบัน";
                    break;
            };
            $i_product_type = null;
            switch (intval($row["i_product_type"])) {
                case 0:
                    $i_product_type = "<b style='color:#116CEF'>ไม่ระบุของ</b>";
                    break;
                case 1:
                    $i_product_type = "<b style='color:#116CEF'>วัสดุ</b>";
                    break;
                case 2 && $row["i_is_register"] == 0:
                    $i_product_type = "<b style='color:#116CEF'>ครุภัณฑ์</b>";
                    break;
                case 2 && $row["i_is_register"] == 1:
                    $i_product_type = "<b style='color:#116CEF'>ครุภัณฑ์ (ขึ้นทะเบียนแล้ว)</b>";
                    break;
            };
            $i_status_chk = null;
            switch (intval($row["i_status_chk"])) {
                case 0:
                    $i_status_chk = "<b style='color:#FF00FF'>ติดต่อแอดมิน</b>";
                    break;
                case 1:
                    $i_status_chk = "<b style='color:#FF00FF'>รอตรวจรับ</b>";
                    break;
                case 2:
                    $i_status_chk = "<b style='color:#FF00FF'>รอวางบิล</b>";
                    break;
                case 3:
                    $i_status_chk = "<b style='color:#FF00FF'>ออกเลขวางบิล</b>";
                    break;
                case 4:
                    $i_status_chk = "<b style='color:#FF00FF'>ผ่านวางบิลแล้ว(รอเบิก)</b>";
                    break;
                case 5:
                    $i_status_chk = "<b style='color:#FF00FF'>เบิกแล้ว</b>";
                    break;
                // case 5 && $row["i_product_type"] ==2   :    $i_status_chk = "<b style='color:#FF00FF'>ขึ้นทะเบียนครุภัณฑ์</b>";
                // break;
            };

            $i_send_gl_dr = null;
            switch (intval($row["i_send_gl_dr"])) {
                case 0:
                    $i_send_gl_dr = "<b style='color:#b085f5'>-</b>";
                    break;
                case null:
                    $i_send_gl_dr = "<b style='color:#b085f5'>-</b>";
                    break;
                case 1:
                    $i_send_gl_dr = "<b style='color:#b085f5'>-</b>";
                    break;
                case 2:
                    $i_send_gl_dr = "<b style='color:#b085f5'>-</b>";
                    break;
                case 3:
                    $i_send_gl_dr = "<b style='color:#b085f5'>รอบันทึกบัญชี</b>";
                    break;
                case 4:
                    $i_send_gl_dr = "<b style='color:#b085f5'>บันทึกบัญชีแล้ว : รอยืนยัน GX</b>";
                    break;
                case 5:
                    $i_send_gl_dr = "<b style='color:#b085f5'>บันทึกบัญชีแล้ว : GX</b>";
                    break;
                case 6:
                    $i_send_gl_dr = "<b style='color:#b085f5'>บันทึกบัญชีแล้ว : GL</b>";
                    break;
                case 9:
                    $i_send_gl_dr = "<b style='color:#FF0000'>ยกเลิกบันทึกบัญชี </b>";
                    break;
                case 99:
                    $i_send_gl_dr = "<b style='color:#FFA500'>ส่งคำร้องการยกเลิกหาบัญชีแล้ว </b>";
                    break;
                // 3,4,5,6,99
            };
            $i_chk_bgTxt = "<b style='color:#06e7fe'>" . $i_chk_bgTxt . "</b>";
            // i_send_gl_dr
            // po_working_hdr_id_edit
            $subSql = "select top 1 "
                    . " i_purchase"
                    . ", i_hire_type "
                    . ", i_product_type"
                    . ",(select c_name from dbo.sp_emp where sp_emp_id=sp_tor.sp_emp_id) as emp_name "
                    . "from NMU_ERP.dbo.sp_tor where tor_id=?";

            $f1 = $db->GetDataBySQL($subSql, array($row["sp_tor_id"]));

            $statusCode = "APWCODE"; //รอออกเลข
            $statusCode = "APWAMACC"; //ออกเลขรอขึ้นครุภัณฑ์
            $statusCode = "APAMACCD"; //ออกเลขรอขึ้นครุภัณฑ์รอเบิก
            $statusCode = "APWAMLAST"; //ได้ของงวดสุดท้าย
            $statusCode = "APAMONWP"; //ขุึ้นครุภัณฑ์รอยืนยันก่อนเบิก
            $statusCode = "APAMONWP"; //ได้ของระหว่างงวด

            $statusCode = "APDRETRUN01"; //ทักท้วง
            $statusCode = "APDPAY"; //เบิก
            $statusCode = "APDPAYEND"; //จ่าย
            $statusCode = "GX01"; //ดึงรายการ GX
            $statusCode = "GX02"; //GX
            $statusCode = "GL01"; //GL
            // i_type_bg !=1 แต่ i_yyyy now() แก้เป็น i
            // c_code_overlap = bg_expense_id <> checkDtl.bg_expense_id update => checkDtl.bg_expense_id = bg_expense_id
            //

            switch (intval($row["i_register"])) {
                case 0:
                    $i_status_all = "<b style='color:#FF00FF'></b>";
                    break;
                case 1:
                    $i_status_all = "<b style='color:#FF00FF'>รอตรวจรับ</b>";
                    break;
                case 2:
                    $i_status_chk = "<b style='color:#FF00FF'>รอวางบิล</b>";
                    break;
                case 3:
                    $i_status_chk = "<b style='color:#FF00FF'>ออกเลขวางบิล</b>";
                    break;
                case 4:
                    $i_status_chk = "<b style='color:#FF00FF'>ผ่านวางบิลแล้ว(รอเบิก)</b>";
                    break;
                case 5:
                    $i_status_chk = "<b style='color:#FF00FF'>เบิกแล้ว</b>";
                    break;
            };
            $row["i_is_waiting"] = $row["i_request"]; //i_request
            $txtRed = "";
            if ($row["c_check_code"] != "" && $row["i_is_waiting"] == 1 && $row["i_step"] == 3) {
                $txtRed = "<font color=red>ส่งแก้ไข</font>";
            } else if ($row["c_check_code"] != "" && $row["i_is_waiting"] == 0 && $row["i_step"] == 4) {
                $txtRed = "<font color=blue>ส่งแก้ไขแล้ว</font>";
            }

            $temp = array(
                "no" => $i++,
                "id" => intVal($row["sp_tor_hdr_period_id"]),
                "i_chk_bg" => intval($row["i_chk_bg"]),
                "i_register" => intval($row["i_register"]),
                "onePeriodOneBgBudget" => $onePeriodOneBgBudget,
                "c_egp_no" => $row["c_egp_no"],
                "dc_cost_id2" => intVal($row["dc_cost_id2"]),
                "i_status_overlap" => intval($row["i_status_overlap"]),
                "i_chk_bgTxt" => $i_chk_bgTxt,
                "i_product_typeTxt" => $i_product_type,
                "i_status_chkTxt" => $i_status_chk,
                "c_code_po" => $row["c_code_po"],
                "po_working_hdr_id_edit" => $row["po_working_hdr_id_edit"],
                "i_is_register" => $row["i_is_register"],
                "imp_assetall_supplies_hdr_id" => $row["imp_assetall_supplies_hdr_id"],
                "i_status_chk" => $row["i_status_chk"],
                "chek_overlap" => $row["chek_overlap"],
                "c_code_billing" => $row["c_code_billing"],
                "po_working_hdr_id" => intVal($row["po_working_hdr_id"]),
                "sp_tor_id" => intVal($row["sp_tor_id"]),
                "i_send_gl_cr" => intVal($row["i_send_gl_cr"]),
                "i_send_gl_dr" => intVal($row["i_send_gl_dr"]),
                "gl_dr" => $i_send_gl_dr,
                "sp_check_period_hdr_id" => intval($row["sp_check_period_hdr_id"]),
                "i_working_type" => intval($row["i_working_type"]),
                "sp_tor_dtl_period_id" => intVal($row["sp_tor_dtl_period_id"]),
                "sp_check_period_dtl_id" => intval($row["sp_check_period_dtl_id"]),
                "i_request" => intval($row["i_request"]),
                "sp_type_bg" => intval($row["sp_type_bg"]),
                "sp_cate_id" => intval($row["sp_cate_id"]),
                "sp_emp_id" => intval($row["sp_emp_id"]),
                "i_step" => intval($row["i_step"]),
                "check_pdf" => intval($row["check_pdf"]),
                "i_is_upload_chk" => $row["i_is_upload_chk"],
            "i_yyyy_overlap" => intval($row["i_yyyy_overlap"]) == 0 ? intval($BudgetYear) : intval($row["i_yyyy_overlap"]),
            "i_yyyy_overlap2" => intval($row["i_yyyy_overlap2"]),
            "c_overlap2" => $row["c_overlap2"],
            "d_billing_date" => $row["d_billing_date"],
                "c_overlap" => $row["c_overlap"],
                "c_billing_code" => $row["c_billing_code"],
                "i_overlap" => $row["i_overlap"],
                "i_type_bg" => $row["i_type_bg"],
                "i_overlapcheck" => $row["i_overlapcheck"],
                "bg_reserve_overlap_id" => $row["bg_reserve_overlap_id"],
                "i_menu" => intval($row["i_menu"]),
                "f_net_total_price" => number_format($row["f_net_total_price"], 2),
                "c_code" => $row["c_code"],
                "c_contract_code" => $row["c_check_code"] . $txtRed,
                "c_checking_code" => $row["c_check_code"],
                "c_arrive_code" => $row["c_arrive_code"],
                "i_is_last" => $row["i_is_last"],
                "c_name" => $row["c_name"],
                "expense_name" => $row["expense_name"],
                "budget_type" => $row["budget_type"],
                "po_expense_id" => $row["po_expense_id"],
                "dc_expense_budget_type_id" => $row["dc_expense_budget_type_id"],
                "sp_tor_contract_id" => intVal($row["sp_tor_contract_id"]),
                "dc_cost_id" => intVal($row["dc_cost_id"]),
                "sp_tor_id" => intVal($row["sp_tor_id"]),
                "sp_tor_hdr_period_id" => intVal($row["sp_tor_hdr_period_id"]),
                "i_period" => $row["i_period"],
                "c_yyyy" => intVal($row["c_yyyy"] + 543),
                "use_yyyy" => intVal(date('Y') + 543),
                "i_yyyy" => intVal($row["i_yyyy"]),
                "i_pr_type1" => intVal($row["i_pr_type1"]),
                "i_pr_type" => intVal($row["tc_i_pr_type2"]),
                "tc_i_pr_type2" => intVal($row["tc_i_pr_type2"]),
                "booking_type_name" => $row["booking_type_name"],
                "t_i_pr_type2" => intVal($row["t_i_pr_type2"]),
                "booking_type_name_tor" => $row["booking_type_name_tor"],
                "i_is_po" => intVal($row["i_is_po"]),
                "i_purchase" => intVal($f1["i_purchase"]),
                "i_hire_type" => intVal($row["i_hire_type"]),
                "i_product_type" => intVal($row["i_product_type"]),
                "withdraw_name" => $row["withdraw_name"],
                "emp_name" => $f1["emp_name"],
                "dc_creditor_id" => intVal($row["dc_creditor_id"]),
                "dc_creditor_name" => $row["dc_creditor_idTxt"],
                "d_doc_arrive_dt" => ((empty($row["d_doc_arrive_dt"])) ? "" : $date->extDateBuddha($row["d_doc_arrive_dt"])), //d_tor_date
                "d_checking_date" => ((empty($row["d_checking_date"])) ? "" : $date->extDateBuddha($row["d_checking_date"])), //d_tor_date
                "d_start_date" => ((empty($row["d_start_date"])) ? "" : $date->extDateBuddha($row["d_start_date"])), //d_tor_date
                "d_end_date" => ((empty($row["d_end_date"])) ? "" : $date->extDateBuddha($row["d_end_date"])), //d_tor_date
            );

            ${$root}[] = $temp;
        }
        $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
        $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
        echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
        exit;
        break;
    case "LIST_PERIOD_SUB_HDR":
//
###########################################
        $root = "data";
        $data = array();
        $con = '';
        $sqlMain = "SELECT DISTINCT a.c_arrive_code,a.i_is_waiting,a.i_status_checking ,a.sp_check_period_hdr_id
                        , b.sp_tor_hdr_period_id
                        , e.i_yyyy
                        , a.sp_tor_contract_id
                        , a.c_doc_ref
                        , a.c_code
                        , a.d_arrive_date
                        , a.d_checking_date
                        , a.c_checking_code
                        , a.i_status_checking
                        ,a.i_is_fine
                        ,a.f_fine_amt
                        ,a.i_is_waiting
                        ,a.i_warranty_age
                        ,a.i_is_warranty
                        ,CONVERT(VARCHAR, a.d_warranty_date, 120) AS d_warranty_date
                        ,CONVERT(VARCHAR, a.d_checking_date, 120) AS d_checking_date
                        ,a.i_before
                        , a.c_overlap
                        , a.dc_creditor_id
                        , (select TOP 1 c_name from  " . DB_NMU . "dc_creditor where dc_creditor_id =  a.dc_creditor_id ) as dc_creditor_name
                        , a.bg_reserve_overlap_id
                        , (SELECT sum(f_net_total_price) FROM sp_check_period_dtl WHERE sp_check_period_hdr_id=a.sp_check_period_hdr_id) AS f_net_total_price
                        , (SELECT TOP 1 c_name FROM dc_expense_budget_type WHERE dc_expense_budget_type_id=b.dc_bg_budget_type_id) AS dc_bg_budget_type_idTxt
                        , (SELECT TOP 1 c_name FROM NMU.dbo.bg_expense WHERE bg_expense_id = b.po_expense_id) AS po_expense_idTxt
                        ,  b.po_expense_id
                        ,  b.c_name
                        ,  b.dc_bg_budget_type_id as dc_expense_budget_type_id
                        , (select CONVERT(VARCHAR, d_period_date, 120) from dbo.sp_tor_hdr_period where sp_tor_hdr_period_id=b.sp_tor_hdr_period_id) AS d_period_date
                        , CONVERT(VARCHAR, a.d_arrive_date, 120) AS d_arrive_date
                        , isnull(f.i_period,0) as i_period
                        , isnull(f.i_is_last,0) as i_is_last
                        ,(select top 1 i_pr_type1 from sp_tor_hdr_period where sp_tor_hdr_period_id = b.sp_tor_hdr_period_id) as i_pr_type1
                        , c.i_pr_type2 as tc_i_pr_type2
                        , CASE WHEN c.i_pr_type2 = 1 THEN 'เงินแผน' WHEN c.i_pr_type2 = 2 THEN 'เงินงวด' ELSE 'ไม่ระบุ' END as booking_type_name
                        , (select top 1 i_pr_type2 from sp_tor where tor_id = c.sp_tor_id) as t_i_pr_type2
                        , CASE WHEN (select top 1 i_pr_type2 from sp_tor where tor_id = c.sp_tor_id) = 1 THEN 'เงินแผน' WHEN (select top 1 i_pr_type2 from sp_tor where tor_id = c.sp_tor_id) = 2 THEN 'เงินงวด' ELSE 'ไม่ระบุ' END as booking_type_name_tor
                        ,a.bg_reserve_money_id
                        ,a.bg_checking_money_id
                        ,e.i_yyyy
                        ,e.dc_cost_id
                        ,(select c_name from " . DB_CENTER . "dc_cost where dc_cost_id =   e.dc_cost_id ) as dc_cost_idTxt
                        ,c.sp_tor_id
                        ,a.c_overlap
                        ,isnull(a.i_yyyy_overlap,c.i_yyyy_overlap)  as i_yyyy_overlap
                        ,c.i_yyyy_overlap2
                        ,c.c_overlap2
                        ,isnull(c.c_overlap,a.c_overlap) as c_contract_overlap
                        ,c.i_overlap as contract_overlap
                        ,c.i_overlap
                        , isnull(a.c_overlap,c.c_overlap) as c_booking
                        ,a.i_overlap as i_overlapcheck
                        ,e.i_type_bg
                        ,e.dc_cost2_id
                        ,a.bg_reserve_overlap_id
                        ,a.bg_budget_dtl_overlap_id

                        ,e.bg_reserve_money1_id as pr_bg_reserve_money1_id
                        ,e.bg_reserve_money2_id as pr_bg_reserve_money2_id
                        ,e.bg_reserve_money3_id as pr_bg_reserve_money3_id
                        ,c.bg_reserve_money1_id as po_bg_reserve_money1_id
                        ,c.bg_reserve_money2_id as po_bg_reserve_money2_id
                        ,c.bg_reserve_money3_id as po_bg_reserve_money3_id
                        ,e.dc_expense_budget_type_id as pr_dc_expense_budget_type_id
                        ,e.dc_expense_budget_type2_id as pr_dc_expense_budget_type2_id
                        ,e.dc_expense_budget_type3_id as pr_dc_expense_budget_type3_id
                       ,a.check_pdf
                        ,a.f_tax_personal
                        ,a.f_warranty
                        ,isnull(a.f_vat_amt,0) as f_vat_amt
                        ,a.i_tax_personal
                        ,a.i_transfer_of_rights
                        ,a.i_reserve_pay
                        ,a.i_rate
                        ,a.i_vat_amt
                        ,a.f_rate_vat
                        ,a.f_tax_personal_rate
                        ,a.f_tax_warranty_rate
                        ,a.f_total
                        ,a.f_total_add_vat_amt
                        ,a.f_fine_amt
                        ,a.f_other
                        ,a.f_pay
                        ,a.f_inv_vat
                        ,isnull(a.i_type_transfer,1) as  i_type_transfer
                        ,a.i_doc_duo
                        ,(select c_name from " . DB_NMU . "dc_creditor where dc_creditor_id = a.dc_creditor_id) as dc_creditor_name
                        ,a.dc_creditor_id
                        ,isnull((select c_name from " . DB_NMU . "dc_creditor where dc_creditor_id = a.dc_creditor_transfer_id)
                        ,(select c_name from " . DB_NMU . "dc_creditor where dc_creditor_id = a.dc_creditor_id)) as dc_creditor_transfer_name
                        ,isnull(a.dc_creditor_transfer_id,a.dc_creditor_id) as dc_creditor_transfer_id
                        ,a.dc_bank_acc_creditor_id
                        ,(select top 1 sp_tranf_hdr_id from sp_tranf_hdr where sp_check_period_hdr_id = a.sp_check_period_hdr_id ) as sp_tranf_hdr_id
                        , case when   isnull (c.i_overlap,0) != 3 and  isnull(e.i_type_bg,0) = 4    then 1 when   isnull(c.i_overlap,0) = 3   then  2
                        else  0 end   as i_status_overlap  -- 0 ปกติ  1 กันเหลื่อมยังไม่ก่อหนี้    2 กันเหลื่อม ก่อหนี้แล้ว
                        ,b.i_product_type as  i_product_type
                        FROM sp_check_period_hdr a
                        inner JOIN sp_check_period_dtl b on b.sp_check_period_hdr_id=a.sp_check_period_hdr_id
                        inner join sp_tor_contract c on c.sp_tor_contract_id = a.sp_tor_contract_id
                        inner join sp_tor e on e.tor_id = c.sp_tor_id
                        inner join sp_tor_hdr_period f on f.sp_tor_hdr_period_id =a.sp_tor_hdr_period_id
                        WHERE b.sp_tor_hdr_period_id = ?
                        order by sp_check_period_hdr_id desc
";
        $arrParam[] = $_REQUEST['sp_tor_hdr_period_id'];
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = @$start + 1;
        while ($row = $db->Fetch($stmt)) {
            $waiting = ($row["i_is_waiting"] == 1) ? "/<span style='color:red;font-wieght:bold;'> รอเเงิน</span>" : "";
            if ($row["i_status_checking"] == null) {
                $c_status = "รอตรวจ"; //2
            } else if ($row["i_status_checking"] == 1) {

                $c_status = "ผ่าน" . $waiting; //2
            } else {
                $c_status = "ไม่ผ่าน" . $waiting; //2
            }
            $readOnly = 0;
            $c_reason = $db->GetDataBySQL("SELECT TOP 1 c_reason FROM sp_check_period_hdr WHERE sp_check_period_hdr_id=?", array($row["sp_check_period_hdr_id"]));

            $temp = array(
                "no" => $i++,
                "readOnly" => $readOnly,
                "id" => intval($row["sp_check_period_hdr_id"]),
                "sp_tor_id" => intval($row["sp_tor_id"]),
                "i_product_type" => intval($row["i_product_type"]),
                "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
                "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
//                "c_name_dtl"                        =>    $row["c_name"]." ".((intval($row["i_period"]) ==  1  && intval($row["i_is_last"]) == 1) ? "" : " งวดที่ : " . intval($row["i_period"])),
                "c_name_dtl" => $row["c_name"] . ((intval($row["i_period"]) == 1 && intval($row["i_is_last"]) == 1) || strpos($row["c_name"], 'งวด') !== false ? "" : " งวดที่ : " . intval($row["i_period"])),
                "c_i_perod" => (intval($row["i_period"]) == 1 && intval($row["i_is_last"]) == 1) ? "" : " งวดที่ : " . intval($row["i_period"]),
                "po_expense_id" => intval($row["po_expense_id"]),
                "c_overlap" => $row["c_overlap"], //c_overlap	i_overlap	bg_reserve_overlap_id
                "dc_creditor_name" => $row["dc_creditor_name"], //c_overlap	i_overlap	bg_reserve_overlap_id
                "dc_creditor_id" => intval($row["dc_creditor_id"]),
                "i_overlap" => intval($row["i_overlap"]),
                "bg_budget_dtl_overlap_id" => intval($row["bg_budget_dtl_overlap_id"]),
                "check_pdf" => intval($row["check_pdf"]),
                "i_overlapcheck" => intval($row["i_overlapcheck"]),
                "i_type_transfer" => intval($row["i_type_transfer"]),
                "i_doc_duo" => intval($row["i_doc_duo"]),
                "i_transfer_of_rights" => intval($row["i_transfer_of_rights"]),
                "i_reserve_pay" => intval($row["i_reserve_pay"]),
                "dc_creditor_transfer_id" => intval($row["dc_creditor_transfer_id"]),
                "dc_bank_acc_creditor_id" => intval($row["dc_bank_acc_creditor_id"]),
                "bg_reserve_overlap_id" => intval($row["bg_reserve_overlap_id"]),
                "pr_bg_reserve_money1_id" => intval($row["pr_bg_reserve_money1_id"]),
                "pr_bg_reserve_money2_id" => intval($row["pr_bg_reserve_money2_id"]),
                "pr_bg_reserve_money3_id" => intval($row["pr_bg_reserve_money3_id"]),
                "po_bg_reserve_money1_id" => intval($row["po_bg_reserve_money1_id"]),
                "po_bg_reserve_money2_id" => intval($row["po_bg_reserve_money2_id"]),
                "po_bg_reserve_money3_id" => intval($row["po_bg_reserve_money3_id"]),
                "pr_dc_expense_budget_type_id" => intval($row["pr_dc_expense_budget_type_id"]),
                "pr_dc_expense_budget_type2_id" => intval($row["pr_dc_expense_budget_type2_id"]),
                "pr_dc_expense_budget_type3_id" => intval($row["pr_dc_expense_budget_type3_id"]),
                "i_yyyy" => intval($row["i_yyyy"]),
                "i_type_bg" => $row["i_type_bg"],
                "i_yyyy_overlap" => intval($row["i_yyyy_overlap"]) == 0 ? intval($BudgetYear) : intval($row["i_yyyy_overlap"]),
                "i_yyyy_overlap2" => intval($row["i_yyyy_overlap2"]),
                "c_overlap2" => $row["c_overlap2"],
                "dc_cost_id" => intval($row["dc_cost_id"]),
                "dc_cost2_id" => $row["dc_cost2_id"],
                "dc_cost_idTxt" => $row["dc_cost_idTxt"],
                "bg_reserve_money_id" => intval($row["bg_reserve_money_id"]),
                "c_overlap" => $row["c_overlap"],
                "c_contract_overlap" => $row["c_contract_overlap"],
                "c_booking" => $row["c_contract_overlap"],
                "contract_overlap" => intVal($row["contract_overlap"]),
                "c_booking" => $row["c_booking"],
                "bg_reserve_overlap_id" => intVal($row["bg_reserve_overlap_id"]),
                "bg_checking_money_id" => intval($row["bg_checking_money_id"]),
                "i_pr_type1" => intval($row["i_pr_type1"]),
                "i_pr_type" => intval($row["tc_i_pr_type2"]),
                "tc_i_pr_type2" => intval($row["tc_i_pr_type2"]),
                "booking_type_name" => $row["booking_type_name"],
                "t_i_pr_type2" => intval($row["t_i_pr_type2"]),
                "booking_type_name_tor" => $row["booking_type_name_tor"],
                "i_is_last" => intval($row["i_is_last"]),
                "sp_tor_hdr_period_id" => intval($row["sp_tor_hdr_period_id"]),
                "sp_tranf_hdr_id" => intval($row["sp_tranf_hdr_id"]),
                "i_period" => intval($row["i_period"]),
                "c_doc_ref" => $row["c_doc_ref"],
                "i_status_checking" => $row["i_status_checking"],
                "f_fine_amt" => number_format($row["f_fine_amt"], 2),
                "f_net_total_price" => number_format($row["f_net_total_price"], 2),
                "i_vat_amt" => intval($row["i_vat_amt"]) ?? 0,
                "i_tax_personalID" => intval($row["i_tax_personal"]),
                "i_rate" => $row["i_rate"],
                "f_vat_rate" => $row["f_rate_vat"],
                "f_tax_personal_rate" => number_format($row["f_tax_personal_rate"], 2),
                "f_tax_warranty_rate" => number_format($row["f_tax_warranty_rate"], 2),
                "f_vat" => number_format($row["f_vat_amt"], 2),
                "f_vat_amt" => number_format($row["f_vat_amt"], 2),
                "f_tax_personalID2" => number_format($row["f_tax_personal"], 2),
                "f_warranty" => number_format($row["f_warranty"], 2),
                "f_total" => number_format($row["f_total"], 2),
                "f_inv" => number_format($row["f_total_add_vat_amt"], 2),
                "f_fine" => number_format($row["f_fine_amt"], 2),
                "f_other" => number_format($row["f_other"], 2),
                "f_pay" => number_format($row["f_pay"], 2),
                "f_inv_vat" => number_format($row["f_inv_vat"], 2),
                "f_tax_personal" => number_format($row["f_tax_personal"], 2),
                "i_tax_personal" => $row["i_tax_personal"],
                "i_is_fine" => $row["i_is_fine"],
                "i_is_waiting" => $row["i_is_waiting"],
                "c_checking_code" => $row["c_checking_code"],
                "c_arrive_code" => $row["c_arrive_code"],
                "c_code" => $row["c_code"],
                "c_reason" => $c_reason,
                "i_warranty_age" => $row["i_warranty_age"],
                "i_is_warranty" => $row["i_is_warranty"],
                "d_warranty_date" => $row["d_warranty_date"] == '' ? '' : $date->extDateBuddha($row["d_warranty_date"]), // $row["d_warranty_date"]
                "d_checking_date" => $row["d_checking_date"] == '' ? '' : $date->extDateBuddha($row["d_checking_date"]), // $row["d_checking_date"]
                "i_before" => $row["i_before"] ?? 15, //defalut 15 วัน
                "dc_bg_budget_type_idTxt" => $row["dc_bg_budget_type_idTxt"],
                "po_expense_idTxt" => $row["po_expense_idTxt"],
                "d_arrive_date" => $row["d_arrive_date"] == '' ? '' : $date->extDateBuddha($row["d_arrive_date"]),
                "d_period_date" => $row["d_period_date"] == '' ? '' : $date->extDateBuddha($row["d_period_date"]),
                "c_status" => $c_status
            );
            ${$root}[] = $temp;
        }

        echo json_encode(array("debug" => true, "totalCount" => $i, $root => ${$root}));
        exit();
        break;
    case "LIST_PERIOD_SUB_ARRIVAL_HDR":
###########################################
        $root = "data";
        $data = array();
        $con = '';
        $sqlMain = "SELECT distinct a.c_arrive_code,a.i_is_waiting,a.i_status_checking
                        , c.sp_tor_id
                        , e.i_yyyy
                        , e.po_expense_id
                        , e.dc_cost_id
                        , (select i_type from sp_type_bg where i_value =  i_type_bg  ) as sp_type_bg
                        , e.i_purchase
                        , isnull(b.i_hire_type,0) as i_hire_type
                        , isnull(b.i_product_type,0) as i_product_type
                        , b.sp_tor_dtl_period_id
                        , b.sp_check_period_dtl_id
                        ,(select c_name from nmu.dbo.bg_expense aa where aa.bg_expense_id = e.po_expense_id  ) po_expense_name
                        , f.i_pr_type1
                        , f.dc_expense_budget_type_id
                        , f.i_is_last as i_last
                        , a.sp_check_period_hdr_id
                        , f.i_period as i_period
                        , f.bg_reserve_money_id
                        , a.sp_tor_hdr_period_id
                        , a.sp_tranf_hdr_id
                        , a.c_doc_ref
                        , a.c_code
                        , c.i_booking_bg
                        , c.i_overlap
                        , a.c_arrive_code
                        , CONVERT(VARCHAR, a.d_doc_arrive_dt) AS d_doc_arrive_dt
                        , a.d_arrive_date
                        , a.d_checking_date
                        , a.c_checking_code
                        , a.i_status_checking
                        , a.i_is_fine
                        , b.f_net_unit_price
                        , b.f_net_total_price
                        , a.f_fine_amt
                        , a.i_is_waiting
                        , a.i_warranty_age

                        , CONVERT(VARCHAR, a.d_warranty_date, 120) AS d_warranty_date
                        , CONVERT(VARCHAR, a.d_checking_date, 120) AS d_checking_date
                        , a.i_before
                        , CONVERT(VARCHAR, a.d_arrive_date, 120) AS d_arrive_date
                        , a.f_vat_amt ,a.f_total_add_vat_amt ,a.f_rate_vat
                FROM (
                    SELECT TOP 1 *
                    FROM sp_check_period_hdr
                    WHERE sp_tor_hdr_period_id = ?
                      AND i_enabled = 1
                    ORDER BY d_arrive_date DESC, sp_check_period_hdr_id DESC
                ) a
                    CROSS APPLY (
                        SELECT TOP 1 *
                        FROM sp_check_period_dtl b
                        WHERE b.sp_check_period_hdr_id = a.sp_check_period_hdr_id
                        ORDER BY b.sp_check_period_dtl_id DESC
                    ) b
                    inner join sp_tor_contract c on c.sp_tor_contract_id = a.sp_tor_contract_id
                    inner join sp_tor e on e.tor_id = c.sp_tor_id
                    inner join sp_tor_hdr_period f on f.sp_tor_hdr_period_id = a.sp_tor_hdr_period_id
                order by a.sp_check_period_hdr_id desc
                ";

//                 echo $sqlMain;
//                 exit;

        $arrParam[] = $_REQUEST['sp_tor_hdr_period_id'];
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = 1;

        while ($row = $db->Fetch($stmt)) {

            $waiting = ($row["i_is_waiting"] == 1) ? "/<span style='color:red;font-wieght:bold;'> รอเเงิน</span>" : "";
            if ($row["i_status_checking"] == null) {
                $c_status = "รอตรวจ"; //2
            } else if ($row["i_status_checking"] == 1) {

                $c_status = "ผ่าน" . $waiting; //2
            } else {
                $c_status = "ไม่ผ่าน" . $waiting; //2
            }
            if ($row["i_is_waiting"] == NULL && $row["i_status_checking"] == 1) {
                $readOnly = 1;
            } else {
                $readOnly = 0;
            }

            $c_reason = $db->GetDataBySQL("SELECT TOP 1 c_reason FROM sp_check_period_hdr WHERE sp_check_period_hdr_id=?", array($row["sp_check_period_hdr_id"]));
            $temp = array(
                "no" => $i++,
                "readOnly" => $readOnly,
                "id" => intval($row["sp_check_period_hdr_id"]),
                "f_vat_amt" => number_format($row["f_vat_amt"], 2),
                "f_total_add_vat_amt" => number_format($row["f_total_add_vat_amt"], 2),
                "f_rate_vat" => number_format($row["f_rate_vat"], 2),
                "i_yyyy" => intval($row["i_yyyy"]),
                "sp_type_bg" => intval($row["sp_type_bg"]),
                "i_overlap" => intval($row["i_overlap"]),
                "dc_bg_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
                "po_expense_id" => intval($row["po_expense_id"]),
                "po_expense_name" => $row["po_expense_name"],
                "dc_cost_id" => intval($row["dc_cost_id"]),
                "i_purchase" => intval($row["i_purchase"]), //i_purchase i_hire_type i_product_type
                "i_hire_type" => intval($row["i_hire_type"]),
                "i_product_type" => intval($row["i_product_type"]),
                "sp_tor_dtl_period_id" => intval($row["sp_tor_dtl_period_id"]),
                "sp_check_period_dtl_id" => intval($row["sp_check_period_dtl_id"]), //sp_tor_dtl_period_id sp_check_period_dtl_id
                "i_pr_type" => intval($row["i_pr_type1"]),
                "i_last" => intval($row["i_last"]),
                "i_booking_bg" => intval($row["i_booking_bg"]),
                "sp_tor_hdr_period_id" => intval($row["sp_tor_hdr_period_id"]),
                "sp_tranf_hdr_id" => intval($row["sp_tranf_hdr_id"]),
                "sp_check_period_hdr_id" => intval($row["sp_check_period_hdr_id"]),
                "i_period" => intval($row["i_period"]),
                "bg_reserve_money_id" => intval($row["bg_reserve_money_id"]),
                "c_doc_ref" => $row["c_doc_ref"],
                "i_status_checking" => $row["i_status_checking"],
                "f_fine_amt" => number_format($row["f_fine_amt"], 2),
                "f_net_unit_price" => number_format($row["f_net_unit_price"], 2),
                "f_net_total_price" => number_format($row["f_net_total_price"], 2),
                "i_is_fine" => $row["i_is_fine"],
                "i_is_waiting" => $row["i_is_waiting"],
                "c_checking_code" => $row["c_code"],
                "c_arrive_code" => $row["c_arrive_code"],
                "c_code" => $row["c_code"],
                "c_reason" => $c_reason,
                "i_warranty_age" => $row["i_warranty_age"],
                "d_warranty_date" => $row["d_warranty_date"] == '' ? '' : $date->extDateBuddha($row["d_warranty_date"]), // $row["d_warranty_date"]
                "d_checking_date" => $row["d_checking_date"] == '' ? '' : $date->extDateBuddha($row["d_checking_date"]), // $row["d_warranty_date"]
                "i_before" => $row["i_before"] ?? 15, //defalut 15 วัน
                "d_arrive_date" => $row["d_arrive_date"] == '' ? '' : $date->extDateBuddha($row["d_arrive_date"]),
                "d_doc_arrive_dt" => $row["d_doc_arrive_dt"] == '' ? '' : $date->extDateBuddha($row["d_doc_arrive_dt"]),
                "c_status" => $c_status
            );
            ${$root}[] = $temp;
        }

        echo json_encode(array("debug" => true, "totalCount" => $i, $root => ${$root}));
        exit();

        break;
    case "LIST_PERIOD_DTL":
###########################################
        $root = "data";
        $data = array();
        $con = '';
        $sqlMain = "SELECT a.f_net_unit_price ,a.f_net_total_price
                , (select sum(CASE WHEN ISNULL(f_net_total_price,0) <> 0
                                   THEN f_net_total_price
                                   ELSE ISNULL(f_wip_total_price,0) + ISNULL(f_under_total_price,0) END) from sp_tranf_item bbbb
                where bbbb.sp_check_period_hdr_id = a.sp_check_period_hdr_id
                and bbbb.i_enabled = 1
                )  as f_net_tranf_price
                , isnull((select sum(isnull(i_qty,i_workin_process)) from sp_tranf_item bbb where bbb.sp_check_period_dtl_id =a.sp_check_period_dtl_id  and bbb.i_enabled = 1  ),0)  as i_qty_tranf
                , ( select  top 1  i_yyyy_overlap from sp_tor_contract aa where c.sp_tor_contract_id = aa.sp_tor_contract_id ) as i_yyyy_overlap
                , a.sp_check_period_dtl_id
                ,c.sp_tor_contract_id
                , a.sp_tor_dtl_period_id
                    ,a.sp_check_period_hdr_id
                    ,a.sp_tor_dtl_period_id
                    ,a.sp_tor_hdr_period_id
                            ,a.dc_creditor_id
                            ,a.c_name
                            ,a.i_qty
                            ,a.dc_unit_type_id
                            ,(select top 1 c_name from dc_unit_type where dc_unit_type_id = a.dc_unit_type_id) as c_unit
                            ,(select top 1 sp_tranf_hdr_id from sp_tranf_hdr where sp_check_period_hdr_id = a.sp_check_period_hdr_id) as sp_tranf_hdr_id
                            ,a.dc_bg_budget_type_id
                            ,a.po_expense_id
                            ,a.i_hire_type
                            ,a.i_product_type
                            ,a.i_is_inv
                            ,cc.i_is_last
                            ,b.dc_acc_id
                            ,(select TOP 1 c_name from " . DB_CENTER . "dc_acc where dc_acc_id = b.dc_acc_id ) as dc_acc_name
                            ,c.f_total_add_vat_amt
                            ,c.f_vat_amt
                            ,c.f_rate_vat
                        FROM sp_check_period_dtl a
                        left join sp_tranf_item b on b.sp_check_period_dtl_id = a.sp_check_period_dtl_id and b.i_enabled = 1
                        inner join sp_check_period_hdr c on c.sp_check_period_hdr_id = a.sp_check_period_hdr_id
                        inner join sp_tor_hdr_period cc on c.sp_tor_hdr_period_id = cc.sp_tor_hdr_period_id
                WHERE a.sp_check_period_hdr_id=?
                group by a.sp_check_period_dtl_id
                    ,a.sp_check_period_hdr_id
                    ,c.sp_tor_contract_id
                    ,a.sp_tor_dtl_period_id
                    ,a.sp_tor_hdr_period_id
                    ,a.dc_creditor_id
                    ,a.c_name
                    ,a.i_qty
                    ,b.i_is_under
                    ,a.dc_unit_type_id
                    ,a.dc_bg_budget_type_id
                    ,a.po_expense_id
                    ,b.dc_acc_id
                    ,a.i_hire_type
                    ,a.i_product_type
                    ,cc.i_is_last
                    ,c.f_total_add_vat_amt
                    ,c.f_vat_amt
                    ,c.f_rate_vat
                    ,a.i_is_inv ,a.f_net_unit_price ,a.f_net_total_price";

//                 echo $sqlMain;
//        exit;
        $hdr_id = $_REQUEST["sp_check_period_hdr_id"] ?? null;
        $stmt = $db->QueryParam($sqlMain, array($hdr_id));
        $i = 0;

        while ($row = $db->Fetch($stmt)) {

            $temp = array(
                "no" => $i++,
                "id" => intval($row["sp_check_period_dtl_id"]),
                "sp_check_period_hdr_id" => intval($row["sp_check_period_hdr_id"]),
                "sp_tor_dtl_period_id" => intval($row["sp_tor_dtl_period_id"]),
                "sp_tor_hdr_period_id" => intval($row["sp_tor_hdr_period_id"]),
                "sp_tranf_hdr_id" => intval($row["sp_tranf_hdr_id"]),
                "i_product_type" => intval($row["i_product_type"]),
                "i_is_inv" => intval($row["i_is_inv"]),
                "i_qty" => intval($row["i_qty"]),
                "i_qty_tranf" => intval($row["i_qty_tranf"]),
                "dc_unit_type_id" => $row["dc_unit_type_id"],
                "dc_acc_name" => $row["dc_acc_name"],
                "dc_acc_id" => intval($row["dc_acc_id"]),
                "c_unit" => $row["c_unit"],
                "i_is_last" => $row["i_is_last"],
                "i_yyyy_overlap" => $row["i_yyyy_overlap"],
                "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
                "f_net_unit_price" => number_format($row["f_net_unit_price"], 2),
                "f_net_tranf_price" => number_format($row["f_net_total_price"], 2),
                "f_net_total_price" => number_format($row["f_net_total_price"], 2),
                "f_total_add_vat_amt" => number_format($row["f_total_add_vat_amt"], 2),
                "f_vat_amt" => number_format($row["f_vat_amt"], 2),
                "f_rate_vat" => number_format($row["f_rate_vat"], 2),
                "c_name" => $row["c_name"]
            );
            ${$root}[] = $temp;
        }

        echo json_encode(array("debug" => true, "totalCount" => $i, $root => ${$root}));
        exit();

        break;
    case "LIST_TRANF_ITEM":
###########################################
        $root = "data";
        $data = array();
        $con = '';

        $hdr_id = $_REQUEST['sp_check_period_hdr_id'] ?? NULL;
        $dtl_period_id = $_REQUEST['sp_tranf_hdr_id'] ?? NULL;
        $sqlMain = "select  a.sp_tranf_item_id,
                            a.sp_tranf_hdr_id,
                            a.am_mode_id,
                            a.inv_mode_id,
                            (SELECT c_name FROM am_mode_acc WHERE am_mode_id = a.am_mode_id) AS c_am_mode,
                            (SELECT c_name FROM inv_mode_acc WHERE inv_mode_id = a.inv_mode_id) AS c_inv_mode,
                            a.sp_tor_dtl_period_id,
                            a.c_name,
                            a.i_workin_process,
                            a.i_is_work_cost,
                            a.i_is_under,
                            a.f_wip_total_price,
                            a.f_under_total_price,
                            a.f_net_total_price,

                            CASE WHEN ISNULL(a.f_net_total_price,0) <> 0
                                 THEN a.f_net_total_price
                                 ELSE ISNULL(a.f_under_total_price,0) + ISNULL(a.f_wip_total_price,0)
                            END AS f_net_total,
                               a.dc_acc_id,
                (select TOP 1 c_name from " . DB_CENTER . "dc_acc where dc_acc_id = a.dc_acc_id ) as dc_acc_name,
                isnull(a.f_vat_amt, 0) as f_vat_amt
                from dbo.sp_tranf_item a
                inner join dbo.sp_tranf_hdr b on b.sp_tranf_hdr_id=a.sp_tranf_hdr_id
                inner join dbo.sp_check_period_hdr c on c.sp_check_period_hdr_id = b.sp_check_period_hdr_id
                where a.i_enabled = 1 and  b.sp_check_period_hdr_id =?";
        if (@$_REQUEST["show_sql"]) {
            /*             * ****echo sql***** */
            $sql = (@$sqlMain) ? $sqlMain : $sql;
            $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());

            $sql = str_replace('?', '#-#', $sql);
            foreach ($arr as $fld => $value) {
                $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
            }
            echo $sql;
            exit;
            /*             * ***************** */
        }
        $stmt = $db->QueryParam($sqlMain, array($hdr_id));
//         $stmt = $db->QueryParam($sqlMain, array($hdr_id, $dtl_period_id));
        $i = 0;
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "id" => intval($row["sp_tranf_item_id"]),
                "i_is_work_cost" => intval($row["i_is_work_cost"]),
                "sp_tranf_hdr_id" => intval($row["sp_tranf_hdr_id"]),
                "am_mode_id" => intval($row["am_mode_id"]),
                "inv_mode_id" => intval($row["inv_mode_id"]),
                "i_is_under" => intval($row["i_is_under"]),
//                "i_edit" => intval($row["i_edit"]),
                "i_workin_process" => intval($row["i_workin_process"]),
                "dc_acc_id" => intval($row["dc_acc_id"]),
                "c_name" => $row["c_name"] . (($row["i_workin_process"] > 0) ? "<font color='blue'>(งานระหว่างดำเนินการ)</font>" : ""),
                "c_am_mode" => $row["c_am_mode"],
                "dc_acc_name" => $row["dc_acc_name"],
                "c_inv_mode" => $row["c_inv_mode"],
                "f_under_total_price" => number_format($row["f_under_total_price"], 2),
                "f_wip_total_price" => number_format($row["f_wip_total_price"], 2),
                "f_net_total_price" => number_format($row["f_net_total_price"], 2),
                "f_net_total" => number_format($row["f_net_total"], 2),
                "f_vat_amt" => number_format($row["f_vat_amt"], 2)   // ++ เพิ่มบรรทัดนี้
            );
            ${$root}[] = $temp;
        }

        echo json_encode(array("debug" => true, "totalCount" => $i, $root => ${$root}));
        exit();
        break;
    case "INSERT_CHECKING_DTL":
        $hdr_id = $data['sp_tranf_hdr_id'] ?? null;
        $i_product_type = $data['i_product_type'] ?? null; //
        if ($hdr_id > 0) {
            $ret_id = $hdr_id;
            $root = "data";
            $data = array();
            $msg = "";
            // ============== //
            $addField = null;
            $addValue = null;
            unset($data);
            unset($arrValue);
            // ============== //
            $arrParam2 = array();
            $f_net_total_price = !empty($_REQUEST["f_net_total_price"]) ? str_replace(',', '', $_REQUEST["f_net_total_price"]) : 0;
            $f_wip_total_price = !empty($_REQUEST["f_wip_total_price"]) ? str_replace(',', '', $_REQUEST["f_wip_total_price"]) : 0;
            $f_under_total_price = !empty($_REQUEST["f_under_total_price"]) ? str_replace(',', '', $_REQUEST["f_under_total_price"]) : 0;
            $i_under = ($f_under_total_price > 0) ? 1 : 0;
            $arrParam2["sp_tranf_hdr_id"] = $ret_id;
            $arrParam2["i_is_work_cost"] = $_REQUEST['i_is_work_cost'] ?? null;
            $arrParam2["i_enabled"] = 1;
            $arrParam2["am_mode_id"] = $_REQUEST["am_mode_id"] ?? 0;
            $arrParam2["inv_mode_id"] = $_REQUEST["inv_mode_id"] ?? 0;
            $arrParam2["sp_tor_dtl_period_id"] = $_REQUEST["id"];
            $arrParam2["sp_check_period_hdr_id"] = $_REQUEST["sp_check_period_hdr_id"];
            $arrParam2["sp_check_period_dtl_id"] = $_REQUEST["id"];
            $arrParam2["c_name"] = $_REQUEST["c_name"];
            $arrParam2["i_is_under"] = ($i_product_type == 1) ? 0 : $i_under;
            //       $arrParam2[] = $f_wip_total_price; i_workin_process = 1
            if (shouldUseWorkInProcessAccount($_REQUEST, $db)) { // งานระหว่างดำเนินการ รวมหมวดครุภัณฑ์ 9999
                //TODO
                if ($_SESSION['user_id'] == 0) {
                    echo 'งานระหว่างดำเนินการ';
                    exit();
                }
                $arrParam = array(STATUS_ENABLE);
                $dc_acc = "SELECT  a.dc_acc_id  FROM  " . DB_CENTER . "dc_acc a WHERE  a.c_code = '10208010101' and a.i_enable = ?";
                $stmt2 = $db->QueryParam($dc_acc, $arrParam);
                $Fetch_dc_acc_id = $db->Fetch($stmt2);
                $dc_acc_id = $Fetch_dc_acc_id["dc_acc_id"];
                $arrParam2["dc_acc_id"] = $dc_acc_id;
                $arrParam2["i_qty"] = NULL;
                $arrParam2["i_workin_process"] = $_REQUEST['i_workin_process'];
                $arrParam2["f_wip_total_price"] = $f_wip_total_price; // 1
                $arrParam2["f_under_total_price"] = NULL;
                $arrParam2["f_net_total_price"] = NULL;
            } else if ($_REQUEST['i_workin_process2'] == 0 && $_REQUEST['i_product_type'] == 0 || $_REQUEST['i_working_type'] == 8) { // วิ่งตามผังงบประมาณ
                //TODO
                if ($_SESSION['user_id'] == 0) {
                    echo ' i_working_type == 8) { // วิ่งตามผังงบประมาณ';
                    exit();
                }
                $arrParam = array(STATUS_ENABLE, STATUS_ENABLE, $_REQUEST['po_expense_id']);
                $dc_acc = "	select c.dc_acc_id
                    from " . DB_CENTER . "dc_bg_acc_hdr  a
                    INNER JOIN " . DB_CENTER . "dc_bg_acc_dtl b on a.dc_bg_acc_hdr_id = b.dc_bg_acc_hdr_id
                    INNER JOIN " . DB_CENTER . "dc_acc c on c.dc_acc_id = b.dc_acc_id
                    where a.i_enable = ?  and  c.i_enable = ?  and c.i_last = 1 and c.i_group in(1,5)   and  a.bg_expense_id =  ?";
                $stmt2 = $db->QueryParam($dc_acc, $arrParam);
                $Fetch_dc_acc_id = $db->Fetch($stmt2);
                $dc_acc_id = $Fetch_dc_acc_id["dc_acc_id"];
                $arrParam2["dc_acc_id"] = $dc_acc_id ?? 0;  //0
                $arrParam2["i_qty"] = $_REQUEST['i_qty']; //0
                $arrParam2["i_workin_process"] = $_REQUEST['i_workin_process'];
                $arrParam2["f_wip_total_price"] = NULL;   //($i_product_type == 1) ? 0 : $f_under_total_price; //floatVal($data["f_net_unit_price"]); //0
                $arrParam2["f_under_total_price"] = NULL;
                $arrParam2["f_net_total_price"] = $f_net_total_price; //0
            } else if ($_REQUEST['i_workin_process'] == 0 && $_REQUEST['i_product_type'] == 2 && $_REQUEST['i_workin_process2'] == 0 || $_REQUEST['i_working_type'] <> 8) { // ครุภัณฑ์  เข้าเกณฑ์
                //TODO
                if ($_SESSION['user_id'] == 0) {
                    echo 'i_workin_process &&  i_product_type  && i_workin_process2  || i_working_type == 8) {  ครุภัณฑ์  เข้าเกณฑ์';
                    exit();
                }
                $arrParam = array(STATUS_ENABLE, $_REQUEST['am_mode_id']);
                $dc_acc = "SELECT  a.dc_acc_id from " . DB_CENTER . "am_mode_acc a where a.i_enabled = ?  and   am_mode_id = ?;";
                $stmt2 = $db->QueryParam($dc_acc, $arrParam);
                $Fetch_dc_acc_id = $db->Fetch($stmt2);
                $dc_acc_id = $Fetch_dc_acc_id["dc_acc_id"] ?? 0;
                $arrParam2["dc_acc_id"] = $dc_acc_id ?? 0;  //0
                $arrParam2["i_qty"] = NULL;
                $arrParam2["i_workin_process"] = $_REQUEST['i_workin_process'];
                $arrParam2["f_wip_total_price"] = NULL;
                $arrParam2["f_under_total_price"] = NULL; //1
                $arrParam2["f_net_total_price"] = $f_net_total_price;
            } else if ($_REQUEST['i_product_type'] == 1 && $_REQUEST['i_workin_process2'] == 0) {  // วัสดุ
                //TODO
                if ($_SESSION['user_id'] == 0) {
                    echo 'i_product_type   1 && i_workin_process2=0) {  ครุภัณฑ์  เข้าเกณฑ์';
                    exit();
                }
                $arrParam = array(STATUS_ENABLE, $_REQUEST['inv_mode_id']);
                $dc_acc = "SELECT  dc_acc_id as dc_acc_id from " . DB_CENTER . "inv_mode_acc   where i_enabled = ? and  inv_mode_id = ?;";
                $stmt2 = $db->QueryParam($dc_acc, $arrParam);
                $Fetch_dc_acc_id = $db->Fetch($stmt2);
                $dc_acc_id = $Fetch_dc_acc_id["dc_acc_id"];
                $arrParam2["dc_acc_id"] = $dc_acc_id ?? 0;  //0
                $arrParam2["i_qty"] = NULL;
                $arrParam2["i_workin_process"] = $_REQUEST['i_workin_process'];
                $arrParam2["f_wip_total_price"] = NULL;
                $arrParam2["f_under_total_price"] = NULL; //1
                $arrParam2["f_net_total_price"] = $f_net_total_price;
            } else if ($_REQUEST['i_workin_process'] == 0 && $_REQUEST['i_product_type'] == 2 && $_REQUEST['i_workin_process2'] == 1) { // ครุภัณฑ์  ต่ำกว่าเกณฑ์
                //TODO
                if ($_SESSION['user_id'] == 0) {
                    echo 'i_workin_process = 0 &&  i_product_type = 2 && i_workin_process2 == 1) {  ครุภัณฑ์  เข้าเกณฑ์';
                    exit();
                }
                $arrParam = array(STATUS_ENABLE, STATUS_ENABLE, $_REQUEST['am_mode_id']);
                $dc_acc = "SELECT  a.dc_acc3_id as dc_acc_id  from " . DB_CENTER . "am_mode_acc  a where am_mode_id = ? ;";
                $stmt2 = $db->QueryParam($dc_acc, $arrParam);
                $Fetch_dc_acc_id = $db->Fetch($stmt2);
                $dc_acc_id = $Fetch_dc_acc_id["dc_acc_id"];
                $arrParam2["dc_acc_id"] = $dc_acc_id ?? 0;  //0
                $arrParam2["i_qty"] = NULL;
                $arrParam2["i_workin_process"] = $_REQUEST['i_workin_process'];
                $arrParam2["f_wip_total_price"] = NULL;
                $arrParam2["f_under_total_price"] = $f_under_total_price; //1
                $arrParam2["f_net_total_price"] = NULL;
            } else if ($_REQUEST['i_workin_process'] == 1 && $_REQUEST['i_product_type'] == 2 && $_REQUEST['i_workin_process2'] == 0) {
                if ($_SESSION['user_id'] == 0) {
                    echo 'กรณีหลายงวด ก่อสร้าง ปรับปรุงอาคาร ค่าออกแบบ ค่าควบคุมงาน ซื้อครุภัณฑ์ ใช้บัญชี 10208010101';
                    exit();
                }
                // กรณีหลายงวด ก่อสร้าง ปรับปรุงอาคาร ค่าออกแบบ ค่าควบคุมงาน ซื้อครุภัณฑ์ ใช้บัญชี 10208010101
                $arrParam = array(STATUS_ENABLE);
                $dc_acc = "SELECT  a.dc_acc_id  FROM  " . DB_CENTER . "dc_acc a WHERE  a.c_code = '10208010101' and a.i_enable = ?";
                $stmt2 = $db->QueryParam($dc_acc, $arrParam);
                $Fetch_dc_acc_id = $db->Fetch($stmt2);
                $dc_acc_id = $Fetch_dc_acc_id["dc_acc_id"];
                $arrParam2["dc_acc_id"] = $dc_acc_id;
                $arrParam2["i_qty"] = NULL;
                $arrParam2["i_workin_process"] = $_REQUEST['i_workin_process'];
                $arrParam2["f_wip_total_price"] = $f_wip_total_price; // 1
                $arrParam2["f_under_total_price"] = NULL;
                $arrParam2["f_net_total_price"] = NULL;
            }
            // บันทึกยอดลง f_net_total_price เสมอเมื่อเพิ่มรายการตั้งหนี้ใหม่
            $canonicalNetTotalPrice = (float)$f_net_total_price != 0
                ? $f_net_total_price
                : ((float)$f_wip_total_price != 0 ? $f_wip_total_price : $f_under_total_price);
            $arrParam2["f_net_total_price"] = $canonicalNetTotalPrice;

            foreach ($arrParam2 as $fld => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ", {$fld}";
                $addValue .= ", ?";
            }
            // print_r($addField);
            // exit;
            $sql = "
                    SET NOCOUNT ON
                    INSERT INTO dbo.sp_tranf_item  (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");";
            $stmt = $db->QueryParam($sql, $arrValue);
        } else {
            $arrParam = array();
            $arrParam[] = $data['sp_tor_hdr_period_id'];
            $arrParam[] = $data['id'];
            $arrParam[] = $data['sp_check_period_hdr_id'];
            $arrParam[] = $_SESSION['sp_emp_id'];
            $arrParam[] = date('Y-m-d H:i:s');
            $arrParam[] = 1; //enabled
            $arrParam[] = $data["dc_user_update_id"];
            $arrParam[] = $data["dc_user_update_cost_id"];
            $arrParam[] = $data["d_update"];
            $arrParam[] = $data["dc_user_update_id"];
            $arrParam[] = $data["dc_user_update_cost_id"];
            $arrParam[] = $data["d_update"];

            $sqlHdr = "INSERT INTO dbo.sp_tranf_hdr (sp_tor_hdr_period_id ,sp_mn_contract_dtl_id
                                , sp_check_period_hdr_id, sp_emp_id ,d_emp_dt
                                , i_enabled
                                , dc_user_create_id, dc_user_create_cost_id, d_create
                                , dc_user_update_id, dc_user_update_cost_id, d_update)
                            VALUES (?, ? ,
                                ? , ?, ?,
                                ? ,
                                ? , ?, ?, ?, ?, ?)";
            $sqlHdr .= "SELECT @@IDENTITY as hdr_id";
            $stmt = $db->QueryParam($sqlHdr, $arrParam);
            //             echo $arrParam;
            if ($stmt) {
                $next_result = $db->NextResult($stmt);
                if ($next_result) {
                    $ff = $db->Fetch($stmt);
                    $arrParam2 = array();
                    $f_net_total_price = !empty($data["f_net_total_price"]) ? str_replace(',', '', $data["f_net_total_price"]) : 0;
                    $f_wip_total_price = !empty($data["f_wip_total_price"]) ? str_replace(',', '', $data["f_wip_total_price"]) : 0;
                    $f_under_total_price = !empty($data["f_under_total_price"]) ? str_replace(',', '', $data["f_under_total_price"]) : 0;
                    $i_under = ($f_under_total_price > 0) ? 1 : 0;

                    //   $i_product_type = $db->GetDataBySQL("select i_product_type from sp_tor_dtl_period where sp_tor_hdr_period_id= ?", array($data['sp_tor_hdr_period_id']));
                    $i_product_type = $data['i_product_type'] ?? null;

                    $ret_id = $hdr_id;
                    $root = "data";
                    $data = array();
                    $msg = "";
                    // ============== //
                    $addField = null;
                    $addValue = null;
                    unset($data);
                    unset($arrValue);

                    $ret_id = $ff["hdr_id"];
                    $arrParam2["sp_tranf_hdr_id"] = $ret_id;
                    // $arrParam2["i_is_work_cost"] = $_REQUEST['i_is_work_cost'] ?? null;
                    $arrParam2["i_enabled"] = 1;
                    $arrParam2["am_mode_id"] = $_REQUEST["am_mode_id"] ?? 0;
                    $arrParam2["inv_mode_id"] = $_REQUEST["inv_mode_id"] ?? 0;
                    $arrParam2["sp_tor_dtl_period_id"] = $_REQUEST["id"];
                    $arrParam2["sp_check_period_hdr_id"] = $_REQUEST["sp_check_period_hdr_id"];
                    $arrParam2["sp_check_period_dtl_id"] = $_REQUEST["id"];
                    $arrParam2["c_name"] = $_REQUEST["c_name"];
                    $arrParam2["i_is_under"] = ($i_product_type == 1) ? 0 : $i_under;
                    //       $arrParam2[] = $f_wip_total_price; i_workin_process = 1
                    // print_r($arrParam2);
                    // exit;
                    if (shouldUseWorkInProcessAccount($_REQUEST, $db)) { // งานระหว่างดำเนินการ รวมหมวดครุภัณฑ์ 9999
                        $arrParam = array(STATUS_ENABLE);
                        $dc_acc = "SELECT  a.dc_acc_id  FROM  " . DB_CENTER . "dc_acc a WHERE  a.c_code = '10208010101' and a.i_enable = ?";
                        $stmt2 = $db->QueryParam($dc_acc, $arrParam);
                        $Fetch_dc_acc_id = $db->Fetch($stmt2);
                        $dc_acc_id = $Fetch_dc_acc_id["dc_acc_id"];
                        $arrParam2["dc_acc_id"] = $dc_acc_id;
                        $arrParam2["i_qty"] = NULL;
                        $arrParam2["i_workin_process"] = $_REQUEST['i_workin_process'];
                        $arrParam2["f_wip_total_price"] = $f_wip_total_price; // 1
                        $arrParam2["f_under_total_price"] = NULL;
                        $arrParam2["f_net_total_price"] = NULL;
                    } else if ($_REQUEST['i_workin_process2'] == 0 && $_REQUEST['i_product_type'] == 0) { // วิ่งตามผังงบประมาณ
                        $arrParam = array(STATUS_ENABLE, STATUS_ENABLE, $_REQUEST['po_expense_id']);
                        $dc_acc = "	select c.dc_acc_id
                            from " . DB_CENTER . "dc_bg_acc_hdr  a
                            INNER JOIN " . DB_CENTER . "dc_bg_acc_dtl b on a.dc_bg_acc_hdr_id = b.dc_bg_acc_hdr_id
                            INNER JOIN " . DB_CENTER . "dc_acc c on c.dc_acc_id = b.dc_acc_id
                            where a.i_enable = ?  and  c.i_enable = ?  and c.i_last = 1 and c.i_group in(1,5)   and  a.bg_expense_id =  ?";
                        $stmt2 = $db->QueryParam($dc_acc, $arrParam);
                        $Fetch_dc_acc_id = $db->Fetch($stmt2);
                        $dc_acc_id = $Fetch_dc_acc_id["dc_acc_id"];
                        $arrParam2["dc_acc_id"] = $dc_acc_id ?? 0;  //0
                        $arrParam2["i_qty"] = $_REQUEST['i_qty']; //0
                        $arrParam2["i_workin_process"] = $_REQUEST['i_workin_process'];
                        $arrParam2["f_wip_total_price"] = NULL;   //($i_product_type == 1) ? 0 : $f_under_total_price; //floatVal($data["f_net_unit_price"]); //0
                        $arrParam2["f_under_total_price"] = NULL;
                        $arrParam2["f_net_total_price"] = $f_net_total_price; //0
                    } else if ($_REQUEST['i_workin_process'] == 0 && $_REQUEST['i_product_type'] == 2 && $_REQUEST['i_workin_process2'] == 0) { // ครุภัณฑ์  เข้าเกณฑ์
                        $arrParam = array(STATUS_ENABLE, $_REQUEST['am_mode_id']);
                        $dc_acc = "SELECT  a.dc_acc_id from " . DB_CENTER . "am_mode_acc a where a.i_enabled = ? and  am_mode_id = ?;";
                        $stmt2 = $db->QueryParam($dc_acc, $arrParam);
                        $Fetch_dc_acc_id = $db->Fetch($stmt2);
                        $dc_acc_id = $Fetch_dc_acc_id["dc_acc_id"];
                        $arrParam2["dc_acc_id"] = $dc_acc_id ?? 0;  //0
                        $arrParam2["i_qty"] = $_REQUEST['i_qty'];
                        $arrParam2["i_workin_process"] = $_REQUEST['i_workin_process'];
                        $arrParam2["f_wip_total_price"] = NULL;
                        $arrParam2["f_under_total_price"] = NULL; //1
                        $arrParam2["f_net_total_price"] = $f_net_total_price;
                    } else if ($_REQUEST['i_product_type'] == 1 && $_REQUEST['i_workin_process2'] == 0) {  // วัสดุ
                        $arrParam = array(STATUS_ENABLE, $_REQUEST['inv_mode_id']);
                        $dc_acc = "SELECT  dc_acc1_id as dc_acc_id from " . DB_CENTER . "inv_mode_acc   where i_enabled = ? and  inv_mode_id = ?;";
                        $stmt2 = $db->QueryParam($dc_acc, $arrParam);
                        $Fetch_dc_acc_id = $db->Fetch($stmt2);
                        $dc_acc_id = $Fetch_dc_acc_id["dc_acc_id"];
                        $arrParam2["dc_acc_id"] = $dc_acc_id ?? 0;  //0
                        $arrParam2["i_qty"] = $_REQUEST['i_qty'];
                        $arrParam2["i_workin_process"] = $_REQUEST['i_workin_process'];
                        $arrParam2["f_wip_total_price"] = NULL;
                        $arrParam2["f_under_total_price"] = NULL; //1
                        $arrParam2["f_net_total_price"] = $f_net_total_price;
                    } else if ($_REQUEST['i_workin_process'] == 0 && $_REQUEST['i_product_type'] == 2 && $_REQUEST['i_workin_process2'] == 1) { // ครุภัณฑ์  ต่ำกว่าเกณฑ์
                        $arrParam = array(STATUS_ENABLE, $_REQUEST['am_mode_id']);
                        $dc_acc = "SELECT  a.dc_acc3_id as dc_acc_id  from " . DB_CENTER . "am_mode_acc  a where a.i_enabled = ? and   am_mode_id = ? ;";
                        $stmt2 = $db->QueryParam($dc_acc, $arrParam);
                        $Fetch_dc_acc_id = $db->Fetch($stmt2);
                        $dc_acc_id = $Fetch_dc_acc_id["dc_acc_id"];
                        $arrParam2["dc_acc_id"] = $dc_acc_id ?? 0;  //0
                        $arrParam2["i_qty"] = $_REQUEST['i_qty'];
                        $arrParam2["i_workin_process"] = $_REQUEST['i_workin_process'];
                        $arrParam2["f_wip_total_price"] = NULL;
                        $arrParam2["f_under_total_price"] = $f_under_total_price; //1
                        $arrParam2["f_net_total_price"] = NULL;
                    } else if ($_REQUEST['i_workin_process'] == 1 && $_REQUEST['i_product_type'] == 2 && $_REQUEST['i_workin_process2'] == 0) {
                        // กรณีหลายงวด ก่อสร้าง ปรับปรุงอาคาร ค่าออกแบบ ค่าควบคุมงาน ซื้อครุภัณฑ์ ใช้บัญชี 10208010101
                        $arrParam = array(STATUS_ENABLE);
                        $dc_acc = "SELECT  a.dc_acc_id  FROM  " . DB_CENTER . "dc_acc a WHERE  a.c_code = '10208010101' and a.i_enable = ?";
                        $stmt2 = $db->QueryParam($dc_acc, $arrParam);
                        $Fetch_dc_acc_id = $db->Fetch($stmt2);
                        $dc_acc_id = $Fetch_dc_acc_id["dc_acc_id"];
                        $arrParam2["dc_acc_id"] = $dc_acc_id;
                        $arrParam2["i_qty"] = NULL;
                        $arrParam2["i_workin_process"] = $_REQUEST['i_workin_process'];
                        $arrParam2["f_wip_total_price"] = $f_wip_total_price; // 1
                        $arrParam2["f_under_total_price"] = NULL;
                        $arrParam2["f_net_total_price"] = NULL;
                    }
                    // บันทึกยอดลง f_net_total_price เสมอเมื่อสร้างหัวรายการและรายการตั้งหนี้ใหม่
                    $canonicalNetTotalPrice = (float)$f_net_total_price != 0
                        ? $f_net_total_price
                        : ((float)$f_wip_total_price != 0 ? $f_wip_total_price : $f_under_total_price);
                    $arrParam2["f_net_total_price"] = $canonicalNetTotalPrice;

                    foreach ($arrParam2 as $fld => $value) {
                        $arrValue[] = ($value != "") ? $value : null;
                        $addField .= ", {$fld}";
                        $addValue .= ", ?";
                    }
                    // print_r($arrParam2);
                    // exit;
                    $sql = "
                            SET NOCOUNT ON
                            INSERT INTO dbo.sp_tranf_item  (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");";
                    $stmt = $db->QueryParam($sql, $arrValue);
                } //next
            } //stmChkMaster
        } //End Else


        break;
    case "DEL_CHECKING_DTL":
//         print_r($_REQUEST);
//         exit();
        $ret_id = $_REQUEST['id'] ?? null;
        $stmt2 = true;
        $sql = "UPDATE dbo.sp_tranf_item  SET i_enabled = 2  WHERE sp_tranf_item_id = ?";
        $arrParam = array($ret_id);
        $stmt = $db->QueryParam($sql, $arrParam);
        break;
    case "AMTOACC": //ส่งไปบัญญชี
//        genAm2Acc(); //ส่งไปบัญญชี
        /*         * *
          รายการจัดซื้อ
          1. รายการสินทรัพย์ 1 รายการ 20 ชิ้น , บันทึกวันที่ตรวจรับ , (หมวดสินทรัพย์ => ผูกบัญชี) , เงิน 909,000.00 บาท
          ส่งบัญญชี (ต้องแยก => หมวดสินทรัพย์ ,ราคาตามเกณฑ์และต่ำกว่าเกณฑ์)
          1 รายการสินทรัพย์ 1 รายการ 9ชิ้น , บันทึกวันที่ตรวจรับ , (หมวดสินทรัพย์ => ผูกบัญชี) 900,000 (ตามเกณฑ์)
          2 รายการสินทรัพย์ 2 รายการ 11 ชิ้น , บันทึกวันที่ตรวจรับ , (หมวดสินทรัพย์ => ผูกบัญชี) 9,000 (ต่ำกว่าเกณฑ์)

         */
//         print_r($_REQUEST);
//         exit();
        $ret_id = $_REQUEST['id'] ?? null;
        $stmt2 = true;
        $sql = "DELETE FROM dbo.sp_tranf_item WHERE sp_tranf_item_id = ?";
        $arrParam = array($ret_id);
        $stmt = $db->QueryParam($sql, $arrParam);
        break;
    case "GENCHECKINGCODE":
        $ret_id = $data["id"];
        $data["dc_user_update_id"] = $_SESSION["user_id"] ?? 0;
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"] ?? 0;
        $data["d_update"] = date("Y-m-d H:i:s");

        function createFileJson($post) {
            $log_filename = "checkingTowithdraw/" . date('Y-m') . "/";
            if (!file_exists($log_filename)) {
                mkdir($log_filename, 0777, true);
            }
            $log_file_data = date('Y-m') . "checkingTowithdraw.json";
            $bytes = file_put_contents($log_file_data, ("," . json_encode($post) . "\n"), FILE_APPEND);
            //echo "Here is the myfile data $bytes.";
        }

        if ($data["i_status_checking"] == 0) { // รอการตรวจสอบ
            $i_status_checking = 0;
            $i_some = 0;
        } else if ($data["i_status_checking"] == 1) { // ผ่าน แบบปกติ
            $i_status_checking = 1;
            $i_some = 0;
            //createFileJson($data);
        } else if ($data["i_status_checking"] == 2) { // ผ่าน แบบบางส่วน
            $i_status_checking = 1;
            $i_some = 1;
        } else if ($data["i_status_checking"] == 3) { // ผ่าน แบบของทดแทน(เต็มจำนวนเงิน)
            $i_status_checking = 1;
            $i_some = 2;
        } else if ($data["i_status_checking"] == 4) { // ไม่ผ่าน
            $i_status_checking = 2;
            $i_some = 0;
        }

        $arrParam = array();
//------------อัพเดท mn m-------------------------
        $arrParam[] = $data["c_checking_code"]; //รอจาก MIS
        $arrParam[] = 1; //i_new_vat
        $arrParam[] = $data["c_egp_no"]; //รอจาก MIS
        $arrParam[] = $data["i_product_type"] > 0 ? 1 : 0; //สนแค่มีของ
        $arrParam[] = $date->bc_to_ad($data['d_checking_date']);
        $arrParam[] = $data["i_vat_amt"] ?? 0;   // i_vat_amt
        $arrParam[] = $data["i_tax_personalID"] ?? 0;     //i_tax_personal        //chk  หัก ณที่ จ่าย
        $arrParam[] = $data["i_rate"] ?? 0;

        $arrParam[] = !empty($data["f_vat_rate"]) ? str_replace(',', '', $data["f_vat_rate"]) : 0;
        $arrParam[] = !empty($data["f_tax_personal_rate"]) ? str_replace(',', '', $data["f_tax_personal_rate"]) : 0;
        $arrParam[] = !empty($data["f_tax_warranty_rate"]) ? str_replace(',', '', $data["f_tax_warranty_rate"]) : 0;

// แก้ใหม่ - ใช้ isset + strlen แทน เพื่อให้ค่า "0" ผ่านได้
        $arrParam[] = (isset($data["f_vat"]) && strlen(trim($data["f_vat"])) > 0) ? str_replace(',', '', $data["f_vat"]) : 0;

        $arrParam[] = (isset($data["f_tax_personalID2"]) && strlen(trim($data["f_tax_personalID2"])) > 0) ? str_replace(',', '', $data["f_tax_personalID2"]) : 0;

        $arrParam[] = (isset($data["f_warranty"]) && strlen(trim($data["f_warranty"])) > 0) ? str_replace(',', '', $data["f_warranty"]) : 0;

        $arrParam[] = !empty($data["f_total"]) ? str_replace(',', '', $data["f_total"]) : 0;
        $arrParam[] = !empty($data["f_inv"]) ? str_replace(',', '', $data["f_inv"]) : 0; // ;f_total_add_vat_amt
        $arrParam[] = !empty($data["f_fine"]) ? str_replace(',', '', $data["f_fine"]) : 0; // ;f_fine_amt

        $arrParam[] = !empty($data["f_other"]) ? str_replace(',', '', $data["f_other"]) : 0; // ;
        $arrParam[] = !empty($data["f_pay"]) ? str_replace(',', '', $data["f_pay"]) : 0; // ;f_fine_amt
        $arrParam[] = !empty($data["f_inv_vat"]) ? str_replace(',', '', $data["f_inv_vat"]) : 0;   // ;f_inv_vat
        $arrParam[] = !empty($data["i_edit_vat"]) ? $data["i_edit_vat"] : 0;   // ;i_edit_vat

        $arrParam[] = $i_status_checking; //ตรวจสอบแล้ว
        $arrParam[] = $data["f_fine"] == "0.00" ? null : 1;
        $arrParam[] = $i_some; //ตรวจสอบแล้ว
        $arrParam[] = $data["c_reason"];
        $arrParam[] = $data["i_is_warranty"];
        $arrParam[] = $data["i_notif_day"] ?? null;
        $arrParam[] = $data["warraty_age"] ?? null;
        $arrParam[] = !empty($data["i_warraty_end"]) ? $date->bc_to_ad($data['i_warraty_end']) : null;
//-------------------------------------
        $arrParam[] = $data["bg_budget_dtl_overlap_id"] ?? null;
        $arrParam[] = $data["i_yyyy_overlap"];
        $arrParam[] = $data["i_budget_year"];
        $arrParam[] = $data["i_type_transfer"];
        $arrParam[] = $data["i_doc_duo"] ?? null;
        $arrParam[] = $data["i_transfer_of_rights"] ?? null;
        $arrParam[] = $data["i_reserve_pay"] ?? null;
        $arrParam[] = $data["dc_creditor_transfer_id"];
        $arrParam[] = $data["dc_bank_acc_creditor_id"];
//-------------------------------------
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
// include period link so the check header can move between periods
//    $arrParam[] = $data["sp_tor_hdr_period_id"] ?? null; // new parameter
        $arrParam[] = $data["d_update"];
        $arrParam[] = $data["id"];
//-------------------------------------
        $arrParam[] = null; //c_arrival_code
        $arrParam[] = null; // $date->bc_to_ad($data['d_arrival_date']);
        $arrParam[] = $data["c_checking_code"];
        $arrParam[] = $date->bc_to_ad($data['d_checking_date']);
        $arrParam[] = $data["id"];

//-------------------------------------
// sp_check_period_hdr
        $sql = "UPDATE dbo.sp_check_period_hdr SET "
                . " i_is_waiting = NULL"
                . " , c_checking_code =?"
                . " , i_new_vat =?"
                . " , c_egp_no =?"
                . " , i_register_status =?"
                . " , d_checking_date=?"
                . " , i_vat_amt = ?"
                . " , i_tax_personal = ?"
                . " , i_rate = ?"
                . " , f_rate_vat = ?"
                . " , f_tax_personal_rate = ?"
                . " , f_tax_warranty_rate = ?"
                . " , f_vat_amt = ?"
                . " , f_tax_personal  = ?"
                . " , f_warranty = ?"
                . " , f_total = ? "
                . " , f_total_add_vat_amt  = ? "
                . " , f_fine_amt  = ?"
                . " , f_other = ? "
                . " , f_pay  = ? "
                . " , f_inv_vat  = ? "
                . " , i_edit_vat  = ? "
                . " , i_status_checking=?
                    , i_is_fine=?
                    , i_some=?
                    , c_reason = ?"
                . " , i_is_warranty = ?"
                . " , i_before = ?"
                . " , i_warranty_age = ?"
                . " , d_warranty_date = ?"
                . " , bg_budget_dtl_overlap_id = ?"
                . " , i_yyyy_overlap = ?"
                . " , i_yyyy = ?"
                . " , i_type_transfer = ?"
                . " , i_doc_duo = ?"
                . " , i_transfer_of_rights = ?"
                . " , i_reserve_pay = ?"
                . " , dc_creditor_transfer_id = ?"
                . " , dc_bank_acc_creditor_id = ?"
                //   . " , sp_tor_hdr_period_id = ?"  // link to period (allows updating the join value)
                . " , dc_user_update_id = ?"
                . " , dc_user_update_cost_id =?"
                . " , d_update=?"
                . "  WHERE sp_check_period_hdr_id = ?;
                ";
//sp_tranf_hdr
        $sql .= " UPDATE dbo.sp_tranf_hdr SET c_arrival_code=?,d_arrival_date=?,c_checking_code=?, d_checking_date=? WHERE sp_check_period_hdr_id = ?;";
//c_name dtl
        $arrParam[] = $data["c_name_dtl"];
        $arrParam[] = $data["id"];
        $sql .= "UPDATE dbo.sp_check_period_dtl SET c_name=? WHERE sp_check_period_hdr_id = ?";

        $stmt = $db->QueryParam($sql, $arrParam);
        if ($data["i_status_checking"] == 4) { //ไม่ผ่าน
            $i_contract_status = 5; // ตรวจรับพัสดุ/ครุภัณฑ์"
            $stmt2 = $db->QueryParam("update dbo.sp_tor_contract set i_contract_status= ? where sp_tor_contract_id = (select top 1 a.sp_tor_contract_id from sp_tor_contract a
                            inner join sp_tor_hdr_period b on b.sp_tor_contract_id=a.sp_tor_contract_id
                                                    WHERE b.sp_tor_hdr_period_id = ?)", array($i_contract_status, $_POST['sp_tor_hdr_period_id'] ?? null));

            $sql2 = "  Declare @hdr_period_id as bigint;
                                set @hdr_period_id =?;
                                delete from dbo.sp_check_period_dtl where sp_tor_dtl_period_id  in  (select sp_tor_dtl_period_id from dbo.sp_tor_dtl_period where sp_tor_hdr_period_id = @hdr_period_id);
                                delete from dbo.sp_tranf_hdr where sp_tor_hdr_period_id = @hdr_period_id;
                                delete from dbo.sp_tranf_item where sp_tranf_hdr_id  = (select top 1 sp_tranf_hdr_id from dbo.sp_tranf_hdr where sp_tor_hdr_period_id = @hdr_period_id);
                               ";

            $stmt3 = $db->QueryParam($sql2, array($ret_id));
            //$stmt2 = false;
        } else {
            $i_contract_status = 8; // ตรวจรับพัสดุ/ครุภัณฑ์"
            $stmt2 = $db->QueryParam("update dbo.sp_tor_contract set i_contract_status= ? where sp_tor_contract_id = (select top 1 a.sp_tor_contract_id from sp_tor_contract a
                            inner join sp_tor_hdr_period b on b.sp_tor_contract_id=a.sp_tor_contract_id
                                                    WHERE b.sp_tor_hdr_period_id = ?)", array($i_contract_status, $_POST['sp_tor_hdr_period_id'] ?? null));
            $stmt3 = true;
        }

        if ($data["c_name_dtl"] != "") {

            $arrValueUp[] = $data["c_name"];
            $arrValueUp[] = $data["sp_tor_hdr_period_id"];
            $arrValueUp[] = $data["id"];

            $sql = "UPDATE dbo.sp_check_period_dtl SET c_name=? WHERE sp_tor_hdr_period_id = ? AND sp_check_period_hdr_id = ?";
            $stmt = $db->QueryParam($sql, $arrValueUp);
        } else if ($data["i_is_fine"] == 1) {
            $addField = '';
            $dataField["i_fine"] = 1;
            $dataField["f_fine_amt"] = str_replace(',', '', $data["f_fine_amt"]);
            foreach ($dataField as $fldA => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ", {$fldA} = ?";
            }
            $arrValue[] = $data["sp_tor_hdr_period_id"];
            $sql = "UPDATE sp_tor_hdr_period SET " . substr($addField, 1) . " WHERE sp_tor_hdr_period_id = ?";
            $stmt = $db->QueryParam($sql, $arrValue);
        }
//*************RUN ITEMS EVENT & MENU*************************************************
// $arrParam3 = $sqlMain3;
        if ($data["submode"] == "modeEditAp") {

            //select
            $subSql = "select b.i_is_last, a.sp_tor_contract_id from dbo.sp_check_period_hdr a
                                    inner join sp_tor_hdr_period b on b.sp_tor_hdr_period_id = a.sp_tor_hdr_period_id
                                    where b.i_is_last = 1 and sp_check_period_hdr_id = ?";
            $f1 = $db->GetDataBySQL($subSql, array($data["id"]));

            $i_last_period = $f1['i_is_last'];
            $f2 = $db->GetDataBySQL("select sp_gl_monthly_hdr_id from dbo.sp_gl_monthly_hdr a where  i_enabled  = 1 and  a.sp_tor_hdr_period_id  = ?", array($data["sp_tor_hdr_period_id"]));

            $sp_gl_monthly_hdr_id = $f2;
            //select
            $sql = "UPDATE [dbo].sp_gl_monthly_hdr set i_enabled = 2 where i_is_checking = 1 and sp_tor_hdr_period_id = ?;
                            UPDATE [dbo].sp_gl_monthly_dtl set i_enabled = 2 where sp_gl_monthly_hdr_id = ?;";

            $stmt3 = $db->QueryParam($sql, array($data['sp_tor_hdr_period_id'], $sp_gl_monthly_hdr_id));
            //select   dc_user_update_id
            $stmt3 = $db->QueryParam(" EXEC dbo.SP_CHECKING_GL ?, ?, ?", array($data["id"], $_SESSION['user_id'], $_SESSION['dc_cost_id']));
            if ($i_last_period) {
                $stmt3 = $db->QueryParam(" EXEC dbo.SP_CHECKING_GL_LAST ?, ?, ?", array($f1["sp_tor_contract_id"], $_SESSION['user_id'], $_SESSION['dc_cost_id']));
            }
        } //แก้ไข
        break;

    case "UPDATE_DCACC":
        $root = "data";
        $data = array();
        $msg = "";
// ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
// ============== //
        $Arr = json_decode($_REQUEST["dc_acc_arr"], true);
        $bg_code = substr($_REQUEST["bg_expense"], 0, 2);
// $_REQUEST["bg_expense_name"];
        $chk_bg = [05, 07, 10]; // ผังงบประมาณที่สามารถแก้ไขได้

        if (in_array($bg_code, $chk_bg)) {
            $arrParam2 = array(STATUS_ENABLE, $_REQUEST['bg_expense_id'], STATUS_ENABLE);
            $dc_acc = "	select top 1 isnull(a.dc_bg_acc_hdr_id,0) as dc_bg_acc_hdr_id
                    from " . DB_CENTER . "dc_bg_acc_hdr  a
                    INNER JOIN " . DB_CENTER . "dc_bg_acc_dtl b on a.dc_bg_acc_hdr_id = b.dc_bg_acc_hdr_id
                    where a.i_enable = ?  and  a.bg_expense_id =  ?  and
                    b.i_type_dr_cr = 1  and b.i_enable = ?  ";
            $stmt2 = $db->QueryParam($dc_acc, $arrParam2);

            $Fetch_dc_acc_id = $db->Fetch($stmt2);
            $dc_bg_acc_hdr_id = $Fetch_dc_acc_id["dc_bg_acc_hdr_id"];

            if ($dc_bg_acc_hdr_id > 0) {   // ผังบัญชีถ้ามีอยู่แล้ว อัพเดทตัวเดิมไม่ใช้งาน แล้วสร้างตัวใหม่
                $addField = "";
                $addValue = "";
                unset($arrParam);
                // ก่อนอัพเดท วิ่งไปหาข้อมูล dc_bg_acc_dtl_id มาเป็นเงื่อนไขในการอัพเดท
                $arrParam["dc_bg_acc_hdr_id"] = $dc_bg_acc_hdr_id;
                $arrParam["i_type_dr_cr"] = 1;
                $arrParam["dc_acc_id"] = $Arr[0]["dc_acc_id"];
                $arrParam["c_comment"] = 'อัพเดทโดยระบบจัดซื้อ วันที่ ' . date("Y-m-d");

                $arrParam["i_enable"] = 1;
                $arrParam["dc_user_create_id"] = $_SESSION['dc_center_user'];
                $arrParam["dc_user_create_cost_id"] = $_SESSION['dc_cost_id'];
                $arrParam["d_create"] = date("Y-m-d H:i:s");
                $arrParam["dc_user_update_id"] = $_SESSION['dc_center_user'];
                $arrParam["dc_user_update_cost_id"] = $_SESSION['dc_cost_id'];
                $arrParam["d_update"] = date("Y-m-d H:i:s");
                // $stmt = $db->QueryParam($sql, $arrValue);
                foreach ($arrParam as $fld => $value) {
                    $arrValue[] = ($value != "") ? $value : null;
                    $addField .= ", {$fld}";
                    $addValue .= ", ?";
                }
                $sql = "
                        SET NOCOUNT ON
                        UPDATE " . DB_CENTER . "dc_bg_acc_dtl   SET i_enable = 2 WHERE dc_bg_acc_hdr_id =  $dc_bg_acc_hdr_id and i_type_dr_cr = 1  and i_enable = 1 ;
                        INSERT INTO " . DB_CENTER . "dc_bg_acc_dtl  (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");";
                $arrValue = array_values($arrValue);
                $stmt = $db->QueryParam($sql, $arrValue);
            } else { // // ผังบัญชีไม่มี  สร้างตัวใหม่
                // รีเซ็ตตัวแปร
                $addFieldHdr = "";
                $addValueHdr = "";
                $arrValueHdr = [];
                // ข้อมูลสำหรับ dc_bg_acc_hdr (สิ้นสุดที่ i_type_dr_cr)
                $arrHdr = [
                    "bg_expense_id" => $_REQUEST['bg_expense_id'],
                    "c_name" => $_REQUEST['bg_expense_name'],
                    "c_comment" => 'นำเข้าจากระบบจัดซื้อ วันที่ ' . date("Y-m-d"),
                    "i_enable" => 1,
                    "i_delete" => 2,
                    "dc_user_create_id" => $_SESSION['dc_center_user'],
                    "dc_user_create_cost_id" => $_SESSION['dc_cost_id'],
                    "d_create" => date("Y-m-d H:i:s"),
                    "dc_user_update_id" => $_SESSION['dc_center_user'],
                    "dc_user_update_cost_id" => $_SESSION['dc_cost_id'],
                    "d_update" => date("Y-m-d H:i:s"),
                ];

                // วนลูปสร้างฟิลด์และค่า สำหรับ dc_bg_acc_hdr
                foreach ($arrHdr as $fld => $value) {
                    $arrValueHdr[] = ($value != "") ? $value : null;
                    $addFieldHdr .= ", {$fld}";
                    $addValueHdr .= ", ?";
                }

                // รีเซ็ตตัวแปรสำหรับ dc_bg_acc_dtl
                $addFieldDtl = "dc_bg_acc_hdr_id"; // เพิ่มฟิลด์ dc_bg_acc_hdr_id สำหรับ dc_bg_acc_dtl
                $addValueDtl = "?"; // Placeholder สำหรับ dc_bg_acc_hdr_id
                $arrValueDtl = null; // ค่าเริ่มต้นของ dc_bg_acc_hdr_id จะถูกแทนที่ด้วยค่า ID ใหม่
                // ข้อมูลเพิ่มเติมสำหรับ dc_bg_acc_dtl
                $arrDtl = [
                    "i_type_dr_cr" => 1, // ใส่ค่าเป็นตัวเลข
                    "gl_map_acc_id" => '0', // ใส่ค่าเป็นตัวเลข
                    "dc_acc_id" => $Arr[0]["dc_acc_id"],
                    "c_comment" => 'นำเข้าจากระบบจัดซื้อ วันที่ ' . date("Y-m-d"),
                    "i_enable" => 1,
                    "dc_user_create_id" => $_SESSION['dc_center_user'],
                    "dc_user_create_cost_id" => $_SESSION['dc_cost_id'],
                    "d_create" => date("Y-m-d H:i:s"),
                    "dc_user_update_id" => $_SESSION['dc_center_user'],
                    "dc_user_update_cost_id" => $_SESSION['dc_cost_id'],
                    "d_update" => date("Y-m-d H:i:s")
                ];
                // วนลูปสร้างฟิลด์และค่า สำหรับ dc_bg_acc_dtl
                foreach ($arrDtl as $fld => $value) {
                    $arrValueDtl[] = ($value != "") ? $value : null;
                    $addFieldDtl .= ", {$fld}";
                    $addValueDtl .= ", ?";
                };
                // สร้าง SQL Query
                $sql = "
                        SET NOCOUNT ON;

                        -- INSERT INTO dc_bg_acc_hdr
                        INSERT INTO " . DB_CENTER . "dc_bg_acc_hdr (" . substr($addFieldHdr, 1) . ")
                        VALUES (" . substr($addValueHdr, 1) . ");

                        -- ดึงค่า ID ล่าสุดที่เพิ่ง INSERT
                        DECLARE @NewHdrId INT;
                        SET @NewHdrId = SCOPE_IDENTITY();

                        -- INSERT INTO dc_bg_acc_dtl โดยใช้ค่า ID ที่ได้จาก SCOPE_IDENTITY()
                        INSERT INTO " . DB_CENTER . "dc_bg_acc_dtl (" . $addFieldDtl . ")
                        VALUES (@NewHdrId " . substr($addValueDtl, 1) . ");
                        ";

                // รวมค่าที่จะส่งเข้า QueryParamdd
                $arrValue = array_merge($arrValueHdr, $arrValueDtl);
                $stmt = $db->QueryParam($sql, $arrValue);
            }
        }
        $root = "data";
        $data = array();
        $temp = array();
        $con = null;

        $addField = null;
        $addValue = null;
        $fldA = null;
        unset($data);
        unset($arrParam);
        unset($fldA);
        unset($arrValue);

        foreach ($Arr as $fldd) {
            // รีเซ็ตตัวแปรในแต่ละรอบ
            $arrParam = array();
            $arrValue = array();
            $addField = "";

            // สร้าง $arrParam สำหรับการอัพเดต
            $arrParam["dc_acc_id"] = $fldd["dc_acc_id"];
            $arrParam["i_edit"] = 1;
            $arrParam["f_wip_total_price"] = !empty($fldd["f_wip_total_price"]) ? str_replace(',', '', $fldd["f_wip_total_price"]) : 0;  // งานระหว่างดำเนินการ
            $arrParam["f_under_total_price"] = !empty($fldd["f_under_total_price"]) ? str_replace(',', '', $fldd["f_under_total_price"]) : 0;
            ; // ครุภัณฑ์
            $netTotalPrice = !empty($fldd["f_net_total_price"]) ? str_replace(',', '', $fldd["f_net_total_price"]) : 0;
            if ((float)$netTotalPrice == 0) {
                $netTotalPrice = !empty($fldd["f_wip_total_price"])
                    ? str_replace(',', '', $fldd["f_wip_total_price"])
                    : (!empty($fldd["f_under_total_price"]) ? str_replace(',', '', $fldd["f_under_total_price"]) : 0);
            }
            $arrParam["f_net_total_price"] = $netTotalPrice;
            $arrParam["f_sum_Transf"] = !empty($fldd["f_net_total"]) ? str_replace(',', '', $fldd["f_net_total"]) : 0; // วิ่งตามผังงบประมาณ / วัสดุ
            $arrParam["f_vat_amt"] = isset($fldd["f_vat_amt"]) && $fldd["f_vat_amt"] !== null ? floatval(str_replace(',', '', $fldd["f_vat_amt"])) : null;
            $arrParam["dc_user_update_id"] = $_SESSION["user_id"];
            $arrParam["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
            $arrParam["d_update"] = date("Y-m-d H:i:s");
            // สร้าง SQL Query และค่า
            foreach ($arrParam as $fldA => $value) {
                // ใช้ strict comparison สำหรับค่า 0
                if ($value === 0 || $value === "0" || $value === 0.0) {
                    $arrValue[] = $value;
                } else {
                    $arrValue[] = ($value !== "" && $value !== null) ? $value : null;
                }
                $addField .= ", {$fldA} = ?";
            }

            // เพิ่มเงื่อนไขสำหรับ WHERE
            $arrValue[] = $fldd["sp_tranf_item_id"];
            // สร้าง SQL สำหรับการอัพเดต
            $sql = "UPDATE sp_tranf_item SET" . substr($addField, 1) . " WHERE sp_tranf_item_id = ?
                    SELECT @@IDENTITY as sp_tranf_item_id";
            $stmt = $db->QueryParam($sql, $arrValue);
            if (@$_REQUEST["show_sql"]) {
                $sql = (@$sqlMain) ? $sqlMain : $sql;
                $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());
                $sql = str_replace('?', '#-#', $sql);
                foreach ($arr as $fld => $value) {
                    $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
                }
                echo $sql;
                exit;
            }
            $ret_id = $fldd["sp_tranf_item_id"];
        } // ปิด foreach ($Arr as $fldd)
// ===== เพิ่มส่วนนี้ =====
        $totalVat = 0;
        foreach ($Arr as $fldd) {
            if (isset($fldd["f_vat_amt"]) && $fldd["f_vat_amt"] !== null) {
                $totalVat += floatval(str_replace(',', '', $fldd["f_vat_amt"]));
            }
        }
        if (!empty($Arr[0]["sp_tranf_item_id"])) {
            $sp_check_period_hdr_id = $db->GetDataBySQL(
                    "SELECT TOP 1 sp_check_period_hdr_id FROM sp_tranf_item WHERE sp_tranf_item_id = ?",
                    array($Arr[0]["sp_tranf_item_id"])
            );
            if ($sp_check_period_hdr_id) {
                $db->QueryParam(
                        "UPDATE sp_check_period_hdr SET f_vat_amt = ?, d_update = ? WHERE sp_check_period_hdr_id = ?",
                        array($totalVat, date("Y-m-d H:i:s"), $sp_check_period_hdr_id)
                );
            }
        }
// =======================
// exit;
        break;
    case "UPDATE_DCACC_CONFIRM":
        $arrData = json_decode($_POST['dc_acc_arr'], true);
        if (empty($_SESSION['user_id'])) {
            echo "Session หมดอายุ";
            exit();
        } else {

            $info[1] = $_SESSION['user_id'];
            $info[2] = $_SESSION['dc_cost_id'];
            $info[3] = date('Y-m-d H:i:s'); // วันที่และเวลา ปัจจุบัน
        }


        foreach ($arrData as $fldd) {
            // รีเซ็ตตัวแปรในแต่ละรอบ
            $arrParam = array();
            $arrValue = array();
            $addField = "";

            // สร้าง $arrParam สำหรับการอัพเดต
//            $arrParam["dc_acc_id"]               = $fldd["dc_acc_id"];
            $arrParam["i_edit"] = 1;
//            $arrParam["f_wip_total_price"]       = !empty($fldd["f_wip_total_price"]) ? str_replace(',', '', $fldd["f_wip_total_price"]) : 0;  // งานระหว่างดำเนินการ
//            $arrParam["f_under_total_price"]     = !empty($fldd["f_under_total_price"]) ? str_replace(',', '', $fldd["f_under_total_price"]) : 0;; // ครุภัณฑ์
            $netTotalPrice = !empty($fldd["f_net_total_price"]) ? str_replace(',', '', $fldd["f_net_total_price"]) : 0;
            if ((float)$netTotalPrice == 0) {
                $netTotalPrice = !empty($fldd["f_wip_total_price"])
                    ? str_replace(',', '', $fldd["f_wip_total_price"])
                    : (!empty($fldd["f_under_total_price"]) ? str_replace(',', '', $fldd["f_under_total_price"]) : 0);
            }
            $arrParam["f_net_total_price"] = $netTotalPrice;
//            $arrParam["f_sum_Transf"]            = !empty($fldd["f_net_total"]) ? str_replace(',', '', $fldd["f_net_total"]) : 0; // วิ่งตามผังงบประมาณ / วัสดุ
            $arrParam["f_vat_amt"] = isset($fldd["f_vat_amt"]) && $fldd["f_vat_amt"] !== null ? floatval(str_replace(',', '', $fldd["f_vat_amt"])) : null;
            $arrParam["dc_user_update_id"] = $_SESSION["user_id"];
            $arrParam["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
            $arrParam["d_update"] = date("Y-m-d H:i:s");
            // สร้าง SQL Query และค่า
            foreach ($arrParam as $fldA => $value) {
                // ใช้ strict comparison สำหรับค่า 0
                if ($value === 0 || $value === "0" || $value === 0.0) {
                    $arrValue[] = $value;
                } else {
                    $arrValue[] = ($value !== "" && $value !== null) ? $value : null;
                }
                $addField .= ", {$fldA} = ?";
            }

            // เพิ่มเงื่อนไขสำหรับ WHERE
            $arrValue[] = $fldd["sp_tranf_item_id"];
            // สร้าง SQL สำหรับการอัพเดต
            $sql = "UPDATE sp_tranf_item SET" . substr($addField, 1) . " WHERE sp_tranf_item_id = ? SELECT @@IDENTITY as sp_tranf_item_id";
            $stmt = $db->QueryParam($sql, $arrValue);
            $ret_id = $fldd["sp_tranf_item_id"];
        } // ปิด foreach ($Arr as $fldd)

        $f_pay = str_replace(',', '', $_REQUEST['f_pay']);
        $f_inv_vat = str_replace(',', '', $_REQUEST['f_inv_vat']);
        $f_vat = str_replace(',', '', $_REQUEST['f_vat']);
        $f_inv = str_replace(',', '', $_REQUEST['f_inv']);

        $id = $_REQUEST['sp_check_period_hdr_id'] ?? null;

        $arrValue = [$f_pay, $f_inv_vat, $f_vat, $f_inv, $info[1], $info[2], $info[3], $id];
        $sql = "update sp_check_period_hdr set i_register = 1 ,i_is_register = 1  ,
                        f_pay= ?,f_inv_vat = ? ,f_vat_amt= ?,f_total_add_vat_amt = ?
                    , dc_user_update_id =?   , dc_user_update_cost_id =?  , d_update = ? where sp_check_period_hdr_id =?";
//        echo $db->debugSql($sql, $arrValue);
//        exit();
        $stmt = $db->QueryParam($sql, $arrValue);
        break;
    case "UP_BG_RESERVE_MONEY":
        $data = array();
// ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
// ============== //
        $data["sp_tor_id"] = $_REQUEST["sp_tor_id"];
        $data["sp_tor_contract_id"] = $_REQUEST["sp_tor_contract_id"];
        $data["i_yyyy"] = $_REQUEST["i_yyyy"];
        $data["dc_expense_budget_type_id"] = $_REQUEST["dc_expense_budget_type_id"];
        $data["po_expense_id"] = $_REQUEST['po_expense_id'];
        $data["i_is_last"] = $_REQUEST["i_is_last"];
        $data["i_pr_type1"] = $_REQUEST["i_pr_type1"];
        $data["f_net_total_price"] = str_replace(',', '', $_REQUEST["f_net_total_price"]);
        $data["d_update"] = date("Y-m-d H:i:s");
        foreach ($data as $fld => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField .= ", {$fld}";
            $addValue .= ", ?";
        }
        $sql = "DECLARE @sp_tor_id bigint = ?
                        DECLARE @sp_tor_contract_id bigint = ?
                        DECLARE @i_yyyy  bigint = ?
                        DECLARE @dc_expense_budget_type_id  bigint = ?
                        DECLARE @bg_expense_id  bigint = ?
                        DECLARE @i_is_last  bigint = ?
                        DECLARE @i_pr_type1  bigint = ?
                        DECLARE @f_amt2 decimal(18,2) = ?
                        DECLARE @d_update datetime = ?

                            DECLARE @pr_id bigint = (
                                select
                                bg_reserve_money_id
                                from nmu..bg_reserve_money
                                where pr_id = @sp_tor_id
                                and po_id  is  null
                                and i_enable = 1
                                and i_reserve = 1
                                and i_sys = 1
                                and i_year = @i_yyyy
                                and chk_id is  null )

                            DECLARE @po_id bigint = (
                                select
                                bg_reserve_money_id
                                from nmu..bg_reserve_money
                                where pr_id = @sp_tor_id
                                and po_id = @sp_tor_contract_id
                                and i_enable = 1
                                and i_reserve = 2
                                and i_sys = 1
                                and i_year = @i_yyyy
                                and chk_id is  null )

                            DECLARE @f_amt decimal(18,2) = (
                                select
                                sum(f_amt)
                                from nmu..bg_reserve_money
                                where pr_id = @sp_tor_id
                                and i_enable = 1
                                and i_sys = 1
                                and i_reserve in (1,2)
                                and i_year = @i_yyyy
                                and chk_id is  null )

                                UPDATE NMU.dbo.bg_reserve_money SET f_amt  = (@f_amt + @f_amt2  )  where bg_reserve_money_id in (@pr_id,@po_id)
                                SELECT @@IDENTITY as bg_reserve_money_id ";
        $stmt = $db->QueryParam($sql, $arrValue);
        $bg_id = $db->Fetch($stmt);
        $ret_id = $bg_id["bg_reserve_money_id"];
        break;
    case "Billed_Last_Month":
        $data = array();
// ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
// ============== //
        $data["c_Billing_code"] = $_REQUEST["c_Billing_code"];
// $data["d_doc_arrive_dt"] = $_REQUEST["d_update_date"];
        $data["sp_check_period_hdr_id"] = $_REQUEST["sp_check_period_hdr_id"];

        foreach ($data as $fld => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField .= ", {$fld}";
            $addValue .= ", ?";
        }
        $sql = "UPDATE sp_check_period_hdr SET c_billing_code  = ?   where sp_check_period_hdr_id =  ?
                SELECT @@IDENTITY as sp_check_period_hdr_id";
        $stmt = $db->QueryParam($sql, $arrValue);
        $bg_id = $db->Fetch($stmt);
        $ret_id = $bg_id["sp_check_period_hdr_id"];
        break;

    case "getBookingType":
        echo $_REQUEST["mode"] . " TEST";
        exit();
// ตอบค่าประเภทการจองเงิน (1 = เงินแผน, 2 = เงินงวด) จากตาราง sp_tor_hdr_period หรือ sp_check_period_hdr
        $i_pr_type = 0;
        $sp_tor_hdr_period_id = $_REQUEST["sp_tor_hdr_period_id"] ?? null;
        $sp_check_period_hdr_id = $_REQUEST["sp_check_period_hdr_id"] ?? null;
        if ($sp_tor_hdr_period_id) {
            $tmp = $db->GetDataBySQL(
                    "select top 1 a.i_pr_type2 as val
             from dbo.sp_tor_contract a
             inner join dbo.sp_tor_hdr_period b on b.sp_tor_contract_id = a.sp_tor_contract_id
             where b.sp_tor_hdr_period_id = ?",
                    array($sp_tor_hdr_period_id)
            );
            if ($tmp) {
                $i_pr_type = intval($tmp["val"]);
            }
        }
        if (!$i_pr_type && $sp_check_period_hdr_id) {
            $tmp = $db->GetDataBySQL(
                    "select top 1 a.i_pr_type2 as val
             from dbo.sp_tor_contract a
             inner join dbo.sp_check_period_hdr b on b.sp_tor_contract_id = a.sp_tor_contract_id
             where b.sp_check_period_hdr_id = ?",
                    array($sp_check_period_hdr_id)
            );
            if ($tmp) {
                $i_pr_type = intval($tmp["val"]);
            }
        }
        $re = array("success" => "Success", "i_pr_type" => $i_pr_type, "i_pr_type2" => $i_pr_type);
        echo json_encode($re);
        exit;
        break;
    case "updateMaterialType":

        $stmt1 = true;
        $stmt2 = true;
        $stmt3 = true;
        $stmt4 = true;

        if (empty($_SESSION['user_id'])) {
            echo "Session หมดอายุ";
            exit();
        } else {

            $info[1] = $_SESSION['user_id'];
            $info[2] = $_SESSION['dc_cost_id'];
            $info[3] = date('Y-m-d H:i:s'); // วันที่และเวลา ปัจจุบัน
        }

//

        if ($_REQUEST && !empty($_REQUEST['sp_tor_hdr_period_id'])) {

            $id = $_REQUEST['sp_tor_hdr_period_id'];
            $i_product_types = $_REQUEST["i_product_types"];
            $array = json_decode($i_product_types);
            $val = intval($array[0]);

            // อัพเดท sp_tor_contract (booking type)
            $sql1 = "UPDATE dbo.sp_tor_dtl_period SET i_product_type = ? "
                    . " , dc_user_update_id =? "
                    . " , dc_user_update_cost_id =? "
                    . " , d_update = ?"
                    . " WHERE sp_tor_hdr_period_id = ?; ";
            $sql1 .= "UPDATE dbo.sp_check_period_dtl SET i_product_type = ? "
                    . " , dc_user_update_id =? "
                    . " , dc_user_update_cost_id =? "
                    . " , d_update = ?"
                    . " WHERE sp_tor_hdr_period_id = ?;";

            $arrValue1 = array($val, $info[1], $info[2], $info[3], $id
                , $val, $info[1], $info[2], $info[3], $id);
//           echo $sql1; print_r($arrValue1); exit();
            $stmt1 = $db->QueryParam($sql1, $arrValue1);
        }

        if (!$stmt1 || !$stmt2 || !$stmt3 || !$stmt4) {
            break;
        }


        if (!$stmt1 || !$stmt2 || !$stmt3 || !$stmt4) {
            $stmt = false;
            $sql = "SQL Error: Failed to update type in one or more tables";
        } else {
            $stmt = true;
            $sql = "Success: Updated type in all tables";
        }

        $ret_id = $id;
        break;
    case "updateBookingType3": break;
    case "updateBillingDate":
        $stmt1 = true;
        $stmt2 = true;
        $stmt3 = true;
        $stmt4 = true;
        if (empty($_SESSION['user_id'])) {
            echo "Session หมดอายุ";
            exit();
        } else {

            $info[1] = $_SESSION['user_id'];
            $info[2] = $_SESSION['dc_cost_id'];
            $info[3] = date('Y-m-d H:i:s'); // วันที่และเวลา ปัจจุบัน
        }

        if ($_REQUEST && !empty($_REQUEST['sp_tor_hdr_period_id'])) {

            $id = $_REQUEST['sp_tor_hdr_period_id'];
            if (!empty($_REQUEST["d_doc_arrive_dt"])) {
                $d_doc_arrive_dt = $_REQUEST["d_doc_arrive_dt"];
                $val = $d_doc_arrive_dt . " " . date('H:i:s');
                // อัพเดท sp_tor_contract (booking type)
                $sql1 = "UPDATE dbo.sp_check_period_hdr SET d_doc_arrive_dt = ? ,  d_arrive_date = ? "
                        . " , dc_user_update_id =? "
                        . " , dc_user_update_cost_id =? "
                        . " , d_update = ?"
                        . " WHERE sp_tor_hdr_period_id = ?";
                $arrValue1 = array($val, $val, $info[1], $info[2], $info[3], $id);
            } elseif (!empty($_REQUEST["d_checking_date"])) {
                $d_checking_date = $_REQUEST["d_checking_date"];
                $val = $d_checking_date . " " . date('H:i:s');
                // อัพเดท sp_tor_contract (booking type)
                $sql1 = "UPDATE dbo.sp_check_period_hdr SET d_checking_date = ? "
                        . " , dc_user_update_id =? "
                        . " , dc_user_update_cost_id =? "
                        . " , d_update = ?"
                        . " WHERE sp_tor_hdr_period_id = ?";
                $arrValue1 = array($val, $info[1], $info[2], $info[3], $id);
            }




//           echo $db->debugSql($sql1,$arrValue1);
//           exit();
            $stmt1 = $db->QueryParam($sql1, $arrValue1);
        }

        if (!$stmt1 || !$stmt2 || !$stmt3 || !$stmt4) {
            break;
        }

        if (!$stmt1 || !$stmt2 || !$stmt3 || !$stmt4) {
            $stmt = false;
            $sql = "SQL Error: Failed to update type in one or more tables";
        } else {
            $stmt = true;
            $sql = "Success: Updated type in all tables";
        }

        $ret_id = $id;
        break;
    case "updateExpenseType":
        $stmt1 = true;
        $stmt2 = true;
        $stmt3 = true;
        $stmt4 = true;

        if (empty($_SESSION['user_id'])) {
            echo "Session หมดอายุ";
            exit();
        } else {

            $info[1] = $_SESSION['user_id'];
            $info[2] = $_SESSION['dc_cost_id'];
            $info[3] = date('Y-m-d H:i:s'); // วันที่และเวลา ปัจจุบัน
        }
        if ($_REQUEST && !empty($_REQUEST['sp_tor_hdr_period_id'])) {

            $id = $_REQUEST['sp_tor_hdr_period_id'];
            $jsons = $_REQUEST["dc_expense_budget_type_ids"];
            $array = json_decode($jsons);
            $val = intval($array[0]);
            //  dc_bg_budget_type_id po_expense_id
            // อัพเดท sp_tor_contract (booking type)
            $sql1 = "UPDATE dbo.sp_tor_dtl_period SET dc_bg_budget_type_id = ? "
                    . " , dc_user_update_id =? "
                    . " , dc_user_update_cost_id =? "
                    . " , d_update = ?"
                    . " WHERE sp_tor_hdr_period_id = ?; ";
            $sql1 .= "UPDATE dbo.sp_check_period_dtl SET dc_bg_budget_type_id = ? "
                    . " , dc_user_update_id =? "
                    . " , dc_user_update_cost_id =? "
                    . " , d_update = ?"
                    . " WHERE sp_tor_hdr_period_id = ?;";

            $arrValue1 = array($val, $info[1], $info[2], $info[3], $id
                , $val, $info[1], $info[2], $info[3], $id);
//           echo $sql1; print_r($arrValue1); exit();
            $stmt1 = $db->QueryParam($sql1, $arrValue1);
        }

        if (!$stmt1 || !$stmt2 || !$stmt3 || !$stmt4) {
            break;
        }


        if (!$stmt1 || !$stmt2 || !$stmt3 || !$stmt4) {
            $stmt = false;
            $sql = "SQL Error: Failed to update type in one or more tables";
        } else {
            $stmt = true;
            $sql = "Success: Updated type in all tables";
        }

        $ret_id = $id;
        break;
    case "updateExpense":
        $stmt1 = true;
        $stmt2 = true;
        $stmt3 = true;
        $stmt4 = true;

        if (empty($_SESSION['user_id'])) {
            echo "Session หมดอายุ";
            exit();
        } else {

            $info[1] = $_SESSION['user_id'];
            $info[2] = $_SESSION['dc_cost_id'];
            $info[3] = date('Y-m-d H:i:s'); // วันที่และเวลา ปัจจุบัน
        }
        if ($_REQUEST && !empty($_REQUEST['sp_tor_hdr_period_id'])) {

            $id = $_REQUEST['sp_tor_hdr_period_id'];
            $jsons = $_REQUEST["po_expense_ids"];
            $array = json_decode($jsons);
            $val = intval($array[0]);
            $sql1 = "UPDATE dbo.sp_tor_dtl_period SET po_expense_id = ? "
                    . " , dc_user_update_id =? "
                    . " , dc_user_update_cost_id =? "
                    . " , d_update = ?"
                    . " WHERE sp_tor_hdr_period_id = ?; ";
            $sql1 .= "UPDATE dbo.sp_check_period_dtl SET po_expense_id = ? "
                    . " , dc_user_update_id =? "
                    . " , dc_user_update_cost_id =? "
                    . " , d_update = ?"
                    . " WHERE sp_tor_hdr_period_id = ?;";
            $arrValue1 = array($val, $info[1], $info[2], $info[3], $id
                , $val, $info[1], $info[2], $info[3], $id);
//           echo $db->debugSql($sql1,$arrValue1); exit();
            $stmt1 = $db->QueryParam($sql1, $arrValue1);
        }

        if (!$stmt1 || !$stmt2 || !$stmt3 || !$stmt4) {
            break;
        }


        if (!$stmt1 || !$stmt2 || !$stmt3 || !$stmt4) {
            $stmt = false;
            $sql = "SQL Error: Failed to update type in one or more tables";
        } else {
            $stmt = true;
            $sql = "Success: Updated type in all tables";
        }

        $ret_id = $id;
        break;
    case "updateIyyyyOverlap":
        $stmt1 = true;
        $stmt2 = true;
        $stmt3 = true;
        $stmt4 = true;

        if (empty($_SESSION['user_id'])) {
            echo "Session หมดอายุ";
            exit();
        } else {

            $info[1] = $_SESSION['user_id'];
            $info[2] = $_SESSION['dc_cost_id'];
            $info[3] = date('Y-m-d H:i:s'); // วันที่และเวลา ปัจจุบัน
        }
        if ($_REQUEST && !empty($_REQUEST['sp_tor_hdr_period_id'])) {

            $id = $_REQUEST['sp_tor_hdr_period_id'];
            $jsons = $_REQUEST["i_yyyy_overlaps"];
            $array = json_decode($jsons);
            $val = intval($array[0]);
            $sql1 = "UPDATE dbo.sp_check_period_hdr SET i_yyyy_overlap = ? "
                    . " , dc_user_update_id =? "
                    . " , dc_user_update_cost_id =? "
                    . " , d_update = ?"
                    . " WHERE sp_tor_hdr_period_id = ?; ";
            $arrValue1 = array($val, $info[1], $info[2], $info[3], $id);
//           echo $db->debugSql($sql1,$arrValue1); exit();
            $stmt1 = $db->QueryParam($sql1, $arrValue1);
        }

        if (!$stmt1 || !$stmt2 || !$stmt3 || !$stmt4) {
            break;
        }


        if (!$stmt1 || !$stmt2 || !$stmt3 || !$stmt4) {
            $stmt = false;
            $sql = "SQL Error: Failed to update type in one or more tables";
        } else {
            $stmt = true;
            $sql = "Success: Updated type in all tables";
        }

        $ret_id = $id;
        break;
    case "updateBillingDocRef":
        $stmt1 = true;
        $stmt2 = true;
        $stmt3 = true;
        $stmt4 = true;

        if (empty($_SESSION['user_id'])) {
            echo "Session หมดอายุ";
            exit();
        } else {

            $info[1] = $_SESSION['user_id'];
            $info[2] = $_SESSION['dc_cost_id'];
            $info[3] = date('Y-m-d H:i:s'); // วันที่และเวลา ปัจจุบัน
        }
        if ($_REQUEST && !empty($_REQUEST['sp_tor_hdr_period_id'])) {

            $id = $_REQUEST['sp_check_period_hdr_id'];
//            $jsons = $_REQUEST["c_doc_ref"];
//            $array = json_decode($jsons);
            $val = $_REQUEST["c_doc_ref"];
            $sql1 = "UPDATE dbo.sp_check_period_hdr SET c_doc_ref = ?  , c_billing_code = ? "
                    . " , dc_user_update_id =? "
                    . " , dc_user_update_cost_id =? "
                    . " , d_update = ?"
                    . " WHERE sp_check_period_hdr_id = ?; ";
            $sql1 .= "UPDATE dbo.sp_check_billing_items SET c_doc_ref = ? "
                    . " , dc_user_update_id =? "
                    . " , dc_user_update_cost_id =? "
                    . " , d_update = ?"
                    . " WHERE sp_check_period_hdr_id = ?; ";

            $arrValue1 = array($val, $val, $info[1], $info[2], $info[3], $id, $val, $info[1], $info[2], $info[3], $id);
//           echo $db->debugSql($sql1,$arrValue1); exit();
            $stmt1 = $db->QueryParam($sql1, $arrValue1);
        }

        if (!$stmt1 || !$stmt2 || !$stmt3 || !$stmt4) {
            break;
        }


        if (!$stmt1 || !$stmt2 || !$stmt3 || !$stmt4) {
            $stmt = false;
            $sql = "SQL Error: Failed to update type in one or more tables";
        } else {
            $stmt = true;
            $sql = "Success: Updated type in all tables";
        }

        $ret_id = $id;
        break;
    case "updateAllchekingPeriod":
        $stmt1 = true;
        $stmt2 = true;
        $stmt3 = true;
        $stmt4 = true;
        if (empty($_SESSION['user_id'])) {
            echo "Session หมดอายุ";
            exit();
        } else {

            $info[1] = date('Y-m-d H:i:s'); // วันที่และเวลา ปัจจุบัน
        }
        if ($_REQUEST && !empty($_REQUEST['bg_reserve_money_id'])) {

            $id = $_REQUEST['bg_reserve_money_id'];
            $val = $_REQUEST['i_enabled'];

            $sql1 = "UPDATE NMU_EIS..bg_reserve_money SET i_enable = ? "
                    . " , d_update = ?"
                    . " WHERE bg_reserve_money_id = ?; ";
            $sql1 .= "UPDATE sp_tor_hdr_period     SET i_enabled = 2 WHERE sp_tor_hdr_period_id = 6397;
                        UPDATE sp_check_period_hdr   SET i_enabled = 2 WHERE sp_tor_hdr_period_id = 6397;
                        UPDATE sp_check_period_dtl   SET i_enabled = 2 WHERE sp_tor_hdr_period_id = 6397;
                        UPDATE sp_tor_dtl_period_hdr SET i_enabled = 2 WHERE sp_tor_hdr_period_id = 6397;";
            $arrValue1 = array($val, $info[1], $id);
//       echo $db->debugSql($sql1,$arrValue1); exit();
            $stmt1 = $db->QueryParam($sql1, $arrValue1);
        }

        if (!$stmt1 || !$stmt2 || !$stmt3 || !$stmt4) {
            break;
        }


        if (!$stmt1 || !$stmt2 || !$stmt3 || !$stmt4) {
            $stmt = false;
            $sql = "SQL Error: Failed to update type in one or more tables";
        } else {
            $stmt = true;
            $sql = "Success: Updated type in all tables";
        }

        $ret_id = $id;
        break;
    case "updateReserveMoney":
        $stmt1 = true;
        $stmt2 = true;
        $stmt3 = true;
        $stmt4 = true;
        if (empty($_SESSION['user_id'])) {
            echo "Session หมดอายุ";
            exit();
        } else {

            $info[1] = date('Y-m-d H:i:s'); // วันที่และเวลา ปัจจุบัน
        }
        if ($_REQUEST && !empty($_REQUEST['bg_reserve_money_id'])) {

            $id = $_REQUEST['bg_reserve_money_id'];
            $val = $_REQUEST['i_enabled'];

            $sql1 = "UPDATE NMU_EIS..bg_reserve_money SET i_enable = ? "
                    . " , d_update = ?"
                    . " WHERE bg_reserve_money_id = ?; ";
            $arrValue1 = array($val, $info[1], $id);
//       echo $db->debugSql($sql1,$arrValue1); exit();
            $stmt1 = $db->QueryParam($sql1, $arrValue1);
        }

        if (!$stmt1 || !$stmt2 || !$stmt3 || !$stmt4) {
            break;
        }


        if (!$stmt1 || !$stmt2 || !$stmt3 || !$stmt4) {
            $stmt = false;
            $sql = "SQL Error: Failed to update type in one or more tables";
        } else {
            $stmt = true;
            $sql = "Success: Updated type in all tables";
        }

        $ret_id = $id;
        break;
    case "saveGridReserveMoney":
        if (empty($_SESSION['user_id'])) {
            echo json_encode(array('success' => false, 'msg' => 'Session หมดอายุ'));
            exit();
        }
        $stmt1 = true;
        $stmt2 = true;
        $stmt3 = true;
        $stmt4 = true;
// รับค่าจาก ExtJS และแปลง JSON String กลับเป็น Array ของ PHP
        $dataJson = isset($_REQUEST['data']) ? $_REQUEST['data'] : '';
        $records = json_decode($dataJson, true);

        if (empty($records) || !is_array($records)) {
            echo json_encode(array('success' => false, 'msg' => 'ไม่พบข้อมูลที่ต้องการบันทึก'));
            exit();
        }

        $currentDateTime = date('Y-m-d H:i:s');
        $successCount = 0;

// เริ่มต้นเปิด Transaction (หาก Class DB ของคุณรองรับ แนะนำให้ใส่เพื่อความปลอดภัยของข้อมูล)
// $db->BeginTrans();

        foreach ($records as $row) {
            // ดึงค่าแปรต่างๆ เตรียมไว้ (จัดการค่า null ให้เรียบร้อย)
            $bg_reserve_money_id = !empty($row['bg_reserve_money_id']) ? intval($row['bg_reserve_money_id']) : 0;
            $i_sys = isset($row['i_sys']) ? $row['i_sys'] : 1;
            $pr_id = !empty($row['pr_id']) ? $row['pr_id'] : null;
            $po_id = !empty($row['po_id']) ? $row['po_id'] : null;
            $chk_id = !empty($row['chk_id']) ? $row['chk_id'] : null;
            $i_year = !empty($row['i_year']) ? $row['i_year'] : date('Y');
            $i_pr_type = isset($row['i_pr_type']) ? $row['i_pr_type'] : null;
            $i_reserve = isset($row['i_reserve']) ? $row['i_reserve'] : null;
            $dc_cost_id = !empty($row['dc_cost_id']) ? $row['dc_cost_id'] : null;
            $dc_budget_type_id = !empty($row['dc_budget_type_id']) ? $row['dc_budget_type_id'] : null;
            $bg_expense_id = !empty($row['bg_expense_id']) ? $row['bg_expense_id'] : null;
            $i_finish = isset($row['i_finish']) ? $row['i_finish'] : null;
            $i_last = isset($row['i_last']) ? $row['i_last'] : null;
            $f_amt = isset($row['f_amt']) ? floatval($row['f_amt']) : 0.00;
            $i_enable = isset($row['i_enable']) ? $row['i_enable'] : 1;
            $dc_cost_acc_id = !empty($row['dc_cost_acc_id']) ? $row['dc_cost_acc_id'] : null;
            $c_comment = !empty($row['c_comment']) ? $row['c_comment'] : null;

            if ($bg_reserve_money_id > 0) {
                // =====================================================
                // กรณีมี ID เดิม -> ทำการ UPDATE ข้อมูล
                // =====================================================
                $sql = "UPDATE NMU_EIS..bg_reserve_money SET
                    i_sys = ?, pr_id = ?, po_id = ?, chk_id = ?, i_year = ?,
                    i_pr_type = ?, i_reserve = ?, dc_cost_id = ?, dc_budget_type_id = ?,
                    bg_expense_id = ?, i_finish = ?, i_last = ?, f_amt = ?,
                    i_enable = ?, d_update = ?, dc_cost_acc_id = ?, c_comment = ?
                WHERE bg_reserve_money_id = ?;";

                $arrValue = array(
                    $i_sys, $pr_id, $po_id, $chk_id, $i_year,
                    $i_pr_type, $i_reserve, $dc_cost_id, $dc_budget_type_id,
                    $bg_expense_id, $i_finish, $i_last, $f_amt,
                    $i_enable, $currentDateTime, $dc_cost_acc_id, $c_comment,
                    $bg_reserve_money_id
                );

//        echo $db->debugSql($sql, $arrValue);
//        exit();
                $stmt = $db->QueryParam($sql, $arrValue);
                if ($stmt)
                    $successCount++;
            } else {
                // =====================================================
                // กรณี ID เป็น 0 หรือไม่มี ID -> ทำการ INSERT แถวใหม่
                // =====================================================
                $sql = "INSERT INTO NMU_EIS..bg_reserve_money (
                    i_sys, pr_id, po_id, chk_id, i_year,
                    i_pr_type, i_reserve, dc_cost_id, dc_budget_type_id,
                    bg_expense_id, i_finish, i_last, f_amt,
                    i_enable, d_create, d_update, dc_cost_acc_id, c_comment
                ) VALUES (
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?, ?, ?
                );";

                $arrValue = array(
                    $i_sys, $pr_id, $po_id, $chk_id, $i_year,
                    $i_pr_type, $i_reserve, $dc_cost_id, $dc_budget_type_id,
                    $bg_expense_id, $i_finish, $i_last, $f_amt,
                    $i_enable, $currentDateTime, $currentDateTime, $dc_cost_acc_id, $c_comment
                );
//                echo $db->debugSql($sql, $arrValue);
//        exit();
                $stmt = $db->QueryParam($sql, $arrValue);

                if ($stmt)
                    $successCount++;
            }
        } //END LOOP
// ตรวจสอบผลลัพธ์และส่งกลับให้ ExtJS
        if ($successCount == count($records)) {
            // $db->CommitTrans();
            echo json_encode(array('success' => true, 'msg' => 'บันทึกข้อมูลสำเร็จทั้งหมด ' . $successCount . ' รายการ'));
        } else {
            // $db->RollbackTrans();
            echo json_encode(array('success' => false, 'msg' => 'บันทึกข้อมูลสำเร็จบางส่วน หรือเกิดข้อผิดพลาด'));
        }
        $db->CommitTran();
        exit();
        break;
    case "updateReserveOverlp":
        $stmt1 = true;
        $stmt2 = true;
        $stmt3 = true;
        $stmt4 = true;
        if (empty($_SESSION['user_id'])) {
            echo "Session หมดอายุ";
            exit();
        } else {

            $info[1] = date('Y-m-d H:i:s'); // วันที่และเวลา ปัจจุบัน
        }
        if ($_REQUEST && !empty($_REQUEST['bg_reserve_overlap_id'])) {

            $id = $_REQUEST['bg_reserve_overlap_id'];
            $val = $_REQUEST['i_reserve'];
            $chkid = $val == 2 ? 0 : $_REQUEST['chk_id'];

            $sql1 = "UPDATE NMU_EIS..bg_reserve_overlap SET chk_id = ? "
                    . " , i_reserve = ?"
                    . " , d_update = ?"
                    . " WHERE bg_reserve_overlap_id = ?; ";
            $arrValue1 = array($chkid, $val, $info[1], $id);
//           echo $db->debugSql($sql1,$arrValue1); exit();
            $stmt1 = $db->QueryParam($sql1, $arrValue1);
        }

        if (!$stmt1 || !$stmt2 || !$stmt3 || !$stmt4) {
            break;
        }


        if (!$stmt1 || !$stmt2 || !$stmt3 || !$stmt4) {
            $stmt = false;
            $sql = "SQL Error: Failed to update type in one or more tables";
        } else {
            $stmt = true;
            $sql = "Success: Updated type in all tables";
        }

        $ret_id = $id;
        break;
    case "updateBookingType1":

        $stmt1 = true;
        $stmt2 = true;
        $stmt3 = true;
        $stmt4 = true;

        if (empty($_SESSION['user_id'])) {
            echo "Session หมดอายุ";
            exit();
        } else {

            $info[1] = $_SESSION['user_id'];
            $info[2] = $_SESSION['dc_cost_id'];
            $info[3] = date('Y-m-d H:i:s'); // วันที่และเวลา ปัจจุบัน
        }

        if ($_REQUEST && !empty($_REQUEST['sp_tor_hdr_period_id'])) {

            $id = $_REQUEST['sp_tor_hdr_period_id'];
            $i_pr_types = $_REQUEST["i_pr_types"];
            $array = json_decode($i_pr_types);
            $val = intval($array[0]);

            // อัพเดท sp_tor_contract (booking type)
            $sql1 = "UPDATE dbo.sp_tor_hdr_period SET i_pr_type1 = ? "
                    . " , dc_user_update_id =? "
                    . " , dc_user_update_cost_id =? "
                    . " , d_update = ?"
                    . " WHERE sp_tor_hdr_period_id = ?";

            $arrValue1 = array($val, $info[1], $info[2], $info[3], $id);
//           echo $sql1; print_r($arrValue1);
            $stmt1 = $db->QueryParam($sql1, $arrValue1);
        }

        if (!$stmt1 || !$stmt2 || !$stmt3 || !$stmt4) {
            break;
        }


        if (!$stmt1 || !$stmt2 || !$stmt3 || !$stmt4) {
            $stmt = false;
            $sql = "SQL Error: Failed to update type in one or more tables";
        } else {
            $stmt = true;
            $sql = "Success: Updated type in all tables";
        }

        $ret_id = $id;
        break;
    case "generateOnetimeOTP":
        if (empty($_SESSION['user_id'])) {
            echo json_encode(array("success" => false, "msg" => "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่"));
            exit();
        }
// สุ่มเลข 6 หลัก (100000 - 999999)
        $generated_otp = strval(rand(100000, 999999));
// บันทึกรหัส และเวลาที่หมดอายุ (บวกไปอีก 30 นาที) ลงใน Session
        $_SESSION['secure_otp_code'] = $generated_otp;
        $_SESSION['secure_otp_expire'] = date('Y-m-d H:i:s', strtotime('+5 minutes'));
// ในทางปฏิบัติ: คุณสามารถเพิ่มโค้ดส่ง SMS หรือ Email ตรงนี้ได้ครับ
// แต่สำหรับการทำงานเบื้องต้น เราจะส่งกลับไปให้หน้าจอแสดงผลก่อน
// 1. ตั้งค่าตัวแปร ENV ชื่อ DATABASE_USER
        putenv("DATABASE_USER=root_admin");

        echo json_encode(array(
            "success" => true,
            "otp" => $generated_otp, // ส่งกลับไปแสดงให้ผู้ใช้เห็น (หรือตัดออกถ้าส่งทาง SMS)
            "msg" => "รหัส OTP ของคุณคือ " . $generated_otp . " (ใช้งานได้ภายใน 5 นาที)"
        ));
        break;
    case "updateOnetimeRemoveChecking":
        $stmt1 = true;
        $stmt2 = true;
        $stmt3 = true;
        $stmt4 = true;

// 1. ตรวจสอบ Session
        if (empty($_SESSION['user_id'])) {
            echo json_encode(array("success" => false, "msg" => "Session หมดอายุ"));
            exit();
        } else {
            $info[1] = $_SESSION['user_id'];
            $info[2] = $_SESSION['dc_cost_id'];
            $info[3] = date('Y-m-d H:i:s'); // วันที่และเวลาปัจจุบัน
        }

        if ($_REQUEST && !empty($_REQUEST['sp_tor_hdr_period_id'])) {

            $id = $_REQUEST['sp_tor_hdr_period_id'];
            $otp_input = isset($_REQUEST['otp']) ? trim($_REQUEST['otp']) : '';

            // --- เริ่มขั้นตอนตรวจสอบ Dynamic OTP ---
            // 1. ตรวจสอบว่าเคยมีการกดเจน OTP ไว้ใน Session หรือไม่
            if (empty($_SESSION['secure_otp_code']) || empty($_SESSION['secure_otp_expire'])) {
                echo json_encode(array("success" => false, "msg" => "ไม่พบข้อมูลการขอรหัส OTP กรุณากดขอรหัสใหม่"));
                exit();
            }

            // 2. ตรวจสอบระยะเวลาหมดอายุ (30 นาที)
            $current_time = strtotime($info[3]);
            $expire_time = strtotime($_SESSION['secure_otp_expire']);

            if ($current_time > $expire_time) {
                // เคลียร์ค่าที่หมดอายุทิ้งเพื่อความปลอดภัย
                unset($_SESSION['secure_otp_code']);
                unset($_SESSION['secure_otp_expire']);

                echo json_encode(array("success" => false, "msg" => "รหัส OTP หมดอายุแล้ว (เกิน 30 นาที) กรุณาขอรหัสใหม่"));
                exit();
            }

            // 3. ตรวจสอบความถูกต้องของรหัส
            if ($otp_input !== $_SESSION['secure_otp_code']) {
                echo json_encode(array("success" => false, "msg" => "รหัส OTP ไม่ถูกต้อง"));
                exit();
            }

            // เมื่อรหัสผ่านถูกต้องแล้ว ให้ลบ OTP ใน Session ทันที เพื่อป้องกันการนำกลับมาใช้ซ้ำ (Replay Attack)
            unset($_SESSION['secure_otp_code']);
            unset($_SESSION['secure_otp_expire']);
            // 3. ทำการอัปเดตสถานะ i_enabled = 2 ในตาราง sp_check_period_hdr
            // และอัปเดตฟิลด์ผู้ใช้/เวลาตามมาตรฐานเดิมระบบของคุณ
            $sql1 = "UPDATE dbo.sp_check_period_hdr
                 SET i_enabled = 2,
                     dc_user_update_id = ?,
                     dc_user_update_cost_id = ?,
                     d_update = ?
                 WHERE sp_tor_hdr_period_id = ?;
                 UPDATE dbo.sp_tor_hdr_period
                 SET i_enabled = 2,
                     dc_user_update_id = ?,
                     dc_user_update_cost_id = ?,
                     d_update = ?
                 WHERE sp_tor_hdr_period_id = ?";
            $arrValue1 = array($info[1], $info[2], $info[3], $id, $info[1], $info[2], $info[3], $id);
//        echo $db->debugSql($sql1, $arrValue1);
//        exit();
            $stmt1 = $db->QueryParam($sql1, $arrValue1);

            /*
              // หากต้องการอัปเดตตารางที่ 2 หรือเพิ่มการเก็บ Log เหตุผล สามารถเปิดใช้งานตรงนี้ได้ครับ
              $sql2 = "UPDATE dbo.ตารางที่สอง
              SET i_enabled = 2
              WHERE sp_tor_period_hdr_id = ?";
              $arrValue2 = array($id);
              $stmt2 = $db->QueryParam($sql2, $arrValue2);
             */
        } else {
            $stmt1 = false;
        }

// ตรวจสอบสถานะการทำงานของ SQL Statements
        if (!$stmt1 || !$stmt2 || !$stmt3 || !$stmt4) {
            $stmt = false;
            $sql = "SQL Error: Failed to update type in one or more tables";
            echo json_encode(array("success" => false, "msg" => "เกิดข้อผิดพลาดในการอัปเดตข้อมูลลงฐานข้อมูล"));
        } else {
            $stmt = true;
            $sql = "Success: Updated type in all tables";
            echo json_encode(array("success" => true, "msg" => "ยกเลิกรายการตรวจรับเรียบร้อยแล้ว"));
        }

        $ret_id = $id;
        break;
}

if ((isset($stmt) && $stmt) && (isset($stmt2) && $stmt2)) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว", "sp_tranf_hdr_id" => intval(isset($ret_id) ? $ret_id : 0), "d_update" => date("d/m/Y H:i:s"));
    if (isset($va)) {
        $re["i_pr_type1"] = intval($va);
    }
} else {
// build message safely
    $sqlMsgParts = array();
    if (isset($sql) && $sql !== null)
        $sqlMsgParts[] = $sql;
    if (isset($sql2) && $sql2 !== null)
        $sqlMsgParts[] = $sql2;
    if (isset($sql3) && $sql3 !== null)
        $sqlMsgParts[] = $sql3;
    $sqlMsg = implode(' | ', $sqlMsgParts);
    $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sqlMsg}");
}


echo json_encode($re);
exit;
//LIST_PERIOD_HDR
