<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");
include("../../lib/database/apiUtil.php");

$db        = new DatabaseServer();
$date     = new i_date();
$util   = new apiUtil();

$root        = "data";
$data        = array();

$mode        = $_REQUEST["mode"];
$arrParam    = array();
$addField    = null;
$addValue    = null;
$arrValue    = array();

$arr_stmt  = array();
$error_stmt = "";
$error_code = array();

$db->BeginTran();
switch ($mode) {

    case "Goooooooo":
        $dc_menu_hdr_id = $_REQUEST["dc_menu_hdr_id"];
        $Arr = json_decode($_REQUEST["data"], true);
        if ($Arr) {
            $msg = "";
            $msg_date_back = "";
            $sql = "";
            foreach ($Arr as $dc_user_id) {
                $sql = "
                
                UPDATE a
                SET a.i_read_self = b.i_read_self
                , a.i_read_cost = b.i_read_cost
                , a.i_read_all = b.i_read_all
                , a.i_per_add = b.i_per_add
                , a.i_per_update = b.i_per_update
                , a.i_per_delete = b.i_per_delete
                FROM dc_user_menu a
                    INNER JOIN dc_menu_dtl b ON a.dc_menu_id = b.dc_menu_id 
                                        AND b.dc_menu_hdr_id = {$dc_menu_hdr_id} 
                                        AND a.dc_user_id = {$dc_user_id};
                    
                INSERT INTO dc_user_menu
                SELECT {$dc_user_id} as dc_user_id
                    , dc_menu_id, dc_menu_hdr_id
                    , i_show, i_read_self, i_read_cost, i_read_all, 0 as i_read_overall
                    , i_per_add, i_per_update, i_per_delete 
                FROM dc_menu_dtl 
                WHERE dc_menu_hdr_id = {$dc_menu_hdr_id}
                    AND dc_menu_id NOT IN (SELECT dc_menu_id FROM dc_user_menu 
                                            WHERE dc_user_id = {$dc_user_id});
                ";
                if ($sql != ""){
                    $stmt = $db->QueryParam($sql, array());
                    $arr_stmt[] = $stmt;
                }
            }

        }
        break;
}

if (!in_array(false, $arr_stmt) && count($arr_stmt)) {
    $db->CommitTran();
    $msg = @$msg_date_back != "" ? $msg_date_back : "บันทึกเรียบร้อย";
    $i_back = @$msg_date_back != "" ? 1 : 0;
    $re = array("reval" => 0, "i_back" => $i_back, "success" => true, "msg" => $msg, "count_stmt" => count($arr_stmt));
} else {
    $db->RollBackTran();
    foreach ($arr_stmt as $index => $value) $error_stmt .= "\tstmt[" . $index . "] = " . ($value ? "true" : "false") . "\n";
    $re = array("reval" => 1, "success" => false, "msg" => "<pre>check statement :\n" . $error_stmt . "</pre>", "error_code" => @$error_code, "poSendStatusAll" => @$mn_poSendStatusAll_res);
}
echo json_encode($re);
exit;
