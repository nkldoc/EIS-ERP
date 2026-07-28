// ===== Helper =====
function thComma(n){ return (Number(n)||0).toLocaleString('th-TH'); }

// ===== Parse data =====
var barDom = document.getElementById("bar_bg");
var myChartBarBg = echarts.init(barDom);

var array4 = JSON.parse(dateJson4);   // { data: [...] }
var rawRows = array4.data || [];

// ===== เติมตัวเลือก multi select (หมวด) =====
$(function(){
  $("#multiCheckCombo").selectpicker();
  const $sel = $("#multiCheckCombo").empty();
  const seen = new Set();
  rawRows.forEach(r=>{
    if(!seen.has(r.bg_expense_id)){
      seen.add(r.bg_expense_id);
      const opt = new Option(r.c_name, r.bg_expense_id, false, false);
      opt.setAttribute("title", r.c_name);
      opt.setAttribute("data-content", `<span title="${r.c_name}">${r.c_name}</span>`);
      $sel.append(opt);
    }
  });
  $sel.selectpicker('refresh');
});

// ===== ฟังก์ชันรวมข้อมูลตามตัวเลือก =====
function buildChartData(rows){
  // รวมแถวชื่อซ้ำ (รวมยอดแต่ละแหล่งเงิน)
  const grouped = {};
  rows.forEach(it=>{
    const name = it.c_name;
    if(!grouped[name]){
      grouped[name] = {
        f_reserve_budget:0, f_plan_begin_remaining:0,
        f_reserve_period_bkb:0, f_period_transfer_remaining_bkb:0,
        f_reserve_period_government:0, f_period_transfer_remaining_government:0
      };
    }
    grouped[name].f_reserve_budget                         += Number(it.f_reserve_budget)||0;
    grouped[name].f_plan_begin_remaining                   += Number(it.f_plan_begin_remaining)||0;
    grouped[name].f_reserve_period_bkb                     += Number(it.f_reserve_period_bkb)||0;
    grouped[name].f_period_transfer_remaining_bkb          += Number(it.f_period_transfer_remaining_bkb)||0;
    grouped[name].f_reserve_period_government              += Number(it.f_reserve_period_government)||0;
    grouped[name].f_period_transfer_remaining_government   += Number(it.f_period_transfer_remaining_government)||0;
  });

  const names = [], inc_used=[], inc_rem=[],
        bkk_used=[], bkk_rem=[], gov_used=[], gov_rem=[];

  let grand = 0;
  Object.keys(grouped).forEach(name=>{
    const g = grouped[name];
    const tot = g.f_reserve_budget + g.f_plan_begin_remaining
              + g.f_reserve_period_bkb + g.f_period_transfer_remaining_bkb
              + g.f_reserve_period_government + g.f_period_transfer_remaining_government;
    if(tot>0){
      names.push(name);
      inc_used.push(g.f_reserve_budget);
      inc_rem.push(g.f_plan_begin_remaining);
      bkk_used.push(g.f_reserve_period_bkb);
      bkk_rem.push(g.f_period_transfer_remaining_bkb);
      gov_used.push(g.f_reserve_period_government);
      gov_rem.push(g.f_period_transfer_remaining_government);
      grand += tot;
    }
  });
  $("#grand_total").text(thComma(grand));
  return { names, inc_used, inc_rem, bkk_used, bkk_rem, gov_used, gov_rem };
}

// ===== ฟิลเตอร์ปี + checkbox ครุภัณฑ์ =====
function reloadData(){
  const filterChecked = document.getElementById("filter_equipment").checked;
  const selectedYear  = document.getElementById("budget_year_filter").value;

  const filtered = rawRows.filter(item=>{
    const matchEquipment = filterChecked ? (Number(item.i_product_type1||0) > 0) : true;
    const matchYear = (selectedYear === "all") ? true : (String(item.budget_year||"") === String(selectedYear));
    return matchEquipment && matchYear;
  });
  const chartData = buildChartData(filtered.length? filtered : rawRows);
  drawChart(chartData);
}

// ===== วาดกราฟหลัก =====
function drawChart(chartData){
  const optionBg = {
    tooltip: {
      trigger: 'axis',
      axisPointer:{ type:'shadow' },
      formatter: function (params) {
        const name = params[0].name;
        let content = `<strong>${name}</strong><br/>`;
        let used=0, remain=0, usedBkk=0, remainBkk=0, usedGov=0, remainGov=0;

        params.forEach(p=>{
          const val = p.value || 0;
          content += `${p.marker} ${p.seriesName}: ${thComma(val)} บาท<br/>`;
          if(p.seriesName.includes('รายได้')){
            if(p.seriesName.includes('ที่ใช้ไป')) used += val; else remain += val;
          }else if(p.seriesName.includes('กทม')){
            if(p.seriesName.includes('ที่ใช้ไป')) usedBkk += val; else remainBkk += val;
          }else if(p.seriesName.includes('รัฐบาล')){
            if(p.seriesName.includes('ที่ใช้ไป')) usedGov += val; else remainGov += val;
          }
        });
        content += `<br/><strong>รวมรายได้: ${thComma(used+remain)} บาท</strong>`;
        content += `<br/><strong>รวมกทม.: ${thComma(usedBkk+remainBkk)} บาท</strong>`;
        content += `<br/><strong>รวมงบรัฐบาล: ${thComma(usedGov+remainGov)} บาท</strong>`;
        return content;
      }
    },
    legend: {
      data: ["ที่ใช้ไป รายได้","คงเหลือ รายได้","ที่ใช้ไป กทม.","คงเหลือ กทม.","ที่ใช้ไป อุดหนุนรัฐบาล","คงเหลือ อุดหนุนรัฐบาล"],
      top: '3%',
      left: 'center'
    },
    grid: { top:'20%', left:'1%', right:'10%', containLabel:true },
    xAxis: [{
      type:'category',
      data: chartData.names,
      axisLabel:{
        interval:0, rotate:45,
        formatter: v => v.length>30? (v.slice(0,30)+'...'): v
      }
    }],
    yAxis: [{
      type:'value', name:'Budget (บาท)',
      axisLabel:{ formatter: v=>thComma(v) }
    }],
    toolbox:{
      show:true,
      feature:{
        dataView:{
          show:true, readOnly:true,
          optionToContent: function (opt) {
            const axisData = opt.xAxis?.[0]?.data || [];
            const series   = opt.series || [];
            let html = `<table border="1" style="width:100%;border-collapse:collapse;text-align:center;font-family:'Tahoma';font-size:14px;">
              <thead><tr>
                <th style="text-align:left;padding:8px;background:#3f51b5;color:white;">หมวดหมู่</th>`;
            for(let i=0;i<series.length;i++){
              html+= `<th style="padding:8px;background:#3f51b5;color:white;">${series[i].name}</th>`;
            }
            html += `</tr></thead><tbody>`;
            for(let r=0;r<axisData.length;r++){
              const label = axisData[r];
              const encoded = encodeURIComponent(label);
              html += `<tr>
                <td style="text-align:left;padding:6px;">
                  <a href="report_detail.php?name=${encoded}" target="_blank" style="text-decoration:none;color:#3f51b5;">${label}</a>
                </td>`;
              for(let c=0;c<series.length;c++){
                const v = series[c].data[r] || 0;
                html += `<td style="padding:6px;">${echarts.format.addCommas(v)}</td>`;
              }
              html += `</tr>`;
            }
            html += `</tbody></table>`;
            return html;
          }
        },
        magicType:{ show:true, type:['line','bar','stack','tiled'] },
        restore:{ show:true },
        saveAsImage:{ show:true }
      }
    },
    dataZoom:[
      { type:'slider', xAxisIndex:0, start:0, end:100 },
      { type:'inside', xAxisIndex:0, start:0, end:100 }
    ],
    series:[
      { name:"ที่ใช้ไป รายได้", type:"bar", stack:"bg", barWidth:40, data: chartData.inc_used,
        itemStyle:{ color:"#3f51b5", opacity:1 }, z:1 },
      { name:"คงเหลือ รายได้", type:"bar", stack:"bg", barWidth:40, data: chartData.inc_rem,
        itemStyle:{ color:"#3f51b5", opacity:0.2 }, emphasis:{ itemStyle:{ opacity:0.1 } }, z:2 },

      { name:"ที่ใช้ไป กทม.", type:"bar", stack:"bg_bkb", barWidth:40, data: chartData.bkk_used,
        itemStyle:{ color:"#4caf50", opacity:1 }, z:1 },
      { name:"คงเหลือ กทม.", type:"bar", stack:"bg_bkb", barWidth:40, data: chartData.bkk_rem,
        itemStyle:{ color:"#4caf50", opacity:0.2 }, z:2 },

      { name:"ที่ใช้ไป อุดหนุนรัฐบาล", type:"bar", stack:"bg_government", data: chartData.gov_used,
        itemStyle:{ color:"#ff9800", opacity:1 }, z:1 },
      { name:"คงเหลือ อุดหนุนรัฐบาล", type:"bar", stack:"bg_government", data: chartData.gov_rem,
        itemStyle:{ color:"#ff9800", opacity:0.2 }, z:2 },
    ]
  };

  myChartBarBg.setOption(optionBg);
}

// ===== Legend กลุ่ม (คลิกชื่อกลุ่มเพื่อซ่อน/แสดงคู่ ใช้ไป/คงเหลือ) =====
myChartBarBg && myChartBarBg.on("legendselectchanged", function (params) {
  const map = {
    "งบรายได้": ["ที่ใช้ไป รายได้","คงเหลือ รายได้"],
    "งบ กทม.": ["ที่ใช้ไป กทม.","คงเหลือ กทม."],
    "งบรัฐบาล": ["ที่ใช้ไป อุดหนุนรัฐบาล","คงเหลือ อุดหนุนรัฐบาล"]
  };
  const targets = map[params.name] || [];
  targets.forEach(n=>{
    myChartBarBg.dispatchAction({ type: params.selected[params.name] ? "legendSelect":"legendUnSelect", name:n });
  });
});

// ===== ส่งออก Excel จาก DataView table =====
function exportTableToExcel(){
  var table = document.querySelector("#bar_bg div table");
  if(!table){ alert("ไม่พบตาราง (เปิด DataView ก่อนหรือเลื่อนกราฟ)"); return; }
  var wb = XLSX.utils.table_to_book(table, { sheet: "Data View" });
  XLSX.writeFile(wb, "styled_data_view.xlsx");
}
window.exportTableToExcel = exportTableToExcel;

// ===== ฟิลเตอร์ UI Events =====
$("#multiCheckCombo").on("hide.bs.select", function(){
  const ids = ($("#multiCheckCombo").val()||[]).map(String);
  const filtered = rawRows.filter(r => ids.length? ids.includes(String(r.bg_expense_id)) : true);
  drawChart(buildChartData(filtered.length? filtered: rawRows));
});

document.getElementById("budget_year_filter").addEventListener("change", function () {
  var yearTh = this.value;
  var yearEn = this.options[this.selectedIndex].getAttribute("data-year-en");
  // reload หน้าเดิมพร้อมปี
  var url = window.location.pathname + "?year_th=" + yearTh + "&year_en=" + yearEn + "&_rand=" + Date.now();
  window.location.href = url;
});

document.getElementById("filter_equipment").addEventListener("change", reloadData);

// ===== Dark Mode =====
function toggleDarkMode(){
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", document.body.classList.contains("dark-mode")? "on":"off");
}
window.toggleDarkMode = toggleDarkMode;
window.addEventListener("load", function(){
  if(localStorage.getItem("darkMode")==="on"){ document.body.classList.add("dark-mode"); }
  drawChart(buildChartData(rawRows)); // first render
});
