<?php
include("../api/List_RepBIPrType.php");
$dateJson = List_QueryParam(); 
?>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <title>ECharts Report Display</title>
  <script src="../../js/echarts/echarts.js"></script>
  <script src="../../js/echarts/macarons.js"></script>
  <style>
    #main-wrapper,
    #pie-wrapper {
      width: 100%;
      height: 600px;
      overflow-y: auto;
      margin-bottom: 30px;
    }

    #main,
    #pie {
      width: 100%;
      height: 1000px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }

    table,
    th,
    td {
      border: 1px solid #ddd;
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
  </style>
</head>

<body>

  <label>
    <input type="checkbox" id="filter_equipment"> แสดงเฉพาะผู้ที่มีครุภัณฑ์
  </label>

  <select id="source_filter">
    <option value="all">- เลือกทั้งหมด -</option>
  </select>

  <div id="main-wrapper">
    <div id="main"></div>
  </div>

  <div id="pie-wrapper">
    <div id="pie"></div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>ครุภัณฑ์</th>
        <th>วัสดุ</th>
        <th>ไม่มีของ</th>
      </tr>
    </thead>
    <tbody id="data-table-body">
      <!-- Dynamic Rows -->
    </tbody>
  </table>

  <script>
    var dateJson = '<?php echo $dateJson; ?>';
    var array = JSON.parse(dateJson);
    var categories = ["ครุภัณฑ์", "วัสดุ", "ไม่มีของ"];
    var colors = ['#4CAF50', '#FF9800', '#2196F3'];

    const barChart = echarts.init(document.getElementById('main'));

    function populateSourceFilter() {
      const select = document.getElementById('source_filter');
      const sources = [...new Set(array.data.map(item => item.source || 'ไม่ระบุ'))];
      sources.forEach(source => {
        const opt = document.createElement('option');
        opt.value = source;
        opt.textContent = source;
        select.appendChild(opt);
      });
    }

    function reloadData() {
      const filterChecked = document.getElementById('filter_equipment').checked;
      const selectedSource = document.getElementById('source_filter').value;

      const filtered = array.data.filter(item => {
        const passEquipment = filterChecked ? item.i_product_type1 > 0 : true;
        const passSource = selectedSource === 'all' ? true : item.source === selectedSource;
        return passEquipment && passSource;
      });

      const names = filtered.map(item => item.c_name);
      const seriesData = categories.map((cat, index) => ({
        name: cat,
        type: 'bar',
        stack: 'total',
        emphasis: { focus: 'series' },
        itemStyle: { color: colors[index % colors.length] },
        label: { show: true, position: 'inside', color: '#fff', fontSize: 12 },
        data: filtered.map(item => item[`i_product_type${index + 1}`] || 0)
      }));

      const tableBody = document.getElementById('data-table-body');
      tableBody.innerHTML = '';
      filtered.forEach((item) => {
        const row = `<tr>
            <td>${item.c_name}</td>
            <td>${item.i_product_type1}</td>
            <td>${item.i_product_type2}</td>
            <td>${item.i_product_type3}</td>
          </tr>`;
        tableBody.innerHTML += row;
      });

      barChart.setOption({
        title: {
          text: 'Bar Chart - Filtered',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        legend: { bottom: 10 },
        grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
        xAxis: { type: 'value' },
        yAxis: { type: 'category', data: names },
        series: seriesData
      });
    }

    document.getElementById('filter_equipment').addEventListener('change', reloadData);
    document.getElementById('source_filter').addEventListener('change', reloadData);
    populateSourceFilter();
    reloadData();
  </script>
</body>
</html>
