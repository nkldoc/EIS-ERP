<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php"); 

###################
$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();
############################################################################################################
$mode	= @$_REQUEST["mode"];
$filter = @$_REQUEST["filter"];
$value	= @$_REQUEST["value"];
$i_read	= @$_REQUEST["i_read"];
###################
$table	= "dc_acc";
$root	= "data";
$data	= array();
###################
$limit 	= @$_REQUEST["limit"];
$dir 	= @$_REQUEST["dir"];
$sort 	= @$_REQUEST["sort"];
$start 	= @$_REQUEST["start"];


###################
if (!$util->get($start)) { 	$start 	= 0; }
if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }

###################
function getDetailf($acc_id){
	global $db;
	$sql = "select a.dc_tax_method_id
                    , a.c_code
                    , a.c_name
                from dc_tax_method a
                    inner join tax_map_method b on b.dc_tax_method_id=a.dc_tax_method_id
                where b.dc_acc_id=? and b.i_enable = ?
                order by a.c_code,a.c_name";

	$arrParam 	= array($acc_id, STATUS_ENABLE);
	$stmt 		= $db->QueryParam($sql, $arrParam);
	$i 			= 0;
	$retval		= '';
	while($row =$db->Fetch($stmt))
	{
		if($i>0){ $br = "<br/> - "; }else{ $br = " - "; }
			$retval .= @$br.$row["c_name"];
		$i++;
	}

	return $i>0?array(1,$retval):array(2,'Copy จากรายการใช้จ่าย');
}; //End Function

$sqlTempTable = "select a.dc_acc_id
                        , a.c_code 
                        , a.c_name 
                        ,(select top 1 c_full_name from dc_user where dc_user_id= a.dc_user_create_id) as c_create_name
                        ,(select top 1 c_name from dc_cost where dc_cost_id= a.dc_user_create_cost_id) as c_cost_creat_name
                        , convert(varchar, a.d_create, 120) as d_create
                        ,(select top 1 c_full_name from dc_user where dc_user_id= a.dc_user_update_id) as c_update_name
                        ,(select top 1 c_name from dc_cost where dc_cost_id= a.dc_user_update_cost_id) as c_cost_update_name
                        , convert(varchar, a.d_update, 120) as d_update 
                        , ROW_NUMBER() OVER (ORDER BY a.c_code) as row
                from vw_dc_acc a  
                where a.i_enable=? and a.i_last=?";

if($mode=="SEARCH"){
	if (isset($filter)&&$filter!="")
	{
            if ($filter == "c_name")
                $sqlTempTable .= " and a.c_name like ?";
            else if ($filter == "c_code")
                $sqlTempTable .= " and a.c_code like ?";
	}
	$sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";

	// parameter ของ ชุดแสดงรายการ
	$arrParam = array(1,1, "%{$value}%", $start, $limit);
	// parameter ของ ชุดนับจำนวนรายการ
	$arrCountParam =  array(1,1, "%{$value}%");

}else
{
	$sqlMain	= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
	// parameter ของ ชุดแสดงรายการ
	$arrParam = array(1, 1, $start, $limit);
	// parameter ของ ชุดนับจำนวนรายการ
	$arrCountParam =  array(1,1);
}

$stmt = $db->QueryParam($sqlMain, $arrParam);
$i = $start + 1;
while($row =$db->Fetch($stmt))				
{
	$getDeail = getDetailf($row["dc_acc_id"]);
// 	print_r($getDeail); exit;
	$temp = array("no" => ($i++), 
                        "id" => $row["dc_acc_id"], 
                        "c_name" => $row["c_name"], 
                        "c_code" => $row["c_code"], 
                        "i_detail" => $getDeail[0],
                        "c_detail" => $getDeail[1],
                        "dc_user_create_id" =>$row["c_create_name"],
                        "dc_user_create_cost_id" =>$row["c_cost_creat_name"],
                        "d_create" =>$date->extDateBuddha($row["d_create"]),
                        "dc_user_update_id" =>$row["c_update_name"],
                        "dc_user_update_cost_id" =>$row["c_cost_update_name"],
                        "d_update" =>$date->extDateBuddha($row["d_update"])
                    );
	${$root}[] = $temp;
}
$sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
echo json_encode(array("debug"=>true,"totalCount"=>$totalCount,$root=>${$root}));

function get($a){ return isset($a) && !empty($a)?$a:null; }
?>