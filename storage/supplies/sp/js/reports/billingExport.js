/* global Ext */

Ext.onReady(function () {
    Ext.QuickTips.init();
    Ext.idRep = 'frm-RepHoliday';
    //Spring Boot cross context
    Ext.urlReport = (true) ? 'https://eis.nmu.ac.th:8443/reports/billing/exportExcel' : 'https://eis.nmu.ac.th:8443/reports/printr.php?get=true'; //DEBUG  
 //   Ext.urlReport = (true) ? 'https://eis.nmu.ac.th:8443/reports/reportSpEmp' : 'https://eis.nmu.ac.th:8443/reports/printr.php?get=true'; //DEBUG  
//    Ext.urlReport = (false) ? 'https://eis.nmu.ac.th:8443/reports/reportSpEmp' : 'https://eis.nmu.ac.th:8443/reports/printr.php?get=true'; //DEBUG 
    // Spring Boot
    Ext.titleReport = 'เรียกข้อมูลตรวจรับวางบิล ซื้อจ้าง';
// storeYear
  var years = [];
  var currentTime = new Date();
  var now = currentTime.getFullYear() + 1;
  var yy_en = Ext.START_YEAR_ACC;
  while (yy_en <= now) {
    years.push({ id: yy_en, i_year: yy_en + 543 });
    yy_en++;
  }

  store_year = new Ext.data.JsonStore({
    fields: ["id", "i_year"],
    data: years,
  });
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
        Ext.getCmp('i_year').setValue(getStoreItems(Ext.storeDepartment, Ext.getCmp("i_year").getValue(), 'i_year'));
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
        frm.setAttribute('method', 'POST');
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

        return [html/*, pdfReport, excelReport, exp2pdf, exp2xlsx, exp2html*/];
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
                                title: "ประมวลผลแล้วสร้าง Excel ข้อมูลตรวจรับวางบิล ซื้อจ้าง",
                                RemoveCls: "x-box-item",
                                defaults: {labelStyle: "width:200px;", allowBlank: true},
                                items: [
                                    {xtype: 'hidden', id: 'titleReportID', name: 'titleReport', value: Ext.titleReport}, 
                                    {xtype: 'hidden', id: 'getReportTypeID', name: 'getReportType', value: "pdf"},
                                    {xtype: 'hidden', name: 'jasperName', value: "Rep_holiday"},
                                    {xtype: 'hidden', id: 'i_year', name: 'i_year', value: "ทั้งหมด"},
//                                    new Ext.form.ComboBox({
//                                        id: "i_year",
//                                        fieldLabel: "ประจำปี",
//                                        hiddenName: "i_year",
//                                        width: 163,
//                                        mode: "local",
//                                        store: store_year,
//                                        valueField: "id",
//                                        displayField: "i_year",
//                                        triggerAction: "all",
//                                        forceSelection: true,
//                                        selectOnFocus: true,
//                                        typeAhead: false,
//                                        emptyText: "กรุณาเลือก...",
//                                        listeners : {
//                                            afterrender: function(){
//                                                this.setValue(Ext.bg_year);
//                                                //console.log(this);
//                                    },
//                                        }
//                                    }), 
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

