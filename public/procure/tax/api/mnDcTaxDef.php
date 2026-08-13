<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();
$mode		= $_REQUEST["mode"];
$table 		= "dc_tax_def";
$keyName 	= "dc_tax_def_id";
 
$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;

$fld = array("dc_product_group_id",
			"c_name",
			"dc_tax_id",
			"dc_acc_id",
			"c_comment",
			"i_enable",
			"i_delete",
			"dc_user_create_id",
			"dc_user_create_cost_id",
			"d_create",
			"dc_user_update_id",
			"dc_user_update_cost_id",
			"d_update");

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
	break;
	case "EDIT" :
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
	break;
	case "DELETE" : 
		$sql = "UPDATE {$table} 
					SET i_delete = ?
				WHERE {$keyName} = ?";
		$arrParam = array(DELETE_TRUE, $data["id"]);
	break;
}
 
$db->BeginTran();

$stmt = $db->QueryParam($sql, $arrParam);

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