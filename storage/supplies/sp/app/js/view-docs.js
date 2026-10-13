function activeTabPreviewPDF(n) {
    var tabPanel = window.parent.Ext.getCmp('tabMainID');
    tabPanel.setActiveTab(n);
}
function addTabPreviewPDFOutPut(c_filename, c_dir) {

    const pr = c_dir;  //document.getElementById("foldernameID")?.value?.trim();
    const file = c_filename;      //document.getElementById("filenameID")?.value?.trim();
    const fileName = file;
    const tabPanel = Ext.getCmp('tabpanel1');
    const contenterCenter = Ext.getCmp('contenterCenter');
 

    const newTab = contenterCenter.add({
        title: "ไฟล์เอกสารที่รอลงนาม",
        layout: "form",
        iconCls: "icon-pdf",
        defaults: {width: 230},
        defaultType: "textfield",
        disabled: false,
        autoScroll: true,
        tbar: [
            {
                text: 'Save to Server',
                iconCls: 'icon-save',
                handler: function () {
                    const iframe = document.getElementById("pdfcanvas2ID");
                    if (iframe && iframe.contentWindow) {
                        // ส่งคำสั่ง export ไปยัง iframe
                        iframe.contentWindow.postMessage({
                            action: "exportPDF"
                        }, "*");
                    } else {
                        alert("ไม่พบ iframe หรือโหลดยังไม่สมบูรณ์");
                    }
                }
            }
        ],
        html: '<iframe id="pdfcanvas2ID" src="../../upload/preview_out11.php?__dc=' +
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
function addTabPreviewSign(c_filename, c_dir) {

// console.log(c_filename,c_dir);
// return false;
    const pr = c_dir;  //document.getElementById("foldernameID")?.value?.trim();
    const file = c_filename;      //document.getElementById("filenameID")?.value?.trim();
    const fileName = file;
    const tabPanel = Ext.getCmp('tabpanel1');
    const contenterCenter = window.parent.Ext.getCmp('fr1ID');
    const newTab = contenterCenter.add({
        title: "ไฟล์เอกสาร PDF",
        layout: "form",
        iconCls: "icon-pdf",
        defaults: {width: 230},
        defaultType: "textfield",
        disabled: false,
        autoScroll: true,
        html: '<iframe id="pdfcanvas2ID" src="./preview_sign.php?__dc=' +
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


 