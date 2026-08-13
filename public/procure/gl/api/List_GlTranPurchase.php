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
	
	global $db, $date, $util, $root, $data, $select, $con, $flds, $groupBy, $arr_status;

	$totalCount		= 0;

	// ========================================================================================== //

	// หน่วยธุรกิจ
	$dc_area_id	= explode(";", $_REQUEST["dc_area_id"]);
	if( !in_array( "0", $dc_area_id ) ) {
		$in_arr	= "";
		foreach( $dc_area_id as $val ) {
			$in_arr	.= ( $in_arr == "" )? $val : ", ".$val;
		}
		$con	.= "AND b.dc_area_id IN (".$in_arr.")";
	}
	
	$sqlMain	= "	SET NOCOUNT ON
					SELECT
						a.dc_area_id
						,a.c_branch
						,a.c_name
						,a.c_addr
						,a.c_tax_value
						,b.row_id
						,c.c_ref_doc
						,CONVERT(VARCHAR, c.d_save_date, 120) AS d_save_date
						,CONVERT(VARCHAR, c.d_doc_date, 120) AS d_doc_date
						,b.c_doc
						,b.c_vendor
						,b.c_tax
						,CASE
							WHEN b.i_branch = 1 THEN 'สาขาที่ '+b.c_branch
							WHEN b.i_branch = 2 THEN b.c_branch
							ELSE ''
						END AS cnt_branch
						,b.f_price
						,b.f_vat
					FROM vw_dc_area a
						LEFT JOIN (SELECT
										ROW_NUMBER() OVER(ORDER BY aa.gl_tran_hdr_id DESC) AS row_id
										,aa.*
									FROM gl_tran_purchase_tax aa
									WHERE aa.c_mm = ".$_REQUEST["c_mm"]."
										AND aa.c_yyyy = ".$_REQUEST["c_yyyy"]."
										AND aa.i_more = ".$_REQUEST["i_more"].") b ON a.dc_area_id = b.dc_area_id
						LEFT JOIN gl_tran_hdr c ON b.gl_tran_hdr_id = c.gl_tran_hdr_id
					ORDER BY b.dc_area_id, a.c_branch;";

	$stmt = $db->QueryParam( $sqlMain, array() );
	
	if( $stmt ) {
		
		while( $row = $db->Fetch( $stmt ) ) {
			
			//=================================//
			$area[$row["dc_area_id"]]["c_mm"]			= $date->l_month_thai[$_REQUEST["c_mm"]];
			$area[$row["dc_area_id"]]["c_yyyy"]			= $_REQUEST["c_yyyy"]+543;
			$area[$row["dc_area_id"]]["c_branch"]		= $row["c_branch"];
			$area[$row["dc_area_id"]]["c_name"]			= $row["c_name"];
			$area[$row["dc_area_id"]]["c_addr"]			= $row["c_addr"];
			$area[$row["dc_area_id"]]["c_tax_value"]	= $row["c_tax_value"];
			
			if($row["row_id"] > 0) {
				$dtl[$row["dc_area_id"]][$row["row_id"]]["c_ref_doc"]		= $row["c_ref_doc"];
				$dtl[$row["dc_area_id"]][$row["row_id"]]["d_save_date"]		= $date->shot_date_from_db($row["d_save_date"]);
				$dtl[$row["dc_area_id"]][$row["row_id"]]["d_doc_date"]		= $date->shot_date_from_db($row["d_doc_date"]);
				$dtl[$row["dc_area_id"]][$row["row_id"]]["c_doc"]			= $row["c_doc"];
				$dtl[$row["dc_area_id"]][$row["row_id"]]["c_vendor"]		= $row["c_vendor"];
				$dtl[$row["dc_area_id"]][$row["row_id"]]["c_tax"]			= $row["c_tax"];
				$dtl[$row["dc_area_id"]][$row["row_id"]]["cnt_branch"]		= $row["cnt_branch"];
				$dtl[$row["dc_area_id"]][$row["row_id"]]["f_price"]			= $row["f_price"];
				$dtl[$row["dc_area_id"]][$row["row_id"]]["f_vat"]			= $row["f_vat"];
			}
			//=================================//
			
			$totalCount++;
		}
	}

	return json_encode(array("debug"=>true, "totalCount"=>$totalCount, "area"=>$area, "dtl"=>$dtl));
}
?>