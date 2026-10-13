<?php
include("../api/List_RepAssetReport.php");

include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$s_title = true;
$title = CUSTOMER_NAME_TH;

$caption = "รายงานสินทรัพย์ประกอบงบการเงิน ปีงบประมาณ " . ($_REQUEST['i_year'] + 543);

if ($_REQUEST["type"] == "excel") {
    $export->headerExcel($caption);
}

function changeNumFormat($val)
{
    if ($val > 0) {
        $val = number_format($val, 2);
    } else if ($val < 0) {
        $val = "<font color=red>(" . number_format(abs($val), 2) . ")</font>";
    } else {
        $val = "-";
    }
    return $val;
}
$row_name = array("ที่ดิน อาคาร และอุปกรณ์ - สุทธิ", "ราคาทุน", "ค่าเสื่อมราคาสะสม");
$data_dtl = json_decode(List_QueryParam(), true);
if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {

    $tbody = "<tbody>";

    foreach ($data_dtl["data"] as $index => $jObj) {
        // if ($jObj["i_type"] == '1') {
        $style = "";
        if ($jObj["i_type"][1] == '0') {
            $style = "background-color:#E7EFFF;";
        }
        if ($jObj["i_type"][0] == '0') {
            $style = "background-color:#EEE;";
        }
        if ($jObj["i_type"][1] == '1') {
            $tbody .= "<tr>";
            $tbody .= "<td style='" . $style . "' align='left' colspan=9 nowrap><b>" . $row_name[$jObj["i_type"][0]] . " :</b></td>";
            $tbody .= "</tr>";
        }
        $tbody .= "<tr>";

        $d_text = "";
        if ($jObj["i_type"][1] == '1') {
            $d_text = " 1 ตุลาคม " . ($_REQUEST['i_year'] + 543 - 1);
        } else if ($jObj["i_type"][1] == '0') {
            $d_text = " 30 กันยายม " . ($_REQUEST['i_year'] + 543);
        }


        $tbody .= "<td style='" . $style . "' align='left' nowrap>&nbsp;&nbsp;&nbsp;&nbsp;" . $jObj["c_name"] . $d_text . "</td>";
        $tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . changeNumFormat($jObj["f_total_0601"]) . "</td>";
        $tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . changeNumFormat($jObj["f_total_0500"]) . "</td>";
        $tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . changeNumFormat($jObj["f_total_0201"]) . "</td>";
        $tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . changeNumFormat($jObj["f_total_0212"]) . "</td>";
        $tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . changeNumFormat($jObj["f_total_0213"]) . "</td>";
        $tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . changeNumFormat($jObj["f_total_0000"]) . "</td>";
        $tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . changeNumFormat(0.00) . "</td>";
        $tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . changeNumFormat($jObj["f_total"]) . "</td>";
        $tbody .= "</tr>";
    }
    $tbody .= "</tbody>";
} else {
    $tbody = "<tbody><tr><td align='center' colspan=18 nowrap>ไม่มีข้อมูล</td></tr></tbody>";
}

?>
<html>

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title><?php echo COMPANY_NAME; ?></title>
    <link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
</head>
<style>
    .ol1 {
        background-color: #E1F5D8;
    }

    .ol2 {
        background-color: #F5F3D8;
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

<div id="loader_display" style="display: flex; padding: 15px 15px; font-size:14px;">
    <div class="loader"></div>
    <p>&nbsp;&nbsp;กำลังโหลดข้อมูลตารางกรุณารอสักครู่...</p>
</div>

<body style="padding-left: 20px; padding-right: 20px;">
    <div class="outer">
        <?php
        if ($s_title == true)
            echo "<div align='center'><strong>" . $title . "</strong></div>";
        echo "<div align='center'><strong>" . $caption . "</strong></div>";
        ?>
        <div style="position: relative; font-size: 11px; margin: 5px 10px;">
        </div>
        <div class="table-overflow">
            <table id='tb_main' width="100%" class="table_report" style=" width: 2000px; display:none" border="0" cellspacing="1" cellpadding="0">
                <thead valign="top">
                    <tr>
                        <th style="vertical-align:middle;" rowspan=0 nowrap></th>
                        <th style="vertical-align:middle;" rowspan=0 nowrap>ที่ดิน</th>
                        <th style="vertical-align:middle;" rowspan=0 nowrap>อาคารและ<br>สิ่งปลุกสร้าง</th>
                        <th style="vertical-align:middle;" rowspan=0 nowrap>ครุภัณฑ์สำนักงาน</th>
                        <th style="vertical-align:middle;" rowspan=0 nowrap>&nbsp;ครุภัณฑ์วิทยาศาสตร์<br>และการแพทย์&nbsp;</th>
                        <th style="vertical-align:middle;" rowspan=0 nowrap>ครุภัณฑ์คอมพิวเตอร์</th>
                        <th style="vertical-align:middle;" rowspan=0 nowrap>ครุภัณฑ์อื่นๆ</th>
                        <th style="vertical-align:middle;" rowspan=0 nowrap>งานระหว่าง<br>ดำเนินการ</th>
                        <th style="vertical-align:middle;" rowspan=0 nowrap>รวม</th>
                    </tr>
                </thead>
                <?= $tbody ?>
            </table>
        </div>
    </div>
</body>
<script>
    document.getElementById('tb_main').style.width = "100%";
    document.getElementById("tb_main").style.display = "table";
    document.getElementById('loader_display').style.display = "none";
</script>

</html>
<script src="../../js/jquery/3.4.1/jquery.min.js"></script>
<script src="../../css/report.js"></script>