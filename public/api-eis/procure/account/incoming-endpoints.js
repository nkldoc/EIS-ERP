'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const base = new URL('../incomingEndpoints', location.href).pathname;
  const incomingPrefix = base.replace(/incomingEndpoints$/, 'incoming/');
  $('incoming-uri').placeholder = incomingPrefix + 'irV1';
  $('incoming-url-help').textContent = 'ใช้เส้นทาง ' + incomingPrefix + ' ตามด้วยชื่อขารับ เช่น irV1 หรือ contract';
  let endpoints = [], users = [], epoch = 0, listVersion = 0, logVersion = 0, detailVersion = 0;
  let busy = false, logBusy = false, next = null, selectedLog = null;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const date = value => value ? new Intl.DateTimeFormat('th-TH', {dateStyle:'short', timeStyle:'medium', timeZone:'Asia/Bangkok'}).format(new Date(value.replace(' ', 'T') + 'Z')) : 'ยังไม่มี';
  function message(text = '', error = false, target = 'incoming-message') {
    $(target).textContent = text; $(target).classList.toggle('error-text', error);
  }
  async function request(path = '', method = 'GET', body) {
    const token = window.currentToken, session = epoch;
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(base + path, {method, cache:'no-store', signal:controller.signal,
        headers: {Authorization:'Bearer ' + token, ...(body ? {'Content-Type':'application/json'} : {})},
        ...(body ? {body:JSON.stringify(body)} : {})});
      let data; try { data = await res.json(); } catch (_) { throw new Error('ระบบตอบกลับไม่สมบูรณ์ (HTTP ' + res.status + ')'); }
      if (session !== epoch || token !== window.currentToken || $('admin-panel').hidden) throw new Error('SESSION_CHANGED');
      if (!res.ok) throw new Error(data.message || 'ไม่สามารถดำเนินการได้ (HTTP ' + res.status + ')');
      return data;
    } finally { clearTimeout(timer); }
  }
  function report(error, target) {
    if (error.message === 'SESSION_CHANGED' || $('admin-panel').hidden) return;
    message(error.name === 'AbortError' ? 'การเชื่อมต่อใช้เวลานาน กรุณาโหลดรายการใหม่เพื่อตรวจผล' : error.message, true, target);
  }
  function render() {
    $('incoming-body').innerHTML = endpoints.length ? endpoints.map(row => `<tr>
      <td><strong>${esc(row.name)}</strong><br><code>${esc(row.uri)}</code></td>
      <td><span class="badge">${esc(row.method)}</span></td><td>${esc(row.username || 'ไม่พบผู้ใช้')}${Number(row.user_active) ? '' : '<br><small class="error-text">ผู้ใช้ถูกปิดหรือถูกลบ</small>'}</td>
      <td>${Number(row.active) ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</td><td>${esc(date(row.last_received_at))}</td>
      <td class="incoming-row-actions"><button type="button" class="secondary" data-action="edit" data-id="${esc(row.id)}">แก้ไข</button><button type="button" class="secondary" data-action="example" data-id="${esc(row.id)}">ตัวอย่าง</button><button type="button" class="secondary" data-action="logs" data-id="${esc(row.id)}">ดู Log</button><button type="button" class="danger" data-action="delete" data-id="${esc(row.id)}">ลบ</button></td></tr>`).join('') : '<tr><td colspan="6">ยังไม่มี URL ขารับ กด + เพิ่ม URL ขารับ เพื่อเริ่มต้น</td></tr>';
    $('incoming-count').textContent = `URL ขารับทั้งหมด (${endpoints.length})`;
    const filter = $('incoming-log-filter').value;
    $('incoming-log-filter').innerHTML = '<option value="">ทุก URL รวมรายการที่ลบแล้ว</option>' + endpoints.map(row => `<option value="${esc(row.id)}">${esc(row.method + ' ' + row.uri)}</option>`).join('');
    if (endpoints.some(row => String(row.id) === filter)) $('incoming-log-filter').value = filter;
  }
  async function load() {
    const version = ++listVersion;
    $('incoming-reload').disabled = true;
    try {
      const [rows, options] = await Promise.all([request(), request('/users')]);
      if (version !== listVersion) return;
      if (!Array.isArray(rows) || !Array.isArray(options)) throw new Error('รูปแบบรายการไม่ถูกต้อง');
      endpoints = rows; users = options; render();
    } catch (error) { if (version === listVersion) report(error); }
    finally { if (version === listVersion) $('incoming-reload').disabled = false; }
  }
  function edit(row) {
    if (busy) return;
    message(); $('incoming-form').reset(); $('incoming-id').value = row?.id || '';
    $('incoming-editor-title').textContent = row ? 'แก้ไข URL ขารับ' : 'เพิ่ม URL ขารับ';
    $('incoming-name').value = row?.name || '';
    $('incoming-uri').value = row?.uri || incomingPrefix + 'irV1';
    $('incoming-method').value = row?.method || 'POST';
    $('incoming-active').checked = row ? !!Number(row.active) : true;
    $('incoming-user').innerHTML = '<option value="">เลือกผู้ใช้ที่มีในระบบ</option>' + users.map(user => `<option value="${esc(user.id)}" ${!Number(user.is_active) && String(user.id) !== String(row?.user_id) ? 'disabled' : ''}>${esc(user.name)}${user.email ? ' · ' + esc(user.email) : ''}${Number(user.is_active) ? '' : ' (ปิดใช้งาน)'}</option>`).join('');
    $('incoming-user').value = row?.user_id || '';
    $('incoming-form').hidden = false; $('incoming-name').focus();
  }
  async function save(event) {
    event.preventDefault(); if (busy) return;
    let uri = $('incoming-uri').value.trim();
    if (/^https?:\/\//i.test(uri)) {
      const url = new URL(uri);
      if (url.origin !== location.origin || url.search || url.hash) { message('กรุณาใช้ URL บนเว็บไซต์นี้ และไม่ใส่ query string', true); return; }
      uri = url.pathname;
    }
    const payload = {name:$('incoming-name').value.trim(), uri, method:$('incoming-method').value, user_id:Number($('incoming-user').value), active:$('incoming-active').checked};
    const id = $('incoming-id').value;
    busy = true; $('incoming-fields').disabled = true;
    try {
      await request(id ? '/' + id : '', id ? 'PUT' : 'POST', payload);
      $('incoming-form').hidden = true; message('บันทึก URL ขารับแล้ว'); await load();
    } catch (error) { report(error); }
    finally { busy = false; $('incoming-fields').disabled = false; }
  }
  function example(row) {
    $('incoming-example-url').textContent = row.method + ' ' + new URL(row.uri, location.origin).href;
    $('incoming-example').textContent = JSON.stringify({headers:{'Content-Type':'application/json', Authorization:'Bearer <token จากการ Login ของ ' + row.username + '>'}, body:{data:[{pr_id:1768, po_id:448, period_id:4082, chk_id:1, c_contract_code:'1C103/2568', f_period_amt:17013, c_doc_ref:false, line_ids:[{c_doc_ref:false, d_doc_dateSub:'2026-05-20', f_period_amt:17013, chk_line_id:2652}]}]}}, null, 2);
    $('incoming-example-panel').hidden = false;
    $('incoming-example-panel').scrollIntoView({behavior:'smooth', block:'nearest'});
  }
  async function loadLogs(append = false) {
    if (append && (logBusy || !next)) return;
    const version = ++logVersion;
    logBusy = true; $('incoming-log-more').disabled = true;
    const params = new URLSearchParams();
    if ($('incoming-log-filter').value) params.set('endpoint_id', $('incoming-log-filter').value);
    if (append && next) params.set('before', next);
    if (!append) { next = null; $('incoming-log-body').replaceChildren(); $('incoming-log-more').hidden = true; }
    message('กำลังโหลด Log…', false, 'incoming-log-message');
    try {
      const data = await request('/logs?' + params);
      if (version !== logVersion) return;
      if (!Array.isArray(data.rows)) throw new Error('รูปแบบ Log ไม่ถูกต้อง');
      const html = data.rows.map(row => `<tr><td>${esc(date(row.received_at))}</td><td><span class="badge">${esc(row.method)}</span><br><code>${esc(row.uri)}</code></td><td>${esc(row.username || '-')}</td><td class="${Number(row.status_code) >= 400 ? 'error-text' : ''}">${esc(row.status_code)} · ${esc(row.message)}</td><td><button type="button" class="secondary" data-log-id="${esc(row.id)}">ดู JSON</button></td></tr>`).join('');
      if (append) $('incoming-log-body').insertAdjacentHTML('beforeend', html);
      else $('incoming-log-body').innerHTML = html || '<tr><td colspan="5">ยังไม่มี Log สำหรับ URL ที่เลือก</td></tr>';
      next = data.next; $('incoming-log-more').hidden = !next; message('', false, 'incoming-log-message');
    } catch (error) { if (version === logVersion) report(error, 'incoming-log-message'); }
    finally { if (version === logVersion) { logBusy = false; $('incoming-log-more').disabled = false; } }
  }
  async function detail(id) {
    const version = ++detailVersion;
    selectedLog = null; $('incoming-log-detail').hidden = true;
    try {
      const row = await request('/logs/' + id);
      if (version !== detailVersion) return;
      selectedLog = row; $('incoming-log-meta').textContent = `${date(row.received_at)} · HTTP ${row.status_code} · Request ID: ${row.request_id}`;
      $('incoming-log-json').textContent = JSON.stringify(row.payload, null, 2);
      $('incoming-log-detail').hidden = false; $('incoming-log-detail').scrollIntoView({behavior:'smooth', block:'nearest'});
    } catch (error) { if (version === detailVersion) report(error, 'incoming-log-message'); }
  }
  function clear() {
    epoch++; listVersion++; logVersion++; detailVersion++; endpoints = []; users = []; selectedLog = null; next = null;
    $('incoming-body').replaceChildren(); $('incoming-log-body').replaceChildren(); $('incoming-log-json').textContent = ''; $('incoming-example').textContent = '';
    $('incoming-user').replaceChildren(); $('incoming-log-filter').innerHTML = '<option value="">ทุก URL รวมรายการที่ลบแล้ว</option>';
    for (const id of ['incoming-form','incoming-example-panel','incoming-log-detail','incoming-log-more']) $(id).hidden = true;
    $('incoming-reload').disabled = false; logBusy = false; message(); message('', false, 'incoming-log-message');
  }
  $('incoming-add').addEventListener('click', () => edit(null));
  $('incoming-reload').addEventListener('click', load);
  $('incoming-cancel').addEventListener('click', () => { $('incoming-form').hidden = true; });
  $('incoming-form').addEventListener('submit', save);
  $('incoming-body').addEventListener('click', async event => {
    const button = event.target.closest('button[data-action]'); if (!button || busy) return;
    const row = endpoints.find(item => String(item.id) === button.dataset.id); if (!row) return;
    if (button.dataset.action === 'edit') edit(row);
    if (button.dataset.action === 'example') example(row);
    if (button.dataset.action === 'logs') { $('incoming-log-filter').value = row.id; await loadLogs(); }
    if (button.dataset.action === 'delete' && confirm('ลบ URL ขารับ ' + row.uri + '? ประวัติ JSON เดิมจะยังเก็บไว้')) {
      busy = true; button.disabled = true;
      try { await request('/' + row.id, 'DELETE'); $('incoming-form').hidden = true; message('ลบ URL ขารับแล้ว ประวัติ JSON ยังอยู่'); await load(); await loadLogs(); }
      catch (error) { report(error); }
      finally { busy = false; button.disabled = false; }
    }
  });
  $('incoming-log-reload').addEventListener('click', () => loadLogs());
  $('incoming-log-filter').addEventListener('change', () => { detailVersion++; selectedLog = null; $('incoming-log-detail').hidden = true; loadLogs(); });
  $('incoming-log-more').addEventListener('click', () => loadLogs(true));
  $('incoming-log-body').addEventListener('click', event => { const button = event.target.closest('button[data-log-id]'); if (button) detail(button.dataset.logId); });
  $('incoming-log-close').addEventListener('click', () => { detailVersion++; selectedLog = null; $('incoming-log-detail').hidden = true; });
  $('incoming-log-download').addEventListener('click', () => {
    if (!selectedLog) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(selectedLog.payload, null, 2)], {type:'application/json;charset=utf-8'}));
    const a = document.createElement('a'); a.href = url; a.download = 'incoming-' + selectedLog.request_id + '.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  new MutationObserver(() => {
    if ($('admin-panel').hidden) clear();
    else { load(); loadLogs(); }
  }).observe($('admin-panel'), {attributes:true, attributeFilter:['hidden']});
  if (!$('admin-panel').hidden) { load(); loadLogs(); }
})();
