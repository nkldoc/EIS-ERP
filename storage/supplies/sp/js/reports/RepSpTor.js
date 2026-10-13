/* global Ext  dfasdf*/

Ext.onReady(function () {
        Ext.QuickTips.init();
        Ext.idRep = 'frm-report';
        //Spring Boot cross context
    Ext.urlReport = (1) ? 'https://eis.nmu.ac.th:8443/reports/reportTor' : 'https://eis.nmu.ac.th:8443/reports/printr.php?get=true'; //DEBUG 
        // Spring Boot
        Ext.titleReport = 'รายงานพนักงานพัสดุและสายงาน';

        dc_department = new Ext.data.JsonStore({
                fields: ["id", "c_name"],
                data: [
                        { id: '', c_name: "- เลือกทั้งหมด -" },
                        { id: '1', c_name: "หัวหน้าฝ่าย" },
                        { id: '2', c_name: "จัดหา 1" },
                        { id: '3', c_name: "จัดหา 2" },
                        { id: '8', c_name: "จัดหา 3" },
                        { id: '4', c_name: "เบิกจ่าย" },
                        { id: '5', c_name: "ธุรการ" },
                        { id: '6', c_name: "ทรัพย์สิน" },
                        { id: '7', c_name: "คลังพัสดุ" }
                ]
        });

        var storeStatus = new Ext.data.JsonStore({
                fields: ['id', 'c_name'],
                data: [
                        { id: '', c_name: '- เลือกทั้งหมด -' },
                        { id: '' + Ext.CONF_STATUS_ENABLE, c_name: 'ใช้งาน' },
                        { id: '' + Ext.CONF_STATUS_DISABLE, c_name: 'ไม่ใช้งาน' }
                ]
        });

        i_level = new Ext.data.JsonStore({
                fields: ["id", "c_name"],
                data: [
                        { id: '', c_name: "- เลือกทั้งหมด -" },
                        { id: '1', c_name: "หัวหน้าฝ่าย" },
                        { id: '2', c_name: "หัวหน้าสายงาน" },
                        { id: '3', c_name: "ผู้ปฏิบัติงาน" }
                ]
        });

   function displayTitleReport(v) {


                Ext.getCmp('getReportTypeID').setValue(v);

                Ext.getCmp('dis_department').setValue(getStoreItems(dc_department, Ext.getCmp("dc_department_id").getValue(), 'c_name'));
                Ext.getCmp('dis_level').setValue(getStoreItems(i_level, Ext.getCmp("i_level").getValue(), 'c_name'));
                Ext.getCmp('dis_enable').setValue(getStoreItems(storeStatus, Ext.getCmp("i_enable").getValue(), 'c_name'));
    }

        function frmWithOutAjax(value) {
                //set display title report
                displayTitleReport(value);
                //set submit post report with ajax
                var frm = Ext.getCmp(Ext.idRep).getForm().el.dom;
                frm.setAttribute('target', "report3");
                frm.setAttribute('action', Ext.urlReport);
                frm.submit();
                frm.focus();
        }

        function setButtonReport() {

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
                        iconCls: 'icon-export',
                        handler: function () {
                                frmWithOutAjax('exp2xlsx');
                        }
                };
        return [pdfReport, excelReport/*, exp2pdf, exp2xlsx*/];
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
                        bodyStyle: { padding: "10px 20px" },
                        defaults: { anchor: "100%", msgTarget: "side", allowBlank: false },
                        items: [{
                                xtype: "container",
                                layout: "hbox",
                                align: "stretch",
                                RemoveHeight: true,
                                defaults: { xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true },
                                items: [{
                                        title: "รายงานพนักงานพัสดุและสายงาน",
                                        RemoveCls: "x-box-item",
                                        defaults: { labelStyle: "width:200px;", allowBlank: true },
                                        items: [
                                                { xtype: 'hidden', id: 'titleReportID', name: 'titleReport', value: Ext.titleReport },
                                                { xtype: 'hidden', id: 'rptID', name: 'rpt', value: 5 },
                                                { xtype: 'hidden', id: 'getReportTypeID', name: 'getReportType', value: "pdf" },
                                                { xtype: 'hidden', name: 'jasperName', value: "report2" },
                                                { xtype: 'hidden', id: 'dis_department', name: 'dis_department', value: "dc_department_id" },
                                                { xtype: 'hidden', id: 'dis_level', name: 'dis_level', value: "i_level" },
                                                { xtype: 'hidden', id: 'dis_enable', name: 'dis_enable', value: "i_enable" },
                                                new Ext.form.ComboBox({
                                                        id: "dc_department_id",
                                                        fieldLabel: "สายงาน",
                                        hiddenName: "dc_department_id",
                                                        store: dc_department,
                                                        valueField: "id",
                                                        displayField: "c_name",
                                                        mode: "local",
                                                        triggerAction: "all",
                                                        width: 300,
                                                        forceSelection: true,
                                                        selectOnFocus: true,
                                                        value: ''

                                                }),
                                                new Ext.form.ComboBox({
                                                        id: "i_level",
                                                        fieldLabel: "ระดับการทำงาน",
                                                        hiddenName: "i_level",
                                                        store: i_level,
                                                        valueField: "id",
                                                        displayField: "c_name",
                                                        mode: "local",
                                                        triggerAction: "all",
                                                        width: 300,
                                                        forceSelection: true,
                                                        selectOnFocus: true,
                                                        value: ''

                                                }),
                                                new Ext.form.ComboBox({
                                                        xtype: "combobox",
                                                        id: "i_enable",
                                                        fieldLabel: "สถานะ",
                                                        hiddenName: "i_enable",
                                                        store: storeStatus,
                                                        valueField: "id",
                                                        displayField: "c_name",
                                                        width: 200,
                                                        mode: "local",
                                                        triggerAction: "all",
                                                        typeAhead: false,
                                                        forceSelection: true,
                                                        selectOnFocus: true,
                                                        editable: false,
                                                        value: '1'
                                                })
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

