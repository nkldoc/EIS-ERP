<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Image Pagination</title>
        <style>
            /* ตั้งค่าฟอนต์และพื้นหลังภาพรวม */
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f8f9fa;
                margin: 0;
                padding: 40px 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                min-height: 100vh;
                box-sizing: border-box;
            }

            /* Container ครอบรูปภาพ */
            #image-container {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100%;
                max-width: 1000px; /* ปรับขนาดความกว้างสูงสุดให้ดูพอดีสายตา */
                margin-bottom: 25px;
            }

            /* สไตล์ของรูปภาพ */
            img {
                width: 100%;
                max-width: 1000px;
                height: auto;
                max-height: 600px; /* จำกัดความสูงไม่ให้ล้นหน้าจอ */
                object-fit: cover;
                border-radius: 12px; /* เพิ่มความโค้งมนให้ดูละมุนขึ้น */
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08); /* เพิ่มเงามิตินุ่มๆ */
                transition: transform 0.3s ease;
            }

            /* ส่วนควบคุม Pagination */
            .pagination {
                display: flex;
                align-items: center;
                gap: 15px;
                background: #ffffff;
                padding: 10px 20px;
                border-radius: 30px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            }

            /* สไตล์ปุ่มกด */
            button {
                background: linear-gradient(135deg, #4f46e5, #3b82f6);
                color: white;
                border: none;
                padding: 10px 22px;
                font-size: 14px;
                font-weight: 600;
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.2s ease;
                outline: none;
            }

            /* เอฟเฟกต์ตอนเอาเมาส์ไปชี้ปุ่ม */
            button:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4);
                opacity: 0.95;
            }

            /* เอฟเฟกต์ตอนกดปุ่ม */
            button:active {
                transform: translateY(0);
            }

            /* ข้อความบอกตำแหน่งหน้า */
            #page-info {
                font-size: 15px;
                color: #4b5563;
                font-weight: 500;
                min-width: 100px;
                text-align: center;
            }
        </style>
    </head>
    <body>

        <div id="image-container"></div>

        <div class="pagination">
            <button onclick="prevPage()">ย้อนกลับ</button>
            <span id="page-info"></span>
            <button onclick="nextPage()">หน้าถัดไป</button>
        </div>

        <script>
            const images = [
                './imgs/confirmAcc/11.png',
                './imgs/confirmAcc/12.png',
                './imgs/confirmAcc/13.png',
                './imgs/confirmAcc/14.png',
                        //            './imgs/step2.jpg',D:\ERP\eis_procure\src\main\webapp\sp\tutorial\imgs\confirmAcc\11.png
                        //            './imgs/step3.jpg'
            ];
            const imagesPerPage = 1;
            let currentPage = 1;

            function displayImages() {
                const start = (currentPage - 1) * imagesPerPage;
                const end = start + imagesPerPage;
                const displayedImages = images.slice(start, end);

                const container = document.getElementById('image-container');
                container.innerHTML = '';
                displayedImages.forEach(src => {
                    const img = document.createElement('img');
                    img.src = src;
                    container.appendChild(img);
                });

                document.getElementById('page-info').textContent = `หน้า ${currentPage} จาก ${Math.ceil(images.length / imagesPerPage)}`;
            }

            function nextPage() {
                if (currentPage < Math.ceil(images.length / imagesPerPage)) {
                    currentPage++;
                    displayImages();
                }
            }

            function prevPage() {
                if (currentPage > 1) {
                    currentPage--;
                    displayImages();
                }
            }
            displayImages();
        </script>
    </body>
</html>