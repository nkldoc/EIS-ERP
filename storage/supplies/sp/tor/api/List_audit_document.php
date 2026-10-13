<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

###################
$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();
############################################################################################################
###########################################
$mode = $_REQUEST["mode"] ?? null;
$filter = $_REQUEST["filter"] ?? null;
$value = $_REQUEST["value"] ?? null;
$i_read = $_REQUEST["i_read"] ?? null;

$root = "data";
$data = array();

$limit = $_REQUEST["limit"] ?? null;
$dir = $_REQUEST["dir"] ?? null;
$sort = $_REQUEST["sort"] ?? null;
$start = $_REQUEST["start"] ?? null;

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
$wh = null;

$type = $_REQUEST["type"] ?? null;
$act = $_REQUEST["act"] ?? null;
$filter_status = $_REQUEST["filter_status"] ?? null;
$tor_type_show = $_REQUEST['tor_type_show'] ?? null;
$i_post = $_REQUEST['i_post'] ?? null;
$i_purchase = array(0 => '', 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');

//TORSTEPD11
/*

  1	APSTEPS10	พนักงานผู้ดำเนินการ ลงนามตรวจสอบ
  2	APSTEPS20	หัวหน้าสายงานซื้อจ้าง ลงนามตรวจสอบ
  3	APSTEPS30	หัวหน้าพัสดุ ลงนามตรวจสอบ
  4	APSTEPS40	รองคณะบดี ลงนามตรวจสอบ
  5	APSTEPS50	คณะบดีลงนามอนุมัติเอกสาร

 *  */
function toThaiDate($date) {
    if (!$date instanceof DateTime) {
        $date = new DateTime($date);
    }
    $year = (int) $date->format('Y') + 543;
    return $date->format('d-m-') . $year;
}

function prlist($filename){
//    $filename = "PR25671200010_4_1.pdf"; 
// ตัดนามสกุลไฟล์ออกก่อน
$name = pathinfo($filename, PATHINFO_FILENAME); 
// แยกส่วนด้วย "_"
$parts = explode('_', $name); 
// ตรวจสอบและเก็บค่า
$pr_code = $parts[0] ?? '';
$tor_type_id = isset($parts[1]) ? (int)$parts[1] : 0;
$document_id = isset($parts[2]) ? (int)$parts[2] : 0;

// แสดงผล
//echo "PR Code: $pr_code\n";
//echo "Step: $step\n";
//echo "Index: $index\n";
return array($pr_code, $tor_type_id, $document_id);
}

if ($type == "APSTEPSAUDIT01") {


    $editArry = array(3 => '<span style="color:red">ส่งแก้ไข</span>' // พนักงานสายงาน
        , 2 => '<span style="color:red">ส่งแก้ไข</span>' // หัวหน้าสายงาน
        , 1 => '<span style="color:red">แก้ไขแล้ว</span>' // ธุระการ
        , 4 => '<span style="color:blue">แก้ไขแล้ว</span>'
    ); 
    $is_audit = ($_SESSION['user_id'] == 1) ? true : false;
    $is_room = 0;
    function next_room($user_id){
        
        switch ($user_id) {
            case 30047://อรปียา
                $roo_id = 40053;
                $is_room = 1;
                $tor_type_id = 1;
                break;
            case 60630://admin
                $roo_id = 1;
                $is_room = 2;
                $tor_type_id = 0;
                break;
            case 60520://admin
                $roo_id = 1;
                $is_room = 3;
                $tor_type_id = 0;
                break;
            default:
                $roo_id = $user_id;
                $is_room = 0;
                $tor_type_id = 0;
                break;
        }

        return array($roo_id,$is_room,$tor_type_id);
    }
    function room($user_id){
        
        switch ($user_id) {
            case 40053://อรปียา
                $roo_id = 30047;
                $is_room = 1;
                $tor_type_id = 1;
                break;
            case 1://admin
                $roo_id = 60630;
                $is_room = 2;
                $tor_type_id = 0;
                break;
            case 1://admin
                $roo_id = 60520;
                $is_room = 3;
                $tor_type_id = 0;
                break;
            default:
                $roo_id = $user_id;
                $is_room = 0;
                $tor_type_id = 0;
                break;
        }

        return array($roo_id,$is_room,$tor_type_id);
    }
   $sess_id = $_SESSION['user_id'];
   $room = room($_SESSION['user_id']);
   
    if ($is_audit) {
        $waudit = "";
    } else {
        $waudit = "";
        if($filter_status=='tor_type_1'){
            $waudit .= " and t.tor_type_id=1";
        }else if($filter_status=='allSeft'){
        //มองเห็นในกลุ่ม
        $waudit .= " and EXISTS (SELECT 1 FROM dbo.sp_sign_doc_dtl where sp_sign_doc_hdr_id=r.sp_sign_doc_hdr_id and dc_user_id =" . $sess_id . " )";
        }else{
        //เห็นเฉพาะคนที่ active 
        $waudit .= " AND EXISTS (
                        SELECT 1
                        FROM dbo.sp_sign_doc_dtl d2
                        WHERE d2.sp_sign_doc_hdr_id = r.sp_sign_doc_hdr_id
                          AND d2.row_id_input = a.i_audit
                          AND d2.dc_user_id = " . $sess_id . " 
                    )";
        }
        
    }
    
    
    
    $pr_code = $_REQUEST["pr_code"] ?? null;
    $group = $_REQUEST["group"] ?? null;

            
    if ($pr_code != '' && $group != '') {
        $waudit .= " and a.c_code = '{$pr_code}'";
        $waudit .= " and a.document_type_id = {$group}";
    }
            
    $arrParam[] = $start;
    $arrParam[] = $limit; 
$sqlMain = ";WITH base AS (
    SELECT DISTINCT
        d.sp_sign_doc_hdr_id,
        a.sp_tor_id,
        h.document_id AS hdr_document_id,
        a.room_id,
        d.sp_sign_doc_dtl_id,
        d.row_id_input,
        d.dc_user_id,
        d.position_name,
        d.full_name,
        nxt.row_id_input AS next_row_id_input,
        nxt.dc_user_id   AS next_dc_user_id,
        nxt.full_name    AS next_full_name,
        prv.row_id_input AS prev_row_id_input,
        prv.dc_user_id   AS prev_dc_user_id,
        prv.full_name    AS prev_full_name
    FROM dbo.sp_sign_doc_dtl d
    INNER JOIN dbo.sp_sign_audit_document a ON a.sp_tor_id = d.sp_tor_id
    INNER JOIN dbo.sp_sign_doc_hdr h ON h.sp_sign_doc_hdr_id = d.sp_sign_doc_hdr_id
    OUTER APPLY (
        SELECT TOP 1 sd.row_id_input, sd.dc_user_id, sd.full_name
        FROM dbo.sp_sign_doc_dtl sd
        WHERE sd.sp_sign_doc_hdr_id = d.sp_sign_doc_hdr_id
          AND sd.row_id_input > d.row_id_input
        ORDER BY  d.row_id_input ASC
    ) AS nxt
    OUTER APPLY (
        SELECT TOP 1 sd.row_id_input, sd.dc_user_id, sd.full_name
        FROM dbo.sp_sign_doc_dtl sd
        WHERE sd.sp_sign_doc_hdr_id = d.sp_sign_doc_hdr_id
          AND sd.row_id_input < d.row_id_input
        ORDER BY sd.row_id_input DESC
    ) AS prv
), r AS (
    SELECT base.*, ROW_NUMBER() OVER (ORDER BY sp_sign_doc_hdr_id, row_id_input) rn
    FROM base 
)
SELECT a.* 
    , COUNT(*) OVER() AS total_count
, CASE 
    WHEN a.i_status = 9 
        THEN a.dc_user_create_id
    ELSE ISNULL(r.next_dc_user_id, a.dc_user_create_id)
END AS nextUserId
, a.audit_id 
, a.signer_id
, a.i_status 
, a.i_audit  
, CASE a.[i_audit]
                                    WHEN 1 THEN N'เจ้าหน้าที่พัสดุ'
                                    WHEN 2 THEN N'หัวหน้าสายงานพัสดุ'
                                    WHEN 3 THEN N'ผู้ช่วย/เลขา หัวหน้าเจ้าหน้าที่พัสดุ'
                                    WHEN 4 THEN N'หัวหน้าเจ้าหน้าที่พัสดุ'
                                    WHEN 5 THEN N'รองอธิการบดี'
                                    WHEN 6 THEN N'ผู้ช่วย/เลขา รองอธิการบดี'
                                    WHEN 5 THEN N'รองอธิการบดี'
                                    WHEN 7 THEN N'ผู้ช่วย/เลขา อธิการบดี '
                                    WHEN 8 THEN N'อธิการบดี อนุมัติ'
                        ELSE N'- ไม่ทราบขั้นตอน -'
                    END AS audit_step_name  
    
    , t.c_name as c_detail
    , t.c_code as c_code_detail
    , t.d_doc_ref as d_doc_ref
    , t.dc_department_id 
    , t.sp_emp_id 
    , t.dc_cost2_id 
    , t.dc_cost_id  
    , t.tor_type_id
    , t.tor_type_id
    , t.f_total_amt 
    , (SELECT TOP 1 full_name FROM dbo.sp_sign_doc_dtl WHERE sp_sign_doc_hdr_id=r.sp_sign_doc_hdr_id AND row_id_input =(a.i_audit)) AS user_active_name 
    , (SELECT TOP 1 dc_user_id FROM dbo.sp_sign_doc_dtl WHERE sp_sign_doc_hdr_id=r.sp_sign_doc_hdr_id AND row_id_input =(a.i_audit)) AS doc_active_user_id 
    , (select top 1 c_name from dbo.sp_type_status where sp_type_status_id= t.tor_type_id and i_enabled = 1) as tor_typeTxt 
     , (select top 1 c_full_name from NMU_DATACENTER.dbo.dc_user where dc_user_id=a.dc_user_create_id) as c_create_name
    , (select top 1 c_name from NMU_DATACENTER.dbo.dc_cost where dc_cost_id=a.dc_user_create_cost_id) as c_cost_creat_name
    , convert(varchar, a.d_create, 120) as d_create
    , (select top 1 c_full_name from NMU_DATACENTER.dbo.dc_user where dc_user_id=a.dc_user_update_id) as c_update_name
    , (select top 1 c_name from NMU_DATACENTER.dbo.dc_cost where dc_cost_id=a.dc_user_update_cost_id) as c_cost_update_name
    , convert(varchar, a.d_update, 120) as d_update  
FROM r  
 inner join dbo.sp_tor t on t.tor_id=r.sp_tor_id 
 inner join dbo.sp_sign_audit_document a on a.sp_tor_id=r.sp_tor_id and a.document_id = r.hdr_document_id AND r.row_id_input = a.i_audit and a.i_enabled=1
 where 1=1 $waudit  
    ORDER BY r.sp_sign_doc_hdr_id, r.row_id_input
    OFFSET ? ROWS FETCH NEXT ? ROWS ONLY;

"; //--WHERE rn BETWEEN ? AND ? $waudit  

//  echo $db->debugSql($sqlMain, $arrParam); exit; //doc_active_user_id

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    $arrStatus = array(0 => "รอลงนาม", 1 => "ลงนามแล้ว", 2 => "Reject");

    $totalCount = 0;
    while ($row = $db->Fetch($stmt)) {
$list = prlist($row["urlfile"]);
$roomn = next_room($row["nextUserId"]);
            
$next_name = null;

 $rs = $db->GetDataBySQL("SELECT 
    MIN(a.row_id_input) AS min_row,
    MAX(a.row_id_input) AS max_row
            FROM dbo.sp_sign_doc_dtl a
            inner join dbo.sp_sign_doc_hdr h on h.sp_sign_doc_hdr_id=a.sp_sign_doc_hdr_id 
    WHERE h.sp_tor_id = ? and h.document_id=?", array($row["sp_tor_id"],$row["document_id"]));
 $fq = $db->GetDataBySQL("select b.row_id_input, b.dc_user_id,b.full_name from sp_sign_doc_dtl b
    inner join sp_sign_doc_hdr h on h.sp_sign_doc_hdr_id = b.sp_sign_doc_hdr_id
    where b.sp_tor_id = ? and b.document_id=?", array(3705,1)); //array($row["sp_tor_id"],$row["document_id"])
            
 if($row["i_status"]==9){ // ให้กลับไปเริ่มใหม่
     $i_audit = $rs['max_row'];
     $row["i_audit"] = $rs['max_row']+1;
 }
 
            $temp = array(
                "no" => $i++,
                "id" => intval($row["sp_sign_document_id"] ?? null),
                "sp_sign_document_id" => intval($row["sp_sign_document_id"] ?? null),
                "position_id" => intval($row["position_id"] ?? null),
                "dc_user_id" => intval($row["dc_user_id"] ?? null),
                "tor_type_id" => intval($row["tor_type_id"] ?? null),
                "f_total_amt" => number_format($row["f_total_amt"], 2),
                "is_room" => $room ?? null, //ใช่หน้าห้องไหม
                "room_next" => $roomn ?? null, //เช็คว่ามีหน้าห้องไหม
                "room_next_user_id" => $row["nextUserId"] ?? null, //เช็คว่ามีหน้าห้องไหม
                "room_id" => intval($row["room_id"] ?? null),
                "nextDocUserId" => Intval($row["nextUserId"] ?? null),
                "nextUserId" => $row["nextUserId"] ?? null,
                "allUserId" => @$row["allUserId"] ?? null,
                "doc_prev_user_id" => @$row["doc_prev_user_id"] ?? null,
                "doc_active_user_id" => @$row["doc_active_user_id"] ?? null,
                "doc_next_user_id" => intval(@$row["nextUserId"]), //ถ้าว่างให้กลับไปหา ownner
                "ownner_line" => intval(@$row["ownner_line"]) ?? 0,
                "active_line" => intval(@$row["active_line"]) ?? 0,
                "i_fish" => intval(@$row["i_fish"]) ?? 0,
                "ownner_name" => str_replace(['(', ')'], '', $row["c_create_name"]) ?? null,
                "active_name" => str_replace(['(', ')'], '', $row["user_active_name"]) ?? null,
                "dc_emp_id" => intval($row["dc_emp_id"] ?? null),
                "document_id" => intval($row["document_id"] ?? null),
                "sp_tor_id" => intval($row["sp_tor_id"] ?? null),
                "sp_sign_type_id" => intval($row["sp_sign_type_id"] ?? null),
                "sp_sign_type1_id" => intval($row["sp_sign_type1_id"] ?? null),
                "sp_sign_type2_id" => intval($row["sp_sign_type2_id"] ?? null),
                "document_type_id" => intval($row["document_type_id"] ?? null),
                "nextUsersId" => $row["nextUserId"] ?? null,
                "i_status" => Intval($row["i_status"]) ?? null,
                "i_audit" => Intval($row["i_audit"]) ?? null,
                "audit_id" => Intval($row["audit_id"]) ?? null, 
                "signer_id" => Intval($row["signer_id"]) ?? null,
                "step_sign" => (intval($row["i_audit"]) > 0 ? $row["i_audit"] : 1),
                "line" => $row["line"] ?? null,
                "url" => $row["url"] ?? null,
                "tor_type_id" => $list[1] ?? null,
                "date_type" => $row["date_type"] ?? null,
                "urlfile" => $row["urlfile"] ?? null,
                "c_status" => $row["audit_step_name"] ?? null,
                "position_name" => $row["position_name"] ?? null,
                "next_name" => $row["next_name"] ?? null,
                "full_name" => str_replace(['(', ')'], '', @$row["full_name"]) ?? null,
                "countSign" => intval($row["countSign"] ?? null),
                "show_page" => $row["show_page"] ?? null,
                "tor_type_idTxt" => $row["tor_typeTxt"] ?? null,
                "c_x" => $row["c_x"] ?? null,
                "c_y" => $row["c_y"] ?? null,
                "c_dir" => $row["c_dir"] ?? null,
                "c_filename" => $row["c_filename"] ?? null,
                "c_position_name" => $row["c_position_name"] ?? null,
                "c_name" => $row["c_name"] ?? null,
                "c_detail" => $row["c_detail"] ?? null,
                "c_code_detail" => $row["c_code_detail"] ?? null,
                "pr_code" => $row["c_code_detail"] ?? null,
                "d_doc_ref" => $row["d_doc_ref"] ?? null,
                "ap_sp_emp_name" => $row["c_create_name"] ?? null,
                "dc_user_create_id" => $row["c_create_name"] ?? null,
                "dc_user_create_cost_id" => $row["c_cost_creat_name"] ?? null,
                "d_create" => $date->extDateBuddha($row["d_create"] ?? null),
                "dc_user_update_id" => $row["dc_user_update_id"] ?? null,
                "dc_user_update_cost_id" => $row["dc_user_update_cost_id"] ?? null, 
                "d_update" => $date->extDateBuddha($row["d_update"])
            );
      
        ${$root}[] = $temp;
        $totalCount = intval($row['total_count'] ?? 0);
    }
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
    exit();
}
