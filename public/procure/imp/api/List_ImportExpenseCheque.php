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

if ($_REQUEST["type"] == "imp_expense_hdr" || $_REQUEST["type"] == "imp_expense_vsn_hdr") {

	$fldPkName		= "{$_REQUEST["type"]}_id";

	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];

	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];

	if (!$util->get($start)) {
		$start 	= 0;
	}
	if (!$util->get($limit)) {
		$limit 	= 20;
	} else {
		$limit = ($limit + $start);
	}

	// 	switch($i_read) {
	// 		case 1:		$con = " AND a.dc_user_create_id=".$_SESSION["user_id"]; break;
	// 		case 2:		$con = " AND a.dc_user_create_cost_id=".$_SESSION["dc_cost_id"]; break;
	// 		default:	$con = "";
	// 	}

	if ($mode == "SEARCH") {

		if ($_REQUEST["value"] != "") {
			$con	.= " AND a." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
		}
		if ($_REQUEST["d_doc_date1"] != "" && $_REQUEST["d_doc_date2"] != "") {
			$con	.= " AND a.d_doc_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_doc_date1"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_doc_date2"]}'+' 23:59:59',102)";
		}
		if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
			$con .= " AND a.dc_expense_budget_type_id=" . $_REQUEST["dc_expense_budget_type_id"];
		}
	}

	$period_no	= ($_REQUEST["type"] == "imp_expense_hdr") ? "c_expense_period_no" : "c_expense_vsn_period_no";

	$sqlMain = "SET NOCOUNT ON
				SELECT
					ROW_NUMBER() OVER (ORDER BY a.d_doc_date DESC) AS numrow
					,a.{$fldPkName}
					,a.c_code
					,b.c_code AS c_gx_code
					,b.i_is_post AS i_post
					,a.{$period_no} 
					,a.c_doc
					,a.dc_expense_budget_type_id
					,a.dc_bank_acc_company_id_source
					,a.dc_bank_acc_company_id_target
					,(SELECT aa.c_name FROM dc_expense_budget_type aa WHERE aa.dc_expense_budget_type_id=a.dc_expense_budget_type_id) AS dc_expense_budget_type_name
					,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
					,a.i_enable
					,a.c_comment
					,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_create_id) AS dc_user_create
					,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_create_cost_id) AS dc_user_create_cost
					,CONVERT(VARCHAR, a.d_create, 120) AS d_create
					,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_update_id) AS dc_user_update
					,CONVERT(VARCHAR, a.d_update, 120) AS d_update
					,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_update_cost_id) AS dc_user_update_cost
				INTO #TemData
				FROM {$_REQUEST["type"]} a
					INNER JOIN gl_tran_hdr b ON a.gl_tran_hdr_id = b.gl_tran_hdr_id
				WHERE (b.i_is_post = 3 OR b.i_is_post = 2) AND a.i_enable = 1
					{$con}

				SELECT * FROM #TemData a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow
				
				SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"								=> $row["numrow"],
				"id"								=> $row["{$fldPkName}"],
				"c_code"							=> ($row["c_code"] != "") ? $row["c_code"] : "",
				"c_gx_code"							=> ($row["c_gx_code"] != "") ? $row["c_gx_code"] : "",
				"i_post"							=> $row["i_post"],
				"{$period_no}"						=> $row[$period_no],
				"c_doc"								=> $row["c_doc"],
				"dc_expense_budget_type_id"			=> $row["dc_expense_budget_type_id"],
				"dc_expense_budget_type_name"		=> $row["dc_expense_budget_type_name"],
				"dc_bank_acc_company_id_source"		=> $row["dc_bank_acc_company_id_source"],
				"dc_bank_acc_company_id_target"		=> $row["dc_bank_acc_company_id_target"],
				"d_doc_date"						=> ($row["d_doc_date"] != "") ? $date->extDateBuddha($row["d_doc_date"]) : "",
				"i_enable"							=> $row["i_enable"],
				"c_comment"							=> $row["c_comment"],
				"show_enable"						=> ($row["i_enable"] == 1) ? "ใช้งาน" : "ยกเลิก",
				"dc_user_create_id"					=> "{$row["dc_user_create"]}",
				"dc_user_create_cost_id"			=> "{$row["dc_user_create_cost"]}",
				"d_create"							=> ($row["d_create"] != "") ? $date->extDateBuddha($row["d_create"]) : "",
				"dc_user_update_id"					=> $row["dc_user_update"],
				"dc_user_update_cost_id"			=> $row["dc_user_update_cost"],
				"d_update"							=> ($row["d_update"] != "") ? $date->extDateBuddha($row["d_update"]) : ""
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
} else if ($_REQUEST["type"] == "imp_expense_dtl" || $_REQUEST["type"] == "imp_expense_vsn_dtl") {

	$tableHdr	= $_REQUEST["table"] . "_hdr";
	$tableDtl	= $_REQUEST["table"] . "_dtl";

	$fldSql		= "";

	if ($_REQUEST["value"] != "") {
		$con	.= " AND b." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
	}
	if ($_REQUEST["i_cheque"] == 1) {
		$con .= " AND ISNULL(c.{$tableDtl}_cheque_id,0) = 0";
	} else if ($_REQUEST["i_cheque"] == 2) {
		$con .= " AND ISNULL(c.{$tableDtl}_cheque_id,0) != 0";
	}

	$totalCount		= 0;

	if ($_REQUEST["type"] == "imp_expense_dtl") {

		$expense	= "dc_expense";
		$Field	= array(
			"imp_expense_dtl_id", "imp_expense_hdr_id", "c_budget_type_name", "c_request", "c_approve", "c_expense_group_main", "c_expense_group_sub", "c_acc_item", "f_inv", "f_vat", "f_tax_personal", "f_tax_corporate", "f_social_security", "f_money1", "f_fine", "f_total", "f_check_total", "c_bank_name", "c_bank_branch_name", "dc_source_income_id", "c_dc_expense_name", "dc_expense_id", "dc_acc_id", "cm_pay_type_id", "dc_acc_id_creditor", "c_budget_year", "c_pay_time", "dc_expense_id"
		);
		$fldSql	.= "CONVERT(VARCHAR, b.d_pay, 120) AS d_pay";
	} else {
		$expense	= "dc_expense_acc_vsn";
		$Field	= array(
			"imp_expense_vsn_dtl_id", "imp_expense_vsn_hdr_id", "dc_expense_vsn_id", "c_request", "c_approve", "c_expense_group_main", "c_acc_item", "f_inv", "f_tax_personal", "f_social_security", "f_prov_fund", "f_fine", "f_total", "c_comment", "dc_user_create_id", "dc_user_create_cost_id", "d_create", "dc_user_update_id", "dc_user_update_cost_id", "d_update", "cm_pay_type_id", "dc_acc_id_creditor", "dc_expense_acc_vsn_id"
		);
		$fldSql	.= "CONVERT(VARCHAR, b.d_doc, 120) AS d_doc";
		$fldSql	.= ",CONVERT(VARCHAR, b.d_cheque, 120) AS d_cheque_dtl";
	}
	foreach ($Field as $value) {
		$fldSql .= ($fldSql != "") ? ",b." . $value : "b." . $value;
	}

	// ===================================================================== //

	$sqlBranch	= "
		SELECT
			DISTINCT
			b.c_name
		FROM dc_bank_acc_company a
			INNER JOIN dc_bank_branch b ON a.dc_bank_branch_id = b.dc_bank_branch_id
		WHERE
		dc_bank_acc_company_id IN (SELECT dc_bank_acc_company_id_source FROM {$tableHdr} WHERE {$tableHdr}_id=" . $_REQUEST["id"] . ")
		OR dc_bank_acc_company_id IN (SELECT dc_bank_acc_company_id_target FROM {$tableHdr} WHERE {$tableHdr}_id=" . $_REQUEST["id"] . ")
		ORDER BY b.c_name;";

	$ww = $db->QueryParam($sqlBranch, array());

	if (sqlsrv_has_rows($ww)) {
		$branch		= "";
		while ($rr = $db->Fetch($ww)) {
			$branch .= ($branch != "") ? "," . $rr["c_name"] : $rr["c_name"];
		}
	}

	// ===================================================================== //
	$sqlMain = "
		SET NOCOUNT ON
		SELECT
			{$fldSql}
			,e.c_name AS dc_expense_budget_type_name
			,d.c_name AS dc_expense_name
			,CASE
				WHEN a.dc_bank_acc_company_id_source = a.dc_bank_acc_company_id_target THEN 2
				ELSE 1
			END AS count_bank
			,(SELECT aa.c_bank_name_shot FROM vw_dc_bank_acc_company_full aa WHERE aa.dc_bank_acc_company_id=a.dc_bank_acc_company_id_source) AS c_bank_name_shot_source
			,(SELECT aa.c_bank_name_shot FROM vw_dc_bank_acc_company_full aa WHERE aa.dc_bank_acc_company_id=a.dc_bank_acc_company_id_target) AS c_bank_name_shot_target
			,c.{$tableDtl}_cheque_id
			,f.c_cheque AS dc_cheque_name
			,ISNULL(c.i_status,1) AS i_status
			,CONVERT(VARCHAR, c.d_cheque, 120) AS d_cheque
			,c.f_cheque
			,STUFF((
				SELECT
					aa.c_cheque+''+'<br/>'
				FROM tb_cheque_vsn aa
				WHERE aa.imp_expense_vsn_dtl_id = b.imp_expense_vsn_dtl_id
				FOR XML PATH(''),TYPE).value('(./text())[1]','VARCHAR(MAX)')
			,1,0,'') AS c_cheque
			,b.i_cal_gl
		FROM {$tableHdr} a
			INNER JOIN {$tableDtl} b ON a.{$tableHdr}_id = b.{$tableHdr}_id
			LEFT JOIN {$tableDtl}_cheque c ON b.{$tableDtl}_id = c.{$tableDtl}_id
			LEFT JOIN vw_{$expense} d ON b.{$expense}_id = d.{$expense}_id
			LEFT JOIN dc_expense_budget_type e ON a.dc_expense_budget_type_id = e.dc_expense_budget_type_id
			LEFT JOIN dc_cheque f ON c.dc_cheque_id = f.dc_cheque_id
		WHERE a.{$tableHdr}_id=?
			{$con}
		ORDER BY
			CASE
				WHEN " . (($_REQUEST["type"] == "imp_expense_dtl") ? "ISNULL(b.f_inv,0) + ISNULL(b.f_vat,0)" : "ISNULL(b.f_inv,0)") . " = (SELECT SUM(ISNULL(aa.f_cheque,0)) FROM {$tableDtl}_cheque aa WHERE aa.{$tableDtl}_id = b.{$tableDtl}_id) THEN 1
				ELSE 0
			END,b.c_approve, b.c_acc_item;";

	$arrParam[]	= $_REQUEST["id"];

	$stmt = $db->QueryParam($sqlMain, $arrParam);

	if (sqlsrv_has_rows($stmt)) {

		$ExpCount		= array();
		$ExpArr			= array();
		$CheArr			= array();

		$dc_expense_budget_type_name	= "";

		while ($row = $db->Fetch($stmt)) {

			$dc_expense_budget_type_name		= $row["dc_expense_budget_type_name"];

			// นับจำนวนแต่ละ node
			$ExpCount[$row["{$tableDtl}_id"]]									= $row["{$tableDtl}_id"];
			if ($row["{$tableDtl}_cheque_id"] > 0) {
				$CheArr[$row["{$tableDtl}_id"]][$row["{$tableDtl}_cheque_id"]]["dc_cheque_name"]	= ($row["i_status"] == 1) ? $row["dc_cheque_name"] : $row["dc_cheque_name"] . "<font color=red> (ยกเลิกเช็ค)</font>";
				$CheArr[$row["{$tableDtl}_id"]][$row["{$tableDtl}_cheque_id"]]["d_cheque"]			= ($row["d_cheque"] != "") ? $date->shot_date_from_db($row["d_cheque"]) : "";
				$CheArr[$row["{$tableDtl}_id"]][$row["{$tableDtl}_cheque_id"]]["f_cheque"]			= $row["f_cheque"];
			}

			foreach ($Field as $value) {
				$ExpArr[$row["{$tableDtl}_id"]][$value]	= $row[$value];
			}
			// ถ้าจ่ายให้บริษัท = 2 ต้องหักเงิน จำนวนขอเบิกทั้งสิ้น - ภาษีเงินได้นิติบุคคล
			if ($row["i_cal_gl"] == 2) {
				$ExpArr[$row["{$tableDtl}_id"]]["f_inv"]	= $row["f_inv"] - $row["f_tax_personal"];
			}

			if ($_REQUEST["type"] == "imp_expense_dtl") {
				$ExpArr[$row["{$tableDtl}_id"]]["d_cheque_dtl"]	= ($row["d_pay"] != "") ? $date->shot_date_from_db($row["d_pay"]) : "";
			} else {
				$ExpArr[$row["{$tableDtl}_id"]]["d_doc"]		= ($row["d_doc"] != "") ? $date->shot_date_from_db($row["d_doc"]) : "";
				$ExpArr[$row["{$tableDtl}_id"]]["d_cheque_dtl"]	= ($row["d_cheque_dtl"] != "") ? $date->shot_date_from_db($row["d_cheque_dtl"]) : "";
			}
			$ExpArr[$row["{$tableDtl}_id"]]["c_cheque"]							= $row["c_cheque"];
			$ExpArr[$row["{$tableDtl}_id"]]["dc_expense_name"]					= $row["dc_expense_name"];
			$ExpArr[$row["{$tableDtl}_id"]]["c_bank_name_shot"]					= ($row["count_bank"] > 1) ? $row["c_bank_name_shot_source"] . "," . $row["c_bank_name_shot_target"] : $row["c_bank_name_shot_source"];
			$ExpArr[$row["{$tableDtl}_id"]]["{$tableDtl}_cheque_id"]			= $row["{$tableDtl}_cheque_id"];

			$totalCount++;
		}

		$temp										= array();
		$temp["i_level"]							= 1;
		$temp["dc_expense_budget_type_name"]		= "แหล่งเงิน : " . $dc_expense_budget_type_name;
		${$root}[]	= $temp;

		foreach ($ExpArr as $exp_id => $ExpObj) {

			//========= รายละเอียดค่าใช้จ่าย ===========//
			$temp		= array();

			$temp["i_level"]							= 2;
			$temp["id"]									= $exp_id;

			foreach ($Field as $value) {
				$temp[$value] = $ExpObj[$value];
			}

			$f_inv	= ($_REQUEST["type"] == "imp_expense_dtl") ? round($ExpObj["f_inv"] + $ExpObj["f_vat"], 2) : round($ExpObj["f_inv"], 2);

			$temp["c_approve"]							= "เลขฎีกา : " . $ExpObj["c_approve"];
			$temp["dc_expense_name"]					= $ExpObj["dc_expense_name"];
			$temp["c_bank_name_shot"]					= $ExpObj["c_bank_name_shot"];
			$temp["c_branch"]							= $branch;
			$temp["c_cheque"]							= $ExpObj["c_cheque"];
			$temp["d_cheque_dtl"]						= $ExpObj["d_cheque_dtl"];
			$temp["f_inv"]								= $f_inv;
			$temp["f_inv_show"]							= number_format($f_inv, 2);
			$temp["exp_count"]							= count($ExpCount);
			$temp["cheque_count"]						= count(@$CheArr[$exp_id]);

			if ($_REQUEST["type"] == "imp_expense_dtl") {

				$temp["c_dtl_show"]		=	"วันที่จ่ายเงิน : " . $ExpObj["d_cheque_dtl"] . "<br>" .
					"รายจ่ายย่อย : " . $ExpObj["dc_expense_name"] . "<br>" .
					"รายการ : " . $ExpObj["c_acc_item"] . "<br>" .
					"จ่ายให้ : " . $ExpObj["c_creditor"] . "<br>" .
					"จำนวนขอเบิก: " . number_format($ExpObj["f_inv"], 2) . "<br>" .
					"ภาษีมูลค่าเพิ่ม: " . number_format($ExpObj["f_vat"], 2) . "<br>" .
					"ภาษีหัก ณ ที่จ่าย(บุคคลธรรมดา): " . number_format($ExpObj["f_tax_personal"], 2) . "<br>" .
					"ภาษีหัก ณ ที่จ่าย(นิติบุคคล): " . number_format($ExpObj["f_tax_corporate"], 2) . "<br>" .
					"ประกันสังคม: " . number_format($ExpObj["f_social_security"], 2) . "<br>" .
					"pljobperamt: " . number_format($ExpObj["f_money1"], 2) . "<br>" .
					"ค่าปรับ: " . number_format($ExpObj["f_fine"], 2) . "<br>" .
					"จำนวนจ่ายสุทธิ: " . number_format($ExpObj["f_total"], 2) . "<br>" .
					"จำนวนสุทธิ: " . number_format($ExpObj["f_check_total"], 2) . "<br>" .
					"เลขที่เช็ค: " . $ExpObj["c_cheque_numbers"] . "<br>";
			} else {

				$temp["c_dtl_show"]		=	"วันที่ดำเนินการจัดทำทะเบียนจ่าย: " . $ExpObj["d_doc"] . "<br>" .
					"รายจ่ายย่อย: " . $ExpObj["dc_expense_name"] . "<br>" .
					"เลขที่เอกสารตั้งหนี้: " . $ExpObj["c_request"] . "<br>" .
					"เลขที่ฎีกา: " . $ExpObj["c_approve"] . "<br>" .
					"หมวดรายจ่าย: " . $ExpObj["c_expense_group_main"] . "<br>" .
					"รายการ: " . $ExpObj["c_acc_item"] . "<br>" .
					"จำนวนขอเบิกทั้งสิ้น: " . number_format($ExpObj["f_inv"], 2) . "<br>" .
					"ภาษีเงินได้นิติบุคคล: " . number_format($ExpObj["f_tax_personal"], 2) . "<br>" .
					"ค่าประกันสังคม: " . number_format($ExpObj["f_social_security"], 2) . "<br>" .
					"กองทุนสำรองเลี้ยงชีพ: " . number_format($ExpObj["f_prov_fund"], 2) . "<br>" .
					"ค่าปรับ: " . number_format($ExpObj["f_fine"], 2) . "<br>" .
					"จำนวนเงินที่จ่าย: " . number_format($ExpObj["f_total"], 2) . "<br>" .
					"วันที่ในเช็ค: " . $ExpObj["d_cheque_dtl"] . "<br>";
			}



			${$root}[]	= $temp;

			//=================================//

			if (is_array(@$CheArr[$exp_id])) {
				$no	= 0;
				$sum_cheque	= 0;
				foreach (@$CheArr[$exp_id] as $che_id => $CheObj) {

					$temp		= array();

					$temp["i_level"]							= 3;
					$temp["no"]									= ++$no;
					$temp["id"]									= $exp_id;
					$temp["{$tableHdr}_id"]						= $ExpObj["{$tableHdr}_id"];
					$temp["{$tableDtl}_cheque_id"]				= $che_id;
					$temp["dc_cheque_name"]						= $CheObj["dc_cheque_name"];
					$temp["d_cheque"]							= $CheObj["d_cheque"];
					$temp["f_cheque"]							= number_format($CheObj["f_cheque"], 2);
					$temp["exp_count"]							= count($ExpCount);
					$temp["cheque_count"]						= count(@$CheArr[$exp_id]);

					${$root}[]	= $temp;

					$sum_cheque	+= $CheObj["f_cheque"];
					//=================================//

				}

				$temp		= array();

				$temp["i_level"]							= 4;
				$temp["no"]									= "";
				$temp["id"]									= $exp_id;
				$temp["{$tableHdr}_id"]						= $ExpObj["{$tableHdr}_id"];
				$temp["{$tableDtl}_cheque_id"]				= $che_id;
				$temp["dc_cheque_name"]						= "";
				$temp["d_cheque"]							= "";
				$temp["f_cheque"]							= number_format($sum_cheque, 2);
				$temp["exp_count"]							= "";
				$temp["cheque_count"]						= "";
				$temp["i_chk"]								= (round($f_inv, 2) == round($sum_cheque, 2)) ? true : false;

				${$root}[]	= $temp;
			}
		}
	}

	echo json_encode(array("success" => true, "totalCount" => $totalCount, $root => ${$root}));
	exit;
} else if ($_REQUEST["type"] == "cheque") {

	$tableHdr	= $_REQUEST["table"] . "_hdr";
	$HdrPk		= $_REQUEST["table"] . "_hdr_id";
	$tableDtl	= $_REQUEST["table"] . "_dtl";
	$DtlPk		= $_REQUEST["table"] . "_dtl_id";

	$sqlTempTable = "	
		SELECT
			ROW_NUMBER() OVER (ORDER BY a.{$DtlPk}) AS numrow
			,a.dc_cheque_id
			,d.c_show+' ('+c.c_name+')' AS c_cheque_name
			,a.c_creditor
			,a.c_comment
			,CONVERT(VARCHAR, a.d_cheque, 120) AS d_cheque
			,a.f_cheque
			,a.i_status
		FROM {$tableHdr} x
			INNER JOIN {$tableDtl} z ON x.{$HdrPk} = z.{$HdrPk}
			INNER JOIN {$tableDtl}_cheque a ON z.{$DtlPk} = a.{$DtlPk}
			LEFT JOIN dc_bank_acc_company b ON x.dc_bank_acc_company_id_source = b.dc_bank_acc_company_id
			LEFT JOIN dc_bank_deposit_type c ON b.dc_bank_deposit_type_id = c.dc_bank_deposit_type_id
			LEFT JOIN dc_cheque d ON a.dc_cheque_id = d.dc_cheque_id
		WHERE z.{$DtlPk} = " . $_REQUEST["dtl_id"];

	$sqlMain = "SELECT * FROM ({$sqlTempTable}) a ORDER BY a.numrow";

	$stmt = $db->QueryParam($sqlMain, array());
	if ($stmt) {

		$totalCount	= 0;

		while ($row = $db->Fetch($stmt)) {

			$temp = array(
				"no"						=> $row["numrow"],
				"id"						=> $row["numrow"],
				"dc_cheque_id"				=> $row["dc_cheque_id"],
				"c_cheque_name"				=> $row["c_cheque_name"],
				"c_creditor"				=> ($row["c_creditor"] != "") ? $row["c_creditor"] : "",
				"c_comment"					=> ($row["c_comment"] != "") ? $row["c_comment"] : "",
				"d_cheque"					=> ($row["d_cheque"] != "") ? $date->extDateBuddha($row["d_cheque"]) : "",
				"f_cheque"					=> ($row["f_cheque"] != "") ? $row["f_cheque"] : "",
				"i_status"					=> $row["i_status"]

			);

			$totalCount++;

			${$root}[] = $temp;
		}
	}

	echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
	exit;
}
