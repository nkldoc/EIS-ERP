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

$mode       = $_REQUEST["mode"];
$table      = "dc_section_tax";
$keyName    = "dc_section_tax_id";
 
$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;

$hdr_id = 0;

$stmt2 = true;
$stmt3 = true;

$db->BeginTran();

switch ($mode) {
    case "ADD" :
        $arrParam = array();
        $arrParam[] = $data["c_code"];
        $arrParam[] = $data["c_name"];
        $arrParam[] = $data["c_comment"];
        
        $arrParam[] = $data["i_rank_bank"];
        $arrParam[] = $data["i_type_tax"];
        $arrParam[] = $data["i_enable"];
        
        $arrParam[] = $data["dc_user_create_id"];
        $arrParam[] = $data["dc_user_create_cost_id"];
        $arrParam[] = $data["d_create"];
        
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        
        $arrParam[] = DELETE_FALSE;
		
        $sql = "insert into {$table} (c_code, c_name, c_comment
                                        , i_rank_bank, i_type_tax, i_enable
                                        , dc_user_create_id, dc_user_create_cost_id, d_create
                                        , dc_user_update_id, dc_user_update_cost_id, d_update
                                        ,i_delete)
                                values (?, ?, ?
                                        , ?, ?, ?
                                        , ?, ?, ?
                                        , ?, ?, ?
                                        , ?); "; 
        
        $sql.="SELECT @@IDENTITY as ret_id";
        
        $stmt = $db->QueryParam($sql, $arrParam);
        if ($stmt)
        {
            $next_result = $db->NextResult($stmt);
            if( $next_result ) {
                $dd_hdr = $db->Fetch($stmt);
                $hdr_id = $dd_hdr["ret_id"] ;
            }
        } 
    break;
    case "EDIT" :
        $arrParam[] = $data["c_code"];
        $arrParam[] = $data["c_name"];
        $arrParam[] = $data["c_comment"];
        
        $arrParam[] = $data["i_rank_bank"];
        $arrParam[] = $data["i_type_tax"];
        $arrParam[] = $data["i_enable"];
        
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        
        $sql = "UPDATE {$table} 
                    SET c_code = ?
                        , c_name = ?
                        , c_comment = ?
                        
                        , i_rank_bank = ?
                        , i_type_tax = ?
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
    case "ADD_METHOD" :
        $arrParam = array();
        $arrParam[] = $data["dc_section_tax_id"];
        $arrParam[] = $data["c_code"];
        $arrParam[] = $data["c_name"];
        $arrParam[] = STATUS_ENABLE;
        $sql = "insert into dc_tax_method (dc_section_tax_id, c_code, c_name, i_enable )
                values (?, ?, ?, ?);";
        $stmt = $db->QueryParam($sql, $arrParam);
    break;
    case "EDIT_METHOD" :
        $arrParam = array();
        $arrParam[] = $data["dc_section_tax_id"];
        $arrParam[] = $data["c_code"];
        $arrParam[] = $data["c_name"];
        
        $sql = "UPDATE dc_tax_method
                SET dc_section_tax_id = ?
                    , c_code = ?
                    , c_name = ?
                WHERE dc_tax_method_id = ?";
        $arrParam[] = $data["id"];
        $stmt = $db->QueryParam($sql, $arrParam);
    break;
    case "DELETE_METHOD" :
        $sql = "delete from dc_tax_method where dc_tax_method_id = ?";
        $stmt = $db->QueryParam($sql, array($data["id"]));
    break;
    case "EDIT_SUB" :
        $arrParam = array();
        $arrParam[] = $data["dc_section_tax_id"];
        $arrParam[] = $data["dc_tax_customer_id"];
        
        $arrParam[] = $data["dc_section_tax_id"];
        $arrParam[] = $data["dc_tax_customer_id"];
        $arrParam[] = $data["dc_tax_id"];
        $arrParam[] = $data["dc_tax_income_mth_id"];
        
        $sql = "delete from dc_section_tax_sub where dc_section_tax_id = ? AND dc_tax_customer_id = ?; 
                insert into dc_section_tax_sub (dc_section_tax_id, dc_tax_customer_id, dc_tax_id, dc_tax_income_mth_id)
                values (?, ?, ?, ?);
            ";
        $stmt = $db->QueryParam($sql, $arrParam);
    break;
}
 
if ($stmt)
{
    $db->CommitTran();
    $re = array("reval"=>0,"success"=>"Success","msg"=>"บันทีกเรียบร้อยแล้ว","hdr_id"=>$hdr_id);
}
else
{
    $db->RollBackTran();
    $re = array("reval"=>1,"success"=>"Error","msg"=>"check statement : {$sql}");
}
 
echo json_encode($re);
exit; 
?>