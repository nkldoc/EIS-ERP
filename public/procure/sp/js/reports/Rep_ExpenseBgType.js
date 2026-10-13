/* global Ext */

Ext.onReady(function () {
    Ext.QuickTips.init();
    Ext.idRep = 'frm-Rep_ExpenseBgType';
    //Spring Boot cross context
    Ext.urlReport = (true) ? 'https://eis.nmu.ac.th:8443/reports/Rep_ExpenseBgType' : 'https://eis.nmu.ac.th:8443/reports/printr.php?get=true'; //DEBUG  
 //   Ext.urlReport = (true) ? 'https://eis.nmu.ac.th:8443/reports/reportSpEmp' : 'https://eis.nmu.ac.th:8443/reports/printr.php?get=true'; //DEBUG  
//    Ext.urlReport = (false) ? 'https://eis.nmu.ac.th:8443/reports/reportSpEmp' : 'https://eis.nmu.ac.th:8443/reports/printr.php?get=true'; //DEBUG 
    // Spring Boot
    Ext.titleReport = 'รายงานแหล่งเงิน';

    storeType = new Ext.data.JsonStore({
        fields: ['id', 'i_type'],
        data: [
            {id: "2", i_type: '- เลือกทั้งหมด -'},
            {id: '0', i_type: 'เงินรายได้'},
            {id: '1', i_type: 'เงินอุดหนุน'}
            
        ]
    });



    function getTitleReport(v) {
        Ext.getCmp('getReportTypeID').setValue(v);
        Ext.getCmp('i_type').setValue(getStoreItems(storeType, Ext.getCmp("i_type").getValue(), 'i_type'));
        //Ext.getCmp('dis_levelID').setValue(getStoreItems(Ext.storeLevel, Ext.getCmp("i_levelID").getValue(), 'c_name'));
//        Ext.getCmp('dis_enableID').setValue(getStoreItems(Ext.storeStatus, Ext.getCmp("i_enableID").getValue(), 'c_name'));
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
                                title: "รายงานแหล่งเงิน",
                                RemoveCls: "x-box-item",
                                defaults: {labelStyle: "width:200px;", allowBlank: true},
                                items: [
                                    {xtype: 'hidden', id: 'titleReportID', name: 'titleReport', value: Ext.titleReport},
                                    //{xtype: 'hidden', id: 'rptID', name: 'rpt', value: 5},
                                    {xtype: 'hidden', id: 'getReportTypeID', name: 'getReportType', value: "pdf"},
                                    {xtype: 'hidden', name: 'jasperName', value: "Rep_ExpenseBgType"},
                                    {xtype: 'hidden', id: 'i_type', name: 'i_type', value: "id"},
                                    new Ext.form.ComboBox({
                                        id: "i_type",
                                        fieldLabel: "ประเภทแหล่งเงิน",
                                        hiddenName: "i_type",
                                        width: 163,
                                        mode: "local",
                                        store: storeType,
                                        valueField: "id",
                                        displayField: "i_type",
                                        triggerAction: "all",
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        typeAhead: false,
                                        emptyText: "กรุณาเลือก...",
                                        value : "2",
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

