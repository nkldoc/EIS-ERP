<?php

include_once './../../../conf/config.php';
include_once './../../../access/checkSession.php';
include_once './../../../lib/database/DatabaseServer.php';
include_once './../../../lib/database/apiUtil.php';
include_once './../../../lib/date/i_date.class.php';
include_once './../../../lib/mon/mon.class.php';
include_once './../../conf/configAR.php';
include_once './../../api/class/ar.status.class.php';

###################
$db = new DatabaseServer();
$so = new StatusOrder($db);
$mon = new mon(); // convert floatval
$date = new i_date();
$util = new apiUtil();

############################################################################################################
$mode = @$_REQUEST["mode"];
$filter = @$_REQUEST["filter"];
$value = @$_REQUEST["value"];
$i_read = @$_REQUEST["i_read"];
###################
$table = "ar_bill_invoice_dtl";
$root = "data";
$data = array();
###################
$limit = @$_REQUEST["limit"];
$dir = @$_REQUEST["dir"];
$sort = @$_REQUEST["sort"];
$start = @$_REQUEST["start"];
###################
if (!$util->get($start)) {
    $start = 0;
}
if (!$util->get($limit)) {
    $limit = 20;
} else {
    $limit = ($limit + $start);
}
if (!$util->get($dir)) {
    $dir = "DESC";
}
if (!$util->get($sort)) {
    $sort = "{$table}.ar_bill_invoice_dtl_id";
}
###################

if (isset($_REQUEST['mode']) && $_REQUEST['mode'] == "GETDATA") {

    $wh = (isset($_REQUEST['mn']) && $_REQUEST['mn'] == 'editbl') ? "" : " and isnull(i_enable,2) = 1"; //show i_enable= 0

    $sqlTempTable = "select {$table}.ar_bill_invoice_dtl_id
,{$table}.ar_bill_invoice_hdr_id
,{$table}.ar_condi_pay_hdr_id
,{$table}.ar_condi_pay_dtl_id
,{$table}.ar_so_dtl_id
,{$table}.ar_dtl_period_onair_id
,{$table}.pj_send_period_dtl_id
,{$table}.pj_period_budget_id
,{$table}.ar_so_activi_id
,{$table}.dc_wht_tax_id
,{$table}.f_total_cost
,{$table}.f_new_net_cost
,{$table}.f_req_amt
,{$table}.f_req_total_amt
,{$table}.f_disc_com
,{$table}.f_disc_cash
,{$table}.f_net_disc_comm_amt
,{$table}.f_net_cost
,{$table}.f_wht_amt
,{$table}.f_left_cost
,{$table}.f_balance_amt
,{$table}.i_parent_edit_id
,{$table}.i_is_adjust
,{$table}.i_is_receive
,{$table}.c_comment

, ROW_NUMBER() OVER (ORDER BY {$table}.ar_bill_invoice_dtl_id asc) as row FROM dbo.{$table}
where {$table}.ar_bill_invoice_hdr_id=?";
    $arrParam = array($_REQUEST['id']);
    $arrCountParam = array($_REQUEST['id']);

    $sqlMain = "select
		b.f_quan as f_quan,
		c.c_name as c_name,
		a.* from ({$sqlTempTable}) a
	inner join dbo.ar_so_dtl b on b.ar_so_dtl_id=a.ar_so_dtl_id
	inner join dbo.dc_product c on c.dc_product_id=b.dc_product_id
					";

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    $type = array("0" => "สปอตโฆษณา", "1" => "รายการแถม/จิงเกิ้ล");

    $f1 = null;
    $f2 = null;
    $f3 = null;
    $f4 = null;
    $f5 = null;
    $f6 = null;
    $f_bal = null;
    $soBill = 0;

    while ($row = $db->Fetch($stmt)) {
//
        $billing = $so->dtlBilling($row["{$table}_id"]);
        $soBill += $billing;
        $temp = array("no" => ($i++), //accessData =view
            "id" => $row["{$table}_id"],
            "ar_bill_invoice_hdr_id" => $_REQUEST['id'] ?? null,
            "ar_so_dtl_id" => $row["ar_so_dtl_id"],
            "soDtlID" => '<img src="../images/icons/document_delete.gif" style="cursor:pointer"/>',
            "soDtlEditID" => null,
            "c_name" => $row['c_name'],
            "c_comment" => $row['c_comment'],
            "f_vat_amt" => 0,
            "f_wht_amt" => number_format($row["f_wht_amt"], 2),
            "f_total_cost" => number_format($row["f_total_cost"], 2),
            "f_quan" => number_format($row["f_quan"], 2),
            //"f_net_cost_amt"	=> number_format($row["f_net_disc_comm_amt"],2),
            "f_disc_com" => number_format($row["f_disc_com"], 2),
            "f_disc_com_amt" => number_format($row["f_disc_com"], 2),
            "f_disc_cash_amt" => number_format($row["f_disc_cash"], 2),
            "f_net_cost" => number_format($row["f_net_cost"], 2),
            "f_net_disc_comm_amt" => number_format($row["f_net_disc_comm_amt"], 2)
        );
        ${$root}[] = $temp;



        $f1 += $row["f_total_cost"];
        $f2 += $row["f_wht_amt"];
        $f3 += $row["f_disc_com"];
        $f4 += $row["f_disc_cash"];
        //$f5 += $row["f_net_cost_amt"];
        $f6 += $row["f_net_disc_comm_amt"];
    }
    $vat_rate = $db->GetDataBySQL("select vat_rate from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id = ?", array($_REQUEST['id']));
    $f_vat_amt = $mon->round54($f6 * $vat_rate / 100, 2);
    $f_net_vat_amt = $f6 + $f_vat_amt;

    ${$root}[] = array("no" => ($i++),
        "id" => 'grandTotal',
        "c_name" => '',
        "c_comment" => '',
        "i_seq" => 10000,
        "i_is_jingle" => $row["i_is_jingle"],
        "f_vat_amt" => number_format($f_vat_amt, 2),
        "f_net_vat_amt" => number_format($f_net_vat_amt, 2),
        "f_quan" => "รวม",
        "f_total_cost" => number_format($f1, 2),
        "f_wht_amt" => number_format($f2, 2),
        //"f_disc_cash_amt_bal"	=> number_format($f_bal,2),
        "f_disc_com" => number_format($f3, 2),
        "f_disc_cash" => number_format($f4, 2),
        //"f_disc_cash_amt"	=> number_format($f5,2),
        "f_net_disc_comm_amt" => number_format($f6, 2)
    );
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);

    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
} else {
    echo "Invalid GETDATA";
}
 