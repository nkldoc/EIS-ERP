<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8"/>
  <title>Pivot X/Y Demo – จัดซื้อ</title>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <!-- Chart.js CDN -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body{font-family:system-ui,Segoe UI,Arial; margin:24px;}
    .row{display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin:12px 0;}
    label{font-size:14px; color:#444}
    select,button{padding:6px 10px; font-size:14px}
    .hint{color:#666; font-size:12px}
  </style>
</head>
<body>
  <h2>Pivot/สลับแกน X–Y จาก JSON (จัดซื้อ)</h2>

  <div class="row">
    <label>แกน X:
      <select id="xKey">
        <option value="ประเภทจัดซื้อ">ประเภทจัดซื้อ</option>
        <option value="ประเภทสินค้า">ประเภทสินค้า</option>
      </select>
    </label>

    <label>Metric (แกน Y):
      <select id="yMetric">
        <option value="จำนวนครั้ง">จำนวนครั้ง</option>
        <option value="ระยะเวลา">ระยะเวลา</option>
      </select>
    </label>

    <label>Aggregate:
      <select id="agg">
        <option value="sum">sum</option>
        <option value="avg">avg</option>
        <option value="count">count</option>
      </select>
    </label>

    <button id="swap">สลับแกน (X ↔ Y)</button>
    <button id="refresh">อัปเดตกราฟ</button>
  </div>
  <div class="hint">Tip: ลอง X=ประเภทสินค้า, Metric=ระยะเวลา, Aggregate=avg เพื่อดูระยะเวลาเฉลี่ยต่อประเภทสินค้า</div>

  <canvas id="chart" height="120"></canvas>

  <script>
    // ---------- 1) ข้อมูลตัวอย่าง ----------
    const raw = [
      { "ประเภทจัดซื้อ": "วิทยาศาสตร์", "ประเภทสินค้า": "เครื่องมือแพทย์",   "ระยะเวลา": 15, "จำนวนครั้ง": 12 },
      { "ประเภทจัดซื้อ": "วิทยาศาสตร์", "ประเภทสินค้า": "สารเคมี",         "ระยะเวลา": 10, "จำนวนครั้ง":  8 },
      { "ประเภทจัดซื้อ": "ไอที",         "ประเภทสินค้า": "คอมพิวเตอร์",      "ระยะเวลา": 25, "จำนวนครั้ง":  5 },
      { "ประเภทจัดซื้อ": "ไอที",         "ประเภทสินค้า": "ซอฟต์แวร์",        "ระยะเวลา": 20, "จำนวนครั้ง":  7 },
      { "ประเภทจัดซื้อ": "ทั่วไป",       "ประเภทสินค้า": "อุปกรณ์สำนักงาน",  "ระยะเวลา": 12, "จำนวนครั้ง": 15 }
    ];

    // ---------- 2) Utility ----------
    const isNumber = v => typeof v === 'number' && Number.isFinite(v);

    // group & aggregate: {label -> [values]} -> reduce by agg
    function aggregate(values, agg) {
      if (agg === 'count') return values.length;
      const nums = values.filter(isNumber);
      if (nums.length === 0) return 0;
      const sum = nums.reduce((a,b)=>a+b,0);
      if (agg === 'sum') return sum;
      if (agg === 'avg') return sum / nums.length;
      return sum; // default
    }

    // ---------- 3) Pivot หลัก ----------
    // pivot1D: group ตาม xKey แล้วรวม metric ตาม agg -> {labels:[], data:[]}
    function pivot1D(rows, xKey, metric, agg='sum') {
      const bucket = new Map();
      for (const r of rows) {
        const key = String(r[xKey]);
        const val = r[metric];
        if (!bucket.has(key)) bucket.set(key, []);
        bucket.get(key).push(val);
      }
      const labels = [...bucket.keys()];
      const data = labels.map(lb => aggregate(bucket.get(lb), agg));
      return { labels, data };
    }

    // pivotSwap: (สลับแกน) -> X ใหม่ = metric เป็นหมวด (เดี่ยว) และ Y เป็นค่ากลุ่มตามเดิม
    // ในบริบทกราฟ 1 ซีรีส์ การ “สลับแกน” ที่เข้าใจง่ายคือ:
    //   X ใหม่ = ค่าเดิมของ labels (ไม่เปลี่ยน), แกน Y ใช้ metric อื่น/agg อื่น
    //   (ถ้าต้องการสลับแบบ matrix จริง ๆ ให้ขยายเป็นหลายซีรีส์ – ดูคอมเมนต์เพิ่มท้ายไฟล์)
    function pivotSwap(rows, currentX, currentMetric, agg='sum') {
      // สลับ metric -> ถ้าเดิมเป็น 'จำนวนครั้ง' ให้ไป 'ระยะเวลา' และกลับกัน
      const metrics = ['จำนวนครั้ง','ระยะเวลา'];
      const nextMetric = metrics.find(m => m !== currentMetric) || currentMetric;
      return pivot1D(rows, currentX, nextMetric, agg);
    }

    // ---------- 4) Chart.js ----------
    let chart;
    function renderChart(labels, data, title='') {
      const ctx = document.getElementById('chart');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: title,
            data,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true }
          },
          plugins: {
            tooltip: { mode: 'index', intersect: false },
            legend: { display: true }
          }
        }
      });
    }

    // ---------- 5) Wiring UI ----------
    const $xKey    = document.getElementById('xKey');
    const $yMetric = document.getElementById('yMetric');
    const $agg     = document.getElementById('agg');
    const $swap    = document.getElementById('swap');
    const $refresh = document.getElementById('refresh');

    function refresh() {
      const xKey    = $xKey.value;
      const yMetric = $yMetric.value;
      const agg     = $agg.value;
      const { labels, data } = pivot1D(raw, xKey, yMetric, agg);
      renderChart(labels, data, `${yMetric} (${agg}) by ${xKey}`);
    }

    $refresh.addEventListener('click', refresh);

    $swap.addEventListener('click', () => {
      const xKey    = $xKey.value;
      const yMetric = $yMetric.value;
      const agg     = $agg.value;
      const { labels, data } = pivotSwap(raw, xKey, yMetric, agg);
      // เมื่อสลับ metric แล้ว ให้อัปเดต select ให้ตรง
      $yMetric.value = ($yMetric.value === 'จำนวนครั้ง') ? 'ระยะเวลา' : 'จำนวนครั้ง';
      renderChart(labels, data, `${$yMetric.value} (${agg}) by ${xKey}`);
    });

    // first render
    refresh();

    // ---------- (หมายเหตุสำหรับกรณีหลายซีรีส์ / CrossTab)
    // ถ้าต้องการ Matrix: X=ประเภทสินค้า, Series=ประเภทจัดซื้อ, Metric=ระยะเวลา/จำนวนครั้ง
    // ให้สร้างโครงสร้าง: labels = all X, datasets = per seriesKey
    // จากนั้น loop สร้างค่า per (seriesKey, xLabel) ด้วย aggregate(...)
    // แล้วส่ง datasets ให้ Chart.js เป็น stacked/multi-series bar ได้เลย
  </script>
</body>
</html>
