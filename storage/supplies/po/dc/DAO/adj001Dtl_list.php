<?php
include_once './../../../conf/config.php';
include_once './../../../access/checkSession.php';
include_once './../../../lib/database/DatabaseServer.php';
include_once './../../../lib/database/apiUtil.php';
include_once './../../../lib/date/i_date.class.php';
include_once './../../../lib/mon/mon.class.php';
include_once './../../conf/configAR.php';
include_once './../../api/class/ar.status.class.php';

################### storeSoBillingDtl
$db = new DatabaseServer();
$mon = new mon(); // convert floatval
$date = new i_date();
$util = new apiUtil();
$root = "data";


$mode = $_POST["mode"] ?? null;
if ($mode === "GETDATA") {
    $table = "ar_bill_invoice_dtl";

    $sql = "select  bl.f_net_cost_amt
                , bl.f_new_net_cost
                , bl.f_req_amt
                , bl.f_vat_amt
                , bl.f_req_amt+bl.f_vat_amt AS f_net_cost_add_vat_amt
                , bl.vat_rate
                , bl.tax_rate
                , bl.f_req_amt*(bl.tax_rate/100) AS f_tax_amt
            from dbo.ar_bill_invoice_hdr bl where ar_bill_invoice_hdr_id = ?";
    $hdr = $db->GetDataBySQL($sql, array($_POST['id']));
    

    $sqlTempTable = "SELECT ar_bill_invoice_dtl_id
                        , ar_bill_invoice_hdr_id
                        , ar_so_dtl_id
                        , f_net_disc_comm_amt
                        , f_req_amt
                        , f_req_total_amt
                        , f_new_net_cost
                        , ROW_NUMBER() OVER (ORDER BY ar_bill_invoice_dtl_id asc) as row
                    FROM dbo.ar_bill_invoice_dtl 
                    WHERE ar_bill_invoice_hdr_id=?";

    $arrParam = array($_POST['id']);
    $sqlMain = "SELECT b.month_onair+' '+cast(b.year_onair as varchar(50)) as onair_date,
                    b.c_product_name as c_name,
                    a.* 
                FROM ({$sqlTempTable}) a
                    INNER JOIN dbo.vw_ar_so_dtl_tv b on b.ar_so_dtl_id=a.ar_so_dtl_id
               ";
    $stmt = $db->QueryParam($sqlMain, $arrParam);

    $i = 0;
    $pre_f_req_amt = 0;

    $sum1 = 0;
    $sum2 = 0;
    $sum3 = 0;
    $sum4 = 0;
    $sum5 = 0;
    while ($row = $db->Fetch($stmt)) {
        $i ++; 
        $pre_f_req_amt  = $row["f_req_total_amt"] - $row["f_req_amt"];
        $temp = array("no" => ($i++), //accessData =view
                    "id" => $row["ar_bill_invoice_dtl_id"],
                    "DelDtlID" => '<img src="../images/icons/document_delete.gif" style="cursor:pointer"/>',
                    "ar_bill_invoice_hdr_id" => $row["ar_bill_invoice_hdr_id"],
                    "ar_so_dtl_id" => $row["ar_so_dtl_id"],
                    "c_name" => $row['c_name'],
                    "onair_date" => $row['onair_date'],
                    "f_net_disc_comm_amt" => number_format($row["f_net_disc_comm_amt"], 2),
                    "pre_f_req_amt" => number_format($pre_f_req_amt, 2),
                    "f_req_amt" => number_format($row["f_req_amt"], 2),
                    "f_req_total_amt" => number_format($row["f_req_total_amt"], 2),
                    "f_new_net_cost" => number_format($row["f_new_net_cost"], 2)
        );
        ${$root}[] = $temp;

        $sum1 += round($row["f_net_disc_comm_amt"], 2);
        $sum2 += round($pre_f_req_amt, 2);
        $sum3 += round($row["f_req_amt"], 2);
        $sum4 += round($row["f_req_total_amt"], 2);
        $sum5 += round($row["f_new_net_cost"], 2);
    }

    $i ++; 
    $temp = array("no" => null, //accessData =view
                "id" => 'grandTotal',
                "DelDtlID" => null,
                "ar_so_dtl_id" => null,
                "c_name" => "รวม",
                "onair_date" => null,
                "f_net_disc_comm_amt" => number_format($sum1, 2),
                "pre_f_req_amt" => number_format($sum2, 2),
                "f_req_amt" => number_format($sum3, 2),
                "f_req_total_amt" => number_format($sum4, 2),
                "f_new_net_cost" => number_format($sum5, 2),
                "sum_f_net_cost_amt" => number_format($hdr["f_net_cost_amt"], 2),
        "sum_f_new_net_cost" => number_format($hdr["f_new_net_cost"], 2),
        "sum_f_req_amt" => number_format($hdr["f_req_amt"], 2),
        "sum_f_vat_amt" => number_format($hdr["f_vat_amt"], 2),
        "sum_f_net_cost_add_vat_amt" => number_format($hdr["f_net_cost_add_vat_amt"], 2),
        "sum_vat_rate" => number_format($hdr["vat_rate"], 2),
        "sum_tax_rate" => number_format($hdr["tax_rate"], 2),
        "sum_f_tax_amt" => number_format($hdr["f_tax_amt"], 2)
    );
    ${$root}[] = $temp;

    $totalCount = $i;
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
} else if ($mode === "LISTDATA") {
    $table = "ar_bill_invoice_dtl";

    $sqlTempTable = "SELECT ar_bill_invoice_dtl_id
                        , ar_so_dtl_id
                        , f_total_cost
                        , f_net_disc_comm_amt
                        , f_req_amt 
                        , f_disc_com
                        , f_disc_cash
                        , f_net_cost
                    FROM ar_bill_invoice_dtl 
                    WHERE ar_bill_invoice_hdr_id=?";

    $sqlMain = "SELECT a.* 
                    , c.c_name as c_name
                    , isnull((SELECT sum(f_req_amt) FROM ar_bill_invoice_dtl 
                                WHERE i_parent_edit_id=a.ar_bill_invoice_dtl_id
                                    and ar_bill_invoice_hdr_id in (SELECT ar_bill_invoice_hdr_id FROM ar_bill_invoice_hdr 
                                    WHERE i_parent=? and i_enabled=1)), 0) as f_req_amt2
                FROM ({$sqlTempTable}) a
                    INNER JOIN dbo.ar_so_dtl b ON a.ar_so_dtl_id = b.ar_so_dtl_id
                	INNER JOIN dbo.dc_product c ON c.dc_product_id = case when isnull(b.dc_product_id,0) = 0 then b.dc_product_radio_id else b.dc_product_id end
               ";
    //$arrParam = array($_POST['id']);
    $arrParam = array($_POST["i_parent"], $_POST["i_parent"]);
    $stmt = $db->QueryParam($sqlMain, $arrParam);

    $i = 0;
    $f_total_req = 0;
    $f_balance = 0;
    $f_new_net_cost = 0;

    while ($row = $db->Fetch($stmt)) {
        $i ++; 
        $f_total_req  = $row["f_req_amt2"];
        $f_balance = $row["f_net_disc_comm_amt"] - $f_total_req;
        $f_new_net_cost = $f_balance-$row["f_req_amt"];
        $f_new_net_cost1 = number_format($f_new_net_cost, 2);
        $f_req1 = number_format($row["f_req_amt"], 2);
        $id = $row["ar_bill_invoice_dtl_id"];

        $str_hidden = "<input type=Hidden name='fq_total[{$id}]' value='{$row["f_total_cost"]}'>"
                    ."<input type=Hidden name='fq_disc_com[{$id}]' value='{$row["f_disc_com"]}'>"
                    ."<input type=Hidden name='fq_adj_req[{$id}]' value='{$f_total_req}'>"
                    ."<input type=Hidden name='fq_net1[{$id}]' value='{$row["f_net_cost"]}'>"
                    ."<input type=Hidden name='fq_bal[{$id}]' value='$f_balance'>"
                    ."<input type=Hidden name='fq_after_disc_com[{$id}]' value='{$row["f_net_disc_comm_amt"]}'>"
                    ."<input type=Hidden name='fq_disc_cash[{$id}]' value='{$row["f_disc_cash"]}'>";

        $temp = array("no" => ($i++),
            "f_req_amt" => "<input onClick='this.select();'; onBlur='Ext.adjCal({$f_new_net_cost}," . $id . ",this);' "
            . "style='width:80%;padding:3px !important; font-size:10px; text-align:right;' "
            . "id='f_req_amtID" . $id . "' "
            . "name='f_req_amt[" . $id . "]' "
            . "align='center' type='text' "
            . "value='" . $f_req1 . "'>",
            "id" => $row["ar_bill_invoice_dtl_id"],
            "ar_so_dtl_id" => $row["ar_so_dtl_id"],
            "c_name" => $row['c_name'],
            "f_total_cost" => number_format($row["f_total_cost"], 2),
            
            "f_disc_com" => number_format($row["f_disc_com"], 2),
            "f_total_req" => number_format($f_total_req, 2),
            "f_net_cost" => number_format($row["f_net_cost"], 2),
            "f_balance" => number_format($f_balance, 2),
            "f_net_disc_comm_amt" => number_format($row["f_net_disc_comm_amt"], 2),
            "f_new_net_cost" => "<input readOnly id='f_new_costID" . $id . "' name='f_new_cost[" . $id . "]' align='center' value='{$f_new_net_cost1}' style='padding:3px !important;font-size:10px; width:80%; text-align:right;'>"
                                .$str_hidden
        );
        ${$root}[] = $temp;
    }

    $totalCount = $i;
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
} else if ($mode === "GETREMAIN") {
    $i_parent = $_POST["i_parent"];
    $data = array();
    $sql = "select isnull((select sum(f_net_disc_comm_amt) from ar_bill_invoice_dtl where ar_bill_invoice_hdr_id=?), 0) as xA
                , isnull((select sum(ff+f_disc_cash) from vw_bill_all_act where bl_id=? and c_code != '0'), 0) as xB";
    $getData = $db->GetDataBySQL($sql, array($i_parent, $i_parent));
    $data["f_remain"] = round(($getData["xA"] - $getData["xB"]), 2);
    $data["txt_remain"] = number_format($data["f_remain"], 2);
    $re = array("reval" => 0, "success" => "Success", "msg" => "", "data" => $data, "log" => @$log);
    echo json_encode($re);
}