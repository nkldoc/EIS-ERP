<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Image Pagination</title>
    <style>
        #image-container {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: center;
        }
        img {
            width: 1200px;
            height: 450px;
            object-fit: cover;
            border-radius: 5px;
        }
        .pagination {
            margin-top: 20px;
            text-align: center;
        }
        button {
            padding: 10px;
            margin: 5px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div id="image-container"></div>
    <div class="pagination">
        <button onclick="prevPage()">Previous</button>
        <span id="page-info"></span>
        <button onclick="nextPage()">Next</button>
    </div> 
    <script>
        const images = [
            '../../images/tor/step1.png',
            '../../images/tor/step2.png',
            '../../images/tor/step3.png' 
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
            
            document.getElementById('page-info').textContent = `Page ${currentPage} of ${Math.ceil(images.length / imagesPerPage)}`;
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
