(function () {
  'use strict';
  var form = document.getElementById('confirmation-form');
  if (!form) return;
  var button = document.getElementById('request-login'), status = document.getElementById('confirmation-status');
  var error = document.getElementById('confirmation-error'), busy = false, stopped = false, timer, revision = 0;
  function render(data) {
    if (data.redirect) { stopped = true; location.assign(data.redirect); return; }
    form.elements.confirmation.value = data.nonce;
    document.getElementById('active-usage').hidden = !data.replacing;
    document.getElementById('usage-device').textContent = data.device;
    document.getElementById('usage-last-seen').textContent = data.last_seen;
    var previousStatus = status.dataset.status;
    var label = {
      stale:['✓','เข้าแทนที่ได้ทันที','ไม่พบอุปกรณ์ที่ยังเชื่อมต่อ เซสชันเดิมค้างอยู่ กด “เข้าสู่ระบบแทนเซสชันค้าง” ได้เลย'],
      pending:['…','กำลังรออนุญาต','รอผู้ใช้งานเดิมตอบรับ หรือกดขออนุญาตอีกครั้ง'],
      approved:['✓','ได้รับอนุญาตแล้ว','ผู้ใช้งานเดิมอนุญาตให้เข้าใช้งานแล้ว กดปุ่ม “เข้าสู่ระบบตอนนี้” ด้านล่าง'],
      denied:['!','คำขอถูกปฏิเสธ','สามารถกดขออนุญาตอีกครั้งได้'],
      expired:['!','คำขอหมดอายุ','กรุณาเข้าสู่ระบบใหม่']
    }[data.status] || ['','',''];
    status.hidden = !data.status;
    status.dataset.status = data.status;
    if (previousStatus !== data.status) {
      document.getElementById('confirmation-status-icon').textContent = label[0];
      document.getElementById('confirmation-status-title').textContent = label[1];
      document.getElementById('confirmation-status-detail').textContent = label[2];
    }
    button.value = data.status === 'pending' || data.status === 'denied' ? 'resend' : 'replace';
    button.textContent = data.status === 'stale' ? 'เข้าสู่ระบบแทนเซสชันค้าง' : (data.status === 'approved' ? 'เข้าสู่ระบบตอนนี้' : (button.value === 'resend' ? 'ขออนุญาตอีกครั้ง' : (form.dataset.namedAdmin === '1' && !data.replacing ? 'เข้าสู่ระบบด้วยชื่อผู้ดูแล' : 'ขออนุญาตผู้ใช้งานเดิม')));
    button.classList.toggle('login-approved', data.status === 'approved' || data.status === 'stale');
    document.title = data.status === 'approved' ? 'ได้รับอนุญาตแล้ว · Supplies' : 'เข้าสู่ระบบ · Supplies';
    if (data.status === 'approved' || data.status === 'stale') {
      error.hidden = true;
      if (previousStatus !== data.status) status.scrollIntoView({behavior:'smooth', block:'center'});
    }
    button.disabled = data.status === 'expired';
    if (data.status === 'expired') stopped = true;
  }
  async function call(options) {
    var response = await fetch('/supplies/access/confirm-login?live=1', Object.assign({cache:'no-store', credentials:'same-origin', signal:AbortSignal.timeout(10000)}, options));
    var data = await response.json();
    if (!response.ok) throw new Error(data.error || 'ไม่สามารถดำเนินการได้ กรุณาลองใหม่');
    return data;
  }
  async function poll() {
    if (stopped) return;
    if (!busy) {
      var run = revision;
      try { var data = await call(); if (!busy && run === revision) render(data); }
      catch (e) { if (!busy && run === revision) { error.textContent = 'การเชื่อมต่อขัดข้อง กำลังเชื่อมต่อใหม่'; error.hidden = false; } }
    }
    if (!stopped && !busy) { clearTimeout(timer); timer = setTimeout(poll,1000); }
  }
  form.addEventListener('submit', async function(event) {
    event.preventDefault();
    if (busy) return;
    busy = true; revision++; clearTimeout(timer);
    var action = event.submitter ? event.submitter.value : button.value;
    var body = new FormData(form); body.set('action',action); body.set('live','1');
    form.querySelectorAll('button').forEach(function(b){b.disabled=true;});
    try { var data = await call({method:'POST',body:body}); error.textContent = data.error || ''; error.hidden = !data.error; render(data); }
    catch (e) { error.textContent = e.message; error.hidden = false; }
    finally { busy = false; form.querySelectorAll('button').forEach(function(b){b.disabled=false;}); if (!stopped) timer = setTimeout(poll,1000); else button.disabled = true; }
  });
  timer = setTimeout(poll,1000);
})();
