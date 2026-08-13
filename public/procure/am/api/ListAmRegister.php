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
$c_code		= @$_REQUEST["c_code"];
$c_name		= @$_REQUEST["c_name"];
$d_begin	= @$_REQUEST["d_begin"];
$d_end		= @$_REQUEST["d_end"];
$i_is_status= @$_REQUEST["i_is_status"];

$limit 	= @$_REQUEST["limit"];
$start 	= @$_REQUEST["start"];

if (!get($start))	{ $start	= 0; }
if (!get($limit))	{ $limit	= 20; }else{ $limit=($limit+$start); }

if($type == "HDR") {
    $sqlTempTable = "select ROW_NUMBER() OVER (ORDER BY c_code desc) as row 
                        , am_tran_rg_hdr_id
                        , c_code
                        , c_name
                        , i_is_success
                        , i_is_status
                        , i_is_ruins
                        , isnull(convert(varchar(10), d_doc_date, 120),'') as d_doc_date
                        , i_is_show
                        , c_comment
                        , i_enable
                        ,(select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_create_id) as c_create_name
                        ,(select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_create_cost_id) as c_cost_creat_name
                        , convert(varchar(10), d_create, 120) as d_create
                        ,(select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_update_id) as c_update_name
                        ,(select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_update_cost_id) as c_cost_update_name
                        , convert(varchar, [d_update], 120) as d_update
                        , case when c_code = 'SD' 
                            then 
                                case when (select count(am_tran_rg_dtl_id) from am_tran_rg_dtl where am_tran_rg_hdr_id = a.am_tran_rg_hdr_id) > 0 then 1
                                    else 2
                                end  
                            else 2 
                        end i_show_gen 
                    from am_tran_rg_hdr a
                    where c_code like ? ".$util->viewAcc($i_read);
	
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

        $i_is_status= @$_REQUEST["i_is_status"];
        if ($c_code != "")
        {
            $sqlTempTable .= " and a.c_code like ?";
            $arrParam[] = "%{$c_code}%";
            $arrCountParam[] = "%{$c_code}%";
        }

        if ($c_name != "")
        {
            $sqlTempTable .= " and a.c_name like ?";
            $arrParam[] = "%{$c_name}%";
            $arrCountParam[] = "%{$c_name}%";
        }

        if ($i_is_status != "ALL")
        {
            $sqlTempTable .= " and a.i_is_success = ?";
            $arrParam[] = $i_is_status;
            $arrCountParam[] = $i_is_status;
        }

        $arrParam[] = $start;
        $arrParam[] = $limit;

        $sqlTempTable .= " and a.d_doc_date between ? and ? ";
        $sqlMain	= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
    } else {
        $sqlTempTable .= " and isnull(i_is_success,0) = ?";
        $sqlMain	= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        // parameter ของ ชุดแสดงรายการ
        $arrParam = array("SD%", 0, $start, $limit);
        // parameter ของ ชุดนับจำนวนรายการ
        $arrCountParam =  array("SD%", 0);
    }
	
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
                        "c_name" => $row["c_name"],
                        "i_is_success" => $row["i_is_success"],
                        "str_success" => $sta_arr[$row["i_is_success"]],
                        "i_is_status" => $row["i_is_status"],
                        "i_is_ruins" => $row["i_is_ruins"],
                        "d_doc_date" => $date->extDateBuddha($row["d_doc_date"]),
                        "str_date" => $strDocDate,
                        "i_is_show" => $row["i_is_show"],
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
		
        $temp = array(	"no"	=> $row["numrow"],
                        "id"			=> $row["am_tran_rg_dtl_id"],
                        "am_tran_rg_hdr_id"	=> $row["am_tran_rg_hdr_id"],
                        "ins_is_method"		=> $row["ins_is_method"],
                        "i_is_ins"		=> $row["i_is_ins"],
                        "c_code"		=> $row["c_code"],
                        "c_name"		=> $row["c_name"],
                        "c_brand"		=> $row["c_brand"],
                        "c_model"		=> $row["c_model"],
                        "c_serial"		=> $row["c_serial"],
                        "c_type"		=> $row["c_type"],
                        "c_method_type"		=> $row["c_method_type"],
                        "c_number_body"		=> $row["c_number_body"],
                        "c_number_mech"		=> $row["c_number_mech"],
                        "c_car_license"		=> $row["c_car_license"],
                        "c_asset_code_old"	=> $row["c_asset_code_old"],
                        "c_cost_asset"		=> $row["c_cost_asset"],
                        "c_cost_ruins"		=> $row["c_cost_ruins"],
                        "c_ext_cnt"		=> $row["c_ext_cnt"],
                        "f_depreciate"		=> $row["f_depreciate"],
                        "p_area"		=> $row["p_area"],
                        "p_deed"		=> $row["p_deed"],
                        "p_num_area"		=> $row["p_num_area"],
                        "p_division"		=> $row["p_division"],
                        "p_province"		=> $row["p_province"],
                        "dc_cost_id"		=> $row["dc_cost_id"],
                        "cost_name"		=> $row["cost_name"],
                        "dc_asset_method_id"	=> $row["dc_asset_method_id"],
                        "d_register_date"	=> $RegisDate,
                        "str_register_date"	=> $strRegisDate,
                        "d_receive_date"	=> $ReceiveDate,
                        "str_receive_date"	=> $strReceiveDate,
                        "d_start_warranty"	=> $SWarrantyDate,
                        "str_s_warranty_date"	=> $strSWarrantyDate,
                        "d_end_warranty"	=> $EWarrantyDate,
                        "str_e_warranty_date"	=> $strEWarrantyDate,
                        "i_period_year"		=> $row["i_period_year"],
                        "i_is_expense"		=> $row["i_is_expense"],
                        "i_is_success"		=> $row["i_is_success"],
                        "i_is_register"		=> $row["i_is_register"],
                        "i_is_download"		=> $row["i_is_download"],
                        "i_is_out_side"		=> $row["i_is_out_side"],
                        "i_is_audit"		=> $row["i_is_audit"],
                        "i_is_split"		=> $row["i_is_split"],
                        "d_depreciate"		=> $DepreDate,
                        "str_depre_date"	=> $strDepreDate,
                        "dc_cost_id_tranfer"	=> $row["dc_cost_id_tranfer"],
                        "f_depreciate_bal"	=> $row["f_depreciate_bal"],
                        "dc_cost_old_id"	=> $row["dc_cost_old_id"],
                        "c_doc_imp"		=> $row["c_doc_imp"],
                        "d_doc_imp"		=> $ImpDate,
                        "str_imp_date"		=> $strImpDate,
                        "c_comment"		=> $row["c_comment"]
		);
		
        ${$root}[] = $temp;
    }
} else if ($type == "GET_ASSET"){
    $c_code = $_REQUEST["c_code"];
    $sql = "select dc_asset_type_id, asset_type 
                    from vw_dc_asset_type 
                    where c_code = left(?, 2) 
                            and i_enable = ?
                            and i_level = ?";

    $data = $db->GetDataBySQL($sql, array($c_code, STATUS_ENABLE, TREE_LEVEL_START));
    echo json_encode(array("debug"=>true,"Type"=>$type,"data"=>$data));
    exit;
} else if($type == "ASSET_REGIS") {
    $sqlTempTable = "SELECT ROW_NUMBER() OVER (ORDER BY a.am_tran_rg_dtl_id ASC) AS numrow 
                        , a.am_tran_rg_dtl_id
                        , a.am_tran_rg_hdr_id
                        , isnull(a.ins_is_method, 0) as ins_is_method
                        , a.i_is_ins
                        , a.c_code
                        , a.c_name
                        , a.c_brand
                        , a.c_model
                        , a.c_serial
                        , a.c_type
                        , a.c_method_type
                        , a.c_number_body
                        , a.c_number_mech
                        , a.c_car_license
                        , a.c_asset_code_old
                        , a.c_cost_asset
                        , a.c_cost_ruins
                        , a.c_ext_cnt
                        , a.f_depreciate
                        , a.p_area
                        , a.p_deed
                        , a.p_num_area
                        , a.p_division
                        , a.p_province
                        , a.dc_cost_id
                        , a.dc_asset_method_id
                        , isnull(convert(varchar(10), a.d_register_date, 120),'') as d_register_date 
                        , isnull(convert(varchar(10), a.d_receive_date, 120),'') as d_receive_date
                        , isnull(convert(varchar(10), a.d_start_warranty, 120),'') as d_start_warranty
                        , isnull(convert(varchar(10),a. d_end_warranty, 120),'') as d_end_warranty
                        , a.i_period_year
                        , a.i_is_expense
                        , a.i_is_success
                        , a.i_is_register
                        , a.i_is_download
                        , a.i_is_out_side
                        , a.i_is_audit
                        , a.i_is_split
                        , isnull(convert(varchar(10), a.d_depreciate, 120),'') as d_depreciate
                        , a.dc_cost_id_tranfer
                        , a.f_depreciate_bal
                        , a.dc_cost_old_id
                        , a.c_doc_imp
                        , isnull(convert(varchar(10), a.d_doc_imp, 120),'') as d_doc_imp
                        , a.c_comment
                        , case when isnull(b.c_code, '') <> '' then '<font color=red>'+b.c_code+'</font>'
                                when isnull(c.c_code, '') <> '' then c.c_code+'-xx-xxxxxx'
                                else '' end as asset_code
                        , isnull(d.c_code, '')+' '+isnull(d.c_name, '') as cost_name
                        , a.c_cost_asset - isnull(a.f_depreciate, a.f_depreciate_bal) as cost_acc
                        , case when a.ins_is_method = 1 then (select c_name from dc_ins_group where dc_ins_group_id= a.i_is_ins and i_enable=1)
                                else '' end as str_insurance
                        , case 
                                when isnull(b.c_code, '') <> '' then 1
                                when isnull(c.c_code, '') = '' then 2
                                when isnull(a.dc_cost_id, 0) < 1 then 3
                                when isnull(a.c_name,'') = '' then 4
                                when isnull(a.c_cost_asset,0) <= 0 then 5
                                else 0 end as i_valid
                    FROM am_tran_rg_dtl a
                        left join dc_asset b on a.am_tran_rg_dtl_id = b.am_tran_rg_dtl_id
                        left join dc_asset_type c on a.c_code = c.c_code
                        left join dc_cost d on a.dc_cost_id = d.dc_cost_id
                    WHERE am_tran_rg_hdr_id = ?";

    $sqlMain = "SELECT * FROM ({$sqlTempTable}) a";
	
    $arrParam[]	= $_REQUEST["am_tran_rg_hdr_id"];
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $arrIns=array("0"=>"ไม่ทำประกันภัย","1"=>"ส่งทำประกันภัย","2"=>"อื่น");
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

        $strInsurance = $arrIns[$row["ins_is_method"]];
        if ($row["ins_is_method"] == 1)
        {
                $strInsurance .= " ({$row["str_insurance"]})";
        }
        $temp = array(	"no"				=> $row["numrow"],
                        "id"				=> $row["am_tran_rg_dtl_id"],
                        "am_tran_rg_hdr_id"		=> $row["am_tran_rg_hdr_id"],
                        "ins_is_method"			=> $row["ins_is_method"],
                        "i_is_ins"			=> $row["i_is_ins"],
                        "c_code"			=> $row["c_code"],
                        "c_name"			=> $row["c_name"],
                        "c_brand"			=> $row["c_brand"],
                        "c_model"			=> $row["c_model"],
                        "c_serial"			=> $row["c_serial"],
                        "c_type"			=> $row["c_type"],
                        "c_method_type"			=> $row["c_method_type"],
                        "c_number_body"			=> $row["c_number_body"],
                        "c_number_mech"			=> $row["c_number_mech"],
                        "c_car_license"			=> $row["c_car_license"],
                        "c_asset_code_old"		=> $row["c_asset_code_old"],
                        "c_cost_asset"			=> $row["c_cost_asset"],
                        "c_cost_ruins"			=> $row["c_cost_ruins"],
                        "c_ext_cnt"			=> $row["c_ext_cnt"],
                        "f_depreciate"			=> $row["f_depreciate"],
                        "p_area"			=> $row["p_area"],
                        "p_deed"			=> $row["p_deed"],
                        "p_num_area"			=> $row["p_num_area"],
                        "p_division"			=> $row["p_division"],
                        "p_province"			=> $row["p_province"],
                        "dc_cost_id"			=> $row["dc_cost_id"],
                        "cost_name"			=> $row["cost_name"],
                        "dc_asset_method_id"            => $row["dc_asset_method_id"],
                        "d_register_date"		=> $RegisDate,
                        "str_register_date"		=> $strRegisDate,
                        "d_receive_date"		=> $ReceiveDate,
                        "str_receive_date"		=> $strReceiveDate,
                        "d_start_warranty"		=> $SWarrantyDate,
                        "str_s_warranty_date"           => $strSWarrantyDate,
                        "d_end_warranty"		=> $EWarrantyDate,
                        "str_e_warranty_date"           => $strEWarrantyDate,
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
                        "dc_cost_id_tranfer"            => $row["dc_cost_id_tranfer"],
                        "f_depreciate_bal"		=> $row["f_depreciate_bal"],
                        "dc_cost_old_id"		=> $row["dc_cost_old_id"],
                        "c_doc_imp"			=> $row["c_doc_imp"],
                        "d_doc_imp"			=> $ImpDate,
                        "str_imp_date"			=> $strImpDate,
                        "c_comment"			=> $row["c_comment"],
                        "asset_code"			=> $row["asset_code"],
                        "cost_acc"			=> $row["cost_acc"],
                        "str_insurance"			=> $strInsurance,
                        "i_valid"			=> $row["i_valid"]
        );
		
        ${$root}[] = $temp;
    }
}

$sqlCount = "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a";

$totalCount = $db->GetDataBySQL($sqlCount, $arrParam);
echo json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));

function get($a){ return isset($a) && !empty($a)?$a:null; }
?>