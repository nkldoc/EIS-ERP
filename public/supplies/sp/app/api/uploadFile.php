<?PHP

require_once("../../../conf/config.php");
require_once("../../../lib/database/DatabaseServer.php");
require_once("../../../lib/database/apiUtil.php");
require_once("../../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();
$response = ['success' => false, 'message' => 'Unpermission']; 
function mnUpdateSql($c_code, $document_type_id, $c_x, $c_y,$page) {
    global $db;

    $arrValue[] = $c_x;
    $arrValue[] = $c_y;
    $arrValue[] = $page;
    $arrValue[] = $c_code;
    $arrValue[] = $document_type_id;

    $sql = "UPDATE dbo.sp_sign_document SET c_x=?, c_y=?,show_page=? Where c_code=? and document_type_id=?";
//    echo $sql;
//    print_r($arrValue);
    return $db->QueryParam($sql, $arrValue);
} 
//End Function 
if ($_SERVER['REQUEST_METHOD'] === 'POST') { 
    $response = ['success' => false, 'message' => 'SAVE failed']; 
    $c_code = $_REQUEST['c_code'];
    $document_type_id = $_REQUEST['document_type_id'];
    $c_x = $_REQUEST['c_x'];
    $c_y = $_REQUEST['c_y']; 
    $show_page = $_REQUEST['show_page']; 
    $mst = mnUpdateSql($c_code, $document_type_id, $c_x, $c_y, $show_page); 
       
    if ($mst) {
        $response = ['success' => true, 'message' => "{$c_code} {$document_type_id} , {$show_page}, {$c_x}, {$c_y} Upload successful!"];
    } else {
        $response = ['success' => false, 'message' => 'Save To Sql Unsuccessful!'];
    }
    echo json_encode($response);
}
