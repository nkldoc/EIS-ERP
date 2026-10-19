(function () {
    'use strict';
    var question = document.getElementById('question');
    var status = document.getElementById('status');
    var templates = {
        overlap: 'ช่วยสรุปขั้นตอนตรวจรับและใช้ใบกันเหลื่อมจากข้อมูลต่อไปนี้ เป็นลำดับขั้นตอนที่เจ้าหน้าที่ทำตามได้ โดยแยกข้อมูลที่ยังต้องตรวจสอบเพิ่มเติม\n\nข้อมูล: กรณีแก้ไขรายการตรวจรับแล้วต้องการใช้เงินกัน ให้เข้าหน้าตรวจรับ เปิดรายการเดิม เลือกแก้ไขบันทึกเป็นข้อ 6 ใช้ใบกันเหลื่อม จากนั้นเลือกใบกันและบันทึกที่หน้าตรวจรับ\n\nคำถามเพิ่มเติม: ',
        accounting: 'ช่วยตรวจสอบและอธิบายการแก้ไขตั้งหนี้ หมวด-บัญชี และเงินภาษีจากข้อมูลต่อไปนี้ หากข้อมูลไม่พอให้ระบุข้อมูลที่ต้องขอเพิ่ม พร้อมแสดงวิธีคำนวณเมื่อมีตัวเลข\n\nรายละเอียดรายการ: \nหมวด-บัญชี: \nยอดก่อนภาษี: \nภาษีมูลค่าเพิ่ม: \nภาษีหัก ณ ที่จ่าย: \nสิ่งที่ต้องการแก้ไข: ',
        document: 'ช่วยร่างเอกสารงานจัดซื้อจากข้อมูลต่อไปนี้ ใช้ภาษาราชการ และเว้นช่องสำหรับข้อมูลที่ยังไม่ได้ระบุ\n\nประเภทเอกสาร: \nเรื่อง: \nวัตถุประสงค์: \nรายละเอียด: \nผู้รับ: '
    };
    document.querySelectorAll('[data-template]').forEach(function (button) {
        button.addEventListener('click', function () {
            if (question.value.trim() && !window.confirm('แทนที่ข้อความปัจจุบันด้วยตัวอย่างคำถามนี้หรือไม่?')) return;
            question.value = templates[button.getAttribute('data-template')];
            status.textContent = 'เพิ่มตัวอย่างแล้ว ตรวจและเติมข้อมูลก่อนคัดลอก';
            question.focus();
        });
    });
    document.getElementById('copy').addEventListener('click', async function () {
        if (!question.value.trim()) {
            status.textContent = 'กรุณาพิมพ์คำถามหรือเลือกหัวข้อเริ่มต้นก่อน';
            question.focus();
            return;
        }
        try {
            if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard unavailable');
            await navigator.clipboard.writeText(question.value);
            status.textContent = 'คัดลอกแล้ว กดเปิด Gemini เลือกบัญชี Google แล้ววางคำถามเพื่อส่ง';
        } catch (error) {
            question.focus();
            question.select();
            status.textContent = 'เบราว์เซอร์ไม่อนุญาตให้คัดลอกอัตโนมัติ เลือกข้อความให้แล้ว กด Ctrl+C หรือเมนูคัดลอก จากนั้นเปิด Gemini';
        }
    });
    document.getElementById('clear').addEventListener('click', function () {
        if (question.value && !window.confirm('ล้างข้อความคำถามทั้งหมดหรือไม่?')) return;
        question.value = '';
        status.textContent = 'ล้างข้อความแล้ว';
        question.focus();
    });
}());
