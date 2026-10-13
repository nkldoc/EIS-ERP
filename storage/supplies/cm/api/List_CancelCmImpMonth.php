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

if( $_REQUEST["type"] == "CancelCmImpMonth" ) {
	
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
			if($_REQUEST["filter"] == "cheque_no") {
				$con .= " AND (a.".$_REQUEST["filter"]." LIKE '%".$_REQUEST["value"]."%' OR b.".$_REQUEST["filter"]." LIKE '%".$_REQUEST["value"]."%')";
			}
		}
	}
	
	$sqlMain = "SET NOCOUNT ON;
				SELECT
					ROW_NUMBER() OVER (ORDER BY
						CASE
							WHEN a.dtl_id_cheque IS NULL THEN 2/*'ยังไม่นำเข้าเช็ค IMPCM'*/
							WHEN b.dtl_id_bank IS NULL THEN 3/*'ยังไม่นำเข้าเช็ค IMPB'*/
							WHEN a.dc_bank_acc_company_id_cheque != b.dc_bank_acc_company_id_bank THEN 4/*'แหล่งเงินไม่ตรงกัน'*/
							WHEN a.f_amount_cheque != b.f_amount_bank THEN 5/*'เงินไม่เท่ากัน'*/
							ELSE 1
						END,
						CASE WHEN a.cheque_no IS NULL THEN b.cheque_no ELSE a.cheque_no END, a.d_doc_date_cheque) AS numrow
					,CASE
						WHEN a.cheque_no IS NULL THEN b.cheque_no
						ELSE a.cheque_no
					END AS cheque_no
					,CASE
						WHEN a.dtl_id_cheque IS NULL THEN 2/*'ยังไม่นำเข้าเช็ค IMPCM'*/
						WHEN b.dtl_id_bank IS NULL THEN 3/*'ยังไม่นำเข้าเช็ค IMPB'*/
						WHEN a.dc_bank_acc_company_id_cheque != b.dc_bank_acc_company_id_bank THEN 4/*'แหล่งเงินไม่ตรงกัน'*/
						WHEN a.f_amount_cheque != b.f_amount_bank THEN 5/*'เงินไม่เท่ากัน'*/
						ELSE 1
					END AS i_status
					,a.dtl_id_cheque
					,a.c_code_cheque
					,CONVERT(VARCHAR(10), a.d_doc_date_cheque, 120) AS d_doc_date_cheque
					,a.f_amount_cheque
					,b.dtl_id_bank
					,b.c_code_bank
					,CONVERT(VARCHAR(10), b.d_doc_date_bank, 120) AS d_doc_date_bank
					,b.f_amount_bank
				INTO #TemData
				FROM (
					SELECT
						bb.c_doc AS cheque_no
						,bb.cm_imp_cheque_month_dtl_id AS dtl_id_cheque
						,aa.dc_bank_acc_company_id AS dc_bank_acc_company_id_cheque
						,aa.c_code AS c_code_cheque
						,bb.d_cheque AS d_doc_date_cheque
						,bb.f_cr AS f_amount_cheque
					FROM cm_imp_cheque_month_hdr aa
						INNER JOIN cm_imp_cheque_month_dtl bb ON aa.cm_imp_cheque_month_hdr_id = bb.cm_imp_cheque_month_hdr_id
					WHERE aa.i_enable = 1 AND bb.i_status = 1
						AND (c_name IS NULL OR c_name = 'สมุดรายวันเงินจ่าย')
				) a
				FULL JOIN  (
					SELECT
						bb.cheque_no
						,bb.cm_imp_bank_month_dtl_id AS dtl_id_bank
						,aa.dc_bank_acc_company_id AS dc_bank_acc_company_id_bank
						,aa.c_code AS c_code_bank
						,bb.d_doc_date AS d_doc_date_bank
						,ABS(bb.f_amount) AS f_amount_bank
					FROM cm_imp_bank_month_hdr aa
						INNER JOIN cm_imp_bank_month_dtl bb ON aa.cm_imp_bank_month_hdr_id = bb.cm_imp_bank_month_hdr_id
					WHERE aa.i_enable = 1 AND bb.i_status = 1
						AND bb.i_cheque = 1
				) b ON a.cheque_no = b.cheque_no
				WHERE 1=1
					{$con}

				SELECT * FROM #TemData a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow
				
				SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {
		while( $row = $db->Fetch( $stmt ) ) {
			$temp = array(	"no"									=> $row["numrow"],
							"cheque_no"								=> $row["cheque_no"],
							"i_status"								=> $row["i_status"],
							"dtl_id_cheque"							=> ($row["dtl_id_cheque"] != "")? $row["dtl_id_cheque"] : "",
							"c_code_cheque"							=> ($row["c_code_cheque"] != "")? $row["c_code_cheque"] : "",
							"d_doc_date_cheque"						=> ($row["d_doc_date_cheque"] != "")? $date->extDateBuddha($row["d_doc_date_cheque"]) : "",
							"f_amount_cheque"						=> ($row["f_amount_cheque"] != "")? $row["f_amount_cheque"] : "",
							"dtl_id_bank"							=> ($row["dtl_id_bank"] != "")? $row["dtl_id_bank"] : "",
							"c_code_bank"							=> ($row["c_code_bank"] != "")? $row["c_code_bank"] : "",
							"d_doc_date_bank"						=> ($row["d_doc_date_bank"] != "")? $date->extDateBuddha($row["d_doc_date_bank"]) : "",
							"f_amount_bank"							=> ($row["f_amount_bank"] != "")? $row["f_amount_bank"] : "",
			);
			
			${$root}[] = $temp;
		}
	}
	
	$db->NextResult( $stmt );
	$rowCounts=$db->Fetch( $stmt );
	
	echo json_encode(array("debug"=>true, "totalCount"=>$rowCounts["rowCounts"], $root=>${$root}));
	exit;
	
}
?>