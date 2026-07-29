<?php
include("../api/List_RepStatisticPersonnel.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$s_title = true;
$title = CUSTOMER_NAME_TH;

$caption = "รายงานสถิติการทำงานบุคลากร (PA)";

if ($_REQUEST["type"] == "excel") {
    $export->headerExcel($caption);
}

$c_status = ($_REQUEST["i_status"] > 0) ? $CONF_I_STATUS[$_REQUEST["i_status"]] : "ทั้งหมด";

$data_dtl = json_decode(List_QueryParam(), true);
if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {

    $tbody = "";
    $table = "";
    foreach ($data_dtl["data"] as $index => $jObj) {

        $style = "";
        if ($jObj["i_type"] == 1) {
            $table  .= "
                <div name = 'tb_main' style='page-break-after: always; display: none;'>
                    <div align='center'><strong>{$title}</strong></div>
                    <div align='center'><strong>{$caption}</strong></div>
                    <div align='center'><strong>รับเอกสารระหว่างวันที่ " . $date->shot_date_from_db($_REQUEST["d_date_start"]) . " ถึงวันที่ : " . $date->shot_date_from_db($_REQUEST["d_date_end"]) . "</strong></div>
                    <div style='position: relative; font-size: 11px; margin: 5px 10px;'>
                        <div style='position: relative; left: 2px;'>ชื่อ : {$jObj["c_full_name"]}</div>
                        <div style='position: relative; left: 2px;'>สถานะ : {$c_status}</div>
                    </div>
                    <table name = 'tb_main2' class='table_report' width='100%' border='0' cellspacing='1' cellpadding='0'>
                        <thead valign='top'>
                            <tr>
                                <th style='vertical-align:middle;' rowspan=2 nowrap>ลำดับที่</th>
                                <th style='vertical-align:middle;' rowspan=2 nowrap>เลขที่ใบขอเบิก</th>
                                <th style='vertical-align:middle;' rowspan=2 nowrap>เลขที่ฏีกา</th>
                                <th style='vertical-align:middle;' colspan=2 nowrap>รับเอกสาร</th>
                                <th style='vertical-align:middle;' colspan=2 nowrap>ส่งเอกสาร</th>
                                <th style='vertical-align:middle;' rowspan=2 nowrap>จำนวนวันที่<br>ดำเนินการ</th>
                                <th style='vertical-align:middle;' rowspan=2 nowrap>หมายเหตุ</th>
                            </tr>
                            <tr>
                                <th style='vertical-align:middle;' nowrap>สถานะ</th>
                                <th style='vertical-align:middle;' nowrap>วันที่</th>
                                <th style='vertical-align:middle;' nowrap>สถานะ</th>
                                <th style='vertical-align:middle;' nowrap>วันที่</th>
                            </tr>
                        </thead>
                        <tbody>
                        {$tbody}
                        </tbody>
                    </table><br>
                </div>";
            $tbody = "";
        } else {
            if ($jObj["i_status"] == 4 && $jObj["i_count_protest"] >= 1) {
                $span = "<span style='font-size: 10px; margin-top: -4px; position: absolute; margin-left: 4px; color: red;'>-{$jObj["i_count_protest"]}</span>";
            } else {
                $span = "";
            }

            if ($jObj["c_code_parent"] != "") {
                $c_code = "<span style='font-size: 11px; color: red;'>" . $jObj["c_code_parent"] . "</span><br>" . $jObj["c_code"];
            } else {
                $c_code = $jObj["c_code"];
            }
            $tbody .= "<tr $style>";
            $tbody .= "<td align='center' nowrap>" . $jObj["no"] . "</td>";
            $tbody .= "<td align='center' style='mso-number-format:\@;' nowrap>" . $c_code . "</td>";
            $tbody .= "<td align='center' style='mso-number-format:\@;' nowrap>" . $jObj["c_approve"] . "</td>";
            $tbody .= "<td align='center' nowrap>" . $jObj["c_status_before"] . "</td>";
            $tbody .= "<td align='center' nowrap>" . $jObj["d_receive_date"] . "</td>";
            $tbody .= "<td align='center' nowrap>" . $jObj["c_status"] . "</td>";
            $tbody .= "<td align='center' nowrap>" . $jObj["d_send_date"] . "</td>";
            $tbody .= "<td align='center' style='mso-number-format:\@;' nowrap>" . $jObj["i_count"] . $span . "</td>";
            $tbody .= "<td align='left'><pre>" . $jObj["c_comment"] . "</pre></td>";
            $tbody .= "</tr>";
        }
    }
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
    <div id='div_set_width' width='100%'></div>
    <?= $table; ?>
</body>

</html>
<script>
    var width_screen = document.getElementById("div_set_width").getBoundingClientRect().width;
    for (var i = 0; i < document.getElementsByName("tb_main").length; i++) {
        document.getElementsByName('tb_main2')[i].style.width = width_screen - 20 + "px";
        document.getElementsByName("tb_main")[i].style.display = "table";
    }
    document.getElementById('loader_display').style.display = "none";
</script>
<script src="../../js/jquery/3.4.1/jquery.min.js"></script>
<script src="../../css/report.js"></script>