<?php
include("../../conf/configPo.php");
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$root		= "data";
$data		= array();
$con		= null;
$con_join 	= null;
$con1		= null;
/**
 * ถอด VAT 7% จากจำนวนเงินรวม VAT
 * 
 * @param float $priceWithVAT จำนวนเงินที่รวม VAT
 * @param float $vatRate อัตรา VAT (ค่าปกติคือ 7%)
 * @return float จำนวนเงินไม่รวม VAT (ปัดทศนิยม 2 ตำแหน่ง)
 */
function removeVAT($priceWithVAT, $vatRate = 7)
{
	// คำนวณราคาที่ไม่รวม VAT

	$priceWithoutVAT = $priceWithVAT / (1 + ($vatRate / 100));
	// ปัดทศนิยมให้เหลือ 2 ตำแหน่ง
	return round($priceWithoutVAT, 2);
}
// echo(removeVAT(107));
// exit;
function Cal_54($cost, $vat_rate) // Cal 5/4 (Check After Dot : is Position3 > 4 )+is Position2+1;
{
	$cost	= str_replace(",", "", $cost); // Split Comma
	$f_vat	= round((($cost * $vat_rate) / 100), 3);
	$arrlist = preg_split('[/.-]', $f_vat);
	// print_r($arrlist);
	// exit;
	$A = @$arrlist[0];
	$B = @$arrlist[1];
	$f_vat	= ($B[2] > 4 && $B[1] == '9' && $B[0] == '9') ? ($A + 1) : ($A . "." . (($B[2] > 4 && $B[1] == '9' && $B[0] <> '9') ? ($B[0] + 1) : $B[0]) . (($B[2] > 4) ? (($B[1] <> 9) ? $B[1] + 1 : 0) : $B[1]));
	echo ($f_vat);
	exit;
	return  $f_vat / 1;
}
// ตัวอย่างการใช้งาน
// $priceWithVAT = 107.457; // จำนวนเงินรวม VAT
// $result = removeVAT($priceWithVAT);

// echo "จำนวนเงินรวม VAT: " . number_format($priceWithVAT, 2) . " บาท<br>";
// echo "จำนวนเงินไม่รวม VAT: " . number_format($result, 2) . " บาท<br>";



if ($_REQUEST["type"] == "po_working_hdr") {

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

	if (@$_REQUEST["only_id"]) {
		$con .= " AND a.po_working_hdr_id=" . $_REQUEST["only_id"];
	} else if ($_REQUEST["i_status"] == -1) {

		//$con .= " AND wb.i_working_type != 7";

		if ($_REQUEST["i_budget_year"] > 0) {
			$con .= " AND i_budget_year=" . $_REQUEST["i_budget_year"];
		}
		if ($_REQUEST["i_budget_year_overlap"] > 0) {
			$con .= " AND i_budget_year_overlap=" . $_REQUEST["i_budget_year_overlap"];
		}
		$_REQUEST["i_status_enable"] = @$_REQUEST["i_status_enable"] ? $_REQUEST["i_status_enable"] : 1;
		if ($_REQUEST["i_status_enable"] == 1) {
			$con .= " AND a.i_enable = 1";
		} else if ($_REQUEST["i_status_enable"] == 2) {
			$con .= " AND a.i_enable != 1";
		}

		if ($mode == "SEARCH") {

			if ($_REQUEST["filter"] == "c_code_ref") {
				if (strpos($_REQUEST["value"], '|') !== false) {
					$con	.= " AND (case a.i_working_type when 7 then wb.c_code_per else a.c_code_ref end) IN (" . "'" . implode("','", explode('|', $_REQUEST["value"])) . "'" . ") ";
				} else {
					$con	.= " AND (case a.i_working_type when 7 then wb.c_code_per else a.c_code_ref end) LIKE '%" . $_REQUEST["value"] . "%' ";
				}
			} else if ($_REQUEST["filter"] == "c_approve") {
				$con	.= " AND b." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
			} else if ($_REQUEST["filter"] == "c_creditor_name") {
				$con	.= " AND dc.c_name LIKE '%" . $_REQUEST["value"] . "%' ";
				$join_creditor = "INNER JOIN " . DB_NMU . " dc_creditor dc on dc.dc_creditor_id = b.dc_creditor_id";
			} else if ($_REQUEST["filter"] == "c_cost") {
				$con	.= " AND cst.c_name LIKE '%" . $_REQUEST["value"] . "%' ";
			} else if ($_REQUEST["filter"] == "c_code_debt") {
				$con	.= " AND b.c_code_debt LIKE '%" . $_REQUEST["value"] . "%' ";
			}
			if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
				$con .= " AND b.dc_expense_budget_type_id=" . $_REQUEST["dc_expense_budget_type_id"];
			}
			if ($_REQUEST["dc_cost_acc_id"] > 0) {
				$con .= " AND b.dc_cost_acc_id=" . $_REQUEST["dc_cost_acc_id"];
			}
			if ($_REQUEST["s_i_status"] != '0') {
				$con .= " AND a.i_sub_status = '" . $_REQUEST["s_i_status"] . "'";
			}
			if ($_REQUEST["checkbox_date"] > 0) {
				if ($_REQUEST["s_date"] == "d_doc_1") {

					$con 	.= " AND CONVERT(date, a.d_create) BETWEEN '{$_REQUEST["date_start"]}' AND '{$_REQUEST["date_end"]}'";
				} else if ($_REQUEST["s_date"] == "d_doc_2") {
					$con_join .= " \nLEFT JOIN po_working_item ii2 on ii2.po_working_hdr_id = b.po_working_hdr_id and ii2.i_sub_status = '2.00'";
					$con 	.= " AND CONVERT(date, ii2.d_doc_date) BETWEEN '{$_REQUEST["date_start"]}' AND '{$_REQUEST["date_end"]}'";
				} else if ($_REQUEST["s_date"] == "d_doc_3") {
					$con_join .= " \nLEFT JOIN po_working_item i3 on i3.po_working_hdr_id = b.po_working_hdr_id and i3.i_sub_status = '4.00'";
					$con 	.= " AND CONVERT(date, i3.d_doc_date) BETWEEN '{$_REQUEST["date_start"]}' AND '{$_REQUEST["date_end"]}'";
				} else if ($_REQUEST["s_date"] == "d_doc_4") {
					$con 	.= " AND CONVERT(date, b.d_pv_date) BETWEEN '{$_REQUEST["date_start"]}' AND '{$_REQUEST["date_end"]}'";
				} else if ($_REQUEST["s_date"] == "d_doc_5") {
					$con_join .= " \nLEFT JOIN po_working_item i8 on i8.po_working_hdr_id = b.po_working_hdr_id and i8.i_sub_status = '11.00'";
					$con 	.= " AND CONVERT(date, i8.d_doc_date) BETWEEN '{$_REQUEST["date_start"]}' AND '{$_REQUEST["date_end"]}'";
				}
			}
		}
	} else {
		// if ($_SESSION["user_id"] != 1) {
		// 	$con .= " AND a.i_enable = 1";
		// }

		if (!@$_REQUEST["i_status_enable"] && $_SESSION["user_id"] == 1) {
		} else {
			$_REQUEST["i_status_enable"] = @$_REQUEST["i_status_enable"] ? $_REQUEST["i_status_enable"] : 1;
			if ($_REQUEST["i_status_enable"] == 1) {
				$con .= " AND a.i_enable = 1";
			} else if ($_REQUEST["i_status_enable"] == 2) {
				$con .= " AND a.i_enable != 1";
			}
		}

		if (@$_REQUEST["only_id"]) {
			$con .= " AND a.po_working_hdr_id=" . $_REQUEST["only_id"];
		} else if (@$_REQUEST["muti_save"]) {
			$con .= " AND a.i_enable = 1";
			if (!($_REQUEST["i_status"] > 7)) {
				$con .= "AND wb.i_working_type != 7";
			}
			$con .= " AND CONVERT(FLOAT,wb.i_sub_status) = CONVERT(FLOAT,'" . $_REQUEST["i_sub_status_before"] . "')";
			if (@$_REQUEST["dc_cost_acc_id"]) {
				$con .= " AND b.dc_cost_acc_id = " . $_REQUEST["dc_cost_acc_id"];
			}
		} else {
			if (!($_REQUEST["i_status"] > 7)) {
				$con .= " AND wb.i_working_type != 7";
			}
			if ($_REQUEST["i_sub_status_before"] == "3.00") { //ส่งทักท้วง
				$con .= " AND CONVERT(FLOAT,wb.i_sub_status) = CONVERT(FLOAT,'" . $_REQUEST["i_sub_status_before"] . "')";
			} else if ($_REQUEST["i_sub_status"] == "0.30") { // บันทึกใบขอเบิก
				// $con .= " AND wb.i_sub_status BETWEEN '0.20' AND '0.21'";
				$con .= " AND CONVERT(FLOAT,wb.i_sub_status) >= CONVERT(FLOAT,'" . $_REQUEST["i_sub_status_before"] . "')";
			} else {
				// $con .= " AND wb.i_sub_status BETWEEN '" . $_REQUEST["i_sub_status_before"] . "' AND '" . $_REQUEST["i_sub_status"] . "'";
				$con .= " AND CONVERT(FLOAT,wb.i_sub_status) >= CONVERT(FLOAT,'" . $_REQUEST["i_sub_status_before"] . "')";
			}

			if ($mode == "SEARCH") {

				if ($_REQUEST["filter"] == "c_code_ref") {
					if (strpos($_REQUEST["value"], '|') !== false) {
						$con	.= " AND (case a.i_working_type when 7 then wb.c_code_per else a.c_code_ref end) IN (" . "'" . implode("','", explode('|', $_REQUEST["value"])) . "'" . ") ";
					} else {
						$con	.= " AND (case a.i_working_type when 7 then wb.c_code_per else a.c_code_ref end) LIKE '%" . $_REQUEST["value"] . "%' ";
					}
				} else if ($_REQUEST["filter"] == "c_approve") {
					$con	.= " AND b." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
				} else if ($_REQUEST["filter"] == "c_creditor_name") {
					$con	.= " AND dc.c_name LIKE '%" . $_REQUEST["value"] . "%' ";
					$join_creditor = "INNER JOIN " . DB_NMU . " dc_creditor dc on dc.dc_creditor_id = b.dc_creditor_id";
				} else if ($_REQUEST["filter"] == "c_cost") {
					$con	.= " AND cst.c_name LIKE '%" . $_REQUEST["value"] . "%' ";
				} else if ($_REQUEST["filter"] == "c_code_debt") {
					$con	.= " AND b.c_code_debt LIKE '%" . $_REQUEST["value"] . "%' ";
				}
				if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
					$con .= " AND b.dc_expense_budget_type_id=" . $_REQUEST["dc_expense_budget_type_id"];
				}
				if ($_REQUEST["dc_cost_acc_id"] > 0) {
					$con .= " AND b.dc_cost_acc_id=" . $_REQUEST["dc_cost_acc_id"];
				}
				// if ($_REQUEST["i_sub_status"] != '99') {
				// 	$con .= " AND wb.i_sub_status = '" . $_REQUEST["i_sub_status"] . "'";
				// }
			}

			if ($_REQUEST["i_budget_year"] > 0) {
				$con .= " AND i_budget_year=" . $_REQUEST["i_budget_year"];
			}
			if ($_REQUEST["i_budget_year_overlap"] > 0) {
				$con .= " AND i_budget_year_overlap=" . $_REQUEST["i_budget_year_overlap"];
			}
			if (@$CONF_I_SUB_STATUS_VIEW[@$_REQUEST["i_sub_status"]] && @$_REQUEST["i_view_my_status"]) {
				$implode_status = "'" . implode("','", $CONF_I_SUB_STATUS_VIEW[@$_REQUEST["i_sub_status"]]) . "'";
				$con .= " AND wb.i_sub_status in (" . $implode_status . ")";
			}
		}
	}


	$order = "";
	// if ($_REQUEST["i_sub_status"] == "0.50") {
	// 	$con .= " AND a.dc_user_update_cost_id =" . $_SESSION["dc_cost_id"];
	// }

	/**** กำหนดสิทธิ์ (หน่วยงาน/ส่วนงาน) ****/
	if ($_REQUEST["i_read"] == 1) {
		if ($_REQUEST["i_sub_status"] == "4.00") {
			$con .= " AND b.dc_approve_id=" . $_SESSION["user_id"];
		} else if ($_REQUEST["i_sub_status"] == "7.00") {
			$con .= " AND b.dc_executive_id=" . $_SESSION["user_id"];
		} else {
			$con .= " AND a.dc_user_create_id=" . $_SESSION["user_id"];
		}
	}

	if ($_SESSION["user_id"] != 1 && in_array($_REQUEST["i_sub_status"], array('0.30', '0.40', '0.50', '3.00'))) {
		if ($_SESSION["dc_cost_id"] == 97) {
			$con .= " AND a.dc_user_create_cost_id = " . 97;
		} else {
			$con .= " AND a.dc_user_create_cost_id != " . 97;
		}
	}

	$insert_temp_user = "";
	if ($_REQUEST["i_sub_status"] == '0.50' && $_SESSION["user_id"] == '12') {
		$insert_temp_user .= "\n INSERT INTO @TEMP_SP_USER_COST_SYS (dc_cost_id) VALUES (77);";
	}

	$temp_user_cost = "
		DECLARE @TEMP_SP_USER_COST_SYS TABLE (dc_cost_id BIGINT); 
		INSERT INTO @TEMP_SP_USER_COST_SYS EXEC " . DB_CENTER . "SP_USER_COST_SYS "
		. (@$_SESSION["user_id"] ?? "null") . ","
		. (@$_SESSION['i_type_user'] ?? "null") . ","
		. (@$_REQUEST["i_read"] ?? "null") . ","
		. (@$_REQUEST["c_code_sys"] ? "'" . $_REQUEST["c_code_sys"] . "'" : "null") . ";

		{$insert_temp_user}

	";
	/***********************************/

	$sqlMain = "
		SET NOCOUNT ON
		{$temp_user_cost}

		SELECT aa.po_working_hdr_id, MAX(isnull(aa.i_status,0)) AS i_status ,aa.i_is_url_pdf_hdr 
		into #temp_c
		FROM dbo.po_working_item aa WHERE aa.i_enable = 1 GROUP BY aa.po_working_hdr_id ,aa.i_is_url_pdf_hdr

		SELECT
			aa.po_working_hdr_id
			,i_is_url_pdf_hdr
			,i_is_url_pdf_dtl
			,c_file_pdf_hdr
			,c_url_pdf_hdr
			,c_file_pdf_dtl
			,c_url_pdf_dtl
			,c_file_pdf_pay
			,c_file_pdf_protest_hdr
			,c_file_pdf_protest_dtl
		INTO #temp_s2
		FROM po_working_item aa
		INNER JOIN (
			SELECT  
				po_working_hdr_id
				,MAX(isnull(po_working_item_id,0)) AS po_working_item_id 
				,MAX(isnull(CONVERT(FLOAT,i_sub_status),0)) AS max_sub_status
			FROM po_working_item
			WHERE i_enable = 1
			GROUP BY po_working_hdr_id
		) bb ON aa.po_working_item_id = bb.po_working_item_id AND aa.po_working_hdr_id = bb.po_working_hdr_id AND bb.max_sub_status = i_sub_status

		SELECT
			ROW_NUMBER() OVER (ORDER BY (case when b.dc_approve_id > 0 or a.i_status_last > 2 then 1 else 0 end), a.i_status_last,(case when a.i_status_last >= 2  then ii2.d_doc_date else b.d_create end) DESC, d.d_doc_date DESC, a.c_code_ref) AS numrow
			, a.po_working_hdr_id
			, a.i_status_last
		INTO #TemData
		FROM dbo.po_working_hdr a
			INNER JOIN dbo.po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id
			--INNER JOIN dbo.po_working_item bb ON bb.po_working_hdr_id = a.po_working_hdr_id AND bb.i_sub_status = a.i_sub_status AND bb.i_enable = 1
			LEFT JOIN #temp_c c ON a.po_working_hdr_id = c.po_working_hdr_id
			LEFT JOIN (
				SELECT * FROM (
                    SELECT po_working_hdr_id,po_working_item_id,i_sub_status,d_doc_date,
                    ROW_NUMBER() OVER (PARTITION BY po_working_hdr_id ORDER BY CONVERT(FLOAT,i_sub_status), po_working_item_id DESC) AS rn
                    FROM po_working_item where i_sub_status is not null
                ) AS subquery
                WHERE rn = 1
			) d ON a.po_working_hdr_id = d.po_working_hdr_id AND a.i_sub_status = d.i_sub_status
			LEFT join  dbo.po_working_begin_hdr wb on a.po_working_begin_hdr_id = wb.po_working_begin_hdr_id
			LEFT JOIN (SELECT aa.* FROM dbo.po_working_item aa WHERE aa.i_enable = 1 AND aa.i_status = 99) a1 ON a.po_working_hdr_id = a1.po_working_hdr_id
			INNER JOIN @TEMP_SP_USER_COST_SYS TEMP_SP_USER_COST_SYS ON TEMP_SP_USER_COST_SYS.dc_cost_id = b.dc_cost_id
			INNER JOIN " . DB_CENTER . " dc_cost cst on cst.dc_cost_id = b.dc_cost_id
			
			--LEFT JOIN po_working_item i1 on i1.po_working_hdr_id = b.po_working_hdr_id and i1.i_sub_status = '0.40'
			--LEFT JOIN po_working_item i2 on i2.po_working_hdr_id = b.po_working_hdr_id and i2.i_sub_status = '0.50'
			LEFT JOIN po_working_item ii2 on ii2.po_working_hdr_id = b.po_working_hdr_id and ii2.i_sub_status = '2.00'
			--LEFT JOIN po_working_item i4 on i4.po_working_hdr_id = b.po_working_hdr_id and i4.i_sub_status = '5.00'
			--LEFT JOIN po_working_item i5 on i5.po_working_hdr_id = b.po_working_hdr_id and i5.i_sub_status = '6.00'
			--LEFT JOIN po_working_item i6 on i6.po_working_hdr_id = b.po_working_hdr_id and i6.i_sub_status = '7.00'
			" . @$con_join . "

			" . @$join_creditor . "
			
		WHERE 1 = 1
			{$con};

		SELECT
			a.numrow
			,b.po_working_hdr_id
			,b.po_working_begin_hdr_id
			,c.c_code
			,wb.i_sub_status
			,wb.c_code_per
			,wb.c_title
			,wb.c_heading
			,wb.c_detail
			,wb.i_working_type
			,wb.i_purchase
			,wb.f_per_inv
			,wb.f_per_vat
			,wb.f_per_vat_rate
			,wb.f_per_inv_vat
			,wb.f_per_tax_personal
			,wb.f_per_tax_personal_rate
			,wb.f_per_social_security
			,wb.f_per_prov_fund
			,wb.f_per_fine
			,wb.f_per_warranty
			,wb.f_per_other
			,wb.f_per_pay
			,ISNULL(wb.bg_request_money_income_id,0) AS bg_request_money_income_id
			,b.i_status_last
			,b.c_status_last
			,CASE WHEN ISNULL(a1.i_status,0) > 0 THEN 1 ELSE 0 END AS i_status_edit
			,CASE WHEN ISNULL(b.i_status_last,0) < 4 THEN null ELSE c.c_approve END AS c_approve
			,CONVERT(VARCHAR, c.d_approve_date, 120) AS d_approve_date
			,c.bg_expense_id
			,c.bg_budget_dtl_overlap_id
			,c.c_booking
			,c.dc_cost_id
			,c.dc_creditor_id
			,c.dc_creditor_transfer_id
			,(SELECT TOP 1 c_name FROM " . DB_NMU . "dc_creditor aa where aa.dc_creditor_id = c.dc_creditor_id) AS c_creditor_name
			,c.po_creditor_id
			,c.po_creditor_transfer_id
			,c.c_code_invoice
			,c.po_working_program_hdr_id
			,c.sp_sbill_hdr_id
			,c.cm_receive_tran_hdr_id
			,c.bg_budget_hdr_change_id
			,c.c_qty
			,c.po_emp_id
			,CONVERT(VARCHAR, c.d_inv_date, 120) AS d_inv_date
			,CONVERT(VARCHAR, c.d_doc_date, 120) AS d_doc_date
			,CONVERT(VARCHAR, c.d_audit_date, 120) AS d_audit_date
			,e.c_name AS cost_name
			,c.dc_expense_budget_type_id
			,f.c_name AS budget_name
			,g.c_code+' : '+g.c_name AS bg_expense_name
			,h.c_name AS creditor_name
			,c.i_budget_year
			,c.i_budget_year_overlap
			,c.f_total
			,c.f_no_effect
			,c.i_protest_only_doc_hdr
			,c.i_protect_only_doc
			,ISNULL(b.c_comment,'') AS c_comment
			,b.i_enable
			,(SELECT bb.c_name FROM " . DB_CENTER . "dc_user aa LEFT JOIN  " . DB_CENTER . "dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = b.dc_user_update_id) AS dc_user_update
			,(SELECT c_name FROM " . DB_CENTER . "dc_cost aa WHERE dc_cost_id = b.dc_user_update_cost_id) AS dc_user_update_cost
			,CONVERT(VARCHAR, b.d_create, 120) AS d_create
			,CONVERT(VARCHAR, b.d_update, 120) AS d_update
			,CONVERT(VARCHAR, a2.d_doc_date, 120) AS back_d_doc_date
			,a2.c_comment AS back_c_comment
			,CONVERT(VARCHAR, a2.d_receive_date, 120) AS d_receive_date
			,a2.c_comment AS c_receive_comment
			,c.i_close_receive
			,CONVERT(VARCHAR, a1.d_doc_date, 120) AS d_status_date
			,ISNULL(a1.c_comment,'') AS c_comment_status
			,CONVERT(VARCHAR, a3.d_doc_date, 120) AS d_status_date_last
			,(select count(*) from po_working_item aa where aa.po_working_hdr_id = a.po_working_hdr_id and i_status = 3) as i_protest
			,c.dc_bank_acc_creditor_id
			,c.dc_tax_customer_id
			,c.dc_approve_id
			,(select top 1 c_full_name from " . DB_CENTER . "dc_user aa where aa.dc_user_id = c.dc_approve_id) as dc_approve_name
			,c.dc_executive_id
			,(select top 1 c_full_name from " . DB_CENTER . "dc_user aa where aa.dc_user_id = c.dc_executive_id) as dc_executive_name
			,c.dc_cost_acc_id
			,s2.i_is_url_pdf_hdr
			,s2.i_is_url_pdf_dtl
			,c.i_doc_duo
			,c.i_reserve_pay
			,c.i_inside_cost
			,c.i_cost_sign_out
			,c.i_pdf_dtl_outside
			,isnull(c.i_quick,0) as i_quick
			,isnull(c.i_instead_dep_sign,0) as i_instead_dep_sign
			,c.c_instead_dep_sign
			,c.c_instead_cost_sign
			,c.c_instead_main
			,c.c_instead_sub
			,c.dc_position_executive_sub_id
			,isnull(c.i_instead_cost_sign,0) as i_instead_cost_sign
			,isnull(c.i_instead_main,0) as i_instead_main
			,isnull(c.i_instead_sub,0) as i_instead_sub
            , case
				when s2.i_is_url_pdf_hdr = 0 then s2.c_file_pdf_hdr
				when s2.i_is_url_pdf_hdr = 1 then s2.c_url_pdf_hdr
			end as pdf_hdr
			, case
				when s2.i_is_url_pdf_dtl = 0 then s2.c_file_pdf_dtl
				when s2.i_is_url_pdf_dtl = 1 then s2.c_url_pdf_dtl
			end as pdf_dtl
			,s2.c_file_pdf_pay as pdf_pay

			,s2.c_file_pdf_protest_hdr
			,s2.c_file_pdf_protest_dtl

			,(SELECT TOP 1 (SELECT TOP 1 dc_tax_income_id FROM " . DB_CENTER . "dc_tax_customer aaa WHERE aaa.dc_tax_customer_id = aa.dc_tax_customer_id )FROM " . DB_NMU . "dc_creditor aa WHERE aa.dc_creditor_id = c.dc_creditor_id) as dc_tax_income
			,(SELECT c_name from " . DB_CENTER . "cm_pay_type aa where aa.cm_pay_type_id = c.cm_pay_type_id) AS c_pay_type
			,(select top 1 (select top 1 c_name from po_group_bulk_hdr bb where aa.po_group_bulk_hdr_id = bb.po_group_bulk_hdr_id) from dbo.po_group_bulk_dtl aa where aa.po_working_hdr_id = a.po_working_hdr_id) as file_bulk
			,wb.i_sys as i_sys_ss
			,wb.chk_id as chk_id_ss
			,c.gl_tran_hdr_id
			,b.parent_id
			,(SELECT TOP 1 dc_approve_id FROM po_working_dtl aa WHERE aa.po_working_hdr_id = b.parent_id) as dc_approve_id_old
			,c.c_code_debt
			,CONVERT(VARCHAR, c.d_debt_date, 120) AS d_debt_date
			,c.c_debt_month
			,c.c_debt_year
			,c.c_code_advance
			,STUFF((SELECT ',' + cast(po_paymant_type_id as varchar) + ';'+ cast(c_payment_id  as varchar) + ';'+ cast(isnull(f_payment,0.00) as varchar) 
				FROM po_paymant_item aa 
				WHERE 
					aa.po_working_hdr_id = a.po_working_hdr_id 
					AND po_paymant_type_id is not null 
					AND c_payment_id is not null 
				ORDER BY po_paymant_type_id FOR XML PATH('')
			), 1, 1, '') AS c_payment_item
			,(select top 1  aa.c_code_ref from po_working_hdr aa where aa.parent_id = b.po_working_hdr_id) as parent_c_code_ref
			,(select top 1  aa.c_code_ref from po_working_hdr aa where aa.po_working_hdr_id = b.parent_id) as parent_c_code_ref1

			,CONVERT(VARCHAR, ii2.d_doc_date, 120) AS d_doc_date_2@00 /*วันที่รับใบขอเบิก*/
			--,CONVERT(VARCHAR, i3.d_doc_date, 120) AS d_doc_date_4@00 /*วันที่ตรวจสอบ*/
			--,CONVERT(VARCHAR, i8.d_doc_date, 120) AS d_doc_date_11@00 /*วันที่ทำทะเบียน*/
			,sjv.i_send_jv
			,case sjv.i_send_jv 
				when 1 then 'ไม่ระบุ'
				when 2 then 'ไม่บันทึกบัญชี'
				when 3 then 'รอบันทึกบัญชี'
				when 4 then 'บันทึกบัญชีแล้ว'
				when 9 then 'ยกเลิกบันทึกบัญชี'
			end as c_send_jv
		FROM #TemData a
			INNER JOIN dbo.po_working_hdr b ON a.po_working_hdr_id = b.po_working_hdr_id
			INNER JOIN dbo.po_working_dtl c ON b.po_working_hdr_id = c.po_working_hdr_id
			LEFT join  dbo.po_working_begin_hdr wb on b.po_working_begin_hdr_id = wb.po_working_begin_hdr_id
			LEFT JOIN " . DB_CENTER . "dc_cost e ON c.dc_cost_id = e.dc_cost_id AND e.i_enable = 1 AND e.i_delete = 2
			LEFT JOIN " . DB_CENTER . "dc_expense_budget_type f ON c.dc_expense_budget_type_id = f.dc_expense_budget_type_id AND f.i_enable = 1 AND f.i_delete = 2
			LEFT JOIN bg_expense g ON c.bg_expense_id = g.bg_expense_id
			LEFT JOIN dbo.po_creditor h ON c.po_creditor_id = h.po_creditor_id AND h.i_enable = 1
			LEFT JOIN #temp_s2 s2 ON s2.po_working_hdr_id = a.po_working_hdr_id
			--INNER JOIN dbo.po_working_item s2 ON s2.po_working_hdr_id = a.po_working_hdr_id AND s2.i_status = (select MAX(i_status) from po_working_item aa where aa.po_working_hdr_id = a.po_working_hdr_id and aa.i_enable = 1) AND s2.i_enable = 1
			LEFT JOIN (SELECT aa.* FROM dbo.po_working_item aa WHERE aa.i_enable = 1 AND aa.i_sub_status = '{$_REQUEST["i_sub_status"]}') a1 ON b.po_working_hdr_id = a1.po_working_hdr_id
			LEFT JOIN (SELECT aa.* FROM dbo.po_working_item aa WHERE aa.i_enable = 1 AND aa.i_status = 3) a2 ON b.po_working_hdr_id = a2.po_working_hdr_id
			LEFT JOIN (SELECT aa.* FROM dbo.po_working_item aa WHERE aa.i_enable = 1) a3 ON b.po_working_hdr_id = a3.po_working_hdr_id AND b.i_sub_status = a3.i_sub_status
			LEFT JOIN " . DB_CENTER . " dc_map_send_jv sjv ON sjv.po_working_hdr_id = b.po_working_hdr_id and sjv.i_enable = 1 
			LEFT JOIN po_working_item ii2 on ii2.po_working_hdr_id = b.po_working_hdr_id and ii2.i_sub_status = '2.00' 
		WHERE 1=1  
			" . (@$_REQUEST["muti_save"] ? "--" : "") . "AND a.numrow > ? AND a.numrow <= ? 
		ORDER BY a.numrow; 
		SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;
	if (@$_REQUEST["show_sql"]) {
		/******echo sql******/
		$sql = str_replace('?', '#-#', $sqlMain);
		foreach ($arrParam as $fld => $value) {
			$sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
		}
		echo $sql;
		exit;
		/********************/
	}
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$c_stats_last = $CONF_I_SUB_STATUS_TXT[number_format($row["i_sub_status"], 2)];
			$temp = array(
				"no"								=> $row["numrow"],
				"id"								=> $row["po_working_hdr_id"],
				"po_working_begin_hdr_id"			=> $row["po_working_begin_hdr_id"],
				"bg_request_money_income_id"		=> $row["bg_request_money_income_id"],
				"c_code"							=> $row["c_code"],
				"c_code_per"						=>	$row["c_code_per"],
				"c_heading"							=>	$row["c_heading"],
				"c_title"							=>	$row["c_title"],
				"c_detail"							=>	$row["c_detail"],
				"c_booking"							=>	$row["c_booking"],
				"i_working_type"					=>	$row["i_working_type"],
				"i_purchase"						=>	$row["i_purchase"],
				"f_inv"								=>	$row["f_per_inv"],
				"f_vat_rate"					    =>	$row["f_per_vat_rate"],
				"f_vat"								=>	$row["f_per_vat"],
				"f_inv_vat"							=>	$row["f_per_inv_vat"],
				"parent_id"							=>	$row["parent_id"],
				"parent_c_code_ref"					=>	$row["parent_c_code_ref"],
				"parent_c_code_ref1"				=>	$row["parent_c_code_ref1"],
				"f_tax_personal"					=>	$row["f_per_tax_personal"],
				"f_tax_personal_rate"				=>	$row["f_per_tax_personal_rate"],
				"f_social_security"					=>	$row["f_per_social_security"],
				"f_prov_fund"						=>	$row["f_per_prov_fund"],
				"f_fine"							=>	$row["f_per_fine"],
				"f_warranty"						=>	$row["f_per_warranty"],
				"f_other"							=>	$row["f_per_other"],
				"f_pay"								=>	$row["f_per_pay"],
				"c_code_ref"						=> $row["c_code"],
				"i_sub_status"						=> number_format($row["i_sub_status"], 2),
				"i_status_last"						=> $row["i_status_last"],
				"c_status_last"						=> $c_stats_last,
				"i_status_edit"						=> $row["i_status_edit"],
				"i_protest_only_doc_hdr"			=> $row["i_protest_only_doc_hdr"],
				"i_protect_only_doc"				=> $row["i_protect_only_doc"],
				"c_approve"							=> $row["c_approve"],
				"d_approve_date"					=> ($row["d_approve_date"] != "") ? $date->extDateBuddha($row["d_approve_date"]) : "",
				"bg_expense_id"						=> $row["bg_expense_id"],
				"bg_budget_dtl_overlap_id"			=> ($row["bg_budget_dtl_overlap_id"] > 0) ? $row["bg_budget_dtl_overlap_id"] : "",
				"dc_cost_id"						=> $row["dc_cost_id"],
				"cost_name"							=> ($row["cost_name"]) ? $row["cost_name"] : "-",
				"dc_expense_budget_type_id"			=> $row["dc_expense_budget_type_id"],
				"dc_tax_customer_id"				=> $row["dc_tax_customer_id"],
				"budget_name"						=> $row["budget_name"],
				"bg_expense_name"					=> $row["bg_expense_name"],
				"creditor_name"						=> $row["creditor_name"],
				"dc_creditor_id"					=> $row["dc_creditor_id"],
				"dc_creditor_transfer_id"			=> $row["dc_creditor_transfer_id"],
				"c_creditor_name"					=> $row["c_creditor_name"],
				"po_creditor_id"					=> $row["po_creditor_id"],
				"po_creditor_transfer_id"			=> $row["po_creditor_transfer_id"],
				"c_code_invoice"					=> $row["c_code_invoice"],
				"dc_cost_acc_id"					=> $row["dc_cost_acc_id"],
				"i_inside_cost"						=> $row["i_inside_cost"],
				"i_cost_sign_out"					=> $row["i_cost_sign_out"],
				"i_pdf_dtl_outside"					=> $row["i_pdf_dtl_outside"],
				"po_working_program_hdr_id"			=> $row["po_working_program_hdr_id"],
				"sp_sbill_hdr_id"					=> $row["sp_sbill_hdr_id"],
				"bg_budget_hdr_change_id"			=> $row["bg_budget_hdr_change_id"],
				"cm_receive_tran_hdr_id"			=> $row["cm_receive_tran_hdr_id"],
				"c_qty"								=> $row["c_qty"],
				"po_emp_id"							=> $row["po_emp_id"],
				"d_inv_date"						=> ($row["d_inv_date"] != "") ? $date->extDateBuddha($row["d_inv_date"]) : "",
				"d_doc_date"						=> ($row["d_doc_date"] != "") ? $date->extDateBuddha($row["d_doc_date"]) : "",
				"d_audit_date"						=> ($row["d_audit_date"] != "") ? $date->extDateBuddha($row["d_audit_date"]) : "",
				"i_budget_year"						=> $row["i_budget_year"],
				"c_i_budget_year"					=> $row["i_budget_year"] + 543,
				"i_budget_year_overlap"				=> $row["i_budget_year_overlap"],
				"c_i_budget_year_overlap"			=> $row["i_budget_year_overlap"] + 543,

				"f_total"							=> (in_array($row["i_working_type"], array(5, 6, 8))) ? $row["f_no_effect"] : $row["f_total"],
				"d_status_date"						=> ($row["d_status_date"] != "") ? $date->extDateBuddha($row["d_status_date"]) : "",
				"c_comment"							=> $row["c_comment"],
				"i_enable"							=> $row["i_enable"],
				"dc_user_update_id"					=> $row["dc_user_update"],
				"dc_user_update_cost_id"			=> $row["dc_user_update_cost"],
				"d_create"							=> ($row["d_create"] != "") ? $date->extDateBuddha($row["d_create"]) : "",
				"d_update"							=> ($row["d_update"] != "") ? $date->extDateBuddha($row["d_update"]) : "",
				"back_d_doc_date"					=> ($row["back_d_doc_date"] != "") ? $date->extDateBuddha($row["back_d_doc_date"]) : "",
				"back_c_comment"					=> $row["back_c_comment"],
				"d_receive_date"					=> ($row["d_receive_date"] != "") ? $date->extDateBuddha($row["d_receive_date"]) : "",
				"c_receive_comment"					=> $row["c_receive_comment"],
				"i_close_receive"					=> $row["i_close_receive"],
				"c_comment_status"					=> $row["c_comment_status"],
				"d_status_date_last"				=> ($row["d_status_date_last"] != "") ? $date->extDateBuddha($row["d_status_date_last"]) : "",
				"i_protest"							=> $row["i_protest"],
				"dc_approve_id"						=> $row["dc_approve_id"],
				"dc_approve_name"					=> $row["dc_approve_name"],
				"dc_approve_id_old"					=> $row["dc_approve_id_old"],
				"dc_executive_id"					=> $row["dc_executive_id"],
				"dc_executive_name"					=> $row["dc_executive_name"],
				"dc_bank_acc_creditor_id"			=> $row["dc_bank_acc_creditor_id"],
				"i_is_url_pdf_hdr"					=> $row["i_is_url_pdf_hdr"],
				"i_is_url_pdf_dtl"					=> $row["i_is_url_pdf_dtl"],
				"pdf_hdr"							=> $row["pdf_hdr"],
				"pdf_dtl"							=> $row["pdf_dtl"],
				"pdf_pay"							=> $row["pdf_pay"],
				"dc_tax_income"     				=> $row['dc_tax_income'],
				"c_pay_type"        				=> $row['c_pay_type'],
				"file_bulk"         				=> $row['file_bulk'],
				"i_sys_ss"    						=> $row["i_sys_ss"],
				"chk_id_ss"    						=> $row["chk_id_ss"],
				"gl_tran_hdr_id"    				=> $row["gl_tran_hdr_id"],
				"i_doc_duo"           				=> $row["i_doc_duo"],
				"i_reserve_pay"           			=> $row["i_reserve_pay"],
				"i_quick"           				=> $row["i_quick"],
				"i_instead_main"    				=> $row["i_instead_main"],
				"c_instead_dep_sign"     			=> $row["c_instead_dep_sign"],
				"c_instead_cost_sign"     			=> $row["c_instead_cost_sign"],
				"c_instead_main"     				=> $row["c_instead_main"],
				"c_instead_sub"     				=> $row["c_instead_sub"],
				"i_instead_dep_sign"     			=> $row["i_instead_dep_sign"],
				"i_instead_cost_sign"     			=> $row["i_instead_cost_sign"],
				"i_instead_sub"     				=> $row["i_instead_sub"],
				"dc_position_executive_sub_id"     	=> $row["dc_position_executive_sub_id"],
				"c_payment_item"       				=> $row["c_payment_item"],
				"c_code_debt"       				=> $row["c_code_debt"],
				"c_code_advance"       				=> $row["c_code_advance"],
				"d_debt_date"       				=> ($row["d_debt_date"] != "") ? $date->extDateBuddha($row["d_debt_date"]) : "",
				"c_debt_month"      				=> $row["c_debt_month"],
				"c_debt_year"       				=> $row["c_debt_year"],
				"i_send_jv"       					=> $row["i_send_jv"],
				"c_send_jv"       					=> $row["c_send_jv"],
				"d_doc_date_2@00"       			=> ($row["d_doc_date_2@00"] != "") ? $date->extDateBuddha($row["d_doc_date_2@00"]) : "",/*วันที่รับใบขอเบิก*/
				"c_file_pdf_protest_hdr"       		=> $row["c_file_pdf_protest_hdr"] ? PATH_EIS_PO_PROTEST_PDF . $row["c_file_pdf_protest_hdr"] : null,
				"c_file_pdf_protest_dtl"       		=> $row["c_file_pdf_protest_dtl"] ? PATH_EIS_PO_PROTEST_PDF . $row["c_file_pdf_protest_dtl"] : null,

			);
			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
} else if ($_REQUEST["type"] == "po_working_cheque") {

	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];

	// 	switch($i_read) {
	// 		case 1:		$con = " AND a.dc_user_create_id=".$_SESSION["user_id"]; break;
	// 		case 2:		$con = " AND a.dc_user_create_cost_id=".$_SESSION["dc_cost_id"]; break;
	// 		default:	$con = "";
	// 	}

	$sqlMain = "
		SET NOCOUNT ON
		DECLARE @po_working_hdr_id BIGINT = {$_REQUEST["hdr_id"]};
		SELECT
			ROW_NUMBER() OVER (ORDER BY a.i_status, CASE WHEN a.c_cheque IS NULL THEN 0 ELSE 1 END DESC,a.c_cheque) AS numrow
			,1 AS i_type
			,a.po_working_cheque_id
			,a.c_creditor
		INTO #TemData
		FROM dbo.po_working_cheque a
		WHERE a.po_working_hdr_id = @po_working_hdr_id
			{$con};

		SELECT
			2 AS i_type
			,NULL AS numrow
			,NULL AS po_working_cheque_id
			,'' AS c_creditor
			,'จำนวนเงินขอเบิก' AS c_cheque
			,b.f_total
			,NULL AS c_comment
			,NULL AS i_status
			,NULL AS i_cheque
		INTO #TemData_working
		FROM dbo.po_working_hdr a
			INNER JOIN dbo.po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id AND a.i_enable = 1 AND a.po_working_hdr_id = @po_working_hdr_id;

		SELECT
			3 AS i_type
			,NULL AS numrow
			,NULL AS po_working_cheque_id
			,'' AS c_creditor
			,'จำนวนรวมเช็ค' AS c_cheque
			,ISNULL(SUM(ISNULL(b.f_total,0)),0) AS f_total
			,NULL AS c_comment
			,NULL AS i_status
			,NULL AS i_cheque
		INTO #TemData_cheque
		FROM #TemData a
			INNER JOIN dbo.po_working_cheque b ON a.po_working_cheque_id = b.po_working_cheque_id;

		SELECT
			i_type
			,a.numrow
			,b.po_working_cheque_id
			,b.c_creditor
			,b.c_cheque
			,b.f_total
			,b.c_comment
			,b.i_status
			,b.i_cheque
			,NULL AS i_chk
		FROM #TemData a
			INNER JOIN dbo.po_working_cheque b ON a.po_working_cheque_id = b.po_working_cheque_id
		UNION ALL
		SELECT
			a.*
			,CASE WHEN (SELECT SUM(aa.f_total) FROM #TemData_cheque aa) = a.f_total THEN 1 ELSE 0 END AS i_chk
		FROM #TemData_working a
		UNION ALL
		SELECT
			a.*
			,CASE WHEN (SELECT SUM(aa.f_total) FROM #TemData_working aa) = a.f_total THEN 1 ELSE 0 END AS i_chk
		FROM #TemData_cheque a
		ORDER BY i_type,numrow;

		SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam = array();
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"								=> $row["numrow"],
				"i_type"							=> $row["i_type"],
				"id"								=> $row["po_working_cheque_id"],
				"c_creditor"						=> $row["c_creditor"],
				"c_cheque"							=> $row["c_cheque"],
				"f_total"							=> $row["f_total"],
				"c_comment"							=> $row["c_comment"],
				"i_status"							=> $row["i_status"],
				"i_cheque"							=> $row["i_cheque"],
				"i_chk"								=> $row["i_chk"],
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
} else if ($_REQUEST["type"] == "po_working_begin_disable") {
	$sqlMain = "SELECT i_sys, per_id FROM po_working_begin_hdr WHERE i_enable = 1 AND i_delete = 2";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);

	$arr_c_per = array();
	if ($stmt) while ($row = $db->Fetch($stmt)) $arr_c_per[] = $row["i_sys"] . '_' . $row["per_id"];

	$json = trim(file_get_contents('../../../json_test/data.json'), "\xEF\xBB\xBF");
	$json_data = json_decode($json, true);
	if ($json_data["debug"]) {
		foreach ($json_data["data"] as $index_hdr => $data_hdr) {
			if (!in_array($data_hdr["i_sys"] . '_' . $data_hdr["per_id"], $arr_c_per)) {
				// ============== //
				$addField	= null;
				$addValue	= null;
				unset($data);
				unset($arrValue);
				// ============== //

				/******************************* HDR ************************************/
				$data["i_sys"]                            =	$data_hdr["i_sys"];
				$data["pr_id"]                            =	$data_hdr["pr_id"];
				$data["po_id"]                            =	$data_hdr["po_id"];
				$data["per_id"]                           =	$data_hdr["per_id"];
				$data["c_title"]                          =	$data_hdr["c_title"];
				$data["c_detail"]                         =	$data_hdr["c_detail"];
				$data["dc_cost_id"]                       =	$data_hdr["dc_cost_id"];
				$data["dc_user_send_id"]                  =	$data_hdr["dc_user_send_id"];
				$data["dc_creditor_id"]                   =	$data_hdr["dc_creditor_id"];
				$data["c_code_per"]                       =	$data_hdr["c_code_per"];
				$data["c_booking"]                        =	$data_hdr["c_booking"];
				$data["d_chk_last_date"]                  =	$data_hdr["d_chk_last_date"];
				$data["i_purchase"]                  	  =	$data_hdr["i_purchase"];
				$data["i_working_type"]                   =	$data_hdr["i_working_type"];
				// $data["f_per_inv"]                        =	$data_hdr["f_per_inv"];
				// $data["f_per_vat_rate"]                   =	$data_hdr["f_per_vat_rate"];
				// $data["f_per_vat"]                        =	$data_hdr["f_per_vat"];
				$data["f_per_inv_vat"]                    =	$data_hdr["f_per_inv_vat"];
				// $data["f_per_tax_personal_rate"]          =	$data_hdr["f_per_tax_personal_rate"];
				// $data["f_per_tax_personal"]               =	$data_hdr["f_per_tax_personal"];
				$data["f_per_fine"]                       =	$data_hdr["f_per_fine"];
				$data["f_per_warranty"]                   =	$data_hdr["f_per_warranty"];
				$data["f_per_other"]                      =	$data_hdr["f_per_other"];
				// $data["f_per_total"]                      =	$data_hdr["f_per_total"];
				$data["i_sub_status"]                     =	'0.10';
				$data["i_enable"]                      	  =	1;
				$data["i_delete"]                      	  =	2;
				$data["dc_user_update_id"]                = $_SESSION["user_id"];
				$data["dc_user_update_cost_id"]           = $_SESSION["dc_cost_id"];
				$data["d_update"]                         = date("Y-m-d H:i:s");
				$data["dc_user_create_id"]                = $_SESSION["user_id"];
				$data["dc_user_create_cost_id"]           = $_SESSION["dc_cost_id"];
				$data["d_create"]                         = date("Y-m-d H:i:s");
				foreach ($data as $fld => $value) {
					$arrValue[] = ($value != "") ? $value : null;
					$addField .= ", {$fld}";
					$addValue .= ",
					? /*{$fld}*/";
				}
				$sql = "
						SET NOCOUNT ON
						INSERT INTO po_working_begin_hdr (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
						SELECT @@IDENTITY as id;";
				$para	= $db->QueryParam($sql, $arrValue);
				$ss_id	= $db->Fetch($para);
				$id_hdr		= $ss_id["id"];
				/******************************* HDR (END) ************************************/

				/******************************* DTL ************************************/
				foreach ($data_hdr["per_detail"] as $index_dtl => $data_dtl) {
					// ============== //
					$addField	= null;
					$addValue	= null;
					unset($data);
					unset($arrValue);
					// ============== //

					$data["po_working_begin_hdr_id"]              =	intval($id_hdr);
					$data["chk_id"]                               =	$data_dtl["chk_id"];
					$data["c_code_invoice"]                       =	$data_dtl["c_code_invoice"];
					$data["bg_reserve_money_id"]                  =	$data_dtl["bg_reserve_money_id"];
					$data["i_budget_year"]                        =	$data_dtl["i_budget_year"];
					$data["i_budget_year_overlap"]                =	$data_dtl["i_budget_year_overlap"];
					$data["d_chk_date"]                           =	$data_dtl["d_chk_date"];
					$data["dc_expense_budget_type_id"]            =	$data_dtl["dc_expense_budget_type_id"];
					$data["bg_expense_id"]                        =	$data_dtl["bg_expense_id"];
					$data["c_qty"]                                =	$data_dtl["c_qty"];
					// $data["f_inv"]                                =	$data_dtl["f_inv"];
					// $data["f_vat_rate"]                           =	$data_dtl["f_vat_rate"];
					// $data["f_vat"]                                =	$data_dtl["f_vat"];
					$data["f_inv_vat"]                            =	$data_dtl["f_inv_vat"];
					// $data["f_tax_personal_rate"]                  =	$data_dtl["f_tax_personal_rate"];
					// $data["f_tax_personal"]                       =	$data_dtl["f_tax_personal"];
					$data["f_fine"]                               =	$data_dtl["f_fine"];
					$data["f_warranty"]                           =	$data_dtl["f_warranty"];
					$data["f_other"]                              =	$data_dtl["f_other"];
					// $data["f_total"]                              =	$data_dtl["f_total"];
					$data["i_enable"]                             =	1;
					$data["i_delete"]                             =	2;

					foreach ($data as $fld => $value) {
						$arrValue[] = ($value != "") ? $value : null;
						$addField .= ", {$fld}";
						$addValue .= ",
						? /*{$fld}*/";
					}
					$sql = "
							SET NOCOUNT ON
							INSERT INTO po_working_begin_dtl (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
							SELECT @@IDENTITY as id;";
					$para	= $db->QueryParam($sql, $arrValue);
					$ss_id	= $db->Fetch($para);
					$id		= $ss_id["id"];
				}
				/******************************* DTL (END) ************************************/
			}
		}
	}
	###################
	$mode   = @$_REQUEST["mode"] ?? null;
	$filter = @$_REQUEST["filter"] ?? null;
	$value  = @$_REQUEST["value"] ?? null;
	$i_read = @$_REQUEST["i_read"] ?? null;
	###################
	$root   = "data";
	$data   = array();
	###################
	$limit  = @$_REQUEST["limit"] ?? null;
	$dir    = @$_REQUEST["dir"] ?? null;
	$sort   = @$_REQUEST["sort"] ?? null;
	$start  = @$_REQUEST["start"] ?? null;

	function get($a)
	{
		return $a ?? 0;
	}

	if (!get($start)) {
		$start = 0;
	}
	if (!get($limit)) {
		$limit = 20;
	} else {
		$limit = ($limit + $start);
	}
	if (!get($dir)) {
		$dir = "DESC";
	}
	if (!get($sort)) {
		$sort = " s.c_code";
	}

	#################################
	$keyin = "";
	$arrParam      = array();
	$arrCountParam = array();

	$sqlTempTable = "
			SELECT 
				ROW_NUMBER() OVER (ORDER BY d_chk_last_date DESC) AS row
				,po_working_begin_hdr_id
			FROM po_working_begin_hdr a 
			WHERE i_enable = 1 
				AND i_delete = 2
				AND i_sub_status = '0.10'";

	$sqlMain = "
			SET NOCOUNT ON

			SELECT 
				po_working_begin_hdr_id
				,MAX(c_code_invoice) AS c_code_invoice 
				,MAX(bg_reserve_money_id) AS bg_reserve_money_id 
				,MAX(i_budget_year) AS i_budget_year 
				,MAX(i_budget_year_overlap) AS i_budget_year_overlap 
				,MAX(d_chk_date) AS d_chk_date 
				,MAX(dc_expense_budget_type_id) AS dc_expense_budget_type_id 
				,MAX(bg_expense_id) AS bg_expense_id 
				,MAX(c_qty) AS c_qty 
				,SUM(ISNULL(f_inv_vat,0)) AS f_inv_vat
				,SUM(ISNULL(f_fine,0)) AS f_fine
				,SUM(ISNULL(f_warranty,0)) AS f_warranty
				,SUM(ISNULL(f_other,0)) AS f_other
			INTO #tem_dtl
			FROM po_working_begin_dtl a
			WHERE i_enable = 1 AND i_delete = 2
			GROUP BY po_working_begin_hdr_id

			SELECT 
				a.row
				,b.po_working_begin_hdr_id
				,i_sys
				,pr_id
				,po_id
				,per_id
				,c_title
				,c_detail
				,dc_cost_id
				,dc_creditor_id
				,c_code_per
				,c_booking
				,c_code_ref
				,CONVERT(VARCHAR(10),b.d_chk_last_date,120) AS d_chk_last_date
				,CONVERT(VARCHAR(10),b.d_doc_date,120) AS d_doc_date
				,f_per_inv
				,f_per_vat_rate
				,f_per_vat
				,f_per_inv_vat
				,f_per_tax_personal_rate
				,f_per_tax_personal
				,f_per_fine
				,f_per_warranty
				,f_per_other
				,f_per_pay
				,i_enable
				,i_delete
				,dc_user_send_id
				,(select top 1 c_full_name from " . DB_CENTER . "dc_user aa where aa.dc_user_id = dc_user_send_id) as dc_user_send_name
				,(select top 1 po_emp_id from po_emp aa where i_enable = 1 and i_delete = 2 and aa.c_name = (select top 1 c_full_name from " . DB_CENTER . "dc_user aa where aa.dc_user_id = dc_user_send_id)) as po_emp_id
				,dc_user_create_id
				,dc_user_create_cost_id
				,d_create
				,dc_user_update_id
				,dc_user_update_cost_id
				,d_update
				,c_code_invoice
				,bg_reserve_money_id
				,i_budget_year
				,i_budget_year_overlap
				,CONVERT(VARCHAR(10),d_chk_date,120) AS d_chk_date
				,dc_expense_budget_type_id
				,bg_expense_id
				,c_qty
				,f_inv_vat
				,f_fine
				,f_warranty
				,f_other
				,(SELECT TOP 1 c_name FROM " . DB_CENTER . "dc_creditor aa WHERE aa.dc_creditor_id = b.dc_creditor_id) AS dc_creditor_name
				,(SELECT TOP 1 c_full_name FROM " . DB_CENTER . "dc_user aa WHERE aa.dc_user_id = b.dc_user_send_id) AS dc_user_send_name
			FROM ({$sqlTempTable}) a
			INNER JOIN po_working_begin_hdr b ON a.po_working_begin_hdr_id = b.po_working_begin_hdr_id
			INNER JOIN #tem_dtl c ON a.po_working_begin_hdr_id = c.po_working_begin_hdr_id
			WHERE a.row > ? and a.row <= ?
			DROP TABLE #tem_dtl";

	$arrParam	= array();
	$arrParam[]	= $start;
	$arrParam[]	= $limit;
	$stmt = $db->QueryParam($sqlMain, $arrParam);


	while ($row = $db->Fetch($stmt)) {
		$temp = array(
			"no"							=>  $row["row"],
			"id"							=>	$row["po_working_begin_hdr_id"],
			"i_sys"							=>	$row["i_sys"],
			"pr_id"							=>	$row["pr_id"],
			"po_id"							=>	$row["po_id"],
			"per_id"						=>	$row["per_id"],
			"c_title"						=>	$row["c_title"],
			"c_detail"						=>	$row["c_detail"],
			"dc_cost_id"					=>	$row["dc_cost_id"],
			"dc_creditor_id"				=>	$row["dc_creditor_id"],
			"dc_creditor_transfer_id"		=>	$row["dc_creditor_id"],
			// "dc_creditor_name"				=>	$row["dc_creditor_name"],
			"c_code_per"					=>	$row["c_code_per"],
			"c_booking"						=>	$row["c_booking"],
			"d_chk_last_date"				=>	$row["d_chk_last_date"],
			"d_audit_date"					=> ($row["d_chk_last_date"] != "") ? $date->extDateBuddha($row["d_chk_last_date"]) : "",
			"d_doc_date"					=> ($row["d_doc_date"] != "") ? $date->extDateBuddha($row["d_doc_date"]) :  $date->extDateBuddha(date("Y-m-d")),
			"f_per_inv"						=>	$row["f_per_inv"],
			"f_per_vat_rate"				=>	$row["f_per_vat_rate"],
			"f_per_vat"						=>	$row["f_per_vat"],
			"f_per_inv_vat"					=>	$row["f_per_inv_vat"],
			"f_total"						=>	$row["f_per_inv_vat"],
			"f_per_tax_personal_rate"		=>	$row["f_per_tax_personal_rate"],
			"f_per_tax_personal"			=>	$row["f_per_tax_personal"],
			"f_per_fine"					=>	$row["f_per_fine"],
			"f_per_warranty"				=>	$row["f_per_warranty"],
			"f_per_other"					=>	$row["f_per_other"],
			"f_per_pay"						=>	$row["f_per_pay"],
			"i_enable"						=>	$row["i_enable"],
			"i_delete"						=>	$row["i_delete"],
			"dc_user_send_id"				=>	$row["dc_user_send_id"],
			"po_emp_id"						=>	$row["po_emp_id"] > 0 ? $row["po_emp_id"] : $row["dc_user_send_name"],
			"dc_user_create_id"				=>	$row["dc_user_create_id"],
			"dc_user_create_cost_id"		=>	$row["dc_user_create_cost_id"],
			"d_create"						=>	$row["d_create"],
			"dc_user_update_id"				=>	$row["dc_user_update_id"],
			"dc_user_update_cost_id"		=>	$row["dc_user_update_cost_id"],
			"d_update"						=>	$row["d_update"],
			"c_code_invoice"				=>	$row["c_code_invoice"],
			"bg_reserve_money_id"			=>	$row["bg_reserve_money_id"],
			"i_budget_year"					=>	$row["i_budget_year"],
			"i_budget_year_overlap"			=>	$row["i_budget_year_overlap"],
			"d_chk_date"					=>	$row["d_chk_date"],
			"dc_expense_budget_type_id"		=>	$row["dc_expense_budget_type_id"],
			"bg_expense_id"					=>	$row["bg_expense_id"],
			"c_qty"							=>	$row["c_qty"],
			"f_inv_vat"						=>	$row["f_per_inv_vat"],
			"f_fine"						=>	$row["f_fine"],
			"f_warranty"					=>	$row["f_warranty"],
			"f_other"						=>	$row["f_other"],

		);
		${$root}[] = $temp;
	}
	$sqlCount   = "select count(*) as totalCount from ({$sqlTempTable}) a";
	$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
	echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
} else if ($_REQUEST["type"] == "select_data_ss_77") {
	###################
	$mode   = @$_REQUEST["mode"] ?? null;
	$filter = @$_REQUEST["filter"] ?? null;
	$value  = @$_REQUEST["value"] ?? null;
	$i_read = @$_REQUEST["i_read"] ?? null;
	###################
	$root   = "data";
	$data   = array();
	###################
	$limit  = @$_REQUEST["limit"] ?? null;
	$dir    = @$_REQUEST["dir"] ?? null;
	$sort   = @$_REQUEST["sort"] ?? null;
	$start  = @$_REQUEST["start"] ?? null;

	function get($a)
	{
		return $a ?? 0;
	}

	if (!get($start)) {
		$start = 0;
	}
	if (!get($limit)) {
		$limit = 20;
	} else {
		$limit = ($limit + $start);
	}
	if (!get($dir)) {
		$dir = "DESC";
	}
	if (!get($sort)) {
		$sort = " s.c_code";
	}

	#################################
	$keyin = "";
	$arrParam      = array();
	$arrCountParam = array();
	$BudgetYear = (date('m') > 9) ? date('Y') + 1 : date('Y');
	$join = "";

	if ($mode == "SEARCH") {
		if ($_REQUEST["filter"] == "c_code_per") {
			$con .= "\n AND isnull((select c_contract_code from " . DB_NMU_ERP . "sp_tor_hdr_period  where sp_tor_hdr_period_id = a.sp_tor_hdr_period_id),c.c_code) LIKE '%" . $_REQUEST["value"] . "%' ";
		} else if ($_REQUEST["filter"] == "c_title") {
			$con .= "\n AND b.c_name LIKE '%" . $_REQUEST["value"] . "%' ";
		} else if ($_REQUEST["filter"] == "c_code_debt") {
			$con .= "\n AND  case when c.i_type_bg in(5) then null else   a.c_code end   LIKE '%" . $_REQUEST["value"] . "%' ";
		} else if ($_REQUEST["filter"] == "c_cost_name") {
			$join 	.= "\n INNER JOIN " . DB_CENTER . " dc_cost cst on cst.dc_cost_id = c.dc_cost_id";
			$con .= "\n AND cst.c_name LIKE '%" . $_REQUEST["value"] . "%' ";
		} else if ($_REQUEST["filter"] == "c_creditor_name") {
			$join 	.= "\n INNER JOIN " . DB_NMU . " dc_creditor dc on dc.dc_creditor_id = a.dc_creditor_id";
			$con	.= "\n AND dc.c_name LIKE '%" . $_REQUEST["value"] . "%' ";
		}
	}


	if (@$_REQUEST["dc_cost_id"]) {
		if (@$_REQUEST["cost_acc_view"]) {
			$con .= " AND (SELECT aa.dc_cost_acc_id FROM " . DB_CENTER . " dc_cost aa WHERE aa.dc_cost_id = c.dc_cost_id ) = (SELECT aa.dc_cost_acc_id FROM " . DB_CENTER . " dc_cost aa WHERE aa.dc_cost_id = 77 )";
		} else {
			$con .= "\n AND c.dc_cost_id = " . $_REQUEST["dc_cost_id"];
		}
	}
	if (in_array(@$_REQUEST["i_working_type"], ["1", "2"])) {
		$con .= "\n AND case when c.i_type_bg = 5 then 1 else 2 end = " . $_REQUEST["i_working_type"];
	}

	if (@$_REQUEST["preview"] == 1) {
		$con .= "\n AND a.i_status_checking = 1";
		$con .= "\n AND a.c_code is not null";
		// $con .= "\n AND a.i_is_upload = 1";
		if (@$_REQUEST["working_status"] == "1") {
			$con .= "\n AND isnull(pwh.po_working_hdr_id,0) = 0 ";
			$con .= "\n AND isnull(a.i_status_billing,0) = 0";
		} else if (@$_REQUEST["working_status"] == "2") {
			$con .= "\n AND isnull(pwh.po_working_hdr_id,0) = 0 ";
			$con .= "\n AND isnull(a.i_status_billing,0) != 0";
		} else if (@$_REQUEST["working_status"] == "3") {
			$con .= "\n AND isnull(pwh.po_working_hdr_id,0) > 0 ";
		} else if (@$_REQUEST["working_status"] == "99") {
			$con .= "";
		} else {
			$con .= "\n AND isnull(pwh.po_working_hdr_id,0) = 0 ";
		}
	} else {
		$con .= "\n AND a.i_status_billing = 4";
		$con .= "\n AND isnull(pwh.po_working_hdr_id,0) = 0 ";
	}

	$con_edit_id = @$_REQUEST["edit_id"] > 0 ? " AND pwh.po_working_hdr_id != " . $_REQUEST["edit_id"] : "";

	/** COPY TO "/po/pdf/api/PDF_List_PoWorking.php" TYPE select_data_ss_77 **/
	$sqlTempTable = "
		select 
			ROW_NUMBER() OVER (ORDER BY sp_check_period_hdr_id DESC) AS row
			,sp_check_period_hdr_id
		from " . DB_NMU_ERP . "sp_check_period_hdr a
		INNER JOIN " . DB_NMU_ERP . "sp_tor_contract b ON b.sp_tor_contract_id = a.sp_tor_contract_id
		INNER JOIN " . DB_NMU_ERP . "sp_tor c ON c.tor_id = b.sp_tor_id
		LEFT JOIN (
			SELECT aa.po_working_hdr_id, bb.chk_id FROM po_working_hdr aa 
            INNER JOIN po_working_begin_hdr bb ON aa.po_working_hdr_id = bb.po_working_hdr_id 
            WHERE aa.i_enable = 1
        ) pwh on pwh.chk_id = a.sp_check_period_hdr_id " . $con_edit_id .  "
		--LEFT JOIN po_working_hdr pwh on pwh.po_working_hdr_id = a.po_working_hdr_id and i_enable = 1 " . $con_edit_id .  "
		{$join}
		WHERE NOT EXISTS (SELECT sp_check_period_hdr_id FROM " . DB_NMU_ERP . "sp_withdraw WHERE sp_check_period_hdr_id = a.sp_check_period_hdr_id and i_enable = 1)
		AND CASE WHEN 
			ISNULL((SELECT i_product_type FROM NMU_ERP.dbo.sp_check_period_dtl WHERE sp_check_period_hdr_id = a.sp_check_period_hdr_id), 0) = 2 AND a.i_is_register = 1
			THEN 1 
			WHEN 
			ISNULL((SELECT i_product_type FROM NMU_ERP.dbo.sp_check_period_dtl WHERE sp_check_period_hdr_id = a.sp_check_period_hdr_id), 0) <> 2  
		 	THEN 1
			else 0 end  = 1 
		{$con}
	";

	$sqlMain = "
		select
			temp.row                   
			,1 as i_sys
			,c.tor_id as pr_id 
			,b.sp_tor_contract_id as po_id 
			,a.sp_tor_hdr_period_id as per_id 
			,a.sp_check_period_hdr_id as chk_id
			,a.dc_creditor_id
			,(SELECT TOP 1 aa.c_name FROM " . DB_NMU . " dc_creditor aa WHERE aa.dc_creditor_id = a.dc_creditor_id) AS c_creditor_name
			,isnull(b.c_name,c.c_name) as c_title 
			, isnull((select top 1 c_name from " . DB_NMU_ERP . "sp_check_period_dtl where sp_check_period_hdr_id = a.sp_check_period_hdr_id),c.c_name) as c_comment 
			, c.dc_cost_id as dc_cost_pr_id 
			, (SELECT TOP 1 aa.c_name FROM " . DB_CENTER . " dc_cost aa WHERE aa.dc_cost_id = c.dc_cost_id) c_cost_name
			, case when c.i_type_bg in (6,7) then  c.dc_cost2_id   
				else c.dc_cost_id end as dc_cost_chk_id
			, b.c_code + '/' + (select CONVERT(varchar(2),i_period) from " . DB_NMU_ERP . "sp_tor_hdr_period where sp_tor_hdr_period_id  =  a.sp_tor_hdr_period_id )   as c_code_per
			, isnull(a.c_overlap,b.c_overlap) as c_booking
			, CONVERT(varchar(10),a.d_checking_date,120)  as d_chk_last_date
			, c.i_purchase  
			, case when c.i_type_bg = 5 then  1 
			else 2 end as i_working_type
			, isnull((select f_net_total_price from " . DB_NMU_ERP . "sp_check_period_dtl  where sp_check_period_hdr_id = a.sp_check_period_hdr_id),c.f_total_amt) as f_per_inv_vat
			, a.f_rate_vat as f_per_vat_rate
			, a.f_vat_amt as f_per_vat
			, a.f_per_other
			, a.f_per_warranty 
			, isnull(a.c_billing_code,(select top 1 c_doc_ref from " . DB_NMU_ERP . "sp_check_billing_items where sp_check_period_hdr_id  = a.sp_check_period_hdr_id  )) as c_code_invoice
			, a.bg_checking_money_id as  bg_reserve_money_id
			, isnull(a.i_yyyy,0) as i_budget_year
			, isnull(a.i_yyyy_overlap,0) as i_budget_year_overlap
			, CONVERT(date,a.d_checking_date)  as d_chk_date
			, isnull((select dc_bg_budget_type_id from " . DB_NMU_ERP . "sp_check_period_dtl where sp_check_period_hdr_id = a.sp_check_period_hdr_id),c.dc_expense_budget_type_id) as dc_expense_budget_type_id
			, (select po_expense_id from " . DB_NMU_ERP . "sp_check_period_dtl where sp_check_period_hdr_id = a.sp_check_period_hdr_id) as bg_expense_id
			,(select top 1 aaa.c_code + ' : ' + aaa.c_name from bg_expense aaa where aaa.bg_expense_id = isnull((select po_expense_id from " . DB_NMU_ERP . "sp_check_period_dtl where sp_check_period_hdr_id = a.sp_check_period_hdr_id),c.po_expense_id)) as bg_expense_name 
			,  '1 รายการ' as c_qty
			, a.f_total_add_vat_amt as f_per_inv
			, f_fine_amt as f_per_fine
			--, a.gl_tran_hdr_id
			--, a.c_code_debt
			, null as gl_tran_hdr_id
			,  case when c.i_type_bg in(5) then null  
			else  a.c_code end  as c_code_debt
			, a.f_warranty
			, a.i_rate
			, a.f_tax_personal
			, a.i_doc_duo
			, a.dc_bank_acc_creditor_id
			, a.i_tax_personal
			, a.dc_creditor_transfer_id
			, isnull(a.i_reserve_pay,0) as i_reserve_pay
			,d.dc_acc_id1
			,d.f_dr1
			,d.dc_acc_id2
			,d.f_dr2
			,d.dc_acc_id3
			,d.f_dr3
			,d.dc_acc_id4
			,d.f_dr4
			,d.dc_acc_id5
			,d.f_dr5
			,d.dc_acc_id6
			,d.f_dr6
			,d.dc_acc_id7
			,d.f_dr7
			,d.dc_acc_id8
			,d.f_dr8
			,d.dc_acc_id9
			,d.f_dr9
			,d.dc_acc_id10
			,d.f_dr10
		FROM ({$sqlTempTable}) temp
		INNER JOIN " . DB_NMU_ERP . "sp_check_period_hdr a ON temp.sp_check_period_hdr_id = a.sp_check_period_hdr_id
		inner join " . DB_NMU_ERP . "sp_tor_contract b on b.sp_tor_contract_id = a.sp_tor_contract_id
		LEFT join "  .DB_CENTER . "vw_sp_po_asset_acc d ON temp.sp_check_period_hdr_id =  d.chk_id  and d.i_sys = 1
		--inner join " . DB_NMU_ERP . "sp_gl_monthly_hdr d ON d.sp_tor_hdr_period_id = a.sp_tor_hdr_period_id and d.i_enabled = 1 
		--inner join " . DB_NMU_ERP . "sp_gl_monthly_dtl dd ON d.sp_gl_monthly_hdr_id = dd.sp_gl_monthly_hdr_id and  dd.f_dr  > 0
		inner join " . DB_NMU_ERP . "sp_tor c on c.tor_id = b.sp_tor_id
		where temp.row > ? and temp.row <= ?
		order by temp.row
	";
	/** COPY TO "/po/pdf/api/PDF_List_PoWorking.php" TYPE select_data_ss_77 (END)**/

	$arrParam	= array();
	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	if (@$_REQUEST["show_sql"]) {
		/******echo sql******/
		$sql = str_replace('?', '#-#', $sqlMain);
		foreach ($arrParam as $fld => $value) {
			$sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
		}
		echo $sql;
		exit;
		/********************/
	}
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	while ($row = $db->Fetch($stmt)) {
		$d_debt_date_arr = explode("-", $row["d_chk_last_date"]);
		$temp = array(
			"no"							=>  $row["row"],
			"i_sys"							=>	$row["i_sys"],
			"i_reserve_pay"					=>	$row["i_reserve_pay"],
			"pr_id"							=>	$row["pr_id"],
			"po_id"							=>	$row["po_id"],
			"per_id"						=>	$row["per_id"],
			"chk_id"						=>	$row["chk_id"],
			"c_heading"						=>	$row["c_title"],
			"c_title"						=>	"",
			"c_comment"						=>	$row["c_comment"],
			"dc_cost_acc_id"				=>	77,
			"dc_cost_id"					=>	$row["dc_cost_chk_id"],
			"dc_creditor_id"				=>	$row["dc_creditor_id"],
			"dc_bank_acc_creditor_id"		=>	$row["dc_bank_acc_creditor_id"],
			"dc_creditor_transfer_id"		=>	$row["dc_creditor_transfer_id"],
			"c_creditor_name"				=>	$row["c_creditor_name"],
			"c_cost_name"					=>	$row["c_cost_name"],
			"c_code_per"					=>	$row["c_code_per"],
			"c_booking"						=>	$row["c_booking"],
			"d_chk_last_date"				=>	$row["d_chk_last_date"],
			"d_audit_date"					=> ($row["d_chk_last_date"] != "") ? $date->extDateBuddha($row["d_chk_last_date"]) : "",
			"d_doc_date"					=> (@$row["d_doc_date"] != "") ? $date->extDateBuddha($row["d_doc_date"]) :  $date->extDateBuddha(date("Y-m-d")),
			"f_per_inv"						=>	$row["f_per_inv"],
			"f_inv"							=>	$row["f_per_inv"],
			/***/
			"f_per_vat_rate"				=>	intval($row["f_per_vat_rate"]),
			"f_vat_rate"					=>	intval($row["f_per_vat_rate"]),
			"f_vat"							=>	$row["f_per_vat"],
			"f_per_vat"						=>	$row["f_per_vat"],
			"f_per_inv_vat"					=>	$row["f_per_inv_vat"],
			"f_total"						=>	$row["f_per_inv_vat"],
			"f_per_fine"					=>	$row["f_per_fine"] > 1 ? $row["f_per_fine"] : null,
			/***/
			"f_per_other"					=>	$row["f_per_other"],
			"f_per_pay"						=>	strval($row["f_per_inv_vat"] - $row["f_tax_personal"] - $row["f_per_fine"] - $row["f_warranty"] - $row["f_per_other"]),
			"f_pay"							=>	strval($row["f_per_inv_vat"] - $row["f_tax_personal"] - $row["f_per_fine"] - $row["f_warranty"] - $row["f_per_other"]),

			"i_enable"						=>	1,
			"i_delete"						=>	2,
			"dc_user_send_id"				=>	0,
			// "po_emp_id"						=>	$row["po_emp_id"] > 0 ? $row["po_emp_id"] : $row["dc_user_send_name"],
			"po_emp_id"						=>	$_SESSION["user_name"],
			"c_code_invoice"				=>	$row["c_code_invoice"],
			"bg_reserve_money_id"			=>	$row["bg_reserve_money_id"],
			"i_budget_year"					=>	$BudgetYear,
			"i_budget_year_overlap"			=>	$row["i_budget_year_overlap"],
			"d_chk_date"					=>	$row["d_chk_date"],
			"dc_expense_budget_type_id"		=>	@$_REQUEST["i_working_type"] == "6" ? 17 : $row["dc_expense_budget_type_id"],
			"bg_expense_id"					=>	$row["bg_expense_id"],
			"bg_expense_name"				=>	$row["bg_expense_name"],
			"c_qty"							=>	$row["c_qty"],
			"f_inv_vat"						=>	$row["f_per_inv_vat"],
			"f_fine"						=> ($row["f_per_fine"] > 1) ? $row["f_per_fine"] : null,
			/***/

			"i_doc_duo"						=> $row["i_doc_duo"], //ใบเบิกแบบคู่
			"f_tax_personal"    			=> $row["f_tax_personal"] > 0 ? $row["f_tax_personal"] : null, //ภาษีหัก ณ ที่จ่าย
			"f_per_tax_personal"   			=> $row["f_tax_personal"] > 0 ? $row["f_tax_personal"] : null, //ภาษีหัก ณ ที่จ่าย  

			"f_tax_personal_rate"   		=> $row["i_tax_personal"] > 0 ? $row["i_tax_personal"] : null, //ภาษีหัก ณ ที่จ่าย (%)   1 null 
			"f_per_tax_personal_rate"  		=> $row["i_tax_personal"] > 0 ? $row["i_tax_personal"] : null, //ภาษีหัก ณ ที่จ่าย (%) 1 null 

			"f_warranty"     				=> $row["f_warranty"] > 0 ? $row["f_warranty"] : null, // ประกันผลงาน
			"f_per_warranty"    			=> $row["f_warranty"] > 0 ? $row["f_warranty"] : null, // ประกันผลงาน
			"dc_acc_id1"					=> $row["dc_acc_id1"], // รายการค่าใช้จ่ายบัญชี
			"dc_acc_id2"					=> $row["dc_acc_id2"], // รายการค่าใช้จ่ายบัญชี
			"dc_acc_id3"					=> $row["dc_acc_id3"], // รายการค่าใช้จ่ายบัญชี
			"dc_acc_id4"					=> $row["dc_acc_id4"], // รายการค่าใช้จ่ายบัญชี
			"dc_acc_id5"					=> $row["dc_acc_id5"], // รายการค่าใช้จ่ายบัญชี
			"dc_acc_id6"					=> $row["dc_acc_id6"], // รายการค่าใช้จ่ายบัญชี
			"dc_acc_id7"					=> $row["dc_acc_id7"], // รายการค่าใช้จ่ายบัญชี
			"dc_acc_id8"					=> $row["dc_acc_id8"], // รายการค่าใช้จ่ายบัญชี
			"dc_acc_id9"					=> $row["dc_acc_id9"], // รายการค่าใช้จ่ายบัญชี
			"dc_acc_id10"					=> $row["dc_acc_id10"], // รายการค่าใช้จ่ายบัญชี
			// "c_acc_month1"					=> $row["month_receive"], // เดือนค่าใช้จ่ายบัญชี
			"f_acc_inv1"					=> strval($row["f_per_vat"] > 0  ?   removeVAT($row["f_dr1"]) : ($row["f_dr1"])), // จำนวนเงินก่อน Vat
			"f_acc_inv2"					=> strval($row["f_per_vat"] > 0  ?   removeVAT($row["f_dr2"]) : ($row["f_dr2"])), // จำนวนเงินก่อน Vat
			"f_acc_inv3"					=> strval($row["f_per_vat"] > 0  ?   removeVAT($row["f_dr3"]) : ($row["f_dr3"])), // จำนวนเงินก่อน Vat
			"f_acc_inv4"					=> strval($row["f_per_vat"] > 0  ?   removeVAT($row["f_dr4"]) : ($row["f_dr4"])), // จำนวนเงินก่อน Vat
			"f_acc_inv5"					=> strval($row["f_per_vat"] > 0  ?   removeVAT($row["f_dr5"]) : ($row["f_dr5"])), // จำนวนเงินก่อน Vat
			"f_acc_inv6"					=> strval($row["f_per_vat"] > 0  ?   removeVAT($row["f_dr6"]) : ($row["f_dr6"])), // จำนวนเงินก่อน Vat
			"f_acc_inv7"					=> strval($row["f_per_vat"] > 0  ?   removeVAT($row["f_dr7"]) : ($row["f_dr7"])), // จำนวนเงินก่อน Vat
			"f_acc_inv8"					=> strval($row["f_per_vat"] > 0  ?   removeVAT($row["f_dr8"]) : ($row["f_dr8"])), // จำนวนเงินก่อน Vat
			"f_acc_inv9"					=> strval($row["f_per_vat"] > 0  ?   removeVAT($row["f_dr9"]) : ($row["f_dr9"])), // จำนวนเงินก่อน Vat
			"f_acc_inv10"					=> strval($row["f_per_vat"] > 0  ?   removeVAT($row["f_dr10"]) : ($row["f_dr10"])), // จำนวนเงินก่อน Vat
			// "f_acc_inv1"					=> strval($row["f_total_amt"], // จำนวนเงินก่อน Vat
			"f_acc_vat1"					=> $row["f_per_vat"] > 0  ?  strval($row["f_dr1"] - removeVAT($row["f_dr1"])) : null, // จำนวนเงิน Vat
			"f_acc_vat2"					=> $row["f_per_vat"] > 0  ?  strval($row["f_dr2"] - removeVAT($row["f_dr2"]))  : null, // จำนวนเงิน Vat
			"f_acc_vat3"					=> $row["f_per_vat"] > 0  ?  strval($row["f_dr3"] - removeVAT($row["f_dr3"]))  : null, // จำนวนเงิน Vat
			"f_acc_vat4"					=> $row["f_per_vat"] > 0  ?  strval($row["f_dr4"] - removeVAT($row["f_dr4"]))  : null, // จำนวนเงิน Vat
			"f_acc_vat5"					=> $row["f_per_vat"] > 0  ?  strval($row["f_dr5"] - removeVAT($row["f_dr5"])) : null, // จำนวนเงิน Vat
			"f_acc_vat6"					=> $row["f_per_vat"] > 0  ?  strval($row["f_dr6"] - removeVAT($row["f_dr6"]))  : null, // จำนวนเงิน Vat
			"f_acc_vat7"					=> $row["f_per_vat"] > 0  ?  strval($row["f_dr7"] - removeVAT($row["f_dr7"]))  : null, // จำนวนเงิน Vat
			"f_acc_vat8"					=> $row["f_per_vat"] > 0  ?  strval($row["f_dr8"] - removeVAT($row["f_dr8"]))  : null, // จำนวนเงิน Vat
			"f_acc_vat9"					=> $row["f_per_vat"] > 0  ?  strval($row["f_dr9"] - removeVAT($row["f_dr9"]))  : null, // จำนวนเงิน Vat
			"f_acc_vat10"					=> $row["f_per_vat"] > 0  ?  strval($row["f_dr10"] - removeVAT($row["f_dr10"]))  : null, // จำนวนเงิน Vat
			"f_acc_inv_vat1"				=> strval($row["f_dr1"]), //จำนวนเงินรวม Vat
			"f_acc_inv_vat2"				=> strval($row["f_dr2"]), //จำนวนเงินรวม Vat
			"f_acc_inv_vat3"				=> strval($row["f_dr3"]), //จำนวนเงินรวม Vat
			"f_acc_inv_vat4"				=> strval($row["f_dr4"]), //จำนวนเงินรวม Vat
			"f_acc_inv_vat5"				=> strval($row["f_dr5"]), //จำนวนเงินรวม Vat
			"f_acc_inv_vat6"				=> strval($row["f_dr6"]), //จำนวนเงินรวม Vat
			"f_acc_inv_vat7"				=> strval($row["f_dr7"]), //จำนวนเงินรวม Vat
			"f_acc_inv_vat8"				=> strval($row["f_dr8"]), //จำนวนเงินรวม Vat
			"f_acc_inv_vat9"				=> strval($row["f_dr9"]), //จำนวนเงินรวม Vat
			"f_acc_inv_vat10"				=> strval($row["f_dr10"]), //จำนวนเงินรวม Vat
			// removeVAT
			"f_other"						=>	$row["f_per_other"],
			"i_working_type"				=>	in_array(@$_REQUEST["i_working_type"], ["1", "2"]) ? $row["i_working_type"] : $_REQUEST["i_working_type"],

			"gl_tran_hdr_id"       			=> $row["gl_tran_hdr_id"],
			"c_code_debt"          			=> $row["c_code_debt"],
			"d_debt_date"     				=> ($row["d_chk_last_date"] != "") ? $date->extDateBuddha($row["d_chk_last_date"]) : "",
			"c_debt_month"      			=> $d_debt_date_arr[1],
			"c_debt_year"       			=> $d_debt_date_arr[0],

		);
		${$root}[] = $temp;
	}
	$sqlCount   = "select count(*) as totalCount from ({$sqlTempTable}) a";
	$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
	echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
} else if ($_REQUEST["type"] == "select_data_ss_99") {
	###################
	$mode   = @$_REQUEST["mode"] ?? null;
	$filter = @$_REQUEST["filter"] ?? null;
	$value  = @$_REQUEST["value"] ?? null;
	$i_read = @$_REQUEST["i_read"] ?? null;
	###################
	$root   = "data";
	$data   = array();
	###################
	$limit  = @$_REQUEST["limit"] ?? null;
	$dir    = @$_REQUEST["dir"] ?? null;
	$sort   = @$_REQUEST["sort"] ?? null;
	$start  = @$_REQUEST["start"] ?? null;

	function get($a)
	{
		return $a ?? 0;
	}

	if (!get($start)) {
		$start = 0;
	}
	if (!get($limit)) {
		$limit = 20;
	} else {
		$limit = ($limit + $start);
	}
	if (!get($dir)) {
		$dir = "DESC";
	}
	if (!get($sort)) {
		$sort = " s.c_code";
	}

	#################################
	$keyin = "";
	$arrParam      = array();
	$arrCountParam = array();
	$BudgetYear = (date('m') > 9) ? date('Y') + 1 : date('Y');

	$join = "";
	if ($mode == "SEARCH") {
		if ($_REQUEST["filter"] == "c_code_per") {
			$con .= "\n AND (select aa.c_contract_code from " . DB_EIS_PROCURE . "sp_tor_hdr_period aa where aa.sp_tor_hdr_period_id = a.sp_tor_hdr_period_id) LIKE '%" . $_REQUEST["value"] . "%' ";
		} else if ($_REQUEST["filter"] == "c_code_debt") {
			$con .= "\n AND a.c_code LIKE '%" . $_REQUEST["value"] . "%' ";
		} else if ($_REQUEST["filter"] == "c_cost_name") {
			$join 	.= "\n INNER JOIN " . DB_CENTER . " dc_cost cst on cst.dc_cost_id = c.dc_cost2_id";
			$con .= "\n AND cst.c_name LIKE '%" . $_REQUEST["value"] . "%' ";
		} else if ($_REQUEST["filter"] == "c_creditor_name") {
			$join 	.= "\n INNER JOIN " . DB_NMU . " dc_creditor dc on dc.dc_creditor_id = a.dc_creditor_id";
			$con	.= "\n AND dc.c_name LIKE '%" . $_REQUEST["value"] . "%' ";
		}
	}


	if (@$_REQUEST["dc_cost_id"]) {
		if (@$_REQUEST["cost_acc_view"]) {
			$con .= " AND (SELECT aa.dc_cost_acc_id FROM " . DB_CENTER . " dc_cost aa WHERE aa.dc_cost_id = c.dc_cost2_id ) = (SELECT aa.dc_cost_acc_id FROM " . DB_CENTER . " dc_cost aa WHERE aa.dc_cost_id = 77 )";
		} else {
			$con .= "\n AND c.dc_cost2_id = " . $_REQUEST["dc_cost_id"];
		}
	}
	if (in_array(@$_REQUEST["i_working_type"], ["1", "2"])) {
		$con .= "\n AND case when c.i_type_bg = 5 then 1 else 2 end = " . $_REQUEST["i_working_type"];
	}


	if (@$_REQUEST["preview"] == 1) {
		$con .= "\n AND a.i_status_checking = 1";
		$con .= "\n AND a.c_code is not null";
		// $con .= "\n AND a.i_is_upload = 1";
		if (@$_REQUEST["working_status"] == "1") {
			$con .= "\n AND isnull(pwh.po_working_hdr_id,0) = 0 ";
			$con .= "\n AND isnull(a.i_status_billing,0) = 0";
		} else if (@$_REQUEST["working_status"] == "2") {
			$con .= "\n AND isnull(pwh.po_working_hdr_id,0) = 0 ";
			$con .= "\n AND isnull(a.i_status_billing,0) != 0";
		} else if (@$_REQUEST["working_status"] == "3") {
			$con .= "\n AND isnull(pwh.po_working_hdr_id,0) > 0 ";
		} else if (@$_REQUEST["working_status"] == "99") {
			$con .= "";
		} else {
			$con .= "\n AND isnull(pwh.po_working_hdr_id,0) = 0 ";
		}
	} else {
		$con .= "\n AND a.i_status_billing = 4";
		$con .= "\n AND a.i_is_upload = 1";
		$con .= "\n AND isnull(pwh.po_working_hdr_id,0) = 0 ";
	}

	$con_edit_id = @$_REQUEST["edit_id"] > 0 ? " AND pwh.po_working_hdr_id != " . $_REQUEST["edit_id"] : "";

	/** COPY TO "/po/pdf/api/PDF_List_PoWorking.php" TYPE select_data_ss_99 **/
	$sqlTempTable = "
		select 
			ROW_NUMBER() OVER (ORDER BY sp_check_period_hdr_id DESC) AS row
			,sp_check_period_hdr_id
		from " . DB_EIS_PROCURE . "sp_check_period_hdr a
		INNER JOIN " . DB_EIS_PROCURE . "sp_tor_contract b ON b.sp_tor_contract_id = a.sp_tor_contract_id
		INNER JOIN " . DB_EIS_PROCURE . "sp_tor c ON c.tor_id = b.sp_tor_id
		LEFT JOIN (
			SELECT aa.po_working_hdr_id, bb.chk_id FROM po_working_hdr aa 
            INNER JOIN po_working_begin_hdr bb ON aa.po_working_hdr_id = bb.po_working_hdr_id 
            WHERE aa.i_enable = 1
        ) pwh on pwh.chk_id = a.sp_check_period_hdr_id " . $con_edit_id .  "
		--LEFT JOIN po_working_hdr pwh on pwh.po_working_hdr_id = a.po_working_hdr_id and i_enable = 1 " . $con_edit_id .  "
		{$join}
		WHERE NOT EXISTS (SELECT sp_check_period_hdr_id FROM " . DB_EIS_PROCURE . "sp_withdraw WHERE sp_check_period_hdr_id = a.sp_check_period_hdr_id and i_enable = 1)
				AND CASE WHEN 
			ISNULL((SELECT i_product_type FROM NMU_ERP.dbo.sp_check_period_dtl WHERE sp_check_period_hdr_id = a.sp_check_period_hdr_id), 0) = 2 AND a.i_is_register = 1
			THEN 1 
			WHEN 
			ISNULL((SELECT i_product_type FROM NMU_ERP.dbo.sp_check_period_dtl WHERE sp_check_period_hdr_id = a.sp_check_period_hdr_id), 0) <> 2  
		 	THEN 1
			else 0 end  = 1 	
		{$con}
	";

	$sqlMain = "
		select
			temp.row                   
			,3 as i_sys
			,c.tor_id as pr_id 
			,b.sp_tor_contract_id as po_id 
			,a.sp_tor_hdr_period_id as per_id 
			,a.sp_check_period_hdr_id as chk_id
			,a.po_working_hdr_id
			,a.dc_creditor_id
			,(SELECT TOP 1 aa.c_name FROM " . DB_NMU . " dc_creditor aa WHERE aa.dc_creditor_id = a.dc_creditor_id) AS c_creditor_name
			,b.c_name as c_title 
			, (select top 1 c_name from " . DB_EIS_PROCURE . "sp_check_period_dtl where sp_check_period_hdr_id = a.sp_check_period_hdr_id) as c_comment 
			, c.dc_cost2_id as dc_cost_pr_id 
			, (SELECT TOP 1 aa.c_name FROM " . DB_CENTER . " dc_cost aa WHERE aa.dc_cost_id = c.dc_cost2_id) c_cost_name
			, case when c.i_type_bg in (6,7) then  c.dc_cost2_id   
				else c.dc_cost2_id end as dc_cost_chk_id
			,(select dc_cost_acc_id from " . DB_CENTER . "dc_cost aa where aa.dc_cost_id = case when c.i_type_bg in (6,7) then c.dc_cost2_id else c.dc_cost2_id end) dc_cost_acc_id
			, b.c_code + '/' + (select CONVERT(varchar(2),i_period) from " . DB_EIS_PROCURE . "sp_tor_hdr_period where sp_tor_hdr_period_id  =  a.sp_tor_hdr_period_id )   as c_code_per
			, isnull(a.c_overlap,b.c_overlap) as c_booking
			, CONVERT(varchar(10),a.d_checking_date,120)  as d_chk_last_date
			, c.i_purchase  
			, case when c.i_type_bg = 5 then  1 
			else 2 end as i_working_type
			, (select f_net_total_price from " . DB_EIS_PROCURE . "sp_check_period_dtl  where sp_check_period_hdr_id = a.sp_check_period_hdr_id) as f_per_inv_vat
			, a.f_rate_vat as f_per_vat_rate
			, a.f_vat_amt as f_per_vat
			, a.f_per_other
			, a.f_per_warranty 
			, isnull((select c_doc_ref from " . DB_EIS_PROCURE . "sp_check_billing_items where sp_check_period_hdr_id  = a.sp_check_period_hdr_id  ),a.c_doc_ref) as c_code_invoice
			, a.bg_checking_money_id as  bg_reserve_money_id
			, isnull(a.i_yyyy,0) as i_budget_year
			, isnull(a.i_yyyy_overlap,0) as i_budget_year_overlap
			, CONVERT(date,a.d_checking_date)  as d_chk_date
			, (select dc_bg_budget_type_id from " . DB_EIS_PROCURE . "sp_check_period_dtl where sp_check_period_hdr_id = a.sp_check_period_hdr_id) as dc_expense_budget_type_id
			, (select po_expense_id from " . DB_EIS_PROCURE . "sp_check_period_dtl where sp_check_period_hdr_id = a.sp_check_period_hdr_id) as bg_expense_id
			,(select top 1 aaa.c_code + ' : ' + aaa.c_name from bg_expense aaa where aaa.bg_expense_id = isnull((select po_expense_id from " . DB_EIS_PROCURE . "sp_check_period_dtl where sp_check_period_hdr_id = a.sp_check_period_hdr_id),c.po_expense_id)) as bg_expense_name 
			,  '1 รายการ' as c_qty
			, a.f_total_add_vat_amt as f_per_inv
			, f_fine_amt as f_per_fine
			--, a.gl_tran_hdr_id
			--, a.c_code_debt
			, null as gl_tran_hdr_id
			, a.c_code as c_code_debt
			, a.f_warranty
			, a.i_rate
			, a.f_tax_personal
			, a.i_doc_duo
			, a.i_working_confirm
			, a.dc_bank_acc_creditor_id
			, a.i_tax_personal
			, isnull(a.i_reserve_pay,0) as i_reserve_pay
			, a.dc_creditor_transfer_id
			,d.dc_acc_id1
			,d.f_dr1
			,d.dc_acc_id2
			,d.f_dr2
			,d.dc_acc_id3
			,d.f_dr3
			,d.dc_acc_id4
			,d.f_dr4
			,d.dc_acc_id5
			,d.f_dr5
			,d.dc_acc_id6
			,d.f_dr6
			,d.dc_acc_id7
			,d.f_dr7
			,d.dc_acc_id8
			,d.f_dr8
			,d.dc_acc_id9
			,d.f_dr9
			,d.dc_acc_id10
			,d.f_dr10
		FROM ({$sqlTempTable}) temp
		INNER JOIN " . DB_EIS_PROCURE . "sp_check_period_hdr a ON temp.sp_check_period_hdr_id = a.sp_check_period_hdr_id
		inner join " . DB_EIS_PROCURE . "sp_tor_contract b on b.sp_tor_contract_id = a.sp_tor_contract_id
		LEFT join "  .DB_CENTER . "vw_sp_po_asset_acc d ON temp.sp_check_period_hdr_id =  d.chk_id  and d.i_sys = 3
		--inner join " . DB_EIS_PROCURE . "sp_gl_monthly_hdr d ON d.sp_tor_hdr_period_id = a.sp_tor_hdr_period_id and d.i_enabled = 1
		--inner join " . DB_EIS_PROCURE . "sp_gl_monthly_dtl dd ON d.sp_gl_monthly_hdr_id = dd.sp_gl_monthly_hdr_id and  dd.f_dr  > 0
		inner join " . DB_EIS_PROCURE . "sp_tor c on c.tor_id = b.sp_tor_id
		where temp.row > ? and temp.row <= ?
		order by temp.row
	";
	/** COPY TO "/po/pdf/api/PDF_List_PoWorking.php" TYPE select_data_ss_99 (END)**/

	$arrParam	= array();
	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	if (@$_REQUEST["show_sql"]) {
		/******echo sql******/
		$sql = str_replace('?', '#-#', $sqlMain);
		foreach ($arrParam as $fld => $value) {
			$sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
		}
		echo $sql;
		exit;
		/********************/
	}
	$stmt = $db->QueryParam($sqlMain, $arrParam);

	while ($row = $db->Fetch($stmt)) {
		$d_debt_date_arr = explode("-", $row["d_chk_last_date"]);
		$temp = array(
			"no"							=>  $row["row"],
			"i_sys"							=>	$row["i_sys"],
			"i_reserve_pay"					=>	$row["i_reserve_pay"],
			"pr_id"							=>	$row["pr_id"],
			"po_id"							=>	$row["po_id"],
			"per_id"						=>	$row["per_id"],
			"chk_id"						=>	$row["chk_id"],
			"po_working_hdr_id"				=>	$row["po_working_hdr_id"],
			"c_heading"						=>	$row["c_title"],
			"c_title"						=>	"",
			"c_comment"						=>	$row["c_comment"],
			"dc_cost_acc_id"				=>	$row["dc_cost_acc_id"],
			"dc_cost_id"					=>	$row["dc_cost_chk_id"],
			"dc_bank_acc_creditor_id"		=>	$row["dc_bank_acc_creditor_id"],
			"dc_creditor_transfer_id"		=>	$row["dc_creditor_transfer_id"],
			"dc_creditor_id"				=>	$row["dc_creditor_id"],

			// "dc_creditor_name"				=>	$row["dc_creditor_name"],
			"c_creditor_name"				=>	$row["c_creditor_name"],
			"c_cost_name"					=>	$row["c_cost_name"],
			"c_code_per"					=>	$row["c_code_per"],
			"c_booking"						=>	$row["c_booking"],
			"d_chk_last_date"				=>	$row["d_chk_last_date"],
			"d_audit_date"					=> ($row["d_chk_last_date"] != "") ? $date->extDateBuddha($row["d_chk_last_date"]) : "",
			"d_doc_date"					=> (@$row["d_doc_date"] != "") ? $date->extDateBuddha($row["d_doc_date"]) :  $date->extDateBuddha(date("Y-m-d")),
			"f_per_inv"						=>	$row["f_per_inv"],
			"f_inv"							=>	$row["f_per_inv"],
			// /***/ i_doc
			"f_per_vat_rate"				=>	intval($row["f_per_vat_rate"]),
			"f_vat_rate"					=>	intval($row["f_per_vat_rate"]),
			"f_vat"							=>	$row["f_per_vat"],
			"f_per_vat"						=>	$row["f_per_vat"],
			"f_per_inv_vat"					=>	$row["f_per_inv_vat"],
			"f_total"						=>	$row["f_per_inv_vat"],
			"f_per_fine"					=>	$row["f_per_fine"] > 1 ? $row["f_per_fine"] : null,
			/***/
			"f_per_other"					=>	$row["f_per_other"],
			"f_per_pay"						=>	strval($row["f_per_inv_vat"] - $row["f_tax_personal"] - $row["f_per_fine"] - $row["f_warranty"] - $row["f_per_other"]),
			"f_pay"							=>	strval($row["f_per_inv_vat"] - $row["f_tax_personal"] - $row["f_per_fine"] - $row["f_warranty"] - $row["f_per_other"]),

			"i_enable"						=>	1,
			"i_delete"						=>	2,
			"dc_user_send_id"				=>	0,
			// "po_emp_id"						=>	$row["po_emp_id"] > 0 ? $row["po_emp_id"] : $row["dc_user_send_name"],
			"po_emp_id"						=>	$_SESSION["user_name"],
			"c_code_invoice"				=>	$row["c_code_invoice"],
			"bg_reserve_money_id"			=>	$row["bg_reserve_money_id"],
			"i_budget_year"					=>	$BudgetYear,
			"i_budget_year_overlap"			=>	$row["i_budget_year_overlap"],
			"d_chk_date"					=>	$row["d_chk_date"],
			"dc_expense_budget_type_id"		=>	@$_REQUEST["i_working_type"] == "6" ? 17 : $row["dc_expense_budget_type_id"],
			"bg_expense_id"					=>	$row["bg_expense_id"],
			"bg_expense_name"				=>	$row["bg_expense_name"],
			"c_qty"							=>	$row["c_qty"],
			"f_inv_vat"						=>	$row["f_per_inv_vat"],
			"f_fine"						=> ($row["f_per_fine"] > 1) ? $row["f_per_fine"] : null,
			/***/

			"i_doc_duo"						=> $row["i_doc_duo"], //ใบเบิกแบบคู่
			"i_working_confirm"				=> $row["i_working_confirm"],
			"f_tax_personal"    			=> $row["f_tax_personal"] > 0 ? $row["f_tax_personal"] : null, //ภาษีหัก ณ ที่จ่าย
			"f_per_tax_personal"   			=> $row["f_tax_personal"] > 0 ? $row["f_tax_personal"] : null, //ภาษีหัก ณ ที่จ่าย  

			"f_tax_personal_rate"   		=> $row["i_tax_personal"] > 0 ? $row["i_tax_personal"] : null, //ภาษีหัก ณ ที่จ่าย (%)   1 null 
			"f_per_tax_personal_rate" 		=> $row["i_tax_personal"] > 0 ? $row["i_tax_personal"] : null, //ภาษีหัก ณ ที่จ่าย (%) 1 null 

			"f_warranty"     				=> $row["f_warranty"] > 0 ? $row["f_warranty"] : null, // ประกันผลงาน
			"f_per_warranty"    			=> $row["f_warranty"] > 0 ? $row["f_warranty"] : null, // ประกันผลงาน
			"dc_acc_id1"					=> $row["dc_acc_id1"], // รายการค่าใช้จ่ายบัญชี
			"dc_acc_id2"					=> $row["dc_acc_id2"], // รายการค่าใช้จ่ายบัญชี
			"dc_acc_id3"					=> $row["dc_acc_id3"], // รายการค่าใช้จ่ายบัญชี
			"dc_acc_id4"					=> $row["dc_acc_id4"], // รายการค่าใช้จ่ายบัญชี
			"dc_acc_id5"					=> $row["dc_acc_id5"], // รายการค่าใช้จ่ายบัญชี
			"dc_acc_id6"					=> $row["dc_acc_id6"], // รายการค่าใช้จ่ายบัญชี
			"dc_acc_id7"					=> $row["dc_acc_id7"], // รายการค่าใช้จ่ายบัญชี
			"dc_acc_id8"					=> $row["dc_acc_id8"], // รายการค่าใช้จ่ายบัญชี
			"dc_acc_id9"					=> $row["dc_acc_id9"], // รายการค่าใช้จ่ายบัญชี
			"dc_acc_id10"					=> $row["dc_acc_id10"], // รายการค่าใช้จ่ายบัญชี
			// "c_acc_month1"					=> $row["month_receive"], // เดือนค่าใช้จ่ายบัญชี
			"f_acc_inv1"					=> strval($row["f_per_vat"] > 0  ?   removeVAT($row["f_dr1"]) : ($row["f_dr1"])), // จำนวนเงินก่อน Vat
			"f_acc_inv2"					=> strval($row["f_per_vat"] > 0  ?   removeVAT($row["f_dr2"]) : ($row["f_dr2"])), // จำนวนเงินก่อน Vat
			"f_acc_inv3"					=> strval($row["f_per_vat"] > 0  ?   removeVAT($row["f_dr3"]) : ($row["f_dr3"])), // จำนวนเงินก่อน Vat
			"f_acc_inv4"					=> strval($row["f_per_vat"] > 0  ?   removeVAT($row["f_dr4"]) : ($row["f_dr4"])), // จำนวนเงินก่อน Vat
			"f_acc_inv5"					=> strval($row["f_per_vat"] > 0  ?   removeVAT($row["f_dr5"]) : ($row["f_dr5"])), // จำนวนเงินก่อน Vat
			"f_acc_inv6"					=> strval($row["f_per_vat"] > 0  ?   removeVAT($row["f_dr6"]) : ($row["f_dr6"])), // จำนวนเงินก่อน Vat
			"f_acc_inv7"					=> strval($row["f_per_vat"] > 0  ?   removeVAT($row["f_dr7"]) : ($row["f_dr7"])), // จำนวนเงินก่อน Vat
			"f_acc_inv8"					=> strval($row["f_per_vat"] > 0  ?   removeVAT($row["f_dr8"]) : ($row["f_dr8"])), // จำนวนเงินก่อน Vat
			"f_acc_inv9"					=> strval($row["f_per_vat"] > 0  ?   removeVAT($row["f_dr9"]) : ($row["f_dr9"])), // จำนวนเงินก่อน Vat
			"f_acc_inv10"					=> strval($row["f_per_vat"] > 0  ?   removeVAT($row["f_dr10"]) : ($row["f_dr10"])), // จำนวนเงินก่อน Vat
			// "f_acc_inv1"					=> strval($row["f_total_amt"], // จำนวนเงินก่อน Vat
			"f_acc_vat1"					=> $row["f_per_vat"] > 0  ?  strval($row["f_dr1"] - removeVAT($row["f_dr1"])) : null, // จำนวนเงิน Vat
			"f_acc_vat2"					=> $row["f_per_vat"] > 0  ?  strval($row["f_dr2"] - removeVAT($row["f_dr2"]))  : null, // จำนวนเงิน Vat
			"f_acc_vat3"					=> $row["f_per_vat"] > 0  ?  strval($row["f_dr3"] - removeVAT($row["f_dr3"]))  : null, // จำนวนเงิน Vat
			"f_acc_vat4"					=> $row["f_per_vat"] > 0  ?  strval($row["f_dr4"] - removeVAT($row["f_dr4"]))  : null, // จำนวนเงิน Vat
			"f_acc_vat5"					=> $row["f_per_vat"] > 0  ?  strval($row["f_dr5"] - removeVAT($row["f_dr5"])) : null, // จำนวนเงิน Vat
			"f_acc_vat6"					=> $row["f_per_vat"] > 0  ?  strval($row["f_dr6"] - removeVAT($row["f_dr6"]))  : null, // จำนวนเงิน Vat
			"f_acc_vat7"					=> $row["f_per_vat"] > 0  ?  strval($row["f_dr7"] - removeVAT($row["f_dr7"]))  : null, // จำนวนเงิน Vat
			"f_acc_vat8"					=> $row["f_per_vat"] > 0  ?  strval($row["f_dr8"] - removeVAT($row["f_dr8"]))  : null, // จำนวนเงิน Vat
			"f_acc_vat9"					=> $row["f_per_vat"] > 0  ?  strval($row["f_dr9"] - removeVAT($row["f_dr9"]))  : null, // จำนวนเงิน Vat
			"f_acc_vat10"					=> $row["f_per_vat"] > 0  ?  strval($row["f_dr10"] - removeVAT($row["f_dr10"]))  : null, // จำนวนเงิน Vat
			"f_acc_inv_vat1"				=> strval($row["f_dr1"]), //จำนวนเงินรวม Vat
			"f_acc_inv_vat2"				=> strval($row["f_dr2"]), //จำนวนเงินรวม Vat
			"f_acc_inv_vat3"				=> strval($row["f_dr3"]), //จำนวนเงินรวม Vat
			"f_acc_inv_vat4"				=> strval($row["f_dr4"]), //จำนวนเงินรวม Vat
			"f_acc_inv_vat5"				=> strval($row["f_dr5"]), //จำนวนเงินรวม Vat
			"f_acc_inv_vat6"				=> strval($row["f_dr6"]), //จำนวนเงินรวม Vat
			"f_acc_inv_vat7"				=> strval($row["f_dr7"]), //จำนวนเงินรวม Vat
			"f_acc_inv_vat8"				=> strval($row["f_dr8"]), //จำนวนเงินรวม Vat
			"f_acc_inv_vat9"				=> strval($row["f_dr9"]), //จำนวนเงินรวม Vat
			"f_acc_inv_vat10"				=> strval($row["f_dr10"]), //จำนวนเงินรวม Vat			// removeVAT
			"f_other"						=>	$row["f_per_other"],
			// "i_working_type"				=>	$row["i_working_type"],
			"i_working_type"				=>	in_array(@$_REQUEST["i_working_type"], ["1", "2"]) ? $row["i_working_type"] : $_REQUEST["i_working_type"],

			"gl_tran_hdr_id"       			=> $row["gl_tran_hdr_id"],
			"c_code_debt"          			=> $row["c_code_debt"],
			"d_debt_date"     				=> ($row["d_chk_last_date"] != "") ? $date->extDateBuddha($row["d_chk_last_date"]) : "",
			"c_debt_month"      			=> $d_debt_date_arr[1],
			"c_debt_year"       			=> $d_debt_date_arr[0],

		);
		${$root}[] = $temp;
	}
	$sqlCount   = "select count(*) as totalCount from ({$sqlTempTable}) a";
	$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
	echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
} else if ($_REQUEST["type"] == "select_data_bb_99") {
	###################
	$mode   = @$_REQUEST["mode"] ?? null;
	$filter = @$_REQUEST["filter"] ?? null;
	$value  = @$_REQUEST["value"] ?? null;
	$i_read = @$_REQUEST["i_read"] ?? null;
	###################
	$root   = "data";
	$data   = array();
	###################
	$limit  = @$_REQUEST["limit"] ?? null;
	$dir    = @$_REQUEST["dir"] ?? null;
	$sort   = @$_REQUEST["sort"] ?? null;
	$start  = @$_REQUEST["start"] ?? null;

	function get($a)
	{
		return $a ?? 0;
	}

	if (!get($start)) {
		$start = 0;
	}
	if (!get($limit)) {
		$limit = 20;
	} else {
		$limit = ($limit + $start);
	}
	if (!get($dir)) {
		$dir = "DESC";
	}
	if (!get($sort)) {
		$sort = " s.c_code";
	}

	#################################
	$keyin = "";
	$arrParam      = array();
	$arrCountParam = array();
	if ($mode == "SEARCH") {
		if ($_REQUEST["filter"] == "c_code_per") {
			$con .= "\n AND a.c_code LIKE '%" . $_REQUEST["value"] . "%' ";
		} else if ($_REQUEST["filter"] == "c_title") {
			$con .= "\n AND b.c_name LIKE '%" . $_REQUEST["value"] . "%' ";
		}
	}

	if (@$_REQUEST["dc_cost_acc_id"]) {
		$con .= " AND a.dc_cost_department_id = " . $_REQUEST["dc_cost_acc_id"];
	}
	if (@$_REQUEST["dc_cost_id"] && @$_REQUEST["dc_cost_acc_id"] != 77) {
		$con .= " AND a.dc_cost_id = " . $_REQUEST["dc_cost_id"];
	}

	$sqlTempTable = "
		SELECT 
			ROW_NUMBER() OVER (ORDER BY a.fi_br_hdr_id DESC) AS row
			,a.fi_br_hdr_id
		FROM vw_fi_br_hdr_normal_eis a
		WHERE 1=1 
			and isnull(a.f_money_remain,0) > 0
			{$con}
	";

	$sqlMain = "
		SELECT
			a.row 
			,5 AS i_sys
			,b.fi_br_hdr_id 
			,b.c_name as c_comment
			,b.c_project_name as c_title
			,b.dc_cost_department_id AS dc_cost_acc_id
			,b.dc_cost_id
			,b.dc_creditor_id
			,b.dc_creditor_id AS dc_creditor_transfer_id
			,b.c_code AS c_code_per
			,'' AS c_booking
			,4 AS i_working_type
			,1 AS  i_enable
			,2 AS  i_delete
			,'-' AS  c_code_invoice
			,b.c_budget_year AS i_budget_year
			,b.c_budget_year AS i_budget_year_overlap

			,b.f_money_br  /*จำนวนเงินยืม 5000*/
			,b.f_money_clear_by_cash /*จำนวนเงินส่งใช้เงินยืม เป็นเงินสด 2000*/
			,b.f_money_clear_by_doc /*จำนวนเงินส่งใช้เงินยืม เป็นเอกสาร/ใบสำคัญ 1000*/
			,b.f_money_remain /*จำนวนเงินยืมคงค้าง 2000*/
			,b.doc_request_normal1_id
			,b.doc_request_normal2_id
			,b.doc_request_normal3_id
			,b.doc_request_normal4_id
			,b.doc_request_normal5_id
			,b.doc_request_add1_id
			,(SELECT SUM(ISNULL(f_total,0)) FROM po_working_dtl aa 
				INNER JOIN po_working_hdr bb ON aa.po_working_hdr_id = bb.po_working_hdr_id AND bb.i_status_last < 7
				WHERE  aa.po_working_hdr_id = b.doc_request_normal1_id 
					OR aa.po_working_hdr_id = b.doc_request_normal2_id
					OR aa.po_working_hdr_id = b.doc_request_normal3_id
					OR aa.po_working_hdr_id = b.doc_request_normal4_id
					OR aa.po_working_hdr_id = b.doc_request_normal5_id
			)as f_working_sum
		FROM ({$sqlTempTable}) a
		INNER JOIN vw_fi_br_hdr_normal_eis b ON a.fi_br_hdr_id = b.fi_br_hdr_id
		WHERE a.row > ? AND a.row <= ?
	";

	/** test **/
	// UPDATE fi_br_hdr SET f_money_remain=f_money_br,i_status_br=6,i_close=1,c_contract='ส.0767000001',d_pay='2024-09-24'

	$arrParam	= array();
	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	if (@$_REQUEST["show_sql"]) {
		/******echo sql******/
		$sql = str_replace('?', '#-#', $sqlMain);
		foreach ($arrParam as $fld => $value) {
			$sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
		}
		echo $sql;
		exit;
		/********************/
	}
	$stmt = $db->QueryParam($sqlMain, $arrParam);

	while ($row = $db->Fetch($stmt)) {
		// $d_debt_date_arr = explode("-", $row["d_chk_last_date"]);
		$temp = array(
			"no"                            =>  $row["row"],
			"i_sys"                         =>	$row["i_sys"],
			"fi_br_hdr_id"                  =>	$row["fi_br_hdr_id"],
			"c_heading"                     =>	$row["c_comment"],
			"c_comment"                     =>	$row["c_comment"],
			"dc_cost_acc_id"                =>	$row["dc_cost_acc_id"],
			"dc_cost_id"                    =>	@$_REQUEST["dc_cost_acc_id"] == 77 ? $_REQUEST["dc_cost_id"] : $row["dc_cost_id"],
			"dc_creditor_id"                =>	$row["dc_creditor_id"],
			"dc_creditor_transfer_id"       =>	$row["dc_creditor_transfer_id"],
			"c_code_per"                    =>	$row["c_code_per"],
			"c_booking"                     =>	$row["c_booking"],
			"d_audit_date"                  =>  $date->extDateBuddha(date("Y-m-d")),
			"d_doc_date"                    =>  $date->extDateBuddha(date("Y-m-d")),
			"i_enable"                      =>	1,
			"i_delete"                      =>	2,
			"dc_user_send_id"               =>	0,
			"po_emp_id"                     =>	$_SESSION["user_name"],
			"i_budget_year"                 =>	$row["i_budget_year"],
			"i_budget_year_overlap"         =>	$row["i_budget_year_overlap"],
			"i_working_type"                =>	$row["i_working_type"],
			"f_money_br"                    => $row["f_money_br"],
			"f_money_clear_by_cash"         => $row["f_money_clear_by_cash"],
			"f_money_clear_by_doc"          => $row["f_money_clear_by_doc"],
			"f_money_remain"                => $row["f_money_remain"],
			"f_working_sum"                	=> $row["f_working_sum"],
			"doc_request_normal1_id"        => $row["doc_request_normal1_id"],
			"doc_request_normal2_id"        => $row["doc_request_normal2_id"],
			"doc_request_normal3_id"        => $row["doc_request_normal3_id"],
			"doc_request_normal4_id"        => $row["doc_request_normal4_id"],
			"doc_request_normal5_id"        => $row["doc_request_normal5_id"],
			"doc_request_add1_id"           => $row["doc_request_add1_id"],


			// "gl_tran_hdr_id"                => $row["gl_tran_hdr_id"],
			// "c_code_debt"                   => $row["c_code_debt"],
			// "d_debt_date"                   => $row["gl_tran_hdr_id"] ? $date->extDateBuddha($row["d_chk_last_date"]) : '',
			// "c_debt_month"                  => $d_debt_date_arr[1],
			// "c_debt_year"                   => $d_debt_date_arr[0],
		);
		${$root}[] = $temp;
	}
	$sqlCount   = "select count(*) as totalCount from ({$sqlTempTable}) a";
	$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
	echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
} else if ($_REQUEST["type"] == "select_data_ee_99") {
	###################
	$mode   = @$_REQUEST["mode"] ?? null;
	$filter = @$_REQUEST["filter"] ?? null;
	$value  = @$_REQUEST["value"] ?? null;
	$i_read = @$_REQUEST["i_read"] ?? null;
	###################
	$root   = "data";
	$data   = array();
	###################
	$limit  = @$_REQUEST["limit"] ?? null;
	$dir    = @$_REQUEST["dir"] ?? null;
	$sort   = @$_REQUEST["sort"] ?? null;
	$start  = @$_REQUEST["start"] ?? null;

	function get($a)
	{
		return $a ?? 0;
	}

	if (!get($start)) {
		$start = 0;
	}
	if (!get($limit)) {
		$limit = 20;
	} else {
		$limit = ($limit + $start);
	}
	if (!get($dir)) {
		$dir = "DESC";
	}
	if (!get($sort)) {
		$sort = " s.c_code";
	}

	#################################
	$keyin = "";
	$arrParam      = array();
	$arrCountParam = array();

	if ($mode == "SEARCH") {
		if ($_REQUEST["filter"] == "c_code_per") {
			$con .= "\n AND a.c_code LIKE '%" . $_REQUEST["value"] . "%' ";
		} else if ($_REQUEST["filter"] == "c_title") {
			$con .= "\n AND b.c_name LIKE '%" . $_REQUEST["value"] . "%' ";
		}
	}

	if (@$_REQUEST["dc_cost_acc_id"]) {
		$con .= " AND a.dc_cost_department_id = " . $_REQUEST["dc_cost_acc_id"];
	}
	if (@$_REQUEST["dc_cost_id"] && @$_REQUEST["dc_cost_acc_id"] != 77) {
		$con .= " AND a.dc_cost_id = " . $_REQUEST["dc_cost_id"];
	}

	$sqlTempTable = "
		SELECT 
			ROW_NUMBER() OVER (ORDER BY a.fi_br_hdr_id DESC) AS row
			,a.fi_br_hdr_id
		FROM vw_fi_br_hdr_add_eis a
		where 1=1 
		AND isnull(a.f_money_add,0) > 0
			{$con}
		";

	$sqlMain = "
		SELECT
			a.row 
			,5 AS i_sys
			,b.fi_br_hdr_id 
			,b.c_name as c_comment
			,b.c_project_name as c_title
			,b.dc_cost_department_id AS dc_cost_acc_id
			,b.dc_cost_id
			,b.dc_creditor_id
			,b.dc_creditor_id AS dc_creditor_transfer_id
			,b.c_code AS c_code_per
			,'' AS c_booking
			,5 AS i_working_type
			,1 AS  i_enable
			,2 AS  i_delete
			,'-' AS  c_code_invoice
			,b.c_budget_year AS i_budget_year
			,b.c_budget_year AS i_budget_year_overlap

			,b.f_money_br  /*จำนวนเงินยืม 5000*/
			,b.f_money_clear_by_cash /*จำนวนเงินส่งใช้เงินยืม เป็นเงินสด 2000*/
			,b.f_money_clear_by_doc /*จำนวนเงินส่งใช้เงินยืม เป็นเอกสาร/ใบสำคัญ 1000*/
			,b.f_money_remain /*จำนวนเงินยืมคงค้าง 2000*/
			,b.f_money_add as f_total /*จำนวนเงินเกินเบิกคืน*/
			,b.doc_request_normal1_id
			,b.doc_request_normal2_id
			,b.doc_request_normal3_id
			,b.doc_request_normal4_id
			,b.doc_request_normal5_id
			,b.doc_request_add1_id
		FROM ({$sqlTempTable}) a
		INNER JOIN vw_fi_br_hdr_add_eis b ON a.fi_br_hdr_id = b.fi_br_hdr_id
		WHERE a.row > ? AND a.row <= ?
	";

	/** test **/
	// update fi_br_hdr set i_status_br=6 , i_close=1 , c_contract ='TEST00001' ,d_pay = '2024-09-19'

	$arrParam	= array();
	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	if (@$_REQUEST["show_sql"]) {
		/******echo sql******/
		$sql = str_replace('?', '#-#', $sqlMain);
		foreach ($arrParam as $fld => $value) {
			$sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
		}
		echo $sql;
		exit;
		/********************/
	}
	$stmt = $db->QueryParam($sqlMain, $arrParam);

	while ($row = $db->Fetch($stmt)) {
		// $d_debt_date_arr = explode("-", $row["d_chk_last_date"]);
		$temp = array(
			"no"                            =>  $row["row"],
			"i_sys"                         =>	$row["i_sys"],
			"fi_br_hdr_id"                  =>	$row["fi_br_hdr_id"],
			"c_heading"                     =>	$row["c_title"],
			"c_comment"                     =>	$row["c_comment"],
			"dc_cost_acc_id"                =>	$row["dc_cost_acc_id"],
			"dc_cost_id"                    =>	@$_REQUEST["dc_cost_acc_id"] == 77 ? $_REQUEST["dc_cost_id"] : $row["dc_cost_id"],
			"dc_creditor_id"                =>	$row["dc_creditor_id"],
			"dc_creditor_transfer_id"       =>	$row["dc_creditor_transfer_id"],
			"c_code_per"                    =>	$row["c_code_per"],
			"c_booking"                     =>	$row["c_booking"],
			"d_audit_date"                  =>  $date->extDateBuddha(date("Y-m-d")),
			"d_doc_date"                    =>  $date->extDateBuddha(date("Y-m-d")),
			"i_enable"                      =>	1,
			"i_delete"                      =>	2,
			"dc_user_send_id"               =>	0,
			"po_emp_id"                     =>	$_SESSION["user_name"],
			"i_budget_year"                 =>	$row["i_budget_year"],
			"i_budget_year_overlap"         =>	$row["i_budget_year_overlap"],
			"i_working_type"                =>	$row["i_working_type"],
			"f_money_br"                    => $row["f_money_br"],
			"f_money_clear_by_cash"         => $row["f_money_clear_by_cash"],
			"f_money_clear_by_doc"          => $row["f_money_clear_by_doc"],
			"f_money_remain"                => $row["f_money_remain"],
			"doc_request_normal1_id"        => $row["doc_request_normal1_id"],
			"doc_request_normal2_id"        => $row["doc_request_normal2_id"],
			"doc_request_normal3_id"        => $row["doc_request_normal3_id"],
			"doc_request_normal4_id"        => $row["doc_request_normal4_id"],
			"doc_request_normal5_id"        => $row["doc_request_normal5_id"],
			"doc_request_add1_id"           => $row["doc_request_add1_id"],

			"f_total"						=> $row["f_total"],
			"f_inv"							=> $row["f_total"],
			"f_inv_vat"						=> $row["f_total"],
			"f_pay"							=> $row["f_total"],


			// "gl_tran_hdr_id"                => $row["gl_tran_hdr_id"],
			// "c_code_debt"                   => $row["c_code_debt"],
			// "d_debt_date"                   => $row["gl_tran_hdr_id"] ? $date->extDateBuddha($row["d_chk_last_date"]) : '',
			// "c_debt_month"                  => $d_debt_date_arr[1],
			// "c_debt_year"                   => $d_debt_date_arr[0],
		);
		${$root}[] = $temp;
	}
	$sqlCount   = "select count(*) as totalCount from ({$sqlTempTable}) a";
	$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
	echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
} else if ($_REQUEST["type"] == "select_data_wm") {
	###################
	$mode   = @$_REQUEST["mode"] ?? null;
	$filter = @$_REQUEST["filter"] ?? null;
	$value  = @$_REQUEST["value"] ?? null;
	$i_read = @$_REQUEST["i_read"] ?? null;
	###################
	$root   = "data";
	$data   = array();
	###################
	$limit  = @$_REQUEST["limit"] ?? null;
	$dir    = @$_REQUEST["dir"] ?? null;
	$sort   = @$_REQUEST["sort"] ?? null;
	$start  = @$_REQUEST["start"] ?? null;

	function get($a)
	{
		return $a ?? 0;
	}

	if (!get($start)) {
		$start = 0;
	}
	if (!get($limit)) {
		$limit = 20;
	} else {
		$limit = ($limit + $start);
	}
	if (!get($dir)) {
		$dir = "DESC";
	}
	if (!get($sort)) {
		$sort = " s.c_code";
	}

	#################################
	$keyin = "";
	$arrParam      = array();
	$arrCountParam = array();
	if ($mode == "SEARCH") {
		if ($_REQUEST["filter"] == "c_code_per") {
			$con .= "\n AND a.c_code LIKE '%" . $_REQUEST["value"] . "%' ";
		} else if ($_REQUEST["filter"] == "c_title") {
			$con .= "\n AND a.c_name LIKE '%" . $_REQUEST["value"] . "%' ";
		} else if ($_REQUEST["filter"] == "c_doc_ref1") {
			$con .= "\n AND a.c_doc_ref1 LIKE '%" . $_REQUEST["value"] . "%' ";
		} else if ($_REQUEST["filter"] == "c_fund") {
			$con .= "\n AND (SELECT cc.c_name FROM " . DB_FM_NMU . "dc_cost cc where cc.dc_cost_id = a.dc_cost_id) LIKE '%" . $_REQUEST["value"] . "%' ";
		}
	}
	if ($_REQUEST["i_fund"] == 1) {
		if (@$_REQUEST["dc_cost_id"]) {
			$con1 .= " AND a.dc_cost_id = " . $_REQUEST["dc_cost_id"];
		}
	}

	if ($_REQUEST["i_group"] == 0) {
		if (@$_REQUEST["cm_receive_tran_hdr_id"]) {
			$con .= " AND ISNULL(a.cm_receive_tran_hdr_id,0) = " . $_REQUEST["cm_receive_tran_hdr_id"] . "\n";
		} else {
			$con .= " AND b.c_code_per is null\n";
		}
		if ($_REQUEST["i_fund"] == 0) {
			if (@$_REQUEST["dc_cost_acc_id"] > 0) {
				$con .= " AND a.dc_cost_id = " . $_REQUEST["dc_cost_acc_id"];
			}
		}
	}

	if ($_REQUEST["i_group"] == 1  && $_REQUEST["i_fund"] == 0) {
		/** คณะแพทย์ & มหาลัย & กองทุนคณะแพทย์ **/
		if ($_REQUEST["dc_cost_acc_id"] == 77) {
			$sqlTempTable = "select ROW_NUMBER() OVER (ORDER BY a.cm_group_receive_for_wm_hdr_id DESC) AS row
									,a.cm_group_receive_for_wm_hdr_id
									,STRING_AGG(c.po_working_hdr_id, ',') AS po_working_hdr_id
									from " . DB_NMU . "cm_group_receive_for_wm_hdr a
									inner join " . DB_NMU . "cm_group_receive_for_wm_dtl d on a.cm_group_receive_for_wm_hdr_id = d.cm_group_receive_for_wm_hdr_id
									inner join " . DB_NMU . "cm_receive_tran_hdr c on d.cm_receive_tran_hdr_id = c.cm_receive_tran_hdr_id
									left join (select b.c_code_per , a.i_enable from " . DB_NMU_EIS . "po_working_hdr a 
												inner join " . DB_NMU_EIS . "po_working_begin_hdr b on a.po_working_hdr_id = b.po_working_hdr_id
												where b.i_working_type = '9' and a.i_enable = '1' and b.c_code_per is not null
												) b on b.c_code_per  = c.c_code
									where 1=1 and a.c_code is not null {$con}
									GROUP BY a.cm_group_receive_for_wm_hdr_id";

			$sqlMain = "select a.row
								,b.cm_group_receive_for_wm_hdr_id
								,b.c_code AS c_code_per
								,b.c_comment
								,b.dc_cost_id
								,b.dc_cost_id as  dc_cost_acc_id
								,(select aa.c_name from " . DB_NMU . "dc_cost aa where aa.dc_cost_id = b.dc_cost_id) as dc_cost_name
								,b.dc_creditor_id
								,null as c_other_name
								,null as dc_emp_id
								,null as dc_creditor_transfer_id
								,null as pr_tor_id
								,null as pr_tor
								,null as c_title
								,null as pr_dc_cost_id
								,null as c_contract_number
								,(select sum(isnull(aa.f_total_amt,0)) from " . DB_NMU . "cm_group_receive_for_wm_dtl aa where b.cm_group_receive_for_wm_hdr_id = aa.cm_group_receive_for_wm_hdr_id ) as f_guarantee_contract 
								,null as gl_tran_hdr_id
								,null as month_receive
								,null as dc_acc_id1
								,99 as i_type_menu_sub
								,(select top 1 aa.c_name from " . DB_CREDITOR_DATA . "dc_creditor aa where aa.dc_creditor_id = b.dc_creditor_id) AS name_receive
								,b.dc_expense_budget_type_id
								,(select aa.c_name from " . DB_NMU . "dc_expense_budget_type aa where aa.dc_expense_budget_type_id = b.dc_expense_budget_type_id) as dc_expense_budget_type_name
								,b.c_budget_year AS i_budget_year_overlap
								,b.c_budget_year AS i_budget_year
								,(select sum(isnull(aa.f_total_amt,0)) from " . DB_NMU . "cm_group_receive_for_wm_dtl aa where b.cm_group_receive_for_wm_hdr_id = aa.cm_group_receive_for_wm_hdr_id ) as sum_receive_dtl 
								,(select sum(isnull(aa.f_total_amt,0)) from " . DB_NMU . "cm_group_receive_for_wm_dtl aa where b.cm_group_receive_for_wm_hdr_id = aa.cm_group_receive_for_wm_hdr_id ) as f_total_amt1 
								,a.po_working_hdr_id
								,null as c_doc_ref1
								from ({$sqlTempTable}) a
							inner join " . DB_NMU . "cm_group_receive_for_wm_hdr b on a.cm_group_receive_for_wm_hdr_id = b.cm_group_receive_for_wm_hdr_id
							where 1=1 ";
		} else if ($_REQUEST["dc_cost_acc_id"] != 77) {
			$sqlTempTable = "select ROW_NUMBER() OVER (ORDER BY a.cm_group_receive_for_wm_hdr_id DESC) AS row
								,a.cm_group_receive_for_wm_hdr_id
								,STRING_AGG(c.po_working_hdr_id, ',') AS po_working_hdr_id
								from cm_group_receive_for_wm_hdr a
								inner join cm_group_receive_for_wm_dtl d on a.cm_group_receive_for_wm_hdr_id = d.cm_group_receive_for_wm_hdr_id
								inner join cm_receive_tran_hdr c on d.cm_receive_tran_hdr_id = c.cm_receive_tran_hdr_id
								left join (select b.c_code_per , a.i_enable from " . DB_NMU_EIS . "po_working_hdr a 
											inner join " . DB_NMU_EIS . "po_working_begin_hdr b on a.po_working_hdr_id = b.po_working_hdr_id
											where b.i_working_type = '9' and a.i_enable = '1' and b.c_code_per is not null
											) b on b.c_code_per  = c.c_code
							where 1=1 and a.c_code is not null {$con}
							GROUP BY a.cm_group_receive_for_wm_hdr_id";

			$sqlMain = "select a.row
							,b.cm_group_receive_for_wm_hdr_id
							,b.c_code AS c_code_per
							,b.c_comment
							,b.dc_cost_id
							,b.dc_cost_id as  dc_cost_acc_id
							,(select aa.c_name from " . DB_CENTER . "dc_cost aa where aa.dc_cost_id = b.dc_cost_id) as dc_cost_name
							,b.dc_creditor_id
							,null as c_other_name
							,null as dc_emp_id
							,null as dc_creditor_transfer_id
							,null as pr_tor_id
							,null as pr_tor
							,null as c_title
							,null as pr_dc_cost_id
							,null as c_contract_number
							,(select sum(isnull(aa.f_total_amt,0)) from cm_group_receive_for_wm_dtl aa where b.cm_group_receive_for_wm_hdr_id = aa.cm_group_receive_for_wm_hdr_id ) as f_guarantee_contract 
							,null as gl_tran_hdr_id
							,null as month_receive
							,null as dc_acc_id1
							,99 as i_type_menu_sub
							,(select top 1 aa.c_name from " . DB_CREDITOR_DATA . "dc_creditor aa where aa.dc_creditor_id = b.dc_creditor_id) AS name_receive
							,b.dc_expense_budget_type_id
							,(select aa.c_name from " . DB_CENTER . "dc_expense_budget_type aa where aa.dc_expense_budget_type_id = b.dc_expense_budget_type_id) as dc_expense_budget_type_name
							,b.c_budget_year AS i_budget_year_overlap
							,b.c_budget_year AS i_budget_year
							,(select sum(isnull(aa.f_total_amt,0)) from cm_group_receive_for_wm_dtl aa where b.cm_group_receive_for_wm_hdr_id = aa.cm_group_receive_for_wm_hdr_id ) as sum_receive_dtl 
							,(select sum(isnull(aa.f_total_amt,0)) from cm_group_receive_for_wm_dtl aa where b.cm_group_receive_for_wm_hdr_id = aa.cm_group_receive_for_wm_hdr_id ) as f_total_amt1 
							,a.po_working_hdr_id
							,null as c_doc_ref1
							from ({$sqlTempTable}) a
						inner join cm_group_receive_for_wm_hdr b on a.cm_group_receive_for_wm_hdr_id = b.cm_group_receive_for_wm_hdr_id
						where 1=1 ";
		}
	} else if ($_REQUEST["i_group"] == 1 && $_REQUEST["i_fund"] == 1) {
		$sqlTempTable = "select ROW_NUMBER() OVER (ORDER BY a.cm_group_receive_for_wm_hdr_id DESC) AS row
								,a.cm_group_receive_for_wm_hdr_id
								,STRING_AGG(c.po_working_hdr_id, ',') AS po_working_hdr_id
								from " . DB_FM_NMU . "cm_group_receive_for_wm_hdr a
								inner join " . DB_FM_NMU . "cm_group_receive_for_wm_dtl d on a.cm_group_receive_for_wm_hdr_id = d.cm_group_receive_for_wm_hdr_id
								inner join " . DB_FM_NMU . "cm_receive_tran_hdr c on d.cm_receive_tran_hdr_id = c.cm_receive_tran_hdr_id
								left join (select b.c_code_per , a.i_enable from " . DB_NMU_EIS . "po_working_hdr a 
											inner join " . DB_NMU_EIS . "po_working_begin_hdr b on a.po_working_hdr_id = b.po_working_hdr_id
											where b.i_working_type = '9' and a.i_enable = '1' and b.c_code_per is not null
											) b on b.c_code_per  = c.c_code
							where 1=1 and a.c_code is not null {$con}
							GROUP BY a.cm_group_receive_for_wm_hdr_id";

		$sqlMain = "select a.row
							,b.cm_group_receive_for_wm_hdr_id
							,b.c_code AS c_code_per
							,b.c_comment
							,'36' as dc_cost_id
							,'77' as dc_cost_acc_id
							,(select aa.c_name from " . DB_FM_NMU . "dc_cost aa where aa.dc_cost_id = b.dc_cost_id) as dc_cost_name
							,b.dc_creditor_id
							,null as c_other_name
							,null as dc_emp_id
							,null as dc_creditor_transfer_id
							,null as pr_tor_id
							,null as pr_tor
							,null as c_title
							,null as pr_dc_cost_id
							,null as c_contract_number
							,(select sum(isnull(aa.f_total_amt,0)) from " . DB_FM_NMU . "cm_group_receive_for_wm_dtl aa where b.cm_group_receive_for_wm_hdr_id = aa.cm_group_receive_for_wm_hdr_id ) as f_guarantee_contract 
							,null as gl_tran_hdr_id
							,null as month_receive
							,null as dc_acc_id1
							,99 as i_type_menu_sub
							,(select top 1 aa.c_name from " . DB_CREDITOR_DATA . "dc_creditor aa where aa.dc_creditor_id = b.dc_creditor_id) AS name_receive
							,CASE b.dc_cost_id 
								WHEN '4' THEN '36' /*กองทุนพัฒนาคณะแพทยฯ*/
								WHEN '5' THEN '37' /*กองทุนพัฒนาอาคารสถานที่ฯ*/
								ELSE NULL
							END AS dc_expense_budget_type_id
							,(select aa.c_name from " . DB_FM_NMU . "dc_expense_budget_type aa where aa.dc_expense_budget_type_id = b.dc_expense_budget_type_id) as dc_expense_budget_type_name
							,b.c_budget_year AS i_budget_year_overlap
							,b.c_budget_year AS i_budget_year
							,(select sum(isnull(aa.f_total_amt,0)) from " . DB_FM_NMU . "cm_group_receive_for_wm_dtl aa where b.cm_group_receive_for_wm_hdr_id = aa.cm_group_receive_for_wm_hdr_id ) as sum_receive_dtl 
							,(select sum(isnull(aa.f_total_amt,0)) from " . DB_FM_NMU . "cm_group_receive_for_wm_dtl aa where b.cm_group_receive_for_wm_hdr_id = aa.cm_group_receive_for_wm_hdr_id ) as f_total_amt1 
							,a.po_working_hdr_id
							,null as c_doc_ref1
							from ({$sqlTempTable}) a
						inner join " . DB_FM_NMU . "cm_group_receive_for_wm_hdr b on a.cm_group_receive_for_wm_hdr_id = b.cm_group_receive_for_wm_hdr_id
						where 1=1 ";
	} else if ($_REQUEST["i_group"] == 0 && $_REQUEST["i_fund"] == 0) {
		if ($_REQUEST["dc_cost_acc_id"] == 77) {
			/** คณะแพทย์ **/
			$sqlTempTable = "
				SELECT 
					ROW_NUMBER() OVER (ORDER BY a.cm_receive_tran_hdr_id DESC) AS row
					,a.cm_receive_tran_hdr_id
				FROM " . DB_CREDITOR_DATA . "cm_receive_tran_hdr a
				LEFT JOIN po_working_hdr pwh ON a.po_working_hdr_id = pwh.po_working_hdr_id AND pwh.i_enable = 1
				left join (select b.c_code_per , a.i_enable from po_working_hdr a 
						inner join po_working_begin_hdr b on a.po_working_hdr_id = b.po_working_hdr_id
						where b.i_working_type = '9' and a.i_enable = '1' and b.c_code_per is not null
						) b on b.c_code_per  = a.c_code
				where 1=1 and a.i_type_menu_sub in (1,2) and a.c_code is not null and a.i_enable = 1
					{$con}
				";

			$sqlMain = "
			select 	
				a.row 
				,d.cm_receive_tran_hdr_id
				,d.cm_receive_type_id
				,d.pr_tor_id
				,(select aa.pr_c_code from " . DB_NMU_ERP . "vw_pr_po aa where d.pr_tor_id = aa.pr_tor_id) as pr_tor
				,c.i_type
				,d.c_code AS c_code_per
				,(select aa.c_name from  " . DB_CENTER . "cm_receive_type aa where aa.i_type = c.i_type and aa.i_enable = '1') as cm_receive_type
				,d.cm_receive_book_type_id
				,(select aa.c_name from cm_receive_book_type aa where aa.cm_receive_book_type_id = d.cm_receive_book_type_id) as cm_receive_book_type
				,d.dc_creditor_type_receive_id
				,(select aa.c_name from dc_creditor_type_receive aa where aa.dc_creditor_type_receive_id = d.dc_creditor_type_receive_id) as dc_creditor_type_receive_name
				,CASE
					WHEN d.dc_creditor_type_receive_id = 1 THEN d.c_other_name 
					WHEN d.dc_creditor_type_receive_id = 2 THEN (select top 1 aa.c_name from " . DB_CREDITOR_DATA . "dc_creditor aa where aa.dc_creditor_id = d.dc_creditor_id) 
					WHEN d.dc_creditor_type_receive_id = 3 THEN (select aa.c_title +' '+ aa.c_name from  " . DB_CENTER . "dc_emp aa where aa.dc_emp_id = d.dc_emp_id) 
					ELSE (SELECT cc.c_name FROM dc_cost cc where cc.dc_cost_id = d.dc_cost_receive_id)
				END AS name_receive
				,d.dc_emp_id
				,d.c_other_name
				,d.dc_cost_receive_id
				,d.pr_dc_cost_id
				,d.dc_creditor_id
				,d.dc_creditor_id AS dc_creditor_transfer_id
				,d.dc_bank_acc_company_id
				,(select aa.c_code from dc_bank_acc_company aa where aa.dc_bank_acc_company_id = d.dc_bank_acc_company_id) as dc_bank_acc_company_code
				,(select aa.c_name from dc_bank_acc_company aa where aa.dc_bank_acc_company_id = d.dc_bank_acc_company_id) as dc_bank_acc_company
				,d.dc_expense_budget_type_id
				,(select aa.c_name from  " . DB_CREDITOR_DATA . "dc_expense_budget_type aa where aa.dc_expense_budget_type_id = d.dc_expense_budget_type_id) as dc_expense_budget_type
				,STUFF(STUFF(STUFF(CAST(d.c_tax_value AS VARCHAR(13)),4, 0, '-'),6, 0, '-'),14, 0, '-') AS c_tax_value_t
				,SUBSTRING(d.c_tax_value, 4, 1) AS c_tax_value_str
				,d.c_tax_value
				,d.dc_bank_id
				,(select aa.name_shot from dc_bank aa where aa.dc_bank_id = d.dc_bank_id) as dc_bank
				,(select aa.name_shot from dc_bank aa where aa.dc_bank_id = (select aa.dc_bank_id from dc_bank_acc_company aa where aa.dc_bank_acc_company_id = d.dc_bank_acc_company_id)) as dc_bank_name
				,d.dc_bank_branch_id
				,(select aa.c_name from dc_bank_branch aa where aa.dc_bank_branch_id = d.dc_bank_branch_id) as dc_bank_branch
				,d.c_chq_no
				,d.c_credit_no
				,d.c_paper_no
				,CONVERT(VARCHAR, d.d_doc_date, 120) AS d_doc_date
				,CONVERT(VARCHAR, d.d_chq_date, 120) AS d_chq_date
				,d.c_yyyy_mm
				,LEFT(d.c_code_rcp,1) as c_is_gen_code
				,d.dc_cost_id
				,d.dc_cost_id as  dc_cost_acc_id
				,(SELECT cc.c_name FROM " . DB_CENTER . "dc_cost cc where cc.dc_cost_id = d.dc_cost_id) as dc_cost_name
				,d.i_type_menu
				,d.i_type_menu_sub
				,d.c_comment
				,d.c_budget_year AS i_budget_year
				,d.c_budget_year AS i_budget_year_overlap
				,d.i_type_year
				,d.c_receive_book_number
				,d.c_receive_number
				,d.c_receive_i_rank
				,d.c_contract_number
				,d.f_guarantee_contract
				,d.c_guarantee_doc 
				,d.i_enable
				,d.c_project_doc as c_title
				,(SELECT cc.dc_title_id FROM dc_user bb 
				inner join  " . DB_CENTER . "dc_emp cc on bb.dc_emp_id = cc.dc_emp_id
				where bb.dc_user_id = d.dc_user_create_id) as dc_title_id
				,(SELECT cc.c_title +' '+ cc.c_name FROM dc_user bb 
				inner join  " . DB_CENTER . "dc_emp cc on bb.dc_emp_id = cc.dc_emp_id
				where bb.dc_user_id = d.dc_user_create_id) as dc_user_create_full
				,(SELECT cc.c_name FROM dc_user bb 
				inner join  " . DB_CENTER . "dc_emp cc on bb.dc_emp_id = cc.dc_emp_id
				where bb.dc_user_id = d.dc_user_create_id) as dc_user_create_name
				,(SELECT cc.c_name FROM dc_cost cc where cc.dc_cost_id = d.dc_user_create_cost_id) as dc_user_create_cost
				,d.dc_user_create_id
				,d.dc_user_create_cost_id
				,CONVERT(VARCHAR, d.d_create, 120) AS d_create
				,(SELECT bb.c_full_name FROM dc_user bb where bb.dc_user_id = d.dc_user_update_id) as dc_user_update
				,(SELECT cc.c_name FROM dc_cost cc where cc.dc_cost_id = d.dc_user_update_cost_id) as dc_user_update_cost
				,d.dc_user_update_id
				,d.dc_user_update_cost_id
				,CONVERT(VARCHAR, d.d_update, 120) AS d_update
				,(select dd.c_name from  " . DB_CENTER . "dc_position dd where d.dc_position_id = dd.dc_position_id) as dc_position
				,d.i_type_receive
				,CONVERT(VARCHAR, d.d_contact_date, 120) AS d_contact_date
				,CONVERT(VARCHAR, d.d_due_date, 120) AS d_due_date
				,(select SUM(aa.f_total_amt) from " . DB_CREDITOR_DATA . "cm_receive_tran_dtl aa where aa.cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id ) AS sum_receive_dtl

					,( select f_total_amt from  (select 
						ROW_NUMBER() OVER (ORDER BY dc_acc_id DESC) AS row
						,f_total_amt
						from " . DB_CREDITOR_DATA . "cm_receive_tran_dtl where cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id  and f_total_amt > 0  
					) a  where a.row =  1) as f_total_amt1
						,( select dc_acc_id from  (select 
						ROW_NUMBER() OVER (ORDER BY dc_acc_id DESC) AS row
						,dc_acc_id
						from " . DB_CREDITOR_DATA . "cm_receive_tran_dtl where cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id  and f_total_amt > 0  
					) a  where a.row =  1) as dc_acc_id1

					,( select f_total_amt from  (select 
						ROW_NUMBER() OVER (ORDER BY dc_acc_id DESC) AS row
						,f_total_amt
						from " . DB_CREDITOR_DATA . "cm_receive_tran_dtl where cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id  and f_total_amt > 0  
					) a  where a.row =  2) as f_total_amt2
					,( select dc_acc_id from  (select 
						ROW_NUMBER() OVER (ORDER BY dc_acc_id DESC) AS row
						,dc_acc_id
						from " . DB_CREDITOR_DATA . "cm_receive_tran_dtl where cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id  and f_total_amt > 0  
					) a  where a.row =  2) as dc_acc_id2

						,( select f_total_amt from  (select 
						ROW_NUMBER() OVER (ORDER BY dc_acc_id DESC) AS row
						,f_total_amt
						from " . DB_CREDITOR_DATA . "cm_receive_tran_dtl where cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id  and f_total_amt > 0  
					) a  where a.row =  3) as f_total_amt3
					,( select dc_acc_id from  (select 
						ROW_NUMBER() OVER (ORDER BY dc_acc_id DESC) AS row
						,dc_acc_id
						from " . DB_CREDITOR_DATA . "cm_receive_tran_dtl where cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id  and f_total_amt > 0  
					) a  where a.row =  3) as dc_acc_id3

						,( select f_total_amt from  (select 
						ROW_NUMBER() OVER (ORDER BY dc_acc_id DESC) AS row
						,f_total_amt
						from " . DB_CREDITOR_DATA . "cm_receive_tran_dtl where cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id  and f_total_amt > 0  
					) a  where a.row =  4) as f_total_amt4
					,( select dc_acc_id from  (select 
						ROW_NUMBER() OVER (ORDER BY dc_acc_id DESC) AS row
						,dc_acc_id
						from " . DB_CREDITOR_DATA . "cm_receive_tran_dtl where cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id  and f_total_amt > 0  
					) a  where a.row =  4) as dc_acc_id4

						,( select f_total_amt from  (select 
						ROW_NUMBER() OVER (ORDER BY dc_acc_id DESC) AS row
						,f_total_amt
						from " . DB_CREDITOR_DATA . "cm_receive_tran_dtl where cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id  and f_total_amt > 0  
					) a  where a.row =  5) as f_total_amt5
					,( select dc_acc_id from  (select 
						ROW_NUMBER() OVER (ORDER BY dc_acc_id DESC) AS row
						,dc_acc_id
						from " . DB_CREDITOR_DATA . "cm_receive_tran_dtl where cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id  and f_total_amt > 0  
					) a  where a.row =  5) as dc_acc_id5
				,SUBSTRING(CONVERT(VARCHAR, d.d_doc_date, 120), 6, 2) AS month_receive
				,d.gl_tran_hdr_id
				,d.c_doc_ref1
			from ({$sqlTempTable}) a
			left join " . DB_CREDITOR_DATA . "cm_receive_tran_hdr d on a.cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id
			--left join " . DB_CREDITOR_DATA . "cm_receive_tran_dtl b on d.cm_receive_tran_hdr_id = b.cm_receive_tran_hdr_id
			left join  " . DB_CENTER . "cm_receive_type c on d.cm_receive_type_id = c.cm_receive_type_id
			--inner join  " . DB_CENTER . "cm_map_cost_rec_dtl e on b.cm_map_cost_rec_dtl_id = e.cm_map_cost_rec_dtl_id 
			--inner join  " . DB_CENTER . "cm_map_acc_receive f on f.cm_map_acc_receive_id = b.cm_map_acc_receive_id 
			inner join  " . DB_CENTER . "cm_cost_address g on g.dc_cost_id = d.dc_cost_id 
			where a.row > ? AND a.row <= ?
				order by a.row
			";
		} else if ($_REQUEST["dc_cost_acc_id"] != 77) {
			/** มหาลัย **/
			$sqlTempTable = "
				SELECT 
					ROW_NUMBER() OVER (ORDER BY a.cm_receive_tran_hdr_id DESC) AS row
					,a.cm_receive_tran_hdr_id
				FROM cm_receive_tran_hdr a
				LEFT JOIN po_working_hdr pwh ON a.po_working_hdr_id = pwh.po_working_hdr_id AND pwh.i_enable = 1
				left join (select b.c_code_per , a.i_enable from " . DB_NMU_EIS . "po_working_hdr a 
										inner join " . DB_NMU_EIS . "po_working_begin_hdr b on a.po_working_hdr_id = b.po_working_hdr_id
										where b.i_working_type = '9' and a.i_enable = '1' and b.c_code_per is not null
										) b on b.c_code_per  = a.c_code
				where 1=1 and a.i_type_menu_sub in (1,2) and a.c_code is not null and a.i_enable = 1
					{$con}
				";

			$sqlMain = "
				select 	
					a.row 
					,d.cm_receive_tran_hdr_id
					,d.cm_receive_type_id
					,d.pr_tor_id
					,(select aa.pr_c_code from " . DB_NMU_ERP . "vw_pr_po aa where d.pr_tor_id = aa.pr_tor_id) as pr_tor
					,c.i_type
					,d.c_code AS c_code_per
					,(select aa.c_name from  " . DB_CENTER . "cm_receive_type aa where aa.i_type = c.i_type and aa.i_enable = '1') as cm_receive_type
					,d.cm_receive_book_type_id
					,(select aa.c_name from cm_receive_book_type aa where aa.cm_receive_book_type_id = d.cm_receive_book_type_id) as cm_receive_book_type
					,d.dc_creditor_type_receive_id
					,(select aa.c_name from dc_creditor_type_receive aa where aa.dc_creditor_type_receive_id = d.dc_creditor_type_receive_id) as dc_creditor_type_receive_name
					,CASE
						WHEN d.dc_creditor_type_receive_id = 1 THEN d.c_other_name 
						WHEN d.dc_creditor_type_receive_id = 2 THEN (select top 1 aa.c_name from " . DB_CREDITOR_DATA . "dc_creditor aa where aa.dc_creditor_id = d.dc_creditor_id) 
						WHEN d.dc_creditor_type_receive_id = 3 THEN (select aa.c_title +' '+ aa.c_name from  " . DB_CENTER . "dc_emp aa where aa.dc_emp_id = d.dc_emp_id) 
						ELSE (SELECT cc.c_name FROM dc_cost cc where cc.dc_cost_id = d.dc_cost_receive_id)
					END AS name_receive
					,d.dc_emp_id
					,d.c_other_name
					,d.dc_cost_receive_id
					,d.pr_dc_cost_id
					,d.dc_creditor_id
					,d.dc_creditor_id AS dc_creditor_transfer_id
					,d.dc_bank_acc_company_id
					,(select aa.c_code from dc_bank_acc_company aa where aa.dc_bank_acc_company_id = d.dc_bank_acc_company_id) as dc_bank_acc_company_code
					,(select aa.c_name from dc_bank_acc_company aa where aa.dc_bank_acc_company_id = d.dc_bank_acc_company_id) as dc_bank_acc_company
					,d.dc_expense_budget_type_id
					,(select aa.c_name from  " . DB_CENTER . "dc_expense_budget_type aa where aa.dc_expense_budget_type_id = d.dc_expense_budget_type_id) as dc_expense_budget_type
					,STUFF(STUFF(STUFF(CAST(d.c_tax_value AS VARCHAR(13)),4, 0, '-'),6, 0, '-'),14, 0, '-') AS c_tax_value_t
					,SUBSTRING(d.c_tax_value, 4, 1) AS c_tax_value_str
					,d.c_tax_value
					,d.dc_bank_id
					,(select aa.name_shot from dc_bank aa where aa.dc_bank_id = d.dc_bank_id) as dc_bank
					,(select aa.name_shot from dc_bank aa where aa.dc_bank_id = (select aa.dc_bank_id from dc_bank_acc_company aa where aa.dc_bank_acc_company_id = d.dc_bank_acc_company_id)) as dc_bank_name
					,d.dc_bank_branch_id
					,(select aa.c_name from dc_bank_branch aa where aa.dc_bank_branch_id = d.dc_bank_branch_id) as dc_bank_branch
					,d.c_chq_no
					,d.c_credit_no
					,d.c_paper_no
					,CONVERT(VARCHAR, d.d_doc_date, 120) AS d_doc_date
					,CONVERT(VARCHAR, d.d_chq_date, 120) AS d_chq_date
					,d.c_yyyy_mm
					,LEFT(d.c_code_rcp,1) as c_is_gen_code
					,d.dc_cost_id
					,d.dc_cost_id as  dc_cost_acc_id
					,(SELECT cc.c_name FROM " . DB_CENTER . "dc_cost cc where cc.dc_cost_id = d.dc_cost_id) as dc_cost_name
					,d.i_type_menu
					,d.i_type_menu_sub
					,d.c_comment
					,d.c_budget_year AS i_budget_year
					,d.c_budget_year AS i_budget_year_overlap
					,d.i_type_year
					,d.c_receive_book_number
					,d.c_receive_number
					,d.c_receive_i_rank
					,d.c_contract_number
					,d.f_guarantee_contract
					,d.c_guarantee_doc 
					,d.i_enable
					,d.c_project_doc as c_title
					,(SELECT cc.dc_title_id FROM dc_user bb 
					inner join  " . DB_CENTER . "dc_emp cc on bb.dc_emp_id = cc.dc_emp_id
					where bb.dc_user_id = d.dc_user_create_id) as dc_title_id
					,(SELECT cc.c_title +' '+ cc.c_name FROM dc_user bb 
					inner join  " . DB_CENTER . "dc_emp cc on bb.dc_emp_id = cc.dc_emp_id
					where bb.dc_user_id = d.dc_user_create_id) as dc_user_create_full
					,(SELECT cc.c_name FROM dc_user bb 
					inner join  " . DB_CENTER . "dc_emp cc on bb.dc_emp_id = cc.dc_emp_id
					where bb.dc_user_id = d.dc_user_create_id) as dc_user_create_name
					,(SELECT cc.c_name FROM dc_cost cc where cc.dc_cost_id = d.dc_user_create_cost_id) as dc_user_create_cost
					,d.dc_user_create_id
					,d.dc_user_create_cost_id
					,CONVERT(VARCHAR, d.d_create, 120) AS d_create
					,(SELECT bb.c_full_name FROM dc_user bb where bb.dc_user_id = d.dc_user_update_id) as dc_user_update
					,(SELECT cc.c_name FROM dc_cost cc where cc.dc_cost_id = d.dc_user_update_cost_id) as dc_user_update_cost
					,d.dc_user_update_id
					,d.dc_user_update_cost_id
					,CONVERT(VARCHAR, d.d_update, 120) AS d_update
					,(select dd.c_name from  " . DB_CENTER . "dc_position dd where d.dc_position_id = dd.dc_position_id) as dc_position
					,d.i_type_receive
					,CONVERT(VARCHAR, d.d_contact_date, 120) AS d_contact_date
					,CONVERT(VARCHAR, d.d_due_date, 120) AS d_due_date
					,(select SUM(aa.f_total_amt) from cm_receive_tran_dtl aa where aa.cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id ) AS sum_receive_dtl
						,( select f_total_amt from  (select 
						ROW_NUMBER() OVER (ORDER BY dc_acc_id DESC) AS row
						,f_total_amt
						from cm_receive_tran_dtl where cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id  and f_total_amt > 0  
					) a  where a.row =  1) as f_total_amt1
						,( select dc_acc_id from  (select 
						ROW_NUMBER() OVER (ORDER BY dc_acc_id DESC) AS row
						,dc_acc_id
						from cm_receive_tran_dtl where cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id  and f_total_amt > 0  
					) a  where a.row =  1) as dc_acc_id1

					,( select f_total_amt from  (select 
						ROW_NUMBER() OVER (ORDER BY dc_acc_id DESC) AS row
						,f_total_amt
						from cm_receive_tran_dtl where cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id  and f_total_amt > 0  
					) a  where a.row =  2) as f_total_amt2
					,( select dc_acc_id from  (select 
						ROW_NUMBER() OVER (ORDER BY dc_acc_id DESC) AS row
						,dc_acc_id
						from cm_receive_tran_dtl where cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id  and f_total_amt > 0  
					) a  where a.row =  2) as dc_acc_id2

						,( select f_total_amt from  (select 
						ROW_NUMBER() OVER (ORDER BY dc_acc_id DESC) AS row
						,f_total_amt
						from cm_receive_tran_dtl where cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id  and f_total_amt > 0  
					) a  where a.row =  3) as f_total_amt3
					,( select dc_acc_id from  (select 
						ROW_NUMBER() OVER (ORDER BY dc_acc_id DESC) AS row
						,dc_acc_id
						from cm_receive_tran_dtl where cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id  and f_total_amt > 0  
					) a  where a.row =  3) as dc_acc_id3

						,( select f_total_amt from  (select 
						ROW_NUMBER() OVER (ORDER BY dc_acc_id DESC) AS row
						,f_total_amt
						from cm_receive_tran_dtl where cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id  and f_total_amt > 0  
					) a  where a.row =  4) as f_total_amt4
					,( select dc_acc_id from  (select 
						ROW_NUMBER() OVER (ORDER BY dc_acc_id DESC) AS row
						,dc_acc_id
						from cm_receive_tran_dtl where cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id  and f_total_amt > 0  
					) a  where a.row =  4) as dc_acc_id4

						,( select f_total_amt from  (select 
						ROW_NUMBER() OVER (ORDER BY dc_acc_id DESC) AS row
						,f_total_amt
						from cm_receive_tran_dtl where cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id  and f_total_amt > 0  
					) a  where a.row =  5) as f_total_amt5
					,( select dc_acc_id from  (select 
						ROW_NUMBER() OVER (ORDER BY dc_acc_id DESC) AS row
						,dc_acc_id
						from cm_receive_tran_dtl where cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id  and f_total_amt > 0  
					) a  where a.row =  5) as dc_acc_id5

					,SUBSTRING(CONVERT(VARCHAR, d.d_doc_date, 120), 6, 2) AS month_receive
					,d.gl_tran_hdr_id
					,d.c_doc_ref1
					from ({$sqlTempTable}) a
					left join cm_receive_tran_hdr d on a.cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id
					left join  " . DB_CENTER . "cm_receive_type c on d.cm_receive_type_id = c.cm_receive_type_id
					--inner join  " . DB_CENTER . "cm_map_cost_rec_dtl e on b.cm_map_cost_rec_dtl_id = e.cm_map_cost_rec_dtl_id 
					--inner join  " . DB_CENTER . "cm_map_acc_receive f on f.cm_map_acc_receive_id = b.cm_map_acc_receive_id 
					inner join  " . DB_CENTER . "cm_cost_address g on g.dc_cost_id = d.dc_cost_id 
					where a.row > ? AND a.row <= ?
				order by a.row";
		}
	} else if ($_REQUEST["i_group"] == 0 && $_REQUEST["i_fund"] == 1) {
		$sqlTempTable = "
				SELECT 
					ROW_NUMBER() OVER (ORDER BY a.cm_receive_tran_hdr_id DESC) AS row
					,a.cm_receive_tran_hdr_id
				FROM " . DB_FM_NMU . "cm_receive_tran_hdr a
				LEFT JOIN " . DB_NMU_EIS . "po_working_hdr pwh ON a.po_working_hdr_id = pwh.po_working_hdr_id AND pwh.i_enable = 1
				left join (select b.c_code_per , a.i_enable from " . DB_NMU_EIS . "po_working_hdr a 
										inner join " . DB_NMU_EIS . "po_working_begin_hdr b on a.po_working_hdr_id = b.po_working_hdr_id
										where b.i_working_type = '9' and a.i_enable = '1' and b.c_code_per is not null
							) b on b.c_code_per  = a.c_code
				where 1=1 and a.i_type_menu_sub in (1,2) and a.c_code is not null and a.i_enable = 1
				{$con}";

		$sqlMain = "
				select 	
					a.row 
					,d.cm_receive_tran_hdr_id
					,d.cm_receive_type_id
					,d.pr_tor_id
					,(select aa.pr_c_code from " . DB_NMU_ERP . "vw_pr_po aa where d.pr_tor_id = aa.pr_tor_id) as pr_tor
					,c.i_type
					,d.c_code AS c_code_per
					,(select aa.c_name from  " . DB_CENTER . "cm_receive_type aa where aa.i_type = c.i_type and aa.i_enable = '1') as cm_receive_type
					,d.cm_receive_book_type_id
					,(select aa.c_name from " . DB_CREDITOR_DATA . "cm_receive_book_type aa where aa.cm_receive_book_type_id = d.cm_receive_book_type_id) as cm_receive_book_type
					,d.dc_creditor_type_receive_id
					,(select aa.c_name from " . DB_CREDITOR_DATA . "dc_creditor_type_receive aa where aa.dc_creditor_type_receive_id = d.dc_creditor_type_receive_id) as dc_creditor_type_receive_name
					,CASE
						WHEN d.dc_creditor_type_receive_id = 1 THEN d.c_other_name 
						WHEN d.dc_creditor_type_receive_id = 2 THEN (select top 1 aa.c_name from " . DB_CREDITOR_DATA . "dc_creditor aa where aa.dc_creditor_id = d.dc_creditor_id) 
						WHEN d.dc_creditor_type_receive_id = 3 THEN (select aa.c_title +' '+ aa.c_name from  " . DB_FM_NMU . "dc_emp aa where aa.dc_emp_id = d.dc_emp_id) 
						ELSE (SELECT cc.c_name FROM dc_cost cc where cc.dc_cost_id = d.dc_cost_receive_id)
					END AS name_receive
					,d.dc_emp_id
					,d.c_other_name
					,d.dc_cost_receive_id
					,d.pr_dc_cost_id
					,d.dc_creditor_id
					,d.dc_creditor_id AS dc_creditor_transfer_id
					,d.dc_bank_acc_company_id
					,(select aa.c_code from " . DB_FM_NMU . "dc_bank_acc_company aa where aa.dc_bank_acc_company_id = d.dc_bank_acc_company_id) as dc_bank_acc_company_code
					,(select aa.c_name from " . DB_FM_NMU . "dc_bank_acc_company aa where aa.dc_bank_acc_company_id = d.dc_bank_acc_company_id) as dc_bank_acc_company
					--,d.dc_expense_budget_type_id
					--,(select aa.c_name from  " . DB_FM_NMU . "dc_expense_budget_type aa where aa.dc_expense_budget_type_id = d.dc_expense_budget_type_id) as dc_expense_budget_type
					,CASE d.dc_cost_id 
						WHEN '4' THEN '36' /*กองทุนพัฒนาคณะแพทยฯ*/
						WHEN '5' THEN '37' /*กองทุนพัฒนาอาคารสถานที่ฯ*/
						ELSE NULL
					END AS dc_expense_budget_type_id
					,STUFF(STUFF(STUFF(CAST(d.c_tax_value AS VARCHAR(13)),4, 0, '-'),6, 0, '-'),14, 0, '-') AS c_tax_value_t
					,SUBSTRING(d.c_tax_value, 4, 1) AS c_tax_value_str
					,d.c_tax_value
					,d.dc_bank_id
					,(select aa.name_shot from " . DB_FM_NMU . "dc_bank aa where aa.dc_bank_id = d.dc_bank_id) as dc_bank
					,(select aa.name_shot from " . DB_FM_NMU . "dc_bank aa where aa.dc_bank_id = (select aa.dc_bank_id from " . DB_FM_NMU . "dc_bank_acc_company aa where aa.dc_bank_acc_company_id = d.dc_bank_acc_company_id)) as dc_bank_name
					,d.dc_bank_branch_id
					,(select aa.c_name from " . DB_FM_NMU . "dc_bank_branch aa where aa.dc_bank_branch_id = d.dc_bank_branch_id) as dc_bank_branch
					,d.c_chq_no
					,d.c_credit_no
					,d.c_paper_no
					,CONVERT(VARCHAR, d.d_doc_date, 120) AS d_doc_date
					,CONVERT(VARCHAR, d.d_chq_date, 120) AS d_chq_date
					,d.c_yyyy_mm
					,LEFT(d.c_code_rcp,1) as c_is_gen_code
					,'36' as dc_cost_id
					,'77' as dc_cost_acc_id
					,(SELECT cc.c_name FROM " . DB_FM_NMU . "dc_cost cc where cc.dc_cost_id = d.dc_cost_id) as dc_cost_name
					,d.i_type_menu
					,d.i_type_menu_sub
					,d.c_comment
					,d.c_budget_year AS i_budget_year
					,d.c_budget_year AS i_budget_year_overlap
					,d.i_type_year
					,d.c_receive_book_number
					,d.c_receive_number
					,d.c_receive_i_rank
					,d.c_contract_number
					,d.f_guarantee_contract
					,d.c_guarantee_doc 
					,d.i_enable
					,d.c_project_doc as c_title
					,(SELECT cc.dc_title_id FROM " . DB_FM_NMU . "dc_user bb 
					inner join  " . DB_FM_NMU . "dc_emp cc on bb.dc_emp_id = cc.dc_emp_id
					where bb.dc_user_id = d.dc_user_create_id) as dc_title_id
					,(SELECT cc.c_title +' '+ cc.c_name FROM dc_user bb 
					inner join  " . DB_FM_NMU . "dc_emp cc on bb.dc_emp_id = cc.dc_emp_id
					where bb.dc_user_id = d.dc_user_create_id) as dc_user_create_full
					,(SELECT cc.c_name FROM dc_user bb 
					inner join  " . DB_FM_NMU . "dc_emp cc on bb.dc_emp_id = cc.dc_emp_id
					where bb.dc_user_id = d.dc_user_create_id) as dc_user_create_name
					,(SELECT cc.c_name FROM  " . DB_FM_NMU . "dc_cost cc where cc.dc_cost_id = d.dc_user_create_cost_id) as dc_user_create_cost
					,d.dc_user_create_id
					,d.dc_user_create_cost_id
					,CONVERT(VARCHAR, d.d_create, 120) AS d_create
					,(SELECT bb.c_full_name FROM  " . DB_FM_NMU . "dc_user bb where bb.dc_user_id = d.dc_user_update_id) as dc_user_update
					,(SELECT cc.c_name FROM  " . DB_FM_NMU . "dc_cost cc where cc.dc_cost_id = d.dc_user_update_cost_id) as dc_user_update_cost
					,d.dc_user_update_id
					,d.dc_user_update_cost_id
					,CONVERT(VARCHAR, d.d_update, 120) AS d_update
					,(select dd.c_name from  " . DB_CENTER . "dc_position dd where d.dc_position_id = dd.dc_position_id) as dc_position
					,d.i_type_receive
					,CONVERT(VARCHAR, d.d_contact_date, 120) AS d_contact_date
					,CONVERT(VARCHAR, d.d_due_date, 120) AS d_due_date
						,( select f_total_amt from  (select 
						ROW_NUMBER() OVER (ORDER BY dc_acc_id DESC) AS row
						,f_total_amt
						from " . DB_FM_NMU . "cm_receive_tran_dtl where cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id  and f_total_amt > 0  
					) a  where a.row =  1) as f_total_amt1
						,( select dc_acc_id from  (select 
						ROW_NUMBER() OVER (ORDER BY dc_acc_id DESC) AS row
						,dc_acc_id
						from " . DB_FM_NMU . "cm_receive_tran_dtl where cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id  and f_total_amt > 0  
					) a  where a.row =  1) as dc_acc_id1

					,( select f_total_amt from  (select 
						ROW_NUMBER() OVER (ORDER BY dc_acc_id DESC) AS row
						,f_total_amt
						from " . DB_FM_NMU . "cm_receive_tran_dtl where cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id  and f_total_amt > 0  
					) a  where a.row =  2) as f_total_amt2
					,( select dc_acc_id from  (select 
						ROW_NUMBER() OVER (ORDER BY dc_acc_id DESC) AS row
						,dc_acc_id
						from " . DB_FM_NMU . "cm_receive_tran_dtl where cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id  and f_total_amt > 0  
					) a  where a.row =  2) as dc_acc_id2

						,( select f_total_amt from  (select 
						ROW_NUMBER() OVER (ORDER BY dc_acc_id DESC) AS row
						,f_total_amt
						from " . DB_FM_NMU . "cm_receive_tran_dtl where cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id  and f_total_amt > 0  
					) a  where a.row =  3) as f_total_amt3
					,( select dc_acc_id from  (select 
						ROW_NUMBER() OVER (ORDER BY dc_acc_id DESC) AS row
						,dc_acc_id
						from " . DB_FM_NMU . "cm_receive_tran_dtl where cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id  and f_total_amt > 0  
					) a  where a.row =  3) as dc_acc_id3

						,( select f_total_amt from  (select 
						ROW_NUMBER() OVER (ORDER BY dc_acc_id DESC) AS row
						,f_total_amt
						from " . DB_FM_NMU . "cm_receive_tran_dtl where cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id  and f_total_amt > 0  
					) a  where a.row =  4) as f_total_amt4
					,( select dc_acc_id from  (select 
						ROW_NUMBER() OVER (ORDER BY dc_acc_id DESC) AS row
						,dc_acc_id
						from " . DB_FM_NMU . "cm_receive_tran_dtl where cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id  and f_total_amt > 0  
					) a  where a.row =  4) as dc_acc_id4

						,( select f_total_amt from  (select 
						ROW_NUMBER() OVER (ORDER BY dc_acc_id DESC) AS row
						,f_total_amt
						from " . DB_FM_NMU . "cm_receive_tran_dtl where cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id  and f_total_amt > 0  
					) a  where a.row =  5) as f_total_amt5
					,( select dc_acc_id from  (select 
						ROW_NUMBER() OVER (ORDER BY dc_acc_id DESC) AS row
						,dc_acc_id
						from " . DB_FM_NMU . "cm_receive_tran_dtl where cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id  and f_total_amt > 0  
					) a  where a.row =  5) as dc_acc_id5
					,SUBSTRING(CONVERT(VARCHAR, d.d_doc_date, 120), 6, 2) AS month_receive
					,(select SUM(aa.f_total_amt) from " . DB_FM_NMU . "cm_receive_tran_dtl aa where aa.cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id ) AS sum_receive_dtl
					,d.gl_tran_hdr_id
					,d.c_doc_ref1
					from ({$sqlTempTable}) a
					left join  " . DB_FM_NMU . "cm_receive_tran_hdr d on a.cm_receive_tran_hdr_id = d.cm_receive_tran_hdr_id
					--left join  " . DB_FM_NMU . "cm_receive_tran_dtl b on d.cm_receive_tran_hdr_id = b.cm_receive_tran_hdr_id
					left join  " . DB_CENTER . "cm_receive_type c on d.cm_receive_type_id = c.cm_receive_type_id
					--inner join  " . DB_CENTER . "cm_map_cost_rec_dtl e on b.cm_map_cost_rec_dtl_id = e.cm_map_cost_rec_dtl_id 
					--inner join  " . DB_CENTER . "cm_map_acc_receive f on f.cm_map_acc_receive_id = b.cm_map_acc_receive_id 
					inner join  " . DB_CENTER . "cm_cost_address g on g.dc_cost_id = d.dc_cost_id 
					where a.row > ? AND a.row <= ?
				order by a.row";
	}

	/** test **/
	// UPDATE fi_br_hdr SET f_money_remain=f_money_br,i_status_br=6,i_close=1,c_contract='ส.0767000001',d_pay='2024-09-24'

	$arrParam	= array();
	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	if (@$_REQUEST["show_sql"]) {
		/******echo sql******/
		$sql = str_replace('?', '#-#', $sqlMain);
		foreach ($arrParam as $fld => $value) {
			$sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
		}
		echo $sql;
		exit;
		/********************/
	}
	$i_type_menu_sub = array(1 => "รับเงินค้ำประกัน", 2 => "รับเงินรับฝาก", 99 => "รายการรวมใบเสร็จ");

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$c_title_full = "";
	while ($row = $db->Fetch($stmt)) {
		if ($row["c_doc_ref1"] != NULL) {
			$c_title_full = $row["c_title"] . " เลขที่ใบเสร็จเดิม " . $row["c_doc_ref1"];
		} else {
			$c_title_full = $row["c_title"];
		}
		// $d_debt_date_arr = explode("-", $row["d_chk_last_date"]);
		$temp = array(
			"no"                            =>  	$row["row"],
			// "i_sys"                     	=>	$row["i_sys"],
			"cm_receive_tran_hdr_id"        =>	@$row["cm_receive_tran_hdr_id"],

			"cm_group_receive_for_wm_hdr_id"   => @$row["cm_group_receive_for_wm_hdr_id"],

			"pr_tor_id"       				=>	$row["pr_tor_id"],
			"pr_tor"       					=>	$row["pr_tor"],

			"c_heading"                    	=>	$c_title_full,
			"c_title"                    	=>	$c_title_full,
			"c_comment"                     =>	$c_title_full,
			"c_doc_ref1"                	=> ($row["c_doc_ref1"] == NULL) ? "-" : $row["c_doc_ref1"],

			"pr_dc_cost_id"                 =>	$row["pr_dc_cost_id"],
			"dc_cost_id"                    =>	$_REQUEST["i_fund"] == 1 ? $row["dc_cost_id"] : $_REQUEST["dc_cost_id"],
			"dc_cost_acc_id"                =>	$row["dc_cost_acc_id"],
			"name_receive"                  =>	$row["name_receive"],
			"c_other_name"                	=>	$row["c_other_name"],
			"dc_emp_id"                		=>	$row["dc_emp_id"],
			"dc_creditor_id"                =>	$row["dc_creditor_id"],
			"c_qty"     					=>	1,
			"dc_creditor_transfer_id"    	=>	$row["dc_creditor_transfer_id"],
			"c_code_per"                    =>	$row["c_code_per"],
			"d_audit_date"                  =>  $date->extDateBuddha(date("Y-m-d")),
			"d_doc_date"                    =>  $date->extDateBuddha(date("Y-m-d")),
			"i_type_menu_sub"               =>	$i_type_menu_sub[$row["i_type_menu_sub"]],
			"i_enable"                      =>	1,
			"i_delete"                      =>	2,
			"dc_user_send_id"               =>	0,
			"po_emp_id"                     =>	$_SESSION["user_name"],
			"i_budget_year"                 =>	$BudgetYear = (date('m') > 9) ? date('Y') + 1 : date('Y'),
			"i_budget_year_overlap"         =>	$row["i_budget_year_overlap"],
			"i_working_type"                =>	9,
			"dc_expense_budget_type_id"     =>	$row["dc_expense_budget_type_id"],
			"c_code_invoice"				=>	"-",
			// "f_money_br"                 => 	$row["sum_receive_dtl"],
			// "f_money_clear_by_cash"      => 	$row["sum_receive_dtl"],
			// "f_money_clear_by_doc"       => 	$row["sum_receive_dtl"],
			// "f_money_remain"             => 	$row["sum_receive_dtl"],
			// "f_working_sum"              => 	$row["sum_receive_dtl"],
			"f_total"						=> 	$row["sum_receive_dtl"],
			"f_change"						=> 	$row["sum_receive_dtl"],
			"f_inv"							=> 	$row["sum_receive_dtl"],
			"f_inv_vat"						=> 	$row["sum_receive_dtl"],
			"f_pay"							=> 	$row["sum_receive_dtl"],
			"c_contract_number"             => 	$row["c_contract_number"],
			"f_guarantee_contract"          => 	$row["f_guarantee_contract"],
			// "doc_request_normal1_id"     => 	$row["doc_request_normal1_id"],
			// "doc_request_normal2_id"     => 	$row["doc_request_normal2_id"],
			// "doc_request_normal3_id"     => 	$row["doc_request_normal3_id"],
			// "doc_request_normal4_id"     => 	$row["doc_request_normal4_id"],
			// "doc_request_normal5_id"     => 	$row["doc_request_normal5_id"],
			// "doc_request_add1_id"        => 	$row["doc_request_add1_id"],

			"gl_tran_hdr_id"             	=> $row["gl_tran_hdr_id"],
			// "c_code_debt"                => $row["c_code_debt"],
			// "d_debt_date"                => $row["gl_tran_hdr_id"] ? $date->extDateBuddha($row["d_chk_last_date"]) : '',
			"c_debt_month"               	=> $row["month_receive"],
			"c_debt_year"                	=> $row["i_budget_year_overlap"],


			"dc_acc_id1"					=> $row["dc_acc_id1"],
			"dc_acc_id2"					=> $row["dc_acc_id2"],
			"dc_acc_id3"					=> $row["dc_acc_id3"],
			"dc_acc_id4"					=> $row["dc_acc_id4"],
			"dc_acc_id5"					=> $row["dc_acc_id5"],

			"c_acc_month1"					=> $row["month_receive"],
			"c_acc_month2"					=> $row["month_receive"],
			"c_acc_month3"					=> $row["month_receive"],
			"c_acc_month4"					=> $row["month_receive"],
			"c_acc_month5"					=> $row["month_receive"],

			"f_acc_inv1"					=> $row["f_total_amt1"],
			"f_acc_inv2"					=> $row["f_total_amt2"],
			"f_acc_inv3"					=> $row["f_total_amt3"],
			"f_acc_inv4"					=> $row["f_total_amt4"],
			"f_acc_inv5"					=> $row["f_total_amt5"],

			"f_acc_vat1"					=> 0.00,
			"f_acc_vat2"					=> 0.00,
			"f_acc_vat3"					=> 0.00,
			"f_acc_vat4"					=> 0.00,
			"f_acc_vat5"					=> 0.00,

			"f_acc_inv_vat1"				=> $row["f_total_amt1"],
			"f_acc_inv_vat2"				=> $row["f_total_amt2"],
			"f_acc_inv_vat3"				=> $row["f_total_amt3"],
			"f_acc_inv_vat4"				=> $row["f_total_amt4"],
			"f_acc_inv_vat5"				=> $row["f_total_amt5"],


			// "dc_acc_id2"					=> 2,
			// "c_acc_month2"				=> '03',
			// "f_acc_inv2"					=> 2000.00,
			// "f_acc_vat2"					=> 20.00,
			// "f_acc_inv_vat2"				=> 2020.00,
		);
		${$root}[] = $temp;
	}
	$sqlCount   = "select count(*) as totalCount from ({$sqlTempTable}) a";
	$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
	echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
} else if ($_REQUEST["type"] == "select_data_wt") {
	###################
	$mode   = @$_REQUEST["mode"] ?? null;
	$filter = @$_REQUEST["filter"] ?? null;
	$value  = @$_REQUEST["value"] ?? null;
	$i_read = @$_REQUEST["i_read"] ?? null;
	###################
	$root   = "data";
	$data   = array();
	###################
	$limit  = @$_REQUEST["limit"] ?? null;
	$dir    = @$_REQUEST["dir"] ?? null;
	$sort   = @$_REQUEST["sort"] ?? null;
	$start  = @$_REQUEST["start"] ?? null;

	function get($a)
	{
		return $a ?? 0;
	}

	if (!get($start)) {
		$start = 0;
	}
	if (!get($limit)) {
		$limit = 20;
	} else {
		$limit = ($limit + $start);
	}
	if (!get($dir)) {
		$dir = "DESC";
	}
	if (!get($sort)) {
		$sort = " s.c_code";
	}
	if (@$_REQUEST["c_type_code"] == '' || @$_REQUEST["c_type_code"] == "TF") {
		#################################
		$keyin = "";
		$arrParam      = array();
		$arrCountParam = array();

		if ($mode == "SEARCH") {
			if ($_REQUEST["filter"] == "c_code_per") {
				$con .= "\n AND a.c_code LIKE '%" . $_REQUEST["value"] . "%' ";
			} else if ($_REQUEST["filter"] == "c_title") {
				$con .= "\n AND b.c_name LIKE '%" . $_REQUEST["value"] . "%' ";
			}
		}


		// if (@$_REQUEST["dc_cost_acc_id"]) {
		// 	$con .= " AND a.dc_cost_department_id = " . $_REQUEST["dc_cost_acc_id"];
		// }
		if (@$_REQUEST["i_budget_year"]) {
			$con .= " AND a.i_year = " . $_REQUEST["i_budget_year"];
		}
		if (@$_REQUEST["dc_cost_acc_id"]) {
			$con .= " AND a.dc_cost_acc_id = " . $_REQUEST["dc_cost_acc_id"];
		}

		$sqlTempTable = "
			SELECT 
				ROW_NUMBER() OVER (ORDER BY a.bg_budget_hdr_change_id DESC) AS row
				,a.bg_budget_hdr_change_id
			FROM bg_budget_hdr_change a
			LEFT JOIN po_working_dtl pwd ON pwd.bg_budget_hdr_change_id = a.bg_budget_hdr_change_id AND (SELECT TOP 1 ISNULL(aa.i_enable,0) FROM po_working_hdr aa WHERE aa.po_working_hdr_id = pwd.po_working_hdr_id) = 1
			WHERE i_enable = 1
				AND a.i_main = 1
				AND a.i_title in (3,4)
				AND isnull(pwd.po_working_hdr_id,0) = 0
				{$con}
			";

		$sqlMain = "
			select 
				temp.row 
				,null as i_sys
				,a.bg_budget_hdr_change_id
				,a.c_comment as c_heading 
				,a.dc_cost_acc_id as dc_cost_acc_id
				,(select c_name from " . DB_CENTER . "dc_cost aa where aa.dc_cost_id = a.dc_cost_acc_id) as dc_cost_acc_name
				,a.dc_cost_id as dc_cost_id 
				,a.c_code as c_code_per
				,a.i_year as i_budget_year
				,a.i_year as i_budget_year_overlap
				,convert(varchar(10), brdhc.d_approve ,120) as d_approve
				,a.dc_expense_budget_type_id
				,(select top 1 c_name from " . DB_CENTER . "dc_expense_budget_type aa where aa.dc_expense_budget_type_id = a.dc_expense_budget_type_id) as dc_expense_budget_type_name
				,(select top 1 bg_expense_id from bg_budget_dtl_change aa where aa.bg_budget_hdr_change_id = a.bg_budget_hdr_change_id and i_type = 1 ) as bg_expense_id
				,1 as c_qty
				,(select top 1 sum(f_change) from bg_budget_dtl_change aa where aa.bg_budget_hdr_change_id = a.bg_budget_hdr_change_id and i_type = 1 ) as f_change
				,(select top 1 sum(f_change) from bg_budget_dtl_change aa where aa.bg_budget_hdr_change_id = a.bg_budget_hdr_change_id and i_type = 1 ) as f_inv
				,(select top 1 sum(f_change) from bg_budget_dtl_change aa where aa.bg_budget_hdr_change_id = a.bg_budget_hdr_change_id and i_type = 1 ) as f_inv_vat
				,(select top 1 sum(f_change) from bg_budget_dtl_change aa where aa.bg_budget_hdr_change_id = a.bg_budget_hdr_change_id and i_type = 1 ) as f_pay
	
				,(select TOP 1 (select top 1 dc_cost_acc_id from " . DB_CENTER . "dc_cost aaa where aaa.dc_cost_id = aa.dc_cost_id) from bg_budget_dtl_change aa where aa.bg_budget_hdr_change_id = a.bg_budget_hdr_change_id and aa.i_type = 1 order by aa.dc_cost_id desc) as dc_cost_acc_type1
				,(select TOP 1 (select top 1 dc_cost_acc_id from " . DB_CENTER . "dc_cost aaa where aaa.dc_cost_id = aa.dc_cost_id) from bg_budget_dtl_change aa where aa.bg_budget_hdr_change_id = a.bg_budget_hdr_change_id and aa.i_type = 2 order by aa.dc_cost_id desc) as dc_cost_acc_type2
			from ({$sqlTempTable})temp
			inner join bg_budget_hdr_change a on a. bg_budget_hdr_change_id = temp.bg_budget_hdr_change_id 
			left join bg_reg_budget_hdr_change brdhc on brdhc.bg_reg_budget_hdr_change_id = a.bg_reg_budget_hdr_change_id
			WHERE temp.row > ? AND temp.row <= ?
			order by temp.row 
		";

		/** test **/
		// update fi_br_hdr set i_status_br=6 , i_close=1 , c_contract ='TEST00001' ,d_pay = '2024-09-19'

		$arrParam	= array();
		$arrParam[]	= $start;
		$arrParam[]	= $limit;

		if (@$_REQUEST["show_sql"]) {
			/******echo sql******/
			$sql = str_replace('?', '#-#', $sqlMain);
			foreach ($arrParam as $fld => $value) {
				$sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
			}
			echo $sql;
			exit;
			/********************/
		}
		$stmt = $db->QueryParam($sqlMain, $arrParam);

		$sql_cr10 = "SELECT dc_cost_id, dc_creditor_id FROM " . DB_NMU . "dc_creditor WHERE dc_tax_customer_id = 10";
		$stmt_cr10 = $db->QueryParam($sql_cr10, array());
		$cr10 = array();
		while ($row_cr10 = $db->Fetch($stmt_cr10)) {
			$cr10[$row_cr10["dc_cost_id"]] = $row_cr10["dc_creditor_id"];
		}
		while ($row = $db->Fetch($stmt)) {
			// $d_debt_date_arr = explode("-", $row["d_chk_last_date"]);
			$temp = array(
				"no"                            =>  $row["row"],
				"i_sys"                         =>	$row["i_sys"],
				"bg_budget_hdr_change_id"       =>	$row["bg_budget_hdr_change_id"],
				"c_heading"                     =>	$row["c_heading"],
				"c_comment"                     =>	$row["c_heading"],
				"dc_cost_acc_id"                =>	$row["dc_cost_acc_id"],
				"dc_cost_acc_name"              =>	$row["dc_cost_acc_name"],
				"dc_cost_id"                    =>	$row["dc_cost_id"],
				"c_code_per"                    =>	$row["c_code_per"],
				"i_budget_year"                 =>	$row["i_budget_year"],
				"i_budget_year_overlap"         =>	$row["i_budget_year_overlap"],
				"dc_expense_budget_type_id"     =>	$row["dc_expense_budget_type_id"],
				"dc_expense_budget_type_name"   =>  $row["dc_expense_budget_type_name"],
				"bg_expense_id"     			=>	$row["bg_expense_id"],
				"c_qty"     					=>	$row["c_qty"],
				"i_working_type"                =>	10,
				"po_emp_id"						=>	$_SESSION["user_name"],
				"c_code_invoice"				=>	"-",
				// "dc_creditor_id"                =>	$row["dc_creditor_id"],
				// "dc_creditor_transfer_id"       =>	$row["dc_creditor_transfer_id"],
				// "c_booking"                     =>	$row["c_booking"],
				"d_audit_date"                  =>  $date->extDateBuddha($row["d_approve"]),
				"d_doc_date"                    =>  $date->extDateBuddha(date("Y-m-d")),
				"i_enable"                      =>	1,
				"i_delete"                      =>	2,
				"f_total"						=> $row["f_change"],
				"f_change"						=> $row["f_change"],
				"f_inv"							=> $row["f_change"],
				"f_inv_vat"						=> $row["f_change"],
				"f_pay"							=> $row["f_change"],

				"dc_cost_acc_type1"				=> $row["dc_cost_acc_type1"],
				"dc_cost_acc_type2"				=> $row["dc_cost_acc_type2"],
				"dc_creditor_id"				=> $cr10[$row["dc_cost_acc_type2"]],
				"dc_creditor_transfer_id"		=> $cr10[$row["dc_cost_acc_type2"]],


				// "dc_acc_id1"					=> 1,
				// "c_acc_month1"				=> '02',
				// "f_acc_inv1"					=> 1000.00,
				// "f_acc_vat1"					=> 10.00,
				// "f_acc_inv_vat1"				=> 1010.00,

				// "dc_acc_id2"					=> 2,
				// "c_acc_month2"				=> '03',
				// "f_acc_inv2"					=> 2000.00,
				// "f_acc_vat2"					=> 20.00,
				// "f_acc_inv_vat2"				=> 2020.00,

				// "gl_tran_hdr_id"                => $row["gl_tran_hdr_id"],
				// "c_code_debt"                   => $row["c_code_debt"],
				// "d_debt_date"                   => $row["gl_tran_hdr_id"] ? $date->extDateBuddha($row["d_chk_last_date"]) : '',
				// "c_debt_month"                  => $d_debt_date_arr[1],
				// "c_debt_year"                   => $d_debt_date_arr[0],
			);
			${$root}[] = $temp;
		}
		$sqlCount   = "select count(*) as totalCount from ({$sqlTempTable}) a";
		$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
	} else if (@$_REQUEST["c_type_code"] == "RGA") {
		#################################
		$keyin = "";
		$arrParam      = array();
		$arrCountParam = array();

		if ($mode == "SEARCH") {
			if ($_REQUEST["filter"] == "c_code_per") {
				$con .= "\n AND a.c_code LIKE '%" . $_REQUEST["value"] . "%' ";
			} else if ($_REQUEST["filter"] == "c_title") {
				$con .= "\n AND b.c_name LIKE '%" . $_REQUEST["value"] . "%' ";
			}
		}


		// if (@$_REQUEST["dc_cost_acc_id"]) {
		// 	$con .= " AND a.dc_cost_department_id = " . $_REQUEST["dc_cost_acc_id"];
		// }
		if (@$_REQUEST["i_budget_year"]) {
			$con .= " AND b.c_budget_year = " . $_REQUEST["i_budget_year"];
		}
		if (@$_REQUEST["dc_cost_acc_id"]) {
			$con .= " AND c.dc_cost_acc_id = " . $_REQUEST["dc_cost_acc_id"];
		}

		$sqlTempTable = "
			select 
				ROW_NUMBER() OVER (ORDER BY a.rg_allocate_to_cost_dtl_id DESC) AS row
				,a.rg_allocate_to_cost_dtl_id
				,a.rg_allocate_to_cost_hdr_id
				,a.dc_cost_id
				,a.c_code_send
				,a.f_total_amt
				,a.po_working_hdr_id 
			from rg_allocate_to_cost_dtl a
			inner join rg_allocate_to_cost_hdr b on a.rg_allocate_to_cost_hdr_id = b.rg_allocate_to_cost_hdr_id
			inner join " . DB_CENTER . "dc_cost c on c.dc_cost_id = b.dc_cost_id
			LEFT JOIN po_working_dtl pwd ON pwd.rg_allocate_to_cost_dtl_id = a.rg_allocate_to_cost_dtl_id AND (SELECT TOP 1 ISNULL(aa.i_enable,0) FROM po_working_hdr aa WHERE aa.po_working_hdr_id = pwd.po_working_hdr_id) = 1
			where b.i_enable = '1' and isnull(pwd.po_working_hdr_id,0) = 0
				{$con}
			";

		$sqlMain = "
			select 
				a.row
				,null as i_sys
				,a.rg_allocate_to_cost_dtl_id 
				,a.f_total_amt
				,a.po_working_hdr_id 
				,b.c_comment as c_heading 
				,c2.dc_cost_acc_id as dc_cost_acc_id
				,c1.c_name as dc_cost_acc_name
				,b.dc_cost_id as dc_cost_id 
				,a.c_code_send as c_code_per
				,b.c_budget_year as i_budget_year
				,b.c_budget_year as i_budget_year_overlap
				,convert(varchar, b.d_allocate, 120) as d_allocate
				,48 as dc_expense_budget_type_id
				,(select top 1 c_name from " . DB_CENTER . "dc_expense_budget_type aa where aa.dc_expense_budget_type_id = 48 ) as dc_expense_budget_type_name
				,null as bg_expense_id
				,1 as c_qty
				,isnull(a.f_total_amt,0) as f_total_amt
			from ({$sqlTempTable})a
			inner join rg_allocate_to_cost_hdr b on a.rg_allocate_to_cost_hdr_id = b.rg_allocate_to_cost_hdr_id
			inner join " . DB_CENTER . "dc_cost c1 on c1.dc_cost_id = a.dc_cost_id
			inner join " . DB_CENTER . "dc_cost c2 on c2.dc_cost_id = b.dc_cost_id
			WHERE a.row > ? AND a.row <= ?
			order by a.row 
		";

		/** test **/
		// update fi_br_hdr set i_status_br=6 , i_close=1 , c_contract ='TEST00001' ,d_pay = '2024-09-19'

		$arrParam	= array();
		$arrParam[]	= $start;
		$arrParam[]	= $limit;

		if (@$_REQUEST["show_sql"]) {
			/******echo sql******/
			$sql = str_replace('?', '#-#', $sqlMain);
			foreach ($arrParam as $fld => $value) {
				$sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
			}
			echo $sql;
			exit;
			/********************/
		}
		$stmt = $db->QueryParam($sqlMain, $arrParam);

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"                                => 	$row["row"],
				"i_sys"                             =>	$row["i_sys"],
				"rg_allocate_to_cost_dtl_id"        =>	$row["rg_allocate_to_cost_dtl_id"],
				"c_heading"                         =>	$row["c_heading"],
				"c_comment"                         =>	$row["c_heading"],
				"dc_cost_acc_id"                    =>	$row["dc_cost_acc_id"],
				"dc_cost_acc_name"                  =>	$row["dc_cost_acc_name"],
				"dc_cost_id"                        =>	$row["dc_cost_id"],
				"c_code_per"                        =>	$row["c_code_per"],
				"i_budget_year"                     =>	$row["i_budget_year"],
				"i_budget_year_overlap"             =>	$row["i_budget_year_overlap"],
				"dc_expense_budget_type_id"         =>	$row["dc_expense_budget_type_id"],
				"dc_expense_budget_type_name"       =>  $row["dc_expense_budget_type_name"],
				"bg_expense_id"                     =>	$row["bg_expense_id"],
				"c_qty"                             =>	$row["c_qty"],
				"i_working_type"                    =>	10,
				"po_emp_id"                         =>	$_SESSION["user_name"],
				"c_code_invoice"                    =>	"-",
				// "dc_creditor_id"                    =>	$row["dc_creditor_id"],
				// "dc_creditor_transfer_id"           =>	$row["dc_creditor_transfer_id"],
				// "c_booking"                         =>	$row["c_booking"],
				"d_audit_date"                      =>  $date->extDateBuddha($row["d_allocate"]),
				"d_doc_date"                        =>  $date->extDateBuddha(date("Y-m-d")),
				"i_enable"                          =>	1,
				"i_delete"                          =>	2,
				"f_total"                           => $row["f_total_amt"],
				"f_change"                          => $row["f_total_amt"],
				"f_inv"                             => $row["f_total_amt"],
				"f_inv_vat"                         => $row["f_total_amt"],
				"f_pay"                             => $row["f_total_amt"],


			);
			${$root}[] = $temp;
		}
		$sqlCount   = "select count(*) as totalCount from ({$sqlTempTable}) a";
		$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
	}

	echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
} else if ($_REQUEST["type"] == "po_working_begin_item") {
	$arrParam = array();
	$sql = "
		SET NOCOUNT ON
		SELECT 
			po_working_begin_item_id
			,po_working_begin_hdr_id
			,c_month
			,dc_acc_id
			,(SELECT TOP 1 aa.c_code + ' : ' + aa.c_name  FROM " . DB_CENTER . "dc_acc aa WHERE aa.dc_acc_id = a.dc_acc_id) AS dc_acc_name
			,ISNULL(f_inv,0) as f_inv 
			,ISNULL(f_vat,0) as f_vat 
			,ISNULL(f_inv_vat,0) as f_inv_vat  
		FROM po_working_begin_item a
		WHERE po_working_begin_hdr_id = ?
		ORDER BY po_working_begin_item_id";
	$arrParam[] = $_REQUEST['po_working_begin_hdr_id'];

	if (@$_REQUEST["show_sql"]) {
		/******echo sql******/
		$sql = str_replace('?', '#-#', $sql);
		foreach ($arrParam as $fld => $value) {
			$sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
		}
		echo $sql;
		exit;
		/********************/
	}
	$stmt = $db->QueryParam($sql, $arrParam);
	if ($stmt) {
		$no = 0;
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"                            =>	++$no,
				"id"                            =>	$row["po_working_begin_item_id"],
				"c_month"                       =>	$row["c_month"],
				"dc_acc_id"                     =>	$row["dc_acc_id"],
				"dc_acc_name"                   =>	$row["dc_acc_name"],
				"f_inv"                         =>	$row["f_inv"],
				"f_vat"                         =>	$row["f_vat"],
				"f_inv_vat"                     =>	$row["f_inv_vat"],
			);
			${$root}[] = $temp;
		}
	}
	echo json_encode(array("debug" => true, $root => ${$root}));
} else if ($_REQUEST["type"] == "f_income_total") {
	$arrParam = array();
	$sql = "
		SET NOCOUNT ON
		DECLARE @TEMP_SP_BG_BUDGET_SUM TABLE (
			i_year bigint
			,dc_expense_budget_type_id bigint
			,dc_cost_acc_id bigint
			,dc_cost_id bigint
			,bg_expense_id bigint
			,f_plan_begin decimal(18,2)
			,f_period_begin decimal(18,2)
			,f_income_begin decimal(18,2)
			,f_plan_transfer decimal(18,2) 
			,f_period_transfer decimal(18,2)
			,f_income_transfer decimal(18,2)
			,f_reserve_budget decimal(18,2)
			,f_reserve_budget_long decimal(18,2)
			,f_reserve_budget_income decimal(18,2)
			,f_reserve_budget_income_Finish decimal(18,2)
			,f_reserve_period decimal(18,2)
			,f_reserve_periodincome decimal(18,2)
			,f_reserve_periodfinish decimal(18,2)
			,f_reserve_income decimal(18,2)
			,f_reserve_income_Finish decimal(18,2)
			,f_total_all decimal(18,2)
			,f_return_all decimal(18,2)
			,f_total_cut decimal(18,2)
			,f_return_cut decimal(18,2)
			,f_total_pay decimal(18,2)
			,f_return_pay decimal(18,2)
			,f_plan_total decimal(18,2)
			,f_plan_cut_total decimal(18,2)
			,f_plan_pay_total decimal(18,2)
			,f_period_total decimal(18,2)
			,f_period_cut_total decimal(18,2)
			,f_period_pay_total decimal(18,2)
			,f_income_total decimal(18,2)
			,f_income_cut_total decimal(18,2)
			,f_income_pay_total decimal(18,2)
		); 
		INSERT INTO @TEMP_SP_BG_BUDGET_SUM EXEC SP_BG_BUDGET_SUM ?

		SET NOCOUNT ON
		SELECT isnull(SUM(f_income_total),0) as f_income_total
		FROM @TEMP_SP_BG_BUDGET_SUM 
		WHERE dc_expense_budget_type_id = ?
			AND bg_expense_id = ?
			AND dc_cost_id = ?
		
	";

	$arrParam[] = $_REQUEST['i_budget_year'];
	$arrParam[] = $_REQUEST['dc_expense_budget_type_id'];
	$arrParam[] = $_REQUEST['bg_expense_id'];
	$arrParam[] = $_REQUEST['dc_cost_id'];

	$stmt = $db->QueryParam($sql, $arrParam);
	if ($stmt) {
		$no = 0;
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"f_income_total"     =>	$row["f_income_total"],
			);
			${$root}[] = $temp;
		}
	}
	echo json_encode(array("debug" => true, $root => ${$root}));
}
