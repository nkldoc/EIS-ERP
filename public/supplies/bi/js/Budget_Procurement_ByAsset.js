/* Budget_Procurement_ByAsset.js — ตารางแผน 05-/06- แทน Data View เดิม (แสดงเฉพาะแผนที่ได้รับเรื่องแล้ว) */
(function () {
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt = (n) => (Number(n) || 0).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // งบ/คงเหลือเป็น null สำหรับแผนที่ไม่อยู่ในรายการแผน (ไม่มีงบแผนให้เทียบ)
  const fmtN = (n) => (n == null ? "-" : fmt(n));

  const COLS = 10;
  let ALL_ROWS = [];
  let CUR = "06";

  function totalRow(label, t, cls) {
    return `<tr class="font-weight-bold ${cls}"><td colspan="5" class="text-right">${label}</td>
      <td class="text-right">${fmt(t.budget)}</td><td colspan="2"></td>
      <td class="text-right">${fmt(t.amount)}</td><td class="text-right">${fmt(t.remain)}</td></tr>`;
  }

  // การ์ด "แผน / PR" ด้านบน: นับจากรายการที่แสดงอยู่ในตาราง (ตามปุ่ม 05/06 และแหล่งเงินที่เลือก)
  function updateStats(rows) {
    const prs = new Set();
    rows.forEach((r) =>
      String(r.pr_code || "")
        .split(/,\s*/)
        .map((c) => c.trim())
        .filter((c) => c && c !== "-")
        .forEach((c) => prs.add(c))
    );
    window.ASSET_PLAN_STATS = { plans: rows.length, prs: prs.size };
    const el = document.getElementById("assetPlanPrValue");
    if (el) el.textContent = rows.length + " แผน / " + prs.size + " PR";
  }

  function render(allRows) {
    // แหล่งเงินที่เลือกจากการ์ด/โดนัทด้านบน (ว่าง = รวมทุกแหล่งเงิน)
    const fundIds = typeof window.getEffectiveFundIds === "function" ? window.getEffectiveFundIds().map(String) : [];
    const rows = allRows.filter(
      (r) => String(r.plan_code).startsWith(CUR + "-") && (!fundIds.length || fundIds.includes(String(r.fund_id)))
    );
    updateStats(rows);
    const body = document.getElementById("planBody");
    if (!body) return;
    if (!rows.length) {
      body.innerHTML = `<tr><td colspan="${COLS}" class="text-center text-muted">ไม่พบรายการแผน ${CUR} ที่ได้รับเรื่องแล้ว</td></tr>`;
      return;
    }
    const groups = new Map();
    rows.forEach((r) => {
      const g = r.group_name || "ไม่ระบุหน่วยงาน";
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push(r);
    });

    let html = "";
    let gi = 0;
    let no = 0;
    const grand = { budget: 0, amount: 0, remain: 0 };
    groups.forEach((list, name) => {
      gi++;
      html += `<tr class="table-active font-weight-bold"><td colspan="${COLS}" class="text-left">${gi}. ${esc(name)}</td></tr>`;
      const sum = { budget: 0, amount: 0, remain: 0 };
      list.forEach((r) => {
        no++;
        ["budget", "amount", "remain"].forEach((k) => {
          sum[k] += r[k] || 0;
          grand[k] += r[k] || 0;
        });
        html += `<tr>
          <td>${no}</td>
          <td class="text-left" style="white-space:nowrap;min-width:190px">${esc(r.plan_code)}</td>
          <td class="text-left">${esc(r.bg_expense || "-")}</td>
          <td class="text-left">${esc(r.plan_name)}</td>
          <td>${esc(r.fund_name || "-")}</td>
          <td class="text-right">${fmtN(r.budget)}</td>
          <td>${esc(r.pr_code || "-")}</td>
          <td>${esc(r.doc_ref || "-")}</td>
          <td class="text-right">${fmt(r.amount)}</td>
          <td class="text-right">${fmtN(r.remain)}</td>
        </tr>`;
      });
      html += totalRow("รวม", sum, "");
    });
    html += totalRow("รวมทั้งสิ้น", grand, "table-secondary");
    body.innerHTML = html;
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("#planFilter [data-plan]").forEach((btn) => {
      btn.addEventListener("click", () => {
        CUR = btn.dataset.plan;
        document.querySelectorAll("#planFilter [data-plan]").forEach((b) => b.classList.toggle("active", b === btn));
        render(ALL_ROWS);
      });
    });
    window.addEventListener("fundSelectionChanged", () => render(ALL_ROWS));
    const qs = new URL(window.location.href).searchParams;
    const yearTh = qs.get("year_th") || String(new Date().getFullYear() + 543);
    const yearEn = qs.get("year_en") || String(Number(yearTh) - 543);
    const params = new URLSearchParams({ fn: "List_ByAsset", year_th: yearTh, year_en: yearEn });
    fetch("../api/List_Budget_Procurement_ByAsset?" + params.toString())
      .then((r) => r.json())
      .then((o) => {
        ALL_ROWS = Array.isArray(o.data) ? o.data : [];
        render(ALL_ROWS);
      })
      .catch(() => {
        const body = document.getElementById("planBody");
        if (body) body.innerHTML = `<tr><td colspan="${COLS}" class="text-center text-danger">ดึงข้อมูลไม่สำเร็จ</td></tr>`;
      });
  });
})();
