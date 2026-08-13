<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php"); 
include("../../lib/date/i_date.class.php");
include("../conf/configAp.php");

$db 		= new DatabaseServer();
$date		= new i_date();

$root		= "data";
$data		= array();
$con		= null;

function List_QueryParam() {
	
	global $db,$date,$root,$data, $con,$ARR_GL_CFG_TEXT,$arr_status;
 
	$totalCount		= 0;
	
	// GL_BOOK_TYPE
	if($_REQUEST['dc_bg_type_id'] > 0) {
		$gl_book_type	= " AND a.dc_bg_type_id = ".$_REQUEST['dc_bg_type_id'];
	} else {
		$gl_book_type	= null;
	}
	
	/*
	// i_is_post
	if($_REQUEST['i_is_post'] == '1') {
		$i_is_post		= " AND a.i_is_post IN (2,3)";
	} else {
		$i_is_post		= " AND a.i_is_post IN (".$_REQUEST['i_is_post'].")";
	}
	*/
	
	$sqlMain = "DECLARE @d_save_date_start VARCHAR(100) = ?;
				DECLARE @d_save_date_end VARCHAR(100) = ?;
				
				DECLARE @table_data AS TABLE(
					c_ref_doc VARCHAR(200),
					d_doc_date DATE,
					c_code VARCHAR(200),
					d_save_date DATE,
					i_rank INT,
					dc_acc_id INT,
					dc_product_id INT,
					dc_cost_acc_id INT,
					f_dr DECIMAL(18,2),
					f_cr DECIMAL(18,2),
					c_reverse VARCHAR(200),
					c_comment VARCHAR(1000) );
					
				DECLARE @table_show AS TABLE(
					i_type INT,
					c_ref_doc VARCHAR(200),
					d_doc_date DATE,
					c_code VARCHAR(200),
					d_save_date DATE,
					i_rank INT,
					c_acc_code VARCHAR(200),
					c_acc_name VARCHAR(200),
					c_product_name VARCHAR(200),
					c_cost_name VARCHAR(200),
					f_dr DECIMAL(18,2),
					f_cr DECIMAL(18,2),
					c_reverse VARCHAR(200),
					c_comment VARCHAR(1000) );
				
				SET NOCOUNT ON
				/* DATA */
				INSERT INTO @table_data
				SELECT
					a.c_ref_doc,
					a.d_doc_date,
					a.c_code,
					a.d_save_date,
					b.i_rank,
					b.dc_acc_id,
					b.dc_product_id,
					b.dc_cost_acc_id,
					b.f_dr,
					b.f_cr,
					CASE	WHEN ((a.i_is_reversing=1) AND (b.i_is_nontax_exp=1)) THEN 'โอนกลับรายการต้นงวดและเป็นรายการบวกกลับ'
							WHEN ((a.i_is_reversing=1) AND (b.i_is_nontax_exp=2)) THEN 'โอนกลับรายการต้นงวด'
							WHEN ((a.i_is_reversing=2) AND (b.i_is_nontax_exp=1)) THEN 'เป็นรายการบวกกลับ'
							ELSE NULL END,
					a.c_comment1+a.c_comment2+a.c_comment3
				FROM gl_tran_hdr a INNER JOIN gl_tran_dtl b ON a.gl_tran_hdr_id = b.gl_tran_hdr_id
				WHERE a.d_save_date between CONVERT(DATETIME,@d_save_date_start,120) AND CONVERT(DATETIME,@d_save_date_end,120)
					AND a.i_enable=".STATUS_ENABLE."
					$gl_book_type
					$i_is_post
				;
				
				/* i_type 1 */
				INSERT INTO @table_show(i_type, c_ref_doc, d_doc_date, c_code, d_save_date)
				SELECT
					1,
					c_ref_doc,
					d_doc_date,
					c_code,
					d_save_date
				FROM @table_data
				GROUP BY c_ref_doc, d_doc_date, c_code, d_save_date;
				
				/* i_type 2 */
				INSERT INTO @table_show(i_type, c_ref_doc, i_rank, c_acc_code, c_acc_name, c_product_name, c_cost_name, f_dr, f_cr, c_reverse)
				SELECT
					2,
					a.c_ref_doc,
					a.i_rank,
					b.c_code,
					b.c_name,
					c.c_name,
					d.c_name,
					a.f_dr,
					a.f_cr,
					a.c_reverse
				FROM @table_data a LEFT JOIN dc_acc b ON a.dc_acc_id = b.dc_acc_id
					LEFT JOIN dc_product c ON a.dc_product_id = c.dc_product_id
					LEFT JOIN dc_cost d ON a.dc_cost_acc_id = d.dc_cost_id
				ORDER BY a.c_ref_doc, a.i_rank;
				
				/* i_type 3 */
				INSERT INTO @table_show(i_type, c_ref_doc, f_dr, f_cr)
				SELECT
					3,
					c_ref_doc,
					SUM(f_dr),
					SUM(f_cr)
				FROM @table_data
				GROUP BY c_ref_doc;
				
				/* i_type 4 */
				INSERT INTO @table_show(i_type, c_ref_doc, c_comment)
				SELECT
					4,
					c_ref_doc,
					c_comment
				FROM @table_data
				GROUP BY c_ref_doc, c_comment;
				
				/* i_type 6 */
				INSERT INTO @table_show(i_type, c_ref_doc, f_dr, f_cr)
				SELECT
					6,
					'ZZ9999999',
					SUM(f_dr),
					SUM(f_cr)
				FROM @table_data;
				
				DECLARE @table_numrow AS TABLE(
					numrow NUMERIC(11,0) IDENTITY(1,1) NOT NULL,
					i_type INT,
					c_ref_doc VARCHAR(200),
					d_doc_date DATE,
					c_code VARCHAR(200),
					d_save_date DATE,
					i_rank INT,
					c_acc_code VARCHAR(200),
					c_acc_name VARCHAR(200),
					c_product_name VARCHAR(200),
					c_cost_name VARCHAR(200),
					f_dr DECIMAL(18,2),
					f_cr DECIMAL(18,2),
					c_reverse VARCHAR(200),
					c_comment VARCHAR(1000) );
				
				INSERT INTO @table_numrow
				SELECT * FROM @table_show
				ORDER BY c_ref_doc, i_type, i_rank;
				
				SELECT *,
					isnull(convert(VARCHAR, d_doc_date, 120), '') as d_doc_date2, 
					isnull(convert(VARCHAR, d_save_date, 120), '') as d_save_date2
				FROM @table_numrow
				ORDER BY numrow;";
	
	$arrParam[]	= $_REQUEST["date_start"];
	$arrParam[]	= $_REQUEST["date_end"];

	$stmt = $db->QueryParam( $sqlMain, $arrParam );
	
	if( $stmt ) {
		while($row =$db->Fetch($stmt))
		{
			$temp = array(	"no"				=> $row["numrow"],
							"i_type"			=> $row["i_type"],
							"c_ref_doc"			=> $row["c_ref_doc"],
							"d_doc_date"		=> ($row["d_doc_date2"] != "")? $date->shot_date_from_db($row["d_doc_date2"]) : "",
							"c_code"			=> $row["c_code"],
							"d_save_date"		=> ($row["d_save_date2"] != "")? $date->shot_date_from_db($row["d_save_date2"]) : "",
							"i_rank"			=> $row["i_rank"],
							"c_acc_code"		=> $row["c_acc_code"],
							"c_acc_name"		=> $row["c_acc_name"],
							"c_product_name"	=> $row["c_product_name"],
							"c_cost_name"		=> $row["c_cost_name"],
							"f_dr"				=> $row["f_dr"],
							"f_cr"				=> $row["f_cr"],
							"c_reverse"			=> $row["c_reverse"],
							"c_comment"			=> $row["c_comment"] );
		
			${$root}[] = $temp;
		}
	}

	return json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
}

?>
