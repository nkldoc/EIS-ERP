(function () {
    'use strict';
    var productionDocs = location.hostname.toLowerCase() === 'eis.nmu.ac.th';
    var docsHome = (productionDocs ? 'https://doc-eis.nmu.ac.th' : '') + '/eis-docs/docMain/';
    window.mountDocsNotifications = function (host) {
        if (!host || host.querySelector('.docs-notification-bell')) return;
        var bell = document.createElement('button');
        bell.type = 'button'; bell.className = 'docs-notification-bell';
        bell.innerHTML = '<span class="docs-bell-icon" aria-hidden="true"></span> <span class="docs-notification-label">เอกสารรอลงนาม</span><span class="docs-notification-count" hidden></span>';
        bell.setAttribute('aria-expanded', 'false'); bell.setAttribute('aria-controls', 'supplies-docs-notifications');
        host.appendChild(bell);
        var panel = document.createElement('section'); panel.id = 'supplies-docs-notifications';
        panel.className = 'docs-notification-panel'; panel.hidden = true;
        panel.innerHTML = '<div class="docs-notification-heading"><strong>แจ้งเตือนเอกสาร</strong><button type="button" aria-label="ปิดแจ้งเตือน">×</button></div><div class="docs-notification-items" aria-live="polite"></div><a class="docs-notification-all" href="/eis-docs/docMain/" target="_blank" rel="noopener">เปิดระบบเอกสาร →</a>';
        document.body.appendChild(panel);
        panel.querySelector('.docs-notification-all').href = docsHome;
        panel.querySelector('.docs-notification-all').textContent = 'ดูแจ้งเตือนทั้งหมดที่ EIS-DOCS →';
        var items = panel.querySelector('.docs-notification-items'), count = bell.querySelector('.docs-notification-count');
        var csrf = '', busy = false, stopped = false;
        function close() { panel.hidden = true; bell.setAttribute('aria-expanded', 'false'); }
        function position() {
            var rect = bell.getBoundingClientRect();
            var top = Math.max(12, Math.min(rect.bottom + 8, window.innerHeight - 100));
            panel.style.top = top + 'px';
            panel.style.maxHeight = Math.max(0, window.innerHeight - top - 12) + 'px';
        }
        function message(value) { items.textContent = value; }
        function render(data) {
            csrf = data.csrf; count.hidden = !data.unread_count;
            count.textContent = data.unread_count > 99 ? '99+' : data.unread_count;
            bell.setAttribute('aria-label', 'แจ้งเตือนเอกสาร ยังไม่อ่าน ' + data.unread_count + ' รายการ');
            bell.title = 'แจ้งเตือนเอกสาร'; items.textContent = '';
            if (!data.notifications.length) { message('ยังไม่มีการแจ้งเตือนเอกสาร'); return; }
            data.notifications.forEach(function (item) {
                var link = document.createElement('a'); link.href = docsHome; link.target = '_blank'; link.rel = 'noopener';
                link.className = 'docs-notification-item' + (item.is_read ? '' : ' unread');
                var title = document.createElement('strong'), body = document.createElement('span'), date = document.createElement('small');
                title.textContent = item.title; body.textContent = item.message; date.textContent = item.created_at;
                link.appendChild(title); link.appendChild(body); link.appendChild(date); items.appendChild(link);
                link.addEventListener('click', function () {
                    fetch('docs-notifications.php', {method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},body:JSON.stringify({notification_id:item.notification_id})})
                        .then(function (response) { if (!response.ok) throw new Error('บันทึกสถานะอ่านไม่สำเร็จ'); return response.json(); })
                        .then(function (data) { if (data.success) render(data); }).catch(function () { bell.title = 'บันทึกสถานะอ่านไม่สำเร็จ ลองเปิดแจ้งเตือนอีกครั้ง'; });
                });
            });
        }
        function refresh() {
            if (busy || stopped || document.hidden) return;
            busy = true;
            fetch('docs-notifications.php', {credentials:'same-origin',cache:'no-store'})
                .then(function (response) { if (response.status === 401) stopped = true; if (!response.ok && response.status !== 401) throw new Error('โหลดแจ้งเตือนเอกสารไม่สำเร็จ (HTTP ' + response.status + ') กรุณาลองใหม่อีกครั้ง'); return response.json(); })
                .then(function (data) { if (!data.success) throw new Error(data.message); render(data); })
                .catch(function (error) { count.hidden = true; bell.title = 'โหลดแจ้งเตือนไม่สำเร็จ'; message(error.message || 'โหลดแจ้งเตือนไม่สำเร็จ กดระฆังเพื่อลองใหม่'); })
                .finally(function () { busy = false; });
        }
        bell.addEventListener('click', function () { panel.hidden = !panel.hidden; bell.setAttribute('aria-expanded', String(!panel.hidden)); if (!panel.hidden) { position(); refresh(); } });
        panel.querySelector('button').addEventListener('click', close);
        document.addEventListener('click', function (event) { if (!panel.contains(event.target) && !bell.contains(event.target)) close(); });
        document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !panel.hidden) { close(); bell.focus(); } });
        window.addEventListener('resize', position);
        document.addEventListener('visibilitychange', refresh);
        var socket = null, reconnectTimer = null, connecting = false, socketPaused = false, retryDelay = 5000;
        function scheduleReconnect() {
            clearTimeout(reconnectTimer);
            if (stopped || socketPaused) return;
            reconnectTimer = setTimeout(connectSocket, retryDelay);
            retryDelay = Math.min(retryDelay * 2, 60000);
        }
        function connectSocket() {
            if (!productionDocs || stopped || socketPaused || connecting || (socket && socket.readyState < 2)) return;
            connecting = true;
            fetch('docs-notifications.php?action=ws_token', {credentials:'same-origin',cache:'no-store'})
                .then(function (response) { if (response.status === 401) stopped = true; if (!response.ok) throw new Error('Token unavailable'); return response.json(); })
                .then(function (data) {
                    if (socketPaused || stopped) return;
                    if (!data.success || !data.token) throw new Error('Token unavailable');
                    var currentSocket = new WebSocket('wss://doc-eis.nmu.ac.th/eis-docs/ws/notifications?token=' + encodeURIComponent(data.token));
                    socket = currentSocket;
                    currentSocket.onopen = function () { retryDelay = 5000; refresh(); };
                    currentSocket.onmessage = function (event) { try { if (JSON.parse(event.data).type === 'EIS_DOCS_NOTIFICATION') refresh(); } catch (ignored) {} };
                    currentSocket.onclose = function () { if (socket === currentSocket) socket = null; scheduleReconnect(); };
                    currentSocket.onerror = function () { currentSocket.close(); };
                }).catch(scheduleReconnect).finally(function () { connecting = false; });
        }
        var timer = setInterval(refresh, 30000);
        connectSocket();
        window.addEventListener('pagehide', function () { clearInterval(timer); socketPaused = true; clearTimeout(reconnectTimer); if (socket) socket.close(); });
        window.addEventListener('pageshow', function (event) { if (event.persisted) { socketPaused = false; connectSocket(); timer = setInterval(refresh,30000); refresh(); } });
        message('กำลังโหลด...'); refresh();
    };
})();
