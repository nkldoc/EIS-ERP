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
$d_begin	= @$_REQUEST["s_doc_date1"];
$d_end		= @$_REQUEST["s_doc_date2"];

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
                        , isnull((select c_name from dc_asset_method where dc_asset_method_id = a.i_is_status),'') as import_name
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
                    where isnull(i_is_success,0) = ? ".$util->viewAcc($i_read);

    if($mode=="SEARCH"){
        $d_begin 	= substr($d_begin,0,10);
        $d_end 		= substr($d_end,0,10);

        $sqlTempTable .= " and a.d_doc_date between ? and ? ";
        $sqlMain	= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";

        // parameter ของ ชุดแสดงรายการ
        $arrParam = array(0, $d_begin, $d_end, $start, $limit);
        // parameter ของ ชุดนับจำนวนรายการ
        $arrCountParam =  array(0, $d_begin, $d_end);
    } else {
        $sqlMain	= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        // parameter ของ ชุดแสดงรายการ
        $arrParam = array(0, $start, $limit);
        // parameter ของ ชุดนับจำนวนรายการ
        $arrCountParam =  array(0);
    }

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    while($row =$db->Fetch($stmt))				
    {
        $strDocDate = ($row["d_doc_date"] != "")? $date->shot_date_from_db($row["d_doc_date"]) : "";
        $temp = array("no" => ($i++), 
                        "id" => $row["am_tran_rg_hdr_id"],
                        "c_code" => $row["c_code"],
                        "c_name" => $row["c_name"],
                        "i_is_success" => $row["i_is_success"],
                        "i_is_status" => $row["i_is_status"],
                        "import_name" => $row["import_name"],
                        "i_is_ruins" => $row["i_is_ruins"],
                        "d_doc_date" => $date->extDateBuddha($row["d_doc_date"]),
                        "str_date"	=> $strDocDate,
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

        $temp = array(	"no"                    => $row["numrow"],
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
} else if ($type == "GET_INV"){
    $c_code = $_REQUEST["c_code"];
    $sql = "select dc_asset_type_id, asset_type 
            from vw_dc_asset_type 
            where c_code = left(?, 2) 
                and i_enable = ?
                and i_level = ?";

    $data = $db->GetDataBySQL($sql, array($c_code, STATUS_ENABLE, TREE_LEVEL_START));
    echo json_encode(array("debug"=>true,"Type"=>$type,"data"=>$data));
    exit;
}

$sqlCount = "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a";

$totalCount = $db->GetDataBySQL($sqlCount, $arrParam);
echo json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));

function get($a){ return isset($a) && !empty($a)?$a:null; }
?>