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
  let lastValidFundSelection = [];
  let isUpdatingCostSelect = false;

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

  /* ---------- Store Definition ---------- */
  const budgetStore = new Ext.data.JsonStore({
    url: "../api/List_Rep_Budget_Monitoring_Dashboard.php",
    root: "data",
    totalProperty: "totalCount",
    fields: [
      "no",
      "cost_name",
      "dc_cost_acc_id",
      "c_name",
      "bg_expense",
      "bg_expense_id",
      "dc_expense_budget_type_id",
      { name: "f_plan_begin", type: "float" },
      { name: "f_reserve_budget", type: "float" },
      "budget_year",
      "year_th_default",
      "year_en",
      "year_th",
    ],
    listeners: {
      beforeload: function () {
        // Show Loading Tube
        const overlay = document.getElementById("loading-overlay");
        const bar = document.getElementById("loading-bar");
        const pct = document.getElementById("loading-pct");
        if (overlay) {
          overlay.style.display = "flex";
          bar.style.width = "0%";
          pct.textContent = "0%";
          window._loadingProgress = 0;
          window._loadingTimer = setInterval(() => {
            if (window._loadingProgress < 90) {
              window._loadingProgress += Math.random() * 5;
              if (window._loadingProgress > 90) window._loadingProgress = 90;
              bar.style.width = window._loadingProgress + "%";
              pct.textContent = Math.round(window._loadingProgress) + "%";
            }
          }, 300);
        }
      },
      load: function (store, records, options) {
        // Hide Loading Tube
        const overlay = document.getElementById("loading-overlay");
        const bar = document.getElementById("loading-bar");
        const pct = document.getElementById("loading-pct");
        if (window._loadingTimer) clearInterval(window._loadingTimer);

        if (overlay) {
          bar.style.width = "100%";
          pct.textContent = "100%";
          setTimeout(() => {
            overlay.style.display = "none";
          }, 300);
        }

        // Process Data
        // Access raw JSON for extra properties if needed
        const raw = store.reader.jsonData || {};
        window.DATA_BUDGET = [];
        store.each(function (rec) {
          window.DATA_BUDGET.push(rec.data);
        });

        // The `status` array is not part of the store's root, so we need to get it from raw data
        window.DATA_STATUS = Array.isArray(raw.status) ? raw.status : [];

        // Year Handler
        const yThDefault = raw.year_th_default || 2568;
        const params = options.params || {};
        if (!params.year_th) {
          const el = document.getElementById("budget_year_filter");
          if (el) el.value = yThDefault;
        }

        renderStatusCards(window.DATA_STATUS); // Re-render status cards with the fetched status data

        // Force populate filters (Cost Center, Funds)
        refreshAll.lastYear = null;
        refreshAll();
      },
      exception: function () {
        // Failure Handler
        const overlay = document.getElementById("loading-overlay");
        if (window._loadingTimer) clearInterval(window._loadingTimer);
        if (overlay) overlay.style.display = "none";
        alert("โหลดข้อมูลล้มเหลว");
      },
    },
  });

  /* ---------- โหลดข้อมูลจาก API ---------- */
  function loadAll(params = {}) {
    // Trigger Store Load
    budgetStore.load({
      params: { fn: "List_QueryParam", ...params },
    });
  }
  // รวมข้อมูลละเอียด (ต่อ bg_expense_id) ให้เหลือระดับ "แหล่งเงิน" (dc_expense_budget_type / c_name)
  function aggregateBySource(rows, { year = "all", ids = [], costIds = [] } = {}) {
    const ORDER = ["เงินรายได้คณะแพทย์ฯ-โรงพยาบาล", "เงินอุดหนุนกทม.", "เงินอุดหนุนรัฐบาล", "เงินสะสมส่วนงาน"];
    const sortKey = (name) => {
      const i = ORDER.indexOf(name);
      return i === -1 ? 999 : i;
    };

    const costArr = (costIds || []).map(String);
    const map = new Map();

    rows.forEach((r) => {
      if (year !== "all" && String(r.budget_year) !== String(year)) return;
      if (ids && ids.length && !ids.includes(String(r.dc_expense_budget_type_id))) return;
      if (costArr.length && !costArr.includes(String(r.dc_cost_acc_id))) return;

      const name = r.dc_expense_budget_type || r.c_name || "ไม่ทราบแหล่งเงิน";
      const total = Number(r.f_plan_begin) || 0;
      const booked = Number(r.f_reserve_budget) || 0;

      const cur = map.get(name) || { name, total: 0, booked: 0 };
      cur.total += total;
      cur.booked += booked;
      map.set(name, cur);
    });

    return Array.from(map.values())
      .map((x) => ({ ...x, remain: x.total - x.booked })) // 👈 แก้ .x เป็น ...x
      .filter((x) => x.total + x.booked + x.remain > 0) // 👈 ตัดรายการที่เป็น 0 ทั้งหมด
      .sort((a, b) => sortKey(a.name) - sortKey(b.name));
  }
  // สร้างรายการ "แหล่งเงิน" (#multiCheckCombo) ตาม ปี + ส่วนงาน ที่เลือก
  function rebuildFundMultiForCurrent() {
    const year = $("#budget_year_filter").val() || "all";

    // เอาค่า cost ที่เลือก (รองรับ Multiple)
    let costVal = $("#cost_sys_main_filter").val();
    let costIds = [];

    if (Array.isArray(costVal)) {
      costIds = costVal.map(String);
    } else if (costVal) {
      costIds = [String(costVal)];
    }

    console.log("BudgetDashboard: Rebuild Funds for Costs:", costIds);

    const $multi = $("#multiCheckCombo");
    $multi.empty();

    // ❗ ยังไม่เลือกส่วนงานเลย → ไม่ต้องแสดงแหล่งเงิน
    if (costIds.length === 0) {
      $multi.selectpicker();
      $multi.selectpicker("refresh");
      $multi.selectpicker("val", []);
      lastValidFundSelection = [];
      return;
    }

    const seenFund = new Set();
    const first = [];

    window.DATA_BUDGET.forEach((it) => {
      if (year !== "all" && String(it.budget_year) !== String(year)) return;
      // เช็คว่าอยู่ใน list ส่วนงานที่เลือกหรือไม่
      if (!costIds.includes(String(it.dc_cost_acc_id || ""))) return;

      const fundId = String(it.dc_expense_budget_type_id || "");
      if (!fundId || seenFund.has(fundId)) return;

      seenFund.add(fundId);
      $multi.append(new Option(it.c_name, it.dc_expense_budget_type_id));
      if (first.length < 4) first.push(fundId); // เลือกอัตโนมัติไม่เกิน 4 ตัว
    });

    // console.log("BudgetDashboard: Found Funds:", Array.from(seenFund));
    // console.log("BudgetDashboard: Auto-selecting First:", first);

    $multi.selectpicker();
    $multi.selectpicker("refresh");
    $multi.selectpicker("val", first);
    lastValidFundSelection = first.slice();
  }

  function initUIAndRender() {
    // init bootstrap-select ให้มั่นใจว่ามีปลั๊กอิน
    if (typeof $.fn.selectpicker !== "function") {
      console.error("bootstrap-select ยังไม่ถูกโหลด");
      return;
    }

    const year = $("#budget_year_filter").val() || "all";

    // ===== ส่วนงาน (cost_sys_main_filter) =====
    const $cost = $("#cost_sys_main_filter");
    $cost.empty();
    const seenCost = new Set();

    window.DATA_BUDGET.forEach((it) => {
      if (year !== "all" && String(it.budget_year) !== String(year)) return;

      const costId = String(it.dc_cost_acc_id || "");
      if (!costId || seenCost.has(costId)) return;

      seenCost.add(costId);
      const label = it.cost_name || "ส่วนงาน " + costId;
      $cost.append(new Option(label, costId));
    });

    $cost.selectpicker();
    $cost.selectpicker("refresh");
    // ❗ ไม่เลือกค่าเริ่มต้น ปล่อยให้ user เลือกเอง

    // ===== แหล่งเงิน (multiCheckCombo) ตาม ปี + ส่วนงานที่เลือก =====
    // ตอนโหลดครั้งแรกยังไม่เลือกส่วนงาน → ฟังก์ชันนี้จะเคลียร์ dropdown ให้ว่าง
    rebuildFundMultiForCurrent();

    // การ์ดสถานะรวมยังแสดงได้ตามเดิม
    renderStatusCards(window.DATA_STATUS);

    // ให้ renderCharts จัดการเคส "ยังไม่ได้เลือกส่วนงาน" (จะเคลียร์กราฟ/ตาราง)
    renderCharts();
    bindFiltersOnce();
  }

  function bindFiltersOnce() {
    // ป้องกัน bind ซ้ำ
    if (bindFiltersOnce.done) return;
    bindFiltersOnce.done = true;

    const $multi = $("#multiCheckCombo");
    const $multibg = $("#multiCheckComboBg");
    const $cost = $("#cost_sys_main_filter");

    // เปลี่ยนปี / toggle เฉพาะอุปกรณ์ -> refreshAll (ให้จัดการ dropdown + คำนวณใหม่)
    $("#budget_year_filter, #filter_equipment").on("change", refreshAll);

    // multi แหล่งเงินแบบ background (ถ้ามี)
    $multibg.on("changed.bs.select", refreshAll);

    // เวลาเปลี่ยน "ส่วนงาน"
    //  ตรงนี้สำคัญ: ไม่เรียก selectpicker('val') เอง และไม่เรียก refreshAll ซ้ำ
    $cost.on("changed.bs.select", function () {
      console.log("BudgetDashboard: Section Changed", $(this).val());
      rebuildFundMultiForCurrent(); // สร้างรายการแหล่งเงินตามส่วนงานใหม่
      renderCharts(); // คำนวณกราฟ + ตาราง + summary ใหม่
    });

    // จำกัดให้เลือกแหล่งเงินได้ไม่เกิน 4 ตัว
    $multi.on("changed.bs.select", function () {
      const max = 4;
      const selected = $(this).val() || [];
      console.log("BudgetDashboard: Fund Changed", selected);

      // if (selected.length > max) {
      //   $(this).selectpicker("val", lastValidFundSelection);
      //   alert("เลือกแหล่งเงินได้ไม่เกิน " + max + " รายการ");
      //   return;
      // }

      lastValidFundSelection = selected.slice();
      renderCharts(); // เปลี่ยนแหล่งเงิน -> แค่คำนวณใหม่ ไม่ต้อง refreshAll
    });

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
  function pickBudget(year, ids, onlyEquipment, costIds) {
    const out = [];
    const costArr = (costIds || []).map(String);

    window.DATA_BUDGET.forEach((r) => {
      if (year !== "all" && String(r.budget_year) !== String(year)) return;
      if (ids && ids.length && !ids.includes(String(r.dc_expense_budget_type_id))) return;
      if (costArr.length && !costArr.includes(String(r.dc_cost_acc_id))) return;

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
  function renderBar(itemsRaw, explicitCostIds) {
    // อ่านค่าฟิลเตอร์ปัจจุบัน
    const year = $("#budget_year_filter").val() || "all";
    const ids = $("#multiCheckCombo").val() || [];
    // ใช้ค่า explicitCostIds ที่ส่งมา ถ้าไม่มีค่อยอ่านจาก DOM (และบังคับ Array)
    let costIds = explicitCostIds;
    if (!costIds) {
      const tmp = $("#cost_sys_main_filter").val();
      costIds = Array.isArray(tmp) ? tmp : tmp ? [tmp] : [];
    }

    // เลือก source: ถ้า DATA_BUDGET มีข้อมูล ให้รวมจาก DATA_BUDGET; ไม่งั้นรวมจาก args
    const rows = window.DATA_BUDGET && window.DATA_BUDGET.length ? window.DATA_BUDGET : itemsRaw || [];
    try {
      let items = aggregateBySource(rows, { year, ids, costIds });

      items = items.filter((x) => x.total + x.booked + x.remain > 0);

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
    } catch (e) {
      console.error("Error in renderBar:", e);
    }
  }

  function pickColorBySource(name) {
    if (name.includes("รายได้")) return "#3f51b5";
    if (name.includes("กรุงเทพมหานคร")) return "#4caf50";
    if (name.includes("รัฐบาล")) return "#ff9800";
    if (name.includes("เงินสะสมส่วนงาน")) return "#c4a67bff";
    return "#9e9e9e";
  }

  function renderBarHigh(itemsRaw, explicitCostIds) {
    // อ่านค่าฟิลเตอร์
    const year = $("#budget_year_filter").val() || "all";
    const ids = $("#multiCheckCombo").val() || [];
    let costIds = explicitCostIds;
    if (!costIds) {
      const tmp = $("#cost_sys_main_filter").val();
      costIds = Array.isArray(tmp) ? tmp : tmp ? [tmp] : [];
    }

    // รวมข้อมูลระดับแหล่งเงิน (เหมือนกราฟซ้าย)
    const rows = window.DATA_BUDGET && window.DATA_BUDGET.length ? window.DATA_BUDGET : itemsRaw || [];
    try {
      const items = aggregateBySource(rows, { year, ids, costIds });

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
    } catch (e) {
      console.error("Error in renderBarHigh:", e);
    }
  }
  /* ---------- Data View (HTML table) ---------- */
  function makeDetailRows(items, slotMapping) {
    const byExp = new Map();
    items.forEach((it) => {
      const src = (it.c_name || "").trim();
      const srcId = String(it.dc_expense_budget_type_id || "");

      // ตัวเลขจาก API (เป็นเลขจริง ไม่ใช่ string มีคอมมา)
      const total = +it.f_plan_begin || 0; // ใช้เป็น "ที่ใช้ไป"
      const check = +it.f_reserve_budget || 0; // ใช้เป็น "ตรวจรับแล้ว"
      const paid = 0; // ตอนนี้ไม่มี -> 0
      const left = total - check; // คงเหลือ

// test fffff

      const key = String(it.bg_expense_id || "");
      if (!byExp.has(key)) {
        byExp.set(key, {
          no: it.no || "", // ใช้ลำดับที่มาจากฝั่ง PHP
          bg_expense: (it.bg_expense_id ? "  " : "") + (it.bg_expense || "-"),
          bg_expense_id: (it.bg_expense_id ? "  " : "") + (it.bg_expense_id || "-"),
          // dc_expense_budget_type_id: (it.dc_expense_budget_type_id ? "  " : "") + (it.dc_expense_budget_type_id || "-"),
          // dc_expense_budget_type: (it.c_name ? "  " : "") + (it.c_name || "-"),

          // เก็บ id แยกตาม “ประเภทแหล่งเงิน”
          income_type_id: "",
          bkk_type_id: "",
          gov_type_id: "",
          savings_type_id: "",

          // เงินรายได้ (Slot 1)
          income_used: 0,
          income_check: 0,
          income_paid: 0,
          income_left: 0,
          // อุดหนุน กทม. (Slot 2)
          bkk_used: 0,
          bkk_check: 0,
          bkk_paid: 0,
          bkk_left: 0,
          // อุดหนุน รัฐบาล (Slot 3)
          gov_used: 0,
          gov_check: 0,
          gov_paid: 0,
          gov_left: 0,
          // อุดหนุน สะสมส่วนงาน (Slot 4)
          Savings_used: 0,
          Savings_check: 0,
          Savings_paid: 0,
          Savings_left: 0,
        });
      }

      const row = byExp.get(key);

      // Determine Target Slot
      let targetSlot = "";
      if (slotMapping && slotMapping[srcId]) {
        targetSlot = slotMapping[srcId];
      } else {
        // Default Logic
        if (src.includes("รายได้") || src.includes("กองทุน")) targetSlot = "income";
        else if (src.includes("กทม") || src.includes("กรุงเทพ")) targetSlot = "bkk";
        else if (src.includes("รัฐบาล")) targetSlot = "gov";
        else if (src.includes("เงินสะสมส่วนงาน")) targetSlot = "savings";
      }

      if (targetSlot === "income") {
        row.income_used += total;
        row.income_check += check;
        row.income_paid += paid;
        row.income_left += left;
        row.income_type_id = srcId;
      } else if (targetSlot === "bkk") {
        row.bkk_used += total;
        row.bkk_check += check;
        row.bkk_paid += paid;
        row.bkk_left += left;
        row.bkk_type_id = srcId;
      } else if (targetSlot === "gov") {
        row.gov_used += total;
        row.gov_check += check;
        row.gov_paid += paid;
        row.gov_left += left;
        row.gov_type_id = srcId;
      } else if (targetSlot === "savings") {
        row.Savings_used += total;
        row.Savings_check += check;
        row.Savings_paid += paid;
        row.Savings_left += left;
        row.savings_type_id = srcId;
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

    // Determine dynamic headers
    const ids = $("#multiCheckCombo").val() || [];
    const headers = {
      income: "เงินรายได้",
      bkk: "อุดหนุนกรุงเทพมหานคร",
      gov: "อุดหนุนรัฐบาล",
      savings: "สะสมส่วนงาน",
    };

    if (ids.length > 0) {
      const selectedNames = { income: [], bkk: [], gov: [], savings: [] };
      $("#multiCheckCombo option:selected").each(function () {
        const name = $(this).text();
        if (name.includes("รายได้") || name.includes("กองทุน")) selectedNames.income.push(name);
        else if (name.includes("กทม") || name.includes("กรุงเทพ")) selectedNames.bkk.push(name);
        else if (name.includes("รัฐบาล")) selectedNames.gov.push(name);
        else if (name.includes("เงินสะสมส่วนงาน")) selectedNames.savings.push(name);
      });

      if (selectedNames.income.length) headers.income = selectedNames.income.join(", ");
      if (selectedNames.bkk.length) headers.bkk = selectedNames.bkk.join(", ");
      if (selectedNames.gov.length) headers.gov = selectedNames.gov.join(", ");
      if (selectedNames.savings.length) headers.savings = selectedNames.savings.join(", ");
    }

    let html = `
      <div class="echarts-dv-wrap">
        <div style="margin-bottom:.5rem;font-weight:600;">Data View</div>
        <div class="dataview-wrap">
          <table class="table-dv">
            <thead>
              <tr>
                <th class="sticky-col" rowspan="2" style="min-width:60px;text-align:center;">ลำดับ</th>
                <th class="sticky-col" rowspan="2" style="min-width:320px;"> รหัสงบประมาณ / หมวดค่าใช้จ่าย (LV.4) </th>
                <th class="group-income" colspan="4">${headers.income}</th>
                <th class="group-bkk"    colspan="4">${headers.bkk}</th>
                <th class="group-gov"    colspan="4">${headers.gov}</th>
                <th class="group-Savings"    colspan="4">${headers.savings}</th>
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
  function updateDataViewColumnVisibility() {
    const ids = $("#multiCheckCombo").val() || []; // id แหล่งเงินที่เลือก
    const selectedGroups = new Set();
    const selectedNames = {
      income: [],
      bkk: [],
      gov: [],
      savings: [],
    };

    // Default headers
    const defaultHeaders = {
      income: "เงินรายได้",
      bkk: "อุดหนุนกรุงเทพมหานคร",
      gov: "อุดหนุนรัฐบาล",
      savings: "สะสมส่วนงาน",
    };

    // ถ้าไม่เลือกอะไรเลย = แสดงทุกแหล่งเงิน
    if (!ids.length) {
      ["income", "bkk", "gov", "savings"].forEach((g) => selectedGroups.add(g));
      // Reset headers to default
      Object.keys(defaultHeaders).forEach((key) => {
        const el = document.querySelector(`#dvTable thead tr:first-child .group-${key === "savings" ? "Savings" : key}`);
        if (el) el.textContent = defaultHeaders[key];
      });
    } else {
      // ดูจาก DATA_BUDGET หรือ Options ที่เลือก เพื่อหาชื่อ
      // ใช้ Loop options เพื่อเอาชื่อที่ถูกต้อง
      $("#multiCheckCombo option:selected").each(function () {
        const name = $(this).text();
        const id = $(this).val();

        if (name.includes("รายได้") || name.includes("กองทุน")) {
          selectedGroups.add("income");
          selectedNames.income.push(name);
        } else if (name.includes("กทม") || name.includes("กรุงเทพ")) {
          selectedGroups.add("bkk");
          selectedNames.bkk.push(name);
        } else if (name.includes("รัฐบาล")) {
          selectedGroups.add("gov");
          selectedNames.gov.push(name);
        } else if (name.includes("เงินสะสมส่วนงาน")) {
          selectedGroups.add("savings");
          selectedNames.savings.push(name);
        }
      });

      // Update headers text
      Object.keys(selectedNames).forEach((key) => {
        // Selector needs to be specific to the top header (colspan)
        // The top headers have classes like group-income, group-bkk etc. AND are in the first tr usually.
        // But wait, makeDetailRows generates HTML with classes on TH.
        const groupClass = key === "savings" ? "Savings" : key;
        const el = document.querySelector(`#dvTable thead tr:first-child .group-${groupClass}`);
        if (el) {
          if (selectedNames[key].length > 0) {
            el.textContent = selectedNames[key].join(", ");
          } else {
            el.textContent = defaultHeaders[key];
          }
        }
      });
    }

    // map class ของหัว & cell แต่ละกลุ่ม
    const groupMap = {
      income: [".group-income", ".col-income"],
      bkk: [".group-bkk", ".col-bkk"],
      gov: [".group-gov", ".col-gov"],
      savings: [".group-Savings", ".col-Savings"],
    };

    Object.entries(groupMap).forEach(([key, selectors]) => {
      const show = selectedGroups.has(key);

      selectors.forEach((sel) => {
        document.querySelectorAll("#dvTable " + sel).forEach((el) => {
          if (show) {
            el.classList.remove("hidden-col");
            el.style.display = "";
          } else {
            el.classList.add("hidden-col");
            el.style.display = "none";
          }
        });
      });
    });
  }

  function renderDataView(items, filterIds) {
    const ids = filterIds || $("#multiCheckCombo").val() || [];
    let slotMapping = null;
    let genericMode = false;
    const selectedNamesMap = {}; // id -> name

    // 1. Determine Mode & Mapping
    if (ids.length > 0 && ids.length <= 4) {
      genericMode = true;
      slotMapping = {};
      const slots = ["income", "bkk", "gov", "savings"];

      // Map selected IDs to slots 0..3
      ids.forEach((id, index) => {
        if (index < 4) {
          slotMapping[String(id)] = slots[index];
          // Find name
          const opt = $(`#multiCheckCombo option[value='${id}']`);
          selectedNamesMap[slots[index]] = opt.length ? opt.text() : "-";
        }
      });
    }

    const rows = makeDetailRows(items, slotMapping);
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

    const cell = (cls, v, colKey, bgId, bgExId) => {
      const cleanBg = (bgId || "").toString().trim();
      const cleanExBg = (bgExId || "").toString().trim();
      return `<td class="${cls} ${Number(v) < 0 ? "neg" : ""}"
                  data-col="${colKey || ""}"
                  data-Exbg="${cleanExBg}"
                  data-bg="${cleanBg}">
                ${v === null || v === undefined || v === "" ? "-" : toBaht(v)}
              </td>
            `;
    };
    var i = 0;
    rows.forEach((r) => {
      i++;
      // console.log(r);

      const tr = document.createElement("tr");
      const rawBgId = r.bg_expense_id != null ? String(r.bg_expense_id) : "";
      const rawBgExId = r.dc_expense_budget_type_id != null ? String(r.dc_expense_budget_type_id) : "";
      const bgId = rawBgId.trim(); // 👈 ตัดช่องว่างหัว–ท้ายให้หมด
      const bgExId = rawBgExId.trim(); // 👈 ตัดช่องว่างหัว–ท้ายให้หมด
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
      <td class="sticky-col text-center">${i}</td>
      <td class="sticky-col text-left" data-bg="${bgId}" data-col="desc">${r.bg_expense}</td>


      ${cell("col-income text-right", r.income_used, "income_used", bgId, r.income_type_id)}
      ${cell("col-income text-right", r.income_check, "income_check", bgId, r.income_type_id)}
      ${cell("col-income text-right", r.income_left, "income_left", bgId, r.income_type_id)}
    <td class="col-income text-center" data-bg="${bgId}" data-exbg="${r.income_type_id || ""}" data-col="income_pct">${pctBadge(pctIncome)}</td>

    ${cell("col-bkk text-right", r.bkk_used, "bkk_used", bgId, r.bkk_type_id)}
    ${cell("col-bkk text-right", r.bkk_check, "bkk_check", bgId, r.bkk_type_id)}
    ${cell("col-bkk text-right", r.bkk_left, "bkk_left", bgId, r.bkk_type_id)}
    <td class="col-bkk text-center" data-bg="${bgId}" data-exbg="${r.bkk_type_id || ""}" data-col="bkk_pct">${pctBadge(pctBkk)}</td>

    ${cell("col-gov text-right", r.gov_used, "gov_used", bgId, r.gov_type_id)}
    ${cell("col-gov text-right", r.gov_check, "gov_check", bgId, r.gov_type_id)}
    ${cell("col-gov text-right", r.gov_left, "gov_left", bgId, r.gov_type_id)}
    <td class="col-gov text-center" data-bg="${bgId}" data-exbg="${r.gov_type_id || ""}" data-col="gov_pct">${pctBadge(pctGov)}</td>

    ${cell("col-Savings text-right", r.Savings_used, "sav_used", bgId, r.savings_type_id)}
    ${cell("col-Savings text-right", r.Savings_check, "sav_check", bgId, r.savings_type_id)}
    ${cell("col-Savings text-right", r.Savings_left, "sav_left", bgId, r.savings_type_id)}
    <td class="col-Savings text-center" data-bg="${bgId}" data-exbg="${r.savings_type_id || ""}" data-col="sav_pct">${pctBadge(pctSavings)}</td>
      `;

      tbody.appendChild(tr);
      tr.addEventListener("dblclick", function (e) {
        const td = e.target.closest("td");
        const col = td ? td.dataset.col : "";
        const bg = td ? td.dataset.bg : "";
        const bgex = td ? td.dataset.exbg : ""; // <<< ใช้ชื่อเดียวกับตอนสร้าง td

        const yearTh = document.getElementById("budget_year_filter")?.value || "";
        const yearEn = yearTh ? yearTh - 543 : "";

        if (bg && col) {
          const url = `/supplies/bi/reports/Rep_DetailByTypeV5.php?bg_expense_id=${encodeURIComponent(bg)}&dc_expense_budget_type_id=${encodeURIComponent(bgex)}&col=${encodeURIComponent(
            col
          )}&year_th=${yearTh}&year_en=${yearEn}`;
          window.open(url, "_blank");
        } else {
          window.open(`detail.php?type=dataview&name=${encodeURIComponent(r.bg_expense)}`, "_blank");
        }
      });
    });
    // 4. Update Headers & Visibility
    if (genericMode) {
      // override visibility & headers
      const groupMap = {
        income: [".group-income", ".col-income"],
        bkk: [".group-bkk", ".col-bkk"],
        gov: [".group-gov", ".col-gov"],
        savings: [".group-Savings", ".col-Savings"],
      };
      const slots = ["income", "bkk", "gov", "savings"];

      // Hide/Show based on used slots
      const usedSlots = Object.values(slotMapping); // e.g. ["income", "bkk"]

      slots.forEach((slot) => {
        const isUsed = usedSlots.includes(slot);
        const selectors = groupMap[slot];
        const headerText = isUsed ? selectedNamesMap[slot] : "-";

        // Update Header Text
        const groupClass = slot === "savings" ? "Savings" : slot;
        const el = document.querySelector(`#dvTable thead tr:first-child .group-${groupClass}`);
        if (el) el.textContent = headerText;

        // Update Visibility
        selectors.forEach((sel) => {
          document.querySelectorAll("#dvTable " + sel).forEach((el) => {
            if (isUsed) {
              el.classList.remove("hidden-col");
              el.style.display = ""; // Reset
            } else {
              el.classList.add("hidden-col");
              el.style.display = "none"; // Force hide
            }
          });
        });
      });
    } else {
      updateDataViewColumnVisibility();
    }
  }

  /* ---------- Export ---------- */
  function exportExcel() {
    const rows = [];
    rows.push([
      "ลำดับ",
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

  function filterDetailForTable(rows, { year = "all", ids = [], costIds = [] } = {}) {
    const costArr = (costIds || []).map(String);

    return rows.filter((r) => {
      if (year !== "all" && String(r.budget_year) !== String(year)) return false;
      if (ids && ids.length && !ids.includes(String(r.dc_expense_budget_type_id))) return false;
      if (costArr.length && !costArr.includes(String(r.dc_cost_acc_id))) return false;
      const total = Number(r.f_plan_begin) || 0;
      const booked = Number(r.f_reserve_budget) || 0;
      const remain = total - booked;

      if (total + booked + remain === 0) return false; // 👈 เพิ่มบรรทัดนี้
      return true;
    });
  }

  function renderCharts() {
    const year = $("#budget_year_filter").val() || "all";
    const ids = $("#multiCheckCombo").val() || [];
    const costIdsVal = $("#cost_sys_main_filter").val(); // get raw value
    let costIds = [];
    if (Array.isArray(costIdsVal)) {
      costIds = costIdsVal;
    } else if (costIdsVal) {
      costIds = [costIdsVal];
    }

    // Checkbox equipment
    const eqOnly = $("#filter_equipment").is(":checked");

    console.log("BudgetDashboard: renderCharts", { year, funds: ids, sections: costIds });

    // ❗ ยังไม่เลือกส่วนงานเลย -> ไม่ต้องแสดงข้อมูล
    if (!costIds || costIds.length === 0) {
      console.log("BudgetDashboard: No sections selected, clearing charts.");
      CURRENT_ITEMS_FOR_DV = [];

      // เคลียร์สรุป
      buildSummary([]);

      // เคลียร์กราฟหลัก (ถ้ามีอยู่แล้ว)
      if (typeof chartBar !== "undefined" && chartBar) {
        chartBar.clear();
        // chartBar.dispose(); // Optional: might be better to just clear
      }

      // เคลียร์กราฟเปอร์เซ็นต์ (ขวา)
      const domHigh = document.getElementById("pie_tor_type");
      if (domHigh) {
        const inst = echarts.getInstanceByDom(domHigh);
        if (inst) inst.clear();
      }

      // เคลียร์ Data View
      renderDataView([]);

      return;
    }

    // ✅ มีส่วนงานแล้ว -> คำนวณตามปกติ
    const items = pickBudget(year, ids, eqOnly, costIds);
    console.log("BudgetDashboard: Items picked:", items.length);
    CURRENT_ITEMS_FOR_DV = items;

    buildSummary(items);
    renderBar(items, costIds);
    renderBarHigh(items, costIds);

    // Detail for table (All items matching filter, not just aggregated)
    const detailForTable = filterDetailForTable(window.DATA_BUDGET, { year, ids, costIds });
    console.log("BudgetDashboard: Rows for Table:", detailForTable.length);
    renderDataView(detailForTable, ids);
  }

  function refreshAll() {
    const year = $("#budget_year_filter").val();

    if (refreshAll.lastYear !== year) {
      // --- รีสร้าง dropdown ส่วนงาน ตามปี ---
      const $cost = $("#cost_sys_main_filter");
      $cost.empty();
      const seenCost = new Set();
      let firstCostId = null;

      window.DATA_BUDGET.forEach((it) => {
        if (year !== "all" && String(it.budget_year) !== String(year)) return;

        const costId = String(it.dc_cost_acc_id || "");
        if (!costId || seenCost.has(costId)) return;

        seenCost.add(costId);
        if (!firstCostId) firstCostId = costId;

        const label = it.cost_name || "ส่วนงาน " + costId;
        $cost.append(new Option(label, costId));
      });

      $cost.selectpicker("refresh");
      if (firstCostId) {
        $cost.selectpicker("val", [firstCostId]);
      }

      // --- รีสร้าง dropdown แหล่งเงิน ตาม ปี + ส่วนงานใหม่ ---
      rebuildFundMultiForCurrent();

      refreshAll.lastYear = year;
    }

    // คำนวณกราฟ + ตาราง + summary ใหม่
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
