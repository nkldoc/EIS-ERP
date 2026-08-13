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
$table 		= "dc_expense_acc_vsn";
$keyName 	= "dc_expense_acc_vsn_id";
 
$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;
$c_code_gen = "DEA";

$stmt2 = true;
$stmt3 = true; 

$db->BeginTran();

switch ($mode) {
    case "ADD" : 
        $arrParam = array();
        $arrParam[] = $data["c_name"];
        $arrParam[] = $data["dc_expense_vsn_id"];
        $arrParam[] = $data["dc_acc_id"];
        
        $arrParam[] = $data["i_show_gl"];
		$arrParam[] = $data["c_map_code"];
        $arrParam[] = $data["c_comment"];
        $arrParam[] = $data["i_enable"];
        
        $arrParam[] = $data["dc_user_create_id"];
        $arrParam[] = $data["dc_user_create_cost_id"];
        $arrParam[] = $data["d_create"];
        
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        
        $arrParam[] = DELETE_FALSE;
		$arrParam[] = str_replace(" ","",$data["c_name"]);
		$arrParam[] = $data["dc_acc_id"];
		// ไม่ได้ใช้งาน dc_acc_id_overlap ณ ตอนนี้
		// $arrParam[] = ($data["dc_acc_id_overlap"]=="" || $data["dc_acc_id_overlap"]=="0") ? $data["dc_acc_id"] : $data["dc_acc_id_overlap"];

		
        $sql = "insert into {$table} (c_name, dc_expense_vsn_id, dc_acc_id
                                        , i_show_gl, c_map_code, c_comment, i_enable
                                        , dc_user_create_id, dc_user_create_cost_id, d_create
                                        , dc_user_update_id, dc_user_update_cost_id, d_update
                                        ,i_delete,c_name_trim,dc_acc_id_overlap)
                                values (? ,? , ?
                                          , ?, ?, ?, ?
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
        $arrParam[] = $data["dc_acc_id"];
        $arrParam[] = $data["dc_expense_vsn_id"];
        
        $arrParam[] = $data["i_show_gl"];
		$arrParam[] = $data["c_map_code"];
        $arrParam[] = $data["c_comment"];
        $arrParam[] = $data["i_enable"];
        
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"]; 
		$arrParam[] = str_replace(" ","",$data["c_name"]);
		$arrParam[] = $data["dc_acc_id"];
		// ไม่ได้ใช้งาน dc_acc_id_overlap ณ ตอนนี้
// 		$arrParam[] = $data["dc_acc_id_overlap"];
        
        $sql = "UPDATE {$table} 
                    SET  c_name = ? 
                        , dc_acc_id = ?
                        , dc_expense_vsn_id = ? 
                        , i_show_gl = ?
						, c_map_code = ?
                        , c_comment = ?
                        , i_enable = ? 
                        , dc_user_update_id = ?
                        , dc_user_update_cost_id = ?
                        , d_update = ?
						, c_name_trim = ?
						, dc_acc_id_overlap = ?
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