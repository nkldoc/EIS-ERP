<html lang="en">
    <head>
        <link rel="stylesheet" href="style.css">
        <title>Files Upload and Download s</title>
    </head>
    <body>
        <div class="container">
            <div class="row">
                <form action="./FileUploadServlet" method="post" enctype="multipart/form-data" >
                    <h3>Upload File</h3>
                    <input type="file" name="myfile"> <br>
                    <button type="submit" name="save">upload</button>
                </form>
            </div>
        </div>
    </body>
</html>
 