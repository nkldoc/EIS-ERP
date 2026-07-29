<?php

require_once dirname(__FILE__) . '/ValidationCaseService.php';

class ReceiveValidationService {

    private $db;
    private $caseService;

    public function __construct($db) {
        $this->db = $db;
        $this->caseService = new ValidationCaseService($db);
    }

    public function validate($context) {
        $out = array();
        foreach ($this->caseService->lists(false) as $case) {
            $condition = $this->runSql($case['sql_condition'], $context);
            if ($this->conditionMatched($condition)) {
                $case['data'] = $this->runSql($case['sql_before_display'], $context);
                unset($case['sql_condition'], $case['sql_before_display'], $case['sql_update'], $case['sql_after_display'], $case['sql_before_snapshot']);
                $out[] = $case;
            }
        }
        return $out;
    }

    public function executeFix($caseId, $context, $confirmed, $userId) {
        $case = $this->caseService->find($caseId);
        if (!(int) $case['i_enable'] || !(int) $case['i_allow_update'])
            throw new Exception('เคสนี้ไม่อนุญาตให้แก้ไข');
        if ((int) $case['i_require_confirm'] && !$confirmed)
            throw new Exception('ต้องยืนยันก่อนดำเนินการ');
        $subject = $this->subjectKey($context);
        $paramsJson = $this->json($context);
        if (!sqlsrv_begin_transaction($this->db->conn))
            throw new Exception('ไม่สามารถเริ่ม transaction');
        try {
            $before = $this->runSql($case['sql_before_snapshot'], $context);
            $version = $this->nextVersion($caseId, $subject);
            $this->runSql($case['sql_update'], $context, false);
            $after = $this->runSql($case['sql_after_display'], $context);
            $this->insertLog($caseId, $context, $subject, $version, $paramsJson, $this->json($before), $this->json($after), 1, 'UPDATED', null, $userId);
            if (!sqlsrv_commit($this->db->conn))
                throw new Exception('ไม่สามารถ commit transaction');
            return array('version' => $version, 'before' => $before, 'after' => $after);
        } catch (Exception $e) {
            sqlsrv_rollback($this->db->conn);
            throw $e;
        }
    }

    public function history($context, $caseId = null) {
        $where = array('1=1');
        $params = array();
        $dateFrom = isset($context['date_from']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $context['date_from']) ? $context['date_from'] : null;
        $dateTo = isset($context['date_to']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $context['date_to']) ? $context['date_to'] : null;
        foreach (array('sp_check_period_hdr_id', 'sp_tor_hdr_period_id') as $key)
            if (isset($context[$key]) && $context[$key] !== '') {
                $where[] = 'l.' . $key . '=?';
                $params[] = (int) $context[$key];
            }
        if ($caseId) {
            $where[] = 'l.sp_check_fix_case_id=?';
            $params[] = (int) $caseId;
        }
        if ($dateFrom) { $where[] = 'l.d_create>=?'; $params[] = $dateFrom; }
        if ($dateTo) { $where[] = 'l.d_create<DATEADD(day,1,?)'; $params[] = $dateTo; }
        $sql = 'SELECT TOP 50 l.*, convert(varchar,l.d_create, 120) as d_create, c.c_case_code,c.c_case_name,c.i_severity FROM dbo.sp_check_fix_case_log l JOIN dbo.sp_check_fix_case c ON c.sp_check_fix_case_id=l.sp_check_fix_case_id WHERE ' . implode(' AND ', $where) . ' ORDER BY l.d_create DESC,l.sp_check_fix_case_log_id DESC';
        $rows = $this->fetchAll($this->query($sql, $params));
        foreach ($rows as &$fixRow) {
            $fixRow['c_source'] = 'VALIDATION';
            $fixRow['table_name'] = 'sp_check_fix_case_log';
            $fixRow['action_name'] = $fixRow['c_status'];
            $fixRow['document_number'] = '';
            $fixRow['booking_url'] = isset($context['booking_url']) ? $context['booking_url'] : '';
        }
        unset($fixRow);

        if (isset($context['sp_check_period_hdr_id']) && $context['sp_check_period_hdr_id'] !== '') {
            $checkingId = (int) $context['sp_check_period_hdr_id'];
            $historySql = 'SELECT TOP 50 document_number,status,subject,details,convert(varchar,date_time,120) AS d_create '
                    . 'FROM dbo.sp_check_history WHERE sp_check_period_hdr_id=?';
            $historyParams = array($checkingId);
            if ($dateFrom) { $historySql .= ' AND date_time>=?'; $historyParams[] = $dateFrom; }
            if ($dateTo) { $historySql .= ' AND date_time<DATEADD(day,1,?)'; $historyParams[] = $dateTo; }
            $historySql .= ' ORDER BY date_time DESC';
            $historyRows = $this->fetchAll($this->query($historySql, $historyParams));
            $sequence = 0;
            foreach ($historyRows as $historyRow) {
                $sequence++;
                $detail = array(
                    'table_name' => 'sp_check_period_hdr',
                    'action' => $historyRow['subject'],
                    'document_number' => $historyRow['document_number'],
                    'status' => $historyRow['status'],
                    'details' => $historyRow['details'],
                    'booking_code' => isset($context['booking_code']) ? $context['booking_code'] : '',
                    'booking_url' => isset($context['booking_url']) ? $context['booking_url'] : ''
                );
                $rows[] = array(
                    'sp_check_fix_case_log_id' => 'H' . $sequence,
                    'sp_check_fix_case_id' => 0,
                    'c_case_code' => 'RECEIVE',
                    'c_case_name' => $historyRow['subject'] ? $historyRow['subject'] : 'บันทึกหน้าตรวจรับ',
                    'i_severity' => 0,
                    'i_version_no' => 0,
                    'c_status' => $historyRow['status'],
                    'before_json' => '',
                    'after_json' => $this->json($detail),
                    'parameter_json' => '',
                    'dc_user_id' => null,
                    'd_create' => $historyRow['d_create'],
                    'c_error_message' => '',
                    'c_source' => 'RECEIVE',
                    'table_name' => 'sp_check_period_hdr',
                    'action_name' => $historyRow['subject'],
                    'document_number' => $historyRow['document_number'],
                    'booking_url' => isset($context['booking_url']) ? $context['booking_url'] : ''
                );
            }

            $changeSql = "SELECT TOP 50 log_id,table_name,row_id,field_name,old_value,new_value,user_id,"
                    . "convert(varchar,date_create,120) AS d_create,remarks "
                    . "FROM NMU_ERPLOG.dbo.sys_log_change WHERE ("
                    . "(table_name='sp_check_period_hdr' AND row_id=?) OR "
                    . "(table_name='sp_tranf_item' AND row_id IN (SELECT i.sp_tranf_item_id FROM dbo.sp_tranf_item i "
                    . "INNER JOIN dbo.sp_tranf_hdr h ON h.sp_tranf_hdr_id=i.sp_tranf_hdr_id WHERE h.sp_check_period_hdr_id=?)))";
            $changeParams = array($checkingId, $checkingId);
            if ($dateFrom) { $changeSql .= ' AND date_create>=?'; $changeParams[] = $dateFrom; }
            if ($dateTo) { $changeSql .= ' AND date_create<DATEADD(day,1,?)'; $changeParams[] = $dateTo; }
            $changeSql .= ' ORDER BY date_create DESC';
            $changeRows = $this->fetchAll($this->query($changeSql, $changeParams));
            foreach ($changeRows as $changeRow) {
                $detailBefore = array('table_name' => $changeRow['table_name'], 'row_id' => $changeRow['row_id'], 'field_name' => $changeRow['field_name'], 'value' => $changeRow['old_value']);
                $detailAfter = array('table_name' => $changeRow['table_name'], 'row_id' => $changeRow['row_id'], 'field_name' => $changeRow['field_name'], 'value' => $changeRow['new_value'], 'remarks' => $changeRow['remarks']);
                $rows[] = array(
                    'sp_check_fix_case_log_id' => 'L' . $changeRow['log_id'],
                    'sp_check_fix_case_id' => 0,
                    'c_case_code' => 'TABLE_LOG',
                    'c_case_name' => 'แก้ไข ' . $changeRow['table_name'] . '.' . $changeRow['field_name'],
                    'i_severity' => 0,
                    'i_version_no' => 0,
                    'c_status' => 'UPDATED',
                    'before_json' => $this->json($detailBefore),
                    'after_json' => $this->json($detailAfter),
                    'parameter_json' => '',
                    'dc_user_id' => $changeRow['user_id'],
                    'd_create' => $changeRow['d_create'],
                    'c_error_message' => '',
                    'c_source' => 'TABLE_LOG',
                    'table_name' => $changeRow['table_name'],
                    'action_name' => $changeRow['remarks'],
                    'document_number' => '',
                    'booking_url' => isset($context['booking_url']) ? $context['booking_url'] : ''
                );
            }
        }

        if (!isset($context['sp_check_period_hdr_id']) && !empty($context['latest'])) {
            $latestHistorySql = 'SELECT TOP 50 document_number,status,subject,details,convert(varchar,date_time,120) AS d_create FROM dbo.sp_check_history WHERE 1=1';
            $latestHistoryParams = array();
            if ($dateFrom) { $latestHistorySql .= ' AND date_time>=?'; $latestHistoryParams[] = $dateFrom; }
            if ($dateTo) { $latestHistorySql .= ' AND date_time<DATEADD(day,1,?)'; $latestHistoryParams[] = $dateTo; }
            $latestHistorySql .= ' ORDER BY date_time DESC';
            $latestHistory = $this->fetchAll($this->query($latestHistorySql, $latestHistoryParams));
            $latestSequence = 0;
            foreach ($latestHistory as $historyRow) {
                $latestSequence++;
                $detail = array('table_name' => 'sp_check_period_hdr', 'action' => $historyRow['subject'],
                    'document_number' => $historyRow['document_number'], 'status' => $historyRow['status'], 'details' => $historyRow['details']);
                $rows[] = array('sp_check_fix_case_log_id' => 'HA' . $latestSequence, 'sp_check_fix_case_id' => 0,
                    'c_case_code' => 'RECEIVE', 'c_case_name' => $historyRow['subject'] ? $historyRow['subject'] : 'บันทึกหน้าตรวจรับ',
                    'i_severity' => 0, 'i_version_no' => 0, 'c_status' => $historyRow['status'], 'before_json' => '',
                    'after_json' => $this->json($detail), 'parameter_json' => '', 'dc_user_id' => null,
                    'd_create' => $historyRow['d_create'], 'c_error_message' => '', 'c_source' => 'RECEIVE',
                    'table_name' => 'sp_check_period_hdr', 'action_name' => $historyRow['subject'],
                    'document_number' => $historyRow['document_number'], 'booking_url' => '');
            }

            $latestChangeSql = "SELECT TOP 50 log_id,table_name,row_id,field_name,old_value,new_value,user_id,convert(varchar,date_create,120) AS d_create,remarks "
                    . "FROM NMU_ERPLOG.dbo.sys_log_change WHERE table_name IN ('sp_check_period_hdr','sp_tranf_item')";
            $latestChangeParams = array();
            if ($dateFrom) { $latestChangeSql .= ' AND date_create>=?'; $latestChangeParams[] = $dateFrom; }
            if ($dateTo) { $latestChangeSql .= ' AND date_create<DATEADD(day,1,?)'; $latestChangeParams[] = $dateTo; }
            $latestChangeSql .= ' ORDER BY date_create DESC';
            $latestChanges = $this->fetchAll($this->query($latestChangeSql, $latestChangeParams));
            foreach ($latestChanges as $changeRow) {
                $detailBefore = array('table_name' => $changeRow['table_name'], 'row_id' => $changeRow['row_id'], 'field_name' => $changeRow['field_name'], 'value' => $changeRow['old_value']);
                $detailAfter = array('table_name' => $changeRow['table_name'], 'row_id' => $changeRow['row_id'], 'field_name' => $changeRow['field_name'], 'value' => $changeRow['new_value'], 'remarks' => $changeRow['remarks']);
                $rows[] = array('sp_check_fix_case_log_id' => 'LA' . $changeRow['log_id'], 'sp_check_fix_case_id' => 0,
                    'c_case_code' => 'TABLE_LOG', 'c_case_name' => 'แก้ไข ' . $changeRow['table_name'] . '.' . $changeRow['field_name'],
                    'i_severity' => 0, 'i_version_no' => 0, 'c_status' => 'UPDATED',
                    'before_json' => $this->json($detailBefore), 'after_json' => $this->json($detailAfter), 'parameter_json' => '',
                    'dc_user_id' => $changeRow['user_id'], 'd_create' => $changeRow['d_create'], 'c_error_message' => '',
                    'c_source' => 'TABLE_LOG', 'table_name' => $changeRow['table_name'], 'action_name' => $changeRow['remarks'],
                    'document_number' => '', 'booking_url' => '');
            }
        }

        usort($rows, function ($left, $right) {
            return strcmp(isset($right['d_create']) ? $right['d_create'] : '', isset($left['d_create']) ? $left['d_create'] : '');
        });
        return array_slice($rows, 0, 50);
    }

    private function runSql($sql, $context, $expectRows = true) {
        $params = array();
        $prepared = preg_replace_callback('/:([a-zA-Z][a-zA-Z0-9_]*)/', function ($m) use (&$params, $context) {
            if (!array_key_exists($m[1], $context))
                throw new Exception('ไม่พบ parameter :' . $m[1]);
            $params[] = $context[$m[1]];
            return '?';
        }, $sql);
        $stmt = $this->query($prepared, $params);
        return $expectRows ? $this->fetchAll($stmt) : sqlsrv_rows_affected($stmt);
    }

    private function conditionMatched($rows) {
        if (!$rows)
            return false;
        $v = reset($rows[0]);
        return !($v === false || $v === 0 || $v === '0' || $v === null);
    }

    private function subjectKey($c) {
        foreach (array('sp_check_period_hdr_id', 'sp_tor_hdr_period_id', 'tor_id') as $k)
            if (isset($c[$k]) && $c[$k] !== '')
                return $k . ':' . $c[$k];
        throw new Exception('ไม่พบรหัสอ้างอิงรายการตรวจรับ');
    }

    private function nextVersion($caseId, $subject) {
        $s = $this->query('SELECT ISNULL(MAX(i_version_no),0)+1 v FROM dbo.sp_check_fix_case_log WITH(UPDLOCK,HOLDLOCK) WHERE sp_check_fix_case_id=? AND c_subject_key=?', array($caseId, $subject));
        $r = $this->db->Fetch($s, SQLSRV_FETCH_ASSOC);
        return (int) $r['v'];
    }

    private function insertLog($cid, $c, $subject, $v, $pj, $bj, $aj, $done, $status, $error, $uid) {
        $this->query('INSERT dbo.sp_check_fix_case_log(sp_check_fix_case_id,sp_check_period_hdr_id,sp_tor_hdr_period_id,c_subject_key,i_version_no,parameter_json,before_json,after_json,i_update_executed,c_status,c_error_message,dc_user_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)', array($cid, isset($c['sp_check_period_hdr_id']) ? $c['sp_check_period_hdr_id'] : null, isset($c['sp_tor_hdr_period_id']) ? $c['sp_tor_hdr_period_id'] : null, $subject, $v, $pj, $bj, $aj, $done, $status, $error, $uid));
    }

    private function json($v) {
        $j = json_encode($v, JSON_UNESCAPED_UNICODE);
        if ($j === false)
            throw new Exception('ไม่สามารถแปลงข้อมูลเป็น JSON');return $j;
    }

    private function query($sql, $params) {
        $s = @sqlsrv_query($this->db->conn, $sql, $params);
        if ($s === false) {
            $e = sqlsrv_errors();
            throw new Exception($e && isset($e[0]['message']) ? $e[0]['message'] : 'Database error');
        }return $s;
    }

    private function fetchAll($s) {
        $r = array();
        while ($x = $this->db->Fetch($s, SQLSRV_FETCH_ASSOC))
            $r[] = $x;return $r;
    }
}
