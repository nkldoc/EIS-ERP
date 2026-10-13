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

function List_QueryParam()
{

	global $db, $date, $util, $root, $data, $select, $con, $flds, $groupBy;

	$totalCount		= 0;

	$year_s				= (string) (@$_REQUEST["year_s"]);
	$month_s			= (string) sprintf("%02d%", @$_REQUEST["month_s"], "");
	$year_e				= (string) (@$_REQUEST["year_e"]);
	$month_e			= (string) sprintf("%02d%", @$_REQUEST["month_e"], "");

	if ($_REQUEST["i_cheque"] == 1) { // เช็คที่จ่ายแล้ว
		$con	.= " AND i_cheque = 1";
	} else if ($_REQUEST["i_cheque"] == 2) { // เฉพาะเช็คค้างจ่าย
		$con	.= " AND i_cheque = 2";
		$con	.= " AND (i_status = 1 OR i_status_bank = 1)";
	} else if ($_REQUEST["i_cheque"] == 3) { // เฉพาะเช็คยกเลิก
		$con	.= " AND i_cheque = 2";
		$con	.= " AND i_status = 2";
	}

	$sqlMain	= "
		SET NOCOUNT ON;
					
		DECLARE @dc_bank_acc_company_id INT = " . $_REQUEST["dc_bank_acc_company_id"] . ";
		DECLARE @c_yyyy_mm_s INT = " . $year_s . $month_s . ";
		DECLARE @c_yyyy_mm_e INT = " . $year_e . $month_e . ";
		
		/*===================== เตรียมข้อมูล CHEQUE =====================*/
		SELECT
			*
		INTO #TMP_CHEQUE
		FROM (
			/* e-phys (กระแส) CHEQUE*/
			SELECT
				d.c_cheque
				,a.c_code
				,CONVERT(VARCHAR, c.d_cheque, 120) AS d_cheque_date
				,SUM(ISNULL(c.f_cheque,0)) AS f_amount
				,1 AS i_status
			FROM imp_expense_hdr a
				INNER JOIN imp_expense_dtl b ON a.imp_expense_hdr_id = b.imp_expense_hdr_id
				INNER JOIN imp_expense_dtl_cheque c ON b.imp_expense_dtl_id = c.imp_expense_dtl_id
				INNER JOIN dc_bank_acc_company e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source
				INNER JOIN dc_cheque d ON c.dc_cheque_id = d.dc_cheque_id
			WHERE a.i_enable = 1 AND LEFT(a.c_code,1) = 'I'
				AND e.dc_bank_deposit_type_id = 2
				AND e.dc_bank_acc_company_id = @dc_bank_acc_company_id
				AND CAST(YEAR(b.d_pay) AS VARCHAR(4)) + RIGHT('0'+CAST(MONTH(b.d_pay) AS VARCHAR(2)), 2) BETWEEN @c_yyyy_mm_s AND @c_yyyy_mm_e
			GROUP BY d.c_cheque, a.c_code, c.d_cheque
			UNION ALL
			/*vision net (กระแส) CHEQUE*/
			SELECT
				d.c_cheque
				,a.c_code
				,CONVERT(VARCHAR, c.d_cheque, 120) AS d_cheque_date
				,SUM(ISNULL(c.f_cheque,0)) AS f_amount
				,1 AS i_status
			FROM imp_expense_vsn_hdr a
				INNER JOIN imp_expense_vsn_dtl b ON a.imp_expense_vsn_hdr_id = b.imp_expense_vsn_hdr_id
				INNER JOIN imp_expense_vsn_dtl_cheque c ON b.imp_expense_vsn_dtl_id = c.imp_expense_vsn_dtl_id
				INNER JOIN dc_bank_acc_company e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source
				INNER JOIN dc_cheque d ON c.dc_cheque_id = d.dc_cheque_id
			WHERE a.i_enable = 1 AND LEFT(a.c_code,1) = 'I'
				AND e.dc_bank_deposit_type_id = 2
				AND e.dc_bank_acc_company_id = @dc_bank_acc_company_id
				AND CAST(YEAR(b.d_cheque) AS VARCHAR(4)) + RIGHT('0'+CAST(MONTH(b.d_cheque) AS VARCHAR(2)), 2) BETWEEN @c_yyyy_mm_s AND @c_yyyy_mm_e
			GROUP BY d.c_cheque, a.c_code, c.d_cheque
			UNION ALL
			/*BTN (กระแส) CHEQUE*/
			SELECT
				d.c_cheque
				,a.c_code
				,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_cheque_date
				,SUM(ISNULL(c.f_cheque,0)) AS f_cr
				,1 AS i_stauts
			FROM gl_bank a
				INNER JOIN gl_bank_cheque c ON a.gl_bank_id = c.gl_bank_id
				INNER JOIN dc_bank_acc_company e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source
				INNER JOIN dc_cheque d ON c.dc_cheque_id = d.dc_cheque_id
			WHERE a.c_code IS NOT NULL
				AND a.i_enable = 1
				AND e.dc_bank_deposit_type_id = 2
				AND e.dc_bank_acc_company_id = @dc_bank_acc_company_id
				AND CAST(YEAR(a.d_doc_date) AS VARCHAR(4)) + RIGHT('0'+CAST(MONTH(a.d_doc_date) AS VARCHAR(2)), 2) BETWEEN @c_yyyy_mm_s AND @c_yyyy_mm_e
			GROUP BY d.c_cheque, a.c_code, a.d_doc_date
		) a;
		
		/*================= เตรียมข้อมูล CHEQUE CANCEL ==================*/
		SELECT
			*
		INTO #TMP_CHEQUE_CANCEL
		FROM (
			/*e-phys (กระแส) CHEQUE (cancel)*/
			SELECT
				d.c_cheque
				,a.c_code
				,CONVERT(VARCHAR,r.d_save_jv_cancel, 120) AS d_cheque_date
				,SUM(ISNULL(c.f_cheque,0)) AS f_amount
				,2 AS i_status
			FROM imp_expense_hdr a
				INNER JOIN imp_expense_dtl b ON a.imp_expense_hdr_id = b.imp_expense_hdr_id
				INNER JOIN imp_expense_dtl_cheque c ON b.imp_expense_dtl_id = c.imp_expense_dtl_id
				INNER JOIN dc_bank_acc_company e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source
				INNER JOIN imp_cancel_doc_expense r on c.imp_expense_dtl_id = r.imp_expense_dtl_id
					AND c.imp_expense_dtl_cheque_id = r.imp_expense_dtl_cheque_id
					AND r.i_type_doc = 1 /*สถานะยกเลิกรายการ (1=ฎีกา e-phis,2=ฎีกา vision Net,3=ยกเลิก BTN)*/
					AND r.i_enable = 1
				INNER JOIN dc_cheque d ON c.dc_cheque_id = d.dc_cheque_id
			WHERE a.i_enable = 1 AND LEFT(a.c_code,1) = 'I' 
				AND CAST(YEAR(r.d_save_jv_cancel) AS VARCHAR(4)) + RIGHT('0'+CAST(MONTH(r.d_save_jv_cancel) AS VARCHAR(2)), 2) BETWEEN @c_yyyy_mm_s AND @c_yyyy_mm_e
				AND e.dc_bank_deposit_type_id = 2
				AND e.dc_bank_acc_company_id = @dc_bank_acc_company_id
			GROUP BY d.c_cheque, a.c_code, r.d_save_jv_cancel
			UNION ALL
			/*VSN (กระแส) CHEQUE (cancel)*/
			SELECT
				d.c_cheque
				,a.c_code
				,CONVERT(VARCHAR,r.d_save_jv_cancel, 120) AS d_cheque_date
				,SUM(ISNULL(c.f_cheque,0)) AS f_amount
				,2 AS i_status
			FROM imp_expense_vsn_hdr a
				INNER JOIN imp_expense_vsn_dtl b ON a.imp_expense_vsn_hdr_id = b.imp_expense_vsn_hdr_id
				INNER JOIN imp_expense_vsn_dtl_cheque c ON b.imp_expense_vsn_dtl_id = c.imp_expense_vsn_dtl_id
				INNER JOIN dc_bank_acc_company e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source
				INNER JOIN imp_cancel_doc_expense r on c.imp_expense_vsn_dtl_id = r.imp_expense_vsn_dtl_id
					AND c.imp_expense_vsn_dtl_cheque_id = r.imp_expense_vsn_dtl_cheque_id
					AND r.i_type_doc = 2 /*สถานะยกเลิกรายการ (1=ฎีกา e-phis,2=ฎีกา vision Net,3=ยกเลิก BTN)*/
					AND r.i_enable = 1
				INNER JOIN dc_cheque d ON c.dc_cheque_id = d.dc_cheque_id
			WHERE a.i_enable = 1 AND LEFT(a.c_code,1)='I'
				AND CAST(YEAR(r.d_save_jv_cancel) AS VARCHAR(4)) + RIGHT('0'+CAST(MONTH(r.d_save_jv_cancel) AS VARCHAR(2)), 2) BETWEEN @c_yyyy_mm_s AND @c_yyyy_mm_e
				AND e.dc_bank_deposit_type_id = 2
				AND e.dc_bank_acc_company_id = @dc_bank_acc_company_id
			GROUP BY d.c_cheque, a.c_code, r.d_save_jv_cancel
			UNION ALL
			/*BTN (กระแส) CHEQUE (cancel)*/
			SELECT
				d.c_cheque
				,a.c_code
				,CONVERT(VARCHAR,r.d_save_jv_cancel, 120) AS d_cheque_date
				,SUM(ISNULL(c.f_cheque,0)) AS f_cr
				,2 AS i_stauts
			FROM gl_bank a
				INNER JOIN gl_bank_cheque c ON a.gl_bank_id = c.gl_bank_id
				INNER JOIN dc_bank_acc_company e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source
				INNER JOIN imp_cancel_doc_expense r on c.gl_bank_cheque_id = r.gl_bank_cheque_id
					AND r.i_type_doc = 3 /*สถานะยกเลิกรายการ (1=ฎีกา e-phis,2=ฎีกา vision Net,3=ยกเลิก BTN)*/
					AND r.i_enable = 1
				INNER JOIN dc_cheque d ON c.dc_cheque_id = d.dc_cheque_id
			WHERE  a.i_enable = 1 AND a.c_code IS NOT NULL
				AND e.dc_bank_deposit_type_id = 2
				AND e.dc_bank_acc_company_id = @dc_bank_acc_company_id
				AND CAST(YEAR(r.d_save_jv_cancel) AS VARCHAR(4)) + RIGHT('0'+CAST(MONTH(r.d_save_jv_cancel) AS VARCHAR(2)), 2) BETWEEN @c_yyyy_mm_s AND @c_yyyy_mm_e
			GROUP BY d.c_cheque, a.c_code, r.d_save_jv_cancel
		) a
		
		SELECT
			zz.c_code
			,CONVERT(VARCHAR(10), zz.d_cheque_date, 120) AS d_cheque_date
			,ISNULL(zz.i_status,0) AS i_status
			,CASE
				WHEN ISNULL(zz.i_status,0) = 1 THEN zz.f_amount
				WHEN ISNULL(zz.i_status,0) = 2 THEN -(zz.f_amount)
				ELSE 0
			END AS f_amount
			,CASE
				WHEN zz.c_cheque IS NULL THEN zz.c_cheque_bank
				ELSE zz.c_cheque
			END AS c_cheque
			,zz.c_code_bank
			,CONVERT(VARCHAR(10), zz.d_cheque_date_bank, 120) AS d_cheque_date_bank
			,ISNULL(zz.i_status_bank,0) AS i_status_bank
			,CASE
				WHEN ISNULL(zz.i_status_bank,0) = 1 THEN zz.f_amount_bank
				WHEN ISNULL(zz.i_status_bank,0) = 2 THEN -(zz.f_amount_bank)
				ELSE 0
			END AS f_amount_bank
			,CASE
				WHEN ISNULL(zz.f_amount,0) - ISNULL(zz.f_amount_bank,0) = 0 THEN 1
				ELSE 2
			END AS i_cheque						
		INTO #tempData
		FROM
			( SELECT * FROM ( 
				SELECT aa.* FROM #TMP_CHEQUE_CANCEL aa
				UNION ALL
				SELECT bb.* FROM #TMP_CHEQUE bb
					LEFT JOIN #TMP_CHEQUE_CANCEL cc ON bb.c_cheque = cc.c_cheque
				WHERE cc.c_cheque IS NULL
			) a FULL JOIN (
				/*==================== ข้อมูลธนาคารนำเข้าจากไฟล์ excel สั่งเกตุชื่อ fld ====================*/
				SELECT
					bb.cheque_no AS c_cheque_bank
					,aa.c_code AS c_code_bank
					,bb.d_doc_date AS d_cheque_date_bank
					,bb.i_status AS i_status_bank
					,ABS(bb.f_amount) AS f_amount_bank
				FROM cm_imp_bank_month_hdr aa
					INNER JOIN cm_imp_bank_month_dtl bb ON aa.cm_imp_bank_month_hdr_id = bb.cm_imp_bank_month_hdr_id
				WHERE aa.i_enable = 1
					AND aa.c_code IS NOT NULL
					AND bb.i_cheque = 1
					AND aa.dc_bank_acc_company_id = @dc_bank_acc_company_id
					AND CAST(YEAR(bb.d_doc_date) AS VARCHAR(4)) + RIGHT('0'+CAST(MONTH(bb.d_doc_date) AS VARCHAR(2)), 2) BETWEEN @c_yyyy_mm_s AND @c_yyyy_mm_e
			) b ON a.c_cheque = b.c_cheque_bank
		) zz
							
		SELECT * FROM #tempData
		WHERE 1=1 {$con}
		ORDER BY d_cheque_date, c_cheque;";
	
	$stmt = $db->QueryParam($sqlMain, array());

	if ($stmt) {

		$f_amount			= 0;
		$f_amount_bank		= 0;

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"						=> ++$totalCount,
				"i_type"					=> 1,
				"i_cheque"					=> $row["i_cheque"],
				"c_cheque"					=> $row["c_cheque"],
				"c_code"					=> $row["c_code"],
				"d_cheque_date"				=> ($row["d_cheque_date"] != "") ? $date->shot_date_from_db($row["d_cheque_date"]) : "",
				"i_status"					=> $row["i_status"],
				"f_amount"					=> $row["f_amount"],
				"c_code_bank"				=> $row["c_code_bank"],
				"d_cheque_date_bank"		=> ($row["d_cheque_date_bank"] != "") ? $date->shot_date_from_db($row["d_cheque_date_bank"]) : "",
				"i_status_bank"				=> $row["i_status_bank"],
				"f_amount_bank"				=> $row["f_amount_bank"],
			);

			${$root}[] = $temp;

			$f_amount		+= $row["f_amount"];
			$f_amount_bank	+= $row["f_amount_bank"];
		}

		$temp = array(
			"i_type"					=> 2,
			"f_amount"					=> number_format($f_amount, 2),
			"f_amount_bank"				=> number_format($f_amount_bank, 2)
		);

		${$root}[] = $temp;
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
