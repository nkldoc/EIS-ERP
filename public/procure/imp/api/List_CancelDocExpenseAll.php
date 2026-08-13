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

if( $_REQUEST["type"] == "imp_expense_approve" ) {
	
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
		
		if( $_REQUEST["value"] != "" ) {
			$con	.= " AND a.".$_REQUEST["filter"]." LIKE '%".$_REQUEST["value"]."%' ";
		}		
		if($_REQUEST["d_doc_date1"] != "" && $_REQUEST["d_doc_date2"] != "") {
			$con	.= " AND a.d_doc_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_doc_date1"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_doc_date2"]}'+' 23:59:59',102)";
		} 
	}

	$sqlMain = "SET NOCOUNT ON
				SELECT
					ROW_NUMBER() OVER (ORDER BY b.c_code_post, a.c_approve) AS numrow
					,a.table_name
					,a.hdr_id
					,a.dtl_id
					,a.gl_tran_hdr_id
					,b.c_code_post AS c_code_g
					,a.c_approve
					,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
					,a.c_acc_item
					,a.f_inv
					,a.i_status
					,a.gl_tran_hdr_id_cancel
					,a.gl_tran_hdr_bank_id_cancel
					,a.c_code_cancel
					,a.c_code_bank_cancel
				INTO #TemData
				FROM (SELECT
					'imp_expense_hdr' AS table_name
					,aa.imp_expense_hdr_id AS hdr_id
					,bb.imp_expense_dtl_id AS dtl_id
					,aa.gl_tran_hdr_id
					,bb.c_approve
					,aa.d_doc_date
					,bb.c_acc_item
					,ISNULL(bb.f_inv,0)+ISNULL(bb.f_vat,0) AS f_inv
					,bb.i_status
					,cc.gl_tran_hdr_id_cancel
					,cc.gl_tran_hdr_bank_id_cancel
					,cc.c_code_cancel
					,cc.c_code_bank_cancel
				FROM imp_expense_hdr aa
					INNER JOIN imp_expense_dtl bb ON aa.imp_expense_hdr_id = bb.imp_expense_hdr_id
					LEFT JOIN (SELECT
						aa.imp_cancel_doc_expense_id
						,aa.gl_tran_hdr_id_cancel
						,aa.gl_tran_hdr_bank_id_cancel
						,CASE WHEN bb.i_is_post = 3 THEN bb.c_code_post ELSE bb.c_code END AS c_code_cancel
						,CASE WHEN cc.i_is_post = 3 THEN cc.c_code_post ELSE cc.c_code END AS c_code_bank_cancel
					FROM imp_cancel_doc_expense aa
						LEFT JOIN gl_tran_hdr bb ON aa.gl_tran_hdr_id_cancel = bb.gl_tran_hdr_id
						LEFT JOIN gl_tran_hdr cc ON aa.gl_tran_hdr_bank_id_cancel = cc.gl_tran_hdr_id
					WHERE bb.i_is_post > 1 AND cc.i_is_post > 1) cc ON bb.imp_cancel_doc_expense_id = cc.imp_cancel_doc_expense_id
				WHERE aa.i_enable = 1 AND aa.gl_tran_hdr_id > 0 
				UNION ALL
				SELECT
					'imp_expense_vsn_hdr' AS table_name
					,aa.imp_expense_vsn_hdr_id AS hdr_id
					,bb.imp_expense_vsn_dtl_id AS dtl_id
					,aa.gl_tran_hdr_id
					,bb.c_approve
					,aa.d_doc_date
					,bb.c_acc_item
					,ISNULL(bb.f_inv,0) AS f_inv
					,bb.i_status
					,cc.gl_tran_hdr_id_cancel
					,cc.gl_tran_hdr_bank_id_cancel
					,cc.c_code_cancel
					,cc.c_code_bank_cancel
				FROM imp_expense_vsn_hdr aa
					INNER JOIN imp_expense_vsn_dtl bb ON aa.imp_expense_vsn_hdr_id = bb.imp_expense_vsn_hdr_id
					LEFT JOIN (SELECT
						aa.imp_cancel_doc_expense_id
						,aa.gl_tran_hdr_id_cancel
						,aa.gl_tran_hdr_bank_id_cancel
						,CASE WHEN bb.i_is_post = 3 THEN bb.c_code_post ELSE bb.c_code END AS c_code_cancel
						,CASE WHEN cc.i_is_post = 3 THEN cc.c_code_post ELSE cc.c_code END AS c_code_bank_cancel
					FROM imp_cancel_doc_expense aa
						LEFT JOIN gl_tran_hdr bb ON aa.gl_tran_hdr_id_cancel = bb.gl_tran_hdr_id
						LEFT JOIN gl_tran_hdr cc ON aa.gl_tran_hdr_bank_id_cancel = cc.gl_tran_hdr_id
					WHERE bb.i_is_post > 1 AND cc.i_is_post > 1) cc ON bb.imp_cancel_doc_expense_id = cc.imp_cancel_doc_expense_id
				WHERE aa.i_enable = 1 AND aa.gl_tran_hdr_id > 0
				) a
				INNER JOIN (SELECT aa.* FROM gl_tran_hdr aa
					WHERE aa.c_code_post LIKE 'GL%' AND aa.i_enable = 1 AND aa.i_is_post = 3
						AND ISNULL(aa.i_cancel_doc_expense,4) = 4
						AND aa.i_type = 2 AND aa.table_name IN ('imp_expense_hdr', 'imp_expense_vsn_hdr')) b ON a.gl_tran_hdr_id = b.gl_tran_hdr_id
				WHERE 1=1
					{$con}

				SELECT * FROM #TemData a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow
				
				SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;
 
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {
		while( $row = $db->Fetch( $stmt ) ) {
			$temp = array(	"no"								=> $row["numrow"],
							"id"								=> $row["dtl_id"],
							"hdr_id"							=> $row["hdr_id"],
							"gl_tran_hdr_id"					=> $row["gl_tran_hdr_id"],
							"table_name"						=> $row["table_name"],
							"c_code_g"							=> $row["c_code_g"],
							"c_approve"							=> $row["c_approve"],
							"d_doc_date"						=> ($row["d_doc_date"] != "")? $date->extDateBuddha($row["d_doc_date"]) : "",
							"c_acc_item"						=> $row["c_acc_item"],
							"f_inv"								=> $row["f_inv"],
							"i_status"							=> $row["i_status"],
							"gl_tran_hdr_id_cancel"				=> $row["gl_tran_hdr_id_cancel"],
							"gl_tran_hdr_bank_id_cancel"		=> $row["gl_tran_hdr_bank_id_cancel"],
							"c_code_cancel"						=> $row["c_code_cancel"],
							"c_code_bank_cancel"				=> $row["c_code_bank_cancel"]
			);
			
			${$root}[] = $temp;
		}
	}
	
	$db->NextResult( $stmt );
	$rowCounts=$db->Fetch( $stmt );
	
	echo json_encode(array("debug"=>true, "totalCount"=>$rowCounts["rowCounts"], $root=>${$root}));
	exit;
	
} else if( $_REQUEST["type"] == "imp_expense_cheque" ) {
	
	$tb	= ($_REQUEST["table_name"] == "imp_expense_hdr")? "imp_expense" : "imp_expense_vsn";
	
	$rowCounts			= 0;
	
	$sqlMain = "SET NOCOUNT ON
				SELECT
					ROW_NUMBER() OVER (ORDER BY d.c_cheque) AS numrow
					,c.{$tb}_dtl_cheque_id AS cheque_id
					,d.c_show AS c_name
					,CONVERT(VARCHAR, c.d_cheque, 120) AS d_cheque
					,c.f_cheque
				FROM dbo.{$tb}_hdr a
					INNER JOIN dbo.{$tb}_dtl b ON a.{$tb}_hdr_id = b.{$tb}_hdr_id
					INNER JOIN dbo.{$tb}_dtl_cheque c ON b.{$tb}_dtl_id = c.{$tb}_dtl_id
					INNER JOIN dbo.dc_cheque d ON c.dc_cheque_id = d.dc_cheque_id
				WHERE b.{$tb}_dtl_id = {$_REQUEST["dtl_id"]}
					AND c.i_status = 1
				ORDER BY d.c_cheque;";

	$stmt = $db->QueryParam($sqlMain, array());
	if( sqlsrv_has_rows( $stmt ) ) {
		while( $row = $db->Fetch( $stmt ) ) {
			$temp = array(	"no"								=> $row["numrow"],
							"id"								=> $row["cheque_id"], 
							"c_name"							=> $row["c_name"],
							"d_cheque"							=> ($row["d_cheque"] != "")? $date->extDateBuddha($row["d_cheque"]) : "",
							"f_cheque"							=> $row["f_cheque"],
			);
			
			$rowCounts++;
			
			${$root}[] = $temp;
		}
	}
	
	echo json_encode(array("debug"=>true, "totalCount"=>$rowCounts, $root=>${$root}));
	exit;
	
}
?>