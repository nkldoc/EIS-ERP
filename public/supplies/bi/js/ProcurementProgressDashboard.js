(function () {
  "use strict";
  var allRows = [], filteredRows = [], workloadChart, statusChart, groupField = "fund_source";
  var colors = ["#168de2", "#11b997", "#f5b62e", "#ff7f43", "#7467c7", "#d65db1", "#5a9bd4", "#8bc56b"];
  function el(id) { return document.getElementById(id); }
  function esc(value) { return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) { return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function number(value) { return Number(value || 0).toLocaleString("th-TH"); }
  function percent(value, total) { return total ? Math.round(value * 1000 / total) / 10 : 0; }
  function unique(field) { var map = {}; allRows.forEach(function (r) { if (r[field]) map[r[field]] = true; }); return Object.keys(map).sort(); }
  function fillSelect(select, values, firstLabel) { select.innerHTML = '<option value="">' + firstLabel + '</option>' + values.map(function (v) { return '<option value="' + esc(v) + '">' + esc(v) + '</option>'; }).join(""); }
  function stage(row) {
    if (Number(row.is_completed)) return "เบิกจ่ายสมบูรณ์";
    if (Number(row.billing_total)) return "ขอเบิกจ่าย";
    if (Number(row.inspection_total)) return "ตรวจรับ";
    if (Number(row.arrival_total)) return "รับของ";
    if (Number(row.period_total)) return "บริหารสัญญา/งวด";
    return row.current_progress || "อยู่ระหว่างดำเนินการ";
  }
  function applyFilters() {
    var year = el("yearFilter").value, fund = el("fundFilter").value, keyword = el("keywordFilter").value.toLowerCase();
    filteredRows = allRows.filter(function (r) { return (!year || String(r.i_yyyy) === year) && (!fund || r.fund_source === fund) && (!keyword || [r.pr_code,r.c_name,r.owner_name,r.department_name].join(" ").toLowerCase().indexOf(keyword) >= 0); });
    render();
  }
  function renderMetrics() {
    var total = filteredRows.length, completed = filteredRows.filter(function (r) { return Number(r.is_completed) === 1; }).length;
    var contract = filteredRows.filter(function (r) { return Number(r.period_total) > 0; }).length;
    el("totalJobs").textContent = number(total); el("kpiJobs").textContent = number(total); el("completedJobs").textContent = number(completed); el("completedPercent").textContent = percent(completed,total) + "% สำเร็จแล้ว";
    el("contractJobs").textContent = number(contract); el("ratioTotal").textContent = number(total); el("contractPercent").textContent = percent(contract,total) + "%"; el("contractBar").style.width = percent(contract,total) + "%";
    el("paidJobs").textContent = number(completed); el("managedJobs").textContent = number(contract); el("paymentPercent").textContent = percent(completed,contract) + "%"; el("paymentBar").style.width = percent(completed,contract) + "%";
    [0,1,2].forEach(function (level) { el("issue" + level).textContent = number(filteredRows.filter(function (r) { return Number(r.importance_level) === level; }).length); });
  }
  function renderWorkload() {
    var owners = {}, series = {};
    filteredRows.forEach(function (r) { var owner=r.owner_name||"ไม่ระบุ", key=r[groupField]||"ไม่ระบุ"; owners[owner]=(owners[owner]||0)+1; series[key]=series[key]||{}; series[key][owner]=(series[key][owner]||0)+1; });
    var labels=Object.keys(owners).sort(function(a,b){return owners[b]-owners[a];}).slice(0,30), keys=Object.keys(series).sort();
    var datasets=keys.map(function(key,index){return {label:key,data:labels.map(function(owner){return series[key][owner]||0;}),backgroundColor:colors[index%colors.length],borderWidth:0};});
    if(workloadChart) workloadChart.destroy();
    workloadChart=new Chart(el("workloadChart"),{type:"bar",data:{labels:labels,datasets:datasets},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom"}},scales:{x:{stacked:true,grid:{display:false}},y:{stacked:true,beginAtZero:true,ticks:{precision:0},grid:{color:"#e8edf3"}}}}});
  }
  function renderPipeline() {
    var total=filteredRows.length, steps=[["1. จัดทำงวด",filteredRows.filter(function(r){return Number(r.period_total)>0;}).length,"มี period_id"],["2. รับของ",filteredRows.filter(function(r){return Number(r.arrival_total)>0;}).length,"มีวันที่/เลขรับของ"],["3. ตรวจรับ",filteredRows.filter(function(r){return Number(r.inspection_total)>0;}).length,"มี check_id และข้อมูลตรวจรับ"],["4. เบิกจ่ายสมบูรณ์",filteredRows.filter(function(r){return Number(r.is_completed)>0;}).length,"ทุกงวดมี po_working และสถานะ ≥ 11"]];
    el("pipelineGrid").innerHTML=steps.map(function(s){var p=percent(s[1],total);return '<article class="pipeline-step"><header><b>'+s[0]+'</b><strong>'+number(s[1])+'</strong></header><div class="progress green-bar"><span style="width:'+p+'%"></span></div><small>'+p+'% · '+s[2]+'</small></article>';}).join("");
  }
  function renderStatus() {
    var selected=el("statusOwnerFilter").value, rows=selected?filteredRows.filter(function(r){return r.owner_name===selected;}):filteredRows, counts={}, matrix={};
    rows.forEach(function(r){var key=stage(r), overlap=r.overlap_status||"";counts[key]=(counts[key]||0)+1;matrix[key]=matrix[key]||{"ยังไม่ก่อหนี้":0,"ก่อหนี้แล้ว":0,"บันทึกใบกันเหลื่อมแล้ว":0};if(matrix[key][overlap]!==undefined)matrix[key][overlap]++;}); var labels=Object.keys(counts).sort(function(a,b){return counts[b]-counts[a];}), values=labels.map(function(k){return counts[k];});
    if(statusChart) statusChart.destroy();
    statusChart=new Chart(el("statusChart"),{type:"doughnut",data:{labels:labels,datasets:[{data:values,backgroundColor:colors,borderWidth:3,borderColor:"#fff"}]},options:{responsive:true,maintainAspectRatio:false,cutout:"63%",plugins:{legend:{position:"bottom"}}}});
    var totals={"ยังไม่ก่อหนี้":0,"ก่อหนี้แล้ว":0,"บันทึกใบกันเหลื่อมแล้ว":0};
    var body=labels.map(function(k,i){Object.keys(totals).forEach(function(x){totals[x]+=matrix[k][x];});return '<tr><td>'+esc(k)+'</td><td class="overlap-value">'+number(matrix[k]["ยังไม่ก่อหนี้"])+'</td><td class="overlap-value">'+number(matrix[k]["ก่อหนี้แล้ว"])+'</td><td class="overlap-value">'+number(matrix[k]["บันทึกใบกันเหลื่อมแล้ว"])+'</td><td><b>'+number(values[i])+'</b></td></tr>';}).join("");
    body+='<tr><th>รวมทั้งหมด</th><th class="overlap-value">'+number(totals["ยังไม่ก่อหนี้"])+'</th><th class="overlap-value">'+number(totals["ก่อหนี้แล้ว"])+'</th><th class="overlap-value">'+number(totals["บันทึกใบกันเหลื่อมแล้ว"])+'</th><th>'+number(rows.length)+'</th></tr>';
    el("statusRows").innerHTML=labels.length?body:'<tr><td colspan="5">ไม่พบข้อมูล</td></tr>';
  }
  function renderDetails() {
    el("detailRows").innerHTML=filteredRows.slice(0,500).map(function(r){var level=Number(r.importance_level||0),levelText=["ปกติ","มีปัญหาเล็กน้อย / ดำเนินการต่อได้","มีปัญหา / ไม่สามารถดำเนินการต่อได้"][level]||"ปกติ";function flag(v){return '<span class="stage-dot '+(Number(v)>0?'done':'pending')+'"></span>'+number(v);}
      var overlapClass=r.overlap_status==="ยังไม่ก่อหนี้"?"overlap-no-debt":(r.overlap_status==="ก่อหนี้แล้ว"?"overlap-debt":"overlap-saved"),overlap=r.overlap_status?'<span class="overlap-badge '+overlapClass+'">'+esc(r.overlap_status)+'</span>':'-';
      return '<tr><td><b>'+esc(r.pr_code)+'</b></td><td>'+esc(r.c_name)+'</td><td>'+esc(r.owner_name)+'</td><td>'+esc(r.fund_source)+'</td><td>'+esc(r.procurement_type)+'</td><td>'+esc(stage(r))+'</td><td>'+overlap+'</td><td><span class="level level-'+level+'">'+esc(levelText)+'</span></td><td>'+flag(r.period_total)+'</td><td>'+flag(r.arrival_total)+'</td><td>'+flag(r.inspection_total)+'</td><td>'+flag(r.paid_total)+'</td></tr>';}).join("")||'<tr><td colspan="12">ไม่พบข้อมูล</td></tr>';
  }
  function render(){renderMetrics();renderWorkload();renderPipeline();renderStatus();renderDetails();}
  function loadData(){el("loading").classList.add("show");fetch("../api/List_ProcurementProgress.php",{credentials:"same-origin"}).then(function(r){if(!r.ok)throw new Error("HTTP "+r.status);return r.json();}).then(function(j){if(!j.success)throw new Error(j.msg||"โหลดข้อมูลไม่สำเร็จ");allRows=j.data||[];fillSelect(el("yearFilter"),unique("i_yyyy").reverse(),"ทั้งหมด");fillSelect(el("fundFilter"),unique("fund_source"),"รวมทั้งหมด");fillSelect(el("statusOwnerFilter"),unique("owner_name"),"รวมทุกเจ้าหน้าที่");applyFilters();}).catch(function(err){alert("โหลดข้อมูลไม่สำเร็จ: "+err.message);}).finally(function(){el("loading").classList.remove("show");});}
  ["yearFilter","fundFilter"].forEach(function(id){el(id).addEventListener("change",applyFilters);}); el("statusOwnerFilter").addEventListener("change",renderStatus); el("keywordFilter").addEventListener("input",applyFilters); el("refreshButton").addEventListener("click",loadData);
  el("groupButtons").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;[].forEach.call(this.querySelectorAll("button"),function(x){x.classList.remove("active");});b.classList.add("active");groupField=b.getAttribute("data-group");renderWorkload();});
  document.querySelector(".dashboard-tabs").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;[].forEach.call(this.querySelectorAll("button"),function(x){x.classList.remove("active");});b.classList.add("active");el(b.getAttribute("data-target")).scrollIntoView({behavior:"smooth",block:"start"});});
  loadData();
}());
