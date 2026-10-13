<?php
include("../../conf/config.php");
include("../conf/configDc.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
 
$db = new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$mode		= $_REQUEST["mode"];
$table 		= "dc_expense_group_vsn";
$keyName 	= "dc_expense_group_vsn_id";
 
$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;
$c_code_gen = "DEV";

$stmt2 = true;
$stmt3 = true;

$db->BeginTran();

switch ($mode) {
    case "ADD" : 
        $arrParam = array();
        
		$arrParam[] = $data["c_name"];
		$arrParam[] = $data["dc_bg_type_id"];
        $arrParam[] = $data["c_comment"];
        $arrParam[] = $data["i_enable"];
        
        $arrParam[] = $data["dc_user_create_id"];
        $arrParam[] = $data["dc_user_create_cost_id"];
        $arrParam[] = $data["d_create"];
        
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        
        $arrParam[] = DELETE_FALSE;
		$arrParam[] = $data["c_code_old"];
		$arrParam[] = str_replace(" ","",$data["c_name"]);
		
        $sql = "insert into {$table} (c_name, dc_bg_type_id, c_comment, i_enable
                                        , dc_user_create_id, dc_user_create_cost_id, d_create
                                        , dc_user_update_id, dc_user_update_cost_id, d_update
                                        ,i_delete,c_code_old,c_name_trim)
                                values (?, ?, ?, ?
                                        , ?, ?, ?
                                        , ?, ?, ?
                                        , ?, ?, ?); "; 
        $sql.="SELECT @@IDENTITY as ret_id";
        $stmt = $db->QueryParam($sql, $arrParam);
        if ($stmt)
        {
            $next_result = $db->NextResult($stmt);
            if( $next_result ) {
                $dd_hdr = $db->Fetch($stmt);
                $ret_id = $dd_hdr["ret_id"] ;  
            }

            $code_dc 	= (string) $c_code_gen;
            $arrParam2  = array($code_dc,$data['dc_user_create_id'],$data['dc_user_create_cost_id'],$ret_id);
            $sql2	="EXEC SP_GEN_CODE_DC ?,?,?,?;";
            $stmt2 	= $db->QueryParam($sql2,$arrParam2);	 

            $arr_gen_code = $db->Fetch($stmt2);
            $c_code 	= $arr_gen_code["c_code_gen"] ;
            $ref_id   	= $arr_gen_code["reference_id"] ;

            $stmt3 = false;
            if ($ret_id==$ref_id)
            {
                $sql3 = "UPDATE {$table}
                    SET c_code=?
                    WHERE {$keyName} = ?"; 
                    $arrParam3 = array($c_code,$ret_id);
                    $stmt3 = $db->QueryParam($sql3,$arrParam3);
            }

        } 
		 
    break;
    case "EDIT" :
        $arrParam = array();
        $arrParam[] = $data["c_name"];
        $arrParam[] = $data["dc_bg_type_id"];
        $arrParam[] = $data["c_comment"];
        $arrParam[] = $data["i_enable"];
		$arrParam[] = $data["c_code_old"];
        
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"]; 
        $arrParam[] = str_replace(" ","",$data["c_name"]);
		
        $sql = "UPDATE {$table} 
                    SET  c_name = ?
                    	, dc_bg_type_id = ?
                        , c_comment = ?
                        , i_enable = ? 
						, c_code_old = ?
                        , dc_user_update_id = ?
                        , dc_user_update_cost_id = ?
                        , d_update = ?
						, c_name_trim = ?
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