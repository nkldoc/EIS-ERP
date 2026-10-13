<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
$db = new DatabaseServer();

$table	= "vw_dc_cost";

$mode	= @$_REQUEST["mode"]; 
$ref_id = @$_REQUEST["ref_id"];

if (!get($mode))    { $mode = "ListTree"; }
if (!get($ref_id))  { $ref_id = 0; }

switch ($mode)
{
    case "ListTree" : // สร้าง Json สำหรับแสดง Tree หน่วยงาน
            $sql = "SELECT dc_cost_id, c_code+' '+c_name as c_name, c_code_tree FROM {$table} 
                    WHERE 1 = ? 
                    ORDER BY c_code_tree";
            $stmt = $db->QueryParam($sql, array(1));
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
                                $arr[$parent_index][$index] = array("id"=>$data["dc_cost_id"]
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
            $sql = "select a.dc_cost_id, a.dc_area_id, a.dc_cost_acc_id
                        , a.c_code, a.c_name, a.c_address
                        , a.c_comment, a.i_enable, a.i_gl_department
                        , case when b.i_branch = 1 then 'สาขา' else 'สำนักงานใหญ่' end as c_type_region
                    from vw_dc_cost a inner join vw_dc_area b on a.dc_area_id = b.dc_area_id
                    where a.dc_cost_id = ?";
            $arrData = $db->GetDataBySQL($sql, array($ref_id));
            echo json_encode($arrData);
    break;
    case "getCode" :
            $sql = "select c_code_tree from {$table} where dc_cost_id = ?";
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
            }
            echo json_encode($arrData);
    break;
    case "dataArea" :
            $sql = "select dc_area_id,i_branch from vw_dc_area where dc_area_id = ?";
            $arrData = $db->GetDataBySQL($sql, array($ref_id));
            echo json_encode($arrData);
    break;
}
exit;

function get($a){ return isset($a) && !empty($a)?$a:null; }

function arrForJSON($arr, $index){
 
	$arrReturn = array();
	try {
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
	}
	catch (Exception $e)
	{
		echo "panda index=$index<br>";print_r($arr);exit;
	}
	return $arrReturn;
}
?>
