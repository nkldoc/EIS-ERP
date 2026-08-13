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
$table      = "tax_pr_rate_hdr";
$keyName    = "tax_pr_rate_hdr_id";
 
$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;

$hdr_id = 0;

$stmt2 = true;
$stmt3 = true;

$db->BeginTran();

switch ($mode) {
    case "ADD" :
        if ($data["d_start"] != ""){
            $d_start = $date->bc_to_ad($data["d_start"]);
        } else {
            $d_start = NULL;
        }
        
        if ($data["d_finish"] != ""){
            $d_finish = $date->bc_to_ad($data["d_finish"]);
        } else {
            $d_finish = NULL;
        }
        $arrParam = array();
        $arrParam[] = $data["c_code"];
        $arrParam[] = $data["c_name"];
        $arrParam[] = $data["c_comment"];
        
        $arrParam[] = $d_start;
        $arrParam[] = $d_finish;
        $arrParam[] = $data["i_enable"];
        
        $arrParam[] = $data["dc_user_create_id"];
        $arrParam[] = $data["dc_user_create_cost_id"];
        $arrParam[] = $data["d_create"];
        
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        
        $arrParam[] = DELETE_FALSE;

        $sql = "insert into {$table} (c_code, c_name, c_comment
                                        , d_start, d_finish, i_enable
                                        , dc_user_create_id, dc_user_create_cost_id, d_create
                                        , dc_user_update_id, dc_user_update_cost_id, d_update
                                        ,i_delete)
                                values (?, ?, ?
                                        , ?, ?, ?
                                        , ?, ?, ?
                                        , ?, ?, ?
                                        , ?); "; 
        
        $sql.="SELECT @@IDENTITY as ret_id";
        
        //print_R($arrParam);exit;
        $stmt = $db->QueryParam($sql, $arrParam);
        if ($stmt)
        {
            $next_result = $db->NextResult($stmt);
            if( $next_result ) {
                $dd_hdr = $db->Fetch($stmt);
                $hdr_id = $dd_hdr["ret_id"] ;
            }
            
            $code_dc 	= "RAT";
            $arrParam2  = array($code_dc,1,1,$hdr_id);
            $sql2	= "EXEC SP_GEN_CODE_DC ?,?,?,?;";
            $stmt2 	= $db->QueryParam($sql2,$arrParam2);

            $arr_gen_code = $db->Fetch($stmt2);
            $c_code 	= $arr_gen_code["c_code_gen"] ;
            $ref_id   	= $arr_gen_code["reference_id"] ;

            $stmt3 = false;
            if ($hdr_id==$ref_id)
            {
                $sql3 = "UPDATE $table
                        SET c_code=?
                        WHERE {$keyName} = ?";
                $arrParam3 = array($c_code,$hdr_id);
                $stmt3 = $db->QueryParam($sql3,$arrParam3);
            }
        } 
    break;
    case "EDIT" :
        if ($data["d_start"] != ""){
            $d_start = $date->bc_to_ad ($data["d_start"]);
        } else {
            $d_start = NULL;
        }
        
        if ($data["d_finish"] != ""){
            $d_finish = $date->bc_to_ad ($data["d_finish"]);
        } else {
            $d_finish = NULL;
        }
        $arrParam = array();
        $arrParam[] = $data["c_code"];
        $arrParam[] = $data["c_name"];
        $arrParam[] = $data["c_comment"];
        
        $arrParam[] = $d_start;
        $arrParam[] = $d_finish;
        $arrParam[] = $data["i_enable"];
        
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        
        $sql = "UPDATE {$table} 
                    SET c_code = ?
                        , c_name = ?
                        , c_comment = ?
                        
                        , d_start = ?
                        , d_finish = ?
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
    case "ADD_DTL" :
        $data = $util->mnUser($_REQUEST, "ADD");
        $arrParam = array();
        $arrParam[] = $data["tax_pr_rate_hdr_id"];
        $arrParam[] = $data["f_income_min"];
        $arrParam[] = $data["f_income_max"];
        
        $arrParam[] = $data["f_amt_max"];
        $arrParam[] = $data["i_percent"];
        $arrParam[] = $data["f_amt_pile"];
        
        $arrParam[] = $data["f_pile"];
        $arrParam[] = $data["c_comment"];
        
        $arrParam[] = $data["dc_user_create_id"];
        $arrParam[] = $data["dc_user_create_cost_id"];
        $arrParam[] = $data["d_create"];
        
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        
        $sql = "insert into tax_pr_rate_dtl (tax_pr_rate_hdr_id, f_income_min, f_income_max
                                            , f_amt_max, i_percent, f_amt_pile
                                            , f_pile, c_comment
                                            , dc_user_create_id, dc_user_create_cost_id, d_create
                                            , dc_user_update_id, dc_user_update_cost_id, d_update)
                                    values (?, ?, ?
                                            , ?, ?, ?
                                            , ?, ?
                                            , ?, ?, ?
                                            , ?, ?, ?)";
        $stmt = $db->QueryParam($sql, $arrParam);
    break;
    case "EDIT_DTL" :
        $arrParam = array();
        $arrParam[] = $data["tax_pr_rate_hdr_id"];
        $arrParam[] = $data["f_income_min"];
        $arrParam[] = $data["f_income_max"];
        
        $arrParam[] = $data["f_amt_max"];
        $arrParam[] = $data["i_percent"];
        $arrParam[] = $data["f_amt_pile"];
        
        $arrParam[] = $data["f_pile"];
        $arrParam[] = $data["c_comment"];
        
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        
        $sql = "UPDATE tax_pr_rate_dtl
                    SET tax_pr_rate_hdr_id = ?
                        , f_income_min = ?
                        , f_income_max = ?
                        
                        , f_amt_max = ?
                        , i_percent = ?
                        , f_amt_pile = ?
                        
                        , f_pile = ?
                        , c_comment = ?

                        , dc_user_update_id = ?
                        , dc_user_update_cost_id = ?
                        , d_update = ?
                WHERE tax_pr_rate_dtl_id = ?";

        $arrParam[] = $data["id"];
        $stmt = $db->QueryParam($sql, $arrParam);
    break;
    case "DELETE_DTL" :
        $sql = "DELETE FROM tax_pr_rate_dtl WHERE tax_pr_rate_dtl_id = ?";
        $stmt = $db->QueryParam($sql, array($data["id"]));
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