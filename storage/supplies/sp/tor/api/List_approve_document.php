<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");
// ::: sqld+space
$_REQUEST = json_decode(file_get_contents("php://input"), true);
// print_r($_SESSION); exit();           
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
function getUserSignDoc($db, $document_id,$sp_sign_type_id=0,$sp_tor_id=0) {
    // ฟิลด์ที่ต้องการดึง
    $flds = " a.id, a.sp_sign_type_id, a.line, a.dc_user_id, a.full_name, a.position_name
    , a.action, a.c_approved, a.org_name, a.sign_date, a.row, a.col, a.step_sign , a.document_id 
    
    , isnull(b.c_approved,'') as c_approved
    , isnull(b.page,'') as page , b.date_document,b.line_approved ,b.position_x	,b.position_y";
    // Query ด้วย parameter
    $stmt = $db->QueryParam(
            " SELECT {$flds} FROM dbo.[sp_sign_type_document] a"
            . " inner join [sp_sign_type] b on b.sp_sign_type_id = a.sp_sign_type_id"
            . " WHERE a.document_id = ? and b.sp_sign_type_id = ? and a.sp_tor_id = ?",
            array($document_id,$sp_sign_type_id,$sp_tor_id)
    );
    // เก็บผลลัพธ์
    $userSignDoc = [];
    while ($rows = $db->Fetch($stmt)) {
        // แปลงวันที่ถ้าเป็น DateTime
        if ($rows['sign_date'] instanceof DateTime) {
            $rows['sign_date'] = toThaiDate($rows['sign_date']->format('d-m-Y'));
//                $rows['sign_date'] = $rows['sign_date']->format('d-m-Y H:i:s');
        }
        $userSignDoc[] = $rows;
    }

    return $userSignDoc;
}
if ($type == "APSTEPS00") {
            
    // กำหนดให้ PHP warning กลายเป็น Exception
    set_error_handler(function ($severity, $message, $file, $line) {
        throw new ErrorException($message, 0, $severity, $file, $line);
    });
    try {
            

        $is_audit = ($_SESSION['user_id'] == 1) ? true : false;

        if ($is_audit) {
            $waudit = "";
        } else {
            $waudit = " and b.dc_user_id = " . $_SESSION['user_id'];
        }
        $pr_code = $_REQUEST["pr_code"] ?? null;
        $group = $_REQUEST["group"] ?? null;
        
        //@TODO ui call select & edit
        if($pr_code!='' && $group!=''){
            $waudit .= " and a.c_code = '{$pr_code}'";
            $waudit .= " and a.document_type_id = {$group}";
        }
        $sqlTempTable = "SELECT a.sp_sign_doc_dtl_id  
                               , h.type_id
                               , row_number() over (order by a.sp_sign_doc_dtl_id DESC) as row 
                     FROM dbo.sp_sign_doc_dtl a
                     INNER JOIN dbo.sp_sign_doc_hdr h 
                            ON h.sp_sign_doc_hdr_id = a.sp_sign_doc_hdr_id
                     WHERE a.i_signer=1 and h.sp_tor_id =? AND h.document_id =?";

        $arrParam[] = $_REQUEST['sp_tor_id']??null;
        $arrParam[] =  $_REQUEST['document_id']??null;
        $arrCountParam[] = $_REQUEST['sp_tor_id']??null;
        $arrCountParam[] = $_REQUEST['document_id']??null;
        $arrParam[] = $start;
        $arrParam[] = $limit;
        $sqlMain = "select  d.sp_sign_doc_dtl_id as id,
                            d.sp_tor_id, 
                            ap.[type_id], 
                            d.[page],
                            d.position_x,
                            d.position_y,
                            d.line,
                            d.dc_user_id,
                            d.full_name,
                            d.position_name,
                            d.action_text AS action,
                            d.org_name,
                            d.sign_date,
                              COALESCE(ca.parsed_row, d.[row]) AS [row],
       COALESCE(ca.parsed_col, d.[col]) AS [col],
                            d.i_signer,
                            d.i_audit,
                            d.step_sign,
                            d.c_approved"
                . " from ({$sqlTempTable}) ap " 
                . " INNER JOIN dbo.sp_sign_doc_dtl d  ON d.sp_sign_doc_dtl_id = ap.sp_sign_doc_dtl_id
                     CROSS APPLY (
    SELECT
        CASE 
            WHEN CHARINDEX(',', ISNULL(d.rc,'')) > 0 
              THEN TRY_CAST(LTRIM(RTRIM(SUBSTRING(d.rc, 1, CHARINDEX(',', d.rc) - 1))) AS INT)
            ELSE TRY_CAST(NULLIF(LTRIM(RTRIM(d.rc)), '') AS INT)
        END AS parsed_row,
        CASE 
            WHEN CHARINDEX(',', ISNULL(d.rc,'')) > 0 
              THEN TRY_CAST(LTRIM(RTRIM(SUBSTRING(d.rc, CHARINDEX(',', d.rc) + 1, 8000))) AS INT)
            ELSE NULL
        END AS parsed_col
) AS ca
                    WHERE ap.row > 0 
                      AND ap.row <= 20
                    ORDER BY ap.row;";
// echo  $db->debugSql($sqlMain, $arrParam); exit;

        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = $start + 1;
        $arrStatus = array(0 => "รอลงนาม", 1 => "ลงนามแล้ว", 2 => "Reject");

        while ($row = $db->Fetch($stmt)) {

            $temp = array(
        "no" => $i++, 
        "id"       => intval($row["line"]),
        "sp_tor_id"       => intval($row["sp_tor_id"]),
        "type_id"         => intval($row["type_id"]),
        "page"            => $row["page"] ,
        "position_x"      => $row["position_x"],
        "position_y"      => $row["position_y"],
        "line"            => intval($row["line"]),
        "i_signer"            => intval($row["i_signer"]),
        "i_audit"            => intval($row["i_audit"]),
        "dc_user_id"      => intval($row["dc_user_id"]),
        "full_name"       =>$row["full_name"],
        "position_name"   =>$row["position_name"],
        "action"          =>$row["action"],
        "org_name"        =>$row["org_name"],
        "sign_date"       =>$row["sign_date"],
        "row"             => intval($row["row"]),
        "col"             => intval($row["col"]),
        "step_sign"       => intval($row["step_sign"]),
        "c_approved"      => $row["c_approved"],       
            
//                "userSignDoc" => getUserSignDoc($db, $row['document_id'], $row['sp_sign_type_id'], $row['sp_tor_id']),
//                "userSignDoc1" => getUserSignDoc($db, $row['document_id'], $row['sp_sign_type1_id'], $row['sp_tor_id']),
//                "userSignDoc2" => getUserSignDoc($db, $row['document_id'], $row['sp_sign_type2_id'], $row['sp_tor_id']),
//                "i_status" => intval($row["i_status"]),
//                "countSign" => intval($row["countSign"]),
//                "show_page" => $row["show_page"],
//                "tor_type_idTxt" => $row["tor_typeTxt"],
//                "c_x" => $row["c_x"],
//                "c_y" => $row["c_y"],
//                "c_dir" => $row["c_dir"],
//                "c_filename" => $row["c_filename"],
//                "c_position_name" => $row["c_position_name"],
//                "c_name" => $row["c_name"],
//                "step_sign" => $row["c_postion"],
//                "c_detail" => $row["c_detail"],
//                "c_code_detail" => $row["c_code_detail"],
//                "d_doc_ref" => $row["d_doc_ref"],
//                "dc_user_create_id" => $row["c_create_name"],
//                "dc_user_create_cost_id" => $row["c_cost_creat_name"],
//                "d_create" => $date->extDateBuddha($row["d_create"]),
//                "dc_user_update_id" => $row["dc_user_update_id"],
//                "dc_user_update_cost_id" => $row["dc_user_update_cost_id"],
//                "d_update" => $date->extDateBuddha($row["d_update"])
            );
            ${$root}[] = $temp;
        }
        $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
        $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
        echo json_encode(array("ok" => true, "debug" => true, "totalCount" => $totalCount, $root => ${$root}));
        exit();
    } catch (Exception $e) {
        // ส่งคืนเมื่อเกิด error หรือ warning
        echo json_encode([
            "status" => "error",
            "message" => $e->getMessage()
        ]);
        exit();
    }
} else if($type == "APSTEPS10") {
    // กำหนดให้ PHP warning กลายเป็น Exception
    set_error_handler(function ($severity, $message, $file, $line) {
        throw new ErrorException($message, 0, $severity, $file, $line);
    });
    try {

        $editArry = array(3 => '<span style="color:red">ส่งแก้ไข</span>' // พนักงานสายงาน
            , 2 => '<span style="color:red">ส่งแก้ไข</span>' // หัวหน้าสายงาน
            , 1 => '<span style="color:red">แก้ไขแล้ว</span>' // ธุระการ
            , 4 => '<span style="color:blue">แก้ไขแล้ว</span>'
        );
        $getsql = "select dc_emp_id, c_sub_name_eng "
                . ", c_last_name_eng  "
                . ", c_first_name_eng "
                . ", (select top 1 c_name from NMU_DATACENTER.dbo.dc_position where dc_position_id=dc_emp.dc_position_id) as c_position "
                . ", c_name "
                . ", c_title FROM NMU_DATACENTER.dbo.dc_emp where dc_emp_id=? and i_enable=1";

        $rs = $db->GetDataBySQL($getsql, array($_SESSION['dc_emp_id']));
        $singer = array(
            "dc_emp_id" => $rs["dc_emp_id"],
            "c_position" => $rs["c_position"],
            "c_title" => $rs["c_title"],
            "c_name" => $rs["c_name"],
            "c_first_name_eng" => $rs["c_first_name_eng"],
            "c_sub_name_eng" => $rs["c_sub_name_eng"],
            "sign_now_date" => $date->extDateBuddha(Date('Y-m-d'))
        );

        $is_audit = ($_SESSION['user_id'] == 1) ? true : false;

        if ($is_audit) {
            $waudit = "";
        } else {
            $waudit = " and b.dc_user_id = " . $_SESSION['user_id'];
        }
        $pr_code = $_REQUEST["pr_code"] ?? null;
        $group = $_REQUEST["group"] ?? null;
        
        //@TODO ui call select & edit
        if($pr_code!='' && $group!=''){
            $waudit .= " and a.c_code = '{$pr_code}'";
            $waudit .= " and a.document_type_id = {$group}";
        }
        $sqlTempTable = "select a.document_id  , a.document_type_id 
                            , a.c_name, a.sp_tor_id
                            , a.dc_user_create_id,a.dc_user_create_cost_id,a.d_create
                            , a.dc_user_update_id,a.dc_user_update_cost_id,a.d_update
                            , b.c_full_name, b.dc_emp_id, b.dc_user_id
                            , isnull(b.i_status,0) as  i_status ,b.c_position_name ,b.c_postion ,b.postion_id as position_id 
                            , row_number() over (order by a.document_id DESC) as row
                             from dbo.sp_sign_document a
                             inner join dbo.sp_sign_position b on b.sp_tor_id =a.sp_tor_id and b.document_type_id=a.document_type_id
                             where a.i_enabled=1 {$waudit}";

        $arrParam[] = $start;
        $arrParam[] = $limit;
        $sqlMain = "select ap.*
    , d.dir as c_dir,d.[filename] as c_filename   
    , d.show_page ,	d.c_x	,d.c_y
    , d.document_id
    , d.sp_sign_type_id
    , d.sp_sign_type1_id
    , d.sp_sign_type2_id
    , (select count(*) from dbo.sp_sign_position where sp_tor_id =ap.sp_tor_id and document_type_id=ap.document_type_id) as countSign
    , t.c_name as c_detail
    , t.c_code as c_code_detail
    , t.d_doc_ref as d_doc_ref
    , t.dc_department_id 
    , t.sp_emp_id 
    , t.dc_cost2_id 
    , t.dc_cost_id  
 
 
    ,(select top 1 c_name from dbo. sp_type_status where sp_type_status_id= t.tor_type_id and i_enabled = 1) as tor_typeTxt 
    , (select top 1 c_name from dbo.sp_emp where sp_emp_id=t.sp_emp_id)  as sp_emp_name
    , (select top 1 c_postion from dbo.sp_sign_position where dc_user_id=ap.dc_emp_id)  as step_sign
    , ap.c_full_name  as signer_name
    , (select top 1 c_name from dbo.sp_department  where dc_department_id=t.dc_department_id)  as dc_department_name
    , (select top 1 c_name from NMU_DATACENTER.dbo.dc_cost where dc_cost_id=t.dc_cost_id)  as dc_cost_idTxt
    , (SELECT TOP 1 c_name FROM NMU_DATACENTER.dbo.dc_cost WHERE dc_cost_id=t.dc_cost2_id)  AS dc_cost2_idTxt 
    
    , (select top 1 c_full_name from dbo.dc_user where dc_user_id=ap.dc_user_create_id) as c_create_name
    , (select top 1 c_name from dbo.dc_cost where dc_cost_id=ap.dc_user_create_cost_id) as c_cost_creat_name
    , convert(varchar, ap.d_create, 120) as d_create
    , (select top 1 c_full_name from dbo.dc_user where dc_user_id=ap.dc_user_update_id) as c_update_name
    , (select top 1 c_name from dbo.dc_cost where dc_cost_id=ap.dc_user_update_cost_id) as c_cost_update_name
    , convert(varchar, ap.d_update, 120) as d_update "
                . " from ({$sqlTempTable}) ap "
                . " inner join dbo.sp_tor t on t.tor_id=ap.sp_tor_id"
                . " inner join dbo.sp_sign_document d on d.document_id=ap.document_id"
                . " WHERE row > ? and row <= ?";
//    echo $db->debugSql($sqlMain, $arrParam); exit;

        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = $start + 1;
        $arrStatus = array(0 => "รอลงนาม", 1 => "ลงนามแล้ว", 2 => "Reject");

        while ($row = $db->Fetch($stmt)) {

            $temp = array(
                "no" => $i++,
                "id" => intval($row["row"]),
                "position_id" => intval($row["position_id"]),
                "dc_user_id" => intval($row["dc_user_id"]),
                "dc_emp_id" => intval($row["dc_emp_id"]),
                "document_id" => intval($row["document_id"]),
                "sp_tor_id" => intval($row["sp_tor_id"]),
                "sp_sign_type_id" => intval($row["sp_sign_type_id"]),
                "sp_sign_type1_id" => intval($row["sp_sign_type1_id"]),
                "sp_sign_type2_id" => intval($row["sp_sign_type2_id"]),
                "document_type_id" => intval($row["document_type_id"]),
                "c_status" => $arrStatus[$row["i_status"]],
                "userSignDoc" => getUserSignDoc($db, $row['document_id'], $row['sp_sign_type_id'], $row['sp_tor_id']),
                "userSignDoc1" => getUserSignDoc($db, $row['document_id'], $row['sp_sign_type1_id'], $row['sp_tor_id']),
                "userSignDoc2" => getUserSignDoc($db, $row['document_id'], $row['sp_sign_type2_id'], $row['sp_tor_id']),
                "i_status" => intval($row["i_status"]),
                "countSign" => intval($row["countSign"]),
                "show_page" => $row["show_page"],
                "tor_type_idTxt" => $row["tor_typeTxt"],
                "c_x" => $row["c_x"],
                "c_y" => $row["c_y"],
                "c_dir" => $row["c_dir"],
                "c_filename" => $row["c_filename"],
                "c_position_name" => $row["c_position_name"],
                "c_name" => $row["c_name"],
                "step_sign" => $row["c_postion"],
                "c_detail" => $row["c_detail"],
                "c_code_detail" => $row["c_code_detail"],
                "d_doc_ref" => $row["d_doc_ref"],
                "dc_user_create_id" => $row["c_create_name"],
                "dc_user_create_cost_id" => $row["c_cost_creat_name"],
                "d_create" => $date->extDateBuddha($row["d_create"]),
                "dc_user_update_id" => $row["dc_user_update_id"],
                "dc_user_update_cost_id" => $row["dc_user_update_cost_id"],
                "d_update" => $date->extDateBuddha($row["d_update"])
            );
            ${$root}[] = $temp;
        }
        $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
        $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
        echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
        exit();
    } catch (Exception $e) {
        // ส่งคืนเมื่อเกิด error หรือ warning
        echo json_encode([
            "status" => "error",
            "message" => $e->getMessage()
        ]);
        exit();
    }
} else if ('APSTEPS11') {  //
    // กำหนดให้ PHP warning กลายเป็น Exception
    set_error_handler(function ($severity, $message, $file, $line) {
        throw new ErrorException($message, 0, $severity, $file, $line);
    });
    try {
        // ตัวอย่างโค้ดที่อาจเกิด warning หรือ error
        // ส่งคืนเมื่อสำเร็จ
//    echo json_encode([
//        "status" => "success",
//        "message" => "Data inserted successfully"
//    ]);
        $editArry = array(3 => '<span style="color:red">ส่งแก้ไข</span>' // พนักงานสายงาน
            , 2 => '<span style="color:red">ส่งแก้ไข</span>' // หัวหน้าสายงาน
            , 1 => '<span style="color:red">แก้ไขแล้ว</span>' // ธุระการ
            , 4 => '<span style="color:blue">แก้ไขแล้ว</span>'
        );
        $getsql = "select dc_emp_id, c_sub_name_eng "
                . ", c_last_name_eng  "
                . ", c_first_name_eng "
                . ", (select top 1 c_name from NMU_DATACENTER.dbo.dc_position where dc_position_id=dc_emp.dc_position_id) as c_position "
                . ", c_name "
                . ", c_title FROM NMU_DATACENTER.dbo.dc_emp where dc_emp_id=? and i_enable=1";

        $rs = $db->GetDataBySQL($getsql, array($_SESSION['dc_emp_id']));
        $singer = array(
            "dc_emp_id" => $rs["dc_emp_id"],
            "c_position" => $rs["c_position"],
            "c_title" => $rs["c_title"],
            "c_name" => $rs["c_name"],
            "c_first_name_eng" => $rs["c_first_name_eng"],
            "c_sub_name_eng" => $rs["c_sub_name_eng"],
            "sign_now_date" => $date->extDateBuddha(Date('Y-m-d'))
        );

        $is_audit = ($_SESSION['user_id'] == 1) ? true : false;

        if ($is_audit) {
            $waudit = "";
        } else {
            $waudit = " and b.dc_user_id = " . $_SESSION['user_id'];
        }

        $sqlTempTable = "select a.document_id  , a.document_type_id 
                            , a.c_name, a.sp_tor_id 
                            , a.dc_user_create_id,a.dc_user_create_cost_id,a.d_create
                            , a.dc_user_update_id,a.dc_user_update_cost_id,a.d_update
                            , b.c_full_name, b.dc_emp_id, b.dc_user_id
                            , isnull(b.i_status,0) as  i_status ,b.c_position_name ,b.c_postion ,b.postion_id as position_id 
                            , row_number() over (order by a.document_id DESC) as row
                             from dbo.sp_sign_document a
                             inner join dbo.sp_sign_position b on b.sp_tor_id =a.sp_tor_id and b.document_type_id=a.document_type_id
                             where a.i_enabled=1 {$waudit}";

        $arrParam[] = $start;
        $arrParam[] = $limit;
        $sqlMain = "select ap.*
    , d.dir as c_dir,d.[filename] as c_filename   
    , d.show_page ,	d.c_x	,d.c_y
    , (select count(*) from dbo.sp_sign_position where sp_tor_id =ap.sp_tor_id and document_type_id=ap.document_type_id) as countSign
    , t.c_name as c_detail
    , t.c_code as c_code_detail
    , t.d_doc_ref as d_doc_ref
    , t.dc_department_id 
    , t.sp_emp_id 
    , t.dc_cost2_id 
    , t.dc_cost_id  
    , (select top 1 c_name from dbo.sp_emp where sp_emp_id=t.sp_emp_id)  as sp_emp_name
    , (select top 1 c_postion from dbo.sp_sign_position where dc_user_id=ap.dc_emp_id)  as step_sign
    , ap.c_full_name  as signer_name
    , (select top 1 c_name from dbo.sp_department  where dc_department_id=t.dc_department_id)  as dc_department_name
    , (select top 1 c_name from NMU_DATACENTER.dbo.dc_cost where dc_cost_id=t.dc_cost_id)  as dc_cost_idTxt
    , (SELECT TOP 1 c_name FROM NMU_DATACENTER.dbo.dc_cost WHERE dc_cost_id=t.dc_cost2_id)  AS dc_cost2_idTxt 
    
    , (select top 1 c_full_name from dbo.dc_user where dc_user_id=ap.dc_user_create_id) as c_create_name
    , (select top 1 c_name from dbo.dc_cost where dc_cost_id=ap.dc_user_create_cost_id) as c_cost_creat_name
    , convert(varchar, ap.d_create, 120) as d_create
    , (select top 1 c_full_name from dbo.dc_user where dc_user_id=ap.dc_user_update_id) as c_update_name
    , (select top 1 c_name from dbo.dc_cost where dc_cost_id=ap.dc_user_update_cost_id) as c_cost_update_name
    , convert(varchar, ap.d_update, 120) as d_update "
                . " from ({$sqlTempTable}) ap "
                . " inner join dbo.sp_tor t on t.tor_id=ap.sp_tor_id"
                . " inner join dbo.sp_sign_document d on d.document_id=ap.document_id"
                . " WHERE row > ? and row <= ?";
//    echo $db->debugSql($sqlMain, $arrParam); exit;

        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = $start + 1;
        $arrStatus = array(0 => "รอลงนาม", 1 => "ลงนามแล้ว", 2 => "Reject");
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "id" => intval($row["row"]),
                "position_id" => intval($row["position_id"]),
                "dc_user_id" => intval($row["dc_user_id"]),
                "dc_emp_id" => intval($row["dc_emp_id"]),
                "document_id" => intval($row["document_id"]),
                "document_type_id" => intval($row["document_type_id"]),
                "c_status" => $arrStatus[$row["i_status"]],
                "i_status" => intval($row["i_status"]),
                "countSign" => intval($row["countSign"]),
                "show_page" => $row["show_page"],
                "c_x" => $row["c_x"],
                "c_y" => $row["c_y"],
                "c_dir" => $row["c_dir"],
                "c_filename" => $row["c_filename"],
                "c_position_name" => $row["c_position_name"],
                "c_name" => $row["c_name"],
                "step_sign" => $row["c_postion"],
                "c_detail" => $row["c_detail"],
                "c_code_detail" => $row["c_code_detail"],
                "d_doc_ref" => $row["d_doc_ref"],
                "dc_user_create_id" => $row["c_create_name"],
                "dc_user_create_cost_id" => $row["c_cost_creat_name"],
                "d_create" => $date->extDateBuddha($row["d_create"]),
                "dc_user_update_id" => $row["dc_user_update_id"],
                "dc_user_update_cost_id" => $row["dc_user_update_cost_id"],
                "d_update" => $date->extDateBuddha($row["d_update"])
            );
            ${$root}[] = $temp;
        }
        $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
        $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
        echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
        exit();
    } catch (Exception $e) {
        // ส่งคืนเมื่อเกิด error หรือ warning
        echo json_encode([
            "status" => "error",
            "message" => $e->getMessage()
        ]);
        exit();
    }
} else if ($type == "PRLISTSTEP02") {
//2	APSTEPS20	หัวหน้าสายงานซื้อจ้าง ลงนามตรวจสอบ    
    // กำหนดให้ PHP warning กลายเป็น Exception
    set_error_handler(function ($severity, $message, $file, $line) {
        throw new ErrorException($message, 0, $severity, $file, $line);
    });

    try {
        // ตัวอย่างโค้ดที่อาจเกิด warning หรือ error
        // ส่งคืนเมื่อสำเร็จ
//    echo json_encode([
//        "status" => "success",
//        "message" => "Data inserted successfully"
//    ]);
        $editArry = array(3 => '<span style="color:red">ส่งแก้ไข</span>' // พนักงานสายงาน
            , 2 => '<span style="color:red">ส่งแก้ไข</span>' // หัวหน้าสายงาน
            , 1 => '<span style="color:red">แก้ไขแล้ว</span>' // ธุระการ
            , 4 => '<span style="color:blue">แก้ไขแล้ว</span>'
        );
//    $getsql = "select dc_emp_id, c_sub_name_eng "
//            . ", c_last_name_eng  "
//            . ", c_first_name_eng "
//            . ", (select top 1 c_name from NMU_DATACENTER.dbo.dc_position where dc_position_id=dc_emp.dc_position_id) as c_position "
//            . ", c_name "
//            . ", c_title FROM NMU_DATACENTER.dbo.dc_emp where dc_emp_id=? and i_enable=1";
// 
//    $rs = $db->GetDataBySQL($getsql, array($_SESSION['dc_emp_id'])); 
//    $singer = array($rs["dc_emp_id"],$rs["c_position"],$rs["c_title"],$rs["c_name"]
//            ,$rs["c_first_name_eng"]
//            ,$rs["c_sub_name_eng"]);
        $docType = $_REQUEST['docType'] ?? null;

        switch ($docType) {
            case 1: $type_menu = " and a.tor_status_id = 11";
                break; //menu
            case 2: $type_menu = " and a.tor_status_id = 11";
                break; //menu 
            case 3: $type_menu = " and a.tor_status_id = 11";
                break; //menu  
            default:
                break;
        }
//        

        $waudit = "";

//    $arrParam[] = 1;
//    $arrCountParam[] = 1;
        $sqlTempTable = "select a.tor_id , row_number() over (order by a.tor_id DESC) as row
                        from dbo.sp_tor a  
                    where a.i_enabled=1 {$type_menu}";

        $arrParam[] = $start;
        $arrParam[] = $limit;

//    print_r($arrParam);exit();  
        $sqlMain = "select a.*  "
//    . " , (select top 1 c_name form [dbo].[sp_tor_victory] where sp_tor_id = t.tor_id) as po_creditor_idTxt
//        , (select top 1 dc_creditor_id form [dbo].[sp_tor_victory] where sp_tor_id  = t.tor_id) as dc_creditor_id "
                . " 
                , t.c_name
                , t.c_code
                , t.dc_expense_budget_type_id
                , t.po_expense_id
                , t.dc_cost_id
                ,t.dc_cost2_id
                , t.i_purchase
                , t.tor_type_id
                , t.i_hire_type
                , t.i_product_type 
                , t.d_doc_ref 
    , t.dc_department_id 
    , t.sp_emp_id 
    , t.dc_cost2_id 
    , t.dc_cost_id  
    , (select top 1 c_name from dbo.sp_emp where sp_emp_id=t.sp_emp_id) as sp_emp_name
    , (select top 1 c_name from dbo.sp_department  where dc_department_id=t.dc_department_id)  as dc_department_name
    , (select top 1 c_name from NMU_DATACENTER.dbo.dc_cost where dc_cost_id=t.dc_cost_id)  as dc_cost_idTxt
    , (SELECT TOP 1 c_name FROM NMU_DATACENTER.dbo.dc_cost WHERE dc_cost_id=t.dc_cost2_id)  AS dc_cost2_idTxt 
    
    , (select top 1 c_full_name from NMU_DATACENTER.dbo.dc_user where dc_user_id=t.dc_user_create_id) as c_create_name
    , (select top 1 c_name from NMU_DATACENTER.dbo.dc_cost where dc_cost_id=t.dc_user_create_cost_id) as c_cost_creat_name
    , convert(varchar, t.d_create, 120) as d_create
    , (select top 1 c_full_name from NMU_DATACENTER.dbo.dc_user where dc_user_id=t.dc_user_update_id) as c_update_name
    , (select top 1 c_name from NMU_DATACENTER.dbo.dc_cost where dc_cost_id=t.dc_user_update_cost_id) as c_cost_update_name
    , convert(varchar, t.d_update, 120) as d_update "
                . "from ({$sqlTempTable}) a "
                . " inner join dbo.sp_tor t on t.tor_id=a.tor_id"
//. " left join [dbo].[sp_tor_victory] v on v.sp_tor_id = t.tor_id"                  
                . " WHERE row > ? and row <= ?";
//    echo $db->debugSql($sqlMain, $arrParam); exit;

        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = $start + 1;

        while ($row = $db->Fetch($stmt)) {

            $temp = array(
                "no" => $i++,
                "id" => "{$row["tor_id"]}",
                "c_code" => $row["c_code"],
                "c_name" => $row["c_name"],
//                "po_creditor_idTxt" => $row["po_creditor_idTxt"],
//                "dc_creditor_id" => $row["dc_creditor_id"],
                "dc_expense_budget_type_id" => $row["dc_expense_budget_type_id"],
                "po_expense_id" => $row["po_expense_id"],
                "dc_cost_id" => $row["dc_cost_id"],
                "dc_cost2_id" => $row["dc_cost2_id"],
                "i_purchase" => $row["i_purchase"],
                "tor_type_id" => $row["tor_type_id"],
                "i_hire_type" => $row["i_hire_type"],
                "i_product_type" => $row["i_product_type"],
                "d_doc_ref" => $row["d_doc_ref"],
                "dc_user_create_id" => $row["c_create_name"],
                "dc_user_create_cost_id" => $row["c_cost_creat_name"],
                "d_create" => $date->extDateBuddha($row["d_create"]),
                "dc_user_update_id" => $row["c_update_name"],
                "dc_user_update_cost_id" => $row["c_cost_update_name"],
                "d_update" => $date->extDateBuddha($row["d_update"])
            );
            ${$root}[] = $temp;
        }
        $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
        $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
        echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
        exit();
    } catch (Exception $e) {
        // ส่งคืนเมื่อเกิด error หรือ warning
        echo json_encode([
            "status" => "error",
            "message" => $e->getMessage()
        ]);
        exit();
    }
} else if ($type == "APSTEPS30") {
//3	APSTEPS30	หัวหน้าพัสดุ ลงนามตรวจสอบ    
} else if ($type == "APSTEPS40") {
//4	APSTEPS40	รองคณะบดี ลงนามตรวจสอบ   
} else if ($type == "APSTEPS50") {
// 5	APSTEPS50	คณะบดีลงนามอนุมัติเอกสาร   
} else if ($type == "TORSTEP02") {
    
} else if ($type == "ADDDOCAPP") {



    // กำหนดให้ PHP warning กลายเป็น Exception
    set_error_handler(function ($severity, $message, $file, $line) {
        throw new ErrorException($message, 0, $severity, $file, $line);
    });

    try {
        // ตัวอย่างโค้ดที่อาจเกิด warning หรือ error
        // ส่งคืนเมื่อสำเร็จ
//    echo json_encode([
//        "status" => "success",
//        "message" => "Data inserted successfully"
//    ]);
        $editArry = array(3 => '<span style="color:red">ส่งแก้ไข</span>' // พนักงานสายงาน
            , 2 => '<span style="color:red">ส่งแก้ไข</span>' // หัวหน้าสายงาน
            , 1 => '<span style="color:red">แก้ไขแล้ว</span>' // ธุระการ
            , 4 => '<span style="color:blue">แก้ไขแล้ว</span>'
        );
        $getsql = "select dc_emp_id, c_sub_name_eng "
                . ", c_last_name_eng  "
                . ", c_first_name_eng "
                . ", (select top 1 c_name from NMU_DATACENTER.dbo.dc_position where dc_position_id=dc_emp.dc_position_id) as c_position "
                . ", c_name "
                . ", c_title FROM NMU_DATACENTER.dbo.dc_emp where dc_emp_id=? and i_enable=1";

        $rs = $db->GetDataBySQL($getsql, array($_SESSION['dc_emp_id']));
        $singer = array($rs["dc_emp_id"], $rs["c_position"], $rs["c_title"], $rs["c_name"]
            , $rs["c_first_name_eng"]
            , $rs["c_sub_name_eng"]);

        $waudit = "";

        $type_menu = $_REQUEST['type_menu'] ?? null;

        $sqlTempTable = "select a.[sp_approval_hdr_id] , row_number() over (order by a.sp_approval_hdr_id DESC) as row
                        from dbo.sp_approval_hdr a  
                    where a.i_enable=1 {$waudit}";

        $arrParam[] = $start;
        $arrParam[] = $limit;
        $sqlMain = "select a.* ,ap.[c_name]
      ,ap.[c_code]
      ,ap.[i_type]
      ,ap.[doc_no]
      ,ap.[sp_tor_id]
      ,ap.[id_ref]
      ,ap.[i_version]
      ,ap.[approve_step]
      ,ap.[doc_date]
      ,ap.[sign_step_val]
      ,ap.[sign_step_doc]
      ,ap.[sign_step_date]
      ,ap.[approved_document_val]
      ,ap.[approved_document_doc]
      ,convert(varchar, ap.[approved_document_date], 120) as approved_document_date
      ,ap.[requester]
      ,ap.[response_by]
      ,ap.[approve_status]
      ,ap.[approve_date]
      ,ap.[approve_by]
      ,ap.[review_status]
      ,ap.[review_date]
      ,ap.[c_comment]
      ,ap.[i_enable]
      ,ap.[i_delete]
      ,ap.[dc_user_create_id]
      ,ap.[dc_user_create_cost_id] 
      ,ap.[dc_user_update_id]
      ,ap.[dc_user_update_cost_id]
 "
                . " ,isnull(ap.sp_approval_hdr_id, sign_step_doc) as c_status"
                . " ,isnull(ap.sp_approval_hdr_id, ap.sign_step_doc) as c_sign_status"
                . " ,isnull(ap.sp_approval_hdr_id, ap.sign_step_doc) as c_approve_status"
                . " ,isnull(ap.review_status,null) as review_status"
                . " ,(select top 1 name from dbo.sp_status_document where value=ap.approved_document_val) as step_document "
                . " ,(select top 1 name from dbo.sp_signin_document where value=ap.sign_step_val) as step_sign "
                . " ,(select top 1 name from dbo.sp_approve_document where value=ap.approved_document_val) as status_approve "
                . " , (select top 1 c_name from NMU_DATACENTER.dbo.dc_emp where dc_emp_id=ap.response_by) as approve_by "
                . " , v.c_name as po_creditor_idTxt
    , v.dc_creditor_id
    
    , t.dc_department_id 
    , t.sp_emp_id 
    , t.dc_cost2_id 
    , t.dc_cost_id  
    , (select top 1 c_name from dbo.sp_emp where sp_emp_id=t.sp_emp_id)  as sp_emp_name
    , (select top 1 signer_name from dbo.sp_approval_signatures where sp_approval_hdr_id=ap.sp_approval_hdr_id)  as signer_name
    , (select top 1 c_name from dbo.sp_department  where dc_department_id=t.dc_department_id)  as dc_department_name
    , (select top 1 c_name from NMU_DATACENTER.dbo.dc_cost where dc_cost_id=t.dc_cost_id)  as dc_cost_idTxt
    , (SELECT TOP 1 c_name FROM NMU_DATACENTER.dbo.dc_cost WHERE dc_cost_id=t.dc_cost2_id)  AS dc_cost2_idTxt 
    
    , (select top 1 c_full_name from dbo.dc_user where dc_user_id=ap.dc_user_create_id) as c_create_name
    , (select top 1 c_name from dbo.dc_cost where dc_cost_id=ap.dc_user_create_cost_id) as c_cost_creat_name
    , convert(varchar, ap.d_create, 120) as d_create
    , (select top 1 c_full_name from dbo.dc_user where dc_user_id=ap.dc_user_update_id) as c_update_name
    , (select top 1 c_name from dbo.dc_cost where dc_cost_id=ap.dc_user_update_cost_id) as c_cost_update_name
    , convert(varchar, ap.d_update, 120) as d_update "
                . "from ({$sqlTempTable}) a "
                . " inner join dbo.sp_approval_hdr ap on ap.sp_approval_hdr_id = a.sp_approval_hdr_id"
                . " inner join dbo.sp_tor t on t.tor_id=ap.sp_tor_id"
                . " inner join [dbo].[sp_tor_victory] v on v.sp_tor_id = t.tor_id"
                . " WHERE row > ? and row <= ?";
//    echo $db->debugSql($sqlMain, $arrParam); exit;

        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = $start + 1;

        while ($row = $db->Fetch($stmt)) {

            $temp = array(
                "no" => $i++,
                "id" => intval($row["sp_approval_hdr_id"]),
                "sp_approval_hdr_id" => intval($row["sp_approval_hdr_id"]),
//            "ap_sp_emp_name" => $row["ap_sp_emp_name"], 
                "review_status" => $row["review_status"],
                "c_status" => $row["c_status"],
                "singer" => $singer,
                "signer_name" => $row["signer_name"],
                "c_name" => $row["approve_by"],
                //            step_document  step_sign status_approve approve_by
                "step_document" => $row["step_document"],
                "step_sign" => $row["step_sign"],
                "status_approve" => $row["status_approve"],
                "approve_by" => $row["approve_by"],
//            "i_doc_document" => intval($row["i_doc_document"]), 
//            "c_doc_document" => $row["c_doc_document"], 
//            "i_signin_document" => intval($row["i_signin_document"]), 
//            "c_signin_document" => $row["c_signin_document"],  
//            "i_approve_document" => intval($row["i_approve_document"]), 
//            "c_approve_document" => $row["c_approve_document"],       
//            "c_name" => $row["c_name"],
//            "c_code" => $row["c_code"],
//            "i_type" => $row["i_type"],
//            "doc_no" => $row["doc_no"],
//            "sp_tor_id" => $row["sp_tor_id"],
//            "id_ref" => $row["id_ref"],
//            "i_version" => $row["i_version"],
//            "approve_step" => $row["approve_step"],
//            "doc_date" => $row["doc_date"],
                "sign_step_val" => $row["sign_step_val"],
                "sign_step_doc" => $row["sign_step_doc"],
                "sign_step_date" => $row["sign_step_date"],
                "sign_now_date" => $date->extDateBuddha(date('Y-m-d')),
                "approved_document_val" => $row["approved_document_val"],
                "approved_document_doc" => $row["approved_document_doc"],
                "approved_document_date" => $row["approved_document_date"],
//            "requester" => $row["requester"],
//            "response_by" => $row["response_by"],
//            "approve_status" => $row["approve_status"],
//            "approve_date" => $row["approve_date"],
//            "approve_by" => $row["approve_by"],
//            "review_status" => $row["review_status"],
//            "review_date" => $row["review_date"],
//                    "dc_cost_id" => intval($row["dc_cost_id"]),
//                    "dc_cost_idTxt" => $row["dc_cost_idTxt"],
//                    "dc_cost2_id" => intval($row["dc_cost2_id"]),
//                    "dc_cost2_idTxt" => $row["dc_cost2_idTxt"],
//                    "sp_emp_name" => $row["sp_emp_name"],
//                    "txtsp_emp_idID" => $row["sp_emp_name"],
//                    "sp_emp_id" => intval($row["sp_emp_id"]),
//                    "dc_department_id" => intval($row["dc_department_id"]),
//         
//                    "i_parent" => $row["i_parent"],
//                    "i_is_parent" => $row["i_is_parent"],
//                    "d_doc_ref" => $row["d_doc_ref"],
//                    "i_year" => $row["i_yyyy"],
//                    "i_yyyy" => $row["i_yyyy"],
                "c_comment" => $row["c_comment"],
                "i_enable" => intval($row["i_enable"]),
                "i_delete" => intval($row["i_delete"]),
                "dc_user_create_id" => $row["c_create_name"],
                "dc_user_create_cost_id" => $row["c_cost_creat_name"],
                "d_create" => $date->extDateBuddha($row["d_create"]),
                "dc_user_update_id" => $row["dc_user_update_id"],
                "dc_user_update_cost_id" => $row["dc_user_update_cost_id"],
                "d_update" => $date->extDateBuddha($row["d_update"])
            );
            ${$root}[] = $temp;
        }
        $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
        $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
        echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
        exit();
    } catch (Exception $e) {
        // ส่งคืนเมื่อเกิด error หรือ warning
        echo json_encode([
            "status" => "error",
            "message" => $e->getMessage()
        ]);
        exit();
    }
}