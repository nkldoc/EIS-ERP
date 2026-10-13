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
var barDom = document.getElementById("bar_bg");
var myChartBarBg = echarts.init(barDom);
// console.log("barDom:", barDom);

myChartBarBg.showLoading();
var array4 = JSON.parse(dateJson4);
console.log(array4);
$("#multiCheckCombo").on("changed.bs.select", function (e, clickedIndex, isSelected, previousValue) {
  //  const maxSelections = 5;
  // const selected = $(this).val() || [];
  // if (selected.length > maxSelections) {
  //   // ยกเลิกการเลือกล่าสุด
  //   $(this).find("option").eq(clickedIndex).prop("selected", false);
  //   $(this).selectpicker("refresh");
  //   showToast("เลือกหมวดค่าใช้จ่ายได้ไม่เกิน 5 รายการ");
  // }
  updateChartFromSelected();
});

$(document).ready(function () {
  $("#multiCheckCombo").selectpicker();
});
const selected = $("#multiCheckCombo").val(); // จะได้ array ของ value

const grouped = {};
const $select = $("#multiCheckCombo");
$select.empty(); // เคลียร์ option เดิม
const seen = new Set(); // ป้องกันซ้ำ

array4.data.forEach((item) => {
  const name = item.c_name;
  const id = item.bg_expense_id;
  if (!seen.has(id)) {
    seen.add(id);
    const option = new Option(name, id, false, false);
    option.setAttribute("title", name); // สำหรับ browser ทั่วไป
    option.setAttribute("data-content", `<span title="${name}">${name}</span>`); // Bootstrap-select ใช้แสดง tooltip
    $select.append(option);
  }
  if (!grouped[name]) {
    grouped[name] = {
      bg_expense_id: id,
      f_reserve_budget: 0,
      f_reserve_budget_income: 0,
      f_reserve_budget_income_Finish: 0,
      f_plan_begin_remaining: 0,

      f_reserve_period_bkb: 0,
      f_reserve_periodincome_bkb: 0,
      f_reserve_periodfinish_bkb: 0,
      f_period_transfer_remaining_bkb: 0,

      f_reserve_period_government: 0,
      f_reserve_periodincome_government: 0,
      f_reserve_periodfinish_government: 0,
      f_period_transfer_remaining_government: 0,
    };
  }
  // grouped[name].bg_expense_id = parseFloat(item.bg_expense_id) || 0;

  grouped[name].f_reserve_budget += parseFloat(item.f_reserve_budget) || 0;
  grouped[name].f_reserve_budget_income += parseFloat(item.f_reserve_budget_income) || 0;
  grouped[name].f_reserve_budget_income_Finish += parseFloat(item.f_reserve_budget_income_Finish) || 0;
  grouped[name].f_plan_begin_remaining += parseFloat(item.f_plan_begin_remaining) || 0;

  grouped[name].f_reserve_period_bkb += parseFloat(item.f_reserve_period_bkb) || 0;
  grouped[name].f_reserve_periodincome_bkb += parseFloat(item.f_reserve_periodincome_bkb) || 0;
  grouped[name].f_reserve_periodfinish_bkb += parseFloat(item.f_reserve_periodfinish_bkb) || 0;
  grouped[name].f_period_transfer_remaining_bkb += parseFloat(item.f_period_transfer_remaining_bkb) || 0;

  grouped[name].f_reserve_period_government += parseFloat(item.f_reserve_period_government) || 0;
  grouped[name].f_reserve_periodincome_government += parseFloat(item.f_reserve_periodincome_government) || 0;
  grouped[name].f_reserve_periodfinish_government += parseFloat(item.f_reserve_periodfinish_government) || 0;
  grouped[name].f_period_transfer_remaining_government += parseFloat(item.f_period_transfer_remaining_government) || 0;
});
$select.selectpicker("refresh"); // โหลดใหม่หลังใส่ option

const chartData = {
  names: [],
  bg_expense_id: [],
  f_reserve_budget: [],
  f_reserve_budget_income: [],
  f_reserve_budget_income_Finish: [],
  f_plan_begin_remaining: [],

  f_reserve_period_bkb: [],
  f_reserve_periodincome_bkb: [],
  f_reserve_periodfinish_bkb: [],
  f_period_transfer_remaining_bkb: [],

  f_reserve_period_government: [],
  f_reserve_periodincome_government: [],
  f_reserve_periodfinish_government: [],
  f_period_transfer_remaining_government: [],
};
// เตรียมข้อมูลสำหรับกราฟ
for (const name in grouped) {
  const g = grouped[name];
  const values = [g.f_reserve_budget, g.f_plan_begin_remaining, g.f_reserve_period_bkb, g.f_period_transfer_remaining_bkb, g.f_reserve_period_government, g.f_period_transfer_remaining_government];
  const total = values.reduce((sum, val) => sum + (Number(val) || 0), 0);

  // ✅ กรองเฉพาะหมวดที่มียอด > 0
  if (total > 0) {
    chartData.names.push(name);
    chartData.bg_expense_id.push(g.bg_expense_id);
    chartData.f_reserve_budget.push(Number(g.f_reserve_budget) || 0);
    chartData.f_reserve_budget_income.push(Number(g.f_reserve_budget_income) || 0);
    chartData.f_reserve_budget_income_Finish.push(Number(g.f_reserve_budget_income_Finish) || 0);
    chartData.f_plan_begin_remaining.push(Number(g.f_plan_begin_remaining) || 0);

    chartData.f_reserve_period_bkb.push(Number(g.f_reserve_period_bkb) || 0);
    chartData.f_reserve_periodincome_bkb.push(Number(g.f_reserve_periodincome_bkb) || 0);
    chartData.f_reserve_periodfinish_bkb.push(Number(g.f_reserve_periodfinish_bkb) || 0);
    chartData.f_period_transfer_remaining_bkb.push(Number(g.f_period_transfer_remaining_bkb) || 0);

    chartData.f_reserve_period_government.push(Number(g.f_reserve_period_government) || 0);
    chartData.f_reserve_periodincome_government.push(Number(g.f_reserve_periodincome_government) || 0);
    chartData.f_reserve_periodfinish_government.push(Number(g.f_reserve_periodfinish_government) || 0);
    chartData.f_period_transfer_remaining_government.push(Number(g.f_period_transfer_remaining_government) || 0);
  }
}
function updateChartFromSelected() {
  const selectedIds = $("#multiCheckCombo").val(); // array ของ bg_expense_id ที่ถูกเลือก

  const grouped = {};
  const seen = new Set();

  const chartData = {
    names: [],
    bg_expense_id: [],
    f_reserve_budget: [],
    f_reserve_budget_income: [],
    f_reserve_budget_income_Finish: [],
    f_plan_begin_remaining: [],

    f_reserve_period_bkb: [],
    f_reserve_periodincome_bkb: [],
    f_reserve_periodfinish_bkb: [],
    f_period_transfer_remaining_bkb: [],

    f_reserve_period_government: [],
    f_reserve_periodincome_government: [],
    f_reserve_periodfinish_government: [],
    f_period_transfer_remaining_government: [],
  };

  array4.data.forEach((item) => {
    const id = item.bg_expense_id;
    const name = item.c_name;
    if (!selectedIds.includes(String(id))) return; // ✅ กรองเฉพาะที่ถูกเลือก

    if (!grouped[name]) {
      grouped[name] = {
        bg_expense_id: id,
        f_reserve_budget: 0,
        f_reserve_budget_income: 0,
        f_reserve_budget_income_Finish: 0,
        f_plan_begin_remaining: 0,

        f_reserve_period_bkb: 0,
        f_reserve_periodincome_bkb: 0,
        f_reserve_periodfinish_bkb: 0,
        f_period_transfer_remaining_bkb: 0,

        f_reserve_period_government: 0,
        f_reserve_periodincome_government: 0,
        f_reserve_periodfinish_government: 0,
        f_period_transfer_remaining_government: 0,
      };
    }

    // grouped[name].bg_expense_id += parseFloat(id) || 0;
    grouped[name].f_reserve_budget += parseFloat(item.f_reserve_budget) || 0;
    grouped[name].f_reserve_budget_income += parseFloat(item.f_reserve_budget_income) || 0;
    grouped[name].f_reserve_budget_income_Finish += parseFloat(item.f_reserve_budget_income_Finish) || 0;
    grouped[name].f_plan_begin_remaining += parseFloat(item.f_plan_begin_remaining) || 0;

    grouped[name].f_reserve_period_bkb += parseFloat(item.f_reserve_period_bkb) || 0;
    grouped[name].f_reserve_periodincome_bkb += parseFloat(item.f_reserve_periodincome_bkb) || 0;
    grouped[name].f_reserve_periodfinish_bkb += parseFloat(item.f_reserve_periodfinish_bkb) || 0;
    grouped[name].f_period_transfer_remaining_bkb += parseFloat(item.f_period_transfer_remaining_bkb) || 0;

    grouped[name].f_reserve_period_government += parseFloat(item.f_reserve_period_government) || 0;
    grouped[name].f_reserve_periodincome_government += parseFloat(item.f_reserve_periodincome_government) || 0;
    grouped[name].f_reserve_periodfinish_government += parseFloat(item.f_reserve_periodfinish_government) || 0;
    grouped[name].f_period_transfer_remaining_government += parseFloat(item.f_period_transfer_remaining_government) || 0;
  });

  for (const name in grouped) {
    const g = grouped[name];
    const values = [g.f_reserve_budget, g.f_plan_begin_remaining, g.f_reserve_period_bkb, g.f_period_transfer_remaining_bkb, g.f_reserve_period_government, g.f_period_transfer_remaining_government];
    const total = values.reduce((sum, val) => sum + (Number(val) || 0), 0);

    if (total > 0) {
      chartData.names.push(name);
      // chartData.bg_expense_id.push(bg_expense_id);
      chartData.f_reserve_budget.push({
        value: Number(g.f_reserve_budget) || 0,
        bg_expense_id: g.bg_expense_id,
        budget_type_id: "f_reserve_budget",
      });

      chartData.bg_expense_id.push(g.bg_expense_id);
      chartData.f_reserve_budget_income.push({
        value: Number(g.f_reserve_budget_income) || 0,
        bg_expense_id: g.bg_expense_id,
        budget_type_id: "f_reserve_budget_income",
      });
      chartData.f_reserve_budget_income_Finish.push({ value: Number(g.f_reserve_budget_income_Finish) || 0, bg_expense_id: g.bg_expense_id, budget_type_id: "f_reserve_budget_income" });
      chartData.f_plan_begin_remaining.push({ value: Number(g.f_plan_begin_remaining) || 0, bg_expense_id: g.bg_expense_id, budget_type_id: "f_reserve_budget_income" });

      chartData.f_reserve_period_bkb.push({ value: Number(g.f_reserve_period_bkb) || 0, bg_expense_id: g.bg_expense_id, budget_type_id: "f_reserve_budget_income" });

      chartData.f_reserve_periodincome_bkb.push({ value: Number(g.f_reserve_periodincome_bkb) || 0, bg_expense_id: g.bg_expense_id, budget_type_id: "f_reserve_budget_income" });
      chartData.f_reserve_periodfinish_bkb.push({ value: Number(g.f_reserve_periodfinish_bkb) || 0, bg_expense_id: g.bg_expense_id, budget_type_id: "f_reserve_budget_income" });
      chartData.f_period_transfer_remaining_bkb.push({ value: Number(g.f_period_transfer_remaining_bkb) || 0, bg_expense_id: g.bg_expense_id, budget_type_id: "f_reserve_budget_income" });

      chartData.f_reserve_period_government.push({ value: Number(g.f_reserve_period_government) || 0, bg_expense_id: g.bg_expense_id, budget_type_id: "f_reserve_budget_income" });
      chartData.f_reserve_periodincome_government.push({ value: Number(g.f_reserve_periodincome_government) || 0, bg_expense_id: g.bg_expense_id, budget_type_id: "f_reserve_budget_income" });
      chartData.f_reserve_periodfinish_government.push({ value: Number(g.f_reserve_periodfinish_government) || 0, bg_expense_id: g.bg_expense_id, budget_type_id: "f_reserve_budget_income" });
      chartData.f_period_transfer_remaining_government.push({
        value: Number(g.f_period_transfer_remaining_government) || 0,
        bg_expense_id: g.bg_expense_id,
        budget_type_id: "f_reserve_budget_income",
      });
    }
  }

  // ✅ อัปเดตข้อมูลในกราฟ
  console.log(chartData);
  myChartBarBg.setOption({
    xAxis: [{ data: chartData.names, bg_expense_id: chartData.bg_expense_id }],
    series: [
      { data: chartData.f_reserve_budget },
      { data: chartData.f_reserve_budget_income },
      { data: chartData.f_reserve_budget_income_Finish },
      { data: chartData.f_plan_begin_remaining },

      { data: chartData.f_reserve_period_bkb },
      { data: chartData.f_reserve_periodincome_bkb },
      { data: chartData.f_reserve_periodfinish_bkb },
      { data: chartData.f_period_transfer_remaining_bkb },

      { data: chartData.f_reserve_period_government },
      { data: chartData.f_reserve_periodincome_government },
      { data: chartData.f_reserve_periodfinish_government },
      { data: chartData.f_period_transfer_remaining_government },
    ],
  });
}

myChartBarBg.hideLoading();
var optionBg = {
  tooltip: {
    trigger: "axis",
    axisPointer: { type: "cross" },
    formatter: function (params) {
      const name = params[0].name;
      let content = `<strong>${name}</strong><br/>`;
      let used = 0;
      let remain = 0;
      let usedBkk = 0;
      let remainBkk = 0;
      let usedremaingovernment = 0;
      let remaingovernment = 0;
      params.forEach((p) => {
        const val = p.value || 0;
        const v = val.toLocaleString();
        content += `${p.marker} ${p.seriesName}: ${v} บาท<br/>`;
        // รายได้
        if ((p.seriesName.includes("ที่ใช้ไป") || p.seriesName.includes("ตรวจรับแล้ว") || p.seriesName.includes("เบิกแล้ว")) && p.seriesName.includes("รายได้")) {
          used += val;
        } else if (p.seriesName.includes("คงเหลือ") && p.seriesName.includes("รายได้")) {
          remain += val;
        }
        // กทม.
        else if ((p.seriesName.includes("ที่ใช้ไป") || p.seriesName.includes("ตรวจรับแล้ว") || p.seriesName.includes("เบิกแล้ว")) && p.seriesName.includes("กทม")) {
          usedBkk += val;
        } else if (p.seriesName.includes("คงเหลือ") && p.seriesName.includes("กทม")) {
          remainBkk += val;
        }
        // รัฐบาล.
        else if ((p.seriesName.includes("ที่ใช้ไป") || p.seriesName.includes("ตรวจรับแล้ว") || p.seriesName.includes("เบิกแล้ว")) && p.seriesName.includes("รัฐบาล")) {
          usedremaingovernment += val;
        } else if (p.seriesName.includes("คงเหลือ") && p.seriesName.includes("รัฐบาล")) {
          remaingovernment += val;
        }
      });
      const totalIncome = used + remain;
      const totalBkk = usedBkk + remainBkk;
      const totalgovernment = usedremaingovernment + remaingovernment;
      content += `<br/><strong>รวมรายได้: ${totalIncome.toLocaleString()} บาท</strong>`;
      content += `<br/><strong>รวมกทม.: ${totalBkk.toLocaleString()} บาท</strong>`;
      content += `<br/><strong>รวมงบรัฐบาล: ${totalgovernment.toLocaleString()} บาท</strong>`;

      return content;
    },
  },
  title: {
    text: "ข้อมูลการเบิกจ่ายตามหมวดหมู่",
    left: "left", // ชิดซ้าย
    top: "top", // อยู่บนสุด
    textStyle: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#333",
    },
  },
  legend: [
    {
      data: ["ที่ใช้ไป เงินรายได้", "ตรวจรับแล้ว เงินรายได้", "เบิกแล้ว เงินรายได้", "คงเหลือ เงินรายได้"],
      top: "0.3%",
      left: "30%",
      orient: "horizontal",
    },
    {
      data: ["ที่ใช้ไป อุดหนุนกทม.", "ตรวจรับแล้ว อุดหนุนกทม.", "เบิกแล้ว อุดหนุนกทม.", "คงเหลือ อุดหนุนกทม."],
      top: "5%",
      left: "30%",
      orient: "horizontal",
    },
    {
      data: ["ที่ใช้ไป อุดหนุนรัฐบาล", "ตรวจรับแล้ว อุดหนุนรัฐบาล", "เบิกแล้ว อุดหนุนรัฐบาล", "คงเหลือ อุดหนุนรัฐบาล"],
      top: "10%",
      left: "30%",
      orient: "horizontal",
    },
  ],
  grid: {
    top: "23%", //   จาก "12%" หรือมากกว่านิดนึง
    left: "3%",
    right: "4%",
    containLabel: true,
  },
  xAxis: [
    {
      type: "category",
      data: chartData.names,
      axisLabel: {
        interval: 0,
        rotate: 45,
        formatter: function (value) {
          return value.length > 30 ? value.slice(0, 30) + "..." : value;
        },
      },
    },
  ],
  yAxis: [
    {
      type: "value",
      name: "Budget (บาท)",
      axisLabel: {
        formatter: function (value) {
          return value.toLocaleString(); // ใส่ลูกน้ำหลักพัน
        },
      },
    },
  ],
  toolbox: {
    show: true,
    feature: {
      mark: {
        show: true,
      },
      dataView: {
        show: true,
        readOnly: true,
        optionToContent: function (opt) {
          const axisData = opt.yAxis?.[0]?.data || opt.xAxis?.[0]?.data || [];
          const series = opt.series;

          let table = `
    <table border="1" style="width:100%;border-collapse:collapse;text-align:center;font-family:'Tahoma';font-size:14px;">
      <thead>
        <tr>
          <th style="text-align:center;padding:8px;background:#3f51b5;color:white;">หมวดหมู่</th>`;

          for (let i = 0; i < series.length; i++) {
            table += `<th style="padding:8px;background:#3f51b5;color:white;">${series[i].name}</th>`;
          }

          table += "</tr></thead><tbody>";

          for (let i = 0; i < axisData.length; i++) {
            const label = axisData[i];
            const encodedLabel = encodeURIComponent(label); // เผื่อมีช่องว่าง/อักขระพิเศษ  addCommas

            table += `<tr>`;
            // ✅ ช่องชื่อ (คลิกได้)
            table += `<td style="text-align:left;padding:6px;">
                <a href="report_detail.php?name=${encodedLabel}" target="_blank" style="text-decoration:none;color:#3f51b5;">
                  ${label}
                </a>
              </td>`;

            // ✅ ข้อมูลแต่ละปี
            for (let j = 0; j < series.length; j++) {
              const val = series[j].data[i];
              const displayVal = typeof val === "object" ? val?.value : val;
              const text = displayVal === 0 || displayVal === "0" ? "-" : echarts.format.addCommas(displayVal);
              table += `<td style="padding:6px; text-align:right;">${text}</td>`;
            }

            table += `</tr>`;
          }

          table += `</tbody></table>`;
          return table;
        },
      },
      magicType: {
        show: true,
        type: ["line", "bar", "stack", "tiled"],
      },
      restore: {
        show: true,
      },
      saveAsImage: {
        show: true,
      },
    },
  },

  dataZoom: [
    {
      type: "slider",
      show: true,
      xAxisIndex: 0,
      start: 0,
      end: 100,
    },
    {
      type: "inside",
      xAxisIndex: 0,
      start: 0,
      end: 100,
    },
  ],
  series: [
    {
      type: "bar",
      name: "ที่ใช้ไป เงินรายได้",
      stack: "bg",
      barWidth: 40,
      encode: {
        x: 0, // ชื่อ
        y: 1, // จำนวนเงิน
      },
      data: chartData.f_reserve_budget.map((val, i) => ({
        value: val,
        bg_expense_id: chartData.bg_expense_id[i],
        budget_type_id: "f_reserve_budget",
      })),
      itemStyle: {
        color: "#1E88E5",
        borderColor: "#000000", // หรือ '#ccc'
        opacity: 1, //   ทึบเพื่ออยู่ด้านหน้า f_reserve_budget
      },
      z: 1,
    },
    {
      name: "ตรวจรับแล้ว เงินรายได้",
      type: "bar",
      stack: "bg",
      encode: {
        x: 0, // ชื่อ
        y: 1, // จำนวนเงิน
      },
      data: chartData.f_reserve_budget_income.map((val, i) => ({
        value: val,
        bg_expense_id: chartData.bg_expense_id[i],
        budget_type_id: "f_reserve_budget_income",
      })),
      barWidth: 40,
      itemStyle: {
        color: "#42A5F5",
        borderColor: "#000000", // หรือ '#ccc'
        // opacity: 0.8, //   โปร่งแสง เพื่อเป็นพื้น
      },
      emphasis: {
        itemStyle: {
          // opacity: 0.3, // ตอน hover ยังจางกว่าเดิม
        },
      },
      z: 2,
    },
    {
      name: "เบิกแล้ว เงินรายได้",
      type: "bar",
      stack: "bg",
      encode: {
        x: 0, // ชื่อ
        y: 1, // จำนวนเงิน
      },
      data: chartData.f_reserve_budget_income_Finish.map((val, i) => ({
        value: val,
        bg_expense_id: chartData.bg_expense_id[i],
        budget_type_id: "f_reserve_budget_income_Finish",
      })),
      barWidth: 40,
      itemStyle: {
        color: "#90CAF9",
        borderColor: "#000000", // หรือ '#ccc'
        // opacity: 0.5, //   โปร่งแสง เพื่อเป็นพื้น
      },
      emphasis: {
        itemStyle: {
          // opacity: 0.2, // ตอน hover ยังจางกว่าเดิม
        },
      },
      z: 3,
    },
    {
      name: "คงเหลือ เงินรายได้",
      type: "bar",
      stack: "bg",
      encode: {
        x: 0, // ชื่อ
        y: 1, // จำนวนเงิน
      },
      data: chartData.f_plan_begin_remaining.map((val, i) => ({
        value: val,
        bg_expense_id: chartData.bg_expense_id[i],
        budget_type_id: "f_plan_begin_remaining",
      })),
      barWidth: 40,
      itemStyle: {
        color: "#E3F2FD",
        borderColor: "#000000", // หรือ '#ccc'
        // opacity: 0.3, //   โปร่งแสง เพื่อเป็นพื้น
      },
      emphasis: {
        itemStyle: {
          // opacity: 0.1, // ตอน hover ยังจางกว่าเดิม
        },
      },
      z: 4,
    },
    {
      name: "ที่ใช้ไป อุดหนุนกทม.",
      type: "bar",
      stack: "bg_bkb",
      encode: {
        x: 0, // ชื่อ
        y: 1, // จำนวนเงิน
      },
      data: chartData.f_reserve_period_bkb.map((val, i) => ({
        value: val,
        bg_expense_id: chartData.bg_expense_id[i],
        budget_type_id: "f_reserve_period_bkb",
      })),
      barWidth: 40,
      itemStyle: {
        color: "#228B22",
        borderColor: "#000000", // หรือ '#ccc'
        // opacity: 1, //   ทึบเพื่ออยู่ด้านหน้า
      },
      z: 1,
    },
    {
      name: "ตรวจรับแล้ว อุดหนุนกทม.",
      type: "bar",
      stack: "bg_bkb",
      encode: {
        x: 0, // ชื่อ
        y: 1, // จำนวนเงิน
      },
      data: chartData.f_reserve_periodincome_bkb.map((val, i) => ({
        value: val,
        bg_expense_id: chartData.bg_expense_id[i],
        budget_type_id: "f_reserve_periodincome_bkb",
      })),
      barWidth: 40,
      itemStyle: {
        color: "#228B22",
        borderColor: "#000000", // หรือ '#ccc'
        // opacity: 0.8, //   โปร่งแสง เพื่อเป็นพื้น
      },
      emphasis: {
        itemStyle: {
          // opacity: 0.3, // ตอน hover ยังจางกว่าเดิม
        },
      },
      z: 2,
    },
    {
      name: "เบิกแล้ว อุดหนุนกทม.",
      type: "bar",
      stack: "bg_bkb",
      encode: {
        x: 0, // ชื่อ
        y: 1, // จำนวนเงิน
      },
      data: chartData.f_reserve_periodfinish_bkb.map((val, i) => ({
        value: val,
        bg_expense_id: chartData.bg_expense_id[i],
        budget_type_id: "f_reserve_periodfinish_bkb",
      })),
      barWidth: 40,
      itemStyle: {
        color: "#32CD32",
        borderColor: "#000000", // หรือ '#ccc'
        // opacity: 0.5, //   โปร่งแสง เพื่อเป็นพื้น
      },
      emphasis: {
        itemStyle: {
          // opacity: 0.2, // ตอน hover ยังจางกว่าเดิม
        },
      },
      z: 3,
    },
    {
      name: "คงเหลือ อุดหนุนกทม.",
      type: "bar",
      stack: "bg_bkb",
      encode: {
        x: 0, // ชื่อ
        y: 1, // จำนวนเงิน
      },
      data: chartData.f_period_transfer_remaining_bkb.map((val, i) => ({
        value: val,
        bg_expense_id: chartData.bg_expense_id[i],
        budget_type_id: "f_period_transfer_remaining_bkb",
      })),
      barWidth: 40,
      itemStyle: {
        color: "#98FB98",
        borderColor: "#000000", // หรือ '#ccc'
        // opacity: 0.2, //   โปร่งแสง เพื่อเป็นพื้น
      },
      z: 4,
    },
    {
      name: "ที่ใช้ไป อุดหนุนรัฐบาล",
      type: "bar",
      stack: "bg_government",
      encode: {
        x: 0, // ชื่อ
        y: 1, // จำนวนเงิน
      },
      data: chartData.f_reserve_period_government.map((val, i) => ({
        value: val,
        bg_expense_id: chartData.bg_expense_id[i],
        budget_type_id: "f_reserve_period_government",
      })),
      itemStyle: {
        color: "#FF8C00",
        borderColor: "#000000", // หรือ '#ccc'
        // opacity: 1, //   ทึบเพื่ออยู่ด้านหน้า
      },
      z: 1,
    },
    {
      name: "ตรวจรับแล้ว อุดหนุนรัฐบาล",
      type: "bar",
      stack: "bg_government",
      encode: {
        x: 0, // ชื่อ
        y: 1, // จำนวนเงิน
      },
      data: chartData.f_reserve_periodincome_government.map((val, i) => ({
        value: val,
        bg_expense_id: chartData.bg_expense_id[i],
        budget_type_id: "f_reserve_periodincome_government",
      })),
      barWidth: 40,
      itemStyle: {
        color: "#FFA500",
        borderColor: "#000000", // หรือ '#ccc'

        // opacity: 0.8, //   โปร่งแสง เพื่อเป็นพื้น
      },
      emphasis: {
        itemStyle: {
          // opacity: 0.3, // ตอน hover ยังจางกว่าเดิม
        },
      },
      z: 2,
    },
    {
      name: "เบิกแล้ว อุดหนุนรัฐบาล",
      type: "bar",
      stack: "bg_government",
      encode: {
        x: 0, // ชื่อ
        y: 1, // จำนวนเงิน
      },
      data: chartData.f_reserve_periodfinish_government.map((val, i) => ({
        value: val,
        bg_expense_id: chartData.bg_expense_id[i],
        budget_type_id: "f_reserve_periodfinish_government",
      })),
      barWidth: 40,
      itemStyle: {
        color: "#FFB347",
        borderColor: "#000000", // หรือ '#ccc'
        // opacity: 0.5, //   โปร่งแสง เพื่อเป็นพื้น
      },
      emphasis: {
        itemStyle: {
          // opacity: 0.2, // ตอน hover ยังจางกว่าเดิม
        },
      },
      z: 3,
    },
    {
      name: "คงเหลือ อุดหนุนรัฐบาล",
      type: "bar",
      stack: "bg_government",
      encode: {
        x: 0, // ชื่อ
        y: 1, // จำนวนเงิน
      },
      data: chartData.f_period_transfer_remaining_government.map((val, i) => ({
        value: val,
        bg_expense_id: chartData.bg_expense_id[i],
        budget_type_id: "f_period_transfer_remaining_government",
      })),
      itemStyle: {
        color: "#FFD700",
        borderColor: "#000000", // หรือ '#ccc'
        // opacity: 0.2, //   โปร่งแสง เพื่อเป็นพื้น
      },
      z: 4,
    },
  ],
};

myChartBarBg.setOption(optionBg);

myChartBarBg.on("legendselectchanged", function (params) {
  const selectedName = params.name;
  const isSelected = params.selected[selectedName];

  const seriesMap = {
    งบรายได้: ["ที่ใช้ไป รายได้", "คงเหลือ รายได้"],
    งบกทม: ["ที่ใช้ไป กทม.", "คงเหลือ กทม."],
    งบรัฐบาล: ["ที่ใช้ไป อุดหนุนรัฐบาล", "คงเหลือ อุดหนุนรัฐบาล"],
  };

  const targets = seriesMap[selectedName] || [];
  targets.forEach((seriesName) => {
    myChartBarBg.dispatchAction({
      type: isSelected ? "legendSelect" : "legendUnSelect",
      name: seriesName,
    });
  });
});

function showToast(message) {
  $("#toastMessage").text(message);
  $("#myToast").toast("show");
}
function exportTableToExcel() {
  var table = document.querySelector("#bar_bg div table");
  if (!table) {
    showToast("ไม่พบตาราง");
    return;
  }

  var workbook = XLSX.utils.book_new();
  var worksheet = XLSX.utils.table_to_sheet(table);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report Data");
  XLSX.writeFile(workbook, "report_data.xlsx");
}
function exportStyledTableToExcel() {
  var table = document.querySelector("#bar_bg div table");
  if (!table) {
    alert("ไม่พบตาราง");
    return;
  }
  const wb = XLSX.utils.table_to_book(table, { sheet: "Data View" });
  XLSX.writeFile(wb, "styled_data_view.xlsx");
}

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------

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
var tor_types = [
  {
    field: "i_tor_type1",
    label: "วิธีประกวดราคาอิเล็กทรอนิกส์ (E-Bidding)",
  },
  {
    field: "i_tor_type2",
    label: "วิธีคัดเลือก",
  },
  {
    field: "i_tor_type3",
    label: "วิธีเฉพาะเจาะจง เกิน 5 แสน",
  },
  {
    field: "i_tor_type4",
    label: "วิธีเฉพาะเจาะจง ไม่เกิน 5 แสน",
  },
  {
    field: "i_tor_type5",
    label: "E-Market",
  },
  {
    field: "i_tor_type6",
    label: "รวม",
  },
];

// Generate 40 names
const random = Date.now();
var array = JSON.parse(dateJson);

var array2 = JSON.parse(dateJson2);

var array3 = JSON.parse(dateJson3);

var names = array.data.map((item) => item.c_name);

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
const methods = ["i_tor_type1", "i_tor_type2", "i_tor_type3", "i_tor_type4"];
const methodNames = ["วิธีประกวดราคาอิเล็กทรอนิกส์ (E-Bidding)", "วิธีคัดเลือก", "วิธีเฉพาะเจาะจง ไม่เกิน 5 แสน", "วิธีเฉพาะเจาะจง เกิน 5 แสน"];
const key = ["e-Bidding", "select", "Less_specific", "More_specific"];
const methodStart = [8, 9, 10, 11, 12, 13, 15];
const chartDataByMethod = [];
methods.forEach((key, idx) => {
  const pieData = array3.data.map((item) => ({
    value: item[key],
    name: item.c_name, // เช่น “รอดำเนินการ”
    method: key, // เพิ่มไว้เพื่อใช้งานตอนคลิก
    sp_status_report_id: item.sp_status_report_id,
  }));

  chartDataByMethod.push({
    name: methodNames[idx],
    type: "pie",
    radius: "20%",
    center: [
      25 + (idx % 2) * 50 + "%", // 2 คอลัมน์
      idx < 2 ? "30%" : "75%",
    ],
    label: {
      show: true,
      position: "outside", // แสดง label ด้านนอก
      formatter: "{b}\n({d}%)",
    },
    data: pieData,
  });
});

var year_th = array.year_th;

var tableBodyStart = document.getElementById("data-table-body-Start");
document.getElementById("sum1.1").innerText = i_product_type_start[1];
document.getElementById("sum2.1").innerText = i_product_type_start[2];
document.getElementById("sum3.1").innerText = i_product_type_start[3];
document.getElementById("sum4.1").innerText = i_product_type_start[4];
document.getElementById("sum5.1").innerText = i_product_type_start[5];
document.getElementById("sum6.1").innerText = i_product_type_start[6];
document.getElementById("sum7.1").innerText = i_product_type_start[7];
document.getElementById("sum8.1").innerText = i_product_type_start[8];

var tableBodyTorType = document.getElementById("data-table-TorType");
document.getElementById("sum1.1.1").innerText = i_tor_type[1];
document.getElementById("sum2.1.1").innerText = i_tor_type[2];
document.getElementById("sum3.1.1").innerText = i_tor_type[3];
document.getElementById("sum4.1.1").innerText = i_tor_type[4];
document.getElementById("sum5.1.1").innerText = i_tor_type[5];
document.getElementById("sum6.1.1").innerText = i_tor_type[6];

document.getElementById("budget_year_filter").addEventListener("change", function () {
  var yearTh = this.value;
  var yearEn = this.options[this.selectedIndex].getAttribute("data-year-en");

  // ส่งไปหน้าเดียวกันพร้อม 2 พารามิเตอร์
  var url = window.location.pathname + "?year_th=" + yearTh + "&year_en=" + yearEn + "&_rand=" + random;
  window.location.href = url;
});

array2.data.forEach(function (item) {
  var row = "<tr>";
  row += "<td>" + item.no + "</td>";
  row += "<td>" + item.c_name + "</td>";
  types.forEach(function (tp) {
    var val = item[tp.field] || 0;
    // เพิ่ม <a> ครอบตัวเลข
    row += `<td><p href="#" onclick="openDetail('${0}','${tp.field}','${val}','${item.sp_status_report_id}','')">${val}</p></td>`;
  });
  row += "</tr>";
  tableBodyStart.innerHTML += row;
});
array3.data.forEach(function (item) {
  var row = "<tr>";
  row += "<td>" + item.no + "</td>";
  row += "<td>" + item.c_name + "</td>";
  // console.log(item);
  tor_types.forEach(function (tp) {
    var val = item[tp.field] || 0;
    row += `<td><p href="#" onclick="openDetail('${9999999}','${"i_product_type"}','${val}','${item.sp_status_report_id}','${tp.field}')">${val}</p></td>`;
  });
  row += "</tr>";
  tableBodyTorType.innerHTML += row;
});
const pieData = [
  {
    value: i_product_type[1],
    name: "ครุภัณฑ์",
    field: "i_product_type1",
    itemStyle: {
      // decal: {
      //         symbol: 'rect',
      //         color: '#000',
      //         backgroundColor: '#5B9BD5',
      //         dashArrayX: [6, 0],
      //         dashArrayY: [6, 6],
      //         rotation: 0
      // }
    },
  },
  {
    value: i_product_type[2],
    name: "วัสดุ",
    field: "i_product_type2",
    itemStyle: {
      // decal: {
      //         symbol: 'circle',
      //         dashArrayX: [1, 2],
      //         dashArrayY: [2, 1],
      //         rotation: 0
      // }
    },
  },
  {
    value: i_product_type[3],
    name: "งานจ้าง",
    field: "i_product_type3",
    itemStyle: {
      // decal: {
      //         symbol: 'rect',
      //         dashArrayX: [4, 2],
      //         dashArrayY: [2, 4],
      //         rotation: 0
      // }
    },
  },
  {
    value: i_product_type[4],
    name: "งานเช่า",
    field: "i_product_type4",
    itemStyle: {
      // decal: {
      //         symbol: 'cross',
      //         dashArrayX: [1, 0],
      //         dashArrayY: [1, 0],
      //         rotation: 0
      // }
    },
  },
  {
    value: i_product_type[5],
    name: "โครงการต่อเนื่อง",
    field: "i_product_type5",
    itemStyle: {
      // decal: {
      //         symbol: 'triangle',
      //         dashArrayX: [2, 2],
      //         dashArrayY: [2, 2],
      //         rotation: 0
      // }
    },
  },
  {
    value: i_product_type[6],
    name: "สัญญาจะซื้อจะขาย",
    field: "i_product_type6",
    // decal: {
    //         symbol: 'dot',
    //         dashArrayX: [1, 2],
    //         dashArrayY: [1, 2],
    //         rotation: 0
    // }
  },
  {
    value: i_product_type[7],
    name: "งานก่อสร้าง",
    field: "i_product_type7",
    // decal: {
    //         symbol: 'diamond',
    //         dashArrayX: [4, 2],
    //         dashArrayY: [2, 4],
    //         rotation: 0
    // }
  },
];
const pieDataStart = array2.data.map((item) => ({
  value: item.i_product_type8,
  name: item.c_name, // ชื่อสถานะ เช่น "รอดำเนินการ"
  field: "i_product_type8", // field สำหรับระบุเวลาคลิก
  method: methodStart[item], // เพิ่มไว้เพื่อใช้งานตอนคลิก
  sp_status_report_id: item.sp_status_report_id, // << เพิ่มตรงนี้
}));

const statusPieData = [
  {
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

var colors = ["#f4eda5", "#f8cf6a", "#cce5da", "#4cae4c", "#aaccee", "#1d65a6", "#FA8072", "#E91E63"];
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

const option = {
  legend: {},
  tooltip: {},
  dataset: {
    source: [
      ["product", "ตุลาคม", "พฤศจิกายน", "ธันวาคม", "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน"],
      ["2565", 377, 418, 504, 569, 695, 874, 874, 978, 1056, 1137, 1144, 1144],
      ["2566", 243, 325, 389, 499, 564, 649, 741, 776, 809, 809, 858, 940],
      ["2567", 302, 356, 404, 463, 650, 702, 722, 775, 804, 835, 850, 894],
      ["2568", 392, 520, 596, 633, 700, 758, 820, 878, 972, 1010, 1035, 1037],
    ],
  },
  grid: [
    {
      top: "25%",
      bottom: "15%",
    },
  ],
  xAxis: {
    type: "category",
    gridIndex: 0,
  },
  yAxis: {
    gridIndex: 0,
  },
  label: {
      show: true,               // ✅ เปิด label
      position: "top",          // แสดงเหนือจุด
      // formatter: function (p) {
      //   return p.value != null ? p.value.toFixed(2) : "";
      // },
      fontSize: 12,
      color: "#000"
    },
  series: [
    // {
    //   type: "pie",
    //   id: "pied",
    //   radius: "30%",
    //   center: ["50%", "25%"],
    //   label: {
    //     formatter: "{b}: {c} ({d}%)",
    //   },
    //   encode: {
    //     itemName: "product",
    //     value: "2022",
    //   },
    // },
    
    {
      type: "line",
      smooth: true,
      seriesLayoutBy: "row",
    },
    {
      type: "line",
      smooth: true,
      seriesLayoutBy: "row",
    },
    {
      type: "line",
      smooth: true,
      seriesLayoutBy: "row",
    },
    {
      type: "line",
      smooth: true,
      seriesLayoutBy: "row",
    },
  ],
};
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
    // decal: patterns[index % patterns.length], // << เพิ่มบรรทัดนี้!
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

if (tableBodyStart) {
  tableBodyStart.innerHTML = ""; // เคลียร์ก่อนวนลูป
  array2.data.forEach(function (item) {
    var row = "<tr>";
    row += "<td>" + item.no + "</td>";
    row += "<td>" + item.c_name + "</td>";
    types.forEach(function (tp) {
      var val = item[tp.field] || 0;
      // เพิ่มลิงก์

      row += `<td><p href="#" onclick="openDetail('${9999999}','${tp.field}','${val}','${item.sp_status_report_id}','${0}')">${val} </p></td>`;
    });
    row += "</tr>";
    tableBodyStart.innerHTML += row;
  });
} else {
  console.error('ไม่พบ <tbody id="data-table-body"> ใน HTML');
}

// Pie Chart
var pieChart = echarts.init(document.getElementById("pie"));
var pieOption = {
  title: {
    text: "Pie Chart" + " ปริมาณงานปี " + year_th,
    left: "10%",
    // left: 'center'
  },
  tooltip: {
    trigger: "item",
    // formatter: '{b}: {c} ({d}%)'  emphasis
  },
  legend: {
    bottom: "5%",
    left: "center",
  },
  toolbox: {
    show: true,
    feature: {
      saveAsImage: { show: true },
      restore: { show: true },
      // dataView: { show: true, readOnly: false },
      mark: { show: true },
    },
  },
  color: colors,
  series: [
    {
      // name: 'Categories',
      type: "pie",
      radius: ["40%", "70%"], // จากเดิม ['40%', '60%']
      // radius: '65%',
      avoidLabelOverlap: false,
      label: {
        show: true,
        // formatter: '{b}: {d}%',
        formatter: "{b}\n ({d}%)",
        color: "#333",
        fontSize: 14,
      },
      data: pieData,
      emphasis: {
        label: {
          show: true,
          fontSize: 40,
          fontWeight: "bold",
        },
      },
      labelLine: {
        show: false,
      },
    },
  ],
};
pieChart.setOption(pieOption);

var pieChartStart = echarts.init(document.getElementById("pie_start"));

var pieOptionStart = {
  title: {
    text: "Pie Chart" + " สถานะการดำเนินงาน " + year_th,
    // left: 'center'
    left: "5%",
  },
  tooltip: {
    trigger: "item",
    formatter: "{b}: {c} ({d}%)",
  },
  legend: {
    top: "96%", // เดิมอาจเป็น 3% หรือ center ลองเลื่อนลง
    left: "center",
  },
  color: colors,
  series: [
    {
      name: "Categories",
      type: "pie",
      radius: ["40%", "70%"], // จากเดิม ['40%', '60%']
      label: {
        show: true,
        position: "outside", // แสดง label ด้านนอก
        formatter: "{b}: {d}%",
        color: "#333",
        fontSize: 14,
      },
      data: pieDataStart,
      emphasis: {
        label: {
          show: true,
          fontSize: 40,
          fontWeight: "bold",
        },
      },
      labelLine: {
        show: false,
      },
    },
  ],
};
pieChartStart.setOption(pieOptionStart);
// Bar Chart
var barChart = echarts.init(document.getElementById("main"));
var barOption = {
  title: {
    text: "Bar Chart" + " ปริมาณงานปี " + year_th,
    // left: 'center'
    left: "10%",
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
  toolbox: {
    show: true,
    feature: {
      mark: {
        show: true,
      },
      dataView: {
        show: true,
        readOnly: true,
        optionToContent: function () {
          let table = `
    <table border="1" style="width:100%;border-collapse:collapse;text-align:center;font-family:'Tahoma';font-size:14px;">
      <thead>
        <tr>
          <th style="background:#3f51b5;color:white;padding:6px;">ชื่อพนักงาน</th>`;

          // เพิ่มหัวตารางจาก types
          types.forEach((tp) => {
            table += `<th style="background:#3f51b5;color:white;padding:6px;">${tp.label}</th>`;
          });

          table += `</tr></thead><tbody>`;

          // เตรียม object เก็บยอดรวม
          const sums = {};
          types.forEach((tp) => {
            sums[tp.field] = 0;
          });

          // สร้างแถวข้อมูล
          array.data.forEach((item, rowIndex) => {
            table += `<tr><td style="text-align:left;padding:6px;">${item.c_name}</td>`;

            types.forEach((tp, colIndex) => {
              const val = item[tp.field] || 0;
              sums[tp.field] += val;
              console.log(tp.label);
              console.log(rowIndex);
              table += `
        <td style="padding:6px;">
          <p href="#"
            onclick="openDetail('${item.sp_emp_id}', '${tp.field}', '${val}','${0}','${0}','${1}', '${rowIndex}', '${tp.label}')"
             style="text-decoration:none; color:blue;">
            ${val}
          </p>
        </td>`;
            });

            table += `</tr>`;
          });

          // แถวรวม
          table += `
    <tr style="font-weight:bold; background-color: #f9f9f9;">
      <td style="text-align:center;">รวม</td>`;

          types.forEach((tp, index) => {
            const sum = sums[tp.field];
            console.log(tp.label);
            table += `<td id="sum${index + 1}"
                onclick="openDetail('9999999', '${tp.field}', '${sum}', '0', '0', '${tp.label}')"
                style="cursor:pointer; color:blue;">
                ${sum}
              </td>`;
          });

          table += `</tr></tbody></table>`;
          return table;
        },
      },
      magicType: {
        show: true,
        type: ["line", "bar", "stack", "tiled"],
      },
      restore: {
        show: true,
      },
      saveAsImage: {
        show: true,
      },
    },
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
  openDetail(empId, field, value, 0, 0, 0);
});

pieChart.on("click", function (params) {
  console.log("Pie clicked:", params);
  // alert('คุณคลิกที่: ' + params.name + '\\nเปอร์เซ็นต์: ' + params.percent + '%');
  const empId = "9999999"; // Pie Chart เป็นรวม
  const field = params.data.field || "i_product_type"; // field มาจาก pieData
  const value = params.value || 0;
  if (value > 0) {
    openDetail(empId, field, value, 0, 0, 0);
  }
});
pieChartStart.on("click", function (params) {
  console.log("Pie clicked:", params);
  // alert('คุณคลิกที่: ' + params.name + '\\nเปอร์เซ็นต์: ' + params.percent + '%');
  const empId = "9999999"; // Pie Chart เป็นรวม
  const field = "i_product_type"; // field มาจาก pieData
  const value = params.value || 0;
  var method = params.data.method || 0;
  var sp_status_report_id = params.data.sp_status_report_id || 0;
  console.log(params);
  if (value > 0) {
    openDetail(empId, field, value, sp_status_report_id, method, 0, 0);
  }
});
var myChart = echarts.init(document.getElementById("pie_year"));

myChart.setOption(option); // ใส่ option ปกติ

const optionTorType = {
  legend: {},
  tooltip: {},
  color: colors,
  title: {
    text: "ตารางสรุปข้อมูลสถานะการดำเนินงาน แต่ละวิธีการดำเนินงาน",
    left: "center",
    top: 10,
    textStyle: {
      fontSize: 20,
      fontWeight: "bold",
    },
  },
  legend: {
    top: 50, // ขยับ legend ลงจาก title
    left: "center",
  },
  series: chartDataByMethod,
};
var myChartTorType = echarts.init(document.getElementById("pie_tor_type"), "light");
myChartTorType.setOption(optionTorType); // ใส่ option ปกติ

myChartTorType.on("click", function (params) {
  console.log(params);
  // alert('คุณคลิกที่: ' + params.name + '\\nเปอร์เซ็นต์: ' + params.percent + '%');
  const empId = "9999999"; // Pie Chart เป็นรวม
  const field = params.data.field || "i_product_type"; // field มาจาก pieData
  const value = params.value || 0;
  const seriesName = params.data.method; // หรือดึงจาก dataset ก็ได้ เช่น params.data.sp_status_report_id
  const sp_status_report_id = params.data.sp_status_report_id; // หรือดึงจาก dataset ก็ได้ เช่น params.data.sp_status_report_id
  if (value > 0) {
    openDetail(empId, field, value, sp_status_report_id, seriesName, 0);
  }
});
myChartBarBg.on("click", function (params) {
  const catName = params.name;
  const value = params.data.bg_expense_id;
  const budget_type_id = params.data.budget_type_id;
  const f_amt = params.data.value;
  var yearTh = year_th; // ดึงจาก global JS variable
  var yearEn = yearTh - 543;
  // if (!catName) return;
  // const url = `Rep_DetailByType.php?name=${encodeURIComponent(catName)}&year_th=${year_th}`;
  // window.open(url, "_blank");
  if (value > 0) {
    var url = `Rep_DetailByTypeV4.php?year_th=${yearTh}&year_en=${yearEn}&i_enabled=1&bg_expense_id=${value}&type_report_row=${budget_type_id}&sp_emp_id=0&d_date_start=0&d_date_start=0&f_amt=${f_amt}&_rand=${random}`;

    window.open(url, "_blank");
  }
});

function openDetail(empId, type, value, start, chart, i_enabled, rowIndex, colIndex) {
  if (value == 0) return;
  var yearTh = year_th; // ดึงจาก global JS variable
  var yearEn = yearTh - 543;
  i_enabled == 1 ? 1 : 0;
  // console.log("rowIndex:", rowIndex);
  // console.log("colIndex:", colIndex);

  var url = `Rep_DetailByType.php?sp_emp_id=${empId}&type=${type}&start=${start}&chart=${chart}&year_th=${yearTh}&year_en=${yearEn}&i_enabled=${i_enabled}&_rand=${random}`;

  window.open(url, "_blank");
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDark ? "on" : "off");
}

window.addEventListener("load", function () {
  const scrollY = localStorage.getItem("lastScrollY");
  if (scrollY) {
    window.scrollTo(0, parseInt(scrollY));
    localStorage.removeItem("lastScrollY"); // เคลียร์ค่าหลังใช้
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
