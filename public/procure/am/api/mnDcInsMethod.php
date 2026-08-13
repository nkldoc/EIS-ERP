<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$mode		= $_REQUEST["mode"];
$table 		= "dc_ins_method";
$keyName 	= "dc_ins_method_id";
 
$data = $util->mnUser($_REQUEST);

$fld = array("c_code",
			"c_name",
			"c_comment",
			"i_enable",
			"dc_user_create_id",
			"dc_user_create_cost_id",
			"d_create",
			"dc_user_update_id",
			"dc_user_update_cost_id",
			"d_update",
                        "i_delete");
$stmt2 = false;
$stmt3 = false;
$db->BeginTran();
switch ($mode) {
    case "ADD" : 
        $arrParam = array();		
        $addField = "";
        $addValue = "";
        $data["i_delete"] = DELETE_FALSE;

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
        $stmt = $db->QueryParam($sql, $arrParam);
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