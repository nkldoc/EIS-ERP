<?php
include("../api/List_RepBIPrType.php");
include("../../lib/export/exportUtil.php");

$dateJson = List_QueryParam();
$dateJson2 = Get_Chart2Data();
$s_title = true;
$title = CUSTOMER_NAME_TH;
$DBNAME =  "NMU_ERP..";
$caption = " ";


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

        <div style="display: flex; justify-content: center; margin-top: 30px;">
                <div id="pie"></div>
                
        </div>
        <button id="viewDetailBtn" onclick="goToDetail()">ดูทั้งหมด</button>
        <div id="main-wrapper">
                <div id="main"></div>
        </div>
        <h1 class="table-title">ตารางสรุปข้อมูลการจัดซื้อจัดจ้างตามบุคคล</h1>
        <table>
                <thead>
                        <tr>
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
                        <td>รวม</td>
                        <td id="sum1" onclick="openDetail('0', 'i_product_type1','0','start', this.innerText)" style="cursor:pointer; color:blue;"></td>
                        <td id="sum2" onclick="openDetail('0', 'i_product_type2','0','start', this.innerText)" style="cursor:pointer; color:blue;"></td>
                        <td id="sum3" onclick="openDetail('0', 'i_product_type3','0','start', this.innerText)" style="cursor:pointer; color:blue;"></td>
                        <td id="sum4" onclick="openDetail('0', 'i_product_type4','0','start', this.innerText)" style="cursor:pointer; color:blue;"></td>
                        <td id="sum5" onclick="openDetail('0', 'i_product_type5','0','start', this.innerText)" style="cursor:pointer; color:blue;"></td>
                        <td id="sum6" onclick="openDetail('0', 'i_product_type6','0','start', this.innerText)" style="cursor:pointer; color:blue;"></td>
                        <td id="sum7" onclick="openDetail('0', 'i_product_type7','0','start', this.innerText)" style="cursor:pointer; color:blue;"></td>
                        <td id="sum8" onclick="openDetail('0', 'i_product_type8','0','start', this.innerText)" style="cursor:pointer; color:blue;"></td>
                </tr>
        </table>
        <!-- ------------------------------------------------ กราฟ 2 ---------------------------------------------------------->
        
        <div style="display: flex; justify-content: center; margin-top: 30px;">
                <!-- <canvas id="pie_start" width="1900" height="500"></canvas> -->
                <div id="pie_start" style="width: 1900px; height: 500px;"></div>
        </div>
        <h1 class="table-title">ตารางสรุปข้อมูลสถานะการดำเนินงาน</h1>
        <table>
                <thead>
                        <tr>
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
                        <td>รวม</td>
                        <td id="sum1.1" onclick="openDetail('0', 'i_product_type1','8', this.innerText)" style="cursor:pointer; color:blue;"></td>
                        <td id="sum2.1" onclick="openDetail('0', 'i_product_type2','9', this.innerText)" style="cursor:pointer; color:blue;"></td>
                        <td id="sum3.1" onclick="openDetail('0', 'i_product_type3','10', this.innerText)" style="cursor:pointer; color:blue;"></td>
                        <td id="sum4.1" onclick="openDetail('0', 'i_product_type4','11', this.innerText)" style="cursor:pointer; color:blue;"></td>
                        <td id="sum5.1" onclick="openDetail('0', 'i_product_type5','12', this.innerText)" style="cursor:pointer; color:blue;"></td>
                        <td id="sum6.1" onclick="openDetail('0', 'i_product_type6','13', this.innerText)" style="cursor:pointer; color:blue;"></td>
                        <td id="sum7.1" onclick="openDetail('0', 'i_product_type7','14', this.innerText)" style="cursor:pointer; color:blue;"></td>
                        <td id="sum8.1" onclick="openDetail('0', 'i_product_type8','15', this.innerText)" style="cursor:pointer; color:blue;"></td>
                </tr>
        </table>
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

                // Generate 40 names
                const random = Date.now();
                var dateJson = '<?php echo $dateJson; ?>';
                var dateJson2 = '<?php echo $dateJson2; ?>';
                var array = JSON.parse(dateJson);
                var array2 = JSON.parse(dateJson2);

                var names = array.data.map(item => item.c_name);
                
                // var i_product_type = [];
                var i_product_type = [];
                for (var i = 1; i <= 8; i++) i_product_type[i] = array["i_product_type" + i];
                
                var i_product_type_start = [];
                var i_sp_status_report_id = [];
                for (var i = 1; i <= 8; i++) i_product_type_start[i] = array2["i_product_type" + i];
                for (var i = 1; i <= 8; i++) i_sp_status_report_id[i] = array2["sp_status_report_id" + i];


                var year_th = array.year_th;
                var tableBody = document.getElementById('data-table-body');
                document.getElementById('sum1').innerText = i_product_type[1];
                document.getElementById('sum2').innerText = i_product_type[2];
                document.getElementById('sum3').innerText = i_product_type[3];
                document.getElementById('sum4').innerText = i_product_type[4];
                document.getElementById('sum5').innerText = i_product_type[5];
                document.getElementById('sum6').innerText = i_product_type[6];
                document.getElementById('sum7').innerText = i_product_type[7];
                document.getElementById('sum8').innerText = i_product_type[8];
// sp_status_report_id
                console.log(i_sp_status_report_id[1]);

                var tableBodyStart = document.getElementById('data-table-body-Start');
                document.getElementById('sum1.1').innerText = i_product_type_start[1];
                document.getElementById('sum2.1').innerText = i_product_type_start[2];
                document.getElementById('sum3.1').innerText = i_product_type_start[3];
                document.getElementById('sum4.1').innerText = i_product_type_start[4];
                document.getElementById('sum5.1').innerText = i_product_type_start[5];
                document.getElementById('sum6.1').innerText = i_product_type_start[6];
                document.getElementById('sum7.1').innerText = i_product_type_start[7];
                document.getElementById('sum8.1').innerText = i_product_type_start[8];



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
                                row += `<td><a href="#" onclick="openDetail('${item.sp_emp_id}','${tp.field}','${val}')">${val}</a></td>`;
                        });
                        row += '</tr>';
                        tableBody.innerHTML += row;
                });
                console.log(array2);
                array2.data.forEach(function(item) {
                        var row = '<tr>';
                        row += '<td>' + item.c_name + '</td>';
                        types.forEach(function(tp) {
                                // console.log(tp.field);
                                var val = item[tp.field] || 0;
                                // เพิ่ม <a> ครอบตัวเลข
                                row += `<td><a href="#" onclick="openDetail('${item.sp_status_report_id}','${tp.field}','${val}')">${val}</a></td>`;
                        });
                        row += '</tr>';
                        tableBodyStart.innerHTML += row;
                });
                const pieData = [{
                                value: i_product_type[1],
                                name: 'ครุภัณฑ์',
                                field: 'i_product_type1',
                                itemStyle: {
                                        decal: {
                                                symbol: 'rect',
                                                color: '#000',
                                                backgroundColor: '#5B9BD5',
                                                dashArrayX: [6, 0],
                                                dashArrayY: [6, 6],
                                                rotation: 0
                                        }
                                }
                        },
                        {
                                value: i_product_type[2],
                                name: 'วัสดุ',
                                field: 'i_product_type2',
                                itemStyle: {
                                        decal: {
                                                symbol: 'circle',
                                                dashArrayX: [1, 2],
                                                dashArrayY: [2, 1],
                                                rotation: 0
                                        }
                                }
                        },
                        {
                                value: i_product_type[3],
                                name: 'งานจ้าง',
                                field: 'i_product_type3',
                                itemStyle: {
                                        decal: {
                                                symbol: 'rect',
                                                dashArrayX: [4, 2],
                                                dashArrayY: [2, 4],
                                                rotation: 0
                                        }
                                }
                        },
                        {
                                value: i_product_type[4],
                                name: 'งานเช่า',
                                field: 'i_product_type4',
                                itemStyle: {
                                        decal: {
                                                symbol: 'cross',
                                                dashArrayX: [1, 0],
                                                dashArrayY: [1, 0],
                                                rotation: 0
                                        }
                                }
                        },
                        {
                                value: i_product_type[5],
                                name: 'โครงการต่อเนื่อง',
                                field: 'i_product_type5',
                                itemStyle: {
                                        decal: {
                                                symbol: 'triangle',
                                                dashArrayX: [2, 2],
                                                dashArrayY: [2, 2],
                                                rotation: 0
                                        }
                                }
                        },
                        {
                                value: i_product_type[6],
                                name: 'สัญญาจะซื้อจะขาย',
                                field: 'i_product_type6',
                                decal: {
                                        symbol: 'dot',
                                        dashArrayX: [1, 2],
                                        dashArrayY: [1, 2],
                                        rotation: 0
                                }

                        },
                        {
                                value: i_product_type[7],
                                name: 'งานก่อสร้าง',
                                field: 'i_product_type7',
                                decal: {
                                        symbol: 'diamond',
                                        dashArrayX: [4, 2],
                                        dashArrayY: [2, 4],
                                        rotation: 0
                                }

                        },
                ];
                const pieDataStart = [{
                                value: i_product_type_start[1],
                                name: 'รอดำเนินการ',
                                field: 'i_product_type1_start',
                                itemStyle: {
                                        decal: {
                                                symbol: 'rect',
                                                color: '#000',
                                                backgroundColor: '#5B9BD5',
                                                dashArrayX: [6, 0],
                                                dashArrayY: [6, 6],
                                                rotation: 0
                                        }
                                }
                        },
                        {
                                value: i_product_type_start[2],
                                name: 'อยู่ระหว่างดำเนินการ',
                                field: 'i_product_type2_start',
                                itemStyle: {
                                        decal: {
                                                symbol: 'circle',
                                                dashArrayX: [1, 2],
                                                dashArrayY: [2, 1],
                                                rotation: 0,
                                                color: '#000',
                                        }
                                }
                        },
                        {
                                value: i_product_type_start[3],
                                name: 'บริหารสัญญา',
                                field: 'i_product_type3_start',
                                itemStyle: {
                                        decal: {
                                                symbol: 'rect',
                                                dashArrayX: [4, 2],
                                                dashArrayY: [2, 4],
                                                rotation: 0,
                                                color: '#000',
                                        }
                                }
                        },
                        {
                                value: i_product_type_start[4],
                                name: 'ตรวจรับพัสดุ',
                                field: 'i_product_type4_start',
                                itemStyle: {
                                        decal: {
                                                symbol: 'cross',
                                                dashArrayX: [1, 0],
                                                dashArrayY: [1, 0],
                                                rotation: 0,
                                                color: '#000',
                                        }
                                }
                        },
                        {
                                value: i_product_type_start[5],
                                name: 'ขออนุมัติเบิกจ่ายเงิน',
                                field: 'i_product_type5_start',
                                itemStyle: {
                                        decal: {
                                                symbol: 'triangle',
                                                dashArrayX: [2, 2],
                                                dashArrayY: [2, 2],
                                                rotation: 0,
                                                color: '#000',
                                        }
                                }
                        },
                        {
                                value: i_product_type_start[6],
                                name: 'เบิกจ่ายเงินแล้ว',
                                field: 'i_product_type6_start',
                                decal: {
                                        symbol: 'dot',
                                        dashArrayX: [1, 2],
                                        dashArrayY: [1, 2],
                                        rotation: 0,
                                        color: '#000',
                                }

                        },
                        {
                                value: i_product_type_start[7],
                                name: 'ยกเลิก',
                                field: 'i_product_type7_start',
                                decal: {
                                        symbol: 'diamond',
                                        dashArrayX: [4, 2],
                                        dashArrayY: [2, 4],
                                        rotation: 0,
                                        color: '#000',
                                }

                        },
                ];

                // Generate sample data
                var categories = ["ครุภัณฑ์", "วัสดุ", "งานจ้าง", "งานเช่า", "โครงการต่อเนื่อง", "สัญญาจะซื้อจะขาย", "งานจ้างก่อสร้าง"];

                var colors = ['#4CAF50', '#FF9800', '#2196F3', '#9C27B0', '#03A9F4', '#FFC107', '#8BC34A', '#E91E63'];
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
                                row += '<td>' + item.c_name + '</td>';
                                types.forEach(function(tp) {
                                        var val = item[tp.field] || 0;
                                        // เพิ่มลิงก์
                                        row += `<td><a href="#" onclick="openDetail('${item.sp_emp_id}','${tp.field}','${val}')">${val}</a></td>`;
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
                                row += '<td>' + item.c_name + '</td>';
                                types.forEach(function(tp) {
                                        var val = item[tp.field] || 0;
                                        // เพิ่มลิงก์
                                        $i_type = tp.field + '_start'
                                        row += `<td><a href="#" onclick="openDetail('${item.sp_emp_id}','${$i_type}','${val}')">${val}</a></td>`;
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
                                text: 'Pie Char' + " ปริมาณงานปี " + year_th,
                                left: 'center'
                        },
                        tooltip: {
                                trigger: 'item',
                                formatter: '{b}: {c} ({d}%)'
                        },
                        legend: {
                                bottom: '10%',
                                left: 'center'
                        },
                        color: colors,
                        series: [{
                                name: 'Categories',
                                type: 'pie',
                                radius: '60%',
                                label: {
                                        show: true,
                                        // formatter: '{b}: {d}%',
                                        formatter: '{b}\n{c} ({d}%)',
                                        color: '#333',
                                        fontSize: 14
                                },
                                data: pieData,

                                emphasis: {
                                        itemStyle: {
                                                shadowBlur: 10,
                                                shadowOffsetX: 0,
                                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                                        }
                                }
                        }]
                };
                pieChart.setOption(pieOption);
                
                var pieChartStart = echarts.init(document.getElementById('pie_start'));
                var pieOptionStart = {
                        title: {
                                text: 'Pie Char' + " สถานะการดำเนินงาน " + year_th,
                                left: 'center'
                        },
                        tooltip: {
                                trigger: 'item',
                                formatter: '{b}: {c} ({d}%)'
                        },
                        legend: {
                                bottom: '10%',
                                left: 'center'
                        },
                        color: colors,
                        series: [{
                                name: 'Categories',
                                type: 'pie',
                                radius: '60%',
                                label: {
                                        show: true,
                                        // formatter: '{b}: {d}%',
                                        formatter: '{b}\n{c} ({d}%)',
                                        color: '#333',
                                        fontSize: 14
                                },
                                data: pieDataStart,

                                emphasis: {
                                        itemStyle: {
                                                shadowBlur: 10,
                                                shadowOffsetX: 0,
                                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                                        }
                                }
                        }]
                };
                pieChartStart.setOption(pieOptionStart);
                // Bar Chart 
                var barChart = echarts.init(document.getElementById('main'));
                var barOption = {
                        title: {
                                text: 'Bar Chart' + " ปริมาณงานปี " + year_th,
                                left: 'center'
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
                        openDetail(empId, field, value);
                });

                pieChart.on('click', function(params) {
                        console.log('Pie clicked:', params);
                        // alert('คุณคลิกที่: ' + params.name + '\\nเปอร์เซ็นต์: ' + params.percent + '%');
                        const empId = '0'; // Pie Chart เป็นรวม
                        const field = params.data.field || ''; // field มาจาก pieData
                        const value = params.value || 0;

                        if (value > 0) {
                                openDetail(empId, field, value);
                        }
                });



                function openDetail(empId, type, value) {
                        if (value == 0) return;
                        var yearTh = year_th; // ดึงจาก global JS variable
                        var yearEn = yearTh - 543;
                        var url = `Rep_DetailByType.php?sp_emp_id=${empId}&type=${type}&year_th=${yearTh}&year_en=${yearEn}&_rand=${random}`;
                        window.open(url, '_blank');
                }
        </script>

</body>

</html>