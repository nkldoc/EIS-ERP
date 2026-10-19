(function () {
    'use strict';
    const content=document.querySelector('#scheduleOverlay .modal-content');
    const days=['จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์','อาทิตย์'];
    const options=days.map((name,i)=>'<option value="'+(i+1)+'">'+name+'</option>').join('');
    const panel=document.createElement('section');
    panel.innerHTML='<h3 style="margin:20px 0 10px">ความถี่ตามเวลาที่เหลือ</h3>'+
        '<div class="detail"><label for="monthDay">1 เดือน (22–31 วัน): สัปดาห์ละ 1 ครั้ง</label><select class="select" id="monthDay">'+options+'</select></div>'+
        '<div class="detail" style="margin-top:10px"><label for="threeWeekDay1">3 สัปดาห์ (8–21 วัน): สัปดาห์ละ 2 ครั้ง</label><select class="select" id="threeWeekDay1" aria-label="วันแรก">'+options+'</select> <select class="select" id="threeWeekDay2" aria-label="วันที่สอง">'+options+'</select></div>'+
        '<p class="small" style="margin-top:12px">ตั้งแต่เหลือ 1 สัปดาห์ (0–7 วัน) และเกินกำหนด: แจ้งทุกวันตามเวลาทั้ง 4 รอบ<br>ช่วงรายสัปดาห์แจ้งเฉพาะวันเลือก ในรอบเวลาแรกของวัน · เวลาไทย</p>'+
        '<p class="small">แสดงแจ้งเตือนขณะเปิดระบบอยู่ หากเข้าใช้งานหลังเวลาที่ตั้งไว้ จะแสดงรอบล่าสุดของวัน</p>';
    content.insertBefore(panel,document.getElementById('scheduleError'));
    const modal=document.querySelector('#scheduleOverlay .modal');
    modal.style.maxHeight='90vh';modal.style.overflowY='auto';
    window.contractAlertFrequencyApply=function (policy) {
        policy=policy||{monthDay:1,threeWeekDays:[1,4]};
        document.getElementById('monthDay').value=policy.monthDay;
        document.getElementById('threeWeekDay1').value=policy.threeWeekDays[0];
        document.getElementById('threeWeekDay2').value=policy.threeWeekDays[1];
    };
    window.contractAlertFrequencyValue=function () {
        return {monthDay:Number(document.getElementById('monthDay').value),threeWeekDays:[Number(document.getElementById('threeWeekDay1').value),Number(document.getElementById('threeWeekDay2').value)]};
    };
    window.contractAlertFrequencyApply();
}());
