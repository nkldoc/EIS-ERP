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

$limit 	= @$_REQUEST["limit"];
$start 	= @$_REQUEST["start"];

if (!get($start))	{ $start	= 0; }
if (!get($limit))	{ $limit	= 20; }else{ $limit=($limit+$start); }

if($type == "HDR") {
	if ($mode == "SEARCH")
	{
            $where = "";
            $arrParam = array($d_begin, $d_end, $start, $limit);
            $arrCountParam =  array($d_begin, $d_end);
	}
	else 
	{
            $where = " and a.i_enable =? ";
            $arrParam = array($d_begin, $d_end, STATUS_ENABLE, $start, $limit);
            $arrCountParam =  array($d_begin, $d_end, STATUS_ENABLE);
	}
	
	$sqlTempTable = "select ROW_NUMBER() OVER (ORDER BY c_code desc) as row_id
						, am_edit_hdr_id
						, c_code
						, c_name
						, d_doc
						, isnull(convert(varchar(10), d_doc_date, 120),'') as d_doc_date
						, i_enable
						, c_comment
						, (select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_create_id) as c_create_name
						, (select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_create_cost_id) as c_cost_creat_name
						, convert(varchar(10), d_create, 120) as d_create
						, (select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_update_id) as c_update_name
						, (select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_update_cost_id) as c_cost_update_name
						, convert(varchar, [d_update], 120) as d_update
						, case when c_code = 'EDI' 
								then 
									case when (select count(*) from am_edit_dtl where am_edit_hdr_id = a.am_edit_hdr_id) > 0 then 1
										else 2
									end  
								else 2 
							end as i_show_gen
					from am_edit_hdr a
					where a.d_doc_date between ? and ? ".$where.$util->viewAcc($i_read);
	
	$sqlMain	= "select * from ({$sqlTempTable}) a WHERE a.row_id > ? and a.row_id <= ? order by a.row_id";
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i = $start + 1;
	
	while($row =$db->Fetch($stmt))				
	{
		$strDocDate = ($row["d_doc_date"] != "")? $date->shot_date_from_db($row["d_doc_date"]) : "";
		
		$temp = array("no" => ($i++), 
						"id" => $row["am_edit_hdr_id"],
						"c_code" => $row["c_code"],
						"c_name" => $row["c_name"],
						"d_doc" => $row["d_doc"],
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
						"i_show_gen"=>$row["i_show_gen"]
					);
		${$root}[] = $temp;
	}
} else if($type == "DTL") {
	$sqlMain = "select a.am_edit_dtl_id
					, a.c_name
					, b.c_code
					, c.c_name as cost_name
					, b.i_enable
				from am_edit_dtl a
					inner join dc_asset b on a.dc_asset_id = b.dc_asset_id	
					inner join dc_cost c on b.dc_cost_id = c.dc_cost_id
				where am_edit_hdr_id=?";
	
	$arrParam[]	= $_REQUEST["am_edit_hdr_id"];
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i =1;
	while($row =$db->Fetch($stmt))
	{
		$temp = array(	"no"			=> ($i++),
                                "id"			=> $row["am_edit_dtl_id"],
                                "c_code"		=> $row["c_code"],
                                "c_name"		=> $row["c_name"],
                                "cost_name"		=> $row["cost_name"],
                                "str_status"            => ($row["i_enable"] == STATUS_ENABLE)? '<font color="blue">ใช้งาน</font>' : '<font color="red">ไม่ใช้งาน</font>'
		);
		
		${$root}[] = $temp;
	}
	
	echo json_encode(array("debug"=>true, "totalCount"=>$i, $root=>${$root}));
	exit;
} else if($type == "LIST_ASSET") {
	
	$am_edit_hdr_id = $_REQUEST["am_edit_hdr_id"];
	
	$sd_code = @$_REQUEST["sd_code"];
	$c_code = @$_REQUEST["c_code"];
	$c_name = @$_REQUEST["c_name"];
	$dc_cost_id = @$_REQUEST["dc_cost_id"];

	$sqlTempTable = "select ROW_NUMBER() OVER (ORDER BY a.c_code ASC) AS numrow 
                            , a.dc_asset_id
                            , b.am_tran_rg_dtl_id
                            , a.dc_cost_id
                            , a.c_code
                            , e.c_name as cost_name
                            , b.c_name
                            , b.p_province
                            , b.p_area
                            , b.p_deed
                            , b.p_num_area
                            , b.c_brand
                            , b.c_serial
                            , b.c_model
                            , b.c_type
                            , b.c_number_body
                            , b.c_number_mech
                            , b.c_car_license
                            , b.c_asset_code_old
                            , b.c_cost_asset
                            , b.c_cost_ruins
                            , b.i_period_year
                            , a.f_depreciate_cost as f_depreciate
                            , isnull(convert(varchar(10), a.d_doc_date, 120),'') as d_receive_date 
                            , isnull(convert(varchar(10), b.d_register_date, 120),'') as d_register_date
                            , isnull(convert(varchar(10), b.d_start_warranty, 120),'') as d_start_warranty
                            , isnull(convert(varchar(10), b.d_end_warranty, 120),'') as d_end_warranty
                            , b.dc_asset_method_id
                            , b.ins_is_method
                            , b.i_is_ins
                            , b.c_comment
                            , c.c_code AS sd_code 
                            , a.i_enable
                            , '' as asset_type
                            , '' as dc_asset_group
                            , d.parent_id as asset_type_id
                            , d.c_name as asset_name
                            , '' as acc_status
                        from dc_asset a 
                            inner join am_tran_rg_dtl b on a.am_tran_rg_dtl_id = b.am_tran_rg_dtl_id 
                            inner join am_tran_rg_hdr c on b.am_tran_rg_hdr_id = c.am_tran_rg_hdr_id 
                            inner join dc_asset_type d on a.dc_asset_type_id = d.dc_asset_type_id
                            inner join dc_cost e on a.dc_cost_id = e.dc_cost_id
                        where a.i_enable=1 
                        and a.dc_asset_id not in (select dc_asset_id from am_edit_dtl where am_edit_hdr_id=?)";
	$arrParam[] = $am_edit_hdr_id;

	if ($sd_code != "")
	{
            $sqlTempTable .= " and c.c_code like ? ";
            $arrParam[]	= "%{$sd_code}%";
	}
	
	if ($c_code != "")
	{
            $sqlTempTable .= " and a.c_code like ? ";
            $arrParam[]	= "%{$c_code}%";
	}
	
	if ($c_name != "")
	{
            $sqlTempTable .= " and b.c_code like ? ";
            $arrParam[]	= "%{$c_name}%";
	}
	
	if ($dc_cost_id > 0)
	{
            $sqlTempTable .= " and a.dc_cost_id = ? ";
            $arrParam[]	= $dc_cost_id;
	}
	
	$arrCountParam =  $arrParam;
	$arrParam[] = $start;
	$arrParam[] = $limit;
	
	$sqlMain = "SELECT * FROM ({$sqlTempTable}) a WHERE a.numrow > ? and a.numrow <= ? order by a.numrow";
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	while($row =$db->Fetch($stmt))
	{
            $strRegisDate = ($row["d_register_date"] != "")? $date->shot_date_from_db($row["d_register_date"]) : "";
            $strReceiveDate = ($row["d_receive_date"] != "")? $date->shot_date_from_db($row["d_receive_date"]) : "";
            $strSWarrantyDate = ($row["d_start_warranty"] != "")? $date->shot_date_from_db($row["d_start_warranty"]) : "";
            $strEWarrantyDate = ($row["d_end_warranty"] != "")? $date->shot_date_from_db($row["d_end_warranty"]) : "";

            $RegisDate = ($row["d_register_date"] != "")? $date->extDateBuddha($row["d_register_date"]) : "";
            $ReceiveDate = ($row["d_receive_date"] != "")? $date->extDateBuddha($row["d_receive_date"]) : "";
            $SWarrantyDate = ($row["d_start_warranty"] != "")? $date->extDateBuddha($row["d_start_warranty"]) : "";
            $EWarrantyDate = ($row["d_end_warranty"] != "")? $date->extDateBuddha($row["d_end_warranty"]) : "";
		
            $asset_type_id = $row["asset_type_id"];
		
            $sqlGet = "select c_name as dc_asset_type_name
                                , (select asset_type from dc_asset_type where c_code = left(a.c_code, 2)) as asset_type
                                , (select c_name from dc_asset_type where c_code = left(a.c_code, 2)) as dc_asset_group_name
                            from dc_asset_type a
                            where dc_asset_type_id = ?";
            $dataAsset = $db->GetDataBySQL($sqlGet, array($asset_type_id));
            $asset_type = $dataAsset["asset_type"];
            $dc_asset_group = $dataAsset["dc_asset_group_name"];
            $dc_asset_type = $dataAsset["dc_asset_type_name"];
		
            $sqlGX = "select case when (select top 1 b.gl_depre_hdr_id from gl_depre_hdr a
                            inner join gl_depre_dtl b on a.gl_depre_hdr_id = b.gl_depre_hdr_id
                        where a.i_is_posted = 1 and b.dc_asset_id = ?) > 0 then 1 else 0 end as i_gx";
            $acc_status = $db->GetDataBySQL($sqlGX, array($row["dc_asset_id"]));
		
            $temp = array("no"              => $row["numrow"],
                        "id"                => $row["dc_asset_id"],
                        "am_tran_rg_dtl_id" => $row["am_tran_rg_dtl_id"],
                        "dc_cost_id"        => $row["dc_cost_id"],
                        "c_code"            => $row["c_code"],
                        "cost_name"         => $row["cost_name"],
                        "c_name"            => $row["c_name"],
                        "p_province"        => $row["p_province"],
                        "p_area"            => $row["p_area"],
                        "p_deed"            => $row["p_deed"],
                        "p_num_area"        => $row["p_num_area"],
                        "c_brand"           => $row["c_brand"],
                        "c_serial"          => $row["c_serial"],
                        "c_model"           => $row["c_model"],
                        "c_type"            => $row["c_type"],
                        "c_number_body"     => $row["c_number_body"],
                        "c_number_mech"     => $row["c_number_mech"],
                        "c_car_license"     => $row["c_car_license"],
                        "c_asset_code_old"  => $row["c_asset_code_old"],
                        "c_cost_asset"      => $row["c_cost_asset"],
                        "c_cost_ruins"      => $row["c_cost_ruins"],
                        "i_period_year"     => $row["i_period_year"],
                        "f_depreciate"      => $row["f_depreciate"],
                        "d_receive_date"    => $ReceiveDate,
                        "str_receive_date"  => $strReceiveDate,
                        "d_register_date"   => $RegisDate,
                        "str_register_date" => $strRegisDate,
                        "d_start_warranty"  => $SWarrantyDate,
                        "str_s_warranty_date" => $strSWarrantyDate,
                        "d_end_warranty"    => $EWarrantyDate,
                        "str_e_warranty_date" => $strEWarrantyDate,
                        "dc_asset_method_id" => $row["dc_asset_method_id"],
                        "ins_is_method"     => $row["ins_is_method"],
                        "i_is_ins"          => $row["i_is_ins"],
                        "c_comment"         => $row["c_comment"],
                        "sd_code"           => $row["sd_code"],
                        "i_enable"          => $row["i_enable"],
                        "asset_type"        => $asset_type,
                        "dc_asset_group"    => $dc_asset_group,
                        "dc_asset_type"     => $dc_asset_type,
                        "asset_name"        => $row["asset_name"],
                        "acc_status"        => $acc_status
		);
		
        ${$root}[] = $temp;
    }
}

$sqlCount = "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a";

$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
echo json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));

function get($a){ return isset($a) && !empty($a)?$a:null; }
?>