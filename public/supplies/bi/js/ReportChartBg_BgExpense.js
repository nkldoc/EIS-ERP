/* global echarts, dateJson4, YEAR_TH */

// ====== ตัวแปรและเตรียม DOM ======
var barDom = document.getElementById("bar_bg");
var myChartBarBg = echarts.init(barDom);
var array4 = JSON.parse(dateJson4); // { data: [...] }
var randomKey = Date.now();

// ====== สร้าง multi-select จากข้อมูล ======
$(document).ready(function () {
  $("#multiCheckCombo").selectpicker();
  buildSelectOptions();
  buildChartFromRaw();
});

function buildSelectOptions() {
  const $select = $("#multiCheckCombo");
  $select.empty();
  const seen = new Set();

  array4.data.forEach((item) => {
    const name = item.c_name;
    const id = item.bg_expense_id;
    if (!seen.has(id)) {
      seen.add(id);
      const option = new Option(name, id, false, false);
      option.setAttribute("title", name);
      option.setAttribute("data-content", `<span title="${name}">${name}</span>`);
      $select.append(option);
    }
  });
  $select.selectpicker("refresh");
}

// ====== ปุ่มปีงบ (รีโหลดหน้าเดิมพร้อมพารามิเตอร์) ======
document.getElementById("budget_year_filter").addEventListener("change", function () {
  var yearTh = this.value;
  var yearEn = this.options[this.selectedIndex].getAttribute("data-year-en");
  var url = window.location.pathname + "?year_th=" + yearTh + "&year_en=" + yearEn + "&_rand=" + randomKey;
  window.location.href = url;
});

// ====== สร้างข้อมูลกราฟ (รวม/กรอง) ======
function groupForChart(sourceRows) {
  const grouped = {};
  sourceRows.forEach((item) => {
    const name = item.c_name;
    if (!grouped[name]) {
      grouped[name] = {
        bg_expense_id: item.bg_expense_id,
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
    // สะสมค่า (กัน null)
    const g = grouped[name];
    g.f_reserve_budget += +item.f_reserve_budget || 0;
    g.f_reserve_budget_income += +item.f_reserve_budget_income || 0;
    g.f_reserve_budget_income_Finish += +item.f_reserve_budget_income_Finish || 0;
    g.f_plan_begin_remaining += +item.f_plan_begin_remaining || 0;

    g.f_reserve_period_bkb += +item.f_reserve_period_bkb || 0;
    g.f_reserve_periodincome_bkb += +item.f_reserve_periodincome_bkb || 0;
    g.f_reserve_periodfinish_bkb += +item.f_reserve_periodfinish_bkb || 0;
    g.f_period_transfer_remaining_bkb += +item.f_period_transfer_remaining_bkb || 0;

    g.f_reserve_period_government += +item.f_reserve_period_government || 0;
    g.f_reserve_periodincome_government += +item.f_reserve_periodincome_government || 0;
    g.f_reserve_periodfinish_government += +item.f_reserve_periodfinish_government || 0;
    g.f_period_transfer_remaining_government += +item.f_period_transfer_remaining_government || 0;
  });

  const chartData = {
    names: [],
    bg_expense_id: [],
    // รายได้
    f_reserve_budget: [],
    f_reserve_budget_income: [],
    f_reserve_budget_income_Finish: [],
    f_plan_begin_remaining: [],
    // กทม.
    f_reserve_period_bkb: [],
    f_reserve_periodincome_bkb: [],
    f_reserve_periodfinish_bkb: [],
    f_period_transfer_remaining_bkb: [],
    // รัฐบาล
    f_reserve_period_government: [],
    f_reserve_periodincome_government: [],
    f_reserve_periodfinish_government: [],
    f_period_transfer_remaining_government: [],
  };

  for (const name in grouped) {
    const g = grouped[name];
    const values = [g.f_reserve_budget, g.f_plan_begin_remaining, g.f_reserve_period_bkb, g.f_period_transfer_remaining_bkb, g.f_reserve_period_government, g.f_period_transfer_remaining_government];
    const total = values.reduce((s, v) => s + (+v || 0), 0);
    if (total <= 0) continue;

    chartData.names.push(name);
    chartData.bg_expense_id.push(g.bg_expense_id);

    chartData.f_reserve_budget.push({ value: +g.f_reserve_budget, bg_expense_id: g.bg_expense_id, budget_type_id: "f_reserve_budget" });
    chartData.f_reserve_budget_income.push({ value: +g.f_reserve_budget_income, bg_expense_id: g.bg_expense_id, budget_type_id: "f_reserve_budget_income" });
    chartData.f_reserve_budget_income_Finish.push({ value: +g.f_reserve_budget_income_Finish, bg_expense_id: g.bg_expense_id, budget_type_id: "f_reserve_budget_income_Finish" });
    chartData.f_plan_begin_remaining.push({ value: +g.f_plan_begin_remaining, bg_expense_id: g.bg_expense_id, budget_type_id: "f_plan_begin_remaining" });

    chartData.f_reserve_period_bkb.push({ value: +g.f_reserve_period_bkb, bg_expense_id: g.bg_expense_id, budget_type_id: "f_reserve_period_bkb" });
    chartData.f_reserve_periodincome_bkb.push({ value: +g.f_reserve_periodincome_bkb, bg_expense_id: g.bg_expense_id, budget_type_id: "f_reserve_periodincome_bkb" });
    chartData.f_reserve_periodfinish_bkb.push({ value: +g.f_reserve_periodfinish_bkb, bg_expense_id: g.bg_expense_id, budget_type_id: "f_reserve_periodfinish_bkb" });
    chartData.f_period_transfer_remaining_bkb.push({ value: +g.f_period_transfer_remaining_bkb, bg_expense_id: g.bg_expense_id, budget_type_id: "f_period_transfer_remaining_bkb" });

    chartData.f_reserve_period_government.push({ value: +g.f_reserve_period_government, bg_expense_id: g.bg_expense_id, budget_type_id: "f_reserve_period_government" });
    chartData.f_reserve_periodincome_government.push({ value: +g.f_reserve_periodincome_government, bg_expense_id: g.bg_expense_id, budget_type_id: "f_reserve_periodincome_government" });
    chartData.f_reserve_periodfinish_government.push({ value: +g.f_reserve_periodfinish_government, bg_expense_id: g.bg_expense_id, budget_type_id: "f_reserve_periodfinish_government" });
    chartData.f_period_transfer_remaining_government.push({
      value: +g.f_period_transfer_remaining_government,
      bg_expense_id: g.bg_expense_id,
      budget_type_id: "f_period_transfer_remaining_government",
    });
  }
  return chartData;
}

// ====== เรนเดอร์กราฟหลัก ======
function buildChartFromRaw() {
  myChartBarBg.showLoading();
  const chartData = groupForChart(array4.data);
  myChartBarBg.hideLoading();
  renderOption(chartData);
}

function updateChartFromSelected() {
  const selectedIds = ($("#multiCheckCombo").val() || []).map(String);
  const filtered = selectedIds.length ? array4.data.filter((r) => selectedIds.includes(String(r.bg_expense_id))) : array4.data;

  const chartData = groupForChart(filtered);
  renderOption(chartData, true);
}
$("#multiCheckCombo").on("changed.bs.select hide.bs.select", updateChartFromSelected);

function renderOption(chartData, isUpdate) {
  const isDark = document.body.classList.contains("dark-mode");

  const optionBg = {
    title: {
      text: "ข้อมูลการเบิกจ่ายตามหมวดหมู่",
      left: "left",
      top: 0,
      textStyle: { color: isDark ? "#e6e6e6" : "#333", fontSize: 16, fontWeight: "bold" },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      formatter: function (params) {
        const name = params[0].name;
        let out = `<strong>${name}</strong><br/>`;
        let used = 0,
          remain = 0,
          usedBkk = 0,
          remainBkk = 0,
          usedGov = 0,
          remainGov = 0;
        params.forEach((p) => {
          const val = (typeof p.value === "object" ? p.value.value : p.value) || 0;
          out += `${p.marker} ${p.seriesName}: ${val.toLocaleString()} บาท<br/>`;
          if (/ที่ใช้ไป2|ตรวจรับแล้ว|เบิกแล้ว/.test(p.seriesName) && /รายได้/.test(p.seriesName)) used += val;
          else if (/คงเหลือ/.test(p.seriesName) && /รายได้/.test(p.seriesName)) remain += val;
          else if (/ที่ใช้ไป|ตรวจรับแล้ว|เบิกแล้ว/.test(p.seriesName) && /กทม/.test(p.seriesName)) usedBkk += val;
          else if (/คงเหลือ/.test(p.seriesName) && /กทม/.test(p.seriesName)) remainBkk += val;
          else if (/ที่ใช้ไป|ตรวจรับแล้ว|เบิกแล้ว/.test(p.seriesName) && /รัฐบาล/.test(p.seriesName)) usedGov += val;
          else if (/คงเหลือ/.test(p.seriesName) && /รัฐบาล/.test(p.seriesName)) remainGov += val;
        });
        out += `<br/><strong>รวมรายได้: ${(used + remain).toLocaleString()} บาท</strong>`;
        out += `<br/><strong>รวมกทม.: ${(usedBkk + remainBkk).toLocaleString()} บาท</strong>`;
        out += `<br/><strong>รวมงบรัฐบาล: ${(usedGov + remainGov).toLocaleString()} บาท</strong>`;
        return out;
      },
    },
    legend: [
      { data: ["ที่ใช้ไป เงินรายได้", "ตรวจรับแล้ว เงินรายได้", "เบิกแล้ว เงินรายได้", "คงเหลือ เงินรายได้"], top: "5%", left: "30%" },
      { data: ["ที่ใช้ไป อุดหนุนกทม.", "ตรวจรับแล้ว อุดหนุนกทม.", "เบิกแล้ว อุดหนุนกทม.", "คงเหลือ อุดหนุนกทม."], top: "10%", left: "30%" },
      { data: ["ที่ใช้ไป อุดหนุนรัฐบาล", "ตรวจรับแล้ว อุดหนุนรัฐบาล", "เบิกแล้ว อุดหนุนรัฐบาล", "คงเหลือ อุดหนุนรัฐบาล"], top: "15%", left: "30%" },
    ],
    grid: { top: "23%", left: "3%", right: "4%", containLabel: true },
    xAxis: [
      {
        type: "category",
        data: chartData.names,
        axisLabel: {
          color: isDark ? "#cbd5e1" : "#333",
          interval: 0,
          rotate: 45,
          formatter: (v) => (v.length > 30 ? v.slice(0, 30) + "..." : v),
        },
        axisLine: { lineStyle: { color: isDark ? "#64748b" : "#999" } },
      },
    ],
    yAxis: [
      {
        type: "value",
        name: "Budget (บาท)",
        axisLabel: { color: isDark ? "#cbd5e1" : "#333", formatter: (v) => v.toLocaleString() },
        splitLine: { lineStyle: { color: isDark ? "#1f2937" : "#eee" } },
      },
    ],
    toolbox: {
      show: true,
      feature: {
        dataView: {
          show: true,
          readOnly: true,
          optionToContent: function (opt) {
            const axisData = opt.xAxis?.[0]?.data || [];
            const series = opt.series;
            let html = `
              <table border="1" style="width:100%;border-collapse:collapse;text-align:center;font-family:'Tahoma';font-size:14px;">
              <thead><tr>
                <th style="text-align:left;padding:8px;background:#3f51b5;color:white;">หมวดหมู่</th>`;
            for (let i = 0; i < series.length; i++) {
              html += `<th style="padding:8px;background:#3f51b5;color:white;">${series[i].name}</th>`;
            }
            html += `</tr></thead><tbody>`;
            for (let r = 0; r < axisData.length; r++) {
              const label = axisData[r];
              html += `<tr><td style="text-align:left;padding:6px;">${label}</td>`;
              for (let c = 0; c < series.length; c++) {
                const cell = series[c].data[r];
                const val = typeof cell === "object" ? cell?.value || 0 : cell || 0;
                html += `<td style="padding:6px; text-align:right;">${val ? echarts.format.addCommas(val) : "-"}</td>`;
              }
              html += `</tr>`;
            }
            html += `</tbody></table>`;
            return html;
          },
        },
        magicType: { show: true, type: ["line", "bar", "stack", "tiled"] },
        restore: { show: true },
        saveAsImage: { show: true },
      },
    },
    dataZoom: [
      { type: "slider", show: true, xAxisIndex: 0, start: 0, end: 100 },
      { type: "inside", xAxisIndex: 0, start: 0, end: 100 },
    ],
    // itemStyle: {
    color: "#1E88E5",
    borderColor: "#000000", // หรือ '#ccc'
    opacity: 1, //   ทึบเพื่ออยู่ด้านหน้า f_reserve_budget
    // },
    series: [
      {
        name: "ที่ใช้ไป เงินรายได้",
        type: "bar",
        stack: "bg",
        barWidth: 40,
        data: chartData.f_reserve_budget,
        itemStyle: {
          color: "#1E88E5",
          borderColor: "#000000", // หรือ '#ccc'
          opacity: 1, //   ทึบเพื่ออยู่ด้านหน้า f_reserve_budget
        },
      },
      {
        name: "ตรวจรับแล้ว เงินรายได้",
        type: "bar",
        stack: "bg",
        barWidth: 40,
        data: chartData.f_reserve_budget_income,
        itemStyle: {
          color: "#42A5F5",
          borderColor: "#000000", // หรือ '#ccc'
          opacity: 1,
        },
      },
      {
        name: "เบิกแล้ว เงินรายได้",
        type: "bar",
        stack: "bg",
        barWidth: 40,
        data: chartData.f_reserve_budget_income_Finish,
        itemStyle: {
          color: "#90CAF9",
          borderColor: "#000000", // หรือ '#ccc'
          opacity: 1,
        },
      },
      {
        name: "คงเหลือ เงินรายได้",
        type: "bar",
        stack: "bg",
        barWidth: 40,
        data: chartData.f_plan_begin_remaining,
        itemStyle: {
          color: "#E3F2FD",
          borderColor: "#000000", // หรือ '#ccc'
          opacity: 1,
        },
      },

      {
        name: "ที่ใช้ไป อุดหนุนกทม.",
        type: "bar",
        stack: "bg_bkb",
        barWidth: 40,
        data: chartData.f_reserve_period_bkb,
        itemStyle: {
          color: "#228B22",
          borderColor: "#000000", // หรือ '#ccc'
          opacity: 1,
        },
      },
      {
        name: "ตรวจรับแล้ว อุดหนุนกทม.",
        type: "bar",
        stack: "bg_bkb",
        barWidth: 40,
        data: chartData.f_reserve_periodincome_bkb,
        itemStyle: {
          color: "#2e8b57",
          borderColor: "#000000", // หรือ '#ccc'
          opacity: 1,
        },
      },
      {
        name: "เบิกแล้ว อุดหนุนกทม.",
        type: "bar",
        stack: "bg_bkb",
        barWidth: 40,
        data: chartData.f_reserve_periodfinish_bkb,
        itemStyle: {
          color: "#32CD32",
          borderColor: "#000000", // หรือ '#ccc'
          opacity: 1,
        },
      },
      {
        name: "คงเหลือ อุดหนุนกทม.",
        type: "bar",
        stack: "bg_bkb",
        barWidth: 40,
        data: chartData.f_period_transfer_remaining_bkb,
        itemStyle: {
          color: "#98FB98",
          borderColor: "#000000", // หรือ '#ccc'
          opacity: 1,
        },
      },

      {
        name: "ที่ใช้ไป อุดหนุนรัฐบาล",
        type: "bar",
        stack: "bg_government",
        barWidth: 40,
        data: chartData.f_reserve_period_government,
        itemStyle: {
          color: "#FF8C00",
          borderColor: "#000000", // หรือ '#ccc'
          opacity: 1,
        },
      },
      {
        name: "ตรวจรับแล้ว อุดหนุนรัฐบาล",
        type: "bar",
        stack: "bg_government",
        barWidth: 40,
        data: chartData.f_reserve_periodincome_government,
        itemStyle: {
          color: "#FFA500",
          borderColor: "#000000", // หรือ '#ccc'
          opacity: 1,
        },
      },
      {
        name: "เบิกแล้ว อุดหนุนรัฐบาล",
        type: "bar",
        stack: "bg_government",
        barWidth: 40,
        data: chartData.f_reserve_periodfinish_government,
        itemStyle: {
          color: "#FFB347",
          borderColor: "#000000", // หรือ '#ccc'
          opacity: 1,
        },
      },
      {
        name: "คงเหลือ อุดหนุนรัฐบาล",
        type: "bar",
        stack: "bg_government",
        barWidth: 40,
        data: chartData.f_period_transfer_remaining_government,
        itemStyle: {
          color: "#FFD700",
          borderColor: "#000000", // หรือ '#ccc'
          opacity: 1,
        },
      },
    ],
  };

  if (isUpdate) {
    myChartBarBg.setOption(
      {
        xAxis: [{ data: chartData.names }],
        series: optionBg.series,
      },
      true
    );
  } else {
    myChartBarBg.setOption(optionBg, true);
  }
}

// ====== คลิกแท่งกราฟ -> เปิดรายละเอียด ======
myChartBarBg.on("click", function (p) {
  const catName = p.name;
  const obj = typeof p.data === "object" ? p.data : { value: p.value, bg_expense_id: null, budget_type_id: null };
  const value = obj.bg_expense_id;
  const budget_type_id = obj.budget_type_id;
  const f_amt = obj.value || 0;

  const yearTh = YEAR_TH;
  const yearEn = yearTh - 543;

  if (value) {
    const url = `Rep_DetailByTypeV4.php?year_th=${yearTh}&year_en=${yearEn}&i_enabled=1&bg_expense_id=${value}&type_report_row=${budget_type_id}&sp_emp_id=0&d_date_start=0&d_date_start=0&f_amt=${f_amt}&_rand=${randomKey}`;
    window.open(url, "_blank");
  }
});

// ====== ปุ่มใช้ตัวกรอง ======
function reloadData() {
  // ที่หน้า UI จะเลือกปีได้ แต่ข้อมูลในไฟล์นี้ถูกส่งมาพร้อมหน้าแล้ว
  // ถ้าต้องการกรองเฉพาะ “ครุภัณฑ์” เป็นต้น ให้คุณปรับโค้ดนี้ต่อได้ตามต้องการ
  updateChartFromSelected();
}

// ====== ส่งออก Excel จาก DataView ของ Toolbox ======
function exportTableToExcel() {
  var table = document.querySelector("#bar_bg div table");
  if (!table) {
    alert("ไม่พบตาราง");
    return;
  }
  var wb = XLSX.utils.book_new();
  var ws = XLSX.utils.table_to_sheet(table);
  XLSX.utils.book_append_sheet(wb, ws, "Report Data");
  XLSX.writeFile(wb, "report_data.xlsx");
}

// ====== ให้หน้าเรียกใหม่ตอนสลับ Dark Mode ======
window.rebuildBgChart = function () {
  if (!myChartBarBg) return;
  const opt = myChartBarBg.getOption();
  myChartBarBg.dispose();
  myChartBarBg = echarts.init(barDom);
  renderOption({
    names: opt.xAxis[0].data,
    // series data เราจะใช้จาก opt.series เดิม
    // เพื่อความง่ายเรียก buildChartFromRaw ใหม่
  });
  buildChartFromRaw();
};
