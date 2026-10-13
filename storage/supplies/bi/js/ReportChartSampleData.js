// sampleData.js
const dateJson4 = JSON.stringify({
  data: [
    {
      c_name: "ครุภัณฑ์",
      bg_expense_id: 1,
      f_reserve_budget: 300000,
      f_plan_begin_remaining: 20000,
      f_reserve_period_bkb: 100000,
      f_period_transfer_remaining_bkb: 5000,
      f_reserve_period_government: 200000,
      f_period_transfer_remaining_government: 10000,
    },
    {
      c_name: "วัสดุ",
      bg_expense_id: 2,
      f_reserve_budget: 100000,
      f_plan_begin_remaining: 50000,
      f_reserve_period_bkb: 40000,
      f_period_transfer_remaining_bkb: 10000,
      f_reserve_period_government: 30000,
      f_period_transfer_remaining_government: 5000,
    },
    {
      c_name: "งานจ้าง",
      bg_expense_id: 3,
      f_reserve_budget: 200000,
      f_plan_begin_remaining: 10000,
      f_reserve_period_bkb: 150000,
      f_period_transfer_remaining_bkb: 50000,
      f_reserve_period_government: 120000,
      f_period_transfer_remaining_government: 8000,
    },
  ],
});
const YEAR_TH = 2568;

/* global echarts, XLSX, YEAR_TH, __BUDGET_DATA__ */

(function () {
  const state = {
    raw: __BUDGET_DATA__.data || [],
    yearTh: __BUDGET_DATA__.year_th || YEAR_TH || new Date().getFullYear() + 543,
  };

  const el = {
    bar: document.getElementById("echart_bar"),
    donut: document.getElementById("echart_donut"),
    tbl: document.getElementById("data_table"),
    year: document.getElementById("yearSelect"),
    combo: $("#multiCheckCombo"),
    toggleDark: document.getElementById("darkToggle"),
    onlyEquip: document.getElementById("onlyEquipment"),
    btnFilter: document.getElementById("btnFilter"),
    btnExport: document.getElementById("btnExport"),
    kSumBudget: document.getElementById("sumBudget"),
    kSumBook: document.getElementById("sumBook"),
    kSumRemain: document.getElementById("sumRemain"),
  };

  // ====== สร้าง Multi-select จาก data ======
  function buildSelect() {
    const seen = new Set();
    el.combo.empty();
    state.raw.forEach((r) => {
      if (!seen.has(r.bg_expense_id)) {
        seen.add(r.bg_expense_id);
        el.combo.append(new Option(r.c_name, r.bg_expense_id, false, false));
      }
    });
    el.combo.selectpicker("refresh");
  }

  // ====== คำนวณรวม/เตรียมชุดข้อมูลสำหรับกราฟและตาราง ======
  function aggregate(rows) {
    const map = {};
    rows.forEach((it) => {
      if (!map[it.c_name]) {
        map[it.c_name] = {
          name: it.c_name,
          income_used: 0, // ที่ใช้ไป รายได้
          income_remain: 0, // คงเหลือ รายได้
          bkk_used: 0,
          bkk_remain: 0,
          gov_used: 0,
          gov_remain: 0,
        };
      }
      const g = map[it.c_name];
      g.income_used += +it.f_reserve_budget || 0;
      g.income_remain += +it.f_plan_begin_remaining || 0;

      g.bkk_used += +it.f_reserve_period_bkb || 0;
      g.bkk_remain += +it.f_period_transfer_remaining_bkb || 0;

      g.gov_used += +it.f_reserve_period_government || 0;
      g.gov_remain += +it.f_period_transfer_remaining_government || 0;
    });
    const list = Object.values(map);

    // KPI รวม
    const sumBudget = list.reduce((s, x) => s + x.income_used + x.bkk_used + x.gov_used + x.income_remain + x.bkk_remain + x.gov_remain, 0);
    const sumBooked = list.reduce((s, x) => s + x.income_used + x.bkk_used + x.gov_used, 0);
    const sumRemain = list.reduce((s, x) => s + x.income_remain + x.bkk_remain + x.gov_remain, 0);

    return { list, sumBudget, sumBooked, sumRemain };
  }

  function toBaht(n) {
    return (+n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  function percent(used, rem) {
    const t = (+used || 0) + (+rem || 0);
    return t > 0 ? (used / t) * 100 : 0;
  }

  // ====== เรนเดอร์กราฟแท่ง (Stacked) ======
  let chartBar = echarts.init(el.bar);
  function renderBar(list) {
    const isDark = document.body.classList.contains("dark-mode");
    const names = list.map((x) => x.name);
    chartBar.setOption({
      backgroundColor: "transparent",
      title: { text: "สรุปงบประมาณตามหมวดค่าใช้จ่าย", left: "center", textStyle: { color: isDark ? "#e6e6e6" : "#333" } },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (ps) => {
          const name = ps[0].name;
          let s = `<b>${name}</b><br/>`;
          ps.forEach((p) => {
            s += `${p.marker} ${p.seriesName}: ${toBaht(p.value)} บาท<br/>`;
          });
          return s;
        },
      },
      legend: { top: "8%", textStyle: { color: isDark ? "#cbd5e1" : "#333" } },
      grid: { top: "20%", left: "3%", right: "2%", bottom: "8%", containLabel: true },
      xAxis: { type: "category", data: names, axisLabel: { interval: 0, rotate: 25, color: isDark ? "#cbd5e1" : "#333" } },
      yAxis: { type: "value", name: "บาท", axisLabel: { color: isDark ? "#cbd5e1" : "#333", formatter: (v) => v.toLocaleString() }, splitLine: { lineStyle: { color: isDark ? "#2a2a2a" : "#eee" } } },
      toolbox: {
        show: true,
        feature: {
          dataView: { show: true, readOnly: true },
          magicType: { show: true, type: ["bar", "stack", "tiled"] },
          restore: { show: true },
          saveAsImage: { show: true },
        },
      },
      series: [
        { name: "ที่ใช้ไป รายได้", type: "bar", stack: "income", itemStyle: { color: "#1E88E5" }, data: list.map((x) => x.income_used) },
        { name: "คงเหลือ รายได้", type: "bar", stack: "income", itemStyle: { color: "#90CAF9" }, data: list.map((x) => x.income_remain) },
        { name: "ที่ใช้ไป กทม.", type: "bar", stack: "bkk", itemStyle: { color: "#4CAF50" }, data: list.map((x) => x.bkk_used) },
        { name: "คงเหลือ กทม.", type: "bar", stack: "bkk", itemStyle: { color: "#A5D6A7" }, data: list.map((x) => x.bkk_remain) },
        { name: "ที่ใช้ไป รัฐบาล", type: "bar", stack: "gov", itemStyle: { color: "#FF9800" }, data: list.map((x) => x.gov_used) },
        { name: "คงเหลือ รัฐบาล", type: "bar", stack: "gov", itemStyle: { color: "#FFE082" }, data: list.map((x) => x.gov_remain) },
      ],
    });
  }

  // ====== เรนเดอร์โดนัท “วิธีการดำเนินงาน” (demo) ======
  let chartDonut = echarts.init(el.donut);
  function renderDonut() {
    const isDark = document.body.classList.contains("dark-mode");
    const tor = (__BUDGET_DATA__.tor || []).map((x) => ({ name: x.name, value: x.value }));
    chartDonut.setOption({
      title: { text: "", left: "center", textStyle: { color: isDark ? "#e6e6e6" : "#333" } },
      tooltip: { trigger: "item", formatter: "{b}: {c}%" },
      legend: { top: "5%", textStyle: { color: isDark ? "#cbd5e1" : "#333" } },
      series: [
        {
          name: "",
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: true,
          label: { formatter: "{b}\n{c}%" },
          data: tor,
        },
      ],
    });
  }

  // ====== เรนเดอร์ Data Table ======
  function renderTable(list) {
    // สร้าง header 3 กลุ่ม + % ต่อท้าย
    let html = `
      <table class="table table-sm table-bordered">
        <thead class="thead-light">
          <tr>
            <th rowspan="2" class="align-middle text-center">หมวดงบ</th>
            <th colspan="5" class="text-center" style="background:#e8f1fd">เงินรายได้</th>
            <th colspan="5" class="text-center" style="background:#e9f7ef">อุดหนุนกทม.</th>
            <th colspan="5" class="text-center" style="background:#fff7e6">อุดหนุนรัฐบาล</th>
          </tr>
          <tr>
            <th class="text-right">ที่ใช้ไป</th><th class="text-right">ตรวจรับแล้ว</th><th class="text-right">เบิกแล้ว</th><th class="text-right">คงเหลือ</th><th class="text-center">%</th>
            <th class="text-right">ที่ใช้ไป</th><th class="text-right">ตรวจรับแล้ว</th><th class="text-right">เบิกแล้ว</th><th class="text-right">คงเหลือ</th><th class="text-center">%</th>
            <th class="text-right">ที่ใช้ไป</th><th class="text-right">ตรวจรับแล้ว</th><th class="text-right">เบิกแล้ว</th><th class="text-right">คงเหลือ</th><th class="text-center">%</th>
          </tr>
        </thead>
        <tbody>
    `;

    // หมายเหตุ: ในชุดจำลองนี้ยังไม่มี “ตรวจรับแล้ว/เบิกแล้ว” แยกเป็นคอลัมน์ย่อย
    // จึงแสดงเป็น 0 และใช้ “ที่ใช้ไป” กับ “คงเหลือ” คำนวณ %
    list.forEach((x) => {
      const pIncome = percent(x.income_used, x.income_remain);
      const pBkk = percent(x.bkk_used, x.bkk_remain);
      const pGov = percent(x.gov_used, x.gov_remain);
      html += `
        <tr>
          <td>${x.name}</td>

          <td class="text-right">${toBaht(x.income_used)}</td>
          <td class="text-right">0</td>
          <td class="text-right">0</td>
          <td class="text-right">${toBaht(x.income_remain)}</td>
          <td class="text-center">${pIncome.toFixed(2)}%</td>

          <td class="text-right">${toBaht(x.bkk_used)}</td>
          <td class="text-right">0</td>
          <td class="text-right">0</td>
          <td class="text-right">${toBaht(x.bkk_remain)}</td>
          <td class="text-center">${pBkk.toFixed(2)}%</td>

          <td class="text-right">${toBaht(x.gov_used)}</td>
          <td class="text-right">0</td>
          <td class="text-right">0</td>
          <td class="text-right">${toBaht(x.gov_remain)}</td>
          <td class="text-center">${pGov.toFixed(2)}%</td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    el.tbl.innerHTML = html;
  }

  // ====== KPI สรุป ======
  function renderKPI(sumBudget, sumBooked, sumRemain) {
    el.kSumBudget.textContent = "งบรวม " + toBaht(sumBudget);
    el.kSumBook.textContent = "จองเงิน " + toBaht(sumBooked);
    el.kSumRemain.textContent = "คงเหลือ " + toBaht(sumRemain);
  }

  // ====== กรอง + เรนเดอร์ทั้งหมด ======
  function filterAndRender() {
    let rows = state.raw.slice();
    // multi-select
    const selected = (el.combo.val() || []).map(String);
    if (selected.length) {
      rows = rows.filter((r) => selected.includes(String(r.bg_expense_id)));
    }
    // เฉพาะหมวดครุภัณฑ์ (ตัวอย่าง: คัด c_name มีคำว่า “ครุภัณฑ์”)
    if (el.onlyEquip.checked) rows = rows.filter((r) => (r.c_name || "").indexOf("ครุภัณฑ์") > -1);

    const { list, sumBudget, sumBooked, sumRemain } = aggregate(rows);
    renderBar(list);
    renderDonut();
    renderTable(list);
    renderKPI(sumBudget, sumBooked, sumRemain);
  }

  // ====== Export Excel จาก DataView ปัจจุบัน ======
  function exportExcel() {
    const opt = chartBar.getOption();
    const headers = ["หมวดงบ", ...opt.series.map((s) => s.name)];
    const rows = [headers];
    for (let i = 0; i < opt.xAxis[0].data.length; i++) {
      const row = [opt.xAxis[0].data[i]];
      opt.series.forEach((s) => row.push(s.data[i] || 0));
      rows.push(row);
    }
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Budget");
    XLSX.writeFile(wb, "budget_report.xlsx");
  }

  // ====== Dark mode ======
  function applySavedTheme() {
    const saved = localStorage.getItem("darkMode") === "on";
    if (saved) document.body.classList.add("dark-mode");
    el.toggleDark.checked = saved;
  }
  function rebuildCharts() {
    chartBar.dispose();
    chartDonut.dispose();
    chartBar = echarts.init(el.bar);
    chartDonut = echarts.init(el.donut);
    filterAndRender();
  }

  // ===== init =====
  $(document).ready(function () {
    buildSelect();
    applySavedTheme();
    filterAndRender();

    el.btnFilter.addEventListener("click", filterAndRender);
    el.btnExport.addEventListener("click", exportExcel);
    el.toggleDark.addEventListener("change", function () {
      document.body.classList.toggle("dark-mode");
      localStorage.setItem("darkMode", this.checked ? "on" : "off");
      rebuildCharts();
    });
  });
})();
