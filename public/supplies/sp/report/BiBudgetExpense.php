<?php
include("../api/List_BiBudgetExpense.php");

include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$s_title = true;
$title = CUSTOMER_NAME_TH;

$caption = "รายงานการใช้งบประมาณในทุกๆ เดือน";

if ($_REQUEST["type"] == "excel") {
    $export->headerExcel($caption);
}

$name = "";
$for_id = explode(";", $_REQUEST["bg_expense_id_lv{$_REQUEST["i_expense"]}"]);
if (!in_array("0", $for_id)) {
    $in = "";
    foreach ($for_id as $val) {
        $in .= ($in == "") ? $val : ", " . $val;
    }
    $stmt = $db->QueryParam("SELECT c_name FROM  NMU.dbo.bg_expense WHERE bg_expense_id IN (" . $in . ")", array());

    if ($stmt) {
        $i_c_name = 0;
        while ($row = $db->Fetch($stmt)) {
            if ($i_c_name <= 10) {
                $name .= ($name == "") ? $row["c_name"] : ", " . $row["c_name"];
            }
            $i_c_name++;
        }
        $name .= $i_c_name > 10 ? ', ...(' . ($i_c_name - 10) . ')' : '';
    }
} else {
    $name = "เลือกทั้งหมด";
}
$budget_name = "แหล่งเงิน : <font color='blue'>เลือกทั้งหมด</font>";
if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
    $budget_type = $db->GetDataBySQL("SELECT c_name FROM dc_expense_budget_type WHERE dc_expense_budget_type_id = ?", array($_REQUEST["dc_expense_budget_type_id"]));
    $budget_name = "แหล่งเงิน : <font color='blue'>" . $budget_type . "</font>";
}
if ($_REQUEST["i_expense"] == 1) {
$for_id = explode(";", $_REQUEST["bg_expense_id_lv1"]);
$bg_expense1 = $for_id[0];
$bg_expense2 = @$for_id[1];
$bg_expense3 = @$for_id[2];
} else if ($_REQUEST["i_expense"] == 2) {
$for_id = explode(";", $_REQUEST["bg_expense_id_lv2"]);
$bg_expense1 = $for_id[0];
$bg_expense2 = @$for_id[1];
$bg_expense3 = @$for_id[2];
} else if ($_REQUEST["i_expense"] == 3) {
$for_id = explode(";", $_REQUEST["bg_expense_id_lv3"]);
$bg_expense1 = $for_id[0];
$bg_expense2 = @$for_id[1];
$bg_expense3 = @$for_id[2];
} else {
$for_id = explode(";", $_REQUEST["bg_expense_id_lv4"]);
$bg_expense1 = $for_id[0];
$bg_expense2 = @$for_id[1];
$bg_expense3 = @$for_id[2];
}
$bg_expense_col2 = null ; 
$bg_expense_col3 = null ; 
$bg_expense_name2 =null;
$bg_expense_name3 =null;

if ($bg_expense1 > 0) {
    $bg_expense_name1 = $db->GetDataBySQL("SELECT c_name FROM NMU.dbo.bg_expense WHERE bg_expense_id = {$bg_expense1} ", array($bg_expense1));
    // $budget_name = "แหล่งเงิน : <font color='blue'>" . $budget_type . "</font>";
}
if ($bg_expense2 > 0) {
    $bg_expense_name2 = $db->GetDataBySQL("SELECT c_name FROM NMU.dbo.bg_expense WHERE bg_expense_id = {$bg_expense2} ", array($bg_expense2));
    $bg_expense_col2 = '<th  width="20%" style="vertical-align:middle;" nowrap>'.$bg_expense_name2.'</th>';
    // $budget_name = "แหล่งเงิน : <font color='blue'>" . $budget_type . "</font>";
}
if ($bg_expense3 > 0) {
    $bg_expense_name3 = $db->GetDataBySQL("SELECT c_name FROM NMU.dbo.bg_expense WHERE bg_expense_id = {$bg_expense3} ", array($bg_expense3));
    $bg_expense_col3 = '<th  width="20%" style="vertical-align:middle;" nowrap>'.$bg_expense_name3.'</th>';
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
$data_dtl = json_decode(List_QueryParam(), true);
// echo($_REQUEST["i_expense"]);

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
            $tbody .= "<td style='" . $style . "' align='center' nowrap>" . $jObj["i_month"] . "</td>";
            // $tbody .= "<td style='" . $style . "' align='center' nowrap>" . $jObj["c_acc_code"] . "</td>";
            $tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . number_format($jObj["total1"]) . "</td>";
            if($bg_expense2 > 0) {$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . number_format($jObj["total2"]) . "</td>";}
            if($bg_expense3 > 0) {$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . number_format($jObj["total3"]) . "</td>";}

            // $tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . number_format($jObj["total3"]) . "</td>";
            // $tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . number_format($jObj["total4"]) . "</td>";
            // $tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . number_format($jObj["total5"]) . "</td>";
            $tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . number_format($jObj["f_sum"])  . " </td>";
            $tbody .= "</tr>";
        } else {
            $style = "background-color:#EEE;";
            $tbody .= "<tr>";
            $tbody .= "<td colspan=2 style='" . $style . "' align='right'><b>รวมทั้งหมด :</b></td>";
            $tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["total1"])  . "</b></td>";
            if($bg_expense2 > 0) {$tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["total2"])  . "</b></td>";}
            if($bg_expense3 > 0) {$tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["total3"])  . "</b></td>";}

            // $tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["total3"])  . "</b></td>";
            // $tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["total4"])  . "</b></td>";
            // $tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["total5"])  . "</b></td>";
            $tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["f_sum"])  . "</b></td>";
            // $tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["f_sum"] / ($jObj["total1"]) * 100, 2)  . " %</b></td>";
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
        <div style="position: relative; font-size: 11px; margin: 5px 10px;">
        <div style='position: relative; left: 2px;'><?= $budget_name ?></div>
            <div style='position: relative; left: 2px;'>หมวดค่าใช้จ่าย :  <font color='blue'><?= $name ?>  </font></div>

		</div>
        <div class="table-overflow">
            <table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0">
                <thead valign="top">
                    <tr>
                        <th width="5%"  style="vertical-align:middle;" nowrap>ลำดับ</th>
                        <!-- <th style="vertical-align:middle;" nowrap>ชื่อสินทรัพย์</th> -->
                        <th  width="10%"  style="vertical-align:middle;" nowrap>เดือน</th>
                        <th  width="20%" style="vertical-align:middle;" nowrap><?php echo $bg_expense_name1?>  </th>
                        <?php echo $bg_expense_col2 ?>
                        <?php echo $bg_expense_col3 ?>
                        <!-- <th style="vertical-align:middle;" nowrap>หมวด4</th> -->
                        <!-- <th style="vertical-align:middle;" nowrap>หมวด5</th> -->
                        <th  width="10%" style="vertical-align:middle;" nowrap>ยอดรวม</th>
                        <!-- <th style="vertical-align:middle;" nowrap>(%)</th> -->

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
<!-- <script></script> -->

<?php
include("../../lib/charts/charts.php");
$echart = new Charts();

/******** BarChart ********/
$chart_element_id = 'chart-analysis';
$title_text = '';
$title_subtext = '';
$title_align = 'center';

$backgroundColor = '#FFFFFF';

$legend_data = array($bg_expense_name1, $bg_expense_name2,$bg_expense_name3); // 
$legend_color = array("#4992ff", "#7cffb2","#fddd60","#ff6e76","#58d9f9");

$yAxis_name = '(จำนวน)';
$one_bar = false; 
$show_bar_label = true;
$label_to_percen = false;
$position_bar_label = array("insideBottom", "insideBottom", "insideBottom");
$data = array();
$data = null;
$bar_lable_property  = "
rotate: 90,
align: 'left',
verticalAlign: 'middle',
";

foreach ($data_dtl["data"] as $index => $jObj) {
// print_r($jObj["i_month"]);
// exit();
    if ($jObj["i_type"] != 99) {
        // if ($jObj["f_sum"] != 0) {
        $temp = array(
            "name" => $jObj["i_month"],
            "value1" => $jObj["total1"],
            "value2" => $jObj["total2"],
            "value3" => $jObj["total3"],
            // "value4" => $jObj["total4"],
            // "value5" => $jObj["total5"],

            // "value2" =>  $jObj["f_sum"],
            // "value3" => $jObj["total"] - $jObj["f_sum"],
            // "value4" => $jObj["total"] - $jObj["f_sum"],

        );
        $data[] = $temp;
        }
    // }
    
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
    $data,
    $bar_lable_property
);

?>