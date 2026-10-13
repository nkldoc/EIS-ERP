'use strict';
(() => {
  const $ = id => document.getElementById(id);
  // Keep the session token for this browser tab so a normal page reload stays logged in.
  let token = '', expiry = 0, lifetime = 0, revealed = false, generation = 0;
  Object.defineProperty(window, 'currentToken', { get: () => token });
  let users = [], currentUserId = 0, adminBusy = false;
  const messages = {
    'Account disabled.': 'บัญชีนี้ถูกปิดใช้งาน กรุณาติดต่อผู้ดูแล',
    'Invalid token lifetime.': 'กรุณาเลือกอายุโทเคนจากรายการที่กำหนด',
    'Invalid Password!': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
    'Invalid Email Address!': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
    'This E-mail already in use!': 'อีเมลนี้ถูกใช้สมัครสมาชิกแล้ว',
    'Please Fill in all Required Fields!': 'กรุณากรอกข้อมูลให้ครบถ้วน'
  };
  function saveSession() {
    try { sessionStorage.setItem('procure.account.session', JSON.stringify({ token, expiry, lifetime })); } catch (_) {}
  }
  function restoreSession() {
    try {
      const saved = JSON.parse(sessionStorage.getItem('procure.account.session') || 'null');
      if (saved && typeof saved.token === 'string' && Number.isFinite(saved.expiry) && saved.expiry > Date.now() / 1000) {
        token = saved.token; expiry = saved.expiry; lifetime = Number(saved.lifetime) || (saved.expiry - Math.floor(Date.now() / 1000));
        return true;
      }
    } catch (_) {}
    try { sessionStorage.removeItem('procure.account.session'); } catch (_) {}
    return false;
  }
  function notice(message, error = false) {
    $('message').textContent = message;
    $('message').className = error ? 'error' : '';
    $('message').hidden = !message;
  }
  async function request(path, body, bearer) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch('../' + path, {
        method: body ? 'POST' : 'GET', cache: 'no-store', signal: controller.signal,
        headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(bearer ? { Authorization: 'Bearer ' + bearer } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {})
      });
      let data;
      try { data = await response.json(); } catch (_) { throw new Error('ระบบตอบกลับไม่สมบูรณ์ กรุณาลองใหม่'); }
      if (!response.ok || Number(data.success) !== 1) {
        const error = new Error(messages[data.message] || (path === 'adminUsers.php' ? data.message : '') || 'ไม่สามารถดำเนินการได้ กรุณาตรวจสอบข้อมูลแล้วลองใหม่');
        error.auth = response.status === 401 || response.status === 403 || (path === 'getUser.php' && Number(data.success) === 0);
        throw error;
      }
      return data;
    } catch (error) {
      if (error.name === 'AbortError' || error instanceof TypeError) throw new Error('เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่อีกครั้ง');
      throw error;
    } finally { clearTimeout(timeout); }
  }
  function clearAccount() {
    generation++; token = ''; expiry = 0; lifetime = 0; revealed = false;
    for (const id of ['user-name', 'user-email', 'user-role', 'token-expiry', 'token-status', 'token-lifetime-summary']) $(id).textContent = '';
    $('token-value').value = ''; $('profile-data').hidden = true;
    $('toggle-token').textContent = 'แสดงโทเคน';
    users = []; currentUserId = 0;
    $('users-body').replaceChildren(); $('admin-panel').hidden = true;
    document.body.classList.remove('admin-mode');
    try { sessionStorage.removeItem('procure.account.session'); } catch (_) {}
  }
  function route() {
    let page = location.hash.slice(1);
    if (!['login', 'register', 'profile'].includes(page)) page = token ? 'profile' : 'login';
    if (page === 'profile' && !token) page = 'login';
    if (location.hash !== '#' + page) { location.hash = page; return; }
    notice('');
    for (const id of ['login', 'register', 'profile']) $(id).hidden = id !== page;
    document.querySelectorAll('nav a').forEach(link => {
      if (link.hash === '#' + page) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    });
    document.querySelectorAll('input[type=password]').forEach(input => { input.value = ''; });
    if (page === 'profile') loadProfile();
  }
  async function loadProfile() {
    const current = generation;
    $('refresh').disabled = true; $('profile-data').hidden = true;
    notice('กำลังโหลดข้อมูล...');
    try {
      const data = await request('getUser.php', null, token);
      if (current !== generation) return;
      if (!data.user || typeof data.user.name !== 'string' || typeof data.user.email !== 'string') throw new Error('ข้อมูลผู้ใช้ไม่สมบูรณ์');
      $('user-name').textContent = data.user.name;
      $('user-email').textContent = data.user.email || 'ยังไม่ได้ระบุ';
      $('user-role').textContent = data.user.role === 'superadmin' ? 'Superadmin' : 'ผู้ใช้ทั่วไป';
      $('token-expiry').textContent = new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'Asia/Bangkok' }).format(new Date(expiry * 1000)) + ' (เวลาไทย)';
      $('token-status').textContent = 'ใช้งานได้';
      $('token-lifetime-summary').textContent = 'อายุโทเคนที่ได้รับ: ' + (lifetime >= 86400 ? (lifetime / 86400) + ' วัน' : (lifetime / 3600) + ' ชั่วโมง') + ' นับจากเวลา Login';
      $('token-value').value = revealed ? token : '••••••••••••••••••••••••••••••••';
      $('profile-data').hidden = false; notice('');
      $('admin-panel').hidden = data.user.role !== 'superadmin';
      document.body.classList.toggle('admin-mode', data.user.role === 'superadmin');
      if (data.user.role === 'superadmin') await loadUsers();
    } catch (error) {
      if (current !== generation) return;
      if (error.auth) { clearAccount(); location.hash = 'login'; }
      notice(error.message, true);
    } finally { $('refresh').disabled = false; }
  }
  for (const mode of ['login', 'register']) {
    $(mode + '-form').addEventListener('submit', async event => {
      event.preventDefault();
      const form = event.currentTarget, button = form.querySelector('button');
      const data = Object.fromEntries(new FormData(form));
      data.email = data.email.trim();
      if (mode === 'login') data.token_lifetime = Number(data.token_lifetime || 86400);
      if (data.password !== data.password.trim()) { notice('รหัสผ่านต้องไม่มีช่องว่างที่ต้นหรือท้าย', true); return; }
      if (mode === 'register' && data.password !== data.confirm) { notice('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน', true); return; }
      delete data.confirm;
      if (data.name) data.name = data.name.trim();
      button.disabled = true; notice('กำลังดำเนินการ...');
      const current = generation;
      try {
        const result = await request(mode + '.php', data);
        if (current !== generation) return;
        if (mode === 'register') {
          form.reset(); location.hash = 'login';
          $('login-email').value = data.email;
          setTimeout(() => notice('สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ'), 0);
        } else {
          if (typeof result.token !== 'string') throw new Error('ระบบไม่ได้ส่งโทเคนกลับมา');
          let payload;
          try { payload = JSON.parse(atob(result.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); } catch (_) { throw new Error('รูปแบบโทเคนไม่ถูกต้อง'); }
          if (!Number.isFinite(payload.exp) || payload.exp <= Date.now() / 1000) throw new Error('โทเคนหมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่');
          if (payload.exp - payload.iat !== (result.lifetime_managed ? result.token_lifetime : data.token_lifetime) ||
              (result.expires_at !== undefined && result.expires_at !== payload.exp)) {
            throw new Error('อายุโทเคนที่ระบบส่งกลับไม่ตรงกับที่เลือก กรุณารีเฟรชหน้าแล้ว Login ใหม่');
          }
          clearAccount(); token = result.token; expiry = payload.exp; lifetime = payload.exp - payload.iat; saveSession();
          // Preserve the selected lifetime so returning to Login does not show the old default.
          $('login-password').value = '';
          location.hash = 'profile';
        }
      } catch (error) { notice(error.message, true); }
      finally { button.disabled = false; }
    });
  }
  $('toggle-token').addEventListener('click', () => {
    revealed = !revealed; $('token-value').value = revealed ? token : '••••••••••••••••••••••••••••••••';
    $('toggle-token').textContent = revealed ? 'ซ่อนโทเคน' : 'แสดงโทเคน';
  });
  $('copy-token').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(token); notice('คัดลอกโทเคนแล้ว'); }
    catch (_) { notice('คัดลอกไม่ได้ กรุณากดแสดงโทเคนและคัดลอกด้วยตนเอง', true); }
  });
  $('logout').addEventListener('click', () => { clearAccount(); location.hash = 'login'; });
  $('refresh').addEventListener('click', loadProfile);
  const durations = [[null, 'ให้ผู้ใช้เลือก'], [3600, '1 ชั่วโมง'], [28800, '8 ชั่วโมง'], [86400, '1 วัน'], [604800, '7 วัน'], [2592000, '30 วัน']];
  function adminNotice(text, error = false) {
    $('admin-message').textContent = text;
    $('admin-message').className = error ? 'error-text' : 'muted';
  }
  async function loadUsers() {
    const current = generation;
    $('reload-users').disabled = true;
    adminNotice('กำลังโหลดรายชื่อ...');
    try {
      const result = await request('adminUsers.php', null, token);
      if (current !== generation) return;
      users = result.users; currentUserId = result.current_user_id;
      renderUsers(); adminNotice('');
    } catch (error) {
      if (current !== generation) return;
      $('users-body').replaceChildren(); adminNotice(error.message, true);
      if (error.auth) { clearAccount(); location.hash = 'login'; }
    } finally { $('reload-users').disabled = false; }
  }
  function renderUsers() {
    const term = $('user-search').value.trim().toLowerCase();
    const shown = users.filter(user => (user.name + ' ' + user.email).toLowerCase().includes(term));
    $('users-body').replaceChildren();
    $('users-count').textContent = 'แสดง ' + shown.length + ' จาก ' + users.length + ' บัญชี';
    for (const user of shown) {
      const row = document.createElement('tr');
      const cell = text => { const td = document.createElement('td'); td.textContent = text; row.append(td); return td; };
      const info = cell(user.name); const email = document.createElement('small'); email.textContent = user.email || 'ยังไม่ได้ระบุอีเมล'; info.append(email);
      cell(user.role === 'superadmin' ? 'Superadmin' : 'ผู้ใช้ทั่วไป');
      cell(Number(user.is_active) ? 'ใช้งาน' : 'ไม่ใช้งาน');
      const exp = Number(user.last_token_expires_at);
      cell(exp ? new Intl.DateTimeFormat('th-TH', {dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Bangkok'}).format(new Date(exp * 1000)) + (exp <= Date.now()/1000 ? ' (หมดอายุ)' : '') : 'ไม่มีโทเคนที่บันทึก / ถูกยกเลิก');
      const pickerCell = cell(''); const picker = document.createElement('select');
      picker.setAttribute('aria-label', 'อายุโทเคนของ ' + user.name);
      for (const [seconds, label] of durations) { const option = document.createElement('option'); option.value = seconds === null ? '' : String(seconds); option.textContent = label; picker.append(option); }
      picker.value = user.token_lifetime === null ? '' : String(user.token_lifetime); picker.disabled = adminBusy; pickerCell.append(picker);
      const actions = cell(''); actions.className = 'user-actions';
      function button(label, action, values, dangerous = false) {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = label; button.className = dangerous ? 'danger' : 'secondary'; button.disabled = adminBusy;
        button.addEventListener('click', () => changeUser(user, action, values())); actions.append(button); return button;
      }
      button('บันทึกอายุ', 'lifetime', () => ({token_lifetime:picker.value === '' ? null : Number(picker.value)}));
      button('Expire now', 'expire', () => ({}), true);
      const status = button(Number(user.is_active) ? 'ปิดใช้งาน' : 'เปิดใช้งาน', 'status', () => ({is_active:Number(user.is_active) ? 0 : 1}), Boolean(Number(user.is_active)));
      if (Number(user.id) === currentUserId) { status.disabled = true; status.title = 'ไม่สามารถปิดใช้งานบัญชีที่กำลังใช้'; }
      $('users-body').append(row);
    }
  }
  async function changeUser(user, action, values) {
    if (adminBusy) return;
    const descriptions = {lifetime:'บันทึกอายุโทเคนและยกเลิกโทเคนเดิม',expire:'ยกเลิกโทเคนเดิมทั้งหมดทันที',status:values.is_active ? 'เปิดใช้งานบัญชี' : 'ปิดใช้งานบัญชีและยกเลิกโทเคนเดิม'};
    if (!window.confirm(descriptions[action] + ' ของ ' + user.name + '?' + (Number(user.id) === currentUserId ? '\nคุณจะต้อง Login ใหม่' : ''))) return;
    const current = generation; adminBusy = true; renderUsers(); adminNotice('กำลังบันทึก...');
    try {
      const result = await request('adminUsers.php', {id:Number(user.id),action,...values}, token);
      if (current !== generation) return;
      if (result.reauthenticate) { clearAccount(); location.hash = 'login'; return; }
      await loadUsers(); adminNotice(result.message);
    } catch (error) {
      if (current !== generation) return;
      adminNotice(error.message, true);
      if (error.auth) { clearAccount(); location.hash = 'login'; }
    } finally { adminBusy = false; renderUsers(); }
  }
  $('reload-users').addEventListener('click', loadUsers);
  $('user-search').addEventListener('input', renderUsers);
  setInterval(() => {
    if (token && Date.now() / 1000 >= expiry) {
      clearAccount(); location.hash = 'login';
      setTimeout(() => notice('โทเคนหมดอายุ กรุณาเข้าสู่ระบบใหม่', true), 0);
    }
  }, 1000);
  window.addEventListener('hashchange', route);
  restoreSession();
  route();
})();
