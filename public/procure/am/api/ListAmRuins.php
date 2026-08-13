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

$con			= null;
$mode			= @$_REQUEST["mode"];
$i_read			= @$_REQUEST["i_read"];
$type 			= @$_REQUEST["type"];
$c_code			= @$_REQUEST["c_code"];
$d_begin		= @$_REQUEST["d_begin"];
$d_end			= @$_REQUEST["d_end"];
$i_is_expense	= @$_REQUEST["i_is_expense"];
$i_is_status	= @$_REQUEST["i_is_status"];

$limit 	= @$_REQUEST["limit"];
$start 	= @$_REQUEST["start"];

if (!get($start))	{ $start = 0; }
if (!get($limit))	{ $limit = 20; }else{ $limit=($limit+$start); }

if($type == "HDR") {
	$sqlTempTable = "select ROW_NUMBER() OVER (ORDER BY c_code desc) as row 
                                , am_tran_rg_hdr_id
                                , a.c_code
                                , convert(varchar(10), a.d_doc_date, 120) as d_doc_date
                                , a.c_name
                                , isnull(a.c_comment, '') as c_comment
                                , a.i_is_ruins
                                , a.i_enable
                                ,(select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_create_id) as c_create_name
                                ,(select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_create_cost_id) as c_cost_creat_name
                                , convert(varchar(10), d_create, 120) as d_create
                                ,(select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_update_id) as c_update_name
                                ,(select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_update_cost_id) as c_cost_update_name
                                , convert(varchar, d_update, 120) as d_update
                            from am_tran_rg_hdr a
                            where a.c_code like ?".$util->viewAcc($i_read);
	
	if($mode=="SEARCH"){
		$arrParam = array();
		$arrCountParam =  array();
		
		$arrParam[] = "SD%";
		$arrCountParam[] = "SD%";
		
		$d_begin 	= substr($d_begin,0,10);
		$arrParam[] = $d_begin;
		$arrCountParam[] = $d_begin;
		
		$d_end 		= substr($d_end,0,10);
		$arrParam[] = $d_end;
		$arrCountParam[] = $d_end;
		
		$sqlTempTable .= " and a.d_doc_date between ? and ? ";
		
		if ($c_code != "")
		{
			$sqlTempTable .= " and a.c_code like ?";
			$arrParam[] = "%{$c_code}%";
			$arrCountParam[] = "%{$c_code}%";
		}
		
		$i_is_status= @$_REQUEST["i_is_status"];
		if ($i_is_status != "ALL")
		{
			$sqlTempTable .= " and a.i_is_success = ?";
			$arrParam[] = $i_is_status;
			$arrCountParam[] = $i_is_status;
		}
		
		$i_is_expense = @$_REQUEST["i_is_expense"];
		if ($i_is_status != "ALL")
		{
			$sqlTempTable .= " and a.i_is_expense = ?";
			$arrParam[] = $i_is_expense;
			$arrCountParam[] = $i_is_expense;
		}
		
		$arrParam[] = $start;
		$arrParam[] = $limit;
		
		$sqlMain	= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
	} else {
		$sqlTempTable .= " and isnull(i_is_success,0) = ? and isnull(a.i_is_ruins,0) = ?";
		$sqlMain	= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
		// parameter ของ ชุดแสดงรายการ
		$arrParam = array("SD%", ASSET_STATUS_SUCCESS, 0, $start, $limit);
		// parameter ของ ชุดนับจำนวนรายการ
		$arrCountParam =  array("SD%", ASSET_STATUS_SUCCESS, 0);
	}
	
	//echo $sqlMain;
	//print_r($arrParam);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i = $start + 1;
	$sta_arr = array(ASSET_STATUS_WAIT=>"<font color=red>รอดำเนินการ</font>"
					,ASSET_STATUS_SUCCESS=>"<font color=green>เสร็จสมบูรณ์</font>");
	while($row =$db->Fetch($stmt))				
	{
		$strDocDate = ($row["d_doc_date"] != "")? $date->shot_date_from_db($row["d_doc_date"]) : "";
		
		$temp = array("no" => ($i++), 
						"id" => $row["am_tran_rg_hdr_id"],
						"c_code" => $row["c_code"],
						"d_doc_date" => $date->extDateBuddha($row["d_doc_date"]),
						"str_date"	=> $strDocDate,
						"c_name" => $row["c_name"],
						"c_comment" => $row["c_comment"],
						"i_is_ruins" => $row["i_is_ruins"],
                                                "i_enable" => $row["i_enable"],
						"str_ruins"	=> $sta_arr[$row["i_is_ruins"]],
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
	$sqlTempTable = "SELECT ROW_NUMBER() OVER (ORDER BY a.am_tran_rg_dtl_id ASC) AS numrow 
                            , am_tran_rg_dtl_id
                            , am_tran_rg_hdr_id
                            , ins_is_method
                            , i_is_ins
                            , c_code
                            , c_name
                            , c_brand
                            , c_model
                            , c_serial
                            , c_type
                            , c_method_type
                            , c_number_body
                            , c_number_mech
                            , c_car_license
                            , c_asset_code_old
                            , c_cost_asset
                            , c_cost_ruins
                            , c_ext_cnt
                            , f_depreciate
                            , p_area
                            , p_deed
                            , p_num_area
                            , p_division
                            , p_province
                            , dc_cost_id
                            , (select c_code+' '+c_name from dc_cost where dc_cost_id = a.dc_cost_id) as cost_name
                            , dc_asset_method_id
                            , isnull(convert(varchar(10), d_register_date, 120),'') as d_register_date 
                            , isnull(convert(varchar(10), d_receive_date, 120),'') as d_receive_date
                            , isnull(convert(varchar(10), d_start_warranty, 120),'') as d_start_warranty
                            , isnull(convert(varchar(10), d_end_warranty, 120),'') as d_end_warranty
                            , i_period_year
                            , i_is_expense
                            , i_is_success
                            , i_is_register
                            , i_is_download
                            , i_is_out_side
                            , i_is_audit
                            , i_is_split
                            , isnull(convert(varchar(10), d_depreciate, 120),'') as d_depreciate
                            , dc_cost_id_tranfer
                            , f_depreciate_bal
                            , dc_cost_old_id
                            , c_doc_imp
                            , isnull(convert(varchar(10), d_doc_imp, 120),'') as d_doc_imp
                            , c_comment
                        FROM am_tran_rg_dtl a
                        WHERE am_tran_rg_hdr_id = ?";
	
	$sqlMain = "SELECT * FROM ({$sqlTempTable}) a";
	
	$arrParam[]	= $_REQUEST["am_tran_rg_hdr_id"];
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	while($row =$db->Fetch($stmt))
	{
		$strRegisDate = ($row["d_register_date"] != "")? $date->shot_date_from_db($row["d_register_date"]) : "";
		$strReceiveDate = ($row["d_receive_date"] != "")? $date->shot_date_from_db($row["d_receive_date"]) : "";
		$strSWarrantyDate = ($row["d_start_warranty"] != "")? $date->shot_date_from_db($row["d_start_warranty"]) : "";
		$strEWarrantyDate = ($row["d_end_warranty"] != "")? $date->shot_date_from_db($row["d_end_warranty"]) : "";
		$strDepreDate = ($row["d_depreciate"] != "")? $date->shot_date_from_db($row["d_depreciate"]) : "";
		$strImpDate = ($row["d_doc_imp"] != "")? $date->shot_date_from_db($row["d_doc_imp"]) : "";
		
		$RegisDate = ($row["d_register_date"] != "")? $date->extDateBuddha($row["d_register_date"]) : "";
		$ReceiveDate = ($row["d_receive_date"] != "")? $date->extDateBuddha($row["d_receive_date"]) : "";
		$SWarrantyDate = ($row["d_start_warranty"] != "")? $date->extDateBuddha($row["d_start_warranty"]) : "";
		$EWarrantyDate = ($row["d_end_warranty"] != "")? $date->extDateBuddha($row["d_end_warranty"]) : "";
		$DepreDate = ($row["d_depreciate"] != "")? $date->extDateBuddha($row["d_depreciate"]) : "";
		$ImpDate = ($row["d_doc_imp"] != "")? $date->extDateBuddha($row["d_doc_imp"]) : "";
		
		$temp = array(	"no"					=> $row["numrow"],
                                "id"					=> $row["am_tran_rg_dtl_id"],
                                "am_tran_rg_hdr_id"		=> $row["am_tran_rg_hdr_id"],
                                "ins_is_method"			=> $row["ins_is_method"],
                                "i_is_ins"				=> $row["i_is_ins"],
                                "c_code"				=> $row["c_code"],
                                "c_name"				=> $row["c_name"],
                                "c_brand"				=> $row["c_brand"],
                                "c_model"				=> $row["c_model"],
                                "c_serial"				=> $row["c_serial"],
                                "c_type"				=> $row["c_type"],
                                "c_method_type"			=> $row["c_method_type"],
                                "c_number_body"			=> $row["c_number_body"],
                                "c_number_mech"			=> $row["c_number_mech"],
                                "c_car_license"			=> $row["c_car_license"],
                                "c_asset_code_old"		=> $row["c_asset_code_old"],
                                "c_cost_asset"			=> $row["c_cost_asset"],
                                "c_cost_ruins"			=> $row["c_cost_ruins"],
                                "c_ext_cnt"				=> $row["c_ext_cnt"],
                                "f_depreciate"			=> $row["f_depreciate"],
                                "p_area"				=> $row["p_area"],
                                "p_deed"				=> $row["p_deed"],
                                "p_num_area"			=> $row["p_num_area"],
                                "p_division"			=> $row["p_division"],
                                "p_province"			=> $row["p_province"],
                                "dc_cost_id"			=> $row["dc_cost_id"],
                                "cost_name"				=> $row["cost_name"],
                                "dc_asset_method_id"	=> $row["dc_asset_method_id"],
                                "d_register_date"		=> $RegisDate,
                                "str_register_date"		=> $strRegisDate,
                                "d_receive_date"		=> $ReceiveDate,
                                "str_receive_date"		=> $strReceiveDate,
                                "d_start_warranty"		=> $SWarrantyDate,
                                "str_s_warranty_date"	=> $strSWarrantyDate,
                                "d_end_warranty"		=> $EWarrantyDate,
                                "str_e_warranty_date"	=> $strEWarrantyDate,
                                "i_period_year"			=> $row["i_period_year"],
                                "i_is_expense"			=> $row["i_is_expense"],
                                "i_is_success"			=> $row["i_is_success"],
                                "i_is_register"			=> $row["i_is_register"],
                                "i_is_download"			=> $row["i_is_download"],
                                "i_is_out_side"			=> $row["i_is_out_side"],
                                "i_is_audit"			=> $row["i_is_audit"],
                                "i_is_split"			=> $row["i_is_split"],
                                "d_depreciate"			=> $DepreDate,
                                "str_depre_date"		=> $strDepreDate,
                                "dc_cost_id_tranfer"	=> $row["dc_cost_id_tranfer"],
                                "f_depreciate_bal"		=> $row["f_depreciate_bal"],
                                "dc_cost_old_id"		=> $row["dc_cost_old_id"],
                                "c_doc_imp"				=> $row["c_doc_imp"],
                                "d_doc_imp"				=> $ImpDate,
                                "str_imp_date"			=> $strImpDate,
                                "c_comment"				=> $row["c_comment"]
		);
		
		${$root}[] = $temp;
	}
} else if ($type == "GET_ASSET"){
	$c_code = $_REQUEST["c_code"];
	$sql = "select dc_asset_type_id, asset_type 
			from dc_asset_type 
			where c_code = left(?, 2) 
				and i_enable = ?
				and i_delete = ? 
				and i_level = ?";
	
	$data = $db->GetDataBySQL($sql, array($c_code, STATUS_ENABLE, DELETE_FALSE, TREE_LEVEL_START));
	echo json_encode(array("debug"=>true,"Type"=>$type,"data"=>$data));
	exit;
} else if($type == "ASSET_RUNIS") {
	$sqlMain = "select isnull(a.i_is_download, 0) as i_is_download
						, a.am_tran_rg_dtl_id
						, b.c_code
						, (select top 1 c_name from dc_asset_type where c_code = left(a.c_code, 6)) as group_asset
						, (select top 1 c_name from dc_asset_type where c_code = a.c_code) as asset_name
						, a.c_name
						, a.c_asset_code_old
						, c.c_name as cost_name
						, (select c_name from dc_cost where dc_cost_id = c.dc_cost_acc_id) as cost_acc_name
						, b.status_bt
						, case b.status_bt when 0 then 'ใช้งาน' else '<font color=red>ตัดจำหน่าย</font>' end str_status
						, isnull(i_is_expense, 0) as i_is_expense
						, isnull(convert(varchar(10), a.d_receive_date, 120),'') as d_receive_date
						, isnull(convert(varchar(10), a.d_register_date, 120),'') as d_register_date
						, b.f_unit_cost
						, b.c_cost_ruins
						, b.i_period_year
						, isnull(case when b.d_depreciate_new is not null then convert(varchar(10),b.d_depreciate_new, 120) else convert(varchar(10),a.d_depreciate, 120) end,'') as d_depreciate
						, a.f_depreciate
						, a.i_is_audit
						, a.p_province
						, a.p_area
						, a.p_deed
						, a.c_brand
						, a.c_serial
						, a.c_model
						, a.c_type
						, a.i_is_expense
					from am_tran_rg_dtl a
						inner join (select am_tran_rg_dtl_id
									, c_code
									, c_cost_ruins
									, i_period_year
									, f_unit_cost
									, c_name
									, d_depreciate_new
									, case when ta_date is not null then  1  else 0 end as status_bt
									, case when dc_cost_id_ta is not null then  dc_cost_id_ta  else dc_cost_id end as dc_cost_id
								from dc_asset)  b on b.am_tran_rg_dtl_id=a.am_tran_rg_dtl_id
						inner join dc_cost c on b.dc_cost_id = c.dc_cost_id
					where a.am_tran_rg_hdr_id = ?
					order by i_is_download, c_code ";
	
	$arrParam[]	= $_REQUEST["am_tran_rg_hdr_id"];
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$tempDownload = "-1";
	$arrDownload = array("0"=>"สินทรัพย์จากการป้อนข้อมูล", "1"=>"สินทรัพย์ที่ได้จากการนำเข้าข้อมูล (ไฟล์ *.csv)");
	$count = 0;
	while($row =$db->Fetch($stmt))
	{
		if ($tempDownload != $row["i_is_download"])
		{
			$count++;
			$temp = array("no"				=> $count,
							"c_code" => $arrDownload[$row["i_is_download"]],
							"i_type" => 1);
			${$root}[] = $temp;
			
			$tempDownload = $row["i_is_download"];
		}
		
		$count++;
		$strReceive = ($row["d_receive_date"] != "")? $date->shot_date_from_db($row["d_receive_date"]) : "";
		$ReceiveDate = ($row["d_receive_date"] != "")? $date->extDateBuddha($row["d_receive_date"]) : "";
		
		$strRegister = ($row["d_register_date"] != "")? $date->shot_date_from_db($row["d_register_date"]) : "";
		
		$strDepreciate = ($row["d_depreciate"] != "")? $date->shot_date_from_db($row["d_depreciate"]) : "";
		$DepreciateDate = ($row["d_depreciate"] != "")? $date->extDateBuddha($row["d_depreciate"]) : "";
		
		$temp = array(	"no"				=> $count,
						"id"				=> $row["am_tran_rg_dtl_id"],
						"c_code"			=> $row["c_code"],
						"group_asset"		=> $row["group_asset"],
						"asset_name"		=> $row["asset_name"],
						"c_name"			=> $row["c_name"],
						"c_asset_code_old"	=> $row["c_asset_code_old"],
						"cost_name"			=> $row["cost_name"],
						"cost_acc_name"		=> $row["cost_acc_name"],
						"str_status"		=> $row["str_status"],
						"i_is_expense"		=> $row["i_is_expense"],
						"strReceive"		=> $strReceive,
						"d_receive_date"	=> $ReceiveDate,
						"strRegister"		=> $strRegister,
						"f_unit_cost"		=> $row["f_unit_cost"],
						"c_cost_ruins"		=> $row["c_cost_ruins"],
						"i_period_year"		=> $row["i_period_year"],
						"strDepreciate"		=> $strDepreciate,
						"d_depreciate"		=> $DepreciateDate,
						"f_depreciate"		=> $row["f_depreciate"],
						"i_is_audit"		=> $row["i_is_audit"],
						"p_province" 		=> $row["p_province"],
						"p_area" 			=> $row["p_area"],
						"p_deed" 			=> $row["p_deed"],
						"c_brand" 			=> $row["c_brand"],
						"c_serial" 			=> $row["c_serial"],
						"c_model" 			=> $row["c_model"],
						"c_type" 			=> $row["c_type"],
						"i_is_expense"		=> $row["i_is_expense"],
						"i_type" 			=> 2
				
		);
		
		${$root}[] = $temp;
	}
	
	echo json_encode(array("debug"=>true, "totalCount"=>$count, $root=>${$root}));
	exit;
}else if ($type == "GETHEAD"){
	$hdr_id = $_REQUEST["am_tran_rg_hdr_id"];
	
	$sql = "select a.c_code
				, a.c_name 
				, isnull(b.c_name, 'จัดซื้อจัดจ้าง') as method_name
				, isnull(convert(varchar(10), a.d_doc_date, 120), '') as d_doc_date
				, isnull(a.c_comment,'') as c_comment
			from am_tran_rg_hdr a
				inner join dc_asset_method b on a.i_is_status = b.dc_asset_method_id
			where a.am_tran_rg_hdr_id = ?";
	$dataHdr = $db->GetDataBySQL($sql, array($hdr_id));
	$strDocDate = ($dataHdr["d_doc_date"] != "")? $date->shot_date_from_db($dataHdr["d_doc_date"]) : "";
	${$root}[] = array("c_code"=>$dataHdr["c_code"]
						, "c_name"=>$dataHdr["c_name"]
						, "method_name"=>$dataHdr["method_name"]
						, "d_doc_date"=>$strDocDate
						, "c_comment"=>$dataHdr["c_comment"]
	);
	$totalCount = 1;
	echo json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
	exit;
}

$sqlCount = "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a";

$totalCount = $db->GetDataBySQL($sqlCount, $arrParam);
echo json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));

function get($a){ return isset($a) && !empty($a)?$a:null; }
?>