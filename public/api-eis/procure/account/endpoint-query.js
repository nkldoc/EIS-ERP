'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const apiBase = new URL('..', location.href).pathname.replace(/\/$/, '');
  let revision = 0, columns = [], sample = null, savedFields = [], previewKey = '';
  const sourceKey = () => JSON.stringify([$('edit-database').value, $('edit-query').value]);
  const message = (text, error = false) => {
    $('query-message').textContent = text;
    $('query-message').className = error ? 'error-text' : 'muted';
  };
  async function api(path, data) {
    const response = await fetch(apiBase + '/endpoints/' + path, {
      method: data ? 'POST' : 'GET', cache: 'no-store',
      headers: { Authorization: 'Bearer ' + window.currentToken, ...(data ? {'Content-Type': 'application/json'} : {}) },
      ...(data ? {body: JSON.stringify(data)} : {})
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'อ่านข้อมูลไม่สำเร็จ');
    return result;
  }
  function fields() {
    return Array.from($('query-fields').querySelectorAll('tr')).filter(row => row.querySelector('input[type=checkbox]').checked)
      .map(row => ({source: row.dataset.source, target: row.querySelector('input[type=text]').value.trim()}));
  }
  function validFields() {
    const chosen = fields();
    if (!chosen.length) throw new Error('กรุณาเลือกอย่างน้อยหนึ่งฟิลด์');
    const names = new Set();
    for (const field of chosen) {
      const key = field.target.toLowerCase();
      if (!/^[A-Za-z_][A-Za-z0-9_]{0,127}$/.test(field.target) || names.has(key)) throw new Error('ชื่อปลายทางต้องไม่ซ้ำ ใช้ตัวอักษรอังกฤษ ตัวเลข และ _');
      names.add(key);
    }
    return chosen;
  }
  function preview() {
    previewKey = '';
    $('query-preview').textContent = '';
    if (!sample || sourceKey() !== sample.key) return;
    try {
      const chosen = validFields();
      const data = sample.rows.map(row => Object.fromEntries(chosen.map(field => [field.target, row[field.source]])));
      $('query-preview').textContent = JSON.stringify({
        method: $('edit-method').value, uri: $('edit-uri').value,
        body: {username: 'erpsendapi', password: '***HIDDEN***', data}
      }, null, 2);
      previewKey = sourceKey();
      $('query-preview-panel').hidden = false;
      message('ตัวอย่าง ' + data.length + ' แถว' + (sample.truncated ? ' (ยังมีข้อมูลเพิ่มเติม)' : '') + ' · ยังไม่ได้ส่งข้อมูล');
    } catch (error) { message(error.message, true); }
  }
  function renderFields() {
    $('query-fields').replaceChildren();
    for (const name of columns) {
      const row = document.createElement('tr'); row.dataset.source = name;
      const selected = savedFields.find(field => field.source === name);
      const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = savedFields.length ? !!selected : true;
      checkbox.setAttribute('aria-label', 'ส่งฟิลด์ ' + name);
      const input = document.createElement('input'); input.type = 'text'; input.value = selected ? selected.target : name; input.maxLength = 128;
      input.setAttribute('aria-label', 'ชื่อปลายทางของ ' + name);
      const selectCell = document.createElement('td'); selectCell.append(checkbox);
      const sourceCell = document.createElement('td'); sourceCell.textContent = name;
      const aliasCell = document.createElement('td'); aliasCell.append(input);
      row.append(selectCell, sourceCell, aliasCell); $('query-fields').append(row);
    }
    $('query-mapping').hidden = false;
  }
  function invalidate() {
    if (columns.length && $('query-fields').children.length) savedFields = fields();
    revision++; sample = null; previewKey = '';
    $('query-preview-panel').hidden = true; $('query-preview').textContent = '';
    $('query-mapping').hidden = true;
    $('load-query-fields').disabled = false;
    message('กดอ่านฟิลด์และดูตัวอย่างหลังเปลี่ยนฐานข้อมูลหรือ Query');
  }
  async function readFields() {
    if (columns.length && $('query-fields').children.length) savedFields = fields();
    const current = ++revision, key = sourceKey();
    if (!$('edit-database').value) { message('กรุณาเลือกฐานข้อมูล MSSQL', true); return; }
    previewKey = ''; sample = null; $('query-preview-panel').hidden = true;
    $('load-query-fields').disabled = true; message('กำลังอ่านฟิลด์และตัวอย่างจาก MSSQL...');
    try {
      const result = await api('preview', {database: $('edit-database').value, query: $('edit-query').value, fields: []});
      if (current !== revision || key !== sourceKey() || $('admin-panel').hidden) return;
      columns = result.columns;
      sample = {rows: result.rows, truncated: result.truncated, key};
      renderFields(); preview();
    } catch (error) { if (current === revision) message(error.message, true); }
    finally { if (current === revision) $('load-query-fields').disabled = false; }
  }
  async function reset(row) {
    invalidate(); columns = []; savedFields = row?.fields || []; $('query-fields').replaceChildren();
    const current = revision;
    $('edit-database').replaceChildren(new Option('กำลังโหลดฐานข้อมูล...', ''));
    try {
      const result = await api('databases');
      if (current !== revision || $('admin-panel').hidden) return;
      $('edit-database').replaceChildren(new Option('เลือกฐานข้อมูล MSSQL', ''), ...result.databases.map(name => new Option(name, name)));
      const preferred = row?.database || result.default;
      if (result.databases.includes(preferred)) $('edit-database').value = preferred;
      if (row?.database && !result.databases.includes(row.database)) message('ฐานข้อมูลเดิมไม่อยู่ในรายการที่เข้าถึงได้ กรุณาเลือกใหม่', true);
      else message('เลือกฐานข้อมูล กรอก SELECT แล้วกดอ่านฟิลด์และดูตัวอย่าง');
    } catch (error) {
      if (current !== revision) return;
      $('edit-database').replaceChildren(new Option('โหลดฐานข้อมูลไม่สำเร็จ', ''));
      message(error.message, true);
    }
  }
  window.endpointQuery = {
    reset,
    clear() { invalidate(); savedFields = []; columns = []; $('query-fields').replaceChildren(); },
    values() { return {database: $('edit-database').value, fields: fields()}; },
    confirmReady() {
      if (!sample || previewKey !== sourceKey()) throw new Error('กรุณาอ่านฟิลด์และตรวจตัวอย่างก่อนบันทึก');
      validFields();
      return true;
    },
    showSaved() {
      $('query-preview-panel').hidden = false;
      message('บันทึกฐานข้อมูล Query และชื่อฟิลด์แล้ว · ตัวอย่างนี้ยังไม่ได้ส่งไปปลายทาง');
    }
  };
  document.addEventListener('DOMContentLoaded', () => {
    $('load-query-fields').addEventListener('click', readFields);
    $('edit-query').addEventListener('input', invalidate);
    $('edit-database').addEventListener('change', invalidate);
    $('query-fields').addEventListener('input', preview);
    $('query-fields').addEventListener('change', preview);
    $('edit-uri').addEventListener('input', preview);
    $('edit-method').addEventListener('change', preview);
  });
})();
