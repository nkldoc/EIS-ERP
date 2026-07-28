/* global Ext */

Ext.onReady(function () {
    Ext.QuickTips.init();
    Ext.idRep = 'frm-Rep_Expense';
    //Spring Boot cross context
    Ext.urlReport = (true) ? '../../reports/Rep_Expense' : '../../reports/printr.php?get=true'; //DEBUG  
 //   Ext.urlReport = (true) ? 'http://localhost:8081/reports/reportSpEmp' : '../../reports/printr.php?get=true'; //DEBUG  
//    Ext.urlReport = (false) ? '../../reports/reportSpEmp' : '../../reports/printr.php?get=true'; //DEBUG 
    // Spring Boot
    Ext.titleReport = 'รายงานค่าใช้จ่าย';


    storeEnable = new Ext.data.JsonStore({
        fields: ["id", "c_name"],
        data: [
            {id: '0', c_name: "- เลือกทั้งหมด -"},
            {id: '1', c_name: "ใช้งาน"},
            {id: '2', c_name: "ไม่ใช้งาน"}
        ]
    });



    function getTitleReport(v) {
        Ext.getCmp('getReportTypeID').setValue(v);
        var i_txt = getStoreItems(storeEnable, Ext.getCmp("i_enabled").getValue(), 'c_name'); 
        Ext.getCmp('i_enableID').setValue(i_txt);
    }

    function frmWithOutAjax(value) {
        //set display title report
        getTitleReport(value);

        //set submit post report with ajax
        var frm = Ext.getCmp(Ext.idRep).getForm().el.dom;
        frm.setAttribute('target', Ext.idRep);
        frm.setAttribute('action', Ext.urlReport);
        frm.submit();
        frm.focus();
    }

    function setButtonReport() {

        var html = {
            text: 'แสดงรายงาน HTML',
            scale: 'small',
            id: 'rep-html',
            iconCls: 'icon-html',
            handler: function () {
                frmWithOutAjax('html');
            }
        };
        var pdfReport = {
            text: Ext.GLOBAL_BU_REPORT_TH,
            scale: 'small',
            iconCls: 'icon-pdf',
            handler: function () {
                frmWithOutAjax('pdf');
            }
        };
        var excelReport = {
            text: Ext.GLOBAL_BU_EXCEL_TH,
            scale: 'small',
            id: 'rep-excel',
            iconCls: 'icon-excel',
            handler: function () {
                frmWithOutAjax('excel');
            }
        };
        var exp2pdf = {
            text: 'Export Pdf',
            scale: 'small',
            id: 'rep-exp2pdf',
            iconCls: 'icon-export',
            handler: function () {
                frmWithOutAjax('exp2pdf');
            }
        };
        var exp2xlsx = {
            text: 'Export Xlsx',
            scale: 'small',
            id: 'rep-exp2xlsx',
            iconCls: '',
            handler: function () {
                frmWithOutAjax('exp2xlsx');
            }
        };
        var exp2html = {
            text: 'Export HTML',
            scale: 'small',
            id: 'rep-exp2html',
            iconCls: '',
            handler: function () {
                frmWithOutAjax('exp2html');
            }
        };

        return [html, pdfReport, excelReport, exp2pdf, exp2xlsx, exp2html];
    }

    var panelForm = new Ext.Panel({
        region: "center",
        title: Ext.titleReport,
        border: false,
        stripeRows: true,
        loadMask: true,
        items: [{
                xtype: "form",
                id: Ext.idRep,
                frame: true,
                labelAlign: "right",
                labelWidth: 200,
                bodyStyle: {padding: "10px 20px"},
                defaults: {anchor: "100%", msgTarget: "side", allowBlank: false},
                items: [{
                        xtype: "container",
                        layout: "hbox",
                        align: "stretch",
                        RemoveHeight: true,
                        defaults: {xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true},
                        items: [{
                                title: "รายงานค่าใช้จ่าย",
                                RemoveCls: "x-box-item",
                                defaults: {labelStyle: "width:200px;", allowBlank: true},
                                items: [
                                    {xtype: 'hidden', id: 'titleReportID', name: 'titleReport', value: Ext.titleReport},
                                    //{xtype: 'hidden', id: 'rptID', name: 'rpt', value: 5},
                                    {xtype: 'hidden', id: 'getReportTypeID', name: 'getReportType', value: "pdf"},
                                    {xtype: 'hidden', name: 'jasperName', value: "Rep_Expense"},
                                    {xtype: 'hidden', id: 'i_enableID', name: 'i_enable', value: "ทั้งหมด"},
                                    new Ext.form.ComboBox({
                                        id: "i_enabled",
                                        fieldLabel: "สถานะการใช้งาน",
                                        hiddenName: "i_enabled",
                                        width: 163,
                                        mode: "local",
                                        store: storeEnable,
                                        valueField: "id",
                                        displayField: "c_name",
                                        triggerAction: "all",
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        typeAhead: false,
                                        emptyText: "กรุณาเลือก...",
                                        value : "0"
                                    }),
//                                    new Ext.form.ComboBox({
//                                        xtype: "combobox",
//                                        id: "i_enableID",
//                                        fieldLabel: "สถานะ",
//                                        hiddenName: "i_enable",
//                                        store: Ext.storeStatus,
//                                        valueField: "id",
//                                        displayField: "c_name",
//                                        width: 200,
//                                        mode: "local",
//                                        triggerAction: "all",
//                                        typeAhead: false,
//                                        forceSelection: true,
//                                        selectOnFocus: true,
//                                        editable: false,
//                                        value: '1'
//                                    })
                                ]
                            }]
                    }],
                buttonAlign: "left",
                buttons: setButtonReport()
            }]
    });
    new Ext.Viewport({
        layout: 'border',
        items: panelForm
    });
});

