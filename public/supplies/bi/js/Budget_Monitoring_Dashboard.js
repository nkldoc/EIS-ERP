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
  let chartDonut;
  let DONUT_ITEMS = [];
  let DONUT_SELECTED = -1; // -1 = ยังไม่ได้เลือก → แสดงผลรวมทุกแหล่งเงิน

  // นิยาม "รวมทุกแหล่งเงิน" = รวมเฉพาะ 4 แหล่งเงินนี้เท่านั้น (ไม่ใช่ทุก dc_expense_budget_type_id ที่มีในข้อมูลดิบ)
  const CANONICAL_FUND_SOURCE_NAMES = ["เงินรายได้ส่วนงาน", "เงินอุดหนุนรัฐบาล", "เงินอุดหนุนกทม.", "เงินสะสมส่วนงาน"];
  window.CANONICAL_FUND_SOURCE_NAMES = CANONICAL_FUND_SOURCE_NAMES;

  // หา dc_expense_budget_type_id ของ 4 แหล่งเงินหลักจาก DATA_BUDGET ที่โหลดมาจริง
  function getCanonicalFundSourceIds() {
    const ids = new Set();
    (window.DATA_BUDGET || []).forEach((r) => {
      if (CANONICAL_FUND_SOURCE_NAMES.includes(String(r.c_name || "").trim())) {
        ids.add(String(r.dc_expense_budget_type_id));
      }
    });
    return Array.from(ids);
  }
  window.getCanonicalFundSourceIds = getCanonicalFundSourceIds;

  // แปลง ids ที่ผู้ใช้เลือกให้เป็น "รายการที่จะใช้กรองจริง"
  // - ถ้าผู้ใช้เลือกแหล่งเงินไว้ (ids ไม่ว่าง) ใช้ตามที่เลือก
  // - ถ้ายังไม่ได้เลือกเลย (ids ว่าง = "รวมทุกแหล่งเงิน") ให้ fallback เป็น 4 แหล่งเงินหลักเท่านั้น
  //   แทนที่จะรวมทุก dc_expense_budget_type_id ที่มีอยู่ในข้อมูลดิบ
  function resolveFundSourceIds(ids) {
    if (ids && ids.length) return ids.map(String);
    return getCanonicalFundSourceIds();
  }
  window.resolveFundSourceIds = resolveFundSourceIds;

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

  /* ---------- โหลดข้อมูลจาก API ---------- */
  function loadAll(params = {}) {
    Ext.Ajax.request({
      url: "../api/List_Rep_Budget_Monitoring_Dashboard.php",
      method: "GET",
      params: { fn: "List_QueryParam", ...params },
      success: function (resp) {
        const o = Ext.decode(resp.responseText || "{}");
        window.DATA_BUDGET = Array.isArray(o.data) ? o.data : [];
        window.DATA_STATUS = Array.isArray(o.data2) ? o.data2 : [];

        initUIAndRender();

        const pl = document.getElementById("pageLoader");
        if (pl) pl.style.display = "none";
      },
      failure: function () {
        const pl = document.getElementById("pageLoader");
        if (pl) pl.style.display = "none";
        Ext.Msg.alert("Error", "ดึงข้อมูลไม่สำเร็จ");
      },
    });
  }
  // รวมข้อมูลละเอียด (ต่อ bg_expense_id) ให้เหลือระดับ "แหล่งเงิน" (dc_expense_budget_type / c_name)
function aggregateBySource(rows, { year = "all", ids = [] } = {}) {
    // ควบคุมลำดับให้สวยงาม
    const ORDER = ["เงินรายได้คณะแพทย์ฯ-โรงพยาบาล", "เงินอุดหนุนกทม.", "เงินอุดหนุนรัฐบาล", "เงินสะสมส่วนงาน"];
    const sortKey = (name) => {
      const i = ORDER.indexOf(name);
      return i === -1 ? 999 : i;
    };

    const map = new Map();
    const effectiveIds = resolveFundSourceIds(ids);
    rows.forEach((r) => {
        if (year !== "all" && String(r.budget_year) !== String(year)) return;
        // [FIX] ไม่ใช้ effectiveIds.length เป็นเงื่อนไขอีกต่อไป เพราะ resolveFundSourceIds() คืนค่าที่ตัดสินใจแล้วเสมอ
        // (ถ้าไม่พบแหล่งเงินหลักที่ตรงกันเลย effectiveIds จะว่าง ก็ควรไม่ผ่านตัวกรองเลย แทนที่จะกลายเป็น "ไม่กรองอะไรเลย")
        if (!effectiveIds.includes(String(r.dc_expense_budget_type_id))) return;

        const name    = r.dc_expense_budget_type || r.c_name || "ไม่ทราบแหล่งเงิน";
        const total = Number(r.f_budget_real) || 0;
        const booked  = Number(r.f_reserve_total) || 0;
        const insp    = Number(r.f_reserve_check_total) || 0; // เงินจองตรวจรับ (i_reserve=3, i_finish=0)
        const working = Number(r.f_paid_total) || 0;
        const d1 = Number(r.f_d1_not_finish) || 0;


        const remain = Number(r.dc_expense_budget_type_id) === 5
    ? Math.max(0, total - booked) - insp - working - d1
    : total - booked - insp - working - d1;
        const cur = map.get(name) || { name, typeId: Number(r.dc_expense_budget_type_id) || 0, total: 0, booked: 0, insp: 0, working: 0, d1: 0, remain: 0 };
        cur.total   += total;
        cur.booked  += booked;
        cur.insp    += insp;
        cur.working += working;
        cur.d1      += d1;
        cur.remain  += remain;
        map.set(name, cur);
    });
return Array.from(map.values())
        .map((x) => ({ ...x, remain: x.remain }))
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

    /* [Comment] ปิดการใช้งาน dropdown filter "แหล่งเงิน" (multiCheckCombo) ตามที่ผู้ใช้ระบุ
       เพราะตอนนี้เลือกแหล่งเงินผ่านการ์ด/วงกลมโดนัทแทนแล้ว (ดู selectDonutSource/getEffectiveFundIds)
       คงโค้ดเดิมไว้ (comment ไว้) เผื่อจะเปิดกลับมาใช้ภายหลัง

    const $multi = $("#multiCheckCombo");
    $multi.empty();
    const seen = new Set();
    const defaultIds = [];

    // ค่าเริ่มต้น: เลือกเฉพาะ 4 แหล่งเงินนี้ (ผู้ใช้ยังเลือกเพิ่ม/ลดเองได้)
    const DEFAULT_NAMES = CANONICAL_FUND_SOURCE_NAMES;

    window.DATA_BUDGET.forEach((it) => {
      if (year !== "all" && String(it.budget_year) !== String(year)) return;
      if (!seen.has(it.dc_expense_budget_type_id)) {
        seen.add(it.dc_expense_budget_type_id);
        $multi.append(new Option(it.c_name, it.dc_expense_budget_type_id));
        if (DEFAULT_NAMES.includes(String(it.c_name || "").trim())) {
          defaultIds.push(String(it.dc_expense_budget_type_id));
        }
      }
    });

    $multi.selectpicker(); // init
    $multi.selectpicker("refresh");
    $multi.selectpicker("val", defaultIds);
    */

    renderStatusCards(window.DATA_STATUS);
    renderCharts();
    bindFiltersOnce();
  }

  function bindFiltersOnce() {
    // ป้องกัน bind ซ้ำ
    if (bindFiltersOnce.done) return;
    bindFiltersOnce.done = true;

    /* [Comment] ปิดการ bind event ของ dropdown filter "แหล่งเงิน" (multiCheckCombo/multiCheckComboBg) ไปพร้อมกับ UI ด้านบน
    const $multi = $("#multiCheckCombo");
    const $multibg = $("#multiCheckComboBg");
    $multi.on("changed.bs.select", refreshAll);
    $multibg.on("changed.bs.select", refreshAll);
    */

    $("#budget_year_filter, #filter_equipment").on("change", refreshAll);
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
    const effectiveIds = resolveFundSourceIds(ids);
    window.DATA_BUDGET.forEach((r) => {
      if (year !== "all" && String(r.budget_year) !== String(year)) return;
      if (!effectiveIds.includes(String(r.dc_expense_budget_type_id))) return;
      // if (onlyEquipment && String(r.i_product_type1) !== "1") return;

      const total = Number(r.f_budget_real) || 0;
      const booked  = Number(r.f_reserve_total) || 0;
      const insp    = Number(r.f_reserve_check_total) || 0; // เงินจองตรวจรับ (i_reserve=3, i_finish=0)
      const working = Number(r.f_paid_total) || 0;
      const d1 = Number(r.f_d1_not_finish) || 0;
      const remain = Number(r.dc_expense_budget_type_id) === 5
    ? Math.max(0, total - booked) - insp - working - d1
    : total - booked - insp - working - d1;

      out.push({
        id: r.dc_expense_budget_type_id,
        name: r.c_name,
        bg_expense: r.bg_expense,
        bg_expense_id: r.bg_expense_id,
        total,
        booked,
        insp,
        working,
        remain,
      });
    });
    return out;
  }
  function buildSummary(items) {
    const sumAll = items.reduce((s, it) => s + it.total, 0);
    const sumBooked = items.reduce((s, it) => s + it.booked, 0);
    const sumInsp = items.reduce((s, it) => s + it.insp, 0);
    const sumPaid = items.reduce((s, it) => s + it.working, 0);
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
        <div class="text-xs text-muted">* รวม PO ที่ยังไม่ได้เบิกจ่าย เมื่อเบิกแล้วยอดจะลดลงอัตโนมัติ</div>
      </div>
        <div class="summary-item">
          <span class="summary-label">เงินจองตรวจรับ</span>
          <div class="summary-value insp" style="color:#6f42c1">${toBaht(sumInsp)}</div>
        </div>
        <div class="summary-item">
          <span class="summary-label">เบิกจ่ายแล้ว</span>
          <div class="summary-value paid">${toBaht(sumPaid)}</div>
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
      // ลำดับ/สีตามที่ user ระบุ: น้ำเงิน=งบรวม, เขียว=จองเงิน/ใช้ไปแล้ว, เหลือง=เบิกจ่ายแล้ว, ม่วง=เงินจองตรวจรับ, ส้ม=คงเหลือ
      legend: [{ data: ["จำนวนงบประมาณ", "จองเงิน / ใช้ไปแล้ว", "เบิกจ่ายแล้ว", "เงินจองตรวจรับ", "คงเหลือหลังจองเงิน"], top: "2%", left: "30%" }],
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
          restore: {},
        },
      },
      grid: { left: 10, right: 20, top: 50, bottom: 10, containLabel: true },
      xAxis: { type: "category", data: items.map((x) => x.name), axisLabel: { interval: 0 } },
      yAxis: { type: "value" },
      series: [
        {
          // จองเงิน / ใช้ไปแล้ว
          name: "จองเงิน / ใช้ไปแล้ว",
          type: "bar",
          stack: "flow",
          barWidth: "45%",
          data: items.map((x) => x.booked),
          itemStyle: { color: "#4caf50" },
          label: { show: true, position: "inside", formatter: (p) => (p.value ? echarts.format.addCommas(fmt2(p.value)) : "") },
        },
        {
          // เบิกจ่ายแล้ว
          name: "เบิกจ่ายแล้ว",
          type: "bar",
          stack: "flow",
          barWidth: "45%",
          data: items.map((x) => x.working),
          itemStyle: { color: "#ffc107" },
          label: { show: true, position: "inside", formatter: (p) => (p.value ? echarts.format.addCommas(fmt2(p.value)) : "") },
        },
        {
          // เงินจองตรวจรับ
          name: "เงินจองตรวจรับ",
          type: "bar",
          stack: "flow",
          barWidth: "45%",
          data: items.map((x) => x.insp),
          itemStyle: { color: "#6f42c1" },
          label: { show: true, position: "inside", formatter: (p) => (p.value ? echarts.format.addCommas(fmt2(p.value)) : "") },
        },
        {
          // คงเหลือ (ถ้าติดลบ = ใช้เกินงบ แท่งจะยื่นลงใต้เส้นศูนย์โดยอัตโนมัติ)
          name: "คงเหลือหลังจองเงิน",
          type: "bar",
          stack: "flow",
          barWidth: "45%",
          data: items.map((x) => x.remain),
          itemStyle: { color: "#ff9800" },
          label: {
            show: true,
            position: "inside",
            formatter: (p) => (p.value ? echarts.format.addCommas(fmt2(p.value)) : ""),
          },
          // label "งบรวม" ตัวหนาสีน้ำเงินลอยเหนือยอดแท่ง (ไม่ใช่แท่งซ้อนทับ)
          markPoint: {
            symbol: "roundRect",
            symbolSize: [0, 0],
            itemStyle: { color: "transparent" },
            label: {
              show: true,
              position: "top",
              distance: 8,
              fontWeight: "bold",
              color: "#3f51b5",
              fontSize: 13,
              formatter: (p) => "งบรวม " + echarts.format.addCommas(fmt2(items[p.dataIndex].total)),
            },
            data: items.map((x, i) => ({
              coord: [i, Math.max(x.booked + x.working + x.insp + x.remain, x.booked + x.working + x.insp, 0)],
            })),
          },
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
    const year = $("#budget_year_filter").val() || "all";
    const ids = $("#multiCheckCombo").val() || [];

    const rows = window.DATA_BUDGET && window.DATA_BUDGET.length ? window.DATA_BUDGET : itemsRaw || [];
    const items = aggregateBySource(rows, { year, ids });

    const dom = document.getElementById("pie_tor_type");
    const chart = echarts.init(dom);

    const names = items.map((x) => x.name);
    const seriesData = items.map((x) => {
        const total = Number(x.total) || 0;
        const booked = Number(x.booked) || 0;
        const pct = total > 0 ? +((booked / total) * 100).toFixed(2) : 0;
        return {
            name: x.name,
            value: pct,
            itemStyle: {
                color: pickColorBySource(x.name),
                borderColor: "#111",
                borderWidth: 1
            }
        };
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
                const pct = ps[0].value;
                return `<b>${names[i]}</b><br/>งบทั้งหมด: ${toBaht(total)}<br/>จองเงิน/ใช้ไปแล้ว: ${toBaht(booked)}<br/><b>${pct}%</b>`;
            },
        },
        grid: { left: '55%', right: '12%', top: 50, bottom: 10, containLabel: false }, // ✅ แก้ตรงนี้
        xAxis: {
            type: 'value',
            min: 0,
            max: 100,
            axisLabel: { formatter: "{value} %" }
        },
        yAxis: {
            type: 'category',
            data: names,
            axisLabel: {
                interval: 0,
                width: 220,        // ✅ เพิ่มตรงนี้
                overflow: 'break', // ✅ เพิ่มตรงนี้
                fontSize: 11
            }
        },
        series: [{
            type: 'bar',
            data: seriesData,
            barMaxWidth: 35,   // ✅ เพิ่มตรงนี้
            label: {
                show: true,
                position: 'right',
                formatter: '{c}%'
            }
        }],
    };

    chart.clear();
    chart.setOption(option, true);
    chart.off("click");
    chart.on("click", (p) => window.open(`detail.php?type=bar&name=${encodeURIComponent(p.name)}`, "_blank"));
}

  /* ---------- Donut: สัดส่วนงบตามแหล่งเงิน ---------- */
  // สีตามตัวอย่างที่กำหนด: รายได้=น้ำเงิน, สะสม=เขียว, อุดหนุนกทม.=ส้ม, อุดหนุนรัฐบาล=เหลือง/ทอง
  function donutColorFor(name) {
    if (name.includes("รายได้")) return "#2a78d6";
    if (name.includes("สะสม")) return "#1baf7a";
    if (name.includes("กทม") || name.includes("กรุงเทพ")) return "#eb6834";
    if (name.includes("รัฐบาล")) return "#eda100";
    return "#9e9e9e";
  }

  function usedPct(it) {
    return it.total > 0 ? (((it.booked + it.insp + it.working) / it.total) * 100).toFixed(1) : "0.0";
  }
  function sharePct(it, grandTotal) {
    return grandTotal > 0 ? ((it.total / grandTotal) * 100).toFixed(2) : "0.00";
  }

  // เลือกสีตัวหนังสือให้อ่านง่ายบนพื้นแต่ละสี (สีเหลือง/ทองใช้ตัวหนังสือเข้ม สีอื่นใช้ขาว)
  function donutLabelColorFor(bgColor) {
    return bgColor === "#eda100" ? "#3d2b00" : "#ffffff";
  }

  /* ---------- ซิงก์ PR/PO section (PrPoChartSection.js) กับแหล่งเงินที่เลือกในโดนัท ---------- */
  function syncPrPoWithDonutSelection() {
    const badge = document.getElementById("prpoDonutFilterBadge");

    if (DONUT_SELECTED === -1) {
      if (badge) badge.style.display = "none";
      if (typeof window.loadPrPoSection === "function") {
        const yearTh = $("#budget_year_filter").val() || String(new Date().getFullYear() + 543);
        const yearEn = String(Number(yearTh) - 543);
        window.loadPrPoSection({ year_th: yearTh, year_en: yearEn });
      }
      return;
    }

    const it = DONUT_ITEMS[DONUT_SELECTED];
    if (!it) return;

    if (badge) {
      badge.textContent = "กรองตาม: " + it.name;
      badge.style.display = "inline-block";
    }
    if (typeof window.loadPrPoSection === "function") {
      const yearTh = $("#budget_year_filter").val() || String(new Date().getFullYear() + 543);
      const yearEn = String(Number(yearTh) - 543);
      window.loadPrPoSection({ year_th: yearTh, year_en: yearEn, override_type_ids: [it.typeId] });
    }
  }

  // เลือก/ยกเลิกเลือกแหล่งเงินในโดนัท แล้วรีเรนเดอร์ทุกส่วนที่เกี่ยวข้อง (กราฟ + การ์ด + รายละเอียด + Data View)
  function selectDonutSource(idx) {
    DONUT_SELECTED = idx;
    renderDonut();
    syncPrPoWithDonutSelection();
    refreshDataView(); // Data View เหลือเฉพาะแหล่งเงินที่เลือกจากการ์ด/วงกลมโดนัท
  }

  function renderDonut(itemsRaw) {
    const dom = document.getElementById("donut_source");
    if (!dom) return; // ไม่มี element ก็ข้าม (เผื่อหน้าอื่นไม่ได้ใส่ donut)

    const year = $("#budget_year_filter").val() || "all";
    const ids = $("#multiCheckCombo").val() || [];
    const rows = window.DATA_BUDGET && window.DATA_BUDGET.length ? window.DATA_BUDGET : itemsRaw || [];
    const items = aggregateBySource(rows, { year, ids });

    DONUT_ITEMS = items;
    if (DONUT_SELECTED >= items.length) DONUT_SELECTED = -1;

    const grandTotal = items.reduce((s, it) => s + it.total, 0);
    const selectedItem = DONUT_SELECTED !== -1 ? items[DONUT_SELECTED] : null;

    // อัปเดตตัวเลขงบรวมกลางวงกลม (ใช้ HTML overlay แทน text บน canvas เพื่อให้อ่านชัดในทุกธีม)
    // ถ้าเลือกแหล่งเงินไว้ ให้โชว์ยอดของแหล่งเงินนั้น ไม่ใช่ยอดรวมทุกแหล่ง
    const centerVal = document.getElementById("donutCenterValue");
    if (centerVal) {
      // แสดงตัวเลขเต็ม ไม่ปัดเป็นล้านบาท เช่น 131,750,700.00
      const centerBase = selectedItem ? selectedItem.total : grandTotal;
      centerVal.textContent = toBaht(centerBase);
    }

    if (!chartDonut) chartDonut = echarts.init(dom);
    else chartDonut.clear();

    // โหมดภาพรวม: วงกลมแบ่งตามสัดส่วนของทุกแหล่งเงิน
    // โหมดเลือกแล้ว: วงกลมของแหล่งเงินนั้นแหล่งเดียว แบ่งเป็น "ใช้ไปแล้ว" กับ "คงเหลือ"
    const seriesData = selectedItem
      ? (() => {
          const bg = donutColorFor(selectedItem.name);
          const used = selectedItem.booked + selectedItem.insp + selectedItem.working;
          const remain = Math.max(0, selectedItem.total - used);
          return [
            {
              name: "ใช้ไปแล้ว",
              value: used,
              itemStyle: { color: bg },
              label: { color: "#000000" },
            },
            {
              name: "คงเหลือ",
              value: remain,
              itemStyle: { color: "#c9c9c9" },
              label: { color: "#000000" },
            },
          ];
        })()
      : items.map((it) => {
          const bg = donutColorFor(it.name);
          return {
            name: it.name,
            value: it.total,
            itemStyle: { color: bg },
            label: { color: "#000000" },
          };
        });

    const option = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        formatter: (p) => {
          if (selectedItem) {
            return `<b>${selectedItem.name}</b><br/>${p.name}: ${toBaht(p.value)} บาท (${p.percent}%)`;
          }
          const it = items[p.dataIndex];
          return `<b>${it.name}</b><br/>${toBaht(it.total)} บาท<br/>ใช้ไปแล้ว ${usedPct(it)}%`;
        },
      },
      series: [
        {
          type: "pie",
          radius: ["58%", "80%"],
          center: ["50%", "50%"],
          avoidLabelOverlap: true,
          itemStyle: { borderColor: "#1e1e1e", borderWidth: 2 },
          label: {
            show: true,
            position: "inside",
            // แสดงชื่อแหล่งเงิน + % ทุกสไลซ์เสมอ (ไม่ซ่อนชื่อแม้สไลซ์เล็ก) ให้ตัวหนังสือขึ้นบรรทัดใหม่แทนการตัดทิ้งถ้าพื้นที่ไม่พอ
            formatter: (p) => {
              if (selectedItem) {
                return `${p.name}\n${p.percent}%`;
              }
              const it = items[p.dataIndex];
              const pct = sharePct(it, grandTotal);
              return `${it.name}\n${pct}%`;
            },
            color: "#000000",
            fontSize: 11,
            fontWeight: 600,
            lineHeight: 14,
            overflow: "break",
          },
          labelLine: { show: false },
          data: seriesData,
        },
      ],
    };

    chartDonut.setOption(option, true);
    chartDonut.off("click");
    chartDonut.on("click", (p) => {
      if (selectedItem) {
        // อยู่ในโหมดแหล่งเงินเดียวอยู่แล้ว คลิกซ้ำ = กลับไปดูภาพรวมทุกแหล่งเงิน
        selectDonutSource(-1); // renderDonut() ข้างในจะรีเฟรชทั้งกราฟ การ์ด และรายละเอียดให้เอง
      } else if (typeof p.dataIndex === "number") {
        selectDonutSource(p.dataIndex);
      }
    });

    renderDonutCards();
    renderDonutDetail();
  }

  function renderDonutCards() {
    const box = document.getElementById("donutCards");
    if (!box) return;
    const grandTotal = DONUT_ITEMS.reduce((s, it) => s + it.total, 0);
    box.innerHTML = "";

    // การ์ด "รวมทุกแหล่งเงิน" — ค่าเริ่มต้นเมื่อยังไม่ได้เลือกแหล่งเงินใด
    const allDiv = document.createElement("div");
    allDiv.className = "donut-card donut-card-all" + (DONUT_SELECTED === -1 ? " selected" : "");
    allDiv.style.borderColor = DONUT_SELECTED === -1 ? "#495057" : "transparent";
    const allUsedPct = grandTotal > 0
      ? (((DONUT_ITEMS.reduce((s, it) => s + it.booked + it.insp + it.working, 0)) / grandTotal) * 100).toFixed(1)
      : "0.0";
    allDiv.innerHTML =
      '<div class="donut-card-name"><span class="donut-dot" style="background:#495057"></span>รวมทุกแหล่งเงิน</div>' +
      '<div class="donut-card-total" style="color:#495057">' + toBaht(grandTotal) + "</div>" +
      '<div class="donut-card-sub">100.00% ของงบรวม &middot; ใช้ไปแล้ว ' + allUsedPct + "%</div>";
    allDiv.addEventListener("click", () => {
      selectDonutSource(-1); // renderDonut() ข้างในจะรีเฟรชทั้งกราฟ การ์ด และรายละเอียดให้เอง
    });
    box.appendChild(allDiv);

    DONUT_ITEMS.forEach((it, i) => {
      const color = donutColorFor(it.name);
      const div = document.createElement("div");
      div.className = "donut-card" + (i === DONUT_SELECTED ? " selected" : "");
      div.style.borderColor = i === DONUT_SELECTED ? color : "transparent";
      div.innerHTML =
        '<div class="donut-card-name"><span class="donut-dot" style="background:' + color + '"></span>' + it.name + "</div>" +
        '<div class="donut-card-total" style="color:' + color + '">' + toBaht(it.total) + "</div>" +
        '<div class="donut-card-sub">' + sharePct(it, grandTotal) + "% ของงบรวม &middot; ใช้ไปแล้ว " + usedPct(it) + "%</div>";
      div.addEventListener("click", () => {
        selectDonutSource(i); // renderDonut() ข้างในจะรีเฟรชทั้งกราฟ การ์ด และรายละเอียดให้เอง
      });
      box.appendChild(div);
    });
  }

  function renderDonutDetail() {
    const titleEl = document.getElementById("donutDetailTitle");
    const box = document.getElementById("donutDetailStats");
    if (!titleEl || !box) return;

    // ยังไม่ได้เลือกแหล่งเงิน → แสดงผลรวมของทุกแหล่งเงินที่กรองอยู่
    if (DONUT_SELECTED === -1) {
      const sum = DONUT_ITEMS.reduce(
        (s, it) => ({
          total: s.total + it.total,
          booked: s.booked + it.booked,
          insp: s.insp + it.insp,
          working: s.working + it.working,
          remain: s.remain + it.remain,
        }),
        { total: 0, booked: 0, insp: 0, working: 0, remain: 0 }
      );
      titleEl.textContent = "รายละเอียดของ รวมทุกแหล่งเงิน";
      const stats = [
        { label: "งบประมาณรวม", val: sum.total, color: "#495057" },
        { label: "จองเงินแล้ว", val: sum.booked, color: "#4caf50" },
        { label: "เงินจองตรวจรับ", val: sum.insp, color: "#6f42c1" },
        { label: "เบิกจ่ายแล้ว", val: sum.working, color: "#ffc107" },
        { label: "คงเหลือ", val: sum.remain, color: sum.remain < 0 ? "#e74c3c" : "#ff9800" },
      ];
      box.innerHTML = stats
        .map(
          (s) =>
            '<div class="donut-stat"><div class="donut-stat-label">' + s.label + '</div>' +
            '<div class="donut-stat-val" style="color:' + s.color + '">' + toBaht(s.val) + "</div></div>"
        )
        .join("");
      return;
    }

    const it = DONUT_ITEMS[DONUT_SELECTED];
    if (!it) return;

    titleEl.textContent = "รายละเอียดของ " + it.name;
    const stats = [
      { label: "งบรวม", val: it.total, color: donutColorFor(it.name) },
      { label: "จองเงิน / ใช้ไปแล้ว", val: it.booked, color: "#4caf50" },
      { label: "เงินจองตรวจรับ", val: it.insp, color: "#6f42c1" },
      { label: "เบิกจ่ายแล้ว", val: it.working, color: "#ffc107" },
      { label: "คงเหลือ", val: it.remain, color: it.remain < 0 ? "#e74c3c" : "#ff9800" },
    ];
    box.innerHTML = stats
      .map(
        (s) =>
          '<div class="donut-stat"><div class="donut-stat-label">' + s.label + '</div>' +
          '<div class="donut-stat-val" style="color:' + s.color + '">' + toBaht(s.val) + "</div></div>"
      )
      .join("");
  }

  /* ---------- Data View (HTML table) ---------- */
  /* ---------- Data View (HTML table) ---------- */
  function makeDetailRows(items) {
    const byExp = new Map();
    items.forEach((it) => {
      const src = (it.c_name || "").trim();

// แก้เป็น — สำหรับ type 4,5 ใช้ f_budget_display เสมอ
  const budget = Number(it.f_budget_display) || Number(it.f_budget_real) || 0;
      // ใช้ f_reserve_actual (= f_pr_total + f_po_total จากการจองจริง) เพื่อให้ตรงกับรายงาน Rep_BudgetDetail
      const used  = Number(it.f_reserve_actual) || 0;
    const check = Number(it.f_reserve_actual) || 0;
    // เงินจองตรวจรับ = ตรวจรับแล้วแต่ยังไม่เบิกจ่าย (i_reserve = 3 AND i_finish = 0)
    // เดิมใช้ f_po_total (i_reserve = 2) ผิด เพราะยอดนั้นถูกนับรวมอยู่ใน f_reserve_actual/used อยู่แล้ว
    const insp  = Number(it.f_reserve_check_total) || 0;
     
      const paid        = Number(it.f_paid_total) || 0;
      const d1notfinish = Number(it.f_d1_not_finish) || 0;
      // ต้องหักเงินจองตรวจรับ (insp) ออกจากคงเหลือด้วย ไม่งั้นคงเหลือจะสูงเกินจริง
      const left        = Math.round((budget - used - insp - paid - d1notfinish) * 100) / 100;

      const key = String(it.bg_expense_id || "");
      if (!byExp.has(key)) {
        byExp.set(key, {
          no: it.no || "", // ใช้ลำดับที่มาจากฝั่ง PHP
          bg_expense: it.bg_expense || "-",
          bg_expense_id: it.bg_expense_id || "",

          // dc_expense_budget_type_id: (it.dc_expense_budget_type_id ? "  " : "") + (it.dc_expense_budget_type_id || "-"),
          // dc_expense_budget_type: (it.c_name ? "  " : "") + (it.c_name || "-"),

          // เก็บ id แยกตาม “ประเภทแหล่งเงิน”
          income_type_id: "",
          bkk_type_id: "",
          gov_type_id: "",
          savings_type_id: "",

          // เงินรายได้
          income_used: 0,
          income_check: 0,
          income_insp: 0,
          income_paid: 0,
          income_left: 0,
          income_note: [],
          // อุดหนุน กทม.
          bkk_used: 0,
          bkk_check: 0,
          bkk_insp: 0,
          bkk_paid: 0,
          bkk_left: 0,
          bkk_note: [],
          // อุดหนุน รัฐบาล
          gov_used: 0,
          gov_check: 0,
          gov_insp: 0,
          gov_paid: 0,
          gov_left: 0,
          gov_note: [],
          // อุดหนุน สะสมส่วนงาน
          Savings_used: 0,
          Savings_check: 0,
          Savings_insp: 0,
          Savings_paid: 0,
          Savings_left: 0,
          Savings_note: [],
        });
      }
    const row = byExp.get(key); 
      if (src.includes("รายได้")) {
        row.income_used  += budget;  // ← แก้จาก used เป็น budget
        row.income_check += used;    // ← แก้จาก check เป็น used
        row.income_insp  += insp;
        row.income_paid  += paid;
        row.income_left  += left;
        row.income_type_id = String(it.dc_expense_budget_type_id || "").trim();
        if (it.transfer_note) row.income_note.push(it.transfer_note);
      } else if (src.includes("กทม")) {
        row.bkk_used  += budget;     // ← แก้
        row.bkk_check += used;       // ← แก้
        row.bkk_insp  += insp;
        row.bkk_paid  += paid;
        row.bkk_left  += left;
        row.bkk_type_id = String(it.dc_expense_budget_type_id || "").trim();
        if (it.transfer_note) row.bkk_note.push(it.transfer_note);
    } else if (src.includes("รัฐบาล")) {
    row.gov_used  += budget;
    row.gov_check += used;
    row.gov_insp  += insp;
    row.gov_paid  += paid;   // ← แก้: ไม่แสดง f_paid_total ในคอลัมน์นี้
    row.gov_left  += Math.round((budget - used - insp - paid) * 100) / 100;
    row.gov_type_id = String(it.dc_expense_budget_type_id || "").trim();
    if (it.transfer_note) row.gov_note.push(it.transfer_note);
      } else {
        // fallback: แหล่งเงินที่ไม่ใช่รายได้/กทม/รัฐบาล → สะสมส่วนงาน
        row.Savings_used  += budget;
        row.Savings_check += used;
        row.Savings_insp  += insp;
        row.Savings_paid  += paid;
        row.Savings_left  += left;
        row.savings_type_id = String(it.dc_expense_budget_type_id || "").trim();
        if (it.transfer_note) row.Savings_note.push(it.transfer_note);
      }
    });
  // คืนค่าเป็นอาร์เรย์ เรียงตามลำดับ (no) ถ้ามี — รวมหมายเหตุแต่ละกลุ่มเป็นข้อความเดียว
    return Array.from(byExp.values())
      .map((r) => ({
        ...r,
        income_note: r.income_note.join(" / "),
        bkk_note: r.bkk_note.join(" / "),
        gov_note: r.gov_note.join(" / "),
        Savings_note: r.Savings_note.join(" / "),
      }))
      .sort((a, b) => {
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

    const cell = (cls, v, colKey, bgId, bgExId, note) => {
      const cleanBg = (bgId || "").toString().trim();
      const cleanExBg = (bgExId || "").toString().trim();
      const isNeg = Number(v) < 0;
      const noteHtml = isNeg && note ? `<div class="cell-note" style="color:#d9534f;">${note}</div>` : "";
      return `<td class="${cls} ${isNeg ? "neg" : ""}"
                  data-col="${colKey || ""}"
                  data-Exbg="${cleanExBg}"
                  data-bg="${cleanBg}">
                ${v === null || v === undefined || v === "" ? "-" : toBaht(v)}
                ${noteHtml}
              </td>
            `;
    };

    // Build full per-bg breakdown (ignore current filters) to support special-case overrides
    const fullByBg = {}; // bgId -> { sources: { income: {used,check,working}, bkk:..., gov:..., sav:... }, rawTotal, cutsTotal }
    const displayAdjMap = {}; // bgId -> display-only adjustments (do NOT write back to r.*)
    (window.DATA_BUDGET || []).forEach((it) => {
      const bgId = String(it.bg_expense_id || "").trim();
      if (!bgId) return;
      const src = (it.dc_expense_budget_type || it.c_name || "").trim();
      const raw = Number(it.f_budget_real) || Number(it.f_budget_display) || 0;
      const chk = Number(it.f_reserve_budget) || 0;
      const working = Number(it.f_paid_total) || 0;
      const planCut = Number(it.f_plan_cut_total) || 0;
      const periodCut = Number(it.f_period_cut_total) || 0;
      if (!fullByBg[bgId]) fullByBg[bgId] = { sources: { income: { used: 0, check: 0, working: 0 }, bkk: { used: 0, check: 0, working: 0 }, gov: { used: 0, check: 0, working: 0 }, sav: { used: 0, check: 0, working: 0 } }, rawTotal: 0, cutsTotal: 0, prTotal: 0 };
      const fb = fullByBg[bgId];
      if (src.includes("รายได้")) { fb.sources.income.used += raw; fb.sources.income.check += chk; fb.sources.income.working += working; }
      else if (src.includes("กทม")) { fb.sources.bkk.used += raw; fb.sources.bkk.check += chk; fb.sources.bkk.working += working; }
      else if (src.includes("รัฐบาล")) { fb.sources.gov.used += raw; fb.sources.gov.check += chk; fb.sources.gov.working += working; }
      else { fb.sources.sav.used += raw; fb.sources.sav.check += chk; fb.sources.sav.working += working; }
      fb.rawTotal += raw;
      fb.cutsTotal += (planCut + periodCut);
      fb.prTotal += Number(it.f_reserve_budget) || 0;
    });

    rows.forEach((r) => {
      const tr = document.createElement("tr");
      const rawBgId = r.bg_expense_id != null ? String(r.bg_expense_id) : "";
      const bgId = rawBgId.trim(); 

      // จุดที่ 1: เตรียมชุดข้อมูลที่รวมค่าเงินพัสดุทำเบิก (_paid) ไว้แสดงผล
      const display = {
        income_used: r.income_used,
        income_check: r.income_check,
        income_insp: r.income_insp,
        income_paid: r.income_paid,   // เพิ่มฟิลด์ทำเบิกรายได้ส่วนงาน
        income_left: r.income_left,
        bkk_used: r.bkk_used,
        bkk_check: r.bkk_check,
        bkk_insp: r.bkk_insp,
        bkk_paid: r.bkk_paid,         // เพิ่มฟิลด์ทำเบิกอุดหนุน กทม.
        bkk_left: r.bkk_left,
        gov_used: r.gov_used,
        gov_check: r.gov_check,
        gov_insp: r.gov_insp,
        gov_paid: r.gov_paid,         // เพิ่มฟิลด์ทำเบิกอุดหนุนรัฐบาล
        gov_left: r.gov_left,
        Savings_used: r.Savings_used,
        Savings_check: r.Savings_check,
        Savings_insp: r.Savings_insp,
        Savings_paid: r.Savings_paid, // เพิ่มฟิลด์ทำเบิกสะสมส่วนงาน
        Savings_left: r.Savings_left,
      };

      const pctIncome = display.income_used > 0 ? (display.income_check / display.income_used) * 100 : 0;
      const pctBkk = display.bkk_used > 0 ? (display.bkk_check / display.bkk_used) * 100 : 0;
      const pctGov = display.gov_used > 0 ? (display.gov_check / display.gov_used) * 100 : 0;
      const pctSavings = display.Savings_used > 0 ? (display.Savings_check / display.Savings_used) * 100 : 0;

      // จุดที่ 2: วาด HTML แถวตารางตาราง เพิ่มคอลัมน์ เงินพัสดุทำเบิก เข้าไปข้างหน้าคอลัมน์คงเหลือ
      tr.innerHTML = `
      <td class="sticky-col text-center">${r.no}</td>
      <td class="sticky-col text-left" data-bg="${bgId}" data-col="desc">${r.bg_expense}</td>

      ${cell("col-income text-right", display.income_used, "income_used", bgId, r.income_type_id, r.income_note)}
      ${cell("col-income text-right", display.income_check, "income_check", bgId, r.income_type_id)}
      ${cell("col-income text-right", display.income_insp, "income_insp", bgId, r.income_type_id)}
      ${cell("col-income text-right", display.income_paid, "income_paid", bgId, r.income_type_id)} 
      ${cell("col-income text-right", display.income_left, "income_left", bgId, r.income_type_id)}
      <td class="col-income text-center" data-bg="${bgId}" data-exbg="${r.income_type_id || ""}" data-col="income_pct">${pctBadge(pctIncome)}</td>

      ${cell("col-bkk text-right", display.bkk_used, "bkk_used", bgId, r.bkk_type_id, r.bkk_note)}
      ${cell("col-bkk text-right", display.bkk_check, "bkk_check", bgId, r.bkk_type_id)}
      ${cell("col-bkk text-right", display.bkk_insp, "bkk_insp", bgId, r.bkk_type_id)}
      ${cell("col-bkk text-right", display.bkk_paid, "bkk_paid", bgId, r.bkk_type_id)}       
      ${cell("col-bkk text-right", display.bkk_left, "bkk_left", bgId, r.bkk_type_id)}
      <td class="col-bkk text-center" data-bg="${bgId}" data-exbg="${r.bkk_type_id || ""}" data-col="bkk_pct">${pctBadge(pctBkk)}</td>

      ${cell("col-gov text-right", display.gov_used, "gov_used", bgId, r.gov_type_id, r.gov_note)}
      ${cell("col-gov text-right", display.gov_check, "gov_check", bgId, r.gov_type_id)}
      ${cell("col-gov text-right", display.gov_insp, "gov_insp", bgId, r.gov_type_id)}
      ${cell("col-gov text-right", display.gov_paid, "gov_paid", bgId, r.gov_type_id)}       
      ${cell("col-gov text-right", display.gov_left, "gov_left", bgId, r.gov_type_id)}
      <td class="col-gov text-center" data-bg="${bgId}" data-exbg="${r.gov_type_id || ""}" data-col="gov_pct">${pctBadge(pctGov)}</td>

      ${cell("col-Savings text-right", display.Savings_used, "sav_used", bgId, r.savings_type_id, r.Savings_note)}
      ${cell("col-Savings text-right", display.Savings_check, "sav_check", bgId, r.savings_type_id)}
      ${cell("col-Savings text-right", display.Savings_insp, "sav_insp", bgId, r.savings_type_id)}
      ${cell("col-Savings text-right", display.Savings_paid, "sav_paid", bgId, r.savings_type_id)} 
      ${cell("col-Savings text-right", display.Savings_left, "sav_left", bgId, r.savings_type_id)}
      <td class="col-Savings text-center" data-bg="${bgId}" data-exbg="${r.savings_type_id || ""}" data-col="sav_pct">${pctBadge(pctSavings)}</td>
      `;

      tbody.appendChild(tr);
      
      // จุดที่ 3: จัดการ Event ดับเบิ้ลคลิกแยกรายละเอียด ให้รองรับคอลัมน์ทำเบิกอันใหม่
      tr.addEventListener("dblclick", function (e) {
        const td = e.target.closest("td");
        const col = td ? td.dataset.col : "";
        const bg = td ? td.dataset.bg : "";
        const bgex = td ? td.dataset.exbg : "";

        const yearTh = document.getElementById("budget_year_filter")?.value || "";
        const yearEn = yearTh ? yearTh - 543 : "";

        if (bg && col) {
          // --- map col → prefix เพื่อดึงยอดจาก row ---
          const prefixMap = {
            income_used:  "income", income_check: "income", income_paid: "income", income_left: "income", income_pct: "income",
            bkk_used:     "bkk",    bkk_check:    "bkk",    bkk_paid:    "bkk",    bkk_left:    "bkk",    bkk_pct:    "bkk",
            gov_used:     "gov",    gov_check:    "gov",    gov_paid:    "gov",    gov_left:    "gov",    gov_pct:    "gov",
            sav_used:     "Savings",sav_check:    "Savings",sav_paid:    "Savings",sav_left:    "Savings",sav_pct:    "Savings",
          };
          const prefix = prefixMap[col] || "";

          // ยอดเงินตรงๆ จาก row data สำหรับแหล่งเงินที่คลิก
          const fBudget    = prefix ? (display[prefix + "_used"]  || 0) : 0;
          const fReserve   = prefix ? (display[prefix + "_check"] || 0) : 0;
          const fRemaining = prefix ? (display[prefix + "_left"]  || 0) : 0;

          // col ที่ส่งไป PHP: budget | reserve | paid | remaining
          const colTypeMap = {
            income_used:  "budget",    bkk_used:  "budget",    gov_used:  "budget",    sav_used:  "budget",
            income_check: "reserve",   bkk_check: "reserve",   gov_check: "reserve",   sav_check: "reserve",
            income_paid:  "paid",      bkk_paid:  "paid",      gov_paid:  "paid",      sav_paid:  "paid",      
            income_left:  "remaining", bkk_left:  "remaining", gov_left:  "remaining", sav_left:  "remaining",
            income_pct:   "reserve",   bkk_pct:   "reserve",   gov_pct:   "reserve",   sav_pct:   "reserve",
          };
          const colType = colTypeMap[col] || "reserve";

          const dcCostId = new URLSearchParams(window.location.search).get("dc_cost_id") || "38";

          const url = `/supplies/bi/reports/Rep_DetailByTypeV5.php`
            + `?bg_expense_id=${encodeURIComponent(bg)}`
            + `&dc_expense_budget_type_id=${encodeURIComponent(bgex)}`
            + `&col=${encodeURIComponent(colType)}`
            + `&year_th=${yearTh}&year_en=${yearEn}`
            + `&dc_cost_id=${encodeURIComponent(dcCostId)}`   
            + `&f_budget=${encodeURIComponent(fBudget)}`
            + `&f_reserve=${encodeURIComponent(fReserve)}`
            + `&f_remaining=${encodeURIComponent(fRemaining)}`
            + `&bg_expense_label=${encodeURIComponent(r.bg_expense || "")}`;
          window.open(url, "_blank");
        } else {
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
    const effectiveIds = resolveFundSourceIds(ids);
    return rows.filter((r) => {
      if (year !== "all" && String(r.budget_year) !== String(year)) return false;
      if (!effectiveIds.includes(String(r.dc_expense_budget_type_id))) return false;
      return true;
    });
  }

  /* ---------- แสดง/ซ่อนกลุ่มคอลัมน์ใน Data View ตามแหล่งเงินที่เลือก ---------- */
  // จัดหมวดชื่อแหล่งเงิน -> คีย์กลุ่มคอลัมน์ (income / bkk / gov / Savings)
  function classifySourceName(name) {
    const src = String(name || "").trim();
    if (src.includes("รายได้")) return "income";
    if (src.includes("กทม")) return "bkk";
    if (src.includes("รัฐบาล")) return "gov";
    return "Savings";
  }

  // หาว่า ids ที่ผู้ใช้เลือก (หรือค่า default เมื่อยังไม่ได้เลือก) ครอบคลุมกลุ่มคอลัมน์ไหนบ้าง
  function getSelectedColumnGroups(ids) {
    const effectiveIds = resolveFundSourceIds(ids);
    const groups = new Set();
    (window.DATA_BUDGET || []).forEach((r) => {
      const id = String(r.dc_expense_budget_type_id || "").trim();
      if (!effectiveIds.includes(id)) return;
      groups.add(classifySourceName(r.dc_expense_budget_type || r.c_name));
    });
    return groups;
  }

  // ซ่อน/แสดงทั้ง header (.group-xxx) และ cell ในตาราง (.col-xxx) ของ #dvTable
  // ให้เหลือเฉพาะกลุ่มแหล่งเงินที่ถูกเลือกอยู่ (ถ้ายังไม่เลือกเลย = แสดงครบทุกแหล่งเงินหลักตามปกติ)
  function updateDataViewColumnVisibility(ids) {
    const groups = getSelectedColumnGroups(ids);
    ["income", "bkk", "gov", "Savings"].forEach((g) => {
      const show = groups.has(g);
      document.querySelectorAll(`#dvTable .group-${g}`).forEach((el) => {
        el.style.display = show ? "" : "none";
      });
      document.querySelectorAll(`#dvTable .col-${g}`).forEach((el) => {
        el.style.display = show ? "" : "none";
      });
    });
  }
  window.updateDataViewColumnVisibility = updateDataViewColumnVisibility;

  // คืนค่า "แหล่งเงินที่ต้องใช้กรอง Data View จริง ๆ ในตอนนี้"
  // ให้สิทธิ์การ์ด/วงกลมโดนัทที่เลือกไว้ (DONUT_SELECTED) มาก่อนเสมอ เพราะเป็นจุดที่ผู้ใช้ "เลือกแหล่งเงิน" จริง ๆ
  // ถ้ายังไม่ได้เลือกจากวงกลม/การ์ด (DONUT_SELECTED === -1) ให้ fallback ไปใช้ dropdown "แหล่งเงิน" (multiCheckCombo) ตามเดิม
  function getEffectiveFundIds() {
    if (DONUT_SELECTED !== -1 && DONUT_ITEMS[DONUT_SELECTED]) {
      return [String(DONUT_ITEMS[DONUT_SELECTED].typeId)];
    }
    return $("#multiCheckCombo").val() || [];
  }
  window.getEffectiveFundIds = getEffectiveFundIds;

  // รีเฟรชเฉพาะตาราง Data View (แถว + คอลัมน์) ให้ตรงกับแหล่งเงินที่เลือกอยู่ตอนนี้
  function refreshDataView() {
    const year = $("#budget_year_filter").val() || "all";
    const ids = getEffectiveFundIds();
    const detailForTable = filterDetailForTable(window.DATA_BUDGET, { year, ids });
    renderDataView(detailForTable);
    updateDataViewColumnVisibility(ids);
  }
  window.refreshDataView = refreshDataView;

  /* ---------- Refresh ทั้งหน้า ---------- */
  function renderCharts() {
    const year = $("#budget_year_filter").val() || "all";
    const ids = $("#multiCheckCombo").val() || [];
    const eqOnly = $("#filter_equipment").is(":checked");
    const items = pickBudget(year, ids, eqOnly);
    CURRENT_ITEMS_FOR_DV = items;

    // ตัดการ์ดสรุป (summaryBox) ออกจากหน้าจอตามที่ผู้ใช้ระบุ — ฟังก์ชันยังอยู่เผื่อเรียกใช้ภายหลัง
    // buildSummary(items);
    // ตัดกราฟแท่ง Stacked (bar_bg) และกราฟเปอร์เซ็นต์การใช้งบ (pie_tor_type) ออกจากหน้าจอ
    // ตามที่ผู้ใช้ระบุ ใช้โดนัทแทนแล้ว — ฟังก์ชันยังอยู่เผื่อเรียกใช้ภายหลัง
    // renderBar(items);
    // renderBarHigh(items);
    renderDonut(items);
    refreshDataView(); // Data View จะกรองตามแหล่งเงินที่เลือกอยู่จริง (การ์ด/วงกลมโดนัท มาก่อน dropdown)
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