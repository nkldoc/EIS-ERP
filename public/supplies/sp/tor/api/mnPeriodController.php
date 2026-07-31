<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

// config ปิด session แล้ว สามารถใช้ค่าที่อ่านมาได้
$userId = $_SESSION['user_id'] ?? null;

if (!$userId) {
    http_response_code(401);

    echo json_encode([
        'success' => false,
        'message' => 'Session expired',
    ]);

    exit;
} else {

    $info[1] = $_SESSION['user_id'];
    $info[2] = $_SESSION['dc_cost_id'];
    $info[3] = date('Y-m-d H:i:s'); // วันที่และเวลา ปัจจุบัน
}
$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

$mode = $_REQUEST["mode"];
$table = "dbo.sp_tor";
$keyName = "tor_id";
$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;
$c_code_gen = "TOR";
$re_id = null;
$stmt2 = true;
$stmt3 = true;

//End fn updateStaus
$db->BeginTran();

function does_url_exists($url) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_NOBODY, true);
    curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if ($code == 200) {
        $status = true;
    } else {
        $status = false;
    }
    curl_close($ch);
    return $status;
}

$d_tor_date = $data['d_tor_date'] ?? null;
$data['d_tor_date'] = !empty($d_tor_date) ? $date->bc_to_ad($data['d_tor_date']) : null;
$f_total_amt = !empty($data["f_total_amt"]) ? str_replace(',', '', $data["f_total_amt"]) : 0; //str_replace(',', '', $data[$value]);
$data['dc_cost_id'] = $data['dc_cost_id'] ?? 38;
$data["c_comment"] = $data["c_comment"] ?? NULL;
switch ($mode) {

    case "UP_SP_QTY_PERIODd_HDR":
        // print_r($_REQUEST); exit();
        $arrParam = array();
        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");

        $arrParam[] = intVal($data["i_qty"]) + intVal($data["i_qty_add"]);
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        $arrParam[] = $data["id"];

        $sql = " UPDATE dbo.sp_tor_dtl_period set "
                . " i_qty = ? ,"
                . " dc_user_update_id = ? ,"
                . " dc_user_update_cost_id = ? ,"
                . " d_update = ? "
                . " where sp_tor_dtl_period_id = ?";
//sp_tor_hdr_period_id: 675
//        print_r($arrParam);exit();
        $stmt = $db->QueryParam($sql, $arrParam);
        $re_id = $data["id"];
        break;
    case "LISTTORDTL":

        ###########################################
        $root = "data";
        $data = array();
        $arrParam[] = $_REQUEST['sp_tor_hdr_period_id'] ?? null;
        $arrParam[] = $_REQUEST['dc_bg_budget_type_id'] ?? null;
        $sqlMain = "SELECT distinct a.sp_tor_dtl_period_id
            , a.sp_tor_hdr_period_id
            , a.sp_tor_dtl_id
            , a.i_qty AS i_qty_all
            ,(
            SELECT sum(b.i_qty) FROM sp_check_period_dtl b
                WHERE b.sp_tor_dtl_period_id = a.sp_tor_dtl_period_id and b.sp_tor_hdr_period_id = a.sp_tor_hdr_period_id
            ) as i_qty_used
            , a.dc_bg_budget_type_id
            , (SELECT c_name FROM nmu.dbo.bg_expense WHERE a.po_expense_id = bg_expense_id ) AS po_expense_idTxt
            , a.dc_unit_type_id
            , a.po_expense_id
            , a.i_hire_type
            , a.i_is_inv
            , a.i_product_type
            , (select dc_creditor_id from  sp_tor_hdr_period where sp_tor_hdr_period_id = a. sp_tor_hdr_period_id) as dc_creditor_per_id
            , (SELECT c_name FROM dc_unit_type aa WHERE aa.dc_unit_type_id = a.dc_unit_type_id) AS c_unit
            , a.c_name
            , a.dc_creditor_id
            , a.f_net_unit_price
            , a.f_net_total_price
            , d.f_vat_amt ,d.f_total_add_vat_amt ,d.f_rate_vat
            , (select isnull(dc_tax_customer_id,0) from nmu..dc_creditor where a.dc_creditor_id =  dc_creditor_id   ) as dc_tax_customer_id
            , (select inv_name from nmu..dc_creditor where a.dc_creditor_id =  dc_creditor_id   ) as inv_name

            FROM dbo.sp_tor_dtl_period a
            INNER JOIN dbo.sp_tor_hdr_period h on h.sp_tor_hdr_period_id = a.sp_tor_hdr_period_id
            LEFT JOIN dbo.sp_tor_bidder_dtl d on d.sp_tor_id = a.sp_tor_id and d.dc_creditor_id=a.dc_creditor_id and d.i_enabled=  1
            LEFT JOIN dbo.vw_sp_pr_budget3 e on e.sp_tor_dtl_id=d.sp_tor_dtl_id
            LEFT JOIN dbo.sp_tor_dtl f on f.sp_tor_dtl_id=d.sp_tor_dtl_id
            WHERE a.sp_tor_hdr_period_id = ? and a.i_enabled = 1 and h.i_enabled = 1

            /*and  isnull(e.dc_bg_budget_type_id,a.dc_bg_budget_type_id) = ?*/
            ";
        //    echo $sqlMain;
        //    exit();
        //echo $db->debugSql($sqlMain, $arrParam);
        //exit();
        // error_log("SQL LISTTORDTL: " . $sqlMain);
        // error_log("Params LISTTORDTL: " . print_r($arrParam, true));
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = @$start + 1;
        while ($row = $db->Fetch($stmt)) {

            $temp = array(
                "no" => $i++,
                "id" => $row["sp_tor_dtl_period_id"],
                "sp_tor_hdr_period_id" => $row["sp_tor_hdr_period_id"],
                "sp_tor_dtl_period_id" => $row["sp_tor_dtl_period_id"],
                "dc_creditor_id" => $row["dc_creditor_id"],
                "dc_creditor_per_id" => $row["dc_creditor_per_id"],
                "i_qty_used" => intVal($row["i_qty_used"]),
                "i_qty_all" => $row["i_qty_all"],
                "c_unit" => $row["c_unit"],
                "inv_name" => $row["inv_name"],
                "c_name" => $row["c_name"],
                "f_vat_amt" => $row["f_vat_amt"],
                "dc_tax_customer_id" => $row["dc_tax_customer_id"],
                "creditor_pdf" => does_url_exists("http://localhost/sp_mn/api/upload_ir/" . "IR000" . $row["sp_tor_hdr_period_id"] . ".pdf?T=" . rand(0, 8)),
                "f_total_add_vat_amt" => $row["f_total_add_vat_amt"],
                "f_rate_vat" => $row["f_rate_vat"],
                "dc_bg_budget_type_id" => $row["dc_bg_budget_type_id"],
                "dc_unit_type_id" => $row["dc_unit_type_id"],
                "po_expense_id" => $row["po_expense_id"],
                "po_expense_idTxt" => $row["po_expense_idTxt"],
                "i_hire_type" => $row["i_hire_type"],
                "i_is_inv" => $row["i_is_inv"],
                "i_product_type" => $row["i_product_type"],
                "f_unit_price" => number_format($row["f_net_unit_price"], 2),
                "f_total_price" => number_format($row["f_net_unit_price"] * $row["i_qty_all"], 2)
            );

            ${$root}[] = $temp;
        }

        echo json_encode(array("debug" => true, "totalCount" => $i, $root => ${$root}));
        exit();

        break;
    case "LIST_PERIOD":
        ###########################################
        $root = "data";
        $data = array();
        $con = '';
        // if (@$_REQUEST['i_is_po'] == 0) {
        //     $con = " and a.sp_tor_contract_id = {$_REQUEST['sp_contract_po_id']}";
        // } else {
        $con = " and a.sp_tor_contract_id = {$_REQUEST['sp_tor_contract_id']}";
        // }
        $sqlMain = "SELECT a.sp_tor_contract_id
            ,a.i_status_checking
            ,a.sp_tor_hdr_period_id
            ,a.sp_check_period_hdr_id
            ,a.c_code
            ,a.c_arrive_code
            ,a.c_code_billing
            ,a.c_billing_code
            ,a.c_code_ref
            ,a.f_net_total_price
            ,a.i_period
            ,CONVERT(varchar,a.d_doc_date,120) as d_doc_date
            ,CONVERT(varchar,a.d_period_date,120) as d_duc_date
            ,a.f_total as f_total_witdraw
            ,CASE
                WHEN a.c_arrive_code  IS NULL THEN 1
                WHEN  a.i_status_checking IS NULL  AND a.c_arrive_code IS NOT NULL THEN 2
                WHEN a.c_code IS NOT NULL AND a.i_status_checking = 1 AND a.c_code_billing IS NULL  THEN 3
                WHEN a.i_status_checking = 2 THEN 4
            END AS sort
            ,CASE
                WHEN a.c_arrive_code  IS NULL THEN '*(รอส่งมอบ)'
                WHEN  a.i_status_checking IS NULL  AND a.c_arrive_code IS NOT NULL THEN '(รอตรวจรับ)'
                WHEN a.c_code IS NOT NULL AND a.i_status_checking = 1 AND a.c_code_billing IS NULL  THEN '(ตรวจรับสำเร็จ/รอรอบวางบิล)'
                WHEN a.i_status_checking = 2 THEN '*(ตรวจรับไม่สำเร็จ)'
                WHEN a.c_code_ref IS NOT NULL THEN '(ส่งเบิกฝ่ายคลัง)'
                ELSE 'รายการก่อนวางบิล'
            END AS i_status_checking_name
            from ( select
                        a.sp_tor_contract_id
                        ,b.i_status_checking
                        ,a.d_doc_date
                        ,a.d_period_date
                        ,a.sp_tor_hdr_period_id
                        ,b.sp_check_period_hdr_id
                        ,b.c_code
                        ,b.c_arrive_code
                        ,c.c_code  as c_code_billing
                        ,d.c_code_ref
                        ,a.i_period
                        ,d.f_total
                        ,isnull(b.c_billing_code,c.c_doc_ref) as c_billing_code
                        , (select sum(f_net_total_price) from dbo.sp_check_period_dtl where sp_tor_hdr_period_id=b.sp_tor_hdr_period_id) as f_net_total_price
                        from sp_tor_hdr_period a
                        OUTER APPLY (
                            SELECT TOP 1 sp_check_period_hdr_id, i_status_checking, c_code, c_arrive_code, c_doc_ref, c_billing_code
                            FROM dbo.sp_check_period_hdr
                            WHERE sp_tor_hdr_period_id = a.sp_tor_hdr_period_id
                              AND i_enabled = 1
                            ORDER BY d_arrive_date DESC, sp_check_period_hdr_id DESC
                        ) b
                        left join (
                            select sp_check_period_hdr_id, min(c_code) as c_code, min(c_doc_ref) as c_doc_ref
                            from dbo.sp_check_billing_items
                            group by sp_check_period_hdr_id
                        ) c on b.sp_check_period_hdr_id = c.sp_check_period_hdr_id
                        left join (
                            select sp_check_period_hdr_id, min(c_code_ref) as c_code_ref, min(f_total) as f_total
                            from dbo.sp_withdraw
                            group by sp_check_period_hdr_id
                        ) d on d.sp_check_period_hdr_id = b.sp_check_period_hdr_id
                        where  a.i_enabled = 1  {$con} ) a
            ORDER BY a.i_period";

        $arrParam[] = $_REQUEST['sp_tor_contract_id'];
      //  error_log("SQL LIST_PERIOD: " . $sqlMain);
     //   error_log("Params LIST_PERIOD: " . print_r($arrParam, true));
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = @$start + 1;
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "id" => intval($row["sp_tor_hdr_period_id"]),
                "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
                "i_status_checking" => $row["i_status_checking"],
                "f_total_witdraw" => number_format($row["f_total_witdraw"], 2),
                "sp_check_period_hdr_id" => $row["sp_check_period_hdr_id"],
                "c_code" => $row["c_code"],
                "c_arrive_code" => $row["c_arrive_code"],
                "c_code_billing" => $row["c_code_billing"],
                "c_code_ref" => $row["c_code_ref"],
                "f_net_total_price" => $row["f_net_total_price"],
                "i_period" => intval($row["i_period"]),
                "sort" => ($row["sort"] == 1) ? false : true,
                "i_status_checking_name" => $row["i_status_checking_name"],
                "c_billing_code" => $row["c_billing_code"],
                "d_doc_date" => @$row["d_doc_date"] ? $date->extDateBuddha($row["d_doc_date"]) : '',
                "d_duc_date" => @$row["d_duc_date"] ? $date->extDateBuddha($row["d_duc_date"]) : '',
                    // sp_contract_po_id   i_status_checking_name
                    // "d_arrive_date" => $row["d_arrive_date"] == '' ? '' : $date->extDateBuddha($row["d_arrive_date"]),
                    // "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
                    // "dc_bg_budget_type_id" => intval($row["dc_bg_budget_type_id"]),
                    // "po_expense_id" => intval($row["po_expense_id"]),
                    // "po_expense_name" => $row["po_expense_name"],
                    // "i_yyyy" => intval($row["i_yyyy"]),
                    // "dc_cost_id" => intval($row["dc_cost_id"]),
                    // "sp_tor_hdr_period_id" => intval($row["sp_tor_hdr_period_id"]),
                    // "c_doc_ref_contract" => $row["c_doc_ref_contract"],
                    // "sp_po_id" => intval($row["sp_po_id"]),
                    // "f_net_total_price" => number_format($row["f_net_total_price"], 2),
                    // "i_is_status" => $row["i_is_status"], "d_period_date" => $date->extDateBuddha($row["d_period_date"]),
                    // "d_doc_date" => $date->extDateBuddha($row["d_doc_date"]),
                    // "i_day" => $row["i_day"],
                    // "i_qty" => $row["i_qty"],
                    // "i_alert" => $row["i_alert"],
                    // "i_is_null" => $row["i_is_null"],
                    // "c_discription" => $row["c_discription"]
            );
            ${$root}[] = $temp;
        }

        echo json_encode(array("debug" => true, "totalCount" => $i, $root => ${$root}));
        exit();

        break;
    case "LIST_PERIOD_IN_SPMNCONTRACT":
        ###########################################
        $root = "data";
        $data = array();
        $con = '';
        $i_is_po = $_REQUEST['i_is_po'] ?? 0;
        if ($i_is_po == 0) {
            $con = " and a.sp_tor_contract_id = {$_REQUEST['sp_contract_po_id']}";
        } else {
            $con = " and a.sp_po_id = {$_REQUEST['sp_contract_po_id']}";
        }
        $sqlMain = "SELECT a.*
                        ,b.sp_mn_contract_dtl_id
                        ,isnull((select TOP 1 c_arrive_code from dbo.sp_check_period_hdr where sp_tor_hdr_period_id=a.sp_tor_hdr_period_id and i_enabled = 1   ),'') as c_arrive_code
                        ,isnull((select TOP 1 i_is_cost_item from dbo.sp_check_period_hdr where sp_tor_hdr_period_id=a.sp_tor_hdr_period_id and i_enabled = 1  ),0) as i_is_cost_item
                        ,isnull((select TOP 1 c_doc_ref from dbo.sp_check_period_hdr where sp_tor_hdr_period_id=a.sp_tor_hdr_period_id and i_enabled = 1  ),0) as c_contract_code
                        ,b.i_status_checking
                        ,CASE
                            WHEN b.sp_mn_contract_dtl_id IS NULL THEN 1
                            WHEN b.i_status_checking = 1 THEN 3
                            WHEN b.i_status_checking IS NULL THEN 2
                            WHEN b.i_status_checking = 2 THEN 1
                        END AS sort
                        ,CASE
                            WHEN b.sp_mn_contract_dtl_id IS NULL THEN '*(รอส่งมอบ)'
                            WHEN b.i_status_checking = 1 THEN '(ตรวจรับสำเร็จ)'
                            WHEN b.i_status_checking IS NULL THEN '(รอตรวจรับ)'
                            WHEN b.i_status_checking = 2 THEN '*(ตรวจรับไม่สำเร็จ)'
                        END AS i_status_checking_name
                        ,CONVERT(VARCHAR,b.d_arrive_date, 120) AS d_arrive_date
                    FROM (
                         SELECT a.sp_tor_hdr_period_id
                            , a.sp_tor_contract_id
                            , bb.i_yyyy
                            , bb.dc_cost_id
                            , aa.dc_bg_budget_type_id
                            , (SELECT TOP 1 c_name FROM NMU.dbo.bg_expense cc WHERE cc.bg_expense_id = aa.po_expense_id) po_expense_name
                            , aa.po_expense_id
                            , b.c_doc_ref AS c_doc_ref_contract
                            , b.dc_creditor_id AS dc_creditor_id
                            , (SELECT TOP 1 c_name FROM NMU.dbo.dc_creditor WHERE dc_creditor_id = b.dc_creditor_id) AS dc_creditor_name
                            , a.sp_po_id
                            , case when isnull(a.dc_creditor_id,0) = 0 then b.dc_creditor_id else isnull(a.dc_creditor_id,0) end as dc_creditor_per_id
                            , CONVERT(VARCHAR,a.d_doc_date, 120) AS d_doc_date
                            , a.i_day
                            , a.i_alert
                            , a.i_is_status
                            , a.i_period
                            , a.f_total_amt
                            , b.i_booking_bg
                            , b.i_overlap
                            , a.i_is_null
                            , a.c_discription
                            , aa.i_qty
                            , isnull(bb.dc_cost2_id,0) as dc_cost2_id
                            , isnull((select TOP 1 sp_check_period_hdr_id from dbo.[sp_check_period_hdr] where sp_tor_hdr_period_id=a.sp_tor_hdr_period_id and i_enabled = 1 ),0) as sp_check_period_hdr_id
                            , isnull((select sum(f_period_amt) from dbo.[sp_delivery_items] where sp_tor_hdr_period_id=a.sp_tor_hdr_period_id),0) as i_cost_item
                            , COALESCE(b2.f_net_total_price, (select sum(f_net_total_price) from dbo.sp_check_period_dtl where sp_tor_hdr_period_id=a.sp_tor_hdr_period_id)) as f_net_total_price
                            , CONVERT(VARCHAR, d_period_date, 120) AS d_period_date
                            , COALESCE(h.f_vat_amt, d.f_vat_amt) AS f_vat_amt
                            , COALESCE(h.f_total_add_vat_amt, d.f_total_add_vat_amt) AS f_total_add_vat_amt
                            , COALESCE(h.f_rate_vat, d.f_rate_vat) AS f_rate_vat
                        FROM dbo.sp_tor_hdr_period a
                        CROSS APPLY (
                            SELECT TOP 1 *
                            FROM dbo.sp_tor_dtl_period aa
                            WHERE aa.sp_tor_hdr_period_id = a.sp_tor_hdr_period_id
                              AND aa.i_enabled = 1
                            ORDER BY aa.sp_tor_dtl_period_id
                        ) aa
                        OUTER APPLY (
                            SELECT TOP 1 *
                            FROM dbo.sp_tor_bidder_dtl d
                            WHERE d.sp_tor_id = aa.sp_tor_id
                              AND d.dc_creditor_id = aa.dc_creditor_id
                              AND d.i_enabled = 1
                            ORDER BY d.sp_tor_bidder_dtl_id DESC
                        ) d
                        OUTER APPLY (
                            SELECT TOP 1 *
                            FROM dbo.sp_check_period_hdr h
                            WHERE h.sp_tor_hdr_period_id = a.sp_tor_hdr_period_id
                              AND h.i_enabled = 1
                            ORDER BY h.d_arrive_date DESC, h.sp_check_period_hdr_id DESC
                        ) h
                        OUTER APPLY (
                            SELECT TOP 1 *
                            FROM dbo.sp_check_period_dtl b2
                            WHERE b2.sp_check_period_hdr_id = h.sp_check_period_hdr_id
                            ORDER BY b2.sp_check_period_dtl_id DESC
                        ) b2
                        INNER JOIN dbo.sp_tor_contract b ON b.sp_tor_contract_id = a.sp_tor_contract_id
                        INNER JOIN dbo.sp_tor bb on bb.tor_id = b.sp_tor_id
                        WHERE 1=1  {$con}  and a.i_enabled = 1
                    ) a
                    LEFT JOIN sp_mn_contract_dtl b ON a.sp_tor_hdr_period_id  = b.sp_tor_hdr_period_id
                    AND b.sp_mn_contract_dtl_id =
                            CASE
                                WHEN (SELECT COUNT(sp_mn_contract_dtl_id) FROM sp_mn_contract_dtl aa WHERE a.sp_tor_hdr_period_id = aa.sp_tor_hdr_period_id AND aa.i_status_checking = 1) > 0
                                    THEN (SELECT TOP 1 sp_mn_contract_dtl_id FROM sp_mn_contract_dtl aa WHERE a.sp_tor_hdr_period_id = aa.sp_tor_hdr_period_id AND aa.i_status_checking = 1)
                                WHEN (SELECT COUNT(sp_mn_contract_dtl_id) FROM sp_mn_contract_dtl aa WHERE a.sp_tor_hdr_period_id = aa.sp_tor_hdr_period_id AND aa.i_status_checking IS NULL) > 0
                                    THEN (SELECT TOP 1 sp_mn_contract_dtl_id FROM sp_mn_contract_dtl aa WHERE a.sp_tor_hdr_period_id = aa.sp_tor_hdr_period_id AND aa.i_status_checking IS NULL)
                                WHEN (SELECT COUNT(sp_mn_contract_dtl_id) FROM sp_mn_contract_dtl aa WHERE a.sp_tor_hdr_period_id = aa.sp_tor_hdr_period_id AND aa.i_status_checking = 2) > 0
                                    THEN (SELECT TOP 1 sp_mn_contract_dtl_id FROM sp_mn_contract_dtl aa WHERE a.sp_tor_hdr_period_id = aa.sp_tor_hdr_period_id AND aa.i_status_checking = 2 ORDER BY d_arrive_date DESC)
                            END
                    ORDER BY  i_period,sort";

        $arrParam[] = $_REQUEST['sp_contract_po_id'];

      //  error_log("SQL LIST_PERIOD_IN_SPMNCONTRACT: " . $sqlMain);
       // error_log("Params LIST_PERIOD_IN_SPMNCONTRACT: " . print_r($arrParam, true));

        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = @$start + 1;
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "id" => intval($row["sp_tor_hdr_period_id"]),
                "sp_check_period_hdr_id" => intval($row["sp_check_period_hdr_id"]),
                "i_status_checking" => $row["i_status_checking"],
                "i_is_cost_item" => $row["i_is_cost_item"],
                "c_contract_code" => $row["c_contract_code"],
                "f_vat_amt" => $row["f_vat_amt"],
                "i_cost_item" => $row["i_cost_item"],
                "f_total_add_vat_amt" => $row["f_total_add_vat_amt"],
                "f_rate_vat" => $row["f_rate_vat"],
                "i_booking_bg" => $row["i_booking_bg"],
                "dc_creditor_per_id" => $row["dc_creditor_per_id"],
                "i_overlap" => $row["i_overlap"],
                "i_status_checking_name" => $row["i_status_checking_name"],
                "sp_mn_contract_dtl_id" => $row["sp_mn_contract_dtl_id"],
                "CheckColumn" => ($row["sort"] == 1) ? false : true,
                "c_arrive_code" => $row["c_arrive_code"],
                "d_arrive_date" => $row["d_arrive_date"] == '' ? '' : $date->extDateBuddha($row["d_arrive_date"]),
                "dc_creditor_name" => $row["dc_creditor_name"],
                "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
                "dc_bg_budget_type_id" => intval($row["dc_bg_budget_type_id"]),
                "po_expense_id" => intval($row["po_expense_id"]),
                "po_expense_name" => $row["po_expense_name"],
                "i_yyyy" => intval($row["i_yyyy"]),
                "dc_cost2_id" => intval($row["dc_cost2_id"]),
                "dc_cost_id" => intval($row["dc_cost_id"]),
                "sp_tor_hdr_period_id" => intval($row["sp_tor_hdr_period_id"]),
                "c_doc_ref_contract" => $row["c_doc_ref_contract"],
                "sp_po_id" => intval($row["sp_po_id"]),
                "i_period" => intval($row["i_period"]),
                "f_total_amt" => number_format($row["f_total_amt"], 2),
                "f_net_total_price" => number_format($row["f_net_total_price"], 2),
                "i_is_status" => $row["i_is_status"],
                "d_period_date" => $date->extDateBuddha($row["d_period_date"]),
                "d_doc_date" => $date->extDateBuddha($row["d_doc_date"]),
                "i_day" => $row["i_day"],
                "i_qty" => $row["i_qty"],
                "i_alert" => $row["i_alert"],
                "i_is_null" => $row["i_is_null"],
                "c_discription" => $row["c_discription"]
            );
            ${$root}[] = $temp;
        }

        echo json_encode(array("debug" => true, "totalCount" => $i, $root => ${$root}));
        exit();

        break;
    case "UP_SP_CHECK_PERIOD_DTL":

//        print_r($_REQUEST);
//        exit();
        $root = "data";
        $data = array();
        $mode = $_REQUEST["mode"] ?? null;
        $arrParam = array();
//set start
        $addField = null;
        $addValue = null;
        $arrValue = array();

        $Arr = json_decode($_REQUEST["data"], true);

        $data["sp_tor_hdr_period_id"] = $_REQUEST["sp_tor_hdr_period_id"];
        $data["sp_tor_contract_id"] = $_REQUEST["sp_tor_contract_id"] ?? null;
        $data["sp_mn_contract_hdr_id"] = $_REQUEST["sp_mn_contract_hdr_id"] ?? null;

        $data["f_vat_amt"] = !empty($_REQUEST["f_vat_amt"]) ? str_replace(',', '', $_REQUEST["f_vat_amt"]) : 0; //$_REQUEST["f_vat_amt"] ?? null;
        $data["f_total_add_vat_amt"] = !empty($_REQUEST["f_total_add_vat_amt"]) ? str_replace(',', '', $_REQUEST["f_total_add_vat_amt"]) : 0; // $_REQUEST["f_total_add_vat_amt"] ?? null;
        $data["f_rate_vat"] = !empty($_REQUEST["f_rate_vat"]) ? str_replace(',', '', $_REQUEST["f_rate_vat"]) : 0; //$_REQUEST["f_rate_vat"] ?? null; //d.f_vat_amt ,d.f_total_add_vat_amt ,d.f_rate_vat

        $data["i_is_po"] = $_REQUEST["i_is_po"] ?? null;
        $data["c_doc_ref"] = $_REQUEST["c_doc_ref"] ?? null;
        $data["d_arrive_date"] = $_REQUEST["d_arrive_date"];
        $data["d_doc_arrive_dt"] = $_REQUEST["d_doc_arrive_dt"];
        $data["c_comment"] = $_REQUEST["c_comment"] ?? null;
        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");
        $data["dc_user_create_id"] = $_SESSION["user_id"];
        $data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_create"] = date("Y-m-d H:i:s");
        $data["dc_creditor_id"] = $_REQUEST["dc_creditor_per_id"];
        $data["i_enabled"] = 1;
        foreach ($data as $fld => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField .= ",
                {$fld}";
            $addValue .= ", ?";
        }
        // d_doc_arrive_dt
        $sql = "SET NOCOUNT ON
                INSERT INTO sp_check_period_hdr (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                SELECT @@IDENTITY as id;";

        $stmt = $db->QueryParam($sql, $arrValue);

        unset($addField);
        unset($addValue);
        unset($data);
        unset($arrValue);

        $ss_id = $db->Fetch($stmt);
        $sp_check_period_hdr_id = $ss_id["id"];

        foreach ($Arr as $fldd) {

//= !empty($data["f_total_amt"]) ? str_replace(',', '', $data["f_total_amt"]) : 0;
            $data["sp_check_period_hdr_id"] = $sp_check_period_hdr_id;
            $data["i_qty"] = $fldd["i_qty"];
            $data["sp_tor_hdr_period_id"] = $fldd["sp_tor_hdr_period_id"];
            $data["sp_tor_dtl_period_id"] = $fldd["sp_tor_dtl_period_id"];
            $data["dc_creditor_id"] = $fldd["dc_creditor_id"];
            $data["c_name"] = $fldd["c_name"];
            $data["dc_unit_type_id"] = $fldd["dc_unit_type_id"];
            $data["c_unit"] = $fldd["c_unit"];
            $data["dc_bg_budget_type_id"] = $fldd["dc_bg_budget_type_id"];
            $data["po_expense_id"] = $fldd["po_expense_id"];
            $data["i_hire_type"] = $fldd["i_hire_type"];
            $data["i_product_type"] = $fldd["i_product_type"];
            $data["i_is_inv"] = $fldd["i_is_inv"];
            $data["f_net_unit_price"] = !empty($fldd["f_net_unit_price"]) ? str_replace(',', '', $fldd["f_net_unit_price"]) : 0;
            $data["f_net_total_price"] = Floatval($data["f_net_unit_price"] * $data["i_qty"]);
            $data["dc_user_update_id"] = $_SESSION["user_id"];
            $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
            $data["d_update"] = date("Y-m-d H:i:s");
            $data["dc_user_create_id"] = $_SESSION["user_id"];
            $data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
            $data["d_create"] = date("Y-m-d H:i:s");

// print_r($data);
//            exit;

            $addValue = null;
            $addField = null;
            $arrValue2 = null;

            foreach ($data as $fld => $value) {
                $arrValue2 [] = $value ?? null;
            }
// print_r($arrValue2);
//            exit;
//            $sql = "SET NOCOUNT ON
//                    INSERT INTO sp_check_period_dtl (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");";
//            echo print_r($arrValue2);
//            exit;
            $sqlDtl = "INSERT INTO sp_check_period_dtl ("
                    . "sp_check_period_hdr_id"
                    . ",i_qty"
                    . ",sp_tor_hdr_period_id"
                    . ",sp_tor_dtl_period_id"
                    . ",dc_creditor_id"
                    . ",c_name"
                    . ",dc_unit_type_id"
                    . ",c_unit,dc_bg_budget_type_id"
                    . ",po_expense_id"
                    . ",i_hire_type"
                    . ",i_product_type"
                    . ",i_is_inv"
                    . ",f_net_unit_price"
                    . ",f_net_total_price"
                    . ",dc_user_update_id"
                    . ",dc_user_update_cost_id"
                    . ",d_update,dc_user_create_id,dc_user_create_cost_id,d_create) "
                    . "VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
            $stmt2 = $db->QueryParam($sqlDtl, $arrValue2);
            unset($arrValue2);
//            echo $sqlDtl;
//            print_r($arrValue2);
//            exit;
        }
// $db->RollBackTran(); exit();
        break;

    case "GEN_SP_CONTRACT_CHECK":
        $root = "data";
        $data = array();
        $mode = $_REQUEST["mode"] ?? null;
        $arrParam = array();
        //set start
        $addField = null;
        $addValue = null;
        $arrValue = array();

        // print_r($_SESSION) ;
        // exit ();
        // $Arr = json_decode($_REQUEST["data"], true);

        $data["sp_tor_id"] = $_REQUEST["sp_tor_id"];
        $data["f_total_amt"] = $_REQUEST["f_total"];
        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");
        $data["dc_user_create_id"] = $_SESSION["user_id"];
        $data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_create"] = date("Y-m-d H:i:s");
        $data["dc_creditor_id"] = $_REQUEST["dc_creditor_id"];

        foreach ($data as $fld => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField .= ",
                    {$fld}";
            $addValue .= ", ?";
        }
        $sql = "SET NOCOUNT ON
                    INSERT INTO sp_tor_contract (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                    SELECT @@IDENTITY as id;";
        $stmt = $db->QueryParam($sql, $arrValue);
        unset($addField);
        unset($addValue);
        unset($data);
        // unset($arrValue2);

        $ss_id = $db->Fetch($stmt);
        $sp_tor_contract_id = $ss_id["id"];

        // $data["sp_tor_contract_id"] = $sp_tor_contract_id;
        $data["f_total_amt"] = $_REQUEST["f_total"];
        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");

        $data["dc_user_create_department_id"] = $_SESSION["dc_department_id"];
        $data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_create"] = date("Y-m-d H:i:s");
        $data["dc_user_create_id"] = $_SESSION["user_id"];
        $data["i_period"] = 1;
        $data["dc_creditor_id"] = $_REQUEST["dc_creditor_id"];

        $addValue = null;
        $addField = null;
        $arrValue2 = array();
        foreach ($data as $fld => $value) {
            $arrValue2 [] = $value ?? null;
        }
        $sqlDtl = " SET NOCOUNT ON
                        INSERT INTO sp_tor_hdr_period (sp_tor_contract_id,f_total_amt,dc_user_update_id,dc_user_update_cost_id
                        ,d_update,dc_user_create_department_id,dc_user_create_cost_id,d_create,i_period,dc_user_create_id,i_enabled,dc_creditor_id)
                        VALUES ({$sp_tor_contract_id}, ?, ?, ?, ?, ?, ?,?,?,?,1,?) ;
                        SELECT  @@IDENTITY  as  sp_tor_hdr_period_id ; ";
        // /******echo sql******/
        // $sqlDtl = (@$sqlMain) ? $sqlMain : $sqlDtl;
        // $arr = (@$arrParam) ? $arrParam : ((@$arrValue2) ? $arrValue2 : array());
        // $sqlDtl = str_replace('?', '#-#', $sqlDtl);
        // foreach ($arr as $fld => $value) {
        //  $sqlDtl = preg_replace('/#-#/', "'" . $value . "'", $sqlDtl, 1);
        // }
        // echo $sqlDtl; exit;
        // /********************/
        $stmt2 = $db->QueryParam($sqlDtl, $arrValue2);
        unset($data);
        $ss_id1 = $db->Fetch($stmt2);
        $sp_tor_hdr_period_id = $ss_id1["sp_tor_hdr_period_id"];
        $data["sp_tor_contract_id"] = $sp_tor_contract_id;
        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");
        $data["dc_user_create_id"] = $_SESSION["user_id"];
        $data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_create"] = date("Y-m-d H:i:s");
        $data["d_doc_arrive_dt"] = $_REQUEST["d_doc_arrive_dt"];
        $data["c_code"] = "APNO" . substr($_REQUEST["pr_code"], 2);
        $data["i_status_checking"] = 1;
        $data["sp_emp_id"] = $_SESSION["sp_emp_id"];
        $data["i_step"] = 1;
        $data["d_checking_date"] = $_REQUEST["d_doc_arrive_dt"];
        // $data["i_status_billing"]               = 1  ;
        $data["dc_creditor_id"] = $_REQUEST["dc_creditor_id"];
        $data["f_total_add_vat_amt"] = $_REQUEST["f_total"];
        // $substring = substr($_REQUEST["c_code"], 2, 0);

        $addValue = null;
        $addField = null;
        $arrValue3 = null;

        foreach ($data as $fld => $value) {
            $arrValue3 [] = $value ?? null;
        }
        $sqlDtl2 = "  SET NOCOUNT ON
                        INSERT INTO sp_check_period_hdr ("
                . "sp_tor_hdr_period_id"
                . ",sp_tor_contract_id"
                . ",dc_user_update_id"
                . ",dc_user_update_cost_id"
                . ",d_update,dc_user_create_id,dc_user_create_cost_id,d_create,d_doc_arrive_dt
                    , c_code,i_status_checking
                    , sp_emp_id
                    , i_step
                    , d_checking_date
                    , dc_creditor_id
                    , f_total_add_vat_amt
                    ) " . "VALUES (  @@IDENTITY ,?
                            ,?, ?, ?, ?, ?, ?,?,?,?,?,?,?,?,?);
                            SELECT  @@IDENTITY   sp_check_period_hdr_id
                            ";
        $stmt3 = $db->QueryParam($sqlDtl2, $arrValue3);
        unset($arrValue3);

        /*
          $data["sp_tor_hdr_period_id"] = $sp_tor_hdr_period_id;
          $data["sp_tor_id"] = $_REQUEST["sp_tor_id"];
          $data["dc_creditor_id"] = $_REQUEST["dc_creditor_id"];

          $data["dc_user_update_id"] = $_SESSION["user_id"];
          $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
          $data["d_update"] = date("Y-m-d H:i:s");
          $data["dc_user_create_id"] = $_SESSION["user_id"];
          $data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
          $data["d_create"] = date("Y-m-d H:i:s");
          $addValue = null;
          $addField = null;
          $arrValue3 = null;

          foreach ($data as $fld => $value) {
          $arrValue3 [] = $value ?? null;
          }
          $sqlDtl2 = "
          INSERT INTO sp_tor_dtl_period ("
          . "sp_tor_hdr_period_id"
          . ",sp_tor_contract_id"
          . ",dc_user_update_id"
          . ",dc_user_update_cost_id"
          . ",d_update,dc_user_create_id,dc_user_create_cost_id,d_create) "
          . "VALUES (  @@IDENTITY ,?
          ,?, ?, ?, ?, ?, ?);
          SELECT  @@IDENTITY   sp_check_period_hdr_id
          ";
          $stmt3 = $db->QueryParam($sqlDtl2, $arrValue3);
          unset($arrValue3); */
        // $db->RollBackTran(); exit();
        break;

//*************************************************************************************************************************************

    case "UP_BG_PERIOD_HDR":

        $arrParam = array();
        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");

        $arrParam[] = $data["bg_reserve_money_id"];
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        $arrParam[] = $data["id"];

        $sql = " UPDATE dbo.sp_tor_hdr_period set "
                . " bg_reserve_money_id = ? ,"
                . " dc_user_update_id = ? ,"
                . " dc_user_update_cost_id = ? ,"
                . " d_update = ? "
                . " where sp_tor_hdr_period_id = ?";

        $stmt = $db->QueryParam($sql, $arrParam);
        $re_id = $data["id"];
        break;

    case "UP_CHECK_INCOME":

        $arrParam = array();
        $data["request_money_income"] = $_REQUEST["request_money_income"];
        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");
        $data["sp_check_period_hdr_id"] = $_REQUEST["sp_check_period_hdr_id"];

        $arrParam[] = $data["request_money_income"];
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        $arrParam[] = $data["sp_check_period_hdr_id"];
        // echo ($data["sp_check_period_hdr_id"]);
        // exit ();
        $sql = " UPDATE dbo.sp_check_period_hdr
        set  request_money_income = ? ,
        dc_user_update_id = ? ,
        dc_user_update_cost_id = ? ,
        d_update = ?
        where sp_check_period_hdr_id = ?";

        $stmt = $db->QueryParam($sql, $arrParam);
        $re_id = $data["sp_check_period_hdr_id"];
        break;
    case "UP_BG_CHECKING_HDR":
        $arrParam = array();
        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");

        $arrParam[] = $data["request_money_income"];
        $arrParam[] = $data["bg_reserve_money_id"];
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        $arrParam[] = $data["sp_check_period_hdr_id"];
        $sql = " UPDATE dbo.sp_check_period_hdr set "
                . " request_money_income = ? ,"
                . " bg_reserve_money_id = ? ,"
                . " dc_user_update_id = ? ,"
                . " dc_user_update_cost_id = ? ,"
                . " d_update = ? "
                . " where sp_check_period_hdr_id = ?";

        $stmt = $db->QueryParam($sql, $arrParam);
        $re_id = $data["id"];
        break;

    case "UP_BG_CHECKING_OVERLAP":
        $arrParam = array();
        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");

        $arrParam[] = $data["bg_reserve_overlap_id"];
        $arrParam[] = $data["i_overlap"];
        $arrParam[] = $data["c_booking"];

        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        $arrParam[] = $data["sp_check_period_hdr_id"];

        $sql = " UPDATE dbo.sp_check_period_hdr set "
                . " bg_reserve_overlap_id = ? ,"
                . " i_overlap = ? ,"
                . " c_overlap = ? ,"
                . " dc_user_update_id = ? ,"
                . " dc_user_update_cost_id = ? ,"
                . " d_update = ? "
                . " where sp_check_period_hdr_id = ?";

        $stmt = $db->QueryParam($sql, $arrParam);
        $re_id = $data["id"];
        break;

    case "UP_BG_CHECKING_BOOKING_HDR":

        $arrParam = array();
        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");
// [0] => [1] => 1 [2] => 3 [3] => 2022-11-16 10:12:43 [4] => 1
        $arrParam[] = $data["bg_checking_money_id"];
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        $arrParam[] = $data["sp_check_period_hdr_id"];

        $sql = " UPDATE dbo.sp_check_period_hdr set "
                . " bg_checking_money_id = ? ,"
                . " dc_user_update_id = ? ,"
                . " dc_user_update_cost_id = ? ,"
                . " d_update = ? "
                . " where sp_check_period_hdr_id = ?";
//        echo $sql;
//        print_r($arrParam);
//        exit();
        $stmt = $db->QueryParam($sql, $arrParam);
        $re_id = $data["id"];
        break;
    case "UP_BG_CHECKING_CLOSE_BOOKING_HDR":

        $arrParam = array();
        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");
        $arrParam[] = 1;
        $arrParam[] = 4; //i_status_checking (null or 0 arrive_code) วางบิล / 1 ตรวจรับ / 2 ยกเลิก / 3 ทำรายการเบิก(update D0xxx / 4 ส่งเบิก /

        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        $arrParam[] = $data["sp_check_period_hdr_id"] ?? 0;

        $sql = " UPDATE dbo.sp_check_period_hdr set "
                . " i_is_withdraw = ? ,"
                . " i_status_checking = ? ,"
                . " dc_user_update_id = ? ,"
                . " dc_user_update_cost_id = ? ,"
                . " d_update = ? "
                . " where sp_check_period_hdr_id = ?";

        $stmt = $db->QueryParam($sql, $arrParam);
        $re_id = $data["sp_check_period_hdr_id"] ?? 0;
        break;
}

if ($stmt && $stmt2 && $stmt3) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว", "id" => $re_id);
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
}

echo json_encode($re);
exit;
