﻿// ReportChartTorType.js (เวอร์ชันกรุ๊ปตามสถานะ + ฟิลเตอร์ส่วนงาน ไม่รีโหลดหน้า)
(function () {
  const random = Date.now();

  // ---------- แปลง JSON ที่ PHP ส่งมา ----------
  try {
    if (typeof dateJson3 === "object") {
      dateJson3 = JSON.stringify(dateJson3);
    }
  } catch (e) {}
  var array3 = JSON.parse(dateJson3 || '{"year_th":2568,"data":[]}');

  // ปีงบ
  if (typeof year_th === "undefined" || year_th === null) {
    window.year_th = array3.year_th || new Date().getFullYear() + 543;
  }
  if (typeof year_en === "undefined" || year_en === null) {
    window.year_en = year_th - 543;
  }

  // ---------- Dropdown ปี ----------
  var yearSelectEl = document.getElementById("budget_year_filter");
  if (yearSelectEl) {
    yearSelectEl.addEventListener("change", function () {
      var yTh = parseInt(this.value, 10);
      var yEn = yTh - 543;
      var url = window.location.pathname + "?year_th=" + yTh + "&year_en=" + yEn + "&_rand=" + random;
      window.location.href = url;
    });
  }

  // ---------- ข้อมูลดิบทั้งหมด ----------
  var allRows = array3.data || [];
  var currentRows = allRows.slice();

  // ---------- config วิธีการจัดซื้อ ----------
  const methods = ["i_tor_type1", "i_tor_type2", "i_tor_type3", "i_tor_type4"];
  const tor_types = [
    { field: "i_tor_type1", label: "วิธีประกวดราคาอิเล็กทรอนิกส์ (E-Bidding)" },
    { field: "i_tor_type2", label: "วิธีคัดเลือก" },
    { field: "i_tor_type3", label: "วิธีเฉพาะเจาะจง ไม่เกิน 5 แสน" },
    { field: "i_tor_type4", label: "วิธีเฉพาะเจาะจง เกิน 5 แสน" },
    { field: "i_tor_type5", label: "E-Market" },
    { field: "i_tor_type6", label: "สรุปรวม" },
  ];
  const tor_types_for_chart = tor_types.slice(0, 4);

  // ---------- helper: หา field id / ชื่อส่วนงานจาก row ----------
  function detectCostFields(rows) {
    if (!rows || !rows.length) return { idKey: null, nameKey: null };
    var sample = rows[0];
    var keys = Object.keys(sample);

    var idKey = null;
    var nameKey = null;

    keys.forEach(function (k) {
      var kLower = k.toLowerCase();
      if (!idKey && kLower.indexOf("cost") !== -1 && kLower.indexOf("id") !== -1) {
        idKey = k;
      }
      if (!nameKey && kLower.indexOf("cost") !== -1 && (kLower.indexOf("name") !== -1 || kLower.indexOf("n_th") !== -1 || kLower.indexOf("label") !== -1)) {
        nameKey = k;
      }
    });

    // fallback ชื่อหน่วยงาน
    if (!nameKey) {
      if (keys.indexOf("cost_name") !== -1) nameKey = "cost_name";
      else if (keys.indexOf("cost_name_th") !== -1) nameKey = "cost_name_th";
      else if (keys.indexOf("c_cost_name") !== -1) nameKey = "c_cost_name";
      else if (keys.indexOf("c_name") !== -1) nameKey = "c_name";
    }

    return { idKey: idKey, nameKey: nameKey };
  }

  var costFieldInfo = detectCostFields(allRows);
  var costIdKey = costFieldInfo.idKey; // ex. dc_cost_acc_id / dc_cost_main_id
  var costNameKey = costFieldInfo.nameKey; // ex. cost_name / cost_name_th

  function getCostId(row) {
    if (!row || !costIdKey) return null;
    var v = row[costIdKey];
    return v == null ? null : String(v);
  }

  function getCostName(row) {
    if (!row) return "";
    if (costNameKey && row[costNameKey]) return row[costNameKey];
    return row.c_name || "";
  }

  // ---------- helper: รวมข้อมูลตามสถานะ ----------
  function aggregateByStatus(rows) {
    var map = {};

    (rows || []).forEach(function (r) {
      var key = r.sp_status_report_id;
      if (!map[key]) {
        map[key] = {
          sp_status_report_id: r.sp_status_report_id,
          c_code: r.c_code,
          c_name: r.c_name, // ชื่อสถานะ
          i_tor_type1: 0,
          i_tor_type2: 0,
          i_tor_type3: 0,
          i_tor_type4: 0,
          i_tor_type5: 0,
          i_tor_type6: 0,
        };
      }
      for (var k = 1; k <= 6; k++) {
        map[key]["i_tor_type" + k] += Number(r["i_tor_type" + k] || 0);
      }
    });

    return Object.values(map);
  }

  // ---------- วาดตาราง + กราฟ ----------
  var myChartTorType = null;

  function renderTorTypeChart(baseRows) {
    // baseRows = ข้อมูลดิบที่ผ่านการฟิลเตอร์ส่วนงานมาแล้ว (หรือ allRows ถ้าไม่ส่ง)
    currentRows = baseRows || allRows;

    // 1) รวมข้อมูลตามสถานะ (1 status = 1 แถว)
    var aggRows = aggregateByStatus(currentRows);

    // 2) คำนวณยอดรวมแต่ละวิธีการ (ใช้ไปทั้งแถว "รวม" + กราฟ)
    var sums = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    aggRows.forEach(function (r) {
      for (var k = 1; k <= 6; k++) {
        sums[k] += Number(r["i_tor_type" + k] || 0);
      }
    });

    // อัปเดตแถว "รวม" ด้านล่างตาราง (ถ้ามี element)
    if (document.getElementById("sum1.1.1")) {
      document.getElementById("sum1.1.1").innerText = sums[1];
      document.getElementById("sum2.1.1").innerText = sums[2];
      document.getElementById("sum3.1.1").innerText = sums[3];
      document.getElementById("sum4.1.1").innerText = sums[4];
      document.getElementById("sum5.1.1").innerText = sums[5];
      document.getElementById("sum6.1.1").innerText = sums[6];
    }

    // 3) สร้างตารางข้อมูลจาก aggRows
    var tableBody = document.getElementById("data-table-TorType");
    if (tableBody) {
      tableBody.innerHTML = ""; // เคลียร์ของเดิมออกก่อน

      aggRows.forEach(function (item, idx) {
        var rowHtml = "<tr>";
        rowHtml += "<td>" + (idx + 1) + "</td>"; // ลำดับ
        rowHtml += "<td>" + item.c_name + "</td>"; // ชื่อสถานะ

        // วนทุกวิธีการ (คอลัมน์ 6 ตัว)
        tor_types.forEach(function (tp) {
          var val = item[tp.field] || 0;
          rowHtml +=
            '<td><p href="#" onclick="openDetail(' + "'9999999','i_product_type','" + val + "','" + item.sp_status_report_id + "','" + tp.field + "','" + getCostId(item) + "')\">" + val + "</p></td>";
          // rowHtml += '<td><p href="#" onclick="openDetail(' + "'9999999','i_product_type','" + val + "','" + item.sp_status_report_id + "','" + tp.field + "')\">" + val + "</p></td>";
        });

        rowHtml += "</tr>";
        tableBody.innerHTML += rowHtml;
      });
    }

    // 4) เตรียมข้อมูลสำหรับกราฟ (ใช้ aggRows เช่นกัน)
    var chartDataByMethod = [];
    methods.forEach(function (fieldKey, idx) {
      var pieData = aggRows.map(function (item) {
        return {
          value: item[fieldKey] || 0,
          name: item.c_name, // label = ชื่อสถานะ
          method: fieldKey,
          field: "i_product_type",
          sp_status_report_id: item.sp_status_report_id,
        };
      });

      chartDataByMethod.push({
        name: tor_types_for_chart[idx].label,
        type: "pie",
        radius: "22%",
        center: [25 + (idx % 2) * 50 + "%", idx < 2 ? "33%" : "78%"],
        label: {
          show: true,
          position: "outside",
          formatter: "{b}\n({d}%)",
        },
        labelLine: { show: true, length: 10, length2: 6 },
        data: pieData,
      });
    });

    // 5) ตั้งค่า option ของ ECharts แล้ววาดกราฟ
    var colors = ["#f4eda5", "#f8cf6a", "#cce5da", "#4cae4c", "#aaccee", "#1d65a6", "#90caf9"];

    var mainTitle = {
      text: "ตารางสรุปข้อมูลสถานะการดำเนินงาน แต่ละวิธีการดำเนินงาน (ปีงบ " + year_th + ")",
      left: "center",
      top: 10,
      textStyle: { fontSize: 18, fontWeight: "bold" },
    };

    var perPieTitles = chartDataByMethod.map(function (s) {
      return {
        text: s.name,
        left: s.center[0],
        top: parseFloat(s.center[1]) - 18 + "%",
        textAlign: "center",
        textVerticalAlign: "bottom",
        textStyle: { fontSize: 13, fontWeight: "bold", color: "#444" },
      };
    });

    var option = {
      color: colors,
      title: [mainTitle].concat(perPieTitles),
      tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
      legend: { top: 56, left: "center" },
      series: chartDataByMethod,
    };

    var el = document.getElementById("pie_tor_type");
    if (!el) {
      console.error("ไม่พบ element #pie_tor_type");
      return;
    }

    if (!myChartTorType) {
      myChartTorType = echarts.init(el, "light");
      window.addEventListener("resize", function () {
        myChartTorType && myChartTorType.resize();
      });
    }

    myChartTorType.clear();
    myChartTorType.setOption(option, true);
  }

  // วาดกราฟครั้งแรก (รวมทุกส่วนงาน)
  renderTorTypeChart(allRows);

  // ---------- ฟังก์ชันเปิดรายละเอียด ----------
  window.openDetail = function (empId, type, value, start, chartKey, costId, i_enabled) {
    if (!value || Number(value) === 0) return;

    var yTh = window.year_th;
    var yEn = window.year_en || yTh - 543;

    var url =
      "Rep_DetailByType.php" +
      "?sp_emp_id=" +
      encodeURIComponent(empId || "9999999") +
      "&type=" +
      encodeURIComponent(type || "i_product_type") +
      "&start=" +
      encodeURIComponent(start || 0) +
      "&chart=" +
      encodeURIComponent(chartKey || "") +
      "&cost_id=" +
      encodeURIComponent(costId || "") + // ← เพิ่มตรงนี้
      "&year_th=" +
      encodeURIComponent(yTh) +
      "&year_en=" +
      encodeURIComponent(yEn) +
      "&i_enabled=" +
      encodeURIComponent(i_enabled ? 1 : 0) +
      "&_rand=" +
      Date.now();

    window.open(url, "_blank");
  };

  // ---------- ฟิลเตอร์ "ส่วนงาน" ----------
  $(function () {
    // var $sel = $("#cost_sys_main_filter");
    // if (!$sel.length || !costIdKey) {
    //   // ถ้าไม่มี select หรือไม่มี field หน่วยงาน ก็ไม่ทำอะไร
    //   return;
    // }

    // ล้าง option เดิมออกก่อน (กันซ้ำ)
    // $sel.empty();

    // option แรก = ทุกส่วนงาน
    // $sel.append('<option value="all" selected>ทุกส่วนงาน</option>');

    var costMap = {};
    (allRows || []).forEach(function (row) {
      var id = row.dc_cost_acc_id; // <<< ใช้ dc_cost_acc_id เป็น id
      if (id == null) return;
      id = String(id);
      if (!costMap[id]) {
        costMap[id] = row.cost_name || row.c_name || "หน่วยงาน " + id;
      }
    });

    Object.keys(costMap).forEach(function (id) {
      $sel.append('<option value="' + id.replace(/"/g, "&quot;") + '">' + costMap[id] + "</option>");
    });

    // $sel.selectpicker("refresh");

    // เวลาเปลี่ยนค่าฟิลเตอร์
    // $sel.on("changed.bs.select", function (e, clickedIndex, isSelected, previousValue) {
    //   var vals = $(this).val() || [];

    //   // ค่าที่เพิ่งถูกคลิก
    //   var clickedVal = null;
    //   if (typeof clickedIndex === "number") {
    //     clickedVal = $(this).find("option").eq(clickedIndex).val();
    //   }

    //   // ถ้าคลิก "ทุกส่วนงาน"
    //   if (clickedVal === "all") {
    //     if (isSelected) {
    //       // ให้เหลือแค่ "ทุกส่วนงาน" ตัวเดียว
    //       vals = ["all"];
    //       $sel.selectpicker("val", vals);
    //     }
    //   } else {
    //     // คลิกส่วนงานอื่น
    //     if (vals.length > 1 && vals.indexOf("all") !== -1) {
    //       // ถ้ามี "ทุกส่วนงาน" ติดอยู่ด้วย ให้เอาออก
    //       vals = vals.filter(function (v) {
    //         return v !== "all";
    //       });
    //       $sel.selectpicker("val", vals);
    //     }
    //   }
    //   // ----- ใช้ vals ที่จัดการแล้ว มาทำ filter ข้อมูล -----
    //   if (!vals.length || vals.indexOf("all") !== -1) {
    //     // ไม่เลือกอะไร หรือเลือก "ทุกส่วนงาน"
    //     renderTorTypeChart(allRows);
    //     return;
    //   }

    //   var setIds = {};
    //   vals.forEach(function (v) {
    //     setIds[String(v)] = true;
    //   });

    //   var filtered = allRows.filter(function (row) {
    //     var id = getCostId(row);
    //     return id && setIds[String(id)];
    //   });

    //   renderTorTypeChart(filtered);
    // });
  });
})();
