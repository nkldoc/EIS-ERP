<?php

class ValidationCaseService
{
    private $db;

    public function __construct($db) { $this->db = $db; }

    public function lists($includeDisabled = false)
    {
        $sql = 'SELECT sp_check_fix_case_id,c_case_code,c_case_name,c_case_description,
                       sql_condition,sql_before_display,sql_update,sql_after_display,
                       sql_before_snapshot,i_severity,i_require_confirm,i_allow_update,
                       i_enable,i_sort_order,dc_user_create_id,d_create,dc_user_update_id,d_update
                FROM dbo.sp_check_fix_case' . ($includeDisabled ? '' : ' WHERE i_enable=1') .
               ' ORDER BY i_sort_order, i_severity DESC, sp_check_fix_case_id';
        return $this->fetchAll($this->query($sql, array()));
    }

    public function find($id)
    {
        $stmt = $this->query('SELECT * FROM dbo.sp_check_fix_case WHERE sp_check_fix_case_id=?', array((int)$id));
        $row = $this->db->Fetch($stmt, SQLSRV_FETCH_ASSOC);
        if (!$row) throw new Exception('ไม่พบเคสที่ระบุ');
        return $row;
    }

    public function save($data, $userId)
    {
        $required = array('c_case_code','c_case_name','sql_condition','sql_before_display','sql_after_display','sql_before_snapshot');
        foreach ($required as $name) if (!isset($data[$name]) || trim($data[$name]) === '') throw new Exception('กรุณาระบุ ' . $name);
        $this->assertReadSql($data['sql_condition']);
        $this->assertReadSql($data['sql_before_display']);
        $this->assertReadSql($data['sql_after_display']);
        $this->assertReadSql($data['sql_before_snapshot']);
        $allow = !empty($data['i_allow_update']) ? 1 : 0;
        if ($allow) $this->assertUpdateSql(isset($data['sql_update']) ? $data['sql_update'] : '');
        $params = array(trim($data['c_case_code']),trim($data['c_case_name']),isset($data['c_case_description'])?$data['c_case_description']:null,
            $data['sql_condition'],$data['sql_before_display'],isset($data['sql_update'])?$data['sql_update']:null,$data['sql_after_display'],$data['sql_before_snapshot'],
            isset($data['i_severity'])?(int)$data['i_severity']:2,!empty($data['i_require_confirm'])?1:0,$allow,
            isset($data['i_enable'])?(int)!!$data['i_enable']:1,isset($data['i_sort_order'])?(int)$data['i_sort_order']:0);
        if (!empty($data['sp_check_fix_case_id'])) {
            $params[]=$userId; $params[]=(int)$data['sp_check_fix_case_id'];
            $this->query('UPDATE dbo.sp_check_fix_case SET c_case_code=?,c_case_name=?,c_case_description=?,sql_condition=?,sql_before_display=?,sql_update=?,sql_after_display=?,sql_before_snapshot=?,i_severity=?,i_require_confirm=?,i_allow_update=?,i_enable=?,i_sort_order=?,dc_user_update_id=?,d_update=SYSDATETIME() WHERE sp_check_fix_case_id=?',$params);
            return (int)$data['sp_check_fix_case_id'];
        }
        $params[]=$userId;
        $stmt=$this->query('INSERT dbo.sp_check_fix_case(c_case_code,c_case_name,c_case_description,sql_condition,sql_before_display,sql_update,sql_after_display,sql_before_snapshot,i_severity,i_require_confirm,i_allow_update,i_enable,i_sort_order,dc_user_create_id) OUTPUT INSERTED.sp_check_fix_case_id VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)',$params);
        $row=$this->db->Fetch($stmt,SQLSRV_FETCH_ASSOC); return (int)$row['sp_check_fix_case_id'];
    }

    public function disable($id, $userId)
    {
        $this->query('UPDATE dbo.sp_check_fix_case SET i_enable=0,dc_user_update_id=?,d_update=SYSDATETIME() WHERE sp_check_fix_case_id=?',array($userId,(int)$id));
    }

    public function assertReadSql($sql) { $this->assertSafeSql($sql, 'SELECT'); }
    public function assertUpdateSql($sql) { $this->assertSafeSql($sql, 'UPDATE'); }

    private function assertSafeSql($sql, $type)
    {
        $clean=trim(preg_replace('/\s+/', ' ', (string)$sql));
        if ($clean==='' || preg_match('/(;\s*\S|--|\/\*|\b(EXEC|EXECUTE|MERGE|INSERT|DELETE|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE)\b)/i',$clean)) throw new Exception('Query มีคำสั่งที่ไม่อนุญาต');
        if ($type==='SELECT' && !preg_match('/^(SELECT|WITH)\b/i',$clean)) throw new Exception('Query ตรวจสอบ/แสดงผลต้องเป็น SELECT หรือ WITH');
        if ($type==='UPDATE' && !preg_match('/^UPDATE\b/i',$clean)) throw new Exception('Query แก้ไขต้องเป็น UPDATE เท่านั้น');
    }

    private function query($sql,$params) { $stmt=@sqlsrv_query($this->db->conn,$sql,$params); if($stmt===false) throw new Exception($this->sqlError()); return $stmt; }
    private function fetchAll($stmt) { $rows=array(); while($r=$this->db->Fetch($stmt,SQLSRV_FETCH_ASSOC)) $rows[]=$r; return $rows; }
    private function sqlError() { $e=sqlsrv_errors(); return $e && isset($e[0]['message'])?$e[0]['message']:'Database error'; }
}

