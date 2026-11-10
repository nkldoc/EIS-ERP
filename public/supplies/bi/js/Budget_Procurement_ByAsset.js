/* Budget_Procurement_ByAsset.js — ตารางแผน 05-/06- แทน Data View เดิม (แสดงทุกสถานะ กรองตามสถานะ 4 แบบได้) */
(function () {
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt = (n) => (Number(n) || 0).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // งบ/คงเหลือเป็น null สำหรับแผนที่ไม่อยู่ในรายการแผน (ไม่มีงบแผนให้เทียบ)
  const fmtN = (n) => (n == null ? "-" : fmt(n));

  // สถานะรหัสแผน 4 แบบ (ระบบตัดสินที่ API จาก PR ที่ผูกรหัสแผน + ยอดเทียบวงเงินแผน)
  const STATUS = {
    1: { label: "รับเรื่องแล้ว", color: "#2e7d32", bg: "#e8f5e9", hint: "มี PR ผูกรหัสแผนและจองเงินแล้ว (ยอดคงเหลือดูที่คอลัมน์ คงเหลือ)" },
    2: { label: "ยังไม่ได้รับเรื่อง", color: "#616161", bg: "#eeeeee", hint: "ยังไม่มี PR ผูกรหัสแผน" },
    3: { label: "รอดำเนินการ", color: "#e65100", bg: "#fff3e0", hint: "มี PR ผูกรหัสแผนแล้ว แต่ยังไม่จองเงิน (ยังไม่ผ่านจัดสรรเงินงบประมาณ)" },
    4: { label: "ยกเลิก", color: "#c62828", bg: "#ffebee", hint: "PR ที่ผูกถูกยกเลิกทั้งหมด" },
  };

  const COLS = 11;
  let ALL_ROWS = [];
  let CUR = "06";
  let ST = 0; // 0 = ทุกสถานะ

  function badge(s) {
    const d = STATUS[s] || STATUS[2];
    return `<span title="${esc(d.hint)}" style="display:inline-block;padding:1px 8px;border-radius:10px;white-space:nowrap;font-size:12px;color:${d.color};background:${d.bg};border:1px solid ${d.color}">${d.label}</span>`;
  }

  // หมายเหตุใต้ยอดคงเหลือที่ติดลบ: ยอดจำนวนเงินของ PR เกินวงเงินแผน (ถ้า PR ยังไม่จองเงิน ยอดนี้คือยอดรวมที่กรอกไว้ใน PR ยังไม่ใช่ยอดจองจริง)
  function remainNote(r) {
    if (r.remain == null || r.remain >= -0.005) return "";
    const txt = r.has_pr && !r.has_reserve ? "เกินวงเงินแผน · PR ยังไม่จองเงิน" : "เกินวงเงินแผน";
    const hint = r.has_pr && !r.has_reserve
      ? "ยอดจำนวนเงินเป็นยอดรวมของ PR ที่กรอกไว้ (ยังไม่ได้จองเงิน) จึงเกินวงเงินแผนและคงเหลือติดลบ"
      : "ยอดจำนวนเงินเกินวงเงินแผน";
    return `<div title="${esc(hint)}" style="font-size:11px;font-weight:normal;color:#c62828;white-space:nowrap">${esc(txt)}</div>`;
  }

  function totalRow(label, t, cls) {
    return `<tr class="font-weight-bold ${cls}"><td colspan="6" class="text-right">${label}</td>
      <td class="text-right">${fmt(t.budget)}</td><td colspan="2"></td>
      <td class="text-right">${fmt(t.amount)}</td><td class="text-right">${fmt(t.remain)}</td></tr>`;
  }

  // การ์ด "แผน / PR" ด้านบน: นับจากรายการที่แสดงอยู่ในตาราง (ตามปุ่ม 05/06 แหล่งเงิน และสถานะที่เลือก)
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

  // ปุ่มสถานะ: ทั้งหมด + 4 สถานะ พร้อมจำนวนแผนและวงเงิน (นับตามปุ่ม 05/06 และแหล่งเงินที่เลือก ก่อนกรองสถานะ)
  function renderStatusBar(scopeRows) {
    const bar = document.getElementById("planStatusBar");
    if (!bar) return;
    const sum = { 0: { n: 0, b: 0 } };
    [1, 2, 3, 4].forEach((k) => (sum[k] = { n: 0, b: 0 }));
    scopeRows.forEach((r) => {
      sum[0].n++;
      sum[0].b += r.budget || 0;
      if (sum[r.status]) {
        sum[r.status].n++;
        sum[r.status].b += r.budget || 0;
      }
    });
    const chip = (k, label, color, bg, hint) => {
      const on = ST === k;
      return `<button type="button" data-st="${k}" title="${esc(hint)}"
        style="cursor:pointer;text-align:left;min-width:170px;padding:6px 12px;border-radius:8px;border:2px solid ${color};background:${on ? color : bg};color:${on ? "#fff" : color}">
        <div style="font-size:13px;font-weight:bold">${k ? k + " " : ""}${esc(label)}</div>
        <div style="font-size:12px">${sum[k].n} แผน · วงเงิน ${fmt(sum[k].b)}</div></button>`;
    };
    bar.innerHTML =
      chip(0, "ทั้งหมด", "#3454d1", "#e8edfb", "ทุกสถานะ") +
      [1, 2, 3, 4].map((k) => chip(k, STATUS[k].label, STATUS[k].color, STATUS[k].bg, STATUS[k].hint)).join("");
    bar.querySelectorAll("[data-st]").forEach((b) =>
      b.addEventListener("click", () => {
        const v = Number(b.dataset.st);
        ST = ST === v ? 0 : v;
        render(ALL_ROWS);
      })
    );
  }

  function render(allRows) {
    // แหล่งเงินที่เลือกจากการ์ด/โดนัทด้านบน (ว่าง = รวมทุกแหล่งเงิน)
    const fundIds = typeof window.getEffectiveFundIds === "function" ? window.getEffectiveFundIds().map(String) : [];
    const scope = allRows.filter(
      (r) => String(r.plan_code).startsWith(CUR + "-") && (!fundIds.length || fundIds.includes(String(r.fund_id)))
    );
    renderStatusBar(scope);
    const rows = ST ? scope.filter((r) => r.status === ST) : scope;
    updateStats(rows);
    const body = document.getElementById("planBody");
    if (!body) return;
    if (!rows.length) {
      body.innerHTML = `<tr><td colspan="${COLS}" class="text-center text-muted">ไม่พบรายการแผน ${CUR}${ST ? " สถานะ " + STATUS[ST].label : ""}</td></tr>`;
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
          <td>${badge(r.status)}</td>
          <td class="text-left">${esc(r.bg_expense || "-")}</td>
          <td class="text-left">${esc(r.plan_name)}</td>
          <td>${esc(r.fund_name || "-")}</td>
          <td class="text-right">${fmtN(r.budget)}</td>
          <td>${esc(r.pr_code || "-")}</td>
          <td>${esc(r.doc_ref || "-")}</td>
          <td class="text-right">${fmt(r.amount)}</td>
          <td class="text-right">${fmtN(r.remain)}${remainNote(r)}</td>
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
