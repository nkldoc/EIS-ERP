/* global Ext */

Ext.onReady(function () {
    Ext.QuickTips.init();
    Ext.idRep = 'frm-repSpEmp';
    //Spring Boot cross context
    Ext.urlReport = (true) ? 'https://eis.nmu.ac.th:8443/reports/repITAo12' : 'https://eis.nmu.ac.th:8443/reports/printr.php?get=true'; //DEBUG  
    //
//    Ext.urlReport = (false) ? 'https://eis.nmu.ac.th:8443/reports/pro/repITAo12' : 'https://eis.nmu.ac.th:8443/reports/printr.php?get=true'; //DEBUG  

    // Spring Boot
    Ext.titleReport = 'รายงาน ITAo';
//
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
        var y543 = Ext.getCmp("i_yyyyID").getValue() > 0 ? 543 : 0;
        Ext.getCmp('getReportTypeID').setValue(v);
        Ext.getCmp('dis_departmentID').setValue(null);
        Ext.getCmp('dis_levelID').setValue(null);
        Ext.getCmp("dis_i_yyyyID").setValue(parseInt(Ext.getCmp("i_yyyyID").getValue()) + y543 > 0 ? parseInt(Ext.getCmp("i_yyyyID").getValue()) + y543 : "- เลือกทั้งหมด -");

//        Ext.getCmp('dis_enableID').setValue(getStoreItems(Ext.storeStatus, Ext.getCmp("i_enableID").getValue(), 'c_name'));
    }
    function batch_file_server() {
        try {

            // Code that might throw an error 

        } catch (error) {
            // Handle the error
        } finally {
            // Always executes
        }

    }
    function frmWithOutAjax(value) {
 
    var sy = ((Ext.getCmp('i_yyyyID').getValue()+0)-1)+'-09-30';
    var ey = Ext.getCmp('i_yyyyID').getValue()+'-09-30';
        Ext.getCmp('dd_date_startID').setValue(Ext.util.Format.date(sy, "Y-m-d"));
        Ext.getCmp('dd_date_endID').setValue(Ext.util.Format.date(ey, "Y-m-d"));
        // Ext.getCmp('dis_d_date_endID').setValue(Ext.util.Format.date(Ext.getCmp("d_date_endID").getValue(), "Y-m-d")); 
        Ext.getCmp("ITAoID").setValue(Ext.getCmp("ITAoID").getValue().inputValue );
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
    ;
    var store_year = new Ext.data.JsonStore({
        fields: ["id", "c_name"],
        data: years,
    });
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
                                title: "รายงาน ITAo",
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
                                    {xtype: 'hidden', id: 'dis_d_date_startID', name: 'dis_d_date_start', value: ""}, 
                                    {xtype: "hidden", id: "dis_ITAoID", name: "dis_ITAo", value: "PR ขอบเขตจัดซื้อ"},
                                    {xtype: "hidden", id: "dis_i_yyyyID", name: "dis_i_yyyy", value: "ทั้งหมด"},

                                    {xtype: 'hidden', id: 'dis_d_date_endID', name: 'dis_d_date_end', value: ""},  
                                    {xtype: 'hidden', id: 'dd_date_startID', name: 'dd_date_start', value: ""},
                                    {xtype: 'hidden', id: 'dd_date_endID', name: 'dd_date_end', value: ""},
                                    
                                    {xtype: 'hidden', id: 'i_levelID', name: 'i_level', value: 0},
                                    {xtype: 'hidden', id: 'dc_department_idID', name: 'dc_department_id', value: 0}, 
                                    { 
                                        xtype: "compositefield",
                                        fieldLabel: "ปีงบประมาณที่รับของ",
                                        msgTarget: "under",
                                        items: [new Ext.form.ComboBox({
                                        id: "i_yyyyID",
                                        fieldLabel: "รับของประจำปีงบประมาณ",
                                        width: 103,
                                        mode: "local",
                                        store: store_year,
                                        hiddenName: "i_yyyy",
                                        valueField: "id",
                                        displayField: "c_name", 
                                        triggerAction: "all",
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        typeAhead: false,
                                        emptyText: "กรุณาเลือก...",
                                        value: new Date().getFullYear(),
                                        listeners: {
                                            select: function () {
                                                /*var newValue =  Ext.getCmp('i_yyyyID').getValue() 
                                                if (newValue == "") {
                                                combo.reset();
                                                } else {
                                                Ext.getCmp('d_date_startID').setValue( "01-10-" + (newValue-1));
                                                Ext.getCmp('d_date_endID').setValue( "30-09-" + (newValue));
                                                Ext.getCmp('dis_d_date_startID').setValue( "30-09-" + (newValue));
                                                Ext.getCmp('dis_d_date_endID').setValue( "30-09-" + (newValue));
                                                if (newValue.id == Ext.bgYear) {
                                                    Ext.getCmp("d_date_startID").setValue(addY(543));
                                                    Ext.getCmp("d_date_endID").setValue(addY(543));
                                                    } else {
                                                        Ext.getCmp("d_date_startID").setValue("30-09" + newValue.id);
                                                        Ext.getCmp("d_date_endID").setValue("30-09" + newValue.id);
                                                    }
                                                }*/
                                            },
                                            beforequery: function (q) {
                                                if (q.query) {
                                                var length = q.query.length;
                                                q.query = new RegExp(Ext.escapeRe(q.query));
                                                q.query.length = length;
                                                }
                                            },
                                            blur: function () {
                                                this.getStore().clearFilter();
                                            },
                                            },
                                        }),
                                        ], listeners: {
                                            beforerender: function () { //this.fn = function () { };
                                            },
                                            afterrender: function () { 
                                            },
                                            Change: function () {  //this.fn1();
                                            },
                                            blur: function () { //this.fn1();
                                            },
                                        },
                                    },
                                    {
                                        xtype: "radiogroup",
                                        fieldLabel: "แสดงรายการ",
                                        anchor: "100%",
                                        id: "ITAoID", 
                                        name: "ITAo", 
                                        msgTarget: "under",
                                        columns: [80,80],
                                        items: [
                                            {
                                                name: "ITAo",
                                                inputValue: 1,
                                                checked: true,
                                                boxLabel: "ITAo12",
                                            },
                                            {
                                                inputValue: 2,
                                                name: "ITAo",
                                                boxLabel: "ITAo13",
                                            },
                                        ],
                                    },
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

