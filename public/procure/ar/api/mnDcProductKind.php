<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");


// print_r($_REQUEST); exit;

$db = new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$table 		= "dc_product_kind";
$keyName 	= "dc_product_kind_id";
$table_dtl	= "dc_product_kind_dtl";
$c_code_gen = "DPK";
 
$mode = isset($_REQUEST['mode']) && !empty($_REQUEST['mode'])?$_REQUEST['mode']:null;
$id = isset($_REQUEST['id']) && !empty($_REQUEST['id'])?$_REQUEST['id']:null;
 
$data = $util->mnUser($_REQUEST);

$fld =  array("c_code"
		,"c_name"
		,"i_enable"
		,"i_delete"
		,"dc_user_create_id"
		,"dc_user_create_cost_id"
		,"d_create"
		,"dc_user_update_id"
		,"dc_user_update_cost_id"
		,"d_update"
);

$jsonDtl 	= json_decode(@$data["jsonDtl"],true);

if ($mode == "ADD")
{
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
	$db->BeginTran();
	$sql = "INSERT INTO {$table} (".substr($addField, 1).") VALUES (".substr($addValue,1).")";
	$sql.="SELECT @@IDENTITY as add_id";
	$stmt = $db->QueryParam($sql, $arrParam);
	
	$stmt2 = false;
	$stmt3 = false;
	$stmt4 = false;
	if ($stmt)
	{
		$next_result = $db->NextResult($stmt);
		if( $next_result ) {
			$dd_hdr = $db->Fetch($stmt);
			$dc_product_kind_id = $dd_hdr["add_id"] ;
		}
		
		$code_dc 	= (string) $c_code_gen;
		$arrParam2  = array($code_dc,$data['dc_user_create_id'],$data['dc_user_create_cost_id'],$dc_product_kind_id);
		$sql2		="EXEC SP_GEN_CODE_DC ?,?,?,?;";
		$stmt2 		= $db->QueryParam($sql2,$arrParam2);
		
		$arr_gen_code = $db->Fetch($stmt2);
		$c_code 	= $arr_gen_code["c_code_gen"] ;
		$ref_id   	= $arr_gen_code["reference_id"] ;
			
		if ($dc_product_kind_id==$ref_id)
		{
			$sql3 = "UPDATE {$table}
			SET c_code=?
			WHERE {$keyName} = ?";
			$arrParam3 = array($c_code,$dc_product_kind_id);
			$stmt3 = $db->QueryParam($sql3,$arrParam3);
		}
	
		$stmt4 = fn_save_dtl($db,$dc_product_kind_id,$jsonDtl,$table_dtl);
		
	}
	
	if ($stmt && $stmt2 && $stmt3 && $stmt4)
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
}
else if ($mode == "EDIT")
{
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
	$db->BeginTran();
	$stmt = $db->QueryParam($sql, $arrParam);
	$stmt2 = fn_save_dtl($db,$data["id"],$jsonDtl,$table_dtl);
	if ($stmt && $stmt2)
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
}
else if($mode == "DELETE")
{
	
	$dc_product_kind_id = $data["id"];
	$stmtHdr = $db->QueryParam("UPDATE {$table} SET i_delete = ? WHERE $keyName = ?;",array(DELETE_TRUE,$dc_product_kind_id));
	$stmtDtl = $db->QueryParam("DELETE FROM {$table_dtl} WHERE $keyName = ?;",array($dc_product_kind_id));
	
	if ($stmtHdr && $stmtDtl)
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
}

function fn_save_dtl($db,$dc_product_kind_id,$data_dtl,$table_dtl)
{
	
	$check_detail = true;
	if (  ($dc_product_kind_id>0) && (is_array($data_dtl) && count($data_dtl)>0 ))
	{
		$check_detail = false;
		$arrParamDTL = array();
		$arrParamDTL[] = $dc_product_kind_id;
		$addValueDTL = "";
	
		foreach($data_dtl as $key => $jObj)
		{
			$addValueDTL 	.= ",(?, ?, ?, ?, ?, ?, ?, ?, ?)";
			$arrParamDTL[] = $dc_product_kind_id;
			$arrParamDTL[] = $jObj["id"];
			$arrParamDTL[] = STATUS_ENABLE;
			$arrParamDTL[] = $_SESSION["user_id"];
			$arrParamDTL[] = $_SESSION["dc_cost_id"];
			$arrParamDTL[] = date("Y-m-d H:i:s");
			$arrParamDTL[] = $_SESSION["user_id"];
			$arrParamDTL[] = $_SESSION["dc_cost_id"];
			$arrParamDTL[] = date("Y-m-d H:i:s");
		}

		$addValueDTL	= substr($addValueDTL,1);

		if ($addValueDTL != "")
		{
			$sql_dtl = "DELETE FROM {$table_dtl} WHERE dc_product_kind_id = ?;";
			$sql_dtl .= "INSERT INTO {$table_dtl} (dc_product_kind_id,
										dc_product_type_id,
										i_enable,
										dc_user_create_id,
										dc_user_create_cost_id,
										d_create,
										dc_user_update_id,
										dc_user_update_cost_id,
										d_update) VALUES ".$addValueDTL.";";
			$stmt2 = $db->QueryParam($sql_dtl, $arrParamDTL);

			if ($stmt2)
				$check_detail = true;
		}
	}
	return $check_detail;
}


?>