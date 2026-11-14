<?php
include("../../conf/config.php");
if (empty($_SESSION['user_id'])) {
    echo '<script>window.top.location.href="../../access/signin.php";</script>';
    exit;
}
?>
<!doctype html>
<html lang="th">
<head>
    <meta charset="utf-8">
    <title>รายงานข้อมูลซื้อจ้างและความก้าวหน้า</title>
    <style>
        body{font-family:Tahoma,Arial,sans-serif;margin:0;background:#f4f6f9;color:#263238;font-size:13px}
        .wrap{padding:16px}.head{font-size:20px;font-weight:bold;margin-bottom:12px}
        .filters{background:#fff;padding:12px;border:1px solid #d7dde5;border-radius:5px;margin-bottom:12px}
        input,button{font:inherit;padding:7px 9px;margin-right:6px}button{cursor:pointer;background:#3f51b5;color:#fff;border:0;border-radius:3px}
        .table-wrap{overflow:auto;background:#fff;border:1px solid #d7dde5;max-height:calc(100vh - 145px)}
        table{border-collapse:collapse;width:100%;min-width:1450px}th,td{border-bottom:1px solid #e4e7eb;padding:7px;vertical-align:top}
        th{position:sticky;top:0;background:#e8eef9;text-align:left;z-index:1}.num{text-align:right}.muted{color:#777}.badge{padding:3px 7px;border-radius:10px;background:#e8eef9;color:#304ffe;white-space:nowrap}
        #summary{margin-left:10px}.empty{text-align:center;padding:30px;color:#777}
    </style>
</head>
<body><div class="wrap">
    <div class="head">รายงานข้อมูลซื้อจ้างและความก้าวหน้าจนถึงเบิก</div>
    <div class="filters">
        ปีงบประมาณ <input id="year" type="number" style="width:90px" placeholder="ทั้งหมด">
        ค้นหา <input id="keyword" style="width:280px" placeholder="เลข PR / โครงการ / เลขสัญญา">
        <button onclick="loadReport()">แสดงข้อมูล</button>
        <button onclick="exportCsv()">Export CSV</button><span id="summary"></span>
    </div>
    <div class="table-wrap"><table><thead><tr>
        <th>ปีงบ</th><th>เลข PR</th><th>โครงการ/รายการ</th><th>วงเงิน PR</th><th>เลขสัญญา</th><th>วงเงินสัญญา</th>
        <th>สถานะปัจจุบัน</th><th>ช่วงเมนูที่บันทึก</th><th>ประเภทความก้าวหน้า</th><th>ความก้าวหน้าล่าสุด</th><th>วันที่บันทึก</th>
    </tr></thead><tbody id="rows"><tr><td class="empty" colspan="11">กำลังโหลด...</td></tr></tbody></table></div>
</div>
<script>
var reportRows=[];
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function money(v){return Number(v||0).toLocaleString('th-TH',{minimumFractionDigits:2,maximumFractionDigits:2});}
function loadReport(){
    var q='?year='+encodeURIComponent(document.getElementById('year').value)+'&keyword='+encodeURIComponent(document.getElementById('keyword').value);
    fetch('../api/List_ProcurementProgress.php'+q,{credentials:'same-origin'}).then(function(r){return r.json();}).then(function(j){
        reportRows=j.data||[]; var out='';
        reportRows.forEach(function(r){out+='<tr><td>'+esc(r.i_yyyy)+'</td><td>'+esc(r.pr_code)+'</td><td>'+esc(r.c_name)+'</td><td class="num">'+money(r.pr_amount)+'</td><td>'+esc(r.contract_code)+'</td><td class="num">'+money(r.contract_amount)+'</td><td><span class="badge">'+esc(r.current_progress)+'</span></td><td>'+esc(r.menu_name)+'</td><td>'+esc(r.progress_type||r.event_title)+'</td><td>'+esc(r.event_detail)+'</td><td>'+esc(r.progress_created||r.event_date)+'</td></tr>';});
        document.getElementById('rows').innerHTML=out||'<tr><td class="empty" colspan="11">ไม่พบข้อมูล</td></tr>';
        document.getElementById('summary').textContent='ทั้งหมด '+reportRows.length.toLocaleString('th-TH')+' รายการ';
    }).catch(function(){document.getElementById('rows').innerHTML='<tr><td class="empty" colspan="11">โหลดข้อมูลไม่สำเร็จ</td></tr>';});
}
function exportCsv(){
    var cols=['i_yyyy','pr_code','c_name','pr_amount','contract_code','contract_amount','current_progress','menu_name','progress_type','event_detail','progress_created'];
    var csv='\ufeffปีงบ,เลข PR,โครงการ,วงเงิน PR,เลขสัญญา,วงเงินสัญญา,สถานะ,ช่วงเมนู,ประเภทความก้าวหน้า,ความก้าวหน้าล่าสุด,วันที่บันทึก\r\n';
    reportRows.forEach(function(r){csv+=cols.map(function(k){return '"'+String(r[k]==null?'':r[k]).replace(/"/g,'""')+'"';}).join(',')+'\r\n';});
    var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='procurement-progress.csv';a.click();URL.revokeObjectURL(a.href);
}
document.getElementById('keyword').addEventListener('keydown',function(e){if(e.key==='Enter')loadReport();});loadReport();
</script></body></html>

