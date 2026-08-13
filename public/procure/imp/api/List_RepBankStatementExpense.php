<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php"); 
include("../../lib/date/i_date.class.php");

$db 		= new DatabaseServer();
$date		= new i_date();

$root		= "data";
$data		= array();
$con		= null;

function List_QueryParam() {
	
	global $db,$date,$root,$data, $con,$arr_status;
 
	$totalCount		= 0;
	$conCheque		= "";
	$conBank		= "";
	$conSystem		= "";
	
	if($_REQUEST["dc_bank_acc_company_id"] > 0) { $conCheque .= " AND d.dc_bank_acc_company_id = ".$_REQUEST["dc_bank_acc_company_id"]; }
	if($_REQUEST["c_mm"] != "" && $_REQUEST["c_yyyy"] != "") {
		$c_yyyy_mm	= $_REQUEST["c_yyyy"].$_REQUEST["c_mm"];
		$conCheque	.= " AND CAST(YEAR(c.d_cheque) AS VARCHAR(4)) + RIGHT('0'+CAST(MONTH(c.d_cheque) AS VARCHAR(2)), 2) = ".$c_yyyy_mm;
		$conBank	.= " AND CAST(YEAR(b.d_doc_date) AS VARCHAR(4)) + RIGHT('0'+CAST(MONTH(b.d_doc_date) AS VARCHAR(2)), 2) = ".$c_yyyy_mm;
	}
	if($_REQUEST["i_system"] > 0) { $conSystem .= "AND i_system=".$_REQUEST["i_system"]; }
	
	
	$sqlMain = "SET NOCOUNT ON
				/*==================== e-phys ====================*/
				SELECT
					a.c_code AS c_code_cheque
					,d.c_cheque AS cheque_no
					,d.c_show
					,CONVERT(VARCHAR, c.d_cheque, 120) AS d_cheque_date
					,c.f_cheque AS f_amount_cheque
					,1 AS i_system
					,'e-phys' AS c_system
				INTO #tb_cheque_ep
				FROM imp_expense_hdr a
					INNER JOIN imp_expense_dtl b ON a.imp_expense_hdr_id = b.imp_expense_hdr_id
					INNER JOIN imp_expense_dtl_cheque c ON b.imp_expense_dtl_id = c.imp_expense_dtl_id
					INNER JOIN dc_cheque d ON c.dc_cheque_id = d.dc_cheque_id
				WHERE a.i_enable = ".STATUS_ENABLE."
					{$conCheque}
				
				/*================== vision net ==================*/
				SELECT
					a.c_code AS c_code_cheque
					,d.c_cheque AS cheque_no
					,d.c_show
					,CONVERT(VARCHAR, c.d_cheque, 120) AS d_cheque_date
					,c.f_cheque AS f_amount_cheque
					,2 AS i_system
					,'vision net' AS c_system
				INTO #tb_cheque_vsn
				FROM imp_expense_vsn_hdr a
					INNER JOIN imp_expense_vsn_dtl b ON a.imp_expense_vsn_hdr_id = b.imp_expense_vsn_hdr_id
					INNER JOIN imp_expense_vsn_dtl_cheque c ON b.imp_expense_vsn_dtl_id = c.imp_expense_vsn_dtl_id
					INNER JOIN dc_cheque d ON c.dc_cheque_id = d.dc_cheque_id
				WHERE a.i_enable = ".STATUS_ENABLE."
					{$conCheque}
				
				/*=========== e-phys (union) vision net ==========*/
				SELECT
					ROW_NUMBER() OVER (PARTITION BY a.cheque_no ORDER BY a.c_system, a.c_code_cheque) row_cheque
					,a.*
				INTO #tb_cheque
				FROM (	SELECT * FROM #tb_cheque_ep
						WHERE 1=1 {$conSystem}
						UNION ALL
						SELECT * FROM #tb_cheque_vsn
						WHERE 1=1 {$conSystem} ) a
				ORDER BY a.cheque_no, a.c_system, a.c_code_cheque
				
				/*===================== bank =====================*/
				SELECT
					ROW_NUMBER() OVER (PARTITION BY b.cheque_no ORDER BY b.d_doc_date DESC) row_bank
					,a.c_code AS c_code_bank
					,b.cheque_no
					,CONVERT(VARCHAR, b.d_doc_date, 120) AS d_bank_date
					,ABS(b.f_amount) AS f_amount_bank
				INTO #tb_bank
				FROM cm_imp_bank_hdr a
					INNER JOIN cm_imp_bank_dtl b ON a.cm_imp_bank_hdr_id = b.cm_imp_bank_hdr_id
				WHERE a.i_enable = ".STATUS_ENABLE." AND b.i_cheque = 1
					{$conBank}
				
				/*==================== select ====================*/
				SELECT
					a.*
					,CASE WHEN a.cheque_no is null THEN b.cheque_no ELSE a.cheque_no END AS cheque_no
					,CASE WHEN a.row_cheque > 1 THEN NULL ELSE b.row_bank END AS row_bank
					,CASE WHEN a.row_cheque > 1 THEN NULL ELSE b.c_code_bank END AS c_code_bank
					,CASE WHEN a.row_cheque > 1 THEN NULL ELSE b.d_bank_date END AS d_bank_date
					,CASE WHEN a.row_cheque > 1 THEN NULL ELSE b.f_amount_bank END AS f_amount_bank
					,CASE WHEN a.row_cheque > 1 THEN NULL ELSE (SELECT SUM(aa.f_amount_cheque) FROM #tb_cheque aa WHERE a.cheque_no = aa.cheque_no) END AS total_cheque
				FROM #tb_cheque a
				FULL OUTER JOIN #tb_bank b ON a.cheque_no = b.cheque_no
				ORDER BY CASE WHEN a.cheque_no IS NULL THEN 1 ELSE 0 END ,a.cheque_no, b.row_bank, a.row_cheque;";
	
	$arrParam[]	= "";

	$stmt = $db->QueryParam( $sqlMain, $arrParam );
	if( $stmt ) {
		
		while($row =$db->Fetch($stmt)) {
			
			if($row["row_cheque"] == 1 || $row["row_bank"] == 1) {

				$i_cheque	= ( round($row["f_amount_bank"]) == round($row["total_cheque"]) )? 2 : 1;
				
				if($_REQUEST["status_cheque"] == $i_cheque || $_REQUEST["status_cheque"] == 0) {
					$temp = array(	"i_type"				=> 1,
									"cheque_no"				=> ($row["c_show"])?$row["c_show"] : $row["cheque_no"],
									"f_amount_cheque"		=> $row["f_amount_cheque"],
									"f_amount_bank"			=> $row["f_amount_bank"],
									"total_cheque"			=> $row["total_cheque"]
					);
					${$root}[] = $temp;
				}
			}
			
			if($_REQUEST["status_cheque"] == $i_cheque || $_REQUEST["status_cheque"] == 0) {
				
				$temp = array(	"i_type"						=> 2,
								"cheque_no"						=> $row["cheque_no"],
								"c_system"						=> $row["c_system"],
								"row_cheque"					=> $row["row_cheque"],
								"c_code_cheque"					=> $row["c_code_cheque"],
								"d_cheque_date"					=> ($row["d_cheque_date"] != "")? $date->shot_date_from_db($row["d_cheque_date"]) : "",
								"f_amount_cheque"				=> $row["f_amount_cheque"],
								"row_bank"						=> $row["row_bank"],
								"c_code_bank"					=> $row["c_code_bank"],
								"d_bank_date"					=> ($row["d_bank_date"] != "")? $date->shot_date_from_db($row["d_bank_date"]) : "",
								"f_amount_bank"					=> $row["f_amount_bank"],
								"total_cheque"					=> $row["total_cheque"],
								"i_cheque"						=> $i_cheque
				);
					
				${$root}[] = $temp;
			}
		}
	}

	return json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
}
?>
