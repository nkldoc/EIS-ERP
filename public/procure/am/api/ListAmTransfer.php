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
$d_begin 	= (!get(@$_REQUEST["d_begin"])) ? date("Y-m-d", mktime(0, 0, 0, (date('m')-1), 1, date('Y'))) : substr($_REQUEST["d_begin"],0, 10);
$d_end		= (!get(@$_REQUEST["d_end"])) ? date("Y-m-d") : substr($_REQUEST["d_end"],0, 10);
$dc_cost_id	= (!get(@$_REQUEST["dc_cost_id"]))? 0 : $_REQUEST["dc_cost_id"];

$limit 	= @$_REQUEST["limit"];
$start 	= @$_REQUEST["start"];

if (!get($start))	{ $start	= 0; }
if (!get($limit))	{ $limit	= 20; }else{ $limit=($limit+$start); }

if($type == "HDR") {
	$arrParam = array();
	$arrCountParam =  array();
	
	$sqlTempTable = "select ROW_NUMBER() OVER (ORDER BY c_code_gen desc, d_date_chg desc) as row_id
                            , am_tf_hdr_id
                            , inv_tran_type_id
                            , c_code
                            , c_name
                            , c_code_gen
                            , dc_cost_id
                            , (select c_code+' '+c_name from dc_cost where dc_cost_id = a.dc_cost_id) as cost_name
                            , dc_cost_old_id
                            , dc_cost_id_new
                            , (select c_code+' '+c_name from dc_cost where dc_cost_id = a.dc_cost_id_new) as cost_new_name
                            , isnull(convert(varchar(10), d_date_chg, 120),'') as d_date_chg
                            , isnull(convert(varchar(10), d_doc_date, 120),'') as d_doc_date
                            , c_comment
                            , i_enable
                            , (select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_create_id) as c_create_name
                            , (select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_create_cost_id) as c_cost_creat_name
                            , convert(varchar(10), d_create, 120) as d_create
                            , (select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_update_id) as c_update_name
                            , (select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_update_cost_id) as c_cost_update_name
                            , convert(varchar, [d_update], 120) as d_update
                            , case when c_code_gen = 'TA' 
                                            then 
                                                    case when (select count(am_tf_dtl_id) from am_tf_dtl where am_tf_hdr_id = a.am_tf_hdr_id) > 0 then 1
                                                            else 2
                                                    end  
                                            else 2 
                                    end as i_show_gen
                            , case when cast(year(d_date_chg)as varchar(4))+ right('0'+cast(month(d_date_chg)as varchar(2)),2) 
                                                    >= cast(year(getdate())as varchar(4))+ right('0'+cast(month(getdate())as varchar(2)),2)
                                                    or c_code_gen = 'TA'
                                            then 1
                                            else 2
                                    end as i_is_update
                        from am_tf_hdr a
                        where c_code_gen like 'TA%'
                            and a.d_doc_date between ? and ? ".$util->viewAcc($i_read);
	
	$arrParam[] = $d_begin;
	$arrCountParam[] = $d_begin;
	
	$arrParam[] = $d_end;
	$arrCountParam[] = $d_end;
	

	if ($dc_cost_id > 0)
	{
		$sqlTempTable .= " and a.dc_cost_id = ?";
		$arrParam[] = $dc_cost_id;
		$arrCountParam[] = $dc_cost_id;
	}

	$arrParam[] = $start;
	$arrParam[] = $limit;
	
	$sqlMain	= "select *
						, left(cost_name, 12) as cost_code
						, substring(cost_name, 14, len(cost_name)) as cost_names
						, left(cost_new_name, 12) as cost_new_code
						, substring(cost_new_name, 14, len(cost_new_name)) as cost_new_names 
					from ({$sqlTempTable}) a WHERE a.row_id > ? and a.row_id <= ? order by a.row_id";
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i = $start + 1;
	
	while($row =$db->Fetch($stmt))				
	{
		$strChgDate = ($row["d_date_chg"] != "")? $date->shot_date_from_db($row["d_date_chg"]) : "";
		$strDocDate = ($row["d_doc_date"] != "")? $date->shot_date_from_db($row["d_doc_date"]) : "";
		
		$temp = array("no" => ($i++), 
						"id" => $row["am_tf_hdr_id"],
						"inv_tran_type_id" => $row["inv_tran_type_id"],
						"c_code" => $row["c_code"],
						"c_name" => $row["c_name"],
						"c_code_gen" => $row["c_code_gen"],
						"dc_cost_id" => $row["dc_cost_id"],
						"dc_cost_old_id" => $row["dc_cost_old_id"],
						"dc_cost_id_new" => $row["dc_cost_id_new"],
						"d_date_chg" => $date->extDateBuddha($row["d_date_chg"]),
						"str_chg_date"	=> $strChgDate,
						"d_doc_date" => $date->extDateBuddha($row["d_doc_date"]),
						"str_date"	=> $strDocDate,
						"c_comment" => $row["c_comment"],
						"i_enable" => $row["i_enable"],
						"dc_user_create_id" =>$row["c_create_name"],
						"dc_user_create_cost_id" =>$row["c_cost_creat_name"],
						"d_create" =>$date->extDateBuddha($row["d_create"]),
						"dc_user_update_id" =>$row["c_update_name"],
						"dc_user_update_cost_id" =>$row["c_cost_update_name"],
						"d_update" =>$date->extDateBuddha($row["d_update"]),
						"i_show_gen"=>$row["i_show_gen"],
						"i_is_update"=>$row["i_is_update"],
						"cost_fname"=>$row["cost_name"],
						"cost_code" => $row["cost_code"],
						"cost_names" => $row["cost_names"],
						"cost_new_fname"=>$row["cost_new_name"],
						"cost_new_code" => $row["cost_new_code"],
						"cost_new_names" => $row["cost_new_names"]
					);
		${$root}[] = $temp;
	}
} else if($type == "DTL") {
	$sqlMain = "select a.am_tf_dtl_id
						, b.c_code
						, c.c_name
						, b.f_unit_cost
						, b.f_depreciate_cost
						, (isnull(b.f_unit_cost,0) - isnull(b.f_depreciate_cost,0)) as acc_amt
					from am_tf_dtl a
						inner join dc_asset b on a.dc_asset_id = b.dc_asset_id
						inner join am_tran_rg_dtl c on b.am_tran_rg_dtl_id = c.am_tran_rg_dtl_id
					where a.am_tf_hdr_id = ?
					order by b.c_code";
	
	$arrParam[]	= $_REQUEST["am_tf_hdr_id"];
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i =1;
	while($row =$db->Fetch($stmt))
	{
		$temp = array(	"no"					=> ($i++),
						"id"					=> $row["am_tf_dtl_id"],
						"c_code"				=> $row["c_code"],
						"c_name"				=> $row["c_name"],
						"f_unit_cost"			=> $row["f_unit_cost"],
						"f_depreciate_cost"		=> $row["f_depreciate_cost"],
						"acc_amt"				=> $row["acc_amt"]
		);
		
		${$root}[] = $temp;
	}
	
	echo json_encode(array("debug"=>true, "totalCount"=>$i, $root=>${$root}));
	exit;
} else if($type == "LIST_ASSET") {
	$sqlMain = "declare @am_tf_hdr_id as bigint;
					declare @dc_cost_id as bigint;
					declare @chg_date as datetime;
					
					set @am_tf_hdr_id = ?;
					
					select @dc_cost_id = dc_cost_id
						, @chg_date = d_date_chg 
					from am_tf_hdr
					where am_tf_hdr_id = @am_tf_hdr_id;
					
					select  a.dc_asset_id
							, a.c_code
							, b.c_name
							, isnull(a.f_unit_cost,0) as f_unit_cost
							, (isnull(a.f_unit_cost,0) - isnull(a.f_depreciate_cost,0)) as acc_amt
					from dc_asset a
                                            inner join am_tran_rg_dtl b on a.am_tran_rg_dtl_id = b.am_tran_rg_dtl_id
					where a.dc_cost_id=@dc_cost_id
						and (convert(datetime,@chg_date,102) < a.bt_date or a.bt_date is null)
						and a.dc_asset_id not in (select dc_asset_id from am_tf_dtl where am_tf_hdr_id=@am_tf_hdr_id)";
	
	if ($mode == "SEARCH")
	{
            $fillter = @$_REQUEST["fillter"];
            $value = @$_REQUEST["value"];
            $asset_group = @$_REQUEST["asset_group"];
            $asset_type = @$_REQUEST["asset_type"];
            $asset_code = @$_REQUEST["asset_code"];
            if ($value != "")
            {
                    $sqlMain .= " and a.{$fillter} like '%{$value}%'";
            }

            if ($asset_code != "")
                $sqlMain .= " and a.dc_asset_type_id in (select dc_asset_type_id from vw_dc_asset_type where c_code like '{$asset_code}%')";
            else if ($asset_type != "")
                $sqlMain .= " and a.dc_asset_type_id in (select dc_asset_type_id from vw_dc_asset_type where c_code like '{$asset_type}%')";
            else if ($asset_group != "")
                $sqlMain .= " and a.dc_asset_type_id in (select dc_asset_type_id from vw_dc_asset_type where c_code like '{$asset_group}%')";
	}
	
	$arrParam[]	= $_REQUEST["am_tf_hdr_id"];
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i = 1;
	while($row =$db->Fetch($stmt))
	{
		
		$temp = array(	"no"					=> ($i++),
                                "id"					=> $row["dc_asset_id"],
                                "c_code"				=> $row["c_code"],
                                "c_name"				=> $row["c_name"],
                                "f_unit_cost"			=> $row["f_unit_cost"],
                                "acc_amt"				=> $row["acc_amt"]
		);
		
		${$root}[] = $temp;
	}
	echo json_encode(array("debug"=>true, "totalCount"=>$i, $root=>${$root}));
	exit;
}

$sqlCount = "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a";

$totalCount = $db->GetDataBySQL($sqlCount, $arrParam);
echo json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));

function get($a){ return isset($a) && !empty($a)?$a:null; }
?>