<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");	
include("../conf/config_am.php");
	
$db = new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();
############################################################################################################
$mode	= @$_REQUEST["mode"];
$filter = @$_REQUEST["filter"];
$value	= @$_REQUEST["value"];
$i_read	= @$_REQUEST["i_read"];
 
###################
$limit 	= @$_REQUEST["limit"];
$dir 	= @$_REQUEST["dir"];
$sort 	= @$_REQUEST["sort"];
$start 	= @$_REQUEST["start"];
###################
if (!$util->get($start)) { 	$start 	= 0; }
if (!$util->get($limit)) { 	$limit 	= 15; }else{ $limit=($limit+$start); }
if (!$util->get($dir))	{   $dir 	= "ASC"; }
if (!$util->get($sort)) {  	$sort 	= "c_code"; }
################### 

$root	= "data";
$debug = ''; 
$totalCount =0;

function get($a){ return isset($a) && !empty($a)?$a:null; }
	
if($_REQUEST['type'] == 'storeAcc') {
 
	$table	= "dc_acc";
	$root	= "data";
	$data	= array();
	$arrParam = array();
	$arrCountParam = array();
	
	$i_group 	= @$_REQUEST["i_group"];
	
	$sqlTempTable = "SELECT dc_acc_id, c_code, c_name
						, ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table}
					where i_last=? and i_enable = ?";
	$arrParam[] = I_LAST;
	$arrParam[] = STATUS_ENABLE;
	
	$arrCountParam[] = I_LAST;
	$arrCountParam[] = STATUS_ENABLE;
	
	if($i_group != "")
	{
		$sqlTempTable .= " and c_code like ?";
                $arrParam[] = "{$i_group}%";
		$arrCountParam[] = "{$i_group}%";
	}
	
	if($mode=="SEARCH"){
		if(isset($value) && $value !="")
		{ 
			$sqlTempTable .= " and ".$filter." like ?"; 
			$arrParam[] = "%{$value}%";
			$arrCountParam[] = "%{$value}%";
		}
	}
	
	$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
	$arrParam[] = $start;
	$arrParam[] = $limit;
 
	$stmt 	= $db->QueryParam($sqlMain, $arrParam);
	$i 		= $start + 1;
        if (@$_REQUEST["i_all"])
	{
		$temp = array("no" => 0,
				"id" => "0",
				"c_code" => "",
				"c_name" => "ทั้งหมด",
                                "c_code_name" => "ทั้งหมด"
		);
		${$root}[] = $temp;
	}
	while($row =$db->Fetch($stmt))
	{
		$temp = array("no" => ($i++),
				"id" => $row["dc_acc_id"],
				"c_code" => $row["c_code"],
				"c_name" => $row["c_name"],
                                "c_code_name" => $row["c_code"]." ".$row["c_name"]
		);
		${$root}[] = $temp;
	}
	$sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
	$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
	$debug		='storeAcc >>>';
} else if($_REQUEST['type'] == 'storeDcUnitType') {
 
	$table	= "dc_unit_type";
	$root	= "data";
	$data	= array();
	
	$sort 	= @$_REQUEST["sort"];
	$start 	= @$_REQUEST["start"];
	###################
	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 1500; }else{ $limit=($limit+$start); }
	
		
	$sqlTempTable = "SELECT dc_unit_type_id, c_name 
						, ROW_NUMBER() OVER (ORDER BY dc_unit_type_id ASC) as row FROM {$table}
					where i_is_unit_type=?";
		
	if($mode=="SEARCH"){
		if(isset($value) && $value !="")
		{ 
			$sqlTempTable .= " and ".$filter." like ?"; 
		}
		$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
		$arrParam 		=  array(1, "%{$value}%", $start, $limit); 
		$arrCountParam 	=  array(1, "%{$value}%");
 
	} else {
		$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
		$arrParam 		= array(1, $start, $limit); 
		$arrCountParam 	= array(1);
	}
 
	$stmt 	= $db->QueryParam($sqlMain, $arrParam);
	$i 		= $start + 1;
	while($row =$db->Fetch($stmt))
	{
		$temp = array("no" => ($i++),
				"id" => $row["dc_unit_type_id"],
				"c_name" => $row["c_name"] 
		);
		${$root}[] = $temp;
	}
	$sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
	$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
	$debug		='storeDcUnitType >>>';
}
/* ตาราง dc_channel ใบอนุญาต ไม่มีแล้วใน NMU_ERP
  else if($_REQUEST['type'] == 'storeDcChannel') {
 
	$table	= "dc_channel";
	$root	= "data";
	$data	= array();
	$arrParam = array();
	$arrCountParam = array();
	
	$i_group 	= @$_REQUEST["i_group"];
	
	$sqlTempTable = "SELECT dc_channel_id, c_name_show, c_name
						, ROW_NUMBER() OVER (ORDER BY i_rank ASC) as row FROM {$table}
					where i_enable = ?";
	$arrParam[] = STATUS_ENABLE;
	$arrCountParam[] = STATUS_ENABLE;
	
	if($mode=="SEARCH"){
		if(isset($value) && $value !="")
		{ 
			$sqlTempTable .= " and c_name_show like ?"; 
			$arrParam[] = "%{$value}%";
			$arrCountParam[] = "%{$value}%";
		}
	}
	
	$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
	$arrParam[] = $start;
	$arrParam[] = $limit;
 
	$stmt 	= $db->QueryParam($sqlMain, $arrParam);
	$i 		= $start + 1;
	while($row =$db->Fetch($stmt))
	{
		$temp = array("no" => ($i++),
				"id" => $row["dc_channel_id"],
				"c_code" => "",
				"c_name" => $row["c_name_show"] 
		);
		${$root}[] = $temp;
	}
	$sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
	$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
	$debug		='storeDcChannel >>>';
}
*/
else if($_REQUEST['type'] == 'storeAssetGroup') {

    $table	= "vw_dc_asset_type";
    $root	= "data";
    $data	= array();
		
    $sqlTempTable = "SELECT dc_asset_type_id, asset_type, c_code, c_name 
                        , ROW_NUMBER() OVER (ORDER BY c_code ASC) as row 
                    FROM {$table}
                    WHERE i_level = 0 AND i_enable = ?";
    if($mode=="SEARCH"){
        if(isset($value) && $value !=""){ 
            $sqlTempTable .= " and ".$filter." like ?"; 
        }
        else {
            $sqlTempTable .= " and c_code like ?";
        }
        $sqlMain	= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
        $arrParam 	=  array(STATUS_ENABLE, "%{$value}%", $start, $limit); 
        $arrCountParam =  array(STATUS_ENABLE, "%{$value}%");

    } else {
        $sqlMain        = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
        $arrParam       = array(STATUS_ENABLE, $start, $limit); 
        $arrCountParam  = array(STATUS_ENABLE);
    }
 
    $stmt 	= $db->QueryParam($sqlMain, $arrParam);
    $i 		= $start + 1;

    $add_all = @$_REQUEST["add_all"];
    if ($add_all != "")
    {
        $i++;
        $temp = array("no" => $i,
                        "id" => 0,
                        "c_code" => "",
                        "c_name" => "เลือกทั้งหมด",
                        "c_code_name" => "เลือกทั้งหมด"
        );
        ${$root}[] = $temp;
    }
	
    while($row =$db->Fetch($stmt))
    {
        $temp = array("no" => ($i++),
                        "id" => $row["dc_asset_type_id"],
                        "asset_type" => $row["asset_type"],
                        "c_code" => $row["c_code"],
                        "c_name" => $row["c_name"],
                        "c_code_name" => $row["c_code"]." ".$row["c_name"]
        );
        ${$root}[] = $temp;
    }
    $sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug	='storeAssetGroup >>>';
} else if($_REQUEST['type'] == 'storeAssetByParent') {

    $table	= "vw_dc_asset_type";
    $root	= "data";
    $data	= array();
    $conType = @$_REQUEST["conType"];
    $codeParent = @$_REQUEST["codeParent"];

    $sqlTempTable = "SELECT dc_asset_type_id, c_code, c_name 
                        , ROW_NUMBER() OVER (ORDER BY c_code ASC) as row FROM {$table}
                    WHERE i_enable = ? AND c_code != ? AND c_code LIKE ?";

    if ($conType == "isType")
    {
        $sqlTempTable .= " AND i_level = 1";
    }
    else if ($conType == "isLast")
    {
        $sqlTempTable .= " AND i_is_last = 1";
    }

    $sqlMain	= "select * from ({$sqlTempTable}) a";
    $arrParam 	=  array(STATUS_ENABLE, $codeParent, "{$codeParent}%");

    $stmt 	= $db->QueryParam($sqlMain, $arrParam);
    $i 		= 0;
    $add_all = @$_REQUEST["add_all"];
    if ($add_all != "")
    {
        $i++;
        $temp = array("no" => $i,
                        "id" => 0,
                        "c_code" => "",
                        "c_name" => "เลือกทั้งหมด",
                        "c_code_name" => "เลือกทั้งหมด"
        );
        ${$root}[] = $temp;
    }

    while($row =$db->Fetch($stmt))
    {
        $i++;
        $temp = array("no" => $i,
                        "id" => $row["dc_asset_type_id"],
                        "c_code" => $row["c_code"],
                        "c_name" => $row["c_name"],
                        "c_code_name" => $row["c_code"]." ".$row["c_name"]
        );
        ${$root}[] = $temp;
    }

    $totalCount = $i;
    $debug	='storeAssetByParent >>>';
} else if($_REQUEST['type'] == 'storeAssetByLv') {

    $table	= "vw_dc_asset_type";
    $root	= "data";
    $data	= array();
    $lv = @$_REQUEST["lv"];
    $is_last = @$_REQUEST["is_last"];

    $sqlTempTable = "SELECT dc_asset_type_id, c_code, c_name 
                        , ROW_NUMBER() OVER (ORDER BY c_code ASC) as row FROM {$table}
                    WHERE i_enable = ?";

    if ($is_last != "")
    {
        $sqlTempTable .= " AND i_is_last = ?";
        $lv = 1;
    }
    else 
    {
        $sqlTempTable .= " AND i_level = ?";
    }

    $sqlMain    = "select * from ({$sqlTempTable}) a";
    $arrParam   =  array(STATUS_ENABLE, $lv);

    $stmt 	= $db->QueryParam($sqlMain, $arrParam);
    $i 	= 0;
    $add_all = @$_REQUEST["add_all"];
    if ($add_all != "")
    {
            $i++;
            $temp = array("no" => $i,
                            "id" => 0,
                            "c_code" => "",
                            "c_name" => "เลือกทั้งหมด",
                            "c_code_name" => "เลือกทั้งหมด"
            );
            ${$root}[] = $temp;
    }

    while($row =$db->Fetch($stmt))
    {
            $i++;
            $temp = array("no" => $i,
                            "id" => $row["dc_asset_type_id"],
                            "c_code" => $row["c_code"],
                            "c_name" => $row["c_name"],
                            "c_code_name" => $row["c_code"]." ".$row["c_name"]
            );
            ${$root}[] = $temp;
    }

    $totalCount = $i;
    $debug		='storeAssetByLv >>>';
} else if($_REQUEST['type'] == 'storeAssetMethod') {

	$table	= "dc_asset_method";
	$root	= "data";
	$data	= array();
		
	$sqlTempTable = "SELECT dc_asset_method_id, c_code, c_name 
						, ROW_NUMBER() OVER (ORDER BY c_code ASC) as row FROM {$table}
					WHERE i_delete = ? 
						AND i_enable = ? ";
	if($mode=="SEARCH"){
		if(isset($value) && $value !=""){ 
			$sqlTempTable .= " and ".$filter." like ?"; 
		}
		else {
			$sqlTempTable .= " and c_code like ?";
		}
		$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
		$arrParam 		=  array(DELETE_FALSE, STATUS_ENABLE, "%{$value}%", $start, $limit); 
		$arrCountParam 	=  array(DELETE_FALSE, STATUS_ENABLE, "%{$value}%");
 
	} else {
		$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
		$arrParam 		= array(DELETE_FALSE, STATUS_ENABLE, $start, $limit); 
		$arrCountParam 	= array(DELETE_FALSE, STATUS_ENABLE);
	}
 
	$stmt 	= $db->QueryParam($sqlMain, $arrParam);
	$i 		= $start + 1;
	
	$add_all = @$_REQUEST["add_all"];
	if ($add_all != "")
	{
		$i++;
		$temp = array("no" => $i,
				"id" => 0,
				"c_code" => "",
				"c_name" => "เลือกทั้งหมด",
				"c_code_name" => "เลือกทั้งหมด"
		);
		${$root}[] = $temp;
	}
	
	while($row =$db->Fetch($stmt))
	{
		$temp = array("no" => ($i++),
				"id" => $row["dc_asset_method_id"],
				"c_code" => $row["c_code"],
				"c_name" => $row["c_name"],
				"c_code_name" => $row["c_code"]." ".$row["c_name"]
		);
		${$root}[] = $temp;
	}
	$sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
	$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
	$debug		='storeAssetMethod >>>';
}else if($_REQUEST['type'] == 'storeAssetInsurance') {

	$table	= "dc_ins_group";
	$root	= "data";
	$data	= array();
		
	$sqlTempTable = "SELECT dc_ins_group_id, c_code, c_name 
                            , ROW_NUMBER() OVER (ORDER BY c_code ASC) as row FROM {$table}
                        WHERE i_delete = ? 
                                AND i_enable = ? ";
	if($mode=="SEARCH"){
            if(isset($value) && $value !=""){ 
                    $sqlTempTable .= " and ".$filter." like ?"; 
            }
            else {
                    $sqlTempTable .= " and c_code like ?";
            }
            $sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
            $arrParam 		=  array(DELETE_FALSE, STATUS_ENABLE, "%{$value}%", $start, $limit); 
            $arrCountParam 	=  array(DELETE_FALSE, STATUS_ENABLE, "%{$value}%");
 
	} else {
            $sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
            $arrParam 		= array(DELETE_FALSE, STATUS_ENABLE, $start, $limit); 
            $arrCountParam 	= array(DELETE_FALSE, STATUS_ENABLE);
	}
 
	$stmt 	= $db->QueryParam($sqlMain, $arrParam);
	$i 		= $start + 1;
	
	$add_all = @$_REQUEST["add_all"];
	if ($add_all != "")
	{
		$i++;
		$temp = array("no" => $i,
				"id" => 0,
				"c_code" => "",
				"c_name" => "เลือกทั้งหมด"
		);
		${$root}[] = $temp;
	}
	
	while($row =$db->Fetch($stmt))
	{
		$temp = array("no" => ($i++),
				"id" => $row["dc_ins_group_id"],
				"c_code" => $row["c_code"],
				"c_name" => $row["c_name"]
		);
		${$root}[] = $temp;
	}
	$sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
	$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
	$debug		='storeAssetInsurance >>>';
}else if($_REQUEST['type'] == 'storeBuilding') {

	$table	= "dc_building";
	$root	= "data";
	$data	= array();
		
	$sqlTempTable = "SELECT dc_building_id, c_code, c_name 
						, ROW_NUMBER() OVER (ORDER BY c_code ASC) as row FROM {$table}
					WHERE i_delete = ? 
						AND i_enable = ? ";
	if($mode=="SEARCH"){
		if(isset($value) && $value !=""){ 
			$sqlTempTable .= " and ".$filter." like ?"; 
		}
		else {
			$sqlTempTable .= " and c_code like ?";
		}
		$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
		$arrParam 		=  array(DELETE_FALSE, STATUS_ENABLE, "%{$value}%", $start, $limit); 
		$arrCountParam 	=  array(DELETE_FALSE, STATUS_ENABLE, "%{$value}%");
 
	} else {
		$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
		$arrParam 		= array(DELETE_FALSE, STATUS_ENABLE, $start, $limit); 
		$arrCountParam 	= array(DELETE_FALSE, STATUS_ENABLE);
	}
 
	$stmt 	= $db->QueryParam($sqlMain, $arrParam);
	$i 		= $start + 1;
	
	$add_all = @$_REQUEST["add_all"];
	if ($add_all != "")
	{
		$i++;
		$temp = array("no" => $i,
				"id" => 0,
				"c_code" => "",
				"c_name" => "เลือกทั้งหมด"
		);
		${$root}[] = $temp;
	}
	
	while($row =$db->Fetch($stmt))
	{
		$temp = array("no" => ($i++),
				"id" => $row["dc_building_id"],
				"c_code" => $row["c_code"],
				"c_name" => $row["c_name"]
		);
		${$root}[] = $temp;
	}
	$sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
	$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
	$debug		='storeBuilding >>>';
}else if($_REQUEST['type'] == 'storeInsTown') {

    $table	= "dc_ins_town_hdr";
    $root	= "data";
    $data	= array();
    $arrParam 	=  array();
    $arrCountParam = array();

    $arrParam[] = STATUS_ENABLE;
    $dc_building_id	= (!get(@$_REQUEST["dc_building_id"]))? '' : $_REQUEST["dc_building_id"];

    $sqlTempTable = "SELECT dc_ins_town_hdr_id, '' as c_code, c_name 
                        , ROW_NUMBER() OVER (ORDER BY c_name ASC) as row FROM {$table}
                    WHERE i_enable = ? ";

    if ($dc_building_id != "")
    {
        $sqlTempTable .= " and dc_building_id = ?";
        $arrParam[] = $dc_building_id;
    }

    if($mode=="SEARCH"){
        if(isset($value) && $value !=""){ 
            $sqlTempTable .= " and ".$filter." like ?"; 
        }
        else {
            $sqlTempTable .= " and c_name like ?";
        }
        $arrParam[] =  "%{$value}%";
    }
 
    $arrCountParam = $arrParam;

    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
    $stmt 	= $db->QueryParam($sqlMain, $arrParam);
    $i 		= $start + 1;

    $add_all = @$_REQUEST["add_all"];
    if ($add_all != "")
    {
            $i++;
            $temp = array("no" => $i,
                            "id" => 0,
                            "c_code" => "",
                            "c_name" => "เลือกทั้งหมด"
            );
            ${$root}[] = $temp;
    }
	
    while($row =$db->Fetch($stmt))
    {
        $temp = array("no" => ($i++),
                        "id" => $row["dc_ins_town_hdr_id"],
                        "c_code" => $row["c_code"],
                        "c_name" => $row["c_name"]
        );
        ${$root}[] = $temp;
    }
    $sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug		='storeInsTown >>>';
}else if($_REQUEST['type'] == 'storeInsMethod') {

	$table	= "dc_ins_method";
	$root	= "data";
	$data	= array();
		
	$sqlTempTable = "SELECT dc_ins_method_id, '' as c_code, c_name 
                            , ROW_NUMBER() OVER (ORDER BY c_name ASC) as row FROM {$table}
                        WHERE i_enable = ? ";
	if($mode=="SEARCH"){
            if(isset($value) && $value !=""){ 
                $sqlTempTable .= " and ".$filter." like ?"; 
            }
            else {
                $sqlTempTable .= " and c_name like ?";
            }
            $sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
            $arrParam 		=  array(STATUS_ENABLE, "%{$value}%", $start, $limit); 
            $arrCountParam 	=  array(STATUS_ENABLE, "%{$value}%");
 
	} else {
            $sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
            $arrParam 		= array(STATUS_ENABLE, $start, $limit); 
            $arrCountParam 	= array(STATUS_ENABLE);
	}
 
	$stmt 	= $db->QueryParam($sqlMain, $arrParam);
	$i 		= $start + 1;
	
	$add_all = @$_REQUEST["add_all"];
	if ($add_all != "")
	{
		$i++;
		$temp = array("no" => $i,
				"id" => 0,
				"c_code" => "",
				"c_name" => "เลือกทั้งหมด"
		);
		${$root}[] = $temp;
	}
	
	while($row =$db->Fetch($stmt))
	{
		$temp = array("no" => ($i++),
				"id" => $row["dc_ins_method_id"],
				"c_code" => $row["c_code"],
				"c_name" => $row["c_name"]
		);
		${$root}[] = $temp;
	}
	$sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
	$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
	$debug		='storeInsMethod >>>';
} else if($_REQUEST['type'] == 'storeTreeInv') {
    $root	= "data";
    $data	= array();

    $sqlTempTable = "SELECT
                        a.dc_asset_type_id,
                        a.c_code+' '+a.c_name AS c_name,
                        a.c_code_tree,
                        a.i_level+1 AS i_level,
                        (SELECT count(c_code_tree) FROM dc_asset_type 
                            WHERE c_code_tree LIKE ''+LEFT(a.c_code_tree,((a.i_level*2)))+'%' 
                                AND i_level = a.i_level 
                                AND i_enable = @i_enable 
                                AND i_delete = @i_delete
                                AND c_code_tree like @asset_type+'%') as count_parent,
                        a.i_is_last
                    FROM vw_dc_asset_type a 
                    WHERE a.i_enable = @i_enable 
                        AND c_code_tree like @asset_type+'%'";

    $sqlMain = "DECLARE @asset_type VARCHAR(2) = ?;
                DECLARE @i_enable int = ?;
                DECLARE @i_delete int = ?;

                SELECT * FROM ({$sqlTempTable}) a ORDER BY a.c_code_tree";

    $arrParam[]	= $_REQUEST["asset_type"];
    $arrParam[]	= STATUS_ENABLE;

    $i	= 0; // numrow
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if($stmt) {
            $lv1	= 0;
            $lv2	= 0;
            $lv3	= 0;
            $lv4	= 0;
            while($row =$db->Fetch($stmt)) {

                    $tree_code	= "";

                    if($row["i_level"] == 1) {
                            $lv1++;
                            $lv2	= 0;
                            $lv3	= 0;
                            $lv4	= 0;
                            $tree_code	= $lv1;
                    } else if($row["i_level"] == 2) {
                            $lv2++;
                            $lv3	= 0;
                            $lv4	= 0;
                            $tree_code	= $lv1."_".$lv2;
                    } else if($row["i_level"] == 3) {
                            $lv3++;
                            $lv4	= 0;
                            $tree_code	= $lv1."_".$lv2."_".$lv3;
                    } else if($row["i_level"] == 4) {
                            $lv4++;
                            $tree_code	= $lv1."_".$lv2."_".$lv3."_".$lv4;
                    }

                    $temp	= array("no"				=> ++$i,
                                                    "dc_asset_type_id"	=> $row["dc_asset_type_id"],
                                                    "c_name"			=> $row["c_name"],
                                                    "c_code_tree"		=> $row["c_code_tree"],
                                                    "i_level"			=> $row["i_level"],
                                                    "count_parent"		=> $row["count_parent"],
                                                    "i_is_last"			=> $row["i_is_last"],
                                                    "tree_code"			=> $tree_code
                    );
                    ${$root}[] = $temp;
            }
    }
    $totalCount	= $i;
    $debug		='storeTreeInv >>>';
} else if($_REQUEST['type'] == 'storeCost') {

    $table	= "dc_cost";
    $root	= "data";
    $data	= array();

    $sqlTempTable = "SELECT dc_cost_id, c_code, c_name 
                                            , ROW_NUMBER() OVER (ORDER BY c_code ASC) as row FROM {$table}
                                    WHERE i_enable = ? and i_last= ? ";
    if($mode=="SEARCH"){
            if(isset($value) && $value !=""){ 
                    $sqlTempTable .= " and ".$filter." like ?"; 
            }else {
                    $sqlTempTable .= " and c_code like ?";
            }
            $sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
            $arrParam 		=  array(STATUS_ENABLE, I_LAST, "%{$value}%", $start, $limit); 
            $arrCountParam 	=  array(STATUS_ENABLE, I_LAST, "%{$value}%");

    } else {
            $sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
            $arrParam 		= array(STATUS_ENABLE, I_LAST, $start, $limit); 
            $arrCountParam 	= array(STATUS_ENABLE, I_LAST);
    }

    $stmt 	= $db->QueryParam($sqlMain, $arrParam);
    $i 		= $start + 1;

    if (@$_REQUEST["i_all"])
    {
            $temp = array("no" => 0,
                            "id" => "0",
                            "c_code" => "",
                            "c_name" => "ทุกหน่วยงาน",
                            "c_code_name" => "ทุกหน่วยงาน"
            );
            ${$root}[] = $temp;
    }
    while($row =$db->Fetch($stmt))
    {
            $temp = array("no" => ($i++),
                            "id" => $row["dc_cost_id"],
                            "c_code" => $row["c_code"],
                            "c_name" => $row["c_name"], 
                            "c_code_name" => $row["c_code"]." ".$row["c_name"]
            );
            ${$root}[] = $temp;
    }
    $sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug		='storeCost >>>';
} else if($_REQUEST['type'] == 'storeSD') {

    $table	= "am_tran_rg_hdr";
    $root	= "data";
    $sqlWhere = "";
    $data	= array();

    if($mode=="SEARCH"){
        if(isset($value) && $value !=""){
            $sqlWhere = " and ".$filter." like '%{$value}%'";
        }else {
            $sqlWhere = " and c_code like '%{$value}%'";
        }
    }

    $sqlMain = "SET NOCOUNT ON
                declare @tb as table (row_id int identity(1, 1)
                                        , am_tran_rg_hdr_id bigint
                                        , c_code varchar(50)
                                        , c_name varchar(255));

                insert into @tb
                select am_tran_rg_hdr_id
                    , c_code
                    , c_name 
                from am_tran_rg_hdr 
                where c_code != 'SD'
                {$sqlWhere}
                and am_tran_rg_hdr_id not in(
                                        select c.am_tran_rg_hdr_id 
                                        from dc_asset b
                                            inner join am_tran_rg_dtl c on b.am_tran_rg_dtl_id = c.am_tran_rg_dtl_id
                                        where isnull(b.i_process_depre,0) > 0
                                        group by c.am_tran_rg_hdr_id
                                        );

                select * from @tb a where a.row_id > ? AND a.row_id <= ?;
                select count(*) as rowCounts from @tb;
                ";

    $stmt 	= $db->QueryParam($sqlMain, array($start, $limit));
    while($row =$db->Fetch($stmt))
    {
        $temp = array("no" => $row["row_id"],
                        "id" => $row["am_tran_rg_hdr_id"],
                        "c_code" => $row["c_code"],
                        "c_name" => $row["c_name"] 
        );
        ${$root}[] = $temp;
    }

    $db->NextResult( $stmt );
    $rowCounts=$db->Fetch( $stmt );
    $totalCount = $rowCounts["rowCounts"];
	
	$debug		='storeSD >>>';
} else if($_REQUEST['type'] == 'storePurchaseContract') {

	$table	= "ap_po_hdr";
	$root	= "data";
	$data	= array();
	$arrParam = array();
		
	$sqlTempTable = "SELECT ap_po_hdr_id, c_po_no, c_contract_no 
						, ROW_NUMBER() OVER (ORDER BY c_contract_no ASC) as row FROM {$table}
					WHERE ap_po_hdr_id in (select ap_po_hdr_id from ap_period_hdr where i_is_audit=?) ";
	$arrParam[] = 1;
	
	if($mode=="SEARCH"){
		if(isset($value) && $value !=""){
			if ($filter == "c_name")
			{
				$sqlTempTable .= " and c_contract_no like ?"; 
				$arrParam[] = "%{$value}%";
			}
			
			if ($filter == "c_code")
			{
				$sqlTempTable .= " and c_po_no like ?"; 
				$arrParam[] = "%{$value}%";
			}
		}
	}
 
	$arrCountParam = $arrParam;
	
	$arrParam[] = $start;
	$arrParam[] = $limit;
	$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
	
	$stmt 	= $db->QueryParam($sqlMain, $arrParam);
	$i 		= $start + 1;
	
	if (@$_REQUEST["i_all"])
	{
		$temp = array("no" => 0,
				"id" => "0",
				"c_code" => "",
				"c_name" => "ทั้งหมด"
		);
		${$root}[] = $temp;
	}
	while($row =$db->Fetch($stmt))
	{
		$temp = array("no" => ($i++),
				"id" => $row["ap_po_hdr_id"],
				"c_code" => $row["c_po_no"],
				"c_name" => $row["c_contract_no"] 
		);
		${$root}[] = $temp;
	}
	$sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
	$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
	$debug		='storePurchaseContract >>>';
} else if($_REQUEST['type'] == 'storeSDSearch') {

	$root	= "data";
	$data	= array();
	$arrParam = array();
	$dc_cost_id = @$_REQUEST["dc_cost_id"];
	$i_start_month = @$_REQUEST["i_start_month"];
	$i_start_year = @$_REQUEST["i_start_year"];
	$i_end_month = @$_REQUEST["i_end_month"];
	$i_end_year = @$_REQUEST["i_end_year"];
		
	$sqlTempTable = "select a.am_tran_rg_hdr_id, a.c_code, a.c_name 
                            , ROW_NUMBER() OVER (ORDER BY a.c_code ASC) as row
                        from am_tran_rg_hdr a
                            inner join am_tran_rg_dtl b on a.am_tran_rg_hdr_id = b.am_tran_rg_hdr_id
                            inner join dc_asset c on b.am_tran_rg_dtl_id = c.am_tran_rg_dtl_id
                        where a.i_enable=?
                            and b.i_enable=? 
                            and a.c_code like ?
                        ";
	$arrParam[] = STATUS_ENABLE;
	$arrParam[] = STATUS_ENABLE;
	$arrParam[] = 'SD%';
	
	if ($dc_cost_id > 0)
	{
            $sqlTempTable .= " and b.dc_cost_id = ?";
            $arrParam[] = $dc_cost_id;
	}
	
	if ($i_start_month != "" && $i_start_year != "" && $i_end_month != "" && $i_end_year != "")
	{
            $ym_start = sprintf("%04d%02d", $i_start_year, $i_start_month);
            $ym_end = sprintf("%04d%02d", $i_end_year,$i_end_month);

            $sqlTempTable .= " and case when a.c_code!='none' then substring (a.c_code,3,4) else '0000' end between ? and ? ";
            $arrParam[] = substr($ym_start,2, 4);
            $arrParam[] = substr($ym_end,2, 4);
	}
	
	if($mode=="SEARCH"){
            if(isset($value) && $value !=""){
                if ($filter == "c_name")
                {
                    $sqlTempTable .= " and a.c_name like ?"; 
                    $arrParam[] = "%{$value}%";
                }

                if ($filter == "c_code")
                {
                    $sqlTempTable .= " and a.c_code like ?"; 
                    $arrParam[] = "%{$value}%";
                }
            }
	}
 
	$sqlTempTable .= " group by a.am_tran_rg_hdr_id, a.c_code, a.c_name";
	$arrCountParam = $arrParam;
	
	$arrParam[] = $start;
	$arrParam[] = $limit;
	$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
	
	//echo $sqlMain; print_r($arrParam);exit;
	$stmt 	= $db->QueryParam($sqlMain, $arrParam);
	$i 		= $start + 1;
	
	if (@$_REQUEST["i_all"])
	{
		$temp = array("no" => 0,
				"id" => "0",
				"c_code" => "",
				"c_name" => "ทั้งหมด"
		);
		${$root}[] = $temp;
	}
	while($row =$db->Fetch($stmt))
	{
		$temp = array("no" => ($i++),
				"id" => $row["am_tran_rg_hdr_id"],
				"c_code" => $row["c_code"],
				"c_name" => $row["c_name"] 
		);
		${$root}[] = $temp;
	}
	$sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
	$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
	$debug		='storeSDSearch >>>';
} else if($_REQUEST['type'] == 'storeDcAsset') {

	$root	= "data";
	$data	= array();
	$arrParam = array();
	$asset_group = @$_REQUEST["asset_group"];
	$asset_type = @$_REQUEST["asset_type"];
		
	$sqlTempTable = "select b.dc_asset_id
                            , b.c_code
                            , c.c_name 
                            , ROW_NUMBER() OVER (ORDER BY b.c_code ASC) as i_row
                        from gl_asset_depre a
                            inner join dc_asset b on a.dc_asset_id = b.dc_asset_id
                            inner join am_tran_rg_dtl c on b.am_tran_rg_dtl_id = c.am_tran_rg_dtl_id
                        where b.c_code like ?
                       ";
	$arrParam[] = ($asset_type != "")? "{$asset_type}%" : "{$asset_group}%";
	
	if($mode=="SEARCH"){
		if(isset($value) && $value !=""){
			if ($filter == "c_name")
			{
				$sqlTempTable .= " and c.c_name like ?"; 
				$arrParam[] = "%{$value}%";
			}
			
			if ($filter == "c_code")
			{
				$sqlTempTable .= " and b.c_code like ?"; 
				$arrParam[] = "%{$value}%";
			}
		}
	}
 
	$sqlTempTable .= "  group by b.dc_asset_id, b.c_code, c.c_name";
	$arrCountParam = $arrParam;
	
	$arrParam[] = $start;
	$arrParam[] = $limit;
	$sqlMain    = "select * from ({$sqlTempTable}) a WHERE a.i_row > ? and a.i_row <= ?";
	
	//echo $sqlMain; print_r($arrParam);exit;
	$stmt 	= $db->QueryParam($sqlMain, $arrParam);
	$i 		= $start + 1;
	
	if (@$_REQUEST["i_all"])
	{
		$temp = array("no" => 0,
				"id" => "0",
				"c_code" => "",
				"c_name" => "ทั้งหมด"
		);
		${$root}[] = $temp;
	}
	while($row =$db->Fetch($stmt))
	{
		$temp = array("no" => ($i++),
				"id" => $row["dc_asset_id"],
				"c_code" => $row["c_code"],
				"c_name" => $row["c_name"] 
		);
		${$root}[] = $temp;
	}
	$sqlCount   = "select count(*) as totalCount from ({$sqlTempTable}) a";
	$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
	$debug      ='storeDcInv >>>';
}else if($_REQUEST['type'] == 'storeAmInsHdr') {

    $table	= "am_ins_hdr";
    $root	= "data";
    $data	= array();
    $arrParam = array();

    $sqlTempTable = "SELECT am_ins_hdr_id
                        , c_code
                        , dc_ins_town_hdr_id
                        , i_is_method
                        , dc_building_id
                        , month(d_start_ins) as i_month
                        , year(d_start_ins) as i_year
                        , ROW_NUMBER() OVER (ORDER BY c_code ASC) as row FROM {$table}
                    WHERE 1=?";
    $arrParam[] = 1;

    if($mode=="SEARCH"){
        if(isset($value) && $value !=""){
            if ($filter == "c_name")
            {
                    $sqlTempTable .= " and c_code like ?"; 
                    $arrParam[] = "%{$value}%";
            }
        }
    }

    $arrCountParam = $arrParam;

    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlMain	= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";

    $stmt 	= $db->QueryParam($sqlMain, $arrParam);
    $i 		= $start + 1;

    if (@$_REQUEST["i_all"])
    {
            $temp = array("no" => 0,
                            "id" => "0",
                            "c_name" => "ทั้งหมด",
                            "dc_ins_town_hdr_id" => "",
                            "i_is_method" => "",
                            "dc_building_id" =>"",
                            "i_month" => "",
                            "i_year" => ""
            );
            ${$root}[] = $temp;
    }
    while($row =$db->Fetch($stmt))
    {
            $temp = array("no" => ($i++),
                            "id" => $row["am_ins_hdr_id"],
                            "c_name" => $row["c_code"] ,
                            "dc_ins_town_hdr_id" => $row["dc_ins_town_hdr_id"],
                            "i_is_method" => $row["i_is_method"],
                            "dc_building_id" =>$row["dc_building_id"],
                            "i_month" => $row["i_month"],
                            "i_year" => $row["i_year"]
            );
            ${$root}[] = $temp;
    }
    $sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug	='storeAmInsHdr >>>';
}
 
echo json_encode(array("success"=>true,
		"debug"=>$debug,"totalCount"=>$totalCount,
		$root=>(isset(${$root}) && ${$root}!=null)?${$root}:''));
exit;
?>