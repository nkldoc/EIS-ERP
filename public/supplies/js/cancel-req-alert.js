// แจ้งเตือนคำขอยกเลิก PR ที่รออนุมัติ ให้ผู้ใช้ "จัดสรรงบประมาณพัสดุ" (60104)
// - ผู้ใช้อื่น API ตอบ approver = false -> หยุดตรวจทันที (ไม่ยิง API ต่อ)
// - พี่เกด: ตรวจทุก 2 วินาที ถ้ามีคำขอใหม่ (id สูงกว่าที่เคยแจ้งในเบราว์เซอร์นี้) -> เสียง "ติ้ง" + toast มุมขวาล่างพร้อมกัน
// - ถ้ามีคำขอค้างรออนุมัติ จะเตือนซ้ำ 1 ครั้งตอนเปิดระบบ
(function () {
    'use strict';
    var POLL_MS = 2000;
    var busy = false, firstRun = true, timer = null;
    var KEY = 'cancelReqAlertLastId';
    function lastId() { try { return parseInt(localStorage.getItem(KEY), 10) || 0; } catch (e) { return 0; } }
    function saveId(v) { try { localStorage.setItem(KEY, String(v)); } catch (e) {} }

    // ---------- เสียง "ติ้ง" (Web Audio) ----------
    // ไฟล์ assets/snd/*.wav ของระบบเป็นไฟล์ว่าง 44 ไบต์ จึงสร้างเสียงเอง
    // เบราว์เซอร์บล็อกเสียงจนกว่าจะมีการคลิก/กดคีย์ "ในเอกสารนั้น" ซึ่งคลิกในหน้าเมนูที่อยู่ใน iframe ไม่นับกับหน้าหลัก
    // จึงดัก event ทั้งหน้าหลักและ iframe (same-origin) เพื่อปลดล็อกให้เร็วที่สุด และสร้าง AudioContext ไว้ล่วงหน้า
    var audioCtx = null, pendingAt = 0;
    function getCtx() {
        if (!audioCtx) {
            var AC = window.AudioContext || window.webkitAudioContext;
            if (AC) { try { audioCtx = new AC(); } catch (e) {} }
        }
        return audioCtx;
    }
    function tones(ctx) {
        [[1318.5, 0], [1760, 0.18]].forEach(function (n) {
            var o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + n[1];
            o.type = 'sine'; o.frequency.value = n[0];
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(0.4, t + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
            o.connect(g); g.connect(ctx.destination);
            o.start(t); o.stop(t + 1);
        });
    }
    function ding() {
        var ctx = getCtx();
        if (!ctx) return;
        if (ctx.state === 'running') { tones(ctx); return; }
        pendingAt = Date.now(); // ยังถูกบล็อก -> เล่นทันทีที่ปลดล็อก (ถ้าไม่เกิน 15 วินาที กันเสียงเก่าดังช้า)
        ctx.resume().then(function () { flushPending(); }).catch(function () {});
    }
    function flushPending() {
        var ctx = audioCtx;
        if (ctx && ctx.state === 'running' && pendingAt) {
            var fresh = Date.now() - pendingAt < 15000;
            pendingAt = 0;
            if (fresh) tones(ctx);
        }
    }
    function unlock() {
        var ctx = getCtx();
        if (ctx && ctx.state !== 'running') { ctx.resume().then(flushPending).catch(function () {}); }
    }
    var hooked = [];
    function hook(doc) {
        if (!doc || hooked.indexOf(doc) !== -1) return;
        hooked.push(doc);
        ['pointerdown', 'click', 'keydown', 'touchstart'].forEach(function (ev) {
            doc.addEventListener(ev, unlock, {passive: true, capture: true});
        });
    }
    function hookFrames() {
        hook(document);
        var frames = document.querySelectorAll('iframe');
        for (var i = 0; i < frames.length; i++) {
            try { hook(frames[i].contentDocument); } catch (e) { /* ข้ามเฟรมต่างโดเมน */ }
        }
    }

    // ---------- เปิดเมนูอนุมัติ ----------
    function openMenu() {
        try {
            var panel = Ext.getCmp('content-panel');
            if (panel && panel.openPage) {
                panel.openPage('sp/cancelReqApprove.php', 'อนุมัติยกเลิก PR');
                if (panel.refreshActiveTab) panel.refreshActiveTab();
                return;
            }
            window.location.hash = '#sp/cancelReqApprove.php';
        } catch (e) { console.error('Open cancel request menu:', e); }
    }

    function notify(result) {
        var top = result.items[0];
        var msg = 'PR ' + top.code + ' ขอยกเลิก' + (result.count > 1 ? ' (และอีก ' + (result.count - 1) + ' รายการ)' : '') +
                '\nสาเหตุ: ' + top.reason + '\nคลิกเพื่อเปิดเมนูอนุมัติ';
        // บรรทัดสถานะ (ช่วยไล่ปัญหาเรื่องเสียง): granted = อนุญาตแล้ว, denied = ถูกบล็อก, default = ยังไม่ตั้ง
        var osBody = msg.replace('\nคลิกเพื่อเปิดเมนูอนุมัติ', ''); // ข้อความสำหรับแจ้งเตือนของเครื่อง (ไม่รวมบรรทัดสถานะ)
        var perm = window.Notification ? Notification.permission : 'ไม่รองรับ';
        msg += '\n[แจ้งเตือนของเครื่อง: ' + ({granted: 'อนุญาตแล้ว', denied: 'ถูกบล็อก - ต้องเปลี่ยนเป็นอนุญาตที่รูปกุญแจข้าง URL', 'default': 'ยังไม่ตั้ง'}[perm] || perm) + ']';
        // แจ้งเตือนของระบบปฏิบัติการ (เสียงเป็นของ Windows ไม่โดนกฎบล็อกเสียงของเบราว์เซอร์ และเด้งแม้เบราว์เซอร์อยู่เบื้องหลัง)
        // เสียงของหน้าเว็บเล่นได้เลย (ไม่ต้องคลิก) ก็ต่อเมื่อเบราว์เซอร์ปลดล็อกเสียงแล้ว เช่น เคยคลิกหน้านี้ หรือเปิดนโยบาย autoplay ไว้
        // -> ถ้าเล่นได้ ใช้เสียงของเราและให้แจ้งเตือนของเครื่องเงียบ (กันเสียงซ้อน) ; ถ้าเล่นไม่ได้ ให้แจ้งเตือนของเครื่องส่งเสียงแทน
        var ctxNow = getCtx();
        var audioOk = !!(ctxNow && ctxNow.state === 'running');
        var osShown = false;
        if (window.Notification && Notification.permission === 'granted') {
            try {
                var n = new Notification('มีคำขอยกเลิก PR รออนุมัติ ' + result.count + ' รายการ', {
                    body: osBody,
                    tag: 'cancel-req-pending', renotify: true, requireInteraction: true, silent: audioOk
                });
                n.onclick = function () { try { window.focus(); } catch (e) {} openMenu(); n.close(); };
                n.onerror = function () { console.error('OS notification error'); };
                osShown = true;
            } catch (e) { console.error('OS notification:', e); }
        }
        if (audioOk || !osShown) ding(); // ถ้าเล่นไม่ได้และไม่มีแจ้งเตือนเครื่อง ding() จะรอปลดล็อก (เล่นทันทีที่คลิกหน้า)
        if (Ext.Toast && Ext.Toast.show) {
            Ext.Toast.show({type: 'warning', title: 'มีคำขอยกเลิก PR รออนุมัติ ' + result.count + ' รายการ',
                message: msg, ttl: 20000, width: 380, onClick: openMenu});
        } else {
            Ext.MessageBox.alert('มีคำขอยกเลิก PR รออนุมัติ ' + result.count + ' รายการ', Ext.util.Format.htmlEncode(msg).replace(/\n/g, '<br>'), openMenu);
        }
    }

    // ขออนุญาตแจ้งเตือนของเครื่องครั้งเดียว (ต้องมาจากการคลิกของผู้ใช้ จึงทำเป็น toast ให้คลิก) ถ้ายังไม่เคยอนุญาต/ปฏิเสธ
    var askedPermission = false;
    function askNotificationPermission() {
        if (askedPermission || !window.Notification || Notification.permission !== 'default') return;
        askedPermission = true;
        if (Ext.Toast && Ext.Toast.show) {
            Ext.Toast.show({type: 'info', title: 'เปิดแจ้งเตือนแบบมีเสียง',
                message: 'คลิกที่นี่ แล้วกด "อนุญาต" เพื่อให้มีเสียงเตือนทันทีเมื่อมีคำขอยกเลิก PR (ตั้งครั้งเดียวต่อเครื่อง)',
                ttl: 60000, width: 380,
                onClick: function () { try { Notification.requestPermission(); } catch (e) {} }});
        }
    }

    async function poll() {
        if (busy || !window.Ext) return; // ตรวจแม้แท็บอยู่เบื้องหลัง เพื่อให้แจ้งเตือนของเครื่องเด้งได้
        busy = true;
        try {
            hookFrames();
            var response = await fetch('/supplies/sp/tor/api/mnTorCancelReq.php?mode=PENDING_COUNT', {credentials: 'same-origin', cache: 'no-store'});
            if (!response.ok) return;
            var result = await response.json();
            if (result.approver === false) { // ไม่ใช่ผู้อนุมัติ -> เลิกตรวจ
                if (timer) { clearInterval(timer); timer = null; }
                return;
            }
            if (result.approver === true) askNotificationPermission();
            if (!result.success || !result.count || !result.items.length) return;
            var newest = result.items[0].id;
            if (newest > lastId() || firstRun) {
                saveId(Math.max(newest, lastId()));
                notify(result);
            }
        } catch (e) { console.error('Cancel request alert:', e); }
        finally { busy = false; firstRun = false; }
    }

    Ext.onReady(function () {
        getCtx(); // สร้างไว้ก่อน เพื่อให้ปลดล็อกแล้วเล่นได้ทันที
        hookFrames();
        poll();
        timer = setInterval(poll, POLL_MS);
    });
}());
