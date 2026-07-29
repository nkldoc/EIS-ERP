<?php
include("../api/List_RepProtest.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$s_title = true;
$title = CUSTOMER_NAME_TH;
$caption = "รายงานการส่งทักท้วง";

if ($_REQUEST["type"] == "excel") {
    $export->headerExcel($caption);
}

$data_dtl = json_decode(List_QueryParam(), true);

$reason_protest = $db->GetDataBySQL("SELECT MAX(i_row) FROM po_reason_protest;", array(1));
if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {

    $tbody = "<tbody>";
    $no = 0;
    //$reason_protest = ($reason_protest == null) ? $reason_protest = 0: $reason_protest = $reason_protest; 
    $po_reason_protest[] = '';
    foreach ($data_dtl["data"] as $index => $jObj) {

        if ($jObj["i_type"] == 1) {
            $i = 1;
            while ($i <= $reason_protest) {
                $po_reason_protest[$i] = (strpos(';'.$jObj["po_reason_protest"], strval($i)) == true) ? '✓' : '';
                $i++;
            }
            //print_r($po_reason_protest);exit;
            // $po_reason_protest[1] = (strpos($jObj["po_reason_protest"], '1') == true) ? '✓' : '';
            // $po_reason_protest[2] = (strpos($jObj["po_reason_protest"], '2') == true) ? '✓' : '';
            // $po_reason_protest[3] = (strpos($jObj["po_reason_protest"], '3') == true) ? '✓' : '';
            // $po_reason_protest[4] = (strpos($jObj["po_reason_protest"], '4') == true) ? '✓' : '';
            // $po_reason_protest[5] = (strpos($jObj["po_reason_protest"], '5') == true) ? '✓' : '';
            // $po_reason_protest[6] = (strpos($jObj["po_reason_protest"], '6') == true) ? '✓' : '';
            // $para = "";
            // $para .= $_SERVER["QUERY_STRING"];
            // $para .= "&i_level=4";			
            // $para .= "&bg_budget_dtl_overlap_id={$jObj["bg_budget_dtl_overlap_id"]}";
            // $para .= "&bg_expense_id={$jObj["bg_expense_id"]}";
            // $para .= "&d_date_start={$_REQUEST["d_date_start"]}";
            // $para .= "&d_date_end={$_REQUEST["d_date_end"]}";strpos($jObj["po_reason_protest"],'1') 
            $tbody .= "<tr>";
            $tbody .= "<td align='center' nowrap>" . (++$no) . "</td>";
            $tbody .= "<td nowrap>" . $jObj["dc_cost_name"] . "</td>";
            $tbody .= "<td align=center nowrap>" . $jObj["dc_expense_budget_type_name"] . "</td>";
            $tbody .= "<td nowrap>" . $jObj["bg_expense_name"] . "</td>";
            $tbody .= "<td align=center nowrap>" . $jObj["po_creditor_name"] . "</td>";
            $tbody .= "<td align=center nowrap>" . $jObj["c_code_ref"] . "</td>";
            $tbody .= "<td align=center nowrap>" . $jObj["d_inv_date"] . "</td>";

            $i = 1;
            while ($i <= $reason_protest) {
                $tbody .= "<td style='width:25px; font-size: 16px;' align=center nowrap>" . $po_reason_protest[$i] . "</td>";
                $i++;
            }
            $tbody .= "<td align=center nowrap>" . $jObj["d_doc_date"] . "</td>";
            $tbody .= "<td align=center nowrap>" . $jObj["d_receive_date"] . "</td>";
            $tbody .= "<td align=center nowrap>" . $jObj["po_parcel_officer_name"] . "</td>";
            $tbody .= "<td align=center nowrap>" . $jObj["dc_user"] . "</td>";

            // $tbody .= "<td align=right nowrap>" . number_format($jObj["f_overlap"], 2) . "</td>";
            // $tbody .= "<td align='right'>" . number_format($jObj["f_cancel"], 2) . "</td>";
            // $tbody .= "<td align='right'>" . number_format($jObj["f_total"], 2) . "</td>";
            // $tbody .= "<td>" . $jObj["c_creditor"] . "</td>";
            // $tbody .= "<td nowrap>" . $jObj["c_comment"] . "</td>";
            $tbody .= "</tr>";
        } else if ($jObj["i_type"] == 2) {
            $style = "style='background: #a5a5a5; font-weight:bold;'";
            $tbody .= "<tr>";
            // $tbody .= "<td {$style} align=right nowrap colspan=6>รวม</td>";
            // $tbody .= "<td {$style} align=right nowrap>" . number_format($jObj["f_overlap"], 2) . "</td>";
            // $tbody .= "<td {$style} align=right nowrap>" . number_format($jObj["f_expense"], 2) . "</td>";
            // $tbody .= "<td {$style} align=right nowrap>" . number_format($jObj["f_cancel"], 2) . "</td>";
            // $tbody .= "<td {$style} align=right nowrap>" . number_format($jObj["f_total"], 2) . "</td>";
            // $tbody .= "<td {$style} nowrap colspan=2></td>";
            $tbody .= "</tr>";
        }
    }

    $tbody .= "</tbody>";

    $tfoolter = "<div style='position: relative; font-size: 11px; margin: 5px 10px;'>";
    $tfoolter .= "<br><div style='position: relative; left: 2px;'><b>ข้อทักท้วง</b></div>";
    
    $i = 1;
    while ($i <= $reason_protest) { 
        $tt = $db->GetDataBySQL("SELECT c_name FROM po_reason_protest WHERE i_row = ?;", array($i));
        $tfoolter .= "<div style='position: relative; left: 2px;'>ข้อ ".$i." : ".$tt."</div>";
        $i++;
    }
} else {
    $tbody = "<tbody><tr><td align='center' colspan=31>ไม่มีข้อมูล</td></tr></tbody>";
}
?>
<html>

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title><?php echo COMPANY_NAME; ?></title>
    <link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
    <style>
        .loader {
            border: 4px solid #E7E7E7;
            border-radius: 50%;
            border-top: 4px solid #3498db;
            width: 12px;
            height: 12px;
            -webkit-animation: spin 1s linear infinite;
            /* Safari */
            animation: spin 1s linear infinite;
        }
    </style>
</head>
<div id="loader_display" style="display: flex; padding: 15px 15px; font-size:14px;">
    <div class="loader"></div>
    <p>&nbsp;&nbsp;กำลังโหลดข้อมูลตารางกรุณารอสักครู่...</p>
</div>
<body>
    <div class="outer">
        <?php
        if ($s_title == true)
            echo "<div align='center'><strong>" . $title . "</strong></div>";

        $dc_cost_name = ($_REQUEST["dc_cost_id"] > 0) ? $dc_cost_name = $db->GetDataBySQL("SELECT c_name FROM dc_cost WHERE dc_cost_id=?;", array($_REQUEST["dc_cost_id"])) : "เลือกทั้งหมด";
        $dc_expense_budget_type_name = ($_REQUEST["dc_expense_budget_type_id"] > 0) ? $dc_expense_budget_type_name = $db->GetDataBySQL("SELECT c_code+' : '+c_name FROM dc_expense_budget_type WHERE dc_expense_budget_type_id=?;", array($_REQUEST["dc_expense_budget_type_id"])) : "เลือกทั้งหมด";
        $bg_expense_name = ($_REQUEST["bg_expense_id"] > 0) ? $bg_expense_name = $db->GetDataBySQL("SELECT c_code+' : '+c_name FROM bg_expense WHERE bg_expense_id=?;", array($_REQUEST["bg_expense_id"])) : "เลือกทั้งหมด";
        $po_creditor_name = ($_REQUEST["po_creditor_id"] > 0) ? $po_creditor_name = $db->GetDataBySQL("SELECT c_name FROM po_creditor WHERE po_creditor_id=?;", array($_REQUEST["po_creditor_id"])) : "เลือกทั้งหมด";
        $dc_approve_name = ($_REQUEST["dc_approve_id"] > 0) ? $dc_approve_name = $db->GetDataBySQL("SELECT c_full_name FROM dc_user WHERE dc_user_id=?;", array($_REQUEST["dc_approve_id"])) : "เลือกทั้งหมด";
        $po_parcel_officer_name = ($_REQUEST["po_parcel_officer_id"] > 0) ? $po_parcel_officer_name = $db->GetDataBySQL("SELECT c_name FROM po_parcel_officer WHERE po_parcel_officer_id=?;", array($_REQUEST["po_parcel_officer_id"])) : "เลือกทั้งหมด";

        $i = 1;
        $loopecho = '';
        while ($i <= $reason_protest) {
            $loopecho .= "<th style='vertical-align:middle;' nowrap>" . $i . "</th>";
            $i++;
        }

        echo "<div align='center'><strong>" . $caption . "</strong></div>";
        echo "<div align='center'><strong>ฝ่ายคลังรับระหว่างวันที่ " . $date->shot_date_from_db($_REQUEST["d_date_start"]) . " ถึงวันที่ : " . $date->shot_date_from_db($_REQUEST["d_date_end"]) . "</strong></div>";


        ?>
        <div style='position: relative; font-size: 11px; margin: 5px 10px;'>
            <div style='position: relative; left: 2px;'>หน่วยงาน : <?= $dc_cost_name ?></div>
            <div style='position: relative; left: 2px;'>แหล่งเงิน : <?= $dc_expense_budget_type_name ?></div>
            <div style='position: relative; left: 2px;'>รายการย่อย : <?= $bg_expense_name ?></div>
            <div style='position: relative; left: 2px;'>จ่ายให้ : <?= $po_creditor_name ?></div>
            <div style='position: relative; left: 2px;'>ผู้อนุมัติฏีกา : <?= $dc_approve_name ?></div>
            <div style='position: relative; left: 2px;'>เจ้าหน้าที่พัสดุ : <?= $po_parcel_officer_name ?></div>
        </div>
        <div class="table-overflow">
            <table id='tb_report' style="width: 2000px; display:none" class="table_report" border="0" cellspacing="1" cellpadding="0">
                <thead valign="top">
                    <tr>
                        <th style='vertical-align:middle;' rowspan=3 nowrap>ลำดับที่</th>
                        <th style='vertical-align:middle;' rowspan=3 nowrap>หน่วยงาน</th>
                        <th style='vertical-align:middle;' rowspan=3 nowrap>แหล่งเงิน</th>
                        <th style='vertical-align:middle;' rowspan=3 nowrap>รายการย่อย</th>
                        <th style='vertical-align:middle;' rowspan=3 nowrap>จ่ายให้</th>
                        <th style='vertical-align:middle;' rowspan=3 nowrap>เลขที่ใบขอเบิก</th>
                        <th style='vertical-align:middle;' rowspan=3 nowrap>วันที่ผ่ายคลับ<br>รับใบขอเบิก</th>
                        <th style='vertical-align:middle;' colspan= <?= $reason_protest+2 ?> nowrap>ทักท้วง</th>
                        <th style='vertical-align:middle;' rowspan=3 nowrap>เจ้าหน้าที่พัสดุ</th>
                        <th style='vertical-align:middle;' rowspan=3 nowrap>ผู้อนุมัติ</th>

                    </tr>
                    <tr>
                        <th style='vertical-align:middle;' colspan= <?= $reason_protest ?> nowrap>ข้อทักท้วง</th>
                        <th style='vertical-align:middle;' rowspan=2 nowrap>วันที่ทักท้วง</th>
                        <th style='vertical-align:middle;' rowspan=2 nowrap>วันที่รับคืนทักท้วง</th>
                    </tr>
                    <tr>
                        <?= $loopecho ?>

                        <!-- <th style='vertical-align:middle;' nowrap>1</th>
                        <th style='vertical-align:middle;' nowrap>2</th>
                        <th style='vertical-align:middle;' nowrap>3</th>
                        <th style='vertical-align:middle;' nowrap>4</th>
                        <th style='vertical-align:middle;' nowrap>5</th>
                        <th style='vertical-align:middle;' nowrap>6</th> -->
                    </tr>
                </thead>
                <?= $tbody ?>
            </table>
                <?= $tfoolter ?>
        </div>
    </div>
</body>

</html>
<script>
    document.getElementById('tb_report').style.width = "100%";
    document.getElementById("tb_report").style.display = "table";
    document.getElementById('loader_display').style.display = "none";
</script>
<script src="../../js/jquery/3.4.1/jquery.min.js"></script>
<script src="../../css/report.js"></script>