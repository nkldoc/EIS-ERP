<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../conf/config_am.php");

//print_r($_REQUEST);exit;
$db = new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$mode		= $_REQUEST["mode"];
$table 		= "am_edit_hdr";
$tableDtl 	= "am_edit_dtl";
$keyName 	= "am_edit_hdr_id";
$keyDtlName	= "am_edit_dtl_id";
$code_gen	= "EDI";
 
$data = $util->mnUser($_REQUEST);
$data["c_code"] = $code_gen;
$hdr_id = @$data["id"];

$fld = array("c_code",
            "c_name",
            "d_doc",
            "d_doc_date",
            "c_comment",
            "i_enable",
            "dc_user_create_id",
            "dc_user_create_cost_id",
            "d_create",
            "dc_user_update_id",
            "dc_user_update_cost_id",
            "d_update");

$stmt2 = false;
$stmt3 = false;
$db->BeginTran();
switch ($mode) {
    case "ADD" : 
        $arrParam = array();		
        $addField = "";
        $addValue = "";

        $data["i_enable"] = STATUS_ENABLE;
        $data["c_code"] = $code_gen;
        $data["d_doc_date"] = $date->bc_to_ad($data["d_doc_date"]);
        foreach($fld as $value)
        {
                if (!empty($data[$value]))
                {
                        $addField .= ", {$value}";
                        $addValue .= ", ?";
                        $arrParam[] = $data[$value];
                }
        }

        $sql = "INSERT INTO {$table} (".substr($addField, 1).") VALUES (".substr($addValue,1).")";
        $sql.="SELECT @@IDENTITY as hdr_id";
        $stmt = $db->QueryParam($sql, $arrParam);
        if ($stmt)
        {

                $next_result = $db->NextResult($stmt);
                if( $next_result ) {
                        $dd_hdr = $db->Fetch($stmt);
                        $hdr_id = $dd_hdr["hdr_id"] ;
                }
        }
    break;
    case "EDIT" :
        $stmt2 = true;	$stmt3 = true;
        $arrParam = array();
        $upField = "";
        $data["d_doc_date"] = $date->bc_to_ad($data["d_doc_date"]);
        foreach($fld as $value)
        {
            if (!empty($data[$value]))
            {
                $upField .= ", {$value} = ?";
                $arrParam[] = $data[$value];
            }
        }
        $sql = "UPDATE {$table} 
                    SET ".substr($upField, 1)."
                WHERE {$keyName} = ?";

        $arrParam[] = $data["id"];
        $stmt = $db->QueryParam($sql, $arrParam);
    break;
    case "DELETE" : 
        $sql = "DELETE FROM {$table} WHERE {$keyName} = ?";
        $arrParam = array($data["id"]);
        $stmt = $db->QueryParam($sql, $arrParam);

        /* $sql = "DELETE FROM {$tableDtl} WHERE {$keyName} = ?";
        $arrParam = array($data["id"]);
        $stmt3 = $db->QueryParam($sql, $arrParam); */
    break;
    case "GENCODE":
        $data = $util->mnUser($_REQUEST);
        list($dd, $mm, $yyyy) = explode("-",@$data["d_doc_date"]);
        $c_yyyy_mm = ($yyyy-543).$mm;
        $arrParamGencode	= array($code_gen,$c_yyyy_mm,$data["dc_user_update_id"],$data["dc_user_update_cost_id"],$data["id"]);
        $sqlGenCode			= "EXEC SP_GEN_CODE ?,?,?,?,?;";
        $stmtGenCode 		= $db->QueryParam($sqlGenCode,$arrParamGencode);

        $arr_gen_code 	= $db->Fetch($stmtGenCode);
        $c_code 		= $arr_gen_code["c_code_gen"] ;
        $ref_id   		= $arr_gen_code["reference_id"] ;

        if ($data["id"]==$ref_id )
        {
            $sql = "UPDATE {$table}
            SET c_code = ?
                    , i_enable = ?
            WHERE {$keyName} = ?;";

            $stmt = $db->QueryParam($sql, array($c_code, STATUS_ENABLE, $data["id"]));
        }
        $data["c_code"] = $c_code;
    break;
    case "EDIT_DTL" ://EDIT_DTL
        $data = $util->mnUser($_REQUEST, "ADD");
        $am_edit_hdr_id = $data["am_edit_hdr_id"];
        $am_tran_rg_dtl_id = $data["am_tran_rg_dtl_id"];
        $dc_asset_id = $data["dc_asset_id"];
        $c_name = $data["c_name"];
        $p_province = $data["p_province"];
        $p_area = $data["p_area"];
        $p_deed = $data["p_deed"];
        $p_num_area = $data["p_num_area"];
        $c_brand = $data["c_brand"];
        $c_serial = $data["c_serial"];
        $c_model = $data["c_model"];
        $c_type = $data["c_type"];
        $c_number_body = $data["c_number_body"];
        $c_number_mech = $data["c_number_mech"];
        $c_car_license = $data["c_car_license"];
        $c_asset_code_old = $data["c_asset_code_old"];
        $c_cost_asset = $data["c_cost_asset"];
        $c_cost_ruins = $data["c_cost_ruins"];
        $i_period_year = $data["i_period_year"];
        $f_depreciate = $data["f_depreciate"];
        $d_receive_date = ($data["d_receive_date"] == "")? NULL : substr($data["d_receive_date"],0, 10);
        $d_register_date = ($data["d_register_date"] == "")? NULL : substr($data["d_register_date"],0, 10);
        $d_start_warranty = ($data["d_start_warranty"] == "")? NULL : substr($data["d_start_warranty"],0, 10);
        $d_end_warranty = ($data["d_end_warranty"] == "")? NULL : substr($data["d_end_warranty"],0, 10);
        $dc_asset_method_id = $data["dc_asset_method_id"];
        $ins_is_method = $data["ins_is_method"];
        $i_is_ins = ($data["ins_is_method"] == 1)? $data["i_is_ins"] : 0;
        $c_comment = $data["c_comment"];

        $sqlEditDtl = "insert into am_edit_dtl (am_edit_hdr_id, am_tran_rg_dtl_id, dc_asset_id, i_is_last
                            , dc_asset_method_id, c_name, c_brand, c_model
                            , c_serial, c_type, c_asset_code_old, c_cost_asset
                            , p_area, p_deed, p_num_area, p_province
                            , d_register_date, d_receive_date, d_start_warranty, d_end_warranty
                            , c_comment, c_number_body, c_number_mech, c_car_license)
                        select ?, ?, ?, isnull(max(i_is_last),0)+1 as i_is_last
                            , ?, ?, ?, ?
                            , ?, ?, ?, ?
                            , ?, ?, ?, ?
                            , ?, ?, ?, ?
                            , ?, ?, ?, ?
                        from am_edit_dtl 
                        where am_edit_hdr_id = ?";
        $arrParamDtl = array($am_edit_hdr_id, $am_tran_rg_dtl_id, $dc_asset_id
                                        , $dc_asset_method_id, $c_name, $c_brand, $c_model 
                                        , $c_serial, $c_type, $c_asset_code_old, $c_cost_asset
                                        , $p_area, $p_deed, $p_num_area, $p_province
                                        , $d_register_date, $d_receive_date, $d_start_warranty, $d_end_warranty
                                        , $c_comment, $c_number_body, $c_number_mech, $c_car_license
                                        , $am_edit_hdr_id
        );
        $stmt = $db->QueryParam($sqlEditDtl, $arrParamDtl);

        $sqlAsset = "update dc_asset
                    set f_unit_cost = ?, c_cost_ruins = ?, f_depreciate_cost = ?, i_period_year = ?
                        , c_name = ?, ins_is_method = ?, i_is_ins = ?
                        , d_doc_date = ?, d_register_date = ?, c_comment = ?
                    where dc_asset_id = ?";
        $arrParamAsset = array($c_cost_asset, $c_cost_ruins, $f_depreciate, $i_period_year
                        , $c_name, $ins_is_method, $i_is_ins
                        , $d_receive_date, $d_register_date, $c_comment
                        , $dc_asset_id
        );
        $stmt2 = $db->QueryParam($sqlAsset, $arrParamAsset);

        $sqlTranDtl = "update am_tran_rg_dtl
                        set dc_asset_method_id = ?, c_name = ?, c_brand = ?, c_model = ?
                            , c_serial = ?, c_type = ?, c_asset_code_old = ?, c_cost_asset = ?
                            , p_area = ?, p_deed = ?, p_num_area = ?, p_province = ?
                            , d_register_date = ?, d_receive_date = ?, d_start_warranty = ?, d_end_warranty = ?
                            , c_comment = ?, c_number_body = ?, c_number_mech = ?, c_car_license = ?
                        where am_tran_rg_dtl_id = ?";
        $arrParamTranDtl = array($dc_asset_method_id, $c_name, $c_brand, $c_model 
                                    , $c_serial, $c_type, $c_asset_code_old, $c_cost_asset
                                    , $p_area, $p_deed, $p_num_area, $p_province
                                    , $d_register_date, $d_receive_date, $d_start_warranty, $d_end_warranty
                                    , $c_comment, $c_number_body, $c_number_mech, $c_car_license
                                    , $am_tran_rg_dtl_id);
        $stmt3 = $db->QueryParam($sqlTranDtl, $arrParamTranDtl);

        $data["c_code"] = "";
    break;
    case "DELETE_DTL" :
        $stmt2 = true;	$stmt3 = true;
        $arrDtl = @$_REQUEST["chk_dtl"];
        if (is_array($arrDtl))
        {
            foreach($arrDtl as $dtl_id)
            {
                $sql = "DELETE FROM {$tableDtl} WHERE {$keyDtlName} = ?";
                $arrParam = array($dtl_id);
                $stmt = $db->QueryParam($sql, $arrParam);
            }
        }
    break;
}

if ($stmt)
{
    $db->CommitTran();
    $re = array("reval"=>0,"success"=>"Success","msg"=>"commit","hdr_id"=>$hdr_id,"c_code_gen"=>$data["c_code"]);
}
else
{
    $db->RollBackTran();
    $re = array("reval"=>1,"success"=>"Error","msg"=>"check statement : {$sql}");
}
 
echo json_encode($re);
exit;

?>