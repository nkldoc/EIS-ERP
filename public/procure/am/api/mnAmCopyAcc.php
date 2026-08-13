<?php
include("../../conf/config.php");
include("../../gl/conf/configGl.php");
include("../../lib/database/DatabaseServer.php");
$db = new DatabaseServer();

$type		= $_REQUEST["type"];
$arrParam	= array();
$data		= array();

switch ( $type ) {
	
	case "COPY" :
		$ref_id			= $_REQUEST["id"];
		$d_save_date	= substr($_REQUEST["d_save_date"],0, 10);
		/*
(gl_tran_hdr_id, dc_acc_id, f_dr, f_cr
						, i_is_nontax_exp, dc_product_id, dc_channel_id
						, dc_cost_acc_id, dc_creditor_type_id, dc_cnt_id
						, dc_emp_id, c_other_name, i_rank
						, i_cont, bh_contract_id)
                 *                  */
		$arrParam[]	= $ref_id;
		$arrParam[] = $d_save_date;
		$arrParam[] = $_SESSION["user_id"];
		$arrParam[] = $_SESSION["dc_cost_id"];
		
		$sqlMain = "SET NOCOUNT ON;
                            DECLARE @ref_id			bigint;
                            DECLARE @d_save_date	datetime;
                            DECLARE @dc_user_id		bigint;
                            DECLARE @dc_cost_id		bigint;

                            SET @ref_id			= ?;
                            SET @d_save_date	= convert(datetime, ?, 102);
                            SET @dc_user_id		= ?;
                            SET @dc_cost_id		= ?;

                            DECLARE @gl_tran_hdr_id	numeric;

                            INSERT INTO gl_tran_hdr (gl_dc_book_type_id, c_yyyy_mm, c_code, c_ref_doc, d_doc_date, d_save_date
                                                    , i_enable, i_is_post, i_parent, dc_user_create_id, dc_user_create_cost_id, d_create
                                                    , dc_user_update_id, dc_user_update_cost_id, d_update, i_is_reversing, i_is_close_year
                                                    , i_close_year_type, f_total_amt, table_pk_id, table_name, table_detail, c_code_post
                                                    , c_mm, c_yyyy, i_type, i_preview, c_comment1, c_comment2, c_comment3, i_chk_gl_dtl, i_chk_gl_purchase)
                            SELECT gl_dc_book_type_id
                                    , cast(year(@d_save_date) as varchar(4))+ right('0'+cast(month(@d_save_date) as varchar(4)),2) as c_yyyy_mm
                                    , '0' as c_code
                                    , left(c_ref_doc,9)+'-C'+CAST ((select count(gl_tran_hdr_id) from gl_tran_hdr where left(c_ref_doc,9) = left(a.c_ref_doc,9) and i_enable = 1) AS varchar(5) ) as c_ref_doc
                                    , @d_save_date as d_doc_date
                                    , @d_save_date as d_save_date
                                    , 1 as i_enable
                                    , 1 as i_is_post
                                    , 0 as i_parent
                                    , @dc_user_id as dc_user_create_id
                                    , @dc_cost_id as dc_user_create_cost_id
                                    , getdate() as d_create
                                    , @dc_user_id as dc_user_update_id
                                    , @dc_cost_id as dc_user_update_cost_id
                                    , getdate() as d_update
                                    , 2 as i_is_reversing
                                    , 2 as i_is_close_year
                                    , 9 as i_close_year_type
                                    , f_total_amt
                                    , table_pk_id
                                    , table_name
                                    , table_detail
                                    , '0' as c_code_post
                                    , right('0'+cast(month(@d_save_date) as varchar(4)),2) as c_mm
                                    , cast(year(@d_save_date) as varchar(4)) as c_yyyy
                                    , 2 as i_type
                                    , 2 as i_preview
                                    , c_comment1
                                    , c_comment2
                                    , c_comment3
                                    , 2 as i_chk_gl_dtl
                                    , 1 as i_chk_gl_purchase
                            FROM  gl_tran_hdr a
                            WHERE gl_tran_hdr_id=@ref_id
					
                            SET @gl_tran_hdr_id=@@IDENTITY;
					
                            INSERT INTO gl_tran_dtl 
                                    (i_rank, gl_tran_hdr_id, dc_cost_acc_id
                                    , dc_acc_id, f_dr, f_cr
                                    , i_type_person, dc_emp_id, dc_debtor_id,dc_creditor_id
                                    , i_is_nontax_exp,dc_product_id,pk_id1,pk_id2 )                                                

                            SELECT i_rank,@gl_tran_hdr_id, dc_cost_acc_id
                                , dc_acc_id, f_dr, f_cr
                                , i_type_person, dc_emp_id, dc_debtor_id,dc_creditor_id
                                , i_is_nontax_exp,dc_product_id,pk_id1,pk_id2
                            FROM gl_tran_dtl 
                            WHERE gl_tran_hdr_id=@ref_id and (f_dr>0 or f_cr>0) ;

                            SELECT gl_tran_hdr_id as new_id, c_ref_doc FROM gl_tran_hdr WHERE gl_tran_hdr_id = @gl_tran_hdr_id ;
					";
		$db->BeginTran();
		$stmt = $db->QueryParam($sqlMain, $arrParam);
		if ( $stmt ) {
			$row = $db->Fetch($stmt);
			$db->CommitTran();
			$re = array(
					"reval"			=> 0,
					"success"		=> "Success",
					"new_id"		=> $row["new_id"],
					"c_ref_doc"		=> $row["c_ref_doc"],
					"msg"			=> "Success"
			);
		} else {
			$db->RollBackTran();
			$re = array(
					"reval"			=> 1,
					"success"		=> "Error",
					"new_id"		=> 0,
					"c_ref_doc"		=> "",
					"msg"			=> "check statement : {$sql}"
			);
		}
	break;
}

echo json_encode($re);
exit;
?>