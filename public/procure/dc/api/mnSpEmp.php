<?php
include("../../conf/config.php");
include("../conf/configDc.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

//print_r($_REQUEST);
// exit;
$db = new DatabaseServer();
$date     = new i_date();
$util    = new apiUtil();

$mode        = $_REQUEST["mode"];
$table         = "dc_emp";
$keyName     = "dc_emp_id";

$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;
$data["d_birth"] = (@$data["d_birth"] != "") ? $date->bc_to_ad($data["d_birth"]) : NULL;
$data["d_begin"] = (@$data["d_begin"] != "") ? $date->bc_to_ad($data["d_begin"]) : NULL;
$data["d_resign"] = (@$data["d_resign"] != "") ? $date->bc_to_ad($data["d_resign"]) : NULL;

$stmt2 = true;
$stmt3 = true;

$db->BeginTran();

switch ($mode) {
    case "ADD":
        $arrParam = array();
        $arrParam[] = $data["dc_cost_id"];
        $arrParam[] = $data["dc_title_id"];
        $arrParam[] = $data["c_code"];

        $arrParam[] = $data["c_title"];
        $arrParam[] = $data["c_name"];
        $arrParam[] = $data["c_ref_value"];

        $arrParam[] = $data["c_tax_value"];
        $arrParam[] = $data["c_tel_home"];
        $arrParam[] = $data["c_tel_office"];

        $arrParam[] = $data["c_mobile"];
        $arrParam[] = $data["c_email"];
        $arrParam[] = $data["c_address"];

        $arrParam[] = $data["c_address_card"];
        $arrParam[] = $data["c_comment"];//
        $arrParam[] = $data["i_enable"];//

        $arrParam[] = $data["d_birth"];
        $arrParam[] = $data["d_begin"];
        $arrParam[] = $data["d_resign"];

        $arrParam[] = $data["dc_user_create_id"];
        $arrParam[] = $data["dc_user_create_cost_id"];
        $arrParam[] = $data["d_create"];

        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];

        $arrParam[] = DELETE_FALSE;
        $sql = "";
        $sql .= "insert into {$table} (dc_cost_id, dc_title_id, c_code
                                        , c_title, c_name, c_ref_value
                                        , c_tax_value, c_tel_home, c_tel_office
                                        , c_mobile, c_email, c_address
                                        , c_address_card, c_comment, i_enable
                                        , d_birth, d_begin, d_resign
                                        , dc_user_create_id, dc_user_create_cost_id, d_create
                                        , dc_user_update_id, dc_user_update_cost_id, d_update
                                        ,i_delete)
                                values (?, ?, ?
                                        , ?, ?, ?
                                        , ?, ?, ?
                                        , ?, ?, ?
                                        , ?, ?, ?
                                        , ?, ?, ?
                                        , ?, ?, ?
                                        , ?, ?, ?
                                        , ?); ";

        $data["sp_emp_id"]                                    = $_REQUEST["sp_emp_id"];
        $data["c_name"]                                       = $_REQUEST["c_name"];
        $data["dc_emp_id"]                                    = $_REQUEST["dc_emp_id"];
        $data["dc_department_type_id"]                        = $_REQUEST["dc_department_type_id"];
        $data["dc_department_id"]                             = $_REQUEST["dc_department_id"];
        $data["i_parent"]                                     = $_REQUEST["i_parent"];
        $data["i_level"]                                      = $_REQUEST["i_level"];
        $data["i_last"]                                       = $_REQUEST["i_last"];
        $data["c_comment"]                                    = $_REQUEST["c_comment"];
        $data["i_enable"]                                     = STATUS_ENABLE;
        $data["i_delete"]                                     = $_REQUEST["i_delete"];
        $data["dc_user_update_id"]                            = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"]                       = $_SESSION["dc_cost_id"];
        $data["d_update"]                                     = date("Y-m-d H:i:s");
        $data["dc_user_create_id"]                            = $_SESSION["user_id"];
        $data["dc_user_create_cost_id"]                       = $_SESSION["dc_cost_id"];
        $data["d_create"]                                     = date("Y-m-d H:i:s");

        $sql    .= "
				SET NOCOUNT ON
				INSERT INTO bg_budget_hdr_change (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
				SELECT @@IDENTITY as id;";

        foreach ($data as $fld => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField .= ", {$fld}";
            $addValue .= ", ?";
        }

        //echo $sql; print_r($arrParam);exit;
        $stmt = $db->QueryParam($sql, $arrParam);
        break;
    case "EDIT":
        $arrParam = array();
        $arrParam[] = $data["dc_cost_id"];
        $arrParam[] = $data["dc_title_id"];
        $arrParam[] = $data["c_code"];

        $arrParam[] = $data["c_title"];
        $arrParam[] = $data["c_name"];
        $arrParam[] = $data["c_ref_value"];

        $arrParam[] = $data["c_tax_value"];
        $arrParam[] = $data["c_tel_home"];
        $arrParam[] = $data["c_tel_office"];

        $arrParam[] = $data["c_mobile"];
        $arrParam[] = $data["c_email"];
        $arrParam[] = $data["c_address"];

        $arrParam[] = $data["c_address_card"];
        $arrParam[] = $data["c_comment"];
        $arrParam[] = $data["i_enable"];

        $arrParam[] = $data["d_birth"];
        $arrParam[] = $data["d_begin"];
        $arrParam[] = $data["d_resign"];

        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];

        $arrParam[] = $data["id"];
        $arrParam[] = $data["i_level"]??null;
        $arrParam[] = $data["dc_department_id"]??null;

        $arrParam[] = $data["id"];

        $sql = "UPDATE {$table}
                    SET  dc_cost_id = ?
                        , dc_title_id = ?
                        , c_code = ?

                        , c_title = ?
                        , c_name = ?
                        , c_ref_value = ?

                        , c_tax_value = ?
                        , c_tel_home = ?
                        , c_tel_office = ?

                        , c_mobile = ?
                        , c_email = ?
                        , c_address = ?

                        , c_address_card = ?
                        , c_comment = ?
                        , i_enable = ?

                        , d_birth = ?
                        , d_begin = ?
                        , d_resign = ?

                        , dc_user_update_id = ?
                        , dc_user_update_cost_id = ?
                        , d_update = ?
                WHERE {$keyName} = ?

                UPDATE sp_emp
                SET i_level = ? ,dc_department_id = ? , c_name = '{$data["c_name"]}' , i_enable = {$data["i_enable"]}
                WHERE {$keyName} = ?";
        //$arrParam[] = $data["id"];
//        echo $sql; print_r($arrParam); exit;
        $stmt = $db->QueryParam($sql, $arrParam);
        break;
    case "DELETE":
        $sql = "UPDATE {$table}
                        SET i_delete = ?
                    WHERE {$keyName} = ?";
        $arrParam = array(DELETE_TRUE, $data["id"]);
        $stmt = $db->QueryParam($sql, $arrParam);
        break;
}

if ($stmt) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "msg" => "บันทีกเรียบร้อยแล้ว");
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
}

echo json_encode($re);
exit;
