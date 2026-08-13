<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db         = new DatabaseServer();
$date       = new i_date();
$util       = new apiUtil();

$root        = "data";
$data        = array();
$con        = null;

if ($_REQUEST["type"] == "imp_debtor_pay_hdr") {

    $mode                = @$_REQUEST["mode"];
    // 	$i_read				= @$_REQUEST["i_read"];

    $limit     = @$_REQUEST["limit"];
    $start     = @$_REQUEST["start"];

    if (!$util->get($start)) {
        $start     = 0;
    }
    if (!$util->get($limit)) {
        $limit     = 20;
    } else {
        $limit = ($limit + $start);
    }

    // 	switch($i_read) {
    // 		case 1:		$con = " AND a.dc_user_create_id=".$_SESSION["user_id"]; break;
    // 		case 2:		$con = " AND a.dc_user_create_cost_id=".$_SESSION["dc_cost_id"]; break;
    // 		default:	$con = "";
    // 	}

    if ($mode == "SEARCH") {
        if ($_REQUEST["filter"] != "") {
            $con    .= " AND a." . $_REQUEST["filter"] . " LIKE '%" . @$_REQUEST["value"] . "%' ";
        }
    }

    $sqlMain = "
    	SET NOCOUNT ON
        SELECT
            ROW_NUMBER() OVER (ORDER BY a.c_code DESC, a.d_doc_date DESC) AS numrow
            ,a.imp_debtor_pay_hdr_id
        INTO #TemData
        FROM dbo.imp_debtor_pay_hdr a
        WHERE a.i_enable = 1
            {$con};

        SELECT
            a.numrow
            ,b.imp_debtor_pay_hdr_id
            ,b.c_code
            ,CONVERT(VARCHAR, b.d_doc_date, 120) AS d_doc_date
            ,ISNULL(b.c_comment,'') AS c_comment
            ,b.i_enable
            ,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = b.dc_user_update_id) AS dc_user_update
            ,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = b.dc_user_update_cost_id) AS dc_user_update_cost
            ,CONVERT(VARCHAR, b.d_update, 120) AS d_update
        FROM #TemData a
            INNER JOIN dbo.imp_debtor_pay_hdr b ON a.imp_debtor_pay_hdr_id = b.imp_debtor_pay_hdr_id
        WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow;

        SELECT COUNT(*) AS rowCounts FROM #TemData;";

    $arrParam[]    = $start;
    $arrParam[]    = $limit;

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if (sqlsrv_has_rows($stmt)) {
        while ($row = $db->Fetch($stmt)) {

            $temp = array(
                "no"                                => $row["numrow"],
                "id"                                => $row["imp_debtor_pay_hdr_id"],
                "c_code"                            => $row["c_code"],
                "d_doc_date"                        => ($row["d_doc_date"] != "") ? $date->extDateBuddha($row["d_doc_date"]) : "",
                "c_comment"                         => $row["c_comment"],
                "i_enable"                          => $row["i_enable"],
                "c_update_name"                     => $row["dc_user_update"],
                "c_cost_update_name"                => $row["dc_user_update_cost"],
                "d_update"                          => ($row["d_update"] != "") ? $date->extDateBuddha($row["d_update"]) : ""
            );

            ${$root}[] = $temp;
        }
    }

    $db->NextResult($stmt);
    $rowCounts = $db->Fetch($stmt);

    echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
    exit;
} else if ($_REQUEST["type"] == "imp_debtor_pay_dtl") {

    $mode   = @$_REQUEST["mode"];
    $arr    = array();

    if ($mode == "excel") { } else {
        $sqlMain = "
        SET NOCOUNT ON
        SELECT
            a.imp_debtor_pay_dtl_id
            ,a.imp_debtor_pay_hdr_id
            ,a.dc_debtor_type_id
            ,a.dc_debtor_claim_id
            ,a.dc_cost_debtor_id
            ,a.c_hn
            ,a.c_an
            ,a.c_patient
            ,CONVERT(VARCHAR, a.d_date_service, 120) AS d_date_service
            ,a.i_date_admission
            ,a.f_charge
            ,a.c_no_charge
            ,CONVERT(VARCHAR, a.d_save_charge, 120) AS d_save_charge
            ,a.c_no_pay
            ,CONVERT(VARCHAR, a.d_save_pay, 120) AS d_save_pay
            ,a.f_pay
            ,a.c_receipt
            ,CONVERT(VARCHAR, a.d_receipt, 120) AS d_receipt
        FROM dbo.imp_debtor_pay_dtl a
        WHERE a.imp_debtor_pay_hdr_id = ?
        ORDER BY a.imp_debtor_pay_dtl_id;";

        $stmt = $db->QueryParam($sqlMain, array($_REQUEST["hdr_id"]));
        if (sqlsrv_has_rows($stmt)) {
            while ($data = $db->Fetch($stmt)) {
                $arr[] = $data;
            }
        }
    }

    $no = 0;
    if (count($arr) > 0) {
        foreach ($arr as $row) {
            $temp = array(
                "no"                                    => ++$no,
                "id"                                    => $row["imp_debtor_pay_dtl_id"],
                "hdr_id"                                => $row["imp_debtor_pay_hdr_id"],
                "dc_debtor_type_id"                     => $row["dc_debtor_type_id"],
                "dc_debtor_claim_id"                    => $row["dc_debtor_claim_id"],
                "dc_cost_debtor_id"                     => $row["dc_cost_debtor_id"],
                "c_hn"                                  => $row["c_hn"],
                "c_an"                                  => $row["c_an"],
                "c_patient"                             => $row["c_patient"],
                "d_date_service"                        => ($row["d_date_service"] != "") ? $date->extDateBuddha($row["d_date_service"]) : "",
                "i_date_admission"                      => $row["i_date_admission"],
                "f_charge"                              => $row["f_charge"],
                "c_no_charge"                           => $row["c_no_charge"],
                "d_save_charge"                         => ($row["d_save_charge"] != "") ? $date->extDateBuddha($row["d_save_charge"]) : "",
                "c_no_pay"                              => $row["c_no_pay"],
                "d_save_pay"                            => ($row["d_save_pay"] != "") ? $date->extDateBuddha($row["d_save_pay"]) : "",
                "f_pay"                                 => $row["f_pay"],
                "f_total"                               => $row["f_charge"] - $row["f_pay"],
                "c_receipt"                             => $row["c_receipt"],
                "d_receipt"                             => ($row["d_receipt"] != "") ? $date->extDateBuddha($row["d_receipt"]) : ""
            );
            ${$root}[] = $temp;
        }
    }
    $rowCounts["rowCounts"] = $no;

    echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
    exit;
}
