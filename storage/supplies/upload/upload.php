<?PHP require_once("../conf/config.php");
?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>Upload Progress</title>
        <link href="../js/ext-3.4.0/resources/css/ext-all.css" rel="stylesheet" type="text/css" />
        <script type="text/javascript" src="../js/jquery.js"></script>
        <script type="text/javascript" src="../js/ext-3.4.0/adapter/jquery/ext-jquery-adapter.js"></script>
        <script type="text/javascript" src="../js/ext-3.4.0/ext-all.js"></script>

    </head>
    <body>
        <h2 style="padding-top:50px;">อัพโหลดไฟล์เอกสารที่จะนำเสนอขอลงนาม</h2>
        <input type="file" id="fileInput"><br><br>
        <button onclick="uploadFile()">Upload</button>
        <progress id="progressBar" value="0" max="100"></progress>
        <p id="status"></p>
        <button style="margin-top:10px;" onclick="addTabPreviewPDF()">ดูไฟล์เอกสาร PDF </button>
        <button style="float:left;padding-left:10px; margin-top:10px;" onclick="activeTabPreviewPDF(2)">กำหนดหน้าที่จะลงนาม</button>

        <script type="text/javascript">

            function activeTabPreviewPDF(n) {
                var tabPanel = window.parent.Ext.getCmp('tabMainID');
                tabPanel.setActiveTab(n);
            }
            function addTabPreviewPDF() {
                const pr = window.parent.document.getElementById("sp_tor_idID_Name")?.value?.trim();
                const file = document.getElementById("fileInput").files[0];
                const fileName = file.name;
                const tabPanel = window.parent.Ext.getCmp('tabMainID');
                const contenterCenter = window.parent.Ext.getCmp('contenterCenter');
                const newTab = contenterCenter.add({
                    title: "ไฟล์เอกสารที่จะทำบันทึกลงนาม",
                    layout: "form",
                    iconCls: "icon-pdf",
                    defaults: {width: 230},
                    defaultType: "textfield",
                    disabled: false,
                    autoScroll: true,
                    html: '<iframe id="pdfcanvasID" src="../upload/preview.php?__dc=' +
                            Math.floor(Math.random() * 100) +
                            '&pr=' +
                            encodeURIComponent(pr) +
                            '&filename=' +
                            encodeURIComponent(fileName) +
                            '" frameborder="0" width="100%" height="100%"></iframe>',
                    closable: true
                });

                contenterCenter.setActiveTab(newTab);
            }
            function uploadFile() {
                const pr = window.parent.document.getElementById("sp_tor_idID_Name")?.value?.trim();
                const document_id = window.parent.document.getElementById("document_idID")?.value?.trim();
                const previewSig = window.parent.document.getElementById("previewSigID")?.value?.trim();
                const file = document.getElementById("fileInput").files[0];

                if (!pr || pr == '' || pr == 'เลขที่ PR' || !file || file == '') {
                    alert("ยังไม่เลือก รายการ PR อ้างอิง หรือ ไฟล์เอกสาร ว่าง , undefined or null");
                    window.parent.document.getElementById("sp_tor_idID_Name").focus();
                    return false;
                }
                const formData = new FormData();
                formData.append("myfile", file);
                formData.append("mypr", pr);
                formData.append("document_id", document_id);
                formData.append("previewSig", previewSig);

                const xhr = new XMLHttpRequest();

                xhr.upload.addEventListener("progress", function (e) {
                    if (e.lengthComputable) {
                        const percent = (e.loaded / e.total) * 100;
                        document.getElementById("progressBar").value = percent;
                        document.getElementById("status").innerText = Math.round(percent) + "% uploaded...";
                    }
                });
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        const res = JSON.parse(xhr.responseText);
                        console.log(res);

                        if (res.success === false) {
                            alert(res.message);
                        } else {
//                            alert(res.message); 
                            var tabPanel = window.parent.Ext.getCmp('tabMainID');
                            // ตรวจว่ามี tab index 2 แล้วหรือยัง
                            var tabBarItem = tabPanel.items.get(2);
                            if (tabBarItem && tabBarItem.disabled) {
                                tabBarItem.enable();
                            }
                            window.parent.Ext.getCmp('foldernameID').setValue(pr);
                            window.parent.Ext.getCmp('filenameID').setValue(file.name);
                           
//                            addTabPreviewPDF();
                        }
                    }
                }; 
                xhr.open("POST", "uploadFile.php");
                xhr.send(formData);
            }
           
            /* Ext.onReady(function () {
             Ext.QuickTips.init();  
             Ext.Msg.alert('Error', 'Failed to load config.json',function(){ 
             }); 
             });*/
        </script>


</html>
