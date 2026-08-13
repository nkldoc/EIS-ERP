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
$table 		= "am_tf_hdr";
$tableDtl 	= "am_tf_dtl";
$keyName 	= "am_tf_hdr_id";
$keyDtlName	= "am_tf_dtl_id";
$code_gen	= "BT";
 
$data = $util->mnUser($_REQUEST);
$data["c_code_gen"] = $code_gen;
$hdr_id = @$data["id"];

$fld = array("inv_tran_type_id",
            "c_code",
            "c_name",
            "c_code_gen",
            "dc_cost_id",
            "dc_cost_old_id",
            "dc_cost_id_new",
            "d_date_chg",
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
		
		$data["inv_tran_type_id"] = AM_TRAN_TYPE_1;
		$data["i_enable"] = STATUS_ENABLE;
		$data["c_code_gen"] = $code_gen;
		$data["d_date_chg"] = NULL;
		$data["dc_cost_id_new"] = 0;
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
		$sql = "UPDATE dc_asset
                        SET ta_date = NULL
                            ,dc_cost_id_ta = NULL
                        WHERE dc_asset_id in (SELECT dc_asset_id FROM {$tableDtl} WHERE {$keyName} = ?)";
		$arrParam = array($data["id"]);
		$stmt = $db->QueryParam($sql, $arrParam);
		
		$sql = "DELETE FROM {$table} WHERE {$keyName} = ?";
		$arrParam = array($data["id"]);
		$stmt2 = $db->QueryParam($sql, $arrParam);
		
		$sql = "DELETE FROM {$tableDtl} WHERE {$keyName} = ?";
		$arrParam = array($data["id"]);
		$stmt3 = $db->QueryParam($sql, $arrParam);
	break;
	case "GENCODE":
            $data = $util->mnUser($_REQUEST);
            list($dd, $mm, $yyyy) = explode("-",@$data["d_doc_date"]);
            $c_yyyy_mm = ($yyyy-543).$mm;
            $arrParamGencode	= array($code_gen,$c_yyyy_mm,$data["dc_user_update_id"],$data["dc_user_update_cost_id"],$data["id"]);
            $sqlGenCode     = "EXEC SP_GEN_CODE ?,?,?,?,?;";
            $stmtGenCode    = $db->QueryParam($sqlGenCode,$arrParamGencode);

            $arr_gen_code 	= $db->Fetch($stmtGenCode);
            $c_code 		= $arr_gen_code["c_code_gen"] ;
            $ref_id   		= $arr_gen_code["reference_id"] ;

            if ($data["id"]==$ref_id )
            {
                    $sql = "UPDATE {$table}
                    SET c_code_gen = ?
                    WHERE {$keyName} = ?;";

                    $stmt = $db->QueryParam($sql, array($c_code, $data["id"]));
            }
            $data["c_code_gen"] = $c_code;

            // อัพเดท หน่วยงานใหม่ลงตาราง dc_inv
            $sql = "update a
                    set a.bt_date = c.d_doc_date
                    from dc_asset a
                            inner join am_tf_dtl b on a.dc_asset_id = b.dc_asset_id
                            inner join am_tf_hdr c on b.am_tf_hdr_id = c.am_tf_hdr_id
                    where c.am_tf_hdr_id = ?";
            $stmt2 = $db->QueryParam($sql, array($data["id"]));
	break;
	case "RETIRE" :
            $data = $util->mnUser($_REQUEST, "ADD");
            $asset = @$_REQUEST["chk"];
            $hdr_id = $_REQUEST["am_tf_hdr_id"];
            $data["c_code_gen"] = $code_gen;
            if (is_array($asset))
            {
                $dc_cost_id_new = $db->GetDataBySQL("select dc_cost_id_new from am_tf_hdr where am_tf_hdr_id = ?", array($hdr_id));
                foreach($asset as $dc_asset_id)
                {
                    $sql = "declare @am_tf_hdr_id as bigint;
                            declare @dc_cost_id_new as bigint;
                            declare @dc_asset_id as bigint;

                            set @am_tf_hdr_id = ?;
                            set @dc_cost_id_new = ?;
                            set @dc_asset_id = ?;

                            insert into am_tf_dtl(am_tf_hdr_id, i_dispost_type, dc_asset_id, dc_cost_id_new
                                    , i_period_year, f_unit_cost, f_depreciate_cost
                                    , acc_tf_cost, c_comment, i_enable
                                    , dc_user_create_id, dc_user_create_cost_id, d_create
                                    , dc_user_update_id, dc_user_update_cost_id, d_update)
                            select @am_tf_hdr_id, 0, dc_asset_id, @dc_cost_id_new
                                    , i_period_year, f_unit_cost, f_depreciate_cost
                                    , isnull(f_unit_cost,0) - isnull(f_depreciate_cost,0) as acc_tf_cost, 0, ".STATUS_ENABLE."
                                    , ".$data["dc_user_create_id"].", ".$data["dc_user_create_cost_id"].", getdate()
                                    , ".$data["dc_user_update_id"].", ".$data["dc_user_update_cost_id"].", getdate()
                            from dc_asset
                            where dc_asset_id = @dc_asset_id;";
                    $stmt = $db->QueryParam($sql, array($hdr_id
                                                        , $dc_cost_id_new
                                                        , $dc_asset_id
                    )); 
                }// end foreach
            }else{
                $stmt = true;
            }
		
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
	$re = array("reval"=>0,"success"=>"Success","msg"=>"commit","hdr_id"=>$hdr_id,"c_code_gen"=>$data["c_code_gen"]);
}
else
{
	$db->RollBackTran();
	$re = array("reval"=>1,"success"=>"Error","msg"=>"check statement : {$sql}");
}
 
echo json_encode($re);
exit;

?>