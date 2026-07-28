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
//$so = new StatusOrder($db);
$mon = new mon(); // convert floatval
$date = new i_date();
$util = new apiUtil();

############################################################################################################
$mode = @$_REQUEST["mode"];
$filter = @$_REQUEST["filter"];
$value = @$_REQUEST["value"];
$i_read = @$_REQUEST["i_read"];
###################
$table = "ar_so_dtl";
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
    $sort = "ar_so_dtl_id";
}
###################

if (isset($_REQUEST['mode']) && $_REQUEST['mode'] == "GETDATA") {

    $sqlTempTable = "select {$table}.ar_so_dtl_id
    ,{$table}.ar_so_hdr_id
    ,{$table}.dc_product_id
    ,(select top 1 c_name from dc_product where dc_product_id=case when ar_so_dtl.dc_product_id>0 then ar_so_dtl.dc_product_id else ar_so_dtl.dc_product_radio_id end) as product_name
    ,(select top 1 c_code from dc_product where dc_product_id=case when ar_so_dtl.dc_product_id>0 then ar_so_dtl.dc_product_id else ar_so_dtl.dc_product_radio_id end) as product_code
    ,(select top 1 isnull(c_code,'0') as c_code from ar_so_hdr where ar_so_hdr_id=ar_so_dtl.ar_so_hdr_id) as c_code
    ,{$table}.dc_unit_type_id
    ,{$table}.dc_product_radio_id
    ,{$table}.c_set_name
    ,{$table}.c_break_name
    ,{$table}.i_seq
    ,{$table}.i_is_packet
    ,{$table}.f_total_cost
    ,{$table}.f_unit_cost
    ,{$table}.f_quan
    ,{$table}.f_disc_com
    ,{$table}.f_disc_cash
    ,{$table}.f_net_cost
    ,{$table}.d_onair_date
    ,{$table}.d_instalm_date
    ,{$table}.d_begin_date
    ,{$table}.d_end_date
    ,{$table}.spot_code
    ,{$table}.c_spot_name
    ,{$table}.c_reason
    ,{$table}.dc_radio_station_id
    ,isnull({$table}.i_is_jingle,0) as i_is_jingle
    ,{$table}.f_disc_com_amt
    ,{$table}.f_disc_cash_amt
    ,{$table}.parent_id
    ,{$table}.onair_yyyy_mm
    ,{$table}.dc_cost_id
    ,{$table}.c_comment
    ,{$table}.i_enabled
    ,isnull(c.f_new_net_cost,0) as f_new_net_cost

    , ROW_NUMBER() OVER (ORDER BY {$table}.i_seq asc) as row FROM {$table}
    inner join dc_product b on b.dc_product_id={$table}.dc_product_id
    inner join dbo.ar_bill_invoice_dtl c on c.ar_so_dtl_id={$table}.ar_so_dtl_id 
    where c.ar_bill_invoice_hdr_id=?";

//BL 
//SO
    $arrParam = array($_POST['i_parent'] ?? null);
    $arrCountParam = array($_POST['i_parent'] ?? null);
//product type
//    echo $sqlTempTable;
//    print_r($arrParam);
//    exit;
    $sqlMain = "select * from ({$sqlTempTable}) a";

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
    /*   f_total_cost
     * ."<input type=Hidden name=\"fq_total[$f1[ar_bill_invoice_dtl_id]]\" value=\"$f1[f_total_cost]\">"
      ."<input type=Hidden name=\"fq_disc_com[$f1[ar_bill_invoice_dtl_id]]\" value=\"$f1[f_disc_com]\">"
      ."<input type=Hidden name=\"fq_adj_req[$f1[ar_bill_invoice_dtl_id]]\" value=\"$f_total_req\">"
      ."<input type=Hidden name=\"fq_net1[$f1[ar_bill_invoice_dtl_id]]\" value=\"$f1[f_net_cost]\">"
      ."<input type=Hidden name=\"fq_bal[$f1[ar_bill_invoice_dtl_id]]\" value=\"$f_balance\">"
      ."<input type=Hidden name=\"fq_after_disc_com[$f1[ar_bill_invoice_dtl_id]]\" value=\"$f1[f_net_disc_comm_amt]\">"
      ."<input type=Hidden name=\"fq_disc_cash[$f1[ar_bill_invoice_dtl_id]]\" value=\"$f1[f_disc_cash]\">"
      ."<input type=Hidden name=\"fq_new1[$f1[ar_bill_invoice_dtl_id]]\" value=\"$f1[f_new_net_cost]\">"
     */

#TODO  get view ceveive all bill
    $f_receive_amt = number_format(100.33, 2); //get view ceveive all bill

    while ($row = $db->Fetch($stmt)) {
        $proBilling = 0; /* $db->GetDataBySQL("select count(*)
          from ar_bill_invoice_dtl a
          inner join ar_bill_invoice_hdr b on b.ar_bill_invoice_hdr_id=a.ar_bill_invoice_hdr_id and b.ar_so_hdr_id=?
          where b.i_enabled = 1 and a.ar_so_dtl_id=?", array($_REQUEST['ar_so_hdr_id'], $row["ar_so_dtl_id"])); */
        $billing = 0; //$so->dtlBilling($row["{$table}_id"]);
        $soBill += 0; //$billing;
        $temp = array("no" => ($i++), //accessData =view
            "id" => $row["{$table}_id"],
            "soDtlID" => (($row["c_code"] == '0' && (isset($_REQUEST['accessData']) && $_REQUEST['accessData'] == 'edit')) || ((isset($_REQUEST['mn']) && $_REQUEST['mn'] == 'editso' && $billing == 0 && $row['i_enabled'] == STATUS_ENABLE) && (isset($_REQUEST['accessData']) && $_REQUEST['accessData'] == 'edit'))
            ) ? '<img src="../images/icons/document_delete.gif" style="cursor:pointer"/>' : '',
            "soDtlEditID" => (($row["c_code"] == '0' && (isset($_REQUEST['accessData']) && $_REQUEST['accessData'] == 'edit')) || ((isset($_REQUEST['mn']) && $_REQUEST['mn'] == 'editso' && $billing == 0 && $row['i_enabled'] == STATUS_ENABLE) && (isset($_REQUEST['accessData']) && $_REQUEST['accessData'] == 'edit'))
            ) ? '<img src="../images/icons/document_edit.gif" style="cursor:pointer"/>' : '',
            "soDtlBIlling" => ($proBilling > 0) ? '' : '<label><div><input type="checkbox" onclick="getChk(this)" name="soDtl[]" value="' . $row["{$table}_id"] . '"></div><label>',
            "billing" => $billing ? 'วางบิลแล้ว' : '',
            "soBill" => $soBill > 0 ? 1 : 0, //so billing
            "c_code" => $row["product_code"],
            "c_name" => $row["product_name"],
            "txtdc_product_idID" => $row["product_code"] . " " . $row["product_name"],
            "dc_product_id" => $row["dc_product_id"],
            //  f_net_disc_comm_amt f_total_req f_balance f_req_amt f_new_net_cost
            "f_net_disc_comm_amt" => '<input value="" type="f_net_disc_comm_amt[' . $row["{$table}_id"] . ']"/>',
            "f_total_req" => '<input type="f_total_req[' . $row["{$table}_id"] . ']"/>',
            "f_balance" => '<input type="f_balance[' . $row["{$table}_id"] . ']"/>',
            "f_req_amt" => '<input type="f_req_amt[' . $row["{$table}_id"] . ']"/>',
            "f_new_net_cost" => '<input type="f_new_net_cost[' . $row["{$table}_id"] . ']"/>',
            //"f_net_disc_comm_amt" => '<input type="f_net_disc_comm_amt" name="f_net_disc_comm_amt[' . $row["{$table}_id"] . ']"/>',
            "c_comment" => '<textarea name="comment' . $row["{$table}_id"] . '" rows="2" cols="12">' . $row["c_comment"] . '</textarea>', //$row["c_comment"],
            "i_seq" => $row["i_seq"],
            "i_enabled" => $row["i_enabled"],
            "i_is_jingle" => $row["i_is_jingle"],
            "f_quan" => number_format($row["f_quan"], 2),
            "f_total_cost" => number_format($row["f_total_cost"], 2),
            "f_disc_com_amt" => number_format($row["f_disc_com_amt"], 2),
            "f_disc_cash_amt_bal" => number_format($mon->round54($row["f_total_cost"] - $row["f_disc_com_amt"], 2), 2),
            "f_disc_com" => number_format($row["f_disc_com"], 2),
            "f_disc_cash" => number_format($row["f_disc_cash"], 2),
            "f_disc_cash_amt" => number_format($row["f_disc_cash_amt"], 2),
            "f_net_cost" => number_format($row["f_net_cost"], 2)
        );

        ${$root}[] = $temp;
        $f1 += $row["f_total_cost"];
        $f2 += $row["f_disc_com_amt"];
        $f3 += $row["f_disc_com"];
        $f4 += $row["f_disc_cash"];
        $f5 += $row["f_disc_cash_amt"];
        $f6 += $row["f_net_cost"];

        $f_bal += $mon->round54($row["f_total_cost"] - $row["f_disc_com_amt"], 2);
    }

    ${$root}[] = array("no" => ($i++),
        "id" => 'grandTotal',
        "c_name" => '',
        "c_comment" => '',
        "i_seq" => 10000,
        "i_is_jingle" => $row["i_is_jingle"],
        "f_quan" => "รวม",
        "f_receive_amt" => $f_receive_amt,
        "f_total_cost" => number_format($f1, 2),
        "f_disc_com_amt" => number_format($f2, 2),
        "f_disc_cash_amt_bal" => number_format($f_bal, 2),
        "f_disc_com" => number_format($f3, 2),
        "f_disc_cash" => number_format($f4, 2),
        "f_disc_cash_amt" => number_format($f5, 2),
        "f_net_cost" => number_format($f6, 2)
    );
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);

    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
} else {
    echo "Invalid GETDATA";
}
