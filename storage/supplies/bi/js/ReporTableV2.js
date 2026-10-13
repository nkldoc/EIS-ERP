// js/Rep_DetailByBg.js
(function () {
  // --- helper ---
  const toBaht = (n) =>
    (Number(n) || 0).toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  function pctBadge(p) {
    const v = Number(p) || 0;
    let cls = "pct-0";
    if (v >= 100) cls = "pct-100";
    else if (v >= 90) cls = "pct-90";
    else if (v >= 75) cls = "pct-75";
    else if (v >= 50) cls = "pct-50";
    else if (v >= 25) cls = "pct-25";
    return `<span class="pct-badge ${cls}">${v.toFixed(2)}%</span>`;
  }

  // --- โหลดข้อมูลจาก API เดิมของพี่ (ตัวเดียวกับหน้าใหญ่) ---
  function loadData(cb) {
    const p = window.DETAIL_PARAMS || {};
    // พี่เปลี่ยน endpoint เป็นของพี่ได้เลย
    Ext.Ajax.request({
      url: "../api/List_RepRep_BgExpense_2.php",
      method: "GET",
      params: {
        fn: "List_QueryParam",
        year_th: p.year_th,
        year_en: p.year_en,
      },
      success: function (resp) {
        const o = Ext.decode(resp.responseText || "{}");
        cb(o.data || []); // ฝั่งนี้คือ DATA_BUDGET
      },
      failure: function () {
        alert("โหลดข้อมูลไม่สำเร็จ");
      },
    });
  }

  // --- เรนเดอร์ตาราง ---
  function renderTable(allRows) {
    const p = window.DETAIL_PARAMS || {};
    const targetId = (p.bg_expense_id || "").toString().trim();
    const targetCol = (p.col || "").toString().trim();

    // กรองเฉพาะ bg_expense_id ที่เราต้องการ
    const rows = allRows.filter((r) => {
      return String(r.bg_expense_id || "").trim() === targetId;
    });

    // สร้างหัวตาราง
    const thead = document.getElementById("detailHead");
    thead.innerHTML = `
      <tr>
        <th class="sticky-col" style="min-width:60px;">ลำดับ</th>
        <th class="sticky-col" style="min-width:280px;">รหัสงบประมาณ / รายการ</th>
        <th>เงินรายได้ - งบประมาณ</th>
        <th>เงินรายได้ - ที่ใช้ไป(จอง)</th>
        <th>เงินรายได้ - คงเหลือ</th>
        <th>%</th>
        <th>อุดหนุนกทม. - งบประมาณ</th>
        <th>อุดหนุนกทม. - ที่ใช้ไป(จอง)</th>
        <th>อุดหนุนกทม. - คงเหลือ</th>
        <th>%</th>
        <th>อุดหนุนรัฐบาล - งบประมาณ</th>
        <th>อุดหนุนรัฐบาล - ที่ใช้ไป(จอง)</th>
        <th>อุดหนุนรัฐบาล - คงเหลือ</th>
        <th>%</th>
        <th>สะสมส่วนงาน - งบประมาณ</th>
        <th>สะสมส่วนงาน - ที่ใช้ไป(จอง)</th>
        <th>สะสมส่วนงาน - คงเหลือ</th>
        <th>%</th>
      </tr>
    `;

    const tbody = document.getElementById("detailBody");
    tbody.innerHTML = "";

    rows.forEach((r, idx) => {
      // เอา logic คำนวณเหมือนหน้าใหญ่
      const income_used = Number(r.income_used || r.f_plan_begin_income || 0);
      const income_check = Number(r.income_check || r.f_reserve_budget_income || 0);
      const income_left = Number(r.income_left || income_used - income_check || 0);
      const pct_income = income_used > 0 ? (income_check / income_used) * 100 : 0;

      const bkk_used = Number(r.bkk_used || r.f_plan_begin_bkk || 0);
      const bkk_check = Number(r.bkk_check || r.f_reserve_budget_bkk || 0);
      const bkk_left = Number(r.bkk_left || bkk_used - bkk_check || 0);
      const pct_bkk = bkk_used > 0 ? (bkk_check / bkk_used) * 100 : 0;

      const gov_used = Number(r.gov_used || r.f_plan_begin_gov || 0);
      const gov_check = Number(r.gov_check || r.f_reserve_budget_gov || 0);
      const gov_left = Number(r.gov_left || gov_used - gov_check || 0);
      const pct_gov = gov_used > 0 ? (gov_check / gov_used) * 100 : 0;

      const sav_used = Number(r.Savings_used || r.f_plan_begin_savings || 0);
      const sav_check = Number(r.Savings_check || r.f_reserve_budget_savings || 0);
      const sav_left = Number(r.Savings_left || sav_used - sav_check || 0);
      const pct_sav = sav_used > 0 ? (sav_check / sav_used) * 100 : 0;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="sticky-col">${idx + 1}</td>
        <td class="sticky-col">${r.bg_expense || r.c_name || "-"}</td>

        <td class="text-right">${toBaht(income_used)}</td>
        <td class="text-right">${toBaht(income_check)}</td>
        <td class="text-right">${toBaht(income_left)}</td>
        <td class="text-center">${pctBadge(pct_income)}</td>

        <td class="text-right">${toBaht(bkk_used)}</td>
        <td class="text-right">${toBaht(bkk_check)}</td>
        <td class="text-right">${toBaht(bkk_left)}</td>
        <td class="text-center">${pctBadge(pct_bkk)}</td>

        <td class="text-right">${toBaht(gov_used)}</td>
        <td class="text-right">${toBaht(gov_check)}</td>
        <td class="text-right">${toBaht(gov_left)}</td>
        <td class="text-center">${pctBadge(pct_gov)}</td>

        <td class="text-right">${toBaht(sav_used)}</td>
        <td class="text-right">${toBaht(sav_check)}</td>
        <td class="text-right">${toBaht(sav_left)}</td>
        <td class="text-center">${pctBadge(pct_sav)}</td>
      `;
      tbody.appendChild(tr);
    });

    // ถ้าอยากเน้นคอลัมน์ที่คลิกมาจริง ๆ (เช่น income_check)
    if (targetCol) {
      document.querySelectorAll(`[data-col="${targetCol}"]`);
      // อันนี้เดี๋ยวค่อยแต่งเพิ่มได้ เช่นใส่ background
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadData(renderTable);
  });
})();
