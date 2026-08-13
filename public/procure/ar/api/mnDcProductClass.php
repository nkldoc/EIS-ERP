<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$mode		= $_REQUEST["mode"];
$table 		= "dc_product_class";
$keyName 	= "dc_product_class_id";
 
$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;
$c_code_mu = "DPC";

$fld = array("c_code",
			"c_ref_doc",
			"c_name",
			"i_enable",
			"i_delete",
			"dc_user_create_id",
			"dc_user_create_cost_id",
			"d_create",
			"dc_user_update_id",
			"dc_user_update_cost_id",
			"d_update");
$stmt2 = false;
$stmt3 = false;
$db->BeginTran();
switch ($mode) {
	case "ADD" : 
		$arrParam = array();		
		$addField = "";
		$addValue = "";

		foreach($fld as $value)
		{
			if (!empty($data[$value]))
			{
				$addField .= ", {$value}";
				$addValue .= ", ?";
				$arrParam[] = $data[$value];
			}
		}
 
		$sql = "INSERT INTO {$table} (".substr($addField, 1).") VALUES (".substr($addValue,1).")"; 
		$sql.="SELECT @@IDENTITY as ret_id";
		$stmt = $db->QueryParam($sql, $arrParam);
		if ($stmt)
		{
			$next_result = $db->NextResult($stmt);
			if( $next_result ) {
				$dd_hdr = $db->Fetch($stmt);
				$ret_id = $dd_hdr["ret_id"] ;  
			}
			 
			$code_dc 	= (string) $c_code_mu;
			$arrParam2  = array($code_dc,$data['dc_user_create_id'],$data['dc_user_create_cost_id'],$ret_id);
			$sql2		="EXEC SP_GEN_CODE_DC ?,?,?,?;";
			$stmt2 		= $db->QueryParam($sql2,$arrParam2);	 
			 
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
		$stmt2 = true;	$stmt3 = true;
		$arrParam = array();
		$upField = "";
		foreach($fld as $value)
		{
			if (!empty($data[$value]))
			{
				$upField .= ", {$value} = ?";
				$arrParam[] = $data[$value];
			}
		}
		$sql = "UPDATE {$table} 
					SET ".substr($upField, 1)."
				WHERE {$keyName} = ?";
		
		$arrParam[] = $data["id"];
		$stmt = $db->QueryParam($sql, $arrParam);
	break;
	case "DELETE" : 
		$stmt2 = true;	$stmt3 = true;
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
	$re = array("reval"=>0,"success"=>"Success","msg"=>"commit");
}
else
{
	$db->RollBackTran();
	$re = array("reval"=>1,"success"=>"Error","msg"=>"check statement : {$sql}");
}
 
echo json_encode($re);
exit;

?>