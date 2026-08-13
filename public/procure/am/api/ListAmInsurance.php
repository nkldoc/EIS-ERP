<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");
include("../../lib/database/apiUtil.php");
include("../conf/config_am.php");
###############################################################
$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();
###############################################################

$root	= "data";
$data	= array();

$con		= null;
$mode		= @$_REQUEST["mode"];
$i_read		= @$_REQUEST["i_read"];
$type 		= @$_REQUEST["type"];
$c_code 	= (!get(@$_REQUEST["c_code"])) ? '' : $_REQUEST["c_code"];
$i_enable	= (!get(@$_REQUEST["i_enable"])) ? 0 : $_REQUEST["i_enable"];
$dc_building_id	= (!get(@$_REQUEST["dc_building_id"]))? 0 : $_REQUEST["dc_building_id"];
$dc_ins_town_hdr_id = (!get(@$_REQUEST["dc_ins_town_hdr_id"]))? 0 : $_REQUEST["dc_ins_town_hdr_id"];
$i_is_method = (!get(@$_REQUEST["i_is_method"]))? 0 : $_REQUEST["i_is_method"];

$limit 	= @$_REQUEST["limit"];
$start 	= @$_REQUEST["start"];

if (!get($start))	{ $start	= 0; }
if (!get($limit))	{ $limit	= 20; }else{ $limit=($limit+$start); }

if($type == "HDR") {
    $arrParam = array();
    $arrCountParam =  array();

    $sqlTempTable = "select ROW_NUMBER() OVER (ORDER BY a.c_code desc) as row_id
                        , a.am_ins_hdr_id
                        , a.c_code
                        , a.dc_building_id
                        , b.c_code as building_code
                        , b.c_name as building_name
                        , a.dc_ins_town_hdr_id
                        , c.c_name as ins_town_name
                        , a.i_is_method
                        , d.c_name as method_name
                        , isnull(convert(varchar(10), a.d_doc_date, 120),'') as d_doc_date
                        , isnull(convert(varchar(10), a.d_start_ins, 120),'') as d_start_ins
                        , isnull(convert(varchar(10), a.price_at_date, 120),'') as price_at_date
                        , a.c_comment
                        , a.i_enable
                        , (select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_create_id) as c_create_name
                        , (select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_create_cost_id) as c_cost_creat_name
                        , convert(varchar(10), a.d_create, 120) as d_create
                        , (select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_update_id) as c_update_name
                        , (select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_update_cost_id) as c_cost_update_name
                        , convert(varchar, a.d_update, 120) as d_update
                    from am_ins_hdr a
                        inner join dc_building b on a.dc_building_id = b.dc_building_id
                        inner join dc_ins_town_hdr c on a.dc_ins_town_hdr_id = c.dc_ins_town_hdr_id
                        inner join dc_ins_method d on a.i_is_method = d.dc_ins_method_id
                    where a.c_code like ? ".$util->viewAcc($i_read);
	
    $arrParam[] = "%{$c_code}%";

    if ($i_enable > 0)
    {
        $sqlTempTable .= " and a.i_enable = ?";
        $arrParam[] = $i_enable;
    }

    if ($dc_building_id > 0)
    {
        $sqlTempTable .= " and a.dc_building_id = ?";
        $arrParam[] = $dc_building_id;
    }

    if ($dc_ins_town_hdr_id > 0)
    {
        $sqlTempTable .= " and a.dc_ins_town_hdr_id = ?";
        $arrParam[] = $dc_ins_town_hdr_id;
    }

    if ($i_is_method > 0)
    {
        $sqlTempTable .= " and a.i_is_method = ?";
        $arrParam[] = $i_is_method;
    }

    $arrCountParam = $arrParam;

    $arrParam[] = $start;
    $arrParam[] = $limit;

    $sqlMain	= "select * from ({$sqlTempTable}) a WHERE a.row_id > ? and a.row_id <= ? order by a.row_id";
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;

    while($row =$db->Fetch($stmt))				
    {
        $strDocDate = ($row["d_doc_date"] != "")? $date->shot_date_from_db($row["d_doc_date"]) : "";
        $strStartDate = ($row["d_start_ins"] != "")? $date->shot_date_from_db($row["d_start_ins"]) : "";
        $strAtDate = ($row["price_at_date"] != "")? $date->shot_date_from_db($row["price_at_date"]) : "";

        $temp = array("no" => ($i++), 
                        "id" => $row["am_ins_hdr_id"],
                        "c_code" => $row["c_code"],
                        "dc_building_id" => $row["dc_building_id"],
                        "building_code" => $row["building_code"],
                        "building_name" => $row["building_name"],
                        "dc_ins_town_hdr_id" => $row["dc_ins_town_hdr_id"],
                        "ins_town_name" => $row["ins_town_name"],
                        "i_is_method" => $row["i_is_method"],
                        "method_name" => $row["method_name"],
                        "d_doc_date" => $date->extDateBuddha($row["d_doc_date"]),
                        "str_date"	=> $strDocDate,
                        "d_start_ins" => $date->extDateBuddha($row["d_start_ins"]),
                        "str_start_date"	=> $strStartDate,
                        "price_at_date" => $date->extDateBuddha($row["price_at_date"]),
                        "str_at_date"	=> $strAtDate,
                        "c_comment" => $row["c_comment"],
                        "i_enable" => $row["i_enable"],
                        "dc_user_create_id" =>$row["c_create_name"],
                        "dc_user_create_cost_id" =>$row["c_cost_creat_name"],
                        "d_create" =>$date->extDateBuddha($row["d_create"]),
                        "dc_user_update_id" =>$row["c_update_name"],
                        "dc_user_update_cost_id" =>$row["c_cost_update_name"],
                        "d_update" =>$date->extDateBuddha($row["d_update"])
                    );
        ${$root}[] = $temp;
    }
} else if($type == "DTL") {
	$am_ins_hdr_id = $_REQUEST["am_ins_hdr_id"];
	$dc_ins_town_hdr_id = $_REQUEST["dc_ins_town_hdr_id"];
	$sqlMain = "select b.c_code as cost_code
                        , b.c_name as cost_name
                        , c.c_code as asset_code
                        , c.c_name as asset_name
                        , a.dc_asset_id
                        , a.c_code
                        , d.c_name
                        , d.c_brand
                        , d.c_model
                        , isnull(convert(varchar(10), d.d_receive_date, 120),'') as d_receive_date
                        , (select c_name from dc_ins_group where dc_ins_group_id = a.i_is_ins) as ins_name
                        , a.f_unit_cost
                        , ISNULL(a.asset_acc_cost, a.price_account) as acc_cost
                        , case when isnull(e.dc_asset_id,0) > 0 then 1 else 0 end chk_dtl
                    from vw_dc_asset_ins a
                        inner join dc_cost b on a.dc_cost_id = b.dc_cost_id
                        inner join dc_asset_type c on left(a.c_code, 2) = c.c_code and c.i_delete = ?
                        inner join am_tran_rg_dtl d on a.am_tran_rg_dtl_id = d.am_tran_rg_dtl_id
                        left join am_ins_dtl e on a.dc_asset_id = e.dc_asset_id and e.am_ins_hdr_id = ?
                    where a.dc_ins_town_hdr_id = ? 
                        and a.ins_is_method = 1 
                        and a.price_account > 1
                    order by cost_code, asset_code;";
	
	$arrParam[] = DELETE_FALSE;
	$arrParam[] = $am_ins_hdr_id;
	$arrParam[] = $dc_ins_town_hdr_id;
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$rowCount = 0;
	$costCount = 0;
	$itemCount = 0;
	$tempCostCode = "";
	$tempCostName = "";
	$tempAssetCode = "";
	$tempAssetName = "";
	
	$sumAllUnit = 0;
	$sumAllAcc = 0;
	$sumCostUnit = 0;
	$sumCostAcc = 0;
	$sumAssetUnit = 0;
	$sumAssetAcc = 0;
	while($row =$db->Fetch($stmt))
	{
		if ($tempCostCode != $row["cost_code"])
		{
			if ($sumAssetUnit > 0)
			{
				$rowCount++;
				$temp = array(	"no"				=> "",
                                                "rowNumber"			=> $rowCount,
                                                "id"				=> "",
                                                "c_code"			=> "",
                                                "c_name"			=> "",
                                                "c_brand"			=> "",
                                                "c_model"			=> "รวมหมวดสินทรัพย์ : ".$tempAssetName,
                                                "d_receive_date"                => "",
                                                "ins_name"			=> "",
                                                "f_unit_cost"                   => number_format($sumAssetUnit,2),
                                                "acc_cost"			=> number_format($sumAssetAcc,2),
                                                "chk_dtl"			=> "",
                                                "i_type"			=> 4
						);
				${$root}[] = $temp;
				
				$sumAssetUnit = 0;
				$sumAssetAcc = 0;
			}
			
			if ($sumCostUnit > 0)
			{
				$rowCount++;
				$temp = array(	"no"				=> "",
                                                "rowNumber"			=> $rowCount,
                                                "id"				=> "",
                                                "c_code"			=> "",
                                                "c_name"			=> "",
                                                "c_brand"			=> "",
                                                "c_model"			=> "รวมหน่วยงาน : ".$tempCostName,
                                                "d_receive_date"                => "",
                                                "ins_name"			=> "",
                                                "f_unit_cost"                   => number_format($sumCostUnit,2),
                                                "acc_cost"			=> number_format($sumCostAcc,2),
                                                "chk_dtl"			=> "",
                                                "i_type"			=> 5
						);
				${$root}[] = $temp;
			
				$sumCostUnit = 0;
				$sumCostAcc = 0;
			}
			
			
			$rowCount++;
			$temp = array(	"no"				=> $row["cost_name"],
                                        "rowNumber"			=> $rowCount,
                                        "id"				=> "",
                                        "c_code"			=> "",
                                        "c_name"			=> "",
                                        "c_brand"			=> "",
                                        "c_model"			=> "",
                                        "d_receive_date"                => "",
                                        "ins_name"			=> "",
                                        "f_unit_cost"                   => "",
                                        "acc_cost"			=> "",
                                        "chk_dtl"			=> "",
                                        "i_type"			=> 1
					);
			${$root}[] = $temp;

			$costCount++;
			$tempCostCode = $row["cost_code"];
			$tempCostName = $row["cost_name"];
		}
		
		if ($tempAssetCode != $row["asset_code"])
		{
			if ($sumAssetUnit > 0)
			{
				$rowCount++;
				$temp = array(	"no"				=> "",
                                                "rowNumber"			=> $rowCount,
                                                "id"				=> "",
                                                "c_code"			=> "",
                                                "c_name"			=> "",
                                                "c_brand"			=> "",
                                                "c_model"			=> "รวมหมวดสินทรัพย์ : ".$tempAssetName,
                                                "d_receive_date"                => "",
                                                "ins_name"			=> "",
                                                "f_unit_cost"                   => number_format($sumAssetUnit,2),
                                                "acc_cost"			=> number_format($sumAssetAcc,2),
                                                "chk_dtl"			=> "",
                                                "i_type"			=> 4
						);
				${$root}[] = $temp;
		
				$sumAssetUnit = 0;
				$sumAssetAcc = 0;
			}
				
			$rowCount++;
			$temp = array(	"no"				=> $row["asset_name"],
                                        "rowNumber"			=> $rowCount,
                                        "id"				=> "",
                                        "c_code"			=> "",
                                        "c_name"			=> "",
                                        "c_brand"			=> "",
                                        "c_model"			=> "",
                                        "d_receive_date"                => "",
                                        "ins_name"			=> "",
                                        "f_unit_cost"                   => "",
                                        "acc_cost"			=> "",
                                        "chk_dtl"			=> "",
                                        "i_type"			=> 2
					);
			${$root}[] = $temp;
		
			$tempAssetCode = $row["asset_code"];
			$tempAssetName = $row["asset_name"];
			$itemCount = 0;
		}
		
		$rowCount++;
		$itemCount++;
		$strReceiveDate = ($row["d_receive_date"] != "")? $date->shot_date_from_db($row["d_receive_date"]) : "";
		$temp = array(	"no"				=> $itemCount,
                                "rowNumber"			=> $rowCount,
                                "id"				=> $row["dc_asset_id"],
                                "c_code"			=> $row["c_code"],
                                "c_name"			=> $row["c_name"],
                                "c_brand"			=> $row["c_brand"],
                                "c_model"			=> $row["c_model"],
                                "d_receive_date"                => $strReceiveDate,
                                "ins_name"			=> $row["ins_name"],
                                "f_unit_cost"                   => number_format($row["f_unit_cost"],2),
                                "acc_cost"			=> number_format($row["acc_cost"],2),
                                "chk_dtl"			=> $row["chk_dtl"],
                                "i_type"			=> 3
		);
		${$root}[] = $temp;
		
		$sumAllUnit += $row["f_unit_cost"];
		$sumAllAcc += $row["acc_cost"];
		$sumCostUnit += $row["f_unit_cost"];
		$sumCostAcc += $row["acc_cost"];
		$sumAssetUnit += $row["f_unit_cost"];
		$sumAssetAcc += $row["acc_cost"];
	}
	
	if ($sumAssetUnit > 0)
	{
		$rowCount++;
		$temp = array(	"no"				=> "",
				"rowNumber"			=> $rowCount,
				"id"				=> "",
				"c_code"			=> "",
				"c_name"			=> "",
				"c_brand"			=> "",
				"c_model"			=> "รวมหมวดสินทรัพย์ : ".$tempAssetName,
				"d_receive_date"                => "",
				"ins_name"			=> "",
				"f_unit_cost"                   => number_format($sumAssetUnit,2),
				"acc_cost"			=> number_format($sumAssetAcc,2),
				"chk_dtl"			=> "",
				"i_type"			=> 4
		);
		${$root}[] = $temp;
	}
		
	if ($sumCostUnit > 0)
	{
		$rowCount++;
		$temp = array(	"no"				=> "",
				"rowNumber"			=> $rowCount,
				"id"				=> "",
				"c_code"			=> "",
				"c_name"			=> "",
				"c_brand"			=> "",
				"c_model"			=> "รวมหน่วยงาน : ".$tempCostName,
				"d_receive_date"	=> "",
				"ins_name"			=> "",
				"f_unit_cost"		=> number_format($sumCostUnit,2),
				"acc_cost"			=> number_format($sumCostAcc,2),
				"chk_dtl"			=> "",
				"i_type"			=> 5
		);
		${$root}[] = $temp;
	}
	
	if ($sumAllUnit > 0)
	{
		$rowCount++;
		$temp = array(	"no"				=> "",
				"rowNumber"			=> $rowCount,
				"id"				=> "",
				"c_code"			=> "",
				"c_name"			=> "",
				"c_brand"			=> "",
				"c_model"			=> "รวมทั้งหมด",
				"d_receive_date"	=> "",
				"ins_name"			=> "",
				"f_unit_cost"		=> number_format($sumAllUnit,2),
				"acc_cost"			=> number_format($sumAllAcc,2),
				"chk_dtl"			=> "",
				"i_type"			=> 6
		);
		${$root}[] = $temp;
	}
	
	$rowCount++;
	$temp = array(	"no"				=> "รวม {$costCount} หน่วยงาน",
			"rowNumber"			=> $rowCount,
			"id"				=> "",
			"c_code"			=> "",
			"c_name"			=> "",
			"c_brand"			=> "",
			"c_model"			=> "",
			"d_receive_date"	=> "",
			"ins_name"			=> "",
			"f_unit_cost"		=> "",
			"acc_cost"			=> "",
			"chk_dtl"			=> "",
			"i_type"			=> 7
	);
	${$root}[] = $temp;
	
	echo json_encode(array("debug"=>true, "totalCount"=>$rowCount, $root=>${$root}));
	exit;
}

$sqlCount = "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a";

$totalCount = $db->GetDataBySQL($sqlCount, $arrParam);
echo json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));

function get($a){ return isset($a) && !empty($a)?$a:null; }
?>