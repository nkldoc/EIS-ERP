<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../conf/config_am.php");
$db = new DatabaseServer();

$table	= "vw_dc_asset_type";

$mode	= @$_REQUEST["mode"]; 
$ref_id = @$_REQUEST["ref_id"];

if (!get($mode))	{   $mode 	= "ListTree"; }
if (!get($ref_id))	{   $ref_id 	= 0; }

switch ($mode)
{
    case "ListTree" : // สร้าง Json สำหรับแสดง Tree หน่วยงาน
        $sql = "SELECT dc_asset_type_id
                    , c_code+' '+c_name as c_name
                    , c_code_tree 
                FROM vw_dc_asset_type 
                WHERE left(c_code,2) != ?
                ORDER BY c_code_tree;";
        $stmt = $db->QueryParam($sql, array(CODE_INVENNTORY));
        $arr = array();
        while ($data = $db->Fetch($stmt))
        {
            $c_code = $data["c_code_tree"];
            for ($i=1; $i <= (strlen($data["c_code_tree"])/2); $i++)
            {
                $chk_code = substr($c_code, -2);

                if ($chk_code == "00")
                    $c_code = substr($c_code, 0, (strlen($c_code)-2));
                else
                    continue;
            }

            for ($i=1; $i <= (strlen($c_code)/2); $i++)
            {
                $parent_index = substr($c_code, 0, (($i-1)*2));
                if ($parent_index == "")
                    $parent_index = "0";
                $index = substr($c_code, 0, (($i)*2));
                if ($i == (strlen($c_code)/2))
                {
                    $arr[$parent_index][$index] = array("id"=>$data["dc_asset_type_id"]
                                                        , "text"=>$data["c_name"]);
                }
            }
        }
        // Create Array For JSON
        $arrJson = arrForJSON($arr, 0);
        echo json_encode($arrJson);
    break;
    case "Edit" :
    case "Del" :
            $sql = "select a.c_code
                        , a.c_name
                        , a.asset_type
                        , a.dc_acc_conf_recv_id
                        , case when isnull(a.dc_acc_conf_recv_id,0) > 0 then (select c_code+' '+c_name from dc_acc where dc_acc_id = a.dc_acc_conf_recv_id) else '' end  dc_acc_conf_recv_name
                        , a.dc_acc_dr_id
                        , case when isnull(a.dc_acc_dr_id,0) > 0 then (select c_code+' '+c_name from dc_acc where dc_acc_id = a.dc_acc_dr_id) else '' end  dc_acc_dr_name
                        , a.dc_acc_cr_id
                        , case when isnull(a.dc_acc_cr_id,0) > 0 then (select c_code+' '+c_name from dc_acc where dc_acc_id = a.dc_acc_cr_id) else '' end  dc_acc_cr_name
                        , a.dc_acc_recv_id
                        , case when isnull(a.dc_acc_recv_id,0) > 0 then (select c_code+' '+c_name from dc_acc where dc_acc_id = a.dc_acc_recv_id) else '' end  dc_acc_recv_name
                        , case when a.i_is_last = 1 then a.i_is_last else 2 end as i_is_last
                        , a.f_unit_cost
                        , a.dc_unit_type_id
                        , a.i_enable
                    from {$table} a
                    where a.dc_asset_type_id = ?";
            $arrData = $db->GetDataBySQL($sql, array($ref_id));
            echo json_encode($arrData);
    break;
    case "getCode" :
        $sql = "SELECT c_code_tree, i_level FROM {$table} 
                WHERE dc_asset_type_id = ?";
        $stmt = $db->QueryParam($sql, array(array($ref_id)));
        $arrData = array();
        while ($data = $db->Fetch($stmt))
        {
            $c_code = $data["c_code_tree"];
            for ($i=1; $i <= (strlen($data["c_code_tree"])/2); $i++)
            {
                $chk_code = substr($c_code, -2);

                if ($chk_code == "00")
                    $c_code = substr($c_code, 0, (strlen($c_code)-2));
                else
                    continue;
            }
            $arrData["c_code"] = $c_code;
            $arrData["i_level"] = $data['i_level'];
        }
        echo json_encode($arrData);
    break;
}
exit;

function get($a){ return isset($a) && !empty($a)?$a:null; }

function arrForJSON($arr, $index){
	$arrReturn = array();
	foreach($arr[$index] as $key => $value)
	{
		if (isset($arr) && array_key_exists($key,$arr))
		{
			$arrChilden = arrForJSON($arr, $key);
			$arrReturn[] = array("id"=>$value["id"]
					, "text"=>$value["text"]
					, "leaf"=>false
					, "children"=>$arrChilden);
		}
		else 
		{
			$arrReturn[] = array("id"=>$value["id"]
					, "text"=>$value["text"]
					, "leaf"=>true);
		}
	}
	return $arrReturn;
}
?>