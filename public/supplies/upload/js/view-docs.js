function activeTabPreviewPDF(n) {
    var tabPanel = window.parent.Ext.getCmp('tabMainID');
    tabPanel.setActiveTab(n);
}
function addTabPreviewPDFOutPut() {
    const pr = window.parent.document.getElementById("foldernameID")?.value?.trim();
    const file = window.parent.document.getElementById("filenameID")?.value?.trim();
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

    contenterCenter.setActiveTab(newTab);
}
addTabPreviewPDFOutPut();
 