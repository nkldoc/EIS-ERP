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

if( $_REQUEST["type"] == "imp_request_ephis_dtl" ) {

	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];
	
	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];
	
	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }
 
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
					ROW_NUMBER() OVER (ORDER BY  a.c_code,b.c_request_desc DESC) AS numrow
					,a.imp_request_ephis_hdr_id
					,b.imp_request_ephis_dtl_id
					,NULL as  c_gx_code
					,a.c_code
					,b.c_request
					,b.c_request_desc
					,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
					,b.c_acc_item
					,ISNULL((select sum(dd.f_dr) from imp_request_ephis_item dd where dd.imp_request_ephis_dtl_id=b.imp_request_ephis_dtl_id ),0)  as f_dr_1_request
					,ISNULL((select sum(dd.f_cr) from imp_request_ephis_item dd where dd.imp_request_ephis_dtl_id=b.imp_request_ephis_dtl_id ),0)  as f_cr_1_request
					,ISNULL((select sum(dd.f_inv) from imp_request_ephis_item dd where dd.imp_request_ephis_dtl_id=b.imp_request_ephis_dtl_id and dd.i_type_show=1),0)  as f_inv_1_request
					,ISNULL((select sum(dd.f_vat) from imp_request_ephis_item dd where dd.imp_request_ephis_dtl_id=b.imp_request_ephis_dtl_id and dd.i_type_show=1),0)  as f_vat_1_request
					,ISNULL((select sum(dd.f_tax_personal) from imp_request_ephis_item dd where dd.imp_request_ephis_dtl_id=b.imp_request_ephis_dtl_id and dd.i_type_show=1),0)  as f_tax_personal_1_request
					,ISNULL((select sum(dd.f_tax_corporate) from imp_request_ephis_item dd where dd.imp_request_ephis_dtl_id=b.imp_request_ephis_dtl_id and dd.i_type_show=1),0)  as f_tax_corporate_1_request
					,ISNULL((select sum(dd.f_social_security) from imp_request_ephis_item dd where dd.imp_request_ephis_dtl_id=b.imp_request_ephis_dtl_id and dd.i_type_show=1),0)  as f_social_security_1_request
					,ISNULL((select sum(dd.f_fine) from imp_request_ephis_item dd where dd.imp_request_ephis_dtl_id=b.imp_request_ephis_dtl_id and dd.i_type_show=1),0)  as f_fine_1_request
					,b.c_creditor
				INTO #TemData
				FROM imp_request_ephis_hdr a
					INNER JOIN imp_request_ephis_dtl b ON a.imp_request_ephis_hdr_id = b.imp_request_ephis_hdr_id
				WHERE
					ISNULL(a.gl_tran_hdr_rq_id,0)=0  
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
							"id"								=> $row["imp_request_ephis_dtl_id"],
							"hdr_id"							=> $row["imp_request_ephis_hdr_id"],
							"c_gx_code"							=> ($row["c_gx_code"] != "")? $row["c_gx_code"] : "",
							"c_code"							=> ($row["c_code"] != "")? $row["c_code"] : "",
							"c_request"							=> $row["c_request"],
							"c_request_desc"					=> $row["c_request_desc"],
							"d_doc_date"						=> ($row["d_doc_date"] != "")? $date->extDateBuddha($row["d_doc_date"]) : "",
							"c_comment"							=> $row["c_acc_item"],
							"f_dr"								=> $row["f_dr_1_request"],
							"f_cr"								=> $row["f_cr_1_request"],
							"f_inv"								=> $row["f_inv_1_request"],
							"f_vat"								=> $row["f_vat_1_request"],
							"f_tax_personal"					=> $row["f_tax_personal_1_request"],
							"f_tax_corporate"					=> $row["f_tax_corporate_1_request"],
							"f_social_security"					=> $row["f_social_security_1_request"],
							"f_fine"							=> $row["f_fine_1_request"],
							"c_creditor"						=> $row["c_creditor"]
			);
			
			${$root}[] = $temp;
		}
	}
	
	$db->NextResult( $stmt );
	$rowCounts=$db->Fetch( $stmt );
	
	echo json_encode(array("debug"=>true, "totalCount"=>$rowCounts["rowCounts"], $root=>${$root}));
	exit;
	
} else if( $_REQUEST["type"] == "imp_request_ephis_item" ) {
	
	$totalCount	= 0;

	// $mode				= @$_REQUEST["mode"];  
 
	// if($mode == "SEARCH") {
		
	// 	if($_REQUEST["filter"] != "") {
	// 		$con	.= " AND b.".$_REQUEST["filter"]." LIKE '%".@$_REQUEST["value"]."%' ";
	// 	}
	// 	if($_REQUEST["d_doc_date1"] != "" && $_REQUEST["d_doc_date2"] != "") {
	// 		$con	.= " AND a.d_doc BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_doc_date1"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_doc_date2"]}'+' 23:59:59',102)";
	// 	}
		
	// }


	$sqlMain = "SET NOCOUNT ON
				SELECT 	b.imp_request_ephis_item_id
						,b.imp_request_ephis_dtl_id
						,b.imp_request_ephis_hdr_id
						,b.dc_acc_id 
						,ISNULL(b.f_dr,0) AS f_dr
						,ISNULL(b.f_cr,0) AS f_cr
						,b.c_comment
						,b.c_budget_year
						,b.i_type_year
						,b.i_cal_gl 
						,CONVERT(VARCHAR, a.d_doc, 120) AS d_doc 
						,e.c_code +' '+e.c_name as c_acc_full
						,a.c_acc_item 
						,case when ((b.i_type_show=2) and (b.c_comment='นำเข้า Excel')) then 0 else ISNULL(b.f_inv,0) end AS f_inv
						,case when ((b.i_type_show=2) and (b.c_comment='นำเข้า Excel')) then 0 else ISNULL(b.f_vat,0) end AS f_vat
						,case when ((b.i_type_show=2) and (b.c_comment='นำเข้า Excel')) then 0 else ISNULL(b.f_tax_personal,0) end AS f_tax_personal
						,case when ((b.i_type_show=2) and (b.c_comment='นำเข้า Excel')) then 0 else ISNULL(b.f_tax_corporate,0) end AS f_tax_corporate
						,case when ((b.i_type_show=2) and (b.c_comment='นำเข้า Excel')) then 0 else ISNULL(b.f_social_security,0) end AS f_social_security
						,case when ((b.i_type_show=2) and (b.c_comment='นำเข้า Excel')) then 0 else ISNULL(b.f_fine,0) end AS f_fine

				FROM imp_request_ephis_dtl a
					INNER JOIN imp_request_ephis_item b ON a.imp_request_ephis_dtl_id = b.imp_request_ephis_dtl_id
					LEFT JOIN vw_dc_acc e ON b.dc_acc_id = e.dc_acc_id
				WHERE a.imp_request_ephis_dtl_id = ?
				ORDER BY b.i_type_show,b.i_rank_dr;";
	//echo $sqlMain;exit;
	$arrParam[]	= $_REQUEST["imp_request_ephis_dtl_id"];
 
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$arr	= array();
	if( sqlsrv_has_rows( $stmt ) ) {
		
		$arr["f_dr"]					= 0;
		$arr["f_cr"]					= 0; 
		$arr["f_inv"]					= 0;
		$arr["f_vat"]					= 0; 
		$arr["f_tax_personal"]			= 0;
		$arr["f_tax_corporate"]			= 0; 		
		$arr["f_social_security"]		= 0;
		$arr["f_fine"]					= 0;  


		while( $row = $db->Fetch( $stmt ) ) {
				
			++$totalCount;
				
			$temp = array(
					"imp_request_ephis_item_id"		=> $row["imp_request_ephis_item_id"],
					"imp_request_ephis_dtl_id"		=> $row["imp_request_ephis_dtl_id"],
					"imp_request_ephis_hdr_id"		=> $row["imp_request_ephis_hdr_id"],
					"dc_acc_id"						=> $row["dc_acc_id"],
					"f_dr"							=> $row["f_dr"],
					"f_cr"							=> $row["f_cr"], 
					"f_inv"							=> $row["f_inv"],
					"f_vat"							=> $row["f_vat"],
					"f_tax_personal"				=> $row["f_tax_personal"],
					"f_tax_corporate"				=> $row["f_tax_corporate"],
					"f_social_security"				=> $row["f_social_security"],
					"f_fine"						=> $row["f_fine"],
					"c_comment"						=> $row["c_comment"],
					"c_budget_year"					=> $row["c_budget_year"],
					"i_type_year"					=> $row["i_type_year"],
					"i_cal_gl"						=> $row["i_cal_gl"], 
					"d_doc"							=> ($row["d_doc"] != "")			? $date->extDateBuddha($row["d_doc"]) 	: "",
					"acc_full"						=> ($row["c_acc_full"] != "")		? $row["c_acc_full"]					: "",
					"c_acc_item"					=> ($row["c_acc_item"] != "")		? $row["c_acc_item"]					: ""
					 
			);
			
			$arr["f_dr"]				+= $row["f_dr"];
			$arr["f_cr"]				+= $row["f_cr"]; 
			$arr["f_inv"]				+= $row["f_inv"]; 
			$arr["f_vat"]				+= $row["f_vat"];  
			$arr["f_tax_personal"]		+= $row["f_tax_personal"]; 
			$arr["f_tax_corporate"]		+= $row["f_tax_corporate"]; 		
			$arr["f_social_security"]	+= $row["f_social_security"]; 
			$arr["f_fine"]				+= $row["f_fine"]; 

			${$root}[] = $temp;
		}
	}
	
	echo json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}, "arr"=>$arr));
	exit;
	
}
?>