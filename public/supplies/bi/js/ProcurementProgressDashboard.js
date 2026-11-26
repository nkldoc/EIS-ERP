(function () {
  "use strict";
  var allRows = [], filteredRows = [], workloadChart, dimensionChart, statusChart, ownerStatusChart, departmentStatusChart, ownerRelationChart, personalStatusChart, personalRadarChart, kpiCharts = [], groupField = "procurement_type", workloadMetric = "count", dimensionTableMetric = "count", sankeyMetric = "count", relationOwner = "";
  var colors = ["#168de2", "#11b997", "#f5b62e", "#ff7f43", "#7467c7", "#d65db1", "#5a9bd4", "#8bc56b"];
  function el(id) { return document.getElementById(id); }
  function esc(value) { return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) { return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function number(value) { return Number(value || 0).toLocaleString("th-TH"); }
  function money(value) { return Number(value || 0).toLocaleString("th-TH", {minimumFractionDigits: 2, maximumFractionDigits: 2}) + " บาท"; }
  function percent(value, total) { return total ? Math.round(value * 1000 / total) / 10 : 0; }
  function unique(field) { var map = {}; allRows.forEach(function (r) { if (r[field]) map[r[field]] = true; }); return Object.keys(map).sort(); }
  function fillSelect(select, values, firstLabel) { select.innerHTML = '<option value="">' + firstLabel + '</option>' + values.map(function (v) { return '<option value="' + esc(v) + '">' + esc(v) + '</option>'; }).join(""); }
  function statusDescription(status) {
    var descriptions={
      "รอดำเนินการ":"เริ่มจากเมนูจัดทำ PR แต่ยังไม่เข้าสู่ขั้นตอนดำเนินการจัดซื้อ และยังไม่มีสัญญาหรืองวดงาน",
      "อยู่ระหว่างดำเนินการ":"ตั้งแต่เมนูดำเนินการจัดซื้อ/จัดจ้าง จนถึงก่อนบันทึกสัญญาหรือใบสั่งซื้อ",
      "กำลังดำเนินการ":"ตั้งแต่เมนูดำเนินการจัดซื้อ/จัดจ้าง จนถึงก่อนบันทึกสัญญาหรือใบสั่งซื้อ",
      "บริหารสัญญา":"บันทึกสัญญาหรือใบสั่งซื้อแล้ว แต่ยังไม่ได้จัดทำงวดงาน",
      "บริหารสัญญา/งวด":"เริ่มจากเมนูจัดทำงวด เมื่อพบเลขที่งวด (period_id) อย่างน้อย 1 งวด",
      "รับของ":"เริ่มจากเมนูรับของ เมื่อมีวันที่รับของหรือเลขที่รับของของงวด",
      "ตรวจรับ":"เริ่มจากเมนูตรวจรับ เมื่อมีเลขที่ตรวจรับ (check_id) และวันที่หรือเลขที่ตรวจรับ",
      "ขอเบิกจ่าย":"เอกสารเบิกจ่ายที่ใช้งานมีสถานะตั้งแต่ 2 ขึ้นไป (ส่งตรวจรับ) และยังไม่ครบเงื่อนไขเบิกจ่ายสมบูรณ์",
      "เบิกจ่ายสมบูรณ์":"ทุกงวดมีรายการเบิกจ่าย และสถานะเบิกจ่ายจริงตั้งแต่ระดับ 11 ขึ้นไป",
      "เบิกจ่ายแล้ว":"ทุกงวดมีรายการเบิกจ่าย และสถานะเบิกจ่ายจริงตั้งแต่ระดับ 11 ขึ้นไป"
    };
    return descriptions[status]||"สถานะจากเหตุการณ์ติดตามงานล่าสุดของ PR";
  }
  function statusTitle(status){return ' data-status="'+esc(status)+'" data-status-tip="'+esc(statusDescription(status))+'" tabindex="0"';}
  function statusTooltipLines(status){var text=statusDescription(status),lines=[];while(text.length>46){var cut=text.lastIndexOf(" ",46);if(cut<24)cut=46;lines.push(text.slice(0,cut));text=text.slice(cut).trim();}if(text)lines.push(text);return lines;}
  function initStatusTooltips(){
    var tip=document.createElement("div");tip.className="status-tooltip";tip.setAttribute("role","tooltip");tip.innerHTML='<div class="status-tooltip-head"><span>i</span><b></b></div><p></p>';document.body.appendChild(tip);
    function show(target){var title=target.getAttribute("data-status")||"คำอธิบายสถานะ",description=target.getAttribute("data-status-tip");if(!description)return;tip.querySelector("b").textContent=title;tip.querySelector("p").textContent=description;tip.classList.add("show");position(target);}
    function position(target){var r=target.getBoundingClientRect(),w=tip.offsetWidth,h=tip.offsetHeight,left=Math.min(window.innerWidth-w-12,Math.max(12,r.left+r.width/2-w/2)),top=r.top-h-12,below=top<12;if(below)top=Math.min(window.innerHeight-h-12,r.bottom+12);tip.classList.toggle("below",below);tip.style.left=left+"px";tip.style.top=top+"px";}
    document.addEventListener("mouseover",function(e){var target=e.target.closest&&e.target.closest("[data-status-tip]");if(target)show(target);});
    document.addEventListener("mouseout",function(e){var target=e.target.closest&&e.target.closest("[data-status-tip]");if(target&&!target.contains(e.relatedTarget))tip.classList.remove("show");});
    document.addEventListener("focusin",function(e){var target=e.target.closest&&e.target.closest("[data-status-tip]");if(target)show(target);});
    document.addEventListener("focusout",function(e){if(e.target.closest&&e.target.closest("[data-status-tip]"))tip.classList.remove("show");});
    window.addEventListener("scroll",function(){tip.classList.remove("show");},true);window.addEventListener("resize",function(){tip.classList.remove("show");});
  }
  function stage(row) {
    if (Number(row.is_completed)) return "เบิกจ่ายสมบูรณ์";
    if (Number(row.billing_total)) return "ขอเบิกจ่าย";
    if (Number(row.inspection_total)) return "ตรวจรับ";
    if (Number(row.arrival_total)) return "รับของ";
    if (Number(row.period_total)) return "บริหารสัญญา/งวด";
    return row.current_progress || "อยู่ระหว่างดำเนินการ";
  }
  function applyFilters() {
    var fund = el("fundFilter").value, keyword = el("keywordFilter").value.toLowerCase();
    filteredRows = allRows.filter(function (r) { return (!fund || r.fund_source === fund) && (!keyword || [r.pr_code,r.c_name,r.owner_name,r.department_name].join(" ").toLowerCase().indexOf(keyword) >= 0); });
    updateReportContext();
    render();
  }
  function updateReportContext(){var from=el("yearFromFilter").value,to=el("yearToFilter").value,fund=el("fundFilter").value||"รวมทุกแหล่งเงิน",yearText=from===to?from:(from+" – "+to),now=new Date(),reportedAt=now.toLocaleString("th-TH",{dateStyle:"medium",timeStyle:"short"});el("reportContext").innerHTML='<strong>รายงานปีงบประมาณ '+esc(yearText)+'</strong><span>แหล่งเงิน: '+esc(fund)+'</span><small>'+number(filteredRows.length)+' รายการ</small><small class="report-generated-at">ณ วันที่เรียกรายงาน '+esc(reportedAt)+' น.</small>';document.title='Dashboard จัดซื้อจัดจ้าง | ปีงบประมาณ '+yearText+' | '+fund;}
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
    var methodFilter=el("workloadMethodFilter").value,chartRows=filteredRows.filter(function(r){return !methodFilter||procurementMethodGroup(r)===methodFilter;});
    chartRows.forEach(function (r) { var owner=r.owner_name||"ไม่ระบุ", key=groupField==="method_name"?procurementMethodLabel(r):(r[groupField]||"ไม่ระบุ");if(groupField==="procurement_type"&&String(key).indexOf("จ้าง")>=0)key="จ้าง";owners[owner]=(owners[owner]||0)+1;series[key]=series[key]||{};series[key][owner]=(series[key][owner]||0)+1; });
    var labels=Object.keys(owners).sort(function(a,b){return owners[b]-owners[a];}).slice(0,30),keys=Object.keys(series).sort();
    var datasets=keys.map(function(key,index){return {label:key,data:labels.map(function(owner){return series[key][owner]||0;}),backgroundColor:colors[index%colors.length],borderWidth:0};});
    if(workloadChart)workloadChart.destroy();
    workloadChart=new Chart(el("workloadChart"),{type:"bar",data:{labels:labels,datasets:datasets},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom"}},scales:{x:{stacked:true,grid:{display:false}},y:{stacked:true,beginAtZero:true,ticks:{precision:0},grid:{color:"#e8edf3"}}}}});
  }
  function renderDimensionChart() {
    var canvas=el("dimensionChart"),oldError=document.querySelector(".dimension-error");if(oldError)oldError.remove();canvas.style.display="block";
    var axis=el("workloadAxis").value,colorField=el("workloadColor").value,axisTotals={},series={};
    var dimensionLabels={status:"สถานะ",owner_name:"เจ้าหน้าที่",procurement_type:"ประเภทงาน",method_name:"วิธีจัดหา",fund_source:"แหล่งเงิน"};document.querySelector(".dimension-heading h2").textContent="ปริมาณงานตาม"+dimensionLabels[axis]+" แยกสีตาม"+dimensionLabels[colorField];
    function dimension(row,field){var value,current;if(field==="status"){current=stage(row);if(statusDescription(current)!=="สถานะจากเหตุการณ์ติดตามงานล่าสุดของ PR")return current;if(/ยกเลิก/.test(current))return "ยกเลิก";return "อื่น/ปัญหา";}if(field==="method_name")return procurementMethodLabel(row);value=row[field]||"ไม่ระบุ";if(field==="procurement_type"&&String(value).indexOf("จ้างไม่ได้ของ")>=0)return "จ้าง";return value;}
    filteredRows.forEach(function(r){var x=dimension(r,axis),key=dimension(r,colorField),value=workloadMetric==="amount"?Number(r.pr_amount||0)/1000000:1;axisTotals[x]=(axisTotals[x]||0)+value;series[key]=series[key]||{};series[key][x]=(series[key][x]||0)+value;});
    var statusOrder=["รอดำเนินการ","อยู่ระหว่างดำเนินการ","บริหารสัญญา","บริหารสัญญา/งวด","รับของ","ตรวจรับ","ขอเบิกจ่าย","เบิกจ่ายสมบูรณ์"],labels=Object.keys(axisTotals);
    if(axis==="status")labels.sort(function(a,b){var ai=statusOrder.indexOf(a),bi=statusOrder.indexOf(b);return (ai<0?99:ai)-(bi<0?99:bi);});else labels.sort(function(a,b){return axisTotals[b]-axisTotals[a];});if(axis==="owner_name")labels=labels.slice(0,30);
    var keys=Object.keys(series).sort(),datasets=keys.map(function(key,index){return {label:key,data:labels.map(function(label){return series[key][label]||0;}),backgroundColor:colors[index%colors.length],borderWidth:0,borderRadius:3};});
    if(dimensionChart)dimensionChart.destroy();
    dimensionChart=new Chart(el("dimensionChart"),{type:"bar",data:{labels:labels,datasets:datasets},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:"index",intersect:false},plugins:{legend:{position:"bottom",labels:{usePointStyle:true,padding:18}},tooltip:{backgroundColor:"#17243a",padding:13,cornerRadius:10,callbacks:{label:function(c){var value=workloadMetric==="amount"?Number(c.raw).toLocaleString("th-TH",{minimumFractionDigits:2,maximumFractionDigits:2})+" ล้านบาท":number(c.raw)+" งาน";return c.dataset.label+": "+value;},footer:function(items){var total=items.reduce(function(sum,item){return sum+Number(item.raw||0);},0);return "รวม: "+(workloadMetric==="amount"?total.toLocaleString("th-TH",{minimumFractionDigits:2,maximumFractionDigits:2})+" ล้านบาท":number(total)+" งาน");}}}},scales:{x:{stacked:true,grid:{display:false},ticks:{maxRotation:25,minRotation:0}},y:{stacked:true,beginAtZero:true,ticks:{precision:workloadMetric==="amount"?2:0,callback:function(value){return workloadMetric==="amount"?number(value)+" ลบ.":number(value);}},grid:{color:"#e8edf3"}}}}});
  }
  function renderDimensionTable(){
    var field=el("dimensionTableColumns").value,labels={procurement_type:"ประเภทงาน",method_name:"วิธีจัดหา",fund_source:"แหล่งเงิน",owner_name:"เจ้าหน้าที่"},matrix={},columnTotals={},rowTotals={};
    function columnValue(row){if(field==="procurement_type")return flowTypeLabel(row);if(field==="method_name")return procurementMethodLabel(row);return row[field]||"ไม่ระบุ";}
    function empty(){return {count:0,amount:0};}function add(target,row){target.count++;target.amount+=Number(row.pr_amount||0);}
    filteredRows.forEach(function(row){var status=flowStatusLabel(row),column=columnValue(row);matrix[status]=matrix[status]||{};matrix[status][column]=matrix[status][column]||empty();columnTotals[column]=columnTotals[column]||empty();rowTotals[status]=rowTotals[status]||empty();add(matrix[status][column],row);add(columnTotals[column],row);add(rowTotals[status],row);});
    var statusOrder=["รอดำเนินการ","อยู่ระหว่างดำเนินการ","บริหารสัญญา","บริหารสัญญา/งวด","รับของ","ตรวจรับ","ขอเบิกจ่าย","เบิกจ่ายสมบูรณ์","อื่น/ปัญหา","ยกเลิก"],statuses=Object.keys(matrix).sort(function(a,b){var ai=statusOrder.indexOf(a),bi=statusOrder.indexOf(b);return (ai<0?99:ai)-(bi<0?99:bi);}),columns=Object.keys(columnTotals).sort(function(a,b){return columnTotals[b].count-columnTotals[a].count;});
    function cell(value,total){if(!value||(!value.count&&!value.amount))return '<td class="dimension-zero">–</td>';var cls=total?' class="dimension-total"':'';if(dimensionTableMetric==="amount")return '<td'+cls+'><b>'+Number(value.amount/1000000).toLocaleString("th-TH",{minimumFractionDigits:2,maximumFractionDigits:2})+'</b><small>ลบ.</small></td>';if(dimensionTableMetric==="both")return '<td'+cls+'><b>'+number(value.count)+'</b><small>'+Number(value.amount/1000000).toLocaleString("th-TH",{minimumFractionDigits:2,maximumFractionDigits:2})+' ลบ.</small></td>';return '<td'+cls+'><b>'+number(value.count)+'</b></td>';}
    var grand=empty();filteredRows.forEach(function(row){add(grand,row);});var html='<table><thead><tr><th>สถานะ (เรียงตามมาตรฐาน)</th>'+columns.map(function(column){return '<th>'+esc(column)+'</th>';}).join('')+'<th class="dimension-total">รวมทั้งหมด</th></tr></thead><tbody>'+statuses.map(function(status,i){return '<tr><td class="status-hover"'+statusTitle(status)+'><span class="dimension-status-dot" style="background:'+colors[i%colors.length]+'"></span>'+esc(status)+'</td>'+columns.map(function(column){return cell(matrix[status][column],false);}).join('')+cell(rowTotals[status],true)+'</tr>';}).join('')+'<tr class="dimension-grand-total"><th>รวมทุกสถานะ</th>'+columns.map(function(column){return cell(columnTotals[column],false).replace(/^<td/,'<th').replace(/<\/td>$/,'</th>');}).join('')+cell(grand,true).replace(/^<td/,'<th').replace(/<\/td>$/,'</th>')+'</tr></tbody></table>';
    el("dimensionSummaryTable").innerHTML=html;var heading=document.querySelector(".dimension-table-heading h3"),metricText=dimensionTableMetric==="amount"?"วงเงิน":(dimensionTableMetric==="both"?"จำนวนงานและวงเงิน":"จำนวนงาน");heading.textContent="ตารางสรุป"+metricText+": สถานะ × "+labels[field];
  }
  function procurementMethodGroup(row){var method=String(row.method_name||"").toLowerCase(),amount=Number(row.pr_amount||0);if(/e[\s-]*bidding|ประกวดราคา.*อิเล็กทรอนิกส์/.test(method))return "ebidding";if(/คัดเลือก/.test(method))return "selection";if(/เฉพาะเจาะจง|เจาะจง/.test(method))return amount>500000?"specific_over":"specific_under";return "other";}
  function procurementMethodLabel(row){return {ebidding:"E-Bidding",selection:"คัดเลือก",specific_over:"เฉพาะเจาะจง (> 5 แสน)",specific_under:"เฉพาะเจาะจง (≤ 5 แสน)",other:"วิธีอื่น ๆ"}[procurementMethodGroup(row)];}
  function procurementTypeGroup(row){var type=String(row.procurement_type||"");if(type.indexOf("ครุภัณฑ์")>=0)return "durable";if(type.indexOf("วัสดุ")>=0)return "material";if(type.indexOf("จ้าง")>=0)return "service";return "other";}
  function flowTypeLabel(row){var value=String(row.procurement_type||"ไม่ระบุ");return value.indexOf("จ้างไม่ได้ของ")>=0?"จ้าง":value;}
  function flowStatusLabel(row){var current=stage(row);if(statusDescription(current)!=="สถานะจากเหตุการณ์ติดตามงานล่าสุดของ PR")return current;if(/ยกเลิก/.test(current))return "ยกเลิก";return "อื่น/ปัญหา";}
  function renderSankey(){
    var holder=el("sankeyChart");if(!holder)return;holder.innerHTML="";if(!window.d3||!d3.sankey){holder.innerHTML='<div class="empty-state">ไม่สามารถโหลดส่วนแสดงผล Sankey ได้</div>';return;}
    var nodeMap={},linkMap={},palette=["#5046e5","#14a6dc","#12b886","#f59e0b","#e64398","#ef4444","#64748b","#7c3aed"];
    function node(id,label,layer){if(!nodeMap[id])nodeMap[id]={id:id,label:label,layer:layer};return nodeMap[id];}
    function link(source,target,value){var key=source+">"+target;linkMap[key]=linkMap[key]||{source:source,target:target,value:0};linkMap[key].value+=value;}
    filteredRows.forEach(function(row){var value=sankeyMetric==="amount"?Number(row.pr_amount||0):1;if(value<=0)return;var type=flowTypeLabel(row),method=procurementMethodLabel(row),status=flowStatusLabel(row),typeId="t|"+type,methodId="m|"+method,statusId="s|"+status;node(typeId,type,0);node(methodId,method,1);node(statusId,status,2);link(typeId,methodId,value);link(methodId,statusId,value);});
    var nodes=Object.keys(nodeMap).map(function(k){return nodeMap[k];}),links=Object.keys(linkMap).map(function(k){return linkMap[k];});if(!links.length){holder.innerHTML='<div class="empty-state">ไม่พบข้อมูลตามเงื่อนไขที่เลือก</div>';return;}
    var width=Math.max(760,holder.clientWidth||1200),maxLayer=Math.max.apply(null,[0,1,2].map(function(layer){return nodes.filter(function(n){return n.layer===layer;}).length;})),height=Math.min(760,Math.max(470,maxLayer*46+70));
    var statusOrder=["รอดำเนินการ","อยู่ระหว่างดำเนินการ","บริหารสัญญา","บริหารสัญญา/งวด","รับของ","ตรวจรับ","ขอเบิกจ่าย","เบิกจ่ายสมบูรณ์","อื่น/ปัญหา","ยกเลิก"];
    var graph=d3.sankey().nodeId(function(d){return d.id;}).nodeSort(function(a,b){
      if(a.layer===2&&b.layer===2){var ai=statusOrder.indexOf(a.label),bi=statusOrder.indexOf(b.label);return (ai<0?99:ai)-(bi<0?99:bi)||a.label.localeCompare(b.label);}
      return a.index-b.index;
    }).nodeWidth(18).nodePadding(16).nodeAlign(d3.sankeyJustify).extent([[16,20],[width-16,height-28]])({nodes:nodes.map(function(d){return Object.assign({},d);}),links:links.map(function(d){return Object.assign({},d);})});
    graph.nodes.forEach(function(n,i){n.color=palette[(n.layer*2+i)%palette.length];});var svg=d3.select(holder).append("svg").attr("viewBox","0 0 "+width+" "+height).attr("role","img");
    var tip=d3.select("body").selectAll(".sankey-tooltip").data([null]).join("div").attr("class","sankey-tooltip");function fmt(v){return sankeyMetric==="amount"?Number(v).toLocaleString("th-TH",{minimumFractionDigits:2,maximumFractionDigits:2})+" บาท":number(v)+" รายการ";}function showTip(event,title,value){tip.html('<b>'+esc(title)+'</b><span>'+esc(fmt(value))+'</span>').classed("show",true).style("left",Math.min(window.innerWidth-300,event.clientX+14)+"px").style("top",Math.max(10,event.clientY-22)+"px");}
    svg.append("g").selectAll("path").data(graph.links).join("path").attr("d",d3.sankeyLinkHorizontal()).attr("fill","none").attr("stroke",function(d){return d.source.color;}).attr("stroke-opacity",.27).attr("stroke-width",function(d){return Math.max(1,d.width);}).on("mouseenter",function(event,d){d3.select(this).attr("stroke-opacity",.58);showTip(event,d.source.label+" ➔ "+d.target.label,d.value);}).on("mousemove",function(event,d){showTip(event,d.source.label+" ➔ "+d.target.label,d.value);}).on("mouseleave",function(){d3.select(this).attr("stroke-opacity",.27);tip.classed("show",false);});
    var groups=svg.append("g").selectAll("g").data(graph.nodes).join("g").on("mouseenter",function(event,d){showTip(event,d.label,d.value);}).on("mousemove",function(event,d){showTip(event,d.label,d.value);}).on("mouseleave",function(){tip.classed("show",false);});groups.append("rect").attr("x",function(d){return d.x0;}).attr("y",function(d){return d.y0;}).attr("height",function(d){return Math.max(2,d.y1-d.y0);}).attr("width",function(d){return d.x1-d.x0;}).attr("rx",4).attr("fill",function(d){return d.color;});groups.append("text").attr("x",function(d){return d.layer===2?d.x0-8:d.x1+8;}).attr("y",function(d){return (d.y0+d.y1)/2;}).attr("dy",".35em").attr("text-anchor",function(d){return d.layer===2?"end":"start";}).text(function(d){var label=d.label.length>28?d.label.slice(0,27)+"…":d.label;return label+" ("+(sankeyMetric==="amount"?(d.value/1000000).toLocaleString("th-TH",{maximumFractionDigits:1})+" ลบ.":number(d.value))+")";});
    holder.style.height=height+"px";
  }
  function renderPipeline() {
    function sum(field){return filteredRows.reduce(function(total,row){return total+Number(row[field]||0);},0);}
    function fundBreakdown(field){var funds={};filteredRows.forEach(function(row){var amount=Number(row[field]||0),fund=row.fund_source||"ไม่ระบุแหล่งเงิน";if(amount>0)funds[fund]=(funds[fund]||0)+amount;});return Object.keys(funds).map(function(name){return {name:name,amount:funds[name]};}).sort(function(a,b){return b.amount-a.amount;});}
    function fundHtml(field){var funds=fundBreakdown(field);return '<div class="pipeline-funds">'+(funds.length?funds.map(function(fund){return '<div><span title="'+esc(fund.name)+'">'+esc(fund.name)+'</span><b>'+money(fund.amount)+'</b></div>';}).join(''):'<div class="pipeline-fund-empty">ยังไม่มียอดเงินตามแหล่งเงิน</div>')+'</div>';}
    var total=filteredRows.length, steps=[["1. จัดทำงวด",filteredRows.filter(function(r){return Number(r.period_total)>0;}).length,sum("period_amount"),"period_amount","มี period_id"],["2. รับของ",filteredRows.filter(function(r){return Number(r.arrival_total)>0;}).length,sum("arrival_amount"),"arrival_amount","มีวันที่/เลขรับของ"],["3. ตรวจรับ",filteredRows.filter(function(r){return Number(r.inspection_total)>0;}).length,sum("inspection_amount"),"inspection_amount","มี check_id และข้อมูลตรวจรับ"],["4. เบิกจ่ายสมบูรณ์",filteredRows.filter(function(r){return Number(r.is_completed)>0;}).length,sum("paid_amount"),"paid_amount","ทุกงวดมี po_working และสถานะ ≥ 11"]];
    var pipelineStatuses=["บริหารสัญญา/งวด","รับของ","ตรวจรับ","เบิกจ่ายสมบูรณ์"];
    el("pipelineGrid").innerHTML=steps.map(function(s,i){var p=percent(s[1],total);return '<article class="pipeline-step"'+statusTitle(pipelineStatuses[i])+'><header><b>'+s[0]+'</b><strong>'+number(s[1])+'</strong></header><div class="pipeline-amount"><span>ยอดเงินรวม</span><b>'+money(s[2])+'</b></div>'+fundHtml(s[3])+'<div class="progress green-bar"><span style="width:'+p+'%"></span></div><small>'+p+'% · '+s[4]+'</small></article>';}).join("");
  }
  var overlapGroups = ["ยังไม่ก่อหนี้", "ก่อหนี้แล้ว", "บันทึกใบกันเหลื่อมแล้ว", "ต้องตรวจสอบ", "ไม่เข้าข่ายกันเหลื่อม"];
  function overlapRows(status, group) {
    var owner = el("statusOwnerFilter").value;
    return filteredRows.filter(function (r) { return (!owner || r.owner_name === owner) && (!status || stage(r) === status) && (!group || r.overlap_status === group); });
  }
  function overlapCountButton(count, status, group) {
    return '<button type="button" class="overlap-count" data-overlap-filter="' + esc(group || "") + '" data-stage-filter="' + esc(status || "") + '"' + (count ? '' : ' disabled') + ' aria-label="ดูรายการ ' + esc(group || 'ทั้งหมด') + ' ' + number(count) + ' รายการ">' + number(count) + '</button>';
  }
  function overlapEvidenceHtml(r) {
    var warnings = (r.overlap_warnings || []).map(function (warning) { return '<li>' + esc(warning) + '</li>'; }).join("");
    return '<div class="overlap-pr-detail"><p><b>' + esc(r.pr_code) + '</b> · ' + esc(r.c_name) + '</p><p>เจ้าหน้าที่: ' + esc(r.owner_name) + ' · หน่วยงาน: ' + esc(r.department_name) + ' · วงเงิน PR: ' + money(r.pr_amount) + '</p><p>การก่อหนี้: <b>' + esc(r.overlap_debt_status) + '</b> · กลุ่มใบกัน: <b>' + esc(r.overlap_status) + '</b></p>' + (warnings ? '<ul class="overlap-warnings">' + warnings + '</ul>' : '') +
      '<div class="table-scroll"><table><thead><tr><th>ต้นทาง</th><th>เลข PR / สัญญา / AP</th><th>ช่องที่บันทึก</th><th>เลขใบกัน</th><th>ปีที่บันทึก</th><th>ผลตรวจทะเบียน NMU_EIS</th></tr></thead><tbody>' + (r.overlap_evidence || []).map(function (item) {
        return '<tr><td>' + esc(item.source) + '</td><td>' + esc(item.reference || '-') + '</td><td><code>' + esc(item.field) + '</code></td><td>' + esc(item.code || 'ยังไม่ระบุ') + '</td><td>' + esc(item.year || '-') + '</td><td>' + (item.verified ? 'พบใบกัน · ปี ' + esc(item.document_year || '-') + (item.document_status == null ? ' · ทะเบียนงบกันเหลื่อม' : ' · รหัสสถานะ ' + esc(item.document_status)) : (item.code ? 'ไม่พบใบกันที่ใช้งาน' : 'ยังไม่มีเลขใบกัน')) + (item.year_mismatch ? ' · ปีไม่ตรงกัน' : '') + '</td></tr>';
      }).join("") + '</tbody></table></div></div>';
  }
  function openOverlapDetails(status, group) {
    var rows = overlapRows(status, group), dialog = el("overlapDialog");
    el("overlapDialogTitle").textContent = (group || "รายการทั้งหมด") + (status ? " · " + status : "");
    el("overlapDialogCount").textContent = number(rows.length) + " PR · " + (el("statusOwnerFilter").value || "รวมทุกเจ้าหน้าที่") + " · คลิกเลข PR เพื่อดูหลักฐาน PR / PO / AP";
    el("overlapDialogRows").innerHTML = rows.map(function (r) {
      var contracts = Array.from(new Set((r.overlap_evidence || []).filter(function (i) { return i.source === 'PO'; }).map(function (i) { return i.reference; })));
      return '<tr><td><button class="pr-detail-toggle" type="button" data-pr-detail="' + Number(r.tor_id) + '" aria-expanded="false">' + esc(r.pr_code) + '</button></td><td class="overlap-project">' + esc(r.c_name) + '</td><td>' + esc(contracts.join(' / ') || 'ยังไม่มีสัญญา') + '</td><td>' + esc((r.overlap_codes || []).join(' / ') || 'ยังไม่มีเลขใบกัน') + '</td><td>' + esc(r.overlap_status) + '</td><td>' + esc(r.overlap_debt_status) + '</td><td>' + ((r.overlap_warnings || []).length ? '<span class="overlap-warning-tag">ต้องตรวจสอบ ' + number(r.overlap_warnings.length) + ' จุด</span>' : '—') + '</td></tr>' +
        '<tr id="overlap-pr-' + Number(r.tor_id) + '" hidden><td colspan="7">' + overlapEvidenceHtml(r) + '</td></tr>';
    }).join("") || '<tr><td colspan="7">ไม่พบข้อมูล</td></tr>';
    if (!dialog.open) dialog.showModal();
  }
  function renderStatus() {
    var selected=el("statusOwnerFilter").value, rows=selected?filteredRows.filter(function(r){return r.owner_name===selected;}):filteredRows, counts={}, matrix={};
    var statusOrder=["รอดำเนินการ","อยู่ระหว่างดำเนินการ","บริหารสัญญา","บริหารสัญญา/งวด","รับของ","ตรวจรับ","ขอเบิกจ่าย","เบิกจ่ายสมบูรณ์"];
    rows.forEach(function(r){var key=stage(r), overlap=r.overlap_status||"ไม่เข้าข่ายกันเหลื่อม";counts[key]=(counts[key]||0)+1;matrix[key]=matrix[key]||{};matrix[key][overlap]=(matrix[key][overlap]||0)+1;}); var labels=Object.keys(counts).sort(function(a,b){var ai=statusOrder.indexOf(a),bi=statusOrder.indexOf(b);return (ai<0?99:ai)-(bi<0?99:bi)||a.localeCompare(b);}), values=labels.map(function(k){return counts[k];});
    if(statusChart) statusChart.destroy();
    statusChart=new Chart(el("statusChart"),{type:"doughnut",data:{labels:labels,datasets:[{data:values,backgroundColor:colors,borderWidth:3,borderColor:"#fff"}]},options:{responsive:true,maintainAspectRatio:false,cutout:"63%",plugins:{legend:{position:"bottom"},tooltip:{backgroundColor:"#17243a",titleColor:"#fff",bodyColor:"#e6eef8",padding:14,cornerRadius:10,displayColors:true,callbacks:{afterLabel:function(c){return statusTooltipLines(c.label);}}}}}});
    var totals={}; overlapGroups.forEach(function (group) { totals[group]=0; });
    var body=labels.map(function(k,i){return '<tr><td class="status-hover"'+statusTitle(k)+'>'+esc(k)+'</td>'+overlapGroups.map(function(group){var count=matrix[k][group]||0;totals[group]+=count;return '<td class="overlap-value">'+overlapCountButton(count,k,group)+'</td>';}).join('')+'<td>'+overlapCountButton(values[i],k,'')+'</td></tr>';}).join("");
    body+='<tr><th>รวมทั้งหมด</th>'+overlapGroups.map(function(group){return '<th class="overlap-value">'+overlapCountButton(totals[group],'',group)+'</th>';}).join('')+'<th>'+overlapCountButton(rows.length,'','')+'</th></tr>';
    el("statusRows").innerHTML=labels.length?body:'<tr><td colspan="7">ไม่พบข้อมูล</td></tr>';
  }
  function detailStatusCounts() {
    var counts = new Map(), order = ["รอดำเนินการ","อยู่ระหว่างดำเนินการ","บริหารสัญญา","บริหารสัญญา/งวด","รับของ","ตรวจรับ","ขอเบิกจ่าย","เบิกจ่ายสมบูรณ์"];
    filteredRows.forEach(function (r) { var status = stage(r); counts.set(status, (counts.get(status) || 0) + 1); });
    return Array.from(counts.keys()).sort(function (a, b) {
      var ai = order.indexOf(a), bi = order.indexOf(b);
      return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi) || a.localeCompare(b);
    }).map(function (status) { return [status, counts.get(status)]; });
  }
  function exportDetails() {
    var headers = ["เลข PR","โครงการ/รายการ","เจ้าหน้าที่","แหล่งเงิน","ประเภท","สถานะล่าสุด","สถานะใบกันเหลื่อม","ระดับปัญหา","งวด","รับของ","ตรวจรับ","เบิกสมบูรณ์"];
    var rows = filteredRows.map(function (r) {
      return [String(r.pr_code || ""), r.c_name || "", r.owner_name || "", r.fund_source || "", r.procurement_type || "", stage(r), r.overlap_status || "-",
        ["ปกติ","มีปัญหาเล็กน้อย / ดำเนินการต่อได้","มีปัญหา / ไม่สามารถดำเนินการต่อได้"][Number(r.importance_level || 0)] || "ปกติ",
        Number(r.period_total || 0), Number(r.arrival_total || 0), Number(r.inspection_total || 0), Number(r.paid_total || 0)];
    });
    var workbook = XLSX.utils.book_new(), sheet = XLSX.utils.aoa_to_sheet([headers].concat(rows));
    sheet["!cols"] = [22,70,28,26,24,28,28,44,12,12,12,16].map(function (width) { return {wch: width}; });
    sheet["!autofilter"] = {ref: sheet["!ref"]};
    XLSX.utils.book_append_sheet(workbook, sheet, "รายการทั้งหมด");
    var summary = [["ปีงบประมาณ", el("yearFromFilter").value + " - " + el("yearToFilter").value], ["แหล่งเงิน", el("fundFilter").value || "รวมทั้งหมด"], ["คำค้น", el("keywordFilter").value], [], ["สถานะ", "จำนวนรายการ"]]
      .concat(detailStatusCounts(), [["รวมทั้งหมด", filteredRows.length]]);
    var summarySheet = XLSX.utils.aoa_to_sheet(summary);
    summarySheet["!cols"] = [{wch: 42}, {wch: 28}];
    XLSX.utils.book_append_sheet(workbook, summarySheet, "สรุปสถานะ");
    var evidenceRows = [["เลข PR", "กลุ่มใบกัน", "การก่อหนี้", "ต้นทาง", "เลขอ้างอิง", "ช่องที่บันทึก", "เลขใบกัน", "ปีที่บันทึก", "พบในทะเบียน", "ปีในทะเบียน", "คำเตือน"]];
    filteredRows.forEach(function (r) {
      (r.overlap_evidence || []).forEach(function (item) {
        evidenceRows.push([r.pr_code, r.overlap_status, r.overlap_debt_status, item.source, item.reference, item.field, item.code,
          item.year || "", item.verified ? "พบ" : (item.code ? "ไม่พบ" : "ยังไม่ระบุ"), item.document_year || "", (r.overlap_warnings || []).join(" / ")]);
      });
    });
    var evidenceSheet = XLSX.utils.aoa_to_sheet(evidenceRows);
    evidenceSheet["!cols"] = [22,28,20,18,26,24,30,16,18,16,70].map(function (width) { return {wch:width}; });
    evidenceSheet["!autofilter"] = {ref:evidenceSheet["!ref"]};
    XLSX.utils.book_append_sheet(workbook, evidenceSheet, "หลักฐานใบกัน PR PO AP");
    XLSX.writeFile(workbook, "ProcurementProgress_" + el("yearFromFilter").value + "_" + el("yearToFilter").value + ".xlsx");
  }
  function renderDetails() {
    el("exportDetailsButton").disabled = filteredRows.length === 0;
    el("detailSummary").innerHTML = '<strong>รวมทั้งหมด ' + number(filteredRows.length) + ' รายการ</strong>' + detailStatusCounts().map(function (entry) {
      return '<span class="detail-status-count">' + esc(entry[0]) + ' <b>' + number(entry[1]) + '</b></span>';
    }).join("") + (filteredRows.length > 500 ? '<small>แสดง 500 รายการแรก · Export Excel ได้ครบทั้งหมด</small>' : "");
    el("detailRows").innerHTML=filteredRows.slice(0,500).map(function(r){var level=Number(r.importance_level||0),levelText=["ปกติ","มีปัญหาเล็กน้อย / ดำเนินการต่อได้","มีปัญหา / ไม่สามารถดำเนินการต่อได้"][level]||"ปกติ";function flag(v){return '<span class="stage-dot '+(Number(v)>0?'done':'pending')+'"></span>'+number(v);}
      var overlapClass=r.overlap_status==="ยังไม่ก่อหนี้"?"overlap-no-debt":(r.overlap_status==="ก่อหนี้แล้ว"?"overlap-debt":"overlap-saved"),overlap=r.overlap_status?'<span class="overlap-badge '+overlapClass+'">'+esc(r.overlap_status)+'</span>':'-';
      var currentStage=stage(r);return '<tr><td><b>'+esc(r.pr_code)+'</b></td><td>'+esc(r.c_name)+'</td><td>'+esc(r.owner_name)+'</td><td>'+esc(r.fund_source)+'</td><td>'+esc(r.procurement_type)+'</td><td class="status-hover"'+statusTitle(currentStage)+'>'+esc(currentStage)+'</td><td>'+overlap+'</td><td><span class="level level-'+level+'">'+esc(levelText)+'</span></td><td>'+flag(r.period_total)+'</td><td>'+flag(r.arrival_total)+'</td><td>'+flag(r.inspection_total)+'</td><td>'+flag(r.paid_total)+'</td></tr>';}).join("")||'<tr><td colspan="12">ไม่พบข้อมูล</td></tr>';
  }
  function statusMatrix(rows,field,selectedStatus){
    var statusOrder=["รอดำเนินการ","อยู่ระหว่างดำเนินการ","บริหารสัญญา","บริหารสัญญา/งวด","รับของ","ตรวจรับ","ขอเบิกจ่าย","เบิกจ่ายสมบูรณ์"];
    function compareStatus(a,b){var ai=statusOrder.indexOf(a),bi=statusOrder.indexOf(b);return (ai<0?99:ai)-(bi<0?99:bi)||a.localeCompare(b);}
    var columns={},matrix={},totals={};rows.forEach(function(r){var col=r[field]||"ไม่ระบุ",s=stage(r);columns[col]=(columns[col]||0)+1;matrix[s]=matrix[s]||{};matrix[s][col]=(matrix[s][col]||0)+1;totals[s]=(totals[s]||0)+1;});
    var names=Object.keys(columns).sort(function(a,b){return columns[b]-columns[a];}),statuses=Object.keys(matrix).sort(compareStatus);if(selectedStatus)statuses=statuses.filter(function(s){return s===selectedStatus;});
    var html='<table><thead><tr><th>สถานะ</th>'+names.map(function(n){return '<th>'+esc(n)+'</th>';}).join('')+'<th>รวม</th></tr></thead><tbody>'+statuses.map(function(s,i){return '<tr><td class="status-hover"'+statusTitle(s)+'><i class="matrix-dot" style="background:'+colors[i%colors.length]+'"></i>'+esc(s)+'</td>'+names.map(function(n){return '<td>'+number(matrix[s][n]||0)+'</td>';}).join('')+'<td><b>'+number(totals[s])+'</b></td></tr>';}).join('')+'<tr class="matrix-total"><th>รวมทั้งหมด</th>'+names.map(function(n){return '<th>'+number(columns[n])+'</th>';}).join('')+'<th>'+number(rows.length)+'</th></tr></tbody></table>';
    var labels=Object.keys(totals).sort(compareStatus);
    return {html:html,labels:labels,values:labels.map(function(s){return totals[s];}),columns:names,matrix:matrix};
  }
  function renderCrossReports(){
    var ownerFilter=el("ownerMatrixFilter").value,ownerTypeFilter=el("ownerTypeFilter").value,departmentFilter=el("departmentMatrixFilter").value;
    var ownerBaseRows=ownerTypeFilter?filteredRows.filter(function(r){return procurementTypeGroup(r)===ownerTypeFilter;}):filteredRows;
    var ownerRows=ownerFilter?ownerBaseRows.filter(function(r){return r.owner_name===ownerFilter;}):ownerBaseRows,departmentRows=departmentFilter?filteredRows.filter(function(r){return r.department_name===departmentFilter;}):filteredRows;
    var om=statusMatrix(ownerRows,"owner_name"),dm=statusMatrix(departmentRows,"department_name");el("ownerStatusMatrix").innerHTML=om.html;el("departmentStatusMatrix").innerHTML=dm.html;
    function doughnut(canvas,current,data,onSelect){if(current)current.destroy();return new Chart(el(canvas),{type:'doughnut',data:{labels:data.labels,datasets:[{data:data.values,backgroundColor:colors,borderColor:'#fff',borderWidth:5}]},options:{responsive:true,maintainAspectRatio:false,cutout:'55%',plugins:{legend:{display:false},tooltip:{backgroundColor:'#17243a',titleColor:'#fff',bodyColor:'#e6eef8',padding:14,cornerRadius:10,callbacks:{label:function(c){return c.label+': '+number(c.raw)+' ('+percent(c.raw,data.values.reduce(function(a,b){return a+b;},0))+'%)';},afterLabel:function(c){return statusTooltipLines(c.label);}}}},onClick:function(e,items){onSelect(items.length?data.labels[items[0].index]:"");}}});}
    ownerStatusChart=doughnut("ownerStatusChart",ownerStatusChart,om,function(s){el("ownerStatusMatrix").innerHTML=statusMatrix(ownerRows,"owner_name",s).html;});departmentStatusChart=doughnut("departmentStatusChart",departmentStatusChart,dm,function(s){el("departmentStatusMatrix").innerHTML=statusMatrix(departmentRows,"department_name",s).html;});
    var owners=uniqueFiltered("owner_name"),relationRows=relationOwner?filteredRows.filter(function(r){return r.owner_name===relationOwner;}):filteredRows,rm=statusMatrix(relationRows,"owner_name");
    el("relationOwnerButtons").innerHTML='<button class="'+(!relationOwner?'active':'')+'" data-owner="">รวมทั้งหมด</button>'+owners.map(function(o){return '<button class="'+(relationOwner===o?'active':'')+'" data-owner="'+esc(o)+'">'+esc(o)+'</button>';}).join('');
    var datasets=(relationOwner?[relationOwner]:owners).map(function(owner,i){var values=rm.labels.map(function(s){return rm.matrix[s]&&rm.matrix[s][owner]||0;});return {label:owner,data:values,borderColor:colors[i%colors.length],backgroundColor:'transparent',pointBackgroundColor:colors[i%colors.length],borderWidth:2};});if(ownerRelationChart)ownerRelationChart.destroy();ownerRelationChart=new Chart(el("ownerRelationChart"),{type:'radar',data:{labels:rm.labels,datasets:datasets},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'},tooltip:{backgroundColor:'#17243a',titleColor:'#fff',bodyColor:'#e6eef8',padding:14,cornerRadius:10,callbacks:{afterLabel:function(c){return statusTooltipLines(c.label);}}}},scales:{r:{beginAtZero:true,ticks:{precision:0}}}}});el("ownerRelationMatrix").innerHTML=rm.html;
  }
  function uniqueFiltered(field){var m={};filteredRows.forEach(function(r){if(r[field])m[r[field]]=1;});return Object.keys(m).sort();}
  function parseDate(value){if(!value)return null;var d=new Date(String(value).replace(" ","T"));return isNaN(d.getTime())?null:d;}
  function thaiDate(date){if(!date)return "-";return String(date.getDate()).padStart(2,"0")+"/"+String(date.getMonth()+1).padStart(2,"0")+"/"+(date.getFullYear()+543);}
  function warningInfo(row){var start=parseDate(row.announcement_date)||parseDate(row.procurement_start_date)||parseDate(row.contract_date);if(!start)return null;var due=parseDate(row.contract_due_date);if(!due){due=new Date(start.getTime());due.setDate(due.getDate()+60);}var today=new Date(),target=Math.max(1,Math.ceil((due-start)/86400000)),used=Math.max(0,Math.ceil((today-start)/86400000)),ratio=used*100/target,level=ratio>100?3:(ratio>75?2:(ratio>50?1:0));return {start:start,due:due,target:target,used:used,ratio:ratio,level:level};}
  function kpiTarget(row){var method=String(row.method_name||"").toLowerCase();if(/e[\s-]*bidding/.test(method))return 100;if(/เฉพาะเจาะจง|เจาะจง/.test(method)&&Number(row.pr_amount)>500000)return 75;return 60;}
  function kpiResult(row){var start=parseDate(row.announcement_date)||parseDate(row.procurement_start_date);if(!start)return 3;var target=kpiTarget(row),due=new Date(start.getTime());due.setDate(due.getDate()+target);if(Number(row.is_completed)){var paid=parseDate(row.paid_date)||parseDate(row.progress_created)||new Date();return paid<=due?0:1;}return new Date()>due?1:2;}
  function renderKpi(){
    var groups={60:[0,0,0,0],75:[0,0,0,0],100:[0,0,0,0]}, owners={};
    filteredRows.forEach(function(r){var target=kpiTarget(r),result=kpiResult(r),owner=r.owner_name||"ไม่ระบุ";groups[target][result]++;owners[owner]=owners[owner]||[0,0,0,0];owners[owner][result]++;});
    kpiCharts.forEach(function(c){c.destroy();});kpiCharts=[];
    [60,75,100].forEach(function(target){kpiCharts.push(new Chart(el("kpiChart"+target),{type:"doughnut",data:{labels:["ผ่าน KPI","ไม่ผ่าน KPI","กำลังดำเนินการ","ยังไม่เริ่มคำนวณ"],datasets:[{data:groups[target],backgroundColor:["#14b986","#f64245","#3d7de8","#93a3b8"],borderColor:"#fff",borderWidth:5}]},options:{responsive:true,maintainAspectRatio:false,cutout:"52%",plugins:{legend:{display:false},tooltip:{callbacks:{label:function(ctx){var total=ctx.dataset.data.reduce(function(a,b){return a+b;},0);return ctx.label+": "+ctx.raw+" ("+percent(ctx.raw,total)+"%)";}}}}}}));});
    var ownerNames=Object.keys(owners).sort(function(a,b){return owners[b].reduce(function(x,y){return x+y;},0)-owners[a].reduce(function(x,y){return x+y;},0);});
    el("kpiRows").innerHTML=ownerNames.map(function(owner){var v=owners[owner],total=v.reduce(function(a,b){return a+b;},0);return '<tr><td>'+esc(owner)+'</td><td class="purple-text"><b>'+number(total)+'</b></td><td class="kpi-pass"><b>'+number(v[0])+'</b></td><td class="kpi-fail"><b>'+number(v[1])+'</b></td><td class="kpi-progress"><b>'+number(v[2])+'</b></td><td class="kpi-none"><b>'+number(v[3])+'</b></td></tr>';}).join("")||'<tr><td colspan="6">ไม่พบข้อมูล</td></tr>';
  }
  function renderWarnings(){var selected=el("warningFilter").value,items=[];filteredRows.forEach(function(r){if(Number(r.is_completed))return;var info=warningInfo(r);if(info&&info.level>0&&(!selected||String(info.level)===selected))items.push({row:r,info:info});});items.sort(function(a,b){return b.info.ratio-a.info.ratio;});el("warningCards").innerHTML=items.slice(0,150).map(function(x){var r=x.row,w=x.info,over=w.ratio>100?Math.max(0,Math.ceil((new Date()-w.due)/86400000)):w.used,label=w.ratio>100?"เกินมาแล้ว "+number(over)+" วัน":"ใช้เวลาแล้ว "+number(w.used)+" วัน";return '<article class="warning-card level-'+w.level+'"><header><span>◷ เฝ้าระวัง KPI</span><b>เป้า '+number(w.target)+' วัน</b></header><h3>'+esc(r.c_name)+'</h3><div class="warning-row"><span>เจ้าหน้าที่:</span><b>'+esc(r.owner_name)+'</b></div><div class="warning-row"><span>เริ่ม KPI:</span><b>'+thaiDate(w.start)+'</b></div><div class="warning-row"><span>สิ้นสุด KPI:</span><b>'+thaiDate(w.due)+'</b></div><div class="warning-progress-label"><span>'+label+'</span><small>'+Math.min(100,Math.round(w.ratio))+'%</small></div><div class="progress"><span style="width:'+Math.min(100,w.ratio)+'%;background:'+(w.level===3?'#17243a':(w.level===2?'#ee858b':'#efb51c'))+'"></span></div></article>';}).join("")||'<div class="empty-state">ไม่พบรายการเฝ้าระวังตามเงื่อนไข</div>';}
  function dayDiff(start,end){return start&&end?Math.max(0,Math.ceil((end-start)/86400000)):null;}
  function personalGroupHtml(groups,emptyText){var keys=Object.keys(groups).sort();if(!keys.length)return '<div class="empty-state">'+emptyText+'</div>';return keys.map(function(key){var rows=groups[key];return '<details class="personal-group"><summary><b>'+esc(key)+'</b><span>'+number(rows.length)+' รายการ</span></summary><div class="table-scroll"><table><thead><tr><th>เลข PR</th><th>รายการ</th><th>สถานะล่าสุด</th><th>KPI</th><th>ระดับปัญหา</th></tr></thead><tbody>'+rows.map(function(r){var result=kpiResult(r),lv=Number(r.importance_level||0),labels=['ผ่าน KPI','ไม่ผ่าน KPI','กำลังดำเนินการ','ยังไม่เริ่มคำนวณ'],currentStage=stage(r);return '<tr><td><b>'+esc(r.pr_code)+'</b></td><td>'+esc(r.c_name)+'</td><td class="status-hover"'+statusTitle(currentStage)+'>'+esc(currentStage)+'</td><td class="kpi-result-'+result+'">'+labels[result]+'</td><td><span class="level level-'+lv+'">ระดับ '+lv+'</span></td></tr>';}).join('')+'</tbody></table></div></details>';}).join('');}
  function renderPersonal(){
    var owner=el("personalOwnerFilter").value,rows=owner?filteredRows.filter(function(r){return r.owner_name===owner;}):[];
    var completed=rows.filter(function(r){return Number(r.is_completed);}).length,contract=rows.filter(function(r){return Number(r.period_total)>0||r.contract_code;}).length;
    var waiting=rows.filter(function(r){return !Number(r.period_total)&&!Number(r.is_completed)&&/รอ/.test(stage(r));}).length,working=rows.filter(function(r){return !Number(r.period_total)&&!Number(r.is_completed)&&!/รอ/.test(stage(r));}).length,contractActive=Math.max(0,contract-completed);
    ["personalOwnerName","personalStatusOwner","personalRadarOwner","personalDurationOwner","personalListOwner"].forEach(function(id){el(id).textContent=owner||"-";});
    el("personalSummary").innerHTML=[["งานรับผิดชอบทั้งหมด",rows.length,""],["รอดำเนินการ",waiting,"red"],["กำลังดำเนินการ",working,"orange"],["บริหารสัญญา",contractActive,"purple"],["เบิกจ่ายแล้ว",completed,"green"]].map(function(x){return '<div'+(x[0]==="งานรับผิดชอบทั้งหมด"?'':statusTitle(x[0]))+' class="'+(x[0]==="งานรับผิดชอบทั้งหมด"?'':'status-hover')+'"><span>'+x[0]+'</span><strong class="'+x[2]+'">'+number(x[1])+'</strong></div>';}).join('');
    var cp=percent(contract,rows.length),pp=percent(completed,contract);el("personalContractPercent").textContent=cp+'%';el("personalContractBar").style.width=cp+'%';el("personalContractJobs").textContent=number(contract);el("personalTotalJobs").textContent=number(rows.length);el("personalPaymentPercent").textContent=pp+'%';el("personalPaymentBar").style.width=pp+'%';el("personalPaidJobs").textContent=number(completed);el("personalManagedJobs").textContent=number(contract);
    var issueCounts=[0,0,0];rows.forEach(function(r){issueCounts[Math.min(2,Number(r.importance_level||0))]++;});el("personalIssues").innerHTML=[['ปกติ','ดำเนินการตามแผน',issueCounts[0],'normal'],['มีปัญหาเล็กน้อย / ดำเนินการต่อได้','',issueCounts[1],'warning'],['มีปัญหา / ไม่สามารถดำเนินการต่อได้','',issueCounts[2],'danger']].map(function(x){return '<article class="issue-card '+x[3]+'"><div><b>'+x[0]+'</b><small>'+x[1]+'</small></div><strong>'+number(x[2])+'</strong></article>';}).join('');
    var statusCounts={};rows.forEach(function(r){var s=stage(r);statusCounts[s]=(statusCounts[s]||0)+1;});var statusLabels=Object.keys(statusCounts).sort(function(a,b){return statusCounts[b]-statusCounts[a];}),statusValues=statusLabels.map(function(k){return statusCounts[k];});
    if(personalStatusChart)personalStatusChart.destroy();personalStatusChart=new Chart(el("personalStatusChart"),{type:"doughnut",data:{labels:statusLabels,datasets:[{data:statusValues,backgroundColor:colors,borderColor:'#fff',borderWidth:4}]},options:{responsive:true,maintainAspectRatio:false,cutout:'55%',plugins:{legend:{display:false},tooltip:{backgroundColor:'#17243a',titleColor:'#fff',bodyColor:'#e6eef8',padding:14,cornerRadius:10,callbacks:{afterLabel:function(c){return statusTooltipLines(c.label);}}}}}});el("personalStatusTable").innerHTML=statusLabels.map(function(k,i){return '<div class="status-hover"'+statusTitle(k)+'><span><i style="background:'+colors[i%colors.length]+'"></i>'+esc(k)+'</span><b>'+number(statusCounts[k])+'</b></div>';}).join('')||'<p>ไม่พบข้อมูล</p>';
    if(personalRadarChart)personalRadarChart.destroy();personalRadarChart=new Chart(el("personalRadarChart"),{type:'radar',data:{labels:statusLabels,datasets:[{label:owner||'เจ้าหน้าที่',data:statusValues,backgroundColor:'rgba(236,72,153,.18)',borderColor:'#ec4899',pointBackgroundColor:'#ec4899'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:'#17243a',titleColor:'#fff',bodyColor:'#e6eef8',padding:14,cornerRadius:10,callbacks:{afterLabel:function(c){return statusTooltipLines(c.label);}}}},scales:{r:{beginAtZero:true,ticks:{precision:0}}}}});el("personalRadarTable").innerHTML=statusLabels.map(function(k){return '<div class="status-hover"'+statusTitle(k)+'><span><i class="pink-dot"></i>'+esc(k)+'</span><b>'+number(statusCounts[k])+'</b></div>';}).join('')||'<p>ไม่พบข้อมูล</p>';
    var startDays=[],durationGroups={60:[],75:[],100:[]};rows.forEach(function(r){var tor=parseDate(r.procurement_start_date),announce=parseDate(r.announcement_date),paid=parseDate(r.paid_date);var d=dayDiff(tor,announce);if(d!==null)startDays.push(d);var kd=dayDiff(announce||tor,paid);if(kd!==null)durationGroups[kpiTarget(r)].push(kd);});function avg(a){return a.length?Math.round(a.reduce(function(x,y){return x+y;},0)*10/a.length)/10:0;}function durationCard(title,target,values){var passed=values.filter(function(v){return v<=target;}).length;return '<div><b>'+title+'</b><strong>'+number(avg(values))+' <small>วันเฉลี่ย</small></strong><p>คิดจาก: '+number(values.length)+' เรื่อง <em>ผ่าน '+percent(passed,values.length)+'%</em></p></div>';}
    el("personalDurations").innerHTML=durationCard('◷ ระยะเวลาเริ่มดำเนินการ',0,startDays)+durationCard('◎ KPI ทั่วไป (60 วัน)',60,durationGroups[60])+durationCard('◎ KPI เฉพาะเจาะจง (75 วัน)',75,durationGroups[75])+durationCard('◎ KPI E-Bidding (100 วัน)',100,durationGroups[100]);
    var k=[0,0,0,0];rows.forEach(function(r){k[kpiResult(r)]++;});el("personalKpiSummary").innerHTML=[["งานที่เข้าเกณฑ์ KPI",rows.length-k[3],''],['ผ่าน KPI',k[0],'green'],['ไม่ผ่าน KPI',k[1],'red'],['เฝ้าระวัง/กำลังดำเนินการ',k[2],'orange']].map(function(x){return '<article><span>'+x[0]+'</span><strong class="'+x[2]+'">'+number(x[1])+'</strong></article>';}).join('');
    var methods={},types={};rows.forEach(function(r){var m=kpiTarget(r)===100?'E-Bidding':(kpiTarget(r)===75?'เฉพาะเจาะจง (> 5 แสน)':'ทั่วไป/เฉพาะเจาะจง (≤ 5 แสน)'),t=r.procurement_type||'ไม่ระบุ';(methods[m]=methods[m]||[]).push(r);(types[t]=types[t]||[]).push(r);});el("personalMethodGroups").innerHTML=personalGroupHtml(methods,'กรุณาเลือกเจ้าหน้าที่');el("personalTypeGroups").innerHTML=personalGroupHtml(types,'กรุณาเลือกเจ้าหน้าที่');
  }
  function render(){renderMetrics();if(!el("workloadChart").closest("[hidden]"))renderWorkload();renderDimensionTable();try{renderDimensionChart();}catch(err){console.error("Dimension chart:",err);var canvas=el("dimensionChart"),holder=canvas&&canvas.parentNode;if(canvas)canvas.style.display="none";if(holder&&!holder.querySelector(".dimension-error"))holder.insertAdjacentHTML("beforeend",'<div class="empty-state dimension-error">ไม่สามารถแสดงกราฟมิติได้ กรุณากดดึงข้อมูลใหม่</div>');}try{renderSankey();}catch(sankeyError){console.error("Sankey chart:",sankeyError);if(el("sankeyChart"))el("sankeyChart").innerHTML='<div class="empty-state">ไม่สามารถแสดงกราฟ Sankey ได้</div>';}renderPipeline();renderStatus();renderCrossReports();renderDetails();renderKpi();renderWarnings();renderPersonal();}
  function currentFiscalYear(){var d=new Date();return d.getFullYear()+(d.getMonth()>=9?544:543);}
  function initFiscalYearFilters(){var current=currentFiscalYear(),years=[];for(var y=current;y>=current-10;y--)years.push(y);["yearFromFilter","yearToFilter"].forEach(function(id){el(id).innerHTML=years.map(function(v){return '<option value="'+v+'">'+v+'</option>';}).join('');el(id).value=String(current);});}
  function loadData(){var from=Number(el("yearFromFilter").value),to=Number(el("yearToFilter").value);if(from>to){var swap=from;from=to;to=swap;el("yearFromFilter").value=String(from);el("yearToFilter").value=String(to);}el("loading").classList.add("show");fetch("../api/List_ProcurementProgress.php?year_from="+encodeURIComponent(from)+"&year_to="+encodeURIComponent(to),{credentials:"same-origin"}).then(function(r){if(!r.ok)throw new Error("HTTP "+r.status);return r.json();}).then(function(j){if(!j.success)throw new Error(j.msg||"โหลดข้อมูลไม่สำเร็จ");allRows=j.data||[];fillSelect(el("fundFilter"),unique("fund_source"),"รวมทั้งหมด");fillSelect(el("statusOwnerFilter"),unique("owner_name"),"รวมทุกเจ้าหน้าที่");fillSelect(el("ownerMatrixFilter"),unique("owner_name"),"รวมทุกเจ้าหน้าที่");fillSelect(el("departmentMatrixFilter"),unique("department_name"),"รวมทุกหน่วยงาน");fillSelect(el("personalOwnerFilter"),unique("owner_name"),"เลือกเจ้าหน้าที่");if(!el("personalOwnerFilter").value&&el("personalOwnerFilter").options.length>1)el("personalOwnerFilter").selectedIndex=1;applyFilters();}).catch(function(err){alert("โหลดข้อมูลไม่สำเร็จ: "+err.message);}).finally(function(){el("loading").classList.remove("show");});}
  ["yearFromFilter","yearToFilter"].forEach(function(id){el(id).addEventListener("change",loadData);});el("fundFilter").addEventListener("change",applyFilters); el("statusOwnerFilter").addEventListener("change",renderStatus); el("keywordFilter").addEventListener("input",applyFilters); el("refreshButton").addEventListener("click",loadData);
  el("warningFilter").addEventListener("change",renderWarnings);el("personalOwnerFilter").addEventListener("change",renderPersonal);
  el("workloadMethodFilter").addEventListener("change",renderWorkload);
  el("groupButtons").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;[].forEach.call(this.querySelectorAll("button"),function(x){x.classList.remove("active");});b.classList.add("active");groupField=b.getAttribute("data-group");renderWorkload();});
  ["workloadAxis","workloadColor"].forEach(function(id){el(id).addEventListener("change",function(){var other=id==="workloadAxis"?el("workloadColor"):el("workloadAxis");if(other.value===this.value)other.value=this.value==="status"?"procurement_type":"status";renderDimensionChart();});});
  el("swapDimensions").addEventListener("click",function(){var axis=el("workloadAxis"),color=el("workloadColor"),value=axis.value;axis.value=color.value;color.value=value;renderDimensionChart();});
  el("workloadMetric").addEventListener("click",function(e){var button=e.target.closest("button");if(!button)return;[].forEach.call(this.querySelectorAll("button"),function(x){x.classList.remove("active");});button.classList.add("active");workloadMetric=button.getAttribute("data-metric")||"count";renderDimensionChart();});
  el("dimensionTableColumns").addEventListener("change",renderDimensionTable);
  el("dimensionTableMetric").addEventListener("click",function(e){var button=e.target.closest("button");if(!button)return;[].forEach.call(this.querySelectorAll("button"),function(x){x.classList.remove("active");});button.classList.add("active");dimensionTableMetric=button.getAttribute("data-metric")||"count";renderDimensionTable();});
  el("sankeyMetric").addEventListener("click",function(e){var button=e.target.closest("button");if(!button)return;[].forEach.call(this.querySelectorAll("button"),function(x){x.classList.remove("active");});button.classList.add("active");sankeyMetric=button.getAttribute("data-metric")||"count";renderSankey();});
  el("ownerMatrixFilter").addEventListener("change",renderCrossReports);el("ownerTypeFilter").addEventListener("change",renderCrossReports);el("departmentMatrixFilter").addEventListener("change",renderCrossReports);el("relationOwnerButtons").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;relationOwner=b.getAttribute("data-owner")||"";renderCrossReports();});
  document.querySelector(".dashboard-tabs").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;var tab=b.getAttribute("data-tab");[].forEach.call(this.querySelectorAll("button"),function(x){x.classList.remove("active");});b.classList.add("active");el("overviewSection").style.display=tab==="overview"?"block":"none";[].forEach.call(document.querySelectorAll(".overview-extra"),function(x){x.style.display=tab==="overview"?"":"none";});[].forEach.call(document.querySelectorAll(".tab-pane"),function(x){x.classList.remove("active");});if(tab!=="overview")el(tab+"Tab").classList.add("active");window.scrollTo({top:0,behavior:"smooth"});});
  el("overlapReviewHeader").textContent = "ต้องตรวจสอบ";
  el("overlapOutsideHeader").textContent = "ไม่เข้าข่ายกันเหลื่อม";
  document.querySelector(".status-table-panel .muted").textContent = "คลิกตัวเลขเพื่อดูรายละเอียด · นับครั้งเดียวต่อ PR โดยให้กลุ่มพบใบกันมาก่อน · ก่อหนี้อ้างอิงสัญญาที่ใช้งาน";
  el("statusRows").addEventListener("click", function (event) {
    var button = event.target.closest("[data-overlap-filter]");
    if (button) openOverlapDetails(button.getAttribute("data-stage-filter"), button.getAttribute("data-overlap-filter"));
  });
  el("closeOverlapDialog").addEventListener("click", function () { el("overlapDialog").close(); });
  el("overlapDialogRows").addEventListener("click", function (event) {
    var button = event.target.closest("[data-pr-detail]");
    if (!button) return;
    var detail = el("overlap-pr-" + button.getAttribute("data-pr-detail"));
    detail.hidden = !detail.hidden;
    button.setAttribute("aria-expanded", String(!detail.hidden));
  });
  el("exportDetailsButton").addEventListener("click", exportDetails);
  initStatusTooltips();initFiscalYearFilters();loadData();
}());
