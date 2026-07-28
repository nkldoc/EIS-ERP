<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Sign Grid — สร้างลายเซ็นบน PDF</title>
  <style>
    :root { --bg:#0f172a; --card:#111827; --muted:#94a3b8; --text:#e5e7eb; --accent:#22c55e; --danger:#ef4444; }
    html,body{margin:0;padding:0;background:var(--bg);color:var(--text);font-family:system-ui,Segoe UI,Roboto,TH Sarabun New,sans-serif;}
    .wrap{max-width:960px;margin:40px auto;padding:0 16px;}
    .card{background:var(--card);border:1px solid #1f2937;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.35);}
    .header{padding:20px 24px;border-bottom:1px solid #1f2937;font-size:20px;font-weight:700;}
    .body{padding:24px;}
    form{display:grid;gap:14px;grid-template-columns:1fr 1fr;}
    .full{grid-column:1/-1}
    label{display:block;font-size:13px;color:var(--muted);margin-bottom:6px}
    input{width:100%;padding:10px 12px;border-radius:12px;border:1px solid #374151;background:#0b1220;color:var(--text);outline:none}
    input:focus{border-color:#60a5fa;box-shadow:0 0 0 3px rgba(96,165,250,.2)}
    .row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
    .btns{margin-top:12px;display:flex;gap:10px;align-items:center}
    button{background:#2563eb;border:none;color:#fff;padding:10px 16px;border-radius:12px;cursor:pointer;font-weight:600}
    button[disabled]{opacity:.6;cursor:not-allowed}
    .muted{color:var(--muted);font-size:13px}
    .ok{color:var(--accent);font-weight:700}
    .err{color:var(--danger);white-space:pre-wrap}
    .links a{display:inline-block;margin-right:12px;margin-top:8px;color:#38bdf8;text-decoration:none}
    .links a:hover{text-decoration:underline}
    .hint{font-size:12px;color:#93c5fd;margin-top:4px}
    .footer{padding:16px 24px;border-top:1px solid #1f2937;color:#64748b;font-size:12px}
    .kbd{font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;background:#0b1220;border:1px solid #1f2937;border-radius:6px;padding:0 6px}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="header">สร้างลายเซ็นทับ PDF & คืนลิงก์เปิดดู</div>
      <div class="body">
        <form id="form">
          <div class="full">
            <label>Step ลงนาม id user <span class="hint">เช่น <span class="kbd"> 1 => 60047 2=> 40050 3 => 30047 4=> 60630 5-> 60520 </span></span></label>
            <label>Input PDF Path (ไฟล์ต้นฉบับ) <span class="hint">เช่น <span class="kbd">D:/Documents/Sys/2025/procure/supplies/PR25651100032/output/3_สัญญาซื้ออะไหล่ประกอบเครื่องมือ.pdf</span></span></label>
            <input required name="inputPath" id="inputPath" placeholder="พาธไฟล์ PDF ต้นฉบับบนเซิร์ฟเวอร์" />
          </div>

          <div>
            <label>sp_tor_id</label>
            <input required name="sp_tor_id" id="sp_tor_id" type="number" placeholder="เช่น 388" />
          </div>
          <div>
            <label>sign_id</label>
            <input required name="sign_id" id="sign_id" type="number" placeholder="เช่น 60520" />
          </div>
          <div>
            <label>sign_step</label>
            <input required name="sign_step" id="sign_step" type="number" placeholder="เช่น 5" />
          </div>

          <div>
            <label>outputName (ตัวอย่าง: 5_สัญญา.pdf)</label>
            <input name="outputName" id="outputName" placeholder="ชื่อไฟล์ผลลัพธ์ (ไม่ใส่ก็ได้)" />
          </div>
          <div class="full">
            <label>signatureDir (ตำแหน่งไฟล์รูปเซ็น) <span class="hint">เช่น <span class="kbd">D:/Documents/Sys/imgs</span> (ภายในมี <span class="kbd">signature{step}.png</span>)</span></label>
            <input name="signatureDir" id="signatureDir" placeholder="ปล่อยว่างได้ถ้าใช้ค่าเริ่มต้นในเซิร์ฟเวอร์" />
          </div>

          <div class="full btns">
            <button id="runBtn" type="submit">สร้าง PDF</button>
            <span id="status" class="muted">พร้อมทำงาน</span>
          </div>
        </form>

        <div id="result" class="full" style="margin-top:10px">
          <div id="msg" class="muted"></div>
          <div class="links" id="links"></div>
          <div id="error" class="err"></div>
        </div>
      </div>
      <div class="footer">
        เคล็ดลัด: กด <span class="kbd">Ctrl</span> + <span class="kbd">Enter</span> เพื่อสั่งรันเร็ว • ค่าในฟอร์มถูกจำไว้ในเครื่องคุณ (localStorage)
      </div>
    </div>
  </div>

  <script>
    const $ = (s)=>document.querySelector(s);
    const form = $('#form');
    const statusEl = $('#status');
    const runBtn = $('#runBtn');
    const msgEl = $('#msg');
    const linksEl = $('#links');
    const errEl = $('#error');

    // โหลดค่าที่เคยกรอก
    const fields = ['inputPath','sp_tor_id','sign_id','sign_step','outputName','signatureDir'];
    (function loadLocal(){
      fields.forEach(f=>{
        const v = localStorage.getItem('signgrid_'+f);
        if(v) document.getElementById(f).value = v;
      });
    })();

    // บันทึกค่าทุกครั้งที่พิมพ์
    form.addEventListener('input', (e)=>{
      if(fields.includes(e.target.name)){
        localStorage.setItem('signgrid_'+e.target.name, e.target.value);
      }
    });

    // Ctrl+Enter quick run
    document.addEventListener('keydown', (e)=>{
      if((e.ctrlKey || e.metaKey) && e.key === 'Enter'){
        form.requestSubmit();
      }
    });

    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      errEl.textContent = '';
      linksEl.innerHTML = '';
      msgEl.textContent = '';
      setBusy(true, 'กำลังประมวลผล…');

      try{
        // เตรียม URL + query (เราใช้ GET เพื่อให้ดาวน์โหลด/รับ blob ได้สะดวก)
        const params = new URLSearchParams(new FormData(form));
        const url = '/supplies/sign-grid?' + params.toString();

        // เรียก servlet รับไฟล์เป็น Blob
        const res = await fetch(url, { method: 'GET' });
        const ok = res.ok;

        // บางกรณี error ฝั่ง server จะส่ง text/plain
        const contentType = res.headers.get('Content-Type') || '';
        if(!ok){
          const txt = await res.text();
          throw new Error(txt || ('HTTP '+res.status+' '+res.statusText));
        }

        // รับเป็น Blob (PDF)
        const blob = await res.blob();
        if(!contentType.includes('pdf') && blob.type && !blob.type.includes('pdf')){
          // ยังไงก็ลองเปิดเป็นไฟล์ ถ้าไม่ใช่ pdf ก็จะแจ้งต่อ
          console.warn('Content-Type ไม่ใช่ PDF แต่จะลองเปิดเป็นไฟล์ที่ได้มา');
        }

        // สร้าง object URL และลิงก์ใช้งาน
        const objectUrl = URL.createObjectURL(blob);

        // ชื่อไฟล์จากพารามิเตอร์ (Fallback)
        const outName = ($('#outputName').value || 'signed.pdf').trim();

        msgEl.innerHTML = '<span class="ok">✔ สำเร็จ</span> สร้างไฟล์ PDF เรียบร้อย';
        linksEl.innerHTML = `
          <a href="${objectUrl}" target="_blank" rel="noopener">เปิดดู PDF (แท็บใหม่)</a>
          <a href="${objectUrl}" download="${escapeFileName(outName)}">ดาวน์โหลด PDF</a>
        `;

        setBusy(false, 'พร้อมทำงาน');
      }catch(err){
        console.error(err);
        setBusy(false, 'เกิดข้อผิดพลาด');
        errEl.textContent = String(err?.message || err);
        msgEl.textContent = '';
      }
    });

    function setBusy(b, text){
      runBtn.disabled = b;
      statusEl.textContent = text || (b ? 'กำลังทำงาน…' : 'พร้อมทำงาน');
    }

    function escapeFileName(name){
      return name.replace(/[\r\n"]/g,' ').trim() || 'signed.pdf';
    }
  </script>
</body>
</html>
