<?php
include("../api/List_RepStatisticDetail.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$s_title = true;
$title = CUSTOMER_NAME_TH;
$caption = "รายงานทะเบียนคุมสถิติการเบิกจ่าย";

if ($_REQUEST["type"] == "excel") {
    $export->headerExcel($caption);
}

$data_dtl = json_decode(List_QueryParam(), true);
if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {

    $tbody = "<tbody>";

    foreach ($data_dtl["data"] as $index => $jObj) {

        if ($jObj["i_enable"] == 2) {
            $style = "style='text-decoration: underline;'";
        } else if ($jObj["i_success"] == 1) {
            $style = "style='background: #e4fffe;'";
        } else {
            $style = "";
        }

        if ($jObj["i_close_receive"] == 1) {
            $img = "<img src='../../images/check_yes1.gif' height='15' width='15'>";
        } else {
            $img = "<img src='../../images/check_no1.gif' height='15' width='15'>";
        }

        $tbody .= "<tr $style>";
        $tbody .= "<td align='center' nowrap>" . $jObj["no"] . "</td>";
        $tbody .= "<td>" . $jObj["dc_cost_name"] . "</td>";
        $tbody .= "<td>" . $jObj["dc_expense_budget_type_name"] . "</td>";
        $tbody .= "<td>" . $jObj["po_creditor_name"] . "</td>";
        $tbody .= "<td align=center style='mso-number-format:\@;' nowrap>" . $jObj["c_code_ref"] . "</td>";
        $tbody .= "<td align=center style='mso-number-format:\@;' nowrap>" . $jObj["c_approve"] . "</td>";
        $tbody .= "<td align='center' nowrap>" . $jObj["s_audit_date"] . "</td>";
        $tbody .= "<td align='center' nowrap>" . $jObj["s_doc_date"] . "</td>";
        $tbody .= "<td align='center' nowrap style='background: #ececec;'>";
        // ระยะเวลา ตรวจรับ จนถึง จัดทำใบขอเบิก
        $tbody .= "<a class='text-hover' href='./Rep_CountDate.php?po_working_hdr_id={$jObj["po_working_hdr_id"]}&i_status=1&d_start={$jObj["d_audit_date"]}&d_end={$jObj["d_doc_date"]}' target='Rep_CountDate'>" . $jObj["count_date1"] . "</a>";
        $tbody .= "</td>";
        $tbody .= "<td align='center' nowrap>" . $jObj["s_inv_date"] . "</td>";
        // ระยะเวลา จัดทำใบขอเบิก จนถึง ฝ่ายคลังรับใบขอเบิก
        $tbody .= "<td align='center' nowrap style='background: #ececec;'>";
        $tbody .= "<a class='text-hover' href='./Rep_CountDate.php?po_working_hdr_id={$jObj["po_working_hdr_id"]}&i_status=2&d_start={$jObj["d_doc_date"]}&d_end={$jObj["d_inv_date"]}' target='Rep_CountDate'>" . $jObj["count_date2"] . "</a>";
        $tbody .= "</td>";
        $tbody .= "<td align='center' nowrap>" . $jObj["s_doc_date3"] . "</td>";
        $tbody .= "<td align='center' nowrap>" . $jObj["s_receive_date3"] . "</td>";
        $tbody .= "<td align='center' nowrap>" . $jObj["i_protest"] . "</td>";
        // ระยะเวลา ทักท้วง จนถึง รับคืนทักท้วง
        $tbody .= "<td align='center' nowrap style='background: #ececec;'>";
        $tbody .= "<a class='text-hover' href='./Rep_CountDate.php?po_working_hdr_id={$jObj["po_working_hdr_id"]}&i_status=3&d_start={$jObj["d_doc_date3"]}&d_end={$jObj["d_receive_date3"]}' target='Rep_CountDate'>" . $jObj["count_date3"] . "</a>";
        $tbody .= "</td>";
        $tbody .= "<td align='center' nowrap>" . $jObj["s_approve_date"] . "</td>";
        // ระยะเวลา รับใบขอเบิก จนถึง อนุมัติฏีกา
        $tbody .= "<td align='center' nowrap style='background: #ececec;'>";
        $tbody .= "<a class='text-hover' href='./Rep_CountDate.php?po_working_hdr_id={$jObj["po_working_hdr_id"]}&i_status=4&d_start={$jObj["d_inv_date"]}&d_end={$jObj["d_approve_date"]}' target='Rep_CountDate'>" . $jObj["count_date4"] . "</a>";
        $tbody .= "</td>";
        $tbody .= "<td align='center' nowrap>" . $jObj["s_doc_date5"] . "</td>";
        // ระยะเวลา อนุมัติฏีกา จนถึง หักงบประมาณ
        $tbody .= "<td align='center' nowrap style='background: #ececec;'>";
        $tbody .= "<a class='text-hover' href='./Rep_CountDate.php?po_working_hdr_id={$jObj["po_working_hdr_id"]}&i_status=5&d_start={$jObj["d_approve_date"]}&d_end={$jObj["d_doc_date5"]}' target='Rep_CountDate'>" . $jObj["count_date5"] . "</a>";
        $tbody .= "</td>";
        $tbody .= "<td align='center' nowrap>" . $jObj["s_doc_date6"] . "</td>";
        // ระยะเวลา หักงบประมาณ จนถึง หัวหน้าฝ่ายการคลังลงนาม
        $tbody .= "<td align='center' nowrap style='background: #ececec;'>";
        $tbody .= "<a class='text-hover' href='./Rep_CountDate.php?po_working_hdr_id={$jObj["po_working_hdr_id"]}&i_status=6&d_start={$jObj["d_doc_date5"]}&d_end={$jObj["d_doc_date6"]}' target='Rep_CountDate'>" . $jObj["count_date6"] . "</a>";
        $tbody .= "</td>";
        $tbody .= "<td align='center' nowrap>" . $jObj["s_doc_date7"] . "</td>";
        // ระยะเวลา หัวหน้าฝ่ายการคลังลงนาม จนถึง ผู้บริหารลงนาม
        $tbody .= "<td align='center' nowrap style='background: #ececec;'>";
        $tbody .= "<a class='text-hover' href='./Rep_CountDate.php?po_working_hdr_id={$jObj["po_working_hdr_id"]}&i_status=7&d_start={$jObj["d_doc_date6"]}&d_end={$jObj["d_doc_date7"]}' target='Rep_CountDate'>" . $jObj["count_date7"] . "</a>";
        $tbody .= "</td>";
        $tbody .= "<td align='center' nowrap>" . $jObj["s_doc_date8"] . "</td>";
        // ระยะเวลา ผู้บริหารลงนาม จนถึง จัดทำเช็ค
        $tbody .= "<td align='center' nowrap style='background: #ececec;'>";
        $tbody .= "<a class='text-hover' href='./Rep_CountDate.php?po_working_hdr_id={$jObj["po_working_hdr_id"]}&i_status=8&d_start={$jObj["d_doc_date7"]}&d_end={$jObj["d_doc_date8"]}' target='Rep_CountDate'>" . $jObj["count_date8"] . "</a>";
        $tbody .= "</td>";
        $tbody .= "<td align='center' nowrap>" . $jObj["s_doc_date9"] . "</td>";
        // ระยะเวลา จัดทำเช็ค จนถึง หัวหน้าฝ่ายการคลังลงนาม
        $tbody .= "<td align='center' nowrap style='background: #ececec;'>";
        $tbody .= "<a class='text-hover' href='./Rep_CountDate.php?po_working_hdr_id={$jObj["po_working_hdr_id"]}&i_status=9&d_start={$jObj["d_doc_date8"]}&d_end={$jObj["d_doc_date9"]}' target='Rep_CountDate'>" . $jObj["count_date9"] . "</a>";
        $tbody .= "</td>";
        $tbody .= "<td align='center' nowrap>" . $jObj["s_doc_date10"] . "</td>";
        // ระยะเวลา หัวหน้าฝ่ายการคลังลงนาม จนถึง ผู้บริหารลงนาม
        $tbody .= "<td align='center' nowrap style='background: #ececec;'>";
        $tbody .= "<a class='text-hover' href='./Rep_CountDate.php?po_working_hdr_id={$jObj["po_working_hdr_id"]}&i_status=10&d_start={$jObj["d_doc_date9"]}&d_end={$jObj["d_doc_date10"]}' target='Rep_CountDate'>" . $jObj["count_date10"] . "</a>";
        $tbody .= "</td>";
        $tbody .= "<td align='center' nowrap>" . $jObj["s_doc_date11"] . "</td>";
        // ระยะเวลา ผู้บริหารลงนาม จนถึง ทำทะเบียนจ่าย
        $tbody .= "<td align='center' nowrap style='background: #ececec;'>";
        $tbody .= "<a class='text-hover' href='./Rep_CountDate.php?po_working_hdr_id={$jObj["po_working_hdr_id"]}&i_status=11&d_start={$jObj["d_doc_date10"]}&d_end={$jObj["d_doc_date11"]}' target='Rep_CountDate'>" . $jObj["count_date11"] . "</a>";
        $tbody .= "</td>";
        $tbody .= "<td align='center' nowrap>" . $img . "</td>";
        $tbody .= "</tr>";
    }

    $tbody .= "</tbody>";
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

        echo "<div align='center'><strong>" . $caption . "</strong></div>";
        echo "<div align='center'><strong>ฝ่ายคลังรับระหว่างวันที่ " . $date->shot_date_from_db($_REQUEST["d_date_start"]) . " ถึงวันที่ : " . $date->shot_date_from_db($_REQUEST["d_date_end"]) . "</strong></div>";

        $c_user = (@$_REQUEST["dc_approve_id"] > 0) ? $db->GetDataBySQL("SELECT c_full_name FROM dc_user WHERE dc_user_id = ?;", array($_REQUEST["dc_approve_id"])) : "ทั้งหมด";
        ?>
        <div style="position: relative; font-size: 11px; margin: 5px 10px;">
            <div style="background: #e4fffe; width: 9px; height: 9px; border: 1px solid #e0e0e0; position: absolute;"></div>
            <div style="position: relative; margin-left: 20px; top: -3px;">ทำทะเบียนจ่ายแล้ว</div>
        </div>
        <div style="position: relative; font-size: 11px; margin: 5px 10px;">
            <div style="position: relative; margin-left: 0px; top: -6px;">ผู้อนุมัติฏีกา :
                <?= $c_user ?>
            </div>
        </div>
        <div class="table-overflow">
            <table id='tb_report' style="width: 2000px; display:none" class="table_report" border="0" cellspacing="1" cellpadding="0">
                <thead valign="top">
                    <tr>
                        <th style="vertical-align:middle; mso-number-format:\@;" rowspan=2 nowrap>ลำดับที่</th>
                        <th style='vertical-align:middle; mso-number-format:\@;' rowspan=2 nowrap>หน่วยงาน</th>
                        <th style='vertical-align:middle; mso-number-format:\@;' rowspan=2 nowrap>ประเภทงบ</th>
                        <th style='vertical-align:middle; mso-number-format:\@;' rowspan=2 nowrap>จ่ายให้บริษัท</th>
                        <th style='vertical-align:middle; mso-number-format:\@;' rowspan=2 nowrap>เลขที่ขอเบิก</th>
                        <th style='vertical-align:middle; mso-number-format:\@;' rowspan=2 nowrap>เลขที่ฎีกา</th>
                        <th style='vertical-align:middle; mso-number-format:\@;' nowrap>ตรวจรับ</th>
                        <th style='vertical-align:middle; mso-number-format:\@;' nowrap>(1)<br>จัดทำใบขอเบิก</th>
                        <th style='vertical-align:middle; mso-number-format:\@; color: red;' rowspan=2 nowrap>ระยะเวลา<br>ตรวจรับ<br>จนถึง<br>จัดทำใบขอเบิก</th>
                        <th style='vertical-align:middle; mso-number-format:\@;' nowrap>(2)<br>ฝ่ายคลัง<br>รับใบขอเบิก</th>
                        <th style='vertical-align:middle; mso-number-format:\@; color: red;' rowspan=2 nowrap>(1 - 2)<br>ระยะเวลา<br>จัดทำใบขอเบิก<br>จนถึง<br>ฝ่ายคลังรับใบขอเบิก</th>
                        <th style='vertical-align:middle; mso-number-format:\@;' colspan=2 nowrap>(3)<br>ทักท้วง</th>
                        <th style='vertical-align:middle; mso-number-format:\@;' rowspan=2 nowrap>จำนวนทักท้วง</th>
                        <th style='vertical-align:middle; mso-number-format:\@; color: red;' rowspan=2 nowrap>ระยะเวลา<br>ทักท้วง<br>จนถึง<br>รับคืนทักท้วง</th>
                        <th style='vertical-align:middle; mso-number-format:\@;' nowrap>(4)<br>อนุมัติฏีกา</th>
                        <th style='vertical-align:middle; mso-number-format:\@; color: red;' rowspan=2 nowrap>(2 - 4)<br>ระยะเวลา<br>รับใบขอเบิก<br>จนถึง<br>อนุมัติฏีกา</th>
                        <th style='vertical-align:middle; mso-number-format:\@;' nowrap>(5)<br>หักงบประมาณ</th>
                        <th style='vertical-align:middle; mso-number-format:\@; color: red;' rowspan=2 nowrap>(4 - 5)<br>ระยะเวลา<br>อนุมัติฏีกา<br>จนถึง<br>หักงบประมาณ</th>
                        <th style='vertical-align:middle; mso-number-format:\@;' nowrap>(6)<br>หัวหน้าฝ่ายการคลัง<br>ลงนาม</th>
                        <th style='vertical-align:middle; mso-number-format:\@; color: red;' rowspan=2 nowrap>(5 - 6)<br>ระยะเวลา<br>หักงบประมาณ<br>จนถึง<br>หัวหน้าฝ่ายการคลัง<br>ลงนาม</th>
                        <th style='vertical-align:middle; mso-number-format:\@;' nowrap>(7)<br>ผู้บริหารลงนาม</th>
                        <th style='vertical-align:middle; mso-number-format:\@; color: red;' rowspan=2 nowrap>(ุ6 - 7)<br>ระยะเวลา<br>หัวหน้าฝ่ายการคลัง<br>ลงนาม<br>จนถึง<br>ผู้บริหารลงนาม</th>
                        <th style='vertical-align:middle; mso-number-format:\@;' nowrap>(8)<br>จัดทำเช็ค</th>
                        <th style='vertical-align:middle; mso-number-format:\@; color: red;' rowspan=2 nowrap>(ุ7 - 8)<br>ระยะเวลา<br>ผู้บริหารลงนาม<br>จนถึง<br>จัดทำเช็ค</th>
                        <th style='vertical-align:middle; mso-number-format:\@;' nowrap>(9)<br>หัวหน้าฝ่ายการคลัง<br>ลงนาม<br>(ผู้ตรวจเช็ค)</th>
                        <th style='vertical-align:middle; mso-number-format:\@; color: red;' rowspan=2 nowrap>(ุ8 - 9)<br>ระยะเวลา<br>จัดทำเช็ค<br>จนถึง<br>หัวหน้าฝ่ายการคลัง<br>ลงนาม</th>
                        <th style='vertical-align:middle; mso-number-format:\@;' nowrap>(10)<br>ผู้บริหารลงนาม<br>(ผู้ตรวจเช็ค)</th>
                        <th style='vertical-align:middle; mso-number-format:\@; color: red;' rowspan=2 nowrap>(ุ9 - 10)<br>ระยะเวลา<br>หัวหน้าฝ่ายการคลัง<br>ลงนาม<br>จนถึง<br>ผู้บริหารลงนาม</th>
                        <th style='vertical-align:middle; mso-number-format:\@;' nowrap>(11)<br>ทำทะเบียนจ่าย</th>
                        <th style='vertical-align:middle; mso-number-format:\@; color: red;' rowspan=2 nowrap>(ุ10 - 11)<br>ระยะเวลา<br>ผู้บริหารลงนาม<br>จนถึง<br>ทำทะเบียนจ่าย</th>
                        <th style='vertical-align:middle; mso-number-format:\@;' rowspan=2 nowrap>นับวัน<br>หยุดเช็ค</th>
                    </tr>
                    <tr>
                        <th style="vertical-align: middle; mso-number-format:\@;" nowrap>วัน เดือน ปี</th>
                        <th style="vertical-align: middle; mso-number-format:\@;" nowrap>วัน เดือน ปี</th>
                        <th style="vertical-align: middle; mso-number-format:\@;" nowrap>วัน เดือน ปี</th>
                        <th style="vertical-align: middle; mso-number-format:\@;" nowrap>วันที่ส่ง</th>
                        <th style="vertical-align: middle; mso-number-format:\@;" nowrap>วันรับคืน</th>
                        <th style="vertical-align: middle; mso-number-format:\@;" nowrap>วัน เดือน ปี</th>
                        <th style="vertical-align: middle; mso-number-format:\@;" nowrap>วัน เดือน ปี</th>
                        <th style="vertical-align: middle; mso-number-format:\@;" nowrap>วัน เดือน ปี</th>
                        <th style="vertical-align: middle; mso-number-format:\@;" nowrap>วัน เดือน ปี</th>
                        <th style="vertical-align: middle; mso-number-format:\@;" nowrap>วัน เดือน ปี</th>
                        <th style="vertical-align: middle; mso-number-format:\@;" nowrap>วัน เดือน ปี</th>
                        <th style="vertical-align: middle; mso-number-format:\@;" nowrap>วัน เดือน ปี</th>
                        <th style="vertical-align: middle; mso-number-format:\@;" nowrap>วัน เดือน ปี</th>
                    </tr>
                </thead>
                <?= $tbody ?>
            </table>
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