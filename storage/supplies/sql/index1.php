<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <title>SQL Console + Agent + History + Procedures + Views</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #f7f7f7; }
        textarea { width: 100%; height: 150px; font-family: monospace; }
        textarea#procedure-code { height: 300px; margin-top: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ccc; padding: 4px; }
        .tab-btn { display: inline-block; margin: 0 5px; padding: 5px 10px; border: 1px solid #ccc; cursor: pointer; background: #eee; }
        .tab-btn.active { background: white; font-weight: bold; }
        .tab-content { display: none; margin-top: 20px; background: white; padding: 10px; border: 1px solid #ccc; }
        .tab-content.active { display: block; }
        code { background: #eee; padding: 2px 4px; display: inline-block; max-width: 70%; overflow: auto; white-space: pre; }
    </style>
</head>
<body>
    <h2>🧠 SQL Console + SQL Agent + Tables + Procedures + Views + History</h2>

    <label>Database:
        <select id="db-select" onchange="saveDbSelection()">
            <option value="NMU_ERP">NMU_ERP</option>
            <option value="EIS_PROCURE">EIS_PROCURE</option>
            <option value="NMU_DATACENTER">NMU_DATACENTER</option>
            <option value="NMU_EIS">NMU_EIS</option>
            <option value="NMU">NMU</option>
            <option value="other">อื่นๆ</option>
        </select>
    </label>
    <input id="db-custom" placeholder="ชื่อ DB อื่น ๆ" style="width:200px;" disabled>

    <div>
        <div class="tab-btn active" onclick="showTab('console')">🖥 Console</div>
        <div class="tab-btn" onclick="showTab('tables')">📚 Tables</div>
        <div class="tab-btn" onclick="showTab('agent')">🛠 Agent</div>
        <div class="tab-btn" onclick="showTab('procedures')">⚙ Procedures & Views</div>
        <div class="tab-btn" onclick="showTab('history')">📜 History</div>
    </div>

    <div id="console" class="tab-content active">
        <textarea id="sql" placeholder="พิมพ์ SQL เช่น SELECT * FROM users"></textarea>
        <br>
        <button onclick="runQuery()">▶ Run</button>
        <div id="result"></div>
    </div>

    <div id="tables" class="tab-content">
        <input type="text" id="filter-name" oninput="filterTableList()" placeholder="🔍 ค้นหา table/view" style="width:100%;">
        <div id="table-list">รอโหลด...</div>
    </div>

    <div id="agent" class="tab-content">
        <button onclick="loadAgentJobs()">🔄 โหลด jobs</button>
        <div id="agent-jobs-list" style="margin-top: 10px;"></div>
    </div>

    <div id="procedures" class="tab-content">
        <button onclick="loadProceduresAndViews()">🔄 โหลด Procedures & Views</button>
        <div id="procedure-list" style="margin-top:10px;">ยังไม่โหลด</div>
        <hr>
        <h4>✏ แก้ไข Procedure / View</h4>
        <textarea id="procedure-code" placeholder="ALTER PROCEDURE หรือ ALTER VIEW ..."></textarea>
        <br>
        <button onclick="alterProcedure()">🔁 Alter Procedure</button>
        <button onclick="alterView()">🔁 Alter View</button>
    </div>

    <div id="history" class="tab-content">
        <div>
            <label>📂 กลุ่ม: 
                <select id="history-group" onchange="loadHistory()"></select>
                <input id="new-group-name" placeholder="เพิ่มกลุ่มใหม่">
                <button onclick="addHistoryGroup()">➕ เพิ่ม</button>
                <button onclick="deleteHistoryGroup()">🗑 ลบกลุ่ม</button>
            </label>
        </div>
        <hr>
        <div id="history-list">ยังไม่มีประวัติ</div>
    </div>

<script>
function saveDbSelection() {
    const sel = document.getElementById('db-select');
    const custom = document.getElementById('db-custom');
    localStorage.setItem('selectedDb', sel.value);
    custom.disabled = sel.value !== 'other';
}
function loadDbSelection() {
    const sel = document.getElementById('db-select');
    const custom = document.getElementById('db-custom');
    const saved = localStorage.getItem('selectedDb');
    if (saved) sel.value = saved;
    custom.disabled = sel.value !== 'other';
}
function getDb() {
    const sel = document.getElementById('db-select');
    return sel.value === 'other' ? document.getElementById('db-custom').value.trim() : sel.value;
}
function showTab(id) {
    document.querySelectorAll('.tab-btn').forEach(e => e.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(e => e.classList.remove('active'));
    document.querySelector(`.tab-btn[onclick="showTab('${id}')"]`).classList.add('active');
    document.getElementById(id).classList.add('active');
    if (id === 'tables') loadTables();
    if (id === 'history') {
        loadHistoryGroups();
        loadHistory();
    }
    if (id === 'procedures') loadProceduresAndViews();
}
function runQuery() {
    const sql = document.getElementById('sql').value;
    const db = getDb();
    if (!db || !sql) return alert("กรุณาเลือก DB และพิมพ์ SQL");
    saveHistory(sql);
    fetch('api.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: `action=execute&sql=${encodeURIComponent(sql)}&db=${encodeURIComponent(db)}`
    })
    .then(res => res.json())
    .then(data => {
        const div = document.getElementById('result');
        div.innerHTML = '';
        if (data.error) return div.innerHTML = `<span style="color:red;">❌ ${data.error}</span>`;
        if (data.rows) {
            if (data.rows.length === 0) return div.textContent = '✅ No results.';
            const table = document.createElement('table');
            const head = document.createElement('tr');
            Object.keys(data.rows[0]).forEach(k => {
                const th = document.createElement('th'); th.textContent = k; head.appendChild(th);
            });
            table.appendChild(head);
            data.rows.forEach(row => {
                const tr = document.createElement('tr');
                Object.values(row).forEach(v => {
                    const td = document.createElement('td');
                    td.textContent = v ?? '';
                    tr.appendChild(td);
                });
                table.appendChild(tr);
            });
            div.appendChild(table);
        } else {
            div.textContent = '✅ OK. Rows affected: ' + (data.affected_rows ?? 0);
        }
    });
}
function loadTables() {
    const db = getDb();
    fetch('api.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: `action=execute&sql=${encodeURIComponent("SELECT name, type_desc FROM sys.objects WHERE type_desc IN ('USER_TABLE','VIEW') ORDER BY name")}&db=${encodeURIComponent(db)}`
    })
    .then(res => res.json())
    .then(data => {
        const div = document.getElementById('table-list');
        if (data.error) return div.innerHTML = `<span style="color:red;">❌ ${data.error}</span>`;
        let html = '<ul id="table-ul">';
        data.rows.forEach(r => {
            html += `<li><b>${r.name}</b> (${r.type_desc}) <button onclick="viewTable('${r.name}')">👁 View</button></li>`;
        });
        html += '</ul>';
        div.innerHTML = html;
    });
}
function filterTableList() {
    const filter = document.getElementById('filter-name').value.toLowerCase();
    document.querySelectorAll('#table-ul li').forEach(li => {
        li.style.display = li.textContent.toLowerCase().includes(filter) ? '' : 'none';
    });
}
function viewTable(name) {
    document.getElementById('sql').value = `SELECT TOP 100 * FROM [${name}]`;
    showTab('console');
    runQuery();
}
function loadAgentJobs() {
    const db = getDb();
    document.getElementById('agent-jobs-list').textContent = '⏳ กำลังโหลด...';
    fetch('api.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: `action=getJobs&db=${encodeURIComponent(db)}`
    })
    .then(res => res.json())
    .then(data => {
        const div = document.getElementById('agent-jobs-list');
        if (data.error) return div.innerHTML = `<span style="color:red;">❌ ${data.error}</span>`;
        let html = '<ul>';
        data.jobs.forEach(j => {
            html += `<li>${j.name} <button onclick="runAgentJob('${j.name.replace(/'/g, "\\'")}')">▶ Run</button></li>`;
        });
        html += '</ul>';
        div.innerHTML = html;
    });
}
function runAgentJob(name) {
    const db = getDb();
    if (!confirm(`ยืนยันรัน SQL Agent Job: ${name} ?`)) return;
    fetch('api.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: `action=runJob&db=${encodeURIComponent(db)}&jobName=${encodeURIComponent(name)}`
    })
    .then(res => res.json())
    .then(data => {
        alert(data.success ? '✅ Job started' : '❌ ' + data.error);
    });
}
// โหลด Procedures และ Views รวมกัน
function loadProceduresAndViews() {
    const db = getDb();
    document.getElementById('procedure-list').textContent = '⏳ กำลังโหลด...';
    const sql = `
        SELECT name, type_desc 
        FROM sys.objects 
        WHERE type_desc IN ('SQL_STORED_PROCEDURE','VIEW') 
        ORDER BY name
    `;
    fetch('api.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: `action=execute&sql=${encodeURIComponent(sql)}&db=${encodeURIComponent(db)}`
    })
    .then(res => res.json())
    .then(data => {
        const div = document.getElementById('procedure-list');
        if (data.error) return div.innerHTML = `<span style="color:red;">❌ ${data.error}</span>`;
        let html = '<ul>';
        data.rows.forEach(p => {
            const name = p.name.replace(/'/g, "\\'");
            const type = p.type_desc;
            let btn = '';
            if(type === 'SQL_STORED_PROCEDURE') {
                btn = `<button onclick="viewProcedure('${name}')">👁 View Procedure</button>`;
            } else if(type === 'VIEW') {
                btn = `<button onclick="viewView('${name}')">👁 View View</button>`;
            }
            html += `<li><b>${p.name}</b> (${type}) ${btn}</li>`;
        });
        html += '</ul>';
        div.innerHTML = html;
    });
}
// ดู definition procedure
function viewProcedure(name) {
    const db = getDb();
    fetch('api.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: `action=getProcedureDefinition&db=${encodeURIComponent(db)}&procedureName=${encodeURIComponent(name)}`
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) return alert("❌ " + data.error);
        document.getElementById('procedure-code').value = data.definition || '';
    });
}
// ดู definition view
function viewView(name) {
    const db = getDb();
    const sql = `EXEC sp_helptext @objname = N'${name}'`; // หรือใช้ sys.sql_modules
    fetch('api.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: `action=execute&sql=${encodeURIComponent(sql)}&db=${encodeURIComponent(db)}`
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) return alert("❌ " + data.error);
        // sp_helptext คืนค่าแต่ละบรรทัดใน rows[]
        let def = '';
        if (data.rows) {
            def = data.rows.map(r => Object.values(r)[0]).join('');
        }
        document.getElementById('procedure-code').value = def;
    });
}
function alterProcedure() {
    const sql = document.getElementById('procedure-code').value.trim();
    const db = getDb();
    if (!sql.toLowerCase().startsWith("alter procedure")) {
        return alert("❌ ต้องเป็น ALTER PROCEDURE เท่านั้น");
    }
    if (!confirm("ยืนยันการ ALTER PROCEDURE นี้?")) return;
    fetch('api.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: `action=execute&sql=${encodeURIComponent(sql)}&db=${encodeURIComponent(db)}`
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) return alert("❌ " + data.error);
        alert("✅ ALTER PROCEDURE สำเร็จ");
    });
}
function alterView() {
    const sql = document.getElementById('procedure-code').value.trim();
    const db = getDb();
    if (!sql.toLowerCase().startsWith("alter view")) {
        return alert("❌ ต้องเป็น ALTER VIEW เท่านั้น");
    }
    if (!confirm("ยืนยันการ ALTER VIEW นี้?")) return;
    fetch('api.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: `action=execute&sql=${encodeURIComponent(sql)}&db=${encodeURIComponent(db)}`
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) return alert("❌ " + data.error);
        alert("✅ ALTER VIEW สำเร็จ");
    });
}

function getHistoryGroups() {
    return JSON.parse(localStorage.getItem('sqlHistoryGroups') || '["ทั่วไป"]');
}
function setHistoryGroups(groups) {
    localStorage.setItem('sqlHistoryGroups', JSON.stringify(groups));
}
function getCurrentGroup() {
    return document.getElementById('history-group').value;
}
function loadHistoryGroups() {
    const groups = getHistoryGroups();
    const sel = document.getElementById('history-group');
    sel.innerHTML = '';
    groups.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g;
        opt.textContent = g;
        sel.appendChild(opt);
    });
}
function addHistoryGroup() {
    const newName = document.getElementById('new-group-name').value.trim();
    if (!newName) return alert("กรุณาตั้งชื่อกลุ่มใหม่");
    let groups = getHistoryGroups();
    if (groups.includes(newName)) return alert("มีกลุ่มนี้อยู่แล้ว");
    groups.push(newName);
    setHistoryGroups(groups);
    loadHistoryGroups();
    document.getElementById('history-group').value = newName;
    loadHistory();
}
function deleteHistoryGroup() {
    const group = getCurrentGroup();
    if (group === 'ทั่วไป') return alert("ไม่สามารถลบกลุ่ม 'ทั่วไป' ได้");
    if (!confirm(`ลบกลุ่ม "${group}" พร้อมข้อมูลทั้งหมด?`)) return;
    let groups = getHistoryGroups().filter(g => g !== group);
    localStorage.removeItem('sqlHistory_' + group);
    setHistoryGroups(groups);
    loadHistoryGroups();
    document.getElementById('history-group').value = groups[0];
    loadHistory();
}
function saveHistory(sql) {
    if (!sql.trim()) return;
    const group = getCurrentGroup() || 'ทั่วไป';
    let history = JSON.parse(localStorage.getItem('sqlHistory_' + group) || '[]');
    if (history[0] !== sql.trim()) {
        history.unshift(sql.trim());
        if (history.length > 50) history.pop();
        localStorage.setItem('sqlHistory_' + group, JSON.stringify(history));
    }
}
function loadHistory() {
    const group = getCurrentGroup();
    const history = JSON.parse(localStorage.getItem('sqlHistory_' + group) || '[]');
    const div = document.getElementById('history-list');
    if (history.length === 0) return div.textContent = 'ยังไม่มีประวัติ';
    let html = '<ul>';
    history.forEach((sql, idx) => {
        const safeSql = sql.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        html += `<li><code>${safeSql}</code> 
                 <button onclick="loadFromHistory(\`${sql.replace(/`/g, "\\`")}\`)">⏎ Load</button>
                 <button onclick="deleteHistoryItem(${idx})">🗑</button></li>`;
    });
    html += '</ul>';
    div.innerHTML = html;
}
function deleteHistoryItem(index) {
    const group = getCurrentGroup();
    let history = JSON.parse(localStorage.getItem('sqlHistory_' + group) || '[]');
    history.splice(index, 1);
    localStorage.setItem('sqlHistory_' + group, JSON.stringify(history));
    loadHistory();
}
function loadFromHistory(sql) {
    document.getElementById('sql').value = sql;
    showTab('console');
}

loadDbSelection();
</script>
</body>
</html>
