<?php
include("../api/List_RepBIPrType.php");
$dateJson = List_QueryParam();
?>
<!DOCTYPE html>
<html lang="en">

<head>
        <meta charset="UTF-8">
        <title>ECharts Report Display</title>
        <!-- <script src="https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js"></script> -->
        <script src="../../js/echarts/echarts.js"></script>
        <script src="../../js/echarts/macarons.js"></script>
        <style>
                #main-wrapper,
                #pie-wrapper {
                        width: 100%;
                        height: 500px;
                        /* ลดจาก 1000px เหลือ 400px */
                        overflow-y: auto;
                        margin-bottom: 30px;
                }

                #main,
                #pie {
                        width: 100%;
                        height: 500px;
                        /* ลดความสูง Pie ตาม */
                }

                table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                }

                table,
                th,
                td {
                        border: 2px solid #ddd;
                }

                th,
                td {
                        padding: 8px;
                        text-align: center;
                }

                th {
                        background-color: #d1f2eb;
                }

                tbody tr:nth-child(even) {
                        background-color: #f9f9f9;
                }

                .report-layout {
                        display: flex;
                        /* align-items: center; */
                        align-items: flex-start;
                        /* ⭐️ ทำให้แต่ละ panel ตรงกลางแนวตั้ง */
                        justify-content: flex-start;
                        /* panel วางซ้าย-ขวาตามปกติ */
                        gap: 32px;
                        min-height: 600px;
                        width: 100%;
                        max-width: 1800px;
                        margin: auto;
                        /* ⭐️ กำหนดความสูงขั้นต่ำเท่ากับตาราง หรือมากกว่า */
                }

                #pie-panel {
                        min-width: 400px;
                        flex: 1 1 350px;
                }

                .chart-panel {
                        flex: 0 0 500px;
                        /* Pie Chart panel กว้าง 500px */
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        min-width: 400px;
                        /* ปรับให้เท่ากับ/ใกล้เคียงตาราง */
                }

                #pie-chart {
                        width: 460px;
                        /* Pie Chart ใหญ่ขึ้น */
                        height: 420px;
                        margin-top: 16px;
                }

                .table-panel table {
                        min-width: 1100px;
                        /* ถ้าคอลัมน์เยอะ ตารางจะเลื่อนซ้าย-ขวาได้ */
                        font-size: 17px;
                        /* ตัวโตขึ้น */
                }

                #table-panel {
                        flex: 2 1 600px;
                        min-width: 340px;
                        overflow-x: auto;
                }

                .table-scroll-x {
                        overflow-x: auto;
                        width: 100%;
                }

                table {
                        min-width: 1200px;
                        /* กำหนดไว้เผื่อกรณีคอลัมน์เยอะ */
                        border-collapse: collapse;
                }

                th,
                td {
                        padding: 10px 18px;
                        font-size: 17px;
                }

                .pie-title {
                        font-size: 1.6em;
                        margin-bottom: 8px;
                        text-align: center;
                }
        </style>
</head>

<body>

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

        <!-- <div id="pie-wrapper">
                <div id="pie"></div>
        </div> -->
        <div class="report-layout">
                <div style="display: flex; justify-content: center;">
                        <div id="pie-panel">
                                <!-- chart-panel" -->
                                <div class="pie-title" id="pie-title">Pie Chart ปีงบประมาณ XXXX</div>
                                <div id="pie-chart" style="width: 400px; height: 340px; margin:auto"></div>
                        </div>
                        <div id="table-panel">
                                <table class="table table-bordered">
                                        <thead>
                                                <tr>
                                                        <th>รายชื่อพนักงาน</th>
                                                        <th>ครุภัณฑ์</th>
                                                        <th>วัสดุ</th>
                                                        <th>งานจ้าง</th>
                                                        <th>งานเช่า</th>
                                                        <th>โครงการต่อเนื่อง</th>
                                                        <th>สัญญาจะซื้อจะขาย</th>
                                                        <th>งานจ้างก่อสร้าง</th>
                                                        <th>สรุปรวม</th>
                                                </tr>
                                        </thead>
                                        <tbody id="data-table-body"></tbody>

                                        <tr style="font-weight:bold; background-color: #f9f9f9;">
                                                <td>รวม</td>
                                                <td id="sum1"></td>
                                                <td id="sum2"></td>
                                                <td id="sum3"></td>
                                                <td id="sum4"></td>
                                                <td id="sum5"></td>
                                                <td id="sum6"></td>
                                                <td id="sum7"></td>
                                                <td id="sum8"></td>
                                        </tr>
                                </table>
                        </div>
                </div>
        </div>

        <div id="main-wrapper">
                <div id="main"></div>
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

                // Generate 40 names
                var dateJson = '<?php echo $dateJson; ?>';
                var array = JSON.parse(dateJson);
                var names = array.data.map(item => item.c_name);
                var i_product_type1 = array.i_product_type1;
                var i_product_type2 = array.i_product_type2;
                var i_product_type3 = array.i_product_type3;
                var i_product_type4 = array.i_product_type4;
                var i_product_type5 = array.i_product_type5;
                var i_product_type6 = array.i_product_type6;
                var i_product_type7 = array.i_product_type7;
                var i_product_type8 = array.i_product_type8;
                var year_th = array.year_th;
                var tableBody = document.getElementById('data-table-body');
                tableBody.innerHTML = '';
                array.data.forEach(function(item) {
                        var row = '<tr>';
                        row += `<td>${item.status_name}</td>`;
                        row += `<td>${item.i_product_type1}</td>`;
                        row += `<td>${item.i_product_type2}</td>`;
                        row += `<td>${item.i_product_type3}</td>`;
                        row += `<td>${item.i_product_type4}</td>`;
                        row += `<td>${item.i_product_type5}</td>`;
                        row += `<td>${item.i_product_type6}</td>`;
                        row += `<td>${item.i_product_type7}</td>`;
                        row += `<td>${item.sum_total}</td>`;
                        row += '</tr>';
                        tableBody.innerHTML += row;
                });
                document.getElementById('sum1').innerText = i_product_type1;
                document.getElementById('sum2').innerText = i_product_type2;
                document.getElementById('sum3').innerText = i_product_type3;
                document.getElementById('sum4').innerText = i_product_type4;
                document.getElementById('sum5').innerText = i_product_type5;
                document.getElementById('sum6').innerText = i_product_type6;
                document.getElementById('sum7').innerText = i_product_type7;
                document.getElementById('sum8').innerText = i_product_type8;
                document.getElementById('pie-title').innerText = 'Pie Chart ปีงบประมาณ ' + year_th;

                document.getElementById('budget_year_filter').addEventListener('change', function() {
                        var yearTh = this.value;
                        var yearEn = this.options[this.selectedIndex].getAttribute('data-year-en');

                        // ส่งไปหน้าเดียวกันพร้อม 2 พารามิเตอร์
                        var url = window.location.pathname + '?year_th=' + yearTh + '&year_en=' + yearEn;
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
                const pieData = [{
                                value: i_product_type1,
                                name: 'ครุภัณฑ์'
                        },
                        {
                                value: i_product_type2,
                                name: 'วัสดุ'
                        },
                        {
                                value: i_product_type3,
                                name: 'งานจ้าง'
                        },
                        {
                                value: i_product_type4,
                                name: 'งานเช่า'
                        },
                        {
                                value: i_product_type5,
                                name: 'โครงการต่อเนื่อง'
                        },
                        {
                                value: i_product_type6,
                                name: 'สัญญาจะซื้อจะขาย'
                        },
                        {
                                value: i_product_type7,
                                name: 'งานก่อสร้าง'
                        },
                ];

                // Generate sample data
                var categories = ["ครุภัณฑ์", "วัสดุ", "งานจ้าง", "งานเช่า", "โครงการต่อเนื่อง", "สัญญาจะซื้อจะขาย", "งานจ้างก่อสร้าง"];

                var colors = ['#4CAF50', '#FF9800', '#2196F3', '#9C27B0', '#03A9F4', '#FFC107', '#8BC34A', '#E91E63'];

                var seriesData = categories.map((cat, index) => ({
                        name: cat,
                        type: 'bar',
                        stack: 'total',
                        emphasis: {
                                focus: 'series'
                        },
                        itemStyle: {
                                color: colors[index % colors.length]
                        },
                        label: {
                                show: true,
                                position: 'inside',
                                color: '#ffffff',
                                fontSize: 12
                        },
                        data: array.data.map(item => item[`i_product_type${index + 1}`] || 0) // ดึงข้อมูลตาม i_product_type1, 2, 3,...
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

                // Pie Chart
                var pieChart = echarts.init(document.getElementById('pie-chart'));
                var pieOption = {
                        // title: {
                        //         text: 'Pie Char' + " ปีงบประมาณ " + year_th,
                        //         left: 'center'
                        // },
                        tooltip: {
                                trigger: 'item'
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
                                avoidLabelOverlap: true, // ลดการทับกันของ label
                                label: {
                                        show: true,
                                        type: 'pie',
                                        radius: ['45%', '80%'],
                                        // formatter: '{b}: {d}%',
                                        formatter: '{b}: {c} ({d}%)',
                                        // formatter: '{b}\n{c} ({d}%)',
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
                // Bar Chart
                var barChart = echarts.init(document.getElementById('main'));
                var barOption = {
                        title: {
                                text: 'Bar Chart' + " ปีงบประมาณ " + year_th,
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
                        alert('คุณคลิกที่: ' + params.name + '\\nหมวดหมู่: ' + params.seriesName + '\\nค่าคือ: ' + params.value);
                });

                pieChart.on('click', function(params) {
                        console.log('Pie clicked:', params);
                        alert('คุณคลิกที่: ' + params.name + '\\nเปอร์เซ็นต์: ' + params.percent + '%');
                });

                function openDetail(empId, type, value) {
                        if (value == 0) return;
                        var yearTh = year_th; // ดึงจาก global JS variable
                        var yearEn = yearTh - 543;
                        var url = `Rep_DetailByType.php?sp_emp_id=${empId}&type=${type}&year_th=${yearTh}&year_en=${yearEn}`;
                        window.open(url, '_blank');
                }
        </script>

</body>

</html>