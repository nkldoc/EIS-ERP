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
$table 		= "dc_pr_reduce";
$keyName 	= "dc_pr_reduce_id";
 
$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;
$i_standard = isset($_REQUEST['i_standard']) && $_REQUEST['i_standard']>0?$_REQUEST['i_standard']:'';
$c_code_gen = "RED";
switch($i_standard) {
    case 1:
        $data["f_amount"] 	= @(int)$_REQUEST['inp_std11'];
        $data["f_amount2"]	= NULL; break;
    case 2:
        $data["f_amount"] 	= @(int)$_REQUEST['inp_std21'];
        $data["f_amount2"]	= NULL; break;
    case 3:
        $data["f_amount"]	= @(int)$_REQUEST['inp_std31']; 
        $data["f_amount2"]	= @(int)$_REQUEST['inp_std32']; break;
    case 4:
        $data["f_amount"]	= @(int)$_REQUEST['inp_std41']; 
        $data["f_amount2"]	= @(int)$_REQUEST['inp_std42']; break;
    case 5:
        $data["f_amount"]	= @(int)$_REQUEST['inp_std51']; 
        $data["f_amount2"]	= @(int)$_REQUEST['inp_std52']; break;
    case 6:
        $data["f_amount"]	= @(int)$_REQUEST['inp_std61']; 
        $data["f_amount2"]	= @(int)$_REQUEST['inp_std62']; break;
    case 7:
        $data["f_amount"]	= @(int)$_REQUEST['inp_std71'];
        $data["f_amount2"]	= NULL; break;
}

$stmt2 = true;
$stmt3 = true;

$db->BeginTran();

switch ($mode) {
    case "ADD" : 
        $arrParam = array();
        $arrParam[] = $data["c_name"];
        $arrParam[] = $data["c_comment"];
        $arrParam[] = $data["f_amount"];
        
        $arrParam[] = $data["f_amount2"];
        $arrParam[] = $data["i_reduce_type"];
        $arrParam[] = $data["i_is_private"];
        
        $arrParam[] = $data["i_standard"];
        $arrParam[] = $data["i_enable"];
        
        $arrParam[] = $data["dc_user_create_id"];
        $arrParam[] = $data["dc_user_create_cost_id"];
        $arrParam[] = $data["d_create"];
        
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        
        $arrParam[] = DELETE_FALSE;
		
        $sql = "insert into {$table} (c_name, c_comment, f_amount
                                        , f_amount2, i_reduce_type, i_is_private
                                        , i_standard, i_enable
                                        , dc_user_create_id, dc_user_create_cost_id, d_create
                                        , dc_user_update_id, dc_user_update_cost_id, d_update
                                        ,i_delete)
                                values (?, ?, ?
                                        , ?, ?, ?
                                        , ?, ?
                                        , ?, ?, ?
                                        , ?, ?, ?
                                        , ?); "; 
        
        $sql.="SELECT @@IDENTITY as id_psReduce";
        //echo $sql;print_r($arrParam);exit;
        $stmt = $db->QueryParam($sql, $arrParam);
        if ($stmt)
        {
            $next_result = $db->NextResult($stmt);
            if( $next_result ) {
                $dd_hdr = $db->Fetch($stmt);
                $reduce_id = $dd_hdr["id_psReduce"];
            }

            $code_gen 	= (string) $c_code_gen;
            $arrParam2  = array($code_gen,$date->getYearMonth(),$data['dc_user_create_id'],$data['dc_user_create_cost_id'],$reduce_id);
            $sql2	= "EXEC SP_GEN_CODE ?,?,?,?,?;";
            $stmt2 	= $db->QueryParam($sql2,$arrParam2);

            $arr_gen_code = $db->Fetch($stmt2);
            $c_code 	= $arr_gen_code["c_code_gen"] ;
            $ref_id   	= $arr_gen_code["reference_id"] ;

            $stmt3 = false;
            if ($reduce_id==$ref_id)
            {
                $sql3 = "UPDATE {$table}
                    SET c_code=?
                    WHERE {$keyName} = ?";
                $arrParam3 = array($c_code,$reduce_id);
                $stmt3 = $db->QueryParam($sql3,$arrParam3);
            }
        }	 
    break;
    case "EDIT" :
        $arrParam = array();
        $arrParam[] = $data["c_name"];
        $arrParam[] = $data["c_comment"];
        $arrParam[] = $data["f_amount"];
        
        $arrParam[] = $data["f_amount2"];
        $arrParam[] = $data["i_reduce_type"];
        $arrParam[] = $data["i_is_private"];
        
        $arrParam[] = $data["i_standard"];
        $arrParam[] = $data["i_enable"];
        
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        
        $sql = "UPDATE {$table} 
                    SET  c_name = ?
                        , c_comment = ?
                        , f_amount = ?
                        , f_amount2 = ?
                        , i_reduce_type = ?
                        , i_is_private = ?
                        , i_standard = ?
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