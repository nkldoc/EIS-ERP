<?php
include("../api/List_RepStatisticPurchase.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$s_title = true;
$title = CUSTOMER_NAME_TH;
$caption = "รายงานสถิติการเบิกจ่ายฏีกาจัดซื้อจัดจ้าง (PA)";

if ($_REQUEST["type"] == "excel") {
    $export->headerExcel($caption);
}

$data_dtl = json_decode(List_QueryParam(), true);
if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {

    $tbody = "<tbody>";

    foreach ($data_dtl["data"] as $index => $jObj) {

        $style = "";

        $para = "";
        $para .= $_SERVER["QUERY_STRING"];
        $para .= "&po_working_hdr_id={$jObj["po_working_hdr_id"]}";

        $c_code = ($jObj["c_code_parent"] != "") ? "<span style='font-size: 11px; color: red;'>" . $jObj["c_code_parent"] . "</span><br>" . $jObj["c_code"] : $jObj["c_code"];
        if ($jObj["i_stop_date"] > 0) {
            $span   = "<span style='font-size: 10px; margin-top: -4px; position: absolute; margin-left: 4px; color: red;'>-{$jObj["i_stop_date"]}</span>";
            $st     = "";
        } else {
            $span   = "";
            $st     = "text-decoration: none;";
        }

        $tbody .= "<tr $style>";
        $tbody .= "<td align='center' nowrap>" . $jObj["no"] . "</td>";
        $tbody .= "<td>" . $jObj["dc_cost_name"] . "</td>";
        $tbody .= "<td>" . $jObj["dc_budget_name"] . "</td>";
        $tbody .= "<td>" . $jObj["c_cnt_name"] . "</td>";
        $tbody .= "<td align=center style='mso-number-format:\@;' nowrap>" . $c_code . "</td>";
        $tbody .= "<td align=center style='mso-number-format:\@;' nowrap>" . $jObj["c_approve"] . "</td>";
        $tbody .= "<td align='center' nowrap>" . $jObj["d_start_date"] . "</td>";
        $tbody .= "<td align='center' nowrap>" . $jObj["d_end_date"] . "</td>";
        $tbody .= "<td align='center' style='mso-number-format:\@;'><a class='text-hover' style='{$st}' href='./Rep_StatisticPurchase_Date.php?{$para}' target='Rep_StatisticPurchase_Date'>" . $jObj["i_count_date"] . $span . "</a></td>";
        $tbody .= "<td align='left'><pre>" . $jObj["c_comment"] . "</pre></td>";
        $tbody .= "<td align='center' nowrap>" . $jObj["c_approve_name"] . "</td>";
        $tbody .= "</tr>";
    }

    $tbody .= "</tbody>";
} else {
    $tbody = "<tbody><tr><td align='center' colspan=10>ไม่มีข้อมูล</td></tr></tbody>";
}
?>
<html>

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title><?php echo COMPANY_NAME; ?></title>
    <link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
    <style>
        .class-t {
            display: inline-flex;
        }

        .class-t .hh {
            position: relative;
            font-size: 11px;
            margin: 5px 10px;
            width: 180px;
        }

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

        echo "<div align='center'><strong>" . $caption . "</strong></div>";

        if ($_REQUEST["dc_cost_id"] > 0) {
            $cost_name = $db->GetDataBySQL("SELECT c_name FROM dc_cost WHERE dc_cost_id = ?;", array($_REQUEST["dc_cost_id"]));
        } else {
            $stmt = $db->QueryParam("SELECT c_name FROM dc_cost WHERE dc_cost_id IN (38,81,50,82)", array());

            if ($stmt) {
                $name = "";
                while ($row = $db->Fetch($stmt)) {
                    $name .= ($name == "") ? $row["c_name"] : ", " . $row["c_name"];
                }
            }
            $cost_name = $name;
        }

        if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
            $budget_name = $db->GetDataBySQL("SELECT c_name FROM dbo.dc_expense_budget_type WHERE dc_expense_budget_type_id = ?;", array($_REQUEST["dc_expense_budget_type_id"]));
        } else {
            $budget_name = "ทั้งหมด";
        }

        if ($_REQUEST["po_creditor_id"] > 0) {
            $creditor_name = $db->GetDataBySQL("SELECT c_name FROM dbo.po_creditor WHERE po_creditor_id = ?;", array($_REQUEST["po_creditor_id"]));
        } else {
            $creditor_name = "ทั้งหมด";
        }

        echo "<div align='center'><strong>(" . $cost_name . ")</strong></div>";
        echo "<div align='center'><strong>ทำทะเบียนจ่ายวันที่ " . $date->shot_date_from_db($_REQUEST["d_date_start"]) . " ถึงวันที่ " . $date->shot_date_from_db($_REQUEST["d_date_end"]) . "</strong></div>";
        ?>
        <div style="position: relative; font-size: 11px; margin: 5px 10px;">
            <div style="position: relative; left: 2px;">แหล่งเงิน : <?= $budget_name; ?></div>
            <div style="position: relative; left: 2px;">จ่ายให้ : <?= $creditor_name; ?></div>
        </div>
        <div class='class-t'>
            <div class='hh'>
                <div style="position: relative; left: 2px;">จำนวนฏีกาทั้งหมด : <?= $data_dtl["totalCount"]; ?></div>
                <div style="position: relative; left: 2px;">ไม่เกิน 15 วัน : <?= $data_dtl["i_than15"]; ?></div>
                <div style="position: relative; left: 2px;">ไม่เกิน 30 วัน : <?= $data_dtl["i_than30"]; ?></div>
                <div style="position: relative; left: 2px;">ไม่เกิน 60 วัน : <?= $data_dtl["i_than60"]; ?></div>
                <div style="position: relative; left: 2px;">ไม่เกิน 90 วัน : <?= $data_dtl["i_than90"]; ?></div>
                <div style="position: relative; left: 2px;">มากกว่า 90 วัน : <?= $data_dtl["i_over90"]; ?></div>
            </div>
            <div class='hh'>
                <div style="position: relative; left: 2px;">จำนวนทักท้วงทั้งหมด : <?= $data_dtl["ii_protest"]; ?></div>
                <div style="position: relative; left: 2px;">แก้ไขทักท้วงภายใน 5 วันทำการ : <?= $data_dtl["ii_stop_date_n"]; ?></div>
                <div style="position: relative; left: 2px;">แก้ไขทักท้วงเกิน 5 วันทำการ : <?= $data_dtl["ii_stop_date_h"]; ?></div>
            </div>
            <div class='hh'>
                <div style="position: relative; left: 2px;">เบิกจ่ายฏีกาภายใน 15 วัน : <?= $data_dtl["i_than15"]; ?></div>
                <div style="position: relative; left: 2px;">ไม่มีการทักท้วง : <?= $data_dtl["ii_than15_n"]; ?></div>
                <div style="position: relative; left: 2px;">มีการทักท้วง : <?= $data_dtl["ii_than15_h"]; ?></div>
            </div>
            <div class='hh'>
                <div style="position: relative; left: 2px;">เบิกจ่ายฏีกาภายใน 30 วัน : <?= $data_dtl["i_than30"]; ?></div>
                <div style="position: relative; left: 2px;">ไม่มีการทักท้วง : <?= $data_dtl["ii_than30_n"]; ?></div>
                <div style="position: relative; left: 2px;">มีการทักท้วง : <?= $data_dtl["ii_than30_h"]; ?></div>
            </div>
            <div class='hh'>
                <div style="position: relative; left: 2px;">เบิกจ่ายฏีกาเกิน 30 วัน : <?= $data_dtl["i_over60"]; ?></div>
                <div style="position: relative; left: 2px;">ไม่มีการทักท้วง : <?= $data_dtl["i_over60_n"]; ?></div>
                <div style="position: relative; left: 2px;">มีการทักท้วง : <?= $data_dtl["i_over60_h"]; ?></div>
                <!-- <div style="position: relative; left: 2px; margin-top: 5px;">เบิกจ่ายฏีกาเกิน 30 วัน : <?= $data_dtl["i_over60"]; ?></div>
                <div style="position: relative; left: 2px;">ไม่มีการทักท้วง : <?= $data_dtl["i_over60_n"]; ?></div>
                <div style="position: relative; left: 2px;">มีการทักท้วง : <?= $data_dtl["i_over60_h"]; ?></div> -->
            </div>
        </div>
        <div style="position: relative; font-size: 11px; margin: 5px 10px;">
            <div style="position: relative; left: 2px; color: red;">** กรณีอ้างอิงใบเบิกนับวันที่ฝ่ายคลังรับใบเบิกเดิม</div>
        </div>
        <div class="table-overflow">
            <table id='tb_main' class="table_report" style=" width: 2000px; display:none" border="0" cellspacing="1" cellpadding="0">
                <thead valign="top">
                    <tr>
                        <th style="vertical-align:middle;" nowrap>ลำดับที่</th>
                        <th style='vertical-align:middle;' nowrap>หน่วยงาน</th>
                        <th style='vertical-align:middle;' nowrap>ประเภทงบ</th>
                        <th style='vertical-align:middle;' nowrap>จ่ายให้บริษัท</th>
                        <th style='vertical-align:middle;' nowrap>เลขที่ขอเบิก</th>
                        <th style='vertical-align:middle;' nowrap>เลขที่ฎีกา</th>
                        <th style='vertical-align:middle;' nowrap>ฝ่ายคลังรับใบขอเบิก</th>
                        <th style='vertical-align:middle;' nowrap>ทำทะเบียนจ่าย</th>
                        <th style='vertical-align:middle;' nowrap>จำนวน<br>วันที่ดำเนินการ</th>
                        <th style='vertical-align:middle;' nowrap>ทักท้วง</th>
                        <th style='vertical-align:middle;' nowrap>ผู้อนุมัติฏีกา</th>
                    </tr>
                </thead>
                <?= $tbody ?>
            </table>
        </div>
    </div>
</body>

</html>
<script>
    document.getElementById('tb_main').style.width = "100%";
    document.getElementById("tb_main").style.display = "table";
    document.getElementById('loader_display').style.display = "none";
</script>
<script src="../../js/jquery/3.4.1/jquery.min.js"></script>
<script src="../../css/report.js"></script>