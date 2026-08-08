// console.log('dataJson from ReportChart.js:', typeof dataJson, dataJson)
// Generate 40 names
// console.log(dataJson);
document.addEventListener("DOMContentLoaded", function () {
  function reloadData() {
    const filterChecked = document.getElementById("filter_equipment").checked;
    const selectedYear = document.getElementById("budget_year_filter").value;

    const filtered = array.data.filter((item) => {
      const matchEquipment = filterChecked ? item.i_product_type1 > 0 : true;
      const matchYear = selectedYear === "all" ? true : item.budget_year == selectedYear;
      return matchEquipment && matchYear;
    });

    // [render chart and table with filtered data...]
  }
  var types = [
    {
      field: "i_product_type1",
      label: "ครุภัณฑ์",
    },
    {
      field: "i_product_type2",
      label: "วัสดุ",
    },
    {
      field: "i_product_type3",
      label: "งานจ้าง",
    },
    {
      field: "i_product_type4",
      label: "งานเช่า",
    },
    {
      field: "i_product_type5",
      label: "โครงการต่อเนื่อง",
    },
    {
      field: "i_product_type6",
      label: "สัญญาจะซื้อจะขาย",
    },
    {
      field: "i_product_type7",
      label: "งานจ้างก่อสร้าง",
    },
    {
      field: "i_product_type8",
      label: "สรุปรวม",
    },
  ];
  const array = dataJson.data;

  if (Array.isArray(array)) {
    const names = array.map((item) => item.c_name);
    console.log("✅ รายชื่อ:", names);
    // เรียกกราฟ หรือฟังก์ชันต่อได้เลย เช่น renderBarChart(array)
  } else {
    console.error("❌ dataJson.data ไม่ใช่ array:", array);
  }
  //   Array.isArray(dataJson.data)          // ต้องได้ true
  const names = array.map((item) => item.c_name);
  const year_th = dataJson.year_th;

  var i_product_type1 = array.i_product_type1;
  var i_product_type2 = array.i_product_type2;
  var i_product_type3 = array.i_product_type3;
  var i_product_type4 = array.i_product_type4;
  var i_product_type5 = array.i_product_type5;
  var i_product_type6 = array.i_product_type6;
  var i_product_type7 = array.i_product_type7;
  var i_product_type8 = array.i_product_type8;

  var tableBody = document.getElementById("data-table-body");
  document.getElementById("sum1").innerText = i_product_type1;
  document.getElementById("sum2").innerText = i_product_type2;
  document.getElementById("sum3").innerText = i_product_type3;
  document.getElementById("sum4").innerText = i_product_type4;
  document.getElementById("sum5").innerText = i_product_type5;
  document.getElementById("sum6").innerText = i_product_type6;
  document.getElementById("sum7").innerText = i_product_type7;
  document.getElementById("sum8").innerText = i_product_type8;
  console.log(echarts.version);

  const random = Date.now();

  document.getElementById("budget_year_filter").addEventListener("change", function () {
    var yearTh = this.value;
    var yearEn = this.options[this.selectedIndex].getAttribute("data-year-en");

    // ส่งไปหน้าเดียวกันพร้อม 2 พารามิเตอร์
    var url = window.location.pathname + "?year_th=" + yearTh + "&year_en=" + yearEn + "&_rand=" + random;
    window.location.href = url;
  });
  array.data.forEach(function (item) {
    var row = "<tr>";
    row += "<td>" + item.c_name + "</td>";
    types.forEach(function (tp) {
      var val = item[tp.field] || 0;
      // เพิ่ม <a> ครอบตัวเลข
      row += `<td><a href="#" onclick="openDetail('${item.sp_emp_id}','${tp.field}','${val}')">${val}</a></td>`;
    });
    row += "</tr>";
    tableBody.innerHTML += row;
  });
  const pieData = [
    {
      value: i_product_type1,
      name: "ครุภัณฑ์",
      field: "i_product_type1",
      itemStyle: {
        decal: {
          symbol: "rect",
          color: "#000",
          backgroundColor: "#5B9BD5",
          dashArrayX: [6, 0],
          dashArrayY: [6, 6],
          rotation: 0,
        },
      },
    },
    {
      value: i_product_type2,
      name: "วัสดุ",
      field: "i_product_type2",
      itemStyle: {
        decal: {
          symbol: "circle",
          dashArrayX: [1, 2],
          dashArrayY: [2, 1],
          rotation: 0,
        },
      },
    },
    {
      value: i_product_type3,
      name: "งานจ้าง",
      field: "i_product_type3",
      itemStyle: {
        decal: {
          symbol: "rect",
          dashArrayX: [4, 2],
          dashArrayY: [2, 4],
          rotation: 0,
        },
      },
    },
    {
      value: i_product_type4,
      name: "งานเช่า",
      field: "i_product_type4",
      itemStyle: {
        decal: {
          symbol: "cross",
          dashArrayX: [1, 0],
          dashArrayY: [1, 0],
          rotation: 0,
        },
      },
    },
    {
      value: i_product_type5,
      name: "โครงการต่อเนื่อง",
      field: "i_product_type5",
      itemStyle: {
        decal: {
          symbol: "triangle",
          dashArrayX: [2, 2],
          dashArrayY: [2, 2],
          rotation: 0,
        },
      },
    },
    {
      value: i_product_type6,
      name: "สัญญาจะซื้อจะขาย",
      field: "i_product_type6",
      decal: {
        symbol: "dot",
        dashArrayX: [1, 2],
        dashArrayY: [1, 2],
        rotation: 0,
      },
    },
    {
      value: i_product_type7,
      name: "งานก่อสร้าง",
      field: "i_product_type7",
      decal: {
        symbol: "diamond",
        dashArrayX: [4, 2],
        dashArrayY: [2, 4],
        rotation: 0,
      },
    },
  ];

  // Generate sample data
  var categories = ["ครุภัณฑ์", "วัสดุ", "งานจ้าง", "งานเช่า", "โครงการต่อเนื่อง", "สัญญาจะซื้อจะขาย", "งานจ้างก่อสร้าง"];

  var colors = ["#4CAF50", "#FF9800", "#2196F3", "#9C27B0", "#03A9F4", "#FFC107", "#8BC34A", "#E91E63"];
  const patterns = [
    {
      symbol: "rect",
      dashArrayX: [6, 0],
      dashArrayY: [6, 6],
      rotation: 0,
    },
    {
      symbol: "circle",
      dashArrayX: [1, 2],
      dashArrayY: [2, 1],
      rotation: 0,
    },
    {
      symbol: "line",
      dashArrayX: [2, 2],
      dashArrayY: [4, 2],
      rotation: 0,
    },
    {
      symbol: "triangle",
      dashArrayX: [2, 2],
      dashArrayY: [2, 2],
      rotation: 0,
    },
    {
      symbol: "diamond",
      dashArrayX: [4, 2],
      dashArrayY: [2, 4],
      rotation: 0,
    },
    {
      symbol: "cross",
      dashArrayX: [1, 0],
      dashArrayY: [1, 0],
      rotation: 0,
    },
    {
      symbol: "dot",
      dashArrayX: [1, 2],
      dashArrayY: [1, 2],
      rotation: 0,
    },
  ];
  var seriesData = categories.map((cat, index) => ({
    name: cat,
    type: "bar",
    stack: "total",
    field: `i_product_type${index + 1}`, // <== เพิ่ม field นี้!
    emphasis: {
      focus: "series",
    },
    itemStyle: {
      color: colors[index % colors.length],
      decal: patterns[index % patterns.length], // << เพิ่มบรรทัดนี้!
    },
    label: {
      show: true,
      position: "inside",
      color: "#ffffff",
      fontSize: 12,
    },
    data: array.data.map((item, idx) => ({
      value: item[`i_product_type${index + 1}`] || 0,
      sp_emp_id: item.sp_emp_id, // ดึง emp_id มาให้ด้วย
      field: `i_product_type${index + 1}`, // ใส่ไว้ใน data ด้วย
    })),
    // data: array.data.map(item => item[`i_product_type${index + 1}`] || 0) // ดึงข้อมูลตาม i_product_type1, 2, 3,...
  }));

  // เติมตารางข้อมูล
  if (tableBody) {
    tableBody.innerHTML = ""; // เคลียร์ก่อนวนลูป

    array.data.forEach(function (item) {
      var row = "<tr>";
      row += "<td>" + item.c_name + "</td>";
      types.forEach(function (tp) {
        var val = item[tp.field] || 0;
        // เพิ่มลิงก์
        row += `<td><a href="#" onclick="openDetail('${item.sp_emp_id}','${tp.field}','${val}')">${val}</a></td>`;
      });
      row += "</tr>";
      tableBody.innerHTML += row;
    });
  } else {
    console.error('ไม่พบ <tbody id="data-table-body"> ใน HTML');
  }

  // Pie Chart
  var pieChart = echarts.init(document.getElementById("pie"));
  var pieOption = {
    title: {
      text: "Pie Char" + " ปีงบประมาณ " + year_th,
      left: "center",
    },
    tooltip: {
      trigger: "item",
    },
    legend: {
      bottom: "10%",
      left: "center",
    },
    color: colors,
    series: [
      {
        name: "Categories",
        type: "pie",
        radius: "60%",
        label: {
          show: true,
          // formatter: '{b}: {d}%',
          formatter: "{b}\n{c} ({d}%)",
          color: "#333",
          fontSize: 14,
        },
        data: pieData,

        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };
  pieChart.setOption(pieOption);
  // Bar Chart
  var barChart = echarts.init(document.getElementById("main"));
  var barOption = {
    title: {
      text: "Bar Chart" + " ปีงบประมาณ " + year_th,
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      bottom: 10,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      containLabel: true,
    },
    dataZoom: [
      {
        type: "slider",
        yAxisIndex: 0,
        start: 0,
        end: 50,
      },
      {
        type: "inside",
        yAxisIndex: 0,
        start: 0,
        end: 50,
      },
    ],
    xAxis: {
      type: "value",
    },
    yAxis: {
      type: "category",
      data: names,
    },
    series: seriesData,
  };
  barChart.setOption(barOption);
  // เพิ่มจับ Event คลิก
  barChart.on("click", function (params) {
    // alert('คุณคลิกที่: ' + params.name + '\\nหมวดหมู่: ' + params.seriesName + '\\nค่าคือ: ' + params.value);
    const empId = params.data.sp_emp_id || "0"; // ได้จาก data
    const field = params.data.field || params.seriesName; // ปลอดภัยขึ้น
    const value = params.value;
    console.log(params);
    openDetail(empId, field, value);
  });

  pieChart.on("click", function (params) {
    console.log("Pie clicked:", params);
    // alert('คุณคลิกที่: ' + params.name + '\\nเปอร์เซ็นต์: ' + params.percent + '%');
    const empId = "0"; // Pie Chart เป็นรวม
    const field = params.data.field || ""; // field มาจาก pieData
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
    window.open(url, "_blank");
  }

  renderBarChart(array);
});
