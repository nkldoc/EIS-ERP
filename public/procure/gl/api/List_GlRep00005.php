<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../../gl/conf/configGl.php");

$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$root		= "data";
$data		= array();
$con		= null;
$select		= null;
$flds		= null;
$groupBy	= null;

function List_QueryParam() {
	
	global $db, $date, $util, $root, $data, $select, $con, $flds, $groupBy;
	
	$totalCount		= 0;
	
	$sqlMain	= "	SET NOCOUNT ON
					SELECT
						a.gl_tran_hdr_id
						,a.c_ref_doc
						,convert(VARCHAR, a.d_doc_date, 120) AS d_doc_date
						,a.c_code
						,convert(VARCHAR, a.d_save_date, 120) AS d_save_date
						,b.i_rank
						,c.dc_acc_id
						,c.c_code+' '+c.c_name AS acc_name
						,d.dc_product_id
						,d.c_name AS product_name
						,e.dc_cost_id
						,e.c_name AS cost_name
						,b.f_dr
						,b.f_cr
						,concat(a.c_comment1,a.c_comment2,a.c_comment3) AS c_comment 
					FROM gl_tran_hdr a
						INNER JOIN gl_tran_dtl b ON a.gl_tran_hdr_id = b.gl_tran_hdr_id
						LEFT JOIN dc_acc c ON b.dc_acc_id = c.dc_acc_id
						LEFT JOIN dc_product d ON b.dc_product_id = d.dc_product_id
						LEFT JOIN dc_cost e ON b.dc_cost_acc_id = e.dc_cost_id
					WHERE a.c_yyyy={$_REQUEST["year"]}
						AND a.i_is_close_year=".GL_CLOSE_YEAR_PERIOD."
						AND a.i_enable=".STATUS_ENABLE."
						AND a.i_is_post IN (".BOOK_ACC_GX.",".BOOK_ACC_GL.")
					ORDER BY a.c_code, b.i_rank;";

	$stmt = $db->QueryParam( $sqlMain, array() );
	
	if( $stmt ) {
		
		$sum_f_dr	= 0;
		$sum_f_cr	= 0;
		
		while( $row = $db->Fetch( $stmt ) ) {
			
			$Arr1[$row["gl_tran_hdr_id"]]["c_ref_doc"]		= $row["c_ref_doc"];
			$Arr1[$row["gl_tran_hdr_id"]]["d_doc_date"]		= $row["d_doc_date"];
			$Arr1[$row["gl_tran_hdr_id"]]["c_code"]			= $row["c_code"];
			$Arr1[$row["gl_tran_hdr_id"]]["d_save_date"]	= $row["d_save_date"];
			$Arr1[$row["gl_tran_hdr_id"]]["c_comment"]		= $row["c_comment"];
				
			$Arr2[$row["gl_tran_hdr_id"]][$row["i_rank"]]["i_rank"]			= $row["i_rank"];
			$Arr2[$row["gl_tran_hdr_id"]][$row["i_rank"]]["acc_name"]		= $row["acc_name"];
			$Arr2[$row["gl_tran_hdr_id"]][$row["i_rank"]]["product_name"]	= $row["product_name"];
			$Arr2[$row["gl_tran_hdr_id"]][$row["i_rank"]]["cost_name"]		= $row["cost_name"];
			$Arr2[$row["gl_tran_hdr_id"]][$row["i_rank"]]["f_dr"]			= $row["f_dr"];
			$Arr2[$row["gl_tran_hdr_id"]][$row["i_rank"]]["f_cr"]			= $row["f_cr"];
			
			$sum_f_dr	+= $row["f_dr"];
			$sum_f_cr	+= $row["f_cr"];
			
			$totalCount++;
		}
		
		if(is_array(@$Arr1)) {
			
			foreach( $Arr1 AS $hdr_id => $obj1 ) {
					
				//=================================//
				$temp		= array();
				$f_dr		= 0;
				$f_cr		= 0;
			
				$temp["i_type"]				= 1;
				$temp["c_ref_doc"]			= $obj1["c_ref_doc"];
				$temp["d_doc_date"]			= $obj1["d_doc_date"];
				$temp["c_code"]				= $obj1["c_code"];
				$temp["d_save_date"]		= $obj1["d_save_date"];
			
				${$root}[]	= $temp;
				
				//=================================//

				foreach( $Arr2[$hdr_id] AS $dtl_id => $obj2 ) {
					
					//=================================//
					$temp		= array();
						
					$temp["i_type"]				= 2;
					$temp["i_rank"]				= $obj2["i_rank"].".";
					$temp["acc_name"]			= $obj2["acc_name"];
					$temp["product_name"]		= $obj2["product_name"];
					$temp["cost_name"]			= $obj2["cost_name"];
					$temp["f_dr"]				= $obj2["f_dr"];
					$temp["f_cr"]				= $obj2["f_cr"];
					
					$f_dr		+= $obj2["f_dr"];
					$f_cr		+= $obj2["f_cr"];
					
					${$root}[]	= $temp;
					
					//=================================//
				}
				
				// ============== รวม ============== //
				$temp		= array();
					
				$temp["i_type"]				= 3;
				$temp["f_dr"]				= $f_dr;
				$temp["f_cr"]				= $f_cr;
					
				${$root}[]	= $temp;
				
				//=================================//
				
				// ============= คำอธิบาย ============ //
				$temp		= array();
				
				$c_comment	= ($obj1["c_comment"] == "")? "-" : $obj1["c_comment"];
				
					
				$temp["i_type"]				= 4;
				$temp["c_comment"]			= "<font color='red'>คำอธิบายรายการ : </font>".$c_comment;
					
				${$root}[]	= $temp;
				
				//=================================//
				
			}
			
			// ============= รวมทั้งหมด ============ //
			$temp		= array();
			
			$temp["i_type"]				= 5;
			$temp["f_dr"]				= $sum_f_dr;
			$temp["f_cr"]				= $sum_f_cr;
				
			${$root}[]	= $temp;
			
			//=================================//
			
		}
	}

	return json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
}
?>