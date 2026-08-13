<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>กำลังโหลดระบบใหม่...</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Sarabun', Arial, sans-serif;
            background: #f0f4f8;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
        }
        .card {
            background: #fff;
            border-radius: 16px;
            padding: 40px 50px;
            text-align: center;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
            max-width: 420px;
            width: 90%;
        }
        .spinner {
            width: 56px;
            height: 56px;
            border: 5px solid #e0e7ef;
            border-top-color: #1a4f8b;
            border-radius: 50%;
            animation: spin 0.9s linear infinite;
            margin: 0 auto 24px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        h2 { font-size: 20px; color: #1a4f8b; margin-bottom: 8px; font-weight: 600; }
        p  { font-size: 14px; color: #666; margin-bottom: 24px; line-height: 1.6; }
        .countdown-box { background: #f0f4f8; border-radius: 10px; padding: 14px 20px; margin-bottom: 20px; }
        .countdown-box span { font-size: 13px; color: #555; }
        .countdown-box b { font-size: 28px; color: #1a4f8b; display: block; margin-top: 4px; }
        .progress-bar-wrap { background: #e0e7ef; border-radius: 8px; height: 8px; overflow: hidden; margin-bottom: 20px; }
        .progress-bar { height: 100%; background: #1a4f8b; border-radius: 8px; width: 100%; transition: width 1s linear; }
        .btn { display: inline-block; background: #1a4f8b; color: #fff; border: none; border-radius: 8px; padding: 10px 28px; font-size: 14px; cursor: pointer; text-decoration: none; }
        .btn:hover { background: #143d6e; }
    </style>
</head>
<body>
    <div class="card">
        <div class="spinner"></div>
        <h2>กำลังโหลดระบบใหม่</h2>
        <p>เกิดข้อผิดพลาดชั่วคราว (HTTP 500)<br>ระบบจะพากลับไปยังหน้าหลักโดยอัตโนมัติ</p>
        <div class="countdown-box">
            <span>กลับไปหน้าหลักในอีก</span>
            <b id="cd">10</b>
        </div>
        <div class="progress-bar-wrap">s
            <div class="progress-bar" id="bar"></div>
        </div>
        <a class="btn" href="https://dev.vajira.ac.th/NMU_permission/entrance">กลับทันที</a>
    </div>
    <script>
        var REDIRECT_URL = "https://dev.vajira.ac.th/NMU_permission/entrance";
        var total = 10, remain = total;
        var bar = document.getElementById("bar");
        var cd  = document.getElementById("cd");
        var timer = setInterval(function() {
            remain--;
            cd.textContent = remain;
            bar.style.width = (remain / total * 100) + "%";
            if (remain <= 0) {
                clearInterval(timer);
                try { window.top.location.replace(REDIRECT_URL); } catch(e) { window.location.replace(REDIRECT_URL); }
            }
        }, 1000);
    </script>
</body>
</html>
