<?php
include("../api/List_RepBIBg_BgExpense.php");
include("../../lib/export/exportUtil.php");
$dateJson4 = Rep_RepBIPrType_fetch();
$s_title = true;
$title = CUSTOMER_NAME_TH;
$DBNAME =  "NMU_ERP..";
$caption = " ตารางสรุปข้อมูลการจัดซื้อจัดจ้าง";


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
        <script src="../../ws_user/js/jquery.min.js"></script>
        <script src="../../js/echarts/echarts.js"></script>
        <script src="../bootstrap/bootstrap-4.6.2-dist/js/bootstrap.bundle.min.js"></script>
        <script src="../bootstrap/bootstrap-select-1.13.14/dist/js/bootstrap-select.min.js"></script>
        <script src="../../js/echarts/macarons.js"></script>
        <script src="../lib/xlsx.full.min.js"></script>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title><?php echo COMPANY_NAME; ?></title>
        <link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
        <link rel="stylesheet" type="text/css" href="../css/report-style.css">

        <link rel="stylesheet" type="text/css" href="../bootstrap/bootstrap-4.6.2-dist/css/bootstrap.min.css">
        <link rel="stylesheet" type="text/css" href="../bootstrap/bootstrap-select-1.13.14/dist/css/bootstrap-select.min.css">

        <style>
                body {
                        margin: 0;
                        font-family: sans-serif;
                        transition: background 0.3s;
                }

                .switch-container {
                        padding: 10px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                }

                .switch {
                        position: relative;
                        display: inline-block;
                        width: 50px;
                        height: 24px;
                }

                .switch input {
                        opacity: 0;
                        width: 0;
                        height: 0;
                }

                .slider {
                        position: absolute;
                        cursor: pointer;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: #ccc;
                        border-radius: 24px;
                        transition: 0.4s;
                }

                .slider:before {
                        position: absolute;
                        content: "";
                        height: 18px;
                        width: 18px;
                        left: 3px;
                        bottom: 3px;
                        background-color: white;
                        border-radius: 50%;
                        transition: 0.4s;
                }

                input:checked+.slider {
                        background-color: #1c1c3c;
                }

                input:checked+.slider:before {
                        transform: translateX(26px);
                }

                #chart {
                        width: 100%;
                        height: 600px;
                }

                body,
                h1,
                h2,
                h3,
                h4,
                h5,
                h6,
                table,
                td,
                th,
                label,
                input,
                select,
                button,
                .table-title {
                        font-family: 'Sarabun', sans-serif;
                }



                select {
                        padding: 8px 12px;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        font-size: 16px;
                        background-color: #fff;
                        appearance: none;
                        -webkit-appearance: none;
                        -moz-appearance: none;
                        background-image: url("data:image/svg+xml;utf8,<svg fill='black' height='16' width='16' viewBox='0 0 24 24'><path d='M7 10l5 5 5-5z'/></svg>");
                        background-repeat: no-repeat;
                        background-position-x: 95%;
                        background-position-y: center;
                }

                select:focus {
                        outline: none;
                }
        </style>
</head>

<body>
        <div aria-live="polite" aria-atomic="true" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999;">
                <div class="toast" id="myToast" role="alert" data-delay="3000" style="min-width: 250px;">
                        <div class="toast-header bg-danger text-white">
                                <strong class="mr-auto">แจ้งเตือน</strong>
                                <small>ขณะนี้</small>
                                <button type="button" class="ml-2 mb-1 close text-white" data-dismiss="toast">&times;</button>
                        </div>
                        <div class="toast-body" id="toastMessage">
                                ไม่พบตาราง
                        </div>
                </div>
        </div>

        <tr>
                <td align="center" colspan="24">
                        <?php echo "<div align='center';><strong style='font-size: 24px;'>" . $caption . "</strong></div>"; ?>
                </td>

        </tr>
        <!-- ✅ ComboBox -->
        <div class="bg-light rounded shadow-sm px-4" style="min-height: 100px; display: flex; align-items: center; justify-content: space-around;">
                <!-- <div class="bg-light rounded shadow-sm px-4 py-4" style="min-height: 100px;"> -->
                <form class="form-inline d-flex flex-wrap justify-content-center">
                        <div style="display: flex;justify-content: space-between;align-items: center;">
                                <div class="form-group d-flex align-items-center padding-right:10px">
                                        <label for="budget_year_filter">ปีงบประมาณ:</label>
                                        <select id="budget_year_filter"
                                                class="selectpicker"
                                                data-width="auto"
                                                data-live-search="true"
                                                title="เลือกปีงบประมาณ">
                                                <?php
                                                error_reporting(0);
                                                ob_start();

                                                $currentYearEn = date('Y');
                                                for ($y = $currentYearEn + 1; $y >= $currentYearEn - 10; $y--) {
                                                        $yearTh = $y + 543;
                                                        $selected = ($yearTh == $selectedYearTh) ? "selected" : "";
                                                        echo "<option value=\"$yearTh\" data-year-en=\"$y\" $selected>$yearTh (พ.ศ.) / $y (ค.ศ.)</option>";
                                                }
                                                ob_end_flush();
                                                ?>

                                        </select>
                                </div>
                                <div class="form-group d-flex align-items-center me-3">

                                        <label for="funding_source" style="margin:0px 10px;">แหล่ง:</label>
                                        <select id="funding_source"
                                                class="selectpicker form-control"
                                                data-style="form-control"
                                                multiple
                                                data-live-search="true"
                                                data-actions-box="true"
                                                data-width="400px"
                                                data-dropup-auto="false"
                                                title="เลือกแหล่งเงิน">
                                        </select>
                                </div>
                                <div class="form-group d-flex align-items-center me-3">

                                        <label for="multiCheckCombo" style="margin:0px 10px;">หมวดค่าใช้จ่าย:</label>
                                        <select id="multiCheckCombo"
                                                class="selectpicker form-control"
                                                data-style="form-control"
                                                multiple
                                                data-live-search="true"
                                                data-actions-box="true"
                                                data-width="400px"
                                                data-dropup-auto="false"
                                                title="เลือกหมวดงบประมาณ">
                                        </select>
                                </div>
                        </div>

                        <button type="button" onclick="exportTableToExcel()" class="button">
                                <img src="../images/excel.png" alt="Export to Excel">
                                ดาวน์โหลด Excel
                        </button>
                        <!-- </div> -->
                </form>
                <!-- </div> -->
        </div>
        <!-- <h1 class="table-title">กราฟสรุปข้อมูลการใช้เงิน</h1> -->

        <div style="display: flex; justify-content: center; margin-top: 30px;">
                <div id="bar_bg" style="width: 100%; max-width: 2500px; height: 800px;"></div>
        </div>

        <script>

                var dateJson4 = '<?php echo $dateJson4; ?>';
        </script>
        <script type="text/javascript" src="../js/ReportChartBg_BgExpense.js?_dc<?= __VPRODUCT_; ?>"></script>

</body>

</html>