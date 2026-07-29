<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Animated Timeline with Popup</title>
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      background: #f8f9fa;
      padding:20px 20px;
    }

    /* .timeline-container {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: nowrap;
    } */
.timeline-container {
  display: flex;
  flex-direction: column; /* เปลี่ยนจากแนวนอนเป็นแนวตั้ง */
  justify-content: center;
  align-items: center;
  
}
.step-container {
  margin: 20px 0; /* เปลี่ยนจาก margin ซ้ายขวา เป็น บนล่าง */
}

    .step-container:nth-child(1) { animation-delay: 0s; }
    .step-container:nth-child(2) { animation-delay: 0.2s; }
    .step-container:nth-child(3) { animation-delay: 0.4s; }
    .step-container:nth-child(4) { animation-delay: 0.6s; }
    .step-container:nth-child(5) { animation-delay: 0.8s; }

    .step {
      background-color: #4285f4;
      color: white;
      padding: 20px 40px;
      clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%, 20px 50%);
      font-weight: bold;
      white-space: nowrap;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      cursor: pointer;
      border: none;
      transition: transform 0.3s ease;
    }

    .step:hover {
      transform: scale(1.05);
    }

 .milestone {
  margin-top: 10px;
  position: static;
  width: 160px;
  text-align: center;
  color: #666;
  font-size: 14px;
  animation: fadeInUp 1s ease forwards;
  opacity: 0;
}

 .milestone {
      top: auto;
      bottom: -100px;
      animation: fadeInDown 1s ease forwards;
    }

    .milestone::after {
      content: '';
      display: block;
      margin: 10px auto 0;
      width: 12px;
      height: 12px;
      background-color: #ffc107;
      border-radius: 50%;
      animation: bounce 1s infinite;
    }

    /* Popup style */
    .popup {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.8);
      background: white;
      padding: 30px;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      opacity: 0;
      pointer-events: none;
      transition: all 0.3s ease;
      z-index: 1000;
      width: 300px;
      text-align: center;
    }

    .popup.show {
      opacity: 1;
      pointer-events: auto;
      transform: translate(-50%, -50%) scale(1);
    }

    .popup h3 {
      margin-top: 0;
    }

    .popup button {
      margin-top: 20px;
      padding: 10px 20px;
      background: #4285f4;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }

    /* Animations */
    @keyframes slideIn {
      0% { transform: translateY(20px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }

    @keyframes fadeInUp {
      0% { transform: translateY(20px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }

    @keyframes fadeInDown {
      0% { transform: translateY(-20px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
  </style>
</head>
<body>

  <div class="timeline-container">
    <div class="step-container">
      <div class="milestone">Step 1 Info</div>
      <button class="step" onclick="showPopup('Step 1', 'รายละเอียดสำหรับ Step 1')">10 mins</button>
    </div>
        <div class="step-container">
      <div class="milestone">Step 5 Info</div>
      <button class="step" onclick="showPopup('Step 2', 'รายละเอียดสำหรับ Step 2')">10 mins</button>
    </div>
    <div class="step-container">
      <div class="milestone">Step 3 Info</div>
      <button class="step" onclick="showPopup('Step 3', 'รายละเอียดสำหรับ Step 3')">30 mins</button>
    </div>
        <div class="step-container">
      <div class="milestone">Step 5 Info</div>
      <button class="step" onclick="showPopup('Step 4', 'รายละเอียดสำหรับ Step 4')">30 mins</button>
    </div>
    <div class="step-container">
      <div class="milestone">Step 5 Info</div>
      <button class="step" onclick="showPopup('Step 5', 'รายละเอียดสำหรับ Step 5')">15 mins</button>
    </div>
  </div>

  <!-- Popup -->
  <div class="popup" id="popup">
    <h3 id="popup-title">Title</h3>
    <p id="popup-text">ข้อความ</p>
    <button onclick="hidePopup()">ปิด</button>
  </div>

  <script>
    function showPopup(title, text) {
      document.getElementById('popup-title').innerText = title;
      document.getElementById('popup-text').innerText = text;
      document.getElementById('popup').classList.add('show');
    }

    function hidePopup() {
      document.getElementById('popup').classList.remove('show');
    }
  </script>

</body>
</html>
