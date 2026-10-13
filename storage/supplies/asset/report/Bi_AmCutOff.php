<?php
include("../api/List_BiAmCutOff.php");

include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$s_title = true;
$title = CUSTOMER_NAME_TH;

$caption = "รายงานสินทรัพย์ตัดจำหน่ายแต่ละประเภท";

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
    $f_acc_cost = 0;
    // foreach ($data_dtl["data"] as $jObj) {
    // $f_acc_cost += $jObj["i_type"] != 99 ? $jObj["f_acc_cost"] : 0;
    // }

    $tbody = "<tbody>";

    foreach ($data_dtl["data"] as $index => $jObj) {
        if ($jObj["i_type"] != 99) {
            $style = "";
            $tbody .= "<td style='" . $style . "' align='center' nowrap>" . $jObj["no"] . "</td>";
            $tbody .= "<td style='" . $style . "' align='center' nowrap>" . $jObj["c_acc_code"] . "</td>";
            $tbody .= "<td style='" . $style . "' align='left' nowrap>" . $jObj["c_acc_name"] . "</td>";
            $tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . number_format($jObj["count_bging"]) . "</td>";
            $tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . number_format($jObj["count_cut"]) . "</td>";
            $tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . number_format($jObj["count_cut"] / ($jObj["count_bging"]) * 100, 2)  . " %</td>";
            $tbody .= "</tr>";
        } else {
            $style = "background-color:#EEE;";
            $tbody .= "<tr>";
            $tbody .= "<td colspan=3 style='" . $style . "' align='right'><b>รวมทั้งหมด :</b></td>";
            $tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["count_bging"])  . "</b></td>";
            $tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["count_cut"])  . "</b></td>";
            $tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["count_cut"] / ($jObj["count_bging"]) * 100, 2)  . " %</b></td>";
            // $tbody .= "<td style='" . $style . "' align='right'><b></b></td>";
            $tbody .= "</tr>";
        }
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
    <link rel="stylesheet" type="text/css" href="../../css/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
    <link rel="stylesheet" type="text/css" href="../../css/dashboard.css" />
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

<body>
    <div style="background-color:#FFFFFF;">
        <?php
        if ($s_title == true)
            echo "<div align='center'><strong></strong></div>";
        echo "<div align='center'><strong>" . $title . "</strong></div>";
        echo "<div align='center'><strong>" . $caption . "</strong></div>";
        echo "<div align='center'><strong> ประจำปีงบประมาณ " .  ($_REQUEST['i_year'] + 543) . "</strong></div>";
        ?>
        <div class="table-overflow">
            <table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0">
                <thead valign="top">
                    <tr>
                        <th style="vertical-align:middle;" nowrap>ลำดับ</th>
                        <th style="vertical-align:middle;" nowrap>รหัสสินทรัพย์</th>
                        <th style="vertical-align:middle;" nowrap>ชื่อสินทรัพย์</th>
                        <th style="vertical-align:middle;" nowrap>จำนวนสินทรัพย์</th>
                        <th style="vertical-align:middle;" nowrap>จำนวนตัดจำหน่าย</th>
                        <th style="vertical-align:middle;" nowrap>(%)</th>

                </thead>
                <?= $tbody ?>
            </table>
        </div>
    </div>
    <!-- <div id="bar-analysis" class="div-c"></div> -->
    <div class="container-fluid">
        <div class="row" style="height: 65%">
            <div class="col-md-12"></div>
            <div class="col-md-12">
                <div class="container">
                    <div class="row" style="height: 100%">
                        <div class="col-md-12">
                            <div class="x_panel">
                                <div id="chart-analysis" class="hv-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>

</body>

</html>
<script src="../../js/jquery/3.4.1/jquery.min.js"></script>
<script src="../../css/report.js"></script>

<script src="../../js/echarts/echarts.js"></script>
<script src="../../js/echarts/macarons.js"></script>
<?php
include("../../lib/charts/charts.php");
$echart = new Charts();

/******** BarChart ********/
$chart_element_id = 'chart-analysis';
$title_text = '';
$title_subtext = '';
$title_align = 'center';

$backgroundColor = '#FFFFFF';

$legend_data = array("ตัดจำหน่าย", "สินทรัพย์"); // 
$legend_color = array("#FF9E12", "#516b91");

$yAxis_name = '(จำนวน)';
$one_bar = true;
$show_bar_label = true;
$label_to_percen = true;
$position_bar_label = array("inside", "inside");
$data = array();
$data = null;;

foreach ($data_dtl["data"] as $index => $jObj) {
    if ($jObj["i_type"] != 99) {
        // if ($jObj["count_cut"] != 0) {
        $temp = array(
            "name" => $jObj["c_acc_name"],
            "value1" => $jObj["count_cut"],
            "value2" => $jObj["count_bging"] - $jObj["count_cut"],
        );
        $data[] = $temp;
        // }
    }
}

$echart->BarChart(
    $chart_element_id,
    $title_text,
    $title_subtext,
    $title_align,
    $backgroundColor,
    $legend_data,
    $legend_color,
    $yAxis_name,
    $one_bar,
    $show_bar_label,
    $label_to_percen,
    $position_bar_label,
    $data
);

// /******** PieChart ********/
// $chart_element_id = 'chart-analysis';
// $title_text = '';
// $title_subtext = '';
// $title_align = 'center';

// $backgroundColor = '#FFFFFF';
// $radius = "50%";
// $show_bar_label = true;
// $position_bar_label = array("inside");
// $data = null;

// foreach ($data_dtl["data"] as $index => $jObj) {
//     if ($jObj["i_type"] != 99) {
//         // if ($jObj["f_acc_cost"] != 0) {
//             $temp = array(
//                 "name"      => $jObj["c_acc_name"],
//                 "value"     => $jObj["count_bging"],
//             );
//             $data[] = $temp;
//         // }
//     }
// }

// $echart->PieChart(
//     $chart_element_id,
//     $title_text,
//     $title_subtext,
//     $title_align,
//     $backgroundColor,
//     $radius,
//     $show_bar_label,
//     $position_bar_label,
//     $data,
// );

?>