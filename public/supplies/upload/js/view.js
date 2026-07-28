function activeTabPreviewPDF(n) {
    var tabPanel = window.parent.Ext.getCmp('tabMainID');
    tabPanel.setActiveTab(n);
}

function afterSavePdf(cx, cy, pr, docIdParam,showPages) {
    const formData = new FormData();
    formData.append("type", "savePDF");
    formData.append("c_x", cx);
    formData.append("c_y", cy);
    formData.append("c_code", pr);
    formData.append("document_type_id", docIdParam); 
    formData.append("show_page", showPages); 
    const xhr = new XMLHttpRequest(); 
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const res = JSON.parse(xhr.responseText);
            console.log(res);

            if (res.success === false) {
                alert(res.message);
            } else {
                alert(res.message);
            }
        }
    };
    xhr.open("POST", "./sp/app/api/uploadFile.php");
    xhr.send(formData);
}

function addTabPreviewPDFOutPut() {
    const pr = window.parent.document.getElementById("foldernameID")?.value?.trim();
    const file = window.parent.document.getElementById("filenameID")?.value?.trim();
//    docIdParamID
    const showPages = document.getElementById("showPagesID")?.value?.trim();
    const docIdParam = document.getElementById("docIdParamID")?.value?.trim();
    const cx = document.getElementById("poitionX")?.value?.trim();
    const cy = document.getElementById("poitionY")?.value?.trim();
    const fileName = file;
    const tabPanel = window.parent.Ext.getCmp('tabMainID');
    const contenterCenter = window.parent.Ext.getCmp('contenterCenter');
    const newTab = contenterCenter.add({
        title: "ไฟล์เอกสารที่รอลงนาม",
        layout: "form",
        iconCls: "icon-pdf",
        defaults: {width: 230},
        defaultType: "textfield",
        disabled: false,
        autoScroll: true,
        html: '<iframe id="pdfcanvas2ID" src="../upload/preview_out1.php?__dc=' +
                Math.floor(Math.random() * 100) +
                '&pr=' +
                encodeURIComponent(pr) +
                '&filename=' +
                encodeURIComponent(fileName) +
                '" frameborder="0" width="100%" height="100%"></iframe>',
        closable: true
    });
    console.log("after pr ", pr);
    console.log("after docIdParam ", docIdParam);
    console.log("after showPages ", showPages);
    console.log("after addTab X ", cx);
    console.log(" Y", cy);

    afterSavePdf(cx, cy, pr, docIdParam,showPages);
    contenterCenter.setActiveTab(newTab);
}
addTabPreviewPDFOutPut();
 