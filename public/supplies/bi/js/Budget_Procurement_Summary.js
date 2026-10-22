/* สรุปรายงานยอดปริมาณการจัดซื้อจัดจ้าง
 * ข้อมูลงบประมาณ/ยอดจอง : ../api/List_Rep_Budget_Monitoring_Dashboard.php  (ชุดเดียวกับ Dashboard งบประมาณ)
 * จำนวนเรื่อง/ตามแผน-นอกแผน : ../api/List_DetailBgV5.php (PR/PO รายเรื่อง, plan_status 1=ตามแผน 2=นอกแผน)
 * ยอดทำสัญญา = การ์ด "จองสัญญา (PO)" ของ Dashboard (ผลรวม f_amt ของ PR ที่ has_po > 0)
 */
(function () {
  "use strict";

  const API_BUDGET = "../api/List_Rep_Budget_Monitoring_Dashboard.php";
  const API_DETAIL = "../api/List_DetailBgV5.php";
  const EPS = 0.005;
  const COLORS = ["#ea4335", "#fbbc04", "#34a853", "#ff6d01", "#46bdc6", "#7baaf7", "#f07b72", "#9b59b6"];

  const num = (v) => Number(v) || 0;
  const fmt = (n) => "฿" + num(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const pct = (n) => num(n).toFixed(2) + "%";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ratio = (a, b) => (b > 0 ? (a / b) * 100 : 0);

  const qs = new URL(window.location.href).searchParams;
  const yearTh = Number(qs.get("year_th")) || new Date().getFullYear() + 543;
  const yearEn = Number(qs.get("year_en")) || yearTh - 543;
  // ตรงกับ Dashboard: ศูนย์ต้นทุนเริ่มต้น 38 (รับจาก URL ได้) และนับเฉพาะ 4 แหล่งเงินหลัก (all_funds=1 เพื่อดูทุกแหล่ง)
  const dcCostId = qs.get("dc_cost_id") || "38";
  const allFunds = qs.get("all_funds") === "1";
  const CANONICAL_FUNDS = ["เงินรายได้ส่วนงาน", "เงินอุดหนุนรัฐบาล", "เงินอุดหนุนกทม.", "เงินสะสมส่วนงาน"];

  const charts = [];
  function chartOf(id) {
    const old = echarts.getInstanceByDom(document.getElementById(id));
    if (old) old.dispose();
    const c = echarts.init(document.getElementById(id));
    charts.push(c);
    return c;
  }

  function fetchJson(url, params) {
    return $.ajax({ url, method: "GET", data: params, dataType: "text" }).then((t) => JSON.parse(t || "{}"));
  }

  function initYear() {
    const sel = document.getElementById("psYear");
    const cur = new Date().getFullYear() + 543;
    for (let y = cur + 1; y >= cur - 6; y--) sel.add(new Option("พ.ศ. " + y, y));
    sel.value = String(yearTh);
    sel.addEventListener("change", function () {
      window.location.search = "?year_th=" + this.value + "&year_en=" + (Number(this.value) - 543);
    });
    document.getElementById("psYearLabel").textContent = yearTh;
  }

  function load() {
    Promise.all([
      fetchJson(API_BUDGET, { fn: "List_QueryParam", year_th: yearTh, year_en: yearEn, dc_cost_id: dcCostId }),
      fetchJson(API_DETAIL, { fn: "List_QueryParam", year_th: yearTh, year_en: yearEn, dc_cost_id: dcCostId }),
    ])
      .then(([b, d]) => {
        const budget = (Array.isArray(b.data) ? b.data : []).filter((r) => String(r.budget_year) === String(yearTh))
          .filter((r) => allFunds || CANONICAL_FUNDS.includes(String(r.c_name || "").trim()));
        const fundIds = new Set(budget.map((r) => String(r.dc_expense_budget_type_id)));
        const prs = (Array.isArray(d.data) ? d.data : []).filter((r) => num(r.f_amt) > EPS && fundIds.has(String(r.dc_expense_budget_type_id)));
        RAW.budget = budget;
        RAW.prs = prs;
        selectedFund = qs.get("fund_id") || "all";
        buildFundButtons();
        document.getElementById("psLoading").style.display = "none";
        document.getElementById("psBody").style.display = "";
        // กราฟต้อง init หลังแสดง container แล้ว
        applyFund();
      })
      .catch((e) => {
        console.error(e);
        document.getElementById("psLoading").textContent = "ดึงข้อมูลไม่สำเร็จ";
      });
  }

  /* ---------- ปุ่มเลือกแหล่งเงิน ---------- */
  const RAW = { budget: [], prs: [] };
  let selectedFund = "all";

  function buildFundButtons() {
    const m = new Map();
    RAW.budget.forEach((r) => {
      const id = String(r.dc_expense_budget_type_id);
      if (!m.has(id)) m.set(id, { id, name: r.dc_expense_budget_type || r.c_name || "ไม่ทราบแหล่งเงิน", budget: 0 });
      m.get(id).budget += num(r.f_budget_real);
    });
    RAW.prs.forEach((r) => {
      const id = String(r.dc_expense_budget_type_id);
      if (!m.has(id)) m.set(id, { id, name: r.dc_expense_budget_type || "ไม่ทราบแหล่งเงิน", budget: 0 });
    });
    const list = Array.from(m.values()).sort((a, b) => b.budget - a.budget);
    if (!m.has(selectedFund)) selectedFund = "all";
    const btn = (id, name) => `<button type="button" class="ps-chip${id === selectedFund ? " active" : ""}" data-id="${esc(id)}">${esc(name)}</button>`;
    $("#psFundBar").html('<span class="ps-chip-label">แหล่งเงิน:</span>' + btn("all", "รวมทุกแหล่งเงิน") + list.map((f) => btn(f.id, f.name)).join(""));
    $("#psFundBar").off("click").on("click", ".ps-chip", function () {
      selectedFund = String($(this).data("id"));
      $("#psFundBar .ps-chip").removeClass("active");
      $(this).addClass("active");
      const u = new URL(window.location.href);
      if (selectedFund === "all") u.searchParams.delete("fund_id"); else u.searchParams.set("fund_id", selectedFund);
      window.history.replaceState(null, "", u);
      applyFund();
    });
  }

  function applyFund() {
    const ok = (r) => selectedFund === "all" || String(r.dc_expense_budget_type_id) === selectedFund;
    render(RAW.budget.filter(ok), RAW.prs.filter(ok));
    renderCharts();
  }

  /* ---------- aggregate ---------- */
  const state = {};

  function nameOfExpense(s) {
    const t = String(s || "");
    const i = t.indexOf(" : ");
    return (i >= 0 ? t.slice(i + 3) : t).trim() || "ไม่ระบุ";
  }

  function render(budget, prs) {
    const funds = new Map();
    const types = new Map();
    let totBudget = 0, totContract = 0;

    budget.forEach((r) => {
      const bud = num(r.f_budget_real);
      if (Math.abs(bud) < EPS) return;
      totBudget += bud;

      const fid = String(r.dc_expense_budget_type_id);
      const f = funds.get(fid) || { name: r.dc_expense_budget_type || r.c_name || "ไม่ทราบแหล่งเงิน", budget: 0, contract: 0, ids: new Set() };
      f.budget += bud;
      funds.set(fid, f);

      const tn = nameOfExpense(r.bg_expense);
      const t = types.get(tn) || { name: tn, budget: 0, contract: 0, ids: new Set() };
      t.budget += bud;
      types.set(tn, t);
    });

    // จำนวนเรื่อง / ตามแผน-นอกแผน จากรายการ PR รายเรื่อง
    const plan = { 1: { amt: 0, ids: new Set() }, 2: { amt: 0, ids: new Set() }, 0: { amt: 0, ids: new Set() } };
    const allIds = new Set();
    // ยอดจองทั้งหมด (PR+PO) แยกตามแผน — ใช้เทียบกับยอดทำสัญญา (PO) ในกราฟ
    const planReserved = { 1: 0, 2: 0, 0: 0 };
    prs.forEach((r) => {
      const ps = num(r.plan_status) === 1 ? 1 : num(r.plan_status) === 2 ? 2 : 0;
      planReserved[ps] += num(r.f_amt);
    });
    // ยอดทำสัญญา = "จองสัญญา (PO)" ของ Dashboard = ผลรวม f_amt ของ PR ที่มี PO แล้ว (has_po > 0)
    prs.filter((r) => num(r.has_po) > 0).forEach((r, idx) => {
      const ps = num(r.plan_status) === 1 ? 1 : num(r.plan_status) === 2 ? 2 : 0;
      plan[ps].amt += num(r.f_amt);
      // นับแบบ "รายการ" (แถว) เหมือนการ์ด PR ตามแผน/นอกแผน ใน Dashboard
      plan[ps].ids.add(idx);
      allIds.add(idx);
      const amt = num(r.f_amt);
      totContract += amt;
      const fid = String(r.dc_expense_budget_type_id);
      const f = funds.get(fid) || { name: r.dc_expense_budget_type || "ไม่ทราบแหล่งเงิน", budget: 0, contract: 0, ids: new Set() };
      f.contract += amt; f.ids.add(idx); funds.set(fid, f);
      const tn = nameOfExpense(r.bg_expense);
      const t = types.get(tn) || { name: tn, budget: 0, contract: 0, ids: new Set() };
      t.contract += amt; t.ids.add(idx); types.set(tn, t);
    });

    const fundList = Array.from(funds.values()).sort((a, b) => b.contract - a.contract);
    const typeList = Array.from(types.values()).sort((a, b) => b.contract - a.contract);
    Object.assign(state, { fundList, typeList, plan, planReserved, totBudget, totContract });

    const save = totBudget - totContract;
    $("#kpiBudget").text(fmt(totBudget));
    $("#kpiBudgetSub").text("กรอบวงเงินตามบัญชีจัดสรร ปีงบประมาณ " + yearTh);
    $("#kpiContract").text(fmt(totContract));
    $("#kpiSave").text(fmt(save));
    $("#kpiSaveSub").text("อัตราประหยัด " + pct(ratio(save, totBudget)) + " จากงบจัดสรร");
    $("#kpiCount").text(allIds.size.toLocaleString("en-US"));
    $("#kpiCountSub").text("ตามแผน " + plan[1].ids.size + " รายการ · นอกแผน " + plan[2].ids.size + " รายการ" + (plan[0].ids.size ? " · ไม่ระบุ " + plan[0].ids.size + " รายการ" : ""));

    renderPlanTable(totBudget, totContract);
    renderFundTable(fundList, totBudget, totContract);
    renderTypeTable(typeList, totBudget, totContract, allIds.size);
  }

  /* ---------- tables ---------- */
  function renderPlanTable(totBudget, totContract) {
    const p = state.plan;
    const rows = [["ตามแผน", p[1]], ["นอกแผน", p[2]]];
    if (p[0].ids.size) rows.push(["ไม่ระบุแผน", p[0]]);
    // งบประมาณไม่ได้แยกตามแผน/นอกแผนในบัญชีจัดสรร จึงแสดงงบ/ส่วนต่าง/อัตราประหยัดเฉพาะแถวรวม
    let h = "<tr><th>แผนงานการจัดซื้อ</th><th>งบประมาณจัดสรร (บาท)</th><th>ยอดทำสัญญา (บาท)</th><th>ส่วนต่างประหยัดได้ (บาท)</th><th>อัตราประหยัด (%)</th></tr>";
    rows.forEach(([n, v]) => {
      h += `<tr><td>${n} <small class="text-muted">(${v.ids.size} รายการ)</small></td><td class="n">-</td><td class="n">${fmt(v.amt)}</td><td class="n">-</td><td class="n">-</td></tr>`;
    });
    const save = totBudget - totContract;
    h += `<tr class="tot"><td>รวมทั้งสิ้น</td><td class="n">${fmt(totBudget)}</td><td class="n">${fmt(totContract)}</td><td class="n">${fmt(save)}</td><td class="n">${pct(ratio(save, totBudget))}</td></tr>`;
    $("#tblPlan").html(h);
  }

  function renderFundTable(list, totBudget, totContract) {
    let h = "<tr><th>แหล่งเงินทุน</th><th>งบประมาณจัดสรร (บาท)</th><th>ยอดทำสัญญา (บาท)</th><th>ส่วนต่างประหยัดได้ (บาท)</th><th>สัดส่วนยอดสัญญา (%)</th></tr>";
    list.forEach((f) => {
      h += `<tr><td>${esc(f.name)}</td><td class="n">${fmt(f.budget)}</td><td class="n">${fmt(f.contract)}</td><td class="n">${fmt(f.budget - f.contract)}</td><td class="n">${pct(ratio(f.contract, totContract))}</td></tr>`;
    });
    h += `<tr class="tot"><td>รวมทั้งสิ้น</td><td class="n">${fmt(totBudget)}</td><td class="n">${fmt(totContract)}</td><td class="n">${fmt(totBudget - totContract)}</td><td class="n">100.00%</td></tr>`;
    $("#tblFund").html(h);
  }

  function renderTypeTable(list, totBudget, totContract, totCount) {
    let h = "<tr><th>ประเภทค่าใช้จ่าย</th><th>จำนวนรายการ</th><th>งบประมาณจัดสรร (บาท)</th><th>ยอดทำสัญญา (บาท)</th><th>ส่วนต่างประหยัดได้ (บาท)</th><th>อัตราประหยัด (%)</th></tr>";
    list.forEach((t) => {
      h += `<tr><td>${esc(t.name)}</td><td class="c">${t.ids.size}</td><td class="n">${fmt(t.budget)}</td><td class="n">${fmt(t.contract)}</td><td class="n">${fmt(t.budget - t.contract)}</td><td class="n">${pct(ratio(t.budget - t.contract, t.budget))}</td></tr>`;
    });
    h += `<tr class="tot"><td>รวมทั้งสิ้น</td><td class="c">${totCount}</td><td class="n">${fmt(totBudget)}</td><td class="n">${fmt(totContract)}</td><td class="n">${fmt(totBudget - totContract)}</td><td class="n">${pct(ratio(totBudget - totContract, totBudget))}</td></tr>`;
    $("#tblType").html(h);
  }

  /* ---------- charts ---------- */
  function renderCharts() {
    const money = (v) => num(v).toLocaleString("en-US", { maximumFractionDigits: 0 });

    // 1) งบประมาณจัดสรร (สีน้ำเงิน) vs ยอดทำสัญญา = จองสัญญา (PO) (สีเขียว)
    // งบจัดสรรในระบบไม่ได้แยกตามแผน/นอกแผน จึงเทียบรายแหล่งเงิน (ปุ่มกรองแหล่งเงินด้านบนใช้ได้)
    const lab = { show: true, position: "top", fontSize: 10, formatter: (p) => (Math.abs(p.value) > EPS ? fmt(p.value) : "") };
    chartOf("chartPlan").setOption({
      title: { text: "เปรียบเทียบงบประมาณจัดสรรกับยอดทำสัญญา (แยกตามแหล่งเงินทุน)", left: "center", textStyle: { fontSize: 13, color: "#555" } },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v) => fmt(v) },
      legend: { bottom: 0, data: ["งบประมาณจัดสรร (บาท)", "ยอดทำสัญญา (บาท)"] },
      grid: { left: 130, right: 20, top: 45, bottom: 75 },
      xAxis: { type: "category", name: "แหล่งเงินทุน", nameLocation: "middle", nameGap: 30, data: state.fundList.map((f) => f.name) },
      yAxis: { type: "value", name: "จำนวนเงิน (บาท)", nameLocation: "middle", nameGap: 105, axisLabel: { formatter: (v) => fmt(v) } },
      series: [
        { name: "งบประมาณจัดสรร (บาท)", type: "bar", data: state.fundList.map((f) => f.budget), itemStyle: { color: "#3d5a99" }, label: lab },
        { name: "ยอดทำสัญญา (บาท)", type: "bar", data: state.fundList.map((f) => f.contract), itemStyle: { color: "#3dbf8f" }, label: lab },
      ],
    });

    // 2) สัดส่วนตามแหล่งเงิน
    chartOf("chartFund").setOption({
      title: { text: "สัดส่วนยอดการจัดซื้อตามแหล่งเงินทุน", left: "center", textStyle: { fontSize: 13, color: "#555" } },
      tooltip: { trigger: "item", formatter: (p) => `${esc(p.name)}<br>${fmt(p.value)} (${p.percent}%)` },
      legend: { orient: "vertical", right: 10, top: "middle" },
      color: COLORS,
      series: [{ type: "pie", radius: ["40%", "70%"], center: ["40%", "55%"], label: { show: false }, data: state.fundList.filter((f) => f.contract > EPS).map((f) => ({ name: f.name, value: f.contract })) }],
    });

    // 3) ยอดทำสัญญาตามประเภทค่าใช้จ่าย (แนวนอน มากไปน้อย)
    const t = state.typeList.filter((x) => x.contract > EPS).slice().reverse();
    chartOf("chartType").setOption({
      title: { text: "ยอดทำสัญญาแยกตามประเภทค่าใช้จ่าย", left: "center", textStyle: { fontSize: 13, color: "#555" } },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v) => fmt(v) },
      grid: { left: 180, right: 30, top: 40, bottom: 30 },
      xAxis: { type: "value", axisLabel: { formatter: (v) => money(v / 1e6) + " ล." } },
      yAxis: { type: "category", data: t.map((x) => x.name), axisLabel: { fontSize: 10, width: 165, overflow: "truncate" } },
      series: [{ type: "bar", data: t.map((x) => x.contract), itemStyle: { color: "#1a56b0" } }],
    });
  }

  window.addEventListener("resize", () => charts.forEach((c) => c.resize()));
  initYear();
  load();
})();
