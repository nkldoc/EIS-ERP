/* global Ext */

Ext.onReady(function () {
    Ext.QuickTips.init();
    Ext.idRep = 'frm-repSpEmp';
    //Spring Boot cross context
    Ext.urlReport = (true) ? '../../reports/reportSpEmp' : '../../reports/printr.php?get=true'; //DEBUG  
 //   Ext.urlReport = (true) ? 'http://localhost:8081/reports/reportSpEmp' : '../../reports/printr.php?get=true'; //DEBUG  
//    Ext.urlReport = (false) ? '../../reports/reportSpEmp' : '../../reports/printr.php?get=true'; //DEBUG 
    // Spring Boot
    Ext.titleReport = 'รายงานพนักงานพัสดุและสายงาน';

    Ext.storeDepartment = new Ext.data.JsonStore({
        fields: ["id", "c_name"],
        data: [
            {id: '0', c_name: "- เลือกทั้งหมด -"},
            {id: '1', c_name: "หัวหน้าฝ่าย"},
            {id: '2', c_name: "จัดหา 1"},
            {id: '3', c_name: "จัดหา 2"},
            {id: '8', c_name: "จัดหา 3"},
            {id: '4', c_name: "เบิกจ่าย"},
            {id: '5', c_name: "ธุรการ"},
            {id: '6', c_name: "ทรัพย์สิน"},
            {id: '7', c_name: "คลังพัสดุ"}
        ]
    });
    Ext.storeLevel = new Ext.data.JsonStore({
        fields: ["id", "c_name"],
        data: [
            {id: '0', c_name: "- เลือกทั้งหมด -"},
            {id: '1', c_name: "หัวหน้าฝ่าย"},
            {id: '2', c_name: "หัวหน้าสายงาน"},
            {id: '3', c_name: "ผู้ปฏิบัติงาน"}
        ]
    });
    Ext.storeStatus = new Ext.data.JsonStore({
        fields: ['id', 'c_name'],
        data: [
            {id: '0', c_name: '- เลือกทั้งหมด -'},
            {id: '' + Ext.CONF_STATUS_ENABLE, c_name: 'ใช้งาน'},
            {id: '' + Ext.CONF_STATUS_DISABLE, c_name: 'ไม่ใช้งาน'}
        ]
    });



    function getTitleReport(v) {
        Ext.getCmp('getReportTypeID').setValue(v);
        Ext.getCmp('dis_departmentID').setValue(getStoreItems(Ext.storeDepartment, Ext.getCmp("dc_department_idID").getValue(), 'c_name'));
        Ext.getCmp('dis_levelID').setValue(getStoreItems(Ext.storeLevel, Ext.getCmp("i_levelID").getValue(), 'c_name'));
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
                                title: "รายงานพนักงานพัสดุและสายงาน",
                                RemoveCls: "x-box-item",
                                defaults: {labelStyle: "width:200px;", allowBlank: true},
                                items: [
                                    {xtype: 'hidden', id: 'titleReportID', name: 'titleReport', value: Ext.titleReport},
                                    {xtype: 'hidden', id: 'rptID', name: 'rpt', value: 5},
                                    {xtype: 'hidden', id: 'getReportTypeID', name: 'getReportType', value: "pdf"},
                                    {xtype: 'hidden', name: 'jasperName', value: "RepSpEmp"},
                                    {xtype: 'hidden', id: 'dis_departmentID', name: 'dis_department', value: "ทั้งหมด"},
                                    {xtype: 'hidden', id: 'dis_levelID', name: 'dis_level', value: "ทั้งหมด"},
                                    {xtype: 'hidden', id: 'dis_enableID', name: 'dis_enable', value: "ทั้งหมด"},
                                    new Ext.form.ComboBox({
                                        id: "dc_department_idID",
                                        fieldLabel: "สายงาน",
                                        hiddenName: "dc_department_id",
                                        store: Ext.storeDepartment,
                                        valueField: "id",
                                        displayField: "c_name",
                                        mode: "local",
                                        triggerAction: "all",
                                        width: 300,
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        value: '0'

                                    }),
                                    new Ext.form.ComboBox({
                                        id: "i_levelID",
                                        fieldLabel: "ระดับการทำงาน",
                                        hiddenName: "i_level",
                                        store: Ext.storeLevel,
                                        valueField: "id",
                                        displayField: "c_name",
                                        mode: "local",
                                        triggerAction: "all",
                                        width: 300,
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        value: '0'

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

