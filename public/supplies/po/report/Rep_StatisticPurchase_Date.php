<?php
include("../api/List_RepStatisticPurchase_Date.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$s_title = true;
$title = CUSTOMER_NAME_TH;

$data_dtl = json_decode(List_QueryParam(), true);
if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {

    $tbody = "<tbody>";

    foreach ($data_dtl["data"] as $index => $jObj) {

        $style = "";

        if ($jObj["i_stop"] == 1) {
            $style = "style='background: #fffedb;'";
        } else if ($jObj["i_stop"] == 2) {
            $style = "style='background: #ffe1e1;'";
        }

        $tbody .= "<tr $style>";
        $tbody .= "<td align='center' nowrap>" . $jObj["no"] . "</td>";
        $tbody .= "<td align=center>" . $jObj["day"] . "</td>";
        $tbody .= "<td align=center>" . $jObj["d_date"] . "</td>";
        $tbody .= "<td align=center>" . $jObj["c_name"] . "</td>";
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
</head>

<body>
    <div class="outer">
        <div style="position: relative; font-size: 11px; margin: 5px 10px;">
            <div style="background: #fffedb; width: 9px; height: 9px; border: 1px solid #e0e0e0; position: absolute;"></div>
            <div style="position: relative; margin-left: 20px; top: -3px;">วันหยุดประจำเดือน</div>
            <div style="background: #ffe1e1; width: 9px; height: 9px; border: 1px solid #e0e0e0; position: absolute;"></div>
            <div style="position: relative; margin-left: 20px; top: -3px;">วันที่ทักท้วง</div>
        </div>
        <div class="table-overflow">
            <table class="table_report" width="100%" border="0" cellspacing="1" cellpadding="0">
                <thead valign="top">
                    <tr>
                        <th style="vertical-align:middle;" nowrap>จำนวนวัน</th>
                        <th style='vertical-align:middle;' nowrap>วัน</th>
                        <th style='vertical-align:middle;' nowrap>วันที่</th>
                        <th style='vertical-align:middle;' nowrap>วันหยุด</th>
                    </tr>
                </thead>
                <?= $tbody ?>
            </table>
        </div>
    </div>
</body>

</html>
<script src="../../js/jquery/3.4.1/jquery.min.js"></script>
<script src="../../css/report.js"></script>