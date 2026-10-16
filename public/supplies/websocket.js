Ext.onReady(function () {
    (function () {
        var GAP = 12, RIGHT = 16, BOTTOM = 16, zBase = 9999999;
        var stack = [];

        function repositionAll() {
            var vp = Ext.getBody().getViewSize();
            var acc = BOTTOM;
            for (var i = 0; i < stack.length; i++) {
                var t = stack[i];
                if (!t.el || !t.el.dom)
                    continue;
                var w = t.el.getWidth(), h = t.el.getHeight();
                // set style with fixed bottom/right
                t.el.setStyle({
                    position: 'fixed',
                    right: RIGHT + 'px',
                    bottom: acc + 'px',
                    zIndex: zBase
                });
                acc += h + GAP;
            }
        }

        function playSound(type) {
            if (window.NOTIFY_MUTED)
                return;
            var map = {
                info: 'assets/snd/info.wav',
                success: 'assets/snd/success.wav',
                warning: 'assets/snd/warning.wav',
                error: 'assets/snd/error.wav'
            };
            var url = map[type] || map.info;
            try {
                var a = new Audio(url);
                a.play().catch(function () {});
            } catch (e) {
            }
        }

        Ext.Toast = {
            show: function (cfg) {
                cfg = Ext.apply({
                    type: 'info',
                    title: 'แจ้งเตือน',
                    message: '',
                    link: null,
                    ttl: 8000,
                    width: 350,
                    onClick: Ext.emptyFn,
                    onClose: Ext.emptyFn
                }, cfg || {});

                var colors = {info: '#e8f1ff', success: '#e8f9ef', warning: '#fff7e6', error: '#ffebee'};
                var color = colors[cfg.type] || '#f5f5f5';

                // create element appended to body
                var el = Ext.DomHelper.append(document.body, {
                    tag: 'div',
                    cls: 'toast-item toast-' + cfg.type,
                    style: 'font:normal 13px / 10px \'Mitr\', sans-serif; position:fixed; right:' + RIGHT + 'px; bottom:' + BOTTOM + 'px; z-index:' + zBase + '; width:' + cfg.width + 'px; opacity:0; border-radius:10px; box-shadow:0 8px 24px rgba(0,0,0,.2); overflow:hidden; background:#fff; border:1px solid #eee;'
                }, true);

                var html = '<div class="toast-head" style="background:' + color + '; padding:10px 12px; font-weight:bold;">' +
                        Ext.util.Format.htmlEncode(cfg.title) +
                        '<span class="toast-close" style="float:right; cursor:pointer; margin-left:8px;">✕</span></div>' +
                        '<div class="toast-body" style="padding:10px 12px; line-height:1.4;">' +
                        Ext.util.Format.htmlEncode(cfg.message) +
                        (cfg.link ? '<div style="margin-top:8px;"><a class="toast-link" href="./sp/app/list_pdf.php?path=' + cfg.link + '" target="_blank">เปิดรายละเอียด</a></div>' : '') +
                        '</div>';
                el.update(html);

                // fade in
                el.fadeIn({duration: .25});

                // events
                el.select('.toast-close').on('click', function () {
                    remove();
                });
                el.on('click', function (e) {
                    if (e.getTarget('a'))
                        return; // let links open
                    try {
                        cfg.onClick();
                    } catch (ex) {
                    }
                });

                // hover pause auto-close
                var remaining = cfg.ttl, start = Date.now(), timer = null, closing = false;
                function schedule() {
                    if (closing || !el.dom) return;
                    clearTimer();
                    timer = setTimeout(remove, remaining);
                    start = Date.now();
                }
                function clearTimer() {
                    if (timer) {
                        clearTimeout(timer);
                        timer = null;
                    }
                }
                function remove() {
                    if (closing) return;
                    closing = true;
                    clearTimer();
                    if (el.dom) el.fadeOut({duration: .2, callback: function () {
                            try {
                                el.remove();
                            } catch (e) {
                            }
                        }});
                    // remove from stack
                    for (var i = 0; i < stack.length; i++) {
                        if (stack[i].el === el) {
                            stack.splice(i, 1);
                            break;
                        }
                    }
                    repositionAll();
                    try {
                        cfg.onClose();
                    } catch (e) {
                    }
                }

                el.on('mouseenter', function () {
                    clearTimer();
                    remaining = Math.max(0, remaining - (Date.now() - start));
                });
                el.on('mouseleave', schedule);
                schedule();

                // push stack & reposition
                stack.unshift({el: el});
                repositionAll();

                // play sound
                playSound(cfg.type);

                return el;
            }
        };

        // expose reposition for external use
        window._ext_toast_reposition = repositionAll;
        Ext.EventManager.onWindowResize(function () {
            repositionAll();
        });

    })();
    // ===== WebSocket integration + toolbar buttons (Ext.session.user_id) =====
    (function () {
// ที่เก็บรายการล่าสุดจาก websocket/api
        window.NOTIFY_ROWS = [];     // โครง: {id,title,desc,status,time,createdAt,link,...}
        window.NOTIFY_UNREAD = 0;

// อัปเดต badge ที่ปุ่ม 🔔
        window.NOTIFY_STORE = new Ext.data.JsonStore({
            fields: [
                'id', 'title', 'desc', 'status', 'time',
                'type', 'level', 'link', 'createdAt'
            ]
        });
        window.updateNotifyBadge = function (count) {

            const el = document.querySelector('#notify-badge');
            if (el) {
                el.textContent = count;
                el.style.background = count > 0 ? '#d00' : '#888';
            }
        };
        window.updateUserOnlineBadge = function (count) {

            const el = document.querySelector('#online-badge');
            if (el) {
                el.textContent = count;
                el.style.background = count > 0 ? '#d00' : '#888';
            }
        };
// แปลง timestamp → ข้อความเวลา
        function formatTime(ms) { // ms epoch
            try {
                var d = new Date(ms);
                // แสดงแบบ dd/MM/yyyy HH:mm น. หรือจะใช้แบบ relative ก็ได้
                var pad = function (n) {
                    return (n < 10 ? '0' : '') + n;
                };
                return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' +
                        pad(d.getHours()) + ':' + pad(d.getMinutes()) + ' น.';
            } catch (e) {
                return '';
            }
        }
// รวม/แปลง payload → rows และคำนวณ unread

        function upsertNotifFromPayload(arr) {
            if (!Ext.isArray(arr))
                return;
            var map = {}; // กันซ้ำด้วย id
            window.NOTIFY_ROWS.forEach(function (x) {
                map[x.id] = x;
            });

            arr.forEach(function (x) {
                // x = record ดิบจาก websocket
                map[x.id] = {
                    id: x.id,
                    title: x.title || '',
                    desc: x.message || '',
                    status: x.status || 'unread',
                    level: x.level || '',
                    type: x.type || '',
                    module: x.module || '',
                    refCode: x.refCode || '',
                    link: x.link || '',
                    createdBy: x.createdBy || '',
                    createdAt: x.createdAt || 0,
                    time: formatTime(x.createdAt || 0)
                };
            });

            // เขียนกลับเป็น array และ sort ล่าสุดอยู่บน
            window.NOTIFY_ROWS = Object.values(map).sort(function (a, b) {
                return b.createdAt - a.createdAt;
            });
            window.NOTIFY_UNREAD = window.NOTIFY_ROWS.filter(function (r) {
                return r.status === 'unread';
            }).length;
            window.NOTIFY_STORE.loadData(window.NOTIFY_ROWS, false);
            window.updateNotifyBadge(window.NOTIFY_UNREAD);
        }

        // Legacy /notif WebSocket retired; keep notification UI helpers available.
    })();
});
