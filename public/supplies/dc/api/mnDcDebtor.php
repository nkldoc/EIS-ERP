<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../../dc/conf/configDc.php");

$db	= new DatabaseServer();
$date	= new i_date();
$util	= new apiUtil();

//print_r($_REQUEST);exit;
// ========================= S A V E =============================== //

$mode		= @$_REQUEST["mode"];
$id		= @$_REQUEST["id"];
$table		= "dc_debtor";

$data = $util->mnUser($_REQUEST);
$addField	= null;
$addValue	= null;
$arrValue	= array();
if (!get($id)) { $id = 0; }
$data["c_branch"] = (@$data["i_branch"] == 1)? "สำนักงานใหญ่" : @$data["c_branch"];
$title_name = $db->GetDataBySQL("select c_name from vw_dc_title where dc_title_id = ?", array(@$data["dc_title_id"]));

switch ($mode) {
    case "ADD" :
        $dc_acc_id = $db->GetDataBySQL("select dc_acc_id from vw_dc_acc where c_code = ?", array(DC_ACC_DEBT_CODE));
        $sql = "SET NOCOUNT ON
                INSERT INTO {$table} (dc_debtor_type_id, dc_acc_id, dc_tax_customer_id, dc_title_id
                                    , c_old_code, c_title, c_name
                                    , c_surname, c_address, c_telephone
                                    , c_mobile, c_fax, c_website, c_email
                                    , c_ref_value, c_tax_value, i_branch, c_branch
                                    , c_name_inv, c_address_inv, c_address_inv2, due_bill
                                    , condition_pay, c_comment, i_enable, i_delete
                                    , dc_user_create_id, dc_user_create_cost_id, d_create
                                    , dc_user_update_id, dc_user_update_cost_id, d_update) 
                        VALUES (?, ?, ?, ?
                                , ?, ?, ?
                                , ?, ?, ?
                                , ?, ?, ?, ?
                                , ?, ?, ?, ?
                                , ?, ?, ?, ?
                                , ?, ?, ?, ?
                                , ?, ?, ?
                                , ?, ?, ?);
                SELECT @@IDENTITY as dc_debtor_id;";
        
        $para	= $db->QueryParam($sql, array($data["dc_debtor_type_id"], $dc_acc_id, $data["dc_tax_customer_id"], $data["dc_title_id"]
                                            , $data["c_old_code"], $title_name, $data["c_name"]
                                            , $data["c_surname"], $data["c_address"], $data["c_telephone"]
                                            , $data["c_mobile"], $data["c_fax"], $data["c_website"], $data["c_email"]
                                            , $data["c_ref_value"], $data["c_tax_value"], $data["i_branch"], $data["c_branch"]
                                            , $data["c_name_inv"], $data["c_address_inv"], $data["c_address_inv2"], $data["due_bill"]
                                            , $data["condition_pay"], $data["c_comment"], $data["i_enable"], DELETE_FALSE
                                            , $data["dc_user_create_id"], $data["dc_user_create_cost_id"], $data["d_create"]
                                            , $data["dc_user_update_id"], $data["dc_user_update_cost_id"], $data["d_update"]));
        unset ($sql);
        unset ($arrValue);

        if($para) {
            $ss_id		= $db->Fetch($para);

            $sql		= "EXEC SP_GEN_CODE_DC ?,?,?,?;";
            $arrValue		= array("CV", $data["dc_user_create_id"], $data["dc_user_create_cost_id"], $ss_id["dc_debtor_id"]);
            $arr_gen_code	= $db->GetDataBySQL($sql, $arrValue);
            unset ($sql);
            unset ($arrValue);

            if ($ss_id["dc_debtor_id"] == $arr_gen_code["reference_id"]) {
                $sql	= "UPDATE {$table} SET c_code = ? WHERE dc_debtor_id = ?";
                $arrValue[] = $arr_gen_code["c_code_gen"];
                $arrValue[] = $ss_id["dc_debtor_id"];

                $db->BeginTran();
                $para	= $db->QueryParam($sql, $arrValue);
                if($para){
                    $db->CommitTran();
                    $re = array("success"	=> "success",
                                "id"		=> $ss_id["dc_debtor_id"],
                                "msg"		=> "success" );
                } else {
                    $db->RollBackTran();
                    $re = array( "msg" => "error" );
                }
            }
        } else {
            $re = array( "msg" => "error" );
        }
        echo json_encode($re);
        exit;
    break;
    case "EDIT" :
            $sql = "UPDATE {$table} 
                    SET dc_debtor_type_id = ?
                        , dc_tax_customer_id = ?
                        , dc_title_id = ?
                        
                        , c_old_code = ?
                        , c_title = ?
                        , c_name = ?
                        
                        , c_surname = ?
                        , c_address = ?
                        , c_telephone = ?

                        , c_mobile = ?
                        , c_fax = ?
                        , c_website = ?
                        , c_email = ?

                        , c_ref_value = ?
                        , c_tax_value = ?
                        , i_branch = ?
                        , c_branch = ?

                        , c_name_inv = ?
                        , c_address_inv = ?
                        , c_address_inv2 = ?
                        , due_bill = ?

                        , condition_pay = ?
                        , c_comment = ?
                        , i_enable = ?

                        , dc_user_update_id = ?
                        , dc_user_update_cost_id = ?
                        , d_update = ?
                
                    WHERE dc_debtor_id = ?";
            $arrValue = array($data["dc_debtor_type_id"], $data["dc_tax_customer_id"], $data["dc_title_id"]
                            , $data["c_old_code"], $title_name, $data["c_name"]
                            , $data["c_surname"], $data["c_address"], $data["c_telephone"]
                            , $data["c_mobile"], $data["c_fax"], $data["c_website"], $data["c_email"]
                            , $data["c_ref_value"], $data["c_tax_value"], $data["i_branch"], $data["c_branch"]
                            , $data["c_name_inv"], $data["c_address_inv"], $data["c_address_inv2"], $data["due_bill"]
                            , $data["condition_pay"], $data["c_comment"], $data["i_enable"]
                            , $data["dc_user_update_id"], $data["dc_user_update_cost_id"], $data["d_update"]
                            , $data["id"]);
            break;
    case "DELETE" :
        $data["i_delete"]		= DELETE_TRUE;
        $data["dc_user_update_id"]	= $_SESSION["user_id"];
        $data["dc_user_update_cost_id"]	= $_SESSION["dc_cost_id"];
        $data["d_update"]		= date("Y-m-d H:i:s");

        foreach($data as $fld => $value) {
            $arrValue[] = ($value != "")? $value : NULL;
            $addField .= ", {$fld} = ?";
        }
        $arrValue[] = $id;
        $sql	= "UPDATE {$table} 
                    SET i_delete = ?
                    , dc_user_update_id = ?
                    , dc_user_update_cost_id = ?
                    , d_update = ?
                    WHERE dc_debtor_id = ?";
        $arrValue = array(DELETE_TRUE, $data["dc_user_update_id"], $data["dc_user_update_cost_id"], $data["d_update"], $data["id"]);
        break;
    case "check_ref" :
        $con	= null;
        $data	= null;

        if($data["id"] > 0) {
            $con .= " AND dc_debtor_id != ".$data["id"]."";
        }
        $sql	= "SELECT * FROM vw_dc_debtor WHERE i_enable = ? AND c_ref_value = '".$_POST["value"]."' ".$con;
        $stmt = $db->QueryParam($sql, array(STATUS_ENABLE));
        if(sqlsrv_has_rows($stmt)) {
            while($row =$db->Fetch($stmt)) {
                $data[]	= "[".$row["c_code"]."] - ".$row["c_name"];
            }
            $json["data"]	= $data;
            $json["success"]	= false;
        } else {
            $json["data"]	= null;
            $json["success"]	= true;
        }

        $json["data"]		= $data;
        echo json_encode($json, true);
        exit;
    break;
    case "check_tax" :
        $con	= null;
	$data	= null;
	
	if($data["id"] > 0) {
            $con .= " AND dc_debtor_id != ".$data["id"]."";
        }
	$sql	= "SELECT * FROM vw_dc_debtor WHERE i_enable = ? AND c_tax_value = '".$_POST["value"]."' ".$con;
	$stmt = $db->QueryParam($sql, array(STATUS_ENABLE));
	if(sqlsrv_has_rows($stmt)) {
            while($row =$db->Fetch($stmt)) {
                $data[]	= "[".$row["c_code"]."] - ".$row["c_name"];
            }
            $json["data"]	= $data;
            $json["success"]	= false;
	} else {
            $json["data"]	= null;
            $json["success"]	= true;
	}
	
	$json["data"]		= $data;
	echo json_encode($json, true);
	exit;
    break;
}

$db->BeginTran();
$para	= $db->QueryParam($sql, $arrValue);
if($para){
    $db->CommitTran();
    $re = array("success"	=> "success",
                "msg"		=> "success" );
} else {
    $db->RollBackTran();
    $re = array( "msg" => "error" );
}

echo json_encode($re);
function get($a){ return isset($a) && !empty($a)?$a:null; }
?>