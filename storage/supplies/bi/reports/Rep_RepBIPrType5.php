<?php
include("../api/List_RepBIPrType.php");
include("../../lib/export/exportUtil.php");

$dateJson = List_QueryParam();

$s_title = true;
$title = CUSTOMER_NAME_TH;
$DBNAME =  "NMU_ERP..";
$caption = "รายงานข้อมูลซื้อจ้างพัสดุ";
// print_r($dateJson);


?>
<script>
        function reloadData() {
                const filterChecked = document.getElementById('filter_equipment').checked;
                const selectedYear = document.getElementById('budget_year_filter').value;

                const filtered = array.data.filter(item => {
                        const matchEquipment = filterChecked ? item.i_product_type1 > 0 : true;
                        const matchYear = selectedYear === 'all' ? true : item.budget_year == selectedYear;
                        return matchEquipment && matchYear;
                });

                // [render chart and table with filtered data...]
        }
</script>

<!DOCTYPE html>
<html lang="en">

<head>
        <meta charset="UTF-8">
        <title>ECharts Report Display</title>
        <script src="../../js/echarts/echarts.js"></script>
        <script src="../../js/echarts/macarons.js"></script>
        <!-- CSS -->
        <link rel="stylesheet" type="text/css" href="../css/report-style.css">
        <!-- <script src="https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js"></> -->
        <script>
                const dataJson = <?= json_encode($dateJson, JSON_UNESCAPED_UNICODE) ?>;
        </script>


        <!-- แล้วค่อยโหลดไฟล์ JS ที่ใช้ dataJson -->
        <!-- <script src="../js/ReportChart.js"></script> -->
        <script src="../js/ReportChart.js?v=<?= time() ?>"></script>





</head>

<body>
        <tr>
                <td align="center" colspan="24">
                        <?php echo "<div align='center';><strong>" . $caption . "</strong></div>"; ?>
                </td>

        </tr>
        <!-- ✅ ComboBox -->
        <label for="budget_year_filter">ปีงบประมาณ:</label>
        <select id="budget_year_filter">
                <?php
                $currentYearEn = date('Y');
                for ($y = $currentYearEn + 1; $y >= $currentYearEn - 10; $y--) {
                        $yearTh = $y + 543;
                        $selected = ($yearTh == $selectedYearTh) ? "selected" : "";
                        echo "<option value=\"$yearTh\" data-year-en=\"$y\" $selected>$yearTh (พ.ศ.) / $y (ค.ศ.)</option>";
                }

                ?>
        </select>

        <div id="pie-wrapper">
                <div id="pie"></div>
        </div>
        <div id="main-wrapper">
                <div id="main"></div>
        </div>
        <table>
                <thead>
                        <tr>
                                <th style="vertical-align:middle; background: #E2EFDA; mso-number-format:\@;">รายชื่อพนักงาน</th>
                                <th style="vertical-align:middle; background: #E2EFDA; mso-number-format:\@;">ครุภัณฑ์</th>
                                <th style="vertical-align:middle; background: #E2EFDA; mso-number-format:\@;">วัสดุ</th>
                                <th style="vertical-align:middle; background: #E2EFDA; mso-number-format:\@;">งานจ้าง</th>
                                <th style="vertical-align:middle; background: #E2EFDA; mso-number-format:\@;">งานเช่า</th>
                                <th style="vertical-align:middle; background: #E2EFDA; mso-number-format:\@;">โครงการต่อเนื่อง</th>
                                <th style="vertical-align:middle; background: #E2EFDA; mso-number-format:\@;">สัญญาจะซื้อจะขาย</th>
                                <th style="vertical-align:middle; background: #E2EFDA; mso-number-format:\@;">งานจ้างก่อสร้าง</th>
                                <th style="vertical-align:middle; background: #E2EFDA; mso-number-format:\@;">สรุปรวม</th>
                        </tr>
                </thead>
                <tbody id="data-table-body"></tbody>

                <tr style="font-weight:bold; background-color: #f9f9f9;">
                        <td>รวม</td>
                        <td id="sum1" onclick="openDetail('0', 'i_product_type1', this.innerText)" style="cursor:pointer; color:blue;"></td>
                        <td id="sum2" onclick="openDetail('0', 'i_product_type2', this.innerText)" style="cursor:pointer; color:blue;"></td>
                        <td id="sum3" onclick="openDetail('0', 'i_product_type3', this.innerText)" style="cursor:pointer; color:blue;"></td>
                        <td id="sum4" onclick="openDetail('0', 'i_product_type4', this.innerText)" style="cursor:pointer; color:blue;"></td>
                        <td id="sum5" onclick="openDetail('0', 'i_product_type5', this.innerText)" style="cursor:pointer; color:blue;"></td>
                        <td id="sum6" onclick="openDetail('0', 'i_product_type6', this.innerText)" style="cursor:pointer; color:blue;"></td>
                        <td id="sum7" onclick="openDetail('0', 'i_product_type7', this.innerText)" style="cursor:pointer; color:blue;"></td>
                        <td id="sum8" onclick="openDetail('0', 'i_product_type8', this.innerText)" style="cursor:pointer; color:blue;"></td>
                </tr>
        </table>


</body>

</html>