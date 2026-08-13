<?php
include("../../conf/config.php");
include("../conf/configGl.php");
include("../../lib/database/DatabaseServer.php");
$db = new DatabaseServer();

$type		= $_REQUEST["type"];
$arrParam	= array();
$data		= array();
$addField	= null;
$addValue	= null;
$arrValue	= array();

switch ( $type ) {
	
	case "FI_PV_TYPE_BR" : //เงินยืม (BR)
	
// 		$TEMP_NAME	= "#TEMP_DATA_".$_SESSION["user_id"].DATE("YmdHis");
		
		//===== INSERT GL + UPDATE MONEY_TOT @ GL_TRAN_HDR + CHECK DUPLICATE ====//
// 		$gl_dc_book_type_id	= $db->GetDataBySQL("SELECT TOP 1 ISNULL(gl_dc_book_type_id,0) FROM gl_dc_book_doc WHERE c_code=substring(?,1,2)", array("PV"));
	
// 		if ( $gl_dc_book_type_id != "" ) {
			
// 			$fi	= $db->GetDataBySQL("SELECT
// 										CONVERT(VARCHAR, d_doc_date_pv, 120) AS d_doc_date_pv
// 										,(SELECT TOP 1 bb.c_code FROM fi_pymt_voucher_dtl aa INNER JOIN fi_br bb ON aa.fi_br_id=bb.fi_br_id WHERE aa.cm_voucher_one_id=a.cm_voucher_one_id) AS c_name
// 										,c_code_pv
// 									FROM cm_voucher_one a WHERE cm_voucher_one_id=?", array($_REQUEST["cm_voucher_one_id"]));

// 			$data["gl_dc_book_type_id"]		= $gl_dc_book_type_id;
// 			$data["c_code"]					= "0";
// 			$data["c_ref_doc"]				= $fi["c_code_pv"];
// 			$data["d_doc_date"]				= $fi["d_doc_date_pv"];
// 			$data["i_enable"]				= STATUS_ENABLE;
// 			$data["i_is_post"]				= 1;
// 			$data["dc_user_create_id"]		= $_SESSION["user_id"];
// 			$data["dc_user_create_cost_id"]	= $_SESSION["dc_cost_id"];
// 			$data["d_create"]				= date("Y-m-d H:i:s");
// 			$data["i_is_reversing"]			= 2;
// 			$data["i_is_close_year"]		= 2;
// 			$data["i_close_year_type"]			= 9;
// 			$data["table_pk_id"]			= $_REQUEST["cm_voucher_one_id"];
// 			$data["table_name"]				= "cm_voucher_one";
// 			$data["table_detail"]			= "ใบสำคัญจ่ายเงิน";
// 			$data["c_code_post"]			= "0";
// 			$data["i_type"]					= 2;
// 			$data["i_preview"]				= 1;
// 			$data["c_comment1"]				= "จ่ายเงินกรณีขอยืมเงินทดรอง ".$fi["c_name"];
// 			$data["i_chk_gl_dtl"]			= GL_CHK_DTL_FALSE; // 2 ยังไม่ตรวจสอบ/ตรวจสอบแล้วไม่ผ่าน
// 			$data["i_chk_gl_purchase"]		= GL_CHK_VAT_TRUE; // 1 ตรวจสอบผ่านแล้ว
	
// 			foreach ($data as $fld => $value) {
// 				$addField .= ", {$fld}";
// 				$addValue .= ", ?";
// 				$arrValue[] = $value;
// 			}
			
// 			$borrow_acc_code	= "1111010101"; // เงินยืมทดรอง

// 			$sqlMain	= "	DECLARE	@c_ref_doc				VARCHAR(20)	= '{$fi["c_code_pv"]}';
// 							DECLARE	@cm_voucher_one_id	NUMERIC		= {$_REQUEST["cm_voucher_one_id"]};
// 							DECLARE	@gl_tran_hdr_id 		NUMERIC;
// 							DECLARE	@n_gl					INTEGER		= 0;

// 							SELECT @n_gl = ISNULL(COUNT(gl_tran_hdr_id),0) FROM gl_tran_hdr WHERE c_ref_doc=@c_ref_doc AND i_is_post IN (2,3) AND i_enable=1; 
	
// 							IF ( @n_gl=0 )
// 							BEGIN

// 								DELETE FROM gl_tran_dtl WHERE gl_tran_hdr_id IN (SELECT gl_tran_hdr_id FROM gl_tran_hdr WHERE table_name='cm_voucher_one' AND table_pk_id=@cm_voucher_one_id AND i_is_post=1)
// 								DELETE FROM gl_tran_hdr WHERE table_name='cm_voucher_one' AND table_pk_id=@cm_voucher_one_id AND i_is_post=1

// 								INSERT INTO gl_tran_hdr (".substr($addField, 1).") VALUES (".substr($addValue,1).")

// 								SET @gl_tran_hdr_id=@@IDENTITY

// 								SELECT
// 									ISNULL(a.f_net_cost,0) AS f_money
// 									,ISNULL((SELECT bb.dc_cost_acc_id FROM dc_cost bb WHERE bb.dc_cost_id=c.dc_cost_id),0) AS dc_cost_acc_id
// 									,CASE
// 										WHEN (cash.i_type='2') THEN (SELECT bbb.dc_acc_id FROM dc_cheque aaa INNER JOIN dc_bank_acc bbb ON aaa.dc_bank_acc_id=bbb.dc_bank_acc_id WHERE aaa.dc_cheque_id=b.dc_cheque_id)
// 										WHEN (cash.i_type='3') THEN (SELECT dc_acc_id FROM dc_bank_acc bbb WHERE dc_bank_acc_id=a.dc_bank_acc_id)
// 										ELSE cash.dc_acc_id
// 									END AS dc_acc_id
// 									,@gl_tran_hdr_id AS gl_tran_hdr_id
// 								INTO {$TEMP_NAME}
// 								FROM cm_voucher_one a
// 									INNER JOIN fi_pymt_voucher_dtl b ON a.cm_voucher_one_id=b.cm_voucher_one_id
// 									INNER JOIN fi_br c ON b.fi_br_id=c.fi_br_id
// 									INNER JOIN cm_pay_type cash ON cash.cm_pay_type_id=a.cm_pay_type_id
// 								WHERE a.cm_voucher_one_id=@cm_voucher_one_id AND a.i_enable=1

// 								/* DR เงินยืมทดรอง  */
// 								INSERT INTO gl_tran_dtl (
// 									gl_tran_hdr_id
// 									,dc_acc_id
// 									,f_dr
// 									,f_cr
// 									,i_is_nontax_exp
// 									,dc_product_id
// 									,dc_cost_acc_id
// 									,i_type_person
// 									,dc_creditor_id
// 									,dc_emp_id
// 									,c_other_name
// 									,i_rank
// 								)
// 								SELECT
// 									@gl_tran_hdr_id
// 									,(SELECT dc_acc_id FROM dc_acc WHERE c_code='{$borrow_acc_code}')
// 									,a.f_money
// 									,0
// 									,2
// 									,0
// 									,a.dc_cost_acc_id
// 									,0
// 									,0
// 									,0
// 									,''
// 									,1
// 									,2
// 									,0
// 								FROM {$TEMP_NAME} a
								
// 								/* CR เงินสด/เช็ค */
// 								INSERT INTO gl_tran_dtl (
// 									gl_tran_hdr_id
// 									,dc_acc_id
// 									,f_dr
// 									,f_cr
// 									,i_is_nontax_exp
// 									,dc_product_id
// 									,dc_cost_acc_id
// 									,i_type_person
// 									,dc_creditor_id
// 									,dc_emp_id
// 									,c_other_name
// 									,i_rank
// 								)
// 								SELECT
// 									@gl_tran_hdr_id
// 									,a.dc_acc_id
// 									,0
// 									,a.f_money
// 									,2
// 									,0
// 									,a.dc_cost_acc_id
// 									,0
// 									,0
// 									,0
// 									,''
// 									,2
// 									,2
// 									,0
// 								FROM {$TEMP_NAME} a
								
// 								UPDATE b
// 									SET b.dc_cost_acc_id=a.dc_cost_acc_id
// 								FROM gl_tran_dtl b
// 									INNER JOIN dc_acc a ON a.dc_acc_id=b.dc_acc_id
// 								WHERE b.gl_tran_hdr_id=@gl_tran_hdr_id AND ISNULL(a.dc_cost_acc_id,0) > 0 AND a.i_enable=1 AND a.i_last=1

// 								UPDATE gl_tran_hdr SET f_total_amt=(SELECT SUM(f_money) FROM {$TEMP_NAME}) WHERE gl_tran_hdr_id=@gl_tran_hdr_id;

// 								EXECUTE dbo.SP_CHECK_DUPLICATE_SRR_GL @c_ref_doc,@gl_tran_hdr_id

// 							END";
	
// 			$stmt = $db->QueryParam($sqlMain, $arrValue);
// 		}
		//=======================================================================//
// 		if ( @$stmt ) {
// 			$row = $db->Fetch($stmt);
// 			$re = array(
// 					"success"		=> true,
// 					"msg"			=> $row["msg"]
// 			);
// 		} else {
// 			$re = array(
// 					"success"		=> false,
// 					"msg"			=> "check statement : {$sql}"
// 			);
// 		}
	break;
	
	case "FI_PV_TYPE_APS_CLEAR_BRT" : //เงินเบิกหักล้างเงินยืมทดรอง (APS)

// 		$TEMP_NAME	= "#TEMP_DATA_".$_SESSION["user_id"].DATE("YmdHis");
// 		$TEMP_PV	= "temp_pv_gl";
		
// 		// DELETE TEMP
// 		$db->QueryParam("DELETE FROM {$TEMP_PV} WHERE cm_voucher_one_id=?", array($_REQUEST["cm_voucher_one_id"]));

// 		$accIMPORTTANT	= "2106010101";// ใบสำคัญจ่าย ค้างจ่าย
		
// 		//======================== [DR] ค่าใช้จ่ายค้างจ่าย-ใบสำคัญจ่าย ========================//
// 		$sqlMain1	= "	DECLARE @cm_voucher_one_id	NUMERIC	= ?;
// 						DECLARE @fi_br_grp_hdr_id		NUMERIC;
// 						DECLARE @dc_acc_id_exp			NUMERIC;
// 						DECLARE @f_net_br				DECIMAL(18,2);
	
// 						SELECT
// 							@f_net_br=(SELECT f_net_br FROM fi_br WHERE fi_br_id=b.fi_br_id) 
// 							,@fi_br_grp_hdr_id=a.fi_br_grp_hdr_id
// 						FROM cm_voucher_one a
// 							INNER JOIN fi_br_grp_hdr b ON a.fi_br_grp_hdr_id=b.fi_br_grp_hdr_id
// 						WHERE a.cm_voucher_one_id=@cm_voucher_one_id;
						
// 						SELECT @dc_acc_id_exp=dc_acc_id FROM dc_acc WHERE c_code='{$accIMPORTTANT}' AND i_enable=1;
								
// 						SELECT
// 							ISNULL(b.dc_cost_acc_id,0) AS dc_cost_acc_id
// 							,CASE
// 								WHEN (SUM(ISNULL(c.f_inv_amount,0)) > @f_net_br) THEN @f_net_br
// 								WHEN (SUM(ISNULL(c.f_inv_amount,0)) < @f_net_br) THEN SUM(ISNULL(c.f_inv_amount,0))
// 								WHEN (SUM(ISNULL(c.f_inv_amount,0)) = @f_net_br) THEN @f_net_br
// 							END AS f_net_amt
// 							,i_rank=IDENTITY(INT, 1, 1)
// 						INTO {$TEMP_NAME}
// 						FROM fi_br_grp_exp c
// 							INNER JOIN fi_br_grp_hdr a ON a.fi_br_grp_hdr_id=c.fi_br_grp_hdr_id
// 							INNER JOIN fi_br br ON br.fi_br_id=a.fi_br_id
// 							INNER JOIN dc_cost b ON b.dc_cost_id=c.dc_cost_id
// 						WHERE a.fi_br_grp_hdr_id=@fi_br_grp_hdr_id
// 						GROUP BY b.dc_cost_acc_id;

// 						INSERT INTO {$TEMP_PV}
// 						SELECT
// 							@cm_voucher_one_id AS cm_voucher_one_id
// 							,0 AS ap_expen_hdr_id
// 							,@fi_br_grp_hdr_id AS fi_br_grp_hdr_id
// 							,@dc_acc_id_exp AS dc_acc_id
// 							,0 AS dc_cost_id
// 							,dc_cost_acc_id AS dc_cost_acc_id
// 							,f_net_amt AS f_dr
// 							,0 AS f_cr
// 							,i_rank AS i_rank
// 							,0 AS i_vat_buy
// 						FROM {$TEMP_NAME}";

// 		$db->QueryParam($sqlMain1, array($_REQUEST["cm_voucher_one_id"]));
// 		//=======================================================================//

// 		//============================= [CR] เงินยืมทดรอง =============================//
// 		$borrow			="1111010101";// เงินยืมทดรอง

// 		$sqlMain2	= "	DECLARE @cm_voucher_one_id	NUMERIC	= ?;
// 						DECLARE @fi_br_grp_hdr_id		NUMERIC;
// 						DECLARE @dc_acc_id_borrow		NUMERIC;
// 						DECLARE @f_net_br				DECIMAL(18,2);
						
// 						SELECT
// 							@f_net_br=(SELECT f_net_br FROM fi_br WHERE fi_br_id=b.fi_br_id) 
// 							,@fi_br_grp_hdr_id=a.fi_br_grp_hdr_id
// 						FROM cm_voucher_one a
// 							INNER JOIN fi_br_grp_hdr b ON a.fi_br_grp_hdr_id=b.fi_br_grp_hdr_id
// 						WHERE a.cm_voucher_one_id=@cm_voucher_one_id;
						
// 						SELECT @dc_acc_id_borrow=dc_acc_id FROM dc_acc WHERE c_code='{$borrow}' AND i_enable=1;
						
// 						SELECT
// 							(SELECT TOP 1 dc_cost_acc_id FROM dc_cost WHERE dc_cost_id=br.dc_cost_id) AS dc_cost_acc_id
// 							,CASE
// 								WHEN (SUM(ISNULL(c.f_inv_amount,0)) > @f_net_br) THEN @f_net_br
// 								WHEN (SUM(ISNULL(c.f_inv_amount,0)) < @f_net_br) THEN SUM(ISNULL(c.f_inv_amount,0))
// 								WHEN (SUM(ISNULL(c.f_inv_amount,0)) = @f_net_br) THEN @f_net_br
// 							END AS f_net_amt
// 						INTO {$TEMP_NAME}
// 						FROM fi_br_grp_exp c
// 							INNER JOIN fi_br_grp_hdr a ON a.fi_br_grp_hdr_id=c.fi_br_grp_hdr_id
// 							INNER JOIN fi_br br ON br.fi_br_id=a.fi_br_id
// 						WHERE a.fi_br_grp_hdr_id=@fi_br_grp_hdr_id
// 						GROUP BY br.dc_cost_id;

// 						INSERT INTO {$TEMP_PV}
// 						SELECT
// 							@cm_voucher_one_id AS cm_voucher_one_id
// 							,0 AS ap_expen_hdr_id
// 							,@fi_br_grp_hdr_id AS fi_br_grp_hdr_id
// 							,@dc_acc_id_borrow AS dc_acc_id
// 							,0 AS dc_cost_id
// 							,dc_cost_acc_id AS dc_cost_acc_id
// 							,0 AS f_dr
// 							,f_net_amt AS f_cr
// 							,(SELECT MAX(i_rank)+1 FROM {$TEMP_PV} WHERE cm_voucher_one_id=@cm_voucher_one_id) AS i_rank
// 							,0 AS i_vat_buy
// 						FROM {$TEMP_NAME}";

// 		$db->QueryParam($sqlMain2, array($_REQUEST["cm_voucher_one_id"]));
// 		//=======================================================================//

// 		//==================== [DR] ภาษีซื้อ && [CR] ภาษีซื้อยังไม่ถึงกำหนด =====================//
// 		$dc_cost_acc_finance_code	= "CT0602010000";// สำนักบัญชีและการเงิน
// 		$accBUY						= "1111020701";// ภาษีซื้อ
// 		$accBUY_NO					= "1111010401";// ภาษีซื้อยังไม่ถึงกำหนด
		
// 		$sqlMain3	= "	DECLARE @cm_voucher_one_id		NUMERIC	= ?;
// 						DECLARE @fi_br_grp_hdr_id			NUMERIC;
// 						DECLARE @dc_acc_id_vat_buy			NUMERIC;
// 						DECLARE @dc_acc_id_vat_buy_not_due	NUMERIC;
						
// 						SELECT 
// 							@fi_br_grp_hdr_id=a.fi_br_grp_hdr_id
// 						FROM cm_voucher_one a
// 							INNER JOIN fi_br_grp_hdr b ON a.fi_br_grp_hdr_id=b.fi_br_grp_hdr_id
// 						WHERE a.cm_voucher_one_id=@cm_voucher_one_id; 
						
// 						SELECT @dc_acc_id_vat_buy=dc_acc_id FROM dc_acc WHERE c_code='{$accBUY}' AND i_enable=1;
// 						SELECT @dc_acc_id_vat_buy_not_due=dc_acc_id FROM dc_acc WHERE c_code='{$accBUY_NO}' AND i_enable=1;
						
// 						SELECT
// 							CASE
// 								WHEN (cost.i_type_region=1) THEN (SELECT dc_cost_acc_id FROM dc_cost WHERE c_code='{$dc_cost_acc_finance_code}')
// 								ELSE cost.dc_cost_acc_id
// 							END AS dc_cost_acc_id
// 							,SUM(ISNULL(c.f_vat_amount,0)) AS f_money
// 						INTO {$TEMP_NAME}
// 						FROM fi_br_grp_exp c
// 							INNER JOIN fi_br_grp_hdr a ON a.fi_br_grp_hdr_id=c.fi_br_grp_hdr_id
// 							INNER JOIN vw_dc_cost_type_region cost ON cost.dc_cost_id=CASE WHEN ISNULL(c.dc_cost_id,0)=0 THEN a.dc_cost_id ELSE c.dc_cost_id END
// 						WHERE a.fi_br_grp_hdr_id=@fi_br_grp_hdr_id
// 						GROUP BY
// 							cost.dc_cost_id_region
// 							,cost.i_type_region
// 							,cost.dc_cost_acc_id
// 						HAVING SUM(ISNULL(c.f_vat_amount,0)) > 0;	

// 						/* ภาษีซื้อ */
// 						INSERT INTO {$TEMP_PV}
// 						SELECT
// 							@cm_voucher_one_id AS cm_voucher_one_id
// 							,0 AS ap_expen_hdr_id
// 							,@fi_br_grp_hdr_id AS fi_br_grp_hdr_id
// 							,@dc_acc_id_vat_buy AS dc_acc_id
// 							,0 AS dc_cost_id
// 							,dc_cost_acc_id AS dc_cost_acc_id
// 							,f_money AS f_dr
// 							,0 AS f_cr
// 							,(SELECT MAX(i_rank)+1 FROM {$TEMP_PV} WHERE cm_voucher_one_id=@cm_voucher_one_id) AS i_rank
// 							,0 AS i_vat_buy
// 						FROM {$TEMP_NAME} WHERE f_money > 0

// 						/* ภาษีซื้อยังไม่ถึงกำหนด */
// 						INSERT INTO {$TEMP_PV}
// 						SELECT
// 							@cm_voucher_one_id AS cm_voucher_one_id
// 							,0 AS ap_expen_hdr_id
// 							,@fi_br_grp_hdr_id AS fi_br_grp_hdr_id
// 							,@dc_acc_id_vat_buy_not_due AS dc_acc_id
// 							,0 AS dc_cost_id
// 							,dc_cost_acc_id AS dc_cost_acc_id
// 							,0 AS f_dr
// 							,f_money AS f_cr
// 							,(SELECT MAX(i_rank)+1 FROM {$TEMP_PV} WHERE cm_voucher_one_id=@cm_voucher_one_id) AS i_rank
// 							,0 AS i_vat_buy
// 						FROM {$TEMP_NAME} WHERE f_money > 0";

// 		$db->QueryParam($sqlMain3, array($_REQUEST["cm_voucher_one_id"]));
// 		//=======================================================================//

// 		//===== INSERT GL + UPDATE MONEY_TOT @ GL_TRAN_HDR + CHECK DUPLICATE ====//
// 		$gl_dc_book_type_id	= $db->GetDataBySQL("SELECT TOP 1 ISNULL(gl_dc_book_type_id,0) FROM gl_dc_book_doc WHERE c_code=substring(?,1,2)", array("PV"));

// 		if ( $gl_dc_book_type_id != "" ) {
	
// 			$fi	= $db->GetDataBySQL("SELECT
// 										CONVERT(VARCHAR, a.d_doc_date_pv, 120) AS d_doc_date_pv
// 										,(SELECT TOP 1 c_code FROM fi_br_grp_hdr WHERE fi_br_grp_hdr_id=a.fi_br_grp_hdr_id) AS c_name
// 										,a.c_code_pv
// 									FROM cm_voucher_one a WHERE a.cm_voucher_one_id=?", array($_REQUEST["cm_voucher_one_id"]));

// 			$data["gl_dc_book_type_id"]		= $gl_dc_book_type_id;
// 			$data["c_code"]					= "0";
// 			$data["c_ref_doc"]				= $fi["c_code_pv"];
// 			$data["d_doc_date"]				= $fi["d_doc_date_pv"];
// 			$data["i_enable"]				= STATUS_ENABLE;
// 			$data["i_is_post"]				= 1;
// 			$data["dc_user_create_id"]		= $_SESSION["user_id"];
// 			$data["dc_user_create_cost_id"]	= $_SESSION["dc_cost_id"];
// 			$data["d_create"]				= date("Y-m-d H:i:s");
// 			$data["i_is_reversing"]			= 2;
// 			$data["i_is_close_year"]		= 2;
// 			$data["i_close_year_type"]			= 9;
// 			$data["table_pk_id"]			= $_REQUEST["cm_voucher_one_id"];
// 			$data["table_name"]				= "cm_voucher_one";
// 			$data["table_detail"]			= "ใบสำคัญจ่ายเงิน";
// 			$data["c_code_post"]			= "0";
// 			$data["i_type"]					= 2;
// 			$data["i_preview"]				= 1;
// 			$data["c_comment1"]				= "บันทึกบัญชีตัดหนี้ สำหรับใบเบิก ".$fi["c_name"];
// 			$data["i_chk_gl_dtl"]			= GL_CHK_DTL_FALSE; // 2 ยังไม่ตรวจสอบ/ตรวจสอบแล้วไม่ผ่าน
// 			$data["i_chk_gl_purchase"]		= GL_CHK_VAT_TRUE; // 1 ตรวจสอบผ่านแล้ว
	
// 			foreach ($data as $fld => $value) {
// 				$addField .= ", {$fld}";
// 				$addValue .= ", ?";
// 				$arrValue[] = $value;
// 			}

// 			$sqlMain4	= "	DECLARE	@c_ref_doc				VARCHAR(20)	= '{$fi["c_code_pv"]}';
// 							DECLARE	@cm_voucher_one_id	NUMERIC		= {$_REQUEST["cm_voucher_one_id"]};
// 							DECLARE	@gl_tran_hdr_id 	NUMERIC;
// 							DECLARE	@n_gl				INTEGER			= 0;

// 							SELECT @n_gl = ISNULL(COUNT(gl_tran_hdr_id),0) FROM gl_tran_hdr WHERE c_ref_doc=@c_ref_doc AND i_is_post IN (2,3) AND i_enable=1; 
	
// 							IF ( @n_gl=0 )
// 							BEGIN

// 								DELETE FROM gl_tran_dtl WHERE gl_tran_hdr_id IN (SELECT gl_tran_hdr_id FROM gl_tran_hdr WHERE table_name='cm_voucher_one' AND table_pk_id=@cm_voucher_one_id AND i_is_post=1)
// 								DELETE FROM gl_tran_hdr WHERE table_name='cm_voucher_one' AND table_pk_id=@cm_voucher_one_id AND i_is_post=1
		
// 								INSERT INTO gl_tran_hdr (".substr($addField, 1).") VALUES (".substr($addValue,1).")

// 								SET @gl_tran_hdr_id=@@IDENTITY

// 								SELECT
// 									dc_acc_id
// 									,f_dr
// 									,f_cr
// 									,dc_cost_acc_id
// 									,SUM(f_dr) AS f_money_hdr
// 									,i_rank
// 								INTO {$TEMP_NAME}
// 								FROM {$TEMP_PV}
// 								WHERE cm_voucher_one_id=@cm_voucher_one_id
// 								GROUP BY
// 									dc_acc_id
// 									,f_dr
// 									,f_cr
// 									,dc_cost_acc_id
// 									,i_rank
// 								ORDER BY i_rank;

// 								INSERT INTO gl_tran_dtl (
// 									gl_tran_hdr_id
// 									,dc_acc_id
// 									,f_dr
// 									,f_cr
// 									,i_is_nontax_exp
// 									,dc_product_id
// 									,dc_cost_acc_id
// 									,i_type_person
// 									,dc_creditor_id
// 									,dc_emp_id
// 									,c_other_name
// 									,i_rank
// 								)
// 								SELECT
// 									@gl_tran_hdr_id
// 									,a.dc_acc_id
// 									,a.f_dr
// 									,a.f_cr
// 									,2
// 									,0
// 									,a.dc_cost_acc_id
// 									,0 AS i_type_person
// 									,0 AS dc_creditor_id
// 									,0
// 									,''
// 									,a.i_rank
// 								FROM {$TEMP_NAME} a WHERE a.f_dr > 0 OR a.f_cr > 0;							
		
// 								UPDATE b SET
// 									b.dc_cost_acc_id=a.dc_cost_acc_id
// 								FROM gl_tran_dtl b
// 									INNER JOIN dc_acc a ON a.dc_acc_id=b.dc_acc_id
// 								WHERE b.gl_tran_hdr_id=@gl_tran_hdr_id AND ISNULL(a.dc_cost_acc_id,0) > 0 AND a.i_enable=1 AND a.i_last=1;
									
// 								UPDATE gl_tran_hdr SET f_total_amt=(SELECT SUM(f_dr) FROM {$TEMP_NAME}) WHERE gl_tran_hdr_id=@gl_tran_hdr_id;

// 								EXECUTE dbo.SP_CHECK_DUPLICATE_SRR_GL @c_ref_doc,@gl_tran_hdr_id

// 							END";
	
// 			$db->QueryParam($sqlMain4, $arrValue);
// 		}
// 		//=======================================================================//

// 		// DELETE TEMP
// 		$db->BeginTran();
// 		$stmt = $db->QueryParam("DELETE FROM {$TEMP_PV} WHERE cm_voucher_one_id=?", array($_REQUEST["cm_voucher_one_id"]));
// 		if ( $stmt ) {
// 			$row = $db->Fetch($stmt);
// 			$db->CommitTran();
// 			$re = array(
// 					"reval"			=> 0,
// 					"success"		=> "Success",
// 					"msg"			=> $row["msg"]
// 			);
// 		} else {
// 			$db->RollBackTran();
// 			$re = array(
// 					"reval"			=> 1,
// 					"success"		=> "Error",
// 					"msg"			=> "check statement : {$sql}"
// 			);
// 		}
	break;
	
	case "FI_PV_TYPE_APS" : //เงินเบิกกรณีผู้รับหลายคน (APS) || เงินเบิกสวัสดิการ (APS) || เงินเบิกหักล้างเงินยืมหมุนเวียน (APS)
		
// 		$TEMP_NAME	= "#TEMP_DATA_".$_SESSION["user_id"].DATE("YmdHis");
// 		$TEMP_PV	= "temp_pv_gl";
		
// 		// DELETE TEMP
// 		$db->QueryParam("DELETE FROM {$TEMP_PV} WHERE cm_voucher_one_id=?", array($_REQUEST["cm_voucher_one_id"]));
		
// 		//============================= [DR] เจ้าหนี้การค้า =============================//
// 		$sqlMain1	= "	DECLARE @cm_voucher_one_id	NUMERIC	= ?;
// 						DECLARE @fi_br_grp_hdr_id		NUMERIC;
		
// 						SELECT @fi_br_grp_hdr_id=a.fi_br_grp_hdr_id FROM cm_voucher_one a WHERE a.cm_voucher_one_id=@cm_voucher_one_id;
		
// 						SELECT
// 							SUM(ISNULL(c.f_inv_amount,0) + ISNULL(c.f_vat_amount,0)) AS f_money
// 							,cost.dc_cost_acc_id AS dc_cost_acc_id
// 							,a.dc_acc_id_exp AS dc_acc_id
// 							,i_rank=IDENTITY(INT, 1, 1)
// 						INTO {$TEMP_NAME}
// 						FROM dbo.vw_exp_creditor_type a
// 							INNER JOIN fi_br_grp_dtl b ON (a.i_type_person=b.i_type_person AND a.fi_br_grp_dtl_id=b.fi_br_grp_dtl_id)
// 							INNER JOIN fi_br_grp_exp c ON b.fi_br_grp_dtl_id=c.fi_br_grp_dtl_id
// 							INNER JOIN fi_br_grp_hdr hdr ON hdr.fi_br_grp_hdr_id=c.fi_br_grp_hdr_id
// 							INNER JOIN dc_cost cost ON cost.dc_cost_id=hdr.dc_cost_id
// 						WHERE b.fi_br_grp_hdr_id=@fi_br_grp_hdr_id
// 						GROUP BY
// 							a.dc_acc_id_exp
// 							,hdr.dc_cost_id
// 							,cost.dc_cost_acc_id
// 						HAVING SUM(ISNULL(c.f_inv_amount,0) + ISNULL(c.f_vat_amount,0)) > 0;

// 						INSERT INTO {$TEMP_PV}
// 						SELECT
// 							@cm_voucher_one_id AS cm_voucher_one_id
// 							,0 AS ap_expen_hdr_id
// 							,@fi_br_grp_hdr_id AS fi_br_grp_hdr_id
// 							,dc_acc_id AS dc_acc_id
// 							,0 AS dc_cost_id
// 							,dc_cost_acc_id AS dc_cost_acc_id
// 							,f_money AS f_dr
// 							,0 AS f_cr
// 							,i_rank AS i_rank
// 							,0 AS i_vat_buy
// 						FROM {$TEMP_NAME}";
		
// 		$db->QueryParam($sqlMain1, array($_REQUEST["cm_voucher_one_id"]));
// 		//=======================================================================//
		
// 		//==== [CR] เช็คเงินสด + [CR] จำนวนเงินภาษีหัก ณ ที่จ่าย + [DR] ภาษีซื้อ + [CR] ภาษีซื้อยังไม่ถึงกำหนด ===//
// 		$dc_cost_acc_finance_code	= "CT0602010000"; // สำนักบัญชีและการเงิน
// 		$acc_tax_code				= "2108020101"; // กำหนดภาษีหัก ณ ที่จ่ายค้างจ่าย
// 		$accBUY						= "1111020701"; // ภาษีซื้อ
// 		$accBUY_NO					= "1111010401"; // ภาษีซื้อยังไม่ถึงกำหนด
		
// 		$sqlMain2	= "	DECLARE @cm_voucher_one_id	NUMERIC	= ?;
// 						DECLARE @fi_br_grp_hdr_id		NUMERIC;

// 						SELECT @fi_br_grp_hdr_id=a.fi_br_grp_hdr_id FROM cm_voucher_one a WHERE a.cm_voucher_one_id=@cm_voucher_one_id;

// 						SELECT
// 							SUM(ISNULL(b.f_net_amount,0)) AS f_inv_amt
// 							,SUM(ISNULL(b.f_vat_amount,0)) AS f_vat_amt
// 							,SUM(ISNULL(b.f_tax_amount,0)) AS f_tax_amt
// 							,CASE
// 								WHEN (cost.i_type_region=1) THEN (SELECT dc_cost_acc_id FROM dc_cost WHERE c_code='{$dc_cost_acc_finance_code}')
// 								ELSE cost.dc_cost_acc_id
// 							END AS dc_cost_acc_id
// 							,CASE
// 								WHEN (cash.i_type=2) THEN (SELECT bbb.dc_acc_id FROM dc_cheque aaa INNER JOIN dc_bank_acc bbb ON aaa.dc_bank_acc_id=bbb.dc_bank_acc_id WHERE aaa.dc_cheque_id=dtl.dc_cheque_id)
// 								WHEN (cash.i_type=3) THEN (SELECT dc_acc_id FROM dc_bank_acc bbb WHERE dc_bank_acc_id=hdr.dc_bank_acc_id)
// 								ELSE cash.dc_acc_id
// 							END AS dc_acc_id
// 							,CASE
// 								WHEN (cash.i_type=2) THEN (SELECT ' ซึ่งจ่ายด้วยเช็ค เลขที่ '+aaa.c_start_no FROM dc_cheque aaa INNER JOIN dc_bank_acc bbb ON aaa.dc_bank_acc_id=bbb.dc_bank_acc_id WHERE aaa.dc_cheque_id=dtl.dc_cheque_id)
// 								WHEN (cash.i_type=3) THEN (SELECT ' เลขที่บัญชีธนาคาร คือ '+c_code FROM dc_bank_acc bbb WHERE dc_bank_acc_id=hdr.dc_bank_acc_id)
// 								ELSE ''
// 							END AS c_comment2
// 							,(SELECT dc_cost_acc_id FROM dc_cost WHERE dc_cost_id=br.dc_cost_id AND i_last=1 AND i_enable=1) AS dc_cost_acc_id_aps
// 						INTO {$TEMP_NAME}
// 						FROM cm_voucher_one hdr
// 							INNER JOIN fi_pymt_voucher_dtl dtl ON hdr.cm_voucher_one_id=dtl.cm_voucher_one_id
// 							INNER JOIN fi_br_grp_hdr br ON dtl.fi_br_grp_hdr_id=br.fi_br_grp_hdr_id
// 							INNER JOIN fi_br_grp_dtl a ON (hdr.fi_br_grp_hdr_id=a.fi_br_grp_hdr_id AND dtl.fi_br_grp_dtl_id=a.fi_br_grp_dtl_id)
// 							INNER JOIN fi_br_grp_exp b ON a.fi_br_grp_dtl_id=b.fi_br_grp_dtl_id
// 							INNER JOIN vw_dc_cost_type_region cost ON cost.dc_cost_id=CASE WHEN ISNULL(b.dc_cost_id,0)=0 THEN br.dc_cost_id ELSE b.dc_cost_id END
// 							INNER JOIN cm_pay_type cash ON cash.cm_pay_type_id=hdr.cm_pay_type_id
// 						WHERE hdr.cm_voucher_one_id=@cm_voucher_one_id
// 							AND hdr.i_enable=1
// 						GROUP BY
// 							cost.i_type_region
// 							,cost.dc_cost_acc_id
// 							,cash.i_type
// 							,dtl.dc_cheque_id
// 							,hdr.dc_bank_acc_id
// 							,cash.dc_acc_id
// 							,br.dc_cost_id;

// 						/* จำนวนเงินที่ขอเบิก */
// 						INSERT INTO {$TEMP_PV}
// 						SELECT
// 							@cm_voucher_one_id AS cm_voucher_one_id
// 							,0 AS ap_expen_hdr_id
// 							,@fi_br_grp_hdr_id AS fi_br_grp_hdr_id
// 							,dc_acc_id AS dc_acc_id
// 							,0 AS dc_cost_id
// 							,dc_cost_acc_id_aps AS dc_cost_acc_id
// 							,0 AS f_dr
// 							,f_inv_amt AS f_cr
// 							,(SELECT MAX(i_rank)+1 FROM {$TEMP_PV} WHERE cm_voucher_one_id=@cm_voucher_one_id) AS i_rank
// 							,0 AS i_vat_buy
// 						FROM {$TEMP_NAME} WHERE f_inv_amt > 0
						
// 						/* จำนวนเงินภาษีหัก ณ ที่จ่าย */
// 						INSERT INTO {$TEMP_PV}
// 						SELECT
// 							@cm_voucher_one_id AS cm_voucher_one_id
// 							,0 AS ap_expen_hdr_id
// 							,@fi_br_grp_hdr_id AS fi_br_grp_hdr_id
// 							,(SELECT dc_acc_id FROM dc_acc WHERE c_code='{$acc_tax_code}') AS dc_acc_id
// 							,0 AS dc_cost_id
// 							,dc_cost_acc_id AS dc_cost_acc_id
// 							,0 AS f_dr
// 							,SUM(f_tax_amt) AS f_cr
// 							,(SELECT MAX(i_rank)+1 FROM {$TEMP_PV} WHERE cm_voucher_one_id=@cm_voucher_one_id) AS i_rank
// 							,0 AS i_vat_buy
// 						FROM {$TEMP_NAME} WHERE f_tax_amt > 0
// 						GROUP BY dc_cost_acc_id
						
// 						/* จำนวนเงินภาษีมูลค่าเพิ่ม(คำนวณ) */
// 						INSERT INTO {$TEMP_PV}
// 						SELECT
// 							@cm_voucher_one_id AS cm_voucher_one_id
// 							,0 AS ap_expen_hdr_id
// 							,@fi_br_grp_hdr_id AS fi_br_grp_hdr_id
// 							,(SELECT dc_acc_id FROM dc_acc WHERE c_code='{$accBUY}') AS dc_acc_id
// 							,0 AS dc_cost_id
// 							,dc_cost_acc_id AS dc_cost_acc_id
// 							,SUM(f_vat_amt) AS f_dr
// 							,0 AS f_cr
// 							,(SELECT MAX(i_rank)+1 FROM {$TEMP_PV} WHERE cm_voucher_one_id=@cm_voucher_one_id) AS i_rank
// 							,1 AS i_vat_buy
// 						FROM {$TEMP_NAME} WHERE f_vat_amt > 0
// 						GROUP BY dc_cost_acc_id
						
// 						INSERT INTO {$TEMP_PV}
// 						SELECT
// 							@cm_voucher_one_id AS cm_voucher_one_id
// 							,0 AS ap_expen_hdr_id
// 							,@fi_br_grp_hdr_id AS fi_br_grp_hdr_id
// 							,(SELECT dc_acc_id FROM dc_acc WHERE c_code='{$accBUY_NO}') AS dc_acc_id
// 							,0 AS dc_cost_id
// 							,dc_cost_acc_id AS dc_cost_acc_id
// 							,0 AS f_dr
// 							,SUM(f_vat_amt) AS f_cr
// 							,(SELECT MAX(i_rank)+1 FROM {$TEMP_PV} WHERE cm_voucher_one_id=@cm_voucher_one_id) AS i_rank
// 							,0 AS i_vat_buy
// 						FROM {$TEMP_NAME} WHERE f_vat_amt > 0
// 						GROUP BY dc_cost_acc_id";
		
// 		$db->QueryParam($sqlMain2, array($_REQUEST["cm_voucher_one_id"]));
// 		//=======================================================================//
		
// 		//===== INSERT GL + UPDATE MONEY_TOT @ GL_TRAN_HDR + CHECK DUPLICATE ====//
// 		$gl_dc_book_type_id	= $db->GetDataBySQL("SELECT TOP 1 ISNULL(gl_dc_book_type_id,0) FROM gl_dc_book_doc WHERE c_code=substring(?,1,2)", array("PV"));
		
// 		if ( $gl_dc_book_type_id != "" ) {
		
// 			$fi	= $db->GetDataBySQL("SELECT
// 										CONVERT(VARCHAR, a.d_doc_date_pv, 120) AS d_doc_date_pv
// 										,(SELECT TOP 1 c_code FROM fi_br_grp_hdr WHERE fi_br_grp_hdr_id=a.fi_br_grp_hdr_id) AS c_name
// 										,a.c_code_pv
// 									FROM cm_voucher_one a WHERE a.cm_voucher_one_id=?", array($_REQUEST["cm_voucher_one_id"]));

// 			$data["gl_dc_book_type_id"]		= $gl_dc_book_type_id;
// 			$data["c_code"]					= "0";
// 			$data["c_ref_doc"]				= $fi["c_code_pv"];
// 			$data["d_doc_date"]				= $fi["d_doc_date_pv"];
// 			$data["i_enable"]				= STATUS_ENABLE;
// 			$data["i_is_post"]				= 1;
// 			$data["dc_user_create_id"]		= $_SESSION["user_id"];
// 			$data["dc_user_create_cost_id"]	= $_SESSION["dc_cost_id"];
// 			$data["d_create"]				= date("Y-m-d H:i:s");
// 			$data["i_is_reversing"]			= 2;
// 			$data["i_is_close_year"]		= 2;
// 			$data["i_close_year_type"]			= 9;
// 			$data["table_pk_id"]			= $_REQUEST["cm_voucher_one_id"];
// 			$data["table_name"]				= "cm_voucher_one";
// 			$data["table_detail"]			= "ใบสำคัญจ่ายเงิน";
// 			$data["c_code_post"]			= "0";
// 			$data["i_type"]					= 2;
// 			$data["i_preview"]				= 1;
// 			$data["c_comment1"]				= "บันทึกบัญชีเพื่อล้างเจ้าหนี้ เลขที่ ".$fi["c_name"];
// 			$data["i_chk_gl_dtl"]			= GL_CHK_DTL_FALSE; // 2 ยังไม่ตรวจสอบ/ตรวจสอบแล้วไม่ผ่าน
// 			$data["i_chk_gl_purchase"]		= GL_CHK_VAT_TRUE; // 1 ตรวจสอบผ่านแล้ว

// 			foreach ($data as $fld => $value) {
// 				$addField .= ", {$fld}";
// 				$addValue .= ", ?";
// 				$arrValue[] = $value;
// 			}

// 			$sqlMain3	= "	DECLARE	@c_ref_doc				VARCHAR(20)	= '{$fi["c_code_pv"]}';
// 							DECLARE	@cm_voucher_one_id	NUMERIC		= {$_REQUEST["cm_voucher_one_id"]};
// 							DECLARE	@gl_tran_hdr_id 		NUMERIC;
// 							DECLARE	@n_gl					INTEGER		= 0;
							
// 							SELECT @n_gl = ISNULL(COUNT(gl_tran_hdr_id),0) FROM gl_tran_hdr WHERE c_ref_doc=@c_ref_doc AND i_is_post IN (2,3) AND i_enable=1;

// 							IF ( @n_gl=0 )
// 							BEGIN

// 								DELETE FROM gl_tran_dtl WHERE gl_tran_hdr_id IN (SELECT gl_tran_hdr_id FROM gl_tran_hdr WHERE table_name='cm_voucher_one' AND table_pk_id=@cm_voucher_one_id AND i_is_post=1)
// 								DELETE FROM gl_tran_hdr WHERE table_name='cm_voucher_one' AND table_pk_id=@cm_voucher_one_id AND i_is_post=1

// 								INSERT INTO gl_tran_hdr (".substr($addField, 1).") VALUES (".substr($addValue,1).")

// 								SET @gl_tran_hdr_id=@@IDENTITY

// 								SELECT
// 									dc_acc_id
// 									,f_dr
// 									,f_cr
// 									,dc_cost_acc_id
// 									,SUM(f_dr) AS f_money_hdr
// 									,i_rank
// 								INTO {$TEMP_NAME}
// 								FROM {$TEMP_PV}
// 								WHERE cm_voucher_one_id=@cm_voucher_one_id
// 								GROUP BY
// 									dc_acc_id
// 									,f_dr
// 									,f_cr
// 									,dc_cost_acc_id
// 									,i_rank
// 								ORDER BY i_rank;
		
// 								INSERT INTO gl_tran_dtl (
// 									gl_tran_hdr_id
// 									,dc_acc_id
// 									,f_dr
// 									,f_cr
// 									,i_is_nontax_exp
// 									,dc_product_id
// 									,dc_cost_acc_id
// 									,i_type_person
// 									,dc_creditor_id
// 									,dc_emp_id
// 									,c_other_name
// 									,i_rank
// 								)
// 								SELECT
// 									@gl_tran_hdr_id
// 									,a.dc_acc_id
// 									,a.f_dr
// 									,a.f_cr
// 									,2
// 									,0
// 									,a.dc_cost_acc_id
// 									,0 AS i_type_person
// 									,0 AS dc_creditor_id
// 									,0 AS dc_emp_id
// 									,'' AS c_other_name
// 									,a.i_rank
// 								FROM {$TEMP_NAME} a WHERE a.f_dr > 0 OR a.f_cr > 0;
		
// 								UPDATE b SET
// 									b.dc_cost_acc_id=a.dc_cost_acc_id
// 								FROM gl_tran_dtl b
// 									INNER JOIN dc_acc a ON a.dc_acc_id=b.dc_acc_id AND ISNULL(a.dc_cost_acc_id,0) > 0
// 								WHERE b.gl_tran_hdr_id=@gl_tran_hdr_id AND ISNULL(a.dc_cost_acc_id,0) > 0 AND a.i_enable=1 AND a.i_last=1;
								
// 								UPDATE gl_tran_hdr SET f_total_amt=(SELECT SUM(f_dr) FROM {$TEMP_NAME}) WHERE gl_tran_hdr_id=@gl_tran_hdr_id;

// 								EXECUTE dbo.SP_CHECK_DUPLICATE_SRR_GL @c_ref_doc,@gl_tran_hdr_id

// 							END";

// 			$db->QueryParam($sqlMain3, $arrValue);
// 		}
// 		//=======================================================================//

// 		// DELETE TEMP
// 		$db->BeginTran();
// 		$stmt = $db->QueryParam("DELETE FROM {$TEMP_PV} WHERE cm_voucher_one_id=?", array($_REQUEST["cm_voucher_one_id"]));
// 		if ( $stmt ) {
// 		$row = $db->Fetch($stmt);
// 		$db->CommitTran();
// 		$re = array(
// 						"reval"			=> 0,
// 						"success"		=> "Success",
// 						"msg"			=> $row["msg"]
// 		);
// 		} else {
// 				$db->RollBackTran();
// 			$re = array(
// 					"reval"			=> 1,
// 							"success"		=> "Error",
// 							"msg"			=> "check statement : {$sql}"
// 			);
// 		}
							
// 	break;
	
// 	case "SEND_GX_AP_PUR" : //จัดซื้อ
		
// 		$TEMP_NAME	= "#TEMP_DATA_".$_SESSION["user_id"].DATE("YmdHis");
// 		$TEMP_PV	= "temp_pv_gl";
		
// 		$ap_code	= $db->GetDataBySQL("SELECT b.c_code, a.ap_expen_hdr_id FROM fi_pymt_voucher_dtl a INNER JOIN ap_expen_hdr b ON a.ap_expen_hdr_id=b.ap_expen_hdr_id WHERE a.cm_voucher_one_id=?", array($_REQUEST["cm_voucher_one_id"]));

// 		// DELETE TEMP
// 		$db->QueryParam("DELETE FROM {$TEMP_PV} WHERE cm_voucher_one_id=?", array($_REQUEST["cm_voucher_one_id"]));

// 		//=============================== [DR] เจ้าหนี้ ==============================//
// 		$sqlMain1	= "	DECLARE @cm_voucher_one_id	NUMERIC	= ?;
// 						DECLARE @ap_expen_hdr_id		NUMERIC = {$ap_code["ap_expen_hdr_id"]};

// 						SELECT
// 							(ISNULL(SUM(c.f_total_amount),0) + ISNULL(SUM(c.f_vat_amount),0)) AS f_money
// 							,(SELECT dc_cost_acc_id FROM dc_cost WHERE dc_cost_id=c.dc_cost_id) AS dc_cost_acc_id
// 							,CASE c.i_type_person
// 								WHEN 1 THEN (SELECT dc_acc_id_cred FROM dc_cnt WHERE dc_creditor_id=c.dc_creditor_id)
// 								WHEN 3 THEN (SELECT dc_acc_id_cred FROM dc_emp WHERE dc_emp_id=c.dc_emp_id)
// 								WHEN 4 THEN dc_acc_other_id
// 							END AS dc_acc_id
// 							,i_rank=IDENTITY(INT, 1, 1)
// 						INTO {$TEMP_NAME}
// 						FROM ap_expen_hdr c
// 						WHERE c.ap_expen_hdr_id=@ap_expen_hdr_id
// 						GROUP BY
// 							c.dc_cost_id
// 							,c.i_type_person
// 							,c.dc_creditor_id
// 							,c.dc_emp_id
// 							,c.dc_acc_other_id
// 						HAVING (ISNULL(SUM(c.f_total_amount),0) + ISNULL(SUM(c.f_vat_amount),0)) > 0;

// 						INSERT INTO {$TEMP_PV}
// 						SELECT
// 							@cm_voucher_one_id AS cm_voucher_one_id
// 							,@ap_expen_hdr_id AS ap_expen_hdr_id
// 							,0 AS fi_br_grp_hdr_id
// 							,dc_acc_id AS dc_acc_id
// 							,0 AS dc_cost_id
// 							,dc_cost_acc_id AS dc_cost_acc_id
// 							,f_money AS f_dr
// 							,0 AS f_cr
// 							,i_rank AS i_rank
// 							,0 AS i_vat_buy
// 						FROM {$TEMP_NAME}";

// 		$db->QueryParam($sqlMain1, array($_REQUEST["cm_voucher_one_id"]));
// 		//=======================================================================//

// 		//[CR] เช็คเงินสด+[CR] ภาษีหัก ณ ที่จ่ายค้างจ่าย+[DR] ภาษีซื้อ+[CR] ภาษีซื้อยังไม่ถึงกำหนด+[CR] ค่าปรับจากจัดซื้อ//

// 		$dc_cost_acc_finance_code	= "CT0602010000"; // สำนักบัญชีและการเงิน
// 		$acc_tax_code				= "2108020101"; // กำหนดภาษีหัก ณ ที่จ่ายค้างจ่าย
// 		$accBUY						= "1111020701"; // ภาษีซื้อ
// 		$accBUY_NO					= "1111010401"; // ภาษีซื้อยังไม่ถึงกำหนด
		
// 		$sqlMain2	= "	DECLARE @cm_voucher_one_id	NUMERIC	= ?;
// 						DECLARE @ap_expen_hdr_id		NUMERIC = {$ap_code["ap_expen_hdr_id"]};

// 						SELECT
// 							ISNULL(c.f_net_amount,0) AS f_inv_amt
// 							,ISNULL(c.f_vat_amount,0) AS f_vat_amt
// 							,ISNULL(c.f_wht_amount,0) AS f_tax_amt
// 							,CASE
// 								WHEN (SUM(ISNULL(c.f_penalty,0)) > 0) THEN (SELECT TOP 1 dc_acc_id FROM fi_tran_penalty WHERE ap_expen_hdr_id=@ap_expen_hdr_id GROUP BY dc_acc_id)
// 								ELSE 0
// 							END AS dc_acc_id_penalty
// 							,CASE
// 								WHEN (SUM(ISNULL(c.f_penalty,0)) > 0) THEN ISNULL((SELECT SUM(f_amount) FROM fi_tran_penalty WHERE ap_expen_hdr_id=@ap_expen_hdr_id),0)
// 								ELSE 0
// 							END AS f_penalty_dtl
// 							,ISNULL(c.f_net_amount,0) + ISNULL(c.f_vat_amount,0) + ISNULL(c.f_wht_amount,0) + ISNULL((SELECT SUM(f_amount) FROM fi_tran_penalty WHERE ap_expen_hdr_id=@ap_expen_hdr_id),0) AS f_tot_amt
// 							,cost.dc_cost_acc_id AS dc_cost_acc_id_ap
// 							,CASE
// 								WHEN (cost.i_type_region=1) THEN (SELECT dc_cost_acc_id FROM dc_cost WHERE c_code='{$dc_cost_acc_finance_code}')
// 								ELSE cost.dc_cost_acc_id
// 							END AS dc_cost_acc_id_vat_tax
// 							,CASE
// 								WHEN (cash.i_type=2) THEN (SELECT bbb.dc_acc_id FROM dc_cheque aaa INNER JOIN dc_bank_acc bbb ON aaa.dc_bank_acc_id=bbb.dc_bank_acc_id WHERE aaa.dc_cheque_id=b.dc_cheque_id)
// 								WHEN (cash.i_type=3) THEN (SELECT dc_acc_id FROM dc_bank_acc bbb WHERE dc_bank_acc_id=a.dc_bank_acc_id)
// 								ELSE cash.dc_acc_id
// 							END AS dc_acc_id
// 							,CASE
// 								WHEN (cash.i_type=2) THEN (SELECT ' ซึ่งจ่ายด้วยเช็ค เลขที่ '+aaa.c_start_no FROM dc_cheque aaa INNER JOIN dc_bank_acc bbb ON aaa.dc_bank_acc_id=bbb.dc_bank_acc_id WHERE aaa.dc_cheque_id=b.dc_cheque_id)
// 								WHEN (cash.i_type=3) THEN (SELECT ' เลขที่บัญชีธนาคาร คือ '+c_code FROM dc_bank_acc bbb WHERE dc_bank_acc_id=a.dc_bank_acc_id)
// 								ELSE ''
// 							END AS c_comment2
// 						INTO {$TEMP_NAME}
// 						FROM cm_voucher_one a
// 							INNER JOIN fi_pymt_voucher_dtl b ON a.cm_voucher_one_id=b.cm_voucher_one_id
// 							INNER JOIN ap_expen_hdr c ON b.ap_expen_hdr_id=c.ap_expen_hdr_id
// 							INNER JOIN fi_pay_tran_dtl d ON c.ap_expen_hdr_id=d.ap_expen_hdr_id
// 							INNER JOIN vw_dc_cost_type_region cost ON cost.dc_cost_id=c.dc_cost_id
// 							INNER JOIN cm_pay_type cash ON cash.cm_pay_type_id=a.cm_pay_type_id
// 						WHERE a.cm_voucher_one_id=@cm_voucher_one_id AND a.i_enable=1
// 						GROUP BY
// 							cost.dc_cost_acc_id
// 							,cash.i_type
// 							,cash.dc_acc_id
// 							,b.dc_cheque_id
// 							,a.dc_bank_acc_id
// 							,c.f_net_amount
// 							,c.f_vat_amount
// 							,c.f_wht_amount
// 							,cost.i_type_region
// 						HAVING ISNULL(c.f_net_amount,0) > 0;

// 						INSERT INTO {$TEMP_PV}
// 						SELECT
// 							@cm_voucher_one_id AS cm_voucher_one_id
// 							,@ap_expen_hdr_id AS ap_expen_hdr_id
// 							,0 AS fi_br_grp_hdr_id
// 							,dc_acc_id AS dc_acc_id
// 							,0 AS dc_cost_id
// 							,dc_cost_acc_id_ap AS dc_cost_acc_id
// 							,0 AS f_dr
// 							,f_inv_amt AS f_cr
// 							,(SELECT MAX(i_rank)+1 FROM {$TEMP_PV} WHERE cm_voucher_one_id=@cm_voucher_one_id) AS i_rank
// 							,0 AS i_vat_buy
// 						FROM {$TEMP_NAME};
						
// 						INSERT INTO {$TEMP_PV}
// 						SELECT
// 							@cm_voucher_one_id AS cm_voucher_one_id
// 							,@ap_expen_hdr_id AS ap_expen_hdr_id
// 							,0 AS fi_br_grp_hdr_id
// 							,(SELECT dc_acc_id FROM dc_acc WHERE c_code='{$accBUY}') AS dc_acc_id
// 							,0 AS dc_cost_id
// 							,dc_cost_acc_id_vat_tax AS dc_cost_acc_id
// 							,SUM(f_vat_amt) AS f_dr
// 							,0 AS f_cr
// 							,(SELECT MAX(i_rank)+1 FROM {$TEMP_PV} WHERE cm_voucher_one_id=@cm_voucher_one_id) AS i_rank
// 							,1 AS i_vat_buy
// 						FROM {$TEMP_NAME}
// 						WHERE f_vat_amt > 0
// 						GROUP BY dc_cost_acc_id_vat_tax;
						
// 						INSERT INTO {$TEMP_PV}
// 						SELECT
// 							@cm_voucher_one_id AS cm_voucher_one_id
// 							,@ap_expen_hdr_id AS ap_expen_hdr_id
// 							,0 AS fi_br_grp_hdr_id
// 							,(SELECT dc_acc_id FROM dc_acc WHERE c_code='{$accBUY_NO}') AS dc_acc_id
// 							,0 AS dc_cost_id
// 							,dc_cost_acc_id_vat_tax AS dc_cost_acc_id
// 							,0 AS f_dr
// 							,SUM(f_vat_amt) AS f_cr
// 							,(SELECT MAX(i_rank)+1 FROM {$TEMP_PV} WHERE cm_voucher_one_id=@cm_voucher_one_id) AS i_rank
// 							,0 AS i_vat_buy
// 						FROM {$TEMP_NAME}
// 						WHERE f_vat_amt > 0
// 						GROUP BY dc_cost_acc_id_vat_tax;

// 						INSERT INTO {$TEMP_PV}
// 						SELECT
// 							@cm_voucher_one_id AS cm_voucher_one_id
// 							,@ap_expen_hdr_id AS ap_expen_hdr_id
// 							,0 AS fi_br_grp_hdr_id
// 							,(SELECT dc_acc_id FROM dc_acc WHERE c_code='{$acc_tax_code}') AS dc_acc_id
// 							,0 AS dc_cost_id
// 							,dc_cost_acc_id_vat_tax AS dc_cost_acc_id
// 							,0 AS f_dr
// 							,SUM(f_tax_amt) AS f_cr
// 							,(SELECT MAX(i_rank)+1 FROM {$TEMP_PV} WHERE cm_voucher_one_id=@cm_voucher_one_id) AS i_rank
// 							,0 AS i_vat_buy
// 						FROM {$TEMP_NAME}
// 						WHERE f_tax_amt > 0
// 						GROUP BY dc_cost_acc_id_vat_tax;
						
// 						INSERT INTO {$TEMP_PV}
// 						SELECT
// 							@cm_voucher_one_id AS cm_voucher_one_id
// 							,@ap_expen_hdr_id AS ap_expen_hdr_id
// 							,0 AS fi_br_grp_hdr_id
// 							,dc_acc_id_penalty AS dc_acc_id
// 							,0 AS dc_cost_id
// 							,dc_cost_acc_id_ap AS dc_cost_acc_id
// 							,0 AS f_dr
// 							,SUM(f_penalty_dtl) AS f_cr
// 							,(SELECT MAX(i_rank)+1 FROM {$TEMP_PV} WHERE cm_voucher_one_id=@cm_voucher_one_id) AS i_rank
// 							,0 AS i_vat_buy
// 						FROM {$TEMP_NAME}
// 						WHERE f_penalty_dtl > 0
// 						GROUP BY dc_cost_acc_id_ap, dc_acc_id_penalty;";
		
// 		$db->QueryParam($sqlMain2, array($_REQUEST["cm_voucher_one_id"]));
// 		//=======================================================================//
		
// 		//===== INSERT GL + UPDATE MONEY_TOT @ GL_TRAN_HDR + CHECK DUPLICATE ====//
// 		$gl_dc_book_type_id	= $db->GetDataBySQL("SELECT TOP 1 ISNULL(gl_dc_book_type_id,0) FROM gl_dc_book_doc WHERE c_code=substring(?,1,2)", array("PV"));
		
// 		if ( $gl_dc_book_type_id != "" ) {
		
// 			$fi	= $db->GetDataBySQL("SELECT
// 										CONVERT(VARCHAR, a.d_doc_date_pv, 120) AS d_doc_date_pv
// 										,(SELECT TOP 1 c_code FROM fi_br_grp_hdr WHERE fi_br_grp_hdr_id=a.fi_br_grp_hdr_id) AS c_name
// 										,a.c_code_pv
// 									FROM cm_voucher_one a WHERE a.cm_voucher_one_id=?", array($_REQUEST["cm_voucher_one_id"]));

// 			$data["gl_dc_book_type_id"]		= $gl_dc_book_type_id;
// 			$data["c_code"]					= "0";
// 			$data["c_ref_doc"]				= $fi["c_code_pv"];
// 			$data["d_doc_date"]				= $fi["d_doc_date_pv"];
// 			$data["i_enable"]				= STATUS_ENABLE;
// 			$data["i_is_post"]				= 1;
// 			$data["dc_user_create_id"]		= $_SESSION["user_id"];
// 			$data["dc_user_create_cost_id"]	= $_SESSION["dc_cost_id"];
// 			$data["d_create"]				= date("Y-m-d H:i:s");
// 			$data["i_is_reversing"]			= 2;
// 			$data["i_is_close_year"]		= 2;
// 			$data["i_close_year_type"]			= 9;
// 			$data["table_pk_id"]			= $_REQUEST["cm_voucher_one_id"];
// 			$data["table_name"]				= "cm_voucher_one";
// 			$data["table_detail"]			= "ใบสำคัญจ่ายเงิน";
// 			$data["c_code_post"]			= "0";
// 			$data["i_type"]					= 2;
// 			$data["i_preview"]				= 1;
// 			$data["c_comment1"]				= "บันทึกบัญชีเพื่อล้างเจ้าหนี้ เลขที่ ".$fi["c_name"];
// 			$data["i_chk_gl_dtl"]			= GL_CHK_DTL_FALSE; // 2 ยังไม่ตรวจสอบ/ตรวจสอบแล้วไม่ผ่าน
// 			$data["i_chk_gl_purchase"]		= GL_CHK_VAT_TRUE; // 1 ตรวจสอบผ่านแล้ว
		
// 			foreach ($data as $fld => $value) {
// 				$addField .= ", {$fld}";
// 				$addValue .= ", ?";
// 				$arrValue[] = $value;
// 			}
		
// 			$sqlMain3	= "	DECLARE	@c_ref_doc				VARCHAR(20)	= '{$fi["c_code_pv"]}';
// 							DECLARE	@cm_voucher_one_id	NUMERIC		= {$_REQUEST["cm_voucher_one_id"]};
// 							DECLARE	@gl_tran_hdr_id 		NUMERIC;
// 							DECLARE	@n_gl					INTEGER		= 0;
				
// 							SELECT @n_gl = ISNULL(COUNT(gl_tran_hdr_id),0) FROM gl_tran_hdr WHERE c_ref_doc=@c_ref_doc AND i_is_post IN (2,3) AND i_enable=1;
		
// 							IF ( @n_gl=0 )
// 							BEGIN
							
// 								DELETE FROM gl_tran_dtl WHERE gl_tran_hdr_id IN (SELECT gl_tran_hdr_id FROM gl_tran_hdr WHERE table_name='cm_voucher_one' AND table_pk_id=@cm_voucher_one_id AND i_is_post=1)
// 								DELETE FROM gl_tran_hdr WHERE table_name='cm_voucher_one' AND table_pk_id=@cm_voucher_one_id AND i_is_post=1
		
// 								INSERT INTO gl_tran_hdr (".substr($addField, 1).") VALUES (".substr($addValue,1).")
			
// 								SET @gl_tran_hdr_id=@@IDENTITY
			
// 								SELECT
// 									dc_acc_id
// 									,f_dr
// 									,f_cr
// 									,dc_cost_acc_id
// 									,SUM(f_dr) AS f_money_hdr
// 									,i_rank
// 								INTO {$TEMP_NAME}
// 								FROM {$TEMP_PV}
// 								WHERE cm_voucher_one_id=@cm_voucher_one_id
// 								GROUP BY
// 									dc_acc_id
// 									,f_dr
// 									,f_cr
// 									,dc_cost_acc_id
// 									,i_rank
// 								ORDER BY i_rank;
								
// 								INSERT INTO gl_tran_dtl (
// 									gl_tran_hdr_id
// 									,dc_acc_id
// 									,f_dr
// 									,f_cr
// 									,i_is_nontax_exp
// 									,dc_product_id
// 									,dc_cost_acc_id
// 									,i_type_person
// 									,dc_creditor_id
// 									,dc_emp_id
// 									,c_other_name
// 									,i_rank
// 								)
// 								SELECT
// 									@gl_tran_hdr_id
// 									,a.dc_acc_id
// 									,a.f_dr
// 									,a.f_cr
// 									,2
// 									,0
// 									,a.dc_cost_acc_id
// 									,0 AS i_type_person
// 									,0 AS dc_creditor_id
// 									,0 AS dc_emp_id
// 									,'' AS c_other_name
// 									,a.i_rank
// 								FROM {$TEMP_NAME} a WHERE a.f_dr > 0 OR a.f_cr > 0;
			
// 								UPDATE b SET
// 									b.dc_cost_acc_id=a.dc_cost_acc_id
// 								FROM gl_tran_dtl b
// 									INNER JOIN dc_acc a ON a.dc_acc_id=b.dc_acc_id AND ISNULL(a.dc_cost_acc_id,0) > 0
// 								WHERE b.gl_tran_hdr_id=@gl_tran_hdr_id AND ISNULL(a.dc_cost_acc_id,0) > 0 AND a.i_enable=1 AND a.i_last=1;
			
// 								UPDATE gl_tran_hdr SET f_total_amt=(SELECT SUM(f_dr) FROM {$TEMP_NAME}) WHERE gl_tran_hdr_id=@gl_tran_hdr_id;

		
// 								EXECUTE dbo.SP_CHECK_DUPLICATE_SRR_GL @c_ref_doc,@gl_tran_hdr_id
		
// 							END";
		
// 			$db->QueryParam($sqlMain3, $arrValue);
// 		}
// 		//=======================================================================//
		
// 		// DELETE TEMP
// 		$db->BeginTran();
// 		$stmt = $db->QueryParam("DELETE FROM {$TEMP_PV} WHERE cm_voucher_one_id=?", array($_REQUEST["cm_voucher_one_id"]));
// 		if ( $stmt ) {
// 			$row = $db->Fetch($stmt);
// 			$db->CommitTran();
// 			$re = array(
// 					"reval"			=> 0,
// 					"success"		=> "Success",
// 					"msg"			=> $row["msg"]
// 			);
// 		} else {
// 			$db->RollBackTran();
// 			$re = array(
// 					"reval"			=> 1,
// 					"success"		=> "Error",
// 					"msg"			=> "check statement : {$sql}"
// 			);
// 		}
	break;
	
	case "SEND_GX_AP_EXP" : //เบิกค่าใช้จ่าย
		
		echo "ยังทำไม่ได้";exit;
				
// 		$TEMP_NAME	= "#TEMP_DATA_".$_SESSION["user_id"].DATE("YmdHis");
// 		$TEMP_PV	= "temp_pv_gl";
		
// 		$ap_code	= $db->GetDataBySQL("SELECT c_code, ap_expen_hdr_id FROM cm_voucher_one WHERE cm_voucher_one_id=?", array($_REQUEST["cm_voucher_one_id"]));
		
		// DELETE TEMP
// 		$db->QueryParam("DELETE FROM {$TEMP_PV} WHERE cm_voucher_one_id=?", array($_REQUEST["cm_voucher_one_id"]));
		
		//=============================== [DR] เจ้าหนี้ ==============================//
// 		$sqlMain1	= "	DECLARE @cm_voucher_one_id		NUMERIC	= ?;
// 						DECLARE @ap_expen_hdr_id		NUMERIC = {$ap_code["ap_expen_hdr_id"]};
		
// 						SELECT
// 							(ISNULL(SUM(b.f_inv_amount),0) + ISNULL(SUM(b.f_vat_amount),0)) AS f_money
// 							,(SELECT dc_cost_acc_id FROM dc_cost WHERE dc_cost_id=c.dc_cost_id) AS dc_cost_acc_id
// 							,(SELECT dc_acc_id FROM gl_dc_config WHERE i_config=10 AND i_enable=1 AND i_delete=2) AS dc_acc_id
// 							,i_rank=IDENTITY(INT, 1, 1)
// 						INTO {$TEMP_NAME}
// 						FROM ap_expen_hdr c INNER JOIN ap_expen_dtl b ON c.ap_expen_hdr_id=b.ap_expen_hdr_id
// 						WHERE c.ap_expen_hdr_id=@ap_expen_hdr_id
// 						GROUP BY
// 							c.dc_cost_id
// 							,c.i_type_person
// 							,c.dc_creditor_id
// 							,c.dc_emp_id
// 							,c.dc_acc_other_id
// 						HAVING (ISNULL(SUM(b.f_inv_amount),0) + ISNULL(SUM(c.f_vat_amount),0)) > 0;

// 						INSERT INTO {$TEMP_PV}
// 						SELECT
// 							@cm_voucher_one_id AS cm_voucher_one_id
// 							,@ap_expen_hdr_id AS ap_expen_hdr_id
// 							,0 AS fi_br_grp_hdr_id
// 							,dc_acc_id AS dc_acc_id
// 							,0 AS dc_cost_id
// 							,dc_cost_acc_id AS dc_cost_acc_id
// 							,f_money AS f_dr
// 							,0 AS f_cr
// 							,i_rank AS i_rank
// 							,0 AS i_vat_buy
// 						FROM {$TEMP_NAME}";
		
// 		$db->QueryParam($sqlMain1, array($_REQUEST["cm_voucher_one_id"]));
// 		//=======================================================================//
		
		//======= [CR] เช็คเงินสด+[CR] ภาษีหัก ณ ที่จ่ายค้างจ่าย+[DR] ภาษีซื้อ+[CR] ภาษีซื้อยังไม่ถึงกำหนด =======//
		
// 		$dc_cost_acc_finance_code	= "CT0602010000"; // สำนักบัญชีและการเงิน
// 		$acc_tax_code				= "2108020101"; // กำหนดภาษีหัก ณ ที่จ่ายค้างจ่าย
// 		$accBUY						= "1111020701"; // ภาษีซื้อ
// 		$accBUY_NO					= "1111010401"; // ภาษีซื้อยังไม่ถึงกำหนด
		
// 		$sqlMain2	= "	DECLARE @cm_voucher_one_id	NUMERIC	= ?;
// 						DECLARE @ap_expen_hdr_id		NUMERIC = {$ap_code["ap_expen_hdr_id"]};
		
// 						SELECT
// 							SUM(ISNULL(d.f_net_amount,0)) AS f_inv_amt
// 							,SUM(ISNULL(d.f_vat_amount,0)) AS f_vat_amt
// 							,SUM(ISNULL(d.f_tax_amount,0)) AS f_tax_amt
// 							,SUM(ISNULL(d.f_net_amount,0)) + SUM(ISNULL(d.f_vat_amount,0)) + SUM(ISNULL(d.f_tax_amount,0)) AS f_tot_amt
// 							,cost.dc_cost_acc_id AS dc_cost_acc_id_ap
// 							,CASE
// 								WHEN (cost.i_type_region=1) THEN (SELECT dc_cost_acc_id FROM dc_cost WHERE c_code='{$dc_cost_acc_finance_code}')
// 								ELSE cost.dc_cost_acc_id
// 							END AS dc_cost_acc_id_vat_tax
// 							,CASE
// 								WHEN (cash.i_type=2) THEN (SELECT bbb.dc_acc_id FROM dc_cheque aaa INNER JOIN dc_bank_acc bbb ON aaa.dc_bank_acc_id=bbb.dc_bank_acc_id WHERE aaa.dc_cheque_id=b.dc_cheque_id)
// 								WHEN (cash.i_type=3) THEN (SELECT dc_acc_id FROM dc_bank_acc bbb WHERE dc_bank_acc_id=a.dc_bank_acc_id)
// 								ELSE cash.dc_acc_id
// 							END AS dc_acc_id
// 							,CASE
// 								WHEN (cash.i_type=2) THEN (SELECT ' ซึ่งจ่ายด้วยเช็ค เลขที่  '+aaa.c_start_no FROM dc_cheque aaa INNER JOIN dc_bank_acc bbb ON aaa.dc_bank_acc_id=bbb.dc_bank_acc_id WHERE aaa.dc_cheque_id=b.dc_cheque_id)
// 								WHEN (cash.i_type=3) THEN (SELECT ' เลขที่บัญชีธนาคาร คือ '+c_code FROM dc_bank_acc bbb WHERE dc_bank_acc_id=a.dc_bank_acc_id)
// 								ELSE ''
// 							END AS c_comment2
// 							INTO {$TEMP_NAME}
// 						FROM cm_voucher_one a
// 							INNER JOIN fi_pymt_voucher_dtl b ON a.cm_voucher_one_id=b.cm_voucher_one_id
// 							INNER JOIN ap_expen_hdr c ON b.ap_expen_hdr_id=c.ap_expen_hdr_id
// 							INNER JOIN fi_pay_tran_dtl d ON c.ap_expen_hdr_id=d.ap_expen_hdr_id
// 							INNER JOIN vw_dc_cost_type_region cost ON cost.dc_cost_id=c.dc_cost_id
// 							INNER JOIN cm_pay_type cash ON cash.cm_pay_type_id=a.cm_pay_type_id
// 						WHERE a.cm_voucher_one_id=@cm_voucher_one_id AND a.i_enable=1
// 						GROUP BY
// 							cost.i_type_region
// 							,cost.dc_cost_acc_id
// 							,cash.i_type
// 							,cash.dc_acc_id
// 							,b.dc_cheque_id
// 							,a.dc_bank_acc_id
// 						HAVING SUM(ISNULL(d.f_net_amount,0)) > 0;
		
// 						INSERT INTO {$TEMP_PV}
// 						SELECT
// 							@cm_voucher_one_id AS cm_voucher_one_id
// 							,@ap_expen_hdr_id AS ap_expen_hdr_id
// 							,0 AS fi_br_grp_hdr_id
// 							,dc_acc_id AS dc_acc_id
// 							,0 AS dc_cost_id
// 							,dc_cost_acc_id_ap AS dc_cost_acc_id
// 							,0 AS f_dr
// 							,f_inv_amt AS f_cr
// 							,(SELECT MAX(i_rank)+1 FROM {$TEMP_PV} WHERE cm_voucher_one_id=@cm_voucher_one_id) AS i_rank
// 							,0 AS i_vat_buy
// 						FROM {$TEMP_NAME}
// 						GROUP BY dc_cost_acc_id_ap, dc_acc_id;
						
// 						INSERT INTO {$TEMP_PV}
// 						SELECT
// 							@cm_voucher_one_id AS cm_voucher_one_id
// 							,@ap_expen_hdr_id AS ap_expen_hdr_id
// 							,0 AS fi_br_grp_hdr_id
// 							,(SELECT dc_acc_id FROM dc_acc WHERE c_code='{$acc_tax_code}') AS dc_acc_id
// 							,0 AS dc_cost_id
// 							,dc_cost_acc_id_vat_tax AS dc_cost_acc_id
// 							,0 AS f_dr
// 							,SUM(f_tax_amt) AS f_cr
// 							,(SELECT MAX(i_rank)+1 FROM {$TEMP_PV} WHERE cm_voucher_one_id=@cm_voucher_one_id) AS i_rank
// 							,0 AS i_vat_buy
// 						FROM {$TEMP_NAME}
// 						WHERE f_tax_amt > 0
// 						GROUP BY dc_cost_acc_id_vat_tax;
		
// 						INSERT INTO {$TEMP_PV}
// 						SELECT
// 							@cm_voucher_one_id AS cm_voucher_one_id
// 							,@ap_expen_hdr_id AS ap_expen_hdr_id
// 							,0 AS fi_br_grp_hdr_id
// 							,(SELECT dc_acc_id FROM dc_acc WHERE c_code='{$accBUY}') AS dc_acc_id
// 							,0 AS dc_cost_id
// 							,dc_cost_acc_id_vat_tax AS dc_cost_acc_id
// 							,SUM(f_vat_amt) AS f_dr
// 							,0 AS f_cr
// 							,(SELECT MAX(i_rank)+1 FROM {$TEMP_PV} WHERE cm_voucher_one_id=@cm_voucher_one_id) AS i_rank
// 							,1 AS i_vat_buy
// 						FROM {$TEMP_NAME}
// 						WHERE f_vat_amt > 0
// 						GROUP BY dc_cost_acc_id_vat_tax;
						
// 						INSERT INTO {$TEMP_PV}
// 						SELECT
// 							@cm_voucher_one_id AS cm_voucher_one_id
// 							,@ap_expen_hdr_id AS ap_expen_hdr_id
// 							,0 AS fi_br_grp_hdr_id
// 							,(SELECT dc_acc_id FROM dc_acc WHERE c_code='{$accBUY_NO}') AS dc_acc_id
// 							,0 AS dc_cost_id
// 							,dc_cost_acc_id_vat_tax AS dc_cost_acc_id
// 							,0 AS f_dr
// 							,SUM(f_vat_amt) AS f_cr
// 							,(SELECT MAX(i_rank)+1 FROM {$TEMP_PV} WHERE cm_voucher_one_id=@cm_voucher_one_id) AS i_rank
// 							,0 AS i_vat_buy
// 						FROM {$TEMP_NAME}
// 						WHERE f_vat_amt > 0
// 						GROUP BY dc_cost_acc_id_vat_tax;";
		
// 		$db->QueryParam($sqlMain2, array($_REQUEST["cm_voucher_one_id"]));
// 		//=======================================================================//
		
		//===== INSERT GL + UPDATE MONEY_TOT @ GL_TRAN_HDR + CHECK DUPLICATE ====//
// 		$gl_dc_book_type_id	= $db->GetDataBySQL("SELECT TOP 1 ISNULL(a.gl_dc_book_type_id,0) FROM gl_dc_book_doc a INNER JOIN dc_doc b ON a.dc_doc_id=b.dc_doc_id WHERE b.c_code=substring(?,1,2)", array("PV"));
		
// 		if ( $gl_dc_book_type_id != "" ) {
		
// 			$fi	= $db->GetDataBySQL("SELECT
// 										CONVERT(VARCHAR, a.d_doc_date_pv, 120) AS d_doc_date_pv
// 										,(SELECT TOP 1 c_code FROM fi_br_grp_hdr WHERE fi_br_grp_hdr_id=a.fi_br_grp_hdr_id) AS c_name
// 										,a.c_code_pv
// 									FROM cm_voucher_one a WHERE a.cm_voucher_one_id=?", array($_REQUEST["cm_voucher_one_id"]));
			
// 			$data["gl_dc_book_type_id"]		= $gl_dc_book_type_id;
// 			$data["c_code"]					= "0";
// 			$data["c_ref_doc"]				= $fi["c_code_pv"];
// 			$data["d_doc_date"]				= $fi["d_doc_date_pv"];
// 			$data["i_enable"]				= STATUS_ENABLE;
// 			$data["i_is_post"]				= 1;
// 			$data["dc_user_create_id"]		= $_SESSION["user_id"];
// 			$data["dc_user_create_cost_id"]	= $_SESSION["dc_cost_id"];
// 			$data["d_create"]				= date("Y-m-d H:i:s");
// 			$data["i_is_reversing"]			= 2;
// 			$data["i_is_close_year"]		= 2;
// 			$data["i_close_year_type"]			= 9;
// 			$data["table_pk_id"]			= $_REQUEST["cm_voucher_one_id"];
// 			$data["table_name"]				= "cm_voucher_one";
// 			$data["table_detail"]			= "ใบสำคัญจ่ายเงิน";
// 			$data["c_code_post"]			= "0";
// 			$data["i_type"]					= 2;
// 			$data["i_preview"]				= 1;
// 			$data["c_comment1"]				= "บันทึกบัญชีเพื่อล้างเจ้าหนี้ เลขที่ ".$fi["c_name"];
// 			$data["i_chk_gl_dtl"]			= GL_CHK_DTL_FALSE; // 2 ยังไม่ตรวจสอบ/ตรวจสอบแล้วไม่ผ่าน
// 			$data["i_chk_gl_purchase"]		= GL_CHK_VAT_TRUE; // 1 ตรวจสอบผ่านแล้ว
		
// 			foreach ($data as $fld => $value) {
// 				$addField .= ", {$fld}";
// 				$addValue .= ", ?";
// 				$arrValue[] = $value;
// 			}
		
// 			$sqlMain3	= "	DECLARE	@c_ref_doc				VARCHAR(20)	= '{$fi["c_code_pv"]}';
// 							DECLARE	@cm_voucher_one_id	NUMERIC		= {$_REQUEST["cm_voucher_one_id"]};
// 							DECLARE	@gl_tran_hdr_id 		NUMERIC;
// 							DECLARE	@n_gl					INTEGER		= 0;
		
// 							SELECT @n_gl = ISNULL(COUNT(gl_tran_hdr_id),0) FROM gl_tran_hdr WHERE c_ref_doc=@c_ref_doc AND i_is_post IN (2,3) AND i_enable=1;
		
// 							IF ( @n_gl=0 )
// 							BEGIN
								
// 								DELETE FROM gl_tran_dtl WHERE gl_tran_hdr_id IN (SELECT gl_tran_hdr_id FROM gl_tran_hdr WHERE table_name='cm_voucher_one' AND table_pk_id=@cm_voucher_one_id AND i_is_post=1)
// 								DELETE FROM gl_tran_hdr WHERE table_name='cm_voucher_one' AND table_pk_id=@cm_voucher_one_id AND i_is_post=1
							
// 								INSERT INTO gl_tran_hdr (".substr($addField, 1).") VALUES (".substr($addValue,1).")
									
// 								SET @gl_tran_hdr_id=@@IDENTITY
									
// 								SELECT
// 									dc_acc_id
// 									,f_dr
// 									,f_cr
// 									,dc_cost_acc_id
// 									,SUM(f_dr) AS f_money_hdr
// 									,i_rank
// 								INTO {$TEMP_NAME}
// 								FROM {$TEMP_PV}
// 								WHERE cm_voucher_one_id=@cm_voucher_one_id
// 								GROUP BY
// 									dc_acc_id
// 									,f_dr
// 									,f_cr
// 									,dc_cost_acc_id
// 									,i_rank
// 								ORDER BY i_rank;
							
// 								INSERT INTO gl_tran_dtl (
// 									gl_tran_hdr_id
// 									,dc_acc_id
// 									,f_dr
// 									,f_cr
// 									,i_is_nontax_exp
// 									,dc_product_id
// 									,dc_cost_acc_id
// 									,i_type_person
// 									,dc_creditor_id
// 									,dc_emp_id
// 									,c_other_name
// 									,i_rank
// 								)
// 								SELECT
// 									@gl_tran_hdr_id
// 									,a.dc_acc_id
// 									,a.f_dr
// 									,a.f_cr
// 									,2
// 									,0
// 									,a.dc_cost_acc_id
// 									,0 AS i_type_person
// 									,0 AS dc_creditor_id
// 									,0 AS dc_emp_id
// 									,'' AS c_other_name
// 									,a.i_rank
// 								FROM {$TEMP_NAME} a WHERE a.f_dr > 0 OR a.f_cr > 0;
									
// 								UPDATE b SET
// 								b.dc_cost_acc_id=a.dc_cost_acc_id
// 								FROM gl_tran_dtl b
// 									INNER JOIN dc_acc a ON a.dc_acc_id=b.dc_acc_id AND ISNULL(a.dc_cost_acc_id,0) > 0
// 								WHERE b.gl_tran_hdr_id=@gl_tran_hdr_id AND ISNULL(a.dc_cost_acc_id,0) > 0 AND a.i_enable=1 AND a.i_last=1;
									
// 								UPDATE gl_tran_hdr SET f_total_amt=(SELECT SUM(f_dr) FROM {$TEMP_NAME}) WHERE gl_tran_hdr_id=@gl_tran_hdr_id;
							
// 								EXECUTE dbo.SP_CHECK_DUPLICATE_SRR_GL @c_ref_doc,@gl_tran_hdr_id
						
// 							END";
		
// 			$db->QueryParam($sqlMain3, $arrValue);
// 		}
		//=======================================================================//

// 		// DELETE TEMP
// 		$db->BeginTran();
// 		$stmt = $db->QueryParam("DELETE FROM {$TEMP_PV} WHERE cm_voucher_one_id=?", array($_REQUEST["cm_voucher_one_id"]));
// 		if ( $stmt ) {
// 			$row = $db->Fetch($stmt);
// 			$db->CommitTran();
// 			$re = array(
// 					"reval"			=> 0,
// 					"success"		=> "Success",
// 					"msg"			=> $row["msg"]
// 			);
// 		} else {
// 			$db->RollBackTran();
// 			$re = array(
// 					"reval"			=> 1,
// 					"success"		=> "Error",
// 					"msg"			=> "check statement : {$sql}"
// 			);
// 		}
	break;
}

echo json_encode($re);
exit;
?>
