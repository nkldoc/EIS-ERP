<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../conf/config_am.php");

$db = new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$mode		= $_REQUEST["mode"];
$table 		= "am_tran_rg_hdr";
$tableDtl 	= "am_tran_rg_dtl";
$keyName 	= "am_tran_rg_hdr_id";
$keyDtlName	= "am_tran_rg_dtl_id";
$code_gen	= "SD";
 
$data = $util->mnUser($_REQUEST);
$data["i_is_status"] = @$data["dc_asset_method_id"];
$data["d_doc_date"]	= (!empty($data["d_doc_date"]))? $date->bc_to_ad($data["d_doc_date"]) : null;
$data["c_code"] = $code_gen;
$hdr_id = $data["id"];
 
$fld = array("c_code",
			"c_name",
			"i_is_success",
			"i_is_status",
			"i_is_ruins",
			"d_doc_date",
			"i_is_show",
			"c_comment",
			"i_enable",
			"dc_user_create_id",
			"dc_user_create_cost_id",
			"d_create",
			"dc_user_update_id",
			"dc_user_update_cost_id",
			"d_update");

$fld_dtl = array("am_tran_rg_hdr_id",
                    "ins_is_method", 
                    "i_is_ins",
                    "c_code", 
                    "c_name", 
                    "c_brand", 
                    "c_model", 
                    "c_serial", 
                    "c_type", 
                    "c_method_type", 
                    "c_number_body", 
                    "c_number_mech", 
                    "c_car_license", 
                    "c_asset_code_old", 
                    "c_cost_asset", 
                    "c_cost_ruins", 
                    "c_ext_cnt", 
                    "f_depreciate",
                    "p_area", 
                    "p_deed", 
                    "p_num_area", 
                    "p_division", 
                    "p_province", 
                    "dc_cost_id", 
                    "dc_asset_method_id", 
                    "d_register_date", 
                    "d_receive_date", 
                    "d_start_warranty", 
                    "d_end_warranty", 
                    "i_period_year", 
                    "i_is_expense", 
                    "i_is_success", 
                    "i_is_register", 
                    "i_is_download", 
                    "i_is_out_side", 
                    "i_is_audit", 
                    "i_is_split", 
                    "d_depreciate", 
                    "dc_cost_id_tranfer", 
                    "f_depreciate_bal", 
                    "dc_cost_old_id", 
                    "c_doc_imp", 
                    "d_doc_imp", 
                    "c_comment", 
                    "i_enable", 
                    "dc_user_create_id", 
                    "dc_user_create_cost_id", 
                    "d_create", 
                    "dc_user_update_id", 
                    "dc_user_update_cost_id", 
                    "d_update", 
				);
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
        foreach($fld as $value)
        {
            if (!empty($data[$value]))
            {
                    $addField .= ", {$value}";
                    $addValue .= ", ?";
                    $arrParam[] = $data[$value];
            } else if ($value == "i_is_show" || $value == "i_is_success") {
                    $addField .= ", {$value}";
                    $addValue .= ", ?";
                    $arrParam[] = 0;
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
        $stmt2 = true;	$stmt3 = true;
        $sql = "DELETE FROM {$table} WHERE {$keyName} = ?";
        $arrParam = array($data["id"]);
        $stmt = $db->QueryParam($sql, $arrParam);

        $sql = "DELETE FROM {$tableDtl} WHERE {$keyName} = ?";
        $arrParam = array($data["id"]);
        $stmt2 = $db->QueryParam($sql, $arrParam);
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
			WHERE {$keyName} = ?;";
	
			$stmt = $db->QueryParam($sql, array($c_code, $data["id"]));
		}
	
		$data["c_code"] = $c_code;
	break;
	case "IMPORT_EXCEL" :
		$n				= 1; // run เลขแถว
		$path_upload	= "../import/upload/";
		$uploadfile		= $path_upload.$_FILES["dtl_import"]["name"];
		move_uploaded_file($_FILES["dtl_import"]["tmp_name"], $uploadfile); //ย้ายไฟล์จาก Tmp มาไว้โฟรเดอร์ที่กำหนด
		$handle = @fopen($uploadfile,"r"); //เปิดใช้ไฟล์
	
		$msg	= "";
	
		if($handle != "") {
			$copy_data	= array();
			$copy_field = array();
				
			while ($data = fgetcsv($handle, 1000, ",")) {
				if ($n == 2)
				{
					foreach ($data as $kk=>$vv){
						$copy_field[$kk]=str_replace(' ',"",$vv);
					}
					
					$copy_field[] = "am_tran_rg_hdr_id";
					$copy_field[] = "i_is_download";
				}
				else if($n >= 3) {
					$data_insert = array();
					$data_insert["i_is_expense"] = ASSET_CAL_NO;
					foreach($copy_field as $key => $value)
					{
						if ($value == "c_code") // ตรวจสอบรหัสสินทรัพย์
						{
							$strl = strlen($data[$key]);
							if ($strl%2 == 1)
								$data_insert[$value] = "0".$data[$key];
							else
								$data_insert[$value] = $data[$key];
						}
						else if ($value == "d_register_date" 
								|| $value == "d_receive_date" 
								|| $value == "d_start_warranty" 
								|| $value == "d_end_warranty" 
								|| $value == "d_depreciate")
						{
							if ($data[$key] == "")
								$data_insert[$value] = NULL;
							else 
								$data_insert[$value] = $data[$key];
						}
						else if ($value == "am_tran_rg_hdr_id")
							$data_insert[$value] = $hdr_id;
						else if ($value == "i_is_download")
							$data_insert[$value] = 1;
						else
							$data_insert[$value] = iconv("tis-620", "utf-8", $data[$key]);
					}
					
					$copy_data[] = $data_insert;
				}
				$n++;
			}

			//===== insert
			foreach ($copy_data as $data) {
				$data["dc_user_create_id"] = $_SESSION["user_id"];
				$data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
				$data["d_create"] = date("Y-m-d H:i:s");
				$data["dc_user_update_id"] = $_SESSION["user_id"];
				$data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
				$data["d_update"] = date("Y-m-d H:i:s");
				
				$addField = "";
				$addValue = "";
				foreach ($data as $fld => $value) {
					if ($value != "")
					{
						$addField .= ", {$fld}";
						$addValue .= ", '{$value}'";
					}
				}
				$sql	= "INSERT INTO am_tran_rg_dtl (".substr($addField, 1).") VALUES (".substr($addValue,1).")";
				$db->Query($sql);
			}
			$db->CommitTran();
			$re = array("success" => true, "debug" => true, "hdr_id" => $hdr_id);
			fclose($handle);
				
		} else { 
			$db->RollBackTran();
			$re = array("success" => true, "debug" => false, "msg" => "ไฟล์ที่เลือกผิดพลาด"); }
	
		echo json_encode($re);
		exit;
	break;
    case "ADD_DTL" :
        $data = $util->mnUser($_REQUEST, "ADD");
        $data["c_code"] = $data["asset_code"];
        $data["i_is_expense"] = ASSET_CAL_NO;
        if ($data["asset_type"] == ASSET_TYPE_LAND){ // ที่ดิน
            $data['c_brand'] = "";
            $data['c_serial']  = "";
            $data['c_model']  = "";
            $data['c_type']  = "";
            $data['c_number_body']  = "";
            $data['c_number_mech']  = "";
            $data['c_car_license']  = "";
            $data['c_asset_code_old']  = "";
            $data['c_cost_ruins']  = "";
            $data['i_period_year']  = "";
            $data['f_depreciate']  = "";
            $data['d_depreciate']  = "";
            $data['ins_is_method']  = "";
            $data['i_is_ins']  = "";
        } else if($data["asset_type"] == ASSET_TYPE_EQUIP){ // อาคารและอุปกรณ์
            $data['p_province']  = "";
            $data['p_area']  = "";
            $data['p_deed']  = "";
            $data['c_number_body']  = "";
            $data['c_number_mech']  = "";
            $data['c_car_license']  = "";
        } else if ($data["asset_type"] == ASSET_TYPE_VEHICLE){ // พาหนะ
            $data['p_province']  = "";
            $data['p_area']  = "";
            $data['p_deed']  = "";
            $data['c_type']  = "";
        }
		
        $arrParam = array();
        $addField = "";
        $addValue = "";

        foreach($fld_dtl as $value)
        {
            if (!empty($data[$value]))
            {
                $addField .= ", {$value}";
                $addValue .= ", ?";
                $arrParam[] = $data[$value];
            } else if ($value == "ins_is_method" || $value == "i_is_ins") {
                $addField .= ", {$value}";
                $addValue .= ", ?";
                $arrParam[] = 0;
            } else {
                $addField .= ", {$value}";
                $addValue .= ", ?";
                $arrParam[] = null;
            }
        }
		
        $sql = "INSERT INTO {$tableDtl} (".substr($addField, 1).") VALUES (".substr($addValue,1).")";
        $stmt = $db->QueryParam($sql, $arrParam);	
    break;
    case "EDIT_DTL" :
        $stmt2 = true;	$stmt3 = true;
        $arrParam = array();
        $upField = "";
        $data["c_code"] = $data["asset_code"];
        if ($data["asset_type"] == ASSET_TYPE_LAND){ // ที่ดิน
            $data['c_brand'] = "";
            $data['c_serial']  = "";
            $data['c_model']  = "";
            $data['c_type']  = "";
            $data['c_number_body']  = "";
            $data['c_number_mech']  = "";
            $data['c_car_license']  = "";
            $data['c_asset_code_old']  = "";
            $data['c_cost_ruins']  = "";
            $data['i_period_year']  = "";
            $data['f_depreciate']  = "";
            $data['d_depreciate']  = "";
            $data['ins_is_method']  = "";
            $data['i_is_ins']  = "";
        } else if($data["asset_type"] == ASSET_TYPE_EQUIP){ // อาคารและอุปกรณ์
            $data['p_province']  = "";
            $data['p_area']  = "";
            $data['p_deed']  = "";
            $data['c_number_body']  = "";
            $data['c_number_mech']  = "";
            $data['c_car_license']  = "";
        } else if ($data["asset_type"] == ASSET_TYPE_VEHICLE){ // พาหนะ
            $data['p_province']  = "";
            $data['p_area']  = "";
            $data['p_deed']  = "";
            $data['c_type']  = "";
        }
        foreach($fld_dtl as $value)
        {
            if (!empty($data[$value]))
            {
                $upField .= ", {$value} = ?";
                $arrParam[] = $data[$value];
            } else if ($value == "ins_is_method" || $value == "i_is_ins") {
                $upField .= ", {$value} = ?";
                $arrParam[] = 0;
            } else {
                $upField .= ", {$value} = ?";
                $arrParam[] = null;
            }
        }
        $sql = "UPDATE {$tableDtl}
        SET ".substr($upField, 1)."
        WHERE {$keyDtlName} = ?";

        $arrParam[] = $data["id"];
        $stmt = $db->QueryParam($sql, $arrParam);
    break;
    case "DELETE_DTL" :
        $stmt2 = true;	$stmt3 = true;
        $sql = "DELETE FROM {$tableDtl} WHERE {$keyDtlName} = ?";
        $arrParam = array($data["id"]);
        $stmt = $db->QueryParam($sql, $arrParam);
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