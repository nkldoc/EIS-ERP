/* global Ext */
/*
 * console-log-window.js
 * -----------------------------------------------------------------------
 * เปิดหน้าต่างเบราว์เซอร์ใหม่ (window.open) แล้วส่งข้อความจาก
 * console.log / info / warn / error / debug ของหน้าหลักไปแสดงแบบ real-time
 * รวมถึงดักจับ uncaught error และ unhandled promise rejection ด้วย
 *
 * วิธีใช้: โหลดสคริปต์นี้ทีเดียว มันจะพยายามเปิดหน้าต่าง popup ให้อัตโนมัติ
 * ถ้าเบราว์เซอร์บล็อก popup (เพราะไม่ได้เกิดจาก user gesture) จะมีปุ่มลอย
 * มุมขวาล่างของหน้าเดิมให้กดเปิดเองแทน
 *
 * เปิดซ้ำเองได้ทุกเมื่อผ่าน: window.openConsoleLogWindow()
 * ปิดการดักจับ (คืนค่า console เดิม) ผ่าน: window.stopConsoleLogWindow()
 */
(function () {
    "use strict";

    if (window.__consoleLogWindowInstalled) {
        return; // กันโหลดซ้ำ
    }
    window.__consoleLogWindowInstalled = true;

    var POPUP_NAME = "consoleLogViewer";
    var MAX_ENTRIES = 800; // จำกัดจำนวนแถวใน DOM กันหน่วยความจำบวม
    var LEVELS = ["log", "info", "warn", "error", "debug"];

    var originalConsole = {};
    LEVELS.forEach(function (level) {
        originalConsole[level] = window.console && window.console[level] ? window.console[level].bind(window.console) : function () {};
    });

    var logWin = null;
    var pendingQueue = [];
    var paused = false;
    var installed = true;
    var reopenNoticeShown = false;

    function popupFeatures() {
        var width = 560;
        var height = 640;
        var left = Math.max(0, (screen.availWidth || 1024) - width - 20);
        var top = 40;
        return "width=" + width + ",height=" + height + ",left=" + left + ",top=" + top + ",resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no,location=no";
    }

    function buildHtml() {
        return (
            "<!DOCTYPE html><html lang='th'><head><meta charset='utf-8'><title>Console Log Viewer</title>" +
            "<style>" +
            "html,body{margin:0;padding:0;height:100%;background:#1e1e1e;color:#d4d4d4;font:12px/1.5 Consolas,Menlo,'Courier New',monospace;}" +
            "#toolbar{position:sticky;top:0;display:flex;gap:6px;align-items:center;flex-wrap:wrap;padding:6px 8px;background:#252526;border-bottom:1px solid #3c3c3c;}" +
            "#toolbar button{background:#3c3c3c;color:#eee;border:1px solid #555;border-radius:3px;padding:3px 8px;font-size:11px;cursor:pointer;}" +
            "#toolbar button:hover{background:#4a4a4a;}" +
            "#toolbar button.active{background:#0e639c;border-color:#1177bb;}" +
            "#toolbar input[type=text]{flex:1;min-width:120px;background:#1e1e1e;color:#eee;border:1px solid #555;border-radius:3px;padding:3px 6px;font-size:11px;}" +
            "#toolbar label{display:flex;align-items:center;gap:3px;font-size:11px;color:#ccc;user-select:none;}" +
            "#count{color:#888;font-size:11px;margin-left:auto;white-space:nowrap;}" +
            "#log{padding:4px 0;overflow-y:auto;height:calc(100% - 40px);}" +
            ".row{display:flex;gap:8px;padding:2px 10px;border-bottom:1px solid #2a2a2a;white-space:pre-wrap;word-break:break-word;}" +
            ".row:hover{background:#2a2a2a;}" +
            ".time{color:#6a9955;flex-shrink:0;}" +
            ".badge{flex-shrink:0;font-weight:bold;width:56px;}" +
            ".msg{flex:1;}" +
            ".lvl-log .badge{color:#d4d4d4;}" +
            ".lvl-info .badge,.lvl-info .msg{color:#4fc1ff;}" +
            ".lvl-warn{background:#3a2f00;}.lvl-warn .badge,.lvl-warn .msg{color:#dcdcaa;}" +
            ".lvl-error{background:#3a0000;}.lvl-error .badge,.lvl-error .msg{color:#f14c4c;}" +
            ".lvl-debug .badge,.lvl-debug .msg{color:#9cdcfe;}" +
            ".hidden{display:none;}" +
            "#empty{color:#777;padding:20px;text-align:center;}" +
            "</style></head><body>" +
            "<div id='toolbar'>" +
            "<button id='btn-clear' title='ล้างข้อความทั้งหมด'>ล้าง</button>" +
            "<button id='btn-pause' title='หยุด/เริ่มรับข้อความใหม่'>หยุดชั่วคราว</button>" +
            "<button id='btn-copy' title='คัดลอกทั้งหมด'>คัดลอกทั้งหมด</button>" +
            "<button id='btn-autoscroll' class='active' title='เลื่อนลงล่างอัตโนมัติ'>เลื่อนอัตโนมัติ</button>" +
            "<label><input type='checkbox' class='lvl-filter' value='log' checked>log</label>" +
            "<label><input type='checkbox' class='lvl-filter' value='info' checked>info</label>" +
            "<label><input type='checkbox' class='lvl-filter' value='warn' checked>warn</label>" +
            "<label><input type='checkbox' class='lvl-filter' value='error' checked>error</label>" +
            "<label><input type='checkbox' class='lvl-filter' value='debug' checked>debug</label>" +
            "<input type='text' id='search' placeholder='ค้นหาข้อความ...'>" +
            "<span id='count'>0 รายการ</span>" +
            "</div>" +
            "<div id='log'><div id='empty'>ยังไม่มีข้อความ...</div></div>" +
            "</body></html>"
        );
    }

    function safeStringify(value) {
        if (typeof value === "string") {
            return value;
        }
        if (value instanceof Error) {
            return value.stack || value.message || String(value);
        }
        if (value === undefined) {
            return "undefined";
        }
        if (value === null) {
            return "null";
        }
        if (typeof value === "function") {
            return "[Function: " + (value.name || "anonymous") + "]";
        }
        var seen = [];
        try {
            return JSON.stringify(
                value,
                function (key, val) {
                    if (typeof val === "object" && val !== null) {
                        if (seen.indexOf(val) !== -1) {
                            return "[Circular]";
                        }
                        seen.push(val);
                    }
                    return val;
                },
                2,
            );
        } catch (e) {
            try {
                return String(value);
            } catch (e2) {
                return "[Unserializable value]";
            }
        }
    }

    function formatArgs(args) {
        var parts = [];
        for (var i = 0; i < args.length; i++) {
            parts.push(safeStringify(args[i]));
        }
        return parts.join(" ");
    }

    function pad(n, len) {
        var s = String(n);
        while (s.length < (len || 2)) {
            s = "0" + s;
        }
        return s;
    }

    function timestamp() {
        var d = new Date();
        return pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds()) + "." + pad(d.getMilliseconds(), 3);
    }

    function entryHtml(level, text, doc) {
        var row = doc.createElement("div");
        row.className = "row lvl-" + level;
        var time = doc.createElement("span");
        time.className = "time";
        time.textContent = timestamp();
        var badge = doc.createElement("span");
        badge.className = "badge";
        badge.textContent = level.toUpperCase();
        var msg = doc.createElement("span");
        msg.className = "msg";
        msg.textContent = text;
        row.appendChild(time);
        row.appendChild(badge);
        row.appendChild(msg);
        return row;
    }

    function applyRowFilter(row, doc) {
        var win = doc.defaultView;
        var levelBoxes = doc.querySelectorAll(".lvl-filter");
        var activeLevels = {};
        levelBoxes.forEach(function (box) {
            if (box.checked) activeLevels[box.value] = true;
        });
        var searchTerm = (doc.getElementById("search").value || "").toLowerCase();
        var levelMatch = false;
        LEVELS.forEach(function (lvl) {
            if (row.className.indexOf("lvl-" + lvl) !== -1 && activeLevels[lvl]) {
                levelMatch = true;
            }
        });
        var textMatch = !searchTerm || row.textContent.toLowerCase().indexOf(searchTerm) !== -1;
        row.classList.toggle("hidden", !(levelMatch && textMatch));
    }

    function updateCount(doc) {
        var visible = doc.querySelectorAll("#log .row:not(.hidden)").length;
        var total = doc.querySelectorAll("#log .row").length;
        doc.getElementById("count").textContent = visible + " / " + total + " รายการ";
    }

    function wireControls(doc) {
        var win = doc.defaultView;
        var logEl = doc.getElementById("log");
        var autoScroll = true;

        doc.getElementById("btn-clear").addEventListener("click", function () {
            logEl.innerHTML = "<div id='empty'>ยังไม่มีข้อความ...</div>";
            updateCount(doc);
        });

        var pauseBtn = doc.getElementById("btn-pause");
        pauseBtn.addEventListener("click", function () {
            paused = !paused;
            pauseBtn.textContent = paused ? "เริ่มรับข้อความ" : "หยุดชั่วคราว";
            pauseBtn.classList.toggle("active", paused);
        });

        doc.getElementById("btn-copy").addEventListener("click", function () {
            var rows = doc.querySelectorAll("#log .row");
            var lines = [];
            rows.forEach(function (r) {
                lines.push(r.textContent);
            });
            var text = lines.join("\n");
            try {
                win.navigator.clipboard.writeText(text);
            } catch (e) {
                var area = doc.createElement("textarea");
                area.value = text;
                doc.body.appendChild(area);
                area.select();
                try {
                    doc.execCommand("copy");
                } catch (e2) {}
                doc.body.removeChild(area);
            }
        });

        var autoScrollBtn = doc.getElementById("btn-autoscroll");
        autoScrollBtn.addEventListener("click", function () {
            autoScroll = !autoScroll;
            autoScrollBtn.classList.toggle("active", autoScroll);
        });
        logEl._getAutoScroll = function () {
            return autoScroll;
        };

        doc.querySelectorAll(".lvl-filter").forEach(function (box) {
            box.addEventListener("change", function () {
                doc.querySelectorAll("#log .row").forEach(function (row) {
                    applyRowFilter(row, doc);
                });
                updateCount(doc);
            });
        });

        doc.getElementById("search").addEventListener("input", function () {
            doc.querySelectorAll("#log .row").forEach(function (row) {
                applyRowFilter(row, doc);
            });
            updateCount(doc);
        });
    }

    function appendToPopup(level, text) {
        if (!logWin || logWin.closed) {
            return false;
        }
        var doc = logWin.document;
        var logEl = doc.getElementById("log");
        if (!logEl) {
            return false;
        }
        var empty = doc.getElementById("empty");
        if (empty) {
            empty.remove();
        }
        var row = entryHtml(level, text, doc);
        applyRowFilter(row, doc);
        logEl.appendChild(row);

        while (logEl.querySelectorAll(".row").length > MAX_ENTRIES) {
            var first = logEl.querySelector(".row");
            if (!first) break;
            first.remove();
        }

        if (logEl._getAutoScroll ? logEl._getAutoScroll() : true) {
            logEl.scrollTop = logEl.scrollHeight;
        }
        updateCount(doc);
        return true;
    }

    function flushPending() {
        if (!logWin || logWin.closed) {
            return;
        }
        while (pendingQueue.length) {
            var item = pendingQueue.shift();
            appendToPopup(item.level, item.text);
        }
    }

    function pushEntry(level, text) {
        if (paused) {
            return;
        }
        if (!logWin || logWin.closed) {
            pendingQueue.push({ level: level, text: text });
            if (pendingQueue.length > MAX_ENTRIES) {
                pendingQueue.shift();
            }
            return;
        }
        appendToPopup(level, text);
    }

    function showFallbackButton() {
        if (reopenNoticeShown || document.getElementById("__consoleLogWindowFallbackBtn")) {
            return;
        }
        reopenNoticeShown = true;
        var btn = document.createElement("button");
        btn.id = "__consoleLogWindowFallbackBtn";
        btn.textContent = "📋 เปิดหน้าต่าง Console Log";
        btn.style.cssText =
            "position:fixed;right:14px;bottom:14px;z-index:999999;background:#0e639c;color:#fff;border:none;" +
            "border-radius:20px;padding:9px 16px;font-size:12px;box-shadow:0 2px 6px rgba(0,0,0,.35);cursor:pointer;";
        btn.addEventListener("click", function () {
            openPopup();
            if (logWin && !logWin.closed) {
                btn.remove();
                reopenNoticeShown = false;
            }
        });
        (document.body || document.documentElement).appendChild(btn);
    }

    function openPopup() {
        try {
            logWin = window.open("", POPUP_NAME, popupFeatures());
        } catch (e) {
            logWin = null;
        }
        if (!logWin) {
            originalConsole.warn("[console-log-window] เบราว์เซอร์บล็อก popup — กดปุ่มมุมขวาล่างเพื่อเปิดหน้าต่าง Console Log เอง");
            showFallbackButton();
            return;
        }
        var doc = logWin.document;
        doc.open();
        doc.write(buildHtml());
        doc.close();
        wireControls(doc);
        flushPending();
        try {
            logWin.addEventListener("beforeunload", function () {
                logWin = null;
            });
        } catch (e) {}
        var existingBtn = document.getElementById("__consoleLogWindowFallbackBtn");
        if (existingBtn) {
            existingBtn.remove();
            reopenNoticeShown = false;
        }
    }

    function overrideConsole() {
        LEVELS.forEach(function (level) {
            window.console[level] = function () {
                originalConsole[level].apply(window.console, arguments);
                if (!installed) return;
                try {
                    pushEntry(level, formatArgs(Array.prototype.slice.call(arguments)));
                } catch (e) {
                    // ห้ามให้ตัวดักจับ log ทำให้หน้าเว็บพังเด็ดขาด
                }
            };
        });
    }

    function restoreConsole() {
        LEVELS.forEach(function (level) {
            window.console[level] = originalConsole[level];
        });
    }

    window.addEventListener("error", function (evt) {
        if (!installed) return;
        var text = "Uncaught: " + (evt.message || "") + (evt.filename ? " (" + evt.filename + ":" + evt.lineno + ":" + evt.colno + ")" : "");
        pushEntry("error", text);
    });

    window.addEventListener("unhandledrejection", function (evt) {
        if (!installed) return;
        var reason = evt.reason;
        var text = "Unhandled Promise Rejection: " + (reason && reason.stack ? reason.stack : safeStringify(reason));
        pushEntry("error", text);
    });

    window.openConsoleLogWindow = function () {
        openPopup();
    };

    window.stopConsoleLogWindow = function () {
        installed = false;
        restoreConsole();
        if (logWin && !logWin.closed) {
            logWin.close();
        }
    };

    overrideConsole();

    // พยายามเปิด popup ทันที ถ้าถูกบล็อกจะโชว์ปุ่มลอยให้กดเปิดเอง
    var tryOpen = function () {
        openPopup();
    };
    if (document.readyState === "complete" || document.readyState === "interactive") {
        tryOpen();
    } else {
        document.addEventListener("DOMContentLoaded", tryOpen);
    }
})();
