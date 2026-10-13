<?php
include("../api/List_RepBIPrType.php");
include("../../lib/export/exportUtil.php");

$dateJson = List_QueryParam();
$dateJson2 = Get_Chart2Data();
$dateJson3 = Get_ChartTorType();
$s_title = true;
$title = CUSTOMER_NAME_TH;
$DBNAME =  "NMU_ERP..";
$caption = " ตารางสรุปข้อมูลการจัดซื้อจัดจ้างตามบุคคล";


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
        <!-- <script src="https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js"></> -->
        <script src="../../js/echarts/echarts.js"></script>
        <script src="../../js/echarts/macarons.js"></script>
        <link rel="stylesheet" type="text/css" href="../css/report-style.css">
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
        </style>
</head>

<body>
        <tr>
                <td align="center" colspan="24">
                        <?php echo "<div align='center';><strong style='font-size: 24px;'>" . $caption . "</strong></div>"; ?>
                </td>

        </tr>
        <!-- ✅ ComboBox -->
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <div style="margin-left: 40px;">
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
                        <!-- <div class="switch-container">
                <label class="switch">
                        <input type="checkbox" id="toggleTheme" />
                        <span class="slider"></span>
                </label>
                <label for="toggleTheme">Dark Mode</label>
        </div> -->

                </div>
        </div>

        <div style="display: flex; justify-content: center; margin-top: 30px;">
                <div id="pie"></div>
        </div>
        <!-- <button id="viewDetailBtn" onclick="goToDetail()">ดูทั้งหมด</button> -->
        <div style="display: flex; justify-content: center; margin-top: 30px;">
                <div id="main"></div>
        </div>

        <h1 class="table-title">ตารางสรุปข้อมูลการจัดซื้อจัดจ้างตามบุคคล</h1>
        <table>
                <thead>
                        <tr>
                                <th style="vertical-align:middle; background:rgb(160, 231, 115); mso-number-format:\@;">ลำดับ</th>
                                <th style="vertical-align:middle; background:rgb(160, 231, 115); mso-number-format:\@;">รายชื่อพนักงาน</th>
                                <th style="vertical-align:middle; background:rgb(160, 231, 115); mso-number-format:\@;">ครุภัณฑ์</th>
                                <th style="vertical-align:middle; background:rgb(160, 231, 115); mso-number-format:\@;">วัสดุ</th>
                                <th style="vertical-align:middle; background:rgb(160, 231, 115); mso-number-format:\@;">งานจ้าง</th>
                                <th style="vertical-align:middle; background:rgb(160, 231, 115); mso-number-format:\@;">งานเช่า</th>
                                <th style="vertical-align:middle; background:rgb(160, 231, 115); mso-number-format:\@;">โครงการต่อเนื่อง</th>
                                <th style="vertical-align:middle; background:rgb(160, 231, 115); mso-number-format:\@;">สัญญาจะซื้อจะขาย</th>
                                <th style="vertical-align:middle; background:rgb(160, 231, 115); mso-number-format:\@;">งานจ้างก่อสร้าง</th>
                                <th style="vertical-align:middle; background:rgb(160, 231, 115); mso-number-format:\@;">สรุปรวม</th>
                        </tr>
                </thead>
                <tbody id="data-table-body"></tbody>

                <tr style="font-weight:bold; background-color: #f9f9f9;">
                        <td></td>
                        <td>รวม</td>
                        <td id="sum1" onclick="openDetail('9999999', 'i_product_type1', this.innerText,'0','0')" style="cursor:pointer; color:blue;"></td>
                        <td id="sum2" onclick="openDetail('9999999', 'i_product_type2', this.innerText,'0','0')" style="cursor:pointer; color:blue;"></td>
                        <td id="sum3" onclick="openDetail('9999999', 'i_product_type3', this.innerText,'0','0')" style="cursor:pointer; color:blue;"></td>
                        <td id="sum4" onclick="openDetail('9999999', 'i_product_type4', this.innerText,'0','0')" style="cursor:pointer; color:blue;"></td>
                        <td id="sum5" onclick="openDetail('9999999', 'i_product_type5', this.innerText,'0','0')" style="cursor:pointer; color:blue;"></td>
                        <td id="sum6" onclick="openDetail('9999999', 'i_product_type6', this.innerText,'0','0')" style="cursor:pointer; color:blue;"></td>
                        <td id="sum7" onclick="openDetail('9999999', 'i_product_type7', this.innerText,'0','0')" style="cursor:pointer; color:blue;"></td>
                        <td id="sum8" onclick="openDetail('9999999', 'i_product_type8', this.innerText,'0','0')" style="cursor:pointer; color:blue;"></td>
                </tr>
        </table>
        <!-- ------------------------------------------------ กราฟ 2 ---------------------------------------------------------->

        <div style="display: flex; justify-content: center; margin-top: 30px;">
                <div id="pie_start" style="width: 1900px; height: 500px;"></div>
        </div>
        <h1 class="table-title">ตารางสรุปข้อมูลสถานะการดำเนินงาน</h1>
        <table>
                <thead>
                        <tr>
                                
                                <th style="vertical-align:middle; background:rgb(240, 153, 107); mso-number-format:\@;">ลำดับ</th>
                                <th style="vertical-align:middle; background:rgb(240, 153, 107); mso-number-format:\@;">สถานะ</th>
                                <th style="vertical-align:middle; background:rgb(240, 153, 107); mso-number-format:\@;">ครุภัณฑ์</th>
                                <th style="vertical-align:middle; background:rgb(240, 153, 107); mso-number-format:\@;">วัสดุ</th>
                                <th style="vertical-align:middle; background:rgb(240, 153, 107); mso-number-format:\@;">งานจ้าง</th>
                                <th style="vertical-align:middle; background:rgb(240, 153, 107); mso-number-format:\@;">งานเช่า</th>
                                <th style="vertical-align:middle; background:rgb(240, 153, 107); mso-number-format:\@;">โครงการต่อเนื่อง</th>
                                <th style="vertical-align:middle; background:rgb(240, 153, 107); mso-number-format:\@;">สัญญาจะซื้อจะขาย</th>
                                <th style="vertical-align:middle; background:rgb(240, 153, 107); mso-number-format:\@;">งานจ้างก่อสร้าง</th>
                                <th style="vertical-align:middle; background:rgb(240, 153, 107); mso-number-format:\@;">สรุปรวม</th>
                        </tr>
                </thead>
                <tbody id="data-table-body-Start"></tbody>

                <tr style="font-weight:bold; background-color: #f9f9f9;">
                        <td></td>
                        <td>รวม</td>
                        <td id="sum1.1" onclick="openDetail('9999999', 'i_product_type1', this.innerText,'0','0')" style="cursor:pointer; color:blue;"></td>
                        <td id="sum2.1" onclick="openDetail('9999999', 'i_product_type2', this.innerText,'0','0')" style="cursor:pointer; color:blue;"></td>
                        <td id="sum3.1" onclick="openDetail('9999999', 'i_product_type3', this.innerText,'0','0')" style="cursor:pointer; color:blue;"></td>
                        <td id="sum4.1" onclick="openDetail('9999999', 'i_product_type4', this.innerText,'0','0')" style="cursor:pointer; color:blue;"></td>
                        <td id="sum5.1" onclick="openDetail('9999999', 'i_product_type5', this.innerText,'0','0')" style="cursor:pointer; color:blue;"></td>
                        <td id="sum6.1" onclick="openDetail('9999999', 'i_product_type6', this.innerText,'0','0')" style="cursor:pointer; color:blue;"></td>
                        <td id="sum7.1" onclick="openDetail('9999999', 'i_product_type7', this.innerText,'0','0')" style="cursor:pointer; color:blue;"></td>
                        <td id="sum8.1" onclick="openDetail('9999999', 'i_product_type8', this.innerText,'0','0')" style="cursor:pointer; color:blue;"></td>
                </tr>
        </table>
        <!-- ------------------------------------------------ กราฟ 3 ---------------------------------------------------------->
        <!-- <h1 class="table-title">ตารางสรุปข้อมูลสถานะการดำเนินงาน</h1> -->
        <div style="display: flex; justify-content: center; margin-top: 30px;">
                <!-- <canvas id="pie_start" width="1900" height="500"></canvas> -->
                <div id="pie_tor_type" style="width: 1900px; height: 800px;"></div>
        </div>
        <table>
                <thead>
                        <tr>
                                <th style="vertical-align:middle; background:rgb(103, 189, 238); mso-number-format:\@;">ลำดับ</th>
                                <th style="vertical-align:middle; background:rgb(103, 189, 238); mso-number-format:\@;">สถานะ</th>
                                <th style="vertical-align:middle; background:rgb(103, 189, 238); mso-number-format:\@;">วิธีประกวดราคาอิเล็กทรอนิกส์ (E-Bidding)</th>
                                <th style="vertical-align:middle; background:rgb(103, 189, 238); mso-number-format:\@;">วิธีคัดเลือก</th>
                                <th style="vertical-align:middle; background:rgb(103, 189, 238); mso-number-format:\@;">วิธีเฉพาะเจาะจง ไม่เกิน 5 แสน</th>
                                <th style="vertical-align:middle; background:rgb(103, 189, 238); mso-number-format:\@;">วิธีเฉพาะเจาะจง เกิน 5 แสน</th>
                                <th style="vertical-align:middle; background:rgb(103, 189, 238); mso-number-format:\@;">E-Market</th>
                                <th style="vertical-align:middle; background:rgb(103, 189, 238); mso-number-format:\@;">สรุปรวม</th>
                        </tr>
                </thead>
                <tbody id="data-table-TorType"></tbody>

                <tr style="font-weight:bold; background-color: #f9f9f9;">
                        <td></td>
                        <td>รวม</td>
                        <td id="sum1.1.1" onclick="openDetail('9999999', 'i_product_type', this.innerText,'0','i_tor_type1')" style="cursor:pointer; color:blue;"></td>
                        <td id="sum2.1.1" onclick="openDetail('9999999', 'i_product_type', this.innerText,'0','i_tor_type2')" style="cursor:pointer; color:blue;"></td>
                        <td id="sum3.1.1" onclick="openDetail('9999999', 'i_product_type', this.innerText,'0','i_tor_type3')" style="cursor:pointer; color:blue;"></td>
                        <td id="sum4.1.1" onclick="openDetail('9999999', 'i_product_type', this.innerText,'0','i_tor_type4')" style="cursor:pointer; color:blue;"></td>
                        <td id="sum5.1.1" onclick="openDetail('9999999', 'i_product_type', this.innerText,'0','i_tor_type5')" style="cursor:pointer; color:blue;"></td>
                        <td id="sum6.1.1" onclick="openDetail('9999999', 'i_product_type', this.innerText,'0','i_tor_type6')" style="cursor:pointer; color:blue;"></td>
                        <!-- <td id="sum6.1.1" onclick="openDetail('0', 'i_product_type6', this.innerText,'0')" style="cursor:pointer; color:blue;"></td>
                        <td id="sum7.1.1" onclick="openDetail('0', 'i_product_type7', this.innerText,'0')" style="cursor:pointer; color:blue;"></td>
                        <td id="sum8.1.1" onclick="openDetail('0', 'i_product_type8', this.innerText,'0')" style="cursor:pointer; color:blue;"></td> -->
                </tr>
        </table>
        <!-- ------------------------------------------------ กราฟ 4 ---------------------------------------------------------->
        <h1 class="table-title">ตารางสรุปข้อมูลรายปี (รอสอบถามข้อมูลเพิ่มเติม)</h1>
        <div style="display: flex; justify-content: center; margin-top: 30px;">
                <!-- <canvas id="pie_start" width="1900" height="500"></canvas> -->
                <div id="pie_year" style="width: 1900px; height: 500px;"></div>
        </div>

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
                var types = [{
                                field: "i_product_type1",
                                label: "ครุภัณฑ์"
                        },
                        {
                                field: "i_product_type2",
                                label: "วัสดุ"
                        },
                        {
                                field: "i_product_type3",
                                label: "งานจ้าง"
                        },
                        {
                                field: "i_product_type4",
                                label: "งานเช่า"
                        },
                        {
                                field: "i_product_type5",
                                label: "โครงการต่อเนื่อง"
                        },
                        {
                                field: "i_product_type6",
                                label: "สัญญาจะซื้อจะขาย"
                        },
                        {
                                field: "i_product_type7",
                                label: "งานจ้างก่อสร้าง"
                        },
                        {
                                field: "i_product_type8",
                                label: "สรุปรวม"
                        }
                ];
                var tor_types = [{
                                field: "i_tor_type1",
                                label: "วิธีประกวดราคาอิเล็กทรอนิกส์ (E-Bidding)"
                        },
                        {
                                field: "i_tor_type2",
                                label: "วิธีคัดเลือก"
                        },
                        {
                                field: "i_tor_type3",
                                label: "วิธีเฉพาะเจาะจง เกิน 5 แสน"
                        },
                        {
                                field: "i_tor_type4",
                                label: "วิธีเฉพาะเจาะจง ไม่เกิน 5 แสน"
                        },
                        {
                                field: "i_tor_type5",
                                label: "E-Market"
                        },
                        {
                                field: "i_tor_type6",
                                label: "รวม"
                        },
                ];

                // Generate 40 names
                const random = Date.now();
                var dateJson = '<?php echo $dateJson; ?>';
                var array = JSON.parse(dateJson);

                var dateJson2 = '<?php echo $dateJson2; ?>';
                var array2 = JSON.parse(dateJson2);

                var dateJson3 = '<?php echo $dateJson3; ?>';
                var array3 = JSON.parse(dateJson3);

                var names = array.data.map(item => item.c_name);

                // var i_product_type = [];
                var i_product_type = [];
                for (var i = 1; i <= 8; i++) i_product_type[i] = array["i_product_type" + i];

                var i_product_type_start = [];
                var i_sp_status_report_id = [];

                for (var i = 1; i <= 8; i++) i_product_type_start[i] = array2["i_product_type" + i];
                for (var i = 1; i <= 8; i++) i_sp_status_report_id[i] = array2["sp_status_report_id" + i];

                // for (let i = 1; i <= 8; i++) {
                //         let field = "i_product_type" + i;
                //         let value = array2.data[rowIndex][field]; // rowIndex คือแถวที่ต้องการ เช่น 0, 1, 2...
                //         console.log(field, value);
                // }


                var i_tor_type = [];
                var i_tor_type_start = [];
                for (var i = 1; i <= 8; i++) i_tor_type[i] = array3["i_tor_type" + i];


                for (var i = 1; i <= 8; i++) i_tor_type_start[i] = array3.data["i_tor_type_start" + i];
                const methods = ['i_tor_type1', 'i_tor_type2', 'i_tor_type3', 'i_tor_type4'];
                const methodNames = ['วิธีประกวดราคาอิเล็กทรอนิกส์ (E-Bidding)', 'วิธีคัดเลือก', 'วิธีเฉพาะเจาะจง ไม่เกิน 5 แสน', 'วิธีเฉพาะเจาะจง เกิน 5 แสน'];
                const key = ['e-Bidding', 'select', 'Less_specific', 'More_specific'];
                const methodStart = [8, 9, 10, 11, 12, 13, 15];
                const chartDataByMethod = [];
                methods.forEach((key, idx) => {
                        const pieData = array3.data.map(item => ({
                                value: item[key],
                                name: item.c_name, // เช่น “รอดำเนินการ”
                                method: key, // เพิ่มไว้เพื่อใช้งานตอนคลิก
                                sp_status_report_id: item.sp_status_report_id

                        }));

                        chartDataByMethod.push({
                                name: methodNames[idx],
                                type: 'pie',
                                radius: '20%',
                                center: [
                                        (25 + idx % 2 * 50) + '%', // 2 คอลัมน์
                                        (idx < 2 ? '30%' : '75%')
                                ],
                                label: {
                                        show: true,
                                        position: 'outside', // แสดง label ด้านนอก
                                        formatter: '{b}\n({d}%)'
                                },
                                data: pieData
                        });
                });


                var year_th = array.year_th;
                var tableBody = document.getElementById('data-table-body');
                // console.log(i_product_type[1]);
                document.getElementById('sum1').innerText = i_product_type[1];
                document.getElementById('sum2').innerText = i_product_type[2];
                document.getElementById('sum3').innerText = i_product_type[3];
                document.getElementById('sum4').innerText = i_product_type[4];
                document.getElementById('sum5').innerText = i_product_type[5];
                document.getElementById('sum6').innerText = i_product_type[6];
                document.getElementById('sum7').innerText = i_product_type[7];
                document.getElementById('sum8').innerText = i_product_type[8];

                var tableBodyStart = document.getElementById('data-table-body-Start');
                document.getElementById('sum1.1').innerText = i_product_type_start[1];
                document.getElementById('sum2.1').innerText = i_product_type_start[2];
                document.getElementById('sum3.1').innerText = i_product_type_start[3];
                document.getElementById('sum4.1').innerText = i_product_type_start[4];
                document.getElementById('sum5.1').innerText = i_product_type_start[5];
                document.getElementById('sum6.1').innerText = i_product_type_start[6];
                document.getElementById('sum7.1').innerText = i_product_type_start[7];
                document.getElementById('sum8.1').innerText = i_product_type_start[8];

                var tableBodyTorType = document.getElementById('data-table-TorType');
                document.getElementById('sum1.1.1').innerText = i_tor_type[1];
                document.getElementById('sum2.1.1').innerText = i_tor_type[2];
                document.getElementById('sum3.1.1').innerText = i_tor_type[3];
                document.getElementById('sum4.1.1').innerText = i_tor_type[4];
                document.getElementById('sum5.1.1').innerText = i_tor_type[5];
                document.getElementById('sum6.1.1').innerText = i_tor_type[6];


                document.getElementById('budget_year_filter').addEventListener('change', function() {
                        var yearTh = this.value;
                        var yearEn = this.options[this.selectedIndex].getAttribute('data-year-en');

                        // ส่งไปหน้าเดียวกันพร้อม 2 พารามิเตอร์
                        var url = window.location.pathname + '?year_th=' + yearTh + '&year_en=' + yearEn + '&_rand=' + random;
                        window.location.href = url;
                });
                array.data.forEach(function(item) {
                        var row = '<tr>';
                        row += '<td>' + item.c_name + '</td>';
                        types.forEach(function(tp) {
                                var val = item[tp.field] || 0;
                                // เพิ่ม <a> ครอบตัวเลข
                                row += `<td><a href="#" onclick="openDetail('${item.sp_emp_id}','${tp.field}','${val},${0}','${0}')">${val}</a></td>`;
                        });
                        row += '</tr>';
                        tableBody.innerHTML += row;
                });
                array2.data.forEach(function(item) {
                        var row = '<tr>';
                        row += '<td>' + item.no + '</td>';
                        row += '<td>' + item.c_name + '</td>';
                        types.forEach(function(tp) {
                                var val = item[tp.field] || 0;
                                // เพิ่ม <a> ครอบตัวเลข
                                row += `<td><a href="#" onclick="openDetail('${0}','${tp.field}','${val}','${item.sp_status_report_id}','')">${val}</a></td>`;
                        });
                        row += '</tr>';
                        tableBodyStart.innerHTML += row;
                });
                array3.data.forEach(function(item) {
                        var row = '<tr>';
                        row += '<td>' + item.no + '</td>';
                        row += '<td>' + item.c_name + '</td>';
                        // console.log(item);
                        tor_types.forEach(function(tp) {
                                var val = item[tp.field] || 0;
                                row += `<td><a href="#" onclick="openDetail('${9999999}','${'i_product_type'}','${val}','${item.sp_status_report_id}','${tp.field}')">${val}</a></td>`;
                        });
                        row += '</tr>';
                        tableBodyTorType.innerHTML += row;
                });
                const pieData = [{
                                value: i_product_type[1],
                                name: 'ครุภัณฑ์',
                                field: 'i_product_type1',
                                itemStyle: {
                                        // decal: {
                                        //         symbol: 'rect',
                                        //         color: '#000',
                                        //         backgroundColor: '#5B9BD5',
                                        //         dashArrayX: [6, 0],
                                        //         dashArrayY: [6, 6],
                                        //         rotation: 0
                                        // }
                                }
                        },
                        {
                                value: i_product_type[2],
                                name: 'วัสดุ',
                                field: 'i_product_type2',
                                itemStyle: {
                                        // decal: {
                                        //         symbol: 'circle',
                                        //         dashArrayX: [1, 2],
                                        //         dashArrayY: [2, 1],
                                        //         rotation: 0
                                        // }
                                }
                        },
                        {
                                value: i_product_type[3],
                                name: 'งานจ้าง',
                                field: 'i_product_type3',
                                itemStyle: {
                                        // decal: {
                                        //         symbol: 'rect',
                                        //         dashArrayX: [4, 2],
                                        //         dashArrayY: [2, 4],
                                        //         rotation: 0
                                        // }
                                }
                        },
                        {
                                value: i_product_type[4],
                                name: 'งานเช่า',
                                field: 'i_product_type4',
                                itemStyle: {
                                        // decal: {
                                        //         symbol: 'cross',
                                        //         dashArrayX: [1, 0],
                                        //         dashArrayY: [1, 0],
                                        //         rotation: 0
                                        // }
                                }
                        },
                        {
                                value: i_product_type[5],
                                name: 'โครงการต่อเนื่อง',
                                field: 'i_product_type5',
                                itemStyle: {
                                        // decal: {
                                        //         symbol: 'triangle',
                                        //         dashArrayX: [2, 2],
                                        //         dashArrayY: [2, 2],
                                        //         rotation: 0
                                        // }
                                }
                        },
                        {
                                value: i_product_type[6],
                                name: 'สัญญาจะซื้อจะขาย',
                                field: 'i_product_type6',
                                // decal: {
                                //         symbol: 'dot',
                                //         dashArrayX: [1, 2],
                                //         dashArrayY: [1, 2],
                                //         rotation: 0
                                // }

                        },
                        {
                                value: i_product_type[7],
                                name: 'งานก่อสร้าง',
                                field: 'i_product_type7',
                                // decal: {
                                //         symbol: 'diamond',
                                //         dashArrayX: [4, 2],
                                //         dashArrayY: [2, 4],
                                //         rotation: 0
                                // }

                        },
                ];
                const pieDataStart = array2.data.map(item => ({
                        value: item.i_product_type8,
                        name: item.c_name, // ชื่อสถานะ เช่น "รอดำเนินการ"
                        field: 'i_product_type8', // field สำหรับระบุเวลาคลิก
                        method: methodStart[item], // เพิ่มไว้เพื่อใช้งานตอนคลิก
                        sp_status_report_id: item.sp_status_report_id // << เพิ่มตรงนี้
                }));


                const statusPieData = [{
                                name: "รอดำเนินการ",
                                value: i_tor_type[1],
                        },
                        {
                                name: "อยู่ระหว่างดำเนินการ",
                                value: i_tor_type[2],
                        },
                        {
                                name: "บริหารสัญญา",
                                value: i_tor_type[3],
                        },
                        {
                                name: "ตรวจรับ",
                                value: i_tor_type[4],
                        },
                        {
                                name: "ขออนุมัติเบิกจ่าย",
                                value: i_tor_type[5],
                        },
                        {
                                name: "เบิกจ่ายแล้ว",
                                value: i_tor_type[6],
                        },
                        // { name: "บริหารสัญญา", value: 287 },
                ];

                // Generate sample data
                var categories = ["ครุภัณฑ์", "วัสดุ", "งานจ้าง", "งานเช่า", "โครงการต่อเนื่อง", "สัญญาจะซื้อจะขาย", "งานจ้างก่อสร้าง"];

                var colors = ['#f4eda5', '#f8cf6a', '#cce5da', '#4cae4c', '#aaccee', '#1d65a6', '#f19953', '#E91E63'];
                const patterns = [{
                                symbol: 'rect',
                                dashArrayX: [6, 0],
                                dashArrayY: [6, 6],
                                rotation: 0
                        },
                        {
                                symbol: 'circle',
                                dashArrayX: [1, 2],
                                dashArrayY: [2, 1],
                                rotation: 0
                        },
                        {
                                symbol: 'line',
                                dashArrayX: [2, 2],
                                dashArrayY: [4, 2],
                                rotation: 0
                        },
                        {
                                symbol: 'triangle',
                                dashArrayX: [2, 2],
                                dashArrayY: [2, 2],
                                rotation: 0
                        },
                        {
                                symbol: 'diamond',
                                dashArrayX: [4, 2],
                                dashArrayY: [2, 4],
                                rotation: 0
                        },
                        {
                                symbol: 'cross',
                                dashArrayX: [1, 0],
                                dashArrayY: [1, 0],
                                rotation: 0
                        },
                        {
                                symbol: 'dot',
                                dashArrayX: [1, 2],
                                dashArrayY: [1, 2],
                                rotation: 0
                        }
                ];

                const option = {
                        legend: {},
                        tooltip: {},
                        dataset: {
                                source: [
                                        ['product', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม'],
                                        ['2566', 56.3, 82.1, 89.3, 72.4, 55.1, 88.0, 56.3, 82.1, 89.3, 72.4, 55.1, 88.0],
                                        ['2567', 50.1, 49.9, 52.3, 50.5, 70.2, 65.0, 56.3, 82.1, 89.3, 72.4, 55.1, 88.0],
                                        ['2568', 40.0, 62.5, 69.4, 35.6, 44.2, 32.8, 56.3, 82.1, 89.3, 72.4, 55.1, 88.0],
                                        ['2569', 25.2, 35.6, 40.2, 25.9, 34.6, 48.5, 56.3, 82.1, 89.3, 72.4, 55.1, 88.0]
                                ]
                        },
                        grid: [{
                                top: '55%',
                                bottom: '15%'
                        }],
                        xAxis: {
                                type: 'category',
                                gridIndex: 0
                        },
                        yAxis: {
                                gridIndex: 0
                        },
                        series: [{
                                        type: 'pie',
                                        id: 'pied',
                                        radius: '30%',
                                        center: ['50%', '25%'],
                                        label: {
                                                formatter: '{b}: {c} ({d}%)'
                                        },
                                        encode: {
                                                itemName: 'product',
                                                value: '2022'
                                        }
                                },
                                {
                                        type: 'line',
                                        smooth: true,
                                        seriesLayoutBy: 'row'
                                },
                                {
                                        type: 'line',
                                        smooth: true,
                                        seriesLayoutBy: 'row'
                                },
                                {
                                        type: 'line',
                                        smooth: true,
                                        seriesLayoutBy: 'row'
                                },
                                {
                                        type: 'line',
                                        smooth: true,
                                        seriesLayoutBy: 'row'
                                }
                        ]
                };
                var seriesData = categories.map((cat, index) => ({
                        name: cat,
                        type: 'bar',
                        stack: 'total',
                        field: `i_product_type${index + 1}`, // <== เพิ่ม field นี้!
                        emphasis: {
                                focus: 'series'
                        },
                        itemStyle: {
                                color: colors[index % colors.length],
                                decal: patterns[index % patterns.length] // << เพิ่มบรรทัดนี้!

                        },
                        label: {
                                show: true,
                                position: 'inside',
                                color: '#ffffff',
                                fontSize: 12
                        },
                        data: array.data.map((item, idx) => ({
                                value: item[`i_product_type${index + 1}`] || 0,
                                sp_emp_id: item.sp_emp_id, // ดึง emp_id มาให้ด้วย
                                field: `i_product_type${index + 1}` // ใส่ไว้ใน data ด้วย
                        }))
                        // data: array.data.map(item => item[`i_product_type${index + 1}`] || 0) // ดึงข้อมูลตาม i_product_type1, 2, 3,...
                }));

                // เติมตารางข้อมูล
                if (tableBody) {
                        tableBody.innerHTML = ""; // เคลียร์ก่อนวนลูป

                        array.data.forEach(function(item) {
                                var row = '<tr>';
                                console.log(item);
                                // row += '<td>' + item + '</td>';
                                row += '<td>' + item.no + '</td>';
                                row += '<td>' + item.c_name + '</td>';
                                types.forEach(function(tp) {
                                        var val = item[tp.field] || 0;
                                        // เพิ่มลิงก์
                                        row += `<td><a href="#" onclick="openDetail('${item.sp_emp_id}','${tp.field}','${val}','0','0')">${val}</a></td>`;
                                });
                                row += '</tr>';
                                tableBody.innerHTML += row;
                        });
                } else {
                        console.error('ไม่พบ <tbody id="data-table-body"> ใน HTML');
                }
                if (tableBodyStart) {
                        tableBodyStart.innerHTML = ""; // เคลียร์ก่อนวนลูป
                        array2.data.forEach(function(item) {
                                var row = '<tr>';
                                row += '<td>' + item.no + '</td>';
                                row += '<td>' + item.c_name + '</td>';
                                types.forEach(function(tp) {
                                        var val = item[tp.field] || 0;
                                        // เพิ่มลิงก์

                                        row += `<td><a href="#" onclick="openDetail('${9999999}','${tp.field}','${val}','${item.sp_status_report_id}','${0}')">${val} </a></td>`;
                                });
                                row += '</tr>';
                                tableBodyStart.innerHTML += row;
                        });
                } else {
                        console.error('ไม่พบ <tbody id="data-table-body"> ใน HTML');
                }

                // Pie Chart
                var pieChart = echarts.init(document.getElementById('pie'));
                var pieOption = {
                        title: {
                                text: 'Pie Chart' + " ปริมาณงานปี " + year_th,
                                left: '10%'
                                // left: 'center'
                        },
                        tooltip: {
                                trigger: 'item',
                                // formatter: '{b}: {c} ({d}%)'
                        },
                        legend: {
                                bottom: '5%',
                                left: 'center'
                        },
                        color: colors,
                        series: [{
                                // name: 'Categories',
                                type: 'pie',
                                radius: ['40%', '70%'], // จากเดิม ['40%', '60%']
                                // radius: '65%',
                                avoidLabelOverlap: false,
                                label: {
                                        show: true,
                                        // formatter: '{b}: {d}%',
                                        formatter: '{b}\n ({d}%)',
                                        color: '#333',
                                        fontSize: 14
                                },
                                data: pieData,
                                emphasis: {
                                        label: {
                                                show: true,
                                                fontSize: 40,
                                                fontWeight: 'bold'
                                        }
                                },
                                labelLine: {
                                        show: false
                                },
                        }]
                };
                pieChart.setOption(pieOption);

                var pieChartStart = echarts.init(document.getElementById('pie_start'));



                var pieOptionStart = {
                        title: {
                                text: 'Pie Chart' + " สถานะการดำเนินงาน " + year_th,
                                // left: 'center'
                                left: '5%'
                        },
                        tooltip: {
                                trigger: 'item',
                                formatter: '{b}: {c} ({d}%)'
                        },
                        legend: {
                                top: '96%', // เดิมอาจเป็น 3% หรือ center ลองเลื่อนลง
                                left: 'center'
                        },
                        color: colors,
                        series: [{
                                name: 'Categories',
                                type: 'pie',
                                radius: ['40%', '70%'], // จากเดิม ['40%', '60%']
                                label: {
                                        show: true,
                                        position: 'outside', // แสดง label ด้านนอก
                                        formatter: '{b}: {d}%',
                                        color: '#333',
                                        fontSize: 14
                                },
                                data: pieDataStart,
                                emphasis: {
                                        label: {
                                                show: true,
                                                fontSize: 40,
                                                fontWeight: 'bold'
                                        }
                                },
                                labelLine: {
                                        show: false
                                },
                        }]
                };
                pieChartStart.setOption(pieOptionStart);
                // Bar Chart 
                var barChart = echarts.init(document.getElementById('main'));
                var barOption = {
                        title: {
                                text: 'Bar Chart' + " ปริมาณงานปี " + year_th,
                                // left: 'center'
                                left: '10%'
                        },
                        tooltip: {
                                trigger: 'axis',
                                axisPointer: {
                                        type: 'shadow'
                                }
                        },
                        legend: {
                                bottom: 10
                        },
                        grid: {
                                left: '3%',
                                right: '4%',
                                bottom: '10%',
                                containLabel: true
                        },
                        dataZoom: [{
                                        type: 'slider',
                                        yAxisIndex: 0,
                                        start: 0,
                                        end: 50
                                },
                                {
                                        type: 'inside',
                                        yAxisIndex: 0,
                                        start: 0,
                                        end: 50
                                }
                        ],
                        xAxis: {
                                type: 'value'
                        },
                        yAxis: {
                                type: 'category',
                                data: names
                        },
                        series: seriesData
                };
                barChart.setOption(barOption);
                // เพิ่มจับ Event คลิก
                barChart.on('click', function(params) {
                        // alert('คุณคลิกที่: ' + params.name + '\\nหมวดหมู่: ' + params.seriesName + '\\nค่าคือ: ' + params.value);
                        const empId = params.data.sp_emp_id || '0'; // ได้จาก data
                        const field = params.data.field || params.seriesName; // ปลอดภัยขึ้น
                        const value = params.value;
                        console.log(params);
                        openDetail(empId, field, value, 0, 0);
                });

                pieChart.on('click', function(params) {
                        console.log('Pie clicked:', params);
                        // alert('คุณคลิกที่: ' + params.name + '\\nเปอร์เซ็นต์: ' + params.percent + '%');
                        const empId = '9999999'; // Pie Chart เป็นรวม
                        const field = params.data.field || 'i_product_type'; // field มาจาก pieData
                        const value = params.value || 0;
                        if (value > 0) {
                                openDetail(empId, field, value, 0, 0);
                        }
                });
                pieChartStart.on('click', function(params) {
                        console.log('Pie clicked:', params);
                        // alert('คุณคลิกที่: ' + params.name + '\\nเปอร์เซ็นต์: ' + params.percent + '%');
                        const empId = '9999999'; // Pie Chart เป็นรวม
                        const field = 'i_product_type'; // field มาจาก pieData
                        const value = params.value || 0;
                        var method = params.data.method || 0;
                        var sp_status_report_id = params.data.sp_status_report_id || 0;
                        console.log(params)
                        if (value > 0) {
                                openDetail(empId, field, value, sp_status_report_id, method, 0);
                        }
                });
                var myChart = echarts.init(document.getElementById('pie_year'), 'dark');

                myChart.setOption(option); // ใส่ option ปกติ


                const optionTorType = {
                        legend: {},
                        tooltip: {},
                        color: colors,
                        title: {
                                text: 'ตารางสรุปข้อมูลสถานะการดำเนินงาน แต่ละวิธีการดำเนินงาน',
                                left: 'center',
                                top: 10,
                                textStyle: {
                                        fontSize: 20,
                                        fontWeight: 'bold'
                                }
                        },
                        legend: {
                                top: 50, // ขยับ legend ลงจาก title
                                left: 'center'
                        },
                        series: chartDataByMethod,
                };
                var myChartTorType = echarts.init(document.getElementById('pie_tor_type'), 'light');
                myChartTorType.setOption(optionTorType); // ใส่ option ปกติ

                myChartTorType.on('click', function(params) {
                        console.log(params);
                        // alert('คุณคลิกที่: ' + params.name + '\\nเปอร์เซ็นต์: ' + params.percent + '%');
                        const empId = '9999999'; // Pie Chart เป็นรวม
                        const field = params.data.field || 'i_product_type'; // field มาจาก pieData
                        const value = params.value || 0;
                        const seriesName = params.data.method; // หรือดึงจาก dataset ก็ได้ เช่น params.data.sp_status_report_id
                        const sp_status_report_id = params.data.sp_status_report_id; // หรือดึงจาก dataset ก็ได้ เช่น params.data.sp_status_report_id
                        if (value > 0) {
                                openDetail(empId, field, value, sp_status_report_id, seriesName);
                        }
                });


                function openDetail(empId, type, value, start, chart) {
                        if (value == 0) return;
                        var yearTh = year_th; // ดึงจาก global JS variable
                        var yearEn = yearTh - 543;
                        console.log(type);
                        console.log(value);
                        console.log(start);
                        var url = `Rep_DetailByType.php?sp_emp_id=${empId}&type=${type}&start=${start}&chart=${chart}&year_th=${yearTh}&year_en=${yearEn}&_rand=${random}`;
                        window.open(url, '_blank');
                }

                function toggleDarkMode() {
                        document.body.classList.toggle('dark-mode');
                        const isDark = document.body.classList.contains('dark-mode');
                        localStorage.setItem('darkMode', isDark ? 'on' : 'off');
                }

                window.addEventListener('load', function() {
                        const scrollY = localStorage.getItem('lastScrollY');
                        if (scrollY) {
                                window.scrollTo(0, parseInt(scrollY));
                                localStorage.removeItem('lastScrollY'); // เคลียร์ค่าหลังใช้
                        }
                });
                // window.onload = function() {
                //         if (localStorage.getItem('darkMode') === 'on') {
                //                 document.body.classList.add('dark-mode');
                //                 const toggle = document.getElementById('darkToggle');
                //                 if (toggle) toggle.checked = true;
                //         }
                // };
                // var chartDom = document.getElementById('chart');

                // var currentTheme = 'light';
                // var chartDom = document.getElementById('pie');
                // var myChart = echarts.init(chartDom, currentTheme);

                // myChart.setOption(pieOption); // ใส่ option ปกติ

                // document.getElementById('toggleTheme').addEventListener('change', function() {
                //         currentTheme = this.checked ? 'dark' : 'light';
                //         myChart.dispose();
                //         myChart = echarts.init(chartDom, currentTheme);
                //         myChart.setOption(pieOption);
                // });
        </script>

</body>

</html>