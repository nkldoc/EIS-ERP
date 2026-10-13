(function () {
    'use strict';
    window.mountDocsNotifications = function (host) {
        if (!host || host.querySelector('.docs-notification-bell')) return;
        var bell = document.createElement('button');
        bell.type = 'button'; bell.className = 'docs-notification-bell';
        bell.innerHTML = '🔔 <span class="docs-notification-label">เอกสารรอลงนาม</span><span class="docs-notification-count" hidden></span>';
        bell.setAttribute('aria-expanded', 'false'); bell.setAttribute('aria-controls', 'supplies-docs-notifications');
        host.appendChild(bell);
        var panel = document.createElement('section'); panel.id = 'supplies-docs-notifications';
        panel.className = 'docs-notification-panel'; panel.hidden = true;
        panel.innerHTML = '<div class="docs-notification-heading"><strong>แจ้งเตือนเอกสาร</strong><button type="button" aria-label="ปิดแจ้งเตือน">×</button></div><div class="docs-notification-items" aria-live="polite"></div><a class="docs-notification-all" href="/eis-docs/docMain/" target="_blank" rel="noopener">เปิดระบบเอกสาร →</a>';
        document.body.appendChild(panel);
        var items = panel.querySelector('.docs-notification-items'), count = bell.querySelector('.docs-notification-count');
        var csrf = '', busy = false, stopped = false;
        function close() { panel.hidden = true; bell.setAttribute('aria-expanded', 'false'); }
        function position() { var rect = bell.getBoundingClientRect(); panel.style.top = Math.min(rect.bottom + 8, window.innerHeight - 100) + 'px'; }
        function message(value) { items.textContent = value; }
        function render(data) {
            csrf = data.csrf; count.hidden = !data.unread_count;
            count.textContent = data.unread_count > 99 ? '99+' : data.unread_count;
            bell.setAttribute('aria-label', 'แจ้งเตือนเอกสาร ยังไม่อ่าน ' + data.unread_count + ' รายการ');
            bell.title = 'แจ้งเตือนเอกสาร'; items.textContent = '';
            if (!data.notifications.length) { message('ยังไม่มีการแจ้งเตือนเอกสาร'); return; }
            data.notifications.forEach(function (item) {
                var link = document.createElement('a'); link.href = '/eis-docs/docMain/'; link.target = '_blank'; link.rel = 'noopener';
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
                .then(function (response) { if (response.status === 401) stopped = true; return response.json(); })
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
        var timer = setInterval(refresh, 30000);
        window.addEventListener('pagehide', function () { clearInterval(timer); });
        window.addEventListener('pageshow', function (event) { if (event.persisted) { timer = setInterval(refresh,30000); refresh(); } });
        message('กำลังโหลด...'); refresh();
    };
})();
