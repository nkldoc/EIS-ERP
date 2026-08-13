<?php 
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$root		= "data";
$data		= array();
$con		= null;

if( $_REQUEST["type"] == "imp_expense_dtl" ) {

	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];
	
	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];
	
	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }

// 	switch($i_read) {
// 		case 1:		$con = " AND a.dc_user_create_id=".$_SESSION["user_id"]; break;
// 		case 2:		$con = " AND a.dc_user_create_cost_id=".$_SESSION["dc_cost_id"]; break;
// 		default:	$con = "";
// 	}

	if($mode == "SEARCH") {
		
		if($_REQUEST["filter"] != "") {
			$con	.= " AND b.".$_REQUEST["filter"]." LIKE '%".@$_REQUEST["value"]."%' ";
		}
		if($_REQUEST["d_doc_date1"] != "" && $_REQUEST["d_doc_date2"] != "") {
			$con	.= " AND a.d_doc_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_doc_date1"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_doc_date2"]}'+' 23:59:59',102)";
		}
		
	}

	$sqlMain = "SET NOCOUNT ON
				SELECT
					ROW_NUMBER() OVER (ORDER BY b.c_approve DESC) AS numrow
					,a.imp_expense_hdr_id
					,b.imp_expense_dtl_id
					,a.c_gx_code
					,a.c_code
					,b.c_approve
					,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
					,b.c_acc_item
					,b.f_inv
					,b.f_vat
					,b.f_tax_personal
					,b.f_tax_corporate
					,b.f_social_security
					,b.f_money1
					,b.f_fine
					,b.f_total  
					,b.f_check_total
					,ISNULL(b.i_many_doc,1) AS i_many_doc
					,b.i_type_year
				INTO #TemData
				FROM imp_expense_hdr a
					INNER JOIN imp_expense_dtl b ON a.imp_expense_hdr_id = b.imp_expense_hdr_id
				WHERE
					(LEFT(a.c_gx_code,1) IS NULL AND a.gl_tran_hdr_id IS NULL OR b.i_many_doc = 2)
					AND a.c_code IS NOT NULL AND a.i_enable = ".STATUS_ENABLE."
					{$con}

				SELECT * FROM #TemData a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow
				
				SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {
		while( $row = $db->Fetch( $stmt ) ) {
			$temp = array(	"no"								=> $row["numrow"],
							"id"								=> $row["imp_expense_dtl_id"],
							"imp_expense_hdr_id"				=> $row["imp_expense_hdr_id"],
							"c_gx_code"							=> ($row["c_gx_code"] != "")? $row["c_gx_code"] : "",
							"c_code"							=> ($row["c_code"] != "")? $row["c_code"] : "",
							"c_approve"							=> $row["c_approve"],
							"d_doc_date"						=> ($row["d_doc_date"] != "")? $date->extDateBuddha($row["d_doc_date"]) : "",
							"c_acc_item"						=> $row["c_acc_item"],
							"f_inv"								=> $row["f_inv"],
							"f_inv_sum"							=> $row["f_inv"] + $row["f_vat"],
							"f_tax_personal"					=> $row["f_tax_personal"],
							"f_tax_corporate"					=> $row["f_tax_corporate"],
							"f_social_security"					=> $row["f_social_security"],
							"f_money1"							=> $row["f_money1"],
							"f_fine"							=> $row["f_fine"],
							"f_total"							=> $row["f_total"],
							"f_check_total"						=> $row["f_check_total"],
							"i_many_doc"						=> $row["i_many_doc"],
							"i_type_year"						=> $row["i_type_year"],
					
			);
			
			${$root}[] = $temp;
		}
	}
	
	$db->NextResult( $stmt );
	$rowCounts=$db->Fetch( $stmt );
	
	echo json_encode(array("debug"=>true, "totalCount"=>$rowCounts["rowCounts"], $root=>${$root}));
	exit;
	
} else if( $_REQUEST["type"] == "imp_expense_item" ) {
	
	$totalCount	= 0;
	
	$sqlMain = "SET NOCOUNT ON
				SELECT b.*
					,CASE
    					WHEN d.c_code_old != '' THEN d.c_code_old+' :: '+d.c_name
						ELSE d.c_name
					END AS dc_expense_group_name
					,c.c_name AS dc_expense_name
					,e.c_code+' : '+e.c_name AS dc_acc_name
				FROM imp_expense_dtl a
					INNER JOIN imp_expense_item b ON a.imp_expense_dtl_id = b.imp_expense_dtl_id
					LEFT JOIN dc_expense c ON b.dc_expense_id = c.dc_expense_id
					LEFT JOIN vw_dc_expense_group d ON b.dc_expense_group_id = d.dc_expense_group_id
					LEFT JOIN vw_dc_acc e ON
						CASE
							WHEN a.i_type_year = 1 THEN c.dc_acc_id
							ELSE c.dc_acc_id_overlap
						END = e.dc_acc_id
				WHERE a.imp_expense_dtl_id = ?
				ORDER BY a.imp_expense_dtl_id;";
	
	$arrParam[]	= $_REQUEST["imp_expense_dtl_id"];
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$arr	= array();
	if( sqlsrv_has_rows( $stmt ) ) {
		
		$arr["f_inv"]					= 0;
		$arr["f_vat"]					= 0;
		$arr["f_tax_personal"]			= 0;
		$arr["f_tax_corporate"]			= 0;
		$arr["f_social_security"]		= 0;
		$arr["f_money1"]				= 0;
		$arr["f_fine"]					= 0;
		$arr["f_total"]					= 0;
		$arr["f_check_total"]			= 0;
		
		while( $row = $db->Fetch( $stmt ) ) {
				
			++$totalCount;
				
			$temp = array(
					"imp_expense_dtl_id"		=> $row["imp_expense_dtl_id"],
					"imp_expense_hdr_id"		=> $row["imp_expense_hdr_id"],
					"f_inv"						=> $row["f_inv"],
					"f_vat"						=> $row["f_vat"],
					"f_tax_personal"			=> $row["f_tax_personal"],
					"f_tax_corporate"			=> $row["f_tax_corporate"],
					"f_social_security"			=> $row["f_social_security"],
					"f_money1"					=> $row["f_money1"],
					"f_fine"					=> $row["f_fine"],
					"f_total"					=> $row["f_total"],
					"f_check_total"				=> $row["f_check_total"],
					"dc_expense_id"				=> $row["dc_expense_id"],
					"dc_expense_group_id"		=> $row["dc_expense_group_id"],
					"dc_expense_name"			=> $row["dc_expense_name"],
					"dc_acc_name"				=> $row["dc_acc_name"],
					"dc_expense_group_name"		=> $row["dc_expense_group_name"]
			);
			
			$arr["f_inv"]						+= $row["f_inv"];
			$arr["f_vat"]						+= $row["f_vat"];
			$arr["f_tax_personal"]				+= $row["f_tax_personal"];
			$arr["f_tax_corporate"]				+= $row["f_tax_corporate"];
			$arr["f_social_security"]			+= $row["f_social_security"];
			$arr["f_money1"]					+= $row["f_money1"];
			$arr["f_fine"]						+= $row["f_fine"];
			$arr["f_total"]						+= $row["f_total"];
			$arr["f_check_total"]				+= $row["f_check_total"];
				
			${$root}[] = $temp;
		}
	}
	
	echo json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}, "arr"=>$arr));
	exit;
	
}
?>