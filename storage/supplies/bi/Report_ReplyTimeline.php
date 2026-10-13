<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<title>Timeline Demo</title>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css">
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"></script>

<style>
body {
    background:#f5f6fa;
    font-family: 'Sarabun', sans-serif;
}

/* ===== TABLE ===== */
.table-custom {
    background:#fff;
}

/* ===== TIMELINE ===== */
.timeline {
    position: relative;
    padding-left: 40px;
}

.timeline::before {
    content: '';
    position: absolute;
    left: 18px;
    top: 0;
    width: 4px;
    height: 100%;
    background: #dee2e6;
}

.timeline-item {
    position: relative;
    margin-bottom: 25px;
}

.timeline-dot {
    position: absolute;
    left: -2px;
    width: 20px;
    height: 20px;
    background: #adb5bd;
    border-radius: 50%;
}

.timeline-item.active .timeline-dot {
    background: #28a745;
}

.timeline-item.current .timeline-dot {
    background: #ffc107;
}

.timeline-content {
    background: #fff;
    padding: 10px 15px;
    border-radius: 6px;
    border:1px solid #dee2e6;
}

</style>
</head>

<body class="p-4">

<div class="container">

<h4 class="mb-3">Demo Checklist + Timeline</h4>

<table class="table table-bordered table-custom">
    <thead class="thead-dark">
        <tr>
            <th>#</th>
            <th>PR Code</th>
            <th>ชื่อเรื่อง</th>
            <th>สถานะ</th>
            <th>Timeline</th>
        </tr>
    </thead>
    <tbody id="tableBody"></tbody>
</table>

</div>

<!-- Timeline Modal -->
<div class="modal fade" id="timelineModal">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header bg-info text-white">
                <h5 class="modal-title">Timeline การดำเนินงาน</h5>
                <button class="close text-white" data-dismiss="modal">&times;</button>
            </div>
            <div class="modal-body" id="timelineBody">
                Loading...
            </div>
        </div>
    </div>
</div>

<script>

/* ================= MOCK DATA ================= */

const mockTableData = [
    {
        id: 1,
        c_code: "PR-001",
        c_name: "จัดซื้อยา",
        status: "กำลังดำเนินการ"
    },
    {
        id: 2,
        c_code: "PR-002",
        c_name: "จัดซื้ออุปกรณ์",
        status: "รอดำเนินการ"
    }
];

/* ===== MOCK TIMELINE JSON ===== */
const mockTimeline = {
    1: [
        { step: "ธุรการ", date: "2026-03-01" },
        { step: "งบประมาณ", date: "2026-03-02" },
        { step: "หัวหน้าเจ้าหน้าที่พัสดุ", date: "2026-03-03" }
    ],
    2: [
        { step: "ธุรการ", date: "2026-03-05" }
    ]
};

/* ================= LOAD TABLE ================= */

function loadTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    mockTableData.forEach((item, i) => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${i+1}</td>
            <td>${item.c_code}</td>
            <td>${item.c_name}</td>
            <td>${item.status}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-primary"
                    onclick="showTimeline(${item.id})">
                    ดู Timeline
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

/* ================= TIMELINE ================= */

function showTimeline(id) {

    $('#timelineModal').modal('show');

    const steps = [
        { key: "ธุรการ", label: "1. ธุรการรับเรื่อง" },
        { key: "งบประมาณ", label: "2. งบประมาณ" },
        { key: "หัวหน้าเจ้าหน้าที่พัสดุ", label: "3. หัวหน้าเจ้าหน้าที่พัสดุ" },
        { key: "หัวหน้าสายงาน", label: "4. หัวหน้าสายงาน" },
        { key: "ตรวจสอบพัสดุ", label: "5. เจ้าหน้าที่ตรวจสอบพัสดุ" }
    ];

    const data = mockTimeline[id] || [];

    let html = '<div class="timeline">';

    let currentStepIndex = data.length; // step ล่าสุด

    steps.forEach((step, index) => {

        const found = data.find(d => d.step === step.key);

        let statusClass = '';
        if (found) statusClass = 'active';
        if (index === currentStepIndex) statusClass = 'current';

        html += `
            <div class="timeline-item ${statusClass}">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <strong>${step.label}</strong><br>
                    ${
                        found
                        ? `<span class="text-success">✔ ดำเนินการแล้ว</span>
                           <br><small>${found.date}</small>`
                        : `<span class="text-muted">ยังไม่ดำเนินการ</span>`
                    }
                </div>
            </div>
        `;
    });

    html += '</div>';

    document.getElementById('timelineBody').innerHTML = html;
}

/* ================= INIT ================= */

loadTable();

</script>

</body>
</html>