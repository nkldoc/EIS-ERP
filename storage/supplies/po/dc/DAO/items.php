<?php

include("./../../../conf/config.php");
include("./../../../lib/database/DatabaseServer.php");
include("./../../../lib/database/apiUtil.php");
include("./../../../lib/date/i_date.class.php");
include './../../../lib/mon/mon.class.php';
include("./../../conf/configAR.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();
$mon = new mon(); // convert floatval
############################################################################################################
$mode = $_REQUEST["mode"] ?? NULL;
$filter = $_REQUEST["filter"] ?? NULL;
$value = $_REQUEST["value"] ?? NULL;
$i_read = $_REQUEST["i_read"] ?? NULL;
$alisInfo = null;
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
    $limit = 15;
} else {
    $limit = ($limit + $start);
}
if (!$util->get($dir)) {
    $dir = "ASC";
}
if (!$util->get($sort)) {
    $sort = "c_code";
}
###################
$root = "data";
$debug = '';
$totalCount = 0;

if ($_REQUEST['type'] == 'storeSo') {

    $table = "ar_so_hdr";
    $root = "data";
    $data = array();
    $dc_cnt_id = $_POST['dc_cnt_id'] ?? null;

    $sqlTempTable = "select ar_so_hdr_id
                        ,c_code
                        ,c_contract_no
                        ,c_po_no
                        ,dc_cnt_id
                        ,dc_comm_id
                        ,convert(varchar, d_so_date, 120) as d_so_date
                       , ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM dbo.{$table}
                     where c_code != '0' and dc_cnt_id = ?";
    if ($mode == "SEARCH") {
        if (isset($value) && $value != "") {
            $sqlTempTable .= " and " . $filter . " like ?";
        }
        $sqlMain = "select *"
                . ", (select top 1 c_name from dc_cnt where dc_cnt_id=a.dc_cnt_id) as dc_cnt_name"
                . ", (select top 1 c_code +' '+ c_name from dc_comm where dc_comm_id=a.dc_comm_id) as dc_comm_name"
                . " from ({$sqlTempTable}) a"
                . " WHERE a.row > ? and a.row <= ?";
        $arrParam = array($dc_cnt_id, "%{$value}%", $start, $limit);
        $arrCountParam = array($dc_cnt_id, "%{$value}%");
    } else {
        $sqlMain = "select a.* "
                . ", (select top 1 c_name from dc_cnt where dc_cnt_id=a.dc_cnt_id) as dc_cnt_name"
                . ", (select top 1 c_code +' '+ c_name from dc_comm where dc_comm_id=a.dc_comm_id) as dc_comm_name"
                . " from ({$sqlTempTable}) a"
                . " WHERE a.row > ? and a.row <= ?";
        $arrParam = array($dc_cnt_id, $start, $limit);
        $arrCountParam = array($dc_cnt_id);
    }
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    while ($row = $db->Fetch($stmt)) {
        $temp = array("no" => ($i++),
            "id" => $row["ar_so_hdr_id"],
            "ar_so_hdr_id" => $row["ar_so_hdr_id"],
            "c_code" => $row["c_code"],
            "c_name" => $row["dc_cnt_name"] . " " . $row["c_po_no"] . " " . $row["c_contract_no"],
            "d_so_date" => $date->shot_date_from_db($row["d_so_date"]),
            "c_po_no" => $row["c_po_no"] ?? null,
            "c_contract_no" => $row["c_contract_no"] ?? null,
            "dc_comm_id" => $row["dc_comm_id"] ?? null,
            "dc_comm_name" => $row["dc_comm_name"] ?? null
        );

        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storeCnt >>>';
} else if ($_REQUEST['type'] == 'storeBl') {

    $table = "ar_bill_invoice_hdr";
    $root = "data";
    $data = array();
    $ar_so_hdr_id = $_POST['ar_so_hdr_id'] ?? null;

    $sqlTempTable = "SELECT ar_bill_invoice_hdr_id
                        , ar_so_hdr_id
                        , c_area_print as c_code
                        , c_area_code 
                        , dc_tax_id_tax 
                        , dc_tax_id_vat 
                        , vat_rate 
                        , tax_rate 
                        , c_invoice_item as c_name 
                        , i_is_show_disc_cash
                        , i_is_billing
                        , i_is_invoice
                        , isnull(f_total_cost_amt,0) as f_total_cost_amt
                        , isnull(f_disc_com_amt,0) as f_disc_com_amt
                        , isnull(f_net_disc_comm_amt,0) as f_net_disc_comm_amt
                        , isnull(f_net_cost_amt,0) as f_net_cost_amt
                        , isnull(f_vat_amt,0) as f_vat_amt
                        , isnull(f_net_cost_add_vat_amt,0) as f_net_cost_add_vat_amt
                        , isnull(f_disc_cash_amt, 0) as f_disc_cash_amt
                        , convert(varchar, d_billing_date, 120) as d_billing_date
                        , ROW_NUMBER() OVER (ORDER BY $sort $dir) as row 
                    FROM dbo.{$table}
                    WHERE c_area_print !='0' and c_code != '0' and i_parent=0 and ar_so_hdr_id = ?";
    if ($mode == "SEARCH") {
        if (isset($value) && $value != "") {
            if ($filter == "c_code")
                $sqlTempTable .= " and c_area_print like ?";
            if ($filter == "c_name")
                $sqlTempTable .= " and c_invoice_item like ?";
        }
        $sqlMain = "select *"
                . " from ({$sqlTempTable}) a"
                . " WHERE a.row > ? and a.row <= ?";
        $arrParam = array($ar_so_hdr_id, "%{$value}%", $start, $limit);
        $arrCountParam = array($ar_so_hdr_id, "%{$value}%");
    } else {
        $sqlMain = "select a.* "
                . " from ({$sqlTempTable}) a"
                . " WHERE a.row > ? and a.row <= ?";
        $arrParam = array($ar_so_hdr_id, $start, $limit);
        $arrCountParam = array($ar_so_hdr_id);
    }
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    while ($row = $db->Fetch($stmt)) {

        $f_total_cost_amt = number_format($row["f_total_cost_amt"], 2);
        $f_disc_com_amt = number_format($row["f_disc_com_amt"], 2);
        $f_net_disc_comm_amt = number_format($row["f_net_disc_comm_amt"], 2);

        $f_net_cost_amt = number_format($row["f_net_cost_amt"], 2);
        $f_vat_amt = number_format($row["f_vat_amt"], 2);
        $f_net_cost_add_vat_amt = number_format($row["f_net_cost_add_vat_amt"], 2);
        $f_disc_cash_amt = number_format($row["f_disc_cash_amt"],2);
        if ($row["i_is_show_disc_cash"]==1 ){   
            $f_net_cost_amt= number_format(($row["f_net_cost_amt"]-$row["f_disc_cash_amt"]), 2);
            $f_vat_amt= number_format((($row["f_net_cost_amt"]-$row["f_disc_cash_amt"])*($row["vat_rate"]/100)), 2); 
            $f_net_cost_add_vat_amt = number_format((($row["f_net_cost_amt"]-$row["f_disc_cash_amt"]) + (($row["f_net_cost_amt"]-$row["f_disc_cash_amt"])*($row["vat_rate"]/100))), 2);
        } else if ($row["i_is_show_disc_cash"]==0){ 
            if ($row["i_is_billing"]==1){   
                $f_net_cost_amt= number_format(($row["f_net_disc_comm_amt"]-$row["f_disc_cash_amt"]), 2);
                $f_vat_amt= number_format((($row["f_net_disc_comm_amt"]-$row["f_disc_cash_amt"])*($row["vat_rate"]/100)), 2); 
            }else if($row["i_is_invoice"]==1){  
                $f_disc_cash_amt = number_format(0,2);
            }
        } 
        
        $temp = array("no" => ($i++),
            "id" => $row["ar_bill_invoice_hdr_id"],
            "ar_bill_invoice_hdr_id" => $row["ar_bill_invoice_hdr_id"],
            "ar_so_hdr_id" => $row["ar_so_hdr_id"],
            "c_code" => $row["c_code"],
            "c_name" => $row["c_area_code"] . " " . $row["c_name"],
            "dc_tax_id_tax" => $row["dc_tax_id_tax"],
            "dc_tax_id_vat" => $row["dc_tax_id_vat"],
            "vat_rate" => $row["vat_rate"],
            "tax_rate" => $row["tax_rate"],
            "d_billing_date" => $date->shot_date_from_db($row["d_billing_date"]),
            "f_total_cost_amt1" => $f_total_cost_amt,
            "f_disc_com_amt1" => $f_disc_com_amt,
            "f_net_disc_comm_amt1" => $f_net_disc_comm_amt,
            "f_net_cost_amt1" => $f_net_cost_amt,
            "f_vat_amt1" => $f_vat_amt,
            "f_disc_cash_amt1" => $f_disc_cash_amt,
            "f_net_cost_add_vat_amt1" => $f_net_cost_add_vat_amt
        );

        // f_total_cost_amt f_disc_com_amt f_net_disc_comm_amt f_net_cost_amt f_vat_amt f_net_cost_add_vat_amt
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storeCnt >>>';
}if ($_REQUEST['type'] == 'storeCost') {
###################
    $table = "dc_cost";
    $root = "data";
    $data = array();

    $sqlTempTable = "select {$table}.dc_cost_id
		, {$table}.c_code
		, {$table}.c_name
		, {$table}.dc_area_id
                ,(select top 1 c_name from dbo.dc_business_area where dc_area_id={$table}.dc_area_id) as c_area_name
                , {$table}.create_org_id ,{$table}.create_id,{$table}.d_create
                , {$table}.update_org_id ,{$table}.update_id,{$table}.d_update
		, ROW_NUMBER() OVER (ORDER BY $sort $dir) as row
                FROM dbo.{$table}
		where i_last = 1 and ISNULL(i_enabled," . STATUS_ENABLE . ") = ?";
//--------------------------------

    if ($mode == "SEARCH") {
        if (isset($value) && $value != "") {
            $sqlTempTable .= " and " . $filter . " like ?";
        }
        $sqlMain = "select a.* from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = array(STATUS_ENABLE, "%{$value}%", $start, $limit);
        $arrCountParam = array(STATUS_ENABLE, "%{$value}%");
    } else {
        $sqlMain = "select a.* from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = array(STATUS_ENABLE, $start, $limit);
        $arrCountParam = array(STATUS_ENABLE);
    }

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;

    if (isset($_REQUEST['all'])) {
        ${$root}[] = array("no" => 0,
            "id" => -1,
            "c_code" => "",
            "c_name" => "ทั้งหมด"
        );
    }

    while ($row = $db->Fetch($stmt)) {

        $temp = array("no" => ($i++),
            "id" => $row["dc_cost_id"],
            "c_area_name" => $row["c_area_name"] ?? NULL,
            "dc_area_id" => $row["dc_area_id"],
            "c_code" => $row["c_code"],
            "c_name" => $row["c_name"]
        );
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storeCostFormTv >>>';
} else if ($_REQUEST['type'] == 'storeCnt') {

###################
    $table = "dc_cnt";
    $root = "data";
    $data = array();
    $sqlTempTable = "select dc_title_id ,dc_cnt_id
		, c_code
		, c_name
                , c_address
		, c_telephone
		, c_mobile
		, c_fax
		, dc_cnt_type_id
		, c_tax_value
                , c_ref_value
		, ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM dbo.{$table}
		where ISNULL(i_enabled," . STATUS_ENABLE . ") = ?";

    if ($mode == "SEARCH") {

        if (isset($value) && $value != "") {
            $sqlTempTable .= " and " . $filter . " like ?";
        }
        $sqlMain = "select *"
                . ", (select top 1 c_code +' '+ c_name from dc_cnt_type where dc_cnt_type_id=a.dc_cnt_type_id) as dc_cnt_type_name"
                . ", (select top 1 c_name "
                . " from dc_title "
                . " where ISNULL(i_enabled," . STATUS_ENABLE . ") = 1 "
                . " and dc_title_id=a.dc_title_id) as c_title "
                . " from ({$sqlTempTable}) a"
                . " WHERE a.row > ? and a.row <= ?";
        $arrParam = array(STATUS_ENABLE, "%{$value}%", $start, $limit);
        $arrCountParam = array(STATUS_ENABLE, "%{$value}%");
    } else {
        $sqlMain = "select a.* "
                . ",(select top 1 c_code +' '+ c_name from dc_cnt_type where dc_cnt_type_id=a.dc_cnt_type_id) as dc_cnt_type_name"
                . ",(select top 1 c_name "
                . " from dc_title "
                . " where ISNULL(i_enabled," . STATUS_ENABLE . ") = 1 "
                . " and dc_title_id=a.dc_title_id) as c_title "
                . " from ({$sqlTempTable}) a "
                . " WHERE a.row > ? and a.row <= ?";
        $arrParam = array(STATUS_ENABLE, $start, $limit);
        $arrCountParam = array(STATUS_ENABLE);
    }
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;

    while ($row = $db->Fetch($stmt)) {
        //c_title dc_cnt_type_name, c_tax_value c_address  c_fax dc_cnt_type_name, c_tax_value c_address c_telephone c_mobile c_fax
        $temp = array("no" => ($i++),
            "id" => $row["dc_cnt_id"] ?? NULL,
            "dc_cnt_id" => $row["dc_cnt_id"] ?? NULL,
            "c_title" => $row["c_title"] ?? NULL,
            "c_code" => $row["c_code"] ?? NULL,
            "c_name" => $row["c_name"] ?? NULL,
            "c_address" => $row["c_address"] ?? NULL,
            "c_telephone" => $row["c_telephone"] ?? NULL,
            "c_mobile" => $row["c_mobile"] ?? NULL,
            "c_fax" => $row["c_fax"] ?? NULL,
            "dc_cnt_type_name" => $row["dc_cnt_type_name"] ?? NULL,
            "c_tax_value" => $row["c_tax_value"] ?? NULL,
            "c_ref_value" => $row["c_ref_value"] ?? NULL
        );

        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storeCnt >>>';
}
echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
