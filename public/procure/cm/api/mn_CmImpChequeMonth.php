<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db		= new DatabaseServer();
$date 	= new i_date();

$root		= "data";
$data		= array();

$table	= "cm_imp_cheque_month_hdr";
$key_id	= "cm_imp_cheque_month_hdr_id";

$mode		= $_REQUEST["mode"];
$arrParam	= array();
$addField	= null;
$addValue	= null;
$arrValue	= array();

switch ( $mode ) {
	
	case "IMPORT_EXCEL" :
		
		$msg	= "";

		$path_upload	= "../upload/";
		$uploadfile		= $path_upload.$_FILES["dtl_import"]["name"];
		move_uploaded_file($_FILES["dtl_import"]["tmp_name"], $uploadfile); //ย้ายไฟล์จาก Tmp มาไว้โฟรเดอร์ที่กำหนด
		$handle = @fopen($uploadfile,"r"); //เปิดใช้ไฟล์
		
		if($handle != "") {
			
			$totalCount	= 0;
			$n			= 1; // run เลขแถว
			
			$data_sum		= array();
			$sum_dr			= 0;
			$sum_cr			= 0;
			$sum_balance	= 0;
			
			while ($obj = fgetcsv($handle, 1000, ",")) {
				foreach($obj as $key => $value) {
					$data_conv[$key] = iconv("tis-620", "utf-8", $obj[$key]);
				}
				
				if($n >= 2) { //เช็คข้อมูลตั้งแต่บรรทัดที่ 2 ของไฟล์ Excel
					
					$temp			= array();

					++$totalCount;
					
					$d_cheque			= ($obj["0"] != "")? date("Y-m-d", strtotime($obj["0"])) : "";
					
					$temp["no"]					= $totalCount;
					$temp["id"]					= $totalCount;
					$temp["d_cheque"]			= $d_cheque;
					$temp["d_cheque_show"]		= ($d_cheque != "")? $date->extDateBuddha($d_cheque) : "";
					$temp["c_doc"]				= $data_conv["1"];
					$temp["c_name"]				= $data_conv["2"];
					$temp["f_dr"]				= str_replace(",","",$data_conv["3"]);
					$temp["f_cr"]				= str_replace(",","",$data_conv["4"]);
					$temp["f_balance"]			= str_replace(",","",$data_conv["5"]);

					${$root}[] = $temp;
					
					$sum_dr			+= $temp["f_dr"];
					$sum_cr			+= $temp["f_cr"];
					$sum_balance	+= $temp["f_balance"];
					
					$n++;
					
				} else { $n++; }
			}
						
			fclose($handle);
			
			$re	= array( "success" => true, "debug"=>true, $root=>${$root}, "msg" => $msg, "totalCount"=>$totalCount,
							"sum_dr" => $sum_dr, "sum_cr" => $sum_cr, "sum_balance" => $sum_balance);
				
		} else {
			$re	= array("success" => true, "debug" => false, "id" => $_REQUEST["id"], "msg" => "ไฟล์ที่เลือกผิดพลาด");
		}
		
		break;

	case "ADD" :
	case "EDIT" :
	
		$msg	= "";
		
		if( $mode == "ADD" ) {
			$data["dc_user_create_id"]						= $_SESSION["user_id"];
			$data["dc_user_create_cost_id"]					= $_SESSION["dc_cost_id"];
			$data["d_create"]								= date("Y-m-d H:i:s");
		}
		
		$data["dc_bank_acc_company_id"]					= $_REQUEST["dc_bank_acc_company_id"];
		$data["d_doc_date"]								= $_REQUEST["d_doc_date"];
		$data["c_comment"]								= $_REQUEST["c_comment"];
		$data["i_enable"]								= STATUS_ENABLE;
		$data["dc_user_update_id"]						= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]					= $_SESSION["dc_cost_id"];
		$data["d_update"]								= date("Y-m-d H:i:s");
	
		if( $mode == "ADD" ) {
	
			foreach ($data as $fld => $value) {
				$arrValue[] = ($value != "")? $value : NULL;
				$addField .= ", {$fld}";
				$addValue .= ", ?";
			}
	
			$sql	= "	SET NOCOUNT ON
						INSERT INTO {$table} (".substr($addField, 1).") VALUES (".substr($addValue,1).");
						SELECT @@IDENTITY as id;";
	
			$para	= $db->QueryParam($sql, $arrValue);
			$ss_id	= $db->Fetch($para);
			$id		= $ss_id["id"];
	
		} else if ( $mode == "EDIT" ) {
	
			foreach ($data as $fld => $value) {
				$arrValue[]	= ($value != "")? $value : NULL;
				$addField	.= ", {$fld} = ?";
			}
	
			$arrValue[] = $_REQUEST["id"];
			$sql		= "UPDATE {$table} SET ".substr($addField, 1)." WHERE {$key_id} = ?";
			$para		= $db->QueryParam($sql, $arrValue);
			$id			= $_REQUEST["id"];
		}
	
		// ============== //
		$addField	= null;
		$addValue	= null;
		unset ($data);
		unset ($arrValue);
		// ============== //
		
		if( @$para ) {
			$re = array("success"					=> true,
						$key_id						=> $id,
						"msg"						=> ""
			);
		} else {
			$re = array("success"					=> false,
						"msg"						=> $msg
			);
		}
	
		break;
	
	case "SAVE_DTL" :
	case "GENCODE" :
		
		$db->QueryParam("DELETE cm_imp_cheque_month_dtl WHERE cm_imp_cheque_month_hdr_id = ?;", array($_REQUEST["id"]));
		// ========================= add dtl ========================= //
		$Arr	= json_decode($_REQUEST["data"], true);
		foreach( $Arr as $fld ) {
			
			// ================== INSERT DTL ================== //
			$data["cm_imp_cheque_month_hdr_id"]				= $_REQUEST["id"];
			$data["c_doc"]									= $fld["c_doc"];
			$data["d_cheque"]								= $fld["d_cheque"];
			$data["c_name"]									= $fld["c_name"];
			$data["f_dr"]									= $fld["f_dr"];
			$data["f_cr"]									= $fld["f_cr"];
			$data["f_balance"]								= $fld["f_balance"];
			$data["dc_user_create_id"]						= $_SESSION["user_id"];
			$data["dc_user_create_cost_id"]					= $_SESSION["dc_cost_id"];
			$data["d_create"]								= date("Y-m-d H:i:s");
			$data["dc_user_update_id"]						= $_SESSION["user_id"];
			$data["dc_user_update_cost_id"]					= $_SESSION["dc_cost_id"];
			$data["d_update"]								= date("Y-m-d H:i:s");

			foreach ($data as $fld => $value) {
				$arrValue[]	= ($value != "")? $value : NULL;
				$addField	.= ", {$fld}";
				$addValue	.= ", ?";
			}
			
			$sql	= "INSERT INTO cm_imp_cheque_month_dtl (".substr($addField, 1).") VALUES (".substr($addValue,1).");";
			$db->QueryParam($sql, $arrValue);
			
			// ============== //
			$addField	= null;
			$addValue	= null;
			unset ($data);
			unset ($arrValue);
			// ============== //
			
			$re	= array("success"=>true, "cm_imp_cheque_month_hdr_id"=>$_REQUEST["id"]);
		}
		
		if( $mode == "GENCODE" ) {
			
			$msg	= "";
			
			$imp	= $db->GetDataBySQL("SELECT
											a.c_code
											,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
										FROM {$table} a WHERE {$key_id}=?;", array($_REQUEST["id"]));
			
			if( $imp["c_code"] != "0" && $imp["c_code"] != "" ) {
				$msg	.= "- เลขที่เอกสารนี้ออกเลขแล้ว <font color='blue'><b>".$imp["c_code"]."</b></font><br>";
			}

			if( $msg != "" ) {
				$re	= array("success" => false, "msg" => $msg, "cm_imp_cheque_month_hdr_id" => $_REQUEST["id"]);
			} else {
				
				// ====================== GEN GX ====================== //
				list($yyyy,$mm,$dd)	= explode("-", $imp["d_doc_date"]);
				$sql		= "EXEC SP_GEN_CODE ?,?,?,?,?;";
				
				$arrValue[]	= "IMPCM";
				$arrValue[]	= $yyyy.$mm;
				$arrValue[]	= $_SESSION["user_id"];
				$arrValue[]	= $_SESSION["dc_cost_id"];
				$arrValue[]	= $_REQUEST["id"];
				
				$arr_gen_code	= $db->GetDataBySQL($sql, $arrValue);
				
				// ============== //
				$addField	= null;
				$addValue	= null;
				unset ($data);
				unset ($arrValue);
				// ============== //
							
				if ($_REQUEST["id"] == $arr_gen_code["reference_id"]) {
					
					$data["c_code"]							= $arr_gen_code["c_code_gen"];
					$data["dc_user_update_id"]				= $_SESSION["user_id"];
					$data["dc_user_update_cost_id"]			= $_SESSION["dc_cost_id"];
					$data["d_update"]						= date("Y-m-d H:i:s");
					
					foreach ($data as $fld => $value) {
						$arrValue[]	= ($value != "")? $value : NULL;
						$addField	.= ", {$fld} = ?";
					}
					
					$arrValue[] = $_REQUEST["id"];
					$sql		= "UPDATE {$table} SET ".substr($addField, 1)." WHERE {$key_id} = ?";
					$para		= $db->QueryParam($sql, $arrValue);

					// ============== //
					$addField	= null;
					$addValue	= null;
					unset ($data);
					unset ($arrValue);
					// ============== //

					if($para) {
						
						$msg	= "รหัสข้อมูลเช็ค : <b style='color:blue;'>".$arr_gen_code["c_code_gen"]."</b><br>";
						
						$re = array("success"	=> true,
									"msg"		=> $msg
						);
					}
				}
			}
		}	
		// =========================================================== //
		
		echo json_encode($re);
		exit;
		break;

	case "DELETE" :
		
		$c_code	= $db->GetDataBySQL("SELECT c_code FROM {$table} WHERE {$key_id}=?;", array($_REQUEST["id"]));
		if( $c_code != "0" && $c_code != "" ) { // ปรับสถานะเป็นไม่ใช้งาน
			
			$data["i_enable"]								= STATUS_DISABLE;
			$data["dc_user_update_id"]						= $_SESSION["user_id"];
			$data["dc_user_update_cost_id"]					= $_SESSION["dc_cost_id"];
			$data["d_update"]								= date("Y-m-d H:i:s");
			
			foreach ($data as $fld => $value) {
				$arrValue[]	= ($value != "")? $value : NULL;
				$addField	.= ", {$fld} = ?";
			}
			
			$arrValue[] = $_REQUEST["id"];
			$sql		= "UPDATE {$table} SET ".substr($addField, 1)." WHERE {$key_id} = ?";
			$para		= $db->QueryParam($sql, $arrValue);
			
			if( $para ) {
				$re = array("success"		=> true,
							"msg"			=> "ปรับสถานะเป็นไม่ใช้งาน"
				);
			} else {
				$re = array("success"		=> false,
							"msg"			=> "error"
				);
			}
			
		} else { // ลบจริง
			
			$db->QueryParam("DELETE cm_imp_cheque_month_dtl WHERE {$key_id}=?;", array($_REQUEST["id"]));
			$db->QueryParam("DELETE {$table} WHERE {$key_id}=?;", array($_REQUEST["id"]));

			$re = array("success"		=> true,
						"msg"			=> "ลบรายการเรียบร้อย"
			);
		}
	
		break;
}
echo json_encode($re);
exit;
?>
