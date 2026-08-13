<?php
include("../../conf/config.php");
include("../conf/configTax.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

//print_r($_REQUEST);exit;
$db = new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$mode		= $_REQUEST["mode"];
$table 		= "dc_vat";
$keyName 	= "dc_vat_id";

$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;
$data["dc_tax_ref_id"] = (@$data["i_show"] == TAX_SHOW_NONE_ISPROGRESS)? $data["dc_tax_ref_id"] : 0;

$stmt2 = true;
$stmt3 = true;

$db->BeginTran();

switch ($mode) {
    case "ADD" : 
        $arrParam = array();
        $arrParam[] = $data["dc_acc_id"];
        $arrParam[] = $data["dc_acc_income_id"];
        $arrParam[] = $data["c_code"];
        
        $arrParam[] = $data["c_name"];
        $arrParam[] = $data["c_comment"];
        $arrParam[] = $data["f_vat_rate"];
        
        $arrParam[] = $data["i_cal"];
        $arrParam[] = $data["i_enable"];
        
        $arrParam[] = $data["dc_user_create_id"];
        $arrParam[] = $data["dc_user_create_cost_id"];
        $arrParam[] = $data["d_create"];
        
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        
        $arrParam[] = DELETE_FALSE;
		
        $sql = "insert into {$table} (dc_acc_id, dc_acc_income_id, c_code
                                        , c_name, c_comment, f_vat_rate
                                        , i_cal, i_enable
                                        , dc_user_create_id, dc_user_create_cost_id, d_create
                                        , dc_user_update_id, dc_user_update_cost_id, d_update
                                        ,i_delete)
                                values (?, ?, ?
                                        , ?, ?, ?
                                        , ?, ?
                                        , ?, ?, ?
                                        , ?, ?, ?
                                        , ?); "; 
        
        //echo $sql; print_r($arrParam);exit;
        $stmt = $db->QueryParam($sql, $arrParam);	 
    break;
    case "EDIT" :
        $arrParam[] = $data["dc_acc_id"];
        $arrParam[] = $data["dc_acc_income_id"];
        $arrParam[] = $data["c_code"];
        
        $arrParam[] = $data["c_name"];
        $arrParam[] = $data["c_comment"];
        $arrParam[] = $data["f_vat_rate"];
        
        $arrParam[] = $data["i_cal"];
        $arrParam[] = $data["i_enable"];
        
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        
        $sql = "UPDATE {$table} 
                    SET  dc_acc_id = ?
                        , dc_acc_income_id = ?
                        , c_code = ?
                        
                        , c_name = ?
                        , c_comment = ?
                        , f_vat_rate = ?
                        
                        , i_cal = ?
                        , i_enable = ?

                        , dc_user_update_id = ?
                        , dc_user_update_cost_id = ?
                        , d_update = ?
                WHERE {$keyName} = ?";

        $arrParam[] = $data["id"];
        $stmt = $db->QueryParam($sql, $arrParam);
    break;
    case "DELETE" :
            $sql = "UPDATE {$table} 
                        SET i_delete = ?
                    WHERE {$keyName} = ?";
            $arrParam = array(DELETE_TRUE, $data["id"]);
            $stmt = $db->QueryParam($sql, $arrParam);
    break;
}
 
if ($stmt)
{
    $db->CommitTran();
    $re = array("reval"=>0,"success"=>"Success","msg"=>"บันทีกเรียบร้อยแล้ว");
}
else
{
    $db->RollBackTran();
    $re = array("reval"=>1,"success"=>"Error","msg"=>"check statement : {$sql}");
}
 
echo json_encode($re);
exit; 
?>