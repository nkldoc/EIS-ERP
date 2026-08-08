/* global Ext */
Ext.onReady(function () {
    Ext.QuickTips.init();
    Ext.idRep = "frm-repTor";
    //Spring Boot cross context
    Ext.urlReport = true ? "https://eis.nmu.ac.th:8443/reports/RepSpBgBilling" : "https://eis.nmu.ac.th:8443/reports/printr.php?get=true"; //DEBUG 
    // Spring Boot
    Ext.titleReport = "รายงานรอบการวางบิล";
    // storeYear
    var years = [];
    var currentTime = new Date();
    var now = currentTime.getFullYear() + 1;
    var yy_en = Ext.START_YEAR_ACC;
    years.push({id: "0", c_name: "- เลือกทั้งหมด -"});
    while (yy_en <= now) {
        years.push({id: yy_en, c_name: yy_en + 543});
        yy_en++;
    }
    Ext.store_year_all = new Ext.data.JsonStore({
        fields: ["id", "c_name"],
        data: years,
    });

    function getTitleReport(v) {

        Ext.getCmp("getReportTypeID").setValue(v);
    }

    function frmWithOutAjax(value) {
//set display title report
        getTitleReport(value);
        //set submit post report with ajax
        var frm = Ext.getCmp(Ext.idRep).getForm().el.dom;
        frm.setAttribute("target", Ext.idRep);
        frm.setAttribute("action", Ext.urlReport);
        frm.submit();
        frm.focus();
    }

    function setButtonReport() {
        var pdfReport = {
            text: Ext.GLOBAL_BU_REPORT_TH,
            scale: "small",
            iconCls: "icon-pdf",
            handler: function () {
                frmWithOutAjax("pdf");
            },
        };
        var excelReport = {
            text: Ext.GLOBAL_BU_EXCEL_TH,
            scale: "small",
            id: "rep-excel",
            iconCls: "icon-excel",
            handler: function () {
                frmWithOutAjax("excel");
            },
        };
//        var exp2pdf = {
//            text: "Export Pdf",
//            scale: "small",
//            id: "rep-exp2pdf",
//            iconCls: "icon-export",
//            handler: function () {
//                frmWithOutAjax("exp2pdf");
//            },
//        };
//        var exp2xlsx = {
//            text: "Export Xlsx",
//            scale: "small",
//            id: "rep-exp2xlsx",
//            iconCls: "icon-export",
//            handler: function () {
//                frmWithOutAjax("exp2xlsx");
//            },
//        };
        return [pdfReport, excelReport];
    }

    var panelForm = new Ext.Panel({
        region: "center",
        title: Ext.titleReport,
        border: false,
        stripeRows: true,
        loadMask: true,
        items: [
            {
                xtype: "form",
                id: Ext.idRep,
                frame: true,
                labelAlign: "right",
                labelWidth: 200,
                bodyStyle: {padding: "10px 20px"},
                defaults: {anchor: "100%", msgTarget: "side", allowBlank: false},
                items: [
                    {
                        xtype: "container",
                        layout: "hbox",
                        align: "stretch",
                        RemoveHeight: true,
                        defaults: {xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true},
                        items: [
                            {
                                title: "รายงานรอบการวางบิล",
                                RemoveCls: "x-box-item",
                                defaults: {labelStyle: "width:200px;", allowBlank: true},
                                items: [
                                    {xtype: "hidden", id: "titleReportID", name: "titleReport", value: Ext.titleReport},
                                    {xtype: "hidden", id: "rptID", name: "rpt", value: 5},
                                    {xtype: "hidden", id: "getReportTypeID", name: "getReportType", value: "pdf"},
                                    {xtype: "hidden", name: "jasperName", value: "RepSpTorPAuser"},
                                    new Ext.form.ComboBox({
                                        id: "i_yearID",
                                        fieldLabel: "ปีงบประมาณ",
                                        hiddenName: "i_year",
                                        store: Ext.store_year_all,
                                        valueField: "id",
                                        displayField: "c_name",
                                        mode: "local",
                                        triggerAction: "all",
                                        width: 150,
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        value: "0",
                                        listeners: {
                                            afterrender: function () {

                                                this.setValue(Ext.bg_year);
                                            }
                                        }
                                    }),
                                ],
                            },
                        ],
                    },
                ],
                buttonAlign: "left",
                buttons: setButtonReport()
            },
        ],
    });
    new Ext.Viewport({
        layout: "border",
        items: panelForm,
    });
});
