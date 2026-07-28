<?PHP

require_once("../conf/config.php");
require_once("../lib/database/DatabaseServer.php");
require_once("../lib/database/apiUtil.php");
require_once("../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

function mnAddSql($id, $dir, $filename, $db){
 
    $arrValue[] = $dir;
    $arrValue[] = $filename;
    $arrValue[] = $id;
 
               
    $sql = "UPDATE dbo.sp_sign_document SET dir=?,filename=? Where document_id=?";
    
    return $db->QueryParam($sql, $arrValue);
 
} //End Function
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $mypr = $_REQUEST['mypr'];
    $document_id = $_REQUEST['document_id'];

    if (isset($_FILES['myfile'])) {

        $response = ['success' => false, 'message' => 'Upload failed'];

        // สร้าง path ปลายทาง
        $dir = "D:/Documents/" . YEARBG . "/" . $mypr;
        $targetDir = $dir . "/input/";

        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0777, true);
        }

        $filename = basename($_FILES["myfile"]["name"]);
        $targetFile = $targetDir . $filename;

        // ตรวจสอบว่าไฟล์มีอยู่แล้วหรือไม่
        if (file_exists($targetFile)) {
            $response = ['success' => false, 'message' => 'ไฟล์นี้ในรายการ PR อ้างอิง  แล้ว File already exists.'];
        } else {
            // ย้ายไฟล์ไปปลายทาง
            if (move_uploaded_file($_FILES["myfile"]["tmp_name"], $targetFile)) {
                if(mnAddSql($document_id, $dir, $filename, $db)){
                $response = ['success' => true, 'message' => "{$document_id}, {$dir}, {$filename} Upload successful!"];
                }else{
                $response = ['success' => false, 'message' => 'Save To Sql Unsuccessful!'];   
                }
            }
        }

        echo json_encode($response);
    }
}
