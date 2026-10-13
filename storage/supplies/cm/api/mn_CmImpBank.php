<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db		= new DatabaseServer();
$date 	= new i_date();

$root		= "data";
$data		= array();

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
			
			$sum_amount			= 0;
			$sum_balance		= 0;
			
			while ($obj = fgetcsv($handle, 1000, ",")) {
				foreach($obj as $key => $value) {
 					$data_conv[$key] = iconv("tis-620", "utf-8", $obj[$key]);
//					$data_conv	= $obj;
				}
				
				if($n >= 2) { //เช็คข้อมูลตั้งแต่บรรทัดที่ 2 ของไฟล์ Excel
					
					$temp			= array();

					++$totalCount;

					$d_doc_date			= ($obj["0"] != "")? date("Y-m-d H:i:s", strtotime($obj["0"])) : "";
						
					$temp["no"]					= $totalCount;
					$temp["id"]					= $totalCount;
					$temp["d_doc_date"]			= $d_doc_date;
					$temp["d_doc_date_show"]	= ($d_doc_date != "")? $date->extDateBuddha($d_doc_date) : "";
					$temp["teller_id"]			= $data_conv["1"];
					$temp["transaction_code"]	= $data_conv["2"];
					$temp["description"]		= $data_conv["3"];
					$temp["cheque_no"]			= $data_conv["4"];
					$temp["i_cheque"]			= ($data_conv["4"] != "")? 1 : 2;
					$temp["f_amount"]			= str_replace(",","",$data_conv["5"]);
					$temp["f_balance"]			= str_replace(",","",$data_conv["6"]);
					$temp["init_br"]			= $data_conv["7"];

					${$root}[] = $temp;
					
					$sum_amount			+= $temp["f_amount"];
					$sum_balance		+= $temp["f_balance"];
					
					$n++;
					
				} else { $n++; }
			}
			
			fclose($handle);
			
			$re	= array( "success" => true, "debug"=>true, $root=>${$root}, "msg" => $msg, "totalCount"=>$totalCount,
						"sum_amount" => $sum_amount, "sum_balance" => $sum_balance);
				
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
		$data["c_comment"]								= $_REQUEST["c_comment"];
		$data["d_imp_date"]								= $_REQUEST["d_imp_date"];
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
						INSERT INTO {$_REQUEST["table"]}_hdr (".substr($addField, 1).") VALUES (".substr($addValue,1).");
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
			$sql		= "UPDATE {$_REQUEST["table"]}_hdr SET ".substr($addField, 1)." WHERE {$_REQUEST["table"]}_hdr_id = ?";
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
						$_REQUEST["table"]."_hdr_id"	=> $id,
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
		
		$db->QueryParam("DELETE {$_REQUEST["table"]}_dtl WHERE {$_REQUEST["table"]}_hdr_id = ?;", array($_REQUEST["id"]));
		
		// ========================= add dtl ========================= //
		$Arr	= json_decode($_REQUEST["data"], true);
		foreach( $Arr as $fld ) {
			
			// ================== INSERT DTL ================== //
			$data["{$_REQUEST["table"]}_hdr_id"]			= $_REQUEST["id"];
			$data["d_doc_date"]								= $fld["d_doc_date"];
			$data["teller_id"]								= $fld["teller_id"];
			$data["transaction_code"]						= $fld["transaction_code"];
			$data["description"]							= $fld["description"];
			$data["cheque_no"]								= $fld["cheque_no"];
			$data["i_cheque"]								= $fld["i_cheque"];
			$data["f_amount"]								= ($fld["f_amount"] != "NaN")? $fld["f_amount"] : 0;
			$data["f_balance"]								= ($fld["f_balance"] != "NaN")? $fld["f_balance"] : 0;
			$data["init_br"]								= $fld["init_br"];
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
			
			$sql	= "INSERT INTO {$_REQUEST["table"]}_dtl (".substr($addField, 1).") VALUES (".substr($addValue,1).");";
			
			$db->QueryParam($sql, $arrValue);
			
			// ============== //
			$addField	= null;
			$addValue	= null;
			unset ($data);
			unset ($arrValue);
			// ============== //
			
			$re	= array("success"=>true, "{$_REQUEST["table"]}_hdr_id"=>$_REQUEST["id"]);
		}
		
		if( $mode == "GENCODE" ) {
			
			$msg	= "";
			
			$imp	= $db->GetDataBySQL("SELECT
											a.{$_REQUEST["table"]}_hdr_id
											,a.c_code
										FROM {$_REQUEST["table"]}_hdr a WHERE {$_REQUEST["table"]}_hdr_id=?;", array($_REQUEST["id"]));
			
			if( $imp["c_code"] != "0" && $imp["c_code"] != "" ) {
				$msg	.= "- เลขที่เอกสารนี้ออกเลขแล้ว <font color='blue'><b>".$imp["c_code"]."</b></font><br>";
			}

			if( $msg != "" ) {
				$re	= array("success" => false, "msg" => $msg, "{$_REQUEST["table"]}_hdr_id" => $_REQUEST["id"]);
			} else {

				list($yyyy,$mm,$dd)	= explode("-", date("Y-m-d"));
				$sql		= "EXEC SP_GEN_CODE ?,?,?,?,?;";
				
				$arrValue[]	= "IMPB";
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
					$sql		= "UPDATE {$_REQUEST["table"]}_hdr SET ".substr($addField, 1)." WHERE {$_REQUEST["table"]}_hdr_id = ?";
					$para		= $db->QueryParam($sql, $arrValue);

					// ============== //
					$addField	= null;
					$addValue	= null;
					unset ($data);
					unset ($arrValue);
					// ============== //

					if($para) {
						
						$msg	= "รหัสข้อมูลธนาคาร : <b style='color:blue;'>".$arr_gen_code["c_code_gen"]."</b><br>";
						
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
		
		$c_code	= $db->GetDataBySQL("SELECT c_code FROM {$_REQUEST["table"]}_hdr WHERE {$_REQUEST["table"]}_hdr_id=?;", array($_REQUEST["id"]));
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
			$sql		= "UPDATE {$_REQUEST["table"]}_hdr SET ".substr($addField, 1)." WHERE {$_REQUEST["table"]}_hdr_id = ?";
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
			
			$db->QueryParam("DELETE {$_REQUEST["table"]}_dtl WHERE {$_REQUEST["table"]}_hdr_id=?;", array($_REQUEST["id"]));
			$db->QueryParam("DELETE {$_REQUEST["table"]}_hdr WHERE {$_REQUEST["table"]}_hdr_id=?;", array($_REQUEST["id"]));

			$re = array("success"		=> true,
						"msg"			=> "ลบรายการเรียบร้อย"
			);
		}
	
		break;
}
echo json_encode($re);
exit;
?>
