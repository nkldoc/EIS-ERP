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
$table 		= "am_ins_hdr";
$tableDtl 	= "am_ins_dtl";
$keyName 	= "am_ins_hdr_id";
$code_gen	= "INS";
 
$data = $util->mnUser($_REQUEST);
$data["c_code"] = "";
$hdr_id = @$data["id"];

$fld = array("dc_cnt_id",
			"c_code",
			"c_name",
			"i_is_method",
			"price_at_date",
			"dc_building_id",
			"dc_ins_town_hdr_id",
			"d_doc_date",
			"d_start_ins",
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
		
		$data["c_code"] = "none";
		$data["d_doc_date"] = $date->bc_to_ad($data["d_doc_date"]);
		$data["d_start_ins"] = $date->bc_to_ad($data["d_start_ins"]);
		$data["price_at_date"] = $date->bc_to_ad($data["price_at_date"]);
		
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
		$data["d_start_ins"] = $date->bc_to_ad($data["d_start_ins"]);
		$data["price_at_date"] = $date->bc_to_ad($data["price_at_date"]);
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
		
		$sql = "DELETE FROM {$tableDtl} WHERE {$keyName} = ?";
		$arrParam = array($data["id"]);
		$stmt2 = $db->QueryParam($sql, $arrParam);
	break;
	case "GENCODE":
		$data = $util->mnUser($_REQUEST);
		
		$sqlCountDtl = "select count(dc_inv_id) from am_ins_dtl where am_ins_hdr_id = ?";
		$countDtl = $db->GetDataBySQL($sqlCountDtl, array($data["id"]));
		if ($countDtl > 0)
		{
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
				WHERE {$keyName} = ?;";
			
				$stmt = $db->QueryParam($sql, array($c_code, $data["id"]));
			}
			$data["c_code"] = $c_code;
		}
		else
		{
			$db->RollBackTran();
			$re = array("reval"=>0,"success"=>"Error","msg"=>"กรุณาบันทึกรายการสินทรัพย์ที่จะทำประกันภัยก่อน","hdr_id"=>$hdr_id,"c_code_gen"=>"");
			echo json_encode($re);
			exit;
		}
		
	break;
	case "INSERT_DTL" :
		$data = $util->mnUser($_REQUEST, "ADD");
		$arrAsset = @$_REQUEST["chk"];
		$hdr_id = $_REQUEST["id"];
		$dc_ins_town_hdr_id= $_REQUEST["dc_ins_town_hdr_id"];
		$data["c_code"] = $code_gen;
		if (is_array($arrAsset))
		{
			$db->GetDataBySQL("delete from am_ins_dtl where am_ins_hdr_id = ?", array($hdr_id));
			foreach($arrAsset as $dc_asset_id)
			{
				$sql = "declare @am_ins_hdr_id as bigint;
                                        declare @dc_ins_town_hdr_id as bigint;
                                        declare @dc_asset_id as bigint;

                                        set @am_ins_hdr_id = ?;
                                        set @dc_ins_town_hdr_id = ?;
                                        set @dc_asset_id = ?;

                                        insert into am_ins_dtl
                                        select @am_ins_hdr_id, b.c_name, @dc_ins_town_hdr_id
                                        , a.dc_asset_id, a.dc_cost_id, null as c_comment, ".STATUS_ENABLE."
                                        from dc_asset a
                                            inner join dc_cost b on a.dc_cost_id = b.dc_cost_id
                                        where a.dc_asset_id = @dc_asset_id;";
                                $stmt = $db->QueryParam($sql, array($hdr_id
                                                                    , $dc_ins_town_hdr_id
                                                                    , $dc_asset_id
				)); 
			}// end foreach
		}else{
			$stmt = true;
			
			$db->RollBackTran();
			$re = array("reval"=>0,"success"=>"Error","msg"=>"กรุณาเลือกรายการสินทรัพย์อย่างน้อง 1 รายการ","hdr_id"=>$hdr_id,"c_code_gen"=>$data["c_code"]);
			echo json_encode($re);
			exit;
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