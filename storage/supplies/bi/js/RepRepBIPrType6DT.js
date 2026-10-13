/* RepRepBIPrType6.js — fixed */

(function () {
  /* ---------- Utils: ปีไทย/ปีคริสต์ ---------- */
  function makeYearList() {
    const years = [];
    const now = new Date().getFullYear();
    // สร้างช่วง: (ปีปัจจุบัน - 3) .. (ปีปัจจุบัน + 1)
    for (let y = now - 3; y <= now + 1; y++) {
      years.push({ en: y, th: y + 543 });
    }
    return years;
  }

  function getQS() {
    const url = new URL(window.location.href);
    return {
      year_th: url.searchParams.get("year_th"),
      year_en: url.searchParams.get("year_en"),
    };
  }

  function setQS(pairs) {
    const params = new URLSearchParams(window.location.search);
    Object.entries(pairs).forEach(([k, v]) => params.set(k, v));
    params.set("_", Date.now()); // cache buster
    window.location.search = params.toString();
  }

  // เดิม: const toBaht = (n) => (Number(n) || 0).toLocaleString("th-TH", { maximumFractionDigits: 2 });
  const toBaht = (n) =>
    (Number(n) || 0).toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const fmt2 = (n) =>
    (Number(n) || 0).toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const getDark = () => localStorage.getItem("demoDarkMode") === "on";
  const setDark = (on) => {
    document.body.classList.toggle("dark-mode", !!on);
    localStorage.setItem("demoDarkMode", on ? "on" : "off");
  };

  /* ---------- Globals (ประกาศก่อนใช้เสมอ) ---------- */
  window.DATA_BUDGET = window.DATA_BUDGET || [];
  window.DATA_STATUS = window.DATA_STATUS || [];
  let CURRENT_ITEMS_FOR_DV = [];
  let chartBar;

  /* ---------- สร้าง/เติม <select id="budget_year_filter"> ---------- */
  function initYearSelect() {
    const sel = document.getElementById("budget_year_filter");
    if (!sel) return; // ไม่มี element ก็ข้าม

    // เติม options ใหม่ทั้งหมด
    sel.innerHTML = "";
    makeYearList().forEach(({ en, th }) => {
      const opt = document.createElement("option");
      opt.value = String(th); // ใช้ พ.ศ. เป็น value
      opt.textContent = "พ.ศ. " + th; // label
      opt.dataset.yearEn = String(en); // เก็บ ค.ศ.
      sel.appendChild(opt);
    });

    // ค่าเริ่มต้นจาก query string (หรือปีปัจจุบัน)
    const qs = getQS();
    const year_th_init = qs.year_th || String(new Date().getFullYear() + 543);
    const year_en_init = qs.year_en || String(Number(year_th_init) - 543);

    sel.value = year_th_init;

    // เปลี่ยนปี => รีโหลดหน้า พร้อม query string ที่ถูกต้อง
    sel.addEventListener("change", function () {
      const yearTh = this.value;
      const yearEn = this.options[this.selectedIndex].dataset.yearEn;
      // เก็บ dark mode ก่อนรีโหลด
      const isDark = document.body.classList.contains("dark-mode");
      localStorage.setItem("demoDarkMode", isDark ? "on" : "off");
      setQS({ year_th: yearTh, year_en: yearEn });
    });

    // คืนค่า en/th เริ่มต้น เผื่อใช้โหลดข้อมูลครั้งแรก
    return { year_th_init, year_en_init };
  }

  // รวมข้อมูลละเอียด (ต่อ bg_expense_id) ให้เหลือระดับ "แหล่งเงิน" (dc_expense_budget_type / c_name)
  function aggregateBySource(rows, { year = "all", ids = [] } = {}) {
    // ควบคุมลำดับให้สวยงาม
    const ORDER = ["เงินรายได้คณะแพทย์ฯ-โรงพยาบาล", "เงินอุดหนุนกทม.", "เงินอุดหนุนรัฐบาล", "เงินสะสมส่วนงาน"];
    const sortKey = (name) => {
      const i = ORDER.indexOf(name);
      return i === -1 ? 999 : i;
    };

    const map = new Map(); // key = ชื่อแหล่งเงิน
    rows.forEach((r) => {
      if (year !== "all" && String(r.budget_year) !== String(year)) return;
      if (ids && ids.length && !ids.includes(String(r.dc_expense_budget_type_id))) return;

      const name = r.dc_expense_budget_type || r.c_name || "ไม่ทราบแหล่งเงิน";
      const total = Number(r.f_plan_begin) || 0;
      const booked = Number(r.f_reserve_budget) || 0;

      const cur = map.get(name) || { name, total: 0, booked: 0 };
      cur.total += total;
      cur.booked += booked;
      map.set(name, cur);
    });

    return Array.from(map.values())
      .map((x) => ({ ...x, remain: x.total - x.booked }))
      .sort((a, b) => sortKey(a.name) - sortKey(b.name));
  }

  /* ---------- สร้าง UI + bind events ---------- */
  function initUIAndRender() {
    // init bootstrap-select ให้มั่นใจว่ามีปลั๊กอิน
    if (typeof $.fn.selectpicker !== "function") {
      console.error("bootstrap-select ยังไม่ถูกโหลด");
      return;
    }

    // เติม multi สำหรับหมวดจาก DATA_BUDGET (ปีตามที่เลือกใน select ปี)
    const year = $("#budget_year_filter").val() || "all";
    const $multi = $("#multiCheckCombo");
    $multi.empty();
    const seen = new Set();
    const first3 = [];

    window.DATA_BUDGET.forEach((it) => {
      if (year !== "all" && String(it.budget_year) !== String(year)) return;
      if (!seen.has(it.dc_expense_budget_type_id)) {
        seen.add(it.dc_expense_budget_type_id);
        $multi.append(new Option(it.c_name, it.dc_expense_budget_type_id));
        if (first3.length < 4) first3.push(String(it.dc_expense_budget_type_id));
      }
    });

    $multi.selectpicker(); // init
    $multi.selectpicker("refresh");
    $multi.selectpicker("val", first3);

    renderStatusCards(window.DATA_STATUS);
    renderCharts();
    bindFiltersOnce();
  }

  function bindFiltersOnce() {
    // ป้องกัน bind ซ้ำ
    if (bindFiltersOnce.done) return;
    bindFiltersOnce.done = true;

    const $multi = $("#multiCheckCombo");
    const $multibg = $("#multiCheckComboBg");
    $("#budget_year_filter, #filter_equipment").on("change", refreshAll);
    $multi.on("changed.bs.select", refreshAll);
    $multibg.on("changed.bs.select", refreshAll);
    $("#darkToggle").on("change", (e) => setDark(e.target.checked));
    $("#btnExport").on("click", exportExcel);
  }

  /* ---------- แสดงการ์ดสถานะ ---------- */
  function renderStatusCards(rows) {
    const byName = {};
    rows.forEach((r) => (byName[r.c_name] = r));
    $("#stWait").text(byName["รอดำเนินการ"]?.i_tor_type1 ?? 0);
    $("#stDoing").text(byName["อยู่ระหว่างดำเนินการ"]?.i_tor_type2 ?? 0);
    $("#stCheck").text(byName["ตรวจรับ"]?.i_tor_type3 ?? 0);
    $("#stDone").text(byName["เบิกจ่ายแล้ว"]?.i_tor_type4 ?? 0);
  }

  /* ---------- สร้างข้อมูลสำหรับกราฟ ---------- */
  function pickBudget(year, ids, onlyEquipment /*, idsbg(opt) */) {
    const out = [];
    window.DATA_BUDGET.forEach((r) => {
      if (year !== "all" && String(r.budget_year) !== String(year)) return;
      if (ids && ids.length && !ids.includes(String(r.dc_expense_budget_type_id))) return;
      // if (onlyEquipment && String(r.i_product_type1) !== "1") return;

      const total = +r.f_plan_begin || 0;
      const booked = +r.f_reserve_budget || 0;
      const remain = total - booked;

      out.push({
        id: r.dc_expense_budget_type_id,
        name: r.c_name,
        bg_expense: r.bg_expense,
        bg_expense_id: r.bg_expense_id,
        total,
        booked,
        remain,
      });
    });
    return out;
  }

  function buildSummary(items) {
    const sumAll = items.reduce((s, it) => s + it.total, 0);
    const sumBooked = items.reduce((s, it) => s + it.booked, 0);
    const sumRemain = items.reduce((s, it) => s + it.remain, 0);

    const el = document.getElementById("summaryBox");
    if (!el) return;

    el.innerHTML = `
    <div class="summary-card">
      <div>
        <div class="summary-title">สรุป</div>
        <div class="text-xs text-muted">ภาพรวมตามปีและแหล่งเงินที่เลือก</div>
      </div>
      <div class="summary-cols">
        <div class="summary-item">
          <span class="summary-label">งบรวม</span>
          <div class="summary-value total">${toBaht(sumAll)}</div>
        </div>
        <div class="summary-item">
          <span class="summary-label">จองเงิน / ใช้ไปแล้ว</span>
          <div class="summary-value booked">${toBaht(sumBooked)}</div>
        </div>
        <div class="summary-item">
          <span class="summary-label">คงเหลือ</span>
          <div class="summary-value remain">${toBaht(sumRemain)}</div>
        </div>
      </div>
    </div>
  `;
  }

  /* ---------- กราฟหลัก ---------- */
  function renderBar(itemsRaw) {
    // อ่านค่าฟิลเตอร์ปัจจุบัน
    const year = $("#budget_year_filter").val() || "all";
    const ids = $("#multiCheckCombo").val() || [];

    // เลือก source: ถ้า DATA_BUDGET มีข้อมูล ให้รวมจาก DATA_BUDGET; ไม่งั้นรวมจาก args
    const rows = window.DATA_BUDGET && window.DATA_BUDGET.length ? window.DATA_BUDGET : itemsRaw || [];
    const items = aggregateBySource(rows, { year, ids }); // ✅ รวมเป็นระดับแหล่งเงิน
    CURRENT_ITEMS_FOR_DV = items;

    if (!chartBar) chartBar = echarts.init(document.getElementById("bar_bg"));
    else chartBar.clear();

    const option = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params) => `<b>${params[0].axisValue}</b><br>` + params.map((p) => `${p.marker} ${p.seriesName}: <b>${fmt2(p.value)}</b>`).join("<br>"),
      },
      legend: [{ data: ["จำนวนงบประมาณ", "จองเงิน", "คงเหลือหลังจองเงิน"], top: "2%", left: "40%" }],
      toolbox: {
        feature: {
          saveAsImage: {},
          dataView: {
            title: "Data View",
            readOnly: true,
            optionToContent: function () {
              return buildDataViewContent(CURRENT_ITEMS_FOR_DV);
            },
          },
          magicType: { type: ["stack", "tiled"] },
          restore: {},
        },
      },
      grid: { left: 10, right: 20, top: 40, bottom: 10, containLabel: true },
      xAxis: { type: "category", data: items.map((x) => x.name), axisLabel: { interval: 0 } },
      yAxis: { type: "value" },
      series: [
        {
          name: "จำนวนงบประมาณ",
          type: "bar",
          data: items.map((x) => x.total),
          itemStyle: { borderColor: "#111", borderWidth: 1 },
          label: { show: true, position: "top", distance: 6, formatter: (p) => echarts.format.addCommas(fmt2(p.value)) },
        },
        {
          name: "จองเงิน",
          type: "bar",
          data: items.map((x) => x.booked),
          itemStyle: { borderColor: "#111", borderWidth: 1 },
          label: { show: true, position: "top", distance: 6, formatter: (p) => echarts.format.addCommas(fmt2(p.value)) },
        },
        {
          name: "คงเหลือหลังจองเงิน",
          type: "bar",
          data: items.map((x) => x.remain),
          itemStyle: { borderColor: "#111", borderWidth: 1 },
          label: { show: true, position: "top", distance: 6, formatter: (p) => echarts.format.addCommas(fmt2(p.value)) },
        },
      ],
      labelLayout: { hideOverlap: true },
    };

    chartBar.setOption(option);
    chartBar.off("click");
    chartBar.on("click", (p) => window.open(`detail.php?type=bar&name=${encodeURIComponent(p.name)}`, "_blank"));
  }

  function pickColorBySource(name) {
    if (name.includes("รายได้")) return "#3f51b5";
    if (name.includes("กรุงเทพมหานคร")) return "#4caf50";
    if (name.includes("รัฐบาล")) return "#ff9800";
    if (name.includes("เงินสะสมส่วนงาน")) return "#c4a67bff";
    return "#9e9e9e";
  }

  function renderBarHigh(itemsRaw) {
    // อ่านค่าฟิลเตอร์
    const year = $("#budget_year_filter").val() || "all";
    const ids = $("#multiCheckCombo").val() || [];

    // รวมข้อมูลระดับแหล่งเงิน (เหมือนกราฟซ้าย)
    const rows = window.DATA_BUDGET && window.DATA_BUDGET.length ? window.DATA_BUDGET : itemsRaw || [];
    const items = aggregateBySource(rows, { year, ids });

    const dom = document.getElementById("pie_tor_type");
    const chart = echarts.init(dom);

    const names = items.map((x) => x.name);
    const seriesData = items.map((x) => {
      const total = Number(x.total) || 0;
      const booked = Number(x.booked) || 0;
      const pct = total > 0 ? +((booked / total) * 100).toFixed(2) : 0; // % ใช้งบ = จอง/ทั้งหมด
      return { name: x.name, value: pct, itemStyle: { color: pickColorBySource(x.name), borderColor: "#111", borderWidth: 1 } };
    });

    const option = {
      backgroundColor: "transparent",
      title: { text: "เปอร์เซ็นต์การใช้งบประมาณ", left: "center" },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (ps) => {
          const i = ps[0].dataIndex;
          const total = Number(items[i].total) || 0;
          const booked = Number(items[i].booked) || 0;
          const used = booked; // ถ้าคำนิยาม “ใช้ไปแล้ว” = จองเงิน
          const pct = ps[0].value;
          return `<b>${names[i]}</b><br/>งบทั้งหมด: ${toBaht(total)}<br/>จองเงิน/ใช้ไปแล้ว: ${toBaht(used)}<br/><b>${pct}%</b>`;
        },
      },
      grid: { left: 90, right: 30, top: 40, bottom: 10, containLabel: true },
      xAxis: { type: "value", min: 0, max: 100, axisLabel: { formatter: "{value} %" } },
      yAxis: { type: "category", data: names, axisLabel: { interval: 0 } },
      series: [{ type: "bar", data: seriesData, label: { show: true, position: "right", formatter: "{c}%" } }],
    };

    chart.clear();
    chart.setOption(option, true);
    chart.off("click");
    chart.on("click", (p) => window.open(`detail.php?type=bar&name=${encodeURIComponent(p.name)}`, "_blank"));
  }
  /* ---------- Data View (HTML table) ---------- */
  /* ---------- Data View (HTML table) ---------- */
  function makeDetailRows(items) {
    // รวมข้อมูลเป็นราย "หมวดค่าใช้จ่าย" (bg_expense_id) ให้แถวเดียวมีทั้ง รายได้/กทม./รัฐบาล
    const byExp = new Map(); // key = bg_expense_id

    items.forEach((it) => {
      const src = (it.c_name || "").trim();

      // ตัวเลขจาก API (เป็นเลขจริง ไม่ใช่ string มีคอมมา)
      const total = +it.f_plan_begin || 0; // ใช้เป็น "ที่ใช้ไป"
      const check = +it.f_reserve_budget || 0; // ใช้เป็น "ตรวจรับแล้ว"
      const paid = 0; // ตอนนี้ไม่มี -> 0
      const left = total - check; // คงเหลือ

      // เตรียม row ตาม bg_expense_id (ถ้ายังไม่มีให้สร้าง)
      const key = String(it.bg_expense_id || "");
      if (!byExp.has(key)) {
        byExp.set(key, {
          no: it.no || "", // ใช้ลำดับที่มาจากฝั่ง PHP
          bg_expense: (it.bg_expense_id ? "  " : "") + (it.bg_expense || "-"),
          bg_expense_id: (it.bg_expense_id ? "  " : "") + (it.bg_expense_id || "-"),

          // เงินรายได้
          income_used: 0,
          income_check: 0,
          income_paid: 0,
          income_left: 0,
          // อุดหนุน กทม.
          bkk_used: 0,
          bkk_check: 0,
          bkk_paid: 0,
          bkk_left: 0,
          // อุดหนุน รัฐบาล
          gov_used: 0,
          gov_check: 0,
          gov_paid: 0,
          gov_left: 0,
          // อุดหนุน สะสมส่วนงาน
          Savings_used: 0,
          Savings_check: 0,
          Savings_paid: 0,
          Savings_left: 0,
        });
      }

      const row = byExp.get(key);
      // เติมตัวเลขลง “คอลัมน์ของแหล่งเงินที่ถูกต้อง”
      if (src.includes("รายได้")) {
        row.income_used += total;
        row.income_check += check;
        row.income_paid += paid;
        row.income_left += left;
      } else if (src.includes("กทม")) {
        row.bkk_used += total;
        row.bkk_check += check;
        row.bkk_paid += paid;
        row.bkk_left += left;
      } else if (src.includes("รัฐบาล")) {
        row.gov_used += total;
        row.gov_check += check;
        row.gov_paid += paid;
        row.gov_left += left;
      } else if (src.includes("เงินสะสมส่วนงาน")) {
        row.Savings_used += total;
        row.Savings_used += check;
        row.Savings_used += paid;
        row.Savings_used += left;
      }
    });

    // คืนค่าเป็นอาร์เรย์ เรียงตามลำดับ (no) ถ้ามี
    return Array.from(byExp.values()).sort((a, b) => {
      const na = Number(a.no) || 0,
        nb = Number(b.no) || 0;
      return na - nb;
    });
  }

  function buildDataViewContent(items) {
    const rows = makeDetailRows(items);
    const cell = (cls, v) => `<td class="${cls} ${Number(v) < 0 ? "neg" : ""}">` + `${v === null || v === undefined || v === "" ? "-" : toBaht(v)}` + `</td>`;

    let html = `
      <div class="echarts-dv-wrap">
        <div style="margin-bottom:.5rem;font-weight:600;">Data View</div>
        <div class="dataview-wrap">
          <table class="table-dv">
            <thead>
              <tr>
                <th class="sticky-col" rowspan="2" style="min-width:60px;text-align:center;">ลำดับ</th>
                <th class="sticky-col" rowspan="2" style="min-width:320px;"> รหัสงบประมาณ / หมวดค่าใช้จ่าย (LV.4) </th>
                <th class="group-income" colspan="4">เงินรายได้</th>
                <th class="group-bkk"    colspan="4">อุดหนุนกรุงเทพมหานคร</th>
                <th class="group-gov"    colspan="4">อุดหนุนรัฐบาล</th>
                <th class="group-Savings"    colspan="4">สะสมส่วนงาน</th>
              </tr>
              <tr>
                <th class="group-income">ที่ใช้ไป</th>
                <th class="group-income">ตรวจรับแล้ว</th>
                <th class="group-income">เบิกแล้ว</th>
                <th class="group-income">คงเหลือ</th>

                <th class="group-bkk">ที่ใช้ไป</th>
                <th class="group-bkk">ตรวจรับแล้ว</th>
                <th class="group-bkk">เบิกแล้ว</th>
                <th class="group-bkk">คงเหลือ</th>

                <th class="group-gov">ที่ใช้ไป</th>
                <th class="group-gov">ตรวจรับแล้ว</th>
                <th class="group-gov">เบิกแล้ว</th>
                <th class="group-gov">คงเหลือ</th>

                <th class="group-Savings">ที่ใช้ไป</th>
                <th class="group-Savings">ตรวจรับแล้ว</th>
                <th class="group-Savings">เบิกแล้ว</th>
                <th class="group-Savings">คงเหลือ</th>
              </tr>
            </thead>
            <tbody>
    `;

    rows.forEach((r) => {
      html += `
        <tr>
          <td class="sticky-col">${r.no}</td>
          <td class="sticky-col">${r.name}</td>
          ${cell("col-income text-right", r.income_used)}
          ${cell("col-income text-right", r.income_check)}
          ${cell("col-income text-right", r.income_paid)}
          ${cell("col-income text-right", r.income_left)}
          ${cell("col-bkk text-right", r.bkk_used)}
          ${cell("col-bkk text-right", r.bkk_check)}
          ${cell("col-bkk text-right", r.bkk_paid)}
          ${cell("col-bkk text-right", r.bkk_left)}
          ${cell("col-gov text-right", r.gov_used)}
          ${cell("col-gov text-right", r.gov_check)}
          ${cell("col-gov text-right", r.gov_paid)}
          ${cell("col-gov text-right", r.gov_left)}
          ${cell("col-Savings text-right", r.Savings_used)}
          ${cell("col-Savings text-right", r.Savings_check)}
          ${cell("col-Savings text-right", r.Savings_paid)}
          ${cell("col-Savings text-right", r.Savings_left)}
        </tr>`;
    });

    html += `
            </tbody>
          </table>
        </div>
      </div>`;

    const el = document.createElement("div");
    el.innerHTML = html;
    return el;
  }
  const COL_KEYS = {
    income_used: "income_used", // รายได้: งบประมาณ / ที่ใช้ไป / ใช้จริง
    income_check: "income_check",
    income_left: "income_left",
    bkk_used: "bkk_used",
    bkk_check: "bkk_check",
    bkk_left: "bkk_left",
    gov_used: "gov_used",
    gov_check: "gov_check",
    gov_left: "gov_left",
    Savings_used: "Savings_used",
    Savings_check: "Savings_check",
    Savings_left: "Savings_left",
  };

  function renderDataView(items) {
    const rows = makeDetailRows(items);
    const tbody = document.getElementById("dvBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const pctBadge = (p) => {
      const v = Number(p) || 0;
      let cls = "pct-75";
      if (v >= 100) cls = "pct-100";
      else if (v >= 90) cls = "pct-90";
      else if (v >= 75) cls = "pct-75";
      else if (v >= 50) cls = "pct-50";
      else if (v >= 25) cls = "pct-25";
      else cls = "pct-0";
      return `<span class="pct-badge ${cls}">${v.toFixed(2)}%</span>`;
    };

    const cell = (cls, v, colKey, bgId) => {
      const cleanBg = (bgId || "").toString().trim();
      return `<td class="${cls} ${Number(v) < 0 ? "neg" : ""}"
                  data-col="${colKey || ""}"
                  data-bg="${cleanBg}">
                ${v === null || v === undefined || v === "" ? "-" : toBaht(v)}
              </td>
            `;
    };

    rows.forEach((r) => {
      const tr = document.createElement("tr");
      const rawBgId = r.bg_expense_id != null ? String(r.bg_expense_id) : "";
      const bgId = rawBgId.trim(); // 👈 ตัดช่องว่างหัว–ท้ายให้หมด

      const pctIncome = r.income_used > 0 ? (r.income_check / r.income_used) * 100 : 0;
      const pctBkk = r.bkk_used > 0 ? (r.bkk_check / r.bkk_used) * 100 : 0;
      const pctGov = r.gov_used > 0 ? (r.gov_check / r.gov_used) * 100 : 0;
      const pctSavings = r.Savings_used > 0 ? (r.Savings_check / r.Savings_used) * 100 : 0;
      // html += `<td style="text-align:center;">${r.no}</td>`;

      // ${cell("col-income text-right", r.income_paid)}
      // ${cell("col-bkk text-right", r.bkk_paid)}
      // ${cell("col-gov text-right", r.gov_paid)}
      // ${cell("col-Savings text-right", r.Savings_paid)}

      tr.innerHTML = `
      <td class="sticky-col text-center">${r.no}</td>
      <td class="sticky-col text-left" data-bg="${bgId}" data-col="desc">${r.bg_expense}</td>


      ${cell("col-income text-right", r.income_used, "income_used", bgId)}
      ${cell("col-income text-right", r.income_check, "income_check", bgId)}
      ${cell("col-income text-right", r.income_left, "income_left", bgId)}
      <td class="col-income text-center" data-bg="${bgId}" data-col="income_pct">${pctBadge(pctIncome)}</td>


      ${cell("col-bkk text-right", r.bkk_used, "bkk_used", bgId)}
      ${cell("col-bkk text-right", r.bkk_check, "bkk_check", bgId)}
      ${cell("col-bkk text-right", r.bkk_left, "bkk_left", bgId)}
      <td class="col-bkk text-center" data-bg="${bgId}" data-col="bkk_pct">${pctBadge(pctBkk)}</td>

      ${cell("col-gov text-right", r.gov_used, "gov_used", bgId)}
      ${cell("col-gov text-right", r.gov_check, "gov_check", bgId)}
      ${cell("col-gov text-right", r.gov_left, "gov_left", bgId)}
      <td class="col-gov text-center" data-bg="${bgId}" data-col="gov_pct">${pctBadge(pctGov)}</td>

      ${cell("col-Savings text-right", r.Savings_used, "sav_used", bgId)}
      ${cell("col-Savings text-right", r.Savings_check, "sav_check", bgId)}
      ${cell("col-Savings text-right", r.Savings_left, "sav_left", bgId)}
      <td class="col-Savings text-center" data-bg="${bgId}" data-col="sav_pct">${pctBadge(pctSavings)}</td>
      `;

      tbody.appendChild(tr);
      tr.addEventListener("dblclick", function (e) {
        // ถ้ามันเป็นการดับเบิลคลิกที่ TD ด้านใน เราจะให้ข้อมูลละเอียดกว่า
        const td = e.target.closest("td");
        const col = td ? td.dataset.col : "";
        console.log(td);
        const bg = td ? td.dataset.bg : "";

        // ปีที่เลือกปัจจุบัน
        const yearTh = document.getElementById("budget_year_filter")?.value || "";
        const yearEn = yearTh ? yearTh - 543 : "";
        console.log(bg);
        console.log(col);
        // ถ้ามีทั้ง bg และ col แสดงว่าเขาคลิกคอลัมน์เฉพาะ
        if (bg && col) {
          const cleanBg = bg.toString().trim();
          const cleanCol = col.toString().trim();
          const url = `/supplies/bi/reports/Rep_DetailByTypeV4.php?bg_expense_id=${encodeURIComponent(cleanBg)}&col=${encodeURIComponent(cleanCol)}&year_th=${yearTh}&year_en=${yearEn}`;
          window.open(url, "_blank");
        } else {
          // กรณีคลิกพื้นที่ว่างของแถว → ใช้แบบเดิม
          window.open(`detail.php?type=dataview&name=${encodeURIComponent(r.bg_expense)}`, "_blank");
        }
      });
    });
  }

  /* ---------- Export ---------- */
  function exportExcel() {
    const rows = [];
    rows.push([
      "หมวดหมู่",
      "รายได้-ที่ใช้ไป",
      "รายได้-ตรวจรับแล้ว",
      "รายได้-เบิกแล้ว",
      "รายได้-คงเหลือ",
      "อุดหนุนกทม.-ที่ใช้ไป",
      "อุดหนุนกทม.-ตรวจรับแล้ว",
      "อุดหนุนกทม.-เบิกแล้ว",
      "อุดหนุนกทม.-คงเหลือ",
      "อุดหนุนรัฐ.-ที่ใช้ไป",
      "อุดหนุนรัฐ.-ตรวจรับแล้ว",
      "อุดหนุนรัฐ.-เบิกแล้ว",
      "อุดหนุนรัฐ.-คงเหลือ",
    ]);

    $("#dvBody tr").each(function () {
      const tds = $(this)
        .find("td")
        .map((_, td) => ($(td).text().trim() === "-" ? 0 : $(td).text().replace(/,/g, "")))
        .get();
      rows.push(tds);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "DataView");
    XLSX.writeFile(wb, "dataview.xlsx");
  }

  function filterDetailForTable(rows, { year = "all", ids = [] } = {}) {
    return rows.filter((r) => {
      if (year !== "all" && String(r.budget_year) !== String(year)) return false;
      if (ids && ids.length && !ids.includes(String(r.dc_expense_budget_type_id))) return false;
      return true;
    });
  }

  /* ---------- Refresh ทั้งหน้า ---------- */
  function renderCharts() {
    const year = $("#budget_year_filter").val() || "all";
    const ids = $("#multiCheckCombo").val() || [];
    const eqOnly = $("#filter_equipment").is(":checked");
    const items = pickBudget(year, ids, eqOnly);
    CURRENT_ITEMS_FOR_DV = items;

    buildSummary(items);
    renderBar(items);
    renderBarHigh(items);
    const detailForTable = filterDetailForTable(window.DATA_BUDGET, { year, ids });
    renderDataView(detailForTable);
  }

  function refreshAll() {
    // รีเฟรช multi เมื่อเปลี่ยนปี
    const year = $("#budget_year_filter").val();
    if (refreshAll.lastYear !== year) {
      const $multi = $("#multiCheckCombo");
      $multi.empty();
      const seen = new Set();
      window.DATA_BUDGET.forEach((it) => {
        if (year !== "all" && String(it.budget_year) !== String(year)) return;
        if (!seen.has(it.dc_expense_budget_type_id)) {
          seen.add(it.dc_expense_budget_type_id);
          $multi.append(new Option(it.c_name, it.dc_expense_budget_type_id));
        }
      });
      $multi.selectpicker("refresh");
      refreshAll.lastYear = year;
    }
    renderCharts();
  }

  /* ---------- DOM Ready ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    // restore dark mode
    setDark(getDark());
    const darkToggle = document.getElementById("darkToggle");
    if (darkToggle) darkToggle.checked = getDark();

    // สร้าง dropdown ปี + ได้ค่าเริ่มต้น
    const init = initYearSelect();
    const year_th = init?.year_th_init || String(new Date().getFullYear() + 543);
    const year_en = init?.year_en_init || String(new Date().getFullYear());

    // โหลดข้อมูลตามปี
    loadAll({ year_th, year_en });
  });
})();
