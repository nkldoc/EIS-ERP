<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

###################
$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();
############################################################################################################
###########################################
$mode = $_REQUEST["mode"] ?? null;
$filter = $_REQUEST["filter"] ?? null;
$value = $_REQUEST["value"] ?? null;
$i_read = $_REQUEST["i_read"] ?? null;

$root = "data";
$data = array();

$limit = $_REQUEST["limit"] ?? null;
$dir = $_REQUEST["dir"] ?? null;
$sort = $_REQUEST["sort"] ?? null;
$start = $_REQUEST["start"] ?? null;

function get($a) {
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
$arrParam = array();
$arrCountParam = array();
$con = null;
$conDtl = null;
$wh = null;

$type = $_REQUEST["type"] ?? null;
$act = $_REQUEST["act"] ?? null;
$tor_type_show = $_REQUEST['tor_type_show'] ?? null;
$i_post = $_REQUEST['i_post'] ?? null;

$i_purchase = array(0 => '', 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
if ($type == "Sp_Tor_Edit_Bg") {
    // $type_menu = $_REQUEST['type_menu'] ?? null;
    if ($mode == "SEARCH") {

		if ($_REQUEST["value"] != "") {

			if ($_REQUEST["filter"] == "c_code") {
				$con	.= " AND b." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
			} else if ($_REQUEST["filter"] == "c_code_po") {
				$con	.= " AND c.c_code LIKE '%" . $_REQUEST["value"] . "%' ";
			} else if ($_REQUEST["filter"] == "tor_id") {
				$con	.= " AND a." . $_REQUEST["tor_id"] . " = '" . $_REQUEST["value"] . "' ";
			} else if ($_REQUEST["filter"] == "sql") {
				$con	.= $_REQUEST["value"];
			}
		}
		// if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
		// 	$con .= " AND b.dc_expense_budget_type_id=" . $_REQUEST["dc_expense_budget_type_id"];
		// }
		// if ($_REQUEST["i_budget_year"] > 0) {
		// 	$con .= " AND b.i_budget_year = " . $_REQUEST["i_budget_year"];
		// }
		// if ($_REQUEST["i_budget_year_overlap"] > 0) {
		// 	$con .= " AND b.i_budget_year_overlap = " . $_REQUEST["i_budget_year_overlap"];
		// }
		// if ($_REQUEST["dc_cost_id"] > 0) {
		// 	$con .= " AND b.dc_cost_id = " . $_REQUEST["dc_cost_id"];
		// }
		// if ($_REQUEST["i_status"] > 0) {
		// 	$con .= " AND a.i_status_last = " . $_REQUEST["i_status"];
		// }
		// if ($_REQUEST["i_booking"] > 0) {
		// 	$con .= " AND b.c_booking IS NOT NULL";
		// }
		// if ($_REQUEST["i_sav_by_sys"] > 0) {
		// 	$con .= " AND b.i_sav_by_sys = " . $_REQUEST["i_sav_by_sys"];
		// }
		// if ($_REQUEST["i_enable"] > 0) {
		// 	$con .= " AND a.i_enable = " . $_REQUEST["i_enable"];
		// }
		// if ($_REQUEST["i_pdf"] > 0) {
		// 	$con .= " AND ISNULL(pdf.c_file_pdf_hdr,'') != ''";
		// }
		// if ($_REQUEST["checkbox_date"] == 1) {
		// 	$con .= " AND CONVERT(date, a.d_create) BETWEEN '{$_REQUEST["date_start"]}' AND '{$_REQUEST["date_end"]}'";
		// }
		// if ($_REQUEST["checkbox_tax_personal"] == 1) {
		// 	$con .= " AND isnull(bh.f_per_tax_personal,0) > 0 ";
		// }
	} else {
		$con .= '' ;  //" AND b.i_budget_year = " . $_REQUEST["i_budget_year"];
	}

	$sqlMain = "
		SET NOCOUNT ON;
		--SELECT * INTO #tem_vw_po_working_pdf FROM vw_po_working_pdf
		SELECT
			ROW_NUMBER() OVER (ORDER BY a.tor_id ) AS numrow
			,a.tor_id
		INTO #TemData
		FROM dbo.sp_tor a
        INNER JOIN dbo.sp_tor b ON a.tor_id = b.tor_id
        LEFT JOIN sp_tor_contract c on a.tor_id = c.sp_tor_id 
			where   a.i_step_bg = 1
            {$con};
		
		SELECT
			a.numrow , 
			a.tor_id  ,
            b.i_enabled ,
            b.c_code ,
            c.c_code as c_code_po ,
			isnull(b.c_name,c.c_name)as c_name , 
			(select c_name from dc_expense_budget_type where dc_expense_budget_type_id = b.dc_expense_budget_type_id ) as dc_expense_budget_type_pr  ,
			(select c_name from dc_expense_budget_type where dc_expense_budget_type_id = c.dc_expense_budget_type_id ) as dc_expense_budget_type_po  ,
			(select c_name from NMU.DBO.bg_expense where bg_expense_id = b.po_expense_id ) as po_expense_pr  , 
			(select c_name from sp_emp where sp_emp_id  = b.sp_emp_id ) as sp_emp_pr ,
			(select c_name from sp_emp where sp_emp_id  = c.sp_emp_id ) as sp_emp_po ,
            b.sp_emp_id,
            b.d_doc_ref, 
            b.d_create ,
            b.i_is_upload , 
            b.i_type_bg , 
            b.i_is_notor , 
            b.dc_expense_budget_type_id  as dc_expense_budget_type_id1  ,
            b.dc_expense_budget_type2_id as dc_expense_budget_type_id2 ,
            b.dc_expense_budget_type3_id as dc_expense_budget_type_id3 ,
            
            b.f_type_amt  as f_type_amt1 , 
            b.f_type2_amt as f_type_amt2 , 
            b.f_type3_amt as f_type_amt3 ,
            b.i_pr_type1  , 
            b.i_pr_type2  , 
            b.i_pr_type3  , 

            (select top 1 dc_expense_budget_type_id from sp_tor_bg_log where sp_Tor_id =b.tor_id and  i_number_bg = 1 and i_edit = 1  ) as dc_expense_budget_type_edit_id1 ,
            (select top 1 dc_expense_budget_type_id from sp_tor_bg_log where sp_Tor_id =b.tor_id and  i_number_bg = 2 and i_edit = 1  ) as dc_expense_budget_type_edit_id2 ,
            (select top 1 dc_expense_budget_type_id from sp_tor_bg_log where sp_Tor_id =b.tor_id and  i_number_bg = 3 and i_edit = 1  ) as dc_expense_budget_type_edit_id3 ,
            b.i_amount_bg ,
            (select top 1 c_comment from sp_tor_bg_log where sp_Tor_id =b.tor_id and  i_number_bg = 1 and i_edit = 1 ORDER BY d_create desc   ) as c_comment_edit1 ,
            (select top 1 f_total_amt from sp_tor_bg_log where sp_Tor_id =b.tor_id and  i_number_bg = 1 and i_edit = 1  ) as f_total_amt_edit1 ,
            (select top 1 f_total_amt from sp_tor_bg_log where sp_Tor_id =b.tor_id and  i_number_bg = 2 and i_edit = 1  ) as f_total_amt_edit2 ,
            (select top 1 f_total_amt from sp_tor_bg_log where sp_Tor_id =b.tor_id and  i_number_bg = 3 and i_edit = 1  ) as f_total_amt_edit3 ,
            b.f_type_amt  as f_type_amt1, 
            b.f_type2_amt as f_type_amt2, 
            b.f_type3_amt as f_type_amt3, 
            (select top 1 po_expense_id from sp_tor_bg_log where sp_Tor_id =b.tor_id and  i_number_bg = 1 and i_edit = 1  ) as po_expense_edit_id1 ,
            (select top 1 po_expense_id from sp_tor_bg_log where sp_Tor_id =b.tor_id and  i_number_bg = 2 and i_edit = 1  ) as po_expense_edit_id2 ,
            (select top 1 po_expense_id from sp_tor_bg_log where sp_Tor_id =b.tor_id and  i_number_bg = 3 and i_edit = 1  ) as po_expense_edit_id3 ,
            b.po_expense_id  ,
            b.i_pr_year,
            b.i_yyyy ,
            b.sp_emp_id ,
            c.sp_emp_id  as sp_emp_po_id,
            b.dc_cost_id ,
            b.dc_cost2_id , 
            b.i_purchase , 
			b.d_doc_ref as d_doc_ref_pr ,
            b.f_total_amt as f_total , 
            CONVERT(VARCHAR, c.d_doc_date, 120) AS d_doc_date ,
            CONVERT(VARCHAR, c.d_due_date, 120) AS d_due_date ,

            (select top 1 sp_tor_dtl_id from sp_tor_dtl where sp_tor_id = b.tor_id ) as sp_tor_dtl_id ,
            (select top 1 f_unit_price from sp_tor_dtl where  sp_tor_id  = b.tor_id  ) as f_total_dtl , 
			(select top 1 po_expense_id from sp_tor_dtl where  sp_tor_id  = b.tor_id  ) as po_expense_dtl_id , 
			(select top 1 dc_bg_budget_type_id from sp_tor_dtl where  sp_tor_id  = b.tor_id  ) as dc_bg_budget_type_id , 
            (select top 1 dc_creditor_id from sp_tor_bidder_hdr where sp_tor_id = b.tor_id ) as dc_creditor_bidder_hdr ,
            (select top 1 dc_creditor_id from sp_tor_bidder_dtl where sp_tor_id = b.tor_id ) as dc_creditor_bidder_dtl ,
            (select top 1 dc_creditor_id from sp_tor_victory where sp_tor_id = b.tor_id ) as dc_creditor_victory ,
            c.dc_creditor_id ,
            b.bg_reserve_money1_id as bg_reserve_money1,
            b.bg_reserve_money2_id as bg_reserve_money2,
            b.bg_reserve_money3_id as bg_reserve_money3,
            (select top 1 i_edit from sp_tor_bg_log where a.tor_id = sp_tor_id and  i_number_bg = 1 ORDER BY d_create  desc ) as sp_bg_edit1,
            (select top 1 i_edit from sp_tor_bg_log where a.tor_id = sp_tor_id and  i_number_bg = 2 ORDER BY d_create  desc ) as sp_bg_edit2,
            (select top 1 i_edit from sp_tor_bg_log where a.tor_id = sp_tor_id and  i_number_bg = 3 ORDER BY d_create  desc ) as sp_bg_edit3,

            (select top 1 sp_tor_bg_log_id from sp_tor_bg_log where a.tor_id = sp_tor_id and  i_number_bg = 1 ORDER BY d_create  desc ) as sp_tor_bg_log_id1,
            (select top 1 sp_tor_bg_log_id from sp_tor_bg_log where a.tor_id = sp_tor_id and  i_number_bg = 2 ORDER BY d_create  desc ) as sp_tor_bg_log_id2,
            (select top 1 sp_tor_bg_log_id from sp_tor_bg_log where a.tor_id = sp_tor_id and  i_number_bg = 3 ORDER BY d_create  desc ) as sp_tor_bg_log_id3,
            
            (select top 1 isnull(bg_reserve_money_id,0) from nmu.dbo.bg_reserve_money where pr_id = b.tor_id and i_reserve = 1 and i_enable = 1 and i_sys = 1 ) as bg_reserve_money_i_reserve1 , 
            (select top 1 isnull(bg_reserve_money_id,0) from nmu.dbo.bg_reserve_money where pr_id = b.tor_id and i_reserve = 2 and i_enable = 1 and i_sys = 1 ) as bg_reserve_money_i_reserve2 , 
            (select top 1 isnull(bg_reserve_money_id,0) from nmu.dbo.bg_reserve_money where pr_id = b.tor_id and i_reserve = 3 and i_enable = 1 and i_sys = 1 ) as bg_reserve_money_i_reserve3 , 
            (select top 1 i_pr_type from sp_tor_bg_log where sp_Tor_id =b.tor_id and  i_number_bg = 1 and i_edit = 1  ) as i_pr_type_edit1 ,
            (select top 1 i_pr_type from sp_tor_bg_log where sp_Tor_id =b.tor_id and  i_number_bg = 2 and i_edit = 1  ) as i_pr_type_edit2 ,
            (select top 1 i_pr_type from sp_tor_bg_log where sp_Tor_id =b.tor_id and  i_number_bg = 3 and i_edit = 1  ) as i_pr_type_edit3 ,
            (select top 1 isnull(dc_budget_type_id,0) from nmu.dbo.bg_reserve_money where pr_id = b.tor_id and i_reserve = 1 and i_enable = 1 and i_sys = 1  ) as dc_budget_type_bg_id , 
            (select top 1 isnull(bg_expense_id,0) from nmu.dbo.bg_reserve_money where pr_id = b.tor_id and i_reserve = 1 and i_enable = 1 and i_sys = 1 ) as bg_expense_bg_id , 
            (select top 1 isnull(dc_budget_type_id,0) from nmu.dbo.bg_reserve_money where pr_id = b.tor_id and i_reserve = 2 and i_enable = 1 and i_sys = 1  ) as dc_budget_type_bg_id2 , 
            (select top 1 isnull(bg_expense_id,0) from nmu.dbo.bg_reserve_money where pr_id = b.tor_id and i_reserve = 2 and i_enable = 1 and i_sys = 1 ) as bg_expense_bg_id2 , 

            (select top 1 isnull(f_amt,0) from nmu.dbo.bg_reserve_money where pr_id = b.tor_id and i_reserve = 1 and i_enable = 1 and i_sys = 1 ) as f_amt_reserve1 , 
            (select top 1 isnull(f_amt,0) from nmu.dbo.bg_reserve_money where pr_id = b.tor_id and i_reserve = 2 and i_enable = 1 and i_sys = 1 ) as f_amt_reserve2 , 
            (select top 1 i_year from nmu.dbo.bg_reserve_money where pr_id = b.tor_id and i_reserve = 1 and i_enable = 1 and i_sys = 1 ) as  i_year_reserve1 , 
            (select top 1 i_year from nmu.dbo.bg_reserve_money where pr_id = b.tor_id and i_reserve = 2 and i_enable = 1 and i_sys = 1 ) as  i_year_reserve2 , 
            (select top 1 i_pr_type from nmu.dbo.bg_reserve_money where pr_id = b.tor_id and i_reserve = 1 and i_enable = 1 and i_sys = 1 ) as  i_pr_type_reserve1 , 
            (select top 1 i_pr_type from nmu.dbo.bg_reserve_money where pr_id = b.tor_id and i_reserve = 2 and i_enable = 1 and i_sys = 1 ) as  i_pr_type_reserve2 , 
            (select top 1 FORMAT(d_create,'dd MMM yyyy','th-TH') from nmu.dbo.bg_reserve_money where pr_id = b.tor_id and i_reserve = 1 and i_enable = 1 and i_sys = 1 ) as  d_create_reserve1 , 
            (select top 1 FORMAT(d_create,'dd MMM yyyy','th-TH') from nmu.dbo.bg_reserve_money where pr_id = b.tor_id and i_reserve = 2 and i_enable = 1 and i_sys = 1 ) as  d_create_reserve2 , 
            FORMAT(c.d_doc_date,'dd MMM yyyy','th-TH') as d_doc_th ,
            FORMAT(c.d_due_date,'dd MMM yyyy','th-TH') as d_due_th ,
            (SELECT TOP 1 c_name FROM dbo.sp_type_status WHERE sp_type_status_id = b.tor_type_id)  AS c_type_name , 
            b.tor_type_id , 
            (SELECT TOP 1 c_name FROM dbo.sp_status_hdr WHERE sp_status_hdr_id = b.tor_status_id)  AS c_name_status ,
            c.sp_tor_contract_id 
		FROM #TemData a
			INNER JOIN dbo.sp_tor b ON a.tor_id = b.tor_id
            LEFT JOIN sp_tor_contract c on a.tor_id = c.sp_tor_id 			
		WHERE a.numrow > ? AND a.numrow <= ? 
		ORDER BY a.numrow;
	
		SELECT COUNT(*) AS rowCounts FROM #TemData;";
	$arrParam[]	= $start;
	$arrParam[]	= $limit;	
$stmt = $db->QueryParam($sqlMain, $arrParam);
// /******echo sql******/
// $sql = (@$sqlMain) ? $sqlMain : $sql;
// $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());

// $sql = str_replace('?', '#-#', $sql);
// foreach ($arr as $fld => $value) {
//  $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
// }
// echo $sql; exit;
// /********************/
// (select top 1 i_edit from sp_tor_bg_log where a.tor_id = sp_tor_id  ORDER BY d_create  desc ) as sp_bg_edit


    $i = $start + 1;
    while ($row = $db->Fetch($stmt)) {
        $i_type_bg = null;
        $i_type_bg = array(0 => 'ออกเลขก่อน', 1 => 'ปกติ', 2 => 'โครงการต่อเนื่อง'
                    , 3 => 'ย่อยโครงการต่อเนื่อง' , 4 => 'กันเหลื่อม', 5 => 'จองเงินข้ามไปทำเบิก'  
                    , 10 => 'ขอออกเลขในระบบก่อน', 9 => 'จองเงินตรวจรับ'
        );
        $i_is_notor = null ;
        $i_is_notor = array(0=> '' , 1 => 'ขอออกเลขในระบบก่อน') ;
        $i_purchase = array(0=> '' , 1 => 'จัดซื้อ' , 2 => 'จัดจ้าง' , 3 => 'จัดจเช่า'  ) ;
        $temp = array(
            "no"                                            => $i++,
            "id"                                            => intval($row["tor_id"]),
            "c_name"                                        => $row["c_name"],
            "sp_tor_dtl_id"                                 => $row["sp_tor_dtl_id"],
            "po_expense_pr"                                 => $row["po_expense_pr"],
            "sp_emp_pr"                                     => $row["sp_emp_pr"],
            "sp_emp_po"                                     => $row["sp_emp_po"],
            "sp_emp_id"                                     => $row["sp_emp_id"],
            "sp_emp_po_id"                                  => $row["sp_emp_po_id"],
            "dc_expense_budget_type_pr"                     => $row["dc_expense_budget_type_pr"],
            "dc_expense_budget_type_po"                     => $row["dc_expense_budget_type_po"],
            "i_enable"                                      => $row["i_enabled"],
            "i_enabled"                                     => $row["i_enabled"],
            "c_code"                                        => $row["c_code"],
            "sp_tor_contract_id"                            => intval($row["sp_tor_contract_id"]),
            "c_code_po"                                     => $row["c_code_po"],
            "i_is_upload"                                   => $row["i_is_upload"],
            "c_name_status"                                 => $row["c_name_status"],
            "c_type_name"                                   => $row["c_type_name"],
            "tor_type_id"                                   => $row["tor_type_id"],
            "d_doc_ref"                                     => $row["d_doc_ref"],
            "c_comment_edit1"                               => $row["c_comment_edit1"],
            "sp_bg_edit1"                                   => $row["sp_bg_edit1"],
            "sp_bg_edit2"                                   => $row["sp_bg_edit2"],
            "sp_bg_edit3"                                   => $row["sp_bg_edit3"],
            // "d_update"                                    => ($row["d_update"] != "") ? $date->extDateBuddha($row["d_update"]) : "",
            "d_doc_th"              		                => $row["d_doc_th"],
            "d_due_th"              		                => $row["d_due_th"],
            "i_is_notor"                                    => intval($row["i_is_notor"]),
            "i_type_bg"                                     => $i_type_bg[$row["i_type_bg"]]  , //  $i_is_notor[$row["i_is_notor"]]  ,
            "i_amount_bg"                                   => intval($row["i_amount_bg"]),
            "dc_expense_budget_type_id1"                    => intval($row["dc_expense_budget_type_id1"]),
            "dc_expense_budget_type_id2"                    => intval($row["dc_expense_budget_type_id2"]),
            "dc_expense_budget_type_id3"                    => intval($row["dc_expense_budget_type_id3"]),
            "i_yyyy"                                        => $row["i_yyyy"],
            "i_pr_type1"                                    => $row["i_pr_type1"],
            "i_pr_type2"                                    => $row["i_pr_type2"],
            "i_pr_type3"                                    => $row["i_pr_type3"],
            "bg_reserve_money1"                             => $row["bg_reserve_money1"],
            "bg_reserve_money2"                             => $row["bg_reserve_money2"],
            "bg_reserve_money3"                             => $row["bg_reserve_money3"],
            "sp_tor_bg_log_id1"                             => $row["sp_tor_bg_log_id1"],
            "sp_tor_bg_log_id2"                             => $row["sp_tor_bg_log_id2"],
            "sp_tor_bg_log_id3"                             => $row["sp_tor_bg_log_id3"],
            "i_pr_type_edit1"                               => $row["i_pr_type_edit1"],
            "i_pr_type_edit2"                               => $row["i_pr_type_edit2"],
            "i_pr_type_edit3"                               => $row["i_pr_type_edit3"],
            "f_total_amt_edit1"                             => number_format($row["f_total_amt_edit1"], 2),
            "f_total_amt_edit2"                             => number_format($row["f_total_amt_edit2"], 2),
            "f_total_amt_edit3"                             => number_format($row["f_total_amt_edit3"], 2),
            "f_type_amt1"                                   => number_format($row["f_type_amt1"], 2),
            "f_type_amt2"                                   => number_format($row["f_type_amt2"], 2),
            "f_type_amt3"                                   => number_format($row["f_type_amt3"], 2),
            "dc_expense_budget_type_edit_id1"               => $row["dc_expense_budget_type_edit_id1"],
            "dc_expense_budget_type_edit_id2"               => $row["dc_expense_budget_type_edit_id2"],
            "dc_expense_budget_type_edit_id3"               => $row["dc_expense_budget_type_edit_id3"],
            "po_expense_edit_id1"                           => $row["po_expense_edit_id1"],
            "po_expense_edit_id2"                           => $row["po_expense_edit_id2"],
            "po_expense_edit_id3"                           => $row["po_expense_edit_id3"],
            "po_expense_id1"                                 => intval($row["po_expense_id"]),
            "c_yyyy"                                        => intval($row["i_yyyy"] + 543),
            "i_yyyy"                                        => $row["i_yyyy"],
            "c_pr_year"                                     => intval($row["i_pr_year"] + 543),
            "i_pr_year"                                     => $row["i_pr_year"],
            "dc_cost_id"                                    => $row["dc_cost_id"],
            "dc_cost2_id"                                   => $row["dc_cost2_id"],
            "dc_creditor_id"                                => $row["dc_creditor_id"],
            "dc_creditor_bidder_hdr"                        => $row["dc_creditor_bidder_hdr"],
            "dc_creditor_bidder_dtl"                        => $row["dc_creditor_bidder_dtl"],
            "dc_creditor_victory"                           => $row["dc_creditor_victory"],
            "f_total"                                       => number_format($row["f_total"], 2),

            "f_total_dtl"                                   => number_format($row["f_total_dtl"], 2),
            "dc_bg_budget_type_id"                          => $row["dc_bg_budget_type_id"],
            "po_expense_dtl_id"                             => $row["po_expense_dtl_id"],
            "dc_creditor_victory"                           => $row["dc_creditor_victory"],
            "i_purchase"                                    => $row["i_purchase"],
            "bg_reserve_money_i_reserve1"                   => $row["bg_reserve_money_i_reserve1"],
            "bg_reserve_money_i_reserve2"                   => $row["bg_reserve_money_i_reserve2"],
            "bg_reserve_money_i_reserve3"                   => $row["bg_reserve_money_i_reserve3"],
            "dc_budget_type_bg_id"                          => $row["dc_budget_type_bg_id"],
            "bg_expense_bg_id"                              => $row["bg_expense_bg_id"],
            "dc_budget_type_bg_id2"                         => $row["dc_budget_type_bg_id2"],
            "bg_expense_bg_id2"                             => $row["bg_expense_bg_id2"],
            "d_create_reserve1"                             => $row["d_create_reserve1"],
            "d_create_reserve2"                             => $row["d_create_reserve2"],
            "i_year_reserve1"                               => $row["i_year_reserve1"],
            "i_year_reserve2"                               => $row["i_year_reserve2"],
            "i_pr_type_reserve1"                            => $row["i_pr_type_reserve1"],
            "i_pr_type_reserve2"                            => $row["i_pr_type_reserve2"],
            "f_amt_reserve1"                                => number_format($row["f_amt_reserve1"], 2),
            "f_amt_reserve2"                                => number_format($row["f_amt_reserve2"], 2),
            "d_doc_date"                                    => ($row["d_doc_date"] != "") ? $date->extDateBuddha($row["d_doc_date"]) : "",
            "d_due_date"                                    => ($row["d_due_date"] != "") ? $date->extDateBuddha($row["d_due_date"]) : "",
            "d_doc_ref_pr"                                  => $row["d_doc_ref_pr"],
        );
        ${$root}[] = $temp;
    }
    $db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);
    
	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
    exit();
} else if ($type == "po_working_dtl1") {
	$sqlMain = "
		SET NOCOUNT ON;
		--SELECT * INTO #tem_vw_po_working_pdf FROM vw_po_working_pdf
		SELECT
			ROW_NUMBER() OVER (ORDER BY a.tor_id DESC) AS numrow
			,a.tor_id
		INTO #TemData
		FROM dbo.sp_tor a
			{$con};
		
		SELECT
			a.numrow , 
			a.tor_id  ,
            b.i_enabled ,
            b.c_code ,
            c.c_code as c_code_po ,
			isnull(b.c_name,c.c_name)as c_name , 
			(select c_name from dc_expense_budget_type where dc_expense_budget_type_id = b.dc_expense_budget_type_id ) as dc_expense_budget_type_pr  ,
			(select c_name from dc_expense_budget_type where dc_expense_budget_type_id = c.dc_expense_budget_type_id ) as dc_expense_budget_type_po  ,
			(select c_name from NMU.DBO.bg_expense where bg_expense_id = b.po_expense_id ) as po_expense_pr  , 
			(select c_name from sp_emp where sp_emp_id  = b.sp_emp_id ) as sp_emp_pr ,
			(select c_name from sp_emp where sp_emp_id  = c.sp_emp_id ) as sp_emp_po ,
            b.sp_emp_id,
            b.d_doc_ref, 
            b.i_enabled ,
            b.d_create ,
            b.i_is_upload , 
            b.i_type_bg , 
            b.i_is_notor , 
            FORMAT(c.d_doc_date,'dd MMM yyyy','th-TH') as d_doc_th ,
            FORMAT(c.d_due_date,'dd MMM yyyy','th-TH') as d_due_th ,
            (SELECT TOP 1 c_name FROM dbo.sp_type_status WHERE sp_type_status_id = b.tor_type_id)  AS c_type_name , 
            (SELECT TOP 1 c_name FROM dbo.sp_status_hdr WHERE sp_status_hdr_id = b.tor_status_id)  AS c_name_status ,
            c.sp_tor_contract_id
		FROM #TemData a
			INNER JOIN dbo.sp_tor b ON a.tor_id = b.tor_id
            LEFT JOIN sp_tor_contract c on a.tor_id = c.sp_tor_id 			
		WHERE a.numrow > ? AND a.numrow <= ?
		ORDER BY a.numrow;
	
		SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;
    $stmt = $db->QueryParam($sqlMain, $arrParam);

    $i = $start + 1;
    
    while ($row = $db->Fetch($stmt)) {
        $i_type_bg = null;
        $i_type_bg = array(0 => '', 1 => 'ปกติ', 2 => 'โครงการต่อเนื่อง'
                    , 3 => 'ย่อยโครงการต่อเนื่อง' , 4 => 'กันเหลื่อม', 5 => 'จองเงินข้ามไปทำเบิก'  
                    , 10 => 'ขอออกเลขในระบบก่อน'
        );
        $i_is_notor = null ;
        $i_is_notor = array(0=> '' , 1 => 'ขอออกเลขในระบบก่อน') ;
        $temp = array(
            "no" => $i++,
            "id" => intval($row["tor_id"]),
            "c_name" => $row["c_name"],
            "po_expense_pr" => $row["po_expense_pr"],
            "sp_emp_pr" => $row["sp_emp_pr"],
            "sp_emp_po" => $row["sp_emp_po"],
            "dc_expense_budget_type_pr" => $row["dc_expense_budget_type_pr"],
            "dc_expense_budget_type_po" => $row["dc_expense_budget_type_po"],
            "i_enable" => $row["i_enabled"],
            "c_code" => $row["c_code"],
            "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
            "c_code_po" => $row["c_code_po"],
            "i_is_upload" => $row["i_is_upload"],
            "c_name_status" => $row["c_name_status"],
            "c_type_name" => $row["c_type_name"],
            "d_doc_ref" => $row["d_doc_ref"],
            // "d_update"                      => ($row["d_update"] != "") ? $date->extDateBuddha($row["d_update"]) : "",
            "d_doc_th"              		=> $row["d_doc_th"],
            "d_due_th"              		=> $row["d_due_th"],
            "i_is_notor" => intval($row["i_is_notor"]),
            "i_type_bg" => $i_type_bg[$row["i_type_bg"]] ?  :  $i_is_notor[$row["i_is_notor"]]  ,
        );
        ${$root}[] = $temp;
    }
    $db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);
    
	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
}else if ($type == "po_period") {
    
    $arrParam[] = $_REQUEST['sp_tor_contract'] ?? null;
    $arrParam[] = $_REQUEST['id'] ?? null;

    // $ = $_REQUEST['type_menu'] ?? null;
    $sqlMain = "
	SET NOCOUNT ON;
		SELECT
			ROW_NUMBER() OVER (ORDER BY a.sp_tor_hdr_period_id ) AS numrow
			,a.sp_tor_hdr_period_id 
		INTO #TemData
		FROM dbo.sp_tor_hdr_period a
        where a.sp_tor_contract_id =  ?
		
		SELECT
			a.numrow , 
            b.sp_tor_hdr_period_id , 
            (select c_code from sp_check_period_hdr where sp_tor_hdr_period_id = b.sp_tor_hdr_period_id ) as c_code  , 
			(select c_arrive_code from sp_check_period_hdr where sp_tor_hdr_period_id = b.sp_tor_hdr_period_id ) as c_arrive_code  , 
			(select c_overlap from sp_check_period_hdr where sp_tor_hdr_period_id = b.sp_tor_hdr_period_id ) as c_overlap  , 
			(select c_billing_code from sp_check_period_hdr where sp_tor_hdr_period_id = b.sp_tor_hdr_period_id ) as c_billing_code  , 
			(select CONVERT(VARCHAR, d_doc_arrive_dt, 120) from sp_check_period_hdr where sp_tor_hdr_period_id = b.sp_tor_hdr_period_id ) as d_doc_arrive_dt  , 
			b.i_period , 
			b.i_enabled , 
			b.f_total_amt , 
			b.sp_emp_id , 
			b.dc_expense_budget_type_id ,
			b.dc_creditor_id,
            (select top 1 sp_check_period_hdr_id from sp_check_period_hdr where sp_tor_hdr_period_id = b.sp_tor_hdr_period_id ) as sp_check_period_hdr_id  , 
            (select top 1 sp_check_period_dtl_id from sp_check_period_dtl where sp_tor_hdr_period_id = b.sp_tor_hdr_period_id ) as sp_check_period_dtl_id  , 
            (select top 1 sp_tor_dtl_period_id from sp_tor_dtl_period where sp_tor_hdr_period_id = b.sp_tor_hdr_period_id ) as sp_tor_dtl_period_id  , 
			b.sp_tor_contract_id 

		FROM #TemData a
			INNER JOIN dbo.sp_tor_hdr_period   b ON a.sp_tor_hdr_period_id = b.sp_tor_hdr_period_id
		ORDER BY a.numrow;
	
		SELECT COUNT(*) AS rowCounts FROM #TemData;";
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    
    while ($row = $db->Fetch($stmt)) {
        $i_type_bg = null;
        $i_type_bg = array(0 => '', 1 => 'ปกติ', 2 => 'โครงการต่อเนื่อง'
                    , 3 => 'ย่อยโครงการต่อเนื่อง' , 4 => 'กันเหลื่อม', 5 => 'จองเงินข้ามไปทำเบิก'  
                    , 10 => 'ขอออกเลขในระบบก่อน'
        );
        // $sp  = "<b style='color:#F43217'>" . $row["c_name"] . "</b>"  ;

        $i_is_notor = null ;
        $i_is_notor = array(0=> '' , 1 => 'ขอออกเลขในระบบก่อน') ;
        $i_enabled = array(0=> "" , 1 => "<b style='color:#6495ED'>ใช้งาน</b>", 2 => "<b style='color:#F43217'>ไม่ใช้งาน</b>") ;
        $temp = array(
            "no"                                        => $i++,
            "id"                                        => intval($row["sp_tor_hdr_period_id"]),
            "sp_check_period_hdr_id"                    => intval($row["sp_check_period_hdr_id"]),
            "sp_check_period_dtl_id"                    => intval($row["sp_check_period_dtl_id"]),
            "sp_tor_dtl_period_id"                      => intval($row["sp_tor_dtl_period_id"]),
            "c_code"                                    => $row["c_code"],
            "c_arrive_code"                             => $row["c_arrive_code"],
            "c_overlap"                                 => $row["c_overlap"],
            "c_billing_code"                            => $row["c_billing_code"],
            "i_enabled"                                 => $i_enabled[$row["i_enabled"]],
            "d_doc_arrive_dt"                           => ($row["d_doc_arrive_dt"] != "") ? $date->extDateBuddha($row["d_doc_arrive_dt"]) : "",

        );
        ${$root}[] = $temp;
    }
    $db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);
	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
    exit();
}