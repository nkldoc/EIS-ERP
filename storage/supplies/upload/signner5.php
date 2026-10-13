<?PHP
require_once("../conf/config.php");
//print_r($_REQUEST);
?>
<!DOCTYPE html>
<html lang="th">
    <head>
        <meta charset="UTF-8">
        <title>รวมไฟล์ PDF</title>
    </head>
    <body style="color: rgb(102, 102, 102); font: normal 12px 'Mitr', sans-serif;">
        <form action="/supplies/signner5" method="post" enctype="multipart/form-data" onsubmit="return validateSignForm();"> 
            <!--
            
            
            
            foldername : "D:xxxx/2022/prss/"
            filename :filename.pdf
            showPages : 1, 2,3,4
            docIdParam : 3
            previewSig : true
            poitionX : 65
            poitionY :100
            -->
            <input type="hidden" name="foldername" id="foldernameID" placeholder="ชื่อโฟลเดอร์">
            <input type="hidden" name="filename" id="filenameID" placeholder="ชื่อไฟล์">
            <input type="hidden" name="showPages"  placeholder="1,2" id="showPagesID"> <!-- หน้าใส่ลายเซ็น -->
            <input type="hidden" name="docIdParam" id="docIdParamID"> <!-- หน้าใส่ลายเซ็น -->
 
            <div class="x-form-check-wrap" id="ext-gen1035" style="width: 230px;">
                <input type="checkbox" autocomplete="off" id="previewSigID" name="previewSig" class=" x-form-checkbox x-form-field" value="true" checked=true>
                <label for="previewSigID" class="x-form-cb-label" id="ext-gen1036">แสดง(ตัวอย่าง)ลายเซ็นต์</label></div>
                <!--90-->
            <label for="poitionX">ตำแหน่งลายเซนต์บนล่าง (อยู่ระหว่ง 25 ถึง 500): </label>
            <input type="number" id="poitionX" name="poitionX" value="65" min="25" max="500"><br>
            <label for="poitionY">ตำแหน่งลายเซนต์ ซ้ายขวา (อยู่ระหว่ง 40 ถึง 230):</label>
            <input type="number" id="poitionY" name="poitionY" value="90" min="30" max="230"><br>
            <button type="submit">ลงลายเซนต์</button>
        </fieldset>
    </form>
    <button style="margin-top:10px;" onclick="addTabPreviewPDF()">ดูไฟล์เอกสาร PDF </button>
    <script type="text/javascript">
        function validateSignForm() { 
             window.parent.Ext.getCmp("tabMainID").getEl().mask("Please wait...", "x-mask-loading");
//             
//            return false;
            var showPages = document.getElementById("showPagesID").value.trim();

            if (!showPages) {
                alert("กรุณาระบุหน้าที่ต้องการลงนาม เช่น 1 หรือ 1,2");
                document.getElementById("showPagesID").focus();
                return false; // ป้องกันไม่ให้ฟอร์มส่ง
            }

            return true; // ผ่านการตรวจสอบ ส่งฟอร์มได้
        }
    </script>

</body>
</html>
