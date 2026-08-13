<?php
include("../../ap/conf/configAp.php");
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
	
	case "APRecordExp" : // AP ค่าใช้จ่าย
		
		$sqlMain = "SET NOCOUNT ON;
					DECLARE @ap_expen_hdr_id		numeric;
					DECLARE @ap_code				varchar(20);
					DECLARE @dc_cost_acc_id_fin 	numeric;
					DECLARE @dc_acc_id				numeric;
					DECLARE @gl_dc_book_type_id		bigint;
					DECLARE @gl_code				varchar(20);
					DECLARE @i_type_person			bigint;
					DECLARE @dc_creditor_id				bigint;
					DECLARE @conf_department		int;
					DECLARE @conf_analog			int;
					DECLARE @gl_tran_hdr_id			bigint;
					DECLARE @dc_user_id				bigint;
					DECLARE @dc_cost_id				bigint;
					
					SET @ap_expen_hdr_id			= ".$_REQUEST["ap_expen_hdr_id"].";
					SET @ap_code					= '".$_REQUEST["ap_code"]."';
					SET @conf_department			= ".GL_CFG_COST_ACC.";
					SET @conf_analog				= ".GL_CFG_CLOSE_YEAR_LICENSE_ANALOG.";
					SET @dc_user_id					= ".$_SESSION["user_id"].";
					SET @dc_cost_id					= ".$_SESSION["dc_cost_id"].";
					
					SET @gl_dc_book_type_id = ISNULL((SELECT gl_dc_book_type_id FROM gl_dc_book_doc a INNER JOIN dc_doc b ON a.dc_doc_id=b.dc_doc_id WHERE b.c_code=SUBSTRING(@ap_code,1,2)),0);
					
					if (@gl_dc_book_type_id=0)
						select 'ระบบไม่สามารถบันทึกบัญชีได้ เนื่องจาก :\\n ยังไม่ได้จับคู่เลขที่เอกสารการเบิกค่าใช้จ่าย (AP) กับประเภทสมุดบัญชีรายวัน\\nกรุณาจับคู่เลขที่เอกสารการเบิกค่าใช้จ่าย (AP) กับประเภทสมุดบัญชีรายวันก่อน'  as msg;
					else
					begin
						SET @gl_code = isnull((select top 1 c_code FROM gl_tran_hdr WHERE c_ref_doc=@ap_code and i_is_post IN (2,3) AND i_enable=1 ),'');
						if (@gl_code = '')
						begin
							
							DELETE FROM gl_tran_dtl WHERE gl_tran_hdr_id IN (SELECT gl_tran_hdr_id FROM gl_tran_hdr WHERE table_name='ap_expen_hdr' AND table_pk_id=@ap_expen_hdr_id AND i_is_post=1)
							DELETE FROM gl_tran_hdr WHERE table_name='ap_expen_hdr' AND table_pk_id=@ap_expen_hdr_id AND i_is_post=1
					
							select @dc_cost_acc_id_fin = b.dc_cost_acc_id from gl_dc_config a
								inner join dc_cost b on a.dc_cost_acc_id = b.dc_cost_id
							where a.i_config = @conf_department and a.i_enable = 1 and a.i_delete = 2;
					
							SELECT	@dc_acc_id = (SELECT dc_acc_id FROM gl_dc_config WHERE i_config=10 AND i_enable=1 AND i_delete=2)
								, @i_type_person = i_type_person
								, @dc_creditor_id = dc_creditor_id
							FROM ap_expen_hdr c
							WHERE c.ap_expen_hdr_id = @ap_expen_hdr_id;
					
							insert into gl_tran_hdr (
								gl_dc_book_type_id
								,c_code
								,c_ref_doc
								,i_is_post
								,i_is_reversing
								,i_is_close_year
								, i_close_year_type
								,table_pk_id
								,table_name
								,table_detail
								,c_code_post
								,i_type
								,i_preview
								,d_doc_date
								,c_comment1
								,i_enable
								,dc_user_create_id
								,dc_user_create_cost_id
								,d_create
								,i_chk_gl_dtl
								,i_chk_gl_purchase )
							select
								@gl_dc_book_type_id
								,'0'
								,c_code
								,1
								,2
								,2
								,9
								,@ap_expen_hdr_id
								,'ap_expen_hdr'
								,'ใบเบิก AP ค่าใช้จ่าย'
								,'0'
								,2
								,1
								,d_doc_date
								,left(c_name, 100)
								,1
								,@dc_user_id
								,@dc_cost_id
								,getdate()
								,".GL_CHK_DTL_FALSE."
								,".GL_CHK_VAT_TRUE." 
							from ap_expen_hdr where ap_expen_hdr_id = @ap_expen_hdr_id;
					
							SET @gl_tran_hdr_id=@@IDENTITY;
					
							insert into gl_tran_dtl (gl_tran_hdr_id, dc_acc_id, f_dr, f_cr, dc_cost_acc_id, i_type_person, dc_creditor_id
											, i_is_nontax_exp, dc_product_id, dc_emp_id, c_other_name, i_rank)
							select @gl_tran_hdr_id, dc_acc_id, f_dr, f_cr, dc_cost_acc_id, i_type_person, dc_creditor_id
									, 2, 0, 0, '' ,ROW_NUMBER() OVER (ORDER BY temp_table.i_flag ASC, temp_table.dc_acc_id ASC) AS i_rank
							from (SELECT @ap_expen_hdr_id as ap_expen_hdr_id
								, b.dc_acc_id
								, Case 
										When isnull(b.dc_cost_id,0)=0  Then a.dc_cost_id 
										Else b.dc_cost_id
								End as dc_cost_acc_id
								, sum(isnull(b.f_inv_amount,0)) as f_dr
								, cast(0.00 as decimal(18,2)) as f_cr
								, 1 as i_flag
								,@i_type_person as i_type_person
								,@dc_creditor_id as dc_creditor_id
							FROM 	ap_expen_hdr a inner join ap_expen_dtl b on a.ap_expen_hdr_id=b.ap_expen_hdr_id
							WHERE a.ap_expen_hdr_id=@ap_expen_hdr_id
							GROUP BY b.dc_acc_id,
								Case 
									When isnull(b.dc_cost_id,0)=0 Then a.dc_cost_id 
									Else b.dc_cost_id
								End
							HAVING	sum(isnull(b.f_inv_amount,0)) > 0 
							UNION
							SELECT	@ap_expen_hdr_id
									,v.dc_acc_income_id  AS dc_acc_id
									,case 
										when (d.i_branch = 1) then c.dc_cost_acc_id
										else  @dc_cost_acc_id_fin
									end AS dc_cost_acc_id
									, sum(isnull(b.f_vat_amount,0))   AS f_dr
									, cast(0.00 as decimal(18,2)) as f_cr
									, 2 as i_flag
									, 0
									, 0
							FROM	ap_expen_hdr a inner join ap_expen_dtl b on a.ap_expen_hdr_id=b.ap_expen_hdr_id AND a.ap_expen_hdr_id = @ap_expen_hdr_id
								inner join dc_vat v on v.dc_vat_id = b.dc_vat_id
								inner join dc_cost c on c.dc_cost_id = a.dc_cost_id
								inner join dc_area d on c.dc_area_id = d.dc_area_id
							WHERE	a.ap_expen_hdr_id = @ap_expen_hdr_id
							GROUP BY  
								case 
									when (d.i_branch = 1) then c.dc_cost_acc_id 
									else @dc_cost_acc_id_fin
								end    
								,d.i_branch,v.dc_acc_income_id
							HAVING	sum(isnull(b.f_vat_amount,0))   > 0 
							UNION
							SELECT	@ap_expen_hdr_id
								, @dc_acc_id as dc_acc_id
								, cost.dc_cost_acc_id   AS dc_cost_acc_id
								,  cast(0.00 as decimal(18,2)) as f_dr
								,(isnull(d.f_inv_amount,0) + isnull(d.f_vat_amount,0)) as  f_cr
								, 3 as i_flag
								, @i_type_person  
								, @dc_creditor_id 
							FROM	 ap_expen_hdr c inner join ap_expen_dtl d on c.ap_expen_hdr_id=d.ap_expen_hdr_id AND c.ap_expen_hdr_id = @ap_expen_hdr_id
								inner join dc_cost cost on cost.dc_cost_id = c.dc_cost_id 
							WHERE	c.ap_expen_hdr_id = @ap_expen_hdr_id
							GROUP BY   cost.dc_cost_acc_id,d.f_inv_amount,d.f_vat_amount
							HAVING	(isnull(d.f_inv_amount,0) + isnull(d.f_vat_amount,0)) > 0 ) as temp_table
							where f_dr>0 or f_cr>0;
					
							Update gl_tran_hdr 
							Set f_total_amt=(select sum(f_dr) from gl_tran_dtl where gl_tran_hdr_id = @gl_tran_hdr_id)
							where  gl_tran_hdr_id = @gl_tran_hdr_id;
					
							select 'Success' as msg;
						end
						else
						select 'เลขที่เอกสาร '+@ap_code+' นี้ ระบบได้ออกเลขที่อ้างอิง '+@gl_code+' แล้ว กรุณาตรวจสอบรายการ' as msg;
					end";

		$db->BeginTran();
		$stmt = $db->QueryParam($sqlMain, $arrParam);
		if ( $stmt ) {
			$row = $db->Fetch($stmt);
			$db->CommitTran();
			$re = array(
					"reval"			=> 0,
					"success"		=> true,
					"msg"			=> $row["msg"]
			);
		} else {
			$db->RollBackTran();
			$re = array(
					"reval"			=> 1,
					"success"		=> false,
					"msg"			=> "check statement : {$sql}"
			);
		}
		break;
	
// 	case "APRecordPur" : // AP จัดซื้อ

// 		$TEMP_NAME	= "#TEMP_DATA_".$_SESSION["user_id"].DATE("YmdHis");
// 		// DELETE TEMP
// 		$db->QueryParam("DELETE FROM temp_ap_gl WHERE ap_expen_hdr_id=?", array($_REQUEST["ap_expen_hdr_id"]));

// 		//=================== ใบเบิก AP จัดซื้อ i_flag 1=DR วัสดุคงเหลือ/พัสดุ ===================//
// 		$sqlMain1	= "	DECLARE @ap_expen_hdr_id	NUMERIC	= ?;
// 						DECLARE @i_flag				TINYINT	= 1;
						
// 						SELECT
// 							SUM(a.f_inv_amount) AS f_money
// 							,cost.dc_cost_acc_id AS dc_cost_acc_id
// 							,ISNULL(d.dc_acc_conf_recv,0) AS dc_acc_id
// 							,i_rank=IDENTITY(INT, 1, 1)
// 							INTO {$TEMP_NAME}
// 							FROM ap_expen_dtl a
// 								INNER JOIN ap_expen_hdr e ON e.ap_expen_hdr_id=a.ap_expen_hdr_id
// 								INNER JOIN dc_cost cost ON cost.dc_cost_id=e.dc_cost_id
// 								INNER JOIN ap_period_dtl b ON a.ap_period_dtl_id=b.ap_period_dtl_id
// 								INNER JOIN ap_po_dtl c ON b.ap_po_dtl_id=c.ap_po_dtl_id
// 								LEFT OUTER JOIN dc_inv_type d ON d.dc_inv_type_id=c.dc_inv_type_id
// 							WHERE a.ap_expen_hdr_id=@ap_expen_hdr_id
// 							GROUP BY
// 								cost.dc_cost_acc_id
// 								,d.dc_acc_conf_recv
// 							HAVING SUM(a.f_inv_amount) > 0
							
// 							INSERT INTO temp_ap_gl
// 							SELECT
// 								@ap_expen_hdr_id
// 								,dc_acc_id
// 								,0
// 								,dc_cost_acc_id
// 								,f_money
// 								,0
// 								,@i_flag
// 								,i_rank
// 							FROM {$TEMP_NAME} WHERE f_money > 0";
		
// 		$db->QueryParam($sqlMain1, array($_REQUEST["ap_expen_hdr_id"]));
// 		//=======================================================================//
		
// 		//====================== ใบเบิก AP จัดซื้อ i_flag 2=DR Vat ======================//
// 		$dc_cost_acc_finance_code	= 'CT0602010000'; //สำนักบัญชีและการเงิน
		
// 		$sqlMain2	= "	DECLARE @ap_expen_hdr_id		NUMERIC		= ?;
// 						DECLARE @i_flag					TINYINT		= 2;
// 						DECLARE @dc_cost_acc_finance	VARCHAR(20)	= '{$dc_cost_acc_finance_code}';
// 						DECLARE @dc_cost_acc_id			NUMERIC; 
//  						DECLARE @new_i_rank				INTEGER;

// 						SELECT @dc_cost_acc_id	= ISNULL(dc_cost_acc_id,0) FROM dc_cost WHERE c_code=@dc_cost_acc_finance AND i_enable=1 AND i_last=1;
// 						SELECT @new_i_rank		= MAX(i_rank)+1 FROM temp_ap_gl WHERE ap_expen_hdr_id=@ap_expen_hdr_id;

// 						SELECT
// 							ISNULL(b.dc_acc_income,0) AS dc_acc_id
// 							,ISNULL(SUM(a.f_vat_amount),0) AS f_money
// 						INTO {$TEMP_NAME}
// 						FROM ap_expen_hdr a
// 							INNER JOIN dc_tax b ON a.dc_tax_id=b.dc_tax_id
// 						WHERE a.ap_expen_hdr_id=@ap_expen_hdr_id 
// 						GROUP BY b.dc_acc_income
// 						HAVING ISNULL(SUM(a.f_vat_amount),0) > 0

// 						INSERT INTO temp_ap_gl
// 						SELECT
// 							@ap_expen_hdr_id
// 							,dc_acc_id
// 							,0
// 							,@dc_cost_acc_id
// 							,f_money
// 							,0
// 							,@i_flag
// 							,@new_i_rank
// 							,0
// 							,0
// 						FROM {$TEMP_NAME} WHERE f_money > 0";
		
// 		$db->QueryParam($sqlMain2, array($_REQUEST["ap_expen_hdr_id"]));
// 		//=======================================================================//
		
// 		//====================== ใบเบิก AP จัดซื้อ i_flag 3=CR เจ้าหนี้ ======================//
// 		$new_i_rank	= $db->GetDataBySQL("SELECT MAX(i_rank)+1 FROM temp_ap_gl WHERE ap_expen_hdr_id=?", array($_REQUEST["ap_expen_hdr_id"]));
// 		$sqlMain3	= "	DECLARE @ap_expen_hdr_id		NUMERIC	= ?;
// 						DECLARE @i_flag					TINYINT	= 3;

// 						SELECT
// 							SUM(a.f_vat_amount+a.f_total_amount) AS f_money
// 							,c.dc_cost_acc_id AS dc_cost_acc_id
// 							,ISNULL(b.dc_acc_id_cred,0) AS dc_acc_id
// 							,i_rank=IDENTITY(INT,{$new_i_rank},1)
// 						INTO {$TEMP_NAME}
// 						FROM ap_expen_hdr a
// 							INNER JOIN dc_cnt b ON a.dc_creditor_id=b.dc_creditor_id
// 							INNER JOIN dc_cost c ON c.dc_cost_id=a.dc_cost_id  
// 						WHERE a.ap_expen_hdr_id=@ap_expen_hdr_id
// 						GROUP BY
// 							c.dc_cost_acc_id
// 							,b.dc_acc_id_cred
// 						HAVING SUM(a.f_vat_amount+a.f_total_amount) > 0
						
// 						INSERT INTO temp_ap_gl
// 						SELECT
// 							@ap_expen_hdr_id
// 							,dc_acc_id
// 							,0
// 							,dc_cost_acc_id
// 							,0
// 							,f_money
// 							,@i_flag
// 							,i_rank
// 						FROM {$TEMP_NAME} WHERE f_money > 0";

// 		$db->QueryParam($sqlMain3, array($_REQUEST["ap_expen_hdr_id"]));
// 		//=======================================================================//

// 		//===== INSERT GL + UPDATE MONEY_TOT @ GL_TRAN_HDR + CHECK DUPLICATE ====//
// 		if ($_REQUEST["gl_dc_book_type_id"] != "") {
			
// 			$fi	= $db->GetDataBySQL("SELECT
// 										CONVERT(VARCHAR, d_doc_date, 120) AS d_doc_date
// 										,LEFT(c_name,100) AS c_name
// 										,c_code
// 										,dc_creditor_id
// 									FROM ap_expen_hdr WHERE ap_expen_hdr_id=?", array($_REQUEST["ap_expen_hdr_id"]));

// 			$data["gl_dc_book_type_id"]		= $_REQUEST["gl_dc_book_type_id"];
// 			$data["c_code"]					= "0";
// 			$data["c_ref_doc"]				= $fi["c_code"];
// 			$data["d_doc_date"]				= $fi["d_doc_date"];
// 			$data["i_enable"]				= STATUS_ENABLE;
// 			$data["i_is_post"]				= 1;
// 			$data["dc_user_create_id"]		= $_SESSION["user_id"];
// 			$data["dc_user_create_cost_id"]	= $_SESSION["dc_cost_id"];
// 			$data["d_create"]				= date("Y-m-d H:i:s");
// 			$data["i_is_reversing"]			= 2;
// 			$data["i_is_close_year"]		= 2;
// 			$data["i_close_year_type"]			= 9;
// 			$data["table_pk_id"]			= $_REQUEST["ap_expen_hdr_id"];
// 			$data["table_name"]				= "ap_expen_hdr";
// 			$data["table_detail"]			= "ใบเบิกค่าใช้จ่าย/ใบเบิกจัดซื้อจัดจ้าง";
// 			$data["c_code_post"]			= "0";
// 			$data["i_type"]					= 2;
// 			$data["i_preview"]				= 1;
// 			$data["c_comment1"]				= $fi["c_name"];
// 			$data["i_chk_gl_dtl"]			= GL_CHK_DTL_FALSE; // 2 ยังไม่ตรวจสอบ/ตรวจสอบแล้วไม่ผ่าน
// 			$data["i_chk_gl_purchase"]		= GL_CHK_VAT_TRUE; // 1 ตรวจสอบผ่านแล้ว
			
// 			foreach ($data as $fld => $value) {
// 				$addField .= ", {$fld}";
// 				$addValue .= ", ?";
// 				$arrValue[] = $value;
// 			}
	
// 			$sqlMain4	= "	DECLARE	@c_ref_doc			VARCHAR(20)	= '{$fi["c_code"]}';
// 							DECLARE	@ap_expen_hdr_id NUMERIC		= {$_REQUEST["ap_expen_hdr_id"]};
// 							DECLARE	@gl_tran_hdr_id 	NUMERIC;
// 							DECLARE @dc_creditor_id			NUMERIC		= {$fi["dc_creditor_id"]};
// 							DECLARE	@n_gl				INTEGER		= 0;
		
// 							SELECT @n_gl = ISNULL(COUNT(gl_tran_hdr_id),0) FROM gl_tran_hdr WHERE c_ref_doc=@c_ref_doc AND i_is_post IN (2,3) AND i_enable=1;
							
// 							IF ( @n_gl=0 )
// 							BEGIN
								
// 								DELETE FROM gl_tran_dtl WHERE gl_tran_hdr_id IN (SELECT gl_tran_hdr_id FROM gl_tran_hdr WHERE table_name='ap_expen_hdr' AND table_pk_id=@ap_expen_hdr_id AND i_is_post=1)
// 								DELETE FROM gl_tran_hdr WHERE table_name='ap_expen_hdr' AND table_pk_id=@ap_expen_hdr_id AND i_is_post=1
								
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
// 								FROM temp_ap_gl
// 								WHERE ap_expen_hdr_id=@ap_expen_hdr_id
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
// 									,dc_acc_id
// 									,f_dr
// 									,f_cr
// 									,2
// 									,0
// 									,dc_cost_acc_id
// 									,0
// 									,0
// 									,0
// 									,''
// 									,i_rank
// 								FROM {$TEMP_NAME} WHERE f_dr > 0 OR f_cr > 0
								
// 								UPDATE gl_tran_hdr SET f_total_amt=(SELECT SUM(f_money_hdr) FROM {$TEMP_NAME}) WHERE gl_tran_hdr_id=@gl_tran_hdr_id;
								
// 								EXECUTE dbo.SP_CHECK_DUPLICATE_SRR_GL @c_ref_doc,@gl_tran_hdr_id
								
// 							END";
			
// 			$db->QueryParam($sqlMain4, $arrValue);
// 		}
// 		//=======================================================================//
		
// 		// DELETE TEMP
// 		$db->QueryParam("DELETE FROM temp_ap_gl WHERE ap_expen_hdr_id=?", array($_REQUEST["ap_expen_hdr_id"]));
		
// 		$re = array(
// 				"reval"			=> 0,
// 				"success"		=> "Success",
// 				"msg"			=> ""
// 		);
		
// 	break;
}

echo json_encode($re);
exit;
?>
