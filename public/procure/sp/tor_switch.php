<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Switch JS Files</title> 
      <script type="text/javascript" src="../js/funcAll.js<?= $random; ?>"></script>
</head>
<body>

    <div id="main">Default Content</div>
    <button onclick="loadScript('scripts/script1.js')">Load Script 1</button>
    <button onclick="loadScript('scripts/script2.js')">Load Script 2</button>
    <button onclick="loadScript('scripts/script3.js')">Load Script 3</button>
 

</body>
</html>
