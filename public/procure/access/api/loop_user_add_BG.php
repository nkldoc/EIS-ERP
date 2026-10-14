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

// $mode        = $_REQUEST["mode"];
$arrParam    = array();
$addField    = null;
$addValue    = null;
$arrValue    = array();

$arr_stmt  = array();
$error_stmt = "";
$error_code = array();


function select_($c_name)
{
    global $db, $_SESSION, $_REQUEST, $util;

    $arrParam    = array();
    $addField    = null;
    $addValue    = null;
    $arrValue    = array();

    /*** insert dc_title ***/
    $dc_title_id = $db->GetDataBySQL("select top 1 dc_title_id from " . DB_CENTER . "dc_title where c_name = ?", array($c_name));
    if ($dc_title_id) {
        $id = $dc_title_id;
    } else {
        $datas["c_name"]                           = $c_name;
        $datas["c_comment"]                        = "เพิ่มจากการบันทึกข้อมูลลงนามใบขอเบิก";
        $datas["i_enable"]                         = 1;
        $datas["i_delete"]                         = 2;
        $datas["dc_user_create_id"]                = $_SESSION["user_id"];
        $datas["dc_user_create_cost_id"]           = $_SESSION["dc_cost_id"];
        $datas["d_create"]                         = date("Y-m-d H:i:s");
        $datas["dc_user_update_id"]                = $_SESSION["user_id"];
        $datas["dc_user_update_cost_id"]           = $_SESSION["dc_cost_id"];
        $datas["d_update"]                         = date("Y-m-d H:i:s");
        foreach ($datas as $fld => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField   .= ",\n{$fld}";
            $addValue   .= ",\n? /*{$fld}*/";
        }
        $sql   = "
                SET NOCOUNT ON
                INSERT INTO " . DB_CENTER . "dc_title (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                SELECT @@IDENTITY as id;";
        $stmt     = $db->QueryParam($sql, $arrValue);
        $ss_id    = $db->Fetch($stmt);
        $id =  $ss_id["id"];
    }
    return $id;
}


function insert_dc_title($c_name)
{
    global $db, $_SESSION, $_REQUEST, $util;

    $arrParam    = array();
    $addField    = null;
    $addValue    = null;
    $arrValue    = array();

    /*** insert dc_title ***/
    $dc_title_id = $db->GetDataBySQL("select top 1 dc_title_id from " . DB_CENTER . "dc_title where c_name = ?", array($c_name));
    if ($dc_title_id) {
        $id = $dc_title_id;
    } else {
        $datas["c_name"]                           = $c_name;
        $datas["c_comment"]                        = "เพิ่มจากการบันทึกข้อมูลลงนามใบขอเบิก";
        $datas["i_enable"]                         = 1;
        $datas["i_delete"]                         = 2;
        $datas["dc_user_create_id"]                = $_SESSION["user_id"];
        $datas["dc_user_create_cost_id"]           = $_SESSION["dc_cost_id"];
        $datas["d_create"]                         = date("Y-m-d H:i:s");
        $datas["dc_user_update_id"]                = $_SESSION["user_id"];
        $datas["dc_user_update_cost_id"]           = $_SESSION["dc_cost_id"];
        $datas["d_update"]                         = date("Y-m-d H:i:s");
        foreach ($datas as $fld => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField   .= ",\n{$fld}";
            $addValue   .= ",\n? /*{$fld}*/";
        }
        $sql   = "
                SET NOCOUNT ON
                INSERT INTO " . DB_CENTER . "dc_title (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                SELECT @@IDENTITY as id;";
        $stmt     = $db->QueryParam($sql, $arrValue);
        $ss_id    = $db->Fetch($stmt);
        $id =  $ss_id["id"];
    }
    return $id;
}

function insert_dc_position($c_name)
{
    global $db, $_SESSION, $_REQUEST, $util;

    $arrParam    = array();
    $addField    = null;
    $addValue    = null;
    $arrValue    = array();

    /*** inser dc_position ***/
    $dc_position_id = $db->GetDataBySQL("select top 1 dc_position_id from " . DB_CENTER . "dc_position where c_name = ?", array($c_name));
    if ($dc_position_id) {
        $id = $dc_position_id;
    } else {
        $data = array();
        $data["c_name"]                           = $c_name;
        $data["c_comment"]                        = "เพิ่มจากการบันทึกข้อมูลลงนามใบขอเบิก";
        $data["i_enable"]                         = 1;

        $data["dc_user_create_id"]                = $_SESSION["user_id"];
        $data["dc_user_create_cost_id"]           = $_SESSION["dc_cost_id"];
        $data["d_create"]                         = date("Y-m-d H:i:s");

        $data["dc_user_update_id"]                = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"]           = $_SESSION["dc_cost_id"];
        $data["d_update"]                         = date("Y-m-d H:i:s");

        /****  copy มาจาก dc\api\mnDcEmpPosition.php  ****/
        $table        = DB_CENTER . "dc_position";
        $keyName      = "dc_position_id";
        $c_code_gen   = "POS";

        /** case "ADD" **/
        $arrParam = array();
        $arrParam[] = $data["c_name"];
        $arrParam[] = $data["c_comment"];
        $arrParam[] = $data["i_enable"];

        $arrParam[] = $data["dc_user_create_id"];
        $arrParam[] = $data["dc_user_create_cost_id"];
        $arrParam[] = $data["d_create"];

        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];

        $arrParam[] = DELETE_FALSE;

        $sql = "insert into {$table} (c_name, c_comment, i_enable
                            , dc_user_create_id, dc_user_create_cost_id, d_create
                            , dc_user_update_id, dc_user_update_cost_id, d_update
                            ,i_delete)
                    values (?, ?, ?
                            , ?, ?, ?
                            , ?, ?, ?
                            , ?); ";
        $sql .= "SELECT @@IDENTITY as ret_id";
        $stmt = $db->QueryParam($sql, $arrParam);
        if ($stmt) {
            $next_result = $db->NextResult($stmt);
            if ($next_result) {
                $dd_hdr = $db->Fetch($stmt);
                $ret_id = $dd_hdr["ret_id"];
            }

            $code_dc     = (string) $c_code_gen;
            $arrParam2  = array($code_dc, $data['dc_user_create_id'], $data['dc_user_create_cost_id'], $ret_id);
            $sql2    = "EXEC SP_GEN_CODE_DC ?,?,?,?;";
            $stmt2     = $db->QueryParam($sql2, $arrParam2);

            $arr_gen_code = $db->Fetch($stmt2);
            $c_code     = $arr_gen_code["c_code_gen"];
            $ref_id       = $arr_gen_code["reference_id"];

            $stmt3 = false;
            if ($ret_id == $ref_id) {
                $sql3 = "UPDATE {$table}
                    SET c_code=?
                    WHERE {$keyName} = ?";
                $arrParam3 = array($c_code, $ret_id);
                $stmt3 = $db->QueryParam($sql3, $arrParam3);
            }
        }
        /**** [END] copy มาจาก case "ADD", dc\api\mnDcEmpPosition.php  ****/
        $id = $ret_id;
    }
    return $id;
}


function insert_user($c_code, $c_title, $c_user, $c_position, $c_cost, $c_cost_acc, $nmu, $fm, $eis, $spl)
{
    global $db, $_SESSION, $_REQUEST, $util, $arr_stmt, $mn_poSendStatusAll_res;
    $res = array();

    $sql = "
            SELECT 
                a.dc_cost_acc_id
                , a.dc_cost_id 
                ,a.c_name
            FROM " . DB_CENTER . "dc_cost a
            INNER JOIN " . DB_CENTER . "dc_cost b ON a.dc_cost_acc_id = b.dc_cost_id
            WHERE b.c_name = ? AND a.c_name = ?
        ";
    $dc_cost_arr = $db->GetDataBySQL($sql, array($c_cost_acc, $c_cost));

    // $con = ($c_cost_acc_code == "77")  ? "and dc_cost_acc_id = 77" : "and dc_cost_acc_id != 77";
    // $dc_cost_arr = $db->GetDataBySQL("select top 1 dc_cost_id ,c_code + ' ' + c_name as c_name from " . DB_CENTER . "dc_cost where i_last = 1 {$con} and c_name = ?", array($c_cost));

    $data_post =  array(
        "mode" =>  "ADD",
        "id" =>  null,
        "c_code" =>  $c_code,
        "dc_title_id" =>  insert_dc_title($c_title),
        "dc_title_idID" =>  $c_title,
        "c_title" =>  $c_title,
        "c_name" =>  $c_user,
        "dc_position_id" => insert_dc_position($c_position),
        "dc_position_idID" =>  $c_position,
        "c_ref_value" =>  "-",
        "c_tax_value" =>  "-",
        "c_address" =>  "-",
        "c_address_card" =>  "-",
        "c_tel_home" =>  "",
        "c_tel_office" =>  "",
        "c_mobile" =>  "",
        "c_email" =>  "",
        "d_birth" =>  "",
        "d_begin" =>  "",
        "d_resign" =>  "",
        "dc_cost_id" =>  $dc_cost_arr["dc_cost_id"],
        "txtdc_cost_idID" =>  $dc_cost_arr["c_name"],
        "sp_department_id" =>  0,
        "sp_department_idID" =>  "สายงาน",
        "i_level" =>  3,
        "c_comment" =>  "",
        "i_enable" =>  1,
    );
    $result = array();
    $res[] = $util->post_url(OST_HOST . '://' . NMU_EIS_HOST . '/dc/api/mnDcEmp.php',  $data_post);

    $dc_emd_arr = $db->GetDataBySQL("select top 1 dc_emp_id, c_title + c_name as c_name from " . DB_CENTER . "dc_emp where c_code = ? and c_name = ?", array($c_code, $c_user));

    $data_post =  array(
        "mode" => "Save",
        "id" => null,
        "emp_id" => $dc_emd_arr["dc_emp_id"],
        "dc_emp_id" => $dc_emd_arr["dc_emp_id"],
        "c_full_name" => $dc_emd_arr["c_name"],
        "dc_cost_id" => $dc_cost_arr["dc_cost_id"],
        "dc_cost_code" => $dc_cost_arr["c_name"],
        "c_user_name" => $c_code,
        "c_password" => $c_code,
        "comfirm_pass" => $c_code,
        "c_comment" => "",
        "i_type_user" => "1",
        "i_enable" => "1",
        "i_permit_nmu" => $nmu,
        "i_permit_fm" => $fm,
        "i_permit_eis" => $eis,
        "i_permit_supplies" => $spl,
        "set_session" => 1,
        "session_dc_cost_id" => 3,
        "session_user_id" => 1,

    );
    $res[] = $util->post_url(OST_HOST . '://' . NMU_EIS_HOST . '/dc/api/mnDcUserAdd.php',  $data_post);
    return $res;
}

/***** insert_user($c_code, $c_title, $c_user, $c_position, $c_cost, $c_cost_acc_code, $nmu, $fm, $eis, $spl) *****/
		  	

// print_r(insert_user("11193", "นางสาว", "กฤษณา กองแสนแก้ว", "พยาบาลวิชาชีพชำนาญการ", "ฝ่ายการพยาบาล", "คณะแพทยศาสตร์วชิรพยาบาล", "0", "0", "1", "0")); 
// print_r(insert_user("12026", "นางสาว", "อรทัย แก้วจรัสวิไล", "พยาบาลวิชาชีพปฏิบัติการ", "ฝ่ายการพยาบาล", "คณะแพทยศาสตร์วชิรพยาบาล", "0", "0", "1", "0"));
// print_r(insert_user("11309", "นางสาว", "อุษณีย์ ใยพันธ์", "พยาบาลวิชาชีพปฏิบัติการ", "ฝ่ายการพยาบาล", "คณะแพทยศาสตร์วชิรพยาบาล", "0", "0", "1", "0"));
// print_r(insert_user("11904", "นางสาว", "ปัณฑิตา ศรีเฮงไพบูลย์", "พยาบาลวิชาชีพปฏิบัติการ", "ฝ่ายการพยาบาล", "คณะแพทยศาสตร์วชิรพยาบาล", "0", "0", "1", "0"));
// print_r(insert_user("11178", "นางสาว", "นุภาวัน แสนหัวห้าว", "DEV", "พยาบาลวิชาชีพปฏิบัติการ", "คณะแพทยศาสตร์วชิรพยาบาล", "0", "0", "1", "0"));
// print_r(insert_user("11302", "นางสาว", "อารยา ฮั้วบางยาง", "พยาบาลวิชาชีพปฏิบัติการ", "ฝ่ายการพยาบาล", "คณะแพทยศาสตร์วชิรพยาบาล", "0", "0", "1", "0"));


     