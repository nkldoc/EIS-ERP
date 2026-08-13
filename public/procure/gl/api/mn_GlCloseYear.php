<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../../gl/conf/configGl.php");

$db		= new DatabaseServer();
$date	= new i_date();
$util	= new apiUtil();

// ========================= S A V E =============================== //

$mode		= @$_REQUEST["mode"];
$id			= @$_REQUEST["id"];
$table		= "gl_tran_hdr";
$keyName	= "gl_tran_hdr_id";

$data		= array();
$addField	= null;
$addValue	= null;
$arrValue	= array();


if (!$util->get($id)) { $id = 0; }

switch ($mode) {
	
	case "ADD" :

		$msg		= "";
		$c_yyyy_mm	= @$_REQUEST["c_yyyy"].$_REQUEST["c_mm"];
		
		$Arr_get[]	= $_REQUEST["i_close_year_type"];
		$Arr_get[]	= $_REQUEST["c_yyyy"];
		$Arr_get[]	= STATUS_ENABLE;
		$Arr_get[]	= GL_CLOSE_YEAR_PERIOD;
		
		$gl_tran_hdr_id	= $db->GetDataBySQL("SELECT gl_tran_hdr_id FROM gl_tran_hdr WHERE i_close_year_type=? AND c_yyyy=? AND i_enable=? AND i_is_close_year=? and i_is_post>1;", $Arr_get);
		
		if($gl_tran_hdr_id) { $msg .= "- มีรายการประเภทการโอนแล้ว<br>"; }
		
		if($msg != "") {
			$re = array( "msg" => $msg );
		} else {
			
			$data["gl_dc_book_type_id"]				= @$_REQUEST["gl_dc_book_type_id"];
			$data["d_doc_date"]						= @$_REQUEST["d_doc_date"];
			$data["d_save_date"]					= @$_REQUEST["d_save_date"];
			$data["c_ref_doc"]						= @$_REQUEST["c_ref_doc"];
			$data["c_yyyy_mm"]						= $c_yyyy_mm;
			$data["c_mm"]							= @$_REQUEST["c_mm"];
			$data["c_yyyy"]							= @$_REQUEST["c_yyyy"];
			$data["c_comment1"]						= @$_REQUEST["c_comment1"];
			$data["c_comment2"]						= @$_REQUEST["c_comment2"];
			$data["c_comment3"]						= @$_REQUEST["c_comment3"];
			$data["i_chk_gl_dtl"]					= 1; // 1
			$data["i_enable"]						= STATUS_ENABLE; // 1
			$data["i_is_post"]						= BOOK_ACC_NOT_POST;
			$data["i_is_reversing"]					= GL_REVERSE_FALSE;
			$data["i_is_close_year"]				= GL_CLOSE_YEAR_PERIOD; // 1 //เป็น
			$data["i_close_year_type"]				= @$_REQUEST["i_close_year_type"];
			$data["i_type"]							= GL_TYPE_AUTO; // 2 AUTO - GENERATE ให้เบื้องต้นจากระบบ
			$data["i_preview"]						= GL_PREVIEW_FALSE;
			$data["dc_user_create_id"]				= $_SESSION["user_id"];
			$data["dc_user_create_cost_id"]			= $_SESSION["dc_cost_id"];
			$data["d_create"]						= date("Y-m-d H:i:s");
			$data["dc_user_update_id"]				= $_SESSION["user_id"];
			$data["dc_user_update_cost_id"]			= $_SESSION["dc_cost_id"];
			$data["d_update"]						= date("Y-m-d H:i:s");
	
			foreach ($data as $fld => $value) {
				$arrValue[] = ($value != "")? $value : NULL;
				$addField .= ", {$fld}";
				$addValue .= ", ?";
			}
			$sql	= "	SET NOCOUNT ON
						INSERT INTO {$table} (".substr($addField, 1).") VALUES (".substr($addValue,1).");
						SELECT @@IDENTITY as gl_tran_hdr_id;";
	
			$para	= $db->QueryParam($sql, $arrValue);
			$ss_id	= $db->Fetch($para);
			$id		= $ss_id["gl_tran_hdr_id"];
			
			// ============== //
			$addField	= null;
			$addValue	= null;
			unset ($data);
			unset ($arrValue);
			// ============== //
			
			if($para) {			
				$FIXED_OCTOBER	 	 = "10";
				$FIXED_SEPTEMBER	 = "09";  
				
				$c_mm_october_prev		= $FIXED_OCTOBER;
				$c_mm_september_now		= $FIXED_SEPTEMBER;
				$c_yyyy_october_prev	= @$_REQUEST["c_yyyy"]-1;
				$c_yyyy_september_now	= @$_REQUEST["c_yyyy"];
				$c_yyyy_mm1				= "$c_yyyy_october_prev".$c_mm_october_prev;
				$c_yyyy_mm2				= "$c_yyyy_september_now".$c_mm_september_now;
 
	 
				switch ($_REQUEST["i_close_year_type"]) {
					
					case GL_CLOSE_YEAR_TYPE_M4 : // ปิดรายได้  ตุลาปีที่แล้ว - กันยาปีนี้			 
						$sql_close_year	= "EXEC SP_GL_CLOSE_YEAR1_REVENUE ?,?,?,?,?,?;";
						$sql_acc 		= "SELECT TOP 1 dc_acc_id FROM gl_dc_config WHERE i_config=? AND i_enable=?;";
						$dc_acc_id_sp	= $db->GetDataBySQL($sql_acc, array(GL_CFG_CLOSE_YEAR_ACC_PROFIT_YEAR,STATUS_ENABLE));
						$arrParam 		= array($c_yyyy_mm1,$c_yyyy_mm2,$id,$_SESSION["user_id"],$_SESSION["dc_cost_id"],$dc_acc_id_sp); 
						$chkDtl			= $db->QueryParam($sql_close_year,$arrParam);
						 
						break;
						
					case GL_CLOSE_YEAR_TYPE_M5 : // ปิดค่าใช้จ่าย
						
						$sql_close_year = "EXEC SP_GL_CLOSE_YEAR2_EXPENSE ?,?,?,?,?,?;";
						$sql_acc 		= "SELECT TOP 1 dc_acc_id FROM gl_dc_config WHERE i_config=? AND i_enable=?;";
						$dc_acc_id_sp	= $db->GetDataBySQL($sql_acc, array(GL_CFG_CLOSE_YEAR_ACC_PROFIT_YEAR,STATUS_ENABLE));
						$arrParam 		= array($c_yyyy_mm1,$c_yyyy_mm2, $id, $_SESSION["user_id"], $_SESSION["dc_cost_id"], $dc_acc_id_sp);
						$chkDtl 		= $db->QueryParam($sql_close_year,$arrParam);
						
						break;
						
					case GL_CLOSE_YEAR_TYPE_PROFIT : // โอนกำไร 
						 
						$sql_close_year 			= "EXEC SP_GL_CLOSE_YEAR3_PROFIT ?,?,?,?,?,?,?,?;";
						$sql_acc 					= "SELECT TOP 1 dc_acc_id FROM gl_dc_config WHERE i_config=? AND i_enable=?;";
						$dc_acc_id_sp				= $db->GetDataBySQL($sql_acc, array(GL_CFG_CLOSE_YEAR_ACC_PROFIT_YEAR,STATUS_ENABLE));							
						$sql_acc2 					= "SELECT TOP 1 dc_acc_id FROM gl_dc_config WHERE i_config=? AND i_enable=?;";
						$dc_acc_id_sp2				= $db->GetDataBySQL($sql_acc2, array(GL_CFG_CLOSE_YEAR_ACC_PROFIT_UNALLOCATE,STATUS_ENABLE));
						$sql_cost_hq 				= "SELECT TOP 1 dc_cost_acc_id FROM gl_dc_config WHERE i_config=? AND i_enable=?;";
						$dc_cost_acc_id_headquarter	= $db->GetDataBySQL($sql_cost_hq, array(GL_CFG_CLOSE_YEAR_COST_HEADQUARTER,STATUS_ENABLE));
						
						$arrParam 		= array($c_yyyy_mm1,$c_yyyy_mm2, $id, $_SESSION["user_id"], $_SESSION["dc_cost_id"], $dc_acc_id_sp, $dc_acc_id_sp2,77);						 
						$chkDtl 		= $db->QueryParam($sql_close_year,$arrParam);
 					
						break;
						
					case GL_CLOSE_YEAR_TYPE_DIVIDENCE : // โอนเงินปันผล
						
						$sql_close_year 			= "EXEC SP_GL_CLOSE_YEAR4_DIVIDENCE ?,?,?,?,?,?,?,?;";
						$sql_acc 					= "SELECT TOP 1 dc_acc_id FROM gl_dc_config WHERE i_config=? AND i_enable=?;";
						$dc_acc_id_sp				= $db->GetDataBySQL($sql_acc, array(GL_CFG_CLOSE_YEAR_ACC_DIVIDEND,STATUS_ENABLE));
						$sql_acc2 					= "SELECT TOP 1 dc_acc_id FROM gl_dc_config WHERE i_config=? AND i_enable=?;";
						$dc_acc_id_sp2				= $db->GetDataBySQL($sql_acc2, array(GL_CFG_CLOSE_YEAR_ACC_PROFIT_UNALLOCATE,STATUS_ENABLE));
						$sql_cost_hq 				= "SELECT TOP 1 dc_cost_acc_id FROM gl_dc_config WHERE i_config=? AND i_enable=?;";
						$dc_cost_acc_id_headquarter	= $db->GetDataBySQL($sql_cost_hq, array(GL_CFG_CLOSE_YEAR_COST_HEADQUARTER,STATUS_ENABLE));

						$arrParam 		= array($c_yyyy_mm1,$c_yyyy_mm2, $id, $_SESSION["user_id"], $_SESSION["dc_cost_id"], $dc_acc_id_sp, $dc_acc_id_sp2, $dc_cost_acc_id_headquarter);
						$chkDtl 		= $db->QueryParam($sql_close_year,$arrParam);
						
						break;
						
					default : $chkDtl 	= false;
					break;
				}
 
				// GEN CODE
				$arr_dtl	= $db->Fetch($chkDtl);

				$sql		= "EXEC SP_GEN_CODE ?,?,?,?,?;";
				$arrValue	= array("GX", $c_yyyy_mm, $_SESSION["user_id"], $_SESSION["dc_cost_id"], $id);
				
				$arr_gen_code	= $db->GetDataBySQL($sql, $arrValue);
				
				// ============== //
				$addField	= null;
				$addValue	= null;
				unset ($data);
				unset ($arrValue);
				// ============== //
			
				if ($id == $arr_gen_code["reference_id"]) {
				
					$sql		= "UPDATE {$table} SET c_code = ?, f_total_amt = ?, i_is_post = ?, i_preview = ? WHERE gl_tran_hdr_id = ?";
				
					$arrValue[] = $arr_gen_code["c_code_gen"];
					$arrValue[] = $arr_dtl["f_money_dr"];
					$arrValue[] = BOOK_ACC_GX;
					$arrValue[] = GL_PREVIEW_TRUE;
					$arrValue[] = $id;
					
					$para	= $db->QueryParam($sql, $arrValue);
					if($para) {
						$re	= array("success"	=> true,
									"msg"		=> "เลขที่เอกสาร : ".$arr_gen_code["c_code_gen"] );
						
					} else {
						$re = array("success"	=> false,
									"msg"		=> "error" );
					}
				}
				
			} else {
				$re = array( 	"success"	=> false,
								"msg"		=> "error" );
			}
		}
		
		echo json_encode($re);
		exit;
		break;
		
	case "EDIT" :

		$msg		= "";
		
		if($msg != "") {
			$re = array( "msg" => $msg );
		} else {
			
			$data["c_ref_doc"]						= @$_REQUEST["c_ref_doc"];
			$data["d_doc_date"]						= @$_REQUEST["d_doc_date"];
			$data["gl_dc_book_type_id"]				= @$_REQUEST["gl_dc_book_type_id"];
			$data["c_comment1"]						= @$_REQUEST["c_comment1"];
			$data["c_comment2"]						= @$_REQUEST["c_comment2"];
			$data["c_comment3"]						= @$_REQUEST["c_comment3"];
			$data["i_preview"]						= 1;
			$data["dc_user_update_id"]				= $_SESSION["user_id"];
			$data["dc_user_update_cost_id"]			= $_SESSION["dc_cost_id"];
			$data["d_update"]						= date("Y-m-d H:i:s");

			foreach ($data as $fld => $value) {
				$arrValue[] = ($value != "")? $value : NULL;
				$addField .= ", {$fld} = ?";
			}
			
			$arrValue[] = $id;
			$sql	= "UPDATE {$table} SET ".substr($addField, 1)." WHERE {$keyName} = ?";
			
			$para	= $db->QueryParam($sql, $arrValue);
			
			if($para) {
				$re	= array("success"	=> true,
							"id"		=> $id,
							"msg"		=> "success" );
			} else {
				$re = array("success"	=> false,
							"msg"		=> "error" );
			}
		}
		
		echo json_encode($re);
		exit;
		break;

	case "POST" :
		
		$id	= $_REQUEST["id"];

		$arr_gl	= $db->GetDataBySQL("SELECT LEFT(c_code,1) AS c_sub ,i_is_post ,c_yyyy_mm FROM {$table} WHERE {$keyName} = ?;",array($id));
		
		if ($arr_gl) {
			switch ($arr_gl["i_is_post"]) {
				
				case BOOK_ACC_GX : // GX 
									$sqlPost		= "EXEC SP_GL_POST_DAILY ?,?,?,?,?,?,?,?,?,?;";
									$arrParamPost   = array($arr_gl["c_yyyy_mm"],BOOK_ACC_GL_CODE,$_SESSION["user_id"],$_SESSION["dc_cost_id"],BOOK_ACC_GX,BOOK_ACC_GL,GL_CLOSE_YEAR_PERIOD,$_REQUEST["id"],GL_CFG_BOSS_ID,GL_CFG_BOSS_COST_ID);
									$iPostGL 		= $db->QueryParam($sqlPost,$arrParamPost);
									
									if($iPostGL){
										$re = array( "success" => true, "msg" => "" );
									} else {
										$re = array( "success" => false, "msg" => "ERROR POST CLOSE YEAR" );
									} 
						break;

				default : break;
			}
		} else {
			$re = array("success"	=> false,
						"msg"		=> "error" );
		}
		
		echo json_encode($re);
		exit;
		
		break;
				
	case "DELETE" :
		
		$arr_gl		= $db->GetDataBySQL("SELECT LEFT(c_code,1) AS c_sub, i_is_post FROM {$table} WHERE {$keyName} = ?;",array($id));
		
		if (($arr_gl["i_is_post"] > BOOK_ACC_NOT_POST) || ($arr_gl["c_sub"] == "G")) { //UPDATE ยกเลิก
			$arr_cancel 	= array( STATUS_DISABLE, $id );
			$iDelHDR		= $db->QueryParam("UPDATE {$table} SET i_enable=? WHERE $keyName = ?;",$arr_cancel);
			$isDelDtl		= true;
		
		} else { // ลบ รายการรอลงบัญชี
			$iDelHDR		= $db->QueryParam("DELETE FROM {$table} WHERE $keyName = ?;",array($id));
			$isDelDtl		= $db->QueryParam("DELETE FROM gl_tran_dtl WHERE $keyName = ?;",array($id));
		}
		
		if ( $iDelHDR && $isDelDtl ) {
			$re = array(
					"success"		=> true,
					"msg"			=> "success"
			);
		} else {
			$re = array(
					"success"		=> false,
					"msg"			=> "error"
			);
		}
		
		echo json_encode($re);
		exit;
		
		break;
		
	default : break;
}
?>
