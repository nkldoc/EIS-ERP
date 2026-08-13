<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../conf/config_am.php");

//print_r($_REQUEST);exit;
$db = new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$mode		= $_REQUEST["mode"];
$table 		= "dc_ins_town_hdr";
$tableDtl 	= "dc_ins_town_dtl";
$keyName 	= "dc_ins_town_hdr_id";
$keyDtlName	= "dc_ins_town_dtl_id";
$code_gen	= "BT";
 
$data = $util->mnUser($_REQUEST);
$hdr_id = @$data["id"];

/*dc_inv_id
dc_cost_id
dc_building_id
c_code
c_name
d_doc_date
dc_cost_old_id
*/
$fld = array("dc_inv_id",
			"dc_cost_id",
			"dc_building_id",
			"c_code",
			"c_name",
			"d_doc_date",
			"dc_cost_old_id",
			"c_comment",
			"i_enable",
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
        $sql.="SELECT @@IDENTITY as hdr_id";
        $stmt = $db->QueryParam($sql, $arrParam);
        if ($stmt)
        {
            $next_result = $db->NextResult($stmt);
            if( $next_result ) {
                    $dd_hdr = $db->Fetch($stmt);
                    $hdr_id = $dd_hdr["hdr_id"] ;
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
        $sql = "DELETE FROM {$table} WHERE {$keyName} = ?";
        $arrParam = array($data["id"]);
        $stmt = $db->QueryParam($sql, $arrParam);

        $sql = "DELETE FROM {$tableDtl} WHERE {$keyName} = ?";
        $arrParam = array($data["id"]);
        $stmt2 = $db->QueryParam($sql, $arrParam);
    break;
    case "SELECT_COST" :
        $data = $util->mnUser($_REQUEST, "ADD");
        $arrCost = @$_REQUEST["chk"];
        $hdr_id = $_REQUEST["dc_ins_town_hdr_id"];

        if (is_array($arrCost))
        {
            foreach($arrCost as $dc_cost_id)
            {
                $sql = "declare @dc_ins_town_hdr_id as bigint;
                        declare @dc_cost_id as bigint;

                        set @dc_ins_town_hdr_id = ?;
                        set @dc_cost_id = ?;

                        insert into dc_ins_town_dtl(dc_ins_town_hdr_id, dc_cost_id, c_code, c_name)
                        select @dc_ins_town_hdr_id, dc_cost_id, c_code, c_name 
                        from dc_cost
                        where dc_cost_id = @dc_cost_id;";
                $stmt = $db->QueryParam($sql, array($hdr_id, $dc_cost_id)); 
            }// end foreach
        }else{
            $stmt = true;
        }
    break;
    case "DELETE_DTL" :
        $stmt2 = true;	$stmt3 = true;
        $arrDtl = @$_REQUEST["chk_dtl"];
        if (is_array($arrDtl))
        {
            foreach($arrDtl as $dtl_id)
            {
                $sql = "DELETE FROM {$tableDtl} WHERE {$keyDtlName} = ?";
                $arrParam = array($dtl_id);
                $stmt = $db->QueryParam($sql, $arrParam);
            }
        }
    break;
}

if ($stmt)
{
	$db->CommitTran();
	$re = array("reval"=>0,"success"=>"Success","msg"=>"commit","hdr_id"=>$hdr_id);
}
else
{
	$db->RollBackTran();
	$re = array("reval"=>1,"success"=>"Error","msg"=>"check statement : {$sql}");
}
 
echo json_encode($re);
exit;

?>