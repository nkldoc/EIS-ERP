<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
$db = new DatabaseServer();
$util = new apiUtil();
$date = new i_date();

$PRNO        = $_REQUEST['c_checking_code'] ?? null;
$i_sys       = $_REQUEST['i_sys'] ?? 1;
$is_upload   = $_REQUEST['i_is_upload_chk'] ?? null;

$DB_NAME     = ($i_sys == 3) ? "EIS_PROCURE.dbo." : "NMU_ERP.dbo.";
$todayFolder = date("Y-m-d");
$uploadDir   = "upload_acc/" . $todayFolder . "/"; // relative path for storage & DB
$uploadBase  = "D:/php_supplies/api/";             // absolute base path
$uploadPath  = $uploadBase . $uploadDir;           // full path for storing files

// // create folder if not exists
// if (!is_dir($uploadPath)) {
//     mkdir($uploadPath, 0755, true);
// }

// $safePRNO  = preg_replace('/[^A-Za-z0-9_\-]/', '_', $PRNO);
// $filename  = $safePRNO . "_" . date("Ymd_His") . ".pdf";
// $fileFull  = $uploadPath . $filename;        // for move_uploaded_file
// $fileLink  = $uploadDir . $filename;         // for DB and frontend response

// if ($_FILES['upload_pdfAcc']['name'] != "") {
    // if (move_uploaded_file($_FILES['upload_pdfAcc']['tmp_name'], $fileFull) == false) {
    //     $re = array("reval" => 0, "success" => "Error", "msg" => "ไม่สามารถอัปโหลดไฟล์ pdf");
    //     echo json_encode($re);
    //     exit;
    // }

    $addField = null;
    $addValue = null;
    unset($arrValue, $data);

    $data["sp_check_period_hdr_id"]   = $_REQUEST["sp_check_period_hdr_id"];
    $data["d_doc_date"]               = $date->bc_to_ad($_REQUEST["d_doc_date"]);
    $data["json_select"]              = $_REQUEST["json_select"];
    $data["c_comment"]                = $_REQUEST["disable_acc_c_comment"];
    $data["i_status"]                 = 1;
    $data["link_upload"]              = 0; // store relative path
    $data["i_enable"]                 = 1;
    $data["dc_user_create_id"]        = $_SESSION["user_id"];
    $data["dc_user_create_cost_id"]   = $_SESSION["dc_cost_id"];
    $data["d_create"]                 = date("Y-m-d H:i:s");

    foreach ($data as $fld => $value) {
        $arrValue[] = ($value != "") ? $value : null;
        $addField  .= ", {$fld}";
        $addValue  .= ", ?";
    }

    $sql = "
        SET NOCOUNT ON
        UPDATE {$DB_NAME}sp_check_period_disable_acc  set i_enable = 2 where  sp_check_period_hdr_id = '{$_REQUEST["sp_check_period_hdr_id"]}';
        INSERT INTO {$DB_NAME}sp_check_period_disable_acc (" . substr($addField, 1) . ")
        VALUES (" . substr($addValue, 1) . ");
        SELECT @@IDENTITY as id;

        UPDATE {$DB_NAME}sp_check_period_hdr
        SET sp_check_period_disable_acc_id = @@IDENTITY
        WHERE sp_check_period_hdr_id = '{$_REQUEST["sp_check_period_hdr_id"]}';
    ";

    $stmt = $db->QueryParam($sql, $arrValue);
    $arr_stmt[] = $stmt;

    if (true) {
        $db->CommitTran();
        $re = array(
            "reval" => 0,
            "success" => "Success",
            "msg" => "บันทึกเรียบร้อยแล้ว",
            // "file_path" => $fileLink, // relative path only
            "id" => $_REQUEST['sp_check_period_hdr_id']
        );
    } else {
        $db->RollBackTran();
        $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
    }

    // response for iframe uploads
    echo json_encode($re);
    exit;
// }
?>
