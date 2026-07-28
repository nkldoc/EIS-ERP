<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>Live Camera</title>
</head>
<body>
  <h2>เปิดกล้อง</h2>

  <video id="video" width="320" height="240" autoplay></video><br>
  <button id="capture">📷 ถ่ายภาพ</button><br><br>
  <canvas id="canvas" width="320" height="240" style="border:1px solid #ccc;"></canvas>

  <script>
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    // ขอสิทธิ์เปิดกล้อง
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        video.srcObject = stream;
      })
      .catch(err => {
        console.error("ไม่สามารถเปิดกล้องได้:", err);
      });

    document.getElementById('capture').addEventListener('click', () => {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
    });
  </script>
</body>
</html>
