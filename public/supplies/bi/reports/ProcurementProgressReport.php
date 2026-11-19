<?php
include("../../conf/config.php");
if (empty($_SESSION['user_id'])) {
    echo '<script>window.top.location.href="../../access/signin.php";</script>';
    exit;
}
?>
<!doctype html>
<html lang="th">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Dashboard ติดตามงานจัดซื้อจัดจ้าง</title>
    <link rel="stylesheet" href="../css/ProcurementProgressDashboard.css?v=20261119">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
</head>
<body>
<main class="dashboard-shell">
    <header class="dashboard-header">
        <div><h1><span class="title-icon">▧</span> Dashboard ติดตามงานจัดซื้อจัดจ้าง</h1><p>รายงานภาพรวมและระบบแจ้งเตือน (KPI) จากข้อมูลระบบจัดซื้อจัดจ้างของ EIS</p></div>
        <div class="header-actions">
            <label>ปีงบประมาณ <select id="yearFilter"><option value="">ทั้งหมด</option></select></label>
            <label>แหล่งเงิน <select id="fundFilter"><option value="">รวมทั้งหมด</option></select></label>
            <button id="refreshButton" class="primary-button">↻ ดึงข้อมูลใหม่</button>
        </div>
    </header>
    <nav class="dashboard-tabs" aria-label="เมนูรายงาน">
        <button class="active" data-tab="overview">⌘ ภาพรวมจัดซื้อ (Overview)</button><button data-tab="kpi">◎ รายงาน KPI (รวมทุกประเภท)</button><button data-tab="calendar">▧ ปฏิทินเฝ้าระวัง KPI</button><button data-tab="personal">♧ รายงานส่วนบุคคล</button>
    </nav>
    <section id="overviewSection">
        <div class="metric-grid">
            <article class="metric-card"><div><span>จำนวนงานทั้งหมด</span><strong id="totalJobs">0</strong><small>รายการ</small></div><i class="blue">▧</i></article>
            <article class="metric-card"><div><span>จำนวนงานที่เข้าเกณฑ์ KPI</span><strong id="kpiJobs">0</strong><small class="purple-text">เข้าเกณฑ์ประเมิน KPI</small></div><i class="purple">◎</i></article>
            <article class="metric-card"><div><span>เบิกจ่าย/เสร็จสิ้นแล้ว</span><strong id="completedJobs">0</strong><small id="completedPercent" class="green-text">0% สำเร็จแล้ว</small></div><i class="green">◴</i></article>
        </div>
        <article class="panel chart-panel">
            <div class="panel-heading"><h2>♧ ภาระงานแยกตามเจ้าหน้าที่</h2><div class="segmented" id="groupButtons"><button class="active" data-group="fund_source">แยกตามแหล่งเงิน</button><button data-group="procurement_type">แยกตามประเภท</button><button data-group="method_name">แยกตามวิธีจัดหา</button></div></div>
            <div class="chart-holder"><canvas id="workloadChart"></canvas></div>
        </article>
        <div class="ratio-grid">
            <article class="panel ratio-card"><div><b>▧ สัดส่วนการบริหารสัญญา (ภาพรวม)</b><strong id="contractPercent">0%</strong></div><div class="progress purple-bar"><span id="contractBar"></span></div><footer><span>บริหารสัญญา: <b id="contractJobs">0</b> รายการ</span><span>งานทั้งหมด: <b id="ratioTotal">0</b> รายการ</span></footer></article>
            <article class="panel ratio-card"><div><b>◴ ความคืบหน้าการเบิกจ่าย (ภาพรวม)</b><strong class="green-text" id="paymentPercent">0%</strong></div><div class="progress green-bar"><span id="paymentBar"></span></div><footer><span>เบิกจ่ายสมบูรณ์: <b id="paidJobs">0</b> รายการ</span><span>รวมที่ต้องจัดการ: <b id="managedJobs">0</b> รายการ</span></footer></article>
        </div>
    </section>
    <section id="issueSection" class="issue-grid overview-extra">
        <article class="issue-card normal"><div><b>◴ ปกติ</b><small>ดำเนินการตามแผน</small></div><strong id="issue0">0</strong></article>
        <article class="issue-card warning"><div><b>◎ มีปัญหาเล็กน้อย /<br>ดำเนินการต่อได้</b></div><strong id="issue1">0</strong></article>
        <article class="issue-card danger"><div><b>✕ มีปัญหา / ไม่สามารถ<br>ดำเนินการต่อได้</b></div><strong id="issue2">0</strong></article>
    </section>
    <section id="pipelineSection" class="panel overview-extra">
        <div class="panel-heading"><h2>ความคืบหน้าจาก งวด → รับของ → ตรวจรับ → เบิกจ่ายสมบูรณ์</h2><span class="muted">คำนวณจาก period_id / check_id / po_working_id และสถานะเบิกจ่ายจริง</span></div><div class="pipeline-grid" id="pipelineGrid"></div>
    </section>
    <section class="status-grid overview-extra">
        <article class="panel"><div class="panel-heading"><h2>สัดส่วนสถานะงาน</h2><select id="statusOwnerFilter"><option value="">รวมทุกเจ้าหน้าที่</option></select></div><div class="donut-holder"><canvas id="statusChart"></canvas></div><p class="chart-note">สถานะคำนวณจากขั้นตอนล่าสุดของแต่ละ PR</p></article>
        <article class="panel status-table-panel"><div class="panel-heading"><div><h2>ตารางสรุปสถานะและใบกันเหลื่อม</h2><p class="muted">อ้างอิง PR, สัญญา และใบกันเหลื่อมจาก NMU_EIS</p></div></div><div class="table-scroll"><table><thead><tr><th>สถานะ</th><th class="overlap-head no-debt">ยังไม่ก่อหนี้<br><small>อ้างอิง PR</small></th><th class="overlap-head debt">ก่อหนี้แล้ว<br><small>อ้างอิงสัญญา</small></th><th class="overlap-head saved">บันทึกใบกันเหลื่อมแล้ว<br><small>NMU_EIS</small></th><th>รวม</th></tr></thead><tbody id="statusRows"></tbody></table></div></article>
    </section>
    <section id="detailSection" class="panel overview-extra">
        <div class="panel-heading detail-heading"><div><h2>ตารางสรุปภาพรวมทั้งหมด</h2><p class="muted">แสดงสถานะล่าสุดและกระบวนการเบิกจ่ายของแต่ละ PR</p></div><input id="keywordFilter" placeholder="ค้นหาเลข PR / โครงการ / เจ้าหน้าที่"></div>
        <div class="table-scroll detail-table"><table><thead><tr><th>เลข PR</th><th>โครงการ/รายการ</th><th>เจ้าหน้าที่</th><th>แหล่งเงิน</th><th>ประเภท</th><th>สถานะล่าสุด</th><th>สถานะใบกันเหลื่อม</th><th>ระดับปัญหา</th><th>งวด</th><th>รับของ</th><th>ตรวจรับ</th><th>เบิกสมบูรณ์</th></tr></thead><tbody id="detailRows"></tbody></table></div>
    </section>
    <section id="kpiTab" class="tab-pane">
        <div class="tab-title"><div><h2>◎ รายงาน KPI (รวมทุกประเภท)</h2><p>สรุปรายการตามระดับปัญหาและขั้นตอนดำเนินงาน</p></div><select id="kpiLevelFilter"><option value="">ทุกระดับ</option><option value="0">ระดับ 0 — ปกติ</option><option value="1">ระดับ 1 — มีปัญหาเล็กน้อย</option><option value="2">ระดับ 2 — ไม่สามารถดำเนินการต่อได้</option></select></div>
        <div id="kpiSummary" class="metric-grid compact-metrics"></div>
        <article class="panel"><div class="table-scroll detail-table"><table><thead><tr><th>เลข PR</th><th>รายการ</th><th>เจ้าหน้าที่</th><th>ขั้นตอนล่าสุด</th><th>ระดับ KPI</th><th>ความก้าวหน้าล่าสุด</th></tr></thead><tbody id="kpiRows"></tbody></table></div></article>
    </section>
    <section id="calendarTab" class="tab-pane">
        <div class="tab-title"><div><h2>▧ ปฏิทินเฝ้าระวัง KPI (Warning Calendar)</h2><p>แสดงงานที่ใช้เวลาเกิน 50%, 75% หรือเกินกำหนด โดยไม่นับรายการที่เบิกจ่ายสมบูรณ์แล้ว</p></div><select id="warningFilter"><option value="">แสดงรายการทั้งหมด</option><option value="1">ระดับ 1 (&gt;50%)</option><option value="2">ระดับ 2 (&gt;75%)</option><option value="3">เกิน KPI (&gt;100%)</option></select></div>
        <div class="warning-legend"><span class="warning-dot level-one"></span> ระดับ 1 (&gt;50%) <span class="warning-dot level-two"></span> ระดับ 2 (&gt;75%) <span class="warning-dot overdue"></span> เกิน KPI (&gt;100%)</div>
        <div id="warningCards" class="warning-grid"></div>
    </section>
    <section id="personalTab" class="tab-pane">
        <div class="tab-title"><div><h2>♧ รายงานส่วนบุคคล</h2><p>ภาพรวมภาระงานและ KPI แยกตามเจ้าหน้าที่</p></div><select id="personalOwnerFilter"><option value="">เลือกเจ้าหน้าที่</option></select></div>
        <div id="personalSummary" class="metric-grid compact-metrics"></div>
        <article class="panel"><div class="table-scroll detail-table"><table><thead><tr><th>เลข PR</th><th>รายการ</th><th>ประเภท</th><th>ขั้นตอนล่าสุด</th><th>ระดับปัญหา</th><th>กำหนดแล้วเสร็จ</th></tr></thead><tbody id="personalRows"></tbody></table></div></article>
    </section>
</main>
<div id="loading" class="loading"><div class="spinner"></div><span>กำลังโหลดข้อมูล...</span></div>
<script src="../js/ProcurementProgressDashboard.js?v=20261119"></script>
</body></html>
