<?php

include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db = new DatabaseServer();
$util = new apiUtil();

$root = "data";
$data = array();
$con = null;
$limit = @$_REQUEST["limit"] ?? null;
$dir = @$_REQUEST["dir"] ?? null;
$sort = @$_REQUEST["sort"] ?? null;
$start = @$_REQUEST["start"] ?? null;
//sp_document_items sp_step_items sp_approve_items
/*
				select * from NMU_ERP..sp_status_document
				select * from NMU_ERP..sp_signin_document
				select * from NMU_ERP..sp_approve_document  */
if ($_REQUEST['type'] == 'dc_emp_sign_items') { 
    
      $sp_approval_hdr_id = $_REQUEST["sp_approval_hdr_id"] ?? null;
      $dc_user_sign_id = $_REQUEST["dc_user_sign_id"] ?? null;
        
     $sqlMain = "[sp_approval_signatures_id]
      ,[sp_approval_hdr_id]
      ,[signer_role]
      ,[role_id]
      ,[signature_image_path]
      ,[i_is_acting_role]
      ,[signer_name]
      ,[sign_date]
      ,[dc_user_sign_id]
      ,[c_comment]
      ,[i_enable]
      ,[i_delete]
      ,[dc_user_create_id]
      ,[dc_user_create_cost_id]
      ,[d_create]
      ,[dc_user_update_id]
      ,[dc_user_update_cost_id]
      ,[d_update]
  FROM [dbo].[sp_approval_signatures] where sp_approval_hdr_id=? and dc_user_sign_id=?"; 
    $arrParam = array(STATUS_ENABLE); 
    $stmt = $db->QueryParam($sqlMain, array($sp_approval_hdr_id,$dc_user_sign_id));
    if ($stmt) {

        if (@$_REQUEST["all"] == "all") {
            ${$root}[] = array(
                "id" => "0",
                "c_name" => "- เลือกทั้งหมด -"
            );
        }
        
        while ($row = $db->Fetch($stmt)) {
                $temp = array(
                    "no" => $i++,
                    "id" => intval($row["signer_name"]),
                    "c_name" => intval($row["sp_approval_signatures_id"]),
                    "sp_approval_signatures_id" => intval($row["sp_approval_signatures_id"]),
                    "sp_approval_hdr_id" => intval($row["sp_approval_hdr_id"]),
                    "signer_role" => $row["signer_role"],
                    "role_id" => intval($row["role_id"]),
                    "signature_image_path" => $row["signature_image_path"],
                    "i_is_acting_role" => intval($row["i_is_acting_role"]),
                    "signer_name" => $row["signer_name"],
                    "sign_date" => $row["sign_date"],
                    "dc_user_sign_id" => intval($row["dc_user_sign_id"])
                );
            ${$root}[] = $temp;
        }
    }
} 
else if ($_REQUEST["type"] == "sp_document_items") {
     $sqlMain = "select "
             . "value as id, name as c_name ,c_code , i_enabled  "
             . "from NMU_ERP..sp_status_document WHERE 1 = ? ORDER BY value";
    $arrParam = array(STATUS_ENABLE); 
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {

        if (@$_REQUEST["all"] == "all") {
            ${$root}[] = array(
                "id" => "0",
                "c_name" => "- เลือกทั้งหมด -"
            );
        }
        
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["id"]}",
                "c_name" => "{$row["c_name"]}",
                "c_code" => "{$row["c_code"]}",
                "i_enabled" => "{$row["i_enabled"]}"
            );
            ${$root}[] = $temp;
        }
    }
} 
else if ($_REQUEST["type"] == "sp_signin_document") {
    $sqlMain = "select value as id, name as c_name"
             . " from NMU_ERP..sp_signin_document WHERE 1 = ? and i_signer=1 and i_enabled =1 ORDER BY value";
    $arrParam = array(STATUS_ENABLE); 
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {

        if (@$_REQUEST["all"] == "all") {
            ${$root}[] = array(
                "id" => "0",
                "c_name" => "- เลือกทั้งหมด -"
            );
        }
        
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["id"]}",
                "c_name" => "{$row["c_name"]}", 
            );
            ${$root}[] = $temp;
        }
    }
} 
else if ($_REQUEST["type"] == "sp_signin_return") {
    
    
    $sqlMain = "select b.row_id_input, b.dc_user_id,b.full_name 
        from dbo.sp_sign_doc_dtl b
    inner join dbo.sp_sign_doc_hdr h on h.sp_sign_doc_hdr_id = b.sp_sign_doc_hdr_id
    where h.sp_tor_id = ? and h.document_id=?"; 
 
    $stmt = $db->QueryParam($sqlMain, array($_POST["sp_tor_id"],$_POST["document_id"]));
if ($stmt) {
    // เพิ่มตัวเลือกเริ่มต้น
    $data[] = array(
        "id" => 0,
        // ถ้า Ext combo ของคุณใช้ displayField:'name' ให้ใช้ key 'name'
        // ถ้าใช้ 'c_name' ก็เปลี่ยน combo ให้ตรงกัน
        "name" => "--- เลือก ---",
        "dc_user_id" => ""
    );

    while ($row = $db->Fetch($stmt)) {
        $data[] = array(
            "id" => (int)$row['row_id_input'],
            "dc_user_id" => $row['dc_user_id'],
            "name" => $row['full_name']
        );
    }
}

// ส่งกลับเป็น JSON ที่ Ext คาดหวัง (root = data)
echo json_encode(array("data" => $data), JSON_UNESCAPED_UNICODE);
exit;
} 
else if ($_REQUEST["type"] == "sp_sign_items") {
    $sqlMain = "select value as id, name as c_name"
             . " from NMU_ERP..sp_signin_document WHERE 1 = ? ORDER BY value";
    $arrParam = array(STATUS_ENABLE); 
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {

        if (@$_REQUEST["all"] == "all") {
            ${$root}[] = array(
                "id" => "0",
                "c_name" => "- เลือกทั้งหมด -"
            );
        }
        
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["id"]}",
                "c_name" => "{$row["c_name"]}", 
            );
            ${$root}[] = $temp;
        }
    }
} 
else if ($_REQUEST["type"] == "sp_approve_items") {
    
     $sqlMain = "select value as id, name as c_name from dbo.sp_approve_document WHERE 1 = ? ORDER BY value";
    $arrParam = array(STATUS_ENABLE); 
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {

        if (@$_REQUEST["all"] == "all") {
            ${$root}[] = array(
                "id" => "0",
                "c_name" => "- เลือกทั้งหมด -"
            );
        }
        
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                    "id" => "{$row["id"]}",
                    "c_name" => "{$row["c_name"]}", 
            );
            ${$root}[] = $temp;
        }
    }
}else if ($_REQUEST["type"] == "sp_approve_items_log") {
    
$id = intval($_REQUEST['sp_sign_document_id'] ?? 0);
// echo "ssssssssssss {$id}"; exit();

$sql = "SELECT 
                l.d_create,
                CONVERT(varchar(19), l.d_create, 120) AS d_create_text,
                l.dc_user_create_id,

                u.full_name AS user_act_name,

                l.i_audit,
                CASE l.i_audit
                    WHEN 1 THEN N'สร้างเอกสาร'
                    WHEN 2 THEN N'ส่งต่อ'
                    WHEN 3 THEN N'ตรวจสอบ'
                    WHEN 4 THEN N'อนุมัติ'
                    WHEN 5 THEN N'ลงนาม'
                    ELSE N'-'
                END AS audit_text,

                l.c_comment,
                l.i_status,
                CASE l.i_status
                    WHEN 0 THEN N'รอดำเนินการ'
                    WHEN 1 THEN N'ดำเนินการแล้ว'
                    WHEN 2 THEN N'ทักท้วง'
                    WHEN 3 THEN N'ส่งคืน'
                    ELSE N'-'
                END AS status_text,

                d.c_name AS document_name,
                ISNULL(l.urlcombine,'-') AS combinefile,
                h.pr_code

            FROM dbo.sp_sign_audit_document_log l
            LEFT JOIN dbo.sp_sign_audit_document d 
                   ON d.sp_sign_document_id = l.sp_sign_document_id
            INNER JOIN dbo.sp_sign_doc_hdr h 
                   ON h.sp_tor_id = d.sp_tor_id 
                  AND h.document_id = d.document_id 
            OUTER APPLY (
                SELECT TOP 1 full_name
                FROM dbo.sp_sign_doc_dtl
                WHERE sp_sign_doc_hdr_id = h.sp_sign_doc_hdr_id
                  AND row_id_input = (l.i_audit - 1)
            ) u 
            WHERE l.sp_sign_document_id = ?
            ORDER BY l.d_create ASC;
";
 
    $stmt = $db->QueryParam($sql, array($id));
if ($stmt === false) {
    echo json_encode(['success'=>false,'error'=>sqlsrv_errors()]);
    exit;
} 
$data = [];
while ($r = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
        $data[] = [
            'd_create'       => $r['d_create_text'],
            'dc_user_id'     => (int)$r['dc_user_create_id'],
            'user_act_name'  => $r['user_act_name'],   // ✔ ตรงกับ Store
            'i_audit'        => (int)$r['i_audit'],
            'audit_text'     => $r['audit_text'],
            'comment'        => $r['c_comment'],        // ✔ map แล้ว
            'i_status'       => (int)$r['i_status'],
            'status_text'    => $r['status_text'],
            'document_name'  => str_replace('</span>', '', $r['document_name']),
            'combinefile'    => $r['combinefile'],
            'pr_code'        => $r['pr_code']
        ]; 
}

echo json_encode([
    'success' => true,
    'total'   => count($data),
    'data'    => $data
], JSON_UNESCAPED_UNICODE);
exit();
}
echo json_encode(array("debug" => true, $root => ${$root}));
exit;
